/**
 * ANTWIRE — Standardized Task Environment Adapter & MDP Interface
 * Created & Developed by Nikhilesh H. Chavda
 *
 * Developer Extensibility Interface:
 * Standardizes the canonical Reinforcement Learning and Agent-Environment interaction loop:
 *   `observe → act → reward → next observation → done`
 *
 * Enables developers worldwide to create custom task environments (foraging, navigation,
 * keyboard control, heavy transport, nest construction, perimeter defense, multi-agent cooperation,
 * or custom synthetic benchmarks) without modifying the core nervous system or ant runtime.
 */

import { Ant } from '../ants/ant';
import { AntAction, AntSensorySnapshot, Vector2D } from '../simulation/types';
import { ActionFactory } from '../ants/actions';
import { SimulationWorld } from '../simulation/world';

export interface TaskObservation {
  /** Normalized continuous sensory vector [-1, 1] */
  features: number[];
  /** Named observation channels for debugging and inspection */
  namedFeatures?: Record<string, number>;
  /** Timestep within current episode */
  timestep: number;
  /** Whether the episode reached a terminal state */
  done: boolean;
  /** Optional domain-specific metadata */
  metadata?: Record<string, any>;
}

export interface TaskAction {
  /** Primary action type */
  type: 'MOVE' | 'TURN' | 'COLLECT' | 'DEPOSIT' | 'INTERACT' | 'CUSTOM';
  /** Continuous motor controls: [throttle (0..1), steeringAngle (-PI..PI)] */
  continuousValues: [number, number];
  /** Discrete action index (if using discrete action spaces) */
  discreteIndex?: number;
  /** Optional metadata passed to simulation actuators */
  metadata?: Record<string, any>;
}

export interface TaskStepResult {
  /** Next observation state */
  observation: TaskObservation;
  /** Scalar reward signal for reinforcement learning */
  reward: number;
  /** Whether the episode has terminated */
  done: boolean;
  /** Diagnostic telemetry and task-specific metrics */
  info: {
    episodeStep: number;
    cumulativeReward: number;
    taskCompleted: boolean;
    taskName: string;
    metrics: Record<string, number>;
  };
}

export interface TaskEnvironmentConfig {
  taskId: string;
  name: string;
  category:
    | 'FORAGING'
    | 'EXPLORATION'
    | 'NAVIGATION'
    | 'KEYBOARD'
    | 'TRANSPORT'
    | 'CONSTRUCTION'
    | 'DEFENSE'
    | 'COOPERATION'
    | 'CUSTOM';
  observationDim: number;
  actionDim: number;
  maxEpisodeSteps: number;
  rewardDescription: string;
  author?: string;
  version?: string;
}

/**
 * Abstract Base Class for developer-defined AntWire Task Environments.
 * Implement `reset()`, `step()`, and `extractObservation()` to create a new task.
 */
export abstract class BaseTaskEnvironment {
  public readonly config: TaskEnvironmentConfig;
  protected currentStep: number = 0;
  protected cumulativeReward: number = 0;
  protected isEpisodeActive: boolean = false;

  constructor(config: TaskEnvironmentConfig) {
    this.config = config;
  }

  /**
   * Reset environment to initial state and return initial observation.
   */
  public abstract reset(world?: SimulationWorld, ant?: Ant): TaskObservation;

  /**
   * Execute an action, advance the environment by one step, and return step result.
   */
  public abstract step(action: TaskAction, world?: SimulationWorld, ant?: Ant): TaskStepResult;

  /**
   * Convert an authoritative Ant sensory snapshot into standardized TaskObservation.
   */
  public abstract extractObservation(ant: Ant, sensors: AntSensorySnapshot): TaskObservation;

  /**
   * Convert TaskAction into authoritative AntAction.
   */
  public mapActionToAntAction(action: TaskAction): AntAction {
    const [throttle, turnAngle] = action.continuousValues;
    return ActionFactory.move(Math.max(0, Math.min(1, throttle)), turnAngle);
  }

  public getStepCount(): number {
    return this.currentStep;
  }

  public getCumulativeReward(): number {
    return this.cumulativeReward;
  }

  public isDone(): boolean {
    return !this.isEpisodeActive || this.currentStep >= this.config.maxEpisodeSteps;
  }
}

/**
 * 1. Standard Foraging Task Environment
 * Reward: Finding and harvesting food crystals while minimizing energy expenditure.
 */
export class ForagingTaskEnvironment extends BaseTaskEnvironment {
  private targetFoodId: string | null = null;

