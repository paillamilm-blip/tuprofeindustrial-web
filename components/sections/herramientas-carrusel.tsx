"use client";

import * as React from "react";

import { Reveal } from "@/components/sections/reveal";
import { cn } from "@/lib/utils";

type Herramienta = {
  /** Ancla de la seccion que ya existe mas abajo en la landing. */
  href: string;
  /** Rotulo mono que encabeza esa seccion (se reusa aqui para no duplicar marcas). */
  eyebrow: string;
  name: string;
  description: string;
  chip: string;
  /** Texto del CTA unico, en primera persona y con verbo propio por herramienta. */
  ctaLabel: string;
};

/**
 * Las cinco herramientas gratis de la landing, en el orden del embudo. Cada
 * tarjeta apunta al ancla de su seccion: el carrusel es un tablero de entrada,
 * no un reemplazo, asi que las secciones siguen existiendo y los enlaces
 * ya compartidos (#simulacro-m1, #diagnostico...) siguen funcionando.
 */
const HERRAMIENTAS: readonly Herramienta[] = [
  {
    href: "#diagnostico",
    eyebrow: "Diagnóstico en 1 minuto",
    name: "¿Qué plan necesitas?",
    description:
      "Cinco preguntas y sales con el plan claro: clases personalizadas, Intensivo PAES o Nivelación, a domicilio en Santiago u online.",
    chip: "gratis",
    ctaLabel: "Hacer el diagnóstico",
  },
  {
    href: "#calculadora",
    eyebrow: "Herramienta gratis",
    name: "Calculadora de notas chilena",
    description:
      "Tu promedio ponderado y la nota exacta que necesitas en la evaluación que queda para llegar a tu meta.",
    chip: "gratis",
    ctaLabel: "Abrir la calculadora de notas",
  },
  {
    href: "#simulador-paes",
    eyebrow: "Proyecta tu puntaje",
    name: "Calculadora de puntaje PAES",
    description:
      "Cuánto tienes hoy, dónde quieres llegar y cuántos puntos te faltan, con el plan que te acerca a la meta.",
    chip: "gratis",
    ctaLabel: "Proyectar mi puntaje",
  },
  {
    href: "#simulacro-m1",
    eyebrow: "Descarga libre",
    name: "Simulacro PAES M1 con solucionario",
    description:
      "20 ítems en el formato real de la prueba, sin calculadora, con la cuenta de cada ítem y la trampa de cada distractor.",
    chip: "PDF gratis",
    ctaLabel: "Bajar el simulacro M1",
  },
  {
    href: "#ruta",
    eyebrow: "Tu camino, paso a paso",
    name: "Ruta de aprendizaje",
    description:
      "Desde 1° medio hasta el último año de Ingeniería: eliges dónde estás y hasta dónde quieres llegar, y ves cada etapa.",
    chip: "gratis",
    ctaLabel: "Ver mi ruta",
  },
] as const;

/**
 * HerramientasCarrusel — tablero de entrada a las herramientas gratis.
 *
 * WHY: las cinco herramientas eran cinco secciones largas y el alumno bajaba a
 * ciegas para saber cuales existian. Aqui se ven todas en una pantalla y se
 * elige arrastrando (dedo o mouse) o con las flechas del teclado. Elegir no
 * duplica la herramienta: salta a su ancla de siempre, asi el SEO, el menu y
 * los enlaces ya compartidos quedan intactos.
 *
 * Accessibilidad: cada tarjeta es un enlace real (click central, "abrir en
 * otra pestana" y lectores de pantalla siguen funcionando). El primer toque
 * sobre una tarjeta lateral solo la centra; el enlace se ejecuta cuando ya esta
 * en el centro, y el arrastre largo nunca navega por accidente.
 */
