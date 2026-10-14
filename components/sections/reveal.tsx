"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Reveal — una entrada sutil al hacer scroll (obra-maestra: motion con
 * intencion, 150-300ms). Usa IntersectionObserver para animar una sola vez
 * cuando la seccion entra en viewport.
 *
 * WHY: el movimiento ayuda a jerarquizar la lectura de la landing sin caer en
 * loops infinitos. Respeta `prefers-reduced-motion`: si el usuario lo pide,
 * el contenido aparece de inmediato, sin transicion (ver globals/motion-safe).
 */
export function Reveal({
  children,
  className,
  as: Tag = "div",
  delayMs = 0,
}: {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
  delayMs?: number;
}) {
  const ref = React.useRef<HTMLElement | null>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Si no hay soporte o el usuario prefiere menos movimiento, mostramos ya.
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced || typeof IntersectionObserver === "undefined") {
      // Se agenda fuera del cuerpo del efecto para no disparar renders en
      // cascada (regla react-hooks/set-state-in-effect).
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
      className={cn(
        "motion-safe:transition-all motion-safe:duration-500 motion-safe:ease-out",
        visible
          ? "opacity-100 translate-y-0"
          : "motion-safe:opacity-0 motion-safe:translate-y-4",
        className
      )}
    >
      {children}
    </Tag>
  );
}
