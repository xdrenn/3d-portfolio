import {
  BoxGeometry,
  BufferGeometry,
  Curve,
  CylinderGeometry,
  ExtrudeGeometry,
  IcosahedronGeometry,
  LatheGeometry,
  Path,
  Quaternion,
  Shape,
  SphereGeometry,
  TorusGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
  type ExtrudeGeometryOptions,
} from "three";
import { mergeGeometries, mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { degreesToRadians } from "@/lib/math";

const LATHE_AXIS_OFFSET = 1e-4;

// ─── helpers ────────────────────────────────────────────────────────────────

/** Rounded, "inflated" extrusion: thin core + deep round bevel = pillowy chrome sticker. */
function inflate(shape: Shape, puff: number, options: Partial<ExtrudeGeometryOptions> = {}) {
  const geometry = new ExtrudeGeometry(shape, {
    depth: puff * 0.3,
    bevelEnabled: true,
    bevelThickness: puff,
    bevelSize: puff * 0.55,
    bevelSegments: 10,
    curveSegments: 32,
    ...options,
  });
  geometry.center();
  return geometry;
}

/** Same vertex merged, normals smooth: needed before we push the surface around. */
function smoothIndexed(geometry: BufferGeometry) {
  geometry.deleteAttribute("normal");
  geometry.deleteAttribute("uv");
  const merged = mergeVertices(geometry);
  merged.computeVertexNormals();
  return merged;
}

/** Push every vertex along its normal by `amount(x, y, z)` — lumps, dents, wobble. */
function displaceAlongNormals(geometry: BufferGeometry, amount: (x: number, y: number, z: number) => number) {
  const position = geometry.attributes.position;
  const normal = geometry.attributes.normal;
  for (let index = 0; index < position.count; index++) {
    const x = position.getX(index);
    const y = position.getY(index);
    const z = position.getZ(index);
    const push = amount(x, y, z);
    position.setXYZ(
      index,
      x + normal.getX(index) * push,
      y + normal.getY(index) * push,
      z + normal.getZ(index) * push,
    );
  }
  position.needsUpdate = true;
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

type Ray = [angleDegrees: number, length: number];

/** Star with any number of rays of any length. `soft` bends the edges inward like a puffy sticker. */
function createStarShape(rays: Ray[], innerRadius: number, soft = false) {
  const point = (angle: number, radius: number) =>
    new Vector2(Math.cos(degreesToRadians(angle)) * radius, Math.sin(degreesToRadians(angle)) * radius);

  const sorted = [...rays].sort((a, b) => a[0] - b[0]);
  const shape = new Shape();
  const first = point(sorted[0][0], sorted[0][1]);
  shape.moveTo(first.x, first.y);

  sorted.forEach(([angle], index) => {
    const [nextAngle, nextLength] = sorted[(index + 1) % sorted.length];
    const gap = (nextAngle - angle + 360) % 360;
    const valley = point(angle + gap / 2, innerRadius);
    const tip = point(nextAngle, nextLength);
    if (soft) {
      shape.quadraticCurveTo(valley.x, valley.y, tip.x, tip.y);
    } else {
      shape.lineTo(valley.x, valley.y);
      shape.lineTo(tip.x, tip.y);
    }
  });
  return shape;
}

/** Four-point "✦" sparkle with concave sides. Arm lengths: top, right, bottom, left. */
function createSparkleShape(top: number, right: number, bottom: number, left: number, pinch: number) {
  const shape = new Shape();
  shape.moveTo(0, top);
  shape.quadraticCurveTo(pinch, pinch, right, 0);
  shape.quadraticCurveTo(pinch, -pinch, 0, -bottom);
  shape.quadraticCurveTo(-pinch, -pinch, -left, 0);
  shape.quadraticCurveTo(-pinch, pinch, 0, top);
  return shape;
}

// ─── shapes from the moodboard ──────────────────────────────────────────────

/** Ragged, asymmetric Y2K starburst — the stretched liquid-chrome star. */
export function createStarburstGeometry() {
  const shape = createStarShape(
    [
      [8, 1.35],
      [58, 0.95],
      [138, 0.55],
      [208, 1.7],
      [290, 0.62],
    ],
    0.3,
  );
  return inflate(shape, 0.16, { bevelSize: 0.07, curveSegments: 4 });
}

/** Soft five-point star, puffed like a pool toy. */
export function createPuffyStarGeometry() {
  const rays: Ray[] = [90, 162, 234, 306, 18].map((angle): Ray => [angle, 1]);
  return inflate(createStarShape(rays, 0.45, true), 0.24, { bevelSize: 0.12 });
}

/** Classic chrome "✦" sparkle, slightly tall. */
export function createSparkleGeometry() {
  return inflate(createSparkleShape(1.2, 0.85, 1.2, 0.85, 0.16), 0.15, { bevelSize: 0.06 });
}

/** Long needle sparkle with a little hole in the middle. */
export function createNeedleStarGeometry() {
  const shape = createSparkleShape(0.6, 0.45, 2.3, 0.45, 0.15);
  const hole = new Path();
  hole.absarc(0, 0.02, 0.075, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  return inflate(shape, 0.06, { bevelSize: 0.025, bevelSegments: 6 });
}

/** Sparkle with a thin ring around it, like a little planet. */
export function createSparkleRingGeometry() {
  const sparkle = createSparkleGeometry();
  sparkle.scale(0.7, 0.7, 0.7);
  const ring = new TorusGeometry(1.0, 0.035, 12, 140).toNonIndexed();
  ring.rotateX(degreesToRadians(72));
  ring.rotateZ(degreesToRadians(-18));
  return mergeGeometries([sparkle, ring])!;
}

/** Two small sparkles orbiting a ring. */
export function createTwinSparkleRingGeometry() {
  const big = createSparkleGeometry();
  big.scale(0.45, 0.45, 0.45);
  big.translate(0.62, -0.38, 0.25);
  const small = createSparkleGeometry();
  small.scale(0.3, 0.3, 0.3);
  small.translate(-0.6, 0.4, -0.2);
  const ring = new TorusGeometry(0.85, 0.05, 12, 120).toNonIndexed();
  ring.rotateX(degreesToRadians(68));
  return mergeGeometries([big, small, ring])!;
}

/** Twisted ribbon / folded foil strip. */
export function createTwistRibbonGeometry() {
  const geometry = new BoxGeometry(0.55, 2.4, 0.05, 8, 140, 1);
  const position = geometry.attributes.position;
  for (let index = 0; index < position.count; index++) {
    const x = position.getX(index);
    const y = position.getY(index);
    const z = position.getZ(index);
    const twist = y * 1.5;
    const bend = Math.sin(y * 1.3) * 0.28;
    position.setXYZ(index, x * Math.cos(twist) - z * Math.sin(twist) + bend, y, x * Math.sin(twist) + z * Math.cos(twist));
  }
  geometry.computeVertexNormals();
  return geometry;
}

/** Lumpy liquid blob. `seed` changes the lumps so no two look alike. */
export function createHoloBlobGeometry(seed = 0) {
  const geometry = smoothIndexed(new SphereGeometry(1, 96, 64));
  return displaceAlongNormals(
    geometry,
    (x, y, z) =>
      0.17 * Math.sin(x * 2.6 + seed) * Math.sin(y * 2.2 + seed * 0.7) +
      0.12 * Math.sin(z * 3.4 + y * 1.8 + seed * 1.3) +
      0.06 * Math.sin(x * 5.1 - z * 4.2 + seed * 2.1),
  );
}

/** Melted, wobbly ring. */
export function createSquishyRingGeometry() {
  const geometry = smoothIndexed(new TorusGeometry(0.8, 0.3, 48, 160));
  return displaceAlongNormals(geometry, (x, y, z) => {
    const angle = Math.atan2(y, x);
    return 0.09 * Math.sin(angle * 5) + 0.05 * Math.sin(angle * 9 + z * 6) + 0.04 * Math.sin(z * 9);
  });
}

/** Liquid drop with a sharp tip. */
export function createDropletGeometry() {
  const steps = 64;
  const profile: Vector2[] = [];
  for (let step = 0; step <= steps; step++) {
    const theta = Math.PI - (step / steps) * Math.PI; // bottom → tip
    const radius = Math.sin(theta) * Math.pow(Math.sin(theta / 2), 1.4) * 0.8;
    profile.push(new Vector2(radius + LATHE_AXIS_OFFSET, Math.cos(theta) * 1.1));
  }
  const geometry = new LatheGeometry(profile, 64);
  geometry.computeVertexNormals();
  return geometry;
}

class HelixCurve extends Curve<Vector3> {
  constructor(
    private radius: number,
    private height: number,
    private turns: number,
  ) {
    super();
  }

  getPoint(t: number, target = new Vector3()) {
    const angle = t * this.turns * Math.PI * 2;
    // the coil fattens in the middle — reads less "technical", more toy-like
    const radius = this.radius * (0.75 + 0.35 * Math.sin(t * Math.PI));
    return target.set(Math.cos(angle) * radius, (t - 0.5) * this.height, Math.sin(angle) * radius);
  }
}

/** Chrome spring / phone-cord coil. */
export function createSpringGeometry() {
  return new TubeGeometry(new HelixCurve(0.38, 2.0, 5.5), 420, 0.075, 14, false);
}

/** Geodesic wire ball: chrome rods on icosphere edges + beads in the joints. */
export function createWireOrbGeometry() {
  const source = new IcosahedronGeometry(1, 1);
  const position = source.attributes.position;
  const key = (v: Vector3) => `${v.x.toFixed(3)},${v.y.toFixed(3)},${v.z.toFixed(3)}`;
  const vertices = new Map<string, Vector3>();
  const edges = new Map<string, [Vector3, Vector3]>();

  for (let index = 0; index < position.count; index += 3) {
    const corners = [0, 1, 2].map((offset) => new Vector3().fromBufferAttribute(position, index + offset));
    corners.forEach((corner, cornerIndex) => {
      vertices.set(key(corner), corner);
      const next = corners[(cornerIndex + 1) % 3];
      const edgeKey = [key(corner), key(next)].sort().join("|");
      edges.set(edgeKey, [corner, next]);
    });
  }

  const up = new Vector3(0, 1, 0);
  const parts: BufferGeometry[] = [];
  for (const [start, end] of edges.values()) {
    const direction = new Vector3().subVectors(end, start);
    const rod = new CylinderGeometry(0.028, 0.028, direction.length(), 8, 1, true);
    rod.applyQuaternion(new Quaternion().setFromUnitVectors(up, direction.normalize()));
    const middle = new Vector3().addVectors(start, end).multiplyScalar(0.5);
    rod.translate(middle.x, middle.y, middle.z);
    parts.push(rod);
  }
  for (const vertex of vertices.values()) {
    const bead = new SphereGeometry(0.065, 12, 8);
    bead.translate(vertex.x, vertex.y, vertex.z);
    parts.push(bead);
  }
  return mergeGeometries(parts)!;
}
