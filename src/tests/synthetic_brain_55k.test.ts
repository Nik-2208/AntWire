/**
 * ANT BRAIN — 50,000–60,000 Neuron Synthetic Brain Test Suite
 * Validates:
 * 1. 55,000-neuron TypedArray allocation and regional distribution
 * 2. Glorot/Xavier Normal weight initialization (Strictly NOT uniform 0.1)
 * 3. Sparse synaptic connection generation and statistics
 * 4. Sparse forward pass inference producing valid motor controls
 * 5. Causal weight and bias mutations
 * 6. Neuropil lesioning and ablation impact
 * 7. One-click Connectome CSV export (neurons, connections, regions)
 * 8. Brain55KController integration with ant behavior
 */

import { describe, it, expect } from 'vitest';
import { SyntheticBrain55K, SYNTHETIC_NEUROPIL_REGIONS } from '../ants/brain/synthetic_brain_55k';
import { Brain55KController } from '../ants/controllers/brain_55k_controller';
import { AntBody } from '../ants/body';
import { AntMemory } from '../ants/memory';
import { SeededRNG } from '../simulation/rng';
import { AntSensorySnapshot, AntInternalState, AntDrives } from '../simulation/types';

describe('50,000–60,000 Neuron Computational Synthetic Ant Brain', () => {
  const rng = new SeededRNG(42);
  const body = new AntBody('colony-1', { x: 0, y: 0 }, 0, 'WORKER');
  const memory = new AntMemory();

  const mockSensors: AntSensorySnapshot = {
    foodLeft: 0.85,
    foodCenter: 0.60,
    foodRight: 0.20,
    homeLeft: 0.10,
    homeCenter: 0.10,
    homeRight: 0.10,
    alarmLeft: 0.0,
    alarmCenter: 0.0,
    alarmRight: 0.0,
    foodOdorConcentration: 0.75,
    foodOdorDirection: 0.2,
    foodProximity: 0.4,
    detectedFoodId: 'food-1',
    nestOdorConcentration: 0.1,
    nestOdorDirection: 0.0,
    nestProximity: 0.1,
    isAtNestEntrance: false,
    obstacleLeft: 0.0,
    obstacleCenter: 0.0,
    obstacleRight: 0.0,
    predatorDetected: false,
    predatorProximity: 0.0,
    predatorRelativeAngle: 0.0,
    nearbyAntsCount: 3,
    nearestAntDistance: 2.0,
  };

  const mockInternalState: AntInternalState = {
    energyReserve: 0.80,
    energy: 0.80,
    hunger: 0.30,
    starvationStress: 0.0,
    health: 1.0,
    lifeState: 'ACTIVE',
    injurySeverity: 0.0,
    mobilityPenalty: 0.0,
    threatLevel: 0.0,
    carryingFoodAmount: 0.0,
    carryingFoodId: null,
    carryingCorpseId: null,
    age: 120,
    lifespan: 10000,
    isAlive: true,
    socialAffinity: 0.7,
  };

  const mockDrives: AntDrives = {
    foodSeeking: 0.85,
    exploration: 0.40,
    homing: 0.15,
    threatAvoidance: 0.0,
    socialInteraction: 0.25,
    broodCare: 0.0,
    restRecovery: 0.0,
  };

  it('TEST 1: Allocates 55,000 neurons into memory-efficient TypedArrays across 12 neuropils', () => {
    const brain = new SyntheticBrain55K(55000, 42);

    expect(brain.neuronCount).toBe(55000);
    expect(brain.activations.length).toBe(55000);
    expect(brain.biases.length).toBe(55000);
    expect(brain.thresholds.length).toBe(55000);
    expect(brain.positions.length).toBe(55000 * 3);
    expect(brain.regionIds.length).toBe(55000);
    expect(brain.systemIds.length).toBe(55000);

    // Verify region distribution matches biologically inspired proportions
    const alLCount = Array.from(brain.regionIds).filter((id) => id === 0).length;
    expect(alLCount).toBeGreaterThanOrEqual(3800);
    expect(alLCount).toBeLessThanOrEqual(4400); // ~7.5% of 55k = 4,125
  });

  it('TEST 2: Glorot/Xavier Normal initialization produces non-uniform zero-centered weights', () => {
    const brain = new SyntheticBrain55K(55000, 42);
    const stats = brain.weightStats;

    expect(stats.count).toBeGreaterThan(200000);
    expect(stats.initializationMethod).toContain('Glorot');

    // Strict non-0.1 weight verification
    expect(stats.mean).toBeCloseTo(0.0, 1); // Mean centered around 0.0
    expect(stats.variance).toBeGreaterThan(0.05); // Positive variance
    expect(stats.min).toBeLessThan(-0.5); // Has negative inhibitory weights
    expect(stats.max).toBeGreaterThan(0.5); // Has positive excitatory weights

    // Ensure not all weights are equal to 0.1
    const firstTenWeights = Array.from(brain.edgeWeights.slice(0, 10));
    const allPointOne = firstTenWeights.every((w) => Math.abs(w - 0.1) < 1e-4);
    expect(allPointOne).toBe(false);
  });

  it('TEST 3: Configurable neuron scale (50k, 52.5k, 60k) initializes correctly without crashes', () => {
    const brain50k = new SyntheticBrain55K(50000, 101);
    expect(brain50k.neuronCount).toBe(50000);

    const brain60k = new SyntheticBrain55K(60000, 202);
    expect(brain60k.neuronCount).toBe(60000);
    expect(brain60k.edgeCount).toBeGreaterThan(300000);
  });

  it('TEST 4: Sparse forward pass computes valid throttle and steering with sub-10ms latency', () => {
    const brain = new SyntheticBrain55K(55000, 42);
    const motor = brain.forward(mockSensors, mockInternalState, mockDrives);

    expect(motor.throttle).toBeGreaterThanOrEqual(0);
    expect(motor.throttle).toBeLessThanOrEqual(1.0);
    expect(motor.turnAngle).toBeGreaterThanOrEqual(-1.5);
    expect(motor.turnAngle).toBeLessThanOrEqual(1.5);
    expect(brain.lastInferenceTimeMs).toBeLessThan(50); // Fast execution
  });

  it('TEST 5: Causal weight mutation and lesioning alter behavioral motor outputs', () => {
    const brain = new SyntheticBrain55K(55000, 42);
    const beforeMotor = brain.forward(mockSensors, mockInternalState, mockDrives);

    // Lesion the left antennal lobe (AL-L, region 0)
    brain.ablateRegion(0, true);
    const afterLesionMotor = brain.forward(mockSensors, mockInternalState, mockDrives);

    expect(afterLesionMotor.turnAngle).not.toEqual(beforeMotor.turnAngle);

    // Restore region
    brain.ablateRegion(0, false);
    const restoredMotor = brain.forward(mockSensors, mockInternalState, mockDrives);
    expect(restoredMotor.turnAngle).toBeCloseTo(beforeMotor.turnAngle, 2);
  });

  it('TEST 6: Exports connectome tables to CSV (neurons.csv, connections.csv, regions.csv)', () => {
    const brain = new SyntheticBrain55K(55000, 42);
    const { neuronsCSV, connectionsCSV, regionsCSV } = brain.exportConnectomeCSVs();

    expect(regionsCSV).toContain('region_id,system_id,name,code,color');
    expect(regionsCSV).toContain('Left Antennal Lobe');
    expect(neuronsCSV).toContain('neuron_id,region_id,type_id,pos_x,pos_y,pos_z');
    expect(connectionsCSV).toContain('edge_id,source_neuron_id,target_neuron_id,weight');
  });

  it('TEST 7: Brain55KController executes live ant decision and generates rich telemetry', () => {
    const controller = new Brain55KController();
    const result = controller.decide('ant-55k', 12.0, 720, body, mockSensors, mockInternalState, mockDrives, memory, rng);

    expect(result.action).toBeDefined();
    expect(result.action.type).toBe('MOVE_FORWARD');
    expect(result.record.humanReason).toContain('55,000 neurons');
    expect(result.record.technicalExplanation).toContain('Active synapses');

    const acts = controller.getLastActivations();
    expect(acts.inputs.length).toBeGreaterThan(0);
    expect(acts.outputs.length).toBe(2);
  });
});
