/**
 * ANTWIRE — 2D Top-Down Canvas Simulator (Lightweight & Failsafe View)
 * High-performance 2D Canvas fallback ensuring the simulation is 100% observable on any GPU.
 */

import { SimulationWorld } from '../simulation/world';
import { PheromoneChannel } from '../simulation/types';

export class Canvas2DRenderer {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public world: SimulationWorld;
  public selectedAntId: string | null = null;
  public showPheromones: boolean = true;
  public showSensorRays: boolean = true;

  // Pan & Zoom state
  public zoom: number = 10.0; // pixels per simulation meter
  public offsetX: number = 0;
  public offsetY: number = 0;
  private isDragging: boolean = false;
  private dragStartX: number = 0;
  private dragStartY: number = 0;

  public onSelectEntity?: (type: 'ANT' | 'QUEEN' | 'FOOD' | 'PREDATOR' | 'GROUND', id?: string, worldPos?: { x: number; y: number }) => void;

  constructor(canvas: HTMLCanvasElement, world: SimulationWorld) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Could not obtain 2D rendering context');
    this.ctx = ctx;
    this.world = world;

    this.setupInteractions();
  }

  public focusOnPosition(pos: { x: number; y: number }, targetZoom = 14.0): void {
    this.zoom = targetZoom;
    this.offsetX = -pos.x * this.zoom;
    this.offsetY = -pos.y * this.zoom;
  }

  private setupInteractions(): void {
    const canvas = this.canvas;

    canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.dragStartX = e.clientX - this.offsetX;
      this.dragStartY = e.clientY - this.offsetY;
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      this.offsetX = e.clientX - this.dragStartX;
      this.offsetY = e.clientY - this.dragStartY;
    });

    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left - canvas.width / 2;
      const mouseY = e.clientY - rect.top - canvas.height / 2;

      const prevZoom = this.zoom;
      const zoomFactor = e.deltaY < 0 ? 1.18 : 0.82;
      const newZoom = Math.max(0.3, Math.min(70.0, prevZoom * zoomFactor));

      // Anchor zoom around cursor position
      this.offsetX -= (mouseX - this.offsetX) * (newZoom / prevZoom - 1);
      this.offsetY -= (mouseY - this.offsetY) * (newZoom / prevZoom - 1);
      this.zoom = newZoom;
    }, { passive: false });

    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const centerX = canvas.width / 2 + this.offsetX;
      const centerY = canvas.height / 2 + this.offsetY;

      const worldX = (clickX - centerX) / this.zoom;
      const worldY = (clickY - centerY) / this.zoom;

      // Check click on ants
      const colony = this.world.colonies[0];
      if (colony) {
        for (const ant of colony.ants) {
          const dx = ant.body.position.x - worldX;
          const dy = ant.body.position.y - worldY;
          if (Math.sqrt(dx * dx + dy * dy) <= ant.body.radius + 1.0) {
            this.selectedAntId = ant.id;
            if (this.onSelectEntity) this.onSelectEntity('ANT', ant.id);
            return;
          }
        }
      }

      // Check ground click
      if (this.onSelectEntity) {
        this.onSelectEntity('GROUND', undefined, { x: worldX, y: worldY });
      }
    });
  }

  public resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  public render(): void {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const worldW = this.world.config.width;
    const worldH = this.world.config.height;

    // 1. Clear background
    ctx.fillStyle = '#0a0e17';
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    const centerX = w / 2 + this.offsetX;
    const centerY = h / 2 + this.offsetY;
    ctx.translate(centerX, centerY);
    ctx.scale(this.zoom, this.zoom);

    // 2. World Bounds & Grid
    ctx.fillStyle = '#111827';
    ctx.fillRect(-worldW / 2, -worldH / 2, worldW, worldH);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.08;

    const step = 5;
    for (let x = -worldW / 2; x <= worldW / 2; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, -worldH / 2);
      ctx.lineTo(x, worldH / 2);
      ctx.stroke();
    }
    for (let y = -worldH / 2; y <= worldH / 2; y += step) {
      ctx.beginPath();
      ctx.moveTo(-worldW / 2, y);
      ctx.lineTo(worldW / 2, y);
      ctx.stroke();
    }

    // 3. Pheromone Heatmap
    if (this.showPheromones) {
      this.drawPheromones(ctx);
    }

    // 4. Draw Comprehensive Nest Network (Main Hive + Subnests + Subterranean Chambers + Interconnections)
    const colony = this.world.colonies[0];
    if (colony) {
      const nest = colony.nest;

      // (A) Draw Inter-Nest Connecting Tunnels
      if (nest.interconnections) {
        for (const ic of nest.interconnections) {
          ctx.save();
          if (ic.isExcavated) {
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
            ctx.lineWidth = 0.25;
            ctx.setLineDash([]);
          } else {
            ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
            ctx.lineWidth = 0.18;
            ctx.setLineDash([0.4, 0.4]);
          }
          ctx.beginPath();
          ctx.moveTo(ic.fromPosition.x, ic.fromPosition.y);
          ctx.lineTo(ic.toPosition.x, ic.toPosition.y);
          ctx.stroke();
          ctx.restore();
        }
      }

      // (B) Draw Subterranean Inter-Chamber Tunnels
      const allTunnels = nest.getAllTunnels ? nest.getAllTunnels() : nest.tunnels || [];
      const allChambers = nest.getAllChambers ? nest.getAllChambers() : nest.chambers || [];
      const chamberMap = new Map(allChambers.map((c) => [c.id, c]));

      ctx.save();
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.7)';
      ctx.lineWidth = 0.2;
      for (const t of allTunnels) {
        const fromC = chamberMap.get(t.fromChamberId);
        const toC = chamberMap.get(t.toChamberId);
        if (fromC && toC) {
          ctx.beginPath();
          ctx.moveTo(fromC.position.x, fromC.position.y);
          ctx.lineTo(toC.position.x, toC.position.y);
          ctx.stroke();
        }
      }
      ctx.restore();

      // (C) Draw Subterranean Chambers
      const chamberColorMap: Record<string, { fill: string; stroke: string }> = {
        ENTRANCE: { fill: 'rgba(6, 182, 212, 0.25)', stroke: '#06b6d4' },
        GENERAL: { fill: 'rgba(56, 189, 248, 0.25)', stroke: '#38bdf8' },
        FOOD_STORAGE: { fill: 'rgba(16, 185, 129, 0.3)', stroke: '#10b981' },
        BROOD_NURSERY: { fill: 'rgba(244, 63, 94, 0.3)', stroke: '#f43f5e' },
        QUEEN_CHAMBER: { fill: 'rgba(245, 158, 11, 0.35)', stroke: '#f59e0b' },
        REST_AREA: { fill: 'rgba(129, 140, 248, 0.25)', stroke: '#818cf8' },
        WATER_STORAGE: { fill: 'rgba(59, 130, 246, 0.25)', stroke: '#3b82f6' },
        DEFENSE: { fill: 'rgba(249, 115, 22, 0.25)', stroke: '#f97316' },
        WASTE_AREA: { fill: 'rgba(100, 116, 139, 0.25)', stroke: '#64748b' },
      };

      for (const ch of allChambers) {
        if (ch.depth <= 0.1) continue; // Surface entrance is rendered as main mound below
        const colors = chamberColorMap[ch.type] || { fill: 'rgba(56, 189, 248, 0.2)', stroke: '#38bdf8' };
        const rad = Math.max(0.8, ch.radius * 0.5 * (ch.isExcavated ? 1.0 : ch.excavationProgress));

        ctx.fillStyle = colors.fill;
        ctx.strokeStyle = colors.stroke;
        ctx.lineWidth = 0.08;
        ctx.beginPath();
        ctx.arc(ch.position.x, ch.position.y, rad, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        if (ch.type === 'FOOD_STORAGE' && (ch.storedFood || 0) > 0) {
          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.arc(ch.position.x, ch.position.y, Math.min(rad * 0.7, 0.3 + (ch.storedFood || 0) * 0.02), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // (D) Draw Main Nest Mound
      ctx.fillStyle = 'rgba(6, 182, 212, 0.18)';
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 0.14;
      ctx.beginPath();
      ctx.arc(nest.entrancePosition.x, nest.entrancePosition.y, nest.entranceRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#030712';
      ctx.beginPath();
      ctx.arc(nest.entrancePosition.x, nest.entrancePosition.y, 1.2, 0, Math.PI * 2);
      ctx.fill();

      // (E) Draw Subnests
      if (nest.subnests) {
        for (const sub of nest.subnests) {
          const isEst = sub.isEstablished;
          const typeColor = sub.type === 'SATELLITE_FORAGING' ? '#10b981' : sub.type === 'BROOD_EXPANSION' ? '#f43f5e' : '#38bdf8';

          // Outer boundary
          ctx.fillStyle = isEst ? 'rgba(56, 189, 248, 0.15)' : 'rgba(245, 158, 11, 0.1)';
          ctx.strokeStyle = isEst ? typeColor : '#f59e0b';
          ctx.lineWidth = 0.12;
          ctx.beginPath();
          ctx.arc(sub.entrancePosition.x, sub.entrancePosition.y, sub.entranceRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Construction progress arc ring
          if (!isEst) {
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 0.22;
            ctx.beginPath();
            ctx.arc(
              sub.entrancePosition.x,
              sub.entrancePosition.y,
              sub.entranceRadius + 0.3,
              -Math.PI / 2,
              -Math.PI / 2 + Math.PI * 2 * Math.min(1.0, sub.constructionProgress)
            );
            ctx.stroke();
          }

          // Center hole
          ctx.fillStyle = '#030712';
          ctx.beginPath();
          ctx.arc(sub.entrancePosition.x, sub.entrancePosition.y, 0.9, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // (F) Draw Queen
      ctx.fillStyle = '#d97706';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 0.15;
      ctx.beginPath();
      ctx.arc(colony.queen.metrics.position.x, colony.queen.metrics.position.y, 1.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // 5. Draw Obstacles
    for (const obs of this.world.obstacles) {
      ctx.fillStyle = '#475569';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 0.1;
      ctx.beginPath();
      ctx.arc(obs.position.x, obs.position.y, obs.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // 6. Draw Food Crystals
    for (const food of this.world.foodEntities) {
      if (food.amount <= 0) continue;
      const ratio = food.amount / food.initialAmount;
      ctx.fillStyle = '#10b981';
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 0.1;
      ctx.beginPath();
      ctx.arc(food.position.x, food.position.y, Math.max(0.4, food.radius * ratio), 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Food glow aura
      ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
      ctx.beginPath();
      ctx.arc(food.position.x, food.position.y, food.radius * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 7. Draw Predators
    for (const pred of this.world.predators) {
      ctx.fillStyle = pred.profile.color || '#dc2626';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 0.15;
      ctx.beginPath();
      ctx.arc(pred.state.position.x, pred.state.position.y, pred.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Heading pointer & attack pulse
      ctx.beginPath();
      ctx.moveTo(pred.state.position.x, pred.state.position.y);
      ctx.lineTo(
        pred.state.position.x + Math.cos(pred.state.heading) * (pred.radius + 0.8),
        pred.state.position.y + Math.sin(pred.state.heading) * (pred.radius + 0.8)
      );
      ctx.stroke();

      if (pred.state.state === 'ATTACK') {
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
        ctx.lineWidth = 0.2;
        ctx.beginPath();
        ctx.arc(pred.state.position.x, pred.state.position.y, pred.radius * 1.5, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // 7b. Draw Aphids & Fungus Gardens
    if (this.world.ecology) {
      for (const aphid of this.world.ecology.aphids) {
        if (!aphid.isAlive) continue;
        ctx.fillStyle = aphid.honeydewReserve > 0.3 ? '#a3e635' : '#65a30d'; // Lime aphid
        ctx.beginPath();
        ctx.arc(aphid.position.x, aphid.position.y, 0.45, 0, Math.PI * 2);
        ctx.fill();
      }

      for (const garden of this.world.ecology.fungusGardens) {
        ctx.fillStyle = '#fef08a';
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 0.1;
        ctx.beginPath();
        ctx.arc(garden.position.x, garden.position.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }

    // 7c. Draw Corpses awaiting sanitation
    if (colony) {
      for (const corpse of colony.corpses) {
        ctx.fillStyle = '#64748b'; // Slate corpse
        ctx.beginPath();
        ctx.arc(corpse.position.x, corpse.position.y, 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 8. Draw Ants
    if (colony) {
      for (const ant of colony.ants) {
        if (!ant.internalState.state.isAlive) continue;

        const isSelected = ant.id === this.selectedAntId;
        const px = ant.body.position.x;
        const py = ant.body.position.y;
        const h = ant.body.heading;

        // Selection highlight ring
        if (isSelected) {
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 0.15;
          ctx.beginPath();
          ctx.arc(px, py, ant.body.radius + 0.6, 0, Math.PI * 2);
          ctx.stroke();

          // Draw Sensor Rays
          if (this.showSensorRays) {
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
            ctx.lineWidth = 0.06;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(ant.sensors.leftAntennaPos.x, ant.sensors.leftAntennaPos.y);
            ctx.moveTo(px, py);
            ctx.lineTo(ant.sensors.centerAntennaPos.x, ant.sensors.centerAntennaPos.y);
            ctx.moveTo(px, py);
            ctx.lineTo(ant.sensors.rightAntennaPos.x, ant.sensors.rightAntennaPos.y);
            ctx.stroke();
          }
        }

        // Ant Body (Amber/Dark Bronze for visibility)
        ctx.fillStyle = isSelected ? '#f59e0b' : '#d97706';
        ctx.beginPath();
        ctx.arc(px, py, ant.body.radius, 0, Math.PI * 2);
        ctx.fill();

        // Heading Line
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 0.08;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + Math.cos(h) * 0.9, py + Math.sin(h) * 0.9);
        ctx.stroke();

        // Carrying Food Marker
        if (ant.internalState.state.carryingFoodAmount > 0) {
          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.arc(px + Math.cos(h) * 0.7, py + Math.sin(h) * 0.7, 0.28, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    ctx.restore();
  }

  private drawPheromones(ctx: CanvasRenderingContext2D): void {
    const field = this.world.pheromones;
    const res = field.gridRes;
    const cellSize = field.cellSize;
    const halfW = field.halfWorldW;
    const halfH = field.halfWorldH;

    const foodCh = field.channels[0];
    const homeCh = field.channels[1];
    const alarmCh = field.channels[2];

    for (let y = 0; y < res; y += 2) {
      for (let x = 0; x < res; x += 2) {
        const idx = y * res + x;
        const f = foodCh[idx] / field.config.maxConcentration;
        const h = homeCh[idx] / field.config.maxConcentration;
        const a = alarmCh[idx] / field.config.maxConcentration;

        if (f < 0.02 && h < 0.02 && a < 0.02) continue;

        const wx = (x / (res - 1)) * field.width - halfW;
        const wy = (y / (res - 1)) * field.height - halfH;

        if (f > 0.05) {
          ctx.fillStyle = `rgba(16, 185, 129, ${Math.min(0.7, f * 1.5)})`;
          ctx.fillRect(wx, wy, cellSize * 2, cellSize * 2);
        } else if (h > 0.05) {
          ctx.fillStyle = `rgba(6, 182, 212, ${Math.min(0.5, h * 1.2)})`;
          ctx.fillRect(wx, wy, cellSize * 2, cellSize * 2);
        } else if (a > 0.05) {
          ctx.fillStyle = `rgba(239, 68, 68, ${Math.min(0.8, a * 2.0)})`;
          ctx.fillRect(wx, wy, cellSize * 2, cellSize * 2);
        }
      }
    }
  }
}
