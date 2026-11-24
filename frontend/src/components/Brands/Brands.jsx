import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import GlobalHeader from "../Navigation/GlobalHeader";
import soundManager from "../../utilities/soundManager";
import RevealHeading from "../Common/RevealHeading";
import "./Brands.css";

gsap.registerPlugin(ScrollTrigger);

const brandData = [
  { 
    id: 1, 
    name: "RAKK", 
    role: "Chassis & Mechanical Gear",
    categoryKey: "case",
    secondaryKey: null,
    categoryLabel: "CHASSIS & COOLING",
    accentColor: "#C9C7C0", // Obsidian Gold
    accentGlow: "rgba(176, 141, 87, 0.25)",
    verifiedBadge: "AIRFLOW VALIDATED",
    tagline: "Philippine-engineered high-airflow PC cases & battle-tested mechanical gear.",
    description: "Engineered specifically for tropical ambient temperatures with full-mesh intake panels, magnetic dust filtration, and toolless PCIe drive sleds. Thoroughly bench-tested in BuildLab for radiator clearance up to 360mm.",
    logo: "https://cdn.shopify.com/s/files/1/0101/4864/2879/files/RAKK.png?v=1700623403",
    specs: [
      { label: "Form Factors", val: "ATX / Micro-ATX / ITX" },
      { label: "GPU Clearance", val: "Up to 380 mm" },
      { label: "Radiator Support", val: "240 / 360 mm Front & Top" }
    ],
    supportedComponents: "Mirap, Sinag, Haraya Series Cases & Mechanical Gear"
  },
  { 
    id: 2, 
    name: "Intel", 
    role: "Desktop Processors & Chipsets",
    categoryKey: "cpu",
    secondaryKey: null,
    categoryLabel: "PROCESSORS & CHIPSETS",
    accentColor: "#0071c5", // Intel Electric Blue
    accentGlow: "rgba(0, 113, 197, 0.45)",
    verifiedBadge: "LGA 1700 / 1851 CERTIFIED",
    tagline: "Performance hybrid architecture with high single-thread IPC computing.",
    description: "Industry-standard desktop processors featuring performance hybrid cores (P-cores for gaming, E-cores for background rendering), PCIe 5.0 lanes, DDR5-5600 native controllers, and Intel UHD integrated graphics.",
    logo: "https://cdn.shopify.com/s/files/1/0101/4864/2879/files/INTEL.png?v=1700623403",
    specs: [
      { label: "Platform Sockets", val: "LGA 1700 (12th-14th Gen) / LGA 1851" },
      { label: "Boost Clocks", val: "Up to 6.0 GHz Turbo" },
      { label: "Memory Type", val: "Dual-Channel DDR4 & DDR5" }
    ],
    supportedComponents: "Core i9, Core i7, Core i5, Core i3 & Z790/B760 Chipsets"
  },
  { 
    id: 3, 
    name: "AMD", 
    role: "Ryzen CPUs & Radeon GPUs",
    categoryKey: "cpu",
    secondaryKey: "gpu",
    categoryLabel: "CPUS & RADEON GRAPHICS",
    accentColor: "#ed1c24", // AMD Crimson
    accentGlow: "rgba(237, 28, 36, 0.45)",
    verifiedBadge: "AM5 3D V-CACHE VERIFIED",
    tagline: "Stacked 3D V-Cache gaming silicon & Zen 4 long-life AM5 architecture.",
    description: "Unmatched gaming performance and energy efficiency powered by 96MB of stacked L3 3D V-Cache (Ryzen 7 7800X3D), platform longevity with socket AM5, and RDNA 3 discrete graphics with Smart Access Memory.",
    logo: "https://mir-s3-cdn-cf.behance.net/project_modules/max_1200_webp/5ef7ae157139041.6374208316174.png",
    specs: [
      { label: "Platform Socket", val: "AM5 (1718-Pin LGA)" },
      { label: "L3 Cache Buffer", val: "Up to 96MB 3D V-Cache" },
      { label: "Memory Profiles", val: "AMD EXPO Native DDR5" }
    ],
    supportedComponents: "Ryzen 9, Ryzen 7, Ryzen 5 & Radeon RX 7000 Series GPUs"
  },
  { 
    id: 4, 
    name: "NVIDIA", 
    role: "GeForce RTX Discrete GPUs",
    categoryKey: "gpu",
    secondaryKey: null,
    categoryLabel: "DISCRETE GRAPHICS & AI",
    accentColor: "#76b900", // GeForce Neon Green
    accentGlow: "rgba(118, 185, 0, 0.45)",
    verifiedBadge: "DLSS 3.5 & RAY TRACING",
    tagline: "Ada Lovelace neural rendering, 4th Gen Tensor Cores & DLSS 3.5.",
    description: "The premier standard in PC visual fidelity: dedicated RT cores for realistic optical ray tracing, 4th Gen Tensor cores for neural DLSS Frame Generation, and ultra-fast AV1 hardware encoding for creators and gamers.",
    logo: "https://cdn.shopify.com/s/files/1/0101/4864/2879/files/NVIDIA.png?v=1701397751",
    specs: [
      { label: "Architecture", val: "Ada Lovelace 4N Process" },
      { label: "AI Acceleration", val: "DLSS 3.5 + Frame Gen" },
      { label: "Power Standard", val: "12VHPWR 16-Pin ATX 3.0" }
    ],
    supportedComponents: "GeForce RTX 4090, 4080 Super, 4070 Ti, 4060 Ti & 3060"
  },
  { 
    id: 5, 
    name: "MSI", 
    role: "Motherboards & Graphics",
    categoryKey: "motherboard",
    secondaryKey: "gpu",
    categoryLabel: "MOTHERBOARDS & GRAPHICS",
    accentColor: "#ff0033", // MSI Dragon Red
    accentGlow: "rgba(255, 0, 51, 0.4)",
    verifiedBadge: "MILITARY CLASS VRM",
    tagline: "Heavy-plated extended heatsinks, MAG VRM power delivery & Ventus cooling.",
    description: "Server-grade 6-layer copper printed circuit boards, heavy-plated extended heatsinks for VRM thermal management, and Steel Armor reinforced PCIe x16 slots designed to prevent heavy GPU sag during thermal stress.",
    logo: "https://cdn.shopify.com/s/files/1/0101/4864/2879/files/MSI.png?v=1700623403",
    specs: [
      { label: "VRM Power Stages", val: "14+1+1 Duet Rail System" },
      { label: "Expansion Bus", val: "PCIe 5.0 x16 Steel Armor" },
      { label: "M.2 Thermals", val: "M.2 Shield Frozr Gen4" }
    ],
    supportedComponents: "MAG Tomahawk, Mortar, Pro Series & Ventus Dual/Triple Fans"
  },
  { 
    id: 6, 
    name: "ASUS", 
    role: "ROG & TUF Gaming Rigs",
    categoryKey: "motherboard",
    secondaryKey: "gpu",
    categoryLabel: "MOTHERBOARDS & HARDWARE",
    accentColor: "#ffffff", // ROG Cyan
    accentGlow: "rgba(0, 229, 255, 0.4)",
    verifiedBadge: "TUF 24/7 MILITARY RATED",
    tagline: "Republic of Gamers engineering, AI Overclocking & TUF military durability.",
    description: "Industry-leading UEFI BIOS interface with intuitive Q-Fan tuning, AI Overclocking algorithms, toolless M.2 Q-Latch installation, and TUF chokes tested to withstand 20% higher temperatures with 5X longer lifespans.",
    logo: "https://cdn.shopify.com/s/files/1/0101/4864/2879/files/ASUS_ed526605-d39e-4f9f-8e89-70e59635b47c.png?v=1701928127",
    specs: [
      { label: "Durability Standard", val: "MIL-STD-810H Certified" },
      { label: "Usability Tech", val: "PCIe Slot Q-Release & Q-Latch" },
      { label: "Audio & Network", val: "SupremeFX + Intel 2.5GbE" }
    ],
    supportedComponents: "ROG Strix, TUF Gaming, Prime Motherboards & Dual/TUF GPUs"
  },
  { 
    id: 7, 
    name: "Cooler Master", 
    role: "Thermal Cooling & Cases",
    categoryKey: "case",
    secondaryKey: null,
    categoryLabel: "THERMAL COOLING & CASES",
    accentColor: "#9333ea", // Cooler Master Purple
    accentGlow: "rgba(147, 51, 234, 0.4)",
    verifiedBadge: "THERMAL DYNAMICS OK",
    tagline: "Dual-chamber liquid AIOs, high static SickleFlow fans & HAF airflow cases.",
    description: "Low-resistance radiator fin density paired with SickleFlow ARGB pressure fans and dual-chamber ceramic liquid pump heads. Verified inside BuildLab for zero pump-block RAM clearance conflicts.",
    logo: "https://cdn.shopify.com/s/files/1/0101/4864/2879/files/COOLERMASTER.png?v=1700623403",
    specs: [
      { label: "Pump Architecture", val: "Dual-Chamber Gen 3 Pump" },
      { label: "Static Air Pressure", val: "2.5 mmH2O Max Pressure" },
      { label: "Acoustic Ceiling", val: "27 dBA Quiet Operation" }
    ],
    supportedComponents: "MasterLiquid 240/360, Hyper 212 & HAF/MasterBox Enclosures"
  },
  { 
    id: 8, 
    name: "Corsair", 
    role: "RAM, Modular PSUs & Chassis",
    categoryKey: "ram",
    secondaryKey: "case",
    categoryLabel: "MEMORY & MODULAR POWER",
    accentColor: "#facc15", // Corsair Yellow/Gold
    accentGlow: "rgba(250, 204, 21, 0.4)",
    verifiedBadge: "80+ GOLD & EXPO READY",
    tagline: "Vengeance screened DDR5 modules & Cybenetics Gold RMx modular power supplies.",
    description: "Screened high-frequency memory integrated circuits with onboard PMIC voltage regulation, 100% Japanese 105°C industrial capacitors, and Zero RPM fan mode for silent, ripple-free electrical power delivery.",
    logo: "https://cdn.shopify.com/s/files/1/0101/4864/2879/files/CORSAIR.png?v=1700623403",
    fallbackLogo: "https://cdn.shopify.com/s/files/1/0101/4864/2879/files/CORSAIR.png",
    specs: [
      { label: "Power Efficiency", val: "80 PLUS Gold Cybenetics Certified" },
      { label: "Internal Components", val: "100% Japanese 105°C Capacitors" },
      { label: "Memory Support", val: "Intel XMP 3.0 & AMD EXPO" }
    ],
    supportedComponents: "Vengeance DDR4/DDR5, RMx/RMe Series PSUs & 4000D Airflow"
  },
];

