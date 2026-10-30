import { Check } from "lucide-react";

import { SimulacroForm } from "@/components/simulacro-form";
import { Reveal } from "@/components/sections/reveal";

/** Puntos de venta del simulacro, bajo el titulo de la seccion. */
const HIGHLIGHTS = [
  "Sin calculadora, como la prueba real",
  "Solucionario paso a paso",
  "Tabla para anotar tus errores",
];

/**
 * SimulacroSection — entrega el Simulacro M1 gratis a cambio de nombre y correo.
 * Es el iman del embudo: el alumno descarga el PDF, queda en la lista de correo
 * y puede pedir la correccion por WhatsApp.
 */
export function SimulacroSection() {
  return (
    <section
      id="simulacro-m1"
      className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <Reveal className="text-center">
          <p className="font-mono text-xs tracking-widest text-primary uppercase">
            Descarga libre
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Simulacro PAES M1 con solucionario
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground text-pretty">
            20 ítems de alternativas, en el formato de la prueba: números,
            álgebra y funciones, geometría, probabilidad y estadística. Con la
            cuenta de cada ítem y la trampa de cada distractor.
          </p>
          <ul className="mt-4 flex flex-col items-center gap-2 text-sm text-muted-foreground sm:flex-row sm:justify-center sm:gap-6">
            {HIGHLIGHTS.map((highlight) => (
              <li key={highlight} className="flex items-center gap-1.5">
                <Check className="size-4 text-primary" aria-hidden="true" />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delayMs={80}>
          <SimulacroForm />
        </Reveal>
      </div>
    </section>
  );
}
