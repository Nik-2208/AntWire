# ANT BRAIN — Connectome & Model Package Specifications

## 1. Open-Source `ANTBRAIN_MODEL` Package Standard

The platform packages trained and synthetic neural controllers in a standardized, reproducible format:

```
ANTBRAIN_MODEL/
├── model.json              # Primary identity, controller type, and hash
├── architecture.json       # Layer dimensions (e.g. 55,000 neurons, 330,000 synapses)
├── weights.bin / weights   # Float32 binary weight buffers or JSON matrices
├── normalization.json     # Sensory input scaling parameters
├── task.json               # Benchmark task specification (FORAGE, MAZE, EVADE, TRANSPORT)
├── environment.json        # World parameters, obstacle density, temperature
├── metrics.json            # Mean reward, best reward, success rate, episodes
├── lineage.json            # Parent model ID, branching history, checkpoint step
├── model_card.md           # Intended use, limitations, biological status, performance
└── LICENSE                 # Open Research License (MIT / CC-BY-4.0)
```

---

## 2. Connectome CSV Data Standards

For interoperability with external connectome tools (such as FlyWire, Codex, and Virtual Fly Brain):

### `regions.csv`
```csv
region_id,system_id,name,code,color,neuron_count,center_x,center_y,center_z
0,CHEMOSENSORY,"Left Antennal Lobe (AL-L)",AL-L,#10b981,4125,-0.75,-0.45,0.85
1,CHEMOSENSORY,"Right Antennal Lobe (AL-R)",AL-R,#10b981,4125,0.75,-0.45,0.85
4,CENTRAL_INTEGRATION,"Central Complex (CX - EB/PB/FB)",CX,#06b6d4,9900,0.0,0.15,0.05
```

### `neurons.csv`
```csv
neuron_id,region_id,type_id,pos_x,pos_y,pos_z,bias,threshold,is_disabled
0,0,0,-0.742,-0.431,0.862,0.0120,-44.80,0
1,0,0,-0.765,-0.468,0.841,-0.0050,-45.20,0
```

### `connections.csv`
```csv
edge_id,source_neuron_id,target_neuron_id,weight,synapse_type
0,142,5802,0.4820,0
1,890,14205,-0.3210,1
```
