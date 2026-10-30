import { PaesSimulator } from "@/components/paes-simulator";
import { Reveal } from "@/components/sections/reveal";

/**
 * PaesSection — presenta la Calculadora de puntaje PAES. El alumno compara su
 * puntaje actual con su objetivo y recibe el intensivo o refuerzo que mas le
 * conviene, listo para conversar por WhatsApp.
 *
 * El id sigue siendo "simulador-paes": es el ancla que ya circula en videos,
 * PDFs y WhatsApp. Cambiar el nombre visible no debe romper esos enlaces.
 */
export function PaesSection() {
  return (
    <section
      id="simulador-paes"
      className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <Reveal className="text-center">
          <p className="font-mono text-xs tracking-widest text-primary uppercase">
            Proyecta tu puntaje
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Calculadora de puntaje PAES
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground text-pretty">
            Ingresa tu puntaje actual y tu meta: calculamos cuánto debes subir
            y qué intensivo te conviene para llegar a tiempo.
          </p>
        </Reveal>
        <Reveal delayMs={80}>
          <PaesSimulator />
        </Reveal>
      </div>
    </section>
  );
}
