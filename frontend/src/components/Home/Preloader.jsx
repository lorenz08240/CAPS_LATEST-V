import React, { useState, useEffect, useRef } from 'react';
import './Preloader.css';

/**
 * Minimalist Single Element Preloader
 * Clean, non-blocking single-element loading indicator.
 * Synchronizes with page and 3D readiness ('buildlab:3d-ready' or window 'load')
 * with a safety fallback timeout (2500ms).
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
  const dissolvedRef = useRef(false);

  useEffect(() => {
    if (!visible) return;

    let exitTimeoutId = null;

    const dissolve = () => {
      if (dissolvedRef.current) return;
      dissolvedRef.current = true;

      setIsExiting(true);
      hasLoadedOnceInSession = true;
      try {
        sessionStorage.setItem('buildlab_preloader_seen', 'true');
      } catch {}

      window.dispatchEvent(new CustomEvent('buildlab:preloader-completed'));

      exitTimeoutId = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 350);
    };

    // 1. Listen for 3D hero canvas mount event
    const handle3DReady = () => {
      dissolve();
    };

    // 2. Listen for window load
    const handleWindowLoad = () => {
      if (window.location.pathname !== '/') {
        dissolve();
      }
    };

    window.addEventListener('buildlab:3d-ready', handle3DReady);

    if (window.location.pathname !== '/') {
      if (document.readyState === 'complete') {
        dissolve();
      } else {
        window.addEventListener('load', handleWindowLoad);
      }
    } else {
      // If already marked ready by 3D canvas
      if (window.__BUILDLAB_3D_READY__) {
        dissolve();
      }
    }

    // 3. Safety fallback timeout (2500ms) to ensure preloader never hangs if WebGL is unavailable
    const fallbackTimer = setTimeout(() => {
      dissolve();
    }, 2500);

    return () => {
      window.removeEventListener('buildlab:3d-ready', handle3DReady);
      window.removeEventListener('load', handleWindowLoad);
      clearTimeout(fallbackTimer);
      if (exitTimeoutId) clearTimeout(exitTimeoutId);
    };
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
