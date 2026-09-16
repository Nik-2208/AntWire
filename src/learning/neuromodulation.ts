/**
 * ANT BRAIN — Neuromodulation Simulation Subsystem
 * Implements biophysically inspired neuromodulatory dynamics:
 * 1. Dopamine-Inspired Signal: Computes Reward Prediction Error (RPE) δ = r_t + γ*V(s_{t+1}) - V(s_t)
 *    with baseline activity, phasic burst/dip dynamics, exponential decay, and three-factor synaptic plasticity.
 * 2. Octopamine-Inspired Signal: Sensory gain modulation, foraging arousal, and metabolic drive mobilization.
 * 3. Serotonin-Inspired Signal: Behavioral pacing, aggression gating, and social communication bias.
 *
 * SCIENTIFIC POSITION:
 * Marked explicitly as BIOLOGICALLY_INSPIRED_COMPUTATIONAL_MODEL.
 * These are parameterized computational dynamics, NOT literal claims of total ant neurochemistry.
 */

export interface NeuromodulatorConfig {
  dopamineBaseline: number;      // Baseline tonic dopamine level (0.0 to 1.0)
  dopamineSpikeScale: number;    // Phasic RPE gain multiplier
  dopamineDecayRate: number;     // Half-life decay per tick (0.0 to 1.0)
  octopamineBaseline: number;    // Baseline octopamine level (0.0 to 1.0)
  octopamineArousalScale: number;// Arousal gain
  serotoninBaseline: number;     // Baseline serotonin level (0.0 to 1.0)
  serotoninPacingScale: number;  // Pacing modulation scale
}

export interface NeuromodulatorTelemetry {
  timestamp: number;
  dopamineLevel: number;
  rpeSignal: number;
  octopamineLevel: number;
  serotoninLevel: number;
  lastEventDescription: string;
  plasticityMultiplier: number;
}

export class NeuromodulatorSystem {
  public config: NeuromodulatorConfig;
  public dopamineLevel: number;
  public octopamineLevel: number;
  public serotoninLevel: number;
  public lastRPE: number = 0;
  public valueEstimate: number = 0;

  public telemetryHistory: NeuromodulatorTelemetry[] = [];
  public maxHistoryLength: number = 60;

  constructor(customConfig?: Partial<NeuromodulatorConfig>) {
    this.config = {
      dopamineBaseline: 0.20,
      dopamineSpikeScale: 1.0,
      dopamineDecayRate: 0.85,
      octopamineBaseline: 0.30,
      octopamineArousalScale: 0.8,
      serotoninBaseline: 0.25,
      serotoninPacingScale: 0.6,
      ...customConfig,
    };

    this.dopamineLevel = this.config.dopamineBaseline;
    this.octopamineLevel = this.config.octopamineBaseline;
    this.serotoninLevel = this.config.serotoninBaseline;
  }

  /**
   * Process a reward or punishment reinforcement event
   * Calculates Reward Prediction Error (RPE): δ = reward + γ * nextValue - currentValue
   */
  public processReinforcementEvent(
    reward: number,
    predictedNextValue: number,
    gamma: number = 0.95,
    eventDescription: string = 'Environmental feedback',
    simTime: number = 0
  ): { rpe: number; newDopamine: number; plasticityGain: number } {
    // RPE equation
    const rpe = reward + gamma * predictedNextValue - this.valueEstimate;
    this.lastRPE = rpe;
    this.valueEstimate = (1 - 0.1) * this.valueEstimate + 0.1 * (reward + gamma * predictedNextValue);

    // Modulate phasic dopamine signal (burst on positive RPE, dip on negative RPE)
    const delta = rpe * this.config.dopamineSpikeScale;
    this.dopamineLevel = Math.max(0.01, Math.min(2.0, this.dopamineLevel + delta));

    // Octopamine increases on food discovery or sensory stimulation
    if (reward > 0) {
      this.octopamineLevel = Math.min(1.5, this.octopamineLevel + reward * 0.4 * this.config.octopamineArousalScale);
    }

    // Three-factor plasticity gain multiplier
    const plasticityGain = 1.0 + (this.dopamineLevel - this.config.dopamineBaseline) * 1.5;

    this.recordTelemetry(simTime, eventDescription, plasticityGain);

    return {
      rpe,
      newDopamine: this.dopamineLevel,
      plasticityGain,
    };
  }

  /**
   * Continuous time decay toward baseline tonic equilibrium
   */
  public updateDecay(dt: number, simTime: number = 0): void {
    // Exponential relaxation to baseline
    this.dopamineLevel += (this.config.dopamineBaseline - this.dopamineLevel) * (1 - Math.pow(this.config.dopamineDecayRate, dt * 10));
    this.octopamineLevel += (this.config.octopamineBaseline - this.octopamineLevel) * 0.05;
    this.serotoninLevel += (this.config.serotoninBaseline - this.serotoninLevel) * 0.05;

    if (this.telemetryHistory.length === 0 || simTime - this.telemetryHistory[this.telemetryHistory.length - 1].timestamp > 0.2) {
      this.recordTelemetry(simTime, 'Tonic equilibrium', 1.0);
    }
  }

  /**
   * Trigger experimental dopamine spike for interactive laboratory inspection
   */
  public triggerExperimentalDopamineSpike(magnitude: number, simTime: number = 0): void {
    this.dopamineLevel = Math.max(0, Math.min(2.5, this.dopamineLevel + magnitude * this.config.dopamineSpikeScale));
    this.lastRPE = magnitude;
    this.recordTelemetry(simTime, `User Injected Phasic Spike (${magnitude > 0 ? '+' : ''}${magnitude.toFixed(2)})`, 1.0 + magnitude);
  }

  private recordTelemetry(simTime: number, eventDescription: string, plasticityGain: number): void {
    this.telemetryHistory.push({
      timestamp: simTime,
      dopamineLevel: parseFloat(this.dopamineLevel.toFixed(3)),
      rpeSignal: parseFloat(this.lastRPE.toFixed(3)),
      octopamineLevel: parseFloat(this.octopamineLevel.toFixed(3)),
      serotoninLevel: parseFloat(this.serotoninLevel.toFixed(3)),
      lastEventDescription: eventDescription,
      plasticityMultiplier: parseFloat(plasticityGain.toFixed(3)),
    });

    if (this.telemetryHistory.length > this.maxHistoryLength) {
      this.telemetryHistory.shift();
    }
  }

  public reset(): void {
    this.dopamineLevel = this.config.dopamineBaseline;
    this.octopamineLevel = this.config.octopamineBaseline;
    this.serotoninLevel = this.config.serotoninBaseline;
    this.lastRPE = 0;
    this.valueEstimate = 0;
    this.telemetryHistory = [];
  }
}
