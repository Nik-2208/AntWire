/**
 * ANT BRAIN — Simulation World Container
 * Master authoritative deterministic simulation state holding all entities, physics, chemistry, and ecology.
 */

import { SeededRNG } from './rng';
import { SimulationClock } from './clock';
import { Environment } from './environment';
import { PheromoneField } from '../pheromones/field';
import { SpatialHashGrid } from './spatial';
import { FoodEntity, ObstacleEntity, PredatorType, Vector2D } from './types';
import { Colony } from '../colony/colony';
import { Predator } from '../predators/predator';
import { PredatorManager } from '../predators/predator_manager';
import { EcologicalInteractionManager } from '../ecology/symbiosis';
import { Ant } from '../ants/ant';
import { SimulationConfig } from './config';
import { SimulationEventBus } from './events';
import { ColonyFoodLedger } from './food_ledger';
import { TrajectoryLogger } from '../learning/trajectory_logger';
import { CollectiveStructureManager } from './collective_structures';
import { BehavioralSanityChecker } from './behavioral_sanity_checker';

export interface WorldConfig {
  seed: number;
  width: number;
  height: number;
  initialAntCount: number;
  foodClusterCount: number;
  obstacleCount: number;
  predatorCount: number;
}

export interface SimulationEventLog {
  id: string;
  timestamp: number;
  type: string;
  message: string;
  entityId?: string;
  position?: Vector2D;
}

export type SimulationEvent = SimulationEventLog;

export class SimulationWorld {
  public config: WorldConfig;
  public simConfig: SimulationConfig;
  public eventBus: SimulationEventBus;
  public rng: SeededRNG;
  public clock: SimulationClock;
  public environment: Environment;
  public pheromones: PheromoneField;
  public spatialGrid: SpatialHashGrid<unknown>;

  public colonies: Colony[] = [];
  public foodEntities: FoodEntity[] = [];
  public obstacles: ObstacleEntity[] = [];
  public predatorManager: PredatorManager;
  public ecology: EcologicalInteractionManager;
  public collectiveStructures: CollectiveStructureManager = new CollectiveStructureManager();
  public foodLedger: ColonyFoodLedger = new ColonyFoodLedger();
  public trajectoryLogger: TrajectoryLogger = new TrajectoryLogger();
  public sanityChecker: BehavioralSanityChecker = new BehavioralSanityChecker();

  // Telemetry event logs
  public eventLogs: SimulationEventLog[] = [];
  public maxEventLogs: number = 100;
  private nextFoodId: number = 1;
  private nextObstacleId: number = 1;

  constructor(config?: Partial<WorldConfig>) {
    this.config = {
      seed: 42,
      width: 70.0,
      height: 70.0,
      initialAntCount: 12, // Default lively colony population
      foodClusterCount: 3,
      obstacleCount: 4,
      predatorCount: 0,
      ...config,
    };

    this.simConfig = SimulationConfig.instance || new SimulationConfig();
    this.eventBus = SimulationEventBus.instance;
    this.rng = new SeededRNG(this.config.seed);
    this.clock = new SimulationClock(1 / 60);
    this.environment = new Environment();
    this.pheromones = new PheromoneField({
      worldWidth: this.config.width,
      worldHeight: this.config.height,
      resolution: 120,
    });
    this.spatialGrid = new SpatialHashGrid(4.0);
    this.predatorManager = new PredatorManager();
    this.ecology = new EcologicalInteractionManager();

    this.setupEventLogging();
    this.initializeWorld();
  }

  public get predators(): Predator[] {
    return this.predatorManager.predators;
  }

  public set predators(preds: Predator[]) {
    this.predatorManager.predators = preds;
  }

  private setupEventLogging(): void {
    this.eventBus.subscribe((evt) => {
      let msg = `${evt.type}`;
      if (evt.type === 'ANT_DIED') {
        msg = `Ant ${evt.entityId} died (${evt.data?.cause})`;
      } else if (evt.type === 'PREDATOR_SPAWNED') {
        msg = `Predator ${evt.entityId} spawned (${evt.data?.profile})`;
      } else if (evt.type === 'PREDATOR_ATTACK') {
        msg = `Predator ${evt.entityId} attacked Ant ${evt.data?.targetAntId}`;
      } else if (evt.type === 'FOOD_COLLECTED') {
        msg = `Food collected by Ant ${evt.entityId}`;
      } else if (evt.type === 'FOOD_DELIVERED') {
        msg = `Food delivered to nest: +${(evt.data?.amount as number)?.toFixed(1)} units`;
      } else if (evt.type === 'QUEEN_LAID_EGG') {
        msg = `Queen oviposition: new egg laid`;
      } else if (evt.type === 'ADULT_EMERGED') {
        msg = `New adult worker emerged from pupa`;
      } else if (evt.type === 'PARAMETER_CHANGED') {
        msg = `Parameter modified: ${evt.data?.parameter} = ${evt.data?.newValue}`;
      }

      this.logEvent(evt.type, msg, evt.entityId, (evt.data?.position as Vector2D) || undefined);
    });
  }

