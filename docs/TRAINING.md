# AntWire — Training, Reinforcement Learning & Optimization

> **Created & Developed by [Nikhilesh H. Chavda](https://nik-portfolio-lime.vercel.app/)**  
> *Policy Optimization, Reward Shaping, Neuromodulation, and Benchmark Protocols*  
> GitHub: [https://github.com/Nik-2208](https://github.com/Nik-2208) | LinkedIn: [https://www.linkedin.com/in/nikhilesh-chavda-2b779533a/](https://www.linkedin.com/in/nikhilesh-chavda-2b779533a/)

---

## 1. Multi-Scale Learning Paradigm

AntWire implements three complementary levels of learning and plasticity:

1. **Hebbian & Spike-Timing-Dependent Plasticity (STDP)**:
   Local synaptic weight adjustments at Kenyon Cell $\to$ MBON junctions mediated by timing differences between presynaptic sensory cues and unconditioned stimuli.
2. **Neuromodulatory Reward Broadcast (RPE)**:
   Dopaminergic (DANs), Octopaminergic (OANs), and Serotonergic (5HT) neural clusters broadcasting scalar reward prediction errors and arousal signals across active neuropils.
3. **Task Policy Gradient Optimization**:
   Global gradient descent with baseline subtraction optimizing continuous motor propulsion and steering angle distributions for complex environmental tasks.

---

## 2. Policy Gradient Objective

$$\mathcal{L}(\theta) = -\mathbb{E}_{\tau \sim \pi_\theta} \left[ \sum_{t=0}^T \log \pi_\theta(a_t | s_t) \cdot (R_t - b(s_t)) \right]$$

Where:
- $s_t$: 14-D Sensory observation vector
- $a_t$: Continuous motor action $[\text{throttle}, \text{steeringAngle}]$
- $R_t$: Discounted cumulative return $\sum_{k=t}^T \gamma^{k-t} r_k$
- $b(s_t)$: Exponential moving average baseline estimator to reduce gradient variance

---

## 3. Reward Function Decomposition

```typescript
export interface RewardDecomposition {
  foodHarvested: number;    // +10.0 per food packet collected
  nestDelivered: number;    // +15.0 per return delivery to colony storage
  energyConserved: number;  // +0.1 for maintaining energy reserve > 50%
  dangerAvoided: number;    // +0.5 for successfully evading apex predator
  starvationPenalty: number;// -0.5 for reaching critical hunger > 80%
  deathPenalty: number;     // -20.0 on somatic mortality event
}
```

---

## 4. Checkpoint Serialization & Lineage Tracking

Every training session automatically maintains checkpoint lineage records:
- **`trainingStep`**: Cumulative simulation timesteps trained
- **`episodeCount`**: Completed training episodes
- **`meanReward`**: Moving average return over the last 50 episodes
- **`bestReward`**: High-water mark return achieved
- **`successRate`**: Task completion percentage
