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
          <span className="computer__sticker" aria-hidden="true" />
          <span className="computer__floppy-slot" aria-hidden="true" />
          <span className="computer__power-led" aria-hidden="true" />
        </div>
      </div>
      <div className="computer__stand" aria-hidden="true" />
    </div>
  );
});
