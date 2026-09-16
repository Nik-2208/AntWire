/**
 * ANT BRAIN — Authoritative Colony Role & Dynamic Need Allocation System
 * Implements the Bonabeau-Theraulaz Response Threshold Model and Polymorphic Caste Morphology:
 * 1. Polymorphic caste physical traits (Minim, Minor, Media, Major, Alates).
 * 2. 10-dimensional ColonyNeedsVector evaluating dynamic colony demands.
 * 3. Self-organized task engagement probabilities: P(engage) = S^2 / (S^2 + theta^2).
 * 4. Experience-driven threshold adaptation and age polyethism.
 */

import { AntCaste, CasteMorphologyTraits, ColonyControlMode, ColonyNeedsVector, WorkerRole } from '../simulation/types';
import { Ant } from '../ants/ant';
import { SeededRNG } from '../simulation/rng';

export interface RoleDistribution {
  foragers: number;
  scouts: number;
  nurses: number;
  builders: number;
  guards: number;
  sanitation: number;
  fungusGardeners: number;
  leafCutters: number;
  leafProcessors: number;
  middenWorkers: number;
  hitchhikers: number;
  generalWorkers: number;
  reproductives: number;
}

export interface AntRoleState {
  primaryRole: WorkerRole;
  roleDuration: number;
  roleSwitchCooldown: number;
  minimumRoleDuration: number;
  individualThresholds?: Record<string, number>; // theta_i,j for each task type
}

export const CASTE_MORPHOLOGY_TABLE: Record<AntCaste, CasteMorphologyTraits> = {
  MINIM: {
    caste: 'MINIM',
    headWidthMm: 0.9,
    bodyLengthMm: 2.2,
    massMg: 1.2,
    mandibleForceN: 0.05,
    maxCargoCapacityUnits: 0.5,
    movementSpeedModifier: 0.85,
    metabolicCostRate: 0.5,
    leafCuttingEfficiency: 0.2,
    fungusTendingAffinity: 2.4,
    defenseAffinity: 0.3,
    broodCareAffinity: 1.8,
  },
  MINOR: {
    caste: 'MINOR',
    headWidthMm: 1.4,
    bodyLengthMm: 3.6,
    massMg: 3.5,
    mandibleForceN: 0.2,
    maxCargoCapacityUnits: 1.2,
    movementSpeedModifier: 0.95,
    metabolicCostRate: 0.8,
    leafCuttingEfficiency: 0.6,
    fungusTendingAffinity: 1.6,
    defenseAffinity: 0.6,
    broodCareAffinity: 2.0,
  },
  MEDIA: {
    caste: 'MEDIA',
    headWidthMm: 2.5,
    bodyLengthMm: 6.8,
    massMg: 12.0,
    mandibleForceN: 1.1,
    maxCargoCapacityUnits: 3.5,
    movementSpeedModifier: 1.1,
    metabolicCostRate: 1.3,
    leafCuttingEfficiency: 2.2,
    fungusTendingAffinity: 0.7,
    defenseAffinity: 1.2,
    broodCareAffinity: 0.6,
  },
  MAJOR: {
    caste: 'MAJOR',
    headWidthMm: 4.8,
    bodyLengthMm: 12.5,
    massMg: 55.0,
    mandibleForceN: 6.5,
    maxCargoCapacityUnits: 8.0,
    movementSpeedModifier: 0.8,
    metabolicCostRate: 2.8,
    leafCuttingEfficiency: 1.5,
    fungusTendingAffinity: 0.2,
    defenseAffinity: 3.5,
    broodCareAffinity: 0.2,
  },
  SOLDIER: {
    caste: 'SOLDIER',
    headWidthMm: 4.8,
    bodyLengthMm: 12.5,
    massMg: 55.0,
    mandibleForceN: 6.5,
    maxCargoCapacityUnits: 8.0,
    movementSpeedModifier: 0.8,
    metabolicCostRate: 2.8,
    leafCuttingEfficiency: 1.5,
    fungusTendingAffinity: 0.2,
    defenseAffinity: 3.5,
    broodCareAffinity: 0.2,
  },
  WORKER: {
    caste: 'WORKER',
    headWidthMm: 2.0,
    bodyLengthMm: 5.0,
    massMg: 6.0,
    mandibleForceN: 0.6,
    maxCargoCapacityUnits: 2.0,
    movementSpeedModifier: 1.0,
    metabolicCostRate: 1.0,
    leafCuttingEfficiency: 1.0,
    fungusTendingAffinity: 1.0,
    defenseAffinity: 1.0,
    broodCareAffinity: 1.0,
  },
  QUEEN: {
    caste: 'QUEEN',
    headWidthMm: 5.5,
    bodyLengthMm: 22.0,
    massMg: 180.0,
    mandibleForceN: 4.0,
    maxCargoCapacityUnits: 0.0,
    movementSpeedModifier: 0.4,
    metabolicCostRate: 3.5,
    leafCuttingEfficiency: 0.0,
    fungusTendingAffinity: 0.8,
    defenseAffinity: 0.5,
    broodCareAffinity: 1.5,
  },
  GYNE: {
    caste: 'GYNE',
    headWidthMm: 5.2,
    bodyLengthMm: 20.0,
    massMg: 160.0,
    mandibleForceN: 3.5,
    maxCargoCapacityUnits: 0.0,
    movementSpeedModifier: 1.0,
    metabolicCostRate: 3.0,
    leafCuttingEfficiency: 0.0,
    fungusTendingAffinity: 0.5,
    defenseAffinity: 0.5,
    broodCareAffinity: 0.5,
  },
  MALE: {
    caste: 'MALE',
    headWidthMm: 2.0,
    bodyLengthMm: 14.0,
    massMg: 45.0,
    mandibleForceN: 0.2,
    maxCargoCapacityUnits: 0.0,
    movementSpeedModifier: 1.2,
    metabolicCostRate: 1.8,
    leafCuttingEfficiency: 0.0,
    fungusTendingAffinity: 0.0,
    defenseAffinity: 0.1,
    broodCareAffinity: 0.0,
  },
};

