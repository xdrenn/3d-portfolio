import { useEffect, useRef, useState, type PointerEvent } from "react";
import { PROJECT_COUNT } from "@/content/projects";
import { useClickSound } from "@/hooks/useClickSound";
import { useInViewRef } from "@/hooks/useInViewRef";
import { useOnFirstView } from "@/hooks/useOnFirstView";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { GridGuides } from "@/layout/GridGuides";
import { SectionHead } from "@/layout/SectionHead";
import { ELEMENT_IDS } from "@/lib/elementIds";
import { scrollToElement } from "@/lib/scroll";
import { usePortfolio } from "@/state/PortfolioContext";
import { Computer } from "./computer/Computer";
import { ComputerKeys, type ComputerKeyName } from "./computer/ComputerKeys";
import { Desktop } from "./desktop/Desktop";
import type { DesktopFile } from "./desktop/desktopFiles";
import { useDesktop } from "./desktop/useDesktop";
import "./work.css";

const CLICK_FREQUENCY = { key: 1800, icon: 1400, restart: 900 };
const BOOT_VISIBLE_RATIO = 0.45;
const KEYBOARD_ACTIVE_VISIBLE_RATIO = 0.5;
const KEY_PRESS_FLASH_MS = 120;
const MAX_TILT_X_DEGREES = 7;
const MAX_TILT_Y_DEGREES = 5;

const ARROW_KEYS: Record<string, ComputerKeyName> = {
  ArrowLeft: "previous",
  ArrowRight: "next",
};

export function WorkSection() {
  const reducedMotion = usePrefersReducedMotion();
  const playClick = useClickSound();
  const { openCaseIndex, openCase, registerComputer } = usePortfolio();

  const stageRef = useRef<HTMLDivElement>(null);
  const computerRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const foilKeyRef = useRef<HTMLButtonElement>(null);
  const isCaseOpen = useRef(false);
  isCaseOpen.current = openCaseIndex !== null;

  const desktop = useDesktop(screenRef, reducedMotion);
  const { boot, openProject, openFile, selectProject, getIsBooted, getCurrentProjectIndex } = desktop;
  const [pressedKey, setPressedKey] = useState<ComputerKeyName | null>(null);

  const isComputerInView = useInViewRef(computerRef, KEYBOARD_ACTIVE_VISIBLE_RATIO);
  useOnFirstView(computerRef, BOOT_VISIBLE_RATIO, boot);

  const whenBooted = (action: () => void) => () => {
    if (getIsBooted()) action();
  };

  const keyActions: Record<ComputerKeyName, () => void> = {
    previous: whenBooted(() => openProject(getCurrentProjectIndex() - 1)),
    next: whenBooted(() => openProject(getCurrentProjectIndex() + 1)),
    open: whenBooted(() => openCase(getCurrentProjectIndex())),
    restart: boot,
  };
  const keyActionsRef = useRef(keyActions);
  keyActionsRef.current = keyActions;

  useEffect(() => {
    registerComputer((projectIndex) => {
      selectProject(projectIndex);
      scrollToElement(stageRef.current, { reducedMotion, block: "end" });
      if (getIsBooted()) openProject(projectIndex);
    });
    return () => registerComputer(null);
  }, [registerComputer, selectProject, openProject, getIsBooted, reducedMotion]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isComputerInView.current || isCaseOpen.current) return;
      const keyName = ARROW_KEYS[event.key];
      if (!keyName) return;
      if (document.activeElement?.id === ELEMENT_IDS.holoCard) return;

      setPressedKey(keyName);
      window.setTimeout(() => setPressedKey(null), KEY_PRESS_FLASH_MS);
      playClick(CLICK_FREQUENCY.key);
      keyActionsRef.current[keyName]();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [playClick, isComputerInView]);

  const tiltTowardsPointer = (event: PointerEvent<HTMLDivElement>) => {
    const computer = computerRef.current;
    if (!computer || reducedMotion || computer.classList.contains("is-dragging")) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const offsetX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const offsetY = (event.clientY - bounds.top) / bounds.height - 0.5;

    computer.style.setProperty("--tilt-x", `${(offsetX * MAX_TILT_X_DEGREES).toFixed(2)}deg`);
    computer.style.setProperty("--tilt-y", `${(-offsetY * MAX_TILT_Y_DEGREES).toFixed(2)}deg`);
    foilKeyRef.current?.style.setProperty("--foil-x", `${(offsetX * 100 + 50).toFixed(1)}%`);
  };

  const resetTilt = () => {
    computerRef.current?.style.setProperty("--tilt-x", "0deg");
    computerRef.current?.style.setProperty("--tilt-y", "0deg");
  };

  const handleOpenFile = (file: DesktopFile) => {
    playClick(CLICK_FREQUENCY.icon);
    openFile(file);
  };

  const handleKeyPress = (keyName: ComputerKeyName) =>
    playClick(keyName === "restart" ? CLICK_FREQUENCY.restart : CLICK_FREQUENCY.key);

  return (
    <section id={ELEMENT_IDS.work} className="work page-padding">
      <GridGuides />

      <div className="work__folder-tab" aria-hidden="true">
        <span>work</span>
        <span>{PROJECT_COUNT} files</span>
      </div>

      <SectionHead title="Work">
        Each project is a file on this computer. Drag windows by the striped bar.
      </SectionHead>

      <div className="work__stage" ref={stageRef} onPointerMove={tiltTowardsPointer} onPointerLeave={resetTilt}>
        <Computer ref={computerRef} screenRef={screenRef} isPoweredOn={desktop.isPoweredOn} isBooted={desktop.isBooted}>
          <Desktop
            desktop={desktop}
            screenRef={screenRef}
            computerRef={computerRef}
            onOpenFile={handleOpenFile}
            onOpenCase={openCase}
          />
        </Computer>
        <ComputerKeys
          pressedKey={pressedKey}
          foilKeyRef={foilKeyRef}
          onPress={handleKeyPress}
          onActivate={(keyName) => keyActions[keyName]()}
        />
        <p className="work__hint">Arrow keys work too while the computer is on screen.</p>
      </div>
    </section>
  );
}
