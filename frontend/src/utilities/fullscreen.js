// Cross-browser Fullscreen & Orientation helpers for BuildLab.
// Browsers require a user gesture (click/tap) before entering fullscreen,
// so `enterFullscreen()` must always be called from inside an event handler.

const ENGAGE_KEY = "buildlab_fullscreen_engaged";

const FS_ELEMENT = () =>
  document.fullscreenElement ||
  document.webkitFullscreenElement ||
  document.mozFullScreenElement ||
  document.msFullscreenElement ||
  null;

/** Is the Fullscreen API available in this browser? (e.g. iPhone Safari: no) */
export function isFullscreenSupported() {
  const el = document.documentElement;
  return !!(
    el.requestFullscreen ||
    el.webkitRequestFullscreen ||
    el.mozRequestFullScreen ||
    el.msRequestFullscreen
  );
}

/** Currently in fullscreen? */
export function isFullscreenActive() {
  return !!FS_ELEMENT();
}

/** Enter fullscreen on the given element (defaults to <html>). Returns true on success. */
export async function enterFullscreen(el = document.documentElement) {
  const fn =
    el.requestFullscreen ||
    el.webkitRequestFullscreen ||
    el.mozRequestFullScreen ||
    el.msRequestFullscreen;
  if (!fn) return false;
  try {
    await fn.call(el, { navigationUI: "hide" });
    return true;
  } catch {
    return false;
  }
}

/** Leave fullscreen. */
export function exitFullscreen() {
  const fn =
    document.exitFullscreen ||
    document.webkitExitFullscreen ||
    document.mozCancelFullScreen ||
    document.msExitFullscreen;
  if (fn) {
    try {
      fn.call(document);
    } catch {
      /* failsafe */
    }
  }
}

/**
 * Did the user enter fullscreen at least once this session?
 * Used so casual Home visitors are never nagged, but once they commit
 * to the build experience, exiting fullscreen re-prompts them.
 */
export function hasEngagedFullscreen() {
  try {
    return sessionStorage.getItem(ENGAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function markFullscreenEngaged() {
  try {
    sessionStorage.setItem(ENGAGE_KEY, "1");
  } catch {
    /* storage unavailable (private mode) — fail silently */
  }
}

/** Portrait orientation? (height greater than width) */
export function isPortrait() {
  return window.innerHeight > window.innerWidth;
}

/** Touch-first device (phone / tablet without mouse)? */
export function isCoarsePointer() {
  return window.matchMedia("(pointer: coarse)").matches;
}

/**
 * Should we show the "Rotate your device" screen?
 * Phones/tablets held in portrait with a small viewport.
 * Desktop windows (even narrow ones) are never affected.
 */
export function needsRotation() {
  return isPortrait() && isCoarsePointer() && window.innerWidth < 900;
}

/** Subscribe to fullscreen/resize/orientation changes. Returns an unsubscribe fn. */
export function onViewportChange(handler) {
  document.addEventListener("fullscreenchange", handler);
  document.addEventListener("webkitfullscreenchange", handler);
  window.addEventListener("resize", handler);
  window.addEventListener("orientationchange", handler);
  return () => {
    document.removeEventListener("fullscreenchange", handler);
    document.removeEventListener("webkitfullscreenchange", handler);
    window.removeEventListener("resize", handler);
    window.removeEventListener("orientationchange", handler);
  };
}
