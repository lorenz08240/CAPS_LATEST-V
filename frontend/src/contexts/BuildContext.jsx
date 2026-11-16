import React, { createContext, useContext, useEffect, useState } from "react";
import { OFFLINE_COMPONENTS, DEMO_GAMING_RIG } from "../utilities/offlineParts";
import { apiFetch } from "../utilities/api";

// Build Context for managing selected components
const BuildContext = createContext();

// Build Provider component
export const BuildProvider = ({ children }) => {
  const [activeBuildTarget, setActiveBuildTargetState] = useState(() => {
    try {
      return sessionStorage.getItem("buildlab_active_target") || "rig1";
    } catch {
      return "rig1";
    }
  });

  const setActiveBuildTarget = (target) => {
    setActiveBuildTargetState(target);
    try {
      sessionStorage.setItem("buildlab_active_target", target);
    } catch {}
  };

  const [rig1Build, setRig1Build] = useState(() => {
    try {
      const saved =
        sessionStorage.getItem("buildlab_current_build") ||
        localStorage.getItem("buildlab_current_build");
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

  const [rig2Build, setRig2Build] = useState(() => {
    try {
      const saved =
        sessionStorage.getItem("buildlab_rig2_build") ||
        localStorage.getItem("buildlab_rig2_build");
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

  const currentBuild = activeBuildTarget === "rig2" ? rig2Build : rig1Build;

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

  // Sync builds to storage so accidental tab closes retain progress
  useEffect(() => {
    try {
      const serialized = JSON.stringify(rig1Build);
      sessionStorage.setItem("buildlab_current_build", serialized);
      localStorage.setItem("buildlab_current_build", serialized);
    } catch {}
  }, [rig1Build]);

  useEffect(() => {
    try {
      const serialized = JSON.stringify(rig2Build);
      sessionStorage.setItem("buildlab_rig2_build", serialized);
      localStorage.setItem("buildlab_rig2_build", serialized);
    } catch {}
  }, [rig2Build]);

  // Function to add a component to active build
  const addComponent = (category, component) => {
    if (activeBuildTarget === "rig2") {
      setRig2Build((prev) => ({
        ...prev,
        [category]: component,
      }));
    } else {
      setRig1Build((prev) => ({
        ...prev,
        [category]: component,
      }));
    }
  };

  // Function to remove a component from active build
  const removeComponent = (category) => {
    if (activeBuildTarget === "rig2") {
      setRig2Build((prev) => ({
        ...prev,
        [category]: null,
      }));
    } else {
      setRig1Build((prev) => ({
        ...prev,
        [category]: null,
      }));
    }
  };

  // Function to reset active build
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
    if (activeBuildTarget === "rig2") {
      setRig2Build(emptyBuild);
      try {
        sessionStorage.removeItem("buildlab_rig2_build");
        localStorage.removeItem("buildlab_rig2_build");
      } catch {}
    } else {
      setRig1Build(emptyBuild);
      try {
        sessionStorage.removeItem("buildlab_current_build");
        localStorage.removeItem("buildlab_current_build");
      } catch {}
    }
    setCompatibilityResults([]);
  };

  const clearRig2Build = () => {
    const emptyBuild = {
      cpu: null,
      motherboard: null,
      ram: null,
      storage: null,
      gpu: null,
      psu: null,
      case: null,
    };
    setRig2Build(emptyBuild);
    try {
      sessionStorage.removeItem("buildlab_rig2_build");
      localStorage.removeItem("buildlab_rig2_build");
    } catch {}
  };

  const loadDemoBuild = (demo = DEMO_GAMING_RIG) => {
    if (activeBuildTarget === "rig2") {
      setRig2Build(demo);
    } else {
      setRig1Build(demo);
    }
  };

  // Fetch all components and saved builds from backend on load
  useEffect(() => {
    apiFetch("/api/parts")
      .then(res => res.json())
      .then(data => {
        if (data && typeof data === 'object' && Object.keys(data).length > 0) {
          const categories = ["case", "motherboard", "cpu", "ram", "storage", "gpu", "psu"];
          const mergedCatalog = {};

          for (const cat of categories) {
            const backendItems = Array.isArray(data[cat])
              ? data[cat]
                  .filter(item => {
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
                  })
                  .map(item =>
                    cat === "case" && !item.form_factor
                      ? { ...item, form_factor: "Mid Tower" }
                      : item
                  )
              : [];

            const offlineItems = Array.isArray(OFFLINE_COMPONENTS[cat])
              ? OFFLINE_COMPONENTS[cat]
              : [];

            const normalizeKeyName = (item) => {
              const raw = (item.name || "").toLowerCase().trim();
              const brand = (item.brand || "").toLowerCase().trim();
              if (brand && raw.startsWith(brand + " ")) {
                return raw.slice(brand.length).trim();
              }
              return raw;
            };

            // Index offline fallback metadata so DB rows missing non-essential specs (e.g. wattage/efficiency) inherit them cleanly
            const offlineById = new Map();
            const offlineByName = new Map();
            for (const off of offlineItems) {
              if (off.id) offlineById.set(String(off.id).toLowerCase(), off);
              offlineByName.set(normalizeKeyName(off), off);
            }

            const seenIds = new Set();
            const seenNames = new Set();
            const combined = [];

            for (const rawItem of [...backendItems, ...offlineItems]) {
              const idKey = rawItem.id ? String(rawItem.id).toLowerCase() : null;
              const nameKey = normalizeKeyName(rawItem);
              if (!nameKey) continue;
              if ((idKey && seenIds.has(idKey)) || seenNames.has(nameKey)) continue;

              const offMatch = (idKey && offlineById.get(idKey)) || offlineByName.get(nameKey);
              const merged = offMatch
                ? {
                    ...offMatch,
                    ...rawItem,
                    wattage: rawItem.wattage ?? offMatch.wattage,
                    power_required: rawItem.power_required ?? offMatch.power_required,
                    socket_type: rawItem.socket_type ?? offMatch.socket_type,
                    ddr_type: rawItem.ddr_type ?? offMatch.ddr_type,
                    form_factor: rawItem.form_factor ?? offMatch.form_factor,
                    efficiency: rawItem.efficiency ?? offMatch.efficiency,
                    type: rawItem.type ?? offMatch.type,
                    capacity: rawItem.capacity ?? offMatch.capacity,
                  }
                : rawItem;

              if (idKey) seenIds.add(idKey);
              seenNames.add(nameKey);
              combined.push(merged);
            }

            mergedCatalog[cat] = combined;
          }

          setAllComponents(mergedCatalog);
        }
      })
      .catch(err => {
        console.warn("Backend API offline or database disconnected; using offline fallback parts.", err);
      });

    apiFetch("/api/builds")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSavedBuilds(data);
          try {
            localStorage.setItem("buildlab_saved_builds", JSON.stringify(data));
          } catch {}
        }
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
    apiFetch(`/api/builds/${slotIndex}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(currentBuild),
    }).catch(err => console.error("Error saving build to database:", err));
  };

  const deleteBuildSnapshot = (slotIndex = selectedSaveSlot) => {
    setSavedBuilds((prev) => {
      const newBuilds = [...prev];
      newBuilds[slotIndex] = null;
      try {
        localStorage.setItem("buildlab_saved_builds", JSON.stringify(newBuilds));
      } catch {}
      return newBuilds;
    });

    // Delete from database
    apiFetch(`/api/builds/${slotIndex}`, {
      method: "DELETE",
    }).catch(err => console.error("Error deleting build from database:", err));
  };

  const getSavedBuild = (slotIndex = selectedSaveSlot) => {
    return savedBuilds[slotIndex] || null;
  };

  // Function to get selected components as array
  const getSelectedComponents = (build = currentBuild) => {
    return Object.entries(build || {})
      .filter(([, value]) => value !== null)
      .map(([category, component]) => ({
        category,
        ...component,
      }));
  };

  return (
    <BuildContext.Provider
      value={{
        currentBuild,
        rig1Build,
        rig2Build,
        activeBuildTarget,
        setActiveBuildTarget,
        clearRig2Build,
        setRig1Build,
        setRig2Build,
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
        deleteBuildSnapshot,
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
