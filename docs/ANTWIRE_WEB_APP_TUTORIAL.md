# AntWire: Complete Beginner's Guide & Web App Tutorial

> **Created & Developed by [Nikhilesh H. Chavda](https://github.com/Nik-2208)**  
> **Repository:** [https://github.com/Nik-2208/AntWire](https://github.com/Nik-2208/AntWire)  
> **Live Showcase:** [AntWire Keyboard RL Demo](https://ant-brain-keyboard.vercel.app/)

---

## 1. What is AntWire?

**AntWire** is an open-source, interactive artificial-life laboratory and computational neuroscience sandbox. It simulates autonomous digital ants, each equipped with its own artificial neural brain, sensory suite, and metabolic system. 

Instead of scripting hardcoded ant paths, AntWire models the emergent intelligence of a **biological superorganism**: complex, organized colony behaviors arise naturally from individual ants making local decisions without any central orchestrator.

### The Core Problem AntWire Explores
1. **Emergent Coordination**: How simple local rules, decentralized chemical signaling (pheromones), and individual neural policies produce collective colony intelligence (foraging lines, nursery care, nest defense, and agriculture).
2. **Embodied Neurobiology & RL**: How artificial neural networks can balance continuous physiological needs (energy, hunger, fear, hydration) with environmental tasks.
3. **Reproducible Artificial Life**: Providing an open platform to train, inspect, ablate, and export computational animal brains (`.antbrain` packages).

---

## 2. High-Level Architecture: How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                      SIMULATION WORLD                       │
│  Food Patches • Pheromone Diffusion Grid • Predators • Nest │
└──────────────────────────────┬──────────────────────────────┘
                               │ Local Sensory Rays & Odors
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   INDIVIDUAL ANT AGENT                      │
│                                                             │
│  ┌─────────────────┐    ┌────────────────────────────────┐  │
│  │ Physiology /    │    │ ARTIFICIAL BRAIN               │  │
│  │ Homeostasis     │    │ • Sensory Encoder (14 inputs)  │  │
│  │ • Energy        │───▶│ • Neural Network Policy        │  │
│  │ • Starvation    │    │ • Neuromodulator (Dopamine)    │  │
│  │ • Starvation    │    │ • Motor Actuators (Throttle,   │  │
│  │ • Path Memory   │    │   Turn, Deposit, Grab/Deliver) │  │
│  └─────────────────┘    └───────────────┬────────────────┘  │
│                                         │                   │
│                                         ▼                   │
│                          Action Execution & Trajectory      │
└─────────────────────────────────────────────────────────────┘
```

### 1. Isolated Brain Runtimes
Every ant in AntWire is an independent agent with:
* Its **own isolated brain runtime** (no mutable weight or activation leakage between ants).
* Its **own physiology** (energy level, metabolic burn rate, carrying capacity, health).
* Its **own episodic memory buffer** and path integration state.

### 2. The 10-Dimension Decision Loop
Ants continuously evaluate utility across 10 biological dimensions without default random walking:
$$\text{SURVIVAL} \longleftrightarrow \text{FOOD} \longleftrightarrow \text{QUEEN} \longleftrightarrow \text{BROOD} \longleftrightarrow \text{NEST} \longleftrightarrow \text{DEFENSE} \longleftrightarrow \text{HYGIENE} \longleftrightarrow \text{REPRODUCTION} \longleftrightarrow \text{COLLABORATION} \longleftrightarrow \text{EXPLORATION}$$

If there is no urgent task outside, ants conserve energy by resting or waiting inside the nest rather than aimlessly wandering.

---

## 3. Key Biological & Computational Mechanics

### Roles & Caste System
Ants specialize dynamically based on colony needs and species capabilities:
* **Queen**: Foundress and reproductive engine. Synthesizes and lays eggs.
* **Foragers**: Locate food sources, harvest carbohydrates/protein, and deposit homeward pheromones.
* **Scouts**: High-speed explorers discovering distant food patches and surveying terrain.
* **Nurses**: Tend to the subterranean nursery, groom larvae, and feed the queen via trophallaxis.
* **Guards & Soldiers**: Patrol nest perimeter, attack predators, and release alarm pheromones.
* **Builders**: Excavate tunnels and maintain subnest chambers.
* **Transporters**: Relay heavy resource bundles between outer foragers and inner granaries.

### Queen Succession & Species Strategies
If a queen dies, AntWire executes species-specific succession rules:
* **Gamergate Succession** (*Harpegnathos saltator*): Workers initiate antennal dueling tournaments until a dominant worker establishes reproductive hierarchy.
* **Queen Rearing** (*Formica rufa*, *Atta cephalotes*): Workers build emergency queen cells and feed select larvae royal jelly.
* **Clonal Cycles** (*Ooceraea biroi*): Synchronized asexual parthenogenesis without queen dependence.

### Food Collection & Thermodynamic Conservation
* Food exists in finite quantities in the world.
* When a worker bites a food patch, food mass transfers into its mandibles.
* **Trophallaxis**: Satiated workers share liquid nutrients mouth-to-mouth with hungry nestmates or the queen.
* **Conservation Invariant**: Food in the environment + food carried + food stored + food metabolized + food decayed = exactly the total food spawned.

### Path Integration & Dead-Reckoning Homing
Ants do not rely solely on chemical trails. Each ant maintains an internal mathematical vector tracking its movement relative to the nest. Even if pheromone trails evaporate, an ant can compute a direct homing vector back to the nest entrance. If trapped in cyclical loops, an anti-loop heuristic triggers a stochastic re-orientation step.

### Pheromone Grid & Communication
AntWire calculates continuous chemical diffusion and evaporation for:
1. **Food Trails**: Intensified when foragers return home with food.
2. **Home / Nest Trails**: Deposited as ants venture outward.
3. **Alarm Signals**: Released during predator strikes to mob defenders.

---

## 4. Main App Pages & What Each Is For

| Navbar Tab | Page Name | Primary Purpose |
| :--- | :--- | :--- |
| 🌐 **World 3D** | Interactive Simulation | 3D/2D visual simulation viewport with live ant tracking, manual camera control, time controls, and territory manipulation. |
| 🐜 **Ant Lab** | Organism Inspector | Inspect individual ant morphology, current drive states, sensory ray projections, energy levels, and thought streams. |
| 👥 **Colony** | Superorganism Dashboard | View live colony population census, caste breakdown, food stores, birth/death rates, and task allocation metrics. |
| ✨ **Fungus Lab** | Attine Agriculture | Inspect symbiotic leafcutter fungus gardens, substrate biomass, mycelial growth rates, and aphid honeydew mutualism. |
| 🧬 **Castes & Roles** | Role Configuration | Adjust caste proportions, trigger reproductive flights, and inspect species profiles. |
| 🧠 **Brain Lab** | Connectome & Neural Lab | 3D interactive connectome viewer showing live synaptic firing, mushroom bodies, central complex, and antennal lobes. |
| ⚖️ **Food Ledger** | Conservation Panel | Real-time closed-system energy accounting verifying that no resource is created or lost without a physical cause. |
| 🎓 **Training** | Reinforcement Learning | Train ant neural policies using continuous reward functions, dopamine prediction errors, and parameter tuning. |
| 🧪 **Experiments** | Experimental Lab | Run reproducible experiment presets, mechanistic biological ablations, parameter sensitivity sweeps, and hypothesis tests. |
| 📢 **Community** | Real Firebase Hub | Download official models, submit feedback tickets, engage in developer discussions, file bugs, and upvote features. |
| 🗄️ **Data Hub** | Provenance & Datasets | Species profiles with DOI citations, reference anatomical atlases, and trajectory dataset exporters (`.json`). |
| ✨ **About** | System Information | Platform architecture overview, computational specifications, and research goals. |
| 📖 **Sources** | Scientific Literature | Peer-reviewed citations from myrmecology and computational neurobiology journals. |
| ⚙️ **Settings** | Configuration | Graphics presets (Low, Medium, High, Ultra), resolution scaling, simulation limits, and telemetry opt-out. |

---

## 5. Typical AntWire Research Workflow

Follow this step-by-step workflow to get the most out of AntWire:

```text
1. LOAD/INITIALIZE BRAIN
   └── Choose a neural policy preset in the "Training" or "Model Library" modal.

2. CHOOSE ENVIRONMENT & PRESET
   └── In "Experiments", select a preset (e.g. "Known Good Demo" or "Foraging Corridor").

3. SPAWN & OBSERVE COLONY
   └── Navigate to "World 3D", click "Add" to spawn workers and a queen, and watch initial foraging lines emerge.

4. INSPECT AN INDIVIDUAL ANT
   └── Click on any worker ant in the 3D viewport to open the "Ant Inspector" and view its live sensor rays and internal drives.

5. RUN AN ABLATION OR EXPERIMENT
   └── In "Experiments" → "Ablations", disable pheromones or memory to measure how foraging efficiency changes.

6. TRAIN & FINE-TUNE
   └── In "Training", run RL episodes to improve motor control and food delivery efficiency.

7. EXPORT MODEL PACKAGE
   └── Click "Model Library" → "Export .antbrain" to save your trained weights, Model Card, and hyperparameters as an open package.
```

---

## 6. Real Community & Firebase Integration

AntWire includes a real **Cloud Firestore** community backend:
* **Official Model Hub**: Download verified `.antbrain` models with cryptographic SHA-256 checksums.
* **Developer Discussions**: Post questions, share experiment configurations, and edit/delete your own threads.
* **Feedback & Bug Tracking**: Submit reproducible bug reports or feature ideas with live status tracking (`OPEN`, `TRIAGED`, `RESOLVED`).
* **Public Experiment Registry**: Publish multi-agent benchmark results with verifiable metrics.
* **Privacy & Offline Isolation**: If Firebase is unreachable, the core simulation and brain training run completely offline. Non-essential analytics can be disabled at any time in Community Privacy Settings.

---

## 7. How to Create a Custom Synthetic Task

Developers can create new environments and reward functions using the built-in `SyntheticTaskEngine`:

```typescript
import { SyntheticTaskEngine, SyntheticTaskDefinition } from './src/experiments/synthetic_task_engine';

const customTask: SyntheticTaskDefinition = {
  taskId: 'custom_labyrinth',
  name: 'Labyrinth Food Retrieval',
  rewardDescription: 'Positive reward for reaching target landmark; penalty for wall collisions',
  observationDimension: 14,
  actionDimension: 4,
  evaluateStep: (agentState, worldState) => {
    const distanceToTarget = Math.hypot(agentState.x - target.x, agentState.y - target.y);
    const reward = -0.01 + (distanceToTarget < 2.0 ? 10.0 : 0.0);
    const isDone = distanceToTarget < 2.0 || agentState.energy <= 0;
    return { reward, done: isDone };
  }
};
```

---

## 8. Important Scientific Disclaimer

> ### ⚠️ Scientific Status & Biological Distinctions
>
> * **Biological Inspiration, Not Literal Replication**: AntWire's neural networks, connectome maps, and sensory rays are **computational abstractions** designed for artificial intelligence research and educational simulation.
> * **No Living Connectome Claim**: While brain regions (Mushroom Bodies, Central Complex, Antennal Lobes) are structurally inspired by published myrmecological literature, they are digital mathematical models, not a physical biological brain emulation.
> * **Literature References**: Biological facts, species parameters, and citations are documented in the **Data Hub** and **Sources** tabs with peer-reviewed DOIs.

---

## 9. Author & License

* **Author**: [Nikhilesh H. Chavda](https://github.com/Nik-2208)
* **GitHub Repository**: [https://github.com/Nik-2208/AntWire](https://github.com/Nik-2208/AntWire)
* **Portfolio**: [https://nik-portfolio-lime.vercel.app/](https://nik-portfolio-lime.vercel.app/)
* **License**: MIT Open-Source License
