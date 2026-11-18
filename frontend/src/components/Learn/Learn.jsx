import CourseShell from "./CourseShell";
import React from "react";
import { Link } from "react-router-dom";
import FullscreenGate from "../FullscreenGate/FullscreenGate";
import "./Learn.css";

// ── COMPREHENSIVE HARDWARE COMPONENTS GUIDE ──
const componentGuide = [
  {
    id: "cpu",
    name: "Processor (CPU)",
    badge: "PROCESSOR (CPU) ARCHITECTURE",
    heroImage: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=2000",
    tags: ["Processor", "Cores", "Sockets", "Overclocking"],
    description: "The central processing unit executes instructions, coordinates memory paging, and performs millions of arithmetic operations to power your PC.",
    specs: [
      { label: "Socket", value: "AM5 / LGA1700" },
      { label: "Cores", value: "6 - 24 Cores" },
      { label: "Base Clock", value: "3.5 - 4.5 GHz" },
      { label: "Boost Clock", value: "5.0 - 5.8 GHz" },
      { label: "Memory Support", value: "DDR5 / DDR4" },
      { label: "PCIe Lanes", value: "16 - 28 Lanes" },
      { label: "Cache", value: "32MB - 128MB L3" },
      { label: "TDP Envelope", value: "65W - 253W" }
    ],
    pinouts: [
      { pin: "LGA / AM5 PADS", connectsTo: "Motherboard Socket", desc: "Gold contact pads delivering core voltage and memory channels", color: "#ffffff", hotspotId: "cpu-ihs" },
      { pin: "DDR5 IMC", connectsTo: "DIMM Slots A2 / B2", desc: "Integrated Dual-Channel Memory Controller (128-bit)", color: "#b08d57", hotspotId: "cpu-triangle" },
      { pin: "PCIe 5.0 x16", connectsTo: "Primary GPU Slot", desc: "16 direct high-bandwidth lanes dedicated to graphics", color: "#f59e0b", hotspotId: "cpu-substrate" },
      { pin: "PCIe 5.0 x4", connectsTo: "M.2_1 NVMe Slot", desc: "Direct-to-CPU lanes for OS drive zero-latency reads", color: "#f5e6c7", hotspotId: "cpu-cooler" },
      { pin: "CPU_FAN / AIO_PUMP", connectsTo: "4-Pin PWM Header", desc: "Closed-loop thermal feedback and pump tachometer telemetry", color: "#ef4444", hotspotId: "cpu-radiator" }
    ],
    hotspots: [
      {
        id: "cpu-ihs",
        label: "Integrated Heat Spreader (IHS)",
        pos: [-0.08, 0.1, 0],
        camPos: [-2.8, 0.7, 2.1],
        target: [0, 0, 0],
        bus: "Thermal Interface",
        voltage: "0.8V - 1.35V Core",
        role: "Nickel-plated copper lid transferring up to 253W of silicon die heat directly into your cooler coldplate.",
        tip: "Apply a 4-5mm pea dot of thermal paste at the center and always peel off the cooler's plastic film."
      },
      {
        id: "cpu-substrate",
        label: "PCB Substrate & Die Package",
        pos: [0.02, -0.48, 0.45],
        camPos: [-2.4, -0.8, 2.2],
        target: [0, -0.2, 0.2],
        bus: "AM5 / LGA1700",
        voltage: "VCC_CORE + VDDIO",
        role: "Multi-layer fiberglass carrier routing thousands of micro-traces between CPU chiplets and gold contact pads.",
        tip: "Grip strictly by the side edges to avoid skin oils or bending SMD capacitors on the substrate."
      },
      {
        id: "cpu-triangle",
        label: "Golden Pin-1 Alignment Marker",
        pos: [-0.05, 0.52, -0.52],
        camPos: [-2.2, 1.1, -1.8],
        target: [0, 0.35, -0.35],
        bus: "ZIF Mechanical Key",
        voltage: "Alignment Key",
        role: "Physical reference corner ensuring the CPU sits at the exact 0° orientation before locking the retention arm.",
        tip: "Align the gold triangle with the socket triangle; zero downward force is needed."
      },
      {
        id: "cpu-cooler",
        label: "AIO Pump Coldplate",
        pos: [-0.75, 0.0, 0.0],
        camPos: [-3.4, 0.5, 2.4],
        target: [-0.45, 0, 0],
        bus: "4-Pin PWM + ARGB",
        voltage: "12V Pump Motor",
        role: "Circulates liquid coolant over copper micro-fins to pull transient heat spikes away from the silicon.",
        tip: "Tighten the four mounting thumbscrews in a diagonal X-pattern for even contact pressure."
      },
      {
        id: "cpu-radiator",
        label: "240mm Heat Exchanger",
        pos: [-0.3, 2.25, 0.9],
        camPos: [-4.5, 3.0, 3.8],
        target: [-0.3, 1.9, 0.8],
        bus: "Dual 120mm Fans",
        voltage: "12V Exhaust Array",
        role: "Dissipates absorbed coolant heat through high-density aluminum fins and static-pressure fans.",
        tip: "Mount radiator tubes higher or level, never leaving the pump at the highest point of the loop."
      }
    ],
    matcherRows: [
      { id: 1, tier: "Gaming", model: "Ryzen 7 7800X3D", socket: "AM5", targetSocket: "AM5" },
      { id: 2, tier: "Streaming", model: "Core i7-14700K", socket: "LGA1700", targetSocket: "LGA1700" },
      { id: 3, tier: "Workstation", model: "Ryzen 9 7950X", socket: "AM5", targetSocket: "LGA1700" },
      { id: 4, tier: "Budget", model: "Core i3-14100F", socket: "LGA1700", targetSocket: "LGA1700" }
    ],
    modelOptions: [
      { name: "Ryzen 7 7800X3D", socket: "AM5" },
      { name: "Ryzen 5 7600X", socket: "AM5" },
      { name: "Ryzen 9 7950X", socket: "AM5" },
      { name: "Core i5-14600K", socket: "LGA1700" },
      { name: "Core i7-14700K", socket: "LGA1700" },
      { name: "Core i9-14900K", socket: "LGA1700" },
      { name: "Core i3-14100F", socket: "LGA1700" },
      { name: "Ryzen 5 5600", socket: "AM4" }
    ],
    targetSockets: ["AM5", "LGA1700", "AM4", "LGA1851"],
    namingLeft: {
      title: "intel naming guide",
      colorClass: "intel-head",
      rows: [
        { label: "Type", val: "Intel Desktop Processor" },
        { label: "Tier", val: "i3, i5, i7, i9 (Performance Tiers)" },
        { label: "Gen", val: "14th Gen (e.g. 14700 / 14900)" },
        { label: "Suffixes", val: "K: Unlocked | F: No iGPU | KF: Unlocked + No iGPU | KS: Special Edition" }
      ]
    },
    namingRight: {
      title: "AMD naming guides",
      colorClass: "amd-head",
      rows: [
        { label: "Type", val: "AMD Ryzen Desktop Processor" },
        { label: "Tier", val: "Ryzen 5, Ryzen 7, Ryzen 9" },
        { label: "Series", val: "7000 / 9000 Series (Zen 4 / Zen 5)" },
        { label: "Suffixes", val: "X: High Boost | X3D: Stacked 3D V-Cache | G: APU iGPU | Non-X: 65W Base" }
      ]
    },
    steps: [
      { step: 1, title: "Step 1: Open Socket Retention Latch", desc: "Gently unhook the steel retention lever from the retention hook and lift the load plate upward." },
      { step: 2, title: "Step 2: Align Golden Triangle Indicator", desc: "Locate the small gold triangle marker etched on the CPU corner and align it with the matching triangle icon molded into the socket." },
      { step: 3, title: "Step 3: Drop CPU Gently (Zero Insertion Force)", desc: "Lower the CPU vertically into the socket without tilting or applying force. The processor must settle completely flush under its own weight." },
      { step: 4, title: "Step 4: Close Socket Latch & Lock Lever", desc: "Lower the retention load plate and clamp the retention arm down under the latch hook. The plastic socket cover will eject automatically." },
      { step: 5, title: "Step 5: Apply Thermal Paste & Mount Cooler", desc: "Apply a pea-sized dot (~4-5mm) in the center of the CPU integrated heat spreader (IHS) and fasten cooler screws in a cross diagonal X-pattern." }
    ],
    commonErrors: "Dropping the CPU or forcing it at an angle will bend delicate socket pins. Leaving the plastic protective peel on the cooler base causes immediate 100°C thermal throttling.",
    quiz: [
      {
        question: "What is the primary physical constraint when installing a CPU?",
        options: [
          { text: "The socket type (e.g. AM5 or LGA1700) must match the CPU mechanically and electrically.", correct: true },
          { text: "The CPU fan RGB lighting must sync with motherboard vendor software.", correct: false },
          { text: "The CPU must be from the exact same company as the graphics card.", correct: false },
          { text: "The CPU must be inserted diagonally with 10kg of downward pressure.", correct: false }
        ],
        explanation: "CPU sockets are mechanically engineered; attempting to insert an AM5 processor into an LGA1700 motherboard destroys socket pins and ruins both parts."
      },
      {
        question: "What does TDP (Thermal Design Power) indicate on a processor?",
        options: [
          { text: "The maximum heat output under load that your cooling solution must dissipate in watts.", correct: true },
          { text: "The total number of monitors the CPU can output simultaneously.", correct: false },
          { text: "The maximum RAM frequency supported by the memory controller.", correct: false },
          { text: "The number of hours the processor can run before requiring a reboot.", correct: false }
        ],
        explanation: "TDP measures expected heat output under real workloads, guiding you to select an adequate air cooler or 240/360mm AIO liquid cooler."
      }
    ],
    mistakes: [
      { name: "Pin Damage", desc: "Dropping CPU onto LGA socket bends microscopic contact pins, causing permanent motherboard ruin." },
      { name: "Mismatched Sockets", desc: "Attempting to force an LGA1700 processor into an AM5 socket physically fractures the board." },
      { name: "Dry Thermal Paste", desc: "Omitting paste or failing to peel protective wrap causes instant 100°C shutdown under load." },
      { name: "Throttling", desc: "Using an underpowered 65W stock cooler on a 253W Core i9 drops boost frequencies by over 30%." }
    ],
    matrix: [
      { tier: "Gaming", cpu: "Ryzen 7 7800X3D / Core i5-14600K", socket: "AM5 / LGA1700", spec: "8 Cores • 96MB 3D Cache", tdp: "65W - 120W", highlight: true },
      { tier: "Streaming", cpu: "Ryzen 9 7900X / Core i7-14700K", socket: "AM5 / LGA1700", spec: "12 - 20 Cores • Up to 5.6 GHz", tdp: "125W - 170W" },
      { tier: "Workstation", cpu: "Ryzen 9 7950X / Core i9-14900K", socket: "AM5 / LGA1700", spec: "16 - 24 Cores • Up to 6.0 GHz", tdp: "170W - 253W" },
      { tier: "Budget", cpu: "Ryzen 5 5600 / Core i3-14100F", socket: "AM4 / LGA1700", spec: "4 - 6 Cores • Up to 4.6 GHz", tdp: "58W - 65W" },
      { tier: "Enthusiast", cpu: "Ryzen 9 7950X3D / Core i9-14900KS", socket: "AM5 / LGA1700", spec: "Top Binned • Up to 6.2 GHz", tdp: "120W - 253W+" }
    ],
    brands: [
      { name: "Intel", icon: "INTC", desc: "Core i9/i7/i5 series desktop processors" },
      { name: "AMD", icon: "AMD", desc: "Ryzen Zen micro-architecture with 3D V-Cache" },
      { name: "Qualcomm", icon: "QCOM", desc: "Snapdragon X Elite ARM silicon for PC" },
      { name: "NVIDIA", icon: "NVDA", desc: "Grace CPU & unified AI computing engines" }
    ]
  },
  {
    id: "motherboard",
    name: "Motherboard",
    badge: "MOTHERBOARD CIRCUIT ARCHITECTURE",
    heroImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2000",
    tags: ["Foundation", "Chipset", "VRM", "PCIe 5.0"],
    description: "The foundational printed circuit board connecting CPU, GPU, memory, and storage while distributing regulated power through its VRM.",
    specs: [
      { label: "Socket", value: "LGA1700, AM5" },
      { label: "Form Factor", value: "ATX / mATX / ITX" },
      { label: "Memory Slots", value: "2 - 4 DIMM (DDR5)" },
      { label: "Expansion", value: "PCIe Gen 4 / Gen 5" },
      { label: "M.2 NVMe", value: "2 - 5 Dedicated Slots" },
      { label: "VRM Phases", value: "12 - 24 Power Phases" },
      { label: "Networking", value: "2.5GbE / Wi-Fi 7" },
      { label: "SATA 3.0", value: "4 - 6 Storage Ports" }
    ],
    pinouts: [
      { pin: "LGA / AM5", connectsTo: "Desktop CPU", desc: "Main processor socket under aluminum VRM heatsinks", color: "#ffffff", hotspotId: "mb-socket" },
      { pin: "DIMM A2 / B2", connectsTo: "DDR5 / DDR4 RAM", desc: "Dual-channel memory slots (populate 2nd & 4th first)", color: "#b08d57", hotspotId: "mb-dimm" },
      { pin: "PCIEX16_1", connectsTo: "Graphics Card (GPU)", desc: "Reinforced steel slot carrying 16 direct PCIe CPU lanes", color: "#f59e0b", hotspotId: "mb-pcie" },
      { pin: "M2_1 SOCKET", connectsTo: "NVMe M.2 SSD", desc: "Cable-free high-speed storage slot with thermal pad", color: "#f5e6c7", hotspotId: "mb-m2" },
      { pin: "ATX_PWR 24P", connectsTo: "Power Supply Harness", desc: "Primary +12V, +5V, +3.3V board power distribution", color: "#ef4444", hotspotId: "mb-vrm" },
      { pin: "PCH CHIPSET", connectsTo: "USB / SATA / Audio I/O", desc: "Southbridge hub managing peripheral and expansion buses", color: "#8b5cf6", hotspotId: "mb-pch" }
    ],
    hotspots: [
      {
        id: "mb-socket",
        label: "CPU Socket & Retention Frame",
        pos: [-0.15, 1.4, -0.6],
        camPos: [-3.8, 1.8, -0.6],
        target: [-0.1, 1.4, -0.6],
        bus: "AM5 / LGA1700",
        voltage: "1.1V - 1.35V Regulated",
        role: "Precision pin/pad array linking the CPU directly to the RAM slots, top PCIe x16 slot, and primary M.2 slot.",
        tip: "Never touch socket pins with bare fingers and keep the protective cover on until the CPU drops in."
      },
      {
        id: "mb-dimm",
        label: "4x DDR5 DIMM Slots",
        pos: [-0.15, 1.4, 0.8],
        camPos: [-3.6, 1.6, 1.8],
        target: [-0.1, 1.4, 0.8],
        bus: "Dual-Channel 128-Bit",
        voltage: "1.1V - 1.4V VDD",
        role: "Paired memory slots feeding the processor low-latency active workspace memory.",
        tip: "With 2 sticks, always populate slots A2 and B2 (2nd and 4th from socket) for optimal signal termination."
      },
      {
        id: "mb-m2",
        label: "Primary M.2 NVMe Slot",
        pos: [-0.14, 0.35, -0.6],
        camPos: [-3.2, 0.5, -0.6],
        target: [-0.1, 0.35, -0.6],
        bus: "PCIe 4.0 / 5.0 x4",
        voltage: "3.3V NVMe Rail",
        role: "Top M.2 slot wired straight to CPU lanes for minimal OS and game loading latency.",
        tip: "Peel the blue thermal pad sticker inside the M.2 heatsink shield before tightening the standoff screw."
      },
      {
        id: "mb-pcie",
        label: "Reinforced PCIe x16 Slot",
        pos: [-0.15, -0.7, -0.3],
        camPos: [-4.0, -0.6, 0.6],
        target: [-0.1, -0.7, -0.3],
        bus: "PCIe 5.0 / 4.0 x16",
        voltage: "12V (75W Slot Power)",
        role: "Steel-armored graphics card slot supporting heavy triple-fan GPUs without PCB flex.",
        tip: "Always install the GPU in the topmost x16 slot closest to the CPU for full x16 bandwidth."
      },
      {
        id: "mb-vrm",
        label: "VRM Power Phases & Heatsinks",
        pos: [-0.22, 2.3, -0.6],
        camPos: [-4.0, 2.6, -1.6],
        target: [-0.15, 2.0, -0.8],
        bus: "16+2 DrMOS Stages",
        voltage: "12V EPS -> 1.2V Core",
        role: "Steps down 12V PSU input into ultra-clean current for multi-core CPU boost clocks.",
        tip: "Heavy aluminum VRM blocks matter most if you run an i7/i9 or Ryzen 9 under sustained rendering."
      },
      {
        id: "mb-pch",
        label: "PCH Chipset Heatsink",
        pos: [-0.18, -1.6, 1.4],
        camPos: [-3.8, -1.6, 2.4],
        target: [-0.1, -1.6, 1.4],
        bus: "DMI / PCIe Uplink",
        voltage: "1.05V Chipset",
        role: "Routes SATA ports, secondary M.2 slots, 2.5GbE LAN, Wi-Fi, and USB headers back to the CPU.",
        tip: "Install all brass case standoffs matching your ATX/mATX board layout before screwing the PCB down."
      }
    ],
    matcherRows: [
      { id: 1, tier: "Gaming ATX", model: "ASUS ROG B650-E", socket: "AM5", targetSocket: "AM5" },
      { id: 2, tier: "Content Creation", model: "MSI Z790 Tomahawk", socket: "LGA1700", targetSocket: "LGA1700" },
      { id: 3, tier: "Compact ITX", model: "Gigabyte B650I AORUS", socket: "AM5", targetSocket: "LGA1700" },
      { id: 4, tier: "Budget Build", model: "ASRock B760M Pro", socket: "LGA1700", targetSocket: "LGA1700" }
    ],
    modelOptions: [
      { name: "ASUS ROG B650-E", socket: "AM5" },
      { name: "MSI Z790 Tomahawk", socket: "LGA1700" },
      { name: "Gigabyte B650I AORUS", socket: "AM5" },
      { name: "ASRock B760M Pro", socket: "LGA1700" },
      { name: "ASUS TUF X670E-PLUS", socket: "AM5" },
      { name: "MSI MAG B550 TOMAHAWK", socket: "AM4" }
    ],
    targetSockets: ["AM5", "LGA1700", "AM4", "LGA1851"],
    namingLeft: {
      title: "Intel Chipset Guide",
      colorClass: "intel-head",
      rows: [
        { label: "H-Series", val: "H610 / H770: Budget Entry-Level, Baseline Connectivity" },
        { label: "B-Series", val: "B760: Mainstream Gaming Sweet-Spot, RAM Overclocking" },
        { label: "Z-Series", val: "Z790: Full CPU Multiplier Overclocking & Maximum PCIe Lanes" }
      ]
    },
    namingRight: {
      title: "AMD Chipset Guide",
      colorClass: "amd-head",
      rows: [
        { label: "A-Series", val: "A620: Entry-Level Value, Conservative Power Delivery" },
        { label: "B-Series", val: "B650 / B650E: Performance Sweet-Spot, Full PBO Tuning" },
        { label: "X-Series", val: "X670E / X870E: Dual Promontory Chipset, Dual PCIe 5.0 Slots" }
      ]
    },
    steps: [
      { step: 1, title: "Step 1: Check & Install I/O Shield", desc: "Ensure the rear I/O shield is snapped into the case frame (or verify your board has a pre-installed integrated shield)." },
      { step: 2, title: "Step 2: Install Brass Chassis Standoffs", desc: "Screw brass motherboard standoffs into the chassis tray matching the exact ATX or mATX mounting hole pattern." },
      { step: 3, title: "Step 3: Lower Motherboard into Position", desc: "Carefully seat the motherboard so rear port connectors align with the I/O shield and holes sit over standoffs." },
      { step: 4, title: "Step 4: Fasten Screws in Cross Sequence", desc: "Screw in all mounting screws gently with a magnetic Phillips screwdriver without over-torquing the PCB." },
      { step: 5, title: "Step 5: Connect 24-Pin & EPS Power Cables", desc: "Plug in the main 24-pin ATX power harness and the top 8-pin (or dual 8-pin) CPU power cable until they latch." }
    ],
    commonErrors: "Forgetting brass chassis standoffs causes the motherboard's exposed solder traces to short-circuit directly against the case sheet metal, immediately destroying the board.",
    quiz: [
      {
        question: "What is the primary role of the motherboard's VRM (Voltage Regulator Module)?",
        options: [
          { text: "To step down 12V from the PSU into clean, precise low voltage (1.1-1.3V) for the CPU.", correct: true },
          { text: "To output 3D graphics directly to your monitor.", correct: false },
          { text: "To store permanent Windows operating system boot files.", correct: false },
          { text: "To control the color of all internal RGB lighting.", correct: false }
        ],
        explanation: "High-quality VRMs with robust heatsinks keep power delivery stable during heavy sustained CPU boost clocks without thermal throttling."
      }
    ],
    mistakes: [
      { name: "Missing Standoffs", desc: "Installing directly against bare metal creates fatal short-circuits across motherboard traces." },
      { name: "Wrong RAM Generation", desc: "Attempting to force DDR4 modules into DDR5 slots physically breaks memory pins." },
      { name: "Weak VRMs", desc: "Pairing an entry-level budget board with an i9 or Ryzen 9 causes severe VRM thermal throttling." },
      { name: "Chassis Clearance", desc: "Purchasing a full-size ATX motherboard for a compact Mini-ITX case." }
    ],
    matrix: [
      { tier: "Gaming", cpu: "B650 / B760 ATX Motherboard", socket: "AM5 / LGA1700", spec: "12+2 VRM • Dual M.2 PCIe 4.0", tdp: "Supports up to 200W", highlight: true },
      { tier: "Streaming", cpu: "Z790 / B650E Wi-Fi Board", socket: "AM5 / LGA1700", spec: "16+1+1 VRM • Wi-Fi 6E/7 • USB 20G", tdp: "Supports up to 253W" },
      { tier: "Workstation", cpu: "X670E / Z790 Creator Series", socket: "AM5 / LGA1700", spec: "Dual PCIe 5.0 x16 • 10GbE • USB4", tdp: "Supports up to 300W+" },
      { tier: "Budget", cpu: "A620 / H610 Micro-ATX", socket: "AM4 / AM5 / LGA", spec: "6-8 VRM Phases • Single PCIe 4.0", tdp: "Optimized for 65W CPUs" },
      { tier: "Enthusiast", cpu: "ROG Maximus / MEG Godlike", socket: "AM5 / LGA1700", spec: "24+2 VRM • Liquid Cooling Ready", tdp: "Extreme OC Over 350W" }
    ],
    brands: [
      { name: "ASUS", icon: "ASUS", desc: "ROG, TUF Gaming, and Prime motherboard series" },
      { name: "MSI", icon: "MSI", desc: "Tomahawk, MPG, and MEG rugged power boards" },
      { name: "Gigabyte", icon: "GIGA", desc: "AORUS lineup with high PCIe lane counts" },
      { name: "ASRock", icon: "ASR", desc: "Taichi and Steel Legend feature-rich value boards" }
    ]
  },
  {
    id: "ram",
    name: "Memory (RAM)",
    badge: "HIGH-SPEED MEMORY ARCHITECTURE",
    heroImage: "https://images.unsplash.com/photo-1562976540-1502f7596005?q=80&w=2000",
    tags: ["Speed", "DDR5", "Dual Channel", "Latency"],
    description: "Ultra-low latency volatile storage holding real-time OS instructions and live game textures for immediate nanosecond processor access.",
    specs: [
      { label: "Standard", value: "DDR5 / DDR4" },
      { label: "Frequency", value: "3200 - 6400+ MT/s" },
      { label: "Sweet Spot", value: "DDR5-6000 CL30" },
      { label: "Capacity", value: "16GB - 64GB" },
      { label: "Channels", value: "Dual Channel (128-Bit)" },
      { label: "Voltage", value: "1.1V - 1.35V" },
      { label: "Profiles", value: "XMP 3.0 / EXPO" },
      { label: "Form Factor", value: "288-Pin DIMM" }
    ],
    pinouts: [
      { pin: "288 GOLD PINS", connectsTo: "DIMM Motherboard Slot", desc: "Split contact edge carrying 64-bit channel + ECC lines", color: "#ffffff", hotspotId: "ram-contacts" },
      { pin: "OFFSET KEY NOTCH", connectsTo: "Slot Plastic Bridge", desc: "DDR5 notch sits near center-right so DDR4 cannot fit", color: "#ef4444", hotspotId: "ram-notch" },
      { pin: "PMIC (ON-DIMM)", connectsTo: "5V Board Supply", desc: "DDR5 regulates voltage cleanly right on the stick itself", color: "#f59e0b", hotspotId: "ram-heatsink" },
      { pin: "A2 + B2 CHANNELS", connectsTo: "CPU Memory Controller", desc: "Doubles effective bus width from 64-bit to 128-bit", color: "#b08d57", hotspotId: "ram-diffuser" }
    ],
    hotspots: [
      {
        id: "ram-heatsink",
        label: "Aluminum Heatspreader",
        pos: [0.0, 0.3, 0.2],
        camPos: [-3.1, 0.8, 2.3],
        target: [0, 0, 0],
        bus: "DRAM ICs + PMIC",
        voltage: "1.1V - 1.35V",
        role: "Draws heat away from the memory DRAM dies and DDR5 on-module Power Management IC (PMIC).",
        tip: "Watch total stick height if using a bulky dual-tower air cooler so the front fan clears your RAM."
      },
      {
        id: "ram-notch",
        label: "Generation Key Notch",
        pos: [0.0, -0.5, 0.05],
        camPos: [-2.8, -0.5, 1.8],
        target: [0, -0.35, 0],
        bus: "DDR5 / DDR4 Key",
        voltage: "Mechanical Interlock",
        role: "Asymmetric cutout preventing wrong-generation memory from being inserted into incompatible boards.",
        tip: "Hold the module over the open slot to line up the notch BEFORE pressing evenly with both thumbs."
      },
      {
        id: "ram-contacts",
        label: "Dual-Side Gold Edge Finger",
        pos: [0.0, -0.45, -0.45],
        camPos: [-2.9, -0.3, -1.6],
        target: [0, -0.3, -0.3],
        bus: "288-Pin Contact Bus",
        voltage: "Differential Signaling",
        role: "High-speed data trace contacts requiring firm, even pressure until both top and bottom latches click.",
        tip: "Both sticks of a 2-stick kit belong in slots 2 and 4 (A2 & B2) from the CPU."
      },
      {
        id: "ram-diffuser",
        label: "ARGB Lightbar Diffuser",
        pos: [0.0, 0.85, 0.0],
        camPos: [-3.2, 1.2, 1.9],
        target: [0, 0.5, 0],
        bus: "SMBus Telemetry",
        voltage: "5V Addressable LED",
        role: "Top light pipe controlled via SMBus/I2C alongside SPD temperature and XMP/EXPO profile tables.",
        tip: "Always enable XMP (Intel) or EXPO (AMD) inside BIOS after first boot so RAM runs at rated MT/s."
      }
    ],
    matcherRows: [
      { id: 1, tier: "Gaming Sweet Spot", model: "Corsair Vengeance 32GB (2x16)", socket: "DDR5-6000 CL30", targetSocket: "DDR5-6000 CL30" },
      { id: 2, tier: "High-End Creator", model: "G.Skill Trident Z5 64GB (2x32)", socket: "DDR5-6400 CL32", targetSocket: "DDR5-6400 CL32" },
      { id: 3, tier: "Budget DDR4", model: "Kingston Fury Beast 16GB (2x8)", socket: "DDR4-3200 CL16", targetSocket: "DDR5-6000 CL30" },
      { id: 4, tier: "Esports Rig", model: "TeamGroup Delta 32GB (2x16)", socket: "DDR5-5600 CL36", targetSocket: "DDR5-5600 CL36" }
    ],
    modelOptions: [
      { name: "Corsair Vengeance 32GB (2x16)", socket: "DDR5-6000 CL30" },
      { name: "G.Skill Trident Z5 32GB (2x16)", socket: "DDR5-6000 CL30" },
      { name: "G.Skill Trident Z5 64GB (2x32)", socket: "DDR5-6400 CL32" },
      { name: "Kingston Fury Beast 16GB (2x8)", socket: "DDR4-3200 CL16" },
      { name: "TeamGroup Delta 32GB (2x16)", socket: "DDR5-5600 CL36" },
      { name: "Crucial Pro 32GB (2x16)", socket: "DDR5-5600 CL46" }
    ],
    targetSockets: ["DDR5-6000 CL30", "DDR5-6400 CL32", "DDR5-5600 CL36", "DDR4-3200 CL16"],
    namingLeft: {
      title: "Intel XMP Profiles",
      colorClass: "intel-head",
      rows: [
        { label: "XMP 3.0", val: "Extreme Memory Profile for Intel 12th/13th/14th Gen platforms" },
        { label: "Presets", val: "Up to 3 factory pre-tuned frequency and sub-timing profiles" },
        { label: "Tuning", val: "Custom user-editable on-die SPD profiles" }
      ]
    },
    namingRight: {
      title: "AMD EXPO Profiles",
      colorClass: "amd-head",
      rows: [
        { label: "EXPO", val: "Extended Profiles for Overclocking specifically for Ryzen AM5" },
        { label: "Infinity Fabric", val: "Optimized 1:1 ratio for UCLK and FCLK memory controller clocks" },
        { label: "Sweet Spot", val: "DDR5-6000 CL30 delivers minimum latency and zero stutter" }
      ]
    },
    steps: [
      { step: 1, title: "Step 1: Open Latches on Slots 2 and 4", desc: "Push down the retention clips on motherboard memory slots A2 and B2 (slots 2 & 4 from the CPU socket)." },
      { step: 2, title: "Step 2: Align Memory Key Notch", desc: "Check the offset notch on the bottom edge of the RAM stick and match it with the plastic socket divider." },
      { step: 3, title: "Step 3: Press Down Evenly on Both Ends", desc: "Apply firm, equal pressure with both thumbs until both plastic retention clips snap shut with an audible click." },
      { step: 4, title: "Step 4: Verify Full Seating Flush", desc: "Inspect the side profile to ensure neither end of the RAM stick is tilted or sitting unseated." },
      { step: 5, title: "Step 5: Enable XMP or EXPO in BIOS", desc: "Reboot PC, press DEL/F2 to enter motherboard BIOS, and toggle XMP or EXPO to unlock advertised 6000 MT/s speeds." }
    ],
    commonErrors: "Installing in adjacent slots 1 & 2 causes memory to run in sluggish single-channel mode. Forgetting to toggle XMP in BIOS leaves memory running at conservative 4800 baseline.",
    quiz: [
      {
        question: "Why should desktop RAM be installed in slots 2 and 4 (matching pairs)?",
        options: [
          { text: "It engages dual-channel mode, doubling memory bandwidth to the CPU memory controller.", correct: true },
          { text: "It reduces system power consumption by exactly 50%.", correct: false },
          { text: "Single sticks do not allow the computer to boot.", correct: false },
          { text: "It allows one stick to cool while the other stick works.", correct: false }
        ],
        explanation: "Dual-channel mode lets the memory controller read and write to two modules simultaneously, eliminating severe processor bottlenecks."
      }
    ],
    mistakes: [
      { name: "Single Channel", desc: "Using only 1 RAM stick cuts memory bandwidth in half, causing micro-stutters in games." },
      { name: "Forgetting XMP", desc: "Leaving RAM at default 4800MHz JEDEC baseline wastes paid-for high-speed performance." },
      { name: "Wrong Slots", desc: "Placing sticks in adjacent slots 1 and 2 instead of 2 and 4 disables dual-channel mode." },
      { name: "Mixing Kits", desc: "Combining RAM sticks from different brands leads to timing mismatch crashes and BSODs." }
    ],
    matrix: [
      { tier: "Gaming", cpu: "32GB (2x16GB) DDR5-6000 CL30", socket: "Dual Channel", spec: "Lowest Latency • Optimal 1:1 FCLK", tdp: "1.35V", highlight: true },
      { tier: "Streaming", cpu: "32GB - 64GB DDR5-6000 CL32", socket: "Dual Channel", spec: "High Buffer for OBS & Game Assets", tdp: "1.35V" },
      { tier: "Workstation", cpu: "64GB - 128GB DDR5-5600", socket: "Dual Channel", spec: "High Density for 4K Video & 3D Render", tdp: "1.25V" },
      { tier: "Budget", cpu: "16GB (2x8GB) DDR4-3200 CL16", socket: "Dual Channel", spec: "Cost-Effective 1080p Esports Standard", tdp: "1.35V" },
      { tier: "Enthusiast", cpu: "32GB (2x16GB) DDR5-7200 CL34", socket: "Dual Channel", spec: "Top Binned Hynix A-Die Silicon", tdp: "1.45V" }
    ],
    brands: [
      { name: "Corsair", icon: "COR", desc: "Vengeance & Dominator Titanium RGB series" },
      { name: "G.Skill", icon: "GSK", desc: "Trident Z5 low-latency Hynix A-die overclocking RAM" },
      { name: "Kingston", icon: "KNG", desc: "Fury Beast & Renegade highly compatible kits" },
      { name: "Crucial", icon: "CRU", desc: "Micron-backed Pro series with rock-solid JEDEC stability" }
    ]
  },
  {
    id: "gpu",
    name: "Graphics Card (GPU)",
    badge: "GPU RASTER & RAY TRACING ARCHITECTURE",
    heroImage: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?q=80&w=2000",
    tags: ["Visuals", "Ray Tracing", "VRAM", "DLSS / FSR"],
    description: "Massively parallel computing powerhouse equipped with dedicated shaders, tensor cores, and ray-tracing hardware to render real-time photorealistic worlds.",
    specs: [
      { label: "VRAM Buffer", value: "8GB - 24GB GDDR6X" },
      { label: "Bus Interface", value: "PCIe 4.0 / 5.0 x16" },
      { label: "Memory Bus", value: "128-Bit to 384-Bit" },
      { label: "Power Draw", value: "115W - 450W TGP" },
      { label: "Connector", value: "12V-2x6 / 8-Pin PCIe" },
      { label: "Outputs", value: "HDMI 2.1 / DP 2.1" },
      { label: "AI Hardware", value: "Tensor Cores / NPU" },
      { label: "Form Length", value: "240mm - 340mm" }
    ],
    pinouts: [
      { pin: "PCIe 4.0/5.0 x16", connectsTo: "Motherboard Top Slot", desc: "16 high-speed serial lanes + 75W slot power feed", color: "#ffffff", hotspotId: "gpu-pcie" },
      { pin: "12V-2x6 / 8-PIN", connectsTo: "PSU PCIe Harness", desc: "150W-600W direct dedicated 12V GPU power input", color: "#ef4444", hotspotId: "gpu-power" },
      { pin: "HDMI 2.1 / DP 2.1", connectsTo: "Gaming Monitor", desc: "ALWAYS plug display cables here, not on motherboard", color: "#b08d57", hotspotId: "gpu-io" },
      { pin: "TRI-AXIAL FANS", connectsTo: "Vapor Chamber Fin Stack", desc: "Pulls cool chassis air across copper heatpipes", color: "#f5e6c7", hotspotId: "gpu-shroud" }
    ],
    hotspots: [
      {
        id: "gpu-shroud",
        label: "Triple-Fan Fin Array",
        pos: [-0.4, 0.0, 0.0],
        camPos: [-4.2, 0.6, 2.8],
        target: [0, 0, 0],
        bus: "Zero-RPM PWM Curve",
        voltage: "Up to 450W TGP",
        role: "Massive fin stack and heatpipes cooling the GPU core die and high-speed GDDR6X VRAM chips.",
        tip: "Measure chassis max GPU length (in mm) if you also mount a front liquid radiator."
      },
      {
        id: "gpu-power",
        label: "12V-2x6 Power Receptacle",
        pos: [-0.25, 0.55, 0.85],
        camPos: [-3.2, 1.4, 2.8],
        target: [0, 0.3, 0.8],
        bus: "ATX 3.0 Sense Pins",
        voltage: "12V up to 600W",
        role: "Delivers main high-current DC feed directly from the power supply with sense pins regulating safe wattage.",
        tip: "Push the plug flush with zero visible gap and avoid tight sharp bends right at the connector."
      },
      {
        id: "gpu-pcie",
        label: "PCIe x16 Edge Connector",
        pos: [0.0, -0.55, -0.2],
        camPos: [-3.5, -1.0, 2.2],
        target: [0, -0.4, -0.2],
        bus: "PCIe x16 Bus",
        voltage: "75W Slot Rail",
        role: "Gold edge finger that locks into the motherboard retention clip and transmits frame/texture data.",
        tip: "Press the plastic latch at the end of the motherboard slot before trying to lift a GPU out."
      },
      {
        id: "gpu-io",
        label: "Rear DisplayPort & HDMI I/O",
        pos: [0.0, 0.1, -1.8],
        camPos: [-3.6, 0.6, -3.2],
        target: [0, 0, -1.5],
        bus: "DP 2.1 / HDMI 2.1",
        voltage: "Digital Display Out",
        role: "Dual/Triple DisplayPort and HDMI outputs driving high-refresh 144Hz-360Hz monitors.",
        tip: "Plugging the monitor into the motherboard rear I/O bypasses this entire GPU!"
      }
    ],
    matcherRows: [
      { id: 1, tier: "1440p Sweet Spot", model: "GeForce RTX 4070 Super 12GB", socket: "750W PSU", targetSocket: "750W PSU" },
      { id: 2, tier: "4K Enthusiast", model: "GeForce RTX 4080 Super 16GB", socket: "850W PSU", targetSocket: "850W PSU" },
      { id: 3, tier: "Workstation AI", model: "GeForce RTX 4090 24GB", socket: "1000W PSU", targetSocket: "750W PSU" },
      { id: 4, tier: "Budget Esports", model: "Radeon RX 7600 8GB", socket: "550W PSU", targetSocket: "550W PSU" }
    ],
    modelOptions: [
      { name: "GeForce RTX 4070 Super 12GB", socket: "750W PSU" },
      { name: "GeForce RTX 4080 Super 16GB", socket: "850W PSU" },
      { name: "GeForce RTX 4090 24GB", socket: "1000W PSU" },
      { name: "Radeon RX 7800 XT 16GB", socket: "700W PSU" },
      { name: "Radeon RX 7600 8GB", socket: "550W PSU" }
    ],
    targetSockets: ["750W PSU", "850W PSU", "1000W PSU", "550W PSU"],
    namingLeft: {
      title: "NVIDIA GeForce Naming",
      colorClass: "intel-head",
      rows: [
        { label: "RTX Prefix", val: "Ray Tracing Texel eXtreme with Tensor AI acceleration" },
        { label: "Super / Ti", val: "Enhanced core count, faster memory clock, or wider bus width" },
        { label: "Tiers", val: "4060 (1080p), 4070 (1440p), 4080 (4K), 4090 (Extreme Titan Class)" }
      ]
    },
    namingRight: {
      title: "AMD Radeon Naming",
      colorClass: "amd-head",
      rows: [
        { label: "RX Prefix", val: "Radeon Experience architecture based on RDNA 3 compute units" },
        { label: "XT / XTX", val: "Fully enabled silicon die with highest shader core counts" },
        { label: "Tiers", val: "7600 (Budget), 7700 XT (Mid), 7800 XT (1440p King), 7900 XTX (4K)" }
      ]
    },
    steps: [
      { step: 1, title: "Step 1: Remove Correct Chassis Expansion Covers", desc: "Unscrew and remove the 2 or 3 PCIe rear expansion slot covers aligning with the top PCIe x16 motherboard slot." },
      { step: 2, title: "Step 2: Open PCIe Slot Retention Latch", desc: "Press outward on the plastic retention latch at the right edge of the top PCIe x16 motherboard slot." },
      { step: 3, title: "Step 3: Seat Graphics Card Firmly", desc: "Lower the GPU vertically into the slot and push down firmly until the latch clicks securely over the retention tooth." },
      { step: 4, title: "Step 4: Fasten Screws & Anti-Sag Bracket", desc: "Screw the metal bracket securely into the chassis frame and position an anti-sag support bracket under heavy cards." },
      { step: 5, title: "Step 5: Connect Dedicated Power Cables", desc: "Plug in the 12V-2x6 or individual 8-pin PCIe cables until fully seated with zero gap. Never use daisy-chained splitters." }
    ],
    commonErrors: "Plugging the monitor HDMI or DisplayPort cable into the motherboard instead of the graphics card bypasses the GPU entirely.",
    quiz: [
      {
        question: "What is the primary role of VRAM (Video RAM) on a graphics card?",
        options: [
          { text: "Buffering high-resolution game textures, geometry buffers, and framebuffers for the GPU.", correct: true },
          { text: "Powering the CPU cooling fan directly.", correct: false },
          { text: "Storing your permanent Windows OS operating files.", correct: false },
          { text: "Regulating household wall outlet voltage.", correct: false }
        ],
        explanation: "High-resolution 1440p and 4K textures require massive, high-bandwidth VRAM buffers to render frames without hitching."
      }
    ],
    mistakes: [
      { name: "Daisy-Chained Cables", desc: "Powering a 300W+ graphics card with a single split cable causes melted connectors." },
      { name: "Case Clearance Clash", desc: "Purchasing a 340mm triple-fan card that physically hits front-mounted radiators." },
      { name: "Wrong Video Port", desc: "Plugging the monitor cable into the motherboard instead of the dedicated GPU." },
      { name: "Undersized PSU", desc: "High transient power spikes trip safety shutoffs on low-wattage power supplies." }
    ],
    matrix: [
      { tier: "Gaming", cpu: "GeForce RTX 4070 Super 12GB", socket: "PCIe 4.0 x16", spec: "1440p Ultra • DLSS 3.5 Frame Gen", tdp: "220W TGP", highlight: true },
      { tier: "Streaming", cpu: "GeForce RTX 4070 Ti Super 16GB", socket: "PCIe 4.0 x16", spec: "Dual AV1 Encoders • 16GB VRAM Buffer", tdp: "285W TGP" },
      { tier: "Workstation", cpu: "GeForce RTX 4090 24GB", socket: "PCIe 4.0 x16", spec: "16,384 CUDA Cores • 24GB GDDR6X", tdp: "450W TGP" },
      { tier: "Budget", cpu: "Radeon RX 7600 / RTX 4060", socket: "PCIe 4.0 x8/x16", spec: "1080p High FPS Esports Standard", tdp: "115W - 165W" },
      { tier: "Enthusiast", cpu: "GeForce RTX 4080 Super / 7900 XTX", socket: "PCIe 4.0 x16", spec: "Full 4K Ray Tracing Supremacy", tdp: "320W - 355W" }
    ],
    brands: [
      { name: "NVIDIA", icon: "NVDA", desc: "GeForce RTX series with DLSS 3.5 and Ray Tracing" },
      { name: "AMD", icon: "AMD", desc: "Radeon RX graphics with generous VRAM buffers" },
      { name: "Intel", icon: "INTC", desc: "Arc discrete graphics featuring dual AV1 video encoders" },
      { name: "ASUS ROG", icon: "ASUS", desc: "Strix and TUF custom board-partner cooling designs" }
    ]
  },
  {
    id: "psu",
    name: "Power Supply (PSU)",
    badge: "POWER DELIVERY & EFFICIENCY ARCHITECTURE",
    heroImage: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=2000",
    tags: ["Power", "ATX 3.0", "Modular", "80 Plus Gold"],
    description: "Converts high-voltage alternating wall current into clean, isolated direct current rails (12V, 5V, 3.3V) with over-current and surge protections.",
    specs: [
      { label: "Wattage", value: "650W - 1200W" },
      { label: "Efficiency", value: "80 Plus Gold / Plat" },
      { label: "Modern Standard", value: "ATX 3.0 / ATX 3.1" },
      { label: "GPU Connector", value: "12V-2x6 (Up to 600W)" },
      { label: "Cabling", value: "Fully Modular" },
      { label: "Rail Topology", value: "Single +12V Rail" },
      { label: "Protections", value: "OVP, UVP, OCP, SCP" },
      { label: "Acoustics", value: "Zero-RPM Fan Mode" }
    ],
    pinouts: [
      { pin: "24-PIN ATX", connectsTo: "Motherboard Main Edge", desc: "Provides +12V, +5V, +3.3V and PWR_OK signal", color: "#ffffff", hotspotId: "psu-modular" },
      { pin: "8-PIN EPS 12V", connectsTo: "Top-Left CPU Header", desc: "Dedicated 12V feed powering CPU VRM stages", color: "#b08d57", hotspotId: "psu-modular" },
      { pin: "12V-2x6 / PCIe", connectsTo: "Graphics Card (GPU)", desc: "High-amperage direct 12V lines with sense telemetry", color: "#f59e0b", hotspotId: "psu-modular" },
      { pin: "C13 AC INLET", connectsTo: "Wall Surge Protector", desc: "100-240V AC input with physical master rocker switch", color: "#ef4444", hotspotId: "psu-switch" }
    ],
    hotspots: [
      {
        id: "psu-modular",
        label: "Fully Modular Cable Matrix",
        pos: [0.0, 0.0, 1.05],
        camPos: [2.8, 1.4, 3.2],
        target: [0, 0, 0.8],
        bus: "OEM-Keyed Sockets",
        voltage: "12V / 5V / 3.3V DC",
        role: "Color- and key-grouped DC sockets so you attach only the cables your specific rig actually uses.",
        tip: "NEVER reuse modular cables from another PSU brand or model; internal PSU-side pinouts differ and will fry drives."
      },
      {
        id: "psu-fan",
        label: "135mm Intake Cooling Fan",
        pos: [0.0, 0.65, 0.0],
        camPos: [3.2, 2.4, 2.2],
        target: [0, 0.3, 0],
        bus: "Zero-RPM Thermal",
        voltage: "Active PFC Airflow",
        role: "Draws cool ambient air across high-temp Japanese 105°C capacitors and primary transformers.",
        tip: "Orient the fan downward toward the case bottom perforated dust filter in almost all modern towers."
      },
      {
        id: "psu-switch",
        label: "AC Inlet & Master Breaker",
        pos: [0.0, 0.0, -1.05],
        camPos: [-2.8, 1.4, -3.2],
        target: [0, 0, -0.8],
        bus: "OVP / OCP / SCP",
        voltage: "110V-240V AC In",
        role: "Safety protection stage filtering wall surge spikes before DC conversion.",
        tip: "Leave the PSU switch OFF (O) when installing internal parts; flip ON (I) only right before POST."
      }
    ],
    matcherRows: [
      { id: 1, tier: "Mid-Range Gaming", model: "Corsair RM750e 750W Gold", socket: "ATX 3.0 Gold", targetSocket: "ATX 3.0 Gold" },
      { id: 2, tier: "High-End Flagship", model: "Seasonic Vertex GX-1000W", socket: "ATX 3.0 Plat", targetSocket: "ATX 3.0 Plat" },
      { id: 3, tier: "Budget Builder", model: "be quiet! Pure Power 650W", socket: "ATX 3.0 Bronze", targetSocket: "ATX 3.0 Gold" },
      { id: 4, tier: "SFF Compact", model: "Corsair SF750 Platinum", socket: "SFX Platinum", targetSocket: "SFX Platinum" }
    ],
    modelOptions: [
      { name: "Corsair RM750e 750W Gold", socket: "ATX 3.0 Gold" },
      { name: "Corsair RM850x 850W Gold", socket: "ATX 3.0 Gold" },
      { name: "Seasonic Vertex GX-1000W", socket: "ATX 3.0 Plat" },
      { name: "be quiet! Pure Power 650W", socket: "ATX 3.0 Bronze" },
      { name: "be quiet! Pure Power 12 M 850W", socket: "ATX 3.0 Gold" },
      { name: "Corsair SF750 Platinum", socket: "SFX Platinum" }
    ],
    targetSockets: ["ATX 3.0 Gold", "ATX 3.0 Plat", "ATX 3.0 Bronze", "SFX Platinum"],
    namingLeft: {
      title: "80 Plus Efficiency Ratings",
      colorClass: "intel-head",
      rows: [
        { label: "Bronze", val: "82% - 85% Efficiency: Greater heat waste, entry-level designs" },
        { label: "Gold", val: "87% - 90% Efficiency: The universal sweet spot for modern PCs" },
        { label: "Platinum", val: "90% - 92% Efficiency: Premium Japanese 105°C capacitors" }
      ]
    },
    namingRight: {
      title: "ATX 3.0 & Modular Cabling",
      colorClass: "amd-head",
      rows: [
        { label: "ATX 3.0", val: "Handles 200% transient power spikes without tripping safety breakers" },
        { label: "12V-2x6", val: "Single native cable powering RTX 40-series cards safely up to 600W" },
        { label: "Modular", val: "Attach only cables needed to ensure clean unobstructed chassis airflow" }
      ]
    },
    steps: [
      { step: 1, title: "Step 1: Plug Necessary Cables into PSU Body", desc: "Attach the 24-pin motherboard, CPU EPS, and PCIe power leads before sliding the PSU into the case." },
      { step: 2, title: "Step 2: Orient Intake Fan Downward", desc: "Position the power supply so the cooling fan faces the bottom chassis dust filter vent to draw fresh ambient air." },
      { step: 3, title: "Step 3: Secure with 4 Rear Chassis Screws", desc: "Fasten the 4 corner hex screws through the chassis rear bracket into the power supply casing." },
      { step: 4, title: "Step 4: Route Cables Through Shroud", desc: "Feed cables through bottom routing grommets into the rear management chamber of the PC case." },
      { step: 5, title: "Step 5: Verify Complete Connector Latching", desc: "Press each power plug firmly into its component until the locking plastic tab clicks over the connector." }
    ],
    commonErrors: "Mixing and matching modular cables between different power supply brands or models will send 12V voltage into ground pins, immediately frying SSDs and components.",
    quiz: [
      {
        question: "Why must you NEVER mix modular cables between different power supply brands?",
        options: [
          { text: "PSU-side pinouts are not standardized; wrong wiring sends 12V directly into ground and fries parts.", correct: true },
          { text: "The cables will physically dissolve inside the case.", correct: false },
          { text: "Other brand cables only transmit black and white video signals.", correct: false },
          { text: "The CPU fan will turn in reverse.", correct: false }
        ],
        explanation: "While component-side plugs are standardized, manufacturers use completely different proprietary pin layouts at the PSU casing side."
      }
    ],
    mistakes: [
      { name: "Mixing Cables", desc: "Plugging Cable A into PSU B reverses polarity, immediately frying drives and motherboards." },
      { name: "Cheap No-Name PSUs", desc: "Uncertified low-tier units lack over-current protection and fail under heavy gaming loads." },
      { name: "Zero Headroom", desc: "Running a power supply at 98% continuous capacity causes loud coil whine and fan wear." },
      { name: "Fan Inversion", desc: "Installing the intake fan against solid unventilated sheet metal causes thermal shutdown." }
    ],
    matrix: [
      { tier: "Gaming", cpu: "750W - 850W ATX 3.0 Gold", socket: "Fully Modular", spec: "Native 12V-2x6 • Japanese Capacitors", tdp: "Handles 450W GPU Peaks", highlight: true },
      { tier: "Streaming", cpu: "850W - 1000W ATX 3.0 Gold", socket: "Fully Modular", spec: "Generous Headroom for CPU + GPU", tdp: "Zero RPM Silent Fan Curve" },
      { tier: "Workstation", cpu: "1000W - 1200W Platinum", socket: "Fully Modular", spec: "Dual 12V-2x6 • Cybenetics Platinum", tdp: "Handles 600W Sustained Draw" },
      { tier: "Budget", cpu: "550W - 650W 80 Plus Bronze", socket: "Semi-Modular", spec: "Reliable Baseline for 1080p Esports", tdp: "Single 12V Rail" },
      { tier: "Enthusiast", cpu: "1200W+ Titanium ATX 3.1", socket: "Fully Modular", spec: "Extreme Overclocking & Multi-GPU", tdp: "Maximum Electrical Isolation" }
    ],
    brands: [
      { name: "Seasonic", icon: "SSN", desc: "Industry benchmark OEM with 10-12 year manufacturer warranties" },
      { name: "Corsair", icon: "COR", desc: "RMx and SF series with silent zero-RPM magnetic levitation fans" },
      { name: "be quiet!", icon: "BQT", desc: "Dark Power and Pure Power featuring acoustic silence" },
      { name: "EVGA", icon: "EVGA", desc: "SuperNOVA line known for rock-solid stability and customer service" }
    ]
  },
  {
    id: "case",
    name: "Computer Case",
    badge: "CHASSIS THERMAL & AIRFLOW ARCHITECTURE",
    heroImage: "https://images.unsplash.com/photo-1591488320449-011701bb6704?q=80&w=2000",
    tags: ["Chassis", "Airflow", "Tempered Glass", "Cable Routing"],
    description: "The structural chassis housing your build, engineered with high-flow perforated mesh, acoustic dampening, and radiator clearances.",
    specs: [
      { label: "Chassis Class", value: "Mid-Tower, ITX, Full" },
      { label: "Board Support", value: "E-ATX, ATX, mATX, ITX" },
      { label: "GPU Max Length", value: "360mm - 420mm" },
      { label: "Cooler Height", value: "165mm - 185mm" },
      { label: "Radiator Size", value: "Up to 360mm / 420mm" },
      { label: "Included Fans", value: "3x - 4x High-CFM Fans" },
      { label: "Front Panel", value: "USB-C 10Gbps, Audio" },
      { label: "Dust Filters", value: "Magnetic Top & Bottom" }
    ],
    pinouts: [
      { pin: "F_PANEL HEADER", connectsTo: "Power Switch & LED", desc: "Tiny 2-pin leads that boot your motherboard from the case", color: "#ffffff", hotspotId: "case-front" },
      { pin: "USB 3.2 TYPE-E", connectsTo: "Front USB-C Port", desc: "Keyed high-speed 10-20Gbps front chassis header", color: "#b08d57", hotspotId: "case-front" },
      { pin: "BRASS STANDOFFS", connectsTo: "Motherboard Holes", desc: "Keeps solder traces elevated away from bare case steel", color: "#f59e0b", hotspotId: "case-tray" },
      { pin: "PWM FAN HUB", connectsTo: "SYS_FAN Headers", desc: "Coordinates front intake & rear exhaust positive pressure", color: "#f5e6c7", hotspotId: "case-mesh" }
    ],
    hotspots: [
      {
        id: "case-mesh",
        label: "High-Airflow Mesh Front & Fans",
        pos: [0.0, 0.0, 4.35],
        camPos: [-6.5, 2.5, 9.5],
        target: [0, 0, 2.5],
        bus: "Positive Pressure Intake",
        voltage: "3x 120mm/140mm PWM",
        role: "Unobstructed perforated mesh draws cool ambient air straight onto GPU and CPU coolers.",
        tip: "Keep more intake fans than exhaust fans so positive pressure pushes dust out instead of sucking it through gaps."
      },
      {
        id: "case-tray",
        label: "ATX Motherboard Standoff Tray",
        pos: [0.5, 0.8, 0.0],
        camPos: [-8.5, 2.2, 5.5],
        target: [0.2, 0.5, 0],
        bus: "ATX / mATX / ITX Grid",
        voltage: "Grounded Steel Frame",
        role: "Rigid structural spine supporting motherboard weight, cable cutouts, and rear management chamber.",
        tip: "Check every brass standoff position against your motherboard screw holes—extra misplaced standoffs short-circuit the back of the board."
      },
      {
        id: "case-shroud",
        label: "Lower PSU Shroud & Vent",
        pos: [0.0, -3.5, -1.5],
        camPos: [-7.5, -2.5, -7.5],
        target: [0, -3.2, -1.5],
        bus: "Isolated Thermal Zone",
        voltage: "Bottom Intake Filter",
        role: "Separates power supply cabling and heat from the main motherboard and GPU airflow tunnel.",
        tip: "Route the 8-pin EPS CPU cable through the top-left motherboard tray cutout BEFORE screwing down the board."
      },
      {
        id: "case-front",
        label: "Top/Front I/O Cluster",
        pos: [-0.8, 4.4, 3.6],
        camPos: [-6.0, 6.2, 7.2],
        target: [-0.4, 4.2, 3.4],
        bus: "USB-C / HD Audio / Power",
        voltage: "Motherboard Lower Edge",
        role: "Routes the chassis power button, reset button, headphone jack, and USB-C ports directly to bottom board headers.",
        tip: "Double-check the motherboard manual's F_PANEL diagram for + and - pins before powering on."
      }
    ],
    matcherRows: [
      { id: 1, tier: "High Airflow Mesh", model: "Fractal Design Meshify 2", socket: "ATX Mid-Tower", targetSocket: "ATX Mid-Tower" },
      { id: 2, tier: "Aquarium Showcase", model: "NZXT H9 Flow", socket: "Dual-Chamber", targetSocket: "Dual-Chamber" },
      { id: 3, tier: "Compact SFF", model: "Fractal Terra SFF", socket: "Mini-ITX", targetSocket: "ATX Mid-Tower" },
      { id: 4, tier: "Budget Airflow", model: "Corsair 4000D Airflow", socket: "ATX Mid-Tower", targetSocket: "ATX Mid-Tower" }
    ],
    modelOptions: [
      { name: "Fractal Design Meshify 2", socket: "ATX Mid-Tower" },
      { name: "NZXT H9 Flow", socket: "Dual-Chamber" },
      { name: "Lian Li O11 Dynamic EVO", socket: "Dual-Chamber" },
      { name: "Corsair 4000D Airflow", socket: "ATX Mid-Tower" },
      { name: "Fractal Terra SFF", socket: "Mini-ITX" }
    ],
    targetSockets: ["ATX Mid-Tower", "Dual-Chamber", "Mini-ITX", "Full-Tower"],
    namingLeft: {
      title: "Chassis Layout Types",
      colorClass: "intel-head",
      rows: [
        { label: "High Airflow", val: "Perforated mesh front panel providing maximum intake CFM" },
        { label: "Dual Chamber", val: "Aquarium panoramic glass with PSU and drives concealed behind motherboard" },
        { label: "Small Form Factor", val: "Sub-20L compact footprint requiring ITX boards and SFX power supplies" }
      ]
    },
    namingRight: {
      title: "Airflow Physics Standards",
      colorClass: "amd-head",
      rows: [
        { label: "Positive Pressure", val: "More intake fans than exhaust; forces air out of seam gaps to prevent dust" },
        { label: "Negative Pressure", val: "More exhaust than intake; draws unfiltered ambient dust into chassis cracks" },
        { label: "Neutral Flow", val: "Balanced CFM front-to-back laminar tunnel for optimal GPU cooling" }
      ]
    },
    steps: [
      { step: 1, title: "Step 1: Remove Panels & Prep Interior", desc: "Take off both side tempered glass and metal panels and unbox the chassis accessory screw box." },
      { step: 2, title: "Step 2: Configure Fan Placements", desc: "Ensure front fans act as filtered intakes and rear/top fans act as warm air exhaust." },
      { step: 3, title: "Step 3: Check Standoff Alignment", desc: "Verify motherboard standoffs match your exact ATX or mATX board mounting holes." },
      { step: 4, title: "Step 4: Route Front I/O Headers", desc: "Pass USB-C, USB 3.0, and front panel power switch leads through lower chassis cutouts." },
      { step: 5, title: "Step 5: Bundle Cables with Velcro Tracks", desc: "Fasten loose power and fan cables securely along the rear management spine with zip-ties." }
    ],
    commonErrors: "Solid glass front panels choke intake fans, driving temperatures up by 10-15°C. Setting all fans to exhaust creates heavy negative pressure that pulls dust into every seam.",
    quiz: [
      {
        question: "What is the primary factor that dictates good computer case cooling performance?",
        options: [
          { text: "Perforated mesh ventilation panels providing unobstructed airflow to internal components.", correct: true },
          { text: "Completely sealed thick tempered glass on all exterior panels.", correct: false },
          { text: "Having the maximum number of exterior RGB light strips.", correct: false },
          { text: "Placing the chassis directly against a warm wall.", correct: false }
        ],
        explanation: "Cases with solid front panels severely choke fans, forcing fan curves higher and raising temperatures."
      }
    ],
    mistakes: [
      { name: "Solid Glass Choke", desc: "Sealed glass front panels choke intake fans, raising internal temps by 10-15°C." },
      { name: "Form Size Clash", desc: "Purchasing a compact Mini-ITX case when you purchased a standard ATX motherboard." },
      { name: "All Exhaust Trap", desc: "Setting all fans to exhaust creates severe negative pressure that pulls in dust." },
      { name: "Cooler Clearance", desc: "Tall 165mm air coolers preventing the tempered glass side panel from closing." }
    ],
    matrix: [
      { tier: "Gaming", cpu: "Fractal Meshify 2 / Corsair 4000D", socket: "Mid-Tower", spec: "High Airflow Mesh • 3x 140mm Fans", tdp: "Supports 360mm Rad", highlight: true },
      { tier: "Streaming", cpu: "NZXT H9 Flow / Lian Li O11", socket: "Dual-Chamber", spec: "Panoramic View • Separate Cable Chamber", tdp: "Supports Dual 360mm" },
      { tier: "Workstation", cpu: "Fractal Define 7 / Silent Base", socket: "Full-Tower", spec: "Acoustic Insulation • Multi-Drive Bays", tdp: "High Thermal Mass" },
      { tier: "Budget", cpu: "Montech Air 903 MAX", socket: "Mid-Tower", spec: "Included 4x 140mm ARGB Fans • Mesh", tdp: "Exceptional Value" },
      { tier: "Enthusiast", cpu: "Lian Li O11 Dynamic EVO XL", socket: "Dual-Chamber", spec: "Custom Loop Watercooling Ready", tdp: "Supports Triple 420mm" }
    ],
    brands: [
      { name: "Fractal Design", icon: "FD", desc: "Scandinavian aesthetic, real wood accents, and benchmark airflow" },
      { name: "NZXT", icon: "NX", desc: "Clean minimalist design, cable management bar, and tempered glass" },
      { name: "Lian Li", icon: "LL", desc: "Dual-chamber aquarium chassis (O11 series) and premium aluminum" },
      { name: "Corsair", icon: "COR", desc: "4000D / 5000D airflow series with RapidRoute cable channels" }
    ]
  },
  {
    id: "storage",
    name: "NVMe SSD Storage",
    badge: "PCIe GEN4 / GEN5 SOLID STATE ARCHITECTURE",
    heroImage: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?q=80&w=2000",
    tags: ["NVMe", "M.2 2280", "PCIe 4.0", "DRAM Cache"],
    description: "Non-volatile flash storage plugging directly into the motherboard's M.2 slot over 4 high-speed PCIe lanes with zero SATA data or power cables.",
    specs: [
      { label: "Interface", value: "NVMe 2.0 (PCIe 4.0/5.0 x4)" },
      { label: "Form Factor", value: "M.2 2280 (22mm x 80mm)" },
      { label: "Read Speed", value: "3,500 - 14,500 MB/s" },
      { label: "Write Speed", value: "3,000 - 12,700 MB/s" },
      { label: "NAND Type", value: "3D TLC NAND + DRAM" },
      { label: "Capacity", value: "1TB - 4TB Sweet Spot" },
      { label: "Endurance", value: "600 - 2400 TBW" },
      { label: "Power Draw", value: "3.3V Rail (5W - 9W)" }
    ],
    pinouts: [
      { pin: "M-KEY EDGE (75P)", connectsTo: "Motherboard M2_1 Slot", desc: "Carries 4 direct PCIe lanes straight to CPU without cables", color: "#ffffff", hotspotId: "ssd-connector" },
      { pin: "NVMe CONTROLLER", connectsTo: "Host PCIe Bus", desc: "Multi-core ARM ASIC translating host queues to NAND blocks", color: "#b08d57", hotspotId: "ssd-controller" },
      { pin: "DRAM / SLC CACHE", connectsTo: "Lookup Mapping Table", desc: "Prevents write slowdowns during multi-gigabyte file copies", color: "#f59e0b", hotspotId: "ssd-dram" },
      { pin: "2280 STANDOFF", connectsTo: "M.2 Retention Screw", desc: "Holds module flat after inserting at a 20-30 degree angle", color: "#f5e6c7", hotspotId: "ssd-screw" }
    ],
    hotspots: [
      {
        id: "ssd-controller",
        label: "NVMe Controller IC & Heatsink",
        pos: [0.0, 0.0, -0.35],
        camPos: [-2.8, 0.7, 1.8],
        target: [0, 0, -0.2],
        bus: "PCIe 4.0 / 5.0 x4",
        voltage: "3.3V Regulated",
        role: "8-channel flash controller managing up to 64,000 simultaneous command queues at up to 7,400+ MB/s.",
        tip: "Controller chips run hot under sustained transfers—always seat the motherboard's M.2 heatsink shield over top."
      },
      {
        id: "ssd-connector",
        label: "M-Key Gold Contact Edge",
        pos: [0.0, 0.0, 0.85],
        camPos: [-2.6, 0.5, 2.2],
        target: [0, 0, 0.6],
        bus: "M.2 Socket 3 (M-Key)",
        voltage: "3.3V + SMBus",
        role: "Keyed slot notch accepting NVMe PCIe drives at a 25-degree insertion angle before screwing down flat.",
        tip: "Align the single right-side M-key notch; never force an M.2 SATA B-key card if the slot expects NVMe."
      },
      {
        id: "ssd-dram",
        label: "3D TLC NAND & DRAM Package",
        pos: [0.0, 0.0, 0.25],
        camPos: [-2.9, 0.9, 1.9],
        target: [0, 0, 0.1],
        bus: "ONFI Flash Channels",
        voltage: "Non-Volatile Array",
        role: "Stores your OS, applications, and active game files permanently even with zero wall power.",
        tip: "Choose 3D TLC NAND drives with onboard DRAM cache for your primary Windows boot drive."
      },
      {
        id: "ssd-screw",
        label: "2280 Retention Notch & Standoff",
        pos: [0.0, 0.0, -0.9],
        camPos: [-2.6, 0.6, -2.0],
        target: [0, 0, -0.7],
        bus: "M2 x 2.5mm Fastener",
        voltage: "Grounded PCB Tab",
        role: "Semicircular mounting cutout locking the NVMe stick horizontally against the M.2 standoff.",
        tip: "Remember to install the hex M.2 standoff underneath before tightening the tiny retention screw—never flex the PCB!"
      }
    ],
    matcherRows: [
      { id: 1, tier: "Gaming Boot Drive", model: "Samsung 990 Pro 2TB NVMe", socket: "M.2 PCIe 4.0 x4", targetSocket: "M.2 PCIe 4.0 x4" },
      { id: 2, tier: "Gen5 Creator", model: "Crucial T700 2TB Gen5", socket: "M.2 PCIe 5.0 x4", targetSocket: "M.2 PCIe 5.0 x4" },
      { id: 3, tier: "Legacy SATA Mismatch", model: "Samsung 870 EVO 2.5\"", socket: "SATA III Cable", targetSocket: "M.2 PCIe 4.0 x4" },
      { id: 4, tier: "Value NVMe", model: "WD Black SN770 1TB", socket: "M.2 PCIe 4.0 x4", targetSocket: "M.2 PCIe 4.0 x4" }
    ],
    modelOptions: [
      { name: "Samsung 990 Pro 2TB NVMe", socket: "M.2 PCIe 4.0 x4" },
      { name: "WD Black SN850X 2TB NVMe", socket: "M.2 PCIe 4.0 x4" },
      { name: "Crucial T700 2TB Gen5", socket: "M.2 PCIe 5.0 x4" },
      { name: "WD Black SN770 1TB", socket: "M.2 PCIe 4.0 x4" },
      { name: "Samsung 870 EVO 2.5\"", socket: "SATA III Cable" }
    ],
    targetSockets: ["M.2 PCIe 4.0 x4", "M.2 PCIe 5.0 x4", "SATA III Cable", "M.2 PCIe 3.0 x4"],
    namingLeft: {
      title: "PCIe Generation Speeds",
      colorClass: "intel-head",
      rows: [
        { label: "Gen 3 x4", val: "Up to 3,500 MB/s: Fast everyday boot & budget game storage" },
        { label: "Gen 4 x4", val: "Up to 7,450 MB/s: Current gaming & creator sweet-spot" },
        { label: "Gen 5 x4", val: "Up to 14,500 MB/s: Workstation 8K scratch disks (requires tall heatsink)" }
      ]
    },
    namingRight: {
      title: "Form Factors & Keying",
      colorClass: "amd-head",
      rows: [
        { label: "2280", val: "22mm wide × 80mm long — the standard desktop M.2 size" },
        { label: "M-Key", val: "4-lane PCIe NVMe interface notch (vs B+M key slower SATA)" },
        { label: "TBW", val: "Terabytes Written endurance rating — 600 TBW per 1TB typical" }
      ]
    },
    steps: [
      { step: 1, title: "Step 1: Unscrew Primary M.2 Heatsink Shield", desc: "Locate the topmost M2_1 slot directly between CPU and top PCIe x16 slot and lift off its aluminum cover." },
      { step: 2, title: "Step 2: Peel Protective Blue Thermal Sticker", desc: "Remove the plastic film covering the gray thermal pad under the heatsink so heat conducts cleanly." },
      { step: 3, title: "Step 3: Insert M.2 Edge at 25° Angle", desc: "Align the M-key notch and push the gold contacts gently into the M.2 socket until the drive rests angled upward." },
      { step: 4, title: "Step 4: Press Tail Down Over 2280 Standoff", desc: "Gently press the end notch down flat against the hex standoff without bending the circuit board." },
      { step: 5, title: "Step 5: Fasten Retention Screw or Q-Latch", desc: "Rotate the tool-less Q-Latch or screw down the small M2 screw and re-attach the heatsink shield." }
    ],
    commonErrors: "Forgetting to peel the plastic film under the motherboard's M.2 thermal pad traps heat and throttles Gen4/Gen5 drives during game installs.",
    quiz: [
      {
        question: "Why should your operating system M.2 NVMe SSD be installed in the topmost M2_1 motherboard slot?",
        options: [
          { text: "It connects over direct PCIe lanes straight to the CPU without sharing chipset bandwidth.", correct: true },
          { text: "Bottom slots only work for optical DVD drives.", correct: false },
          { text: "Top slots increase SSD capacity by 50%.", correct: false },
          { text: "M2_1 converts the SSD into system DDR5 memory.", correct: false }
        ],
        explanation: "Motherboard M2_1 slots wire directly to CPU PCIe lanes for lowest latency and zero contention with SATA/USB peripherals."
      },
      {
        question: "What does the number '2280' on an M.2 SSD specification mean?",
        options: [
          { text: "Physical size: 22mm wide by 80mm long", correct: true },
          { text: "Maximum speed: 2,280 MB/s read limit", correct: false },
          { text: "Compatibility limited to the year 2080", correct: false },
          { text: "Number of SATA cables required", correct: false }
        ],
        explanation: "M.2 sizing uses two digits for width in mm (22mm) and two or three digits for length in mm (80mm)."
      }
    ],
    mistakes: [
      { name: "Unpeeled Thermal Pad", desc: "Leaving the clear or blue sticker on the M.2 heatsink insulates the drive and causes thermal throttling." },
      { name: "Missing Standoff", desc: "Screwing the SSD straight into the motherboard without a standoff bends and snaps internal solder traces." },
      { name: "Wrong Length Slot", desc: "Mounting a 2280 drive into a compact handheld-only 2230 bay without a standoff extension." },
      { name: "Chipset Slot Bottleneck", desc: "Placing a flagship Gen5 boot drive in a lower chipset M.2 slot that caps speeds or disables SATA ports." }
    ],
    matrix: [
      { tier: "Gaming", cpu: "Samsung 990 Pro / SN850X 2TB", socket: "M.2 PCIe 4.0 x4", spec: "7,450 MB/s Read • TLC + DRAM", tdp: "Up to 6.5W", highlight: true },
      { tier: "Streaming", cpu: "2TB Gen4 + 2TB Scratch NVMe", socket: "M.2 PCIe 4.0 x4", spec: "Dedicated OBS Recording Buffer", tdp: "5W - 7W" },
      { tier: "Workstation", cpu: "Crucial T700 / Corsair MP700 Pro", socket: "M.2 PCIe 5.0 x4", spec: "12,400 - 14,500 MB/s Sequential", tdp: "Up to 11W" },
      { tier: "Budget", cpu: "WD Black SN770 / Team MP44L 1TB", socket: "M.2 PCIe 4.0 x4", spec: "5,000 MB/s Read • HMB Cache", tdp: "4.5W" },
      { tier: "Enthusiast", cpu: "4TB Dual-NVMe RAID / Pro Series", socket: "M.2 PCIe 5.0 x4", spec: "2,400 TBW Endurance • Heatsink", tdp: "9W - 12W" }
    ],
    brands: [
      { name: "Samsung", icon: "SAM", desc: "990 Pro & 980 Pro vertical V-NAND + in-house controller" },
      { name: "Western Digital", icon: "WD", desc: "WD_BLACK SN850X tuned specifically for gaming DirectStorage" },
      { name: "Crucial", icon: "CRU", desc: "Micron 232-layer NAND P3 Plus & T700 Gen5 series" },
      { name: "SK hynix", icon: "SKH", desc: "Platinum P41 class-leading power efficiency and sustained writes" }
    ]
  }
];

export { componentGuide };

export default function Learn() {
  return (
    <FullscreenGate requireFullscreen>
      <CourseShell componentGuide={componentGuide} />
    </FullscreenGate>
  );
}
