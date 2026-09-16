/**
 * ANTWIRE — Functional Circuit Modules
 * Created & Developed by Nikhilesh H. Chavda
 *
 * Defines explicit, machine-readable functional circuit modules mapped directly
 * to concrete neuron and synapse entities in the ConnectomeGraph:
 * 1. ODOR_DETECTION (Antennal Sensilla -> AL Glomeruli PNs -> LNs)
 * 2. PATH_INTEGRATION (Odometer/Optic Flow -> CX-NO -> CX-EB Compass -> CX-FB Accumulator)
 * 3. MEMORY_ASSOCIATION (PNs -> MB-CA Claws -> Kenyon Cells -> MBONs)
 * 4. REWARD_PROCESSING (SEZ -> Octopaminergic OANs -> MB Appetitive)
 * 5. PUNISHMENT_AVERSION (Threats/Nociceptors -> Dopaminergic DANs -> MB Aversive)
 * 6. DECISION_AND_STEERING (CX-FB + MBONs -> LAL Flip-Flop Bilateral Bias)
 * 7. MOTOR_SELECTION (LAL -> SEZ Forward Thrust -> Thoracic CPGs T1/T2/T3)
 * 8. COMMUNICATION_AND_RECRUITMENT (Antennal Pheromone PNs -> Abdominal Extrusion)
 */

import { NeuropilRegionId } from './connectome';

export type FunctionalCircuitId =
  | 'ODOR_DETECTION'
  | 'PATH_INTEGRATION'
  | 'MEMORY_ASSOCIATION'
  | 'REWARD_PROCESSING'
  | 'PUNISHMENT_AVERSION'
  | 'DECISION_AND_STEERING'
  | 'MOTOR_SELECTION'
  | 'COMMUNICATION_AND_RECRUITMENT';

export interface FunctionalCircuitDefinition {
  circuitId: FunctionalCircuitId;
  name: string;
  involvedRegions: NeuropilRegionId[];
  constituentNeuronIds: string[];
  constituentSynapseIds: string[];
  computationalRole: string;
  biologicalAnalogue: string;
  isTrainable: boolean;
}

