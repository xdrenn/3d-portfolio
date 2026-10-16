import { useEffect, useRef } from "react";

const MEASURE_FONT_SIZE = 200;
/** Tiny safety margin so subpixel rounding can never push the last letter past the grid line. */
const FIT_SAFETY = 0.997;
const REFIT_DELAYS_MS = [400, 1800];
const LETTER_STAGGER_SECONDS = 0.04;

type InkBounds = { left: number; width: number };

let measureContext: CanvasRenderingContext2D | null = null;

/**
 * Measures the visible ink of the wordmark, not its layout box.
 * With tight negative letter-spacing the last glyph hangs past the box, and every glyph
 * has its own side bearing, so a box-based fit always spills over the grid line.
 * Each letter is its own inline-block, so there is no kerning between them: the advance
 * of every letter plus the letter-spacing gives the exact pen positions.
 */
function measureInk(heading: HTMLElement, text: string): InkBounds | null {
  measureContext ??= document.createElement("canvas").getContext("2d");
  const context = measureContext;
  if (!context || text.length === 0) return null;

  const style = getComputedStyle(heading);
  const letterSpacing = parseFloat(style.letterSpacing) || 0;
  context.font = `${style.fontStyle} ${style.fontWeight} ${MEASURE_FONT_SIZE}px ${style.fontFamily}`;

  let penX = 0;
  let inkLeft = Infinity;
  let inkRight = -Infinity;
  for (const letter of Array.from(text)) {
    const metrics = context.measureText(letter);
    if (!Number.isFinite(metrics.actualBoundingBoxLeft)) return null;
    inkLeft = Math.min(inkLeft, penX - metrics.actualBoundingBoxLeft);
    inkRight = Math.max(inkRight, penX + metrics.actualBoundingBoxRight);
    penX += metrics.width + letterSpacing;
  }

  const width = inkRight - inkLeft;
  return width > 0 ? { left: inkLeft, width } : null;
}

function fitToParentWidth(heading: HTMLElement, text: string) {
  heading.style.fontSize = `${MEASURE_FONT_SIZE}px`;
  heading.style.marginLeft = "0px";
  const availableWidth = heading.parentElement?.clientWidth ?? 0;
  if (availableWidth === 0) return;

  const ink = measureInk(heading, text);
  if (!ink) {
    // Fallback: fit the layout box.
    heading.style.fontSize = `${(MEASURE_FONT_SIZE * availableWidth * FIT_SAFETY) / heading.scrollWidth}px`;
    return;
  }

  const scale = (availableWidth * FIT_SAFETY) / ink.width;
  heading.style.fontSize = `${MEASURE_FONT_SIZE * scale}px`;
  // Shift so the first letter's ink, not its side bearing, sits on the left grid line.
  heading.style.marginLeft = `${-ink.left * scale}px`;
}

function revealPage() {
  requestAnimationFrame(() => document.body.classList.replace("is-loading", "is-loaded"));
}

export function Wordmark({ text }: { text: string }) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const heading = headingRef.current;
    if (!heading) return;

    let disposed = false;
    const fit = () => fitToParentWidth(heading, text);

    document.fonts.ready.then(() => {
      if (disposed) return;
      fit();
      revealPage();
    });

    const timeouts = REFIT_DELAYS_MS.map((delay) => window.setTimeout(fit, delay));
    window.addEventListener("resize", fit);
    window.addEventListener("load", fit);

    return () => {
      disposed = true;
      timeouts.forEach(clearTimeout);
      window.removeEventListener("resize", fit);
      window.removeEventListener("load", fit);
    };
  }, [text]);

  return (
    <h1 className="wordmark" ref={headingRef} aria-label={text}>
      {Array.from(text, (letter, position) => (
        <span
          key={position}
          className="wordmark__letter"
          aria-hidden="true"
          style={{ transitionDelay: `${position * LETTER_STAGGER_SECONDS}s` }}
        >
          {letter}
        </span>
      ))}
    </h1>
  );
}
