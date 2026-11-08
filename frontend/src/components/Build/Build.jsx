import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { useBuild } from "../../contexts/BuildContext";
import { useLearnMode } from "../../contexts/LearnModeContext";
import { checkCompatibility } from "../../utilities/compatibilityEngine";
import soundManager from "../../utilities/soundManager";
import FullscreenGate from "../FullscreenGate/FullscreenGate";
import GlobalHeader from "../Navigation/GlobalHeader";
import EyeTracker from "../EyeTracker/EyeTracker";
import "./Build.css";

/* ══════════════════════════════════════════════════════════════
   B.O.B. CASUAL GUIDING TOUR & HIGHLIGHT WISDOM
   Tone: Playful, friendly, casual gamer buddy (like BobCompanion lines)
   ══════════════════════════════════════════════════════════════ */
const BOB_CASUAL_GUIDE = {
  case: {
    center: [
      "This is where you pick your PC case! Look for good airflow so your parts stay nice and cool.",
      "Check out these cases in the middle! Pick one that matches your style and has plenty of room.",
      "Right here's where you select your chassis! Mid-towers are great for easy cable routing.",
    ],
    left: [
      "Over here on the left is your build checklist! We're starting at Stage 1 with the case.",
      "That checklist on the left tracks all your parts! You can jump between stages anytime.",
      "Check out the left side panel — that's your 7-stage roadmap to a complete machine!",
    ],
    right: [
      "And over on the right, you'll see case dimensions and specs. Hit Mount when you're happy!",
      "Keep an eye on the right panel — it'll show form factor and glass panel specs before mounting.",
      "The right side gives you live telemetry! Once you like a case, click Mount Component to slot it in.",
    ],
    done: [
      "Alright, your turn! Click a case in the middle to check it out.",
      "Go ahead, tap any case to see how it looks!",
      "Take your time picking! Click one to see its full specs on the right.",
    ],
  },
  motherboard: {
    center: [
      "Here are your motherboards! Gotta make sure the socket matches your CPU.",
      "Pick your motherboard right here in the middle! This is the backbone that connects everything.",
      "Check out the motherboards! Look for DDR5 slots and plenty of M.2 ports for fast drives.",
    ],
    left: [
      "Over on the left, you can see Motherboard is Stage 2! The green check means your case is saved.",
      "Check the left panel! You can always tap Stage 1 if you want to swap cases.",
      "Stage 2 on the left checklist! We're building this beast step-by-step.",
    ],
    right: [
      "The right panel shows chipset, RAM slots, and port count. Click Mount to lock it in!",
      "Over on the right, verify your form factor and socket before hitting Mount Component!",
      "Check out the right side for board specs. When ready, click Mount to lock in your foundation!",
    ],
    done: [
      "Alright, pick a motherboard that fits your dream build!",
      "Tap a board in the middle to inspect its chipset!",
      "Click any motherboard to see its ports and features!",
    ],
  },
  cpu: {
    center: [
      "Here's the brain of your PC! Check clock speeds and core counts right in the middle.",
      "Processors in the center! Higher clock speed gives you crisp gaming frame rates.",
      "Pick your CPU right here! More cores means smooth streaming, multitasking, and editing.",
    ],
    left: [
      "Stage 3 on the left checklist! That's the CPU — heart and soul of the whole rig.",
      "Glance at the left panel! 2 stages done already, moving fast!",
      "Check the left side! Your Case and Motherboard are already locked down.",
    ],
    right: [
      "The right panel reveals socket fit, wattage, and clock speeds. Hit Mount to seat the chip!",
      "Check thermal TDP on the right so you know what cooling it needs, then hit Mount!",
      "Telemetry on the right confirms socket compatibility. Click Mount when you're set!",
    ],
    done: [
      "Pick your processor beast and let's install it!",
      "Go ahead, click a CPU to see what it's packing!",
      "Choose your processor and let's get it mounted!",
    ],
  },
  ram: {
    center: [
      "Memory options right here in the center! Grab a dual-channel kit for snappy multitasking.",
      "Here's where you pick your RAM! 16 gigs is solid, 32 gigs is super future-proof.",
      "RAM sticks in the middle! Look for fast MHz speeds and tight latency for gaming.",
    ],
    left: [
      "Stage 4 on the left! We're past the halfway mark now.",
      "Look at that left checklist! Each stage lights up green as we mount parts.",
      "Left panel tracks our memory slot! Remember, slots 2 and 4 are the magic combo.",
    ],
    right: [
      "Specs on the right show DDR type and speed rating. Hit Mount to snap the sticks in!",
      "Verify DDR4 vs DDR5 on the right panel so it matches your board, then hit Mount!",
      "Right side gives you full capacity and timings. Click Mount Component to lock 'em in!",
    ],
    done: [
      "Your turn! Pick your RAM kit and let's keep going!",
      "Click a RAM kit in the middle to inspect it!",
      "Pick your memory sticks and let's plug 'em in!",
    ],
  },
  storage: {
    center: [
      "Fast SSD drives right here in the middle! NVMe M.2 means zero boot delay.",
      "Pick your storage here! NVMe drives plug directly into the board without messy cables.",
      "Storage drives in the center! Grab a 1TB or 2TB drive so you never run out of game storage.",
    ],
    left: [
      "Stage 5 on the left panel! Core hardware is almost completely loaded up.",
      "Check the left list! Storage is stage 5, then just graphics and power left.",
      "Left checklist is looking great! Look at all those green completed stages.",
    ],
    right: [
      "The right side shows read/write speeds and interface type. Hit Mount to install the drive!",
      "Check capacity and PCIe gen on the right, then smash that Mount button!",
      "Right panel telemetry shows full storage specs. Click Mount Component when ready!",
    ],
    done: [
      "Pick your drive and let's slot it into the board!",
      "Tap an SSD drive to see its speed ratings!",
      "Choose your storage and let's install it!",
    ],
  },
  gpu: {
    center: [
      "Ooh, the graphics cards in the center! This is what turns your rig into a gaming monster.",
      "Here are your GPUs! Look at the VRAM so you can crank up textures and resolution.",
      "Pick your graphics card right here! Pick one that fits your monitor resolution and frame rate goals.",
    ],
    left: [
      "Stage 6 on the left! Penultimate stage — only power supply left after this!",
      "Check the left panel! You've built a nearly complete rig already.",
      "Stage 6 on the checklist! Don't forget your case has to have clearance for this card.",
    ],
    right: [
      "Right panel shows VRAM, power requirement, and card length. Hit Mount to slot it in!",
      "Check the power draw on the right — we'll need enough wattage in the next stage!",
      "Right side gives you GPU clock and dimensions. Click Mount Component to seat the card!",
    ],
    done: [
      "Pick your graphics card and let's unleash some frames!",
      "Tap a GPU in the middle to inspect its power draw and specs!",
      "Choose your graphics card beast!",
    ],
  },
  psu: {
    center: [
      "Power supplies right here! Make sure you get enough wattage headroom for peak power spikes.",
      "Pick your PSU in the middle! 80 Plus Gold keeps efficiency high and electric bills low.",
      "PSU options right here! Modular cables mean you only plug in the wires you actually need.",
    ],
    left: [
      "Final stage on the left checklist! Stage 7 brings the entire machine to life.",
      "Look at the left panel — 6 out of 7 stages done! This is the grand finale.",
      "Stage 7 on the left! Once this is mounted, your entire rig is assembled!",
    ],
    right: [
      "Right panel shows total wattage and efficiency rating. Click Mount to complete your build!",
      "Check total system power requirements on the right, then hit Mount to seal the deal!",
      "Right side gives you modularity and cert ratings. Click Mount Component to complete the rig!",
    ],
    done: [
      "Pick your power supply and let's power this baby up!",
      "Click a power supply to check its wattage rating!",
      "Lock in your power supply and let's finish this build!",
    ],
  },
};

