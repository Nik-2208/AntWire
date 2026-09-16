/**
 * ANT BRAIN — Connectome & Neural Graph Data Model (FlyWire-grade Architecture)
 * 
 * Represents biological and modeled neural structures from head to toe:
 * Antennae -> Antennal Lobes -> Mushroom Bodies -> Central Complex ->
 * Descending Neurons -> Subesophageal Zone -> Ventral Nerve Cord (VNC) ->
 * Segmental Thoracic Ganglia -> Motor Neurons -> Mandibles / Legs / Gaster.
 *
 * Implements FlyWire-grade neuron & synapse data schemas with explicit
 * provenance, morphology status, neurotransmitter assignments, and confidence metrics.
 */

import { ScientificClassification } from '../../simulation/types';

export type NeurotransmitterType =
  | 'OCTOPAMINE'     // Invertebrate equivalent of Norepinephrine (Reward / Arousal / Foraging)
  | 'DOPAMINE'        // Aversive reinforcement / Punishment / Motor initiation
  | 'ACETYLCHOLINE'   // Primary excitatory sensory transmitter (Antennal sensilla, PNs, KCs)
  | 'GABA'            // Primary inhibitory neurotransmitter (Local Interneurons, MB feedback)
  | 'GLUTAMATE'       // Neuromuscular motor junction transmitter
  | 'SEROTONIN'       // Behavioral pacing / Aggression / Social modulation
  | 'PEPTIDERGIC'     // Neuropeptides (Allatotropin, Corazonin, Tachykinin)
  | 'HISTAMINE'       // Photoreceptor neurotransmitter in insect compound eyes
  | 'UNKNOWN';

export type NeuropilRegionId =
  | 'ANTENNAL_LOBE'           // AL: Primary olfactory processing & glomeruli
  | 'MUSHROOM_BODY_CALYX'     // MB-CA: Dendritic sensory input zone
  | 'MUSHROOM_BODY_PEDUNCLE'  // MB-PED: Axonal bundle of Kenyon Cells
  | 'MUSHROOM_BODY_LOBES'     // MB-LOBES: Output synapses to MBONs & modulatory DANs/OANs
  | 'CENTRAL_COMPLEX_EB'      // CX-EB: Ellipsoid Body (Heading Ring Attractor)
  | 'CENTRAL_COMPLEX_PB'      // CX-PB: Protocerebral Bridge
  | 'CENTRAL_COMPLEX_FB'      // CX-FB: Fan-Shaped Body (Path Integration & Vector Memory)
  | 'CENTRAL_COMPLEX_NO'      // CX-NO: Noduli (Odometer & speed input)
  | 'LATERAL_ACCESSORY_LOBE'  // LAL: Premotor descending steering command center
  | 'SUBESOPHAGEAL_ZONE'      // SEZ: Gustatory taste, mandibular control, feeding reflex
  | 'OPTIC_LOBE'              // OL: Lamina, Medulla, Lobula (Compound eye & polarization vision)
  | 'VENTRAL_NERVE_CORD'      // VNC: Main neural transmission trunk connecting brain to body ganglia
  | 'PROTHORACIC_GANGLION'    // T1: Front leg stepping and grooming motor circuits
  | 'MESOTHORACIC_GANGLION'   // T2: Middle leg stance and support motor circuits
  | 'METATHORACIC_GANGLION'   // T3: Rear leg propulsion and bridging grip motor circuits
  | 'ABDOMINAL_GANGLIA';      // AG: Gaster, sting, trail pheromone gland extrusion

export type EvidenceStatus =
  | 'MEASURED'          // Experimentally measured connectome data (e.g. EM reconstructed)
  | 'RECONSTRUCTED'     // Skeletonized 3D trace from volume microscopy
  | 'INFERRED'          // Homology inferred from Drosophila/Apis connectomes
  | 'ANALOGOUS'         // Generalized insect neuroarchitectural circuit
  | 'MODELLED'          // Procedurally synthesized computational geometry
  | 'HYPOTHETICAL';     // Theoretical network for hypothesis testing

export interface MorphologicalCompartment {
  id: string;
  type: 'SOMA' | 'DENDRITIC_ARBOR' | 'AXON_INITIAL_SEGMENT' | 'AXON_SHAFT' | 'TERMINAL_BOUTON' | 'SYNAPTIC_VARICOSITY';
  startPoint: [number, number, number];
  endPoint: [number, number, number];
  radius: number; // micrometers
  evidence: EvidenceStatus;
}

