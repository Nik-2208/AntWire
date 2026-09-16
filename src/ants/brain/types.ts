/**
 * ANT BRAIN — Computational Neurobiology & Neuropil Types
 * Rigorous insect neuroanatomy data structures based on Hymenoptera / Formicidae literature:
 * Antennal Lobes (AL), Mushroom Bodies (MB), Central Complex (CX), and Lateral Accessory Lobes (LAL).
 */

import { Vector2D } from '../../simulation/types';

/**
 * Antennal Lobe (AL) Glomerular Activation
 */
export interface GlomerulusState {
  id: string;
  name: string; // e.g. "Food Volatile (GL-01)", "Trail Pheromone (GL-02)", "Alarm Terpene (GL-03)"
  leftActivation: number;  // 0 to 1
  rightActivation: number; // 0 to 1
  adaptation: number;      // sensory fatigue / receptor desensitization
}

/**
 * Mushroom Body (MB) Learning & Associative Memory
 */
export interface MushroomBodyState {
  kenyonCellActivations: Float32Array; // Sparse population coding (~64 virtual Kenyon Cells)
  valenceWeights: Float32Array;        // Synaptic weights to MBON-Appetitive and MBON-Aversive
  octopamineLevel: number;             // Neuromodulator: Reward / Satiety (food reinforcement)
  dopamineLevel: number;               // Neuromodulator: Aversion / Punishment (predator/injury)
  cumulativeReward: number;
}

/**
 * Central Complex (CX) Celestial Compass & Path Integration (PI)
 */
export interface CentralComplexState {
  // Ellipsoid Body (EB) / Protocerebral Bridge (PB) Heading Ring Attractor (16 wedge neurons)
  headingRingAttractor: Float32Array; // Neuronal activity bump representing estimated heading angle
  estimatedHeading: number;           // Radians [0, 2*PI)

  // Fan-Shaped Body (FB) Path Integration / Odometer
  homeVectorAngle: number;            // Radians pointing directly back to the nest entrance
  homeVectorDistance: number;         // Estimated Euclidean distance in meters
  pathIntegrationConfidence: number;  // Confidence decaying with distance/step noise

  // Optic Flow & Polarized Celestial Light Input
  celestialPolarizationAngle: number;
  stepAccumulator: number;
}

/**
 * Lateral Accessory Lobes (LAL) & Descending Premotor Control
 */
export interface MotorLALState {
  leftMotorBias: number;  // 0 to 1
  rightMotorBias: number; // 0 to 1
  forwardThrust: number;  // 0 to 1
  mandibleGraspReflex: boolean;
  stingVenomDischarge: boolean;
}

/**
 * Complete Neuropil Snapshot for Live Neurobiology Laboratory Telemetry
 */
export interface AntBrainStateSnapshot {
  timestamp: number;
  antennalLobe: {
    glomeruli: GlomerulusState[];
    tropotaxisDifferential: number; // Left vs Right net sensory contrast
  };
  mushroomBody: {
    sparseSparsityFraction: number;
    appetitiveOutput: number;
    aversiveOutput: number;
    octopamineLevel: number;
    dopamineLevel: number;
  };
  centralComplex: {
    headingRing: number[];
    estimatedHeading: number;
    homeVectorAngle: number;
    homeVectorDistance: number;
    pathIntegrationConfidence: number;
  };
  motorLAL: {
    steerAngle: number;
    thrust: number;
  };
}
