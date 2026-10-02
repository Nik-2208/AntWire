/**
 * ANT BRAIN — Authoritative Ant Task State Machine & Lifecycle System
 * Explicit task state, spatial food retrieval for starving workers, physical chamber excavation,
 * material transport to surface mound, target reservation/invalidation, and utility score competition.
 */

import {
  AntAction,
  AntDrives,
  AntInternalState,
  AntLifecycleState,
  AntSensorySnapshot,
  AntTask,
  ColonyNeedsVector,
  FoodEntity,
  TaskLifecycleState,
  TaskPriority,
  Vector2D,
  WorkerRole,
} from '../simulation/types';
import { AntBody } from './body';
import { AntMemory } from './memory';
import { SeededRNG } from '../simulation/rng';
import { ActionFactory } from './actions';
import { ROLE_CAPABILITIES_TABLE } from '../colony/roles';

export interface TaskState {
  currentTask: AntTask;
  taskStatus: TaskLifecycleState;
  lifecycleState: AntLifecycleState;
  taskStartTime: number;
  taskDuration: number;
  taskTimeout: number;
  taskPriority: TaskPriority;
  targetId: string | null;
  targetPosition: Vector2D | null;
  taskCooldown: number;
  reassessmentCooldown: number;
  stuckTimer: number;
  oscillationCount: number;
  lastHeadingDelta: number;
  lastPosition: Vector2D;
  consecutiveFailures: number;
  carryingMaterialAmount: number;
}

export interface ColonyNeedsContext extends ColonyNeedsVector {
  foodStore: number;
  nestEntrance: Vector2D;
  nestRadius: number;
  queenPosition: Vector2D;
  nurseryPosition: Vector2D;
  graveyardPosition: Vector2D;
  storageFoodChamberPosition?: Vector2D;
  buildingChamberPosition?: Vector2D;
  distressedAntPosition?: Vector2D;
  distressedAntId?: string;
  nestIntegrity?: number;
}

const VALID_LIFECYCLE_TRANSITIONS: Record<AntLifecycleState, AntLifecycleState[]> = {
  INITIALIZING: ['IDLE', 'EXPLORING', 'EVALUATING'],
  IDLE: ['EXPLORING', 'EVALUATING', 'TASK_CLAIMED', 'MOVING', 'COMMUNICATING'],
  EXPLORING: ['EVALUATING', 'TASK_CLAIMED', 'MOVING', 'WORKING', 'BLOCKED', 'COMMUNICATING', 'IDLE'],
  EVALUATING: ['TASK_CLAIMED', 'MOVING', 'EXPLORING', 'IDLE', 'BLOCKED'],
  TASK_CLAIMED: ['MOVING', 'WORKING', 'COMMUNICATING', 'BLOCKED', 'FAILED'],
  MOVING: ['WORKING', 'TASK_CLAIMED', 'BLOCKED', 'COMMUNICATING', 'COMPLETED', 'FAILED', 'RECOVERING', 'EXPLORING'],
  WORKING: ['COMPLETED', 'FAILED', 'BLOCKED', 'COMMUNICATING', 'MOVING', 'HELPING', 'RECOVERING'],
  COMMUNICATING: ['IDLE', 'EXPLORING', 'MOVING', 'WORKING', 'HELPING', 'TASK_CLAIMED'],
  HELPING: ['WORKING', 'MOVING', 'COMPLETED', 'FAILED', 'COMMUNICATING', 'RECOVERING'],
  BLOCKED: ['RECOVERING', 'FAILED', 'EXPLORING', 'IDLE'],
  RECOVERING: ['EXPLORING', 'IDLE', 'MOVING', 'EVALUATING', 'FAILED'],
  COMPLETED: ['IDLE', 'EVALUATING', 'EXPLORING', 'COMMUNICATING', 'MOVING'],
  FAILED: ['RECOVERING', 'IDLE', 'EXPLORING', 'EVALUATING'],
};

export class TaskSystem {
  public state: TaskState;