function Brands({ isIntegrated = false }) {
  const navigate = useNavigate();
  const [selectedBrand, setSelectedBrand] = useState(null);
  const containerRef = useRef(null);
  const gridRef = useRef(null);

  // Dynamic 3D card tilt & reactive lighting
  const handleCardMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;

    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);

    gsap.to(card, {
      rotateX,
      rotateY,
      duration: 0.25,
      ease: "power2.out",
      transformPerspective: 800,
      overwrite: "auto",
    });
  };

  const handleCardMouseLeave = (e) => {
    const card = e.currentTarget;
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.45,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  // GSAP ScrollTrigger batch animations for entrance & scroll replayability
  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Header reveal
      ScrollTrigger.create({
        trigger: ".brands-header",
        start: "top 80%",
        end: "bottom 15%",
        onEnter: () => {
          gsap.to(".brands-header", {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.75,
            ease: "power3.out",
            overwrite: "auto",
          });
        },
        onLeaveBack: () => {
          gsap.to(".brands-header", {
            opacity: 0,
            y: 30,
            scale: 0.98,
            duration: 0.4,
            ease: "power2.in",
            overwrite: "auto",
          });
        },
      });

      // 2. Batch animation for brand cards (smooth cascading glide on scroll down & up)
      ScrollTrigger.batch(".brand-card-item", {
        interval: 0.08,
        batchMax: 4,
        start: "top 78%",
        end: "bottom 15%",
        onEnter: (batch) => {
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            scale: 1,
            stagger: 0.08,
            duration: 0.65,
            ease: "power3.out",
            overwrite: "auto",
          });
        },
        onLeave: (batch) => {
          gsap.to(batch, {
            opacity: 0.2,
            y: -20,
            scale: 0.98,
            duration: 0.45,
            ease: "power2.inOut",
            overwrite: "auto",
          });
        },
        onEnterBack: (batch) => {
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            scale: 1,
            stagger: 0.06,
            duration: 0.6,
            ease: "power3.out",
            overwrite: "auto",
          });
        },
        onLeaveBack: (batch) => {
          gsap.to(batch, {
            opacity: 0,
            y: 35,
            scale: 0.95,
            duration: 0.35,
            ease: "power2.in",
            overwrite: "auto",
          });
        },
      });

      // 3. Back to Top Button reveal
      ScrollTrigger.create({
        trigger: ".brands-footer",
        start: "top 92%",
        onEnter: () => {
          gsap.to(".brands-footer", {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            ease: "power2.out",
            overwrite: "auto",
          });
        },
        onLeaveBack: () => {
          gsap.to(".brands-footer", {
            opacity: 0,
            y: 20,
            duration: 0.3,
            ease: "power2.in",
            overwrite: "auto",
          });
        },
      });
    }, containerRef);

    // Refresh ScrollTrigger to ensure correct bounding box measurements
    ScrollTrigger.refresh();

    return () => ctx.revert();
  }, []);

  // Lock background scrolling while the inspection modal is open
  useEffect(() => {
    if (!selectedBrand) return;

    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - html.clientWidth;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.style.paddingRight = prevBodyPaddingRight;
    };
  }, [selectedBrand]);

  const handleBrandClick = (brand) => {
    try { soundManager.click(); } catch {}
    setSelectedBrand(brand);
  };

  const handleJumpToBuilder = (brandName) => {
    try { soundManager.click(); } catch {}
    navigate(`/build?search=${encodeURIComponent(brandName)}`);
  };

  return (
    <div
      className={`brands-page ${isIntegrated ? 'integrated-section' : ''}`}
      id="brands-station"
      ref={containerRef}
    >
      {!isIntegrated && <GlobalHeader />}

      <div className="brands-container-wrap">
        {/* Header Section */}
        <header className="brands-header">
          <RevealHeading
            as="h2"
            className="brands-headline"
            text="All Supported Brands & Silicon Partners"
          />

          <p className="brands-subheadline">
            BuildLab curates the world's most trusted computer hardware manufacturers. Every brand featured is verified for socket clearances, thermal dissipation limits, and bus communication compatibility.
          </p>
        </header>

        {/* Brand Showcase Grid */}
        <div className="brands-showcase-grid" ref={gridRef}>
          {brandData.map((brand) => (
            <div 
              key={brand.id} 
              className={`brand-card-item ${selectedBrand?.id === brand.id ? 'active-brand' : ''}`}
              style={{
                "--brand-accent": brand.accentColor,
                "--brand-glow": brand.accentGlow,
              }}
              onClick={() => handleBrandClick(brand)}
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
              title={`Click to inspect ${brand.name} specifications and components`}
            >
              {/* High-Craft Frosted Logo Pedestal */}
              <div className="brand-pedestal-container">
                <div className="pedestal-ambient-flare" />
                <div className="brand-pedestal-slot">
                  <img 
                    src={brand.logo} 
                    alt={`${brand.name} official manufacturer logo`} 
                    className="brand-pedestal-img" 
                    loading="lazy"
                    onError={(e) => {
                      if (brand.fallbackLogo && e.target.src !== brand.fallbackLogo) {
                        e.target.src = brand.fallbackLogo;
                      } else {
                        e.target.style.display = 'none';
                      }
                    }}
                  />
                </div>
              </div>

              {/* Brand Meta & Role */}
              <div className="brand-card-meta">
                <div className="brand-title-row">
                  <h3 className="brand-name">{brand.name}</h3>
                </div>
                <p className="brand-role">{brand.role}</p>
                <p className="brand-tagline">{brand.tagline}</p>
              </div>

              {/* Interactive Inspect Trigger Button */}
              <div className="brand-card-action">
                <button 
                  type="button" 
                  className="brand-inspect-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBrandClick(brand);
                  }}
                >
                  <span>INSPECT HARDWARE SPECS</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Full-Detail Brand Inspection Drawer / Modal */}
        {selectedBrand && (
          <div className="brand-inspect-modal" onClick={() => setSelectedBrand(null)}>
            <div 
              className="brand-inspect-content" 
              onClick={(e) => e.stopPropagation()}
              style={{
                "--modal-accent": selectedBrand.accentColor,
                "--modal-glow": selectedBrand.accentGlow,
              }}
            >
              <div className="inspect-header-row">
                <div className="inspect-title-bay">
                  <div className="inspect-pill-row">
                    <span className="inspect-tag">{selectedBrand.categoryLabel}</span>
                    <span className="inspect-verified">{selectedBrand.verifiedBadge}</span>
                  </div>
                  <h2>{selectedBrand.name}</h2>
                  <p className="inspect-sub">{selectedBrand.role}</p>
                </div>

                <button 
                  className="close-inspect-btn" 
                  onClick={() => setSelectedBrand(null)}
                  title="Close inspection panel"
                >
                  &times;
                </button>
              </div>

              <div className="inspect-divider" />

              <p className="inspect-body">{selectedBrand.description}</p>

              {/* Deep Telemetry Grid in Modal */}
              <div className="inspect-telemetry-grid">
                {selectedBrand.specs.map((spec, idx) => (
                  <div key={idx} className="inspect-telemetry-card">
                    <span className="tel-label">{spec.label}</span>
                    <span className="tel-val">{spec.val}</span>
                  </div>
                ))}
                <div className="inspect-telemetry-card full-span">
                  <span className="tel-label">VERIFIED COMPONENTS IN BUILDLAB</span>
                  <span className="tel-val">{selectedBrand.supportedComponents}</span>
                </div>
              </div>

              <div className="inspect-action-row">
                <button 
                  className="btn-primary-brand"
                  onClick={() => handleJumpToBuilder(selectedBrand.name)}
                >
                  <span>Build with {selectedBrand.name} Components</span>
                  <span className="arrow">&rarr;</span>
                </button>
                <button 
                  className="btn-outline-brand"
                  onClick={() => setSelectedBrand(null)}
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Clean Back to Top Section */}
        <div className="brands-footer">
          <button 
            type="button" 
            className="btn-brand-primary back-to-top-btn"
            onClick={() => {
              try { soundManager.click(); } catch {}
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            title="Scroll back to top of page"
          >
            <span>Back to Top</span>
            <span className="arrow">&uarr;</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Brands;
