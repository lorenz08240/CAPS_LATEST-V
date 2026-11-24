import React, { useEffect, useRef } from "react";
import "./PixelCanvas.css";

/**
 * PixelCanvas — Lightweight interactive pixel grid hover effect
 * Inspired by Ryan Mulligan (@hexagoncircle/pixel-canvas)
 * Tailored to BuildLab Charcoal Palette (#0C0C0F, #202023, #3F3F45, #C9C7C0, #F5F4F0)
 */
export default function PixelCanvas({
  colors = ["#0C0C0F", "#202023", "#3F3F45", "#C9C7C0", "#F5F4F0"],
  gap = 6,
  speed = 30,
  noFocus = false,
  className = "",
  style = {},
}) {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const ambientTimerRef = useRef(null);
  const pixelsRef = useRef([]);
  const activeIndicesRef = useRef(new Set());
  const mouseRef = useRef({ x: -1000, y: -1000, isHovered: false });
  const isLoopRunningRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    const pixelSize = Math.max(3, gap - 2);
    const hoverRadius = 85;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.floor(rect.width);
      height = Math.floor(rect.height);
      if (width === 0 || height === 0) return;

      // Clamp DPR to 1.5 to prevent GPU fillrate exhaustion on Retina MacBook displays
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      // Rebuild pixel grid
      cols = Math.floor(width / gap);
      rows = Math.floor(height / gap);
      const newPixels = [];
      activeIndicesRef.current.clear();

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          newPixels.push({
            x: c * gap + (gap - pixelSize) / 2,
            y: r * gap + (gap - pixelSize) / 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: 0,
            targetAlpha: 0,
            fadeSpeed: 0.02 + Math.random() * 0.04,
          });
        }
      }
      pixelsRef.current = newPixels;
    };

    resize();
    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas.parentElement || canvas);

    const parent = canvas.parentElement || canvas;

    const wakeUpLoop = () => {
      if (!isLoopRunningRef.current) {
        isLoopRunningRef.current = true;
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    const activatePixelsNearMouse = (mx, my) => {
      if (cols <= 0 || rows <= 0) return;
      const colMin = Math.max(0, Math.floor((mx - hoverRadius) / gap));
      const colMax = Math.min(cols - 1, Math.ceil((mx + hoverRadius) / gap));
      const rowMin = Math.max(0, Math.floor((my - hoverRadius) / gap));
      const rowMax = Math.min(rows - 1, Math.ceil((my + hoverRadius) / gap));

      const pixels = pixelsRef.current;
      for (let r = rowMin; r <= rowMax; r++) {
        for (let c = colMin; c <= colMax; c++) {
          const idx = r * cols + c;
          const p = pixels[idx];
          if (!p) continue;

          const dx = p.x - mx;
          const dy = p.y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < hoverRadius) {
            const intensity = 1 - dist / hoverRadius;
            p.targetAlpha = Math.max(p.targetAlpha, intensity * 0.85);
            activeIndicesRef.current.add(idx);
          }
        }
      }
    };

    const handlePointerMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      mouseRef.current.x = mx;
      mouseRef.current.y = my;
      mouseRef.current.isHovered = true;

      activatePixelsNearMouse(mx, my);
      wakeUpLoop();
    };

    const handlePointerLeave = () => {
      mouseRef.current.isHovered = false;
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;

      const pixels = pixelsRef.current;
      for (const idx of activeIndicesRef.current) {
        const p = pixels[idx];
        if (p) p.targetAlpha = 0;
      }
    };

    parent.addEventListener("pointermove", handlePointerMove, { passive: true });
    parent.addEventListener("pointerleave", handlePointerLeave, { passive: true });

    // Subtle ambient shimmer when idle without continuous CPU polling
    ambientTimerRef.current = setInterval(() => {
      if (document.hidden) return;
      const pixels = pixelsRef.current;
      if (pixels.length === 0 || mouseRef.current.isHovered) return;

      if (Math.random() < 0.3) {
        const count = 1 + Math.floor(Math.random() * 2);
        for (let k = 0; k < count; k++) {
          const randIdx = Math.floor(Math.random() * pixels.length);
          const p = pixels[randIdx];
          if (p) {
            p.targetAlpha = 0.25;
            activeIndicesRef.current.add(randIdx);
          }
        }
        wakeUpLoop();
      }
    }, 500);

    // Optimized Animation Loop: only iterates over active non-zero pixels
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const isHovered = mouseRef.current.isHovered;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      if (isHovered) {
        activatePixelsNearMouse(mx, my);
      }

      const pixels = pixelsRef.current;
      const toRemove = [];

      for (const idx of activeIndicesRef.current) {
        const p = pixels[idx];
        if (!p) {
          toRemove.push(idx);
          continue;
        }

        if (!isHovered) {
          p.targetAlpha *= 0.94;
        } else {
          const dx = p.x - mx;
          const dy = p.y - my;
          if (Math.sqrt(dx * dx + dy * dy) >= hoverRadius) {
            p.targetAlpha *= 0.94;
          }
        }

        // Smooth alpha interpolation
        if (p.alpha < p.targetAlpha) {
          p.alpha += p.fadeSpeed * 1.5;
          if (p.alpha > p.targetAlpha) p.alpha = p.targetAlpha;
        } else if (p.alpha > p.targetAlpha) {
          p.alpha -= p.fadeSpeed * 0.6;
          if (p.alpha < 0.001) p.alpha = 0;
        }

        if (p.alpha > 0.01) {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.fillRect(p.x, p.y, pixelSize, pixelSize);
        } else if (p.targetAlpha <= 0.01) {
          toRemove.push(idx);
        }
      }

      ctx.globalAlpha = 1;

      for (let i = 0; i < toRemove.length; i++) {
        activeIndicesRef.current.delete(toRemove[i]);
      }

      // If no active pixels remain and mouse is not hovered, sleep loop to save 100% CPU
      if (activeIndicesRef.current.size === 0 && !isHovered) {
        isLoopRunningRef.current = false;
        animFrameRef.current = null;
        return;
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (ambientTimerRef.current) clearInterval(ambientTimerRef.current);
      ro.disconnect();
      parent.removeEventListener("pointermove", handlePointerMove);
      parent.removeEventListener("pointerleave", handlePointerLeave);
      isLoopRunningRef.current = false;
    };
  }, [colors, gap, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={`buildlab-pixel-canvas ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

