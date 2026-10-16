import { useEffect, useLayoutEffect, useRef } from "react";
import type { ProjectMedia } from "@/content/projects";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { projectImageUrl, projectVideoSources } from "@/lib/mediaPaths";

type ProjectMediaViewProps = {
  media: ProjectMedia;
  alt: string;
  isActive?: boolean;
  onNaturalSize?: (width: number, height: number) => void;
};

const HAVE_METADATA = 1;

export function ProjectMediaView({ media, alt, isActive = true, onNaturalSize }: ProjectMediaViewProps) {
  const reducedMotion = usePrefersReducedMotion();
  const imageRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reportSize = useRef(onNaturalSize);
  reportSize.current = onNaturalSize;

  const shouldPlay = isActive && !reducedMotion;

  useLayoutEffect(() => {
    const image = imageRef.current;
    if (image?.complete && image.naturalWidth) reportSize.current?.(image.naturalWidth, image.naturalHeight);

    const video = videoRef.current;
    if (video && video.readyState >= HAVE_METADATA) reportSize.current?.(video.videoWidth, video.videoHeight);
  }, [media]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    if (shouldPlay) video.play().catch(() => undefined);
    else video.pause();
  }, [shouldPlay, media]);

  if (media.kind === "video") {
    return (
      <video
        key={media.name}
        ref={videoRef}
        aria-label={alt}
        poster={projectImageUrl(media.poster)}
        muted
        loop
        playsInline
        preload="metadata"
        controls={reducedMotion}
        onLoadedMetadata={(event) => reportSize.current?.(event.currentTarget.videoWidth, event.currentTarget.videoHeight)}
      >
        {projectVideoSources(media.name).map((source) => (
          <source key={source.type} src={source.src} type={source.type} />
        ))}
      </video>
    );
  }

  return (
    <img
      key={media.name}
      ref={imageRef}
      alt={alt}
      decoding="async"
      src={projectImageUrl(media.name)}
      onLoad={(event) => reportSize.current?.(event.currentTarget.naturalWidth, event.currentTarget.naturalHeight)}
    />
  );
}
