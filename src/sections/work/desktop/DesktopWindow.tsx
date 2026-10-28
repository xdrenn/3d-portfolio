import {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { isPhoneLayout } from "@/lib/breakpoints";
import { clamp } from "@/lib/math";
import type { OpenWindow } from "./useDesktop";

export type DesktopWindowProps = {
  openWindow: OpenWindow;
  isActive: boolean;
  screenRef: RefObject<HTMLDivElement>;
  computerRef: RefObject<HTMLDivElement>;
  onFocus: () => void;
  onClose: () => void;
};

type DesktopWindowFrameProps = DesktopWindowProps & {
  title: string;
  /** Extra class: "desktop-window--media" keeps the picture's own shape on phones instead of filling the screen. */
  className?: string;
  width?: number;
  fitKey?: string;
  children: ReactNode;
};

type DragStart = {
  pointerX: number;
  pointerY: number;
  windowX: number;
  windowY: number;
  screenScale: number;
};

const CLOSE_BUTTON_CLASS = "desktop-window__close";
const DRAGGING_CLASS = "is-dragging";

export const DesktopWindowFrame = forwardRef<HTMLDivElement | null, DesktopWindowFrameProps>(function DesktopWindowFrame(
  { openWindow, isActive, screenRef, computerRef, onFocus, onClose, title, className, width, fitKey, children },
  forwardedRef,
) {
  const frameRef = useRef<HTMLDivElement>(null);
  useImperativeHandle<HTMLDivElement | null, HTMLDivElement | null>(forwardedRef, () => frameRef.current, []);

  const [position, setPosition] = useState({ x: openWindow.x, y: openWindow.y });
  const dragStart = useRef<DragStart | null>(null);

  useLayoutEffect(() => {
    if (fitKey === undefined) return;
    const frame = frameRef.current;
    const screen = screenRef.current;
    if (!frame || !screen) return;

    const maxX = screen.clientWidth - frame.offsetWidth - 8;
    const maxY = screen.clientHeight - frame.offsetHeight - 6;
    const minY = screen.clientHeight * 0.075;

    setPosition((current) => ({
      x: Math.max(4, Math.min(current.x, maxX)),
      y: Math.max(minY, Math.min(current.y, maxY)),
    }));
  }, [fitKey, screenRef]);

  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest(`.${CLOSE_BUTTON_CLASS}`)) return;
    // On phones windows are pinned: notes fill the screen, pictures sit centred (desktop.css).
    if (isPhoneLayout()) return;
    const screen = screenRef.current;
    if (!screen) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    computerRef.current?.classList.add(DRAGGING_CLASS);

    const screenRect = screen.getBoundingClientRect();
    dragStart.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      windowX: position.x,
      windowY: position.y,
      screenScale: screen.clientWidth / screenRect.width,
    };
  };

  const drag = (event: PointerEvent<HTMLDivElement>) => {
    const start = dragStart.current;
    const screen = screenRef.current;
    const frame = frameRef.current;
    if (!start || !screen || !frame || !event.currentTarget.hasPointerCapture(event.pointerId)) return;

    const deltaX = (event.clientX - start.pointerX) * start.screenScale;
    const deltaY = (event.clientY - start.pointerY) * start.screenScale;

    setPosition({
      x: clamp(start.windowX + deltaX, 40 - frame.offsetWidth, screen.clientWidth - 40),
      y: clamp(start.windowY + deltaY, 18, screen.clientHeight - 24),
    });
  };

  const endDrag = () => {
    dragStart.current = null;
    computerRef.current?.classList.remove(DRAGGING_CLASS);
  };

  return (
    <div
      ref={frameRef}
      className={`desktop-window${className ? ` ${className}` : ""}${isActive ? " is-active" : ""}`}
      role="dialog"
      aria-label={title}
      style={{ left: position.x, top: position.y, zIndex: openWindow.zIndex, width }}
      onPointerDown={onFocus}
    >
      <div
        className="desktop-window__bar"
        onPointerDown={startDrag}
        onPointerMove={drag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <button
          className={CLOSE_BUTTON_CLASS}
          aria-label="Close window"
          onClick={(event) => {
            event.stopPropagation();
            onClose();
          }}
        >
          <svg viewBox="0 0 10 10" aria-hidden="true">
            <path d="M2 2l6 6M8 2l-6 6" />
          </svg>
        </button>
        <span className="desktop-window__title">{title}</span>
      </div>
      {children}
    </div>
  );
});
