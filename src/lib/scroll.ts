import { scrollToElement as glideTo } from "./smoothScroll";

/** Kept for the existing callers; now glides with the page's own inertial scroll. */
export function scrollToElement(
  element: Element | null | undefined,
  { reducedMotion, block }: { reducedMotion: boolean; block: "start" | "center" | "end" },
) {
  glideTo(element, { block, immediate: reducedMotion });
}
