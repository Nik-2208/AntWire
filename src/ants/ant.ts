/**
 * ANT BRAIN — Ant Organism Entity
 * Integrates Body, Sensors, Internal State, Motivational Drives, Memory, and Controller.
 */

import { AntBody, IndividualTraits } from './body';
import { AntSensors } from './sensors';
import { AntBodyState } from './internal_state';
import { AntMotivationalDrives } from './drives';
import { AntMemory } from './memory';
import { AntController } from './controllers/controller';
import { BiologicalBrainController } from './controllers/biological_brain';
import { AntAction, AntCaste, FoodEntity, ObstacleEntity, PredatorState, Vector2D, DecisionRecord, WorkerRole } from '../simulation/types';
import { PheromoneField } from '../pheromones/field';
import { SeededRNG } from '../simulation/rng';
import { SimulationConfig } from '../simulation/config';
import { SimulationEventBus } from '../simulation/events';
import { TaskSystem, ColonyNeedsContext } from './task_system';
import { AntRoleState } from '../colony/roles';
import { ColonyCommunicationBus } from '../colony/communication';
import { CollaborativeTaskManager } from '../colony/collaborative_tasks';
import { AuthoritativeRewardEngine } from '../simulation/authoritative_reward_engine';
import { AntSpeciesProfile, DEFAULT_SPECIES_PROFILE } from './species_profile';
import { AntPheromoneDecisionState, PheromoneDecisionEngine } from './pheromone_decision';
import { NeuromodulatorSystem } from '../learning/neuromodulation';

export class Ant {
  public id: string;
  public colonyId: string;
  public body: AntBody;
  public sensors: AntSensors;
  public internalState: AntBodyState;
  public drives: AntMotivationalDrives;
  public memory: AntMemory;
  public controller: AntController;
  public taskSystem: TaskSystem;
  public roleState: AntRoleState;
  public speciesProfile: AntSpeciesProfile;
  public pheromoneState: AntPheromoneDecisionState;
  public readonly neuromodulator: NeuromodulatorSystem;

  // History & telemetry buffers
  public lastAction: AntAction;
  public latestDecision: DecisionRecord | null = null;
  public recentDecisions: DecisionRecord[] = [];
  public maxDecisionHistory: number = 30;

  constructor(
    id: string,
    colonyId: string,
    initialPos: Vector2D,
    initialHeading: number,
    caste: AntCaste = 'WORKER',
    traits?: Partial<IndividualTraits>,
    controller?: AntController,
    primaryRole: WorkerRole = 'FORAGER',
    speciesProfile?: AntSpeciesProfile
  ) {
    this.id = id;
    this.colonyId = colonyId;
    this.body = new AntBody(colonyId, initialPos, initialHeading, caste, traits);
    this.sensors = new AntSensors();
    this.internalState = new AntBodyState();
    this.drives = new AntMotivationalDrives();
    this.memory = new AntMemory();
    this.controller = controller || new BiologicalBrainController(id);
    this.taskSystem = new TaskSystem('EXPLORING', 0, initialPos);
    this.roleState = {
      primaryRole: caste === 'QUEEN' ? 'REPRODUCTIVE' : primaryRole,
      roleDuration: 0,
      roleSwitchCooldown: 0,
      minimumRoleDuration: 20.0,
    };
    this.speciesProfile = speciesProfile || DEFAULT_SPECIES_PROFILE;
    this.pheromoneState = PheromoneDecisionEngine.createDefaultState(this.speciesProfile);
    this.neuromodulator = new NeuromodulatorSystem();

    this.lastAction = { type: 'STOP' };
  }

