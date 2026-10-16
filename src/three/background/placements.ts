import type { ObjectKind } from "./objectCatalog";

export type Placement = {
  kind: ObjectKind;
  x: number;
  y: number;
  z: number;
  scale: number;
};

export const PAGE_PLACEMENTS: Placement[] = [
  { kind: "bubble", x: -0.92, y: 1.25, z: 0, scale: 0.75 },
  { kind: "sparkle", x: 0.93, y: 1.55, z: 0.5, scale: 0.55 },
  { kind: "crystal", x: -0.9, y: 2.05, z: 1, scale: 0.85 },
  { kind: "donut", x: 0.92, y: 2.45, z: 0, scale: 0.7 },
  { kind: "glassPill", x: -0.9, y: 2.95, z: 0.5, scale: 0.75 },
  { kind: "knot", x: 0.92, y: 3.4, z: -1, scale: 0.6 },
  { kind: "shortCrystal", x: -0.88, y: 3.85, z: 1, scale: 0.9 },
  { kind: "pearlPill", x: 0.9, y: 4.3, z: 0.5, scale: 0.7 },
  { kind: "sparkle", x: -0.9, y: 4.8, z: 0.4, scale: 0.5 },
  { kind: "bubble", x: 0.88, y: 5.3, z: 0, scale: 0.65 },
  { kind: "crystal", x: -0.86, y: 5.8, z: 1, scale: 0.75 },
];

export const HERO_PLACEMENTS: Placement[] = [
  { kind: "crystal", x: 0.27, y: 0.66, z: 1.4, scale: 0.55 },
  { kind: "sparkle", x: 0.46, y: 0.76, z: 1.2, scale: 0.44 },
  { kind: "glassPill", x: 0.86, y: 0.72, z: 0.6, scale: 0.5 },
];
