import { BADGE_TEXT } from "@/content/site";
import { SPARKLE_PATH } from "@/lib/shapes";

const FOIL_STOPS = [
  { offset: 0, color: "#8fe0ff" },
  { offset: 0.2, color: "#c3a2ff" },
  { offset: 0.4, color: "#ff8fd0" },
  { offset: 0.6, color: "#ffe680" },
  { offset: 0.8, color: "#8affd2" },
  { offset: 1, color: "#ff9fd8" },
];

const GRADIENT_ID = "spinning-badge-foil";
const GLOSS_ID = "spinning-badge-gloss";
const TEXT_PATH_ID = "spinning-badge-text-path";

export function SpinningBadge() {
  return (
    <svg className="spinning-badge" viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <linearGradient id={GRADIENT_ID} x1="0" y1="0" x2="1" y2="1">
          {FOIL_STOPS.map((stop) => (
            <stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />
          ))}
        </linearGradient>
        <radialGradient id={GLOSS_ID} cx=".32" cy=".28" r=".7">
          <stop offset="0" stopColor="#fff" stopOpacity=".85" />
          <stop offset=".45" stopColor="#fff" stopOpacity=".1" />
          <stop offset="1" stopColor="#7a6cff" stopOpacity=".18" />
        </radialGradient>
        <path id={TEXT_PATH_ID} d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" />
      </defs>
      <circle cx="60" cy="60" r="58" fill={`url(#${GRADIENT_ID})`} />
      <circle cx="60" cy="60" r="58" fill={`url(#${GLOSS_ID})`} />
      <circle cx="60" cy="60" r="30" fill="none" stroke="#000" strokeWidth=".6" />
      <text className="spinning-badge__text" fill="#000">
        <textPath href={`#${TEXT_PATH_ID}`}>{BADGE_TEXT}</textPath>
      </text>
      <path d={SPARKLE_PATH} fill="#000" />
    </svg>
  );
}
