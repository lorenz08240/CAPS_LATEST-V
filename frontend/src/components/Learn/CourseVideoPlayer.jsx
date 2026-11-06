import React, { useEffect, useRef, useState, useCallback } from "react";
import soundManager from "../../utilities/soundManager";
import "./CourseVideoPlayer.css";

/* ═══════════════════════════════════════════════════════════════════
   CourseVideoPlayer — Learn Page Video Player (YouTube IFrame API)

   • Autoplay: starts muted (browser autoplay policy) behind a
     "Tap to unmute" chip; full audio after one click.
   • Custom Cyberpunk HUD Control Deck:
     - Play / Pause (▶ / ❚❚)
     - ⏪ 10s Rewind (always unrestricted)
     - ⏩ 10s Forward (GATED: restricted until finished once)
     - Custom Scrub Bar: shows playback progress, furthest watched
       point, and locked timeline section if not finished.
     - Audio / Mute toggle.
     - Theater / In-Page Maximize overlay toggle (fits to screen with
       space padding, no browser requestFullscreen to prevent
       FullscreenGate conflict).
   • Sidebar lock: while maximized, sidebars are safely disabled.
   • Escape key / backdrop click: safely minimizes the player.
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

export default function CourseVideoPlayer({
  videoId,
  lessonId,
  title,
  compact = false,
  isAlreadyFinished = false,
  onFinished,
  onMaximizeChange,
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
  const [isMaximized, setIsMaximized] = useState(false);
  const [lockNotice, setLockNotice] = useState(false);

  /* Determine initial finished state from props or localStorage */
  const [isFinished, setIsFinished] = useState(() => {
    if (isAlreadyFinished) return true;
    try {
      if (videoId && localStorage.getItem(`buildlab_video_finished_${videoId}`) === "true") return true;
      if (lessonId && localStorage.getItem(`buildlab_video_finished_${lessonId}`) === "true") return true;
    } catch {}
    return false;
  });

  /* Sync with incoming prop if video was completed externally */
  useEffect(() => {
    if (isAlreadyFinished) {
      setIsFinished(true);
      maxWatchedRef.current = Infinity;
    }
  }, [isAlreadyFinished]);

  /* Reset max watched time when videoId changes */
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

  /* Mark video as completed */
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

  /* Trigger lock warning toast */
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

  /* Create / destroy the YT player when video changes */
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
          mute: 1, // browser autoplay policy
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
              // Video ended
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

  /* Progress ticker while ready */
  useEffect(() => {
    if (!ready) return undefined;
    const tick = setInterval(() => {
      const p = playerRef.current;
      if (!p?.getCurrentTime) return;
      try {
        const cur = p.getCurrentTime() || 0;
        setTime(cur);
        const d = p.getDuration();
        if (d && Math.abs(d - duration) > 0.5) {
          setDuration(d);
        }

        // Track furthest reached point
        if (cur > maxWatchedRef.current) {
          maxWatchedRef.current = cur;
        }

        // Check completion near end
        if (d > 0 && cur >= d - 1.5) {
          handleVideoCompleted();
        }
      } catch {}
    }, 250);
    return () => clearInterval(tick);
  }, [ready, duration, handleVideoCompleted]);

  /* Seek delta (+10s / -10s) */
  const seekBy = useCallback(
    (delta) => {
      const p = playerRef.current;
      if (!p?.getCurrentTime) return;
      const cur = p.getCurrentTime() || 0;

      if (delta < 0) {
        // Rewind is always unrestricted
        p.seekTo(Math.max(0, cur + delta), true);
        if (!playing) p.playVideo();
        try {
          soundManager.play("click");
        } catch {}
      } else {
        // Forwarding restricted until completed once
        if (!isFinished) {
          triggerLockAlert();
          return;
        }
        p.seekTo(Math.min(duration || Infinity, cur + delta), true);
        if (!playing) p.playVideo();
        try {
          soundManager.play("click");
        } catch {}
      }
    },
    [playing, isFinished, duration, triggerLockAlert]
  );

  /* Timeline scrub seek */
  const seekToFrac = useCallback(
    (frac) => {
      const p = playerRef.current;
      if (!p?.getDuration) return;
      const dur = duration || p.getDuration() || 0;
      const target = Math.max(0, Math.min(1, frac)) * dur;
      const cur = p.getCurrentTime() || time || 0;

      if (isFinished) {
        // Unrestricted
        p.seekTo(target, true);
        return;
      }

      // Restrict forwarding when not finished
      if (target <= cur + 0.5) {
        // Rewind: always allowed
        p.seekTo(target, true);
      } else {
        // Forwarding attempt
        if (target <= maxWatchedRef.current) {
          // Allowed up to already watched point
          p.seekTo(target, true);
        } else {
          // Block forward seek into unwatched section
          if (maxWatchedRef.current > cur + 1) {
            p.seekTo(maxWatchedRef.current, true);
          }
          triggerLockAlert();
        }
      }
    },
    [isFinished, duration, time, triggerLockAlert]
  );

  const togglePlay = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    if (playing) p.pauseVideo();
    else p.playVideo();
  }, [playing]);

  const toggleMute = useCallback(() => {
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
  }, [muted, playing]);

  /* In-Page Maximize / Theater Mode (No requestFullscreen -> No FullscreenGate conflict) */
  const toggleMaximize = useCallback(
    (forcedState) => {
      setIsMaximized((prev) => {
        const next = typeof forcedState === "boolean" ? forcedState : !prev;
        if (next) {
          document.body.classList.add("cvp-maximized-active");
          try {
            soundManager.play("modal_open");
          } catch {}
        } else {
          document.body.classList.remove("cvp-maximized-active");
          try {
            soundManager.play("modal_close");
          } catch {}
        }
        onMaximizeChange?.(next);
        return next;
      });
    },
    [onMaximizeChange]
  );

  /* Escape key closes maximized theater overlay */
  useEffect(() => {
    if (!isMaximized) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        toggleMaximize(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMaximized, toggleMaximize]);

  /* Clean up body class if component unmounts while maximized */
  useEffect(() => {
    return () => {
      document.body.classList.remove("cvp-maximized-active");
      if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
    };
  }, []);

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
    try {
      barRef.current?.releasePointerCapture?.(e.pointerId);
    } catch {}
  };

  const pct = duration ? Math.min(100, (time / duration) * 100) : 0;
  const watchedPct = duration ? Math.min(100, (maxWatchedRef.current / duration) * 100) : 0;

  return (
    <div
      className={`cvp-shell ${compact ? "cvp-compact" : ""} ${isMaximized ? "cvp-maximized" : ""}`}
      ref={shellRef}
      onClick={(e) => {
        // Clicking backdrop padding minimizes the player
        if (isMaximized && e.target === shellRef.current) {
          toggleMaximize(false);
        }
      }}
      title={title ? `Video player — ${title}` : undefined}
    >
      <div className="cvp-container" onClick={(e) => e.stopPropagation()}>
        {/* Theater Header (displayed when maximized) */}
        {isMaximized && (
          <div className="cvp-theater-bar">
            <div className="cvp-theater-meta">
              <span className="cvp-theater-pulse" aria-hidden="true" />
              <span className="cvp-theater-badge">THEATER MODE</span>
              <span className="cvp-theater-divider" aria-hidden="true">/</span>
              <span className="cvp-theater-title">{title || "Course Video"}</span>
            </div>
            <button
              className="cvp-theater-minimize-btn"
              onClick={() => toggleMaximize(false)}
              title="Minimize player (Esc)"
              type="button"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7" />
              </svg>
              <span>Minimize [ESC]</span>
            </button>
          </div>
        )}

        {/* Lock Toast Alert */}
        {lockNotice && (
          <div className="cvp-lock-alert" role="status" aria-live="polite">
            <span className="cvp-lock-alert-icon">🔒</span>
            <span className="cvp-lock-alert-text">
              Fast-forwarding is restricted. Finish watching this lesson once to unlock full timeline seeking.
            </span>
          </div>
        )}

        {/* Video Stage */}
        <div
          className="cvp-stage"
          ref={stageRef}
          onDoubleClick={() => toggleMaximize()}
          title="Double click to toggle theater mode"
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
        </div>

        {/* Cyberpunk Custom Media Deck */}
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
            className={`cvp-btn cvp-btn-expand ${isMaximized ? "is-active" : ""}`}
            onClick={() => toggleMaximize()}
            title={isMaximized ? "Minimize player (Esc)" : "Maximize player to fit screen"}
            type="button"
          >
            {isMaximized ? "🗗" : "⛶"}
          </button>
        </div>
      </div>
    </div>
  );
}
