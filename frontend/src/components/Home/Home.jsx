import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { gsap } from "gsap";
import "./Home.css";
import Brands from "../Brands/Brands";
import Build from "../Build/Build";
import Footer from "../Footer/Footer";
import Home3DHero from "./Home3DHero";
import PlatformServices from "./PlatformServices";
import CyberBrand from "../Navigation/CyberBrand";
import StageUnlockBanner from "../Navigation/StageUnlockBanner";
import AccountSetupModal from "./AccountSetupModal";
import ModeSelectionCards from "./ModeSelectionCards";
import RigPickerTransitionOverlay from "./RigPickerTransitionOverlay";
import { useSidebar } from "../../contexts/SidebarContext";
import { useLearnMode } from "../../contexts/LearnModeContext";
import { enterFullscreen } from "../../utilities/fullscreen";
import soundManager from "../../utilities/soundManager";
import systemLogo from "../../assets/system_logo.png";
import buildlabLogoTight from "../../assets/buildlab_logo_tight.png";

// Module-level in-memory lock state:
// The home/hero section is strictly locked until the user clicks START BUILD for the first time.
// Persists across internal page navigation (e.g. Home -> About -> Home),
// but resets to false whenever the user reloads the website with CTRL+R.
let hasSessionUnlockedBuild = false;