  public initializeWorld(): void {
    this.foodEntities = [];
    this.obstacles = [];
    this.predatorManager.clear();
    this.colonies = [];
    this.pheromones.clear();
    this.eventLogs = [];
    this.spatialGrid.clear();
    this.ecology.initDefaultEcosystem();
    this.foodLedger.reset();

    // 1. Create primary Colony Alpha centered at (0, 0)
    const colony = new Colony('colony-alpha', 'Formica Experimental Colony', { x: 0, y: 0 });
    this.colonies.push(colony);
    this.foodLedger.registerSpawn(colony.foodStore);

    // 2. Spawn structured functional starter colony: 1 Nurse, 2-3 Builders, remainder Foragers/Workers
    const totalStarterAnts = this.config.initialAntCount;
    if (totalStarterAnts > 0) {
      const starterRoles: ('NURSE' | 'BUILDER' | 'FORAGER')[] = [
        'NURSE',
        'BUILDER',
        'BUILDER',
        'BUILDER',
      ];
      while (starterRoles.length < totalStarterAnts) {
        starterRoles.push('FORAGER');
      }

      for (let i = 0; i < totalStarterAnts; i++) {
        const assignedRole = starterRoles[i];
        const spawnPos = assignedRole === 'NURSE'
          ? { x: colony.nest.entrancePosition.x - 1.0, y: colony.nest.entrancePosition.y + 2.0 }
          : colony.nest.entrancePosition;

        colony.spawnWorker(
          spawnPos,
          this.rng.range(0, Math.PI * 2),
          this.rng,
          this.eventBus,
          'WORKER',
          assignedRole
        );
      }
    }

    // 3. Spawn natural food clusters
    for (let i = 0; i < this.config.foodClusterCount; i++) {
      const angle = this.rng.range(0, Math.PI * 2);
      const dist = this.rng.range(12.0, 26.0);
      this.placeFoodCluster(
        {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist,
        },
        this.rng.int(40, 90),
        2.2
      );
    }

    // 4. Spawn natural rock obstacles
    for (let i = 0; i < this.config.obstacleCount; i++) {
      const angle = this.rng.range(0, Math.PI * 2);
      const dist = this.rng.range(7.0, 28.0);
      this.placeObstacle(
        {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist,
        },
        this.rng.range(1.4, 3.2)
      );
    }

    // 5. Spawn predators if configured
    for (let i = 0; i < this.config.predatorCount; i++) {
      this.predatorManager.spawnRandomPredator(this.rng, this.config.width * 0.5, this.config.height * 0.5, undefined, this.eventBus);
    }

    this.logEvent('COLONY_CREATED', `Digital Ant Colony initialized with Seed ${this.config.seed}`);
  }

  public placeFoodCluster(center: Vector2D, totalAmount = 60, radius = 2.0): FoodEntity {
    const food: FoodEntity = {
      id: `food-${this.nextFoodId++}`,
      position: { ...center },
      amount: totalAmount,
      initialAmount: totalAmount,
      radius: radius,
      color: '#10b981', // Emerald sugar crystal
      resourceType: 'SUGAR_CRYSTAL',
      energyDensity: 1.0,
    };
    this.foodEntities.push(food);
    this.foodLedger.registerSpawn(totalAmount);
    this.eventBus.emit({
      type: 'FOOD_DISCOVERED',
      timestamp: this.clock.simTime,
      entityId: food.id,
      data: { position: center, amount: totalAmount },
    });
    return food;
  }

  /**
   * Spawn a dropped food parcel in the world upon ant mortality or worker release.
   * Does NOT count as new biological spawn because the resource was already accounted for.
   */
  public dropFoodEntity(pos: Vector2D, amount: number): FoodEntity {
    const food: FoodEntity = {
      id: `dropped-food-${this.nextFoodId++}`,
      position: { ...pos },
      amount,
      initialAmount: amount,
      radius: Math.max(0.6, Math.min(1.6, Math.sqrt(amount) * 0.45)),
      color: '#34d399',
      resourceType: 'SUGAR_CRYSTAL',
      energyDensity: 1.0,
    };
    this.foodEntities.push(food);
    this.eventBus.emit({
      type: 'FOOD_DISCOVERED',
      timestamp: this.clock.simTime,
      entityId: food.id,
      data: { position: pos, amount, dropped: true },
    });
    return food;
  }

