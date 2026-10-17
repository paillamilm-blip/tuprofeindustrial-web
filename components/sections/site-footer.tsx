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
            TuProfeIndustrial · Clases particulares presenciales y online en Chile
          </p>
          <ul className="mt-1 flex items-center gap-1">
            <li>
              <a
                href="https://www.tiktok.com/@tuprofeindustrial"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok de TuProfeIndustrial (abre en una pestaña nueva)"
                className="inline-flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <TikTokIcon className="size-5" />
              </a>
            </li>
            <li>
              <a
                href="https://www.instagram.com/tuprofeindustrial"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram de TuProfeIndustrial (abre en una pestaña nueva)"
                className="inline-flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <InstagramIcon className="size-5" />
              </a>
            </li>
          </ul>
        </div>

        <nav aria-label="Enlaces del pie de página">
          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
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
                href="#calculadora"
                className="rounded transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Calculadora
              </a>
            </li>
            <li>
              <a
                href="#simulador-paes"
                className="rounded transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Simulador PAES
              </a>
            </li>
            <li>
              <a
                href="#ruta"
                className="rounded transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Ruta
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
                href="#metodo"
                className="rounded transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Mi método
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
        © {FOUNDING_YEAR} TuProfeIndustrial. Hecho en Chile.
      </p>
    </footer>
  );
}

/**
 * Glyph de TikTok como SVG inline: lucide-react no incluye un icono de TikTok,
 * así que se dibuja a mano con `currentColor` (hereda el color del enlace) y
 * se marca como decorativo (el nombre accesible lo aporta el aria-label del
 * enlace que lo envuelve).
 */
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M16.5 3h-2.9v12.1a2.5 2.5 0 1 1-2.1-2.47V9.7a5.5 5.5 0 1 0 5.1 5.48V8.9a6.3 6.3 0 0 0 3.7 1.2V7.2a3.5 3.5 0 0 1-2.1-.72A3.5 3.5 0 0 1 16.5 3Z" />
    </svg>
  );
}

/**
 * Glyph de Instagram como SVG inline: la versión instalada de lucide-react
 * (1.57) no exporta el icono Instagram, así que se dibuja a mano siguiendo el
 * trazo de lucide (contorno `currentColor`, sin relleno) y se marca como
 * decorativo; el nombre accesible lo aporta el aria-label del enlace.
 */
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}
