import Image from "next/image";
import { BadgeCheck, Users, Sparkles } from "lucide-react";

import { Reveal } from "@/components/sections/reveal";

/**
 * About ("Quién soy / Tu profe") — bio profesional con las credenciales clave
 * y señales de confianza (perfil verificado en Superprof, alumnos reales).
 */
export function About() {
  return (
    <section
      id="profe"
      className="scroll-mt-24 border-y border-border/60 bg-muted/30 px-4 py-16 sm:px-6 sm:py-20"
    >
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-14">
        {/* Retrato oficial del profesor */}
        <Reveal className="order-1 lg:order-none">
          <figure className="relative mx-auto aspect-[4/5] w-full max-w-xs overflow-hidden rounded-2xl border border-border bg-card shadow-lg ring-1 ring-border/50">
            <Image
              src="/profe.jpg"
              alt="Matías, Ingeniero Civil Industrial y Docente - TuProfeIndustrial"
              fill
              sizes="(max-width: 768px) 100vw, 320px"
              className="object-cover"
              priority
            />
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
              Vengo de dar tutorías en{" "}
              <a
                href="https://www.superprof.cl/ingeniero-industrial-diplomado-docencia-innovacion-educacion-superior-clases-calculo-algebra-fisica.html"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground underline decoration-primary/50 underline-offset-4 hover:text-primary transition-colors"
              >
                Superprof
              </a>
              , donde cuento con perfil verificado y opiniones de alumnos reales. Hoy preparo cada
              tutoría con herramientas de IA para detectar tus vacíos más rápido,
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
              text="Perfil verificado con 5.0 ⭐ en Superprof"
              href="https://www.superprof.cl/ingeniero-industrial-diplomado-docencia-innovacion-educacion-superior-clases-calculo-algebra-fisica.html"
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

function Highlight({
  icon,
  text,
  href,
}: {
  icon: React.ReactNode;
  text: string;
  href?: string;
}) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="mt-0.5 text-primary">{icon}</span>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-foreground underline decoration-primary/40 underline-offset-4 hover:text-primary transition-colors"
        >
          {text} ↗
        </a>
      ) : (
        <span className="text-sm font-medium text-foreground">{text}</span>
      )}
    </li>
  );
}
