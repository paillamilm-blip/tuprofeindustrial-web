import {
  Target,
  Rocket,
  Building2,
  Sigma,
  Atom,
  Cog,
  Check,
  CalendarClock,
} from "lucide-react";

import { Reveal } from "@/components/sections/reveal";
import { WhatsAppCta } from "@/components/whatsapp-cta";
import { cn } from "@/lib/utils";

const SERVICES_MESSAGE =
  "Hola! Quiero información sobre tus clases (personalizadas, intensivo PAES o nivelación de ingeniería). ¿Me cuentas?";

type Service = {
  icon: typeof Target;
  name: string;
  tagline: string;
  description: string;
  points: readonly string[];
  /** Estructura del plan (frecuencia / duración), si aplica. */
  structure: readonly string[] | null;
  /** Precio visible (siempre en font-mono). null = sin precio mostrado. */
  price: string | null;
  priceLabel: string | null;
  /** Mensaje precargado para el CTA de WhatsApp específico de la tarjeta. */
  ctaMessage: string;
  featured: boolean;
};

/**
 * Services — tres servicios DIFERENCIADOS (anti-slop: no tres tarjetas
 * identicas). El intensivo PAES se destaca como tarjeta featured (mas ancha y
 * con borde de acento) porque es el servicio de mayor demanda; los otros dos
 * ocupan tarjetas estandar. Iconos lucide (SVG), nunca emoji.
 */
const SERVICES: readonly Service[] = [
  {
    icon: Target,
    name: "Clases personalizadas",
    tagline: "1 a 1, 100% personalizadas",
    description:
      "Clases individuales enfocadas en tus dudas reales, presenciales (o también online). Son 100% personalizables: se adaptan a tu nivel, tu ritmo y las pruebas que necesitas preparar.",
    points: [
      "Presencial (o también online)",
      "Plan 100% a tu medida",
      "Horario flexible",
    ],
    structure: null,
    price: "desde $20.000",
    priceLabel: "Clase individual",
    ctaMessage:
      "Hola! Me interesa una clase personalizada individual (1 a 1). ¿Me cuentas valores y disponibilidad?",
    featured: false,
  },
  {
    icon: Rocket,
    name: "Intensivo PAES",
    tagline: "Preparación con estrategia (M1 o M2)",
    description:
      "Preparación enfocada para la PAES de Matemáticas (M1 o M2) y Ciencias: contenido, ensayos comentados y estrategia de puntaje para llegar firme al día de la prueba. Preferentemente presencial (o también online).",
    points: [
      "Diagnóstico inicial de nivel",
      "Ensayos con retroalimentación",
      "Técnicas de tiempo y puntaje",
    ],
    structure: [
      "3 veces por semana",
      "2 horas por sesión",
      "Durante 1 mes",
    ],
    price: "Consultar valor",
    priceLabel: "Plan mensual",
    ctaMessage:
      "Hola! Me interesa el intensivo PAES de Matemáticas (M1 o M2), con la estructura de 3 veces por semana y 2 horas por sesión durante 1 mes. ¿Me cuentas el valor del plan mensual?",
    featured: true,
  },
  {
    icon: Building2,
    name: "Nivelación de Ingeniería",
    tagline: "Para universitarios",
    description:
      "Apoyo en ramos de los primeros años de ingeniería: cálculo, álgebra, Física y más. Ideal si vienes arrastrando bases o preparas un examen clave. Preferentemente presencial (o también online).",
    points: ["Cálculo y álgebra", "Física universitaria", "Antes de certámenes"],
    structure: [
      "3 veces por semana",
      "3 horas diarias",
    ],
    price: "$500.000 al mes (programa completo: 2 meses)",
    priceLabel: "Plan mensual",
    ctaMessage:
      "Hola! Me interesa la nivelación de Ingeniería (3 veces por semana, 3 horas diarias). ¿Coordinamos el programa completo de 2 meses?",
    featured: false,
  },
];

const SUBJECTS = [
  { icon: Sigma, label: "Matemáticas" },
  { icon: Atom, label: "Física" },
  { icon: Cog, label: "Ingeniería" },
] as const;

