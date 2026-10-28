varying vec3 vNormal;
varying vec3 vViewDirection;
varying vec3 vLocalPosition;

void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vLocalPosition = position;
  vNormal = normalize(mat3(modelMatrix) * normal);
  vViewDirection = normalize(cameraPosition - worldPosition.xyz);
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
