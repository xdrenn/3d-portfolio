import type { ReactNode } from "react";
import { Sticker, type StickerVariant } from "./Sticker";

type StickerPlacement = {
  variant: StickerVariant;
  right: string;
  top: string;
  rotate: string;
  content?: ReactNode;
};

const SMILEY = (
  <svg viewBox="0 0 40 40" fill="none" stroke="#000" strokeWidth="2.2" strokeLinecap="round">
    <circle cx="20" cy="20" r="17" />
    <path d="M14 15v3M26 15v3M12.5 24c3.5 5 11.5 5 15 0" />
  </svg>
);

/**
 * Positions are relative to the sticker area in the right-hand columns,
 * so the stickers never land on top of the statement or the services.
 */
const STICKERS: StickerPlacement[] = [

  { variant: "sparkle", right: "58%", top: "4%", rotate: "12deg" },
  { variant: "smiley", right: "6%", top: "12%", rotate: "-8deg", content: SMILEY },
  {
    variant: "label",
    right: "22%",
    top: "64%",
    rotate: "5deg",
    content: (
      <span>
        design
      </span>
    ),
  },
    {
    variant: "note",
    right: "30%",
    top: "38%",
    rotate: "-3deg",
    content: (
      <span>
        stickers are
        <br />
        draggable :)
      </span>
    ),
  },

];

export function Stickers() {
  return (
    <>
      {STICKERS.map(({ variant, right, top, rotate, content }) => (
        <Sticker key={variant} variant={variant} right={right} top={top} rotate={rotate}>
          {content}
        </Sticker>
      ))}
    </>
  );
}
