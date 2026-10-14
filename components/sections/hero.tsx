import { Sparkles, GraduationCap, Cpu } from "lucide-react";

import { WhatsAppCta } from "@/components/whatsapp-cta";

const HERO_MESSAGE =
  "Hola! Vengo de la web de Tu Profe Industrial y quiero subir mis notas en matemática, física o ingeniería. Me ayudas?";

/**
 * Hero — propuesta de valor principal.
 *
 * ANTI-SLOP (obra-maestra): layout asimetrico de dos columnas (no un hero
 * centrado sobre malla oscura generica). La columna izquierda lleva la
 * jerarquia tipografica real y el CTA; la derecha es un panel "blueprint" con
 * las credenciales que diferencian al profe (ingeniero + docencia + IA). La
 * diagonal de acento refuerza la identidad teal<->amber sin degradados morados.
 */
export function Hero() {
  return (
    <section
      id="inicio"
      className="relative scroll-mt-24 overflow-hidden border-b border-border/60"
    >
      {/* Fondo tecnico sutil: grilla de blueprint + un halo teal, sin AI-purple. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklch,var(--color-border)_60%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--color-border)_60%,transparent)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_72%)]" />
        <div className="absolute -left-24 -top-24 size-80 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-12">
        {/* Columna de mensaje */}
        <div className="flex flex-col items-start gap-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-semibold tracking-wide text-primary uppercase">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Clases con método de ingeniería e IA
          </span>

          <h1 className="text-4xl font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Matemática, física e ingeniería que{" "}
            <span className="text-primary">por fin se entienden</span>
          </h1>

          {/*
           * Eslogan de marca: texto real (no imagen) directamente bajo el <h1>.
           * Usa `text-primary` (teal) en vez de `accent-foreground`: el ámbar
           * oscuro casi desaparece en dark mode sobre fondos tenues (ver nota en
           * testimonials.tsx), mientras que primary cumple AA (>=4.5:1) en claro
           * y oscuro. Un punto ámbar aporta el "spark" de la identidad.
           */}
          <p className="flex items-center gap-2.5 font-display text-xl font-semibold text-primary sm:text-2xl">
            <span
              aria-hidden="true"
              className="inline-block size-2.5 shrink-0 rounded-full bg-accent"
            />
            Aprender es para todos
          </p>

          <p className="max-w-xl text-lg text-muted-foreground text-pretty">
            Soy Ingeniero Industrial y Docente diplomado en docencia e
            innovación en educación superior. Preparo alumnos desde 1° medio
            hasta el último año de ingeniería con un método claro y herramientas
            de IA que aceleran tu aprendizaje.
          </p>

          {/*
           * Teaser de asesorías: adelanta que, además de clases, asesora
           * proyectos digitales y PYME. Apunta a la sección #asesorias que se
           * crea en una feature posterior (el ancla es esperada).
           */}
          <p className="max-w-xl text-sm text-muted-foreground text-pretty">
            Además de las clases, también asesoro proyectos digitales y PYME
            (y otros más).{" "}
            <a
              href="#asesorias"
              className="font-semibold text-primary underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Ver asesorías e innovación
            </a>
          </p>

          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <WhatsAppCta
              message={HERO_MESSAGE}
              label="Quiero empezar hoy"
              className="px-7 py-3.5 text-base"
            />
            <a
              href="#calculadora"
              className="inline-flex min-h-11 items-center rounded-full px-5 text-sm font-semibold text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Prueba la calculadora de notas
            </a>
          </div>

          <p className="text-sm text-muted-foreground">
            Clases online en todo Chile · Primera coordinación por WhatsApp sin
            costo
          </p>
        </div>

        {/* Panel de credenciales (asimetrico, estilo ficha tecnica) */}
        <div className="relative">
          <div className="rounded-2xl border border-border bg-card/80 p-6 shadow-sm backdrop-blur-sm sm:p-7">
            <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
              Perfil del profe
            </p>
            <dl className="mt-5 flex flex-col gap-5">
              <Credential
                icon={<GraduationCap className="size-5" aria-hidden="true" />}
                term="Ingeniero Industrial"
                detail="Base técnica sólida para enseñar los por qué, no solo las fórmulas."
              />
              <Credential
                icon={<Sparkles className="size-5" aria-hidden="true" />}
                term="Diplomado en Docencia e Innovación"
                detail="Educación superior: métodos pedagógicos actuales, no improvisados."
              />
              <Credential
                icon={<Cpu className="size-5" aria-hidden="true" />}
                term="Innovador en productos digitales con IA"
                detail="Uso inteligencia artificial para personalizar y acelerar tu avance."
              />
            </dl>
          </div>
          {/* Nodo de acento ambar: el "spark" de la identidad. */}
          <div
            aria-hidden="true"
            className="absolute -right-3 -top-3 size-6 rounded-full border-4 border-background bg-accent"
          />
        </div>
      </div>
    </section>
  );
}

function Credential({
  icon,
  term,
  detail,
}: {
  icon: React.ReactNode;
  term: string;
  detail: string;
}) {
  return (
    <div className="flex gap-3.5">
      <span className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </span>
      <div>
        <dt className="font-display font-semibold text-foreground">{term}</dt>
        <dd className="mt-0.5 text-sm text-muted-foreground">{detail}</dd>
      </div>
    </div>
  );
}
