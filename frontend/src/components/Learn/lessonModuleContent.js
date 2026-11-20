/**
 * Lesson Module Content - long-form, syllabus-style reading material
 * for every CSS NC II topic in the curriculum.
 *
 * Each entry powers Page 1 (the continuous PDF-style module) and
 * Page 2 (the video page's bulleted summary) of LessonPresentationView.
 * Content is adapted from public technical references (Wikipedia, 80 PLUS,
 * DepEd/TESDA CSS NC II competency standards) and proven bench practice.
 */

const ESD_REF = { label: "Wikipedia - Electrostatic discharge", url: "https://en.wikipedia.org/wiki/Electrostatic_discharge" };
const DEPED_REF = { label: "DepEd TVL - Computer Systems Servicing NC II", url: "https://www.deped.gov.ph/" };
const TESDA_REF = { label: "TESDA - CSS NC II Training Regulations", url: "https://www.tesda.gov.ph/" };
const MOTHERBOARD_REF = { label: "Wikipedia - Motherboard", url: "https://en.wikipedia.org/wiki/Motherboard" };
const FormFactorRef = { label: "Wikipedia - Advanced Technology eXtended", url: "https://en.wikipedia.org/wiki/Advanced_Technology_Extended" };
const CPU_REF = { label: "Wikipedia - CPU socket", url: "https://en.wikipedia.org/wiki/CPU_socket" };
const RAM_REF = { label: "Wikipedia - Dual-channel architecture", url: "https://en.wikipedia.org/wiki/Dual-channel_architecture" };
const PCIe_REF = { label: "Wikipedia - PCI Express", url: "https://en.wikipedia.org/wiki/PCI_Express" };
const PSU_REF = { label: "80 PLUS - Efficiency certification", url: "https://www.80plus.org/" };
const AIRFLOW_REF = { label: "Wikipedia - Computer case cooling", url: "https://en.wikipedia.org/wiki/Computer_case_cooling" };
const POST_REF = { label: "Wikipedia - Power-on self-test", url: "https://en.wikipedia.org/wiki/Power-on_self-test" };
const NVME_REF = { label: "Wikipedia - NVM Express", url: "https://en.wikipedia.org/wiki/NVM_Express" };
const THERMAL_REF = { label: "Wikipedia - Thermal paste", url: "https://en.wikipedia.org/wiki/Thermal_paste" };

