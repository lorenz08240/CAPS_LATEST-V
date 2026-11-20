import React, { useCallback, useEffect, useRef, useState } from "react";
import soundManager from "../../utilities/soundManager";
import { getLessonModuleContent } from "./lessonModuleContent";
import "./LessonPresentationView.css";

/**
 * LessonPresentationView — 2-page lesson curriculum.
 *
 * Page 1: one continuous, PDF-syllabus-style module (no split cards).
 * Page 2: YouTube lecture with our own controls (no native YouTube UI)
 *         plus a bulleted summary aligned to the current topic.
 *
 * Every topic in CSS_CURRICULUM is rendered by this same component,
 * so the curriculum looks and behaves consistently across all lessons.
 */

/* ── YouTube IFrame API (single shared promise) ── */
let ytApiPromise = null;
const loadYouTubeApi = () => {
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
  if (!ytApiPromise) {
    ytApiPromise = new Promise((resolve) => {
      const prevReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevReady) prevReady();
        resolve(window.YT);
      };
      if (!document.querySelector('script[data-lp-yt-api="1"]')) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        tag.dataset.lpYtApi = "1";
        document.head.appendChild(tag);
      }
    });
  }
  return ytApiPromise;
};

const fmtTime = (s) => {
  const t = Math.max(0, Math.floor(s || 0));
  const m = Math.floor(t / 60);
  return `${m}:${String(t % 60).padStart(2, "0")}`;
};

const PLAYBACK_RATES = [1, 1.25, 1.5, 2, 0.75];

// A topic is only marked watched once 90% of the lecture has actually played.
// Seeking stays locked until then so the lesson cannot be skipped.
const VIDEO_WATCH_THRESHOLD = 0.9;

/* ═══════════════════════════════════════════════════════════════════
   Custom video player — YouTube IFrame API with controls:0 and a
   fully in-house control deck (play, seek, skip, volume, speed).
   ═══════════════════════════════════════════════════════════════════ */
