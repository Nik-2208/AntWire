/**
 * ANT BRAIN — Biological Brain Neuropil Controller
 * Pluggable AntController implementation driven by the BiologicallyInformedAntBrain.
 */

import { AntController, DecisionOutput } from './controller';
import { AntAction, AntDrives, AntInternalState, AntSensorySnapshot, DecisionRecord } from '../../simulation/types';
import { AntBody } from '../body';
import { AntMemory } from '../memory';
import { SeededRNG } from '../../simulation/rng';
import { BiologicallyInformedAntBrain } from '../brain/ant_brain';
import { AntBrainStateSnapshot } from '../brain/types';

export class BiologicalBrainController implements AntController {
  public readonly name = 'Formica Biologically Informed Neuropil Controller';
  public readonly type = 'RULE_BASED' as const; // Implements biologically validated neurocircuitry
  public readonly version = '2.0.0-neuropil';

  public brain: BiologicallyInformedAntBrain;
  public latestBrainSnapshot: AntBrainStateSnapshot | null = null;

  constructor() {
    this.brain = new BiologicallyInformedAntBrain();
  }

  public decide(
    antId: string,
    simTime: number,
    tick: number,
    body: AntBody,
    sensors: AntSensorySnapshot,
    internalState: AntInternalState,
    drives: AntDrives,
    _memory: AntMemory,
    rng: SeededRNG
  ): DecisionOutput {
    // Reward / Punishment reinforcement events
    const rewardSignal = internalState.carryingFoodAmount > 0 ? 1.0 : 0.0;
    const punishmentSignal = sensors.predatorDetected || internalState.threatLevel > 0.5 ? 1.0 : 0.0;

    const result = this.brain.evaluate(
      body,
      sensors,
      internalState,
      1 / 60,
      rng,
      rewardSignal,
      punishmentSignal
    );

    this.latestBrainSnapshot = result.snapshot;

    const humanReason = `[${result.dominantNeuropil}] ${result.neuralReason}`;
    const technicalExplanation = `AL_diff=${result.snapshot.antennalLobe.tropotaxisDifferential.toFixed(2)} | CX_home=(${result.snapshot.centralComplex.homeVectorDistance.toFixed(1)}m, ${result.snapshot.centralComplex.homeVectorAngle.toFixed(2)}rad) | MB_oct=${result.snapshot.mushroomBody.octopamineLevel.toFixed(2)}`;

    const record: DecisionRecord = {
      id: `${antId}-${tick}`,
      antId,
      timestamp: simTime,
      tick,
      sensorySnapshot: { ...sensors },
      internalState: { ...internalState },
      drives: { ...drives },
      selectedAction: result.action,
      dominantDrive: result.dominantNeuropil,
      dominantDriveValue: 0.9,
      confidence: 0.92,
      humanReason,
      technicalExplanation,
    };

    return { action: result.action, record };
  }
}
