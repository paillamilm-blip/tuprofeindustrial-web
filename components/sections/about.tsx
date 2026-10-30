import { UserRound, BadgeCheck, Users, Sparkles } from "lucide-react";

import { Reveal } from "@/components/sections/reveal";

/**
 * About ("Quién soy / Tu profe") — bio profesional con las credenciales clave
 * y senales de confianza (experiencia en superprofe.cl, alumnos reales).
 *
 * El retrato es un PLACEHOLDER accesible: una caja con relacion de aspecto
 * reservada (aspect-[4/5]) para evitar CLS cuando se reemplace por la foto
 * real. Lleva una etiqueta visible "Foto del profesor — reemplazar" y un
 * aria-label, sin usar fotos de stock falsas.
 */
export function About() {
  return (
    <section
      id="profe"
      className="scroll-mt-24 border-y border-border/60 bg-muted/30 px-4 py-16 sm:px-6 sm:py-20"
    >
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-14">
        {/* Placeholder de foto con aspecto reservado */}
        <Reveal className="order-1 lg:order-none">
          <figure
            role="img"
            aria-label="Espacio reservado para la foto del profesor. Pendiente de reemplazar por una imagen real."
            className="relative mx-auto aspect-[4/5] w-full max-w-xs overflow-hidden rounded-2xl border-2 border-dashed border-primary/40 bg-card"
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
              <span className="inline-flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UserRound className="size-8" aria-hidden="true" />
              </span>
              <figcaption className="text-sm font-medium text-muted-foreground">
                Foto del profesor
                <br />
                <span className="text-xs">(reemplazar por imagen real)</span>
              </figcaption>
            </div>
          </figure>
        </Reveal>

        {/* Bio */}
        <Reveal delayMs={80}>
          <p className="font-mono text-xs tracking-widest text-primary uppercase">
            Quién soy
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Tu profe: Ingeniero Industrial y Docente
          </h2>
          <div className="mt-4 flex flex-col gap-4 text-muted-foreground text-pretty">
            {/*
             * Mayúsculas de marca: "Ingeniero Industrial" y "Docente" nombran el
             * rol/identidad del profe -> van capitalizados. "docencia e
             * innovación" aquí es sustantivo común (nombre del diplomado) -> en
             * minúscula para que la frase sea gramaticalmente correcta.
             */}
            <p>
              Soy Ingeniero Industrial y Docente diplomado en docencia e
              innovación en educación superior. Esa combinación es clave: domino
              la materia a nivel profesional y también sé <em>cómo</em>{" "}
              enseñarla para que de verdad se entienda.
            </p>
            <p>
              Vengo de dar clases particulares en superprofe.cl, donde he
              acompañado a alumnos reales de distintos niveles. Hoy preparo cada
              clase con herramientas de IA para detectar tus vacíos más rápido,
              personalizar el plan y aprovechar mejor tu tiempo de estudio.
            </p>
          </div>

          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            <Highlight
              icon={<BadgeCheck className="size-5" aria-hidden="true" />}
              text="Ingeniero Industrial + Docente diplomado"
            />
            <Highlight
              icon={<Sparkles className="size-5" aria-hidden="true" />}
              text="Método apoyado en herramientas de IA"
            />
            <Highlight
              icon={<Users className="size-5" aria-hidden="true" />}
              text="Experiencia con alumnos reales (superprofe.cl)"
            />
            <Highlight
              icon={<BadgeCheck className="size-5" aria-hidden="true" />}
              text="Desde 1° medio hasta ingeniería universitaria"
            />
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

function Highlight({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="mt-0.5 text-primary">{icon}</span>
      <span className="text-sm font-medium text-foreground">{text}</span>
    </li>
  );
}
