import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useBuild } from "../../contexts/BuildContext";
import { useLearnMode } from "../../contexts/LearnModeContext";
import LearnHardwareStage from "./LearnHardwareStage";
import LessonPresentationView from "./LessonPresentationView";
import VirtualAssemblyLab from "./VirtualAssemblyLab";
import ModuleQuizModal from "./ModuleQuizModal";
import CourseBriefingOverlay from "./CourseBriefingOverlay";
import StudentDashboard from "../Dashboard/StudentDashboard";
import BobCompanion from "../BobCompanion/BobCompanion";
import StageUnlockBanner from "../Navigation/StageUnlockBanner";
import AccountSetupModal from "../Home/AccountSetupModal";
import soundManager from "../../utilities/soundManager";
import {
  toggleFullscreen,
  isFullscreenActive,
  onViewportChange,
} from "../../utilities/fullscreen";
import { getStudentQuizRecords } from "./moduleQuizzes";
import { getLessonModuleContent } from "./lessonModuleContent";
import {
  CSS_CURRICULUM,
  FLAT_TOPICS,
  TOTAL_TOPICS_COUNT,
  TOTAL_MODULES_COUNT,
} from "./curriculumData";
import { ARTICLE_HOTSPOTS } from "./articleHotspots";
import "./CourseShell.css";

/* ═══════════════════════════════════════════════════════════════════
   BUILDLAB HARDWARE WORKBENCH // COMPUTER SYSTEMS SERVICING (CSS)
   Grade 11 Pre-Lab Curriculum: 7 Modules • 17 Sequential Topics
   2-Zone Layout: 3D Hardware Workbench + CSS Pre-Lab Guide & Video
   ═══════════════════════════════════════════════════════════════════ */

const PROGRESS_KEY = "buildlab.learn.progress.v1";
const VIDEO_KEY = "buildlab.learn.video.v1";
const QUIZ_KEY = "buildlab.learn.quiz.v1";

