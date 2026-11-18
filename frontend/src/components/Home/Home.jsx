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

const STAGE_META = {
  case: { num: '01', name: 'COMPUTER CASE' },
  motherboard: { num: '02', name: 'MOTHERBOARD' },
  cpu: { num: '03', name: 'CPU & COOLER' },
  ram: { num: '04', name: 'RAM MEMORY' },
  storage: { num: '05', name: 'SSD STORAGE' },
  gpu: { num: '06', name: 'GRAPHICS CARD (GPU)' },
  psu: { num: '07', name: 'POWER SUPPLY (PSU)' },
};

const HERO_DYNAMIC_CONTEXTS = {
  case: {
    tag: "FEATURE 01 // CASE FIT CHECK",
    title: "WILL IT FIT?",
    desc: "Check if your graphics card, cooler, and fans fit inside your PC case before you buy. Never worry about parts being too big.",
  },
  motherboard: {
    tag: "FEATURE 02 // SOCKET MATCHING",
    title: "MATCH CPU & BOARD",
    desc: "Make sure your processor matches your motherboard socket perfectly. Prevent bent pins and wrong purchases automatically.",
  },
  cpu: {
    tag: "FEATURE 03 // PC BUILDING LESSONS",
    title: "LEARN STEP BY STEP",
    desc: "Practice putting a PC together online. Learn how to place your CPU, apply thermal paste, and connect cables safely without breaking real parts.",
  },
  ram: {
    tag: "FEATURE 04 // COMPARE 2 BUILDS",
    title: "COMPARE 2 PCS",
    desc: "Compare two computer builds side by side. See differences in price, gaming speed (FPS), and memory so you get the best value for your budget.",
  },
  storage: {
    tag: "FEATURE 05 // POPULAR BRANDS",
    title: "TRUSTED BRANDS",
    desc: "Pick from trusted brands like Corsair, Kingston, and Cooler Master. All parts are verified to work well together.",
  },
  gpu: {
    tag: "FEATURE 06 // 3D WORKBENCH",
    title: "3D ASSEMBLY STUDIO",
    desc: "Rotate your PC 360 degrees in full 3D. Zoom in, look inside the case, and see exactly where each part goes before you build in real life.",
  },
  psu: {
    tag: "FEATURE 07 // POWER CALCULATOR",
    title: "POWER & WATTAGE",
    desc: "Calculate how much electricity your parts need. We make sure your power supply has enough watts so your computer runs safely and never shuts down.",
  },
};

