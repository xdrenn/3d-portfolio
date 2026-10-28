// Liquid holographic foil: molten swirls of purple / pink / cyan with thin dark seams
// between the layers and a bright chrome rim — the look of the Y2K holo star.
uniform sampler2D uEnvironmentMap;
uniform float uTime;
uniform float uGlow;
uniform float uSeed;
uniform vec3 uTint;

varying vec3 vNormal;
varying vec3 vViewDirection;
varying vec3 vLocalPosition;

const float TAU = 6.28318;
const float PI = 3.14159;
const vec3 LUMA = vec3(0.299, 0.587, 0.114);

vec2 equirectangularUv(vec3 direction) {
  return vec2(
    atan(direction.z, direction.x) / TAU + 0.5,
    asin(clamp(direction.y, -1.0, 1.0)) / PI + 0.5
  );
}

// Domain-warped sines: cheap "marbled liquid" pattern that slowly flows.
float flowField(vec3 p) {
  float t = uTime * 0.22 + uSeed;
  p += 0.65 * sin(p.yzx * 1.7 + t);
  p += 0.4 * sin(p.zxy * 2.9 - t * 1.3);
  return sin(p.x * 1.9) + sin(p.y * 2.3) + sin(p.z * 2.1);
}

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDirection = normalize(vViewDirection);
  if (!gl_FrontFacing) normal = -normal;

  float facing = clamp(dot(normal, viewDirection), 0.0, 1.0);
  float fresnel = pow(1.0 - facing, 3.0);
  float flow = flowField(vLocalPosition * 1.6 + normal * 0.9);

  float phase = flow * 0.17 + facing * 0.85 + uSeed * 0.1 + uTime * 0.02;
  vec3 film = 0.5 + 0.5 * cos(TAU * (phase + vec3(0.0, 0.33, 0.67)));
  film = pow(film, vec3(1.6)); // keep the colours rich after sRGB output
  film = mix(film, uTint, 0.38);

  vec3 reflected = texture2D(uEnvironmentMap, equirectangularUv(reflect(-viewDirection, normal))).rgb;
  float light = dot(reflected, LUMA);

  float seams = smoothstep(0.0, 0.2, abs(sin(flow * 2.4)));
  vec3 color = film * (0.22 + 0.95 * light) * mix(0.45, 1.0, seams);
  color += reflected * 0.22;
  color = mix(color, vec3(1.0), clamp(fresnel * 0.45 + pow(light, 6.0) * 0.55, 0.0, 1.0));
  color += film * uGlow * 0.3;

  gl_FragColor = vec4(color, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
