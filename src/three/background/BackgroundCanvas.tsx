import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { usePortfolio } from "@/state/PortfolioContext";
import { BackgroundScene } from "./BackgroundScene";
import "./background.css";

const MAX_PIXEL_RATIO = 1.5;
const EXPOSURE = 1.15;

export function BackgroundCanvas() {
  const { openCaseIndex } = usePortfolio();
  const reducedMotion = usePrefersReducedMotion();
  const [pixelRatio] = useState(() => Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
  const isPaused = openCaseIndex !== null;

  return (
    <div className="background-canvas" aria-hidden="true">
      <Canvas
        frameloop={isPaused ? "never" : "always"}
        dpr={pixelRatio}
        gl={{ antialias: true, alpha: true }}
        camera={{ fov: 32, near: 0.1, far: 100, position: [0, 0, 13] }}
        style={{ pointerEvents: "none" }}
        onCreated={({ gl }) => {
          gl.toneMappingExposure = EXPOSURE;
          gl.setClearColor(0xffffff, 0);
        }}
      >
        <BackgroundScene reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}
