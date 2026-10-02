# AntWire — Computational Model Card & Artifact Registry

> **Created & Developed by [Nikhilesh H. Chavda](https://github.com/Nik-2208)**  
> **Repository:** [https://github.com/Nik-2208/AntWire](https://github.com/Nik-2208/AntWire)  
> **Live Showcase:** [AntWire Keyboard RL Demo](https://ant-brain-keyboard.vercel.app/)

---

## 1. Official Model Artifacts

AntWire maintains two canonical, verified `.antbrain` model artifacts:

### Model A: `antwire-v1-foundation` (Base Connectome)
* **Model ID**: `antwire-v1-foundation`
* **Version**: `1.0.0`
* **Architecture**: Multi-Neuropil Spiking Connectome (~55k Neurons, 1.82M Synapses)
* **Neuropils**: Antennal Lobe (AL), Mushroom Body (MB), Central Complex (CX), Subesophageal Zone (SEZ), Optic Lobe (OL), Lateral Accessory Lobe (LAL).
* **SHA-256 Checksum**: `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
* **Intended Use**: Baseline simulation, zero-shot collective foraging emergence, biological neuroscience education.

### Model B: `antwire-v1-keyboard-rl` (Trained Keyboard RL Specialist)
* **Model ID**: `antwire-v1-keyboard-rl`
* **Version**: `1.2.0`
* **Architecture**: Connectome with Dopamine-Modulated STDP Synaptic Weights
* **Training Corpus**: 50,000 reinforcement learning episodes on structured multi-target keyboard coordinates.
* **SHA-256 Checksum**: `a8f5f167f44f4964e6c998dee827110c0175f0f35368a5c3ae8929e06cd2dfbb`
* **Capabilities**: Autonomous spatial pathfinding, precision key activation, high-efficiency obstacle avoidance.
* **Demonstration**: Deployed live at [https://ant-brain-keyboard.vercel.app/](https://ant-brain-keyboard.vercel.app/).

---

## 2. Sensory Perception & Motor Interface

### 14-Dimensional Sensory Vector ($\mathbf{s}_t$)
1. `foodL`: Left antennal food chemosensory concentration ($[0, 1]$)
2. `foodC`: Central food chemosensory concentration ($[0, 1]$)
3. `foodR`: Right antennal food chemosensory concentration ($[0, 1]$)
4. `nestL`: Left antennal home/nest pheromone concentration ($[0, 1]$)
5. `nestC`: Central home/nest pheromone concentration ($[0, 1]$)
6. `nestR`: Right antennal home/nest pheromone concentration ($[0, 1]$)
7. `foodOdor`: Total volatile food odor gradient ($[0, 1]$)
8. `nestOdor`: Total volatile nest odor gradient ($[0, 1]$)
9. `obstacle`: Forward mechanosensory obstacle proximity ($[0, 1]$)
10. `predator`: Apex predator proximity / alarm odor ($[0, 1]$)
11. `energy`: Internal metabolic energy reserve ($[0, 1]$)
12. `hunger`: Homeostatic feeding deficit / starvation stress ($[0, 1]$)
13. `carrying`: Binary cargo holding flag ($0 = \text{empty}, 1 = \text{carrying}$)
14. `threat`: Internal fear arousal level ($[0, 1]$)

### 4-Dimensional Motor Action Vector ($\mathbf{a}_t$)
1. `throttle`: Forward velocity command ($[0, v_{\max}]$)
2. `turn`: Angular yaw steering rate ($[-\omega_{\max}, \omega_{\max}]$)
3. `depositFood`: Chemical recruitment pheromone release rate ($[0, 1]$)
4. `depositHome`: Exploratory home pheromone deposition rate ($[0, 1]$)

---

## 3. Strict Determinism & Zero-LLM Inner Loop Policy

Ant decisions and kinematics are computed exclusively through deterministic neural matrix operations and biophysical differential equations. Large Language Models (LLMs) are **never** executed inside the agent simulation loop, guaranteeing:
* High-throughput 60 Hz deterministic simulation ticks.
* Zero external cloud latency dependencies.
* 100% reproducible scientific trajectory benchmarks.

---

## 4. Packaging & Reproducibility (`.antbrain`)

Each exported `.antbrain` model package contains:
1. `manifest.json`: Cryptographic metadata, hardware invariants, and compatibility schemas.
2. `model_card.md`: Intended use, limitations, training history, and citations.
3. `weights.bin` / `weights.json`: Synaptic weight matrices and bias tensors.
4. `normalization.json`: Input feature scaling bounds.
5. `lineage.json`: Training step counts, cumulative reward curves, and ancestor model IDs.
