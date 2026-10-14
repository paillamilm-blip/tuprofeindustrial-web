import { cn } from "@/lib/utils";

/**
 * Wordmark — the primary brand lockup for "Tu Profe Industrial".
 *
 * WHY this mark (obra-maestra, from scratch — the user has no logo):
 *  - A hexagonal outline evokes an engineering nut/bolt head and a technical
 *    gauge: "industrial engineer" at a glance.
 *  - Inside, a rising diagonal doubles as (a) a growth/progress slope — grades
 *    going up — and (b) the stroke that turns the mark into a stylised monogram.
 *  - The amber "node" at the top of the slope is the brand's warm spark of
 *    understanding, in deliberate tension with the teal mark.
 *  - The name is set in the display face (Sora); "Industrial" is tinted amber to
 *    mirror the mark and anchor the engineering identity.
 *
 * Everything is a single inline SVG + text using semantic brand tokens
 * (currentColor / token-driven classes), so it scales crisply and inverts
 * cleanly on light and dark backgrounds with no external image assets.
 *
 * Accessibility: the whole lockup carries role="img" + aria-label so screen
 * readers announce "Tu Profe Industrial" once; decorative glyph paths are
 * aria-hidden and the visible text is also hidden from the a11y tree to avoid a
 * double reading.
 */

type WordmarkProps = {
  /** Hide the text and render only the glyph mark (e.g. compact nav / favicon). */
  markOnly?: boolean;
  className?: string;
};

export function Wordmark({ markOnly = false, className }: WordmarkProps) {
  return (
    <span
      role="img"
      aria-label="Tu Profe Industrial"
      className={cn("inline-flex items-center gap-2.5 text-foreground", className)}
    >
      <WordmarkGlyph className="h-9 w-9 shrink-0" />
      {!markOnly && (
        <span
          aria-hidden="true"
          className="font-display text-lg leading-none font-bold tracking-tight sm:text-xl"
        >
          <span className="text-foreground">Tu Profe </span>
          <span className="text-accent">Industrial</span>
        </span>
      )}
    </span>
  );
}

/**
 * The standalone glyph mark. Decorative at the component boundary (the parent
 * Wordmark provides the accessible name), so it is aria-hidden here. The teal
 * uses the brand primary token via currentColor; the amber spark uses the accent
 * token directly so it holds its hue on any surface.
 */
function WordmarkGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={cn("text-primary", className)}
    >
      {/* Hexagonal engineering mark (nut / gauge). */}
      <path
        d="M24 3.5 42.3 14v20L24 44.5 5.7 34V14L24 3.5Z"
        stroke="currentColor"
        strokeWidth="2.75"
        strokeLinejoin="round"
      />
      {/* Rising slope = growth / grades going up, drawn in the same teal. */}
      <path
        d="M13.5 31.5 22 23l5.5 5.5L35 17"
        stroke="currentColor"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Warm amber spark at the top of the slope — the brand accent. */}
      <circle cx="35" cy="17" r="3.1" className="fill-accent" />
    </svg>
  );
}

export default Wordmark;
