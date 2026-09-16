/**
 * ANT BRAIN — Mushroom Body (MB) Associative Olfactory Learning
 * Models sparse population coding in Kenyon Cells (KCs), MB Output Neurons (MBONs),
 * and Octopaminergic (Reward) / Dopaminergic (Punishment) synaptic plasticity.
 */

import { MushroomBodyState } from './types';

export class MushroomBodyCircuit {
  public state: MushroomBodyState;
  private readonly numKenyonCells = 64;
  private pnToKcWeights: Float32Array; // [numKenyonCells x 5 Glomeruli]
  private learningRate = 0.05;

  constructor() {
    this.state = {
      kenyonCellActivations: new Float32Array(this.numKenyonCells),
      valenceWeights: new Float32Array(this.numKenyonCells), // Synaptic strength from KCs to MBONs
      octopamineLevel: 0,
      dopamineLevel: 0,
      cumulativeReward: 0,
    };

    // Initialize initial baseline neutral/weak appetitive weights
    this.state.valenceWeights.fill(0.1);

    // Fixed sparse random projection matrix from 5 PNs to 64 KCs
    this.pnToKcWeights = new Float32Array(this.numKenyonCells * 5);
    for (let i = 0; i < this.pnToKcWeights.length; i++) {
      // Each KC receives input from ~2-3 random glomeruli
      this.pnToKcWeights[i] = Math.random() < 0.4 ? Math.random() * 0.8 + 0.2 : 0;
    }
  }

  public update(
    pnActivations: [number, number, number, number, number],
    rewardEvent: number, // +1 on eating food / harvest
    punishmentEvent: number, // +1 on injury / predator bite
    dt: number
  ): { appetitiveValence: number; aversiveValence: number; activeKCCount: number } {
    // 1. Neuromodulation dynamics (Octopamine / Dopamine surges with exponential decay)
    this.state.octopamineLevel = Math.max(0, this.state.octopamineLevel * Math.exp(-3.0 * dt) + rewardEvent * 1.5);
    this.state.dopamineLevel = Math.max(0, this.state.dopamineLevel * Math.exp(-2.5 * dt) + punishmentEvent * 2.0);
    this.state.cumulativeReward += (rewardEvent - punishmentEvent) * dt;

    // 2. Compute Kenyon Cell raw activations
    const rawKC = new Float32Array(this.numKenyonCells);
    for (let kc = 0; kc < this.numKenyonCells; kc++) {
      let sum = 0;
      for (let g = 0; g < 5; g++) {
        sum += this.pnToKcWeights[kc * 5 + g] * pnActivations[g];
      }
      rawKC[kc] = sum;
    }

    // 3. Sparse Winner-Take-All / Thresholding (Top 10-15% of KCs fire)
    // Find activation threshold for top KCs
    let threshold = 0.45;
    let activeCount = 0;

    for (let kc = 0; kc < this.numKenyonCells; kc++) {
      if (rawKC[kc] > threshold) {
        this.state.kenyonCellActivations[kc] = Math.min(1.0, (rawKC[kc] - threshold) * 2.5);
        activeCount++;
      } else {
        this.state.kenyonCellActivations[kc] = 0;
      }
    }

    // 4. Three-Factor Synaptic Plasticity (Pre-synaptic KC * Post-synaptic Neuromodulator)
    const netModulator = this.state.octopamineLevel - this.state.dopamineLevel;
    if (Math.abs(netModulator) > 0.05) {
      for (let kc = 0; kc < this.numKenyonCells; kc++) {
        const kcAct = this.state.kenyonCellActivations[kc];
        if (kcAct > 0.1) {
          // Weight update via dopamine/octopamine
          this.state.valenceWeights[kc] += kcAct * netModulator * this.learningRate * dt;
          // Bound weights to [-1.0, 1.0]
          this.state.valenceWeights[kc] = Math.max(-1.0, Math.min(1.0, this.state.valenceWeights[kc]));
        }
      }
    }

    // 5. Compute Mushroom Body Output Neuron (MBON) signals
    let totalValence = 0;
    for (let kc = 0; kc < this.numKenyonCells; kc++) {
      totalValence += this.state.kenyonCellActivations[kc] * this.state.valenceWeights[kc];
    }

    const appetitiveValence = Math.max(0, totalValence);
    const aversiveValence = Math.max(0, -totalValence);

    return {
      appetitiveValence,
      aversiveValence,
      activeKCCount: activeCount,
    };
  }
}
