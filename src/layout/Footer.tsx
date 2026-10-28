import { OWNER_HANDLE } from "@/content/site";
import { anchorTo, ELEMENT_IDS } from "@/lib/elementIds";
import "./layout.css";


export function Footer() {
  return (
    <footer className="footer tone-graphite grid page-padding">
      <span className="footer__copyright">
        © {new Date().getFullYear()} {OWNER_HANDLE}, designed and coded by me
      </span>
      <a className="footer__back-to-top" href={anchorTo(ELEMENT_IDS.top)}>
        Back to top
      </a>
    </footer>
  );
}
