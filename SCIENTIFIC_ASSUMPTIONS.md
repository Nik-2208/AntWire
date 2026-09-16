# ANTWIRE — Scientific Assumptions & Methodology Taxonomy

In accordance with strict scientific integrity principles, **AntWire** does not claim to simulate a real biological ant brain in exact 1:1 neuroanatomy. Instead, every simulation mechanic, formula, and visual model is explicitly classified into one of the established methodological tiers:

---

## 1. Classification Taxonomy

### 🔬 [ESTABLISHED / BIOLOGICAL FACT]
Mechanisms directly validated by peer-reviewed entomology and neuroscience literature.
- **Chemosensory Antennae**: Ants possess paired mobile antennae with specialized sensilla basiconica/trichodea that detect volatile and contact hydrocarbons with left/right concentration gradients (tropotaxis).
- **Dual Trail Pheromones**: Many foraging ant species (e.g., *Lasius niger*, *Atta cephalotes*) utilize distinct chemical markers for food recruitment versus orientation back to the nest.
- **Brood Development Stages**: Holometabolous life cycle strictly progresses through discrete stages: Egg $\to$ Larva $\to$ Pupa $\to$ Adult.

### 🧪 [SUPPORTED / BIOLOGICAL INSPIRATION]
Concepts inspired by documented biological patterns but adapted for algorithmic tractability.
- **Motivational State / Drive Reduction**: Modeling internal homeostatic regulation (energy, water, risk) as vector potentials influencing action selection (inspired by Lorenz/Tinbergen ethology).
- **Stigmergy & Local Communication**: Global collective structures (foraging trails, nest clusters) emerging purely through local environmental modifications without centralized executive control.
- **Age Polyethism**: Dynamic shifting of worker roles (nursing $\to$ nest maintenance $\to$ foraging) as a function of age and colony demographic feedback.

### 🐜 [SPECIES_SPECIFIC]
Traits documented in specific ant taxa that must not be generalized across all ants.
- **Attine Fungus Agriculture**: Specific to attine ants (e.g., *Atta cephalotes*); not present in non-fungus-farming ant species.
- **Gamergate Dominance Hierarchies**: Specific to species such as *Harpegnathos saltator*.

### 💻 [MODELLED / COMPUTATIONAL ABSTRACTION]
Mathematical and algorithmic approximations used to represent physical/chemical laws.
- **Pheromone Field Grid**: 2D/3D discretized grid representing continuous chemical evaporation via exponential decay ($C_{t+1} = C_t \cdot e^{-\lambda \Delta t}$) and diffusion via discrete Laplacian kernels.
- **Bounded Path Integration Memory**: Finite circular FIFO buffer storing estimated vector displacement from nest rather than full continuous neural map coordinates.
- **Spatial Hash Grid**: Partitioning world space into discrete bins for $O(1)$ proximity and collision lookups.

### ⚙️ [ENGINEERING DECISION]
Choices made for real-time web performance, rendering efficiency, and developer usability.
- **Decoupled 60Hz Simulation Loop**: Fixed $\Delta t = 0.016\text{s}$ discrete integration with variable Three.js rendering interpolation to ensure reproducible determinism across different screen refresh rates.
- **Instanced 3D Mesh Rendering**: Low-poly anatomical ant meshes (Head, Thorax, Gaster/Abdomen, 6 Legs, Antennae) rendered with hardware instancing for scalable population rendering.
- **TypeScript Modular State Engine**: Typed data structures for high developer inspectability and zero hidden global states.

### 💡 [SPECULATIVE / HYPOTHESIS]
Experimental behavioral rules or parameterizations undergoing active computational investigation.
- **Adaptive Pheromone Gain**: The hypothesis that individual foragers dynamically modulate their deposition rate based on the perceived nutritional quality and distance from nest.
- **Social Grooming & Contact Transfer**: Testing whether short-range cuticular hydrocarbon exchange accelerates colony-wide alarm propagation during predator incursions.

---

## 2. Species Reference Profile
- **Current Model**: `Species Profile Alpha (Formica experimenta)`
- **Designation**: Biologically inspired experimental generalist forager.
- **Attributes**: Solitary scouting with trail recruitment, queen-guided brood homeostasis, chemical alarm response, and territorial defense against predatory arachnids/beetles.
