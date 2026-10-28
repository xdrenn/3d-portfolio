import { useCallback, useRef, useState } from "react";
import { formatCategories, PROJECTS } from "@/content/projects";
import { ProjectMediaView } from "@/components/ProjectMediaView";
import { isPhoneLayout } from "@/lib/breakpoints";
import { projectFileName } from "./desktopFiles";
import { DesktopWindowFrame, type DesktopWindowProps } from "./DesktopWindow";

type ProjectWindowProps = DesktopWindowProps & {
  projectIndex: number;
  onOpenCase: (projectIndex: number) => void;
};

type ViewerSize = { width: number; height: number };

type ViewerLimits = { maxWidthRatio: number; maxHeightRatio: number; verticalMarginRatio: number };

const DESKTOP_LIMITS: ViewerLimits = { maxWidthRatio: 0.6, maxHeightRatio: 0.8, verticalMarginRatio: 0.08 };
/** On a phone the picture takes all the room there is: the whole screen under the menu bar. */
const PHONE_LIMITS: ViewerLimits = { maxWidthRatio: 1, maxHeightRatio: 1, verticalMarginRatio: 0 };
/** Height of the menu bar on phones (desktop.css). */
const PHONE_MENUBAR_HEIGHT = 22;
const MIN_WIDTH = 220;
const FALLBACK_ASPECT = 4 / 3;

function computeViewerSize(aspect: number, screenWidth: number, screenHeight: number, chromeHeight: number): ViewerSize {
  const phone = isPhoneLayout();
  const limits = phone ? PHONE_LIMITS : DESKTOP_LIMITS;
  const usableHeight = phone ? screenHeight - PHONE_MENUBAR_HEIGHT : screenHeight;
  const maxWidth = screenWidth * limits.maxWidthRatio;
  const maxHeight = usableHeight * limits.maxHeightRatio - chromeHeight - usableHeight * limits.verticalMarginRatio;

  let width = maxWidth;
  let height = width / aspect;
  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspect;
  }

  width = Math.max(width, Math.min(MIN_WIDTH, maxWidth));
  height = Math.min(height, width / aspect);
  return { width, height };
}

export function ProjectWindow({ projectIndex, onOpenCase, ...windowProps }: ProjectWindowProps) {
  const project = PROJECTS[projectIndex];
  const mediaCount = project.media.length;
  const { screenRef } = windowProps;

  const [mediaIndex, setMediaIndex] = useState(0);
  const [viewerSize, setViewerSize] = useState<ViewerSize | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  const fitToMedia = useCallback(
    (naturalWidth: number, naturalHeight: number) => {
      const screen = screenRef.current;
      const frame = frameRef.current;
      if (!screen || !frame) return;

      const aspect = naturalWidth && naturalHeight ? naturalWidth / naturalHeight : FALLBACK_ASPECT;
      const barHeight = frame.querySelector<HTMLElement>(".desktop-window__bar")?.offsetHeight ?? 0;
      const footerHeight = footerRef.current?.offsetHeight ?? 0;
      const chromeHeight = barHeight + footerHeight + 2;

      setViewerSize(computeViewerSize(aspect, screen.clientWidth, screen.clientHeight, chromeHeight));
    },
    [screenRef],
  );

  const showMedia = (step: number) => setMediaIndex((current) => (current + step + mediaCount) % mediaCount);

  return (
    <DesktopWindowFrame
      {...windowProps}
      ref={frameRef}
      title={projectFileName(project.title)}
      className="desktop-window--media"
      width={viewerSize?.width}
      fitKey={viewerSize ? `${viewerSize.width}x${viewerSize.height}` : undefined}
    >
      <div className="desktop-window__body" style={viewerSize ? { height: viewerSize.height } : undefined}>
        <ProjectMediaView media={project.media[mediaIndex]} alt={project.title} onNaturalSize={fitToMedia} />
      </div>
      <div className="desktop-window__footer" ref={footerRef}>
        <button aria-label="Previous slide" onClick={() => showMedia(-1)}>
          ‹
        </button>
        <span className="desktop-window__caption">
          {formatCategories(project)}{" "}
          <span>
            {mediaIndex + 1}/{mediaCount}
          </span>
        </span>
        <button aria-label="Next slide" onClick={() => showMedia(1)}>
          ›
        </button>
        <button className="desktop-window__default-button" onClick={() => onOpenCase(projectIndex)}>
          Open case
        </button>
      </div>
    </DesktopWindowFrame>
  );
}
