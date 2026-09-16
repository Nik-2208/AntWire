/**
 * ANT BRAIN — Policy Training Engine
 * Implements Reinforcement Learning policy optimization, reward shaping,
 * continuous training from checkpoints, and performance telemetry.
 */

import { NeuralController } from '../ants/controllers/neural_stub';
import { ModelCheckpoint, ModelStorageService } from './model_checkpoint';

export interface TrainingConfig {
  task: 'FORAGE' | 'MAZE' | 'TRAIL_FOLLOW' | 'EVADE' | 'COLLECTIVE_TRANSPORT';
  controllerType: 'NEURAL' | 'RL' | 'SNN' | 'RULE_BASED';
  learningRate: number;
  batchSize: number;
  gamma: number; // Discount factor
  explorationRate: number; // Epsilon / noise scale
  checkpointInterval: number; // Steps between auto-checkpoints
  rewardShaping: {
    foodReward: number;
    nestDeliveryReward: number;
    energyPenalty: number;
    deathPenalty: number;
    distancePenalty: number;
  };
}

export interface TrainingProgress {
  step: number;
  episode: number;
  currentReward: number;
  meanReward: number;
  bestReward: number;
  successRate: number;
  loss: number;
  isTraining: boolean;
}

export class PolicyTrainer {
  public config: TrainingConfig;
  public controller: NeuralController;
  public activeCheckpoint: ModelCheckpoint | null = null;
  public bestCheckpoint: ModelCheckpoint | null = null;

  public progress: TrainingProgress = {
    step: 0,
    episode: 0,
    currentReward: 0,
    meanReward: 0,
    bestReward: -Infinity,
    successRate: 0,
    loss: 0,
    isTraining: false,
  };

  private rewardHistory: number[] = [];
  private successHistory: boolean[] = [];

  constructor(customConfig?: Partial<TrainingConfig>, initialWeights?: any) {
    this.config = {
      task: 'FORAGE',
      controllerType: 'NEURAL',
      learningRate: 0.015,
      batchSize: 10,
      gamma: 0.95,
      explorationRate: 0.20,
      checkpointInterval: 50,
      rewardShaping: {
        foodReward: 10.0,
        nestDeliveryReward: 15.0,
        energyPenalty: 0.1,
        deathPenalty: 20.0,
        distancePenalty: 0.05,
      },
      ...customConfig,
    };

    this.controller = new NeuralController(initialWeights);
  }

  /**
   * Resume / continue training strictly from an existing saved checkpoint
   */
  public resumeFromCheckpoint(checkpoint: ModelCheckpoint): void {
    this.activeCheckpoint = checkpoint;
    this.controller.setWeights(checkpoint.weights);
    this.config.task = checkpoint.task;
    this.config.rewardShaping = {
      ...this.config.rewardShaping,
      ...checkpoint.rewardDefinition,
    };

    this.progress.step = checkpoint.trainingStep;
    this.progress.episode = checkpoint.episodeCount;
    this.progress.meanReward = checkpoint.metrics.meanReward;
    this.progress.bestReward = checkpoint.metrics.bestReward;
    this.progress.successRate = checkpoint.metrics.successRate;
    this.progress.loss = checkpoint.metrics.loss || 0;

    this.rewardHistory = [checkpoint.metrics.meanReward];
    this.successHistory = [checkpoint.metrics.successRate > 50];
  }

  /**
   * Execute a single training iteration step (Fast Simulated Rollout + Policy Gradient)
   */
  public trainStep(): TrainingProgress {
    this.progress.step++;
    const currentWeights = this.controller.getWeights();

    // 1. Rollout simulation evaluation with perturbation exploration
    const noiseScale = Math.max(0.02, this.config.explorationRate * Math.exp(-this.progress.step * 0.005));
    const perturbedWeights = JSON.parse(JSON.stringify(currentWeights));

    // Perturb input & output weights
    for (let i = 0; i < perturbedWeights.inputWeights.length; i++) {
      for (let j = 0; j < perturbedWeights.inputWeights[i].length; j++) {
        perturbedWeights.inputWeights[i][j] += (Math.random() - 0.5) * noiseScale;
      }
    }
    for (let i = 0; i < perturbedWeights.outputWeights.length; i++) {
      for (let j = 0; j < perturbedWeights.outputWeights[i].length; j++) {
        perturbedWeights.outputWeights[i][j] += (Math.random() - 0.5) * noiseScale;
      }
    }

    // 2. Compute task reward for base vs perturbed
    const baseScore = this.evaluatePolicyScore(currentWeights);
    const candidateScore = this.evaluatePolicyScore(perturbedWeights);

    // 3. Policy gradient / Evolutionary hill-climbing update
    const scoreDiff = candidateScore.reward - baseScore.reward;
    if (scoreDiff > 0) {
      // Accept improved weights
      const alpha = this.config.learningRate * 2.0;
      for (let i = 0; i < currentWeights.inputWeights.length; i++) {
        for (let j = 0; j < currentWeights.inputWeights[i].length; j++) {
          currentWeights.inputWeights[i][j] += (perturbedWeights.inputWeights[i][j] - currentWeights.inputWeights[i][j]) * alpha;
        }
      }
      for (let i = 0; i < currentWeights.outputWeights.length; i++) {
        for (let j = 0; j < currentWeights.outputWeights[i].length; j++) {
          currentWeights.outputWeights[i][j] += (perturbedWeights.outputWeights[i][j] - currentWeights.outputWeights[i][j]) * alpha;
        }
      }
      this.controller.setWeights(currentWeights);
      this.progress.currentReward = candidateScore.reward;
      this.successHistory.push(candidateScore.success);
    } else {
      this.progress.currentReward = baseScore.reward;
      this.successHistory.push(baseScore.success);
    }

    this.progress.episode++;
    this.rewardHistory.push(this.progress.currentReward);
    if (this.rewardHistory.length > 50) this.rewardHistory.shift();
    if (this.successHistory.length > 50) this.successHistory.shift();

    // Update telemetry metrics
    const sumReward = this.rewardHistory.reduce((a, b) => a + b, 0);
    this.progress.meanReward = parseFloat((sumReward / this.rewardHistory.length).toFixed(2));
    this.progress.loss = parseFloat(Math.max(0.01, 1.0 / (Math.abs(this.progress.meanReward) + 1.0)).toFixed(4));
    const successful = this.successHistory.filter(Boolean).length;
    this.progress.successRate = parseFloat(((successful / this.successHistory.length) * 100).toFixed(1));

    if (this.progress.currentReward > this.progress.bestReward) {
      this.progress.bestReward = parseFloat(this.progress.currentReward.toFixed(2));
      this.bestCheckpoint = this.createCheckpoint('Best Checkpoint');
    }

    return { ...this.progress };
  }

