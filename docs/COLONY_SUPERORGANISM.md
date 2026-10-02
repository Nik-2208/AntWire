# AntWire — Colony Superorganism & Collective Intelligence

> **Created & Developed by [Nikhilesh H. Chavda](https://nik-portfolio-lime.vercel.app/)**  
> *Stigmergic Coordination, Dynamic Division of Labor, and Collective Homeostasis*  
> GitHub: [https://github.com/Nik-2208](https://github.com/Nik-2208) | LinkedIn: [https://www.linkedin.com/in/nikhilesh-chavda-2b779533a/](https://www.linkedin.com/in/nikhilesh-chavda-2b779533a/)

---

## 1. Decentralized Superorganism Architecture

In AntWire, the colony has **no central omniscient controller**. Complex collective behaviors emerge entirely through:
1. **Individual Ant Decisions**: Autonomous neural evaluation of internal motivational drives and local sensory inputs.
2. **Environmental Stigmergy**: Shared chemical pheromone trails, physical food patches, and subterranean tunnel topology.
3. **Local Communication**: Distance-limited worker messaging for resource alerts and distress calls.

---

## 2. Dynamic Division of Labor (Response Threshold Model)

Workers adopt specialized behavioral roles based on the Bonabeau et al. (1996) response threshold dynamics:

$$P(\text{engage in task } j) = \frac{s_j^2}{s_j^2 + \theta_{ij}^2}$$

Where:
- $s_j$: Colony stimulus / demand intensity for task $j$ (e.g. food demand, nursery care, defense)
- $\theta_{ij}$: Individual worker $i$'s internal response threshold for task $j$

### Supported Worker Roles:
- **`FORAGER`**: Long-range search and food retrieval.
- **`SCOUT`**: Wide perimeter exploration and trail deposition.
- **`NURSE`**: Queen and brood tending in the subterranean nursery.
- **`BUILDER`**: Subterranean chamber excavation and surface mound reinforcement.
- **`GUARD`**: Nest perimeter sentry and predator mobbing.
- **`SANITATION`**: Deceased corpse removal to exterior midden heaps.
- **`FUNGUS_GARDENER`**: Leaf mastication, substrate pulping, and gongylidia cultivation (*Atta* leafcutters).

---

## 3. Multichannel Pheromone Kinetics

Pheromones are continuously updated via an explicit 2D diffusion-reaction equation:

$$\frac{\partial C_k}{\partial t} = D_k \nabla^2 C_k - \lambda_k C_k + S_k(x, y, t)$$

Where:
- $C_k(x, y, t)$: Chemical concentration of pheromone channel $k$
- $D_k$: Diffusion coefficient (spatial spread)
- $\lambda_k$: Evaporation decay rate
- $S_k(x, y, t)$: Active deposition source terms from individual ants

| Channel | Biological Function | Primary Receptor / Gland |
| :--- | :--- | :--- |
| **`FOOD`** | Recruitment to verified carbohydrate/protein sources. | Basitarsal / Sternum glands |
| **`HOME`** | Orientation back to the main subterranean nest entrance. | Dufour's / Poison gland |
| **`RECRUITMENT`**| High-urgency reinforcement trail for heavy food crystals. | Pygidial gland |
| **`DANGER`** | High-contrast alarm pheromone triggering guard mobilization. | Mandibular glands |
| **`EXPLORE`** | Scout search vector pathing. | Sternal glands |

---

## 4. Attine Fungus Agriculture

Leafcutter workers harvest fresh vegetation, transport leaves underground to dedicated fungus chambers, chew the material into nutrient pulp, and cultivate *Leucoagaricus gongylophorus* fungus gardens, harvesting protein-rich swollen hyphal tips (*gongylidia*) to feed larvae and the Queen.

---

## 5. Self-Assembling Living Bridges & Cooperative Hauling

When ants encounter terrain chasms or steep vertical drops, individual workers link tarsal claws to form tensile **Living Bridges**, dynamically adjusting bridge width and position to optimize traffic flow according to principles observed in *Eciton* army ants (Reid et al., 2015).
