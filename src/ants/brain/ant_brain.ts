/**
 * ANTWIRE — Biologically Informed Computational Ant Brain
 * Created & Developed by Nikhilesh H. Chavda
 *
 * Integrates:
 * 1. Biological Knowledge -> Neuropil Regional Circuits
 * 2. Explicit First-Class ConnectomeGraph with unique Neuron & Synapse entities
 * 3. Formal functional circuits (Odor detection, Path integration, Associative Memory, Premotor Steering)
 * 4. Systematic Ablation Engine (Without memory, learning, pheromones, reward, modulation)
 * 5. Full causal path tracing and live neurobiology telemetry
 */

import { AntennalLobeCircuit } from './antennal_lobe';
import { MushroomBodyCircuit } from './mushroom_body';
import { CentralComplexCircuit } from './central_complex';
import { AntBrainStateSnapshot, MotorLALState } from './types';
import { AntSensorySnapshot, AntInternalState, AntAction, PheromoneChannel } from '../../simulation/types';
import { AntBody } from '../body';
import { ActionFactory } from '../actions';
import { SeededRNG } from '../../simulation/rng';
import { ConnectomeGraph, TracedSignalPath } from './connectome_graph';
import { ComputationalNeuron, ComputationalSynapse } from './neuron_entity';
import { SensoryMotorMapper } from './sensory_motor_mapper';

export interface BrainAblationFlags {
  withoutMemory?: boolean;
  withoutLearning?: boolean;
  withoutPheromones?: boolean;
  withoutReward?: boolean;
  withoutModulation?: boolean;
}

export class BiologicallyInformedAntBrain {
  public antennalLobe: AntennalLobeCircuit;
  public mushroomBody: MushroomBodyCircuit;
  public centralComplex: CentralComplexCircuit;
  public motorLAL: MotorLALState;
  public lastSnapshot: AntBrainStateSnapshot;

  // First-class Connectome Graph
  public graph: ConnectomeGraph;

  // Systematic Ablations
  public ablationFlags: BrainAblationFlags = {};

  // Last Active Traced Causal Path
  public lastActiveSignalPath: TracedSignalPath | null = null;

  constructor(antId: string = 'ANT-DEFAULT') {
    this.antennalLobe = new AntennalLobeCircuit();
    this.mushroomBody = new MushroomBodyCircuit();
    this.centralComplex = new CentralComplexCircuit();
    this.motorLAL = {
      leftMotorBias: 0.5,
      rightMotorBias: 0.5,
      forwardThrust: 1.0,
      mandibleGraspReflex: false,
      stingVenomDischarge: false,
    };

    this.graph = new ConnectomeGraph();
    this.initializeConnectomeGraph(antId);

    this.lastSnapshot = this.createSnapshot(
      0,
      { appetitiveValence: 0.5, aversiveValence: 0, activeKCCount: 8 },
      {
        headingRing: Array.from(this.centralComplex.state.headingRingAttractor),
        estimatedHeading: this.centralComplex.state.estimatedHeading,
        homeVectorHeading: this.centralComplex.state.homeVectorAngle,
        homeVectorDistance: this.centralComplex.state.homeVectorDistance,
        confidence: this.centralComplex.state.pathIntegrationConfidence,
      }
    );
  }

