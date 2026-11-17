import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useLearnMode } from "../../contexts/LearnModeContext";
import { useTheme } from "../../contexts/ThemeContext";
import soundManager from "../../utilities/soundManager";
import { CSS_CURRICULUM, FLAT_TOPICS, TOTAL_TOPICS_COUNT } from "../Learn/curriculumData";
import AccountSetupModal from "../Home/AccountSetupModal";
import "./StudentDashboard.css";

export default function StudentDashboard({
  isEmbedded = false,
  onClose = null,
  onSelectTopic = null,
}) {
  const navigate = useNavigate();
  const { userProfile, setUserProfile, mode, logoutLearner } = useLearnMode();
  const { isDark, toggleTheme } = useTheme() || {};
  const [showEditModal, setShowEditModal] = useState(false);

  // Authenticated user resolution
  const localUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const studentName =
    userProfile?.fullName ||
    localUser?.fullName ||
    localUser?.name ||
    "Grade 11 CSS Learner";

  const studentEmail =
    userProfile?.email ||
    localUser?.email ||
    "student.tester@ptc.edu.ph";

  const studentStrand =
    userProfile?.strand ||
    localUser?.strand ||
    "Grade 11 TVL - Computer Systems Servicing (CSS)";

  const institution =
    userProfile?.institution ||
    localUser?.institution ||
    "Pateros Technological College — Institute of Information and Computing Technology";

  // Read student progress from localStorage
  const completedTopics = useMemo(() => {
    try {
      const email = userProfile?.email || localUser?.email;
      const key = email ? `buildlab.learn.progress.${email}` : "buildlab.learn.progress";
      const raw = localStorage.getItem(key) || localStorage.getItem("buildlab.learn.progress") || "[]";
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
    } catch {
      return [];
    }
  }, [userProfile?.email, localUser?.email]);

  const completedCount = completedTopics.length;
  const progressPct = Math.round((completedCount / TOTAL_TOPICS_COUNT) * 100);
  const isAllComplete = completedCount >= TOTAL_TOPICS_COUNT;

  // Find next uncompleted topic
  const nextTopicIdx = useMemo(() => {
    const idx = FLAT_TOPICS.findIndex((t) => !completedTopics.includes(t.id));
    return idx !== -1 ? idx : 0;
  }, [completedTopics]);

  const nextTopic = FLAT_TOPICS[nextTopicIdx] || FLAT_TOPICS[0];

  // Check if Capstone Virtual Assembly Lab is completed
  const isAssemblyLabDone = completedTopics.includes("7.2-hands-on-assembly");

  const handleResumeCourse = (targetIdx = nextTopicIdx) => {
    try { soundManager.snap(); } catch {}
    if (isEmbedded && onSelectTopic) {
      onSelectTopic(targetIdx);
      if (onClose) onClose();
      return;
    }
    navigate("/learn", { state: { targetTopicIndex: targetIdx } });
  };

  const handleOpenCertificate = () => {
    if (!isAllComplete) {
      try { soundManager.warning(); } catch {}
      handleResumeCourse(nextTopicIdx);
      return;
    }
    try { soundManager.click(); } catch {}
    unlockStage("certificate");
    navigate("/certificate");
  };

  const handleOpen3DLab = () => {
    try { soundManager.install(); } catch {}
    const labIdx = FLAT_TOPICS.findIndex((t) => t.id === "7.2-hands-on-assembly");
    const targetIdx = labIdx !== -1 ? labIdx : 0;
    if (isEmbedded && onSelectTopic) {
      onSelectTopic(targetIdx);
      if (onClose) onClose();
      return;
    }
    navigate("/learn", { state: { targetTopicIndex: targetIdx } });
  };

  return (
    <div
      className={`student-dashboard-page ${isEmbedded ? "is-embedded" : ""} ${
        isDark ? "theme-dark" : "theme-light"
      }`}
    >
      <div className="dashboard-container">
        {isEmbedded && (
          <div className="embedded-dashboard-topbar">
            <div className="embedded-topbar-info">
              <span className="embedded-topbar-dot" />
              <strong>STUDENT ACCOUNT &amp; COURSE RECORD</strong>
              <span className="embedded-topbar-hint">Press Esc to collapse</span>
            </div>
            <button
              type="button"
              className="btn-embedded-collapse"
              onClick={onClose}
              title="Return to 3D Hardware Workbench (Esc)"
            >
              ✕ Collapse Dashboard
            </button>
          </div>
        )}
        {/* ── TOP HEADER: STUDENT PROFILE IDENTITY ── */}
        <header className="dashboard-hero-card">
          <div className="hero-avatar-wrap">
            {userProfile?.photo ? (
              <img src={userProfile.photo} alt={studentName} className="hero-avatar-img" />
            ) : (
              <div className="hero-avatar-initials">
                {studentName
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </div>
            )}
            <span className="hero-online-status" title="Active Student Session" />
          </div>

          <div className="hero-info-block">
            <div className="hero-badge-row">
              <span className="strand-tag">{studentStrand}</span>
              <span className="verified-badge">✓ Verified Student Record</span>
            </div>
            <h1 className="student-name">{studentName}</h1>
            <p className="student-institution">{institution}</p>
            <span className="student-email-sub">{studentEmail}</span>
          </div>

          <div className="hero-actions-block">
            <button
              type="button"
              className="btn-edit-profile"
              onClick={() => setShowEditModal(true)}
              title="Edit full legal name or academic strand"
            >
              ⚙️ Edit Student Profile
            </button>
            <button
              type="button"
              className="btn-dashboard-logout"
              onClick={() => {
                try { soundManager.warning(); } catch {}
                logoutLearner();
              }}
              title="Log Out of Learner Account"
            >
              🚪 Log Out
            </button>
            <button
              type="button"
              className="btn-theme-toggle"
              onClick={toggleTheme}
              title="Toggle Light / Dark Studio theme"
            >
              {isDark ? "☀️ Light Studio" : "🌙 Dark Studio"}
            </button>
          </div>
        </header>

        {/* ── ACTIVE COURSE STATUS CARD ── */}
        <section className="dashboard-active-course-card">
          <div className="course-card-top">
            <div className="course-title-group">
              <span className="course-kicker">ACTIVE ENROLLED CURRICULUM</span>
              <h2>Computer Systems Servicing (CSS) NC II</h2>
              <p className="course-desc">
                Hardware Architecture, Component Physical Keying, Lab Safety Protocols &amp; 3D Virtual PC Assembly.
              </p>
            </div>

            <div className="course-progress-ring-box">
              <div className="progress-stat-pill">
                <strong>{progressPct}%</strong>
                <span>COMPLETED</span>
              </div>
              <div className="progress-counter-text">
                {completedCount} of {TOTAL_TOPICS_COUNT} Topics Mastered
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="dashboard-progress-track">
            <div className="dashboard-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>

          {/* Up Next & Resume Action */}
          <div className="course-resume-banner">
            <div className="resume-topic-info">
              <span className="resume-label">
                {isAllComplete ? "COURSE COMPLETED" : "UP NEXT TO COMPLETE"}
              </span>
              <strong>
                {isAllComplete
                  ? "All 21 Topics and Hands-on Virtual Build Verified!"
                  : `Topic ${nextTopic.topicCode}: ${nextTopic.title}`}
              </strong>
              <p>
                {isAllComplete
                  ? "Your accredited DepEd / TESDA credential is ready for evaluation and print."
                  : nextTopic.explanation.slice(0, 115) + "..."}
              </p>
            </div>

            <button
              type="button"
              className="btn-resume-course"
              onClick={() => handleResumeCourse(isAllComplete ? 0 : nextTopicIdx)}
            >
              {isAllComplete ? "Review Syllabus ↺" : "Resume Course →"}
            </button>
          </div>
        </section>

        {/* ── TWO-COLUMN SECTION: MODULE SYLLABUS MATRIX (LEFT) + PRACTICAL LAB & CERT (RIGHT) ── */}
        <div className="dashboard-two-column-grid">
          {/* Left Column: 7 Modules Curriculum Matrix */}
          <section className="dashboard-modules-section">
            <div className="section-head-row">
              <h3>7-Module Curriculum Matrix</h3>
              <span className="section-meta-tag">Grade 11 CSS DepEd Standard</span>
            </div>

            <div className="dashboard-modules-list">
              {CSS_CURRICULUM.map((mod) => {
                const modCompletedTopics = mod.topics.filter((t) => completedTopics.includes(t.id));
                const modDoneCount = modCompletedTopics.length;
                const isModAllDone = modDoneCount === mod.topics.length;
                const isModActive = modDoneCount > 0 && !isModAllDone;

                const firstUnfinishedIdx = FLAT_TOPICS.findIndex(
                  (t) => t.moduleNum === mod.moduleNum && !completedTopics.includes(t.id)
                );
                const jumpIdx =
                  firstUnfinishedIdx !== -1
                    ? firstUnfinishedIdx
                    : FLAT_TOPICS.findIndex((t) => t.moduleNum === mod.moduleNum);

                return (
                  <div
                    key={mod.id}
                    className={`dashboard-module-item ${isModAllDone ? "is-complete" : ""} ${
                      isModActive ? "is-active" : ""
                    }`}
                    onClick={() => handleResumeCourse(jumpIdx)}
                    role="button"
                    tabIndex={0}
                    title={`Jump to Module ${mod.moduleNum}: ${mod.title}`}
                  >
                    <div className="module-item-left">
                      <span className="module-num-badge">M{mod.moduleNum}</span>
                      <div className="module-title-box">
                        <strong>{mod.title}</strong>
                        <span>{mod.description}</span>
                      </div>
                    </div>

                    <div className="module-item-right">
                      <span className="module-count-text">
                        {modDoneCount}/{mod.topics.length} Topics
                      </span>
                      {isModAllDone ? (
                        <span className="mod-status-tag done">✓ Completed</span>
                      ) : isModActive ? (
                        <span className="mod-status-tag in-progress">In Progress</span>
                      ) : (
                        <span className="mod-status-tag up-next">Up Next</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Right Column: 3D Virtual Build Lab & Accredited Certificate */}
          <div className="dashboard-side-column">
            {/* 3D Virtual PC Assembly Lab Card */}
            <section className="dashboard-side-card assembly-lab-card">
              <div className="side-card-kicker">MODULE 7 PRACTICAL CAPSTONE</div>
              <h4>Hands-On 3D Virtual PC Assembly</h4>
              <p>
                8-stage physical PC build with zero commercial brand clutter. Mount chassis standoffs, ZIF socket,
                RAM channels, M.2 SSD, modular PSU, and PCIe GPU.
              </p>

              <div className="lab-status-strip">
                <span className="lab-status-label">Virtual Assembly Status:</span>
                {isAssemblyLabDone ? (
                  <strong className="status-val success">✓ POST Verified</strong>
                ) : (
                  <strong className="status-val pending">⚡ Ready to Build</strong>
                )}
              </div>

              <button type="button" className="btn-side-action lab-btn" onClick={handleOpen3DLab}>
                🛠️ Launch 3D Assembly Lab
              </button>
            </section>

            {/* Accredited E-Certificate Status Card */}
            <section className="dashboard-side-card certificate-card">
              <div className="side-card-kicker">OFFICIAL ACADEMIC CREDENTIAL</div>
              <h4>Accredited PTC-IICT E-Certificate</h4>
              <p>
                Verified institutional Certificate of Completion with authenticated QR verification, student ID, and
                TESDA/DepEd aligned CSS hours.
              </p>

              <div className="cert-status-strip">
                <span className="lab-status-label">Credential Status:</span>
                {isAllComplete ? (
                  <strong className="status-val success">🎓 Unlocked &amp; Ready</strong>
                ) : (
                  <strong className="status-val locked">
                    🔒 {TOTAL_TOPICS_COUNT - completedCount} Topics Remaining
                  </strong>
                )}
              </div>

              <button
                type="button"
                className={`btn-side-action cert-btn ${!isAllComplete ? "is-locked" : ""}`}
                onClick={handleOpenCertificate}
              >
                {isAllComplete ? "View & Print Certificate 🎓" : `Resume Course to Unlock (${TOTAL_TOPICS_COUNT - completedCount} left) →`}
              </button>
            </section>
          </div>
        </div>
      </div>

      {/* Account Setup / Edit Profile Modal */}
      <AccountSetupModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onConfirmed={(newMode, newProfile) => {
          setShowEditModal(false);
          if (setUserProfile && newProfile) {
            setUserProfile(newProfile);
          }
        }}
      />
    </div>
  );
}
