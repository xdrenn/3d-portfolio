export const ELEMENT_IDS = {
  top: "top",
  work: "work",
  about: "about",
  contact: "contact",
  holoCard: "holo-card",
  caseStudyTitle: "case-study-title",
} as const;

export const anchorTo = (id: string) => `#${id}`;
