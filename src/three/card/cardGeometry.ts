import { ExtrudeGeometry, Shape, ShapeGeometry } from "three";

export const CARD_SIZE = {
  width: 1.7,
  height: 1.1,
  cornerRadius: 0.055,
  thickness: 0.012,
};

const CURVE_SEGMENTS = 10;

function createRoundedRectangle() {
  const { width, height, cornerRadius: radius } = CARD_SIZE;
  const halfWidth = width / 2;
  const halfHeight = height / 2;

  const shape = new Shape();
  shape.moveTo(-halfWidth + radius, -halfHeight);
  shape.lineTo(halfWidth - radius, -halfHeight);
  shape.quadraticCurveTo(halfWidth, -halfHeight, halfWidth, -halfHeight + radius);
  shape.lineTo(halfWidth, halfHeight - radius);
  shape.quadraticCurveTo(halfWidth, halfHeight, halfWidth - radius, halfHeight);
  shape.lineTo(-halfWidth + radius, halfHeight);
  shape.quadraticCurveTo(-halfWidth, halfHeight, -halfWidth, halfHeight - radius);
  shape.lineTo(-halfWidth, -halfHeight + radius);
  shape.quadraticCurveTo(-halfWidth, -halfHeight, -halfWidth + radius, -halfHeight);
  return shape;
}

export function createFaceGeometry() {
  const geometry = new ShapeGeometry(createRoundedRectangle(), CURVE_SEGMENTS);
  const positions = geometry.attributes.position;
  const uvs = geometry.attributes.uv;

  for (let vertex = 0; vertex < positions.count; vertex++) {
    uvs.setXY(
      vertex,
      positions.getX(vertex) / CARD_SIZE.width + 0.5,
      positions.getY(vertex) / CARD_SIZE.height + 0.5,
    );
  }
  return geometry;
}

export function createEdgeGeometry() {
  const geometry = new ExtrudeGeometry(createRoundedRectangle(), {
    depth: CARD_SIZE.thickness,
    bevelEnabled: false,
    curveSegments: CURVE_SEGMENTS,
  });
  geometry.translate(0, 0, -CARD_SIZE.thickness / 2);
  return geometry;
}