  /**
   * Main per-tick update lifecycle:
   * SENSE -> INTERNAL STATE -> DRIVES -> TASK UPDATE -> DECIDE -> ACT -> WORLD INTERACTION -> RECORD
   */
  public update(
    dt: number,
    simTime: number,
    tick: number,
    pheromones: PheromoneField,
    foodEntities: FoodEntity[],
    nestEntrance: Vector2D,
    nestRadius: number,
    obstacles: ObstacleEntity[],
    predators: PredatorState[],
    nearbyAnts: AntBody[],
    rng: SeededRNG,
    worldHalfW: number,
    worldHalfH: number,
    config?: SimulationConfig,
    eventBus?: SimulationEventBus,
    colonyNeeds?: ColonyNeedsContext,
    communicationBus?: ColonyCommunicationBus,
    collaborativeTasks?: CollaborativeTaskManager
  ): void {
    if (!this.internalState.state.isAlive) {
      this.body.speed = 0;
      this.body.isMoving = false;
      return;
    }

    // 1. SENSORY PERCEPTION
    const sensorySnapshot = this.sensors.sense(
      this.body,
      pheromones,
      foodEntities,
      nestEntrance,
      nestRadius,
      obstacles,
      predators,
      nearbyAnts
    );

    // 1.5 COMMUNICATION BUS MESSAGING (In-Flight Delivery & Outbox)
    if (communicationBus) {
      const incoming = communicationBus.getMessagesForAnt(
        this.id,
        this.body.position,
        this.body.traits.sensoryRange / 2.2
      );

      for (const msg of incoming) {
        if (msg.type === 'DANGER' && msg.location) {
          this.internalState.state.threatLevel = Math.max(this.internalState.state.threatLevel, 0.85);
          this.memory.rememberThreat(msg.location);
        } else if (msg.type === 'RESOURCE_FOUND' && msg.location) {
          this.memory.rememberFood(msg.location);
          if (this.taskSystem.state.currentTask === 'EXPLORING' || this.taskSystem.state.currentTask === 'IDLE') {
            this.taskSystem.state.currentTask = 'SEEK_FOOD';
            this.taskSystem.state.targetPosition = { ...msg.location };
          }
        } else if (msg.type === 'RECRUIT_REQUEST' && msg.payload?.taskId && collaborativeTasks) {
          if (this.taskSystem.state.currentTask === 'EXPLORING' || this.taskSystem.state.currentTask === 'IDLE') {
            collaborativeTasks.joinTask(msg.payload.taskId, this.id, 'HELPER');
          }
        }
      }

      // Outgoing discovery communication
      if (sensorySnapshot.foodOdorConcentration > 0.65 && sensorySnapshot.detectedFoodId) {
        communicationBus.postMessage(
          this.id,
          'BROADCAST',
          'RESOURCE_FOUND',
          { foodId: sensorySnapshot.detectedFoodId },
          simTime,
          this.body.position,
          4.0,
          0.9
        );
      }

      if (sensorySnapshot.predatorDetected) {
        communicationBus.postMessage(
          this.id,
          'BROADCAST',
          'DANGER',
          { threatProximity: sensorySnapshot.predatorProximity },
          simTime,
          this.body.position,
          5.0,
          1.0
        );
      }
    }

    // 1.6 COLLABORATIVE TASK INTERACTION
    if (collaborativeTasks) {
      const joinable = collaborativeTasks.getJoinableTasks(this.body.position, 6.0);
      if (joinable.length > 0) {
        const task = joinable[0];
        collaborativeTasks.joinTask(task.taskId, this.id);
        collaborativeTasks.recordContribution(task.taskId, this.id, dt * 1.2);
      }
    }

    // 2. INTERNAL PHYSIOLOGY UPDATE
    this.internalState.update(
      dt,
      this.body.speed,
      this.body.traits.energyEfficiency,
      sensorySnapshot.predatorProximity,
      config
    );

    if (!this.internalState.state.isAlive) {
      this.body.speed = 0;
      this.body.isMoving = false;
      return;
    }

    // 3. MOTIVATIONAL DRIVES
    const drivesVector = this.drives.computeDrives(
      this.internalState.state,
      sensorySnapshot,
      this.body.traits
    );

    // 4. TASK LIFECYCLE & STATE MACHINE UPDATE
    const activeColonyNeeds: ColonyNeedsContext = colonyNeeds || {
      foodNeed: 0.5,
      waterNeed: 0.2,
      broodNeed: 0.3,
      queenNeed: 0.2,
      nestNeed: 0.2,
      defenseNeed: 0.05,
      sanitationNeed: 0.0,
      socialCareNeed: 0.05,
      explorationNeed: 0.5,
      reserveNeed: 0.2,
      foodStore: 25.0,
      nestEntrance,
      nestRadius,
      queenPosition: { x: nestEntrance.x - 1.0, y: nestEntrance.y + 4.0 },
      nurseryPosition: { x: nestEntrance.x - 3.5, y: nestEntrance.y + 1.5 },
      graveyardPosition: { x: nestEntrance.x + 12.0, y: nestEntrance.y - 10.0 },
    };

    const taskResult = this.taskSystem.update(
      dt,
      simTime,
      this.body,
      sensorySnapshot,
      this.internalState.state,
      drivesVector,
      this.memory,
      this.roleState.primaryRole,
      activeColonyNeeds,
      foodEntities,
      rng
    );

    // Sync task name to body for inspection/telemetry
    this.body.task = this.taskSystem.state.currentTask;

    // 5. EPISODIC MEMORY DECAY & TRACKING
    this.memory.updateDecay(dt);
    this.memory.recordPosition(this.body.position, simTime);

    if (sensorySnapshot.foodOdorConcentration > 0.4 && sensorySnapshot.detectedFoodId) {
      this.memory.rememberFood(this.body.position);
    }
    if (sensorySnapshot.predatorDetected) {
      this.memory.rememberThreat(this.body.position);
    }

    // 5.5 NEUROMODULATORY DECAY TOWARD TONIC EQUILIBRIUM
    this.neuromodulator.updateDecay(dt, simTime);

    // 6. POLICY DECISION EXECUTION WITH ROBUST FAILURE ISOLATION
    let actionToExecute: AntAction = { type: 'STOP' };
    let decisionRecord: DecisionRecord;

    try {
      if (taskResult.actionOverride) {
        actionToExecute = taskResult.actionOverride;
        decisionRecord = {
          id: `${this.id}-${tick}`,
          antId: this.id,
          timestamp: simTime,
          tick,
          sensorySnapshot: { ...sensorySnapshot },
          internalState: { ...this.internalState.state },
          drives: { ...drivesVector },
          selectedAction: actionToExecute,
          dominantDrive: 'Task Override',
          dominantDriveValue: 1.0,
          confidence: 0.99,
          humanReason: 'Executing direct task intervention / unstuck maneuver.',
          technicalExplanation: `Task state machine override: ${this.taskSystem.state.currentTask}`,
        };
      } else {
        const { action, record } = this.controller.decide(
          this.id,
          simTime,
          tick,
          this.body,
          sensorySnapshot,
          this.internalState.state,
          drivesVector,
          this.memory,
          rng
        );
        actionToExecute = action;
        decisionRecord = record;
      }

      this.lastAction = actionToExecute;
      this.latestDecision = decisionRecord;
      this.recentDecisions.push(decisionRecord);
      if (this.recentDecisions.length > this.maxDecisionHistory) {
        this.recentDecisions.shift();
      }

      // 7. MOTOR & BEHAVIORAL INTERVENTIONS
      this.executeAction(actionToExecute, dt, pheromones, foodEntities, nestEntrance, nestRadius, config, eventBus, simTime, activeColonyNeeds);
    } catch (err: any) {
      // Individual ant inference failure isolation: isolate to RECOVERING state without terminating colony
      console.warn(`[AntWire Failure Isolation] Ant ${this.id} encountered an inference/action error:`, err?.message || err);
      this.taskSystem.setTask('RECOVER', simTime, 'HIGH', 10.0);
      this.taskSystem.transitionLifecycle('RECOVERING', this.id);
      this.body.task = 'RECOVER';
      this.body.speed = 0;
      this.body.isMoving = false;
      this.lastAction = { type: 'STOP' };
      if (eventBus) {
        eventBus.emit({
          type: 'ANOMALY_DETECTED',
          timestamp: simTime,
          entityId: this.id,
          colonyId: this.colonyId,
          message: `Ant ${this.id} entered RECOVERING state after isolated inference/action error.`,
        });
      }
    }

    // 8. BOUNDARY CONSTRAINTS
    this.body.clampToWorld(worldHalfW, worldHalfH);
  }

