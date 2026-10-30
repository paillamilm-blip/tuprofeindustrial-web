"use server";

import {
  buildMailerLitePayload,
  hasLeadErrors,
  isMailerLiteConfigured,
  leadFailureMessage,
  looksLikeBot,
  normalizeEmail,
  validateLeadInput,
  type LeadErrors,
} from "@/lib/lead";

/** Endpoint de alta en MailerLite API v3 (crea o actualiza por correo). */
const MAILERLITE_SUBSCRIBERS_URL =
  "https://connect.mailerlite.com/api/subscribers";

/**
 * Tope de espera del fetch. Sin el, un MailerLite colgado dejaría el botón del
 * alumno girando para siempre; con el, a los 8 s cae en el panel de descarga.
 */
const REQUEST_TIMEOUT_MS = 8000;

/** Estado del formulario: controla qué bloque se muestra en la sección. */
export type LeadState =
  | { status: "idle" }
  | { status: "error"; errors: LeadErrors }
  | { status: "ok"; email: string }
  | {
      status: "solo-descarga";
      email: string;
      reason: "no-configurado" | "fallo-proveedor";
      message: string;
    };

/**
 * Da de alta al alumno en la lista de correo y le libera la descarga del
 * simulacro M1.
 *
 * Regla de oro: el estado "ok" solo se devuelve si MailerLite confirmó el alta.
 * Si falta el token o la llamada falla, se responde "solo-descarga" con la
 * explicación, para no prometer un correo que nunca va a llegar.
 */
export async function suscribirSimulacro(
  _prev: LeadState,
  formData: FormData
): Promise<LeadState> {
  const name = String(formData.get("name") ?? "");
  const email = String(formData.get("email") ?? "");
  const website = String(formData.get("website") ?? "");
  const consent = formData.get("consent") === "on";
  const input = { name, email, consent, website };

  // Bot que llenó el campo trampapolilla: se le responde ok sin tocar la lista.
  if (looksLikeBot(input)) {
    return { status: "ok", email: normalizeEmail(email) };
  }

  const errors = validateLeadInput(input);
  if (hasLeadErrors(errors)) {
    return { status: "error", errors };
  }

  const normalizedEmail = normalizeEmail(email);
  const token = process.env.MAILERLITE_API_TOKEN;

  if (!isMailerLiteConfigured(token)) {
    return {
      status: "solo-descarga",
      email: normalizedEmail,
      reason: "no-configurado",
      message:
        "La lista de correo aún no está conectada. Descarga el simulacro igual " +
        "y escríbeme por WhatsApp para avisarte cuando salgan más materiales.",
    };
  }

  try {
    const response = await fetch(MAILERLITE_SUBSCRIBERS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(buildMailerLitePayload(input)),
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (response.ok) {
      return { status: "ok", email: normalizedEmail };
    }

    // Solo el código: nunca el correo ni el nombre del alumno en los logs.
    console.error("[lead] MailerLite respondió", response.status);
    return {
      status: "solo-descarga",
      email: normalizedEmail,
      reason: "fallo-proveedor",
      message: leadFailureMessage(response.status),
    };
  } catch {
    console.error("[lead] fallo de red al contactar MailerLite");
    return {
      status: "solo-descarga",
      email: normalizedEmail,
      reason: "fallo-proveedor",
      message: leadFailureMessage(500),
    };
  }
}
