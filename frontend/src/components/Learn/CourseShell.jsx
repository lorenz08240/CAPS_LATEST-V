import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useBuild } from "../../contexts/BuildContext";
import CourseVideoPlayer from "./CourseVideoPlayer";
import soundManager from "../../utilities/soundManager";
import "./CourseShell.css";

/* ═══════════════════════════════════════════════════════════════════
   BUILDLAB QUICK COURSE — "Build Your Own PC"
   Curriculum inspired by Udemy's "Building a PC from Scratch:
   Beginner to Master" and W3Schools' "Computer Fundamentals /
   Components of a Computer", compressed into a quick course of
   4 modules and 12 lessons with progress tracking.

   Lesson types:
   • article   — written micro-lesson (objectives, sections, table, quiz)
   • component — full BuildLab hardware deep-dive (componentGuide entry)
   ═══════════════════════════════════════════════════════════════════ */

const PROGRESS_KEY = "buildlab.learn.progress.v1";

const readProgress = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "[]");
    return Array.isArray(raw) ? raw.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
};

/* ─────────────────────── ARTICLE LESSON CONTENT ─────────────────────── */

const ARTICLE_LESSONS = {
  "components-of-a-computer": {
    title: "Components of a Computer",
    minutes: 10,
    tags: ["Computer Fundamentals", "Beginner"],
    heroImage: "/textures/motherboard2.jpg",
    youtubeId: "ExxFxD4OSZ0",
    description:
      "Everything from an office PC to a flagship gaming rig is built from the same handful of systems. Learn what each part does before you spend a single peso on it.",
    objectives: [
      "Name the four core components found in every computer",
      "Tell the difference between memory (RAM) and storage",
      "Follow the input, processing, output data flow",
    ],
    sections: [
      {
        heading: "Input, Processing, Output",
        body: [
          "A computer is, at its simplest, a machine that takes input, processes it, and produces output. Your keyboard and mouse are the input, the processor turns data into results with help from memory, and the monitor and speakers deliver the output.",
          "The magic is speed: a modern CPU runs this loop billions of times per second. Your part choices simply determine how fast and how smoothly that loop runs.",
        ],
      },
      {
        heading: "The Core Four",
        items: [
          "Processor (CPU) - the brain. Executes every instruction, from opening an app to drawing a frame.",
          "Memory (RAM) - the workbench. Holds the apps, textures, and data the CPU is using right now. Cleared on shutdown.",
          "Storage (SSD / HDD) - the filing cabinet. Keeps your OS, games, and documents permanently, even with power off.",
          "Motherboard - the nervous system. Connects everything, feeds it power, and moves data between parts.",
        ],
      },
      {
        heading: "The Supporting Cast",
        items: [
          "Power supply (PSU) - converts wall AC into clean, stable DC rails your parts can survive.",
          "Graphics card (GPU) - the visuals engine that renders every pixel you see.",
          "Case & cooling - protects the parts and keeps heat moving out.",
          "Peripherals - monitor, keyboard, mouse, headset: the human interface.",
        ],
      },
      {
        heading: "Analogies That Stick",
        note: "Workshop analogy: the CPU is the worker, RAM is the workbench (a bigger workbench means more projects open at once, NOT faster hands), storage is the warehouse, and the motherboard is the building wiring. Many people believe more RAM makes a PC faster - it does not; it lets you run more at once.",
      },
    ],
    table: {
      columns: ["Component", "Job in one line", "Think of it as"],
      rows: [
        ["CPU", "Executes instructions and calculations", "The brain"],
        ["RAM", "Temporary workspace for running apps", "The workbench"],
        ["SSD / HDD", "Permanent file storage", "The warehouse"],
        ["Motherboard", "Connects and powers every part", "The nervous system"],
        ["GPU", "Renders graphics to the display", "The visual engine"],
        ["PSU", "Supplies clean, stable power", "The heart"],
      ],
    },
    quiz: [
      {
        question: "Which component keeps files permanently, even when the PC is off?",
        options: [
          { text: "Storage (SSD / HDD)", correct: true },
          { text: "RAM", correct: false },
          { text: "CPU", correct: false },
          { text: "Cooling fans", correct: false },
        ],
        explanation:
          "RAM is volatile memory - it clears on shutdown. Only storage keeps data permanently.",
      },
      {
        question: "Which part connects every other part and distributes power?",
        options: [
          { text: "Motherboard", correct: true },
          { text: "Graphics card", correct: false },
          { text: "Power supply", correct: false },
          { text: "Monitor", correct: false },
        ],
        explanation:
          "The motherboard is the central hub: both data and power travel through it.",
      },
      {
        question: "What is the primary role of the CPU in a computer?",
        options: [
          { text: "Executing program instructions, calculations, and coordinating operations as the central brain", correct: true },
          { text: "Storing permanent files and operating system installations", correct: false },
          { text: "Providing power directly from the wall outlet to all fans", correct: false },
          { text: "Cooling the graphics card memory chips", correct: false },
        ],
        explanation:
          "The Central Processing Unit (CPU) is the brain that executes calculations and directs data between memory, storage, and graphics.",
      },
    ],
  },

  "how-parts-talk": {
    title: "How the Parts Talk: Buses & Standards",
    minutes: 8,
    tags: ["Standards", "Ports"],
    heroImage: "/assets/cpu_learn.jpg",
    youtubeId: "PrXwe21biJo",
    description:
      "Cables and ports follow global standards. Learn the big ones - and why mixing generations bends pins.",
    objectives: [
      "Recognize the main internal ports and cables",
      "Understand why part generations must match",
      "Decode names like AM5, DDR5, and PCIe 5.0",
    ],
    sections: [
      {
        heading: "Data Highways Called Buses",
        body: [
          "Inside the case, data moves along buses - shared highways with fixed widths and speeds. PCIe lanes feed the GPU and SSDs, memory channels feed the CPU, and SATA feeds older drives.",
          "The wider and faster the bus, the more data moves per second. That is why a PCIe 5.0 x16 GPU slot offers many times the bandwidth of a single SATA cable.",
        ],
      },
      {
        heading: "Generations Are Not Mix-and-Match",
        body: [
          "Most plugs are physically keyed to one generation. DDR5 has its notch in a different spot than DDR4, and AM5 lines up differently from AM4. A component only counts as compatible when the fit is mechanical, electrical, and version-matched at the same time.",
          "Rule of thumb: if it needs force to seat, STOP. The only normal click of force in a build is RAM locking into its slot.",
        ],
      },
    ],
    table: {
      columns: ["Standard", "Connects", "What to remember"],
      rows: [
        ["ATX 24-pin", "Motherboard power", "Main power from the PSU - the latch clicks shut"],
        ["EPS 8-pin", "CPU power", "A separate 12V feed near the top of the board"],
        ["PCIe x16", "GPU", "Open the plastic latch before removal"],
        ["DIMM DDR4 / DDR5", "RAM", "The notch must match the slot - never force it"],
        ["M.2 NVMe / SATA", "Storage", "M.2 plugs flat at a slight angle, then screws down"],
        ["USB-C / audio", "Case front panel", "Fine headers - plug them in one at a time"],
      ],
    },
    quiz: [
      {
        question: "You have DDR4 sticks and a DDR5 motherboard. What happens?",
        options: [
          {
            text: "The notch offset means it will not seat - forcing it damages the module and board",
            correct: true,
          },
          { text: "It works, but RAM speed drops by 10%", correct: false },
          { text: "Slower DDR4 works fine in DDR5 slots", correct: false },
          { text: "It is fine with a cheap adapter", correct: false },
        ],
        explanation:
          "Memory generations are keyed differently and are electrically incompatible. Adapters do not exist for good reason.",
      },
      {
        question: "What is the primary function of PCIe lanes on a modern motherboard?",
        options: [
          {
            text: "High-speed direct data pipelines connecting the GPU and rapid NVMe SSDs directly to the CPU",
            correct: true,
          },
          { text: "Supplying 240V alternating current directly to the chassis", correct: false },
          { text: "Spinning case cooling fans at constant speeds", correct: false },
          { text: "Transmitting analog radio signals to wireless peripherals", correct: false },
        ],
        explanation:
          "PCIe lanes are high-bandwidth serial communication buses feeding huge streams of data to the graphics card and NVMe storage.",
      },
      {
        question: "How does an M.2 NVMe SSD connect compared to an older 2.5-inch SATA SSD?",
        options: [
          {
            text: "It plugs directly into an onboard slot flat against the motherboard with zero cables",
            correct: true,
          },
          { text: "It requires a 24-pin ATX power harness from the power supply", correct: false },
          { text: "It connects exclusively via an external USB-C port", correct: false },
          { text: "It must be mounted inside the power supply shroud", correct: false },
        ],
        explanation:
          "M.2 NVMe SSDs slot straight into motherboard sockets at a slight angle and screw down flat, requiring neither SATA data cables nor power leads.",
      },
    ],
  },

  "purpose-and-budget": {
    title: "Purpose, Use Case & Budget",
    minutes: 12,
    tags: ["Planning", "Budget"],
    heroImage: "/assets/pc_build.png",
    youtubeId: "x7tAAr2fcMw",
    description:
      "Professional builders choose parts backwards: use case first, budget split second, brand last.",
    objectives: [
      "Choose a build tier based on what the PC is for",
      "Split a budget by performance impact, not brand loyalty",
      "Gather the tools before parts arrive",
    ],
    sections: [
      {
        heading: "Start with the Job, Not the Parts",
        body: [
          "There is no single 'best computer'. A competitive shooter PC wants high frame rates at 1080p, a video editor wants CPU cores and RAM, and a study PC mostly wants a fast SSD. Write down your main use case and a rough budget before window-shopping for parts.",
          "Single duty list: Gaming leans on the GPU. Streaming and editing lean on CPU cores and RAM. Everyday use just needs a decent CPU and drive.",
        ],
      },
      {
        heading: "Where the Money Should Go",
        body: [
          "Ratios matter more than totals. In a gaming build the GPU usually takes the biggest slice, streaming and creation shift weight toward the CPU and RAM, and every build deserves an honest PSU budget - it protects everything else you bought.",
        ],
      },
    ],
    table: {
      columns: ["Build tier", "Best for", "Where the budget goes"],
      rows: [
        ["Everyday / Study", "Browsing, office, media", "CPU with built-in graphics + 16GB RAM"],
        ["1080p Esports", "Valorant, CS2, Dota at high FPS", "Balanced CPU + entry GPU, 16GB RAM"],
        ["1440p Gaming", "Modern AAA titles, high settings", "GPU takes 45-50% of the budget"],
        ["Streaming & Creation", "OBS, video editing, renders", "CPU + RAM take 40-50% combined"],
        ["4K Enthusiast", "Max settings, ray tracing", "GPU 50%+ plus a 850W+ quality PSU"],
      ],
    },
    sections2: null,
    toolsHead: "Tools on the Bench",
    tools: [
      { text: "#2 Phillips screwdriver", sub: "It drives 90% of the entire build" },
      { text: "Clean, dry, non-carpet work surface", sub: "Carpet breeds static; stage parts with room to breathe" },
      { text: "Touch bare case metal now and then", sub: "Discharges static from your body before handling parts" },
      { text: "Velcro strips or zip ties", sub: "For the rear-chamber cable passes" },
      { text: "Good lighting", sub: "Standoffs and latches are easy to miss in shadow" },
    ],
    quiz: [
      {
        question: "In a dedicated 1440p gaming build, which component should take the largest portion of your budget?",
        options: [
          { text: "The Graphics Card (GPU) — typically 45% to 50% of the build cost", correct: true },
          { text: "The PC Case and RGB lighting", correct: false },
          { text: "Custom sleeved power supply cables", correct: false },
          { text: "A secondary PCIe sound card", correct: false },
        ],
        explanation:
          "In modern 1440p and 4K gaming, the graphics card has the greatest impact on frame rates, visual fidelity, and shader rendering.",
      },
      {
        question: "Why should you avoid cutting your budget on a low-quality, uncertified power supply (PSU)?",
        options: [
          {
            text: "A cheap PSU lacks essential circuit protections and can destroy all connected parts if it fails",
            correct: true,
          },
          { text: "It locks your monitor refresh rate to 30Hz", correct: false },
          { text: "Windows will refuse to boot from your SSD", correct: false },
          { text: "Your keyboard and mouse RGB will stop syncing", correct: false },
        ],
        explanation:
          "The PSU supplies electricity to everything. Poor-quality units without over-voltage and short-circuit protections risk catastrophic hardware damage.",
      },
      {
        question: "What is the single essential tool required to assemble over 90% of a custom PC?",
        options: [
          { text: "A standard #2 Phillips screwdriver (preferably magnetic)", correct: true },
          { text: "A soldering iron and wire cutter", correct: false },
          { text: "An electric hammer drill", correct: false },
          { text: "Heavy duty pliers", correct: false },
        ],
        explanation:
          "Almost every PC fastener — case screws, motherboard standoffs, cooler brackets, and expansion slots — uses a standard #2 Phillips head.",
      },
    ],
  },

  "compatibility-chain": {
    title: "The Compatibility Chain",
    minutes: 9,
    tags: ["Planning", "Checklist"],
    heroImage: "/textures/case1.png",
    youtubeId: "IhX0fOUYd8Q",
    description:
      "The biggest beginner mistake is buying one wrong generation. Run this five-point chain before you check out.",
    objectives: [
      "Run the five compatibility checks in order",
      "Understand why each choice narrows the next one",
      "Spot the classic mismatch symptoms",
    ],
    sections: [
      {
        heading: "Five Checks Before Checkout",
        steps: [
          { text: "CPU socket <-> motherboard socket", sub: "AM5, LGA1700, LGA1851 - they must be identical" },
          { text: "RAM generation <-> motherboard slots", sub: "DDR4 or DDR5, decided by the board you picked" },
          { text: "Motherboard size <-> case", sub: "ITX, mATX, ATX, E-ATX mounting points" },
          { text: "GPU length & power <-> case + PSU", sub: "Clearance in mm, and watts with 100-150W headroom" },
          { text: "Cooler height <-> case clearance", sub: "Tall air coolers clash with side panels" },
        ],
      },
      {
        heading: "Why the Chain Breaks",
        body: [
          "These checks run in order because each choice narrows the next: your CPU socket decides which boards are possible, the board decides the RAM generation, board and GPU decide the case size, and the total power draw decides the PSU.",
          "BuildLab's Component Picker runs all five checks automatically as you add parts - this checklist mirrors exactly what it verifies.",
        ],
      },
    ],
    table: {
      columns: ["Classic mismatch", "What actually happens"],
      rows: [
        ["AM5 CPU on an LGA1700 board", "Does not fit - different pin layout"],
        ["mATX board in an ITX case", "Standoffs do not align - the board cannot mount"],
        ["340mm GPU in a compact case", "Hits the drive cage or front fans"],
        ["550W PSU with an RTX 4090-class card", "Protection trips - PC shuts off under load"],
        ["165mm cooler in a low-profile case", "Side panel will not close"],
      ],
    },
    quiz: [
      {
        question: "Which check should you complete FIRST when planning a build?",
        options: [
          {
            text: "CPU-to-motherboard socket - everything else flows from it",
            correct: true,
          },
          { text: "Equal RGB lighting across all parts", correct: false },
          { text: "Monitor refresh rate", correct: false },
          { text: "Case color and glass panels", correct: false },
        ],
        explanation:
          "The CPU socket is the root of the compatibility chain: it determines which boards, and through the boards, which RAM, cases, and coolers are possible.",
      },
      {
        question: "What happens if you purchase a full-size ATX motherboard for a compact Mini-ITX case?",
        options: [
          {
            text: "The board physically will not fit inside the case, and mounting standoffs will not align",
            correct: true,
          },
          { text: "It fits normally, but you can only install one stick of RAM", correct: false },
          { text: "The processor automatically runs at half its clock speed", correct: false },
          { text: "The power supply trips and shuts down on boot", correct: false },
        ],
        explanation:
          "Chassis form factor dictates maximum board size. A Mini-ITX case only accommodates 170x170mm boards, far smaller than a 305x244mm ATX board.",
      },
      {
        question: "Which measurement must be verified to ensure a large CPU air cooler fits inside your case?",
        options: [
          {
            text: "Cooler height clearance (mm) between the CPU socket and the case side panel",
            correct: true,
          },
          { text: "The diagonal width of the front tempered glass panel", correct: false },
          { text: "The thickness of the bottom dust filter", correct: false },
          { text: "The length of the power supply power cord", correct: false },
        ],
        explanation:
          "Tall twin-tower air coolers (often 155mm–165mm tall) will block the tempered glass side panel from closing if cooler height exceeds case clearance.",
      },
    ],
  },

  "full-build-order": {
    title: "Full Build Order (Assembly)",
    minutes: 14,
    tags: ["Assembly", "Checklist"],
    heroImage: "/assets/pc_build.png",
    youtubeId: "BL4DCEp7blY",
    description:
      "The professional assembly order. Your hands stay empty of force for the whole build - except one confident RAM click.",
    objectives: [
      "Follow a safe 12-step assembly order",
      "Know the two places beginners destroy parts",
      "Practice the order before touching real hardware",
    ],
    sections: [
      {
        heading: "The 12-Step Order",
        steps: [
          { text: "Prep the case", sub: "Both panels off, standoffs matching your board layout, screw tray ready" },
          { text: "CPU into the open motherboard", sub: "Golden triangle aligned to the socket marker, drop in with zero force, lock the lever" },
          { text: "Install the M.2 SSD", sub: "Insert at a slight angle, press flat, fasten the screw" },
          { text: "RAM into slots 2 & 4", sub: "Push down on BOTH ends until both clips click - the one place force is normal" },
          { text: "Mount the cooler", sub: "Pea-sized thermal paste, screws tightened in an X pattern" },
          { text: "I/O shield + motherboard into the case", sub: "Align rear ports, seat over standoffs, screw gently" },
          { text: "PSU in", sub: "Fan facing the bottom dust filter; plug the 24-pin and EPS as you go" },
          { text: "GPU into the top x16 slot", sub: "Latch clicks over the card, screw the bracket, add anti-sag support for heavy cards" },
          { text: "Front panel headers", sub: "Power switch, USB-C, audio - one connector at a time" },
          { text: "Fans & RGB headers", sub: "Intake at the front, exhaust at rear and top" },
          { text: "Cable management pass", sub: "Tie down the rear chamber; never block the fan tunnels" },
          { text: "First boot", sub: "Monitor into the GPU, then press power" },
        ],
      },
      {
        heading: "The Two Catastrophes",
        note: "1) Never power a system without the cooler fully seated - a bare CPU hits 100 degrees Celsius in seconds. 2) Never mix modular cables between PSU brands or models - reversed polarity fries drives and boards instantly.",
      },
      {
        heading: "Practice It in 3D",
        body: [
          "BuildLab's 3D Studio walks this exact order with install, remove, and disassembly modes. Repeat the sequence there until it is muscle memory before you touch real hardware.",
        ],
      },
    ],
    quiz: [
      {
        question: "Why should you install the CPU, SSD, and RAM onto the motherboard before mounting it in the case?",
        options: [
          {
            text: "It gives you open, unobstructed access on a flat desk before working inside cramped case walls",
            correct: true,
          },
          { text: "Motherboards cannot detect processors if mounted inside the case first", correct: false },
          { text: "Thermal paste will dry out if the board is mounted inside early", correct: false },
          { text: "Case screws block the CPU socket retention lever from lifting", correct: false },
        ],
        explanation:
          "Pre-assembling core components on top of the motherboard box gives your hands full clearance and optimal lighting to install delicate parts safely.",
      },
      {
        question: "How much downward force is needed when placing a CPU into an LGA or AM5 socket?",
        options: [
          {
            text: "Zero insertion force (ZIF) — let it rest completely flush under its own weight after aligning markers",
            correct: true,
          },
          { text: "15 to 20 pounds of firm pressure to push the pins in", correct: false },
          { text: "Tap it gently with a small rubber mallet", correct: false },
          { text: "Slide it horizontally from the side of the bracket", correct: false },
        ],
        explanation:
          "CPUs drop in under gravity with Zero Insertion Force. Any manual pushing bends socket pins and destroys the motherboard.",
      },
      {
        question: "Where should the monitor display cable be connected on a PC with a dedicated graphics card?",
        options: [
          {
            text: "Directly into one of the horizontal DisplayPort or HDMI ports on the dedicated GPU bracket",
            correct: true,
          },
          { text: "Into the vertical HDMI port on the motherboard rear I/O panel", correct: false },
          { text: "Into the USB-C port on top of the case front panel", correct: false },
          { text: "Into the power supply rear pass-through", correct: false },
        ],
        explanation:
          "Plugging the display cable into the motherboard bypasses your dedicated graphics card entirely, causing a black screen on CPUs without integrated graphics.",
      },
    ],
  },

  "first-boot": {
    title: "First Boot & Troubleshooting",
    minutes: 10,
    tags: ["POST", "BIOS", "Troubleshooting"],
    heroImage: "/textures/core-i7_01.jpg",
    youtubeId: "XzgPUozaiKU",
    description:
      "Assembled? Time for the POST - the first power-up of a brand-new PC. Here is the boot routine plus an escape plan for the usual suspects.",
    objectives: [
      "Run the 90-second pre-flight check",
      "Configure XMP / EXPO and boot order in BIOS",
      "Diagnose the most common first-boot failures",
    ],
    sections: [
      {
        heading: "The 90-Second Pre-Flight",
        steps: [
          { text: "PSU rear switch ON", sub: "The small rocker at the back of the power supply" },
          { text: "Monitor cable into the GPU", sub: "NOT the motherboard's ports - the classic first-build mistake" },
          { text: "Keyboard and mouse plugged in", sub: "Directly into the motherboard or case ports" },
          { text: "Power path verified", sub: "Power button reachable, wall socket and surge strip live" },
        ],
      },
      {
        heading: "POST & BIOS: Three Quick Settings",
        body: [
          "On power-up the machine runs a POST (Power-On Self-Test). If it passes, press DEL or F2 to enter BIOS and set three things before installing Windows:",
        ],
        items: [
          "Enable XMP (Intel) or EXPO (AMD) so the RAM runs at the speed you actually paid for - the default is a conservative baseline",
          "Set fan curves so the system stays quiet at idle",
          "Confirm boot priority points at your Windows install USB",
        ],
      },
      {
        heading: "When Nothing Happens",
        table: {
          columns: ["Symptom", "First suspect", "The fix"],
          rows: [
            ["No lights, no fans", "Power path", "PSU switch, wall outlet, 24-pin and EPS fully latched, front-panel power header on the correct pins"],
            ["Fans spin, screen stays black", "Display path", "Cable into the GPU port, reseat RAM in slots 2 & 4, reseat the GPU"],
            ["Beeps or error LEDs (DRAM, VGA, BOOT)", "Named subsystem", "Follow the manual's LED legend - DRAM means reseat RAM, VGA means reseat GPU"],
            ["Shuts off under heavy load", "Power or heat", "PSU capacity, 12V-2x6 seated flush, cooler mounting pressure"],
            ["Windows cannot see the M.2 SSD", "Storage", "Enable the M.2 slot, or load NVMe drivers on older boards"],
          ],
        },
      },
      {
        heading: "After the Boot",
        items: [
          "Install Windows, then chipset and GPU drivers (NVIDIA App / AMD Adrenalin)",
          "Update the OS and let Windows Update fetch remaining drivers",
          "Monitor temperatures with HWiNFO or MSI Afterburner during a game or stress test",
          "Your build is complete - jump back to the Compatibility page any time you upgrade",
        ],
      },
    ],
    quiz: [
      {
        question:
          "The most common cause of 'fans spin but black screen' right after a first build?",
        options: [
          {
            text: "Display cable plugged into the motherboard instead of the GPU",
            correct: true,
          },
          { text: "Too much RAM installed", correct: false },
          { text: "Missing thermal paste on the SSD", correct: false },
          { text: "Case RGB cable unplugged", correct: false },
        ],
        explanation:
          "Unless the CPU has integrated graphics and you deliberately choose the iGPU output, video only comes from the discrete graphics card.",
      },
      {
        question: "Which keyboard key is most commonly pressed repeatedly during power-on to enter UEFI BIOS?",
        options: [
          { text: "DEL (Delete) or F2 key", correct: true },
          { text: "Spacebar or Enter key", correct: false },
          { text: "Shift + Backspace", correct: false },
          { text: "Caps Lock", correct: false },
        ],
        explanation:
          "During POST (Power-On Self-Test), repeatedly tapping DEL or F2 triggers the motherboard firmware to enter the UEFI BIOS setup menu.",
      },
      {
        question: "What is the first performance setting to enable in BIOS before installing your operating system?",
        options: [
          { text: "Enable XMP (Intel) or EXPO (AMD) to run RAM at full rated speeds", correct: true },
          { text: "Disable all case cooling fans for zero noise", correct: false },
          { text: "Delete the BIOS firmware partition", correct: false },
          { text: "Set CPU voltage to maximum override limit", correct: false },
        ],
        explanation:
          "Enabling XMP or EXPO applies the manufacturer-tested memory profile, ensuring RAM runs at its advertised speed (e.g. 6000 MT/s) rather than safe default baseline.",
      },
    ],
  },
};

