import { DoubleSide, MeshPhysicalMaterial, ShaderMaterial, type Material, type Texture } from "three";
import fragmentShader from "./shaders/glass.frag.glsl?raw";
import vertexShader from "./shaders/glass.vert.glsl?raw";

export type TimeUniform = { value: number };

export const createChromeMaterial = (roughness = 0.07) =>
  new MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 1,
    roughness,
    iridescence: 1,
    iridescenceIOR: 1.7,
    iridescenceThicknessRange: [180, 820],
    envMapIntensity: 1.25,
  });

export const createPearlMaterial = () =>
  new MeshPhysicalMaterial({
    color: 0xf6f0ff,
    metalness: 0.25,
    roughness: 0.22,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    iridescence: 1,
    iridescenceIOR: 1.4,
    iridescenceThicknessRange: [250, 700],
    envMapIntensity: 1.1,
  });

export const createGlassMaterial = (environmentMap: Texture, time: TimeUniform) =>
  new ShaderMaterial({
    uniforms: {
      uEnvironmentMap: { value: environmentMap },
      uTime: time,
      uGlow: { value: 0 },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
  });

export const setGlow = (material: Material, glow: number) => {
  if (material instanceof ShaderMaterial && material.uniforms.uGlow) material.uniforms.uGlow.value = glow;
};
