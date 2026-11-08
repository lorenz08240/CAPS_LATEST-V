import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import soundManager from '../../utilities/soundManager';
import CyberBrand from './CyberBrand';
import './GlobalHeader.css';

export default function GlobalHeader({ onSearchClick, hideBuildPill = false }) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const shouldHideBuildPill = hideBuildPill || currentPath.startsWith('/learn') || currentPath.startsWith('/compatibility') || currentPath.startsWith('/build');

  const navItems = [
    { label: 'HOME', path: '/' },
    { label: 'BUILD', path: '/build' },
    { label: '3D STUDIO', path: '/3d-builder' },
    { label: 'COMPATIBILITY', path: '/compatibility' },
    { label: 'LEARN', path: '/learn' },
    { label: 'BRANDS', path: '/brands' },
    { label: 'ABOUT US', path: '/about' }
  ];

  const handleNavClick = (path) => {
    try { soundManager.click(); } catch {}
    navigate(path);
  };

  return (
    <header className="global-cyber-nav">
      <CyberBrand onNavigateHome={() => {
        try { soundManager.click(); } catch {}
        navigate('/');
      }} />

      <nav className="global-nav-links">
        {navItems.map((item) => {
          const isActive = item.path === '/' 
            ? currentPath === '/' 
            : currentPath.startsWith(item.path);

          return (
            <button
              key={item.label}
              type="button"
              className={`global-nav-link ${isActive ? 'active' : ''}`}
              onClick={() => handleNavClick(item.path)}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="global-nav-actions">
        {onSearchClick ? (
          <button
            type="button"
            className="global-search-btn"
            onClick={onSearchClick}
            title="Search Hardware Components"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        ) : !shouldHideBuildPill ? (
          <Link
            to="/build"
            className="global-build-pill"
            onClick={() => {
              try { soundManager.click(); } catch {}
              try { sessionStorage.setItem("buildlab_start_build_intent", "true"); } catch {}
            }}
            title="Open PC Builder Station"
          >
            <span>START BUILD</span>
            <span className="pill-arrow">&rarr;</span>
          </Link>
        ) : null}
      </div>
    </header>
  );
}
