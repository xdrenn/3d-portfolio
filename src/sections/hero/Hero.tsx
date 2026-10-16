import { OWNER_HANDLE } from "@/content/site";
import { ColorSwatches } from "./ColorSwatches";
import { ProjectIndex } from "./ProjectIndex";
import { SpinningBadge } from "./SpinningBadge";
import { Wordmark } from "./Wordmark";

export function Hero() {
  return (
    <div className="hero page-padding">
      <div className="hero__rule" />

      <div className="hero__intro grid">
        <p className="hero__lead">
          Hi, I’m Anastasia.<br /> <em>I design and develop websites.</em>
        </p>
        <div className="hero__spec text-small">
          <ColorSwatches />
        </div>
        <SpinningBadge />
        <ProjectIndex />
      </div>

      <div className="hero__name grid">
        <Wordmark text={OWNER_HANDLE} />
      </div>

      <div className="hero__footer grid text-small">
        <span className="hero__scroll-cue">Scroll</span>
      </div>
    </div>
  );
}
