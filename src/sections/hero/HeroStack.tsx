import { useEffect, useRef, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { clamp } from "@/lib/math";
import { scrollProgress } from "@/state/scrollProgress";
import "./hero.css";

export function HeroStack({ children }: { children: ReactNode }) {
  const stackRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    let frameRequested = false;

    const updateProgress = () => {
      frameRequested = false;
      const progress = clamp(window.scrollY / window.innerHeight, 0, 1);
      scrollProgress.hero = progress;
      if (!reducedMotion) stackRef.current?.style.setProperty("--hero-progress", progress.toFixed(3));
    };

    const handleScroll = () => {
      if (frameRequested) return;
      frameRequested = true;
      requestAnimationFrame(updateProgress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    updateProgress();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [reducedMotion]);

  return (
    <div className="hero-stack" ref={stackRef}>
      {children}
    </div>
  );
}
