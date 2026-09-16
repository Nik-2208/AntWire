# ANT BRAIN — Scientific Data Sources & Citations

This document catalogues all external scientific literature, neuroanatomy references, and species datasets incorporated into the **ANT BRAIN** platform.

---

## 1. Primary Neurobiology References

1. **Ooceraea biroi Brain Reconstruction:**
   * *Citation:* Trible, W., et al. (2017). *orco* Mutants in the Clonal Raider Ant *Ooceraea biroi* Lack Olfactory Glomeruli and Display Aberrant Colony Behavior. *Cell*, 170(4), 727–735.
   * *DOI:* [10.1016/j.cell.2017.07.014](https://doi.org/10.1016/j.cell.2017.07.014)
   * *Application:* Antennal lobe glomerular count estimation and clonal social dynamics.

2. **Desert Ant Path Integration & Navigation:**
   * *Citation:* Wittlinger, M., Wehner, R., & Wolf, H. (2006). The Ant Odometer: Stepping on Stilts and Stumps. *Science*, 312(5782), 1965–1967.
   * *DOI:* [10.1126/science.1126912](https://doi.org/10.1126/science.1126912)
   * *Application:* Central Complex step-counting odometer and home vector integration.

3. **Insect Central Complex Heading Compass:**
   * *Citation:* Green, J., et al. (2017). A Neural Circuit for Allocentric Heading in *Drosophila*. *Nature*, 546(7656), 101–106.
   * *Application:* 16-wedge ring attractor model implemented in `src/ants/brain/central_complex.ts`.

4. **Mushroom Body Kenyon Cell Plasticity & Neuromodulation:**
   * *Citation:* Waddell, S. (2013). Reinforcement Signalling in *Drosophila*; Dopamine Does It All After All. *Current Opinion in Neurobiology*, 23(3), 324–329.
   * *Application:* Octopaminergic reward and Dopaminergic aversive reinforcement.

---

## 2. Licensing & External Asset Policy

* No restricted proprietary connectome meshes or unauthorized data dumps are bundled.
* All 3D anatomical neuropils in `src/visualization/brain_3d_viewer.ts` are procedurally generated low-poly approximations based on published stereotaxic coordinates.