export class ColonyRoleManager {
  public minimumRoleDuration = 18.0; // Seconds before an ant can voluntarily shift roles
  public userAssistedWeights: Partial<ColonyNeedsVector> = {};

  /**
   * Evaluates colony state to compute normalized 10-dimensional ColonyNeedsVector [0, 1].
   */
  public computeColonyDemands(
    population: number,
    foodStore: number,
    eggCount: number,
    larvaCount: number,
    pupaCount: number,
    corpseCount: number,
    predatorCount: number,
    queenEnergy: number,
    nestOccupancyRatio: number = 0.5,
    nestIntegrity: number = 1.0,
    starvingAntsCount: number = 0,
    buildingMaterial: number = 10.0,
    mode: ColonyControlMode = 'AUTONOMOUS'
  ): ColonyNeedsVector {
    // 1. Foraging Demand: high when food is below safe target reserve or larvae are demanding nutrition
    const targetFoodReserve = Math.max(25.0, population * 2.8);
    const foodDeficit = Math.max(0, 1.0 - foodStore / targetFoodReserve);
    const broodPressure = (larvaCount * 1.5 + eggCount * 0.5) / Math.max(1, population);
    let foodNeed = Math.min(1.0, foodDeficit * 0.75 + broodPressure * 0.45);

    // 2. Water Demand: hydration need
    let waterNeed = 0.2 + (1.0 - foodNeed) * 0.1;

    // 3. Brood Care Demand: proportional to un-attended eggs and developing larvae
    const totalBrood = eggCount + larvaCount + pupaCount;
    let broodNeed = totalBrood === 0 ? 0.0 : Math.min(1.0, totalBrood / Math.max(2, population * 0.55));

    // 4. Queen Need: inverted queen somatic energy + grooming
    let queenNeed = Math.max(0, 1.0 - queenEnergy);

    // 5. Nest Demand: driven by overcrowding, damaged structural integrity, or low building material
    const crowdPressure = Math.max(0, (nestOccupancyRatio - 0.7) * 2.5);
    const damagePressure = Math.max(0, 1.0 - nestIntegrity);
    const materialNeed = buildingMaterial < 5.0 ? 0.4 : 0.1;
    let nestNeed = Math.min(1.0, crowdPressure * 0.6 + damagePressure * 0.5 + materialNeed * 0.3);

    // 6. Defense Demand: acute when predators are present or alarm chemicals are active
    let defenseNeed = predatorCount > 0 ? Math.min(1.0, 0.45 + predatorCount * 0.3) : 0.05;

    // 7. Sanitation Demand: driven by corpses inside or near the nest perimeter
    let sanitationNeed = corpseCount > 0 ? Math.min(1.0, corpseCount * 0.35) : 0.0;

    // 8. Social Care Demand: driven by starving or distressed nestmates requesting trophallaxis/rescue
    let socialCareNeed = starvingAntsCount > 0 ? Math.min(1.0, starvingAntsCount * 0.3) : 0.05;

    // 9. Exploration Demand: increases when food is low or colony is healthy and ready to expand
    let explorationNeed = Math.min(1.0, (1.0 - foodNeed * 0.5) * 0.4 + (population > 10 ? 0.3 : 0.15));

    // 10. Reserve Need: safeguarding critical buffer
    let reserveNeed = foodStore < 10.0 ? 0.8 : 0.2;

    // In ASSISTED mode, apply user priority weight overrides
    if (mode === 'ASSISTED') {
      if (this.userAssistedWeights.foodNeed !== undefined) foodNeed = Math.min(1, foodNeed * (1 + this.userAssistedWeights.foodNeed));
      if (this.userAssistedWeights.broodNeed !== undefined) broodNeed = Math.min(1, broodNeed * (1 + this.userAssistedWeights.broodNeed));
      if (this.userAssistedWeights.defenseNeed !== undefined) defenseNeed = Math.min(1, defenseNeed * (1 + this.userAssistedWeights.defenseNeed));
      if (this.userAssistedWeights.nestNeed !== undefined) nestNeed = Math.min(1, nestNeed * (1 + this.userAssistedWeights.nestNeed));
      if (this.userAssistedWeights.socialCareNeed !== undefined) socialCareNeed = Math.min(1, socialCareNeed * (1 + this.userAssistedWeights.socialCareNeed));
    }

    return {
      foodNeed,
      waterNeed,
      broodNeed,
      queenNeed,
      nestNeed,
      defenseNeed,
      sanitationNeed,
      socialCareNeed,
      explorationNeed,
      reserveNeed,
      // Backward-compatible aliases
      foragingNeed: foodNeed,
      broodCareNeed: broodNeed,
      buildingNeed: nestNeed,
      queenHunger: queenNeed,
    };
  }