export function Services() {
  return (
    <section
      id="servicios"
      className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal className="max-w-2xl">
          <p className="font-mono text-xs tracking-widest text-primary uppercase">
            Servicios
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Clases pensadas para cada etapa
          </h2>
          <p className="mt-3 text-muted-foreground text-pretty">
            Desde 1° medio hasta el último año de ingeniería. Elige el formato
            que necesitas y lo adaptamos a tu nivel y tus objetivos.
          </p>
        </Reveal>

        {/* Tarjetas diferenciadas: la featured ocupa 2 columnas en desktop. */}
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {SERVICES.map((service, i) => (
            <Reveal
              key={service.name}
              delayMs={i * 80}
              className={cn(service.featured && "lg:col-span-2")}
            >
              <ServiceCard service={service} />
            </Reveal>
          ))}
        </div>

        {/* Materias y niveles */}
        <Reveal className="mt-10 rounded-2xl border border-border bg-muted/30 p-6 sm:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold">
                Materias que cubro
              </h3>
              <ul className="mt-3 flex flex-wrap gap-2.5">
                {SUBJECTS.map((s) => (
                  <li
                    key={s.label}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium"
                  >
                    <s.icon className="size-4 text-primary" aria-hidden="true" />
                    {s.label}
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:text-right">
              <h3 className="font-display text-lg font-semibold">Niveles</h3>
              <p className="mt-2 max-w-xs text-sm text-muted-foreground md:ml-auto">
                Escolares (1° medio en adelante), preuniversitarios y
                universitarios hasta el último año de ingeniería.
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal className="mt-10 flex flex-col items-center gap-3 text-center">
          <p className="text-muted-foreground">
            ¿No sabes cuál te conviene? Cuéntame tu caso y lo definimos juntos.
          </p>
          <WhatsAppCta
            message={SERVICES_MESSAGE}
            label="Consultar por mis clases"
            className="px-7 py-3.5 text-base"
          />
        </Reveal>
      </div>
    </section>
  );
}

function ServiceCard({ service }: { service: Service }) {
  const Icon = service.icon;
  return (
    <article
      className={cn(
        "group flex h-full flex-col rounded-2xl border bg-card p-6 shadow-sm transition-all duration-200 motion-safe:hover:-translate-y-1 hover:shadow-md motion-reduce:transition-none sm:p-7",
        service.featured
          ? "border-accent/60 ring-1 ring-accent/30"
          : "border-border"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className={cn(
            "inline-flex size-11 items-center justify-center rounded-xl",
            service.featured
              ? "bg-accent/15 text-accent-foreground"
              : "bg-primary/10 text-primary"
          )}
        >
          <Icon
            className={cn("size-6", service.featured && "text-accent")}
            aria-hidden="true"
          />
        </span>
        {service.featured && (
          <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
            Más solicitado
          </span>
        )}
      </div>

      <h3 className="mt-4 font-display text-xl font-semibold">
        {service.name}
      </h3>
      <p className="mt-1 text-sm font-medium text-primary">{service.tagline}</p>
      <p className="mt-3 text-sm text-muted-foreground text-pretty">
        {service.description}
      </p>

      <ul className="mt-5 flex flex-col gap-2 border-t border-border/70 pt-4">
        {service.points.map((point) => (
          <li key={point} className="flex items-center gap-2 text-sm">
            <Check className="size-4 shrink-0 text-primary" aria-hidden="true" />
            <span>{point}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto" />

      {service.structure && (
        <div className="mt-4 rounded-xl border border-border/70 bg-muted/30 p-4">
          <p className="flex items-center gap-2 font-mono text-xs tracking-widest text-primary uppercase">
            <CalendarClock className="size-4 shrink-0" aria-hidden="true" />
            Estructura
          </p>
          <ul className="mt-2.5 flex flex-col gap-1.5">
            {service.structure.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-sm text-foreground"
              >
                <span
                  aria-hidden="true"
                  className="inline-block size-1.5 shrink-0 rounded-full bg-accent"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {service.price && (
        <div className="mt-5 flex flex-col gap-1 border-t border-border/70 pt-4">
          <span className="text-sm text-muted-foreground">
            {service.priceLabel}
          </span>
          <span className="font-mono text-base font-semibold text-foreground">
            {service.price}
          </span>
        </div>
      )}

      <div className="mt-5">
        <WhatsAppCta
          message={service.ctaMessage}
          label="Consultar por WhatsApp"
          ariaLabel={`Consultar por WhatsApp sobre ${service.name}`}
          className="w-full min-h-11 px-5 py-2.5 text-sm"
        />
      </div>
    </article>
  );
}
