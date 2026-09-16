# ANTWIRE — Open-ALife Trajectory & Connectome Data Schemas

This document defines the machine-readable data serialization schemas for offline reinforcement learning, imitation learning, and connectomic analysis.

---

## 1. Trajectory Step Schema (JSON / JSONL)

```json
{
  "step": 142,
  "timestamp": 2.366,
  "antId": "A-004",
  "species": "Atta_cephalotes_v1",
  "caste": "MEDIA",
  "role": "LEAF_CUTTER",
  "observation": {
    "antennaeLeft": { "food": 0.45, "pheromone": 0.12, "alarm": 0.0 },
    "antennaeRight": { "food": 0.88, "pheromone": 0.18, "alarm": 0.0 },
    "headingOdometer": { "x": 12.4, "y": -8.2, "distance": 14.8 },
    "vibrationIntensity": 0.72,
    "nearbyThreats": 0,
    "nearbyNestmates": 4,
    "isCarryingCargo": true
  },
  "internalState": {
    "energy": 0.84,
    "hunger": 0.22,
    "health": 1.0,
    "threatArousal": 0.05
  },
  "decision": {
    "actionType": "CUT_LEAF",
    "targetSpeed": 3.8,
    "turnRate": 0.05,
    "chosenActionScore": 0.94,
    "explanation": "High foliar nutritional density and nestmate stridulation detected."
  },
  "reward": {
    "total": 0.35,
    "foodAcquired": 0.30,
    "foodDelivered": 0.0,
    "energyPreserved": 0.05
  },
  "position": { "x": 14.2, "y": -6.8 },
  "heading": 1.24,
  "isTerminal": false
}
```

---

## 2. Connectome Export Schema (CSV)

* **`neurons.csv`**: `id, neuropil, somaX, somaY, somaZ, neurotransmitter, basalExcitability`
* **`connections.csv`**: `sourceId, targetId, weight, delayMs, synapseType`
* **`regions.csv`**: `regionId, name, biologicalEstimate, simulatedUnits, functionSummary`
