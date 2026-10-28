import { LOCAL_PLACE, OWNER_HANDLE } from "./site";

/** Characters per receipt line. Everything below is laid out for this width. */
export const RECEIPT_WIDTH = 26;

type Art = { name: string; lines: string[] };

/**
 * The small picture on top of the slip. Every print picks one at random;
 * the rare one comes out about once in twenty prints.
 */
const COMMON_ART: Art[] = [
  { name: "stars", lines: [" *       .    *", "     .  *        .", "  .       .   *"] },
  { name: "constellation", lines: ["  *---.", "       *-----*", "      /       \\", "     *         *"] },
  { name: "sun", lines: ["     \\ | /", "   -- ( ) --", "     / | \\"] },
  { name: "terminal", lines: [" > print receipt", " > done_"] },
  {
    name: "mountains",
    lines: ["      .-.      *", "     (   )  .", "  /\\  '-'  /\\", " /  \\  /\\ /  \\", "/    \\/  \\    \\"],
  },
];

const RARE_ART: Art = {
  name: "error",
  lines: [" .--------------.", " | (!) error    |", " | [ ok ]       |", " '--------------'"],
};
const RARE_CHANCE = 0.05;
const RARE_INDEX = COMMON_ART.length;

/** A random art index, never the same common picture twice in a row. */
export function pickArt(previous?: number): number {
  if (Math.random() < RARE_CHANCE) return RARE_INDEX;
  const options = COMMON_ART.map((_, index) => index).filter((index) => index !== previous);
  return options[Math.floor(Math.random() * options.length)];
}

const artOf = (index: number) => (index === RARE_INDEX ? RARE_ART : COMMON_ART[index] ?? COMMON_ART[0]);

const center = (text: string) => {
  const space = Math.max(0, RECEIPT_WIDTH - text.length);
  return " ".repeat(Math.floor(space / 2)) + text;
};

/** Centres a picture as one block, so its lines stay aligned with each other. */
const centerBlock = (lines: string[]) => {
  const width = Math.max(...lines.map((line) => line.length));
  const offset = " ".repeat(Math.max(0, Math.floor((RECEIPT_WIDTH - width) / 2)));
  return lines.map((line) => (offset + line).trimEnd());
};

/** "time on site ....... 4 min" — dot leaders between a label and a value. */
const leader = (label: string, value: string) => {
  const dots = Math.max(2, RECEIPT_WIDTH - label.length - value.length - 2);
  return `${label} ${".".repeat(dots)} ${value}`;
};

const rule = "-".repeat(RECEIPT_WIDTH);

/** Design study hours: "Fundamentals of Web Design and Digital Branding", 227.5 academic hours. */
const DESIGN_HOURS = "227.5 hrs";
/** Coding since 2021. */
const CODING_SINCE = 2021;
const FAVORITE_FONT = "Helvetica";

export type Receipt = { lines: string[] };

/** A small slip with a few facts about me, and a random picture on top. */
export function buildReceipt(artIndex: number, date: Date): Receipt {
  const art = artOf(artIndex);
  const years = Math.max(1, date.getFullYear() - CODING_SINCE);

  return {
    lines: [
      ...centerBlock(art.lines),
      "",
      center("A FEW FACTS ABOUT ME"),
      rule,
      leader("design study", DESIGN_HOURS),
      leader("coding", `${years} ${years === 1 ? "year" : "years"}`),
      leader("fav font", FAVORITE_FONT),
      leader("design", "Figma, Adobe"),
      leader("3D", "Blender"),
      leader("AI", "Claude"),
      leader("tools", "VS Code"),
      rule,
      center("THANK YOU FOR VISITING"),
      center(`@${OWNER_HANDLE}`),
    ],
  };
}
