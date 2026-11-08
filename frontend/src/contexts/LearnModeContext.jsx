import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const LearnModeContext = createContext();

export const LearnModeProvider = ({ children }) => {
  // Mode: null | 'explore' | 'learn'
  const [mode, setModeState] = useState(() => {
    try {
      return localStorage.getItem("buildlab_app_mode") || null;
    } catch {
      return null;
    }
  });

  // User Profile from Google Account setup
  const [userProfile, setUserProfileState] = useState(() => {
    try {
      const saved = localStorage.getItem("buildlab_user_profile");
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      fullName: "",
      email: "",
      institution: "",
      googleId: "",
      photo: "",
      setupCompleted: false,
    };
  });

  // Unlocked stages in Learn Mode: ['build', 'compatibility', 'learn', 'certificate']
  const [unlockedStages, setUnlockedStages] = useState(() => {
    try {
      const saved = localStorage.getItem("buildlab_learn_unlocked_stages");
      if (saved) return JSON.parse(saved);
    } catch {}
    return ["build"];
  });

  // Seen unlock animations (so the entrance banner plays once upon first unlock)
  const [seenBanners, setSeenBanners] = useState(() => {
    try {
      const saved = localStorage.getItem("buildlab_learn_seen_banners");
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      compatibility: false,
      learn: false,
      certificate: false,
    };
  });

  // Active floating unlock banner state
  const [activeUnlockBanner, setActiveUnlockBanner] = useState(null);

  // Sync mode to localStorage
  const setAppMode = useCallback((newMode) => {
    setModeState(newMode);
    try {
      if (newMode) {
        localStorage.setItem("buildlab_app_mode", newMode);
      } else {
        localStorage.removeItem("buildlab_app_mode");
      }
    } catch {}
  }, []);

  // Sync profile to localStorage
  const setUserProfile = useCallback((profileData) => {
    setUserProfileState((prev) => {
      const updated = { ...prev, ...profileData, setupCompleted: true };
      try {
        localStorage.setItem("buildlab_user_profile", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  // Unlock a stage
  const unlockStage = useCallback((stageKey) => {
    setUnlockedStages((prev) => {
      if (prev.includes(stageKey)) return prev;
      const updated = [...prev, stageKey];
      try {
        localStorage.setItem("buildlab_learn_unlocked_stages", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  // Mark banner as seen
  const markBannerSeen = useCallback((stageKey) => {
    setSeenBanners((prev) => {
      const updated = { ...prev, [stageKey]: true };
      try {
        localStorage.setItem("buildlab_learn_seen_banners", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  // Trigger stage unlock animation banner
  const triggerUnlockBanner = useCallback((stageKey, bannerInfo) => {
    setActiveUnlockBanner({
      stageKey,
      ...bannerInfo,
    });
  }, []);

  const closeUnlockBanner = useCallback(() => {
    setActiveUnlockBanner(null);
  }, []);

  // Route Accessibility Guard Checker
  const canAccessPath = useCallback(
    (pathname) => {
      // Explore mode has unrestricted access to everything
      if (mode !== "learn") return true;

      const path = pathname.toLowerCase();

      // Home and 2D Build are always accessible
      if (path === "/" || path === "/build") return true;

      // Helper to check stage unlock from state or local storage
      const isStageUnlocked = (key) => {
        if (unlockedStages.includes(key)) return true;
        try {
          const saved = JSON.parse(localStorage.getItem("buildlab_learn_unlocked_stages") || "[]");
          return Array.isArray(saved) && saved.includes(key);
        } catch {
          return false;
        }
      };

      // Learner sequential flow: BUILD (unlocked) -> COMPATIBILITY -> LEARN -> 3D STUDIO
      // 1. Compatibility checker requires Stage 2 unlocked
      if (path.startsWith("/compatibility")) {
        return isStageUnlocked("compatibility");
      }

      // 2. Learn academy courseware requires Stage 3 unlocked
      if (path.startsWith("/learn")) {
        return isStageUnlocked("learn");
      }

      // 3. 3D Studio workspace requires Stage 4 unlocked
      if (path.startsWith("/3d-builder")) {
        return isStageUnlocked("studio") || isStageUnlocked("3d");
      }

      // Certificate requires certification unlocked
      if (path.startsWith("/certificate")) {
        return isStageUnlocked("certificate");
      }

      // Standard utility pages
      if (path === "/about" || path === "/help" || path === "/brands") {
        return true;
      }

      // Admin routes handled by AdminAuthGuard
      if (path.startsWith("/admin")) {
        return true;
      }

      return true;
    },
    [mode, unlockedStages]
  );

  // Reset Learn Progress
  const resetLearnProgress = useCallback(() => {
    setUnlockedStages(["build"]);
    setSeenBanners({ compatibility: false, learn: false, certificate: false });
    try {
      localStorage.setItem("buildlab_learn_unlocked_stages", JSON.stringify(["build"]));
      localStorage.setItem(
        "buildlab_learn_seen_banners",
        JSON.stringify({ compatibility: false, learn: false, certificate: false })
      );
    } catch {}
  }, []);

  return (
    <LearnModeContext.Provider
      value={{
        mode,
        setAppMode,
        userProfile,
        setUserProfile,
        unlockedStages,
        unlockStage,
        seenBanners,
        markBannerSeen,
        activeUnlockBanner,
        triggerUnlockBanner,
        closeUnlockBanner,
        canAccessPath,
        resetLearnProgress,
      }}
    >
      {children}
    </LearnModeContext.Provider>
  );
};

export const useLearnMode = () => {
  const context = useContext(LearnModeContext);
  if (!context) {
    throw new Error("useLearnMode must be used within a LearnModeProvider");
  }
  return context;
};

export default LearnModeContext;
