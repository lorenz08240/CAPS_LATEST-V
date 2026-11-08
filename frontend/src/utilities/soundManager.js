// Centralized UI & System Sound Effects Manager for BuildLab
// High-performance audio pool with eDEX-UI sci-fi sound suite + procedural Web Audio API synthesis fallback

const SOUND_SOURCE_MAP = {
  click: ["/sfx/audio/stdout.wav", "/sfx/click.wav", "/sfx/UI_Interact.mp3"],
  snap: ["/sfx/audio/stdin.wav", "/sfx/snap.wav"],
  install: ["/sfx/audio/folder.wav", "/sfx/install.wav"],
  open_box: ["/sfx/audio/panels.wav", "/sfx/open_box.wav"],
  modal_open: ["/sfx/audio/panels.wav", "/sfx/modal_open.wav"],
  modal_close: ["/sfx/audio/expand.wav", "/sfx/modal_close.wav"],
  complete: ["/sfx/audio/granted.wav", "/sfx/granted.wav"],
  granted: ["/sfx/audio/granted.wav", "/sfx/granted.wav"],
  denied: ["/sfx/audio/denied.wav", "/sfx/denied.mp3"],
  UI_Denied_2: ["/sfx/audio/denied.wav", "/sfx/denied.mp3"],
  error: ["/sfx/audio/error.wav", "/sfx/error.mp3"],
  Error1: ["/sfx/audio/error.wav", "/sfx/Error1.mp3"],
  Error2: ["/sfx/audio/error.wav", "/sfx/error.mp3"],
  Error3: ["/sfx/audio/error.wav", "/sfx/Error3.mp3"],
  warning: ["/sfx/audio/alarm.wav", "/sfx/warning.wav"],
  hint: ["/sfx/audio/info.wav", "/sfx/hint.wav"],
  info: ["/sfx/audio/info.wav", "/sfx/hint.wav"],
  scan: ["/sfx/audio/scan.wav"],
  panels: ["/sfx/audio/panels.wav", "/sfx/modal_open.wav"],
  expand: ["/sfx/audio/expand.wav", "/sfx/modal_close.wav"],
  theme: ["/sfx/audio/theme.wav"],
  interact: ["/sfx/audio/stdout.wav", "/sfx/UI_Interact.mp3", "/sfx/click.wav"],
  UI_Interact: ["/sfx/audio/stdout.wav", "/sfx/UI_Interact.mp3", "/sfx/click.wav"],
};

class SynthAudio {
  constructor() {
    this.ctx = null;
  }

  getContext() {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  playTone(freq, type = "sine", duration = 0.04, gainValue = 0.15, endFreq = null) {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      if (endFreq !== null) {
        osc.frequency.exponentialRampToValueAtTime(
          Math.max(10, endFreq),
          ctx.currentTime + duration
        );
      }

      gain.gain.setValueAtTime(gainValue, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio playback failsafe
    }
  }

  click(vol = 0.12) {
    // Crisp tactile click: 1600Hz down to 450Hz in 25ms
    this.playTone(1600, "sine", 0.025, vol, 450);
  }

  snap(vol = 0.15) {
    // Snappy magnetic switch: 800Hz down to 260Hz in 35ms
    this.playTone(800, "triangle", 0.035, vol, 260);
  }

  install(vol = 0.2) {
    // Mechanical lock / install: deep solid thud
    this.playTone(320, "square", 0.065, vol * 0.65, 120);
    setTimeout(() => {
      this.playTone(180, "sine", 0.09, vol, 80);
    }, 20);
  }

  openBox(vol = 0.2) {
    this.playTone(280, "sine", 0.08, vol, 560);
  }

  modalOpen(vol = 0.16) {
    // Upward glass chime
    this.playTone(440, "sine", 0.06, vol, 660);
  }

  modalClose(vol = 0.14) {
    // Downward gentle chime
    this.playTone(660, "sine", 0.06, vol, 440);
  }

  complete(vol = 0.22) {
    // Victory major triad arpeggio: C5 -> E5 -> G5 -> C6
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, "sine", 0.16, vol, freq * 1.01);
      }, i * 65);
    });
  }

  error(vol = 0.2) {
    // Cute low alert
    this.playTone(220, "triangle", 0.1, vol * 0.8, 160);
  }

  denied(vol = 0.22) {
    // Cute descending "uh-oh / bonk" sound: 360Hz down to 220Hz
    this.playTone(360, "sine", 0.08, vol, 240);
    setTimeout(() => {
      this.playTone(220, "triangle", 0.12, vol * 0.9, 140);
    }, 70);
  }

  granted(vol = 0.22) {
    // Cute sparkling celesta chime: C6 -> E6 -> G6 -> C7
    const notes = [1046.5, 1318.5, 1567.98, 2093.0];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, "sine", 0.15, vol * 0.8, freq * 1.02);
      }, i * 75);
    });
  }

  interact(vol = 0.14) {
    // Cute light bubble click
    this.playTone(900, "sine", 0.03, vol, 500);
  }

  hint(vol = 0.15) {
    this.playTone(880, "sine", 0.08, vol, 920);
  }

  typewriter(vol = 0.04) {
    // Subtle, delightful retro computer terminal / typewriter speech blip
    // Randomize pitch slightly around 760-1100 Hz for natural conversational rhythm
    const baseFreq = 760 + Math.random() * 260;
    this.playTone(baseFreq, "triangle", 0.016, vol, baseFreq * 0.82);
  }

  warning(vol = 0.18) {
    // Two-tone warning
    this.playTone(550, "triangle", 0.08, vol);
    setTimeout(() => {
      this.playTone(440, "triangle", 0.08, vol);
    }, 85);
  }
}