  public placeObstacle(pos: Vector2D, radius = 2.0, height = 2.0): ObstacleEntity {
    const obs: ObstacleEntity = {
      id: `obstacle-${this.nextObstacleId++}`,
      position: { ...pos },
      radius,
      height,
    };
    this.obstacles.push(obs);
    return obs;
  }

  public spawnPredator(pos: Vector2D, type: PredatorType = 'GROUND_BEETLE'): Predator {
    return this.predatorManager.spawnPredator(pos, type, this.rng.range(0, Math.PI * 2), this.eventBus);
  }

  public removePredator(id: string): boolean {
    return this.predatorManager.removePredator(id, this.eventBus);
  }

  public logEvent(type: string, message: string, entityId?: string, position?: Vector2D): void {
    const evt: SimulationEventLog = {
      id: `${this.clock.tickCount}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: this.clock.simTime,
      type,
      message,
      entityId,
      position,
    };
    this.eventLogs.unshift(evt);
    if (this.eventLogs.length > this.maxEventLogs) {
      this.eventLogs.pop();
    }
  }

  /**
   * Main deterministic simulation step (fixed 1/60s dt)
   */
  public tick(): void {
    const dt = this.clock.fixedDt;
    const simTime = this.clock.simTime;
    const tick = this.clock.tickCount;
    const halfW = this.config.width * 0.5;
    const halfH = this.config.height * 0.5;

    // 1. Sync live configuration to systems
    this.pheromones.config.decayRates[0] = this.simConfig.pheromones.foodTrailDecay;
    this.pheromones.config.decayRates[1] = this.simConfig.pheromones.homeTrailDecay;
    this.pheromones.config.decayRates[2] = this.simConfig.pheromones.alarmTrailDecay;
    this.pheromones.config.diffusionRates[0] = this.simConfig.pheromones.diffusionRate;
    this.environment.config.temperatureCelsius = this.simConfig.environment.temperatureCelsius;

    // 2. Update Environment (Atmosphere, Diurnal cycle, Temperature)
    this.environment.update(dt, simTime);

    // 3. Update Pheromone Field (Evaporation & Laplacian Diffusion)
    this.pheromones.update(dt);

    // 4. Collect all live ants across colonies
    const allAnts: Ant[] = [];
    for (let c = 0; c < this.colonies.length; c++) {
      allAnts.push(...this.colonies[c].ants);
    }

    const predatorStates = this.predators.map((p) => p.state);

    // 5. Update individual ants
    for (let c = 0; c < this.colonies.length; c++) {
      const colony = this.colonies[c];
      const nestEnt = colony.nest.entrancePosition;
      const nestRad = colony.nest.entranceRadius;
      const colonyNeeds = colony.getColonyNeedsContext();

      for (let i = 0; i < colony.ants.length; i++) {
        const ant = colony.ants[i];
        try {
          ant.update(
            dt,
            simTime,
            tick,
            this.pheromones,
            this.foodEntities,
            nestEnt,
            nestRad,
            this.obstacles,
            predatorStates,
            colony.ants.map((a) => a.body),
            this.rng,
            halfW,
            halfH,
            this.simConfig,
            this.eventBus,
            colonyNeeds,
            colony.communicationBus,
            colony.collaborativeTasks
          );
        } catch (err: any) {
          console.warn(`[SimulationWorld] Isolated ant ${ant.id} update recovery:`, err?.message || err);
          // Safe recovery: keep ant alive with zero velocity for next tick
          ant.body.speed = 0;
          ant.body.isMoving = false;
        }
      }

      // Record representative ant state transitions for trajectory dataset logging (every 10 ticks)
      if (tick % 10 === 0 && colony.ants && colony.ants.length > 0) {
        const sampleLimit = Math.min(6, colony.ants.length);
        for (let i = 0; i < sampleLimit; i++) {
          const ant = colony.ants[i];
          if (!ant || !ant.body) continue;
          const snap = ant.sensors?.lastSnapshot;
          const istate = ant.internalState?.state;
          const drives = ant.drives?.currentDrives;
          const hasFood = (ant.internalState ? ant.internalState.isCarryingFood : false) || ((ant.body as any).hasFood ?? false);

          this.trajectoryLogger.recordStep({
            step: tick,
            timestamp: simTime,
            antId: ant.id,
            species: (colony as any).species || 'Formica_experimenta_v1',
            role: ant.roleState?.primaryRole || (ant as any).role || 'FORAGER',
            observation: {
              antennaeLeft: { food: snap?.foodLeft ?? 0, pheromone: snap?.homeLeft ?? 0, alarm: snap?.alarmLeft ?? 0 },
              antennaeRight: { food: snap?.foodRight ?? 0, pheromone: snap?.homeRight ?? 0, alarm: snap?.alarmRight ?? 0 },
              headingOdometer: { x: ant.body.position.x, y: ant.body.position.y, distance: ant.body.speed },
              nearbyThreats: snap?.predatorProximity ?? 0,
              nearbyNestmates: 0,
              isCarryingFood: hasFood,
            },
            internalState: {
              energy: istate?.energy ?? 1.0,
              hunger: istate?.hunger ?? 0.0,
              health: istate?.health ?? 1.0,
              threatArousal: drives?.threatAvoidance ?? 0.0,
            },
            drives: {
              food: drives?.foodSeeking ?? 0.5,
              homing: drives?.homing ?? 0.0,
              explore: drives?.exploration ?? 0.5,
              threatAvoidance: drives?.threatAvoidance ?? 0.0,
            },
            decision: {
              actionType: ant.lastAction?.type || (ant as any).currentAction?.type || 'IDLE',
              targetSpeed: ant.body.speed,
              turnRate: 0,
              chosenActionScore: 1.0,
              candidateScores: {},
              explanation: (ant.lastAction as any)?.description || (ant as any).currentAction?.description || 'Active computational action',
            },
            reward: {
              total: hasFood ? 1.0 : 0.05,
              foodAcquired: hasFood ? 1.0 : 0.0,
              foodDelivered: 0,
              energyPreserved: (istate?.energy ?? 1.0) > 0.5 ? 0.1 : 0,
              safeReturn: 0,
              dangerPenalty: 0,
              starvationPenalty: (istate?.hunger ?? 0) > 0.8 ? -0.5 : 0,
            },
            position: { ...ant.body.position },
            heading: ant.body.heading,
            isTerminal: istate ? istate.health <= 0 : false,
          });
        }
      }

      // Update colony superorganism dynamics (Queen, Brood, Food Storage, Subnests, Corpses)
      colony.update(
        dt,
        simTime,
        this.rng,
        this.simConfig,
        this.eventBus,
        this.environment.config.temperatureCelsius,
        this.foodLedger,
        (pos, amt) => this.dropFoodEntity(pos, amt),
        this.foodEntities.map((f) => ({ position: f.position, amount: f.amount }))
      );
    }

    // 6. Update Predators
    this.predatorManager.update(dt, allAnts, this.rng, halfW, halfH, this.simConfig, this.eventBus);

    // 7. Update Ecological Interactions (Aphid mutualism, Fungus agriculture) & Living Bridges
    this.ecology.update(dt, allAnts, this.rng, this.eventBus, this.foodLedger);
    this.collectiveStructures.tick(dt, simTime);

    // 8. Prune depleted food entities & notify targeting ants
    for (let f = this.foodEntities.length - 1; f >= 0; f--) {
      const food = this.foodEntities[f];
      if (food.amount <= 0.01) {
        this.eventBus.emit({
          type: 'FOOD_COLLECTED',
          timestamp: simTime,
          entityId: food.id,
          data: { id: food.id, depleted: true },
        });

        // Invalidate target for any ant currently tracking this depleted resource
        for (const ant of allAnts) {
          if (ant.taskSystem.state.targetId === food.id) {
            ant.taskSystem.invalidateTarget();
            if (ant.internalState.state.carryingFoodAmount > 0) {
              ant.taskSystem.setTask('RETURNING_TO_NEST', simTime, 'HIGH', 30.0);
            } else {
              ant.taskSystem.setTask('EXPLORING', simTime, 'LOW', 15.0);
            }
          }
        }

        this.foodEntities.splice(f, 1);
      }
    }

    // 9. Compute authoritative closed-system resource conservation balance
    const foodRemainingWorld = this.foodEntities.reduce((sum, f) => sum + f.amount, 0);
    const foodCarried = allAnts.reduce((sum, a) => sum + a.internalState.state.carryingFoodAmount, 0);
    const foodStored = this.colonies.reduce((sum, c) => sum + c.foodStore, 0);
    this.foodLedger.computeBalance(foodRemainingWorld, foodCarried, foodStored, simTime);

    // 9.5 Run authoritative behavioral sanity checks (explosions, circling, reward farming)
    this.sanityChecker.checkSimulationState(allAnts, this.pheromones, simTime, dt, this.eventBus);

    // 10. Advance simulation clock
    this.clock.stepOnce();
  }

  /**
   * Reset simulation with a specific seed
   */
  public reset(newSeed?: number): void {
    if (newSeed !== undefined) {
      this.config.seed = newSeed;
    }
    this.rng = new SeededRNG(this.config.seed);
    this.clock.reset();
    this.sanityChecker.reset();
    this.initializeWorld();
  }

  public getAntById(id: string): Ant | null {
    for (const c of this.colonies) {
      const found = c.ants.find((a) => a.id === id);
      if (found) return found;
    }
    return null;
  }
}
