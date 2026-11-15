import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useBuild } from "../../contexts/BuildContext";
import { useLearnMode } from "../../contexts/LearnModeContext";
import LearnHardwareStage from "./LearnHardwareStage";
import BobCompanion from "../BobCompanion/BobCompanion";
import StageUnlockBanner from "../Navigation/StageUnlockBanner";
import AccountSetupModal from "../Home/AccountSetupModal";
import soundManager from "../../utilities/soundManager";
import {
  CSS_CURRICULUM,
  FLAT_TOPICS,
  TOTAL_TOPICS_COUNT,
  TOTAL_MODULES_COUNT,
} from "./curriculumData";
import "./CourseShell.css";

/* ═══════════════════════════════════════════════════════════════════
   BUILDLAB HARDWARE WORKBENCH — COMPUTER SYSTEMS SERVICING (CSS)
   Grade 11 Pre-Lab Curriculum: 6 Modules • 19 Sequential Topics
   2-Zone Layout: 3D Hardware Workbench + CSS Pre-Lab Guide & Video
   ═══════════════════════════════════════════════════════════════════ */

const PROGRESS_KEY = "buildlab.learn.progress.v1";

const readProgress = (email) => {
  try {
    const accountKey = email ? `buildlab.learn.progress.${email}` : null;
    const rawStr =
      (accountKey && localStorage.getItem(accountKey)) ||
      localStorage.getItem(PROGRESS_KEY) ||
      "[]";
    const raw = JSON.parse(rawStr);
    return Array.isArray(raw) ? raw.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
};

/* ─────────────────────── 3D BENCHMARK HOTSPOTS ─────────────────────── */
const ARTICLE_HOTSPOTS = [
  {
    id: "sys-cpu",
    label: "CPU & Cooler Assembly",
    pos: [-0.65, 1.55, -0.6],
    camPos: [-4.6, 2.2, 1.4],
    target: [-0.2, 1.4, -0.6],
    bus: "Socket AM5 / LGA1700",
    voltage: "1.2V VCore · 65W-253W",
    role: "Executes OS instructions, physics, and arithmetic operations.",
    tip: "Align the golden triangle and drop into socket with Zero Insertion Force.",
  },
  {
    id: "sys-ram",
    label: "Dual-Channel RAM (A2 / B2)",
    pos: [-0.55, 1.4, 0.9],
    camPos: [-4.4, 1.8, 2.6],
    target: [-0.15, 1.4, 0.8],
    bus: "128-Bit DDR5 / DDR4",
    voltage: "1.1V - 1.35V VDD",
    role: "Active high-speed memory buffering textures and applications.",
    tip: "With 2 sticks, populate slots 2 and 4 (A2 & B2) to activate dual-channel.",
  },
  {
    id: "sys-nvme",
    label: "M.2 NVMe Boot SSD",
    pos: [-0.45, 0.35, -0.6],
    camPos: [-3.6, 0.8, 0.9],
    target: [-0.1, 0.35, -0.6],
    bus: "PCIe 4.0 / 5.0 x4",
    voltage: "3.3V Direct Rail",
    role: "Non-volatile flash storage wired straight to CPU PCIe lanes.",
    tip: "Insert at 30° angle and always peel the heatsink thermal pad film.",
  },
  {
    id: "sys-gpu",
    label: "PCIe x16 Graphics Card",
    pos: [-1.15, -0.7, -0.1],
    camPos: [-5.8, -0.2, 3.2],
    target: [-0.4, -0.7, -0.2],
    bus: "PCIe x16 + 12V-2x6",
    voltage: "115W - 450W TGP",
    role: "Massively parallel visual engine rendering 3D frames and compute.",
    tip: "Plug monitor HDMI/DisplayPort directly into this graphics card.",
  },
  {
    id: "sys-vrm",
    label: "VRM & 24-Pin Power Bus",
    pos: [-0.35, 2.25, -1.6],
    camPos: [-4.6, 2.6, -2.8],
    target: [-0.15, 1.9, -1.0],
    bus: "12V ATX / EPS Input",
    voltage: "VRM Steps 12V -> 1.2V",
    role: "Converts PSU DC rails into regulated, clean CPU boost power.",
    tip: "Remember both the 24-pin ATX side cable and the top 8-pin CPU EPS cable.",
  },
];

/* ─────────────────────── 3-STEP ONBOARDING TOUR ─────────────────────── */
const TOUR_STEPS = [
  {
    id: "wb-zone-stage",
    name: "Interactive 3D PC Workbench",
    desc: "360° orbital view, live bus flow, and clickable hotspots for socket inspection.",
    speech:
      "Center stage is your interactive 3D PC workbench. Drag to orbit and rotate, scroll to zoom in close, and tap glowing pins to inspect physical motherboard sockets.",
    direction: "stage",
  },
  {
    id: "wb-zone-dock",
    name: "CSS Pre-Lab Guide & Video",
    desc: "16:9 lecture video, field facts, lab safety warnings, and 1-question quick check.",
    speech:
      "On the right is your CSS pre-lab guide: watch the video lesson, review safety warnings, and answer the quick check to earn certificate progress.",
    direction: "left",
  },
  {
    id: "wb-zone-rail",
    name: "Syllabus Modules & Certificate Progress",
    desc: "Browse 6 modules with 19 sequential topics, track progress, and earn your certificate.",
    speech:
      "Use the left rail to navigate all 6 modules and 19 topics, and track your accredited certificate progress up top.",
    direction: "right",
  },
];

export default function CourseShell() {
  const navigate = useNavigate();
  const { currentBuild } = useBuild();
  const { mode, userProfile, seenBanners, markBannerSeen, unlockStage } = useLearnMode();

  // Stage unlock banner state
  const [showUnlockBanner, setShowUnlockBanner] = useState(
    () => mode === "learn" && !seenBanners?.learn
  );

  // Workbench visual theme: 'dark' (clean pro slate) or 'light' (soft glare-free titanium)
  const [workbenchTheme, setWorkbenchTheme] = useState(() => {
    try {
      const saved = localStorage.getItem("buildlab_learn_theme");
      if (saved === "light" || saved === "blueprint") return "light";
      return "dark";
    } catch {
      return "dark";
    }
  });

  const isLight = workbenchTheme === "light";

  const toggleTheme = useCallback(() => {
    try { soundManager.click(); } catch {}
    setWorkbenchTheme((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("buildlab_learn_theme", workbenchTheme);
    } catch {}
  }, [workbenchTheme]);

  // First-time Welcome to Course Syllabus banner overlay state
  const [showSyllabusWelcome, setShowSyllabusWelcome] = useState(() => {
    try {
      const unlockActive = mode === "learn" && !seenBanners?.learn;
      const syllabusSeen = localStorage.getItem("buildlab_learn_syllabus_seen") === "true";
      return !unlockActive && !syllabusSeen;
    } catch {
      return false;
    }
  });

  // Centered B.O.B. state during Welcome overlay
  const [bobIsCenter, setBobIsCenter] = useState(() => {
    try {
      const unlockActive = mode === "learn" && !seenBanners?.learn;
      const syllabusSeen = localStorage.getItem("buildlab_learn_syllabus_seen") === "true";
      return !unlockActive && !syllabusSeen;
    } catch {
      return false;
    }
  });

  // Windows 11 Snipping Tool Spotlight Walkthrough State
  const [tourActive, setTourActive] = useState(false);
  const [tourStepIndex, setTourStepIndex] = useState(0);
  const tourStepIndexRef = useRef(0);
  const [spotlightRect, setSpotlightRect] = useState(null);
  const tourTimerRef = useRef(null);

  // Left Rail & Popover Drawers
  const [leftRailOpen, setLeftRailOpen] = useState(true);
  const [activePopover, setActivePopover] = useState(null); // null | 'lessons'
  const [expandedModules, setExpandedModules] = useState({
    m1: true,
    m2: true,
    m3: true,
    m4: true,
    m5: true,
    m6: true,
  });

  // Curriculum Navigation & Progress
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState(() => readProgress(userProfile?.email));

  // Current active topic
  const currentTopic = FLAT_TOPICS[currentIndex] || FLAT_TOPICS[0];

  // Right Panel Video & Interactive State
  const [videoExpanded, setVideoExpanded] = useState(true);
  const [videoHighlighted, setVideoHighlighted] = useState(false);
  const [selectedQuizOption, setSelectedQuizOption] = useState(null);
  const [quizAnswerStatus, setQuizAnswerStatus] = useState(null); // null | 'correct' | 'incorrect'
  const rightDockRef = useRef(null);
  const guideCardRef = useRef(null);

  // Modals for Account Setup and Guest Curriculum Unlock
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showGuestLockModal, setShowGuestLockModal] = useState(false);

  // Auto-scroll guide card to top on topic change
  useEffect(() => {
    if (guideCardRef.current) {
      guideCardRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentIndex]);

  // Authenticated learner status check
  const localUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();

  const isAuthenticated = Boolean(
    (userProfile?.setupCompleted && userProfile?.fullName) ||
    localUser?.fullName ||
    localUser?.name ||
    (mode === "learn" && userProfile?.fullName)
  );

  const learnerDisplayName =
    userProfile?.fullName ||
    localUser?.fullName ||
    localUser?.name ||
    (isAuthenticated ? "Student Track" : "Guest Preview");

  const learnerSubtext =
    userProfile?.strand ||
    localUser?.strand ||
    (isAuthenticated ? "Grade 11 CSS Learner" : "Sign In to Unlock Full Academy");

  const isTopicLockedForGuest = (topicIdx) => {
    if (isAuthenticated) return false;
    return topicIdx > 2; // Only Module 1 (first 3 topics) is preview
  };

  // 3D Hotspot Selection
  const [selectedHotspotId, setSelectedHotspotId] = useState(currentTopic.hotspotId || null);

  // B.O.B. Companion Live Speech
  const [bobSpeech, setBobSpeech] = useState(
    `Welcome to Topic ${currentTopic.topicCode}: ${currentTopic.title}! Watch the lecture video or inspect the 3D specimen.`
  );

  // Unlock Stage 4 Studio & Certificate gracefully once in Learn
  useEffect(() => {
    if (mode === "learn") {
      unlockStage("studio");
      unlockStage("certificate");
    }
  }, [mode, unlockStage]);

  // Persist progress globally and per Google Learner Account
  useEffect(() => {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(completed));
      if (userProfile?.email) {
        localStorage.setItem(
          `buildlab.learn.progress.${userProfile.email}`,
          JSON.stringify(completed)
        );
      }
    } catch {}
  }, [completed, userProfile?.email]);

  // Update quiz and hotspot state when changing topic
  useEffect(() => {
    const isDone = completed.includes(currentTopic.id);
    if (isDone) {
      const correctIdx = currentTopic.quiz.options.findIndex((o) => o.correct);
      setSelectedQuizOption(correctIdx !== -1 ? correctIdx : null);
      setQuizAnswerStatus("correct");
    } else {
      setSelectedQuizOption(null);
      setQuizAnswerStatus(null);
    }
    setSelectedHotspotId(currentTopic.hotspotId || null);
    setActivePopover(null);
    setBobSpeech(
      `Topic ${currentTopic.topicCode}: ${currentTopic.title}. Watch the video, review safety warnings, and complete the quick check!`
    );
  }, [currentIndex, currentTopic, completed]);

  const markComplete = useCallback((topicId) => {
    try { soundManager.complete(); } catch {}
    setCompleted((prev) => (prev.includes(topicId) ? prev : [...prev, topicId]));
  }, []);

  const doneCount = completed.filter((id) => FLAT_TOPICS.some((f) => f.id === id)).length;
  const progressPct = Math.round((doneCount / FLAT_TOPICS.length) * 100);

  useEffect(() => {
    if (progressPct === 100) {
      unlockStage("certificate");
      unlockStage("studio");
    }
  }, [progressPct, unlockStage]);

  const goTopic = (idx) => {
    if (idx < 0 || idx >= FLAT_TOPICS.length) return;
    if (isTopicLockedForGuest(idx)) {
      try { soundManager.warning(); } catch {}
      setShowGuestLockModal(true);
      return;
    }
    try { soundManager.snap(); } catch {}
    setCurrentIndex(idx);
    setActivePopover(null);
    if (guideCardRef.current) {
      guideCardRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNextTopic = useCallback(() => {
    // If guest reaches the end of Module 1 preview (index 2)
    if (!isAuthenticated && currentIndex === 2) {
      try { soundManager.warning(); } catch {}
      setShowGuestLockModal(true);
      return;
    }

    if (currentIndex + 1 < FLAT_TOPICS.length) {
      try { soundManager.snap(); } catch {}
      setCurrentIndex((i) => i + 1);
      if (guideCardRef.current) {
        guideCardRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      try { soundManager.complete(); } catch {}
      unlockStage("certificate");
      navigate("/certificate");
    }
  }, [currentIndex, isAuthenticated, unlockStage, navigate]);

  const handleCertClick = () => {
    if (!isAuthenticated) {
      try { soundManager.click(); } catch {}
      setShowGuestLockModal(true);
      return;
    }
    try { soundManager.click(); } catch {}
    unlockStage("certificate");
    navigate("/certificate");
  };

  const handlePrevTopic = useCallback(() => {
    if (currentIndex > 0) {
      try { soundManager.click(); } catch {}
      setCurrentIndex((i) => i - 1);
      if (rightDockRef.current) {
        rightDockRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  }, [currentIndex]);

  const handleSelectQuizOption = useCallback(
    (optIdx, isCorrect) => {
      setSelectedQuizOption(optIdx);
      if (isCorrect) {
        setQuizAnswerStatus("correct");
        try { soundManager.complete(); } catch {}
        markComplete(currentTopic.id);
        setBobSpeech(
          `Excellent job! You spotted the lab mistake and mastered Topic ${currentTopic.topicCode}!`
        );
      } else {
        setQuizAnswerStatus("incorrect");
        try { soundManager.error(); } catch {}
        setBobSpeech(
          "Not quite! Take a close look at the 'Avoid This Mistake in Lab' warning above and try again."
        );
      }
    },
    [currentTopic, markComplete]
  );

  const handleInspectIn3D = useCallback(() => {
    try { soundManager.click(); } catch {}
    if (currentTopic.hotspotId) {
      setSelectedHotspotId(currentTopic.hotspotId);
      setBobSpeech(
        `Focusing 3D camera on ${currentTopic.title}! Inspect socket alignment and physical pin keys.`
      );
    } else {
      setSelectedHotspotId(null);
      setBobSpeech(
        `Viewing 3D ${currentTopic.specimenKey} overview for ${currentTopic.title}.`
      );
    }
  }, [currentTopic]);

  const handleOpenLectureFilm = useCallback(() => {
    try { soundManager.snap(); } catch {}
    setVideoExpanded(true);
    setVideoHighlighted(true);
    setTimeout(() => setVideoHighlighted(false), 1400);
    if (rightDockRef.current) {
      rightDockRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
    setBobSpeech(
      `Playing lecture video for "${currentTopic.title}". Inspect the 3D model and watch side-by-side!`
    );
  }, [currentTopic]);

  const toggleModuleExpanded = (modId) => {
    try { soundManager.click(); } catch {}
    setExpandedModules((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  // Windows 11 Snipping Tool Spotlight Walkthrough Controllers
  const updateSpotlightRect = useCallback((stepIdx) => {
    const step = TOUR_STEPS[stepIdx];
    if (!step) return;
    const el = document.getElementById(step.id);
    if (!el) return;
    const r = el.getBoundingClientRect();
    const pad = 6;
    setSpotlightRect({
      top: Math.max(0, Math.round(r.top - pad)),
      left: Math.max(0, Math.round(r.left - pad)),
      width: Math.round(r.width + pad * 2),
      height: Math.round(r.height + pad * 2),
      borderRadius: step.id === "wb-zone-hud" ? 14 : 14,
    });
  }, []);

  const dismissTour = useCallback((tourDone = false) => {
    if (tourTimerRef.current) {
      clearTimeout(tourTimerRef.current);
      tourTimerRef.current = null;
    }
    try {
      if (tourDone) {
        soundManager.complete();
      } else {
        soundManager.click();
      }
    } catch {}
    try {
      localStorage.setItem("buildlab_learn_syllabus_seen", "true");
    } catch {}
    setTourActive(false);
    setSpotlightRect(null);
    setBobSpeech(
      tourDone
        ? "Tour complete! You're ready to explore. Watch the video or inspect the 3D parts."
        : "Tour closed. Click any pulsing green dot or review the lesson guide to begin."
    );
  }, []);

  const goToStep = useCallback(
    (stepIdx) => {
      if (tourTimerRef.current) {
        clearTimeout(tourTimerRef.current);
        tourTimerRef.current = null;
      }
      if (stepIdx < 0) return;
      if (stepIdx >= TOUR_STEPS.length) {
        dismissTour(true);
        return;
      }
      try { soundManager.snap(); } catch {}
      tourStepIndexRef.current = stepIdx;
      setTourStepIndex(stepIdx);
      requestAnimationFrame(() => {
        updateSpotlightRect(stepIdx);
      });
      setBobSpeech(TOUR_STEPS[stepIdx].speech);
    },
    [updateSpotlightRect, dismissTour]
  );

  const handleTourNextStep = useCallback(() => {
    goToStep(tourStepIndexRef.current + 1);
  }, [goToStep]);

  const handleTourPrevStep = useCallback(() => {
    goToStep(tourStepIndexRef.current - 1);
  }, [goToStep]);

  const getCalloutPlacement = useCallback((stepIdx, rect) => {
    if (!rect) return { style: {}, dir: "bottom" };
    const step = TOUR_STEPS[stepIdx];
    const dir = step?.direction || "bottom";

    switch (dir) {
      case "right":
        return {
          dir: "right",
          style: {
            left: `${Math.round(rect.left + rect.width + 24)}px`,
            top: `${Math.max(76, Math.min(window.innerHeight - 340, rect.top + 80))}px`,
          },
        };
      case "stage":
        return {
          dir: "stage",
          style: {
            left: `${Math.round(rect.left + 32)}px`,
            top: `${Math.round(rect.top + 32)}px`,
          },
        };
      case "left":
      default:
        return {
          dir: "left",
          style: {
            right: `${Math.round(window.innerWidth - rect.left + 24)}px`,
            top: `${Math.max(76, Math.min(window.innerHeight - 340, rect.top + 60))}px`,
          },
        };
    }
  }, []);

  const startTour = useCallback(
    (stepIdx = 0) => {
      try { soundManager.granted(); } catch {}
      setActivePopover(null);
      setTourActive(true);
      tourStepIndexRef.current = stepIdx;
      setTourStepIndex(stepIdx);
      setTimeout(() => {
        updateSpotlightRect(stepIdx);
      }, 100);
      setBobSpeech(TOUR_STEPS[stepIdx]?.speech || "");
    },
    [updateSpotlightRect]
  );

  useEffect(() => {
    if (!tourActive) return undefined;
    const handleResize = () => updateSpotlightRect(tourStepIndexRef.current);
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize, true);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize, true);
    };
  }, [tourActive, updateSpotlightRect]);

  const handleDismissSyllabusWelcome = () => {
    try { soundManager.click(); } catch {}
    try {
      localStorage.setItem("buildlab_learn_syllabus_seen", "true");
    } catch {}
    setShowSyllabusWelcome(false);
    setBobIsCenter(false);
    setBobSpeech(
      "All yours! Watch the lecture video, inspect 3D hotspots, or review the field facts to begin."
    );
  };

  const handleStartWorkbenchTour = () => {
    try { soundManager.click(); } catch {}
    try {
      localStorage.setItem("buildlab_learn_syllabus_seen", "true");
    } catch {}
    setShowSyllabusWelcome(false);
    setBobIsCenter(false);
    setTimeout(() => {
      startTour(0);
    }, 380);
  };

  useEffect(() => {
    if (showSyllabusWelcome) {
      setBobIsCenter(true);
      try { soundManager.granted(); } catch {}
      setBobSpeech(
        "Welcome to the CSS Hardware Academy! I've loaded your 6 modules and 19 interactive topics. Ready for the grand tour?"
      );
    }
  }, [showSyllabusWelcome]);

  useEffect(() => {
    if (!tourActive) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        dismissTour(false);
      } else if (e.key === "ArrowRight") {
        handleTourNextStep();
      } else if (e.key === "ArrowLeft") {
        handleTourPrevStep();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [tourActive, dismissTour, handleTourNextStep, handleTourPrevStep]);

  return (
    <div
      className={`wb-shell theme-${workbenchTheme} ${
        isLight ? "theme-light" : "theme-obsidian"
      } ${
        leftRailOpen ? "rail-expanded" : "rail-collapsed"
      } ${tourActive ? "is-tour-active" : ""}`}
    >
      {/* ══ ZONE 1: LEFT NAVIGATION RAIL ══ */}
      <aside
        id="wb-zone-rail"
        className={`wb-left-rail ${!leftRailOpen ? "is-collapsed" : ""}`}
        aria-label="Workbench Navigation"
      >
        <div className="wb-rail-top">
          <button
            type="button"
            className="wb-rail-collapse-btn"
            onClick={() => {
              try { soundManager.click(); } catch {}
              setLeftRailOpen((o) => !o);
              setActivePopover(null);
            }}
            data-tooltip={leftRailOpen ? "Collapse sidebar" : "Expand sidebar"}
            aria-label="Toggle navigation rail"
          >
            {leftRailOpen ? "‹" : "›"}
          </button>
          {leftRailOpen && <span className="wb-rail-brand">BUILDLAB</span>}
        </div>

        <nav className="wb-rail-nav">
          <button
            type="button"
            className="wb-rail-item"
            onClick={() => navigate("/")}
            data-tooltip="Return Home"
            aria-label="Return Home"
          >
            <span className="wb-rail-icon">⌂</span>
            {leftRailOpen && <span className="wb-rail-label">HOME</span>}
          </button>

          <button
            type="button"
            className={`wb-rail-item ${activePopover === "lessons" ? "is-active" : ""}`}
            onClick={() => {
              try { soundManager.snap(); } catch {}
              setActivePopover((p) => (p === "lessons" ? null : "lessons"));
            }}
            data-tooltip={`Browse all ${TOTAL_TOPICS_COUNT} Topics across ${TOTAL_MODULES_COUNT} Modules`}
            aria-label="Browse Curriculum Lessons"
          >
            <span className="wb-rail-icon">📖</span>
            {leftRailOpen && <span className="wb-rail-label">LESSONS</span>}
          </button>

          <button
            type="button"
            className="wb-rail-item"
            onClick={handleOpenLectureFilm}
            data-tooltip="Toggle Current Lecture Video"
            aria-label="Watch Video Lecture"
          >
            <span className="wb-rail-icon">▶</span>
            {leftRailOpen && <span className="wb-rail-label">VIDEO FILM</span>}
          </button>

          <button
            type="button"
            className="wb-rail-item"
            onClick={() => navigate("/compatibility")}
            data-tooltip="Stage 02: Compatibility Matrix"
            aria-label="Compatibility Matrix"
          >
            <span className="wb-rail-icon">✓</span>
            {leftRailOpen && <span className="wb-rail-label">COMPAT CHECK</span>}
          </button>

          <button
            type="button"
            className="wb-rail-item"
            onClick={() => {
              try { soundManager.install(); } catch {}
              unlockStage("studio");
              navigate("/3d-builder?learn=true");
            }}
            data-tooltip="Stage 04: 3D Assembly Studio"
            aria-label="3D Studio Sandbox"
          >
            <span className="wb-rail-icon">◈</span>
            {leftRailOpen && <span className="wb-rail-label">3D STUDIO</span>}
          </button>

          <button
            type="button"
            className="wb-rail-item wb-theme-switch-btn"
            onClick={toggleTheme}
            data-tooltip={isLight ? "Switch to Dark Studio" : "Switch to Light Studio"}
            aria-label={isLight ? "Switch to Dark Studio" : "Switch to Light Studio"}
          >
            <span className="wb-rail-icon">{isLight ? "🌙" : "☀️"}</span>
            {leftRailOpen && (
              <span className="wb-rail-label">
                {isLight ? "DARK STUDIO" : "LIGHT STUDIO"}
              </span>
            )}
          </button>
        </nav>

        {leftRailOpen && (
          <div className="wb-rail-footer">
            <div
              className={`wb-learner-chip ${!isAuthenticated ? "is-guest-chip" : ""}`}
              onClick={!isAuthenticated ? () => setShowGuestLockModal(true) : undefined}
              data-tooltip={!isAuthenticated ? "Click to link account and unlock full curriculum" : learnerDisplayName}
            >
              <span className={`wb-learner-dot ${!isAuthenticated ? "is-guest-dot" : ""}`} />
              <div className="wb-learner-meta">
                <strong>{learnerDisplayName}</strong>
                <span>{learnerSubtext}</span>
              </div>
              {!isAuthenticated && <span className="wb-learner-unlock-arrow">→</span>}
            </div>
          </div>
        )}
      </aside>

      {/* ── 6-MODULE HIERARCHICAL SYLLABUS ACCORDION POPOVER ── */}
      {activePopover === "lessons" && (
        <div className="wb-popover-card wb-syllabus-accordion-popover" role="dialog" aria-label="Curriculum Modules">
          <div className="wb-popover-head">
            <div>
              <h3>CSS SYLLABUS</h3>
              <p className="wb-popover-subtitle">
                {doneCount} of {TOTAL_TOPICS_COUNT} Topics Completed ({progressPct}%)
              </p>
            </div>
            <button
              type="button"
              className="wb-popover-close wb-syllabus-popover-close"
              onClick={() => setActivePopover(null)}
              aria-label="Close Syllabus"
            >
              ×
            </button>
          </div>

          <div className="wb-syllabus-accordion-body">
            {CSS_CURRICULUM.map((mod) => {
              const isModExpanded = expandedModules[mod.id] ?? true;
              const modCompletedCount = mod.topics.filter((t) => completed.includes(t.id)).length;
              const isModComplete = modCompletedCount === mod.topics.length;
              const isModLocked = !isAuthenticated && mod.moduleNum > 1;

              return (
                <div key={mod.id} className="wb-module-accordion-section">
                  <button
                    type="button"
                    className="wb-module-accordion-header wb-syllabus-module-btn"
                    onClick={() => toggleModuleExpanded(mod.id)}
                    aria-expanded={isModExpanded}
                  >
                    <div className="wb-module-header-title">
                      <span className="wb-module-tag">M{mod.moduleNum}</span>
                      <strong>{mod.title}</strong>
                      {isModLocked && (
                        <span className="wb-module-lock-tag">🔒 STUDENT TRACK</span>
                      )}
                    </div>
                    <div className="wb-module-header-meta">
                      <span className={`wb-module-done-pill ${isModComplete ? "is-all-done" : ""}`}>
                        {modCompletedCount}/{mod.topics.length}
                      </span>
                      <span className="wb-module-chevron">{isModExpanded ? "▾" : "▸"}</span>
                    </div>
                  </button>

                  {isModExpanded && (
                    <div className="wb-module-topics-list">
                      {mod.topics.map((t) => {
                        const isDone = completed.includes(t.id);
                        const globalIdx = FLAT_TOPICS.findIndex((f) => f.id === t.id);
                        const isActive = globalIdx === currentIndex;
                        const isLocked = isTopicLockedForGuest(globalIdx);

                        return (
                          <button
                            type="button"
                            key={t.id}
                            className={`wb-topic-row-btn wb-syllabus-topic-item ${isActive ? "is-active" : ""} ${isLocked ? "is-locked" : ""}`}
                            onClick={() => {
                              if (isLocked) {
                                try { soundManager.warning(); } catch {}
                                setShowGuestLockModal(true);
                              } else {
                                goTopic(globalIdx);
                                setActivePopover(null);
                              }
                            }}
                          >
                            <span className={`wb-topic-status-dot ${isDone ? "is-done" : ""} ${isLocked ? "is-locked-dot" : ""}`}>
                              {isDone ? "✓" : isLocked ? "🔒" : t.topicCode}
                            </span>
                            <span className="wb-topic-name">{t.title}</span>
                            {isLocked && (
                              <span className="wb-topic-lock-label">LOCKED</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {!isAuthenticated && (
              <div className="wb-syllabus-unlock-banner">
                <div className="wb-unlock-banner-content">
                  <span className="wb-unlock-banner-icon">🎓</span>
                  <div className="wb-unlock-banner-text">
                    <strong>Unlock All 6 Modules &amp; Verified E-Certificate</strong>
                    <p>
                      Guest preview includes Module 1. Link your Google account to access all 19 topics and earn an accredited PTC-IICT certificate.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="wb-unlock-banner-btn"
                  onClick={() => {
                    setActivePopover(null);
                    setShowGuestLockModal(true);
                  }}
                >
                  Connect Google Account &amp; Unlock Free →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ MAIN WORKBENCH COLUMN ══ */}
      <div className="wb-main-column">
        {/* ══ CLEAN TOP HUD: TITLE + DYNAMIC TOPIC PROGRESS + ACTIONS (NO CLOCK BLOAT) ══ */}
        <header className="wb-top-header" role="banner">
          <div className="wb-title-block">
            <h1 className="wb-app-title">LEARN HARDWARE</h1>
            <p className="wb-app-sub">
              EXPLORE &middot; UNDERSTAND &middot; BUILD &mdash; COMPUTER SYSTEMS SERVICING (CSS)
            </p>
          </div>

          <div className="wb-header-right">
            <button
              type="button"
              className={`wb-hud-pill wb-tour-btn ${tourActive ? "is-active" : ""}`}
              onClick={tourActive ? () => dismissTour(false) : () => startTour(0)}
              data-tooltip={tourActive ? "Close guided tour (Esc)" : "Tour the 3 workbench zones with B.O.B."}
              aria-label={tourActive ? "Stop tour" : "Start guide tour"}
            >
              <span className="wb-tour-icon">{tourActive ? "✕" : "💡"}</span>
              <span>{tourActive ? "STOP TOUR" : "GUIDE ME"}</span>
            </button>

            {/* Dynamic Module & Topic Progress Indicator */}
            <div className="wb-hud-pill" id="wb-zone-hud">
              <div className="wb-hud-track">
                <span className="wb-hud-icon">📖</span>
                <div className="wb-hud-bar-wrap">
                  <div className="wb-hud-bar-top">
                    <span>MODULE {currentTopic.moduleNum}</span>
                    <span className="wb-hud-divider">•</span>
                    <strong>
                      TOPIC {currentIndex + 1}/{FLAT_TOPICS.length}
                    </strong>
                  </div>
                  <div className="wb-hud-progress">
                    <div className="wb-hud-progress-fill" style={{ width: `${progressPct}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="wb-stage-cta wb-cta-studio"
              onClick={() => {
                try { soundManager.granted(); } catch {}
                unlockStage("studio");
                navigate("/3d-builder?learn=true");
              }}
              data-tooltip="Open 3D PC Builder Sandbox"
              aria-label="Open 3D Studio"
            >
              3D STUDIO →
            </button>

            <button
              type="button"
              className="wb-stage-cta wb-cta-cert"
              onClick={handleCertClick}
              data-tooltip="View or Download Verified Certificate"
              aria-label="View Certificate"
            >
              🎓 CERT ({progressPct}%)
            </button>
          </div>
        </header>

        {/* ══ 2-FOCUSED ZONE WORKBENCH: CENTER 3D CANVAS + RIGHT CSS PRE-LAB GUIDE ══ */}
        <div className="wb-workbench-body">
          {/* ══ ZONE 1: CENTER 3D HARDWARE STAGE (BREATHING ROOM, NO BOTTOM STRIP) ══ */}
          <section
            id="wb-zone-stage"
            className="wb-center-stage"
            aria-label="Interactive 3D Hardware Board"
          >
            <LearnHardwareStage
              specimenKey={currentTopic.specimenKey}
              selectedBuildPart={currentBuild?.[currentTopic.specimenKey] || null}
              lessonTitle={currentTopic.title}
              hotspots={ARTICLE_HOTSPOTS}
              selectedHotspotId={selectedHotspotId}
              onSelectHotspotId={(id) => {
                setSelectedHotspotId(id);
                if (id) {
                  const hs = ARTICLE_HOTSPOTS.find((h) => h.id === id);
                  if (hs) {
                    setBobSpeech(`Examining ${hs.label}: ${hs.role}. Rule: ${hs.tip}`);
                  }
                }
              }}
              onOpenVideo={handleOpenLectureFilm}
              theme={workbenchTheme}
              onToggleTheme={toggleTheme}
            />
          </section>

          {/* ══ ZONE 2: RIGHT PRACTICAL CSS PRE-LAB GUIDE CARD ══ */}
          <aside
            id="wb-zone-dock"
            className="wb-right-dock"
            ref={rightDockRef}
            aria-label="CSS Pre-Lab Guide & Practical Reference"
          >
            <div className="wb-css-guide-card" ref={guideCardRef}>
              {/* 1. Header & YouTube Lecture Player */}
              <div className="wb-guide-header">
                <div className="wb-guide-meta-row">
                  <span className="wb-module-badge">
                    MODULE {currentTopic.moduleNum} // {currentTopic.moduleTitle.toUpperCase()}
                  </span>
                  {completed.includes(currentTopic.id) && (
                    <span className="wb-topic-done-badge">✓ COMPLETED</span>
                  )}
                </div>
                <h2 className="wb-topic-main-title">{currentTopic.title}</h2>
              </div>

              {/* Collapsible 16:9 YouTube Lecture Video Card */}
              <div className={`wb-lecture-video-card ${videoHighlighted ? "is-highlighted" : ""}`}>
                <button
                  type="button"
                  className="wb-video-card-head"
                  onClick={() => setVideoExpanded((v) => !v)}
                  aria-expanded={videoExpanded}
                >
                  <div className="wb-video-head-left">
                    <span className="wb-video-play-icon">📺</span>
                    <strong>Lecture Video: {currentTopic.videoTitle}</strong>
                  </div>
                  <span className="wb-video-toggle-chevron">
                    {videoExpanded ? "▴ Hide Video" : "▾ Watch Video"}
                  </span>
                </button>

                                {videoExpanded && (
                  <>
                    <div className="wb-video-frame-wrap">
                      <iframe
                        className="wb-video-iframe"
                        src={`https://www.youtube-nocookie.com/embed/${currentTopic.youtubeId}?rel=0&modestbranding=1`}
                        title={`${currentTopic.title} Lecture Video`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                    <div className="wb-video-fallback-bar">
                      <span>Video playback issue?</span>
                      <a
                        href={`https://www.youtube.com/watch?v=${currentTopic.youtubeId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="wb-video-external-link"
                      >
                        ▶ Open on YouTube ↗
                      </a>
                    </div>
                  </>
                )}
              </div>

              {/* 2. Core Explanation */}
              <div className="wb-guide-section">
                <h3 className="wb-section-heading">Core Concept</h3>
                <p className="wb-guide-explanation-text">{currentTopic.explanation}</p>
              </div>

              {/* 3. Quick Field Fact Box */}
              <div className="wb-field-fact-card">
                <div className="wb-fact-head">
                  <span className="wb-fact-icon">⚡</span>
                  <strong className="wb-fact-title">
                    FIELD REFERENCE // {currentTopic.fieldFact.title}
                  </strong>
                  <span className="wb-fact-badge">{currentTopic.fieldFact.badge}</span>
                </div>
                <div className="wb-fact-items-grid">
                  {currentTopic.fieldFact.items.map((item, i) => (
                    <div key={i} className="wb-fact-item-row">
                      <div className="wb-fact-item-label">
                        <span
                          className="wb-fact-tag"
                          style={{ borderColor: item.color, color: item.color }}
                        >
                          {item.tag}
                        </span>
                        <strong>{item.label}</strong>
                      </div>
                      <span className="wb-fact-item-val">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Avoid This Lab Mistake (Warning Callout Box) */}
              <div className="wb-mistake-warning-card">
                <div className="wb-warning-head">
                  <span className="wb-warning-icon">⚠️</span>
                  <strong>AVOID THIS MISTAKE IN LAB</strong>
                </div>
                <p className="wb-warning-desc">{currentTopic.mistakeWarning.desc}</p>
              </div>

              {/* 5. 3D Action & 1-Question Quick Check */}
              <div className="wb-action-and-check-section">
                <div className="wb-inspect-3d-banner">
                  <div className="wb-inspect-3d-info">
                    <span className="wb-inspect-icon">🔍</span>
                    <div>
                      <strong>Inspect Specimen in 3D</strong>
                      <span>Focus the camera on physical component &amp; socket keying</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="wb-inspect-3d-btn"
                    onClick={handleInspectIn3D}
                  >
                    Inspect in 3D ⌖
                  </button>
                </div>

                {/* Spot The Lab Mistake Quiz */}
                <div className="wb-quick-check-card">
                  <div className="wb-quiz-header">
                    <span className="wb-quiz-icon">📝</span>
                    <strong>SPOT THE LAB MISTAKE // 1-QUESTION QUICK CHECK</strong>
                  </div>
                  <p className="wb-quiz-question">{currentTopic.quiz.question}</p>

                  <div className="wb-quiz-options-list">
                    {currentTopic.quiz.options.map((opt, optIdx) => {
                      const isSelected = selectedQuizOption === optIdx;
                      let optionClass = "wb-quiz-opt-btn";
                      if (isSelected) {
                        optionClass += opt.correct ? " is-correct" : " is-incorrect";
                      }
                      return (
                        <button
                          type="button"
                          key={optIdx}
                          className={optionClass}
                          onClick={() => handleSelectQuizOption(optIdx, opt.correct)}
                        >
                          <span className="wb-opt-letter">{["A", "B", "C", "D"][optIdx]}</span>
                          <span className="wb-opt-text">{opt.text}</span>
                          {isSelected && (
                            <span className="wb-opt-feedback-icon">
                              {opt.correct ? "✓" : "✕"}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {quizAnswerStatus === "correct" && (
                    <div className="wb-quiz-explanation-box success">
                      <span className="wb-quiz-expl-title">✓ Correct! Lab Mistake Avoided:</span>
                      <p>{currentTopic.quiz.explanation}</p>
                    </div>
                  )}

                  {quizAnswerStatus === "incorrect" && (
                    <div className="wb-quiz-explanation-box error">
                      <span className="wb-quiz-expl-title">✕ Incorrect procedure:</span>
                      <p>Review the warning callout above and try selecting the correct safety procedure!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 6. Linear Topic Navigation Footer */}
              {(() => {
                const isTopicCompleted = completed.includes(currentTopic.id);
                const isPreviewEnd = !isAuthenticated && currentIndex === 2;

                return (
                  <div className="wb-dock-nav-footer">
                    <button
                      type="button"
                      className="wb-nav-step-btn wb-btn-prev"
                      onClick={handlePrevTopic}
                      disabled={currentIndex === 0}
                    >
                      ← Previous
                    </button>
                    <span className="wb-nav-step-counter">
                      Topic {currentIndex + 1} of {FLAT_TOPICS.length}
                    </span>
                    <button
                      type="button"
                      className={`wb-nav-step-btn wb-btn-next ${!isTopicCompleted ? "is-locked" : ""} ${isPreviewEnd ? "is-preview-unlock" : ""}`}
                      onClick={handleNextTopic}
                      disabled={!isTopicCompleted}
                      data-tooltip={
                        !isTopicCompleted
                          ? "Answer the Quick Check quiz above to unlock"
                          : isPreviewEnd
                          ? "Link Google account to unlock Module 2–6 and Certificate"
                          : "Proceed to next topic"
                      }
                    >
                      {currentIndex + 1 === FLAT_TOPICS.length
                        ? "Claim Certificate 🎓"
                        : isPreviewEnd
                        ? "Unlock Full Academy 🎓"
                        : "Next Topic →"}
                    </button>
                  </div>
                );
              })()}
            </div>
          </aside>
        </div>
      </div>

      {/* ══ STAGE UNLOCK BANNER MODAL ══ */}
      {showUnlockBanner && (
        <StageUnlockBanner
          currentStage="learn"
          stageNumber="03"
          stageName="Learn Hardware"
          badge="LEARN TRACK // STAGE 03"
          accentColor="#00e5a0"
          learnerProfile={userProfile}
          requireConfirm={true}
          ctaLabel="ENTER HARDWARE ACADEMY →"
          onDismiss={() => {
            setShowUnlockBanner(false);
            markBannerSeen("learn");
            try {
              if (localStorage.getItem("buildlab_learn_syllabus_seen") !== "true") {
                setShowSyllabusWelcome(true);
                setBobIsCenter(true);
                try { soundManager.granted(); } catch {}
                setBobSpeech(
                  "Welcome to the CSS Hardware Academy! I've loaded your 6 modules and 19 interactive topics. Ready for the grand tour?"
                );
              }
            } catch {}
          }}
        />
      )}

      {/* ══ FIRST-TIME WELCOME TO CSS SYLLABUS OVERLAY BANNER ══ */}
      {showSyllabusWelcome && (
        <div
          className="wb-welcome-overlay-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Welcome to CSS Hardware Academy"
        >
          <div className="wb-welcome-overlay-card">
            <div className="wb-welcome-badge">
              <span className="wb-welcome-badge-dot" />
              <span>STAGE 03 // GRADE 11 CSS HARDWARE ACADEMY</span>
            </div>
            <h1 className="wb-welcome-title">WELCOME TO THE CSS SYLLABUS</h1>
            <p className="wb-welcome-subtitle">
              Master computer systems servicing from the silicon up. Hands-on 3D hardware inspection, practical field facts, lab safety precautions, and accredited student certification.
            </p>

            <div className="wb-welcome-highlights">
              <div className="wb-welcome-chip">
                <span className="chip-icon">🖥️</span>
                <div>
                  <strong>Interactive 3D PC Workbench</strong>
                  <span>Rotate, zoom, and inspect physical sockets &amp; keyed connectors</span>
                </div>
              </div>
              <div className="wb-welcome-chip">
                <span className="chip-icon">📺</span>
                <div>
                  <strong>Video Lectures &amp; Field Facts</strong>
                  <span>Watch YouTube tutorials and master real-world lab safety standards</span>
                </div>
              </div>
              <div className="wb-welcome-chip">
                <span className="chip-icon">🎓</span>
                <div>
                  <strong>Accredited CSS Student Certification</strong>
                  <span>Complete quick checks across all 19 topics to earn your verified credential</span>
                </div>
              </div>
            </div>

            <div className="wb-welcome-actions">
              <button
                type="button"
                className="wb-welcome-start-btn"
                onClick={handleStartWorkbenchTour}
              >
                🚀 START WORKBENCH TOUR
              </button>
              <button
                type="button"
                className="wb-welcome-skip-btn"
                onClick={handleDismissSyllabusWelcome}
              >
                Skip Tour &amp; Jump In
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ WINDOWS 11 SNIPPING TOOL SPOTLIGHT WALKTHROUGH PORTAL ══ */}
      {tourActive && spotlightRect && (
        <div className="wb-snipping-portal" aria-live="polite">
          <svg className="wb-snip-cutout-svg" aria-hidden="true">
            <defs>
              <mask id="wb-snip-mask">
                <rect x="0" y="0" width="100%" height="100%" fill="#ffffff" />
                <rect
                  x={spotlightRect.left}
                  y={spotlightRect.top}
                  width={spotlightRect.width}
                  height={spotlightRect.height}
                  rx={spotlightRect.borderRadius || 14}
                  ry={spotlightRect.borderRadius || 14}
                  fill="#000000"
                />
              </mask>
            </defs>
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="rgba(4, 7, 14, 0.88)"
              mask="url(#wb-snip-mask)"
            />
          </svg>

          <div
            className="wb-snip-highlight-ring"
            style={{
              top: `${spotlightRect.top}px`,
              left: `${spotlightRect.left}px`,
              width: `${spotlightRect.width}px`,
              height: `${spotlightRect.height}px`,
              borderRadius: `${spotlightRect.borderRadius || 14}px`,
            }}
          />

          {(() => {
            const placement = getCalloutPlacement(tourStepIndex, spotlightRect);
            const step = TOUR_STEPS[tourStepIndex];
            if (!step) return null;

            return (
              <div
                className={`wb-snip-callout-card dir-${placement.dir}`}
                style={placement.style}
                role="dialog"
                aria-label={`Guide: ${step.name}`}
              >
                <div className={`wb-tech-pointer dir-${placement.dir}`}>
                  <span className="wb-pointer-ping-dot" />
                  <span className="wb-pointer-stem" />
                </div>

                <div className="wb-callout-top">
                  <div className="wb-callout-bob-brand">
                    <div className="wb-mini-bob-avatar" aria-hidden="true">
                      <span className="mini-bob-eye left" />
                      <span className="mini-bob-eye right" />
                    </div>
                    <div className="wb-callout-bob-meta">
                      <strong>B.O.B. GUIDE</strong>
                      <span>ZONE {tourStepIndex + 1} OF {TOUR_STEPS.length}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="wb-callout-close-x"
                    onClick={() => dismissTour(false)}
                    data-tooltip="Close Guide (Esc)"
                    aria-label="Close Guide"
                  >
                    ✕
                  </button>
                </div>

                <h3 className="wb-callout-zone-title">{step.name}</h3>
                <p className="wb-callout-body-text">{step.speech}</p>

                <div className="wb-callout-foot">
                  <div className="wb-callout-step-dots">
                    {TOUR_STEPS.map((_, i) => (
                      <button
                        type="button"
                        key={i}
                        className={`wb-callout-step-dot ${i === tourStepIndex ? "is-active" : ""}`}
                        onClick={() => goToStep(i)}
                        data-tooltip={TOUR_STEPS[i].name}
                        aria-label={`Jump to ${TOUR_STEPS[i].name}`}
                      />
                    ))}
                  </div>

                  <div className="wb-callout-actions">
                    {tourStepIndex > 0 && (
                      <button
                        type="button"
                        className="wb-callout-action-btn wb-btn-prev"
                        onClick={handleTourPrevStep}
                        data-tooltip="Previous Zone"
                      >
                        ‹ Prev
                      </button>
                    )}
                    <button
                      type="button"
                      className="wb-callout-action-btn wb-btn-gotit"
                      onClick={handleTourNextStep}
                      data-tooltip="Confirm and proceed"
                    >
                      {tourStepIndex + 1 === TOUR_STEPS.length ? "Got It! Start Lab ✓" : "Got It →"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}


      {/* ══ GUEST PREVIEW UNLOCK MODAL (PERSUASIVE E-CERTIFICATE & FULL ACADEMY) ══ */}
      {showGuestLockModal && (
        <div
          className="wb-welcome-overlay-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Unlock Full Curriculum & E-Certificate"
        >
          <div className="wb-welcome-overlay-card wb-guest-lock-card">
            <div className="wb-welcome-badge">
              <span className="wb-welcome-badge-dot" />
              <span>GUEST PREVIEW COMPLETED // UNLOCK FULL ACADEMY</span>
            </div>
            <h1 className="wb-welcome-title">UNLOCK FULL CSS CURRICULUM &amp; E-CERTIFICATE</h1>
            <p className="wb-welcome-subtitle">
              You are exploring in Guest Preview. Link your Google account to unlock all 6 modules, 19 interactive topics, and claim your accredited PTC-IICT Certificate of Completion.
            </p>

            <div className="wb-welcome-highlights">
              <div className="wb-welcome-chip">
                <span className="chip-icon">🎓</span>
                <div>
                  <strong>Official Verified E-Certificate</strong>
                  <span>Earn an official credential with your full name, student ID, and accredited course hours.</span>
                </div>
              </div>
              <div className="wb-welcome-chip">
                <span className="chip-icon">🔓</span>
                <div>
                  <strong>Complete 6 Modules • 19 Topics</strong>
                  <span>Unlock CPU socket pins, RAM dual-channel rules, USB color codes, PSU safety, airflow physics, and POST debugging.</span>
                </div>
              </div>
              <div className="wb-welcome-chip">
                <span className="chip-icon">✨</span>
                <div>
                  <strong>Personalized Interest Matching</strong>
                  <span>Tailor learning challenges to your specific strand (CSS, ICT, BSIT) and hardware goals.</span>
                </div>
              </div>
            </div>

            <div className="wb-welcome-actions">
              <button
                type="button"
                className="wb-welcome-start-btn"
                onClick={() => {
                  setShowGuestLockModal(false);
                  setShowAccountModal(true);
                }}
              >
                🚀 Connect Google Account &amp; Unlock Free
              </button>
              <button
                type="button"
                className="wb-welcome-skip-btn"
                onClick={() => setShowGuestLockModal(false)}
              >
                Keep Exploring Module 1 Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── GOOGLE SIGN-IN & TELL US ABOUT YOU MODAL ── */}
      <AccountSetupModal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        onConfirmed={(newMode, newProfile) => {
          setShowAccountModal(false);
          setShowGuestLockModal(false);
          if (currentIndex === 2) {
            setCurrentIndex(3);
          }
        }}
      />

      {/* ══ B.O.B. COMPANION IN LEFT RAIL ══ */}
      <BobCompanion
        context="learn"
        activeTopic={currentTopic.title}
        externalSpeech={bobSpeech}
        dockRight={20}
        size={bobIsCenter ? 88 : leftRailOpen ? 64 : 46}
        isCenter={bobIsCenter}
        onLaunchLab={() => {
          try { soundManager.install(); } catch {}
          navigate(`/3d-builder?stage=${currentTopic.specimenKey}&learn=true`);
        }}
      />
    </div>
  );
}
