// BUILDLAB UNIFIED COMPATIBILITY ENGINE & RULES MATRIX
// Single Source of Truth for 2D Build Station, 3D Studio & Compatibility Page

// Helper to normalize socket strings (e.g. "LGA 1700", "LGA1700", "lga-1700" -> "lga1700")
export const normalizeSocket = (socket) => {
  if (!socket) return "";
  return socket.toString().toLowerCase().replace(/[\s\-_]/g, "");
};

// Helper to normalize DDR generation (e.g. "DDR5-6000", "DDR5" -> "DDR5")
export const normalizeDdr = (ddr) => {
  if (!ddr) return "";
  const match = ddr.toString().toUpperCase().match(/DDR[345]/);
  return match ? match[0] : ddr.toString().toUpperCase().trim();
};

// Helper to extract numeric values safely (e.g. from "650W" -> 650, or "650" -> 650)
export const getNumber = (val) => {
  if (!val) return 0;
  const num = parseInt(val.toString().replace(/[^0-9]/g, ""), 10);
  return isNaN(num) ? 0 : num;
};

// Form factor size tier ranking: smaller can fit in larger, but larger CANNOT fit in smaller
// 1 = Mini-ITX, 2 = Micro-ATX, 3 = ATX (Mid Tower), 4 = E-ATX (Full Tower)
export const getMoboFormFactorRank = (ff) => {
  if (!ff) return 3; // default ATX
  const s = ff.toString().toLowerCase();
  if (s.includes("mini") || s.includes("itx")) return 1;
  if (s.includes("micro") || s.includes("matx") || s.includes("m-atx")) return 2;
  if (s.includes("e-atx") || s.includes("eatx") || s.includes("extended")) return 4;
  return 3;
};

export const getCaseFormFactorCapacity = (ff) => {
  if (!ff) return 3; // default Mid Tower / ATX
  const s = ff.toString().toLowerCase();
  if (s.includes("mini-itx") || s.includes("sff") || s.includes("mini tower")) return 1;
  if (s.includes("micro-atx") || s.includes("matx") || s.includes("m-atx")) return 2;
  if (s.includes("full tower") || s.includes("e-atx")) return 4;
  return 3;
};

// Calculate required wattage with transient spike buffer
export const calculateRequiredWattage = (build = {}) => {
  let totalWatts = 0;

  if (build.cpu) {
    const cpuWatts = getNumber(build.cpu.wattage);
    totalWatts += cpuWatts > 0 ? cpuWatts : 65;
  }

  if (build.gpu) {
    const gpuWatts = getNumber(build.gpu.power_required);
    totalWatts += gpuWatts > 0 ? gpuWatts : 200;
  }

  if (build.motherboard) totalWatts += 45; // Motherboard & chipset
  if (build.ram) totalWatts += 15;         // RAM modules
  if (build.storage) totalWatts += 10;     // NVMe/SSD
  totalWatts += 20;                        // Fans & RGB overhead

  // Add 15% headroom for transient spikes
  return Math.ceil(totalWatts * 1.15);
};

/**
 * Universal compatibility checker.
 * Tolerates both (part, currentBuild) and (currentBuild, part) signatures.
 */
