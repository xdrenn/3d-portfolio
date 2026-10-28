/**
 * Draws the receipt as a picture and downloads it as PNG: torn paper, the printed text
 * and the holographic strip at the bottom. Pure canvas, so the browser asks for no permissions.
 */
const SCALE = 3;
const FONT_SIZE = 13;
const LINE_HEIGHT = Math.round(FONT_SIZE * 1.45);
const PADDING = 22;
const TEETH = 6; // height of the torn zigzag edge
const TOOTH_WIDTH = 10;
const HOLO_HEIGHT = 24;
const MARGIN = 28; // room around the paper for its shadow

const PAPER = "#fbfaf5";
const INK = "#2a2a2e";
const FOIL = ["#9fdcff", "#c9b2ff", "#ffb8e2", "#fff1a0", "#a8ffd6", "#9fdcff", "#c9b2ff", "#ffb8e2", "#fff1a0"];
const MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace';

function paperPath(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
  const teeth = Math.max(1, Math.round(width / TOOTH_WIDTH));
  const step = width / teeth;
  context.beginPath();
  context.moveTo(x, y + TEETH);
  for (let tooth = 0; tooth < teeth; tooth++) {
    context.lineTo(x + step * (tooth + 0.5), y);
    context.lineTo(x + step * (tooth + 1), y + TEETH);
  }
  context.lineTo(x + width, y + height - TEETH);
  for (let tooth = teeth; tooth > 0; tooth--) {
    context.lineTo(x + step * (tooth - 0.5), y + height);
    context.lineTo(x + step * (tooth - 1), y + height - TEETH);
  }
  context.closePath();
}

export async function downloadReceiptImage(lines: string[], fileName: string) {
  // Wait for the page fonts, so the receipt looks the same as on screen.
  await document.fonts?.ready;

  const measure = document.createElement("canvas").getContext("2d");
  if (!measure) return;
  measure.font = `${FONT_SIZE}px ${MONO}`;
  const textWidth = Math.ceil(Math.max(...lines.map((line) => measure.measureText(line).width)));

  const paperWidth = textWidth + PADDING * 2;
  const textHeight = lines.length * LINE_HEIGHT;
  const paperHeight = TEETH + PADDING + textHeight + PADDING + HOLO_HEIGHT + PADDING * 0.8 + TEETH;

  const canvas = document.createElement("canvas");
  canvas.width = (paperWidth + MARGIN * 2) * SCALE;
  canvas.height = (paperHeight + MARGIN * 2) * SCALE;
  const context = canvas.getContext("2d");
  if (!context) return;
  context.scale(SCALE, SCALE);

  // Paper with a soft shadow, slightly tilted like a slip lying on a desk.
  context.save();
  context.translate(MARGIN + paperWidth / 2, MARGIN + paperHeight / 2);
  context.rotate((-1.2 * Math.PI) / 180);
  context.translate(-paperWidth / 2, -paperHeight / 2);

  context.save();
  context.shadowColor = "rgba(0, 0, 0, 0.22)";
  context.shadowBlur = 16;
  context.shadowOffsetY = 6;
  paperPath(context, 0, 0, paperWidth, paperHeight);
  context.fillStyle = PAPER;
  context.fill();
  context.restore();

  paperPath(context, 0, 0, paperWidth, paperHeight);
  context.clip();

  // Thermal ink.
  context.fillStyle = INK;
  context.font = `${FONT_SIZE}px ${MONO}`;
  context.textBaseline = "top";
  lines.forEach((line, index) => {
    context.fillText(line, PADDING, TEETH + PADDING + index * LINE_HEIGHT);
  });

  // Holographic security strip, edge to edge.
  const holoTop = TEETH + PADDING + textHeight + PADDING;
  const foil = context.createLinearGradient(0, holoTop, paperWidth, holoTop + HOLO_HEIGHT);
  FOIL.forEach((color, index) => foil.addColorStop(index / (FOIL.length - 1), color));
  context.fillStyle = foil;
  context.fillRect(0, holoTop, paperWidth, HOLO_HEIGHT);
  const sheen = context.createLinearGradient(0, holoTop, 0, holoTop + HOLO_HEIGHT);
  sheen.addColorStop(0, "rgba(255, 255, 255, 0.45)");
  sheen.addColorStop(0.5, "rgba(255, 255, 255, 0)");
  sheen.addColorStop(1, "rgba(0, 0, 0, 0.06)");
  context.fillStyle = sheen;
  context.fillRect(0, holoTop, paperWidth, HOLO_HEIGHT);
  context.restore();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
