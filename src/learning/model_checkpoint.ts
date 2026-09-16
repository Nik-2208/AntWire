/**
 * ANT BRAIN — Authoritative Model Checkpoint & Storage System
 * Implements persistent local-first storage (IndexedDB + localStorage fallback),
 * checkpoint versioning, continuous training resumption, export/import, and integrity validation.
 */

export interface ModelMetrics {
  meanReward: number;
  bestReward: number;
  successRate: number;
  loss?: number;
  episodesCompleted: number;
  totalSteps: number;
}

export interface ModelArchitecture {
  type: 'FEEDFORWARD_MLP' | 'RECURRENT_RNN' | 'SNN' | 'RULE_GRAPH';
  inputSize: number;
  hiddenLayers: number[];
  outputSize: number;
  activation: 'RELU' | 'TANH' | 'SIGMOID' | 'LIF_SPIKE';
}

export interface ModelWeights {
  inputWeights: number[][];   // [hiddenSize x inputSize]
  hiddenBiases: number[];     // [hiddenSize]
  outputWeights: number[][];  // [outputSize x hiddenSize]
  outputBiases: number[];     // [outputSize]
  // Optional second layer / recurrent weights
  hidden2Weights?: number[][];
  hidden2Biases?: number[];
}

export interface ModelCheckpoint {
  modelId: string;
  modelName: string;
  version: string;
  parentModelId?: string;
  controllerType: 'NEURAL' | 'RL' | 'SNN' | 'RULE_BASED';
  architecture: ModelArchitecture;
  weights: ModelWeights;
  trainingStep: number;
  episodeCount: number;
  trainingEnvironment: {
    worldSize: number;
    obstacleDensity: number;
    predatorPresence: boolean;
    temperature: number;
  };
  task: 'FORAGE' | 'MAZE' | 'TRAIL_FOLLOW' | 'EVADE' | 'COLLECTIVE_TRANSPORT';
  rewardDefinition: {
    foodReward: number;
    nestDeliveryReward: number;
    energyPenalty: number;
    deathPenalty: number;
    distancePenalty?: number;
  };
  species: string;
  inputSchema: string[];
  outputSchema: string[];
  normalization: {
    inputMeans?: number[];
    inputStds?: number[];
  };
  seed: number;
  metrics: ModelMetrics;
  createdAt: string;
  updatedAt: string;
  notes: string;
}

export class ModelStorageService {
  private static DB_NAME = 'AntBrain_ModelRegistry_v1';
  private static STORE_NAME = 'checkpoints';
  private static FALLBACK_KEY = 'antbrain_model_checkpoints_fallback';
  private static memoryStore: Map<string, ModelCheckpoint> = new Map();

