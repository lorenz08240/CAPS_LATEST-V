import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLearnMode } from "../../contexts/LearnModeContext";
import soundManager from "../../utilities/soundManager";
import "./PlatformServices.css";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

export default function PlatformServices() {
  const navigate = useNavigate();
  const { userProfile, mode } = useLearnMode();
  const isStudentSignedIn = Boolean(
    userProfile && (userProfile.setupCompleted || userProfile.email || userProfile.fullName) && (userProfile.fullName || userProfile.email)
  );
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
                <div className="window-status-pill pill-cyan">LIVE CHECKER v2.4</div>
              </div>

              <div className="telemetry-demo-card">
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

        {/* ── SERVICE 2: COMPATIBILITY CHECK & COMPARE (2 COLUMNS: LEFT NARRATIVE, RIGHT COMPARISON CARD) ── */}
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
                onClick={() => handleAction("/compatibility")}
              >
                <span>COMPARE TWO PCS NOW</span>
                <span className="btn-arrow">&rarr;</span>
              </button>
            </div>
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

        {/* ── SERVICE 3: HARDWARE ACADEMY & COURSEWARE (2 COLUMNS: LEFT CARD, RIGHT NARRATIVE) ── */}
        <div id="service-academy" className="service-showcase-row left-card-right-text">
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
                <span>{isStudentSignedIn ? "RESUME LEARNING LESSONS" : "START LEARNING LESSONS"}</span>
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
        </div>
      </div>
    </section>
  );
}
