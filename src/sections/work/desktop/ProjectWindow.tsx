import { useCallback, useRef, useState } from "react";
import { formatCategories, PROJECTS } from "@/content/projects";
import { ProjectMediaView } from "@/components/ProjectMediaView";
import { projectFileName } from "./desktopFiles";
import { DesktopWindowFrame, type DesktopWindowProps } from "./DesktopWindow";

type ProjectWindowProps = DesktopWindowProps & {
  projectIndex: number;
  onOpenCase: (projectIndex: number) => void;
};

type ViewerSize = { width: number; height: number };

const MAX_WIDTH_RATIO = 0.6;
const MAX_HEIGHT_RATIO = 0.8;
const VERTICAL_MARGIN_RATIO = 0.08;
const MIN_WIDTH = 220;
const FALLBACK_ASPECT = 4 / 3;

function computeViewerSize(aspect: number, screenWidth: number, screenHeight: number, chromeHeight: number): ViewerSize {
  const maxWidth = screenWidth * MAX_WIDTH_RATIO;
  const maxHeight = screenHeight * MAX_HEIGHT_RATIO - chromeHeight - screenHeight * VERTICAL_MARGIN_RATIO;

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
