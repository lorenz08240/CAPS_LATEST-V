import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import jsPDF from "jspdf";
import EyeTracker from "../EyeTracker/EyeTracker";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useBuild } from "../../contexts/BuildContext";
import { useLearnMode } from "../../contexts/LearnModeContext";
import { getCompatibilitySummary } from "../../utilities/rules";
import { calculateScores } from "../../utilities/scoringEngine";
import { OFFLINE_COMPONENTS } from "../../utilities/offlineParts";
import soundManager from "../../utilities/soundManager";
import FullscreenGate from "../FullscreenGate/FullscreenGate";
import GlobalHeader from "../Navigation/GlobalHeader";
import StageUnlockBanner from "../Navigation/StageUnlockBanner";
import "./Compatibility.css";
import "../Compare/CompareRigs.css";

gsap.registerPlugin(ScrollTrigger);

// Built-in presets for instant side-by-side comparison (Free Workbench mode)
const PRESET_ENTHUSIAST_RIG = {
  case: OFFLINE_COMPONENTS.case?.[1] || OFFLINE_COMPONENTS.case?.[0],
  motherboard: OFFLINE_COMPONENTS.motherboard?.[0],
  cpu: OFFLINE_COMPONENTS.cpu?.[1],
  ram: OFFLINE_COMPONENTS.ram?.[0],
  storage: OFFLINE_COMPONENTS.storage?.[0],
  gpu: OFFLINE_COMPONENTS.gpu?.[0],
  psu: OFFLINE_COMPONENTS.psu?.[0],
};

const PRESET_BUDGET_RIG = {
  case: OFFLINE_COMPONENTS.case?.[0],
  motherboard: OFFLINE_COMPONENTS.motherboard?.[1] || OFFLINE_COMPONENTS.motherboard?.[0],
  cpu: OFFLINE_COMPONENTS.cpu?.[0],
  ram: OFFLINE_COMPONENTS.ram?.[1] || OFFLINE_COMPONENTS.ram?.[0],
  storage: OFFLINE_COMPONENTS.storage?.[1] || OFFLINE_COMPONENTS.storage?.[0],
  gpu: OFFLINE_COMPONENTS.gpu?.[2] || OFFLINE_COMPONENTS.gpu?.[0],
  psu: OFFLINE_COMPONENTS.psu?.[2] || OFFLINE_COMPONENTS.psu?.[0],
};

const COMPONENT_CATEGORIES = [
  { key: "case", label: "PC CASE", icon: "📦" },
  { key: "motherboard", label: "MOTHERBOARD", icon: "🖲️" },
  { key: "cpu", label: "PROCESSOR", icon: "⚡" },
  { key: "ram", label: "MEMORY (RAM)", icon: "💾" },
  { key: "storage", label: "STORAGE (SSD)", icon: "💿" },
  { key: "gpu", label: "GRAPHICS (GPU)", icon: "🎮" },
  { key: "psu", label: "POWER SUPPLY", icon: "🔌" },
];

function ConcentricRings({ rigLabel, gamingScore, prodScore, overallScore, primaryColor = "#00e5a0" }) {
  const cx = 55;
  const cy = 55;
  const rings = [
    { r: 44, val: Math.min(100, Math.max(10, gamingScore || 50)), color: primaryColor },
    { r: 33, val: Math.min(100, Math.max(10, prodScore || 50)), color: "#f59e0b" },
    { r: 22, val: Math.min(100, Math.max(10, overallScore || 50)), color: "#a855f7" },
  ];

  return (
    <svg width="110" height="110" viewBox="0 0 110 110">
      {rings.map((ring, idx) => {
        const circ = 2 * Math.PI * ring.r;
        const offset = circ * (1 - ring.val / 100);
        return (
          <g key={idx}>
            <circle
              cx={cx}
              cy={cy}
              r={ring.r}
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="5"
            />
            <circle
              cx={cx}
              cy={cy}
              r={ring.r}
              fill="none"
              stroke={ring.color}
              strokeWidth="5"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          </g>
        );
      })}
      <text
        x={cx}
        y={cy + 4}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#ffffff"
        fontFamily="var(--font-mono, monospace)"
        fontSize="12"
        fontWeight="800"
      >
        {rigLabel}
      </text>
    </svg>
  );
}

function DualOverlaidRadar({ rig1, rig2, metrics, metricScore }) {
  const cx = 140;
  const cy = 135;
  const r = 95;
  const step = (Math.PI * 2) / metrics.length;

  const getPoints = (build) => {
    return metrics
      .map((m, i) => {
        const score = metricScore(build, m);
        const norm = Math.max((score / 100) * r, 20);
        const angle = -Math.PI / 2 + step * i;
        return `${cx + Math.cos(angle) * norm},${cy + Math.sin(angle) * norm}`;
      })
      .join(" ");
  };

  const rig1Points = getPoints(rig1);
  const rig2Points = getPoints(rig2);

  const labels = metrics.map((m, i) => {
    const angle = -Math.PI / 2 + step * i;
    const lr = r + 24;
    return {
      metric: m,
      x: cx + Math.cos(angle) * lr,
      y: cy + Math.sin(angle) * lr,
    };
  });

  return (
    <svg className="dual-radar-svg" width="280" height="270" viewBox="0 0 280 270">
      <defs>
        <filter id="dualGlowMint" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="dualGlowRose" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {[1, 0.75, 0.5, 0.25].map((scale, i) => (
        <polygon
          key={i}
          points={metrics
            .map((_, j) => {
              const angle = -Math.PI / 2 + step * j;
              return `${cx + Math.cos(angle) * (r * scale)},${cy + Math.sin(angle) * (r * scale)}`;
            })
            .join(" ")}
          fill="none"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth="1"
        />
      ))}

      {metrics.map((_, i) => {
        const angle = -Math.PI / 2 + step * i;
        return (
          <line
            key={`spoke-${i}`}
            x1={cx}
            y1={cy}
            x2={cx + Math.cos(angle) * r}
            y2={cy + Math.sin(angle) * r}
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="1"
          />
        );
      })}

      {rig2 && (
        <polygon
          points={rig2Points}
          fill="rgba(244, 63, 94, 0.16)"
          stroke="#f43f5e"
          strokeWidth="2.2"
          filter="url(#dualGlowRose)"
        />
      )}

      <polygon
        points={rig1Points}
        fill="rgba(0, 229, 160, 0.18)"
        stroke="#00e5a0"
        strokeWidth="2.2"
        filter="url(#dualGlowMint)"
      />

      {metrics.map((m, i) => {
        const score = metricScore(rig1, m);
        const norm = Math.max((score / 100) * r, 20);
        const angle = -Math.PI / 2 + step * i;
        const px = cx + Math.cos(angle) * norm;
        const py = cy + Math.sin(angle) * norm;
        return <circle key={`r1-dot-${i}`} cx={px} cy={py} r="3" fill="#00e5a0" />;
      })}

      {rig2 &&
        metrics.map((m, i) => {
          const score = metricScore(rig2, m);
          const norm = Math.max((score / 100) * r, 20);
          const angle = -Math.PI / 2 + step * i;
          const px = cx + Math.cos(angle) * norm;
          const py = cy + Math.sin(angle) * norm;
          return <circle key={`r2-dot-${i}`} cx={px} cy={py} r="3" fill="#f43f5e" />;
        })}

      {labels.map(({ metric, x, y }) => (
        <text
          key={metric}
          x={x}
          y={y}
          dominantBaseline="middle"
          textAnchor="middle"
          fill="#94a3b8"
          fontFamily="var(--font-mono, monospace)"
          fontSize="11"
          fontWeight="700"
        >
          {metric}
        </text>
      ))}
    </svg>
  );
}

