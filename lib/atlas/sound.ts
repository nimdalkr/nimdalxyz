/**
 * The sound of the dive, synthesised on the fly.
 *
 * No audio assets: a looped brown-noise buffer through a low-pass filter is
 * the water, an LFO breathes the filter like a swell, and station changes ring
 * a soft sonar ping over a filtered whoosh. Deeper means darker, literally:
 * the filter closes as the diver descends.
 *
 * Everything starts from a user gesture, so autoplay policy is never fought.
 */

export class DiveSound {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private lfo: OscillatorNode | null = null;

  get running() {
    return this.ctx !== null && this.ctx.state === "running" && this.master !== null;
  }

  async start() {
    if (this.ctx) {
      await this.ctx.resume();
      this.master?.gain.setTargetAtTime(0.07, this.ctx.currentTime, 0.4);
      return;
    }

    const ctx = new AudioContext();
    this.ctx = ctx;

    // Brown noise: integrate white noise so the rumble sits low.
    const seconds = 4;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 240;
    filter.Q.value = 0.6;

    // The swell: a slow wobble on the filter so the water never sits still.
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 60;
    lfo.connect(lfoGain).connect(filter.frequency);

    const master = ctx.createGain();
    master.gain.value = 0;

    noise.connect(filter).connect(master).connect(ctx.destination);
    noise.start();
    lfo.start();

    this.master = master;
    this.filter = filter;
    this.lfo = lfo;

    master.gain.setTargetAtTime(0.07, ctx.currentTime, 0.6);
  }

  stop() {
    if (!this.ctx || !this.master) return;
    this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.25);
    const ctx = this.ctx;
    window.setTimeout(() => { void ctx.suspend(); }, 700);
  }

  /** Deeper is darker: the water closes over the low-pass as depth grows. */
  setDepth(depth: number) {
    if (!this.ctx || !this.filter) return;
    const target = 260 - depth * 170;
    this.filter.frequency.setTargetAtTime(target, this.ctx.currentTime, 0.8);
  }

  /** A soft sonar ping, rung once per station arrival. */
  ping() {
    if (!this.running || !this.ctx) return;
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = 460 + Math.random() * 240;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.045, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.4);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 1.5);
  }

  /** Water rushing past: a band-passed noise burst for travel and dives. */
  whoosh(strength = 1) {
    if (!this.running || !this.ctx) return;
    const ctx = this.ctx;
    const seconds = 0.8;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.Q.value = 1.1;
    band.frequency.setValueAtTime(160, ctx.currentTime);
    band.frequency.exponentialRampToValueAtTime(720, ctx.currentTime + 0.22);
    band.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + seconds);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.09 * strength, ctx.currentTime + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + seconds);
    src.connect(band).connect(gain).connect(ctx.destination);
    src.start();
    src.stop(ctx.currentTime + seconds);
  }

  dispose() {
    this.lfo?.stop();
    void this.ctx?.close();
    this.ctx = null;
    this.master = null;
    this.filter = null;
    this.lfo = null;
  }
}
