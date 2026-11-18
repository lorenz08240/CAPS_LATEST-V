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

/* ═══════════════════════════════════════════════════════════════════
   Custom video player — YouTube IFrame API with controls:0 and a
   fully in-house control deck (play, seek, skip, volume, speed).
   ═══════════════════════════════════════════════════════════════════ */
function CustomVideoPlayer({ videoId, title }) {
  const mountRef = useRef(null);
  const playerRef = useRef(null);
  const barRef = useRef(null);
  const draggingRef = useRef(false);
  const durationRef = useRef(0);

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
            origin: window.location.origin,
          },
          events: {
            onReady: (e) => {
              if (dead) return;
              e.target.setVolume(80);
              e.target.setPlaybackRate(1);
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
    if (!barRef.current || !durationRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    if (rect.width <= 0) return;
    const frac = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    playerRef.current?.seekTo(frac * durationRef.current, true);
  };

  const onBarDown = (e) => {
    if (!ready || error) return;
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
            <span>⚠️ This video could not be loaded.</span>
            <a href={`https://www.youtube.com/watch?v=${videoId}`} target="_blank" rel="noopener noreferrer">
              Open on YouTube ↗
            </a>
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
        <button type="button" className="lp-ctrl" onClick={() => seekBy(-10)} disabled={!ready || error} title="Back 10 seconds">
          ↶10
        </button>
        <button type="button" className="lp-ctrl" onClick={() => seekBy(10)} disabled={!ready || error} title="Forward 10 seconds">
          10↷
        </button>

        <span className="lp-time">{fmtTime(current)} <span>/</span> {fmtTime(duration)}</span>

        <div
          className="lp-seek"
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
          {muted || volume === 0 ? "🔇" : "🔊"}
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

      <div className="lp-player-caption">
        <span className="lp-caption-icon">📺</span>
        <strong>{title}</strong>
        <span className="lp-caption-tag">CUSTOM CONTROLS</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Page 1 — continuous PDF-syllabus-style module document
   ═══════════════════════════════════════════════════════════════════ */
function ModuleDocument({ topic, doc }) {
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
            <div className="lp-doc-meta">
              <span>📘 DepEd TVL / TESDA NC II Aligned</span>
              <span>⏱ Self-Paced</span>
              <span>🧪 With 3D Lab Practical</span>
            </div>
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
                <span className="lp-note-icon">{section.note.tone === "warning" ? "⚠" : section.note.tone === "tip" ? "💡" : "ℹ"}</span>
                <div><strong>{section.note.title}</strong><p>{section.note.text}</p></div>
              </div>
            )}
          </section>
        ))}

        {fieldFact && (
          <section className="lp-doc-block">
            <h2 className="lp-block-heading"><span>{String(doc.sections.length + 2).padStart(2, "0")}</span> {fieldFact.title}</h2>
            <p className="lp-block-hint">{fieldFact.badge} — study each item carefully before the lab.</p>
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

        <section className="lp-doc-references">
          <h3>References &amp; Standards</h3>
          <ul>
            {doc.references.map((r, i) => (
              <li key={i}>
                <a href={r.url} target="_blank" rel="noopener noreferrer">{r.label} ↗</a>
              </li>
            ))}
          </ul>
        </section>

        <footer className="lp-doc-footer">
          <span>End of Module — Topic {topic.topicCode} · {topic.title}</span>
          <span>BuildLab Learning System · Page 1 of 2</span>
        </footer>
      </article>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Main lesson view
   ═══════════════════════════════════════════════════════════════════ */
export default function LessonPresentationView({
  topic,
  moduleNum = 1,
  onProceedTo3D,
  onProceedToQuiz,
  theme = "dark",
}) {
  const [pageState, setPageState] = useState({ id: topic?.id, page: 0 });
  const totalPages = 2;
  const content = getLessonModuleContent(topic);
  const activePage = pageState.id === topic?.id ? pageState.page : 0;
  const setActivePage = (updater) =>
    setPageState((prev) => {
      const base = prev.id === topic?.id ? prev.page : 0;
      const next = typeof updater === "function" ? updater(base) : updater;
      return { id: topic?.id, page: next };
    });

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
      {/* TOP BAR */}
      <div className="lp-top-bar">
        <div className="lp-badge-group">
          <span className="lp-module-badge">MODULE {moduleNum} // LESSON MODULE</span>
          <span className="lp-slide-indicator">Page {activePage + 1} of {totalPages}</span>
        </div>
        <div className="lp-slide-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activePage === 0}
            className={`lp-tab-btn ${activePage === 0 ? "is-active" : ""}`}
            onClick={() => goTo(0)}
          >
            <span className="lp-tab-icon">📄</span> 1. Syllabus Module
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activePage === 1}
            className={`lp-tab-btn ${activePage === 1 ? "is-active" : ""}`}
            onClick={() => goTo(1)}
          >
            <span className="lp-tab-icon">🎬</span> 2. Video &amp; Summary
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="lp-slide-viewport">
        {activePage === 0 && <ModuleDocument topic={topic} doc={content.moduleDoc} />}

        {activePage === 1 && (
          <div className="lp-video-page">
            <header className="lp-page-header">
              <span className="lp-page-eyebrow">PAGE 2 OF 2 · TOPIC {topic.topicCode}</span>
              <h2>Video Demonstration &amp; Lesson Summary</h2>
              <p>Watch the demonstration aligned to this topic, then check the bulleted notes beside it.</p>
            </header>

            <div className="lp-video-layout">
              <div className="lp-video-main">
                <CustomVideoPlayer videoId={topic.youtubeId} title={topic.videoTitle} />
                <a
                  className="lp-video-external"
                  href={`https://www.youtube.com/watch?v=${topic.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Having trouble playing? Open on YouTube ↗
                </a>
              </div>

              <aside className="lp-summary-panel">
                <div className="lp-summary-head">
                  <span className="lp-summary-icon">📌</span>
                  <div>
                    <h3>Bulleted Summary</h3>
                    <p>What to remember from this lesson</p>
                  </div>
                </div>
                <ul className="lp-summary-list">
                  {content.videoSummary.map((point, i) => (
                    <li key={i}><span className="lp-summary-num">{i + 1}</span><span>{point}</span></li>
                  ))}
                </ul>
                <div className="lp-summary-foot">
                  Aligned to Topic {topic.topicCode} — {topic.title}
                </div>
              </aside>
            </div>

            <div className="lp-next-stage-bar">
              <div className="lp-next-stage-copy">
                <span className="lp-next-badge">NEXT: HANDS-ON PHASE</span>
                <h4>Ready to inspect the hardware in 3D?</h4>
                <p>Orbit, zoom, and click hotspots on the interactive workbench, then take the assessment.</p>
              </div>
              <div className="lp-next-stage-buttons">
                <button
                  type="button"
                  className="lp-btn-primary lp-btn-3d"
                  onClick={() => {
                    try {
                      soundManager.snap();
                    } catch {}
                    if (onProceedTo3D) onProceedTo3D();
                  }}
                >
                  🧊 Launch 3D Inspection Lab →
                </button>
                <button
                  type="button"
                  className="lp-btn-quiz"
                  onClick={() => {
                    try {
                      soundManager.click();
                    } catch {}
                    if (onProceedToQuiz) onProceedToQuiz();
                  }}
                >
                  📝 Take 15-Item Assessment
                </button>
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
