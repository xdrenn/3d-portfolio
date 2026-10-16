import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Color, LinearSRGBColorSpace, MathUtils, MeshBasicMaterial, Vector2, Vector3, type Group, type PerspectiveCamera } from "three";
import { degreesToRadians } from "@/lib/math";
import { CARD_SIZE, createEdgeGeometry, createFaceGeometry } from "./cardGeometry";
import { nearestFaceAngle, type CardMotion } from "./cardMotion";
import { createCardTextures, drawCardTextures } from "./cardTextures";
import { createFoilMaterial, type SharedFoilUniforms } from "./foilMaterial";

type CardSceneProps = {
  motion: CardMotion;
  shadowRef: RefObject<HTMLDivElement>;
  reducedMotion: boolean;
};

const EDGE_COLOR = 0xdcdce2;
const BASE_LIGHT = { x: -0.4, y: 0.6, z: 1 };
const FILL_WIDTH_RATIO = 0.78;
const FILL_HEIGHT_RATIO = 0.72;
const HOVER_TILT_Y = 16;
const HOVER_TILT_X = 12;
const MIN_SPIN_VELOCITY = 0.3;
const SPIN_DAMPING = 0.93;
const SETTLE_RATE_Y = 0.9;
const SETTLE_RATE_X = 0.92;
const SETTLED_EPSILON = 0.02;
const MIN_SHADOW_SCALE = 0.08;
/** Where the glare rests when the pointer is away: upper left, matching BASE_LIGHT. */
const GLARE_REST = { x: 0.3, y: 0.68 };
const GLARE_FOLLOW_RATE = 0.85;

const settleFactor = (rate: number, frames: number) => 1 - Math.pow(rate, frames);

function stepMotion(motion: CardMotion, frames: number) {
  if (motion.isDragging) return;

  if (Math.abs(motion.spinVelocity) > MIN_SPIN_VELOCITY) {
    motion.rotationY += motion.spinVelocity * frames;
    motion.spinVelocity *= Math.pow(SPIN_DAMPING, frames);
    motion.restingRotationY = nearestFaceAngle(motion.rotationY);
  } else {
    motion.spinVelocity = 0;
    const targetY = motion.restingRotationY + motion.hoverX * HOVER_TILT_Y;
    motion.rotationY += (targetY - motion.rotationY) * settleFactor(SETTLE_RATE_Y, frames);
  }

  const targetX = -motion.hoverY * HOVER_TILT_X;
  motion.rotationX += (targetX - motion.rotationX) * settleFactor(SETTLE_RATE_X, frames);
}

function isSettled(motion: CardMotion) {
  const targetY = motion.restingRotationY + motion.hoverX * HOVER_TILT_Y;
  const targetX = -motion.hoverY * HOVER_TILT_X;
  return (
    !motion.isDragging &&
    motion.spinVelocity === 0 &&
    Math.abs(motion.rotationY - targetY) < SETTLED_EPSILON &&
    Math.abs(motion.rotationX - targetX) < SETTLED_EPSILON
  );
}

function useCardTextures() {
  const renderer = useThree((state) => state.gl);
  const invalidate = useThree((state) => state.invalidate);
  const textures = useMemo(() => createCardTextures(renderer.capabilities.getMaxAnisotropy()), [renderer]);

  useEffect(() => {
    let isActive = true;
    const redraw = () => {
      if (!isActive) return;
      drawCardTextures(textures);
      invalidate();
    };

    redraw();
    document.fonts.load('400 100px "Inter Tight"').then(redraw).catch(() => undefined);
    document.fonts.ready.then(redraw);
    return () => {
      isActive = false;
    };
  }, [textures, invalidate]);

  return textures;
}

