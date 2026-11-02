const { test } = require("node:test");
const assert = require("node:assert/strict");

// Pure normalization and matrix checking logic mirroring the unified engine
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
  if (!ff) return 3;
  const s = ff.toString().toLowerCase();
  if (s.includes("mini") || s.includes("itx")) return 1;
  if (s.includes("micro") || s.includes("matx") || s.includes("m-atx")) return 2;
  if (s.includes("e-atx") || s.includes("eatx") || s.includes("extended")) return 4;
  return 3;
};

const getCaseFormFactorCapacity = (ff) => {
  if (!ff) return 3;
  const s = ff.toString().toLowerCase();
  if (s.includes("mini-itx") || s.includes("sff") || s.includes("mini tower")) return 1;
  if (s.includes("micro-atx") || s.includes("matx") || s.includes("m-atx")) return 2;
  if (s.includes("full tower") || s.includes("e-atx")) return 4;
  return 3;
};

const checkCompatibility = (componentToTest, currentBuild = {}) => {
  if (!componentToTest || !componentToTest.category) {
    return { isCompatible: true, reason: "" };
  }

  const { category } = componentToTest;

  if (category === "cpu" && currentBuild.motherboard?.socket_type) {
    if (normalizeSocket(componentToTest.socket_type) !== normalizeSocket(currentBuild.motherboard.socket_type)) {
      return { isCompatible: false, reason: "Socket mismatch" };
    }
  }

  if (category === "motherboard") {
    if (currentBuild.cpu?.socket_type && normalizeSocket(componentToTest.socket_type) !== normalizeSocket(currentBuild.cpu.socket_type)) {
      return { isCompatible: false, reason: "Socket mismatch" };
    }
    if (currentBuild.ram?.ddr_type && normalizeDdr(componentToTest.ddr_type) !== normalizeDdr(currentBuild.ram.ddr_type)) {
      return { isCompatible: false, reason: "Memory mismatch" };
    }
    if (currentBuild.case?.form_factor) {
      if (getMoboFormFactorRank(componentToTest.form_factor) > getCaseFormFactorCapacity(currentBuild.case.form_factor)) {
        return { isCompatible: false, reason: "Form factor collision" };
      }
    }
  }

  if (category === "ram" && currentBuild.motherboard?.ddr_type) {
    if (normalizeDdr(componentToTest.ddr_type) !== normalizeDdr(currentBuild.motherboard.ddr_type)) {
      return { isCompatible: false, reason: "Memory mismatch" };
    }
  }

  if (category === "gpu" && currentBuild.psu?.wattage) {
    const psuW = getNumber(currentBuild.psu.wattage);
    const gpuReq = getNumber(componentToTest.power_required);
    if (psuW > 0 && gpuReq > 0 && psuW < gpuReq) {
      return { isCompatible: false, reason: "Insufficient Power" };
    }
  }

  if (category === "psu" && currentBuild.gpu?.power_required) {
    const psuW = getNumber(componentToTest.wattage);
    const gpuReq = getNumber(currentBuild.gpu.power_required);
    if (psuW > 0 && gpuReq > 0 && psuW < gpuReq) {
      return { isCompatible: false, reason: "Insufficient Power" };
    }
  }

  return { isCompatible: true, reason: "" };
};

// ── Test Cases ──

test("Socket Compatibility: Correctly detects matching sockets (LGA1700)", () => {
  const cpu = { category: "cpu", socket_type: "LGA 1700" };
  const mobo = { socket_type: "LGA1700" };
  const result = checkCompatibility(cpu, { motherboard: mobo });
  assert.equal(result.isCompatible, true);
});

test("Socket Compatibility: Correctly rejects mismatched sockets (AM4 vs AM5)", () => {
  const cpu = { category: "cpu", socket_type: "AM4" };
  const mobo = { socket_type: "AM5" };
  const result = checkCompatibility(cpu, { motherboard: mobo });
  assert.equal(result.isCompatible, false);
});

test("RAM Compatibility: Rejects DDR4 RAM on DDR5 Motherboard", () => {
  const ram = { category: "ram", ddr_type: "DDR4" };
  const mobo = { ddr_type: "DDR5" };
  const result = checkCompatibility(ram, { motherboard: mobo });
  assert.equal(result.isCompatible, false);
});

test("RAM Compatibility: Accepts DDR5 RAM on DDR5 Motherboard", () => {
  const ram = { category: "ram", ddr_type: "DDR5-6000" };
  const mobo = { ddr_type: "DDR5" };
  const result = checkCompatibility(ram, { motherboard: mobo });
  assert.equal(result.isCompatible, true);
});

test("Power Supply: Rejects 500W PSU when GPU requires 750W", () => {
  const psu = { category: "psu", wattage: "500W" };
  const gpu = { power_required: "750W" };
  const result = checkCompatibility(psu, { gpu });
  assert.equal(result.isCompatible, false);
});

test("Power Supply: Accepts 850W PSU when GPU requires 750W", () => {
  const psu = { category: "psu", wattage: "850W" };
  const gpu = { power_required: "750W" };
  const result = checkCompatibility(psu, { gpu });
  assert.equal(result.isCompatible, true);
});

test("Chassis Dimensions: Rejects E-ATX Motherboard in Mini-ITX Case", () => {
  const mobo = { category: "motherboard", form_factor: "E-ATX" };
  const pcCase = { form_factor: "Mini-ITX" };
  const result = checkCompatibility(mobo, { case: pcCase });
  assert.equal(result.isCompatible, false);
});

test("Chassis Dimensions: Accepts Mini-ITX Motherboard in Full Tower Case", () => {
  const mobo = { category: "motherboard", form_factor: "Mini-ITX" };
  const pcCase = { form_factor: "Full Tower" };
  const result = checkCompatibility(mobo, { case: pcCase });
  assert.equal(result.isCompatible, true);
});

