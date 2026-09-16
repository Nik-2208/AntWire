/**
 * ANT BRAIN — Brain Control Panel & Causal Trace Controller
 *
 * Provides research-grade parameter override capabilities:
 * - Live Synaptic Weight Scaling & Plasticity Rates
 * - Neuronal Firing Threshold & Refractory Period adjustments
 * - Neuromodulator Gain (Dopamine, Octopamine, Serotonin)
 * - Sensory Receptor Gain & Attention Biases
 * - Step-by-step Causal Trace Recording & Playback
 *   (Sensory Input -> Antennal/Optic Integration -> MB/CX Processing -> Descending Signals -> Motor Command -> Environment Outcome)
 */

export interface NeuralOverrideParameters {
  synapticWeightScale: number;    // 0.1 to 3.0 (default 1.0)
  learningRateSTDP: number;       // 0.0001 to 0.05 (default 0.005)
  spikeThresholdMv: number;       // -55 mV to -35 mV (default -45 mV)
  refractoryPeriodMs: number;     // 1.0 ms to 10.0 ms (default 2.5 ms)
  dopamineModulationGain: number; // 0.0 to 5.0 (default 1.0)
  octopamineArousalGain: number;  // 0.0 to 5.0 (default 1.0)
  serotoninPacingGain: number;    // 0.0 to 5.0 (default 1.0)
  olfactorySensoryGain: number;   // 0.1 to 5.0 (default 1.0)
  visualOpticGain: number;        // 0.1 to 5.0 (default 1.0)
}

export interface CausalTraceStep {
  timestampMs: number;
  stage: 'SENSORY_INPUT' | 'PRIMARY_INTEGRATION' | 'CENTRAL_PROCESSING' | 'DESCENDING_COMMAND' | 'MOTOR_EXECUTION' | 'ENVIRONMENT_EFFECT';
  neuropil: string;
  activeUnits: string[];
  membranePotentialAvg: number;
  dominantNeurotransmitter: string;
  causalExplanation: string;
}

export interface CausalTraceLog {
  id: string;
  antId: string;
  behaviorName: string;
  steps: CausalTraceStep[];
  outcomeSummary: string;
}

export class BrainControlPanel {
  private params: NeuralOverrideParameters = {
    synapticWeightScale: 1.0,
    learningRateSTDP: 0.005,
    spikeThresholdMv: -45.0,
    refractoryPeriodMs: 2.5,
    dopamineModulationGain: 1.0,
    octopamineArousalGain: 1.0,
    serotoninPacingGain: 1.0,
    olfactorySensoryGain: 1.0,
    visualOpticGain: 1.0,
  };

  private modificationLog: Array<{ timestamp: number; parameter: keyof NeuralOverrideParameters; oldValue: number; newValue: number }> = [];
  private activeTraces: CausalTraceLog[] = [];

  public getParameters(): NeuralOverrideParameters {
    return { ...this.params };
  }

  public updateParameter<K extends keyof NeuralOverrideParameters>(param: K, value: number): void {
    const oldValue = this.params[param];
    this.params[param] = value;
    this.modificationLog.push({
      timestamp: Date.now(),
      parameter: param,
      oldValue,
      newValue: value,
    });
  }

  public resetToBiologicalDefaults(): void {
    this.params = {
      synapticWeightScale: 1.0,
      learningRateSTDP: 0.005,
      spikeThresholdMv: -45.0,
      refractoryPeriodMs: 2.5,
      dopamineModulationGain: 1.0,
      octopamineArousalGain: 1.0,
      serotoninPacingGain: 1.0,
      olfactorySensoryGain: 1.0,
      visualOpticGain: 1.0,
    };
  }

  public recordCausalTrace(antId: string, behavior: string, sensoryDesc: string, motorDesc: string): CausalTraceLog {
    const trace: CausalTraceLog = {
      id: `trace-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      antId,
      behaviorName: behavior,
      outcomeSummary: `${behavior} triggered by ${sensoryDesc} resulting in ${motorDesc}`,
      steps: [
        {
          timestampMs: 0.0,
          stage: 'SENSORY_INPUT',
          neuropil: 'ANTENNAL_SENSILLA',
          activeUnits: ['OR-42', 'OR-108', 'PB-Odorant'],
          membranePotentialAvg: -48.2,
          dominantNeurotransmitter: 'ACETYLCHOLINE',
          causalExplanation: `Antennal sensilla bind volatile ligand (${sensoryDesc}), depolarizing ORN axonal terminals.`,
        },
        {
          timestampMs: 1.8,
          stage: 'PRIMARY_INTEGRATION',
          neuropil: 'ANTENNAL_LOBE',
          activeUnits: ['AL-Glomerulus-T6', 'AL-LN-12', 'AL-PN-04'],
          membranePotentialAvg: -38.5,
          dominantNeurotransmitter: 'GABA',
          causalExplanation: 'Local interneurons perform lateral inhibition, contrast-sharpening the glomerular activation vector.',
        },
        {
          timestampMs: 3.5,
          stage: 'CENTRAL_PROCESSING',
          neuropil: 'MUSHROOM_BODY_&_CENTRAL_COMPLEX',
          activeUnits: ['MB-KC-884', 'MB-KC-1042', 'CX-EB-Ring-4', 'MBON-gamma2'],
          membranePotentialAvg: -32.1,
          dominantNeurotransmitter: 'OCTOPAMINE',
          causalExplanation: 'Kenyon cells sparsely encode associative valence; Central Complex Ring Attractor aligns heading toward target gradient.',
        },
        {
          timestampMs: 5.2,
          stage: 'DESCENDING_COMMAND',
          neuropil: 'LATERAL_ACCESSORY_LOBE_&_SEZ',
          activeUnits: ['LAL-DN-01', 'SEZ-MotorGrip-3'],
          membranePotentialAvg: -28.0,
          dominantNeurotransmitter: 'GLUTAMATE',
          causalExplanation: 'Descending premotor interneurons fire directional steering bursts traversing the Ventral Nerve Cord.',
        },
        {
          timestampMs: 7.0,
          stage: 'MOTOR_EXECUTION',
          neuropil: 'THORACIC_GANGLIA_(T1-T3)',
          activeUnits: ['T1-LegExtensor', 'T2-TripodCPG', 'T3-Flexor'],
          membranePotentialAvg: -15.0,
          dominantNeurotransmitter: 'GLUTAMATE',
          causalExplanation: `Alternating tripod central pattern generators execute locomotion (${motorDesc}).`,
        },
      ],
    };

    this.activeTraces.unshift(trace);
    if (this.activeTraces.length > 50) this.activeTraces.pop();
    return trace;
  }

  public getRecentTraces(): CausalTraceLog[] {
    return this.activeTraces;
  }

  public getModificationLog(): Array<{ timestamp: number; parameter: keyof NeuralOverrideParameters; oldValue: number; newValue: number }> {
    return this.modificationLog;
  }
}
