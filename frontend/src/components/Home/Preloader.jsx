import React, { useState, useEffect, useRef } from 'react';
import { startModelPreloading, preloadAllModels } from '../../utilities/modelPreloader';
import './Preloader.css';

/**
 * BuildLab Real Asset Preloader
 * Tracks actual network & memory preloading progress of 3D Hero assets
 * (DDR4 RAM, M.2 NVMe SSD, Basic ATX PSU).
 * Only dissolves once models are 100% loaded and cached in memory,
 * with a guaranteed 6s safety fallback timeout.
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

  const [progress, setProgress] = useState(0);
  const [activeModelName, setActiveModelName] = useState('Initializing 3D assets...');
  const [isExiting, setIsExiting] = useState(false);
  const dissolvedRef = useRef(false);

  useEffect(() => {
    if (!visible) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('buildlab:all-models-ready'));
      }
      onComplete?.();
      return;
    }

    let exitTimeoutId = null;
    let finishHoldTimeoutId = null;

    const dissolve = () => {
      if (dissolvedRef.current) return;
      dissolvedRef.current = true;

      setIsExiting(true);
      hasLoadedOnceInSession = true;
      try {
        sessionStorage.setItem('buildlab_preloader_seen', 'true');
      } catch {}

      // Dispatch required events
      window.dispatchEvent(new CustomEvent('buildlab:all-models-ready'));
      window.dispatchEvent(new CustomEvent('buildlab:preloader-completed'));

      exitTimeoutId = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 400);
    };

    // Fast-path for non-home routes (e.g. /about, /terms) where 3D hero is not displayed
    if (window.location.pathname !== '/') {
      const handleWindowLoad = () => dissolve();
      if (document.readyState === 'complete') {
        dissolve();
      } else {
        window.addEventListener('load', handleWindowLoad, { once: true });
      }
      // Still trigger background preloading for subsequent navigation
      preloadAllModels();
      return () => {
        window.removeEventListener('load', handleWindowLoad);
        if (exitTimeoutId) clearTimeout(exitTimeoutId);
      };
    }

    // Fallback timeout (6 seconds): guarantees preloader never hangs if network fails or offline
    const fallbackTimer = setTimeout(() => {
      dissolve();
    }, 6000);

    // Track real asset load progress (0% to 100%)
    const unsubscribe = startModelPreloading((data) => {
      if (dissolvedRef.current) return;

      setProgress((prev) => Math.max(prev, data.percent));
      if (data.activeModel) {
        setActiveModelName(data.activeModel);
      }

      if (data.isComplete) {
        // Models are fully loaded and cached in memory
        finishHoldTimeoutId = setTimeout(() => {
          dissolve();
        }, 280);
      }
    });

    return () => {
      unsubscribe();
      clearTimeout(fallbackTimer);
      if (finishHoldTimeoutId) clearTimeout(finishHoldTimeoutId);
      if (exitTimeoutId) clearTimeout(exitTimeoutId);
    };
  }, [visible, onComplete]);

  if (!visible) return null;

  const currentPercent = Math.min(100, Math.max(0, Math.round(progress)));

  return (
    <div
      className={`buildlab-minimal-preloader ${isExiting ? 'preloader-exiting' : ''}`}
      aria-label="BuildLab Loading"
    >
      <div className="minimal-preloader-glow" />
      <div className="minimal-preloader-core">
        <div className="preloader-brand-header">
          <div className="minimal-spinner-ring">
            <div className="spinner-spark" />
          </div>
          <div className="minimal-preloader-brand">
            <span className="minimal-brand-title">BUILDLAB</span>
            <span className="minimal-status-dot" />
          </div>
        </div>

        {/* Real Loading Percentage Display */}
        <div className="preloader-percentage-display" aria-live="polite">
          <span className="preloader-percentage-number">{currentPercent}</span>
          <span className="preloader-percentage-symbol">%</span>
        </div>

        {/* Real Loading Progress Bar */}
        <div className="preloader-progress-track">
          <div
            className="preloader-progress-fill"
            style={{ width: `${currentPercent}%` }}
          >
            <div className="preloader-progress-glow" />
          </div>
        </div>

        {/* Telemetry / Asset Status Details */}
        <div className="preloader-telemetry">
          <span className="preloader-status-text">
            {currentPercent >= 100
              ? '3D ASSETS READY'
              : `LOADING ${activeModelName.toUpperCase()}`}
          </span>
          <span className="preloader-models-badge">
            RAM • NVME SSD • ATX PSU
          </span>
        </div>
      </div>
    </div>
  );
}