function Home() {
  const navigate = useNavigate();
  const { toggleSidebar } = useSidebar();
  const { mode, setAppMode, userProfile, unlockedStages, logoutLearner } = useLearnMode();
  const [showModeCards, setShowModeCards] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showTransitionOverlay, setShowTransitionOverlay] = useState(false);
  const [transitionMode, setTransitionMode] = useState("explore");
  const [showLearnerWelcomeBanner, setShowLearnerWelcomeBanner] = useState(false);
  const [welcomeLearnerProfile, setWelcomeLearnerProfile] = useState(null);
  const [activeModel, setActiveModel] = useState('case');
  const [displayedModel, setDisplayedModel] = useState('case');
  const latestActiveModelRef = useRef(activeModel);
  latestActiveModelRef.current = activeModel;
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const [startBuildRequested, setStartBuildRequested] = useState(false);
  const leftColRef = useRef(null);
  const leftContentRef = useRef(null);
  const rightMetaRef = useRef(null);
  const hasClickedBuildRef = useRef(hasSessionUnlockedBuild);

  const isStudentSignedIn = Boolean(
    userProfile && (userProfile.setupCompleted || userProfile.email || userProfile.fullName) && (userProfile.fullName || userProfile.email)
  );

  const unlockBuildScroll = useCallback(() => {
    hasClickedBuildRef.current = true;
    hasSessionUnlockedBuild = true;
  }, []);

  const activeContext = HERO_DYNAMIC_CONTEXTS[displayedModel] || HERO_DYNAMIC_CONTEXTS.case;

  // Phase 1: Smooth GSAP exit animation whenever activeModel changes (no abrupt text snapping)
  useEffect(() => {
    if (activeModel === displayedModel) return;

    const ctx = gsap.context(() => {
      const exitTargets = [leftContentRef.current, rightMetaRef.current].filter(Boolean);

      gsap.to(exitTargets, {
        opacity: 0,
        y: -10,
        duration: 0.22,
        ease: "power2.in",
        onComplete: () => {
          // Switch displayed state only once the outgoing content has fully vanished
          setDisplayedModel(latestActiveModelRef.current);
        },
      });
    });

    return () => ctx.revert();
  }, [activeModel, displayedModel]);

  // Phase 2: Buttery-smooth staggered GSAP entrance animation whenever displayed content is updated
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (leftContentRef.current) {
        const badge = leftContentRef.current.querySelector(".cyber-tag-badge");
        const title = leftContentRef.current.querySelector(".cyber-col-title");
        const desc = leftContentRef.current.querySelector(".cyber-col-desc");
        const btnGroup = leftContentRef.current.querySelector(".cyber-btn-group");
        const items = [badge, title, desc, btnGroup].filter(Boolean);

        // Reset container wrapper
        gsap.set(leftContentRef.current, { opacity: 1, y: 0 });

        // Staggered cascade entrance: badge -> title -> desc -> CTA button
        gsap.fromTo(
          items,
          {
            opacity: 0,
            y: 16,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.44,
            stagger: 0.05,
            ease: "power3.out",
            clearProps: "transform,opacity",
          }
        );
      }

      if (rightMetaRef.current) {
        gsap.fromTo(
          rightMetaRef.current,
          {
            opacity: 0,
            y: -8,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.40,
            ease: "power2.out",
            clearProps: "transform,opacity",
          }
        );
      }
    });

    return () => ctx.revert();
  }, [displayedModel]);

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
    unlockBuildScroll();
    setShowModeCards(true);
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
        brandsStation.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      }
    };

    const handleLearnNavClick = () => {
      try { soundManager.click(); } catch { }
      const hasAccount = Boolean(
        userProfile && (userProfile.fullName || userProfile.email) && userProfile.setupCompleted
      );
      if (hasAccount && mode === "learn") {
        navigate('/learn');
      } else {
        setShowModeCards(true);
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
      const checkAndScrollToBrands = () => {
        if (window.location.hash === "#brands-station") {
          setTimeout(() => {
            const el = document.getElementById("brands-station");
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 250);
        }
      };

      checkAndScrollToBrands();
      window.addEventListener("hashchange", checkAndScrollToBrands);

      return () => {
        window.removeEventListener("scroll", handleScroll);
        window.removeEventListener("hashchange", checkAndScrollToBrands);
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
                  onClick={handleLearnNavClick}
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
                <span className="giant-bg-word">BUILD</span>
                <span className="giant-bg-word giant-bg-lab">
                  <span className="giant-bg-txt">L</span>
                  <span className="giant-bg-logo-slot" aria-hidden="true">
                    <img
                      src={buildlabLogoTight}
                      alt=""
                      className="giant-bg-logo-img"
                      draggable={false}
                    />
                  </span>
                  <span className="giant-bg-txt">B</span>
                </span>
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
                <div className="cyber-editorial-content" ref={leftContentRef}>
                  <div className="cyber-tag-badge">
                    <span className="tag-bracket">[</span>
                    <span className="tag-dot" />
                    <span className="tag-text">{activeContext.tag}</span>
                    <span className="tag-bracket">]</span>
                  </div>
                  <h2 className="cyber-col-title">{activeContext.title}</h2>
                  <p className="cyber-col-desc">{activeContext.desc}</p>
                </div>
              </div>

              <div className="cyber-editorial-col cyber-col-right">
                <div className="cyber-meta-header" ref={rightMetaRef}>
                  <span className="meta-kicker">{STAGE_META[displayedModel]?.name || 'EASY 3D PC BUILDER'}</span>
                  <span className="meta-counter">{STAGE_META[displayedModel]?.num || '01'} / 07</span>
                </div>
                <h2 className="cyber-col-title">BUILDLAB SUITE</h2>
                <p className="cyber-col-desc">
                  Build your dream PC in 3D before you buy. We test every part to make sure your processor fits your motherboard, your cooler fits your case, and your power supply has plenty of wattage.
                </p>
                <div className="cyber-btn-group right-align">
                  <button
                    type="button"
                    className="cyber-btn-outline"
                    onClick={handleOpenCompatibility}
                  >
                    <span>CHECK PART COMPATIBILITY</span>
                    <span className="btn-arrow">&rarr;</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Centered START / RESUME COURSE Action Button */}
            <div className="cyber-hero-center-action">
              {isStudentSignedIn && (
                <div className="hero-learner-status-badge">
                  <span className="learner-dot" />
                  <span>Welcome back, {userProfile.fullName || "Student"} • Grade 11 CSS Track</span>
                  <button
                    type="button"
                    className="hero-switch-free-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      try { soundManager.click(); } catch {}
                      logoutLearner();
                    }}
                    title="Reset website and switch back to Free Mode"
                  >
                    (Back to Free Mode)
                  </button>
                </div>
              )}
              <button
                type="button"
                className={`hud-start-build-btn centered-start-btn ${isStudentSignedIn ? "is-resume-mode" : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  try { soundManager.click(); } catch {}
                  unlockBuildScroll();
                  // If user is already set up in Learn mode or has an active student profile, go directly to Learn page
                  if (isStudentSignedIn || (mode === "learn" && (userProfile?.fullName || userProfile?.email))) {
                    navigate('/learn');
                    return;
                  }
                  // Otherwise open the student certification track modal
                  setShowModeCards(true);
                }}
                title={isStudentSignedIn ? "Resume Course & Return to Learn" : "Start Course"}
              >
                <span className="btn-label">
                  {isStudentSignedIn ? "RESUME COURSE" : "START COURSE"}
                </span>
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
            subtitle="Your Google student profile is connected. Stage 01 (PC Builder) is ready — click below to start your guided tour with B.O.B.!"
            accentColor="#ffffff"
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
