/**
 * ANT BRAIN — Authoritative Ant Task State Machine & Lifecycle System
 * Explicit task state, spatial food retrieval for starving workers, physical chamber excavation,
 * material transport to surface mound, target reservation/invalidation, and utility score competition.
 */

import {
  AntAction,
  AntDrives,
  AntInternalState,
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

export interface TaskState {
  currentTask: AntTask;
  taskStatus: TaskLifecycleState;
  taskStartTime: number;
  taskDuration: number;
  taskTimeout: number;
  taskPriority: TaskPriority;
  targetId: string | null;
  targetPosition: Vector2D | null;
  taskCooldown: number;
  reassessmentCooldown: number;
  stuckTimer: number;
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

export class TaskSystem {
  public state: TaskState;

  constructor(initialTask: AntTask = 'EXPLORING', simTime = 0, initialPos: Vector2D = { x: 0, y: 0 }) {
    this.state = {
      currentTask: initialTask,
      taskStatus: 'ACTIVE',
      taskStartTime: simTime,
      taskDuration: 0,
      taskTimeout: 25.0,
      taskPriority: 'NORMAL',
      targetId: null,
      targetPosition: null,
      taskCooldown: 0,
      reassessmentCooldown: 0.8,
      stuckTimer: 0,
      lastPosition: { ...initialPos },
      consecutiveFailures: 0,
      carryingMaterialAmount: 0,
    };
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
      this.setTask('EXPLORING', simTime, 'LOW', 15.0);
      const escapeTurn = rng.range(2.0, 3.14) * (rng.chance(0.5) ? 1 : -1);
      return {
        switchedTask: true,
        actionOverride: ActionFactory.move(1.0, escapeTurn),
      };
    }

    // 2. High-Priority Threat Interrupts (Immediate Preemption)
    if (sensors.predatorDetected || drives.threatAvoidance > 0.75) {
      if (this.state.currentTask !== 'FLEE' && this.state.currentTask !== 'DEFEND') {
        const wantsToFight = role === 'GUARD' && internalState.health > 0.6;
        const nextTask: AntTask = wantsToFight ? 'DEFEND' : 'FLEE';
        this.setTask(nextTask, simTime, 'CRITICAL', 8.0);
        return { switchedTask: true };
      }
    }

    // 3. Carrying Cargo Transition (If full of food or material, head to nest)
    if (internalState.carryingFoodAmount > 0) {
      if (this.state.currentTask === 'COLLECT_FOOD' || this.state.currentTask === 'FORAGING' || this.state.currentTask === 'EXPLORING') {
        this.setTask('RETURNING_TO_NEST', simTime, 'HIGH', 30.0);
        this.state.targetPosition = colonyNeeds.storageFoodChamberPosition ? { ...colonyNeeds.storageFoodChamberPosition } : { ...colonyNeeds.nestEntrance };
        return { switchedTask: true };
      }
    }

    if (this.state.carryingMaterialAmount > 0) {
      if (this.state.currentTask === 'EXCAVATE' || this.state.currentTask === 'COLLECT_MATERIAL') {
        this.setTask('TRANSPORT_MATERIAL', simTime, 'NORMAL', 25.0);
        // Head outside to surface mound
        this.state.targetPosition = { x: colonyNeeds.nestEntrance.x + 2.0, y: colonyNeeds.nestEntrance.y + 1.5 };
        return { switchedTask: true };
      }
    }

    // 4. Target Invalidation Check for Food Tasks
    if (this.state.currentTask === 'COLLECT_FOOD' || this.state.currentTask === 'FORAGING') {
      if (this.state.targetId) {
        const targetFood = foodEntities.find((f) => f.id === this.state.targetId);
        if (!targetFood || targetFood.amount <= 0.05) {
          this.invalidateTarget();
          this.setTask('EXPLORING', simTime, 'NORMAL', 15.0);
          return { switchedTask: true };
        }
      }
    }

    // 5. Task Timeout Check
    if (this.state.taskDuration > this.state.taskTimeout) {
      this.state.taskStatus = 'FAILED';
      this.invalidateTarget();
      this.reassessTask(simTime, body, sensors, internalState, drives, memory, role, colonyNeeds, foodEntities, rng);
      return { switchedTask: true };
    }

    // 6. Periodic Utility Reassessment (Every 1.0 - 2.2s)
    if (this.state.reassessmentCooldown <= 0) {
      this.state.reassessmentCooldown = rng.range(1.0, 2.2);
      const switched = this.reassessTask(simTime, body, sensors, internalState, drives, memory, role, colonyNeeds, foodEntities, rng);
      return { switchedTask: switched };
    }

    return { switchedTask: false };
  }

  /**
   * Evaluates competitive utility scores across possible tasks and picks the highest scoring task.
   */
  public reassessTask(
    simTime: number,
    body: AntBody,
    sensors: AntSensorySnapshot,
    internalState: AntInternalState,
    drives: AntDrives,
    _memory: AntMemory,
    role: WorkerRole,
    colonyNeeds: ColonyNeedsContext,
    foodEntities: FoodEntity[],
    rng: SeededRNG
  ): boolean {
    const scores: { task: AntTask; score: number; priority: TaskPriority; target?: Vector2D; targetId?: string }[] = [];
    const currentTask = this.state.currentTask;

    // --- (A) FLEE / DEFENSE ---
    if (sensors.predatorDetected || drives.threatAvoidance > 0.5) {
      const defenseScore = (sensors.predatorProximity * 0.9 + drives.threatAvoidance * 0.6) * (role === 'GUARD' ? 1.5 : 0.4);
      const fleeScore = (sensors.predatorProximity * 0.9 + drives.threatAvoidance * 0.6) * (role === 'GUARD' ? 0.3 : 1.3);
      scores.push({ task: 'DEFEND', score: defenseScore, priority: 'CRITICAL' });
      scores.push({ task: 'FLEE', score: fleeScore, priority: 'CRITICAL' });
    }

    // --- (B) RETURNING HOME (Carrying Food or Material) ---
    if (internalState.carryingFoodAmount > 0) {
      const returnScore = 1.3 + internalState.carryingFoodAmount * 0.5;
      scores.push({
        task: 'RETURNING_TO_NEST',
        score: returnScore,
        priority: 'HIGH',
        target: colonyNeeds.storageFoodChamberPosition ? { ...colonyNeeds.storageFoodChamberPosition } : { ...colonyNeeds.nestEntrance },
      });
    }

    if (this.state.carryingMaterialAmount > 0) {
      const transportScore = 1.2 + this.state.carryingMaterialAmount * 0.4;
      scores.push({
        task: 'TRANSPORT_MATERIAL',
        score: transportScore,
        priority: 'NORMAL',
        target: { x: colonyNeeds.nestEntrance.x + 2.0, y: colonyNeeds.nestEntrance.y + 1.5 },
      });
    }

    // --- (C) CRITICAL FOOD RETRIEVAL FROM COLONY STORAGE (When hungry/starving) ---
    // Rule: Starving ants should FIRST try to retrieve stored food from nest granaries!
    if ((internalState.energy < 0.4 || internalState.hunger > 0.5) && colonyNeeds.foodStore > 0.2) {
      const retrievalScore = 1.5 + (1.0 - internalState.energy) * 1.5;
      scores.push({
        task: 'RETRIEVE_FOOD_FROM_STORAGE',
        score: retrievalScore,
        priority: internalState.energy < 0.2 ? 'CRITICAL' : 'HIGH',
        target: colonyNeeds.storageFoodChamberPosition ? { ...colonyNeeds.storageFoodChamberPosition } : { ...colonyNeeds.nestEntrance },
      });
    }

    // --- (D) SOCIAL CARE & RESCUE NESTMATE ---
    if (colonyNeeds.socialCareNeed > 0.1 && colonyNeeds.distressedAntPosition && internalState.energy > 0.4) {
      const dist = Math.hypot(colonyNeeds.distressedAntPosition.x - body.position.x, colonyNeeds.distressedAntPosition.y - body.position.y);
      if (dist < 12.0) {
        const rescueScore = colonyNeeds.socialCareNeed * 1.3 * (1.0 - dist / 15.0);
        scores.push({
          task: 'RESCUE_NESTMATE',
          score: rescueScore,
          priority: 'HIGH',
          target: { ...colonyNeeds.distressedAntPosition },
          targetId: colonyNeeds.distressedAntId,
        });
      }
    }

    // --- (E) RESTING / RECOVERY (Inside nest, low energy, safe) ---
    if (sensors.isAtNestEntrance && internalState.energy < 0.6 && drives.restRecovery > 0.4) {
      const restScore = drives.restRecovery * 0.8;
      scores.push({ task: 'RESTING', score: restScore, priority: 'LOW' });
    }

    // --- (F) FORAGING / COLLECT FOOD OUTSIDE ---
    if (internalState.carryingFoodAmount < 0.4 && this.state.carryingMaterialAmount <= 0) {
      let forageScore = (drives.foodSeeking * 0.7 + colonyNeeds.foodNeed * 0.5) * (role === 'FORAGER' ? 1.3 : role === 'SCOUT' ? 0.9 : 0.4);

      let bestFood: FoodEntity | null = null;
      let bestDist = 999;
      for (const f of foodEntities) {
        if (f.amount <= 0.2) continue;
        const remainingUnreserved = f.remainingQuantity ?? f.amount;
        if (remainingUnreserved <= 0.1) continue;

        const d = Math.hypot(f.position.x - body.position.x, f.position.y - body.position.y);
        if (d < bestDist) {
          bestDist = d;
          bestFood = f;
        }
      }

      if (bestFood) {
        forageScore += Math.max(0, 0.4 - bestDist * 0.015);
        scores.push({
          task: 'FORAGING',
          score: forageScore,
          priority: 'NORMAL',
          target: { ...bestFood.position },
          targetId: bestFood.id,
        });
      } else {
        scores.push({ task: 'FORAGING', score: forageScore * 0.7, priority: 'NORMAL' });
      }
    }

    // --- (G) NEST EXCAVATION & AUTONOMOUS PHYSICAL BUILDING ---
    if (role === 'BUILDER' || colonyNeeds.nestNeed > 0.05) {
      const builderMult = role === 'BUILDER' ? 1.5 : 0.6;
      if (this.state.carryingMaterialAmount > 0) {
        scores.push({
          task: 'BUILDING',
          score: (1.3 + this.state.carryingMaterialAmount * 0.4) * builderMult,
          priority: 'HIGH',
          target: colonyNeeds.buildingChamberPosition ? { ...colonyNeeds.buildingChamberPosition } : { ...colonyNeeds.nestEntrance },
        });
      } else if (colonyNeeds.buildingChamberPosition) {
        scores.push({
          task: 'EXCAVATE',
          score: (1.1 + colonyNeeds.nestNeed * 0.9) * builderMult,
          priority: 'NORMAL',
          target: { ...colonyNeeds.buildingChamberPosition },
        });
        scores.push({
          task: 'COLLECT_MATERIAL',
          score: (1.0 + colonyNeeds.nestNeed * 0.7) * builderMult,
          priority: 'NORMAL',
          target: { ...colonyNeeds.buildingChamberPosition },
        });
      } else {
        scores.push({
          task: 'EXPLORING',
          score: 1.0 * builderMult,
          priority: 'LOW',
        });
      }
    }

    // --- (H) CARE FOR BROOD ---
    if (colonyNeeds.broodNeed > 0.1) {
      const nurseMultiplier = role === 'NURSE' ? 1.6 : role === 'GENERAL_WORKER' ? 0.9 : 0.3;
      const careScore = (colonyNeeds.broodNeed * 0.8 + drives.broodCare * 0.5) * nurseMultiplier;
      scores.push({
        task: 'FEEDING_BROOD',
        score: careScore,
        priority: 'NORMAL',
        target: { ...colonyNeeds.nurseryPosition },
      });
    }

    // --- (I) ATTEND QUEEN ---
    if (colonyNeeds.queenNeed > 0.3 || role === 'NURSE') {
      const queenScore = (colonyNeeds.queenNeed * 0.7 + 0.3) * (role === 'NURSE' ? 1.4 : 0.4);
      scores.push({
        task: 'ATTENDING_QUEEN',
        score: queenScore,
        priority: 'NORMAL',
        target: { ...colonyNeeds.queenPosition },
      });
    }

    // --- (J) SANITATION ---
    if (sensors.nearestCorpseId && colonyNeeds.sanitationNeed > 0.1) {
      const sanMultiplier = role === 'SANITATION' ? 1.6 : 0.6;
      const sanScore = (colonyNeeds.sanitationNeed * 0.7 + (sensors.nearestCorpseDistance ? Math.max(0, 0.5 - sensors.nearestCorpseDistance * 0.05) : 0)) * sanMultiplier;
      scores.push({
        task: 'SANITIZE',
        score: sanScore,
        priority: 'NORMAL',
        targetId: sensors.nearestCorpseId,
      });
    }

    // --- (K) EXPLORATION & SCOUTING ---
    const exploreMultiplier = role === 'SCOUT' ? 1.4 : role === 'FORAGER' ? 1.0 : 0.7;
    const exploreScore = (drives.exploration * 0.75 + body.traits.explorationTendency * 0.3 + colonyNeeds.explorationNeed * 0.3) * exploreMultiplier + rng.range(-0.05, 0.05);
    scores.push({ task: 'EXPLORING', score: exploreScore, priority: 'LOW' });

    // Apply Hysteresis commitment bonus to avoid thrashing
    for (const item of scores) {
      if (item.task === currentTask) {
        item.score += 0.25;
      }
    }

    // Sort descending by score
    scores.sort((a, b) => b.score - a.score);
    const chosen = scores[0];

    if (chosen && chosen.task !== this.state.currentTask) {
      this.setTask(chosen.task, simTime, chosen.priority, chosen.task === 'EXPLORING' ? 15.0 : 25.0);
      this.state.targetPosition = chosen.target || null;
      this.state.targetId = chosen.targetId || null;
      return true;
    }

    return false;
  }

  public setTask(task: AntTask, simTime: number, priority: TaskPriority = 'NORMAL', timeout = 25.0): void {
    this.state.currentTask = task;
    this.state.taskStatus = 'ACTIVE';
    this.state.taskStartTime = simTime;
    this.state.taskDuration = 0;
    this.state.taskTimeout = timeout;
    this.state.taskPriority = priority;
  }

  public completeTask(simTime: number): void {
    this.state.taskStatus = 'COMPLETED';
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
