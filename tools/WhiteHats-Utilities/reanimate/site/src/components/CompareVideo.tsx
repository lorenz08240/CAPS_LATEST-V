"use client";

import { useEffect, useRef } from "react";

// The original and the clone, recorded the same way and put side by side (or stacked) in one video
// file, so both halves always show the same moment. Plays only while on screen.

export function CompareVideo({ src, width, height, label }: { src: string; width: number; height: number; label: string }) {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      v.controls = true;
      return;
    }
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? void v.play().catch(() => {}) : v.pause()), { threshold: 0.3 });
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return <video ref={video} className="compare" src={src} muted playsInline loop preload="metadata" width={width} height={height} aria-label={label} />;
}
