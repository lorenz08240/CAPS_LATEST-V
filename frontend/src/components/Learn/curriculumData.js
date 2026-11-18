/**
 * BuildLab CSS (Computer Systems Servicing) Pre-Lab Curriculum
 * 7 Hierarchical Modules • 21 Sequential Topics
 * Aligned with DepEd Grade 11 CSS / TESDA NC II Standards
 */

export const CSS_CURRICULUM = [
  {
    id: "m1",
    moduleNum: 1,
    title: "Lab Safety, Workspace & Tools",
    description: "Personal protective equipment, static prevention, safe handling, and proper tool usage.",
    topics: [
      {
        id: "1.1-esd-prep",
        topicCode: "1.1",
        title: "ESD & Workspace Prep",
        moduleNum: 1,
        moduleTitle: "Lab Safety, Workspace & Tools",
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
            { label: "Bare Wood / Silicone Mat", value: "Recommended — non-conductive and static safe", tag: "SAFE", color: "#b08d57" },
            { label: "Cardboard Mobo Box", value: "Ideal test-bench surface for pre-assembly", tag: "SAFE", color: "#b08d57" },
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
        moduleTitle: "Lab Safety, Workspace & Tools",
        specimenKey: "composite",
        hotspotId: "sys-cpu",
        youtubeId: "PrXwe21biJo",
        videoTitle: "Proper Handling of Motherboards and Delicate Sockets",
        explanation:
          "Printed Circuit Boards (PCBs) are layered with microscopic copper traces and tiny surface-mount components (SMDs) like capacitors and resistors. Never lift or grip a motherboard by its CPU socket retention lever, cooler mounting brackets, or delicate capacitor cylinders.",
        fieldFact: {
          title: "Grip & Holding Rules",
          badge: "HANDLING PROTOCOL",
          items: [
            { label: "Outer Edge Fiberglass", value: "Grip firmly by bare outer PCB edges", tag: "SAFE", color: "#b08d57" },
            { label: "VRM Metal Heatsink", value: "Solid structural metal; safe lifting point", tag: "SAFE", color: "#b08d57" },
            { label: "Capacitor Cylinders", value: "Never grip — leads will snap from solder pads", tag: "FORBIDDEN", color: "#ef4444" },
            { label: "Socket Pins Area", value: "Keep plastic protective cover installed until CPU drop", tag: "CRITICAL", color: "#ef4444" }
          ]
        },
        mistakeWarning: {
          title: "Avoid This Mistake in Lab",
          desc: "Removing the plastic CPU socket protective cover before having the CPU ready in hand. Any dropped screw or brushed sleeve over an exposed LGA socket will irreparably bend socket pins, permanently ruining a motherboard."
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
        title: "Screws, Standoffs & Assembly Tools",
        moduleNum: 1,
        moduleTitle: "Lab Safety, Workspace & Tools",
        specimenKey: "case",
        hotspotId: null,
        youtubeId: "vBdf2N0_zXo",
        videoTitle: "PC Building Screws, Standoffs and Essential Tools Guide",
        explanation:
          "Desktop computers use three primary screw thread standards: 6-32 coarse screws (for PSU, GPU brackets, and case panels), M3 fine thread screws (for 2.5-inch SSDs and optical drives), and tiny M2 screws for M.2 NVMe drives. Using the wrong thread will strip the metal holes.",
        fieldFact: {
          title: "Essential Hardware Tooling",
          badge: "TOOLING GUIDE",
          items: [
            { label: "#2 Phillips Screwdriver", value: "Universal tool for 95% of PC screws", tag: "PRIMARY", color: "#b08d57" },
            { label: "#1 or #0 Phillips", value: "Required for tiny M.2 SSD mounting screws", tag: "PRECISION", color: "#ffffff" },
            { label: "Brass Hex Standoffs", value: "Elevate PCB 6-8mm off metal case tray", tag: "MANDATORY", color: "#f59e0b" },
            { label: "Magnetic Parts Tray", value: "Prevents loose screws dropping inside case", tag: "HELPFUL", color: "#8b5cf6" }
          ]
        },
        mistakeWarning: {
          title: "Avoid This Mistake in Lab",
          desc: "Using an electric drill or over-torquing screws with excessive force. Overtightening motherboard screws can crush microscopic fiberglass copper traces inside the PCB layers, causing intermittent system freeze-ups and shorts."
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
    title: "The Motherboard (Mainboard Backbone)",
    description: "Form factors, socket architecture, power delivery circuitry, rear I/O, and internal headers.",
    topics: [
      {
        id: "2.1-motherboard-anatomy",
        topicCode: "2.1",
        title: "Motherboard Anatomy & Form Factors",
        moduleNum: 2,
        moduleTitle: "The Motherboard (Mainboard Backbone)",
        specimenKey: "motherboard",
        hotspotId: null,
        youtubeId: "k5i_lE8P0E4",
        videoTitle: "Motherboard Form Factors & Architecture Explained",
        explanation:
          "The motherboard is the primary printed circuit board that interconnects all hardware subsystems. Standard consumer form factors are ATX (305x244mm), Micro-ATX (244x244mm), and Mini-ITX (170x170mm). Standoff screw holes align strictly to these standardized form factor dimensions.",
        fieldFact: {
          title: "Form Factor Standards",
          badge: "FORM FACTORS",
          items: [
            { label: "ATX (Full Size)", value: "305 x 244 mm · 7 expansion slots · 9 standoffs", tag: "STANDARD", color: "#b08d57" },
            { label: "Micro-ATX (mATX)", value: "244 x 244 mm · 4 expansion slots · 6-8 standoffs", tag: "COMPACT", color: "#ffffff" },
            { label: "Mini-ITX (mITX)", value: "170 x 170 mm · 1 expansion slot · 4 standoffs", tag: "SFF", color: "#f59e0b" },
            { label: "Brass Standoffs", value: "Mandatory insulators preventing chassis steel shorts", tag: "CRITICAL", color: "#ef4444" }
          ]
        },
        mistakeWarning: {
          title: "Avoid This Mistake in Lab",
          desc: "Leaving an extra brass standoff screwed into the case tray where the motherboard has no screw hole. That unaligned brass standoff will press directly into the solder traces underneath the board and cause an instant short circuit on power-up."
        },
        quiz: {
          question: "What happens if a metal standoff is installed in the PC case tray where there is NO corresponding screw hole on the motherboard?",
          options: [
            { text: "It presses directly against bottom PCB solder traces, causing an electrical dead short", correct: true },
            { text: "It provides extra grounding that makes the system boot faster", correct: false },
            { text: "It acts as a heatsink to cool down the graphics card", correct: false },
            { text: "Nothing, standoffs are made of non-conductive plastic", correct: false }
          ],
          explanation: "Extra standoffs that do not match mounting holes touch exposed bare PCB solder contacts, causing catastrophic short circuits."
        }
      },
      {
        id: "2.2-chipset-vrm",
        topicCode: "2.2",
        title: "Chipset, Sockets & VRM Power Delivery",
        moduleNum: 2,
        moduleTitle: "The Motherboard (Mainboard Backbone)",
        specimenKey: "motherboard",
        hotspotId: "sys-vrm",
        youtubeId: "p_6q1D6qf5A",
        videoTitle: "Motherboard VRM Phases and Chipsets Demystified",
        explanation:
          "The Voltage Regulator Module (VRM) surrounds the CPU socket and steps down the raw 12V DC input from the power supply into ripple-free, microvolt-level power (1.1V - 1.35V) for the CPU. Large ribbed aluminum heatsinks cover these MOSFETs to keep them cool under load.",
        fieldFact: {
          title: "VRM Components & Power Rails",
          badge: "POWER CIRCUITRY",
          items: [
            { label: "MOSFETs & Power Stages", value: "High-speed electronic switches delivering clean current", tag: "CIRCUIT", color: "#b08d57" },
            { label: "Chokes & Ferrite Cores", value: "Rectangular blocks smoothing current flow", tag: "FILTER", color: "#ffffff" },
            { label: "Solid Capacitors", value: "Silver cylinders storing charge and reducing ripple", tag: "BUFFER", color: "#f59e0b" },
            { label: "8-Pin EPS 12V Connector", value: "Dedicated top-left power feed for the CPU VRM", tag: "SUPPLY", color: "#8b5cf6" }
          ]
        },
        mistakeWarning: {
          title: "Avoid This Mistake in Lab",
          desc: "Forgetting to plug in the 8-pin (or 4+4 pin) EPS CPU power cable at the top-left of the motherboard. Even if the main 24-pin cable is plugged in, the CPU VRM receives 0V, resulting in spinning fans but NO video output (POST failure)."
        },
        quiz: {
          question: "Why does a PC fail to display any video even though the main 24-pin ATX power cable is connected and case fans are spinning?",
          options: [
            { text: "The dedicated 8-pin EPS CPU power cable at the top-left of the motherboard was forgotten", correct: true },
            { text: "The keyboard was plugged into a USB 2.0 port instead of USB 3.0", correct: false },
            { text: "The HDMI cable is plugged into a dedicated graphics card", correct: false },
            { text: "The motherboard needs to warm up for 15 minutes before outputting video", correct: false }
          ],
          explanation: "The 24-pin ATX cable powers the motherboard chipset and PCIe slots, but the CPU relies strictly on the top 8-pin EPS power connector."
        }
      },
      {
        id: "2.3-io-and-headers",
        topicCode: "2.3",
        title: "Rear I/O Backports & Internal Headers",
        moduleNum: 2,
        moduleTitle: "The Motherboard (Mainboard Backbone)",
        specimenKey: "motherboard",
        hotspotId: null,
        youtubeId: "Wc8vQ9p-8yY",
        videoTitle: "Motherboard Rear IO Ports and Front Panel Headers",
        explanation:
          "The motherboard rear I/O cluster provides external connections (USB, LAN, Display, Audio), while bottom pins connect front panel buttons (Power SW, Reset SW, Power LED, HDD LED) and USB 3.0/USB-C header cables from the chassis.",
        fieldFact: {
          title: "Standard USB Port Color Guide",
          badge: "PORT STANDARDS",
          items: [
            { label: "Black USB Type-A", value: "USB 2.0 (480 Mbps) · Keyboards, mice & headsets", tag: "USB 2.0", color: "#64748b" },
            { label: "Blue USB Type-A", value: "USB 3.2 Gen 1 (5 Gbps) · High speed flash drives", tag: "USB 3.0", color: "#ffffff" },
            { label: "Teal / Red USB", value: "USB 3.2 Gen 2 (10 Gbps) · External NVMe SSDs", tag: "USB 3.2", color: "#ef4444" },
            { label: "Front Panel Headers", value: "Power SW, Reset SW, Power LED+, HDD LED", tag: "JFP1", color: "#b08d57" }
          ]
        },
        mistakeWarning: {
          title: "Avoid This Mistake in Lab",
          desc: "Forcing the internal USB 3.0 19-pin header cable into the motherboard. The 19-pin header has tiny fragile pins and a keyed notch. Forcing it at an angle will instantly snap or bend the pins, disabling front USB ports."
        },
        quiz: {
          question: "Which front panel header cables require strict positive (+) and negative (-) polarity alignment to function?",
          options: [
            { text: "Power LED and HDD Activity LED", correct: true },
            { text: "Power Switch (Power SW)", correct: false },
            { text: "Reset Switch (Reset SW)", correct: false },
            { text: "Chassis ground loop pins", correct: false }
          ],
          explanation: "Switches are momentary contact closures and work in either orientation, but LEDs are diodes that only conduct electricity with correct +/- polarity."
        }
      }
    ]
  },
  {
    id: "m3",
    moduleNum: 3,
    title: "Central Processing Unit (CPU) & Cooling",
    description: "Silicon architecture, LGA vs PGA sockets, pin alignment, thermal paste, and cooler mounting.",
    topics: [
      {
        id: "3.1-cpu-silicon-socket",
        topicCode: "3.1",
        title: "CPU Silicon Architecture & Socket Pin Alignment",
        moduleNum: 3,
        moduleTitle: "Central Processing Unit (CPU) & Cooling",
        specimenKey: "cpu",
        hotspotId: "sys-cpu",
        youtubeId: "U4mGZ_2xQyE",
        videoTitle: "How to Install a CPU Without Bending Any Pins",
        explanation:
          "The CPU is the primary calculation brain of the PC. Sockets use either LGA (Land Grid Array, where spring pins are on the motherboard) or PGA (Pin Grid Array, where pins are on the CPU bottom). All CPUs feature a golden triangle mark in one corner that matches the socket's alignment indicator.",
        fieldFact: {
          title: "LGA vs PGA Socket Comparison",
          badge: "SOCKET COMPARISON",
          items: [
            { label: "LGA (Intel & AMD AM5)", value: "Motherboard has delicate gold pins; CPU has flat pads", tag: "LGA", color: "#b08d57" },
            { label: "PGA (Legacy AMD AM4)", value: "CPU has hundreds of needle pins; socket has holes", tag: "PGA", color: "#ffffff" },
            { label: "Golden Triangle", value: "Indicates Pin 1 corner for foolproof orientation", tag: "KEYING", color: "#f59e0b" },
            { label: "Zero Insertion Force (ZIF)", value: "CPU must drop flat by gravity with ZERO force", tag: "RULE", color: "#ef4444" }
          ]
        },
        mistakeWarning: {
          title: "Avoid This Mistake in Lab",
          desc: "Pressing down manually on the CPU heat spreader during socket installation. If the golden triangles do not match or the CPU is tilted, applying downward pressure will crush dozens of gold socket pins, ruining the motherboard."
        },
        quiz: {
          question: "What should you do if the CPU does not drop completely flat into the motherboard socket?",
          options: [
            { text: "Lift it straight up gently and re-check that the golden alignment triangles match", correct: true },
            { text: "Press firmly on the metal heat spreader until it snaps down", correct: false },
            { text: "Close and force the retention lever down anyway", correct: false },
            { text: "Wiggle the CPU side to side until it settles into the socket", correct: false }
          ],
          explanation: "ZIF sockets require zero force. If it doesn't drop flat, alignment is off—forcing it will permanently crush the socket pins."
        }
      },
      {
        id: "3.2-thermal-paste-coolers",
        topicCode: "3.2",
        title: "Thermal Compound & Heatsink Fan Mounting",
        moduleNum: 3,
        moduleTitle: "Central Processing Unit (CPU) & Cooling",
        specimenKey: "cpu",
        hotspotId: "sys-cpu",
        youtubeId: "R73e1h3AeVc",
        videoTitle: "How to Apply Thermal Paste and Mount CPU Coolers Correctly",
        explanation:
          "Microscopic imperfections on the metal surfaces of the CPU integrated heat spreader (IHS) and cooler cold plate trap microscopic air pockets. Thermal paste fills these microscopic gaps because thermal compound conducts heat over 100 times better than air.",
        fieldFact: {
          title: "Thermal Application Rules",
          badge: "COOLING PROTOCOL",
          items: [
            { label: "Pea / Rice Grain Method", value: "Small dot in the center spreads evenly under pressure", tag: "METHOD", color: "#b08d57" },
            { label: "Crisscross Tightening", value: "Screw diagonally 1-2 turns each for even pressure", tag: "TECHNIQUE", color: "#ffffff" },
            { label: "Peel Protective Sticker", value: "Transparent plastic film under cooler MUST be removed", tag: "CRITICAL", color: "#ef4444" },
            { label: "CPU_FAN Header", value: "Plug cooler 4-pin PWM into CPU_FAN, not SYS_FAN", tag: "HEADER", color: "#8b5cf6" }
          ]
        },
        mistakeWarning: {
          title: "Avoid This Mistake in Lab",
          desc: "Leaving the transparent peel-off warning sticker on the bottom of the CPU cooler heatsink. The plastic sticker melts into the socket, blocks thermal conduction, and causes the CPU to throttle to 100°C and trigger thermal shutdown within 15 seconds of boot."
        },
        quiz: {
          question: "What is the single most common cause of an assembled PC immediately overheating to 100°C and shutting down at initial boot?",
          options: [
            { text: "The plastic protective peel sticker on the cooler cold plate was not removed", correct: true },
            { text: "The thermal paste was applied using a pea-sized dot", correct: false },
            { text: "The cooler was plugged into the CPU_FAN header", correct: false },
            { text: "The RAM was installed in dual channel slots", correct: false }
          ],
          explanation: "Leaving the plastic protective film on the bottom of the heatsink acts as a thermal insulator, preventing heat from reaching the cooler."
        }
      }
    ]
  },
  {
    id: "m4",
    moduleNum: 4,
    title: "Memory (RAM) & Solid State Storage (M.2 NVMe)",
    description: "DDR4/DDR5 architecture, dual-channel memory interleaving, M.2 NVMe protocol, and thermal shields.",
    topics: [
      {
        id: "4.1-ram-dual-channel",
        topicCode: "4.1",
        title: "DDR4 / DDR5 RAM & Dual-Channel (A2/B2) Rules",
        moduleNum: 4,
        moduleTitle: "Memory (RAM) & Solid State Storage (M.2 NVMe)",
        specimenKey: "ram",
        hotspotId: "sys-ram",
        youtubeId: "D8A_V5wQx0o",
        videoTitle: "RAM Installation Guide - Dual Channel Slots Explained",
        explanation:
          "Random Access Memory (RAM) serves as the CPU's ultra-fast volatile workspace. Motherboards feature an off-center physical key notch preventing wrong-generation insertion. Dual-channel memory doubles memory bus bandwidth from 64-bit to 128-bit, requiring modules to be seated in slots 2 and 4 (A2 and B2).",
        fieldFact: {
          title: "Dual-Channel Populating Rules",
          badge: "RAM STANDARDS",
          items: [
            { label: "Slot A2 (2nd from CPU)", value: "First DIMM stick destination", tag: "PRIMARY", color: "#b08d57" },
            { label: "Slot B2 (4th from CPU)", value: "Second DIMM stick destination", tag: "PRIMARY", color: "#b08d57" },
            { label: "Off-Center Notch", value: "Keyed slot prevents installing upside down", tag: "KEYING", color: "#ffffff" },
            { label: "Solid End Clicks", value: "Retention wings must snap completely closed on both ends", tag: "SEATING", color: "#f59e0b" }
          ]
        },
        mistakeWarning: {
          title: "Avoid This Mistake in Lab",
          desc: "Installing two RAM sticks in slots 1 and 2 (A1 and A2 next to each other). This forces the memory controller into single-channel 64-bit mode, cutting CPU-to-memory throughput in half and causing stutter in CPU-bound applications."
        },
        quiz: {
          question: "When installing two sticks of RAM on a 4-slot motherboard, which slot configuration correctly activates dual-channel mode?",
          options: [
            { text: "Slots 2 and 4 (A2 and B2, second and fourth away from the CPU)", correct: true },
            { text: "Slots 1 and 2 (A1 and A2, immediately next to each other)", correct: false },
            { text: "Slots 1 and 3 only if DDR4, but slots 1 and 2 for DDR5", correct: false },
            { text: "Any random two slots as long as the clips click", correct: false }
          ],
          explanation: "Motherboard memory traces are routed so slots 2 and 4 provide clean signal integrity for 128-bit dual-channel operation."
        }
      },
      {
        id: "4.2-storage-m2-nvme",
        topicCode: "4.2",
        title: "M.2 NVMe SSDs & High-Speed PCIe Traces",
        moduleNum: 4,
        moduleTitle: "Memory (RAM) & Solid State Storage (M.2 NVMe)",
        specimenKey: "storage",
        hotspotId: "sys-nvme",
        youtubeId: "J8J90s5E-iQ",
        videoTitle: "How to Install M.2 NVMe SSD Correctly",
        explanation:
          "M.2 NVMe solid-state drives connect directly to CPU PCIe lanes at transfer rates up to 7,500+ MB/s, vastly outperforming legacy SATA 2.5-inch SSDs (550 MB/s). They insert at an upward 25-degree angle, swing down flush against a brass standoff, and are secured with an M2 screw or toolless latch.",
        fieldFact: {
          title: "M.2 SSD Installation Protocol",
          badge: "STORAGE TECH",
          items: [
            { label: "25-Degree Entry Angle", value: "Slide golden pins gently into M.2 socket at angle", tag: "STEP 1", color: "#b08d57" },
            { label: "Level Standoff Screw", value: "Drive must lie flat parallel to the motherboard", tag: "STEP 2", color: "#ffffff" },
            { label: "Peel Blue Heatsink Film", value: "Peel plastic protector off motherboard thermal pad", tag: "CRITICAL", color: "#ef4444" },
            { label: "Primary CPU M.2 Slot", value: "Top slot closest to CPU has direct x4 PCIe lanes", tag: "LANES", color: "#8b5cf6" }
          ]
        },
        mistakeWarning: {
          title: "Avoid This Mistake in Lab",
          desc: "Screwing the M.2 SSD directly into the motherboard PCB without the brass standoff underneath. Screwing directly into the board bends the PCB into a steep bow, which can crack internal silicon NAND flash memory chips."
        },
        quiz: {
          question: "Why must the brass standoff nut be in place beneath an M.2 SSD before tightening the retaining screw?",
          options: [
            { text: "Without the standoff, tightening the screw bends and cracks the delicate SSD circuit board", correct: true },
            { text: "The standoff converts the drive from SATA mode to NVMe mode", correct: false },
            { text: "The standoff is an electrical antenna that boosts Wi-Fi speeds", correct: false },
            { text: "It prevents the drive from running out of storage space", correct: false }
          ],
          explanation: "The standoff elevates the tail of the M.2 SSD so it sits parallel to the board. Screwing it down without a standoff bends the drive and cracks silicon traces."
        }
      }
    ]
  },
  {
    id: "m5",
    moduleNum: 5,
    title: "Graphics Card (GPU) & Power Supply (PSU)",
    description: "Discrete graphics processors, PCIe x16 retention latches, power efficiency ratings, and keyed cabling.",
    topics: [
      {
        id: "5.1-gpu-pcie-slots",
        topicCode: "5.1",
        title: "Dedicated GPU, PCIe x16 Bus & Display Connectors",
        moduleNum: 5,
        moduleTitle: "Graphics Card (GPU) & Power Supply (PSU)",
        specimenKey: "gpu",
        hotspotId: "sys-gpu",
        youtubeId: "vB0X_vWwT_8",
        videoTitle: "How to Install a Graphics Card (GPU) Step by Step",
        explanation:
          "The dedicated Graphics Processing Unit (GPU) handles complex 3D rasterization and ray tracing. It installs into the topmost PCIe x16 slot for full 16-lane bandwidth. Once seated until the plastic retention latch clicks, the metal rear bracket is screwed into the case chassis to support card weight.",
        fieldFact: {
          title: "GPU Installation & Display Protocol",
          badge: "GRAPHICS GUIDE",
          items: [
            { label: "Topmost PCIe x16 Slot", value: "Wired directly to CPU with maximum 16 lanes", tag: "PRIMARY", color: "#b08d57" },
            { label: "PCIe Retention Latch", value: "Must click shut automatically when card is pressed in", tag: "LOCK", color: "#ffffff" },
            { label: "Case Bracket Screws", value: "Prevents GPU sag and tearing the PCIe slot", tag: "SUPPORT", color: "#f59e0b" },
            { label: "Display Cable Rule", value: "Monitor cable MUST connect to GPU, NOT motherboard", tag: "RULE", color: "#ef4444" }
          ]
        },
        mistakeWarning: {
          title: "Avoid This Mistake in Lab",
          desc: "Plugging the monitor's HDMI or DisplayPort cable into the motherboard's rear I/O instead of the graphics card ports. This forces the system to either produce a black screen or run on weak integrated graphics, completely bypassing the expensive GPU."
        },
        quiz: {
          question: "Where should a student plug their monitor cable after installing a dedicated graphics card?",
          options: [
            { text: "Directly into one of the horizontal display ports on the back of the graphics card", correct: true },
            { text: "Into the vertical HDMI port on the motherboard rear I/O cluster", correct: false },
            { text: "Into the USB-C charging port on the front of the PC case", correct: false },
            { text: "Into any port on the power supply unit", correct: false }
          ],
          explanation: "Connecting the display cable to the motherboard bypasses the dedicated GPU entirely. The monitor must plug directly into the graphics card."
        }
      },
      {
        id: "5.2-psu-efficiency-cables",
        topicCode: "5.2",
        title: "Power Supply (PSU), 80 PLUS Ratings & Keyed Cables",
        moduleNum: 5,
        moduleTitle: "Graphics Card (GPU) & Power Supply (PSU)",
        specimenKey: "psu",
        hotspotId: null,
        youtubeId: "J8J90s5E-iQ",
        videoTitle: "Power Supply Buying Guide & Cable Connections",
        explanation:
          "The Power Supply Unit (PSU) converts hazardous 115V/230V alternating current (AC) from the wall outlet into regulated +12V, +5V, and +3.3V direct current (DC) for computer electronics. The 80 PLUS certification guarantees that at least 80% to 90% of drawn electricity is converted into power rather than dissipated heat.",
        fieldFact: {
          title: "PSU Cable Pinout Identification",
          badge: "CABLE STANDARDS",
          items: [
            { label: "24-Pin ATX Main", value: "Powers motherboard chipset, RAM, and PCIe bus", tag: "24-PIN", color: "#b08d57" },
            { label: "8-Pin (4+4) EPS CPU", value: "Splits into two 4-pin halves; powers CPU VRM only", tag: "CPU", color: "#ffffff" },
            { label: "8-Pin (6+2) PCIe GPU", value: "Splits into 6-pin + 2-pin; powers graphics cards", tag: "GPU", color: "#f59e0b" },
            { label: "80 PLUS Gold", value: "Operates at 90% efficiency at typical 50% workload", tag: "RATING", color: "#eab308" }
          ]
        },
        mistakeWarning: {
          title: "Avoid This Mistake in Lab",
          desc: "Mixing modular power supply cables from two different PSU models or manufacturers. While the component-side connectors (24-pin, 8-pin) are standardized, the connectors that plug into the power supply itself have proprietary pinouts. Mixing cables will instantly send 12V down a 5V rail and permanently destroy connected drives and motherboards."
        },
        quiz: {
          question: "How can a student easily distinguish between an 8-pin CPU (EPS) cable and an 8-pin GPU (PCIe) power cable?",
          options: [
            { text: "The CPU cable splits into 4+4 pins, while the PCIe cable splits into 6+2 pins", correct: true },
            { text: "The CPU cable is always bright green and the PCIe cable is red", correct: false },
            { text: "The PCIe cable has 24 pins while the CPU cable has only 4 pins", correct: false },
            { text: "There is no physical difference; they are completely interchangeable", correct: false }
          ],
          explanation: "An EPS CPU power cable separates into a 4+4 pin configuration, whereas a PCIe GPU cable separates into a 6+2 pin configuration."
        }
      }
    ]
  },
  {
    id: "m6",
    moduleNum: 6,
    title: "PC Chassis, Airflow Physics & Cabling",
    description: "Chassis anatomy, airflow pressure physics, fan orientation ('faces suck'), and front panel cabling.",
    topics: [
      {
        id: "6.1-airflow-physics",
        topicCode: "6.1",
        title: "Chassis Airflow Dynamics (Positive vs. Negative Pressure)",
        moduleNum: 6,
        moduleTitle: "PC Chassis, Airflow Physics & Cabling",
        specimenKey: "case",
        hotspotId: null,
        youtubeId: "8Omkqum-qNw",
        videoTitle: "PC Case Airflow and Fan Direction Physics",
        explanation:
          "Desktop computers rely on directed airflow to draw cool room air across hot heatsinks and expel hot exhaust. All standard chassis fans intake air through their open blade face and exhaust air out through the frame side supported by plastic cross-arms ('Faces Suck, Crosses Blow').",
        fieldFact: {
          title: "Airflow Configurations Compared",
          badge: "AIRFLOW PHYSICS",
          items: [
            { label: "Positive Pressure", value: "Intake CFM > Exhaust CFM · Forces air out of unsealed seams; keeps dust out", tag: "OPTIMAL", color: "#b08d57" },
            { label: "Negative Pressure", value: "Exhaust CFM > Intake CFM · Sucks unfiltered dust into cracks", tag: "DUST TRAP", color: "#ef4444" },
            { label: "Balanced Airflow", value: "Equal intake and exhaust; neutral pressure loop", tag: "NEUTRAL", color: "#ffffff" },
            { label: "Front Intake / Rear Exhaust", value: "Natural front-to-back, bottom-to-top thermal convection", tag: "PATHWAY", color: "#8b5cf6" }
          ]
        },
        mistakeWarning: {
          title: "Avoid This Mistake in Lab",
          desc: "Installing all chassis fans facing the same direction, such as all exhaust or all intake. This creates an aerodynamic choke point where internal hot air cannot escape, causing thermal throttling of both CPU and GPU."
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
        id: "6.2-cable-management",
        topicCode: "6.2",
        title: "Front Panel Headers & Cable Management",
        moduleNum: 6,
        moduleTitle: "PC Chassis, Airflow Physics & Cabling",
        specimenKey: "case",
        hotspotId: null,
        youtubeId: "Wc8vQ9p-8yY",
        videoTitle: "Cable Management and Front Panel Wiring Guide",
        explanation:
          "Clean cable management is not just for aesthetics—routing cables through rear grommets behind the motherboard tray ensures unobstructed airflow across VRM and GPU heatsinks, while preventing loose cables from brushing against spinning fan blades.",
        fieldFact: {
          title: "Cable Routing Best Practices",
          badge: "ROUTING RULES",
          items: [
            { label: "Velcro Straps & Ties", value: "Bundle cables along chassis perimeter channels", tag: "CLEAN", color: "#b08d57" },
            { label: "Rubber Grommets", value: "Pass cables through closest grommet to motherboard port", tag: "DIRECT", color: "#ffffff" },
            { label: "Clear Fan Blades", value: "Ensure no loose SATA or fan leads touch rotating blades", tag: "SAFETY", color: "#f59e0b" },
            { label: "PSU Shroud Basement", value: "Stash excess unused power leads in bottom compartment", tag: "STORAGE", color: "#8b5cf6" }
          ]
        },
        mistakeWarning: {
          title: "Avoid This Mistake in Lab",
          desc: "Leaving loose power or front panel wires dangling in front of the CPU cooler or graphics card fans. Spinning fan blades will strike loose cables, causing continuous rattling noise or shearing through cable insulation to create electrical shorts."
        },
        quiz: {
          question: "What is the primary functional reason for routing power cables through the back of the case tray rather than across the motherboard?",
          options: [
            { text: "It prevents loose cables from obstructing cooling airflow and striking spinning fan blades", correct: true },
            { text: "It increases electrical voltage to the processor", correct: false },
            { text: "It makes the operating system boot in half the time", correct: false },
            { text: "Cables cannot conduct electricity if they touch the motherboard", correct: false }
          ],
          explanation: "Rear cable routing maintains clean laminar airflow across internal components and ensures spinning fan blades are never struck by loose wiring."
        }
      }
    ]
  },
  {
    id: "m7",
    moduleNum: 7,
    title: "Capstone Practical — Hands-On 3D Virtual PC Assembly",
    description: "Component staging, interactive 3D virtual build (zero brands, pure physical assembly), POST tests, and EZ Debug LEDs.",
    topics: [
      {
        id: "7.1-bench-testing",
        topicCode: "7.1",
        title: "Pre-Assembly Staging & Test Bench POST",
        moduleNum: 7,
        moduleTitle: "Capstone Practical — Hands-On 3D Virtual PC Assembly",
        specimenKey: "composite",
        hotspotId: null,
        youtubeId: "p_6q1D6qf5A",
        videoTitle: "Out-of-Case Motherboard Bench Test Before Case Assembly",
        explanation:
          "Professional technicians always execute an 'out-of-case bench test' before installing the motherboard into the chassis. Setting the motherboard on its cardboard box with CPU, RAM, and PSU connected lets you verify that the core components POST before spending hours securing standoffs and cabling inside the case.",
        fieldFact: {
          title: "Pre-Assembly Checklist",
          badge: "BENCH TEST",
          items: [
            { label: "Box Top Staging", value: "Place board on non-conductive cardboard box", tag: "SETUP", color: "#b08d57" },
            { label: "Core Trio Installed", value: "CPU + 1 stick of RAM in A2 + cooler mounted", tag: "TRIO", color: "#ffffff" },
            { label: "Screwdriver Jump", value: "Momentarily bridge Power SW pins with flathead screwdriver", tag: "BOOT", color: "#f59e0b" },
            { label: "Confirm Video Signal", value: "Verify BIOS screen appears before mounting into chassis", tag: "VERIFY", color: "#8b5cf6" }
          ]
        },
        mistakeWarning: {
          title: "Avoid This Mistake in Lab",
          desc: "Installing every single component and cable tightly inside the chassis without testing core components first. If a component is defective or poorly seated, troubleshooting requires disassembling the entire PC from scratch."
        },
        quiz: {
          question: "Why do technicians recommend performing an out-of-case test on the motherboard box before installing into the case?",
          options: [
            { text: "It verifies the core components POST successfully before spending hours mounting and routing cables inside the case", correct: true },
            { text: "Motherboards require fresh outdoor air to initialize their firmware", correct: false },
            { text: "The CPU warranty is void if booted inside a case first", correct: false },
            { text: "It permanently benchmarks maximum overclock speeds", correct: false }
          ],
          explanation: "Testing on the cardboard box isolates the core hardware from case shorts and verifies operational status before full physical installation."
        }
      },
      {
        id: "7.2-hands-on-assembly",
        topicCode: "7.2",
        title: "Virtual 3D Hands-On PC Assembly Lab",
        moduleNum: 7,
        moduleTitle: "Capstone Practical — Hands-On 3D Virtual PC Assembly",
        specimenKey: "assembly-lab",
        isAssemblyLab: true,
        hotspotId: null,
        youtubeId: "BL4DCEp7blY",
        videoTitle: "Complete PC Assembly Demonstration - From Bare Case to Boot",
        explanation:
          "Put theory into practice! In this interactive capstone lab, you will build a complete desktop computer step-by-step in the 3D Studio. With zero commercial brand distractions, follow B.O.B.'s guidance to physically assemble each standardized component in proper order—from chassis prep to final PCIe lock.",
        fieldFact: {
          title: "8-Step Canonical Build Sequence",
          badge: "ASSEMBLY ORDER",
          items: [
            { label: "1. Chassis Prep", value: "Inspect standoffs, remove side panels & pre-route front I/O", tag: "STEP 1", color: "#b08d57" },
            { label: "2. Motherboard Mount", value: "Align rear I/O shield & secure 9 brass standoff screws", tag: "STEP 2", color: "#ffffff" },
            { label: "3. CPU Drop & Latch", value: "Align golden triangle, drop into socket, lock lever", tag: "STEP 3", color: "#f59e0b" },
            { label: "4. Thermal & Cooler", value: "Dot thermal compound and secure heatsink crisscross", tag: "STEP 4", color: "#8b5cf6" },
            { label: "5. Dual-Channel RAM", value: "Snap sticks into slots A2 and B2 until latches click", tag: "STEP 5", color: "#ec4899" },
            { label: "6. M.2 NVMe SSD", value: "25° angle entry, press flat onto standoff, tighten screw", tag: "STEP 6", color: "#ffffff" },
            { label: "7. Power Supply (PSU)", value: "Slide into shroud, plug 24-pin ATX and 8-pin EPS leads", tag: "STEP 7", color: "#eab308" },
            { label: "8. Dedicated GPU", value: "Seat in PCIe x16 slot until latch locks, connect PCIe power", tag: "STEP 8", color: "#b08d57" }
          ]
        },
        mistakeWarning: {
          title: "Avoid This Mistake in Lab",
          desc: "Installing the massive graphics card before plugging in the 8-pin CPU power or lower motherboard front panel headers. Large modern GPUs block hands and tools from reaching motherboard connectors, forcing you to remove the card."
        },
        quiz: {
          question: "During full PC assembly, why should the dedicated graphics card be installed as the VERY LAST component?",
          options: [
            { text: "Because large graphics cards physically block access to motherboard headers, power sockets, and M.2 screws", correct: true },
            { text: "Because graphics cards will lose their display driver if installed earlier", correct: false },
            { text: "Because graphics cards cannot be powered unless the PC case is fully painted", correct: false },
            { text: "Because the power supply cannot fit if the GPU is already present", correct: false }
          ],
          explanation: "Graphics cards take up huge space inside the chassis. Installing them last ensures hands have clear access to all motherboard headers and power connectors."
        }
      },
      {
        id: "7.3-post-ez-debug",
        topicCode: "7.3",
        title: "POST Diagnostic, EZ Debug LEDs & First Boot",
        moduleNum: 7,
        moduleTitle: "Capstone Practical — Hands-On 3D Virtual PC Assembly",
        specimenKey: "composite",
        hotspotId: null,
        youtubeId: "8Omkqum-qNw",
        videoTitle: "Understanding Motherboard EZ Debug LEDs and Beep Codes",
        explanation:
          "Power-On Self-Test (POST) is the firmware pre-boot diagnostic sequence that verifies CPU, RAM, GPU, and boot storage before handing control to the operating system. Modern motherboards feature four EZ Debug LEDs that illuminate sequentially to pinpoint hardware initialization faults.",
        fieldFact: {
          title: "EZ Debug LED Diagnostic Sequence",
          badge: "EZ DEBUG LEDS",
          items: [
            { label: "CPU LED (Solid)", value: "Processor unseated, bent pins, or missing 8-pin EPS cable", tag: "FAULT 1", color: "#ef4444" },
            { label: "DRAM LED (Solid)", value: "RAM unclicked, improper dual-channel slot, or dirt on pins", tag: "FAULT 2", color: "#f59e0b" },
            { label: "VGA LED (Solid)", value: "GPU not fully clicked into PCIe slot or missing PCIe power", tag: "FAULT 3", color: "#eab308" },
            { label: "BOOT LED (Green)", value: "All hardware passed POST; system ready to load OS", tag: "SUCCESS", color: "#b08d57" }
          ]
        },
        mistakeWarning: {
          title: "Avoid This Mistake in Lab",
          desc: "Panicking and repeatedly power cycling the PC when a newly assembled DDR5 system takes 45-90 seconds before displaying video. DDR5 motherboards perform automatic 'memory training' on first boot to tune memory sub-timings—interrupting this corrupts CMOS settings."
        },
        quiz: {
          question: "If a newly built computer turns on, fans spin, but the motherboard's 'DRAM' EZ Debug LED stays permanently lit, what is the most likely problem?",
          options: [
            { text: "The RAM modules are not clicked in all the way or are seated in the wrong slots", correct: true },
            { text: "The monitor cable is unplugged", correct: false },
            { text: "The power supply cable is unplugged from the wall", correct: false },
            { text: "The case power button was pressed too quickly", correct: false }
          ],
          explanation: "A solid DRAM EZ Debug LED indicates memory initialization failure—usually caused by memory sticks not clicked in fully or seated in wrong slots."
        }
      }
    ]
  }
];

export const FLAT_TOPICS = CSS_CURRICULUM.flatMap((m) => m.topics);
export const TOTAL_TOPICS_COUNT = FLAT_TOPICS.length;
export const TOTAL_MODULES_COUNT = CSS_CURRICULUM.length;
