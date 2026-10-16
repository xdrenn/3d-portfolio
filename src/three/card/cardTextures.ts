import { CanvasTexture } from "three";
import { BUSINESS_CARD } from "@/content/site";
import { SPARKLE_CENTER, SPARKLE_PATH, SPARKLE_SIZE } from "@/lib/shapes";
import { CARD_SIZE } from "./cardGeometry";

export type CardTextures = {
  inkFront: CanvasTexture;
  inkBack: CanvasTexture;
  heightFront: CanvasTexture;
  heightBack: CanvasTexture;
};

const TEXTURE_WIDTH = 2048;
const TEXTURE_HEIGHT = Math.round((TEXTURE_WIDTH * CARD_SIZE.height) / CARD_SIZE.width);
const MARGIN = 134;
const CONTENT_WIDTH = TEXTURE_WIDTH - MARGIN * 2;
const FONT_STACK = '"Inter Tight","Helvetica Neue",Arial,sans-serif';

const INK_COLOR = "#000";
const BACK_INK_COLOR = "#111";
const LABEL_COLOR = "#7a7a7a";

type SparklePlacement = { x: number; y: number; size: number };

/** The embossed foil sparkle is the only foil on the paper side. */
const BACK_SPARKLE: SparklePlacement = { x: TEXTURE_WIDTH - MARGIN - 110, y: MARGIN + 70, size: 190 };

const EMBOSS_LAYERS: { blurRatio: number; opacity: number }[] = [
  { blurRatio: 0.16, opacity: 0.55 },
  { blurRatio: 0.08, opacity: 0.35 },
  { blurRatio: 0.03, opacity: 0.3 },
];

function createCanvas() {
  const canvas = document.createElement("canvas");
  canvas.width = TEXTURE_WIDTH;
  canvas.height = TEXTURE_HEIGHT;
  return canvas;
}

export function createCardTextures(anisotropy: number): CardTextures {
  const createTexture = () => {
    const texture = new CanvasTexture(createCanvas());
    texture.anisotropy = anisotropy;
    return texture;
  };
  return {
    inkFront: createTexture(),
    inkBack: createTexture(),
    heightFront: createTexture(),
    heightBack: createTexture(),
  };
}

const contextOf = (texture: CanvasTexture) => (texture.image as HTMLCanvasElement).getContext("2d")!;

function setLetterSpacing(context: CanvasRenderingContext2D, spacing: string) {
  if ("letterSpacing" in context) context.letterSpacing = spacing;
}

function setFont(context: CanvasRenderingContext2D, size: number, weight = 400) {
  context.font = `${weight} ${size}px ${FONT_STACK}`;
}

function setFontToFit(context: CanvasRenderingContext2D, text: string, size: number, maxWidth: number) {
  setFont(context, size);
  const width = context.measureText(text).width;
  if (width > maxWidth) setFont(context, size * (maxWidth / width));
}

function drawEmbossedSparkle(context: CanvasRenderingContext2D, centerX: number, centerY: number, size: number) {
  const sparkle = new Path2D(SPARKLE_PATH);
  const scale = size / SPARKLE_SIZE;
  const shadowShift = TEXTURE_WIDTH * 2;

  for (const layer of EMBOSS_LAYERS) {
    context.save();
    context.shadowColor = `rgba(255,0,0,${layer.opacity})`;
    context.shadowBlur = size * layer.blurRatio;
    context.shadowOffsetX = shadowShift;
    context.translate(centerX - shadowShift, centerY);
    context.scale(scale, scale);
    context.translate(-SPARKLE_CENTER, -SPARKLE_CENTER);
    context.fillStyle = "#f00";
    context.fill(sparkle);
    context.restore();
  }
}

function drawFront(context: CanvasRenderingContext2D) {
  const { nameLines, bottomLeft, bottomRight } = BUSINESS_CARD.front;

  context.clearRect(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);
  context.fillStyle = INK_COLOR;
  context.textBaseline = "alphabetic";
  context.textAlign = "left";

  // The top half stays empty on purpose: the foil itself is the picture there.
  // Two-line name, both lines set at the size that fits the longer one.
  setLetterSpacing(context, "-11px");
  const longestLine = nameLines.reduce((longest, line) => (line.length > longest.length ? line : longest));
  setFontToFit(context, longestLine, 236, CONTENT_WIDTH - 10);
  context.fillText(nameLines[0], MARGIN - 6, TEXTURE_HEIGHT - 492);
  context.fillText(nameLines[1], MARGIN - 6, TEXTURE_HEIGHT - 300);

  setLetterSpacing(context, "0px");
  context.fillRect(MARGIN, TEXTURE_HEIGHT - 245, CONTENT_WIDTH, 3);

  setFont(context, 48);
  context.fillText(bottomLeft, MARGIN, TEXTURE_HEIGHT - MARGIN - 30);
  context.textAlign = "right";
  context.fillText(bottomRight, TEXTURE_WIDTH - MARGIN, TEXTURE_HEIGHT - MARGIN - 30);
  context.textAlign = "left";
}

function drawBack(context: CanvasRenderingContext2D) {
  const { heading, email, rows } = BUSINESS_CARD.back;

  context.clearRect(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);
  context.fillStyle = BACK_INK_COLOR;
  context.textBaseline = "alphabetic";
  context.textAlign = "left";

  setLetterSpacing(context, "0px");
  setFont(context, 54);
  context.fillText(heading, MARGIN, MARGIN + 40);

  setLetterSpacing(context, "-5px");
  setFontToFit(context, email, 128, CONTENT_WIDTH);
  context.fillText(email, MARGIN, TEXTURE_HEIGHT - 470);

  setLetterSpacing(context, "0px");
  context.fillRect(MARGIN, TEXTURE_HEIGHT - 405, CONTENT_WIDTH, 3);

  setFont(context, 50);
  rows.forEach(([label, value], row) => {
    const y = TEXTURE_HEIGHT - 310 + row * 78;
    context.fillStyle = LABEL_COLOR;
    context.fillText(label, MARGIN, y);
    context.fillStyle = BACK_INK_COLOR;
    context.fillText(value, MARGIN + 380, y);
  });
}

function drawHeightMap(context: CanvasRenderingContext2D, sparkle: SparklePlacement | null) {
  context.fillStyle = "#000";
  context.fillRect(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);
  if (sparkle) drawEmbossedSparkle(context, sparkle.x, sparkle.y, sparkle.size);
}

export function drawCardTextures(textures: CardTextures) {
  drawFront(contextOf(textures.inkFront));
  drawBack(contextOf(textures.inkBack));
  drawHeightMap(contextOf(textures.heightFront), null);
  drawHeightMap(contextOf(textures.heightBack), BACK_SPARKLE);

  for (const texture of Object.values(textures)) texture.needsUpdate = true;
}
