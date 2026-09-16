# ANT BRAIN — Subterranean Nest Architecture & Graph Model

## 1. Structural Graph Representation
Subterranean ant nests are represented as a graph $G = (V, E)$:
- **Vertices $V$**: Chambers (Entrance, Granary, Brood Nursery, Queen Sanctum, Rest Gallery, Water Vault, Sentry Post, Refuse Middens).
- **Edges $E$**: Tunnels and vertical shafts connecting chambers.

Each chamber node $v_i \in V$ possesses:
- $\text{type} \in \{\text{ENTRANCE}, \text{FOOD\_STORAGE}, \text{BROOD\_NURSERY}, \text{QUEEN\_CHAMBER}, \dots\}$
- $\text{depth} \ge 0\text{ meters}$
- $\text{maxOccupancy}, \text{currentOccupancy}$
- $\text{temperature}, \text{humidity}$ (microclimatic stratification)
- $\text{structuralIntegrity} \in [0, 1]$

---

## 2. Dynamic Excavation & Growth
When population density exceeds chamber capacity or colony demographic demands increase:
1. `nestNeed` increases in the colony need vector.
2. Builder workers collect excavated material / resin from near the surface mound.
3. Builders transport material to excavation sites, progressively completing new specialized chambers and connecting tunnels.
