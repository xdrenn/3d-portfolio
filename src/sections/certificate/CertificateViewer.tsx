import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CERTIFICATE_IMAGE, CERTIFICATE_ZONES } from "@/content/certificate";
import { projectImageUrl } from "@/lib/mediaPaths";
import "./certificate.css";

type CertificateViewerProps = {
  isOpen: boolean;
  onClose: () => void;
};

/**
 * Full-size certificate. Hovering (or focusing, or tapping) a block of Russian text
 * lays the English translation over exactly that block, like the OS is reading it.
 * "Translate all" shows every block at once for people who don't want to hunt.
 */
export function CertificateViewer({ isOpen, onClose }: CertificateViewerProps) {
  const [isTranslatedAll, setIsTranslatedAll] = useState(false);
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => closeRef.current?.focus(), 30);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="certificate-viewer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="certificate-title"
      // Rendered through a portal, but React still bubbles events to the desktop window and the
      // computer's tilt handler. Stop them here so the viewer behaves like its own place.
      onPointerDown={(event) => event.stopPropagation()}
      onPointerMove={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      <div className="certificate-viewer__backdrop" onClick={onClose} />

      <div className="certificate-viewer__window">
        <div className="certificate-viewer__bar">
          <span id="certificate-title">certificate.pdf</span>
          <span className="certificate-viewer__hint">Hover or tap the text to translate it</span>
          <button className="certificate-viewer__close" ref={closeRef} onClick={onClose} aria-label="Close certificate">
            ×
          </button>
        </div>

        <figure className={`certificate${isTranslatedAll ? " is-translated" : ""}`}>
          <img
            className="certificate__scan"
            src={projectImageUrl(CERTIFICATE_IMAGE)}
            alt="Certificate No. 153 from the OHD School of Digital Design, in Russian"
          />
          {CERTIFICATE_ZONES.map((zone) => (
            <button
              key={zone.id}
              className={`certificate__zone${activeZone === zone.id ? " is-active" : ""}${
                zone.isDescription ? " is-description" : ""
              }${zone.isTitle ? " is-title" : ""}`}
              style={{
                left: `${zone.left}%`,
                top: `${zone.top}%`,
                width: `${zone.width}%`,
                height: `${zone.height}%`,
              }}
              onPointerEnter={() => setActiveZone(zone.id)}
              onPointerLeave={() => setActiveZone((current) => (current === zone.id ? null : current))}
              onFocus={() => setActiveZone(zone.id)}
              onBlur={() => setActiveZone(null)}
              onClick={() => setActiveZone((current) => (current === zone.id ? null : zone.id))}
              aria-label={zone.english}
            >
              <span className="certificate__english" aria-hidden="true">
                {zone.english}
              </span>
            </button>
          ))}
        </figure>

        <div className="certificate-viewer__footer">
          <span className="certificate-viewer__note">My translation, unofficial. The original is underneath.</span>
          <button className="certificate-viewer__toggle" onClick={() => setIsTranslatedAll((value) => !value)}>
            {isTranslatedAll ? "Show original" : "Translate all"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