  /**
   * Initialize IndexedDB database connection
   */
  private static openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB not supported'));
        return;
      }

      const request = indexedDB.open(this.DB_NAME, 1);
      request.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'modelId' });
          store.createIndex('modelName', 'modelName', { unique: false });
          store.createIndex('task', 'task', { unique: false });
          store.createIndex('updatedAt', 'updatedAt', { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Save or update model checkpoint locally
   */
  public static async saveCheckpoint(checkpoint: ModelCheckpoint): Promise<void> {
    const validation = this.validateCheckpoint(checkpoint);
    if (!validation.valid) {
      throw new Error(`Cannot save invalid checkpoint: ${validation.error}`);
    }

    checkpoint.updatedAt = new Date().toISOString();
    this.memoryStore.set(checkpoint.modelId, JSON.parse(JSON.stringify(checkpoint)));

    try {
      if (typeof window !== 'undefined' && window.indexedDB) {
        const dbPromise = this.openDatabase();
        const timeoutPromise = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('IndexedDB Timeout')), 100));
        const db = await Promise.race([dbPromise, timeoutPromise]);
        await new Promise<void>((resolve, reject) => {
          const tx = db.transaction(this.STORE_NAME, 'readwrite');
          const store = tx.objectStore(this.STORE_NAME);
          const req = store.put(checkpoint);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        });
      }
    } catch {
      // Robust localStorage fallback
      this.saveToLocalStorage(checkpoint);
    }
  }

  /**
   * Load checkpoint by modelId
   */
  public static async loadCheckpoint(modelId: string): Promise<ModelCheckpoint | null> {
    if (this.memoryStore.has(modelId)) {
      return JSON.parse(JSON.stringify(this.memoryStore.get(modelId)));
    }

    try {
      if (typeof window !== 'undefined' && window.indexedDB) {
        const dbPromise = this.openDatabase();
        const timeoutPromise = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('IndexedDB Timeout')), 100));
        const db = await Promise.race([dbPromise, timeoutPromise]);
        const res = await new Promise<ModelCheckpoint | null>((resolve, reject) => {
          const tx = db.transaction(this.STORE_NAME, 'readonly');
          const store = tx.objectStore(this.STORE_NAME);
          const req = store.get(modelId);
          req.onsuccess = () => resolve(req.result || null);
          req.onerror = () => reject(req.error);
        });
        if (res) return res;
      }
    } catch {
      // ignore
    }

    const lsRes = this.loadFromLocalStorage(modelId);
    if (lsRes) return lsRes;

    return null;
  }

  /**
   * List all stored model checkpoints
   */
  public static async listCheckpoints(): Promise<ModelCheckpoint[]> {
    if (this.memoryStore.size > 0) {
      return Array.from(this.memoryStore.values()).map((c) => JSON.parse(JSON.stringify(c)));
    }

    try {
      if (typeof window !== 'undefined' && window.indexedDB) {
        const dbPromise = this.openDatabase();
        const timeoutPromise = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('IndexedDB Timeout')), 100));
        const db = await Promise.race([dbPromise, timeoutPromise]);
        const list = await new Promise<ModelCheckpoint[]>((resolve, reject) => {
          const tx = db.transaction(this.STORE_NAME, 'readonly');
          const store = tx.objectStore(this.STORE_NAME);
          const req = store.getAll();
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => reject(req.error);
        });
        if (list && list.length > 0) return list;
      }
    } catch {
      // ignore
    }

    const lsList = this.listFromLocalStorage();
    if (lsList && lsList.length > 0) return lsList;

    return [];
  }

  /**
   * Delete checkpoint
   */
  public static async deleteCheckpoint(modelId: string): Promise<boolean> {
    this.memoryStore.delete(modelId);
    try {
      const db = await this.openDatabase();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(this.STORE_NAME, 'readwrite');
        const store = tx.objectStore(this.STORE_NAME);
        const req = store.delete(modelId);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
      return true;
    } catch {
      return this.deleteFromLocalStorage(modelId);
    }
  }

  /**
   * Duplicate model checkpoint with a new version identifier
   */
  public static async duplicateCheckpoint(modelId: string, newVersion?: string): Promise<ModelCheckpoint> {
    const original = await this.loadCheckpoint(modelId);
    if (!original) {
      throw new Error(`Model ${modelId} not found`);
    }

    const nextVer = newVersion || `${original.version}-copy-${Math.random().toString(36).slice(2, 5)}`;
    const duplicate: ModelCheckpoint = {
      ...JSON.parse(JSON.stringify(original)),
      modelId: `model-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      modelName: `${original.modelName} (Copy)`,
      version: nextVer,
      parentModelId: original.modelId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: `Branched from ${original.modelName} (v${original.version})`,
    };

    await this.saveCheckpoint(duplicate);
    return duplicate;
  }

  /**
   * Validate checkpoint structure and dimensional compatibility
   */
  public static validateCheckpoint(cp: any): { valid: boolean; error?: string } {
    if (!cp || typeof cp !== 'object') return { valid: false, error: 'Checkpoint must be an object' };
    if (!cp.modelId || !cp.modelName || !cp.version) return { valid: false, error: 'Missing identity fields' };
    if (!cp.architecture || !cp.weights) return { valid: false, error: 'Missing architecture or weights' };

    const { inputSize, outputSize, hiddenLayers } = cp.architecture;
    const { inputWeights, hiddenBiases, outputWeights, outputBiases } = cp.weights;

    if (!Array.isArray(hiddenLayers) || hiddenLayers.length === 0) {
      return { valid: false, error: 'Invalid hidden layer specification' };
    }

    const firstHidden = hiddenLayers[0];
    if (!Array.isArray(inputWeights) || inputWeights.length !== firstHidden) {
      return { valid: false, error: `inputWeights height (${inputWeights?.length}) does not match hiddenSize (${firstHidden})` };
    }
    if (inputWeights[0]?.length !== inputSize) {
      return { valid: false, error: `inputWeights width (${inputWeights[0]?.length}) does not match inputSize (${inputSize})` };
    }
    if (hiddenBiases?.length !== firstHidden) {
      return { valid: false, error: `hiddenBiases length does not match hiddenSize` };
    }
    if (outputWeights?.length !== outputSize) {
      return { valid: false, error: `outputWeights height does not match outputSize` };
    }
    if (outputBiases?.length !== outputSize) {
      return { valid: false, error: `outputBiases length does not match outputSize` };
    }

    return { valid: true };
  }

  /**
   * Export model checkpoint as downloadable JSON
   */
  public static exportToJSON(checkpoint: ModelCheckpoint): string {
    return JSON.stringify(checkpoint, null, 2);
  }

  /**
   * Export complete open-source ANTBRAIN_MODEL package with Model Card and reproducibility metadata
   */
  public static exportAntBrainModelPackage(checkpoint: ModelCheckpoint): string {
    const modelCard = `# MODEL CARD: ${checkpoint.modelName} (v${checkpoint.version})

## 1. Intended Use
- **Primary Use**: Autonomous artificial ant behavioral control for task \`${checkpoint.task}\`.
- **Target Environments**: 2D/3D artificial-life sandboxes and colony simulations.
- **NOT Intended For**: Real-world financial stock execution, commercial trading, or literal biological emulation claims.

## 2. Model Architecture & Parameters
- **Network Type**: \`${checkpoint.architecture.type}\` (${checkpoint.architecture.inputSize} inputs -> [${checkpoint.architecture.hiddenLayers.join(', ')}] hidden -> ${checkpoint.architecture.outputSize} outputs)
- **Activation Function**: \`${checkpoint.architecture.activation}\`
- **Controller Type**: \`${checkpoint.controllerType}\`
- **Species Target**: \`${checkpoint.species}\`

## 3. Training & Performance
- **Training Steps**: ${checkpoint.trainingStep.toLocaleString()}
- **Episodes Completed**: ${checkpoint.episodeCount}
- **Mean Reward**: ${checkpoint.metrics.meanReward.toFixed(2)}
- **Best Reward**: ${checkpoint.metrics.bestReward.toFixed(2)}
- **Success Rate**: ${checkpoint.metrics.successRate.toFixed(1)}%

## 4. Biological Status & Provenance
- **Status**: \`COMPUTATIONAL_ABSTRACTION / BIOLOGICAL_INSPIRATION\`
- **Lineage Parent**: \`${checkpoint.parentModelId || 'Root / Scratch Initializer'}\`
- **License**: Open-Source Ant Brain Research License (MIT Equivalent)
`;

    const pkg = {
      format: 'ANTBRAIN_MODEL_PACKAGE_V1',
      modelId: checkpoint.modelId,
      modelName: checkpoint.modelName,
      version: checkpoint.version,
      species: checkpoint.species,
      architecture: checkpoint.architecture,
      weights: checkpoint.weights,
      normalization: checkpoint.normalization,
      task: checkpoint.task,
      trainingEnvironment: checkpoint.trainingEnvironment,
      trainingMetrics: checkpoint.metrics,
      lineage: {
        parentModelId: checkpoint.parentModelId,
        trainingStep: checkpoint.trainingStep,
        episodeCount: checkpoint.episodeCount,
      },
      modelCard,
      license: 'MIT / Open Ant Brain Research License',
      exportedAt: new Date().toISOString(),
    };

    return JSON.stringify(pkg, null, 2);
  }

  /**
   * Import model checkpoint from JSON string (supports direct checkpoint JSON or ANTBRAIN_MODEL package)
   */
  public static async importFromJSON(jsonStr: string): Promise<ModelCheckpoint> {
    let parsed: any;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      throw new Error('Failed to parse JSON file');
    }

    // Convert ANTBRAIN_MODEL package format to internal ModelCheckpoint if needed
    if (parsed.format === 'ANTBRAIN_MODEL_PACKAGE_V1') {
      parsed = {
        modelId: parsed.modelId || `imported-${Date.now()}`,
        modelName: parsed.modelName || 'Imported Ant Brain Model',
        version: parsed.version || '1.0.0',
        parentModelId: parsed.lineage?.parentModelId,
        controllerType: 'NEURAL',
        architecture: parsed.architecture,
        weights: parsed.weights,
        trainingStep: parsed.lineage?.trainingStep || 0,
        episodeCount: parsed.lineage?.episodeCount || 0,
        trainingEnvironment: parsed.trainingEnvironment || {
          worldSize: 60,
          obstacleDensity: 0.1,
          predatorPresence: false,
          temperature: 24,
        },
        task: parsed.task || 'FORAGE',
        rewardDefinition: {
          foodReward: 10.0,
          nestDeliveryReward: 15.0,
          energyPenalty: 0.1,
          deathPenalty: 20.0,
        },
        species: parsed.species || 'Formica rufa',
        inputSchema: ['foodL', 'foodC', 'foodR', 'nestL', 'nestC', 'nestR', 'foodOdor', 'nestOdor', 'obstacle', 'predator', 'energy', 'hunger', 'carrying', 'threat'],
        outputSchema: ['throttle', 'turn', 'depositFood', 'depositHome'],
        normalization: parsed.normalization || {},
        seed: 42,
        metrics: parsed.trainingMetrics || {
          meanReward: 0,
          bestReward: 0,
          successRate: 0,
          episodesCompleted: 0,
          totalSteps: 0,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        notes: `Imported from ANTBRAIN_MODEL package on ${new Date().toLocaleDateString()}`,
      };
    }

    const validation = this.validateCheckpoint(parsed);
    if (!validation.valid) {
      throw new Error(`Incompatible model checkpoint: ${validation.error}`);
    }

    // Ensure unique ID to avoid overwriting existing
    parsed.modelId = `imported-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    parsed.updatedAt = new Date().toISOString();
    await this.saveCheckpoint(parsed);
    return parsed;
  }

  // --- LocalStorage Fallback Methods ---

  private static saveToLocalStorage(checkpoint: ModelCheckpoint): void {
    if (typeof localStorage === 'undefined') return;
    const models = this.listFromLocalStorage();
    const idx = models.findIndex((m) => m.modelId === checkpoint.modelId);
    if (idx >= 0) {
      models[idx] = checkpoint;
    } else {
      models.push(checkpoint);
    }
    localStorage.setItem(this.FALLBACK_KEY, JSON.stringify(models));
  }

  private static loadFromLocalStorage(modelId: string): ModelCheckpoint | null {
    const models = this.listFromLocalStorage();
    return models.find((m) => m.modelId === modelId) || null;
  }

  private static listFromLocalStorage(): ModelCheckpoint[] {
    if (typeof localStorage === 'undefined') return [];
    const data = localStorage.getItem(this.FALLBACK_KEY);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private static deleteFromLocalStorage(modelId: string): boolean {
    if (typeof localStorage === 'undefined') return false;
    const models = this.listFromLocalStorage();
    const filtered = models.filter((m) => m.modelId !== modelId);
    localStorage.setItem(this.FALLBACK_KEY, JSON.stringify(filtered));
    return true;
  }
}
