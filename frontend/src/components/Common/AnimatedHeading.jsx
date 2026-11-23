import React from "react";
import { motion, useReducedMotion } from "motion/react";
import "./AnimatedHeading.css";

const HIDDEN_CLIP = "inset(0% 0% 100% 0%)";
const SHOWN_CLIP = "inset(-25% -10% -25% -10%)";
const EASE = [0.76, 0, 0.24, 1];

/**
 * AnimatedHeading (Kivi UI implementation)
 *
 * Provides a crisp, kinetic word-by-word reveal:
 * - Words slide up with a 3deg rotational untilt (origin: bottom-left).
 * - Clipped with clip-path (no muddy opacity fade in standard mode).
 * - Left-to-right accent underline wipe timed after all words land.
 * - Bidirectional scroll trigger: re-reveals when scrolling up or down (once = false).
 * - Supports prefers-reduced-motion fallback.
 */
export default function AnimatedHeading({
  as: Tag = "h2",
  lines = [],
  delay = 0.15,
  stagger = 0.07,
  underline = true,
  underlineClassName = "",
  className = "",
  once = false,
  ...rest
}) {
  const reduceMotion = useReducedMotion();

  const container = {
    hidden: {},
    show: {
      transition: {
        delayChildren: delay,
        staggerChildren: stagger,
      },
    },
  };

  const word = reduceMotion
    ? {
        hidden: { opacity: 0, transition: { duration: 0.2 } },
        show: { opacity: 1, transition: { duration: 0.4 } },
      }
    : {
        hidden: {
          clipPath: HIDDEN_CLIP,
          y: "70%",
          rotate: 3,
          transition: { duration: 0.25, ease: "easeIn" },
        },
        show: {
          clipPath: SHOWN_CLIP,
          y: "0%",
          rotate: 0,
          transition: { duration: 0.9, ease: EASE },
        },
      };

  const totalWords = lines.join(" ").split(/\s+/).filter(Boolean).length;
  const underlineDelay = delay + totalWords * stagger + 0.5;

  const MotionTag = motion[Tag] || motion.h2;

  return (
    <MotionTag
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount: 0.2, margin: "0px 0px -20px 0px" }}
      className={`animated-heading ${className}`.trim()}
      {...rest}
    >
      <span className="animated-heading__body">
        {lines.map((line, lineIndex) => (
          <span key={lineIndex} className="animated-heading__line">
            {line.split(" ").map((w, wordIndex) => (
              <motion.span
                key={`${lineIndex}-${wordIndex}`}
                variants={word}
                className="animated-heading__word"
              >
                {w}
              </motion.span>
            ))}
          </span>
        ))}
      </span>

      {underline && (
        <motion.span
          aria-hidden="true"
          className={`animated-heading__underline ${underlineClassName}`.trim()}
          variants={{
            hidden: {
              clipPath: "inset(0% 100% 0% 0%)",
              transition: { duration: 0.2 },
            },
            show: {
              clipPath: "inset(0% 0% 0% 0%)",
              transition: {
                duration: reduceMotion ? 0 : 0.8,
                ease: EASE,
                delay: reduceMotion ? 0 : underlineDelay,
              },
            },
          }}
        />
      )}
    </MotionTag>
  );
}
