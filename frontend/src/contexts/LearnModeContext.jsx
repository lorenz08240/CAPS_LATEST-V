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
    } catch { }
    return {
      fullName: "",
      email: "",
      institution: "",
      googleId: "",
      photo: "",
      setupCompleted: false,
    };
  });

  // Unlocked stages in Learn Mode: ['build', 'compatibility', 'learn', 'studio', 'certificate']
  const [unlockedStages, setUnlockedStages] = useState(() => {
    try {
      const saved = localStorage.getItem("buildlab_learn_unlocked_stages");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch { }
    return ["build"];
  });

  // Seen unlock animations (so the entrance banner plays once upon first unlock)
  const [seenBanners, setSeenBanners] = useState(() => {
    try {
      const saved = localStorage.getItem("buildlab_learn_seen_banners");
      if (saved) return JSON.parse(saved);
    } catch { }
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
    } catch { }
  }, []);

  // Sync profile to localStorage
  const setUserProfile = useCallback((profileData) => {
    setUserProfileState((prev) => {
      const updated = { ...prev, ...profileData, setupCompleted: true };
      try {
        localStorage.setItem("buildlab_user_profile", JSON.stringify(updated));
        if (updated.email) {
          const emailKey = updated.email.toLowerCase().trim();
          localStorage.setItem(`buildlab_student_profile_${emailKey}`, JSON.stringify(updated));
        }
      } catch { }
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
        if (userProfile?.email) {
          const emailKey = userProfile.email.toLowerCase().trim();
          localStorage.setItem(`buildlab_student_stages_${emailKey}`, JSON.stringify(updated));
        }
      } catch { }
      return updated;
    });
  }, [userProfile?.email]);

  // Mark banner as seen
  const markBannerSeen = useCallback((stageKey) => {
    setSeenBanners((prev) => {
      const updated = { ...prev, [stageKey]: true };
      try {
        localStorage.setItem("buildlab_learn_seen_banners", JSON.stringify(updated));
      } catch { }
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
      const path = pathname.toLowerCase();

      // Home and 2D Build are always accessible
      if (path === "/" || path === "/build") return true;

      // An active student account is strictly required for Courseware, Certificate, and Student Dashboard
      const hasAccount = Boolean(
        userProfile && (userProfile.fullName || userProfile.email) && (userProfile.setupCompleted || userProfile.email || userProfile.fullName)
      );

      const isCourseRoute =
        path.startsWith("/learn") ||
        path.startsWith("/certificate") ||
        path.startsWith("/dashboard") ||
        path.startsWith("/account");

      if (isCourseRoute) {
        if (!hasAccount) {
          // Allow guest preview on /learn route
          try {
            if (path.startsWith("/learn") && sessionStorage.getItem("buildlab_guest_preview") === "true") {
              return true;
            }
          } catch { }
          return false;
        }
        // If authenticated student enters course routes, ensure learn mode is active
        if (mode !== "learn") {
          setModeState("learn");
          try {
            localStorage.setItem("buildlab_app_mode", "learn");
          } catch { }
        }
        return true;
      }

      // Explore mode has unrestricted access to sandbox/compatibility/3D studio
      if (mode !== "learn") return true;

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

      // 2. 3D Studio workspace requires Stage 4 unlocked or learn mode virtual assembly lab
      if (path.startsWith("/3d-builder")) {
        try {
          const search = typeof window !== "undefined" ? window.location.search : "";
          if (search.includes("learn=true") || search.includes("mode=learn")) return true;
        } catch { }
        return isStageUnlocked("studio") || isStageUnlocked("3d") || isStageUnlocked("3d-builder");
      }

      // Standard utility pages
      if (path === "/about" || path === "/help" || path === "/brands" || path === "/settings") {
        return true;
      }

      // Admin routes handled by AdminAuthGuard
      if (path.startsWith("/admin")) {
        return true;
      }

      return true;
    },
    [mode, unlockedStages, userProfile]
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
    } catch { }
  }, []);

  // Restore an existing student account and their last build/progress
  const restoreStudentAccount = useCallback((targetEmail, overrides = {}) => {
    try {
      const emailKey = (targetEmail || "").trim().toLowerCase();
      if (!emailKey) return false;
      localStorage.setItem("buildlab_last_learner_email", emailKey);
      const rawArchived = localStorage.getItem(`buildlab_student_profile_${emailKey}`);
      if (!rawArchived) return false;

      const archivedProfile = { ...JSON.parse(rawArchived), ...overrides, setupCompleted: true };

      // 1. Restore Profile into state and active localStorage
      setUserProfileState(archivedProfile);
      setModeState("learn");
      localStorage.setItem("buildlab_app_mode", "learn");
      localStorage.setItem("buildlab_user_profile", JSON.stringify(archivedProfile));
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: "student_" + Date.now(),
          fullName: archivedProfile.fullName,
          name: archivedProfile.fullName,
          email: archivedProfile.email,
          photo: archivedProfile.photo,
          accountType: "student",
          strand: archivedProfile.strand,
          interests: archivedProfile.interests,
          experienceLevel: archivedProfile.experienceLevel,
        })
      );

      // 2. Restore Unlocked Stages (if they finished all stages, all stages remain unlocked!)
      const rawStages = localStorage.getItem(`buildlab_student_stages_${emailKey}`);
      if (rawStages) {
        try {
          const parsedStages = JSON.parse(rawStages);
          if (Array.isArray(parsedStages) && parsedStages.length > 0) {
            setUnlockedStages(parsedStages);
            localStorage.setItem("buildlab_learn_unlocked_stages", JSON.stringify(parsedStages));
          }
        } catch { }
      } else {
        setUnlockedStages(["build", "compatibility", "learn", "studio", "certificate"]);
        localStorage.setItem("buildlab_learn_unlocked_stages", JSON.stringify(["build", "compatibility", "learn", "studio", "certificate"]));
      }

      // 3. Restore Student's Assembled Build into active session and storage
      const rawBuild = localStorage.getItem(`buildlab_student_build_${emailKey}`);
      if (rawBuild) {
        try {
          sessionStorage.setItem("buildlab_current_build", rawBuild);
          localStorage.setItem("buildlab_current_build", rawBuild);
          window.dispatchEvent(new CustomEvent("buildlab_restore_student_build", { detail: JSON.parse(rawBuild) }));
        } catch { }
      }

      // 4. Restore Configuration Slots
      const rawSavedBuilds = localStorage.getItem(`buildlab_student_saved_builds_${emailKey}`);
      if (rawSavedBuilds) {
        try {
          sessionStorage.setItem("buildlab_saved_builds", rawSavedBuilds);
          localStorage.setItem("buildlab_saved_builds", rawSavedBuilds);
        } catch { }
      }

      sessionStorage.setItem("buildlab_pending_learner_welcome", archivedProfile.fullName);
      return archivedProfile;
    } catch (err) {
      console.warn("Could not restore student account:", err);
      return false;
    }
  }, []);

  // Remember returning learners: restore the last signed-in account on a fresh session.
  useEffect(() => {
    let cancelled = false;

    const restoreReturningLearner = async () => {
      try {
        const active = JSON.parse(localStorage.getItem("buildlab_user_profile") || "null");
        if (active?.setupCompleted && (active.fullName || active.email)) return;
      } catch { }

      let lastEmail = "";
      try {
        lastEmail = (localStorage.getItem("buildlab_last_learner_email") || "").trim().toLowerCase();
      } catch { }
      if (!lastEmail || cancelled) return;

      // Local archive first: it also holds strand, interests, and saved build.
      if (restoreStudentAccount(lastEmail)) {
        // A page load has no user gesture for fullscreen, so let the gate handle it.
        sessionStorage.removeItem("buildlab_pending_learner_welcome");
        return;
      }

      // Fallback to the server-side learner directory.
      try {
        const res = await fetch(`/api/learn/profile?email=${encodeURIComponent(lastEmail)}`);
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (!data?.email || cancelled) return;

        const profile = {
          fullName: data.fullName || "",
          email: data.email,
          photo: data.photo || "",
          institution: data.institution || "",
          googleId: "google-oauth2|restored",
          strand: "",
          interests: [],
          experienceLevel: "",
          setupCompleted: true,
        };
        setUserProfileState(profile);
        localStorage.setItem("buildlab_user_profile", JSON.stringify(profile));
        localStorage.setItem(`buildlab_student_profile_${data.email.toLowerCase().trim()}`, JSON.stringify(profile));
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: "student_restored",
            fullName: profile.fullName,
            name: profile.fullName,
            email: profile.email,
            photo: profile.photo,
            accountType: "student",
          })
        );
        if (Array.isArray(data.unlockedStages) && data.unlockedStages.length) {
          setUnlockedStages(data.unlockedStages);
          localStorage.setItem("buildlab_learn_unlocked_stages", JSON.stringify(data.unlockedStages));
        }
        localStorage.setItem("buildlab_app_mode", "learn");
        setModeState("learn");
      } catch {
        // Offline is fine: the local archive above already covers returning users.
      }
    };

    restoreReturningLearner();
    return () => { cancelled = true; };
  }, [restoreStudentAccount]);

  // Learner Log Out: Archive student progress, then reset website to clean Free Mode
  const logoutLearner = useCallback(() => {
    try {
      // 1. Archive student's latest profile and unlocked stages under their email key
      if (userProfile?.email) {
        const emailKey = userProfile.email.toLowerCase().trim();
        localStorage.setItem(`buildlab_student_profile_${emailKey}`, JSON.stringify(userProfile));
        localStorage.setItem(`buildlab_student_stages_${emailKey}`, JSON.stringify(unlockedStages));

        // Archive active build so when logging back in, their last build is preserved!
        const curBuild = sessionStorage.getItem("buildlab_current_build") || localStorage.getItem("buildlab_current_build");
        if (curBuild) {
          localStorage.setItem(`buildlab_student_build_${emailKey}`, curBuild);
        }
        const savedBuilds = sessionStorage.getItem("buildlab_saved_builds") || localStorage.getItem("buildlab_saved_builds");
        if (savedBuilds) {
          localStorage.setItem(`buildlab_student_saved_builds_${emailKey}`, savedBuilds);
        }
      }

      // 2. Clear ACTIVE student session so free mode has no student credentials
      localStorage.removeItem("buildlab_user_profile");
      localStorage.removeItem("buildlab_last_learner_email");
      localStorage.removeItem("user");
      localStorage.setItem("buildlab_app_mode", "explore");
      localStorage.removeItem("buildlab_learn_unlocked_stages");
      localStorage.removeItem("buildlab_learn_seen_banners");
      localStorage.removeItem("buildlab_learn_theme");
      localStorage.removeItem("buildlab_learn_syllabus_seen");
      localStorage.removeItem("buildlab_cert_id");

      // 3. Clear active builds so free mode starts completely reset as a brand new visitor
      localStorage.removeItem("buildlab_current_build");
      localStorage.removeItem("buildlab_rig2_build");
      localStorage.removeItem("buildlab_saved_builds");
      localStorage.removeItem("buildlab_active_target");

      sessionStorage.removeItem("buildlab_pending_learner_welcome");
      sessionStorage.removeItem("buildlab_current_build");
      sessionStorage.removeItem("buildlab_rig2_build");
      sessionStorage.removeItem("buildlab_active_target");
      sessionStorage.removeItem("buildlab_saved_builds");
      sessionStorage.removeItem("buildlab_guest_preview");
      sessionStorage.removeItem("buildlab_start_build_intent");
      try {
        sessionStorage.clear();
      } catch { }
    } catch { }

    // 4. Reset local React state
    setUserProfileState({
      fullName: "",
      email: "",
      institution: "",
      googleId: "",
      photo: "",
      setupCompleted: false,
    });
    setModeState("explore");
    setUnlockedStages(["build"]);
    setSeenBanners({ compatibility: false, learn: false, certificate: false });

    // 5. Always redirect to Home at the top for a fresh website restart
    try {
      window.scrollTo(0, 0);
      if (window.location.pathname === "/" && !window.location.search && !window.location.hash) {
        window.location.reload();
      } else {
        window.location.href = "/";
      }
    } catch {
      window.location.href = "/";
    }
  }, [userProfile, unlockedStages]);

  return (
    <LearnModeContext.Provider
      value={{
        mode,
        setAppMode,
        userProfile,
        setUserProfile,
        unlockedStages,
        setUnlockedStages,
        unlockStage,
        seenBanners,
        markBannerSeen,
        activeUnlockBanner,
        triggerUnlockBanner,
        closeUnlockBanner,
        canAccessPath,
        resetLearnProgress,
        logoutLearner,
        restoreStudentAccount,
        hasCompletedProfile: Boolean(
          userProfile?.setupCompleted && (userProfile?.fullName || userProfile?.email)
        ),
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
