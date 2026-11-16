import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import GlobalHeader from "../Navigation/GlobalHeader";
import soundManager from "../../utilities/soundManager";
import "./AboutUs.css";

gsap.registerPlugin(ScrollTrigger);

const TEAM_MEMBERS = [
  {
    id: "DEV-01",
    roleCategory: "core",
    name: "Developer 01",
    designation: "Lead Systems Architect & Full-Stack Engineer",
    codename: "SYSTEM_CORE",
    avatarBadge: "ARCH",
    photoUrl: "/uploads/profiles/photo-1794214083340-kb6u7l.jpg",
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
    photoUrl: "/uploads/profiles/photo-1794176073655-f3qzal.gif",
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
    photoUrl: "/uploads/profiles/photo-1794176080611-d0vfrg.gif",
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
    photoUrl: "/uploads/profiles/photo-1794176086486-hn7tru.jpg",
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
    photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400",
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

const WHITEHATS_PROJECTS = [
  {
    id: "WH-SYS-01",
    title: "BuildLab 3D Architecture & Clearance Studio",
    codename: "BUILDLAB_3D",
    category: "labs",
    statusBadge: "FLAGSHIP // PRODUCTION",
    statusColor: "#d4a34b",
    year: "2026",
    targetClient: "College of ICT & Senior High CSS Strands",
    summary: "Next-gen 3D virtual PC assembly workbench with automated socket clearance validation, real-time thermal TDP auditing, and zero-risk educational hardware lab.",
    problemSolved: "Eliminates permanent motherboard pin bending, RAM clearance bottlenecks, and costly mismatched hardware purchases for students before spending money.",
    keyCapabilities: [
      "7-Stage Interactive 3D Assembly Viewport (Three.js WebGL)",
      "Automated LGA1700 & AM5 Socket Keying & Pinout Verification",
      "Real-time TDP Power Budget & Modular PSU Headroom Calculator",
      "B.O.B. Companion Automated First-Boot Triage Engine"
    ],
    techStack: ["React 19", "Three.js", "WebGL", "Node.js", "MySQL", "Web Audio API"],
    impactMetric: "100% Conflict-Free Validation",
    isInternal: true,
    actionLink: "/build"
  },
  {
    id: "WH-SYS-02",
    title: "CampusPulse Student Information System",
    codename: "CAMPUS_PULSE",
    category: "academic",
    statusBadge: "ACADEMIC SIS // ACTIVE",
    statusColor: "#10b981",
    year: "2025",
    targetClient: "Pateros Technological College Registrar & Academic Affairs",
    summary: "Enterprise-grade academic registrar suite automating enrollment validation, prerequisite tree verification, deficiency flags, and real-time student evaluation.",
    problemSolved: "Replaces manual enrollment checking that previously caused 4-hour queues with instant prerequisite graph evaluation.",
    keyCapabilities: [
      "Automated Pre-requisite & Co-requisite Graph Evaluation",
      "Real-Time Class Section Load Balancing & Capacity Locks",
      "Deficiency Flags & Dean's Honor Roll Eligibility Scoring",
      "Official Transcript & Grade Slip PDF Generation Engine"
    ],
    techStack: ["React", "Express.js", "MySQL", "Tailwind CSS", "JWT"],
    impactMetric: "94% Drop in Registration Bottlenecks"
  },
  {
    id: "WH-SYS-03",
    title: "PTC ScholarNet Aid & Grant Triage",
    codename: "SCHOLAR_NET",
    category: "workflow",
    statusBadge: "STUDENT AID // DEPLOYED",
    statusColor: "#38bdf8",
    year: "2025",
    targetClient: "Municipal Scholarship Office & Student Affairs",
    summary: "Automated student grant portal managing documentary compliance, GWA threshold sorting, and batch payout dispatch for municipal scholars.",
    problemSolved: "Overcomes manual document physical drop-offs by providing secure digital submission with OCR qualification verification.",
    keyCapabilities: [
      "Digital Documentary Triage (Grade Sheets & Indigency Files)",
      "Automated GWA & Income Bracket Verification Engine",
      "SMS Batch Notification for Approved Grant Dispatches",
      "Audit-Ready Reporting for Local Government Audits"
    ],
    techStack: ["React", "Node.js", "Express", "OCR Document Parser", "MySQL"],
    impactMetric: "100% Paperless Application Intake"
  },
  {
    id: "WH-SYS-04",
    title: "KioskPass RFID & Dynamic QR Terminal",
    codename: "KIOSK_PASS",
    category: "labs",
    statusBadge: "IOT HARDWARE // PRODUCTION",
    statusColor: "#f43f5e",
    year: "2025",
    targetClient: "Campus Security Gates & Laboratory Entry Stations",
    summary: "Offline-first embedded campus entry kiosk featuring contactless RFID cards, encrypted dynamic QR passes, and real-time parent SMS notifications.",
    problemSolved: "Replaces logbooks at security gates with a 0.3-second tap-and-go kiosk that operates reliably even during campus network outages.",
    keyCapabilities: [
      "0.3-Second Contactless RFID & QR Hardware Reader Handshake",
      "Offline-First Local Cache with Automated Cloud Re-sync",
      "Automated Parent/Guardian SMS Dispatch on Campus Entry/Exit",
      "Laboratory Session Attendance Audit Trails"
    ],
    techStack: ["Web Serial API", "React", "SQLite", "MySQL", "Twilio SMS"],
    impactMetric: "0.3s Tap-to-Log Speed"
  },
  {
    id: "WH-SYS-05",
    title: "LabGuard Workstation & Asset Lifecycle Engine",
    codename: "LAB_GUARD",
    category: "labs",
    statusBadge: "HARDWARE OPS // ACTIVE",
    statusColor: "#10b981",
    year: "2025",
    targetClient: "PTC Computer Laboratory Custodians & College IT",
    summary: "Workstation component health and hardware asset tracker preventing unauthorized part swaps, tracking thermal duty cycles, and logging maintenance.",
    problemSolved: "Stops untracked hardware swap-outs and equipment downtime across 8 campus computer laboratories.",
    keyCapabilities: [
      "Real-Time Component Silkscreen & Serial Code Registration",
      "Automated Hardware Drift & Unauthorized Swap Detection",
      "Preventive Maintenance Scheduling & Service Ticket Logs",
      "Depreciation & Equipment Write-Off Financial Ledger"
    ],
    techStack: ["React", "Node.js", "WebSockets", "Barcode Engine", "MySQL"],
    impactMetric: "500+ Campus Rigs Monitored"
  },
  {
    id: "WH-SYS-06",
    title: "CurricuSync CHED/DepEd Syllabus Matrix",
    codename: "CURRICU_SYNC",
    category: "academic",
    statusBadge: "ACCREDITATION // PILOT",
    statusColor: "#a855f7",
    year: "2024",
    targetClient: "College Deans, Department Heads & Curriculum Boards",
    summary: "Accreditation analytics platform mapping syllabus competencies, course learning outcomes, and laboratory contact hours against CHED Memorandum Orders.",
    problemSolved: "Cuts weeks of manual curriculum audit paperwork into automated dependency graphs for institutional accreditation.",
    keyCapabilities: [
      "CHED CMO & DepEd Competency Alignment Verification",
      "Course Learning Outcome (CLO) & Program Outcome Mapping",
      "Cross-Disciplinary Laboratory Contact Hour Balancer",
      "Accreditation Evidence File Exporter (AACCUP Format)"
    ],
    techStack: ["React", "Graph Data Modeling", "Python Analytics", "Vite"],
    impactMetric: "Weeks of Audit Prep Cut to Hours"
  },
  {
    id: "WH-SYS-07",
    title: "FacultyDesk Low-Bandwidth LMS & Exam Proctor",
    codename: "FACULTY_DESK",
    category: "academic",
    statusBadge: "E-LEARNING // DEPLOYED",
    statusColor: "#38bdf8",
    year: "2024",
    targetClient: "Academic Faculty & Distance Education Students",
    summary: "Bandwidth-optimized learning and assessment environment engineered for provincial internet constraints, featuring offline exam caches and auto-grading.",
    problemSolved: "Prevents students from losing exam answers during intermittent campus WiFi disconnections with local encrypted service worker caches.",
    keyCapabilities: [
      "Ultra-Low Bandwidth Data Mode (Under 50kb per lesson module)",
      "Offline Encrypted Exam Session Cache with Reconnect Flush",
      "Automated Rubric Evaluation for Objective & Code Questions",
      "Tamper-Resistant Fullscreen Lockdown & Tab Blur Detection"
    ],
    techStack: ["React", "Service Workers", "WebRTC", "Express", "MySQL"],
    impactMetric: "Zero Exam Disconnection Losses"
  },
  {
    id: "WH-SYS-08",
    title: "ClearanceFlow Digital Multi-Office Clearance",
    codename: "CLEARANCE_FLOW",
    category: "workflow",
    statusBadge: "WORKFLOW // DEPLOYED",
    statusColor: "#10b981",
    year: "2024",
    targetClient: "Graduating Batches, Library, Cashier & Clinic",
    summary: "Paperless graduation and semester clearance portal replacing physical multi-stop paper index cards with concurrent digital clearance approvals.",
    problemSolved: "Eliminates multi-day physical lines under the sun across 12 campus departments for graduating students.",
    keyCapabilities: [
      "Concurrent Multi-Department Clearance Routing & Signatures",
      "Instant Library Book Return & Cashier Account Deficiency Flags",
      "Cryptographically Signed Clearance Verification Certificates",
      "Dean's Executive Audit Dashboard & Bulk Approval Tools"
    ],
    techStack: ["React", "Express", "MySQL", "Digital Signature API", "PDFKit"],
    impactMetric: "100% Elimination of Physical Lines"
  },
  {
    id: "WH-SYS-09",
    title: "CampusQueue Registrar & Cashier Virtual Triage",
    codename: "CAMPUS_QUEUE",
    category: "workflow",
    statusBadge: "SMART TRIAGE // ACTIVE",
    statusColor: "#eab308",
    year: "2023",
    targetClient: "Cashier, Registrar & Student Guidance Services",
    summary: "Smart virtual queue management system with dynamic SMS paging, TV screen casting, and synthetic audio queue announcements.",
    problemSolved: "Reduces campus lobby crowding by allowing students to wait anywhere on campus while receiving real-time queue position SMS.",
    keyCapabilities: [
      "Digital Token Dispenser via Dynamic QR or Touchscreen Kiosk",
      "Real-Time Display Cast for Lobby TVs with Audio Synthesizer",
      "SMS Alert When Student is 3 Numbers Away from Counter",
      "Counter Productivity & Average Service Time Telemetry"
    ],
    techStack: ["Web Audio Synth", "Socket.io", "React", "Screen Cast API"],
    impactMetric: "65% Reduction in Lobby Congestion"
  },
  {
    id: "WH-SYS-10",
    title: "AlumniConnect Graduate Tracer & Career Matrix",
    codename: "ALUMNI_CONNECT",
    category: "workflow",
    statusBadge: "ALUMNI HUB // ACTIVE",
    statusColor: "#38bdf8",
    year: "2023",
    targetClient: "Alumni Affairs, Guidance & CHED Accreditation",
    summary: "Longitudinal graduate career tracker mapping employment timelines, salary bands, licensure pass rates, and industry relevance.",
    problemSolved: "Automates institutional alumni tracking required for college accreditation and program retention certifications.",
    keyCapabilities: [
      "Longitudinal Career Path & Industry Relevance Surveys",
      "Automated CHED Annual Graduate Compliance Exports",
      "Alumni Job Board & Campus Mentorship Request Routing",
      "Accreditation Metric Visualizer with Interactive Histograms"
    ],
    techStack: ["React", "Chart.js", "Express", "MySQL", "Export Engine"],
    impactMetric: "Annual Compliance Audit Automation"
  }
];

export default function AboutUs() {
  const [filter, setFilter] = useState("all");
  const [selectedMember, setSelectedMember] = useState(null);
  const [teamMembers, setTeamMembers] = useState(TEAM_MEMBERS);
  const aboutPageRef = useRef(null);

  // WhiteHats Built Projects Showcase states
  const [projectFilter, setProjectFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/content/team")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch team content");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((m) => ({
            ...m,
            roleCategory: m.role_category || m.roleCategory || "core",
            avatarBadge: m.avatar_badge || m.avatarBadge || "DEV",
            photoUrl: m.photo_url || m.photoUrl || null,
            keyContributions: Array.isArray(m.key_contributions)
              ? m.key_contributions
              : (typeof m.key_contributions === "string" ? (() => { try { return JSON.parse(m.key_contributions); } catch { return [m.key_contributions]; } })() : (Array.isArray(m.keyContributions) ? m.keyContributions : [])),
            techStack: Array.isArray(m.tech_stack)
              ? m.tech_stack
              : (typeof m.tech_stack === "string" ? (() => { try { return JSON.parse(m.tech_stack); } catch { return m.tech_stack.split(",").map(s => s.trim()); } })() : (Array.isArray(m.techStack) ? m.techStack : [])),
            rigSpecs: typeof m.rig_specs === "object" && m.rig_specs !== null
              ? m.rig_specs
              : (typeof m.rig_specs === "string" ? (() => { try { return JSON.parse(m.rig_specs); } catch { return {}; } })() : (typeof m.rigSpecs === "object" && m.rigSpecs !== null ? m.rigSpecs : {})),
            favTip: m.fav_tip || m.favTip || ""
          }));
          setTeamMembers(mapped);
        }
      })
      .catch((err) => {
        console.warn("Using fallback team data:", err);
      });
  }, []);

  // Keyboard accessibility: Escape key to dismiss active modals (R-32)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (selectedProject) setSelectedProject(null);
        if (selectedMember) setSelectedMember(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedProject, selectedMember]);

  // GSAP ScrollTrigger bidirectional cinematic reveals (Down & Up scroll)
  useEffect(() => {
    if (!aboutPageRef.current) return;

    const ctx = gsap.context(() => {
      // 1. Hero Intel Section
      ScrollTrigger.create({
        trigger: ".about-hero-section",
        start: "top 85%",
        end: "bottom 15%",
        onEnter: () =>
          gsap.fromTo(
            ".about-hero-section",
            { opacity: 0, y: 35, scale: 0.98 },
            { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out", overwrite: "auto" }
          ),
        onLeave: () =>
          gsap.to(".about-hero-section", {
            opacity: 0,
            y: -25,
            duration: 0.35,
            ease: "power2.in",
            overwrite: "auto",
          }),
        onEnterBack: () =>
          gsap.fromTo(
            ".about-hero-section",
            { opacity: 0, y: -25, scale: 0.98 },
            { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out", overwrite: "auto" }
          ),
        onLeaveBack: () =>
          gsap.to(".about-hero-section", {
            opacity: 0,
            y: 25,
            duration: 0.35,
            ease: "power2.in",
            overwrite: "auto",
          }),
      });

      // 2. Team Members Cards Batch (Bidirectional KKXZOyZ pattern)
      ScrollTrigger.batch(".about-member-card", {
        interval: 0.08,
        batchMax: 3,
        start: "top 88%",
        end: "bottom 12%",
        onEnter: (batch) =>
          gsap.fromTo(
            batch,
            { opacity: 0, y: 40, scale: 0.95 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              stagger: 0.08,
              duration: 0.65,
              ease: "power3.out",
              overwrite: "auto",
            }
          ),
        onLeave: (batch) =>
          gsap.to(batch, {
            opacity: 0,
            y: -35,
            scale: 0.95,
            stagger: 0.04,
            duration: 0.35,
            ease: "power2.in",
            overwrite: "auto",
          }),
        onEnterBack: (batch) =>
          gsap.fromTo(
            batch,
            { opacity: 0, y: -35, scale: 0.95 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              stagger: 0.08,
              duration: 0.65,
              ease: "power3.out",
              overwrite: "auto",
            }
          ),
        onLeaveBack: (batch) =>
          gsap.to(batch, {
            opacity: 0,
            y: 40,
            scale: 0.95,
            stagger: 0.04,
            duration: 0.35,
            ease: "power2.in",
            overwrite: "auto",
          }),
      });

      // 3. Showcase Flagship & Project Cards Batch (Bidirectional)
      ScrollTrigger.batch(".showcase-flagship-card, .project-card", {
        interval: 0.08,
        batchMax: 3,
        start: "top 88%",
        end: "bottom 12%",
        onEnter: (batch) =>
          gsap.fromTo(
            batch,
            { opacity: 0, y: 40, scale: 0.96 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              stagger: 0.09,
              duration: 0.7,
              ease: "power3.out",
              overwrite: "auto",
            }
          ),
        onLeave: (batch) =>
          gsap.to(batch, {
            opacity: 0,
            y: -30,
            scale: 0.96,
            stagger: 0.04,
            duration: 0.35,
            ease: "power2.in",
            overwrite: "auto",
          }),
        onEnterBack: (batch) =>
          gsap.fromTo(
            batch,
            { opacity: 0, y: -30, scale: 0.96 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              stagger: 0.09,
              duration: 0.7,
              ease: "power3.out",
              overwrite: "auto",
            }
          ),
        onLeaveBack: (batch) =>
          gsap.to(batch, {
            opacity: 0,
            y: 35,
            scale: 0.96,
            stagger: 0.04,
            duration: 0.35,
            ease: "power2.in",
            overwrite: "auto",
          }),
      });

      // 4. Origin & Tech Stack Sections (Bidirectional)
      ScrollTrigger.batch(".origin-card, .tech-category-card", {
        interval: 0.08,
        batchMax: 3,
        start: "top 88%",
        end: "bottom 12%",
        onEnter: (batch) =>
          gsap.fromTo(
            batch,
            { opacity: 0, y: 35 },
            { opacity: 1, y: 0, stagger: 0.08, duration: 0.65, ease: "power3.out", overwrite: "auto" }
          ),
        onLeave: (batch) =>
          gsap.to(batch, { opacity: 0, y: -25, stagger: 0.04, duration: 0.35, ease: "power2.in", overwrite: "auto" }),
        onEnterBack: (batch) =>
          gsap.fromTo(
            batch,
            { opacity: 0, y: -25 },
            { opacity: 1, y: 0, stagger: 0.08, duration: 0.65, ease: "power3.out", overwrite: "auto" }
          ),
        onLeaveBack: (batch) =>
          gsap.to(batch, { opacity: 0, y: 30, stagger: 0.04, duration: 0.35, ease: "power2.in", overwrite: "auto" }),
      });
    }, aboutPageRef);

    return () => ctx.revert();
  }, [teamMembers, projectFilter, filter]);

  const filteredMembers = filter === "all" 
    ? teamMembers 
    : teamMembers.filter((m) => m.roleCategory === filter);

  const filteredProjects = projectFilter === "all"
    ? WHITEHATS_PROJECTS
    : WHITEHATS_PROJECTS.filter((p) => p.category === projectFilter);

  const flagshipProject = WHITEHATS_PROJECTS.find((p) => p.id === "WH-SYS-01");
  const showFlagship = (projectFilter === "all" || projectFilter === "labs") && flagshipProject;
  const matrixProjects = showFlagship 
    ? filteredProjects.filter((p) => p.id !== "WH-SYS-01") 
    : filteredProjects;

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

  const handleProjectFilterClick = (cat) => {
    try { soundManager.snap(); } catch {}
    setProjectFilter(cat);
  };

  const handleOpenBlueprint = (project) => {
    try { soundManager.snap(); } catch {}
    setSelectedProject(project);
  };

  const handleCloseBlueprint = () => {
    try { soundManager.click(); } catch {}
    setSelectedProject(null);
  };

  // Luxury mouse-tracking spotlight for metallic chassis
  const handleCardMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  };

  const handleCardHover = () => {
    try { soundManager.interact(); } catch {}
  };

  return (
    <div className="about-us-page" ref={aboutPageRef}>
      <GlobalHeader />

      <div className="about-ambient-glow" aria-hidden="true" />
      <div className="about-grid-overlay" aria-hidden="true" />

      <div className="about-container">
        {/* HERO INTEL SECTION */}
        <section className="about-hero-section">
          <div className="about-telemetry-badge">
            <span className="telemetry-live-dot" />
            <span className="telemetry-label">PATEROS TECHNOLOGICAL COLLEGE // WHITEHATS COLLECTIVE</span>
            <span className="telemetry-bracket">[ DEPLOYED ]</span>
          </div>

          <h1 className="about-hero-title">
            THE ARCHITECTS BEHIND <span className="title-accent">BUILDLAB</span>
          </h1>

          <p className="about-hero-description">
            BuildLab was conceived and engineered by five student developers and researchers known as the 
            <strong> WhiteHats</strong> at Pateros Technological College. Our mission is to eliminate 
            PC assembly intimidation through real-time 3D simulation while building reliable, modern software 
            solutions that solve real-world operational bottlenecks for academic institutions.
          </p>

          <div className="about-stats-ribbon">
            <div className="stat-card">
              <span className="stat-num">05</span>
              <span className="stat-label">ENGINEERS</span>
              <span className="stat-sub">WhiteHats Team</span>
            </div>
            <div className="stat-divider">/</div>
            <div className="stat-card">
              <span className="stat-num">10+</span>
              <span className="stat-label">SYSTEMS BUILT</span>
              <span className="stat-sub">School &amp; Community</span>
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
                ALL ({teamMembers.length})
              </button>
              <button 
                type="button" 
                className={`filter-btn ${filter === "core" ? "active" : ""}`}
                onClick={() => handleFilterClick("core")}
              >
                CORE &amp; 3D ({teamMembers.filter((m) => m.roleCategory === "core").length})
              </button>
              <button 
                type="button" 
                className={`filter-btn ${filter === "frontend" ? "active" : ""}`}
                onClick={() => handleFilterClick("frontend")}
              >
                FRONTEND &amp; UX ({teamMembers.filter((m) => m.roleCategory === "frontend").length})
              </button>
              <button 
                type="button" 
                className={`filter-btn ${filter === "backend" ? "active" : ""}`}
                onClick={() => handleFilterClick("backend")}
              >
                BACKEND &amp; QA ({teamMembers.filter((m) => m.roleCategory === "backend").length})
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
                    {(member.photoUrl || member.photo_url) ? (
                      <img
                        src={member.photoUrl || member.photo_url}
                        alt={member.name}
                        className="avatar-img-hex"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const parent = e.currentTarget.parentElement;
                          const fallback = parent?.querySelector(".avatar-icon-content");
                          if (fallback) fallback.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className="avatar-icon-content"
                      style={{ display: (member.photoUrl || member.photo_url) ? "none" : "flex" }}
                    >
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
                <div className="dossier-avatar-hex-wrap">
                  <div className="avatar-hex-frame hex-dossier">
                    <svg viewBox="0 0 100 100" className="avatar-hex-svg">
                      <polygon points="50 3, 93 26, 93 74, 50 97, 7 74, 7 26" className="hex-outer" />
                      <polygon points="50 10, 85 29, 85 71, 50 90, 15 71, 15 29" className="hex-inner" />
                    </svg>
                    {(selectedMember.photoUrl || selectedMember.photo_url) ? (
                      <img
                        src={selectedMember.photoUrl || selectedMember.photo_url}
                        alt={selectedMember.name}
                        className="avatar-img-hex"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const parent = e.currentTarget.parentElement;
                          const fallback = parent?.querySelector(".avatar-icon-content");
                          if (fallback) fallback.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className="avatar-icon-content"
                      style={{ display: (selectedMember.photoUrl || selectedMember.photo_url) ? "none" : "flex" }}
                    >
                      <span className="avatar-code">{selectedMember.codename.slice(0, 3)}</span>
                    </div>
                  </div>
                </div>

                <div className="dossier-title-group">
                  <span className="dossier-kicker">ENGINEERING DOSSIER // {selectedMember.id} &bull; {selectedMember.avatarBadge}</span>
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
                      Pateros Technological College : WhiteHats Capstone Group
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

        {/* ── WHITEHATS DEVELOPER CONSORTIUM & RESEARCH ATELIER ── */}
        <section className="whitehats-showcase-section scroll-reveal-target">
          {/* Company Identity Header Banner */}
          <div 
            className="whitehats-banner-card"
            onMouseMove={handleCardMouseMove}
          >
            <div className="whitehats-banner-ambient-glow" aria-hidden="true" />
            
            <div className="whitehats-badge-row">
              <span className="whitehats-tag-pill">WHITEHATS DEVELOPER CONSORTIUM</span>
              <span className="whitehats-subtag">PATEROS TECHNOLOGICAL COLLEGE &bull; RESEARCH ATELIER</span>
              <span className="whitehats-status-live">
                <span className="status-live-beacon" />
                ACTIVE DEPLOYMENT
              </span>
            </div>

            <div className="whitehats-banner-content">
              <div className="whitehats-title-group">
                <h2 className="whitehats-main-title">
                  PRECISION DIGITAL INFRASTRUCTURE FOR <span className="whitehats-gold">ACADEMIC INSTITUTIONS</span>
                </h2>
                <p className="whitehats-summary-p">
                  <strong>WhiteHats</strong> is a multidisciplinary consortium of five student developers and researchers from 
                  Pateros Technological College. We engineer production-ready software architectures, 3D simulation platforms, 
                  and automated campus workflows. Our core focus is eliminating manual paper bottlenecks, hardware assembly intimidation, 
                  and fragmented administrative procedures across collegiate departments and technical laboratories.
                </p>
              </div>

              {/* Three Engineered Pillars with Custom Technical Vectors */}
              <div className="whitehats-manifesto-grid">
                <div className="manifesto-card" onMouseEnter={handleCardHover}>
                  <div className="manifesto-icon-box">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d4a34b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 21h18M5 21V7l7-4 7 4v14M9 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4M9 18v-4h6v4M15 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4" />
                    </svg>
                  </div>
                  <h4>Targeted Campus Systems</h4>
                  <p>Tailored workflows engineered specifically for college registrars, computer laboratories, student bodies, and scholarship desks.</p>
                </div>

                <div className="manifesto-card" onMouseEnter={handleCardHover}>
                  <div className="manifesto-icon-box">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d4a34b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                  </div>
                  <h4>Zero-Friction Pipelines</h4>
                  <p>Eliminating multi-day queue lines, physical paper index cards, and manual prerequisite checks with instant digital engines.</p>
                </div>

                <div className="manifesto-card" onMouseEnter={handleCardHover}>
                  <div className="manifesto-icon-box">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d4a34b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <path d="M9 12l2 2 4-4" />
                    </svg>
                  </div>
                  <h4>Research-Grade Rigor</h4>
                  <p>Every system is benchmarked against CHED and DepEd regulatory frameworks and ISO/IEC 25010 software quality metrics.</p>
                </div>
              </div>
            </div>
          </div>

          {/* 10 Built Projects Header & Filter Bar */}
          <div className="projects-showcase-header scroll-reveal-target">
            <div className="projects-header-left">
              <span className="projects-eyebrow">COMMUNITY &amp; INSTITUTIONAL PORTFOLIO</span>
              <h2 className="projects-heading">10 Built Systems &amp; Software Workflows</h2>
              <p className="projects-subhead">
                Explore the applications, simulation engines, and IoT kiosks engineered by the WhiteHats collective for our school and community partners.
              </p>
            </div>

            <div className="projects-filter-bar">
              <button
                type="button"
                className={`proj-filter-btn ${projectFilter === "all" ? "active" : ""}`}
                onClick={() => handleProjectFilterClick("all")}
              >
                ALL SYSTEMS ({WHITEHATS_PROJECTS.length})
              </button>
              <button
                type="button"
                className={`proj-filter-btn ${projectFilter === "academic" ? "active" : ""}`}
                onClick={() => handleProjectFilterClick("academic")}
              >
                ACADEMIC &amp; SIS ({WHITEHATS_PROJECTS.filter(p => p.category === "academic").length})
              </button>
              <button
                type="button"
                className={`proj-filter-btn ${projectFilter === "labs" ? "active" : ""}`}
                onClick={() => handleProjectFilterClick("labs")}
              >
                LABS &amp; IOT ({WHITEHATS_PROJECTS.filter(p => p.category === "labs").length})
              </button>
              <button
                type="button"
                className={`proj-filter-btn ${projectFilter === "workflow" ? "active" : ""}`}
                onClick={() => handleProjectFilterClick("workflow")}
              >
                WORKFLOW &amp; TRIAGE ({WHITEHATS_PROJECTS.filter(p => p.category === "workflow").length})
              </button>
            </div>
          </div>

          {/* FLAGSHIP ATELIER COMMAND CONSOLE (WH-SYS-01 BUILDLAB) */}
          {showFlagship && (
            <div 
              className="flagship-atelier-card scroll-reveal-target"
              onMouseMove={handleCardMouseMove}
              onMouseEnter={handleCardHover}
            >
              <div className="flagship-chassis-top">
                <div className="flagship-id-cluster">
                  <span className="flagship-hex-tag">{flagshipProject.id}</span>
                  <span className="flagship-badge-pill">{flagshipProject.statusBadge}</span>
                </div>
                <div className="flagship-clock-telemetry">
                  <span className="telemetry-live-dot" />
                  <span className="telemetry-text">60 FPS // RUNTIME SYNC</span>
                </div>
              </div>

              <div className="flagship-atelier-grid">
                <div className="flagship-meta-column">
                  <span className="flagship-subtitle">LABORATORY FLAGSHIP PLATFORM</span>
                  <h3 className="flagship-title">{flagshipProject.title}</h3>
                  
                  <div className="flagship-client-row">
                    <span className="client-tag-label">DEPLOYED TARGET:</span>
                    <span className="client-tag-val">{flagshipProject.targetClient}</span>
                  </div>

                  <p className="flagship-summary">{flagshipProject.summary}</p>

                  <div className="flagship-problem-box">
                    <span className="problem-label">INSTITUTIONAL BOTTLENECK RESOLVED:</span>
                    <p className="problem-text">{flagshipProject.problemSolved}</p>
                  </div>

                  <div className="flagship-impact-row">
                    <span className="impact-kicker">PROVEN VALIDATION IMPACT:</span>
                    <span className="impact-hero-metric">{flagshipProject.impactMetric}</span>
                  </div>

                  <div className="flagship-action-deck">
                    <Link
                      to={flagshipProject.actionLink || "/build"}
                      className="flagship-btn primary"
                      onClick={() => { try { soundManager.click(); } catch {} }}
                    >
                      <span>LAUNCH 3D PC BUILDER</span>
                      <span className="btn-arrow">&rarr;</span>
                    </Link>
                    <button
                      type="button"
                      className="flagship-btn secondary"
                      onClick={() => handleOpenBlueprint(flagshipProject)}
                    >
                      <span>INSPECT BLUEPRINT</span>
                    </button>
                  </div>
                </div>

                <div className="flagship-schematic-column" aria-hidden="true">
                  <div className="schematic-viewport-frame">
                    <div className="schematic-laser-scanner" />
                    <div className="schematic-header-bar">
                      <span className="schematic-title">THREE.JS HARDWARE CAD MATRIX</span>
                      <span className="schematic-ver">LGA1700 / AM5</span>
                    </div>

                    <div className="schematic-hud-body">
                      <div className="schematic-radar-circle">
                        <div className="radar-sweep" />
                        <div className="radar-crosshair" />
                        <div className="radar-center-dot" />
                      </div>

                      <div className="schematic-telemetry-stack">
                        <div className="telemetry-hud-item">
                          <span className="hud-label">CLEARANCE LOGIC:</span>
                          <span className="hud-val success">100% 0-PIN CONFLICT</span>
                        </div>
                        <div className="telemetry-hud-item">
                          <span className="hud-label">RAM HEIGHT PROFILE:</span>
                          <span className="hud-val">44.00mm TOLERANCE</span>
                        </div>
                        <div className="telemetry-hud-item">
                          <span className="hud-label">TDP HEADROOM (850W):</span>
                          <span className="hud-val highlight">42% PEAK RESERVE</span>
                        </div>
                        <div className="telemetry-hud-item">
                          <span className="hud-label">DIAGNOSTIC AGENT:</span>
                          <span className="hud-val">B.O.B. ACTIVE TRIAGE</span>
                        </div>
                      </div>
                    </div>

                    <div className="schematic-footer-bar">
                      <span>CHASSIS: ANODIZED ALUMINUM</span>
                      <span>STATUS: ONLINE</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MACHINED HARDWARE MATRIX (REMAINING 9 SYSTEMS) */}
          <div className="projects-cards-grid">
            {matrixProjects.map((project, idx) => (
              <div 
                key={project.id}
                className="project-showcase-card scroll-reveal-target"
                onClick={() => handleOpenBlueprint(project)}
                onMouseMove={handleCardMouseMove}
                onMouseEnter={handleCardHover}
                style={{ "--stagger-index": idx }}
              >
                <div className="card-machined-crosshair top-left" aria-hidden="true">+</div>
                <div className="card-machined-crosshair top-right" aria-hidden="true">+</div>

                <div className="project-card-top">
                  <div className="project-id-wrap">
                    <span className="project-id-badge">{project.id}</span>
                    <span className="project-year-badge">{project.year}</span>
                  </div>
                  <span 
                    className="project-status-pill"
                    style={{ borderColor: project.statusColor, color: project.statusColor }}
                  >
                    <span className="status-beacon-dot" style={{ backgroundColor: project.statusColor }} />
                    {project.statusBadge}
                  </span>
                </div>

                <div className="project-card-body">
                  <h3 className="project-title">{project.title}</h3>
                  <div className="project-target-client">
                    <span className="target-label">DEPLOYED TARGET:</span>
                    <span className="target-name">{project.targetClient}</span>
                  </div>
                  <p className="project-summary-text">{project.summary}</p>
                </div>

                <div className="project-impact-box">
                  <span className="impact-label">PROVEN WORKFLOW IMPACT:</span>
                  <span className="impact-value">{project.impactMetric}</span>
                </div>

                <div className="project-card-footer">
                  <div className="project-tech-badges">
                    {project.techStack.slice(0, 3).map((tech, i) => (
                      <span key={i} className="proj-tech-pill">{tech}</span>
                    ))}
                    {project.techStack.length > 3 && (
                      <span className="proj-tech-pill more">+{project.techStack.length - 3}</span>
                    )}
                  </div>
                  <button 
                    type="button" 
                    className="btn-inspect-blueprint"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenBlueprint(project);
                    }}
                    aria-label={`Inspect blueprint for ${project.title}`}
                  >
                    <span>INSPECT BLUEPRINT</span>
                    <span className="inspect-arrow">&rarr;</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── PROJECT BLUEPRINT & ARCHITECTURE MODAL ── */}
        {selectedProject && (
          <div 
            className="blueprint-modal-backdrop" 
            onClick={handleCloseBlueprint}
            role="dialog"
            aria-modal="true"
            aria-labelledby="blueprint-modal-title"
          >
            <div 
              className="blueprint-modal-window wood-mahogany" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="blueprint-modal-header">
                <div className="blueprint-header-meta">
                  <div className="blueprint-tag-row">
                    <span className="blueprint-id-pill">{selectedProject.id}</span>
                    <span className="blueprint-codename">{selectedProject.codename}</span>
                    <span 
                      className="blueprint-status-tag"
                      style={{ color: selectedProject.statusColor, borderColor: selectedProject.statusColor }}
                    >
                      {selectedProject.statusBadge}
                    </span>
                  </div>
                  <h2 className="blueprint-title" id="blueprint-modal-title">{selectedProject.title}</h2>
                  <div className="blueprint-client-line">
                    <strong>Primary Target Client:</strong> {selectedProject.targetClient}
                  </div>
                </div>

                <button 
                  type="button" 
                  className="blueprint-close-btn"
                  onClick={handleCloseBlueprint}
                  aria-label="Close Blueprint Modal"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div className="blueprint-modal-body">
                {/* Description & Problem Solved */}
                <div className="blueprint-section-group">
                  <h4 className="blueprint-subhead">SYSTEM OVERVIEW &amp; WORKFLOW CONTEXT</h4>
                  <p className="blueprint-desc-p">{selectedProject.summary}</p>
                </div>

                <div className="blueprint-problem-card">
                  <div className="problem-card-eyebrow">
                    <span className="problem-bullet">⚠</span>
                    <span>INSTITUTIONAL BOTTLENECK RESOLVED</span>
                  </div>
                  <p className="problem-card-desc">{selectedProject.problemSolved}</p>
                </div>

                {/* Key Capabilities */}
                <div className="blueprint-section-group">
                  <h4 className="blueprint-subhead">CORE ARCHITECTURAL CAPABILITIES</h4>
                  <ul className="blueprint-capabilities-list">
                    {selectedProject.keyCapabilities.map((cap, i) => (
                      <li key={i}>
                        <span className="cap-check">✓</span>
                        <span>{cap}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Metrics & Tech Stack */}
                <div className="blueprint-bottom-grid">
                  <div className="blueprint-metric-box">
                    <span className="metric-box-title">PROVEN WORKFLOW IMPACT</span>
                    <span className="metric-box-val">{selectedProject.impactMetric}</span>
                  </div>

                  <div className="blueprint-tech-box">
                    <span className="tech-box-title">SYSTEM IMPLEMENTATION STACK</span>
                    <div className="blueprint-tech-pills">
                      {selectedProject.techStack.map((tech, i) => (
                        <span key={i} className="blueprint-pill">{tech}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="blueprint-modal-footer">
                <span className="blueprint-footer-note">
                  ORIGIN: WHITEHATS CONSORTIUM &bull; PATEROS TECHNOLOGICAL COLLEGE &bull; EST. {selectedProject.year}
                </span>

                <div className="blueprint-footer-actions">
                  {selectedProject.actionLink && (
                    <Link
                      to={selectedProject.actionLink}
                      className="blueprint-action-btn primary"
                      onClick={() => {
                        try { soundManager.click(); } catch {}
                        handleCloseBlueprint();
                      }}
                    >
                      <span>LAUNCH LIVE PLATFORM</span>
                      <span className="btn-arrow">&rarr;</span>
                    </Link>
                  )}
                  <button 
                    type="button" 
                    className="blueprint-action-btn secondary"
                    onClick={handleCloseBlueprint}
                  >
                    CLOSE BLUEPRINT
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PROJECT ORIGIN & MISSION SECTION */}
        <section className="about-origin-section scroll-reveal-target">
          <div className="origin-card">
            <div className="origin-eyebrow">
              <span className="origin-dot" />
              <span>THE WHITEHATS MISSION</span>
            </div>
            <h2 className="origin-title">Why We Built BuildLab</h2>
            <div className="origin-text-columns">
              <p>
                First-time PC builders face a daunting challenge: components are expensive, technical jargon 
                is confusing, and physical mismatches (such as a cooler blocking tall RAM heat spreaders or 
                an underpowered power supply) lead to wasted money or damaged parts.
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
