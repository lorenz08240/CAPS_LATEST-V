import React, { useEffect } from "react";
import soundManager from "../../utilities/soundManager";
import "./CourseBriefingOverlay.css";

const LEARNING_PATH = [
  {
    step: "MODULE 01",
    title: "Lab Safety, Workspace & Tools",
    topics: "3 topics",
    overview: "Ground yourself, choose a static-safe surface, and learn to handle a motherboard without destroying it.",
  },
  {
    step: "MODULE 02",
    title: "The Motherboard",
    topics: "3 topics",
    overview: "Read the board like a map: form factors, chipset and VRM power delivery, rear I/O and internal headers.",
  },
  {
    step: "MODULE 03",
    title: "CPU & Cooling",
    topics: "2 topics",
    overview: "Align the socket key, drop in the processor without bending a pin, and apply thermal compound the right way.",
  },
  {
    step: "MODULE 04",
    title: "Memory & M.2 Storage",
    topics: "2 topics",
    overview: "Populate DDR4/DDR5 in the A2/B2 slots for true dual channel, then seat an NVMe drive on the PCIe bus.",
  },
  {
    step: "MODULE 05",
    title: "Graphics Card & Power Supply",
    topics: "2 topics",
    overview: "Match the PCIe x16 slot and display outputs, then identify keyed modular cables and 80 PLUS ratings.",
  },
  {
    step: "MODULE 06",
    title: "Chassis, Airflow & Cabling",
    topics: "2 topics",
    overview: "Build positive pressure, wire the front-panel headers, and route cables so air actually moves.",
  },
  {
    step: "MODULE 07",
    title: "Capstone: Build & POST",
    topics: "3 topics",
    overview: "Stage the bench, assemble the entire system in 3D, then diagnose a first boot with EZ Debug LEDs.",
  },
];

const OUTCOMES = [
  {
    num: "01",
    title: "Inspect before you install",
    desc: "Spot a bent socket pin, read a PSU label, and pick a safe work surface without guessing.",
  },
  {
    num: "02",
    title: "Build in the right order",
    desc: "Follow the canonical sequence — CPU, cooler, RAM, M.2, GPU, power — instead of learning the hard way.",
  },
  {
    num: "03",
    title: "Prove it actually boots",
    desc: "Run POST, interpret debug LEDs, and work a repeatable diagnostic flow when the screen stays dark.",
  },
];

