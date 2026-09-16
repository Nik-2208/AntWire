# ANT BRAIN — Repeatable Scientific Experiments Registry

This registry documents predefined and custom experiment configurations designed to run with deterministic seeds.

---

## Predefined Scenario Experiments

### EXP-001: First Foraging & Solitary Scouting
- **Hypothesis**: A solitary worker ant utilizing chemical tropotaxis will locate a distant food patch, collect a resource packet, deposit an orientation trail, and safely navigate back to the nest entrance.
- **Population**: 1 Worker Ant.
- **Environment**: Open flat terrain, 1 Nest at (0, 0), 1 Food Cluster at (+15, +10).
- **Key Metrics**: Time to discovery, path tortuosity, energy consumed, return trip efficiency.

### EXP-002: Emergent Collective Foraging Trail
- **Hypothesis**: Given multiple scouts, individual trail reinforcement and decay will lead to the spontaneous emergence of a stable, minimum-distance highway between nest and food source.
- **Population**: 25 Worker Ants.
- **Environment**: Medium terrain, 2 Food Clusters (near vs far).
- **Key Metrics**: Trail convergence time, collective food throughput (units/sec), worker allocation ratio.

### EXP-003: Chemical Trail Decay & Environmental Volatility
- **Hypothesis**: Increasing temperature/decay rate will disrupt long-distance trail coherence, favoring high individual exploration over collective exploitation.
- **Variables**: Pheromone decay coefficient $\lambda \in [0.001, 0.05]$.
- **Key Metrics**: Food retrieval rate under high vs low decay.

### EXP-004: Predator Evasion & Alarm Stigmergy
- **Hypothesis**: Introducing an active predator entity causes ants sensing threat to deposit alarm pheromone, diverting foraging columns and reducing mortality rate.
- **Entities**: 1 Predatory Beetle, 30 Worker Ants.
- **Key Metrics**: Worker survival rate, alarm propagation speed, foraging interruption duration.

### EXP-005: Colony Brood Cycle & Demographics
- **Hypothesis**: Ingested food delivered to the nest chamber allows the Queen to lay eggs that hatch through larval and pupal stages into functional workers, sustaining colony population against natural senescence.
- **Duration**: 5000 simulation ticks (Accelerated 10x).
- **Key Metrics**: Egg production rate, adult emergence rate, net colony biomass growth.
