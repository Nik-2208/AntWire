# AntWire — `.antbrain` Model Package Specification (v2.0.0)

> **Created & Developed by [Nikhilesh H. Chavda](https://nik-portfolio-lime.vercel.app/)**  
> *Authoritative Format Specification for Portable, Offline-Executable Ant Neural Packages*  
> GitHub: [https://github.com/Nik-2208](https://github.com/Nik-2208) | LinkedIn: [https://www.linkedin.com/in/nikhilesh-chavda-2b779533a/](https://www.linkedin.com/in/nikhilesh-chavda-2b779533a/)

---

## 1. Package Architecture

An `.antbrain` archive is a standardized, self-contained ZIP archive containing complete model weights, neuropil regional topology, learned associative memories, and offline runtime scripts:

```text
my_ant_brain.antbrain (ZIP Archive)
├── manifest.json                       # Package metadata, checksums, author, format version
├── biological_parameter_catalog.json   # Parameter annotations & scientific evidence tiers
├── brain/
│   ├── architecture.json               # Layer dimensions, activation functions, topology
│   ├── neurons.json                    # Full neuron population with 3D anatomical coordinates
│   ├── synapses.json                   # Sparse synaptic graph (source, target, weight, type)
│   ├── regions.json                    # Neuropil regional definitions (AL, MB, CX, SEZ, LAL)
│   ├── connectivity.json               # Adjacency matrices & degree distribution metrics
│   └── runtime_state.json              # Initial baseline resting membrane potential tensors
├── learning/
│   ├── learned_parameters.json         # Trained synaptic matrices (input_weights, biases)
│   ├── optimizer_state.json            # Adam / RMSprop moments & learning rate schedules
│   ├── reward_config.json              # Reward shaping values & penalty coefficients
│   └── training_state.json             # Episode count, mean reward, training step history
├── memory/
│   ├── long_term_memory.json           # Remembered food sites and threat coordinates
│   ├── learned_associations.json       # Mushroom Body conditioned valence weights
│   └── navigation_memory.json          # Central Complex return vectors & landmarks
├── sensors/
│   └── sensor_config.json              # 14-D chemosensory, antennae, and visual ray mappings
├── motor/
│   └── motor_config.json               # Continuous throttle, steering bias, and mandible grip
├── body/
│   └── morphology.json                 # Caste dimensions, mass, cuticle pigmentation
├── behavior/
│   └── behavior_parameters.json        # Exploration tendency, fear threshold, social affinity
├── runtime/
│   ├── run_model.py                    # Standalone offline Python inference script
│   ├── train.py                        # Standalone offline Python policy gradient trainer
│   ├── infer.py                        # Standalone multi-agent evaluation benchmark
│   └── inspect.py                      # Standalone connectome & weight inspector
└── provenance/
    ├── model_provenance.json           # Checkpoint lineage, training seed, and hash
    ├── biological_sources.json         # Peer-reviewed journal citations and DOIs
    └── software_versions.json          # Engine versions, compiler flags, and timestamps
```

---

## 2. Manifest Schema (`manifest.json`)

```json
{
  "packageFormatVersion": "2.0.0",
  "antId": "Ant-Alpha-55K",
  "brainType": "SYNTHETIC_55K_CONNECTOME",
  "author": "Nikhilesh H. Chavda",
  "authorUrl": "https://nik-portfolio-lime.vercel.app/",
  "speciesInspiredBy": "Atta cephalotes / Formica rufa",
  "createdAt": "2026-09-24T12:00:00.000Z",
  "neuronCount": 55000,
  "synapseCount": 357500,
  "neuropilRegions": 12,
  "randomSeed": 42,
  "trainingSteps": 12500,
  "bestReward": 48.65,
  "meanReward": 32.40
}
```

---

## 3. Loading `.antbrain` in TypeScript / Web App

```typescript
import { AntBrainLoader } from './learning/antbrain_loader';

// 1. Extract package from Blob, File, or ArrayBuffer
const packageData = await AntBrainLoader.load_antbrain(fileBuffer);

// 2. Validate package integrity & checksums
const validation = AntBrainLoader.validate_package(packageData);
if (!validation.valid) {
  throw new Error(`Corrupted package: ${validation.errors.join(', ')}`);
}

// 3. Initialize an active runnable Ant organism
const ant = AntBrainLoader.initialize_agent(packageData, { x: 0, y: 0 });
console.log(`Ant ${ant.id} initialized with ${packageData.manifest.neuronCount} neurons.`);
```

---

## 4. Offline Python Execution

AntWire `.antbrain` packages include native Python runtimes requiring zero external ML frameworks (built using pure Python and standard libraries):

```bash
# 1. Run single-agent inference step
python runtime/run_model.py

# 2. Inspect connectome topology & Glorot weight distributions
python runtime/inspect.py

# 3. Continue training with policy gradients
python runtime/train.py --episodes 100 --lr 0.01

# 4. Multi-agent colony simulation
python runtime/infer.py --ants 25
```
