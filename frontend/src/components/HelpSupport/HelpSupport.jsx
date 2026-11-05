import React, { useState } from "react";
import { Link } from "react-router-dom";
import BobCompanion from "../BobCompanion/BobCompanion";
import soundManager from "../../utilities/soundManager";
import "./HelpSupport.css";

const BOB_HELP_PHRASES = [
  "Hi! I'm B.O.B., your BuildLab hardware intelligence companion.",
  "Need troubleshooting advice? Click any diagnostic query or poke me!",
  "Pro tip: Always plug your monitor into the GPU, never the motherboard!",
  "Dual-channel RAM lives in slots 2 and 4. Push until you hear the solid click!",
  "Never force a CPU! It drops in with Zero Insertion Force.",
  "Check the Motherboard Debug LEDs: DRAM, CPU, VGA, or BOOT tell all.",
  "Need hands-on practice? Jump into our 3D Studio anytime!"
];

const QUICK_DIAGNOSTICS = [
  {
    id: "gpu-display",
    label: "Fans spin, but screen is black?",
    bobResponse: "Check your display cable! Plug it into the GPU bracket, not the motherboard rear I/O.",
    targetTab: "boot",
    targetItem: 0,
  },
  {
    id: "ram-slots",
    label: "Which slots do my 2 RAM sticks go in?",
    bobResponse: "Use slots 2 and 4 (counting outwards from the CPU). Push both ends until they snap!",
    targetTab: "assembly",
    targetItem: 1,
  },
  {
    id: "cpu-zif",
    label: "How do I avoid bending CPU socket pins?",
    bobResponse: "Align the golden triangle on the CPU corner with the socket marker. Zero force needed!",
    targetTab: "assembly",
    targetItem: 0,
  },
  {
    id: "psu-cables",
    label: "Can I reuse cables from another modular PSU?",
    bobResponse: "DANGER! Never mix modular PSU cables across models. Pinouts differ and will fry components!",
    targetTab: "compatibility",
    targetItem: 2,
  },
  {
    id: "xmp-expo",
    label: "Why is my RAM running below rated speed?",
    bobResponse: "You need to enable XMP (Intel) or EXPO (AMD) in your UEFI BIOS by tapping DEL or F2 on boot.",
    targetTab: "boot",
    targetItem: 2,
  },
  {
    id: "controls-3d",
    label: "How do I rotate and pan in 3D Studio?",
    bobResponse: "Left-click drag rotates the camera, right-click drag pans, and the scroll wheel zooms in/out.",
    targetTab: "studio",
    targetItem: 0,
  },
];

