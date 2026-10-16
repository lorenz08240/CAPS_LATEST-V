import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useBuild } from "../../contexts/BuildContext";
import "./Learn.css";

const componentGuide = [
  {
    id: "cpu",
    name: "Processor (CPU)",
    heroImage: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=2000",
    tags: ["2026", "Hardware", "Brain", "Compute"],
    description: "The central engine of your PC. It executes every instruction from your OS and applications. Its speed and core count directly influence how fast your computer boots and how responsive your software feels.",
    image: "/assets/cpu_learn.jpg",
    specs: [
      { label: "Socket", value: "LGA1700, AM5", info: "Must match motherboard" },
      { label: "Cores/Threads", value: "6-24 cores", info: "More cores = multitasking" },
      { label: "Clock Speed", value: "3.5-5.8 GHz", info: "Speed of processing" },
      { label: "TDP", value: "65-250W", info: "Heat output" },
    ],
    whyMatters: "The CPU is the central engine of your PC. It executes every instruction from your OS and applications. Its speed and core count directly influence how fast your computer boots, how responsive your software feels, and how well it handles demanding multi-threaded tasks like video editing or gaming. Choosing the right CPU is crucial because it sets the baseline for your system's performance ceiling and dictates compatibility with your motherboard and cooling solution.",
    proTips: [
      "Always verify the CPU socket matches the motherboard socket before purchasing.",
      "For gaming builds, prioritize a high-clock-speed CPU over an excessive number of cores.",
      "Consider a CPU with an integrated graphics chip if you plan to troubleshoot without a dedicated GPU.",
      "Always check the Thermal Design Power (TDP) to ensure you select an appropriate air or liquid cooler.",
      "Look for 'K' (Intel) or 'X' (AMD) suffixes if you intend to perform manual overclocking.",
    ],
    commonMistakes: [
      "Buying a CPU with a socket that is physically incompatible with your motherboard, which will prevent installation.",
      "Overspending on a top-tier CPU while neglecting the GPU, which creates a bottleneck that limits gaming performance.",
      "Failing to account for the CPU's TDP when selecting a cooler, leading to thermal throttling or system instability.",
      "Neglecting to apply high-quality thermal paste or removing the plastic film from a pre-applied cooler during installation.",
    ],
    bestFor: { gaming: "6-8 cores", streaming: "12+ cores", work: "16+ cores", budget: "Core i5 / Ryzen 5", enthusiast: "Core i9 / Ryzen 9" },
    brands: [
      { name: "Intel", description: "Core i9/i7/i5 series.", tier: "Performance" },
      { name: "AMD", description: "Ryzen 9/7/5 series.", tier: "Value/Efficiency" },
      { name: "Qualcomm", description: "Emerging ARM-based PC chips.", tier: "Efficiency" },
      { name: "Apple", description: "M-series proprietary silicon.", tier: "Unified" },
    ],
  },
  {
    id: "motherboard",
    name: "Motherboard",
    heroImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2000",
    tags: ["Foundation", "Connectivity", "Hub"],
    description: "The central communication hub. It connects your CPU, RAM, GPU, and storage, ensuring data flows efficiently between them.",
    image: "https://i.pinimg.com/736x/bf/78/40/bf78407d4e2b911170cf064615d571eb.jpg",
    specs: [
      { label: "Socket", value: "LGA1700, AM5", info: "Matches CPU" },
      { label: "RAM Type", value: "DDR4, DDR5", info: "Must match RAM" },
      { label: "Form Factor", value: "ATX, mATX, ITX", info: "Case compatibility" },
      { label: "Expansion", value: "PCIe Gen 4/5", info: "For GPUs/SSDs" },
    ],
    whyMatters: "The motherboard serves as the communication hub for your entire system. It connects your CPU, RAM, GPU, and storage, ensuring data flows efficiently between them. A high-quality motherboard provides stable power delivery to your CPU, features for future expansion, and necessary connectivity options like high-speed USB ports and fast networking. It acts as the backbone, and its form factor is the primary constraint on your case size and component compatibility.",
    proTips: [
      "Ensure the motherboard form factor (ATX, mATX, ITX) physically fits inside your chosen case.",
      "Verify the motherboard supports the RAM speed and generation (DDR4 or DDR5) you plan to use.",
      "Look for boards with reinforced PCIe slots if you are using a very heavy high-end GPU.",
      "Check the number of M.2 slots available if you intend to run multiple NVMe SSDs.",
      "Consider built-in Wi-Fi and Bluetooth if you don't plan on using a wired Ethernet connection.",
    ],
    commonMistakes: [
      "Choosing a motherboard with an incompatible CPU socket, rendering the components impossible to assemble.",
      "Buying a motherboard that only supports DDR4 memory when you have purchased a faster DDR5 RAM kit.",
      "Selecting a large ATX motherboard for a compact ITX case, causing physical clearance issues.",
      "Overlooking the need for BIOS updates, which may be required to support the latest generation of CPUs.",
    ],
    bestFor: { gaming: "ATX boards", budget: "mATX", compact: "ITX", workstation: "E-ATX boards", server: "Server-grade boards" },
    brands: [
      { name: "ASUS", description: "Reliable and high performance.", tier: "Premium" },
      { name: "MSI", description: "Excellent value boards.", tier: "Mid-range" },
      { name: "Gigabyte", description: "Strong feature sets.", tier: "Mid-range" },
      { name: "ASRock", description: "Feature-rich budget boards.", tier: "Value" },
      { name: "Biostar", description: "Entry-level specialized boards.", tier: "Budget" },
    ],
  },
  {
    id: "ram",
    name: "Memory (RAM)",
    heroImage: "https://images.unsplash.com/photo-1562976540-1502f7596005?q=80&w=2000",
    tags: ["Speed", "Multitasking", "Storage"],
    description: "Your computer's short-term memory, providing lightning-fast access to data currently being used by the CPU.",
    image: "https://i.pinimg.com/736x/3e/63/46/3e6346153850d046d9019c94a0214dc1.jpg",
    specs: [
      { label: "Capacity", value: "16GB - 64GB", info: "16GB minimum gaming" },
      { label: "Speed", value: "3200-6400MHz", info: "Higher is faster" },
      { label: "Type", value: "DDR4 / DDR5", info: "No backward compatibility" },
      { label: "Channels", value: "Dual Channel", info: "Use 2 sticks" },
    ],
    whyMatters: "RAM acts as your computer's short-term memory, providing lightning-fast access to data currently being used by the CPU. Without enough RAM, your system will rely on your storage drive (which is significantly slower), leading to noticeable sluggishness and stuttering. Faster speed and sufficient capacity ensure that your PC can handle complex multitasking and intensive games without performance bottlenecks, making it a key factor in overall system responsiveness.",
    proTips: [
      "Always install RAM in matching pairs to take advantage of dual-channel performance.",
      "16GB is the current standard for gaming, while 32GB is recommended for creative tasks.",
      "Check your motherboard's QVL (Qualified Vendor List) to ensure your specific RAM kit is supported.",
      "Enable XMP or EXPO in the BIOS after installation to run your RAM at its advertised speed.",
      "Lower CAS latency is often more beneficial than higher raw clock speed for real-world performance.",
    ],
    commonMistakes: [
      "Using only a single stick of RAM, which halves the memory bandwidth by disabling dual-channel mode.",
      "Mixing different RAM kits with varying speeds or timings, which can cause instability or reduce the system to the lowest speed.",
      "Attempting to install DDR4 memory into a DDR5-only motherboard slot, causing physical and electrical incompatibility.",
      "Underestimating total RAM requirements, leading to heavy paging to the SSD and severe system slowdowns.",
    ],
    bestFor: { gaming: "16GB/32GB", streaming: "32GB+", productivity: "64GB+", rendering: "128GB+", workstation: "256GB+" },
    brands: [
      { name: "Corsair", description: "Reliable and great RGB.", tier: "Premium" },
      { name: "G.Skill", description: "High-speed performance.", tier: "Premium" },
      { name: "Kingston", description: "Industry standard stability.", tier: "Reliable" },
      { name: "Crucial", description: "Cost-effective memory solutions.", tier: "Value" },
    ],
  },
  {
    id: "psu",
    name: "Power Supply",
    heroImage: "https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2?q=80&w=2000",
    tags: ["Energy", "Stability", "Efficiency"],
    description: "The lifeblood of your PC, safely converting electricity from your wall into the stable DC power your components require.",
    image: "https://www.bequiet.com/admin/ImageServer.php?ID=aca5aa48198@be-quiet.net&width=550&colorspace=rgb&force=true",
    specs: [
      { label: "Wattage", value: "650W - 1200W", info: "Ensure 20% headroom" },
      { label: "Efficiency", value: "80+ Bronze/Gold", info: "Gold is ideal" },
      { label: "Modularity", value: "Full / Semi", info: "Modular is cleaner" },
      { label: "Warranty", value: "5-10 years", info: "Quality indicator" },
    ],
    whyMatters: "The PSU is the lifeblood of your PC, safely converting electricity from your wall into the stable DC power your components require. A reliable PSU is non-negotiable; cheap or undersized units can cause random system crashes, unstable performance, or even catastrophic hardware failure if they fail under load. Choosing a unit with adequate wattage and high efficiency protects your investment and ensures your system runs silently and efficiently for years.",
    proTips: [
      "Aim for 80+ Gold efficiency or higher to minimize heat output and electricity costs.",
      "Calculate your system's peak power draw and add a 20% buffer to choose the right wattage.",
      "Opt for a fully modular PSU to significantly simplify cable management inside your case.",
      "Check if your PSU includes the necessary 12VHPWR cable if using a modern high-end NVIDIA GPU.",
      "Don't ignore the warranty length; reputable manufacturers often offer 7-10 years as a sign of quality.",
    ],
    commonMistakes: [
      "Selecting a PSU with insufficient wattage for your high-performance components, resulting in random power-off crashes under load.",
      "Prioritizing aesthetics over reliability, potentially exposing expensive parts to ripple, voltage spikes, or outright failure.",
      "Using non-modular power supplies in cramped cases, making cable management nearly impossible and restricting airflow.",
      "Failing to confirm that the PSU has the correct type and number of connectors (PCIe cables, CPU power) for your GPU and motherboard.",
    ],
    bestFor: { "Budget Build": "650W Bronze", "Gaming Rig": "750W-850W Gold", "Workstation": "1000W+", "Server": "1200W Platinum", "Compact Build": "SFX Form Factor" },
    brands: [
      { name: "EVGA", description: "Top-tier reliability.", tier: "Premium" },
      { name: "Seasonic", description: "Gold standard for PSUs.", tier: "Premium" },
      { name: "Corsair", description: "Great modular options.", tier: "Mid-range" },
      { name: "Cooler Master", description: "Versatile and quiet units.", tier: "Mid-range" },
      { name: "Thermaltake", description: "Affordable reliable PSUs.", tier: "Value" },
    ],
  },
  {
    id: "gpu",
    name: "Graphics Card",
    heroImage: "https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?q=80&w=2000",
    tags: ["Gaming", "Rendering", "Visuals"],
    description: "The engine driving your visual experience, handling all graphics calculations for games, video rendering, and 3D design software.",
    image: "https://st4.depositphotos.com/1719616/38666/i/450/depositphotos_386666498-stock-photo-modern-black-computer-video-card.jpg",
    specs: [
      { label: "VRAM", value: "8GB - 24GB", info: "8GB minimum for 1440p" },
      { label: "Interface", value: "PCIe 4.0 / 5.0", info: "Connects to Mobo" },
      { label: "Power", value: "150W - 450W", info: "Requires PSU power" },
      { label: "Size", value: "2-3 Slot", info: "Check case clearance" },
    ],
    whyMatters: "The GPU is the engine that drives your visual experience, handling all graphics calculations for games, video rendering, and 3D design software. It is arguably the most critical component for gamers, determining frame rates, resolution capabilities, and visual quality. A powerful GPU allows for smooth gameplay at higher resolutions, while also offloading intensive graphical tasks from your CPU, creating a balanced and powerful system for both leisure and professional workloads.",
    proTips: [
      "Allocate approximately 40-50% of your total budget to the GPU for a gaming-focused build.",
      "Check the physical dimensions of the GPU to ensure it fits in your case without hitting drive bays.",
      "Use display cables that support the refresh rate and resolution of your monitor.",
      "Install the latest drivers directly from the manufacturer's website immediately after installation.",
      "Consider a triple-fan model for better thermals and quieter operation if space allows.",
    ],
    commonMistakes: [
      "Underpowering the GPU with an undersized PSU, which can lead to black screens or system restarts during graphically demanding scenes.",
      "Neglecting physical size constraints, leading to a card that is too long or thick to fit in the chosen computer case.",
      "Overspending on a high-VRAM model for lower-resolution gaming (1080p), where the extra memory provides no meaningful benefit.",
      "Forgetting to plug in all required auxiliary PCIe power cables, which will prevent the card from booting.",
    ],
    bestFor: { "1080p": "RTX 4060", "1440p": "RTX 4070", "4K": "RTX 4090", "VR Gaming": "High VRAM models", "AI Workloads": "Professional grade GPUs" },
    brands: [
      { name: "NVIDIA", description: "Industry leader in tech.", tier: "Premium" },
      { name: "AMD", description: "Best value and performance.", tier: "Value" },
      { name: "Intel", description: "Arc series entry-level.", tier: "Budget" },
      { name: "ASUS ROG", description: "Highly overclocked custom cards.", tier: "Enthusiast" },
    ],
  },
  {
    id: "case",
    name: "PC Chassis",
    heroImage: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?q=80&w=2000",
    tags: ["Airflow", "Aesthetics", "Shell"],
    description: "More than just an aesthetic shell, your case is a critical thermal management tool that determines airflow and component longevity.",
    image: "https://images.unsplash.com/photo-1725302862351-869681e17dbf?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y29tcHV0ZXIlMjBjYXNlfGVufDB8fDB8fHww",
    specs: [
      { label: "Form Factor", value: "ATX, mATX, ITX", info: "Must match Mobo" },
      { label: "Airflow", value: "Mesh / Glass", info: "Mesh is better for cooling" },
      { label: "Cooling", value: "120-360mm Rads", info: "Check radiator support" },
      { label: "Storage", value: "2.5\" / 3.5\"", info: "Drive bays available" },
    ],
    whyMatters: "Beyond just an aesthetic shell, your case is a critical thermal management tool. It determines how effectively your fans, air coolers, or radiators can intake cool air and exhaust hot air, directly impacting the longevity and performance of your internal hardware. A well-designed case makes the building process significantly easier with thoughtful cable management and sufficient space, ensuring all your high-performance parts fit comfortably and stay cool under sustained heavy workloads.",
    proTips: [
      "Prioritize cases with mesh or perforated front panels for significantly better airflow.",
      "Ensure the case supports the maximum height of your intended CPU air cooler.",
      "Check if the case includes pre-installed fans to save on additional purchase costs.",
      "Look for cases with removable dust filters for easier maintenance and cleanliness.",
      "Ensure the case supports the radiator size if you plan on using an AIO liquid cooler.",
    ],
    commonMistakes: [
      "Purchasing a case that does not support your motherboard's form factor (e.g., trying to fit an ATX board in an ITX case).",
      "Ignoring airflow requirements, such as picking a case with a solid front panel that chokes the intake fans.",
      "Overlooking component clearance for large GPUs or tall CPU air coolers, forcing you to return or replace parts.",
      "Buying a case without adequate cable management options, which can clutter the interior and obstruct necessary airflow paths.",
    ],
    bestFor: { "Airflow": "Fractal Meshify", "Minimalist": "NZXT H Series", "Compact": "ITX cases", "Open Frame": "Unique aesthetic designs", "Server/NAS": "Multi-drive storage cases" },
    brands: [
      { name: "Fractal", description: "Excellent airflow & design.", tier: "Premium" },
      { name: "NZXT", description: "Sleek, minimalist aesthetic.", tier: "Premium" },
      { name: "Corsair", description: "Great versatility.", tier: "Mid-range" },
      { name: "Lian Li", description: "High-end glass chassis.", tier: "Premium" },
      { name: "Phanteks", description: "Innovative cooling designs.", tier: "Mid-range" },
    ],
  },
];

