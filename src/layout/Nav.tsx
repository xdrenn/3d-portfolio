import { OWNER_HANDLE } from "@/content/site";
import { anchorTo, ELEMENT_IDS } from "@/lib/elementIds";
import "./layout.css";

const NAV_LINKS = [
  { label: "(work)", target: ELEMENT_IDS.selectedWork },
  { label: "(about)", target: ELEMENT_IDS.about },
  { label: "(contact)", target: ELEMENT_IDS.contact },
];

export function Nav() {
  return (
    <header className="nav grid page-padding">
      <a className="nav__logo" href={anchorTo(ELEMENT_IDS.top)}>
        {OWNER_HANDLE}
      </a>
      <nav className="nav__links" aria-label="Main">
        {NAV_LINKS.map((link) => (
          <a key={link.target} className="hover-italic" href={anchorTo(link.target)}>
            {link.label}
          </a>
        ))}
      </nav>
      <span className="nav__status">
        <span className="nav__status-dot" />
        Open for projects
      </span>
    </header>
  );
}
