// Tiny Web Audio synth engine — every sound effect in the game is generated
// procedurally, no audio files required.

let ctx = null;
let muted = false;

function getContext() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    ctx = new AudioContextClass();
  }
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

export function setMuted(value) {
  muted = value;
}

export function isMuted() {
  return muted;
}

function envelope(gainNode, audioCtx, { attack = 0.005, decay = 0.15, peak = 0.2, now }) {
  gainNode.gain.cancelScheduledValues(now);
  gainNode.gain.setValueAtTime(0.0001, now);
  gainNode.gain.exponentialRampToValueAtTime(peak, now + attack);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + attack + decay);
}

function tone({ freq, type = 'sine', duration = 0.15, peak = 0.2, delay = 0, detune = 0 }) {
  const audioCtx = getContext();
  if (!audioCtx || muted) return;

  const now = audioCtx.currentTime + delay;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  osc.detune.setValueAtTime(detune, now);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  envelope(gain, audioCtx, { attack: 0.005, decay: duration, peak, now });

  osc.start(now);
  osc.stop(now + duration + 0.05);
}

function sweep({ from, to, type = 'sine', duration = 0.2, peak = 0.2, delay = 0 }) {
  const audioCtx = getContext();
  if (!audioCtx || muted) return;

  const now = audioCtx.currentTime + delay;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(from, now);
  osc.frequency.exponentialRampToValueAtTime(Math.max(to, 1), now + duration);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  envelope(gain, audioCtx, { attack: 0.005, decay: duration, peak, now });

  osc.start(now);
  osc.stop(now + duration + 0.05);
}

function noiseBurst({ duration = 0.15, peak = 0.15, delay = 0, filterFreq = 1200 }) {
  const audioCtx = getContext();
  if (!audioCtx || muted) return;

  const now = audioCtx.currentTime + delay;
  const bufferSize = audioCtx.sampleRate * duration;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = filterFreq;

  const gain = audioCtx.createGain();
  envelope(gain, audioCtx, { attack: 0.005, decay: duration, peak, now });

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);

  noise.start(now);
  noise.stop(now + duration + 0.05);
}

export const sfx = {
  // Soft two-note blip when a new event spawns.
  eventSpawn() {
    tone({ freq: 660, type: 'sine', duration: 0.08, peak: 0.15 });
    tone({ freq: 880, type: 'sine', duration: 0.12, peak: 0.15, delay: 0.07 });
  },

  // Bright ascending chime for a revenue / user milestone.
  milestoneChime() {
    tone({ freq: 523.25, type: 'triangle', duration: 0.12, peak: 0.18 });
    tone({ freq: 659.25, type: 'triangle', duration: 0.12, peak: 0.18, delay: 0.09 });
    tone({ freq: 783.99, type: 'triangle', duration: 0.2, peak: 0.2, delay: 0.18 });
  },

  // Harsh low buzzer for crisis events.
  crisisBuzzer() {
    sweep({ from: 220, to: 110, type: 'sawtooth', duration: 0.25, peak: 0.22 });
    sweep({ from: 200, to: 90, type: 'sawtooth', duration: 0.3, peak: 0.18, delay: 0.15 });
  },

  // Cash register "cha-ching" for an upgrade purchase.
  cashRegister() {
    tone({ freq: 1400, type: 'square', duration: 0.05, peak: 0.1 });
    tone({ freq: 1800, type: 'square', duration: 0.05, peak: 0.1, delay: 0.05 });
    noiseBurst({ duration: 0.1, peak: 0.12, delay: 0.08, filterFreq: 3000 });
  },

  // Click for hiring a manager.
  hire() {
    tone({ freq: 440, type: 'sine', duration: 0.06, peak: 0.15 });
    tone({ freq: 550, type: 'sine', duration: 0.1, peak: 0.15, delay: 0.05 });
  },

  // Positive choice confirmation.
  choicePositive() {
    tone({ freq: 700, type: 'sine', duration: 0.15, peak: 0.16 });
  },

  // Negative choice confirmation.
  choiceNegative() {
    sweep({ from: 400, to: 200, type: 'sine', duration: 0.18, peak: 0.16 });
  },

  // Big fanfare for winning endings (IPO, Legendary Founder).
  victoryFanfare() {
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      tone({ freq, type: 'triangle', duration: 0.3, peak: 0.22, delay: i * 0.14 });
    });
  },

  // Somber descending tone for losing endings (burnout, bankruptcy).
  gameOverTone() {
    sweep({ from: 300, to: 60, type: 'sine', duration: 0.9, peak: 0.2 });
  },

  // Bright, distinct sting for a permanent achievement unlock.
  achievementUnlock() {
    tone({ freq: 784, type: 'triangle', duration: 0.1, peak: 0.16 });
    tone({ freq: 987.77, type: 'triangle', duration: 0.1, peak: 0.16, delay: 0.08 });
    tone({ freq: 1174.66, type: 'sine', duration: 0.28, peak: 0.2, delay: 0.16 });
  },

  // Gentle tick for prestige / sale confirmation.
  prestigeChime() {
    tone({ freq: 880, type: 'sine', duration: 0.1, peak: 0.15 });
    tone({ freq: 1108.73, type: 'sine', duration: 0.15, peak: 0.15, delay: 0.08 });
    tone({ freq: 1318.5, type: 'sine', duration: 0.25, peak: 0.18, delay: 0.18 });
  },

  // Soft click for generic UI interactions.
  uiClick() {
    tone({ freq: 300, type: 'square', duration: 0.03, peak: 0.06 });
  },
};