  private executeAction(
    action: AntAction,
    dt: number,
    pheromones: PheromoneField,
    foodEntities: FoodEntity[],
    nestEntrance: Vector2D,
    nestRadius: number,
    config?: SimulationConfig,
    eventBus?: SimulationEventBus,
    simTime: number = 0,
    colonyNeeds?: ColonyNeedsContext
  ): void {
    let speedMult = action.speedMultiplier !== undefined ? action.speedMultiplier : 1.0;
    const turnAngle = action.turnAngle !== undefined ? action.turnAngle : 0.0;

    // Apply biological mobility penalty from exhaustion/injury
    const mobilityFactor = Math.max(0.15, 1.0 - this.internalState.state.mobilityPenalty);
    speedMult *= mobilityFactor;

    // Kinematic translation and rotation
    this.body.updateMotion(dt, speedMult, turnAngle);

    // Chemical Deposition via Authoritative Context-Aware Decision Engine
    const pheroDecision = PheromoneDecisionEngine.evaluateDeposition(
      this.body,
      this.sensors.lastSnapshot,
      this.internalState.state,
      colonyNeeds,
      this.pheromoneState,
      this.speciesProfile,
      simTime
    );

    if (pheroDecision.shouldDeposit && pheroDecision.channel !== undefined && pheroDecision.strength > 0) {
      pheromones.deposit(
        this.body.position.x,
        this.body.position.y,
        pheroDecision.channel,
        pheroDecision.strength * dt * 5.0
      );
    }

    // Specific discrete action behaviors
    switch (action.type) {
      case 'COLLECT_FOOD': {
        const foodId = (action.metadata?.foodId as string) || this.taskSystem.state.targetId || this.sensors.lastSnapshot.detectedFoodId;
        if (foodId) {
          const targetFood = foodEntities.find((f) => f.id === foodId);
          if (targetFood && targetFood.amount > 0) {
            const dx = targetFood.position.x - this.body.position.x;
            const dy = targetFood.position.y - this.body.position.y;
            const dist = Math.hypot(dx, dy);
            const collectionRadius = config?.food.collectionRadius ?? 1.2;

            if (dist <= collectionRadius + targetFood.radius) {
              const carryCapacity = config?.food.carryCapacity ?? 3.0;
              const harvestRate = config?.food.collectionRate ?? 1.0;
              const wantToTake = Math.min(harvestRate, targetFood.amount);
              const actualTaken = this.internalState.pickupFood(foodId, wantToTake, carryCapacity);

              if (actualTaken > 0) {
                targetFood.amount -= actualTaken;
                this.memory.rememberFood(targetFood.position);
                this.memory.totalFoodHarvested += actualTaken;

                // Fulfill task & switch immediately to returning cargo home!
                this.taskSystem.setTask('RETURNING_TO_NEST', simTime, 'HIGH', 30.0);
                this.body.task = 'RETURNING_TO_NEST';

                const rewardEvent = AuthoritativeRewardEngine.getInstance().emitReward(
                  this.id,
                  'ACTION',
                  'COLLECT_FOOD',
                  'SUCCESS',
                  2.5,
                  'Harvested food parcel into crop mandibles.',
                  simTime,
                  'COLLECT_FOOD',
                  1.0,
                  undefined,
                  eventBus
                );

                if (rewardEvent) {
                  this.neuromodulator.processReinforcementEvent(
                    rewardEvent.value,
                    0.0,
                    0.95,
                    rewardEvent.reason,
                    simTime
                  );
                }

                if (eventBus) {
                  eventBus.emit({
                    type: 'FOOD_PICKED_UP',
                    timestamp: simTime,
                    entityId: this.id,
                    colonyId: this.colonyId,
                    data: {
                      foodId,
                      amount: actualTaken,
                      remainingInPatch: targetFood.amount,
                      carryingTotal: this.internalState.state.carryingFoodAmount,
                    },
                  });
                }
              }
            } else {
              // Not yet close enough: steer toward food at normal speed rather than stopping!
              const headingToFood = Math.atan2(dy, dx);
              let angleDiff = headingToFood - this.body.heading;
              while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
              while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
              this.body.updateMotion(dt, 1.0, angleDiff * 0.8);
            }
          } else {
            // Food is depleted or invalid!
            this.taskSystem.invalidateTarget();
            this.taskSystem.setTask('EXPLORING', simTime, 'LOW', 15.0);
            this.body.task = 'EXPLORING';
          }
        }
        break;
      }

      case 'DEPOSIT_FOOD': {
        const distToNest = Math.hypot(
          this.body.position.x - nestEntrance.x,
          this.body.position.y - nestEntrance.y
        );
        if (distToNest <= nestRadius + 0.8 && this.internalState.state.carryingFoodAmount > 0) {
          // Food is deposited and handled by Colony.update loop for strict conservation
          const rewardEvent = AuthoritativeRewardEngine.getInstance().emitReward(
            this.id,
            'COMPLETION',
            'DEPOSIT_FOOD',
            'SUCCESS',
            8.0,
            'Successfully delivered cargo into nest storage chamber.',
            simTime,
            'RETURNING_TO_NEST',
            1.0,
            undefined,
            eventBus
          );
          if (rewardEvent) {
            this.neuromodulator.processReinforcementEvent(
              rewardEvent.value,
              0.0,
              0.95,
              rewardEvent.reason,
              simTime
            );
          }
          this.taskSystem.completeTask(simTime);
          this.body.task = 'IDLE_REASSESS';
        }
        break;
      }

      case 'FLEE': {
        this.body.task = 'FLEEING';
        break;
      }

      case 'MOVE_FORWARD': {
        if (this.internalState.state.carryingFoodAmount > 0) {
          this.body.task = 'RETURNING_TO_NEST';
        }
        break;
      }
    }
  }

  /**
   * Authoritative full organism state snapshot accessor returning all 18 independent ant properties
   */
  public getFullOrganismSnapshot() {
    return {
      id: this.id,
      brain: this.controller,
      memory: this.memory,
      learning: this.neuromodulator,
      motivation: this.drives,
      energy: this.internalState.energy,
      health: this.internalState.health,
      hunger: this.internalState.hunger,
      age: this.internalState.state.age,
      role: this.roleState.primaryRole,
      task: this.taskSystem.state.currentTask,
      target: this.taskSystem.state.targetPosition,
      navigation: {
        lastKnownFoodPosition: this.memory.lastKnownFoodPosition,
        lastKnownThreatPosition: this.memory.lastKnownThreatPosition,
        breadcrumbsCount: this.memory.recentBreadcrumbs.length,
      },
      sensoryState: this.sensors.lastSnapshot,
      motorState: this.lastAction,
      rewardState: {
        lastReward: this.latestDecision?.confidence || 0,
      },
      communicationState: {
        helpRequested: this.internalState.state.helpRequested,
      },
      pheromoneState: this.pheromoneState,
      socialState: {
        roleState: this.roleState,
        switchingPhase: this.roleState.switchingPhase || 'ROLE_EXECUTION',
      },
    };
  }
}

