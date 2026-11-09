// Cross-browser Fullscreen & Orientation helpers for BuildLab.
// Browsers require a user gesture (click/tap) before entering fullscreen,
// so `enterFullscreen()` must always be called from inside an event handler.

const ENGAGE_KEY = "buildlab_fullscreen_engaged";

export const FS_ELEMENT = () => {
  if (typeof document === "undefined") return null;
  return (
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement ||
    null
  );
};

/** Is the Fullscreen API available in this browser? (e.g. iPhone Safari: no) */
export function isFullscreenSupported() {
  if (typeof document === "undefined") return false;
  const el = document.documentElement;
  return !!(
    el.requestFullscreen ||
    el.webkitRequestFullscreen ||
    el.mozRequestFullScreen ||
    el.msRequestFullscreen
  );
}

/** Check if window dimensions match screen dimensions within tolerance (F11 / borderless) */
function isDimensionFullscreen() {
  if (typeof window === "undefined" || !window.screen) return false;
  const wDiff = Math.abs(window.innerWidth - window.screen.width);
  const hDiff = Math.abs(window.innerHeight - window.screen.height);
  return wDiff <= 4 && hDiff <= 4;
}

/**
 * Currently in fullscreen?
 * Checks HTML5 Fullscreen API, CSS display-mode media query,
 * window.fullScreen (Firefox), and screen dimension parity.
 */
export function isFullscreenActive() {
  if (typeof window === "undefined") return false;

  // 1. Standard HTML5 Fullscreen API
  if (FS_ELEMENT()) return true;

  // 2. CSS Media Query (display-mode: fullscreen) - reliable across modern browsers
  try {
    if (window.matchMedia && window.matchMedia("(display-mode: fullscreen)").matches) {
      return true;
    }
  } catch {}

  // 3. Firefox window.fullScreen property
  if (window.fullScreen === true) return true;

  // 4. Fallback dimension check (F11 / borderless windowed mode)
  if (isDimensionFullscreen()) return true;

  return false;
}

/** Enter fullscreen on the given element (defaults to <html>). Returns true on success. */
export async function enterFullscreen(el = typeof document !== "undefined" ? document.documentElement : null) {
  if (!el) return false;

  // If already active, don't re-request
  if (isFullscreenActive()) {
    markFullscreenEngaged();
    return true;
  }

  const fn =
    el.requestFullscreen ||
    el.webkitRequestFullscreen ||
    el.mozRequestFullScreen ||
    el.msRequestFullscreen;

  if (!fn) return false;
  try {
    await fn.call(el, { navigationUI: "hide" });
    markFullscreenEngaged();
    return true;
  } catch {
    // If requestFullscreen rejected (e.g. already in fullscreen or permissions check)
    if (isFullscreenActive()) {
      markFullscreenEngaged();
      return true;
    }
    return false;
  }
}

/** Leave fullscreen. */
export function exitFullscreen() {
  if (typeof document === "undefined") return;
  const fn =
    document.exitFullscreen ||
    document.webkitExitFullscreen ||
    document.mozCancelFullScreen ||
    document.msExitFullscreen;
  if (fn && FS_ELEMENT()) {
    try {
      fn.call(document);
    } catch {
      /* failsafe */
    }
  }
}

/**
 * Did the user enter fullscreen at least once this session?
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
  if (typeof window === "undefined") return false;
  return window.innerHeight > window.innerWidth;
}

/** Touch-first device (phone / tablet without mouse)? */
export function isCoarsePointer() {
  if (typeof window === "undefined") return false;
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
  if (typeof window === "undefined" || typeof document === "undefined") return () => {};

  const debouncedHandler = () => {
    handler();
    setTimeout(handler, 100);
    setTimeout(handler, 250);
  };

  document.addEventListener("fullscreenchange", debouncedHandler);
  document.addEventListener("webkitfullscreenchange", debouncedHandler);
  document.addEventListener("mozfullscreenchange", debouncedHandler);
  document.addEventListener("MSFullscreenChange", debouncedHandler);
  window.addEventListener("resize", debouncedHandler);
  window.addEventListener("orientationchange", debouncedHandler);

  const handleKeyDown = (e) => {
    if (e.key === "Escape" || e.key === "F11") {
      setTimeout(debouncedHandler, 80);
      setTimeout(debouncedHandler, 250);
    }
  };
  window.addEventListener("keydown", handleKeyDown);

  return () => {
    document.removeEventListener("fullscreenchange", debouncedHandler);
    document.removeEventListener("webkitfullscreenchange", debouncedHandler);
    document.removeEventListener("mozfullscreenchange", debouncedHandler);
    document.removeEventListener("MSFullscreenChange", debouncedHandler);
    window.removeEventListener("resize", debouncedHandler);
    window.removeEventListener("orientationchange", debouncedHandler);
    window.removeEventListener("keydown", handleKeyDown);
  };
}
