/**
 * ANT BRAIN — Deterministic Pseudo-Random Number Generator (Mulberry32)
 * Ensures reproducible scientific experiments across any machine.
 */

export class SeededRNG {
  private state: number;
  private readonly initialSeed: number;

  constructor(seed: number | string = 12345) {
    if (typeof seed === 'string') {
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        hash = Math.imul(31, hash) + seed.charCodeAt(i) | 0;
      }
      this.state = hash >>> 0;
    } else {
      this.state = Math.floor(Math.abs(seed)) >>> 0 || 1;
    }
    this.initialSeed = this.state;
  }

  /**
   * Generates a deterministic pseudo-random float in range [0, 1)
   */
  public next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Random float between min (inclusive) and max (exclusive)
   */
  public range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  /**
   * Random integer between min (inclusive) and max (inclusive)
   */
  public int(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }

  /**
   * Random Gaussian / Normal distribution via Box-Muller transform
   */
  public gaussian(mean = 0, stdDev = 1): number {
    const u1 = Math.max(1e-7, this.next());
    const u2 = this.next();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return mean + z0 * stdDev;
  }

  /**
   * Boolean with probability p
   */
  public chance(p: number): boolean {
    return this.next() < p;
  }

  /**
   * Reset the generator back to its initial seed
   */
  public reset(): void {
    this.state = this.initialSeed;
  }

  public getSeed(): number {
    return this.initialSeed;
  }
}