function Home() {
  const navigate = useNavigate();
  const { toggleSidebar } = useSidebar();
  const { mode, setAppMode, userProfile, unlockedStages } = useLearnMode();
  const [showModeCards, setShowModeCards] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showTransitionOverlay, setShowTransitionOverlay] = useState(false);
  const [transitionMode, setTransitionMode] = useState("explore");
  const [showLearnerWelcomeBanner, setShowLearnerWelcomeBanner] = useState(false);
  const [welcomeLearnerProfile, setWelcomeLearnerProfile] = useState(null);
  const [activeModel, setActiveModel] = useState('case');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const [startBuildRequested, setStartBuildRequested] = useState(false);
  const leftColRef = useRef(null);

  const activeContext = HERO_DYNAMIC_CONTEXTS[activeModel] || HERO_DYNAMIC_CONTEXTS.case;

  // Seamlessly transition left editorial context in sync with 3D model rotation
  useEffect(() => {
    if (leftColRef.current) {
      gsap.fromTo(
        leftColRef.current,
        { opacity: 0.35, y: 10 },
        { opacity: 1, y: 0, duration: 0.55, ease: "power2.out" }
      );
    }
  }, [activeModel]);

  const handleHeroDynamicScroll = (targetSection) => {
    try { soundManager.click(); } catch {}
    const target = document.getElementById(targetSection);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      navigate("/compatibility");
    }
  };

  const handleSelectMode = (targetMode) => {
    if (targetMode === "learn") {
      if (userProfile?.setupCompleted) {
        try { soundManager.granted(); } catch {}
        setAppMode("learn");
        try {
          sessionStorage.setItem(
            "buildlab_pending_learner_welcome",
            userProfile.fullName || "Builder"
          );
        } catch { }
        setWelcomeLearnerProfile(userProfile);
        setTransitionMode("learn");
        setShowTransitionOverlay(true);
      } else {
        try { soundManager.click(); } catch {}
        setShowAccountModal(true);
      }
    } else {
      try { soundManager.click(); } catch {}
      setAppMode("explore");
    }
  };

  const handleStartBuildTrigger = () => {
    // Always present the 2 Mode Selection Cards on START BUILD so the user can choose or switch modes
    try { soundManager.click(); } catch { }
    setShowModeCards(true);
  };

  const STAGE_META = {
    case: { num: '01', name: 'ATX CHASSIS' },
    motherboard: { num: '02', name: 'ARCHITECTURAL MOTHERBOARD' },
    cpu: { num: '03', name: 'THERMAL SICKLE COOLER' },
    ram: { num: '04', name: 'HIGH-SPEED DDR4 MEMORY' },
    storage: { num: '05', name: 'M.2 NVMe SSD STORAGE' },
    gpu: { num: '06', name: 'DEDICATED TRIPLE GPU' },
    psu: { num: '07', name: 'MODULAR POWER SUPPLY' },
  };

  const HERO_DYNAMIC_CONTEXTS = {
    case: {
      tag: "CAPABILITY 01 // RULES ENGINE",
      title: "CLEARANCE AUDIT",
      desc: "Real-time physical chassis inspection. Evaluate GPU millimeter length clearances, CPU cooler height margins, and unobstructed airflow channels before assembly.",
      btnLabel: "AUDIT COMPATIBILITY",
      targetSection: "service-compatibility",
    },
    motherboard: {
      tag: "CAPABILITY 01 // SOCKET MATCHING",
      title: "ZERO-PIN CONFLICT",
      desc: "Mathematical socket validation cross-checking Intel LGA1700, AMD AM5, and PCIe lane bifurcation curves with zero tolerance for damaged pins.",
      btnLabel: "INSPECT SOCKET RULES",
      targetSection: "service-compatibility",
    },
    cpu: {
      tag: "CAPABILITY 03 // STUDENT ACADEMY",
      title: "HARDWARE ACADEMY",
      desc: "Interactive TVL-CSS NC II accredited courseware. Practice processor seating, gold-notch orientation, and thermal paste patterns without risking fragile hardware.",
      btnLabel: "ENTER HARDWARE ACADEMY",
      targetSection: "service-academy",
    },
    ram: {
      tag: "CAPABILITY 02 // DUAL-RIG BENCHMARK",
      title: "COMPARE 2 RIGS",
      desc: "Side-by-side performance benchmarking. Directly contrast DDR4 vs DDR5 bandwidth curves, gaming FPS projections, and budget-to-value compute ratios.",
      btnLabel: "COMPARE HARDWARE RIGS",
      targetSection: "service-compare",
    },
    storage: {
      tag: "HARDWARE ECOSYSTEM // BRANDS",
      title: "CERTIFIED BRANDS",
      desc: "Verified high-speed NVMe PCIe Gen4 components from Corsair, Kingston, and Cooler Master audited for heatsink clearances and sustained thermal envelopes.",
      btnLabel: "BROWSE VERIFIED BRANDS",
      targetSection: "brands-station",
    },
    gpu: {
      tag: "CAPABILITY 04 // THREE.JS SIMULATION",
      title: "3D VIRTUAL STUDIO",
      desc: "Experience true physics-based assembly simulation in full 360-degree OrbitControls with exploded component hierarchies and live clearance telemetry.",
      btnLabel: "OPEN 3D STUDIO PREVIEW",
      targetSection: "service-3d-studio",
    },
    psu: {
      tag: "CAPABILITY 01 // POWER BUDGET SAFEGUARD",
      title: "DYNAMIC TDP AUDITING",
      desc: "Automated power dissipation analysis. Calculates dynamic transient wattage headroom with safe 80+ Gold capacity buffers before connecting physical power.",
      btnLabel: "AUDIT SYSTEM TDP",
      targetSection: "service-compatibility",
    },
  };

    const handleScrollToBuild = (behavior = "smooth", forceUnlock = false) => {
      if (!hasClickedBuildRef.current && !forceUnlock) {
        handleStartBuildTrigger();
        return;
      }
      unlockBuildScroll();
      try {
        setStartBuildRequested(true);
        window.dispatchEvent(new CustomEvent("buildlab:start-build-clicked"));
      } catch { }
      try {
        soundManager.click();
      } catch {
        // Audio playback fallback
      }
      navigate('/build');
    };

    const handleScrollToBrands = () => {
      try { soundManager.click(); } catch { }
      const brandsStation = document.getElementById("brands-station");
      if (brandsStation) {
        unlockBuildScroll();
        brandsStation.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        navigate('/brands');
      }
    };

    const handleLaunch3DStudio = () => {
      if (mode === "learn" && !unlockedStages.includes("studio") && !unlockedStages.includes("3d")) {
        soundManager.warning();
        alert("3D Studio unlocks as the final engineering milestone in Learn Mode! Complete your 2D build, compatibility, and lessons first, or switch to Explore Mode.");
        return;
      }
      soundManager.click();
      enterFullscreen();
      navigate('/3d-builder');
    };

    const handleOpenCompatibility = () => {
      try { soundManager.click(); } catch {}
      navigate('/compatibility');
    };

    // Fluid, unlocked scrolling across the home page and services
    useEffect(() => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";

      const handleScroll = () => {
        const currentScroll = window.scrollY || window.pageYOffset || 0;
        setIsScrolledDown(currentScroll > 90);

        const hero = document.getElementById("cyber-hero");
        if (hero) {
          const heroHeight = hero.offsetHeight || window.innerHeight;
          const progress = Math.min(1, Math.max(0, currentScroll / (heroHeight * 0.85)));
          setScrollProgress(progress);
        }
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      handleScroll();

      // Support direct hash navigation (e.g. /#brands-station)
      if (window.location.hash === "#brands-station") {
        setTimeout(() => {
          const el = document.getElementById("brands-station");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }, 400);
      }

      return () => {
        window.removeEventListener("scroll", handleScroll);
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
      };
    }, []);

    const handleNavigateHome = () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
      <>
        <div className="home-page">
          <section id="cyber-hero" className="cyber-hero-section">
            <div className="cyber-ambient-pink-spot" />
            <div className="cyber-ambient-grid" />

            <header className={`cyber-top-nav ${isScrolledDown ? "is-scrolled" : ""}`}>
              <CyberBrand onNavigateHome={handleNavigateHome} />

              <nav className="cyber-nav-links">
                <button
                  type="button"
                  className="cyber-nav-link active"
                  onClick={handleNavigateHome}
                >
                  HOME
                </button>
                {/* BUILD: Removed per user request */}
                {/* 3D STUDIO: Button Gone per user request */}
                {isScrolledDown && (
                  <button
                    type="button"
                    className="cyber-nav-link nav-reveal-item"
                    onClick={handleOpenCompatibility}
                  >
                    COMPATIBILITY
                  </button>
                )}
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
                  onClick={handleScrollToBrands}
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
              <h1 className="giant-bg-text" aria-label="BUILDLAB">
                <span className="giant-bg-txt">BUILDL</span>
                <span className="giant-bg-logo-slot" aria-hidden="true">
                  <img
                    src={buildlabLogoTight}
                    alt=""
                    className="giant-bg-logo-img"
                    draggable={false}
                  />
                </span>
                <span className="giant-bg-txt">B</span>
              </h1>
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
              <div className="cyber-editorial-col cyber-col-left" ref={leftColRef}>
                <div className="cyber-tag-badge">
                  <span className="tag-bracket">[</span>
                  <span className="tag-dot" />
                  <span className="tag-text">{activeContext.tag}</span>
                  <span className="tag-bracket">]</span>
                </div>
                <h2 className="cyber-col-title">{activeContext.title}</h2>
                <p className="cyber-col-desc">{activeContext.desc}</p>
                <div className="cyber-btn-group">
                  <button
                    type="button"
                    className="cyber-btn-primary"
                    onClick={() => handleHeroDynamicScroll(activeContext.targetSection)}
                    title={`Explore ${activeContext.title}`}
                  >
                    <span>{activeContext.btnLabel}</span>
                    <span className="btn-notch">&darr;</span>
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

            {/* Centered START COURSE Action Button */}
            <div className="cyber-hero-center-action">
              <button
                type="button"
                className="hud-start-build-btn centered-start-btn"
                onClick={(e) => {
                  e.preventDefault();
                  try { soundManager.click(); } catch {}
                  // If user is already set up in Learn mode, go directly to Learn page
                  if (mode === "learn" && (userProfile?.fullName || userProfile?.email)) {
                    navigate('/learn');
                    return;
                  }
                  // Otherwise open the student certification track modal
                  setShowModeCards(true);
                }}
                title="Start Course"
              >
                <span className="btn-label">START COURSE</span>
                <span className="btn-arrow">&rarr;</span>
              </button>
              <div className="hero-legal-links">
                <Link to="/privacy">Privacy Policy</Link>
                <span>&middot;</span>
                <Link to="/terms">Terms of Service</Link>
                <span>&middot;</span>
                <Link to="/cookies">Cookie Policy</Link>
              </div>
            </div>
          </section>

          {/* ── Platform Capabilities & Services Showcase ── */}
          <PlatformServices />

          {/* ── Certified Hardware Ecosystem & Brands ── */}
          <section id="brands-station" className="home-brands-section">
            <Brands isIntegrated={true} />
          </section>

          {/* ── Global Footer ── */}
          <Footer />
        </div>

        {/* ── 2-Card Mode Selection (Split Staggered Reveal + PixelCanvas Hover) ── */}
        <ModeSelectionCards
          isOpen={showModeCards}
          onClose={() => setShowModeCards(false)}
          onSelectLearn={() => {
            setShowModeCards(false);
            setShowAccountModal(true);
          }}
          onSelectFree={() => {
            setShowModeCards(false);
            unlockBuildScroll();
            setAppMode("explore");
            setTransitionMode("explore");
            setShowTransitionOverlay(true);
          }}
        />

        {/* ── Google Sign-In & Name Verification Modal ── */}
        <AccountSetupModal
          isOpen={showAccountModal}
          onClose={() => setShowAccountModal(false)}
          onConfirmed={(targetMode, confirmedProfile) => {
            setShowAccountModal(false);
            unlockBuildScroll();
            if (targetMode === "explore") {
              setAppMode("explore");
              setTransitionMode("explore");
              setShowTransitionOverlay(true);
            } else {
              setAppMode("learn");
              setWelcomeLearnerProfile(confirmedProfile || userProfile);
              setTransitionMode("learn");
              setShowTransitionOverlay(true);
            }
          }}
        />
        {/* ── Rig Component Picker Transition Overlay ── */}
        <RigPickerTransitionOverlay
          isOpen={showTransitionOverlay}
          mode={transitionMode}
          learnerName={welcomeLearnerProfile?.fullName || userProfile?.fullName || ""}
          onComplete={() => {
            setShowTransitionOverlay(false);
            unlockBuildScroll();
            if (transitionMode === "learn") {
              navigate("/learn");
            } else {
              navigate("/build");
            }
          }}
        />

        {/* ── Interactive Learner Welcome & Stage 01 Readiness Banner ── */}
        {showLearnerWelcomeBanner && (
          <StageUnlockBanner
            stageKey="build"
            stageNumber="01"
            badge="LEARN TRACK // STAGE 01 READY"
            title={`WELCOME, ${(
              welcomeLearnerProfile?.fullName ||
              userProfile?.fullName ||
              "BUILDER"
            ).toUpperCase()}!`}
            subtitle="Your Google student profile is synced. Stage 01 (2D Rig Assembly) is ready — click below when you are settled in Full Screen so B.O.B. can start your guided tour!"
            accentColor="#00e5a0"
            requireConfirm={true}
            autoFullscreenOnConfirm={true}
            learnerProfile={welcomeLearnerProfile || userProfile}
            onComplete={() => {
              setShowLearnerWelcomeBanner(false);
              const finalName =
                welcomeLearnerProfile?.fullName ||
                userProfile?.fullName ||
                "Builder";
              try {
                sessionStorage.removeItem("buildlab_pending_learner_welcome");
                window.dispatchEvent(
                  new CustomEvent("buildlab:learner-onboarding-welcome", {
                    detail: { name: finalName },
                  })
                );
              } catch { }
            }}
          />
        )}
      </>
    );
  }

  export default Home;
