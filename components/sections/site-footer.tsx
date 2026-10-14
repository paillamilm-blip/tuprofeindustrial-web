import { Wordmark } from "@/components/brand/wordmark";

/**
 * SiteFooter — pie con el wordmark, la línea de identidad y navegación
 * secundaria por anclas. Cierra la página de forma profesional.
 */
/**
 * Año fijo del copyright. Se mantiene estático a propósito para que la página
 * siga siendo totalmente prerenderizable (Next.js 16 no permite `new Date()`
 * en prerender). Actualízalo manualmente cuando corresponda.
 */
const FOUNDING_YEAR = 2026;

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-background px-4 py-10 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <Wordmark />
          <p className="text-sm text-muted-foreground">
            Tu Profe Industrial · Clases particulares online en Chile
          </p>
        </div>

        <nav aria-label="Enlaces del pie de página">
          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <li>
              <a
                href="#calculadora"
                className="rounded transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Calculadora
              </a>
            </li>
            <li>
              <a
                href="#diagnostico"
                className="rounded transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Diagnóstico
              </a>
            </li>
            <li>
              <a
                href="#servicios"
                className="rounded transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Servicios
              </a>
            </li>
            <li>
              <a
                href="#asesorias"
                className="rounded transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Asesorías
              </a>
            </li>
            <li>
              <a
                href="#profe"
                className="rounded transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Tu profe
              </a>
            </li>
            <li>
              <a
                href="#faq"
                className="rounded transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Preguntas
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <p className="mx-auto mt-8 max-w-6xl text-center text-xs text-muted-foreground sm:text-left">
        © {FOUNDING_YEAR} Tu Profe Industrial. Hecho en Chile.
      </p>
    </footer>
  );
}