const BOB_STAGE_TIPS = {
  case: [
    "Cases with front mesh keep temps nice and frosty!",
    "Hey! Make sure the case fits a full ATX board if that's what you want.",
    "Boop! I'm keeping an eye on that case size.",
    "Cable management is way easier in a mid-tower case!",
    "Check GPU length clearance before mounting!",
  ],
  motherboard: [
    "Remember: CPU socket has to match the board socket!",
    "Look for DDR5 support if you want the newest memory tech.",
    "Stop poking me and check those M.2 slots, haha!",
    "ATX boards give you tons of expansion slots.",
    "Wi-Fi built into the board saves you an extra USB dongle!",
  ],
  cpu: [
    "More cores means smoother streaming and video editing!",
    "Intel or AMD? Both make beasts nowadays.",
    "Tickles! Make sure you pair a beefy cooler with that chip.",
    "Higher clock speeds give you better gaming FPS!",
    "Don't worry, the gold triangle on the corner shows which way it goes.",
  ],
  ram: [
    "Always install sticks in slots 2 and 4 for dual channel!",
    "16 gigs is great, 32 gigs is chef's kiss.",
    "Hey, don't forget to enable XMP in BIOS later to get full speed!",
    "RGB RAM adds at least 10 imaginary horsepower, haha!",
    "Dual-channel gives you double the memory bandwidth.",
  ],
  storage: [
    "NVMe M.2 drives plug right into the board — no messy cables!",
    "Put your operating system on the fastest drive you got.",
    "Again? Okay! Always mount the main SSD in the top slot closest to the CPU.",
    "A 1TB or 2TB NVMe is plenty for games and files.",
    "SSDs have no moving parts, so they're super reliable and quiet.",
  ],
  gpu: [
    "Don't forget: plug the monitor into the GPU, NOT the motherboard!",
    "Check clearance so that three-fan card actually fits in the case.",
    "That tickles! Gotta make sure your power supply has enough cables for this card.",
    "8GB VRAM is good, 12GB+ is amazing for 1440p and 4K gaming.",
    "Fans only spin when gaming so the card stays silent while browsing.",
  ],
  psu: [
    "Never cheap out on the power supply — it protects everything else!",
    "80 Plus Gold gives you great efficiency and stays super quiet.",
    "Don't mix modular cables from different brands — they can fry your stuff!",
    "Always leave 20-30% wattage headroom for power spikes.",
    "Modular power supplies let you leave unused cables in the box!",
  ],
};

const BOB_GENERAL_BUILD_LINES = [
  "Hey, I see you!",
  "Take your time picking parts, no rush!",
  "Looking good so far!",
  "Click STARTER RIG if you want a balanced preset ready to go!",
  "That tickles!",
  "Poke me anytime for build advice!",
  "Boop! I'm watching your build.",
  "You found me!",
  "Again? Okay, let's keep building!"
];

export const buildSteps = [
  {
    key: "case",
    label: "PC Case",
    description: "Houses all components",
  },
  {
    key: "motherboard",
    label: "Motherboard",
    description: "Connects all components",
  },
  {
    key: "cpu",
    label: "CPU (Processor)",

    description: "The brain of your PC",
  },
  {
    key: "ram",
    label: "RAM (Memory)",
    description: "Temporary data storage",
  },
  {
    key: "storage",
    label: "Storage",
    description: "Permanent data storage",
  },
  {
    key: "gpu",
    label: "GPU (Graphics Card)",
    description: "Handles graphics and gaming",
  },
  {
    key: "psu",
    label: "Power Supply (PSU)",
    description: "Powers your entire system",
  },
];


