/**
 * BuildLab CSS (Computer Systems Servicing) Pre-Lab Curriculum
 * 6 Hierarchical Modules • 19 Sequential Topics
 * Aligned with Grade 11 CSS DepEd / TESDA Standards
 */

export const CSS_CURRICULUM = [
  {
    id: "m1",
    moduleNum: 1,
    title: "Lab Safety & Hardware Handling",
    description: "Personal protective equipment, static prevention, safe handling, and proper tool usage.",
    topics: [
      {
        id: "1.1-esd-prep",
        topicCode: "1.1",
        title: "ESD & Workspace Prep",
        moduleNum: 1,
        moduleTitle: "Lab Safety & Hardware Handling",
        specimenKey: "composite",
        hotspotId: null,
        youtubeId: "BL4DCEp7blY",
        videoTitle: "PC Building Safety, ESD Grounding & Workspace Setup",
        explanation:
          "Electrostatic discharge (ESD) can destroy delicate silicon microchips with voltages too low for humans to feel. Always assemble on a clean, non-conductive surface like bare wood or an anti-static mat, and ground yourself regularly by touching an unpainted metal surface on the plugged-in (switched OFF) PSU chassis.",
        fieldFact: {
          title: "Safe Work Surfaces & Grounding",
          badge: "SAFETY CHECKLIST",
          items: [
            { label: "Bare Wood / Silicone Mat", value: "Recommended — non-conductive and static safe", tag: "SAFE", color: "#10b981" },
            { label: "Cardboard Mobo Box", value: "Ideal test-bench surface for pre-assembly", tag: "SAFE", color: "#10b981" },
            { label: "Anti-Static Bag Exterior", value: "Never assemble on top — outside is conductive", tag: "HAZARD", color: "#ef4444" },
            { label: "Carpet / Rugs / Socks", value: "Generates high static friction; avoid entirely", tag: "HAZARD", color: "#ef4444" }
          ]
        },
        mistakeWarning: {
          title: "Avoid This Mistake in Lab",
          desc: "Assembling on the shiny exterior of the motherboard's anti-static bag. The outside is designed with a conductive carbon/metallic coating to divert static around it, which can short out solder points and battery terminals underneath the motherboard."
        },
        quiz: {
          question: "A student is setting up their CSS workstation. Which surface is the SAFEST place to place the motherboard during initial assembly?",
          options: [
            { text: "On top of the non-conductive cardboard motherboard retail box", correct: true },
            { text: "On the shiny exterior of the silver anti-static bag", correct: false },
            { text: "Directly on a plush carpeted floor", correct: false },
            { text: "On a bare steel cookie sheet for grounding", correct: false }
          ],
          explanation: "The cardboard retail box is non-conductive, clean, and rigid—making it the ideal test bench surface for safe pre-assembly."
        }
      },
      {
        id: "1.2-safe-handling",
        topicCode: "1.2",
        title: "Safe Handling Zones",
        moduleNum: 1,
        moduleTitle: "Lab Safety & Hardware Handling",
        specimenKey: "motherboard",
        hotspotId: "sys-cpu",
        youtubeId: "PrXwe21biJo",
        videoTitle: "Proper Handling of Motherboards and Delicate Sockets",
        explanation:
          "Silicon dies and circuit boards have delicate gold contact pads and surface-mount capacitors. Hold components strictly by their outer fiberglass PCB edges and metallic heatsinks—never touch raw socket pins, CPU contact pads, or RAM gold fingers with your bare oily fingers.",
        fieldFact: {
          title: "Component Grip Reference",
          badge: "FIELD REFERENCE",
          items: [
            { label: "Metal VRM Heatsinks", value: "Safe handling anchor with zero electrical risk", tag: "OK", color: "#10b981" },
            { label: "Outer Fiberglass PCB", value: "Grip edges firmly without touching solder points", tag: "OK", color: "#10b981" },
            { label: "Gold Contact Fingers", value: "Skin oils cause oxidation; never touch directly", tag: "NEVER", color: "#ef4444" },
            { label: "Socket LGA Pins", value: "Microscopic brass springs; touch ruins the board", tag: "NEVER", color: "#ef4444" }
          ]
        },
        mistakeWarning: {
          title: "Avoid This Mistake in Lab",
          desc: "Touching the gold fingers on a RAM stick or PCIe graphics card with bare fingers. Natural skin oils cause oxidation over time, leading to memory read parity crashes and intermittent Blue Screens of Death (BSOD)."
        },
        quiz: {
          question: "When lifting a motherboard out of its retail box, where should you place your hands?",
          options: [
            { text: "By the reinforced outer PCB edges and the sturdy metal VRM heatsink", correct: true },
            { text: "By grabbing the delicate capacitor cylinders directly", correct: false },
            { text: "By lifting from the CPU socket latch and RAM retention clips", correct: false },
            { text: "By grasping the rear 3.5mm audio ports", correct: false }
          ],
          explanation: "Always lift by the reinforced fiberglass edges or large solid metal heatsinks to avoid shearing off tiny surface-mount capacitors."
        }
      },
      {
        id: "1.3-screws-tools",
        topicCode: "1.3",
        title: "Screws & Tools",
        moduleNum: 1,
        moduleTitle: "Lab Safety & Hardware Handling",
        specimenKey: "case",
        hotspotId: null,
        youtubeId: "ExxFxD4OSZ0",
        videoTitle: "Essential Screwdrivers, Fasteners & Mounting Standards",
        explanation:
          "Standard PC assembly requires only a #2 Phillips magnetic screwdriver and proper screw threading. Never force a mismatched screw into a standoff or chassis bracket—cross-threading strips the soft brass and aluminum mounting points permanently.",
        fieldFact: {
          title: "Standard Fastener Chart",
          badge: "FASTENER GUIDE",
          items: [
            { label: "6-32 Coarse Screw", value: "PSU mounting, 3.5\" HDD bays, and PCIe brackets", tag: "COARSE", color: "#38bdf8" },
            { label: "M3 Fine Screw", value: "2.5\" SSDs, optical drives, and motherboard standoffs", tag: "FINE", color: "#00e5a0" },
            { label: "M2 Tiny Screw", value: "M.2 NVMe SSD hold-down latch", tag: "MICRO", color: "#f59e0b" },
            { label: "#2 Phillips (PH2)", value: "Universal magnetic screwdriver for 95% of PC assembly", tag: "TOOL", color: "#a855f7" }
          ]
        },
        mistakeWarning: {
          title: "Avoid This Mistake in Lab",
          desc: "Forcing a 6-32 coarse screw into a fine M3 motherboard standoff or using an electric drill. This cross-threads and strips the brass standoff, leaving the motherboard loose and prone to vibrating electrical shorts."
        },
        quiz: {
          question: "Which screwdriver is the universal standard for almost all PC assembly screws?",
          options: [
            { text: "#2 Phillips (PH2) magnetic tip screwdriver", correct: true },
            { text: "Flathead slot screwdriver", correct: false },
            { text: "T15 Torx security bit screwdriver", correct: false },
            { text: "Cordless power drill with hex driver bit", correct: false }
          ],
          explanation: "A magnetic #2 Phillips screwdriver fits 95% of PC case, motherboard, and bracket screws perfectly without stripping screw heads."
        }
      }
    ]
  },
  {
    id: "m2",
    moduleNum: 2,
    title: "Core Components & Physical Keying",
    description: "Processor sockets, motherboard standoffs, dual-channel RAM, and M.2 NVMe storage installation.",
    topics: [
      {
        id: "2.1-cpu-sockets",
        topicCode: "2.1",
        title: "Processor & Sockets",
        moduleNum: 2,
        moduleTitle: "Core Components & Physical Keying",
        specimenKey: "cpu",
        hotspotId: "sys-cpu",
        youtubeId: "16zrEPOsIcI",
        videoTitle: "Branch Education: How do CPUs Work & Socket Alignment",
        explanation:
          "Modern processors use Zero Insertion Force (ZIF) sockets. Look for the golden alignment triangle on one corner of the CPU and match it directly with the dot/arrow printed on the motherboard socket. A properly aligned CPU drops into place freely under its own weight.",
        fieldFact: {
          title: "Socket Architecture Standards",
          badge: "PIN ARCHITECTURE",
          items: [
            { label: "LGA (Land Grid Array)", value: "Intel & AMD AM5 — pins are on motherboard, pads on CPU", tag: "LGA", color: "#38bdf8" },
            { label: "PGA (Pin Grid Array)", value: "Older AMD AM4 — pins are on CPU bottom, holes on socket", tag: "PGA", color: "#f59e0b" },
            { label: "Golden Triangle", value: "Keyed pin 1 indicator on CPU corner and socket frame", tag: "KEY", color: "#00e5a0" },
            { label: "Zero Insertion Force", value: "Never apply downward pressure to seat a processor", tag: "ZIF", color: "#10b981" }
          ]
        },
        mistakeWarning: {
          title: "Avoid This Mistake in Lab",
          desc: "Pressing down or forcing a CPU into the socket. A properly aligned CPU drops in freely under its own weight. Forcing it bends or snaps socket pins, ruining the entire motherboard."
        },
        quiz: {
          question: "What should you do if the CPU does not drop completely flat into the motherboard socket?",
          options: [
            { text: "Lift it straight up gently and re-check that the golden alignment triangles match", correct: true },
            { text: "Press firmly on the metal heat spreader until it snaps down", correct: false },
            { text: "Close and force the retention lever down anyway", correct: false },
            { text: "Wiggle the CPU side to side until it settles into the socket", correct: false }
          ],
          explanation: "ZIF sockets require zero pressure. If it doesn't drop flat, alignment is off—forcing it will crush the socket pins."
        }
      },
      {
        id: "2.2-motherboard-standoffs",
        topicCode: "2.2",
        title: "Motherboard & Standoffs",
        moduleNum: 2,
        moduleTitle: "Core Components & Physical Keying",
        specimenKey: "motherboard",
        hotspotId: null,
        youtubeId: "b2pd3Y6aBag",
        videoTitle: "PowerCert: Motherboards Explained & Form Factors",
        explanation:
          "Brass standoffs elevate the motherboard 5mm off the metal case tray, preventing thousands of live electrical solder traces from shorting against the chassis. Match standoffs strictly to your motherboard's form factor (ATX, Micro-ATX, or Mini-ITX).",
        fieldFact: {
          title: "Motherboard Form Factor Grid",
          badge: "FORM FACTORS",
          items: [
            { label: "Standard ATX", value: "12\" x 9.6\" (305 x 244mm) — 9 Standoff mounting holes", tag: "ATX", color: "#38bdf8" },
            { label: "Micro-ATX (mATX)", value: "9.6\" x 9.6\" (244 x 244mm) — 6 to 8 Standoff holes", tag: "mATX", color: "#00e5a0" },
            { label: "Mini-ITX", value: "6.7\" x 6.7\" (170 x 170mm) — 4 Corner standoffs only", tag: "ITX", color: "#f59e0b" },
            { label: "I/O Shield", value: "Install into case rear frame BEFORE motherboard is dropped in", tag: "RULE", color: "#ef4444" }
          ]
        },
        mistakeWarning: {
          title: "Avoid This Mistake in Lab",
          desc: "Leaving an extra unused brass standoff screwed into the case tray beneath the motherboard. The stray metal peg will short out circuit traces under the board, causing instant shutdown or permanent VRM failure."
        },
        quiz: {
          question: "What happens if you screw a motherboard directly to the metal case tray without installing standoffs?",
          options: [
            { text: "The solder pins underneath touch the metal case, creating a dead short that prevents booting or fries components", correct: true },
            { text: "The board will run cooler because the metal case acts as a heatsink", correct: false },
            { text: "The Wi-Fi antenna reception is improved", correct: false },
            { text: "It only affects the front audio jack sound quality", correct: false }
          ],
          explanation: "Standoffs are mandatory electrical insulators and mounting anchors. Without them, the bare solder contacts short out directly against the chassis steel."
        }
      },
      {
        id: "2.3-ram-dual-channel",
        topicCode: "2.3",
        title: "Memory RAM & Dual-Channel",
        moduleNum: 2,
        moduleTitle: "Core Components & Physical Keying",
        specimenKey: "ram",
        hotspotId: "sys-ram",
        youtubeId: "7J7X7aZvMXQ",
        videoTitle: "Branch Education: How does Computer RAM Work?",
        explanation:
          "Dual-channel memory doubles memory bus bandwidth between the CPU and RAM from 64-bit to 128-bit. When installing two memory sticks on a standard 4-slot motherboard, always populate slots 2 and 4 (labeled A2 and B2) to enable optimal dual-channel performance.",
        fieldFact: {
          title: "Slot Configuration Rules",
          badge: "MEMORY ARCHITECTURE",
          items: [
            { label: "Dual-Channel (2 Sticks)", value: "Populate Slots 2 & 4 (A2 & B2) for 128-bit bandwidth", tag: "128-BIT", color: "#10b981" },
            { label: "Single-Channel (Wrong)", value: "Slots 1 & 2 side-by-side halves memory transfer rate", tag: "64-BIT", color: "#ef4444" },
            { label: "DDR4 vs DDR5 Notch", value: "Notch position is shifted; cannot fit into wrong slot", tag: "KEYED", color: "#38bdf8" },
            { label: "Firm Click", value: "Both retention latches must snap shut automatically", tag: "LOCK", color: "#00e5a0" }
          ]
        },
        mistakeWarning: {
          title: "Avoid This Mistake in Lab",
          desc: "Installing two RAM sticks side-by-side in slots 1 and 2 (A1 and A2). This limits memory to single-channel 64-bit mode, severely bottlenecking CPU gaming, rendering, and virtualization performance."
        },
        quiz: {
          question: "When installing two sticks of RAM on a 4-slot motherboard, which slot configuration correctly activates dual-channel mode?",
          options: [
            { text: "Slots 2 and 4 (A2 and B2, second and fourth away from the CPU)", correct: true },
            { text: "Slots 1 and 2 (A1 and A2, immediately next to each other)", correct: false },
            { text: "Slots 1 and 3 only if DDR4, but slots 1 and 2 for DDR5", correct: false },
            { text: "Any random two slots as long as the clips click", correct: false }
          ],
          explanation: "Motherboard memory traces are routed so slots 2 and 4 provide clean signal integrity for dual-channel operation without stub reflections."
        }
      },
      {
        id: "2.4-storage-m2-keying",
        topicCode: "2.4",
        title: "Storage Drives & M.2 Keying",
        moduleNum: 2,
        moduleTitle: "Core Components & Physical Keying",
        specimenKey: "storage",
        hotspotId: "sys-nvme",
        youtubeId: "BL4DCEp7blY",
        videoTitle: "M.2 NVMe SSD Installation & Thermal Pad Preparation",
        explanation:
          "M.2 NVMe SSDs connect directly to the CPU via PCIe lanes for transfer speeds exceeding 7,000 MB/s. Insert the drive into the M.2 slot at a 30-degree angle, push down gently onto the standoff, and secure with the screw or latch.",
        fieldFact: {
          title: "M.2 Drive Form & Notch Chart",
          badge: "DRIVE STANDARDS",
          items: [
            { label: "2280 Standard Form", value: "22mm wide by 80mm long — desktop standard", tag: "2280", color: "#38bdf8" },
            { label: "M-Key Notch", value: "5 pins separate from 67 pins (PCIe x4 high-speed)", tag: "NVMe", color: "#10b981" },
            { label: "B-Key Notch", value: "6 pins separate (SATA legacy / entry tier)", tag: "SATA", color: "#f59e0b" },
            { label: "Thermal Pad Film", value: "Must peel protective plastic before replacing heatsink", tag: "CRITICAL", color: "#ef4444" }
          ]
        },
        mistakeWarning: {
          title: "Avoid This Mistake in Lab",
          desc: "Leaving the protective blue/clear plastic film on the motherboard's M.2 aluminum heatsink thermal pad. The plastic insulates the SSD, causing it to overheat and throttle to HDD speeds under heavy loads."
        },
        quiz: {
          question: "What crucial step must be taken before reinstalling the metal heatsink over an M.2 NVMe SSD?",
          options: [
            { text: "Peel off the protective plastic film covering the pre-applied thermal pad", correct: true },
            { text: "Apply thermal paste over the M.2 label sticker", correct: false },
            { text: "Wrap the SSD in electrical tape for ESD protection", correct: false },
            { text: "Tighten the screws until the SSD PCB bends slightly", correct: false }
          ],
          explanation: "Leaving the plastic film prevents heat from transferring into the metal heatsink, leading to severe thermal throttling."
        }
      }
    ]
  },
  {
    id: "m3",
    moduleNum: 3,
    title: "Ports, Rear I/O & Motherboard Headers",
    description: "USB color standards, rear I/O connections, display cables, and front panel pin headers.",
    topics: [
      {
        id: "3.1-usb-color-codes",
        topicCode: "3.1",
        title: "USB Color Codes",
        moduleNum: 3,
        moduleTitle: "Ports, Rear I/O & Motherboard Headers",
        specimenKey: "motherboard",
        hotspotId: null,
        youtubeId: "PrXwe21biJo",
        videoTitle: "ExplainingComputers: USB Speeds, Standards & Port Color Codes",
        explanation:
          "USB ports follow universal industry color coding to signal data transfer bandwidth and charging capabilities. Identifying these colors instantly tells technicians which port to choose for high-speed external drives versus simple peripherals.",
        fieldFact: {
          title: "Universal USB Color Coding",
          badge: "COLOR GUIDE",
          items: [
            { label: "Black / White", value: "USB 2.0 (480 Mbps) — ideal for keyboard & mouse", tag: "480M", color: "#94a3b8" },
            { label: "Blue", value: "USB 3.0 / 3.2 Gen 1 (5 Gbps) — external hard drives", tag: "5G", color: "#38bdf8" },
            { label: "Teal / Cyan", value: "USB 3.2 Gen 2 (10 Gbps) — fast NVMe flash storage", tag: "10G", color: "#00e5a0" },
            { label: "Red / Orange", value: "High-Power / Sleep & Charge (10 Gbps + always-on power)", tag: "POWER", color: "#f59e0b" },
            { label: "Type-C (Oval)", value: "Reversible 10–40 Gbps (USB4 & Thunderbolt)", tag: "TYPE-C", color: "#a855f7" }
          ]
        },
        mistakeWarning: {
          title: "Avoid This Mistake in Lab",
          desc: "Plugging an external NVMe backup drive or high-speed bootable flash drive into a black USB 2.0 port. Transfers will be throttled to 40 MB/s instead of 1,000+ MB/s."
        },
        quiz: {
          question: "Which USB port color represents USB 3.0 (SuperSpeed 5 Gbps)?",
          options: [
            { text: "Blue", correct: true },
            { text: "Black", correct: false },
            { text: "White", correct: false },
            { text: "Yellow", correct: false }
          ],
          explanation: "Blue signifies SuperSpeed USB 3.0 (5 Gbps), whereas black/white signifies legacy USB 2.0 (480 Mbps)."
        }
      },
      {
        id: "3.2-backports-explained",
        topicCode: "3.2",
        title: "Motherboard Backports Explained",
        moduleNum: 3,
        moduleTitle: "Ports, Rear I/O & Motherboard Headers",
        specimenKey: "composite",
        hotspotId: "sys-gpu",
        youtubeId: "b2pd3Y6aBag",
        videoTitle: "Motherboard Rear I/O Overview & GPU Display Connections",
        explanation:
          "The motherboard rear I/O panel exposes networking, audio, BIOS flashback buttons, and video outputs. However, when a dedicated graphics card is installed, monitor cables must NEVER connect to the motherboard backports.",
        fieldFact: {
          title: "Rear I/O Subsystem Guide",
          badge: "I/O GUIDE",
          items: [
            { label: "RJ-45 Ethernet", value: "1Gbps / 2.5Gbps high-speed wired networking", tag: "LAN", color: "#38bdf8" },
            { label: "Audio Jacks", value: "Green = Line-Out (Speakers), Pink = Mic-In", tag: "AUDIO", color: "#10b981" },
            { label: "BIOS Flashback", value: "Updates BIOS via USB stick without CPU installed", tag: "FLASH", color: "#f59e0b" },
            { label: "Motherboard HDMI/DP", value: "Only active if CPU has an integrated GPU (iGPU)", tag: "iGPU", color: "#ef4444" },
            { label: "Dedicated GPU Ports", value: "Where monitor cables MUST connect in a gaming rig", tag: "MANDATORY", color: "#00e5a0" }
          ]
        },
        mistakeWarning: {
          title: "Avoid This Mistake in Lab",
          desc: "The #1 rookie mistake in PC building: Plugging the monitor HDMI or DisplayPort cable into the motherboard rear I/O instead of the dedicated graphics card. The screen stays black or uses slow integrated graphics."
        },
        quiz: {
          question: "A student built a gaming PC with a dedicated RTX graphics card, but after powering on, games run at 5 FPS or the screen stays black. What is the most likely mistake?",
          options: [
            { text: "The monitor HDMI cable is plugged into the motherboard rear port instead of the graphics card", correct: true },
            { text: "The power cord was plugged in upside down", correct: false },
            { text: "The mouse was plugged into a blue USB port", correct: false },
            { text: "The RAM sticks are installed in dual-channel", correct: false }
          ],
          explanation: "When a dedicated GPU is installed, display signals output directly from the GPU ports. Connecting to the motherboard bypasses the dedicated GPU completely."
        }
      },
      {
        id: "3.3-internal-headers",
        topicCode: "3.3",
        title: "Internal Headers",
        moduleNum: 3,
        moduleTitle: "Ports, Rear I/O & Motherboard Headers",
        specimenKey: "motherboard",
        hotspotId: null,
        youtubeId: "PrXwe21biJo",
        videoTitle: "Connecting Front Panel Headers, USB 3.0 & Audio Cables",
        explanation:
          "The bottom and side edges of the motherboard contain internal pin headers for front panel power buttons, USB 3.0, HD Audio, and PWM cooling fans. Front panel headers (F_PANEL) use polarized pairs for Power SW, Reset SW, Power LED, and HDD LED.",
        fieldFact: {
          title: "Internal Pin Header Layout",
          badge: "HEADER PINOUTS",
          items: [
            { label: "F_PANEL (9-Pin)", value: "Top: Power LED (+/-), Power SW; Bottom: HDD LED (+/-), Reset SW", tag: "F_PANEL", color: "#00e5a0" },
            { label: "USB 3.0 Header", value: "19-Pin block with plastic alignment notch — fragile pins", tag: "USB 3.0", color: "#38bdf8" },
            { label: "HD_AUDIO", value: "10-1 Pin block (pin 8 missing) for front headphone/mic jacks", tag: "AUDIO", color: "#a855f7" },
            { label: "4-Pin PWM Fans", value: "Pin 1: GND, Pin 2: +12V, Pin 3: Tachometer, Pin 4: Speed Control", tag: "PWM", color: "#f59e0b" }
          ]
        },
        mistakeWarning: {
          title: "Avoid This Mistake in Lab",
          desc: "Misaligning and forcing the front panel USB 3.0 19-pin cable. These pins are extremely thin and brittle; forcing it bends or breaks pins instantly, permanently disabling front case USB ports."
        },
        quiz: {
          question: "Which of the following front panel connectors MUST be oriented with correct positive (+) and negative (-) polarity to function?",
          options: [
            { text: "Power LED and HDD Activity LED", correct: true },
            { text: "Power Switch (Power SW)", correct: false },
            { text: "Reset Switch (Reset SW)", correct: false },
            { text: "Case speaker ground loop", correct: false }
          ],
          explanation: "Switches are momentary contact closures and work in either direction, but LEDs are diodes that only conduct electricity with correct +/- polarity."
        }
      }
    ]
  },
  {
    id: "m4",
    moduleNum: 4,
    title: "Power Supply & Cabling",
    description: "Wattage calculation, 80 PLUS efficiency, mechanically keyed cables, and modular PSU safety.",
    topics: [
      {
        id: "4.1-psu-wattage-ratings",
        topicCode: "4.1",
        title: "Wattage & 80 PLUS Ratings",
        moduleNum: 4,
        moduleTitle: "Power Supply & Cabling",
        specimenKey: "psu",
        hotspotId: null,
        youtubeId: "ot9lIXsRXzo",
        videoTitle: "How a Power Supply ACTUALLY Works & Efficiency Tiers",
        explanation:
          "Power supplies convert high-voltage wall AC (110V/220V) into clean, regulated DC voltage rails (+12V, +5V, +3.3V). The 80 PLUS certification certifies electrical efficiency (reducing wasted heat and energy), ranging from 80+ White (80%) to 80+ Titanium (94%).",
        fieldFact: {
          title: "80 PLUS Efficiency Tiers (50% Load)",
          badge: "EFFICIENCY",
          items: [
            { label: "80 PLUS Bronze", value: "85% Efficient — acceptable entry-level standard", tag: "BRONZE", color: "#d97706" },
            { label: "80 PLUS Gold", value: "90% Efficient — industry sweet spot for reliability", tag: "GOLD", color: "#eab308" },
            { label: "80 PLUS Platinum", value: "92% Efficient — high-end workstation builds", tag: "PLATINUM", color: "#94a3b8" },
            { label: "80 PLUS Titanium", value: "94% Efficient — flagship server-grade efficiency", tag: "TITANIUM", color: "#00e5a0" }
          ]
        },
        mistakeWarning: {
          title: "Avoid This Mistake in Lab",
          desc: "Buying a generic, uncertified budget power supply that lacks Over-Voltage (OVP) and Short-Circuit Protection (SCP). When a cheap PSU fails, it can send raw line voltage through the +12V rail and fry every part in your rig."
        },
        quiz: {
          question: "What does an '80 PLUS Gold' certification on a power supply signify?",
          options: [
            { text: "The PSU operates at 90% electrical efficiency at typical 50% load, wasting less energy as heat", correct: true },
            { text: "The PSU delivers exactly 80 Gold watts of continuous power", correct: false },
            { text: "The internal capacitors are made of solid gold", correct: false },
            { text: "The power supply lasts for exactly 80 months", correct: false }
          ],
          explanation: "80 PLUS measures electrical efficiency—a Gold-rated PSU converts 90% of AC power into DC current, wasting only 10% as dissipated heat."
        }
      },
      {
        id: "4.2-keyed-power-cables",
        topicCode: "4.2",
        title: "Keyed Power Cables",
        moduleNum: 4,
        moduleTitle: "Power Supply & Cabling",
        specimenKey: "psu",
        hotspotId: "sys-vrm",
        youtubeId: "ot9lIXsRXzo",
        videoTitle: "Keyed Power Connectors: 24-Pin, 8-Pin CPU EPS, and PCIe",
        explanation:
          "All PSU cables are mechanically keyed with square and rounded pin housings so they fit only into their intended matching sockets. The 24-pin ATX powers the motherboard chipset, the 4/8-pin EPS powers the CPU, and 6/8-pin PCIe or 12V-2x6 powers the GPU.",
        fieldFact: {
          title: "Connector Identification Guide",
          badge: "CABLE PINOUTS",
          items: [
            { label: "24-Pin ATX Main", value: "Powers motherboard chipset, RAM, and PCIe slots", tag: "24-PIN", color: "#00e5a0" },
            { label: "8-Pin CPU (EPS)", value: "Splits into 4+4 pins — plugs into top-left motherboard", tag: "4+4 CPU", color: "#38bdf8" },
            { label: "8-Pin GPU (PCIe)", value: "Splits into 6+2 pins — plugs directly into graphics card", tag: "6+2 GPU", color: "#f59e0b" },
            { label: "12V-2x6 / 12VHPWR", value: "16-pin micro connector delivering up to 600W to modern GPUs", tag: "ATX 3.0", color: "#a855f7" }
          ]
        },
        mistakeWarning: {
          title: "Avoid This Mistake in Lab",
          desc: "Forcing an 8-pin PCIe cable into the motherboard 8-pin CPU EPS socket (or vice versa). While modern keying prevents this, excessive force can cram it in, reversing 12V and Ground pins and causing a fire hazard or instant motherboard death."
        },
        quiz: {
          question: "How can a student easily distinguish between an 8-pin CPU (EPS) cable and an 8-pin GPU (PCIe) power cable?",
          options: [
            { text: "The CPU cable splits into 4+4 pins, while the PCIe cable splits into 6+2 pins", correct: true },
            { text: "The CPU cable is always bright green and the PCIe cable is red", correct: false },
            { text: "The PCIe cable has 24 pins while the CPU cable has only 4 pins", correct: false },
            { text: "There is no difference; they are completely interchangeable", correct: false }
          ],
          explanation: "An EPS CPU power cable separates into a 4+4 pin configuration, whereas a PCIe GPU cable splits into 6+2 pins."
        }
      },
      {
        id: "4.3-modular-psu-safety",
        topicCode: "4.3",
        title: "Modular PSU Safety",
        moduleNum: 4,
        moduleTitle: "Power Supply & Cabling",
        specimenKey: "psu",
        hotspotId: null,
        youtubeId: "ot9lIXsRXzo",
        videoTitle: "Modular Cable Compatibility & Safety Hazards",
        explanation:
          "Fully modular power supplies let you plug in only the specific cables your build requires, eliminating cable clutter. However, the pinout on the power supply side is NOT standardized across different brands or even different models from the same company!",
        fieldFact: {
          title: "Modular Power Supply Types",
          badge: "MODULAR TIERS",
          items: [
            { label: "Non-Modular", value: "All cables hardwired into PSU chassis permanently", tag: "FIXED", color: "#94a3b8" },
            { label: "Semi-Modular", value: "24-Pin ATX & 8-Pin CPU fixed; PCIe/SATA detachable", tag: "SEMI", color: "#38bdf8" },
            { label: "Fully Modular", value: "Every cable detachable for clean custom routing", tag: "MODULAR", color: "#00e5a0" },
            { label: "PSU Side Pinout", value: "Proprietary per manufacturer; NEVER mix cables", tag: "WARNING", color: "#ef4444" }
          ]
        },
        mistakeWarning: {
          title: "Avoid This Mistake in Lab",
          desc: "Mixing modular cables from different power supplies! Even if the plug physically fits into the PSU, the manufacturer's pin wiring pinout may be reversed. Plugging the wrong brand's modular cable into a drive or GPU will destroy it instantly on power-up."
        },
        quiz: {
          question: "A student upgrades their Corsair power supply with a new Seasonic modular PSU. Can they leave the old Corsair cables in the case and plug them into the new PSU?",
          options: [
            { text: "NO! Modular PSU pinouts on the power supply side are NOT standardized and will fry components", correct: true },
            { text: "YES, all modular black ribbon cables share the universal ATX standard on both ends", correct: false },
            { text: "YES, as long as both power supplies are rated 80 PLUS Gold", correct: false },
            { text: "YES, but only for SATA power cables, not PCIe", correct: false }
          ],
          explanation: "The component end is standardized, but the PSU end has proprietary pinouts. Mixing cables from different manufacturers is a leading cause of dead SSDs and fried GPUs."
        }
      }
    ]
  },
  {
    id: "m5",
    moduleNum: 5,
    title: "Airflow Physics & Cooling Setups",
    description: "Fan blade orientation, intake vs exhaust pressure dynamics, and CPU cooler mounting with thermal paste.",
    topics: [
      {
        id: "5.1-fan-orientation",
        topicCode: "5.1",
        title: "Fan Orientation \"Faces Suck\"",
        moduleNum: 5,
        moduleTitle: "Airflow Physics & Cooling Setups",
        specimenKey: "case",
        hotspotId: null,
        youtubeId: "Ba6w3QdnWBw",
        videoTitle: "JayzTwoCents: How to Optimize Your Case Airflow!",
        explanation:
          "Case fans blow air in one specific direction. Remember the golden PC builder rule: 'Faces Suck'—air enters the open front face (where the brand logo and blades are exposed) and exhausts out through the rear motor bracket (the side with the frame arms and wires).",
        fieldFact: {
          title: "Fan Anatomy & Flow Indicators",
          badge: "AIRFLOW PHYSICS",
          items: [
            { label: "Front Face (Open)", value: "Intake side — air enters here (Faces Suck)", tag: "INTAKE", color: "#38bdf8" },
            { label: "Back Face (Crossbars)", value: "Exhaust side — air exits past motor bracket arms", tag: "EXHAUST", color: "#f59e0b" },
            { label: "Direction Arrows", value: "Most fan frames have embossed arrows showing blade spin and airflow", tag: "GUIDE", color: "#00e5a0" },
            { label: "Front Case Mount", value: "Open face pointing outside to draw cool ambient air in", tag: "SETUP", color: "#10b981" }
          ]
        },
        mistakeWarning: {
          title: "Avoid This Mistake in Lab",
          desc: "Installing all case fans facing inward or all facing outward. If all fans blow out, the case suffers from starvation and negative pressure leaks; if all blow in, hot air is trapped in an overheating thermal loop."
        },
        quiz: {
          question: "Which side of a standard PC chassis fan is the exhaust side (where air exits)?",
          options: [
            { text: "The side with the plastic frame cross-arms and motor support bracket", correct: true },
            { text: "The open side displaying the manufacturer's shiny logo sticker", correct: false },
            { text: "Whichever side has the RGB lighting rings", correct: false },
            { text: "Fans automatically change airflow direction depending on temperature", correct: false }
          ],
          explanation: "Air flows in through the open blade face and exhausts out the side reinforced with the plastic motor cross-frame arms."
        }
      },
      {
        id: "5.2-case-airflow-pressure",
        topicCode: "5.2",
        title: "Case Airflow & Pressure Setups",
        moduleNum: 5,
        moduleTitle: "Airflow Physics & Cooling Setups",
        specimenKey: "case",
        hotspotId: null,
        youtubeId: "Ba6w3QdnWBw",
        videoTitle: "Positive vs Negative Air Pressure & Dust Prevention",
        explanation:
          "Case airflow should move in a smooth, continuous path: fresh air pulled in from the front and bottom, and heated air exhausted out through the top and rear. Maintaining slight positive pressure (more intake CFM than exhaust CFM) prevents dust from being sucked in through cracks.",
        fieldFact: {
          title: "Chassis Pressure Dynamics",
          badge: "PRESSURE TYPES",
          items: [
            { label: "Positive Pressure", value: "Intake > Exhaust: pushes clean air OUT of unsealed seams; dust stays out", tag: "BEST", color: "#10b981" },
            { label: "Negative Pressure", value: "Exhaust > Intake: pulls dusty room air through unfiltered case cracks", tag: "POOR", color: "#ef4444" },
            { label: "Neutral Balance", value: "Intake = Exhaust: clean laminar flow through chassis tunnel", tag: "GOOD", color: "#38bdf8" },
            { label: "Dust Filters", value: "Always place magnetic fine-mesh filters on all intake fans", tag: "FILTER", color: "#00e5a0" }
          ]
        },
        mistakeWarning: {
          title: "Avoid This Mistake in Lab",
          desc: "Setting up strong negative air pressure in a dusty room. The case acts like a vacuum cleaner, sucking dust and pet hair into every unfiltered mesh seam and PCIe bracket gap."
        },
        quiz: {
          question: "Why do professional PC technicians recommend a 'positive pressure' airflow configuration?",
          options: [
            { text: "Filtered intake air exceeds exhaust, forcing air OUT of unfiltered gaps and preventing dust accumulation", correct: true },
            { text: "Positive pressure forces the CPU clock speeds to automatically overclock by 10%", correct: false },
            { text: "It creates a complete vacuum inside the chassis to eliminate friction", correct: false },
            { text: "Negative pressure produces harmful static electricity", correct: false }
          ],
          explanation: "With more intake than exhaust, excess air pushes out of unfiltered case cracks, keeping internal components significantly cleaner over time."
        }
      },
      {
        id: "5.3-coolers-thermal-paste",
        topicCode: "5.3",
        title: "CPU Coolers & Thermal Paste",
        moduleNum: 5,
        moduleTitle: "Airflow Physics & Cooling Setups",
        specimenKey: "cpu",
        hotspotId: "sys-cpu",
        youtubeId: "ExxFxD4OSZ0",
        videoTitle: "Thermal Paste Application & Heatsink Installation",
        explanation:
          "Thermal paste fills microscopic air gaps between the CPU's nickel-plated heat spreader and the cooler's copper baseplate. Air is a poor thermal conductor, while thermal compound allows heat to transfer efficiently into the heatsink fins.",
        fieldFact: {
          title: "Thermal Interface Rules",
          badge: "THERMAL GUIDE",
          items: [
            { label: "Pea / Dot Method", value: "4-5mm center drop; spreads evenly under cooler mounting pressure", tag: "POPULAR", color: "#10b981" },
            { label: "X-Pattern Method", value: "Best coverage for large rectangular heat spreaders (AM5 & LGA1700)", tag: "BEST", color: "#00e5a0" },
            { label: "Peel The Plastic", value: "Cooler baseplate plastic sticker MUST be removed before mounting", tag: "CRITICAL", color: "#ef4444" },
            { label: "Cross-Tighten", value: "Tighten mounting screws diagonally in an X pattern to balance pressure", tag: "TORQUE", color: "#38bdf8" }
          ]
        },
        mistakeWarning: {
          title: "Avoid This Mistake in Lab",
          desc: "Forgetting to peel the clear protective sticker off the bottom of the CPU cooler heatsink. This common mistake leaves plastic trapped between the CPU and cooler, causing the CPU to reach 100°C and thermal throttle instantly upon boot."
        },
        quiz: {
          question: "A student just built their PC, but the CPU temperature jumps to 95°C idling in BIOS and the PC shuts down after two minutes. What is the most likely cause?",
          options: [
            { text: "The protective clear plastic peel film on the bottom of the cooler heatsink was left on", correct: true },
            { text: "Thermal paste was applied in a cross pattern instead of a pea dot", correct: false },
            { text: "The CPU fan was connected to the motherboard CPU_FAN header", correct: false },
            { text: "The case intake fans are spinning at 1200 RPM", correct: false }
          ],
          explanation: "Leaving the transparent protective sticker on the cooler's copper plate completely blocks heat transfer into the heatsink."
        }
      }
    ]
  },
  {
    id: "m6",
    moduleNum: 6,
    title: "Assembly Sequence & Pre-Boot (POST)",
    description: "Out-of-case bench testing, step-by-step assembly sequence, and reading EZ Debug diagnostic LEDs.",
    topics: [
      {
        id: "6.1-bench-testing",
        topicCode: "6.1",
        title: "Out-of-Case Bench Testing",
        moduleNum: 6,
        moduleTitle: "Assembly Sequence & Pre-Boot (POST)",
        specimenKey: "motherboard",
        hotspotId: null,
        youtubeId: "ExxFxD4OSZ0",
        videoTitle: "Out-of-Case Motherboard Breadboard Testing (POST)",
        explanation:
          "Before screwing all parts into the case, professional technicians perform a 'breadboard' bench test on top of the motherboard box. Installing just the CPU, cooler, 1 stick of RAM, GPU, and PSU lets you verify POST and BIOS display in 10 minutes without troubleshooting inside a cramped case.",
        fieldFact: {
          title: "Minimal Bench Test Checklist",
          badge: "TEST PROTOCOL",
          items: [
            { label: "Motherboard on Box", value: "Cardboard retail box acts as an insulated test platform", tag: "STEP 1", color: "#38bdf8" },
            { label: "Core Silicon", value: "CPU + Cooler plugged into CPU_FAN header", tag: "STEP 2", color: "#00e5a0" },
            { label: "1 Stick of RAM", value: "Insert in Slot 2 (A2) to eliminate multi-stick variables", tag: "STEP 3", color: "#10b981" },
            { label: "Power Connections", value: "24-Pin ATX + 8-Pin CPU EPS cables connected from PSU", tag: "STEP 4", color: "#f59e0b" },
            { label: "Short Power Pins", value: "Tap the two Power SW pins with a flat screwdriver to power on", tag: "STEP 5", color: "#a855f7" }
          ]
        },
        mistakeWarning: {
          title: "Avoid This Mistake in Lab",
          desc: "Fully assembling a complex build with custom cable routing and water cooling inside the case before testing. If a part is DOA (Dead on Arrival), diagnosing and removing it takes hours of disassembly."
        },
        quiz: {
          question: "Why is it best practice to test core components outside the PC case on the motherboard box before full installation?",
          options: [
            { text: "It verifies that the CPU, RAM, and GPU successfully POST, saving hours of troubleshooting if a part is defective", correct: true },
            { text: "Motherboards require 24 hours of ambient oxygen exposure to cure the solder", correct: false },
            { text: "It calibrates the BIOS battery before case grounding", correct: false },
            { text: "Components cannot fit through the case door unless pre-tested", correct: false }
          ],
          explanation: "An out-of-case bench test quickly isolates DOA hardware before you spend time routing cables, installing fans, and mounting standoffs."
        }
      },
      {
        id: "6.2-optimal-build-order",
        topicCode: "6.2",
        title: "Optimal Build Order",
        moduleNum: 6,
        moduleTitle: "Assembly Sequence & Pre-Boot (POST)",
        specimenKey: "composite",
        hotspotId: null,
        youtubeId: "ExxFxD4OSZ0",
        videoTitle: "Bitwit: How to Build a PC Step-by-Step",
        explanation:
          "Assembling in the correct logical sequence prevents cramped hands and blocked screw holes. Install the CPU, M.2 SSDs, RAM, and CPU cooler brackets onto the motherboard outside the case first; mount fans, power supply, and motherboard inside; and install the bulky graphics card LAST.",
        fieldFact: {
          title: "The 6-Step Installation Sequence",
          badge: "BUILD WORKFLOW",
          items: [
            { label: "1. Prep Motherboard", value: "Install CPU, M.2 SSDs, RAM & cooler brackets on box", tag: "PRE-CASE", color: "#00e5a0" },
            { label: "2. Case Prep", value: "Install I/O shield, standoffs, and mount case fans", tag: "CASE", color: "#38bdf8" },
            { label: "3. Mount Power Supply", value: "Install PSU in basement and pre-route CPU 8-pin cable", tag: "POWER", color: "#f59e0b" },
            { label: "4. Mount Motherboard", value: "Lower into standoffs and tighten center screws first", tag: "MOUNT", color: "#10b981" },
            { label: "5. Header Wiring", value: "Connect F_PANEL, USB 3.0, Audio, and 24-Pin ATX cables", tag: "CABLES", color: "#a855f7" },
            { label: "6. Graphics Card LAST", value: "Remove PCIe slot covers, click GPU into slot, plug power", tag: "FINALE", color: "#ef4444" }
          ]
        },
        mistakeWarning: {
          title: "Avoid This Mistake in Lab",
          desc: "Installing the massive graphics card before plugging in the bottom motherboard headers (F_PANEL, HD_AUDIO, USB). The GPU's 3-slot cooler blocks physical hand access to the bottom pins completely."
        },
        quiz: {
          question: "Which component should almost always be installed LAST into the case during a PC build?",
          options: [
            { text: "Dedicated Graphics Card (GPU)", correct: true },
            { text: "CPU and cooler", correct: false },
            { text: "M.2 NVMe SSD", correct: false },
            { text: "Motherboard standoffs", correct: false }
          ],
          explanation: "The graphics card is the largest component and spans across the middle of the case; installing it last leaves plenty of clearance for connecting front panel cables, SATA drives, and motherboard power."
        }
      },
      {
        id: "6.3-post-ez-debug-leds",
        topicCode: "6.3",
        title: "Reading POST & EZ Debug LEDs",
        moduleNum: 6,
        moduleTitle: "Assembly Sequence & Pre-Boot (POST)",
        specimenKey: "motherboard",
        hotspotId: null,
        youtubeId: "XzgPUozaiKU",
        videoTitle: "How to Fix a PC That Won't Boot & Reading EZ Debug LEDs",
        explanation:
          "POST (Power-On Self-Test) is the motherboard's initial hardware health diagnostic. Modern motherboards feature four EZ Debug diagnostic LEDs—CPU, DRAM, VGA, and BOOT—that light up sequentially. A light staying permanently ON points you directly to the faulty subsystem.",
        fieldFact: {
          title: "EZ Debug LED Diagnostic Codes",
          badge: "DIAGNOSTIC MATRIX",
          items: [
            { label: "CPU (Red LED)", value: "Processor not detected, power cable missing, or socket pin bent", tag: "CPU", color: "#ef4444" },
            { label: "DRAM (Yellow/Orange)", value: "RAM unseated or incompatible memory speed / training", tag: "DRAM", color: "#f59e0b" },
            { label: "VGA (White LED)", value: "GPU missing, PCIe power unplugged, or monitor not connected", tag: "VGA", color: "#38bdf8" },
            { label: "BOOT (Green LED)", value: "No bootable OS drive found (normal for first boot)", tag: "BOOT", color: "#10b981" }
          ]
        },
        mistakeWarning: {
          title: "Avoid This Mistake in Lab",
          desc: "Panicking and tearing down the whole system when a new build doesn't display video immediately. Modern DDR5 motherboards perform 'memory training' on the first boot, taking up to 2–3 minutes before the display activates."
        },
        quiz: {
          question: "On first startup, the motherboard's EZ Debug LED stops and stays solid YELLOW/ORANGE on 'DRAM'. What should you check first?",
          options: [
            { text: "Power off and firmly reseat the RAM sticks into slots A2 and B2 until both clips click locked", correct: true },
            { text: "Replace the monitor HDMI cable", correct: false },
            { text: "Unplug and replace the power supply immediately", correct: false },
            { text: "Wipe thermal paste off the CPU", correct: false }
          ],
          explanation: "A solid DRAM LED indicates a memory initialization failure, typically caused by unseated RAM sticks or sticks inserted into non-primary slots."
        }
      }
    ]
  }
];

// Flat list of all 19 topics for sequential access and index tracking
export const FLAT_TOPICS = CSS_CURRICULUM.flatMap((mod) =>
  mod.topics.map((t) => ({
    ...t,
    moduleId: mod.id,
    moduleNum: mod.moduleNum,
    moduleTitle: mod.title
  }))
);

export const TOTAL_TOPICS_COUNT = FLAT_TOPICS.length; // 19
export const TOTAL_MODULES_COUNT = CSS_CURRICULUM.length; // 6
