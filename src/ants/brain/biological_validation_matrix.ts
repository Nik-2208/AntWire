/**
 * ANTWIRE — Biological Validation Matrix
 * Created & Developed by Nikhilesh H. Chavda
 *
 * Provides a scientific, machine-readable validation matrix linking every AntWire
 * neurobehavioral feature to empirical insect literature, species scope,
 * computational abstraction, fidelity classification tier, and known limitations.
 */

export interface BiologicalValidationEntry {
  featureId: string;
  featureName: string;
  biologicalEvidence: string;
  speciesScope: string[];
  computationalImplementation: string;
  fidelityLevel: 'LEVEL_0' | 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'LEVEL_4';
  sourceCitation: string;
  doi?: string;
  scientificLimitations: string;
  verifiedInAntWire: boolean;
}

export const BIOLOGICAL_VALIDATION_MATRIX: BiologicalValidationEntry[] = [
  {
    featureId: 'VAL-AL-GLOMERULI',
    featureName: 'Antennal Lobe Glomerular Partitioning & Contrast Sharpening',
    biologicalEvidence: 'Ants possess 400–600 spherical glomeruli in the antennal lobe receiving uniglomerular and multiglomerular projection neuron dendrites, with local GABAergic interneurons providing lateral inhibition and contrast enhancement.',
    speciesScope: ['Ooceraea biroi', 'Camponotus floridanus', 'Formica rufa'],
    computationalImplementation: 'Paired left/right antennal lobe modules with distinct glomeruli for food volatiles, trail pheromones, home colony odor, and alarm terpenes; bilateral contrast difference (tropotaxis) directly extracted via LN inhibition.',
    fidelityLevel: 'LEVEL_2',
    sourceCitation: 'Hart, T., et al. (2023). Sparse and stereotyped olfactory circuits in the clonal raider ant brain. Cell Reports 42(6): 112700.',
    doi: '10.1016/j.celrep.2023.112700',
    scientificLimitations: 'Glomerular numbers and volumes are scaled to representative computational archetypes rather than a complete physical reconstruction of all 500+ microglomeruli.',
    verifiedInAntWire: true,
  },
  {
    featureId: 'VAL-CX-RING-ATTRACTOR',
    featureName: 'Central Complex Celestial Heading Ring Attractor',
    biologicalEvidence: 'The Ellipsoid Body (EB) and Protocerebral Bridge (PB) maintain an activity bump that rotates faithfully with the insect heading relative to polarized UV light and landmarks.',
    speciesScope: ['Cataglyphis fortis', 'Drosophila melanogaster', 'Megalopta genalis'],
    computationalImplementation: '16-column continuous ring attractor network in CX-EB updated by angular velocity cues and celestial polarization vectors to maintain egocentric heading.',
    fidelityLevel: 'LEVEL_2',
    sourceCitation: 'Stone, T., et al. (2017). An anatomically constrained model for path integration in the bee and ant brain. Current Biology 27(20): 3069-3085.',
    doi: '10.1016/j.cub.2017.08.052',
    scientificLimitations: '16 discrete wedge columns abstract continuous columnar insect architecture; polarization vision is modeled as a 2D angle input rather than per-ommatidium E-vector filters.',
    verifiedInAntWire: true,
  },
  {
    featureId: 'VAL-CX-FB-VECTOR-MEM',
    featureName: 'Fan-Shaped Body Euclidean Path Integration (Home Vector)',
    biologicalEvidence: 'Desert ants (Cataglyphis) integrate distance (step counter + optic flow) with heading (celestial compass) to continuously maintain an exact Euclidean return vector to the nest.',
    speciesScope: ['Cataglyphis fortis', 'Cataglyphis velox', 'Melophorus bagoti'],
    computationalImplementation: 'CX-FB accumulator receiving step frequency odometer inputs and EB heading orientation, storing a 2D return vector (angle and distance) that decays with distance-dependent noise.',
    fidelityLevel: 'LEVEL_2',
    sourceCitation: 'Collett, M., & Collett, T. S. (2000). How do insects use visual landmarks for navigation? Current Opinion in Neurobiology 10(6): 757-762.',
    doi: '10.1016/S0959-4388(00)00150-7',
    scientificLimitations: 'Step frequency is simulated via ant kinematic body velocity rather than biomechanical campaniform sensilla strain gauges on leg joints.',
    verifiedInAntWire: true,
  },
  {
    featureId: 'VAL-MB-SPARSE-KC',
    featureName: 'Mushroom Body Kenyon Cell Sparse Associative Coding',
    biologicalEvidence: 'High-dimensional projection neuron inputs are decorrelated into a sparse population code across Kenyon cells (<10% active at any time) allowing high-capacity odor-reward and odor-punishment learning.',
    speciesScope: ['Apis mellifera', 'Harpegnathos saltator', 'Atta cephalotes'],
    computationalImplementation: 'Calyx dendritic claw convergence producing sparse active Kenyon cell representation; 3-factor neuromodulation updates weights to MBON-Appetitive and MBON-Aversive.',
    fidelityLevel: 'LEVEL_2',
    sourceCitation: 'Heisenberg, M. (2003). Mushroom bodies: the cortex of the insect brain? Nature Reviews Neuroscience 4(4): 266-275.',
    doi: '10.1038/nrn1074',
    scientificLimitations: 'Simulates population-level Kenyon cell coding (~64–2000 cells) rather than the complete 150,000 KC population found in large hymenopteran brains.',
    verifiedInAntWire: true,
  },
  {
    featureId: 'VAL-NEUROMOD-OCT-DOP',
    featureName: 'Octopaminergic Reward & Dopaminergic Aversive Plasticity',
    biologicalEvidence: 'Octopamine mediates appetitive reward learning and food motivation in insects; Dopamine mediates aversive conditioning, punishment reinforcement, and alarm response.',
    speciesScope: ['Apis mellifera', 'Formica polyctena', 'Drosophila melanogaster'],
    computationalImplementation: 'Neuromodulator subsystem tracking Octopamine and Dopamine kinetics. Reward events (food, trophallaxis) elevate Octopamine; threats and damage elevate Dopamine, driving 3-factor synaptic updates.',
    fidelityLevel: 'LEVEL_2',
    sourceCitation: 'Perry, C. J., & Barron, A. B. (2013). Neural mechanisms of reward in insects. Annual Review of Entomology 58: 543-562.',
    doi: '10.1146/annurev-ento-120811-153631',
    scientificLimitations: 'Volume diffusion of neuromodulators across neuropil microdomains is represented as regional compartment scalar concentrations.',
    verifiedInAntWire: true,
  },
  {
    featureId: 'VAL-LAL-PREMOTOR-STEERING',
    featureName: 'Lateral Accessory Lobe (LAL) Premotor Descending Steering',
    biologicalEvidence: 'Bilateral flip-flop neurons in the LAL integrate heading error and olfactory valence to generate descending asymmetric motor signals to thoracic Central Pattern Generators (CPGs).',
    speciesScope: ['Bombyx mori', 'Gryllus bimaculatus', 'Formica rufa'],
    computationalImplementation: 'LAL circuit computing left/right motor bias differentials and forward thrust, directly steering kinematic heading changes without target-to-action shortcuts.',
    fidelityLevel: 'LEVEL_2',
    sourceCitation: 'Namiki, S., & Kanzaki, R. (2016). The neurobiology of insect pheromone-guided locomotion. Trends in Neurosciences 39(11): 780-791.',
    doi: '10.1016/j.tins.2016.09.006',
    scientificLimitations: 'Descending motor commands interface directly with ant kinematic velocity and turn rate rather than six-legged physical joint torque actuators.',
    verifiedInAntWire: true,
  },
  {
    featureId: 'VAL-PHEROMONE-STIGMERGY',
    featureName: 'Trail Pheromone Deposition & Tropotactic Following',
    biologicalEvidence: 'Foragers returning with food deposit volatile trail pheromone from the Dufour or venom gland onto the substrate, creating self-reinforcing recruitment highways via stigmergic feedback.',
    speciesScope: ['Lasius niger', 'Solenopsis invicta', 'Atta sexdens'],
    computationalImplementation: 'Continuous 2D diffusive and evaporative pheromone field with Dufour trail channels. Returning ants deposit pheromone; foraging ants steer along spatial gradients via paired antennal sampling.',
    fidelityLevel: 'LEVEL_3',
    sourceCitation: 'Czaczkes, T. J., et al. (2015). Ant foraging: the power of pheromones. Current Biology 25(16): R704-R706.',
    doi: '10.1016/j.cub.2015.06.035',
    scientificLimitations: 'Substrate roughness, microscopic air turbulence, and multi-component trail chemical fractionation are simplified to 2D reaction-diffusion grids.',
    verifiedInAntWire: true,
  },
];
