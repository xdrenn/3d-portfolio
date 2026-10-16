import { ABOUT_FILE_PARAGRAPHS } from "@/content/site";
import { DesktopWindowFrame, type DesktopWindowProps } from "./DesktopWindow";

export function AboutWindow(props: DesktopWindowProps) {
  return (
    <DesktopWindowFrame {...props} title="about.txt">
      <div className="desktop-window__body desktop-window__body--paper">
        {ABOUT_FILE_PARAGRAPHS.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </DesktopWindowFrame>
  );
}
