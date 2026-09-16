/**
 * ANT BRAIN — Colony Superorganism
 * Coordinates worker populations, Queen, Brood lifecycle, spatial food storage chambers,
 * subterranean nest graph excavation, material transport, trophallaxis food flow network,
 * and collective homeostasis.
 */

import { Ant } from '../ants/ant';
import { Queen } from './queen';
import { BroodManager } from './brood';
import { NestStructure } from './nest';
import { CauseOfDeath, ColonyControlMode, ColonyNeedsVector, ColonyStatus, Vector2D, WorkerRole } from '../simulation/types';
import { SeededRNG } from '../simulation/rng';
import { SimulationConfig } from '../simulation/config';
import { SimulationEventBus } from '../simulation/events';
import { ColonyRoleManager, RoleDistribution } from './roles';
import { ColonyNeedsContext } from '../ants/task_system';
import { ColonyCommunicationBus } from './communication';
import { CollaborativeTaskManager } from './collaborative_tasks';
import { AuthoritativeRewardEngine } from '../simulation/authoritative_reward_engine';
import { PheromoneDecisionEngine } from '../ants/pheromone_decision';

export interface FoodFlowEdge {
  id: string;
  donorId: string;
  receiverId: string;
  amount: number;
  timestamp: number;
}

export interface ColonyStatistics {
  population: number;
  foodStored: number;
  totalFoodHarvested: number;
  totalDeaths: number;
  totalBirths: number;
  activeForagers: number;
  nestDefenders: number;
  nurseryNurses: number;
  nestBuilders: number;
  roleDistribution: RoleDistribution;
  demands: ColonyNeedsVector;
  averageWorkerEnergy: number;
  averageWorkerHealth: number;
  colonyAgeSeconds: number;
  status: ColonyStatus;
  controlMode: ColonyControlMode;
  corpsesWaitingRemoval: number;
  nestChambersCount: number;
  nestIntegrity: number;
  buildingMaterial: number;
  surfaceSoilMound: number;
  recentFoodFlow: FoodFlowEdge[];
  activeMessagesInFlight: number;
  activeCollaborativeTasks: number;
}

export interface CorpseEntity {
  id: string;
  antId: string;
  position: Vector2D;
  cause: CauseOfDeath;
  timestamp: number;
  decay: number;
}

export interface DeceasedRecord {
  id: string;
  age: number;
  cause: CauseOfDeath;
  tripsCompleted: number;
  foodHarvested: number;
  timestamp: number;
}

export class Colony {
  public id: string;
  public name: string;
  public nest: NestStructure;
  public queen: Queen;
  public brood: BroodManager;
  public ants: Ant[] = [];
  public status: ColonyStatus = 'HEALTHY';
  public controlMode: ColonyControlMode = 'AUTONOMOUS';
  public roleManager: ColonyRoleManager = new ColonyRoleManager();

  // Distributed superorganism communication & cooperative task systems
  public communicationBus: ColonyCommunicationBus = new ColonyCommunicationBus();
  public collaborativeTasks: CollaborativeTaskManager = new CollaborativeTaskManager();
  public rewardEngine: AuthoritativeRewardEngine = AuthoritativeRewardEngine.getInstance();

  // Corpses and deceased archive
  public corpses: CorpseEntity[] = [];
  public deceasedHistory: DeceasedRecord[] = [];

  // Trophallaxis Food Flow Graph history
  public foodFlowHistory: FoodFlowEdge[] = [];
  public maxFoodFlowRecords: number = 30;

  // Statistics
  public totalFoodHarvested: number = 0;
  public totalDeaths: number = 0;
  public totalBirths: number = 0;
  private antIdCounter: number = 1;
  private creationTime: number;

  public get foodStore(): number {
    return this.nest.totalStoredFood;
  }

  public set foodStore(val: number) {
    // Deposit or adjust directly into primary food storage chamber
    const diff = val - this.nest.totalStoredFood;
    if (diff > 0) {
      this.nest.depositFoodInStorage(diff);
    } else if (diff < 0) {
      this.nest.retrieveFoodFromStorage(Math.abs(diff));
    }
  }

