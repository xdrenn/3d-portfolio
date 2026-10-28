import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { wrapProjectIndex } from "@/content/projects";
import { visit } from "@/lib/visit";
import { DESKTOP_FILES, projectFile, type DesktopFile } from "./desktopFiles";

export type OpenWindow = {
  id: number;
  file: DesktopFile;
  x: number;
  y: number;
  zIndex: number;
};

const MAX_OPEN_WINDOWS = 3;
const CASCADE_STEPS = 4;
const BOOT_DURATION_MS = 1500;
const FIRST_WINDOW_DELAY_MS = 350;
const INITIAL_Z_INDEX = 10;
const FALLBACK_SCREEN_SIZE = { width: 600, height: 450 };
/** The file that opens by itself after boot: the about note says hello first. */
const FIRST_FILE_INDEX = DESKTOP_FILES.findIndex((file) => file.kind === "about");

export function useDesktop(screenRef: RefObject<HTMLDivElement>, reducedMotion: boolean) {
  const [windows, setWindows] = useState<OpenWindow[]>([]);
  const [isPoweredOn, setIsPoweredOn] = useState(false);
  const [isBooted, setIsBooted] = useState(false);
  const [selectedFileIndex, setSelectedFileIndex] = useState<number | null>(null);
  const [isHintVisible, setIsHintVisible] = useState(true);

  const currentProjectIndex = useRef(0);
  const isBootedRef = useRef(false);
  const topZIndex = useRef(INITIAL_Z_INDEX);
  const lastWindowId = useRef(0);
  const pendingTimers = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    pendingTimers.current.forEach(clearTimeout);
    pendingTimers.current = [];
  }, []);

  const schedule = useCallback((callback: () => void, delay: number) => {
    pendingTimers.current.push(window.setTimeout(callback, delay));
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const raiseZIndex = () => ++topZIndex.current;

  const cascadePosition = useCallback(
    (step: number) => {
      const screen = screenRef.current;
      const width = screen?.clientWidth ?? FALLBACK_SCREEN_SIZE.width;
      const height = screen?.clientHeight ?? FALLBACK_SCREEN_SIZE.height;
      return {
        x: Math.max(6, width * 0.04 + step * width * 0.035),
        y: Math.max(26, height * 0.1 + step * height * 0.05),
      };
    },
    [screenRef],
  );

  const openWindow = useCallback(
    (file: DesktopFile) => {
      if (file.kind === "about") visit.readAbout();
      setWindows((current) => {
        const remaining = file.kind === "project" ? current.filter((open) => open.file.kind !== "project") : current;

        const existing = remaining.find((open) => open.file.kind === file.kind);
        if (existing) {
          return remaining.map((open) => (open === existing ? { ...open, zIndex: raiseZIndex() } : open));
        }

        const kept = remaining.length >= MAX_OPEN_WINDOWS ? remaining.slice(1) : remaining;
        const opened: OpenWindow = {
          id: ++lastWindowId.current,
          file,
          ...cascadePosition(kept.length % CASCADE_STEPS),
          zIndex: raiseZIndex(),
        };
        return [...kept, opened];
      });
      setIsHintVisible(false);
    },
    [cascadePosition],
  );

  const focusWindow = useCallback((id: number) => {
    setWindows((current) => {
      const highest = Math.max(...current.map((open) => open.zIndex));
      const target = current.find((open) => open.id === id);
      if (!target || target.zIndex === highest) return current;
      return current.map((open) => (open.id === id ? { ...open, zIndex: raiseZIndex() } : open));
    });
  }, []);

  const closeWindow = useCallback((id: number) => {
    setWindows((current) => current.filter((open) => open.id !== id));
  }, []);

  const selectProject = useCallback((projectIndex: number) => {
    const wrappedIndex = wrapProjectIndex(projectIndex);
    currentProjectIndex.current = wrappedIndex;
    return wrappedIndex;
  }, []);

  const openProject = useCallback(
    (projectIndex: number) => {
      const wrappedIndex = selectProject(projectIndex);
      visit.openProject(wrappedIndex);
      setSelectedFileIndex(wrappedIndex);
      openWindow(projectFile(wrappedIndex));
    },
    [openWindow, selectProject],
  );

  const openFile = useCallback(
    (file: DesktopFile) => {
      if (file.kind === "project") openProject(file.projectIndex);
      else openWindow(file);
    },
    [openProject, openWindow],
  );

  const boot = useCallback(() => {
    clearTimers();
    isBootedRef.current = false;
    setIsBooted(false);
    setWindows([]);
    setIsHintVisible(true);
    setIsPoweredOn(false);

    requestAnimationFrame(() => requestAnimationFrame(() => setIsPoweredOn(true)));

    schedule(
      () => {
        isBootedRef.current = true;
        setIsBooted(true);
        schedule(() => {
          setSelectedFileIndex(FIRST_FILE_INDEX);
          openWindow(DESKTOP_FILES[FIRST_FILE_INDEX]);
        }, FIRST_WINDOW_DELAY_MS);
      },
      reducedMotion ? 0 : BOOT_DURATION_MS,
    );
  }, [clearTimers, schedule, openWindow, reducedMotion]);

  const getIsBooted = useCallback(() => isBootedRef.current, []);
  const getCurrentProjectIndex = useCallback(() => currentProjectIndex.current, []);

  return {
    windows,
    isPoweredOn,
    isBooted,
    selectedFileIndex,
    setSelectedFileIndex,
    isHintVisible,
    boot,
    openProject,
    openFile,
    focusWindow,
    closeWindow,
    selectProject,
    getIsBooted,
    getCurrentProjectIndex,
  };
}

export type DesktopController = ReturnType<typeof useDesktop>;