  /**
   * Populate first-class ConnectomeGraph with explicit, non-anonymous neurons and synapses
   */
  private initializeConnectomeGraph(brainId: string): void {
    const createNeuron = (
      id: string,
      regionId: any,
      subregionId: string,
      cellType: string,
      neuronClass: any,
      pos: [number, number, number],
      model: any = 'RATE_SIGMOIDAL'
    ): ComputationalNeuron => ({
      neuronId: id,
      brainId,
      regionId,
      subregionId,
      cellType,
      neuronClass,
      position3D: pos,
      morphologyLabel: 'MODELLED_MORPHOLOGY',
      polarity: 'BIPOLAR',
      inputRoles: ['SIGNAL_TRANSDUCTION'],
      outputRoles: ['RELAY'],
      activationModel: model,
      stateVariables: {
        membranePotentialMv: -65.0,
        adaptationCurrentPa: 0.0,
        isSpiking: false,
        refractoryTimerMs: 0.0,
        spikeHistory: [],
        rateActivation: 0.1,
      },
      restingPotentialMv: -65.0,
      resetPotentialMv: -70.0,
      thresholdMv: -45.0,
      bias: 0.0,
      membraneTimeConstantMs: 15.0,
      adaptationTimeConstantMs: 120.0,
      adaptationCoupling: 0.05,
      refractoryPeriodMs: 2.0,
      noiseStdDev: 0.02,
      parameterCategory: 'STRUCTURAL',
      plasticityRate: 0.01,
      developmentalMetadata: { origin: 'PROCEDURAL_SYNTHESIS' },
      biologicalStatus: 'INFERRED',
      source: { citation: 'AntWire Neurocomputational Reference Model (2026)' },
    });

    // 1. Antennal Lobe Neurons
    this.graph.addNeuron(createNeuron('AL-ORN-FOOD-L', 'ANTENNAL_LOBE', 'GLOMERULUS-T6-FOOD', 'Olfactory Receptor Neuron', 'SENSORY', [-0.75, -0.45, 0.85]));
    this.graph.addNeuron(createNeuron('AL-ORN-FOOD-R', 'ANTENNAL_LOBE', 'GLOMERULUS-T6-FOOD', 'Olfactory Receptor Neuron', 'SENSORY', [0.75, -0.45, 0.85]));
    this.graph.addNeuron(createNeuron('AL-ORN-TRAIL-L', 'ANTENNAL_LOBE', 'GLOMERULUS-T6-TRAIL', 'Olfactory Receptor Neuron', 'SENSORY', [-0.70, -0.40, 0.80]));
    this.graph.addNeuron(createNeuron('AL-ORN-TRAIL-R', 'ANTENNAL_LOBE', 'GLOMERULUS-T6-TRAIL', 'Olfactory Receptor Neuron', 'SENSORY', [0.70, -0.40, 0.80]));
    this.graph.addNeuron(createNeuron('AL-ORN-ALARM-L', 'ANTENNAL_LOBE', 'GLOMERULUS-T6-ALARM', 'Olfactory Receptor Neuron', 'SENSORY', [-0.80, -0.50, 0.90]));
    this.graph.addNeuron(createNeuron('AL-ORN-ALARM-R', 'ANTENNAL_LOBE', 'GLOMERULUS-T6-ALARM', 'Olfactory Receptor Neuron', 'SENSORY', [0.80, -0.50, 0.90]));
    this.graph.addNeuron(createNeuron('AL-PN-FOOD-L', 'ANTENNAL_LOBE', 'GLOMERULUS-T6-FOOD', 'Projection Neuron', 'INTERNEURON', [-0.60, -0.30, 0.70]));
    this.graph.addNeuron(createNeuron('AL-PN-FOOD-R', 'ANTENNAL_LOBE', 'GLOMERULUS-T6-FOOD', 'Projection Neuron', 'INTERNEURON', [0.60, -0.30, 0.70]));
    this.graph.addNeuron(createNeuron('AL-LN-CONTRAST-01', 'ANTENNAL_LOBE', 'AL-LOCAL-INTERNEURON', 'Local Interneuron (GABA)', 'LOCAL_CIRCUIT', [0.0, -0.40, 0.75]));

    // 2. Mushroom Body Kenyon Cells & MBONs
    this.graph.addNeuron(createNeuron('MB-KC-SPARSE-001', 'MUSHROOM_BODY_CALYX', 'MB-CA-DORSOPOSTERIOR', 'Kenyon Cell', 'MEMORY', [-0.85, 0.75, -0.30]));
    this.graph.addNeuron(createNeuron('MB-KC-SPARSE-016', 'MUSHROOM_BODY_CALYX', 'MB-CA-DORSOPOSTERIOR', 'Kenyon Cell', 'MEMORY', [0.85, 0.75, -0.30]));
    this.graph.addNeuron(createNeuron('MBON-APPETITIVE', 'MUSHROOM_BODY_LOBES', 'MB-VERTICAL-LOBE', 'Mushroom Body Output Neuron (Appetitive)', 'OUTPUT', [-0.30, 0.40, -0.20]));
    this.graph.addNeuron(createNeuron('MBON-AVERSIVE', 'MUSHROOM_BODY_LOBES', 'MB-MEDIAL-LOBE', 'Mushroom Body Output Neuron (Aversive)', 'OUTPUT', [0.30, 0.40, -0.20]));

    // 3. Central Complex Compass & Vector Integrator
    this.graph.addNeuron(createNeuron('CX-EB-RING-W01', 'CENTRAL_COMPLEX_EB', 'EB-WEDGE-01', 'Heading Compass Wedge Neuron', 'INTEGRATION', [0.0, 0.20, 0.05], 'RING_ATTRACTOR'));
    this.graph.addNeuron(createNeuron('CX-EB-RING-W08', 'CENTRAL_COMPLEX_EB', 'EB-WEDGE-08', 'Heading Compass Wedge Neuron', 'INTEGRATION', [0.15, 0.20, 0.05], 'RING_ATTRACTOR'));
    this.graph.addNeuron(createNeuron('CX-EB-RING-W16', 'CENTRAL_COMPLEX_EB', 'EB-WEDGE-16', 'Heading Compass Wedge Neuron', 'INTEGRATION', [-0.15, 0.20, 0.05], 'RING_ATTRACTOR'));
    this.graph.addNeuron(createNeuron('CX-FB-VECTOR-X', 'CENTRAL_COMPLEX_FB', 'FB-COLUMNAR-01', 'Pontine Return Vector Accumulator (X)', 'INTEGRATION', [0.0, 0.10, -0.10]));
    this.graph.addNeuron(createNeuron('CX-FB-VECTOR-Y', 'CENTRAL_COMPLEX_FB', 'FB-COLUMNAR-02', 'Pontine Return Vector Accumulator (Y)', 'INTEGRATION', [0.05, 0.10, -0.10]));

    // 4. Lateral Accessory Lobes & Premotor Command
    this.graph.addNeuron(createNeuron('LAL-FLIPFLOP-L', 'LATERAL_ACCESSORY_LOBE', 'LAL-VENTROLATERAL-L', 'Premotor Flip-Flop Steering (Left)', 'DECISION', [-0.50, -0.20, -0.35]));
    this.graph.addNeuron(createNeuron('LAL-FLIPFLOP-R', 'LATERAL_ACCESSORY_LOBE', 'LAL-VENTROLATERAL-R', 'Premotor Flip-Flop Steering (Right)', 'DECISION', [0.50, -0.20, -0.35]));
    this.graph.addNeuron(createNeuron('LAL-DESCENDING-STEER-L', 'LATERAL_ACCESSORY_LOBE', 'LAL-DESCENDING', 'Descending Steer Interneuron', 'DESCENDING', [-0.40, -0.35, -0.40]));
    this.graph.addNeuron(createNeuron('LAL-DESCENDING-STEER-R', 'LATERAL_ACCESSORY_LOBE', 'LAL-DESCENDING', 'Descending Steer Interneuron', 'DESCENDING', [0.40, -0.35, -0.40]));

    // 5. Motor Outputs & Thoracic CPG
    this.graph.addNeuron(createNeuron('SEZ-MANDIBLE-MOTOR', 'SUBESOPHAGEAL_ZONE', 'SEZ-MANDIBULAR', 'Mandibular Grasp Motor Neuron', 'MOTOR', [0.0, -0.85, 0.25]));
    this.graph.addNeuron(createNeuron('T1-CPG-PROPULSION', 'PROTHORACIC_GANGLION', 'T1-CPG', 'Locomotor Tripod CPG Motor Driver', 'MOTOR', [0.0, -1.20, 0.10]));

    // Connect Synapses
    const createSynapse = (
      id: string,
      pre: string,
      post: string,
      weight: number,
      type: any = 'EXCITATORY',
      nt: any = 'ACETYLCHOLINE',
      rule: any = 'STATIC',
      cat: any = 'STRUCTURAL'
    ): ComputationalSynapse => ({
      synapseId: id,
      preNeuronId: pre,
      postNeuronId: post,
      weight,
      delayMs: 2.0,
      sign: weight >= 0 ? 1 : -1,
      synapseType: type,
      neurotransmitter: nt,
      receptors: ['nAChR'],
      plasticityRule: rule,
      plasticityParameters: { learningRate: 0.05, eligibilityDecayMs: 200, weightMin: -1.0, weightMax: 1.0 },
      eligibilityTrace: 0.0,
      enabled: true,
      regionId: 'ANTENNAL_LOBE',
      parameterCategory: cat,
      biologicalStatus: 'INFERRED',
      source: { citation: 'AntWire Neurocomputational Synaptic Registry' },
    });

    // AL Sensory feedforward
    this.graph.addSynapse(createSynapse('SYN-AL-ORN-L-TO-PN-L', 'AL-ORN-FOOD-L', 'AL-PN-FOOD-L', 0.85));
    this.graph.addSynapse(createSynapse('SYN-AL-ORN-R-TO-PN-R', 'AL-ORN-FOOD-R', 'AL-PN-FOOD-R', 0.85));
    this.graph.addSynapse(createSynapse('SYN-AL-PN-L-TO-LN', 'AL-PN-FOOD-L', 'AL-LN-CONTRAST-01', 0.50));
    this.graph.addSynapse(createSynapse('SYN-AL-LN-TO-PN-R', 'AL-LN-CONTRAST-01', 'AL-PN-FOOD-R', -0.35, 'INHIBITORY', 'GABA'));

    // PNs to Kenyon Cells
    this.graph.addSynapse(createSynapse('SYN-PN-L-TO-KC-001', 'AL-PN-FOOD-L', 'MB-KC-SPARSE-001', 0.70));
    this.graph.addSynapse(createSynapse('SYN-PN-R-TO-KC-016', 'AL-PN-FOOD-R', 'MB-KC-SPARSE-016', 0.70));

    // Kenyon Cells to MBONs (Plastic)
    this.graph.addSynapse(createSynapse('SYN-KC-001-TO-MBON-APP', 'MB-KC-SPARSE-001', 'MBON-APPETITIVE', 0.60, 'EXCITATORY', 'ACETYLCHOLINE', 'THREE_FACTOR_STDP', 'TRAINABLE'));
    this.graph.addSynapse(createSynapse('SYN-KC-016-TO-MBON-AVERS', 'MB-KC-SPARSE-016', 'MBON-AVERSIVE', -0.50, 'INHIBITORY', 'GABA', 'THREE_FACTOR_STDP', 'TRAINABLE'));

    // MBON Output to LAL Premotor Steering
    this.graph.addSynapse(createSynapse('SYN-MBON-APP-TO-LAL-L', 'MBON-APPETITIVE', 'LAL-FLIPFLOP-L', 0.80));
    this.graph.addSynapse(createSynapse('SYN-MBON-AVERS-TO-LAL-R', 'MBON-AVERSIVE', 'LAL-FLIPFLOP-R', 0.80));

    // Central Complex to LAL Steering
    this.graph.addSynapse(createSynapse('SYN-CX-FB-TO-LAL-L', 'CX-FB-VECTOR-X', 'LAL-FLIPFLOP-L', 0.75));
    this.graph.addSynapse(createSynapse('SYN-CX-FB-TO-LAL-R', 'CX-FB-VECTOR-Y', 'LAL-FLIPFLOP-R', 0.75));

    // LAL Premotor cross-inhibition
    this.graph.addSynapse(createSynapse('SYN-LAL-CROSS-INHIB-L', 'LAL-FLIPFLOP-L', 'LAL-FLIPFLOP-R', -0.40, 'INHIBITORY', 'GABA'));
    this.graph.addSynapse(createSynapse('SYN-LAL-CROSS-INHIB-R', 'LAL-FLIPFLOP-R', 'LAL-FLIPFLOP-L', -0.40, 'INHIBITORY', 'GABA'));

    // LAL Descending to Thoracic CPG
    this.graph.addSynapse(createSynapse('SYN-LAL-L-TO-DESC', 'LAL-FLIPFLOP-L', 'LAL-DESCENDING-STEER-L', 0.90));
    this.graph.addSynapse(createSynapse('SYN-LAL-R-TO-DESC', 'LAL-FLIPFLOP-R', 'LAL-DESCENDING-STEER-R', 0.90));
    this.graph.addSynapse(createSynapse('SYN-DESC-TO-CPG', 'LAL-DESCENDING-STEER-L', 'T1-CPG-PROPULSION', 0.80));
    this.graph.addSynapse(createSynapse('SYN-DESC-TO-MANDIBLE', 'LAL-DESCENDING-STEER-R', 'SEZ-MANDIBLE-MOTOR', 0.80));
  }

