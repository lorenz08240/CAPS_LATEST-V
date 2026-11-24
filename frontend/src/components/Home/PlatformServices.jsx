import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLearnMode } from "../../contexts/LearnModeContext";
import soundManager from "../../utilities/soundManager";
import AnimatedHeading from "../Common/AnimatedHeading";
import ScrollAIResponseText from "../Common/ScrollAIResponseText";
import "./PlatformServices.css";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

export default function PlatformServices() {
  const navigate = useNavigate();
  const { userProfile, mode } = useLearnMode();
  const isStudentSignedIn = Boolean(
    userProfile && (userProfile.setupCompleted || userProfile.email || userProfile.fullName) && (userProfile.fullName || userProfile.email)
  );
  const [rigCompareMode, setRigCompareMode] = useState("gaming");

  const sectionRef = useRef(null);
  const cyanGlowRef = useRef(null);
  const roseGlowRef = useRef(null);

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



      // 3. Staggered Asymmetric Feature Rows (Cards Glide In & Out)
      // Narrative text stays stably anchored; only the cards glide in and out smoothly
      const rows = gsap.utils.toArray(".service-showcase-row");
      rows.forEach((row) => {
        const isCardLeft = row.classList.contains("left-card-right-text");
        const cardBay = row.querySelector(".service-card-bay");
        if (!cardBay) return;

        // Initial setup for the card: offset horizontally from its screen edge
        gsap.set(cardBay, {
          x: isCardLeft ? -80 : 80,
          opacity: 0,
          scale: 0.94,
        });

        const glideIn = () => {
          gsap.to(cardBay, {
            x: 0,
            opacity: 1,
            scale: 1,
            duration: 0.85,
            ease: "power3.out",
            overwrite: "auto",
          });

          // Capability 1: Power bar flourish if present
          const powerBar = row.querySelector(".power-bar-fill");
          if (powerBar) {
            gsap.fromTo(powerBar, { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: "power2.out", delay: 0.15 });
          }
        };

        const glideOut = () => {
          gsap.to(cardBay, {
            x: isCardLeft ? -60 : 60,
            opacity: 0.15,
            scale: 0.95,
            duration: 0.5,
            ease: "power2.inOut",
            overwrite: "auto",
          });
        };

        const resetToInitial = () => {
          gsap.to(cardBay, {
            x: isCardLeft ? -80 : 80,
            opacity: 0,
            scale: 0.94,
            duration: 0.4,
            ease: "power2.in",
            overwrite: "auto",
          });
        };

        // ScrollTrigger with optimal trigger sensitivity for 1080p, laptop, and tablet screens
        ScrollTrigger.create({
          trigger: row,
          start: "top 72%",
          end: "bottom 18%",
          onEnter: glideIn,
          onLeave: glideOut,
          onEnterBack: glideIn,
          onLeaveBack: resetToInitial,
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
        <div className="services-master-header">
          <AnimatedHeading
            as="h2"
            className="services-headline"
            lines={["Everything You Need", "to Build Your PC", "with Confidence"]}
            underline={true}
            underlineClassName="mx-auto"
          />
        </div>

        {/* ── SERVICE 1: 2D BUILD STATION (2 COLUMNS: LEFT CARD, RIGHT NARRATIVE) ── */}
        <div id="service-2d-build" className="service-showcase-row left-card-right-text">
          {/* Column 1: 2D Build Station Preview Mockup */}
          <div className="service-card-bay">
            <div
              className="interactive-preview-window window-rose"
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
              onClick={() => handleAction("/build")}
              title="Open the 2D Build Station"
            >
              <div className="preview-window-titlebar">
                <div className="window-dots">
                  <span className="dot dot-red" />
                  <span className="dot dot-yellow" />
                  <span className="dot dot-green" />
                </div>
                <div className="window-url-pill">buildlab.app/build</div>
                <div className="window-status-pill pill-rose">2D WORKbench</div>
              </div>

              <div className="preview-screenshot-container">
                <img
                  src="/assets/preview_build_page.png"
                  alt="BuildLab 2D Build Station"
                  className="preview-viewport-img"
                  loading="lazy"
                />
                <div className="preview-glass-overlay">
                  <div className="overlay-badge-pill pill-rose">
                    <span>OPEN 2D BUILD STATION</span>
                    <span className="arrow">&rarr;</span>
                  </div>
                </div>
              </div>

              <div className="preview-window-footer">
                <div className="preview-footer-pills">
                  <span className="feat-chip chip-rose">7 Hardware Stages</span>
                  <span className="feat-chip chip-rose">Live Compatibility Verification</span>
                  <span className="feat-chip chip-rose">Component Specs Inspector</span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Editorial Narrative */}
          <div className="service-text-bay">
            <AnimatedHeading
              as="h3"
              className="service-title"
              lines={["Assemble Your Rig", "Step by Step in 2D"]}
              underline={true}
              underlineClassName="service-underline-rose"
            />
            <ScrollAIResponseText
              className="service-description"
              text="Pick a part across seven hardware stages, compare options side by side, and get instant compatibility feedback while you build. Every choice is verified before you commit to a full configuration."
              highlightColor="#f43f5e"
            />
          </div>
        </div>

        {/* ── SERVICE 2: COMPATIBILITY CHECK & COMPARE (2 COLUMNS: LEFT NARRATIVE, RIGHT COMPARISON CARD) ── */}
        <div id="service-compare" className="service-showcase-row right-card-left-text">
          {/* Column 1: Editorial Narrative & Action */}
          <div className="service-text-bay">
            <AnimatedHeading
              as="h3"
              className="service-title"
              lines={["Compare Two PC Builds", "Side by Side"]}
              underline={true}
              underlineClassName="service-underline-amber"
            />
            <ScrollAIResponseText
              className="service-description"
              text="Not sure which PC fits your budget? Compare two computer builds side by side. Easily see differences in price, gaming speed (FPS), parts, and future upgrade options so you pick the best one for your needs."
              highlightColor="#f59e0b"
            />

          </div>

          {/* Column 2: Dual-Rig Comparison Visual Preview Card with Real Screen Preview */}
          <div className="service-card-bay">
            <div
              className="interactive-preview-window window-amber"
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
              onClick={() => handleAction("/compatibility")}
              title="Click to launch Real-Time Compatibility Check"
            >
              <div className="preview-window-titlebar">
                <div className="window-dots">
                  <span className="dot dot-red" />
                  <span className="dot dot-yellow" />
                  <span className="dot dot-green" />
                </div>
                <div className="window-url-pill">buildlab.app/compatibility</div>
                <div className="window-status-pill pill-amber">REAL-TIME CHECK</div>
              </div>

              <div className="preview-screenshot-container">
                <img
                  src="/assets/preview_compare_page.png?v=compat"
                  alt="BuildLab Real-Time Compatibility Check Preview"
                  className="preview-viewport-img"
                  loading="lazy"
                />
                <div className="preview-glass-overlay">
                  <div className="overlay-badge-pill pill-amber">
                    <span>LAUNCH COMPATIBILITY CHECK</span>
                    <span className="arrow">&rarr;</span>
                  </div>
                </div>
              </div>

              <div className="preview-window-footer">
                <div className="preview-footer-pills">
                  <span className="feat-chip chip-amber">3D Exploded PC Cases</span>
                  <span className="feat-chip chip-amber">+65% Gaming FPS Differential</span>
                  <span className="feat-chip chip-amber">Wattage &amp; Budget Delta</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SERVICE 3: COMPATIBILITY CHECKER (2 COLUMNS: LEFT TELEMETRY, RIGHT NARRATIVE) ── */}
        <div id="service-compatibility" className="service-showcase-row left-card-right-text">
          {/* Column 1: Interactive Telemetry Card housed in Precision Lab Frame */}
          <div className="service-card-bay">
            <div
              className="interactive-preview-window telemetry-window"
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
            >
              <div className="preview-window-titlebar">
                <div className="window-dots">
                  <span className="dot dot-red" />
                  <span className="dot dot-yellow" />
                  <span className="dot dot-green" />
                </div>
                <div className="window-url-pill">buildlab.app/compatibility</div>
                <div className="window-status-pill pill-cyan">DUAL AUDIT</div>
              </div>

              <div className="dual-overview-demo">
                <div className="dual-demo-badge">
                  <span className="demo-badge-dot" />
                  <span>HEAD-TO-HEAD COMPATIBILITY AUDIT</span>
                  <span className="demo-badge-bracket">[ ACTIVE COMPARISON ]</span>
                </div>
                <div className="dual-demo-title">DUAL-RIG COMPATIBILITY &amp; PERFORMANCE OVERVIEW</div>
                <div className="dual-demo-subtitle">
                  Real-time differential analysis between Rig 01 (Workbench) and Rig 02 (Custom Manual).
                </div>

                <div className="dual-demo-chart">
                  <div className="demo-rig-card">
                    <div className="demo-ring ring-rig1"><span>Rig 01</span></div>
                    <div className="demo-rig-meta">
                      <div><span>Gaming Rating</span><b>100</b></div>
                      <div><span>Productivity</span><b>88</b></div>
                      <div><span>System Balance</span><b>88</b></div>
                    </div>
                  </div>

                  <div className="demo-radar">
                    <svg viewBox="0 0 160 150" aria-hidden="true">
                      <polygon className="demo-radar-grid" points="80,12 148,58 123,138 37,138 12,58" />
                      <polygon className="demo-radar-grid inner" points="80,42 122,72 106,120 54,120 38,72" />
                      <line className="demo-radar-axis" x1="80" y1="75" x2="80" y2="12" />
                      <line className="demo-radar-axis" x1="80" y1="75" x2="148" y2="58" />
                      <line className="demo-radar-axis" x1="80" y1="75" x2="123" y2="138" />
                      <line className="demo-radar-axis" x1="80" y1="75" x2="37" y2="138" />
                      <line className="demo-radar-axis" x1="80" y1="75" x2="12" y2="58" />
                      <polygon className="demo-radar-fill" points="80,20 138,62 112,130 44,130 22,62" />
                    </svg>
                    <span className="demo-radar-label lbl-cpu">CPU</span>
                    <span className="demo-radar-label lbl-gpu">GPU</span>
                    <span className="demo-radar-label lbl-ram">RAM</span>
                    <span className="demo-radar-label lbl-ssd">SSD</span>
                    <span className="demo-radar-label lbl-psu">PSU</span>
                  </div>

                  <div className="demo-rig-card">
                    <div className="demo-ring ring-rig2"><span>Rig 02</span></div>
                    <div className="demo-rig-meta">
                      <div><span>Gaming Rating</span><b>83</b></div>
                      <div><span>Productivity</span><b>88</b></div>
                      <div><span>System Balance</span><b>88</b></div>
                    </div>
                  </div>
                </div>

                <div className="demo-legend">
                  <span><i className="legend-dot rig1" /> Rig 01 (Workbench)</span>
                  <span><i className="legend-dot rig2" /> Rig 02 (Comparison)</span>
                </div>

                <div className="dual-demo-stats">
                  <div className="demo-stat-row">
                    <div className="demo-stat-head"><span>ESTIMATED SYSTEM WATTAGE</span><small>Combined CPU, GPU &amp; motherboard baseline draw</small></div>
                    <div className="demo-stat-values"><b>380W</b><span className="demo-stat-track"><i style={{ width: "74%" }} /></span><b>310W</b></div>
                    <div className="demo-stat-note">Rig 02 is <b>70W</b> more efficient</div>
                  </div>
                  <div className="demo-stat-row">
                    <div className="demo-stat-head"><span>GAMING BENCHMARK SCORE</span><small>Calculated CPU rasterization, VRAM &amp; single-core clock weighting</small></div>
                    <div className="demo-stat-values"><b>100</b><span className="demo-stat-track"><i style={{ width: "83%" }} /></span><b>83</b></div>
                    <div className="demo-stat-note">Rig 01 leads by <b>+17</b> pts</div>
                  </div>
                  <div className="demo-stat-row">
                    <div className="demo-stat-head"><span>PRODUCTIVITY &amp; RENDERING</span><small>Multi-threaded CPU &amp; RAM bandwidth throughput</small></div>
                    <div className="demo-stat-values"><b>88</b><span className="demo-stat-track"><i style={{ width: "88%" }} /></span><b>88</b></div>
                    <div className="demo-stat-note">Balanced Productivity</div>
                  </div>
                </div>

                <div className="demo-conflict-banner">
                  ⚠ DUAL-CONFIGURATION COMPATIBILITY MATRIX AUDITED — 2 TOTAL CONFLICT(S) DETECTED
                </div>

                <div className="demo-verdict">
                  <strong>BUILDLAB ARCHITECT VERDICT</strong>
                  <p>
                    Rig 01 provides superior graphical horsepower (+17 Gaming Score) with your current component combination. Rig 02 is more energy-conscious, consuming approximately 70W less power.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Editorial Narrative & Action */}
          <div className="service-text-bay">
            <AnimatedHeading
              as="h3"
              className="service-title"
              lines={["Dual-Rig Compatibility", "& Performance Overview"]}
              underline={true}
              underlineClassName="service-underline-cyan"
            />
            <ScrollAIResponseText
              className="service-description"
              text="Real-time differential analysis between Rig 01 (Workbench) and Rig 02 (Custom Manual). Compare wattage, gaming scores, and productivity at a glance while BuildLab audits both configurations for conflicts."
              highlightColor="#38bdf8"
            />

          </div>
        </div>

        {/* ── SERVICE 4: HARDWARE ACADEMY & COURSEWARE (2 COLUMNS: LEFT NARRATIVE, RIGHT CARD) ── */}
        <div id="service-academy" className="service-showcase-row right-card-left-text">
          {/* Column 2: Editorial Narrative & Action */}
          <div className="service-text-bay">
            <AnimatedHeading
              as="h3"
              className="service-title"
              lines={["Learn How to Build a PC", "with Interactive Lessons"]}
              underline={true}
              underlineClassName="service-underline-emerald"
            />
            <ScrollAIResponseText
              className="service-description"
              text="Designed for students and beginners. Learn how computer hardware works through 5 interactive modules and 13 easy lessons. Practice online at your own pace so you can assemble a real PC with confidence without breaking expensive parts."
              highlightColor="#10b981"
            />

          </div>

          {/* Column 1: Interactive Academy Card with Real Screen Preview */}
          <div className="service-card-bay">
            <div
              className="interactive-preview-window window-emerald"
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
              onClick={() => handleAction("/learn")}
              title="Click to enter Hardware Academy"
            >
              <div className="preview-window-titlebar">
                <div className="window-dots">
                  <span className="dot dot-red" />
                  <span className="dot dot-yellow" />
                  <span className="dot dot-green" />
                </div>
                <div className="window-url-pill">buildlab.app/learn</div>
                <div className="window-status-pill pill-emerald">TVL-CSS ALIGNED</div>
              </div>

              <div className="preview-screenshot-container">
                <img
                  src="/assets/preview_learn_page.png"
                  alt="BuildLab Interactive 3D Hardware Assembly Workbench"
                  className="preview-viewport-img"
                  loading="lazy"
                />
                <div className="preview-glass-overlay">
                  <div className="overlay-badge-pill pill-emerald">
                    <span>ENTER 3D HARDWARE ACADEMY</span>
                    <span className="arrow">&rarr;</span>
                  </div>
                </div>
              </div>

              <div className="preview-window-footer">
                <div className="preview-footer-pills">
                  <span className="feat-chip chip-emerald">01 Case &amp; Layout</span>
                  <span className="feat-chip chip-emerald">02 Motherboard &amp; Socket</span>
                  <span className="feat-chip chip-emerald">03 CPU &amp; Paste</span>
                  <span className="feat-chip chip-emerald">04 RAM &amp; NVMe</span>
                  <span className="feat-chip chip-emerald">05 GPU &amp; Power</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SERVICE 5: 3D VIRTUAL PC STUDIO (2 COLUMNS: LEFT 3D PREVIEW, RIGHT NARRATIVE) ── */}
        <div id="service-3d-studio" className="service-showcase-row left-card-right-text">
          {/* Column 2: 3D Studio Preview Card with Real 3D Studio Screen Preview */}
          <div className="service-card-bay">
            <div
              className="interactive-preview-window window-sky"
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
              onClick={() => handleAction("/3d-builder")}
              title="Click to launch 3D PC Studio"
            >
              <div className="preview-window-titlebar">
                <div className="window-dots">
                  <span className="dot dot-red" />
                  <span className="dot dot-yellow" />
                  <span className="dot dot-green" />
                </div>
                <div className="window-url-pill">buildlab.app/3d-builder</div>
                <div className="window-status-pill pill-sky">360&deg; WEBGL ENGINE</div>
              </div>

              <div className="preview-screenshot-container">
                <img
                  src="/assets/preview_studio_page.png"
                  alt="BuildLab 3D Virtual PC Studio Simulator Workbench"
                  className="preview-viewport-img"
                  loading="lazy"
                />
                <div className="preview-glass-overlay">
                  <div className="overlay-badge-pill pill-sky">
                    <span>LAUNCH 3D PC SIMULATOR</span>
                    <span className="arrow">&rarr;</span>
                  </div>
                </div>
              </div>

              <div className="preview-window-footer">
                <div className="preview-footer-pills">
                  <span className="feat-chip chip-sky">Orbit 360&deg; Freecam</span>
                  <span className="feat-chip chip-sky">Exploded Part View</span>
                  <span className="feat-chip chip-sky">Real-time Collision Radar</span>
                  <span className="feat-chip chip-sky">Dynamic ARGB Swatches</span>
                </div>
              </div>
            </div>
          </div>
          {/* Column 1: Editorial Narrative & Action */}
          <div className="service-text-bay">
            <AnimatedHeading
              as="h3"
              className="service-title"
              lines={["Inspect & Assemble", "in Full 360° 3D"]}
              underline={true}
              underlineClassName="service-underline-sky"
            />
            <ScrollAIResponseText
              className="service-description"
              text="Explore your computer in full 3D before you build it in real life. Rotate the case 360 degrees, zoom in on parts, and use Exploded View to see how the motherboard, graphics card, cooler, and fans fit together inside."
              highlightColor="#818cf8"
            />

          </div>

        </div>
      </div>
    </section>
  );
}
