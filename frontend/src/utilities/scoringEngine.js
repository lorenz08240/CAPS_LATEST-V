export const calculateScores = (build) => {
  // Mock scoring logic based on components selected
  // In an educational app, this uses component tags/specs to calculate actual scores
  
  let gaming = 10;
  let productivity = 10;
  let rendering = 10;
  let streaming = 10;
  let storage = 10;
  let value = 10;

  let estWattage = 100; // Base wattage
  let componentsCount = 0;

  const getNumber = (val) => {
    if (!val) return 0;
    return parseInt(val.toString().replace(/[^0-9]/g, ""), 10);
  };

  // Add points based on components
  if (build.cpu) {
    componentsCount++;
    estWattage += getNumber(build.cpu.wattage) || 65;
    
    gaming += 20;
    productivity += 30;
    rendering += 25;
    streaming += 25;
  }

  if (build.gpu) {
    componentsCount++;
    estWattage += getNumber(build.gpu.power_required) || 200;
    
    gaming += 40;
    rendering += 30;
    streaming += 30;
  }

  if (build.ram) {
    componentsCount++;
    estWattage += 15;
    const capacity = getNumber(build.ram.capacity) || 16;
    
    productivity += Math.min(20, capacity);
    rendering += Math.min(15, capacity);
    streaming += Math.min(15, capacity);
  }

  if (build.storage) {
    componentsCount++;
    estWattage += 10;
    const capacity = build.storage.capacity?.includes("TB") ? getNumber(build.storage.capacity) * 1000 : getNumber(build.storage.capacity) || 500;
    
    storage += Math.min(80, capacity / 20);
    gaming += 5;
    productivity += 10;
  }

  if (build.motherboard) {
    componentsCount++;
    estWattage += 30;
  }

  if (build.case) {
    componentsCount++;
  }

  if (build.psu) {
    componentsCount++;
  }

  // Normalize scores to max 100
  gaming = Math.min(100, Math.round(gaming));
  productivity = Math.min(100, Math.round(productivity));
  rendering = Math.min(100, Math.round(rendering));
  streaming = Math.min(100, Math.round(streaming));
  storage = Math.min(100, Math.round(storage));
  
  // Value score mock
  const avgPerf = (gaming + productivity + rendering + streaming + storage) / 5;
  value = Math.min(100, Math.round(avgPerf));

  return {
    gaming,
    productivity,
    rendering,
    streaming,
    storage,
    value,
    totalCost: 0,
    estWattage,
    componentsCount
  };
};
