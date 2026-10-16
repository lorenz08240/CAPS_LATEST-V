// Centralized UI & System Sound Effects Manager for BuildLab
class SoundManager {
  constructor() {
    this.enabled = true;
    this.audioCache = {};
    this.volume = 0.35;
  }

  setEnabled(val) {
    this.enabled = !!val;
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  play(soundName, customVolume = null) {
    if (!this.enabled) return;
    try {
      const src = `/sfx/${soundName}.wav`;
      const audio = new Audio(src);
      audio.volume = customVolume !== null ? customVolume : this.volume;
      audio.play().catch(() => {
        // Ignored if user hasn't interacted with document yet
      });
    } catch (e) {
      // Audio playback failsafe
    }
  }

  // Predefined UI Sound Actions
  click() {
    this.play('click', 0.25);
  }

  snap() {
    this.play('snap', 0.3);
  }

  install() {
    this.play('install', 0.35);
  }

  openBox() {
    this.play('open_box', 0.4);
  }

  modalOpen() {
    this.play('modal_open', 0.3);
  }

  modalClose() {
    this.play('modal_close', 0.25);
  }

  complete() {
    this.play('complete', 0.45);
  }

  error() {
    this.play('error', 0.35);
  }

  hint() {
    this.play('hint', 0.3);
  }

  warning() {
    this.play('warning', 0.35);
  }
}

export const soundManager = new SoundManager();
export default soundManager;
