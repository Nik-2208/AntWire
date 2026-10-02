/**
 * ANTWIRE — Pheromone Field 3D Heatmap & Trail Visualization
 * High-performance canvas texture projection for glowing chemical trails.
 */

import * as THREE from 'three';
import { PheromoneField } from '../pheromones/field';

export class PheromoneOverlay {
  public mesh: THREE.Mesh;
  public isVisible: boolean = true;

  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private texture: THREE.CanvasTexture;
  private res: number;
  private imgData: ImageData;

  constructor(worldWidth: number, worldHeight: number, fieldResolution = 120) {
    this.res = fieldResolution;
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.res;
    this.canvas.height = this.res;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D canvas context for pheromone visualizer');
    this.ctx = ctx;
    this.imgData = this.ctx.createImageData(this.res, this.res);

    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.magFilter = THREE.LinearFilter;

    // Ground plane aligned with terrain
    const geo = new THREE.PlaneGeometry(worldWidth, worldHeight);
    geo.rotateX(-Math.PI / 2); // Lay flat on XZ plane

    const mat = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.55,
    });

    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.y = 0.06; // Elevated above terrain (0.0) and grid (0.02)
    this.mesh.renderOrder = 3;
  }

  /**
   * Render continuous chemical channels into the canvas texture
   */
  public updateTexture(field: PheromoneField): void {
    if (!this.isVisible) {
      this.mesh.visible = false;
      return;
    }
    this.mesh.visible = true;

    const data = this.imgData.data;
    const foodChannel = field.channels[0];
    const homeChannel = field.channels[1];
    const recruitmentChannel = field.channels[2];
    const dangerChannel = field.channels[3];
    const taskChannel = field.channels[4];
    const exploreChannel = field.channels[5];
    const totalPixels = this.res * this.res;

    for (let i = 0; i < totalPixels; i++) {
      const fRaw = foodChannel ? foodChannel[i] : 0;
      const hRaw = homeChannel ? homeChannel[i] : 0;
      const rRaw = recruitmentChannel ? recruitmentChannel[i] : 0;
      const dRaw = dangerChannel ? dangerChannel[i] : 0;
      const tRaw = taskChannel ? taskChannel[i] : 0;
      const eRaw = exploreChannel ? exploreChannel[i] : 0;

      const pIdx = i * 4;

      if (fRaw < 0.005 && hRaw < 0.005 && rRaw < 0.005 && dRaw < 0.005 && tRaw < 0.005 && eRaw < 0.005) {
        data[pIdx] = 0;
        data[pIdx + 1] = 0;
        data[pIdx + 2] = 0;
        data[pIdx + 3] = 0;
        continue;
      }

      // Smooth, natural linear-gamma scaling (balanced, non-glaring)
      const fNorm = Math.min(1.0, Math.pow(fRaw / 2.2, 0.8));
      const hNorm = Math.min(1.0, Math.pow(hRaw / 2.2, 0.8));
      const rNorm = Math.min(1.0, Math.pow(rRaw / 2.0, 0.8));
      const dNorm = Math.min(1.0, Math.pow(dRaw / 1.8, 0.8));
      const tNorm = Math.min(1.0, Math.pow(tRaw / 1.8, 0.8));
      const eNorm = Math.min(1.0, Math.pow(eRaw / 2.2, 0.8));

      const maxNorm = Math.max(fNorm, hNorm, rNorm, dNorm, tNorm, eNorm);
      if (maxNorm < 0.01) {
        data[pIdx + 3] = 0;
        continue;
      }

      // Refined, soft bio-chemical palette (restrained, realistic chemical gradients):
      // Food Trail: Soft Organic Emerald (16, 185, 110)
      // Home / Scout Trail: Muted Electric Cyan (6, 160, 205)
      // Recruitment: Warm Amber (210, 140, 20)
      // Danger / Alarm: Soft Crimson (200, 40, 60)
      // Task Stigmergy: Subdued Violet (140, 70, 210)
      // Explore Territory: Muted Azure (45, 150, 200)

      const r = Math.min(255, Math.round(fNorm * 16 + hNorm * 6 + rNorm * 210 + dNorm * 200 + tNorm * 140 + eNorm * 45));
      const g = Math.min(255, Math.round(fNorm * 185 + hNorm * 160 + rNorm * 140 + dNorm * 40 + tNorm * 70 + eNorm * 150));
      const b = Math.min(255, Math.round(fNorm * 110 + hNorm * 205 + rNorm * 20 + dNorm * 60 + tNorm * 210 + eNorm * 200));
      const alpha = Math.min(180, Math.round(maxNorm * 135 + 15));

      data[pIdx] = r;
      data[pIdx + 1] = g;
      data[pIdx + 2] = b;
      data[pIdx + 3] = alpha;
    }

    this.ctx.putImageData(this.imgData, 0, 0);
    this.texture.needsUpdate = true;
  }
}
