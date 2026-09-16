/**
 * ANT BRAIN — Universal Agent Policy & Multi-Agent Learning Interface
 * Standardizes the computational sensory-cognitive-motor loop across:
 * 1. Rule-Based Ethology Controllers
 * 2. Utility / Response-Threshold Controllers
 * 3. Reinforcement Learning / Policy Gradient Networks
 * 4. Neuromorphic Spiking & Connectome Substrates (AL + MB + CX)
 */

import { Ant } from '../ants/ant';
import { AntAction, AntSensorySnapshot, ColonyNeedsVector, Vector2D } from '../simulation/types';
import { TrajectoryStep } from './trajectory_logger';

export interface ObservationVector {
  antennaeChemosensory: number[]; // [foodL, foodC, foodR, homeL, homeC, homeR, alarmL, alarmC, alarmR]
  headingOdometer: Vector2D;
  distanceToNest: number;
  internalPhysiology: [number, number, number, number]; // [energy, hunger, health, threatArousal]
  detectedVegetationToughness: number;
  vibrationIntensity: number;
  nearbyNestmateCount: number;
  isCarryingCargo: boolean;
}

export interface PolicyActionDecision {
  action: AntAction;
  chosenMotivation: string;
  confidence: number;
  candidateUtilityScores: Record<string, number>;
  explanation: string;
}

export interface AgentPolicy {
  readonly policyId: string;
  readonly policyType: 'RULE_BASED' | 'RESPONSE_THRESHOLD' | 'REINFORCEMENT_LEARNING' | 'NEUROMORPHIC_SNN';

  observe(ant: Ant, sensorySnapshot: AntSensorySnapshot): ObservationVector;
  remember(ant: Ant, observation: ObservationVector): void;
  decide(ant: Ant, observation: ObservationVector, demands: ColonyNeedsVector): PolicyActionDecision;
  act(ant: Ant, decision: PolicyActionDecision): void;
  learn?(ant: Ant, step: TrajectoryStep): void;
}
