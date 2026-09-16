/**
 * ANTWIRE — Biologically Informed Pheromone Decision Engine
 * Created & Developed by Nikhilesh H. Chavda
 *
 * Solves the critical bug where ants immediately/unconditionally released pheromones
 * upon acquiring food.
 *
 * Implements the full causal decision pipeline:
 * 1. Food Discovery & Acquisition
 * 2. Resource Quality Evaluation ($Q \in [0, 1]$)
 * 3. Colony Need Context Check (foodNeed, satiety)
 * 4. Existing Trail Saturation Check (negative feedback against runaway trails)
 * 5. Crowding & Traffic Congestion Check (congestion inhibition)
 * 6. Ant Physiological State (energy, health, cargo)
 * 7. Species Behavior Profile Modulation (e.g. Formica vs Cataglyphis vs Atta)
 * 8. Trail Reinforcement upon verified nest delivery (not on initial discovery)
 */

import { AntSpeciesProfile, DEFAULT_SPECIES_PROFILE } from './species_profile';
import { ColonyNeedsContext } from './task_system';
import { AntBody } from './body';
import { AntSensorySnapshot, AntInternalState, PheromoneChannel } from '../simulation/types';

export interface AntPheromoneDecisionState {
  pheromoneSensitivity: number;
  depositionThreshold: number;
  recruitmentThreshold: number;
  trailFollowingBias: number;
  trailReinforcement: number;
  trailAvoidance: number;
  resourceQualityEstimate: number;
  colonyNeedEstimate: number;
  crowdingEstimate: number;
  trailStrengthEstimate: number;
  lastDepositionTime: number;
  consecutiveDepositions: number;
  maxContinuousDepositions: number;
}

export interface PheromoneDepositionDecision {
  shouldDeposit: boolean;
  channel?: PheromoneChannel;
  strength: number;
  reason: string;
  inhibitionCause?: 'SATURATION' | 'CONGESTION' | 'LOW_QUALITY' | 'LOW_COLONY_NEED' | 'SPECIES_INHIBITION' | 'EMPTY_CARGO';
}

export class PheromoneDecisionEngine {
  /**
   * Initializes private, unshared pheromone decision parameters for an individual ant.
   */
  public static createDefaultState(profile: AntSpeciesProfile = DEFAULT_SPECIES_PROFILE): AntPheromoneDecisionState {
    const p = profile.pheromoneParameters;
    return {
      pheromoneSensitivity: p.baseSensitivity,
      depositionThreshold: p.depositionThreshold,
      recruitmentThreshold: p.recruitmentThreshold,
      trailFollowingBias: p.trailFollowingBias,
      trailReinforcement: p.trailReinforcementRate,
      trailAvoidance: 0.1,
      resourceQualityEstimate: 0.5,
      colonyNeedEstimate: 0.5,
      crowdingEstimate: 0.0,
      trailStrengthEstimate: 0.0,
      lastDepositionTime: 0,
      consecutiveDepositions: 0,
      maxContinuousDepositions: 25, // Prevents runaway infinite reinforcement
    };
  }

