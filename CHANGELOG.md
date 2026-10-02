# Changelog

All notable changes to the **ANTWIRE** platform will be documented in this file.

## [2.5.0] - 2026-09-24
### Platform Polish, Task Environment API & Open-Source Readiness
- **Task Environment Adapter (`BaseTaskEnvironment`)**: Standardized MDP interface (`observe → act → reward → next observation → done`) enabling developers to create custom environments (Foraging, Navigation, Keyboard RL, Transport, Construction, Defense) without modifying the core brain.
- **Predator Gameplay Control Subsystem**: Dedicated minimal predator control panel with validated `predator.speed` and `predator.damage` runtime mutations, zero per-frame duplicate attacks, and real somatic consequence tracking.
- **Lifecycle & Brain Runtime Stability**: Authoritative `TaskSystem` lifecycle states (`EXPLORING`, `WORKING`, `MOVING`, `HELPING`, `IDLE`, `RECOVERING`) eliminating false `FAILED` inspector states.
- **Full Offline `.antbrain` Specification**: Standalone pure-Python executable runtime (`run_model.py`, `train.py`, `infer.py`, `inspect.py`) with zero ML framework dependencies.
- **Documentation Suite**: Comprehensive guides for Architecture, Environment API, `.antbrain` Format, Training, and Colony Superorganism.

## [2.0.0] - 2026-09-18
### 55,000-Neuron Connectome & Superorganism Architecture
- **Synthetic 55K Connectome**: 55,000 neurons across 12 anatomical insect neuropils (Antennal Lobes, Mushroom Bodies, Central Complex, Subesophageal Zone, Lateral Accessory Lobes) with Glorot/He sparse synaptic initialization (~357,500 edges).
- **Independent Per-Ant Runtimes**: Isolated TypedArray memory buffers per ant (`Float32Array` activations, membrane potentials, refractory clocks, and synaptic weights) with immutable connectome sharing.
- **Attine Fungus Agriculture**: Subterranean fungus gardens, leaf pulping, *Leucoagaricus* cultivation, and nutrient flow economics.
- **Dynamic Division of Labor**: Bonabeau response threshold labor allocation across 9 specialized polymorphic castes.
- **Living Bridges & Stigmergy**: Collective tensile bridge formation over terrain chasms.

## [1.0.0] - 2026-09-14
### Initial Architecture & Vertical Slices
- **3D World & Simulation Engine**: Decoupled 60Hz deterministic physics/simulation loop and Three.js rendering pipeline.
- **Sensory Subsystem**: Multi-channel antennae chemical raycasts (Left, Center, Right), food gradient, nest homing gradient, and predator threat detection.
- **Internal Body & Motivational Drives**: Real-time energy, hunger, health, threat level, and weightings (food seeking, exploration, homing, threat avoidance).
- **Rule-Based & Extensible Policy**: Pluggable `AntController` system with explainable decision vectors.
- **Pheromone Field**: Spatial 2D multi-channel grid with continuous deposition, 2D Laplacian diffusion, and exponential evaporation decay.
- **Real-Time Instrumentation**: "ANT THOUGHT STREAM" Digital Decision Trace, real-time "WHY DID IT DO THAT?" diagnostic inspector, and live sensory telemetry.
- **Colony & Queen**: Nest chambers, Queen egg-laying cycle, brood progression (Egg -> Larva -> Pupa -> Adult), and colony food stores.
- **Predator AI**: Predatory beetle entities with detection cones, pursuit mechanics, and alarm pheromone trigger responses.
- **UI / UX**: Scientific Laboratory Dark Theme, dual Simple Mode / Research Mode, interactive world modification tools (food paint, predator spawn, obstacle place), parameter tuning dashboard, and experiment presets.
