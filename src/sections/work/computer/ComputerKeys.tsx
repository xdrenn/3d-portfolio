import type { ReactNode, RefObject } from "react";

export type ComputerKeyName = "previous" | "open" | "next" | "restart";

type KeyDefinition = {
  name: ComputerKeyName;
  label: string;
  variant?: "glass" | "foil";
  face: ReactNode;
};

const SMILEY_PIXELS =
  "M1 1h1v1H1zM3 1h1v1H3zM2 0h1v1H2zM7 1h1v1H7zM9 1h1v1H9zM8 0h1v1H8zM0 5h1v1H0zM1 6h1v1H1zM2 7h7v1H2zM9 6h1v1H9zM10 5h1v1h-1z";

const KEYS: KeyDefinition[] = [
  { name: "previous", label: "Previous project", face: <span>←</span> },
  { name: "open", label: "Open case study", variant: "glass", face: <span>open</span> },
  { name: "next", label: "Next project", face: <span>→</span> },
  {
    name: "restart",
    label: "Restart the computer",
    variant: "foil",
    face: (
      <svg viewBox="0 0 11 9" shapeRendering="crispEdges" aria-hidden="true">
        <path d={SMILEY_PIXELS} />
      </svg>
    ),
  },
];

type ComputerKeysProps = {
  pressedKey: ComputerKeyName | null;
  foilKeyRef: RefObject<HTMLButtonElement>;
  onPress: (key: ComputerKeyName) => void;
  onActivate: (key: ComputerKeyName) => void;
};

const keyClassName = (key: KeyDefinition, isPressed: boolean) =>
  ["key", key.variant && `key--${key.variant}`, isPressed && "is-pressed"].filter(Boolean).join(" ");

export function ComputerKeys({ pressedKey, foilKeyRef, onPress, onActivate }: ComputerKeysProps) {
  return (
    <div className="key-tray" role="group" aria-label="Desktop controls">
      {KEYS.map((key) => (
        <button
          key={key.name}
          ref={key.variant === "foil" ? foilKeyRef : undefined}
          className={keyClassName(key, pressedKey === key.name)}
          aria-label={key.label}
          onPointerDown={() => onPress(key.name)}
          onClick={() => onActivate(key.name)}
        >
          {key.face}
        </button>
      ))}
    </div>
  );
}
