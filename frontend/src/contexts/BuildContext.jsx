import React, { createContext, useContext, useEffect, useState } from "react";

// Build Context for managing selected components
const BuildContext = createContext();


// Build Provider component
export const BuildProvider = ({ children }) => {
  const [currentBuild, setCurrentBuild] = useState({
    cpu: null,
    motherboard: null,
    ram: null,
    storage: null,
    gpu: null,
    psu: null,
    case: null,
  });

  const [allComponents, setAllComponents] = useState({});
  const [compatibilityResults, setCompatibilityResults] = useState([]);
  const [savedBuilds, setSavedBuilds] = useState([null, null, null]);
  const [selectedSaveSlot, setSelectedSaveSlot] = useState(0);

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
    setCurrentBuild({
      cpu: null,
      motherboard: null,
      ram: null,
      storage: null,
      gpu: null,
      psu: null,
      case: null,
    });
    setCompatibilityResults([]);
  };



  // Fetch all components and saved builds from backend on load
  useEffect(() => {
    fetch("http://localhost:5000/api/parts")
      .then(res => res.json())
      .then(data => {
        const cleanedData = {};
        for (const cat in data) {
          cleanedData[cat] = data[cat].filter(item => {
            const lowerName = item.name.toLowerCase();
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
      })
      .catch(err => console.error("Error fetching components:", err));

    fetch("http://localhost:5000/api/builds")
      .then(res => res.json())
      .then(data => setSavedBuilds(data))
      .catch(err => console.error("Error fetching saved builds:", err));
  }, []);

  const saveBuildSnapshot = (slotIndex = selectedSaveSlot) => {
    setSavedBuilds((prev) => {
      const newBuilds = [...prev];
      newBuilds[slotIndex] = currentBuild;
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