/* ─────────────────────── COURSE STRUCTURE ─────────────────────── */

const COURSE = [
  {
    id: "m1",
    label: "Module 1",
    title: "Computer Fundamentals",
    lessons: [
      { type: "article", ref: "components-of-a-computer", minutes: 10 },
      { type: "article", ref: "how-parts-talk", minutes: 8 },
    ],
  },
  {
    id: "m2",
    label: "Module 2",
    title: "Planning Your Build",
    lessons: [
      { type: "article", ref: "purpose-and-budget", minutes: 12 },
      { type: "article", ref: "compatibility-chain", minutes: 9 },
    ],
  },
  {
    id: "m3",
    label: "Module 3",
    title: "Component Deep Dives",
    lessons: [
      { type: "component", key: "cpu", minutes: 25 },
      { type: "component", key: "motherboard", minutes: 25 },
      { type: "component", key: "ram", minutes: 20 },
      { type: "component", key: "gpu", minutes: 22 },
      { type: "component", key: "psu", minutes: 18 },
      { type: "component", key: "case", minutes: 15 },
    ],
  },
  {
    id: "m4",
    label: "Module 4",
    title: "Assembly & First Boot",
    lessons: [
      { type: "article", ref: "full-build-order", minutes: 14 },
      { type: "article", ref: "first-boot", minutes: 10 },
    ],
  },
];