const COMPAT_BOB_PHRASES = [
  "Hi there! I'm B.O.B., your compatibility inspector.",
  "Hover over any component or metric to inspect it!",
  "Pro-tip: Always leave 20-30% PSU wattage headroom for transient spikes.",
  "Never force a CPU! Look for the golden triangle alignment.",
  "Dual-channel RAM belongs in slots 2 and 4.",
  "Check GPU length clearance against your chosen PC case!",
  "Everything looks well-balanced here!"
];

const getComponentBobHint = (comp) => {
  if (!comp) return "Hardware component slot.";
  const cat = (comp.category || "").toLowerCase();
  const name = `${comp.brand || ""} ${comp.name || ""}`.trim();
  if (cat.includes("cpu")) {
    return `Inspecting CPU (${name}): Checking socket pinout and thermal TDP demand.`;
  }
  if (cat.includes("motherboard")) {
    return `Inspecting Motherboard (${name}): Validating CPU socket, RAM slots, and form factor.`;
  }
  if (cat.includes("gpu")) {
    return `Inspecting GPU (${name}): Checking PCIe x16 power draw and physical case clearance.`;
  }
  if (cat.includes("ram")) {
    return `Inspecting RAM (${name}): Validating DDR generation and channel frequency.`;
  }
  if (cat.includes("storage")) {
    return `Inspecting Storage (${name}): Checking M.2 NVMe protocol and motherboard lane speeds.`;
  }
  if (cat.includes("psu")) {
    return `Inspecting Power Supply (${name}): Verifying total wattage buffer for transient spikes.`;
  }
  if (cat.includes("case")) {
    return `Inspecting PC Case (${name}): Checking motherboard standoffs and airflow volume.`;
  }
  return `Inspecting ${name}: Verified in system hardware configuration.`;
};

