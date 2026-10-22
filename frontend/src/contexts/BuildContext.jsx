import React, { createContext, useContext, useEffect, useState } from "react";
import { OFFLINE_COMPONENTS, DEMO_GAMING_RIG } from "../utilities/offlineParts";

// Build Context for managing selected components
const BuildContext = createContext();


// Build Provider component
export const BuildProvider = ({ children }) => {
  const [currentBuild, setCurrentBuild] = useState(() => {
    try {
      // Clear legacy permanent localStorage if present so it resets clean
      localStorage.removeItem("buildlab_current_build");
      const saved = sessionStorage.getItem("buildlab_current_build");
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      cpu: null,
      motherboard: null,
      ram: null,
      storage: null,
      gpu: null,
      psu: null,
      case: null,
    };
  });

  const [allComponents, setAllComponents] = useState(OFFLINE_COMPONENTS);
  const [compatibilityResults, setCompatibilityResults] = useState([]);
  const [savedBuilds, setSavedBuilds] = useState(() => {
    try {
      const local = localStorage.getItem("buildlab_saved_builds");
      if (local) return JSON.parse(local);
    } catch {}
    return [null, null, null];
  });
  const [selectedSaveSlot, setSelectedSaveSlot] = useState(0);

  // Sync current build to sessionStorage (automatically resets when frontend/tab is closed)
  useEffect(() => {
    try {
      sessionStorage.setItem("buildlab_current_build", JSON.stringify(currentBuild));
    } catch {}
  }, [currentBuild]);

  // Function to add a component to the build
  const addComponent = (category, component) => {
    setCurrentBuild((prev) => ({
      ...prev,
      [category]: component,
    }));
  };

  // Function to remove a component from the build
  const removeComponent = (category) => {
    setCurrentBuild((prev) => ({
      ...prev,
      [category]: null,
    }));
  };

  // Function to reset the full build
  const resetBuild = () => {
    const emptyBuild = {
      cpu: null,
      motherboard: null,
      ram: null,
      storage: null,
      gpu: null,
      psu: null,
      case: null,
    };
    setCurrentBuild(emptyBuild);
    setCompatibilityResults([]);
    try {
      sessionStorage.removeItem("buildlab_current_build");
      localStorage.removeItem("buildlab_current_build");
    } catch {}
  };

  const loadDemoBuild = (demo = DEMO_GAMING_RIG) => {
    setCurrentBuild(demo);
  };

  // Fetch all components and saved builds from backend on load
  useEffect(() => {
    fetch("http://localhost:5000/api/parts")
      .then(res => res.json())
      .then(data => {
        if (data && typeof data === 'object' && Object.keys(data).length > 0) {
          const cleanedData = {};
          for (const cat in data) {
            cleanedData[cat] = data[cat].filter(item => {
              const lowerName = (item.name || "").toLowerCase();
              return !(
                lowerName.includes("laptop") || 
                lowerName.includes("vivobook") || 
                lowerName.includes("ideapad") || 
                lowerName.includes("aspire") || 
                lowerName.includes("nitro") ||
                lowerName.includes("desktop") ||
                lowerName.includes("thin 15") ||
                lowerName.includes("pro 15") ||
                lowerName.includes("bluetti") ||
                lowerName.includes("solar") ||
                lowerName.includes("portable") ||
                lowerName.includes("generator") ||
                lowerName.includes("power station") ||
                lowerName.includes("ac2p") ||
                lowerName.includes("pv130")
              );
            });
          }
          setAllComponents(cleanedData);
        }
      })
      .catch(err => {
        console.warn("Backend API offline or database disconnected; using offline fallback parts.", err);
      });

    fetch("http://localhost:5000/api/builds")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setSavedBuilds(data);
      })
      .catch(err => console.warn("Backend builds offline:", err));
  }, []);

  const saveBuildSnapshot = (slotIndex = selectedSaveSlot) => {
    setSavedBuilds((prev) => {
      const newBuilds = [...prev];
      newBuilds[slotIndex] = currentBuild;
      try {
        localStorage.setItem("buildlab_saved_builds", JSON.stringify(newBuilds));
      } catch {}
      return newBuilds;
    });

    // Save to database
    fetch(`http://localhost:5000/api/builds/${slotIndex}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(currentBuild),
    }).catch(err => console.error("Error saving build to database:", err));
  };

  const getSavedBuild = (slotIndex = selectedSaveSlot) => {
    return savedBuilds[slotIndex] || null;
  };

  // Function to get selected components as array
  const getSelectedComponents = () => {
    return Object.entries(currentBuild)
      .filter(([key, value]) => value !== null)
      .map(([category, component]) => ({
        category,
        ...component,
      }));
  };

  return (
    <BuildContext.Provider
      value={{
        currentBuild,
        compatibilityResults,
        savedBuilds,
        selectedSaveSlot,
        allComponents,
        setSelectedSaveSlot,
        addComponent,
        removeComponent,
        resetBuild,
        loadDemoBuild,
        getSelectedComponents,
        saveBuildSnapshot,
        getSavedBuild,
        setCompatibilityResults,
      }}
    >
      {children}
    </BuildContext.Provider>
  );
};

// Custom hook to use build context
export const useBuild = () => {
  const context = useContext(BuildContext);
  if (!context) {
    throw new Error("useBuild must be used within a BuildProvider");
  }
  return context;
};
