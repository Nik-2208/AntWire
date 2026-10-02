# AntWire — System Architecture Specification

> **Created & Developed by [Nikhilesh H. Chavda](https://nik-portfolio-lime.vercel.app/)**  
> *AntWire: Extensible Computational Ant-Brain, Individual-Ant, and Colony Superorganism Platform*  
> GitHub: [https://github.com/Nik-2208](https://github.com/Nik-2208) | LinkedIn: [https://www.linkedin.com/in/nikhilesh-chavda-2b779533a/](https://www.linkedin.com/in/nikhilesh-chavda-2b779533a/)

---

## 1. Architectural Philosophy & First Principles

An ant is **not** merely `brain + movement`. AntWire models the computational ant organism as a hierarchy of modular biological and physical layers:

```text
GENOME / DEVELOPMENTAL PARAMETERS
               ↓
          ANATOMY / BODY
               ↓
          PHYSIOLOGY
               ↓
        SENSORY SYSTEM
               ↓
        NERVOUS SYSTEM (Connectome / 55K SNN)
               ↓
   INTERNAL STATE / MOTIVATION
               ↓
       MEMORY / LEARNING
               ↓
            DECISION
               ↓
          MOTOR SYSTEM
               ↓
       ENVIRONMENTAL ACTION
               ↓
      STIGMERGIC / SOCIAL FEEDBACK
               ↓
   COLONY SUPERORGANISM HOMEOSTASIS
```

---

## 2. Core Architectural Subsystems

AntWire maintains strict separation of concerns across 11 core subsystems:

| Subsystem | Directory | Purpose & Boundaries |
| :--- | :--- | :--- |
| **`ANT BRAIN MODEL`** | `src/ants/brain/` | Immutable connectome definition, neuropil topology (`AL`, `MB`, `CX`, `SEZ`, `LAL`), spiking LIF equations, synaptic weights, and neurotransmitter channels. |
| **`ANT RUNTIME`** | `src/ants/controllers/` | Independent per-ant inference executor. Maps 14-D sensory cues through the 55K connectome to produce continuous/discrete motor intentions. Never shares mutable activations between ants. |
| **`BODY / PHYSIOLOGY`** | `src/ants/` | Physical entity kinematics, energy reserves, metabolic burn rates, somatic health, starvation stress, injury penalties, and lifespan senescence. |
| **`ENVIRONMENT`** | `src/simulation/` | Spatial hash collision grid, thermodynamic temperature fields, day/night diurnal cycles, rock obstacles, sugar crystal food patches, and apex predators. |
| **`TASKS`** | `src/ants/task_system.ts` | Authoritative 13-state lifecycle state machine, utility score competition, dynamic role allocation, target reservation, and anti-loop unstuck evasion. |
| **`REWARD / LEARNING`** | `src/learning/` | Standardized `observe → act → reward → next observation → done` MDP adapter, Policy Gradient optimization, reward shaping, and neuromodulatory broadcast (DAN/OAN/5HT). |
| **`COMMUNICATION`** | `src/colony/communication.ts`| Local message in-flight bus for food discovery broadcasts, danger alerts, and recruitment requests without omniscient broadcast. |
| **`PHEROMONES`** | `src/pheromones/` | Multichannel spatial grid (`FOOD`, `HOME`, `RECRUITMENT`, `DANGER`, `TASK`, `EXPLORE`) governed by evaporation decay and 2D Laplacian diffusion. |
| **`COLONY`** | `src/colony/` | Decentralized superorganism coordinator managing Queen oviposition, brood lifecycle, subterranean chamber graph excavation, living bridges, and trophallactic food flows. |
| **`TRAINING`** | `src/learning/policy_trainer.ts` | Checkpoint serialization, offline Python package generation (`.antbrain`), and benchmark evaluation suites. |
| **`INSPECTION`** | `src/ui/` | "Why Did It Do That?" causal trace modal, real-time 3D connectome viewer, Predator control panel, food ledger, and telemetry drawers. |

---

## 3. Strict State Isolation Guarantees

1. **Private Neural Runtime State**:
   Every ant allocates private `Float32Array` buffers for membrane potentials, adaptation currents, spike histories, and refractory timers. No mutable neural state is ever shared across ant entities.
2. **Immutable Model Sharing**:
   Ants share only the immutable connectome structural graph, synaptic topology, and sensory input channel definitions.
3. **Failure Isolation**:
   If an individual ant's brain encounters an unexpected runtime anomaly, that ant transitions into a `RECOVERING` state. The error is isolated and never crashes the colony simulation or corrupts adjacent ants.

---

## 4. Universal Data Flow

```text
[World State & Pheromones]
           │
           ▼
[Sensory Snapshot (14-D)] ──► [Antennal Lobes & Optic Lobes]
                                         │
                                         ▼
                             [Kenyon Cells & Central Complex]
                                         │
                                         ▼
                             [Lateral Accessory Lobes (LAL)]
                                         │
                                         ▼
                              [Motor Output Decision]
                                         │
                                         ▼
                             [Authoritative Ant Action]
                                         │
                                         ▼
[Kinematic Physics Update] ◄── [Pheromone Deposition & Food Exchange]
```
