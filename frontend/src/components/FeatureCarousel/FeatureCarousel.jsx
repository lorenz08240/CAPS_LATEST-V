import React, { useState, useEffect } from "react";

/* ─────────────────────────────────────────────────────────────
   FeatureCarousel — the exact carousel used in the Home welcome
   banner (same slides, same auto-advance + clone-snap logic, same
   class names so it inherits the shared styles from Home.css).
   Mount point here: the Admin "Control Deck" login panel.
   ───────────────────────────────────────────────────────────── */

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
  },
];

export default function FeatureCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const extendedSlides = [...featureSlides, featureSlides[0]];

  // Auto-advance every 5s (same cadence as the banner)
  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setCurrentSlide((prev) => prev + 1);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Infinite loop: fade the animation when hitting the clone, snap to 0
  useEffect(() => {
    if (currentSlide === featureSlides.length) {
      const timeout = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentSlide(0);
      }, 1500);
      return () => clearTimeout(timeout);
    } else if (currentSlide === 0 && !isTransitioning) {
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

  return (
    <div className="hero-carousel-container-new admin-feature-carousel">
      <div className="ambient-blur-glow"></div>
      <div className="carousel-viewport">
        <div
          className="carousel-slide-wrapper-new"
          style={{
            transform: `translateX(-${currentSlide * 100}%)`,
            transition: isTransitioning
              ? "transform 1.2s cubic-bezier(0.22, 1, 0.36, 1)"
              : "none",
          }}
        >
          {extendedSlides.map((slide, index) => (
            <div className="carousel-slide-new" key={`${slide.id}-${index}`}>
              <div className="slide-inner-new">
                <div className="slide-content-new">
                  <span className="active-guide-badge-new" style={{ marginBottom: "1rem" }}>
                    ACTIVE GUIDE
                  </span>
                  <h4>{slide.title}</h4>
                  <p>{slide.desc}</p>
                  <div className="slide-decoration-nodes" style={{ marginTop: "2rem" }}>
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

      {/* Floating indicator module */}
      <div className="carousel-control-module-new">
        <div className="carousel-indicators-new">
          {featureSlides.map((_, idx) => (
            <button
              key={idx}
              className={`indicator-pill ${
                currentSlide === idx || (currentSlide === featureSlides.length && idx === 0)
                  ? "active"
                  : ""
              }`}
              onClick={() => handleDotClick(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