export default function Learn() {
  const { getSelectedComponents } = useBuild();
  const [currentIndex, setCurrentIndex] = useState(0);
  const selectedComponent = componentGuide[currentIndex];
  const [fadeKey, setFadeKey] = useState(0); // To trigger animation on change
  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  const [quizCardIndex, setQuizCardIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});

  // Question bank: 4 quick Google-definition-style quiz flash cards per component
  const flashcardDeck = {
    cpu: [
      {
        question: "What is the primary physical constraint when installing a CPU into a motherboard?",
        options: [
          { text: "The socket type (e.g., LGA1700 or AM5) must match exactly.", correct: true },
          { text: "The CPU fan color must match the motherboard RGB.", correct: false },
          { text: "The CPU must be from the exact same company as the GPU.", correct: false },
        ],
        explanation: "CPU sockets are mechanically engineered; trying to install an AM5 chip into an LGA1700 socket or vice versa will bend pins or not physically fit."
      },
      {
        question: "What does TDP (Thermal Design Power) indicate on a processor?",
        options: [
          { text: "The maximum amount of heat dissipated that the cooling solution must handle.", correct: true },
          { text: "The total number of monitors the CPU can output.", correct: false },
          { text: "The speed at which the RAM runs with the CPU.", correct: false },
        ],
        explanation: "TDP measures expected heat output under real workloads, helping you choose adequate air or liquid cooling."
      },
      {
        question: "For dedicated competitive gaming, what CPU metric is generally most beneficial?",
        options: [
          { text: "High single-core boost clock speed and large L3 cache.", correct: true },
          { text: "Having 64 low-frequency server cores.", correct: false },
          { text: "Using integrated graphics instead of a dedicated GPU.", correct: false },
        ],
        explanation: "Most gaming game engines rely heavily on single-thread frame latency and rapid cache access rather than dozens of idle cores."
      },
      {
        question: "What critical step is required right before mounting a CPU cooler?",
        options: [
          { text: "Applying thermal paste and removing the protective plastic film from the cooler plate.", correct: true },
          { text: "Submerging the CPU in water for 5 minutes.", correct: false },
          { text: "Turning on the PC while the cooler is disconnected.", correct: false },
        ],
        explanation: "Leaving the factory protective plastic film on a cooler or forgetting thermal paste is one of the most common thermal throttling errors."
      }
    ],
    motherboard: [
      {
        question: "Which form factor is typically the largest standard consumer motherboard size?",
        options: [
          { text: "ATX (Advanced Technology eXtended)", correct: true },
          { text: "Mini-ITX", correct: false },
          { text: "Micro-ATX", correct: false },
        ],
        explanation: "Standard ATX provides up to 7 expansion slots, whereas mATX has 4 and Mini-ITX has only 1."
      },
      {
        question: "Can a motherboard designed exclusively for DDR4 RAM accept DDR5 RAM modules?",
        options: [
          { text: "No, DDR4 and DDR5 have different notch keys and voltage architectures.", correct: true },
          { text: "Yes, RAM slots are always universal.", correct: false },
          { text: "Only if you perform a BIOS firmware upgrade.", correct: false },
        ],
        explanation: "DDR4 and DDR5 memory modules possess physically different notch positions to prevent accidental cross-insertion."
      },
      {
        question: "What is the primary role of the motherboard's VRM (Voltage Regulator Module)?",
        options: [
          { text: "To step down 12V from the PSU into clean, precise low voltage for the CPU.", correct: true },
          { text: "To control display resolutions on your monitor.", correct: false },
          { text: "To store permanent Windows operating system files.", correct: false },
        ],
        explanation: "High-quality VRMs with robust heatsinks keep power delivery stable during heavy sustained CPU boost clocks."
      },
      {
        question: "What is an M.2 NVMe slot on the motherboard used for?",
        options: [
          { text: "Ultra-fast direct PCIe solid-state storage (SSDs).", correct: true },
          { text: "Connecting the wall power cord directly.", correct: false },
          { text: "Plugging in the keyboard and mouse.", correct: false },
        ],
        explanation: "M.2 slots communicate directly through high-speed PCIe lanes, providing transfer speeds up to 7000+ MB/s."
      }
    ],
    ram: [
      {
        question: "Why should RAM be installed in matching pairs rather than a single stick?",
        options: [
          { text: "It activates dual-channel mode, doubling memory bandwidth to the processor.", correct: true },
          { text: "It cuts electricity consumption in half.", correct: false },
          { text: "Single sticks do not allow the PC to turn on.", correct: false },
        ],
        explanation: "Dual-channel mode lets the memory controller read and write to two sticks simultaneously, eliminating CPU bottlenecks."
      },
      {
        question: "What must you enable in the BIOS to run high-speed RAM at its rated advertised speed?",
        options: [
          { text: "XMP (Intel Extreme Memory Profile) or AMD EXPO.", correct: true },
          { text: "Windows Safe Mode.", correct: false },
          { text: "Bluetooth High Priority Mode.", correct: false },
        ],
        explanation: "By default, motherboards boot RAM at conservative JEDEC baseline speeds until XMP/EXPO is toggled."
      },
      {
        question: "What happens when your PC runs completely out of available RAM?",
        options: [
          { text: "The OS pages to the SSD/HDD, causing severe stuttering and lag.", correct: true },
          { text: "The monitor immediately loses signal forever.", correct: false },
          { text: "The power supply trips and shuts off.", correct: false },
        ],
        explanation: "Virtual memory paging keeps software from instantly crashing, but disk speeds are orders of magnitude slower than RAM."
      },
      {
        question: "What does the CAS Latency (CL) number signify on a RAM spec sheet?",
        options: [
          { text: "The clock cycles delay between sending a read command and receiving data.", correct: true },
          { text: "The number of gigabytes inside the memory module.", correct: false },
          { text: "The maximum operating temperature in Celsius.", correct: false },
        ],
        explanation: "Lower CAS latency at the same clock frequency yields faster response time."
      }
    ],
    psu: [
      {
        question: "What does the '80 Plus' certification indicate on a power supply?",
        options: [
          { text: "Energy efficiency rating (at least 80% of drawn AC power is converted to DC).", correct: true },
          { text: "That the power supply will last for exactly 80 months.", correct: false },
          { text: "That the power supply generates 80 decibels of sound.", correct: false },
        ],
        explanation: "Certifications from Bronze to Titanium verify lower heat waste and electrical efficiency."
      },
      {
        question: "What is the primary benefit of a 'Fully Modular' power supply?",
        options: [
          { text: "You only plug in the cables your build actually needs, improving cable management and airflow.", correct: true },
          { text: "It allows wireless power transmission to the motherboard.", correct: false },
          { text: "It doubles your GPU's gaming framerate.", correct: false },
        ],
        explanation: "Detachable cables leave no bulky clutter inside the case, keeping airflow channels clear."
      },
      {
        question: "What can occur if you pair high-draw parts with an undersized, low-wattage PSU?",
        options: [
          { text: "Automatic shutdowns, reboot loops, or tripped over-current protections during gaming peaks.", correct: true },
          { text: "Your keyboard letters will type backwards.", correct: false },
          { text: "The CPU fan will turn in reverse.", correct: false },
        ],
        explanation: "Modern GPUs exhibit transient power spikes that trip safety protections on undersized power supplies."
      },
      {
        question: "Why should you never mix and match modular cables between different PSU brands?",
        options: [
          { text: "The pinouts at the power supply end are not standardized and can fry hardware.", correct: true },
          { text: "The cables will physically melt within 5 seconds.", correct: false },
          { text: "Cables from other brands only transmit black and white video.", correct: false },
        ],
        explanation: "While the component-side connector is standardized, the PSU-side pin arrangement varies wildly between manufacturers."
      }
    ],
    gpu: [
      {
        question: "What is VRAM (Video RAM) on a graphics card responsible for?",
        options: [
          { text: "Storing high-res textures, shaders, framebuffers, and 3D geometric assets.", correct: true },
          { text: "Powering the CPU cooling fan.", correct: false },
          { text: "Saving your Windows user password securely.", correct: false },
        ],
        explanation: "High resolution textures and ray-tracing buffers require fast dedicated VRAM to render frames smoothly."
      },
      {
        question: "Which motherboard slot does a dedicated graphics card plug into?",
        options: [
          { text: "The primary PCIe x16 slot (usually the top slot connected directly to the CPU).", correct: true },
          { text: "The SATA 3.0 storage port.", correct: false },
          { text: "The front-panel USB header.", correct: false },
        ],
        explanation: "The top PCIe x16 slot has the widest bandwidth and direct lanes leading straight to the CPU."
      },
      {
        question: "What happens if a high-end graphics card is installed with an old, underpowered dual-core CPU?",
        options: [
          { text: "A severe CPU bottleneck will prevent the GPU from reaching its full potential.", correct: true },
          { text: "The GPU will automatically increase its clock speed to compensate.", correct: false },
          { text: "The graphics card will fail to power on.", correct: false },
        ],
        explanation: "When the CPU cannot prepare frames as fast as the GPU can render them, frame drops and stutters occur."
      },
      {
        question: "What modern GPU connector powers RTX 40-series and next-gen cards with up to 600W?",
        options: [
          { text: "The 12VHPWR / 12V-2x6 16-pin connector.", correct: true },
          { text: "Standard USB-C phone charger.", correct: false },
          { text: "Floppy drive 4-pin connector.", correct: false },
        ],
        explanation: "The 12VHPWR high-density connector replaces up to three or four older 8-pin PCIe cables."
      }
    ],
    case: [
      {
        question: "What is the primary factor that dictates good computer case thermal performance?",
        options: [
          { text: "Perforated mesh ventilation panels that provide unobstructed positive or neutral airflow.", correct: true },
          { text: "Completely sealed heavy tempered glass on all panels.", correct: false },
          { text: "Having the maximum number of stickers on the exterior.", correct: false },
        ],
        explanation: "Cases with solid front glass choke intake fans, driving internal temperatures and fan noise up."
      },
      {
        question: "What is 'Positive Pressure' in PC case airflow management?",
        options: [
          { text: "More intake airflow than exhaust, which prevents dust from entering through un-filtered cracks.", correct: true },
          { text: "Pressurizing the case with compressed air so components hover.", correct: false },
          { text: "Having only exhaust fans with no intakes.", correct: false },
        ],
        explanation: "Positive pressure forces air out of seam gaps, ensuring air only enters through removable dust filters."
      },
      {
        question: "What must you check before buying a large CPU dual-tower air cooler?",
        options: [
          { text: "The maximum CPU cooler clearance height supported by the chassis specifications.", correct: true },
          { text: "Whether the cooler matches the color of your room walls.", correct: false },
          { text: "The size of your mousepad.", correct: false },
        ],
        explanation: "Tower coolers that exceed the case's specified cooler clearance will prevent the side panel from closing."
      },
      {
        question: "What purpose do pre-installed motherboard standoffs serve in a case?",
        options: [
          { text: "They elevate the motherboard to prevent metal-on-metal electrical short circuits against the tray.", correct: true },
          { text: "They act as thermal heat sinks for the hard drive.", correct: false },
          { text: "They hold the tempered glass panel in place.", correct: false },
        ],
        explanation: "Fastening a bare motherboard directly against metal chassis sheet metal without standoffs will short out circuits upon power-up."
      }
    ]
  };

  const currentQuestions = flashcardDeck[selectedComponent.id] || flashcardDeck.cpu;
  const currentCard = currentQuestions[quizCardIndex] || currentQuestions[0];

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % componentGuide.length);
    setQuizCardIndex(0);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? componentGuide.length - 1 : prevIndex - 1));
    setQuizCardIndex(0);
  };

  const handleSelectComponent = (idx) => {
    setCurrentIndex(idx);
    setQuizCardIndex(0);
  };

  // Preload hero images
  useEffect(() => {
    componentGuide.forEach((comp) => {
      const img = new Image();
      img.src = comp.heroImage;
    });
  }, []);

  // Listen to scroll to display floating quick-switcher when scrolled past hero
  useEffect(() => {
    const handleScroll = () => {
      const heroEl = document.querySelector(".cinematic-hero");
      if (heroEl) {
        const bottom = heroEl.getBoundingClientRect().bottom;
        setScrolledPastHero(bottom < 120);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Trigger re-render animation when component changes
  useEffect(() => {
    setFadeKey(prev => prev + 1);
  }, [currentIndex]);

  const handleAnswerSelect = (qIdx, optIdx) => {
    setUserAnswers(prev => ({
      ...prev,
      [`${selectedComponent.id}-${qIdx}`]: optIdx
    }));
  };

  return (
    <div className="learn-page">
      {/* Decorative bg elements to match Compatibility */}
      <div className="bg-grid" aria-hidden="true" />
      <div className="bg-glow bg-glow-1" aria-hidden="true" />
      <div className="bg-glow bg-glow-2" aria-hidden="true" />

      {/* ── STICKY QUICK COMPONENT SWITCHER BAR (Visible when scrolled down) ── */}
      <div className={`sticky-component-bar ${scrolledPastHero ? "visible" : ""}`}>
        <div className="sticky-bar-inner">
          <div className="sticky-bar-label">
            <span className="sticky-dot"></span>
            <span>LEARN MODULE:</span>
          </div>
          <div className="sticky-pill-track">
            {componentGuide.map((comp, idx) => (
              <button
                key={comp.id}
                className={`sticky-pill-btn ${currentIndex === idx ? "active" : ""}`}
                onClick={() => handleSelectComponent(idx)}
              >
                <span className="sticky-pill-icon">
                  {comp.id === "cpu" && "⚡"}
                  {comp.id === "motherboard" && "🎛️"}
                  {comp.id === "ram" && "💾"}
                  {comp.id === "psu" && "🔋"}
                  {comp.id === "gpu" && "🎮"}
                  {comp.id === "case" && "📦"}
                </span>
                <span className="sticky-pill-text">{comp.name.split(" ")[0]}</span>
              </button>
            ))}
          </div>
          <div className="sticky-bar-nav">
            <button onClick={handlePrev} className="sticky-arrow" title="Previous Component">‹</button>
            <span className="sticky-counter">0{currentIndex + 1} / 0{componentGuide.length}</span>
            <button onClick={handleNext} className="sticky-arrow" title="Next Component">›</button>
          </div>
        </div>
      </div>
      
      {/* ── CINEMATIC HERO ── */}
      <div 
        key={`bg-${fadeKey}`}
        className="cinematic-hero" 
        style={{ backgroundImage: `url(${selectedComponent.image})` }}
      >
        <div className="hero-gradient-overlay"></div>
        
        <div className="hero-content-wrapper">
          <h1 key={`title-${fadeKey}`} className="hero-title animate-fade-in">{selectedComponent.name}</h1>
          
          <div key={`badges-${fadeKey}`} className="hero-badges animate-fade-in-delayed">
            {selectedComponent.tags.map((tag, idx) => (
              <span key={idx} className="badge-pill">{tag}</span>
            ))}
          </div>
          
          <p key={`desc-${fadeKey}`} className="hero-description animate-fade-in-delayed-more">
            {selectedComponent.description}
          </p>
          
          {/* Controls */}
          <div className="hero-controls-wrapper animate-fade-in-delayed-more">
            <div className="hero-carousel-indicators">
              {componentGuide.map((comp, idx) => (
                <div 
                  key={comp.id} 
                  className={`carousel-dot ${currentIndex === idx ? 'active' : ''}`}
                  onClick={() => handleSelectComponent(idx)}
                ></div>
              ))}
            </div>
            
            <div className="hero-nav-buttons">
              <button onClick={handlePrev} className="nav-btn" aria-label="Previous component">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <button onClick={handleNext} className="nav-btn" aria-label="Next component">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            </div>
          </div>
        </div>

        {/* ── SCROLL INDICATOR (Bottom Center) ── */}
        <div 
          className="hero-scroll-guide"
          onClick={() => {
            const target = document.getElementById("learn-modules-section");
            if (target) {
              target.scrollIntoView({ behavior: "smooth" });
            }
          }}
        >
          <span className="scroll-guide-text">SCROLL</span>
          <svg className="scroll-guide-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </div>
      </div>

      {/* ── W3SCHOOLS-STYLE LEARNING HUB ── */}
      <div id="learn-modules-section" className="w3-learning-section">
        <div className="w3-learning-container">
          <div className="w3-learning-header">
            <div className="w3-badge-wrap">
              <span className="w3-pill">W3Schools Learning Standard</span>
              <span className="w3-module-indicator">Module: {selectedComponent.name}</span>
            </div>
            <h2 className="w3-main-title">Hardware Architecture & Technical Reference</h2>
            <p className="w3-subtitle">
              Master physical specifications, compatibility laws, and real-world engineering principles behind modern PC hardware.
            </p>
          </div>

          {/* W3 Reference Navigation Banner */}
          <div className="w3-ref-banner">
            <div className="w3-ref-info">
              <span className="w3-code-icon">⚡</span>
              <div>
                <strong>Connected Learning Hub:</strong> W3Schools computing fundamentals & computer systems architecture references.
              </div>
            </div>
            <a 
              href="https://www.w3schools.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w3-external-link"
            >
              Visit W3Schools Reference ↗
            </a>
          </div>

          {/* ── INTERACTIVE WORKBENCH: ARCHITECTURE OVERVIEW + GOOGLE-STYLE QUICK QUIZ FLASHCARDS ── */}
          <div className="w3-academy-grid">
            <div className="w3-panel w3-panel-main">
              <div className="w3-panel-bar">
                <span className="w3-dot red"></span>
                <span className="w3-dot yellow"></span>
                <span className="w3-dot green"></span>
                <span className="w3-panel-title">technical_overview.sys</span>
              </div>
              <div className="w3-panel-body">
                <h3>Understanding {selectedComponent.name}</h3>
                <p className="w3-body-desc">{selectedComponent.whyMatters}</p>
                
                <div className="w3-code-box">
                  <div className="w3-code-header">
                    <span>HARDWARE DATA REGISTRY</span>
                    <span className="w3-live-tag">LIVE SPEC</span>
                  </div>
                  <pre>
                    <code>
{`// System Specification Definition: ${selectedComponent.name}
{
  "category": "${selectedComponent.id.toUpperCase()}",
  "operational_role": "${selectedComponent.tags.join(" | ")}",
  "thermal_envelope": "${selectedComponent.specs.find(s => s.label.toLowerCase().includes('tdp') || s.label.toLowerCase().includes('power'))?.value || 'Dynamic'}",
  "interface_socket": "${selectedComponent.specs.find(s => s.label.toLowerCase().includes('socket') || s.label.toLowerCase().includes('interface') || s.label.toLowerCase().includes('factor'))?.value || 'Standard'}"
}`}
                    </code>
                  </pre>
                </div>
              </div>
            </div>

            {/* ── GOOGLE SEARCH DEFINITION STYLE: QUICK QUIZ FLASH CARD DECK ── */}
            <div className="w3-panel w3-panel-quiz">
              <div className="w3-panel-bar">
                <div className="w3-flashcard-header-left">
                  <span className="google-quiz-icon">🔍</span>
                  <span className="w3-panel-title">Quick Definition Quiz</span>
                </div>
                <div className="w3-card-pills">
                  {currentQuestions.map((_, qIdx) => (
                    <button
                      key={qIdx}
                      className={`card-step-pill ${quizCardIndex === qIdx ? "active" : ""} ${userAnswers[`${selectedComponent.id}-${qIdx}`] !== undefined ? "answered" : ""}`}
                      onClick={() => setQuizCardIndex(qIdx)}
                      title={`Card ${qIdx + 1}`}
                    >
                      {qIdx + 1}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="w3-panel-body google-flashcard-body">
                <div className="flashcard-badge-row">
                  <span className="flashcard-tag">QUESTION {quizCardIndex + 1} OF {currentQuestions.length}</span>
                  <span className="flashcard-topic">{selectedComponent.name}</span>
                </div>

                <h4 className="flashcard-question-text">
                  {currentCard.question}
                </h4>

                <div className="flashcard-options-list">
                  {currentCard.options.map((opt, optIdx) => {
                    const answeredOpt = userAnswers[`${selectedComponent.id}-${quizCardIndex}`];
                    const isSelected = answeredOpt === optIdx;
                    const showFeedback = answeredOpt !== undefined;
                    
                    let statusClass = "";
                    if (showFeedback) {
                      if (opt.correct) statusClass = "correct-choice";
                      else if (isSelected && !opt.correct) statusClass = "wrong-choice";
                    }

                    return (
                      <button
                        key={optIdx}
                        className={`flashcard-opt-btn ${isSelected ? "selected" : ""} ${statusClass}`}
                        onClick={() => handleAnswerSelect(quizCardIndex, optIdx)}
                      >
                        <span className="opt-letter">{String.fromCharCode(65 + optIdx)}</span>
                        <span className="opt-text">{opt.text}</span>
                        {showFeedback && opt.correct && <span className="opt-check">✓</span>}
                        {showFeedback && isSelected && !opt.correct && <span className="opt-cross">✕</span>}
                      </button>
                    );
                  })}
                </div>

                {userAnswers[`${selectedComponent.id}-${quizCardIndex}`] !== undefined && (
                  <div className="flashcard-explanation-box animate-fade-in">
                    <span className="exp-icon">💡</span>
                    <span className="exp-text">
                      <strong>Takeaway: </strong>{currentCard.explanation}
                    </span>
                  </div>
                )}

                <div className="flashcard-footer-controls">
                  <button 
                    className="flashcard-nav-btn"
                    disabled={quizCardIndex === 0}
                    onClick={() => setQuizCardIndex(prev => Math.max(0, prev - 1))}
                  >
                    ← Previous
                  </button>
                  <span className="flashcard-progress-counter">
                    Card {quizCardIndex + 1} / {currentQuestions.length}
                  </span>
                  <button 
                    className="flashcard-nav-btn next-btn"
                    disabled={quizCardIndex === currentQuestions.length - 1}
                    onClick={() => setQuizCardIndex(prev => Math.min(currentQuestions.length - 1, prev + 1))}
                  >
                    Next Card →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── DETAIL PANEL ── */}
      <div className="detail-panel">
        <div className="detail-cards-grid">
          {/* ── SPECS TABLE ── */}
          <div className="content-card">
            <h3 className="section-title">Key Specifications</h3>
            <div className="specs-grid">
              {selectedComponent.specs.map((spec, idx) => (
                <div key={idx} className="spec-item">
                  <div className="spec-label">{spec.label}</div>
                  <div className="spec-value">{spec.value}</div>
                  <div className="spec-info">{spec.info}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── PRO TIPS ── */}
          <div className="content-card">
            <h3 className="section-title">Pro Tips</h3>
            <div className="tips-grid">
              {selectedComponent.proTips.map((tip, idx) => (
                <div key={idx} className="tip-item">
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── COMMON MISTAKES ── */}
          <div className="content-card">
            <h3 className="section-title">Common Mistakes to Avoid</h3>
            <div className="mistakes-grid">
              {selectedComponent.commonMistakes.map((mistake, idx) => (
                <div key={idx} className="mistake-item">
                  <span>{mistake}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── BEST FOR ── */}
          <div className="content-card">
            <h3 className="section-title">Recommendation Matrix</h3>
            <div className="best-for-grid">
              {Object.entries(selectedComponent.bestFor).map(
                ([useCase, recommendation], idx) => (
                  <div key={idx} className="best-for-item">
                    <div className="use-case">{useCase}</div>
                    <div className="recommendation">{recommendation}</div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* ── BRANDS ── */}
          <div className="content-card">
            <h3 className="section-title">Popular Hardware Manufacturers</h3>
            <div className="brands-grid">
              {selectedComponent.brands.map((brand, idx) => (
                <div key={idx} className="brand-item">
                  <div className="brand-header">
                    <div>
                      <div className="brand-name">{brand.name}</div>
                      <div className="brand-tier">{brand.tier}</div>
                    </div>
                  </div>
                  <p className="brand-description">{brand.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* ── CTA ── */}
        <div className="detail-cta" style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <Link to="/build" className="cta-button-neon">
            Launch PC Builder
          </Link>
          <Link to="/brands" className="cta-button-neon">
            Explore All Brands
          </Link>
        </div>
      </div>
    </div>
  );
}