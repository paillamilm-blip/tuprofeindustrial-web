"use client";

import * as React from "react";

import { Wordmark } from "@/components/brand/wordmark";
import { WhatsAppCta } from "@/components/whatsapp-cta";
import { cn } from "@/lib/utils";

/**
 * Enlaces de navegacion ancla. El orden sigue el recorrido de la landing para
 * que el salto por teclado sea predecible.
 */
const NAV_LINKS = [
  { href: "#calculadora", label: "Calculadora" },
  { href: "#servicios", label: "Servicios" },
  { href: "#profe", label: "Tu profe" },
  { href: "#testimonios", label: "Resultados" },
  { href: "#faq", label: "Preguntas" },
] as const;

const HEADER_MESSAGE =
  "Hola! Vengo de la web de Tu Profe Industrial y quiero agendar una clase. Me ayudas?";

/**
 * SiteHeader — cabecera sticky accesible con wordmark, navegacion ancla y un
 * CTA compacto de WhatsApp. Incluye skip-link para teclado y lectores de
 * pantalla, y reserva su propia altura (h-16/h-20) para evitar layout shift.
 */
export function SiteHeader() {
  const [open, setOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      {/* Skip link: primer elemento enfocable, visible solo al tabular. */}
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
      >
        Saltar al contenido
      </a>

      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-20 sm:px-6">
        <a
          href="#inicio"
          className="flex items-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          aria-label="Tu Profe Industrial — ir al inicio"
        >
          <Wordmark />
        </a>

        {/* Navegacion de escritorio */}
        <nav
          aria-label="Secciones del sitio"
          className="hidden items-center gap-1 md:flex"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* CTA compacto reutilizando el componente oficial (verde WhatsApp). */}
          <WhatsAppCta
            message={HEADER_MESSAGE}
            label="Escríbeme"
            className="hidden px-4 py-2.5 text-sm sm:inline-flex"
          />

          {/* Boton de menu en mobile */}
          <button
            type="button"
            aria-expanded={open}
            aria-controls="menu-movil"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex size-11 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:hidden"
          >
            <span className="sr-only">
              {open ? "Cerrar menú" : "Abrir menú"}
            </span>
            <Hamburger open={open} />
          </button>
        </div>
      </div>

      {/* Panel de navegacion en mobile */}
      <div
        id="menu-movil"
        hidden={!open}
        className="border-t border-border/70 bg-background md:hidden"
      >
        <nav aria-label="Secciones del sitio" className="mx-auto max-w-6xl px-4 py-3">
          <ul className="flex flex-col">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center rounded-md px-3 text-base font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}

/** Icono hamburguesa/cerrar dibujado con dos trazos (no emoji). */
function Hamburger({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className="size-6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line
        x1="4"
        y1="7"
        x2="20"
        y2="7"
        className={cn(
          "origin-center transition-transform duration-200 motion-reduce:transition-none",
          open && "translate-y-[5px] rotate-45"
        )}
      />
      <line
        x1="4"
        y1="17"
        x2="20"
        y2="17"
        className={cn(
          "origin-center transition-transform duration-200 motion-reduce:transition-none",
          open && "-translate-y-[5px] -rotate-45"
        )}
      />
    </svg>
  );
}
