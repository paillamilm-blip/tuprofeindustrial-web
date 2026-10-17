import { ClipboardCheck, FileSearch, CalendarClock } from "lucide-react";

import { Reveal } from "@/components/sections/reveal";
import { WhatsAppCta } from "@/components/whatsapp-cta";

const METODO_MESSAGE =
  "Hola! Quiero empezar con tu método: me gustaría agendar el diagnóstico con una prueba real para ver mi nivel. ¿Cómo lo coordinamos?";

type Step = {
  icon: typeof ClipboardCheck;
  title: string;
  description: string;
};

/**
 * Metodo ("Mi método") — explica cómo trabajo en 3 pasos claros, justo antes
 * de "Quién soy" para que el embudo lea: cómo trabajo -> quién soy. Es una
 * sección informativa (sin elementos interactivos salvo el CTA opcional),
 * así que se construye como una línea de pasos numerados.
 *
 * Anti-slop: iconos lucide distintos por paso, numeral en font-mono (convención
 * numérica del sitio), tokens semánticos teal/ámbar, entrada con Reveal y
 * escalonado por delayMs como en services.tsx. Mobile-first: una columna en
 * móvil, tres columnas desde sm. El conector decorativo va aria-hidden.
 */
const STEPS: readonly Step[] = [
  {
    icon: ClipboardCheck,
    title: "Diagnóstico con una prueba real",
    description:
      "Partimos con una prueba real para medir tu nivel de forma objetiva, no por lo que crees que sabes. Así sabemos exactamente de dónde partimos.",
  },
  {
    icon: FileSearch,
    title: "Análisis de los contenidos",
    description:
      "Con el diagnóstico en mano, analizo qué contenidos necesitas reforzar y cuáles ya dominas. El plan se concentra en lo que de verdad te mueve la aguja.",
  },
  {
    icon: CalendarClock,
    title: "Distribución de las horas según el nivel",
    description:
      "Según tu nivel y tu meta, armamos la distribución de horas: cuántas sesiones, con qué intensidad y en qué orden. Nada de clases genéricas.",
  },
];

export function Metodo() {
  return (
    <section id="metodo" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <Reveal className="max-w-2xl">
          <p className="font-mono text-xs tracking-widest text-primary uppercase">
            Mi método
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Cómo trabajo contigo, paso a paso
          </h2>
          <p className="mt-3 text-muted-foreground text-pretty">
            No improviso: cada plan se construye sobre datos reales de tu nivel.
            Estos son los tres pasos que seguimos antes de la primera clase.
          </p>
        </Reveal>

        {/* Línea de pasos: una columna en móvil, tres desde sm. */}
        <ol className="relative mt-10 grid gap-6 sm:grid-cols-3 sm:gap-5">
          {/* Conector decorativo en desktop (une los tres pasos). */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent sm:block"
          />
          {STEPS.map((step, i) => (
            <Reveal key={step.title} as="li" delayMs={i * 80} className="relative">
              <StepCard step={step} index={i} />
            </Reveal>
          ))}
        </ol>

        <Reveal className="mt-10 flex flex-col items-center gap-3 text-center">
          <p className="text-muted-foreground">
            ¿Listo para empezar? El primer paso es el diagnóstico.
          </p>
          <WhatsAppCta
            message={METODO_MESSAGE}
            label="Agendar mi diagnóstico"
            className="px-7 py-3.5 text-base"
          />
        </Reveal>
      </div>
    </section>
  );
}

function StepCard({ step, index }: { step: Step; index: number }) {
  const Icon = step.icon;
  return (
    <article className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-7">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="inline-flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary"
        >
          <Icon className="size-6" aria-hidden="true" />
        </span>
        <span className="font-mono text-2xl font-semibold text-accent">
          {index + 1}
        </span>
      </div>

      <h3 className="mt-4 font-display text-xl font-semibold">{step.title}</h3>
      <p className="mt-3 text-sm text-muted-foreground text-pretty">
        {step.description}
      </p>
    </article>
  );
}
