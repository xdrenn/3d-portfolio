import { FilmGrain } from "@/layout/FilmGrain";
import { Footer } from "@/layout/Footer";
import { GridGuides } from "@/layout/GridGuides";
import { Nav } from "@/layout/Nav";
import { ELEMENT_IDS } from "@/lib/elementIds";
import { About } from "@/sections/about/About";
import { CaseStudy } from "@/sections/case-study/CaseStudy";
import { Contact } from "@/sections/contact/Contact";
import { Hero } from "@/sections/hero/Hero";
import { HeroStack } from "@/sections/hero/HeroStack";
import { WorkSection } from "@/sections/work/WorkSection";
import { PortfolioProvider } from "@/state/PortfolioContext";
import { BackgroundCanvas } from "@/three/background/BackgroundCanvas";

export function App() {
  return (
    <PortfolioProvider>
      <FilmGrain />
      <GridGuides />
      <BackgroundCanvas />
      <Nav />

      <main id={ELEMENT_IDS.top}>
        <HeroStack>
          <Hero />
          <WorkSection />
        </HeroStack>
        <About />
        <Contact />
      </main>

      <Footer />
      <CaseStudy />
    </PortfolioProvider>
  );
}