  constructor(initialTask: AntTask = 'IDLE', simTime = 0, initialPos: Vector2D = { x: 0, y: 0 }) {
    this.state = {
      currentTask: initialTask,
      taskStatus: 'ACTIVE',
      lifecycleState: 'IDLE',
      taskStartTime: simTime,
      taskDuration: 0,
      taskTimeout: 25.0,
      taskPriority: 'NORMAL',
      targetId: null,
      targetPosition: null,
      taskCooldown: 0,
      reassessmentCooldown: 0.8,
      stuckTimer: 0,
      oscillationCount: 0,
      lastHeadingDelta: 0,
      lastPosition: { ...initialPos },
      consecutiveFailures: 0,
      carryingMaterialAmount: 0,
    };
  }

  /**
   * Validate and perform an explicit AntLifecycleState transition
   */
  public transitionLifecycle(next: AntLifecycleState, antId = 'unknown'): boolean {
    const current = this.state.lifecycleState;
    if (current === next) return true;

    const allowed = VALID_LIFECYCLE_TRANSITIONS[current];
    if (allowed && allowed.includes(next)) {
      this.state.lifecycleState = next;
      return true;
    }

    // Force transition to recovery state if blocked
    if (next === 'RECOVERING' || next === 'FAILED') {
      this.state.lifecycleState = next;
      return true;
    }

    // Graceful fallback with soft logging
    this.state.lifecycleState = next;
    return false;
  }