export const FUNCTIONAL_CIRCUIT_DEFINITIONS: Record<FunctionalCircuitId, FunctionalCircuitDefinition> = {
  ODOR_DETECTION: {
    circuitId: 'ODOR_DETECTION',
    name: 'Antennal Chemosensory & Tropotaxis Circuit',
    involvedRegions: ['ANTENNAL_LOBE'],
    constituentNeuronIds: [
      'AL-ORN-FOOD-L', 'AL-ORN-FOOD-R',
      'AL-ORN-TRAIL-L', 'AL-ORN-TRAIL-R',
      'AL-ORN-ALARM-L', 'AL-ORN-ALARM-R',
      'AL-PN-FOOD-L', 'AL-PN-FOOD-R',
      'AL-LN-CONTRAST-01', 'AL-LN-CONTRAST-02',
    ],
    constituentSynapseIds: [
      'SYN-ORN-FOOD-L-TO-PN', 'SYN-ORN-FOOD-R-TO-PN',
      'SYN-PN-TO-LN-INHIBITION', 'SYN-LN-TO-PN-CONTRAST',
    ],
    computationalRole: 'Transduces chemical volatile concentrations into bilateral neural activations; computes spatial differential (tropotaxis).',
    biologicalAnalogue: 'Uniglomerular projection neurons and GABAergic local interneurons in the deutocerebral antennal lobes.',
    isTrainable: false,
  },

  PATH_INTEGRATION: {
    circuitId: 'PATH_INTEGRATION',
    name: 'Central Complex Compass & Euclidean Vector Accumulator',
    involvedRegions: ['CENTRAL_COMPLEX_EB', 'CENTRAL_COMPLEX_PB', 'CENTRAL_COMPLEX_FB', 'CENTRAL_COMPLEX_NO'],
    constituentNeuronIds: [
      'CX-NO-ODOMETER-01', 'CX-NO-ODOMETER-02',
      'CX-EB-RING-W01', 'CX-EB-RING-W02', 'CX-EB-RING-W08', 'CX-EB-RING-W16',
      'CX-PB-VELOCITY-L', 'CX-PB-VELOCITY-R',
      'CX-FB-VECTOR-X', 'CX-FB-VECTOR-Y',
    ],
    constituentSynapseIds: [
      'SYN-EB-RING-RECURRENT', 'SYN-NO-TO-FB-STEP', 'SYN-EB-TO-FB-ACCUMULATOR',
    ],
    computationalRole: 'Integrates angular velocity and step count into a 16-wedge ring attractor heading bump and Euclidean return vector.',
    biologicalAnalogue: 'Ellipsoid Body wedge neurons and Fan-Shaped Body columnar pontine neurons in Cataglyphis desert ants.',
    isTrainable: false,
  },

  MEMORY_ASSOCIATION: {
    circuitId: 'MEMORY_ASSOCIATION',
    name: 'Mushroom Body Sparse Olfactory Associative Memory',
    involvedRegions: ['MUSHROOM_BODY_CALYX', 'MUSHROOM_BODY_PEDUNCLE', 'MUSHROOM_BODY_LOBES'],
    constituentNeuronIds: [
      'MB-CA-CLAW-01', 'MB-CA-CLAW-02',
      'MB-KC-SPARSE-001', 'MB-KC-SPARSE-016', 'MB-KC-SPARSE-064',
      'MBON-APPETITIVE', 'MBON-AVERSIVE',
    ],
    constituentSynapseIds: [
      'SYN-PN-TO-KC-EXPANSION', 'SYN-KC-TO-MBON-APP', 'SYN-KC-TO-MBON-AVERSIVE',
    ],
    computationalRole: 'Expands dense sensory cues into a high-dimensional sparse Kenyon cell representation with reward-modulated plasticity.',
    biologicalAnalogue: 'Kenyon cell dendritic claws in calyces projecting to valence-encoding Mushroom Body Output Neurons.',
    isTrainable: true,
  },

  REWARD_PROCESSING: {
    circuitId: 'REWARD_PROCESSING',
    name: 'Octopaminergic Appetitive Reinforcement Hub',
    involvedRegions: ['SUBESOPHAGEAL_ZONE', 'MUSHROOM_BODY_LOBES'],
    constituentNeuronIds: [
      'SEZ-GUSTATORY-SUGAR', 'OAN-VUMmx1-REWARD', 'MBON-APPETITIVE',
    ],
    constituentSynapseIds: [
      'SYN-SEZ-TO-OAN', 'SYN-OAN-TO-MBON-APP-MODULATION',
    ],
    computationalRole: 'Transduces food ingestion, payload pickup, and nest delivery into octopamine reinforcement signals.',
    biologicalAnalogue: 'VUMmx1 octopaminergic ventral unpaired medial neuron in hymenopteran brains.',
    isTrainable: false,
  },

  PUNISHMENT_AVERSION: {
    circuitId: 'PUNISHMENT_AVERSION',
    name: 'Dopaminergic Nociceptive & Threat Aversion Hub',
    involvedRegions: ['SUBESOPHAGEAL_ZONE', 'MUSHROOM_BODY_LOBES', 'LATERAL_ACCESSORY_LOBE'],
    constituentNeuronIds: [
      'SEZ-NOCICEPTOR-DAMAGE', 'DAN-PPL1-AVERSION', 'MBON-AVERSIVE',
    ],
    constituentSynapseIds: [
      'SYN-DAMAGE-TO-DAN', 'SYN-DAN-TO-MBON-AVERSIVE-MODULATION',
    ],
    computationalRole: 'Transduces predator proximity, physical collisions, and health loss into dopamine aversive prediction signals.',
    biologicalAnalogue: 'Protocerebral PPL1 cluster dopaminergic neurons modulating aversive memory compartments.',
    isTrainable: false,
  },

  DECISION_AND_STEERING: {
    circuitId: 'DECISION_AND_STEERING',
    name: 'Lateral Accessory Lobe Premotor Decision & Steering',
    involvedRegions: ['LATERAL_ACCESSORY_LOBE', 'CENTRAL_COMPLEX_FB', 'MUSHROOM_BODY_LOBES'],
    constituentNeuronIds: [
      'LAL-FLIPFLOP-L', 'LAL-FLIPFLOP-R',
      'LAL-DESCENDING-STEER-L', 'LAL-DESCENDING-STEER-R',
    ],
    constituentSynapseIds: [
      'SYN-CX-FB-TO-LAL-STEER', 'SYN-MBON-TO-LAL-MODULATION', 'SYN-LAL-CROSS-INHIBITION',
    ],
    computationalRole: 'Arbitrates between home vector return, pheromone trail tracking, and alarm fleeing to output continuous bilateral motor bias.',
    biologicalAnalogue: 'LAL descending steering neurons with mutual cross-inhibition controlling left/right turn bias.',
    isTrainable: false,
  },

  MOTOR_SELECTION: {
    circuitId: 'MOTOR_SELECTION',
    name: 'Thoracic Central Pattern Generator & Gnathal Mandibular Center',
    involvedRegions: ['SUBESOPHAGEAL_ZONE', 'VENTRAL_NERVE_CORD', 'PROTHORACIC_GANGLION', 'MESOTHORACIC_GANGLION', 'METATHORACIC_GANGLION'],
    constituentNeuronIds: [
      'SEZ-MANDIBLE-MOTOR', 'T1-CPG-STEP-L', 'T1-CPG-STEP-R',
      'T2-CPG-SUPPORT-L', 'T2-CPG-SUPPORT-R', 'T3-CPG-PROPULSION-L', 'T3-CPG-PROPULSION-R',
    ],
    constituentSynapseIds: [
      'SYN-LAL-TO-THORACIC-CPG', 'SYN-SEZ-TO-MANDIBLE',
    ],
    computationalRole: 'Converts descending steering signals and forward thrust into coordinated tripod gait locomotion and mandibular grasping.',
    biologicalAnalogue: 'Segmental thoracic motor neurons driving alternating tripod leg movements.',
    isTrainable: false,
  },

  COMMUNICATION_AND_RECRUITMENT: {
    circuitId: 'COMMUNICATION_AND_RECRUITMENT',
    name: 'Pheromone Trail Recruitment & Social Recognition',
    involvedRegions: ['ANTENNAL_LOBE', 'ABDOMINAL_GANGLIA'],
    constituentNeuronIds: [
      'AL-PN-TRAIL-L', 'AL-PN-TRAIL-R', 'AG-DUFOUR-GLAND-MOTOR',
    ],
    constituentSynapseIds: [
      'SYN-TRAIL-PN-TO-LAL', 'SYN-REWARD-TO-DUFOUR-EXTRUSION',
    ],
    computationalRole: 'Triggers abdominal Dufour gland pheromone deposition upon successful food discovery and steers along existing recruitment trails.',
    biologicalAnalogue: 'Abdominal motor neurons innervating Dufour and venom gland reservoirs during trail extrusion.',
    isTrainable: true,
  },
};