function CustomVideoPlayer({ videoId, title, watched = false, onWatched }) {
  const mountRef = useRef(null);
  const playerRef = useRef(null);
  const barRef = useRef(null);
  const draggingRef = useRef(false);
  const durationRef = useRef(0);
  const maxWatchedRef = useRef(0);
  const reportedRef = useRef(false);
  const onWatchedRef = useRef(onWatched);

  useEffect(() => {
    onWatchedRef.current = onWatched;
  }, [onWatched]);

  const seekLocked = !watched && maxWatchedRef.current < VIDEO_WATCH_THRESHOLD;

  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [rate, setRate] = useState(1);
  const [theater, setTheater] = useState(false);
  const [watchPct, setWatchPct] = useState(0);

  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  /* Create / destroy the underlying YouTube player when the topic changes. */
  useEffect(() => {
    if (!videoId || !mountRef.current) return undefined;
    let dead = false;

    setReady(false);
    setError(false);
    setStarted(false);
    setPlaying(false);
    setBuffering(false);
    setCurrent(0);
    setDuration(0);
    setMuted(false);
    setVolume(80);
    setRate(1);
    maxWatchedRef.current = 0;
    reportedRef.current = Boolean(watched);
    setWatchPct(0);

    const host = document.createElement("div");
    host.className = "lp-yt-host";
    mountRef.current.appendChild(host);

    loadYouTubeApi().then((YT) => {
      if (dead) return;
      try {
        playerRef.current = new YT.Player(host, {
          videoId,
          width: "100%",
          height: "100%",
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            rel: 0,
            playsinline: 1,
            iv_load_policy: 3,
            cc_load_policy: 0,
            origin: window.location.origin,
          },
          events: {
            onReady: (e) => {
              if (dead) return;
              e.target.setVolume(80);
              e.target.setPlaybackRate(1);
              try {
                e.target.unloadModule?.("captions");
                e.target.setOption?.("captions", "track", {});
              } catch {}
              setDuration(e.target.getDuration() || 0);
              setReady(true);
            },
            onStateChange: (e) => {
              if (dead) return;
              if (e.data === 1) {
                setPlaying(true);
                setStarted(true);
                setBuffering(false);
              } else if (e.data === 2) {
                setPlaying(false);
                setBuffering(false);
              } else if (e.data === 3) {
                setBuffering(true);
              } else if (e.data === 0) {
                setPlaying(false);
                setBuffering(false);
                setCurrent(e.target.getDuration?.() || durationRef.current || 0);
                if (!reportedRef.current) {
                  reportedRef.current = true;
                  onWatchedRef.current?.();
                }
              } else {
                setBuffering(false);
              }
            },
            onError: () => {
              if (!dead) setError(true);
            },
          },
        });
      } catch {
        if (!dead) setError(true);
      }
    });

    return () => {
      dead = true;
      try {
        playerRef.current?.destroy?.();
      } catch {}
      playerRef.current = null;
      host.remove();
    };
  }, [videoId]);

  /* Progress ticker */
  useEffect(() => {
    if (!ready) return undefined;
    const tick = setInterval(() => {
      const p = playerRef.current;
      if (!p?.getCurrentTime) return;
      try {
        const t = p.getCurrentTime() || 0;
        setCurrent(t);
        const d = p.getDuration();
        if (d && Math.abs(d - durationRef.current) > 0.5) {
          durationRef.current = d;
          setDuration(d);
        }
        if (d > 0) {
          const ratio = Math.min(1, t / d);
          if (ratio > maxWatchedRef.current) maxWatchedRef.current = ratio;
          setWatchPct(Math.round(maxWatchedRef.current * 100));
          if (
            !reportedRef.current &&
            (maxWatchedRef.current >= VIDEO_WATCH_THRESHOLD || ratio >= 0.995)
          ) {
            reportedRef.current = true;
            onWatchedRef.current?.();
          }
        }
      } catch {}
    }, 250);
    return () => clearInterval(tick);
  }, [ready]);

  const togglePlay = useCallback(() => {
    const p = playerRef.current;
    if (!p || error) return;
    try {
      soundManager.click();
    } catch {}
    if (playing) p.pauseVideo();
    else p.playVideo();
  }, [playing, error]);

  const seekBy = (delta) => {
    if (seekLocked) return;
    const p = playerRef.current;
    if (!p?.getCurrentTime) return;
    const t = p.getCurrentTime() || 0;
    p.seekTo(Math.max(0, Math.min(durationRef.current || Infinity, t + delta)), true);
    try {
      soundManager.click();
    } catch {}
  };

  const replay = () => {
    const p = playerRef.current;
    if (!p) return;
    p.seekTo(0, true);
    p.playVideo();
  };

  const seekFromPointer = (e) => {
    if (seekLocked || !barRef.current || !durationRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    if (rect.width <= 0) return;
    const frac = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    playerRef.current?.seekTo(frac * durationRef.current, true);
  };

  const onBarDown = (e) => {
    if (!ready || error || seekLocked) return;
    draggingRef.current = true;
    barRef.current?.setPointerCapture?.(e.pointerId);
    seekFromPointer(e);
  };
  const onBarMove = (e) => {
    if (draggingRef.current) seekFromPointer(e);
  };
  const onBarUp = (e) => {
    draggingRef.current = false;
    try {
      barRef.current?.releasePointerCapture?.(e.pointerId);
    } catch {}
  };
  const onBarKey = (e) => {
    if (seekLocked) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      seekBy(5);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      seekBy(-5);
    }
  };

  const toggleMute = () => {
    const p = playerRef.current;
    if (!p) return;
    if (muted) {
      p.unMute();
      p.setVolume(volume || 80);
      setMuted(false);
    } else {
      p.mute();
      setMuted(true);
    }
  };

  const changeVolume = (e) => {
    const v = Number(e.target.value);
    const p = playerRef.current;
    setVolume(v);
    if (!p || !Number.isFinite(v)) return;
    p.setVolume(v);
    if (v > 0) {
      p.unMute();
      setMuted(false);
    } else {
      p.mute();
      setMuted(true);
    }
  };

  const cycleRate = () => {
    const p = playerRef.current;
    if (!p) return;
    const next = PLAYBACK_RATES[(PLAYBACK_RATES.indexOf(rate) + 1) % PLAYBACK_RATES.length];
    setRate(next);
    p.setPlaybackRate(next);
  };

  const pct = duration ? Math.min(100, (current / duration) * 100) : 0;
  const ended = started && !playing && duration > 0 && current >= duration - 1.5;

  return (
    <div className={`lp-player ${theater ? "is-theater" : ""}`}>
      <div className="lp-player-stage">
        <div className="lp-player-frame" ref={mountRef} />

        {!ready && !error && <div className="lp-player-loading">Loading lesson video…</div>}

        {error && (
          <div className="lp-player-error">
            <span>This video could not be loaded.</span>
            <a href={`https://www.youtube.com/watch?v=${videoId}`} target="_blank" rel="noopener noreferrer">
              Open on YouTube ↗
            </a>
            {!watched && (
              <button type="button" className="lp-watch-fallback" onClick={() => {
                reportedRef.current = true;
                onWatchedRef.current?.();
              }}>
                Mark as reviewed (video unavailable)
              </button>
            )}
          </div>
        )}

        {ready && !started && !error && (
          <button type="button" className="lp-big-play" onClick={togglePlay} aria-label="Play lesson video">
            <span className="lp-big-play-icon">▶</span>
            <span className="lp-big-play-label">Play lecture video</span>
          </button>
        )}

        {buffering && ready && started && <div className="lp-player-spinner" aria-label="Buffering" />}

        <div className="lp-player-watermark" aria-hidden="true">BUILDLAB // CSS NC II</div>

        {!watched && !error && (
          <div className="lp-watch-lock">
            <span>🔒 Seek locked · watch {Math.round(VIDEO_WATCH_THRESHOLD * 100)}% ({watchPct}%)</span>
          </div>
        )}
        {watched && <div className="lp-watch-done">✓ Lecture watched</div>}
      </div>

      {/* Our own controls — no native YouTube control bar */}
      <div className="lp-controls">
        <button
          type="button"
          className="lp-ctrl lp-ctrl-play"
          onClick={ended ? replay : togglePlay}
          disabled={!ready || error}
          title={ended ? "Replay video" : playing ? "Pause" : "Play"}
        >
          {ended ? "↻" : playing ? "❚❚" : "▶"}
        </button>
        <button type="button" className="lp-ctrl" onClick={() => seekBy(-10)} disabled={!ready || error || seekLocked} title="Back 10 seconds">
          ↶10
        </button>
        <button type="button" className="lp-ctrl" onClick={() => seekBy(10)} disabled={!ready || error || seekLocked} title="Forward 10 seconds">
          10↷
        </button>

        <span className="lp-time">{fmtTime(current)} <span>/</span> {fmtTime(duration)}</span>

        <div
          className={`lp-seek ${seekLocked ? "is-locked" : ""}`}
          ref={barRef}
          onPointerDown={onBarDown}
          onPointerMove={onBarMove}
          onPointerUp={onBarUp}
          onKeyDown={onBarKey}
          role="slider"
          tabIndex={0}
          aria-label="Video timeline"
          aria-valuemin={0}
          aria-valuemax={Math.floor(duration)}
          aria-valuenow={Math.floor(current)}
        >
          <div className="lp-seek-track">
            <div className="lp-seek-fill" style={{ width: `${pct}%` }} />
            <div className="lp-seek-knob" style={{ left: `${pct}%` }} />
          </div>
        </div>

        <button type="button" className="lp-ctrl lp-ctrl-volume" onClick={toggleMute} disabled={!ready || error} title={muted ? "Unmute" : "Mute"}>
          {muted || volume === 0 ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <line x1="23" y1="9" x2="17" y2="15"/>
              <line x1="17" y1="9" x2="23" y2="15"/>
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
            </svg>
          )}
        </button>
        <input
          className="lp-volume-range"
          type="range"
          min="0"
          max="100"
          value={muted ? 0 : volume}
          onChange={changeVolume}
          disabled={!ready || error}
          aria-label="Volume"
        />
        <button type="button" className="lp-ctrl lp-ctrl-rate" onClick={cycleRate} disabled={!ready || error} title="Playback speed">
          {rate}×
        </button>
        <button
          type="button"
          className={`lp-ctrl lp-ctrl-theater ${theater ? "is-active" : ""}`}
          onClick={() => setTheater((v) => !v)}
          title={theater ? "Exit theater mode" : "Theater mode"}
        >
          ▣
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Page 1 — continuous PDF-syllabus-style module document
   ═══════════════════════════════════════════════════════════════════ */
