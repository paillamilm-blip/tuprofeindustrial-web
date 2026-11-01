"use client";

import * as React from "react";

import { Reveal } from "@/components/sections/reveal";
import { cn } from "@/lib/utils";

type Herramienta = {
  /** Id de la seccion (su ancla de siempre) sin el "#". */
  key: string;
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
 * clave es el id de su seccion, que sigue viviendo en components/sections/.
 */
const HERRAMIENTAS: readonly Herramienta[] = [
  {
    key: "diagnostico",
    eyebrow: "Diagnóstico en 1 minuto",
    name: "¿Qué plan necesitas?",
    description:
      "Cinco preguntas y sales con el plan claro: clases personalizadas, Intensivo PAES o Nivelación, a domicilio en Santiago u online.",
    chip: "gratis",
    ctaLabel: "Hacer el diagnóstico",
  },
  {
    key: "calculadora",
    eyebrow: "Herramienta gratis",
    name: "Calculadora de notas chilena",
    description:
      "Tu promedio ponderado y la nota exacta que necesitas en la evaluación que queda para llegar a tu meta.",
    chip: "gratis",
    ctaLabel: "Abrir la calculadora de notas",
  },
  {
    key: "simulador-paes",
    eyebrow: "Proyecta tu puntaje",
    name: "Calculadora de puntaje PAES",
    description:
      "Cuánto tienes hoy, dónde quieres llegar y cuántos puntos te faltan, con el plan que te acerca a la meta.",
    chip: "gratis",
    ctaLabel: "Proyectar mi puntaje",
  },
  {
    key: "simulacro-m1",
    eyebrow: "Descarga libre",
    name: "Simulacro PAES M1 con solucionario",
    description:
      "20 ítems en el formato real de la prueba, sin calculadora, con la cuenta de cada ítem y la trampa de cada distractor.",
    chip: "PDF gratis",
    ctaLabel: "Bajar el simulacro M1",
  },
  {
    key: "ruta",
    eyebrow: "Tu camino, paso a paso",
    name: "Ruta de aprendizaje",
    description:
      "Desde 1° medio hasta el último año de Ingeniería: eliges dónde estás y hasta dónde quieres llegar, y ves cada etapa.",
    chip: "gratis",
    ctaLabel: "Ver mi ruta",
  },
] as const;

/** Respeta prefers-reduced-motion: sin esa preferencia, todo es suavecito. */
function comportamiento(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";
}

/**
 * HerramientasCarrusel — tablero que decide que herramienta se usa.
 *
 * WHY: con las cinco secciones siempre visibles, el alumno bajaba cinco
 * bloques largos para llegar a la unica que le interesaba. Aqui el tablero
 * manda: se pincha una tarjeta y esa es la unica herramienta que queda abajo;
 * las otras cuatro salen del scroll.
 *
 * Dos reglas de diseno:
 *  - Se abre lo que se PINCHA, no lo que queda en el centro: arrastrar el
 *    tablero para mirar no cambia la herramienta en uso.
 *  - El servidor entrega las cinco secciones completas y este cliente solo las
 *    oculta en un layout effect (antes del primer paint, asi no se ve el
 *    salto). Sin JavaScript, y para un crawler, la landing sigue siendo la
 *    pagina larga de siempre: el SEO y anclas como #simulacro-m1 no dependen
 *    de este interruptor.
 *
 * Accessibilidad: cada tarjeta es un boton real con aria-pressed, las flechas
 * del teclado recorren las cinco y el cambio se anuncia por aria-live. Los
 * enlaces directos (menu, footer, video, PDF) abren su herramienta sola.
 */
export function HerramientasCarrusel({
  children,
}: {
  children: React.ReactNode;
}) {
  const stripRef = React.useRef<HTMLOListElement | null>(null);
  const cardRefs = React.useRef<(HTMLLIElement | null)[]>([]);
  const panelRef = React.useRef<HTMLDivElement | null>(null);

  // Arrastre con mouse: punto de partida y distancia recorrida, para saber si
  // un click es intencion o el resto de un arrastre.
  const arrastre = React.useRef({ activo: false, x: 0, movido: 0 });

  const [abierta, setAbierta] = React.useState(HERRAMIENTAS[0].key);
  // Valor actual leible desde listeners que no se reinstalan.
  const abiertaRef = React.useRef(abierta);
  // setAbierta con el mismo valor no re-renderiza: se guarda la intencion de
  // acercar el panel para no perder el scroll pedido en ese caso.
  const acercarPendiente = React.useRef<ScrollBehavior | null>(null);

  const indice = Math.max(
    0,
    HERRAMIENTAS.findIndex((item) => item.key === abierta)
  );
  const herramienta = HERRAMIENTAS[indice];

  // Unica dueña de la visibilidad de las secciones: mostrar/ocultar antes del
  // paint para que elegir no se sienta como un salto de página.
  React.useLayoutEffect(() => {
    abiertaRef.current = abierta;
    const panel = panelRef.current;
    if (!panel) return;

    for (const seccion of Array.from(
      panel.querySelectorAll<HTMLElement>("[data-tool]")
    )) {
      if (seccion.dataset.tool === abierta) {
        seccion.removeAttribute("hidden");
      } else {
        seccion.setAttribute("hidden", "");
      }
    }

    const pedir = acercarPendiente.current;
    if (pedir) {
      acercarPendiente.current = null;
      panel
        .querySelector<HTMLElement>(`[data-tool="${abierta}"]`)
        ?.scrollIntoView({ behavior: pedir, block: "start" });
    }
  }, [abierta]);

  function acercaAlPanel(clave: string) {
    document
      .querySelector<HTMLElement>(`[data-tool="${clave}"]`)
      ?.scrollIntoView({ behavior: comportamiento(), block: "start" });
  }

  /** Pinchar una tarjeta: esa herramienta queda abierta y la página la acerca. */
  function abrir(clave: string, tarjeta: number) {
    cardRefs.current[tarjeta]?.scrollIntoView({
      behavior: comportamiento(),
      inline: "center",
      block: "nearest",
    });

    if (clave === abiertaRef.current) {
      acercaAlPanel(clave);
      return;
    }
    acercarPendiente.current = comportamiento();
    setAbierta(clave);
    // Refrescar el enlace no navega, pero hace que al recargar siga abierta la
    // misma herramienta (y que copiar la URL sirva para compartirla).
    window.history.replaceState(null, "", `#${clave}`);
  }

  // Los enlaces directos valen igual que pinchar la tarjeta: el menu, el
  // footer, un video o el PDF pueden apuntar a #simulacro-m1 y esa herramienta
  // es la que se abre.
  React.useEffect(() => {
    function claveDelHash(): string | null {
      // Sin decodificar: las claves son ASCII puro, y decodeURIComponent revienta
      // con un hash mal formado escrito a mano en la barra de direcciones.
      const limpia = window.location.hash.replace(/^#/, "");
      return HERRAMIENTAS.some((item) => item.key === limpia) ? limpia : null;
    }

    const inicial = claveDelHash();
    if (inicial && inicial !== abiertaRef.current) {
      // El navegador ya se posiciono con las cinco secciones visibles; al
      // ocultar cuatro la pagina se recorta y ese punto queda en otro lado.
      // Aca el acercamiento es instantaneo: no es una animacion desde un
      // lugar equivocado, es corregir la posicion.
      acercarPendiente.current = "auto";
      setAbierta(inicial);
    }

    function onHashChange() {
      const clave = claveDelHash();
      if (!clave) return;
      if (clave === abiertaRef.current) {
        acercaAlPanel(clave);
        return;
      }
      acercarPendiente.current = comportamiento();
      setAbierta(clave);
    }

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  function onKeyDown(event: React.KeyboardEvent<HTMLOListElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      const siguiente = Math.min(indice + 1, HERRAMIENTAS.length - 1);
      abrir(HERRAMIENTAS[siguiente].key, siguiente);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      const anterior = Math.max(indice - 1, 0);
      abrir(HERRAMIENTAS[anterior].key, anterior);
    }
  }

  // El swipe con el dedo lo hace el scroll nativo; aca solo se agrega el
  // arrastre con mouse, medido con clientX (movementX no esta en todos).
  // El contador se reinicia en TODO pointerdown, tambien en el del dedo: si
  // no, la distancia del ultimo arrastre con mouse bloquearia el toque siguiente.
  function onPointerDown(event: React.PointerEvent<HTMLOListElement>) {
    const arrastra = event.pointerType !== "touch" && event.button === 0;
    arrastre.current = { activo: arrastra, x: event.clientX, movido: 0 };
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
    arrastre.current.activo = false;
  }

  // Un arrastre de verdad no debe abrir una herramienta por accidente.
  function onClickTarjeta(
    event: React.MouseEvent<HTMLButtonElement>,
    tarjeta: number
  ) {
    event.preventDefault();
    if (arrastre.current.movido > 8) return;
    abrir(HERRAMIENTAS[tarjeta].key, tarjeta);
  }

  return (
    <>
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
              Toca la herramienta que quieras usar: queda abierta aquí abajo y
              las demás no te estorban. Mueve el tablero con el dedo, arrástralo
              con el mouse o usa las flechas del teclado.
            </p>
          </Reveal>

          <ol
            ref={stripRef}
            tabIndex={0}
            aria-label="Herramientas gratis: elige una para abrir"
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
                key={item.key}
                ref={(node) => {
                  cardRefs.current[i] = node;
                }}
                className="flex shrink-0 basis-[80%] snap-center sm:basis-[52%] lg:basis-[36%]"
              >
                <button
                  type="button"
                  aria-pressed={i === indice}
                  onClick={(event) => onClickTarjeta(event, i)}
                  className={cn(
                    "flex h-full w-full flex-col rounded-2xl border bg-card p-6 text-left transition-all duration-200 motion-safe:ease-out motion-reduce:transition-none",
                    "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
                    i === indice
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
                    {i === indice ? (
                      <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
                        Abierta
                      </span>
                    ) : null}
                    <span className="ml-auto font-mono text-sm text-muted-foreground">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ol>

          {/* Anuncia cual se abrio: sin esto, el cambio de panel es mudo para
              un lector de pantalla. */}
          <p aria-live="polite" className="sr-only">
            Herramienta abierta: {herramienta.name}
          </p>

          <div className="mt-6 flex flex-col items-center gap-5">
            <div className="flex gap-2" aria-hidden="true">
              {HERRAMIENTAS.map((item, i) => (
                <span
                  key={item.key}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-200 motion-reduce:transition-none",
                    i === indice ? "w-6 bg-primary" : "w-1.5 bg-border"
                  )}
                />
              ))}
            </div>

            <a
              href={`#${herramienta.key}`}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-7 py-3 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              {herramienta.ctaLabel}
              <ChevronRight />
            </a>
          </div>
        </div>
      </section>

      {/* Las cinco herramientas: solo la abierta se muestra. */}
      <div ref={panelRef}>{children}</div>
    </>
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
