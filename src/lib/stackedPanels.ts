import { clamp } from "./math";

/**
 * Sheets that stack. Each .panel sticks once its bottom edge reaches the bottom of the
 * screen (so tall sections are read in full first), then the next sheet slides over it.
 * Sets two CSS variables per panel:
 *   --panel-top  the sticky offset: 0 for short sheets, negative for tall ones
 *   --covered    0..1, how much of the screen the next sheet already covers
 */
export function startStackedPanels(container: HTMLElement) {
  const panels = () => Array.from(container.querySelectorAll<HTMLElement>(":scope > .panel"));
  let frame = 0;

  const measure = () => {
    const viewport = window.innerHeight;
    panels().forEach((panel) => {
      panel.style.setProperty("--panel-top", `${Math.min(0, viewport - panel.offsetHeight)}px`);
    });
    update();
  };

  const update = () => {
    frame = 0;
    const viewport = window.innerHeight;
    const list = panels();
    list.forEach((panel, index) => {
      const next = list[index + 1];
      const covered = next ? clamp((viewport - next.getBoundingClientRect().top) / viewport, 0, 1) : 0;
      panel.style.setProperty("--covered", covered.toFixed(3));
    });
  };

  const onScroll = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  const resizeObserver = new ResizeObserver(measure);
  panels().forEach((panel) => resizeObserver.observe(panel));
  window.addEventListener("resize", measure);
  window.addEventListener("scroll", onScroll, { passive: true });
  measure();

  return () => {
    cancelAnimationFrame(frame);
    resizeObserver.disconnect();
    window.removeEventListener("resize", measure);
    window.removeEventListener("scroll", onScroll);
  };
}
