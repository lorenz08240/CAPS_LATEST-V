import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Home.css";
import Brands from "../Brands/Brands";
import Build from "../Build/Build";
import Footer from "../Footer/Footer";
import Home3DHero from "./Home3DHero";
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
  const [startBuildRequested, setStartBuildRequested] = useState(false);

  // ── Hero Section Scroll-Down Lock Mechanism:
  // When the user enters the Hero section, scrolling down is locked until they press START BUILD.
  // Once they press START BUILD, the page unlocks, smoothly scrolls to the build station (so B.O.B.
  // gets his proper introduction), and the user can freely scroll up and down until CTRL+R reload.
  const [hasClickedBuild, setHasClickedBuild] = useState(() => hasSessionUnlockedBuild);
  const hasClickedBuildRef = useRef(hasSessionUnlockedBuild);

  useEffect(() => {
    hasClickedBuildRef.current = hasClickedBuild;
  }, [hasClickedBuild]);

  const unlockBuildScroll = useCallback(() => {
    hasSessionUnlockedBuild = true;
    setHasClickedBuild(true);
    hasClickedBuildRef.current = true;
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  }, []);

  const handleSelectMode = (targetMode) => {
    if (targetMode === "learn") {
      if (userProfile?.setupCompleted) {
        soundManager.granted();
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
        handleScrollToBuild("smooth", true);
      } else {
        soundManager.click();
        setShowAccountModal(true);
      }
    } else {
      soundManager.click();
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
      if (mode === "learn" && !unlockedStages.includes("compatibility")) {
        soundManager.warning();
        alert("Compatibility Matrix is locked! Mount all 7 parts in the 2D Builder first.");
        handleScrollToBuild("smooth");
        return;
      }
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

    // Lock scrolling down until user presses START BUILD
    useEffect(() => {
      const applyInitialLock = () => {
        if (!hasClickedBuildRef.current) {
          document.documentElement.style.overflow = "hidden";
          document.body.style.overflow = "hidden";
          if (window.scrollY > 0) {
            window.scrollTo(0, 0);
          }
        } else {
          document.documentElement.style.overflow = "";
          document.body.style.overflow = "";
        }
      };

      applyInitialLock();

      const handleScroll = () => {
        const hero = document.getElementById("cyber-hero");
        if (hero) {
          const heroHeight = hero.offsetHeight || window.innerHeight;
          const currentScroll = window.scrollY || window.pageYOffset || 0;
          const progress = Math.min(1, Math.max(0, currentScroll / (heroHeight * 0.85)));
          setScrollProgress(progress);
        }

        if (!hasClickedBuildRef.current) {
          const currentY = window.scrollY || window.pageYOffset || 0;
          if (currentY > 0) {
            window.scrollTo(0, 0);
          }
        }
      };

      // Helper: detect if event is inside any scrollable modal/dialog or child container
      const isInsideScrollableOrModal = (target) => {
        if (!target || !(target instanceof Element)) return false;
        if (
          target.closest(
            '.cookie-prefs-overlay, .cookie-prefs-dialog, .account-modal-overlay, [role="dialog"], [data-scrollable="true"]'
          )
        ) {
          return true;
        }
        let el = target;
        while (el && el !== document.body && el !== document.documentElement) {
          const style = window.getComputedStyle(el);
          const overflowY = style.overflowY;
          if ((overflowY === "auto" || overflowY === "scroll") && el.scrollHeight > el.clientHeight) {
            return true;
          }
          el = el.parentElement;
        }
        return false;
      };

      // Intercept wheel scrolling down
      const handleWheel = (e) => {
        if (isInsideScrollableOrModal(e.target)) return;
        if (!hasClickedBuildRef.current && e.deltaY > 0) {
          e.preventDefault();
          e.stopPropagation();
        }
      };

      // Intercept touch swiping up (which scrolls page down)
      let touchStartY = 0;
      const handleTouchStart = (e) => {
        if (e.touches && e.touches.length > 0) {
          touchStartY = e.touches[0].clientY;
        }
      };

      const handleTouchMove = (e) => {
        if (isInsideScrollableOrModal(e.target)) return;
        if (!hasClickedBuildRef.current && e.touches && e.touches.length > 0) {
          const deltaY = e.touches[0].clientY - touchStartY;
          if (deltaY < 0) {
            if (e.cancelable) e.preventDefault();
            e.stopPropagation();
          }
        }
      };

      // Intercept navigation keys that scroll down (ArrowDown, PageDown, Space)
      const handleKeyDown = (e) => {
        if (isInsideScrollableOrModal(document.activeElement || e.target)) return;
        if (!hasClickedBuildRef.current && ["ArrowDown", "PageDown", "Space", " "].includes(e.key)) {
          e.preventDefault();
          e.stopPropagation();
        }
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      window.addEventListener("wheel", handleWheel, { passive: false });
      window.addEventListener("touchstart", handleTouchStart, { passive: true });
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("keydown", handleKeyDown);

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
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
      <>
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
                {mode !== "explore" && (
                  <button
                    type="button"
                    className="cyber-nav-link"
                    onClick={(e) => {
                      e.preventDefault();
                      if (!hasClickedBuildRef.current) {
                        handleStartBuildTrigger();
                      } else {
                        handleScrollToBuild("smooth");
                      }
                    }}
                  >
                    BUILD
                  </button>
                )}
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
                {mode !== "explore" && (
                  <button
                    type="button"
                    className="cyber-nav-link"
                    onClick={handleScrollToBrands}
                  >
                    BRANDS
                  </button>
                )}
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
                  className={`cyber-mode-badge-btn ${mode === 'learn' ? 'mode-badge-learn' : 'mode-badge-explore'}`}
                  onClick={() => setShowAccountModal(true)}
                  title="Click to switch or configure operating mode"
                >
                  <span className="badge-pulse-dot" />
                  <span className="badge-mode-text">
                    {mode === 'learn' ? '🎓 LEARN TRACK' : mode === 'explore' ? '🚀 FREE WORKBENCH' : '⚡ SELECT MODE'}
                  </span>
                </button>

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
                    onClick={() => {
                      if (mode === "explore") {
                        soundManager.click();
                        navigate('/learn');
                      } else {
                        handleSelectMode("learn");
                      }
                    }}
                  >
                    <span>{mode === 'explore' ? 'EXPLORE LEARN LAB' : 'START LEARN TRACK'}</span>
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
                    <span>{mode === 'learn' && !unlockedStages.includes('compatibility') ? 'COMPATIBILITY MATRIX 🔒' : 'COMPATIBILITY MATRIX'}</span>
                    <span className="btn-arrow">&rarr;</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Centered START BUILD Action Button (Green Box, Metrics & Dock Removed) */}
            <div className="cyber-hero-center-action">
              <button
                type="button"
                className="hud-start-build-btn centered-start-btn"
                onClick={(e) => {
                  e.preventDefault();
                  if (!hasClickedBuildRef.current) {
                    handleStartBuildTrigger();
                  } else if (mode === "learn") {
                    handleScrollToBuild("smooth");
                  } else {
                    navigate('/build');
                  }
                }}
                title="Launch 2D Workbench"
              >
                <span className="btn-label">START BUILD</span>
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

          {mode === "learn" ? (
            <section id="build-station" className="home-integrated-section">
              <Build isIntegrated={true} startBuildRequested={startBuildRequested} onBuildInteracted={unlockBuildScroll} />
            </section>
          ) : (
            <>
              <section id="brands-station" className="home-brands-section">
                <Brands isIntegrated={true} />
              </section>
              <Footer />
            </>
          )}
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
            const hasPendingWelcome =
              transitionMode === "learn" ||
              (typeof sessionStorage !== "undefined" &&
                Boolean(sessionStorage.getItem("buildlab_pending_learner_welcome")));
            if (hasPendingWelcome || transitionMode === "learn") {
              setShowLearnerWelcomeBanner(true);
              handleScrollToBuild("smooth");
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
