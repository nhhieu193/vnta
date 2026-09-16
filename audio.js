// audio.js - Web Audio API sound synthesizer for Trưa Nay Ăn Gì

(function(global) {
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.muted = localStorage.getItem('tnag_muted') === 'true';
      this.lastTickTime = 0;
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    isMuted() {
      return this.muted;
    }

    toggleMute() {
      this.muted = !this.muted;
      localStorage.setItem('tnag_muted', String(this.muted));
      return this.muted;
    }

    playTick(pitchRatio = 1.0) {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // Throttle slightly to prevent overload
      if (now - this.lastTickTime < 0.035) return;
      this.lastTickTime = now;

      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        // Sharp mechanical click sound
        osc.type = 'triangle';
        const baseFreq = 800 * pitchRatio;
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.04);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1200, now);
        filter.Q.setValueAtTime(3, now);

        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.045);
      } catch (e) {}
    }

    playSpinStart() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;

      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(480, now + 0.35);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.45);
      } catch (e) {}
    }

    playBambooShake() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;

      try {
        const now = this.ctx.currentTime;
        const clickCount = 6;
        for (let i = 0; i < clickCount; i++) {
          const time = now + i * 0.07 + (Math.random() * 0.02);
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const filter = this.ctx.createBiquadFilter();

          osc.type = 'sine';
          const freq = 340 + Math.random() * 120;
          osc.frequency.setValueAtTime(freq, time);
          osc.frequency.exponentialRampToValueAtTime(180, time + 0.06);

          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(freq, time);
          filter.Q.setValueAtTime(4, time);

          gain.gain.setValueAtTime(0.35, time);
          gain.gain.exponentialRampToValueAtTime(0.001, time + 0.06);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(time);
          osc.stop(time + 0.07);
        }
      } catch (e) {}
    }

    playStickDraw() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;

      try {
        const now = this.ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'sine';
          const start = now + idx * 0.06;
          osc.frequency.setValueAtTime(freq, start);

          gain.gain.setValueAtTime(0.2, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(start);
          osc.stop(start + 0.55);
        });
      } catch (e) {}
    }

    playWin() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;

      try {
        const now = this.ctx.currentTime;
        const chords = [440, 554.37, 659.25]; // A major

        chords.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'sine';
          const start = now + idx * 0.08;
          osc.frequency.setValueAtTime(freq, start);

          gain.gain.setValueAtTime(0.25, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 1.2);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(start);
          osc.stop(start + 1.3);
        });
      } catch (e) {}
    }
  }

  const sound = new SoundEngine();

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = sound;
  }
  global.sound = sound;
})(typeof window !== 'undefined' ? window : this);
