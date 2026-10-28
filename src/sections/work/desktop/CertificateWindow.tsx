import { useCallback, useState } from "react";
import { projectThumbnailUrl } from "@/lib/mediaPaths";
import { CertificateViewer } from "@/sections/certificate/CertificateViewer";
import { DesktopWindowFrame, type DesktopWindowProps } from "./DesktopWindow";

export function CertificateWindow(props: DesktopWindowProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const closeViewer = useCallback(() => setIsViewerOpen(false), []);

  return (
    <DesktopWindowFrame {...props} title="certificate.pdf">
      <div className="desktop-window__body desktop-window__body--paper desktop-window__body--certificate">
        <img className="desktop-window__certificate" src={projectThumbnailUrl("certificate")} alt="" />
        <p>
          Web design and digital branding, 227.5 hours. It’s in Russian, so I taught this OS to translate it.
        </p>
      </div>
      <div className="desktop-window__footer">
        <span className="desktop-window__caption" />
        <button className="desktop-window__default-button" onClick={() => setIsViewerOpen(true)}>
          Open and translate
        </button>
      </div>
      <CertificateViewer isOpen={isViewerOpen} onClose={closeViewer} />
    </DesktopWindowFrame>
  );
}
