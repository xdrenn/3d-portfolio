export function scrollToElement(
  element: Element | null | undefined,
  { reducedMotion, block }: { reducedMotion: boolean; block: ScrollLogicalPosition },
) {
  element?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block });
}
