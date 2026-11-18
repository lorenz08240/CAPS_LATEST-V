/**
 * BuildLab CSS (Computer Systems Servicing) NC II Comprehensive Quiz Bank
 * 15 Technical Assessment Questions per Module
 * Aligned with DepEd Grade 11 CSS, TESDA NC II, and PTC-IICT Academic Standards
 */

export const MODULE_QUIZZES = {
  // ── MODULE 1: LAB SAFETY, WORKSPACE & TOOLS ──
  m1: {
    moduleNum: 1,
    moduleTitle: "Lab Safety, Workspace & Tools",
    passingPercentage: 75,
    questions: [
      {
        id: "m1-q1",
        category: "Safety Protocols",
        question: "When setting up a PC assembly workstation, which of the following is the SAFEST temporary surface to place a motherboard on before mounting?",
        options: [
          "The clean, non-conductive cardboard motherboard retail box",
          "The shiny exterior surface of the anti-static bag",
          "A plush synthetic carpet to cushion the board",
          "A bare steel cookie sheet for grounding"
        ],
        correctIndex: 0,
        explanation: "The cardboard retail box is rigid and non-conductive. Placing the motherboard on the exterior of an anti-static bag is hazardous because the shiny outer layer has a conductive carbon/metallic coating designed to divert charge, which can short circuit surface pins."
      },
      {
        id: "m1-q2",
        category: "ESD Prevention",
        question: "What is Electrostatic Discharge (ESD) and why is it dangerous to computer hardware?",
        options: [
          "A silent electric charge transfer that can damage microchips at voltages humans cannot even feel",
          "A visible spark that only occurs during electrical thunderstorms",
          "A power surge originating from the electrical outlet during wall socket plug-in",
          "A short circuit that only happens when the computer is actively running Windows"
        ],
        correctIndex: 0,
        explanation: "Humans cannot feel ESD below approximately 2,000–3,000 volts, yet delicate microchips and MOSFET gates can suffer catastrophic or latent failure from as little as 100 volts."
      },
      {
        id: "m1-q3",
        category: "Grounding Practices",
        question: "How should a technician properly ground themselves without an anti-static wrist strap?",
        options: [
          "Touch an unpainted metal section of the PC case while the PSU is plugged in but switched OFF",
          "Touch the spinning blades of an active case fan",
          "Place one hand on a bare wall socket pin",
          "Rub hands together with dry synthetic cloth"
        ],
        correctIndex: 0,
        explanation: "Plugging the PSU into a properly grounded 3-prong wall outlet while keeping the PSU rocker switch OFF provides a continuous ground path through the chassis earth pin without energizing the motherboard."
      },
      {
        id: "m1-q4",
        category: "Fasteners & Threading",
        question: "Which screw thread standard is universally used for securing the Power Supply Unit (PSU) and PCIe GPU expansion brackets to the computer chassis?",
        options: [
          "6-32 coarse UNC thread screws",
          "M3 fine metric thread screws",
          "M2 micro screws",
          "Self-tapping drywall screws"
        ],
        correctIndex: 0,
        explanation: "6-32 coarse screws are the chassis standard for power supplies, GPU retention brackets, and 3.5-inch hard drives. M3 fine screws are used for 2.5-inch SSDs and optical drives."
      },
      {
        id: "m1-q5",
        category: "Motherboard Mounting",
        question: "What is the primary function of brass motherboard standoffs installed inside the chassis?",
        options: [
          "To elevate the underside solder pins of the motherboard away from the bare metal case tray to prevent short circuits",
          "To provide decorative lighting reflections under the motherboard",
          "To increase airflow beneath the CPU socket",
          "To act as magnetic anchors for wireless charging"
        ],
        correctIndex: 0,
        explanation: "Motherboard standoffs space the PCB roughly 6mm above the conductive metal chassis tray. Missing or misaligned standoffs will cause direct shorts that trigger instant PSU over-current protection (OCP)."
      },
      {
        id: "m1-q6",
        category: "Fasteners & Threading",
        question: "Which screw type is specifically required to secure an M.2 NVMe SSD into its motherboard standoff?",
        options: [
          "M2 micro metric screw (or motherboard toolless latch)",
          "6-32 coarse chassis screw",
          "M3 optical drive screw",
          "Thumb screw with coarse pitch"
        ],
        correctIndex: 0,
        explanation: "M.2 drives require tiny M2 metric screws (typically M2 x 3mm). Forcing an M3 or 6-32 screw will strip the standoff threads or crack the delicate M.2 PCB notch."
      },
      {
        id: "m1-q7",
        category: "Safe Handling",
        question: "Where is the SAFEST place to hold a motherboard when lifting it out of its protective packaging?",
        options: [
          "By the bare fiberglass outer edges and sturdy solid metal VRM heatsinks",
          "By grasping the cylindrical electrolytic capacitors directly",
          "By lifting directly from the CPU socket retention latch arm",
          "By clamping onto the rear 3.5mm audio jacks"
        ],
        correctIndex: 0,
        explanation: "Lifting by surface-mount capacitors will fracture their solder joints from the PCB traces. Always grip by the bare outer PCB perimeter or solid heatsinks."
      },
      {
        id: "m1-q8",
        category: "Assembly Tools",
        question: "Which screwdriver is the essential, universal tool for 95% of desktop computer assembly tasks?",
        options: [
          "Magnetic #2 Phillips (PH2) screwdriver",
          "Flathead slotted screwdriver",
          "T10 Torx security driver",
          "Heavy impact drill driver"
        ],
        correctIndex: 0,
        explanation: "A standard #2 Phillips (PH2) screwdriver fits chassis screws, PSU screws, motherboard standoff screws, and cooler brackets. Power drills should never be used on computers due to risk of stripping threads and cracking PCBs."
      },
      {
        id: "m1-q9",
        category: "Chemical Safety",
        question: "What chemical solvent is internationally recommended for thoroughly cleaning old dried thermal paste off a CPU and heatsink?",
        options: [
          "90% or higher Isopropyl Alcohol (IPA) with a lint-free wipe",
          "Acetone fingernail polish remover",
          "Warm tap water and dishwashing detergent",
          "Mineral spirits or WD-40 spray"
        ],
        correctIndex: 0,
        explanation: "High-purity (90%+) Isopropyl Alcohol rapidly dissolves silicone/metal thermal paste and evaporates within seconds without leaving moisture, conductive residues, or corrosive contaminants."
      },
      {
        id: "m1-q10",
        category: "Component Protection",
        question: "When should the plastic protective cover over an Intel LGA CPU socket be removed?",
        options: [
          "It should be left in place until the CPU is seated; closing the retention arm will automatically pop it off safely",
          "Immediately upon unboxing the motherboard before touching any other part",
          "After booting the system into Windows for the first time",
          "Never; it must remain between the CPU and cooler"
        ],
        correctIndex: 0,
        explanation: "LGA socket pins are fragile spring contacts. Removing the cap prematurely exposes pins to falling screws, cable snags, or accidental finger brushes. Modern LGA mechanisms safely pop the cover off when clamping the seated CPU."
      },
      {
        id: "m1-q11",
        category: "Electrical Safety",
        question: "Before performing any internal hardware upgrade or memory reseat on an assembled desktop, what MUST be done?",
        options: [
          "Switch OFF the PSU rocker switch, unplug the AC power cord, and hold the front power button for 5 seconds to drain residual capacitor charge",
          "Simply put Windows into Sleep mode",
          "Unplug the monitor HDMI cable while leaving the power cord active",
          "Turn off the bedroom room light switch"
        ],
        correctIndex: 0,
        explanation: "Modern motherboards provide continuous 5VSB (5-Volt Standby) power to RAM slots and PCIe buses even when shut down. Holding the power button drains the PSU filter capacitors."
      },
      {
        id: "m1-q12",
        category: "PPE & Attire",
        question: "Which clothing item generates the highest electrostatic friction and should be AVOIDED while building computers?",
        options: [
          "Wool or synthetic polyester sweaters and fleece jackets worn over socks on carpeting",
          "100% natural cotton t-shirts",
          "Short-sleeved cotton collared shirts",
          "Rubber-soled anti-static safety shoes"
        ],
        correctIndex: 0,
        explanation: "Synthetic wool and fleece materials have high triboelectric charge affinity, rapidly accumulating thousands of volts of static charge through body movement."
      },
      {
        id: "m1-q13",
        category: "Hardware Diagnostics",
        question: "What is the purpose of an anti-static wrist strap's built-in 1-Megaohm resistor?",
        options: [
          "To protect the human technician from dangerous electrical shock if a live AC voltage source is accidentally touched",
          "To speed up the flow of electricity to the floor",
          "To generate a magnetic shield around the computer",
          "To power the indicator LED on the wrist strap"
        ],
        correctIndex: 0,
        explanation: "The 1-Megaohm resistor safely bleeds off high-voltage, low-current static charge while limiting current to harmless microamps if the user touches a live circuit."
      },
      {
        id: "m1-q14",
        category: "Workspace Layout",
        question: "Why should food and open beverage containers be strictly barred from the hardware servicing bench?",
        options: [
          "Liquid spills can cause instant conductive short circuits, and food crumbs can lodge inside socket pins or cooling fans",
          "Computers emit radiation that will spoil food",
          "Because food attracts magnetic interference",
          "Beverage bottles block Wi-Fi signals"
        ],
        correctIndex: 0,
        explanation: "Liquid spills across energized or standby PCB circuitry cause immediate galvanic shorts and corrosion. Crumbs inside DIMM or PCIe slots prevent clean pin-to-pad electrical contact."
      },
      {
        id: "m1-q15",
        category: "Storage & Organizing",
        question: "What is the best practice for managing screws and small brackets during a complex computer teardown?",
        options: [
          "Use a compartmentalized magnetic screw tray and label screws by their component zone",
          "Scatter all screws freely across the table for quick grabbing",
          "Leave screws loosely threaded into their holes by half a turn",
          "Mix all 6-32 and M3 screws together in a single cup"
        ],
        correctIndex: 0,
        explanation: "Using an organized magnetic tray prevents missing screws and stops coarse-thread screws from being accidentally cross-threaded into fine-pitch metric standoff holes."
      }
    ]
  },

  // ── MODULE 2: THE MOTHERBOARD (MAINBOARD BACKBONE) & FORM FACTORS ──
  m2: {
    moduleNum: 2,
    moduleTitle: "The Motherboard (Mainboard Backbone)",
    passingPercentage: 75,
    questions: [
      {
        id: "m2-q1",
        category: "Form Factors & Dimensions",
        question: "What are the exact standard physical dimensions of a Standard ATX motherboard?",
        options: [
          "305 mm × 244 mm (12.0 in × 9.6 in)",
          "244 mm × 244 mm (9.6 in × 9.6 in)",
          "170 mm × 170 mm (6.7 in × 6.7 in)",
          "305 mm × 330 mm (12.0 in × 13.0 in)"
        ],
        correctIndex: 0,
        explanation: "Standard ATX measures 305 × 244 mm. Micro-ATX is square at 244 × 244 mm, Mini-ITX is compact at 170 × 170 mm, and Extended ATX (E-ATX) measures 305 × 330 mm."
      },
      {
        id: "m2-q2",
        category: "Form Factors & Dimensions",
        question: "A student is planning an ultra-compact Small Form Factor (SFF) build. Which motherboard form factor should they select?",
        options: [
          "Mini-ITX (170 mm × 170 mm)",
          "Standard ATX (305 mm × 244 mm)",
          "Extended ATX (305 mm × 330 mm)",
          "Micro-ATX (244 mm × 244 mm)"
        ],
        correctIndex: 0,
        explanation: "Mini-ITX is the standard Small Form Factor (SFF) specification, featuring a 170 × 170 mm footprint, 2 RAM slots, and exactly 1 PCIe expansion slot."
      },
      {
        id: "m2-q3",
        category: "Expansion Slots",
        question: "How many full expansion slot positions does a standard Micro-ATX (mATX) motherboard typically provide compared to Standard ATX?",
        options: [
          "Up to 4 expansion slot positions (compared to 7 on ATX)",
          "Exactly 1 expansion slot position",
          "Up to 8 expansion slot positions",
          "Zero expansion slots; all parts must be soldered"
        ],
        correctIndex: 0,
        explanation: "Micro-ATX motherboards are limited to 4 expansion slot positions due to their shorter 244mm height, whereas standard 305mm ATX motherboards accommodate up to 7 slot positions."
      },
      {
        id: "m2-q4",
        category: "Standoff Alignment",
        question: "How many brass mounting standoff screw locations are standardized for a full Standard ATX motherboard?",
        options: [
          "9 standoff screws arranged in a 3 × 3 grid",
          "4 standoff screws arranged at the outer corners only",
          "12 standoff screws arranged in two rows",
          "6 standoff screws arranged in a hexagon"
        ],
        correctIndex: 0,
        explanation: "Standard ATX utilizes a standardized 9-hole standoff pattern arranged in three columns of three rows (Top, Middle, Bottom)."
      },
      {
        id: "m2-q5",
        category: "Socket Architecture",
        question: "What is the key structural difference between an LGA (Land Grid Array) socket and a PGA (Pin Grid Array) socket?",
        options: [
          "LGA has the fragile contact pins on the motherboard socket, while PGA has the pins on the CPU chip itself",
          "LGA is only for graphics cards, while PGA is for RAM memory",
          "PGA uses wireless induction, while LGA uses physical soldered cables",
          "LGA has no pins at all and uses adhesive tape"
        ],
        correctIndex: 0,
        explanation: "In LGA (Intel LGA 1700 / AMD AM5), delicate spring pins reside inside the motherboard socket while the CPU has gold contact pads. In PGA (legacy AMD AM4), the pins are on the CPU bottom."
      },
      {
        id: "m2-q6",
        category: "Power Delivery (VRM)",
        question: "What is the primary role of the Motherboard Voltage Regulator Module (VRM) circuitry situated around the CPU socket?",
        options: [
          "To step down high 12V DC power from the PSU to the precise 1.1V–1.4V VCore voltage required by CPU silicon",
          "To convert DC battery voltage into 220V AC wall current",
          "To amplify audio signals going to the 3.5mm rear headphones",
          "To cool down the M.2 NVMe solid-state storage drive"
        ],
        correctIndex: 0,
        explanation: "The VRM consists of MOSFETs, chokes, and solid capacitors that convert 12V from the 8-pin EPS cable into clean, sub-1.4V current delivered in multiple balanced power phases."
      },
      {
        id: "m2-q7",
        category: "Power Connectors",
        question: "Which main power cable connects directly from the power supply unit to energize the motherboard chipset, PCIe slots, and logic circuits?",
        options: [
          "24-pin ATX Main Power Connector",
          "6+2 pin PCIe Graphics Power Cable",
          "4-pin Peripheral Molex Cable",
          "15-pin SATA Storage Power Cable"
        ],
        correctIndex: 0,
        explanation: "The 24-pin ATX connector supplies +3.3V, +5V, +12V, -12V, and +5VSB (standby) rails to the motherboard logic, chipset, and expansion bus slots."
      },
      {
        id: "m2-q8",
        category: "Front Panel Headers",
        question: "When connecting front panel header wires (Power SW, Reset SW, HDD LED, Power LED), which pins are polarity-sensitive?",
        options: [
          "LED connectors (HDD LED, Power LED) must have Positive (+) and Negative (-) correctly aligned; Switch connectors (Power SW, Reset SW) are non-polarized momentary shorts",
          "All front panel switches and LEDs are strictly non-polarized",
          "Only the Reset Switch has strict positive and negative polarity",
          "If an LED is plugged in backwards, the computer will short circuit and burn"
        ],
        correctIndex: 0,
        explanation: "LEDs are Light Emitting Diodes and will only light up when current flows from anode (+) to cathode (-). Switches are simple momentary contact closures with no polarity."
      },
      {
        id: "m2-q9",
        category: "I/O Ports & Standards",
        question: "According to USB industry color coding, what transfer speed is indicated by a standard BLUE USB port on the motherboard rear I/O?",
        options: [
          "USB 3.0 / USB 3.1 Gen 1 with 5 Gbps SuperSpeed transfer rate",
          "USB 2.0 with legacy 480 Mbps transfer rate",
          "USB 3.2 Gen 2x2 with 20 Gbps transfer rate",
          "Thunderbolt 4 with 40 Gbps transfer rate"
        ],
        correctIndex: 0,
        explanation: "Black denotes USB 2.0 (480 Mbps), Blue denotes USB 3.0 / 3.1 Gen 1 (5 Gbps), Teal/Cyan denotes USB 3.1 Gen 2 (10 Gbps), and Red denotes USB 3.2 Gen 2 (10-20 Gbps)."
      },
      {
        id: "m2-q10",
        category: "Firmware & CMOS",
        question: "What is the purpose of the 3V CR2032 coin cell battery located on the motherboard?",
        options: [
          "To preserve the real-time clock (RTC) and volatile CMOS memory settings when AC power is completely disconnected",
          "To provide backup power for spinning cooling fans during blackouts",
          "To recharge the dedicated graphics card VRAM memory",
          "To boost CPU clock speeds during heavy gaming sessions"
        ],
        correctIndex: 0,
        explanation: "The CR2032 lithium coin cell powers the CMOS RAM and Real-Time Clock (RTC). When depleted, the BIOS prompts 'CMOS Checksum Error' and system time resets to 12:00 Jan 1."
      },
      {
        id: "m2-q11",
        category: "PCIe Expansion",
        question: "Why should the primary graphics card (GPU) always be installed into the topmost PCIe x16 slot on a standard motherboard?",
        options: [
          "The topmost slot is wired directly to the CPU's dedicated 16 PCIe lanes for maximum bandwidth and lowest latency",
          "The bottom slots are wired for audio cards only",
          "The top slot is the only one that physically supplies 12 volts",
          "Motherboards cannot detect graphics cards installed below the top slot"
        ],
        correctIndex: 0,
        explanation: "The primary PCIe x16 slot communicates directly over CPU lanes. Lower slots route through the motherboard chipset over a shared DMI link, introducing latency and limited lanes."
      },
      {
        id: "m2-q12",
        category: "Storage Architecture",
        question: "What physical key notch prevents a SATA-only M.2 drive from being damaged in an M-Key only PCIe 4.0 NVMe slot?",
        options: [
          "M-Keying notch with 5 pins on one side, located on pins 59–66",
          "Square USB-A keying tab",
          "Triangle gold marker on the corner",
          "L-shaped plastic SATA connector"
        ],
        correctIndex: 0,
        explanation: "M.2 slots use mechanical keying notches: M-Key (pins 59-66) for PCIe x4 NVMe drives, B-Key for SATA/PCIe x2, and B+M Key for dual-compatibility drives."
      },
      {
        id: "m2-q13",
        category: "POST Diagnostics",
        question: "Modern motherboards feature four small onboard Diagnostic LEDs labeled CPU, DRAM, VGA, and BOOT. What does a solid light on the 'DRAM' LED indicate?",
        options: [
          "The motherboard POST check halted because memory modules are missing, unseated, dirty, or incompatible",
          "The memory is operating at maximum overclocked speed",
          "The CPU cooling fan has stopped spinning",
          "The monitor cable is disconnected from the graphics card"
        ],
        correctIndex: 0,
        explanation: "Debug LEDs step through hardware sequentially. A stopped/amber light on DRAM indicates memory initialization failed during Power-On Self-Test (POST)."
      },
      {
        id: "m2-q14",
        category: "Form Factors & Dimensions",
        question: "Which of the following chassis can physically fit an Extended ATX (E-ATX) motherboard?",
        options: [
          "Full-Tower chassis with extended clearance to the right of the grommets",
          "Compact Mini-ITX cube case",
          "Slimline SFF office desktop case",
          "Standard Micro-ATX mini-tower case"
        ],
        correctIndex: 0,
        explanation: "E-ATX motherboards are 330mm wide (86mm wider than ATX), requiring a Full-Tower chassis with open cable-routing clearance to avoid hitting internal drive bays."
      },
      {
        id: "m2-q15",
        category: "Firmware & BIOS",
        question: "What key is universally pressed immediately after powering on a desktop computer to enter the UEFI / BIOS Setup utility?",
        options: [
          "Delete (DEL) or F2 key",
          "Spacebar key",
          "Enter key",
          "Control + Alt + Delete"
        ],
        correctIndex: 0,
        explanation: "Tapping the 'Delete' (DEL) or 'F2' key repeatedly during initial motherboard splash screen hands control over from the UEFI boot manager to the firmware configuration utility."
      }
    ]
  },

  // ── MODULE 3: CENTRAL PROCESSING UNIT (CPU) & COOLING ──
  m3: {
    moduleNum: 3,
    moduleTitle: "Central Processing Unit (CPU) & Cooling",
    passingPercentage: 75,
    questions: [
      {
        id: "m3-q1",
        category: "Socket Alignment",
        question: "How do technicians verify that a modern CPU is oriented in the correct direction before seating it into the motherboard socket?",
        options: [
          "By aligning the golden triangle marker on the corner of the CPU substrate with the triangle stamped on the socket corner",
          "By pushing hard until the chip clicks firmly into place",
          "By reading the laser-engraved text right side up from the front of the case",
          "By placing the CPU heatsink on top first"
        ],
        correctIndex: 0,
        explanation: "Both AMD and Intel CPUs have a stamped gold triangle on pin 1 corner that matches a triangle or dot stamped onto the socket housing, accompanied by side alignment notches."
      },
      {
        id: "m3-q2",
        category: "Zero Insertion Force (ZIF)",
        question: "What is meant by the rule 'Zero Insertion Force (ZIF)' when installing a central processor?",
        options: [
          "The processor must drop into the socket solely under its own weight with zero downward finger pressure",
          "The CPU requires 50 pounds of clamping pressure before dropping",
          "The socket has zero electrical resistance to current flow",
          "The cooling fan exerts zero force on the CPU heat spreader"
        ],
        correctIndex: 0,
        explanation: "Zero Insertion Force (ZIF) means if the chip is aligned correctly, it drops flat with zero manual pressing. Any manual downward pressure on an unseated chip will bend or shear socket pins."
      },
      {
        id: "m3-q3",
        category: "Thermal Interface Material (TIM)",
        question: "What is the essential engineering purpose of applying thermal paste (Thermal Interface Material) between the CPU and the cooler base?",
        options: [
          "To displace microscopic air pockets between the two metal surfaces because air is a terrible heat conductor",
          "To permanently glue the CPU into the motherboard so it cannot fall out",
          "To lubricate the heat pipes so liquid coolant can circulate inside",
          "To prevent the CPU from drawing too much electrical current"
        ],
        correctIndex: 0,
        explanation: "Even mirror-polished copper and nickel have microscopic surface imperfections. Trapped air has a thermal conductivity of ~0.026 W/mK, whereas thermal paste conducts heat at 5-14 W/mK."
      },
      {
        id: "m3-q4",
        category: "Thermal Paste Application",
        question: "What is the recommended thermal paste application method for a standard consumer desktop CPU?",
        options: [
          "A small pea-sized dot (or central 'X' pattern) in the middle of the Integrated Heat Spreader (IHS)",
          "Covering the entire socket and pins in a thick layer before dropping the CPU",
          "Spreading thermal paste with fingers directly onto the underside gold pads",
          "Emptying the entire tube of paste until it spills over the motherboard PCB"
        ],
        correctIndex: 0,
        explanation: "A pea-sized bead (~5mm) in the center flattens into an even, bubble-free circle when cooler mounting pressure is torqued down. Excess paste that overflows can dirty socket components."
      },
      {
        id: "m3-q5",
        category: "Cooler Mounting",
        question: "When tightening the four mounting screws of a CPU cooler heatsink, which pattern should always be followed to ensure even pressure?",
        options: [
          "Diagonal cross pattern (X-pattern), turning each screw 1-2 rotations alternately until secure",
          "Tightening the top-left screw 100% first, then proceeding clockwise",
          "Tightening only the bottom two screws and leaving the top loose for airflow",
          "Using maximum torque until the motherboard bends backwards"
        ],
        correctIndex: 0,
        explanation: "Tightening in a diagonal cross pattern distributes clamping pressure uniformly across the silicon die and prevents uneven paste squeeze-out or substrate corner cracking."
      },
      {
        id: "m3-q6",
        category: "Cooling Fan Power",
        question: "Where must the primary CPU air cooler fan or AIO water pump tachometer cable be plugged into on the motherboard?",
        options: [
          "The dedicated 4-pin 'CPU_FAN' header",
          "Any available front panel USB header",
          "The 24-pin main ATX connector",
          "The 3-pin ARGB 5V lighting header"
        ],
        correctIndex: 0,
        explanation: "The motherboard BIOS specifically monitors the 'CPU_FAN' header. If no tachometer RPM signal is detected on 'CPU_FAN', the system halts boot with 'CPU Fan Error' to protect against thermal runaway."
      },
      {
        id: "m3-q7",
        category: "Thermal Throttling",
        question: "What symptom occurs if a technician forgets to remove the clear plastic peel film from the bottom of a new CPU cooler before mounting it?",
        options: [
          "The CPU will immediately hit 95°C–100°C under light load, causing severe thermal throttling and thermal shutdown",
          "The computer will run 10 degrees cooler due to plastic insulation",
          "The cooling fan will spin in the reverse direction",
          "Windows will display an error saying 'Plastic Detected'"
        ],
        correctIndex: 0,
        explanation: "Leaving the protective plastic peel creates an insulating thermal barrier. The CPU rapidly reaches TjMax (100°C), throttles clock frequency to 800MHz, and crashes to prevent permanent silicon meltdown."
      },
      {
        id: "m3-q8",
        category: "Processor Architecture",
        question: "What is the difference between a CPU's physical Core count and its Thread count?",
        options: [
          "A Core is an independent physical processing unit; Threads are virtual processing pipelines enabled by Simultaneous Multi-Threading (SMT/Hyper-Threading)",
          "Cores store data permanently; Threads store data in the cloud",
          "Cores refer to graphics; Threads refer to network speed",
          "Every CPU has exactly 1 Thread per Core with no exceptions"
        ],
        correctIndex: 0,
        explanation: "Physical cores are discrete hardware calculation units on the die. Multi-threading allows a single core to execute two simultaneous instruction threads by utilizing idle execution units."
      },
      {
        id: "m3-q9",
        category: "Cooling Types",
        question: "What is an All-In-One (AIO) Liquid Cooler, and what are its primary components?",
        options: [
          "A sealed closed-loop system featuring a CPU water block/pump, flexible coolant tubing, and an aluminum heat radiator with cooling fans",
          "An open bucket of mineral oil submerged inside the PC case",
          "A dry fan that blows compressed air directly through copper pipes",
          "A refrigeration compressor that runs on Freon gas"
        ],
        correctIndex: 0,
        explanation: "An AIO liquid cooler is pre-filled and maintenance-free. Liquid coolant absorbs heat at the CPU copper cold plate, pumps through tubes to the radiator, and dissipates heat through radiator fins."
      },
      {
        id: "m3-q10",
        category: "Power Consumption",
        question: "What does the CPU metric 'TDP' stand for, and why is it important for PC builders?",
        options: [
          "Thermal Design Power — the maximum amount of heat in Watts the cooling system is required to dissipate under expected workloads",
          "Total Data Processing — the maximum gigabytes the CPU can process per second",
          "True Desktop Performance — a benchmark score assigned by Microsoft",
          "Thermal Decay Period — the number of years before silicon degrades"
        ],
        correctIndex: 0,
        explanation: "Thermal Design Power (TDP) indicates the thermal output in Watts. Pairing a 170W TDP processor with a 65W rated low-profile cooler results in severe overheating and performance loss."
      },
      {
        id: "m3-q11",
        category: "Cache Architecture",
        question: "Which CPU cache level is the smallest, fastest, and located closest to the execution arithmetic logic units (ALUs)?",
        options: [
          "Level 1 (L1) Cache",
          "Level 3 (L3) Shared Cache",
          "DDR5 System RAM",
          "NVMe Solid State Storage"
        ],
        correctIndex: 0,
        explanation: "L1 cache operates at core frequency with ultra-low latency (<1 nanosecond). L2 is slightly larger, while L3 is a larger pool shared across all cores on the CCX/die."
      },
      {
        id: "m3-q12",
        category: "Fan Control (PWM)",
        question: "What does the 4th pin on a modern 4-pin CPU cooling fan header provide that legacy 3-pin headers lacked?",
        options: [
          "Pulse Width Modulation (PWM) signal for precise digital fan RPM speed control without varying voltage",
          "RGB LED lighting power",
          "Secondary ground wire for lightning strikes",
          "Audio buzzer signal for fan alarms"
        ],
        correctIndex: 0,
        explanation: "Pin 1 is Ground, Pin 2 is +12V, Pin 3 is Tachometer (speed sensor), and Pin 4 is PWM. PWM sends high-frequency pulses to control motor speed quietly across a wide RPM curve."
      },
      {
        id: "m3-q13",
        category: "Integrated Graphics",
        question: "What is an 'APU' or CPU with Integrated Graphics (iGPU)?",
        options: [
          "A single silicon chip that combines both the CPU calculation cores and a graphics processing engine on the same die",
          "A dedicated graphics card that slots into the PCIe x16 slot",
          "A motherboard that has a discrete GPU soldered onto the rear I/O",
          "A power supply that directly connects to the monitor"
        ],
        correctIndex: 0,
        explanation: "Integrated graphics share CPU silicon and system memory (VRAM). This allows video output to display through motherboard HDMI/DisplayPort ports without needing a discrete graphics card."
      },
      {
        id: "m3-q14",
        category: "Cooling Maintenance",
        question: "Approximately how often should thermal paste be cleaned and reapplied on a desktop computer under typical operating conditions?",
        options: [
          "Every 2 to 4 years, or whenever thermal performance degrades noticeably",
          "Every single morning before booting the computer",
          "Once every 25 years",
          "Never; factory paste lasts infinitely"
        ],
        correctIndex: 0,
        explanation: "Over 2 to 4 years of continuous heating and cooling thermal cycles, carrier oils evaporate, causing thermal paste to dry, crack, and increase operating temperatures."
      },
      {
        id: "m3-q15",
        category: "Overclocking",
        question: "What is the primary risk of manually increasing CPU VCore voltage beyond manufacturer specifications in the BIOS?",
        options: [
          "Excessive heat generation, electromigration degradation, and permanent catastrophic failure of processor silicon",
          "The monitor resolution will decrease to 640x480",
          "The mouse cursor will move backwards",
          "The hard drive partitions will automatically format"
        ],
        correctIndex: 0,
        explanation: "Higher voltage causes exponential power draw ($P = V^2 \times f$). Excessive voltage accelerates electromigration (movement of atoms within microscopic chip traces), permanently killing the CPU."
      }
    ]
  },

  // ── MODULE 4: MEMORY (RAM) & SOLID STATE STORAGE (M.2 NVMe) ──
  m4: {
    moduleNum: 4,
    moduleTitle: "Memory (RAM) & Solid State Storage (M.2 NVMe)",
    passingPercentage: 75,
    questions: [
      {
        id: "m4-q1",
        category: "Memory Keying",
        question: "Why is it physically impossible to insert a DDR4 memory module into a DDR5 motherboard RAM slot?",
        options: [
          "The mechanical notch on the gold connector pins is located in a different position, preventing accidental insertion",
          "DDR5 modules are painted green while DDR4 modules are painted black",
          "DDR4 modules are twice as long as DDR5 modules",
          "The motherboard software disables the physical slot latch"
        ],
        correctIndex: 0,
        explanation: "Every generation of DDR (DDR3, DDR4, DDR5) has its physical alignment key notch cut at a different millimeter offset to prevent devastating voltage and pin misconfigurations."
      },
      {
        id: "m4-q2",
        category: "Dual-Channel Topology",
        question: "When installing a 2-stick memory kit onto a typical 4-slot motherboard, which two slots should normally be populated first for optimal signal integrity?",
        options: [
          "Slots 2 and 4 (Channel A2 and Channel B2, counting outward from the CPU)",
          "Slots 1 and 2 (Channel A1 and Channel A2)",
          "Slots 3 and 4 only",
          "Any two random slots without looking at labels"
        ],
        correctIndex: 0,
        explanation: "Most modern motherboards use 'daisy-chain' memory trace topology. Populating the second slot of each channel (A2 and B2) ensures signal traces terminate cleanly at the DIMMs without signal reflection."
      },
      {
        id: "m4-q3",
        category: "Dual-Channel Performance",
        question: "What is the performance advantage of running RAM in Dual-Channel mode rather than Single-Channel mode?",
        options: [
          "It doubles the memory bus width from 64-bit to 128-bit, effectively doubling theoretical memory bandwidth to the CPU",
          "It doubles the storage capacity of the solid state drive",
          "It makes the operating system install twice as fast from USB",
          "It allows the computer to run without a power supply"
        ],
        correctIndex: 0,
        explanation: "Dual-channel mode links two independent 64-bit memory controllers, doubling throughput from ~25 GB/s to ~50+ GB/s, significantly improving frame rates in CPU-bound applications."
      },
      {
        id: "m4-q4",
        category: "Memory Seating",
        question: "How should a technician properly seat a RAM stick into its motherboard DIMM slot?",
        options: [
          "Align the notch, press firmly and evenly with both thumbs on both ends until the plastic retention clips snap shut with an audible click",
          "Slide it sideways like an SD card",
          "Hammer it gently with a rubber mallet",
          "Tape it into the slot with electrical tape"
        ],
        correctIndex: 0,
        explanation: "RAM requires significant, even downward thumb pressure on both ends until the locking tabs automatically cam upward into the module's side notches."
      },
      {
        id: "m4-q5",
        category: "Storage Interfaces",
        question: "What protocol does a modern high-speed M.2 NVMe SSD use to communicate directly with the processor?",
        options: [
          "PCIe (Peripheral Component Interconnect Express) bus lanes using the NVMe protocol",
          "Legacy SATA III 6 Gbps AHCI interface",
          "Parallel IDE ribbon cable bus",
          "Universal Serial Bus (USB) 2.0"
        ],
        correctIndex: 0,
        explanation: "NVMe (Non-Volatile Memory Express) utilizes dedicated PCIe 3.0/4.0/5.0 lanes directly to the CPU, delivering speeds of 3,500 to 14,000 MB/s compared to SATA III's 550 MB/s ceiling."
      },
      {
        id: "m4-q6",
        category: "M.2 Dimensions",
        question: "What does the common M.2 form factor number '2280' signify?",
        options: [
          "22 mm wide by 80 mm long",
          "2,280 Megabytes of total storage space",
          "2280 Megahertz memory frequency",
          "Manufactured in the year 2028"
        ],
        correctIndex: 0,
        explanation: "M.2 module numbers specify physical dimensions: '2280' indicates 22mm width and 80mm length. Other sizes include 2230 (Steam Deck), 2242, and 22110."
      },
      {
        id: "m4-q7",
        category: "M.2 Installation",
        question: "When installing an M.2 SSD into its slot, at what angle should the gold connector pins be inserted?",
        options: [
          "At approximately a 30-degree upward angle until fully seated, then pushed down flat against the standoff screw",
          "Pushed straight down flat at a 90-degree angle from the top",
          "Upside down with labels facing the motherboard",
          "Inserted backwards into the audio ports"
        ],
        correctIndex: 0,
        explanation: "The M.2 socket contacts are designed for insertion at roughly 30 degrees. Once the gold fingers disappear into the slot, the drive is gently lowered flat and secured with the standoff screw."
      },
      {
        id: "m4-q8",
        category: "Storage Heatsinks",
        question: "What critical step must be performed before reinstalling a motherboard's metal M.2 heatsink shield over a newly installed SSD?",
        options: [
          "Peel off the blue or clear protective plastic film from the pre-applied thermal silicone pad on the underside of the heatsink",
          "Smear thermal paste over the labels",
          "Wet the thermal pad with tap water",
          "Remove all the metal screws permanently"
        ],
        correctIndex: 0,
        explanation: "Factory thermal pads have a peel-off plastic protective film. Leaving this film traps heat and causes M.2 NVMe controller chips to thermal throttle under heavy sustained writes."
      },
      {
        id: "m4-q9",
        category: "Memory Overclocking (XMP/EXPO)",
        question: "A user purchases 6000MHz DDR5 RAM, but Windows Task Manager shows it running at only 4800MHz. What setting must be enabled in the BIOS to reach advertised speeds?",
        options: [
          "Enable XMP (Extreme Memory Profile) or AMD EXPO (Extended Profiles for Overclocking)",
          "Overclock the CPU fan speed to 100%",
          "Increase Windows virtual memory pagefile to 100GB",
          "Reinstall Windows 11 in Safe Mode"
        ],
        correctIndex: 0,
        explanation: "All DDR5 boots at baseline JEDEC safety speeds (4800MHz). Enabling XMP (Intel) or EXPO (AMD) in the BIOS loads the manufacturer's pre-tested factory overclock timings and voltages."
      },
      {
        id: "m4-q10",
        category: "Storage Comparison",
        question: "Why are traditional mechanical Hard Disk Drives (HDDs) more vulnerable to physical damage than Solid State Drives (SSDs)?",
        options: [
          "HDDs contain spinning magnetic platters spinning at 7200 RPM and read/write heads floating nanometers above the surface that can crash upon impact",
          "HDDs are made entirely of glass that easily shatters",
          "HDDs catch fire if moved while running",
          "SSDs contain liquid mercury that absorbs shocks"
        ],
        correctIndex: 0,
        explanation: "Mechanical HDDs have precision moving heads. A physical drop or shock during operation causes a 'head crash', where the head scratches the magnetic coating, destroying data. SSDs have zero moving parts."
      },
      {
        id: "m4-q11",
        category: "Memory Volatility",
        question: "What is the primary operational difference between System RAM and Solid State Storage (SSD)?",
        options: [
          "RAM is fast, volatile temporary memory that loses all data when powered down; SSD storage is non-volatile permanent flash memory",
          "RAM stores files permanently; SSD loses files when restarted",
          "RAM is measured in Terabytes; SSD is measured in Megabytes",
          "RAM connects to Wi-Fi; SSD connects to Bluetooth"
        ],
        correctIndex: 0,
        explanation: "RAM is volatile high-speed scratch space for currently active programs. When the computer turns off, all data in RAM capacitors vanishes. SSDs use non-volatile NAND flash to store files permanently."
      },
      {
        id: "m4-q12",
        category: "Storage Health (S.M.A.R.T.)",
        question: "What diagnostic technology built into modern SSDs and HDDs monitors drive temperature, bad sectors, and remaining lifespan?",
        options: [
          "S.M.A.R.T. (Self-Monitoring, Analysis and Reporting Technology)",
          "TCP/IP Network Stack",
          "DirectX Diagnostic Tool",
          "Windows Defender Antivirus"
        ],
        correctIndex: 0,
        explanation: "S.M.A.R.T. telemetry tracks wear leveling count, reallocated sectors, power-on hours, and write endurance (TBW), alerting technicians before drive hardware fails completely."
      },
      {
        id: "m4-q13",
        category: "Memory Latency",
        question: "What does the memory specification 'CAS Latency' (e.g. CL16 or CL30) indicate?",
        options: [
          "The number of clock cycles between when a memory controller requests data and when that data is ready at the module pins",
          "The temperature at which the RAM begins to melt",
          "The physical length of the memory stick in centimeters",
          "The number of times the RAM can be rewritten before failing"
        ],
        correctIndex: 0,
        explanation: "Column Address Strobe (CAS) Latency measures cycle delay. Lower CAS latency at the same clock frequency results in faster real-world memory response times."
      },
      {
        id: "m4-q14",
        category: "Storage Sockets",
        question: "What happens if an M.2 NVMe SSD is installed in an M.2 slot that shares lanes with motherboard SATA ports 5 and 6?",
        options: [
          "SATA ports 5 and 6 will automatically be disabled by the motherboard chipset to free up PCIe/SATA lane routing",
          "The computer will catch fire",
          "The CPU will disable two cores",
          "The graphics card resolution will be cut in half"
        ],
        correctIndex: 0,
        explanation: "Due to limited chipset HSIO (High-Speed I/O) lane allocation, motherboards frequently share lanes. Populating specific M.2 slots turns off corresponding onboard SATA ports as noted in the manual."
      },
      {
        id: "m4-q15",
        category: "Storage Partitioning",
        question: "Which modern drive partition table style is required by UEFI systems to support boot drives larger than 2 Terabytes and Windows 11 Secure Boot?",
        options: [
          "GPT (GUID Partition Table)",
          "MBR (Master Boot Record)",
          "FAT16",
          "Floppy Disk Sector Format"
        ],
        correctIndex: 0,
        explanation: "GPT replaces legacy MBR. GPT supports drive partitions larger than 2TB, up to 128 primary partitions, and is strictly required for UEFI Secure Boot and Windows 11 installation."
      }
    ]
  },

  // ── MODULE 5: GRAPHICS CARD (GPU) & POWER SUPPLY (PSU) ──
  m5: {
    moduleNum: 5,
    moduleTitle: "Graphics Card (GPU) & Power Supply (PSU)",
    passingPercentage: 75,
    questions: [
      {
        id: "m5-q1",
        category: "GPU Installation",
        question: "Before pushing a dedicated graphics card into its motherboard PCIe x16 slot, what plastic tab on the end of the slot must be checked?",
        options: [
          "The PCIe retention latch/wing must be pushed open into the unlocked position",
          "The CMOS reset jumper must be removed",
          "The CPU cooler clip must be unscrewed",
          "The RAM retention arm must be pushed down"
        ],
        correctIndex: 0,
        explanation: "PCIe x16 slots have a retention latch at the rear. It must be clicked open before inserting the GPU. As the GPU seats firmly, this latch automatically snaps shut to lock the card."
      },
      {
        id: "m5-q2",
        category: "Chassis Clearance",
        question: "What must be removed from the rear of the PC chassis before a double-slot graphics card can be mounted?",
        options: [
          "The corresponding metal expansion slot blanking covers/brackets",
          "The entire chassis front panel",
          "The motherboard I/O shield",
          "The power supply exhaust grill"
        ],
        correctIndex: 0,
        explanation: "Modern graphics cards are dual-slot or triple-slot thick. The corresponding metal expansion slot slot covers on the chassis rear must be unscrewed or punched out so GPU display ports can poke through."
      },
      {
        id: "m5-q3",
        category: "Display Wiring",
        question: "Where should the HDMI or DisplayPort monitor cable be plugged into on a desktop that has a dedicated graphics card installed?",
        options: [
          "Directly into the video output ports of the dedicated graphics card itself",
          "Into the motherboard rear I/O HDMI port",
          "Into the front panel USB-C port",
          "Into the power supply AC socket"
        ],
        correctIndex: 0,
        explanation: "Plugging the monitor into the motherboard bypasses the high-performance discrete GPU, running games either on low-power integrated graphics or resulting in a blank black screen if the CPU has no iGPU."
      },
      {
        id: "m5-q4",
        category: "GPU Power Cables",
        question: "What is the key difference between an 8-pin CPU EPS cable and an 8-pin (6+2) PCIe power cable from the power supply?",
        options: [
          "They have completely different pinout voltages and physical keying shapes; forcing a CPU cable into a GPU will cause a dead short and fire",
          "They are 100% identical and can be swapped freely",
          "The CPU cable is for monitors; the PCIe cable is for keyboards",
          "The PCIe cable only carries audio signals"
        ],
        correctIndex: 0,
        explanation: "CPU EPS cables deliver +12V on top and Ground on bottom. PCIe 8-pin cables deliver Ground on top and +12V on bottom. Pin shapes differ to prevent catastrophic cross-connection."
      },
      {
        id: "m5-q5",
        category: "PSU Efficiency Ratings",
        question: "What does an '80 PLUS Gold' certification on a power supply signify?",
        options: [
          "The power supply operates at 87% to 90%+ energy efficiency under typical load, wasting less power as heat",
          "The power supply is made out of 24-karat gold metal",
          "The power supply will last for exactly 80 years",
          "The power supply delivers 80 volts of electricity"
        ],
        correctIndex: 0,
        explanation: "80 PLUS certifies that a PSU converts wall AC power to internal DC with high efficiency (87%-90% for Gold at 50% load). Higher efficiency saves electricity and reduces internal operating heat."
      },
      {
        id: "m5-q6",
        category: "Modular Power Supplies",
        question: "What is the defining feature of a Fully Modular Power Supply Unit?",
        options: [
          "All power cables are completely detachable from the PSU body, allowing technicians to plug in only the specific cables needed for the build",
          "The power supply can be disassembled into pieces while running",
          "The power supply changes colors with software",
          "The power supply requires no electrical outlet"
        ],
        correctIndex: 0,
        explanation: "Fully modular power supplies allow users to connect only the exact cables required (e.g. 24-pin, 8-pin EPS, PCIe), eliminating unused cable clutter and optimizing internal chassis airflow."
      },
      {
        id: "m5-q7",
        category: "Cable Swapping Hazards",
        question: "Why should modular cables from one brand or model of power supply NEVER be mixed or used with a power supply from a different brand?",
        options: [
          "The pinout configuration on the PSU-side modular sockets is not standardized across manufacturers, which will route 12V directly into ground pins and fry connected hardware",
          "Because the cables are patented by copyright law",
          "Because different brands use different copper colors",
          "The cables will refuse to boot due to Windows security"
        ],
        correctIndex: 0,
        explanation: "While the component-side plugs (24-pin, 8-pin PCIe) are standardized, the pinouts on the power supply casing vary widely between brands and OEM platforms (Seasonic, Channel Well, Super Flower)."
      },
      {
        id: "m5-q8",
        category: "PSU Orientation",
        question: "In a modern desktop case with a bottom-mounted PSU shroud and a bottom intake dust filter, which way should the power supply fan face?",
        options: [
          "Facing DOWNWARD toward the bottom ventilated intake vent to pull fresh outside air through the dust filter",
          "Facing upward against a solid metal shroud plate",
          "Facing sideways against the glass panel",
          "The fan should be disconnected to reduce noise"
        ],
        correctIndex: 0,
        explanation: "Facing the fan downward creates an independent thermal loop: the PSU draws cool room air through the bottom filter and exhausts hot air out the rear without sucking in hot air from the GPU."
      },
      {
        id: "m5-q9",
        category: "Modern 12VHPWR Cable",
        question: "What critical installation precaution must be taken when plugging the 16-pin 12VHPWR (PCIe 5.0 12V-2x6) power cable into a high-end RTX 40-series graphics card?",
        options: [
          "Ensure the connector is inserted 100% flush until the latch audibly clicks with ZERO visible gap, and avoid severe bending right at the connector base",
          "Leave it half-inserted so it stays cool",
          "Wiggle it continuously while gaming",
          "Spray water on it to lower operating temperatures"
        ],
        correctIndex: 0,
        explanation: "Due to high current density (up to 600W across 12 power pins), partial seating increases electrical contact resistance, causing localized overheating and melted plastic connectors."
      },
      {
        id: "m5-q10",
        category: "PSU Wattage Calculation",
        question: "A system has a 250W GPU, a 150W CPU, and 50W of auxiliary drives and fans (Total = 450W). What recommended PSU wattage should be chosen to ensure adequate headroom?",
        options: [
          "650W to 750W (providing 30%-40% safety headroom for transient power spikes)",
          "Exactly 450W with zero headroom",
          "300W because components never use full power",
          "2,000W because more wattage makes games run faster"
        ],
        correctIndex: 0,
        explanation: "Modern GPUs exhibit microsecond 'transient power spikes' up to 1.5x–2x TDP. Choosing a 650W-750W PSU ensures high efficiency (50-60% load curve) and prevents unexpected OCP tripping."
      },
      {
        id: "m5-q11",
        category: "GPU Sag Prevention",
        question: "What mechanical problem can occur over time with massive 3-slot modern graphics cards, and how is it prevented?",
        options: [
          "GPU Sag (droop on the unsupported corner), which can stress the motherboard PCIe slot and is prevented using an anti-sag support bracket or pillar",
          "The card will spin around inside the chassis",
          "The graphics card fans will fly off",
          "The GPU will bend the glass panel outward"
        ],
        correctIndex: 0,
        explanation: "Heavy copper heatsinks (often exceeding 1.5–2.0 kg) cause the outer corner of the GPU to droop. Over months, this mechanical strain can crack solder balls beneath the GPU die or tear the PCIe slot."
      },
      {
        id: "m5-q12",
        category: "PCIe Power Delivery",
        question: "How much electrical power can a standard motherboard PCIe x16 slot provide directly to an expansion card without auxiliary power cables?",
        options: [
          "Up to 75 Watts",
          "Up to 500 Watts",
          "Exactly 0 Watts; all power comes from cables",
          "Up to 10 Watts only"
        ],
        correctIndex: 0,
        explanation: "The PCI-SIG specification states that a standard PCIe x16 slot supplies up to 75W of power (combining +12V and +3.3V pins). Cards drawing more than 75W require auxiliary 6-pin/8-pin power cables."
      },
      {
        id: "m5-q13",
        category: "PSU Circuit Protections",
        question: "What does the PSU protection feature 'OCP' stand for, and what does it do?",
        options: [
          "Over Current Protection — instantly shuts down the power supply if current on any rail exceeds safe limits, preventing melted wires",
          "Over Clock Power — boosts graphics card speeds automatically",
          "Optical Cable Protocol — transmits audio via light",
          "Output Current Phase — changes AC frequency"
        ],
        correctIndex: 0,
        explanation: "Over Current Protection (OCP) constantly monitors amperage on each DC rail (+12V, +5V, +3.3V). If an electrical short occurs, OCP cuts power in milliseconds to prevent fire and component destruction."
      },
      {
        id: "m5-q14",
        category: "PCIe Retention Removal",
        question: "When uninstalling a graphics card to clean or replace it, what must a technician do before pulling the card upwards?",
        options: [
          "Reach in and press down on the rear PCIe retention plastic latch to release the lock while unscrewing the chassis rear bracket screws",
          "Yank the graphics card with full force directly upward",
          "Unscrew the motherboard from the case with the GPU still attached",
          "Cut the PCIe slot with wire cutters"
        ],
        correctIndex: 0,
        explanation: "Yanking a GPU while the rear retention latch is locked will physically rip the plastic PCIe slot straight off the motherboard PCB, severing dozens of microscopic copper traces."
      },
      {
        id: "m5-q15",
        category: "Graphics Display Standards",
        question: "Which digital display connector supports both high refresh-rate video (up to 240Hz+ at 4K) and adaptive sync (G-Sync/FreeSync) with a physical locking clip mechanism?",
        options: [
          "DisplayPort (DP)",
          "Legacy VGA analog 15-pin connector",
          "Composite RCA Yellow video cable",
          "S-Video mini-DIN port"
        ],
        correctIndex: 0,
        explanation: "DisplayPort (DP 1.4 / DP 2.1) is the PC gaming standard, offering higher packetized bandwidth, multi-stream daisy chaining, adaptive sync, and mechanical latching tabs."
      }
    ]
  },

  // ── MODULE 6: PC CHASSIS, AIRFLOW PHYSICS & CABLING ──
  m6: {
    moduleNum: 6,
    moduleTitle: "PC Chassis, Airflow Physics & Cabling",
    passingPercentage: 75,
    questions: [
      {
        id: "m6-q1",
        category: "Airflow Physics",
        question: "What is the key difference between Positive Air Pressure and Negative Air Pressure inside a PC chassis?",
        options: [
          "Positive pressure means more intake CFM than exhaust CFM, forcing air out through chassis gaps and preventing dust buildup through filtered intakes",
          "Negative pressure means the computer has no air inside and operates in a vacuum",
          "Positive pressure makes cooling fans spin twice as fast",
          "Negative pressure is only used when the PC is submerged in mineral oil"
        ],
        correctIndex: 0,
        explanation: "With positive pressure (more intake than exhaust), all air enters through removable dust mesh filters, and slight internal pressure pushes air out of cracks, keeping the chassis dust-free."
      },
      {
        id: "m6-q2",
        category: "Fan Orientation",
        question: "How can a technician visually identify the airflow direction of a standard 120mm/140mm cooling fan without plugging it in?",
        options: [
          "Air flows towards the side with the plastic structural support frame (the motor hub side with the cable and specification sticker)",
          "Air always flows towards the shiny logo sticker on the open blade side",
          "Air flows outwards in both directions simultaneously",
          "All fans have directional arrows that only glow under blacklight"
        ],
        correctIndex: 0,
        explanation: "Most fans exhaust air towards the rear stator support cross-arms (where the motor hub wire exits). Many fans also have subtle directional arrows molded into the outer plastic frame."
      },
      {
        id: "m6-q3",
        category: "Front-to-Back Airflow",
        question: "What is the gold standard airflow pattern for conventional desktop tower cases?",
        options: [
          "Intake from the Front and Bottom; Exhaust out through the Rear and Top",
          "Intake from the Rear; Exhaust out through the Front",
          "Intake from the Top; Exhaust out through the Bottom against natural convection",
          "All fans configured as exhaust with zero intake"
        ],
        correctIndex: 0,
        explanation: "Drawing cool ambient air from the front and bottom, and exhausting heated air out the rear and top aligns with natural thermal convection (hot air rises) and provides a clean cross-flow."
      },
      {
        id: "m6-q4",
        category: "Dust Filtration",
        question: "Why should intake fan positions always be equipped with fine mesh dust filters while exhaust fan positions do not require filters?",
        options: [
          "Intake fans pull room dust into the chassis; filtering exhaust fans would restrict warm air egress and trap internal dust",
          "Dust filters are flammable if exposed to exhaust heat",
          "Exhaust fans generate static electricity if filtered",
          "Motherboards will not detect fans that have exhaust filters"
        ],
        correctIndex: 0,
        explanation: "Filters block airborne lint and pet hair from entering the system. Exhaust ports are pushing air outward, so adding a filter on exhaust only impedes airflow and adds acoustic restriction."
      },
      {
        id: "m6-q5",
        category: "Cable Routing Strategy",
        question: "What is the primary technical reason for routing cables behind the motherboard tray rather than letting them hang loosely across the front components?",
        options: [
          "To eliminate airflow obstruction and prevent loose cables from brushing against spinning fan blades or causing hot-air turbulence",
          "To hide cables so the electricity travels faster",
          "Because cables emit harmful magnetic radiation if left visible",
          "To prevent Windows operating system errors"
        ],
        correctIndex: 0,
        explanation: "Tidying cables behind the tray keeps the main chamber open for laminar airflow and prevents cables from dropping into fan blades, which can break fan impellers and stall cooling."
      },
      {
        id: "m6-q6",
        category: "Cable Tie Best Practices",
        question: "What fastener should be used along chassis tie-down anchor loops to safely secure cable bundles without risking damage to wire insulation?",
        options: [
          "Reusable hook-and-loop (Velcro) straps or flush-cut zip ties",
          "Bare metal twist-ties with exposed sharp steel wire",
          "Staples driven into the metal frame",
          "Clear packing tape or duct tape"
        ],
        correctIndex: 0,
        explanation: "Velcro straps allow painless future cable additions without scissors. If zip ties are used, cut them flush so sharp plastic edges do not slice technicians' fingers during maintenance."
      },
      {
        id: "m6-q7",
        category: "CPU EPS Cable Routing",
        question: "When is the optimal time to route the 8-pin CPU EPS 12V power cable through the chassis top cutout?",
        options: [
          "Before screwing in the motherboard or mounting a large top-mounted air cooler/radiator",
          "After all components and graphics cards are fully assembled and locked in place",
          "While the computer is running",
          "It does not matter because hands easily fit into 1cm gaps"
        ],
        correctIndex: 0,
        explanation: "The top-left corner of the chassis is notoriously cramped once a large CPU tower cooler or top radiator is installed. Routing the 8-pin EPS cable beforehand saves tremendous frustration."
      },
      {
        id: "m6-q8",
        category: "Chassis Standoff Verification",
        question: "What catastrophic event happens if an extra standoff is installed in a chassis position where the motherboard has NO corresponding screw hole?",
        options: [
          "The stray metal standoff touches copper traces or solder balls on the back of the motherboard, causing a dead electrical short that can destroy the board",
          "The motherboard will simply float higher in the case",
          "The graphics card will automatically overclock",
          "The computer will boot normally with extra grounding"
        ],
        correctIndex: 0,
        explanation: "An extra standoff left in a non-standard hole acts as a conductive metal bridge against rear circuit traces, triggering dead shorts upon power-up that blow VRM chips."
      },
      {
        id: "m6-q9",
        category: "Tempered Glass Care",
        question: "Why should tempered glass side panels NEVER be set down directly on ceramic or porcelain tile floors during assembly?",
        options: [
          "Ceramic tile is extremely hard; even a microscopic tap on the edge of tempered glass releases internal surface tension, causing the panel to instantly shatter into thousands of pebbles",
          "Tile floors cause the glass to lose its transparency",
          "The magnets inside tile will erase SSD data",
          "The glass will scratch the floor tiles permanently"
        ],
        correctIndex: 0,
        explanation: "Tempered glass has immense tensile surface tension. Ceramic tile is harder than glass; point contact with an edge corner creates an instantaneous shock wave that shatters the pane."
      },
      {
        id: "m6-q10",
        category: "Fan Curves (PWM)",
        question: "What is a 'Fan Curve' configured in the motherboard UEFI or fan control software?",
        options: [
          "A customized graph that increases fan RPM percentage proportionally as component temperatures rise",
          "The physical curvature of the fan blade aerofoil",
          "The angle at which the chassis stands on the desk",
          "The curved shape of RGB lighting strips"
        ],
        correctIndex: 0,
        explanation: "A fan curve maps temperature to fan speed (e.g. 30% RPM below 45°C for silent operation, ramping smoothly to 100% RPM at 80°C under heavy load)."
      },
      {
        id: "m6-q11",
        category: "Chassis Form Factors",
        question: "Which chassis form factor is designed to house standard ATX or E-ATX motherboards and extensive custom liquid cooling loops with 360mm/420mm radiators?",
        options: [
          "Full-Tower (E-ATX chassis)",
          "Small Form Factor (SFF) Mini-ITX toaster case",
          "Mini-Tower (Micro-ATX chassis)",
          "All-in-One integrated monitor case"
        ],
        correctIndex: 0,
        explanation: "Full-Tower cases offer 550mm+ height, 7-8 expansion slots, dual PSU mounts, and clearance for multiple thick 360mm or 420mm radiators."
      },
      {
        id: "m6-q12",
        category: "Front Panel I/O Cabling",
        question: "Which internal front panel cable has a distinct 19-pin rectangular connector with a center alignment notch on the long side?",
        options: [
          "Internal USB 3.0 / USB 3.2 Gen 1 Front Panel Header Cable",
          "9-pin Front Panel Audio (HD Audio) Cable",
          "2-pin Power Switch Cable",
          "SATA Power Cable"
        ],
        correctIndex: 0,
        explanation: "The USB 3.0 19-pin header has 19 gold pins and an alignment key notch. The pins are fragile and easily bend if forced at an angle into the motherboard socket."
      },
      {
        id: "m6-q13",
        category: "Audio Cabling",
        question: "What key notch configuration identifies the standard 9-pin Front Panel HD Audio connector to prevent plugging it into a USB 2.0 header?",
        options: [
          "Pin 8 is missing (blocked) on HD Audio, whereas Pin 9 is missing (blocked) on USB 2.0 headers",
          "HD Audio is painted bright red",
          "USB 2.0 has 24 pins",
          "HD Audio connectors use round RCA jacks inside the case"
        ],
        correctIndex: 0,
        explanation: "Both are 10-pin block form factors, but HD Audio has Pin 8 key-blocked, while USB 2.0 has Pin 9 key-blocked. This prevents audio signals from being shorted into USB 5V lines."
      },
      {
        id: "m6-q14",
        category: "Airflow Noise (CFM vs dBA)",
        question: "Why do larger 140mm fans generally produce less acoustic noise than smaller 80mm fans while moving the same volume of air?",
        options: [
          "Larger fans have greater blade surface area, allowing them to spin at lower RPM to achieve the same airflow (CFM)",
          "140mm fans use magnetic levitation that makes zero sound",
          "80mm fans push air at supersonic speeds",
          "Larger fans absorb sound waves like a sponge"
        ],
        correctIndex: 0,
        explanation: "Flow rate equals velocity multiplied by area. A 140mm fan spinning at a gentle 800 RPM moves the same CFM of air as an 80mm fan shrieking at 2,000+ RPM."
      },
      {
        id: "m6-q15",
        category: "Chassis Acoustic Dampening",
        question: "What hardware component is commonly installed beneath mechanical 3.5-inch hard drive trays and case cooling fan corners to stop vibrating drone noise?",
        options: [
          "Anti-vibration rubber or silicone grommets / pads",
          "Metal lock washers",
          "Clear epoxy glue",
          "Ceramic insulators"
        ],
        correctIndex: 0,
        explanation: "Silicone rubber grommets acoustically decouple vibrating motors from the sheet-metal chassis, preventing harmonic buzzing and chassis resonance."
      }
    ]
  },

  // ── MODULE 7: VIRTUAL PC ASSEMBLY & POST TROUBLESHOOTING ──
  m7: {
    moduleNum: 7,
    moduleTitle: "Virtual PC Assembly & POST Troubleshooting",
    passingPercentage: 75,
    questions: [
      {
        id: "m7-q1",
        category: "Assembly Order",
        question: "Why do experienced PC builders perform a 'breadboard' or outside-the-case test assembly on the motherboard box before installing parts into the chassis?",
        options: [
          "To verify that the CPU, RAM, GPU, and PSU boot successfully into BIOS before spending time cable-managing inside the confined chassis",
          "Because motherboards only function when resting on cardboard",
          "To test if the PC can withstand falling off the desk",
          "To warm up the solder joints before applying screws"
        ],
        correctIndex: 0,
        explanation: "An external pre-test verifies that all core silicon POSTs cleanly. If a part is Dead-On-Arrival (DOA), diagnosing and RMA'ing it is ten times easier than disassembling a complete build."
      },
      {
        id: "m7-q2",
        category: "POST Verification",
        question: "What does the computer diagnostic acronym 'POST' stand for?",
        options: [
          "Power-On Self-Test",
          "Processor Operating System Transfer",
          "Primary Output Screen Terminal",
          "Power Override System Toggle"
        ],
        correctIndex: 0,
        explanation: "Power-On Self-Test (POST) is the initial diagnostic routine executed by UEFI/BIOS firmware immediately upon power-up to verify memory, processor, keyboard, and storage controllers."
      },
      {
        id: "m7-q3",
        category: "Diagnostic Beep Codes",
        question: "What does a single short, crisp beep from a motherboard's internal piezo speaker traditionally mean during startup?",
        options: [
          "POST has passed successfully with zero critical hardware errors, and control is handed over to the boot drive",
          "The CPU has suffered catastrophic thermal damage",
          "The power supply fan has stopped spinning",
          "The motherboard battery is completely dead"
        ],
        correctIndex: 0,
        explanation: "One short beep is the universal legacy IBM/AMI/Award BIOS code for successful POST completion ('All Systems Green'). Continuous or multiple beeps indicate specific hardware faults."
      },
      {
        id: "m7-q4",
        category: "Troubleshooting No POST",
        question: "A technician powers on a newly built PC: fans spin and RGB lights turn on, but the monitor displays 'No Signal' and the keyboard LEDs never illuminate. What is the most common cause?",
        options: [
          "RAM memory modules are not seated 100% firmly down into the slots, or the monitor is plugged into the motherboard instead of the GPU",
          "The Windows 11 product key was typed incorrectly",
          "The mouse cursor is hidden offscreen",
          "The room ambient temperature is too warm"
        ],
        correctIndex: 0,
        explanation: "RAM requires significant force to seat until both tabs click shut. Unseated RAM is the #1 cause of 'fans spin, no POST'. Plugging the monitor into the motherboard while having a discrete GPU is #2."
      },
      {
        id: "m7-q5",
        category: "Clear CMOS Procedure",
        question: "How does a technician perform a hardware CMOS reset if an unstable BIOS memory overclock prevents the computer from booting into BIOS?",
        options: [
          "Unplug the AC power cord, bridge the two 'CLR_CMOS' pins with a metal screwdriver tip for 10 seconds (or remove the CR2032 battery for 5 minutes)",
          "Smack the top of the chassis with an open hand",
          "Leave the computer turned off for 3 weeks",
          "Reinstall the CPU cooler heatsink"
        ],
        correctIndex: 0,
        explanation: "Bridging the CLR_CMOS header drains power from the CMOS RAM, clearing custom voltages and restoring safe factory default UEFI settings."
      },
      {
        id: "m7-q6",
        category: "Power Button Testing",
        question: "How can a technician power on a motherboard resting outside the case on a test bench without front panel cables?",
        options: [
          "Gently bridge the two 'POWER SW' pins on the front panel header for half a second with the tip of a flathead screwdriver",
          "Short the 24-pin ATX connector with a copper wire",
          "Clap hands together near the motherboard audio jack",
          "Blow hot air onto the CPU socket"
        ],
        correctIndex: 0,
        explanation: "The chassis power button is merely a momentary contact switch. Touching the two Power SW pins momentarily with a conductive screwdriver tip safely triggers the motherboard power-on circuit."
      },
      {
        id: "m7-q7",
        category: "POST Debug Codes",
        question: "On higher-end motherboards with a 2-digit alphanumeric 7-segment display, what does code '00' or 'FF' typically indicate?",
        options: [
          "The CPU is not initializing, not seated properly, has no EPS power connected, or has dead pins",
          "The computer is 100% finished installing Windows",
          "The cooling fans are spinning at 100% speed",
          "The graphics card is operating at full resolution"
        ],
        correctIndex: 0,
        explanation: "Code '00' or 'FF' indicates the CPU microcode has failed to execute even its first instruction cycle, usually caused by missing 8-pin EPS power, unseated CPU, or an outdated BIOS."
      },
      {
        id: "m7-q8",
        category: "Troubleshooting Power Cycles",
        question: "A computer turns on for 3 seconds, fans spin, then it immediately shuts off and restarts in an endless loop ('boot loop'). What is a frequent cause?",
        options: [
          "RAM training failure or memory incompatibility in the current slots, or shorted standoff underneath",
          "The HDMI cable is plugged into the wall",
          "The monitor brightness is set to zero",
          "The computer case color does not match the desk"
        ],
        correctIndex: 0,
        explanation: "During initial boot, modern DDR4/DDR5 platforms conduct 'memory training'. If timings fail or a short is detected, the board restarts to attempt looser secondary timings."
      },
      {
        id: "m7-q9",
        category: "Operating System Installation",
        question: "What key combination opens the Windows 11 Command Prompt during setup to bypass network connection requirements if Wi-Fi drivers are not pre-installed?",
        options: [
          "Shift + F10 (then typing 'OOBE\\BYPASSNRO')",
          "Control + Alt + Delete",
          "Windows Key + L",
          "Alt + F4"
        ],
        correctIndex: 0,
        explanation: "Pressing Shift+F10 opens the setup CMD prompt. Running 'OOBE\\BYPASSNRO' restarts setup with an option to select 'I don't have internet', allowing offline local account creation."
      },
      {
        id: "m7-q10",
        category: "Firmware Updates",
        question: "What feature on modern motherboards allows flashing a new BIOS version from a USB drive without even having a CPU or RAM installed?",
        options: [
          "BIOS Flashback (Q-Flash Plus / Flash BIOS Button)",
          "Intel Rapid Storage Technology",
          "Windows Update Assistant",
          "DirectX Diagnostic Tool"
        ],
        correctIndex: 0,
        explanation: "Dedicated BIOS Flashback buttons trigger an onboard hardware microcontroller to read a renamed BIOS ROM from a FAT32 USB drive and flash the chip directly without needing a compatible CPU."
      },
      {
        id: "m7-q11",
        category: "Driver Installation",
        question: "After successfully installing the operating system, which device driver should always be downloaded and installed first from the motherboard manufacturer's website?",
        options: [
          "Motherboard Chipset Drivers (and LAN/Wi-Fi drivers)",
          "Third-party RGB lighting bloatware",
          "Web browser games",
          "Printer scanning utilities"
        ],
        correctIndex: 0,
        explanation: "Chipset drivers establish proper OS communication with the processor PCIe controller, power management states, USB hubs, and memory bus controllers."
      },
      {
        id: "m7-q12",
        category: "Thermal Testing",
        question: "Which free software utility is internationally trusted by hardware technicians to monitor real-time CPU and GPU temperatures, voltages, and fan speeds?",
        options: [
          "HWiNFO64 or CPU-Z / GPU-Z",
          "Microsoft Paint",
          "Windows Media Player",
          "Adobe Acrobat Reader"
        ],
        correctIndex: 0,
        explanation: "HWiNFO64 provides granular sensor telemetry across every thermal diode, VRM phase temperature, PCIe bus wattage, and throttling flag in the system."
      },
      {
        id: "m7-q13",
        category: "Stability Stress Testing",
        question: "What is the purpose of running stress-test tools like Prime95, Cinebench, or FurMark for 30 minutes on a freshly built system?",
        options: [
          "To verify thermal dissipation under maximum synthetic power load and prove hardware stability before handing the PC to the client",
          "To drain the battery so it charges faster",
          "To test the volume of the speakers",
          "To burn off dust inside the chassis"
        ],
        correctIndex: 0,
        explanation: "Stress testing exposes marginal memory timings, defective PSU voltage regulation, inadequate cooler mounting, and unstable silicon clocks before the machine is put into production."
      },
      {
        id: "m7-q14",
        category: "Storage Verification",
        question: "A newly installed secondary 2TB SATA hard drive does not show up in 'This PC' in Windows File Explorer. What must be done in Windows Disk Management?",
        options: [
          "Initialize the disk (GPT) and create a New Simple Volume formatted with the NTFS file system",
          "Throw away the drive because it is defective",
          "Unplug the CPU power cable",
          "Change the monitor resolution"
        ],
        correctIndex: 0,
        explanation: "Brand-new drives come unpartitioned and unformatted. Technicians must open 'diskmgmt.msc', initialize the disk as GPT, and create a formatted NTFS volume with an assigned drive letter."
      },
      {
        id: "m7-q15",
        category: "TESDA NC II Certification",
        question: "According to standard TESDA Computer Systems Servicing (CSS) NC II assessment criteria, what must a student demonstrate upon concluding a successful assembly?",
        options: [
          "Clean cable management, safe ESD compliance, successful POST into UEFI BIOS, correct component detection, and functional OS installation",
          "Fastest typing speed on a mechanical keyboard",
          "Connecting the highest number of RGB lights",
          "Running the computer with the case open on the floor"
        ],
        correctIndex: 0,
        explanation: "TESDA NC II Core Competencies require students to assemble computer hardware in accordance with OHS (Occupational Health & Safety) procedures, verify POST, configure BIOS settings, and install software."
      }
    ]
  }
};

