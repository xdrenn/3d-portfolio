import { forwardRef, type ReactNode, type RefObject } from "react";
import "./computer.css";

type ComputerProps = {
  isPoweredOn: boolean;
  isBooted: boolean;
  screenRef: RefObject<HTMLDivElement>;
  children: ReactNode;
};

export const Computer = forwardRef<HTMLDivElement, ComputerProps>(function Computer(
  { isPoweredOn, isBooted, screenRef, children },
  ref,
) {
  return (
    <div className={`computer${isPoweredOn ? " is-on" : ""}`} ref={ref}>
      <div className="computer__shell">
        <Circuitry />
        <div className="computer__vents" aria-hidden="true" />
        <div className="computer__bezel">
          <div className={`computer__screen${isBooted ? " is-booted" : ""}`} ref={screenRef}>
            <div className="computer__boot-screen" aria-hidden="true">
              <em className="computer__boot-greeting">hello.</em>
            </div>
            {children}
          </div>
        </div>
        <div className="computer__chin">
          <span />
          <span className="computer__floppy-slot" aria-hidden="true" />
          <span className="computer__power-led" aria-hidden="true" />
        </div>
      </div>
      <div className="computer__stand" aria-hidden="true" />
    </div>
  );
});

const CIRCUIT_TRACES =
  "M30 120 H120 V60 H260 M30 200 H80 V320 H40 M860 140 H780 V90 H640 M860 260 H820 V420 H870 M30 560 H140 V640 H300 M860 600 H720 V700 H560 M200 700 V760 H420 M500 760 H700 V720";

const CIRCUIT_PADS = [
  [120, 60],
  [640, 90],
  [300, 640],
  [560, 700],
  [870, 420],
] as const;

const CIRCUIT_CHIPS = [
  { x: 40, y: 380, width: 60, height: 90 },
  { x: 800, y: 470, width: 50, height: 70 },
  { x: 330, y: 725, width: 240, height: 40 },
];

const CHIP_PINS = "M50 395 h40 M50 410 h40 M50 425 h40 M50 440 h40 M50 455 h40";

function Circuitry() {
  return (
    <div className="computer__circuitry" aria-hidden="true">
      <svg viewBox="0 0 900 800" preserveAspectRatio="none" fill="none" stroke="#5c6270" strokeWidth="1.4">
        <path d={CIRCUIT_TRACES} />
        {CIRCUIT_CHIPS.map((chip) => (
          <rect key={`${chip.x}-${chip.y}`} {...chip} rx="4" />
        ))}
        {CIRCUIT_PADS.map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="5" />
        ))}
        <path d={CHIP_PINS} strokeWidth="3" strokeDasharray="4 4" />
      </svg>
    </div>
  );
}
