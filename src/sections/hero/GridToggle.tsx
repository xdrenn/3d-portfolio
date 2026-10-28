import { toggleGrid, useGridVisible } from "@/lib/gridVisibility";

/** Sits under the swatches: switches the column grid on and off. Shift+G does the same. */
export function GridToggle() {
  const isVisible = useGridVisible();

  return (
    <button
      type="button"
      className="grid-toggle"
      aria-pressed={isVisible}
      aria-keyshortcuts="Shift+G"
      title="Show or hide the grid (Shift+G)"
      onClick={toggleGrid}
    >
      <svg className="grid-toggle__icon" viewBox="0 0 16 16" aria-hidden="true">
        <rect x="1.5" y="1.5" width="13" height="13" fill="none" stroke="currentColor" />
        <path d="M5.83 1.5v13M10.17 1.5v13" stroke="currentColor" />
      </svg>
      <span className="grid-toggle__label">{isVisible ? "Hide grid" : "Show grid"}</span>
      <kbd className="grid-toggle__kbd">⇧G</kbd>
    </button>
  );
}