/**
 * Get the 15-question quiz for a given module
 */
export function getModuleQuiz(moduleNum) {
  const key = `m${moduleNum}`;
  return MODULE_QUIZZES[key] || MODULE_QUIZZES.m1;
}

/**
 * Save quiz results for an authenticated or guest student
 */
export function saveStudentQuizScore({
  email = null,
  moduleNum,
  score,
  total = 15,
  answers = []
}) {
  try {
    const storageKey = email ? `buildlab.quiz.scores.${email}` : "buildlab.quiz.scores.guest";
    const existingRaw = localStorage.getItem(storageKey);
    const records = existingRaw ? JSON.parse(existingRaw) : {};

    const percentage = Math.round((score / total) * 100);
    const passed = percentage >= 75;

    // Numerical equivalent grade (Philippine collegiate grading: 1.00 is 97-100%, 1.25 is 93-96%, etc.)
    let gradeEquivalent = "5.00";
    let qualitativeRating = "Did Not Pass / Retake";
    if (percentage >= 97) { gradeEquivalent = "1.00"; qualitativeRating = "Excellent / Mastery"; }
    else if (percentage >= 93) { gradeEquivalent = "1.25"; qualitativeRating = "Superior"; }
    else if (percentage >= 89) { gradeEquivalent = "1.50"; qualitativeRating = "Very Good"; }
    else if (percentage >= 85) { gradeEquivalent = "1.75"; qualitativeRating = "Good"; }
    else if (percentage >= 80) { gradeEquivalent = "2.00"; qualitativeRating = "Satisfactory"; }
    else if (percentage >= 75) { gradeEquivalent = "2.25"; qualitativeRating = "Passed (DepEd/TESDA Standard)"; }

    const entry = {
      moduleNum,
      score,
      total,
      percentage,
      passed,
      gradeEquivalent,
      qualitativeRating,
      timestamp: new Date().toISOString(),
      dateFormatted: new Date().toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }),
      attempts: (records[moduleNum]?.attempts || 0) + 1,
      bestScore: Math.max(records[moduleNum]?.bestScore || 0, score)
    };

    records[moduleNum] = entry;
    localStorage.setItem(storageKey, JSON.stringify(records));

    // Dispatch global event so StudentDashboard and other components instantly update telemetry
    window.dispatchEvent(new CustomEvent("buildlab:quiz-score-updated", { detail: entry }));

    return entry;
  } catch (err) {
    console.error("Failed to save student quiz score:", err);
    return null;
  }
}