  constructor(id: string, name: string, nestEntrance: Vector2D = { x: 0, y: 0 }) {
    this.id = id;
    this.name = name;
    this.nest = new NestStructure(nestEntrance);
    this.queen = new Queen(id, { x: nestEntrance.x - 1.0, y: nestEntrance.y + 4.0 });
    this.brood = new BroodManager();
    this.creationTime = performance.now() / 1000;
  }

  public getColonyNeedsContext(): ColonyNeedsContext {
    const eggCount = this.brood.eggs;
    const larvaCount = this.brood.larvae;
    const pupaCount = this.brood.pupae;

    // Find any starving or distressed ant requesting help
    const distressed = this.ants.find((a) => a.internalState.state.helpRequested && a.internalState.state.isAlive);

    // Calculate total occupancy and capacity across all excavated chambers (main nest + subnests)
    const allChambers = this.nest.getAllChambers();
    const totalOccupancy = allChambers.reduce((sum, c) => sum + (c.isExcavated ? c.currentOccupancy : 0), 0);
    const totalCapacity = allChambers.reduce((sum, c) => sum + (c.isExcavated ? c.maxOccupancy : 0), 1);
    const occupancyRatio = Math.min(1.0, totalOccupancy / totalCapacity);

    const demands = this.roleManager.computeColonyDemands(
      this.ants.length,
      this.foodStore,
      eggCount,
      larvaCount,
      pupaCount,
      this.corpses.length,
      0,
      this.queen.energy,
      occupancyRatio,
      this.nest.structuralIntegrity,
      distressed ? 1 : 0,
      this.nest.buildingMaterial,
      this.controlMode
    );

    const nurseryChamber = this.nest.getChamberByType('BROOD_NURSERY') || this.nest.chambers[2];
    const queenChamber = this.nest.getChamberByType('QUEEN_CHAMBER') || this.nest.chambers[3];
    const foodStorageChamber = this.nest.getClosestFoodStorageChamber(this.nest.entrancePosition) || this.nest.chambers[1];

    // Check for unbuilt subnest first, then unexcavated core chamber
    const unbuiltSubnest = this.nest.subnests.find((s) => !s.isEstablished);
    const unexcavatedCoreChamber = this.nest.chambers.find((c) => !c.isExcavated);
    const buildingTargetPos = unbuiltSubnest
      ? { ...unbuiltSubnest.entrancePosition }
      : unexcavatedCoreChamber
      ? { ...unexcavatedCoreChamber.position }
      : undefined;

    return {
      ...demands,
      foodStore: this.foodStore,
      nestEntrance: { ...this.nest.entrancePosition },
      nestRadius: this.nest.entranceRadius,
      queenPosition: { ...queenChamber.position },
      nurseryPosition: { ...nurseryChamber.position },
      graveyardPosition: { x: this.nest.entrancePosition.x + 12.0, y: this.nest.entrancePosition.y - 10.0 },
      storageFoodChamberPosition: foodStorageChamber ? { ...foodStorageChamber.position } : undefined,
      buildingChamberPosition: buildingTargetPos,
      distressedAntPosition: distressed ? { ...distressed.body.position } : undefined,
      distressedAntId: distressed ? distressed.id : undefined,
      nestIntegrity: this.nest.structuralIntegrity,
    };
  }

