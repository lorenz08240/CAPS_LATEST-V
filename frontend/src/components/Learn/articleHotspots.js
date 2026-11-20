/**
 * Shared 3D benchmark hotspots for the hardware workbench.
 *
 * Single source of truth for both CourseShell (stepper / B.O.B. guidance)
 * and LearnHardwareStage (clickable 3D callouts). Positions are calibrated
 * to the geometry rendered by StageSpecimen, so do not tweak them in one
 * consumer only.
 */
export const ARTICLE_HOTSPOTS = [
  {
    id: "sys-cpu",
    label: "LGA CPU Socket & Processor",
    pos: [-0.65, 1.45, -0.32],
    camPos: [-5.2, 2.2, 1.4],
    target: [0, 1.45, -0.32],
    bus: "Socket AM5 / LGA1700 / LGA1151",
    voltage: "1.2V VCore · 65W-253W",
    role: "Executes operating system commands, system physics, and program logic.",
    tip: "Align the golden triangle and seat with Zero Insertion Force. Never force or press pins manually.",
  },
  {
    id: "sys-ram",
    label: "Dual-Channel DDR4 RAM (A2 & B2)",
    pos: [-0.65, 1.45, 1.496],
    camPos: [-5.0, 1.8, 2.8],
    target: [0, 1.45, 1.496],
    bus: "128-Bit DDR4 / DDR5 Dual-Channel",
    voltage: "1.2V - 1.35V VDD",
    role: "High-speed working memory that buffers textures and open tasks right beside the processor.",
    tip: "With two modules, populate slots 2 and 4 (A2 and B2) to enable dual-channel memory bandwidth.",
  },
  {
    id: "sys-nvme",
    label: "M.2 NVMe Thermal Armor SSD",
    pos: [-0.55, -1.45, -0.32],
    camPos: [-4.6, -0.8, 1.2],
    target: [0, -1.45, -0.32],
    bus: "PCIe 4.0 / 5.0 x4 M-Key",
    voltage: "3.3V Direct Rail",
    role: "High-speed NVMe storage connected directly to CPU PCIe lanes for rapid operating system loading.",
    tip: "Insert at a 25-degree angle, secure the standoff screw gently, and peel off the thermal pad protective film.",
  },
  {
    id: "sys-gpu",
    label: "Primary PCIe x16 SafeSlot (GPU)",
    pos: [-0.75, -0.6, -0.32],
    camPos: [-5.8, -0.4, 2.6],
    target: [0, -0.6, -0.32],
    bus: "PCIe 3.0 / 4.0 x16 Stainless Shield",
    voltage: "75W Slot Rail + 8-Pin Power",
    role: "Stainless-steel armored PCIe SafeSlot securing dedicated graphics card against heavy cooler sag.",
    tip: "Plug your monitor display cable directly into this graphics card, not the motherboard backplate.",
  },
  {
    id: "sys-vrm",
    label: "Gunmetal VRM & 24-Pin ATX Header",
    pos: [-0.65, 2.7, -0.32],
    camPos: [-5.4, 3.2, -1.8],
    target: [0, 2.7, -0.32],
    bus: "12V EPS + 24-Pin ATX Standard",
    voltage: "Digi+ VRM Steps 12V -> 1.2V",
    role: "Voltage Regulator Module with brushed gunmetal heatsinks converting power supply DC voltage into clean processor power.",
    tip: "Connect both the 24-pin ATX motherboard cable and the 8-pin EPS processor cable.",
  },
];
