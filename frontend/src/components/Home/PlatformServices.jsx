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
          const bullets = textBay.querySelectorAll(".service-bullet-list li");
          if (bullets.length > 0) {
            tl.to(
              bullets,
              { opacity: 1, x: 0, duration: 0.35, stagger: 0.05, ease: "power2.out" },
              "-=0.3"
            );
          }

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
            <span className="badge-text">CORE FEATURES // WHAT YOU CAN DO</span>
          </div>
          <h2 className="services-headline">
            Everything You Need to Build Your PC with Confidence
          </h2>
          <p className="services-subheadline">
            Learn step-by-step assembly, check if your parts fit together, calculate power usage, and compare builds — all in an easy, risk-free 3D simulator.
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
                  <span className="telemetry-id">LIVE PART FIT CHECKER</span>
                  <span className="telemetry-status-ok">ALL PARTS COMPATIBLE</span>
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
                  <div className="metric-eyebrow">PROCESSOR SOCKET</div>
                  <div className="metric-val">
                    {activeSocketDemo === "intel" ? "Intel Core i5-12600K" : "AMD Ryzen 7 7800X3D"}
                  </div>
                  <div className="metric-sub">
                    {activeSocketDemo === "intel" ? "Matches with Intel B660 Motherboard" : "Matches with AMD B650 AM5 Motherboard"}
                  </div>
                  <span className="metric-tag tag-verified">Socket Fits Perfectly</span>
                </div>

                <div className="telemetry-metric-tile">
                  <div className="metric-eyebrow">MEMORY SLOTS</div>
                  <div className="metric-val">32GB (2x16GB) DDR5-5600</div>
                  <div className="metric-sub">Installed in Dual-Channel Slots (A2 &amp; B2)</div>
                  <span className="metric-tag tag-verified">No Cooler Clearance Conflict</span>
                </div>

                <div className="telemetry-metric-tile full-width">
                  <div className="metric-eyebrow">ESTIMATED ELECTRICITY &amp; POWER USAGE</div>
                  <div className="power-bar-wrap">
                    <div
                      className="power-bar-fill"
                      style={{ width: activeSocketDemo === "intel" ? "48%" : "54%" }}
                    />
                  </div>
                  <div className="power-data-row">
                    <span>Estimated Consumption: <strong>{activeSocketDemo === "intel" ? "360 Watts" : "410 Watts"}</strong></span>
                    <span>Recommended Power Supply: <strong>750W 80+ Gold (+52% Safe Buffer)</strong></span>
                  </div>
                </div>

                <div className="telemetry-metric-tile full-width">
                  <div className="metric-eyebrow">CASE &amp; GRAPHICS CARD SPACE CHECK</div>
                  <div className="clearance-spec-row">
                    <div className="clearance-item">
                      <span className="c-label">Card Length:</span>
                      <span className="c-val">242 mm</span>
                    </div>
                    <div className="clearance-item">
                      <span className="c-label">Max Case Space:</span>
                      <span className="c-val">381 mm</span>
                    </div>
                    <div className="clearance-item clearance-ok">
                      <span className="c-label">Extra Airflow Space:</span>
                      <span className="c-val">+139 mm</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Editorial Narrative & Action */}
          <div className="service-text-bay">
            <div className="service-kicker-tag">FEATURE 01 // COMPATIBILITY CHECK</div>
            <h3 className="service-title">Make Sure Every Part Fits &amp; Works Together</h3>
            <p className="service-description">
              Avoid buying the wrong parts. BuildLab automatically checks if your processor fits your motherboard, if your graphics card fits your case, and if your power supply has enough wattage.
            </p>

            <div className="service-cta-wrap">
              <button
                type="button"
                className="service-primary-btn"
                onClick={() => handleAction("/compatibility")}
              >
                <span>CHECK PART COMPATIBILITY</span>
                <span className="btn-arrow">&rarr;</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── SERVICE 2: COMPARE 2 RIGS (2 COLUMNS: LEFT NARRATIVE, RIGHT COMPARISON CARD) ── */}
        <div id="service-compare" className="service-showcase-row right-card-left-text">
          {/* Column 1: Editorial Narrative & Action */}
          <div className="service-text-bay">
            <div className="service-kicker-tag kicker-amber">FEATURE 02 // SIDE-BY-SIDE COMPARISON</div>
            <h3 className="service-title">Compare Two PC Builds Side by Side</h3>
            <p className="service-description">
              Not sure which PC fits your budget? Compare two computer builds side by side. Easily see differences in price, gaming speed (FPS), parts, and future upgrade options so you pick the best one for your needs.
            </p>

            <div className="service-cta-wrap">
              <button
                type="button"
                className="service-primary-btn btn-amber"
                onClick={() => handleAction("/compare")}
              >
                <span>COMPARE TWO PCS NOW</span>
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
                  GAMING VS WORKSTATION
                </button>
                <button
                  type="button"
                  className={`compare-tab ${rigCompareMode === "budget" ? "active" : ""}`}
                  onClick={() => setRigCompareMode("budget")}
                >
                  BUDGET VS UPGRADED
                </button>
              </div>

              <div className="dual-rig-grid">
                {/* Rig Alpha */}
                <div className="rig-column-bay rig-alpha">
                  <div className="rig-bay-head">
                    <span className="rig-tier-badge">RIG A // STARTER PC</span>
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
                    <span className="rig-tier-badge badge-premium">RIG B // UPGRADED PC</span>
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
                  {rigCompareMode === "gaming" ? "+65% Higher Frame Rate in Gaming" : "+40% More Future-Proof with DDR5"}
                </span>
                <span className="delta-note">
                  {rigCompareMode === "gaming" ? "Recommended for smooth 1440p gaming, 3D modeling, and fast video editing." : "Great choice for school projects, coding, and future upgrades."}
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
                <div className="academy-tag">INTERACTIVE HARDWARE LESSONS</div>
                <div className="academy-badge-ptc">PTC-IICT &bull; TVL-CSS ALIGNED</div>
              </div>

              <div className="academy-blueprint-viewport">
                <div className="blueprint-schematic-grid">
                  <div className="schematic-trace trace-h" />
                  <div className="schematic-trace trace-v" />
                  <div className="schematic-chip">
                    <span className="chip-label">CPU SOCKET (INTEL LGA 1700)</span>
                    <span className="chip-sub">1,700 Gold Pins &bull; Match the Golden Corner Arrow</span>
                  </div>
                  <div className="hotspot-pin pin-1">
                    <span className="pin-pulse" />
                    <span className="pin-label">Corner Triangle Guide</span>
                  </div>
                  <div className="hotspot-pin pin-2">
                    <span className="pin-pulse" />
                    <span className="pin-label">RAM Memory Slot 1</span>
                  </div>
                </div>

                <div className="blueprint-meta-bar">
                  <span>THEME: <strong>LIGHT BLUEPRINT OR DARK LAB</strong></span>
                  <span>QUIZZES: <strong>TEST YOUR KNOWLEDGE AFTER EACH LESSON</strong></span>
                </div>
              </div>

              <div className="academy-syllabus-strip">
                <div className="syllabus-module-pill active">01 Computer Case</div>
                <div className="syllabus-module-pill active">02 Motherboard</div>
                <div className="syllabus-module-pill active">03 CPU &amp; Cooler</div>
                <div className="syllabus-module-pill active">04 RAM &amp; SSD Storage</div>
                <div className="syllabus-module-pill active">05 Graphics Card &amp; Power</div>
              </div>
            </div>
          </div>

          {/* Column 2: Editorial Narrative & Action */}
          <div className="service-text-bay">
            <div className="service-kicker-tag kicker-emerald">FEATURE 03 // STEP-BY-STEP LESSONS</div>
            <h3 className="service-title">Learn How to Build a PC with Interactive Lessons</h3>
            <p className="service-description">
              Designed for students and beginners. Learn how computer hardware works through 5 interactive modules and 13 easy lessons. Practice online at your own pace so you can assemble a real PC with confidence without breaking expensive parts.
            </p>

            <div className="service-cta-wrap">
              <button
                type="button"
                className="service-primary-btn btn-emerald"
                onClick={() => handleAction("/learn")}
              >
                <span>START LEARNING LESSONS</span>
                <span className="btn-arrow">&rarr;</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── SERVICE 4: 3D VIRTUAL PC STUDIO (2 COLUMNS: LEFT NARRATIVE, RIGHT 3D PREVIEW) ── */}
        <div id="service-3d-studio" className="service-showcase-row right-card-left-text">
          {/* Column 1: Editorial Narrative & Action */}
          <div className="service-text-bay">
            <div className="service-kicker-tag kicker-sky">FEATURE 04 // 3D VIRTUAL SIMULATOR</div>
            <h3 className="service-title">Inspect &amp; Assemble in Full 360&deg; 3D</h3>
            <p className="service-description">
              Explore your computer in full 3D before you build it in real life. Rotate the case 360 degrees, zoom in on parts, and use Exploded View to see how the motherboard, graphics card, cooler, and fans fit together inside.
            </p>

            <div className="service-cta-wrap">
              <button
                type="button"
                className="service-primary-btn btn-sky"
                onClick={() => handleAction("/3d-builder")}
              >
                <span>OPEN 3D BUILDER STUDIO</span>
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
                <span className="studio-id">3D VIEWPORT // SIMULATOR</span>
                <span className="studio-fps">60 FPS SMOOTH</span>
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
                  <span className="control-tag">CABLE ROUTING</span>
                </div>
              </div>

              <div className="studio-card-footer">
                <div className="aura-swatch-row">
                  <span className="aura-dot aura-pink" />
                  <span className="aura-dot aura-cyan" />
                  <span className="aura-dot aura-amber" />
                  <span className="aura-dot aura-emerald" />
                  <span className="aura-label">Custom RGB Colors</span>
                </div>
                <div className="camera-presets-row">
                  <span className="cam-pill">Angled View</span>
                  <span className="cam-pill">Inside Case</span>
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
