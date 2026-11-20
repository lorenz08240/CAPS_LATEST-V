"use client";

import { useEffect, useRef, useState } from "react";

// The clone itself, running in the page: hover it to play (touch screens play it while it's on screen).
// Shown at its real size, scaled down only when the column is narrower.

export function LiveCard({ src, width, height, label, background }: { src: string; width: number; height: number; label: string; background?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setScale(Math.min(1, e.contentRect.width / width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);

  return (
    <div ref={box} className="livecard" style={{ height: height * scale, background }}>
      <iframe src={src} title={label} width={width} height={height} loading="lazy" style={{ transform: `scale(${scale})` }} />
    </div>
  );
}
