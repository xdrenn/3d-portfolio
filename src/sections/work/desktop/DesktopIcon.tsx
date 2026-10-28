import { useRef, type MouseEvent, type PointerEvent } from "react";
import { PROJECTS } from "@/content/projects";
import { projectThumbnailUrl } from "@/lib/mediaPaths";
import type { DesktopFile } from "./desktopFiles";

type DesktopIconProps = {
  file: DesktopFile;
  isSelected: boolean;
  onSelect: () => void;
  onOpen: () => void;
};

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

/** Narrow icons wrap a long name before its extension ("rattattoo / .jpg"), not mid-word. */
function FileName({ name }: { name: string }) {
  const dot = name.lastIndexOf(".");
  if (dot <= 0) return <>{name}</>;
  return (
    <>
      {name.slice(0, dot)}
      <wbr />
      {name.slice(dot)}
    </>
  );
}

export function DesktopIcon({ file, isSelected, onSelect, onOpen }: DesktopIconProps) {
  // Safari's click is a plain MouseEvent with no pointerType, so the finger is remembered from pointerdown.
  const lastPointerType = useRef("");

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onSelect();
    const isTap = lastPointerType.current === "touch" || lastPointerType.current === "pen";
    const isKeyboard = event.detail === 0;
    lastPointerType.current = "";
    if (isTap || isKeyboard) onOpen();
  };

  return (
    <button
      className={`desktop-icon${isSelected ? " is-selected" : ""}`}
      role="listitem"
      aria-label={`Open ${file.name}`}
      onPointerDown={(event: PointerEvent) => (lastPointerType.current = event.pointerType)}
      onClick={handleClick}
      onDoubleClick={onOpen}
    >
      <FileThumbnail file={file} />
      <span className="desktop-icon__name">
        <FileName name={file.name} />
      </span>
    </button>
  );
}
