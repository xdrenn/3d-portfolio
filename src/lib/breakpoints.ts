export const MOBILE_MAX_WIDTH = 860;

/** Same breakpoint as the `max-width: 860px` media queries in the CSS. */
export const isPhoneLayout = () => window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`).matches;

/** A finger, not a mouse: no double-click, no hover, no Shift+G. */
export const isTouchScreen = () => window.matchMedia("(pointer: coarse)").matches;
