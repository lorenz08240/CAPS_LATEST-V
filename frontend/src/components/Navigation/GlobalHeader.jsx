import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import soundManager from '../../utilities/soundManager';
import CyberBrand from './CyberBrand';
import { useLearnMode } from '../../contexts/LearnModeContext';
import ModeSelectionCards from '../Home/ModeSelectionCards';
import AccountSetupModal from '../Home/AccountSetupModal';
import './GlobalHeader.css';

export default function GlobalHeader({ onSearchClick, hideBuildPill = false }) {
  const { mode, userProfile, setAppMode, hasCompletedProfile } = useLearnMode();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const isFreeWorkbench = mode === 'explore';
  const shouldHideBuildPill = hideBuildPill || isFreeWorkbench || currentPath.startsWith('/learn') || currentPath.startsWith('/compatibility') || currentPath.startsWith('/build');

  const [showModeCards, setShowModeCards] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);

  const navItems = [
    { label: 'HOME', path: '/' },
    { label: 'COMPATIBILITY', path: '/compatibility' },
    { label: 'LEARN', path: '/learn' },
    { label: 'BRANDS', path: '/#brands-station' },
    { label: 'ABOUT US', path: '/about' }
  ];

  const handleNavClick = (item) => {
    try { soundManager.click(); } catch {}

    if (item.label === 'BRANDS') {
      if (location.pathname === '/') {
        const brandsStation = document.getElementById("brands-station");
        if (brandsStation) {
          brandsStation.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }
      }
      navigate('/#brands-station');
      return;
    }

    if (item.label === 'LEARN') {
      const hasAccount = Boolean(
        userProfile && (userProfile.fullName || userProfile.email) && userProfile.setupCompleted
      );
      if (hasAccount && mode === "learn") {
        navigate('/learn');
      } else {
        // Lockout mechanism for non-acc: pop up the continue with account card
        setShowModeCards(true);
      }
      return;
    }

    navigate(item.path);
  };

  return (
    <>
      <header className="global-cyber-nav">
        <CyberBrand onNavigateHome={() => {
          try { soundManager.click(); } catch {}
          navigate('/');
        }} />

        <nav className="global-nav-links">
          {navItems.map((item) => {
            const isActive = item.label === 'HOME'
              ? currentPath === '/' && !location.hash
              : item.label === 'BRANDS'
              ? location.hash === '#brands-station' || currentPath === '/brands'
              : currentPath.startsWith(item.path);

            return (
              <button
                key={item.label}
                type="button"
                className={`global-nav-link ${isActive ? 'active' : ''}`}
                onClick={() => handleNavClick(item)}
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

      {/* ── Mode Selection Card (Lockout / Continue with Google) ── */}
      <ModeSelectionCards
        isOpen={showModeCards}
        onClose={() => setShowModeCards(false)}
        onSelectLearn={() => {
          setShowModeCards(false);
          if (hasCompletedProfile) {
            setAppMode("learn");
            navigate("/learn");
          } else {
            setShowAccountModal(true);
          }
        }}
        onSelectFree={() => {
          setShowModeCards(false);
        }}
      />

      {/* ── Google Sign-In & Name Verification Modal ── */}
      <AccountSetupModal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        onConfirmed={(targetMode, confirmedProfile) => {
          setShowAccountModal(false);
          setAppMode("learn");
          navigate("/learn");
        }}
      />
    </>
  );
}
