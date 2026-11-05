import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import soundManager from "../utilities/soundManager";

const SidebarContext = createContext(null);

export const SidebarProvider = ({ children }) => {
  const [isPinned, setIsPinnedState] = useState(() => {
    try {
      const stored = localStorage.getItem("buildlab_sidebar_pinned");
      return stored ? JSON.parse(stored) : false;
    } catch {
      return false;
    }
  });

  const [isHovered, setIsHovered] = useState(false);
  const [isOpenManual, setIsOpenManual] = useState(false);

  // Derived: sidebar is visible if pinned, hovered, or manually toggled open
  const isSidebarOpen = isPinned || isHovered || isOpenManual;

  const setIsPinned = useCallback((pinnedOrUpdater) => {
    setIsPinnedState((prev) => {
      const next = typeof pinnedOrUpdater === "function" ? pinnedOrUpdater(prev) : pinnedOrUpdater;
      try {
        localStorage.setItem("buildlab_sidebar_pinned", JSON.stringify(next));
      } catch {}
      try {
        if (next) {
          soundManager.play("snap");
        } else {
          soundManager.play("click");
        }
      } catch {}
      return next;
    });
  }, []);

  const togglePin = useCallback(() => {
    setIsPinned((prev) => !prev);
  }, [setIsPinned]);

  const toggleSidebar = useCallback(() => {
    try {
      soundManager.play("interact");
    } catch {}
    if (isPinned) {
      // If pinned, unpin and close
      setIsPinned(false);
      setIsOpenManual(false);
      setIsHovered(false);
    } else {
      // If not pinned, toggle manual open
      setIsOpenManual((prev) => !prev);
    }
  }, [isPinned, setIsPinned]);

  const closeSidebar = useCallback(() => {
    setIsOpenManual(false);
    setIsHovered(false);
  }, []);

  const openSidebar = useCallback(() => {
    setIsOpenManual(true);
    try {
      soundManager.play("interact");
    } catch {}
  }, []);

  // Keyboard shortcut: Pressing '[' or 'Ctrl+B' toggles the sidebar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA" ||
        e.target.isContentEditable
      ) {
        return;
      }

      if (e.key === "[" || (e.ctrlKey && e.key.toLowerCase() === "b")) {
        e.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  // Sync classes to document.body and root for global CSS styling
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.classList.add("sidebar-active");
    } else {
      document.body.classList.remove("sidebar-active");
    }

    if (isPinned) {
      document.body.classList.add("sidebar-pinned-body");
    } else {
      document.body.classList.remove("sidebar-pinned-body");
    }
  }, [isSidebarOpen, isPinned]);

  return (
    <SidebarContext.Provider
      value={{
        isPinned,
        setIsPinned,
        togglePin,
        isHovered,
        setIsHovered,
        isOpenManual,
        setIsOpenManual,
        isSidebarOpen,
        toggleSidebar,
        closeSidebar,
        openSidebar,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return ctx;
};

export default SidebarContext;
