/**
 * ANT BRAIN — Synthetic Task Engine & Programmable Reward Environment
 *
 * Biological & Artificial Cognition Principle:
 * Allows researchers to deploy the exact same Ant Brain agent architecture
 * (Sensory -> SNN / 55K Network -> Memory -> Policy -> Motor Command)
 * into arbitrary synthetic task environments (e.g. Navigation Mazes, Robotic Arm Joint Control,
 * Target Tracking, and Toy Financial Arbitrage).
 *
 * Explicitly separates:
 * - BIOLOGICAL_MODE (Pheromone/Fungus/Foraging)
 * - REINFORCEMENT_LEARNING_MODE (Standard MDP with Reward / Penalty)
 * - SYNTHETIC_TASK_MODE (User-defined observation/action/reward transfer experiment)
 */

export interface SyntheticObservation {
  dimensionValues: number[]; // Arbitrary sensory array normalized [-1, 1]
  timestep: number;
  terminal: boolean;
  metadata?: Record<string, any>;
}

export interface SyntheticAction {
  actionIndex: number;
  continuousOutputs: number[]; // e.g. [steeringBias, speedThrottle, actuatorGrip]
}

export interface SyntheticStepResult {
  observation: SyntheticObservation;
  reward: number;
  done: boolean;
  info: {
    cumulativeReward: number;
    episodeStep: number;
    taskName: string;
    metrics: Record<string, number>;
  };
}

export interface SyntheticTaskDefinition {
  taskId: string;
  name: string;
  category: 'NAVIGATION' | 'ROBOTIC_CONTROL' | 'REINFORCEMENT_BENCHMARK' | 'FINANCIAL_TOY';
  observationDim: number;
  actionDim: number;
  maxEpisodeSteps: number;
  rewardDescription: string;
  reset: () => SyntheticObservation;
  step: (action: SyntheticAction) => SyntheticStepResult;
}

export class SyntheticTaskEngine {
  private activeTask: SyntheticTaskDefinition | null = null;
  private currentEpisode: number = 0;
  private currentStep: number = 0;
  private cumulativeReward: number = 0;
  private isRunning: boolean = false;
  private history: Array<{ step: number; reward: number; cumulative: number }> = [];

  constructor() {
    // Register default synthetic tasks
    this.registerTask(this.createMazeNavigationTask());
    this.registerTask(this.createFinancialArbitrageToyTask());
    this.registerTask(this.createRoboticJointTrackingTask());
  }

  private registeredTasks: Map<string, SyntheticTaskDefinition> = new Map();

  public registerTask(task: SyntheticTaskDefinition): void {
    this.registeredTasks.set(task.taskId, task);
  }

  public getAvailableTasks(): SyntheticTaskDefinition[] {
    return Array.from(this.registeredTasks.values());
  }

  public selectTask(taskId: string): SyntheticObservation {
    const task = this.registeredTasks.get(taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);
    this.activeTask = task;
    this.currentEpisode = 1;
    this.currentStep = 0;
    this.cumulativeReward = 0;
    this.history = [];
    this.isRunning = true;
    return task.reset();
  }

  public step(action: SyntheticAction): SyntheticStepResult {
    if (!this.activeTask || !this.isRunning) {
      throw new Error('No active task running in SyntheticTaskEngine');
    }

    this.currentStep++;
    const result = this.activeTask.step(action);
    this.cumulativeReward += result.reward;
    this.history.push({
      step: this.currentStep,
      reward: result.reward,
      cumulative: this.cumulativeReward,
    });

    if (result.done || this.currentStep >= this.activeTask.maxEpisodeSteps) {
      this.isRunning = false;
      result.done = true;
    }

    result.info.cumulativeReward = this.cumulativeReward;
    result.info.episodeStep = this.currentStep;
    result.info.taskName = this.activeTask.name;

    return result;
  }

  public getActiveTask(): SyntheticTaskDefinition | null {
    return this.activeTask;
  }

  public getHistory(): Array<{ step: number; reward: number; cumulative: number }> {
    return this.history;
  }

  /**
   * Built-in Preset 1: 2D Spatial Maze Navigation
   */
  private createMazeNavigationTask(): SyntheticTaskDefinition {
    let agentX = 0;
    let agentY = 0;
    const targetX = 8.0;
    const targetY = 8.0;

    return {
      taskId: 'maze_nav_2d',
      name: '2D Continuous Vector Navigation',
      category: 'NAVIGATION',
      observationDim: 4, // [agentX, agentY, targetRelX, targetRelY]
      actionDim: 2,      // [dx, dy]
      maxEpisodeSteps: 200,
      rewardDescription: 'Positive reward (+10.0) upon reaching target radius; step penalty (-0.05) to encourage efficiency.',
      reset: () => {
        agentX = 0;
        agentY = 0;
        return {
          dimensionValues: [agentX / 10, agentY / 10, (targetX - agentX) / 10, (targetY - agentY) / 10],
          timestep: 0,
          terminal: false,
        };
      },
      step: (action: SyntheticAction) => {
        const dx = (action.continuousOutputs[0] || 0) * 0.5;
        const dy = (action.continuousOutputs[1] || 0) * 0.5;
        agentX += dx;
        agentY += dy;

        const dist = Math.hypot(targetX - agentX, targetY - agentY);
        const reached = dist < 0.8;
        const reward = reached ? 10.0 : -0.05 - dist * 0.01;

        return {
          observation: {
            dimensionValues: [agentX / 10, agentY / 10, (targetX - agentX) / 10, (targetY - agentY) / 10],
            timestep: 0,
            terminal: reached,
          },
          reward,
          done: reached,
          info: {
            cumulativeReward: 0,
            episodeStep: 0,
            taskName: '2D Continuous Vector Navigation',
            metrics: { distanceToGoal: dist, agentX, agentY },
          },
        };
      },
    };
  }

