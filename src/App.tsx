import { useEffect, useRef } from "react";
import { FilmGrain } from "@/layout/FilmGrain";
import { Footer } from "@/layout/Footer";
import { GridGuides } from "@/layout/GridGuides";
import { Nav } from "@/layout/Nav";
import { ELEMENT_IDS } from "@/lib/elementIds";
import { startSmoothScroll } from "@/lib/smoothScroll";
import { startStackedPanels } from "@/lib/stackedPanels";
import { About } from "@/sections/about/About";
import { CaseStudy } from "@/sections/case-study/CaseStudy";
import { Contact } from "@/sections/contact/Contact";
import { Hero } from "@/sections/hero/Hero";
import { HeroStack } from "@/sections/hero/HeroStack";
import { SelectedWork } from "@/sections/selected/SelectedWork";
import { PortfolioProvider } from "@/state/PortfolioContext";

/**
 * Each direct child of <main> is a .panel: a sheet that sticks and gets covered by the next one
 * (lib/stackedPanels.ts). Grounds alternate chalk / graphite. Scrolling is inertial (lib/smoothScroll.ts).
 */
export function App() {
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => startSmoothScroll(), []);

  useEffect(() => {
    if (!mainRef.current) return;
    return startStackedPanels(mainRef.current);
  }, []);

  return (
    <PortfolioProvider>
      <FilmGrain />
      <GridGuides />
      <Nav />

      <main id={ELEMENT_IDS.top} ref={mainRef}>
        <HeroStack>
          <Hero />
        </HeroStack>
        <SelectedWork />
        <About />
        <Contact />
      </main>

      <Footer />
      <CaseStudy />
    </PortfolioProvider>
  );
}