function useFitCameraToCard() {
  const size = useThree((state) => state.size);
  const camera = useThree((state) => state.camera) as PerspectiveCamera;
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    const aspect = size.width / Math.max(1, size.height);
    const viewHeightPerUnit = 2 * Math.tan(MathUtils.degToRad(camera.fov / 2));
    const distanceForWidth = CARD_SIZE.width / FILL_WIDTH_RATIO / (viewHeightPerUnit * aspect);
    const distanceForHeight = CARD_SIZE.height / FILL_HEIGHT_RATIO / viewHeightPerUnit;

    camera.position.z = Math.max(distanceForWidth, distanceForHeight);
    camera.updateProjectionMatrix();
    invalidate();
  }, [size, camera, invalidate]);
}

export function CardScene({ motion, shadowRef, reducedMotion }: CardSceneProps) {
  const invalidate = useThree((state) => state.invalidate);
  const groupRef = useRef<Group>(null);

  useEffect(() => {
    motion.requestFrame = () => invalidate();
    invalidate();
  }, [motion, invalidate]);

  useFitCameraToCard();
  const textures = useCardTextures();

  const sharedUniforms = useMemo<SharedFoilUniforms>(
    () => ({
      uLightDirection: { value: new Vector3(BASE_LIGHT.x, BASE_LIGHT.y, BASE_LIGHT.z) },
      uTime: { value: 0 },
      uGlare: { value: new Vector2(GLARE_REST.x, GLARE_REST.y) },
    }),
    [],
  );
  const faceGeometry = useMemo(createFaceGeometry, []);
  const edgeGeometry = useMemo(createEdgeGeometry, []);
  const frontMaterial = useMemo(
    () => createFoilMaterial("front", textures.inkFront, textures.heightFront, sharedUniforms),
    [textures, sharedUniforms],
  );
  const backMaterial = useMemo(
    () => createFoilMaterial("back", textures.inkBack, textures.heightBack, sharedUniforms),
    [textures, sharedUniforms],
  );
  const edgeMaterials = useMemo(
    () => [
      new MeshBasicMaterial({ visible: false }),
      new MeshBasicMaterial({ color: new Color().setHex(EDGE_COLOR, LinearSRGBColorSpace) }),
    ],
    [],
  );

  useFrame((state, delta) => {
    const frames = Math.min(delta * 60, 3);
    stepMotion(motion, frames);

    groupRef.current?.rotation.set(degreesToRadians(motion.rotationX), degreesToRadians(motion.rotationY), 0);
    sharedUniforms.uLightDirection.value.set(
      BASE_LIGHT.x + motion.hoverX * 1.4,
      BASE_LIGHT.y - motion.hoverY * 1.2,
      BASE_LIGHT.z,
    );
    if (!reducedMotion) sharedUniforms.uTime.value = state.clock.elapsedTime;

    // Glare follows the pointer; UV y points up, pointer y points down.
    const glare = sharedUniforms.uGlare.value;
    const glareTargetX = GLARE_REST.x + motion.hoverX * 1.1;
    const glareTargetY = GLARE_REST.y - motion.hoverY * 1.1;
    const follow = settleFactor(GLARE_FOLLOW_RATE, frames);
    glare.x += (glareTargetX - glare.x) * follow;
    glare.y += (glareTargetY - glare.y) * follow;
    const glareSettled = Math.abs(glareTargetX - glare.x) < 0.002 && Math.abs(glareTargetY - glare.y) < 0.002;

    const shadowScale = Math.max(MIN_SHADOW_SCALE, Math.abs(Math.cos(degreesToRadians(motion.rotationY))));
    shadowRef.current?.style.setProperty("--shadow-scale", shadowScale.toFixed(3));

    if (!isSettled(motion) || !glareSettled) invalidate();
  });

  return (
    <group ref={groupRef}>
      <mesh geometry={edgeGeometry} material={edgeMaterials} />
      <mesh geometry={faceGeometry} material={frontMaterial} position-z={CARD_SIZE.thickness / 2} />
      <mesh geometry={faceGeometry} material={backMaterial} rotation-y={Math.PI} position-z={-CARD_SIZE.thickness / 2} />
    </group>
  );
}
