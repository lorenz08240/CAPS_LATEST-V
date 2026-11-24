import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import GlobalHeader from "../Navigation/GlobalHeader";
import soundManager from "../../utilities/soundManager";
import RevealHeading from "../Common/RevealHeading";
import "./AboutUs.css";

gsap.registerPlugin(ScrollTrigger);

const TEAM_MEMBERS = [
  {
    id: "DEV-01",
    name: "Jay Mark Piano",
    designation: "Full-Stack Developer & Project Lead",
    avatarBadge: "LEAD",
    photoUrl: "/assets/profiles/jay_mark_piano.jpg",
    image: "/assets/profiles/jay_mark_piano.jpg",
    highlight: "System Architecture & Core Logic",
    bio: "Leads the overall software engineering and technical direction of BuildLab. Connects the user interface with the 3D PC builder, real-time compatibility checks, and backend database systems.",
    favTip: "Never cheap out on your power supply. An efficient Tier-A PSU protects your entire PC from sudden power spikes and keeps all parts running safely."
  },
  {
    id: "DEV-02",
    name: "Jude Gollena",
    designation: "UI/UX & Frontend Developer",
    avatarBadge: "UI/UX",
    photoUrl: "/assets/profiles/jude_gollena.jpg",
    image: "/assets/profiles/jude_gollena.jpg",
    highlight: "User Interface & Visual Design",
    bio: "Designs and crafts how BuildLab looks and feels. Engineered the sleek obsidian dark theme, interactive navigation drawers, tactile audio effects, and mobile responsive layouts.",
    favTip: "Assemble your motherboard, CPU, RAM, and SSD on top of the motherboard box before putting them inside the PC case. It gives you plenty of room to work safely."
  },
  {
    id: "DEV-03",
    name: "Andrei Jose Tuazon",
    designation: "3D Graphics & Simulation Specialist",
    avatarBadge: "ANALYST",
    photoUrl: "/assets/profiles/hardware_3d_engineer.jpg",
    image: "/assets/profiles/hardware_3d_engineer.jpg",
    highlight: "Three.js Hardware Models & 3D Studio",
    bio: "Creates the 3D computer parts and animations. Built the 360-degree inspection studio where users can rotate, inspect, and connect computer hardware in full 3D view.",
    favTip: "Always remember to remove the clear plastic protective film from the bottom of your CPU cooler before applying thermal paste and installing it!"
  },
  {
    id: "DEV-04",
    name: "Shin Ariane Pol",
    designation: "Project Documentation Lead",
    avatarBadge: "DOCS",
    photoUrl: "/assets/profiles/shin_ariane_pol.jpg",
    image: "/assets/profiles/shin_ariane_pol.jpg",
    highlight: "Project Documentation & Manuals",
    bio: "Writes, organizes, and maintains all project documentation, thesis manuals, research papers, system user guides, and ISO/IEC 25010 academic compliance instruments.",
    favTip: "Always double-check your part dimensions and cable layout before screwing down the motherboard into your PC case."
  },
  {
    id: "DEV-05",
    name: "Lorenz Tejado",
    designation: "Backend Developer & Systems Architect",
    avatarBadge: "BACKEND",
    photoUrl: "/assets/profiles/lorenz_tejado.jpg",
    image: "/assets/profiles/lorenz_tejado.jpg",
    highlight: "MySQL Normalization & API Services",
    bio: "Engineered BuildLab's normalized MySQL relational database, RESTful Express backend services, crawler integration pipeline, and authentication security.",
    favTip: "Dual-channel memory goes into slots 2 and 4 (A2/B2). Check your motherboard's PCB silkscreen to ensure maximum signal trace impedance."
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
    statusColor: "#ffffff",
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
    statusColor: "#00e5a0",
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
    statusColor: "#ffffff",
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
    statusColor: "#00e5a0",
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
    statusColor: "#ffffff",
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
    statusColor: "#00e5a0",
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
  const ambientGlowRef = useRef(null);

  // WhiteHats Built Projects Showcase states
  const [projectFilter, setProjectFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState(null);

  const navigate = useNavigate();

  const fetchTeam = useCallback(() => {
    fetch("/api/content/team")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch team content");
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data) || data.length === 0) return;
        const mapped = data.map((m) => ({
          ...m,
          roleCategory: m.role_category || m.roleCategory || "core",
          avatarBadge: m.avatar_badge || m.avatarBadge || "DEV",
          photoUrl: m.photo_url || m.photoUrl || m.image || null,
          image: m.image || m.photo_url || m.photoUrl || null,
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
        // Avoid re-triggering the card reveal animation when nothing changed.
        const signature = (list) => JSON.stringify(
          list.map((item) => [item.id, item.photo_url || item.photoUrl || item.image, item.name])
        );
        setTeamMembers((prev) => (signature(prev) === signature(mapped) ? prev : mapped));
      })
      .catch((err) => {
        console.warn("Using fallback team data:", err);
      });
  }, []);

  useEffect(() => {
    fetchTeam();
    const refreshOnReturn = () => {
      if (document.visibilityState === "visible") fetchTeam();
    };
    window.addEventListener("focus", refreshOnReturn);
    document.addEventListener("visibilitychange", refreshOnReturn);
    return () => {
      window.removeEventListener("focus", refreshOnReturn);
      document.removeEventListener("visibilitychange", refreshOnReturn);
    };
  }, [fetchTeam]);


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

  // Background scroll lock mechanism: Prevents background jumping and scrolling when modal is open
  useEffect(() => {
    if (selectedMember || selectedProject) {
      const originalOverflow = document.body.style.overflow;
      const originalDocOverflow = document.documentElement.style.overflow;
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }

      const handleTouchMove = (e) => {
        if (!e.target.closest('.dossier-modal-window') && !e.target.closest('.blueprint-modal-window')) {
          e.preventDefault();
        }
      };

      document.addEventListener("touchmove", handleTouchMove, { passive: false });

      return () => {
        document.body.style.overflow = originalOverflow;
        document.documentElement.style.overflow = originalDocOverflow;
        document.body.style.paddingRight = "";
        document.removeEventListener("touchmove", handleTouchMove);
      };
    }
  }, [selectedMember, selectedProject]);

  // GSAP ScrollTrigger bidirectional cinematic reveals (matching Home and Compatibility)
  useEffect(() => {
    if (!aboutPageRef.current) return;

    const ctx = gsap.context(() => {
      // Ambient lighting parallax scrub (matching PlatformServices in Home)
      if (ambientGlowRef.current) {
        gsap.to(ambientGlowRef.current, {
          yPercent: 35,
          ease: "none",
          scrollTrigger: {
            trigger: aboutPageRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 1.2,
          },
        });
      }

      // 1. Meet the Developers Hero Section Reveal & Scroll Adaptation
      ScrollTrigger.create({
        trigger: ".meet-devs-hero",
        start: "top 90%",
        onEnter: () => {
          gsap.to(".meet-devs-hero", {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: "power3.out",
            overwrite: "auto",
          });
          gsap.fromTo(
            ".meet-devs-main-title",
            { opacity: 0, y: 35, scale: 0.96 },
            { opacity: 1, y: 0, scale: 1, duration: 0.85, ease: "power3.out", overwrite: "auto" }
          );
        },
        onLeaveBack: () =>
          gsap.to(".meet-devs-hero", {
            opacity: 0,
            y: 25,
            duration: 0.35,
            ease: "power2.in",
            overwrite: "auto",
          }),
      });

      // 2. Team Members Cards Batch (Smooth staggered reveal; reverses on scroll-back-up)
      gsap.set(".team-member-card", { opacity: 0, y: 35, scale: 0.97 });
      ScrollTrigger.batch(".team-member-card", {
        interval: 0.08,
        batchMax: 3,
        start: "top 86%",
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            scale: 1,
            stagger: 0.1,
            duration: 0.75,
            ease: "power3.out",
            overwrite: "auto",
          }),
        onLeaveBack: (batch) =>
          gsap.to(batch, {
            opacity: 0,
            y: 35,
            scale: 0.97,
            duration: 0.35,
            ease: "power2.in",
            overwrite: "auto",
          }),
      });

      // 3. WhiteHats Ecosystem Bento Tiles Batch
      ScrollTrigger.batch(".bento-tile", {
        interval: 0.08,
        batchMax: 3,
        start: "top 86%",
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            scale: 1,
            stagger: 0.1,
            duration: 0.75,
            ease: "power3.out",
            overwrite: "auto",
          }),
        onLeaveBack: (batch) =>
          gsap.to(batch, {
            opacity: 0,
            y: 30,
            scale: 0.98,
            duration: 0.35,
            ease: "power2.in",
            overwrite: "auto",
          }),
      });

      // 4. Institutional Project Cards Batch
      ScrollTrigger.batch(".project-showcase-card", {
        interval: 0.06,
        batchMax: 3,
        start: "top 88%",
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            scale: 1,
            stagger: 0.08,
            duration: 0.65,
            ease: "power2.out",
            overwrite: "auto",
          }),
        onLeaveBack: (batch) =>
          gsap.to(batch, {
            opacity: 0,
            y: 30,
            scale: 0.98,
            duration: 0.35,
            ease: "power2.in",
            overwrite: "auto",
          }),
      });
    }, aboutPageRef);

    // Refresh so triggers measure the compact card layout correctly
    ScrollTrigger.refresh();

    return () => ctx.revert();
  }, [teamMembers, projectFilter]);

  const filteredProjects = projectFilter === "all"
    ? WHITEHATS_PROJECTS
    : WHITEHATS_PROJECTS.filter((p) => p.category === projectFilter);

  const flagshipProject = WHITEHATS_PROJECTS.find((p) => p.id === "WH-SYS-01");
  const matrixProjects = filteredProjects.filter((p) => p.id !== "WH-SYS-01");

  const handleOpenDossier = (member) => {
    try { soundManager.snap(); } catch { }
    setSelectedMember(member);
  };

  const handleCloseDossier = () => {
    try { soundManager.click(); } catch { }
    setSelectedMember(null);
  };

  const handleProjectFilterClick = (cat) => {
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

  // Dynamic 3D interactive tilt on pointer move (matching Home & PlatformServices)
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
      duration: 0.3,
      ease: "power2.out",
      transformPerspective: 900,
      overwrite: "auto",
    });
  };

  const handleCardMouseLeave = (e) => {
    const card = e.currentTarget;
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.5,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  return (
    <div className="about-us-page" ref={aboutPageRef}>
      <GlobalHeader />

      <div className="about-ambient-glow" ref={ambientGlowRef} aria-hidden="true" />
      <div className="about-grid-overlay" aria-hidden="true" />

      <div className="about-container">
        {/* HERO INTEL SECTION / MEET THE DEVELOPERS (CENTERED WITH GSAP REVEAL) */}
        <section className="about-hero-section meet-devs-hero">
          <div className="about-telemetry-badge telemetry-badge-minimal">
            <span className="telemetry-live-dot" />
            <span className="telemetry-label">PATEROS TECHNOLOGICAL COLLEGE // WHITEHATS COLLECTIVE</span>
          </div>

          <RevealHeading
            as="h1"
            className="about-hero-title meet-devs-main-title"
            underline
            parts={[
              { text: "MEET THE" },
              { text: "DEVELOPERS", className: "title-accent" },
            ]}
          />

          <p className="meet-devs-lead">
            The five student architects behind BuildLab and modern academic software solutions.
          </p>
        </section>

        {/* TEAM MEMBERS DIRECTORY (5 DEVELOPERS) */}
        <section className="about-team-section">
          <div className="team-cards-grid">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="team-member-card"
                onClick={() => handleOpenDossier(member)}
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
              >
                <div className="card-avatar-wrap">
                  <div className="avatar-photo-frame fb-profile-frame">
                    {(member.image || member.photoUrl || member.photo_url) ? (
                      <img
                        src={member.image || member.photoUrl || member.photo_url}
                        alt={member.name}
                        className="avatar-photo fb-profile-pic"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const fb = e.currentTarget.parentElement?.querySelector(".fb-avatar-fallback") || e.currentTarget.parentElement?.querySelector(".avatar-icon-content");
                          if (fb) fb.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className="fb-avatar-fallback"
                      style={{ display: (member.image || member.photoUrl || member.photo_url) ? "none" : "flex" }}
                    >
                      <svg viewBox="0 0 24 24" className="fb-placeholder-svg" fill="currentColor">
                        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                      </svg>
                      <span className="fb-fallback-code">{(member.name || member.id).slice(0, 2).toUpperCase()}</span>
                    </div>
                    <span className="fb-active-dot" title="Active developer" />
                  </div>
                </div>

                <div className="card-main-meta">
                  <span className="member-badge-pill">{member.avatarBadge}</span>
                  <h3 className="member-name">{member.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FULL VITAE DOSSIER MODAL */}
        {selectedMember && typeof document !== "undefined" && createPortal(
          <div
            className="dossier-modal-backdrop"
            onClick={handleCloseDossier}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dossier-modal-title"
          >
            <div
              className="dossier-modal-window"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="dossier-header-bar">
                <div className="dossier-title-group">
                  <span className="dossier-kicker">{selectedMember.id} &bull; {selectedMember.avatarBadge}</span>
                  <h2 id="dossier-modal-title" className="dossier-name">{selectedMember.name}</h2>
                  <span className="dossier-designation">{selectedMember.designation}</span>
                </div>
                <button
                  type="button"
                  className="dossier-close-btn"
                  onClick={handleCloseDossier}
                  aria-label="Close Profile Modal"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div className="dossier-body-grid">
                <div className="dossier-left-col">
                  {/* Clean Profile Photo Card without redundant metadata */}
                  <div className="dossier-photo-card">
                    <div className="dossier-photo-frame fb-modal-frame">
                      {(selectedMember.image || selectedMember.photoUrl || selectedMember.photo_url) ? (
                        <img
                          src={selectedMember.image || selectedMember.photoUrl || selectedMember.photo_url}
                          alt={selectedMember.name}
                          className="dossier-photo-img fb-profile-pic"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            const fb = e.currentTarget.parentElement?.querySelector(".fb-modal-fallback");
                            if (fb) fb.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div
                        className="fb-modal-fallback"
                        style={{ display: (selectedMember.image || selectedMember.photoUrl || selectedMember.photo_url) ? "none" : "flex" }}
                      >
                        <svg viewBox="0 0 24 24" className="fb-placeholder-svg" fill="currentColor">
                          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                        </svg>
                        <span className="dossier-fallback-code">{(selectedMember.name || selectedMember.id || "DEV").slice(0, 2).toUpperCase()}</span>
                      </div>
                      <span className="fb-active-dot modal" title="Active developer" />
                    </div>
                  </div>

                  {/* Architecture Specialty Focus */}
                  <div className="dossier-meta-card">
                    <span className="meta-card-title">SPECIALTY &amp; ARCHITECTURE</span>
                    <p className="meta-card-text">{selectedMember.highlight || selectedMember.bio || "Core Software Architecture"}</p>
                  </div>
                </div>

                <div className="dossier-right-col">
                  {selectedMember.favTip ? (
                    <div className="dossier-section-block dossier-tip-block">
                      <blockquote className="dossier-quote">
                        <em>"{selectedMember.favTip}"</em>
                      </blockquote>
                    </div>
                  ) : null}

                  <div className="dossier-section-block">
                    <h4 className="dossier-subhead">SCHOOL &amp; PROGRAM</h4>
                    <div className="dossier-academic-card">
                      <p className="dossier-academic-degree">Bachelor of Science in Information Technology</p>
                      <p className="dossier-academic-dept">Pateros Technological College &bull; WhiteHats Capstone Group</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="dossier-footer-bar">
                <button
                  type="button"
                  className="dossier-done-btn"
                  onClick={handleCloseDossier}
                >
                  CLOSE PROFILE
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* ── WHITEHATS ECOSYSTEM BENTO GRID ── */}
        <section className="whitehats-bento-section">
          <div className="bento-section-header">
            <span className="bento-eyebrow">WHITEHATS ECOSYSTEM</span>
            <RevealHeading
              as="h2"
              className="bento-main-heading"
              parts={[
                { text: "BUILT FOR" },
                { text: "ACADEMIC EXCELLENCE", className: "title-accent" },
              ]}
            />
            <p className="bento-subhead">
              Production-ready web architectures and simulation tools engineered for schools.
            </p>
          </div>

          <div className="whitehats-bento-grid">
            {/* BENTO TILE 1: FLAGSHIP BUILDLAB 3D ATELIER (2 Columns Wide) */}
            {flagshipProject && (
              <div 
                className="bento-tile bento-hero-tile"
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
              >
                <div className="bento-tile-top">
                  <div className="bento-badge-group">
                    <span className="bento-badge-gold">{flagshipProject.id}</span>
                    <span className="bento-badge-live">
                      <span className="bento-live-dot" /> ACTIVE DEPLOYMENT
                    </span>
                  </div>
                  <span className="bento-client-tag">{flagshipProject.targetClient}</span>
                </div>

                <div className="bento-hero-grid">
                  <div className="bento-hero-left">
                    <h3 className="bento-hero-title">{flagshipProject.title}</h3>
                    <p className="bento-hero-desc">{flagshipProject.summary}</p>

                    <div className="bento-hero-metrics">
                      <div className="bento-metric-chip">
                        <span className="chip-val">100%</span>
                        <span className="chip-label">Socket Clearance Free</span>
                      </div>
                      <div className="bento-metric-chip">
                        <span className="chip-val">7-Stage</span>
                        <span className="chip-label">Interactive 3D Viewport</span>
                      </div>
                    </div>

                    <div className="bento-hero-actions">
                      <Link
                        to={flagshipProject.actionLink || "/build"}
                        className="bento-btn primary"
                        onClick={() => { try { soundManager.click(); } catch {} }}
                      >
                        <span>LAUNCH 3D BUILDER</span>
                        <span className="btn-arrow">&rarr;</span>
                      </Link>
                      <button
                        type="button"
                        className="bento-btn secondary"
                        onClick={() => handleOpenBlueprint(flagshipProject)}
                      >
                        <span>INSPECT BLUEPRINT</span>
                      </button>
                    </div>
                  </div>

                  <div className="bento-hero-right">
                    <div className="bento-capability-panel">
                      <span className="bento-panel-title">VERIFIED CAPABILITIES</span>
                      <ul className="bento-checklist">
                        <li>
                          <span className="check-bullet">✓</span>
                          <span>LGA1700 &amp; AM5 Pinout Clearance Engine</span>
                        </li>
                        <li>
                          <span className="check-bullet">✓</span>
                          <span>Modular PSU TDP &amp; Thermal Headroom</span>
                        </li>
                        <li>
                          <span className="check-bullet">✓</span>
                          <span>B.O.B. Interactive Audio Hardware Assistant</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* BENTO TILE 2: WHITEHATS CONSORTIUM (1 Column) */}
            <div 
              className="bento-tile bento-consortium-tile"
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
            >
              <div className="bento-tile-top">
                <span className="bento-badge-cyan">STUDENT COLLECTIVE</span>
              </div>
              <h3 className="bento-tile-title">WhiteHats</h3>
              <p className="bento-tile-desc">
                Five student researchers at Pateros Technological College building focused, reliable web software for academic workflows.
              </p>
              <div className="bento-consortium-stats">
                <div className="mini-stat">
                  <span className="mini-num">05</span>
                  <span className="mini-lbl">Engineers</span>
                </div>
                <div className="mini-stat">
                  <span className="mini-num">10+</span>
                  <span className="mini-lbl">Systems Built</span>
                </div>
                <div className="mini-stat">
                  <span className="mini-num">PTC</span>
                  <span className="mini-lbl">College of ICT</span>
                </div>
              </div>
            </div>

            {/* BENTO TILE 3: BUILT TO STANDARDS (1 Column) */}
            <div 
              className="bento-tile bento-standards-tile"
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
            >
              <div className="bento-tile-top">
                <span className="bento-badge-emerald">STANDARDS &amp; RIGOR</span>
              </div>
              <h3 className="bento-tile-title">Built to Standards</h3>
              <p className="bento-tile-desc">
                Verified against ISO/IEC 25010 software quality benchmarks and aligned with CHED &amp; DepEd institutional standards.
              </p>
              <ul className="bento-checklist">
                <li>
                  <span className="check-bullet">✓</span>
                  <span>44px+ accessible touch targets</span>
                </li>
                <li>
                  <span className="check-bullet">✓</span>
                  <span>Zero-latency client state engine</span>
                </li>
                <li>
                  <span className="check-bullet">✓</span>
                  <span>Tested hardware compatibility matrices</span>
                </li>
              </ul>
            </div>

            {/* BENTO TILE 4: CAMPUS SYSTEMS (1 Column) */}
            <div 
              className="bento-tile bento-campus-tile"
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
            >
              <div className="bento-tile-top">
                <span className="bento-badge-purple">CAMPUS WORKFLOWS</span>
              </div>
              <h3 className="bento-tile-title">Targeted Workflows</h3>
              <p className="bento-tile-desc">
                Replacing manual queues and paper slips with streamlined web platforms for registrars, laboratories, and student councils.
              </p>
              <div className="bento-tags-row">
                <span className="bento-tag">Lab Queuing</span>
                <span className="bento-tag">Clearance</span>
                <span className="bento-tag">RFID Pass</span>
                <span className="bento-tag">Enrollment</span>
              </div>
            </div>

            {/* BENTO TILE 5: MODERN ARCHITECTURE (1 Column) */}
            <div 
              className="bento-tile bento-tech-tile"
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
            >
              <div className="bento-tile-top">
                <span className="bento-badge-gold">MODERN STACK</span>
              </div>
              <h3 className="bento-tile-title">Engineered for Speed</h3>
              <p className="bento-tile-desc">
                React 19 single-page architecture, procedural Three.js WebGL graphics, and RESTful Node.js services with MySQL storage.
              </p>
              <div className="bento-tech-chips">
                <span className="tech-chip">React 19</span>
                <span className="tech-chip">Three.js</span>
                <span className="tech-chip">Node.js</span>
                <span className="tech-chip">MySQL</span>
                <span className="tech-chip">Web Audio</span>
              </div>
            </div>
          </div>

          {/* ── INSTITUTIONAL SYSTEMS SHOWCASE (9 SYSTEMS) ── */}
          <div className="bento-projects-header">
            <div className="projects-header-left">
              <span className="projects-eyebrow">COMMUNITY &amp; INSTITUTIONAL PORTFOLIO</span>
              <h3 className="projects-heading">Institutional Systems &amp; Tools</h3>
              <p className="projects-subhead">
                Other applications and simulation engines engineered by WhiteHats for schools and academic operations.
              </p>
            </div>
          </div>

          <div className="projects-cards-grid">
            {matrixProjects.map((project) => (
              <div 
                key={project.id}
                className="project-showcase-card"
                onClick={() => handleOpenBlueprint(project)}
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
              >
                <div className="project-card-top">
                  <span className="project-id-badge">{project.id}</span>
                  <span 
                    className="project-status-pill"
                    style={{ borderColor: project.statusColor, color: project.statusColor }}
                  >
                    <span className="status-beacon-dot" style={{ backgroundColor: project.statusColor }} />
                    {project.statusBadge}
                  </span>
                </div>

                <div className="project-card-body">
                  <h4 className="project-title">{project.title}</h4>
                  <div className="project-target-client">
                    <span className="target-name">{project.targetClient}</span>
                  </div>
                  <p className="project-summary-text">{project.summary}</p>
                </div>

                <div className="project-impact-box">
                  <span className="impact-label">KEY IMPACT:</span>
                  <span className="impact-value">{project.impactMetric}</span>
                </div>

                <div className="project-card-footer">
                  <div className="project-tech-badges">
                    {project.techStack.slice(0, 3).map((tech, i) => (
                      <span key={i} className="proj-tech-pill">{tech}</span>
                    ))}
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
        {selectedProject && typeof document !== "undefined" && createPortal(
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
          </div>,
          document.body
        )}
      </div>
    </div>
  );
}
