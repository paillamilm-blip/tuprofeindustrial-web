import { Reveal } from "@/components/sections/reveal";
import { WhatsAppCta } from "@/components/whatsapp-cta";

const CLOSING_MESSAGE =
  "Hola! Quiero empezar clases con Tu Profe Industrial. ¿Qué horarios tienes disponibles?";

/**
 * ClosingCta — sección de conversión final. Fondo primario (teal) para cerrar
 * con fuerza y contraste frente al cuerpo claro, con el "spark" de acento.
 */
export function ClosingCta() {
  return (
    <section className="relative overflow-hidden bg-primary px-4 py-20 text-primary-foreground sm:px-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 size-72 rounded-full bg-accent/20 blur-3xl"
      />
      <Reveal className="relative mx-auto flex max-w-2xl flex-col items-center gap-5 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          Da el primer paso para subir tus notas
        </h2>
        <p className="max-w-lg text-primary-foreground/90 text-pretty">
          Escríbeme por WhatsApp, cuéntame en qué ramo necesitas ayuda y armamos
          juntos un plan a tu medida. La primera coordinación es sin costo.
        </p>
        <WhatsAppCta
          message={CLOSING_MESSAGE}
          label="Hablar con el profe ahora"
          className="px-7 py-3.5 text-base"
        />
      </Reveal>
    </section>
  );
}
