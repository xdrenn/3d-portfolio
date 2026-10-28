import type { MouseEvent } from "react";
import { PROJECTS } from "@/content/projects";
import { projectThumbnailUrl } from "@/lib/mediaPaths";
import type { DesktopFile } from "./desktopFiles";

type DesktopIconProps = {
  file: DesktopFile;
  isSelected: boolean;
  onSelect: () => void;
  onOpen: () => void;
};

const isTapOrKeyboard = (event: MouseEvent) =>
  (event.nativeEvent as PointerEvent).pointerType === "touch" || event.detail === 0;

function FileThumbnail({ file }: { file: DesktopFile }) {
  switch (file.kind) {
    case "project":
      return (
        <span className="desktop-icon__thumbnail">
          <img alt="" decoding="async" src={projectThumbnailUrl(PROJECTS[file.projectIndex].cover)} />
        </span>
      );
    case "about":
      return <span className="desktop-icon__thumbnail desktop-icon__thumbnail--text">TXT</span>;
    case "card":
      return <span className="desktop-icon__thumbnail desktop-icon__thumbnail--foil" />;
    case "certificate":
      return (
        <span className="desktop-icon__thumbnail desktop-icon__thumbnail--document">
          <img alt="" decoding="async" src={projectThumbnailUrl("certificate")} />
        </span>
      );
  }
}

export function DesktopIcon({ file, isSelected, onSelect, onOpen }: DesktopIconProps) {
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onSelect();
    if (isTapOrKeyboard(event)) onOpen();
  };

  return (
    <button
      className={`desktop-icon${isSelected ? " is-selected" : ""}`}
      role="listitem"
      aria-label={`Open ${file.name}`}
      onClick={handleClick}
      onDoubleClick={onOpen}
    >
      <FileThumbnail file={file} />
      <span className="desktop-icon__name">{file.name}</span>
    </button>
  );
}
