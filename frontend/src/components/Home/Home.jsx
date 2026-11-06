import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import Build from "../Build/Build";
import FullscreenGate from "../FullscreenGate/FullscreenGate";
import Preloader from "./Preloader";
import Home3DHero from "./Home3DHero";
import CyberBrand from "../Navigation/CyberBrand";
import { useSidebar } from "../../contexts/SidebarContext";
import { enterFullscreen } from "../../utilities/fullscreen";
import soundManager from "../../utilities/soundManager";
import systemLogo from "../../assets/system_logo.png";

function Home() {
  const navigate = useNavigate();
  const { toggleSidebar } = useSidebar();
  const [activeModel, setActiveModel] = useState('case');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [startBuildRequested, setStartBuildRequested] = useState(false);

  // ── Scroll-down lock mechanism:
  // Once the user scrolls down into the build station, they are locked from scrolling
  // back up into the hero section until they have clicked BUILD in their page session.
  const [hasClickedBuild, setHasClickedBuild] = useState(() => {
    try {
      return sessionStorage.getItem("buildlab_home_build_clicked") === "true";
    } catch {
      return false;
    }
  });

  const hasClickedBuildRef = useRef(hasClickedBuild);
  const isLockedRef = useRef(false);

  useEffect(() => {
    hasClickedBuildRef.current = hasClickedBuild;
  }, [hasClickedBuild]);

  const unlockBuildScroll = useCallback(() => {
    setHasClickedBuild(true);
    hasClickedBuildRef.current = true;
    isLockedRef.current = false;
    try {
      sessionStorage.setItem("buildlab_home_build_clicked", "true");
    } catch {}
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  }, []);

  const STAGE_META = {
    case: { num: '01', name: 'ATX CHASSIS' },
    motherboard: { num: '02', name: 'ARCHITECTURAL MOTHERBOARD' },
    cpu: { num: '03', name: 'THERMAL SICKLE COOLER' },
    ram: { num: '04', name: 'HIGH-SPEED DDR4 MEMORY' },
    storage: { num: '05', name: 'M.2 NVMe SSD STORAGE' },
    gpu: { num: '06', name: 'DEDICATED TRIPLE GPU' },
    psu: { num: '07', name: 'MODULAR POWER SUPPLY' },
  };

  const handleScrollToBuild = (behavior = "smooth") => {
    unlockBuildScroll();
    try {
      setStartBuildRequested(true);
      window.dispatchEvent(new CustomEvent("buildlab:start-build-clicked"));
    } catch {}
    try {
      soundManager.click();
    } catch {
      // Audio playback fallback
    }
    const scrollBehavior = typeof behavior === "string" ? behavior : "smooth";
    const buildStation = document.getElementById("build-station");
    if (buildStation) {
      try {
        buildStation.scrollIntoView({ behavior: scrollBehavior, block: "start" });
      } catch {
        const top = (window.pageYOffset || 0) + buildStation.getBoundingClientRect().top;
        window.scrollTo({ top, behavior: scrollBehavior });
      }
    }
  };

  const handleLaunch3DStudio = () => {
    soundManager.click();
    enterFullscreen();
    navigate('/3d-builder');
  };

  const handleOpenCompatibility = () => {
    soundManager.click();
    navigate('/compatibility');
  };

  // Intercept START BUILD click events across the app
  useEffect(() => {
    const handleBuildClickedEvent = () => {
      unlockBuildScroll();
    };
    window.addEventListener("buildlab:start-build-clicked", handleBuildClickedEvent);
    return () => window.removeEventListener("buildlab:start-build-clicked", handleBuildClickedEvent);
  }, [unlockBuildScroll]);

  // Clean, robust scroll-down lock
  useEffect(() => {
    const getBuildStationTop = () => {
      const el = document.getElementById("build-station");
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return (window.pageYOffset || window.scrollY || 0) + rect.top;
    };

    const handleScroll = () => {
      const hero = document.getElementById("cyber-hero");
      if (hero) {
        const heroHeight = hero.offsetHeight || window.innerHeight;
        const currentScroll = window.scrollY || window.pageYOffset || 0;
        const progress = Math.min(1, Math.max(0, currentScroll / (heroHeight * 0.85)));
        setScrollProgress(progress);
      }

      if (hasClickedBuildRef.current) {
        if (isLockedRef.current) {
          isLockedRef.current = false;
          document.documentElement.style.overflow = "";
          document.body.style.overflow = "";
        }
        return;
      }

      const buildTop = getBuildStationTop();
      if (buildTop === null) return;
      const currentY = window.scrollY || window.pageYOffset || 0;

      // Lock activates once the user scrolls down into the build station
      if (currentY >= buildTop - 5) {
        if (!isLockedRef.current) {
          isLockedRef.current = true;
          window.scrollTo(0, buildTop);
          document.documentElement.style.overflow = "hidden";
          document.body.style.overflow = "hidden";
        }
      } else if (isLockedRef.current) {
        // If locked, immediately clamp back to buildTop
        window.scrollTo(0, buildTop);
      }
    };

    // Wheel listener to prevent scrolling up when locked
    const handleWheel = (e) => {
      if (hasClickedBuildRef.current) return;
      if (isLockedRef.current && e.deltaY < 0) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // Touch listeners to prevent dragging down to scroll up on touchscreens
    let touchStartY = 0;
    const handleTouchStart = (e) => {
      if (e.touches && e.touches.length > 0) {
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e) => {
      if (hasClickedBuildRef.current) return;
      if (isLockedRef.current && e.touches && e.touches.length > 0) {
        const deltaY = e.touches[0].clientY - touchStartY;
        if (deltaY > 0) {
          if (e.cancelable) e.preventDefault();
          e.stopPropagation();
        }
      }
    };

    // Navigation keys (ArrowUp, PageUp, Home)
    const handleKeyDown = (e) => {
      if (hasClickedBuildRef.current) return;
      if (isLockedRef.current && ["ArrowUp", "PageUp", "Home"].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("keydown", handleKeyDown);

    // Initial check
    handleScroll();

    // Support direct hash navigation (e.g. /#build-station)
    if (window.location.hash === "#build-station" || window.location.search.includes("scroll=build")) {
      setTimeout(() => {
        handleScrollToBuild("instant");
      }, 400);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("keydown", handleKeyDown);
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [unlockBuildScroll]);

  const handleNavigateHome = () => {
    if (isLockedRef.current && !hasClickedBuildRef.current) {
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <Preloader />
      <FullscreenGate>
        <div className="home-page">
        <section id="cyber-hero" className="cyber-hero-section">
          <div className="cyber-ambient-pink-spot" />
          <div className="cyber-ambient-grid" />

          <header className="cyber-top-nav">
            <CyberBrand onNavigateHome={handleNavigateHome} />

            <nav className="cyber-nav-links">
              <button 
                type="button" 
                className="cyber-nav-link active" 
                onClick={handleNavigateHome}
              >
                HOME
              </button>
              <button 
                type="button" 
                className="cyber-nav-link" 
                onClick={(e) => {
                  e.preventDefault();
                  handleScrollToBuild("smooth");
                }}
              >
                BUILD
              </button>
              <button 
                type="button" 
                className="cyber-nav-link" 
                onClick={handleLaunch3DStudio}
              >
                3D STUDIO
              </button>
              <button 
                type="button" 
                className="cyber-nav-link" 
                onClick={handleOpenCompatibility}
              >
                COMPATIBILITY
              </button>
              <button 
                type="button" 
                className="cyber-nav-link" 
                onClick={() => { soundManager.click(); navigate('/learn'); }}
              >
                LEARN
              </button>
              <button 
                type="button" 
                className="cyber-nav-link" 
                onClick={() => { soundManager.click(); navigate('/brands'); }}
              >
                BRANDS
              </button>
              <button 
                type="button" 
                className="cyber-nav-link" 
                onClick={() => { soundManager.click(); navigate('/about'); }}
              >
                ABOUT US
              </button>
            </nav>

            <div className="cyber-nav-actions">
              <button 
                type="button" 
                className="cyber-search-btn" 
                onClick={(e) => {
                  e.preventDefault();
                  handleScrollToBuild("smooth");
                }}
                title="Search Components"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
            </div>
          </header>

          <aside className="cyber-left-rail">
            <div className="rail-top-icon" onClick={toggleSidebar} title="Toggle Command Deck [ [ ]" style={{ cursor: "pointer" }}>
              <span className="cyber-square-icon" />
            </div>
            <div className="rail-vertical-label">BUILDLAB // HARDWARE LAB</div>
            <div 
              className="rail-scroll-indicator" 
              onClick={(e) => {
                e.preventDefault();
                handleScrollToBuild("smooth");
              }}
              style={{ cursor: "pointer" }}
            >
              <span className="scroll-pulse-dot" />
              <span className="scroll-v-text">SCROLL DOWN</span>
              <span className="scroll-v-line" />
            </div>
          </aside>

          <div 
            className="cyber-giant-text-backdrop"
            style={{ 
              transform: `translate(-50%, calc(-50% + ${scrollProgress * 90}px)) scale(${1 - scrollProgress * 0.08})`,
              opacity: Math.max(0.15, 1 - scrollProgress * 1.2)
            }}
          >
            <h1 className="giant-bg-text">BUILDLAB</h1>
          </div>

          <div className="cyber-canvas-stage">
            <Home3DHero 
              activeModel={activeModel}
              setActiveModel={setActiveModel}
              rgbColor="#f43f5e" 
              scrollProgress={scrollProgress} 
            />
          </div>

          <div className="cyber-editorial-grid">
            <div className="cyber-editorial-col cyber-col-left">
              <div className="cyber-tag-badge">
                <span className="tag-bracket">[</span>
                <span className="tag-dot" />
                <span className="tag-text">STUDENT & BUILDER ACADEMY</span>
                <span className="tag-bracket">]</span>
              </div>
              <h2 className="cyber-col-title">LEARN HARDWARE</h2>
              <p className="cyber-col-desc">
                Master PC architecture through hands-on virtual assembly. Understand component hierarchies, socket clearances, pinouts, and thermal dynamics with guided interactive lessons designed for students and enthusiasts.
              </p>
              <div className="cyber-btn-group">
                <button 
                  type="button" 
                  className="cyber-btn-primary"
                  onClick={() => { soundManager.click(); navigate('/learn'); }}
                >
                  <span>EXPLORE LEARN LAB</span>
                  <span className="btn-notch">///</span>
                </button>
              </div>
            </div>

            <div className="cyber-editorial-col cyber-col-right">
              <div className="cyber-meta-header">
                <span className="meta-kicker">{STAGE_META[activeModel]?.name || 'NEXT-GEN HARDWARE SIMULATOR'}</span>
                <span className="meta-counter">{STAGE_META[activeModel]?.num || '01'} / 07</span>
              </div>
              <h2 className="cyber-col-title">BUILDLAB SUITE</h2>
              <p className="cyber-col-desc">
                An intelligent 3D computer engineering workspace. Plan, customize, and validate high-performance rigs with real-time socket matching, TDP thermal auditing, and zero bottleneck tolerance before you buy physical parts.
              </p>
              <div className="cyber-btn-group right-align">
                <button 
                  type="button" 
                  className="cyber-btn-outline"
                  onClick={handleOpenCompatibility}
                >
                  <span>COMPATIBILITY MATRIX</span>
                  <span className="btn-arrow">&rarr;</span>
                </button>
              </div>
            </div>
          </div>

          <div className="cyber-hud-bar">
            <div className="hud-metric-item">
              <div className="hud-radar-dial">
                <div className="radar-sweep" />
                <div className="radar-core-dot" />
              </div>
              <div className="hud-metric-text">
                <span className="hud-metric-label">ACTIVE RIG</span>
                <span className="hud-metric-val">+7 HARDWARE STAGES</span>
                <span className="hud-metric-sub">Modular snap-fit validation</span>
              </div>
            </div>

            <div className="hud-divider" />

            <div className="hud-metric-item">
              <div className="hud-status-pulse">
                <span className="pulse-ring" />
                <span className="pulse-center" />
              </div>
              <div className="hud-metric-text">
                <span className="hud-metric-label">COMPATIBILITY</span>
                <span className="hud-metric-val val-green">100% VERIFIED</span>
                <span className="hud-metric-sub">Zero socket or TDP conflicts</span>
              </div>
            </div>

            <div className="hud-divider" />

            <div className="hud-metric-item">
              <div className="hud-chip-badge">
                <span>3D</span>
              </div>
              <div className="hud-metric-text">
                <span className="hud-metric-label">SIMULATION ENGINE</span>
                <span className="hud-metric-val">THREE.JS WEBGL</span>
                <span className="hud-metric-sub">Physically based rendering</span>
              </div>
            </div>

            <button 
              type="button" 
              className="hud-start-build-btn"
              onClick={(e) => {
                e.preventDefault();
                handleScrollToBuild("smooth");
              }}
              title="Launch 2D Workbench"
            >
              <span className="btn-label">START BUILD</span>
              <span className="btn-arrow">&rarr;</span>
            </button>
          </div>
        </section>

        <section id="build-station" className="home-integrated-section">
          <Build isIntegrated={true} startBuildRequested={startBuildRequested} onBuildInteracted={unlockBuildScroll} />
        </section>
      </div>
    </FullscreenGate>
  </>
  );
}

export default Home;
