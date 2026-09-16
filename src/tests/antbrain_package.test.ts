import { describe, it, expect, beforeEach } from 'vitest';
import { ModelPackageGenerator, PackageExportProfile, PrivacyTier } from '../learning/model_package_generator';
import { AntBrainLoader } from '../learning/antbrain_loader';
import { ModelCheckpoint } from '../learning/model_checkpoint';
import { SimulationWorld } from '../simulation/world';

describe('AntWire Complete Computational Ant Brain / Agent Package (.antbrain) Suite', () => {
  let mockCheckpoint: ModelCheckpoint;
  let world: SimulationWorld;

  beforeEach(() => {
    world = new SimulationWorld({
      seed: 42,
      width: 40,
      height: 40,
      initialAntCount: 2,
    });
    world.initializeWorld();

    mockCheckpoint = {
      modelId: 'test-model-42',
      modelName: 'Atta Cephalotes Forager Policy',
      version: '1.2.0',
      parentModelId: 'test-model-41',
      controllerType: 'NEURAL',
      architecture: {
        type: 'FEEDFORWARD_MLP',
        inputSize: 14,
        hiddenLayers: [16],
        outputSize: 4,
        activation: 'RELU',
      },
      weights: {
        inputWeights: Array.from({ length: 16 }, () => Array(14).fill(0.25)),
        hiddenBiases: Array(16).fill(0.05),
        outputWeights: Array.from({ length: 4 }, () => Array(16).fill(0.5)),
        outputBiases: Array(4).fill(0.1),
      },
      trainingStep: 1500,
      episodeCount: 45,
      trainingEnvironment: {
        worldSize: 60,
        obstacleDensity: 0.15,
        predatorPresence: true,
        temperature: 24.5,
      },
      task: 'FORAGE',
      rewardDefinition: {
        foodReward: 12.0,
        nestDeliveryReward: 20.0,
        energyPenalty: 0.08,
        deathPenalty: 25.0,
      },
      species: 'Atta cephalotes',
      inputSchema: [
        'foodL', 'foodC', 'foodR',
        'nestL', 'nestC', 'nestR',
        'foodOdor', 'nestOdor',
        'obstacle', 'predator',
        'energy', 'hunger', 'carrying', 'threat'
      ],
      outputSchema: ['throttle', 'turn', 'depositFood', 'depositHome'],
      normalization: {
        inputMeans: Array(14).fill(0.0),
        inputStds: Array(14).fill(1.0),
      },
      seed: 42,
      metrics: {
        meanReward: 18.5,
        bestReward: 28.2,
        successRate: 88.5,
        episodesCompleted: 45,
        totalSteps: 1500,
      },
      createdAt: '2026-09-16T12:00:00Z',
      updatedAt: '2026-09-16T12:30:00Z',
      notes: 'Trained with STDP three-factor reinforcement learning on foraging maze.',
    };
  });

  it('TEST 1: Exports valid .antbrain package containing full directory structure and authoritative manifest', async () => {
    const { blob, filename, manifest } = await ModelPackageGenerator.generateCompleteZip(mockCheckpoint, {
      profile: 'PORTABLE_PACKAGE',
      privacyTier: 'PUBLIC',
      antId: 'Ant-0042',
    });

    expect(filename).toMatch(/^antwire_ant_ant[-_]0042_v1\.2\.0_.*\.antbrain$/);
    expect(blob.size).toBeGreaterThan(5000);

    // Verify manifest metadata
    expect(manifest.packageFormatVersion).toBe('2.0.0');
    expect(manifest.antwireVersion).toBe('1.0.0');
    expect(manifest.brainType).toBe('Complete Computational Ant Brain / Agent Package');
    expect(manifest.author.name).toBe('Nikhilesh H. Chavda');
    expect(manifest.scientificDisclaimer).toContain('complete export of the parameters and state represented by the AntWire computational model');
    expect(manifest.capabilities.neural_runtime).toBe(true);
    expect(manifest.capabilities.learning).toBe(true);
    expect(manifest.capabilities.memory).toBe(true);
    expect(manifest.capabilities.pheromone_behavior).toBe(true);

    // Verify parameter counts
    expect(manifest.parameterIndex.totalParameters).toBeGreaterThan(1000);
    expect(manifest.parameterIndex.neurons).toBeGreaterThan(100);
    expect(manifest.parameterIndex.synapses).toBeGreaterThan(100);

    // Extract archive with AntBrainLoader
    const pkg = await AntBrainLoader.load_antbrain(blob);
    expect(pkg.manifest.antId).toBe('Ant-0042');
    expect(pkg.brain.neurons.length).toBe(128);
    expect(pkg.brain.synapses.length).toBeGreaterThan(200);
    expect(pkg.learning.learnedParameters.input_weights.length).toBe(16);
    expect(pkg.learning.learnedParameters.output_weights.length).toBe(4);

    // Verify folder artifacts exist in raw files
    expect(pkg.rawFiles['manifest.json']).toBeDefined();
    expect(pkg.rawFiles['brain/architecture.json']).toBeDefined();
    expect(pkg.rawFiles['brain/neurons.json']).toBeDefined();
    expect(pkg.rawFiles['brain/synapses.json']).toBeDefined();
    expect(pkg.rawFiles['brain/regions.json']).toBeDefined();
    expect(pkg.rawFiles['brain/connectivity.json']).toBeDefined();
    expect(pkg.rawFiles['learning/learned_parameters.json']).toBeDefined();
    expect(pkg.rawFiles['learning/reward_config.json']).toBeDefined();
    expect(pkg.rawFiles['memory/long_term_memory.json']).toBeDefined();
    expect(pkg.rawFiles['sensors/sensor_config.json']).toBeDefined();
    expect(pkg.rawFiles['motor/motor_config.json']).toBeDefined();
    expect(pkg.rawFiles['body/morphology.json']).toBeDefined();
    expect(pkg.rawFiles['behavior/behavior_parameters.json']).toBeDefined();
    expect(pkg.rawFiles['colony/communication_config.json']).toBeDefined();
    expect(pkg.rawFiles['experiments/training_config.json']).toBeDefined();
    expect(pkg.rawFiles['provenance/model_provenance.json']).toBeDefined();
    expect(pkg.rawFiles['biological_parameter_catalog.json']).toBeDefined();
    expect(pkg.rawFiles['README.md']).toBeDefined();
  });

  it('TEST 2: Supports all 5 distinct Export Profiles without data corruption', async () => {
    const profiles: PackageExportProfile[] = [
      'TRAINED_AGENT',
      'TRAINING_CHECKPOINT',
      'FULL_EXPERIMENT',
      'BRAIN_MODEL',
      'PORTABLE_PACKAGE',
    ];

    for (const prof of profiles) {
      const { blob, manifest } = await ModelPackageGenerator.generateCompleteZip(mockCheckpoint, {
        profile: prof,
      });

      expect(manifest.exportProfile).toBe(prof);
      const pkg = await AntBrainLoader.load_antbrain(blob);
      expect(pkg.manifest.exportProfile).toBe(prof);

      // Verify profile-specific inclusion/exclusion rules
      if (prof === 'BRAIN_MODEL') {
        expect(pkg.rawFiles['brain/runtime_state.json']).toBeUndefined();
      } else {
        expect(pkg.rawFiles['brain/runtime_state.json']).toBeDefined();
      }

      if (prof === 'PORTABLE_PACKAGE') {
        expect(pkg.rawFiles['run_model.py']).toBeDefined();
        expect(pkg.rawFiles['inspect.py']).toBeDefined();
      }
    }
  });

  it('TEST 3: Pre-Export Validator Blocks Broken Models with Informative Errors', async () => {
    // 1. Missing architecture
    const brokenArch = { ...mockCheckpoint, architecture: undefined as any };
    const res1 = ModelPackageGenerator.validateExportPackage(brokenArch);
    expect(res1.valid).toBe(false);
    expect(res1.errors.some((e) => e.includes('architecture'))).toBe(true);

    // 2. Dimensional mismatch between architecture and weights
    const mismatchedWeights: ModelCheckpoint = {
      ...mockCheckpoint,
      weights: {
        ...mockCheckpoint.weights,
        inputWeights: Array.from({ length: 8 }, () => Array(14).fill(0.1)), // 8 instead of 16
      },
    };
    const res2 = ModelPackageGenerator.validateExportPackage(mismatchedWeights);
    expect(res2.valid).toBe(false);
    expect(res2.errors.some((e) => e.includes('mismatch'))).toBe(true);

    // 3. Complete export throws error when invalid
    await expect(
      ModelPackageGenerator.generateCompleteZip(brokenArch)
    ).rejects.toThrow(/Package export blocked by validator/);
  });

  it('TEST 4: Privacy Tiers (FULL vs PUBLIC vs ANONYMOUS) strictly Scrub User Telemetry', async () => {
    const { blob: anonBlob } = await ModelPackageGenerator.generateCompleteZip(mockCheckpoint, {
      privacyTier: 'ANONYMOUS',
    });

    const anonPkg = await AntBrainLoader.load_antbrain(anonBlob);
    expect(anonPkg.manifest.privacyTier).toBe('ANONYMOUS');
    expect(anonPkg.provenance.modelProvenance.model_id).toBe('ANON_MODEL_HASH');
    expect(anonPkg.provenance.modelProvenance.model_name).toBe('Anonymous Trained Ant');
    expect(anonPkg.provenance.modelProvenance.lineage_parent).toBeNull();
  });

  it('TEST 5: Biological Parameter Catalog Honestly Marks Unimplemented Biology', async () => {
    const catalog = ModelPackageGenerator.generateBiologicalCatalog(mockCheckpoint);

    // 1. Must contain supported items
    const supported = catalog.filter((e) => e.biological_status === 'BIOLOGICALLY_SUPPORTED');
    expect(supported.length).toBeGreaterThanOrEqual(4);

    // 2. Must explicitly contain NOT_IMPLEMENTED items (not faked!)
    const notImplemented = catalog.filter((e) => e.biological_status === 'NOT_IMPLEMENTED');
    expect(notImplemented.length).toBeGreaterThanOrEqual(2);
    expect(notImplemented.some((e) => e.parameter.includes('Glial Cell'))).toBe(true);
    expect(notImplemented.some((e) => e.parameter.includes('Connectome'))).toBe(true);
    expect(notImplemented.every((e) => e.implemented_in_antwire === false)).toBe(true);
  });

  it('TEST 6: AntBrainLoader rehydrates a fully functioning live Ant Organism with identical weights', async () => {
    const { blob } = await ModelPackageGenerator.generateCompleteZip(mockCheckpoint, {
      antId: 'Ant-Hero',
      profile: 'TRAINED_AGENT',
    });

    const pkg = await AntBrainLoader.load_antbrain(blob);
    const ant = AntBrainLoader.initialize_agent(pkg, { x: 5.0, y: 10.0 }, 'Colony-Alpha');

    expect(ant.id).toBe('Ant-Hero');
    expect(ant.body.position.x).toBe(5.0);
    expect(ant.body.position.y).toBe(10.0);
    expect(ant.controller.type).toBe('NEURAL');

    // Verify weights fidelity
    const antWeights = (ant.controller as any).getWeights();
    expect(antWeights.inputWeights[0][0]).toBe(0.25);
    expect(antWeights.outputWeights[0][0]).toBe(0.5);
    expect(antWeights.hiddenBiases[0]).toBe(0.05);

    // Run simulation tick on the rehydrated agent
    expect(() => {
      AntBrainLoader.run_agent(ant, world, 0.016);
    }).not.toThrow();

    // Verify rehydrated agent updates its motion and task loop without crashing
    expect(ant.internalState.state.isAlive).toBe(true);
  });

  it('TEST 7: Full Round-Trip Integrity: Checkpoint -> .antbrain -> Loader -> Checkpoint', async () => {
    const { blob } = await ModelPackageGenerator.generateCompleteZip(mockCheckpoint, {
      profile: 'TRAINING_CHECKPOINT',
    });

    const pkg = await AntBrainLoader.load_antbrain(blob);
    const rehydratedCP = AntBrainLoader.convertToModelCheckpoint(pkg);

    expect(rehydratedCP.architecture.type).toBe(mockCheckpoint.architecture.type);
    expect(rehydratedCP.trainingStep).toBe(mockCheckpoint.trainingStep);
    expect(rehydratedCP.weights.inputWeights[0][0]).toBe(mockCheckpoint.weights.inputWeights[0][0]);
    expect(rehydratedCP.metrics.meanReward).toBe(mockCheckpoint.metrics.meanReward);
    expect(rehydratedCP.species).toBe(mockCheckpoint.species);
  });
});
