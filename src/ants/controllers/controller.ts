/**
 * ANT BRAIN — Ant Controller Interface
 * Enables hot-swappable behavioral policies (Rule-based, Neural Network, SNN, RL).
 */

import { AntAction, AntDrives, AntInternalState, AntSensorySnapshot, DecisionRecord } from '../../simulation/types';
import { AntMemory } from '../memory';
import { SeededRNG } from '../../simulation/rng';
import { AntBody } from '../body';

export interface DecisionOutput {
  action: AntAction;
  record: DecisionRecord;
}

export interface AntController {
  readonly name: string;
  readonly type: 'RULE_BASED' | 'NEURAL' | 'RECURRENT' | 'RL' | 'SNN' | 'EVOLUTIONARY';
  readonly version: string;

  decide(
    antId: string,
    simTime: number,
    tick: number,
    body: AntBody,
    sensors: AntSensorySnapshot,
    internalState: AntInternalState,
    drives: AntDrives,
    memory: AntMemory,
    rng: SeededRNG
  ): DecisionOutput;
}
