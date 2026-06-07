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
    image: "https://i.pinimg.com/736x/86/99/ea/8699ea01df7d3b229a4a4e39d4e6735f.jpg",
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

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % componentGuide.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? componentGuide.length - 1 : prevIndex - 1));
  };

  // Preload hero images
  useEffect(() => {
    componentGuide.forEach((comp) => {
      const img = new Image();
      img.src = comp.heroImage;
    });
  }, []);

  // Trigger re-render animation when component changes
  useEffect(() => {
    setFadeKey(prev => prev + 1);
  }, [currentIndex]);


  return (
    <div className="learn-page">
      {/* Decorative bg elements to match Compatibility */}
      <div className="bg-grid" aria-hidden="true" />
      <div className="bg-glow bg-glow-1" aria-hidden="true" />
      <div className="bg-glow bg-glow-2" aria-hidden="true" />
      
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
                  onClick={() => setCurrentIndex(idx)}
                ></div>
              ))}
            </div>
            
            <div className="hero-nav-buttons">
              <button onClick={handlePrev} className="nav-btn" aria-label="Previous component">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <button onClick={handleNext} className="nav-btn" aria-label="Next component">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </button>
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

          {/* ── WHY IT MATTERS ── */}
          <div className="content-card">
            <h3 className="section-title">Why It Matters</h3>
            <p className="card-text">
              {selectedComponent.whyMatters}
            </p>
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
            <h3 className="section-title">Common Mistakes</h3>
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
            <h3 className="section-title">Best For</h3>
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
            <h3 className="section-title">Popular Brands</h3>
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
            Go to Build
          </Link>
          <Link to="/brands" className="cta-button-neon">
            Explore All Brands
          </Link>
        </div>
      </div>
    </div>
  );
}