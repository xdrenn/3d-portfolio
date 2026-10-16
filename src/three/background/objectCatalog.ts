import { SphereGeometry, TorusGeometry, TorusKnotGeometry, type BufferGeometry, type Material, type Texture } from "three";
import { createCapsuleGeometry, createCrystalGeometry, createSparkleGeometry } from "./geometries";
import { createChromeMaterial, createGlassMaterial, createPearlMaterial, type TimeUniform } from "./materials";

export type ObjectKind =
  | "sparkle"
  | "knot"
  | "donut"
  | "pearlPill"
  | "glassPill"
  | "bubble"
  | "crystal"
  | "shortCrystal"
  | "ring";

type MaterialContext = { environmentMap: Texture; time: TimeUniform };

type ObjectFactory = (context: MaterialContext) => { geometry: BufferGeometry; material: Material };

const glass = ({ environmentMap, time }: MaterialContext) => createGlassMaterial(environmentMap, time);

const OBJECT_FACTORIES: Record<ObjectKind, ObjectFactory> = {
  sparkle: () => ({ geometry: createSparkleGeometry(), material: createChromeMaterial() }),
  knot: () => ({ geometry: new TorusKnotGeometry(0.7, 0.22, 150, 22, 2, 3), material: createChromeMaterial() }),
  donut: () => ({ geometry: new TorusGeometry(0.75, 0.3, 40, 96), material: createPearlMaterial() }),
  pearlPill: () => ({ geometry: createCapsuleGeometry(0.42, 1.1), material: createPearlMaterial() }),
  glassPill: (context) => ({ geometry: createCapsuleGeometry(0.45, 1.2), material: glass(context) }),
  bubble: (context) => ({ geometry: new SphereGeometry(0.9, 48, 32), material: glass(context) }),
  crystal: (context) => ({ geometry: createCrystalGeometry(2.0), material: glass(context) }),
  shortCrystal: (context) => ({ geometry: createCrystalGeometry(1.1), material: glass(context) }),
  ring: () => ({ geometry: new TorusGeometry(1.0, 0.04, 12, 120), material: createChromeMaterial() }),
};

export const createObject = (kind: ObjectKind, context: MaterialContext) => OBJECT_FACTORIES[kind](context);
