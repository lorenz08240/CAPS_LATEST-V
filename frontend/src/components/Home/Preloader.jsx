import React, { useState, useEffect } from 'react';
import './Preloader.css';

/**
 * Minimalist Single Element Preloader
 * Clean, non-blocking single-element loading indicator.
 * Dissolves automatically in ~650ms upon page arrival.
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

    // Smooth automatic dissolution after ~650ms
    const timer = setTimeout(() => {
      setIsExiting(true);
      hasLoadedOnceInSession = true;
      try {
        sessionStorage.setItem('buildlab_preloader_seen', 'true');
      } catch {}

      window.dispatchEvent(new CustomEvent('buildlab:preloader-completed'));

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