function CompatibilityView({ isIntegrated = false }) {
  const navigate = useNavigate();
  const { mode, seenBanners, markBannerSeen, unlockStage } = useLearnMode();
  const isLearnMode = mode === "learn";
  const compatContainerRef = useRef(null);

  const [showUnlockBanner, setShowUnlockBanner] = useState(() => isLearnMode && !seenBanners?.compatibility);
  const {
    currentBuild,
    getSelectedComponents,
    savedBuilds,
    selectedSaveSlot,
    setSelectedSaveSlot,
    saveBuildSnapshot,
    allComponents,
    loadDemoBuild,
  } = useBuild();

  const getSavedBuild = (slot) => {
    const b = savedBuilds?.[slot];
    if (!b) return null;
    return b;
  };

  const selectedComponents = getSelectedComponents().sort((a, b) => {
    const order = ["case", "motherboard", "cpu", "ram", "storage", "gpu", "psu"];
    return order.indexOf(a.category.toLowerCase()) - order.indexOf(b.category.toLowerCase());
  });

  // State for Learn Mode (with account)
  const [saveMessage, setSaveMessage] = useState("");
  const [bottleneckDismissed, setBottleneckDismissed] = useState(false);
  const [issueModal, setIssueModal] = useState(null);
  const [radarProfileMode, setRadarProfileMode] = useState(false);
  const [bobSpeech, setBobSpeech] = useState(null);

  // State for Free Workbench (non-account)
  const [rig2Source, setRig2Source] = useState("blank");

  const triggerBobHint = useCallback((text) => {
    if (!text) return;
    try { soundManager.click(); } catch {}
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try { navigator.vibrate(30); } catch {}
    }
    setBobSpeech(null);
    setTimeout(() => {
      setBobSpeech(text);
    }, 40);
  }, []);

  const handleUnlockBannerComplete = useCallback(() => {
    setShowUnlockBanner(false);
    markBannerSeen("compatibility");
    setTimeout(() => {
      triggerBobHint("Stage 02 Unlocked! All 7 parts assembled. I've audited your clearances — check the metrics below!");
    }, 500);
  }, [markBannerSeen, triggerBobHint]);

  const bindBobInteract = useCallback((hintText) => {
    let touchTimer = null;
    let startPos = null;

    return {
      title: "Right-click or hold (touchscreen) to ask B.O.B.",
      onContextMenu: (e) => {
        e.preventDefault();
        e.stopPropagation();
        triggerBobHint(hintText);
      },
      onTouchStart: (e) => {
        if (!e.touches || e.touches.length !== 1) return;
        const touch = e.touches[0];
        startPos = { x: touch.clientX, y: touch.clientY };
        clearTimeout(touchTimer);
        touchTimer = setTimeout(() => {
          triggerBobHint(hintText);
        }, 450);
      },
      onTouchMove: (e) => {
        if (!startPos || !e.touches || e.touches.length !== 1) return;
        const dx = Math.abs(e.touches[0].clientX - startPos.x);
        const dy = Math.abs(e.touches[0].clientY - startPos.y);
        if (dx > 12 || dy > 12) {
          clearTimeout(touchTimer);
          touchTimer = null;
        }
      },
      onTouchEnd: () => {
        clearTimeout(touchTimer);
        touchTimer = null;
      },
      onTouchCancel: () => {
        clearTimeout(touchTimer);
        touchTimer = null;
      },
    };
  }, [triggerBobHint]);

  const metrics = ["CPU", "GPU", "RAM", "SSD", "PSU"];

  /* ── Component Scoring Logic ── */
  const getCpuScore = (cpu) => {
    if (!cpu || !Array.isArray(cpu.tags)) return 60;
    const tag = cpu.tags.find((t) => /\d+\s*cores?/i.test(t));
    const cores = tag ? parseInt(tag.match(/(\d+)/)[1], 10) : 6;
    if (cores >= 24) return 100;
    if (cores >= 16) return 94;
    if (cores >= 8) return 82;
    if (cores >= 6) return 68;
    return 50;
  };

  const getGpuScore = (gpu) => {
    if (!gpu) return 65;
    const w = gpu.power_required || 0;
    if (w >= 700) return 98;
    if (w >= 550) return 88;
    if (w >= 400) return 74;
    if (w > 0) return 60;
    return 45;
  };

  const getRamScore = (ram) => {
    if (!ram || !Array.isArray(ram.tags)) return 70;
    const cap = parseInt(
      ram.tags.find((t) => /\d+GB/i.test(t))?.match(/(\d+)/)?.[1] || "16",
      10
    );
    const spd = parseInt(
      ram.tags.find((t) => /\d+MHz/i.test(t))?.match(/(\d+)/)?.[1] || "3200",
      10
    );
    let s = cap >= 64 ? 50 : cap >= 32 ? 45 : cap >= 16 ? 35 : 20;
    s += spd >= 6000 ? 50 : spd >= 5200 ? 44 : spd >= 3600 ? 38 : 25;
    return Math.min(100, s);
  };

  const getStorageScore = (storage) => {
    if (!storage) return 70;
    const type = (
      storage.type ||
      storage.tags?.find((t) => /(nvme|ssd|hdd)/i.test(t)) ||
      ""
    ).toLowerCase();
    if (type.includes("nvme")) return 96;
    if (type.includes("ssd")) return 82;
    if (type.includes("hdd")) return 45;
    return 65;
  };

  const getPsuScore = (psu) => {
    if (!psu) return 65;
    const w = psu.wattage || 0;
    if (w >= 1000) return 100;
    if (w >= 850) return 92;
    if (w >= 750) return 80;
    if (w >= 650) return 68;
    return 50;
  };

  const metricScore = (build, metric) => {
    if (!build) {
      if (metric === "GPU") return 98;
      if (metric === "CPU") return 92;
      return 85;
    }
    switch (metric) {
      case "CPU":
        return getCpuScore(build.cpu);
      case "GPU":
        return getGpuScore(build.gpu);
      case "RAM":
        return getRamScore(build.ram);
      case "SSD":
        return getStorageScore(build.storage);
      case "PSU":
        return getPsuScore(build.psu);
      default:
        return 75;
    }
  };

  const getBuildScore = (build) => {
    if (!build) return 85;
    const vals = metrics.map((m) => metricScore(build, m));
    return Math.round(vals.reduce((a, b) => a + b, 0) / metrics.length);
  };

  /* ── Radar Coordinates for Learn Mode ── */
  const getRadarPoints = (build, isBoosted = false) => {
    const cx = 130, cy = 130, r = 100;
    const step = (Math.PI * 2) / metrics.length;
    return metrics
      .map((m, i) => {
        let score = metricScore(build, m);
        if (isBoosted) {
          score = Math.min(100, Math.round(score * 1.12));
        }
        const norm = Math.max((score / 100) * r, 20);
        const angle = -Math.PI / 2 + step * i;
        return `${cx + Math.cos(angle) * norm},${cy + Math.sin(angle) * norm}`;
      })
      .join(" ");
  };

  const getRadarLabels = () => {
    const cx = 130, cy = 130, r = 120;
    const step = (Math.PI * 2) / metrics.length;
    return metrics.map((m, i) => {
      const angle = -Math.PI / 2 + step * i;
      return {
        metric: m,
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
      };
    });
  };

  /* ── Compatibility Summary ── */
  const checkAllCompatibility = () => {
    return getCompatibilitySummary(currentBuild, allComponents);
  };

  const checkBuildCompatibility = (build) => {
    if (!build) return [];
    const rawIssues = getCompatibilitySummary(build, allComponents);
    if (!rawIssues || rawIssues.length === 0) return [];
    return rawIssues.map((iss) => ({
      category: Array.isArray(iss.components)
        ? iss.components.map((c) => c.toUpperCase()).join(" ↔ ")
        : "Compatibility Notice",
      icon: "!",
      severity: "error",
      message: iss.issue,
      fix: iss.tip || "Verify component specifications and adjust your selection in the picker.",
    }));
  };

  /* ── Power Estimation ── */
  const estimateWattage = (build = currentBuild) => {
    const cpu = build?.cpu;
    const gpu = build?.gpu;
    const cpuW = cpu?.tdp || 105;
    const gpuW = gpu?.power_required || 320;
    return cpuW + gpuW + 75;
  };

  const compatibilityIssues = checkAllCompatibility();
  const radarLabels = getRadarLabels();
  const currentPoints = getRadarPoints(currentBuild, radarProfileMode);
  const estWattage = estimateWattage(currentBuild);

  // Diagnostic filter checks for Learn Mode
  const hasSocketIssue = compatibilityIssues.some((iss) =>
    iss.components.some((c) => c.toLowerCase() === "cpu" || c.toLowerCase() === "motherboard")
  );
  const hasRamIssue = compatibilityIssues.some((iss) =>
    iss.components.some((c) => c.toLowerCase() === "ram")
  );
  const hasPowerIssue = compatibilityIssues.some((iss) =>
    iss.components.some((c) => c.toLowerCase() === "psu" || c.toLowerCase() === "gpu")
  );

  // Verification pass condition: ONLY true when user completes a 7-stage rig with 0 compatibility issues
  const isRigComplete = selectedComponents.length >= 7;
  const hasZeroIssues = compatibilityIssues.length === 0;
  const isVerificationPassed = isRigComplete && hasZeroIssues;

  // Auditory feedback when entering Compatibility Checker
  useEffect(() => {
    const timer = setTimeout(() => {
      if (compatibilityIssues.length > 0) {
        soundManager.denied();
      } else if (selectedComponents.length >= 2) {
        soundManager.granted();
      }
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = (slot) => {
    saveBuildSnapshot(slot);
    setSelectedSaveSlot(slot);
    soundManager.granted();
    setSaveMessage(`Build saved to Slot 0${slot + 1}!`);
    setTimeout(() => setSaveMessage(""), 3500);
  };

  const handleExportManifestPDF = () => {
    try {
      soundManager.granted();
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const issueList = compatibilityIssues || [];
      const psuWatts = Number(currentBuild?.psu?.wattage) || 0;
      const dateStr = new Date().toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      });

      // Header Banner
      doc.setFillColor(10, 15, 28);
      doc.rect(0, 0, pageWidth, 34, "F");
      doc.setTextColor(0, 229, 160);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("BUILDLAB // TECHNICAL MANIFEST & BUILD SUMMARY", 14, 15);
      doc.setTextColor(203, 213, 225);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.text(`Generated: ${dateStr}  |  Hardware Audit Status: ${issueList.length === 0 ? "100% VERIFIED COMPATIBLE" : `${issueList.length} CONFLICT(S) DETECTED`}`, 14, 24);

      // Build Telemetry Summary Strip
      let y = 44;
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(14, y, pageWidth - 28, 18, 2, 2, "F");
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.text(`Components: ${selectedComponents.length}/7`, 18, y + 7.5);
      doc.text(`Est. Peak Draw: ${estWattage}W`, 62, y + 7.5);
      doc.text(`PSU Rated: ${psuWatts ? `${psuWatts}W` : "N/A"}`, 112, y + 7.5);
      doc.text(`Overall Score: ${getBuildScore(currentBuild)}/100`, 156, y + 7.5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.text(`Gaming Index: ${metricScore(currentBuild, "GPU")}/100   |   Productivity Index: ${metricScore(currentBuild, "CPU")}/100`, 18, y + 14);

      // Components Table Header
      y = 70;
      doc.setFillColor(15, 23, 42);
      doc.rect(14, y, pageWidth - 28, 8, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text("STAGE / PART", 17, y + 5.5);
      doc.text("COMPONENT MODEL", 50, y + 5.5);
      doc.text("SPECIFICATIONS", 132, y + 5.5);
      doc.text("STATUS", 176, y + 5.5);

      y += 8;
      const stages = ["case", "motherboard", "cpu", "ram", "storage", "gpu", "psu"];
      stages.forEach((cat, idx) => {
        const comp = currentBuild?.[cat];
        const hasIssue = comp
          ? issueList.some((iss) =>
              iss.components.some((c) => c.toLowerCase() === cat)
            )
          : false;

        if (idx % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(14, y, pageWidth - 28, 11, "F");
        }

        doc.setTextColor(15, 23, 42);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.text(cat.toUpperCase(), 17, y + 7);

        doc.setFont("helvetica", "normal");
        const modelText = comp ? `${comp.brand || ""} ${comp.name || ""}`.trim() : "-- Not Selected --";
        doc.text(modelText.slice(0, 42), 50, y + 7);

        let specStr = "N/A";
        if (comp) {
          const parts = [
            comp.socket_type,
            comp.ddr_type,
            comp.form_factor,
            comp.capacity,
            comp.wattage ? `${comp.wattage}W` : null,
            comp.power_required ? `${comp.power_required}W Req` : null,
          ].filter(Boolean);
          specStr = parts.join(" / ") || (comp.price || "Standard");
        }
        doc.text(specStr.slice(0, 24), 132, y + 7);

        if (!comp) {
          doc.setTextColor(100, 116, 139);
          doc.text("MISSING", 176, y + 7);
        } else if (hasIssue) {
          doc.setTextColor(220, 38, 38);
          doc.setFont("helvetica", "bold");
          doc.text("CONFLICT", 176, y + 7);
        } else {
          doc.setTextColor(22, 163, 74);
          doc.setFont("helvetica", "bold");
          doc.text("READY", 176, y + 7);
        }
        y += 11;
      });

      // Compatibility Audit Section
      y += 8;
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("COMPATIBILITY AUDIT LOG", 14, y);
      y += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      if (issueList.length === 0) {
        doc.setTextColor(22, 163, 74);
        doc.text("PASS: No CPU socket, DDR generation, chassis form-factor, or PSU wattage conflicts detected.", 14, y);
      } else {
        issueList.forEach((iss, idx) => {
          doc.setTextColor(220, 38, 38);
          const line = `${idx + 1}. [${iss.components.join(" / ").toUpperCase()}] ${iss.issue}`;
          const split = doc.splitTextToSize(line, pageWidth - 28);
          doc.text(split, 14, y);
          y += split.length * 4.5 + 2;
        });
      }

      // Footer
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      doc.text("BuildLab PC Architecture & Assembly Studio  |  Pateros Technological College Capstone System", 14, 285);

      doc.save("BuildLab_Technical_Manifest.pdf");
      setSaveMessage("Technical Manifest PDF exported!");
      setTimeout(() => setSaveMessage(""), 3500);
    } catch (err) {
      console.error("Failed to export technical manifest PDF:", err);
      alert("Unable to export Technical Manifest PDF. Please check browser popup/download permissions.");
    }
  };

  /* ── Brand Monogram Helper ── */
  const getBrandMonogram = (comp) => {
    if (!comp) return "PART";
    const name = (comp.name || "").toUpperCase();
    const brand = (comp.brand || "").toUpperCase();
    const cat = (comp.category || "").toUpperCase();

    if (brand.includes("ANTEC") || name.includes("ANTEC")) return "ANTEC";
    if (brand.includes("ASUS") || name.includes("ASUS")) return "ASUS";
    if (brand.includes("AMD") || name.includes("RYZEN")) return "AMD";
    if (brand.includes("INTEL") || name.includes("CORE")) return "INTEL";
    if (brand.includes("LEXAR") || name.includes("LEXAR")) return "LEXAR";
    if (brand.includes("SAMSUNG") || name.includes("EVO") || name.includes("970")) return "SSD";
    if (brand.includes("NVIDIA") || name.includes("RTX") || name.includes("GEFORCE")) return "NVIDIA";
    if (brand.includes("MSI") || name.includes("MAG")) return "MSI";
    if (brand.includes("CORSAIR") || name.includes("CORSAIR")) return "CORSAIR";
    if (brand.includes("GIGABYTE") || name.includes("AORUS")) return "AORUS";

    if (comp.brand && comp.brand.length <= 7) return comp.brand.toUpperCase();
    if (cat.includes("STORAGE") || cat.includes("SSD")) return "SSD";
    return cat.slice(0, 5);
  };

  /* ── Hardware Spec Summary Helper matching Image 2 (Free Workbench) ── */
  const getCompSpecSummary = (comp, category) => {
    if (!comp) return { main: "-- Not Selected --", tag: "EMPTY", isSet: false };
    const brand = comp.brand || "";
    const name = comp.name || "";
    const fullName = `${brand} ${name}`.trim();

    if (category === "case") {
      return { main: fullName, tag: comp.form_factor || "ATX", isSet: true };
    }
    if (category === "motherboard") {
      const sock = comp.socket_type || (Array.isArray(comp.tags) ? comp.tags.find((t) => /(am\d|lga\d+)/i.test(t)) : "") || "ATX";
      return { main: fullName, tag: sock.toUpperCase(), isSet: true };
    }
    if (category === "cpu") {
      const sock = comp.socket_type || "";
      return { main: fullName, tag: sock || "CPU", isSet: true };
    }
    if (category === "ram") {
      const ddr = comp.ddr_type || (Array.isArray(comp.tags) ? comp.tags.find((t) => /ddr\d/i.test(t)) : "") || "DDR5";
      return { main: fullName, tag: ddr.toUpperCase(), isSet: true };
    }
    if (category === "storage") {
      const type = comp.type || (Array.isArray(comp.tags) ? comp.tags.find((t) => /(nvme|ssd|hdd)/i.test(t)) : "") || "NVME";
      return { main: fullName, tag: type.toUpperCase(), isSet: true };
    }
    if (category === "gpu") {
      return { main: fullName, tag: "PCIE", isSet: true };
    }
    if (category === "psu") {
      const w = comp.wattage ? `${comp.wattage}W` : "850W";
      return { main: fullName, tag: w, isSet: true };
    }
    return { main: fullName, tag: "READY", isSet: true };
  };

  /* ── Free Workbench Dual-Rig Comparison Derivations ── */
  const handleSelectRig2Source = (sourceKey) => {
    try { soundManager.click(); } catch {}
    setRig2Source(sourceKey);
  };

  const rig2 = useMemo(() => {
    if (rig2Source === "preset-enthusiast") return PRESET_ENTHUSIAST_RIG;
    if (rig2Source === "preset-budget") return PRESET_BUDGET_RIG;
    if (rig2Source === "blank") return null;
    if (rig2Source.startsWith("slot-")) {
      const slotIdx = parseInt(rig2Source.replace("slot-", ""), 10);
      return savedBuilds?.[slotIdx] || null;
    }
    return null;
  }, [rig2Source, savedBuilds]);

  const rig1Components = useMemo(() => {
    return Object.entries(currentBuild || {})
      .filter(([, v]) => v !== null)
      .map(([category, comp]) => ({ category, ...comp }));
  }, [currentBuild]);

  const rig2Components = useMemo(() => {
    if (!rig2) return [];
    return Object.entries(rig2)
      .filter(([, v]) => v !== null)
      .map(([category, comp]) => ({ category, ...comp }));
  }, [rig2]);

  const hasRig1 = rig1Components.length > 0;
  const hasRig2 = rig2Components.length > 0;
  const hasTwoRigs = hasRig1 && hasRig2;

  const rig1Scores = useMemo(() => calculateScores(currentBuild || {}), [currentBuild]);
  const rig2Scores = useMemo(() => calculateScores(rig2 || {}), [rig2]);

  const rig1Wattage = useMemo(() => estimateWattage(currentBuild), [currentBuild]);
  const rig2Wattage = useMemo(() => (rig2 ? estimateWattage(rig2) : 0), [rig2]);

  const rig1Issues = useMemo(() => checkBuildCompatibility(currentBuild), [currentBuild, allComponents]);
  const rig2Issues = useMemo(() => (rig2 ? checkBuildCompatibility(rig2) : []), [rig2, allComponents]);

  // GSAP ScrollTrigger bidirectional cinematic reveals (Down & Up scroll)
  useEffect(() => {
    if (!compatContainerRef.current) return;

    const ctx = gsap.context(() => {
      // 1. Header Reveal (Smooth reveal on enter; reverses only when scrolled back out past top)
      ScrollTrigger.create({
        trigger: ".compat-hero-title-header",
        start: "top 92%",
        onEnter: () =>
          gsap.to(".compat-hero-title-header", {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.65,
            ease: "power2.out",
            overwrite: "auto",
          }),
        onLeaveBack: () =>
          gsap.to(".compat-hero-title-header", {
            opacity: 0,
            y: 20,
            duration: 0.3,
            ease: "power2.in",
            overwrite: "auto",
          }),
      });

      // 2. Primary Rig & Compare Cards (Reveal & remain visible throughout scroll; reverse only on scroll-back-up)
      ScrollTrigger.batch(
        ".rig-workbench-card, .compare-rig-card, .compat-compare-launcher-card, .compare-dedicated-overview-card, .compat-learn-unlock-card",
        {
          interval: 0.06,
          batchMax: 2,
          start: "top 88%",
          onEnter: (batch) =>
            gsap.to(batch, {
              opacity: 1,
              y: 0,
              scale: 1,
              stagger: 0.06,
              duration: 0.6,
              ease: "power2.out",
              overwrite: "auto",
            }),
          onLeaveBack: (batch) =>
            gsap.to(batch, {
              opacity: 0,
              y: 30,
              scale: 0.98,
              duration: 0.3,
              ease: "power2.in",
              overwrite: "auto",
            }),
        }
      );
    }, compatContainerRef);

    return () => ctx.revert();
  }, [selectedComponents, rig2]);

  /* ── FREE WORKBENCH: RIG 01 CARD (Matches Image 2 when empty) ── */
  const renderFreeRig1Card = () => (
    <div className="compare-rig-card card-primary-workbench">
      <div className="rig-card-header">
        <div className="rig-badge-group">
          <span className="rig-badge-live">RIG 01 // WORKBENCH</span>
          <span className="rig-badge-subtitle">Active Custom Build</span>
        </div>
        <div className="rig-compat-status-chip">
          {hasRig1 ? (
            rig1Issues.length === 0 ? (
              <span className="chip-badge status-ok">✓ 100% COMPATIBLE</span>
            ) : (
              <span className="chip-badge status-warning">⚠ {rig1Issues.length} ISSUE{rig1Issues.length > 1 ? "S" : ""}</span>
            )
          ) : (
            <span className="chip-badge status-empty">EMPTY WORKBENCH</span>
          )}
        </div>
      </div>

      <div className="rig-source-control-bar">
        <div className="rig-source-control-meta">
          <span className="source-control-dot green-dot" />
          <span className="source-control-label">TARGET SAVE SLOT:</span>
        </div>
        <div className="rig-source-dropdown-wrapper">
          <select
            className="rig-source-dropdown-select green-accent"
            value={selectedSaveSlot}
            onChange={(e) => {
              try { soundManager.click(); } catch {}
              setSelectedSaveSlot(Number(e.target.value));
            }}
          >
            <option value={0}>{savedBuilds?.[0] ? "★ Slot 01 (Saved Custom Build)" : "Slot 01 (Empty - Ready to Save)"}</option>
            <option value={1}>{savedBuilds?.[1] ? "★ Slot 02 (Saved Custom Build)" : "Slot 02 (Empty - Ready to Save)"}</option>
            <option value={2}>{savedBuilds?.[2] ? "★ Slot 03 (Saved Custom Build)" : "Slot 03 (Empty - Ready to Save)"}</option>
          </select>
          <div className="dropdown-chevron-icon" aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>
      </div>

      {hasRig1 ? (
        <>
          <div className="rig-preview-media-box">
            <img
              src={currentBuild.case?.img || "/assets/component_picker_image_bg.png"}
              alt={currentBuild.case?.name || "Rig 01"}
              className="rig-preview-image"
              onError={(e) => {
                e.target.src = "/assets/component_picker_image_bg.png";
              }}
            />
            <div className="rig-preview-overlay-telemetry">
              <div className="telemetry-pill">
                <span className="pill-dot red-dot" />
                <span>{rig1Wattage}W EST.</span>
              </div>
              <div className="telemetry-pill">
                <span className="pill-dot purple-dot" />
                <span>SCORE {rig1Scores.gaming || 92}</span>
              </div>
              <div className="telemetry-pill">
                <span className="pill-dot green-dot" />
                <span>{selectedComponents.length}/7 PARTS</span>
              </div>
            </div>
          </div>

          <div className="rig-quick-actions">
            <Link
              to="/build"
              className="btn-rig-action btn-edit-workbench"
              title="Modify components in Assembly Rig"
            >
              <span>EDIT IN ASSEMBLY RIG &rarr;</span>
            </Link>
            <button
              type="button"
              className="btn-rig-action btn-snapshot-save"
              onClick={() => handleSave(selectedSaveSlot)}
              title={`Save current workbench state into Slot 0${selectedSaveSlot + 1}`}
            >
              <span>SAVE SNAPSHOT</span>
            </button>
          </div>
        </>
      ) : (
        <div className="empty-rig1-card" style={{ minHeight: "240px" }}>
          <p className="empty-rig1-desc">No configuration loaded in this slot.</p>
          <Link
            to="/build"
            className="btn-load-demo-ghost"
            style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
            onClick={() => { try { soundManager.click(); } catch {} }}
          >
            Go to Component Picker
          </Link>
        </div>
      )}

      {saveMessage && <div className="rig-save-toast">{saveMessage}</div>}

      <div className="rig-specs-list">
        <div className="specs-list-title">HARDWARE SPECIFICATIONS</div>
        {hasRig1 ? (
          COMPONENT_CATEGORIES.map(({ key, label, icon }) => {
            const comp = currentBuild[key];
            const spec = getCompSpecSummary(comp, key);
            return (
              <div key={key} className={`spec-item-row ${spec.isSet ? "item-filled" : "item-empty"}`}>
                <div className="spec-item-label-group">
                  <span className="spec-icon" aria-hidden="true">{icon}</span>
                  <span className="spec-category">{label}</span>
                </div>
                <div className="spec-item-val-group">
                  <span className="spec-name" title={spec.main}>{spec.main}</span>
                  <span className="spec-tag">{spec.tag}</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-rig2-prompt">
            <p>No configuration loaded in this slot.</p>
            <span>Go to Component Picker to assemble your PC components.</span>
          </div>
        )}
      </div>
    </div>
  );

  /* ── FREE WORKBENCH: RIG 02 CARD (Revealed when Launcher Compare clicked) ── */
  const renderFreeRig2Card = () => (
    <div className="compare-rig-card card-secondary-comparison">
      <div className="rig-card-header">
        <div className="rig-badge-group">
          <span className="rig-badge-live badge-cyan">RIG 02 // COMPARISON</span>
          <span className="rig-badge-subtitle">Alternative Build</span>
        </div>
        <div className="rig-compat-status-chip">
          {hasRig2 ? (
            rig2Issues.length === 0 ? (
              <span className="chip-badge status-ok">✓ 100% COMPATIBLE</span>
            ) : (
              <span className="chip-badge status-warning">⚠ {rig2Issues.length} ISSUE{rig2Issues.length > 1 ? "S" : ""}</span>
            )
          ) : (
            <span className="chip-badge status-empty">EMPTY SLOT</span>
          )}
        </div>
      </div>

      <div className="rig-source-control-bar">
        <div className="rig-source-control-meta">
          <span className="source-control-dot cyan-dot" />
          <span className="source-control-label">COMPARE SOURCE:</span>
        </div>
        <div className="rig-source-dropdown-wrapper">
          <select
            className="rig-source-dropdown-select"
            value={rig2Source}
            onChange={(e) => {
              try { soundManager.click(); } catch {}
              handleSelectRig2Source(e.target.value);
            }}
          >
            <option value="blank">Blank Build (Empty Slot)</option>
            <option value="preset-enthusiast">Preset: 4K Ultra Rig</option>
            <option value="preset-budget">Preset: Budget Rig</option>
            <option value="slot-0">{savedBuilds?.[0] ? "★ Slot 01 (Saved Custom Rig)" : "Slot 01 (Empty)"}</option>
            <option value="slot-1">{savedBuilds?.[1] ? "★ Slot 02 (Saved Custom Rig)" : "Slot 02 (Empty)"}</option>
            <option value="slot-2">{savedBuilds?.[2] ? "★ Slot 03 (Saved Custom Rig)" : "Slot 03 (Empty)"}</option>
          </select>
          <div className="dropdown-chevron-icon" aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>
      </div>

      {hasRig2 ? (
        <>
          <div className="rig-preview-media-box">
            <img
              src={rig2.case?.img || "/assets/component_picker_image_bg.png"}
              alt={rig2.case?.name || "Rig 02"}
              className="rig-preview-image"
              onError={(e) => {
                e.target.src = "/assets/component_picker_image_bg.png";
              }}
            />
            <div className="rig-preview-overlay-telemetry">
              <div className="telemetry-pill">
                <span className="pill-dot red-dot" />
                <span>{rig2Wattage}W EST.</span>
              </div>
              <div className="telemetry-pill">
                <span className="pill-dot purple-dot" />
                <span>SCORE {rig2Scores.gaming}</span>
              </div>
              <div className="telemetry-pill">
                <span className="pill-dot green-dot" />
                <span>{rig2Components.length}/7 PARTS</span>
              </div>
            </div>
          </div>

          <div className="rig-quick-actions">
            <button
              type="button"
              className="btn-rig-action btn-load-to-workbench"
              onClick={() => {
                try { soundManager.granted(); } catch {}
                if (rig2) {
                  Object.entries(rig2).forEach(([cat, comp]) => {
                    if (comp) currentBuild[cat] = comp;
                  });
                  setSaveMessage("Rig 02 loaded into Workbench!");
                  setTimeout(() => setSaveMessage(""), 3000);
                }
              }}
              title="Load this configuration into active workbench"
            >
              <span>LOAD INTO WORKBENCH</span>
            </button>
          </div>
        </>
      ) : (
        <div className="empty-rig1-card">
          <p className="empty-rig1-desc">
            {rig2Source.startsWith("slot-")
              ? `No configuration saved in Slot 0${parseInt(rig2Source.replace("slot-", ""), 10) + 1} yet.`
              : "No configuration loaded in this slot."}
          </p>
          <button
            type="button"
            className="btn-load-demo-ghost"
            onClick={() => handleSelectRig2Source("preset-enthusiast")}
          >
            Load 4K Ultra Preset
          </button>
        </div>
      )}

      <div className="rig-specs-list">
        <div className="specs-list-title">HARDWARE SPECIFICATIONS</div>
        {hasRig2 ? (
          COMPONENT_CATEGORIES.map(({ key, label, icon }) => {
            const comp = rig2?.[key];
            const spec = getCompSpecSummary(comp, key);
            return (
              <div key={key} className={`spec-item-row ${spec.isSet ? "item-filled" : "item-empty"}`}>
                <div className="spec-item-label-group">
                  <span className="spec-icon" aria-hidden="true">{icon}</span>
                  <span className="spec-category">{label}</span>
                </div>
                <div className="spec-item-val-group">
                  <span className="spec-name" title={spec.main}>{spec.main}</span>
                  <span className="spec-tag">{spec.tag}</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-rig2-prompt">
            <p>No configuration loaded in this slot.</p>
            <span>
              {rig2Source.startsWith("slot-")
                ? `Slot 0${parseInt(rig2Source.replace("slot-", ""), 10) + 1} is empty. Assemble parts in Rig 01 and save to Slot 0${parseInt(rig2Source.replace("slot-", ""), 10) + 1} to compare.`
                : "Select a preset or saved slot from the dropdown above to compare."}
            </span>
          </div>
        )}
      </div>
    </div>
  );



  /* ── FREE WORKBENCH: DUAL OVERVIEW SECTION ── */
  const renderFreeDualOverview = () => (
    <section className="compare-dedicated-overview-card glass-panel" style={{ marginTop: "2rem" }}>
      <div className="overview-header">
        <div className="compare-telemetry-badge" style={{ marginBottom: "0.8rem" }}>
          <span className="telemetry-live-dot" />
          <span className="telemetry-label">HEAD-TO-HEAD COMPATIBILITY AUDIT</span>
          <span className="telemetry-bracket">[ ACTIVE COMPARISON ]</span>
        </div>
        <h2 className="overview-title">DUAL-RIG COMPATIBILITY &amp; PERFORMANCE OVERVIEW</h2>
        <p className="overview-sub">
          Real-time differential analysis between Rig 01 (Workbench) and Rig 02 ({rig2Source.replace("-", " ").toUpperCase()}).
        </p>
      </div>

      <div className="dual-overview-showcase-row">
        <div className="dual-overview-gauge-col">
          <div className="gauge-rings-wrap">
            <ConcentricRings
              rigLabel="Rig 01"
              gamingScore={rig1Scores.gaming}
              prodScore={rig1Scores.productivity}
              overallScore={getBuildScore(currentBuild)}
              primaryColor="#00e5a0"
            />
          </div>
          <div className="gauge-rating-badges">
            <div className="gauge-badge-pill">
              <span>Gaming Rating</span>
              <strong>{rig1Scores.gaming}</strong>
            </div>
            <div className="gauge-badge-pill">
              <span>Productivity</span>
              <strong>{rig1Scores.productivity}</strong>
            </div>
            <div className="gauge-badge-pill">
              <span>System Balance</span>
              <strong>{getBuildScore(currentBuild)}</strong>
            </div>
          </div>
        </div>

        <div className="dual-overview-radar-col">
          <DualOverlaidRadar
            rig1={currentBuild}
            rig2={rig2}
            metrics={metrics}
            metricScore={metricScore}
          />
          <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem", fontSize: "0.72rem", fontFamily: "var(--font-mono, monospace)" }}>
            <span style={{ color: "#00e5a0", display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#00e5a0", display: "inline-block" }} /> Rig 01 (Workbench)
            </span>
            <span style={{ color: "#f43f5e", display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f43f5e", display: "inline-block" }} /> Rig 02 (Comparison)
            </span>
          </div>
        </div>

        <div className="dual-overview-gauge-col">
          <div className="gauge-rings-wrap">
            <ConcentricRings
              rigLabel="Rig 02"
              gamingScore={rig2Scores.gaming}
              prodScore={rig2Scores.productivity}
              overallScore={getBuildScore(rig2)}
              primaryColor="#f43f5e"
            />
          </div>
          <div className="gauge-rating-badges">
            <div className="gauge-badge-pill">
              <span>Gaming Rating</span>
              <strong>{rig2Scores.gaming}</strong>
            </div>
            <div className="gauge-badge-pill">
              <span>Productivity</span>
              <strong>{rig2Scores.productivity}</strong>
            </div>
            <div className="gauge-badge-pill">
              <span>System Balance</span>
              <strong>{getBuildScore(rig2)}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="overview-metrics-matrix">
        <div className="metric-compare-row">
          <div className="metric-name-label">
            <span className="metric-title">ESTIMATED SYSTEM WATTAGE</span>
            <span className="metric-caption">Combined CPU, GPU &amp; motherboard baseline draw</span>
          </div>
          <div className="metric-bar-group">
            <div className="metric-value-col">
              <span className="val-number">{rig1Wattage}W</span>
              <span className="val-tag">Rig 01</span>
            </div>
            <div className="metric-differential-pill">
              {rig1Wattage < rig2Wattage ? (
                <span className="diff-green">Rig 01 is {rig2Wattage - rig1Wattage}W more efficient</span>
              ) : rig1Wattage > rig2Wattage ? (
                <span className="diff-cyan">Rig 02 is {rig1Wattage - rig2Wattage}W more efficient</span>
              ) : (
                <span className="diff-neutral">Equal Power Consumption</span>
              )}
            </div>
            <div className="metric-value-col">
              <span className="val-number">{rig2Wattage}W</span>
              <span className="val-tag">Rig 02</span>
            </div>
          </div>
        </div>

        <div className="metric-compare-row">
          <div className="metric-name-label">
            <span className="metric-title">GAMING BENCHMARK SCORE</span>
            <span className="metric-caption">Calculated GPU rasterization, VRAM &amp; single-core clock weighting</span>
          </div>
          <div className="metric-bar-group">
            <div className="metric-value-col">
              <span className="val-number score-purple">{rig1Scores.gaming}</span>
              <span className="val-tag">Rig 01</span>
            </div>
            <div className="metric-differential-pill">
              {rig1Scores.gaming > rig2Scores.gaming ? (
                <span className="diff-green">Rig 01 leads by +{rig1Scores.gaming - rig2Scores.gaming} pts</span>
              ) : rig1Scores.gaming < rig2Scores.gaming ? (
                <span className="diff-cyan">Rig 02 leads by +{rig2Scores.gaming - rig1Scores.gaming} pts</span>
              ) : (
                <span className="diff-neutral">Equal Gaming Performance</span>
              )}
            </div>
            <div className="metric-value-col">
              <span className="val-number score-purple">{rig2Scores.gaming}</span>
              <span className="val-tag">Rig 02</span>
            </div>
          </div>
        </div>

        <div className="metric-compare-row">
          <div className="metric-name-label">
            <span className="metric-title">PRODUCTIVITY &amp; RENDERING</span>
            <span className="metric-caption">Multi-threaded CPU &amp; RAM bandwidth throughput</span>
          </div>
          <div className="metric-bar-group">
            <div className="metric-value-col">
              <span className="val-number score-amber">{rig1Scores.productivity}</span>
              <span className="val-tag">Rig 01</span>
            </div>
            <div className="metric-differential-pill">
              {rig1Scores.productivity > rig2Scores.productivity ? (
                <span className="diff-green">Rig 01 leads by +{rig1Scores.productivity - rig2Scores.productivity} pts</span>
              ) : rig1Scores.productivity < rig2Scores.productivity ? (
                <span className="diff-cyan">Rig 02 leads by +{rig2Scores.productivity - rig1Scores.productivity} pts</span>
              ) : (
                <span className="diff-neutral">Balanced Productivity</span>
              )}
            </div>
            <div className="metric-value-col">
              <span className="val-number score-amber">{rig2Scores.productivity}</span>
              <span className="val-tag">Rig 02</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "1.5rem" }}>
        <div className={`dual-compat-verdict-bar ${rig1Issues.length === 0 && rig2Issues.length === 0 ? "" : "has-issues"}`}>
          <span>
            {rig1Issues.length === 0 && rig2Issues.length === 0
              ? "✓ DUAL-CONFIGURATION COMPATIBILITY MATRIX AUDITED - BOTH RUN 100% COMPATIBLE"
              : `⚠ DUAL-CONFIGURATION COMPATIBILITY MATRIX AUDITED - ${rig1Issues.length + rig2Issues.length} TOTAL CONFLICT(S) DETECTED`}
          </span>
        </div>
      </div>

      <div className="overview-summary-banner" style={{ marginTop: "1.5rem" }}>
        <div className="summary-icon">🤖</div>
        <div className="summary-text">
          <h4 className="summary-title">BUILDLAB ARCHITECT VERDICT</h4>
          <p className="summary-copy">
            {rig1Scores.gaming > rig2Scores.gaming
              ? `Rig 01 provides superior graphical horsepower (+${rig1Scores.gaming - rig2Scores.gaming} Gaming Score) with your current component combination.`
              : rig2Scores.gaming > rig1Scores.gaming
              ? `Rig 02 demonstrates higher graphics throughput (+${rig2Scores.gaming - rig1Scores.gaming} Gaming Score), while requiring careful consideration of power capacity.`
              : "Both configurations offer balanced gaming and compute parity across tested hardware workloads."}
            {" "}
            {rig1Wattage < rig2Wattage
              ? `Rig 01 operates cooler with an estimated ${rig2Wattage - rig1Wattage}W lower power draw.`
              : rig1Wattage > rig2Wattage
              ? `Rig 02 is more energy-conscious, consuming approximately ${rig1Wattage - rig2Wattage}W less power.`
              : "Power demands are practically equivalent between both systems."}
          </p>
        </div>
      </div>
    </section>
  );

  return (
    <>
      {/* Issue Modal for Learn Mode */}
      {issueModal &&
        createPortal(
          <div className="compat-modal-overlay" onClick={() => setIssueModal(null)}>
            <div className="compat-modal" onClick={(e) => e.stopPropagation()}>
              <div className="compat-modal-header">
                <h2>Build {issueModal.slot + 1} — Compatibility Report</h2>
                <button className="compat-modal-close" onClick={() => setIssueModal(null)}>
                  ✕
                </button>
              </div>
              <div className="compat-modal-body">
                {issueModal.issues.map((issue, i) => (
                  <div key={i} className={`compat-issue-card compat-issue-${issue.severity}`}>
                    <div className="compat-issue-header">
                      <span className="compat-issue-icon">{issue.icon}</span>
                      <span className="compat-issue-category">{issue.category}</span>
                    </div>
                    <p className="compat-issue-message">{issue.message}</p>
                    {issue.fix && <p className="compat-issue-fix"><strong>Recommendation:</strong> {issue.fix}</p>}
                  </div>
                ))}
              </div>
              <div className="compat-modal-footer">
                <Link to="/build" className="btn-primary" onClick={() => setIssueModal(null)}>
                  Go to Build Picker
                </Link>
                <button className="btn-outline" onClick={() => setIssueModal(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      <div ref={compatContainerRef} className={`compat-page ${isIntegrated ? "integrated-view" : ""}`}>
        {/* Stage Unlock Banner for Learn Track */}
        {showUnlockBanner && isLearnMode && (
          <StageUnlockBanner
            stageKey="compatibility"
            stageNumber="02"
            title="COMPATIBILITY MATRIX UNLOCKED"
            subtitle="All 7 hardware components assembled. Automated socket, power, and thermal clearance auditing online."
            accentColor="#00e5a0"
            badge="LEARN TRACK // STAGE 02"
            onComplete={handleUnlockBannerComplete}
          />
        )}
        {!isIntegrated && <GlobalHeader hideBuildPill={true} />}
        {!isIntegrated && (
          <>
            <div className="bg-grid" aria-hidden="true" />
            <div className="bg-wave bg-wave-burgundy" aria-hidden="true" />
            <div className="bg-wave bg-wave-gold" aria-hidden="true" />
            <div className="bg-wave bg-wave-navy" aria-hidden="true" />
          </>
        )}

        <div className="compat-container-wrap">
          {!isIntegrated && (
            <div className="compat-action-bar">
              <button
                type="button"
                className="compat-back-build-btn"
                onClick={() => {
                  try { soundManager.click(); } catch {}
                  navigate("/build");
                }}
                title="Return to Build Workbench"
              >
                <span className="back-btn-arrow">&larr;</span>
                <span className="back-btn-text">BACK TO BUILD WORKBENCH</span>
              </button>
            </div>
          )}

          {/* Unified Page Header */}
          {!isIntegrated && (
            <header className="compat-hero-title-header">
              <div className="compat-telemetry-badge">
                <span className="telemetry-live-dot" />
                <span className="telemetry-label">DIAGNOSTIC MATRIX // REAL-TIME VALIDATION</span>
                <span className="telemetry-bracket">[ LIVE ]</span>
              </div>
              <h1 className="compat-hero-title">
                Real-Time <span className="title-compat-accent">Compatibility</span> Check
              </h1>
              <p className="compat-hero-desc">
                Every component is instantly verified against physical clearances, electrical loads, and socket standards.
              </p>
              <div className="compat-bob-guide-pill" title="Hardware Interactive Guide">
                <span className="bob-guide-icon">🤖</span>
                <span>Right-click or hold (touchscreen) any component or metric to inspect with B.O.B.</span>
              </div>
            </header>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              UNIFIED WORKBENCH & LABS FLOW (IMAGE 1 & IMAGE 2)
              ══════════════════════════════════════════════════════════════════ */}
          {isLearnMode && isVerificationPassed && (
            <div className="compat-learn-unlock-card glass-panel" {...bindBobInteract("Hardware Verification Complete: All 7 stages audited with zero conflicts! Unlock your coursework.")}>
              <div className="learn-unlock-info">
                <div className="learn-unlock-badge">
                  <span className="telemetry-live-dot" />
                  <span className="learn-unlock-badge-label">STAGE 02 COMPLETE // DIAGNOSTICS AUDITED</span>
                  <span className="telemetry-bracket">[ 7/7 VERIFIED ]</span>
                </div>
                <h3 className="learn-unlock-title">Hardware Verification Complete</h3>
                <p className="learn-unlock-desc">
                  Your 7-stage PC build passed comprehensive physical clearance, electrical TDP, and socket pinout inspection with zero conflicts. You are now authorized to unlock the BuildLab Hardware Academy and begin your certified coursework.
                </p>
              </div>
              <button
                type="button"
                className="learn-unlock-btn"
                onClick={() => {
                  try { soundManager.granted(); } catch {}
                  unlockStage("learn");
                  navigate("/learn");
                }}
              >
                <span>UNLOCK &amp; PROCEED TO LEARN LAB</span>
                <span className="btn-arrow">&rarr;</span>
              </button>
            </div>
          )}

          {compatibilityIssues.length > 0 && hasRig1 && (
            <aside className="compat-top-banner" role="alert" {...bindBobInteract("Critical Warning: Compatibility issues found between your components!")}>
              <div className="compat-banner-info">
                <span className="banner-alert-badge">COMPATIBILITY WARNING:</span>
                <span className="banner-alert-desc">
                  {compatibilityIssues.length} critical issue{compatibilityIssues.length > 1 ? "s" : ""} detected in your current PC build.
                </span>
              </div>
            </aside>
          )}

          {/* Direct Dual Cards Layout ("rekta na dapat doon sa may card") */}
          <div className="compare-mode-container" style={{ marginTop: "1.2rem" }}>
            <div className="compare-dual-grid">
              {renderFreeRig1Card()}
              {renderFreeRig2Card()}
            </div>
            {hasTwoRigs && renderFreeDualOverview()}
          </div>
        </div>

        <div
          className="compat-bob-overlay"
          title="B.O.B. — Compatibility Inspector (Right-click or hold to poke!)"
          {...bindBobInteract("B.O.B. online! Right-click or hold any hardware item to inspect compatibility.")}
        >
          <EyeTracker
            size={94}
            shape="Cube"
            eyes="Squares"
            bodyColor="#00e5a0"
            eyeColor="#06080e"
            follow={90}
            bounce={55}
            speechLines={COMPAT_BOB_PHRASES}
            externalSpeech={bobSpeech}
          />
        </div>
      </div>
    </>
  );
}

export default function Compatibility({ isIntegrated = false }) {
  const content = <CompatibilityView isIntegrated={isIntegrated} />;
  return isIntegrated ? content : <FullscreenGate requireFullscreen>{content}</FullscreenGate>;
}