export default function CourseBriefingOverlay({ onClose, onStartLearning }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleEnter = () => {
    try {
      soundManager.click();
    } catch {}
    if (onStartLearning) onStartLearning();
    onClose();
  };

  return (
    <div className="wb-pdf-viewer-overlay" role="dialog" aria-modal="true" aria-label="Course Briefing Document">
      {/* ── TOP PDF VIEWER TOOLBAR ── */}
      <header className="wb-pdf-toolbar">
        <div className="wb-pdf-toolbar-left">
          <div className="wb-pdf-icon-badge" aria-hidden="true">
            <span>PDF</span>
          </div>
          <div className="wb-pdf-file-info">
            <span className="wb-pdf-filename">BuildLab_CSS_Course_Overview.pdf</span>
            <span className="wb-pdf-file-badge">COURSE BRIEF · V2.4</span>
          </div>
        </div>

        <div className="wb-pdf-toolbar-center">
          <span className="wb-pdf-page-pill">Page 1 of 1</span>
          <span className="wb-pdf-zoom-pill">100% Zoom</span>
        </div>

        <div className="wb-pdf-toolbar-right">
          <button
            type="button"
            className="btn-pdf-close"
            onClick={onClose}
            aria-label="Close Document"
          >
            ✕ Close Document <kbd>Esc</kbd>
          </button>
        </div>
      </header>

      {/* ── PDF DOCUMENT CANVAS (SCROLLABLE VIEWPORT) ── */}
      <div className="wb-pdf-viewport">
        {/* ── PRINT-READY COURSE BRIEF SHEET ── */}
        <article className="wb-pdf-sheet">
          <header className="wb-pdf-doc-header">
            <div className="wb-pdf-brand">
              <div className="wb-pdf-brand-mark" aria-hidden="true">
                BL
              </div>
              <div className="wb-pdf-brand-text">
                <h1 className="wb-pdf-brand-name">BUILDLAB HARDWARE ACADEMY</h1>
                <p className="wb-pdf-brand-sub">Computer Systems Servicing · Guided 3D practicum</p>
              </div>
            </div>
            <div className="wb-pdf-doc-stamp">
              <span className="wb-pdf-stamp-main">COURSE BRIEF</span>
              <span className="wb-pdf-stamp-sub">REV 2.4 · SELF-PACED</span>
            </div>
          </header>

          <div className="wb-pdf-rule" />

          {/* Welcome / Hook */}
          <section className="wb-pdf-hero-section">
            <div className="wb-pdf-hero-tag">START HERE · COURSE OVERVIEW</div>
            <h2 className="wb-pdf-title">
              Welcome to <span className="wb-pdf-title-accent">COMPUTER SYSTEM SERVICING</span> Related Course!
            </h2>
            <p className="wb-pdf-lede">
              This isn&apos;t a chapter to memorise — it&apos;s a bench to work at. Across 7 modules and 17 short topics you&apos;ll take a desktop PC from a box of parts to a clean first boot, learning the reason behind every move as you go.
            </p>
            <p className="wb-pdf-summary">
              Each lesson pairs a real-world explanation with a live 3D component you can rotate, inspect and assemble. Get it wrong and nothing catches fire. Get it right and the skill sticks.
            </p>
          </section>

          {/* Outcomes — what the learner actually gains */}
          <section className="wb-pdf-outcomes">
            <h3 className="wb-pdf-mini-heading">What you&apos;ll be able to do</h3>
            <div className="wb-pdf-outcome-grid">
              {OUTCOMES.map((item) => (
                <div key={item.num} className="wb-pdf-outcome">
                  <span className="wb-pdf-outcome-num">{item.num}</span>
                  <strong className="wb-pdf-outcome-title">{item.title}</strong>
                  <p className="wb-pdf-outcome-desc">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* At-a-glance facts */}
          <section className="wb-pdf-meta-table">
            <div className="wb-pdf-meta-cell">
              <span className="wb-pdf-meta-label">COURSE SCOPE</span>
              <span className="wb-pdf-meta-val">7 Modules · 17 Topics</span>
            </div>
            <div className="wb-pdf-meta-cell">
              <span className="wb-pdf-meta-label">LEARNING MODE</span>
              <span className="wb-pdf-meta-val">Guided 3D Workbench</span>
            </div>
            <div className="wb-pdf-meta-cell">
              <span className="wb-pdf-meta-label">AWARD</span>
              <span className="wb-pdf-meta-val">Verified Certificate of Competency</span>
            </div>
          </section>

          {/* Full, accurate learning path */}
          <section className="wb-pdf-curriculum-section">
            <div className="wb-pdf-curriculum-head">
              <h3 className="wb-pdf-section-heading">Curriculum Overview</h3>
              <span className="wb-pdf-path-count">7 MODULES · 17 TOPICS</span>
            </div>
            <div className="wb-pdf-syllabus-list">
              {LEARNING_PATH.map((sec) => (
                <div key={sec.step} className="wb-pdf-syllabus-item">
                  <div className="wb-pdf-item-marker">
                    <span className="wb-pdf-step-tag">{sec.step}</span>
                    <span className="wb-pdf-duration-tag">{sec.topics}</span>
                  </div>
                  <div className="wb-pdf-item-body">
                    <h4 className="wb-pdf-item-title">{sec.title}</h4>
                    <p className="wb-pdf-item-desc">{sec.overview}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Why this format works */}
          <section className="wb-pdf-competency-box">
            <div className="wb-pdf-competency-item">
              <span className="wb-pdf-competency-icon">🎖️</span>
              <div className="wb-pdf-competency-info">
                <strong>Earn proof, not just progress</strong>
                <p>Clear every module check and finish the capstone build to unlock your verified Certificate of Competency.</p>
              </div>
            </div>
            <div className="wb-pdf-competency-item">
              <span className="wb-pdf-competency-icon">🛡️</span>
              <div className="wb-pdf-competency-info">
                <strong>Zero hardware risk</strong>
                <p>Bend a pin or short a rail in the simulator and you&apos;ll learn from it — with no replacement parts to buy.</p>
              </div>
            </div>
          </section>

          {/* Document Sign-Off & Footnote */}
          <footer className="wb-pdf-doc-footer">
            <div className="wb-pdf-auth-block">
              <span className="wb-pdf-auth-prepared">Curriculum Design: BuildLab Academic Team</span>
              <span className="wb-pdf-auth-approved">Guided practice · Seven modules · One capstone build</span>
            </div>

            <div className="wb-pdf-actions">
              <button
                type="button"
                className="btn-pdf-secondary"
                onClick={onClose}
              >
                Close Document
              </button>
              <button
                type="button"
                className="btn-pdf-primary"
                onClick={handleEnter}
              >
                Enter 3D Workbench →
              </button>
            </div>
          </footer>
        </article>
      </div>
    </div>
  );
}
