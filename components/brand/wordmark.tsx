import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * Wordmark — the primary brand lockup for "TuProfeIndustrial".
 *
 * THE MARK (the owner's real logo, as a raster image):
 *  - Renders the owner-supplied PNG at `public/logo.png` via `next/image`.
 *  - The asset is background-free (transparent RGBA), roughly square
 *    (1024x1008), so it sits crisply inside the 36x36 (`h-9 w-9`) box on both
 *    light and dark surfaces with no extra styling.
 *  - `priority` is kept because the lockup renders in the header (above the
 *    fold), so the logo should not be lazy-loaded.
 *  - `/logo.png` is a local asset served from `public/`, so it needs no remote
 *    image domain configuration in `next.config.ts`.
 *
 * REVERTING TO A HAND-DRAWN SVG GLYPH (if ever needed): reintroduce a small
 * inline <svg> component (aria-hidden + focusable="false", token-driven color)
 * and swap the <Image> below for it. The parent lockup already provides the
 * accessible name, so any glyph must stay decorative.
 *
 * Accessibility: the whole lockup carries role="img" + aria-label so screen
 * readers announce "TuProfeIndustrial" once; the logo <Image> is decorative
 * (alt="") and the visible text is also hidden from the a11y tree to avoid a
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
      aria-label="TuProfeIndustrial"
      className={cn("inline-flex items-center gap-2.5 text-foreground", className)}
    >
      <Image
        src="/logo.png"
        alt=""
        width={36}
        height={36}
        className="h-9 w-9 shrink-0"
        priority
      />
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

export default Wordmark;

