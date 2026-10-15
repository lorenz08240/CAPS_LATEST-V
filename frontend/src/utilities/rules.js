// ═══════════════════════════════════════════════════════════════
// BUILDLAB COMPATIBILITY RULES & MATRIX ENGINE
// ═══════════════════════════════════════════════════════════════

const normalizeSocket = (socket) => {
  if (!socket) return "";
  return socket.toString().toLowerCase().replace(/[\s\-_]/g, "");
};

const normalizeDdr = (ddr) => {
  if (!ddr) return "";
  const match = ddr.toString().toUpperCase().match(/DDR[345]/);
  return match ? match[0] : ddr.toString().toUpperCase().trim();
};

const getNumber = (val) => {
  if (!val) return 0;
  const num = parseInt(val.toString().replace(/[^0-9]/g, ""), 10);
  return isNaN(num) ? 0 : num;
};

const getMoboFormFactorRank = (ff) => {
  if (!ff) return 3; // default ATX
  const s = ff.toString().toLowerCase();
  if (s.includes("mini") || s.includes("itx")) return 1;
  if (s.includes("micro") || s.includes("matx") || s.includes("m-atx")) return 2;
  if (s.includes("e-atx") || s.includes("eatx") || s.includes("extended")) return 4;
  return 3; // ATX standard
};

const getCaseFormFactorCapacity = (ff) => {
  if (!ff) return 3; // default Mid Tower / ATX
  const s = ff.toString().toLowerCase();
  if (s.includes("mini-itx") || s.includes("sff") || s.includes("mini tower")) return 1;
  if (s.includes("micro-atx") || s.includes("matx") || s.includes("m-atx")) return 2;
  if (s.includes("full tower") || s.includes("e-atx")) return 4;
  return 3; // Mid Tower / ATX
};

// Check compatibility of a next part against the current build
export const checkCompatibility = (currentBuild, nextPart) => {
  if (!nextPart || !nextPart.category) {
    return { compatible: true, message: "Compatible" };
  }

  // 1. CPU vs Motherboard (Socket Match)
  if (currentBuild.cpu && nextPart.category === 'motherboard') {
    const cpuSock = normalizeSocket(currentBuild.cpu.socket_type);
    const moboSock = normalizeSocket(nextPart.socket_type);
    if (cpuSock && moboSock && cpuSock !== moboSock) {
      return {
        compatible: false,
        reason: `Socket Mismatch! Your CPU uses ${currentBuild.cpu.socket_type}, but the selected motherboard uses ${nextPart.socket_type}.`,
        tip: "Make sure the motherboard and CPU share the same socket type so they are compatible."
      };
    }
  }

  // 2. Motherboard vs CPU (Reverse check)
  if (currentBuild.motherboard && nextPart.category === 'cpu') {
    const moboSock = normalizeSocket(currentBuild.motherboard.socket_type);
    const cpuSock = normalizeSocket(nextPart.socket_type);
    if (moboSock && cpuSock && moboSock !== cpuSock) {
      return {
        compatible: false,
        reason: `Socket Mismatch! Your motherboard uses ${currentBuild.motherboard.socket_type}, but the selected CPU uses ${nextPart.socket_type}.`,
        tip: "Make sure the motherboard and CPU share the same socket type so they are compatible."
      };
    }
  }

  // 3. RAM vs Motherboard (DDR Type)
  if (currentBuild.ram && nextPart.category === 'motherboard') {
    const ramDdr = normalizeDdr(currentBuild.ram.ddr_type);
    const moboDdr = normalizeDdr(nextPart.ddr_type);
    if (ramDdr && moboDdr && ramDdr !== moboDdr) {
      return {
        compatible: false,
        reason: `RAM Type Mismatch! Your RAM is ${currentBuild.ram.ddr_type}, but the motherboard supports ${nextPart.ddr_type}.`,
        tip: "Make sure the RAM type is compatible with the motherboard (DDR4 or DDR5)."
      };
    }
  }

  // 4. Motherboard vs RAM (Reverse check)
  if (currentBuild.motherboard && nextPart.category === 'ram') {
    const moboDdr = normalizeDdr(currentBuild.motherboard.ddr_type);
    const ramDdr = normalizeDdr(nextPart.ddr_type);
    if (moboDdr && ramDdr && moboDdr !== ramDdr) {
      return {
        compatible: false,
        reason: `RAM Type Mismatch! Your motherboard supports ${currentBuild.motherboard.ddr_type}, but the selected RAM is ${nextPart.ddr_type}.`,
        tip: "Make sure the RAM type is compatible with the motherboard (DDR4 or DDR5)."
      };
    }
  }

  // 5. GPU Power Requirements vs PSU
  if (currentBuild.gpu && nextPart.category === 'psu') {
    const psuW = getNumber(nextPart.wattage);
    const gpuW = getNumber(currentBuild.gpu.power_required) || 200;
    const cpuW = currentBuild.cpu ? getNumber(currentBuild.cpu.wattage) || 65 : 100;
    const needed = gpuW + cpuW + 80;

    if (psuW > 0 && psuW < needed) {
      return {
        compatible: false,
        reason: `Insufficient Power! Your system needs ~${needed}W under load (GPU + CPU + components), but the selected PSU provides only ${psuW}W.`,
        tip: `Choose a power supply with at least ${Math.ceil(needed / 50) * 50}W for reliable system operation.`
      };
    }
  }

  // 6. PSU vs GPU (Reverse check)
  if (currentBuild.psu && nextPart.category === 'gpu') {
    const psuW = getNumber(currentBuild.psu.wattage);
    const gpuW = getNumber(nextPart.power_required) || 200;
    const cpuW = currentBuild.cpu ? getNumber(currentBuild.cpu.wattage) || 65 : 100;
    const needed = gpuW + cpuW + 80;

    if (psuW > 0 && psuW < needed) {
      return {
        compatible: false,
        reason: `Insufficient Power! This GPU requires ~${gpuW}W (system total ~${needed}W), but your current PSU provides only ${psuW}W.`,
        tip: `Upgrade to a higher wattage power supply before installing this graphics card.`
      };
    }
  }

  // 7. Case Form Factor Compatibility vs Motherboard
  if (currentBuild.case && nextPart.category === 'motherboard') {
    const caseCap = getCaseFormFactorCapacity(currentBuild.case.form_factor);
    const moboRank = getMoboFormFactorRank(nextPart.form_factor);
    if (moboRank > caseCap) {
      return {
        compatible: false,
        reason: `Form Factor Issue! Your ${currentBuild.case.form_factor || "selected"} case cannot physically fit an ${nextPart.form_factor || "ATX"} motherboard.`,
        tip: "Choose a larger case (e.g. Mid Tower or Full Tower) or pick a motherboard matching your case size."
      };
    }
  }

  // 8. Motherboard vs Case (Reverse check)
  if (currentBuild.motherboard && nextPart.category === 'case') {
    const caseCap = getCaseFormFactorCapacity(nextPart.form_factor);
    const moboRank = getMoboFormFactorRank(currentBuild.motherboard.form_factor);
    if (moboRank > caseCap) {
      return {
        compatible: false,
        reason: `Form Factor Issue! This ${nextPart.form_factor || "selected"} case cannot fit your installed ${currentBuild.motherboard.form_factor || "ATX"} motherboard.`,
        tip: "Select a case supporting your motherboard's form factor."
      };
    }
  }

  return { compatible: true, message: "Compatible! Great selection." };
};

