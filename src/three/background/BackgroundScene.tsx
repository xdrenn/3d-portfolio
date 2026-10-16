import { useEffect, useMemo, useRef, useState } from "react";
import { useCursor } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { Raycaster, type Group, type PerspectiveCamera } from "three";
import { ChromeBlob } from "./ChromeBlob";
import { FloatingObject } from "./FloatingObject";
import { HERO_PLACEMENTS, PAGE_PLACEMENTS } from "./placements";
import { createSceneStore, OFFSCREEN_POINTER, SceneStoreContext, updateSceneLayout } from "./sceneStore";
import { createStudioEnvironment } from "./studioEnvironment";

const MAX_FRAME_SECONDS = 0.05;
const REDUCED_MOTION_TIME_SCALE = 0.15;
const POINTER_EASING = 0.05;
const SCROLL_VELOCITY_EASING = 0.1;
const KICK_DECAY = 0.96;

function useStudioEnvironment() {
  const scene = useThree((state) => state.scene);
  const environmentMap = useMemo(createStudioEnvironment, []);

  useEffect(() => {
    scene.environment = environmentMap;
    return () => {
      scene.environment = null;
    };
  }, [scene, environmentMap]);

  return environmentMap;
}

export function BackgroundScene({ reducedMotion }: { reducedMotion: boolean }) {
  const [store] = useState(() => createSceneStore(reducedMotion));
  const camera = useThree((state) => state.camera) as PerspectiveCamera;
  const size = useThree((state) => state.size);
  const worldRef = useRef<Group>(null);
  const raycaster = useMemo(() => new Raycaster(), []);
  const [isHovering, setIsHovering] = useState(false);
  const isHoveringRef = useRef(false);
  const environmentMap = useStudioEnvironment();

  useCursor(isHovering);

  useEffect(() => {
    updateSceneLayout(store, { fov: camera.fov, cameraZ: camera.position.z, width: size.width, height: size.height });
  }, [store, camera, size]);

  const pickObjectUnderPointer = () => {
    raycaster.setFromCamera(store.pointer, camera);
    const candidates = [...store.interactives]
      .filter(([, interactive]) => interactive.isVisible())
      .map(([object]) => object);
    return raycaster.intersectObjects(candidates, false)[0];
  };
  const pickRef = useRef(pickObjectUnderPointer);
  pickRef.current = pickObjectUnderPointer;

  useEffect(() => {
    const updatePointer = (event: PointerEvent) => {
      store.pointer.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
      store.needsRaycast = true;
    };
    const handleScroll = () => {
      store.needsRaycast = true;
    };
    const handlePointerDown = (event: PointerEvent) => {
      updatePointer(event);
      const hit = pickRef.current();
      if (hit) store.interactives.get(hit.object)?.onClick();
    };

    window.addEventListener("pointermove", updatePointer);
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("pointermove", updatePointer);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [store]);

  useFrame((_, delta) => {
    const seconds = Math.min(delta, MAX_FRAME_SECONDS);
    const scrollY = window.scrollY;

    store.elapsed += seconds * (store.reducedMotion ? REDUCED_MOTION_TIME_SCALE : 1);
    store.timeUniform.value = store.elapsed;

    const hasPointer = store.pointer.x !== OFFSCREEN_POINTER;
    const targetX = hasPointer ? store.pointer.x : 0;
    const targetY = hasPointer ? store.pointer.y : 0;
    store.smoothPointerX += (targetX - store.smoothPointerX) * POINTER_EASING;
    store.smoothPointerY += (targetY - store.smoothPointerY) * POINTER_EASING;

    store.scrollVelocity += (scrollY - store.lastScrollY - store.scrollVelocity) * SCROLL_VELOCITY_EASING;
    store.lastScrollY = scrollY;

    if (worldRef.current) worldRef.current.position.y = scrollY * store.unitsPerPixel;

    if (store.needsRaycast) {
      store.needsRaycast = false;
      const hit = pickObjectUnderPointer();
      store.hoveredObject = hit ? hit.object : null;
      if (hit) store.interactives.get(hit.object)?.onHover?.();

      const hovering = Boolean(hit);
      if (hovering !== isHoveringRef.current) {
        isHoveringRef.current = hovering;
        setIsHovering(hovering);
      }
    }

    store.blobKick *= KICK_DECAY;
  });

  return (
    <SceneStoreContext.Provider value={store}>
      <group ref={worldRef}>
        <ChromeBlob environmentMap={environmentMap} />
        {PAGE_PLACEMENTS.map((placement, index) => (
          <FloatingObject key={`page-${index}`} placement={placement} anchor="page" environmentMap={environmentMap} />
        ))}
        {HERO_PLACEMENTS.map((placement, index) => (
          <FloatingObject key={`hero-${index}`} placement={placement} anchor="hero" environmentMap={environmentMap} />
        ))}
      </group>
    </SceneStoreContext.Provider>
  );
}