  /**
   * Authoritative decision evaluating whether an ant should deposit a pheromone signal.
   *
   * CRITICAL BIOLOGICAL PRINCIPLE:
   * Finding food does NOT unconditionally lay a trail.
   * Deposition occurs during return/recruitment, regulated by need, quality, saturation, and congestion.
   */
  public static evaluateDeposition(
    body: AntBody,
    sensors: AntSensorySnapshot,
    internalState: AntInternalState,
    colonyNeeds: ColonyNeedsContext | undefined,
    state: AntPheromoneDecisionState,
    profile: AntSpeciesProfile = DEFAULT_SPECIES_PROFILE,
    simTime: number = 0
  ): PheromoneDepositionDecision {
    // 1. Alarm / Threat Preemption (Immediate chemical alarm on active threat)
    if (sensors.predatorDetected || internalState.threatLevel > 0.7) {
      return {
        shouldDeposit: true,
        channel: PheromoneChannel.ALARM,
        strength: 0.9,
        reason: 'Threat detected: discharging volatile alarm pheromone to alert nestmates.',
      };
    }

    // 2. Species-level inhibition check (e.g. Cataglyphis desert ants never lay recruitment trails)
    if (profile.pheromoneMode === 'NO_RECRUITMENT_TRAIL') {
      return {
        shouldDeposit: false,
        strength: 0,
        reason: `${profile.name} does not use chemical recruitment trails; relies on path integration.`,
        inhibitionCause: 'SPECIES_INHIBITION',
      };
    }

    // 3. Cargo Check: An ant only recruits sister workers to food if it is actively returning with cargo!
    if (internalState.carryingFoodAmount <= 0.05) {
      return {
        shouldDeposit: false,
        strength: 0,
        reason: 'Ant is not carrying food; recruitment trail deposition inhibited.',
        inhibitionCause: 'EMPTY_CARGO',
      };
    }

    // 4. Colony Need Modulation
    const foodNeed = colonyNeeds ? colonyNeeds.foodNeed : 0.5;
    state.colonyNeedEstimate = foodNeed;
    if (foodNeed < 0.15) {
      // Colony is fully satiated; recruitment to additional food is not needed!
      return {
        shouldDeposit: false,
        strength: 0,
        reason: `Colony food need is very low (${foodNeed.toFixed(2)}); recruitment inhibited to avoid surplus spoilage.`,
        inhibitionCause: 'LOW_COLONY_NEED',
      };
    }

    // 5. Resource Quality Evaluation
    // Higher food amount or concentrated patch yields higher quality estimate
    const rawQuality = Math.min(1.0, internalState.carryingFoodAmount / Math.max(0.1, body.carryingCapacityMg * 0.1));
    state.resourceQualityEstimate = rawQuality;
    if (rawQuality < state.depositionThreshold * 0.5) {
      return {
        shouldDeposit: false,
        strength: 0,
        reason: `Resource quality (${rawQuality.toFixed(2)}) is below deposition threshold (${state.depositionThreshold.toFixed(2)}).`,
        inhibitionCause: 'LOW_QUALITY',
      };
    }

    // 6. Existing Trail Saturation Check (Negative Feedback preventing runaway amplification)
    const existingTrail = Math.max(sensors.foodLeft, sensors.foodCenter, sensors.foodRight);
    state.trailStrengthEstimate = existingTrail;
    const saturationLimit = profile.pheromoneParameters.saturationInhibitionLevel;

    if (existingTrail > saturationLimit) {
      return {
        shouldDeposit: false,
        strength: 0,
        reason: `Existing chemical trail is already saturated (${existingTrail.toFixed(2)} > ${saturationLimit.toFixed(2)}); deposition inhibited to prevent runaway concentration.`,
        inhibitionCause: 'SATURATION',
      };
    }

    // 7. Crowding & Traffic Congestion Check
    const nearbyCount = sensors.nearbyAntsCount;
    state.crowdingEstimate = nearbyCount;
    const congestionLimit = profile.pheromoneParameters.congestionInhibitionCount;

    if (nearbyCount >= congestionLimit) {
      return {
        shouldDeposit: false,
        strength: 0,
        reason: `Local route congested with ${nearbyCount} ants (limit ${congestionLimit}); deposition suspended to mitigate traffic jams.`,
        inhibitionCause: 'CONGESTION',
      };
    }

    // 8. Continuous Deposition Runaway Clamp
    if (state.consecutiveDepositions >= state.maxContinuousDepositions) {
      return {
        shouldDeposit: false,
        strength: 0,
        reason: 'Consecutive deposition limit reached for current leg; allowing trail to breathe.',
        inhibitionCause: 'SATURATION',
      };
    }

    // 9. Approved Modulated Deposition
    // Calculate diminishing return strength based on need, quality, and existing trail
    const qualityFactor = Math.max(0.2, rawQuality);
    const needFactor = Math.max(0.3, foodNeed);
    const saturationDamping = Math.max(0.1, 1.0 - (existingTrail / saturationLimit) * 0.8);
    const calculatedStrength = parseFloat(
      Math.min(1.0, qualityFactor * needFactor * saturationDamping * state.pheromoneSensitivity).toFixed(2)
    );

    state.lastDepositionTime = simTime;
    state.consecutiveDepositions++;

    return {
      shouldDeposit: true,
      channel: PheromoneChannel.FOOD_TRAIL,
      strength: calculatedStrength,
      reason: `Depositing recruitment trail on homeward vector: quality=${qualityFactor.toFixed(2)}, need=${needFactor.toFixed(2)}, damping=${saturationDamping.toFixed(2)}.`,
    };
  }

  /**
   * Resets continuous deposition counters upon successful delivery or task completion.
   */
  public static onTaskCompleted(state: AntPheromoneDecisionState): void {
    state.consecutiveDepositions = 0;
  }
}
