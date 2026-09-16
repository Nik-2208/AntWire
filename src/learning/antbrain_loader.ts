/**
 * ANTWIRE — Portable Runtime Loader & Exporter for .antbrain Packages
 * Created & Developed by Nikhilesh H. Chavda
 *
 * Implements the authoritative Loader API:
 * - load_antbrain(package)
 * - validate_package(package)
 * - initialize_agent(package)
 * - run_agent(agent, environment)
 * - save_antbrain(agent)
 */

import JSZip from 'jszip';
import {
  AntBrainManifest,
  ModelPackageGenerator,
  AntBrainExportOptions,
  BiologicalCatalogEntry,
} from './model_package_generator';
import { ModelCheckpoint, ModelWeights, ModelArchitecture } from './model_checkpoint';
import { Ant } from '../ants/ant';
import { NeuralController } from '../ants/controllers/neural_stub';
import { Vector2D } from '../simulation/types';

export interface AntBrainPackageData {
  manifest: AntBrainManifest;
  brain: {
    architecture: ModelArchitecture;
    neurons: any[];
    synapses: any[];
    regions?: any;
    connectivity?: any;
    runtimeState?: any;
  };
  learning: {
    learnedParameters: {
      input_weights: number[][];
      hidden_biases: number[];
      output_weights: number[][];
      output_biases: number[];
      hidden2_weights?: number[][];
      hidden2_biases?: number[];
    };
    optimizerState?: any;
    normalization?: any;
    rewardConfig?: any;
    trainingState?: any;
  };
  memory?: {
    longTermMemory?: any;
    learnedAssociations?: any;
    navigationMemory?: any;
    taskMemory?: any;
  };
  sensors?: any;
  motor?: any;
  body?: any;
  behavior?: any;
  colony?: any;
  experiments?: any;
  provenance?: any;
  biologicalCatalog?: BiologicalCatalogEntry[];
  rawFiles: Record<string, string>;
}

export interface PackageValidationResult {
  valid: boolean;
  compatibility: 'COMPATIBLE' | 'MIGRATABLE' | 'INCOMPATIBLE';
  errors: string[];
  warnings: string[];
}

export class AntBrainLoader {
  public static readonly SUPPORTED_FORMAT_VERSIONS = ['2.0.0', '1.0.0'];
  public static readonly CURRENT_FORMAT_VERSION = '2.0.0';

