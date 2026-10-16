import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { ELEMENT_IDS } from "@/lib/elementIds";
import { scrollToElement } from "@/lib/scroll";
import { DesktopWindowFrame, type DesktopWindowProps } from "./DesktopWindow";

export function CardFileWindow(props: DesktopWindowProps) {
  const reducedMotion = usePrefersReducedMotion();

  const showCard = () =>
    scrollToElement(document.getElementById(ELEMENT_IDS.holoCard), { reducedMotion, block: "center" });

  return (
    <DesktopWindowFrame {...props} title="card.holo">
      <div className="desktop-window__body desktop-window__body--paper">
        <p>This file is a physical object. It lives at the bottom of the page.</p>
      </div>
      <div className="desktop-window__footer">
        <span className="desktop-window__caption" />
        <button className="desktop-window__default-button" onClick={showCard}>
          Show the card
        </button>
      </div>
    </DesktopWindowFrame>
  );
}
