import { CONTACT } from "./contact";

export const OWNER_HANDLE = "a.vilmovskaya";

export const BADGE_TEXT = "open for projects ✦ say hello ✦ open for projects ✦ ";

export const SERVICES = [
  { title: "Websites", description: "Design and development, from landing pages to longreads. Figma, Tilda, WordPress or code." },
  { title: "Interfaces", description: "Web and mobile app screens, ready for developers." },
  { title: "Social media", description: "Profile packaging, post templates, presentations." },
  { title: "Graphics", description: "Logos, posters, print." },
];

export const TOOLS = [
  "Figma",
  "Tilda",
  "Adobe Illustrator",
  "Adobe Photoshop",
  "Blender",
  "VS Code",
  "Canva",
  "Midjourney",
  "Claude",
  "Notion",
];

export const SWATCH_COLORS = ["#000", "#5a5a5a", "#b4b4b4", "#fff"];

export const FOIL_SWATCH_OFFSETS = ["0%", "35%", "70%"];

export const ABOUT_FILE_PARAGRAPHS = [
  "Anastasia Vilmovskaya, web designer and front-end developer.",
  "I design websites and build them myself: on Tilda and WordPress or in code, with 3D and motion where the idea needs it. You get one person responsible for both how the site looks and how it works.",
  "I also design app interfaces, social media and graphics.",
  `Tools: ${TOOLS.join(", ")}.`,
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
    rows: [
      ["Telegram", CONTACT.telegramHandle],
      ["Instagram", CONTACT.instagramHandle],
      ["Behance", CONTACT.behanceHandle],
    ],
  },
} as const;
