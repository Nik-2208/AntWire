/**
 * ANT BRAIN — Trajectory Logger & Dataset Pipeline
 * Records timestamped observation-state-action-reward transitions from the simulator
 * for imitation learning, behavior cloning, and offline reinforcement learning.
 */

import { Vector2D } from '../simulation/types';

export interface TrajectoryStep {
  step: number;
  timestamp: number;
  antId: string;
  species: string;
  role: string;
  
  // Observation
  observation: {
    antennaeLeft: { food: number; pheromone: number; alarm: number };
    antennaeRight: { food: number; pheromone: number; alarm: number };
    headingOdometer: { x: number; y: number; distance: number };
    nearbyThreats: number;
    nearbyNestmates: number;
    isCarryingFood: boolean;
  };

  // Internal Physiology & Drives
  internalState: {
    energy: number;
    hunger: number;
    health: number;
    threatArousal: number;
  };
  drives: {
    food: number;
    homing: number;
    explore: number;
    threatAvoidance: number;
  };

  // Neuropil / Action Trace
  decision: {
    actionType: string;
    targetSpeed: number;
    turnRate: number;
    chosenActionScore: number;
    candidateScores: Record<string, number>;
    explanation: string;
  };

  // Decomposed Reward Tuple
  reward: {
    total: number;
    foodAcquired: number;
    foodDelivered: number;
    energyPreserved: number;
    safeReturn: number;
    dangerPenalty: number;
    starvationPenalty: number;
  };

  position: Vector2D;
  heading: number;
  isTerminal: boolean;
}

export interface EpisodeMetadata {
  episodeId: string;
  startTime: number;
  endTime: number;
  totalSteps: number;
  controllerType: string;
  controllerVersion: string;
  speciesProfile: string;
  seed: number;
  totalReward: number;
  foodDeliveredCount: number;
}

export interface TrajectoryEpisode {
  metadata: EpisodeMetadata;
  steps: TrajectoryStep[];
}

export class TrajectoryLogger {
  private currentEpisode: TrajectoryStep[] = [];
  private completedEpisodes: TrajectoryEpisode[] = [];
  private isRecording = true;
  private maxStoredEpisodes = 20;

  public startNewEpisode(metadata: Partial<EpisodeMetadata> = {}): void {
    if (this.currentEpisode.length > 0) {
      this.finalizeEpisode(metadata);
    }
    this.currentEpisode = [];
  }

  public recordStep(step: TrajectoryStep): void {
    if (!this.isRecording) return;
    this.currentEpisode.push(step);
    if (this.currentEpisode.length > 5000) {
      this.finalizeEpisode({});
    }
  }

  public finalizeEpisode(meta: Partial<EpisodeMetadata> = {}): TrajectoryEpisode | null {
    if (this.currentEpisode.length === 0) return null;

    const firstStep = this.currentEpisode[0];
    const lastStep = this.currentEpisode[this.currentEpisode.length - 1];
    
    let totalReward = 0;
    let foodDeliveredCount = 0;

    for (const s of this.currentEpisode) {
      totalReward += s.reward.total;
      if (s.reward.foodDelivered > 0) foodDeliveredCount++;
    }

    const episode: TrajectoryEpisode = {
      metadata: {
        episodeId: meta.episodeId || `EP-${Date.now().toString(36).toUpperCase()}`,
        startTime: firstStep.timestamp,
        endTime: lastStep.timestamp,
        totalSteps: this.currentEpisode.length,
        controllerType: meta.controllerType || 'BIOLOGICAL_NEUROPIL',
        controllerVersion: meta.controllerVersion || '1.0.0',
        speciesProfile: firstStep.species || 'Formica_experimenta_v1',
        seed: meta.seed || 1337,
        totalReward: Number(totalReward.toFixed(3)),
        foodDeliveredCount,
        ...meta,
      },
      steps: [...this.currentEpisode],
    };

    this.completedEpisodes.push(episode);
    if (this.completedEpisodes.length > this.maxStoredEpisodes) {
      this.completedEpisodes.shift();
    }

    this.currentEpisode = [];
    return episode;
  }

  public getActiveSteps(): TrajectoryStep[] {
    return [...this.currentEpisode];
  }

  public flushActiveEpisode(meta: Partial<EpisodeMetadata> = {}): TrajectoryEpisode | null {
    if (this.currentEpisode.length === 0) return null;
    return this.finalizeEpisode(meta);
  }

  public getAllEpisodes(includeActive: boolean = true): TrajectoryEpisode[] {
    const list = [...this.completedEpisodes];
    if (includeActive && this.currentEpisode.length > 0) {
      const firstStep = this.currentEpisode[0];
      const lastStep = this.currentEpisode[this.currentEpisode.length - 1];
      let totalReward = 0;
      let foodDeliveredCount = 0;
      for (const s of this.currentEpisode) {
        totalReward += s.reward.total;
        if (s.reward.foodDelivered > 0) foodDeliveredCount++;
      }
      list.push({
        metadata: {
          episodeId: `EP-ACTIVE-${Date.now().toString(36).toUpperCase()}`,
          startTime: firstStep.timestamp,
          endTime: lastStep.timestamp,
          totalSteps: this.currentEpisode.length,
          controllerType: 'BIOLOGICAL_NEUROPIL',
          controllerVersion: '1.0.0',
          speciesProfile: firstStep.species || 'Formica_experimenta_v1',
          seed: 1337,
          totalReward: Number(totalReward.toFixed(3)),
          foodDeliveredCount,
        },
        steps: [...this.currentEpisode],
      });
    }
    return list;
  }

  public setRecording(active: boolean): void {
    this.isRecording = active;
  }

  public getIsRecording(): boolean {
    return this.isRecording;
  }

  public getRecordedEpisodes(): TrajectoryEpisode[] {
    return this.completedEpisodes;
  }

  public getCurrentStepCount(): number {
    return this.currentEpisode.length;
  }

  public clear(): void {
    this.currentEpisode = [];
    this.completedEpisodes = [];
  }
}
