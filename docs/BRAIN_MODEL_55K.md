# ANT BRAIN — 55,000-Neuron Synthetic Computational Ant Brain

## Scientific Position & Computational Specification

The **ANT BRAIN 55K Platform** implements a high-density, memory-efficient, 50,000–60,000 neuron computational synthetic brain per digital ant.

> **CRITICAL SCIENTIFIC DISCLAIMER**:
> The 55,000-neuron model is a **SYNTHETIC COMPUTATIONAL & BIOLOGICALLY INFORMED ABSTRACTION**. It is not claimed to be a fully resolved empirical ant connectome. It is architected to allow real biological ant connectome and neuroanatomical datasets (such as the *Ooceraea biroi* 40-brain population reference atlas) to replace synthetic structures as open research data becomes available.

---

## 1. Regional Neuropil Architecture & Distribution

The 55,000 neurons are organized into 12 anatomically inspired insect neuropils:

| Neuropil Region | Code | System | Ratio | Neurons (55k) | Functional Role |
|---|---|---|---|---|---|
| **Left Antennal Lobe** | `AL-L` | Chemosensory | 7.5% | ~4,125 | Olfactory reception & glomeruli |
| **Right Antennal Lobe** | `AL-R` | Chemosensory | 7.5% | ~4,125 | Bilateral tropotaxis contrast |
| **Left Optic Lobe** | `OL-L` | Visual | 7.5% | ~4,125 | Compound eye retinotopic flow |
| **Right Optic Lobe** | `OL-R` | Visual | 7.5% | ~4,125 | Panoramic landmark matching |
| **Central Complex (EB/PB/FB/NO)** | `CX` | Central Integration | 18.0% | ~9,900 | 16-wedge heading compass & path integration |
| **Left Mushroom Body** | `MB-L` | Associative Memory | 8.0% | ~4,400 | Kenyon cell sparse coding & valence |
| **Right Mushroom Body** | `MB-R` | Associative Memory | 8.0% | ~4,400 | Associative scent-reward memory |
| **Subesophageal Zone** | `SEZ` | Motor / Mouthparts | 8.0% | ~4,400 | Mandibular grasp & forward thrust |
| **Lateral Accessory Lobes** | `LAL` | Motor / Steering | 8.0% | ~4,400 | Bilateral flip-flop steering bias |
| **Social Communication Zone** | `SOC` | Social / Pheromone | 10.0% | ~5,500 | Nestmate recognition & trail following |
| **Motivation Hub** | `MOTIV` | Homeostasis | 8.0% | ~4,400 | Hunger, energy, and task priorities |
| **Neuromodulatory Cluster** | `MODUL` | Neuromodulation | 2.0% | ~1,100 | Dopamine RPE, Octopamine, Serotonin |

---

## 2. Memory-Efficient TypedArray Architecture

To prevent browser freezing and maintain 60 FPS in WebGL:
- **`positions`**: `Float32Array(55000 * 3)` — 3D spatial coordinates in normalized insect brain volume.
- **`activations`**: `Float32Array(55000)` — Live dynamic activation levels ($[0.0, 1.0]$).
- **`biases`**: `Float32Array(55000)` — Resting biases.
- **`thresholds`**: `Float32Array(55000)` — Spike thresholds ($-45.0 \pm 4.0\text{ mV}$).
- **`regionIds` & `systemIds`**: `Uint8Array(55000)` — Regional classification IDs.
- **`disabledFlags`**: `Uint8Array(55000)` — Binary mask for live lesioning and ablation experiments.

**Total Memory Footprint**: ~4.2 MB RAM per synthetic brain instance.

---

## 3. Synaptic Weight Initialization & Statistics

Weights are strictly initialized using **Glorot / Xavier Normal Initialization**:
$$W_{ij} \sim \mathcal{N}\left(0, \sqrt{\frac{2}{\text{fan}_{\text{in}} + \text{fan}_{\text{out}}}}\right)$$

- **Weight Mean**: $\approx 0.000$ (Zero-centered).
- **Variance**: $> 0.05$ with normal distribution.
- **Strict Prohibition**: Weights are **never** uniformly set to $0.1$.

---

## 4. FlyWire-Inspired Connectome Explorer & LOD

- **LOD Level 0 (Macro)**: Neuropil hulls, regional activity sums, and macro tracts.
- **LOD Level 1 (Mesoscale)**: Subregions, micro-clusters, and circuit hubs.
- **LOD Level 2 (Microscale)**: 55,000 individual point particles colored by activation.
- **LOD Level 3 (Synaptic)**: Active pathways and selected neuron synaptic connections.
