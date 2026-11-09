import React from "react";
import PixelCanvas from "../Common/PixelCanvas";
import soundManager from "../../utilities/soundManager";
import "./ModeSelectionCards.css";

export default function ModeSelectionCards({
  isOpen,
  onClose,
  onSelectLearn,
  onSelectFree,
}) {
  if (!isOpen) return null;

  return (
    <div className="mode-selection-overlay" onClick={onClose}>
      <div
        className="mode-selection-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Choose Operating Mode"
      >
        <div className="mode-selection-header">
          <div className="mode-selection-tag">
            <span className="tag-bracket">[</span>
            <span className="tag-pulse-dot" />
            <span>OPERATING MODE CONFIGURATION</span>
            <span className="tag-bracket">]</span>
          </div>
          <button
            type="button"
            className="mode-selection-close"
            onClick={() => {
              try { soundManager.modalClose(); } catch {}
              onClose();
            }}
            title="Dismiss (Esc)"
            aria-label="Close mode selection"
          >
            ✕
          </button>
        </div>

        <div className="mode-selection-intro">
          <h2 className="mode-selection-title">Choose How You Want to Build</h2>
          <p className="mode-selection-sub">
            Pick a guided certification track to save your progress, or jump right into the sandbox as a guest.
          </p>
        </div>

        {/* ── SPLIT STAGGERED REVEAL CARDS (HexagonCircle Pixel Hover) ── */}
        <div className="mode-cards-grid">
          {/* CARD 1: LEARN MODE */}
          <div
            className="mode-card mode-card-learn"
            onClick={() => {
              try { soundManager.click(); } catch {}
              onSelectLearn();
            }}
            role="button"
            tabIndex={0}
          >
            <PixelCanvas
              colors={["#00e5a0", "#10b981", "#38bdf8", "#facc15"]}
              gap={7}
            />

            <div className="mode-card-content">
              <div className="mode-card-badge learn-badge">
                <span className="badge-dot" />
                <span>GUIDED CERTIFICATION TRACK</span>
              </div>

              <div className="mode-card-icon-wrap learn-icon-wrap">
                <span className="mode-card-emoji">🎓</span>
              </div>

              <h3 className="mode-card-heading">LEARN TRACK</h3>
              <p className="mode-card-summary">
                Follow an engineering-validated curriculum with automatic Google Cloud save.
              </p>

              <ul className="mode-card-perks">
                <li>
                  <span className="perk-check">✓</span>
                  <span><strong>Google Sign-In:</strong> Cloud backup for rigs, benchmarks &amp; lesson stats</span>
                </li>
                <li>
                  <span className="perk-check">✓</span>
                  <span><strong>Sequential Flow:</strong> Build &rarr; Compatibility &rarr; Learn &rarr; 3D Studio</span>
                </li>
                <li>
                  <span className="perk-check">✓</span>
                  <span><strong>Completion Certificate:</strong> Inscribed with your verified legal name</span>
                </li>
                <li>
                  <span className="perk-check">✓</span>
                  <span><strong>B.O.B. Interactive Guide:</strong> Step-by-step companion tips &amp; socket checks</span>
                </li>
              </ul>

              <div className="mode-card-action">
                <button type="button" className="mode-btn mode-btn-learn">
                  <svg className="google-btn-svg" viewBox="0 0 24 24" width="16" height="16">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span>CONTINUE WITH GOOGLE</span>
                  <span className="btn-arrow">&rarr;</span>
                </button>
              </div>
            </div>
          </div>

          {/* CARD 2: FREE / CONTINUE WITHOUT SAVING */}
          <div
            className="mode-card mode-card-free"
            onClick={() => {
              try { soundManager.click(); } catch {}
              onSelectFree();
            }}
            role="button"
            tabIndex={0}
          >
            <PixelCanvas
              colors={["#f43f5e", "#fb7185", "#38bdf8", "#facc15"]}
              gap={7}
            />

            <div className="mode-card-content">
              <div className="mode-card-badge free-badge">
                <span className="badge-dot" />
                <span>UNRESTRICTED HARDWARE SANDBOX</span>
              </div>

              <div className="mode-card-icon-wrap free-icon-wrap">
                <span className="mode-card-emoji">🚀</span>
              </div>

              <h3 className="mode-card-heading">FREE WORKBENCH</h3>
              <p className="mode-card-summary">
                Continue without saving your progress. Zero sign-in or account setup required.
              </p>

              <ul className="mode-card-perks">
                <li>
                  <span className="perk-check">✓</span>
                  <span><strong>No Account Needed:</strong> Jump straight into the hardware builder immediately</span>
                </li>
                <li>
                  <span className="perk-check">✓</span>
                  <span><strong>Open Exploration:</strong> Freely select parts, check compatibility &amp; 3D view</span>
                </li>
                <li>
                  <span className="perk-check">✓</span>
                  <span><strong>Temporary Rig State:</strong> Kept in your active browser window</span>
                </li>
                <li>
                  <span className="perk-check">✓</span>
                  <span><strong>Save Progress Anytime:</strong> Cloud save prompted only when you choose to store</span>
                </li>
              </ul>

              <div className="mode-card-action">
                <button type="button" className="mode-btn mode-btn-free">
                  <span>START FREE BUILD</span>
                  <span className="btn-arrow">&rarr;</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

