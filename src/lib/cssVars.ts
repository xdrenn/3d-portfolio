import type { CSSProperties } from "react";

export const cssVars = (variables: Record<`--${string}`, string | number>) => variables as CSSProperties;
