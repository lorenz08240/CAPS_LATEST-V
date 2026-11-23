import React, { useState, useEffect } from "react";
import {
  isFullscreenActive,
  toggleFullscreen,
  onViewportChange
} from "../../utilities/fullscreen";
import soundManager from "../../utilities/soundManager";
import "./DiscreetFullscreenToggle.css";

/**
 * DiscreetFullscreenToggle — Unobtrusive, icon-only fullscreen toggle button.
 *
 * Designed with zero text labels, muted slate palette, and low visual hierarchy
 * to remain discreetly accessible without distracting the user's attention.
 */
export default function DiscreetFullscreenToggle({
  variant = "corner", // "corner" | "sidebar" | "inline"
  className = "",
  ariaLabel = "Toggle Fullscreen"
}) {
  const [active, setActive] = useState(() => isFullscreenActive());

  useEffect(() => {
    const sync = () => {
      setActive(isFullscreenActive());
    };
    const unsubscribe = onViewportChange(sync);
    sync();
    return unsubscribe;
  }, []);

  const handleClick = async (e) => {
    e.stopPropagation();
    try {
      soundManager.click();
    } catch {}
    const result = await toggleFullscreen();
    setActive(Boolean(result));
  };

  return (
    <button
      type="button"
      className={`discreet-fs-toggle discreet-fs-${variant} ${active ? "is-fs-active" : ""} ${className}`}
      onClick={handleClick}
      aria-label={ariaLabel}
      title={active ? "Exit Fullscreen (F11)" : "Enter Fullscreen (F11)"}
    >
      <span className="discreet-fs-icon-wrap" aria-hidden="true">
        {active ? (
          /* Compress / Exit Fullscreen 4-corner inward icon */
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8 3v3a2 2 0 0 1-2 2H3" />
            <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
            <path d="M3 16h3a2 2 0 0 1 2 2v3" />
            <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
          </svg>
        ) : (
          /* Expand / Enter Fullscreen 4-corner outward icon */
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8 3H5a2 2 0 0 0-2 2v3" />
            <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
            <path d="M3 16v3a2 2 0 0 0 2 2h3" />
            <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
          </svg>
        )}
      </span>
    </button>
  );
}
