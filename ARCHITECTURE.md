# ANT BRAIN — System Architecture & Scientific Engine

## 1. System Overview

**Ant Brain** is an open-source, research-grade, biologically grounded insect neurobiology and multi-agent superorganism simulator. It combines high-throughput multi-agent colony ecology with memory-efficient 55,000-neuron spiking neural networks and 3D connectomic visualization.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ANT BRAIN PLATFORM                              │
├───────────────────────┬────────────────────────┬───────────────────────┤
│    COLONY & ECOLOGY   │   INDIVIDUAL NEURAL    │  CONNECTOMICS VIEWER  │
│                       │                        │                       │
│ • Superorganism       │ • Closed-loop organism │ • FlyWire-style 3D    │
│ • Atta Leaf Farming   │ • Antennae -> Motor    │ • 55k Neurons Point   │
│ • Living Bridges      │ • SNN (LIF & STDP)     │ • Synaptic Contacts   │
│ • Pheromones (3-chem) │ • Neuromodulation      │ • Neuropil Parcellation│
│ • Subnests & Digging  │ • Path Integration    │ • Causal Trace Engine │
└───────────────────────┴────────────────────────┴───────────────────────┘
```

---

## 2. Multi-Tiered Performance Architecture

To achieve continuous 60 FPS rendering while simulating thousands of agents and tens of thousands of neural nodes, the execution pipeline decouples update frequencies:

1. **Simulation Physics & Agent Loop (Fixed 60 Hz):**
   - Deterministic spatial hash grid collision detection.
   - Pheromone Laplacian diffusion on high-resolution Float32 grids.
   - Closed-system food mass & energy ledger conservation audits.

2. **Neural Inference & Spiking Engine (Event-driven / 10-60 Hz):**
   - High-density compact TypedArrays (`Float32Array`, `Uint8Array`, `Int32Array`).
   - Sparse indexed synaptic connectivity graph.
   - Sub-sampled representative telemetry logging for trajectory generation.

3. **3D WebGL / Canvas Rendering (VSync 60-120 FPS):**
   - Three.js GPU instanced mesh rendering for ants, fungus gardens, pheromone clouds, and neural point clouds.
   - Smooth LOD (Level of Detail) camera transitions with center-on-selection and orbit controls.

---

## 3. Core Modules

| Module Path | Core Purpose |
|---|---|
| `src/ants/brain/connectome.ts` | FlyWire-equivalent connectome data model and head-to-toe nervous system definitions |
| `src/ants/brain/synthetic_brain_55k.ts` | 55,000-neuron memory-efficient TypedArray computational connectome |
| `src/ants/brain/brain_control_panel.ts` | Live parameter override controller and causal behavior tracer |
| `src/simulation/collective_structures.ts` | Living self-assembling ant bridges and acrobatic climbing towers |
| `src/experiments/synthetic_task_engine.ts` | Transfer learning engine for arbitrary synthetic and robotic reward tasks |
| `src/colony/fungus_agriculture.ts` | *Atta* leaf pulping, gongylidia farming, and *Escovopsis* pathogen dynamics |
| `src/colony/roles.ts` | Bonabeau-Theraulaz response threshold division of labor and polymorphic castes |
| `src/colony/queen.ts` | Polyandrous founding queen life cycle, sperm storage, and trophic egg dynamics |
| `src/simulation/food_ledger.ts` | Authoritative first-law thermodynamic food mass conservation engine |
