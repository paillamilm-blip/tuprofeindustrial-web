import { Diagnostico } from "@/components/diagnostico";
import { Reveal } from "@/components/sections/reveal";

/**
 * DiagnosticoSection — presenta el Diagnostico interactivo PAES / Ingenieria.
 * Es la herramienta estrella: en pocos pasos entrega un plan recomendado y
 * abre la conversacion por WhatsApp con el contexto ya cargado.
 */
export function DiagnosticoSection() {
  return (
    <section
      id="diagnostico"
      className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <Reveal className="text-center">
          <p className="font-mono text-xs tracking-widest text-primary uppercase">
            Diagnostico en 1 minuto
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            ¿Que plan necesitas?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground text-pretty">
            Responde cinco preguntas y un Ingeniero y Docente Innovador te
            recomienda el camino: clases personalizadas, Intensivo PAES o
            nivelación para Ingeniería, a domicilio en Santiago u online.
          </p>
        </Reveal>
        <Reveal delayMs={80}>
          <Diagnostico />
        </Reveal>
      </div>
    </section>
  );
}