  /**
   * Complete Neuropil Neural Forward Cycle:
   * 1. Chemosensory transduction & tropotaxis contrast (AL)
   * 2. Sparse Kenyon cell coding & associative learning (MB)
   * 3. Celestial compass & path integration return vector (CX)
   * 4. Lateral Accessory Lobe (LAL) premotor arbitration into continuous steering & thrust
   */
  public evaluate(
    body: AntBody,
    sensors: AntSensorySnapshot,
    internalState: AntInternalState,
    dt: number,
    rng: SeededRNG,
    rewardSignal = 0,
    punishmentSignal = 0
  ): {
    action: AntAction;
    dominantNeuropil: string;
    neuralReason: string;
    snapshot: AntBrainStateSnapshot;
  } {
    // Apply Ablation Modifiers
    const effectiveReward = this.ablationFlags.withoutReward ? 0 : rewardSignal;
    const effectivePunishment = this.ablationFlags.withoutModulation ? 0 : punishmentSignal;

    // 1. Antennal Lobe Odor Processing
    const al = this.antennalLobe.processSensoryInput(sensors, dt);

    // Update Graph Sensory Activations
    const foodLNeuron = this.graph.getNeuron('AL-ORN-FOOD-L');
    if (foodLNeuron) foodLNeuron.stateVariables.rateActivation = al.foodPN_L;
    const foodRNeuron = this.graph.getNeuron('AL-ORN-FOOD-R');
    if (foodRNeuron) foodRNeuron.stateVariables.rateActivation = al.foodPN_R;

    // 2. Mushroom Body Associative Learning & Valence
    const pnActivations: [number, number, number, number, number] = [
      Math.max(al.foodPN_L, al.foodPN_R),
      this.ablationFlags.withoutPheromones ? 0 : Math.max(al.trailPN_L, al.trailPN_R),
      Math.max(al.homePN_L, al.homePN_R),
      Math.max(al.alarmPN_L, al.alarmPN_R),
      sensors.nearbyAntsCount > 0 ? 0.8 : 0,
    ];

    const mb = this.mushroomBody.update(
      pnActivations,
      effectiveReward,
      effectivePunishment,
      dt,
      this.ablationFlags.withoutLearning
    );

    // 3. Central Complex Heading & Path Integration Home Vector
    const cx = this.ablationFlags.withoutMemory
      ? { headingRing: new Array(16).fill(0), estimatedHeading: body.heading, homeVectorHeading: 0, homeVectorDistance: 0, confidence: 0 }
      : this.centralComplex.update(body.heading, body.speed, dt, sensors.isAtNestEntrance);

    // Update Graph Central Complex Activations
    const fbVectorX = this.graph.getNeuron('CX-FB-VECTOR-X');
    if (fbVectorX) fbVectorX.stateVariables.rateActivation = Math.cos(cx.homeVectorHeading);
    const fbVectorY = this.graph.getNeuron('CX-FB-VECTOR-Y');
    if (fbVectorY) fbVectorY.stateVariables.rateActivation = Math.sin(cx.homeVectorHeading);

    // 4. Lateral Accessory Lobe (LAL) Premotor Arbitration
    let steerAngle = 0;
    let forwardThrust = 1.0;
    let dominantNeuropil = 'Central Complex (CX)';
    let neuralReason = '';
    let pheroToDeposit: PheromoneChannel | undefined = undefined;
    let pheroStrength = 0;

    // (A) Critical Alarm / Threat Reflex
    if (al.alarmPN_L > 0.4 || al.alarmPN_R > 0.4 || sensors.predatorDetected || mb.aversiveValence > 0.6) {
      dominantNeuropil = 'Subesophageal Zone / Alarm LAL';
      const fleeTurn = sensors.predatorRelativeAngle > 0 ? -1.8 : 1.8;
      steerAngle = fleeTurn;
      forwardThrust = 1.35;
      if (!this.ablationFlags.withoutPheromones) {
        pheroToDeposit = PheromoneChannel.ALARM;
        pheroStrength = 0.9;
      }
      neuralReason = `Alarm Glomerulus firing -> Emergency descending motor flee (${fleeTurn.toFixed(2)} rad)`;
      this.lastActiveSignalPath = this.graph.findShortestPath('AL-ORN-ALARM-L', 'T1-CPG-PROPULSION');
    }
    // (B) At Nest Entrance -> Mandibular Deposit
    else if (internalState.carryingFoodAmount > 0 && sensors.isAtNestEntrance) {
      dominantNeuropil = 'Subesophageal Mandibular Zone';
      const action = ActionFactory.depositFood();
      neuralReason = 'Nest entrance contact -> mandibular cargo release and CX path integration reset';
      return {
        action,
        dominantNeuropil,
        neuralReason,
        snapshot: this.createSnapshot(al.tropotaxisDifferential, mb, cx),
      };
    }
    // (C) At Food Source -> Mandibular Grasp
    else if (internalState.carryingFoodAmount <= 0 && sensors.foodProximity >= 0.85 && sensors.detectedFoodId) {
      dominantNeuropil = 'Subesophageal Mandibular Zone';
      const action = ActionFactory.collectFood(sensors.detectedFoodId);
      neuralReason = `Food gustatory contact -> mandibular grasping reflex on resource ${sensors.detectedFoodId}`;
      return {
        action,
        dominantNeuropil,
        neuralReason,
        snapshot: this.createSnapshot(al.tropotaxisDifferential, mb, cx),
      };
    }
    // (D) Obstacle Avoidance Reflex
    else if (sensors.obstacleCenter > 0.6 || sensors.obstacleLeft > 0.7 || sensors.obstacleRight > 0.7) {
      dominantNeuropil = 'Optic Lobe / Tactile SEZ';
      const obsTurn = sensors.obstacleLeft > sensors.obstacleRight ? 1.2 : -1.2;
      steerAngle = obsTurn;
      forwardThrust = 0.6;
      neuralReason = `Proximity tactile avoidance reflex -> steering bias ${obsTurn.toFixed(2)} rad`;
    }
    // (C) Targeted Chemosensory Tropotaxis (Food Gradient)
    else if (al.foodPN_L > 0.15 || al.foodPN_R > 0.15) {
      dominantNeuropil = 'Antennal Lobe (AL) Tropotaxis';
      const diff = al.foodPN_L - al.foodPN_R;
      steerAngle = diff * 1.5;
      forwardThrust = 1.1;
      neuralReason = `Antennal basiconica differential (L=${al.foodPN_L.toFixed(2)}, R=${al.foodPN_R.toFixed(2)}) -> steering ${steerAngle.toFixed(2)} rad`;
      this.lastActiveSignalPath = this.graph.findShortestPath('AL-ORN-FOOD-L', 'LAL-DESCENDING-STEER-L');
    }
    // (D) Trail Pheromone Following
    else if (!this.ablationFlags.withoutPheromones && (al.trailPN_L > 0.12 || al.trailPN_R > 0.12)) {
      dominantNeuropil = 'Antennal Lobe / Trail Interneurons';
      const trailDiff = al.trailPN_L - al.trailPN_R;
      steerAngle = trailDiff * 1.2;
      forwardThrust = 0.95;
      neuralReason = `Trichodea pheromone sensor tracking trail gradient (contrast=${trailDiff.toFixed(2)})`;
    }
    // (E) Central Complex Path Integration Return Vector (When Carrying Food)
    else if (internalState.carryingFoodAmount > 0 && cx.homeVectorDistance > 0.5) {
      dominantNeuropil = 'Central Complex (CX-FB)';
      const deltaAngle = this.wrapAngle(cx.homeVectorHeading - body.heading);
      steerAngle = Math.max(-1.5, Math.min(1.5, deltaAngle * 1.3));
      forwardThrust = 1.0;
      // Recruitment trail deposition evaluated authoritative via PheromoneDecisionEngine in organism execution
      neuralReason = `Path integration home vector active: distance=${cx.homeVectorDistance.toFixed(1)}m, steering toward ${cx.homeVectorHeading.toFixed(2)} rad`;
      this.lastActiveSignalPath = this.graph.findShortestPath('CX-FB-VECTOR-X', 'T1-CPG-PROPULSION');
    }
    // (F) Default Foraging Exploration
    else {
      dominantNeuropil = 'Protocerebral Oscillator';
      const exploreTurn = (rng.next() - 0.5) * 0.4;
      steerAngle = exploreTurn;
      forwardThrust = 0.85;
      neuralReason = `Exploratory stochastic levy walk (bias=${exploreTurn.toFixed(2)} rad)`;
    }

    // Update Motor LAL State
    this.motorLAL.leftMotorBias = Math.max(0, Math.min(1, 0.5 - steerAngle * 0.3));
    this.motorLAL.rightMotorBias = Math.max(0, Math.min(1, 0.5 + steerAngle * 0.3));
    this.motorLAL.forwardThrust = forwardThrust;

    // Convert via SensoryMotorMapper
    const action = SensoryMotorMapper.mapPremotorToActuators(
      steerAngle,
      forwardThrust,
      false,
      pheroToDeposit,
      pheroStrength
    );

    const snapshot = this.createSnapshot(al.tropotaxisDifferential, mb, cx);
    this.lastSnapshot = snapshot;

    return {
      action,
      dominantNeuropil,
      neuralReason,
      snapshot,
    };
  }

