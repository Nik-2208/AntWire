# ANTWIRE — Extensible Computational Ant-Brain, Individual Organism & Superorganism Platform

> **Created & Developed by [Nikhilesh H. Chavda](https://nik-portfolio-lime.vercel.app/)**  
> *Experimental Artificial Life, Computational Insect Neurobiology & Multi-Agent Emergence Platform*  
> **Copyright © 2026 Nikhilesh H. Chavda. All Rights Reserved.**

[![Author Portfolio](https://img.shields.io/badge/Portfolio-Nikhilesh%20H.%20Chavda-06b6d4?style=flat&logo=vercel)](https://nik-portfolio-lime.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Nik--2208-181717?style=flat&logo=github)](https://github.com/Nik-2208)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Nikhilesh%20Chavda-0077B5?style=flat&logo=linkedin)](https://www.linkedin.com/in/nikhilesh-chavda-2b779533a/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Tests: 100% Passing](https://img.shields.io/badge/Tests-64%20Passing-brightgreen.svg)]()
[![Live Keyboard RL](https://img.shields.io/badge/Live%20Demo-Keyboard%20RL%20Showcase-purple.svg)](https://ant-brain-keyboard.vercel.app/)

---

## 1. Overview & Vision

**ANTWIRE** is an open-source, extensible computational ant-brain, individual-ant organism, and colony/superorganism platform designed for developers, roboticists, and computational biologists worldwide to **understand, modify, train, and build new insect tasks and environments for**.

AntWire bridges computational neurobiology and multi-agent reinforcement learning:
- **Independent Neural Runtime**: Each ant instantiates an isolated 55,000-neuron model runtime with private synapses, activation states, synaptic plasticity, and working memory.
- **Gym-Style Task & Environment API**: Build new tasks (`observe → act → reward → next observation → done`) without touching core neural internals.
- **Stigmergic & Pheromone Mechanics**: Physical 6-channel diffusion/decay fields with localized sensory sampling.
- **Emergent Superorganism Dynamics**: Dynamic threshold task allocation (foraging, excavating, nursing, patrolling), fungus agriculture, self-assembling living bridges, and closed thermodynamic energy accounting.
- **Interactive Inspection**: Real-time causal tracing (*"Why did the ant do that?"*), 3D neuropil atlas, and live neural spiking raster viewers.

---

## 2. Product Identity & Authorship

* **Product Name**: **ANTWIRE**
* **Goal**: An extensible computational ant-brain + individual-ant + colony/superorganism platform.
* **Creator & Developer**: **Nikhilesh H. Chavda**
* **GitHub**: [https://github.com/Nik-2208](https://github.com/Nik-2208)
* **LinkedIn**: [https://www.linkedin.com/in/nikhilesh-chavda-2b779533a/](https://www.linkedin.com/in/nikhilesh-chavda-2b779533a/)
* **Portfolio**: [https://nik-portfolio-lime.vercel.app/](https://nik-portfolio-lime.vercel.app/)
* **Live Showcase**: [https://ant-brain-keyboard.vercel.app/](https://ant-brain-keyboard.vercel.app/) (AntWire Keyboard RL — Trained Brain Demonstration)
* **Copyright**: © 2026 Nikhilesh H. Chavda. All Rights Reserved.

---

## 3. Documentation Index

Detailed developer and scientific guides are maintained in the repository:

| Document | Description |
| :--- | :--- |
| **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** | Deep architectural breakdown of all 11 core subsystems & per-ant memory isolation |
| **[ENVIRONMENT_API.md](docs/ENVIRONMENT_API.md)** | Step-by-step developer tutorial for creating custom tasks & environments |
| **[ANTBRAIN_FORMAT.md](docs/ANTBRAIN_FORMAT.md)** | Technical specification for `.antbrain` models, weights, and offline Python runners |
| **[TRAINING.md](docs/TRAINING.md)** | Reinforcement learning, policy gradient, reward shaping, and neuromodulation guide |
| **[COLONY_SUPERORGANISM.md](docs/COLONY_SUPERORGANISM.md)** | Superorganism division of labor, pheromone kinetics, living bridges & agriculture |
| **[SECURITY.md](docs/SECURITY.md)** | Security hardening, threat mitigations, path traversal defense & rate limits |
| **[PRIVACY.md](docs/PRIVACY.md)** | Zero-PII policy, anonymous telemetry, local-first computing & opt-out controls |
| **[PROVENANCE.md](docs/PROVENANCE.md)** | Model provenance, evidence tiers, SHA-256 checksums & dataset attribution |
| **[CONTRIBUTING.md](CONTRIBUTING.md)** | Open-source contribution guidelines, coding standards & review checklist |
| **[CHANGELOG.md](CHANGELOG.md)** | Version history and milestone release documentation |
| **[AUTHORS.md](AUTHORS.md)** | Author & developer information |
| **[CITATION.cff](CITATION.cff)** | Academic citation format for research referencing AntWire |

---

## 4. Scientific Positioning & Biological Transparency

To preserve absolute scientific transparency and integrity, AntWire strictly categorizes all claims:

```text
[BIOLOGICAL FACT]          Empirically verified entomological and neuroanatomical literature
[BIOLOGICALLY INSPIRED]    Architectures based on biological principles (e.g., Mushroom Body Calyx)
[COMPUTATIONALLY MODELLED] Mathematical abstractions (e.g., LIF neurons, spatial diffusion grids)
[SPECULATIVE]              Computational hypotheses undergoing exploratory testing
```

> **Important**: AntWire is an independent computational research platform and does **not** claim to provide an experimentally reconstructed complete biological connectome. References to projects such as FlyWire ([https://flywire.ai/](https://flywire.ai/)) serve solely as conceptual inspiration for web-based neural exploration.

---

## 5. System Architecture: 11 Clean Subsystems

AntWire enforces strict separation of concerns across 11 distinct computational layers:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        1. ANT BRAIN MODEL                              │
│         Canonical 55K-Neuron Topology, Synaptic Weight Arrays          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼ (Instantiation)
┌────────────────────────────────────────────────────────────────────────┐
│                        2. ANT RUNTIME                                  │
│         Isolated Per-Ant Neuron Voltages, Synaptic Plasticity, Memory  │
└──────┬────────────────────────────┬─────────────────────────────┬──────┘
       ▼                            ▼                             ▼
┌──────────────┐             ┌──────────────┐              ┌─────────────┐
│ 3. BODY &    │             │ 4. SENSORY & │              │ 5. MOTOR &  │
│ PHYSIOLOGY   │             │ PERCEPTION   │              │ ACTUATION   │
│ Energy, Mass │             │ 14-D Vector  │              │ Steering &  │
│ Mandible     │             │ Bilateral    │              │ Grasping    │
└──────┬───────┘             └──────┬───────┘              └──────┬──────┘
       │                            │                             │
       └────────────────────────────┼─────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               6. TASK ENVIRONMENT ADAPTER (Gym-Style MDP)              │
│       observe(ant) ──► act(ant, motor) ──► reward ──► next_obs ──► done│
└──────┬────────────────────────────┬─────────────────────────────┬──────┘
       ▼                            ▼                             ▼
┌──────────────┐             ┌──────────────┐              ┌─────────────┐
│ 7. LEARNING  │             │ 8. PHEROMONE │              │ 9. COLONY   │
│ Reward & DA/ │             │ Chemical     │              │ Division of │
│ Octopamine   │             │ Diffusion    │              │ Labor & Nest│
└──────┬───────┘             └──────┬───────┘              └──────┬──────┘
       │                            │                             │
       └────────────────────────────┼─────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      10. ENVIRONMENT & WORLD                           │
│       Spatial Hash Grid, Obstacles, Food Patches, Predators, Nests     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      11. INSPECTION & TELEMETRY                        │
│         Causal Tracing ("Why did it do that?"), 3D Atlas, Raster       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Extensibility: Creating Custom Tasks in 5 Minutes

Developers can create new environments without modifying the brain:

```typescript
import { BaseTaskEnvironment, TaskEnvironmentRegistry } from './learning/task_environment_adapter';

export class CustomMazeTaskEnvironment extends BaseTaskEnvironment {
  readonly id = 'maze_navigation';
  readonly name = 'Maze Navigation Task';
  readonly description = 'Guide the ant through a procedural labyrinth to reach the target.';

  observe(ant: AntEntity, world: World): Float32Array {
    const obs = new Float32Array(14);
    // Fill custom 14-D sensory observation vector...
    return obs;
  }

  step(ant: AntEntity, action: MotorOutput, world: World): TaskStepResult {
    // 1. Apply motor actuation
    ant.vx = Math.cos(ant.heading) * action.forwardSpeed;
    ant.vy = Math.sin(ant.heading) * action.forwardSpeed;

    // 2. Compute scalar reward
    const reward = this.calculateReward(ant, world);

    // 3. Return canonical Gym step result
    return {
      observation: this.observe(ant, world),
      reward,
      done: this.isDone(ant),
      info: { success: reward > 10.0 }
    };
  }

  reset(ant: AntEntity, world: World): Float32Array {
    ant.x = 100;
    ant.y = 100;
    return this.observe(ant, world);
  }
}

// Register globally
TaskEnvironmentRegistry.register(new CustomMazeTaskEnvironment());
```

See **[ENVIRONMENT_API.md](docs/ENVIRONMENT_API.md)** for complete examples including multi-agent cooperation, predator defense, and keyboard control.

---

## 7. Quick Start & Local Development

### Prerequisites
- Node.js 18+ & npm

```bash
# Clone the repository
git clone https://github.com/Nik-2208/AntWire.git
cd AntWire

# Install dependencies
npm install

# Run complete test suite (100% passing)
npx vitest run

# Start development server
npm run dev
```

Open [http://localhost:5173/](http://localhost:5173/) in any modern web browser.

---

## 8. Standalone Offline Python Model Execution

AntWire exports `.antbrain` model archives containing pure Python inference scripts:

```bash
# Unpack model archive
unzip antbrain_v2_standard.zip
cd antbrain_model/

# 1. Test standalone neural inference
python run_model.py

# 2. Inspect 55K-neuron connectome and synaptic weights
python inspect.py

# 3. Train on custom offline environment
python train.py --episodes 1000

# 4. Multi-agent swarm evaluation
python infer.py --ants 25
```

---

## 9. Scientific References

1. **Wilson, E. O. (1980)**. *Caste and division of labor in leaf-cutter ants (Atta cephalotes)*. Behavioral Ecology and Sociobiology.
2. **Hart, T. et al. (2023)**. *Sparse and stereotyped olfactory circuits in the clonal raider ant brain*. Cell Reports.
3. **Buehlmann, C. et al. (2020)**. *Visual navigation in wood ants: Central complex and mushroom body integration*. Journal of Experimental Biology.
4. **Bonabeau, E. et al. (1996)**. *Response threshold models for division of labor in social insects*. Physical Review E.
5. **Reid, C. R. et al. (2015)**. *Army ants dynamically adjust living bridges to maximize traffic*. PNAS.
6. **Dacke, M. et al. (2016)**. *How ants use celestial compass cues for navigation*. Current Biology.

---

## 10. Authorship & Citation

```text
ANTWIRE
Created & Developed by Nikhilesh H. Chavda

Portfolio: https://nik-portfolio-lime.vercel.app/
GitHub:    https://github.com/Nik-2208
LinkedIn:  https://www.linkedin.com/in/nikhilesh-chavda-2b779533a/

Copyright © 2026 Nikhilesh H. Chavda. All Rights Reserved.
```

To cite AntWire in academic research:
```bibtex
@software{chavda2026antwire,
  author = {Chavda, Nikhilesh H.},
  title = {AntWire: An Extensible Computational Ant-Brain, Individual-Ant, and Colony Platform},
  year = {2026},
  url = {https://github.com/Nik-2208/AntWire}
}
```