  /**
   * Evaluates Bonabeau-Theraulaz response threshold engagement probability
   * P(engage) = S^2 / (S^2 + theta^2)
   */
  public evaluateThresholdProbability(stimulus: number, threshold: number): number {
    const s2 = stimulus * stimulus;
    const t2 = threshold * threshold;
    if (s2 + t2 <= 0) return 0;
    return s2 / (s2 + t2);
  }

  /**
   * Dynamically balances worker roles across the colony without central scripting.
   * Incorporates age polyethism and caste physical morphology traits.
   */
  public updateRoleAllocations(
    ants: Ant[],
    dt: number,
    demands: ColonyNeedsVector,
    rng: SeededRNG,
    mode: ColonyControlMode = 'AUTONOMOUS'
  ): void {
    if (mode === 'MANUAL') return; // In manual mode, user dictates roles

    const totalWorkers = ants.filter((a) => a.body.caste !== 'QUEEN' && a.body.caste !== 'MALE' && a.body.caste !== 'GYNE').length;
    if (totalWorkers === 0) return;

    for (const ant of ants) {
      if (ant.body.caste === 'QUEEN' || ant.body.caste === 'MALE' || ant.body.caste === 'GYNE') continue;

      ant.roleState.roleDuration += dt;
      ant.roleState.roleSwitchCooldown = Math.max(0, ant.roleState.roleSwitchCooldown - dt);

      if (ant.roleState.roleDuration >= ant.roleState.minimumRoleDuration && ant.roleState.roleSwitchCooldown <= 0) {
        const casteTraits = CASTE_MORPHOLOGY_TABLE[ant.body.caste] || CASTE_MORPHOLOGY_TABLE.WORKER;

        // Age polyethism weighting: normalized age in colony
        const ageNorm = Math.min(1.0, ant.internalState.state.age / 120.0);
        const insideBias = 1.0 - ageNorm * 0.5; // Younger favor inside
        const outsideBias = 0.5 + ageNorm * 0.7; // Older favor outside

        const candidateRoles: { role: WorkerRole; affinity: number }[] = [
          { role: 'FORAGER', affinity: demands.foodNeed * ant.body.traits.explorationTendency * outsideBias * casteTraits.leafCuttingEfficiency },
          { role: 'LEAF_CUTTER', affinity: demands.foodNeed * outsideBias * casteTraits.leafCuttingEfficiency * 1.3 },
          { role: 'SCOUT', affinity: demands.explorationNeed * ant.body.traits.movementSpeed * 0.25 * outsideBias },
          { role: 'NURSE', affinity: demands.broodNeed * 1.3 * insideBias * casteTraits.broodCareAffinity },
          { role: 'FUNGUS_GARDENER', affinity: demands.foodNeed * 1.2 * insideBias * casteTraits.fungusTendingAffinity },
          { role: 'LEAF_PROCESSOR', affinity: demands.foodNeed * 1.1 * insideBias * (casteTraits.caste === 'MINOR' ? 2.0 : 1.0) },
          { role: 'BUILDER', affinity: demands.nestNeed * 1.2 * insideBias },
          { role: 'GUARD', affinity: demands.defenseNeed * ant.body.traits.fearThreshold * 1.3 * casteTraits.defenseAffinity },
          { role: 'MIDDEN_WORKER', affinity: demands.sanitationNeed * 1.3 * (casteTraits.caste === 'MINOR' || casteTraits.caste === 'WORKER' ? 1.5 : 0.8) },
          { role: 'SANITATION', affinity: demands.sanitationNeed * 1.1 },
        ];

        candidateRoles.sort((a, b) => b.affinity - a.affinity);
        const bestRole = candidateRoles[0].role;

        if (bestRole !== ant.roleState.primaryRole && rng.chance(0.25)) {
          ant.roleState.primaryRole = bestRole;
          ant.roleState.roleDuration = 0;
          ant.roleState.roleSwitchCooldown = 10.0;
        }
      }
    }
  }

