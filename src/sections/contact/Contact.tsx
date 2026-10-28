import { useEffect, useRef, useState } from "react";
import { CONTACT } from "@/content/contact";
import { ELEMENT_IDS } from "@/lib/elementIds";
import { HoloCard, type HoloCardHandle } from "@/three/card/HoloCard";
import "./contact.css";

const COPY_LABEL = "Copy email";
const COPIED_LABEL = "Email copied";
const COPY_FEEDBACK_MS = 2200;

function useCopyEmail() {
  const [label, setLabel] = useState(COPY_LABEL);
  const resetTimer = useRef<number>();

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT.email);
      setLabel(COPIED_LABEL);
    } catch {
      setLabel(CONTACT.email);
    }
    clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setLabel(COPY_LABEL), COPY_FEEDBACK_MS);
  };

  return { label, copy, copied: label === COPIED_LABEL };
}

export function Contact() {
  const cardRef = useRef<HoloCardHandle>(null);
  const copyEmail = useCopyEmail();

  return (
    <section id={ELEMENT_IDS.contact} className="contact panel tone-graphite page-padding">

      <a className="contact__email-link holo-bleed" href={`mailto:${CONTACT.email}`}>
        Write <em>to me</em>
      </a>

      <div className="contact__card-area grid">
        <div className="contact__card-copy">
          <div className="contact__card-copy-inner">
            <h3 className="contact__card-title">
              Take a card
            </h3>
            <p className="contact__card-hint">
              Drag it to turn it in the light, tap to flip it over. The links on the back are clickable.
            </p>
            <div className="contact__card-links">
              <button type="button" className="contact__text-button" onClick={() => cardRef.current?.flip()}>
                Flip over
              </button>
              <button
                type="button"
                className={`contact__text-button${copyEmail.copied ? " is-done" : ""}`}
                onClick={copyEmail.copy}
                aria-live="polite"
              >
                {copyEmail.label}
              </button>
            </div>
          </div>
        </div>
        <HoloCard ref={cardRef} />
      </div>
    </section>
  );
}
