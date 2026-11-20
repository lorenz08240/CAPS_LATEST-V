import React, { useState, useMemo, useEffect, useRef } from "react";
import soundManager from "../../utilities/soundManager";
import { getModuleQuiz, saveStudentQuizScore, getStudentQuizRecords } from "./moduleQuizzes";
import "./ModuleQuizModal.css";

/**
 * ModuleQuizModal — 15-Question Comprehensive Academic Assessment
 * Aligned with DepEd Grade 11 CSS, TESDA NC II, and PTC-IICT Academic Standards
 *
 * Craftsmanship & Anti-Slop Principles:
 * • Seamless 2-stage submission: initial click activates soft prompt warning,
 *   subsequent 2-second hold executes submission.
 * • Pure reset upon early release: zero nagging popups or spam prompts.
 * • Theme-adaptive obsidian charcoal & warm gold palette matching BuildLab.
 * • Zero generic emoji clutter; crisp SVG icons and accessible contrast.
 */

/** Slide-to-confirm gate shown before the active assessment begins. */
function SlideToStartGate({ moduleNum, moduleTitle, questionCount, theme, onStart, onCancel }) {
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
      try { soundManager.snap(); } catch {}
      onStart();
    } else {
      setSlideProgress(0);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && onCancel) onCancel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <div className={`mqm-start-overlay theme-${theme || "dark"}`} role="dialog" aria-modal="true">
      <div className="mqm-start-card animate-pop-in">
        <span className="mqm-start-kicker">
          MODULE {moduleNum} · FORMATIVE ASSESSMENT
        </span>
        <h2 className="mqm-start-title">Start Formative Assessment</h2>
        <p className="mqm-start-desc">
          You are about to begin the {questionCount}-item assessment for{" "}
          <strong>{moduleTitle}</strong>.
        </p>

        <ul className="mqm-start-rules">
          <li>Complete all questions before submitting your assessment.</li>
          <li>Your submission is transcribed directly to your student record.</li>
          <li>Review questions and technical rationales upon completion.</li>
        </ul>

        <div
          ref={trackRef}
          className={`mqm-slide-track ${dragging ? "is-dragging" : ""} ${progress >= 1 ? "is-complete" : ""}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
          role="slider"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          aria-label="Slide to confirm assessment start"
        >
          <div className="mqm-slide-fill" style={{ width: `${progress * 100}%` }} />
          <span className="mqm-slide-label">
            {progress >= 1 ? "Starting assessment…" : "Slide to confirm & start"}
          </span>
          <div
            className="mqm-slide-knob"
            style={{ left: `calc(4px + ${progress} * (100% - 60px))` }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </div>

        <div className="mqm-start-actions-row">
          <button
            type="button"
            className="mqm-start-btn-direct"
            onClick={() => {
              try { soundManager.snap(); } catch {}
              onStart();
            }}
          >
            Start Assessment Now →
          </button>
          <button type="button" className="mqm-start-cancel" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ModuleQuizModal({
  isOpen = false,
  moduleNum = 2,
  userEmail = null,
  theme = "dark",
  onClose,
  onOpenDashboard,
  onNextModule,
  onCompleteCourse
}) {
  const quizData = useMemo(() => getModuleQuiz(moduleNum), [moduleNum]);
  const questions = quizData.questions || [];
  const isLastModule = moduleNum >= 7;

  const getSavedRecord = () => {
    try {
      const email =
        userEmail ||
        (() => {
          try {
            const raw = localStorage.getItem("buildlab_user_profile");
            return raw ? JSON.parse(raw)?.email : null;
          } catch {
            return null;
          }
        })();
      const records = getStudentQuizRecords(email);
      const guestRecords = getStudentQuizRecords(null);
      return (records && records[moduleNum]) || (guestRecords && guestRecords[moduleNum]) || null;
    } catch {
      return null;
    }
  };

  const initialRecord = useMemo(() => getSavedRecord(), [moduleNum, userEmail]);

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState(() => initialRecord?.answers || {});
  const [examResult, setExamResult] = useState(() => initialRecord);
  const [isSubmitted, setIsSubmitted] = useState(() => !!initialRecord);
  const [examStarted, setExamStarted] = useState(() => !!initialRecord);

  // 2-Stage Confirmation & 2-Second Hold-to-Submit
  const [submitStage, setSubmitStage] = useState("initial"); // "initial" | "review"
  const [holdProgress, setHoldProgress] = useState(0); // 0 to 1
  const holdStartTimeRef = useRef(null);
  const holdRafRef = useRef(null);
  const isHoldingRef = useRef(false);

  // Reset states on modal open/close or question index navigation
  useEffect(() => {
    if (!isOpen) {
      setExamStarted(false);
      setIsSubmitted(false);
      setExamResult(null);
      setSelectedAnswers({});
      setCurrentQIndex(0);
      setSubmitStage("initial");
      setHoldProgress(0);
    } else {
      try {
        const email =
          userEmail ||
          (() => {
            try {
              const raw = localStorage.getItem("buildlab_user_profile");
              return raw ? JSON.parse(raw)?.email : null;
            } catch {
              return null;
            }
          })();
        const records = getStudentQuizRecords(email);
        const guestRecords = getStudentQuizRecords(null);
        const existing = (records && records[moduleNum]) || (guestRecords && guestRecords[moduleNum]);
        if (existing) {
          setExamResult(existing);
          if (existing.answers) setSelectedAnswers(existing.answers);
          setIsSubmitted(true);
          setExamStarted(true);
        }
      } catch {}
    }
  }, [isOpen, moduleNum, userEmail]);

  useEffect(() => {
    setSubmitStage("initial");
    setHoldProgress(0);
  }, [currentQIndex]);

  useEffect(() => {
    return () => {
      if (holdRafRef.current) cancelAnimationFrame(holdRafRef.current);
    };
  }, []);

  // Proctoring / Navigation protection during active exam
  useEffect(() => {
    if (!isOpen || !examStarted || isSubmitted) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "Assessment in progress. Progress will be lost if you leave.";
      return e.returnValue;
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        try { soundManager.warning(); } catch {}
      }
    };
    window.addEventListener("keydown", handleKeyDown, true);

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

  if (!examStarted) {
    return (
      <SlideToStartGate
        moduleNum={moduleNum}
        moduleTitle={quizData.moduleTitle}
        questionCount={questions.length}
        theme={theme}
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
    setSubmitStage("initial");
    setHoldProgress(0);
  };

  // Hold-to-Submit handlers
  const cancelHold = () => {
    if (!isHoldingRef.current && holdProgress === 0) return;
    isHoldingRef.current = false;
    if (holdRafRef.current) {
      cancelAnimationFrame(holdRafRef.current);
      holdRafRef.current = null;
    }
    setHoldProgress(0);
    // Silent reset: zero nagging prompts on release per /antislop-human principles
  };

  const startHold = (e) => {
    if (e && e.button !== undefined && e.button !== 0) return;
    if (isHoldingRef.current) return;
    isHoldingRef.current = true;
    holdStartTimeRef.current = performance.now();
    const duration = 2000; // 2 seconds hold requirement

    const tick = (now) => {
      if (!isHoldingRef.current) return;
      const elapsed = now - holdStartTimeRef.current;
      const pct = Math.min(1, elapsed / duration);
      setHoldProgress(pct);

      if (pct >= 1) {
        isHoldingRef.current = false;
        setHoldProgress(1);
        if (holdRafRef.current) {
          cancelAnimationFrame(holdRafRef.current);
          holdRafRef.current = null;
        }
        handleSubmitExam();
      } else {
        holdRafRef.current = requestAnimationFrame(tick);
      }
    };

    holdRafRef.current = requestAnimationFrame(tick);
  };

  const handleInitialClick = () => {
    try { soundManager.click(); } catch {}
    setSubmitStage("review");
  };

  const handleKeyDownHold = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      if (submitStage === "initial") {
        e.preventDefault();
        handleInitialClick();
      } else if (submitStage === "review" && !e.repeat && !isHoldingRef.current) {
        e.preventDefault();
        startHold(e);
      }
    }
  };

  const handleKeyUpHold = (e) => {
    if ((e.key === "Enter" || e.key === " ") && submitStage === "review") {
      e.preventDefault();
      cancelHold();
    }
  };

  const handleRetake = () => {
    try { soundManager.click(); } catch {}
    setSelectedAnswers({});
    setIsSubmitted(false);
    setExamResult(null);
    setCurrentQIndex(0);
    setSubmitStage("initial");
    setHoldProgress(0);
  };

  return (
    <div className={`module-quiz-overlay theme-${theme || "dark"}`} role="dialog" aria-modal="true">
      <div className="module-quiz-card animate-pop-in">
        {/* ── TOP HEADER ── */}
        <header className="quiz-header">
          <div className="quiz-header-info">
            <span className="quiz-kicker">
              MODULE {moduleNum} · ACADEMIC ASSESSMENT
            </span>
            <h2 className="quiz-module-title">{quizData.moduleTitle}</h2>
          </div>

          {isSubmitted ? (
            <button
              type="button"
              className={`quiz-header-next-btn ${isLastModule ? "is-complete-btn" : ""}`}
              onClick={() => {
                try { soundManager.snap(); } catch {}
                if (isLastModule) {
                  if (onCompleteCourse) onCompleteCourse();
                  else if (onOpenDashboard) onOpenDashboard();
                } else {
                  if (onNextModule) onNextModule();
                }
                onClose();
              }}
              title={isLastModule ? "Complete course and view student profile overview" : "Proceed to next module"}
            >
              <span>{isLastModule ? "Complete" : "Go to Next Module"}</span>
              {isLastModule ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              )}
            </button>
          ) : (
            <div className="quiz-lockdown-badge" title="Active Assessment: Complete all items to submit">
              <span className="lockdown-pulse-dot" />
              <span>Proctored Session · 15 Items</span>
            </div>
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
                  const letter = String.fromCharCode(65 + optIdx);
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
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                <span>Previous</span>
              </button>

              <div className="quiz-footer-actions">
                {currentQIndex < totalQuestions - 1 ? (
                  <button
                    type="button"
                    className="q-btn-nav q-btn-next"
                    onClick={handleNext}
                  >
                    <span>Next Question</span>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                ) : (
                  <div className="quiz-submit-cluster">
                    {submitStage === "review" && (
                      <div className="mqm-soft-prompt animate-slide-in" role="status" aria-live="polite">
                        <span className="mqm-soft-icon" aria-hidden="true">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                          </svg>
                        </span>
                        <span className="mqm-soft-text">
                          {answeredCount < totalQuestions
                            ? `${totalQuestions - answeredCount} unanswered: review answers or hold to submit`
                            : "Review your answers before submitting"}
                        </span>
                        <button
                          type="button"
                          className="mqm-soft-dismiss"
                          onClick={() => {
                            try { soundManager.click(); } catch {}
                            setSubmitStage("initial");
                            setHoldProgress(0);
                          }}
                          title="Dismiss review prompt"
                        >
                          Dismiss
                        </button>
                      </div>
                    )}

                    {submitStage === "initial" ? (
                      <button
                        type="button"
                        className="q-btn-submit q-btn-submit-initial"
                        onClick={handleInitialClick}
                        title="Click to review and unlock submission"
                      >
                        <span>Submit Assessment</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className={`q-btn-submit q-btn-submit-hold ${holdProgress > 0 ? "is-holding" : ""}`}
                        onPointerDown={startHold}
                        onPointerUp={cancelHold}
                        onPointerLeave={cancelHold}
                        onPointerCancel={cancelHold}
                        onKeyDown={handleKeyDownHold}
                        onKeyUp={handleKeyUpHold}
                        title="Hold button for 2 seconds to finalize submission"
                        aria-label="Hold for 2 seconds to submit assessment"
                      >
                        <span
                          className="q-hold-progress-fill"
                          style={{ width: `${Math.round(holdProgress * 100)}%` }}
                        />
                        <span className="q-hold-btn-content">
                          <span className="q-hold-icon" aria-hidden="true">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </span>
                          <span className="q-hold-label">
                            {holdProgress > 0 ? "Holding to Submit…" : "Hold 2s to Submit"}
                          </span>
                        </span>
                      </button>
                    )}
                  </div>
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
                    {examResult?.passed ? "Passed · DepEd/TESDA Standard" : "Retake Recommended (< 75%)"}
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
                <span>Student Gradebook &amp; Portal</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>

              <button
                type="button"
                className="q-action-btn btn-retake"
                onClick={handleRetake}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 2v6h6" />
                  <path d="M21 12A9 9 0 0 0 6 5.3L3 8" />
                  <path d="M21 22v-6h-6" />
                  <path d="M3 12a9 9 0 0 0 15 6.7l3-2.7" />
                </svg>
                <span>Retake Assessment</span>
              </button>

              {(onNextModule || onCompleteCourse || isLastModule) && (
                <button
                  type="button"
                  className={`q-action-btn btn-next-mod ${isLastModule ? "is-complete-btn" : ""}`}
                  onClick={() => {
                    try { soundManager.snap(); } catch {}
                    if (isLastModule) {
                      if (onCompleteCourse) onCompleteCourse();
                      else if (onOpenDashboard) onOpenDashboard();
                    } else {
                      if (onNextModule) onNextModule();
                    }
                    onClose();
                  }}
                  title={isLastModule ? "Complete course and view student profile overview" : "Proceed to next module"}
                >
                  <span>{isLastModule ? "Complete" : "Go to Next Module"}</span>
                  {isLastModule ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  )}
                </button>
              )}
            </div>

            {/* DETAILED ANSWER KEY REVIEW */}
            <div className="quiz-review-section">
              <h4>Technical Review &amp; Rationale Key</h4>
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
                          {isCorrect ? "Correct" : "Incorrect"}
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