// Per-topic gates: a topic is only "done" once BOTH the lecture was watched
// and the quick check was answered correctly. Both are email-scoped like progress.
const readTopicFlags = (baseKey, email) => {
  try {
    const scopedKey = email ? `${baseKey}.${email}` : null;
    const rawStr =
      (scopedKey && localStorage.getItem(scopedKey)) ||
      localStorage.getItem(baseKey) ||
      "[]";
    const raw = JSON.parse(rawStr);
    return Array.isArray(raw) ? raw.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
};

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

/* ──────────────── SHORTENED & SIMPLIFIED SYLLABUS DIRECTORY TITLES ──────────────── */
const SHORT_MODULE_TITLES = {
  1: "Lab Safety & Workspace",
  2: "Motherboard Architecture",
  3: "CPU & Thermal Cooling",
  4: "RAM & M.2 NVMe Storage",
  5: "GPU & Modular Power",
  6: "Chassis, Airflow & Cabling",
  7: "Assembly & POST Test",
};

const SHORT_TOPIC_TITLES = {
  "1.1-esd-prep": "ESD & Workspace Setup",
  "1.2-safe-handling": "Safe Component Handling",
  "1.3-screws-tools": "Standoffs, Screws & Tools",
  "2.1-motherboard-anatomy": "Motherboard Form Factors",
  "2.2-chipset-vrm": "Chipsets & VRM Power",
  "2.3-io-and-headers": "Rear I/O & Front Headers",
  "3.1-cpu-silicon-socket": "Socket Pinout & Alignment",
  "3.2-thermal-paste-coolers": "Thermal Compound & Cooler",
  "4.1-ram-dual-channel": "RAM Dual-Channel Rules",
  "4.2-storage-m2-nvme": "M.2 NVMe Storage Slots",
  "5.1-gpu-pcie-slots": "PCIe x16 GPU Installation",
  "5.2-psu-efficiency-cables": "Modular PSU & Power Rails",
  "6.1-airflow-physics": "Chassis Positive Airflow",
  "6.2-cable-management": "Front Panel Headers & Wiring",
  "7.1-bench-testing": "Pre-Assembly Bench Staging",
  "7.2-hands-on-assembly": "3D PC Assembly Lab",
  "7.3-post-ez-debug": "POST & Debug Diagnostics",
};

/* 3D benchmark hotspots live in ./articleHotspots.js — shared with LearnHardwareStage. */

/* ─────────────────────── 3-STEP ONBOARDING TOUR ─────────────────────── */
const TOUR_STEPS = [
  {
    id: "wb-zone-stage",
    name: "Interactive 3D PC Workbench",
    desc: "360° orbital view, live bus flow, and clickable hotspots for socket inspection.",
    speech:
      "This is your 3D workbench! Drag to spin it, scroll to zoom, and tap the glowing dots to see parts up close.",
    direction: "stage",
  },
  {
    id: "wb-zone-dock",
    name: "CSS Pre-Lab Guide & Video",
    desc: "16:9 lecture video, field facts, lab safety warnings, and 1-question quick check.",
    speech:
      "Here is your lesson guide: watch the video, catch common mistakes, and answer the quick question to pass!",
    direction: "left",
  },
  {
    id: "wb-zone-rail",
    name: "Syllabus Modules & Certificate Progress",
    desc: `Browse ${TOTAL_MODULES_COUNT} modules with ${TOTAL_TOPICS_COUNT} sequential topics, track progress, and earn your certificate.`,
    speech:
      "Use this menu to pick any topic anytime and watch your certificate progress grow.",
    direction: "right",
  },
];

export default function CourseShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentBuild } = useBuild();
  const { mode, userProfile, seenBanners, markBannerSeen, unlockStage } = useLearnMode();

  // Stage unlock banner state - transient auto-fading banner on very first stage transition
  const [showUnlockBanner, setShowUnlockBanner] = useState(() => {
    try {
      const alreadySeen =
        localStorage.getItem("buildlab_learn_stage_banner_seen") === "true" ||
        localStorage.getItem("buildlab_learn_syllabus_seen") === "true";
      const progress = readProgress(userProfile?.email);
      // Never display if student already visited, has progress, or has seen banner before
      if (alreadySeen || progress.length > 0) return false;
      return mode === "learn" && !seenBanners?.learn;
    } catch {
      return false;
    }
  });

  // Workbench visual theme: 'dark' (clean pro slate) or 'light' (soft glare-free titanium)
  const [workbenchTheme, setWorkbenchTheme] = useState(() => {
    try {
      const savedLearn = localStorage.getItem("buildlab_learn_theme");
      const savedGlobal = localStorage.getItem("buildlab_theme");
      const initial = savedLearn || savedGlobal;
      if (initial === "light" || initial === "blueprint") return "light";
      return "dark";
    } catch {
      return "dark";
    }
  });

  const isLight = workbenchTheme === "light";

  const toggleTheme = useCallback(() => {
    try { soundManager.click(); } catch {}
    setWorkbenchTheme((prev) => {
      const nextTheme = prev === "light" ? "dark" : "light";
      try {
        localStorage.setItem("buildlab_learn_theme", nextTheme);
        localStorage.setItem("buildlab_theme", nextTheme);
        document.documentElement.setAttribute("data-theme", nextTheme);
        document.body.className = `theme-${nextTheme}`;
      } catch {}
      return nextTheme;
    });
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("buildlab_learn_theme", workbenchTheme);
      localStorage.setItem("buildlab_theme", workbenchTheme);
      document.documentElement.setAttribute("data-theme", workbenchTheme);
      document.body.className = `theme-${workbenchTheme}`;
    } catch {}
  }, [workbenchTheme]);

  // Exploded View for 3D Hardware Workbench (Topic exploration)
  const [isExploded, setIsExploded] = useState(false);

  const [bobIsCenter, setBobIsCenter] = useState(false);

  // Windows 11 Snipping Tool Spotlight Walkthrough State
  const [tourActive, setTourActive] = useState(false);
  const [tourStepIndex, setTourStepIndex] = useState(0);
  const tourStepIndexRef = useRef(0);
  const [spotlightRect, setSpotlightRect] = useState(null);
  const tourTimerRef = useRef(null);

  // Left Rail & Popover Drawers (collapsed by default)
  const [leftRailOpen, setLeftRailOpen] = useState(false);
  const [activePopover, setActivePopover] = useState(null); // null | 'lessons'
  const [expandedModules, setExpandedModules] = useState({
    m1: true,
    m2: true,
    m3: true,
    m4: true,
    m5: true,
    m6: true,
    m7: true,
  });

  // Curriculum Navigation & Progress
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState(() => readProgress(userProfile?.email));
  const [videoWatched, setVideoWatched] = useState(() => readTopicFlags(VIDEO_KEY, userProfile?.email));
  const [quizPassed, setQuizPassed] = useState(() => readTopicFlags(QUIZ_KEY, userProfile?.email));
  const [isFs, setIsFs] = useState(() => isFullscreenActive());

  useEffect(() => {
    const sync = () => setIsFs(isFullscreenActive());
    const unsub = onViewportChange(sync);
    sync();
    return unsub;
  }, []);

  // Sync completed topics if learner email loads after initial mount
  useEffect(() => {
    if (userProfile?.email) {
      const userProgress = readProgress(userProfile.email);
      if (userProgress.length > 0) {
        setCompleted(userProgress);
      }
      const watched = readTopicFlags(VIDEO_KEY, userProfile.email);
      const checked = readTopicFlags(QUIZ_KEY, userProfile.email);
      if (watched.length) setVideoWatched(watched);
      if (checked.length) setQuizPassed(checked);
    }
  }, [userProfile?.email]);

  // Dual-Phase Center View: 'presentation' (Slide/Report Theory & Visuals) vs '3d-lab' (3D Hardware Inspection)
  const [centerMode, setCenterMode] = useState("3d-lab");
  const [presentationPage, setPresentationPage] = useState(0);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizModuleNum, setQuizModuleNum] = useState(1);
  const [active3DStepIdx, setActive3DStepIdx] = useState(0);

  // Student Dashboard Overlay over 3D Stage
  const [showDashboardOverlay, setShowDashboardOverlay] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get("view") === "dashboard";
    } catch {
      return false;
    }
  });

  // The 3D workbench is the first screen. The course briefing is opt-in from the header.
  const [showBriefingOverlay, setShowBriefingOverlay] = useState(false);

  const wasVideoPlayingRef = useRef(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Check URL query parameters or location state for dashboard view or topic jump
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("view") === "dashboard" || location.state?.openDashboard) {
      setShowDashboardOverlay(true);
    }
    const quizParam = params.get("quiz");
    if (quizParam !== null) {
      const qNum = Number(quizParam);
      if (!isNaN(qNum) && qNum >= 1 && qNum <= 7) {
        setQuizModuleNum(qNum);
        setShowQuizModal(true);
      }
    }
    const topicParam = params.get("topic");
    if (topicParam !== null) {
      const idx = Number(topicParam);
      if (!isNaN(idx) && idx >= 0 && idx < FLAT_TOPICS.length) {
        setCurrentIndex(idx);
      }
    }
    if (params.get("mode") === "3d-lab") {
      setCenterMode("3d-lab");
    }
  }, [location.search, location.state]);

  // Listen for global custom event to toggle dashboard
  useEffect(() => {
    const handleToggle = (e) => {
      setShowDashboardOverlay(e.detail?.open !== undefined ? e.detail.open : (prev) => !prev);
    };
    window.addEventListener("buildlab:toggle-dashboard", handleToggle);
    return () => window.removeEventListener("buildlab:toggle-dashboard", handleToggle);
  }, []);

  // Track YouTube player state to resume appropriately
  useEffect(() => {
    const handleYTMessage = (e) => {
      try {
        const data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        if (data) {
          if (data.event === "onStateChange") {
            const state = data.info;
            if (state === 1) {
              wasVideoPlayingRef.current = true;
              setIsVideoPlaying(true);
            } else if (state === 2 || state === 0) {
              wasVideoPlayingRef.current = false;
              setIsVideoPlaying(false);
            }
          } else if (data.event === "infoDelivery" && data.info && data.info.playerState !== undefined) {
            const state = data.info.playerState;
            if (state === 1) {
              wasVideoPlayingRef.current = true;
              setIsVideoPlaying(true);
            } else if (state === 2 || state === 0) {
              wasVideoPlayingRef.current = false;
              setIsVideoPlaying(false);
            }
          }
        }
      } catch {}
    };
    window.addEventListener("message", handleYTMessage);
    return () => window.removeEventListener("message", handleYTMessage);
  }, []);

  // Pause lecture video when dashboard opens, resume when it closes
  useEffect(() => {
    const iframe = document.querySelector(".wb-video-iframe");
    if (!iframe || !iframe.contentWindow) return;

    if (showDashboardOverlay) {
      try {
        iframe.contentWindow.postMessage(
          JSON.stringify({ event: "command", func: "pauseVideo", args: [] }),
          "*"
        );
        setIsVideoPlaying(false);
      } catch {}
    } else {
      if (wasVideoPlayingRef.current) {
        try {
          iframe.contentWindow.postMessage(
            JSON.stringify({ event: "command", func: "playVideo", args: [] }),
            "*"
          );
          setIsVideoPlaying(true);
        } catch {}
      }
    }
  }, [showDashboardOverlay]);

  // Close dashboard on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && showDashboardOverlay) {
        setShowDashboardOverlay(false);
        try { soundManager.click(); } catch {}
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showDashboardOverlay]);

  // Resume / Jump to target topic from Dashboard navigation state
  useEffect(() => {
    if (
      location.state?.targetTopicIndex !== undefined &&
      location.state?.targetTopicIndex !== null
    ) {
      const target = Number(location.state.targetTopicIndex);
      if (!isNaN(target) && target >= 0 && target < FLAT_TOPICS.length) {
        setCurrentIndex(target);
      }
    }
  }, [location.state]);

  // Current active topic
  const currentTopic = FLAT_TOPICS[currentIndex] || FLAT_TOPICS[0];

  useEffect(() => {
    if (location.state?.openQuiz) {
      setQuizModuleNum(Number(location.state.moduleNum) || currentTopic.moduleNum);
      setShowQuizModal(true);
    }
    if (location.state?.centerMode) {
      setCenterMode(location.state.centerMode);
    }
  }, [location.state, currentTopic.moduleNum]);

  // When changing topic, reset the 3D stepper. The workbench opens in 3D first;
  // the reading document is a separate tab. Viewing a topic no longer marks it done.
  useEffect(() => {
    setActive3DStepIdx(0);
    setPresentationPage(0);
  }, [currentIndex, currentTopic?.id]);

  const currentLessonContent = useMemo(() => {
    return getLessonModuleContent(currentTopic);
  }, [currentTopic]);

  // Right Panel Video & Interactive State
  const [videoExpanded, setVideoExpanded] = useState(true);
  const [videoHighlighted, setVideoHighlighted] = useState(false);
  const currentModule = useMemo(() => {
    return CSS_CURRICULUM.find((m) => m.moduleNum === currentTopic.moduleNum) || CSS_CURRICULUM[0];
  }, [currentTopic.moduleNum]);

  const moduleTopics = useMemo(() => {
    return currentModule?.topics || [];
  }, [currentModule]);

  const isLastTopicOfModule = useMemo(() => {
    if (!moduleTopics.length) return false;
    return moduleTopics[moduleTopics.length - 1].id === currentTopic.id;
  }, [moduleTopics, currentTopic.id]);

  const isModuleTopicsCompleted = useMemo(() => {
    if (!moduleTopics.length) return false;
    return moduleTopics.every((t) => completed.includes(t.id));
  }, [moduleTopics, completed]);

  const quizRecords = useMemo(() => {
    return getStudentQuizRecords(userProfile?.email);
  }, [userProfile?.email, showQuizModal]);
  const isCurrentModuleQuizPassed = Boolean(quizRecords[currentTopic.moduleNum]?.passed);

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
    userProfile?.setupCompleted && (userProfile?.fullName || userProfile?.email)
  );

  const learnerDisplayName =
    userProfile?.fullName ||
    (isAuthenticated ? "Student Track" : "Student Learner");

  const learnerSubtext =
    userProfile?.strand ||
    (isAuthenticated ? "Grade 11 CSS Learner" : "Sign In to Unlock Full Academy");

  const isTopicLockedForGuest = (topicIdx) => {
    if (isAuthenticated) return false;
    return topicIdx >= 3;
  };

  // 3D Hotspot Selection
  const [selectedHotspotId, setSelectedHotspotId] = useState(currentTopic.hotspotId || null);

  // B.O.B. Companion Live Speech
  const [bobSpeech, setBobSpeech] = useState(
    `Hey! We're on Topic ${currentTopic.topicCode}: ${currentTopic.title}. Watch the video or explore the 3D model!`
  );

  // Unlock Stage 4 Studio gracefully once in Learn; Certificate unlocks upon completion
  useEffect(() => {
    if (mode === "learn") {
      unlockStage("studio");
    }
  }, [mode, unlockStage]);

  // Unlock Certificate once all syllabus topics are completed
  useEffect(() => {
    try {
      if (completed.length >= FLAT_TOPICS.length) {
        unlockStage("certificate");
      }
    } catch {}
  }, [completed.length, unlockStage]);

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

  // Persist the two per-topic gates
  useEffect(() => {
    try {
      localStorage.setItem(VIDEO_KEY, JSON.stringify(videoWatched));
      localStorage.setItem(QUIZ_KEY, JSON.stringify(quizPassed));
      if (userProfile?.email) {
        localStorage.setItem(`${VIDEO_KEY}.${userProfile.email}`, JSON.stringify(videoWatched));
        localStorage.setItem(`${QUIZ_KEY}.${userProfile.email}`, JSON.stringify(quizPassed));
      }
    } catch {}
  }, [videoWatched, quizPassed, userProfile?.email]);

  // A topic is complete only when the lecture was watched AND the check was passed.
  useEffect(() => {
    const ready = videoWatched.filter((id) => quizPassed.includes(id));
    if (!ready.length) return;
    setCompleted((prev) => {
      const missing = ready.filter((id) => !prev.includes(id));
      return missing.length ? [...prev, ...missing] : prev;
    });
  }, [videoWatched, quizPassed]);

  // Update quiz and hotspot state when changing topic
  useEffect(() => {
    setSelectedHotspotId(currentTopic.hotspotId || null);
    setActivePopover(null);
  }, [currentIndex, currentTopic, completed]);

  const handleVideoWatched = useCallback((topicId) => {
    setVideoWatched((prev) => (prev.includes(topicId) ? prev : [...prev, topicId]));
  }, []);

  const handleQuickCheckPass = useCallback((topicId) => {
    setQuizPassed((prev) => (prev.includes(topicId) ? prev : [...prev, topicId]));
  }, []);

  const handleInspectIn3D = useCallback(() => {
    try {
      soundManager.click();
    } catch {}
    const targetHotspot = currentTopic.hotspotId
      ? ARTICLE_HOTSPOTS.find((h) => h.id === currentTopic.hotspotId)
      : ARTICLE_HOTSPOTS.find((h) => h.id.includes(currentTopic.specimenKey));

    if (targetHotspot) {
      setSelectedHotspotId(targetHotspot.id);
      setBobSpeech(`Inspecting ${targetHotspot.label}! ${targetHotspot.tip}`);
    } else {
      setSelectedHotspotId(null);
      setBobSpeech(`Inspecting ${currentTopic.title} in 3D! Check its physical orientation and connections.`);
    }
  }, [currentTopic]);

  const doneCount = completed.filter((id) => FLAT_TOPICS.some((f) => f.id === id)).length;
  const progressPct = Math.round((doneCount / FLAT_TOPICS.length) * 100);

  useEffect(() => {
    if (progressPct === 100) {
      unlockStage("studio");
      try {
        unlockStage("certificate");
      } catch {}
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
      // When at the very end of all syllabus topics, open the Student Profile Overview
      setShowDashboardOverlay(true);
    }
  }, [currentIndex, isAuthenticated, unlockStage, navigate]);

  const handlePrevTopic = useCallback(() => {
    if (currentIndex > 0) {
      try { soundManager.click(); } catch {}
      setCurrentIndex((i) => i - 1);
      if (rightDockRef.current) {
        rightDockRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  }, [currentIndex]);

  const handleOpenLectureFilm = useCallback(() => {
    try { soundManager.snap(); } catch {}
    setVideoExpanded(true);
    setVideoHighlighted(true);
    setTimeout(() => setVideoHighlighted(false), 1400);
    if (rightDockRef.current) {
      rightDockRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
    setBobSpeech(
      `Playing the lesson video for ${currentTopic.title}. Watch along!`
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
        ? "All set! Feel free to watch videos or play with the 3D models."
        : "All good! Click any part or check the guide to start."
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

  // User triggers guided tour on demand via "GUIDE ME" header button
  const handleStartWorkbenchTour = () => {
    try { soundManager.click(); } catch {}
    startTour(0);
  };

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
            <span className="wb-rail-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </span>
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
            <span className="wb-rail-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </span>
            {leftRailOpen && <span className="wb-rail-label">LESSONS</span>}
          </button>

          <button
            type="button"
            className="wb-rail-item"
            onClick={() => {
              try { soundManager.click(); } catch {}
              navigate("/settings");
            }}
            data-tooltip="System Settings & Preferences"
            aria-label="System Settings & Preferences"
          >
            <span className="wb-rail-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </span>
            {leftRailOpen && <span className="wb-rail-label">SETTINGS</span>}
          </button>

          <button
            type="button"
            className="wb-rail-item wb-rail-fs-item"
            onClick={async () => {
              try { soundManager.click(); } catch {}
              await toggleFullscreen();
            }}
            data-tooltip={isFs ? "Exit Fullscreen (F11)" : "Enter Fullscreen (F11)"}
            aria-label="Toggle Fullscreen"
          >
            <span className="wb-rail-icon">
              {isFs ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3v3a2 2 0 0 1-2 2H3" />
                  <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
                  <path d="M3 16h3a2 2 0 0 1 2 2v3" />
                  <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                  <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
                  <path d="M3 16v3a2 2 0 0 0 2 2h3" />
                  <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
                </svg>
              )}
            </span>
          </button>
        </nav>

        <div className="wb-rail-footer">
          <div
            className={`wb-learner-chip ${!isAuthenticated ? "is-guest-chip" : ""} ${showDashboardOverlay ? "is-active-dashboard" : ""}`}
            onClick={!isAuthenticated ? () => setShowGuestLockModal(true) : () => setShowDashboardOverlay((prev) => !prev)}
            data-tooltip={
              !isAuthenticated
                ? "Sign in to track progress & unlock full curriculum"
                : showDashboardOverlay
                  ? "Collapse Student Dashboard (Esc)"
                  : "Student Dashboard & Course Record"
            }
            aria-label={
              !isAuthenticated
                ? "Sign in to track progress"
                : showDashboardOverlay
                  ? "Collapse Student Dashboard"
                  : "Open Student Dashboard & Course Record"
            }
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (!isAuthenticated) setShowGuestLockModal(true);
                else setShowDashboardOverlay((prev) => !prev);
              }
            }}
          >
            {leftRailOpen ? (
              <>
                <div className="wb-learner-avatar-box">
                  {userProfile?.photo ? (
                    <img src={userProfile.photo} alt={learnerDisplayName} className="wb-learner-avatar-img" />
                  ) : (
                    <div className="wb-learner-avatar-initials">
                      {learnerDisplayName.split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "ST"}
                    </div>
                  )}
                  <span className={`wb-learner-dot ${!isAuthenticated ? "is-guest-dot" : ""}`} />
                </div>
                <div className="wb-learner-meta">
                  <strong>{learnerDisplayName}</strong>
                  <span>{learnerSubtext}</span>
                </div>
                <span className="wb-learner-unlock-arrow">{showDashboardOverlay ? "✕" : "→"}</span>
              </>
            ) : (
              <div className="wb-learner-avatar-collapsed" title={learnerDisplayName}>
                {userProfile?.photo ? (
                  <img src={userProfile.photo} alt={learnerDisplayName} className="wb-learner-collapsed-img" />
                ) : (
                  <div className="wb-learner-collapsed-initials">
                    {learnerDisplayName.split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "ST"}
                  </div>
                )}
                <span className={`wb-learner-collapsed-dot ${!isAuthenticated ? "is-guest-dot" : ""}`} />
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── 6-MODULE HIERARCHICAL SYLLABUS ACCORDION POPOVER ── */}
      {activePopover === "lessons" && (
        <div className="wb-popover-card wb-syllabus-accordion-popover" role="dialog" aria-label="Curriculum Modules">
          <div className="wb-popover-head">
            <div className="wb-popover-head-text">
              <span className="wb-syllabus-kicker">CURRICULUM DIRECTORY</span>
              <h3 className="wb-syllabus-heading">Course Syllabus</h3>
            </div>
            <button
              type="button"
              className="wb-popover-close wb-syllabus-popover-close"
              onClick={() => setActivePopover(null)}
              aria-label="Close Syllabus"
              title="Close Syllabus (Esc)"
            >
              ✕
            </button>
          </div>

          <div className="wb-syllabus-progress-card">
            <div className="wb-syllabus-progress-meta">
              <span className="wb-syllabus-progress-label">
                <strong>{doneCount}</strong> of {TOTAL_TOPICS_COUNT} Topics Completed
              </span>
              <span className="wb-syllabus-progress-pill">{progressPct}%</span>
            </div>
            <div className="wb-syllabus-progress-track">
              <div
                className="wb-syllabus-progress-fill"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <div className="wb-syllabus-accordion-body">
            {CSS_CURRICULUM.map((mod) => {
              const isModExpanded = expandedModules[mod.id] ?? true;
              const modCompletedCount = mod.topics.filter((t) => completed.includes(t.id)).length;
              const isModComplete = modCompletedCount === mod.topics.length;
              const isModLocked = !isAuthenticated && mod.moduleNum > 1;
              const moduleDisplayTitle = SHORT_MODULE_TITLES[mod.moduleNum] || mod.title;

              return (
                <div key={mod.id} className="wb-module-accordion-section">
                  <button
                    type="button"
                    className={`wb-module-accordion-header wb-syllabus-module-btn ${isModExpanded ? "is-expanded" : ""} ${isModComplete ? "is-complete" : ""}`}
                    onClick={() => toggleModuleExpanded(mod.id)}
                    aria-expanded={isModExpanded}
                  >
                    <div className="wb-module-header-title">
                      <span className="wb-module-tag">M{mod.moduleNum < 10 ? `0${mod.moduleNum}` : mod.moduleNum}</span>
                      <strong className="wb-module-heading-text">{moduleDisplayTitle}</strong>
                      {isModLocked && (
                        <span className="wb-module-lock-tag">STUDENT TRACK</span>
                      )}
                    </div>
                    <div className="wb-module-header-meta">
                      <span className={`wb-module-done-pill ${isModComplete ? "is-all-done" : ""}`}>
                        {modCompletedCount}/{mod.topics.length}
                      </span>
                      <span className={`wb-module-chevron ${isModExpanded ? "is-expanded" : ""}`}>
                        ▾
                      </span>
                    </div>
                  </button>

                  {isModExpanded && (
                    <div className="wb-module-topics-list">
                      {mod.topics.map((t) => {
                        const isDone = completed.includes(t.id);
                        const globalIdx = FLAT_TOPICS.findIndex((f) => f.id === t.id);
                        const isActive = globalIdx === currentIndex;
                        const isLocked = isTopicLockedForGuest(globalIdx);
                        const topicDisplayTitle = SHORT_TOPIC_TITLES[t.id] || t.title;

                        return (
                          <button
                            type="button"
                            key={t.id}
                            className={`wb-topic-row-btn wb-syllabus-topic-item ${isActive ? "is-active" : ""} ${isLocked ? "is-locked" : ""} ${isDone ? "is-done" : ""}`}
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
                            <span className={`wb-topic-status-dot ${isDone ? "is-done" : ""} ${isActive ? "is-active-dot" : ""} ${isLocked ? "is-locked-dot" : ""}`}>
                              {isDone ? (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              ) : isLocked ? (
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                              ) : (
                                t.topicCode
                              )}
                            </span>
                            <span className="wb-topic-name">{topicDisplayTitle}</span>
                            {isLocked && (
                              <span className="wb-topic-lock-label">LOCKED</span>
                            )}
                            {isActive && (
                              <span className="wb-topic-current-pill">CURRENT</span>
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
                  <div className="wb-unlock-banner-text">
                    <strong>Unlock All 7 Modules &amp; Verified E-Certificate</strong>
                    <p>
                      Guest preview includes Module 1. Link your Google account to access all {TOTAL_TOPICS_COUNT} topics and earn an accredited PTC-IICT certificate.
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
            <h1 className="wb-app-title">
              MODULE {currentTopic?.moduleNum}: {currentTopic?.moduleTitle?.toUpperCase()}
            </h1>
            <p className="wb-app-sub">
              TOPIC {currentTopic?.topicCode} &middot; {currentTopic?.title?.toUpperCase()}
            </p>
          </div>

          <div className="wb-header-right">
            <button
              type="button"
              className={`wb-hud-pill wb-tour-btn wb-tour-icon-only ${tourActive ? "is-active" : ""}`}
              onClick={tourActive ? () => dismissTour(false) : () => startTour(0)}
              data-tooltip={tourActive ? "Close guided tour (Esc)" : "Tour the 3 workbench zones with B.O.B."}
              aria-label={tourActive ? "Stop tour" : "Start guide tour"}
            >
              <span className="wb-tour-icon" aria-hidden="true">?</span>
            </button>

            {/* Dynamic Module & Topic Progress Indicator */}
            <div className="wb-hud-pill" id="wb-zone-hud">
              <div className="wb-hud-track">
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
          </div>
        </header>

        {/* ══ 2-FOCUSED ZONE WORKBENCH: CENTER 3D CANVAS + RIGHT CSS PRE-LAB GUIDE ══ */}
        <div className={`wb-workbench-body ${showBriefingOverlay ? "is-briefing-mode" : ""} ${centerMode === "3d-lab" ? "is-3d-lab-fullscreen" : ""}`}>
          {/* ══ ZONE 1: CENTER 3D HARDWARE / LESSON PRESENTATION STAGE ══ */}
          <section
            id="wb-zone-stage"
            className={`wb-center-stage ${showDashboardOverlay ? "has-dashboard-active" : ""}`}
            aria-label="Interactive Hardware & Lesson Stage"
          >
            {/* MODE SWITCHER — 3D workbench is the hero; reading is a collapsible tab */}
            {!showDashboardOverlay && !showBriefingOverlay && (
              <div className="wb-stage-mode-switcher" role="tablist" aria-label="Workbench view">
                <button
                  type="button"
                  role="tab"
                  aria-selected={centerMode === "3d-lab"}
                  className={`wb-stage-tab-btn ${centerMode === "3d-lab" ? "is-active" : ""}`}
                  onClick={() => {
                    try { soundManager.snap(); } catch {}
                    setCenterMode("3d-lab");
                  }}
                >
                  ◉ 3D WORKBENCH
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={centerMode === "presentation"}
                  className={`wb-stage-tab-btn ${centerMode === "presentation" ? "is-active" : ""}`}
                  onClick={() => {
                    try { soundManager.click(); } catch {}
                    setCenterMode("presentation");
                  }}
                >
                  ▤ READING
                </button>
              </div>
            )}

            {/* MODE 1: LECTURE PRESENTATION & VISUAL REPORT (PDF/SLIDE REPORT DISCUSSION) */}
            {centerMode === "presentation" && !showDashboardOverlay && !showBriefingOverlay && (
              <LessonPresentationView
                topic={currentTopic}
                moduleNum={currentTopic.moduleNum}
                isLastTopicOfModule={isLastTopicOfModule}
                isModuleCompleted={isModuleTopicsCompleted}
                activePage={presentationPage}
                onPageChange={setPresentationPage}
                theme={workbenchTheme}
                onProceedTo3D={() => {
                  try { soundManager.snap(); } catch {}
                  setCenterMode("3d-lab");
                  setActive3DStepIdx(0);
                  if (ARTICLE_HOTSPOTS[0]) {
                    setSelectedHotspotId(ARTICLE_HOTSPOTS[0].id);
                    setBobSpeech(ARTICLE_HOTSPOTS[0].tip);
                  }
                }}
                onProceedToQuiz={() => {
                  try { soundManager.click(); } catch {}
                  setQuizModuleNum(currentTopic.moduleNum);
                  setShowQuizModal(true);
                }}
                watched={videoWatched.includes(currentTopic.id)}
                quickCheckPassed={quizPassed.includes(currentTopic.id)}
                onVideoWatched={() => handleVideoWatched(currentTopic.id)}
                onQuickCheckPass={() => handleQuickCheckPass(currentTopic.id)}
              />
            )}

            {/* MODE 2: INTERACTIVE 3D HARDWARE LAB */}
            {centerMode === "3d-lab" && (
              <>
                {!currentTopic.isAssemblyLab && (
                  <button
                    type="button"
                    className="wb-3d-return-pill"
                    onClick={() => {
                      try { soundManager.click(); } catch {}
                      setCenterMode("presentation");
                    }}
                    title="Open the reading module"
                  >
                    Reading →
                  </button>
                )}

                {currentTopic.isAssemblyLab ? (
                  <VirtualAssemblyLab
                    initialCompleted={completed.includes(currentTopic.id)}
                    isPaused={showDashboardOverlay || showBriefingOverlay}
                    onBackToLesson={() => {
                      try { soundManager.click(); } catch {}
                      setCenterMode("presentation");
                    }}
                    onAssemblyComplete={() => {
                      // Completion still requires the watched lecture + passed quick check.
                      // This flag only records the practical competency for certification.
                      try {
                        localStorage.setItem("buildlab_3d_assembly_completed", "true");
                        if (userProfile?.email) {
                          localStorage.setItem(`buildlab_3d_assembly_completed.${userProfile.email}`, "true");
                        }
                      } catch {}
                    }}
                    onDisassemblyComplete={() => {
                      try {
                        localStorage.setItem("buildlab_3d_disassembly_completed", "true");
                        if (userProfile?.email) {
                          localStorage.setItem(`buildlab_3d_disassembly_completed.${userProfile.email}`, "true");
                        }
                      } catch {}
                    }}
                    onOpenProfile={() => setShowDashboardOverlay(true)}
                    onBobSpeechChange={setBobSpeech}
                  />
                ) : (
                  <>
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
                            setBobSpeech(`Checking ${hs.label}! Quick tip: ${hs.tip}`);
                          }
                        }
                      }}
                      onOpenVideo={handleOpenLectureFilm}
                      theme={workbenchTheme}
                      onToggleTheme={toggleTheme}
                      isExploded={isExploded}
                      onToggleExploded={() => setIsExploded((x) => !x)}
                      isPaused={showDashboardOverlay || showBriefingOverlay}
                    />

                    {/* Guided 3D Component Stepper with Auto-Focus Camera & Progression Next Buttons */}
                    {!showDashboardOverlay && !showBriefingOverlay && (
                      <div className="wb-3d-guided-stepper" role="region" aria-label="3D Component Stepper">
                        <div className="stepper-content">
                          <div className="stepper-meta-row">
                            <span className="stepper-kicker">
                              3D Component Guide · Step {active3DStepIdx + 1} of {ARTICLE_HOTSPOTS.length}
                            </span>
                            <strong className="stepper-part-title">
                              {ARTICLE_HOTSPOTS[active3DStepIdx]?.label}
                            </strong>
                          </div>
                          <p className="stepper-part-desc">
                            {ARTICLE_HOTSPOTS[active3DStepIdx]?.tip}
                          </p>
                        </div>

                        <div className="stepper-controls">
                          <button
                            type="button"
                            className="btn-stepper-nav"
                            onClick={() => {
                              if (active3DStepIdx === 0) {
                                try { soundManager.click(); } catch {}
                                setCenterMode("presentation");
                              } else {
                                const newIdx = Math.max(0, active3DStepIdx - 1);
                                setActive3DStepIdx(newIdx);
                                setSelectedHotspotId(ARTICLE_HOTSPOTS[newIdx].id);
                                setBobSpeech(ARTICLE_HOTSPOTS[newIdx].tip);
                                try { soundManager.click(); } catch {}
                              }
                            }}
                            title={active3DStepIdx === 0 ? "Return to Lesson Presentation" : "Inspect previous component"}
                          >
                            {active3DStepIdx === 0 ? "← Overview" : "Previous Component"}
                          </button>

                          {active3DStepIdx < ARTICLE_HOTSPOTS.length - 1 ? (
                            <button
                              type="button"
                              className="btn-stepper-nav btn-stepper-next"
                              onClick={() => {
                                const newIdx = Math.min(ARTICLE_HOTSPOTS.length - 1, active3DStepIdx + 1);
                                setActive3DStepIdx(newIdx);
                                setSelectedHotspotId(ARTICLE_HOTSPOTS[newIdx].id);
                                setBobSpeech(ARTICLE_HOTSPOTS[newIdx].tip);
                                try { soundManager.snap(); } catch {}
                              }}
                            >
                              Next Component →
                            </button>
                          ) : isLastTopicOfModule && isModuleTopicsCompleted ? (
                            <button
                              type="button"
                              className="btn-stepper-exam"
                              onClick={() => {
                                try { soundManager.snap(); } catch {}
                                setQuizModuleNum(currentTopic.moduleNum);
                                setShowQuizModal(true);
                              }}
                            >
                              Take Module {currentTopic.moduleNum} Assessment →
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn-stepper-nav btn-stepper-next"
                              onClick={handleNextTopic}
                              title="Proceed to next topic"
                            >
                              Next Topic →
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* Quick Course Briefing / Overview Overlay: covers center workspace on first arrival or on request */}
            {showBriefingOverlay && !showDashboardOverlay && (
              <CourseBriefingOverlay
                onClose={() => {
                  setShowBriefingOverlay(false);
                  try {
                    localStorage.setItem("buildlab_learn_briefing_seen", "true");
                  } catch {}
                }}
                onStartLearning={() => {
                  setShowBriefingOverlay(false);
                  try {
                    localStorage.setItem("buildlab_learn_briefing_seen", "true");
                  } catch {}
                }}
              />
            )}

            {/* Embedded Student Account Dashboard Overlay: covers ONLY the 3D workspace zone */}
            {showDashboardOverlay && (
              <StudentDashboard
                isEmbedded={true}
                onClose={() => setShowDashboardOverlay(false)}
                onSelectTopic={(targetIdx, targetMode) => {
                  goTopic(targetIdx);
                  if (targetMode === "quiz") {
                    setQuizModuleNum(FLAT_TOPICS[targetIdx]?.moduleNum || 1);
                    setShowQuizModal(true);
                  } else if (targetMode === "3d-lab") {
                    setCenterMode("3d-lab");
                  } else {
                    setCenterMode("presentation");
                  }
                  setShowDashboardOverlay(false);
                }}
              />
            )}
          </section>

          {/* ══ ZONE 2: RIGHT PRACTICAL CSS PRE-LAB GUIDE CARD (HIDDEN DURING BRIEFING & IN 3D LAB FULLSCREEN) ══ */}
          {!showBriefingOverlay && centerMode === "presentation" && (
            <aside
              id="wb-zone-dock"
              className="wb-right-dock"
              ref={rightDockRef}
              aria-label="CSS Pre-Lab Guide & Practical Reference"
            >
              <div className="wb-css-guide-card" ref={guideCardRef}>
                {/* 1. SPATIAL MINI 3D PREVIEW CARD */}
                <div className="wb-dock-mini-stage-card">
                  <div className="wb-mini-stage-header">
                    <div className="wb-mini-tag-group">
                      <span className="wb-dock-pill-3d">Up Next:</span>
                      <span className="wb-dock-pill-sub">Interactive 3D Lab</span>
                    </div>
                    <button
                      type="button"
                      className="btn-expand-3d-stage"
                      onClick={() => {
                        try { soundManager.snap(); } catch {}
                        setCenterMode("3d-lab");
                      }}
                      title="Switch 3D workbench to center stage"
                    >
                      Click to Expand ↗
                    </button>
                  </div>

                  <div className="wb-mini-viewport-container">
                    <LearnHardwareStage
                      isMini={true}
                      onClickMini={() => {
                        try { soundManager.snap(); } catch {}
                        setCenterMode("3d-lab");
                      }}
                      specimenKey={currentTopic.isAssemblyLab ? "case" : currentTopic.specimenKey}
                      selectedBuildPart={currentBuild?.[currentTopic.specimenKey] || null}
                      lessonTitle={currentTopic.title}
                      hotspots={ARTICLE_HOTSPOTS}
                      theme={workbenchTheme}
                      isExploded={isExploded}
                      isPaused={showDashboardOverlay || showBriefingOverlay}
                    />
                  </div>
                </div>

                {/* 2. DYNAMIC CONTENT: REFERENCES (PAGE 1) OR BULLETED SUMMARY (PAGE 2) */}
                {presentationPage === 0 ? (
                  /* ── PAGE 1: CURRICULUM REFERENCES & INDUSTRY STANDARDS ── */
                  <div className="wb-references-card" role="region" aria-label="Curriculum References & Standards">
                    <div className="wb-ref-header">
                      <div className="wb-ref-title-wrap">
                        <span className="wb-ref-kicker">Curriculum References</span>
                        <strong className="wb-ref-title">DepEd TVL &amp; Industry Standards</strong>
                      </div>
                      <span className="wb-ref-badge">CSS NC II</span>
                    </div>
                    <p className="wb-ref-intro">
                      Official technical documentation, occupational health guidelines, and curriculum standards cited for this topic:
                    </p>
                    <ul className="wb-ref-list">
                      {currentLessonContent?.moduleDoc?.references?.map((ref, idx) => (
                        <li key={idx} className="wb-ref-item">
                          <a
                            href={ref.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="wb-ref-link"
                          >
                            {ref.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                    {isLastTopicOfModule && isModuleTopicsCompleted && (
                      <button
                        type="button"
                        className="wb-ref-exam-btn"
                        onClick={() => {
                          try { soundManager.snap(); } catch {}
                          setQuizModuleNum(currentTopic.moduleNum);
                          setShowQuizModal(true);
                        }}
                        title={`Take Module ${currentTopic.moduleNum} Assessment`}
                      >
                        <span>Take Module {currentTopic.moduleNum} Assessment</span>
                        <span>→</span>
                      </button>
                    )}
                  </div>
                ) : (
                  /* ── PAGE 2: BULLETED SUMMARY PANEL ── */
                  <div className="wb-summary-dock-card" role="region" aria-label="Core Takeaways">
                    <div className="wb-summary-dock-header">
                      <h3 className="wb-summary-dock-title">Core Takeaways</h3>
                    </div>
                    <ul className="wb-summary-dock-list">
                      {currentLessonContent?.videoSummary?.map((point, idx) => (
                        <li key={idx} className="wb-summary-dock-item">
                          <span className="wb-summary-dock-num">{idx + 1}</span>
                          <span className="wb-summary-dock-text">{point}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="wb-summary-dock-foot">
                      Topic {currentTopic.topicCode} &middot; {currentTopic.title}
                    </div>
                  </div>
                )}
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* ══ TRANSIENT STAGE UNLOCK BANNER (AUTO FADES IN & FADES OUT) ══ */}
      {showUnlockBanner && (
        <StageUnlockBanner
          stageKey="learn"
          stageNumber="03"
          title="STAGE 03 AUTHORIZED"
          subtitle="Hardware Academy & Virtual Assembly Laboratory"
          badge="ACADEMIC TRACK // STAGE 03"
          accentColor="#ffffff"
          learnerProfile={userProfile}
          requireConfirm={false}
          onComplete={() => {
            setShowUnlockBanner(false);
            markBannerSeen("learn");
            try {
              localStorage.setItem("buildlab_learn_stage_banner_seen", "true");
              localStorage.setItem("buildlab_learn_syllabus_seen", "true");
            } catch {}
          }}
        />
      )}

      {/* ══ WINDOWS 11 SNIPPING TOOL SPOTLIGHT WALKTHROUGH PORTAL ══ */}
      {tourActive && spotlightRect && (
        <div className="wb-snipping-portal" aria-live="polite">
          {/* Hardware-accelerated unified spotlight cutout: zero tearing, zero mask flicker */}
          <div
            className="wb-snipping-cutout"
            style={{
              top: `${spotlightRect.top}px`,
              left: `${spotlightRect.left}px`,
              width: `${spotlightRect.width}px`,
              height: `${spotlightRect.height}px`,
              borderRadius: `${spotlightRect.borderRadius || 14}px`,
            }}
          >
            <div className="wb-snipping-cutout-rim" />
            <div className="wb-snipping-corner-reticle tl" />
            <div className="wb-snipping-corner-reticle tr" />
            <div className="wb-snipping-corner-reticle bl" />
            <div className="wb-snipping-corner-reticle br" />
          </div>

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
              You are exploring in Guest Preview. Link your Google account to unlock all {TOTAL_MODULES_COUNT} modules, {TOTAL_TOPICS_COUNT} interactive topics, and claim your accredited PTC-IICT Certificate of Completion.
            </p>

            <div className="wb-welcome-highlights">
              <div className="wb-welcome-chip">
                <div>
                  <strong>Official Verified E-Certificate</strong>
                  <span>Earn an official credential with your full name, student ID, and accredited course hours.</span>
                </div>
              </div>
              <div className="wb-welcome-chip">
                <div>
                  <strong>Complete {TOTAL_MODULES_COUNT} Modules • {TOTAL_TOPICS_COUNT} Topics</strong>
                  <span>Unlock CPU socket pins, RAM dual-channel rules, USB color codes, PSU safety, airflow physics, and POST debugging.</span>
                </div>
              </div>
              <div className="wb-welcome-chip">
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
                Connect Google Account &amp; Unlock Free
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

      {/* ══ B.O.B. COMPANION IN LEFT RAIL (Hidden during tour highlight guidance or profile dashboard) ══ */}
      {!tourActive && !showDashboardOverlay && (
        <BobCompanion
          context="learn"
          activeTopic={currentTopic.title}
          externalSpeech={null}
          muted={showBriefingOverlay || tourActive || showDashboardOverlay || showQuizModal || (centerMode === "3d-lab" && currentTopic.isAssemblyLab)}
          dockRight={20}
          size={bobIsCenter ? 88 : leftRailOpen ? 64 : 46}
          isCenter={bobIsCenter}
          onLaunchLab={() => {
            try { soundManager.install(); } catch {}
            navigate(`/3d-builder?stage=${currentTopic.specimenKey}&learn=true`);
          }}
        />
      )}

      {/* ── 15-QUESTION COMPREHENSIVE ACADEMIC ASSESSMENT MODAL ── */}
      <ModuleQuizModal
        isOpen={showQuizModal}
        moduleNum={quizModuleNum}
        userEmail={userProfile?.email}
        theme={workbenchTheme}
        onClose={() => setShowQuizModal(false)}
        onOpenDashboard={() => setShowDashboardOverlay(true)}
        onCompleteCourse={() => {
          setShowQuizModal(false);
          setShowDashboardOverlay(true);
        }}
        onNextModule={() => {
          if (quizModuleNum >= 7) {
            setShowQuizModal(false);
            setShowDashboardOverlay(true);
            return;
          }
          const targetModuleNum = quizModuleNum + 1;
          const targetIdx = FLAT_TOPICS.findIndex((t) => t.moduleNum === targetModuleNum);
          if (targetIdx !== -1) {
            goTopic(targetIdx);
          } else {
            const nextIdx = Math.min(FLAT_TOPICS.length - 1, currentIndex + 1);
            goTopic(nextIdx);
          }
          setCenterMode("3d-lab");
        }}
      />
    </div>
  );
}
