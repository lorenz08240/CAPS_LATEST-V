import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import soundManager from "../../utilities/soundManager";
import "./Footer.css";

function Footer() {
  const location = useLocation();
  const [isRevealed, setIsRevealed] = useState(false);
  const footerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
        }
      },
      { threshold: 0.1 }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Hide footer on 3D builder page
  if (location.pathname === "/3d-builder") {
    return null;
  }

  const handleLinkClick = () => {
    try {
      soundManager.click();
    } catch {}
  };

  return (
    <footer
      ref={footerRef}
      className={`footer ${isRevealed ? "footer-revealed" : ""}`}
    >
      <div className="footer-container">
        {/* Brand & Institutional Profile Column */}
        <div className="footer-brand">
          <div className="footer-brand-header">
            <span className="footer-system-badge">BUILDLAB SYSTEM V2.4</span>
            <h2>BUILDLAB</h2>
          </div>
          <p className="footer-tagline">
            An expert virtual computer engineering workspace featuring real-time socket validation, TDP thermal auditing, 2D/3D hardware assembly simulation, and accredited curriculum courseware.
          </p>

          <div className="footer-credits-card">
            <div className="credit-line">
              <span className="credit-label">DEVELOPED BY:</span>
              <strong className="credit-val">WhiteHats Developer Consortium</strong>
            </div>
            <div className="credit-line">
              <span className="credit-label">INSTITUTION:</span>
              <strong className="credit-val">Pateros Technological College (PTC-IICT)</strong>
            </div>
            <div className="credit-line">
              <span className="credit-label">ACCREDITATION:</span>
              <span className="credit-accent">DepEd &bull; TESDA CSS NC II Aligned</span>
            </div>
          </div>
        </div>

        {/* Multi-Column Quick Links & Resources */}
        <div className="footer-links-grid">
          {/* Column 1: Core Navigation */}
          <div className="footer-column">
            <div className="footer-col-header">
              <span className="col-dot" />
              <h3>Platform Suite</h3>
            </div>
            <Link to="/" onClick={handleLinkClick}>Home Overview</Link>
            <Link to="/compatibility" onClick={handleLinkClick}>Compatibility Matrix</Link>
            <Link to="/compare" onClick={handleLinkClick}>Compare 2 Rigs</Link>
            <Link to="/learn" onClick={handleLinkClick}>Hardware Academy</Link>
            <Link to="/build" onClick={handleLinkClick}>2D Component Picker</Link>
            <Link to="/3d-builder" onClick={handleLinkClick}>3D Virtual PC Studio</Link>
          </div>

          {/* Column 2: Resources & Consortium */}
          <div className="footer-column">
            <div className="footer-col-header">
              <span className="col-dot dot-amber" />
              <h3>Consortium &amp; Tools</h3>
            </div>
            <Link to="/about" onClick={handleLinkClick}>About Us &bull; WhiteHats</Link>
            <Link to="/brands" onClick={handleLinkClick}>Hardware Ecosystem</Link>
            <Link to="/certification" onClick={handleLinkClick}>Official Certification</Link>
            <Link to="/help" onClick={handleLinkClick}>Help &amp; Documentation</Link>
            <Link to="/settings" onClick={handleLinkClick}>System Settings</Link>
            <a
              href="https://github.com/buildcores/buildcores-open-db"
              target="_blank"
              rel="noreferrer"
              onClick={handleLinkClick}
            >
              Open Hardware DB &rarr;
            </a>
          </div>

          {/* Column 3: Legal & Data Privacy */}
          <div className="footer-column">
            <div className="footer-col-header">
              <span className="col-dot dot-cyan" />
              <h3>Legal &amp; Privacy</h3>
            </div>
            <Link to="/privacy" onClick={handleLinkClick}>Privacy Policy</Link>
            <Link to="/terms" onClick={handleLinkClick}>Terms of Service</Link>
            <Link to="/cookies" onClick={handleLinkClick}>Cookie Policy</Link>
            <button
              type="button"
              className="footer-cookie-btn"
              onClick={() => {
                handleLinkClick();
                window.dispatchEvent(new CustomEvent("buildlab:open-cookie-preferences"));
              }}
            >
              <span>Manage Cookies</span>
              <span className="cookie-mini-tag">GDPR // DPA</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <p className="copyright-text">
            &copy; {new Date().getFullYear()} BuildLab. Engineered by WhiteHats Consortium. All hardware trademarks and component logos belong to their respective manufacturers.
          </p>
          <div className="footer-status-pill">
            <span className="status-live-dot" />
            <span>OPERATIONAL // ZERO CONFLICT ENGINE</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