  /**
   * Update task lifecycle timers, stuck detection, target validity, and task switching.
   */
  public update(
    dt: number,
    simTime: number,
    body: AntBody,
    sensors: AntSensorySnapshot,
    internalState: AntInternalState,
    drives: AntDrives,
    memory: AntMemory,
    role: WorkerRole,
    colonyNeeds: ColonyNeedsContext,
    foodEntities: FoodEntity[],
    rng: SeededRNG
  ): { switchedTask: boolean; actionOverride?: AntAction } {
    this.state.taskDuration += dt;
    this.state.reassessmentCooldown = Math.max(0, this.state.reassessmentCooldown - dt);
    this.state.taskCooldown = Math.max(0, this.state.taskCooldown - dt);

    // 1. Stuck & Anti-Loop Detection
    const distMoved = Math.hypot(body.position.x - this.state.lastPosition.x, body.position.y - this.state.lastPosition.y);
    if (distMoved < 0.15 && body.isMoving) {
      this.state.stuckTimer += dt;
    } else {
      this.state.stuckTimer = Math.max(0, this.state.stuckTimer - dt * 2.0);
      this.state.lastPosition = { ...body.position };
    }

    // Emergency Anti-Stuck Evasion Maneuver
    if (this.state.stuckTimer > 2.0) {
      this.state.stuckTimer = 0;
      this.state.consecutiveFailures++;
      this.invalidateTarget();
      this.setTask('IDLE_REASSESS', simTime, 'LOW', 10.0);
      const escapeTurn = rng.range(2.0, 3.14) * (rng.chance(0.5) ? 1 : -1);
      return {
        switchedTask: true,
        actionOverride: ActionFactory.move(1.0, escapeTurn),
      };
    }

    // 2. High-Priority Threat Interrupts (Immediate Preemption)
    if (sensors.predatorDetected || drives.threatAvoidance > 0.75) {
      if (this.state.currentTask !== 'FLEE' && this.state.currentTask !== 'DEFEND') {
        const wantsToFight = (role === 'GUARD' || role === 'SOLDIER') && internalState.health > 0.6;
        const nextTask: AntTask = wantsToFight ? 'DEFEND' : 'FLEE';
        this.setTask(nextTask, simTime, 'CRITICAL', 8.0);
        return { switchedTask: true };
      }
    }

    // 3. Carrying Cargo Transition (If full of food or material, head to nest)
    if (internalState.carryingFoodAmount > 0) {
      if (this.state.currentTask !== 'RETURNING_TO_NEST' && this.state.currentTask !== 'RETURN_HOME') {
        this.setTask('RETURNING_TO_NEST', simTime, 'HIGH', 45.0);
        this.state.targetPosition = colonyNeeds.storageFoodChamberPosition
          ? { ...colonyNeeds.storageFoodChamberPosition }
          : { ...colonyNeeds.nestEntrance };
        return { switchedTask: true };
      }
    }

    // Early-return-home when energy is low — BEFORE starvation onset
    if (
      internalState.carryingFoodAmount <= 0 &&
      ((internalState.energyReserve !== undefined && internalState.energyReserve < 0.35) ||
       (internalState.energy !== undefined && internalState.energy < 0.35)) &&
      this.state.currentTask !== 'RETRIEVE_FOOD_FROM_STORAGE' &&
      this.state.currentTask !== 'RETURNING_TO_NEST' &&
      this.state.currentTask !== 'RESTING' &&
      this.state.currentTask !== 'FLEE'
    ) {
      if (colonyNeeds.foodStore > 0.1) {
        this.setTask('RETRIEVE_FOOD_FROM_STORAGE', simTime, 'HIGH', 40.0);
        this.state.targetPosition = colonyNeeds.storageFoodChamberPosition
          ? { ...colonyNeeds.storageFoodChamberPosition }
          : { ...colonyNeeds.nestEntrance };
        return { switchedTask: true };
      } else {
        const closestFood = foodEntities
          .filter(f => f.amount > 0.5)
          .sort((a, b) => {
            const dA = Math.hypot(a.position.x - body.position.x, a.position.y - body.position.y);
            const dB = Math.hypot(b.position.x - body.position.x, b.position.y - body.position.y);
            return dA - dB;
          })[0];
        if (closestFood) {
          this.setTask('SEEK_FOOD', simTime, 'CRITICAL', 30.0);
          this.state.targetPosition = { ...closestFood.position };
          this.state.targetId = closestFood.id;
          return { switchedTask: true };
        }
        this.setTask('RETURNING_TO_NEST', simTime, 'HIGH', 40.0);
        this.state.targetPosition = { ...colonyNeeds.nestEntrance };
        return { switchedTask: true };
      }
    }

    if (this.state.carryingMaterialAmount > 0) {
      if (this.state.currentTask === 'EXCAVATE' || this.state.currentTask === 'COLLECT_MATERIAL') {
        this.setTask('TRANSPORT_MATERIAL', simTime, 'NORMAL', 25.0);
        this.state.targetPosition = { x: colonyNeeds.nestEntrance.x + 2.0, y: colonyNeeds.nestEntrance.y + 1.5 };
        return { switchedTask: true };
      }
    }

    // 4. Food Discovery Transition
    if (
      this.state.currentTask === 'EXPLORING' ||
      this.state.currentTask === 'IDLE' ||
      this.state.currentTask === 'IDLE_REASSESS' ||
      this.state.currentTask === 'WAITING_FOR_TASK'
    ) {
      if (sensors.detectedFoodId || sensors.foodOdorConcentration > 0.15 || sensors.foodCenter > 0.02) {
        const foundFood = foodEntities.find(
          (f) => f.id === sensors.detectedFoodId || (sensors.detectedFoodId && f.amount > 0.1)
        );
        this.setTask('FORAGING', simTime, 'HIGH', 30.0);
        if (foundFood) {
          this.state.targetPosition = { ...foundFood.position };
          this.state.targetId = foundFood.id;
        } else if (sensors.foodOdorConcentration > 0.15) {
          const dx = Math.cos(body.heading + sensors.foodOdorDirection) * 5.0;
          const dy = Math.sin(body.heading + sensors.foodOdorDirection) * 5.0;
          this.state.targetPosition = { x: body.position.x + dx, y: body.position.y + dy };
        }
        return { switchedTask: true };
      }
    }

    // 5. Target Invalidation Check for Food Tasks
    if (this.state.currentTask === 'COLLECT_FOOD' || this.state.currentTask === 'FORAGING') {
      if (this.state.targetId) {
        const targetFood = foodEntities.find((f) => f.id === this.state.targetId);
        if (!targetFood || targetFood.amount <= 0.05) {
          this.invalidateTarget();
          this.setTask('IDLE_REASSESS', simTime, 'NORMAL', 5.0);
          return { switchedTask: true };
        }
      }
    }

    // 6. Task Timeout Check
    if (this.state.taskDuration > this.state.taskTimeout) {
      this.invalidateTarget();
      const switched = this.reassessTask(simTime, body, sensors, internalState, drives, memory, role, colonyNeeds, foodEntities, rng);
      if (!switched) {
        this.state.taskDuration = 0;
        this.state.taskStatus = 'ACTIVE';
        this.state.lifecycleState = TaskSystem.mapTaskToLifecycle(this.state.currentTask);
      }
      return { switchedTask: true };
    }

    // 7. Periodic Utility Reassessment (Every 1.0 - 2.2s)
    if (this.state.reassessmentCooldown <= 0) {
      this.state.reassessmentCooldown = rng.range(1.0, 2.2);
      const switched = this.reassessTask(simTime, body, sensors, internalState, drives, memory, role, colonyNeeds, foodEntities, rng);
      return { switchedTask: switched };
    }

    return { switchedTask: false };
  }