const CATEGORY_FILTERS = {
  case: [
    { label: "ALL", filterFn: () => true },
    { label: "Mid Tower", filterFn: (c) => (c.form_factor || "").toLowerCase().includes("mid") || (c.tags || []).some(t => t.toLowerCase().includes("mid")) },
    { label: "Full Tower", filterFn: (c) => (c.form_factor || "").toLowerCase().includes("full") || (c.tags || []).some(t => t.toLowerCase().includes("full")) },
    { label: "Micro-ATX", filterFn: (c) => (c.form_factor || "").toLowerCase().includes("micro") || (c.form_factor || "").toLowerCase().includes("matx") || (c.tags || []).some(t => t.toLowerCase().includes("micro") || t.toLowerCase().includes("matx")) },
  ],
  motherboard: [
    { label: "ALL", filterFn: () => true },
    { label: "AM5", filterFn: (c) => (c.socket_type || "").toUpperCase() === "AM5" || (c.tags || []).some(t => t.toUpperCase().includes("AM5")) },
    { label: "LGA1700", filterFn: (c) => (c.socket_type || "").toUpperCase().includes("1700") || (c.tags || []).some(t => t.toUpperCase().includes("1700")) },
    { label: "AM4", filterFn: (c) => (c.socket_type || "").toUpperCase() === "AM4" || (c.tags || []).some(t => t.toUpperCase().includes("AM4")) },
    { label: "DDR5", filterFn: (c) => (c.ddr_type || "").toUpperCase() === "DDR5" || (c.tags || []).some(t => t.toUpperCase().includes("DDR5")) },
    { label: "DDR4", filterFn: (c) => (c.ddr_type || "").toUpperCase() === "DDR4" || (c.tags || []).some(t => t.toUpperCase().includes("DDR4")) },
    { label: "ATX", filterFn: (c) => (c.form_factor || "").toUpperCase() === "ATX" },
    { label: "mATX", filterFn: (c) => (c.form_factor || "").toUpperCase().includes("MATX") || (c.form_factor || "").toLowerCase().includes("micro") },
  ],
  cpu: [
    { label: "ALL", filterFn: () => true },
    { label: "AM5", filterFn: (c) => (c.socket_type || "").toUpperCase() === "AM5" || (c.tags || []).some(t => t.toUpperCase().includes("AM5")) },
    { label: "LGA1700", filterFn: (c) => (c.socket_type || "").toUpperCase().includes("1700") || (c.tags || []).some(t => t.toUpperCase().includes("1700")) },
    { label: "AM4", filterFn: (c) => (c.socket_type || "").toUpperCase() === "AM4" || (c.tags || []).some(t => t.toUpperCase().includes("AM4")) },
    { label: "Intel", filterFn: (c) => (c.brand || "").toLowerCase().includes("intel") || (c.name || "").toLowerCase().includes("intel") || (c.name || "").toLowerCase().includes("core") },
    { label: "AMD", filterFn: (c) => (c.brand || "").toLowerCase().includes("amd") || (c.name || "").toLowerCase().includes("ryzen") || (c.name || "").toLowerCase().includes("amd") },
  ],
  ram: [
    { label: "ALL", filterFn: () => true },
    { label: "DDR5", filterFn: (c) => (c.ddr_type || "").toUpperCase() === "DDR5" || (c.tags || []).some(t => t.toUpperCase().includes("DDR5")) || (c.name || "").toUpperCase().includes("DDR5") },
    { label: "DDR4", filterFn: (c) => (c.ddr_type || "").toUpperCase() === "DDR4" || (c.tags || []).some(t => t.toUpperCase().includes("DDR4")) || (c.name || "").toUpperCase().includes("DDR4") },
    { label: "16GB", filterFn: (c) => (c.capacity || "").toUpperCase().includes("16GB") || (c.name || "").toUpperCase().includes("16GB") },
    { label: "32GB", filterFn: (c) => (c.capacity || "").toUpperCase().includes("32GB") || (c.name || "").toUpperCase().includes("32GB") },
  ],
  storage: [
    { label: "ALL", filterFn: () => true },
    { label: "NVMe M.2", filterFn: (c) => (c.type || "").toUpperCase().includes("NVME") || (c.tags || []).some(t => t.toUpperCase().includes("NVME") || t.toUpperCase().includes("M.2")) || (c.name || "").toUpperCase().includes("NVME") },
    { label: "SATA SSD", filterFn: (c) => (c.type || "").toUpperCase().includes("SATA") || (c.tags || []).some(t => t.toUpperCase().includes("SATA")) || (c.name || "").toUpperCase().includes("SATA") },
    { label: "512GB", filterFn: (c) => (c.capacity || "").toUpperCase().includes("512GB") || (c.name || "").toUpperCase().includes("512GB") },
    { label: "1TB", filterFn: (c) => (c.capacity || "").toUpperCase().includes("1TB") || (c.name || "").toUpperCase().includes("1TB") },
    { label: "2TB+", filterFn: (c) => (c.capacity || "").toUpperCase().includes("2TB") || (c.name || "").toUpperCase().includes("2TB") },
  ],
  gpu: [
    { label: "ALL", filterFn: () => true },
    { label: "NVIDIA RTX", filterFn: (c) => (c.name || "").toUpperCase().includes("RTX") || (c.name || "").toUpperCase().includes("GEFORCE") || (c.tags || []).some(t => t.toUpperCase().includes("RTX")) },
    { label: "AMD Radeon", filterFn: (c) => (c.name || "").toUpperCase().includes("RADEON") || (c.name || "").toUpperCase().includes("RX") || (c.tags || []).some(t => t.toUpperCase().includes("RX")) },
    { label: "12GB+ VRAM", filterFn: (c) => (c.tags || []).some(t => t.toUpperCase().includes("12GB") || t.toUpperCase().includes("16GB") || t.toUpperCase().includes("24GB")) || (c.name || "").toUpperCase().includes("12GB") || (c.name || "").toUpperCase().includes("16GB") },
  ],
  psu: [
    { label: "ALL", filterFn: () => true },
    { label: "500W - 650W", filterFn: (c) => (Number(c.wattage) >= 500 && Number(c.wattage) <= 650) || (c.tags || []).some(t => t.includes("500W") || t.includes("650W")) },
    { label: "750W - 850W+", filterFn: (c) => Number(c.wattage) >= 750 || (c.tags || []).some(t => t.includes("750W") || t.includes("850W") || t.includes("1000W")) },
    { label: "80+ Gold / Plat", filterFn: (c) => (c.efficiency || "").toLowerCase().includes("gold") || (c.efficiency || "").toLowerCase().includes("platinum") || (c.tags || []).some(t => t.toLowerCase().includes("gold") || t.toLowerCase().includes("platinum")) },
    { label: "Modular", filterFn: (c) => (c.desc || "").toLowerCase().includes("modular") || (c.tags || []).some(t => t.toLowerCase().includes("modular")) },
  ]
};

