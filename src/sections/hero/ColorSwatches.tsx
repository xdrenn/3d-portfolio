import { FOIL_SWATCH_OFFSETS, SWATCH_COLORS } from "@/content/site";
import { cssVars } from "@/lib/cssVars";

export function ColorSwatches() {
  return (
    <div className="swatches" aria-hidden="true">
      {SWATCH_COLORS.map((color) => (
        <i key={color} className="swatches__item" style={cssVars({ "--swatch-color": color })} />
      ))}
      {FOIL_SWATCH_OFFSETS.map((offset) => (
        <i key={offset} className="swatches__item swatches__item--foil" style={cssVars({ "--foil-offset": offset })} />
      ))}
    </div>
  );
}
