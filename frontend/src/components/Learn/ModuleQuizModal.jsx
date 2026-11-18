import React, { useState, useMemo, useEffect, useRef } from "react";
import soundManager from "../../utilities/soundManager";
import { getModuleQuiz, saveStudentQuizScore } from "./moduleQuizzes";
import "./ModuleQuizModal.css";

/**
 * ModuleQuizModal — 15-Question Comprehensive Academic Assessment
 * Aligned with DepEd Grade 11 CSS, TESDA NC II, and PTC-IICT Academic Standards
 *
 * Strict Proctoring / Lockdown Mechanism:
 * • Close button disabled & hidden during active exam
 * • Esc key intercepted & disabled
 * • Navigation / beforeunload guarded to prevent abandoning exam
 * • Student CANNOT leave or go back anywhere until exam is completed & submitted
 */

/** Slide-to-confirm gate shown before the no-exit assessment begins. */
function SlideToStartGate({ moduleNum, moduleTitle, questionCount, onStart, onCancel }) {
  const trackRef = useRef(null);
  const progressRef = useRef(0);
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);

  const setSlideProgress = (value) => {
    const clamped = Math.min(1, Math.max(0, value));
    progressRef.current = clamped;
    setProgress(clamped);
  };

  const progressFromClientX = (clientX) => {
    const track = trackRef.current;
    if (!track) return 0;
    const rect = track.getBoundingClientRect();
    const knobWidth = 52;
    const travel = Math.max(1, rect.width - knobWidth - 8);
    return (clientX - rect.left - 4 - knobWidth / 2) / travel;
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    setDragging(true);
    if (e.currentTarget.setPointerCapture) {
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    setSlideProgress(progressFromClientX(e.clientX));
  };

  const handlePointerMove = (e) => {
    if (!dragging) return;
    setSlideProgress(progressFromClientX(e.clientX));
  };

  const finishDrag = () => {
    if (!dragging) return;
    setDragging(false);
    if (progressRef.current >= 0.9) {
      setSlideProgress(1);
      try { soundManager.snap(); } catch { }
      onStart();
    } else {
      setSlideProgress(0);
    }
  };

  // Esc can still dismiss the gate — lockdown is not active yet.
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && onCancel) onCancel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <div className="mqm-start-overlay" role="dialog" aria-modal="true">
      <div className="mqm-start-card animate-pop-in">
        <span className="mqm-start-kicker">
          MODULE {moduleNum} // FORMATIVE ASSESSMENT
        </span>
        <h2 className="mqm-start-title">Start Formative Assessment</h2>
        <p className="mqm-start-desc">
          You are about to begin the secure {questionCount}-item assessment for{" "}
          <strong>{moduleTitle}</strong>.
        </p>

        <ul className="mqm-start-rules">
          <li>Once you start, you cannot exit or go back until you submit.</li>
          <li>Answers are locked after submission and recorded to your academic transcript.</li>
          <li>Make sure you are ready before continuing.</li>
        </ul>

        <div
          ref={trackRef}
          className={`mqm-slide-track ${dragging ? "is-dragging" : ""} ${progress >= 1 ? "is-complete" : ""}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
        >
          <div className="mqm-slide-fill" style={{ width: `${progress * 100}%` }} />
          <span className="mqm-slide-label">
            {progress >= 1 ? "Starting assessment…" : "Slide to confirm & start"}
          </span>
          <div
            className="mqm-slide-knob"
            style={{ left: `calc(4px + ${progress} * (100% - 60px))` }}
          >
            →
          </div>
        </div>

        <button type="button" className="mqm-start-cancel" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function ModuleQuizModal({
  isOpen = false,
  moduleNum = 2,
  userEmail = null,
  onClose,
  onOpenDashboard,
  onNextModule
}) {
  const quizData = useMemo(() => getModuleQuiz(moduleNum), [moduleNum]);
  const questions = quizData.questions || [];

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [examResult, setExamResult] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  // Gate: the exam / lockdown only begins after the student slides to confirm.
  const [examStarted, setExamStarted] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setExamStarted(false);
    }
  }, [isOpen]);

  // HARD CODED MONITORING / LOCKDOWN MECHANISM
  useEffect(() => {
    if (!isOpen || !examStarted || isSubmitted) return;

    // 1. Prevent accidental window / tab close or reload
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "15-Item Assessment in progress. Your progress will be lost if you leave.";
      return e.returnValue;
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    // 2. Intercept and block Esc key dismissal
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        try { soundManager.warning(); } catch {}
      }
    };
    window.addEventListener("keydown", handleKeyDown, true);

    // 3. Intercept browser back button / history popstate
    const handlePopState = (e) => {
      e.preventDefault();
      window.history.pushState(null, "", window.location.href);
      try { soundManager.warning(); } catch {}
    };
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isOpen, examStarted, isSubmitted]);

  if (!isOpen) return null;

  // ── SLIDE-TO-CONFIRM GATE (before the no-exit exam begins) ──
  if (!examStarted) {
    return (
      <SlideToStartGate
        moduleNum={moduleNum}
        moduleTitle={quizData.moduleTitle}
        questionCount={questions.length}
        onStart={() => setExamStarted(true)}
        onCancel={onClose}
      />
    );
  }

  const currentQ = questions[currentQIndex] || questions[0];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPct = Math.round((answeredCount / totalQuestions) * 100);

  const handleSelectOption = (optIndex) => {
    if (isSubmitted) return;
    try { soundManager.click(); } catch {}
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQIndex]: optIndex
    }));
  };

  const handleNext = () => {
    try { soundManager.click(); } catch {}
    if (currentQIndex < totalQuestions - 1) {
      setCurrentQIndex((i) => i + 1);
    }
  };

  const handlePrev = () => {
    try { soundManager.click(); } catch {}
    if (currentQIndex > 0) {
      setCurrentQIndex((i) => i - 1);
    }
  };

  const handleSubmitExam = () => {
    try { soundManager.snap(); } catch {}

    // Calculate score
    let score = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        score++;
      }
    });

    const result = saveStudentQuizScore({
      email: userEmail,
      moduleNum,
      score,
      total: totalQuestions,
      answers: selectedAnswers
    });

    if (result && result.passed) {
      try { soundManager.granted(); } catch {}
    } else {
      try { soundManager.warning(); } catch {}
    }

    setExamResult(result);
    setIsSubmitted(true);
  };

  const handleRetake = () => {
    try { soundManager.click(); } catch {}
    setSelectedAnswers({});
    setIsSubmitted(false);
    setExamResult(null);
    setCurrentQIndex(0);
  };

  return (
    <div className="module-quiz-overlay" role="dialog" aria-modal="true">
      <div className="module-quiz-card animate-pop-in">
        {/* ── TOP HEADER ── */}
        <header className="quiz-header">
          <div className="quiz-header-info">
            <span className="quiz-kicker">
              MODULE {moduleNum} // 15-ITEM ACADEMIC ASSESSMENT
            </span>
            <h2 className="quiz-module-title">{quizData.moduleTitle}</h2>
          </div>

          {/* If NOT submitted: show secure lockdown pill. Once submitted: show close X */}
          {!isSubmitted ? (
            <div className="quiz-lockdown-badge" title="Lockdown active: finish and submit the exam to exit">
              <span className="lockdown-pulse-dot" />
              <span>SECURE EXAM LOCKDOWN</span>
            </div>
          ) : (
            <button
              type="button"
              className="quiz-close-x"
              onClick={onClose}
              aria-label="Close Quiz"
              title="Close and return to lessons"
            >
              ×
            </button>
          )}
        </header>

        {/* ── EXAM IN PROGRESS VIEW ── */}
        {!isSubmitted ? (
          <>
            {/* PROGRESS TRACKER */}
            <div className="quiz-progress-bar-wrap">
              <div className="quiz-progress-text-row">
                <span className="q-counter">
                  Question <strong>{currentQIndex + 1}</strong> of {totalQuestions}
                </span>
                <span className="q-answered-count">
                  {answeredCount} of {totalQuestions} Answered ({progressPct}%)
                </span>
              </div>
              <div className="quiz-track">
                <div className="quiz-fill" style={{ width: `${progressPct}%` }} />
              </div>
            </div>

            {/* QUESTION JUMP PILLS */}
            <div className="quiz-jump-pills">
              {questions.map((_, idx) => {
                const isAnswered = selectedAnswers[idx] !== undefined;
                const isCurrent = idx === currentQIndex;
                return (
                  <button
                    key={idx}
                    type="button"
                    className={`q-pill ${isCurrent ? "is-current" : ""} ${
                      isAnswered ? "is-answered" : ""
                    }`}
                    onClick={() => {
                      try { soundManager.click(); } catch {}
                      setCurrentQIndex(idx);
                    }}
                    title={`Jump to Question ${idx + 1}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* ACTIVE QUESTION CONTAINER */}
            <div className="quiz-question-body">
              <div className="q-category-tag">{currentQ.category}</div>
              <h3 className="q-text">{currentQ.question}</h3>

              <div className="q-options-list">
                {currentQ.options.map((optionText, optIdx) => {
                  const isSelected = selectedAnswers[currentQIndex] === optIdx;
                  const letter = String.fromCharCode(65 + optIdx); // A, B, C, D
                  return (
                    <button
                      key={optIdx}
                      type="button"
                      className={`q-option-btn ${isSelected ? "is-selected" : ""}`}
                      onClick={() => handleSelectOption(optIdx)}
                    >
                      <span className="q-opt-letter">{letter}</span>
                      <span className="q-opt-text">{optionText}</span>
                      <span className="q-opt-radio" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* BOTTOM NAV FOOTER */}
            <footer className="quiz-footer">
              <button
                type="button"
                className="q-btn-nav q-btn-prev"
                disabled={currentQIndex === 0}
                onClick={handlePrev}
              >
                ← Previous
              </button>

              <div className="quiz-footer-actions">
                {currentQIndex < totalQuestions - 1 ? (
                  <button
                    type="button"
                    className="q-btn-nav q-btn-next"
                    onClick={handleNext}
                  >
                    Next Question →
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="q-btn-submit"
                      onClick={() => {
                        try { soundManager.snap(); } catch {}
                        setShowConfirmModal(true);
                      }}
                    >
                      ✓ Submit 15-Item Exam
                    </button>

                    {showConfirmModal && (
                      <div className="mqm-inline-confirm animate-fade-in">
                        <div className="mqm-inline-confirm-copy">
                          <strong>Review your exam before submitting</strong>
                          <span>
                            {answeredCount === totalQuestions
                              ? `✓ All ${totalQuestions} questions answered`
                              : `⚠ ${totalQuestions - answeredCount} unanswered — go back if needed`}
                          </span>
                        </div>
                        <div className="mqm-inline-confirm-actions">
                          <button
                            type="button"
                            className="btn-confirm-cancel"
                            onClick={() => setShowConfirmModal(false)}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="btn-confirm-finalize"
                            onClick={() => {
                              setShowConfirmModal(false);
                              handleSubmitExam();
                            }}
                          >
                            ✓ Confirm Submission
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </footer>
          </>
        ) : (
          /* ── POST-SUBMISSION RESULTS VIEW ── */
          <div className="quiz-results-container animate-fade-in">
            <div className={`quiz-score-banner ${examResult?.passed ? "passed" : "failed"}`}>
              <div className="score-badge-circle">
                <span className="score-number">{examResult?.score}</span>
                <span className="score-total">/ {examResult?.total}</span>
              </div>

              <div className="score-details-block">
                <div className="score-percentage-row">
                  <span className="pct-tag">{examResult?.percentage}% SCORE</span>
                  <span className={`status-badge ${examResult?.passed ? "passed" : "failed"}`}>
                    {examResult?.passed ? "✓ PASSED (DepEd/TESDA Standard)" : "✕ RETAKE REQUIRED (< 75%)"}
                  </span>
                </div>
                <h3>{examResult?.qualitativeRating}</h3>
                <p>
                  Official Equivalent Grade: <strong>{examResult?.gradeEquivalent}</strong> (Transcribed to Student SIS Record).
                  Recorded on {examResult?.dateFormatted}.
                </p>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="quiz-post-actions">
              <button
                type="button"
                className="q-action-btn btn-dashboard"
                onClick={() => {
                  try { soundManager.snap(); } catch {}
                  if (onOpenDashboard) onOpenDashboard();
                  onClose();
                }}
              >
                View in Student Learner Portal &amp; Gradebook →
              </button>

              <button
                type="button"
                className="q-action-btn btn-retake"
                onClick={handleRetake}
              >
                ↺ Retake Assessment
              </button>

              {examResult?.passed && onNextModule && (
                <button
                  type="button"
                  className="q-action-btn btn-next-mod"
                  onClick={() => {
                    try { soundManager.click(); } catch {}
                    onNextModule();
                    onClose();
                  }}
                >
                  Proceed to Next Module →
                </button>
              )}
            </div>

            {/* DETAILED ANSWER KEY REVIEW */}
            <div className="quiz-review-section">
              <h4>Comprehensive Answer Key &amp; Technical Explanations</h4>
              <div className="review-questions-list">
                {questions.map((q, idx) => {
                  const studentAns = selectedAnswers[idx];
                  const isCorrect = studentAns === q.correctIndex;
                  return (
                    <div
                      key={idx}
                      className={`review-card ${isCorrect ? "is-correct" : "is-wrong"}`}
                    >
                      <div className="review-card-head">
                        <span className="review-q-num">Item #{idx + 1}</span>
                        <span className={`review-badge ${isCorrect ? "correct" : "wrong"}`}>
                          {isCorrect ? "✓ Correct" : "✕ Incorrect"}
                        </span>
                      </div>
                      <p className="review-q-text">{q.question}</p>
                      <div className="review-choices">
                        <div className="choice-row correct-choice">
                          <strong>Correct Answer:</strong> {q.options[q.correctIndex]}
                        </div>
                        {!isCorrect && studentAns !== undefined && (
                          <div className="choice-row student-choice">
                            <strong>Your Answer:</strong> {q.options[studentAns]}
                          </div>
                        )}
                      </div>
                      <div className="review-explanation">
                        <strong>Technical Rationale:</strong> {q.explanation}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