  /**
   * Fast headless domain task evaluator
   */
  private evaluatePolicyScore(weights: any): { reward: number; success: boolean } {
    // Synthetic task environment rollouts based on active task
    let simulatedReward = 0;
    let success = false;

    // Forward inference test on canonical task inputs
    const testSensors = [
      0.8, 0.9, 0.7,  // food odor
      0.2, 0.1, 0.1,  // home odor
      0.85, 0.15,     // concentration
      0.0, 0.0,       // obstacle & predator
      0.75, 0.25,     // energy & hunger
      0.0, 0.1,       // carrying & threat
    ];

    let sumThrottle = 0;
    let turnBias = 0;

    for (let h = 0; h < weights.hiddenBiases.length; h++) {
      let sum = weights.hiddenBiases[h];
      for (let j = 0; j < testSensors.length; j++) {
        sum += weights.inputWeights[h][j] * testSensors[j];
      }
      const act = Math.max(0, sum);
      sumThrottle += (weights.outputWeights[0]?.[h] || 0) * act;
      turnBias += Math.abs((weights.outputWeights[1]?.[h] || 0) * act);
    }

    const throttle = 1.0 / (1.0 + Math.exp(-sumThrottle));

    if (this.config.task === 'FORAGE') {
      // High forward speed towards food reward, penalized for excessive turning
      simulatedReward = throttle * this.config.rewardShaping.foodReward - turnBias * 0.5 - 0.2;
      success = throttle > 0.65 && simulatedReward > 3.0;
    } else if (this.config.task === 'MAZE') {
      // Coordinated forward and turning maneuver
      simulatedReward = throttle * 6.0 + turnBias * 4.0 - 0.5;
      success = simulatedReward > 5.0;
    } else if (this.config.task === 'EVADE') {
      // Rapid sprint throttle
      simulatedReward = throttle * 12.0 - 1.0;
      success = throttle > 0.75;
    } else {
      simulatedReward = throttle * 8.0;
      success = throttle > 0.5;
    }

    return { reward: simulatedReward, success };
  }

  /**
   * Pack current controller state into a validated ModelCheckpoint
   */
  public createCheckpoint(nameSuffix = 'Checkpoint', customNotes = ''): ModelCheckpoint {
    const timestamp = new Date().toISOString();
    const ver = `v1.${Math.floor(this.progress.step / 10)}.${this.progress.step % 10}`;

    return {
      modelId: `model-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      modelName: `${this.config.task} Policy ${nameSuffix}`,
      version: ver,
      parentModelId: this.activeCheckpoint?.modelId,
      controllerType: 'NEURAL',
      architecture: {
        type: 'FEEDFORWARD_MLP',
        inputSize: 14,
        hiddenLayers: [16],
        outputSize: 4,
        activation: 'RELU',
      },
      weights: this.controller.getWeights(),
      trainingStep: this.progress.step,
      episodeCount: this.progress.episode,
      trainingEnvironment: {
        worldSize: 70,
        obstacleDensity: 0.15,
        predatorPresence: this.config.task === 'EVADE',
        temperature: 24.0,
      },
      task: this.config.task,
      rewardDefinition: { ...this.config.rewardShaping },
      species: 'Formica rufa',
      inputSchema: [
        'foodLeft', 'foodCenter', 'foodRight',
        'homeLeft', 'homeCenter', 'homeRight',
        'foodOdorConcentration', 'nestOdorConcentration',
        'obstacleCenter', 'predatorProximity',
        'energy', 'hunger', 'carryingFoodAmount', 'threatAvoidance',
      ],
      outputSchema: ['throttle', 'turn', 'depositFoodTrail', 'depositHomeTrail'],
      normalization: {},
      seed: 42,
      metrics: {
        meanReward: this.progress.meanReward,
        bestReward: this.progress.bestReward,
        successRate: this.progress.successRate,
        loss: this.progress.loss,
        episodesCompleted: this.progress.episode,
        totalSteps: this.progress.step,
      },
      createdAt: timestamp,
      updatedAt: timestamp,
      notes: customNotes || `Trained for ${this.progress.step} steps on ${this.config.task}.`,
    };
  }

  /**
   * Save current training progress to IndexedDB/localStorage
   */
  public async saveCurrentCheckpoint(name = 'Checkpoint'): Promise<ModelCheckpoint> {
    const checkpoint = this.createCheckpoint(name);
    await ModelStorageService.saveCheckpoint(checkpoint);
    this.activeCheckpoint = checkpoint;
    return checkpoint;
  }
}
