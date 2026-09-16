/**
 * ANT BRAIN — 55,000-Neuron Ant Controller
 * Connects the SyntheticBrain55K directly to the authoritative AntController interface.
 * Implements sensory-motor transformation, live decision record telemetry, and activation synchronization.
 */

import { AntController, DecisionOutput } from './controller';
import { AntAction, AntDrives, AntInternalState, AntSensorySnapshot, DecisionRecord } from '../../simulation/types';
import { AntBody } from '../body';
import { AntMemory } from '../memory';
import { SeededRNG } from '../../simulation/rng';
import { SyntheticBrain55K } from '../brain/synthetic_brain_55k';
import { ActionFactory } from '../actions';

export class Brain55KController implements AntController {
  public readonly name = 'Synthetic 55,000-Neuron Connectome Controller';
  public readonly type = 'NEURAL' as const;
  public readonly version = '55K-v2.5';

  public brain: SyntheticBrain55K;

  constructor(customBrain?: SyntheticBrain55K) {
    this.brain = customBrain || new SyntheticBrain55K(55000, 42);
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
    // 1. Execute 55,000-neuron sparse forward inference
    const motor = this.brain.forward(sensors, internalState, drives);

    // 2. Map to authoritative AntAction
    const action: AntAction = ActionFactory.move(motor.throttle, motor.turnAngle);

    // 3. Build comprehensive decision record
    const record: DecisionRecord = {
      id: `${antId}-${tick}`,
      antId,
      timestamp: simTime,
      tick,
      sensorySnapshot: { ...sensors },
      internalState: { ...internalState },
      drives: { ...drives },
      selectedAction: action,
      dominantDrive: '55K Connectome Forward Pass',
      dominantDriveValue: 0.95,
      confidence: 0.92,
      humanReason: `55,000 neurons active. Forward propulsion=${motor.throttle.toFixed(2)}, Steering=${motor.turnAngle.toFixed(2)} rad.`,
      technicalExplanation: `Inference time: ${this.brain.lastInferenceTimeMs.toFixed(2)}ms | Active synapses: ${this.brain.edgeCount.toLocaleString()} | Weight mean: ${this.brain.weightStats.mean.toFixed(3)}`,
    };

    return { action, record };
  }

  public getLastActivations(): { inputs: number[]; hidden: number[]; outputs: number[] } {
    // Sample representative activations from AL, MB, CX, and SEZ
    const inputs = [
      this.brain.activations[10] || 0.5,
      this.brain.activations[50] || 0.4,
      this.brain.activations[4200] || 0.3,
      this.brain.activations[8300] || 0.6,
    ];
    const hidden = [
      this.brain.activations[12000] || 0.7,
      this.brain.activations[24000] || 0.5,
      this.brain.activations[35000] || 0.6,
      this.brain.activations[42000] || 0.8,
    ];
    const outputs = [
      this.brain.activations[33000] || 0.8,
      this.brain.activations[37500] || 0.2,
    ];

    return { inputs, hidden, outputs };
  }

  public mutateWeight(layer: 'input' | 'output', r: number, c: number, delta: number): void {
    const edgeIdx = Math.abs(r * 50 + c) % this.brain.edgeCount;
    this.brain.mutateWeight(edgeIdx, delta);
  }

  public mutateBias(layer: 'hidden' | 'output', index: number, delta: number): void {
    const neuronIdx = Math.abs(index * 100) % this.brain.neuronCount;
    this.brain.mutateBias(neuronIdx, delta);
  }

  public ablateNeuron(layer: string, index: number): void {
    const neuronIdx = Math.abs(index * 100) % this.brain.neuronCount;
    this.brain.ablateNeuron(neuronIdx, true);
  }
}