  constructor() {
    super({
      taskId: 'env-foraging-v1',
      name: 'Resource Foraging & Food Patch Discovery',
      category: 'FORAGING',
      observationDim: 14,
      actionDim: 2,
      maxEpisodeSteps: 500,
      rewardDescription: '+10.0 for food discovery/collection, +15.0 for nest delivery, -0.01 per step energy cost.',
      author: 'Nikhilesh H. Chavda',
      version: '1.0.0',
    });
  }

  public reset(world?: SimulationWorld, ant?: Ant): TaskObservation {
    this.currentStep = 0;
    this.cumulativeReward = 0;
    this.isEpisodeActive = true;
    this.targetFoodId = null;

    if (ant && world) {
      ant.internalState.state.energyReserve = 1.0;
      ant.internalState.state.energy = 1.0;
      ant.internalState.state.hunger = 0.05;
      ant.internalState.state.carryingFoodAmount = 0;
    }

    return this.extractObservation(
      ant || ({ body: { position: { x: 0, y: 0 } }, internalState: { state: {} } } as any),
      ant?.sensors.lastSnapshot || ({} as any)
    );
  }

  public step(action: TaskAction, world?: SimulationWorld, ant?: Ant): TaskStepResult {
    this.currentStep++;
    let stepReward = -0.01; // Baseline kinetic energy expenditure penalty
    let taskCompleted = false;

    if (ant) {
      // Reward for food collection
      if (ant.internalState.state.carryingFoodAmount > 0) {
        stepReward += 5.0;
      }
      // Reward for returning food to nest
      const distToNest = Math.hypot(ant.body.position.x, ant.body.position.y);
      if (ant.internalState.state.carryingFoodAmount > 0 && distToNest < 2.5) {
        stepReward += 15.0;
        taskCompleted = true;
      }
    }

    this.cumulativeReward += stepReward;
    const done = this.currentStep >= this.config.maxEpisodeSteps || taskCompleted;
    if (done) this.isEpisodeActive = false;

    const obs = this.extractObservation(
      ant || ({ body: { position: { x: 0, y: 0 } }, internalState: { state: {} } } as any),
      ant?.sensors.lastSnapshot || ({} as any)
    );

    return {
      observation: obs,
      reward: stepReward,
      done,
      info: {
        episodeStep: this.currentStep,
        cumulativeReward: this.cumulativeReward,
        taskCompleted,
        taskName: this.config.name,
        metrics: {
          stepReward,
          distanceToNest: ant ? Math.hypot(ant.body.position.x, ant.body.position.y) : 0,
        },
      },
    };
  }

  public extractObservation(ant: Ant, sensors: AntSensorySnapshot): TaskObservation {
    const s = sensors || {};
    const features = [
      s.foodLeft || 0,
      s.foodCenter || 0,
      s.foodRight || 0,
      s.homeLeft || 0,
      s.homeCenter || 0,
      s.homeRight || 0,
      s.foodOdorConcentration || 0,
      s.nestProximity || 0,
      s.obstacleCenter || 0,
      s.predatorDetected ? 1.0 : 0.0,
      ant.internalState?.state.energy || 1.0,
      ant.internalState?.state.hunger || 0.0,
      ant.internalState?.state.carryingFoodAmount || 0.0,
      ant.internalState?.state.health || 1.0,
    ];

    return {
      features,
      timestep: this.currentStep,
      done: !this.isEpisodeActive,
    };
  }
}

/**
 * 2. Keyboard RL Demonstration Environment
 * Compatible with the trained AntWire Keyboard RL brain showcase: https://ant-brain-keyboard.vercel.app/
 */
export class KeyboardRLTaskEnvironment extends BaseTaskEnvironment {
  private targetKeyPosition: Vector2D = { x: 5, y: 0 };
  private currentKeyLabel: string = 'W';

  constructor() {
    super({
      taskId: 'env-keyboard-rl-v1',
      name: 'Keyboard RL Trained Brain Demonstration Environment',
      category: 'KEYBOARD',
      observationDim: 14,
      actionDim: 2,
      maxEpisodeSteps: 300,
      rewardDescription: '+20.0 for reaching target key, shaped by Euclidean distance differential.',
      author: 'Nikhilesh H. Chavda',
      version: '1.0.0',
    });
  }

