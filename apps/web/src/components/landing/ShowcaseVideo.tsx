"use client";

import { useEffect, useRef } from "react";

/**
 * Video de demostración: se descarga y se reproduce solo mientras está en pantalla. Con
 * "reducir movimiento" no arranca solo: quedan los controles.
 */
export function ShowcaseVideo({
  src,
  poster,
  label,
}: {
  src: string;
  poster: string;
  label: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const seen = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.4 },
    );
    seen.observe(video);
    return () => seen.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      className="showcase-video"
      src={src}
      poster={poster}
      width={1280}
      height={720}
      muted
      loop
      playsInline
      controls
      preload="none"
      aria-label={label}
    />
  );
}