  /**
   * Unified Decision Loop evaluating balanced utility scores across all 10 priority dimensions:
   * SURVIVAL, FOOD, QUEEN, BROOD, NEST, DEFENSE, WASTE/HYGIENE, REPRODUCTION, COLLABORATION, EXPLORATION.
   */
  public reassessTask(
    simTime: number,
    body: AntBody,
    sensors: AntSensorySnapshot,
    internalState: AntInternalState,
    drives: AntDrives,
    memory: AntMemory,
    role: WorkerRole,
    colonyNeeds: ColonyNeedsContext,
    foodEntities: FoodEntity[],
    rng: SeededRNG
  ): boolean {
    const scores: { task: AntTask; score: number; priority: TaskPriority; target?: Vector2D; targetId?: string }[] = [];
    const currentTask = this.state.currentTask;

    // --- 1. SURVIVAL & THREAT (Flee or Defend) ---
    if (sensors.predatorDetected || drives.threatAvoidance > 0.5) {
      const isCombatRole = role === 'GUARD' || role === 'SOLDIER';
      const defenseScore = (sensors.predatorProximity * 1.0 + drives.threatAvoidance * 0.7) * (isCombatRole ? 2.0 : 0.4);
      const fleeScore = (sensors.predatorProximity * 1.0 + drives.threatAvoidance * 0.7) * (isCombatRole ? 0.3 : 1.6);
      scores.push({ task: 'DEFEND', score: defenseScore, priority: 'CRITICAL' });
      scores.push({ task: 'FLEE', score: fleeScore, priority: 'CRITICAL' });
    }

    // --- 2. SURVIVAL REFUELING (Proactive and critical colony storage feeding) ---
    if (internalState.carryingFoodAmount <= 0 && colonyNeeds.foodStore > 0.1) {
      const effectiveEnergy = internalState.energyReserve !== undefined ? internalState.energyReserve : (internalState.energy ?? 1.0);
      let retrievalPriority: TaskPriority = 'LOW';
      let retrievalScore = 0;

      if (effectiveEnergy < 0.25) {
        retrievalScore = 2.8;
        retrievalPriority = 'CRITICAL';
      } else if (effectiveEnergy < 0.50) {
        retrievalScore = 1.9 + (0.50 - effectiveEnergy) * 2.5;
        retrievalPriority = 'HIGH';
      } else if (effectiveEnergy < 0.70 && sensors.isAtNestEntrance) {
        retrievalScore = 1.1 + (0.70 - effectiveEnergy) * 1.5;
        retrievalPriority = 'NORMAL';
      }

      if (retrievalScore > 0) {
        scores.push({
          task: 'RETRIEVE_FOOD_FROM_STORAGE',
          score: retrievalScore,
          priority: retrievalPriority,
          target: colonyNeeds.storageFoodChamberPosition
            ? { ...colonyNeeds.storageFoodChamberPosition }
            : { ...colonyNeeds.nestEntrance },
        });
      }
    }

    // --- 3. SURVIVAL RESTING & RECOVERY (Inside nest) ---
    if (sensors.isAtNestEntrance && (internalState.energy < 0.65 || drives.restRecovery > 0.4)) {
      const restScore = 0.9 + drives.restRecovery * 0.8 + (1.0 - internalState.energy) * 0.6;
      scores.push({ task: 'RESTING', score: restScore, priority: 'LOW' });
      scores.push({ task: 'REST', score: restScore, priority: 'LOW' });
    }

    // --- 4. FOOD DELIVERY & TRANSPORT (Carrying food or material home) ---
    if (internalState.carryingFoodAmount > 0) {
      const returnScore = 1.6 + internalState.carryingFoodAmount * 0.6;
      scores.push({
        task: 'RETURNING_TO_NEST',
        score: returnScore,
        priority: 'HIGH',
        target: colonyNeeds.storageFoodChamberPosition ? { ...colonyNeeds.storageFoodChamberPosition } : { ...colonyNeeds.nestEntrance },
      });
      scores.push({
        task: 'RETURN_HOME',
        score: returnScore,
        priority: 'HIGH',
        target: { ...colonyNeeds.nestEntrance },
      });
    }

    if (this.state.carryingMaterialAmount > 0) {
      const transportScore = 1.4 + this.state.carryingMaterialAmount * 0.5;
      scores.push({
        task: 'TRANSPORT_MATERIAL',
        score: transportScore,
        priority: 'NORMAL',
        target: { x: colonyNeeds.nestEntrance.x + 2.0, y: colonyNeeds.nestEntrance.y + 1.5 },
      });
    }

    // --- 5. FOOD HARVESTING & FORAGING ---
    if (internalState.carryingFoodAmount < 0.4 && this.state.carryingMaterialAmount <= 0) {
      const isForagerRole = role === 'FORAGER' || role === 'TRANSPORTER' || role === 'GENERAL_WORKER';
      const hungerBonus = Math.max(0, internalState.hunger - 0.2) * 1.5;
      let forageScore = (drives.foodSeeking * 0.9 + colonyNeeds.foodNeed * 0.8 + hungerBonus) *
        (role === 'FORAGER' ? 1.8 : role === 'TRANSPORTER' ? 1.4 : role === 'SCOUT' ? 1.1 : isForagerRole ? 0.9 : 0.4);

      let bestFood: FoodEntity | null = null;
      let bestScore = -1;
      for (const f of foodEntities) {
        if (f.amount <= 0.2) continue;
        const remainingUnreserved = f.remainingQuantity ?? f.amount;
        if (remainingUnreserved <= 0.1) continue;

        const d = Math.hypot(f.position.x - body.position.x, f.position.y - body.position.y);
        const foodScore = (f.amount / Math.max(1.0, d)) * 0.6;
        if (foodScore > bestScore) {
          bestScore = foodScore;
          bestFood = f;
        }
      }

      if (bestFood) {
        const bestDist = Math.hypot(bestFood.position.x - body.position.x, bestFood.position.y - body.position.y);
        forageScore += Math.max(0, 0.7 - bestDist * 0.01);
        scores.push({
          task: 'FORAGING',
          score: forageScore,
          priority: internalState.hunger > 0.5 ? 'HIGH' : 'NORMAL',
          target: { ...bestFood.position },
          targetId: bestFood.id,
        });
        scores.push({
          task: 'COLLECT_FOOD',
          score: forageScore,
          priority: 'NORMAL',
          target: { ...bestFood.position },
          targetId: bestFood.id,
        });
      } else if (memory.lastKnownFoodPosition && memory.foodConfidence > 0.2) {
        scores.push({
          task: 'FORAGING',
          score: forageScore * 0.95,
          priority: 'NORMAL',
          target: { ...memory.lastKnownFoodPosition },
        });
        scores.push({
          task: 'SEEK_FOOD',
          score: forageScore * 0.9,
          priority: 'NORMAL',
          target: { ...memory.lastKnownFoodPosition },
        });
      } else if (colonyNeeds.foodNeed > 0.35) {
        scores.push({ task: 'FORAGING', score: forageScore * 0.75, priority: 'NORMAL' });
        scores.push({ task: 'SEEK_FOOD', score: forageScore * 0.7, priority: 'NORMAL' });
      }
    }

    // --- 6. BROOD CARE & NURSERY ---
    if (colonyNeeds.broodNeed > 0.1 || role === 'NURSE' || role === 'BROOD_CARE') {
      const nurseMultiplier = (role === 'NURSE' || role === 'BROOD_CARE') ? 2.0 : role === 'GENERAL_WORKER' ? 0.9 : 0.3;
      const careScore = (colonyNeeds.broodNeed * 1.0 + drives.broodCare * 0.6 + 0.3) * nurseMultiplier;
      scores.push({
        task: 'FEEDING_BROOD',
        score: careScore,
        priority: colonyNeeds.broodNeed > 0.6 ? 'HIGH' : 'NORMAL',
        target: { ...colonyNeeds.nurseryPosition },
      });
      scores.push({
        task: 'CARE_FOR_BROOD',
        score: careScore,
        priority: 'NORMAL',
        target: { ...colonyNeeds.nurseryPosition },
      });
    }

    // --- 7. QUEEN ATTENDANCE ---
    if (colonyNeeds.queenNeed > 0.2 || role === 'NURSE' || role === 'SUPPORT') {
      const queenMultiplier = (role === 'NURSE' || role === 'SUPPORT') ? 1.8 : 0.4;
      const queenScore = (colonyNeeds.queenNeed * 0.9 + 0.3) * queenMultiplier;
      scores.push({
        task: 'ATTENDING_QUEEN',
        score: queenScore,
        priority: colonyNeeds.queenNeed > 0.6 ? 'HIGH' : 'NORMAL',
        target: { ...colonyNeeds.queenPosition },
      });
      scores.push({
        task: 'ATTEND_QUEEN',
        score: queenScore,
        priority: 'NORMAL',
        target: { ...colonyNeeds.queenPosition },
      });
    }

    // --- 8. NEST CONSTRUCTION & MAINTENANCE ---
    if (role === 'BUILDER' || role === 'MAINTENANCE' || role === 'NEST_WORKER' || colonyNeeds.nestNeed > 0.05) {
      const builderMult = (role === 'BUILDER' || role === 'MAINTENANCE' || role === 'NEST_WORKER') ? 1.8 : 0.5;
      if (this.state.carryingMaterialAmount > 0) {
        scores.push({
          task: 'BUILDING',
          score: (1.5 + this.state.carryingMaterialAmount * 0.5) * builderMult,
          priority: 'HIGH',
          target: colonyNeeds.buildingChamberPosition ? { ...colonyNeeds.buildingChamberPosition } : { ...colonyNeeds.nestEntrance },
        });
      } else if (colonyNeeds.buildingChamberPosition) {
        scores.push({
          task: 'EXCAVATE',
          score: (1.2 + colonyNeeds.nestNeed * 1.0) * builderMult,
          priority: 'NORMAL',
          target: { ...colonyNeeds.buildingChamberPosition },
        });
        scores.push({
          task: 'BUILD_CHAMBER',
          score: (1.1 + colonyNeeds.nestNeed * 0.9) * builderMult,
          priority: 'NORMAL',
          target: { ...colonyNeeds.buildingChamberPosition },
        });
        scores.push({
          task: 'COLLECT_MATERIAL',
          score: (1.0 + colonyNeeds.nestNeed * 0.8) * builderMult,
          priority: 'NORMAL',
          target: { ...colonyNeeds.buildingChamberPosition },
        });
      }
    }

    // --- 9. DEFENSE & PATROL ---
    if (role === 'GUARD' || role === 'SOLDIER' || colonyNeeds.defenseNeed > 0.2) {
      const guardMult = (role === 'GUARD' || role === 'SOLDIER') ? 1.8 : 0.4;
      const patrolScore = (colonyNeeds.defenseNeed * 1.1 + 0.4) * guardMult;
      scores.push({
        task: 'PATROL',
        score: patrolScore,
        priority: colonyNeeds.defenseNeed > 0.5 ? 'HIGH' : 'NORMAL',
        target: { ...colonyNeeds.nestEntrance },
      });
      scores.push({
        task: 'DEFEND',
        score: patrolScore * 0.9,
        priority: 'NORMAL',
        target: { ...colonyNeeds.nestEntrance },
      });
    }

    // --- 10. WASTE & SANITATION ---
    if (sensors.nearestCorpseId || colonyNeeds.sanitationNeed > 0.1 || role === 'WASTE' || role === 'WASTE_WORKER' || role === 'SANITATION') {
      const sanMult = (role === 'WASTE' || role === 'WASTE_WORKER' || role === 'SANITATION') ? 1.8 : 0.6;
      const sanScore = (colonyNeeds.sanitationNeed * 0.9 + (sensors.nearestCorpseDistance ? Math.max(0, 0.6 - sensors.nearestCorpseDistance * 0.04) : 0.2)) * sanMult;
      scores.push({
        task: 'SANITIZE',
        score: sanScore,
        priority: 'NORMAL',
        targetId: sensors.nearestCorpseId || undefined,
        target: { ...colonyNeeds.graveyardPosition },
      });
    }

    // --- 11. SOCIAL CARE & COLLABORATION RESCUE ---
    if (colonyNeeds.socialCareNeed > 0.1 && colonyNeeds.distressedAntPosition && internalState.energy > 0.4) {
      const dist = Math.hypot(colonyNeeds.distressedAntPosition.x - body.position.x, colonyNeeds.distressedAntPosition.y - body.position.y);
      if (dist < 15.0) {
        const rescueScore = colonyNeeds.socialCareNeed * 1.5 * (1.0 - dist / 18.0);
        scores.push({
          task: 'RESCUE_NESTMATE',
          score: rescueScore,
          priority: 'HIGH',
          target: { ...colonyNeeds.distressedAntPosition },
          targetId: colonyNeeds.distressedAntId,
        });
      }
    }

    // --- 12. PURPOSEFUL EXPLORATION & SCOUTING (Non-Default Utility) ---
    // Exploration is ONLY prioritized when information-seeking is genuinely demanded
    const isScout = role === 'SCOUT' || role === 'EXPLORER';
    if (isScout || (colonyNeeds.explorationNeed > 0.35 && internalState.energy > 0.6)) {
      const scoutMult = isScout ? 1.6 : 0.6;
      let exploreScore = (colonyNeeds.explorationNeed * 0.8 + drives.exploration * 0.4) * scoutMult + rng.range(-0.04, 0.04);
      if (internalState.energy < 0.5) {
        exploreScore *= (internalState.energy / 0.5); // Suppress when hungry
      }
      scores.push({ task: 'EXPLORING', score: exploreScore, priority: 'NORMAL' });
      scores.push({ task: 'SCOUT', score: exploreScore, priority: 'NORMAL' });
      scores.push({ task: 'EXPLORE', score: exploreScore, priority: 'NORMAL' });
    }

    // --- 13. RESTING / WAITING_FOR_TASK (Valid In-Nest Idle) ---
    if (sensors.isAtNestEntrance) {
      const idleScore = 0.5 + (1.0 - colonyNeeds.foodNeed) * 0.3;
      scores.push({ task: 'WAITING_FOR_TASK', score: idleScore, priority: 'LOW' });
      scores.push({ task: 'IDLE', score: idleScore, priority: 'LOW' });
    }

    // Filter scores by strict role capabilities
    const capabilities = ROLE_CAPABILITIES_TABLE[role] || ROLE_CAPABILITIES_TABLE.GENERAL_WORKER;
    const allowedScores = scores.filter((item) => capabilities.allowedTasks.includes(item.task));

    // Apply Hysteresis commitment bonus to avoid thrashing
    for (const item of allowedScores) {
      if (item.task === currentTask) {
        item.score += 0.25;
      }
    }

    // Sort descending by score
    allowedScores.sort((a, b) => b.score - a.score);
    const chosen = allowedScores[0];

    if (chosen) {
      if (chosen.task !== this.state.currentTask) {
        this.setTask(chosen.task, simTime, chosen.priority, chosen.task === 'EXPLORING' ? 15.0 : 25.0);
        this.state.targetPosition = chosen.target || null;
        this.state.targetId = chosen.targetId || null;
        return true;
      } else {
        this.state.taskStatus = 'ACTIVE';
        this.state.lifecycleState = TaskSystem.mapTaskToLifecycle(this.state.currentTask);
      }
    } else {
      // Fallback to role's designated recovery task
      const fallbackTask = capabilities.recoveryTask;
      if (fallbackTask !== this.state.currentTask) {
        this.setTask(fallbackTask, simTime, capabilities.defaultPriority, 20.0);
        return true;
      }
    }

    return false;
  }