export interface ConnectomeNode {
  id: string;
  name: string;
  species: string;
  caste: 'QUEEN' | 'MINIM' | 'MINOR' | 'MEDIA' | 'MAJOR' | 'SOLDIER' | 'MALE' | 'GENERAL';
  sex: 'FEMALE' | 'MALE';
  region: NeuropilRegionId;
  cellType:
    | 'SENSORY'
    | 'LOCAL_INTERNEURON'
    | 'PROJECTION_NEURON'
    | 'KENYON_CELL'
    | 'OUTPUT_NEURON'
    | 'DESCENDING_NEURON'
    | 'ASCENDING_INTERNEURON'
    | 'MOTOR_NEURON'
    | 'MODULATORY';
  neurotransmitter: NeurotransmitterType;
  receptors: string[]; // e.g. ['nAChR', 'GABA_A', 'OctR', 'Dop1R']
  position3D: [number, number, number]; // [x, y, z] coordinate in virtual anatomy
  membranePotential: number; // mV (-70 to +30)
  restingPotential: number;  // -65 mV
  thresholdPotential: number;// -45 mV
  isSpiking: boolean;
  morphologyStatus: EvidenceStatus;
  morphologyTree?: MorphologicalCompartment[];
  provenance: {
    classification: ScientificClassification;
    evidence: EvidenceStatus;
    species: string;
    citation: string;
    doi?: string;
    confidence: number; // 0.0 to 1.0
  };
}

export interface ConnectomeEdge {
  id: string;
  sourceId: string;
  targetId: string;
  preLocation?: [number, number, number];
  postLocation?: [number, number, number];
  weight: number; // Synaptic efficacy [-1.0 to 1.0] (negative = inhibitory)
  delayMs: number; // Axonal + synaptic transmission delay (e.g. 1.0 - 5.0 ms)
  transmissionProbability: number; // 0.0 - 1.0 (stochastic vesicular release)
  synapseType: 'EXCITATORY' | 'INHIBITORY' | 'MODULATORY' | 'ELECTRICAL_GAP_JUNCTION';
  neurotransmitter: NeurotransmitterType;
  plasticityRule?: 'STDP' | 'HEBBIAN' | 'STATIC' | 'THREE_FACTOR_DOPAMINE';
  confidence: number; // 0.0 to 1.0
  evidence: EvidenceStatus;
  provenance: {
    classification: ScientificClassification;
    citation: string;
    doi?: string;
  };
}

export interface BrainRegionMetadata {
  id: NeuropilRegionId;
  name: string;
  anatomicalDivision: 'HEAD_BRAIN' | 'SUBCEREBRAL' | 'VENTRAL_NERVE_CORD' | 'THORACIC_GANGLIA' | 'ABDOMEN';
  estimatedBiologicalNeuronCount: number; // In real ant (e.g. Formica / Atta)
  simulatedNodeCount: number;
  primaryFunction: string;
  provenanceStatus: ScientificClassification;
  evidence: EvidenceStatus;
  scientificDescription: string;
}

