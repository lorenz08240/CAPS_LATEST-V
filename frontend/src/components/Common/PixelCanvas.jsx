import React, { useEffect, useRef } from "react";
import "./PixelCanvas.css";

/**
 * PixelCanvas — Lightweight interactive pixel grid hover effect
 * Inspired by Ryan Mulligan (@hexagoncircle/pixel-canvas)
 * Tailored to BuildLab dark cyber palette (#00e5a0, #38bdf8, #f43f5e, #facc15)
 */
export default function PixelCanvas({
  colors = ["#00e5a0", "#38bdf8", "#f43f5e", "#facc15"],
  gap = 6,
  speed = 30,
  noFocus = false,
  className = "",
  style = {},
}) {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const pixelsRef = useRef([]);
  const mouseRef = useRef({ x: -1000, y: -1000, isHovered: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    const pixelSize = Math.max(3, gap - 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.floor(rect.width);
      height = Math.floor(rect.height);
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      // Rebuild pixel grid
      const cols = Math.floor(width / gap);
      const rows = Math.floor(height / gap);
      const newPixels = [];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          newPixels.push({
            x: c * gap + (gap - pixelSize) / 2,
            y: r * gap + (gap - pixelSize) / 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: 0,
            targetAlpha: 0,
            fadeSpeed: 0.02 + Math.random() * 0.04,
            idleTimer: Math.random() * 200,
          });
        }
      }
      pixelsRef.current = newPixels;
    };

    resize();
    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas.parentElement || canvas);

    // Parent container mouse interactions
    const parent = canvas.parentElement || canvas;

    const handlePointerMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.isHovered = true;
    };

    const handlePointerLeave = () => {
      mouseRef.current.isHovered = false;
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    };

    parent.addEventListener("pointermove", handlePointerMove);
    parent.addEventListener("pointerleave", handlePointerLeave);

    // Animation Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const isHovered = mouseRef.current.isHovered;
      const hoverRadius = 85;

      const pixels = pixelsRef.current;
      for (let i = 0; i < pixels.length; i++) {
        const p = pixels[i];

        if (isHovered) {
          const dx = p.x - mx;
          const dy = p.y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < hoverRadius) {
            // Proximity intensity
            const intensity = 1 - dist / hoverRadius;
            p.targetAlpha = Math.max(p.targetAlpha, intensity * 0.85);
          } else {
            p.targetAlpha *= 0.94;
          }
        } else {
          // Subtle ambient shimmer when idle
          p.idleTimer += 1;
          if (p.idleTimer > 180) {
            if (Math.random() < 0.008) {
              p.targetAlpha = 0.25;
            }
            p.idleTimer = 0;
          }
          p.targetAlpha *= 0.95;
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
        }
      }
      ctx.globalAlpha = 1;

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      ro.disconnect();
      parent.removeEventListener("pointermove", handlePointerMove);
      parent.removeEventListener("pointerleave", handlePointerLeave);
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

