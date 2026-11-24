import React, { useState, useEffect, useRef, useCallback, Suspense, lazy } from "react";
import { useNavigate, Link } from "react-router-dom";
import { gsap } from "gsap";
import "./Home.css";
const Brands = lazy(() => import("../Brands/Brands"));
import Build from "../Build/Build";
import Footer from "../Footer/Footer";
import Home3DHero from "./Home3DHero";
import PlatformServices from "./PlatformServices";
import CyberBrand from "../Navigation/CyberBrand";
import StageUnlockBanner from "../Navigation/StageUnlockBanner";
import ModeSelectionCards from "./ModeSelectionCards";
import RigPickerTransitionOverlay from "./RigPickerTransitionOverlay";
import { useLearnMode } from "../../contexts/LearnModeContext";
import { enterFullscreen } from "../../utilities/fullscreen";
import soundManager from "../../utilities/soundManager";
import useGoogleSignIn from "../../utilities/useGoogleSignIn";
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
  const { mode, setAppMode, userProfile, unlockedStages } = useLearnMode();
  const [showModeCards, setShowModeCards] = useState(false);
  const [showTransitionOverlay, setShowTransitionOverlay] = useState(false);

  const { signIn, isLinking, error: authError } = useGoogleSignIn({
    onSuccess: (profile) => {
      setShowModeCards(false);
      setAppMode("learn");
      setWelcomeLearnerProfile(profile || userProfile);
      setTransitionMode("learn");
      setShowTransitionOverlay(true);
    },
  });

  const [transitionMode, setTransitionMode] = useState("explore");
  const [showLearnerWelcomeBanner, setShowLearnerWelcomeBanner] = useState(false);
  const [welcomeLearnerProfile, setWelcomeLearnerProfile] = useState(null);
  const [activeModel, setActiveModel] = useState('case');
  const [displayedModel, setDisplayedModel] = useState('case');
  const latestActiveModelRef = useRef(activeModel);
  latestActiveModelRef.current = activeModel;
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const [showLearnNav, setShowLearnNav] = useState(false);
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
      const academySection = document.getElementById("service-academy");
      if (academySection) {
        academySection.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      }
    };

    const handleCompatibilityNavClick = () => {
      try { soundManager.click(); } catch { }

      // Hero/top: direct entrance into the Compatibility screen.
      // Once scrolled: land on the "Compare Two PC Builds Side by Side" area
      // on this page, not the smaller compatibility card further down.
      if (isScrolledDown) {
        const compareSection = document.getElementById("service-compare");
        if (compareSection) {
          compareSection.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }
      }

      navigate('/compatibility');
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
        // Hysteresis: turn on at 40px, off only below 8px. A single threshold
        // makes tiny scroll jitter retrigger the nav crossfade.
        setIsScrolledDown((prev) => (prev ? currentScroll > 8 : currentScroll > 40));

        // LEARN nav item only appears once the services/course plate comes into view.
        const servicesPlate = document.getElementById("platform-services");
        if (servicesPlate) {
          setShowLearnNav(servicesPlate.getBoundingClientRect().top < window.innerHeight * 0.7);
        }

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

            {/* Persistent layout anchor ensures zero layout jerk when top navbar is fixed */}
            <div className="cyber-top-nav-placeholder" aria-hidden="true" />

            <header className={`cyber-top-nav ${isScrolledDown ? "is-scrolled" : ""}`}>
              <CyberBrand onNavigateHome={handleNavigateHome} />

              <nav className="cyber-nav-links" aria-label="BuildLab Primary Navigation">
                <button
                  type="button"
                  className="cyber-nav-link active"
                  onClick={handleNavigateHome}
                >
                  HOME
                </button>

                {/* Morph Item 1: COMPATIBILITY smoothly unfolds on scroll */}
                <div
                  className={`cyber-nav-morph-item ${isScrolledDown ? "is-expanded" : ""}`}
                  aria-hidden={!isScrolledDown}
                >
                  <button
                    type="button"
                    className="cyber-nav-link"
                    onClick={handleCompatibilityNavClick}
                    tabIndex={isScrolledDown ? 0 : -1}
                  >
                    COMPATIBILITY
                  </button>
                </div>

                {/* Morph Item 2: LEARN smoothly unfolds when in view of academy */}
                <div
                  className={`cyber-nav-morph-item ${isScrolledDown && showLearnNav ? "is-expanded" : ""}`}
                  aria-hidden={!isScrolledDown || !showLearnNav}
                >
                  <button
                    type="button"
                    className="cyber-nav-link"
                    onClick={handleLearnNavClick}
                    tabIndex={isScrolledDown && showLearnNav ? 0 : -1}
                  >
                    LEARN
                  </button>
                </div>

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
                  <h2 className="cyber-col-title">{activeContext.title}</h2>
                  <p className="cyber-col-desc">{activeContext.desc}</p>
                </div>
              </div>

              <div className="cyber-editorial-col cyber-col-right">
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
                <Link
                  to="/dashboard"
                  className="hero-learner-welcome"
                  onClick={() => { try { soundManager.click(); } catch {} }}
                  title="Open student profile overview"
                >
                  Welcome back, {userProfile.fullName || userProfile.email || "Student"}
                </Link>
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
            <Suspense fallback={null}>
              <Brands isIntegrated={true} />
            </Suspense>
          </section>

          {/* ── Global Footer ── */}
          <Footer />
        </div>

        {/* ── 2-Card Mode Selection (Split Staggered Reveal + PixelCanvas Hover) ── */}
        <ModeSelectionCards
          isOpen={showModeCards}
          onClose={() => setShowModeCards(false)}
          isLinking={isLinking}
          authError={authError}
          onSelectLearn={() => {
            signIn();
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
