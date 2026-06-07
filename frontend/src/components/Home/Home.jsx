import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import "./Home.css"; // Import the CSS file for styling

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

  const [refCard1, isVisibleCard1] = useElementOnScreen({ threshold: 0.2 });
  const [refCard2, isVisibleCard2] = useElementOnScreen({ threshold: 0.2 });
  const [refCard3, isVisibleCard3] = useElementOnScreen({ threshold: 0.2 });

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
    setTimeout(() => {
      setIsBannerVisible(false);
    }, 500); // Wait for the 0.5s fade-out animation to complete
  };

  return (
    <div className="home-page">
      <div className="bg-grid"></div>
      <div className="bg-glow bg-glow-1"></div>
      <div className="bg-glow bg-glow-2"></div>
      {isBannerVisible && (
        <div className={`welcome-banner ${isFadingOut ? "fade-out" : ""}`}>
          <div className="welcome-banner-content">
            <h1 className="welcome-title">
              Welcome to <span className="yellow">BuildLab</span>
            </h1>
            <p className="welcome-text">Your ultimate PC building simulator.</p>
            <button className="btn-primary banner-btn" onClick={handleStartBuild}>
              START BUILD NOW
            </button>
          </div>
        </div>
      )}
      <section id="welcome" className="home-hero">
        <div className="hero-badge"></div>

        <span className="hero-tagline">INTERACTIVE HARDWARE SIMULATION</span>
        <h1 className="hero-title">
          Build Your Dream PC
          <br />
          <span className="yellow">with Expert Guidance</span>
        </h1>

        <p className="hero-sub">
          The ultimate PC building simulator. Master hardware compatibility, customize your perfect rig, and learn essential assembly skills interactively. No guesswork—just confident building!
        </p>

        <div className="hero-stats">
          <div className="stat">
            <span className="stat-number">72+</span>
            <span className="stat-label">COMPONENTS TRACKED</span>
          </div>
          <div className="stat">
            <span className="stat-number">7</span>
            <span className="stat-label">ASSEMBLY STAGES</span>
          </div>
          <div className="stat">
            <span className="stat-number">1</span>
            <span className="stat-label">COMPATIBILITY MATRIX ENGINE</span>
          </div>
        </div>


        {/* Interactive Feature Carousel */}
        <div className="hero-carousel-container">
          <div 
            className="carousel-slide-wrapper" 
            style={{ 
              transform: `translateX(-${currentSlide * 100}%)`,
              transition: isTransitioning ? 'transform 1.5s cubic-bezier(0.4, 0, 0.2, 1.5)' : 'none'
            }}
          >
            {extendedSlides.map((slide, index) => (
              <div className="carousel-slide" key={`${slide.id}-${index}`}>
                <div className="slide-content">
                  <h4>{slide.title}</h4>
                  <p>{slide.desc}</p>
                </div>
                <div className="slide-image">
                  <img src={slide.image} alt={slide.title} />
                  <div className="slide-overlay"></div>
                </div>
              </div>
            ))}
          </div>
          <div className="carousel-indicators">
            {featureSlides.map((_, idx) => (
              <button 
                key={idx} 
                className={`indicator-dot ${currentSlide === idx || (currentSlide === featureSlides.length && idx === 0) ? 'active' : ''}`}
                onClick={() => handleDotClick(idx)}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="tech-logos-wrapper">
          <span className="tech-logos-label">Component catalog powered by real-world tech specifications.</span>
          <div className="tech-logos">
            <span className="brand-logo">INTEL</span>
            <span className="brand-logo">AMD</span>
            <span className="brand-logo">NVIDIA</span>
            <span className="brand-logo">ASUS</span>
            <span className="brand-logo">MSI</span>
          </div>
        </div>

        <div className="scroll-indicator">
          <span className="scroll-text">Scroll to explore</span>
          <div className="scroll-arrow">↓</div>
        </div>
      </section>

      <section id="why-build" className="why-build section-with-glow">
        <div className="ambient-neon-glow"></div>
        <div className="container">
          <h2>Why Build Your Own PC?</h2>
          <p className="section-desc">
            Building your own PC isn't just about saving money it's about
            gaining control, learning new skills, and creating something truly
            yours. Here's why thousands choose BuildLab.
          </p>

          <div className="benefits-grid">
            <div ref={refCard1} className={`benefit-card fade-up-stagger delay-0 ${isVisibleCard1 ? 'is-visible' : ''}`}>
              <img
                src="https://storage-asset.msi.com/global/picture/news/2025/mb/x870e-20251103-1.jpg"
                alt="Custom PC Build"
                className="benefit-image"
              />
              <h3>Complete Customization</h3>
              <p>
                Choose every component to match your exact needs gaming, work,
                or creative projects. No compromises on performance or
                aesthetics.
              </p>
            </div>

            <div ref={refCard2} className={`benefit-card fade-up-stagger delay-1 ${isVisibleCard2 ? 'is-visible' : ''}`}>
              <img
                src="https://i.pinimg.com/736x/93/64/fc/9364fc1fc62e0438b95023764807d1cd.jpg"
                alt="Learning Experience"
                className="benefit-image"
              />
              <h3>Educational Journey</h3>
              <p>
                Master PC hardware knowledge while building. Understand how
                components work together for better troubleshooting and
                upgrades.
              </p>
            </div>

            <div ref={refCard3} className={`benefit-card fade-up-stagger delay-2 ${isVisibleCard3 ? 'is-visible' : ''}`}>
              <img
                src="https://www.imthecheftoo.com/cdn/shop/articles/help_kids_build_a_computer_a_fun_stem_passion_project.webp?v=1770634422"
                alt="Cost Savings"
                className="benefit-image"
              />
              <h3>Significant Savings</h3>
              <p>
                Gain hands-on experience without the risk. Build a high-end PC with
                expert guidance and simulation tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works section-with-glow">
        <div className="ambient-neon-glow"></div>
        <div className="container">
          <h2>How BuildLab Works</h2>
          <p className="section-desc">Three simple steps to your perfect custom PC.</p>
          <div className="steps-container" style={{ '--scroll-progress': scrollProgress }}>
            <div className="step-box">
              <div className="step-number">1</div>
              <h3>Select Parts</h3>
              <p>Browse our database of components with real-world specs.</p>
            </div>
            <div className="step-box">
              <div className="step-number">2</div>
              <h3>Check Compatibility</h3>
              <p>Our system ensures all your chosen parts will work together flawlessly.</p>
            </div>
            <div className="step-box">
              <div className="step-number">3</div>
              <h3>Build & Enjoy</h3>
              <p>Follow our guides to assemble your PC and start gaming or working!</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="faq-section section-with-glow">
        <div className="ambient-neon-glow"></div>
        <div className="container">
          <h2>Frequently Asked Questions</h2>
          <p className="section-desc">Have questions about BuildLab? We have answers.</p>
          <div className="faq-grid">
            {[
              { q: "Is it hard to build a PC?", a: "Not at all! With our compatibility checker and online tutorials, it's like putting together high-tech LEGOs." },
              { q: "What if I pick parts that don't fit?", a: "Our platform automatically flags incompatibilities, like wrong socket types or inadequate power supplies." },
              { q: "Does BuildLab sell parts?", a: "We are an educational planning tool to help you learn about PC building." },
              { q: "How do I know what parts I need?", a: "Start with our 'Explore Resources' section to learn the basics, or check out our Featured Builds for templates." }
            ].map((faq, index) => (
              <div className={`faq-item ${activeFaq === index ? 'active' : ''}`} key={index} onClick={() => setActiveFaq(activeFaq === index ? null : index)}>
                <div className="faq-question">
                  <h4>{faq.q}</h4>
                  <span className={`faq-icon ${activeFaq === index ? "rotated" : ""}`}>➕</span>
                </div>
                <div className="faq-answer-wrapper">
                  <div className="faq-answer">
                    <p className="faq-answer-content">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

export default Hero;