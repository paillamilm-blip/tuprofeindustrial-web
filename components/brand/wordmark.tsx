import { cn } from "@/lib/utils";

/**
 * Wordmark — the primary brand lockup for "TuProfeIndustrial".
 *
 * THE MARK (faithful recreation of the owner's logo, as inline SVG):
 *  - A GEAR / cog in brand teal (the primary token) evokes the "Industrial
 *    engineer" identity at a glance.
 *  - A dark, near-black outline/stroke (the foreground token) traces the gear
 *    and the inner circle so the mark stays crisp and legible on BOTH light and
 *    dark surfaces.
 *  - Inside the gear sits an interlocked "TP" monogram in white with a dark
 *    contour: the T and the P share a stem, reading as a single tied knot.
 *
 * It is a single inline <svg> with a TRANSPARENT background (no rect/background
 * fill) on a 0 0 48 48 viewBox, so it scales crisply from favicon size up and
 * inverts cleanly with no external image asset. All color comes from semantic
 * brand tokens (teal = primary via currentColor, dark = foreground, letters =
 * white) — no raw hex.
 *
 * SWAPPING FOR A REAL RASTER LOGO LATER (trivial, one small edit):
 *  1. Drop a background-free image at `public/logo.png` (square, e.g. 96x96+).
 *  2. At the top of this file add `import Image from "next/image";`.
 *  3. Replace `<WordmarkGlyph className="h-9 w-9 shrink-0" />` below with:
 *       <Image
 *         src="/logo.png"
 *         alt=""            // decorative: parent <span role="img"> names it
 *         width={36}
 *         height={36}
 *         className="h-9 w-9 shrink-0"
 *         priority
 *       />
 *     Keep `alt=""` so screen readers still announce the brand name only once
 *     via the parent lockup's aria-label (no double reading). The inline
 *     WordmarkGlyph can then be deleted.
 *
 * Accessibility: the whole lockup carries role="img" + aria-label so screen
 * readers announce "TuProfeIndustrial" once; the decorative glyph <svg> is
 * aria-hidden + focusable="false" and the visible text is also hidden from the
 * a11y tree to avoid a double reading.
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
      aria-label="TuProfeIndustrial"
      className={cn("inline-flex items-center gap-2.5 text-foreground", className)}
    >
      <WordmarkGlyph className="h-9 w-9 shrink-0" />
      {!markOnly && (
        <span
          aria-hidden="true"
          className="font-display text-lg leading-none font-bold tracking-tight sm:text-xl"
        >
          <span className="text-foreground">TuProfe</span>
          <span className="text-accent">Industrial</span>
        </span>
      )}
    </span>
  );
}

/**
 * The standalone glyph mark: a teal gear with a dark outline and an interlocked
 * white "TP" monogram. Decorative at the component boundary (the parent
 * Wordmark provides the accessible name), so it is aria-hidden here.
 *
 * Color is token-driven: the gear body is the brand primary (teal) via
 * `className="text-primary"` + `fill="currentColor"`; the outline uses the
 * foreground token so it holds a crisp dark contour on any surface; the letters
 * are white. No raw hex anywhere.
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
      {/* Gear (cog): a toothed wheel. Teal body + dark foreground outline. The
          12 teeth are a single rounded path so the mark stays legible small. */}
      <path
        d="M24 1.6l3.5 2.1 3.9-1 1.9 3.6 4 .3.3 4 3.6 1.9-1 3.9 2.1 3.5-2.1 3.5 1 3.9-3.6 1.9-.3 4-4 .3-1.9 3.6-3.9-1L24 46.4l-3.5-2.1-3.9 1-1.9-3.6-4-.3-.3-4-3.6-1.9 1-3.9L5.2 24l2.1-3.5-1-3.9 3.6-1.9.3-4 4-.3 1.9-3.6 3.9 1L24 1.6z"
        fill="currentColor"
        stroke="var(--color-foreground)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* Inner hub ring: a dark circle that frames the monogram. */}
      <circle
        cx="24"
        cy="24"
        r="13.5"
        fill="currentColor"
        stroke="var(--color-foreground)"
        strokeWidth="1.6"
      />
      {/* Interlocked TP monogram in white with a dark contour. The T crossbar
          and stem tie into the P bowl so they read as one knotted mark. */}
      <g
        stroke="var(--color-foreground)"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* T: crossbar + descending stem (stem shared with the P). */}
        <path
          className="fill-white"
          d="M15.5 17.5h11v2.6h-4.2v9.4h-2.6v-9.4h-4.2z"
        />
        {/* P: vertical stem + rounded bowl, interlocked to the right of the T. */}
        <path
          className="fill-white"
          d="M26.4 17.5h4.2a3.9 3.9 0 0 1 0 7.8h-1.6v5.2h-2.6V17.5zm2.6 2.5v2.9h1.5a1.45 1.45 0 0 0 0-2.9h-1.5z"
        />
      </g>
    </svg>
  );
}

export default Wordmark;
