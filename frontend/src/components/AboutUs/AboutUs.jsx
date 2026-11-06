import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import GlobalHeader from "../Navigation/GlobalHeader";
import soundManager from "../../utilities/soundManager";
import "./AboutUs.css";

const TEAM_MEMBERS = [
  {
    id: "DEV-01",
    roleCategory: "core",
    name: "Developer 01",
    designation: "Lead Systems Architect & Full-Stack Engineer",
    codename: "SYSTEM_CORE",
    avatarBadge: "ARCH",
    highlight: "Core Architecture & State Matrix",
    bio: "Leads the software architecture of BuildLab, bridging the React state machine with real-time 3D assembly graphs and the Node.js backend. Dedicated to zero-latency component selection and mathematical TDP validation.",
    keyContributions: [
      "Engineered multi-tier component picker and dependency state tree",
      "Integrated Three.js WebGL canvas with live hardware inventory",
      "Architected real-time bottleneck and socket matching algorithms"
    ],
    techStack: ["React 19", "Three.js", "Node.js", "Express", "MySQL"],
    rigSpecs: {
      cpu: "AMD Ryzen 9 7900X (12 Cores, 24 Threads)",
      gpu: "NVIDIA GeForce RTX 4080 Super 16GB",
      ram: "64GB DDR5-6000 CL30 (2x32GB)",
      storage: "2TB PCIe Gen4 NVMe M.2 SSD",
      chassis: "Lian Li O11 Dynamic EVO (Black)"
    },
    favTip: "Never cheap out on your power supply. An efficient Tier-A PSU protects your entire investment from dirty power and transient voltage spikes.",
    github: "https://github.com",
    linkedin: "https://linkedin.com"
  },
  {
    id: "DEV-02",
    roleCategory: "frontend",
    name: "Developer 02",
    designation: "UI/UX Lead & Frontend Design Engineer",
    codename: "CYBER_HUD",
    avatarBadge: "UI/UX",
    highlight: "Design Systems & Command Deck Interaction",
    bio: "Designed BuildLab's cohesive dark cyberpunk aesthetic, the mahogany Command Deck drawer, sound-synchronized interactions, and accessible high-contrast telemetry across all screen viewports.",
    keyContributions: [
      "Crafted the unified Wood-Mahogany Command Deck sidebar navigation",
      "Implemented Web Audio API procedural sound feedback system",
      "Optimized responsive mobile HUD layouts with zero horizontal clipping"
    ],
    techStack: ["React", "Motion/React", "CSS3 / Variables", "Web Audio API", "Figma"],
    rigSpecs: {
      cpu: "Intel Core i7-14700K (20 Cores, 28 Threads)",
      gpu: "NVIDIA GeForce RTX 4070 Ti Super 16GB",
      ram: "32GB DDR5-5600 CL36 (2x16GB)",
      storage: "1TB Kingston KC3000 + 2TB Crucial P3",
      chassis: "NZXT H6 Flow Dual-Chamber"
    },
    favTip: "Assemble your motherboard, CPU, RAM, and M.2 SSD on top of the motherboard box before placing anything inside the PC case. It gives you 360-degree clear visibility.",
    github: "https://github.com",
    linkedin: "https://linkedin.com"
  },
  {
    id: "DEV-03",
    roleCategory: "core",
    name: "Developer 03",
    designation: "3D Graphics & WebGL Simulation Engineer",
    codename: "MESH_RENDER",
    avatarBadge: "3D/GL",
    highlight: "Three.js Hardware Models & Orbit Rigging",
    bio: "Crafts the interactive 3D hardware studio, procedural PC components, physically based rendering (PBR) materials, and realistic socket snap-fit clearances using Three.js and WebGL shaders.",
    keyContributions: [
      "Built the 3D Studio inspection viewport with smooth OrbitControls",
      "Engineered procedural heatsink sickle fans and RAM module geometry",
      "Calculated camera docking coordinates for all 7 hardware stages"
    ],
    techStack: ["Three.js", "WebGL", "GLTF / GLB", "Blender", "Canvas API"],
    rigSpecs: {
      cpu: "AMD Ryzen 7 7800X3D (8 Cores, 3D V-Cache)",
      gpu: "AMD Radeon RX 7900 XTX 24GB",
      ram: "32GB DDR5-6000 CL30 Low-Latency Kit",
      storage: "2TB Samsung 990 Pro PCIe 4.0 NVMe",
      chassis: "Fractal Design North (Charcoal with Walnut Front)"
    },
    favTip: "Remember to peel off the clear plastic protective film from the bottom of your CPU cooler's copper cold plate before mounting it with thermal paste!",
    github: "https://github.com",
    linkedin: "https://linkedin.com"
  },
  {
    id: "DEV-04",
    roleCategory: "backend",
    name: "Developer 04",
    designation: "Backend & Database Systems Architect",
    codename: "DATA_VAULT",
    avatarBadge: "API/DB",
    highlight: "MySQL Normalization & Crawler Pipeline",
    bio: "Architected BuildLab's normalized MySQL relational database, RESTful Express services, and the automated crawler hub that manages hardware specifications and benchmark baselines.",
    keyContributions: [
      "Designed normalized database schema for 7+ hardware categories",
      "Built headless crawler integration and admin verification queue",
      "Implemented secure JWT session management and admin inventory control"
    ],
    techStack: ["Node.js", "Express.js", "MySQL / MariaDB", "Cheerio", "JWT"],
    rigSpecs: {
      cpu: "AMD Ryzen 9 5950X (16 Cores, 32 Threads)",
      gpu: "NVIDIA GeForce RTX 3080 10GB",
      ram: "64GB DDR4-3600 (4x16GB)",
      storage: "4TB NVMe SSD + 24TB Home NAS Storage",
      chassis: "Corsair 5000D Airflow"
    },
    favTip: "Dual-channel memory goes into slots 2 and 4 (A2/B2). Check your motherboard's PCB silkscreen to ensure maximum signal trace impedance.",
    github: "https://github.com",
    linkedin: "https://linkedin.com"
  },
  {
    id: "DEV-05",
    roleCategory: "backend",
    name: "Developer 05",
    designation: "Hardware Research Lead & QA Specialist",
    codename: "VERIFY_LAB",
    avatarBadge: "QA/SPEC",
    highlight: "Compatibility Matrices & Socket Verification",
    bio: "Researched and documented hundreds of component socket standards, RAM clearance heights, PCIe lane bifurcation rules, and TDP dissipation curves to guarantee 100% accurate compatibility checks.",
    keyContributions: [
      "Curated and verified 500+ component compatibility matrix rules",
      "Audited LGA1700/AM5 cooler bracket clearances and PSU modular pinout alerts",
      "Authored B.O.B. Interactive Troubleshooting Knowledge Base"
    ],
    techStack: ["Hardware Specs Audit", "Benchmarking", "Jest", "Data Verification"],
    rigSpecs: {
      cpu: "Intel Core i5-13600K (14 Cores, 20 Threads)",
      gpu: "NVIDIA GeForce RTX 4060 Ti 16GB",
      ram: "32GB DDR4-3600 CL16",
      storage: "1TB WD Black SN850X NVMe SSD",
      chassis: "DeepCool CH560 Digital (Tempered Glass)"
    },
    favTip: "Never mix modular PSU cables between different power supply units. The pinouts on the power supply side are not standardized and can permanently fry your motherboard.",
    github: "https://github.com",
    linkedin: "https://linkedin.com"
  }
];

