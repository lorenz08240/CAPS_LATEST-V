import React from "react";
import { motion as Motion } from "motion/react";

/**
 * Route choreography: a plain crossfade.
 *
 * Opacity only — no translate, scale or blur. Transform/filter (and their
 * will-change aliases) turn the wrapper into a containing block, which breaks
 * `position: fixed` children such as the Home sticky header. Keeping it to
 * opacity also avoids the springy "pasted on" feel of the blur-rise.
 */

const crossfade = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.24, ease: "easeInOut" } },
  exit: { opacity: 0, transition: { duration: 0.18, ease: "easeInOut" } },
};

const MOTION_PROPS = {
  "/build": {
    ...crossfade,
    style: { height: "100%", width: "100%", overflow: "hidden" },
  },
  "/compatibility": {
    ...crossfade,
    style: { minHeight: "100dvh" },
  },
  "/3d-builder": crossfade,
  "/admin": crossfade,
  default: crossfade,
};

/** Wrap each routed page so it plays its enter/exit animation. */
export default function MotionPage({ routeKey, children }) {
  const spec = MOTION_PROPS[routeKey] || MOTION_PROPS.default;
  const { style, ...props } = spec;
  return (
    <Motion.div {...props} style={{ ...style, willChange: "opacity" }}>
      {children}
    </Motion.div>
  );
}
