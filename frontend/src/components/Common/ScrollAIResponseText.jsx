import React, { useRef, useMemo } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
} from "motion/react";
import "./ScrollAIResponseText.css";

/**
 * ScrollAIResponseText
 *
 * Combines Kivi UI's:
 * 1. `ScrollHighlightText`: Scroll-driven word-by-word progressive scrub (useScroll + useSpring).
 * 2. `AIResponseText`: Cinematic glowing blur reveal (dual-layer blur-to-focus + leading-edge highlight flash).
 *
 * As the user scrolls down, words progressively de-blur and flash in their theme accent color.
 * When the user scrolls back up, words smoothly un-reveal back to ghost state.
 */
function ScrollAIWord({
  word,
  progress,
  start,
  end,
  ghostOpacity,
  highlightColor,
  reduced,
}) {
  // Layer 1: Base Text (blur-to-focus + opacity reveal)
  const opacity = useTransform(progress, [start, end], [ghostOpacity, 1], {
    clamp: true,
  });
  const filter = useTransform(
    progress,
    [start, end],
    ["blur(4px)", "blur(0px)"],
    { clamp: true }
  );
  const y = useTransform(progress, [start, end], [3, 0], {
    clamp: true,
  });

  // Layer 2: Leading-edge glowing highlight flash (from AIResponseText)
  // Reaches peak illumination at 30% through the word's window, then fades to 0 as it settles
  const highlightOpacity = useTransform(
    progress,
    [start, start + (end - start) * 0.28, end],
    [0, 1, 0],
    { clamp: true }
  );

  if (reduced) {
    return (
      <span className="scroll-ai-word-wrapper">
        <span className="scroll-ai-word-base">{word}</span>
      </span>
    );
  }

  return (
    <span className="scroll-ai-word-wrapper">
      {/* Settled Base Word */}
      <motion.span
        className="scroll-ai-word-base"
        style={{ opacity, filter, y }}
      >
        {word}
      </motion.span>

      {/* Leading-Edge Glowing Highlight Flash */}
      <motion.span
        aria-hidden="true"
        className="scroll-ai-word-highlight"
        style={{
          opacity: highlightOpacity,
          filter,
          y,
          color: highlightColor,
          textShadow: `0 0 10px ${highlightColor}99, 0 0 20px ${highlightColor}44`,
        }}
      >
        {word}
      </motion.span>
    </span>
  );
}

export default function ScrollAIResponseText({
  text = "",
  children,
  className = "",
  ghostOpacity = 0.25,
  highlightColor = "#f43f5e",
  ...rest
}) {
  const containerRef = useRef(null);
  const reduced = useReducedMotion() ?? false;

  const rawText = useMemo(() => {
    if (typeof text === "string" && text.length > 0) return text;
    if (typeof children === "string") return children;
    if (Array.isArray(children)) return children.join(" ");
    return "";
  }, [text, children]);

  const words = useMemo(
    () => rawText.trim().split(/\s+/).filter(Boolean),
    [rawText]
  );

  // Scroll tracking: drives the timeline as the text moves through the reading zone
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 88%", "start 45%"],
  });

  // Inertial spring for buttery smooth interpolation without mouse-wheel notch jitter
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 130,
    damping: 24,
    mass: 0.35,
  });

  const total = words.length;
  const span = 0.88;
  const step = total > 0 ? span / total : span;
  const windowSize = Math.min(step * 2.2, 0.28);

  return (
    <p
      ref={containerRef}
      aria-label={rawText}
      className={`scroll-ai-response-text ${className}`.trim()}
      {...rest}
    >
      {words.map((w, idx) => {
        const start = 0.04 + idx * step;
        const end = Math.min(start + windowSize, 1);

        return (
          <ScrollAIWord
            key={`${w}-${idx}`}
            word={w}
            progress={smoothProgress}
            start={start}
            end={end}
            ghostOpacity={ghostOpacity}
            highlightColor={highlightColor}
            reduced={reduced}
          />
        );
      })}
    </p>
  );
}
