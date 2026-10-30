import { Quote } from "lucide-react";

import { Reveal } from "@/components/sections/reveal";
import { cn } from "@/lib/utils";

/**
 * Testimonials ("Resultados") — reseñas reales de alumnos.
 *
 * Estas tarjetas muestran testimonios reales (placeholder: false). La tarjeta
 * calcula las iniciales del avatar a partir del nombre y solo muestra el badge
 * "Ejemplo — reemplazar con un testimonio real" cuando `placeholder: true`.
 *
 * ====================================================================
 * CÓMO EDITAR (para el dueño del sitio):
 *   1. Edita el arreglo TESTIMONIALS de abajo.
 *   2. Por cada testimonio: deja `placeholder: false`, escribe `quote` con la
 *      cita textual del alumno, `name` con su nombre (o inicial) y `context`
 *      con su curso/nivel (ej. "3° medio", "Preparación PAES").
 *   3. Si en algún momento quieres volver a dejar una tarjeta como ejemplo
 *      editable, pon `placeholder: true` y reaparece el badge de ejemplo.
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
      "Llegué con base débil en matemáticas y física para rendir los exámenes de admisión. El entrenamiento fue directo al grano, enfocado en el temario exacto de la Escuela Naval y con ensayos reales bajo tiempo. Logré quedar seleccionado en el proceso de admisión.",
    name: "Víctor papá de Lucas",
    context: "Admisión Escuela Naval",
    placeholder: false,
  },
  {
    quote:
      "Estaba al borde de reprobar Cálculo I en la universidad. Las clases me ayudaron a entender la lógica detrás de los ejercicios y no solo a memorizar fórmulas. Pasé el ramo con una nota que me permitió asegurar el semestre sin ir a examen de repetición.",
    name: "Sofía M.",
    context: "Ingeniería comercial, primer año",
    placeholder: false,
  },
  {
    quote:
      "Rendí la PAES de Matemáticas sintiéndome muy inseguro con M1 y M2. El plan de trabajo se concentró en mis errores recurrentes y en técnicas de descarte rápido. Subí más de 180 puntos respecto a mi primer ensayo y quedé en mi primera opción universitaria.",
    name: "Matías V.",
    context: "Preparación PAES",
    placeholder: false,
  },
  {
    quote:
      "Durante 2° y 3° medio mis notas de matemáticas no superaban el 4,5, lo que me estaba bajando el NEM. Con el reforzamiento semanal logré ordenar mi método de estudio, subir mi promedio a 6,3 y recuperar la confianza para enfrentar las pruebas.",
    name: "Valentina R.",
    context: "3° medio",
    placeholder: false,
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
            Lo que dicen mis alumnos
          </h2>
          <p className="mt-3 text-muted-foreground text-pretty">
            Resultados reales en admisión a la Escuela Naval, nivelación
            universitaria, preparación PAES y enseñanza media: alumnos que
            pasaron de la inseguridad a lograr su objetivo.
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
      {/* El texto del badge usa `text-foreground` (no `accent-foreground`):
          sobre el fondo tenue `accent/10` el ámbar oscuro de accent-foreground
          quedaba casi invisible en dark mode (1.74:1). `foreground` cumple AA
          en ambos modos (16.3:1 light / 8.9:1 dark) y el borde ámbar punteado
          conserva la identidad de "ejemplo". */}
      {testimonial.placeholder && (
        <span className="mb-3 inline-flex w-fit items-center rounded-full border border-dashed border-accent/60 bg-accent/10 px-2.5 py-1 text-[11px] font-semibold text-foreground">
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
