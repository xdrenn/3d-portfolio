import { CONTACT } from "@/content/contact";

const SOCIAL_LINKS = [
  { label: "Instagram", caption: CONTACT.instagramHandle, href: CONTACT.instagramUrl, isExternal: true },
  { label: "Behance", caption: "Full case studies", href: CONTACT.behanceUrl, isExternal: true },
  { label: "Telegram", caption: CONTACT.telegramHandle, href: CONTACT.telegramUrl, isExternal: true },
  { label: "Email", caption: CONTACT.email, href: `mailto:${CONTACT.email}`, isExternal: false },
];

const EXTERNAL_LINK_PROPS = { target: "_blank", rel: "noopener noreferrer" };

export function SocialLinks() {
  return (
    <div className="social-links grid">
      {SOCIAL_LINKS.map((link) => (
        <a
          key={link.label}
          className="social-links__item hover-italic"
          href={link.href}
          {...(link.isExternal ? EXTERNAL_LINK_PROPS : {})}
        >
          {link.label}
          <span className="social-links__caption">{link.caption}</span>
        </a>
      ))}
    </div>
  );
}
