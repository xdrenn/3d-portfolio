precision highp float;

uniform sampler2D uInkMap;
uniform sampler2D uHeightMap;
uniform vec3 uLightDirection;
uniform float uIsPaper;
uniform float uTime;
uniform vec2 uGlare;

varying vec2 vUv;
varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec3 vTangent;
varying vec3 vBitangent;

/*
 * Flat diffraction foil.
 * Colour comes from the reflection angle (as on the earlier version): saturated rainbow
 * with diffraction bands and a silver sheet, broken up by soft streaks.
 * On top: large soft colour rivers that pour across the card as it tilts,
 * and long linear light reflections.
 * No relief, no round glare, no per-pixel sparkles or grain, so nothing looks pixelated.
 */

float hash(vec2 point) {
  return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453);
}

float valueNoise(vec2 point) {
  vec2 cell = floor(point);
  vec2 local = fract(point);
  local = local * local * (3.0 - 2.0 * local);
  float bottom = mix(hash(cell), hash(cell + vec2(1.0, 0.0)), local.x);
  float top = mix(hash(cell + vec2(0.0, 1.0)), hash(cell + vec2(1.0, 1.0)), local.x);
  return mix(bottom, top, local.y);
}

float fbm(vec2 point) {
  return 0.55 * valueNoise(point) + 0.3 * valueNoise(point * 2.13 + 7.1) + 0.15 * valueNoise(point * 4.37 + 3.3);
}

// Classic diffraction rainbow, slightly lifted towards white.
vec3 rainbow(float phase) {
  vec3 color = 0.5 + 0.5 * cos(6.28318 * (phase + vec3(0.0, 0.33, 0.67)));
  return mix(color, vec3(1.0), 0.12);
}

// Holographic film palette: peach, pink, violet, blue, cyan, mint, yellow.
vec3 filmSpectrum(float phase) {
  float t = fract(phase) * 7.0;
  vec3 color = mix(vec3(1.0, 0.72, 0.6), vec3(1.0, 0.5, 0.85), smoothstep(0.0, 1.0, t));
  color = mix(color, vec3(0.62, 0.48, 1.0), smoothstep(1.0, 2.0, t));
  color = mix(color, vec3(0.38, 0.56, 1.0), smoothstep(2.0, 3.0, t));
  color = mix(color, vec3(0.4, 0.92, 1.0), smoothstep(3.0, 4.0, t));
  color = mix(color, vec3(0.55, 1.0, 0.72), smoothstep(4.0, 5.0, t));
  color = mix(color, vec3(1.0, 0.95, 0.55), smoothstep(5.0, 6.0, t));
  return mix(color, vec3(1.0, 0.72, 0.6), smoothstep(6.0, 7.0, t));
}

void main() {
  vec3 normal = normalize(vNormal);
  vec3 tangent = normalize(vTangent);
  vec3 bitangent = normalize(vBitangent);
  if (!gl_FrontFacing) normal = -normal;

  vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
  vec3 lightDirection = normalize(uLightDirection);
  vec3 reflection = reflect(-viewDirection, normal);
  float lightAlignment = max(dot(reflection, lightDirection), 0.0);
  float facing = clamp(dot(viewDirection, normal), 0.0, 1.0);
  float fresnel = pow(1.0 - facing, 3.0);

  // Paper side: only the sparkle is foil, the rest is flat paper.
  float height = texture2D(uHeightMap, vUv).r;
  float foilMask = uIsPaper > 0.5 ? smoothstep(0.4, 0.5, height) : 1.0;

  vec2 tilt = vec2(dot(viewDirection, tangent), dot(viewDirection, bitangent));
  vec2 pointer = uIsPaper > 0.5 ? vec2(1.0 - uGlare.x, uGlare.y) : uGlare;

  // Soft streaks across the foil (colour only, they never bend the surface).
  float streaks = fbm(vUv * vec2(3.0, 8.0));
  float drift = fbm(vUv * vec2(1.6, 3.2) + 3.0);

  // Large colour rivers that move with tilt and time.
  vec2 flowPoint = vUv * vec2(1.6, 1.05) + tilt * 0.55 + vec2(uTime * 0.008, 0.0);
  vec2 warp = vec2(fbm(flowPoint * 0.9 + 3.1), fbm(flowPoint * 0.9 + 8.7)) - 0.5;
  float flow = fbm(flowPoint + warp * 1.4);

  // Diffraction phase: follows the reflection angle, so colours shift as the card turns.
  float phase = dot(reflection, tangent) * 1.6
    + dot(reflection, bitangent) * 0.9
    + tilt.x * 0.8
    + vUv.x * 0.9
    + vUv.y * 0.35
    + drift * 0.55
    + streaks * 0.12
    + flow * 0.7
    + uTime * 0.012;

  vec3 holo = mix(rainbow(phase), filmSpectrum(phase * 0.8 + 0.1), 0.4);
  // A touch more saturation, so the foil reads as colour, not as grey metal.
  holo = clamp(mix(vec3(dot(holo, vec3(0.299, 0.587, 0.114))), holo, 1.25), 0.0, 1.0);
  float band = 0.5 + 0.5 * sin(phase * 4.2 + drift * 2.0);

  // Silver sheet lit by the studio from above.
  float sky = 0.55 + 0.45 * clamp(reflection.y * 0.8 + 0.4, 0.0, 1.0);
  vec3 silver = vec3(0.78 + 0.22 * sky) * (0.93 + 0.07 * streaks);

  // Some areas lean silver, others full colour, the diffraction bands sit on top.
  float colorField = smoothstep(0.25, 0.75, fbm(flowPoint * 0.7 + 12.4 - tilt * 0.4));
  float colorAmount = clamp(0.6 + 0.22 * band + 0.18 * colorField, 0.0, 0.96);
  vec3 foil = mix(silver, holo * (0.82 + 0.34 * sky), colorAmount);
  foil *= 0.96 + 0.12 * band;

  // Long soft reflections across the card: the main one follows the pointer, a fainter one trails it.
  vec2 bandDirection = normalize(vec2(0.82, -0.57));
  float bandCoord = dot(vUv - pointer, bandDirection) + tilt.x * 0.35;
  float reflections = exp(-bandCoord * bandCoord * 9.0) * 0.3 + exp(-pow(bandCoord + 0.42, 2.0) * 22.0) * 0.13;
  foil = mix(foil, vec3(1.0), reflections * 0.42);
  foil += reflections * 0.18 * holo;

  // Gentle studio light and rim colour (broad, no hot spot).
  foil += pow(lightAlignment, 8.0) * 0.18 * mix(vec3(1.0), holo, 0.4);
  foil += fresnel * 0.18 * holo;

  vec3 color = min(foil, vec3(1.0));

  if (uIsPaper > 0.5) {
    // Smooth uncoated paper: a barely visible tone variation, no grain or relief.
    float tone = valueNoise(vUv * vec2(9.0, 6.0)) * 0.012;
    vec3 paper = vec3(0.962, 0.958, 0.948) - tone;
    paper *= 0.9 + 0.1 * max(dot(normal, lightDirection), 0.0) + 0.04 * pow(lightAlignment, 6.0);
    color = mix(paper, color, foilMask);
  }

  // Ink printed flat on top, with a faint satin sheen.
  vec4 inkSample = texture2D(uInkMap, vUv);
  vec3 inkColor = max(inkSample.rgb * 0.9, vec3(0.018));
  inkColor += pow(lightAlignment, 30.0) * 0.16 + fresnel * 0.04;
  color = mix(color, inkColor, inkSample.a * 0.97);

  gl_FragColor = vec4(color, 1.0);
}
