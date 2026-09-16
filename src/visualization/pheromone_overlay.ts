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
      opacity: 0.95,
    });

    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.y = 0.05; // Slightly above ground to prevent z-fighting
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
    const alarmChannel = field.channels[2];
    const totalPixels = this.res * this.res;

    for (let i = 0; i < totalPixels; i++) {
      const fVal = foodChannel[i] / field.config.maxConcentration;
      const hVal = homeChannel[i] / field.config.maxConcentration;
      const aVal = alarmChannel[i] / field.config.maxConcentration;

      const pIdx = i * 4;

      if (fVal < 0.01 && hVal < 0.01 && aVal < 0.01) {
        data[pIdx + 3] = 0; // Transparent
        continue;
      }

      // Additive color composition:
      // Food Trail = Emerald Green (R=16, G=185, B=129)
      // Home Trail = Electric Cyan (R=6, G=182, B=212)
      // Alarm Trail = Crimson Red (R=239, G=68, B=68)

      const r = Math.min(255, Math.round(fVal * 16 + hVal * 6 + aVal * 239));
      const g = Math.min(255, Math.round(fVal * 185 + hVal * 182 + aVal * 68));
      const b = Math.min(255, Math.round(fVal * 129 + hVal * 212 + aVal * 68));
      const alpha = Math.min(240, Math.round((fVal * 1.2 + hVal * 0.9 + aVal * 1.5) * 255));

      data[pIdx] = r;
      data[pIdx + 1] = g;
      data[pIdx + 2] = b;
      data[pIdx + 3] = alpha;
    }

    this.ctx.putImageData(this.imgData, 0, 0);
    this.texture.needsUpdate = true;
  }
}
