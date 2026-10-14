import { Quote } from "lucide-react";

import { Reveal } from "@/components/sections/reveal";
import { cn } from "@/lib/utils";

/**
 * Testimonials ("Resultados") — SLOTS placeholder claramente marcados.
 *
 * IMPORTANTE: el profe aún NO tiene testimonios escritos (viene de dar clases
 * en superprofe.cl). Por ética y para no inventar reseñas falsas, estas
 * tarjetas NO muestran citas inventadas como reales: cada una lleva un badge
 * visible "Ejemplo — reemplazar con un testimonio real" y texto de ejemplo
 * atenuado. La sección se ve intencional y pulida aun estando vacía.
 *
 * ====================================================================
 * CÓMO REEMPLAZAR (para el dueño del sitio):
 *   1. Edita el arreglo TESTIMONIALS de abajo.
 *   2. Por cada testimonio real: pon `placeholder: false`, escribe `quote`
 *      con la cita textual del alumno, `name` con su nombre (o inicial) y
 *      `context` con su curso/nivel (ej. "4° medio", "Ingeniería UC").
 *   3. Al poner `placeholder: false` desaparece el badge de ejemplo y la
 *      tarjeta se muestra como testimonio real.
 * ====================================================================
 */
type Testimonial = {
  quote: string;
  name: string;
  context: string;
  placeholder: boolean;
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Aquí irá el testimonio real de un alumno: qué le costaba, cómo fueron las clases y qué resultado obtuvo.",
    name: "Nombre del alumno",
    context: "Curso o nivel",
    placeholder: true,
  },
  {
    quote:
      "Espacio para una reseña real centrada en la preparación PAES y el puntaje o la mejora conseguida.",
    name: "Nombre del alumno",
    context: "Preparación PAES",
    placeholder: true,
  },
  {
    quote:
      "Reseña real de un estudiante universitario sobre la nivelación de ingeniería y el ramo aprobado.",
    name: "Nombre del alumno",
    context: "Ingeniería universitaria",
    placeholder: true,
  },
  {
    quote:
      "Testimonio real de un apoderado o alumno de enseñanza media sobre la mejora de notas.",
    name: "Nombre del alumno",
    context: "Enseñanza media",
    placeholder: true,
  },
];

export function Testimonials() {
  return (
    <section
      id="testimonios"
      className="scroll-mt-24 border-y border-border/60 bg-muted/30 px-4 py-16 sm:px-6 sm:py-20"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal className="max-w-2xl">
          <p className="font-mono text-xs tracking-widest text-primary uppercase">
            Resultados
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Lo que dirán mis alumnos
          </h2>
          <p className="mt-3 text-muted-foreground text-pretty">
            Estoy reuniendo las reseñas de mis estudiantes. Mientras tanto,
            estos espacios quedan listos para publicar testimonios reales muy
            pronto.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={i} delayMs={i * 70}>
              <TestimonialCard testimonial={t} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const initials = testimonial.placeholder
    ? "?"
    : testimonial.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

  return (
    <figure className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-sm">
      {testimonial.placeholder && (
        <span className="mb-3 inline-flex w-fit items-center rounded-full border border-dashed border-accent/60 bg-accent/10 px-2.5 py-1 text-[11px] font-semibold text-accent-foreground">
          Ejemplo — reemplazar con un testimonio real
        </span>
      )}
      <Quote
        className="size-7 text-primary/30"
        aria-hidden="true"
      />
      <blockquote
        className={cn(
          "mt-2 flex-1 text-sm text-pretty",
          testimonial.placeholder
            ? "text-muted-foreground italic"
            : "text-foreground"
        )}
      >
        {testimonial.quote}
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-3 border-t border-border/70 pt-4">
        <span
          aria-hidden="true"
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
        >
          {initials}
        </span>
        <span className="text-sm">
          <span className="block font-semibold text-foreground">
            {testimonial.name}
          </span>
          <span className="block text-muted-foreground">
            {testimonial.context}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}