const SUPPORT_CATEGORIES = [
  {
    id: "compatibility",
    name: "Hardware & Compatibility",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1"></path>
        <path d="M18 8h4a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-4"></path>
        <circle cx="8" cy="12" r="2"></circle>
      </svg>
    ),
    items: [
      {
        question: "How does BuildLab verify CPU and Motherboard socket compatibility?",
        answer:
          "BuildLab validates the exact mechanical socket form factor and electrical chipset. For example, AMD Ryzen 7000/9000 processors require the AM5 (LGA1718) socket and 600/800-series chipsets (B650, X670, X870). Intel 12th/13th/14th Gen chips require LGA1700 (Z790, B760). If you select incompatible generations, our picker immediately flags an electrical and physical conflict.",
      },
      {
        question: "Can DDR4 RAM fit into a DDR5 motherboard?",
        answer:
          "No. DDR4 and DDR5 memory modules have different physical notch positions, different pin counts (288 pins each, but keyed differently), and completely different voltage architectures (DDR5 integrates on-module power management ICs / PMIC at 1.1V, while DDR4 operates at 1.2V–1.35V). They cannot be forced into opposing sockets.",
      },
      {
        question: "Why is mixing modular power supply (PSU) cables dangerous?",
        answer:
          "While the component-side connectors (such as 24-pin ATX, 8-pin EPS, PCIe, and SATA) are standardized by ATX specifications, the PSU-side modular pinouts are NOT standardized. Cable pinouts vary between manufacturers (Corsair, Seasonic, EVGA) and even between different product lines of the same brand. Using Cable A on PSU B can send +12V straight into ground pins, permanently destroying motherboards, drives, and GPUs.",
      },
      {
        question: "How do I calculate PSU wattage headroom?",
        answer:
          "Take the combined TDP of your CPU and GPU, add 100W for motherboard, storage, fans, and peripherals, and apply a 20-30% buffer for transient power spikes (which modern high-performance GPUs exhibit). For instance: a 125W CPU + 285W GPU + 100W baseline = 510W sustained draw. An ATX 3.0 750W or 850W Gold unit is ideal to keep the PSU in its peak 50–70% efficiency curve.",
      },
    ],
  },
  {
    id: "assembly",
    name: "Assembly & Safety Guidelines",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
      </svg>
    ),
    items: [
      {
        question: "How should I handle the CPU to prevent bent socket pins?",
        answer:
          "Always handle the processor strictly by its outer PCB edges. Never touch the gold contact pads on the bottom or the LGA socket pins on the motherboard. Align the small gold triangle marker on the CPU corner with the triangle icon embossed on the motherboard socket. Lower the CPU straight down with Zero Insertion Force (ZIF). Once flush, close the load plate and press the steel retention lever into its catch.",
      },
      {
        question: "What is the correct slot arrangement for dual-channel RAM?",
        answer:
          "On virtually all modern 4-slot motherboards, a 2-stick memory kit should be installed in slots A2 and B2 (the 2nd and 4th slots counting outward from the CPU socket). This optimizes signal trace impedance and termination, enabling stable high-frequency XMP/EXPO profiles. Push firmly on both ends until the mechanical latch clicks into place.",
      },
      {
        question: "What is the recommended thermal paste pattern?",
        answer:
          "A single pea-sized dot (approximately 4 to 5 mm in diameter) placed directly in the center of the CPU integrated heat spreader (IHS) is recommended for standard consumer chips. When the cooler is clamped down with even diagonal cross-pattern screw tension, the thermal compound spreads uniformly into a micro-thin layer without air pockets or overflow.",
      },
      {
        question: "What pre-assembly steps should I complete outside the case?",
        answer:
          "Assemble the core platform outside the chassis first! Place your motherboard atop its cardboard packaging box (never on the static protective bag exterior). Install the CPU, M.2 NVMe SSDs, and RAM modules while you have 360-degree clear visibility and hand clearance. This prevents frustrating mistakes inside cramped chassis corners.",
      },
    ],
  },
  {
    id: "studio",
    name: "3D Studio Controls & Features",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
        <polyline points="2 17 12 22 22 17"></polyline>
        <polyline points="2 12 12 17 22 12"></polyline>
      </svg>
    ),
    items: [
      {
        question: "What are the camera navigation shortcuts in 3D Studio?",
        answer:
          "• Left Click + Drag: Orbital 3D camera rotation around the computer case.\n• Right Click + Drag: Smooth 2D camera panning across the workbench.\n• Scroll Wheel: Smooth zoom in / zoom out with precision collision limits.\n• Turntable Auto-Rotate: Click the Auto-Rotate button in the top toolbar for a 360-degree continuous showcase spin.",
      },
      {
        question: "How do I customize the RGB AURA lighting?",
        answer:
          "Open the RGB AURA palette in the 3D Studio toolbar. You can select curated lighting profiles (Cyber Emerald, Quantum Cyan, Sunset Amber, Hyper Violet, Neon Crimson, Stealth White) or choose a custom hex color. B.O.B. will automatically sync his outer chassis glow to match your active RGB aura!",
      },
      {
        question: "How does the 3D Component Inspection mode work?",
        answer:
          "Click on any installed hardware part inside the 3D viewport (such as the GPU, CPU Cooler, Motherboard, or RAM). The system isolates the part, highlights connection latches, displays technical specifications, and lets you inspect solder traces and heatsink fins up close.",
      },
    ],
  },
  {
    id: "boot",
    name: "First Boot & POST Diagnostics",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
      </svg>
    ),
    items: [
      {
        question: "The PC powers on and fans spin, but the monitor remains blank. What happened?",
        answer:
          "This is the #1 first-build mistake! Make sure your DisplayPort or HDMI cable is plugged into the horizontal ports on the dedicated graphics card (GPU), NOT the motherboard rear I/O. If your CPU has no integrated graphics (e.g. Intel 'F' series or AMD non-G chips), motherboard display ports produce no signal.",
      },
      {
        question: "What do the Motherboard Debug LEDs (CPU, DRAM, VGA, BOOT) mean?",
        answer:
          "Most modern boards feature 4 diagnostic LEDs that light up during POST:\n• CPU (Red): Processor initialization failed. Check 8-pin EPS 12V CPU power cable and socket pins.\n• DRAM (Amber/Orange): Memory training failed. Remove sticks and firmly reseat into slots 2 & 4.\n• VGA (White): Graphics card undetected. Check PCIe latch, 12VHPWR / PCIe 8-pin power, and monitor connection.\n• BOOT (Green): Hardware passed POST, but no operating system found. Plug in your bootable Windows USB.",
      },
      {
        question: "How do I access BIOS and configure memory speed?",
        answer:
          "Power on your PC and immediately tap the DEL or F2 key repeatedly until the UEFI BIOS screen appears. Navigate to the memory section and enable Intel XMP (Extreme Memory Profile) or AMD EXPO (Extended Profiles for Overclocking). Without this enabled, high-speed RAM will run at standard baseline JEDEC speeds (e.g. 4800 MT/s instead of 6000 MT/s).",
      },
    ],
  },
];

