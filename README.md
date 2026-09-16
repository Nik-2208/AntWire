# ANTWIRE — Biologically Inspired Ant Intelligence, Brain Simulation & Colony Behavior

> **Created & Developed by [Nikhilesh H. Chavda](https://nik-portfolio-lime.vercel.app/)**  
> *Experimental Artificial Life, Computational Insect Neurobiology & Multi-Agent Emergence Platform*  
> **Copyright © 2026 Nikhilesh H. Chavda. All Rights Reserved.**

[![Author Portfolio](https://img.shields.io/badge/Portfolio-Nikhilesh%20H.%20Chavda-06b6d4?style=flat&logo=vercel)](https://nik-portfolio-lime.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Nik--2208-181717?style=flat&logo=github)](https://github.com/Nik-2208)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Nikhilesh%20Chavda-0077B5?style=flat&logo=linkedin)](https://www.linkedin.com/in/nikhilesh-chavda-2b779533a/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Tests: 100% Passing](https://img.shields.io/badge/Tests-64%20Passing-brightgreen.svg)]()

---

## 1. Overview & Vision

**AntWire** is an experimental biologically informed computational platform inspired by ant nervous systems, insect behavior, and collective colony intelligence. 

AntWire develops computational abstractions for:
- Ant-like sensory perception, chemical olfaction, and antennae dynamics
- Multi-scale neural circuit simulation (Antennal Lobes, Mushroom Bodies, Central Complex, Subesophageal Zone)
- Individual decision-making, motivational drives, and reinforcement learning
- Pheromone-mediated spatial communication and stigmergic coordination
- Emergent division of labor, polymorphic caste scaling, subterranean nest construction, and fungus agriculture

---

## 2. Product Identity & Authorship

* **Product Name**: **ANTWIRE**
* **Subtitle**: Biologically Inspired Ant Intelligence, Brain Simulation & Colony Behavior
* **Creator / Developer**: **Nikhilesh H. Chavda**
* **GitHub**: [https://github.com/Nik-2208](https://github.com/Nik-2208)
* **LinkedIn**: [https://www.linkedin.com/in/nikhilesh-chavda-2b779533a/](https://www.linkedin.com/in/nikhilesh-chavda-2b779533a/)
* **Portfolio**: [https://nik-portfolio-lime.vercel.app/](https://nik-portfolio-lime.vercel.app/)
* **Copyright**: © 2026 Nikhilesh H. Chavda

---

## 3. Scientific Positioning & FlyWire Distinction

To preserve absolute scientific transparency and integrity:

> **AntWire is an independent computational research project and does NOT claim to provide an experimentally reconstructed complete ant connectome.**

* **FlyWire Relation**: FlyWire ([https://flywire.ai/](https://flywire.ai/)) is a large-scale Drosophila connectomics effort providing an expert-proofread whole-brain connectome. AntWire is conceptually inspired by FlyWire's interactive web-based neural exploration paradigms, but AntWire models computational ant-inspired architectures and does not reproduce or claim equivalence to FlyWire's empirical Drosophila dataset.
* **Evidence Hierarchy**: Every mechanism and claim in AntWire is classified under rigorous evidence tiers:
  * 🔬 **`[ESTABLISHED]`**: Empirically verified entomological and neuroanatomical literature.
  * 🧪 **`[SUPPORTED]`**: Established biological principles observed across multiple insect species.
  * 🐜 **`[SPECIES_SPECIFIC]`**: Traits documented in specific ant taxa (e.g., *Atta cephalotes*, *Harpegnathos saltator*).
  * 💻 **`[MODELLED]`**: Mathematical and computational representations (e.g. LIF equations, spatial pheromone grids).
  * 🧠 **`[INFERRED]`**: Homologous neural circuit abstractions.
  * 💡 **`[SPECULATIVE]`**: Research hypotheses undergoing computational testing.

---

## 4. Core System Architecture

Each individual artificial ant operates as an autonomous agent with an independent, unshared runtime state, memory instance, and sensory-motor pipeline.

```text
                     ANTWIRE COMPUTATIONAL MODEL
                                  │
      ┌───────────────────────────┼───────────────────────────┐
      ▼                           ▼                           ▼
   ANT #1                      ANT #2                      ANT #N
┌───────────────┐           ┌───────────────┐           ┌───────────────┐
│ Neural Engine │           │ Neural Engine │           │ Neural Engine │
│ Neuron State  │           │ Neuron State  │           │ Neuron State  │
│ Sensory Vector│           │ Sensory Vector│           │ Sensory Vector│
│ Memory Cache  │           │ Memory Cache  │           │ Memory Cache  │
│ Motive Drives │           │ Motive Drives │           │ Motive Drives │
└───────┬───────┘           └───────┬───────┘           └───────┬───────┘
        │                           │                           │
        └───────────────────────────┼───────────────────────────┘
                                    ▼
                          ENVIRONMENTAL STIGMERGY
             ├── Spatial Hash Grid & Physical Obstacle Collisions
             ├── Multichannel Pheromone Evaporation/Diffusion Fields
             ├── Multi-Chamber Subterranean Nests & Dynamic Subnests
             ├── Attine Agriculture & Gongylidia Nutrient Flows
             ├── Direct Worker-to-Worker Message Communication
             └── Emergent Living Bridges & Cooperative Transport
```

---

## 5. Nervous System & Neural Circuit Simulation

AntWire provides a multi-scale insect brain atlas and neural execution engine spanning head-to-toe neuropil regions:

```text
[ANTENNAE & HEAD SENSILLA]
        │ (Acetylcholine / Olfactory Receptor Neurons)
        ▼
[ANTENNAL LOBES (AL)]
  ├── Microglomeruli (Local GABAergic Interneurons)
  └── Uniglomerular Projection Neurons (PNs: ACh)
        │
   ┌────┴───────────────────────────┐
   ▼                                ▼
[MUSHROOM BODY (MB)]      [CENTRAL COMPLEX (CX)]
  ├── Calyx (Dendritic claws)     ├── Ellipsoid Body (EB: 16-wedge compass)
  ├── Peduncle (Kenyon cells)     ├── Protocerebral Bridge (PB: Angular velocity)
  └── Lobes (MBONs + DAN/OAN)     ├── Fan-Shaped Body (FB: Path Integration)
   │                              └── Noduli (NO: Step odometer)
   └───────────────┬────────────────┘
                   ▼
        [PREMOTOR NETWORK (LAL & SEZ)]
          ├── Lateral Accessory Lobe (LAL: Bilateral steering bias)
          └── Subesophageal Zone (SEZ: Mandibular grasp & Trophallaxis)
                   │
                   ▼ (Descending Interneurons)
        [VENTRAL NERVE CORD (VNC)]
          ├── Prothoracic Ganglion (T1: Front legs & grooming)
          ├── Mesothoracic Ganglion (T2: Tripod stance support)
          ├── Metathoracic Ganglion (T3: Propulsion & bridge grip)
          └── Abdominal / Gaster Ganglia (Stridulation & Trail glands)
```

---

## 6. Key Features & Modules

1. **Interactive 3D Insect Brain Atlas & Neuropil Viewer**: Multi-scale 3D visualizer supporting whole nervous system $\to$ brain region $\to$ circuit $\to$ neuron $\to$ synapse.
2. **"Why Did It Do That?" Causal Trace Panel**: Instant inspection of the exact sensory, neural, motivational, and environmental causes behind any ant's decision.
3. **Training Arena & Policy Optimizer**: Reinforcement learning sandbox with persistent checkpoints, custom reward decomposition, and task transfer engines (Forage, Maze, Trail, Evasion, Robotic Joint Tracking).
4. **Universal Biological Knowledge Base (`BioInfoTrigger`)**: Centralized facts, computational abstractions, evidence tiers, and clickable peer-reviewed sources with hover previews and full modal dialogs.
5. **One-Click Executable Model Package Generator**: Generates ready-to-run `.zip` packages with complete offline Python runtimes (`run_model.py`, `train.py`, `infer.py`, `inspect.py`).
6. **Colony Superorganism & Queen Life Cycle**: Polyandrous queen, claustral founding, trophic egg synthesis, and holometabolous brood development.
7. **Attine Fungus Agriculture**: Leaf pulping, *Leucoagaricus* gongylidia harvesting, *Escovopsis* pathogen mitigation, and midden refuse chambers.
8. **Subterranean Multi-Chamber Nest & Subnests**: Real-time excavated tunnels, food storage, brood nurseries, and dynamic secondary satellite nests.
9. **Self-Assembling Living Bridges**: Dynamic collective bridging across terrain ravines and acrobatic climbing towers.
10. **Closed-System Thermodynamic Food Ledger**: Audited mass and energy conservation enforcing strict conservation of matter.

---

## 7. Installation & Local Development

```bash
# Clone the repository
git clone https://github.com/Nik-2208/ant-brain.git
cd ant-brain

# Install dependencies
npm install

# Run automated verification test suite
npx vitest run

# Launch local development server
npm run dev
```

Open [http://localhost:5173/](http://localhost:5173/) in your modern WebGL-enabled browser.

---

## 8. Standalone Offline Python Model Execution

When you download a model package from the **Training Lab**, extract and run immediately:

```bash
# Extract model archive
unzip ant_brain_model_v1_standard.zip
cd ant_brain_model/

# 1. Run neural inference
python run_model.py

# 2. Inspect connectome and neurons
python inspect.py

# 3. Train on new task
python train.py

# 4. Multi-agent simulation
python infer.py
```

---

## 9. Scientific Literature References

1. **Wilson, E. O. (1980)**. *Caste and division of labor in leaf-cutter ants (Atta cephalotes)*. Behavioral Ecology and Sociobiology.
2. **Hart, T. et al. (2023)**. *Sparse and stereotyped olfactory circuits in the clonal raider ant brain*. Cell Reports.
3. **Buehlmann, C. et al. (2020)**. *Visual navigation in wood ants: Central complex and mushroom body integration*. Journal of Experimental Biology.
4. **Bonabeau, E. et al. (1996)**. *Response threshold models for division of labor in social insects*. Physical Review E.
5. **Reid, C. R. et al. (2015)**. *Army ants dynamically adjust living bridges to maximize traffic*. PNAS.
6. **Dacke, M. et al. (2016)**. *How ants use celestial compass cues for navigation*. Current Biology.
7. **FlyWire Consortium (2024)**. *Whole-brain connectome of Drosophila melanogaster*. Nature. [https://flywire.ai/](https://flywire.ai/)

---

## 10. Authorship & Attribution

```text
ANTWIRE
Created & Developed by Nikhilesh H. Chavda

Portfolio: https://nik-portfolio-lime.vercel.app/
GitHub:    https://github.com/Nik-2208
LinkedIn:  https://www.linkedin.com/in/nikhilesh-chavda-2b779533a/

Copyright © 2026 Nikhilesh H. Chavda. All Rights Reserved.
```
