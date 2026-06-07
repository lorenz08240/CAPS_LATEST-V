// Rules for the Compatibility Matrix
export const checkCompatibility = (componentToTest, currentBuild) => {
  const { category } = componentToTest;
  
  // By default, it's compatible unless a rule breaks it
  let isCompatible = true;
  let reason = "";

  // Helper to extract numeric values safely (e.g. from "650W" -> 650, or "650" -> 650)
  const getNumber = (val) => {
    if (!val) return 0;
    return parseInt(val.toString().replace(/[^0-9]/g, ""), 10);
  };

  switch (category) {
    case "cpu":
      // Check Motherboard Socket
      if (currentBuild.motherboard) {
        if (componentToTest.socket_type !== currentBuild.motherboard.socket_type) {
          isCompatible = false;
          reason = `Requires ${componentToTest.socket_type} socket, but your motherboard is ${currentBuild.motherboard.socket_type}.`;
        }
      }
      break;

    case "motherboard":
      // Check CPU Socket
      if (currentBuild.cpu) {
        if (componentToTest.socket_type !== currentBuild.cpu.socket_type) {
          isCompatible = false;
          reason = `This motherboard has an ${componentToTest.socket_type} socket, but your CPU needs ${currentBuild.cpu.socket_type}.`;
        }
      }
      // Check RAM DDR Type
      if (currentBuild.ram) {
        if (componentToTest.ddr_type !== currentBuild.ram.ddr_type) {
          isCompatible = false;
          reason = `Supports ${componentToTest.ddr_type} RAM, but you selected ${currentBuild.ram.ddr_type} RAM.`;
        }
      }
      // Check Case Form Factor
      if (currentBuild.case) {
        const caseSize = (currentBuild.case.form_factor || "").toLowerCase();
        const moboSize = (componentToTest.form_factor || "").toLowerCase();
        
        // Basic mapping
        if (caseSize.includes("mini") && !moboSize.includes("itx")) {
           isCompatible = false;
           reason = `Your case is too small for this ${componentToTest.form_factor} motherboard.`;
        }
      }
      break;

    case "ram":
      // Check Motherboard DDR Type
      if (currentBuild.motherboard) {
        if (componentToTest.ddr_type !== currentBuild.motherboard.ddr_type) {
          isCompatible = false;
          reason = `This is ${componentToTest.ddr_type} RAM, but your motherboard supports ${currentBuild.motherboard.ddr_type}.`;
        }
      }
      break;

    case "gpu":
      // Check PSU Wattage
      if (currentBuild.psu) {
        const psuWattage = getNumber(currentBuild.psu.wattage);
        const gpuPower = getNumber(componentToTest.power_required);
        const cpuPower = currentBuild.cpu ? getNumber(currentBuild.cpu.wattage) : 100; // default 100 if no CPU selected
        
        // Add 100W buffer for other components
        if (psuWattage < (gpuPower + cpuPower + 100)) {
           isCompatible = false;
           reason = `Your PSU (${psuWattage}W) might not have enough power for this GPU (Requires ${gpuPower}W + CPU).`;
        }
      }
      break;

    case "psu":
      // Check if it can power the current CPU + GPU
      if (currentBuild.gpu || currentBuild.cpu) {
        const psuWattage = getNumber(componentToTest.wattage);
        const gpuPower = currentBuild.gpu ? getNumber(currentBuild.gpu.power_required) : 0;
        const cpuPower = currentBuild.cpu ? getNumber(currentBuild.cpu.wattage) : 100;
        
        if (psuWattage < (gpuPower + cpuPower + 100)) {
           isCompatible = false;
           reason = `This PSU (${psuWattage}W) is too weak for your selected GPU/CPU combo.`;
        }
      }
      break;

    case "case":
      // Check Motherboard size compatibility
      if (currentBuild.motherboard) {
        const caseSize = (componentToTest.form_factor || "").toLowerCase();
        const moboSize = (currentBuild.motherboard.form_factor || "").toLowerCase();
        if (caseSize.includes("mini") && !moboSize.includes("itx")) {
           isCompatible = false;
           reason = `This case only supports Mini-ITX, but your motherboard is ${currentBuild.motherboard.form_factor}.`;
        }
      }
      break;

    default:
      break;
  }

  return { isCompatible, reason };
};
