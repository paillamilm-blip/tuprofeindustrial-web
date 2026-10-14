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
export const WHATSAPP_PHONE: string =
  process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? "56900000000"; // REEMPLAZAR con el numero real

/** Mensaje por defecto (en espanol) que se precarga en el chat de WhatsApp. */
export const DEFAULT_WHATSAPP_MESSAGE =
  "Hola! Vengo de la web de Tu Profe Industrial y quiero mas informacion sobre las clases.";

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
