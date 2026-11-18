import React, { useState } from "react";
import soundManager from "../../utilities/soundManager";
import "./LessonPresentationView.css";

/**
 * LessonPresentationView // Center-stage Educational Lecture & Visual Report
 *
 * Provides a slide/report presentation experience with:
 * • High-res form factor diagrams and dimension comparison tables
 * • Photographic spec cards, socket schematics, and pinout guides
 * • Slide navigation with smooth animations
 * • Clear, unmissable "Proceed to 3D Inspection Lab" progression CTA
 */

const MOTHERBOARD_FORM_FACTORS = [
  {
    code: "E-ATX",
    name: "Extended ATX",
    dims: "305 × 330 mm",
    dimsInches: '12.0" × 13.0"',
    standoffs: "9 to 12 Standoffs",
    ramSlots: "4 to 8 DIMMs",
    pcieSlots: "4 to 7 Slots",
    targetChassis: "Full-Tower / E-ATX Case",
    color: "#b08d57",
    badge: "WORKSTATION / ENTHUSIAST",
    description:
      "Widest consumer form factor designed for high-end desktop (HEDT) platforms, dual-CPU server sockets, or 4-way GPU rendering arrays. Requires full-depth chassis cable grommet clearance."
  },
  {
    code: "ATX",
    name: "Standard ATX",
    dims: "305 × 244 mm",
    dimsInches: '12.0" × 9.6"',
    standoffs: "9 Standoffs (3×3 Grid)",
    ramSlots: "4 DIMM Slots",
    pcieSlots: "Up to 7 Expansion Slots",
    targetChassis: "Mid-Tower & Full-Tower",
    color: "#ffffff",
    badge: "DESKTOP STANDARD",
    description:
      "The undisputed desktop computer standard since 1995. Features optimal spacing for dual-slot graphics cards, multiple M.2 NVMe heatsinks, and robust VRM power phases."
  },
  {
    code: "Micro-ATX",
    name: "mATX",
    dims: "244 × 244 mm",
    dimsInches: '9.6" × 9.6"',
    standoffs: "8 Standoffs",
    ramSlots: "2 to 4 DIMM Slots",
    pcieSlots: "Up to 4 Expansion Slots",
    targetChassis: "Mini-Tower & Mid-Tower",
    color: "#f59e0b",
    badge: "BEST VALUE / COMPACT",
    description:
      "Square 244mm footprint offering the best price-to-performance ratio. Shares ATX top mounting screw patterns while shortening height by 61mm, cutting out rarely used bottom expansion slots."
  },
  {
    code: "Mini-ITX",
    name: "mITX",
    dims: "170 × 170 mm",
    dimsInches: '6.7" × 6.7"',
    standoffs: "4 Corner Standoffs",
    ramSlots: "2 DIMM Slots Max",
    pcieSlots: "1 PCIe x16 Slot Only",
    targetChassis: "Small Form Factor (SFF) Cube",
    color: "#ec4899",
    badge: "SMALL FORM FACTOR (SFF)",
    description:
      "Ultra-compact 170mm square board for portable LAN rigs and living room home-theater PCs. Maximizes density with back-mounted M.2 slots, stacked daughterboards, and external antennas."
  }
];

