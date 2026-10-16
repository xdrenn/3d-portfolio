import { ExtrudeGeometry, LatheGeometry, Shape, Vector2 } from "three";

const CAPSULE_ARC_STEPS = 16;
const CAPSULE_RADIAL_SEGMENTS = 40;
const LATHE_AXIS_OFFSET = 1e-4;

export function createCapsuleGeometry(radius: number, length: number) {
  const profile: Vector2[] = [];
  const addArc = (startAngle: number, centerY: number) => {
    for (let step = 0; step <= CAPSULE_ARC_STEPS; step++) {
      const angle = startAngle + (step / CAPSULE_ARC_STEPS) * (Math.PI / 2);
      profile.push(new Vector2(Math.cos(angle) * radius + LATHE_AXIS_OFFSET, Math.sin(angle) * radius + centerY));
    }
  };

  addArc(-Math.PI / 2, -length / 2);
  addArc(0, length / 2);
  return new LatheGeometry(profile, CAPSULE_RADIAL_SEGMENTS);
}

export function createSparkleGeometry() {
  const pinch = 0.12;
  const shape = new Shape();
  shape.moveTo(0, 1);
  shape.quadraticCurveTo(pinch, pinch, 1, 0);
  shape.quadraticCurveTo(pinch, -pinch, 0, -1);
  shape.quadraticCurveTo(-pinch, -pinch, -1, 0);
  shape.quadraticCurveTo(-pinch, pinch, 0, 1);

  const geometry = new ExtrudeGeometry(shape, {
    depth: 0.14,
    bevelEnabled: true,
    bevelThickness: 0.16,
    bevelSize: 0.09,
    bevelSegments: 10,
    curveSegments: 40,
  });
  geometry.center();
  return geometry;
}

export function createCrystalGeometry(length: number) {
  const profile = [
    new Vector2(0, -length / 2 - 0.45),
    new Vector2(0.32, -length / 2),
    new Vector2(0.32, length / 2),
    new Vector2(0, length / 2 + 0.6),
  ];
  const geometry = new LatheGeometry(profile, 6).toNonIndexed();
  geometry.computeVertexNormals();
  return geometry;
}
