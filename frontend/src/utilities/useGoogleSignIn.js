import { useCallback, useState } from "react";
import { useLearnMode } from "../contexts/LearnModeContext";
import soundManager from "./soundManager";

/**
 * Google sign-in for the student certification flow.
 *
 * Extracted from AccountSetupModal so a single "Continue with Google" card can
 * sign a learner in directly, without opening a second confirmation modal.
 */
export default function useGoogleSignIn({ onSuccess } = {}) {
  const { setUserProfile, setAppMode, unlockStage, restoreStudentAccount } = useLearnMode();
  const [isLinking, setIsLinking] = useState(false);
  const [error, setError] = useState("");

  const signIn = useCallback(async () => {
    try { soundManager.click(); } catch { }
    setError("");
    setIsLinking(true);

    // The GIS script is loaded async in index.html — wait briefly for it.
    if (!window.google?.accounts?.oauth2) {
      for (let i = 0; i < 15 && !window.google?.accounts?.oauth2; i += 1) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
    if (!googleClientId || !window.google?.accounts?.oauth2) {
      setIsLinking(false);
      setError("Google sign-in is unavailable right now. Please try again later.");
      return;
    }

    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: googleClientId,
        scope: "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
        callback: async (tokenResponse) => {
          if (!tokenResponse?.access_token) {
            setIsLinking(false);
            return;
          }

          try {
            const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
              headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
            });
            const data = await res.json();
            const email = (data.email || "").toLowerCase().trim();
            const fullName = data.name || email.split("@")[0] || "Learner";
            const photo =
              data.picture ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`;

            // Returning learner: restore saved profile / progress.
            let profile = null;
            if (email && restoreStudentAccount) {
              profile = restoreStudentAccount(email, { fullName, photo });
            }

            // New learner: create the certification profile from Google data
            // using the same defaults the setup modal used.
            if (!profile) {
              profile = {
                fullName,
                email: email || "learner.tester@gmail.com",
                photo,
                googleId: "google-oauth2|verified",
                strand: "Grade 11 TVL - Computer Systems Servicing (CSS)",
                interests: ["Desktop PC Assembly & Lab Safety", "Component Keying & Sockets"],
                experienceLevel: "Beginner (First time touching bare PC hardware)",
                setupCompleted: true,
                joinedDate: new Date().toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                }),
              };

              setUserProfile(profile);
              unlockStage("build");
              unlockStage("compatibility");
              unlockStage("learn");
              unlockStage("studio");

              const emailKey = profile.email.toLowerCase().trim();
              try {
                localStorage.setItem(
                  "user",
                  JSON.stringify({
                    id: "student_" + Date.now(),
                    fullName: profile.fullName,
                    name: profile.fullName,
                    email: profile.email,
                    photo: profile.photo,
                    accountType: "student",
                    schoolYear: "Grade 11",
                    strand: profile.strand,
                    interests: profile.interests,
                    experienceLevel: profile.experienceLevel,
                  })
                );
                localStorage.setItem("buildlab_app_mode", "learn");
                localStorage.setItem("buildlab_user_profile", JSON.stringify(profile));
                localStorage.setItem("buildlab_last_learner_email", emailKey);
                localStorage.setItem(`buildlab_student_profile_${emailKey}`, JSON.stringify(profile));
                localStorage.setItem(
                  `buildlab_student_stages_${emailKey}`,
                  JSON.stringify(["build", "compatibility", "learn", "studio", "certificate"])
                );
                sessionStorage.setItem("buildlab_pending_learner_welcome", profile.fullName);
              } catch { }

              try {
                fetch("/api/learn/sync-profile", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    googleId: profile.googleId,
                    email: profile.email,
                    fullName: profile.fullName,
                    photo: profile.photo,
                    institution: "Pateros Technological College",
                    strand: profile.strand,
                    interests: profile.interests,
                    unlockedStages: ["build", "compatibility", "learn", "studio", "certificate"],
                  }),
                }).catch(() => { });
              } catch { }
            }

            try { soundManager.granted(); } catch { }
            setAppMode("learn");
            setIsLinking(false);
            if (onSuccess) onSuccess(profile);
          } catch (err) {
            console.error("Failed to complete Google sign-in:", err);
            setError("Connected to Google, but couldn't retrieve your profile. Please try again.");
            setIsLinking(false);
          }
        },
        error_callback: (err) => {
          setIsLinking(false);
          setError(
            err?.type === "popup_closed"
              ? "Google sign-in popup was closed."
              : "Google sign-in encountered an issue. Please try again."
          );
        },
      });

      client.requestAccessToken({ prompt: "select_account" });
    } catch (err) {
      console.error("Google initTokenClient error:", err);
      setIsLinking(false);
      setError("Google sign-in is unavailable right now. Please try again later.");
    }
  }, [restoreStudentAccount, setUserProfile, setAppMode, unlockStage, onSuccess]);

  return { signIn, isLinking, error };
}