class SoundManager {
  constructor() {
    this.enabled = true;
    this.volume = 0.35;
    this.audioPool = {};
    this.synth = new SynthAudio();
    this._listenerAttached = false;
    this._unlocked = false;

    // Restore user preferences
    if (typeof window !== "undefined") {
      try {
        const savedEnabled = localStorage.getItem("buildlab_sound_enabled");
        if (savedEnabled !== null) this.enabled = JSON.parse(savedEnabled);
        const savedVol = localStorage.getItem("buildlab_sound_volume");
        if (savedVol !== null) this.volume = parseFloat(savedVol);
      } catch {
        // Fallback default
      }
    }
  }

  setEnabled(val) {
    this.enabled = !!val;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("buildlab_sound_enabled", JSON.stringify(this.enabled));
      } catch {}
    }
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("buildlab_sound_volume", JSON.stringify(this.volume));
      } catch {}
    }
  }

  toggleSound() {
    const next = !this.enabled;
    this.setEnabled(next);
    if (next) this.click();
    return next;
  }

  unlockAudio() {
    if (this._unlocked) return;
    this._unlocked = true;
    this.synth.getContext();
  }

  _getAudio(soundName) {
    if (typeof window === "undefined") return null;
    if (!this.audioPool[soundName]) {
      this.audioPool[soundName] = [];
    }
    const pool = this.audioPool[soundName];
    // Find an idle audio element or allocate a new clone (max pool size 4 per sound)
    let audio = pool.find((a) => a.paused || a.ended);
    if (!audio && pool.length < 4) {
      try {
        const candidates = SOUND_SOURCE_MAP[soundName] || [
          `/sfx/${soundName}.mp3`,
          `/sfx/${soundName}.wav`,
        ];
        audio = new Audio(candidates[0]);
        pool.push(audio);
      } catch {
        return null;
      }
    }
    return audio || null;
  }

  play(soundName, customVolume = null) {
    if (!this.enabled) return;
    const vol = customVolume !== null ? customVolume : this.volume;

    const audio = this._getAudio(soundName);
    if (audio) {
      try {
        audio.volume = Math.max(0, Math.min(1, vol));
        audio.currentTime = 0;
        const promise = audio.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(() => {
            // If browser blocked HTMLAudioElement play, trigger synth fallback
            if (this.synth[soundName]) {
              this.synth[soundName](vol);
            }
          });
        }
        return;
      } catch {
        // Fallback below
      }
    }

    // Direct synth fallback if audio file cannot be loaded
    if (this.synth[soundName]) {
      this.synth[soundName](vol);
    }
  }

  // Predefined UI Sound Actions
  click() {
    this.play("click", 0.25);
  }

  snap() {
    this.play("snap", 0.3);
  }

  install() {
    this.play("install", 0.35);
  }

  openBox() {
    this.play("open_box", 0.4);
  }

  modalOpen() {
    this.play("modal_open", 0.3);
  }

  modalClose() {
    this.play("modal_close", 0.25);
  }

  complete() {
    this.play("complete", 0.45);
  }

  error() {
    this.play("error", 0.35);
  }

  denied() {
    this.play("denied", 0.38);
  }

  granted() {
    this.play("granted", 0.38);
  }

  interact() {
    this.play("interact", 0.28);
  }

  hint() {
    this.play("hint", 0.3);
  }

  info() {
    this.play("info", 0.3);
  }

  scan() {
    this.play("scan", 0.35);
  }

  panels() {
    this.play("panels", 0.3);
  }

  expand() {
    this.play("expand", 0.3);
  }

  theme() {
    this.play("theme", 0.25);
  }

  warning() {
    this.play("warning", 0.35);
  }

  typewriter(customVol = null) {
    if (!this.enabled) return;
    const vol = customVol !== null ? customVol : (this.volume * 0.18);
    this.synth.typewriter(vol);
  }

  // Global UI Click Interaction Listener
  initGlobalUIListener() {
    if (this._listenerAttached || typeof window === "undefined") return;
    this._listenerAttached = true;

    const unlock = () => {
      this.unlockAudio();
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
    window.addEventListener("pointerdown", unlock, { passive: true, capture: true });
    window.addEventListener("keydown", unlock, { passive: true, capture: true });

    let lastClickTime = 0;
    document.addEventListener(
      "click",
      (e) => {
        if (!this.enabled) return;

        const now = performance.now();
        if (now - lastClickTime < 45) return; // Prevent double-triggering

        const target = e.target;
        if (!target || !(target instanceof Element)) return;

        // Elements opting out of sound
        if (
          target.closest(
            '[data-no-sound="true"], input:not([type="button"]):not([type="submit"]), textarea, iframe, .video-player-container, .yt-player-wrap'
          )
        ) {
          return;
        }

        // Custom sound attribute
        const customSoundEl = target.closest("[data-sound]");
        if (customSoundEl) {
          const soundType = customSoundEl.getAttribute("data-sound");
          if (soundType && typeof this[soundType] === "function") {
            this[soundType]();
            lastClickTime = now;
            return;
          }
        }

        // Standard interactive UI elements
        const interactive = target.closest(
          'button, a, [role="button"], [role="tab"], [role="menuitem"], input[type="button"], input[type="submit"], .clickable, .nav-link, .tool-icon-btn, .build-step-btn, .component-card, .btn, .course-lesson-row, .syllabus-lesson-btn, .chapter-header, .module-accordion-header'
        );

        if (interactive) {
          this.click();
          lastClickTime = now;
        }
      },
      { passive: true, capture: true }
    );
  }
}

export const soundManager = new SoundManager();

// Automatically attach global listener in browser environment
if (typeof window !== "undefined") {
  soundManager.initGlobalUIListener();
}

export default soundManager;