const TRIAGE_SYMPTOMS = [
  {
    symptom: "Completely Dead: No lights, no fan spin on power button press",
    urgency: "HIGH",
    color: "#ef4444",
    cause: "Power Delivery Path Broken",
    action: "1. Verify the rocker switch on the PSU rear is flipped to 'I' (ON).\n2. Confirm the 24-pin ATX and 8-pin EPS motherboard power connectors are latched.\n3. Check the front panel POWER SW header leads on the bottom-right of the motherboard.\n4. Test wall outlet with a lamp or phone charger.",
  },
  {
    symptom: "Fans and RGB turn on, but monitor says 'No Signal'",
    urgency: "MEDIUM",
    color: "#f59e0b",
    cause: "Display Path or Memory Training",
    action: "1. Move monitor cable directly into discrete GPU port.\n2. On modern AM5/DDR5 platforms, the first boot memory training can take up to 2-3 minutes; wait before power cycling!\n3. Reseat RAM into slots 2 & 4 with firm pressure.\n4. Check the white VGA debug LED on the motherboard.",
  },
  {
    symptom: "PC starts for 3-5 seconds then immediately shuts down (Power Cycle Loop)",
    urgency: "HIGH",
    color: "#ef4444",
    cause: "Short Circuit Protection or Thermal Cutoff",
    action: "1. Verify CPU cooler is mounted with thermal paste; bare CPUs hit 105°C and emergency shut down in seconds.\n2. Remove plastic peel from the cooler copper cold plate.\n3. Verify extra motherboard standoffs aren't shorting the back of the PCB against the chassis frame.\n4. Reseat EPS 12V CPU cables.",
  },
  {
    symptom: "PC boots into BIOS, but M.2 NVMe SSD is not detected",
    urgency: "LOW",
    color: "#38bdf8",
    cause: "Drive Seating or M.2 Lane Sharing",
    action: "1. Power down and reseat the M.2 SSD into the top CPU-direct slot (M2_1).\n2. Fasten the retention standoff screw or EZ-latch.\n3. Ensure CSM/Legacy mode is disabled and UEFI Boot is active in BIOS.",
  },
];

