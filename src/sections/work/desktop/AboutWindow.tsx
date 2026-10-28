import { ABOUT_FILE } from "@/content/site";
import { isTouchScreen } from "@/lib/breakpoints";
import { DesktopWindowFrame, type DesktopWindowProps } from "./DesktopWindow";

export function AboutWindow(props: DesktopWindowProps) {
  const paragraphs = [
    ...ABOUT_FILE.intro,
    isTouchScreen() ? ABOUT_FILE.openHint.touch : ABOUT_FILE.openHint.mouse,
    ABOUT_FILE.keysHint,
  ];

  return (
    <DesktopWindowFrame {...props} title="about.txt">
      <div className="desktop-window__body desktop-window__body--paper">
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </DesktopWindowFrame>
  );
}
