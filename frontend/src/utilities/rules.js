// BuildLab Compatibility Rules Engine
export const checkCompatibility = (currentBuild, nextPart) => {
  // 1. CPU vs Motherboard (Socket Match)
  if (currentBuild.cpu && nextPart.category === 'motherboard') {
    if (currentBuild.cpu.socket_type !== nextPart.socket_type) {
      return {
        compatible: false,
        reason: `Socket Mismatch! Your CPU uses ${currentBuild.cpu.socket_type}, but the selected motherboard uses ${nextPart.socket_type}.`,
        tip: "Make sure the motherboard and CPU share the same socket type so they are compatible."
      };
    }
  }

  // 2. Motherboard vs CPU (Reverse check)
  if (currentBuild.motherboard && nextPart.category === 'cpu') {
    if (currentBuild.motherboard.socket_type !== nextPart.socket_type) {
      return {
        compatible: false,
        reason: `Socket Mismatch! Your motherboard uses ${currentBuild.motherboard.socket_type}, but the selected CPU uses ${nextPart.socket_type}.`,
        tip: "Make sure the motherboard and CPU share the same socket type so they are compatible."
      };
    }
  }

  // 3. RAM vs Motherboard (DDR Type)
  if (currentBuild.ram && nextPart.category === 'motherboard') {
    if (currentBuild.ram.ddr_type !== nextPart.ddr_type) {
      return {
        compatible: false,
        reason: `RAM Type Mismatch! Your RAM is ${currentBuild.ram.ddr_type}, but the motherboard supports ${nextPart.ddr_type}.`,
        tip: "Make sure the RAM type is compatible with the motherboard (DDR4 or DDR5)."
      };
    }
  }

  // 4. Motherboard vs RAM (Reverse check)
  if (currentBuild.motherboard && nextPart.category === 'ram') {
    if (currentBuild.motherboard.ddr_type !== nextPart.ddr_type) {
      return {
        compatible: false,
        reason: `RAM Type Mismatch! Your motherboard supports ${currentBuild.motherboard.ddr_type}, but the selected RAM is ${nextPart.ddr_type}.`,
        tip: "Make sure the RAM type is compatible with the motherboard (DDR4 or DDR5)."
      };
    }
  }

  // 5. GPU Power Requirements vs PSU
  if (currentBuild.gpu && nextPart.category === 'psu') {
    if (nextPart.wattage < currentBuild.gpu.power_required) {
      return {
        compatible: false,
        reason: `Insufficient Power! Your GPU requires ${currentBuild.gpu.power_required}W, but the selected PSU only provides ${nextPart.wattage}W.`,
        tip: "Choose a PSU with a higher wattage than the total power requirements of your system."
      };
    }
  }

  // 6. PSU vs GPU (Reverse check)
  if (currentBuild.psu && nextPart.category === 'gpu') {
    if (currentBuild.psu.wattage < nextPart.power_required) {
      return {
        compatible: false,
        reason: `Insufficient Power! This GPU requires ${nextPart.power_required}W, but your PSU only provides ${currentBuild.psu.wattage}W.`,
        tip: "Choose a PSU with a higher wattage than the total power requirements of your system."
      };
    }
  }


  // 7. Case Form Factor Compatibility (Basic check)
  if (currentBuild.case && nextPart.category === 'motherboard') {
    // This is a simplified check - in reality, cases support multiple form factors
    const supportedFormFactors = ['ATX', 'mATX', 'Mini-ITX'];
    if (!supportedFormFactors.includes(nextPart.form_factor || 'ATX')) {
      return {
        compatible: false,
        reason: `Form Factor Issue! Your case may not support the ${nextPart.form_factor || 'ATX'} motherboard form factor.`,
        tip: "Check the case specifications for supported motherboard form factors."
      };
    }
  }


  // 4. GPU Power Requirements vs PSU
  if (currentBuild.gpu && nextPart.category === "psu") {
    const recommendedWattage = (currentBuild.gpu.power_required || 200) + 250;
    if (nextPart.wattage < recommendedWattage) {
      return {
        compatible: false,
        reason: `Insufficient Power! Your system requires ~${recommendedWattage}W for stability, but this PSU provides only ${nextPart.wattage}W.`,
        tip: `We recommend upgrading to a 750W or 850W power supply for better system stability.`,
      };
    }
  }

  return { compatible: true, message: "Compatible! Great selection." };
};

// Calculate total system power requirements
export const calculatePowerRequirements = (build) => {
  let totalWatts = 0;

  if (build.cpu)
    totalWatts += parseInt(
      build.cpu.tags.find((tag) => tag.includes("W"))?.replace("W", "") || "65"
    );
  if (build.gpu) totalWatts += build.gpu.power_required || 150;
  if (build.motherboard) totalWatts += 50; // Base motherboard power
  if (build.ram) totalWatts += 10; // RAM power
  if (build.storage) totalWatts += 10; // Storage power

  // Add 20% overhead for safety
  totalWatts = Math.ceil(totalWatts * 1.2);

  return totalWatts;
};

// Get compatibility summary for all components
export const getCompatibilitySummary = (build, allComponents = {}) => {
  const issues = [];
  const components = Object.entries(build).filter(
    ([key, value]) => value !== null
  );

  // Check all pairwise combinations
  for (let i = 0; i < components.length; i++) {
    for (let j = i + 1; j < components.length; j++) {
      const [cat1, comp1] = components[i];
      const [cat2, comp2] = components[j];

      // Check compatibility in both directions
      const result1 = checkCompatibility(
        { [cat1]: comp1 },
        { ...comp2, category: cat2 },
        allComponents
      );
      const result2 = checkCompatibility(
        { [cat2]: comp2 },
        { ...comp1, category: cat1 },
        allComponents
      );

      if (!result1.compatible) {
        issues.push({
          components: [cat1, cat2],
          issue: result1.reason,
          tip: result1.tip,
        });
      }
      if (!result2.compatible && result2.reason !== result1.reason) {
        issues.push({
          components: [cat2, cat1],
          issue: result2.reason,
          tip: result2.tip,
        });
      }
    }
  }

  return issues;
};

export const findAlternatives = (category, currentBuild, allComponents) => {
  const list = allComponents[category] || [];
  // Filter out components that are incompatible based on the current build
  return list
    .filter((part) => {
      const testBuild = { ...currentBuild, [category]: part };
      const result = checkCompatibility(
        currentBuild,
        { ...part, category },
        allComponents
      );
      return result.compatible;
    })
    .slice(0, 3); // Return top 3 alternatives
};
