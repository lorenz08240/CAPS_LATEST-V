import CourseShell from "./CourseShell";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useBuild } from "../../contexts/BuildContext";
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
      { name: "Intel", icon: "🔵", desc: "Core i9/i7/i5 series desktop processors" },
      { name: "AMD", icon: "🔴", desc: "Ryzen Zen micro-architecture with 3D V-Cache" },
      { name: "Qualcomm", icon: "🟣", desc: "Snapdragon X Elite ARM silicon for PC" },
      { name: "NVIDIA", icon: "🟢", desc: "Grace CPU & unified AI computing engines" }
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
      { name: "ASUS", icon: "🔴", desc: "ROG, TUF Gaming, and Prime motherboard series" },
      { name: "MSI", icon: "🐉", desc: "Tomahawk, MPG, and MEG rugged power boards" },
      { name: "Gigabyte", icon: "🦅", desc: "AORUS lineup with high PCIe lane counts" },
      { name: "ASRock", icon: "⚙️", desc: "Taichi and Steel Legend feature-rich value boards" }
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
    matcherRows: [
      { id: 1, tier: "Gaming Sweet Spot", model: "Corsair Vengeance 32GB", socket: "DDR5-6000 CL30", targetSocket: "DDR5-6000 CL30" },
      { id: 2, tier: "High-End Creator", model: "G.Skill Trident Z5 64GB", socket: "DDR5-6400 CL32", targetSocket: "DDR5-6400 CL32" },
      { id: 3, tier: "Budget DDR4", model: "Kingston Fury 16GB", socket: "DDR4-3200 CL16", targetSocket: "DDR5-6000 CL30" },
      { id: 4, tier: "Esports Rig", model: "TeamGroup Delta 32GB", socket: "DDR5-5600 CL36", targetSocket: "DDR5-5600 CL36" }
    ],
    modelOptions: [
      { name: "Corsair Vengeance 32GB (2x16)", socket: "DDR5-6000 CL30" },
      { name: "G.Skill Trident Z5 32GB (2x16)", socket: "DDR5-6000 CL30" },
      { name: "G.Skill Trident Z5 64GB (2x32)", socket: "DDR5-6400 CL32" },
      { name: "Kingston Fury Beast 16GB (2x8)", socket: "DDR4-3200 CL16" },
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
      { name: "Corsair", icon: "⛵", desc: "Vengeance & Dominator Titanium RGB series" },
      { name: "G.Skill", icon: "⚡", desc: "Trident Z5 low-latency Hynix A-die overclocking RAM" },
      { name: "Kingston", icon: "👑", desc: "Fury Beast & Renegade highly compatible kits" },
      { name: "Crucial", icon: "🔬", desc: "Micron-backed Pro series with rock-solid JEDEC stability" }
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
    matcherRows: [
      { id: 1, tier: "1440p Sweet Spot", model: "RTX 4070 Super 12GB", socket: "750W PSU", targetSocket: "750W PSU" },
      { id: 2, tier: "4K Enthusiast", model: "RTX 4080 Super 16GB", socket: "850W PSU", targetSocket: "850W PSU" },
      { id: 3, tier: "Workstation AI", model: "RTX 4090 24GB", socket: "1000W PSU", targetSocket: "750W PSU" },
      { id: 4, tier: "Budget Esports", model: "RX 7600 8GB", socket: "550W PSU", targetSocket: "550W PSU" }
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
      { name: "NVIDIA", icon: "🟢", desc: "GeForce RTX series with DLSS 3.5 and Ray Tracing" },
      { name: "AMD", icon: "🔴", desc: "Radeon RX graphics with generous VRAM buffers" },
      { name: "Intel", icon: "🔵", desc: "Arc discrete graphics featuring dual AV1 video encoders" },
      { name: "ASUS ROG", icon: "⚡", desc: "Strix and TUF custom board-partner cooling designs" }
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
    matcherRows: [
      { id: 1, tier: "Mid-Range Gaming", model: "Corsair RM750e 750W", socket: "ATX 3.0 Gold", targetSocket: "ATX 3.0 Gold" },
      { id: 2, tier: "High-End Flagship", model: "Seasonic Vertex 1000W", socket: "ATX 3.0 Plat", targetSocket: "ATX 3.0 Plat" },
      { id: 3, tier: "Budget Builder", model: "be quiet! Pure Power 650W", socket: "ATX 3.0 Bronze", targetSocket: "ATX 3.0 Gold" },
      { id: 4, tier: "SFF Compact", model: "Corsair SF750 SFX", socket: "SFX Platinum", targetSocket: "SFX Platinum" }
    ],
    modelOptions: [
      { name: "Corsair RM750e 750W Gold", socket: "ATX 3.0 Gold" },
      { name: "Corsair RM850x 850W Gold", socket: "ATX 3.0 Gold" },
      { name: "Seasonic Vertex GX-1000W", socket: "ATX 3.0 Plat" },
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
      { name: "Seasonic", icon: "⚡", desc: "Industry benchmark OEM with 10-12 year manufacturer warranties" },
      { name: "Corsair", icon: "⛵", desc: "RMx and SF series with silent zero-RPM magnetic levitation fans" },
      { name: "be quiet!", icon: "🔇", desc: "Dark Power and Pure Power featuring acoustic silence" },
      { name: "EVGA", icon: "🔋", desc: "SuperNOVA line known for rock-solid stability and customer service" }
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
    matcherRows: [
      { id: 1, tier: "High Airflow Mesh", model: "Fractal Meshify 2", socket: "ATX Mid-Tower", targetSocket: "ATX Mid-Tower" },
      { id: 2, tier: "Aquarium Showcase", model: "NZXT H9 Flow", socket: "Dual-Chamber", targetSocket: "Dual-Chamber" },
      { id: 3, tier: "Compact SFF", model: "Fractal Terra", socket: "Mini-ITX", targetSocket: "ATX Mid-Tower" },
      { id: 4, tier: "Budget Airflow", model: "Montech Air 903 MAX", socket: "ATX Mid-Tower", targetSocket: "ATX Mid-Tower" }
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
      { name: "Fractal Design", icon: "🌲", desc: "Scandinavian aesthetic, real wood accents, and benchmark airflow" },
      { name: "NZXT", icon: "⬛", desc: "Clean minimalist design, cable management bar, and tempered glass" },
      { name: "Lian Li", icon: "✨", desc: "Dual-chamber aquarium chassis (O11 series) and premium aluminum" },
      { name: "Corsair", icon: "⛵", desc: "4000D / 5000D airflow series with RapidRoute cable channels" }
    ]
  }
];

export default function Learn() {
  return <CourseShell componentGuide={componentGuide} />;
}
