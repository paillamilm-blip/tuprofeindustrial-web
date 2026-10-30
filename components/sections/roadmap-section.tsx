import { Reveal } from "@/components/sections/reveal";
import { Roadmap } from "@/components/roadmap";

/**
 * RoadmapSection — presenta la Ruta de aprendizaje visual. Muestra el camino
 * desde el nivel actual del alumno hasta su meta, reforzando "Aprender es para
 * todos": siempre hay una ruta, paso a paso.
 */
export function RoadmapSection() {
  return (
    <section id="ruta" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <Reveal className="text-center">
          <p className="font-mono text-xs tracking-widest text-primary uppercase">
            Tu camino, paso a paso
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Ruta de aprendizaje
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground text-pretty">
            Desde 1° medio hasta el último año de Ingeniería. Elige dónde
            partes y hasta dónde quieres llegar: te mostramos cada etapa del
            trayecto.
          </p>
        </Reveal>
        <Reveal delayMs={80}>
          <Roadmap />
        </Reveal>
      </div>
    </section>
  );
}
