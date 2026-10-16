import type { RefObject } from "react";
import { PROJECT_COUNT } from "@/content/projects";
import { SPARKLE_PATH, SPARKLE_VIEWBOX } from "@/lib/shapes";
import { AboutWindow } from "./AboutWindow";
import { CardFileWindow } from "./CardFileWindow";
import { DESKTOP_FILES, type DesktopFile } from "./desktopFiles";
import { DesktopIcon } from "./DesktopIcon";
import type { DesktopWindowProps } from "./DesktopWindow";
import { ProjectWindow } from "./ProjectWindow";
import type { DesktopController } from "./useDesktop";
import "./desktop.css";

type DesktopProps = {
  desktop: DesktopController;
  screenRef: RefObject<HTMLDivElement>;
  computerRef: RefObject<HTMLDivElement>;
  onOpenFile: (file: DesktopFile) => void;
  onOpenCase: (projectIndex: number) => void;
};

function MenuBar() {
  return (
    <div className="desktop__menubar">
      <svg viewBox={SPARKLE_VIEWBOX} aria-hidden="true">
        <path d={SPARKLE_PATH} />
      </svg>
      <span>a.v. OS</span>
      <span>File</span>
      <span>View</span>
      <span className="desktop__project-count">{PROJECT_COUNT} projects</span>
    </div>
  );
}

export function Desktop({ desktop, screenRef, computerRef, onOpenFile, onOpenCase }: DesktopProps) {
  const { windows } = desktop;
  const highestZIndex = windows.length ? Math.max(...windows.map((open) => open.zIndex)) : 0;

  return (
    <div className="desktop">
      <MenuBar />

      <div className="desktop__icons" role="list" aria-label="Project files">
        {DESKTOP_FILES.map((file, fileIndex) => (
          <DesktopIcon
            key={file.name}
            file={file}
            isSelected={desktop.selectedFileIndex === fileIndex}
            onSelect={() => desktop.setSelectedFileIndex(fileIndex)}
            onOpen={() => onOpenFile(file)}
          />
        ))}
      </div>

      {desktop.isHintVisible && <div className="desktop__hint">Double-click a file to open it</div>}

      {windows.map((open) => {
        const windowProps: DesktopWindowProps = {
          openWindow: open,
          isActive: open.zIndex === highestZIndex,
          screenRef,
          computerRef,
          onFocus: () => desktop.focusWindow(open.id),
          onClose: () => desktop.closeWindow(open.id),
        };

        switch (open.file.kind) {
          case "project":
            return (
              <ProjectWindow
                key={open.id}
                {...windowProps}
                projectIndex={open.file.projectIndex}
                onOpenCase={onOpenCase}
              />
            );
          case "about":
            return <AboutWindow key={open.id} {...windowProps} />;
          case "card":
            return <CardFileWindow key={open.id} {...windowProps} />;
        }
      })}
    </div>
  );
}
