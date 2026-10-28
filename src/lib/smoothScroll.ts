/**
 * Inertial page scroll. The wheel moves a target; the page eases towards it every frame,
 * so a flick keeps gliding and settles slowly, the way a heavy sheet of paper would.
 *
 * Touch scrolling stays native (phones already have inertia), and so does anything with
 * its own scroll box (the case study, windows inside the computer) or reduced motion.
 * No dependencies: about what Lenis does, for this one page.
 */

/** Share of the remaining distance covered per 60 fps frame. Lower feels heavier. */
const EASE_PER_FRAME = 0.072;
const WHEEL_MULTIPLIER = 1;
const LINE_HEIGHT_PX = 16;
const SETTLE_DISTANCE_PX = 0.4;

type ScrollToOptions = {
  /** Pixels to keep above the target, for the fixed nav bar. */
  offset?: number;
  /** Seconds. Defaults to a duration that grows with distance. */
  duration?: number;
  immediate?: boolean;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;

/** Slow start, long slow landing: reads as weight rather than speed. */
const easeHeavy = (t: number) => (t < 0.5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2);

let enabled = false;
let target = 0;
let current = 0;
let frame = 0;
let lastTime = 0;
let tween: { from: number; to: number; start: number; duration: number } | null = null;

const isLocked = () =>
  document.body.style.overflow === "hidden" || document.documentElement.dataset.scrollLock === "true";

/** Does something between the pointer and the page want this wheel event for itself? */
function hasOwnScroll(start: EventTarget | null, deltaY: number) {
  let node = start instanceof Element ? start : null;
  while (node && node !== document.body && node !== document.documentElement) {
    if (node instanceof HTMLElement) {
      if (node.dataset.smoothScroll === "off") return true;
      const { overflowY } = getComputedStyle(node);
      if ((overflowY === "auto" || overflowY === "scroll") && node.scrollHeight > node.clientHeight + 1) {
        const canScrollDown = node.scrollTop + node.clientHeight < node.scrollHeight - 1;
        const canScrollUp = node.scrollTop > 0;
        if ((deltaY > 0 && canScrollDown) || (deltaY < 0 && canScrollUp)) return true;
      }
    }
    node = node.parentElement;
  }
  return false;
}

function render(time: number) {
  const elapsed = lastTime ? Math.min(time - lastTime, 64) : 16.67;
  lastTime = time;

  if (tween) {
    const progress = clamp((time - tween.start) / (tween.duration * 1000), 0, 1);
    current = tween.from + (tween.to - tween.from) * easeHeavy(progress);
    target = current;
    if (progress >= 1) tween = null;
  } else {
    const ease = 1 - Math.pow(1 - EASE_PER_FRAME, elapsed / 16.67);
    current += (target - current) * ease;
    if (Math.abs(target - current) < SETTLE_DISTANCE_PX) current = target;
  }

  window.scrollTo(0, current);

  if (tween || current !== target) {
    frame = requestAnimationFrame(render);
  } else {
    frame = 0;
    lastTime = 0;
  }
}

function run() {
  if (!frame) frame = requestAnimationFrame(render);
}

function stop() {
  cancelAnimationFrame(frame);
  frame = 0;
  lastTime = 0;
  tween = null;
}

function onWheel(event: WheelEvent) {
  if (event.ctrlKey || isLocked()) return;
  if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
  if (hasOwnScroll(event.target, event.deltaY)) return;

  event.preventDefault();
  const unit = event.deltaMode === 1 ? LINE_HEIGHT_PX : event.deltaMode === 2 ? window.innerHeight : 1;
  if (!frame) current = target = window.scrollY;
  tween = null;
  target = clamp(target + event.deltaY * unit * WHEEL_MULTIPLIER, 0, maxScroll());
  run();
}

/** Keyboard, scrollbar, find-in-page: when the page moves without us, follow it. */
function onNativeScroll() {
  if (frame) {
    if (Math.abs(window.scrollY - Math.round(current)) > 2 && !tween) stop();
    else return;
  }
  current = target = window.scrollY;
}

function onResize() {
  target = clamp(target, 0, maxScroll());
}

/** In-page links (#about, back to top) glide instead of jumping. */
function onClick(event: MouseEvent) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
  const link = (event.target as Element | null)?.closest?.("a[href^='#']");
  if (!(link instanceof HTMLAnchorElement)) return;
  const id = decodeURIComponent(link.hash.slice(1));
  const destination = id ? document.getElementById(id) : null;
  if (!destination) return;
  event.preventDefault();
  scrollToElement(destination);
}

/**
 * Where an element sits in the document, even when it, or the sheet it lives on,
 * is currently stuck in place (getBoundingClientRect would report the stuck position).
 */
export function documentTop(element: Element) {
  const panel = element.closest<HTMLElement>(".panel");
  if (!panel) return element.getBoundingClientRect().top + window.scrollY;

  let top = panel.parentElement ? panel.parentElement.getBoundingClientRect().top + window.scrollY : 0;
  let sibling = panel.parentElement?.firstElementChild as HTMLElement | null;
  while (sibling && sibling !== panel) {
    top += sibling.offsetHeight;
    sibling = sibling.nextElementSibling as HTMLElement | null;
  }
  return top + (element.getBoundingClientRect().top - panel.getBoundingClientRect().top);
}

export function scrollToY(y: number, { duration, immediate }: ScrollToOptions = {}) {
  const to = clamp(y, 0, maxScroll());
  if (!enabled || immediate) {
    stop();
    current = target = to;
    window.scrollTo(0, to);
    return;
  }
  const from = window.scrollY;
  const distance = Math.abs(to - from);
  const seconds = duration ?? clamp(0.9 + distance / 4000, 0.9, 2);
  current = from;
  tween = { from, to, start: performance.now(), duration: seconds };
  lastTime = 0;
  run();
}

export function scrollToElement(element: Element | null | undefined, options: ScrollToOptions & { block?: "start" | "center" | "end" } = {}) {
  if (!element) return;
  const navHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-height")) || 0;
  const top = documentTop(element);
  const height = element.getBoundingClientRect().height;
  const block = options.block ?? "start";
  const y =
    block === "center"
      ? top - (window.innerHeight - height) / 2
      : block === "end"
        ? top + height - window.innerHeight
        : top - (options.offset ?? navHeight);
  scrollToY(y, options);
}

/** Starts the inertial scroll. Returns a cleanup function. */
export function startSmoothScroll() {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  current = target = window.scrollY;

  window.addEventListener("scroll", onNativeScroll, { passive: true });
  window.addEventListener("resize", onResize);
  document.addEventListener("click", onClick);

  enabled = !reducedMotion;
  if (enabled && finePointer) window.addEventListener("wheel", onWheel, { passive: false });

  return () => {
    stop();
    enabled = false;
    window.removeEventListener("wheel", onWheel);
    window.removeEventListener("scroll", onNativeScroll);
    window.removeEventListener("resize", onResize);
    document.removeEventListener("click", onClick);
  };
}