export const LESSON_MODULE_CONTENT = {
  /* ═══════════════ MODULE 1 ═══════════════ */
  "1.1-esd-prep": {
    videoSummary: [
      "ESD is an invisible spark: a discharge you cannot feel can still destroy microscopic silicon traces inside a chip.",
      "Work on a bare wood desk, a silicone mat, or the cardboard motherboard box - never on carpet, rugs, or the shiny anti-static bag.",
      "Ground yourself by touching bare metal on a plugged-in, switched-OFF power supply every few minutes, or wear a wrist strap clipped to that same metal.",
      "Set up the bench before touching parts: good light, a magnetic screw tray, and a clear clutter-free surface prevent costly mistakes.",
      "Leave every component in its anti-static bag until the exact moment it is needed on the bench.",
    ],
    moduleDoc: {
      intro:
        "Electrostatic discharge (ESD) is the sudden flow of electricity between two objects at different electrical potentials. In a computer servicing laboratory, the human body is the most common source: walking across a carpet or sliding a sleeve over a chair can charge a technician to several thousand volts. Modern CPUs and memory chips operate on roughly one volt, so a spark that is too small for a person to feel can still melt the microscopic copper traces inside a semiconductor. This module establishes the safe work habits required before any hardware is ever touched, in line with DepEd TVL and TESDA Computer Systems Servicing NC II occupational safety standards.",
      objectives: [
        "Explain how electrostatic discharge damages sensitive electronic components.",
        "Identify safe and unsafe work surfaces and grounding methods.",
        "Set up a clutter-free, ESD-safe assembly bench before handling hardware.",
      ],
      sections: [
        {
          heading: "1.1.1 The Physics of Electrostatic Discharge",
          paragraphs: [
            "Static electricity is created whenever two different materials touch and separate - a process called triboelectric charging. Shoes on carpet, plastic chair backs on fabric, and even tape pulled from a roll all transfer electrons from one surface to another. The charge stays on your body until it finds a path to ground, and that sudden path is the discharge. Because the current flows through a tiny contact point, the local heat and voltage spike can punch through the thin oxide layers inside a MOSFET transistor.",
            "The danger is that ESD damage is often latent. A chip that was zapped during assembly may boot correctly today and fail randomly weeks later. This is why laboratories treat ESD prevention as a non-negotiable procedure rather than an optional precaution. Undetectable damage is still damage, and the cost is paid by the customer through intermittent lock-ups and corrupted data.",
          ],
          bullets: [
            "Triboelectric charging: friction between unlike materials separates electrons and builds a static charge.",
            "A human can carry 2,000–25,000 volts without feeling a thing; most chips fail well below 1,000 volts.",
            "Latent defects appear weeks later as random crashes, failed boots, or corrupted memory.",
            "Humid air bleeds charge away slowly; dry air and winter heating make ESD far more likely.",
          ],
          note: { tone: "warning", title: "Never test by feel", text: "If you can actually feel or hear the spark, the discharge is already far above the destruction threshold for a motherboard." },
        },
        {
          heading: "1.1.2 Safe Work Surfaces & Grounding",
          paragraphs: [
            "The work surface must either conduct charge away safely or refuse to build it up in the first place. A dedicated anti-static mat connected to earth ground is the professional standard, but a clean bare wooden table or the cardboard box the motherboard came in are perfectly acceptable classroom substitutes because they are non-conductive and do not generate static. What matters is that the surface is clean, dry, and free of loose debris.",
            "Grounding equalises the electrical potential between your body and the component so no charge can jump. The accepted technique is to leave the power supply plugged into a grounded wall outlet with its own switch set to OFF, then rest a hand on its unpainted metal chassis every few minutes. An anti-static wrist strap clipped to the same bare metal provides continuous grounding and is mandatory when handling exposed sockets or bare circuit boards.",
          ],
          bullets: [
            "Recommended: anti-static mat, bare wood, silicone mat, or the rigid cardboard motherboard box.",
            "Avoid: carpet, rugs, vinyl flooring, foam packaging, and socked feet on tile.",
            "PSU must be plugged in but switched OFF - the chassis grounds through the wall socket earth pin.",
            "Clip wrist straps to unpainted metal; paint and powder coating act as insulators.",
            "Keep jewellery, watches, and dangling sleeves away from the bench.",
          ],
        },
        {
          heading: "1.1.3 Bench Setup & Component Storage",
          paragraphs: [
            "A safe bench is also an organised bench. Prepare the complete tool kit before removing any part from its box: a magnetic #2 Phillips screwdriver, a small precision driver for M.2 screws, a magnetic parts tray, cable ties, and a torch or task light. Loose screws rolling across a desk are not just inconvenient - a screw dropped onto a live board can short a rail instantly.",
            "Components stay in their anti-static bags until the moment of installation. The bag's interior is static-dissipative and safe; its exterior is conductive and must never be used as a work surface. Stage parts in the order they will be installed, and put every removed screw straight into the magnetic tray so each fastener can be traced back to its origin during reassembly.",
          ],
          bullets: [
            "Lay out tools within arm's reach before opening any component packaging.",
            "Use a magnetic tray for every screw; never mix case, PSU, and motherboard fasteners.",
            "Work in a well-lit area so pin alignment and notch positions can be verified visually.",
            "Do not stack boards on top of each other; place them flat on separate safe surfaces.",
          ],
          note: { tone: "standard", title: "DepEd / TESDA alignment", text: "This topic directly supports the OSHA/NC II competency 'observe health and safety procedures' required in every CSS practical assessment." },
        },
      ],
      takeaways: [
        "A spark too small to feel is still strong enough to destroy a modern chip.",
        "Bare wood, silicone, or a cardboard box are safe; carpet and anti-static bag exteriors are not.",
        "Ground against a plugged-in, switched-off PSU chassis or a grounded wrist strap.",
        "Prepare tools and clear the bench before the first component is unboxed.",
      ],
      references: [ESD_REF, DEPED_REF, TESDA_REF],
    },
  },

  "1.2-safe-handling": {
    videoSummary: [
      "Printed circuit boards are fragile laminates of copper traces and tiny surface-mount parts that can be damaged by bending or by skin oils.",
      "Lift a motherboard by its reinforced fibreglass edges or a solid metal heatsink - never by a socket lever, bracket, or capacitor.",
      "Hold CPUs and RAM by their edges only; fingerprints on gold contacts can cause poor connections and corrosion.",
      "Keep the plastic socket cover in place until the exact moment the CPU is ready to be dropped in.",
      "Set boards down on a padded, non-conductive surface rather than sliding them across the bench.",
    ],
    moduleDoc: {
      intro:
        "Once the bench is ESD-safe, the next competency is physical handling. A motherboard is a multi-layer fibreglass sandwich carrying hair-thin copper traces, hundreds of surface-mount components, and spring-loaded sockets. Gripping it in the wrong place can crack the laminate, shear a capacitor from its solder pad, or bend socket pins - damage that is mechanical rather than electrical and just as permanent. This module details the approved grip zones and the sequence for handling CPUs, memory, and expansion cards.",
      objectives: [
        "Identify safe and forbidden grip zones on a motherboard and expansion cards.",
        "Handle CPUs, RAM, and heatsinks without contaminating contacts or bending pins.",
        "Apply zero-force handling principles during pre-assembly inspection.",
      ],
      sections: [
        {
          heading: "1.2.1 Why PCBs Fail in the Hand",
          paragraphs: [
            "A printed circuit board is a brittle composite of woven glass fibre and epoxy resin. It is strong in its flat plane but surprisingly weak at the edges and around drilled holes. Twisting a board even slightly concentrates stress at the corners of mounting holes and at solder joints, where tiny ceramic capacitors sit like glass pillars. Once a capacitor cracks or lifts, the fault is often intermittent and extremely difficult to diagnose.",
            "Skin oils are the second hazard. The gold-plated contacts on RAM and expansion cards are designed to make a gas-tight connection, but fingerprints leave salts and oils that oxidise over time. Handling contacts by the edge keeps the plating clean and preserves the reliability of the connection for years of service.",
          ],
          bullets: [
            "Fibreglass laminate resists compression but cracks under twisting or bending.",
            "Surface-mount capacitors are soldered at only two tiny pads - a knock can snap them off.",
            "Gold plating is thin; skin oils are acidic and promote corrosion over months.",
            "Use both hands for any board larger than Mini-ITX to prevent flex.",
          ],
        },
        {
          heading: "1.2.2 Approved Grip Zones",
          paragraphs: [
            "Always pick up a motherboard by two firm points: the bare outer fibreglass edge and, where available, a large metal heatsink such as the VRM or chipset cooler. These areas are structurally solid and carry no delicate features. If a heatsink is not present, use two opposite edges of the board and keep the board level so nothing dangles or flexes.",
            "Forbidden zones include the CPU socket retention lever, the plastic socket cover, RAM retention clips, PCIe locking tabs, and any standing capacitor or exposed pin field. These parts are designed to be actuated once, by a component, not to carry the weight of the entire board. Touching them risks bending a pin or snapping a clip that will later fail to hold a module secure.",
          ],
          bullets: [
            "Safe: bare PCB edges, metal VRM/chipset heatsinks, metal I/O shield frame.",
            "Forbidden: socket levers, plastic covers, RAM clips, capacitors, rear port shells.",
            "CPU: hold by the flat ceramic/plastic edges, never the gold contact pad or pins.",
            "RAM and GPUs: hold by the edges and the metal bracket, avoid the contact fingers.",
          ],
          note: { tone: "warning", title: "Socket cover rule", text: "Never remove the plastic CPU socket cover before you have the CPU in hand. A falling screw or a brushed sleeve can bend pins beyond repair." },
        },
        {
          heading: "1.2.3 Storage & Transfer",
          paragraphs: [
            "Between the bench and the box, components should travel in anti-static bags or on a padded tray. Never carry a bare board by a single corner through a crowded lab, and never slide it across a worktop - sliding drags dust and can catch a component on an uneven seam. Lay the board flat on a clean, non-conductive surface whenever it is not actively being worked on.",
            "During inspection, adopt the technician's 'zero-force' habit: if a part does not sit flat or align with its keyway, stop and re-check rather than pushing. Resistance is a sign of misalignment, not a need for more strength. This same principle will govern CPU, RAM, and GPU installation in the modules ahead.",
          ],
          bullets: [
            "Transport boards in bags or on anti-static trays, never loose in a toolbox.",
            "Place boards flat; do not stack or lean them against other objects.",
            "If a component does not seat easily, re-check orientation - do not force it.",
            "Inspect visually for bent pins, cracked laminate, and lifted capacitors before installation.",
          ],
        },
      ],
      takeaways: [
        "Lift by edges and metal heatsinks - never by sockets, levers, or capacitors.",
        "Fingerprints on contacts cause corrosion and intermittent faults.",
        "Keep socket covers on until the CPU is ready to install.",
        "Zero force: resistance always means re-check alignment, never push harder.",
      ],
      references: [ESD_REF, MOTHERBOARD_REF, DEPED_REF],
    },
  },

  "1.3-screws-tools": {
    videoSummary: [
      "PC assembly uses a few standard fasteners: 6-32 coarse screws for panels and PSUs, M3 for drives, and tiny M2 screws for M.2 storage.",
      "A magnetic #2 Phillips driver handles roughly 95 percent of all screws in a desktop build.",
      "Brass standoffs lift the motherboard off the metal tray to prevent short circuits underneath the board.",
      "A magnetic parts tray keeps every screw organised and stops fasteners falling into the case.",
      "Hand-tighten only - power tools and over-torquing crack the PCB or strip threads.",
    ],
    moduleDoc: {
      intro:
        "A professional computer technician can build a system with a surprisingly small tool kit, but only if the correct fastener goes into the correct hole. Mixing a coarse case screw with a fine M3 drive thread strips the tapping plate, and a screw driven too deep can crack the layered fibreglass of a motherboard. This module catalogues the screw standards, tools, and standoff practice that underpin every physical assembly task in the CSS NC II course.",
      objectives: [
        "Distinguish 6-32, M3, and M2 fasteners and state where each is used.",
        "Select the correct screwdriver and use a magnetic tray effectively.",
        "Install standoffs correctly and apply safe hand-tightening torque.",
      ],
      sections: [
        {
          heading: "1.3.1 Fastener Standards",
          paragraphs: [
            "The desktop PC industry converged on three thread families. The 6-32 coarse thread (about 3.5 mm diameter) is used for case panels, power supplies, expansion-card brackets, and most motherboard mounting points. M3 fine thread (3 mm) secures 2.5-inch SSDs and optical drives. M2 and M2.5 micro screws hold M.2 NVMe drives and some laptop-class hardware. Although 6-32 and M3 look similar at a glance, their thread pitches differ, and forcing the wrong one destroys the female thread in a single turn.",
            "Screw length matters as much as diameter. A screw that is too long can punch through a motherboard mounting point and damage traces on the opposite side. Use only the fasteners supplied for a given location: motherboard screws are usually short and flat-headed, while case-panel screws are longer and may have washers attached.",
          ],
          bullets: [
            "6-32: PSU, GPU bracket, case panels, motherboard mounting holes.",
            "M3: 2.5-inch SATA SSDs, optical drives, some cooler brackets.",
            "M2 / M2.5: M.2 NVMe SSD retention - use a precision #0 or #00 driver.",
            "Never substitute a longer screw just because it 'feels' the same.",
          ],
        },
        {
          heading: "1.3.2 Essential Tools",
          paragraphs: [
            "The core kit is a magnetic #2 Phillips screwdriver, a precision #0/#00 driver for M.2 work, a magnetic parts tray, cable ties, and a small pair of needle-nose pliers for stubborn connectors. A retractable bit driver with multiple tips is convenient, but a simple fixed-blade driver gives better feel and reduces the chance of cam-out - where the bit slips and strips the screw head.",
            "A magnetic tray is a simple and effective organisational tool. Every screw removed from the case goes straight into the tray, ideally arranged in the order it was removed. This prevents the classic fault of a lost standoff screw rattling inside the chassis and shorting the board when the system is first powered on.",
          ],
          bullets: [
            "#2 Phillips: universal driver for roughly 95% of desktop screws.",
            "#0 / #00 Phillips: required for M.2 SSD mounting screws.",
            "Magnetic tray: quarantine every removed fastener in one visible place.",
            "Avoid electric drills and over-torque - hand-tight plus a quarter turn is enough.",
          ],
          note: { tone: "warning", title: "Over-torque damage", text: "Crushing a motherboard screw into the board can crack internal copper layers, producing intermittent freezes that are almost impossible to trace." },
        },
        {
          heading: "1.3.3 Standoffs & Board Mounting",
          paragraphs: [
            "Standoffs are small brass or steel spacers that raise the motherboard 6–8 mm above the metal case tray. Without them, the solder points and traces on the underside of the board would touch the grounded metal pan and short the power rails instantly. Most cases use nine standoffs in a 3×3 pattern for ATX boards, fewer for Micro-ATX and Mini-ITX.",
            "Fit only the standoffs that correspond to holes on your specific board. An extra standoff sitting under an empty board position can touch a trace and short the system - a classic cause of a build that powers on, fans spin, and then immediately shuts down. Verify the pattern by holding the board over the tray before screwing anything in.",
          ],
          bullets: [
            "Brass standoffs elevate the PCB and align with plated mounting holes.",
            "Install only the standoffs that match the board's form factor.",
            "An extra standoff under the board can short the system on first boot.",
            "Tighten standoffs with fingers or a nut driver - snug, not forced.",
          ],
        },
      ],
      takeaways: [
        "Match thread type and length to the hole: 6-32, M3, and M2 are not interchangeable.",
        "A magnetic #2 Phillips driver plus a precision #0 covers nearly every screw.",
        "Standoffs prevent shorts; too many standoffs cause them.",
        "Hand-tighten every fastener and keep all screws in a magnetic tray.",
      ],
      references: [MOTHERBOARD_REF, DEPED_REF, TESDA_REF],
    },
  },

  /* ═══════════════ MODULE 2 ═══════════════ */
  "2.1-motherboard-anatomy": {
    videoSummary: [
      "The motherboard is the main circuit board that electrically and mechanically connects every component in the system.",
      "The four common form factors are E-ATX, ATX, Micro-ATX, and Mini-ITX, each with fixed dimensions and mounting-hole patterns.",
      "ATX (305 × 244 mm) is the industry default; smaller boards reuse its top mounting pattern for case compatibility.",
      "Larger boards provide more PCIe slots, RAM slots, M.2 sockets, and headers - but require a larger case.",
      "Choosing a form factor means balancing expandability against case size, cost, and cooling space.",
    ],
    moduleDoc: {
      intro:
        "The motherboard - also called the mainboard, system board, or logic board - is the central printed circuit board of a computer. It holds the CPU socket, memory slots, chipset, expansion slots, storage connectors, and the firmware that starts the machine. Its physical standard, or form factor, determines which case it fits and how many upgrade paths remain open. This module maps the anatomy of the board and compares the four form factors a CSS technician will meet in the field.",
      objectives: [
        "Identify the major functional regions of a desktop motherboard.",
        "Compare E-ATX, ATX, Micro-ATX, and Mini-ITX dimensions and capabilities.",
        "Select an appropriate form factor for a given build requirement.",
      ],
      sections: [
        {
          heading: "2.1.1 Functional Regions of the Board",
          paragraphs: [
            "A desktop motherboard can be read like a map. The upper-left quadrant holds the CPU socket beside several DIMM slots; directly below sits the chipset and the M.2 storage sockets. The long horizontal slots below the CPU are PCI Express expansion slots, with the top x16 slot reserved for the graphics card. Along the bottom and right edges are the 24-pin ATX power input, SATA ports, fan headers, USB headers, and the front-panel pin block.",
            "At the rear edge is the I/O panel with USB, display, network, and audio connectors. Each region is tied together by multilayer copper traces buried inside the board - a modern motherboard may have six to ten conductive layers, with dedicated planes for power and ground that keep high-speed signals clean.",
          ],
          bullets: [
            "Socket area: CPU, VRM power stages, and DIMM slots.",
            "Chipset area: M.2 sockets, SATA ports, USB and PCIe lane routing.",
            "Expansion area: PCIe x16 for GPU, additional x1/x4 slots for cards.",
            "Edge connectors: rear I/O panel, 24-pin ATX, 8-pin CPU power, fan and USB headers.",
          ],
        },
        {
          heading: "2.1.2 Form Factor Standards",
          paragraphs: [
            "Form factors are published standards that fix board dimensions, mounting-hole positions, and rear I/O opening size. E-ATX (305 × 330 mm) targets dual-CPU workstations and enthusiast systems. Standard ATX (305 × 244 mm), introduced by Intel in 1995, is the desktop default with nine mounting holes and up to seven expansion slots. Micro-ATX (244 × 244 mm) trims the height to a square while keeping four RAM slots and most core features. Mini-ITX (170 × 170 mm) is the smallest common desktop board, with two DIMM slots and a single PCIe x16 slot.",
            "Smaller boards deliberately reuse the upper mounting-hole pattern of ATX. That is why a standard mid-tower case can physically accept all four sizes. The trade-off is expansion: fewer slots mean fewer graphics cards, capture cards, M.2 drives, and fan headers. A technician must check the case's supported form factors before recommending a board.",
          ],
          bullets: [
            "E-ATX 305 × 330 mm - workstation, dual socket, 9–12 standoffs.",
            "ATX 305 × 244 mm - desktop standard since 1995, 9 standoffs, up to 7 slots.",
            "Micro-ATX 244 × 244 mm - best value, shares ATX top screw pattern.",
            "Mini-ITX 170 × 170 mm - small form factor, 4 corner standoffs, 1 PCIe slot.",
          ],
          note: { tone: "standard", title: "Field rule", text: "A larger case is always a safer purchase than a larger board - you can fit a small board in a big case, but never the reverse." },
        },
        {
          heading: "2.1.3 Choosing the Right Board",
          paragraphs: [
            "Start from the required CPU socket and chipset, then work outward. A gaming build with one graphics card, two memory sticks, and one or two NVMe drives is fully served by a good Micro-ATX board and can save money that is better spent on the GPU. Content creators,多人 workstation users, or anyone planning multiple cards and large memory capacities should choose ATX for its extra slots and stronger power delivery.",
            "Mini-ITX should be chosen only when physical size is the overriding constraint. It demands a compatible small case, careful cooler selection, and patient cable routing - and it usually costs more, not less. Always verify case clearance for GPU length and cooler height before committing to a small build.",
          ],
          bullets: [
            "Confirm socket and chipset compatibility with the chosen CPU first.",
            "Count required M.2, SATA, fan, and USB headers before choosing a board.",
            "Check GPU length and CPU cooler height against the case specification.",
            "Micro-ATX offers the best price-to-feature ratio for most learners.",
          ],
        },
      ],
      takeaways: [
        "The motherboard integrates socket, memory, expansion, storage, power, and firmware.",
        "ATX is the reference standard; smaller boards share its mounting pattern.",
        "Form factor determines slot count, case size, and cooling headroom.",
        "Mini-ITX saves space but costs more and limits expansion.",
      ],
      references: [FormFactorRef, MOTHERBOARD_REF, DEPED_REF],
    },
  },

  "2.2-chipset-vrm": {
    videoSummary: [
      "The chipset is the motherboard's traffic controller, deciding how PCIe lanes, USB, and storage are routed between the CPU and peripherals.",
      "The VRM converts 12 volts from the power supply into the roughly 1 volt the CPU needs, with very high current.",
      "A VRM phase consists of a PWM controller, MOSFETs, an inductor (choke), and capacitors that smooth the output.",
      "More phases and better heatsinking mean lower temperatures and more stable voltage under heavy load.",
      "A weak VRM causes throttling, instability, or shutdowns when the processor draws heavy current.",
    ],
    moduleDoc: {
      intro:
        "Two subsystems on a motherboard do most of the invisible work: the chipset and the voltage regulator module (VRM). The chipset decides where data travels, while the VRM decides how cleanly power is delivered. Neither is visible in a normal operating system, yet both determine whether a build is stable under load. This module explains their roles and the practical signs of an inadequate design.",
      objectives: [
        "Describe the chipset's role in routing lanes and peripherals.",
        "Explain how a VRM converts 12 V into stable CPU core voltage.",
        "Identify the components of a VRM phase and symptoms of weak power delivery.",
      ],
      sections: [
        {
          heading: "2.2.1 Chipset: The Traffic Controller",
          paragraphs: [
            "The chipset is a set of integrated circuits that mediates communication between the CPU, memory, expansion slots, and storage devices. Modern platforms split the duties: high-speed PCIe lanes for the graphics card and primary NVMe drive connect directly to the CPU, while slower USB, SATA, and additional PCIe lanes pass through the chipset. The chipset therefore determines how many ports and slots a board can expose.",
            "Chipsets are tiered. On the Intel side, H-series boards target mainstream users, B-series add business and connectivity features, and Z-series unlock overclocking. AMD uses a similar A/B/X hierarchy. A technician should confirm that the chipset supports the required CPU generation and features before recommending a board, because an otherwise identical board can differ sharply in connectivity.",
          ],
          bullets: [
            "CPU-direct lanes: primary PCIe x16 and first M.2 socket.",
            "Chipset lanes: USB, SATA, extra M.2, network, and lower-speed PCIe slots.",
            "Chipset tier controls overclocking support and port counts.",
            "BIOS/UEFI firmware on the board must support the installed CPU stepping.",
          ],
        },
        {
          heading: "2.2.2 VRM: Power Delivery",
          paragraphs: [
            "A power supply delivers 12 volts to the motherboard, but a modern CPU core runs near 1 volt while drawing well over 100 amps under load. The VRM performs this conversion with a set of repeating phases. Each phase contains a PWM controller that switches high-side and low-side MOSFETs on and off at high frequency, an inductor that stores and releases energy, and capacitors that smooth the resulting ripple into a steady direct current.",
            "More phases share the current between more components, so each runs cooler and the output voltage stays steadier. Enthusiast boards advertise 12, 16, or 20 phases and cover them with large aluminium heatsinks. For a stock classroom CPU, a modest 4–6 phase design with adequate airflow is entirely sufficient; problems appear when a weak VRM is asked to feed a high-power processor or sustain an aggressive overclock.",
          ],
          bullets: [
            "PWM controller: times the switching of each phase.",
            "MOSFETs: the electronic switches that chop the 12 V input.",
            "Choke/inductor: stores energy and stabilises current flow.",
            "Capacitors: filter ripple; solid polymer types last longer under heat.",
          ],
          note: { tone: "warning", title: "Symptoms of weak VRM", text: "Clock throttling under load, sudden shutdowns, or a burning smell near the socket all point to power delivery running beyond its design." },
        },
        {
          heading: "2.2.3 Rating a Board in the Field",
          paragraphs: [
            "When assessing a motherboard, look past the slot count. Check whether the VRM area has a heatsink, whether the capacitors are solid polymer rather than electrolytic cans, and whether the board provides a dedicated 8-pin (4+4) CPU power connector. Firmly seat that connector - a loose CPU power cable is a common cause of a system that powers on but will not POST.",
            "Also confirm the board's BIOS supports the installed processor out of the box. Some older boards require a BIOS update before they will recognise a newer CPU, which means you need a compatible older processor to perform the update. In a laboratory setting, always verify compatibility on the manufacturer's support page before assembly begins.",
          ],
          bullets: [
            "Heatsinked VRM and solid capacitors indicate a board built for sustained load.",
            "Seat both the 24-pin ATX and 4+4-pin CPU power connectors fully.",
            "Check CPU support list and required BIOS version on the vendor website.",
            "Update BIOS only with a stable power source and the correct CPU installed.",
          ],
        },
      ],
      takeaways: [
        "The chipset routes data; the VRM conditions power - both define board capability.",
        "A VRM phase uses MOSFETs, an inductor, and capacitors under PWM control.",
        "More phases and heatsinking improve stability under heavy CPU load.",
        "Loose CPU power and BIOS mismatches cause common no-POST faults.",
      ],
      references: [MOTHERBOARD_REF, { label: "Wikipedia - Voltage regulator module", url: "https://en.wikipedia.org/wiki/Voltage_regulator_module" }, DEPED_REF],
    },
  },

  "2.3-io-and-headers": {
    videoSummary: [
      "Rear I/O ports connect external devices: USB, display output, Ethernet, audio, and legacy PS/2.",
      "USB port colour indicates speed: black 2.0, blue 3.x, teal 10 Gbps, red 20 Gbps, yellow always-on charging.",
      "Internal headers extend connectivity to the case front: USB, audio, fan, RGB, and the front-panel switch block.",
      "The F_PANEL header follows a polarity-sensitive pinout; the power switch itself is polarity-free.",
      "A missing or misaligned I/O shield causes fitment problems and leaves the board unshielded.",
    ],
    moduleDoc: {
      intro:
        "A motherboard's external face is its rear I/O panel; its internal edges carry a family of pin headers that connect the case. Knowing these connectors lets a technician wire a front power button, plug in case fans, and explain why a blue USB port is faster than a black one. This module is a practical guide to the ports and headers used in every build.",
      objectives: [
        "Identify common rear I/O ports and interpret USB colour codes.",
        "Locate and connect internal USB, fan, audio, and front-panel headers.",
        "Wire the F_PANEL header with correct polarity and pin order.",
      ],
      sections: [
        {
          heading: "2.3.1 Rear I/O Panel",
          paragraphs: [
            "The I/O panel carries the connectors that remain accessible outside the case. A typical board provides several USB Type-A ports, one or more USB-C ports, a display output (HDMI or DisplayPort) when the CPU has integrated graphics, an RJ-45 Ethernet jack, and a stack of 3.5 mm audio sockets. Older boards may include PS/2 keyboard and mouse ports, optical S/PDIF, or eSATA.",
            "USB ports follow a colour convention that helps users choose the right speed. Black is USB 2.0 at 480 Mbps, blue is USB 3.x at 5 Gbps, teal indicates 10 Gbps SuperSpeed+, and red denotes 20 Gbps. Yellow ports support charging with the computer switched off. The physical connector shape also tells you the standard: rectangular USB-A, oval reversible USB-C, and the blue-tabbed USB 3.0-A.",
          ],
          bullets: [
            "USB 2.0 black - 480 Mbps, best for keyboard, mouse, printers.",
            "USB 3.x blue - 5 Gbps; teal 10 Gbps; red 20 Gbps for fast external SSDs.",
            "DisplayPort/HDMI carry video only when the CPU or board supports iGPU output.",
            "RJ-45 Ethernet and audio jacks are on nearly every desktop board.",
          ],
        },
        {
          heading: "2.3.2 Internal Headers",
          paragraphs: [
            "Internal headers extend the board's connectivity to the front and interior of the case. The 24-pin ATX and 4+4-pin CPU connectors deliver main power. Fan headers are usually four-pin for PWM control. USB 2.0 and USB 3.x headers feed the front ports, the HD_AUDIO header feeds the front microphone and headphone jacks, and a 9-pin F_PANEL block carries the power switch, reset switch, and indicator LEDs.",
            "All keyed connectors only fit one way, but the small front-panel pins are not keyed and must be matched to the diagram printed in the motherboard manual. The power and reset switch leads are polarity-free - either direction works. The LED leads are not: the positive wire, usually marked with a small arrow or coloured stripe, must sit on the + pin or the light simply will not illuminate.",
          ],
          bullets: [
            "24-pin ATX = main board power; 4+4-pin = CPU power; both must click fully home.",
            "4-pin fan headers support PWM speed control; 3-pin headers run at fixed voltage.",
            "F_PANEL: PW_SW and RESET_SW are polarity-free; PW_LED and HD_LED are not.",
            "Consult the board manual - header pinouts are not standardised across manufacturers.",
          ],
          note: { tone: "warning", title: "I/O shield first", text: "Fit the I/O shield into the case before mounting the motherboard. Installing the board first often makes the shield impossible to seat correctly." },
        },
        {
          heading: "2.3.3 Building a Clean Front Panel",
          paragraphs: [
            "Route front-panel cables along the case edge before the board is fully screwed down, and connect them while there is still room to see the pins. USB 3.x headers are large and stiff; align them squarely and press straight down to avoid bending the header. A loose or reversed front-panel connector is a common reason a completed build appears dead even though the motherboard itself is fine.",
            "If the case has no reset button, simply leave that header empty. If the PC does not power on after assembly, a useful diagnostic shortcut is to briefly short the two PW_SW pins with a screwdriver tip - if the system starts, the case switch or its wiring is at fault, not the board.",
          ],
          bullets: [
            "Connect headers before the board is fully secured if space is tight.",
            "Press keyed connectors straight down; never rock them side to side.",
            "Use the screwdriver test on PW_SW pins to isolate a faulty case switch.",
            "Tuck excess cable behind the board to keep airflow paths clear.",
          ],
        },
      ],
      takeaways: [
        "USB colour codes tell you the speed: black 2.0, blue 3.x, teal 10G, red 20G.",
        "Internal headers feed the case front panel, fans, and USB ports.",
        "Switch leads are polarity-free; LED leads must match + and –.",
        "Fit the I/O shield before the motherboard and follow the manual's pinout.",
      ],
      references: [MOTHERBOARD_REF, { label: "Wikipedia - USB", url: "https://en.wikipedia.org/wiki/USB" }, DEPED_REF],
    },
  },

  /* ═══════════════ MODULE 3 ═══════════════ */
  "3.1-cpu-silicon-socket": {
    videoSummary: [
      "The CPU is the processor that executes instructions; it seats into a socket whose pin standard must match the chip exactly.",
      "LGA sockets place pins on the motherboard; PGA sockets place them on the CPU - both are zero-insertion-force designs.",
      "A gold triangle on the CPU corner aligns with a matching marker on the socket to guarantee correct orientation.",
      "The CPU must drop flat into the socket with zero pressure; forcing it bends pins and destroys the board.",
      "Lower the retention lever fully and remove the plastic cover only after the CPU is seated.",
    ],
    moduleDoc: {
      intro:
        "The central processing unit is the brain of the computer, but it is also one of the most delicate parts to install. Modern sockets use hundreds or thousands of microscopic spring contacts, and a single bent pin can end a build before it starts. This module covers the architecture of LGA and PGA sockets, the alignment markers that prevent mistakes, and the zero-force technique used by professional technicians.",
      objectives: [
        "Differentiate LGA and PGA socket designs.",
        "Use the corner marker and keyway notches to orient a CPU correctly.",
        "Install a processor with zero force and seat the retention mechanism properly.",
      ],
      sections: [
        {
          heading: "3.1.1 Socket Architectures",
          paragraphs: [
            "There are two dominant desktop socket families. In an LGA (Land Grid Array) socket, the pins are spring contacts mounted in the motherboard socket and the CPU has flat gold pads - Intel and AMD's AM5 use this approach. In a PGA (Pin Grid Array) socket, the pins are attached to the CPU itself and drop into holes in the socket, as with AMD's AM4. Both are ZIF (Zero Insertion Force) designs: the chip drops in freely and a lever locks it in place.",
            "Because socket generations are physically and electrically different, a CPU will only fit the socket it was designed for. Never assume that two chips from the same manufacturer are interchangeable. Confirm the socket name printed in the motherboard specification and the processor's product page before purchase.",
          ],
          bullets: [
            "LGA: pins in the socket, flat contacts on the CPU (Intel LGA1700/1851, AMD AM5).",
            "PGA: pins on the CPU, holes in the socket (AMD AM4).",
            "ZIF: the chip must fall into place with no downward pressure.",
            "Socket generation must match the CPU - physical keying prevents cross-generation fits.",
          ],
        },
        {
          heading: "3.1.2 Orientation & Zero-Force Installation",
          paragraphs: [
            "Orientation is controlled by a gold triangle printed on one corner of the CPU and a matching triangle or notch on the socket, plus small side keyways that only allow one direction. Lift the socket lever and swing the retention plate open (on LGA) or expose the pin field (on PGA). Hold the CPU by its edges, align the triangle, and lower it straight down. It should settle flat with no resistance at all.",
            "If the CPU does not sit flat, do not press it. Lift it out, re-check the marker and notches, and try again. A dropped CPU can bend dozens of LGA pins in an instant; straightening them in the field is difficult and often unsuccessful. Once the chip is correctly seated, lower the retention lever and lock it - on LGA sockets the plastic cover will pop off as the lever closes, and it should be discarded once installation is complete.",
          ],
          bullets: [
            "Match the gold corner triangle to the socket's triangle before lowering.",
            "CPU must drop flush; any resistance means it is misaligned.",
            "Hold only the edges - never touch the gold pad or pin array.",
            "Keep the plastic cover on until the CPU is ready; discard it after the lever closes.",
          ],
          note: { tone: "warning", title: "Never force the lever", text: "If the retention lever will not close with normal finger pressure, the CPU is not seated. Forcing it crushes socket pins and voids the board." },
        },
        {
          heading: "3.1.3 Inspection After Installation",
          paragraphs: [
            "Before fitting the cooler, look across the socket at a shallow angle. On an LGA board the CPU should sit perfectly flat with the retention plate fully covering it; on a PGA board no pins should be visible around the edges. Apply a small amount of thermal compound (covered in the next topic), then mount the cooler firmly and plug its fan into the CPU_FAN header - the board will refuse to boot or will shut down thermally if that header is empty.",
            "At this stage the motherboard is still on the bench. Keep it on its cardboard box and avoid flexing the board when pressing the cooler down. A firm, even, downward mounting pressure with the cooler's spring screws is sufficient; excessive torque can crack the die inside the CPU package.",
          ],
          bullets: [
            "Verify the processor sits flat and the lever is fully latched.",
            "Apply thermal compound before mounting the cooler.",
            "Connect the cooler fan to CPU_FAN, not a chassis fan header.",
            "Support the board from underneath while tightening the cooler.",
          ],
        },
      ],
      takeaways: [
        "LGA has pins in the socket; PGA has pins on the CPU.",
        "Align the gold triangle and notches; the chip must drop in with zero force.",
        "A bent pin means a board replacement - never force a misaligned CPU.",
        "The cooler must be seated on CPU_FAN before the system is powered on.",
      ],
      references: [CPU_REF, DEPED_REF, TESDA_REF],
    },
  },

  "3.2-thermal-paste-coolers": {
    videoSummary: [
      "Thermal compound fills microscopic air gaps between the CPU heat spreader and the cooler base so heat transfers efficiently.",
      "A pea-sized dot or a thin line in the centre is enough; too much compound can spill onto the socket and components.",
      "Remove the plastic film from the cooler base before mounting - a common and costly beginner mistake.",
      "Tighten cooler screws in a cross pattern with even pressure for full contact.",
      "Plug the cooler fan into CPU_FAN and verify it spins before running any load test.",
    ],
    moduleDoc: {
      intro:
        "A CPU cooler moves heat away from the processor so it can keep running at full speed. Metal-to-metal contact sounds sufficient, but even polished surfaces leave microscopic air gaps, and air is a poor conductor. Thermal compound replaces that air with a material that conducts heat far better. This module covers compound application, cooler mounting, and fan connection.",
      objectives: [
        "Explain why thermal compound is required between CPU and cooler.",
        "Apply the correct amount of compound using the pea or line method.",
        "Mount a cooler evenly and connect its fan to the correct header.",
      ],
      sections: [
        {
          heading: "3.2.1 How Thermal Interface Material Works",
          paragraphs: [
            "The CPU's integrated heat spreader and the cooler's cold plate look flat to the eye but are rough at a microscopic scale. Where the two surfaces do not touch, trapped air resists heat flow and creates hot spots. Thermal paste is a suspension of conductive or capacitive particles in a silicone or hydrocarbon base; it fills those gaps so heat can cross the boundary efficiently.",
            "More paste is not better. The ideal layer is just thick enough to fill the gaps, because the compound itself conducts heat less well than direct metal contact. A pea-sized blob in the centre, or a short thin line on rectangular heat spreaders, spreads into a uniform film when the cooler is clamped down. Excess paste that squeezes out should be wiped away from the socket area.",
          ],
          bullets: [
            "Air gaps insulate; thermal compound replaces them with a conductive path.",
            "Use a pea-sized dot or a thin 2–3 cm line for most desktop CPUs.",
            "Too little leaves hot spots; too much can spill and contaminate contacts.",
            "Wipe away overflow with a lint-free cloth and a little isopropyl alcohol.",
          ],
        },
        {
          heading: "3.2.2 Mounting the Cooler",
          paragraphs: [
            "Coolers vary widely, but the mounting principles are the same. Remove the plastic protective film from the cooler base - it is attached to keep the pre-applied Thermal Compound clean in transit and must be peeled off before installation. Position the cooler squarely over the socket and start every screw by hand before tightening any of them.",
            "Tighten the screws in a diagonal cross pattern, a few turns at a time, so the cooler presses down evenly. An uneven mount leaves one corner lifted and produces poor temperatures even though the cooler looks installed. Air and liquid coolers both follow this rule; for large tower coolers, install the fan after the heatsink if it blocks screw access.",
          ],
          bullets: [
            "Peel the plastic film off the cooler base before fitting it.",
            "Start all mounting screws by hand before tightening any.",
            "Tighten diagonally in small increments for even contact pressure.",
            "Check cooler clearance against the case specification before buying.",
          ],
          note: { tone: "warning", title: "Do not over-tighten", text: "Spring-loaded mounting hardware is designed to stop at the correct pressure. Cranking screws with a driver can crack the CPU die or the motherboard." },
        },
        {
          heading: "3.2.3 Fan Setup & Verification",
          paragraphs: [
            "Connect the cooler's fan cable to the header labelled CPU_FAN, usually at the top edge of the board. PWM fans use four pins and allow the motherboard to vary speed with temperature; three-pin fans run at a fixed voltage. After powering on, confirm the fan spins and listen for rubbing or vibration before installing the side panel.",
            "Watch CPU temperatures during the first boot and a short load test. A rapid rise to thermal shutdown within seconds usually means the cooler is not seated correctly or the fan is not running. Shut down immediately, reseat the cooler, and reapply compound if necessary - running a processor at thermal limit risks permanent damage.",
          ],
          bullets: [
            "CPU_FAN header is required; a missing fan signal can trigger a boot warning.",
            "4-pin PWM fans adjust speed; 3-pin fans run at fixed speed.",
            "Confirm airflow direction: air should move through the heatsink toward the rear case fan.",
            "Rapid overheating means reseat the cooler - do not continue testing.",
          ],
        },
      ],
      takeaways: [
        "Thermal compound fills microscopic air gaps and must be thin and even.",
        "Always remove the cooler's plastic protective film before mounting.",
        "Cross-tighten mounting screws; even pressure gives the best temperatures.",
        "Connect the fan to CPU_FAN and verify spin and temperatures on first boot.",
      ],
      references: [THERMAL_REF, CPU_REF, DEPED_REF],
    },
  },

  /* ═══════════════ MODULE 4 ═══════════════ */
  "4.1-ram-dual-channel": {
    videoSummary: [
      "DDR4 and DDR5 are not interchangeable - the notch position and voltage differ, so the board accepts only one type.",
      "Dual channel lets the memory controller access two sticks in parallel, effectively doubling bandwidth.",
      "For two sticks on a four-slot board, use A2 and B2 - usually the second and fourth slots from the CPU.",
      "RAM is keyed and only fits one way; open both clips, align the notch, and press until they click shut.",
      "Enable XMP (Intel) or EXPO/DOCP (AMD) in BIOS to run the memory at its advertised speed.",
    ],
    moduleDoc: {
      intro:
        "System memory is the processor's working area, and how it is installed directly affects performance. A mismatched or single-stick configuration quietly halves available bandwidth, while a correctly populated dual-channel pair lets the CPU move data twice as fast. This module explains DDR generations, slot labelling, and the correct installation technique.",
      objectives: [
        "Differentiate DDR4 and DDR5 memory and understand keying.",
        "Populate the correct DIMM slots for dual-channel operation.",
        "Install memory modules safely and enable their rated speed in BIOS.",
      ],
      sections: [
        {
          heading: "4.1.1 DDR Generations and Keying",
          paragraphs: [
            "DDR4 and DDR5 are separate physical standards. A DDR5 module has a notch in a different position and runs at a lower voltage than DDR4, so a board will physically reject the wrong generation - never force a stick into a slot. Within a generation, modules are described by capacity, data rate (for example DDR4-3200), and latency. Mixing modules of different speeds makes the whole pair run at the slowest common setting.",
            "Buying memory as a matched kit of two or four identical sticks avoids compatibility problems. The kit is binned and tested to work together at the advertised speed. If you later add a different stick, the memory controller will usually fall back to lower speeds and looser timings to keep the system stable.",
          ],
          bullets: [
            "DDR4 and DDR5 are keyed differently - they are never interchangeable.",
            "Rated speed is the maximum; without XMP/EXPO the stick runs at a slower JEDEC default.",
            "Matched kits give the best chance of stable, full-speed operation.",
            "ECC or registered memory requires a board that explicitly supports it.",
          ],
        },
        {
          heading: "4.1.2 Dual-Channel Slot Rules",
          paragraphs: [
            "Most desktop boards have four DIMM slots arranged as two channels: A1/A2 and B1/B2. Slots are numbered from the CPU outward. For a two-stick kit, the manufacturer almost always recommends A2 and B2 - the second and fourth slots - because signal routing on those positions is optimised. The exact recommendation is printed in the motherboard manual and sometimes on the board silkscreen.",
            "Installing both sticks in the same channel (A1 and A2, for example) leaves the system in single-channel mode and halves bandwidth. With four identical sticks, filling all four slots keeps both channels active. With an odd number such as three sticks, the board falls back to single-channel or a mixed flexible mode, so an even count is always preferred.",
          ],
          bullets: [
            "Two sticks on a four-slot board: use A2 and B2 (slots 2 and 4).",
            "Four sticks: fill all slots; both channels remain active.",
            "Colour coding is a hint - matching colours usually mean matching channels.",
            "An even number of identical modules is required for true dual channel.",
          ],
          note: { tone: "standard", title: "Why bandwidth matters", text: "Dual channel is like adding a second lane to a highway: the CPU can fetch twice as much data per clock, which helps integrated graphics and memory-heavy tasks most." },
        },
        {
          heading: "4.1.3 Installation Technique",
          paragraphs: [
            "Open the retention clips at both ends of the DIMM slot, align the notch in the module with the ridge in the slot, and press straight down with even pressure from both thumbs. The module should seat fully and the clips should snap shut over its notches with a distinct click. A partially seated stick is a common cause of a system that powers on with no display.",
            "After the first boot, enter BIOS and enable XMP (Intel) or EXPO/DOCP (AMD) so the memory runs at its advertised rate rather than the conservative JEDEC default. If the system becomes unstable, return to BIOS and lower the speed one step or increase the DRAM voltage slightly within the kit's specification. Memory training on the first few boots can take a few seconds - this is normal.",
          ],
          bullets: [
            "Align the key notch, press evenly with both thumbs until the clips click.",
            "A no-display boot often means a RAM stick is not fully seated.",
            "Enable XMP/EXPO in BIOS to get the rated speed.",
            "Reseat and test one stick at a time when diagnosing memory errors.",
          ],
        },
      ],
      takeaways: [
        "DDR4 and DDR5 are physically keyed and cannot be mixed.",
        "A2 and B2 are the default dual-channel slots on four-slot boards.",
        "Press until both retention clips click; partial seating causes no-POST.",
        "Enable XMP/EXPO in BIOS to run memory at its rated speed.",
      ],
      references: [RAM_REF, MOTHERBOARD_REF, DEPED_REF],
    },
  },

  "4.2-storage-m2-nvme": {
    videoSummary: [
      "M.2 is a slot form factor; NVMe is a high-speed protocol over PCIe that is far faster than SATA.",
      "Keying notches (M-key, B-key) and the 2280 size label ensure the drive fits the slot and standoff.",
      "Insert the drive at about a 30-degree angle, press it flat, then secure it with a screw or tool-less clip.",
      "The top M.2 socket is usually CPU-connected and is the best choice for the boot drive.",
      "Remove the protective film from the heatsink thermal pad before refitting it.",
    ],
    moduleDoc: {
      intro:
        "Solid-state storage has largely replaced spinning disks, and the M.2 NVMe drive is now the standard choice for a boot disk. It is a small circuit board that plugs directly into a PCIe lane on the motherboard, avoiding the bandwidth limits of SATA cables. This module explains M.2 keying, slot selection, and the correct installation sequence.",
      objectives: [
        "Distinguish M.2 SATA from M.2 NVMe drives and read size/key labels.",
        "Select the preferred M.2 socket for a boot drive.",
        "Install and secure an M.2 drive without damaging the PCB or connector.",
      ],
      sections: [
        {
          heading: "4.2.1 M.2, NVMe and Keying",
          paragraphs: [
            "M.2 describes the physical slot and card size; NVMe (Non-Volatile Memory Express) describes the communication protocol. A modern NVMe drive communicates over PCIe and can reach several gigabytes per second, while SATA is capped near 550 MB/s. Some M.2 drives use the older SATA protocol - they are slower and use a different notch pattern, so always read the drive and slot specifications.",
            "Drives are labelled by size, such as 2280, meaning 22 mm wide and 80 mm long. The keying notch prevents a drive from being inserted into an incompatible slot; an M-key drive has a notch near the right end of the connector and uses PCIe x4 lanes. The motherboard's standoff position must match the drive length - move the standoff to the hole marked 80 for a 2280 card.",
          ],
          bullets: [
            "M.2 = physical form factor; NVMe = PCIe-based protocol; SATA M.2 is much slower.",
            "2280 means 22 mm × 80 mm - the most common desktop size.",
            "M-key notch is for PCIe x4 NVMe drives; check the board slot keying.",
            "Top M.2 socket is often CPU-direct and is preferred for the boot drive.",
          ],
        },
        {
          heading: "4.2.2 Installation Sequence",
          paragraphs: [
            "Begin with the system powered off and unplugged, and ground yourself as usual. Remove any M.2 heatsink and, if fitted, install the correct standoff in the hole matching the drive length. Slide the drive into the slot at roughly a 30-degree angle, making sure the notch aligns with the key. It should enter fully with gentle pressure and remain at an angle when released - this is normal.",
            "Press the free end of the drive down so its mounting hole rests on the standoff, then secure it with the tiny M2 screw or the board's tool-less latch. Do not over-tighten: the screw is very small and the drive PCB can crack. If using a heatsink, peel the plastic film from its thermal pad first, then refit the heatsink so the pad makes direct contact with the drive.",
          ],
          bullets: [
            "Insert at ~30°, slide in gently, then press flat and secure.",
            "Use the tiny M2 screw or tool-less clip - snug, never forced.",
            "Peel thermal-pad film before fitting the M.2 heatsink.",
            "A drive that will not seat usually has a misaligned notch - do not force it.",
          ],
          note: { tone: "warning", title: "ESD still applies", text: "An M.2 drive is a bare circuit board. Handle it only by its edges and keep it in its bag until the moment of installation." },
        },
        {
          heading: "4.2.3 First Boot & Formatting",
          paragraphs: [
            "Once installed, a brand-new drive will not appear in Windows until it is initialised and formatted. Open Disk Management, locate the unallocated space, create a new simple volume, assign a drive letter, and format it as NTFS. For a boot drive, choose the system's UEFI installation medium and select the NVMe drive as the installation target.",
            "If the drive is not detected at all, check the BIOS storage view and the motherboard manual - some boards disable a secondary M.2 socket when certain SATA ports are in use. Sharing lanes between ports is normal and is documented in the board's specification table.",
          ],
          bullets: [
            "Initialise and format a new drive in Windows Disk Management.",
            "Some boards disable a SATA port or second M.2 slot when another is populated.",
            "Check BIOS storage information if the drive is not detected.",
            "Keep the drive cool under sustained writes; thermal throttling reduces speed.",
          ],
        },
      ],
      takeaways: [
        "M.2 is the slot; NVMe is the fast PCIe protocol - they are not the same thing.",
        "Match the 2280 label and standoff hole before inserting the drive.",
        "Insert at 30°, press flat, and secure with the small M2 screw or clip.",
        "Remove the heatsink film and format the drive in Disk Management.",
      ],
      references: [NVME_REF, PCIe_REF, DEPED_REF],
    },
  },

  /* ═══════════════ MODULE 5 ═══════════════ */
  "5.1-gpu-pcie-slots": {
    videoSummary: [
      "The top PCIe x16 slot closest to the CPU provides the fastest, unshared bandwidth and is the correct slot for the GPU.",
      "Remove the case expansion-slot covers and fit the card so its bracket screws secure it to the chassis.",
      "The PCIe latch clicks when the card is fully seated - a missing click means it is not all the way in.",
      "Connect every PCIe power connector using separate cables from the PSU where possible.",
      "Plug the monitor into the graphics card, not the motherboard, once a dedicated GPU is installed.",
    ],
    moduleDoc: {
      intro:
        "The graphics card is the largest and heaviest component in most builds and the one with the most cabling. It sits in a PCI Express x16 slot and usually needs one or more dedicated power cables from the supply. This module covers slot selection, mechanical installation, power connections, and display output.",
      objectives: [
        "Explain why the primary PCIe x16 slot is preferred for a GPU.",
        "Seat a graphics card and secure its bracket correctly.",
        "Connect PCIe power safely and attach the display cable to the GPU.",
      ],
      sections: [
        {
          heading: "5.1.1 PCIe Slots and Bandwidth",
          paragraphs: [
            "PCI Express is a serial expansion bus available in x1, x4, x8, and x16 widths. A graphics card uses a x16 slot, and the slot nearest the CPU is normally wired directly to the processor for the lowest latency and full bandwidth. Additional slots may be routed through the chipset or share lanes with M.2 sockets, so installing a card in the wrong slot can cost performance.",
            "PCIe generations are backward compatible: a Gen4 card works in a Gen3 slot at Gen3 speed. The physical connector is keyed so the card can only be inserted one way. Always check the motherboard manual when using more than one expansion card, because lane sharing between slots and M.2 connectors is common.",
          ],
          bullets: [
            "Use the top x16 slot - it is usually CPU-direct and unshared.",
            "PCIe is backward compatible across generations, at the slower generation's speed.",
            "Check the manual for lane sharing between PCIe slots and M.2 sockets.",
            "Display outputs on the motherboard are disabled when a dedicated GPU is fitted.",
          ],
        },
        {
          heading: "5.1.2 Mechanical Installation",
          paragraphs: [
            "With the power off and unplugged, remove the expansion-slot covers from the case that line up with the GPU's bracket. Open the locking latch on the PCIe slot, then align the card's gold edge with the slot and its bracket with the empty openings. Press down evenly on the top of the card near the slot until the latch clicks shut - the click is the confirmation that the contact fingers are fully seated.",
            "Secure the bracket with the screw you removed from the case so the card cannot wobble. Heavy cards benefit from a support bracket to prevent sag, which can stress the PCIe slot over time. Never support the card by gripping its fan blades or printed circuit board edges near the connector.",
          ],
          bullets: [
            "Remove the correct number of case slot covers before inserting the card.",
            "Press until the PCIe latch clicks - no click means poor contact.",
            "Fasten the bracket screw; use a support for very heavy GPUs.",
            "Hold the card by its metal bracket and edges, never by the fan.",
          ],
          note: { tone: "warning", title: "Power off first", text: "Never hot-plug a graphics card. Shut down, switch off the PSU, unplug it, and touch bare metal before touching the slot." },
        },
        {
          heading: "5.1.3 Power and Display",
          paragraphs: [
            "Most graphics cards need one or more PCIe power connectors - traditionally 6+2 pin (8 pin), and on newer cards a 16-pin 12VHPWR/12V-2×6 connector. Use the cables supplied with the power supply, seat each until it clicks, and avoid bending a 16-pin cable sharply near the plug. Where a card has two 8-pin sockets, use two separate cables rather than the daisy-chain end of one cable when the PSU allows it.",
            "Finally, connect the monitor cable to the GPU's HDMI or DisplayPort output. Plugging it into the motherboard instead is a very common mistake: with a dedicated card installed, the board's display outputs are usually disabled and the screen will stay black. Install the manufacturer's graphics driver after the first boot to get full performance.",
          ],
          bullets: [
            "Use separate PCIe power cables where possible; seat each until it clicks.",
            "Do not bend 16-pin cables sharply within about 4 cm of the connector.",
            "Connect the monitor to the GPU, not the motherboard.",
            "Install the latest graphics driver after the first successful boot.",
          ],
        },
      ],
      takeaways: [
        "The top x16 slot gives the GPU the fastest unshared bandwidth.",
        "A distinct latch click confirms the card is fully seated.",
        "Power every GPU connector with correctly labelled PCIe cables.",
        "Monitor goes into the GPU; motherboard display outputs are disabled.",
      ],
      references: [PCIe_REF, MOTHERBOARD_REF, DEPED_REF],
    },
  },

  "5.2-psu-efficiency-cables": {
    videoSummary: [
      "The PSU converts mains AC into the DC voltages the PC uses: +12 V, +5 V, and +3.3 V.",
      "80 PLUS ratings (Bronze, Silver, Gold, Platinum, Titanium) describe efficiency, not quality or wattage.",
      "A higher-efficiency supply wastes less power as heat and usually runs quieter.",
      "Modular PSU cables are keyed - 24-pin ATX, 4+4 CPU, 6+2 PCIe, and SATA power are not interchangeable.",
      "Never use an Molex-to-PCIe adapter for a modern high-power GPU; use a proper native cable.",
    ],
    moduleDoc: {
      intro:
        "The power supply unit converts alternating current from the wall into the low-voltage direct current used by every component. It is also the component most likely to destroy a build if chosen carelessly. This module explains wattage and efficiency ratings, the keyed cable family, and the safe connection sequence.",
      objectives: [
        "Explain what the 80 PLUS efficiency rating does and does not mean.",
        "Identify the main PSU cables and the connectors they feed.",
        "Choose an appropriately sized supply and connect its cables safely.",
      ],
      sections: [
        {
          heading: "5.2.1 What a PSU Does",
          paragraphs: [
            "A desktop PSU takes 220 V AC (in the Philippines) and converts it to low-voltage DC rails: +12 V for the CPU, GPU, and fans, +5 V and +3.3 V for logic and storage. It also provides the standby voltage that lets the PC wake from the power button. The total output is stated in watts, and the supply must be able to deliver that wattage continuously, not just as a brief peak.",
            "Size the supply by adding the CPU and GPU power requirements and leaving roughly 30–40 percent headroom. A supply that runs near its maximum all the time runs hot, loud, and less efficient. An oversized supply is harmless apart from cost; an undersized one causes shutdowns under load and can damage components when its voltage rails collapse.",
          ],
          bullets: [
            "Primary rails: +12 V (CPU/GPU), +5 V and +3.3 V (logic, USB, storage).",
            "+5 V standby keeps the board alive for the power button and Wake-on-LAN.",
            "Allow 30–40% headroom over estimated peak system power.",
            "Continuous wattage matters, not the short peak number on the box.",
          ],
        },
        {
          heading: "5.2.2 Efficiency Ratings",
          paragraphs: [
            "The 80 PLUS programme certifies that a supply is at least 80 percent efficient at 20%, 50%, and 100% load, with a slightly lower requirement at full load. The tiers - Standard, Bronze, Silver, Gold, Platinum, and Titanium - represent progressively higher efficiency and tighter requirements at low loads. A Gold supply draws less power from the wall and produces less heat than a Bronze unit of the same output.",
            "Efficiency is not the same as build quality or wattage. A poor 750 W Bronze unit can be worse than a well-built 650 W Gold unit. Look for a reputable manufacturer, a full set of safety protections (OVP, UVP, OPP, SCP, OTP), and a warranty, then treat the 80 PLUS badge as a useful but secondary signal.",
          ],
          bullets: [
            "80 PLUS measures efficiency - how much wall power becomes usable DC.",
            "Tiers: Bronze < Silver < Gold < Platinum < Titanium.",
            "Higher efficiency means less heat, less fan noise, lower electricity cost.",
            "The badge does not guarantee reliability - check reviews and protections.",
          ],
          note: { tone: "standard", title: "DepEd link", text: "Selecting and verifying a power supply is a competency item in the CSS NC II 'install and configure computer peripherals' module." },
        },
        {
          heading: "5.2.3 Keyed Cables & Connection Sequence",
          paragraphs: [
            "Modern PSU cables are keyed: the 24-pin ATX connector feeds the motherboard, the 4+4-pin EPS connector feeds the CPU, 6+2-pin PCIe connectors feed graphics cards, and SATA power connectors feed drives. Peripherals have notches that prevent one type being forced into another. Molex connectors are legacy and should only be used for old fans or adapters when there is no alternative.",
            "Connect the motherboard, CPU, GPU, and drive cables while the unit is unplugged, then switch on the PSU only after everything is seated. Do not mix modular cables between different power supplies - even cables that look identical can have different pinouts on the supply side, which can destroy drives. Use only the cables shipped with your specific model.",
          ],
          bullets: [
            "24-pin ATX → board; 4+4 EPS → CPU; 6+2 PCIe → GPU; SATA → drives.",
            "Never swap modular cables between different PSU models or brands.",
            "Avoid Molex-to-PCIe adapters for modern high-power graphics cards.",
            "Switch on the PSU only after every connector is fully seated.",
          ],
        },
      ],
      takeaways: [
        "A PSU creates +12 V, +5 V, and +3.3 V rails from mains AC.",
        "80 PLUS grades efficiency, not wattage or reliability.",
        "Allow 30–40% wattage headroom over the system's peak draw.",
        "PSU cables are keyed; never interchange modular cables between supplies.",
      ],
      references: [PSU_REF, { label: "Wikipedia - Power supply unit (computer)", url: "https://en.wikipedia.org/wiki/Power_supply_unit_(computer)" }, DEPED_REF],
    },
  },

  /* ═══════════════ MODULE 6 ═══════════════ */
  "6.1-airflow-physics": {
    videoSummary: [
      "Fans move air; the goal is a steady path that brings cool air in and pushes hot air out.",
      "Intake fans are usually at the front and bottom; exhaust fans at the rear and top.",
      "Positive pressure (more intake than exhaust) reduces dust but needs filtered intakes.",
      "A fan's bracket side is the exhaust side; the open labelled side is the intake side.",
      "Unrestricted airflow and clean filters lower temperatures and fan noise.",
    ],
    moduleDoc: {
      intro:
        "Every component that consumes electricity produces heat. A case's job is not simply to hold parts but to give that heat a route out. Good airflow lowers component temperatures, which keeps fans quiet and prevents thermal throttling. This module explains pressure, fan orientation, and practical layouts.",
      objectives: [
        "Describe how intake and exhaust fans create a cooling path.",
        "Compare positive, negative, and balanced pressure configurations.",
        "Determine fan orientation and plan a simple effective airflow layout.",
      ],
      sections: [
        {
          heading: "6.1.1 Heat Movement in a Case",
          paragraphs: [
            "Heat moves by conduction into the air around a component and then leaves the case by convection. Fans accelerate this process by replacing the warm air around a heatsink with cooler air from outside. A GPU dumps heat into the case, so the airflow path must carry that heat out rather than recirculating it through the CPU cooler.",
            "The most effective layout is a straight front-to-back path: intake fans at the front pull cool air across the GPU and motherboard, and rear and top exhaust fans remove the warmed air. Airflow should never fight the natural direction of the CPU tower cooler, which normally pushes air toward the rear of the case.",
          ],
          bullets: [
            "Cool intake at front/bottom; hot exhaust at rear/top.",
            "Keep airflow moving in one direction across the GPU and CPU cooler.",
            "Avoid blocking intakes with solid front panels or dust-clogged filters.",
            "Cable management matters because loose cables obstruct the air path.",
          ],
        },
        {
          heading: "6.1.2 Pressure and Dust Control",
          paragraphs: [
            "If a case moves more air in than out, it develops positive pressure. Air then leaks out through every gap, which means dust is less likely to be sucked in through unfiltered cracks - provided the intakes themselves are filtered. Positive pressure is generally the best choice for a cleanable system.",
            "Negative pressure occurs when exhaust fans move more air than intake fans. It pulls air in through every opening, including unfiltered gaps, so dust accumulates faster, although it can sometimes improve heat extraction in a very open case. A balanced setup sits between the two. Whichever you choose, clean the filters regularly; a clogged filter defeats even a well-planned layout.",
          ],
          bullets: [
            "Positive pressure: more intake, dust-resistant with filtered intakes.",
            "Negative pressure: more exhaust, stronger extraction but more dust ingress.",
            "Balanced: equal intake and exhaust, a reasonable default.",
            "Clean filters every few weeks - restriction raises temperatures and noise.",
          ],
          note: { tone: "standard", title: "Simple test", text: "Hold a thin tissue near an unfiltered case gap with the fans running. If it is sucked inward, the case is in negative pressure." },
        },
        {
          heading: "6.1.3 Fan Orientation & Control",
          paragraphs: [
            "An axial fan draws air in from the open side and blows it out over the bracket and label. Installing it backwards is a common mistake that reverses the airflow path. Many cases have a mesh or filtered front, so the fan's visible brand label at the front means it is exhausting - usually the wrong way for an intake.",
            "Connect fans to the motherboard's fan headers so their speed can be controlled by temperature, or use a fan hub for more fans than the board supports. Four-pin PWM fans vary speed precisely; three-pin fans are controlled by voltage. A quiet, cool system is the result of moving enough air slowly rather than a few fans spinning at maximum speed.",
          ],
          bullets: [
            "Air enters from the open side and exits over the bracket/stator side.",
            "4-pin PWM fans support fine speed control; 3-pin fans use voltage control.",
            "Use a hub when the board has too few fan headers.",
            "Aim for gradual fan curves - quiet at idle, faster only when hot.",
          ],
        },
      ],
      takeaways: [
        "Design a clear intake-to-exhaust path across the hot components.",
        "Positive pressure with filtered intakes keeps a build cleaner.",
        "The bracket side of a fan is the exhaust side.",
        "Control fan speed by temperature and keep filters clean.",
      ],
      references: [AIRFLOW_REF, DEPED_REF, TESDA_REF],
    },
  },

  "6.2-cable-management": {
    videoSummary: [
      "Front-panel cables connect the case buttons and ports to the motherboard - power switch, reset, LEDs, USB, and audio.",
      "The F_PANEL header pinout is not standardised; always follow the motherboard manual diagram.",
      "Power and reset switch leads have no polarity; LED leads must match the + pin.",
      "Route cables behind the motherboard tray and through grommets for a clean, unobstructed build.",
      "If the PC will not start, briefly shorting the PW_SW pins tests whether the case switch is at fault.",
    ],
    moduleDoc: {
      intro:
        "Cable management is both an aesthetic and a functional skill. Loose bundles restrict airflow, make future maintenance difficult, and can even be caught by fans. This module details the front-panel connections and a systematic method for routing every cable neatly behind the motherboard tray.",
      objectives: [
        "Wire the F_PANEL header correctly using the board manual.",
        "Connect front USB and audio headers without bending pins.",
        "Route and secure cables to keep the airflow path unobstructed.",
      ],
      sections: [
        {
          heading: "6.2.1 The Front Panel Block",
          paragraphs: [
            "The front-panel header is a 9-pin block near the bottom-right of most motherboards. It carries the case power switch, reset switch, power LED, and hard-drive activity LED. Pin positions vary between manufacturers, so the motherboard manual's diagram is the only reliable guide. The missing pin in the 2×5 pattern is a keying feature that helps with orientation.",
            "Switch leads can be connected either way round because a switch simply closes a circuit. LED leads, however, are diodes: the positive side - usually marked with an arrow or a coloured wire - must sit on the + pin. A reversed LED is harmless but will not light, which is a frequent source of confusion for beginners.",
          ],
          bullets: [
            "Follow the manual: F_PANEL pinouts are not universal.",
            "PW_SW and RESET_SW are polarity-free.",
            "PW_LED and HD_LED require + and – to be matched.",
            "Leave unused headers empty; no jumper is needed.",
          ],
          note: { tone: "warning", title: "Switch test", text: "If the case power button does nothing, touch a screwdriver briefly to the two PW_SW pins. If the PC starts, the switch or its cable is faulty." },
        },
        {
          heading: "6.2.2 USB and Audio Headers",
          paragraphs: [
            "Front USB ports connect to large keyed headers on the board. USB 3.x headers are wide and have a notched plastic shroud; USB 2.0 headers are smaller 9-pin blocks. Align the connector squarely and press straight down. Rocking a wide connector from side to side can bend header pins or, worse, damage the solder joints on the board.",
            "The HD_AUDIO header feeds the front headphone and microphone jacks. It is also keyed and usually sits near the bottom edge. If the front audio ports are not detected in the operating system, check that the connector is fully seated and that the Realtek driver's front-panel detection option is enabled.",
          ],
          bullets: [
            "USB 3.x headers are wide and keyed - align before pressing.",
            "Press straight down; never rock a connector into place.",
            "HD_AUDIO feeds the front headphone and microphone jacks.",
            "Unused headers can be left empty with no effect.",
          ],
        },
        {
          heading: "6.2.3 Routing & Dressing",
          paragraphs: [
            "Plan routes before connecting: identify which grommet each cable will use and whether it passes behind the tray or around the board. Route the huge 24-pin and CPU power cables first, then USB and audio, and finally fan cables. Use the case's tie points or reusable Velcro straps to bundle cables flat against the back of the tray - avoid tightening so much that the insulation deforms.",
            "Leave a little slack near every connector so a future upgrade can be serviced without undoing the whole build. Once dressed, check that no cable crosses a fan intake or lies against a heatsink. A well-managed build is easier to clean, quieter, and safer to work on, and it is a graded competency in practical CSS assessments.",
          ],
          bullets: [
            "Route thick power cables first and flatten bundles behind the tray.",
            "Use Velcro straps; do not crush cable insulation with tight ties.",
            "Leave service slack near each connector.",
            "Verify nothing crosses a fan or touches a hot heatsink.",
          ],
        },
      ],
      takeaways: [
        "F_PANEL wiring follows the manual diagram, not a universal standard.",
        "Switch leads are polarity-free; LED leads are not.",
        "Press keyed USB/audio headers straight down to avoid bending pins.",
        "Neat routing improves airflow, noise, and serviceability.",
      ],
      references: [MOTHERBOARD_REF, DEPED_REF, AIRFLOW_REF],
    },
  },

  /* ═══════════════ MODULE 7 ═══════════════ */
  "7.1-bench-testing": {
    videoSummary: [
      "A test bench means assembling the minimum parts outside the case: board, CPU, cooler, one RAM stick, GPU, and PSU.",
      "Installing outside the case makes it far easier to diagnose a dead-on-arrival component.",
      "Place the board on its cardboard box, connect the essentials, and short the PW_SW pins to start it.",
      "Verify fans spin, the board posts, and the BIOS shows the correct CPU, memory, and temperatures.",
      "Only move the working assembly into the case after a successful bench test.",
    ],
    moduleDoc: {
      intro:
        "Before a system is committed to the confines of a case, professional technicians build and test it on an open bench. This approach separates a faulty component from a wiring problem and saves hours of dismantling. This module covers the minimum hardware needed for a bench test and the checks that must pass before case installation.",
      objectives: [
        "List the minimum components required for a bench test.",
        "Assemble and safely power an out-of-case test setup.",
        "Interpret the first POST and BIOS readings before case installation.",
      ],
      sections: [
        {
          heading: "7.1.1 Why Test Outside the Case",
          paragraphs: [
            "When a newly built machine will not start, the cause may be a dead component, a loose cable, a case short, or a front-panel wiring mistake. Testing outside the case removes the case and its wiring from the equation. If the bare system POSTs reliably on the bench, any fault found later must involve the case or an accessory connection.",
            "The bench is also the safest place to make first-boot checks. You can see every fan, reach every header, and observe the board's debug LEDs without removing side panels. A motherboard box provides a rigid, non-conductive platform - exactly the surface recommended in Module 1 for ESD safety.",
          ],
          bullets: [
            "Isolate dead-on-arrival parts before a full assembly.",
            "Avoid case shorts and front-panel wiring during first testing.",
            "Observe debug LEDs and fan spin without dismantling the case.",
            "Use the non-conductive cardboard motherboard box as the bench.",
          ],
        },
        {
          heading: "7.1.2 Minimum Bench Configuration",
          paragraphs: [
            "A bench test needs the motherboard, CPU and cooler, at least one RAM stick in the correct slot, the graphics card if the CPU has no integrated graphics, the power supply, and a monitor. Storage and peripherals can be added later. Connect the 24-pin ATX and 4+4-pin CPU power leads, the GPU's PCIe power, and a monitor cable to the GPU.",
            "Because the case power button is absent, start the system by briefly touching a screwdriver to the two PW_SW pins on the front-panel header. Touch for less than a second - you are closing a momentary switch, not shorting a power rail. Switch the PSU on only after all connections have been checked.",
          ],
          bullets: [
            "Board + CPU/cooler + one DIMM + GPU (if needed) + PSU + monitor.",
            "Connect 24-pin ATX, 4+4 CPU, and all GPU power connectors.",
            "Momentarily short PW_SW pins to power on - no case button required.",
            "Never use the screwdriver on any other header or pin.",
          ],
          note: { tone: "warning", title: "No loose tools", text: "Keep screwdrivers and loose screws off the bench surface while the board is powered - a dropped tool can short exposed connectors instantly." },
        },
        {
          heading: "7.1.3 Interpreting the First Boot",
          paragraphs: [
            "A successful POST is confirmed by fan movement and a display showing the BIOS or manufacturer splash screen. Enter the firmware and check four things immediately: that the CPU model is recognised, that the full memory capacity is detected, that RAM is running at the expected speed, and that CPU temperature is reasonable - typically within a few degrees of room temperature at idle.",
            "If the system powers on but shows no display, work through the fundamentals: reseat RAM, confirm the monitor is connected to the GPU, check that the CPU power cable is fitted, and clear CMOS if necessary. Only after the bare system is stable should the assembly be transferred into the case and the remaining peripherals connected.",
          ],
          bullets: [
            "Confirm fans spin and a display appears.",
            "In BIOS verify CPU model, memory size/speed, and idle temperature.",
            "No display: reseat RAM, check GPU output and CPU power cable.",
            "Transfer to the case only after a clean, repeatable bench POST.",
          ],
        },
      ],
      takeaways: [
        "Bench testing isolates components from case wiring faults.",
        "Only the essential parts are needed for the first POST.",
        "The PW_SW pins can start the board without a case button.",
        "Verify CPU, RAM, and temperatures in BIOS before case installation.",
      ],
      references: [POST_REF, DEPED_REF, TESDA_REF],
    },
  },

  "7.2-hands-on-assembly": {
    videoSummary: [
      "A reliable build follows a fixed sequence: bench prep, CPU, cooler, RAM, M.2, board into case, PSU, GPU, cabling, first boot.",
      "Installing RAM and M.2 before the board goes into the case avoids awkward access later.",
      "Check every keyed connector and clip at each step rather than at the end.",
      "None of the steps should require force - resistance always signals misalignment.",
      "The virtual 3D lab lets you practise this exact sequence and hotspot inspection before touching real hardware.",
    ],
    moduleDoc: {
      intro:
        "The capstone practical brings every previous topic together in one continuous assembly. Whether on a real bench or in the Virtual Assembly Lab, following the canonical sequence prevents the two most common beginner failures: forgetting a step and installing a part in the wrong order. This module is the checklist for that sequence.",
      objectives: [
        "Recall the canonical eight-step PC assembly sequence.",
        "Explain why certain components must be installed before others.",
        "Apply zero-force verification at every step of the build.",
      ],
      sections: [
        {
          heading: "7.2.1 The Canonical Build Sequence",
          paragraphs: [
            "Step one is bench preparation: clear the desk, ground yourself, and lay out tools. Step two is CPU installation into the socket. Step three is applying thermal compound and mounting the cooler. Step four is installing RAM in the correct dual-channel slots, and step five is fitting the M.2 drive. These first five steps happen with the board still on its box because access is unrestricted.",
            "Step six is mounting the motherboard into the case on its standoffs. Step seven is installing the power supply and connecting power, then the graphics card and its PCIe cables. Step eight is front-panel and peripheral cabling followed by the first boot. Keeping this order means no component blocks the installation of another.",
          ],
          bullets: [
            "1 Bench prep → 2 CPU → 3 Cooler → 4 RAM → 5 M.2.",
            "6 Board into case → 7 PSU + GPU → 8 Cabling and first boot.",
            "Install RAM and M.2 before the board enters the case.",
            "Fit the I/O shield before the motherboard.",
          ],
        },
        {
          heading: "7.2.2 Verification at Each Step",
          paragraphs: [
            "After each installation, perform a quick visual and tactile check. The CPU should sit flat with the lever latched; the cooler should be even and its fan plugged into CPU_FAN; RAM clips should be closed on both ends; the M.2 screw should be snug; standoffs should align with every mounting hole; and the GPU latch should click. These checks take seconds and prevent hours of fault-finding.",
            "The principle that runs through the entire sequence is zero force. Every connector in a modern PC is keyed: if something does not fit easily, the orientation is wrong or the part is incompatible. In the Virtual Assembly Lab, clicking the highlighted hotspots gives the same guidance B.O.B. provides in a real lab - identify the part, confirm its keyway, then act.",
          ],
          bullets: [
            "Check CPU flatness, cooler seating, RAM clips, M.2 fastener, standoffs, GPU latch.",
            "Every keyed connector fits easily in exactly one orientation.",
            "Resistance means stop and re-check - never push harder.",
            "Use the 3D lab hotspots to revise each installation step.",
          ],
          note: { tone: "standard", title: "Assessment link", text: "This sequence mirrors the performance criteria for the CSS NC II 'assemble computer systems' competency and the module's 15-item assessment." },
        },
        {
          heading: "7.2.3 From Lab to Live System",
          paragraphs: [
            "Once the build is complete, repeat the bench checks: fan spin, POST, BIOS readings, and a short load test. Monitor temperatures for the first few minutes and listen for unusual noises. A successful assembly ends with a stable system, tidy cabling, and no leftover screws - a final count of fasteners is a surprisingly effective quality check.",
            "The Virtual Assembly Lab is the safe place to make mistakes. Use it to rehearse the order of operations, inspect each socket from every angle, and build confidence before the graded practical. Mastery is shown not by speed but by a build that works on the first attempt.",
          ],
          bullets: [
            "Repeat POST and temperature checks after the final cabling.",
            "Listen for rubbing fans and check for loose screws left over.",
            "Practise the full sequence in the 3D lab before the real assessment.",
            "A correct build is measured by reliability, not speed.",
          ],
        },
      ],
      takeaways: [
        "Follow the eight-step sequence exactly; it prevents blocked access and omissions.",
        "CPU, cooler, RAM, and M.2 are installed before the board enters the case.",
        "Verify every connector with a visual and tactile check after each step.",
        "Zero force applies throughout - keyed parts only fit one way.",
      ],
      references: [DEPED_REF, TESDA_REF, POST_REF],
    },
  },

  "7.3-post-ez-debug": {
    videoSummary: [
      "POST is the Power-On Self-Test the motherboard runs before handing control to the operating system.",
      "Debug LEDs and beep codes narrow a no-boot fault to CPU, DRAM, VGA, or boot device.",
      "A dead system with no lights or fans usually points to the power source or a short.",
      "Fans spinning with no display often means RAM, GPU seating, or a missing CPU power cable.",
      "Check one thing at a time - reseat, clear CMOS, and retest - rather than changing several parts at once.",
    ],
    moduleDoc: {
      intro:
        "When a computer will not start, a technician does not guess - they follow the boot sequence. The motherboard reports how far it got through the Power-On Self-Test (POST) using debug LEDs, beep codes, or a two-digit display. Reading those signals turns a vague 'won't boot' complaint into a specific fault. This module provides a systematic diagnostic method.",
      objectives: [
        "Explain what happens during POST and where it stops on common faults.",
        "Interpret CPU, DRAM, VGA, and BOOT debug indicators.",
        "Apply a safe, step-by-step process to diagnose a no-boot system.",
      ],
      sections: [
        {
          heading: "7.3.1 The Boot Sequence",
          paragraphs: [
            "Pressing the power button triggers the PSU and the motherboard's firmware. The CPU initialises, memory is trained and tested, the graphics subsystem is brought up, and attached boot devices are enumerated. Only when all of these pass does the machine hand control to the operating system loader. POST is that pre-operating-system checklist.",
            "Debug LEDs mark the four usual checkpoints: CPU, DRAM, VGA, and BOOT. If the board stops on DRAM, the fault lies in memory seating or compatibility; if it stops on VGA, suspect the graphics card or its power. A board that hangs on CPU may have a bad processor, a missing 4+4 power lead, or a BIOS that does not support the installed chip.",
          ],
          bullets: [
            "CPU LED: processor power, seating, or BIOS compatibility.",
            "DRAM LED: RAM seating, slot choice, or module compatibility.",
            "VGA LED: graphics card seating or PCIe power connectors.",
            "BOOT LED: no bootable drive detected or a bad boot device.",
          ],
        },
        {
          heading: "7.3.2 No Power vs No Display",
          paragraphs: [
            "Start with the simplest division. If there are no lights and no fan movement, the problem is before POST: check the wall outlet, the PSU switch, the power cable, the 24-pin ATX connector, and the case power-button wiring. A PSU that smells burnt or makes a buzzing noise should be replaced, not opened - capacitors inside can hold a dangerous charge.",
            "If fans spin but there is no display, POST has begun. Reseat RAM, confirm the monitor is on the GPU output, check the CPU power connector, and try clearing CMOS to discard a bad firmware setting. Remove unnecessary peripherals and, where possible, test with one memory stick at a time. Change one variable at a time so you always know what fixed the problem.",
          ],
          bullets: [
            "No lights/fans: outlet, PSU switch, cable, 24-pin ATX, power button wiring.",
            "Fans/no display: reseat RAM, check GPU output and CPU power, clear CMOS.",
            "Use the debug LEDs or beep pattern to identify the failing stage.",
            "Remove add-on cards and peripherals to reduce variables.",
          ],
          note: { tone: "warning", title: "Safety first", text: "Switch off and unplug the PSU before reseating any component. Never open a power supply - capacitors can retain a lethal charge long after unplugging." },
        },
        {
          heading: "7.3.3 Recording and Reporting Faults",
          paragraphs: [
            "Professional technicians document the symptom, the observed LED or beep code, and every action taken. This prevents repeating steps and turns a fault into a learning record. Note down the system specification, what changed before the failure, and whether the problem is repeatable - a fault that appears only under load points in a very different direction from one present at every start.",
            "After the system boots, run a short stress test and watch temperatures. A fault that only appears when hot usually indicates inadequate cooling or a marginal power rail. Once stable, install drivers, enable XMP/EXPO, and verify storage is detected before returning the machine to the user.",
          ],
          bullets: [
            "Record the symptom, debug code, and each corrective action.",
            "Note what changed before the fault and whether it is repeatable.",
            "Test under load if the problem appears only when hot.",
            "After recovery, verify drivers, memory speed, and storage detection.",
          ],
        },
      ],
      takeaways: [
        "POST checks CPU, memory, graphics, and boot device before loading an OS.",
        "Debug LEDs or beeps identify which stage failed.",
        "Separate no-power faults from no-display faults before testing.",
        "Change one thing at a time and record every result.",
      ],
      references: [POST_REF, { label: "Wikipedia - BIOS", url: "https://en.wikipedia.org/wiki/BIOS" }, DEPED_REF],
    },
  },
};

/** Safe fallback so a newly added topic never renders an empty module. */
export const getLessonModuleContent = (topic) =>
  (topic && LESSON_MODULE_CONTENT[topic.id]) || {
    videoSummary: [
      "Watch the demonstration video for this topic and note the key steps shown on screen.",
      "Compare the technician's technique with the safety rules covered in the module.",
      "Review the checklist after watching to confirm each step is understood.",
    ],
    moduleDoc: {
      intro: topic?.explanation || "Study the topic explanation and complete the assessment after the video.",
      objectives: [
        "Understand the purpose of the topic and how it fits into the PC assembly workflow.",
        "Follow correct safety and handling procedures.",
        "Apply the lesson in the interactive 3D laboratory.",
      ],
      sections: [],
      takeaways: [
        "Follow the textbook sequence and never force a component.",
        "Ground yourself and keep the bench clean.",
        "Verify each connection before applying power.",
      ],
      references: [DEPED_REF, TESDA_REF],
    },
  };
