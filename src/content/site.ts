import { CONTACT } from "./contact";

export const OWNER_HANDLE = "a.vilmovskaya";

export const BADGE_TEXT = "open for projects ✦ say hello ✦ open for projects ✦ ";

/** Descriptions are kept to the same length (about 50 characters), so the four columns line up. */
export const SERVICES = [
  { title: "Websites", description: "Landing pages, portfolios and sites for any brand." },
  { title: "Graphic design", description: "Logos, identities, posters, print, presentations." },
  { title: "Social media", description: "Post layouts, stories, covers and social graphics." },
  { title: "Code & redesign", description: "Redesigns, new features and fixes for live sites." },
];

export const HERO = {
  lead: "PORTFOLIO",
  leadEmphasis: "Designed and made by me.",
  footnote: "Writing code since 2021.",
};

/** The About text: two paragraphs, where I came from and the turn, then what I do now. */
export const ABOUT_STATEMENT = {
  first:
    "I started as an Android developer in 2021 — while studying web development — then spent almost two years at a startup as a full-stack developer. But I always wanted to combine design and development — to create unique digital experiences.",
  second:
    "So I studied design, and now I work across the whole brand — websites, visual identities and social media. That way, everything a brand puts out looks and feels like one system, and every piece has a clear job to do.",
};

export const TIMELINE = [
  { when: "2021", what: "Started as an Android developer." },
  { when: "Then", what: "Software development studies and a course in web design and digital branding." },
  { when: "Now", what: "Designing and building websites for creative people, both halves of the job." },
];

/** IANA time zone for the live clock in the footer. */
export const LOCAL_TIME_ZONE = "Europe/Belgrade";
export const LOCAL_PLACE = "Serbia";

export const TOOLS = [
  "Figma",
  "Tilda",
  "Adobe Illustrator",
  "Adobe Photoshop",
  "Blender",
  "VS Code",
  "Midjourney",
  "Claude",
  "Notion",
];

export const SWATCH_COLORS = ["#000", "#5a5a5a", "#b4b4b4", "#fff"];

export const FOIL_SWATCH_OFFSETS = ["0%", "35%", "70%"];

export const ABOUT_FILE_PARAGRAPHS = [
  "Hi! I'm Anastasia - designer and developer.",
  "And this is my OS: every folder on the desktop is a design I made.",
  "Double-click anything to open it, like on a real computer ^_^",
  "(or use the keys below)",
];

/**
 * Front: the person. Back: how to reach her.
 * The full name appears once (front), the handle only where it is part of an address.
 */
export const BUSINESS_CARD = {
  front: {
    nameLines: ["Anastasia", "Vilmovskaya"],
    bottomLeft: "Websites, interfaces, graphics",
    bottomRight: "Worldwide, remote",
  },
  back: {
    heading: "Contact",
    email: CONTACT.email,
    emailHref: `mailto:${CONTACT.email}`,
    /** label, what is printed, where a click on it goes */
    rows: [
      ["Telegram", CONTACT.telegramHandle, CONTACT.telegramUrl],
      ["Instagram", CONTACT.instagramHandle, CONTACT.instagramUrl],
      ["Behance", CONTACT.behanceHandle, CONTACT.behanceUrl],
    ],
  },
} as const;
