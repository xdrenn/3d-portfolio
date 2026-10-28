import { useEffect } from "react";
import { startGridShortcut, useGridVisible } from "@/lib/gridVisibility";

/**
 * The column grid is drawn by each sheet itself (see .panel::before and .footer::before in layout.css),
 * so it lies under the content and never covers it. This component only keeps the on/off state
 * on <html> and listens for the Shift+G shortcut.
 */
export function GridGuides() {
  const isVisible = useGridVisible();

  useEffect(() => startGridShortcut(), []);

  useEffect(() => {
    document.documentElement.dataset.grid = isVisible ? "on" : "off";
  }, [isVisible]);

  return null;
}
