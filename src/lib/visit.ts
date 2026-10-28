/**
 * What this visitor did on the page, for the receipt. Lives only in memory in this tab:
 * nothing is stored or sent anywhere.
 */
const startedAt = Date.now();
const openedProjects = new Set<number>();
let isAboutRead = false;

export const visit = {
  openProject(projectIndex: number) {
    openedProjects.add(projectIndex);
  },
  readAbout() {
    isAboutRead = true;
  },
  snapshot() {
    return {
      minutes: Math.floor((Date.now() - startedAt) / 60000),
      projectsOpened: openedProjects.size,
      isAboutRead,
    };
  },
};

export type VisitSnapshot = ReturnType<typeof visit.snapshot>;
