# ANT BRAIN — Biological Knowledge Base & Evidence Synthesis

This document provides a comprehensive review of the empirical entomological, neurobiological, and behavioral literature grounding the **ANT BRAIN** simulation platform.

---

## 1. Evidence Hierarchy & Taxonomy

Every rule and parameter in the simulation is labeled according to the following scientific hierarchy:

| Level | Tag | Definition | Example in Simulation |
| :--- | :--- | :--- | :--- |
| 1 | `BIOLOGICAL_FACT` | Directly supported by published empirical peer-reviewed literature. | *Obligate polyandry in Atta queens, gongylidia production by L. gongylophorus.* |
| 2 | `BIOLOGICAL_INFERENCE` | Inferred across closely related Formicidae taxa where direct data is partial. | *Central complex 16-column ring attractor heading integration in Formica.* |
| 3 | `BIOLOGICAL_ABSTRACTION` | Formalized computational/mathematical approximation of biological dynamics. | *Bonabeau-Theraulaz response threshold labor division, 2D pheromone diffusion grids.* |
| 4 | `ENGINEERING_APPROXIMATION` | Performance or real-time simulation design decision. | *InstancedMesh WebGL rendering, discrete spatial hashing.* |
| 5 | `HYPOTHESIS` | Experimental behavioral or neural rule under active exploratory simulation. | *Adaptive neuromodulatory dopamine learning rate adjustments in worker tasks.* |

---

## 2. Core Biological Systems & Literature Citations

### A. Higher-Attine Leafcutter Fungus Agriculture
* **Biological Principle**: Leafcutter ants (*Atta* and *Acromyrmex*) do not digest raw plant cellulose directly. They maintain an obligate mutualism with the basidiomycete fungus *Leucoagaricus gongylophorus*, which converts plant sap and cell walls into nutrient-dense, swollen hyphal tips called **gongylidia** (rich in lipids, carbohydrates, and free amino acids).
* **Pathogen Dynamics**: Gardens are vulnerable to the specialized parasitic microfungus *Escovopsis*. Workers groom fungal crypts, produce antimicrobial secretions from their **metapleural glands**, and isolate diseased mycelial waste into dedicated subterranean **midden chambers**.
* **Primary Citations**:
  * *Hölldobler, B., & Wilson, E. O. (1990). The Ants. Harvard University Press.*
  * *Currie, C. R. (2001). A community of ants, fungi, and bacteria. Annual Review of Microbiology, 55(1), 357-380. DOI: 10.1146/annurev.micro.55.1.357*
  * *Currie, C. R., et al. (1999). Fungus-growing ants use antibiotic-producing bacteria to control garden parasites. Nature, 398(6729), 701-704. DOI: 10.1038/19519*

---

### B. Polymorphic Caste Structure & Division of Labor
* **Biological Principle**: *Atta* workers exhibit continuous allometric polymorphism spanning nearly an order of magnitude in body length and jaw morphology:
  * **Minims ($\sim 1.5 - 2.5\text{ mm}$)**: Fungal crypt maintenance, micro-hyphae trimming, hitchhiking on laden foragers to repel phorid parasitoid flies (*Apocephalus*).
  * **Minors ($\sim 2.5 - 4.5\text{ mm}$)**: Brood care, mastication of leaf fragments into moist pulp, and midden waste transport.
  * **Mediae ($\sim 4.5 - 8.0\text{ mm}$)**: Main foraging force; vegetation cutting with serrated mandibles and long-distance cargo transport.
  * **Majors / Soldiers ($\sim 8.0 - 14.0\text{ mm}$)**: Massive head capsules and adductor apodemes for colony defense and clearing tough vegetation obstacles.
* **Primary Citations**:
  * *Wilson, E. O. (1980). Caste and division of labor in leaf-cutter ants. Behavioral Ecology and Sociobiology, 7(2), 143-156. DOI: 10.1007/BF00299511*
  * *Bonabeau, E., Theraulaz, G., & Deneubourg, J. L. (1996). Quantitative study of the fixed-threshold model for the regulation of division of labour in insect societies. Proc. R. Soc. Lond. B, 263(1376), 1565-1569. DOI: 10.1098/rspb.1996.0229*

---

### C. Queen Reproductive Biology, Polyandry & Claustral Founding
* **Biological Principle**: *Atta* and *Acromyrmex* queens are **obligatorily polyandrous**, mating with 3 to 10+ males during a single nuptial flight. Drones die immediately after mating, while the queen stores hundreds of millions of sperm in her **spermatheca** for her 10–20 year lifespan.
* **Claustral Founding**: A newly mated gyne carries a viable mycelial pellet in her **infrabuccal pocket**. She excavates an initial claustrum, manuring the pellet with fecal droplets and nourishing the first minim generation from somatic lipid and wing-muscle catabolism.
* **Primary Citations**:
  * *Hughes, W. O., et al. (2008). Ancestral high female multiple mating in the social Hymenoptera. Science, 320(5880), 1216-1218. DOI: 10.1126/science.1156108*
  * *Fernández-Marín, H., et al. (2004). Fungal use and cultivation by foundresses of the fungus-growing ant Cyphomyrmex costatus. Behav. Ecol. Sociobiol. DOI: 10.1007/s00265-004-0803-x*

---

### D. Substrate Acoustic Stridulation
* **Biological Principle**: Leafcutter workers stridulate using a postpetiolar plectrum against a gastral file. The generated mechanical vibrations ($\sim 500 - 1000\text{ Hz}$) transmit through plant tissue to recruit nestmates and ease mandibular cutting.
* **Primary Citations**:
  * *Roces, F., & Hölldobler, B. (1995). Vibrational communication in the leaf-cutting ant Atta cephalotes. Experimental Biology, 198(9), 1993-2005. DOI: 10.1242/jeb.198.9.1993*

---

### E. Neuroanatomy & Path Integration
* **Biological Principle**: Heading direction is maintained in the **Central Complex (CX)** ellipsoid body via a 16-column ring attractor. Odometric step-counting integrates an allocentric home vector enabling direct straight-line return to the nest entrance.
* **Primary Citations**:
  * *Hart, T., et al. (2023). A population-derived reference brain of the clonal raider ant Ooceraea biroi. Cell Reports, 42(5). DOI: 10.1016/j.celrep.2023.112480*
  * *Wehner, R. (2003). Desert ant navigation: how miniature brains solve complex tasks. J. Comp. Physiol. A, 189(8), 579-588.*
