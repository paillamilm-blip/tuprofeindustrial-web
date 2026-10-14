import { cn } from "@/lib/utils";
import {
  buildWhatsAppUrl,
  DEFAULT_WHATSAPP_MESSAGE,
  warnIfPlaceholderPhone,
} from "@/lib/whatsapp";

/** Icono de WhatsApp (SVG inline para no depender de un set externo). */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      role="img"
      aria-hidden="true"
      focusable="false"
      className={className}
      fill="currentColor"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export interface WhatsAppCtaProps {
  /** Mensaje precargado en el chat. Por defecto, el mensaje generico. */
  message?: string;
  /** Texto del boton. */
  label?: string;
  /** Etiqueta accesible (aria-label). */
  ariaLabel?: string;
  /** Si es true, el boton se fija en la parte inferior en mobile. */
  sticky?: boolean;
  className?: string;
}

/**
 * Boton CTA de WhatsApp, con estilo verde oficial y buena accesibilidad.
 * En variante sticky queda fijo abajo en mobile para maximizar conversion.
 */
export function WhatsAppCta({
  message = DEFAULT_WHATSAPP_MESSAGE,
  label = "Hablar por WhatsApp",
  ariaLabel = "Abrir conversacion de WhatsApp con Tu Profe Industrial",
  sticky = false,
  className,
}: WhatsAppCtaProps) {
  // Aviso en desarrollo si falta configurar el numero real de WhatsApp.
  warnIfPlaceholderPhone();

  const href = buildWhatsAppUrl(message);

  const button = (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-base font-semibold text-white shadow-lg transition-all hover:bg-[#1ebe5d] hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#128C7E] active:scale-[0.98]",
        className
      )}
    >
      <WhatsAppIcon className="size-5 shrink-0" />
      <span>{label}</span>
    </a>
  );

  if (!sticky) {
    return button;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center p-4 md:hidden">
      <div className="pointer-events-auto w-full max-w-md">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={ariaLabel}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-base font-semibold text-white shadow-2xl transition-all hover:bg-[#1ebe5d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#128C7E] active:scale-[0.99]"
        >
          <WhatsAppIcon className="size-5 shrink-0" />
          <span>{label}</span>
        </a>
      </div>
    </div>
  );
}