  public spawnWorker(pos?: Vector2D, heading?: number, rng?: SeededRNG, eventBus?: SimulationEventBus, caste = 'WORKER', role: WorkerRole = 'FORAGER'): Ant {
    const p = pos || {
      x: this.nest.entrancePosition.x + (rng ? rng.range(-1.5, 1.5) : 0),
      y: this.nest.entrancePosition.y + (rng ? rng.range(-1.5, 1.5) : 0),
    };
    const h = heading !== undefined ? heading : (rng ? rng.range(0, Math.PI * 2) : 0);

    const antId = `A-${String(this.antIdCounter++).padStart(3, '0')}`;
    const ant = new Ant(antId, this.id, p, h, caste as any, {
      movementSpeed: rng ? rng.range(3.8, 4.6) : 4.2,
      turnSpeed: rng ? rng.range(4.8, 6.2) : 5.5,
      sensoryRange: rng ? rng.range(2.0, 2.5) : 2.2,
      energyEfficiency: rng ? rng.range(0.9, 1.1) : 1.0,
      explorationTendency: rng ? rng.range(0.8, 1.2) : 1.0,
      fearThreshold: rng ? rng.range(0.8, 1.2) : 1.0,
    }, undefined, role);

    this.ants.push(ant);
    this.totalBirths++;

    if (eventBus) {
      eventBus.emit({
        type: 'ANT_CREATED',
        timestamp: performance.now() / 1000,
        entityId: antId,
        colonyId: this.id,
        data: { id: antId, caste, role, position: { ...p } },
      });
    }

    return ant;
  }

