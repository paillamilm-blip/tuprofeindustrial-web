import { GradeCalculator } from "@/components/grade-calculator";
import { Reveal } from "@/components/sections/reveal";

/**
 * CalculatorSection — envuelve la calculadora EXISTENTE (sin tocar su logica)
 * con una introduccion y el estilo de la nueva landing. Es el "gancho" de
 * valor inmediato: una herramienta util y gratis antes de pedir el contacto.
 */
export function CalculatorSection() {
  return (
    <section id="calculadora" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <Reveal className="text-center">
          <p className="font-mono text-xs tracking-widest text-primary uppercase">
            Herramienta gratis
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Calculadora de notas chilena
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground text-pretty">
            Escala de 1.0 a 7.0. Calcula tu promedio ponderado o descubre
            exactamente qué nota necesitas para aprobar. Sin registro, sin
            vueltas.
          </p>
        </Reveal>
        <Reveal delayMs={80}>
          <GradeCalculator />
        </Reveal>
      </div>
    </section>
  );
}