/**
 * Retrieve all quiz records for a student
 */
export function getStudentQuizRecords(email = null) {
  try {
    const storageKey = email ? `buildlab.quiz.scores.${email}` : "buildlab.quiz.scores.guest";
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Compute General Weighted Average (GWA) and Academic Standing
 */
export function computeStudentAcademicStanding(email = null) {
  const records = getStudentQuizRecords(email);
  const entries = Object.values(records);

  if (entries.length === 0) {
    return {
      completedModulesCount: 0,
      totalModules: 7,
      gwa: "N/A",
      averagePercentage: 0,
      academicStanding: "Incomplete / Enrolled",
      allPassed: false
    };
  }

  const totalScore = entries.reduce((acc, curr) => acc + curr.score, 0);
  const totalMax = entries.reduce((acc, curr) => acc + curr.total, 0);
  const avgPct = Math.round((totalScore / totalMax) * 100);

  const numericGrades = entries.map((e) => parseFloat(e.gradeEquivalent)).filter((g) => !isNaN(g));
  const avgGwa = (numericGrades.reduce((a, b) => a + b, 0) / numericGrades.length).toFixed(2);

  const passedCount = entries.filter((e) => e.passed).length;
  const allPassed = passedCount === 7;

  let standing = "Good Standing";
  if (avgPct >= 93) standing = "President's Lister / High Honors";
  else if (avgPct >= 85) standing = "Dean's Lister / Honors";
  else if (avgPct < 75) standing = "Needs Remediation / Retake Required";

  return {
    completedModulesCount: entries.length,
    passedModulesCount: passedCount,
    totalModules: 7,
    gwa: avgGwa,
    averagePercentage: avgPct,
    academicStanding: standing,
    allPassed
  };
}