  public update(
    dt: number,
    simTime: number,
    rng: SeededRNG,
    config?: SimulationConfig,
    eventBus?: SimulationEventBus,
    temperatureCelsius: number = 24.0,
    ledger?: { recordConsumption: (amt: number) => void; recordLost: (amt: number) => void; recordTrophallaxis: (d: string, r: string, a: number, dr: number, rr: number, t: number) => void },
    onDropFood?: (pos: Vector2D, amount: number) => void,
    foodClusters?: { position: Vector2D; amount: number }[]
  ): void {
    const cfg = config || SimulationConfig.instance;

    // 0. Update Distributed Superorganism Communication & Collaborative Tasks
    this.communicationBus.update(dt);

    const livingAntIds = new Set(this.ants.filter((a) => a.internalState.state.isAlive).map((a) => a.id));
    const antPositions = new Map(this.ants.map((a) => [a.id, a.body.position]));
    const coopRewards = this.collaborativeTasks.update(dt, simTime, livingAntIds, antPositions);
    for (const rew of coopRewards) {
      const applied = this.rewardEngine.emitReward(
        rew.antId,
        rew.eventType,
        rew.action,
        rew.result,
        rew.value,
        rew.reason,
        simTime,
        rew.taskId,
        rew.individualContribution,
        rew.teamSuccess,
        eventBus
      );
      if (applied) {
        const targetAnt = this.ants.find((a) => a.id === rew.antId);
        if (targetAnt) {
          targetAnt.neuromodulator.processReinforcementEvent(
            applied.value,
            0.0,
            0.95,
            applied.reason,
            simTime
          );
        }
      }
    }
    this.rewardEngine.cleanup(simTime);

    // Auto-seed collective heavy transport task when large food clusters exist
    if (foodClusters && foodClusters.length > 0 && this.collaborativeTasks.tasks.length === 0) {
      const heavyCluster = foodClusters.find((c) => c.amount >= 6.0);
      if (heavyCluster) {
        this.collaborativeTasks.createCollaborativeTask(
          'COLLECTIVE_HEAVY_TRANSPORT',
          heavyCluster.position,
          Math.min(4, Math.max(2, Math.floor(this.ants.length / 3))),
          heavyCluster.amount * 10,
          simTime,
          this.nest.entrancePosition
        );
      }
    }

    // 0.5 Check Autonomous Subnest Planning Triggers
    if (foodClusters && foodClusters.length > 0) {
      this.nest.checkSubnestTrigger(
        Math.floor(simTime * 60),
        simTime,
        this.ants.length,
        this.foodStore,
        foodClusters,
        eventBus,
        rng
      );
    }

    // 1. Update Queen metabolism and egg laying
    const { shouldLayEgg, foodConsumed: requestedQueenFood } = this.queen.update(dt, this.foodStore);
    if (requestedQueenFood > 0) {
      const { retrieved } = this.nest.retrieveFoodFromStorage(requestedQueenFood, this.queen.position);
      if (retrieved > 0 && ledger) {
        ledger.recordConsumption(retrieved);
      }
    }

    if (shouldLayEgg) {
      const nurseryChamber = this.nest.getChamberByType('BROOD_NURSERY') || this.nest.chambers[2];
      const eggPos = {
        x: nurseryChamber.position.x + rng.range(-1.0, 1.0),
        y: nurseryChamber.position.y + rng.range(-1.0, 1.0),
      };
      this.brood.spawnEgg(eggPos);
      if (eventBus) {
        eventBus.emit({
          type: 'QUEEN_LAID_EGG',
          timestamp: simTime,
          entityId: this.queen.id,
          colonyId: this.id,
          data: { position: eggPos },
        });
      }
    }

    // 2. Update Brood development with thermal kinetics
    const { emergedAdults, foodConsumed: requestedBroodFood } = this.brood.update(
      dt,
      this.foodStore,
      temperatureCelsius,
      eventBus,
      this.ants.length
    );
    if (requestedBroodFood > 0) {
      const nurseryChamber = this.nest.getChamberByType('BROOD_NURSERY') || this.nest.chambers[2];
      const { retrieved } = this.nest.retrieveFoodFromStorage(requestedBroodFood, nurseryChamber.position);
      if (retrieved > 0 && ledger) {
        ledger.recordConsumption(retrieved);
      }
    }

    // Spawn emerged adults
    for (const emerged of emergedAdults) {
      this.spawnWorker(
        emerged.position || this.nest.entrancePosition,
        rng.range(0, Math.PI * 2),
        rng,
        eventBus,
        emerged.caste
      );
    }

    // 3. Process worker updates, deaths, deliveries, and food retrievals
    for (let i = this.ants.length - 1; i >= 0; i--) {
      const ant = this.ants[i];
      if (!ant.internalState.state.isAlive) {
        const cause = ant.internalState.causeOfDeath || 'UNKNOWN';
        this.totalDeaths++;

        // Handle carried food upon death according to authoritative rule
        const carried = ant.internalState.dropFood();
        if (carried > 0) {
          const outcome = cfg?.food.deathResourceOutcome || 'FOOD_DROPS';
          if (outcome === 'FOOD_DROPS' && onDropFood) {
            onDropFood({ ...ant.body.position }, carried);
          } else if (ledger) {
            ledger.recordLost(carried);
          }
        }

        // Add to deceased archival history
        this.deceasedHistory.unshift({
          id: ant.id,
          age: ant.internalState.state.age,
          cause,
          tripsCompleted: ant.memory.totalTripsCompleted,
          foodHarvested: ant.memory.totalFoodHarvested,
          timestamp: simTime,
        });
        if (this.deceasedHistory.length > 100) {
          this.deceasedHistory.pop();
        }

        // Leave a corpse in the environment for sanitation processing
        this.corpses.push({
          id: `corpse-${ant.id}`,
          antId: ant.id,
          position: { ...ant.body.position },
          cause,
          timestamp: simTime,
          decay: 0,
        });

        if (eventBus) {
          eventBus.emit({
            type: 'ANT_DIED',
            timestamp: simTime,
            entityId: ant.id,
            colonyId: this.id,
            data: {
              id: ant.id,
              cause,
              position: { ...ant.body.position },
              age: ant.internalState.state.age,
            },
          });
        }

        this.ants.splice(i, 1);
        continue;
      }

      const closestNest = this.nest.getClosestNest(ant.body.position);
      const distToClosestNest = Math.hypot(
        ant.body.position.x - closestNest.position.x,
        ant.body.position.y - closestNest.position.y
      );

      // (A) Check if ant deposited food into closest nest/subnest storage chamber (Strict 1:1 conservation)
      if (distToClosestNest <= closestNest.radius + 0.8 && ant.internalState.state.carryingFoodAmount > 0) {
        const deposited = ant.internalState.dropFood();
        this.nest.depositFoodInStorage(deposited, ant.body.position); // Exact spatial storage deposit
        this.totalFoodHarvested += deposited;

        // Refuel worker strictly from colony storage
        const { retrieved } = this.nest.retrieveFoodFromStorage(Math.min(0.4, this.foodStore), ant.body.position);
        if (retrieved > 0) {
          ant.internalState.feed(retrieved);
          if (ledger) {
            ledger.recordConsumption(retrieved);
          }
        }

        ant.memory.totalTripsCompleted++;
        PheromoneDecisionEngine.onTaskCompleted(ant.pheromoneState);
        const delivReward = this.rewardEngine.emitReward(
          ant.id,
          'COMPLETION',
          'DEPOSIT_FOOD',
          'SUCCESS',
          8.0,
          'Delivered food cargo to colony storage chamber.',
          simTime,
          'RETURNING_TO_NEST',
          1.0,
          undefined,
          eventBus
        );
        if (delivReward) {
          ant.neuromodulator.processReinforcementEvent(
            delivReward.value,
            0.0,
            0.95,
            delivReward.reason,
            simTime
          );
        }
        ant.taskSystem.completeTask(simTime);
        ant.body.task = 'IDLE_REASSESS';

        if (eventBus) {
          eventBus.emit({
            type: 'FOOD_DELIVERED',
            timestamp: simTime,
            entityId: ant.id,
            colonyId: this.id,
            data: { amount: deposited, totalStore: this.foodStore, nestId: closestNest.id },
          });
          eventBus.emit({
            type: 'FOOD_STORED',
            timestamp: simTime,
            entityId: this.id,
            colonyId: this.id,
            data: { newStorageTotal: this.foodStore },
          });
        }
      }

      // (B) Check if hungry/starving worker reached closest food storage to retrieve nourishment
      if (
        (ant.body.task === 'RETRIEVE_FOOD_FROM_STORAGE' || ant.internalState.state.hunger > 0.6) &&
        distToClosestNest <= closestNest.radius + 1.2 &&
        this.foodStore > 0.1
      ) {
        const wantAmount = Math.min(1.0, 1.0 - ant.internalState.state.energyReserve);
        const { retrieved } = this.nest.retrieveFoodFromStorage(wantAmount, ant.body.position);
        if (retrieved > 0) {
          ant.internalState.feed(retrieved);
          ant.taskSystem.completeTask(simTime);
          ant.body.task = 'IDLE_REASSESS';
          if (ledger) {
            ledger.recordConsumption(retrieved);
          }
        }
      }

      // (C) Check if builder ant reached unexcavated chamber or subnest site to physically dig / collect material
      if (
        ant.body.task === 'EXCAVATE' ||
        ant.body.task === 'COLLECT_MATERIAL' ||
        ant.body.task === 'BUILDING' ||
        ant.body.task === 'BUILD' ||
        ant.roleState.primaryRole === 'BUILDER'
      ) {
        const unbuiltSubnest = this.nest.subnests.find((s) => !s.isEstablished);
        if (unbuiltSubnest) {
          const distToSub = Math.hypot(
            ant.body.position.x - unbuiltSubnest.entrancePosition.x,
            ant.body.position.y - unbuiltSubnest.entrancePosition.y
          );
          if (distToSub <= unbuiltSubnest.entranceRadius + 1.5) {
            const { isEstablished } = this.nest.advanceSubnestConstruction(unbuiltSubnest.id, dt * 1.0, simTime, eventBus);
            const soilProduced = dt * 0.4;
            ant.taskSystem.state.carryingMaterialAmount = soilProduced;
            ant.taskSystem.setTask('TRANSPORT_MATERIAL', simTime, 'NORMAL', 20.0);
            ant.body.task = 'TRANSPORT_MATERIAL';
            if (isEstablished) {
              ant.taskSystem.completeTask(simTime);
            }
          }
        } else {
          const targetChamber = this.nest.chambers.find((c) => !c.isExcavated);
          if (targetChamber) {
            const distToChamber = Math.hypot(
              ant.body.position.x - targetChamber.position.x,
              ant.body.position.y - targetChamber.position.y
            );
            if (distToChamber <= targetChamber.radius + 1.0) {
              const { soilProduced, isCompleted } = this.nest.excavateChamberAt(targetChamber.id, dt * 0.8, simTime, eventBus);
              if (soilProduced > 0) {
                ant.taskSystem.state.carryingMaterialAmount = soilProduced;
                ant.taskSystem.setTask('TRANSPORT_MATERIAL', simTime, 'NORMAL', 20.0);
                ant.body.task = 'TRANSPORT_MATERIAL';
              }
              if (isCompleted) {
                ant.taskSystem.completeTask(simTime);
              }
            }
          }
        }
      }

      // (D) Check if builder carrying material reached surface mound (main or subnest) to deposit soil
      if (
        (ant.body.task === 'TRANSPORT_MATERIAL' || ant.body.task === 'BUILDING') &&
        ant.taskSystem.state.carryingMaterialAmount > 0
      ) {
        if (distToClosestNest <= closestNest.radius + 1.2) {
          this.nest.depositExcavatedSoilOnMound(ant.taskSystem.state.carryingMaterialAmount);
          ant.taskSystem.state.carryingMaterialAmount = 0;
          ant.taskSystem.completeTask(simTime);
          ant.body.task = 'IDLE_REASSESS';
        }
      }
    }

    // 4. Stomodeal Trophallaxis: Direct social resource transfer between compatible nestmates
    if (cfg && this.ants.length > 1) {
      const transferRadius = cfg.food.socialTransferRadius;
      const hungerThresh = cfg.food.socialTransferHungerThreshold;
      const maxTransfer = cfg.food.socialTransferMaxAmount;

      for (let i = 0; i < this.ants.length; i++) {
        const donor = this.ants[i];
        if (donor.internalState.state.carryingFoodAmount <= 0.2) continue;

        for (let j = 0; j < this.ants.length; j++) {
          if (i === j) continue;
          const receiver = this.ants[j];
          if (receiver.internalState.state.hunger < hungerThresh && !receiver.internalState.state.helpRequested) continue;
          if (receiver.internalState.state.carryingFoodAmount >= cfg.food.carryCapacity) continue;

          const dx = receiver.body.position.x - donor.body.position.x;
          const dy = receiver.body.position.y - donor.body.position.y;
          if (dx * dx + dy * dy <= transferRadius * transferRadius) {
            const transferred = donor.internalState.transferFoodTo(receiver.internalState, maxTransfer);
            if (transferred > 0) {
              const edge: FoodFlowEdge = {
                id: `flow-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                donorId: donor.id,
                receiverId: receiver.id,
                amount: transferred,
                timestamp: simTime,
              };
              this.foodFlowHistory.unshift(edge);
              if (this.foodFlowHistory.length > this.maxFoodFlowRecords) {
                this.foodFlowHistory.pop();
              }

              if (ledger) {
                ledger.recordTrophallaxis(
                  donor.id,
                  receiver.id,
                  transferred,
                  donor.internalState.state.carryingFoodAmount,
                  receiver.internalState.state.carryingFoodAmount,
                  simTime
                );
              }
              if (eventBus) {
                eventBus.emit({
                  type: 'FOOD_TRANSFER_COMPLETED',
                  timestamp: simTime,
                  entityId: donor.id,
                  colonyId: this.id,
                  data: {
                    donorId: donor.id,
                    receiverId: receiver.id,
                    amount: transferred,
                    donorRemaining: donor.internalState.state.carryingFoodAmount,
                    receiverTotal: receiver.internalState.state.carryingFoodAmount,
                  },
                });
              }
              break;
            }
          }
        }
      }
    }

    // 5. Dynamic Role Reallocation across Workers
    const demands = this.getColonyNeedsContext();
    this.roleManager.updateRoleAllocations(this.ants, dt, demands, rng, this.controlMode);

    // 6. Update Corpse decay and sanitation
    for (let c = this.corpses.length - 1; c >= 0; c--) {
      this.corpses[c].decay += dt * 0.01;
      if (this.corpses[c].decay >= 1.0) {
        this.corpses.splice(c, 1);
      }
    }

    // 7. Evaluate Colony Status (Crisis detection)
    this.updateColonyStatus(simTime, config, eventBus);
  }

  private updateColonyStatus(simTime: number, config?: SimulationConfig, eventBus?: SimulationEventBus): void {
    const prevStatus = this.status;
    const cfg = config || SimulationConfig.instance;
    const crisisFood = cfg ? cfg.colony.crisisThresholdFood : 10.0;
    const starvFood = cfg ? cfg.colony.starvationThresholdFood : 2.0;

    if (this.ants.length === 0) {
      this.status = 'COLLAPSING';
    } else if (this.foodStore < starvFood && this.ants.length < 5) {
      this.status = 'CRITICAL';
    } else if (this.foodStore < crisisFood) {
      this.status = 'STRESSED';
    } else if (prevStatus === 'STRESSED' || prevStatus === 'CRITICAL') {
      this.status = 'RECOVERING';
    } else {
      this.status = 'HEALTHY';
    }

    if (this.status !== prevStatus && eventBus) {
      eventBus.emit({
        type: 'COLONY_CRISIS',
        timestamp: simTime,
        colonyId: this.id,
        data: {
          previousStatus: prevStatus,
          currentStatus: this.status,
          population: this.ants.length,
          foodStore: this.foodStore,
        },
      });
    }
  }

  public removeAnt(antId: string, eventBus?: SimulationEventBus, ledger?: { recordLost: (amt: number) => void }): boolean {
    const idx = this.ants.findIndex((a) => a.id === antId);
    if (idx === -1) return false;

    const ant = this.ants[idx];
    ant.taskSystem.invalidateTarget();
    const carried = ant.internalState.dropFood();
    if (carried > 0 && ledger) {
      ledger.recordLost(carried);
    }
    this.ants.splice(idx, 1);

    if (eventBus) {
      eventBus.emit({
        type: 'ANT_REMOVED_BY_USER' as any,
        timestamp: performance.now() / 1000,
        entityId: antId,
        colonyId: this.id,
        data: { antId, caste: ant.body.caste, role: ant.roleState.primaryRole },
      });
    }
    return true;
  }

  public removeAntsByRole(role: WorkerRole, eventBus?: SimulationEventBus, ledger?: { recordLost: (amt: number) => void }): number {
    let removed = 0;
    for (let i = this.ants.length - 1; i >= 0; i--) {
      if (this.ants[i].roleState.primaryRole === role && this.ants[i].body.caste !== 'QUEEN') {
        const id = this.ants[i].id;
        this.ants[i].taskSystem.invalidateTarget();
        const carried = this.ants[i].internalState.dropFood();
        if (carried > 0 && ledger) {
          ledger.recordLost(carried);
        }
        this.ants.splice(i, 1);
        removed++;
        if (eventBus) {
          eventBus.emit({
            type: 'ANT_REMOVED_BY_USER' as any,
            timestamp: performance.now() / 1000,
            entityId: id,
            colonyId: this.id,
            data: { antId: id, role },
          });
        }
      }
    }
    return removed;
  }

  public removeAllNonQueen(eventBus?: SimulationEventBus, ledger?: { recordLost: (amt: number) => void }): number {
    let removed = 0;
    for (let i = this.ants.length - 1; i >= 0; i--) {
      if (this.ants[i].body.caste !== 'QUEEN') {
        const id = this.ants[i].id;
        this.ants[i].taskSystem.invalidateTarget();
        const carried = this.ants[i].internalState.dropFood();
        if (carried > 0 && ledger) {
          ledger.recordLost(carried);
        }
        this.ants.splice(i, 1);
        removed++;
        if (eventBus) {
          eventBus.emit({
            type: 'ANT_REMOVED_BY_USER' as any,
            timestamp: performance.now() / 1000,
            entityId: id,
            colonyId: this.id,
            data: { antId: id },
          });
        }
      }
    }
    return removed;
  }

  public removeRandomAnts(count: number, rng: SeededRNG, eventBus?: SimulationEventBus, ledger?: { recordLost: (amt: number) => void }): number {
    const nonQueens = this.ants.filter((a) => a.body.caste !== 'QUEEN');
    const toRemove = Math.min(count, nonQueens.length);
    let removed = 0;

    for (let k = 0; k < toRemove; k++) {
      const idx = rng.int(0, this.ants.length - 1);
      if (this.ants[idx] && this.ants[idx].body.caste !== 'QUEEN') {
        const id = this.ants[idx].id;
        this.ants[idx].taskSystem.invalidateTarget();
        const carried = this.ants[idx].internalState.dropFood();
        if (carried > 0 && ledger) {
          ledger.recordLost(carried);
        }
        this.ants.splice(idx, 1);
        removed++;
        if (eventBus) {
          eventBus.emit({
            type: 'ANT_REMOVED_BY_USER' as any,
            timestamp: performance.now() / 1000,
            entityId: id,
            colonyId: this.id,
            data: { antId: id },
          });
        }
      }
    }
    return removed;
  }

  public getStatistics(simTime: number): ColonyStatistics {
    const liveAnts = this.ants;
    const totalCount = liveAnts.length;

    let totalEnergy = 0;
    let totalHealth = 0;
    let foragers = 0;
    let defenders = 0;
    let nurses = 0;
    let builders = 0;

    for (let i = 0; i < totalCount; i++) {
      const a = liveAnts[i];
      totalEnergy += a.internalState.energy;
      totalHealth += a.internalState.health;

      if (a.roleState.primaryRole === 'FORAGER' || a.body.task === 'FORAGING' || a.body.task === 'COLLECTING_FOOD' || a.body.task === 'RETURNING_TO_NEST') {
        foragers++;
      } else if (a.roleState.primaryRole === 'GUARD' || a.body.task === 'DEFENDING' || a.body.task === 'FLEEING') {
        defenders++;
      } else if (a.roleState.primaryRole === 'NURSE' || a.body.task === 'FEEDING_BROOD' || a.body.task === 'ATTENDING_QUEEN') {
        nurses++;
      } else if (a.roleState.primaryRole === 'BUILDER' || a.body.task === 'BUILD_CHAMBER' || a.body.task === 'EXCAVATE' || a.body.task === 'TRANSPORT_MATERIAL') {
        builders++;
      }
    }

    const roleDistribution = this.roleManager.getRoleCounts(liveAnts);
    const demandsContext = this.getColonyNeedsContext();

    return {
      population: totalCount,
      foodStored: this.foodStore,
      totalFoodHarvested: this.totalFoodHarvested,
      totalDeaths: this.totalDeaths,
      totalBirths: this.totalBirths,
      activeForagers: foragers,
      nestDefenders: defenders,
      nurseryNurses: nurses,
      nestBuilders: builders,
      roleDistribution,
      demands: {
        foodNeed: demandsContext.foodNeed,
        waterNeed: demandsContext.waterNeed,
        broodNeed: demandsContext.broodNeed,
        queenNeed: demandsContext.queenNeed,
        nestNeed: demandsContext.nestNeed,
        defenseNeed: demandsContext.defenseNeed,
        sanitationNeed: demandsContext.sanitationNeed,
        socialCareNeed: demandsContext.socialCareNeed,
        explorationNeed: demandsContext.explorationNeed,
        reserveNeed: demandsContext.reserveNeed,
      },
      averageWorkerEnergy: totalCount > 0 ? totalEnergy / totalCount : 0,
      averageWorkerHealth: totalCount > 0 ? totalHealth / totalCount : 0,
      colonyAgeSeconds: Math.max(0, simTime - this.creationTime),
      status: this.status,
      controlMode: this.controlMode,
      corpsesWaitingRemoval: this.corpses.length,
      nestChambersCount: this.nest.chambers.length,
      nestIntegrity: this.nest.structuralIntegrity,
      buildingMaterial: this.nest.buildingMaterial,
      surfaceSoilMound: this.nest.surfaceSoilMound,
      recentFoodFlow: [...this.foodFlowHistory],
      activeMessagesInFlight: this.communicationBus.stats.activeInFlightMessages,
      activeCollaborativeTasks: this.collaborativeTasks.tasks.length,
    };
  }
}
