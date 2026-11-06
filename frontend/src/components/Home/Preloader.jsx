import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Preloader.css';
import {
  enterFullscreen,
  isFullscreenActive,
  markFullscreenEngaged,
} from '../../utilities/fullscreen';
import soundManager from '../../utilities/soundManager';

// Module-level guard so the preloader runs once on initial website load/refresh,
// but never pesters the user on internal SPA route transitions.
let hasLoadedOnceInSession = false;

export default function Preloader({ onComplete }) {
  // If already seen in this session and not forced, bypass
  const [shouldRender, setShouldRender] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      if (sessionStorage.getItem('buildlab_preloader_seen') === 'true') return false;
    } catch {}
    return !hasLoadedOnceInSession;
  });

  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isFullscreenNow, setIsFullscreenNow] = useState(isFullscreenActive());
  const animRef = useRef(null);
  const startTimeRef = useRef(null);

  // Monitor fullscreen state changes
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreenNow(isFullscreenActive());
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  // Smooth 0 to 100% progress animation inspired by Spylt Milk
  useEffect(() => {
    if (!shouldRender) return;

    // Total target loading duration: 2.3 seconds
    const DURATION = 2300;

    const animateProgress = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const rawProgress = Math.min(1, elapsed / DURATION);

      // Non-linear easing: fast ramp-up, natural deceleration into 100
      // Cubic ease-out: 1 - Math.pow(1 - rawProgress, 3)
      const eased = 1 - Math.pow(1 - rawProgress, 3);
      const currentVal = Math.floor(eased * 100);

      setProgress(currentVal);

      if (rawProgress < 1) {
        animRef.current = requestAnimationFrame(animateProgress);
      } else {
        setProgress(100);
        setIsLoaded(true);
        try {
          soundManager.interact();
        } catch {
          // audio fallback
        }
      }
    };

    animRef.current = requestAnimationFrame(animateProgress);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [shouldRender]);

  // Handle launch & fullscreen engagement
  const handleLaunch = useCallback(async (requireFs = true) => {
    try {
      soundManager.click();
    } catch {
      // audio fallback
    }

    if (requireFs) {
      try {
        await enterFullscreen();
        markFullscreenEngaged();
        soundManager.granted();
      } catch {
        // browser fallback
      }
    } else {
      markFullscreenEngaged();
    }

    hasLoadedOnceInSession = true;
    try {
      sessionStorage.setItem('buildlab_preloader_seen', 'true');
    } catch {}
    setIsExiting(true);

    // Wait for the smooth CSS curtain slide-up animation (0.85s)
    setTimeout(() => {
      setShouldRender(false);
      if (onComplete) onComplete();
    }, 850);
  }, [onComplete]);

  if (!shouldRender) return null;

  // Telemetry status description based on percentage
  let stageCode = '01 / 04';
  let stageName = 'INITIALIZING 3D WEBGL GRAPHICS KERNEL';
  if (progress >= 25 && progress < 55) {
    stageCode = '02 / 04';
    stageName = 'COMPILING HARDWARE ARCHITECTURE MATRICES';
  } else if (progress >= 55 && progress < 85) {
    stageCode = '03 / 04';
    stageName = 'AUDITING TDP & PIN COMPATIBILITY PROTOCOLS';
  } else if (progress >= 85 && progress < 100) {
    stageCode = '04 / 04';
    stageName = 'PRE-CACHING CHASSIS & COMPONENT ASSETS';
  } else if (progress === 100) {
    stageCode = 'COMPLETE';
    stageName = 'ALL HARDWARE SIMULATION PROTOCOLS OPTIMAL';
  }

  // Format with leading zero if single digit
  const formattedNumber = progress < 10 ? `0${progress}` : `${progress}`;

  return (
    <div
      className={`buildlab-preloader-root ${isExiting ? 'exiting' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="BuildLab System Preloader"
    >
      <div className="preloader-ambient-grid" />
      <div className="preloader-ambient-glow" />

      <header className="preloader-top-bar">
        <div className="preloader-brand">
          <div className="preloader-logo-box">▲</div>
          <div className="preloader-brand-text">
            <span className="preloader-brand-title">BUILDLAB</span>
            <span className="preloader-brand-sub">HARDWARE LAB V2.4</span>
          </div>
        </div>

        <div className="preloader-status-ticker">
          <span className="preloader-pulse-dot" />
          <span>{isLoaded ? 'SYSTEM READY' : 'PRELOADER ACTIVE'}</span>
        </div>
      </header>

      <main className="preloader-center-content">
        <div className="preloader-counter-wrap">
          <span className="preloader-giant-number">{formattedNumber}</span>
          <span className="preloader-percent-symbol">%</span>
        </div>

        <div className="preloader-track-container">
          <div className="preloader-track-bar">
            <div
              className="preloader-track-fill"
              style={{ width: `${progress}%` }}
            >
              <span className="preloader-track-cursor" />
            </div>
          </div>

          <div className="preloader-telemetry-status">
            <span>[ {stageCode} ]</span>
            <span className="preloader-stage-name">{stageName}</span>
          </div>
        </div>

        <div className="preloader-fullscreen-box">
          <span className="preloader-fs-tag">
            [ IMMERSIVE WORKSTATION PROTOCOL ]
          </span>

          <h2 className="preloader-fs-headline">
            PLEASE ENTER FULLSCREEN BEFORE THE SITE LOADS
          </h2>

          <p className="preloader-fs-desc">
            BuildLab is engineered as a high-fidelity 3D computer engineering workspace.
            Fullscreen mode is required for complete viewport fidelity, motherboard inspection,
            and unhindered WebGL hardware assembly.
          </p>

          <div className="preloader-actions-row">
            <button
              type="button"
              className="preloader-launch-btn"
              onClick={() => handleLaunch(true)}
              title="Enter Fullscreen and Launch BuildLab"
            >
              <span className="btn-fs-icon">⤢</span>
              <span className="btn-text">
                {isFullscreenNow
                  ? 'LAUNCH WORKSPACE'
                  : 'ENTER FULLSCREEN & LAUNCH WORKSPACE'}
              </span>
              <span className="btn-arrow">&rarr;</span>
            </button>

            <button
              type="button"
              className="preloader-secondary-link"
              onClick={() => handleLaunch(false)}
            >
              Continue in windowed view &rarr;
            </button>
          </div>
        </div>
      </main>

      <footer className="preloader-bottom-bar">
        <span>EST. 2026 // ADVANCED PC HARDWARE LAB</span>
        <span className="preloader-bottom-right">PHYSICALLY BASED SIMULATION ENGINE</span>
      </footer>
    </div>
  );
}

