import React, { useEffect, useState } from 'react';
import './RigPickerTransitionOverlay.css';

/**
 * RigPickerTransitionOverlay
 * 
 * Minimal cyber-themed transition overlay shown when transitioning from Hero / Free Mode
 * to the 2D Rig Component Picker.
 * 
 * Lifecycle:
 *  - Mounts with rapid fade-in (~180ms)
 *  - Holds while window scrolls down to #build-station (~500ms)
 *  - Smoothly fades out (~320ms) into the settled 2D Builder and BOB intro
 */
export default function RigPickerTransitionOverlay({
  isOpen,
  mode = 'explore',
  learnerName = '',
  onComplete,
}) {
  const [phase, setPhase] = useState('hidden'); // 'entering' | 'holding' | 'leaving' | 'hidden'
  const isLearn = mode === 'learn';

  useEffect(() => {
    if (!isOpen) {
      setPhase('hidden');
      return;
    }

    setPhase('entering');

    const holdMs = isLearn ? 1150 : 650;
    const totalMs = isLearn ? 1500 : 1000;

    // Hold phase while scroll takes place
    const holdTimer = setTimeout(() => {
      setPhase('leaving');
    }, holdMs);

    // Fade-out finish
    const exitTimer = setTimeout(() => {
      setPhase('hidden');
      if (onComplete) onComplete();
    }, totalMs);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(exitTimer);
    };
  }, [isOpen, isLearn, onComplete]);

  if (phase === 'hidden' && !isOpen) return null;

  return (
    <div
      className={`rig-transition-overlay ${phase}`}
      role="status"
      aria-live="polite"
      aria-label="Rig Component Picker Loading Transition"
    >
      <div className="rig-trans-grid" />
      <div className="rig-trans-glow-rose" />
      <div className="rig-trans-scanline" />

      {/* 1. TOP HUD BAR */}
      <header className="rig-trans-top-bar">
        <div className="rig-trans-brand">
          <div className="rig-trans-logo-icon">{isLearn ? '🎓' : '⚡'}</div>
          <div className="rig-trans-brand-info">
            <span className="rig-trans-brand-title">BUILDLAB</span>
            <span className="rig-trans-brand-sub">
              {isLearn ? 'STUDENT CERTIFICATION TRACK V2.4' : 'WORKSTATION MATRIX V2.4'}
            </span>
          </div>
        </div>

        <div className="rig-trans-status-chip">
          <span className="rig-trans-pulse-dot" />
          <span className="rig-trans-status-text">
            {isLearn ? 'GOOGLE LEARNER SYNC • ENGAGING' : 'TRANSITION OVERLAY • ENGAGING'}
          </span>
        </div>
      </header>

      {/* 2. CENTER HERO BANNER */}
      <main className="rig-trans-center">
        <div className="rig-trans-frame">
          <span className="rig-bracket rig-bracket-tl" />
          <span className="rig-bracket rig-bracket-tr" />
          <span className="rig-bracket rig-bracket-bl" />
          <span className="rig-bracket rig-bracket-br" />

          <div className="rig-trans-eyebrow">
            <span>✦</span>
            <span>
              {isLearn ? 'WORKSPACE TRANSITION // LEARN MODE' : 'WORKSPACE TRANSITION // FREE MODE'}
            </span>
            <span>✦</span>
          </div>

          <h1 className="rig-trans-title">
            {isLearn ? 'Stage 01: 2D Rig Station' : 'Rig Component Picker'}
          </h1>

          <div className="rig-trans-underline" />

          <p className="rig-trans-subtext">
            {isLearn ? (
              <>
                SYNCING GOOGLE PROFILE{learnerName ? ` (${learnerName.toUpperCase()})` : ''} •{' '}
                <span className="rig-cyan-hi">CALIBRATING B.O.B. COMPANION GUIDE</span>
              </>
            ) : (
              <>
                INITIALIZING 2D COMPONENT MATRIX •{' '}
                <span className="rig-cyan-hi">BOB AWAITING HARDWARE SELECTION</span>
              </>
            )}
          </p>

          <div className="rig-trans-mini-loader">
            <div className="rig-mini-dots">
              <span className="rig-dot active-rose" />
              <span className="rig-dot active-rose" />
              <span className="rig-dot active-cyan" />
              <span className="rig-dot" />
              <span className="rig-dot" />
            </div>
            <span className="rig-loader-label">
              {isLearn ? 'PREPARING LEARNER WELCOME PROMPT' : 'SYNCING HARDWARE CATALOG'}
            </span>
          </div>
        </div>
      </main>

      {/* 3. BOTTOM HUD BAR */}
      <footer className="rig-trans-bottom-bar">
        <div className="rig-trans-tag">
          <span className="tag-rose">■</span>
          <span>
            {isLearn ? 'STAGE 01: GUIDED 2D ASSEMBLY' : 'STAGE: 2D WORKBENCH INITIALIZATION'}
          </span>
        </div>
        <div className="rig-trans-tag">
          <span>
            {isLearn ? 'B.O.B. GUIDE PAUSED UNTIL READY' : 'OVERLAY FADE-THROUGH PROTOCOL'}
          </span>
          <span className="tag-cyan">●</span>
        </div>
      </footer>
    </div>
  );
}
