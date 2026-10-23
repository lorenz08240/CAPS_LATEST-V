import React, { useState, useEffect } from "react";
import "./Home.css"; // Import the CSS file for styling
import Build from "../Build/Build";
import Compatibility from "../Compatibility/Compatibility";
import FullscreenGate from "../FullscreenGate/FullscreenGate";
import { enterFullscreen, isFullscreenActive } from "../../utilities/fullscreen";
import soundManager from "../../utilities/soundManager";

let hasSeenBannerThisSession = false;

function Hero() {
  const [isBannerVisible, setIsBannerVisible] = useState(!hasSeenBannerThisSession);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const featureSlides = [
    {
      id: 1,
      title: "Component Picker",
      desc: "Clean, organized database of real PC parts with live specifications.",
      image: "https://i.pinimg.com/1200x/01/a3/78/01a37845e39a32d225adcb81aafb30aa.jpg",
    },
    {
      id: 2,
      title: "Real-Time Compatibility Engine",
      desc: "Instantly catches bottlenecks, socket mismatches, and power errors.",
      image: "https://i.pinimg.com/1200x/75/6d/c3/756dc3817fdee27c0e1b327e963e4507.jpg",
    },
    {
      id: 3,
      title: "Performance Profile Analysis",
      desc: "Visual preview of your spider web graph and performance scores breakdown.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800",
    },
    {
      id: 4,
      title: "Step-by-Step Assembly Guide",
      desc: "Preview of our intuitive 7-stage workstation setup guide.",
      image: "https://i.pinimg.com/736x/bd/94/25/bd9425d84aaf8ffe4c641bb3f2734bf2.jpg",
    }
  ];

  const extendedSlides = [...featureSlides, featureSlides[0]];

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setCurrentSlide((prev) => prev + 1);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (currentSlide === featureSlides.length) {
      // When it hits the clone at the end
      const timeout = setTimeout(() => {
        setIsTransitioning(false); // disable animation
        setCurrentSlide(0);        // snap to actual first slide
      }, 1500); // wait for slide transition to finish (matches CSS 1.5s)
      return () => clearTimeout(timeout);
    } else if (currentSlide === 0 && !isTransitioning) {
      // Re-enable animation after snapping back
      const timeout = setTimeout(() => {
        setIsTransitioning(true);
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [currentSlide, isTransitioning, featureSlides.length]);

  const handleDotClick = (idx) => {
    setIsTransitioning(true);
    setCurrentSlide(idx);
  };

  // Track banner dismissal requests coming from other components
  // (e.g. the sidebar "Build" link) and treat them as entering the app.
  useEffect(() => {
    const handler = () => {
      hasSeenBannerThisSession = true;
      setIsFadingOut(true);
      setTimeout(() => setIsBannerVisible(false), 500);
    };
    window.addEventListener("buildlab:enter-build", handler);
    return () => window.removeEventListener("buildlab:enter-build", handler);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      // Show back to top button when user scrolls down
      const scrollPosition = window.scrollY || document.documentElement.scrollTop;
      if (scrollPosition > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const stepsSection = document.getElementById('how-it-works');
      if (stepsSection) {
        const rect = stepsSection.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const progress = Math.min(1, Math.max(0, (windowHeight - rect.top) / (windowHeight * 0.7)));
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isBannerVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isBannerVisible]);

  const handleStartBuild = () => {
    setIsFadingOut(true);
    hasSeenBannerThisSession = true;

    // Enter immersive fullscreen mode right away — this runs inside the
    // click handler, which is the user gesture browsers require.
    enterFullscreen();

    setTimeout(() => {
      setIsBannerVisible(false);
    }, 500); // Wait for the 0.5s fade-out animation to complete
  };

  // If the user escapes fullscreen after committing to the build (Engaged),
  // the FullscreenGate overlay re-prompts them — play a soft warning.
  useEffect(() => {
    const onExit = () => {
      if (!isFullscreenActive() && hasSeenBannerThisSession) {
        soundManager.warning();
      }
    };
    document.addEventListener("fullscreenchange", onExit);
    document.addEventListener("webkitfullscreenchange", onExit);
    return () => {
      document.removeEventListener("fullscreenchange", onExit);
      document.removeEventListener("webkitfullscreenchange", onExit);
    };
  }, []);

  return (
    <FullscreenGate>
      <div className="home-page">
      {isBannerVisible && (
        <div className={`welcome-banner ${isFadingOut ? "fade-out" : ""}`}>
          <div className="welcome-banner-modal">
            <div className="hero-content-wrapper">
              {/* LEFT COLUMN: Typography, Stats, CTA */}
              <div className="hero-left-col">
                <div className="hero-subtitle-new">
                  INTERACTIVE HARDWARE SIMULATION
                </div>
                <h1 className="hero-title-new">
                  Build Your Dream PC <br />
                  with <span className="expert-guidance-badge">Expert Guidance</span>
                </h1>
                <p className="hero-desc-new">
                  The ultimate PC building simulator. Master hardware compatibility, customize your perfect rig, and learn essential assembly skills interactively. No guesswork—just confident building!
                </p>

                <div className="hero-stats-new" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '2rem' }}>
                  <div className="stat-new" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span className="stat-number-new">72+</span>
                    <span className="stat-label-new">COMPONENTS TRACKED</span>
                  </div>
                  <div className="stat-new" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span className="stat-number-new">7</span>
                    <span className="stat-label-new">ASSEMBLY STAGES</span>
                  </div>
                  <div className="stat-new" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span className="stat-number-new">1</span>
                    <span className="stat-label-new">COMPATIBILITY MATRIX ENGINE</span>
                  </div>
                </div>

                <div className="hero-cta-wrapper">
                  <button
                    className="hero-cta-btn-new"
                    onClick={handleStartBuild}
                  >
                    START BUILDING NOW
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN: Antigravity Carousel */}
              <div className="hero-right-col antigravity-track">
                <div className="hero-carousel-container-new">
                  <div className="ambient-blur-glow"></div>
                  <div className="carousel-viewport">
                    <div
                      className="carousel-slide-wrapper-new"
                      style={{
                        transform: `translateX(-${currentSlide * 100}%)`,
                        transition: isTransitioning ? 'transform 1.2s cubic-bezier(0.22, 1, 0.36, 1)' : 'none'
                      }}
                    >
                      {extendedSlides.map((slide, index) => (
                        <div className="carousel-slide-new" key={`${slide.id}-${index}`}>
                          <div className="slide-inner-new">
                            <div className="slide-content-new">
                              <span className="active-guide-badge-new" style={{ marginBottom: '1rem' }}>ACTIVE GUIDE</span>
                              <h4>{slide.title}</h4>
                              <p>{slide.desc}</p>
                              <div className="slide-decoration-nodes" style={{ marginTop: '2rem' }}>
                                <span className="node"></span>
                                <span className="node-line"></span>
                                <span className="node"></span>
                              </div>
                            </div>
                            <div className="slide-media-new">
                              <img src={slide.image} alt={slide.title} />
                              <div className="slide-overlay-new"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* FLOATING NAVIGATION MODULE (Right Side) */}
                  <div className="carousel-control-module-new">
                    <div className="carousel-indicators-new">
                      {featureSlides.map((_, idx) => (
                        <button
                          key={idx}
                          className={`indicator-pill ${currentSlide === idx || (currentSlide === featureSlides.length && idx === 0) ? 'active' : ''}`}
                          onClick={() => handleDotClick(idx)}
                          aria-label={`Go to slide ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* BOTTOM PANEL: Live System Requirements */}
                <div className="live-system-requirements-new">
                  <div className="req-item-new">
                    <span className="req-icon-new">✓</span>
                    <span className="req-text-new">HARDWARE VALIDATION LOGIC: <span className="req-status-new">ACTIVE</span></span>
                  </div>
                  <div className="req-item-new">
                    <span className="req-icon-new">✓</span>
                    <span className="req-text-new">THERMAL PROFILE ANALYTICS: <span className="req-status-new">ONLINE</span></span>
                  </div>
                </div>
              </div>
            </div>

            {/* BOTTOM: Scroll Indicator & Trust Badges */}
            <div className="hero-footer-new">
              <div className="tech-logos-wrapper-new">
                <div className="tech-logos translucent-row-new">
                  <span className="brand-logo">intel</span>
                  <span className="brand-logo">AMD</span>
                  <span className="brand-logo" style={{ fontStyle: 'normal' }}>DELL</span>
                  <span className="brand-logo" style={{ fontFamily: 'Segoe UI' }}>Microsoft</span>
                  <span className="brand-logo" style={{ fontFamily: 'sans-serif', fontWeight: 600 }}>MSI</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TIER 2: Active Build Station Framework */}
      <section id="build-station" className="home-integrated-section">
        <Build isIntegrated={false} />
      </section>

      </div>
    </FullscreenGate>
  );
}

export default Hero;