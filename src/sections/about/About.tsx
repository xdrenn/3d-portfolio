import { SectionHead } from "@/layout/SectionHead";
import { ABOUT_STATEMENT } from "@/content/site";
import { ELEMENT_IDS } from "@/lib/elementIds";
import { Printer } from "@/sections/printer/Printer";
import { tie } from "@/lib/typography";
import { ServiceList } from "./ServiceList";
import "./about.css";

/** Key phrases that get the marker highlight. */
const HIGHLIGHTS = [
  "Android developer",
  "full-stack developer",
  "combine design and development",
  "unique digital experiences",
  "the whole brand",
  "one system",
  "a clear job",
];

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/** `tie` swaps some spaces for non-breaking ones, so a phrase matches either kind. */
const HIGHLIGHT_PATTERN = new RegExp(
  `(${HIGHLIGHTS.map((phrase) => escapeRegExp(phrase).replace(/ /g, "[ \\u00a0]")).join("|")})`,
  "g",
);

/** Ties the text together, then wraps the key phrases in <mark>. */
function marked(text: string) {
  return tie(text)
    .split(HIGHLIGHT_PATTERN)
    .map((part, index) => (index % 2 === 1 ? <mark key={index}>{part}</mark> : part));
}

/**
 * The About text: two paragraphs on the left, the small printer in the free corner on the right.
 * Services follow below.
 */
export function About() {
  return (
    <section id={ELEMENT_IDS.about} className="about panel tone-chalk page-padding">
      <SectionHead title="About"></SectionHead>
      <div className="about__text grid">
        <div className="about__copy">
          <p>{marked(ABOUT_STATEMENT.first)}</p>
          <p>{marked(ABOUT_STATEMENT.second)}</p>
        </div>
        <Printer />
      </div>
      <ServiceList />
    </section>
  );
}