  public getRoleCounts(ants: Ant[]): RoleDistribution {
    const counts: RoleDistribution = {
      foragers: 0,
      scouts: 0,
      nurses: 0,
      builders: 0,
      guards: 0,
      sanitation: 0,
      fungusGardeners: 0,
      leafCutters: 0,
      leafProcessors: 0,
      middenWorkers: 0,
      hitchhikers: 0,
      generalWorkers: 0,
      reproductives: 0,
    };

    for (const ant of ants) {
      if (ant.body.caste === 'QUEEN' || ant.body.caste === 'GYNE' || ant.body.caste === 'MALE') {
        counts.reproductives++;
        continue;
      }
      switch (ant.roleState.primaryRole) {
        case 'FORAGER':
          counts.foragers++;
          break;
        case 'LEAF_CUTTER':
          counts.leafCutters++;
          break;
        case 'SCOUT':
          counts.scouts++;
          break;
        case 'NURSE':
          counts.nurses++;
          break;
        case 'FUNGUS_GARDENER':
          counts.fungusGardeners++;
          break;
        case 'LEAF_PROCESSOR':
          counts.leafProcessors++;
          break;
        case 'BUILDER':
          counts.builders++;
          break;
        case 'GUARD':
          counts.guards++;
          break;
        case 'MIDDEN_WORKER':
          counts.middenWorkers++;
          break;
        case 'SANITATION':
          counts.sanitation++;
          break;
        case 'HITCHHIKER':
          counts.hitchhikers++;
          break;
        default:
          counts.generalWorkers++;
          break;
      }
    }

    return counts;
  }
}
