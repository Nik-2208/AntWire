# ANT BRAIN — Connectomics & Neural Graph Architecture

This document specifies the connectomics schema, neural data structures, and multi-scale hierarchy implemented in **Ant Brain**, following modern scientific connectomics platforms (e.g. *FlyWire* / *CATMAID* / *FAFB*).

---

## 1. Evidence Classification & Scientific Provenance

To maintain absolute scientific traceability, **every neuron, synapse, and brain compartment** is flagged with an explicit evidence tier:

| Status | Definition | Example in Ant Brain |
|---|---|---|
| `MEASURED` | Experimentally measured connectome data (e.g., FIB-SEM, TEM reconstruction) | *Drosophila* homologous reference circuits |
| `RECONSTRUCTED` | Skeletonized 3D trace from confocal / volume electron microscopy | Antennal Lobe glomeruli volumes |
| `INFERRED` | Neuroarchitectural circuit topology inferred from closely related Hymenoptera (*Apis mellifera*, *Ooceraea biroi*) | Central Complex ring attractor compass |
| `ANALOGOUS` | Generalized insect neuroarchitectural circuit | Lateral Accessory Lobe flip-flop descending network |
| `MODELLED` | Procedurally synthesized computational geometry & synaptic graphs | 55,000-neuron TypedArray network |
| `HYPOTHETICAL` | Theoretical network architecture for hypothesis testing | Synthetic task transfer policy layers |

---

## 2. Anatomical Organization: Head-to-Toe

Rather than reducing the ant to a generic "brain sphere", the nervous system is partitioned into genuine insect neuropils and thoracic/abdominal motor centers:

```
[ANTENNAE & HEAD SENSILLA]
        │ (Acetylcholine / ORNs)
        ▼
[ANTENNAL LOBES (AL)]
  ├── Microglomeruli (Local Interneurons: GABA)
  └── Uniglomerular Projection Neurons (PNs: ACh)
        │
   ┌────┴───────────────────────────┐
   ▼                                ▼
[MUSHROOM BODY (MB)]      [CENTRAL COMPLEX (CX)]
  ├── Calyx (Dendritic claws)     ├── Ellipsoid Body (EB: 16-wedge compass)
  ├── Peduncle (Kenyon cells)     ├── Protocerebral Bridge (PB: Angular flow)
  └── Lobes (MBONs + DAN/OAN)     ├── Fan-Shaped Body (FB: Path Integration)
   │                              └── Noduli (NO: Step odometer)
   └───────────────┬────────────────┘
                   ▼
        [PREMOTOR NETWORK (LAL & SEZ)]
          ├── Lateral Accessory Lobe (LAL: Turn bias)
          └── Subesophageal Zone (SEZ: Mandible & Trophallaxis)
                   │
                   ▼ (Descending Neurons / Glutamate)
        [VENTRAL NERVE CORD (VNC)]
                   ├── Prothoracic Ganglion (T1: Front legs & grooming)
                   ├── Mesothoracic Ganglion (T2: Tripod stance support)
                   ├── Metathoracic Ganglion (T3: Propulsion & bridge grip)
                   └── Abdominal / Gaster Ganglia (Stridulation & Trail glands)
```

---

## 3. Data Schema: FlyWire-Equivalent Model

### Neuron Entity (`ConnectomeNode`)
```typescript
interface ConnectomeNode {
  id: string;
  name: string;
  species: string;
  caste: 'QUEEN' | 'MINIM' | 'MINOR' | 'MEDIA' | 'MAJOR' | 'SOLDIER' | 'MALE' | 'GENERAL';
  sex: 'FEMALE' | 'MALE';
  region: NeuropilRegionId;
  cellType: 'SENSORY' | 'LOCAL_INTERNEURON' | 'PROJECTION_NEURON' | 'KENYON_CELL' | 'OUTPUT_NEURON' | 'DESCENDING_NEURON' | 'MOTOR_NEURON' | 'MODULATORY';
  neurotransmitter: NeurotransmitterType;
  receptors: string[];
  position3D: [number, number, number];
  membranePotential: number; // mV
  restingPotential: number;  // -65 mV
  thresholdPotential: number;// -45 mV
  isSpiking: boolean;
  morphologyStatus: EvidenceStatus;
  provenance: {
    classification: ScientificClassification;
    evidence: EvidenceStatus;
    species: string;
    citation: string;
    doi?: string;
    confidence: number;
  };
}
```

### Synapse Entity (`ConnectomeEdge`)
```typescript
interface ConnectomeEdge {
  id: string;
  sourceId: string;
  targetId: string;
  weight: number; // [-1.0 to 1.0]
  delayMs: number; // Axonal transmission latency
  transmissionProbability: number; // Vesicular release probability
  synapseType: 'EXCITATORY' | 'INHIBITORY' | 'MODULATORY' | 'ELECTRICAL_GAP_JUNCTION';
  neurotransmitter: NeurotransmitterType;
  plasticityRule?: 'STDP' | 'HEBBIAN' | 'STATIC' | 'THREE_FACTOR_DOPAMINE';
  confidence: number;
  evidence: EvidenceStatus;
  provenance: {
    classification: ScientificClassification;
    citation: string;
    doi?: string;
  };
}
```

---

## 4. Neuromodulation Layer

The simulation explicitly isolates **biologically established transmitters** from **computational reinforcement learning heuristics**:

1. **Octopamine (OANs):** Invertebrate analogue of norepinephrine. Drives appetitive foraging arousal, sucrose reward conditioning, and behavioral vigor.
2. **Dopamine (DANs):** Modulates aversive punishment conditioning (e.g. predator attacks, physical trauma) and motor initiation.
3. **Serotonin (5-HT):** Controls behavioral pacing, social aggression, and trail-following persistence.
4. **Acetylcholine & GABA:** Fast excitatory sensory transmission and local inhibitory contrast enhancement.

---

## 5. Ingestion of Future Empirical Connectomic Data

The software architecture is decoupled from dataset generation:
* When a full experimentally measured *Formica* or *Atta* connectome dataset is published, it can be ingested as an `.antbrain.json` bundle directly into `AntBrainAtlas` and `SyntheticBrain55K` without altering the rendering or simulation pipeline.
