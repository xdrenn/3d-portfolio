import { useRef, type PointerEvent, type ReactNode } from "react";
import { cssVars } from "@/lib/cssVars";
import { randomBetween } from "@/lib/math";

export type StickerVariant = "smiley" | "label" | "sparkle" | "note";

type StickerProps = {
  variant: StickerVariant;
  right: string;
  top: string;
  rotate: string;
  children?: ReactNode;
};

const MAX_DROP_ROTATION_DEGREES = 12;
let topStickerZIndex = 7;

export function Sticker({ variant, right, top, rotate, children }: StickerProps) {
  const drag = useRef({ startX: 0, startY: 0, originX: 0, originY: 0, offsetX: 0, offsetY: 0 });

  const pickUp = (event: PointerEvent<HTMLDivElement>) => {
    const sticker = event.currentTarget;
    sticker.setPointerCapture(event.pointerId);
    sticker.classList.add("is-lifted");
    sticker.style.zIndex = String(++topStickerZIndex);

    const state = drag.current;
    state.startX = event.clientX;
    state.startY = event.clientY;
    state.originX = state.offsetX;
    state.originY = state.offsetY;
  };

  const move = (event: PointerEvent<HTMLDivElement>) => {
    const sticker = event.currentTarget;
    if (!sticker.hasPointerCapture(event.pointerId)) return;

    const state = drag.current;
    state.offsetX = state.originX + event.clientX - state.startX;
    state.offsetY = state.originY + event.clientY - state.startY;
    sticker.style.setProperty("--drag-x", `${state.offsetX}px`);
    sticker.style.setProperty("--drag-y", `${state.offsetY}px`);
  };

  const drop = (event: PointerEvent<HTMLDivElement>) => {
    const sticker = event.currentTarget;
    const rotation = randomBetween(-MAX_DROP_ROTATION_DEGREES, MAX_DROP_ROTATION_DEGREES);
    sticker.classList.remove("is-lifted");
    sticker.style.setProperty("--rotate", `${rotation.toFixed(1)}deg`);
  };

  return (
    <div
      className={`sticker sticker--${variant}`}
      style={{ right, top, ...cssVars({ "--rotate": rotate }) }}
      aria-hidden="true"
      onPointerDown={pickUp}
      onPointerMove={move}
      onPointerUp={drop}
      onPointerCancel={drop}
    >
      <div className="sticker__face">{children}</div>
    </div>
  );
}