/* ═══════════════════════════ COMPONENT ═══════════════════════════ */

export default function CourseShell({ componentGuide }) {
  const navigate = useNavigate();
  const { addComponent } = useBuild();

  /* Course navigation */
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState(readProgress);

  /* Right Sidebar Pin & Hover states — mouse hover triggered by default (matching Left Sidebar) */
  const [isPinned, setIsPinned] = useState(() => {
    try {
      const saved = localStorage.getItem("buildlab.course.sidebar.pinned");
      if (saved !== null) return JSON.parse(saved);
      return false; // Default: unpinned and mouse-hover triggered!
    } catch {
      return false;
    }
  });
  const [isHovered, setIsHovered] = useState(false);
  const isVisible = isPinned || isHovered;

  useEffect(() => {
    try {
      localStorage.setItem("buildlab.course.sidebar.pinned", JSON.stringify(isPinned));
    } catch {}
  }, [isPinned]);

  /* Video prerequisite gating state */
  const [watchedVideos, setWatchedVideos] = useState(() => {
    try {
      const saved = localStorage.getItem("buildlab_watched_videos");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [videoToast, setVideoToast] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem("buildlab_watched_videos", JSON.stringify(watchedVideos));
    } catch {}
  }, [watchedVideos]);

  const toggleVideoWatched = (lessonId) => {
    soundManager.snap();
    setWatchedVideos((prev) =>
      prev.includes(lessonId) ? prev.filter((id) => id !== lessonId) : [...prev, lessonId]
    );
  };

  const markVideoWatched = (lessonId) => {
    soundManager.snap();
    setWatchedVideos((prev) => (prev.includes(lessonId) ? prev : [...prev, lessonId]));
  };

  /* Lesson-internal state (reset per lesson) */
  const [matcherRows, setMatcherRows] = useState(componentGuide[0].matcherRows);
  const [activeStep, setActiveStep] = useState(1);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [selectedMistake, setSelectedMistake] = useState(null);

  /* Flat lesson list: { id, type, moduleLabel, moduleTitle, minutes, lesson } */
  const FLAT = useMemo(
    () =>
      COURSE.flatMap((mod) =>
        mod.lessons.map((l) => {
          const comp =
            l.type === "component"
              ? componentGuide.find((c) => c.id === l.key)
              : null;
          const art = l.type === "article" ? ARTICLE_LESSONS[l.ref] : null;
          return {
            id: l.type === "component" ? l.key : l.ref,
            type: l.type,
            moduleLabel: mod.label,
            moduleTitle: mod.title,
            minutes: l.minutes,
            lesson: comp || art,
          };
        })
      ),
    [componentGuide]
  );

  const current = FLAT[currentIndex] || FLAT[0];
  const lesson = current.lesson;

  /* Persist progress */
  useEffect(() => {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(completed));
    } catch {
      /* private mode - ignore */
    }
  }, [completed]);

  /* Reset per-lesson state + scroll top on lesson change */
  useEffect(() => {
    if (current.type === "component") {
      setMatcherRows(lesson.matcherRows);
    }
    setActiveStep(1);
    setQuizIndex(0);
    setQuizAnswers({});
    setSelectedMistake(null);
    setVideoToast(null);
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current.id]);

  /* ── Helpers ── */

  const markComplete = (lessonId) => {
    soundManager.complete();
    setCompleted((prev) => (prev.includes(lessonId) ? prev : [...prev, lessonId]));
  };

  const goLesson = (idx) => {
    soundManager.click();
    setCurrentIndex(idx);
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 960px)").matches) {
      setOutlineOpen(false);
    }
  };

  const currentVideoId = lesson.youtubeId;
  const isVideoWatched = !currentVideoId || watchedVideos.includes(current.id);

  const handleNext = () => {
    if (currentVideoId && !isVideoWatched) {
      soundManager.warning();
      setVideoToast("⚠️ Video Requirement: You must watch the lesson video tutorial before proceeding! Click 'Mark as Watched' once viewed.");
      setTimeout(() => setVideoToast(null), 4500);
      return;
    }
    markComplete(current.id);
    if (currentIndex < FLAT.length - 1) {
      goLesson(currentIndex + 1);
    }
  };

  const handleMarkComplete = (lessonId) => {
    if (currentVideoId && !isVideoWatched) {
      soundManager.warning();
      setVideoToast("⚠️ Video Requirement: You must watch the lesson video before marking this lesson complete! Click 'Mark as Watched' once viewed.");
      setTimeout(() => setVideoToast(null), 4500);
      return;
    }
    markComplete(lessonId);
  };

  const firstIncomplete = FLAT.findIndex((l) => !completed.includes(l.id));
  const doneCount = completed.filter((id) => FLAT.some((l) => l.id === id)).length;
  const progressPct = Math.round((doneCount / FLAT.length) * 100);

  /* ── Matcher (component lessons) ── */

  const handleModelChange = (rowId, newModelName) => {
    const selected = lesson.modelOptions.find((c) => c.name === newModelName);
    if (!selected) return;
    setMatcherRows((prev) =>
      prev.map((row) =>
        row.id === rowId ? { ...row, model: newModelName, socket: selected.socket } : row
      )
    );
  };

  const handleSocketChange = (rowId, newSocket) => {
    setMatcherRows((prev) =>
      prev.map((row) =>
        row.id === rowId ? { ...row, targetSocket: newSocket } : row
      )
    );
  };

  const handleConnectToBuild = (modelName, socketName) => {
    soundManager.install();
    if (addComponent) {
      addComponent(lesson.id, {
        name: modelName || lesson.name,
        socket: socketName || "Standard",
        price: "$299",
      });
    }
    navigate("/build");
  };

  const currentQuiz = lesson.quiz ? lesson.quiz[quizIndex] || lesson.quiz[0] : null;

  /* ── Shared renderers ── */

  const renderQuiz = (quiz) => (
    <>
      <p className="quiz-prompt">{quiz[quizIndex].question}</p>

      <div className="quiz-options-vertical">
        {quiz[quizIndex].options.map((opt, i) => {
          const answered = quizAnswers[quizIndex];
          const isSelected = answered === i;
          const showResult = answered !== undefined;

          let optClass = "";
          if (showResult) {
            if (opt.correct) optClass = "opt-correct";
            else if (isSelected) optClass = "opt-wrong";
          }

          return (
            <button
              key={i}
              className={`quiz-choice-btn ${isSelected ? "selected" : ""} ${optClass}`}
              onClick={() => {
                setQuizAnswers((prev) => ({ ...prev, [quizIndex]: i }));
                if (opt.correct) {
                  soundManager.complete();
                } else {
                  soundManager.error();
                }
              }}
            >
              <span className="choice-bullet">{isSelected ? "●" : "○"}</span>
              <span className="choice-text">{opt.text}</span>
            </button>
          );
        })}
      </div>

      {quizAnswers[quizIndex] !== undefined && (
        <div className="quiz-feedback-box animate-fade-in">
          <strong>Takeaway:</strong> {quiz[quizIndex].explanation}
        </div>
      )}

      <div className="quiz-footer-actions">
        <span className="quiz-progress-text">
          Question {quizIndex + 1} of {quiz.length}
        </span>
        <button
          className="quiz-action-btn"
          onClick={() => {
            if (quizIndex < quiz.length - 1) {
              setQuizIndex((prev) => prev + 1);
            } else {
              setQuizIndex(0);
            }
          }}
        >
          {quizIndex < quiz.length - 1 ? "Next" : "Restart ↺"}
        </button>
      </div>
    </>
  );

  const renderTable = (table) => (
    <div className="lesson-table-wrap">
      <table className="matrix-table">
        <thead>
          <tr>
            {table.columns.map((col, i) => (
              <th key={i}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci}>{ci === 0 ? <strong>{cell}</strong> : cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderSteps = (steps) => (
    <div className="lesson-checklist">
      {steps.map((st, i) => (
        <div className="checklist-row" key={i}>
          <span className="checklist-n">{i + 1}</span>
          <div className="checklist-body">
            <strong>{st.text}</strong>
            {st.sub && <p>{st.sub}</p>}
          </div>
        </div>
      ))}
    </div>
  );

  const renderNote = (note) => (
    <div className="lesson-note">{note}</div>
  );

  /* ── ARTICLE lesson ── */

  const renderArticleLesson = (art) => (
    <>
      {/* Video Tutorial Player (HERO) & Architecture Blueprint (COMPANION) */}
      <div className="mockup-card article-media-card">
        <div className="article-media-grid">
          {/* Dominant Video Spotlight — First & Autoplaying */}
          <div className="article-video-col">
            <div className="lesson-video-topbar">
              <div className="video-gate-status">
                {watchedVideos.includes(current.id) ? (
                  <span className="video-gate-badge watched">
                    ✅ Video Watched &amp; Verified
                  </span>
                ) : (
                  <span className="video-gate-badge unwatched">
                    ⏳ Required Video — Watch to proceed
                  </span>
                )}
              </div>
              <button
                className={`video-mark-btn ${watchedVideos.includes(current.id) ? "is-marked" : ""}`}
                onClick={() => toggleVideoWatched(current.id)}
              >
                {watchedVideos.includes(current.id) ? "✓ Watched (Reset)" : "▶ Mark as Watched"}
              </button>
            </div>

            <div className="lesson-video-frame">
              {art.youtubeId ? (
                <CourseVideoPlayer
                  key={`artvideo-${art.youtubeId}`}
                  videoId={art.youtubeId}
                  title={`${art.title} Tutorial Video`}
                />
              ) : (
                <img src={art.heroImage} alt={art.title} className="lesson-video-fallback" />
              )}
            </div>

            <div className="lesson-video-bar">
              {art.youtubeId && (
                <a
                  href={`https://www.youtube.com/watch?v=${art.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="step-quick-youtube-link"
                  onClick={() => markVideoWatched(current.id)}
                >
                  ▶ Open on YouTube
                </a>
              )}
            </div>

            {!watchedVideos.includes(current.id) && (
              <div className="video-gate-notice">
                🔒 <strong>Prerequisite:</strong> Watch this video tutorial before continuing to the next topic.
              </div>
            )}
          </div>

          {/* Topic Blueprint Companion Card */}
          <div className="article-visual-col">
            <span className="media-section-subhead">Topic Architecture Blueprint</span>
            <div className="article-img-frame">
              <img
                src={art.heroImage}
                alt={art.title}
                className="article-hero-preview-img"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/assets/pc_build.png";
                }}
              />
              <div className="article-img-caption">
                <span className="article-img-title">{art.title}</span>
                <span className="article-img-sub">Hardware Schematic Reference</span>
              </div>
            </div>

            {art.objectives && (
              <div className="article-objectives-box">
                <span className="objectives-heading">Core Objectives</span>
                <ul className="objectives-list">
                  {art.objectives.map((obj, idx) => (
                    <li key={idx}><span className="obj-check">✓</span> {obj}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Objectives + optional table */}
      <div className="mockup-card article-objectives-card">
        <span className="know-part-subhead">What you'll learn</span>
        <ul className="lesson-objectives">
          {art.objectives.map((o, i) => (
            <li key={i}>{o}</li>
          ))}
        </ul>
        {art.tools && (
          <>
            <span className="know-part-subhead tools-subhead">{art.toolsHead}</span>
            {renderSteps(art.tools)}
          </>
        )}
        {art.table && renderTable(art.table)}
      </div>

      {/* Sections */}
      {art.sections.map((sec, si) => (
        <div className="mockup-card article-section-card" key={si}>
          <h4 className="article-section-heading">{sec.heading}</h4>
          {sec.body &&
            (Array.isArray(sec.body) ? sec.body : [sec.body]).map((p, i) => (
              <p className="lesson-para" key={i}>{p}</p>
            ))}
          {sec.items && (
            <ul className="lesson-list">
              {sec.items.map((it, i) => (
                <li key={i}>{it}</li>
              ))}
            </ul>
          )}
          {sec.steps && renderSteps(sec.steps)}
          {sec.note && renderNote(sec.note)}
          {sec.table && renderTable(sec.table)}
        </div>
      ))}

      {/* Article quiz */}
      {art.quiz && (
        <div className="mockup-card quiz-card">
          <div className="mockup-card-header">
            <h3 className="mockup-card-title">Knowledge Check</h3>
          </div>
          <div className="quiz-card-body">{renderQuiz(art.quiz)}</div>
        </div>
      )}
    </>
  );

  /* ── COMPONENT lesson (merged deep-dive cards) ── */

  const renderComponentLesson = (comp) => (
    <>
      {/* 1. REQUIRED VIDEO PLAYER (HERO) & HARDWARE SPECIMEN (COMPANION) */}
      <div className="mockup-card lesson-brief-card">
        <div className="lesson-brief-grid">
          {/* Dominant Video Spotlight — First & Autoplaying */}
          <div className="lesson-video-col">
            <div className="lesson-video-topbar">
              <div className="video-gate-status">
                {watchedVideos.includes(comp.id) ? (
                  <span className="video-gate-badge watched">
                    ✅ Video Watched &amp; Verified
                  </span>
                ) : (
                  <span className="video-gate-badge unwatched">
                    ⏳ Required Video — Watch to proceed
                  </span>
                )}
              </div>
              <button
                className={`video-mark-btn ${watchedVideos.includes(comp.id) ? "is-marked" : ""}`}
                onClick={() => toggleVideoWatched(comp.id)}
                title={watchedVideos.includes(comp.id) ? "Click to reset watch state" : "Mark as completed"}
              >
                {watchedVideos.includes(comp.id) ? "✓ Watched (Reset)" : "▶ Mark as Watched"}
              </button>
            </div>

            <div className="lesson-video-frame">
              {comp.youtubeId ? (
                <CourseVideoPlayer
                  key={`lessonvideo-${comp.id}-${comp.youtubeId}`}
                  videoId={comp.youtubeId}
                  title={`${comp.name} Lesson Film`}
                />
              ) : (
                <img src={comp.heroImage} alt={comp.name} className="lesson-video-fallback" />
              )}
            </div>
            <div className="lesson-video-bar">
              <a
                href={`https://www.youtube.com/watch?v=${comp.youtubeId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="step-quick-youtube-link"
                onClick={() => markVideoWatched(comp.id)}
              >
                ▶ Watch Full Tutorial on YouTube
              </a>
            </div>

            {!watchedVideos.includes(comp.id) && (
              <div className="video-gate-notice">
                🔒 <strong>Prerequisite:</strong> Watch this instructional hardware video before moving to the next lesson or marking complete.
              </div>
            )}
          </div>

          <aside className="lesson-brief-side">
            {/* Hardware Part Image Inspection Specimen Card */}
            <div className="hardware-specimen-header">
              <div className="specimen-badge-row">
                <span className="specimen-badge-pill">🔍 Hardware Specimen</span>
                <span className="specimen-tier-pill">{comp.badge || "Verified Architecture"}</span>
              </div>
              <div className="specimen-image-container">
                <img
                  src={comp.heroImage}
                  alt={comp.name}
                  className="hardware-specimen-img"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/assets/cpu_learn.jpg";
                  }}
                />
                <div className="specimen-caption-overlay">
                  <span className="specimen-part-title">{comp.name}</span>
                  <span className="specimen-subtext">Original BuildLab Part Reference</span>
                </div>
              </div>
            </div>

            <div className="lesson-tags-row">
              {comp.tags.map((tag, idx) => (
                <span key={idx} className="badge-pill">{tag}</span>
              ))}
            </div>
            <p className="lesson-brief-text">{comp.description}</p>
            <div className="common-errors-alert compact-errors">
              <div className="errors-header-line">
                <span className="error-title-text">Common Errors</span>
                <span className="error-badge-pill">Danger</span>
              </div>
              <p className="error-body-text">{comp.commonErrors}</p>
            </div>
          </aside>
        </div>
      </div>

      {/* 2. KNOW YOUR PART — specs + naming decoder (merged) */}
      <div className="mockup-card know-part-card">
        <div className="mockup-card-header">
          <h3 className="mockup-card-title">Know Your Part</h3>
        </div>
        <div className="know-part-grid">
          <div className="know-specs">
            <span className="know-part-subhead">Key Specifications</span>
            <div className="specs-8grid know-specs-grid">
              {comp.specs.map((spec, idx) => (
                <div key={idx} className="spec-tile">
                  <span className="spec-tile-label">{spec.label}</span>
                  <span className="spec-tile-value">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="know-decoder">
            <span className="know-part-subhead">Naming &amp; Suffix Decoder</span>
            <div className="decoder-table-panel intel-table-panel">
              <div className={`decoder-panel-head ${comp.namingLeft.colorClass}`}>
                <span>{comp.namingLeft.title}</span>
              </div>
              <div className="decoder-rows-stack">
                {comp.namingLeft.rows.map((r, i) => (
                  <div key={i} className="decoder-spec-row">
                    <span className="d-label">{r.label}</span>
                    <span className="d-val">{r.val}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="decoder-table-panel amd-table-panel">
              <div className={`decoder-panel-head ${comp.namingRight.colorClass}`}>
                <span>{comp.namingRight.title}</span>
              </div>
              <div className="decoder-rows-stack">
                {comp.namingRight.rows.map((r, i) => (
                  <div key={i} className="decoder-spec-row">
                    <span className="d-label">{r.label}</span>
                    <span className="d-val">{r.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. TRY IT YOURSELF — compatibility matcher */}
      <div id="matcher-section" className="mockup-card try-it-yourself-card">
        <div className="mockup-card-header">
          <h3 className="mockup-card-title">Try It Yourself</h3>
          <span className="try-it-hint">Match the interface target to see a green check</span>
        </div>
        <div className="matcher-table-wrapper">
          <div className="matcher-table-head">
            <span className="col-head col-tier">Profile Tier</span>
            <span className="col-head col-model">Component Model</span>
            <span className="col-head col-socket">Interface / Socket Target</span>
            <span className="col-head col-status">Status &amp; Action</span>
          </div>
          <div className="matcher-table-rows">
            {matcherRows.map((row) => {
              const isMatch = row.socket === row.targetSocket;
              return (
                <div key={row.id} className={`matcher-row ${isMatch ? "match-ok" : "match-err"}`}>
                  <div className="col-cell col-tier">
                    <span className="tier-tag-text">{row.tier}</span>
                  </div>
                  <div className="col-cell col-model">
                    <select
                      className="mockup-select"
                      value={row.model}
                      onChange={(e) => handleModelChange(row.id, e.target.value)}
                    >
                      {comp.modelOptions.map((opt, i) => (
                        <option key={i} value={opt.name}>
                          {opt.name} ({opt.socket})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-cell col-socket">
                    <select
                      className="mockup-select"
                      value={row.targetSocket}
                      onChange={(e) => handleSocketChange(row.id, e.target.value)}
                    >
                      {comp.targetSockets.map((sock, i) => (
                        <option key={i} value={sock}>
                          {sock}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-cell col-status">
                    {isMatch ? (
                      <div className="status-cell-wrap">
                        <span className="match-badge-success">✓ Compatible</span>
                        <button
                          className="btn-cell-builder"
                          onClick={() => handleConnectToBuild(row.model, row.targetSocket)}
                        >
                          Load
                        </button>
                      </div>
                    ) : (
                      <div className="status-cell-wrap">
                        <span className="match-badge-error">✕ Incompatible</span>
                        <button
                          className="btn-cell-fix"
                          onClick={() => handleSocketChange(row.id, row.socket)}
                        >
                          Fix
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. BUILD IT STEP BY STEP — process list + BIG step video (video side dominant) */}
      <div className="mockup-card assembly-card">
        <div className="mockup-card-header">
          <h3 className="mockup-card-title">Build It: Step by Step</h3>
          <span className="try-it-hint">Click a step to sync the film</span>
        </div>
        <div className="installation-main-grid assembly-grid">
          <div className="installation-steps-stack">
            {comp.steps.map((item) => (
              <div
                key={item.step}
                className={`step-interactive-row ${activeStep === item.step ? "active-step" : ""}`}
                onClick={() => {
                  setActiveStep(item.step);
                }}
              >
                <div className="step-left-content">
                  <span className="step-tag-bold">Step {item.step}</span>
                  <p className="step-title-text">{item.title}</p>
                  <p className="step-desc-text">{item.desc}</p>
                </div>
                <div className="step-icon-graphic">
                  {item.step === 1 && "🖥️"}
                  {item.step === 2 && "📐"}
                  {item.step === 3 && "⚡"}
                  {item.step === 4 && "🔒"}
                  {item.step === 5 && "❄️"}
                </div>
              </div>
            ))}
          </div>

          <div className="installation-step-preview-container">
            <div className="step-preview-header">
              <span className="step-preview-badge">Step {activeStep} Demonstration</span>
            </div>
            <div className="step-preview-video-wrapper">
              {comp.youtubeId ? (
                <CourseVideoPlayer
                  key={`${comp.id}-stepfilm-${comp.youtubeId}`}
                  videoId={comp.youtubeId}
                  title={`${comp.name} Step ${activeStep} Demonstration`}
                  compact
                />
              ) : (
                <div className="step-preview-placeholder">
                  <img src={comp.heroImage} alt={comp.name} />
                </div>
              )}
            </div>
            <div className="step-preview-caption">
              <strong>{comp.steps.find((s) => s.step === activeStep)?.title}</strong>
              <p>{comp.steps.find((s) => s.step === activeStep)?.desc}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. KNOWLEDGE CHECK — quiz + mistakes (merged into one card) */}
      <div className="mockup-card knowledge-check-card">
        <div className="mockup-card-header">
          <h3 className="mockup-card-title">Knowledge Check</h3>
          {quizAnswers[quizIndex] !== undefined && comp.quiz[quizIndex] && (
            <span className={`quiz-verdict ${comp.quiz[quizIndex].options[quizAnswers[quizIndex]]?.correct ? "verdict-pass" : "verdict-fail"}`}>
              {comp.quiz[quizIndex].options[quizAnswers[quizIndex]]?.correct ? "✓ Correct" : "✕ Study & retry"}
            </span>
          )}
        </div>
        <div className="knowledge-check-grid">
          <div className="knowledge-quiz-side">
            {renderQuiz(comp.quiz)}
          </div>
          <div className="knowledge-mistakes-side">
            <span className="know-part-subhead mistakes-subhead">Common Mistakes to Avoid</span>
            <div className="mistakes-2x2-grid">
              {comp.mistakes.map((m, idx) => (
                <div
                  key={idx}
                  className="mistake-badge-btn"
                  onClick={() => setSelectedMistake(selectedMistake === m.name ? null : m.name)}
                >
                  <span className="m-icon">⚠️</span>
                  <span className="m-name">{m.name}</span>
                </div>
              ))}
            </div>
            {selectedMistake && (
              <div className="mistake-details-drawer animate-fade-in">
                {comp.mistakes.find((m) => m.name === selectedMistake)?.desc}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 6. RECOMMENDATION MATRIX + manufacturers (merged into one card) */}
      <div className="mockup-card matrix-card">
        <div className="mockup-card-header">
          <h3 className="mockup-card-title">{comp.name} Recommendation Matrix</h3>
          <a href="#matcher-section" className="view-specs-link">Try it yourself ↑</a>
        </div>
        <div className="matrix-table-responsive">
          <table className="matrix-table">
            <thead>
              <tr>
                <th>Build tier</th>
                <th>Recommended Hardware</th>
                <th>Interface / Target</th>
                <th>Target Spec</th>
                <th>Release / TDP</th>
              </tr>
            </thead>
            <tbody>
              {comp.matrix.map((row, idx) => (
                <tr key={idx} className={row.highlight ? "highlight-green-row" : ""}>
                  <td><span className="matrix-tier-name">{row.tier}</span></td>
                  <td><strong>{row.cpu}</strong></td>
                  <td>{row.socket}</td>
                  <td>{row.spec}</td>
                  <td>{row.tdp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="manufacturers-divider" />
        <span className="know-part-subhead">Popular Manufacturers</span>
        <div className="manufacturers-4col-grid">
          {comp.brands.map((brand, idx) => (
            <div key={idx} className="mfg-card-tile">
              <span className="mfg-logo-icon">{brand.icon}</span>
              <div className="mfg-text-wrap">
                <span className="mfg-title">{brand.name}</span>
                <span className="mfg-sub">{brand.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. ACTION BAR */}
      <div className="mockup-card action-bar-card">
        <div className="action-left-text">
          <h4 className="action-main-title">Ready to build your dream PC?</h4>
          <p className="action-sub-text">
            Put your hardware knowledge to work with real-time socket matching, power estimation, and 3D component fitting.
          </p>
        </div>
        <div className="action-right-buttons">
          <button
            className="btn-connect-build"
            onClick={() =>
              handleConnectToBuild(comp.matcherRows[0]?.model, comp.matcherRows[0]?.socket)
            }
          >
            ⚡ Connect to Build
          </button>
          <Link to="/brands" className="btn-add-charts">
            + Add Spec Charts
          </Link>
        </div>
      </div>
    </>
  );

  /* ── Scaffold ── */

  return (
    <div className="learn-page full-bleed-page course-shell-root">
      <div className="bg-glow bg-glow-1" aria-hidden="true" />
      <div className="bg-glow bg-glow-2" aria-hidden="true" />

      {/* Invisible Trigger Zone on right edge when unpinned */}
      {!isPinned && (
        <div 
          className="course-sidebar-trigger-zone" 
          onMouseEnter={() => setIsHovered(true)} 
          onClick={() => setIsHovered(true)}
          title="Hover to view Course Outline"
        />
      )}

      {/* Soft Backdrop Overlay (when hovered & unpinned) */}
      <div 
        className={`course-sidebar-backdrop ${isHovered && !isPinned ? "active" : ""}`} 
        onClick={() => setIsHovered(false)} 
      />

      <div className={`course-shell ${isPinned ? "right-pinned" : ""}`}>
        {/* ═══ MAIN LESSON COLUMN ═══ */}
        <div className="course-main">
          <div className="course-stream">
            {/* Lesson header strip (compact) */}
            <header
              className={`lesson-header ${current.type === "component" ? "has-hero" : ""}`}
              style={
                current.type === "component"
                  ? { backgroundImage: `url('${lesson.heroImage}')` }
                  : undefined
              }
            >
              <div className="lesson-header-overlay" />
              <div className="lesson-header-inner">
                <nav className="lesson-eyebrow" aria-label="Course breadcrumb">
                  <Link to="/learn" className="eyebrow-link">BuildLab</Link>
                  <span className="eyebrow-sep">›</span>
                  <span>Learn</span>
                  <span className="eyebrow-sep">›</span>
                  <span className="eyebrow-module">{current.moduleLabel} · {current.moduleTitle}</span>
                </nav>

                <h1 className="lesson-title">
                  {current.type === "component" ? lesson.name : lesson.title}
                </h1>

                <div className="lesson-meta-chips">
                  <span className="meta-chip minutes-chip">◷ {current.minutes} min</span>
                  {completed.includes(current.id) && (
                    <span className="meta-chip done-chip">✓ Completed</span>
                  )}
                  {(current.type === "article" ? lesson.tags : []).map((tag, i) => (
                    <span key={i} className="meta-chip">{tag}</span>
                  ))}
                </div>

                <p className="lesson-header-desc">{lesson.description}</p>
              </div>
            </header>

            {/* Lesson body */}
            <div className="course-lesson-body">
              {current.type === "component" ? renderComponentLesson(lesson) : renderArticleLesson(lesson)}
            </div>

            {/* Video gating toast reminder */}
            {videoToast && (
              <div className="video-toast-banner animate-fade-in">
                <span className="toast-icon">🔒</span>
                <span className="toast-text">{videoToast}</span>
                <button
                  className="video-toast-mark-btn"
                  onClick={() => {
                    markVideoWatched(current.id);
                    setVideoToast(null);
                  }}
                >
                  Mark as Watched Now
                </button>
              </div>
            )}

            {/* Lesson footer nav */}
            <div className="lesson-footer-nav">
              <button
                className="lesson-nav-btn prev"
                disabled={currentIndex === 0}
                onClick={() => goLesson(currentIndex - 1)}
              >
                ‹ Previous
              </button>

              {completed.includes(current.id) ? (
                <span className="lesson-done-note">✓ Lesson complete — nice work</span>
              ) : (
                <button
                  className={`lesson-mark-btn ${currentVideoId && !isVideoWatched ? "gated-btn" : ""}`}
                  onClick={() => handleMarkComplete(current.id)}
                  title={currentVideoId && !isVideoWatched ? "Watch video before marking complete" : "Mark lesson complete"}
                >
                  {currentVideoId && !isVideoWatched ? "🔒 Complete (Watch Video First)" : "✓ Mark complete"}
                </button>
              )}

              <button
                className={`lesson-nav-btn next ${currentVideoId && !isVideoWatched ? "gated-btn" : ""}`}
                onClick={handleNext}
                title={currentVideoId && !isVideoWatched ? "Watch video before proceeding to next lesson" : "Next lesson"}
              >
                {currentVideoId && !isVideoWatched
                  ? "🔒 Next lesson (Watch video first)"
                  : currentIndex === FLAT.length - 1
                  ? "Finish Course 🏁"
                  : "Next lesson ›"}
              </button>
            </div>
          </div>
        </div>

        {/* ═══ RIGHT COURSE OUTLINE (Matching Left Sidebar architecture & luxury wood theme) ═══ */}
        <aside 
          className={`course-outline wood-mahogany ${isVisible ? "open" : "closed"} ${isPinned ? "pinned" : ""}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          aria-label="Course Outline Sidebar"
        >
          {/* Subtle wood grain texture layer matching Left Sidebar */}
          <div className="sidebar-wood-overlay" aria-hidden="true" />

          {/* Indicator Pull-Tab when closed */}
          {!isVisible && (
            <div 
              className="course-sidebar-indicator"
              onClick={() => setIsHovered(true)}
              title="Open Course Outline"
            >
              <span className="indicator-arrow">‹</span>
            </div>
          )}

          <div className="course-sidebar-container">
            <div className="course-sidebar-header">
              <div className="sidebar-header-left">
                <span className="course-sidebar-eyebrow">QUICK COURSE</span>
                <h2 className="course-sidebar-title">BUILD YOUR OWN PC</h2>
              </div>
              <button 
                className={`sidebar-pin-btn ${isPinned ? 'active' : ''}`}
                onClick={() => setIsPinned(!isPinned)}
                title={isPinned ? "Unpin Course Sidebar" : "Pin Course Sidebar"}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill={isPinned ? "#d4a34b" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="17" x2="12" y2="22"></line>
                  <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path>
                </svg>
              </button>
            </div>

            {/* Progress Card */}
            <div className="course-sidebar-progress-card">
              <div className="outline-progress">
                <div className="outline-progress-fill" style={{ width: `${progressPct}%` }} />
              </div>
              <span className="outline-progress-text">
                {doneCount === FLAT.length
                  ? "🏆 Course complete — you're build-ready!"
                  : `${doneCount} of ${FLAT.length} lessons · ${progressPct}%`}
              </span>
            </div>

            <div className="outline-scroll">
              {COURSE.map((mod) => (
                <div className="outline-module-group" key={mod.id}>
                  <div className="outline-module-head">
                    <span className="outline-module-label">{mod.label}</span>
                    <span className="outline-module-title">{mod.title}</span>
                  </div>
                  {mod.lessons.map((l) => {
                    const flatIdx = FLAT.findIndex(
                      (f) =>
                        f.id === (l.type === "component" ? l.key : l.ref) &&
                        f.type === l.type
                    );
                    const isActive = flatIdx === currentIndex;
                    const isDone = completed.includes(l.type === "component" ? l.key : l.ref);
                    const lessonTitle =
                      l.type === "component"
                        ? componentGuide.find((c) => c.id === l.key)?.name
                        : ARTICLE_LESSONS[l.ref]?.title;
                    return (
                      <button
                        key={`${mod.id}-${l.type}-${l.key || l.ref}`}
                        className={`outline-lesson ${isActive ? "active" : ""} ${isDone ? "done" : ""}`}
                        onClick={() => goLesson(flatIdx)}
                      >
                        <span className={`lesson-dot ${isDone ? "dot-done" : ""} ${isActive ? "dot-now" : ""}`}>
                          {isDone ? "✓" : isActive ? "▶" : ""}
                        </span>
                        <span className="outline-lesson-name">{lessonTitle}</span>
                        <span className="outline-lesson-min">{l.minutes}m</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="course-sidebar-foot">
              {firstIncomplete >= 0 ? (
                <button
                  className="outline-continue-btn"
                  onClick={() => goLesson(firstIncomplete)}
                >
                  ▶ Continue: {FLAT[firstIncomplete].type === "article"
                    ? FLAT[firstIncomplete].lesson.title
                    : FLAT[firstIncomplete].lesson.name}
                </button>
              ) : (
                <button
                  className="outline-continue-btn done-btn"
                  onClick={() => navigate("/build")}
                >
                  ⚡ Start your first build
                </button>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
