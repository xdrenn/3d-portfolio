import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh, Texture } from "three";
import { randomBetween, smoothstep } from "@/lib/math";
import { scrollProgress } from "@/state/scrollProgress";
import { setGlow } from "./materials";
import { createObject } from "./objectCatalog";
import type { Placement } from "./placements";
import { useSceneStore, type SceneStore } from "./sceneStore";

export type PlacementAnchor = "page" | "hero";

type FloatingObjectProps = {
  placement: Placement;
  anchor: PlacementAnchor;
  environmentMap: Texture;
};

const MAX_FRAME_SECONDS = 0.05;
const CLICK_BOOST = 7;
const BOOST_DECAY = 0.95;
const HOVER_EASING = 0.1;
const HOVER_SPIN = 1.6;
const HOVER_SCALE = 0.14;
const SCROLL_SPIN = 0.02;
const REDUCED_MOTION_SPIN = 0.2;
const MOBILE_SCALE = 0.7;
const MOBILE_MAX_X = 0.88;
const BOB_AMPLITUDE = 0.16;
const BOB_SPEED = 0.6;
const PAGE_VISIBILITY_RANGE = 0.85;

function baseX(placement: Placement, anchor: PlacementAnchor, store: SceneStore) {
  const normalizedX = anchor === "hero" ? (placement.x - 0.5) * 2 : placement.x;
  const clampedX = store.isMobile
    ? Math.sign(normalizedX) * Math.min(Math.abs(normalizedX), MOBILE_MAX_X)
    : normalizedX;
  return clampedX * store.viewWidth * 0.5;
}

function baseY(placement: Placement, anchor: PlacementAnchor, store: SceneStore, viewportHeight: number) {
  const screens = anchor === "hero" ? 0.5 - placement.y : -placement.y;
  return screens * viewportHeight * store.unitsPerPixel;
}

export function FloatingObject({ placement, anchor, environmentMap }: FloatingObjectProps) {
  const store = useSceneStore();
  const meshRef = useRef<Mesh>(null);
  const { geometry, material } = useMemo(
    () => createObject(placement.kind, { environmentMap, time: store.timeUniform }),
    [placement.kind, environmentMap, store],
  );

  const [personality] = useState(() => ({
    spinSpeed: randomBetween(0.18, 0.48),
    bobPhase: randomBetween(0, Math.PI * 2),
    initialRotation: [Math.random() * 3, Math.random() * 3, Math.random() * 3] as [number, number, number],
  }));
  const reaction = useRef({ hover: 0, boost: 0 });

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    store.interactives.set(mesh, {
      onClick: () => {
        reaction.current.boost = CLICK_BOOST;
      },
      isVisible: () => mesh.visible,
    });
    return () => {
      store.interactives.delete(mesh);
    };
  }, [store]);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const seconds = Math.min(delta, MAX_FRAME_SECONDS);
    const viewportHeight = window.innerHeight;
    const scrollY = window.scrollY;
    const worldOffsetY = scrollY * store.unitsPerPixel;
    const state = reaction.current;

    state.hover += ((store.hoveredObject === mesh ? 1 : 0) - state.hover) * HOVER_EASING;
    state.boost *= BOOST_DECAY;
    setGlow(material, state.hover);

    const spinSpeed =
      personality.spinSpeed + state.hover * HOVER_SPIN + state.boost + Math.abs(store.scrollVelocity) * SCROLL_SPIN;
    const spin = spinSpeed * seconds * (store.reducedMotion ? REDUCED_MOTION_SPIN : 1);
    mesh.rotation.y += spin;
    mesh.rotation.x += spin * 0.45;

    mesh.position.x = baseX(placement, anchor, store) + store.smoothPointerX * 0.4 * (1 + placement.z * 0.15);
    mesh.position.y =
      baseY(placement, anchor, store, viewportHeight) +
      Math.sin(store.elapsed * BOB_SPEED + personality.bobPhase) * BOB_AMPLITUDE +
      store.smoothPointerY * 0.25;
    mesh.position.z = placement.z;

    let scale = placement.scale * (store.isMobile ? MOBILE_SCALE : 1) * (1 + state.hover * HOVER_SCALE);

    if (anchor === "hero") {
      const exit = smoothstep(scrollProgress.hero);
      if (scrollY < viewportHeight) mesh.position.y -= worldOffsetY;
      mesh.position.y += exit * 1.2;
      mesh.position.z = placement.z - exit * 6;
      scale *= 1 - exit;
      mesh.visible = !store.isMobile && scrollY < viewportHeight && exit < 0.995;
    } else {
      const screenOffset = -(mesh.position.y + worldOffsetY) / store.unitsPerPixel;
      mesh.visible = Math.abs(screenOffset) < viewportHeight * PAGE_VISIBILITY_RANGE;
    }

    mesh.scale.setScalar(Math.max(scale, 0.0001));
  });

  return <mesh ref={meshRef} geometry={geometry} material={material} rotation={personality.initialRotation} />;
}
