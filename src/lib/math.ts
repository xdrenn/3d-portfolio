export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const smoothstep = (t: number) => t * t * (3 - 2 * t);

export const degreesToRadians = (degrees: number) => (degrees * Math.PI) / 180;

export const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);
