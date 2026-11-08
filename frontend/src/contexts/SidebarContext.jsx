import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import soundManager from "../utilities/soundManager";

const SidebarContext = createContext(null);

export const SidebarProvider = ({ children }) => {
  // Pinning removed per design simplification - drawer mode is primary
  const [isPinned, setIsPinnedState] = useState(false);

  const [isHovered, setIsHovered] = useState(false);
  const [isOpenManual, setIsOpenManual] = useState(false);

  // Derived: sidebar is visible if pinned, hovered, or manually toggled open
  const isSidebarOpen = isPinned || isHovered || isOpenManual;

  const setIsPinned = useCallback((pinnedOrUpdater) => {
    setIsPinnedState(false);
    try {
      localStorage.removeItem("buildlab_sidebar_pinned");
    } catch {}
  }, []);

  const togglePin = useCallback(() => {
    // No-op - pin button removed
  }, []);

  const closeSidebar = useCallback(() => {
    setIsOpenManual((prev) => {
      if (prev) {
        try {
          soundManager.modalClose();
        } catch {}
      }
      return false;
    });
    setIsHovered(false);
  }, []);

  const openSidebar = useCallback(() => {
    setIsOpenManual((prev) => {
      if (!prev) {
        try {
          soundManager.modalOpen();
        } catch {}
      }
      return true;
    });
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsOpenManual((prev) => {
      const next = !prev;
      try {
        if (next) {
          soundManager.modalOpen();
        } else {
          soundManager.modalClose();
        }
      } catch {}
      if (!next) {
        setIsHovered(false);
      }
      return next;
    });
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

      if (e.key === "Escape") {
        if (isSidebarOpen && !isPinned) {
          e.preventDefault();
          closeSidebar();
        }
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
