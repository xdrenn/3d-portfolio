uniform sampler2D uEnvironmentMap;
uniform float uTime;
uniform float uGlow;

varying vec3 vNormal;
varying vec3 vViewDirection;
varying vec3 vWorldPosition;

const float TAU = 6.28318;
const float PI = 3.14159;
const vec3 LUMA = vec3(0.299, 0.587, 0.114);

vec2 equirectangularUv(vec3 direction) {
  return vec2(
    atan(direction.z, direction.x) / TAU + 0.5,
    asin(clamp(direction.y, -1.0, 1.0)) / PI + 0.5
  );
}

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDirection = normalize(vViewDirection);
  if (!gl_FrontFacing) normal = -normal;

  float facing = clamp(abs(dot(normal, viewDirection)), 0.0, 1.0);
  float fresnel = pow(1.0 - facing, 2.0);

  float phase = facing * 1.6 + dot(normal, vec3(0.35, 0.8, 0.3)) * 0.7 + vWorldPosition.y * 0.1 + uTime * 0.05;
  vec3 film = 0.5 + 0.5 * cos(TAU * (phase + vec3(0.0, 0.33, 0.67)));
  film = mix(film, vec3(1.0), 0.2);

  vec3 reflected = texture2D(uEnvironmentMap, equirectangularUv(reflect(-viewDirection, normal))).rgb;
  vec3 refracted = texture2D(uEnvironmentMap, equirectangularUv(refract(-viewDirection, normal, 0.7))).rgb;
  float darkness = 1.0 - dot(reflected, LUMA);

  vec3 color = mix(
    refracted * mix(vec3(1.0), film, 0.45),
    reflected * mix(vec3(1.0), film, 0.6),
    0.35 + 0.55 * fresnel
  );
  color += film * uGlow * 0.25;

  float alpha = 0.16 + 0.62 * fresnel + darkness * 0.35 * fresnel + uGlow * 0.1;
  gl_FragColor = vec4(color, clamp(alpha, 0.0, 0.95));
}
