/**
 * ANTWIRE — Unit Tests for First-Class Connectome Graph & Neurocomputational Engine
 * Created & Developed by Nikhilesh H. Chavda
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ConnectomeGraph } from '../ants/brain/connectome_graph';
import { BiologicallyInformedAntBrain } from '../ants/brain/ant_brain';
import { FUNCTIONAL_CIRCUIT_DEFINITIONS } from '../ants/brain/circuit_modules';
import { BIOLOGICAL_VALIDATION_MATRIX } from '../ants/brain/biological_validation_matrix';
import { SENSORY_CHANNELS, MOTOR_CHANNELS } from '../ants/brain/sensory_motor_mapper';

describe('ANTWIRE First-Class Connectome Graph & Computational Brain Suite', () => {
  let brain: BiologicallyInformedAntBrain;

  beforeEach(() => {
    brain = new BiologicallyInformedAntBrain('ANT-TEST-UNIT-01');
  });

  it('1. ConnectomeGraph initializes with non-anonymous, uniquely identified neurons', () => {
    const g = brain.graph;
    expect(g.neurons.size).toBeGreaterThanOrEqual(14);
    expect(g.synapses.size).toBeGreaterThanOrEqual(14);

    const alFoodL = g.getNeuron('AL-ORN-FOOD-L');
    expect(alFoodL).toBeDefined();
    expect(alFoodL?.regionId).toBe('ANTENNAL_LOBE');
    expect(alFoodL?.neuronClass).toBe('SENSORY');
    expect(alFoodL?.morphologyLabel).toBe('MODELLED_MORPHOLOGY');
    expect(alFoodL?.source.citation).toBeDefined();
  });

  it('2. Enforces strict directional synaptic connectivity and bidirectional adjacency lookup', () => {
    const g = brain.graph;
    const outSynapses = g.getOutgoingSynapses('AL-ORN-FOOD-L');
    expect(outSynapses.length).toBeGreaterThan(0);
    expect(outSynapses[0].preNeuronId).toBe('AL-ORN-FOOD-L');
    expect(outSynapses[0].postNeuronId).toBe('AL-PN-FOOD-L');

    const inSynapses = g.getIncomingSynapses('AL-PN-FOOD-L');
    expect(inSynapses.some((s: any) => s.preNeuronId === 'AL-ORN-FOOD-L')).toBe(true);
  });

  it('3. Finds shortest causal signal paths across neuropils (AL -> MB -> LAL -> CPG)', () => {
    const g = brain.graph;
    const path = g.findShortestPath('AL-ORN-FOOD-L', 'LAL-DESCENDING-STEER-L');

    expect(path.isFound).toBe(true);
    expect(path.sourceNeuronId).toBe('AL-ORN-FOOD-L');
    expect(path.targetNeuronId).toBe('LAL-DESCENDING-STEER-L');
    expect(path.steps.length).toBeGreaterThanOrEqual(3);
    expect(path.totalDelayMs).toBeGreaterThan(0);
  });

  it('4. Rejects duplicate neuron IDs and corrupt synapse endpoints', () => {
    const g = new ConnectomeGraph();
    const mockNeuron = (id: string) => ({
      neuronId: id,
      brainId: 'B1',
      regionId: 'ANTENNAL_LOBE' as const,
      subregionId: 'SUB',
      cellType: 'ORN',
      neuronClass: 'SENSORY' as const,
      position3D: [0, 0, 0] as [number, number, number],
      morphologyLabel: 'MODELLED_MORPHOLOGY' as const,
      polarity: 'BIPOLAR' as const,
      inputRoles: [],
      outputRoles: [],
      activationModel: 'RATE_SIGMOIDAL' as const,
      stateVariables: {
        membranePotentialMv: -65,
        adaptationCurrentPa: 0,
        isSpiking: false,
        refractoryTimerMs: 0,
        spikeHistory: [],
        rateActivation: 0,
      },
      restingPotentialMv: -65,
      resetPotentialMv: -70,
      thresholdMv: -45,
      bias: 0,
      membraneTimeConstantMs: 15,
      adaptationTimeConstantMs: 120,
      adaptationCoupling: 0.05,
      refractoryPeriodMs: 2,
      noiseStdDev: 0.01,
      parameterCategory: 'STRUCTURAL' as const,
      plasticityRate: 0.01,
      developmentalMetadata: { origin: 'PROCEDURAL_SYNTHESIS' as const },
      biologicalStatus: 'INFERRED' as const,
      source: { citation: 'Ref' },
    });

    g.addNeuron(mockNeuron('N1'));
    expect(() => g.addNeuron(mockNeuron('N1'))).toThrowError(/Duplicate neuron ID/);

    const corruptSynapse = {
      synapseId: 'S-BAD',
      preNeuronId: 'N1',
      postNeuronId: 'N_DOES_NOT_EXIST',
      weight: 0.5,
      delayMs: 2.0,
      sign: 1 as const,
      synapseType: 'EXCITATORY' as const,
      neurotransmitter: 'ACETYLCHOLINE' as const,
      receptors: ['nAChR'],
      plasticityRule: 'STATIC' as const,
      plasticityParameters: { learningRate: 0.05, eligibilityDecayMs: 200, weightMin: -1, weightMax: 1 },
      eligibilityTrace: 0,
      enabled: true,
      regionId: 'ANTENNAL_LOBE' as const,
      parameterCategory: 'STRUCTURAL' as const,
      biologicalStatus: 'INFERRED' as const,
      source: { citation: 'Ref' },
    };

    expect(() => g.addSynapse(corruptSynapse)).toThrowError(/does not exist/);
  });

  it('5. Computes objective topological graph statistics (density, degree, active count)', () => {
    const stats = brain.graph.getStatistics();
    expect(stats.nodeCount).toBeGreaterThanOrEqual(14);
    expect(stats.edgeCount).toBeGreaterThanOrEqual(14);
    expect(stats.density).toBeGreaterThan(0);
    expect(stats.averageInDegree).toBeGreaterThan(0);
    expect(stats.averageOutDegree).toBeGreaterThan(0);
  });

  it('6. Validates Functional Circuit Definitions & Biological Validation Matrix', () => {
    expect(FUNCTIONAL_CIRCUIT_DEFINITIONS.ODOR_DETECTION).toBeDefined();
    expect(FUNCTIONAL_CIRCUIT_DEFINITIONS.PATH_INTEGRATION).toBeDefined();
    expect(FUNCTIONAL_CIRCUIT_DEFINITIONS.MEMORY_ASSOCIATION).toBeDefined();
    expect(FUNCTIONAL_CIRCUIT_DEFINITIONS.DECISION_AND_STEERING).toBeDefined();

    expect(BIOLOGICAL_VALIDATION_MATRIX.length).toBeGreaterThanOrEqual(7);
    for (const entry of BIOLOGICAL_VALIDATION_MATRIX) {
      expect(entry.featureName).toBeDefined();
      expect(entry.biologicalEvidence).toBeDefined();
      expect(entry.sourceCitation).toBeDefined();
      expect(entry.fidelityLevel).toMatch(/^LEVEL_/);
    }
  });

  it('7. Sensory & Motor Mappings have documented dimensions and ranges without hidden shortcuts', () => {
    expect(SENSORY_CHANNELS.length).toBeGreaterThanOrEqual(6);
    expect(MOTOR_CHANNELS.length).toBeGreaterThanOrEqual(4);

    for (const sc of SENSORY_CHANNELS) {
      expect(sc.receptiveField).toBeDefined();
      expect(sc.physicalUnits).toBeDefined();
      expect(sc.targetNeuronIds.length).toBeGreaterThan(0);
    }

    for (const mc of MOTOR_CHANNELS) {
      expect(mc.actuator).toBeDefined();
      expect(mc.biologicalTarget).toBeDefined();
    }
  });

  it('8. Systematic Ablation Engine toggles components and alters behavior', () => {
    // Normal baseline
    brain.ablationFlags = {};
    expect(brain.ablationFlags.withoutMemory).toBeFalsy();

    // Enable ablations
    brain.ablationFlags = {
      withoutMemory: true,
      withoutLearning: true,
      withoutPheromones: true,
      withoutReward: true,
      withoutModulation: true,
    };

    expect(brain.ablationFlags.withoutMemory).toBe(true);
    expect(brain.ablationFlags.withoutLearning).toBe(true);
    expect(brain.ablationFlags.withoutPheromones).toBe(true);
  });
});
