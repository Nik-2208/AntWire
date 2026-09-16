/**
 * ANT BRAIN — Neural Network Controller Stub
 * Implements the AntController interface for supervised imitation and RL policy inference.
 */

import { AntAction, AntDrives, AntInternalState, AntSensorySnapshot, DecisionRecord } from '../../simulation/types';
import { AntBody } from '../body';
import { AntMemory } from '../memory';
import { SeededRNG } from '../../simulation/rng';
import { AntController, DecisionOutput } from './controller';
import { ActionFactory } from '../actions';

export interface NeuralNetworkWeights {
  inputWeights: number[][];  // [hiddenSize x inputSize]
  hiddenBiases: number[];    // [hiddenSize]
  outputWeights: number[][]; // [outputSize x hiddenSize]
  outputBiases: number[];    // [outputSize]
}

export class NeuralController implements AntController {
  public readonly name = 'Neural Policy Controller (MLP)';
  public readonly type = 'NEURAL' as const;
  public readonly version = '1.0.0';

  private weights: NeuralNetworkWeights;
  public lastActivations: { inputs: number[]; hidden: number[]; outputs: number[] } = {
    inputs: new Array(14).fill(0),
    hidden: new Array(16).fill(0),
    outputs: new Array(4).fill(0),
  };

  constructor(customWeights?: NeuralNetworkWeights) {
    // Default initialized lightweight feedforward weights
    this.weights = customWeights || this.initializeRandomWeights(14, 16, 4);
  }

  public getWeights(): NeuralNetworkWeights {
    return JSON.parse(JSON.stringify(this.weights));
  }

  public setWeights(newWeights: NeuralNetworkWeights): void {
    this.weights = JSON.parse(JSON.stringify(newWeights));
  }

  public getLastActivations(): { inputs: number[]; hidden: number[]; outputs: number[] } {
    return this.lastActivations;
  }

  /**
   * Functional ablation experiment: zero out all synaptic connections to a specific hidden neuron
   */
  public ablateNeuron(layer: 'hidden', index: number): void {
    if (layer === 'hidden' && index >= 0 && index < this.weights.hiddenBiases.length) {
      this.weights.hiddenBiases[index] = -999.0;
      for (let j = 0; j < this.weights.inputWeights[index].length; j++) {
        this.weights.inputWeights[index][j] = 0.0;
      }
      for (let o = 0; o < this.weights.outputWeights.length; o++) {
        this.weights.outputWeights[o][index] = 0.0;
      }
    }
  }

  /**
   * Mutate a single synaptic weight to observe live behavioral causality
   */
  public mutateWeight(layer: 'input' | 'output', r: number, c: number, delta: number): void {
    if (layer === 'input' && this.weights.inputWeights[r]?.[c] !== undefined) {
      this.weights.inputWeights[r][c] += delta;
    } else if (layer === 'output' && this.weights.outputWeights[r]?.[c] !== undefined) {
      this.weights.outputWeights[r][c] += delta;
    }
  }

  /**
   * Mutate neuron bias directly
   */
  public mutateBias(layer: 'hidden' | 'output', index: number, delta: number): void {
    if (layer === 'hidden' && this.weights.hiddenBiases[index] !== undefined) {
      this.weights.hiddenBiases[index] += delta;
    } else if (layer === 'output' && this.weights.outputBiases[index] !== undefined) {
      this.weights.outputBiases[index] += delta;
    }
  }

  public initializeRandomWeights(inputSize: number, hiddenSize: number, outputSize: number): NeuralNetworkWeights {
    const inputWeights: number[][] = [];
    for (let i = 0; i < hiddenSize; i++) {
      const row: number[] = [];
      for (let j = 0; j < inputSize; j++) {
        row.push((Math.random() - 0.5) * 0.4);
      }
      inputWeights.push(row);
    }

    const hiddenBiases = new Array(hiddenSize).fill(0.01);

    const outputWeights: number[][] = [];
    for (let i = 0; i < outputSize; i++) {
      const row: number[] = [];
      for (let j = 0; j < hiddenSize; j++) {
        row.push((Math.random() - 0.5) * 0.4);
      }
      outputWeights.push(row);
    }

    const outputBiases = new Array(outputSize).fill(0.0);

    return { inputWeights, hiddenBiases, outputWeights, outputBiases };
  }

  public decide(
    antId: string,
    simTime: number,
    tick: number,
    _body: AntBody,
    sensors: AntSensorySnapshot,
    internalState: AntInternalState,
    drives: AntDrives,
    _memory: AntMemory,
    _rng: SeededRNG
  ): DecisionOutput {
    // 1. Vectorize inputs
    const inputs = [
      sensors.foodLeft,
      sensors.foodCenter,
      sensors.foodRight,
      sensors.homeLeft,
      sensors.homeCenter,
      sensors.homeRight,
      sensors.foodOdorConcentration,
      sensors.nestOdorConcentration,
      sensors.obstacleCenter,
      sensors.predatorProximity,
      internalState.energy,
      internalState.hunger,
      internalState.carryingFoodAmount,
      drives.threatAvoidance,
    ];

    // 2. Hidden layer with ReLU activation
    const hidden: number[] = [];
    for (let i = 0; i < this.weights.hiddenBiases.length; i++) {
      let sum = this.weights.hiddenBiases[i];
      for (let j = 0; j < inputs.length; j++) {
        sum += this.weights.inputWeights[i][j] * inputs[j];
      }
      hidden.push(Math.max(0, sum)); // ReLU
    }

    // 3. Output layer: [forwardThrottle, turnAngle, depositFoodTrail, depositHomeTrail]
    const outputs: number[] = [];
    for (let i = 0; i < this.weights.outputBiases.length; i++) {
      let sum = this.weights.outputBiases[i];
      for (let j = 0; j < hidden.length; j++) {
        sum += this.weights.outputWeights[i][j] * hidden[j];
      }
      outputs.push(sum);
    }

    // Sigmoid / Tanh activations for motor controls
    const throttle = 1.0 / (1.0 + Math.exp(-outputs[0])); // [0, 1]
    const turn = Math.tanh(outputs[1]) * 1.5; // [-1.5, 1.5] rad

    // Cache live activations for real-time Neural Lab synchronization
    this.lastActivations = {
      inputs: [...inputs],
      hidden: [...hidden],
      outputs: [throttle, turn, outputs[2] || 0, outputs[3] || 0],
    };

    const action: AntAction = ActionFactory.move(throttle, turn);

    const record: DecisionRecord = {
      id: `${antId}-${tick}`,
      antId,
      timestamp: simTime,
      tick,
      sensorySnapshot: { ...sensors },
      internalState: { ...internalState },
      drives: { ...drives },
      selectedAction: action,
      dominantDrive: 'Neural Forward Pass',
      dominantDriveValue: 0.8,
      confidence: 0.75,
      humanReason: 'Action generated from neural network matrix forward inference.',
      technicalExplanation: `MLP forward: throttle=${throttle.toFixed(2)}, turn=${turn.toFixed(2)} rad`,
    };

    return { action, record };
  }
}
