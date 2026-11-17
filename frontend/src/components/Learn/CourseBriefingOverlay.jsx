import React, { useEffect } from "react";
import soundManager from "../../utilities/soundManager";
import "./CourseBriefingOverlay.css";

const SYLLABUS_SECTIONS = [
  {
    step: "PART 01",
    title: "Safety Protocols & Motherboard Architecture",
    overview: "Electro-static discharge (ESD) safety, grounded workstation setup, and core motherboard layout and socket identification.",
    duration: "Module 1 – 2"
  },
  {
    step: "PART 02",
    title: "Processor Mounting & Thermal Management",
    overview: "Zero-insertion-force CPU socketing, orientation key alignment, thermal compound application, and cooling installation.",
    duration: "Module 3"
  },
  {
    step: "PART 03",
    title: "High-Speed Memory & Solid-State Storage",
    overview: "Dual-channel memory channel priority (A2/B2), key notch latching, and high-speed M.2 NVMe solid-state drive installation.",
    duration: "Module 4 – 5"
  },
  {
    step: "PART 04",
    title: "Power Supply Delivery & Cable Management",
    overview: "ATX 24-pin and EPS 8-pin distribution, PSU efficiency ratings, and safe single-rail modular cable routing.",
    duration: "Module 6"
  },
  {
    step: "PART 05",
    title: "Capstone: 3D Virtual PC Assembly & POST",
    overview: "Hands-on component-by-component PC assembly inside the 3D Studio, followed by real-time Power-On Self-Test (POST) verification.",
    duration: "Module 7 (Capstone)"
  }
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
            <span className="wb-pdf-filename">PTC_IICT_CSS_Course_Overview.pdf</span>
            <span className="wb-pdf-file-badge">OFFICIAL SYLLABUS · V2.4</span>
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
        {/* ── AUTHENTIC PRINT-READY DOCUMENT SHEET ── */}
        <article className="wb-pdf-sheet">
          {/* Institutional Header */}
          <header className="wb-pdf-doc-header">
            <div className="wb-pdf-institution">
              <div className="wb-pdf-institution-crest" aria-hidden="true">
                <span>PTC</span>
              </div>
              <div className="wb-pdf-institution-text">
                <h1 className="wb-pdf-school-name">PATEROS TECHNOLOGICAL COLLEGE</h1>
                <p className="wb-pdf-dept-name">Institute of Information and Computing Technology // TVL-CSS NC-II Aligned</p>
              </div>
            </div>

            <div className="wb-pdf-doc-meta-badge">
              <span className="wb-pdf-doc-ref">DOC ID: BL-CSS-2026-SYLLABUS</span>
              <span className="wb-pdf-doc-accreditation">PTC-IICT ACCREDITED COURSEWARE</span>
            </div>
          </header>

          <div className="wb-pdf-rule" />

          {/* Document Title & Overview */}
          <section className="wb-pdf-hero-section">
            <div className="wb-pdf-hero-tag">COURSE OVERVIEW & PRACTICAL SYLLABUS</div>
            <h2 className="wb-pdf-title">Computer Systems Servicing (CSS)</h2>
            <p className="wb-pdf-summary">
              Welcome to BuildLab Hardware Academy. This curriculum delivers structured, hands-on training in personal computer hardware architecture, assembly protocols, and system diagnostics inside a real-time interactive 3D simulation environment.
            </p>
          </section>

          {/* Key Facts / Metadata Grid */}
          <section className="wb-pdf-meta-table">
            <div className="wb-pdf-meta-cell">
              <span className="wb-pdf-meta-label">TARGET AUDIENCE</span>
              <span className="wb-pdf-meta-val">Grade 11 TVL-CSS & BSIT Students</span>
            </div>
            <div className="wb-pdf-meta-cell">
              <span className="wb-pdf-meta-label">COURSE SCOPE</span>
              <span className="wb-pdf-meta-val">7 Practical Modules · 20 Topics</span>
            </div>
            <div className="wb-pdf-meta-cell">
              <span className="wb-pdf-meta-label">LEARNING MODE</span>
              <span className="wb-pdf-meta-val">3D Studio & Guided Workbench</span>
            </div>
            <div className="wb-pdf-meta-cell">
              <span className="wb-pdf-meta-label">AWARD</span>
              <span className="wb-pdf-meta-val">Verified Certificate of Competency</span>
            </div>
          </section>

          {/* Clean Syllabus Sequence (Overview, Larger Text, No Dense Clutter) */}
          <section className="wb-pdf-curriculum-section">
            <h3 className="wb-pdf-section-heading">Curriculum Overview</h3>
            <div className="wb-pdf-syllabus-list">
              {SYLLABUS_SECTIONS.map((sec, idx) => (
                <div key={sec.step} className="wb-pdf-syllabus-item">
                  <div className="wb-pdf-item-marker">
                    <span className="wb-pdf-step-tag">{sec.step}</span>
                    <span className="wb-pdf-duration-tag">{sec.duration}</span>
                  </div>
                  <div className="wb-pdf-item-body">
                    <h4 className="wb-pdf-item-title">{sec.title}</h4>
                    <p className="wb-pdf-item-desc">{sec.overview}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Competency Guarantee & Lab Standards */}
          <section className="wb-pdf-competency-box">
            <div className="wb-pdf-competency-item">
              <span className="wb-pdf-competency-icon">🎖️</span>
              <div className="wb-pdf-competency-info">
                <strong>Verified Certification</strong>
                <p>Complete all module checks and pass the 3D Capstone Build to earn your official PTC-IICT Certificate of Competency.</p>
              </div>
            </div>
            <div className="wb-pdf-competency-item">
              <span className="wb-pdf-competency-icon">🛡️</span>
              <div className="wb-pdf-competency-info">
                <strong>Zero Hardware Risk</strong>
                <p>Learn and practice safely in interactive 3D with zero risk of electrostatic damage or costly bent socket pins.</p>
              </div>
            </div>
          </section>

          {/* Document Sign-Off & Official Footnote */}
          <footer className="wb-pdf-doc-footer">
            <div className="wb-pdf-auth-block">
              <span className="wb-pdf-auth-prepared">Curriculum Design: BuildLab Academic Team</span>
              <span className="wb-pdf-auth-approved">Approved: Pateros Technological College (PTC-IICT)</span>
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
