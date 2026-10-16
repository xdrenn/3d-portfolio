import { PROJECTS } from "@/content/projects";

export type DesktopFile =
  | { kind: "project"; projectIndex: number; name: string }
  | { kind: "about"; name: string }
  | { kind: "card"; name: string };

export const projectFileName = (title: string) => `${title.toLowerCase().replace(/\s+/g, "-")}.jpg`;

const PROJECT_FILES: DesktopFile[] = PROJECTS.map((project, projectIndex) => ({
  kind: "project",
  projectIndex,
  name: projectFileName(project.title),
}));

export const DESKTOP_FILES: DesktopFile[] = [
  ...PROJECT_FILES,
  { kind: "about", name: "about.txt" },
  { kind: "card", name: "card.holo" },
];

export const projectFile = (projectIndex: number) => PROJECT_FILES[projectIndex];
