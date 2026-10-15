import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import "./Home.css"; // Import the CSS file for styling
import Build from "../Build/Build";
import Compatibility from "../Compatibility/Compatibility";
import papercutBg from "../../assets/login_bg.png";

const useElementOnScreen = (options) => {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const currentRef = containerRef.current;
    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        setIsVisible(true);
        if (currentRef) observer.unobserve(currentRef); // Run once
      }
    }, options);

    if (currentRef) observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [options]);

  return [containerRef, isVisible];
};

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
      image: "https://i.pinimg.com/1200x/37/1f/e8/371fe84456a211611792c20ed07ab59c.jpg",
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

  // Use the hook to track visibility for each card
  const [refCard1, isVisibleCard1] = useElementOnScreen({ threshold: 0.2 });
  const [refCard2, isVisibleCard2] = useElementOnScreen({ threshold: 0.2 });
  const [refCard3, isVisibleCard3] = useElementOnScreen({ threshold: 0.2 });

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

  const scrollToBuildStation = () => {
    const target = document.getElementById("build-main-area") || document.getElementById("build-station");
    if (target) {
      const yOffset = -25;
      const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const handleStartBuild = () => {
    setIsFadingOut(true);
    hasSeenBannerThisSession = true;
    setTimeout(() => {
      setIsBannerVisible(false);
    }, 500); // Wait for the 0.5s fade-out animation to complete
  };

  return (
    <div className="home-page papercut-theme">
      {isBannerVisible && (
        <div className={`welcome-banner ${isFadingOut ? "fade-out" : ""}`}>
          <div className="welcome-banner-bg" style={{ backgroundImage: `url(${papercutBg})` }}></div>
          <div className="welcome-banner-content">
            <h1 className="welcome-title">
              Welcome to <span className="brand-accent">BuildLab</span>
            </h1>
            <p className="welcome-text">Your ultimate PC building simulator.</p>
            <button className="btn-primary banner-btn" onClick={handleStartBuild}>
              START BUILD NOW
            </button>
          </div>
        </div>
      )}
      <section 
        id="welcome" 
        className="home-hero two-col-hero"
        style={{ backgroundImage: `url(${papercutBg})` }}
      >
        <div className="hero-content-wrapper">
          {/* LEFT COLUMN: Typography, Stats, CTA */}
          <div className="hero-left-col">
            <div className="hero-subtitle-new">
              INTERACTIVE HARDWARE SIMULATION
            </div>
            <h1 className="hero-title-new">
              Build Your Dream PC <br />
              <span className="gold-glow-text">with Expert Guidance</span>
            </h1>
            <p className="hero-desc-new">
              The ultimate PC building simulator. Master hardware compatibility, customize your perfect rig, and learn essential assembly skills interactively. No guesswork—just confident building!
            </p>

            <div className="hero-stats-new">
              <div className="stat-new">
                <span className="stat-number-new">72+</span>
                <span className="stat-label-new">COMPONENTS TRACKED</span>
              </div>
              <div className="stat-new">
                <span className="stat-number-new">7</span>
                <span className="stat-label-new">ASSEMBLY STAGES</span>
              </div>
              <div className="stat-new">
                <span className="stat-number-new">1</span>
                <span className="stat-label-new">COMPATIBILITY MATRIX ENGINE</span>
              </div>
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
                <div className="control-counter-new">
                  STAGE 0{(currentSlide % featureSlides.length) + 1} <span className="counter-divider">/</span> 0{featureSlides.length}
                </div>
                
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

                <div className="control-arrows-new">
                  <button className="control-arrow-btn" onClick={() => handleDotClick(currentSlide - 1 < 0 ? featureSlides.length - 1 : currentSlide - 1)}>
                    &lt;
                  </button>
                  <button className="control-arrow-btn" onClick={() => handleDotClick((currentSlide + 1) % featureSlides.length)}>
                    &gt;
                  </button>
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
              <div className="req-item-new">
                <span className="req-icon-new">✓</span>
                <span className="req-text-new">BOTTLENECK ENGINE: <span className="req-status-new">STABLE</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* CENTERED CTA BUTTON */}
        <div className="hero-cta-wrapper centered-cta">
          <button 
            className="hero-cta-btn-new"
            onClick={scrollToBuildStation}
          >
            START BUILDING NOW
          </button>
        </div>

        {/* BOTTOM: Scroll Indicator & Trust Badges */}
        <div className="hero-footer-new">
          <div className="scroll-divider-container">
            <div className="scroll-line"></div>
            <span className="scroll-text-new">SCROLL TO EXPLORE</span>
            <div className="scroll-line"></div>
          </div>

          <div className="tech-logos-wrapper-new">
            <div className="tech-logos translucent-row-new">
              <span className="brand-logo">intel</span>
              <span className="brand-logo">AMD</span>
              <span className="brand-logo" style={{fontStyle: 'normal'}}>DELL</span>
              <span className="brand-logo" style={{fontFamily: 'Segoe UI'}}>Microsoft</span>
              <span className="brand-logo" style={{fontFamily: 'sans-serif', fontWeight: 600}}>MSI</span>
            </div>
          </div>
        </div>

      </section>

      {/* TIER 2: Active Build Station Framework */}
      <section id="build-station" className="home-integrated-section">
        <div className="section-header container">
          <h2>Active Build Station</h2>
          <p className="section-desc">Select your components and build your custom rig step by step.</p>
        </div>
        <Build isIntegrated={true} />
      </section>

      {/* TIER 3: Why Build Grid */}
      <section id="why-build" className="why-build section-with-glow">
        <div className="ambient-neon-glow"></div>
        <div className="container">
          <h2>Why Build Your Own PC?</h2>
          <p className="section-desc">
            Building your own PC isn't just about saving money, it's about gaining control, learning new skills, and creating something truly yours. Here's why thousands choose BuildLab.
          </p>

          <div className="benefits-grid">
            <div ref={refCard1} className={`benefit-card fade-up-stagger delay-0 ${isVisibleCard1 ? 'is-visible' : ''}`}>
              <img
                src="https://storage-asset.msi.com/global/picture/news/2025/mb/x870e-20251103-1.jpg"
                alt="Futuristic high-tech schematic render"
                className="benefit-image"
              />
              <h3>Complete Customization</h3>
              <p>Choose every component to match your exact needs gaming, work, or creative projects. No compromises on performance or aesthetics.</p>
            </div>

            <div ref={refCard2} className={`benefit-card fade-up-stagger delay-1 ${isVisibleCard2 ? 'is-visible' : ''}`}>
              <img
                src="https://i.pinimg.com/736x/93/64/fc/9364fc1fc62e0438b95023764807d1cd.jpg"
                alt="Exploded view diagram ng PC components"
                className="benefit-image"
              />
              <h3>Educational Journey</h3>
              <p>Master PC hardware knowledge while building. Understand how components work together for better troubleshooting and upgrades.</p>
            </div>

            <div ref={refCard3} className={`benefit-card fade-up-stagger delay-2 ${isVisibleCard3 ? 'is-visible' : ''}`}>
              <img
                src="https://www.imthecheftoo.com/cdn/shop/articles/help_kids_build_a_computer_a_fun_stem_passion_project.webp?v=1770634422"
                alt="Hands-on electronic testing"
                className="benefit-image"
              />
              <h3>Hands-on Experience</h3>
              <p>Gain hands-on experience without the risk. Build a high-end PC with expert guidance and simulation tools.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button 
          className="back-to-top-btn" 
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
        >
          ↑
        </button>
      )}
    </div>
  );
}

export default Hero;