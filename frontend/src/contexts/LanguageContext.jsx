import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const LanguageContext = createContext(null);

const TRANSLATIONS = {
  en: {
    settings: "Settings",
    manageAccount: "Manage Account",
    language: "Language",
    logout: "Log Out",
    login: "Log In / Connect",
    systemSettings: "System Settings",
    accountPreferences: "Account & Preferences",
    audio: "Audio & Effects",
    theme: "Theme & Display",
    dark: "Dark Mode",
    light: "Light Mode",
    verifiedProfile: "Verified Profile",
    guestMode: "Guest / Open Lab",
    googleSync: "Google Cloud Sync",
    syncSuccess: "Learner profile synced with cloud database.",
    save: "Save Changes",
    cancel: "Cancel",
    back: "Back",
    overview: "Overview",
    hardwareAcademy: "Hardware Academy",
    compatibility: "Compatibility Matrix",
    studio3d: "3D Studio",
    officialCert: "Official Certification",
    logoutConfirm: "Are you sure you want to log out of your learner account?",
    logoutSuccess: "Logged out successfully.",
  },
  tl: {
    settings: "Mga Setting",
    manageAccount: "Pamahalaan ang Account",
    language: "Wika",
    logout: "Mag-log Out",
    login: "Mag-log In / Kumonekta",
    systemSettings: "Mga Setting ng Sistema",
    accountPreferences: "Account at mga Kagustuhan",
    audio: "Tunog at mga Epekto",
    theme: "Tema at Display",
    dark: "Madilim na Tema",
    light: "Maliwanag na Tema",
    verifiedProfile: "Beripikadong Profile",
    guestMode: "Bisita / Bukas na Lab",
    googleSync: "Google Cloud Sync",
    syncSuccess: "Matagumpay na na-sync ang learner profile sa cloud database.",
    save: "I-save ang mga Pagbabago",
    cancel: "Kanselahin",
    back: "Bumalik",
    overview: "Pangkalahatang-ideya",
    hardwareAcademy: "Akademya ng Hardware",
    compatibility: "Talahanayan ng Pagkakatugma",
    studio3d: "3D Studio",
    officialCert: "Opisyal na Sertipikasyon",
    logoutConfirm: "Sigurado ka bang nais mong mag-log out sa iyong learner account?",
    logoutSuccess: "Matagumpay na naka-log out.",
  },
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    try {
      return localStorage.getItem("buildlab_language") || "en";
    } catch {
      return "en";
    }
  });

  const setLanguage = useCallback((lang) => {
    const valid = lang === "tl" ? "tl" : "en";
    setLanguageState(valid);
    try {
      localStorage.setItem("buildlab_language", valid);
      document.documentElement.setAttribute("lang", valid);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      document.documentElement.setAttribute("lang", language);
    } catch {}
  }, [language]);

  const t = useCallback(
    (key, fallback = "") => {
      const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
      return dict[key] || fallback || key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    return {
      language: "en",
      setLanguage: () => {},
      t: (key, fallback = "") => fallback || key,
    };
  }
  return ctx;
};

export default LanguageContext;
