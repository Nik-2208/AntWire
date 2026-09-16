/**
 * ANT BRAIN — Simulation Clock
 * Decouples deterministic fixed-timestep physics/simulation ticks from variable render frame rates.
 */

export class SimulationClock {
  public isPaused: boolean = false;
  public timeScale: number = 1.0; // 1x, 2x, 5x, 10x, 50x, 100x
  public fixedDt: number = 1 / 60; // 60Hz fixed simulation step (~0.01667s)
  public simTime: number = 0; // Accumulated simulation time in seconds
  public tickCount: number = 0; // Total simulation steps executed
  public accumulator: number = 0; // Wall-clock time accumulator for fixed timestep integration

  // Performance telemetry
  public lastFps: number = 60;
  public lastTps: number = 60; // ticks per second
  private tickCounter: number = 0;
  private lastTpsCheck: number = performance.now();

  constructor(fixedDt = 1 / 60) {
    this.fixedDt = fixedDt;
  }

  public togglePause(): boolean {
    this.isPaused = !this.isPaused;
    return this.isPaused;
  }

  public setPaused(paused: boolean): void {
    this.isPaused = paused;
  }

  public setTimeScale(scale: number): void {
    this.timeScale = Math.max(0.1, Math.min(100.0, scale));
  }

  /**
   * Advances wall-clock time and returns how many fixed ticks should execute.
   */
  public advanceWallClock(wallDt: number): number {
    if (this.isPaused) return 0;

    // Clamp maximum wallDt to avoid spiral-of-death on lag spikes
    const clampedWallDt = Math.min(wallDt, 0.1);
    this.accumulator += clampedWallDt * this.timeScale;

    let ticksToRun = 0;
    // Cap max ticks per frame to 10 to ensure responsive UI even at high speed
    const maxTicksPerFrame = Math.max(1, Math.min(30, Math.ceil(this.timeScale * 2)));

    while (this.accumulator >= this.fixedDt && ticksToRun < maxTicksPerFrame) {
      this.accumulator -= this.fixedDt;
      this.simTime += this.fixedDt;
      this.tickCount++;
      this.tickCounter++;
      ticksToRun++;
    }

    // Keep leftover accumulator bounded
    if (this.accumulator > this.fixedDt * 2) {
      this.accumulator = 0;
    }

    this.updateTpsStats();
    return ticksToRun;
  }

  /**
   * Execute single fixed-step tick manually (for debugging / step-by-step analysis)
   */
  public stepOnce(): void {
    this.simTime += this.fixedDt;
    this.tickCount++;
    this.tickCounter++;
  }

  private updateTpsStats(): void {
    const now = performance.now();
    const elapsed = now - this.lastTpsCheck;
    if (elapsed >= 1000) {
      this.lastTps = (this.tickCounter * 1000) / elapsed;
      this.tickCounter = 0;
      this.lastTpsCheck = now;
    }
  }

  public reset(): void {
    this.simTime = 0;
    this.tickCount = 0;
    this.accumulator = 0;
    this.tickCounter = 0;
  }
}
