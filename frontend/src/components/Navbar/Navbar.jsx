import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./Navbar.css";

function Navbar({ isPinned, setIsPinned }) {
  const { isAdmin } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isVisible = isPinned || isHovered;

  const scrollToBuild = (e) => {
    e.preventDefault();
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        document.getElementById("build-station")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      document.getElementById("build-station")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Invisible Trigger Zone */}
      {!isPinned && (
        <div 
          className="sidebar-trigger-zone" 
          onMouseEnter={() => setIsHovered(true)} 
        />
      )}

      {/* Soft Backdrop Overlay (Dim Effect) */}
      <div 
        className={`sidebar-backdrop ${isHovered && !isPinned ? "active" : ""}`} 
        onClick={() => setIsHovered(false)} 
      />

      <nav 
        className={`sidebar ${isVisible ? "open" : "closed"} ${isPinned ? "pinned" : ""}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Indicator Arrow when closed */}
        {!isVisible && (
          <div className="sidebar-indicator">
            <span className="indicator-arrow">›</span>
          </div>
        )}

        <div className="sidebar-container">
          <div className="sidebar-header">
            <Link to="/" className="sidebar-logo">
              BUILDLAB
            </Link>
            <button 
              className={`sidebar-pin-btn ${isPinned ? 'active' : ''}`}
              onClick={() => setIsPinned(!isPinned)}
              title={isPinned ? "Unpin Sidebar" : "Pin Sidebar"}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={isPinned ? "#facc15" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="17" x2="12" y2="22"></line>
                <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path>
              </svg>
            </button>
          </div>
          
          <div className="sidebar-links">
            <Link to="/" className="sidebar-link">
              Home
            </Link>
            <a href="#build-station" onClick={scrollToBuild} className="sidebar-link">
              Build
            </a>
            <Link to="/3d-builder" className="sidebar-link" style={{ color: '#00e5ff' }}>
              🧊 3D Studio
            </Link>
            <Link to="/compatibility" className="sidebar-link">
              Compatibility
            </Link>
            <Link to="/learn" className="sidebar-link">
              Learn
            </Link>
            <Link to="/admin" className="sidebar-link" style={{ color: isAdmin ? '#00E676' : '#94a3b8', fontWeight: isAdmin ? 'bold' : '500', marginTop: 'auto' }}>
              ⚙️ {isAdmin ? 'ADMIN DECK' : 'Admin Access'}
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;