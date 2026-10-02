/**
 * ANT BRAIN — Queen Organism Entity & Polyandrous Reproductive Biology
 * Simulates queen physiology, multi-drone spermatheca sperm storage,
 * nuptial flight dispersal, and claustral colony founding with infrabuccal fungal pellets.
 */

import { ReproductiveState, Vector2D } from '../simulation/types';
import { SeededRNG } from '../simulation/rng';

export interface DroneGeneticProfile {
  droneId: string;
  patrilineId: string;
  traitModifiers: {
    sizeTendency: number;
    activityRate: number;
    diseaseResistance: number;
    foragingEfficiency: number;
  };
}

export interface SpermathecaSpermBank {
  totalSpermCount: number; // e.g. millions of sperm
  maxCapacity: number;
  dronesMatedCount: number;
  patrilines: DroneGeneticProfile[];
  spermViability: number; // 0 to 1
}

export type QueenBehaviorState =
  | 'REST'
  | 'FEED'
  | 'HEAL_RECOVER'
  | 'REPRODUCE'
  | 'MANAGE_INTERNAL_STATE';

export interface QueenMetrics {
  id: string;
  name: string;
  age: number; // seconds
  health: number; // 0 to 1
  energy: number; // 0 to 1
  fertility: number; // 0 to 1
  behaviorState: QueenBehaviorState;
  reproductiveState: ReproductiveState;
  eggLayingInterval: number; // seconds per egg cycle
  currentEggCycleProgress: number; // 0 to 1
  totalEggsLaid: number;
  queenPheromoneIntensity: number; // inhibitory / colony cohesion signal
  spermatheca: SpermathecaSpermBank;
  infrabuccalPelletMass: number; // fungal inoculum for founding (grams/units)
  trophicEggsLaid: number;
  position: Vector2D;
  safeChamberPosition: Vector2D;
}

export class Queen {
  public metrics: QueenMetrics;
  private eggTimer: number = 0;

  constructor(colonyId: string, position: Vector2D = { x: -1.0, y: 4.0 }, isFoundress = false) {
    const defaultPatrilines: DroneGeneticProfile[] = [
      { droneId: 'D-01', patrilineId: 'PAT-A', traitModifiers: { sizeTendency: 1.0, activityRate: 1.1, diseaseResistance: 1.0, foragingEfficiency: 1.2 } },
      { droneId: 'D-02', patrilineId: 'PAT-B', traitModifiers: { sizeTendency: 1.2, activityRate: 0.9, diseaseResistance: 1.3, foragingEfficiency: 1.0 } },
      { droneId: 'D-03', patrilineId: 'PAT-C', traitModifiers: { sizeTendency: 0.9, activityRate: 1.2, diseaseResistance: 1.1, foragingEfficiency: 1.1 } },
      { droneId: 'D-04', patrilineId: 'PAT-D', traitModifiers: { sizeTendency: 1.1, activityRate: 1.0, diseaseResistance: 1.2, foragingEfficiency: 0.9 } },
    ];

    this.metrics = {
      id: `queen-${colonyId}`,
      name: isFoundress ? 'Claustral Foundress Gyne' : 'Mated Leafcutter Queen (Atta Alpha)',
      age: 0,
      health: 1.0,
      energy: 1.0,
      fertility: 1.0,
      behaviorState: 'REST',
      reproductiveState: isFoundress ? 'FOUNDRESS' : 'QUEEN',
      eggLayingInterval: 16.0,
      currentEggCycleProgress: 0,
      totalEggsLaid: 0,
      queenPheromoneIntensity: 1.0,
      spermatheca: {
        totalSpermCount: 450,
        maxCapacity: 500,
        dronesMatedCount: defaultPatrilines.length,
        patrilines: defaultPatrilines,
        spermViability: 0.98,
      },
      infrabuccalPelletMass: isFoundress ? 2.5 : 0.0,
      trophicEggsLaid: 0,
      position: { ...position },
      safeChamberPosition: { ...position },
    };
  }

  public get id(): string {
    return this.metrics.id;
  }

  public get totalEggsLaid(): number {
    return this.metrics.totalEggsLaid;
  }

  public get energy(): number {
    return this.metrics.energy;
  }

  public get health(): number {
    return this.metrics.health;
  }

  public get position(): Vector2D {
    return this.metrics.position;
  }

  public get behaviorState(): QueenBehaviorState {
    return this.metrics.behaviorState;
  }

  public set behaviorState(state: QueenBehaviorState) {
    this.metrics.behaviorState = state;
  }

