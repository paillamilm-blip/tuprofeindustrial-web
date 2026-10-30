/**
 * Constructor de enlaces de WhatsApp (wa.me) para cerrar alumnos por chat.
 *
 * El numero se lee desde la variable de entorno NEXT_PUBLIC_WHATSAPP_PHONE.
 * Si no esta definida, se usa un numero PLACEHOLDER para que la app no se
 * rompa en desarrollo. En produccion DEBES definir la variable de entorno.
 */

/**
 * Numero de WhatsApp en formato internacional, sin el signo "+" y sin espacios.
 * Ejemplo Chile: 56912345678 (56 = codigo pais, 9 + numero movil).
 *
 * REEMPLAZAR con el numero real: define NEXT_PUBLIC_WHATSAPP_PHONE en tu
 * archivo .env.local (o en las variables de entorno de Vercel). El valor de
 * abajo es solo un PLACEHOLDER de respaldo.
 */
/** Numero PLACEHOLDER de respaldo. NO es un numero real. */
export const PLACEHOLDER_PHONE = "56900000000";

export const WHATSAPP_PHONE: string =
  process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? PLACEHOLDER_PHONE; // REEMPLAZAR con el numero real

/** Mensaje por defecto (en espanol) que se precarga en el chat de WhatsApp. */
export const DEFAULT_WHATSAPP_MESSAGE =
  "Hola! Vengo de la web de TuProfeIndustrial y quiero más información sobre las clases.";

/**
 * Indica si un numero (ya sea crudo o saneado) corresponde al PLACEHOLDER de
 * respaldo. Util para avisar que falta configurar NEXT_PUBLIC_WHATSAPP_PHONE.
 */
export function isPlaceholderPhone(phone: string = WHATSAPP_PHONE): boolean {
  return phone.replace(/[^\d]/g, "") === PLACEHOLDER_PHONE;
}

let warnedPlaceholder = false;

/**
 * Emite una unica advertencia en consola (solo fuera de produccion) cuando se
 * esta usando el numero PLACEHOLDER porque falta la variable de entorno. Es un
 * seguro barato: el CTA de WhatsApp es el unico mecanismo de conversion del
 * producto, asi que conviene gritar en desarrollo antes de desplegar con el
 * numero equivocado. No hace nada en produccion para no ensuciar la consola
 * del alumno.
 */
export function warnIfPlaceholderPhone(): void {
  if (warnedPlaceholder) return;
  if (process.env.NODE_ENV === "production") return;
  if (!isPlaceholderPhone()) return;

  warnedPlaceholder = true;
  console.warn(
    "[tuprofeindustrial-web] NEXT_PUBLIC_WHATSAPP_PHONE no esta definido: " +
      `se esta usando el numero PLACEHOLDER (${PLACEHOLDER_PHONE}). ` +
      "Los enlaces de WhatsApp apuntaran a un numero inexistente. " +
      "Define la variable en .env.local o en Vercel antes de publicar."
  );
}

/**
 * Construye un enlace https://wa.me/<telefono>?text=<mensaje> con el mensaje
 * codificado para URL.
 *
 * @param message Mensaje a precargar. Si se omite, usa el mensaje por defecto.
 * @param phone Numero a usar. Si se omite, usa WHATSAPP_PHONE.
 */
export function buildWhatsAppUrl(
  message: string = DEFAULT_WHATSAPP_MESSAGE,
  phone: string = WHATSAPP_PHONE
): string {
  const sanitizedPhone = phone.replace(/[^\d]/g, "");
  const text = encodeURIComponent(message);
  return `https://wa.me/${sanitizedPhone}?text=${text}`;
}
