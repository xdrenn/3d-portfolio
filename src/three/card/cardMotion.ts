export type CardMotion = {
  rotationX: number;
  rotationY: number;
  spinVelocity: number;
  restingRotationY: number;
  hoverX: number;
  hoverY: number;
  isDragging: boolean;
  dragDistance: number;
  lastPointerX: number;
  lastPointerY: number;
  requestFrame: () => void;
};

export const HALF_TURN = 180;
export const KEYBOARD_SPIN_VELOCITY = 7;

export const createCardMotion = (): CardMotion => ({
  rotationX: 8,
  rotationY: -22,
  spinVelocity: 0,
  restingRotationY: 0,
  hoverX: 0,
  hoverY: 0,
  isDragging: false,
  dragDistance: 0,
  lastPointerX: 0,
  lastPointerY: 0,
  requestFrame: () => {},
});

export const nearestFaceAngle = (angle: number) => Math.round(angle / HALF_TURN) * HALF_TURN;

export function flipCard(motion: CardMotion) {
  motion.spinVelocity = 0;
  motion.restingRotationY = nearestFaceAngle(motion.rotationY) + HALF_TURN;
  motion.requestFrame();
}

export function spinCard(motion: CardMotion, velocity: number) {
  motion.spinVelocity = velocity;
  motion.requestFrame();
}
