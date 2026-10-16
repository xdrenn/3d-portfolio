import { CanvasTexture, EquirectangularReflectionMapping, SRGBColorSpace } from "three";

const WIDTH = 1024;
const HEIGHT = 512;
const SPOT_RADIUS = 170;
const SPOT_OPACITY = 0.85;

const HORIZON_GRADIENT: [offset: number, color: string][] = [
  [0, "#ffffff"],
  [0.42, "#dfe3ea"],
  [0.5, "#3a3d46"],
  [0.58, "#15161a"],
  [1, "#6d7180"],
];

const COLOR_SPOTS: [color: string, x: number, y: number][] = [
  ["#8fd8ff", 150, 180],
  ["#c7a2ff", 380, 140],
  ["#ffa9dc", 600, 200],
  ["#ffe680", 820, 150],
  ["#8dffd0", 980, 230],
  ["#ff9fd0", 260, 380],
  ["#9fc4ff", 720, 400],
];

const SOFTBOXES: [x: number, y: number, width: number, height: number][] = [
  [90, 70, 180, 60],
  [470, 40, 120, 110],
  [760, 90, 220, 40],
  [0, 300, 1024, 6],
];

const BLACK_FLAGS: [x: number, y: number, width: number, height: number][] = [
  [320, 60, 14, 180],
  [900, 200, 10, 140],
];

export function createStudioEnvironment() {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const context = canvas.getContext("2d")!;

  const horizon = context.createLinearGradient(0, 0, 0, HEIGHT);
  for (const [offset, color] of HORIZON_GRADIENT) horizon.addColorStop(offset, color);
  context.fillStyle = horizon;
  context.fillRect(0, 0, WIDTH, HEIGHT);

  context.globalAlpha = SPOT_OPACITY;
  for (const [color, x, y] of COLOR_SPOTS) {
    const spot = context.createRadialGradient(x, y, 0, x, y, SPOT_RADIUS);
    spot.addColorStop(0, color);
    spot.addColorStop(1, `${color}00`);
    context.fillStyle = spot;
    context.fillRect(0, 0, WIDTH, HEIGHT);
  }

  context.globalAlpha = 1;
  context.fillStyle = "#ffffff";
  for (const [x, y, width, height] of SOFTBOXES) context.fillRect(x, y, width, height);
  context.fillStyle = "#000";
  for (const [x, y, width, height] of BLACK_FLAGS) context.fillRect(x, y, width, height);

  const texture = new CanvasTexture(canvas);
  texture.mapping = EquirectangularReflectionMapping;
  texture.colorSpace = SRGBColorSpace;
  return texture;
}
