import { Fragment, useEffect, useRef, useState } from "react";
import { ProjectMediaView } from "@/components/ProjectMediaView";
import { formatCategories, PROJECTS, wrapProjectIndex } from "@/content/projects";
import { ELEMENT_IDS } from "@/lib/elementIds";
import { usePortfolio } from "@/state/PortfolioContext";
import "./case-study.css";

const FOCUS_DELAY_MS = 50;

function useScrollLockAndFocusReturn(isOpen: boolean, onEscape: () => void) {
  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onEscape();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [isOpen, onEscape]);
}

export function CaseStudy() {
  const { openCaseIndex, openCase, closeCase } = usePortfolio();
  const isOpen = openCaseIndex !== null;
  const [lastShownIndex, setLastShownIndex] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (openCaseIndex !== null) setLastShownIndex(openCaseIndex);
  }, [openCaseIndex]);

  useScrollLockAndFocusReturn(isOpen, closeCase);

  useEffect(() => {
    if (!isOpen) return;
    const timer = window.setTimeout(() => closeButtonRef.current?.focus(), FOCUS_DELAY_MS);
    return () => clearTimeout(timer);
  }, [isOpen, openCaseIndex]);

  const projectIndex = openCaseIndex ?? lastShownIndex;
  const project = PROJECTS[projectIndex];
  const nextIndex = wrapProjectIndex(projectIndex + 1);

  const openNextProject = () => {
    rootRef.current?.scrollTo({ top: 0 });
    openCase(nextIndex);
  };

  return (
    <div
      ref={rootRef}
      className={`case-study${isOpen ? " is-open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={ELEMENT_IDS.caseStudyTitle}
    >
      <div className="case-study__bar grid page-padding">
        <span className="case-study__category">{formatCategories(project)}</span>
        <button ref={closeButtonRef} className="case-study__close hover-italic" onClick={closeCase}>
          Close
        </button>
      </div>

      <div className="case-study__body grid page-padding">
        <div className="case-study__info">
          <h2 id={ELEMENT_IDS.caseStudyTitle} className="case-study__title">
            {project.title}
          </h2>
          <p className="case-study__description">{project.description}</p>
          <dl className="case-study__details">
            {project.details.map(([label, value]) => (
              <Fragment key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </Fragment>
            ))}
          </dl>
        </div>

        <div className="case-study__media">
          {project.media.map((media) => (
            <ProjectMediaView key={media.name} media={media} alt={project.title} isActive={isOpen} />
          ))}
          <button className="case-study__next" onClick={openNextProject}>
            Next project<b className="case-study__next-title holo-bleed">{PROJECTS[nextIndex].title}</b>
          </button>
        </div>
      </div>
    </div>
  );
}
