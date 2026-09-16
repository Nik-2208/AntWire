/**
 * ANT BRAIN — Digital Spiking Neuron & Synapse Model (LIF & STDP)
 * Biophysically inspired Leaky Integrate-and-Fire (LIF) dynamics with Spike-Timing-Dependent Plasticity.
 */

export interface SpikingNeuronConfig {
  vRest: number;      // Resting potential (-65.0 mV)
  vReset: number;     // Post-spike reset potential (-70.0 mV)
  vThreshold: number; // Action potential firing threshold (-45.0 mV)
  tauM: number;       // Membrane time constant (~15.0 ms)
  tauRefractory: number; // Absolute refractory period (~2.0 ms)
  rm: number;         // Membrane resistance (10.0 MOhm)
}

export class SpikingNeuron {
  public id: string;
  public label: string;
  public config: SpikingNeuronConfig;

  public v: number; // Current membrane voltage in mV
  public isSpiking: boolean = false;
  public refractoryTimer: number = 0; // ms remaining in refractory state

  // Telemetry trace buffers
  public voltageTrace: number[] = [];
  public spikeHistory: number[] = []; // Timestamps of action potentials
  public maxTraceLength: number = 80;

  constructor(id: string, label: string, customConfig?: Partial<SpikingNeuronConfig>) {
    this.id = id;
    this.label = label;
    this.config = {
      vRest: -65.0,
      vReset: -70.0,
      vThreshold: -45.0,
      tauM: 15.0,
      tauRefractory: 2.0,
      rm: 10.0,
      ...customConfig,
    };
    this.v = this.config.vRest;
  }

  /**
   * Integrate membrane equation:
   * dv/dt = (-(v - vRest) + Rm * I_syn) / tauM
   */
  public update(dtMs: number, iSynCurrentNanoAmps: number, simTimeSec: number): boolean {
    this.isSpiking = false;

    // Check refractory state
    if (this.refractoryTimer > 0) {
      this.refractoryTimer -= dtMs;
      this.v = this.config.vReset;
      this.recordTrace(this.v);
      return false;
    }

    // Leaky integration
    const dv = (-(this.v - this.config.vRest) + this.config.rm * iSynCurrentNanoAmps) * (dtMs / this.config.tauM);
    this.v += dv;

    // Check threshold
    if (this.v >= this.config.vThreshold) {
      this.isSpiking = true;
      this.v = 25.0; // Peak action potential visualization
      this.recordTrace(this.v);
      this.spikeHistory.push(simTimeSec);
      if (this.spikeHistory.length > 50) this.spikeHistory.shift();

      this.refractoryTimer = this.config.tauRefractory;
      return true;
    }

    this.recordTrace(this.v);
    return false;
  }

  private recordTrace(v: number): void {
    this.voltageTrace.push(v);
    if (this.voltageTrace.length > this.maxTraceLength) {
      this.voltageTrace.shift();
    }
  }

  public reset(): void {
    this.v = this.config.vRest;
    this.refractoryTimer = 0;
    this.isSpiking = false;
    this.voltageTrace = [];
    this.spikeHistory = [];
  }
}
