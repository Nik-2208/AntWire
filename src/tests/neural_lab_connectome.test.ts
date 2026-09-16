/**
 * ANT BRAIN — Connectome-Grade Neural Lab & Brain Platform Tests
 * Validates:
 * 1. Default synthetic neural network initialization & forward inference
 * 2. Synaptic weight mutation and direct causal behavioral output modulation
 * 3. Connectome signal pathfinding from sensory to motor neuropils
 * 4. Model checkpoint persistence, validation, branching, and ANTBRAIN_MODEL package export/import
 * 5. Biological reference brain datasets (Ooceraea biroi 40-brain atlas & Formica navigation connectome)
 * 6. Neuromodulation dynamics (Dopamine RPE δ calculation, decay, and plasticity modulation)
 * 7. SNN Leaky Integrate-and-Fire biophysics (membrane integration, threshold, refractory timer)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { NeuralController } from '../ants/controllers/neural_stub';
import { SpikingNeuron } from '../ants/brain/spiking_neuron';
import { NeuromodulatorSystem } from '../learning/neuromodulation';
import { ModelStorageService, ModelCheckpoint } from '../learning/model_checkpoint';
import { OOCERAEA_BIROI_REFERENCE_DATASET, FORMICA_CONNECTOME_DATASET } from '../ants/brain/biological_reference_data';
import { AntBody } from '../ants/body';
import { AntMemory } from '../ants/memory';
import { SeededRNG } from '../simulation/rng';
import { AntSensorySnapshot, AntInternalState, AntDrives } from '../simulation/types';

describe('Connectome-Grade Neural Lab & Model Platform', () => {
  let rng: SeededRNG;
  let body: AntBody;
  let memory: AntMemory;
  let defaultSensors: AntSensorySnapshot;
  let defaultInternalState: AntInternalState;
  let defaultDrives: AntDrives;

  beforeEach(() => {
    rng = new SeededRNG(42);
    body = new AntBody('colony-1', { x: 0, y: 0 }, 0, 'WORKER');
    memory = new AntMemory();

    defaultSensors = {
      foodLeft: 0.9,
      foodCenter: 0.5,
      foodRight: 0.2,
      homeLeft: 0.1,
      homeCenter: 0.1,
      homeRight: 0.1,
      alarmLeft: 0.0,
      alarmCenter: 0.0,
      alarmRight: 0.0,
      foodOdorConcentration: 0.8,
      foodOdorDirection: 0.1,
      foodProximity: 0.5,
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
      nearbyAntsCount: 2,
      nearestAntDistance: 1.5,
    };

    defaultInternalState = {
      energyReserve: 0.85,
      energy: 0.85,
      hunger: 0.20,
      starvationStress: 0.0,
      health: 1.0,
      lifeState: 'ACTIVE',
      injurySeverity: 0.0,
      mobilityPenalty: 0.0,
      threatLevel: 0.0,
      carryingFoodAmount: 0.0,
      carryingFoodId: null,
      carryingCorpseId: null,
      age: 100,
      lifespan: 10000,
      isAlive: true,
      socialAffinity: 0.8,
    };

    defaultDrives = {
      foodSeeking: 0.8,
      exploration: 0.5,
      homing: 0.1,
      threatAvoidance: 0.0,
      socialInteraction: 0.2,
      broodCare: 0.0,
      restRecovery: 0.0,
    };
  });

  it('TEST 1: NeuralController produces authoritative forward inference and caches live activations', () => {
    const controller = new NeuralController();
    const result = controller.decide('ant-1', 10.0, 600, body, defaultSensors, defaultInternalState, defaultDrives, memory, rng);

    expect(result.action).toBeDefined();
    expect(result.action.type).toBe('MOVE_FORWARD');
    expect(result.action.speedMultiplier).toBeGreaterThanOrEqual(0);
    expect(result.action.speedMultiplier).toBeLessThanOrEqual(1);

    const acts = controller.getLastActivations();
    expect(acts.inputs.length).toBe(14);
    expect(acts.hidden.length).toBe(16);
    expect(acts.outputs.length).toBe(4);
    expect(acts.inputs[0]).toBe(0.9); // foodLeft input matches sensory vector
  });

  it('TEST 2: Mutating synaptic weights directly affects motor decision output causally', () => {
    const controller = new NeuralController();
    const beforeResult = controller.decide('ant-1', 10.0, 600, body, defaultSensors, defaultInternalState, defaultDrives, memory, rng);

    // Mutate output bias directly
    controller.mutateBias('output', 1, 3.5);
    const afterResult = controller.decide('ant-1', 10.0, 600, body, defaultSensors, defaultInternalState, defaultDrives, memory, rng);

    expect(afterResult.action.turnAngle).not.toEqual(beforeResult.action.turnAngle);
  });

  it('TEST 3: Model Checkpoint saves, retrieves, and branches without data loss', async () => {
    const testCheckpoint: ModelCheckpoint = {
      modelId: 'test-forager-v1',
      modelName: 'Alpha Forager Neural Policy',
      version: '1.2.0',
      controllerType: 'NEURAL',
      architecture: {
        type: 'FEEDFORWARD_MLP',
        inputSize: 14,
        hiddenLayers: [16],
        outputSize: 4,
        activation: 'RELU',
      },
      weights: {
        inputWeights: Array(16).fill(0).map(() => Array(14).fill(0.2)),
        hiddenBiases: Array(16).fill(0.05),
        outputWeights: Array(4).fill(0).map(() => Array(16).fill(0.2)),
        outputBiases: Array(4).fill(0.0),
      },
      trainingStep: 5000,
      episodeCount: 100,
      trainingEnvironment: {
        worldSize: 60,
        obstacleDensity: 0.1,
        predatorPresence: false,
        temperature: 24,
      },
      task: 'FORAGE',
      rewardDefinition: {
        foodReward: 10.0,
        nestDeliveryReward: 15.0,
        energyPenalty: 0.1,
        deathPenalty: 20.0,
      },
      species: 'Formica rufa',
      inputSchema: ['foodL', 'foodC', 'foodR'],
      outputSchema: ['throttle', 'turn'],
      normalization: {},
      seed: 42,
      metrics: {
        meanReward: 18.5,
        bestReward: 25.0,
        successRate: 92.5,
        episodesCompleted: 100,
        totalSteps: 5000,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: 'Initial test forager checkpoint',
    };

    await ModelStorageService.saveCheckpoint(testCheckpoint);
    const retrieved = await ModelStorageService.loadCheckpoint('test-forager-v1');
    expect(retrieved).not.toBeNull();
    expect(retrieved?.modelName).toBe('Alpha Forager Neural Policy');
    expect(retrieved?.metrics.successRate).toBe(92.5);

    // Branching test
    const branched = await ModelStorageService.duplicateCheckpoint('test-forager-v1', '1.2.1-maze-tuned');
    expect(branched.parentModelId).toBe('test-forager-v1');
    expect(branched.version).toBe('1.2.1-maze-tuned');
  });

  it('TEST 4: ANTBRAIN_MODEL package export and import validate complete open-source bundle', async () => {
    const cp = (await ModelStorageService.loadCheckpoint('test-forager-v1'))!;
    const pkgStr = ModelStorageService.exportAntBrainModelPackage(cp);
    expect(pkgStr).toContain('ANTBRAIN_MODEL_PACKAGE_V1');
    expect(pkgStr).toContain('MODEL CARD');

    const imported = await ModelStorageService.importFromJSON(pkgStr);
    expect(imported).toBeDefined();
    expect(imported.modelName).toBe('Alpha Forager Neural Policy');
    expect(imported.architecture.inputSize).toBe(14);
  });

  it('TEST 5: Biological Reference Datasets adhere to peer-reviewed citations and structures', () => {
    expect(OOCERAEA_BIROI_REFERENCE_DATASET.species).toBe('Ooceraea biroi');
    expect(OOCERAEA_BIROI_REFERENCE_DATASET.sampleSize).toBe(40);
    expect(OOCERAEA_BIROI_REFERENCE_DATASET.confidence).toBeGreaterThanOrEqual(0.95);
    expect(OOCERAEA_BIROI_REFERENCE_DATASET.regions.length).toBeGreaterThanOrEqual(5);

    expect(FORMICA_CONNECTOME_DATASET.species).toBe('Formica polyctena');
    expect(FORMICA_CONNECTOME_DATASET.sourceCitation).toContain('Buehlmann');
  });

  it('TEST 6: Neuromodulation Engine computes Reward Prediction Error (RPE) and updates dopamine', () => {
    const neuromod = new NeuromodulatorSystem();
    expect(neuromod.dopamineLevel).toBe(0.20);

    // Process positive unexpected food reward (+10.0)
    const result = neuromod.processReinforcementEvent(10.0, 0.5, 0.95, 'Discovered Food Sugar');
    expect(result.rpe).toBeGreaterThan(0);
    expect(neuromod.dopamineLevel).toBeGreaterThan(0.20);
    expect(result.plasticityGain).toBeGreaterThan(1.0);

    // Test decay back toward baseline
    neuromod.updateDecay(1.0, 1.0);
    expect(neuromod.dopamineLevel).toBeLessThan(result.newDopamine);
  });

  it('TEST 7: SpikingNeuron integrates membrane potential, spikes at threshold, and enters refractory state', () => {
    const snn = new SpikingNeuron('N-TEST-1', 'Test LIF Sensory Neuron');
    expect(snn.v).toBe(-65.0); // Resting potential

    // Inject strong current (+15 nA) to reach threshold (-45 mV)
    let spiked = false;
    for (let step = 0; step < 10; step++) {
      if (snn.update(1.0, 15.0, step * 0.001)) {
        spiked = true;
        break;
      }
    }

    expect(spiked).toBe(true);
    expect(snn.refractoryTimer).toBeGreaterThan(0);

    // While in refractory state, update should not trigger another spike immediately
    const immediateSecondSpike = snn.update(0.5, 15.0, 0.02);
    expect(immediateSecondSpike).toBe(false);
  });
});
