import React, { useEffect, useRef, useState, useCallback } from "react";
import "./CourseVideoPlayer.css";

/* ═══════════════════════════════════════════════════════════════════
   CourseVideoPlayer — Learn page video player (YouTube IFrame API)

   • Autoplay: starts muted (browser autoplay policy) behind a
     "Tap to unmute" chip; full audio after one click.
   • Custom control deck: play/pause, ⏪/⏩ 10s rewind & forward,
     scrub bar, mute toggle, fullscreen.
   • Re-mounts only when the video ID changes — play/pause/seek go
     through the IFrame API so the video never reloads.
   • Fullscreen targets the player shell, so the custom controls
     stay visible while fullscreen.
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

export default function CourseVideoPlayer({ videoId, title, compact = false }) {
  const stageRef = useRef(null);
  const shellRef = useRef(null);
  const barRef = useRef(null);
  const playerRef = useRef(null);
  const draggingRef = useRef(false);

  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  /* Create / destroy the YT player when the video changes. The holder
     node is managed imperatively because YT.Player replaces it with an
     iframe — React must never diff that node. */
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
    /* Stable host wrapper — YT.Player replaces `holder` with an iframe,
       so React must never diff it. The wrapper survives mount/unmount. */
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
          mute: 1, // browser autoplay policy — chip un-mutes on click
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
            setDuration(e.target.getDuration() || 0);
            setReady(true);
          },
          onStateChange: (e) => {
            if (dead) return;
            setPlaying(e.data === 1 || e.data === 3); // PLAYING | BUFFERING
          },
        },
      });
    });

    return () => {
      dead = true;
      try {
        playerRef.current?.destroy?.();
      } catch {
        /* noop */
      }
      playerRef.current = null;
      host.remove();
    };
  }, [videoId]);

  /* Progress ticker while ready */
  useEffect(() => {
    if (!ready) return undefined;
    const tick = setInterval(() => {
      const p = playerRef.current;
      if (!p?.getCurrentTime) return;
      try {
        setTime(p.getCurrentTime() || 0);
        const d = p.getDuration();
        if (d && Math.abs(d - duration) > 0.5) setDuration(d);
      } catch {
        /* player not ready */
      }
    }, 250);
    return () => clearInterval(tick);
  }, [ready, duration]);

  const seekBy = useCallback(
    (delta) => {
      const p = playerRef.current;
      if (!p?.getCurrentTime) return;
      p.seekTo(Math.max(0, p.getCurrentTime() + delta), true);
      if (!playing) p.playVideo();
    },
    [playing]
  );

  const seekToFrac = useCallback((frac) => {
    const p = playerRef.current;
    if (!p?.getDuration) return;
    p.seekTo(Math.max(0, Math.min(1, frac)) * p.getDuration(), true);
  }, []);

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

  const toggleFullscreen = useCallback(() => {
    const el = shellRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement) document.exitFullscreen();
      else el.requestFullscreen?.();
    } catch {
      /* fullscreen unsupported */
    }
  }, []);

  const dragSeek = (e) => {
    const rect = barRef.current.getBoundingClientRect();
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
  const onBarPointerUp = () => {
    draggingRef.current = false;
  };

  const pct = duration ? Math.min(100, (time / duration) * 100) : 0;

  return (
    <div
      className={`cvp-shell ${compact ? "cvp-compact" : ""}`}
      ref={shellRef}
      onDoubleClick={toggleFullscreen}
      title={title ? `Video player — ${title}` : undefined}
    >
      <div className="cvp-stage" ref={stageRef}>
        {ready && muted && (
          <button
            className="cvp-unmute-chip"
            onClick={toggleMute}
            title="Unmute audio"
          >
            🔇 Tap to unmute
          </button>
        )}
        {!ready && <div className="cvp-loading">Loading video…</div>}
      </div>

      <div className="cvp-deck">
        <button
          className="cvp-btn"
          onClick={togglePlay}
          title={playing ? "Pause" : "Play"}
        >
          {playing ? "❚❚" : "▶"}
        </button>
        <button
          className="cvp-btn"
          onClick={() => seekBy(-10)}
          title="Rewind 10 seconds"
        >
          ⏪
        </button>
        <button
          className="cvp-btn"
          onClick={() => seekBy(10)}
          title="Forward 10 seconds"
        >
          ⏩
        </button>
        <span className="cvp-time">
          {fmtTime(time)} / {fmtTime(duration)}
        </span>
        <div
          className="cvp-bar"
          ref={barRef}
          onPointerDown={onBarPointerDown}
          onPointerMove={onBarPointerMove}
          onPointerUp={onBarPointerUp}
          role="slider"
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={Math.floor(duration)}
          aria-valuenow={Math.floor(time)}
        >
          <div className="cvp-bar-track">
            <div className="cvp-bar-fill" style={{ width: `${pct}%` }} />
            <div className="cvp-bar-knob" style={{ left: `${pct}%` }} />
          </div>
        </div>
        <button
          className={`cvp-btn ${muted ? "cvp-btn-muted" : ""}`}
          onClick={toggleMute}
          title={muted ? "Unmute" : "Mute"}
        >
          {muted ? "🔇" : "🔊"}
        </button>
        <button
          className="cvp-btn"
          onClick={toggleFullscreen}
          title="Fullscreen"
        >
          ⛶
        </button>
      </div>
    </div>
  );
}