  public static mapTaskToLifecycle(task: AntTask): AntLifecycleState {
    switch (task) {
      case 'EXPLORING':
      case 'EXPLORE':
      case 'SCOUT':
      case 'SEEK_FOOD':
        return 'EXPLORING';
      case 'FORAGING':
      case 'COLLECT_FOOD':
      case 'COLLECTING_FOOD':
      case 'EXCAVATE':
      case 'COLLECT_MATERIAL':
      case 'BUILDING':
      case 'BUILD':
      case 'BUILD_CHAMBER':
      case 'FEEDING_BROOD':
      case 'CARE_FOR_BROOD':
      case 'ATTENDING_QUEEN':
      case 'ATTEND_QUEEN':
      case 'SANITIZE':
      case 'MIDDEN_CLEANUP':
      case 'RETRIEVE_FOOD_FROM_STORAGE':
      case 'DEFEND':
      case 'DEFENDING':
      case 'PATROL':
      case 'FLEE':
      case 'FLEEING':
        return 'WORKING';
      case 'RETURNING_TO_NEST':
      case 'RETURN_HOME':
      case 'TRANSPORT_MATERIAL':
      case 'TRANSPORT_FOOD':
        return 'MOVING';
      case 'RESCUE_NESTMATE':
      case 'SOCIAL_INTERACTION':
        return 'HELPING';
      case 'RESTING':
      case 'REST':
      case 'IDLE':
      case 'IDLE_REASSESS':
      case 'WAITING_FOR_TASK':
        return 'IDLE';
      case 'RECOVER':
        return 'RECOVERING';
      default:
        return 'IDLE';
    }
  }

  public setTask(task: AntTask, simTime: number, priority: TaskPriority = 'NORMAL', timeout = 25.0): void {
    this.state.currentTask = task;
    this.state.taskStatus = 'ACTIVE';
    this.state.lifecycleState = TaskSystem.mapTaskToLifecycle(task);
    this.state.taskStartTime = simTime;
    this.state.taskDuration = 0;
    this.state.taskTimeout = timeout;
    this.state.taskPriority = priority;
  }

  public completeTask(simTime: number): void {
    this.state.taskStatus = 'COMPLETED';
    this.state.lifecycleState = 'COMPLETED';
    this.invalidateTarget();
    this.state.reassessmentCooldown = 0;
    this.state.currentTask = 'IDLE_REASSESS';
    this.state.taskStartTime = simTime;
    this.state.taskDuration = 0;
  }

  public invalidateTarget(): void {
    this.state.targetId = null;
    this.state.targetPosition = null;
  }
}
