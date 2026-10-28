import type { BufferGeometry, Material, Texture } from "three";
import { TorusGeometry } from "three";
import {
  createDropletGeometry,
  createHoloBlobGeometry,
  createNeedleStarGeometry,
  createPuffyStarGeometry,
  createSparkleGeometry,
  createSparkleRingGeometry,
  createSpringGeometry,
  createSquishyRingGeometry,
  createStarburstGeometry,
  createTwinSparkleRingGeometry,
  createTwistRibbonGeometry,
  createWireOrbGeometry,
} from "./geometries";
import { createChromeMaterial, createHoloLiquidMaterial, createPearlMaterial, type TimeUniform } from "./materials";

// Y2K holographic set: liquid stars, chrome sparkles, blobs, coils, wire orbs.
export type ObjectKind =
  | "starburst"
  | "puffyStar"
  | "sparkle"
  | "needleStar"
  | "sparkleRing"
  | "twinSparkles"
  | "ribbon"
  | "blob"
  | "squishyRing"
  | "droplet"
  | "spring"
  | "wireOrb"
  | "ring";

type MaterialContext = { environmentMap: Texture; time: TimeUniform };

type ObjectFactory = (context: MaterialContext) => { geometry: BufferGeometry; material: Material };

const OBJECT_FACTORIES: Record<ObjectKind, ObjectFactory> = {
  starburst: ({ environmentMap, time }) => ({
    geometry: createStarburstGeometry(),
    material: createHoloLiquidMaterial(environmentMap, time, "violet"),
  }),
  puffyStar: ({ environmentMap, time }) => ({
    geometry: createPuffyStarGeometry(),
    material: createHoloLiquidMaterial(environmentMap, time, "pink"),
  }),
  sparkle: () => ({ geometry: createSparkleGeometry(), material: createChromeMaterial(0.06, "lilac") }),
  needleStar: () => ({ geometry: createNeedleStarGeometry(), material: createChromeMaterial(0.05, "pink") }),
  sparkleRing: () => ({ geometry: createSparkleRingGeometry(), material: createChromeMaterial(0.06, "violet") }),
  twinSparkles: () => ({ geometry: createTwinSparkleRingGeometry(), material: createChromeMaterial(0.06, "pink") }),
  ribbon: ({ environmentMap, time }) => ({
    geometry: createTwistRibbonGeometry(),
    material: createHoloLiquidMaterial(environmentMap, time, "cyan"),
  }),
  blob: ({ environmentMap, time }) => ({
    geometry: createHoloBlobGeometry(Math.random() * 6),
    material: createHoloLiquidMaterial(environmentMap, time, "violet"),
  }),
  squishyRing: () => ({ geometry: createSquishyRingGeometry(), material: createPearlMaterial("lilac") }),
  droplet: () => ({ geometry: createDropletGeometry(), material: createPearlMaterial("pink") }),
  spring: () => ({ geometry: createSpringGeometry(), material: createChromeMaterial(0.08, "cyan") }),
  wireOrb: () => ({ geometry: createWireOrbGeometry(), material: createChromeMaterial(0.05, "lilac") }),
  ring: () => ({ geometry: new TorusGeometry(1.0, 0.04, 12, 120), material: createChromeMaterial() }),
};

export const createObject = (kind: ObjectKind, context: MaterialContext) => OBJECT_FACTORIES[kind](context);
