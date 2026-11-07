import React, { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import soundManager from "../../utilities/soundManager";
import "./CourseVideoPlayer.css";

/* ═══════════════════════════════════════════════════════════════════
   CourseVideoPlayer — Learn Page Video Player (YouTube IFrame API)
   
   • TRUE OVERLAY METHOD:
     - Normal mode stays perfectly intact inside the lesson container.
     - Expanding opens a dedicated floating Modal Overlay via React
       Portal into document.body.
     - The underlying page and sidebars remain 100% undisturbed and
       intact (zero layout reflows or crumbling).
     - The overlay modal covers the entire screen, disabling sidebars
       underneath until minimized.
     - Centered with space padding and preserved 16:9 aspect ratio.
     - Custom cyberpunk HUD media controls on both inline & overlay.
     - Restricts fast-forwarding until video is completed once.
       Rewind is always permitted.
     - Safe minimization via Minimize button, ESC key, or backdrop click.
     - No browser requestFullscreen -> No FullscreenGate conflict.
   ═══════════════════════════════════════════════════════════════════ */

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
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
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

/* ═══════════════════════════════════════════════════════════════════
   VideoOverlayModal Component (Portaled to document.body)
   ═══════════════════════════════════════════════════════════════════ */
function VideoOverlayModal({
  videoId,
  title,
  initialTime = 0,
  isFinished,
  onClose,
  triggerParentFinish,
}) {
  const stageRef = useRef(null);
  const barRef = useRef(null);
  const playerRef = useRef(null);
  const draggingRef = useRef(false);
  const maxWatchedRef = useRef(initialTime);
  const lockTimerRef = useRef(null);

  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(initialTime);
  const [duration, setDuration] = useState(0);
  const [lockNotice, setLockNotice] = useState(false);
  const [localFinished, setLocalFinished] = useState(isFinished);

  useEffect(() => {
    if (isFinished) {
      setLocalFinished(true);
      maxWatchedRef.current = Infinity;
    }
  }, [isFinished]);

  const handleCompleted = useCallback(() => {
    setLocalFinished(true);
    maxWatchedRef.current = Infinity;
    triggerParentFinish?.();
    try {
      soundManager.play("granted");
    } catch {}
  }, [triggerParentFinish]);

  const triggerLockAlert = useCallback(() => {
    setLockNotice(true);
    try {
      soundManager.play("denied");
    } catch {}
    if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
    lockTimerRef.current = setTimeout(() => {
      setLockNotice(false);
    }, 2800);
  }, []);

  // Lock body scroll while overlay is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
    };
  }, []);

  const handleClose = useCallback(() => {
    const cur = playerRef.current?.getCurrentTime?.() || time || 0;
    try {
      soundManager.play("modal_close");
    } catch {}
    onClose(cur, playing);
  }, [time, playing, onClose]);

  // Escape key closes overlay
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleClose]);

  // YouTube player initialization in overlay
  useEffect(() => {
    if (!videoId) return undefined;
    const stage = stageRef.current;
    if (!stage) return undefined;

    let dead = false;
    const host = document.createElement("div");
    host.className = "cvp-host";
    const holder = document.createElement("div");
    host.appendChild(holder);
    stage.appendChild(host);

    loadYouTubeApi().then((YT) => {
      if (dead) return;
      playerRef.current = new YT.Player(holder, {
        videoId,
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: 1,
          start: Math.max(0, Math.floor(initialTime)),
          mute: 0,
          controls: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          iv_load_policy: 3,
          disablekb: 1,
          fs: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: (e) => {
            if (dead) return;
            e.target.setVolume(80);
            e.target.playVideo();
            const dur = e.target.getDuration() || 0;
            setDuration(dur);
            setReady(true);
          },
          onStateChange: (e) => {
            if (dead) return;
            setPlaying(e.data === 1 || e.data === 3);
            if (e.data === 0) {
              handleCompleted();
            }
          },
        },
      });
    });

    return () => {
      dead = true;
      try {
        playerRef.current?.destroy?.();
      } catch {}
      playerRef.current = null;
      host.remove();
    };
  }, [videoId, initialTime, handleCompleted]);

  // Progress ticker
  useEffect(() => {
    if (!ready) return undefined;
    const tick = setInterval(() => {
      const p = playerRef.current;
      if (!p?.getCurrentTime) return;
      try {
        const cur = p.getCurrentTime() || 0;
        setTime(cur);
        const d = p.getDuration();
        if (d && Math.abs(d - duration) > 0.5) setDuration(d);

        if (cur > maxWatchedRef.current) {
          maxWatchedRef.current = cur;
        }

        if (d > 0 && cur >= d - 1.5) {
          handleCompleted();
        }
      } catch {}
    }, 250);
    return () => clearInterval(tick);
  }, [ready, duration, handleCompleted]);

  const seekBy = (delta) => {
    const p = playerRef.current;
    if (!p?.getCurrentTime) return;
    const cur = p.getCurrentTime() || 0;
    if (delta < 0) {
      p.seekTo(Math.max(0, cur + delta), true);
      if (!playing) p.playVideo();
      try { soundManager.play("click"); } catch {}
    } else {
      if (!localFinished) {
        triggerLockAlert();
        return;
      }
      p.seekTo(Math.min(duration || Infinity, cur + delta), true);
      if (!playing) p.playVideo();
      try { soundManager.play("click"); } catch {}
    }
  };

  const seekToFrac = (frac) => {
    const p = playerRef.current;
    if (!p?.getDuration) return;
    const dur = duration || p.getDuration() || 0;
    const target = Math.max(0, Math.min(1, frac)) * dur;
    const cur = p.getCurrentTime() || time || 0;

    if (localFinished) {
      p.seekTo(target, true);
      return;
    }

    if (target <= cur + 0.5) {
      p.seekTo(target, true);
    } else {
      if (target <= maxWatchedRef.current) {
        p.seekTo(target, true);
      } else {
        if (maxWatchedRef.current > cur + 1) {
          p.seekTo(maxWatchedRef.current, true);
        }
        triggerLockAlert();
      }
    }
  };

  const togglePlay = () => {
    const p = playerRef.current;
    if (!p) return;
    if (playing) p.pauseVideo();
    else p.playVideo();
  };

  const toggleMute = () => {
    const p = playerRef.current;
    if (!p) return;
    if (muted) {
      p.unMute();
      p.setVolume(80);
      setMuted(false);
    } else {
      p.mute();
      setMuted(true);
    }
  };

  const dragSeek = (e) => {
    if (!barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    if (rect.width <= 0) return;
    seekToFrac((e.clientX - rect.left) / rect.width);
  };

  const onBarPointerDown = (e) => {
    draggingRef.current = true;
    barRef.current?.setPointerCapture?.(e.pointerId);
    dragSeek(e);
  };
  const onBarPointerMove = (e) => {
    if (draggingRef.current) dragSeek(e);
  };
  const onBarPointerUp = (e) => {
    draggingRef.current = false;
    try { barRef.current?.releasePointerCapture?.(e.pointerId); } catch {}
  };

  const pct = duration ? Math.min(100, (time / duration) * 100) : 0;
  const watchedPct = duration ? Math.min(100, (maxWatchedRef.current / duration) * 100) : 0;

  return (
    <div
      className="cvp-overlay-backdrop"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label={title || "Video Player Overlay"}
    >
      <div className="cvp-overlay-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Overlay Top Header */}
        <div className="cvp-overlay-header">
          <div className="cvp-overlay-meta">
            <span className="cvp-overlay-pulse" aria-hidden="true" />
            <span className="cvp-overlay-eyebrow">VIDEO OVERLAY</span>
            <span className="cvp-overlay-divider">/</span>
            <span className="cvp-overlay-title">{title || "Course Video"}</span>
          </div>
          <button
            className="cvp-overlay-close-btn"
            onClick={handleClose}
            title="Minimize video player (Esc)"
            type="button"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7" />
            </svg>
            <span>Minimize [ESC]</span>
          </button>
        </div>

        {/* Lock Notice */}
        {lockNotice && (
          <div className="cvp-lock-alert" role="status" aria-live="polite">
            <span className="cvp-lock-alert-icon">🔒</span>
            <span className="cvp-lock-alert-text">
              Fast-forwarding is restricted. Finish watching this lesson once to unlock full timeline seeking.
            </span>
          </div>
        )}

        {/* Stage Container */}
        <div className="cvp-overlay-stage-wrapper">
          <div className="cvp-stage" ref={stageRef}>
            {!ready && <div className="cvp-loading">Loading video…</div>}
          </div>
        </div>

        {/* Custom Cyberpunk Media Deck */}
        <div className="cvp-deck">
          <button
            className="cvp-btn cvp-btn-play"
            onClick={togglePlay}
            title={playing ? "Pause" : "Play"}
            type="button"
          >
            {playing ? "❚❚" : "▶"}
          </button>
          <button
            className="cvp-btn cvp-btn-rewind"
            onClick={() => seekBy(-10)}
            title="Rewind 10 seconds"
            type="button"
          >
            ⏪
          </button>
          <button
            className={`cvp-btn cvp-btn-forward ${!localFinished ? "cvp-btn-locked" : ""}`}
            onClick={() => {
              if (!localFinished) triggerLockAlert();
              else seekBy(10);
            }}
            disabled={!localFinished}
            title={localFinished ? "Forward 10 seconds" : "Forwarding locked until lesson finished once"}
            type="button"
          >
            {localFinished ? "⏩" : "🔒"}
          </button>
          <span className="cvp-time">
            {fmtTime(time)} / {fmtTime(duration)}
          </span>
          <div
            className={`cvp-bar ${!localFinished ? "is-gated" : ""}`}
            ref={barRef}
            onPointerDown={onBarPointerDown}
            onPointerMove={onBarPointerMove}
            onPointerUp={onBarPointerUp}
            role="slider"
            aria-label="Seek timeline"
            aria-valuemin={0}
            aria-valuemax={Math.floor(duration)}
            aria-valuenow={Math.floor(time)}
          >
            <div className="cvp-bar-track">
              {!localFinished && duration > 0 && (
                <div
                  className="cvp-bar-watched-zone"
                  style={{ width: `${watchedPct}%` }}
                  title="Unlocked watched segment"
                />
              )}
              <div className="cvp-bar-fill" style={{ width: `${pct}%` }} />
              <div className="cvp-bar-knob" style={{ left: `${pct}%` }} />
            </div>
          </div>
          <button
            className={`cvp-btn ${muted ? "cvp-btn-muted" : ""}`}
            onClick={toggleMute}
            title={muted ? "Unmute" : "Mute"}
            type="button"
          >
            {muted ? "Muted" : "Audio"}
          </button>
          <button
            className="cvp-btn cvp-btn-expand is-active"
            onClick={handleClose}
            title="Minimize player (Esc)"
            type="button"
          >
            🗗
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Main CourseVideoPlayer Component (Inline + Overlay Portal)
   ═══════════════════════════════════════════════════════════════════ */
export default function CourseVideoPlayer({
  videoId,
  lessonId,
  title,
  compact = false,
  isAlreadyFinished = false,
  onFinished,
}) {
  const stageRef = useRef(null);
  const shellRef = useRef(null);
  const barRef = useRef(null);
  const playerRef = useRef(null);
  const draggingRef = useRef(false);
  const maxWatchedRef = useRef(0);
  const lockTimerRef = useRef(null);

  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [lockNotice, setLockNotice] = useState(false);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [overlayStartTime, setOverlayStartTime] = useState(0);

  const [isFinished, setIsFinished] = useState(() => {
    if (isAlreadyFinished) return true;
    try {
      if (videoId && localStorage.getItem(`buildlab_video_finished_${videoId}`) === "true") return true;
      if (lessonId && localStorage.getItem(`buildlab_video_finished_${lessonId}`) === "true") return true;
    } catch {}
    return false;
  });

  useEffect(() => {
    if (isAlreadyFinished) {
      setIsFinished(true);
      maxWatchedRef.current = Infinity;
    }
  }, [isAlreadyFinished]);

  useEffect(() => {
    maxWatchedRef.current = 0;
    setLockNotice(false);
    let initialFinished = Boolean(isAlreadyFinished);
    try {
      if (videoId && localStorage.getItem(`buildlab_video_finished_${videoId}`) === "true") initialFinished = true;
      if (lessonId && localStorage.getItem(`buildlab_video_finished_${lessonId}`) === "true") initialFinished = true;
    } catch {}
    setIsFinished(initialFinished);
    if (initialFinished) {
      maxWatchedRef.current = Infinity;
    }
  }, [videoId, lessonId, isAlreadyFinished]);

  const handleVideoCompleted = useCallback(() => {
    setIsFinished((prev) => {
      if (!prev) {
        maxWatchedRef.current = Infinity;
        try {
          if (videoId) localStorage.setItem(`buildlab_video_finished_${videoId}`, "true");
          if (lessonId) localStorage.setItem(`buildlab_video_finished_${lessonId}`, "true");
        } catch {}
        try {
          soundManager.play("granted");
        } catch {}
        onFinished?.();
        return true;
      }
      return prev;
    });
  }, [videoId, lessonId, onFinished]);

  const triggerLockAlert = useCallback(() => {
    setLockNotice(true);
    try {
      soundManager.play("denied");
    } catch {}
    if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
    lockTimerRef.current = setTimeout(() => {
      setLockNotice(false);
    }, 2800);
  }, []);

  // Initialize inline player
  useEffect(() => {
    if (!videoId) return undefined;
    const stage = stageRef.current;
    if (!stage) return undefined;

    setReady(false);
    setPlaying(false);
    setMuted(true);
    setTime(0);
    setDuration(0);

    let dead = false;
    const host = document.createElement("div");
    host.className = "cvp-host";
    const holder = document.createElement("div");
    host.appendChild(holder);
    stage.appendChild(host);

    loadYouTubeApi().then((YT) => {
      if (dead) return;
      playerRef.current = new YT.Player(holder, {
        videoId,
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          iv_load_policy: 3,
          disablekb: 1,
          fs: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: (e) => {
            if (dead) return;
            e.target.setVolume(80);
            e.target.playVideo();
            const dur = e.target.getDuration() || 0;
            setDuration(dur);
            setReady(true);
          },
          onStateChange: (e) => {
            if (dead) return;
            setPlaying(e.data === 1 || e.data === 3);
            if (e.data === 0) {
              handleVideoCompleted();
            }
          },
        },
      });
    });

    return () => {
      dead = true;
      try {
        playerRef.current?.destroy?.();
      } catch {}
      playerRef.current = null;
      host.remove();
    };
  }, [videoId, handleVideoCompleted]);

  // Inline progress ticker
  useEffect(() => {
    if (!ready || isOverlayOpen) return undefined;
    const tick = setInterval(() => {
      const p = playerRef.current;
      if (!p?.getCurrentTime) return;
      try {
        const cur = p.getCurrentTime() || 0;
        setTime(cur);
        const d = p.getDuration();
        if (d && Math.abs(d - duration) > 0.5) setDuration(d);

        if (cur > maxWatchedRef.current) {
          maxWatchedRef.current = cur;
        }

        if (d > 0 && cur >= d - 1.5) {
          handleVideoCompleted();
        }
      } catch {}
    }, 250);
    return () => clearInterval(tick);
  }, [ready, duration, isOverlayOpen, handleVideoCompleted]);

  // Open overlay
  const handleOpenOverlay = () => {
    const cur = playerRef.current?.getCurrentTime?.() || time || 0;
    try {
      playerRef.current?.pauseVideo?.();
    } catch {}
    setOverlayStartTime(cur);
    try {
      soundManager.play("modal_open");
    } catch {}
    setIsOverlayOpen(true);
  };

  // Close overlay and resume inline
  const handleCloseOverlay = (resumeTime, wasPlaying) => {
    setIsOverlayOpen(false);
    setTime(resumeTime);
    if (resumeTime > maxWatchedRef.current) {
      maxWatchedRef.current = resumeTime;
    }
    if (playerRef.current?.seekTo) {
      playerRef.current.seekTo(resumeTime, true);
      if (wasPlaying) {
        playerRef.current.playVideo();
      }
    }
  };

  const seekBy = (delta) => {
    const p = playerRef.current;
    if (!p?.getCurrentTime) return;
    const cur = p.getCurrentTime() || 0;
    if (delta < 0) {
      p.seekTo(Math.max(0, cur + delta), true);
      if (!playing) p.playVideo();
      try { soundManager.play("click"); } catch {}
    } else {
      if (!isFinished) {
        triggerLockAlert();
        return;
      }
      p.seekTo(Math.min(duration || Infinity, cur + delta), true);
      if (!playing) p.playVideo();
      try { soundManager.play("click"); } catch {}
    }
  };

  const seekToFrac = (frac) => {
    const p = playerRef.current;
    if (!p?.getDuration) return;
    const dur = duration || p.getDuration() || 0;
    const target = Math.max(0, Math.min(1, frac)) * dur;
    const cur = p.getCurrentTime() || time || 0;

    if (isFinished) {
      p.seekTo(target, true);
      return;
    }

    if (target <= cur + 0.5) {
      p.seekTo(target, true);
    } else {
      if (target <= maxWatchedRef.current) {
        p.seekTo(target, true);
      } else {
        if (maxWatchedRef.current > cur + 1) {
          p.seekTo(maxWatchedRef.current, true);
        }
        triggerLockAlert();
      }
    }
  };

  const togglePlay = () => {
    const p = playerRef.current;
    if (!p) return;
    if (playing) p.pauseVideo();
    else p.playVideo();
  };

  const toggleMute = () => {
    const p = playerRef.current;
    if (!p) return;
    if (muted) {
      p.unMute();
      p.setVolume(80);
      if (!playing) p.playVideo();
      setMuted(false);
    } else {
      p.mute();
      setMuted(true);
    }
  };

  const dragSeek = (e) => {
    if (!barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    if (rect.width <= 0) return;
    seekToFrac((e.clientX - rect.left) / rect.width);
  };

  const onBarPointerDown = (e) => {
    draggingRef.current = true;
    barRef.current?.setPointerCapture?.(e.pointerId);
    dragSeek(e);
  };
  const onBarPointerMove = (e) => {
    if (draggingRef.current) dragSeek(e);
  };
  const onBarPointerUp = (e) => {
    draggingRef.current = false;
    try { barRef.current?.releasePointerCapture?.(e.pointerId); } catch {}
  };

  const pct = duration ? Math.min(100, (time / duration) * 100) : 0;
  const watchedPct = duration ? Math.min(100, (maxWatchedRef.current / duration) * 100) : 0;

  return (
    <>
      <div
        className={`cvp-shell ${compact ? "cvp-compact" : ""}`}
        ref={shellRef}
        title={title ? `Video player — ${title}` : undefined}
      >
        <div className="cvp-container">
          {lockNotice && (
            <div className="cvp-lock-alert" role="status" aria-live="polite">
              <span className="cvp-lock-alert-icon">🔒</span>
              <span className="cvp-lock-alert-text">
                Fast-forwarding is restricted. Finish watching this lesson once to unlock full timeline seeking.
              </span>
            </div>
          )}

          {/* Stage */}
          <div
            className="cvp-stage"
            ref={stageRef}
            onDoubleClick={handleOpenOverlay}
            title="Double click to open overlay theater view"
          >
            {ready && muted && (
              <button
                className="cvp-unmute-chip"
                onClick={toggleMute}
                title="Unmute audio"
                type="button"
              >
                Tap to unmute
              </button>
            )}
            {!ready && <div className="cvp-loading">Loading video…</div>}

            {/* Indicator when playing in overlay */}
            {isOverlayOpen && (
              <div className="cvp-inline-overlay-placeholder">
                <span className="cvp-overlay-pulse-tag">● PLAYING IN OVERLAY</span>
                <button
                  className="cvp-overlay-reopen-btn"
                  onClick={() => setIsOverlayOpen(true)}
                  type="button"
                >
                  View Overlay
                </button>
              </div>
            )}
          </div>

          {/* Custom Cyberpunk Media Deck */}
          <div className="cvp-deck">
            <button
              className="cvp-btn cvp-btn-play"
              onClick={togglePlay}
              title={playing ? "Pause" : "Play"}
              type="button"
            >
              {playing ? "❚❚" : "▶"}
            </button>

            <button
              className="cvp-btn cvp-btn-rewind"
              onClick={() => seekBy(-10)}
              title="Rewind 10 seconds"
              type="button"
            >
              ⏪
            </button>

            <button
              className={`cvp-btn cvp-btn-forward ${!isFinished ? "cvp-btn-locked" : ""}`}
              onClick={() => {
                if (!isFinished) triggerLockAlert();
                else seekBy(10);
              }}
              disabled={!isFinished}
              title={isFinished ? "Forward 10 seconds" : "Forwarding locked until lesson finished once"}
              type="button"
            >
              {isFinished ? "⏩" : "🔒"}
            </button>

            <span className="cvp-time">
              {fmtTime(time)} / {fmtTime(duration)}
            </span>

            <div
              className={`cvp-bar ${!isFinished ? "is-gated" : ""}`}
              ref={barRef}
              onPointerDown={onBarPointerDown}
              onPointerMove={onBarPointerMove}
              onPointerUp={onBarPointerUp}
              role="slider"
              aria-label="Seek timeline"
              aria-valuemin={0}
              aria-valuemax={Math.floor(duration)}
              aria-valuenow={Math.floor(time)}
            >
              <div className="cvp-bar-track">
                {!isFinished && duration > 0 && (
                  <div
                    className="cvp-bar-watched-zone"
                    style={{ width: `${watchedPct}%` }}
                    title="Unlocked watched segment"
                  />
                )}
                <div className="cvp-bar-fill" style={{ width: `${pct}%` }} />
                <div className="cvp-bar-knob" style={{ left: `${pct}%` }} />
              </div>
            </div>

            <button
              className={`cvp-btn ${muted ? "cvp-btn-muted" : ""}`}
              onClick={toggleMute}
              title={muted ? "Unmute" : "Mute"}
              type="button"
            >
              {muted ? "Muted" : "Audio"}
            </button>

            <button
              className="cvp-btn cvp-btn-expand"
              onClick={handleOpenOverlay}
              title="Maximize player to overlay modal (Esc to exit)"
              type="button"
            >
              ⛶
            </button>
          </div>
        </div>
      </div>

      {/* OVERLAY MODAL: Portaled directly into document.body */}
      {isOverlayOpen &&
        createPortal(
          <VideoOverlayModal
            videoId={videoId}
            title={title}
            initialTime={overlayStartTime}
            isFinished={isFinished}
            onClose={handleCloseOverlay}
            triggerParentFinish={handleVideoCompleted}
          />,
          document.body
        )}
    </>
  );
}
