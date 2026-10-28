import { createContext, useContext } from "react";
import { Vector2, type Object3D } from "three";
import { MOBILE_MAX_WIDTH } from "@/lib/breakpoints";
import { degreesToRadians } from "@/lib/math";
import type { TimeUniform } from "./materials";

export type Interactive = {
  onClick: () => void;
  onHover?: () => void;
  isVisible: () => boolean;
};

export type SceneStore = {
  reducedMotion: boolean;
  elapsed: number;
  timeUniform: TimeUniform;
  pointer: Vector2;
  smoothPointerX: number;
  smoothPointerY: number;
  scrollVelocity: number;
  lastScrollY: number;
  unitsPerPixel: number;
  viewWidth: number;
  isMobile: boolean;
  blobOffsetY: number;
  blobScale: number;
  hoveredObject: Object3D | null;
  needsRaycast: boolean;
  blobKick: number;
  interactives: Map<Object3D, Interactive>;
};

export const OFFSCREEN_POINTER = 9;

export function createSceneStore(reducedMotion: boolean): SceneStore {
  return {
    reducedMotion,
    elapsed: 0,
    timeUniform: { value: 0 },
    pointer: new Vector2(OFFSCREEN_POINTER, OFFSCREEN_POINTER),
    smoothPointerX: 0,
    smoothPointerY: 0,
    scrollVelocity: 0,
    lastScrollY: typeof window !== "undefined" ? window.scrollY : 0,
    unitsPerPixel: 1,
    viewWidth: 1,
    isMobile: false,
    blobOffsetY: 0,
    blobScale: 1,
    hoveredObject: null,
    needsRaycast: true,
    blobKick: 0,
    interactives: new Map(),
  };
}

type Viewport = { fov: number; cameraZ: number; width: number; height: number };

const BLOB_SCREEN_Y = { desktop: 0.3, mobile: 0.87 };
const BLOB_HEIGHT_RATIO = { desktop: 0.12, mobile: 0.08 };
const BLOB_WIDTH_RATIO = { desktop: 0.095, mobile: 0.17 };
const BLOB_BASE_DIAMETER = 2.4;

export function updateSceneLayout(store: SceneStore, { fov, cameraZ, width, height }: Viewport) {
  const viewHeight = 2 * Math.tan(degreesToRadians(fov / 2)) * cameraZ;
  const device = width < MOBILE_MAX_WIDTH ? "mobile" : "desktop";

  store.unitsPerPixel = viewHeight / height;
  store.viewWidth = viewHeight * (width / height);
  store.isMobile = device === "mobile";
  store.blobOffsetY = (0.5 - BLOB_SCREEN_Y[device]) * height * store.unitsPerPixel;
  store.blobScale =
    Math.min(viewHeight * BLOB_HEIGHT_RATIO[device], store.viewWidth * BLOB_WIDTH_RATIO[device]) / BLOB_BASE_DIAMETER;
}

export const SceneStoreContext = createContext<SceneStore | null>(null);

export function useSceneStore() {
  const store = useContext(SceneStoreContext);
  if (!store) throw new Error("useSceneStore must be used inside <BackgroundScene>");
  return store;
}
