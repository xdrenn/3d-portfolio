import { ShaderMaterial, type Texture, type Vector2, type Vector3 } from "three";
import fragmentShader from "./shaders/foil.frag.glsl?raw";
import vertexShader from "./shaders/foil.vert.glsl?raw";

export type SharedFoilUniforms = {
  uLightDirection: { value: Vector3 };
  uTime: { value: number };
  /** Pointer position in card UV space, drives the moving glare. */
  uGlare: { value: Vector2 };
};

export type CardFace = "front" | "back";

export function createFoilMaterial(
  face: CardFace,
  inkMap: Texture,
  heightMap: Texture,
  shared: SharedFoilUniforms,
) {
  return new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uInkMap: { value: inkMap },
      uHeightMap: { value: heightMap },
      uIsPaper: { value: face === "back" ? 1 : 0 },
      ...shared,
    },
  });
}
