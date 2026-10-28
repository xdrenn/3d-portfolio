import { forwardRef, useImperativeHandle, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { Canvas } from "@react-three/fiber";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { BUSINESS_CARD } from "@/content/site";
import { ELEMENT_IDS } from "@/lib/elementIds";
import { clamp } from "@/lib/math";
import { CardScene } from "./CardScene";
import type { CardLink } from "./cardTextures";
import { createCardMotion, flipCard, KEYBOARD_SPIN_VELOCITY, spinCard } from "./cardMotion";
import "./holo-card.css";

export type HoloCardHandle = { flip: () => void };

const CLICK_MAX_DRAG_DISTANCE = 5;
const DRAG_ROTATION_PER_PIXEL_Y = 0.5;
const DRAG_ROTATION_PER_PIXEL_X = 0.3;
const MAX_DRAG_TILT_X = 35;
const VELOCITY_SMOOTHING = 0.4;
const MAX_PIXEL_RATIO = 3;
const PIXEL_RATIO_BOOST = 1.5;

/** Mail opens in place; everything else in a new tab. */
function followLink(link: CardLink) {
  if (link.href.startsWith("mailto:")) window.location.href = link.href;
  else window.open(link.href, "_blank", "noopener,noreferrer");
}

/** The same links as on the paper side, for keyboards and screen readers. */
const CARD_LINKS = [
  { label: "Email", href: BUSINESS_CARD.back.emailHref },
  ...BUSINESS_CARD.back.rows.map(([label, , href]) => ({ label, href })),
];

export const HoloCard = forwardRef<HoloCardHandle>(function HoloCard(_, ref) {
  const reducedMotion = usePrefersReducedMotion();
  const [motion] = useState(createCardMotion);
  const [pixelRatio] = useState(() => Math.min(window.devicePixelRatio * PIXEL_RATIO_BOOST, MAX_PIXEL_RATIO));
  const shadowRef = useRef<HTMLDivElement>(null);
  const canvasAreaRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({ flip: () => flipCard(motion) }), [motion]);

  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    motion.isDragging = true;
    motion.dragDistance = 0;
    motion.lastPointerX = event.clientX;
    motion.lastPointerY = event.clientY;
    motion.spinVelocity = 0;
    event.currentTarget.setPointerCapture(event.pointerId);
    motion.requestFrame();
  };

  const drag = (event: PointerEvent<HTMLDivElement>) => {
    if (!motion.isDragging) return;

    const deltaX = event.clientX - motion.lastPointerX;
    const deltaY = event.clientY - motion.lastPointerY;
    const rotationDeltaY = deltaX * DRAG_ROTATION_PER_PIXEL_Y;

    motion.lastPointerX = event.clientX;
    motion.lastPointerY = event.clientY;
    motion.dragDistance += Math.abs(deltaX) + Math.abs(deltaY);
    motion.rotationY += rotationDeltaY;
    motion.spinVelocity = motion.spinVelocity * VELOCITY_SMOOTHING + rotationDeltaY * (1 - VELOCITY_SMOOTHING);
    motion.rotationX = clamp(motion.rotationX - deltaY * DRAG_ROTATION_PER_PIXEL_X, -MAX_DRAG_TILT_X, MAX_DRAG_TILT_X);
    motion.requestFrame();
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!motion.isDragging) return;
    motion.isDragging = false;
    if (motion.dragDistance >= CLICK_MAX_DRAG_DISTANCE) {
      motion.requestFrame();
      return;
    }
    // A click on a link on the paper side follows it; a click anywhere else flips the card.
    const link = event.type === "pointerup" ? motion.linkAt(event.clientX, event.clientY) : null;
    if (link) followLink(link);
    else flipCard(motion);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const keyActions: Record<string, () => void> = {
      Enter: () => flipCard(motion),
      " ": () => flipCard(motion),
      ArrowLeft: () => spinCard(motion, -KEYBOARD_SPIN_VELOCITY),
      ArrowRight: () => spinCard(motion, KEYBOARD_SPIN_VELOCITY),
    };
    const action = keyActions[event.key];
    if (!action) return;
    event.preventDefault();
    action();
  };

  const followPointer = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || motion.isDragging) return;
    const link = motion.linkAt(event.clientX, event.clientY);
    if (canvasAreaRef.current) {
      canvasAreaRef.current.style.cursor = link ? "pointer" : "";
      canvasAreaRef.current.title = link ? link.href.replace(/^mailto:/, "") : "";
    }
    const bounds = event.currentTarget.getBoundingClientRect();
    motion.hoverX = (event.clientX - bounds.left) / bounds.width - 0.5;
    motion.hoverY = (event.clientY - bounds.top) / bounds.height - 0.5;
    motion.requestFrame();
  };

  const resetHover = () => {
    motion.hoverX = 0;
    motion.hoverY = 0;
    motion.requestFrame();
  };

  return (
    <div className="holo-card" onPointerMove={followPointer} onPointerLeave={resetHover}>
      <div
        ref={canvasAreaRef}
        id={ELEMENT_IDS.holoCard}
        className="holo-card__canvas"
        tabIndex={0}
        role="img"
        aria-label="Holographic business card of Anastasia Vilmovskaya. Arrow keys turn it, Enter flips it. The links on its back follow below."
        onPointerDown={startDrag}
        onPointerMove={drag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={handleKeyDown}
      >
        <Canvas
          frameloop="demand"
          flat
          linear
          dpr={pixelRatio}
          gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
          camera={{ fov: 28, near: 0.1, far: 50, position: [0, 0, 5] }}
        >
          <CardScene motion={motion} shadowRef={shadowRef} reducedMotion={reducedMotion} />
        </Canvas>
      </div>
      <div className="holo-card__shadow" ref={shadowRef} />
      <ul className="holo-card__links">
        {CARD_LINKS.map((link) => (
          <li key={link.label}>
            <a href={link.href} {...(link.href.startsWith("mailto:") ? {} : { target: "_blank", rel: "noopener noreferrer" })}>
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
});
