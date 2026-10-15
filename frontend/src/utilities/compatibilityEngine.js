// ═══════════════════════════════════════════════════════════════
// BUILDLAB COMPATIBILITY MATRIX ENGINE (REFINED)
// ═══════════════════════════════════════════════════════════════

// Helper to normalize socket strings (e.g. "LGA 1700", "LGA1700", "lga-1700" -> "lga1700")
const normalizeSocket = (socket) => {
  if (!socket) return "";
  return socket.toString().toLowerCase().replace(/[\s\-_]/g, "");
};

// Helper to normalize DDR generation (e.g. "DDR5-6000", "DDR5" -> "DDR5")
const normalizeDdr = (ddr) => {
  if (!ddr) return "";
  const match = ddr.toString().toUpperCase().match(/DDR[345]/);
  return match ? match[0] : ddr.toString().toUpperCase().trim();
};

// Helper to extract numeric values safely (e.g. from "650W" -> 650, or "650" -> 650)
const getNumber = (val) => {
  if (!val) return 0;
  const num = parseInt(val.toString().replace(/[^0-9]/g, ""), 10);
  return isNaN(num) ? 0 : num;
};

// Form factor size tier ranking: smaller can fit in larger, but larger CANNOT fit in smaller!
// 1 = Mini-ITX, 2 = Micro-ATX, 3 = ATX (Mid Tower), 4 = E-ATX (Full Tower)
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

export const checkCompatibility = (componentToTest, currentBuild) => {
  if (!componentToTest || !componentToTest.category) {
    return { isCompatible: true, reason: "" };
  }

  const { category } = componentToTest;
  let isCompatible = true;
  let reason = "";

  switch (category) {
    case "cpu": {
      // Check Motherboard Socket Match
      if (currentBuild.motherboard && currentBuild.motherboard.socket_type) {
        const cpuSocket = normalizeSocket(componentToTest.socket_type);
        const moboSocket = normalizeSocket(currentBuild.motherboard.socket_type);

        if (cpuSocket && moboSocket && cpuSocket !== moboSocket) {
          isCompatible = false;
          reason = `Socket mismatch: CPU uses ${componentToTest.socket_type}, but motherboard has ${currentBuild.motherboard.socket_type}.`;
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
        }
      }

      // 2. Check RAM DDR Generation Match
      if (currentBuild.ram && currentBuild.ram.ddr_type) {
        const moboDdr = normalizeDdr(componentToTest.ddr_type);
        const ramDdr = normalizeDdr(currentBuild.ram.ddr_type);

        if (moboDdr && ramDdr && moboDdr !== ramDdr) {
          isCompatible = false;
          reason = `Memory mismatch: Motherboard supports ${componentToTest.ddr_type}, but chosen RAM is ${currentBuild.ram.ddr_type}.`;
        }
      }

      // 3. Check Case Size Compatibility
      if (currentBuild.case && currentBuild.case.form_factor) {
        const moboRank = getMoboFormFactorRank(componentToTest.form_factor);
        const caseCapacity = getCaseFormFactorCapacity(currentBuild.case.form_factor);

        if (moboRank > caseCapacity) {
          isCompatible = false;
          reason = `Form factor collision: ${componentToTest.form_factor || "ATX"} motherboard is too large for your ${currentBuild.case.form_factor} case.`;
        }
      }
      break;
    }

    case "ram": {
      // Check Motherboard DDR Generation Match
      if (currentBuild.motherboard && currentBuild.motherboard.ddr_type) {
        const ramDdr = normalizeDdr(componentToTest.ddr_type);
        const moboDdr = normalizeDdr(currentBuild.motherboard.ddr_type);

        if (ramDdr && moboDdr && ramDdr !== moboDdr) {
          isCompatible = false;
          reason = `Memory mismatch: This is ${componentToTest.ddr_type} RAM, but your motherboard requires ${currentBuild.motherboard.ddr_type}.`;
        }
      }
      break;
    }

    case "gpu": {
      // Check PSU Wattage Headroom
      if (currentBuild.psu) {
        const psuWattage = getNumber(currentBuild.psu.wattage);
        const gpuPower = getNumber(componentToTest.power_required) || 200;
        const cpuPower = currentBuild.cpu ? getNumber(currentBuild.cpu.wattage) || 65 : 100;
        const totalSystemDraw = gpuPower + cpuPower + 80; // 80W overhead for Motherboard, RAM, Fans, NVMe

        if (psuWattage > 0 && psuWattage < totalSystemDraw) {
          isCompatible = false;
          reason = `Insufficient power: PSU (${psuWattage}W) cannot safely power this GPU (${gpuPower}W) + CPU (${cpuPower}W) under load.`;
        }
      }
      break;
    }

    case "psu": {
      // Check if PSU can handle current CPU + GPU
      const psuWattage = getNumber(componentToTest.wattage);
      const gpuPower = currentBuild.gpu ? getNumber(currentBuild.gpu.power_required) || 200 : 0;
      const cpuPower = currentBuild.cpu ? getNumber(currentBuild.cpu.wattage) || 65 : 100;
      const totalSystemDraw = gpuPower + cpuPower + (gpuPower > 0 ? 80 : 50);

      if (psuWattage > 0 && psuWattage < totalSystemDraw) {
        isCompatible = false;
        reason = `Underpowered PSU: ${psuWattage}W is insufficient for system draw (~${totalSystemDraw}W needed).`;
      }
      break;
    }

    case "case": {
      // Check if Case can fit installed Motherboard
      if (currentBuild.motherboard && currentBuild.motherboard.form_factor) {
        const caseCapacity = getCaseFormFactorCapacity(componentToTest.form_factor);
        const moboRank = getMoboFormFactorRank(currentBuild.motherboard.form_factor);

        if (moboRank > caseCapacity) {
          isCompatible = false;
          reason = `Chassis too small: This ${componentToTest.form_factor} case cannot accommodate an ${currentBuild.motherboard.form_factor} motherboard.`;
        }
      }
      break;
    }

    case "storage": {
      // Check M.2 vs SATA support
      if (componentToTest.type && currentBuild.motherboard) {
        const isM2 = componentToTest.type.toLowerCase().includes("m.2") || componentToTest.type.toLowerCase().includes("nvme");
        if (isM2 && currentBuild.motherboard.desc && currentBuild.motherboard.desc.toLowerCase().includes("no m.2")) {
          isCompatible = false;
          reason = "Motherboard does not have available M.2 NVMe slots for this drive.";
        }
      }
      break;
    }

    default:
      break;
  }

  return { isCompatible, reason };
};
