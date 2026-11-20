import React, { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import soundManager from "../../utilities/soundManager";
import "./Footer.css";

gsap.registerPlugin(ScrollTrigger);

function Footer() {
  const location = useLocation();
  const footerRef = useRef(null);

  useEffect(() => {
    if (!footerRef.current) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: footerRef.current,
        start: "top 92%",
        onEnter: () => {
          gsap.to(
            footerRef.current.querySelectorAll(".footer-brand, .footer-column, .footer-bottom"),
            {
              opacity: 1,
              y: 0,
              stagger: 0.08,
              duration: 0.55,
              ease: "power2.out",
              overwrite: "auto",
            }
          );
        },
        onLeaveBack: () => {
          gsap.to(
            footerRef.current.querySelectorAll(".footer-brand, .footer-column, .footer-bottom"),
            {
              opacity: 0,
              y: 20,
              stagger: 0.04,
              duration: 0.3,
              ease: "power2.in",
              overwrite: "auto",
            }
          );
        },
      });
    }, footerRef);

    return () => ctx.revert();
  }, []);

  // Suppress footer on full-bleed 3D builder workbench
  if (location.pathname === "/3d-builder") {
    return null;
  }

  const handleLinkClick = () => {
    try {
      soundManager.click();
    } catch {}
  };

  return (
    <footer ref={footerRef} className="footer" role="contentinfo">
      <div className="footer-container">
        {/* Brand & Purpose Column */}
        <div className="footer-brand">
          <h2 className="footer-brand-title">BUILDLAB</h2>
          <p className="footer-tagline">
            An interactive virtual computer engineering workspace for hardware assembly simulation, real-time socket and TDP validation, and hands-on PC diagnostics.
          </p>
          <div className="footer-badge-strip">
            <span className="footer-curriculum-badge">DepEd TVL &bull; TESDA CSS NC II Aligned</span>
          </div>
        </div>

        {/* Clean, spacious navigation columns */}
        <nav className="footer-links-grid" aria-label="Footer Navigation">
          {/* Column 1: Platform Suite */}
          <div className="footer-column">
            <h3 className="footer-col-title">Platform Suite</h3>
            <ul className="footer-links-list">
              <li><Link to="/learn" onClick={handleLinkClick}>Hardware Academy</Link></li>
              <li><Link to="/3d-builder" onClick={handleLinkClick}>3D Virtual PC Studio</Link></li>
              <li><Link to="/build" onClick={handleLinkClick}>2D Component Picker</Link></li>
              <li><Link to="/compatibility" onClick={handleLinkClick}>Compatibility Matrix</Link></li>
              <li><Link to="/compare" onClick={handleLinkClick}>Compare 2 Rigs</Link></li>
            </ul>
          </div>

          {/* Column 2: Resources & Tools */}
          <div className="footer-column">
            <h3 className="footer-col-title">Resources &amp; Tools</h3>
            <ul className="footer-links-list">
              <li><Link to="/dashboard" onClick={handleLinkClick}>Student Dashboard</Link></li>
              <li><Link to="/certificate" onClick={handleLinkClick}>Official Certification</Link></li>
              <li><Link to="/brands" onClick={handleLinkClick}>Hardware Ecosystem</Link></li>
              <li><Link to="/help" onClick={handleLinkClick}>Help &amp; Documentation</Link></li>
              <li><Link to="/settings" onClick={handleLinkClick}>System Settings</Link></li>
            </ul>
          </div>

          {/* Column 3: Community & Legal */}
          <div className="footer-column">
            <h3 className="footer-col-title">Community &amp; Legal</h3>
            <ul className="footer-links-list">
              <li>
                <a
                  href="https://www.facebook.com/PDMHSOfficial"
                  target="_blank"
                  rel="noreferrer noopener"
                  onClick={handleLinkClick}
                  className="footer-external-link"
                >
                  President Diosdado Macapagal HS &nearr;
                </a>
              </li>
              <li>
                <a
                  href="https://www.facebook.com/paterostechnologicalcollege/"
                  target="_blank"
                  rel="noreferrer noopener"
                  onClick={handleLinkClick}
                  className="footer-external-link"
                >
                  Pateros Technological College &nearr;
                </a>
              </li>
              <li><Link to="/privacy" onClick={handleLinkClick}>Privacy Policy</Link></li>
              <li><Link to="/terms" onClick={handleLinkClick}>Terms of Service</Link></li>
              <li>
                <button
                  type="button"
                  className="footer-cookie-btn"
                  onClick={() => {
                    handleLinkClick();
                    window.dispatchEvent(new CustomEvent("buildlab:open-cookie-preferences"));
                  }}
                >
                  Cookie Preferences
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      {/* Footer Colophon */}
      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <p className="copyright-text">
            &copy; {new Date().getFullYear()} BuildLab. Engineered by WhiteHats Consortium. All hardware trademarks belong to their respective owners.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