  /**
   * Built-in Preset 2: Synthetic Financial Arbitrage Environment
   * NOTE: Explicitly marked as ARTIFICIAL SYNTHETIC TASK for demonstrating transfer learning.
   */
  private createFinancialArbitrageToyTask(): SyntheticTaskDefinition {
    let price = 100.0;
    let holding = 0;
    let cash = 1000.0;
    let step = 0;

    return {
      taskId: 'toy_financial_arbitrage',
      name: 'Synthetic Volatility Arbitrage (Demonstration)',
      category: 'FINANCIAL_TOY',
      observationDim: 3, // [priceNorm, holdingNorm, cashNorm]
      actionDim: 2,      // [buyAmount, sellAmount]
      maxEpisodeSteps: 150,
      rewardDescription: 'Profit on liquidated asset value yields positive reward; negative reward on drawdown.',
      reset: () => {
        price = 100.0;
        holding = 0;
        cash = 1000.0;
        step = 0;
        return {
          dimensionValues: [price / 100 - 1.0, holding / 10, cash / 1000 - 1.0],
          timestep: step,
          terminal: false,
        };
      },
      step: (action: SyntheticAction) => {
        step++;
        // Simulated geometric random walk
        const shock = (Math.sin(step * 0.2) + (Math.random() - 0.5) * 0.4) * 2.0;
        const oldTotalValue = cash + holding * price;
        price = Math.max(10.0, price + shock);

        const buy = Math.max(0, action.continuousOutputs[0] || 0) * 2;
        const sell = Math.max(0, action.continuousOutputs[1] || 0) * 2;

        if (buy > 0 && cash >= buy * price) {
          holding += buy;
          cash -= buy * price;
        } else if (sell > 0 && holding >= sell) {
          holding -= sell;
          cash += sell * price;
        }

        const newTotalValue = cash + holding * price;
        const reward = (newTotalValue - oldTotalValue) * 0.1;

        return {
          observation: {
            dimensionValues: [price / 100 - 1.0, holding / 10, cash / 1000 - 1.0],
            timestep: step,
            terminal: false,
          },
          reward,
          done: false,
          info: {
            cumulativeReward: 0,
            episodeStep: step,
            taskName: 'Synthetic Volatility Arbitrage (Demonstration)',
            metrics: { portfolioValue: newTotalValue, assetPrice: price, holdings: holding },
          },
        };
      },
    };
  }

  /**
   * Built-in Preset 3: Robotic Joint Angle Tracking
   */
  private createRoboticJointTrackingTask(): SyntheticTaskDefinition {
    let jointAngle = 0.0;
    let targetAngle = 1.57; // 90 degrees

    return {
      taskId: 'robotic_joint_control',
      name: 'Bio-Robotic Leg Joint Servomotor Control',
      category: 'ROBOTIC_CONTROL',
      observationDim: 3, // [currentAngle, targetAngle, angularError]
      actionDim: 1,      // [torqueOutput]
      maxEpisodeSteps: 100,
      rewardDescription: 'Minimizes joint angle trajectory error through torque motor commands.',
      reset: () => {
        jointAngle = 0.0;
        targetAngle = 1.57;
        return {
          dimensionValues: [jointAngle, targetAngle, targetAngle - jointAngle],
          timestep: 0,
          terminal: false,
        };
      },
      step: (action: SyntheticAction) => {
        const torque = Math.max(-1.0, Math.min(1.0, action.continuousOutputs[0] || 0));
        jointAngle += torque * 0.1;
        const error = Math.abs(targetAngle - jointAngle);
        const reward = -error * 0.5 + (error < 0.05 ? 2.0 : 0);

        return {
          observation: {
            dimensionValues: [jointAngle, targetAngle, targetAngle - jointAngle],
            timestep: 0,
            terminal: error < 0.02,
          },
          reward,
          done: error < 0.02,
          info: {
            cumulativeReward: 0,
            episodeStep: 0,
            taskName: 'Bio-Robotic Leg Joint Servomotor Control',
            metrics: { jointAngle, targetAngle, trackingError: error },
          },
        };
      },
    };
  }
}
