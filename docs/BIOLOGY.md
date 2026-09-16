# ANT BRAIN — Biological Reference & Scientific Foundations

## 1. Scope & Taxonomic Framing
This documentation delineates the biological foundations, empirical inspirations, and mathematical abstractions governing the **ANT BRAIN** artificial-life ecosystem. All models explicitly distinguish empirical biological facts from computational mesoscale abstractions.

---

## 2. Biological Fact vs. Computational Abstraction

### Empirical Biological Facts:
- **Haplodiploid Reproduction**: Ants exhibit arrhenotokoous haplodiploidy (fertilized diploid eggs develop into females/workers/queens; unfertilized haploid eggs develop into males).
- **Stomodeal Trophallaxis**: Liquid food sharing between colony members via the social crop (*proventriculus*) forms the distributed metabolic circulatory system of the superorganism.
- **Subterranean Multi-Chamber Architecture**: Nests consist of shafts and horizontal chambers with depth-stratified thermal and hygrometric gradients.
- **Polyethism & Labor Specialization**: Worker labor allocation is modulated by age (temporal polyethism), morphology, and emergent colony-level response thresholds.
- **Pheromone Trail Dynamics**: Semiochemicals (*trail, alarm, recruitment*) undergo passive spatial diffusion and exponential chemical decay.

### Computational Abstractions:
- **Mesoscale Energy Reserve Model**: Metabolic fuel is normalized on $[0, 1]$, separate from chronic physiological starvation stress.
- **10-Dimensional Homeostatic Need Vector**: Competing colony-level pressures without centralized scripting or global AI commanders.
- **Graph-Based Subterranean Nest Model**: Chambers are represented as graph nodes with capacity, environmental parameters, and connectivity edges.

---

## 3. Key Behavioral Loops

```
┌─────────────────────────────────────────────────────────┐
│              COLONY HOMEOSTATIC EQUILIBRIUM             │
│                                                         │
│   [FOOD STORE] ───► [TROPHALLAXIS] ───► [BROOD / QUEEN] │
│        ▲                                      │         │
│        │                                      ▼         │
│   [FORAGERS]  ◄─── [LABOR DEMAND] ◄─── [EGG PRODUCTION] │
│        │                                                │
│        ▼                                                │
│   [SUBTERRANEAN EXPANSION & STRUCTURAL INTEGRITY]       │
└─────────────────────────────────────────────────────────┘
```
