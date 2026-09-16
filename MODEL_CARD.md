# ANT BRAIN — Computational Model Card

## 1. Model Overview
* **Model Name:** Ant Brain Biologically Informed Controller (v1.0.0)
* **Architecture:** Modular Neuropil Policy integrating Antennal Lobe Glomerular Filtering, Mushroom Body Sparse Coding, Central Complex Ring Attractor & Odometer, and Lateral Accessory Lobe Premotor Output.
* **Intended Use:** Artificial life simulation, computational neuroscience education, multi-agent collective intelligence research, and behavioral dataset generation for offline reinforcement learning.

## 2. Model Input & Output Interfaces

### Sensory Inputs (Perception Vector)
* Left & Right Antennal Chemosensory Concentrations (Food, Pheromone, Alarm)
* Central Complex Heading & Polarized Light Vector
* Home Vector Odometer Distance & Direction
* Spatial Mechanosensory Obstacle & Threat Proximities

### Internal Homeostatic Inputs
* Metabolic Energy ($E \in [0, 1]$)
* Hunger & Somatic Health ($H \in [0, 1]$)
* Threat Arousal ($\sigma \in [0, 1]$)
* Cargo Mass State

### Action Outputs (Premotor Commands)
* Target Linear Velocity ($v \in [0, v_{\max}]$)
* Target Angular Turn Rate ($\omega \in [-\omega_{\max}, \omega_{\max}]$)
* Mandible Actuation (Grip Food / Deposit Brood)
* Pheromone Synthesis & Deposition Rate

---

## 3. Strict Non-LLM Controller Policy
Ant movement and decisions are computed purely deterministically via simulated biophysical rules and neural dynamics. Large Language Models (LLMs) are **never** invoked within the inner simulation loop. LLM integrations are strictly confined to human-facing post-hoc telemetry explanation.
