import { Color, DoubleSide, MeshPhysicalMaterial, ShaderMaterial, type Material, type Texture } from "three";
import glassFragmentShader from "./shaders/glass.frag.glsl?raw";
import glassVertexShader from "./shaders/glass.vert.glsl?raw";
import holoFragmentShader from "./shaders/holo.frag.glsl?raw";
import holoVertexShader from "./shaders/holo.vert.glsl?raw";

export type TimeUniform = { value: number };

/** Accent colours pulled from the moodboard. */
export const HOLO_TINTS = {
  violet: "#8f6bff",
  pink: "#ff8fd8",
  cyan: "#7fe6ff",
  lilac: "#d9c8ff",
} as const;
export type HoloTint = keyof typeof HOLO_TINTS;

const HOVER_EMISSIVE = 0.35;

/** Mirror chrome with strong rainbow film — sparkles, wire, springs. */
export const createChromeMaterial = (roughness = 0.07, tint: HoloTint = "lilac") =>
  new MeshPhysicalMaterial({
    color: new Color(HOLO_TINTS[tint]).lerp(new Color("#ffffff"), 0.55),
    metalness: 1,
    roughness,
    iridescence: 1,
    iridescenceIOR: 2.0,
    iridescenceThicknessRange: [120, 1100],
    envMapIntensity: 1.4,
    emissive: new Color(HOLO_TINTS[tint]),
    emissiveIntensity: 0,
  });

/** Soft milky pearl with a holo sheen — droplets, puffy shapes. */
export const createPearlMaterial = (tint: HoloTint = "pink") =>
  new MeshPhysicalMaterial({
    color: new Color(HOLO_TINTS[tint]).lerp(new Color("#ffffff"), 0.7),
    metalness: 0.3,
    roughness: 0.18,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    iridescence: 1,
    iridescenceIOR: 1.8,
    iridescenceThicknessRange: [200, 900],
    sheen: 1,
    sheenColor: new Color(HOLO_TINTS.cyan),
    sheenRoughness: 0.3,
    envMapIntensity: 1.2,
    emissive: new Color(HOLO_TINTS[tint]),
    emissiveIntensity: 0,
  });

/** Opaque liquid holographic foil (custom shader) — starbursts, blobs, ribbons. */
export const createHoloLiquidMaterial = (environmentMap: Texture, time: TimeUniform, tint: HoloTint = "violet") =>
  new ShaderMaterial({
    uniforms: {
      uEnvironmentMap: { value: environmentMap },
      uTime: time,
      uGlow: { value: 0 },
      uSeed: { value: Math.random() * 10 },
      uTint: { value: new Color(HOLO_TINTS[tint]) },
    },
    vertexShader: holoVertexShader,
    fragmentShader: holoFragmentShader,
  });

/** See-through glass (kept for reuse; not used by the floating objects any more). */
export const createGlassMaterial = (environmentMap: Texture, time: TimeUniform) =>
  new ShaderMaterial({
    uniforms: {
      uEnvironmentMap: { value: environmentMap },
      uTime: time,
      uGlow: { value: 0 },
    },
    vertexShader: glassVertexShader,
    fragmentShader: glassFragmentShader,
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
  });

export const setGlow = (material: Material, glow: number) => {
  if (material instanceof ShaderMaterial) {
    if (material.uniforms.uGlow) material.uniforms.uGlow.value = glow;
  } else if (material instanceof MeshPhysicalMaterial) {
    material.emissiveIntensity = glow * HOVER_EMISSIVE;
  }
};
