/**
 * ANT BRAIN — Spatial Pheromone Field System
 * Continuous-space, grid-discretized chemical signaling with exponential decay and Laplacian diffusion.
 */

import { PheromoneChannel, Vector2D } from '../simulation/types';

export interface PheromoneFieldConfig {
  worldWidth: number;   // physical world dimensions (e.g. 100 meters)
  worldHeight: number;  // physical world dimensions (e.g. 100 meters)
  resolution: number;   // grid cells per axis (e.g. 128x128)
  decayRates: number[]; // [FoodTrail, HomeTrail, Alarm, Recruitment] decay rate per second (lambda)
  diffusionRates: number[]; // diffusion coefficient D
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

  // Float32Arrays for 4 channels: [FoodTrail, HomeTrail, Alarm, Recruitment]
  public channels: Float32Array[];
  private tempBuffer: Float32Array;

  constructor(config?: Partial<PheromoneFieldConfig>) {
    this.config = {
      worldWidth: 80.0,
      worldHeight: 80.0,
      resolution: 120, // 120x120 grid cells
      decayRates: [0.035, 0.025, 0.08, 0.05], // food, home, alarm, recruitment
      diffusionRates: [0.12, 0.1, 0.2, 0.15],
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
      new Float32Array(totalCells),
      new Float32Array(totalCells),
      new Float32Array(totalCells),
      new Float32Array(totalCells),
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
  public sample(wx: number, wy: number, channel: PheromoneChannel): number {
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

    const data = this.channels[channel] || this.channels[0];
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
    channel: PheromoneChannel
  ): { concentration: number; point: Vector2D } {
    const sampleAngle = heading + angleOffset;
    const sx = wx + Math.cos(sampleAngle) * distance;
    const sy = wy + Math.sin(sampleAngle) * distance;
    const concentration = this.sample(sx, sy, channel);
    return { concentration, point: { x: sx, y: sy } };
  }

  /**
   * Deposit chemical at world coordinate (wx, wy) with a soft 3x3 footprint
   */
  public deposit(
    wx: number,
    wy: number,
    channel: PheromoneChannel,
    amount: number
  ): void {
    if (amount <= 0) return;
    const { gx, gy } = this.worldToGrid(wx, wy);
    const cx = Math.round(gx);
    const cy = Math.round(gy);

    const res = this.gridRes;
    const data = this.channels[channel] || this.channels[0];
    const maxVal = this.config.maxConcentration;

    // Distribute around 3x3 footprint
    for (let dy = -1; dy <= 1; dy++) {
      const ny = cy + dy;
      if (ny < 0 || ny >= res) continue;

      for (let dx = -1; dx <= 1; dx++) {
        const nx = cx + dx;
        if (nx < 0 || nx >= res) continue;

        const weight = (dx === 0 && dy === 0) ? 0.6 : 0.1;
        const idx = ny * res + nx;
        data[idx] = Math.min(maxVal, data[idx] + amount * weight);
      }
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

          if (center < 0.001) {
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

          if (nextVal < 0.001) nextVal = 0;
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
  }
}
