import type { ObjectKind } from "./objectCatalog";

export type Placement = {
  kind: ObjectKind;
  x: number;
  y: number;
  z: number;
  scale: number;
};

export const PAGE_PLACEMENTS: Placement[] = [
  { kind: "starburst", x: -0.98, y: 1.25, z: 0.5, scale: 0.6 },
  { kind: "twinSparkles", x: 0.98, y: 1.55, z: 0.5, scale: 0.75 },
  { kind: "blob", x: -0.98, y: 2.05, z: 0, scale: 0.6 },
  { kind: "needleStar", x: 0.98, y: 2.45, z: 1, scale: 0.55 },
  { kind: "ribbon", x: -0.98, y: 2.95, z: 0.5, scale: 0.7 },
  { kind: "wireOrb", x: 0.98, y: 3.4, z: -0.5, scale: 0.75 },
  { kind: "puffyStar", x: -0.98, y: 3.85, z: 0.6, scale: 0.6 },
  { kind: "spring", x: 0.98, y: 4.3, z: 0.5, scale: 0.65 },
  { kind: "droplet", x: -0.98, y: 4.8, z: 0.4, scale: 0.6 },
  { kind: "squishyRing", x: 0.98, y: 5.3, z: 0, scale: 0.6 },
  { kind: "sparkleRing", x: -0.98, y: 5.8, z: 1, scale: 0.7 },
];

// Hero objects live in the empty side columns: left under the intro, right under the swatches.
export const HERO_PLACEMENTS: Placement[] = [
  { kind: "starburst", x: 0.11, y: 0.5, z: 0.6, scale: 0.36 },
  { kind: "sparkle", x: 0.9, y: 0.58, z: 0.8, scale: 0.3 },
];
