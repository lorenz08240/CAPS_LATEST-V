import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Footer.css";

function Footer() {
  const location = useLocation();

  // Hide footer on 3D builder page
  if (location.pathname === "/3d-builder") {
    return null;
  }

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h2>BUILDLAB</h2>
          <p>Your ultimate PC building and compatibility learning platform.</p>
          <div className="footer-credits">
            <p><strong>Developers:</strong> WhiteHats</p>
            <p><strong>School:</strong> Pateros Technological College</p>
          </div>
        </div>
        <div className="footer-links">
          <div className="footer-column">
            <h3>Quick Links</h3>
            <Link to="/">Home</Link>
            <Link to="/build">Build PC</Link>
            <Link to="/compatibility">Compatibility</Link>
            <Link to="/learn">Learn Components</Link>
            <Link to="/about">About Us</Link>
          </div>
          <div className="footer-column">
            <h3>Resources</h3>
            <Link to="/brands">Brands</Link>
            <a href="https://github.com/buildcores/buildcores-open-db" target="_blank" rel="noreferrer">Open DB</a>
            <button
              type="button"
              className="footer-cookie-btn"
              onClick={() => {
                window.dispatchEvent(new CustomEvent("buildlab:open-cookie-preferences"));
              }}
              style={{
                background: "none",
                border: "none",
                color: "inherit",
                font: "inherit",
                cursor: "pointer",
                padding: 0,
                textAlign: "left"
              }}
            >
              Cookie Preferences
            </button>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} BuildLab. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
