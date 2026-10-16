varying vec2 vUv;
varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec3 vTangent;
varying vec3 vBitangent;

void main() {
  vUv = uv;
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;

  mat3 modelRotation = mat3(modelMatrix);
  vNormal = normalize(modelRotation * normal);
  vTangent = normalize(modelRotation * vec3(1.0, 0.0, 0.0));
  vBitangent = normalize(modelRotation * vec3(0.0, 1.0, 0.0));

  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
