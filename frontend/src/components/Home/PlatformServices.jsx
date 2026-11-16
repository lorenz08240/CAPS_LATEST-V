import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import soundManager from "../../utilities/soundManager";
import "./PlatformServices.css";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

export default function PlatformServices() {
  const navigate = useNavigate();
  const [activeSocketDemo, setActiveSocketDemo] = useState("intel");
  const [rigCompareMode, setRigCompareMode] = useState("gaming");

  const sectionRef = useRef(null);
  const cyanGlowRef = useRef(null);
  const roseGlowRef = useRef(null);
  const headerRef = useRef(null);

  // Dynamic 3D interactive tilt on pointer move (making sections feel alive)
  const handleCardMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;

    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);

    gsap.to(card, {
      rotateX,
      rotateY,
      duration: 0.3,
      ease: "power2.out",
      transformPerspective: 900,
      overwrite: "auto",
    });
  };

  const handleCardMouseLeave = (e) => {
    const card = e.currentTarget;
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.5,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  useEffect(() => {
    // Scope all GSAP animations to sectionRef for clean React lifecycle
    const ctx = gsap.context(() => {
      // 1. Scrubbed Parallax on Ambient Lighting (GSAP ScrollTrigger scrub)
      if (cyanGlowRef.current) {
        gsap.to(cyanGlowRef.current, {
          yPercent: 40,
          xPercent: 10,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.2,
          },
        });
      }

      if (roseGlowRef.current) {
        gsap.to(roseGlowRef.current, {
          yPercent: -35,
          xPercent: -8,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.5,
          },
        });
      }

      // 2. Master Header Reveal
      if (headerRef.current) {
        ScrollTrigger.create({
          trigger: headerRef.current,
          start: "top 88%",
          onEnter: () => {
            gsap.to(headerRef.current, {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.7,
              ease: "power2.out",
              overwrite: "auto",
            });
          },
          onLeaveBack: () => {
            gsap.to(headerRef.current, {
              opacity: 0,
              y: 30,
              scale: 0.98,
              duration: 0.35,
              ease: "power2.in",
              overwrite: "auto",
            });
          },
        });
      }

      // 3. Staggered Asymmetric Feature Rows
      const rows = gsap.utils.toArray(".service-showcase-row");
      rows.forEach((row) => {
        const isCardLeft = row.classList.contains("left-card-right-text");
        const cardBay = row.querySelector(".service-card-bay");
        const textBay = row.querySelector(".service-text-bay");

        const playRowEnter = () => {
          const tl = gsap.timeline({ overwrite: "auto" });

          tl.to(
            cardBay,
            { opacity: 1, y: 0, x: 0, scale: 1, duration: 0.65, ease: "power2.out" }
          )
          .to(
            textBay,
            { opacity: 1, y: 0, x: 0, duration: 0.6, ease: "power2.out" },
            "-=0.45"
          )
          .to(
            textBay.querySelectorAll(".service-bullet-list li"),
            { opacity: 1, x: 0, duration: 0.35, stagger: 0.05, ease: "power2.out" },
            "-=0.3"
          );

          // Capability 1: Power bar and metric tiles flourish
          const powerBar = row.querySelector(".power-bar-fill");
          if (powerBar) {
            tl.to(
              powerBar,
              { scaleX: 1, duration: 0.6, ease: "power2.out" },
              "-=0.2"
            );
          }

          // Capability 3: Schematic traces flourish
          const traces = row.querySelectorAll(".schematic-trace");
          if (traces.length > 0) {
            tl.to(
              traces,
              { scaleX: 1, opacity: 1, duration: 0.5, stagger: 0.06, ease: "power2.out" },
              "-=0.25"
            );
          }

          // Capability 4: Studio control tags
          const controlTags = row.querySelectorAll(".control-tag");
          if (controlTags.length > 0) {
            tl.to(
              controlTags,
              { opacity: 1, y: 0, duration: 0.3, stagger: 0.04, ease: "power2.out" },
              "-=0.2"
            );
          }
        };

        const playRowLeaveBack = () => {
          gsap.to([cardBay, textBay], {
            opacity: 0,
            y: 35,
            scale: 0.98,
            duration: 0.35,
            ease: "power2.in",
            overwrite: "auto",
          });
        };

        ScrollTrigger.create({
          trigger: row,
          start: "top 88%",
          onEnter: () => playRowEnter(),
          onLeaveBack: () => playRowLeaveBack(),
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleAction = (path) => {
    try {
      soundManager.click();
    } catch {}
    navigate(path);
  };

  return (
    <section id="platform-services" className="platform-services-section" ref={sectionRef}>
      {/* Ambient Cyber Backing Glows with GSAP Parallax Scrub */}
      <div className="services-ambient-glow services-glow-cyan" ref={cyanGlowRef} />
      <div className="services-ambient-glow services-glow-rose" ref={roseGlowRef} />

      <div className="services-container">
        {/* Section Master Header */}
        <div className="services-master-header" ref={headerRef}>
          <div className="services-badge">
            <span className="badge-dot" />
            <span className="badge-text">ARCHITECTURAL CAPABILITIES // SYSTEM SUITE</span>
          </div>
          <h2 className="services-headline">
            Precision Hardware Engineering &amp; Virtual Assembly
          </h2>
          <p className="services-subheadline">
            From zero-risk virtual socket practice to mathematical TDP validation and multi-rig benchmark comparison, BuildLab equips students and systems integrators with a complete computer engineering suite.
          </p>
        </div>

        {/* ── SERVICE 1: COMPATIBILITY CHECKER (2 COLUMNS: LEFT TELEMETRY, RIGHT NARRATIVE) ── */}
        <div id="service-compatibility" className="service-showcase-row left-card-right-text">
          {/* Column 1: Interactive Telemetry Card */}
          <div className="service-card-bay">
            <div
              className="telemetry-demo-card"
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
            >
              <div className="telemetry-card-header">
                <div className="telemetry-header-meta">
                  <span className="telemetry-id">DIAGNOSTIC ENGINE // LIVE FEED</span>
                  <span className="telemetry-status-ok">ALL CIRCUITS NOMINAL</span>
                </div>
                <div className="telemetry-platform-toggle">
                  <button
                    type="button"
                    className={`toggle-pill ${activeSocketDemo === "intel" ? "active" : ""}`}
                    onClick={() => setActiveSocketDemo("intel")}
                  >
                    LGA 1700
                  </button>
                  <button
                    type="button"
                    className={`toggle-pill ${activeSocketDemo === "amd" ? "active" : ""}`}
                    onClick={() => setActiveSocketDemo("amd")}
                  >
                    AM5
                  </button>
                </div>
              </div>

              <div className="telemetry-body-grid">
                <div className="telemetry-metric-tile">
                  <div className="metric-eyebrow">PROCESSOR SOCKET KEY</div>
                  <div className="metric-val">
                    {activeSocketDemo === "intel" ? "Intel Core i5-12600K" : "AMD Ryzen 7 7800X3D"}
                  </div>
                  <div className="metric-sub">
                    {activeSocketDemo === "intel" ? "Matched with Intel B660 Chipset" : "Matched with AMD B650 AM5 Platform"}
                  </div>
                  <span className="metric-tag tag-verified">Socket Pinout Matched</span>
                </div>

                <div className="telemetry-metric-tile">
                  <div className="metric-eyebrow">MEMORY ARCHITECTURE</div>
                  <div className="metric-val">32GB (2x16GB) DDR5-5600</div>
                  <div className="metric-sub">Dual-Channel Populated: DIMM Slots A2 &amp; B2</div>
                  <span className="metric-tag tag-verified">Zero Physical Clearance Conflict</span>
                </div>

                <div className="telemetry-metric-tile full-width">
                  <div className="metric-eyebrow">ESTIMATED SYSTEM TDP &amp; POWER DISSIPATION</div>
                  <div className="power-bar-wrap">
                    <div
                      className="power-bar-fill"
                      style={{ width: activeSocketDemo === "intel" ? "48%" : "54%" }}
                    />
                  </div>
                  <div className="power-data-row">
                    <span>Estimated Consumption: <strong>{activeSocketDemo === "intel" ? "360W" : "410W"}</strong></span>
                    <span>Recommended Supply: <strong>750W 80+ Gold (+52% Safe Headroom)</strong></span>
                  </div>
                </div>

                <div className="telemetry-metric-tile full-width">
                  <div className="metric-eyebrow">CHASSIS &amp; GPU CLEARANCE PROFILE</div>
                  <div className="clearance-spec-row">
                    <div className="clearance-item">
                      <span className="c-label">GPU Length:</span>
                      <span className="c-val">242 mm</span>
                    </div>
                    <div className="clearance-item">
                      <span className="c-label">Max Case Clearance:</span>
                      <span className="c-val">381 mm</span>
                    </div>
                    <div className="clearance-item clearance-ok">
                      <span className="c-label">Remaining Airflow:</span>
                      <span className="c-val">+139 mm</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Editorial Narrative & Action */}
          <div className="service-text-bay">
            <div className="service-kicker-tag">CAPABILITY 01 // RULES ENGINE</div>
            <h3 className="service-title">Real-Time Compatibility &amp; Clearance Verification</h3>
            <p className="service-description">
              Eliminate permanently bent motherboard pins, mismatched RAM generation formats, and expensive GPU clearance surprises before buying components. BuildLab evaluates electrical dissipation curves, PCIe lane bifurcation, and physical millimeter dimensions with microsecond precision.
            </p>
            <ul className="service-bullet-list">
              <li>
                <span className="bullet-dash">&mdash;</span>
                <span><strong>Multi-Socket Verification:</strong> Cross-checks Intel LGA1700, LGA1200, AMD AM5, and AM4 CPU-motherboard pairings.</span>
              </li>
              <li>
                <span className="bullet-dash">&mdash;</span>
                <span><strong>Power Budget Safeguard:</strong> Automatically calculates dynamic PSU wattage headroom with peak transient buffer.</span>
              </li>
              <li>
                <span className="bullet-dash">&mdash;</span>
                <span><strong>Component Clearance Check:</strong> Validates graphics card lengths, CPU cooler heights, and radiator mounting bays.</span>
              </li>
            </ul>

            <div className="service-cta-wrap">
              <button
                type="button"
                className="service-primary-btn"
                onClick={() => handleAction("/compatibility")}
              >
                <span>OPEN COMPATIBILITY MATRIX</span>
                <span className="btn-arrow">&rarr;</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── SERVICE 2: COMPARE 2 RIGS (2 COLUMNS: LEFT NARRATIVE, RIGHT COMPARISON CARD) ── */}
        <div id="service-compare" className="service-showcase-row right-card-left-text">
          {/* Column 1: Editorial Narrative & Action */}
          <div className="service-text-bay">
            <div className="service-kicker-tag kicker-amber">CAPABILITY 02 // MULTI-TIER EVALUATION</div>
            <h3 className="service-title">Side-by-Side Dual Rig Benchmarking &amp; Delta Analysis</h3>
            <p className="service-description">
              Torn between an entry-level esports configuration and an ultra-tier workstation? Directly compare two complete PC builds side-by-side to analyze price-to-performance ratios, expected framerate projections, total thermal load, and hardware upgrade paths.
            </p>
            <ul className="service-bullet-list">
              <li>
                <span className="bullet-dash">&mdash;</span>
                <span><strong>FPS Projections:</strong> Estimate gaming framerates at 1080p, 1440p, and 4K across competitive titles.</span>
              </li>
              <li>
                <span className="bullet-dash">&mdash;</span>
                <span><strong>Price-to-Performance Ratio:</strong> Discover exact cost efficiencies and identify which rig delivers more compute per peso.</span>
              </li>
              <li>
                <span className="bullet-dash">&mdash;</span>
                <span><strong>Hardware Delta Metrics:</strong> Instant breakdown of CPU core differentials, VRAM headroom, and memory throughput.</span>
              </li>
            </ul>

            <div className="service-cta-wrap">
              <button
                type="button"
                className="service-primary-btn btn-amber"
                onClick={() => handleAction("/compare")}
              >
                <span>COMPARE TWO RIGS NOW</span>
                <span className="btn-arrow">&rarr;</span>
              </button>
            </div>
          </div>

          {/* Column 2: Dual-Rig Comparison Visual Card */}
          <div className="service-card-bay">
            <div
              className="rig-compare-card"
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
            >
              <div className="rig-compare-nav">
                <button
                  type="button"
                  className={`compare-tab ${rigCompareMode === "gaming" ? "active" : ""}`}
                  onClick={() => setRigCompareMode("gaming")}
                >
                  ESPORTS VS CREATOR
                </button>
                <button
                  type="button"
                  className={`compare-tab ${rigCompareMode === "budget" ? "active" : ""}`}
                  onClick={() => setRigCompareMode("budget")}
                >
                  BUDGET VS VALUE
                </button>
              </div>

              <div className="dual-rig-grid">
                {/* Rig Alpha */}
                <div className="rig-column-bay rig-alpha">
                  <div className="rig-bay-head">
                    <span className="rig-tier-badge">RIG ALPHA // TIER 1</span>
                    <h4 className="rig-name">
                      {rigCompareMode === "gaming" ? "1080p Competitive Rig" : "Student Budget Starter"}
                    </h4>
                    <span className="rig-price">
                      {rigCompareMode === "gaming" ? "₱48,500 EST." : "₱32,800 EST."}
                    </span>
                  </div>
                  <div className="rig-spec-list">
                    <div className="spec-line">
                      <span className="s-part">CPU</span>
                      <span className="s-name">{rigCompareMode === "gaming" ? "Core i5-12400F" : "Ryzen 5 5600G"}</span>
                    </div>
                    <div className="spec-line">
                      <span className="s-part">GPU</span>
                      <span className="s-name">{rigCompareMode === "gaming" ? "GeForce RTX 3060 12GB" : "Radeon Vega 7 (APU)"}</span>
                    </div>
                    <div className="spec-line">
                      <span className="s-part">RAM</span>
                      <span className="s-name">16GB DDR4-3200</span>
                    </div>
                    <div className="spec-line">
                      <span className="s-part">FPS (1080p)</span>
                      <span className="s-val text-cyan">{rigCompareMode === "gaming" ? "175+ FPS Avg" : "85+ FPS Avg"}</span>
                    </div>
                  </div>
                </div>

                {/* Rig Beta */}
                <div className="rig-column-bay rig-beta">
                  <div className="rig-bay-head">
                    <span className="rig-tier-badge badge-premium">RIG BETA // TIER 2</span>
                    <h4 className="rig-name">
                      {rigCompareMode === "gaming" ? "1440p Creator Workstation" : "Mainstream DDR5 Build"}
                    </h4>
                    <span className="rig-price">
                      {rigCompareMode === "gaming" ? "₱82,900 EST." : "₱54,200 EST."}
                    </span>
                  </div>
                  <div className="rig-spec-list">
                    <div className="spec-line">
                      <span className="s-part">CPU</span>
                      <span className="s-name">{rigCompareMode === "gaming" ? "Ryzen 7 7700X" : "Core i5-13400"}</span>
                    </div>
                    <div className="spec-line">
                      <span className="s-part">GPU</span>
                      <span className="s-name">{rigCompareMode === "gaming" ? "GeForce RTX 4070 12GB" : "GeForce RTX 3060 Ti"}</span>
                    </div>
                    <div className="spec-line">
                      <span className="s-part">RAM</span>
                      <span className="s-name">32GB DDR5-6000</span>
                    </div>
                    <div className="spec-line">
                      <span className="s-part">FPS (1080p)</span>
                      <span className="s-val text-amber">{rigCompareMode === "gaming" ? "290+ FPS Avg" : "195+ FPS Avg"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rig-delta-summary">
                <span className="delta-pill">
                  {rigCompareMode === "gaming" ? "+65% 1440p Frame Rate Advantage" : "+40% Upgrade Flexibility with DDR5"}
                </span>
                <span className="delta-note">
                  {rigCompareMode === "gaming" ? "Recommended for Blender rendering, Premiere Pro & high-refresh 1440p gaming." : "Solid upgrade roadmap for TVL-CSS lab computing."}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── SERVICE 3: HARDWARE ACADEMY & COURSEWARE (2 COLUMNS: LEFT CARD, RIGHT NARRATIVE) ── */}
        <div id="service-academy" className="service-showcase-row left-card-right-text">
          {/* Column 1: Interactive Academy Card */}
          <div className="service-card-bay">
            <div
              className="academy-preview-card"
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
            >
              <div className="academy-card-head">
                <div className="academy-tag">ACADEMIC HARDWARE COURSEWARE</div>
                <div className="academy-badge-ptc">PTC-IICT &bull; TVL-CSS NC II ALIGNED</div>
              </div>

              <div className="academy-blueprint-viewport">
                <div className="blueprint-schematic-grid">
                  <div className="schematic-trace trace-h" />
                  <div className="schematic-trace trace-v" />
                  <div className="schematic-chip">
                    <span className="chip-label">LGA 1700 SOCKET ARCHITECTURE</span>
                    <span className="chip-sub">1700 Contact Land Grid Array &bull; Gold Notch Marker</span>
                  </div>
                  <div className="hotspot-pin pin-1">
                    <span className="pin-pulse" />
                    <span className="pin-label">Alignment Pin 1</span>
                  </div>
                  <div className="hotspot-pin pin-2">
                    <span className="pin-pulse" />
                    <span className="pin-label">DDR5 Channel A</span>
                  </div>
                </div>

                <div className="blueprint-meta-bar">
                  <span>THEME: <strong>BLUEPRINT DRAFTING (#EFE9DA) &amp; DARK LAB (#0B101B)</strong></span>
                  <span>ASSESSMENT: <strong>SERIAL TERMINAL LAB CHECK</strong></span>
                </div>
              </div>

              <div className="academy-syllabus-strip">
                <div className="syllabus-module-pill active">01 Case &amp; Airflow</div>
                <div className="syllabus-module-pill active">02 Motherboard &amp; VRM</div>
                <div className="syllabus-module-pill active">03 CPU Socketing</div>
                <div className="syllabus-module-pill active">04 RAM &amp; Storage</div>
                <div className="syllabus-module-pill active">05 GPU &amp; Power</div>
              </div>
            </div>
          </div>

          {/* Column 2: Editorial Narrative & Action */}
          <div className="service-text-bay">
            <div className="service-kicker-tag kicker-emerald">CAPABILITY 03 // ACADEMIC SYLLABUS</div>
            <h3 className="service-title">Hands-On Learning Modules &amp; Verified Student Certification</h3>
            <p className="service-description">
              Specifically structured for Pateros Technological College ICT students and DepEd Senior High School TVL-CSS trainees. Work through 5 interactive hardware modules and 13 guided lessons designed to build physical assembly confidence without risking fragile computer parts.
            </p>
            <ul className="service-bullet-list">
              <li>
                <span className="bullet-dash">&mdash;</span>
                <span><strong>Dual-Theme Engineering Visuals:</strong> Toggle between high-contrast engineering Blueprint drafting mode and focused obsidian Dark Lab mode.</span>
              </li>
              <li>
                <span className="bullet-dash">&mdash;</span>
                <span><strong>Interactive 3D Pinouts &amp; Hotspots:</strong> Zoom into socket keys, thermal paste spread patterns, and front-panel headers.</span>
              </li>
              <li>
                <span className="bullet-dash">&mdash;</span>
                <span><strong>Accredited Completion Certificate:</strong> Complete all lesson quizzes to earn an official certificate inscribed with your verified name.</span>
              </li>
            </ul>

            <div className="service-cta-wrap">
              <button
                type="button"
                className="service-primary-btn btn-emerald"
                onClick={() => handleAction("/learn")}
              >
                <span>ENTER HARDWARE ACADEMY</span>
                <span className="btn-arrow">&rarr;</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── SERVICE 4: 3D VIRTUAL PC STUDIO (2 COLUMNS: LEFT NARRATIVE, RIGHT 3D PREVIEW) ── */}
        <div id="service-3d-studio" className="service-showcase-row right-card-left-text">
          {/* Column 1: Editorial Narrative & Action */}
          <div className="service-text-bay">
            <div className="service-kicker-tag kicker-sky">CAPABILITY 04 // THREE.JS SIMULATION</div>
            <h3 className="service-title">3D Virtual Assembly Studio &amp; Physics Simulation</h3>
            <p className="service-description">
              Experience true physical assembly simulation powered by Three.js WebGL rendering. Rotate custom computer cases in 360 degrees, inspect component clearances from any angle, and utilize Exploded View to understand how motherboards, coolers, and graphics cards layer inside the chassis.
            </p>
            <ul className="service-bullet-list">
              <li>
                <span className="bullet-dash">&mdash;</span>
                <span><strong>360&deg; OrbitControls Inspection:</strong> Freely rotate, pan, and zoom to examine standoffs, PCIe retention locks, and cable management channels.</span>
              </li>
              <li>
                <span className="bullet-dash">&mdash;</span>
                <span><strong>Exploded Assembly View:</strong> Float all 7 hardware stages in 3D coordinate space to comprehend physical assembly hierarchies.</span>
              </li>
              <li>
                <span className="bullet-dash">&mdash;</span>
                <span><strong>B.O.B. Companion Guidance:</strong> Context-aware voice guidance from B.O.B. that responds the moment you lock focus on any part.</span>
              </li>
            </ul>

            <div className="service-cta-wrap">
              <button
                type="button"
                className="service-primary-btn btn-sky"
                onClick={() => handleAction("/3d-builder")}
              >
                <span>OPEN 3D ASSEMBLY STUDIO</span>
                <span className="btn-arrow">&rarr;</span>
              </button>
            </div>
          </div>

          {/* Column 2: 3D Studio Mockup Card */}
          <div className="service-card-bay">
            <div
              className="studio-preview-card"
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
            >
              <div className="studio-card-head">
                <span className="studio-id">WEBGL 3D VIEWPORT // SIMULATOR</span>
                <span className="studio-fps">60 FPS ACTIVE</span>
              </div>

              <div className="studio-viewport-body">
                <div className="studio-mesh-wireframe" />
                <div className="studio-chassis-glyph">
                  <div className="glyph-case-outline" />
                  <div className="glyph-gpu-block" />
                  <div className="glyph-cooler-fan" />
                </div>

                <div className="studio-overlay-controls">
                  <span className="control-tag">ORBIT 360&deg;</span>
                  <span className="control-tag">EXPLODED VIEW</span>
                  <span className="control-tag">CABLE PASS-THROUGH</span>
                </div>
              </div>

              <div className="studio-card-footer">
                <div className="aura-swatch-row">
                  <span className="aura-dot aura-pink" />
                  <span className="aura-dot aura-cyan" />
                  <span className="aura-dot aura-amber" />
                  <span className="aura-dot aura-emerald" />
                  <span className="aura-label">RGB Aura Synchronization</span>
                </div>
                <div className="camera-presets-row">
                  <span className="cam-pill">Isometric</span>
                  <span className="cam-pill">Workbench</span>
                  <span className="cam-pill">Socket Close-up</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