  public getSnapshot(): AntBrainStateSnapshot {
    return this.lastSnapshot;
  }

  private wrapAngle(angle: number): number {
    while (angle > Math.PI) angle -= 2 * Math.PI;
    while (angle < -Math.PI) angle += 2 * Math.PI;
    return angle;
  }

  private createSnapshot(alDiff: number, mb: any, cx: any): AntBrainStateSnapshot {
    return {
      timestamp: performance.now(),
      antennalLobe: {
        glomeruli: this.antennalLobe.getGlomeruliSnapshot(),
        tropotaxisDifferential: alDiff,
      },
      mushroomBody: {
        sparseSparsityFraction: mb.activeKCCount ? mb.activeKCCount / 64 : 0.125,
        appetitiveOutput: mb.appetitiveValence || 0,
        aversiveOutput: mb.aversiveValence || 0,
        octopamineLevel: this.mushroomBody.state.octopamineLevel,
        dopamineLevel: this.mushroomBody.state.dopamineLevel,
      },
      centralComplex: {
        headingRing: cx.headingRing ? Array.from(cx.headingRing) : [],
        estimatedHeading: cx.estimatedHeading || 0,
        homeVectorAngle: cx.homeVectorHeading !== undefined ? cx.homeVectorHeading : (cx.homeVectorAngle || 0),
        homeVectorDistance: cx.homeVectorDistance || 0,
        pathIntegrationConfidence: cx.confidence || 1.0,
      },
      motorLAL: {
        steerAngle: (this.motorLAL.rightMotorBias - this.motorLAL.leftMotorBias) * 1.5,
        thrust: this.motorLAL.forwardThrust,
      },
    };
  }
}
