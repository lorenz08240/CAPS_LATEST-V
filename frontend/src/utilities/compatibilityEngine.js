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
      const mobo = currentBuild.motherboard;
      if (mobo && (mobo.socket_type || mobo.socket)) {
        const cpuSocket = normalizeSocket(componentToTest.socket_type || componentToTest.socket);
        const moboSocket = normalizeSocket(mobo.socket_type || mobo.socket);

        if (cpuSocket && moboSocket && cpuSocket !== moboSocket) {
          isCompatible = false;
          reason = `Socket mismatch: CPU uses ${componentToTest.socket_type || componentToTest.socket}, but motherboard has ${mobo.socket_type || mobo.socket}.`;
          tip = "Make sure the motherboard and CPU share the same socket type so they physically align.";
        }
      }
      break;
    }

    case "motherboard": {
      // 1. Check CPU Socket Match
      const cpu = currentBuild.cpu;
      if (cpu && (cpu.socket_type || cpu.socket)) {
        const moboSocket = normalizeSocket(componentToTest.socket_type || componentToTest.socket);
        const cpuSocket = normalizeSocket(cpu.socket_type || cpu.socket);

        if (moboSocket && cpuSocket && moboSocket !== cpuSocket) {
          isCompatible = false;
          reason = `Socket mismatch: Motherboard has ${componentToTest.socket_type || componentToTest.socket}, but CPU requires ${cpu.socket_type || cpu.socket}.`;
          tip = "Ensure the motherboard chipset and socket match your chosen processor.";
        }
      }

      // 2. Check RAM DDR Generation Match
      const ram = currentBuild.ram;
      if (isCompatible && ram && (ram.ddr_type || ram.ramType)) {
        const moboDdr = normalizeDdr(componentToTest.ddr_type || componentToTest.ramType);
        const ramDdr = normalizeDdr(ram.ddr_type || ram.ramType);

        if (moboDdr && ramDdr && moboDdr !== ramDdr) {
          isCompatible = false;
          reason = `Memory mismatch: Motherboard supports ${componentToTest.ddr_type || componentToTest.ramType}, but chosen RAM is ${ram.ddr_type || ram.ramType}.`;
          tip = "DDR generations are physically keyed and cannot be mixed (e.g. DDR4 vs DDR5).";
        }
      }

      // 3. Check Case Size Compatibility
      const pcCase = currentBuild.case;
      if (isCompatible && pcCase && (pcCase.form_factor || pcCase.formFactor)) {
        const moboRank = getMoboFormFactorRank(componentToTest.form_factor || componentToTest.formFactor);
        const caseCapacity = getCaseFormFactorCapacity(pcCase.form_factor || pcCase.formFactor);

        if (moboRank > caseCapacity) {
          isCompatible = false;
          reason = `Form factor collision: ${componentToTest.form_factor || componentToTest.formFactor || "ATX"} motherboard is too large for your ${pcCase.form_factor || pcCase.formFactor} case.`;
          tip = "Choose a chassis that accommodates your motherboard dimensions or step down to an mATX/ITX board.";
        }
      }
      break;
    }

    case "ram": {
      // Check Motherboard DDR Match
      const mobo = currentBuild.motherboard;
      if (mobo && (mobo.ddr_type || mobo.ramType)) {
        const ramDdr = normalizeDdr(componentToTest.ddr_type || componentToTest.ramType);
        const moboDdr = normalizeDdr(mobo.ddr_type || mobo.ramType);

        if (ramDdr && moboDdr && ramDdr !== moboDdr) {
          isCompatible = false;
          reason = `Memory mismatch: RAM is ${componentToTest.ddr_type || componentToTest.ramType}, but motherboard requires ${mobo.ddr_type || mobo.ramType}.`;
          tip = "Match the DDR standard supported by the motherboard memory slots.";
        }
      }
      break;
    }

    case "gpu": {
      // 1. Check PSU Wattage Headroom
      const psu = currentBuild.psu;
      if (psu && (psu.wattage || psu.power_output)) {
        const psuWatts = getNumber(psu.wattage || psu.power_output);
        const gpuRequired = getNumber(componentToTest.power_required || componentToTest.recommendedPsu || componentToTest.recommended_psu);

        if (psuWatts > 0 && gpuRequired > 0 && psuWatts < gpuRequired) {
          isCompatible = false;
          reason = `Insufficient Power: GPU recommends at least ${gpuRequired}W, but chosen PSU only supplies ${psuWatts}W.`;
          tip = "Upgrade your Power Supply Unit to prevent system shutdowns under heavy graphics loads.";
        }
      }

      // 2. Check Case Length Clearance
      const pcCase = currentBuild.case;
      if (isCompatible && pcCase && (pcCase.max_gpu_length || pcCase.maxGpuLength) && (componentToTest.length || componentToTest.maxGpuLength)) {
        const maxLen = getNumber(pcCase.max_gpu_length || pcCase.maxGpuLength);
        const gpuLen = getNumber(componentToTest.length);
        if (maxLen > 0 && gpuLen > maxLen) {
          isCompatible = false;
          reason = `Clearance collision: GPU length (${gpuLen}mm) exceeds case clearance (${maxLen}mm).`;
          tip = "Choose a chassis with greater GPU clearance or select a more compact graphics card.";
        }
      }
      break;
    }

    case "psu": {
      // Check against GPU requirement
      const gpu = currentBuild.gpu;
      if (gpu && (gpu.power_required || gpu.recommendedPsu || gpu.recommended_psu)) {
        const psuWatts = getNumber(componentToTest.wattage || componentToTest.power_output);
        const gpuRequired = getNumber(gpu.power_required || gpu.recommendedPsu || gpu.recommended_psu);

        if (psuWatts > 0 && gpuRequired > 0 && psuWatts < gpuRequired) {
          isCompatible = false;
          reason = `Insufficient Power: PSU supplies ${psuWatts}W, but GPU requires at least ${gpuRequired}W.`;
          tip = "Select a PSU with higher wattage headroom.";
        }
      }
      break;
    }

    case "case": {
      // 1. Check Motherboard fit inside Case
      const mobo = currentBuild.motherboard;
      if (mobo && (mobo.form_factor || mobo.formFactor)) {
        const moboRank = getMoboFormFactorRank(mobo.form_factor || mobo.formFactor);
        const caseCapacity = getCaseFormFactorCapacity(componentToTest.form_factor || componentToTest.formFactor);

        if (moboRank > caseCapacity) {
          isCompatible = false;
          reason = `Form factor collision: Selected case (${componentToTest.form_factor || componentToTest.formFactor}) cannot fit your ${mobo.form_factor || mobo.formFactor || "ATX"} motherboard.`;
          tip = "Pick a Mid-Tower or Full-Tower chassis that supports your motherboard size.";
        }
      }

      // 2. Check GPU Length fit inside Case
      const gpu = currentBuild.gpu;
      if (isCompatible && gpu && gpu.length && (componentToTest.max_gpu_length || componentToTest.maxGpuLength)) {
        const maxLen = getNumber(componentToTest.max_gpu_length || componentToTest.maxGpuLength);
        const gpuLen = getNumber(gpu.length);
        if (maxLen > 0 && gpuLen > maxLen) {
          isCompatible = false;
          reason = `Clearance collision: Chosen GPU (${gpuLen}mm) exceeds case clearance (${maxLen}mm).`;
          tip = "Pick a Mid-Tower or Full-Tower chassis with greater graphics card clearance.";
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
      } else if (!result2.isCompatible) {
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
export const findAlternatives = (category, currentBuild = {}, allComponents = {}) => {
  const list = allComponents[category] || [];
  const currentPart = currentBuild[category];
  const currentId = currentPart?.id || currentPart?.name;

  // Test against build without the target component being replaced
  const buildWithoutTarget = { ...currentBuild, [category]: null };

  return list
    .filter((part) => {
      // Exclude exact same component currently equipped
      if (currentId && (part.id === currentId || part.name === currentPart?.name)) {
        return false;
      }

      // Check direct pairwise compatibility with existing parts
      const checkResult = checkCompatibility(
        { ...part, category },
        buildWithoutTarget
      );
      if (!checkResult.isCompatible) return false;

      // Verify that this candidate does not cause a new conflict for this category
      const testBuild = { ...buildWithoutTarget, [category]: part };
      const summary = getCompatibilitySummary(testBuild, allComponents);
      const categoryConflict = summary.some((iss) =>
        (iss.components || []).some((c) => c.toLowerCase() === category.toLowerCase())
      );

      return !categoryConflict;
    })
    .sort((a, b) => {
      // PSU sorting: prioritize adequate wattage without excessive overkill
      if (category === "psu") {
        const req = getNumber(currentBuild.gpu?.power_required || currentBuild.gpu?.recommendedPsu || 700);
        const wA = getNumber(a.wattage || a.power_output);
        const wB = getNumber(b.wattage || b.power_output);
        // Ideal buffer is target requirement + 100W
        const diffA = Math.abs(wA - (req + 100));
        const diffB = Math.abs(wB - (req + 100));
        return diffA - diffB;
      }

      // CPU / Motherboard: prioritize matching socket
      if (category === "cpu" && currentBuild.motherboard?.socket_type) {
        const moboSock = normalizeSocket(currentBuild.motherboard.socket_type);
        const sockA = normalizeSocket(a.socket_type || a.socket);
        const sockB = normalizeSocket(b.socket_type || b.socket);
        if (sockA === moboSock && sockB !== moboSock) return -1;
        if (sockB === moboSock && sockA !== moboSock) return 1;
      }

      if (category === "motherboard" && currentBuild.cpu?.socket_type) {
        const cpuSock = normalizeSocket(currentBuild.cpu.socket_type);
        const sockA = normalizeSocket(a.socket_type || a.socket);
        const sockB = normalizeSocket(b.socket_type || b.socket);
        if (sockA === cpuSock && sockB !== cpuSock) return -1;
        if (sockB === cpuSock && sockA !== cpuSock) return 1;
      }

      return 0;
    })
    .slice(0, 3);
};

// Return the single best compatible alternative
export const getBestAlternative = (category, currentBuild = {}, allComponents = {}) => {
  const alts = findAlternatives(category, currentBuild, allComponents);
  return alts.length > 0 ? alts[0] : null;
};
