import { HERO } from "@/content/site";
import { WorkStage } from "@/sections/work/WorkSection";
import { ColorSwatches } from "./ColorSwatches";
import { GridToggle } from "./GridToggle";

/**
 * First screen: who and what on the left, with a footnote that proves the "code" half;
 * the swatches and where I work on the right; the computer in the middle.
 */
export function Hero() {
  return (
    <div className="hero page-padding">
      <div className="hero__rule" />

      <div className="hero__intro grid">
        <div className="hero__text">
          <h1 className="hero__lead">
            {HERO.lead}
          </h1>
        </div>
        <div className="hero__spec text-small">
          <ColorSwatches />
          <GridToggle />
        </div>
        <div className="hero__stage">
          <WorkStage />
        </div>
      </div>
    </div>
  );
}
