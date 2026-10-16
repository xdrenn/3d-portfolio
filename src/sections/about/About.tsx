import { useEffect, useRef } from "react";
import { useInViewRef } from "@/hooks/useInViewRef";
import { SectionHead } from "@/layout/SectionHead";
import { ELEMENT_IDS } from "@/lib/elementIds";
import { ServiceList } from "./ServiceList";
import { Stickers } from "./Stickers";
import "./about.css";

const toPercent = (value: number, total: number) => `${((value / total) * 100).toFixed(1)}%`;

export function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInViewRef(sectionRef);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const trackPointer = (event: PointerEvent) => {
      if (!isInView.current) return;
      section.style.setProperty("--pointer-x", toPercent(event.clientX, window.innerWidth));
      section.style.setProperty("--pointer-y", toPercent(event.clientY, window.innerHeight));
    };

    window.addEventListener("pointermove", trackPointer);
    return () => window.removeEventListener("pointermove", trackPointer);
  }, [isInView]);

  return (
    <section id={ELEMENT_IDS.about} className="about page-padding" ref={sectionRef}>
      <SectionHead title="About">Working with clients worldwide.</SectionHead>
      <div className="about__intro grid">
        <p className="about__statement">
          Designer who <em>codes.</em><br /> Developer who cares how it looks.
        </p>
        <div className="about__stickers">
          <Stickers />
        </div>
      </div>
      <ServiceList />
    </section>
  );
}