export default function HelpSupport() {
  const [activeTab, setActiveTab] = useState("compatibility");
  const [openAccordions, setOpenAccordions] = useState({ 0: true });
  const [bobSpeech, setBobSpeech] = useState(null);
  const [activeTriage, setActiveTriage] = useState(0);

  const toggleAccordion = (index) => {
    soundManager.snap();
    setOpenAccordions((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleQuickQuestion = (item) => {
    soundManager.interact();
    setBobSpeech(item.bobResponse);
    setActiveTab(item.targetTab);
    setOpenAccordions({ [item.targetItem]: true });

    // Smooth scroll down to the FAQ accordion card
    const el = document.getElementById("faq-knowledge-base");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const currentCategory =
    SUPPORT_CATEGORIES.find((c) => c.id === activeTab) || SUPPORT_CATEGORIES[0];

  return (
    <div className="help-support-page">
      {/* ── BACKGROUND CYBERNETIC GRID & GLOW ── */}
      <div className="help-bg-grid" aria-hidden="true" />
      <div className="help-glow-orb help-glow-1" aria-hidden="true" />
      <div className="help-glow-orb help-glow-2" aria-hidden="true" />

      <div className="help-container">
        {/* ── HERO BANNER WITH B.O.B. ── */}
        <section className="help-hero-card">
          <div className="help-hero-content">
            <div className="help-hero-eyebrow">
              <span className="help-badge-pulse" />
              BUILDLAB INTELLIGENCE &amp; SUPPORT DECK
            </div>
            <h1 className="help-hero-title">
              Hardware Assistance &amp; System Triage
            </h1>
            <p className="help-hero-desc">
              Have questions about hardware compatibility, assembly protocols, 3D Studio navigation,
              or first-boot POST diagnostics? B.O.B. is here with instant answers and comprehensive
              troubleshooting guides.
            </p>

            {/* Quick Diagnostic Chips that trigger B.O.B. speech */}
            <div className="help-chips-wrap">
              <span className="help-chips-label">Common Queries:</span>
              <div className="help-chips-list">
                {QUICK_DIAGNOSTICS.map((diag) => (
                  <button
                    key={diag.id}
                    className="help-quick-chip"
                    onClick={() => handleQuickQuestion(diag)}
                  >
                    <span className="chip-bullet">✦</span>
                    {diag.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── INTERACTIVE SYSTEM TRIAGE MATRIX ── */}
        <section className="help-triage-section">
          <div className="section-head-bar">
            <div className="section-title-group">
              <span className="section-eyebrow">RAPID HARDWARE TRIAGE</span>
              <h2 className="section-heading">First-Boot Fault Diagnostic</h2>
            </div>
            <span className="triage-guide-pill">Interactive Emergency Guide</span>
          </div>

          <div className="triage-grid">
            <div className="triage-symptom-column">
              <span className="column-label">Select Your Issue:</span>
              <div className="symptom-btn-stack">
                {TRIAGE_SYMPTOMS.map((item, idx) => (
                  <button
                    key={idx}
                    className={`symptom-card-btn ${activeTriage === idx ? "active" : ""}`}
                    onClick={() => {
                      soundManager.click();
                      setActiveTriage(idx);
                    }}
                  >
                    <div className="symptom-btn-header">
                      <span
                        className="symptom-urgency-dot"
                        style={{ background: item.color, boxShadow: `0 0 8px ${item.color}` }}
                      />
                      <span className="symptom-urgency-text">{item.urgency} PRIORITY</span>
                    </div>
                    <p className="symptom-text">{item.symptom}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="triage-solution-column">
              <span className="column-label">Root Cause &amp; Prescribed Fix:</span>
              <div className="solution-display-card">
                <div className="solution-header">
                  <span className="cause-badge">SUSPECT: {TRIAGE_SYMPTOMS[activeTriage].cause}</span>
                  <button
                    className="solution-ask-bob-btn"
                    onClick={() => {
                      soundManager.interact();
                      setBobSpeech(`For ${TRIAGE_SYMPTOMS[activeTriage].cause}: Check step 1 first! Take your time and make sure all cables are fully seated.`);
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M12 16v-4"></path>
                      <path d="M12 8h.01"></path>
                    </svg>
                    Ask B.O.B. About This
                  </button>
                </div>

                <div className="solution-steps-body">
                  <pre className="solution-pre-text">
                    {TRIAGE_SYMPTOMS[activeTriage].action}
                  </pre>
                </div>

                <div className="solution-footer-strip">
                  <span className="safe-badge">✓ Always disconnect power cable from wall before touching components</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ACCORDIONS WITH CATEGORY TABS ── */}
        <section id="faq-knowledge-base" className="help-faq-section">
          <div className="section-head-bar">
            <div className="section-title-group">
              <span className="section-eyebrow">BUILDLAB KNOWLEDGE BASE</span>
              <h2 className="section-heading">Frequently Asked Questions</h2>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="faq-category-tabs">
            {SUPPORT_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                className={`faq-cat-tab ${activeTab === cat.id ? "active" : ""}`}
                onClick={() => {
                  soundManager.click();
                  setActiveTab(cat.id);
                  setOpenAccordions({ 0: true });
                }}
              >
                <span className="tab-icon">{cat.icon}</span>
                <span className="tab-text">{cat.name}</span>
              </button>
            ))}
          </div>

          {/* Accordion Questions */}
          <div className="faq-accordion-list">
            {currentCategory.items.map((item, index) => {
              const isOpen = !!openAccordions[index];
              return (
                <div
                  key={index}
                  className={`faq-accordion-item ${isOpen ? "open" : ""}`}
                >
                  <button
                    className="faq-question-btn"
                    onClick={() => toggleAccordion(index)}
                    aria-expanded={isOpen}
                  >
                    <span className="q-number">0{index + 1}</span>
                    <span className="q-title">{item.question}</span>
                    <span className="q-toggle-icon">{isOpen ? "−" : "+"}</span>
                  </button>
                  {isOpen && (
                    <div className="faq-answer-pane animate-fade-in">
                      <p className="faq-answer-text">{item.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── SYSTEM EXPLORATION NAVIGATION CARDS ── */}
        <section className="help-nav-cards-section">
          <div className="help-nav-card">
            <div className="nav-card-icon-wrap emerald">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
            </div>
            <div className="nav-card-text">
              <h3>3D Builder &amp; Studio</h3>
              <p>Simulate hands-on assembly, rotate parts in 360°, and experiment with RGB lighting.</p>
            </div>
            <Link to="/3d-builder" className="nav-card-action-btn">
              Launch Studio →
            </Link>
          </div>

          <div className="help-nav-card">
            <div className="nav-card-icon-wrap cyan">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
            </div>
            <div className="nav-card-text">
              <h3>Interactive Learning Modules</h3>
              <p>Follow our structured courses with video tutorials, interactive quizzes, and micro-lessons.</p>
            </div>
            <Link to="/learn" className="nav-card-action-btn">
              Explore Courses →
            </Link>
          </div>

          <div className="help-nav-card">
            <div className="nav-card-icon-wrap amber">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 14 14"></polyline>
              </svg>
            </div>
            <div className="nav-card-text">
              <h3>Real-Time Compatibility</h3>
              <p>Verify socket matchups, power envelopes, clearance dimensions, and memory compatibility.</p>
            </div>
            <Link to="/compatibility" className="nav-card-action-btn">
              Check Specs →
            </Link>
          </div>
        </section>
      </div>

      {/* ── FLOATING B.O.B. COMPANION (Follows user throughout diagnostic deck) ── */}
      <BobCompanion
        speechLines={BOB_HELP_PHRASES}
        externalSpeech={bobSpeech}
        size={112}
      />
    </div>
  );
}