function BuildPage({ isIntegrated = false, startBuildRequested = false, onBuildInteracted }) {
  const { mode, unlockStage, unlockedStages } = useLearnMode();
  const {
    currentBuild,
    allComponents,
    addComponent,
    removeComponent,
    getSelectedComponents,
    resetBuild,
    loadDemoBuild,
  } = useBuild();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(() => {
    if (location.state?.stepCategory) {
      const idx = buildSteps.findIndex((s) => s.key.toLowerCase() === location.state.stepCategory.toLowerCase());
      return idx !== -1 ? idx : 0;
    }
    return 0;
  });
  const [searchQuery, setSearchQuery] = useState(() => {
    return new URLSearchParams(location.search).get("search") || "";
  });
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [viewedComponent, setViewedComponent] = useState(null);
  const [bobSpeech, setBobSpeech] = useState(null);

  // Bob appearance and entrance dialogue state:
  // Must NOT trigger automatically when entering the site/page.
  // Must ONLY trigger when user clicked START BUILD AND is currently looking/staying on the build/component picker.
  const [hasStartedBuild, setHasStartedBuild] = useState(() => {
    if (startBuildRequested) return true;
    if (!isIntegrated) {
      try {
        return sessionStorage.getItem("buildlab_start_build_intent") === "true";
      } catch {
        return false;
      }
    }
    return false;
  });

  const [isViewingBuild, setIsViewingBuild] = useState(false);
  const entranceGreetedRef = useRef(false);
  const initialMountRef = useRef(true);

  // Sync external startBuildRequested prop
  useEffect(() => {
    if (startBuildRequested) {
      setHasStartedBuild(true);
    }
  }, [startBuildRequested]);

  // Listen for START BUILD click events across the app
  useEffect(() => {
    const handleStartBuild = () => {
      setHasStartedBuild(true);
      try {
        sessionStorage.setItem("buildlab_start_build_intent", "true");
      } catch {}
    };

    window.addEventListener("buildlab:start-build-clicked", handleStartBuild);

    // If explicit hash or scroll param on navigation
    if (
      typeof window !== "undefined" &&
      (window.location.hash === "#build-station" ||
       window.location.search.includes("scroll=build") ||
       location.state?.scrollTo === "build-station")
    ) {
      handleStartBuild();
    }

    return () => {
      window.removeEventListener("buildlab:start-build-clicked", handleStartBuild);
    };
  }, [location]);

  // Track whether the user is actively viewing / staying on the build workstation
  useEffect(() => {
    const el = document.getElementById("build-main-area");
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry) {
          // User is staying on the build picker if it's comfortably visible in viewport
          const inView = entry.isIntersecting && entry.intersectionRatio >= 0.2;
          setIsViewingBuild(inView);
        }
      },
      { threshold: [0, 0.2, 0.5] }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const selectedComponents = getSelectedComponents();

  // Guided highlight tour state:
  // guideTarget: null | 'center' | 'left' | 'right'
  const [guideTarget, setGuideTarget] = useState(null);
  const [guideLookTarget, setGuideLookTarget] = useState(null);
  const guideTimerRef = useRef(null);
  const guidedStagesRef = useRef(new Set());

  // Function to gracefully dismiss the tour if user interacts
  const dismissGuideTour = useCallback(() => {
    if (guideTimerRef.current) {
      clearTimeout(guideTimerRef.current);
      guideTimerRef.current = null;
    }
    setGuideTarget(null);
    setGuideLookTarget(null);
  }, []);

  // Cleanup guide timers on unmount
  useEffect(() => {
    return () => {
      if (guideTimerRef.current) {
        clearTimeout(guideTimerRef.current);
      }
    };
  }, []);

  // Orchestrate the 3-step Guided Tour: Center (3.2s) -> Left (2.8s) -> Right (2.8s) -> Finish
  const startGuideTour = useCallback((category = null) => {
    const activeCategory = category || buildSteps[currentStep].key;
    const catGuide = BOB_CASUAL_GUIDE[activeCategory] || BOB_CASUAL_GUIDE.case;

    if (guideTimerRef.current) {
      clearTimeout(guideTimerRef.current);
      guideTimerRef.current = null;
    }

    const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

    // PHASE 1: Center Area (Select parts available) - 6.5 seconds (gives comfortable reading & scanning time)
    setGuideTarget("center");
    setGuideLookTarget("#build-center-panel");
    setBobSpeech(pickRandom(catGuide.center));

    guideTimerRef.current = setTimeout(() => {
      // PHASE 2: Left Side Panel (Hardware stages checklist) - 6.0 seconds
      setGuideTarget("left");
      setGuideLookTarget("#build-left-panel");
      setBobSpeech(pickRandom(catGuide.left));

      guideTimerRef.current = setTimeout(() => {
        // PHASE 3: Right Side Panel (Telemetry & Mount Component) - 6.0 seconds
        setGuideTarget("right");
        setGuideLookTarget("#build-right-panel");
        setBobSpeech(pickRandom(catGuide.right));

        guideTimerRef.current = setTimeout(() => {
          // PHASE 4: Return to normal cursor following & casual wrapup
          setGuideTarget(null);
          setGuideLookTarget(null);
          setBobSpeech(pickRandom(catGuide.done));
          guideTimerRef.current = null;
        }, 6000);
      }, 6000);
    }, 6500);
  }, [currentStep]);

  // Entrance Dialogue Trigger:
  // ONLY fires when user clicked START BUILD AND is currently looking/staying on the build picker
  useEffect(() => {
    if (!hasStartedBuild || !isViewingBuild || entranceGreetedRef.current) {
      return;
    }

    // Short settle delay (450ms) so smooth scroll brings BOB completely into view before he greets
    const timer = setTimeout(() => {
      if (entranceGreetedRef.current) return;

      const el = document.getElementById("build-main-area");
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top >= window.innerHeight || rect.bottom <= 0) return;
      }

      entranceGreetedRef.current = true;
      const initialCat = buildSteps[currentStep]?.key || "case";
      guidedStagesRef.current.add(initialCat);

      // Give a gentle, friendly one-line greeting instead of forcing an 18.5s tour
      if (selectedComponents.length === buildSteps.length) {
        setBobSpeech("All 7 hardware stages armed! Rig is ready to verify!");
      } else if (selectedComponents.length > 0) {
        setBobSpeech(`Welcome back! ${selectedComponents.length} of ${buildSteps.length} stages assembled.`);
      } else {
        setBobSpeech("Hi there! I'm B.O.B., your hardware companion. Select a PC Case to begin!");
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [hasStartedBuild, isViewingBuild, currentStep, selectedComponents.length]);

  // Stage change: friendly tip when learner enters new stages, NO automatic tour hijacking
  useEffect(() => {
    const catKey = buildSteps[currentStep]?.key;
    if (!catKey) return;

    if (hasStartedBuild && isViewingBuild && !guidedStagesRef.current.has(catKey)) {
      guidedStagesRef.current.add(catKey);
      const stageTips = BOB_STAGE_TIPS[catKey] || BOB_GENERAL_BUILD_LINES;
      const tip = stageTips[Math.floor(Math.random() * stageTips.length)];
      setBobSpeech(tip);
    }
  }, [currentStep, hasStartedBuild, isViewingBuild]);

  // Completion toast: fires once the rig selection is completed DURING build activity,
  // NEVER on initial mount / page entrance.
  const [showCompleteToast, setShowCompleteToast] = useState(false);

  useEffect(() => {
    if (initialMountRef.current) {
      initialMountRef.current = false;
      return;
    }

    if (selectedComponents.length === buildSteps.length) {
      soundManager.complete();
      setShowCompleteToast(true);
      if (mode === "learn") {
        unlockStage("compatibility");
      }
      const completeLines = [
        "Woohoo! All 7 parts are in! Let's check compatibility and test this beast!",
        "Look at that! Complete build locked and loaded. Ready for testing!",
        "She's fully assembled! Hit Compatibility to verify everything before buying!",
      ];
      setBobSpeech(completeLines[Math.floor(Math.random() * completeLines.length)]);
      const timer = setTimeout(() => setShowCompleteToast(false), 9000);
      return () => clearTimeout(timer);
    }
    setShowCompleteToast(false);
  }, [selectedComponents.length, mode, unlockStage]);

  // Keep compatibility unlocked if 7/7 parts are mounted in Learn Mode
  useEffect(() => {
    if (mode === "learn" && selectedComponents.length === buildSteps.length) {
      unlockStage("compatibility");
    }
  }, [mode, selectedComponents.length, unlockStage]);

  // Sync viewedComponent when switching stages:
  // If the current stage already has a selected component, show its specs;
  // If no component is selected for this stage, viewedComponent remains null
  // so the right panel displays Assembly Overview (specs preview only appears when selected)
  useEffect(() => {
    const currentCategoryKey = buildSteps[currentStep]?.key;
    setViewedComponent(currentBuild[currentCategoryKey] || null);
    setSearchQuery("");
    setActiveFilter("ALL");
  }, [currentStep, currentBuild]);

  useEffect(() => {
    if (location.state?.scrollTo) {
      setTimeout(() => {
        const el = document.getElementById(location.state.scrollTo);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  }, [location.state]);

  const handleComponentSelect = (component) => {
    onBuildInteracted?.();
    dismissGuideTour();
    const category = buildSteps[currentStep].key;
    addComponent(category, component);
    setViewedComponent(component);
    soundManager.install();

    const casualMountLines = {
      case: [
        `Ooh, sweet case! ${component.name} is gonna look super clean.`,
        `Nice chassis! ${component.name} has tons of room to build in.`,
        `Solid pick! ${component.name} locked down as our foundation.`,
      ],
      motherboard: [
        `Motherboard locked in! ${component.name} is a solid foundation.`,
        `Ooh, good board! ${component.name} socket is ready for action.`,
        `Nice pick! ${component.name} is gonna connect everything beautifully.`,
      ],
      cpu: [
        `CPU mounted! ${component.name} is packing some serious power.`,
        `Boom, brain installed! ${component.name} is seated and ready.`,
        `Beast processor mounted! Don't forget thermal cooling later, haha.`,
      ],
      ram: [
        `Memory locked in! ${component.name} is gonna keep things super snappy.`,
        `Nice sticks! ${component.name} dual-channel speed ready to fly.`,
        `RAM mounted! That's plenty of speed for multitasking.`,
      ],
      storage: [
        `Fast storage in the slot! ${component.name} boot times are gonna be instant.`,
        `Drive mounted! ${component.name} has plenty of room for games.`,
        `Storage locked in! Lightning quick load times incoming.`,
      ],
      gpu: [
        `Oof, look at that graphics card! ${component.name} is a gaming monster.`,
        `GPU locked in! Frames are gonna be sky high with ${component.name}.`,
        `Beast card mounted! Make sure we give it enough power in the next stage.`,
      ],
      psu: [
        `Power supply mounted! ${component.name} has plenty of juice to feed the beast.`,
        `PSU locked in! Clean power ready to flow through the whole rig.`,
        `Power locked in! That completes all 7 hardware stages!`,
      ],
    };

    const pool = casualMountLines[category] || [`Locked in ${component.name}!`];
    setBobSpeech(pool[Math.floor(Math.random() * pool.length)]);
  };

  const handleReset = () => {
    dismissGuideTour();
    soundManager.modalClose();
    resetBuild();
    setViewedComponent(null);
    const resetLines = [
      "Clean slate! Alright, let's start fresh with a new case.",
      "Wiped the bench! What kind of rig do you wanna build this time?",
      "Workspace cleared! Pick your case whenever you're ready.",
    ];
    setBobSpeech(resetLines[Math.floor(Math.random() * resetLines.length)]);
    setCurrentStep(0); // Reset to Step 1 (PC Case)
  };

  const currentCategory = buildSteps[currentStep].key;
  const currentComponents = allComponents[currentCategory] || [];
  const selectedComponent = currentBuild[currentCategory];
  const currentStepData = buildSteps[currentStep];
  const currentCategoryFilters = CATEGORY_FILTERS[currentCategory] || [{ label: "ALL", filterFn: () => true }];

  // Filter components based on search query and category filters
  const filteredComponents = currentComponents.filter((component) => {
    const searchLower = searchQuery.toLowerCase();
    const tagsMatch = Array.isArray(component.tags)
      ? component.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      : typeof component.tags === "string" &&
      component.tags.toLowerCase().includes(searchLower);
    const matchesSearch =
      (component.name || "").toLowerCase().includes(searchLower) ||
      (component.brand || "").toLowerCase().includes(searchLower) ||
      tagsMatch;

    const currentFilterObj = currentCategoryFilters.find(f => f.label === activeFilter);
    const matchesCategoryFilter = !currentFilterObj || activeFilter === "ALL" || currentFilterObj.filterFn(component);

    return matchesSearch && matchesCategoryFilter;
  });

  return (
    <div className={`build-page ${isIntegrated ? 'integrated-home' : 'standalone'}`}>
      {!isIntegrated && <GlobalHeader />}
      <div className="build-main" id="build-main-area">
        <div className="build-sidebar">
          <div
            className={`sidebar-card bob-highlight-target ${guideTarget === 'left' ? 'active-guide' : ''}`}
            id="build-left-panel"
          >
            {guideTarget === 'left' && (
              <>
                <div className="bob-guide-indicator-pill">
                  <span className="tag-bracket">[</span>
                  <span className="bob-guide-indicator-dot" />
                  <span>B.O.B. // HARDWARE STAGES</span>
                  <span className="tag-bracket">]</span>
                </div>
                <div className="bob-guide-scanline" />
                <div className="bob-guide-corner-tl" />
                <div className="bob-guide-corner-tr" />
                <div className="bob-guide-corner-bl" />
                <div className="bob-guide-corner-br" />
              </>
            )}
            <div className="sidebar-header-row">
              <div className="sidebar-header-title-wrap">
                <div className="cyber-tag-badge mini">
                  <span className="tag-bracket">[</span>
                  <span className="tag-dot" />
                  <span className="tag-text">HARDWARE STAGES</span>
                  <span className="tag-bracket">]</span>
                </div>
                <h3>ASSEMBLY RIG</h3>
              </div>
              <span className="build-step-progress-badge">
                <span className="badge-prefix">STAGE</span>
                <span className="badge-counter">{selectedComponents.length} / {buildSteps.length}</span>
              </span>
            </div>
            <div className="step-list">
              {buildSteps.map((step, index) => {
                const picked = currentBuild[step.key];
                return (
                  <div
                    key={step.key}
                    className={`step-item ${index === currentStep ? "active" : ""} ${picked ? "completed" : ""}`}
                    onClick={() => setCurrentStep(index)}
                  >
                    <div className="step-icon">
                      {picked ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      ) : (
                        <span className="step-num">0{index + 1}</span>
                      )}
                    </div>
                    <div className="step-content">
                      <div className="step-title">{step.label}</div>
                      <div className={`step-desc ${picked ? "step-picked-title" : ""}`}>
                        {picked ? picked.name : step.description}
                      </div>
                    </div>
                    {picked && (
                      <button
                        type="button"
                        className="step-remove-mini"
                        onClick={(e) => {
                          e.stopPropagation();
                          soundManager.click();
                          removeComponent(step.key);
                          if (step.key === currentStepData.key) {
                            setViewedComponent(null);
                          }
                        }}
                        title={`Remove ${step.label}`}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {hasStartedBuild && (
              <div className="build-bob-dock" title="B.O.B. (Poke me for build tips!)">
                <EyeTracker
                  size={86}
                  shape="Cube"
                  eyes="Squares"
                  bodyColor="#00e5a0"
                  eyeColor="#06080e"
                  follow={90}
                  bounce={55}
                  speechLines={BOB_STAGE_TIPS[currentStepData.key] || BOB_GENERAL_BUILD_LINES}
                  externalSpeech={bobSpeech}
                  lookTarget={guideLookTarget}
                />
              </div>
            )}

            <div className="sidebar-foot-row">
              <button
                onClick={handleReset}
                className="reset-build-btn sidebar-reset-btn"
                disabled={selectedComponents.length === 0}
                title="Clear all selected components"
              >
                <span>RESET BUILD</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  dismissGuideTour();
                  try { soundManager.click(); } catch {}
                  const starterLines = [
                    "Loaded up the starter preset! Balanced, tested, and ready to roll.",
                    "Boom! Starter rig locked in with verified compatibility.",
                    "Sweet! Loaded our balanced starter build for you.",
                  ];
                  setBobSpeech(starterLines[Math.floor(Math.random() * starterLines.length)]);
                  if (loadDemoBuild) loadDemoBuild();
                }}
                className="load-starter-btn sidebar-starter-btn"
                title="Load a balanced, fully-compatible starter PC build"
              >
                <span>STARTER RIG</span>
              </button>
            </div>
          </div>
        </div>

        <div className="build-content">
          <div className="search-and-filters">
            <div className="search-container">
              <span className="search-icon-prefix">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </span>
              <input
                type="text"
                placeholder={`Search ${currentStepData.label.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <span className="search-results-count">
                  {filteredComponents.length} result
                  {filteredComponents.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <div className="tier-filters">
              {currentCategoryFilters.map((filter) => (
                <button
                  key={filter.label}
                  className={`tier-btn ${activeFilter === filter.label ? "active" : ""}`}
                  onClick={() => setActiveFilter(activeFilter === filter.label ? "ALL" : filter.label)}
                >
                  <span className="tier-btn-bracket">[</span>
                  <span>{filter.label.toUpperCase()}</span>
                  <span className="tier-btn-bracket">]</span>
                </button>
              ))}
            </div>
          </div>

          <div className="build-guide-subbar">
            <div className="guide-dot" />
            <span className="build-guide-text">
              STAGE {currentStep + 1} OF {buildSteps.length} // Select compatible {currentStepData.label} to advance assembly
            </span>
            <div className="guide-subbar-actions">
              {guideTarget ? (
                <button
                  type="button"
                  className="bob-tour-pill-btn active"
                  onClick={dismissGuideTour}
                  title="Dismiss highlight guide"
                >
                  <span className="tour-pill-pulse" />
                  <span>✕ SKIP TOUR</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="bob-tour-pill-btn"
                  onClick={() => {
                    try { soundManager.click(); } catch {}
                    startGuideTour(currentStepData.key);
                  }}
                  title="Ask B.O.B. to guide you through this stage"
                >
                  <span className="tour-pill-icon">💡</span>
                  <span>GUIDE ME</span>
                </button>
              )}
            </div>
          </div>

          <div className="build-grid-and-panel">
            <div
              className={`components-grid-wrapper bob-highlight-target ${guideTarget === 'center' ? 'active-guide' : ''}`}
              id="build-center-panel"
            >
              {guideTarget === 'center' && (
                <>
                  <div className="bob-guide-indicator-pill">
                    <span className="tag-bracket">[</span>
                    <span className="bob-guide-indicator-dot" />
                    <span>B.O.B. // SELECT {currentStepData.label.toUpperCase()} HERE</span>
                    <span className="tag-bracket">]</span>
                  </div>
                  <div className="bob-guide-scanline" />
                  <div className="bob-guide-corner-tl" />
                  <div className="bob-guide-corner-tr" />
                  <div className="bob-guide-corner-bl" />
                  <div className="bob-guide-corner-br" />
                </>
              )}
              <div className="components-grid compact">
                {filteredComponents.map((component) => {
                  const isSelected = selectedComponent?.id === component.id;

                  return (
                    <div
                      key={component.id}
                      className={`component-card compact-card ${isSelected ? "selected" : ""}`}
                      onClick={() => handleComponentSelect(component)}
                    >
                      <div className="component-image">
                        <img src={component.img} alt={component.name} />
                      </div>
                      <div className="component-details compact-details">
                        <span className="card-brand-label">{component.brand}</span>
                        <h3 className="component-name">{component.name}</h3>
                      </div>
                      <button
                        type="button"
                        className={`card-action-btn ${isSelected ? "selected" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleComponentSelect(component);
                        }}
                      >
                        {isSelected ? "✓ MOUNTED" : "SELECT PART"}
                      </button>
                      {isSelected && (
                        <span className="card-installed-tag">✓ MOUNTED</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div
              className={`specifications-panel bob-highlight-target ${guideTarget === 'right' ? 'active-guide' : ''}`}
              id="build-right-panel"
            >
              {guideTarget === 'right' && (
                <>
                  <div className="bob-guide-indicator-pill">
                    <span className="tag-bracket">[</span>
                    <span className="bob-guide-indicator-dot" />
                    <span>B.O.B. // TELEMETRY & MOUNT</span>
                    <span className="tag-bracket">]</span>
                  </div>
                  <div className="bob-guide-scanline" />
                  <div className="bob-guide-corner-tl" />
                  <div className="bob-guide-corner-tr" />
                  <div className="bob-guide-corner-bl" />
                  <div className="bob-guide-corner-br" />
                </>
              )}
              {viewedComponent ? (
                <>
                  <div className="spec-header-tag">
                    <span className="tag-bracket">[</span>
                    <span className="tag-dot" />
                    <span className="tag-text">COMPONENT TELEMETRY</span>
                    <span className="tag-bracket">]</span>
                  </div>
                  <div className="spec-image-container">
                    <img src={viewedComponent.img} alt={viewedComponent.name} />
                  </div>
                  <div className="spec-title-area">
                    <span className="spec-brand-tag">{viewedComponent.brand || "Hardware"}</span>
                    <h3 className="spec-component-title">{viewedComponent.name}</h3>
                  </div>

                  <div className="spec-action-top">
                    <div className="spec-mounted-badge">
                      <span className="badge-check">✓</span>
                      <span>MOUNTED IN RIG (STAGE {currentStep + 1}/{buildSteps.length})</span>
                    </div>
                    {currentStep < buildSteps.length - 1 ? (
                      <button
                        type="button"
                        className="btn-select-component btn-next-stage"
                        onClick={() => {
                          try { soundManager.click(); } catch {}
                          setCurrentStep(currentStep + 1);
                        }}
                      >
                        <span className="btn-label">NEXT STAGE: {buildSteps[currentStep + 1].label.toUpperCase()}</span>
                        <span className="btn-arrow">&rarr;</span>
                      </button>
                    ) : (
                      <Link
                        to="/compatibility"
                        className="btn-select-component btn-next-stage"
                        onClick={() => {
                          try { soundManager.click(); } catch {}
                        }}
                      >
                        <span className="btn-label">CHECK COMPATIBILITY</span>
                        <span className="btn-arrow">&rarr;</span>
                      </Link>
                    )}
                  </div>

                  <div className="spec-details-list">
                    <div className="spec-row">
                      <span className="spec-label">BRAND</span>
                      <span className="spec-value">{viewedComponent.brand || "N/A"}</span>
                    </div>
                    <div className="spec-row">
                      <span className="spec-label">NAME / MODEL</span>
                      <span className="spec-value">{viewedComponent.name || "N/A"}</span>
                    </div>
                    <div className="spec-row spec-desc">
                      <span className="spec-label" style={{ marginBottom: '4px' }}>DESCRIPTION</span>
                      <p style={{ margin: 0 }}>{viewedComponent.desc || "N/A"}</p>
                    </div>
                    <div className="spec-row">
                      <span className="spec-label">TAGS</span>
                      <span className="spec-value" style={{ textTransform: 'capitalize' }}>
                        {Array.isArray(viewedComponent.tags)
                          ? viewedComponent.tags.join(', ')
                          : typeof viewedComponent.tags === 'string'
                            ? (() => {
                              try {
                                const parsedTags = JSON.parse(viewedComponent.tags);
                                return Array.isArray(parsedTags) ? parsedTags.join(', ') : viewedComponent.tags;
                              } catch {
                                return viewedComponent.tags;
                              }
                            })()
                            : "N/A"}
                      </span>
                    </div>

                    {viewedComponent.category === 'case' && (
                      <div className="spec-row">
                        <span className="spec-label">FORM FACTOR</span>
                        <span className="spec-value">{viewedComponent.form_factor || "N/A"}</span>
                      </div>
                    )}

                    {viewedComponent.category === 'motherboard' && (
                      <>
                        <div className="spec-row">
                          <span className="spec-label">SOCKET TYPE</span>
                          <span className="spec-value">{viewedComponent.socket_type || "N/A"}</span>
                        </div>
                        <div className="spec-row">
                          <span className="spec-label">DDR TYPE</span>
                          <span className="spec-value">{viewedComponent.ddr_type || "N/A"}</span>
                        </div>
                        <div className="spec-row">
                          <span className="spec-label">FORM FACTOR</span>
                          <span className="spec-value">{viewedComponent.form_factor || "N/A"}</span>
                        </div>
                      </>
                    )}

                    {viewedComponent.category === 'cpu' && (
                      <>
                        <div className="spec-row">
                          <span className="spec-label">SOCKET TYPE</span>
                          <span className="spec-value">{viewedComponent.socket_type || "N/A"}</span>
                        </div>
                        <div className="spec-row">
                          <span className="spec-label">WATTAGE</span>
                          <span className="spec-value">{viewedComponent.wattage || "N/A"}</span>
                        </div>
                      </>
                    )}

                    {viewedComponent.category === 'ram' && (
                      <>
                        <div className="spec-row">
                          <span className="spec-label">DDR TYPE</span>
                          <span className="spec-value">{viewedComponent.ddr_type || "N/A"}</span>
                        </div>
                        <div className="spec-row">
                          <span className="spec-label">CAPACITY</span>
                          <span className="spec-value">{viewedComponent.capacity || "N/A"}</span>
                        </div>
                      </>
                    )}

                    {viewedComponent.category === 'storage' && (
                      <div className="spec-row">
                        <span className="spec-label">CAPACITY</span>
                        <span className="spec-value">{viewedComponent.capacity || "N/A"}</span>
                      </div>
                    )}

                    {viewedComponent.category === 'gpu' && (
                      <div className="spec-row">
                        <span className="spec-label">POWER REQUIRED</span>
                        <span className="spec-value">{viewedComponent.power_required || "N/A"}</span>
                      </div>
                    )}

                    {viewedComponent.category === 'psu' && (
                      <div className="spec-row">
                        <span className="spec-label">WATTAGE</span>
                        <span className="spec-value">{viewedComponent.wattage || "N/A"}</span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="spec-overview-card">
                  <div className="spec-overview-header">
                    <div className="spec-overview-tag">
                      <span className="tag-bracket">[</span>
                      <span className="tag-dot" />
                      <span className="tag-text">RIG TELEMETRY</span>
                      <span className="tag-bracket">]</span>
                    </div>
                    <h3 className="spec-overview-title">ASSEMBLY OVERVIEW</h3>
                  </div>

                  <div className="build-progress-box">
                    <div className="progress-top-row">
                      <span className="progress-label">HARDWARE CAPACITY</span>
                      <span className="progress-value">
                        {selectedComponents.length} / {buildSteps.length}
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{ width: `${(selectedComponents.length / buildSteps.length) * 100}%` }}
                      />
                    </div>
                    <span className="progress-caption">
                      {selectedComponents.length === buildSteps.length
                        ? "Complete 7-stage rig assembled. Ready for 3D Studio."
                        : `${buildSteps.length - selectedComponents.length} component${buildSteps.length - selectedComponents.length === 1 ? '' : 's'} remaining to complete.`}
                    </span>
                  </div>

                  <div className="next-step-prompt">
                    <div className="next-step-badge">
                      <span className="next-step-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                      </span>
                      <div className="next-step-content">
                        <div className="next-step-title">CURRENT STAGE: {currentStepData.label.toUpperCase()}</div>
                        <div className="next-step-desc">
                          {selectedComponent
                            ? `Selected: "${selectedComponent.name}". Click any card to swap or view specs.`
                            : `Select a compatible ${currentStepData.label.toLowerCase()} to mount.`}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="spec-compat-banner">
                    <span className="compat-shield">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </span>
                    <span>
                      {selectedComponents.length > 0
                        ? "Live pin & socket matching active"
                        : "Ready to assemble. Choose your case to begin."}
                    </span>
                  </div>

                  <div className="overview-cta-row">
                    <Link to="/compatibility" className="sidebar-cta-btn sidebar-cta-compat">
                      <span className="sidebar-cta-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                      </span>
                      <div className="sidebar-cta-text">
                        <span className="sidebar-cta-label">COMPATIBILITY MATRIX</span>
                        <span className="sidebar-cta-sub">Verify socket clearances</span>
                      </div>
                    </Link>

                    <Link to="/3d-builder" className="sidebar-cta-btn sidebar-cta-3d">
                      <span className="sidebar-cta-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                      </span>
                      <div className="sidebar-cta-text">
                        <span className="sidebar-cta-label">Launch 3D Studio</span>
                        <span className="sidebar-cta-sub">
                          {selectedComponents.length === 0
                            ? "Interactive 3D Assembly"
                            : `Inspect ${selectedComponents.length}/${buildSteps.length} parts in 3D`}
                        </span>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showCompleteToast && (
        <div className="build-complete-toast" role="status">
          <span className="bct-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </span>
          <div className="bct-body">
            <strong>All {buildSteps.length} parts selected — build complete!</strong>
            <span>Verify pins, sockets &amp; wattage before you buy.</span>
          </div>
          <Link
            to="/compatibility"
            className="bct-cta"
            onClick={() => {
              soundManager.click();
              setShowCompleteToast(false);
            }}
          >
            Check Compatibility
          </Link>
          <button
            className="bct-close"
            onClick={() => setShowCompleteToast(false)}
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

export default Build;

/**
 * Build — routed at /build with the FullscreenGate wrapper so the
 * standalone build experience always runs in immersive fullscreen mode.
 * The instance integrated into the Home page is gated by Home instead.
 */
function Build({ isIntegrated = false, startBuildRequested = false, onBuildInteracted }) {
  const page = (
    <BuildPage
      isIntegrated={isIntegrated}
      startBuildRequested={startBuildRequested}
      onBuildInteracted={onBuildInteracted}
    />
  );
  return isIntegrated ? page : <FullscreenGate requireFullscreen>{page}</FullscreenGate>;
}