function ModuleDocument({ topic, doc, isLastTopicOfModule, isModuleCompleted, onProceedToQuiz }) {
  const fieldFact = topic.fieldFact;

  return (
    <div className="lp-module-page">
      <article className="lp-doc-sheet">
        <div className="lp-doc-masthead">
          <div className="lp-mast-left">
            <span className="lp-doc-brand">BUILDLAB</span>
            <span className="lp-doc-brand-sub">CSS NC II • SELF-PACED MODULE</span>
          </div>
          <div className="lp-mast-right">
            <span>MODULE {topic.moduleNum}</span>
            <span className="lp-mast-divider">/</span>
            <span>TOPIC {topic.topicCode}</span>
          </div>
        </div>

        <header className="lp-doc-title-block">
          <div className="lp-doc-stripe" />
          <div>
            <span className="lp-doc-kicker">LESSON MODULE · {topic.moduleTitle}</span>
            <h1>{topic.title}</h1>
          </div>
        </header>

        <section className="lp-doc-intro">
          <span className="lp-doc-intro-mark">§</span>
          <p>{doc.intro}</p>
        </section>

        <section className="lp-doc-block lp-objectives">
          <h2 className="lp-block-heading"><span>01</span> Learning Objectives</h2>
          <p className="lp-block-hint">At the end of this module, the learner should be able to:</p>
          <ol className="lp-objective-list">
            {doc.objectives.map((item, i) => (
              <li key={i}><span className="lp-obj-num">{i + 1}</span><span>{item}</span></li>
            ))}
          </ol>
        </section>

        {doc.sections.map((section, sIdx) => (
          <section className="lp-doc-block" key={sIdx}>
            <h2 className="lp-block-heading">
              <span>{String(sIdx + 2).padStart(2, "0")}</span> {section.heading}
            </h2>
            {section.paragraphs?.map((para, pIdx) => (
              <p className="lp-body-para" key={pIdx}>{para}</p>
            ))}
            {section.bullets?.length > 0 && (
              <ul className="lp-bullet-list">
                {section.bullets.map((b, bIdx) => (
                  <li key={bIdx}><span className="lp-bullet-dot">▪</span><span>{b}</span></li>
                ))}
              </ul>
            )}
            {section.note && (
              <div className={`lp-doc-note note-${section.note.tone || "standard"}`}>
                <span className="lp-note-icon">{section.note.tone === "warning" ? "!" : section.note.tone === "tip" ? "i" : "i"}</span>
                <div><strong>{section.note.title}</strong><p>{section.note.text}</p></div>
              </div>
            )}
          </section>
        ))}

        {fieldFact && (
          <section className="lp-doc-block">
            <h2 className="lp-block-heading"><span>{String(doc.sections.length + 2).padStart(2, "0")}</span> {fieldFact.title}</h2>
            <p className="lp-block-hint">{fieldFact.badge}: study each item carefully before the lab.</p>
            <div className="lp-doc-table-wrap">
              <table className="lp-doc-table">
                <thead>
                  <tr><th>Item / Condition</th><th>Technician Note</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {fieldFact.items?.map((it, i) => (
                    <tr key={i}>
                      <td><strong>{it.label}</strong></td>
                      <td>{it.value}</td>
                      <td><span className="lp-status-chip" style={{ color: it.color, borderColor: it.color }}>{it.tag}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {topic.mistakeWarning && (
          <div className="lp-doc-hazard">
            <div className="lp-hazard-head">
              <span className="lp-hazard-icon">⚠</span>
              <div><span className="lp-hazard-kicker">COMMON LABORATORY MISTAKE</span><h3>{topic.mistakeWarning.title}</h3></div>
            </div>
            <p>{topic.mistakeWarning.desc}</p>
          </div>
        )}

        <section className="lp-doc-block lp-takeaways">
          <h2 className="lp-block-heading"><span>✓</span> Key Takeaways</h2>
          <ul className="lp-takeaway-list">
            {doc.takeaways.map((t, i) => (
              <li key={i}><span className="lp-takeaway-check">✓</span><span>{t}</span></li>
            ))}
          </ul>
        </section>

        <footer className="lp-doc-footer">
          <span>Topic {topic.topicCode} · {topic.title}</span>
          <span>Page 1 of 2</span>
        </footer>
      </article>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Quick check — one required question per topic
   ═══════════════════════════════════════════════════════════════════ */
function QuickCheck({ topic, passed, onPass }) {
  const quiz = topic?.quiz;
  const [choice, setChoice] = useState(null);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    setChoice(null);
    setStatus(null);
  }, [topic?.id]);

  if (!quiz) return null;

  const choose = (idx, correct) => {
    if (passed || status === "correct") return;
    setChoice(idx);
    setStatus(correct ? "correct" : "wrong");
    try {
      if (correct) {
        soundManager.complete();
        onPass?.();
      } else {
        soundManager.error();
      }
    } catch {}
  };

  return (
    <section className="lp-quickcheck" aria-label="Required quick check">
      <div className="lp-quickcheck-head">
        <div>
          <span className="lp-quickcheck-kicker">REQUIRED CHECK · TOPIC {topic.topicCode}</span>
          <h3>{quiz.question}</h3>
        </div>
        <span className={`lp-quickcheck-status ${passed || status === "correct" ? "is-passed" : ""}`}>
          {passed || status === "correct" ? "✓ Passed" : "Not passed"}
        </span>
      </div>
      <div className="lp-quickcheck-options">
        {quiz.options.map((opt, idx) => {
          const isChosen = choice === idx;
          const showCorrect = status === "correct" && opt.correct;
          const showWrong = isChosen && status === "wrong";
          return (
            <button
              type="button"
              key={idx}
              className={`lp-quickcheck-option ${showCorrect ? "is-correct" : ""} ${showWrong ? "is-wrong" : ""}`}
              onClick={() => choose(idx, Boolean(opt.correct))}
              disabled={passed || status === "correct"}
            >
              <span className="lp-quickcheck-bullet">{String.fromCharCode(65 + idx)}</span>
              <span>{opt.text}</span>
            </button>
          );
        })}
      </div>
      {status === "wrong" && (
        <p className="lp-quickcheck-hint">Not quite — review the lab mistake warning and try again.</p>
      )}
      {(status === "correct" || passed) && quiz.explanation && (
        <p className="lp-quickcheck-explanation">{quiz.explanation}</p>
      )}
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Main lesson view
   ═══════════════════════════════════════════════════════════════════ */
export default function LessonPresentationView({
  topic,
  moduleNum = 1,
  isLastTopicOfModule = false,
  isModuleCompleted = false,
  activePage: propActivePage,
  onPageChange,
  onProceedTo3D,
  onProceedToQuiz,
  watched = false,
  quickCheckPassed = false,
  onVideoWatched,
  onQuickCheckPass,
  theme = "dark",
}) {
  const [pageState, setPageState] = useState({ id: topic?.id, page: 0 });
  const totalPages = 2;
  const content = getLessonModuleContent(topic);
  const activePage = typeof propActivePage === "number" ? propActivePage : (pageState.id === topic?.id ? pageState.page : 0);
  const setActivePage = (updater) => {
    const base = activePage;
    const next = typeof updater === "function" ? updater(base) : updater;
    setPageState({ id: topic?.id, page: next });
    if (onPageChange) onPageChange(next);
  };

  const goTo = (page) => {
    if (page < 0 || page >= totalPages) return;
    try {
      soundManager.click();
    } catch {}
    setActivePage(page);
  };

  const nextPage = () => {
    try {
      soundManager.click();
    } catch {}
    if (activePage < totalPages - 1) setActivePage((p) => p + 1);
    else if (onProceedTo3D) onProceedTo3D();
  };

  const prevPage = () => {
    try {
      soundManager.click();
    } catch {}
    if (activePage > 0) setActivePage((p) => p - 1);
  };

  return (
    <div className={`lesson-presentation-view theme-${theme}`}>
      {/* CONTENT VIEWPORT (Expanded upward) */}
      <div className="lp-slide-viewport">
        {activePage === 0 && (
          <ModuleDocument
            topic={topic}
            doc={content.moduleDoc}
            isLastTopicOfModule={isLastTopicOfModule}
            isModuleCompleted={isModuleCompleted}
            onProceedToQuiz={onProceedToQuiz}
          />
        )}

        {activePage === 1 && (
          <div className="lp-video-page">
            <div className="lp-video-layout">
              <div className="lp-video-main">
                <CustomVideoPlayer
                  videoId={topic.youtubeId}
                  title={topic.videoTitle}
                  watched={watched}
                  onWatched={onVideoWatched}
                />
                <div className="lp-video-info-strip">
                  <h1 className="lp-video-headline">{topic.videoTitle || topic.title}</h1>
                  <div className="lp-video-meta-row">
                    <span className="lp-video-badge-strand">DepEd TVL CSS NC II</span>
                    <span className="lp-video-meta-bullet">•</span>
                    <span className="lp-video-meta-sub">Topic {topic.topicCode}: {topic.title}</span>
                    <span className="lp-video-meta-bullet">•</span>
                    <a
                      className="lp-video-external-btn"
                      href={`https://www.youtube.com/watch?v=${topic.youtubeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      ▶ Open on YouTube ↗
                    </a>
                  </div>
                </div>
                <QuickCheck topic={topic} passed={quickCheckPassed} onPass={onQuickCheckPass} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER STEPPER */}
      <footer className="lp-bottom-footer">
        <div className="lp-footer-left">
          <button type="button" className="lp-btn-nav lp-btn-prev" disabled={activePage === 0} onClick={prevPage}>
            ← Previous Page
          </button>
          <div className="lp-slide-dots" role="tablist" aria-label="Lesson pages">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                type="button"
                key={idx}
                className={`lp-dot ${activePage === idx ? "is-active" : ""}`}
                onClick={() => goTo(idx)}
                aria-label={`Go to page ${idx + 1}`}
              />
            ))}
          </div>
        </div>
        <div className="lp-footer-right">
          {activePage < totalPages - 1 ? (
            <button type="button" className="lp-btn-nav lp-btn-next" onClick={nextPage}>
              Next Page: Video →
            </button>
          ) : (
            <button type="button" className="lp-btn-nav lp-btn-next" onClick={() => onProceedTo3D?.()}>
              Continue to 3D Lab →
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
