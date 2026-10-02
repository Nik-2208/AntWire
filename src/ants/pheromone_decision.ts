/**
 * ANTWIRE — Biologically Informed Pheromone Decision Engine
 * Created & Developed by Nikhilesh H. Chavda
 *
 * Implements the authoritative causal decision pipeline:
 * SENSE → EVALUATE (Quality, Need, Saturation, Congestion) → DECIDE → DEPOSIT / IGNORE → REINFORCE
 *
 * Core Biological Principles:
 * 1. Finding/touching food does NOT unconditionally lay a trail.
 * 2. Food recruitment trail is deposited exclusively on return journeys with verified cargo.
 * 3. Depositions are modulated by resource quality, colony homeostatic need, and existing trail saturation.
 * 4. Pacing prevents per-frame spamming (stride-based emission).
 * 5. Distinct chemical channels: FOOD, HOME, RECRUITMENT, DANGER, TASK, EXPLORE.
 * 6. Private, unshared decision state per individual ant organism.
 */

import { AntSpeciesProfile, DEFAULT_SPECIES_PROFILE } from './species_profile';
import { ColonyNeedsContext } from './task_system';
import { AntBody } from './body';
import { AntSensorySnapshot, AntInternalState, PheromoneChannel, PheromoneType, Vector2D } from '../simulation/types';

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
  lastDepositionPos: Vector2D;
  consecutiveDepositions: number;
  maxContinuousDepositions: number;
  trailEfficiencyRatio: number;
}