// Calculate total system power requirements safely
export const calculatePowerRequirements = (build) => {
  let totalWatts = 0;

  if (build.cpu) {
    const cpuW = getNumber(build.cpu.wattage);
    if (cpuW > 0) {
      totalWatts += cpuW;
    } else if (Array.isArray(build.cpu.tags)) {
      const tagW = build.cpu.tags.find((t) => t && t.toString().includes("W"));
      totalWatts += tagW ? getNumber(tagW) : 65;
    } else {
      totalWatts += 65;
    }
  }

  if (build.gpu) {
    totalWatts += getNumber(build.gpu.power_required) || 200;
  }

  if (build.motherboard) totalWatts += 45; // Motherboard & chipset
  if (build.ram) totalWatts += 15;        // RAM modules
  if (build.storage) totalWatts += 10;    // NVMe/SSD
  totalWatts += 20;                       // Fans & RGB overhead

  // Add 15% headroom for peak transient spikes
  return Math.ceil(totalWatts * 1.15);
};

// Get compatibility summary for all components in the build
export const getCompatibilitySummary = (build, allComponents = {}) => {
  const issues = [];
  const components = Object.entries(build).filter(
    ([, value]) => value !== null
  );

  for (let i = 0; i < components.length; i++) {
    for (let j = i + 1; j < components.length; j++) {
      const [cat1, comp1] = components[i];
      const [cat2, comp2] = components[j];

      const result1 = checkCompatibility(
        { [cat1]: comp1 },
        { ...comp2, category: cat2 }
      );
      const result2 = checkCompatibility(
        { [cat2]: comp2 },
        { ...comp1, category: cat1 }
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

// Find alternative components that are compatible
export const findAlternatives = (category, currentBuild, allComponents) => {
  const list = allComponents[category] || [];
  return list
    .filter((part) => {
      const result = checkCompatibility(
        currentBuild,
        { ...part, category }
      );
      return result.compatible;
    })
    .slice(0, 3);
};