export default function AboutUs() {
  const [filter, setFilter] = useState("all");
  const [selectedMember, setSelectedMember] = useState(null);
  const navigate = useNavigate();

  const filteredMembers = filter === "all" 
    ? TEAM_MEMBERS 
    : TEAM_MEMBERS.filter((m) => m.roleCategory === filter);

  const handleFilterClick = (cat) => {
    try { soundManager.click(); } catch {}
    setFilter(cat);
  };

  const handleOpenDossier = (member) => {
    try { soundManager.snap(); } catch {}
    setSelectedMember(member);
  };

  const handleCloseDossier = () => {
    try { soundManager.click(); } catch {}
    setSelectedMember(null);
  };

  return (
    <div className="about-us-page">
      <GlobalHeader />

      <div className="about-ambient-glow" aria-hidden="true" />
      <div className="about-grid-overlay" aria-hidden="true" />

      <div className="about-container">
        {/* HERO INTEL SECTION */}
        <section className="about-hero-section">
          <div className="about-telemetry-badge">
            <span className="telemetry-live-dot" />
            <span className="telemetry-label">PATEROS TECHNOLOGICAL COLLEGE // BSIT CAPSTONE</span>
            <span className="telemetry-bracket">[ DEPLOYED ]</span>
          </div>

          <h1 className="about-hero-title">
            THE ARCHITECTS BEHIND <span className="title-accent">BUILDLAB</span>
          </h1>

          <p className="about-hero-description">
            BuildLab was conceived and engineered by five student developers known as the 
            <strong> WhiteHats</strong> at Pateros Technological College. Our goal was to eliminate 
            PC assembly intimidation by creating an interactive, real-time 3D workstation that verifies 
            physical clearances, electrical loads, and socket compatibility before you spend a single peso on hardware.
          </p>

          <div className="about-stats-ribbon">
            <div className="stat-card">
              <span className="stat-num">05</span>
              <span className="stat-label">DEVELOPERS</span>
              <span className="stat-sub">WhiteHats Team</span>
            </div>
            <div className="stat-divider">/</div>
            <div className="stat-card">
              <span className="stat-num">07</span>
              <span className="stat-label">HARDWARE STAGES</span>
              <span className="stat-sub">Validated End-to-End</span>
            </div>
            <div className="stat-divider">/</div>
            <div className="stat-card">
              <span className="stat-num">100%</span>
              <span className="stat-label">ZERO CONFLICT</span>
              <span className="stat-sub">Logic Verification</span>
            </div>
            <div className="stat-divider">/</div>
            <div className="stat-card">
              <span className="stat-num">PTC</span>
              <span className="stat-label">INSTITUTION</span>
              <span className="stat-sub">College of ICT</span>
            </div>
          </div>
        </section>

        {/* TEAM DOSSIER SECTION */}
        <section className="about-team-section">
          <div className="team-section-header">
            <div className="team-header-left">
              <span className="team-section-kicker">OPERATIVES DIRECTORY</span>
              <h2 className="team-section-heading">Developer Vitae &amp; Roles</h2>
            </div>

            <div className="team-filter-buttons">
              <button 
                type="button" 
                className={`filter-btn ${filter === "all" ? "active" : ""}`}
                onClick={() => handleFilterClick("all")}
              >
                ALL (5)
              </button>
              <button 
                type="button" 
                className={`filter-btn ${filter === "core" ? "active" : ""}`}
                onClick={() => handleFilterClick("core")}
              >
                CORE &amp; 3D (2)
              </button>
              <button 
                type="button" 
                className={`filter-btn ${filter === "frontend" ? "active" : ""}`}
                onClick={() => handleFilterClick("frontend")}
              >
                FRONTEND &amp; UX (1)
              </button>
              <button 
                type="button" 
                className={`filter-btn ${filter === "backend" ? "active" : ""}`}
                onClick={() => handleFilterClick("backend")}
              >
                BACKEND &amp; QA (2)
              </button>
            </div>
          </div>

          <div className="team-cards-grid">
            {filteredMembers.map((member) => (
              <div 
                key={member.id} 
                className="team-member-card"
                onClick={() => handleOpenDossier(member)}
              >
                <div className="card-top-bar">
                  <span className="member-id-tag">{member.id}</span>
                  <span className="member-badge-pill">{member.avatarBadge}</span>
                </div>

                <div className="card-avatar-wrap">
                  <div className="avatar-hex-frame">
                    <svg viewBox="0 0 100 100" className="avatar-hex-svg">
                      <polygon points="50 3, 93 26, 93 74, 50 97, 7 74, 7 26" className="hex-outer" />
                      <polygon points="50 10, 85 29, 85 71, 50 90, 15 71, 15 29" className="hex-inner" />
                    </svg>
                    <div className="avatar-icon-content">
                      <span className="avatar-code">{member.codename.slice(0, 3)}</span>
                    </div>
                  </div>
                  <div className="avatar-glow-ring" />
                </div>

                <div className="card-main-meta">
                  <h3 className="member-name">{member.name}</h3>
                  <p className="member-designation">{member.designation}</p>
                  <span className="member-highlight-tag">{member.highlight}</span>
                </div>

                <p className="member-brief-bio">
                  {member.bio}
                </p>

                <div className="member-tech-pills">
                  {member.techStack.slice(0, 3).map((tech, i) => (
                    <span key={i} className="tech-tag">{tech}</span>
                  ))}
                  {member.techStack.length > 3 && (
                    <span className="tech-tag-more">+{member.techStack.length - 3}</span>
                  )}
                </div>

                <div className="card-footer-action">
                  <span className="action-hint">VIEW FULL VITAE</span>
                  <span className="action-arrow">&rarr;</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FULL VITAE DOSSIER MODAL */}
        {selectedMember && (
          <div className="dossier-modal-backdrop" onClick={handleCloseDossier}>
            <div 
              className="dossier-modal-window wood-mahogany" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="dossier-header-bar">
                <div className="dossier-title-group">
                  <span className="dossier-kicker">ENGINEERING DOSSIER // {selectedMember.id}</span>
                  <h2 className="dossier-name">{selectedMember.name}</h2>
                  <span className="dossier-designation">{selectedMember.designation}</span>
                </div>
                <button 
                  type="button" 
                  className="dossier-close-btn"
                  onClick={handleCloseDossier}
                  aria-label="Close Dossier"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div className="dossier-body-grid">
                <div className="dossier-left-col">
                  <div className="dossier-meta-card">
                    <span className="meta-card-title">SPECIALTY FOCUS</span>
                    <p className="meta-card-text">{selectedMember.highlight}</p>
                  </div>

                  <div className="dossier-meta-card">
                    <span className="meta-card-title">PRIMARY TECHNOLOGIES</span>
                    <div className="dossier-tech-wrap">
                      {selectedMember.techStack.map((tech, i) => (
                        <span key={i} className="dossier-tech-badge">{tech}</span>
                      ))}
                    </div>
                  </div>

                  <div className="dossier-meta-card rig-card">
                    <span className="meta-card-title">PERSONAL PC RIG</span>
                    <ul className="dossier-rig-list">
                      <li><strong>CPU:</strong> {selectedMember.rigSpecs.cpu}</li>
                      <li><strong>GPU:</strong> {selectedMember.rigSpecs.gpu}</li>
                      <li><strong>RAM:</strong> {selectedMember.rigSpecs.ram}</li>
                      <li><strong>Storage:</strong> {selectedMember.rigSpecs.storage}</li>
                      <li><strong>Chassis:</strong> {selectedMember.rigSpecs.chassis}</li>
                    </ul>
                  </div>
                </div>

                <div className="dossier-right-col">
                  <div className="dossier-section-block">
                    <h4 className="dossier-subhead">CAPSTONE ACHIEVEMENTS</h4>
                    <ul className="dossier-contributions-list">
                      {selectedMember.keyContributions.map((contrib, idx) => (
                        <li key={idx}>
                          <span className="bullet-point">▸</span>
                          <span>{contrib}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="dossier-section-block">
                    <h4 className="dossier-subhead">HARDWARE PHILOSOPHY</h4>
                    <blockquote className="dossier-quote">
                      "{selectedMember.favTip}"
                    </blockquote>
                  </div>

                  <div className="dossier-section-block">
                    <h4 className="dossier-subhead">AFFILIATION</h4>
                    <p className="dossier-academic-text">
                      Bachelor of Science in Information Technology / Computer Science
                      <br />
                      Pateros Technological College — WhiteHats Capstone Group
                    </p>
                  </div>
                </div>
              </div>

              <div className="dossier-footer-bar">
                <span className="dossier-status-text">
                  STATUS: VERIFIED DEVELOPER RECORD // BUILDLAB V2.4
                </span>
                <button 
                  type="button" 
                  className="dossier-done-btn"
                  onClick={handleCloseDossier}
                >
                  DISMISS DOSSIER
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PROJECT ORIGIN & MISSION SECTION */}
        <section className="about-origin-section">
          <div className="origin-card">
            <div className="origin-eyebrow">
              <span className="origin-dot" />
              <span>THE WHITEHATS MISSION</span>
            </div>
            <h2 className="origin-title">Why We Built BuildLab</h2>
            <div className="origin-text-columns">
              <p>
                First-time PC builders face a daunting challenge: components are expensive, technical jargon 
                is confusing, and physical mismatches—like a cooler that blocks tall RAM heat spreaders or 
                an underpowered power supply—lead to wasted money or broken parts.
              </p>
              <p>
                As students at <strong>Pateros Technological College</strong>, the WhiteHats team wanted to 
                solve this problem directly. We combined real-time 3D rendering with an exhaustive compatibility 
                matrix and interactive step-by-step assembly guides, giving students and enthusiasts a safe, 
                zero-risk environment to learn and experiment.
              </p>
            </div>

            <div className="origin-actions">
              <Link 
                to="/build" 
                className="origin-cta-btn primary"
                onClick={() => { try { soundManager.click(); } catch {} }}
              >
                <span>OPEN PC BUILDER</span>
                <span className="btn-arrow">&rarr;</span>
              </Link>
              <Link 
                to="/3d-builder" 
                className="origin-cta-btn secondary"
                onClick={() => { try { soundManager.click(); } catch {} }}
              >
                <span>LAUNCH 3D STUDIO</span>
              </Link>
            </div>
          </div>
        </section>

        {/* SYSTEM ARCHITECTURE MATRIX */}
        <section className="about-tech-section">
          <div className="section-head-bar">
            <div className="section-title-group">
              <span className="section-eyebrow">SYSTEM ARCHITECTURE</span>
              <h2 className="section-heading">Built With Industry Standards</h2>
            </div>
            <span className="tech-badge-sub">Full Stack Implementation</span>
          </div>

          <div className="tech-architecture-grid">
            <div className="arch-card">
              <div className="arch-header">
                <span className="arch-stage-num">01</span>
                <h3>Frontend &amp; UI</h3>
              </div>
              <p className="arch-desc">
                High-performance React single-page application built on Vite with hardware-accelerated CSS custom properties and custom cyberpunk visual themes.
              </p>
              <div className="arch-tags">
                <span>React 19</span>
                <span>Vite</span>
                <span>Motion</span>
                <span>Tailwind CSS</span>
              </div>
            </div>

            <div className="arch-card">
              <div className="arch-header">
                <span className="arch-stage-num">02</span>
                <h3>3D Simulation Engine</h3>
              </div>
              <p className="arch-desc">
                Real-time WebGL rendering via Three.js with orbit controls, custom materials, lighting rigs, and procedural geometry for PC cases, coolers, and memory modules.
              </p>
              <div className="arch-tags">
                <span>Three.js</span>
                <span>WebGL</span>
                <span>PBR Shaders</span>
                <span>Canvas API</span>
              </div>
            </div>

            <div className="arch-card">
              <div className="arch-header">
                <span className="arch-stage-num">03</span>
                <h3>Backend &amp; Database</h3>
              </div>
              <p className="arch-desc">
                Node.js and Express REST API backed by normalized MySQL relational tables for parts inventory, socket classifications, and crawler queues.
              </p>
              <div className="arch-tags">
                <span>Node.js</span>
                <span>Express</span>
                <span>MySQL / MariaDB</span>
                <span>JWT Auth</span>
              </div>
            </div>

            <div className="arch-card">
              <div className="arch-header">
                <span className="arch-stage-num">04</span>
                <h3>Sound &amp; Telemetry</h3>
              </div>
              <p className="arch-desc">
                Web Audio API procedural sound synthesizer delivering mechanical clicks, snap confirmations, and tactile auditory feedback without external audio bloat.
              </p>
              <div className="arch-tags">
                <span>Web Audio API</span>
                <span>SynthAudio</span>
                <span>SoundManager</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