export interface PheromoneDepositionDecision {
  shouldDeposit: boolean;
  channel?: PheromoneChannel;
  type?: PheromoneType;
  strength: number;
  decayRate?: number;
  reason: string;
  inhibitionCause?: 'SATURATION' | 'CONGESTION' | 'LOW_QUALITY' | 'LOW_COLONY_NEED' | 'SPECIES_INHIBITION' | 'EMPTY_CARGO' | 'RATE_LIMIT';
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
      lastDepositionPos: { x: 0, y: 0 },
      consecutiveDepositions: 0,
      maxContinuousDepositions: 1000,
      trailEfficiencyRatio: 1.0,
    };
  }

  /**
   * Authoritative decision evaluating whether an ant should deposit a pheromone signal.
   *
   * BIOLOGICAL CAUSAL PIPELINE:
   * 1. DANGER / ALARM Preemption: Immediate emergency discharge on predator/threat encounter.
   * 2. Species-Level Trait Check: e.g. Cataglyphis uses pure path integration with zero trail deposition.
   * 3. Cargo Check: An ant never recruits to food unless actively carrying cargo.
   * 4. Colony Need Modulation: Satiated colony suppresses recruitment to prevent surplus decay.
   * 5. Resource Quality Check: Low-quality remnants do not warrant recruitment.
   * 6. Saturation / Diminishing Returns: Heavy existing trails inhibit redundant laying.
   * 7. Congestion / Crowding Check: Heavy traffic inhibits deposition to mitigate jams.
   * 8. Pacing & Stride Check: Prevents per-frame duplicate spam.
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
    if (sensors.predatorDetected || internalState.threatLevel > 0.6) {
      return {
        shouldDeposit: true,
        channel: PheromoneChannel.DANGER,
        type: 'DANGER',
        strength: 0.95,
        decayRate: 0.09,
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

    // 3. Food Recruitment Trail Check: Ant must be carrying cargo
    if (internalState.carryingFoodAmount > 0.05) {
      // 4. Colony Need Modulation
      const foodNeed = colonyNeeds ? colonyNeeds.foodNeed : 0.5;
      state.colonyNeedEstimate = foodNeed;
      if (foodNeed < 0.15) {
        return {
          shouldDeposit: false,
          strength: 0,
          reason: `Colony food need is very low (${foodNeed.toFixed(2)}); recruitment inhibited to avoid surplus spoilage.`,
          inhibitionCause: 'LOW_COLONY_NEED',
        };
      }

      // 5. Resource Quality Evaluation
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

      // 6. Existing Trail Saturation Check (Negative Feedback preventing runaway concentration)
      const existingTrail = Math.max(sensors.foodLeft, sensors.foodCenter, sensors.foodRight);
      state.trailStrengthEstimate = existingTrail;
      const saturationLimit = profile.pheromoneParameters.saturationInhibitionLevel || 8.0;

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
      const congestionLimit = profile.pheromoneParameters.congestionInhibitionCount || 12;

      if (nearbyCount >= congestionLimit) {
        return {
          shouldDeposit: false,
          strength: 0,
          reason: `Local route congested with ${nearbyCount} ants (limit ${congestionLimit}); deposition suspended to mitigate traffic jams.`,
          inhibitionCause: 'CONGESTION',
        };
      }

      // 8. Stride / Pacing Check: Ensure ant only deposits at physical stride intervals
      const dx = body.position.x - state.lastDepositionPos.x;
      const dy = body.position.y - state.lastDepositionPos.y;
      const distFromLast = Math.hypot(dx, dy);
      const timeSinceLast = simTime - state.lastDepositionTime;

      if (distFromLast < 0.25 && timeSinceLast < 0.10 && state.consecutiveDepositions > 0) {
        return {
          shouldDeposit: false,
          strength: 0,
          reason: 'Pacing stride interval not yet elapsed.',
          inhibitionCause: 'RATE_LIMIT',
        };
      }

      // 9. Modulated Recruitment Deposition Calculation
      const qualityFactor = Math.max(0.3, rawQuality);
      const needFactor = Math.max(0.3, foodNeed);
      const saturationDamping = Math.max(0.15, 1.0 - (existingTrail / saturationLimit) * 0.75);
      const reinforcementMult = Math.max(0.8, state.trailEfficiencyRatio);

      const calculatedStrength = parseFloat(
        Math.min(
          1.0,
          qualityFactor * needFactor * saturationDamping * state.pheromoneSensitivity * reinforcementMult
        ).toFixed(2)
      );

      state.lastDepositionTime = simTime;
      state.lastDepositionPos = { x: body.position.x, y: body.position.y };
      state.consecutiveDepositions++;

      return {
        shouldDeposit: true,
        channel: PheromoneChannel.FOOD,
        type: 'FOOD',
        strength: Math.max(0.25, calculatedStrength),
        decayRate: 0.035,
        reason: `Depositing recruitment trail on homeward vector: quality=${qualityFactor.toFixed(2)}, need=${needFactor.toFixed(2)}, damping=${saturationDamping.toFixed(2)}.`,
      };
    }

    // 10. Outbound Exploration / Orientation Trail
    if (
      body.task === 'FORAGING' ||
      body.task === 'EXPLORE' ||
      body.task === 'EXPLORING' ||
      body.task === 'SCOUT' ||
      body.task === 'SEEK_FOOD'
    ) {
      // Inhibit trail deposition if currently in the immediate vicinity of discovered food before cargo acquisition
      if ((sensors.detectedFoodId || sensors.foodProximity > 0.5) && internalState.carryingFoodAmount <= 0.05) {
        return {
          shouldDeposit: false,
          strength: 0,
          reason: 'Ant is discovering/harvesting food; recruitment trail laid only during homeward cargo transit.',
          inhibitionCause: 'EMPTY_CARGO',
        };
      }

      const existingHomeTrail = Math.max(sensors.homeLeft, sensors.homeCenter, sensors.homeRight);
      const dx = body.position.x - state.lastDepositionPos.x;
      const dy = body.position.y - state.lastDepositionPos.y;
      const distFromLast = Math.hypot(dx, dy);
      const timeSinceLast = simTime - state.lastDepositionTime;

      if (distFromLast >= 0.35 || timeSinceLast >= 0.20 || state.consecutiveDepositions === 0) {
        if (existingHomeTrail < 4.0 && internalState.energyReserve > 0.3) {
          state.lastDepositionTime = simTime;
          state.lastDepositionPos = { x: body.position.x, y: body.position.y };
          state.consecutiveDepositions++;

          return {
            shouldDeposit: true,
            channel: PheromoneChannel.HOME,
            type: 'HOME',
            strength: 0.30,
            decayRate: 0.025,
            reason: 'Depositing exploratory orientation trail to mark path.',
          };
        }
      }
    }

    // 11. Stigmergic Task Markers (Excavation / Building / Maintenance)
    if (
      body.task === 'BUILD' ||
      body.task === 'BUILDING' ||
      body.task === 'EXCAVATE' ||
      body.task === 'MAINTAINING_NEST'
    ) {
      return {
        shouldDeposit: true,
        channel: PheromoneChannel.TASK,
        type: 'TASK',
        strength: 0.40,
        decayRate: 0.04,
        reason: 'Marking local stigmergic task activity cue.',
      };
    }

    return {
      shouldDeposit: false,
      strength: 0,
      reason: 'No active deposition trigger.',
      inhibitionCause: 'EMPTY_CARGO',
    };
  }

  /**
   * Authoritative reinforcement of route efficiency upon verified successful nest delivery.
   */
  public static onTaskCompleted(state: AntPheromoneDecisionState, wasSuccessful: boolean = true): void {
    state.consecutiveDepositions = 0;
    if (wasSuccessful) {
      state.trailEfficiencyRatio = Math.min(1.5, state.trailEfficiencyRatio + 0.08);
      state.trailReinforcement = Math.min(1.0, state.trailReinforcement + 0.05);
    } else {
      state.trailEfficiencyRatio = Math.max(0.7, state.trailEfficiencyRatio - 0.05);
    }
  }
}
