import {
  Sparkles,
  Globe,
  Smartphone,
  Boxes,
  Workflow,
  Pizza,
  Cookie,
  Lightbulb,
  HeartHandshake,
} from "lucide-react";

import { Reveal } from "@/components/sections/reveal";
import { WhatsAppCta } from "@/components/whatsapp-cta";
import { cn } from "@/lib/utils";

/**
 * Mensaje de WhatsApp propio y DISTINTO del resto de CTAs del sitio: abre la
 * conversacion desde la faceta de asesorias (proyectos digitales o PYME).
 */
const ADVISORY_MESSAGE =
  "Hola! Vengo de la web de TuProfeIndustrial y quiero asesoría para un proyecto (digital o PYME). Te cuento mi idea.";

/**
 * Advisory — seccion "Asesorías e Innovación", DISTINTA de Servicios a
 * proposito (anti-slop: no replica las tres tarjetas identicas de clases).
 *
 * Estructura: un panel lider que refuerza su faceta de Innovador en productos
 * digitales con IA, acompanado de una grilla de proyectos agrupados en dos
 * familias (productos digitales / PYME e innovación). Cada tipo de proyecto es
 * un item diferenciado con su propio icono lucide (nunca emoji).
 */

type Project = {
  icon: typeof Globe;
  name: string;
  description: string;
};

const DIGITAL_PROJECTS: readonly Project[] = [
  {
    icon: Globe,
    name: "Páginas web",
    description:
      "Sitios rapidos y a medida para que tu negocio o idea tenga presencia profesional en linea.",
  },
  {
    icon: Smartphone,
    name: "Aplicaciones",
    description:
      "Apps y herramientas interactivas que resuelven un problema concreto de tus clientes.",
  },
  {
    icon: Boxes,
    name: "Micro SaaS",
    description:
      "Pequeños productos de software por suscripción: micro-herramientas con IA que resuelven un nicho y generan ingresos recurrentes.",
  },
  {
    icon: Workflow,
    name: "Automatizaciones",
    description:
      "Flujos automatizados y automatizaciones con IA que conectan tus herramientas y te ahorran horas de trabajo manual.",
  },
] as const;

const PYME_PROJECTS: readonly Project[] = [
  {
    icon: Pizza,
    name: "Pizzerías",
    description:
      "Procesos, costos y carta para ordenar la operacion y mejorar el margen.",
  },
  {
    icon: Cookie,
    name: "Confiterías saludables",
    description:
      "Producto, formulación y propuesta de valor para un nicho que crece.",
  },
  {
    icon: Lightbulb,
    name: "Innovación en comidas",
    description:
      "Nuevos conceptos gastronómicos: de la idea al prototipo validado.",
  },
  {
    icon: HeartHandshake,
    name: "Fundaciones",
    description:
      "Proyectos de impacto social con bases ordenadas y medibles.",
  },
] as const;

export function Advisory() {
  return (
    <section id="asesorias" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        {/* Panel lider: refuerza la faceta Innovador + IA, con fondo propio
            para separarse visualmente del bloque de Servicios. */}
        <Reveal>
          <div className="overflow-hidden rounded-3xl border border-accent/40 bg-gradient-to-br from-primary/10 via-card to-accent/10 p-6 sm:p-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <p className="inline-flex items-center gap-2 font-mono text-xs tracking-widest text-accent-foreground uppercase">
                  <Sparkles className="size-4 text-accent" aria-hidden="true" />
                  Asesorías e Innovación
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                  No solo enseño: ayudo a crear
                </h2>
                <p className="mt-3 text-muted-foreground text-pretty">
                  Soy Ingeniero, Docente e Innovador en productos digitales con
                  IA. Asesoro proyectos tanto digitales como PYME: desde una
                  idea en papel hasta un producto que funciona. Si tienes algo
                  en mente, lo ordenamos y lo hacemos realidad.
                </p>
              </div>
              <div className="shrink-0">
                <WhatsAppCta
                  message={ADVISORY_MESSAGE}
                  label="Asesorar mi proyecto"
                  ariaLabel="Abrir conversacion de WhatsApp para asesorar un proyecto digital o PYME"
                  className="px-7 py-3.5 text-base"
                />
              </div>
            </div>
          </div>
        </Reveal>

        {/* Grilla de proyectos agrupada en dos familias diferenciadas. */}
        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <ProjectGroup
            title="Productos digitales con IA"
            caption="Tecnología a tu medida"
            projects={DIGITAL_PROJECTS}
            tone="primary"
          />
          <ProjectGroup
            title="PYME e Innovación"
            caption="Negocios y proyectos de impacto"
            projects={PYME_PROJECTS}
            tone="accent"
          />
        </div>
      </div>
    </section>
  );
}

function ProjectGroup({
  title,
  caption,
  projects,
  tone,
}: {
  title: string;
  caption: string;
  projects: readonly Project[];
  tone: "primary" | "accent";
}) {
  return (
    <Reveal delayMs={tone === "accent" ? 80 : 0} className="flex flex-col gap-4">
      <div>
        <h3 className="font-display text-xl font-semibold">{title}</h3>
        <p className="text-sm font-medium text-muted-foreground">{caption}</p>
      </div>
      <ul className="flex flex-col gap-3">
        {projects.map((project) => (
          <ProjectItem key={project.name} project={project} tone={tone} />
        ))}
      </ul>
    </Reveal>
  );
}

function ProjectItem({
  project,
  tone,
}: {
  project: Project;
  tone: "primary" | "accent";
}) {
  const Icon = project.icon;
  return (
    <li className="flex items-start gap-4 rounded-2xl border border-border bg-card p-4 transition-all duration-200 motion-safe:hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none sm:p-5">
      <span
        className={cn(
          "inline-flex size-11 shrink-0 items-center justify-center rounded-xl",
          tone === "accent"
            ? "bg-accent/15 text-accent"
            : "bg-primary/10 text-primary"
        )}
      >
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <div>
        <h4 className="font-display text-base font-semibold">{project.name}</h4>
        <p className="mt-0.5 text-sm text-muted-foreground text-pretty">
          {project.description}
        </p>
      </div>
    </li>
  );
}