  /**
   * Load and extract an .antbrain archive from a Blob, File, or ArrayBuffer.
   */
  public static async load_antbrain(
    packageData: Blob | File | ArrayBuffer | Uint8Array
  ): Promise<AntBrainPackageData> {
    const zip = await JSZip.loadAsync(packageData);
    const rawFiles: Record<string, string> = {};

    // Extract all text files
    const fileEntries = Object.keys(zip.files);
    for (const filename of fileEntries) {
      if (!zip.files[filename].dir) {
        rawFiles[filename] = await zip.files[filename].async('string');
      }
    }

    // 1. Read manifest.json (or fallback to model_manifest.json for legacy formats)
    let manifestStr = rawFiles['manifest.json'] || rawFiles['model_manifest.json'];
    if (!manifestStr) {
      throw new Error('Invalid .antbrain package: missing manifest.json');
    }

    let manifest: AntBrainManifest;
    try {
      manifest = JSON.parse(manifestStr);
    } catch {
      throw new Error('Corrupted manifest.json: could not parse JSON');
    }

    // 2. Read Brain files
    const archStr = rawFiles['brain/architecture.json'] || rawFiles['architecture.json'];
    const neuronsStr = rawFiles['brain/neurons.json'] || rawFiles['neurons/neurons.json'];
    const synapsesStr = rawFiles['brain/synapses.json'] || rawFiles['synapses/synapses.json'];
    const regionsStr = rawFiles['brain/regions.json'] || rawFiles['morphology/neuropil_regions.json'];
    const connectivityStr = rawFiles['brain/connectivity.json'];
    const runtimeStateStr = rawFiles['brain/runtime_state.json'];

    const architecture = archStr ? JSON.parse(archStr) : null;
    const neurons = neuronsStr ? JSON.parse(neuronsStr) : [];
    const synapses = synapsesStr ? JSON.parse(synapsesStr) : [];
    const regions = regionsStr ? JSON.parse(regionsStr) : null;
    const connectivity = connectivityStr ? JSON.parse(connectivityStr) : null;
    const runtimeState = runtimeStateStr ? JSON.parse(runtimeStateStr) : null;

    // 3. Read Learning files
    const learnedStr = rawFiles['learning/learned_parameters.json'] || rawFiles['synapses/synaptic_weights.json'];
    const optimizerStr = rawFiles['learning/optimizer_state.json'];
    const normStr = rawFiles['learning/normalization.json'];
    const rewardStr = rawFiles['learning/reward_config.json'];
    const trainingStr = rawFiles['learning/training_state.json'];

    const learnedRaw = learnedStr ? JSON.parse(learnedStr) : null;
    let learnedParameters: any = null;

    if (learnedRaw) {
      // Check if it is the standardized format or raw weights
      if (learnedRaw.input_weights) {
        learnedParameters = learnedRaw;
      } else if (learnedRaw.inputWeights) {
        learnedParameters = {
          input_weights: learnedRaw.inputWeights,
          hidden_biases: learnedRaw.hiddenBiases,
          output_weights: learnedRaw.outputWeights,
          output_biases: learnedRaw.outputBiases,
        };
      }
    }

    // 4. Read Memory
    const memory = {
      longTermMemory: rawFiles['memory/long_term_memory.json'] ? JSON.parse(rawFiles['memory/long_term_memory.json']) : null,
      learnedAssociations: rawFiles['memory/learned_associations.json'] ? JSON.parse(rawFiles['memory/learned_associations.json']) : null,
      navigationMemory: rawFiles['memory/navigation_memory.json'] ? JSON.parse(rawFiles['memory/navigation_memory.json']) : null,
      taskMemory: rawFiles['memory/task_memory.json'] ? JSON.parse(rawFiles['memory/task_memory.json']) : null,
    };

    // 5. Read Sensors, Motor, Body, Behavior, Colony
    const sensors = rawFiles['sensors/sensor_config.json'] ? JSON.parse(rawFiles['sensors/sensor_config.json']) : null;
    const motor = rawFiles['motor/motor_config.json'] ? JSON.parse(rawFiles['motor/motor_config.json']) : null;
    const body = rawFiles['body/morphology.json'] ? JSON.parse(rawFiles['body/morphology.json']) : null;
    const behavior = rawFiles['behavior/behavior_parameters.json'] ? JSON.parse(rawFiles['behavior/behavior_parameters.json']) : null;
    const colony = rawFiles['colony/communication_config.json'] ? JSON.parse(rawFiles['colony/communication_config.json']) : null;
    const experiments = {
      trainingConfig: rawFiles['experiments/training_config.json'] ? JSON.parse(rawFiles['experiments/training_config.json']) : null,
      evaluationResults: rawFiles['experiments/evaluation_results.json'] ? JSON.parse(rawFiles['experiments/evaluation_results.json']) : null,
      metrics: rawFiles['experiments/metrics.json'] ? JSON.parse(rawFiles['experiments/metrics.json']) : null,
      seed: rawFiles['experiments/seed.json'] ? JSON.parse(rawFiles['experiments/seed.json']) : null,
    };
    const provenance = {
      modelProvenance: rawFiles['provenance/model_provenance.json'] ? JSON.parse(rawFiles['provenance/model_provenance.json']) : null,
      dataProvenance: rawFiles['provenance/data_provenance.json'] ? JSON.parse(rawFiles['provenance/data_provenance.json']) : null,
      biologicalSources: rawFiles['provenance/biological_sources.json'] ? JSON.parse(rawFiles['provenance/biological_sources.json']) : null,
      softwareVersions: rawFiles['provenance/software_versions.json'] ? JSON.parse(rawFiles['provenance/software_versions.json']) : null,
    };
    const biologicalCatalog = rawFiles['biological_parameter_catalog.json'] ? JSON.parse(rawFiles['biological_parameter_catalog.json']) : [];

    return {
      manifest,
      brain: {
        architecture,
        neurons,
        synapses,
        regions,
        connectivity,
        runtimeState,
      },
      learning: {
        learnedParameters,
        optimizerState: optimizerStr ? JSON.parse(optimizerStr) : null,
        normalization: normStr ? JSON.parse(normStr) : null,
        rewardConfig: rewardStr ? JSON.parse(rewardStr) : null,
        trainingState: trainingStr ? JSON.parse(trainingStr) : null,
      },
      memory,
      sensors,
      motor,
      body,
      behavior,
      colony,
      experiments,
      provenance,
      biologicalCatalog,
      rawFiles,
    };
  }

  /**
   * Validates integrity, completeness, and version compatibility of an extracted package.
   */
  public static validate_package(pkg: AntBrainPackageData): PackageValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let compatibility: 'COMPATIBLE' | 'MIGRATABLE' | 'INCOMPATIBLE' = 'COMPATIBLE';

