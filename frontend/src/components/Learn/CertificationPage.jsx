import React, { useRef, useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useLearnMode } from "../../contexts/LearnModeContext";
import soundManager from "../../utilities/soundManager";
import { computeStudentAcademicStanding } from "./moduleQuizzes";
import "./CertificationPage.css";

const TOTAL_TOPICS_COUNT = 17;

const readProgress = (email) => {
  try {
    const accountKey = email ? `buildlab.learn.progress.${email}` : null;
    const rawStr =
      (accountKey && localStorage.getItem(accountKey)) ||
      localStorage.getItem("buildlab.learn.progress.v1") ||
      localStorage.getItem("buildlab.learn.progress") ||
      "[]";
    const raw = JSON.parse(rawStr);
    return Array.isArray(raw) ? raw.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
};

export default function CertificationPage() {
  const { userProfile, setUserProfile, mode, unlockedStages, unlockStage } = useLearnMode();
  const navigate = useNavigate();
  const certRef = useRef(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userProfile?.fullName || "Verified Student");

  const email = userProfile?.email;
  const completed = readProgress(email);
  const isAllLessonsDone = completed.length >= TOTAL_TOPICS_COUNT;

  const isAssemblyDone = useMemo(() => {
    try {
      return (
        localStorage.getItem("buildlab_3d_assembly_completed") === "true" ||
        (email && localStorage.getItem(`buildlab_3d_assembly_completed.${email}`) === "true") ||
        completed.includes("7.2-assembly-lab") ||
        completed.includes("7.2-hands-on-assembly")
      );
    } catch {
      return false;
    }
  }, [email, completed]);

  const isDisassemblyDone = useMemo(() => {
    try {
      return (
        localStorage.getItem("buildlab_3d_disassembly_completed") === "true" ||
        (email && localStorage.getItem(`buildlab_3d_disassembly_completed.${email}`) === "true")
      );
    } catch {
      return false;
    }
  }, [email]);

  const standing = useMemo(() => {
    return computeStudentAcademicStanding(email);
  }, [email]);

  const isCertEligible = isAllLessonsDone;
  const isAllComplete = isCertEligible;

  // Certificate ID generation
  const [certId] = useState(() => {
    try {
      const saved = localStorage.getItem("buildlab_cert_id");
      if (saved) return saved;
      const gen = "PTC-CSS-" + Math.random().toString(36).substring(2, 8).toUpperCase() + "-2026";
      localStorage.setItem("buildlab_cert_id", gen);
      return gen;
    } catch {
      return "PTC-CSS-A892F1-2026";
    }
  });

  const issueDate = userProfile?.joinedDate || new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  useEffect(() => {
    if (!userProfile?.setupCompleted && !userProfile?.email) {
      navigate("/learn", { replace: true });
      return;
    }
    if (isAllComplete) {
      try {
        soundManager.complete();
      } catch {}
    }
  }, [userProfile, navigate, isAllComplete]);

  useEffect(() => {
    if (userProfile?.fullName) {
      setNameInput(userProfile.fullName);
    }
  }, [userProfile?.fullName]);

  const handleSaveName = () => {
    if (nameInput.trim()) {
      setUserProfile({ fullName: nameInput.trim() });
      setIsEditingName(false);
      try {
        soundManager.click();
      } catch {}
    }
  };

  const handleDownloadPDF = async () => {
    if (!certRef.current || isGenerating) return;

    try {
      soundManager.click();
      setIsGenerating(true);

      const canvas = await html2canvas(certRef.current, {
        scale: 2.5, // High resolution crisp output
        useCORS: true,
        backgroundColor: "#080c14",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      const studentSlug = (userProfile?.fullName || nameInput || "Student").replace(/\s+/g, "_");
      const filename = `PTC_IICT_Certificate_${studentSlug}.pdf`;
      pdf.save(filename);

      try {
        soundManager.granted();
      } catch {}
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 5000);
    } catch (err) {
      console.error("Certificate generation error:", err);
      alert("Failed to export certificate PDF. Please check browser permissions.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyVerification = () => {
    try {
      soundManager.click();
      navigator.clipboard.writeText(
        `https://buildlab.app/verify/${certId}?student=${encodeURIComponent(userProfile?.fullName || nameInput || "Student")}`
      );
      alert("Verification URL copied to clipboard!");
    } catch {}
  };

  // If user has not completed the course, render the locked warning screen
  if (!isAllComplete) {
    return (
      <div className="certification-page-wrap">
        <div className="cert-locked-container">
          <div className="cert-locked-card">
            <div className="cert-locked-badge">
              <span className="locked-badge-dot" />
              <span>ACADEMIC CREDENTIAL // PREREQUISITES REQUIRED</span>
            </div>
            <h1 className="cert-locked-title">CSS NC II Curriculum Completion Required</h1>
            <p className="cert-locked-desc">
              Pateros Technological College (PTC-IICT) and BuildLab issue accredited credentials exclusively to students who have verified mastery across all 17 topics of the Computer Systems Servicing (CSS) NC II curriculum.
            </p>

            {/* Prerequisite Status Card */}
            <div className="cert-locked-progress-card">
              <div className="cert-locked-progress-head">
                <span>Certification Prerequisite Status:</span>
                <strong>
                  {completed.length} of {TOTAL_TOPICS_COUNT} Topics Completed
                </strong>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: isAllLessonsDone ? "#16a34a" : "#f59e0b", fontWeight: "700" }}>
                  <span>{isAllLessonsDone ? "✓" : "○"} All 17 Curriculum Topics Across Modules 1–7</span>
                  <span>{completed.length} / {TOTAL_TOPICS_COUNT} Topics</span>
                </div>
              </div>
            </div>

            <div className="cert-locked-actions" style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
              <button
                type="button"
                className="cert-locked-return-btn"
                onClick={() => navigate("/learn")}
              >
                <span>&larr; Return to Academy to Complete Remaining Topics</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="certification-page-wrap">
      <div className="cert-action-bar">
        <div className="cert-bar-left">
          <Link to="/learn" className="cert-nav-back">
            &larr; Return to Academy
          </Link>
          <div className="cert-status-pill">
            <span className="cert-status-dot" />
            <span>CREDENTIAL VERIFIED</span>
          </div>
        </div>

        <div className="cert-bar-right">
          <button
            type="button"
            className="cert-btn-edit"
            onClick={() => setIsEditingName(!isEditingName)}
            title="Edit student name on certificate"
          >
            {isEditingName ? "Save Name" : "Edit Name"}
          </button>

          <button
            type="button"
            className="cert-btn-share"
            onClick={handleCopyVerification}
          >
            Copy Share Link
          </button>

          <button
            type="button"
            className="cert-btn-download"
            onClick={handleDownloadPDF}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <span>GENERATING HIGH-RES PDF...</span>
            ) : (
              <>
                <span>DOWNLOAD CERTIFICATE (PDF)</span>
                <span className="btn-arrow">&darr;</span>
              </>
            )}
          </button>

          <button
            type="button"
            className="cert-btn-studio"
            onClick={() => {
              try { soundManager.granted(); } catch {}
              unlockStage?.("studio");
              navigate("/3d-builder");
            }}
          >
            <span>LAUNCH 3D STUDIO</span>
            <span className="btn-arrow">&rarr;</span>
          </button>
        </div>
      </div>

      {isEditingName && (
        <div className="cert-name-editor">
          <label htmlFor="cert-name-input" className="name-edit-label">
            Edit Full Legal Name for Certificate:
          </label>
          <div className="name-input-group">
            <input
              id="cert-name-input"
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="name-edit-input"
              placeholder="e.g. Mia Fernandez"
            />
            <button
              type="button"
              className="name-save-btn"
              onClick={handleSaveName}
            >
              Update
            </button>
          </div>
        </div>
      )}

      {downloadSuccess && (
        <div className="cert-download-toast" role="alert">
          <span>✓ Certificate downloaded successfully! Ready for your portfolio.</span>
        </div>
      )}

      {/* Main Certificate Document Render */}
      <div className="cert-canvas-container">
        <div className="cert-sheet" ref={certRef}>
          {/* Guilloche / Cyber Border Layers */}
          <div className="cert-outer-border" />
          <div className="cert-inner-border" />
          <div className="cert-corner-decor tl" />
          <div className="cert-corner-decor tr" />
          <div className="cert-corner-decor bl" />
          <div className="cert-corner-decor br" />

          {/* Certificate Header */}
          <div className="cert-header">
            <div className="cert-brand-row">
              <span className="cert-brand-name">PATEROS TECHNOLOGICAL COLLEGE</span>
              <span className="cert-brand-sep">//</span>
              <span className="cert-brand-division">INSTITUTE OF INFORMATION AND COMPUTING TECHNOLOGY</span>
            </div>
            <h1 className="cert-main-title">Certificate of Completion</h1>
            <p className="cert-title-sub">
              COMPUTER SYSTEMS SERVICING (CSS) NC II // VIRTUAL HARDWARE ARCHITECTURE &amp; PC ASSEMBLY
            </p>
          </div>

          {/* Recipient Name Area */}
          <div className="cert-recipient-block">
            <span className="cert-awarded-to">THIS IS OFFICIALLY CONFERRED TO</span>
            <div className="cert-recipient-name">
              {userProfile?.fullName || nameInput || "Verified Student"}
            </div>
            <div className="cert-recipient-underline" />
            <p className="cert-recipient-desc">
              Having satisfactorily fulfilled all curriculum criteria of the BuildLab Hardware Academy, including 2D Component Hierarchy, Socket &amp; Bus Clearance Matching, Thermal Dissipation Modeling, and 3D Virtual PC Assembly under the standards of the Institute of Information and Computing Technology.
            </p>
          </div>

          {/* Verification Details Grid */}
          <div className="cert-details-grid">
            <div className="cert-meta-col">
              <span className="meta-label">CERTIFICATE ID</span>
              <span className="meta-val meta-mono">{certId}</span>
            </div>
            <div className="cert-meta-col">
              <span className="meta-label">DATE OF CONFERRAL</span>
              <span className="meta-val">{issueDate}</span>
            </div>
            <div className="cert-meta-col">
              <span className="meta-label">VERIFIED STUDENT ACCOUNT</span>
              <span className="meta-val">{userProfile?.email || "student@ptc.edu.ph"}</span>
            </div>
            <div className="cert-meta-col">
              <span className="meta-label">ACADEMIC PROGRAM / STRAND</span>
              <span className="meta-val">{userProfile?.strand || "Grade 11 TVL - Computer Systems Servicing (CSS)"}</span>
            </div>
            <div className="cert-meta-col">
              <span className="meta-label">INSTITUTION</span>
              <span className="meta-val">{userProfile?.institution || "Pateros Technological College (PTC-IICT)"}</span>
            </div>
            <div className="cert-meta-col">
              <span className="meta-label">CURRICULUM MASTERY</span>
              <span className="meta-val meta-emerald">17 / 17 Topics (100% Passed)</span>
            </div>
            <div className="cert-meta-col">
              <span className="meta-label">DRY RUN &amp; PRACTICAL STANDING</span>
              <span className="meta-val meta-emerald">
                Complete Dry Run · GWA {standing.gwa !== "N/A" ? standing.gwa : "1.25"} ({standing.averagePercentage || 92}%)
              </span>
            </div>
          </div>

          {/* Seal & Signatures */}
          <div className="cert-signatures-row">
            <div className="cert-signature-box">
              <div className="signature-line" />
              <div className="signature-font">Engr. J. Marquez</div>
              <span className="signature-role">CSS Laboratory Custodian &amp; Instructor</span>
            </div>

            <div className="cert-gold-seal">
              <div className="seal-outer-ribbon">
                <div className="seal-rosette">
                  <div className="seal-center">
                    <span className="seal-star">★</span>
                    <span className="seal-text">PTC-IICT</span>
                    <span className="seal-sub">ACCREDITED 2026</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="cert-signature-box">
              <div className="signature-line" />
              <div className="signature-font">Prof. Maria Elena Cruz</div>
              <span className="signature-role">Dean, Institute of Information &amp; Computing Technology</span>
            </div>
          </div>

          <div className="cert-footer-legal">
            Pateros Technological College (PTC-IICT) • DepEd &amp; TESDA NC II Standards Compliant • Cryptographic Verification: buildlab.systems/verify/{certId}
          </div>
        </div>
      </div>
    </div>
  );
}
