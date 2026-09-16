# ANTWIRE — Scientific Provenance & Model Traceability

## 1. Core Scientific Position
**AntWire is an experimental biologically informed computational platform inspired by ant nervous systems, ant behavior, and collective colony intelligence.**

It does NOT claim:
- To be a 100% biological reproduction of an actual ant brain.
- To possess complete measured connectomes where empirical data has not yet been published by science.
- To fabricate or invent experimental biological measurements.
- To be the ant equivalent of FlyWire (FlyWire is an actual Drosophila connectomics resource; keep that as a conceptual inspiration).

---

## 2. Evidence Tier Classification System

Every model entity, circuit, synapse, and behavioral rule in the ANTWIRE project is labeled with an explicit evidence tier:

| Evidence Tier | Description | Included Components |
|---|---|---|
| **`ESTABLISHED`** | Direct physical measurement from published peer-reviewed entomology and neuroscience studies. | Antennal receptor types, body allometry ratios (*Wilson 1980*), *Escovopsis* pathogen growth curves (*Currie 1999*). |
| **`SUPPORTED`** | Volumetrically traced 3D neuropil geometries or confirmed behavioral dynamics across multiple species. | Antennal Lobe microglomerular clusters (*Hart et al. 2023*), Mushroom Body calyx coordinates. |
| **`SPECIES_SPECIFIC`** | Traits documented in specific ant taxa that must not be generalized to all ants. | *Atta cephalotes* leaf-cutting & fungus agriculture, *Harpegnathos saltator* gamergate transitions. |
| **`INFERRED`** | Neural circuit principles homologous to established insect models (*Drosophila*, *Apis mellifera*). | Central Complex 16-wedge ring attractor heading compass (*Seelig & Jayaraman 2015*), LAL flip-flop steering interneurons. |
| **`MODELLED`** | Explicit computational and algorithmic implementations designed to simulate biological dynamics. | Leaky Integrate-and-Fire (LIF) dynamics, 3-factor STDP plasticity, response threshold division of labor (*Bonabeau et al. 1996*). |
| **`SPECULATIVE`** | Novel or experimental architectures designed for testing artificial cognition transfer. | Arbitrary task observation adapters, synthetic reward transfer engines. |

---

## 3. Provenance Metadata Schema
Every biological parameter is recorded with:
```json
{
  "parameter": "antennal_lobe_glomeruli_count",
  "value": 512,
  "unit": "glomeruli",
  "species": "Ooceraea biroi",
  "source": "Hart, T. et al. (2023). Cell Reports",
  "doi": "10.1016/j.celrep.2023.112700",
  "confidence": 0.98,
  "evidence_type": "ESTABLISHED",
  "model_mapping": "ANTENNAL_LOBE.estimatedBiologicalNeuronCount"
}
```
