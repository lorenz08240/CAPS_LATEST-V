import React, { createContext, useContext, useState, useEffect } from "react";
import soundManager from "../utilities/soundManager";

const ThemeContext = createContext();

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("buildlab_theme") || "dark";
  });

  useEffect(() => {
    const isDark = theme === "dark";
    
    // Synchronize data attributes and classes on both <html> and <body>
    document.documentElement.setAttribute("data-theme", theme);
    document.body.setAttribute("data-theme", theme);

    if (isDark) {
      document.documentElement.classList.add("theme-dark", "dark");
      document.documentElement.classList.remove("theme-light", "light");
      document.body.classList.add("theme-dark", "dark");
      document.body.classList.remove("theme-light", "light");
    } else {
      document.documentElement.classList.add("theme-light", "light");
      document.documentElement.classList.remove("theme-dark", "dark");
      document.body.classList.add("theme-light", "light");
      document.body.classList.remove("theme-dark", "dark");
    }

    try {
      localStorage.setItem("buildlab_theme", theme);
    } catch {}

    // Dispatch global event for non-react or canvas/3D subscribers
    try {
      window.dispatchEvent(new CustomEvent("buildlab:theme-changed", { detail: { theme, isDark } }));
    } catch {}
  }, [theme]);

  const toggleTheme = () => {
    try {
      soundManager.theme();
    } catch {}
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const setThemeMode = (newMode) => {
    if (newMode === "dark" || newMode === "light") {
      try {
        soundManager.theme();
      } catch {}
      setTheme(newMode);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, setThemeMode, toggleTheme, isDark: theme === "dark" }}>
      {children}
    </ThemeContext.Provider>
  );
}