  public reset(_world?: SimulationWorld, ant?: Ant): TaskObservation {
    this.currentStep = 0;
    this.cumulativeReward = 0;
    this.isEpisodeActive = true;
    this.targetKeyPosition = { x: 4.0, y: 2.0 };
    this.currentKeyLabel = 'SPACE';

    return {
      features: [0, 0, 0, 0, 0, 0, 1.0, 0.5, 0, 0, 1.0, 0, 0, 1.0],
      timestep: 0,
      done: false,
      metadata: { targetKey: this.currentKeyLabel, targetPos: this.targetKeyPosition },
    };
  }

  public step(action: TaskAction, _world?: SimulationWorld, ant?: Ant): TaskStepResult {
    this.currentStep++;
    let reward = -0.02;
    let completed = false;

    if (ant) {
      const dist = Math.hypot(
        ant.body.position.x - this.targetKeyPosition.x,
        ant.body.position.y - this.targetKeyPosition.y
      );
      reward += Math.max(0, 1.0 - dist * 0.1);
      if (dist < 1.0) {
        reward += 20.0;
        completed = true;
      }
    }

    this.cumulativeReward += reward;
    const done = this.currentStep >= this.config.maxEpisodeSteps || completed;

    return {
      observation: {
        features: [0, 0, 0, 0, 0, 0, 0.8, 0.2, 0, 0, 1.0, 0, 0, 1.0],
        timestep: this.currentStep,
        done,
      },
      reward,
      done,
      info: {
        episodeStep: this.currentStep,
        cumulativeReward: this.cumulativeReward,
        taskCompleted: completed,
        taskName: this.config.name,
        metrics: { reward },
      },
    };
  }

  public extractObservation(_ant: Ant, _sensors: AntSensorySnapshot): TaskObservation {
    return {
      features: [0, 0, 0, 0, 0, 0, 0.5, 0.5, 0, 0, 1.0, 0, 0, 1.0],
      timestep: this.currentStep,
      done: !this.isEpisodeActive,
    };
  }
}

/**
 * 3. Custom Developer-Defined Task Environment
 * Generic wrapper allowing developers to instantiate arbitrary reward functions and step logic.
 */
export class CustomDeveloperTaskEnvironment extends BaseTaskEnvironment {
  private customStepFn: (action: TaskAction, stepCount: number) => { reward: number; done: boolean };
  private customObsFn: () => number[];

  constructor(
    config: TaskEnvironmentConfig,
    stepFn: (action: TaskAction, stepCount: number) => { reward: number; done: boolean },
    obsFn: () => number[]
  ) {
    super(config);
    this.customStepFn = stepFn;
    this.customObsFn = obsFn;
  }

  public reset(): TaskObservation {
    this.currentStep = 0;
    this.cumulativeReward = 0;
    this.isEpisodeActive = true;
    return {
      features: this.customObsFn(),
      timestep: 0,
      done: false,
    };
  }

  public step(action: TaskAction): TaskStepResult {
    this.currentStep++;
    const res = this.customStepFn(action, this.currentStep);
    this.cumulativeReward += res.reward;
    const done = this.currentStep >= this.config.maxEpisodeSteps || res.done;
    if (done) this.isEpisodeActive = false;

    return {
      observation: {
        features: this.customObsFn(),
        timestep: this.currentStep,
        done,
      },
      reward: res.reward,
      done,
      info: {
        episodeStep: this.currentStep,
        cumulativeReward: this.cumulativeReward,
        taskCompleted: res.done,
        taskName: this.config.name,
        metrics: { stepReward: res.reward },
      },
    };
  }

  public extractObservation(): TaskObservation {
    return {
      features: this.customObsFn(),
      timestep: this.currentStep,
      done: !this.isEpisodeActive,
    };
  }
}

/**
 * Global Registry for AntWire Task Environments.
 */
export class TaskEnvironmentRegistry {
  private static environments: Map<string, BaseTaskEnvironment> = new Map();

  static {
    this.register(new ForagingTaskEnvironment());
    this.register(new KeyboardRLTaskEnvironment());
  }

  public static register(env: BaseTaskEnvironment): void {
    this.environments.set(env.config.taskId, env);
  }

  public static get(taskId: string): BaseTaskEnvironment | undefined {
    return this.environments.get(taskId);
  }

  public static getAll(): BaseTaskEnvironment[] {
    return Array.from(this.environments.values());
  }

  public static getByCategories(): Record<string, BaseTaskEnvironment[]> {
    const res: Record<string, BaseTaskEnvironment[]> = {};
    for (const env of this.environments.values()) {
      const cat = env.config.category;
      if (!res[cat]) res[cat] = [];
      res[cat].push(env);
    }
    return res;
  }
}
