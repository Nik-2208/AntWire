/**
 * ANT BRAIN — Bounded Spatial & Event Memory
 * Finite-capacity, decaying episodic memory structure.
 */

import { Vector2D } from '../simulation/types';

export interface MemoryWaypoint {
  position: Vector2D;
  timestamp: number;
  confidence: number;
}

export class AntMemory {
  public recentBreadcrumbs: Vector2D[] = [];
  public maxBreadcrumbs: number = 24;

  public lastKnownFoodPosition: Vector2D | null = null;
  public foodConfidence: number = 0;

  public lastKnownThreatPosition: Vector2D | null = null;
  public threatConfidence: number = 0;

  public totalTripsCompleted: number = 0;
  public totalFoodHarvested: number = 0;
  public lifetimeDistanceTraveled: number = 0;
  private lastRecordedPos: Vector2D | null = null;

  constructor(capacity = 24) {
    this.maxBreadcrumbs = capacity;
  }

  public recordPosition(pos: Vector2D, simTime: number): void {
    if (this.lastRecordedPos) {
      const dx = pos.x - this.lastRecordedPos.x;
      const dy = pos.y - this.lastRecordedPos.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 1.0) return; // Only record every ~1 meter
      this.lifetimeDistanceTraveled += d;
    }

    this.recentBreadcrumbs.push({ x: pos.x, y: pos.y });
    if (this.recentBreadcrumbs.length > this.maxBreadcrumbs) {
      this.recentBreadcrumbs.shift();
    }
    this.lastRecordedPos = { x: pos.x, y: pos.y };
  }

  public rememberFood(pos: Vector2D): void {
    this.lastKnownFoodPosition = { ...pos };
    this.foodConfidence = 1.0;
  }

  public rememberThreat(pos: Vector2D): void {
    this.lastKnownThreatPosition = { ...pos };
    this.threatConfidence = 1.0;
  }

  public updateDecay(dt: number): void {
    // Memory traces exponentially fade over time
    if (this.foodConfidence > 0) {
      this.foodConfidence = Math.max(0, this.foodConfidence - dt * 0.02);
      if (this.foodConfidence === 0) this.lastKnownFoodPosition = null;
    }

    if (this.threatConfidence > 0) {
      this.threatConfidence = Math.max(0, this.threatConfidence - dt * 0.08);
      if (this.threatConfidence === 0) this.lastKnownThreatPosition = null;
    }
  }

  public clearBreadcrumbs(): void {
    this.recentBreadcrumbs = [];
  }
}
