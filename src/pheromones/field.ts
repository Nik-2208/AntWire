/**
 * ANT BRAIN — Spatial Pheromone Field System
 * Continuous-space, grid-discretized chemical signaling with exponential decay, Laplacian diffusion,
 * and multi-channel biological communication (FOOD, HOME, RECRUITMENT, DANGER, TASK, EXPLORE).
 */

import { PheromoneChannel, PheromoneDepositRecord, PheromoneType, Vector2D } from '../simulation/types';

export interface PheromoneFieldConfig {
  worldWidth: number;   // physical world dimensions (e.g. 80 meters)
  worldHeight: number;  // physical world dimensions (e.g. 80 meters)
  resolution: number;   // grid cells per axis (e.g. 120x120)
  decayRates: number[]; // [Food, Home, Recruitment, Danger, Task, Explore] decay rate per second
  diffusionRates: number[]; // diffusion coefficients D
  maxConcentration: number;
}

export class PheromoneField {
  public config: PheromoneFieldConfig;
  public width: number;
  public height: number;
  public gridRes: number;
  public cellSize: number;
  public halfWorldW: number;
  public halfWorldH: number;

  // Float32Arrays for 6 channels: [FOOD, HOME, RECRUITMENT, DANGER, TASK, EXPLORE]
  public channels: Float32Array[];
  private tempBuffer: Float32Array;

  // Audit history of recent biological chemical deposits
  public depositHistory: PheromoneDepositRecord[] = [];
  public readonly maxHistoryRecords: number = 60;

  constructor(config?: Partial<PheromoneFieldConfig>) {
    this.config = {
      worldWidth: 80.0,
      worldHeight: 80.0,
      resolution: 120, // 120x120 grid cells
      decayRates: [0.035, 0.025, 0.05, 0.09, 0.04, 0.03], // Food, Home, Recruitment, Danger/Alarm, Task, Explore
      diffusionRates: [0.12, 0.10, 0.15, 0.22, 0.10, 0.12],
      maxConcentration: 10.0,
      ...config,
    };

    this.width = this.config.worldWidth;
    this.height = this.config.worldHeight;
    this.gridRes = this.config.resolution;
    this.cellSize = this.width / this.gridRes;
    this.halfWorldW = this.width * 0.5;
    this.halfWorldH = this.height * 0.5;

    const totalCells = this.gridRes * this.gridRes;
    this.channels = [
      new Float32Array(totalCells), // 0: FOOD
      new Float32Array(totalCells), // 1: HOME
      new Float32Array(totalCells), // 2: RECRUITMENT
      new Float32Array(totalCells), // 3: DANGER / ALARM
      new Float32Array(totalCells), // 4: TASK
      new Float32Array(totalCells), // 5: EXPLORE
    ];
    this.tempBuffer = new Float32Array(totalCells);
  }

  /**
   * Converts world coordinates (centered at 0,0) to continuous grid indices
   */
  public worldToGrid(wx: number, wy: number): { gx: number; gy: number } {
    const gx = ((wx + this.halfWorldW) / this.width) * (this.gridRes - 1);
    const gy = ((wy + this.halfWorldH) / this.height) * (this.gridRes - 1);
    return { gx, gy };
  }

  /**
   * Continuous bilinear chemical interpolation sample
   */
  public sample(wx: number, wy: number, channel: PheromoneChannel | number): number {
    const chIdx = Math.min(this.channels.length - 1, Math.max(0, channel as number));
    const { gx, gy } = this.worldToGrid(wx, wy);
    if (gx < 0 || gx >= this.gridRes - 1 || gy < 0 || gy >= this.gridRes - 1) {
      return 0.0;
    }

    const x0 = Math.floor(gx);
    const x1 = x0 + 1;
    const y0 = Math.floor(gy);
    const y1 = y0 + 1;

    const fx = gx - x0;
    const fy = gy - y0;

    const data = this.channels[chIdx] || this.channels[0];
    const res = this.gridRes;

    const v00 = data[y0 * res + x0];
    const v10 = data[y0 * res + x1];
    const v01 = data[y1 * res + x0];
    const v11 = data[y1 * res + x1];

    const top = v00 * (1 - fx) + v10 * fx;
    const btm = v01 * (1 - fx) + v11 * fx;
    const val = top * (1 - fy) + btm * fy;

    return Math.min(1.0, val / this.config.maxConcentration);
  }

  /**
   * Samples a specific antennae sensor ray (offset by angle from body heading at distance)
   */
  public sampleRay(
    wx: number,
    wy: number,
    heading: number,
    angleOffset: number,
    distance: number,
    channel: PheromoneChannel | number
  ): { concentration: number; point: Vector2D } {
    const sampleAngle = heading + angleOffset;
    const sx = wx + Math.cos(sampleAngle) * distance;
    const sy = wy + Math.sin(sampleAngle) * distance;
    const concentration = this.sample(sx, sy, channel);
    return { concentration, point: { x: sx, y: sy } };
  }

