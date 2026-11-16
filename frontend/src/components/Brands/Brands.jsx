import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import GlobalHeader from "../Navigation/GlobalHeader";
import soundManager from "../../utilities/soundManager";
import "./Brands.css";

gsap.registerPlugin(ScrollTrigger);

const brandData = [
  { 
    id: 1, 
    name: "RAKK", 
    role: "Chassis & Mechanical Gear",
    description: "Affordable Philippine-engineered high-airflow PC cases and battle-tested peripherals.",
    logo: "https://cdn.shopify.com/s/files/1/0101/4864/2879/files/RAKK.png?v=1700623403",
    categoryKey: "case"
  },
  { 
    id: 2, 
    name: "Intel", 
    role: "Desktop Processors & Chipsets",
    description: "Industry-leading Raptor Lake & Core 14th Gen high IPC computing architectures.",
    logo: "https://cdn.shopify.com/s/files/1/0101/4864/2879/files/INTEL.png?v=1700623403",
    categoryKey: "cpu"
  },
  { 
    id: 3, 
    name: "AMD", 
    role: "Ryzen CPUs & Radeon GPUs",
    description: "Pioneers of 3D V-Cache gaming processors (Ryzen 7 7800X3D) and Zen 4 AM5 motherboards.",
    logo: "https://mir-s3-cdn-cf.behance.net/project_modules/max_1200_webp/5ef7ae157139041.6374208316174.png",
    categoryKey: "cpu"
  },
  { 
    id: 4, 
    name: "NVIDIA", 
    role: "GeForce RTX Discrete GPUs",
    description: "World standards in real-time ray tracing, DLSS 3.5 neural rendering, and high-performance CUDA computing.",
    logo: "https://cdn.shopify.com/s/files/1/0101/4864/2879/files/NVIDIA.png?v=1701397751",
    categoryKey: "gpu"
  },
  { 
    id: 5, 
    name: "MSI", 
    role: "Motherboards & Graphics",
    description: "Military-grade MAG VRM power delivery, Mortar motherboards, and Ventus gaming graphics.",
    logo: "https://cdn.shopify.com/s/files/1/0101/4864/2879/files/MSI.png?v=1700623403",
    categoryKey: "motherboard"
  },
  { 
    id: 6, 
    name: "ASUS", 
    role: "ROG & TUF Gaming Rigs",
    description: "Flagship Republic of Gamers and TUF military-certified durability across boards and cards.",
    logo: "https://cdn.shopify.com/s/files/1/0101/4864/2879/files/ASUS_ed526605-d39e-4f9f-8e89-70e59635b47c.png?v=1701928127",
    categoryKey: "motherboard"
  },
  { 
    id: 7, 
    name: "Cooler Master", 
    role: "Thermal Cooling & Cases",
    description: "High-static pressure SickleFlow fans, MasterLiquid AIOs, and HAF high-airflow enclosures.",
    logo: "https://cdn.shopify.com/s/files/1/0101/4864/2879/files/COOLERMASTER.png?v=1700623403",
    categoryKey: "case"
  },
  { 
    id: 8, 
    name: "Corsair", 
    role: "RAM, Modular PSUs & Chassis",
    description: "Vengeance DDR4/DDR5 RGB modules, RMx 80-Plus Gold power supplies, and iCUE ecosystem.",
    logo: "https://cdn.shopify.com/s/files/1/0101/4864/2879/files/CORSAIR.png?v=1700623403",
    fallbackLogo: "https://cdn.shopify.com/s/files/1/0101/4864/2879/files/CORSAIR.png",
    categoryKey: "ram"
  },
];

function Brands({ isIntegrated = false }) {
  const navigate = useNavigate();
  const [selectedBrand, setSelectedBrand] = useState(null);
  const containerRef = useRef(null);

  // Dynamic 3D card tilt & reactive lighting
  const handleCardMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

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

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Header reveal
      gsap.fromTo(
        ".brands-header",
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".brands-header",
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // 2. GreenSock ScrollTrigger.batch for brand cards (KKXZOyZ style)
      ScrollTrigger.batch(".brand-logo-card", {
        interval: 0.08,
        batchMax: 4,
        onEnter: (batch) =>
          gsap.fromTo(
            batch,
            { opacity: 0, y: 40, scale: 0.94 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              stagger: 0.08,
              duration: 0.7,
              ease: "power3.out",
              overwrite: "auto",
            }
          ),
        onLeaveBack: (batch) =>
          gsap.to(batch, {
            opacity: 0,
            y: 40,
            scale: 0.94,
            stagger: 0.04,
            duration: 0.4,
            overwrite: "auto",
          }),
      });

      // 3. Back to Top Button reveal
      gsap.fromTo(
        ".brands-footer",
        { opacity: 0, y: 25 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".brands-footer",
            start: "top 92%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

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
        <header className="brands-header">
          <div className="brands-badge-kicker">
            <span className="bracket">[</span>
            <span className="dot" />
            <span>CERTIFIED HARDWARE ECOSYSTEM</span>
            <span className="bracket">]</span>
          </div>
          <h1>All Supported Brands</h1>
          <div className="brands-description">
            <p>
              At BUILDLAB, we bring together a curated selection of the most trusted and high-performance brands in the tech industry. From industry leaders like Intel, AMD, and NVIDIA to reliable names such as ASUS, MSI, Corsair, and Cooler Master — every brand featured is verified for socket clearances, thermal envelopes, and bus compatibility.
            </p>
            <p>
              Click any manufacturer below to inspect their hardware capabilities or jump directly into the BuildLab workbench with matched components.
            </p>
          </div>
        </header>

        <div className="brands-showcase-grid">
          {brandData.map((brand) => (
            <div 
              key={brand.id} 
              className={`brand-logo-card ${selectedBrand?.id === brand.id ? 'active-brand' : ''}`}
              onClick={() => handleBrandClick(brand)}
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
              title={`Click to view ${brand.name} components`}
            >
              <div className="brand-logo-wrapper">
                <img 
                  src={brand.logo} 
                  alt={brand.name} 
                  className="brand-logo-img" 
                  onError={(e) => {
                    if (brand.fallbackLogo && e.target.src !== brand.fallbackLogo) {
                      e.target.src = brand.fallbackLogo;
                    } else {
                      e.target.style.display = 'none';
                    }
                  }}
                />
              </div>
              <div className="brand-card-meta">
                <h3 className="brand-title">{brand.name}</h3>
                <span className="brand-role">{brand.role}</span>
              </div>
            </div>
          ))}
        </div>

        {selectedBrand && (
          <div className="brand-inspect-modal">
            <div className="brand-inspect-content">
              <div className="inspect-header-row">
                <div>
                  <span className="inspect-tag">FEATURED MANUFACTURER</span>
                  <h2>{selectedBrand.name}</h2>
                  <p className="inspect-sub">{selectedBrand.role}</p>
                </div>
                <button 
                  className="close-inspect-btn" 
                  onClick={() => setSelectedBrand(null)}
                  title="Close panel"
                >
                  ✕
                </button>
              </div>
              <p className="inspect-body">{selectedBrand.description}</p>
              <div className="inspect-action-row">
                <button 
                  className="btn-primary-brand"
                  onClick={() => handleJumpToBuilder(selectedBrand.name)}
                >
                  <span>Build with {selectedBrand.name} Parts</span>
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
