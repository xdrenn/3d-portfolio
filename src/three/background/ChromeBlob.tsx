import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { SphereGeometry, type Group, type Mesh, type Texture } from "three";
import { smoothstep } from "@/lib/math";
import { scrollProgress } from "@/state/scrollProgress";
import { createChromeMaterial } from "./materials";
import { createObject } from "./objectCatalog";
import { useSceneStore } from "./sceneStore";

const BLOB_RADIUS = 1.35;
const BLOB_ROUGHNESS = 0.04;
const BOUNDING_SPHERE_MARGIN = 1.6;
const DEFORMATION_STRENGTH = 0.11;
const KICK_AMPLIFICATION = 1.6;
const HOVER_KICK = 0.25;
const RING_SCALE = 2.15;
const BUBBLE_SCALE = 0.55;
const BUBBLE_ORBIT_RADIUS = 1.9;
const SCREEN_X = { desktop: 0.63, mobile: 0.8 };

function createBlobGeometry() {
  const geometry = new SphereGeometry(BLOB_RADIUS, 96, 64);
  const restPositions = Float32Array.from(geometry.attributes.position.array as ArrayLike<number>);
  geometry.computeBoundingSphere();
  if (geometry.boundingSphere) geometry.boundingSphere.radius *= BOUNDING_SPHERE_MARGIN;
  return { geometry, restPositions };
}

function deformBlob(geometry: SphereGeometry, restPositions: Float32Array, time: number, amplitude: number) {
  const positions = geometry.attributes.position.array as Float32Array;

  for (let index = 0; index < positions.length; index += 3) {
    const x = restPositions[index];
    const y = restPositions[index + 1];
    const z = restPositions[index + 2];
    const wave =
      Math.sin(x * 2.1 + time * 1.1) * Math.sin(y * 2.5 + time * 0.9) * Math.sin(z * 1.9 + time * 0.7) +
      0.45 * Math.sin((x + y) * 2.8 - time * 1.3) +
      0.25 * Math.sin(z * 4.2 + time * 1.7);
    const stretch = 1 + DEFORMATION_STRENGTH * amplitude * wave;

    positions[index] = x * stretch;
    positions[index + 1] = y * stretch;
    positions[index + 2] = z * stretch;
  }

  geometry.attributes.position.needsUpdate = true;
  geometry.computeVertexNormals();
}

export function ChromeBlob({ environmentMap }: { environmentMap: Texture }) {
  const store = useSceneStore();
  const groupRef = useRef<Group>(null);
  const blobRef = useRef<Mesh>(null);
  const ringRef = useRef<Mesh>(null);
  const bubbleRef = useRef<Mesh>(null);

  const { geometry, restPositions } = useMemo(createBlobGeometry, []);
  const blobMaterial = useMemo(() => createChromeMaterial(BLOB_ROUGHNESS), []);
  const ring = useMemo(() => createObject("ring", { environmentMap, time: store.timeUniform }), [environmentMap, store]);
  const bubble = useMemo(
    () => createObject("bubble", { environmentMap, time: store.timeUniform }),
    [environmentMap, store],
  );

  useEffect(() => {
    deformBlob(geometry, restPositions, 0, 1);

    const blob = blobRef.current;
    if (!blob) return;

    store.interactives.set(blob, {
      onClick: () => {
        store.blobKick = 1;
      },
      onHover: () => {
        store.blobKick = Math.max(store.blobKick, HOVER_KICK);
      },
      isVisible: () => groupRef.current?.visible ?? false,
    });
    return () => {
      store.interactives.delete(blob);
    };
  }, [store, geometry, restPositions]);

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;

    const scrollY = window.scrollY;
    const exit = smoothstep(scrollProgress.hero);
    const isHeroOnScreen = scrollY < window.innerHeight * 1.02;
    const screenX = store.isMobile ? SCREEN_X.mobile : SCREEN_X.desktop;

    group.position.set(
      store.viewWidth * (screenX - 0.5),
      store.blobOffsetY - scrollY * store.unitsPerPixel + exit * 1.4,
      -exit * 5,
    );
    group.scale.setScalar(Math.max(0.0001, store.blobScale * (1 - exit)));
    group.visible = isHeroOnScreen && exit < 0.995;

    if (isHeroOnScreen && (!store.reducedMotion || store.blobKick > 0.01)) {
      deformBlob(geometry, restPositions, store.elapsed, 1 + store.blobKick * KICK_AMPLIFICATION);
    }

    group.rotation.y = store.smoothPointerX * 0.45 + store.elapsed * 0.07;
    group.rotation.x = -store.smoothPointerY * 0.25;

    const time = store.elapsed;
    if (ringRef.current) ringRef.current.rotation.z = time * 0.3;
    bubbleRef.current?.position.set(
      Math.cos(time * 0.5) * BUBBLE_ORBIT_RADIUS,
      Math.sin(time * 0.7) * 0.6,
      Math.sin(time * 0.5) * BUBBLE_ORBIT_RADIUS,
    );
  });

  return (
    <group ref={groupRef}>
      <mesh ref={blobRef} geometry={geometry} material={blobMaterial} />
      <mesh ref={ringRef} geometry={ring.geometry} material={ring.material} scale={RING_SCALE} rotation-x={1.2} />
      <mesh ref={bubbleRef} geometry={bubble.geometry} material={bubble.material} scale={BUBBLE_SCALE} />
    </group>
  );
}
