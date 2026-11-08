import React, { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useLearnMode } from "../../contexts/LearnModeContext";
import soundManager from "../../utilities/soundManager";
import GlobalHeader from "../Navigation/GlobalHeader";
import "./CertificationPage.css";

export default function CertificationPage() {
  const { userProfile, setUserProfile, mode } = useLearnMode();
  const navigate = useNavigate();
  const certRef = useRef(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userProfile.fullName || "Certified PC Architect");

  // Certificate ID generation
  const [certId] = useState(() => {
    try {
      const saved = localStorage.getItem("buildlab_cert_id");
      if (saved) return saved;
      const gen = "BL-CERT-" + Math.random().toString(36).substring(2, 8).toUpperCase() + "-2026";
      localStorage.setItem("buildlab_cert_id", gen);
      return gen;
    } catch {
      return "BL-CERT-A892F1-2026";
    }
  });

  const issueDate = userProfile.joinedDate || new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  useEffect(() => {
    try {
      soundManager.complete();
    } catch {}
  }, []);

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
      const filename = `BuildLab_Certificate_${(userProfile.fullName || "Architect").replace(/\s+/g, "_")}.pdf`;
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
        `https://buildlab.app/verify/${certId}?student=${encodeURIComponent(userProfile.fullName || "Student")}`
      );
      alert("Verification URL copied to clipboard!");
    } catch {}
  };

  return (
    <div className="certification-page-wrap">
      <GlobalHeader
        pageTitle="ACADEMY CERTIFICATION"
        pageSubtitle="Official Architectural Credential"
        badgeText="STAGE 04 // FINAL GRADUATION"
      />

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
            ✏️ {isEditingName ? "Save Name" : "Edit Name"}
          </button>

          <button
            type="button"
            className="cert-btn-share"
            onClick={handleCopyVerification}
          >
            🔗 Copy Share Link
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
              placeholder="e.g. Alex J. Mercer"
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
              <span className="cert-brand-icon">⬢</span>
              <span className="cert-brand-name">BUILDLAB</span>
              <span className="cert-brand-sep">//</span>
              <span className="cert-brand-division">ACADEMY OF COMPUTER ENGINEERING</span>
            </div>
            <h1 className="cert-main-title">Certificate of Hardware Mastery</h1>
            <p className="cert-title-sub">
              THIS IS TO CERTIFY THAT THE SPECIALIST NAMED HEREIN HAS DEMONSTRATED VERIFIED COMPETENCY IN
              COMPUTER ARCHITECTURE, SYSTEM COMPATIBILITY AUDITING, AND RIG ASSEMBLY
            </p>
          </div>

          {/* Recipient Name Area */}
          <div className="cert-recipient-block">
            <span className="cert-awarded-to">PROUDLY PRESENTED TO</span>
            <div className="cert-recipient-name">
              {userProfile.fullName || nameInput || "Alex J. Mercer"}
            </div>
            <div className="cert-recipient-underline" />
            <p className="cert-recipient-desc">
              Having fulfilled all curriculum criteria of the BuildLab Hardware Academy — including 2D Component Hierarchy,
              Socket & Bus Clearance Matching, Thermal Dissipation Modeling, and Modular System Integration.
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
              <span className="meta-label">VERIFIED GOOGLE ACCOUNT</span>
              <span className="meta-val">{userProfile.email || "student@gmail.com"}</span>
            </div>
            <div className="cert-meta-col">
              <span className="meta-label">INSTITUTION / DIVISION</span>
              <span className="meta-val">{userProfile.institution || "BuildLab Engineering"}</span>
            </div>
          </div>

          {/* Seal & Signatures */}
          <div className="cert-signatures-row">
            <div className="cert-signature-box">
              <div className="signature-line" />
              <div className="signature-font">B.O.B. System</div>
              <span className="signature-role">B.O.B. // Lead Diagnostics Companion</span>
            </div>

            <div className="cert-gold-seal">
              <div className="seal-outer-ribbon">
                <div className="seal-rosette">
                  <div className="seal-center">
                    <span className="seal-star">★</span>
                    <span className="seal-text">BUILDLAB</span>
                    <span className="seal-sub">VERIFIED 2026</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="cert-signature-box">
              <div className="signature-line" />
              <div className="signature-font">J. Marquez</div>
              <span className="signature-role">Director of Hardware Engineering</span>
            </div>
          </div>

          <div className="cert-footer-legal">
            Issued under BuildLab Open System Architecture v2.4 • Verification key cryptographically hashed • buildlab.systems/verify
          </div>
        </div>
      </div>
    </div>
  );
}
