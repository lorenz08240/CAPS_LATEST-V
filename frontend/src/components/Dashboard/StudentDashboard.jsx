import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useLearnMode } from "../../contexts/LearnModeContext";
import soundManager from "../../utilities/soundManager";
import { CSS_CURRICULUM, FLAT_TOPICS, TOTAL_TOPICS_COUNT } from "../Learn/curriculumData";
import { getStudentQuizRecords, computeStudentAcademicStanding } from "../Learn/moduleQuizzes";
import AccountSetupModal from "../Home/AccountSetupModal";
import "./StudentDashboard.css";

export default function StudentDashboard({
  isEmbedded = false,
  onClose = null,
  onSelectTopic = null,
}) {
  const navigate = useNavigate();
  const { userProfile, setUserProfile, logoutLearner, unlockStage } = useLearnMode();
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
    "jaymark.piano@feu.edu.ph";

  const studentStrand =
    userProfile?.strand ||
    localUser?.strand ||
    "Grade 11 TVL - CSS";

  const institution =
    userProfile?.institution ||
    localUser?.institution ||
    "Pateros Technological College (PTC-IICT)";

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

  const completedCount = Math.min(TOTAL_TOPICS_COUNT, completedTopics.length);
  const progressPct = Math.min(100, Math.round((completedCount / TOTAL_TOPICS_COUNT) * 100));
  const isAllLessonsDone = completedTopics.length >= TOTAL_TOPICS_COUNT;
  const isAllComplete = isAllLessonsDone;

  // 15-question quiz records and academic standing
  const quizRecords = useMemo(() => {
    return getStudentQuizRecords(userProfile?.email || localUser?.email);
  }, [userProfile?.email, localUser?.email]);

  const standing = useMemo(() => {
    return computeStudentAcademicStanding(userProfile?.email || localUser?.email);
  }, [userProfile?.email, localUser?.email]);

  // Check 3D Virtual PC Assembly & Disassembly practical statuses
  const isAssemblyDone = useMemo(() => {
    try {
      const email = userProfile?.email || localUser?.email;
      return (
        localStorage.getItem("buildlab_3d_assembly_completed") === "true" ||
        (email && localStorage.getItem(`buildlab_3d_assembly_completed.${email}`) === "true") ||
        completedTopics.includes("7.2-assembly-lab") ||
        completedTopics.includes("7.2-hands-on-assembly")
      );
    } catch {
      return false;
    }
  }, [userProfile?.email, localUser?.email, completedTopics]);

  const isDisassemblyDone = useMemo(() => {
    try {
      const email = userProfile?.email || localUser?.email;
      return (
        localStorage.getItem("buildlab_3d_disassembly_completed") === "true" ||
        (email && localStorage.getItem(`buildlab_3d_disassembly_completed.${email}`) === "true")
      );
    } catch {
      return false;
    }
  }, [userProfile?.email, localUser?.email]);

  // Complete Dry Run status
  const isDryRunComplete = useMemo(() => {
    return isAllLessonsDone || (quizRecords[7] && quizRecords[7].passed) || (standing.completedModulesCount >= 7);
  }, [isAllLessonsDone, quizRecords, standing.completedModulesCount]);

  // Certificate unlocks once all 17 curriculum topics across Modules 1–7 are completed (100% completion)
  // Kept locked until all modules are 100% completed
  const isCertEligible = isAllLessonsDone;

  React.useEffect(() => {
    if (isCertEligible && unlockStage) {
      unlockStage("certificate");
    }
  }, [isCertEligible, unlockStage]);

  // Find next uncompleted topic
  const nextTopicIdx = useMemo(() => {
    const idx = FLAT_TOPICS.findIndex((t) => !completedTopics.includes(t.id));
    return idx !== -1 ? idx : 0;
  }, [completedTopics]);

  const nextTopic = FLAT_TOPICS[nextTopicIdx] || FLAT_TOPICS[0];

  // Count passed modules
  const passedModulesCount = useMemo(() => {
    return Object.values(quizRecords).filter((r) => r && r.passed).length;
  }, [quizRecords]);

  // Check if Capstone Virtual Assembly Lab is completed
  const isAssemblyLabDone = isAssemblyDone || isAllLessonsDone;

  const handleResumeCourse = (targetIdx = nextTopicIdx) => {
    try { soundManager.snap(); } catch {}
    if (isEmbedded && onSelectTopic) {
      onSelectTopic(targetIdx, "presentation");
      if (onClose) onClose();
      return;
    }
    navigate("/learn", { state: { targetTopicIndex: targetIdx } });
  };

  const handleOpenQuiz = (targetIdx, modNum) => {
    try { soundManager.click(); } catch {}
    if (isEmbedded && onSelectTopic) {
      onSelectTopic(targetIdx, "quiz");
      if (onClose) onClose();
      return;
    }
    navigate("/learn", { state: { targetTopicIndex: targetIdx, openQuiz: true, moduleNum: modNum } });
  };

  const handleOpen3DLab = () => {
    try { soundManager.install(); } catch {}
    const labIdx = FLAT_TOPICS.findIndex((t) => t.isAssemblyLab || t.id === "7.2-assembly-lab" || t.id === "7.2-hands-on-assembly");
    const targetIdx = labIdx !== -1 ? labIdx : 0;
    if (isEmbedded && onSelectTopic) {
      onSelectTopic(targetIdx, "3d-lab");
      if (onClose) onClose();
      return;
    }
    navigate("/learn", { state: { targetTopicIndex: targetIdx } });
  };

  const handleOpenCertificate = () => {
    if (!isCertEligible) {
      try { soundManager.warning(); } catch {}
      return;
    }
    try {
      soundManager.complete();
      if (unlockStage) unlockStage("certificate");
    } catch {}
    navigate("/certificate");
  };

  return (
    <div className={`student-dashboard-page ${isEmbedded ? "is-embedded" : ""}`}>
      <div className="dashboard-container">
        {/* ── CARD 1: STUDENT PROFILE IDENTITY & QUICK CONTROLS ── */}
        <header className="dashboard-hero-card">
          <div className="hero-identity-left">
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
              <span className="hero-online-status" title="Active Session" />
            </div>

            <div className="hero-info-block">
              <div className="hero-badge-row">
                <span className="strand-tag">{studentStrand}</span>
                <span className="institution-tag">{institution}</span>
                <span className="verified-badge">✓ Verified</span>
                {isDryRunComplete && (
                  <span className="dry-run-badge complete">✓ Complete Dry Run</span>
                )}
              </div>
              <h1 className="student-name">{studentName}</h1>
              <span className="student-email-sub">{studentEmail}</span>
            </div>
          </div>

          <div className="hero-actions-block">
            <button
              type="button"
              className="btn-edit-profile"
              onClick={() => setShowEditModal(true)}
              title="Edit Profile"
            >
              Edit Profile
            </button>
            <button
              type="button"
              className="btn-dashboard-logout"
              onClick={() => {
                try { soundManager.warning(); } catch {}
                logoutLearner();
              }}
              title="Log Out"
            >
              Log Out
            </button>
            {isEmbedded && onClose && (
              <button
                type="button"
                className="btn-hero-close"
                onClick={onClose}
                title="Close Dashboard (Esc)"
                aria-label="Close Dashboard"
              >
                ✕ Close
              </button>
            )}
          </div>
        </header>

        {/* ── CARD 2: PROGRESS & AT-A-GLANCE STANDING ── */}
        <section className="dashboard-progress-card">
          <div className="progress-card-header">
            <div className="progress-kicker-group">
              <span className="course-kicker">CURRICULUM OVERVIEW</span>
              <h2>Computer Systems Servicing (CSS) NC II</h2>
            </div>
            <div className="progress-pct-badge">
              <strong>{progressPct}%</strong>
              <span>Completed</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="dashboard-progress-track">
            <div className="dashboard-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>

          {/* Quick Stat Chips */}
          <div className="dashboard-stats-strip">
            <div className="stat-chip">
              <span className="stat-label">Topics Mastered</span>
              <strong>{completedCount} / {TOTAL_TOPICS_COUNT}</strong>
              <small>{progressPct}% Syllabus Mastered</small>
            </div>
            <div className="stat-chip highlight-chip">
              <span className="stat-label">Assessment Average Score</span>
              <strong>{standing.averagePercentage > 0 ? `${standing.averagePercentage}%` : "Pending"}</strong>
              <small>{standing.academicStanding || "CSS Formative Standard"}</small>
            </div>
            <div className="stat-chip">
              <span className="stat-label">Cumulative GWA</span>
              <strong>{standing.gwa !== "N/A" ? standing.gwa : "N/A"}</strong>
              <small>{passedModulesCount} of 7 Exams Passed</small>
            </div>
            <div className="stat-chip">
              <span className="stat-label">Dry Run Status</span>
              <strong style={{ fontSize: "14.5px" }}>
                {isDryRunComplete ? "Complete Dry Run" : "In Progress"}
              </strong>
              <small>{isCertEligible ? "Certificate Ready" : "Practicals Pending"}</small>
            </div>
          </div>

          {/* Up Next & Resume Action */}
          <div className="course-resume-banner">
            <div className="resume-info">
              <span className="resume-label">
                {isAllComplete ? "STATUS: COMPLETED" : "UP NEXT"}
              </span>
              <strong>
                {isAllComplete
                  ? `All ${TOTAL_TOPICS_COUNT} Topics and Hands-on Virtual Build Verified!`
                  : `Topic ${nextTopic.topicCode} · ${nextTopic.title}`}
              </strong>
            </div>
            <button
              type="button"
              className="btn-resume-course"
              onClick={() => handleResumeCourse(isAllComplete ? 0 : nextTopicIdx)}
            >
              {isAllComplete ? "Review Syllabus →" : "Continue Topic →"}
            </button>
          </div>
        </section>

        {/* ── CARD 3: 7 MODULES RECORD & EXAM SCORES (STREAMLINED & SCANABLE) ── */}
        <section className="dashboard-modules-card">
          <div className="modules-card-head">
            <div>
              <span className="course-kicker">COURSE MODULES &amp; EXAM SCORES</span>
              <h3>CSS NC II Assessment Summary</h3>
            </div>
            <span className="passing-cutoff-badge">75% Passing Cutoff</span>
          </div>

          <div className="streamlined-module-list">
            {CSS_CURRICULUM.map((mod) => {
              const record = quizRecords[mod.moduleNum];
              const hasRecord = !!record;
              const modCompletedTopics = mod.topics.filter((t) => completedTopics.includes(t.id));
              const modDoneCount = modCompletedTopics.length;
              const isModAllDone = modDoneCount === mod.topics.length;
              const firstTopicIdx = FLAT_TOPICS.findIndex((t) => t.moduleNum === mod.moduleNum);
              const targetIdx = firstTopicIdx !== -1 ? firstTopicIdx : 0;

              return (
                <div key={mod.id} className={`streamlined-module-row ${hasRecord && record.passed ? "is-passed" : ""}`}>
                  <div className="mod-row-left">
                    <span className="mod-badge">M{mod.moduleNum}</span>
                    <div className="mod-info">
                      <strong>{mod.title}</strong>
                      <span>{modDoneCount}/{mod.topics.length} Topics Completed</span>
                    </div>
                  </div>

                  <div className="mod-row-center">
                    {hasRecord ? (
                      <div className="mod-grade-pill">
                        <strong className={record.passed ? "text-emerald" : "text-rose"}>
                          {record.score}/{record.total} ({record.percentage}%)
                        </strong>
                        <span className="mod-grade-eq">Grade: {record.gradeEquivalent}</span>
                      </div>
                    ) : (
                      <span className="mod-not-taken">Exam Not Attempted</span>
                    )}
                  </div>

                  <div className="mod-row-right">
                    {hasRecord ? (
                      record.passed ? (
                        <span className="status-chip passed">Passed</span>
                      ) : (
                        <span className="status-chip failed">Retake Needed</span>
                      )
                    ) : isModAllDone ? (
                      <span className="status-chip ready">Ready for Exam</span>
                    ) : (
                      <span className="status-chip in-progress">In Progress</span>
                    )}

                    <div className="mod-action-group">
                      <button
                        type="button"
                        className="btn-mod-study"
                        onClick={() => handleResumeCourse(targetIdx)}
                        title={`Study Module ${mod.moduleNum}`}
                      >
                        Study
                      </button>
                      <button
                        type="button"
                        className="btn-mod-exam"
                        onClick={() => handleOpenQuiz(targetIdx, mod.moduleNum)}
                        title={`Take Module ${mod.moduleNum} Exam`}
                      >
                        {hasRecord ? "Retake" : "Exam"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── CARD 4: PRACTICAL LAB & CERTIFICATE SUMMARY ROW ── */}
        <div className="dashboard-bottom-grid">
          <div className="bottom-card">
            <div className="bottom-card-head">
              <span className="course-kicker">CAPSTONE PRACTICAL</span>
              <h4>Hands-On 3D Virtual PC Assembly &amp; Disassembly</h4>
            </div>
            <p className="bottom-card-desc">
              8-stage component assembly &amp; reverse teardown: standoffs, CPU, cooler, RAM, M.2 SSD, PSU, and GPU.
            </p>
            <div className="bottom-practical-badges">
              <span className={`status-pill-small ${isAssemblyDone || isAllLessonsDone ? "done" : "pending"}`}>
                {isAssemblyDone || isAllLessonsDone ? "✓ Assembly POST OK" : "Assembly Pending"}
              </span>
              <span className={`status-pill-small ${isDisassemblyDone || isAllLessonsDone ? "done" : "pending"}`}>
                {isDisassemblyDone || isAllLessonsDone ? "✓ Practical Build Verified" : "Disassembly Optional"}
              </span>
            </div>
            <div className="bottom-card-footer">
              <span className={`status-pill-small ${isAllLessonsDone ? "done" : "pending"}`}>
                {isAllLessonsDone ? "Practicals 100% Complete" : "Assembly Lab Required"}
              </span>
              <button type="button" className="btn-bottom-action" onClick={handleOpen3DLab}>
                {isAllLessonsDone ? "Review 3D Lab →" : "Launch 3D Lab →"}
              </button>
            </div>
          </div>

          <div className="bottom-card cert-card">
            <div className="bottom-card-head">
              <span className="course-kicker">OFFICIAL CREDENTIAL</span>
              <h4>Accredited PTC-IICT E-Certificate</h4>
            </div>
            <p className="bottom-card-desc">
              Institutional Certificate of Completion aligned to DepEd TVL &amp; TESDA CSS NC II standards.
            </p>

            {/* Curriculum prerequisite checklist */}
            <div className="cert-req-checklist">
              <div className={`cert-req-item ${isAllLessonsDone ? "is-met" : "is-pending"}`}>
                <span className="req-icon">{isAllLessonsDone ? "✓" : "○"}</span>
                <span>All 17 Curriculum Lessons ({completedCount}/17)</span>
              </div>
              <div className={`cert-req-item ${isAssemblyDone || isAllLessonsDone ? "is-met" : "is-pending"}`}>
                <span className="req-icon">{isAssemblyDone || isAllLessonsDone ? "✓" : "○"}</span>
                <span>Module 7: Hands-On 3D Virtual Assembly Lab</span>
              </div>
              <div className={`cert-req-item ${isAllLessonsDone ? "is-met" : "is-pending"}`}>
                <span className="req-icon">{isAllLessonsDone ? "✓" : "○"}</span>
                <span>CSS NC II Comprehensive Curriculum Mastery</span>
              </div>
            </div>

            <div className="bottom-card-footer">
              <span className={`status-pill-small ${isCertEligible ? "done" : "locked"}`}>
                {isCertEligible ? "✓ Complete Dry Run · Unlocked" : `Prerequisites Incomplete (${completedCount}/17)`}
              </span>
              <button
                type="button"
                className={`btn-bottom-action btn-claim-cert ${!isCertEligible ? "is-disabled" : ""}`}
                onClick={handleOpenCertificate}
                disabled={!isCertEligible}
                title={isCertEligible ? "Claim your accredited certificate" : "Complete all 17 topics across Modules 1–7 to unlock"}
              >
                {isCertEligible ? "Get Certificate →" : "Get Certificate (Locked)"}
              </button>
            </div>
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
