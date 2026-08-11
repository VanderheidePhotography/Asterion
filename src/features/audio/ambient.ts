/**
 * Ambient sound, synthesized entirely in WebAudio — no assets to stream.
 * A low bed of filtered noise reads as wind through a large hall; sparse
 * pentatonic chimes drift over it. On top of the bed sit SPATIAL sources —
 * the globe, the hearth, the grandfather clock, the wizards' murmur —
 * panned and attenuated against the listener's position each frame. All of
 * it is quiet, optional, and disposed cleanly on stop.
 */

const CHIME_FREQS = [523.25, 587.33, 659.25, 783.99, 880.0]; // C5 pentatonic

interface SpatialSource {
  x: number;
  z: number;
  /** distance at which the source falls silent */
  range: number;
  /** peak gain when standing on top of it */
  base: number;
  gain: GainNode;
  pan: StereoPannerNode;
}

function makeNoiseBuffer(ctx: AudioContext, seconds: number, brown: boolean): AudioBuffer {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1;
    if (brown) {
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    } else data[i] = white;
  }
  return buffer;
}

class AmbientEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private chimeTimer: number | null = null;
  private tickTimer: number | null = null;
  private murmurTimer: number | null = null;
  private crackleTimer: number | null = null;
  private sources = new Map<string, SpatialSource>();
  private tickHigh = false;

  get running(): boolean {
    return this.ctx !== null;
  }

  start(): void {
    if (this.ctx) return;
    const ctx = new AudioContext();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    master.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 2.5);

    // browsers may hand us a suspended context before a user gesture
    if (ctx.state === 'suspended') {
      const resume = () => {
        void ctx.resume();
        window.removeEventListener('pointerdown', resume);
        window.removeEventListener('keydown', resume);
      };
      window.addEventListener('pointerdown', resume);
      window.addEventListener('keydown', resume);
    }

    // — wind: looping brown noise through a slow-breathing lowpass —
    const noise = ctx.createBufferSource();
    noise.buffer = makeNoiseBuffer(ctx, 4, true);
    noise.loop = true;
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 320;
    const windGain = ctx.createGain();
    windGain.gain.value = 0.08;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.03;
    lfo.connect(lfoGain).connect(windGain.gain);
    noise.connect(lowpass).connect(windGain).connect(master);
    noise.start();
    lfo.start();

    this.ctx = ctx;
    this.master = master;
    this.buildSpatialSources();
    this.scheduleChime();
  }

  /* ————— the placed voices of the hall ————— */

  private spatial(key: string, x: number, z: number, range: number, base: number): SpatialSource {
    const ctx = this.ctx!;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    const pan = ctx.createStereoPanner();
    gain.connect(pan).connect(this.master!);
    const s: SpatialSource = { x, z, range, base, gain, pan };
    this.sources.set(key, s);
    return s;
  }

  private buildSpatialSources(): void {
    const ctx = this.ctx!;

    // the great globe at the heart of the rotunda: four tonnes of sphere on
    // its pivots, turning once every four minutes. Not water any more — a
    // deep bearing hum with a slow woody groan riding on it, so the centre of
    // the hall still has a voice as you walk up to it.
    {
      const s = this.spatial('globe', 0, 0, 14, 0.22);
      // the bearing: brown noise pushed well down, felt more than heard
      const src = ctx.createBufferSource();
      src.buffer = makeNoiseBuffer(ctx, 4, true);
      src.loop = true;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 180;
      lp.Q.value = 0.6;
      src.connect(lp).connect(s.gain);
      src.start();

      // the groan of the oak cradle taking the weight, swelling on the same
      // four-minute period as the globe's own turn
      const groan = ctx.createOscillator();
      groan.type = 'triangle';
      groan.frequency.value = 47;
      const groanGain = ctx.createGain();
      groanGain.gain.value = 0.035;
      const breathe = ctx.createOscillator();
      breathe.frequency.value = 1 / 240;
      const breatheGain = ctx.createGain();
      breatheGain.gain.value = 0.03;
      breathe.connect(breatheGain).connect(groanGain.gain);
      groan.connect(groanGain).connect(s.gain);
      groan.start();
      breathe.start();
    }

    // the hearth, west: a warm low rumble with sparse crackles
    {
      const s = this.spatial('hearth', -16.35, 0, 12, 0.4);
      const src = ctx.createBufferSource();
      src.buffer = makeNoiseBuffer(ctx, 3, true);
      src.loop = true;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 220;
      src.connect(lp).connect(s.gain);
      src.start();
      const crackle = () => {
        this.crackleTimer = window.setTimeout(crackle, 120 + Math.random() * 700);
        if (!this.ctx) return;
        const pop = ctx.createBufferSource();
        pop.buffer = makeNoiseBuffer(ctx, 0.05, false);
        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = 1500 + Math.random() * 3000;
        const g = ctx.createGain();
        const now = ctx.currentTime;
        g.gain.setValueAtTime(0.10 + Math.random() * 0.22, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
        pop.connect(hp).connect(g).connect(s.gain);
        pop.start();
      };
      crackle();
    }

    // the grandfather clock, east: tick … tock
    {
      const s = this.spatial('clock', 16.3, 0, 9, 0.5);
      const tick = () => {
        this.tickTimer = window.setTimeout(tick, 1000);
        if (!this.ctx) return;
        this.tickHigh = !this.tickHigh;
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.value = this.tickHigh ? 1900 : 1400;
        const g = ctx.createGain();
        const now = ctx.currentTime;
        g.gain.setValueAtTime(0.05, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
        osc.connect(g).connect(s.gain);
        osc.start(now);
        osc.stop(now + 0.05);
      };
      tick();
    }

    // the sages' murmur at the council table — speech-shaped noise, no words
    {
      const s = this.spatial('murmur', -3.4, 9.6, 8, 0.4);
      const src = ctx.createBufferSource();
      src.buffer = makeNoiseBuffer(ctx, 3, true);
      src.loop = true;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 260;
      bp.Q.value = 1.4;
      const talker = ctx.createGain();
      talker.gain.value = 0;
      src.connect(bp).connect(talker).connect(s.gain);
      src.start();
      const phrase = () => {
        this.murmurTimer = window.setTimeout(phrase, 700 + Math.random() * 2600);
        if (!this.ctx) return;
        // one "sentence": a few syllable swells
        const now = ctx.currentTime;
        const syllables = 2 + Math.floor(Math.random() * 5);
        let t = now;
        for (let i = 0; i < syllables; i++) {
          const len = 0.09 + Math.random() * 0.16;
          talker.gain.linearRampToValueAtTime(0.5 + Math.random() * 0.5, t + len * 0.4);
          talker.gain.linearRampToValueAtTime(0.08, t + len);
          t += len + 0.03;
        }
        talker.gain.linearRampToValueAtTime(0, t + 0.08);
      };
      phrase();
    }
  }

  /** pan + attenuate every placed source against the listener, once a frame */
  updateListener(x: number, z: number, yaw: number): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const now = ctx.currentTime;
    for (const s of this.sources.values()) {
      const dx = s.x - x;
      const dz = s.z - z;
      const dist = Math.hypot(dx, dz);
      const k = Math.max(0, 1 - dist / s.range);
      s.gain.gain.setTargetAtTime(s.base * k * k, now, 0.15);
      if (k > 0) {
        // camera forward is (-sin yaw, -cos yaw); positive pan = right ear
        const fx = -Math.sin(yaw);
        const fz = -Math.cos(yaw);
        const cross = fz * dx - fx * dz;
        s.pan.pan.setTargetAtTime(Math.max(-0.85, Math.min(0.85, (cross / (dist || 1)) * 0.85)), now, 0.15);
      }
    }
  }

  /* ————— one-shots the world can trigger ————— */

  /** a soft page-riffle for opening a grimoire */
  pageTurn(): void {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const src = ctx.createBufferSource();
    src.buffer = makeNoiseBuffer(ctx, 0.4, false);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(900, ctx.currentTime);
    bp.frequency.exponentialRampToValueAtTime(2600, ctx.currentTime + 0.28);
    bp.Q.value = 1.1;
    const g = ctx.createGain();
    const now = ctx.currentTime;
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.16, now + 0.06);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);
    src.connect(bp).connect(g).connect(master);
    src.start();
  }

  /**
   * A plucked string, for the great monochord.
   *
   * Two partials and a fast noise transient: the transient is what the ear
   * actually uses to hear "plucked" rather than "hummed", and a pure sine with
   * an envelope on it reads as a synthesiser however carefully it is shaped.
   * The second partial is an octave up and much quieter, which is roughly what
   * a stopped string on a soundboard gives.
   */
  pluck(freq: number): void {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    const body = ctx.createGain();
    body.gain.value = 0.22;
    body.connect(master);

    for (const [mult, level, decay] of [
      [1, 1, 2.6],
      [2, 0.32, 1.7],
      [3, 0.12, 1.1],
    ] as [number, number, number][]) {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = freq * mult;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(level, now + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, now + decay);
      osc.connect(g).connect(body);
      osc.start(now);
      osc.stop(now + decay + 0.05);
    }
    // the finger leaving the string
    const src = ctx.createBufferSource();
    src.buffer = makeNoiseBuffer(ctx, 0.06, false);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = freq * 4;
    bp.Q.value = 0.8;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.5, now);
    ng.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
    src.connect(bp).connect(ng).connect(body);
    src.start(now);
  }

  /**
   * A bowed, sustained tone, for the sounding plate.
   *
   * A bow does not excite one frequency, it saws — so the tone is a sawtooth
   * through a resonant low-pass, with a slow attack and a little vibrato drift.
   * A pure sine here sounds like a test signal, and the whole point of the
   * Chladni plate is that a visitor should believe a bow is being drawn.
   */
  sustain(freq: number, seconds = 2.4): void {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, now);

    // the bow catching, then settling: a small pitch scoop at the attack
    osc.frequency.linearRampToValueAtTime(freq * 0.985, now + 0.05);
    osc.frequency.linearRampToValueAtTime(freq, now + 0.25);

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(freq * 2.2, now);
    lp.frequency.linearRampToValueAtTime(freq * 5, now + 0.4);
    lp.Q.value = 3.5;

    const g = ctx.createGain();
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.16, now + 0.18);
    g.gain.setValueAtTime(0.16, now + seconds - 0.5);
    g.gain.exponentialRampToValueAtTime(0.0001, now + seconds);

    const vib = ctx.createOscillator();
    vib.frequency.value = 5.2;
    const vibGain = ctx.createGain();
    vibGain.gain.value = freq * 0.004;
    vib.connect(vibGain).connect(osc.frequency);

    osc.connect(lp).connect(g).connect(master);
    osc.start(now);
    vib.start(now);
    osc.stop(now + seconds + 0.1);
    vib.stop(now + seconds + 0.1);
  }

  /** a distant roll of thunder, for the weather beyond the windows */
  thunder(): void {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const src = ctx.createBufferSource();
    src.buffer = makeNoiseBuffer(ctx, 5, true);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(140, ctx.currentTime);
    lp.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 4);
    const g = ctx.createGain();
    const now = ctx.currentTime;
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.4, now + 0.5);
    g.gain.linearRampToValueAtTime(0.15, now + 2.2);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 4.8);
    src.connect(lp).connect(g).connect(master);
    src.start();
  }

  /** a small warm thunk — the library card being stamped */
  stamp(): void {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(310, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.12);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.22, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    osc.connect(g).connect(master);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  private scheduleChime(): void {
    const delay = 6000 + Math.random() * 14000;
    this.chimeTimer = window.setTimeout(() => {
      this.playChime();
      if (this.ctx) this.scheduleChime();
    }, delay);
  }

  private playChime(): void {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const freq = CHIME_FREQS[Math.floor(Math.random() * CHIME_FREQS.length)];
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.035, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 4);
    osc.connect(gain).connect(master);
    osc.start(now);
    osc.stop(now + 4.2);
  }

  stop(): void {
    for (const timer of [this.chimeTimer, this.tickTimer, this.murmurTimer, this.crackleTimer]) {
      if (timer !== null) clearTimeout(timer);
    }
    this.chimeTimer = this.tickTimer = this.murmurTimer = this.crackleTimer = null;
    this.sources.clear();
    const ctx = this.ctx;
    const master = this.master;
    this.ctx = null;
    this.master = null;
    if (ctx && master) {
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
      window.setTimeout(() => void ctx.close(), 900);
    }
  }
}

export const ambient = new AmbientEngine();
