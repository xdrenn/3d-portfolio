import { useSyncExternalStore } from "react";

/**
 * Show / hide the layout grid, like Shift+G in Figma.
 * One small store: the button on the first screen and the keyboard shortcut share it,
 * and the choice is remembered in this browser.
 */
const STORAGE_KEY = "grid-visible";
const listeners = new Set<() => void>();

const readStored = () => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== "0";
  } catch {
    return true;
  }
};

let isVisible = typeof window === "undefined" ? true : readStored();

export function setGridVisible(next: boolean) {
  isVisible = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
  } catch {
    /* Private mode or blocked storage: the toggle still works for this visit. */
  }
  listeners.forEach((listener) => listener());
}

export const toggleGrid = () => setGridVisible(!isVisible);

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const useGridVisible = () => useSyncExternalStore(subscribe, () => isVisible, () => true);

const isTypingTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));

/** Shift+G anywhere on the page, except while typing. */
export function startGridShortcut() {
  const onKeyDown = (event: KeyboardEvent) => {
    if (!event.shiftKey || event.metaKey || event.ctrlKey || event.altKey || event.repeat) return;
    if (event.code !== "KeyG" || isTypingTarget(event.target)) return;
    event.preventDefault();
    toggleGrid();
  };
  window.addEventListener("keydown", onKeyDown);
  return () => window.removeEventListener("keydown", onKeyDown);
}
