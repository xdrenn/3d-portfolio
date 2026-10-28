export type ProjectDetail = readonly [label: string, value: string];

export type ProjectMedia =
  | { kind: "image"; name: string }
  | { kind: "video"; name: string; poster: string };

export type Project = {
  title: string;
  categories: string[];
  cover: string;
  description: string;
  details: ProjectDetail[];
  media: ProjectMedia[];
};

const image = (name: string): ProjectMedia => ({ kind: "image", name });

const video = (name: string): ProjectMedia => ({ kind: "video", name, poster: `${name}-poster` });

export const PROJECTS: Project[] = [
  {
    title: "RatTattoo",
    categories: ["Website"],
    cover: "rat1",
    description:
      "Bilingual site for Saint Petersburg tattoo artist Alice Fink. A blackletter wordmark rises over a castle in the clouds, and below it a strict twelve-column grid keeps the layout calm, so the tattoos stay the loudest thing on the page.",
    details: [
      ["Client", "Alice Fink, tattoo artist"],
      ["Role", "Design, development"],
      ["Languages", "Russian, English"],
      ["Grid", "12 columns"],
    ],
    media: [image("rat1"), image("rat2"), image("rat3"), image("rat4"), image("rat5")],
  },
  {
    title: "Crystal",
    categories: ["Website", "poster", "UI"],
    cover: "crystalPoster",
    description:
      "Site and poster for Crystal, an AI tool that turns sketches and text prompts into 3D models. Crystals hold the brand together: a raw quartz cluster on the site, sharp prismatic shards on the poster, with scattered letters and oversized type growing around them.",
    details: [
      ["Type", "Concept brand"],
      ["Role", "UI, poster"],
      ["Tools", "Figma, AI-generated 3D"],
    ],
    media: [image("crystal"), image("crystalPoster")],
  },
  {
    title: "Mark Rothko",
    categories: ["Longread", "motion", "3D"],
    cover: "rothko",
    description:
      "An interactive digital presentation about Mark Rothko and his central idea: color as space. AI-generated video, animation, a scroll-driven story and coded interactions turn his work into a space you move through, ending in a 3D gallery you walk with WASD.",
    details: [
      ["Type", "Interactive presentation"],
      ["Role", "Design, motion, 3D, code"],
      ["Controls", "WASD to move, mouse to look"],
    ],
    media: [
      image("rothko"),
      image("rothko-start"),
      image("rothko-handwriting"),
      video("rothko-letter"),
      image("rothko-colour"),
      image("rothko-chapel"),
      video("rothko-gallery-walk"),
      image("gallery"),
    ],
  },
  {
    title: "Silver",
    categories: ["Longread"],
    cover: "silver",
    description:
      "Silver as the border between light and shadow. Wide serif headings, grey air and macro textures of metal across three chapters.",
    details: [
      ["Role", "Design, layout"],
      ["Language", "Russian"],
    ],
    media: [image("silver"), image("silver-material"), image("silver-light"), image("silver-data")],
  },
  {
    title: "Maria Kupfer",
    categories: ["Business card"],
    cover: "kupfer",
    description:
      "Card for fine art photographer Maria Kupfer, cut from her own photograph. The back works like a gallery label: a framed print, the year and a QR code to her site.",
    details: [
      ["Client", "Maria Kupfer, photographer"],
      ["Role", "Print design"],
    ],
    media: [image("kupfer"), image("kupfer-back")],
  },
];

/**
 * Hidden from the site. Move a project back into PROJECTS to show it again.
 * The 3D gallery now lives inside Mark Rothko; its cover is "gallery-room".
 * Posters are hidden for now: the AI-generated series weakens the selection.
 */
export const HIDDEN_PROJECTS: Project[] = [
  {
    title: "Posters",
    categories: ["Poster", "type"],
    cover: "nostalgic",
    description: "Three AI-generated images, one word each. The lettering carries the mood.",
    details: [
      ["Type", "Personal series"],
      ["Posters", "Nostalgic, Minimal, The Moon"],
    ],
    media: [image("nostalgic"), image("minimal"), image("moon")],
  },
  {
    title: "Homedecor",
    categories: ["Website", "branding", "UI"],
    cover: "homedecor",
    description: "Branding and homepage concept for an interior store: one serif wordmark, one object, a lot of air.",
    details: [
      ["Type", "Concept"],
      ["Role", "Branding, UI"],
    ],
    media: [image("homedecor")],
  },
];

export const PROJECT_COUNT = PROJECTS.length;

export const formatCategories = (project: Project) => project.categories.join(", ");

export const primaryCategory = (project: Project) => project.categories[0];

export const wrapProjectIndex = (index: number) => ((index % PROJECT_COUNT) + PROJECT_COUNT) % PROJECT_COUNT;

export const projectRole = (project: Project) => project.details.find(([label]) => label === "Role")?.[1] ?? "";
