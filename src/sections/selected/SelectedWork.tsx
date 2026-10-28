import { useEffect, useRef, useState, type PointerEvent } from "react";
import { formatCategories, PROJECTS, projectRole } from "@/content/projects";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { SectionHead } from "@/layout/SectionHead";
import { ELEMENT_IDS } from "@/lib/elementIds";
import { clamp } from "@/lib/math";
import { projectImageUrl } from "@/lib/mediaPaths";
import { scrollToElement } from "@/lib/scroll";
import { usePortfolio } from "@/state/PortfolioContext";
import "./selected.css";

/** How far (in px) a title drifts sideways while it crosses the viewport. */
const TITLE_DRIFT_PX = 70;
/** 0..1, how quickly the floating preview catches up with the pointer. */
const PREVIEW_EASING = 0.14;
const PREVIEW_MAX_TILT_DEG = 9;
/** Until a cover has loaded we assume the old 4:3. */
const DEFAULT_COVER_RATIO = 4 / 3;
/** The frame follows each cover's shape, within these limits (width / height). */
const MIN_COVER_RATIO = 0.66;
const MAX_COVER_RATIO = 1.75;

/**
 * Frame size for a cover: the same area for every project, shaped like the picture,
 * so a portrait poster stands up and a wide site screenshot lies down.
 */
function previewSize(ratio: number) {
  const side = clamp(window.innerWidth * 0.22, 230, 350);
  const shape = Math.sqrt(clamp(ratio, MIN_COVER_RATIO, MAX_COVER_RATIO));
  return { width: Math.round(side * shape), height: Math.round(side / shape) };
}

const canHover = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/**
 * The work, readable without touching the computer: one oversized title per project.
 * Two quiet motions only: titles drift sideways with scroll (alternating directions),
 * and on hover the cover follows the pointer with a little lag and tilt.
 */
export function SelectedWork() {
  const { openCase } = usePortfolio();
  const reducedMotion = usePrefersReducedMotion();
  const listRef = useRef<HTMLOListElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const pointer = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const frame = useRef<number>();
  const coverRatios = useRef<number[]>([]);

  const fitPreviewTo = (index: number | null) => {
    const preview = previewRef.current;
    if (!preview || index === null) return;
    const image = preview.querySelectorAll("img")[index];
    if (coverRatios.current[index] === undefined && image?.naturalWidth) {
      coverRatios.current[index] = image.naturalWidth / image.naturalHeight;
    }
    const { width, height } = previewSize(coverRatios.current[index] ?? DEFAULT_COVER_RATIO);
    preview.style.setProperty("--preview-width", `${width}px`);
    preview.style.setProperty("--preview-height", `${height}px`);
  };

  useEffect(() => fitPreviewTo(hoveredIndex), [hoveredIndex]);

  // Scroll parallax on the titles.
  useEffect(() => {
    // On narrow screens the titles wrap to the full width, so drifting would push them off-screen.
    if (reducedMotion || window.matchMedia("(max-width: 860px)").matches) return;
    const list = listRef.current;
    if (!list) return;
    const rows: HTMLElement[] = Array.from(list.querySelectorAll<HTMLElement>(".selected__row"));
    let requested = false;

    const update = () => {
      requested = false;
      const viewportCenter = window.innerHeight / 2;
      rows.forEach((row, index) => {
        const bounds = row.getBoundingClientRect();
        const distance = clamp((bounds.top + bounds.height / 2 - viewportCenter) / window.innerHeight, -1, 1);
        const direction = index % 2 === 0 ? 1 : -1;
        row.style.setProperty("--drift", `${(distance * TITLE_DRIFT_PX * direction).toFixed(1)}px`);
      });
    };

    const onScroll = () => {
      if (requested) return;
      requested = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reducedMotion]);

  // The floating cover eases towards the pointer and tilts with its speed.
  useEffect(() => {
    if (hoveredIndex === null || reducedMotion) return;

    const tick = () => {
      const preview = previewRef.current;
      if (preview) {
        const dx = pointer.current.x - current.current.x;
        const dy = pointer.current.y - current.current.y;
        current.current.x += dx * PREVIEW_EASING;
        current.current.y += dy * PREVIEW_EASING;
        const tilt = clamp(dx * 0.08, -PREVIEW_MAX_TILT_DEG, PREVIEW_MAX_TILT_DEG);
        preview.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0) translate(-50%, -50%) rotate(${tilt.toFixed(2)}deg)`;
      }
      frame.current = requestAnimationFrame(tick);
    };

    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current!);
  }, [hoveredIndex, reducedMotion]);

  const trackPointer = (event: PointerEvent) => {
    pointer.current = { x: event.clientX, y: event.clientY };
  };

  const enterRow = (index: number, event: PointerEvent) => {
    if (!canHover()) return;
    if (hoveredIndex === null) {
      // Start the preview right under the pointer instead of flying in from a corner.
      current.current = { x: event.clientX, y: event.clientY };
    }
    trackPointer(event);
    setHoveredIndex(index);
  };

  const showDesktop = () =>
    scrollToElement(document.getElementById(ELEMENT_IDS.work), { reducedMotion, block: "center" });

  return (
    <section id={ELEMENT_IDS.selectedWork} className="selected panel tone-graphite page-padding">
      <SectionHead title="Work">Real clients and concepts, each one designed and built by me.</SectionHead>

      <ol className="selected__list" ref={listRef} onPointerMove={trackPointer} onPointerLeave={() => setHoveredIndex(null)}>
        {PROJECTS.map((project, index) => (
          <li key={project.title} className={`selected__row${hoveredIndex === index ? " is-hovered" : ""}`}>
            <button
              className="selected__button grid"
              onClick={() => openCase(index)}
              onPointerEnter={(event) => enterRow(index, event)}
              aria-label={`Open the ${project.title} case`}
            >
              <span className="selected__title">{project.title}</span>
              <span className="selected__meta text-small">
                <span>{formatCategories(project)}</span>
                <span className="selected__role">{projectRole(project)}</span>
              </span>
            </button>
          </li>
        ))}
      </ol>

      <div className="selected__after grid">
        <button className="selected__desktop-link hover-italic" onClick={showDesktop}>
          Or open them like files on my desktop
        </button>
      </div>

      <div
        className={`selected__preview${hoveredIndex !== null ? " is-visible" : ""}`}
        ref={previewRef}
        aria-hidden="true"
      >
        {PROJECTS.map((project, index) => (
          <img
            key={project.title}
            src={projectImageUrl(project.cover)}
            alt=""
            decoding="async"
            className={index === hoveredIndex ? "is-current" : ""}
            onLoad={(event) => {
              const image = event.currentTarget;
              coverRatios.current[index] = image.naturalWidth / image.naturalHeight;
              if (index === hoveredIndex) fitPreviewTo(index);
            }}
          />
        ))}
      </div>
    </section>
  );
}
