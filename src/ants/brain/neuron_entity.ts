/**
 * ANTWIRE — Computational Neuron & Synapse Entity Architecture
 * Created & Developed by Nikhilesh H. Chavda
 *
 * Defines machine-readable computational neurobiology entities:
 * 1. ComputationalNeuron: Globally unique IDs, morphology, dynamics, parameters, provenance.
 * 2. ComputationalSynapse: Pre/Post directed connectivity, weights, delays, neurotransmitters, plasticity.
 * 3. Parameter Classification: TRAINABLE, FROZEN, STRUCTURAL, DERIVED, BIOLOGICALLY_CONSTRAINED.
 *
 * SCIENTIFIC POSITION:
 * Clearly distinguishes BIOLOGICALLY MEASURED, BIOLOGICALLY INFORMED, COMPUTATIONALLY MODELLED,
 * LEARNED, and HYPOTHESIS. Never claims unmeasured ant connectome data is empirical.
 */

import { NeuropilRegionId, EvidenceStatus, NeurotransmitterType } from './connectome';

export type NeuronClass =
  | 'SENSORY'
  | 'INTERNEURON'
  | 'ASSOCIATION'
  | 'INTEGRATION'
  | 'MEMORY'
  | 'MODULATORY'
  | 'DECISION'
  | 'MOTOR'
  | 'DESCENDING'
  | 'LOCAL_CIRCUIT'
  | 'OUTPUT';

export type ParameterCategory =
  | 'TRAINABLE'
  | 'FROZEN'
  | 'STRUCTURAL'
  | 'DERIVED'
  | 'BIOLOGICALLY_CONSTRAINED';

export type ActivationModelType =
  | 'LIF_ADAPTIVE'      // Leaky Integrate-and-Fire with Spike-Frequency Adaptation
  | 'RATE_SIGMOIDAL'    // Continuous non-linear rate-coded activation [0, 1]
  | 'RATE_TANH'         // Zero-centered continuous rate-coded [-1, 1]
  | 'RING_ATTRACTOR';   // Continuous attractor dynamics for Central Complex compass

export interface MorphologicalSegment {
  segmentId: string;
  type: 'SOMA' | 'DENDRITE' | 'AXON_INITIAL_SEGMENT' | 'AXON' | 'TERMINAL_BOUTON';
  startPoint: [number, number, number];
  endPoint: [number, number, number];
  diameterMicrons: number;
  parentSegmentId?: string;
  evidence: EvidenceStatus;
}

export interface NeuronBiophysicalState {
  membranePotentialMv: number;   // V_m (e.g. -65.0 mV)
  adaptationCurrentPa: number;   // w (adaptation variable)
  isSpiking: boolean;            // Action potential emitted this tick
  refractoryTimerMs: number;     // Remaining absolute refractory duration
  spikeHistory: number[];        // Recent spike timestamps (s)
  rateActivation: number;        // Normalized continuous rate [0.0 to 1.0]
}

export interface ComputationalNeuron {
  neuronId: string;              // Globally unique ID, e.g. "AL-ORN-L-001"
  brainId: string;               // Owning brain instance identifier
  regionId: NeuropilRegionId;    // Neuropil anatomical region
  subregionId: string;           // E.g. "GLOMERULUS-T6-01", "EB-WEDGE-04", "MBON-APPETITIVE"
  cellType: string;              // Descriptive cell type, e.g. "Olfactory Receptor Neuron", "Kenyon Cell"
  neuronClass: NeuronClass;      // Computational taxonomy class
  position3D: [number, number, number]; // [x, y, z] in micrometers / normalized brain coordinates
  morphologyLabel: 'MEASURED_TRACE' | 'MODELLED_MORPHOLOGY';
  morphology?: MorphologicalSegment[];
  polarity: 'BIPOLAR' | 'UNIPOLAR' | 'MULTIPOLAR';
  inputRoles: string[];          // E.g. ["PHEROMONE_RECEPTION", "OCTOPAMINERGIC_MODULATION"]
  outputRoles: string[];         // E.g. ["PROJECTION_TO_CALYX", "THORACIC_STEERING_INHIBITION"]
  
  // Dynamics & Biophysical Specification
  activationModel: ActivationModelType;
  stateVariables: NeuronBiophysicalState;
  
  // Core Parameters
  restingPotentialMv: number;    // E.g. -65.0 mV
  resetPotentialMv: number;      // E.g. -70.0 mV
  thresholdMv: number;           // E.g. -45.0 mV
  bias: number;                  // Steady-state excitability bias
  membraneTimeConstantMs: number;// tau_m (e.g. 15.0 ms)
  adaptationTimeConstantMs: number;// tau_w (e.g. 120.0 ms)
  adaptationCoupling: number;    // Adaptation strength (pA/mV)
  refractoryPeriodMs: number;    // Absolute refractory time (e.g. 2.0 ms)
  noiseStdDev: number;           // Stochastic membrane fluctuation intensity
  
  // Plasticity & Trainability
  parameterCategory: ParameterCategory;
  plasticityRate: number;        // Learning rate scaling
  
  // Provenance & Scientific Classification
  developmentalMetadata: {
    origin: 'EMBRYONIC_DEFAULT' | 'PROCEDURAL_SYNTHESIS' | 'RECONSTRUCTION';
    lineage?: string;
  };
  biologicalStatus: EvidenceStatus;
  source: {
    citation: string;
    doi?: string;
    notes?: string;
  };
}

export interface ComputationalSynapse {
  synapseId: string;             // Globally unique ID, e.g. "SYN-AL001-MB042"
  preNeuronId: string;           // Presynaptic endpoint
  postNeuronId: string;          // Postsynaptic endpoint
  weight: number;                // Synaptic efficacy [-1.0 to 1.0] (or conductance in nS)
  delayMs: number;               // Axonal + synaptic transmission latency (e.g. 1.0 to 4.0 ms)
  sign: 1 | -1;                  // +1 = Excitatory, -1 = Inhibitory
  synapseType: 'EXCITATORY' | 'INHIBITORY' | 'MODULATORY' | 'ELECTRICAL';
  neurotransmitter: NeurotransmitterType;
  receptors: string[];           // E.g. ["nAChR"], ["GABA_A"], ["OctR"], ["Dop1R"]
  plasticityRule: 'THREE_FACTOR_STDP' | 'HEBBIAN' | 'STATIC' | 'REINFORCEMENT_TRACE';
  plasticityParameters: {
    learningRate: number;
    eligibilityDecayMs: number;
    weightMin: number;
    weightMax: number;
  };
  eligibilityTrace: number;      // Tagged synapse trace awaiting neuromodulatory reward/punishment
  enabled: boolean;              // Functional toggle for ablation / pruning
  regionId: NeuropilRegionId;
  parameterCategory: ParameterCategory;
  biologicalStatus: EvidenceStatus;
  source: {
    citation: string;
    doi?: string;
  };
}