export const checkCompatibility = (arg1, arg2) => {
  let componentToTest = null;
  let currentBuild = null;

  if (arg1 && arg1.category && (!arg2 || !arg2.category)) {
    componentToTest = arg1;
    currentBuild = arg2 || {};
  } else if (arg2 && arg2.category) {
    componentToTest = arg2;
    currentBuild = arg1 || {};
  } else {
    componentToTest = arg1;
    currentBuild = arg2 || {};
  }

  if (!componentToTest || !componentToTest.category) {
    return { isCompatible: true, compatible: true, reason: "", tip: "" };
  }

  const { category } = componentToTest;
  let isCompatible = true;
  let reason = "";
  let tip = "";

  switch (category) {
    case "cpu": {
      // Check Motherboard Socket Match
      if (currentBuild.motherboard && currentBuild.motherboard.socket_type) {
        const cpuSocket = normalizeSocket(componentToTest.socket_type);
        const moboSocket = normalizeSocket(currentBuild.motherboard.socket_type);

        if (cpuSocket && moboSocket && cpuSocket !== moboSocket) {
          isCompatible = false;
          reason = `Socket mismatch: CPU uses ${componentToTest.socket_type}, but motherboard has ${currentBuild.motherboard.socket_type}.`;
          tip = "Make sure the motherboard and CPU share the same socket type so they physically align.";
        }
      }
      break;
    }

    case "motherboard": {
      // 1. Check CPU Socket Match
      if (currentBuild.cpu && currentBuild.cpu.socket_type) {
        const moboSocket = normalizeSocket(componentToTest.socket_type);
        const cpuSocket = normalizeSocket(currentBuild.cpu.socket_type);

        if (moboSocket && cpuSocket && moboSocket !== cpuSocket) {
          isCompatible = false;
          reason = `Socket mismatch: Motherboard has ${componentToTest.socket_type}, but CPU requires ${currentBuild.cpu.socket_type}.`;
          tip = "Ensure the motherboard chipset and socket match your chosen processor.";
        }
      }

      // 2. Check RAM DDR Generation Match
      if (isCompatible && currentBuild.ram && currentBuild.ram.ddr_type) {
        const moboDdr = normalizeDdr(componentToTest.ddr_type);
        const ramDdr = normalizeDdr(currentBuild.ram.ddr_type);

        if (moboDdr && ramDdr && moboDdr !== ramDdr) {
          isCompatible = false;
          reason = `Memory mismatch: Motherboard supports ${componentToTest.ddr_type}, but chosen RAM is ${currentBuild.ram.ddr_type}.`;
          tip = "DDR generations are physically keyed and cannot be mixed (e.g. DDR4 vs DDR5).";
        }
      }

      // 3. Check Case Size Compatibility
      if (isCompatible && currentBuild.case && currentBuild.case.form_factor) {
        const moboRank = getMoboFormFactorRank(componentToTest.form_factor);
        const caseCapacity = getCaseFormFactorCapacity(currentBuild.case.form_factor);

        if (moboRank > caseCapacity) {
          isCompatible = false;
          reason = `Form factor collision: ${componentToTest.form_factor || "ATX"} motherboard is too large for your ${currentBuild.case.form_factor} case.`;
          tip = "Choose a chassis that accommodates your motherboard dimensions or step down to an mATX/ITX board.";
        }
      }
      break;
    }

    case "ram": {
      // Check Motherboard DDR Match
      if (currentBuild.motherboard && currentBuild.motherboard.ddr_type) {
        const ramDdr = normalizeDdr(componentToTest.ddr_type);
        const moboDdr = normalizeDdr(currentBuild.motherboard.ddr_type);

        if (ramDdr && moboDdr && ramDdr !== moboDdr) {
          isCompatible = false;
          reason = `Memory mismatch: RAM is ${componentToTest.ddr_type}, but motherboard requires ${currentBuild.motherboard.ddr_type}.`;
          tip = "Match the DDR standard supported by the motherboard memory slots.";
        }
      }
      break;
    }

    case "gpu": {
      // Check PSU Wattage Headroom
      if (currentBuild.psu && currentBuild.psu.wattage) {
        const psuWatts = getNumber(currentBuild.psu.wattage);
        const gpuRequired = getNumber(componentToTest.power_required);

        if (psuWatts > 0 && gpuRequired > 0 && psuWatts < gpuRequired) {
          isCompatible = false;
          reason = `Insufficient Power: GPU recommends at least ${gpuRequired}W, but chosen PSU only supplies ${psuWatts}W.`;
          tip = "Upgrade your Power Supply Unit to prevent system shutdowns under heavy graphics loads.";
        }
      }
      break;
    }

    case "psu": {
      // Check against GPU requirement
      if (currentBuild.gpu && currentBuild.gpu.power_required) {
        const psuWatts = getNumber(componentToTest.wattage);
        const gpuRequired = getNumber(currentBuild.gpu.power_required);

        if (psuWatts > 0 && gpuRequired > 0 && psuWatts < gpuRequired) {
          isCompatible = false;
          reason = `Insufficient Power: PSU supplies ${psuWatts}W, but GPU requires at least ${gpuRequired}W.`;
          tip = "Select a PSU with higher wattage headroom.";
        }
      }
      break;
    }

    case "case": {
      // Check Motherboard fit inside Case
      if (currentBuild.motherboard && currentBuild.motherboard.form_factor) {
        const moboRank = getMoboFormFactorRank(currentBuild.motherboard.form_factor);
        const caseCapacity = getCaseFormFactorCapacity(componentToTest.form_factor);

        if (moboRank > caseCapacity) {
          isCompatible = false;
          reason = `Form factor collision: Selected case (${componentToTest.form_factor}) cannot fit your ${currentBuild.motherboard.form_factor || "ATX"} motherboard.`;
          tip = "Pick a Mid-Tower or Full-Tower chassis that supports your motherboard size.";
        }
      }
      break;
    }

    default:
      break;
  }

  return {
    isCompatible,
    compatible: isCompatible,
    reason,
    tip,
  };
};

// Summary for all components in the build
export const getCompatibilitySummary = (build = {}, _allComponents = {}) => {
  const issues = [];
  const components = Object.entries(build).filter(
    ([, value]) => value !== null
  );

  for (let i = 0; i < components.length; i++) {
    for (let j = i + 1; j < components.length; j++) {
      const [cat1, comp1] = components[i];
      const [cat2, comp2] = components[j];

      const result1 = checkCompatibility(
        { ...comp1, category: cat1 },
        { [cat2]: comp2 }
      );
      const result2 = checkCompatibility(
        { ...comp2, category: cat2 },
        { [cat1]: comp1 }
      );

      if (!result1.isCompatible) {
        issues.push({
          components: [cat1, cat2],
          issue: result1.reason,
          tip: result1.tip,
        });
      }
      if (!result2.isCompatible && result2.reason !== result1.reason) {
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

// Find alternative components that are compatible
export const findAlternatives = (category, currentBuild, allComponents = {}) => {
  const list = allComponents[category] || [];
  return list
    .filter((part) => {
      const result = checkCompatibility(
        { ...part, category },
        currentBuild
      );
      return result.isCompatible;
    })
    .slice(0, 3);
};