  public performNuptialFlight(drones: DroneGeneticProfile[], rng?: SeededRNG): void {
    const matedDrones = drones.length > 0 ? drones : [
      { droneId: `D-${Date.now().toString(36).slice(-3)}`, patrilineId: `PAT-${Math.random().toString(36).slice(-3)}`, traitModifiers: { sizeTendency: 1.0, activityRate: 1.0, diseaseResistance: 1.1, foragingEfficiency: 1.0 } }
    ];

    this.metrics.reproductiveState = 'MATED_QUEEN';
    this.metrics.spermatheca.patrilines = matedDrones;
    this.metrics.spermatheca.dronesMatedCount = matedDrones.length;
    this.metrics.spermatheca.totalSpermCount = matedDrones.length * 100;
    this.metrics.infrabuccalPelletMass = 2.5;
  }

  public samplePatrilineForEgg(rng?: SeededRNG): DroneGeneticProfile | null {
    if (this.metrics.spermatheca.totalSpermCount <= 0 || this.metrics.spermatheca.patrilines.length === 0) {
      return null;
    }

    this.metrics.spermatheca.totalSpermCount = Math.max(0, this.metrics.spermatheca.totalSpermCount - 1);
    const patrilines = this.metrics.spermatheca.patrilines;
    const idx = rng ? rng.int(0, patrilines.length - 1) : Math.floor(Math.random() * patrilines.length);
    return patrilines[idx];
  }

  /**
   * Queen update loop (metabolic burn, behavior state machine, recovery, reproduction)
   */
  public update(dt: number, colonyFoodStore: number): { shouldLayEgg: boolean; foodConsumed: number; isTrophicEgg: boolean } {
    this.metrics.age += dt;

    // Guaranteed safe position anchor: Queen never leaves the designated queen chamber
    this.metrics.position.x = this.metrics.safeChamberPosition.x;
    this.metrics.position.y = this.metrics.safeChamberPosition.y;

    // Basal metabolic consumption
    const basalFoodBurn = 0.025 * dt;
    let foodConsumed = basalFoodBurn;
    let isTrophicEgg = false;
    let shouldLayEgg = false;

    // 1. BEHAVIOR STATE EVALUATION
    if (this.metrics.health < 0.75) {
      this.metrics.behaviorState = 'HEAL_RECOVER';
      // Healing & Recovery phase
      this.metrics.health = Math.min(1.0, this.metrics.health + 0.04 * dt);
      this.metrics.energy = Math.max(0.1, this.metrics.energy - 0.01 * dt);
    } else if (this.metrics.energy < 0.45 && colonyFoodStore > 0.5) {
      this.metrics.behaviorState = 'FEED';
      const feedAmount = Math.min(colonyFoodStore, 0.15 * dt);
      foodConsumed += feedAmount;
      this.metrics.energy = Math.min(1.0, this.metrics.energy + feedAmount * 2.0);
    } else if (this.metrics.energy > 0.40 && colonyFoodStore > 1.0) {
      this.metrics.behaviorState = 'REPRODUCE';
    } else {
      this.metrics.behaviorState = 'REST';
    }

    // 2. ENERGY & FERTILITY DYNAMICS
    if (colonyFoodStore < 1.0) {
      this.metrics.energy = Math.max(0.05, this.metrics.energy - 0.015 * dt);
      this.metrics.fertility = Math.max(0.1, this.metrics.fertility - 0.02 * dt);
    } else {
      this.metrics.energy = Math.min(1.0, this.metrics.energy + 0.06 * dt);
      this.metrics.fertility = Math.min(1.0, this.metrics.fertility + 0.05 * dt);
    }

    // 3. EGG OVIPOSITION (Only when in REPRODUCE state, safe, and nourished)
    const isFoundressMode = this.metrics.reproductiveState === 'FOUNDRESS';
    if (
      this.metrics.behaviorState === 'REPRODUCE' &&
      ((this.metrics.energy > 0.3 && colonyFoodStore > 1.5) || (isFoundressMode && this.metrics.energy > 0.4))
    ) {
      const cycleSpeed = (this.metrics.fertility * this.metrics.energy) / this.metrics.eggLayingInterval;
      this.eggTimer += dt * cycleSpeed;
      this.metrics.currentEggCycleProgress = Math.min(1.0, this.eggTimer);

      if (this.eggTimer >= 1.0) {
        this.eggTimer = 0;
        this.metrics.currentEggCycleProgress = 0;
        this.metrics.totalEggsLaid++;
        shouldLayEgg = true;

        if (isFoundressMode && this.metrics.totalEggsLaid % 3 === 0) {
          isTrophicEgg = true;
          this.metrics.trophicEggsLaid++;
        }

        foodConsumed += isFoundressMode ? 0.0 : 1.2;
      }
    }

    return { shouldLayEgg, foodConsumed, isTrophicEgg };
  }
}