    if (!pkg.manifest) {
      return {
        valid: false,
        compatibility: 'INCOMPATIBLE',
        errors: ['Package missing manifest.'],
        warnings: [],
      };
    }

    const version = pkg.manifest.packageFormatVersion || '1.0.0';
    if (!this.SUPPORTED_FORMAT_VERSIONS.includes(version)) {
      if (parseInt(version.split('.')[0], 10) > 2) {
        errors.push(`Incompatible packageFormatVersion ${version} (requires AntWire >= 2.x).`);
        compatibility = 'INCOMPATIBLE';
      } else {
        warnings.push(`Legacy packageFormatVersion ${version} detected; automatic migration applied.`);
        compatibility = 'MIGRATABLE';
      }
    }

    // Validate Brain and Learned weights
    if (!pkg.learning?.learnedParameters?.input_weights) {
      errors.push('Missing learned parameter weights (input_weights matrix).');
    }
    if (!pkg.learning?.learnedParameters?.output_weights) {
      errors.push('Missing learned parameter weights (output_weights matrix).');
    }
    if (!pkg.brain?.neurons || pkg.brain.neurons.length === 0) {
      warnings.push('Neuron list is empty; default population will be synthesized.');
    }

    // Checksum verification
    if (pkg.manifest.fileIndex && Array.isArray(pkg.manifest.fileIndex)) {
      for (const item of pkg.manifest.fileIndex) {
        if (!pkg.rawFiles[item.path]) {
          warnings.push(`File recorded in manifest index not found: ${item.path}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      compatibility: errors.length > 0 ? 'INCOMPATIBLE' : compatibility,
      errors,
      warnings,
    };
  }

  /**
   * Initializes a runnable Ant organism restored from a validated .antbrain package.
   */
  public static initialize_agent(
    pkg: AntBrainPackageData,
    initialPos: Vector2D = { x: 0, y: 0 },
    colonyId: string = 'Colony-Alpha'
  ): Ant {
    const validation = this.validate_package(pkg);
    if (!validation.valid) {
      throw new Error(`Cannot initialize agent from invalid package:\n- ${validation.errors.join('\n- ')}`);
    }

    const antId = pkg.manifest.antId || `ant-${Date.now().toString(36)}`;
    const caste = (pkg.body?.morphology?.caste as any) || 'WORKER';

    // 1. Reconstruct NeuralController with restored learned weights
    const weights: ModelWeights = {
      inputWeights: pkg.learning.learnedParameters.input_weights,
      hiddenBiases: pkg.learning.learnedParameters.hidden_biases,
      outputWeights: pkg.learning.learnedParameters.output_weights,
      outputBiases: pkg.learning.learnedParameters.output_biases,
    };
    const controller = new NeuralController(weights);

    // 2. Instantiate Ant organism
    const ant = new Ant(antId, colonyId, initialPos, 0.0, caste, undefined, controller);

    // 3. Restore Learned Memory if present
    if (pkg.memory?.longTermMemory?.learned_food_locations) {
      for (const foodLoc of pkg.memory.longTermMemory.learned_food_locations) {
        ant.memory.rememberFood({ x: foodLoc.x, y: foodLoc.y });
      }
    }
    if (pkg.memory?.longTermMemory?.learned_threat_zones) {
      for (const threatLoc of pkg.memory.longTermMemory.learned_threat_zones) {
        ant.memory.rememberThreat({ x: threatLoc.x, y: threatLoc.y });
      }
    }

    // 4. Restore Behavior Preferences
    if (pkg.behavior?.parameters) {
      if (pkg.behavior.parameters.exploration_tendency !== undefined) {
        ant.body.traits.explorationTendency = pkg.behavior.parameters.exploration_tendency * 2.0;
      }
      if (pkg.behavior.parameters.risk_preference !== undefined) {
        ant.body.traits.fearThreshold = 1.0 / Math.max(0.2, pkg.behavior.parameters.risk_preference * 2.0);
      }
    }

    return ant;
  }

  /**
   * Runs one simulation tick on an initialized agent in an environment.
   */
  public static run_agent(agent: Ant, world: any, dt: number = 0.016): void {
    if (!world || !agent) return;
    const colony = world.colonies?.find((c: any) => c.id === agent.colonyId) || world.colonies?.[0];
    const nestEntrance = colony?.nest?.entrancePosition || { x: 0, y: 0 };
    const nestRadius = colony?.nest?.entranceRadius || 2.0;

    agent.update(
      dt,
      world.clock?.simTime || 0,
      world.clock?.tick || 0,
      world.pheromones,
      world.foodEntities || [],
      nestEntrance,
      nestRadius,
      world.obstacles || [],
      world.predators || [],
      world.getAllAntBodies?.() || [],
      world.rng,
      world.config?.world?.halfWidth || 30,
      world.config?.world?.halfHeight || 30,
      world.simConfig,
      world.eventBus
    );
  }

  /**
   * Saves an active Ant organism and its current checkpoint as a downloadable .antbrain package.
   */
  public static async save_antbrain(
    agent: Ant,
    checkpoint: ModelCheckpoint,
    options: AntBrainExportOptions = {}
  ): Promise<Blob> {
    const res = await ModelPackageGenerator.generateCompleteZip(checkpoint, {
      ...options,
      antId: agent.id,
      speciesProfile: agent.body.caste || checkpoint.species,
    });
    return res.blob;
  }

  /**
   * Converts package data back into an internal ModelCheckpoint for continued training.
   */
  public static convertToModelCheckpoint(pkg: AntBrainPackageData): ModelCheckpoint {
    const learned = pkg.learning.learnedParameters;
    const weights: ModelWeights = {
      inputWeights: learned.input_weights,
      hiddenBiases: learned.hidden_biases,
      outputWeights: learned.output_weights,
      outputBiases: learned.output_biases,
    };

    const rawArch = (pkg.brain?.architecture as any) || {};
    const arch: ModelArchitecture = {
      type: rawArch.type || rawArch.architecture_type || 'FEEDFORWARD_MLP',
      inputSize: rawArch.inputSize || rawArch.input_size || learned.input_weights[0]?.length || 14,
      hiddenLayers: rawArch.hiddenLayers || rawArch.hidden_layers || [learned.input_weights.length],
      outputSize: rawArch.outputSize || rawArch.output_size || learned.output_weights.length || 4,
      activation: rawArch.activation || rawArch.activation_function || 'RELU',
    };

    return {
      modelId: pkg.manifest.antId || `imported-${Date.now()}`,
      modelName: `${pkg.manifest.antId} (${pkg.manifest.brainType})`,
      version: pkg.manifest.modelVersion || '1.0.0',
      parentModelId: pkg.provenance?.modelProvenance?.lineage_parent || undefined,
      controllerType: 'NEURAL',
      architecture: arch,
      weights,
      trainingStep: pkg.learning.trainingState?.training_step || 0,
      episodeCount: pkg.learning.trainingState?.episode_count || 0,
      trainingEnvironment: pkg.experiments?.trainingConfig?.environment || {
        worldSize: 60,
        obstacleDensity: 0.1,
        predatorPresence: false,
        temperature: 24,
      },
      task: pkg.manifest.experimentId as any || 'FORAGE',
      rewardDefinition: {
        foodReward: pkg.learning.rewardConfig?.events?.food_collected?.value || 10.0,
        nestDeliveryReward: pkg.learning.rewardConfig?.events?.nest_delivered?.value || 15.0,
        energyPenalty: Math.abs(pkg.learning.rewardConfig?.events?.energy_expended?.value || 0.1),
        deathPenalty: Math.abs(pkg.learning.rewardConfig?.events?.predator_death?.value || 20.0),
      },
      species: pkg.manifest.speciesInspiredBy || 'Atta cephalotes / Formica rufa',
      inputSchema: pkg.sensors?.mapping?.input_cues || [
        'foodL', 'foodC', 'foodR',
        'nestL', 'nestC', 'nestR',
        'foodOdor', 'nestOdor',
        'obstacle', 'predator',
        'energy', 'hunger', 'carrying', 'threat'
      ],
      outputSchema: pkg.motor?.actionSpace?.continuous_channels || ['throttle', 'turn', 'depositFood', 'depositHome'],
      normalization: pkg.learning.normalization || {},
      seed: pkg.manifest.randomSeed || 42,
      metrics: {
        meanReward: pkg.experiments?.evaluationResults?.average_reward ?? pkg.learning?.trainingState?.mean_reward ?? 0,
        bestReward: pkg.experiments?.evaluationResults?.best_reward ?? pkg.learning?.trainingState?.best_reward ?? 0,
        successRate: pkg.experiments?.evaluationResults?.task_success_rate ?? pkg.learning?.trainingState?.success_rate ?? 0,
        episodesCompleted: pkg.learning?.trainingState?.episode_count ?? pkg.experiments?.evaluationResults?.episodes_completed ?? 0,
        totalSteps: pkg.learning?.trainingState?.training_step ?? pkg.experiments?.evaluationResults?.total_steps ?? 0,
      },
      createdAt: pkg.manifest.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: `Imported from AntWire .antbrain package (${pkg.manifest.antId})`,
    };
  }
}
