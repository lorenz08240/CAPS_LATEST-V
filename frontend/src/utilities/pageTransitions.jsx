import React from "react";
import { motion } from "motion/react";

/**
 * Page transition choreography (motion / framer-motion).
 *
 * Route-specific animations, wrapped once per page in App.jsx:
 *  - BUILD -> COMPATIBILITY (and reverse): the whole page "moves down"
 *    — the outgoing page slides down out while the incoming one slides
 *    down into place, cross-fading. Directional feel: a vertical move.
 *  - Every other route: distinct lightweight animations:
 *      • Home / Brands / Learn: fall-into-place rise (y 16 -> 0)
 *      • 3D Studio / Admin: quiet opacity-only pop (keeps heavy canvases snappy)
 *      • /build: slides down OUT when leaving (complements Compatibility's
 *        top entry) and fades in from a subtle below-offset otherwise.
 */

const EASE = [0.32, 0.72, 0, 1];

const MOTION_PROPS = {
  "/build": {
    initial: { opacity: 0, y: 10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: EASE },
    },
    exit: {
      opacity: 0,
      y: "22vh",
      transition: { duration: 0.34, ease: EASE },
    },
    style: { minHeight: "100dvh" },
  },
  "/compatibility": {
    initial: { opacity: 0, y: "-22vh" },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.42, ease: EASE },
    },
    exit: {
      opacity: 0,
      y: "12vh",
      transition: { duration: 0.26, ease: EASE },
    },
    style: { minHeight: "100dvh" },
  },
  "/3d-builder": {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.28, ease: "easeOut" } },
    exit: { opacity: 0, transition: { duration: 0.22, ease: "easeOut" } },
  },
  "/admin": {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.28, ease: "easeOut" } },
    exit: { opacity: 0, transition: { duration: 0.22, ease: "easeOut" } },
  },
  default: {
    initial: { opacity: 0, y: 18, scale: 0.995 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.32, ease: EASE },
    },
    exit: {
      opacity: 0,
      y: -12,
      transition: { duration: 0.2, ease: "easeOut" },
    },
  },
};

/** Wrap each routed page so it plays its enter/exit animation. */
export default function MotionPage({ routeKey, children }) {
  const spec = MOTION_PROPS[routeKey] || MOTION_PROPS.default;
  const { style, ...props } = spec;
  return (
    <motion.div {...props} style={style}>
      {children}
    </motion.div>
  );
}