  /**
   * Computes the 2D spatial gradient vector (dC/dx, dC/dy) around a point
   */
  public sampleGradient(wx: number, wy: number, channel: PheromoneChannel | number): Vector2D {
    const delta = this.cellSize * 0.5;
    const cEast = this.sample(wx + delta, wy, channel);
    const cWest = this.sample(wx - delta, wy, channel);
    const cNorth = this.sample(wx, wy + delta, channel);
    const cSouth = this.sample(wx, wy - delta, channel);

    return {
      x: (cEast - cWest) / (2 * delta),
      y: (cNorth - cSouth) / (2 * delta),
    };
  }

  /**
   * Deposit chemical at world coordinate (wx, wy) with a soft 3x3 footprint,
   * non-linear diminishing returns, and structured event recording.
   */
  public deposit(
    wxOrRecord: number | PheromoneDepositRecord,
    wy?: number,
    channel?: PheromoneChannel | number,
    amount?: number,
    meta?: Partial<PheromoneDepositRecord>
  ): void {
    let wx: number;
    let yCoord: number;
    let ch: number;
    let amt: number;
    let antId = meta?.antId || 'unknown';
    let timestamp = meta?.timestamp || performance.now() / 1000;
    let decayRate = meta?.decayRate;

    if (typeof wxOrRecord === 'object') {
      const rec = wxOrRecord as PheromoneDepositRecord;
      wx = rec.position.x;
      yCoord = rec.position.y;
      ch = typeof rec.type === 'number' ? rec.type : this.channelNameToIndex(rec.type);
      amt = rec.strength;
      antId = rec.antId;
      timestamp = rec.timestamp;
      decayRate = rec.decayRate;
    } else {
      wx = wxOrRecord;
      yCoord = wy ?? 0;
      ch = typeof channel === 'number' ? channel : 0;
      amt = amount ?? 0;
    }

    if (amt <= 0) return;
    ch = Math.min(this.channels.length - 1, Math.max(0, ch));

    const { gx, gy } = this.worldToGrid(wx, yCoord);
    const cx = Math.round(gx);
    const cy = Math.round(gy);

    const res = this.gridRes;
    const data = this.channels[ch] || this.channels[0];
    const maxVal = this.config.maxConcentration;

    // Distribute around 3x3 footprint with non-linear saturation damping
    for (let dy = -1; dy <= 1; dy++) {
      const ny = cy + dy;
      if (ny < 0 || ny >= res) continue;

      for (let dx = -1; dx <= 1; dx++) {
        const nx = cx + dx;
        if (nx < 0 || nx >= res) continue;

        const weight = (dx === 0 && dy === 0) ? 1.0 : (dx === 0 || dy === 0) ? 0.3 : 0.1;
        const idx = ny * res + nx;
        const current = data[idx];
        // Diminishing returns: saturation damping prevents runaway spikes
        const headroom = Math.max(0, (maxVal - current) / maxVal);
        const gain = amt * weight * headroom;
        data[idx] = Math.min(maxVal, current + gain);
      }
    }

    // Record audit event in ring buffer
    this.depositHistory.unshift({
      antId,
      type: ch as PheromoneChannel,
      position: { x: wx, y: yCoord },
      strength: amt,
      timestamp,
      decayRate: decayRate ?? (this.config.decayRates[ch] || 0.035),
    });
    if (this.depositHistory.length > this.maxHistoryRecords) {
      this.depositHistory.pop();
    }
  }

  private channelNameToIndex(name: PheromoneType | string): number {
    switch (name) {
      case 'FOOD': return 0;
      case 'HOME': return 1;
      case 'RECRUITMENT': return 2;
      case 'DANGER': return 3;
      case 'TASK': return 4;
      case 'EXPLORE': return 5;
      default: return 0;
    }
  }

  /**
   * Update chemical decay (exponential evaporation) and 2D Laplacian diffusion
   */
  public update(dt: number): void {
    const res = this.gridRes;

    for (let c = 0; c < this.channels.length; c++) {
      const data = this.channels[c];
      const decay = Math.exp(-(this.config.decayRates[c] || 0.035) * dt);
      const diffCoeff = (this.config.diffusionRates[c] || 0.1) * dt;

      // Copy to temp buffer for simultaneous stencil update
      this.tempBuffer.set(data);

      for (let y = 1; y < res - 1; y++) {
        const rowOffset = y * res;
        for (let x = 1; x < res - 1; x++) {
          const idx = rowOffset + x;
          const center = this.tempBuffer[idx];

          if (center < 0.0005) {
            data[idx] = 0;
            continue;
          }

          // 5-point discrete Laplacian operator
          const north = this.tempBuffer[idx - res];
          const south = this.tempBuffer[idx + res];
          const west = this.tempBuffer[idx - 1];
          const east = this.tempBuffer[idx + 1];

          const laplacian = (north + south + west + east - 4 * center);
          let nextVal = (center + diffCoeff * laplacian) * decay;

          if (nextVal < 0.0005) nextVal = 0;
          data[idx] = Math.min(this.config.maxConcentration, nextVal);
        }
      }
    }
  }

  public getMaxConcentration(): number {
    let max = 0;
    for (let c = 0; c < this.channels.length; c++) {
      const arr = this.channels[c];
      for (let i = 0; i < arr.length; i++) {
        if (arr[i] > max) max = arr[i];
      }
    }
    return max;
  }

  public clear(): void {
    for (let c = 0; c < this.channels.length; c++) {
      this.channels[c].fill(0);
    }
    this.depositHistory = [];
  }
}