export function HerramientasCarrusel() {
  const stripRef = React.useRef<HTMLOListElement | null>(null);
  const cardRefs = React.useRef<(HTMLLIElement | null)[]>([]);
  const [activo, setActivo] = React.useState(0);

  // Arrastre con mouse: punto de partida y distancia recorrida, para saber si
  // un click es intencion o el resto de un arrastre.
  const arrastre = React.useRef({ activo: false, x: 0, movido: 0 });

  const herramienta = HERRAMIENTAS[activo];

  // Marca la tarjeta centrada al hacer scroll (dedo, arrastre o teclado).
  React.useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;

    function medir() {
      const el = stripRef.current;
      if (!el) return;
      const centro = el.getBoundingClientRect().left + el.clientWidth / 2;
      let mejor = 0;
      let distancia = Number.POSITIVE_INFINITY;
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        const caja = card.getBoundingClientRect();
        const d = Math.abs(caja.left + caja.width / 2 - centro);
        if (d < distancia) {
          distancia = d;
          mejor = i;
        }
      });
      setActivo((actual) => (actual === mejor ? actual : mejor));
    }

    let frame = 0;
    function onScroll() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(medir);
    }

    strip.addEventListener("scroll", onScroll, { passive: true });
    const observador = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(medir);
    });
    observador.observe(strip);
    medir();

    return () => {
      cancelAnimationFrame(frame);
      strip.removeEventListener("scroll", onScroll);
      observador.disconnect();
    };
  }, []);

  function comportamiento() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth";
  }

  function centrar(indice: number) {
    cardRefs.current[indice]?.scrollIntoView({
      behavior: comportamiento(),
      inline: "center",
      block: "nearest",
    });
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLOListElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      centrar(Math.min(activo + 1, HERRAMIENTAS.length - 1));
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      centrar(Math.max(activo - 1, 0));
    }
  }

  // El swipe con el dedo lo hace el scroll nativo; aca solo se agrega el
  // arrastre con mouse, medido con clientX (movementX no esta en todos).
  function onPointerDown(event: React.PointerEvent<HTMLOListElement>) {
    if (event.pointerType === "touch" || event.button !== 0) return;
    arrastre.current = { activo: true, x: event.clientX, movido: 0 };
  }

  function onPointerMove(event: React.PointerEvent<HTMLOListElement>) {
    if (!arrastre.current.activo) return;
    const dx = event.clientX - arrastre.current.x;
    arrastre.current.movido += Math.abs(dx);
    arrastre.current.x = event.clientX;
    const strip = stripRef.current;
    if (strip) strip.scrollLeft -= dx;
  }

  function onPointerUp() {
    if (!arrastre.current.activo) return;
    arrastre.current.activo = false;
    centrar(activo);
  }

  // Un arrastre de verdad no debe navegar al soltar sobre una tarjeta.
  function onClickTarjeta(
    event: React.MouseEvent<HTMLAnchorElement>,
    indice: number
  ) {
    if (arrastre.current.movido > 8) {
      event.preventDefault();
      return;
    }
    if (indice !== activo) {
      event.preventDefault();
      centrar(indice);
    }
  }

  return (
    <section
      id="herramientas"
      aria-labelledby="herramientas-titulo"
      className="scroll-mt-24 border-b border-border/60 px-4 py-12 sm:px-6 sm:py-14"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal className="max-w-2xl">
          <p className="font-mono text-xs tracking-widest text-primary uppercase">
            Herramientas gratis
          </p>
          <h2
            id="herramientas-titulo"
            className="mt-2 text-2xl font-bold tracking-tight text-balance sm:text-3xl"
          >
            Elige por dónde empezar
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Mueve con el dedo, arrastra con el mouse o usa las flechas del
            teclado.
          </p>
        </Reveal>

        <ol
          ref={stripRef}
          tabIndex={0}
          aria-label="Herramientas gratis: arrastra para ver las cinco"
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className={cn(
            "mt-8 flex cursor-grab snap-x snap-mandatory gap-4 overflow-x-auto pb-2 outline-none active:cursor-grabbing",
            "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          )}
        >
          {HERRAMIENTAS.map((item, i) => (
            <li
              key={item.href}
              ref={(node) => {
                cardRefs.current[i] = node;
              }}
              className="flex shrink-0 basis-[80%] snap-center sm:basis-[52%] lg:basis-[36%]"
            >
              <a
                href={item.href}
                aria-current={i === activo ? "true" : undefined}
                onClick={(event) => onClickTarjeta(event, i)}
                className={cn(
                  "flex h-full w-full flex-col rounded-2xl border bg-card p-6 transition-all duration-200 motion-safe:ease-out motion-reduce:transition-none",
                  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
                  i === activo
                    ? "motion-safe:-rotate-[0.6deg] motion-safe:scale-[1.02] border-primary/45 shadow-lg"
                    : "border-border opacity-80 shadow-sm"
                )}
              >
                <p className="font-mono text-[10.5px] tracking-widest text-primary uppercase">
                  {item.eyebrow}
                </p>
                <h3 className="mt-3 font-display text-lg font-semibold text-balance">
                  {item.name}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground text-pretty">
                  {item.description}
                </p>
                <span className="mt-auto flex items-center gap-2 pt-5">
                  <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
                    {item.chip}
                  </span>
                  <span className="ml-auto font-mono text-sm text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ol>

        {/* Anuncia cual queda en el centro: sin esto, el arrastre no tiene
            retroalimentacion para un lector de pantalla. */}
        <p aria-live="polite" className="sr-only">
          Herramienta elegida: {herramienta.name}
        </p>

        <div className="mt-6 flex flex-col items-center gap-5">
          <div className="flex gap-2" aria-hidden="true">
            {HERRAMIENTAS.map((item, i) => (
              <span
                key={item.href}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-200 motion-reduce:transition-none",
                  i === activo ? "w-6 bg-primary" : "w-1.5 bg-border"
                )}
              />
            ))}
          </div>

          <a
            href={herramienta.href}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-7 py-3 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            {herramienta.ctaLabel}
            <ChevronRight />
          </a>
        </div>
      </div>
    </section>
  );
}

/** Flecha del CTA, dibujada con SVG (la convencion del sitio es no usar emoji). */
function ChevronRight() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
