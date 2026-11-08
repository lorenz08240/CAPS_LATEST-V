import React, { useState, useEffect } from 'react';
import './Preloader.css';

/**
 * Minimalist Single Element Preloader
 * Completely replaces the old heavy fullscreen blocker.
 * Sleek, ultra-minimalist single-element loader that dissolves smoothly.
 */
let hasLoadedOnceInSession = false;

export default function Preloader({ onComplete }) {
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      if (sessionStorage.getItem('buildlab_preloader_seen') === 'true') return false;
    } catch {}
    return !hasLoadedOnceInSession;
  });

  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!visible) return;

    // Minimal duration: 650ms for smooth single-element entrance & fade
    const timer = setTimeout(() => {
      setIsExiting(true);
      hasLoadedOnceInSession = true;
      try {
        sessionStorage.setItem('buildlab_preloader_seen', 'true');
      } catch {}

      const exitTimer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 350);

      return () => clearTimeout(exitTimer);
    }, 650);

    return () => clearTimeout(timer);
  }, [visible, onComplete]);

  if (!visible) return null;

  return (
    <div
      className={`buildlab-minimal-preloader ${isExiting ? 'preloader-exiting' : ''}`}
      aria-label="BuildLab Loading"
    >
      <div className="minimal-preloader-glow" />
      <div className="minimal-preloader-core">
        <div className="minimal-spinner-ring">
          <div className="spinner-spark" />
        </div>
        <div className="minimal-preloader-brand">
          <span className="minimal-brand-title">BUILDLAB</span>
          <span className="minimal-status-dot" />
        </div>
      </div>
    </div>
  );
}
