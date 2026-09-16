# Changelog

All notable changes to the **ANT BRAIN** platform will be documented in this file.

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