export const REFERENCE_BRAIN_REGIONS: Record<NeuropilRegionId, BrainRegionMetadata> = {
  ANTENNAL_LOBE: {
    id: 'ANTENNAL_LOBE',
    name: 'Antennal Lobe (AL)',
    anatomicalDivision: 'HEAD_BRAIN',
    estimatedBiologicalNeuronCount: 600,
    simulatedNodeCount: 8,
    primaryFunction: 'Glomerular odor processing, bilateral contrast sharpening via local interneurons.',
    provenanceStatus: 'BIOLOGICAL_FACT',
    evidence: 'RECONSTRUCTED',
    scientificDescription: 'The primary olfactory center in the insect deutocerebrum. Possesses spherical microglomeruli where ORN axons synapse onto PNs and LNs.',
  },
  MUSHROOM_BODY_CALYX: {
    id: 'MUSHROOM_BODY_CALYX',
    name: 'Mushroom Body Calyx (MB-CA)',
    anatomicalDivision: 'HEAD_BRAIN',
    estimatedBiologicalNeuronCount: 15000,
    simulatedNodeCount: 16,
    primaryFunction: 'Sensory convergence of PN olfactory axons onto Kenyon cell dendritic claws.',
    provenanceStatus: 'BIOLOGICAL_FACT',
    evidence: 'RECONSTRUCTED',
    scientificDescription: 'Dorsal neuropil receiving dense uniglomerular and multiglomerular projection neuron axons.',
  },
  MUSHROOM_BODY_PEDUNCLE: {
    id: 'MUSHROOM_BODY_PEDUNCLE',
    name: 'Mushroom Body Peduncle (MB-PED)',
    anatomicalDivision: 'HEAD_BRAIN',
    estimatedBiologicalNeuronCount: 20000,
    simulatedNodeCount: 32,
    primaryFunction: 'Parallel axonal transmission of sparse Kenyon Cell population activity.',
    provenanceStatus: 'BIOLOGICAL_FACT',
    evidence: 'RECONSTRUCTED',
    scientificDescription: 'Fascicle of parallel Kenyon cell axons traversing anteriorly toward the vertical and medial lobes.',
  },
  MUSHROOM_BODY_LOBES: {
    id: 'MUSHROOM_BODY_LOBES',
    name: 'Mushroom Body Output Lobes (MB-LOBES)',
    anatomicalDivision: 'HEAD_BRAIN',
    estimatedBiologicalNeuronCount: 200,
    simulatedNodeCount: 6,
    primaryFunction: 'Associative memory readout (MBONs) modulated by Dopamine (punishment) and Octopamine (reward).',
    provenanceStatus: 'BIOLOGICAL_FACT',
    evidence: 'RECONSTRUCTED',
    scientificDescription: 'Divided into alpha/beta and gamma compartments where valence-specific MBONs and DANs/OANs intersect.',
  },
  CENTRAL_COMPLEX_EB: {
    id: 'CENTRAL_COMPLEX_EB',
    name: 'Ellipsoid Body / Central Body Lower (CX-EB)',
    anatomicalDivision: 'HEAD_BRAIN',
    estimatedBiologicalNeuronCount: 120,
    simulatedNodeCount: 16,
    primaryFunction: 'Internal celestial polarized light compass & 16-wedge angular heading ring attractor.',
    provenanceStatus: 'BIOLOGICAL_FACT',
    evidence: 'RECONSTRUCTED',
    scientificDescription: 'Toroidal/annular midline neuropil holding a persistent localized bump of neuronal activity encoding current heading orientation.',
  },
  CENTRAL_COMPLEX_PB: {
    id: 'CENTRAL_COMPLEX_PB',
    name: 'Protocerebral Bridge (CX-PB)',
    anatomicalDivision: 'HEAD_BRAIN',
    estimatedBiologicalNeuronCount: 160,
    simulatedNodeCount: 16,
    primaryFunction: 'Angular velocity integration and left/right optical flow calibration.',
    provenanceStatus: 'BIOLOGICAL_FACT',
    evidence: 'RECONSTRUCTED',
    scientificDescription: 'Handlebar-shaped dorsal midline neuropil computing directional steering differentials.',
  },
  CENTRAL_COMPLEX_FB: {
    id: 'CENTRAL_COMPLEX_FB',
    name: 'Fan-Shaped Body / Central Body Upper (CX-FB)',
    anatomicalDivision: 'HEAD_BRAIN',
    estimatedBiologicalNeuronCount: 400,
    simulatedNodeCount: 16,
    primaryFunction: 'Path integration accumulator (Odometer + Compass) storing Euclidean return home vectors.',
    provenanceStatus: 'BIOLOGICAL_FACT',
    evidence: 'RECONSTRUCTED',
    scientificDescription: 'Stratified modular neuropil maintaining translational step displacements relative to internal compass heading.',
  },
  CENTRAL_COMPLEX_NO: {
    id: 'CENTRAL_COMPLEX_NO',
    name: 'Noduli (CX-NO)',
    anatomicalDivision: 'HEAD_BRAIN',
    estimatedBiologicalNeuronCount: 80,
    simulatedNodeCount: 4,
    primaryFunction: 'Translational step odometer, mechanosensory stepping frequency input.',
    provenanceStatus: 'BIOLOGICAL_FACT',
    evidence: 'RECONSTRUCTED',
    scientificDescription: 'Paired ventral sub-neuropils encoding ground step frequency and optical flow speed.',
  },
  LATERAL_ACCESSORY_LOBE: {
    id: 'LATERAL_ACCESSORY_LOBE',
    name: 'Lateral Accessory Lobe (LAL)',
    anatomicalDivision: 'HEAD_BRAIN',
    estimatedBiologicalNeuronCount: 150,
    simulatedNodeCount: 6,
    primaryFunction: 'Premotor descending steering commands (flip-flop interneurons driving left/right motor bias).',
    provenanceStatus: 'BIOLOGICAL_FACT',
    evidence: 'INFERRED',
    scientificDescription: 'Primary output hub of the Central Complex projecting descending commands to thoracic motor ganglia.',
  },
  SUBESOPHAGEAL_ZONE: {
    id: 'SUBESOPHAGEAL_ZONE',
    name: 'Subesophageal Zone (SEZ)',
    anatomicalDivision: 'SUBCEREBRAL',
    estimatedBiologicalNeuronCount: 500,
    simulatedNodeCount: 6,
    primaryFunction: 'Mandibular motor grasping, gustatory sugar/protein tasting, trophallaxis food exchange reflex.',
    provenanceStatus: 'BIOLOGICAL_FACT',
    evidence: 'RECONSTRUCTED',
    scientificDescription: 'Ventral ganglion controlling mouthparts, mandibles, and labial glands.',
  },
  OPTIC_LOBE: {
    id: 'OPTIC_LOBE',
    name: 'Optic Lobe (OL)',
    anatomicalDivision: 'HEAD_BRAIN',
    estimatedBiologicalNeuronCount: 4000,
    simulatedNodeCount: 8,
    primaryFunction: 'Visual obstacle avoidance, celestial polarized UV light detection, motion parallax.',
    provenanceStatus: 'BIOLOGICAL_FACT',
    evidence: 'RECONSTRUCTED',
    scientificDescription: 'Lamina, medulla, and lobula processing compound eye ommatidia inputs and dorsal rim area (DRA) polarization.',
  },
  VENTRAL_NERVE_CORD: {
    id: 'VENTRAL_NERVE_CORD',
    name: 'Ventral Nerve Cord (VNC)',
    anatomicalDivision: 'VENTRAL_NERVE_CORD',
    estimatedBiologicalNeuronCount: 1200,
    simulatedNodeCount: 8,
    primaryFunction: 'Ascending proprioceptive feedback and descending locomotor rhythm coordination.',
    provenanceStatus: 'BIOLOGICAL_FACT',
    evidence: 'INFERRED',
    scientificDescription: 'Paired axonal longitudinal connectives linking the subesophageal zone to the thoracic and abdominal ganglia.',
  },
  PROTHORACIC_GANGLION: {
    id: 'PROTHORACIC_GANGLION',
    name: 'Prothoracic Ganglion (T1 Ganglion)',
    anatomicalDivision: 'THORACIC_GANGLIA',
    estimatedBiologicalNeuronCount: 800,
    simulatedNodeCount: 6,
    primaryFunction: 'Front leg stepping, antennal grooming reflex, and tactile substrate probe.',
    provenanceStatus: 'BIOLOGICAL_FACT',
    evidence: 'INFERRED',
    scientificDescription: 'Segmental ganglion controlling T1 anterior legs and anterior body posture.',
  },
  MESOTHORACIC_GANGLION: {
    id: 'MESOTHORACIC_GANGLION',
    name: 'Mesothoracic Ganglion (T2 Ganglion)',
    anatomicalDivision: 'THORACIC_GANGLIA',
    estimatedBiologicalNeuronCount: 800,
    simulatedNodeCount: 6,
    primaryFunction: 'Middle leg tripodal coordination, stance phase support, and cargo weight bearing.',
    provenanceStatus: 'BIOLOGICAL_FACT',
    evidence: 'INFERRED',
    scientificDescription: 'Segmental ganglion coordinating middle pair of walking legs during alternating tripod locomotion.',
  },
  METATHORACIC_GANGLION: {
    id: 'METATHORACIC_GANGLION',
    name: 'Metathoracic Ganglion (T3 Ganglion)',
    anatomicalDivision: 'THORACIC_GANGLIA',
    estimatedBiologicalNeuronCount: 900,
    simulatedNodeCount: 6,
    primaryFunction: 'Hind leg propulsion, bridging anchor gripping, and jumping/climbing thrust.',
    provenanceStatus: 'BIOLOGICAL_FACT',
    evidence: 'INFERRED',
    scientificDescription: 'Segmental ganglion powering rear propulsion and tarsal grip strength during living bridge attachments.',
  },
  ABDOMINAL_GANGLIA: {
    id: 'ABDOMINAL_GANGLIA',
    name: 'Abdominal & Gaster Ganglia',
    anatomicalDivision: 'ABDOMEN',
    estimatedBiologicalNeuronCount: 600,
    simulatedNodeCount: 4,
    primaryFunction: 'Stridulatory organ vibration, Dufour trail pheromone gland deposition, and defensive posture.',
    provenanceStatus: 'BIOLOGICAL_FACT',
    evidence: 'INFERRED',
    scientificDescription: 'Posterior chain of ganglia controlling gaster flexion, sting/acidopore, and stridulatory plectrum rubs.',
  },
};
