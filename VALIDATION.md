# ANTWIRE — Scientific Validation & Benchmark Protocol

This document details the standardized benchmark tasks and empirical validation targets for verifying colony-level emergence and multi-agent coordination in **AntWire**.

---

## 1. Automated Benchmark Suites

| Benchmark ID | Benchmark Name | Target Biological Observation | Validation Metric |
| :--- | :--- | :--- | :--- |
| `BENCH-FORAGING-01` | Foraging Throughput | Bounded mass harvest curves (*Wilson 1980*). | Mass harvested / worker-minute $\ge 2.5\text{ units}$. |
| `BENCH-FUNGUS-02` | Fungus Agriculture | Steady-state mycelium & *Escovopsis* containment (*Currie 1999*). | Garden contamination $< 0.15$, gongylidia yield $> 0.5\text{ units/min}$. |
| `BENCH-EXPANSION-03` | Subnest Logistics | Density-dependent excavation scaling (*Bollazzi 2002*). | Subnest planned when pop/space threshold reached. |
| `BENCH-DEFENSE-04` | Major Soldier Recruitment | Mandibular perimeter defense (*Wilson 1980*). | Predator neutralizations without queen loss. |

---

## 2. Qualitative Biological Validation Gates

1. **Founding Claustrum**: Foundress gyne survives cloistered bootstrap, nurtures first minim brood from somatic stores and infrabuccal fungal pellet.
2. **Polymorphic Division of Labor**: Minims remain predominantly in fungal crypts; mediae perform vegetation cutting; majors engage in defense.
3. **Pheromone Trail Bifurcation & Optimization**: Collective foraging selects shorter paths around obstacles via reinforcement and evaporation.
