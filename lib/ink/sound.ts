/**
 * The sound of writing, synthesised on the fly.
 *
 * No assets: filtered noise is the brush, and its gain follows the scroll's
 * velocity so the paper only whispers while the pen moves. Seals land with a
 * low thump; sprayed ink spatters. Everything starts from the toggle press,
 * so autoplay policy is never fought.
 */

export class InkSound {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private brushGain: GainNode | null = null;

  get running() {
    return this.ctx !== null && this.ctx.state === "running";
  }

  async start() {
    if (this.ctx) {
      await this.ctx.resume();
      this.master?.gain.setTargetAtTime(1, this.ctx.currentTime, 0.2);
      return;
    }
    const ctx = new AudioContext();
    this.ctx = ctx;

    const seconds = 2;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    // Paper hiss: band-passed high, quiet, gated by scroll velocity.
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = 3200;
    band.Q.value = 0.8;

    const brushGain = ctx.createGain();
    brushGain.gain.value = 0;

    const master = ctx.createGain();
    master.gain.value = 1;

    noise.connect(band).connect(brushGain).connect(master).connect(ctx.destination);
    noise.start();

    this.master = master;
    this.brushGain = brushGain;
  }

  stop() {
    if (!this.ctx || !this.master) return;
    this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.15);
    const ctx = this.ctx;
    window.setTimeout(() => { void ctx.suspend(); }, 500);
  }

  /** Velocity in px/s; the brush only sounds while the pen moves. */
  brush(velocity: number) {
    if (!this.running || !this.ctx || !this.brushGain) return;
    const level = Math.min(Math.abs(velocity) / 2600, 1) * 0.05;
    this.brushGain.gain.setTargetAtTime(level, this.ctx.currentTime, 0.08);
  }

  /** A seal landing: one low thump. */
  thump() {
    if (!this.running || !this.ctx) return;
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(140, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(52, ctx.currentTime + 0.14);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  }

  /** Ink hitting paper: a short bright spatter. */
  splat() {
    if (!this.running || !this.ctx) return;
    const ctx = this.ctx;
    const seconds = 0.16;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = 1400;
    band.Q.value = 0.9;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.14, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + seconds);
    src.connect(band).connect(gain).connect(ctx.destination);
    src.start();
    src.stop(ctx.currentTime + seconds);
  }

  dispose() {
    void this.ctx?.close();
    this.ctx = null;
    this.master = null;
    this.brushGain = null;
  }
}
