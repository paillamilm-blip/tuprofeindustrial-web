/**
 * Logica pura del formulario de captura del Simulacro M1.
 *
 * Valida los datos del alumno y arma el payload para darlo de alta en la lista
 * de correo (MailerLite API v3). El PDF se regala: el formulario no desbloquea
 * un pago, solo construye la lista a la que se le escribe despues del simulacro.
 *
 * Funciones puras, sin React ni DOM, para poder testearlas de forma aislada.
 */

/** Ruta publica del PDF del simulacro, servida desde public/. */
export const SIMULACRO_PDF_PATH = "/simulacro-paes-m1.pdf";

/** Largo minimo del nombre para que el saludo del correo no quede vacio. */
export const NAME_MIN_LENGTH = 2;

/** Datos que envia el alumno desde el formulario. */
export interface LeadInput {
  name: string;
  email: string;
  /** Casilla de consentimiento (Ley 21.719): sin esto no hay alta. */
  consent: boolean;
  /** Campo trampapolilla (honeypot): debe llegar vacio. */
  website?: string;
}

/** Errores de validacion por campo, en espanol visible para el alumno. */
export interface LeadErrors {
  name?: string;
  email?: string;
  consent?: string;
}

/**
 * Acepta correos con forma local@dominio.tld. No intenta validar el dominio por
 * red: el alta real la confirma MailerLite, y aca solo queremos filtrar typos.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

/** Normaliza el correo: sin espacios y en minusculas (asi lo busca MailerLite). */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Devuelve los errores del formulario. Un objeto vacio significa que la entrada
 * es valida.
 */
export function validateLeadInput(input: LeadInput): LeadErrors {
  const errors: LeadErrors = {};

  const name = input.name.trim();
  const email = normalizeEmail(input.email);

  if (name.length < NAME_MIN_LENGTH) {
    errors.name = "Escribe tu nombre para poder saludarte y mandarte el simulacro.";
  }

  if (email === "") {
    errors.email = "Escribe tu correo para poder enviarte el simulacro.";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Ese correo no parece válido. Revisa que tenga la forma nombre@dominio.com.";
  }

  if (!input.consent) {
    errors.consent =
      "Debes aceptar que usemos tu correo para enviarte el simulacro y material de preparación PAES.";
  }

  return errors;
}

/** true si hay al menos un error de validacion. */
export function hasLeadErrors(errors: LeadErrors): boolean {
  return (
    errors.name !== undefined ||
    errors.email !== undefined ||
    errors.consent !== undefined
  );
}

/**
 * true si el honeypot viene lleno. Un humano no ve ese campo, asi que cualquier
 * valor es bot: se responde ok sin tocar la lista, para no inflar el padrón.
 */
export function looksLikeBot(input: LeadInput): boolean {
  return (input.website ?? "").trim() !== "";
}

/** Payload que entiende MailerLite API v3 para dar de alta a un subscriptor. */
export interface MailerLitePayload {
  email: string;
  fields: { name: string; last_name?: string };
  groups?: string[];
}

/**
 * Arma el alta en MailerLite. El nombre completo se parte en name/last_name
 * porque son los dos campos por defecto de la plataforma.
 *
 * @param input    Datos ya validados del formulario.
 * @param groupId  Grupo de MailerLite. Si se omite usa MAILERLITE_GROUP_ID; si
 *                 tampoco hay valor, el contacto entra a la lista sin grupo.
 */
export function buildMailerLitePayload(
  input: LeadInput,
  groupId: string | undefined = process.env.MAILERLITE_GROUP_ID
): MailerLitePayload {
  const [first, ...rest] = input.name.trim().split(/\s+/);

  const fields: MailerLitePayload["fields"] = { name: first };
  if (rest.length > 0) fields.last_name = rest.join(" ");

  const payload: MailerLitePayload = {
    email: normalizeEmail(input.email),
    fields,
  };

  if (groupId) payload.groups = [groupId];

  return payload;
}

/** Indica si hay token de MailerLite configurado (solo en el servidor). */
export function isMailerLiteConfigured(
  token: string | undefined = process.env.MAILERLITE_API_TOKEN
): boolean {
  return Boolean(token && token.trim() !== "");
}

/**
 * Traduce un fallo de la API a un mensaje honesto para el alumno.
 *
 * Nunca se finge un alta: si el registro no ocurrio, el alumno igual descarga
 * el simulacro y sabe que no quedó en la lista.
 */
export function leadFailureMessage(status: number): string {
  if (status === 401) {
    return (
      "El correo no quedó registrado en nuestra lista (falta configurar la " +
      "cuenta de correo). Puedes descargar el simulacro igual."
    );
  }
  if (status === 422) {
    return "El correo no fue aceptado. Revísalo e inténtalo otra vez.";
  }
  if (status === 429) {
    return (
      "Hay muchos intentos ahora mismo. Espera un minuto y vuelve a enviarlo."
    );
  }
  return (
    "No pudimos completar el registro en este momento. Descarga el simulacro " +
    "y, si quieres, pídelo también por WhatsApp."
  );
}

/**
 * Como terminó el intento de alta, para redactar el mensaje de WhatsApp.
 * "registrado" es el camino feliz; los otros dos son fallos honestos.
 */
export type LeadOutcome = "registrado" | "no-configurado" | "fallo-proveedor";

/**
 * Mensaje de WhatsApp para cerrar la corrección de la tabla de errores, que es
 * donde está el ingreso real. El texto cambia según cómo terminó el alta, para
 * que el alumno nunca escriba algo que no pasó.
 */
export function buildLeadWhatsAppMessage(
  name: string,
  outcome: LeadOutcome = "fallo-proveedor"
): string {
  const saludo = name.trim() === "" ? "" : `Soy ${name.trim()}. `;

  if (outcome === "registrado") {
    return (
      `Hola! ${saludo}Descargué el simulacro M1 de tu web y quiero que me ` +
      "revises los errores."
    );
  }

  const motivo =
    outcome === "no-configurado"
      ? "El formulario de la web todavía no está conectado a mi lista de correo."
      : "El formulario no alcanzó a registrar mi correo.";
  return (
    `Hola! ${saludo}${motivo} Quiero el simulacro M1 gratis y avisarme cuando ` +
    "salgan más materiales PAES."
  );
}