export default function LessonPresentationView({
  topic,
  moduleNum = 2,
  onProceedTo3D,
  onProceedToQuiz,
  theme = "dark"
}) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedFormFactor, setSelectedFormFactor] = useState("ATX");

  const totalSlides = moduleNum === 2 ? 4 : 3;

  const handleNextSlide = () => {
    try { soundManager.click(); } catch {}
    if (activeSlide < totalSlides - 1) {
      setActiveSlide((s) => s + 1);
    } else if (onProceedTo3D) {
      onProceedTo3D();
    }
  };

  const handlePrevSlide = () => {
    try { soundManager.click(); } catch {}
    if (activeSlide > 0) {
      setActiveSlide((s) => s - 1);
    }
  };

  return (
    <div className={`lesson-presentation-view theme-${theme}`}>
      {/* ── PRESENTATION TOP NAV BAR ── */}
      <div className="lp-top-bar">
        <div className="lp-badge-group">
          <span className="lp-module-badge">MODULE {moduleNum} // LECTURE SLIDES</span>
          <span className="lp-slide-indicator">
            Slide {activeSlide + 1} of {totalSlides}
          </span>
        </div>

        {/* Slide Selector Tabs */}
        <div className="lp-slide-tabs" role="tablist">
          {moduleNum === 2 ? (
            <>
              <button
                type="button"
                className={`lp-tab-btn ${activeSlide === 0 ? "is-active" : ""}`}
                onClick={() => { try { soundManager.click(); } catch {} setActiveSlide(0); }}
              >
                1. Form Factors &amp; Sizes
              </button>
              <button
                type="button"
                className={`lp-tab-btn ${activeSlide === 1 ? "is-active" : ""}`}
                onClick={() => { try { soundManager.click(); } catch {} setActiveSlide(1); }}
              >
                2. Sockets, VRM &amp; Power
              </button>
              <button
                type="button"
                className={`lp-tab-btn ${activeSlide === 2 ? "is-active" : ""}`}
                onClick={() => { try { soundManager.click(); } catch {} setActiveSlide(2); }}
              >
                3. Headers, I/O &amp; USB Codes
              </button>
              <button
                type="button"
                className={`lp-tab-btn ${activeSlide === 3 ? "is-active" : ""}`}
                onClick={() => { try { soundManager.click(); } catch {} setActiveSlide(3); }}
              >
                4. Video &amp; Field Checklist
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className={`lp-tab-btn ${activeSlide === 0 ? "is-active" : ""}`}
                onClick={() => { try { soundManager.click(); } catch {} setActiveSlide(0); }}
              >
                1. Theory &amp; Visual Breakdown
              </button>
              <button
                type="button"
                className={`lp-tab-btn ${activeSlide === 1 ? "is-active" : ""}`}
                onClick={() => { try { soundManager.click(); } catch {} setActiveSlide(1); }}
              >
                2. Technical Specifications &amp; Pinouts
              </button>
              <button
                type="button"
                className={`lp-tab-btn ${activeSlide === 2 ? "is-active" : ""}`}
                onClick={() => { try { soundManager.click(); } catch {} setActiveSlide(2); }}
              >
                3. Video &amp; Lab Safety Checklist
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── SLIDE CONTENT AREA ── */}
      <div className="lp-slide-viewport">
        {/* =========================================================================
            MODULE 2: SLIDE 0 // MOTHERBOARD FORM FACTORS & DIMENSIONAL COMPARISON
           ========================================================================= */}
        {moduleNum === 2 && activeSlide === 0 && (
          <div className="lp-slide-page animate-fade-in">
            <header className="lp-slide-header">
              <h2>Motherboard Form Factors &amp; Physical Dimensions</h2>
              <p>
                Motherboards adhere to strict physical standards governing outer dimensions, chassis mounting standoff
                screw holes, rear I/O shield opening sizes, and power delivery standards.
              </p>
            </header>

            {/* VISUAL SCALE COMPARISON DIAGRAM (NESTED DIMENSIONS) */}
            <div className="lp-scale-diagram-card">
              <div className="diagram-card-head">
                <span className="diagram-title">PHYSICAL SCALE COMPARISON (TOP-DOWN DIMENSIONAL MATRIX)</span>
                <span className="diagram-sub">Nested scale comparison showing millimeter boundaries &amp; screw locations</span>
              </div>

              <div className="lp-svg-wrap">
                <svg
                  viewBox="0 0 680 380"
                  className="lp-motherboard-scale-svg"
                  aria-label="Motherboard Form Factors Scale Comparison"
                >
                  <defs>
                    <linearGradient id="eatxGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="rgba(176, 141, 87, 0.18)" />
                      <stop offset="100%" stopColor="rgba(176, 141, 87, 0.04)" />
                    </linearGradient>
                    <linearGradient id="atxGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="rgba(255, 255, 255, 0.12)" />
                      <stop offset="100%" stopColor="rgba(255, 255, 255, 0.03)" />
                    </linearGradient>
                    <linearGradient id="matxGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="rgba(245, 158, 11, 0.18)" />
                      <stop offset="100%" stopColor="rgba(245, 158, 11, 0.04)" />
                    </linearGradient>
                    <linearGradient id="itxGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="rgba(236, 72, 153, 0.22)" />
                      <stop offset="100%" stopColor="rgba(236, 72, 153, 0.06)" />
                    </linearGradient>
                  </defs>

                  {/* 1. Extended ATX (E-ATX): 305mm H x 330mm W -> scaled */}
                  <rect
                    x="20"
                    y="20"
                    width="640"
                    height="340"
                    rx="8"
                    fill="url(#eatxGrad)"
                    stroke="#b08d57"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                  <text x="32" y="44" fill="#b08d57" fontSize="13" fontWeight="bold">
                    E-ATX: 305 mm × 330 mm (12.0" × 13.0") · Enthusiast / Dual CPU
                  </text>

                  {/* 2. Standard ATX: 305mm H x 244mm W */}
                  <rect
                    x="20"
                    y="20"
                    width="474"
                    height="340"
                    rx="8"
                    fill="url(#atxGrad)"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                  />
                  <text x="32" y="70" fill="#ffffff" fontSize="13" fontWeight="bold">
                    Standard ATX: 305 mm × 244 mm (12.0" × 9.6") · 9 Standoffs (Desktop Standard)
                  </text>

                  {/* 3. Micro-ATX (mATX): 244mm H x 244mm W */}
                  <rect
                    x="20"
                    y="20"
                    width="474"
                    height="272"
                    rx="8"
                    fill="url(#matxGrad)"
                    stroke="#f59e0b"
                    strokeWidth="2"
                  />
                  <text x="32" y="96" fill="#f59e0b" fontSize="13" fontWeight="bold">
                    Micro-ATX: 244 mm × 244 mm (9.6" × 9.6") · 8 Standoffs (Budget / Mainstream)
                  </text>

                  {/* 4. Mini-ITX (mITX): 170mm H x 170mm W */}
                  <rect
                    x="20"
                    y="20"
                    width="330"
                    height="190"
                    rx="8"
                    fill="url(#itxGrad)"
                    stroke="#ec4899"
                    strokeWidth="2.5"
                  />
                  <text x="32" y="122" fill="#ec4899" fontSize="13" fontWeight="bold">
                    Mini-ITX: 170 mm × 170 mm (6.7" × 6.7") · 4 Corner Standoffs (SFF)
                  </text>

                  {/* Key Motherboard Components Outlined */}
                  {/* Rear I/O */}
                  <rect x="24" y="24" width="40" height="90" rx="3" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
                  <text x="30" y="72" fill="#94a3b8" fontSize="9" transform="rotate(-90 30,72)">REAR I/O</text>

                  {/* CPU Socket Area */}
                  <rect x="135" y="45" width="80" height="80" rx="4" fill="#0f172a" stroke="#ffffff" strokeWidth="1.5" />
                  <text x="145" y="88" fill="#ffffff" fontSize="10" fontWeight="bold">CPU SOCKET</text>
                  <text x="145" y="102" fill="#64748b" fontSize="8">LGA / PGA</text>

                  {/* RAM Slots */}
                  <rect x="235" y="35" width="8" height="100" rx="2" fill="#ffffff" opacity="0.8" />
                  <rect x="250" y="35" width="8" height="100" rx="2" fill="#ffffff" opacity="0.8" />
                  <rect x="265" y="35" width="8" height="100" rx="2" fill="#ffffff" opacity="0.8" />
                  <rect x="280" y="35" width="8" height="100" rx="2" fill="#ffffff" opacity="0.8" />
                  <text x="240" y="150" fill="#ffffff" fontSize="9" fontWeight="bold">DDR5 RAM SLOTS (A1/A2/B1/B2)</text>

                  {/* Primary PCIe x16 Slot */}
                  <rect x="80" y="160" width="220" height="14" rx="3" fill="#ffffff" />
                  <text x="90" y="171" fill="#04121a" fontSize="9" fontWeight="bold">PRIMARY PCIe 4.0/5.0 x16 GRAPHICS SLOT</text>

                  {/* Secondary Expansion Slots (ATX only) */}
                  <rect x="80" y="200" width="160" height="10" rx="2" fill="#475569" opacity="0.7" />
                  <rect x="80" y="235" width="160" height="10" rx="2" fill="#475569" opacity="0.7" />
                  <rect x="80" y="270" width="220" height="12" rx="2" fill="#ffffff" opacity="0.5" />
                  <rect x="80" y="305" width="160" height="10" rx="2" fill="#475569" opacity="0.7" />
                  <text x="310" y="295" fill="#64748b" fontSize="9">7 ATX EXPANSION SLOTS</text>

                  {/* 24-Pin ATX Main Power */}
                  <rect x="445" y="80" width="18" height="90" rx="2" fill="#f59e0b" />
                  <text x="430" y="130" fill="#f59e0b" fontSize="9" transform="rotate(-90 430,130)">24-PIN ATX</text>

                  {/* Standard Standoff Screw Holes (Brass circles) */}
                  {[
                    [35, 35], [235, 35], [455, 35],       // Top row
                    [35, 170], [235, 170], [455, 170],     // Middle row
                    [35, 345], [235, 345], [455, 345]      // Bottom row (ATX)
                  ].map(([cx, cy], idx) => (
                    <g key={idx}>
                      <circle cx={cx} cy={cy} r="6" fill="#eab308" stroke="#713f12" strokeWidth="1.5" />
                      <circle cx={cx} cy={cy} r="2" fill="#000" />
                    </g>
                  ))}
                </svg>
              </div>

              <div className="diagram-legend">
                <span className="legend-chip"><span className="dot dot-eatx" /> E-ATX (305×330mm)</span>
                <span className="legend-chip"><span className="dot dot-atx" /> Standard ATX (305×244mm)</span>
                <span className="legend-chip"><span className="dot dot-matx" /> Micro-ATX (244×244mm)</span>
                <span className="legend-chip"><span className="dot dot-itx" /> Mini-ITX (170×170mm)</span>
                <span className="legend-chip"><span className="dot dot-brass" /> Standoff Anchor Screw</span>
              </div>
            </div>

            {/* FORM FACTOR DETAILS MATRIX */}
            <div className="lp-cards-grid">
              {MOTHERBOARD_FORM_FACTORS.map((ff) => (
                <div
                  key={ff.code}
                  className={`lp-ff-card ${selectedFormFactor === ff.code ? "is-selected" : ""}`}
                  onClick={() => {
                    try { soundManager.click(); } catch {}
                    setSelectedFormFactor(ff.code);
                  }}
                >
                  <div className="ff-card-top">
                    <span className="ff-badge" style={{ borderColor: ff.color, color: ff.color }}>
                      {ff.badge}
                    </span>
                    <strong className="ff-code">{ff.code}</strong>
                  </div>
                  <h3 className="ff-name">{ff.name}</h3>
                  <div className="ff-spec-row">
                    <span className="spec-label">Dimensions:</span>
                    <strong className="spec-value">{ff.dims} ({ff.dimsInches})</strong>
                  </div>
                  <div className="ff-spec-row">
                    <span className="spec-label">Mounting:</span>
                    <span className="spec-value">{ff.standoffs}</span>
                  </div>
                  <div className="ff-spec-row">
                    <span className="spec-label">Expansion:</span>
                    <span className="spec-value">{ff.pcieSlots} • {ff.ramSlots}</span>
                  </div>
                  <p className="ff-desc">{ff.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            MODULE 2: SLIDE 1 // SOCKET ARCHITECTURE & VRM POWER PHASES
           ========================================================================= */}
        {moduleNum === 2 && activeSlide === 1 && (
          <div className="lp-slide-page animate-fade-in">
            <header className="lp-slide-header">
              <h2>CPU Sockets (LGA vs. PGA) &amp; VRM Power Delivery</h2>
              <p>
                The central processing unit attaches to the motherboard through precision high-pin-density sockets,
                energized by multi-phase Voltage Regulator Modules (VRMs).
              </p>
            </header>

            <div className="lp-two-col-grid">
              {/* LGA Card */}
              <div className="lp-feature-card">
                <div className="card-tag tag-cyan">INTEL LGA 1700 / AMD AM5</div>
                <h3>Land Grid Array (LGA) Sockets</h3>
                <p>
                  In LGA architecture, the delicate, microscopic gold spring pins reside directly inside the motherboard
                  socket. The processor silicon features flat gold contact pads underneath.
                </p>
                <ul className="lp-bullet-list">
                  <li><strong>Zero Pin Pressure:</strong> Never apply downward force; chip drops in by gravity alone (ZIF).</li>
                  <li><strong>Protective Cap:</strong> Keep the plastic socket cover in place until the CPU is seated; clamping the lever will pop the cover off automatically.</li>
                  <li><strong>Pin Count:</strong> LGA 1700 has 1,700 spring pins; AMD AM5 has 1,718 spring pins.</li>
                </ul>
                <div className="lp-warning-box">
                  <strong>Critical Warning:</strong> A single bent pin in an LGA socket can permanently prevent memory channels from detecting or cause boot failure.
                </div>
              </div>

              {/* VRM Card */}
              <div className="lp-feature-card">
                <div className="card-tag tag-emerald">12V TO 1.2V STEP-DOWN</div>
                <h3>Voltage Regulator Module (VRM)</h3>
                <p>
                  Modern CPUs draw up to 250+ Watts at ultra-low voltages (1.1V–1.4V). The VRM circuit steps down 12V DC
                  from the PSU 8-pin EPS cable through balanced power phases.
                </p>
                <div className="vrm-spec-chips">
                  <div className="vrm-chip">
                    <strong>MOSFETs</strong>
                    <span>High/Low-side switches cycling at 500,000+ Hz</span>
                  </div>
                  <div className="vrm-chip">
                    <strong>Chokes / Inductors</strong>
                    <span>Smooth rapid pulsed voltage into steady DC</span>
                  </div>
                  <div className="vrm-chip">
                    <strong>Solid Capacitors</strong>
                    <span>Filter out micro-ripple to prevent voltage sag</span>
                  </div>
                </div>
                <p className="vrm-tip">
                  <strong>Heatsink Requirement:</strong> High core-count processors require motherboards with heavy aluminum heatsinks over the VRM to prevent thermal throttling.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODULE 2: SLIDE 2 // FRONT PANEL HEADERS & USB COLOR CODES
           ========================================================================= */}
        {moduleNum === 2 && activeSlide === 2 && (
          <div className="lp-slide-page animate-fade-in">
            <header className="lp-slide-header">
              <h2>Front Panel Headers &amp; Rear I/O Color Coding</h2>
              <p>
                Connecting front panel case wiring and identifying high-speed USB ports requires strict adherence to
                pinout schematics and industry color-coding standards.
              </p>
            </header>

            <div className="lp-two-col-grid">
              {/* Front Panel Header Pinout Matrix */}
              <div className="lp-feature-card">
                <div className="card-tag tag-amber">9-PIN JFP1 HEADER SCHEMATIC</div>
                <h3>Standard Front Panel Header (F_PANEL)</h3>
                <p>
                  Standardized 9-pin block located at the bottom-right corner of the motherboard. Switches are non-polarized,
                  while LEDs must match positive (+) and negative (-).
                </p>

                <div className="fpanel-diagram-table">
                  <div className="fpanel-row top-row">
                    <div className="fpanel-pin p-led-pos">Pin 1: Power LED (+)</div>
                    <div className="fpanel-pin p-led-neg">Pin 3: Power LED (-)</div>
                    <div className="fpanel-pin p-sw-pos">Pin 5: Power Switch</div>
                    <div className="fpanel-pin p-sw-neg">Pin 7: Power Ground</div>
                    <div className="fpanel-pin p-key">Pin 9: KEY (No Pin)</div>
                  </div>
                  <div className="fpanel-row btm-row">
                    <div className="fpanel-pin h-led-pos">Pin 2: HDD LED (+)</div>
                    <div className="fpanel-pin h-led-neg">Pin 4: HDD LED (-)</div>
                    <div className="fpanel-pin r-sw-pos">Pin 6: Reset Switch</div>
                    <div className="fpanel-pin r-sw-neg">Pin 8: Reset Ground</div>
                    <div className="fpanel-pin empty">Pin 10: Empty</div>
                  </div>
                </div>

                <div className="fpanel-rule-chips">
                  <span className="rule-chip safe">✓ Power SW &amp; Reset SW: Non-polarized momentary shorts</span>
                  <span className="rule-chip warning">HDD LED &amp; Power LED: Polarity Sensitive (+ / -)</span>
                </div>
              </div>

              {/* USB Port Color Code Guide */}
              <div className="lp-feature-card">
                <div className="card-tag tag-cyan">INDUSTRY PORT COLOR SPECIFICATIONS</div>
                <h3>USB Port Color Codes &amp; Transfer Speeds</h3>
                <div className="usb-color-list">
                  <div className="usb-color-item">
                    <span className="usb-color-swatch black" />
                    <div className="usb-color-details">
                      <strong>Black Port: USB 2.0 (Hi-Speed)</strong>
                      <span>Max Speed: 480 Mbps • Best for keyboards, mice, and audio DACs.</span>
                    </div>
                  </div>
                  <div className="usb-color-item">
                    <span className="usb-color-swatch blue" />
                    <div className="usb-color-details">
                      <strong>Blue Port: USB 3.0 / 3.1 Gen 1 (SuperSpeed)</strong>
                      <span>Max Speed: 5 Gbps • Standard for external flash drives and webcams.</span>
                    </div>
                  </div>
                  <div className="usb-color-item">
                    <span className="usb-color-swatch teal" />
                    <div className="usb-color-details">
                      <strong>Teal / Cyan Port: USB 3.1 Gen 2 (SuperSpeed+)</strong>
                      <span>Max Speed: 10 Gbps • High-speed backup drives and fast SSD enclosures.</span>
                    </div>
                  </div>
                  <div className="usb-color-item">
                    <span className="usb-color-swatch red" />
                    <div className="usb-color-details">
                      <strong>Red Port: USB 3.2 Gen 2x2 (20 Gbps)</strong>
                      <span>Max Speed: 20 Gbps • Extreme NVMe external enclosures &amp; fast charging.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            SLIDE 3 / FINAL: LECTURE FILM & PRACTICAL FIELD CHECKLIST
           ========================================================================= */}
        {activeSlide === (totalSlides - 1) && (
          <div className="lp-slide-page animate-fade-in">
            <header className="lp-slide-header">
              <h2>Practical Video Lecture &amp; Hands-On Lab Readiness</h2>
              <p>
                Watch the complete demonstration video, verify critical servicing protocols, and transition smoothly
                into the interactive 3D inspection workbench.
              </p>
            </header>

            {/* Embedded 16:9 Lecture Video Player in Center Stage */}
            <div className="lp-center-video-stage">
              <div className="lp-video-aspect-wrap">
                <iframe
                  className="lp-center-iframe"
                  src={`https://www.youtube-nocookie.com/embed/${topic.youtubeId}?enablejsapi=1&rel=0&modestbranding=1`}
                  title={`${topic.title} Lecture Video`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
              <div className="lp-video-meta-bar">
                <div className="lp-video-title-info">
                  <strong>{topic.videoTitle}</strong>
                </div>
                <a
                  href={`https://www.youtube.com/watch?v=${topic.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lp-video-external-btn"
                >
                  Open on YouTube ↗
                </a>
              </div>
            </div>

            {/* Transition Action Bar */}
            <div className="lp-video-bottom-action-grid">
              <div className="lp-next-stage-prompt">
                <div className="prompt-head">
                  <span className="prompt-badge">PHASE 2 WORKBENCH</span>
                  <h4>Ready for 3D Hands-On Inspection?</h4>
                </div>
                <p>
                  Proceed to the 3D Hardware Inspection Lab to orbit, zoom, and inspect each component socket,
                  DIMM keyway, and standoff anchor in interactive 3D space with B.O.B.
                </p>
                <div className="prompt-buttons-row">
                  <button
                    type="button"
                    className="lp-start-3d-btn"
                    onClick={() => {
                      try { soundManager.snap(); } catch {}
                      if (onProceedTo3D) onProceedTo3D();
                    }}
                  >
                    Launch 3D Component Inspection Lab →
                  </button>
                  <button
                    type="button"
                    className="lp-start-quiz-btn"
                    onClick={() => {
                      try { soundManager.click(); } catch {}
                      if (onProceedToQuiz) onProceedToQuiz();
                    }}
                  >
                    Take 15-Item Assessment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fallback for other modules slide 0 */}
        {moduleNum !== 2 && activeSlide === 0 && (
          <div className="lp-slide-page animate-fade-in">
            <header className="lp-slide-header">
              <h2>{topic.title} // Technical Architecture</h2>
              <p>{topic.explanation}</p>
            </header>

            <div className="lp-two-col-grid">
              <div className="lp-feature-card">
                <div className="card-tag tag-cyan">THEORY &amp; SERVICING PROTOCOLS</div>
                <h3>Standard Operating Procedure</h3>
                <p>
                  Adhere to DepEd TVL CSS NC II occupational health and safety guidelines. Proper ESD grounding,
                  correct tool selection, and careful torque prevent costly laboratory component failure.
                </p>
                {topic.fieldFact && (
                  <div className="lp-field-facts">
                    <strong className="fact-title">{topic.fieldFact.title}</strong>
                    <div className="fact-items">
                      {topic.fieldFact.items?.map((it, idx) => (
                        <div key={idx} className="fact-item-row">
                          <span className="fact-tag" style={{ color: it.color, borderColor: it.color }}>
                            {it.tag}
                          </span>
                          <div>
                            <strong>{it.label}: </strong>
                            <span>{it.value}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="lp-feature-card">
                {topic.mistakeWarning && (
                  <div className="lp-mistake-card">
                    <div className="card-tag tag-rose">COMMON LABORATORY HAZARD</div>
                    <h4>{topic.mistakeWarning.title}</h4>
                    <p>{topic.mistakeWarning.desc}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Fallback for other modules slide 1 (NON-BLANK: FULL SPECIFICATIONS & HARDWARE MATRIX) */}
        {moduleNum !== 2 && activeSlide === 1 && (
          <div className="lp-slide-page animate-fade-in">
            <header className="lp-slide-header">
              <h2>{topic.title} // Technical Specifications &amp; Field Standards</h2>
              <p>
                Comprehensive laboratory reference standards, pin tolerances, and tool torque specifications
                prescribed for Computer Systems Servicing technicians.
              </p>
            </header>

            <div className="lp-two-col-grid">
              {/* Technical Specifications Matrix */}
              <div className="lp-feature-card">
                <div className="card-tag tag-emerald">HARDWARE ENGINEERING STANDARDS</div>
                <h3>Critical Laboratory Checklist</h3>
                <ul className="lp-checklist">
                  <li>
                    <strong>Fastener Standards:</strong> Standard 6-32 coarse screws (chassis panels, PSU), M3 fine screws (2.5" drives), and M2 micro-fasteners (M.2 NVMe SSDs).
                  </li>
                  <li>
                    <strong>Tooling Compatibility:</strong> Standard #2 Phillips screwdriver fits 90%+ of PC screws. Never use power drills or overtighten into fiberglass.
                  </li>
                  <li>
                    <strong>Grounding Continuity:</strong> Regularly discharge body capacitance against the unpainted chassis metal while plugged into a grounded wall socket with power OFF.
                  </li>
                  <li>
                    <strong>Zero-Force Assembly:</strong> Components (CPUs, RAM, GPUs) are physically keyed with notches; if excessive resistance is felt, re-verify pinout alignment.
                  </li>
                </ul>

                <div className="lp-warning-box">
                  <strong>Technician Golden Rule:</strong> Always test boot components outside the chassis on top of the non-conductive motherboard box before final internal cable management.
                </div>
              </div>

              {/* Servicing Protocol Card */}
              <div className="lp-feature-card">
                <div className="card-tag tag-amber">DEPED / TESDA CSS NC II REQUIREMENT</div>
                <h3>Occupational Health &amp; Safety Compliance</h3>
                <p>
                  Laboratory safety protocols mandate non-static footwear, clean non-conductive assembly mats, and anti-static wrist straps connected to earth ground during hardware maintenance.
                </p>

                <div className="vrm-spec-chips">
                  <div className="vrm-chip">
                    <strong>ESD Ground</strong>
                    <span>Drain static safely before touching sensitive silicon</span>
                  </div>
                  <div className="vrm-chip">
                    <strong>Torque Care</strong>
                    <span>Hand-tighten only to avoid stripping threads or cracking PCB</span>
                  </div>
                  <div className="vrm-chip">
                    <strong>Visual Inspection</strong>
                    <span>Verify pin alignment and thermal paste spread before clamping</span>
                  </div>
                </div>

                <p className="vrm-tip">
                  <strong>Advance to Video:</strong> Click Next Slide to watch the practical step-by-step lecture film and preview the 3D model!
                </p>
              </div>

              {/* Quick Glossary Strip for Non-STEM / Novice Learners */}
              <div className="lp-glossary-banner">
                <div className="glossary-head">
                  <span className="glossary-badge">NON-STEM / BEGINNER GLOSSARY</span>
                  <span className="glossary-sub">Hover or tap any hardware acronym for plain-English explanation</span>
                </div>
                <div className="glossary-chips-row">
                  <abbr className="glossary-chip" title="Electrostatic Discharge: Unfelt static electricity from clothes/carpet that can zap and fry microscopic silicon circuits.">
                    <span className="chip-term">ESD</span>
                    <span className="chip-def">Static Zap Hazard</span>
                  </abbr>
                  <abbr className="glossary-chip" title="Voltage Regulator Module: Clean power distributor around the socket that regulates exact voltages to your processor.">
                    <span className="chip-term">VRM</span>
                    <span className="chip-def">CPU Power Delivery</span>
                  </abbr>
                  <abbr className="glossary-chip" title="Power-On Self-Test: Automatic pre-boot check where motherboard tests CPU, RAM, and GPU before showing display.">
                    <span className="chip-term">POST</span>
                    <span className="chip-def">Pre-Boot Diagnostic</span>
                  </abbr>
                  <abbr className="glossary-chip" title="Non-Volatile Memory Express: Ultra-fast solid-state drive that screws directly into the motherboard without cables.">
                    <span className="chip-term">NVMe</span>
                    <span className="chip-def">Direct Fast SSD</span>
                  </abbr>
                  <abbr className="glossary-chip" title="Peripheral Component Interconnect Express: High-speed motherboard slot used for dedicated graphics cards.">
                    <span className="chip-term">PCIe</span>
                    <span className="chip-def">Expansion Card Slot</span>
                  </abbr>
                  <abbr className="glossary-chip" title="Zero Insertion Force: Lever-locked CPU socket that requires absolutely no downward pushing force.">
                    <span className="chip-term">ZIF</span>
                    <span className="chip-def">No-Force Socket</span>
                  </abbr>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── PRESENTATION BOTTOM STEPPER FOOTER ── */}
      <footer className="lp-bottom-footer">
        <div className="lp-footer-left">
          <button
            type="button"
            className="lp-btn-nav lp-btn-prev"
            disabled={activeSlide === 0}
            onClick={handlePrevSlide}
          >
            ← Previous Slide
          </button>
          <div className="lp-slide-dots">
            {Array.from({ length: totalSlides }).map((_, idx) => (
              <span
                key={idx}
                className={`lp-dot ${activeSlide === idx ? "is-active" : ""}`}
                onClick={() => { try { soundManager.click(); } catch {} setActiveSlide(idx); }}
              />
            ))}
          </div>
        </div>

        <div className="lp-footer-right">
          {activeSlide < totalSlides - 1 ? (
            <button type="button" className="lp-btn-nav lp-btn-next" onClick={handleNextSlide}>
              Next Slide →
            </button>
          ) : (
            <div className="lp-footer-actions">
              <button
                type="button"
                className="lp-btn-primary lp-btn-3d"
                onClick={() => {
                  try { soundManager.snap(); } catch {}
                  if (onProceedTo3D) onProceedTo3D();
                }}
              >
                Step 2: 3D Inspection Lab →
              </button>
              <button
                type="button"
                className="lp-btn-quiz"
                onClick={() => {
                  try { soundManager.click(); } catch {}
                  if (onProceedToQuiz) onProceedToQuiz();
                }}
              >
                Take 15-Item Assessment
              </button>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
