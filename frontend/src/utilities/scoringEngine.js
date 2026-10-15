// ═══════════════════════════════════════════════════════════════
// BUILDLAB PERFORMANCE & BALANCING ENGINE (REFINED)
// ═══════════════════════════════════════════════════════════════

const getNumber = (val) => {
  if (!val) return 0;
  const num = parseInt(val.toString().replace(/[^0-9]/g, ""), 10);
  return isNaN(num) ? 0 : num;
};

export const calculateScores = (build) => {
  let gaming = 10;
  let productivity = 10;
  let rendering = 10;
  let streaming = 10;
  let storageScore = 10;

  let estWattage = 80; // Base motherboard/fans/chipset draw
  let componentsCount = 0;
  let totalCost = 0;

  // Track key component tiers for bottleneck analysis
  let cpuTier = 0; // 1 = Entry (i3), 2 = Mid (i5/R5), 3 = High (i7/R7), 4 = Enthusiast (i9/R9)
  let gpuTier = 0; // 1 = Entry (3050), 2 = Mid (4060/6700), 3 = High (4070/6800), 4 = Ultra (4080/4090)

  // 1. CPU Impact
  if (build.cpu) {
    componentsCount++;
    const cpuName = (build.cpu.name || "").toLowerCase();
    const cpuTdp = getNumber(build.cpu.wattage) || 65;
    estWattage += cpuTdp;

    if (cpuName.includes("i9") || cpuName.includes("ryzen 9") || cpuName.includes("9950x")) {
      cpuTier = 4;
      gaming += 32;
      productivity += 45;
      rendering += 42;
      streaming += 40;
    } else if (cpuName.includes("i7") || cpuName.includes("ryzen 7") || cpuName.includes("9800x3d") || cpuName.includes("7700")) {
      cpuTier = 3;
      gaming += 30;
      productivity += 38;
      rendering += 34;
      streaming += 35;
    } else if (cpuName.includes("i5") || cpuName.includes("ryzen 5") || cpuName.includes("7600")) {
      cpuTier = 2;
      gaming += 25;
      productivity += 28;
      rendering += 24;
      streaming += 25;
    } else {
      cpuTier = 1;
      gaming += 15;
      productivity += 18;
      rendering += 14;
      streaming += 15;
    }
  }

  // 2. GPU Impact
  if (build.gpu) {
    componentsCount++;
    const gpuName = (build.gpu.name || "").toLowerCase();
    const gpuTdp = getNumber(build.gpu.power_required) || 200;
    estWattage += gpuTdp;

    if (gpuName.includes("4090") || gpuName.includes("5090") || gpuName.includes("7900 xtx")) {
      gpuTier = 4;
      gaming += 55;
      rendering += 48;
      streaming += 45;
    } else if (gpuName.includes("4080") || gpuName.includes("5080") || gpuName.includes("7900 xt") || gpuName.includes("6800 xt")) {
      gpuTier = 3;
      gaming += 48;
      rendering += 40;
      streaming += 38;
    } else if (gpuName.includes("4070") || gpuName.includes("5070") || gpuName.includes("7800")) {
      gpuTier = 3;
      gaming += 42;
      rendering += 34;
      streaming += 32;
    } else if (gpuName.includes("4060") || gpuName.includes("5060") || gpuName.includes("6700") || gpuName.includes("7600")) {
      gpuTier = 2;
      gaming += 34;
      rendering += 25;
      streaming += 24;
    } else {
      gpuTier = 1;
      gaming += 20;
      rendering += 16;
      streaming += 16;
    }
  }

  // 3. RAM Impact
  if (build.ram) {
    componentsCount++;
    estWattage += 15;
    const capacity = getNumber(build.ram.capacity) || 16;
    const ddr = (build.ram.ddr_type || "").toUpperCase();

    const ddrBonus = ddr.includes("5") ? 6 : 2;
    productivity += Math.min(22, Math.round(capacity * 0.7)) + ddrBonus;
    rendering += Math.min(20, Math.round(capacity * 0.6)) + ddrBonus;
    streaming += Math.min(18, Math.round(capacity * 0.5));
    gaming += Math.min(10, Math.round(capacity * 0.3)) + ddrBonus;
  }

  // 4. Storage Impact
  if (build.storage) {
    componentsCount++;
    estWattage += 10;
    const isTb = (build.storage.capacity || "").toUpperCase().includes("TB");
    const rawCap = getNumber(build.storage.capacity) || (isTb ? 1 : 512);
    const capacityGb = isTb ? rawCap * 1000 : rawCap;

    storageScore += Math.min(85, Math.round(capacityGb / 25));
    productivity += 8;
    gaming += 4;
  }

  // 5. Motherboard Impact
  if (build.motherboard) {
    componentsCount++;
    estWattage += 30;
    productivity += 4;
    gaming += 3;
  }

  // 6. Case & PSU
  if (build.case) componentsCount++;
  if (build.psu) componentsCount++;

  // Calculate Total Cost from all selected components
  Object.values(build).forEach((part) => {
    if (part && part.price) {
      const priceNum = getNumber(part.price);
      if (priceNum > 0) totalCost += priceNum;
    }
  });

  // Normalize scores to 0-100 scale
  gaming = Math.min(100, Math.max(10, Math.round(gaming)));
  productivity = Math.min(100, Math.max(10, Math.round(productivity)));
  rendering = Math.min(100, Math.max(10, Math.round(rendering)));
  streaming = Math.min(100, Math.max(10, Math.round(streaming)));
  storageScore = Math.min(100, Math.max(10, Math.round(storageScore)));

  const overall = Math.round((gaming * 0.35) + (productivity * 0.25) + (rendering * 0.2) + (streaming * 0.2));

  // Bottleneck & Balance Detection
  let bottleneck = null;
  if (gpuTier >= 3 && cpuTier === 1) {
    bottleneck = "Severe CPU Bottleneck: Your high-tier GPU is constrained by entry-level CPU throughput.";
  } else if (cpuTier >= 3 && gpuTier === 1 && build.gpu) {
    bottleneck = "GPU Bottleneck: Ultra CPU paired with entry-level graphics in gaming workloads.";
  } else if (build.psu) {
    const psuW = getNumber(build.psu.wattage);
    if (psuW > 0 && psuW < estWattage + 40) {
      bottleneck = `Tight Power Headroom: PSU (${psuW}W) provides less than 40W buffer above estimated draw (${estWattage}W).`;
    }
  }

  return {
    gaming,
    productivity,
    rendering,
    streaming,
    storage: storageScore,
    overall,
    totalCost,
    totalCostFormatted: totalCost > 0 ? `₱${totalCost.toLocaleString()}` : "₱0",
    estWattage,
    componentsCount,
    bottleneck
  };
};
