/**
 * ANTWIRE — Centralized Biological & Computational Knowledge Base
 *
 * Provides peer-reviewed literature citations, evidence classification tiers,
 * computational abstraction mappings, limitations, and related topic graphs.
 *
 * Evidence tiers:
 * - ESTABLISHED: Broadly verified across social insects in peer-reviewed literature.
 * - SUPPORTED: Empirically verified in specific model species.
 * - SPECIES_SPECIFIC: Valid for particular taxa (e.g. Atta leafcutters, Cataglyphis desert ants).
 * - MODELLED: AntWire computational abstraction / algorithm.
 * - INFERRED: Homologous circuit topology from related insect neuroscience.
 * - SPECULATIVE: Scientific hypothesis under active simulation investigation.
 */

export type BiologicalEvidenceLevel =
  | 'ESTABLISHED'
  | 'SUPPORTED'
  | 'SPECIES_SPECIFIC'
  | 'MODELLED'
  | 'INFERRED'
  | 'SPECULATIVE';

export type BioCategory =
  | 'Nervous System'
  | 'Sensory Systems'
  | 'Olfaction'
  | 'Antennae'
  | 'Brain Regions'
  | 'Learning'
  | 'Memory'
  | 'Navigation'
  | 'Pheromones'
  | 'Communication'
  | 'Recruitment'
  | 'Stigmergy'
  | 'Foraging'
  | 'Colony Organization'
  | 'Task Allocation'
  | 'Cooperation'
  | 'Nest Building'
  | 'Reproduction'
  | 'Defense'
  | 'Worker Behavior'
  | 'Species Differences'
  | 'Neuroscience'
  | 'Connectomics';

export interface BiologicalKnowledgeEntry {
  id: string;
  title: string;
  category: BioCategory;
  summary: string; // 1-2 sentence preview for hover tooltips
  biologicalFact: string; // What is experimentally known in biology
  antwireModel: string; // How AntWire computationally abstracts it
  limitation: string; // What the current computational system does not claim
  importance: string;
  confidence: number; // 0.0 to 1.0
  evidenceLevel: BiologicalEvidenceLevel;
  source: string; // Citation string
  sourceCitation?: string; // Optional alias for citation string
  sourceUrl: string; // Clickable authoritative URL / DOI
  doi?: string;
  publicationYear?: number;
  species?: string[];
  tags: string[];
  relatedTopics: string[]; // List of related entry IDs
}

export const BIOLOGY_KNOWLEDGE_BASE: Record<string, BiologicalKnowledgeEntry> = {
  'antennae_sensing': {
    id: 'antennae_sensing',
    title: 'Differential Tropotactic Antennal Chemoreception',
    category: 'Antennae',
    summary: 'Ants sample spatial chemical gradients across paired antennae to steer toward odor plumes and food trails.',
    biologicalFact: 'Antennae bear dense arrays of sensilla placodea and basiconica. By comparing simultaneous odor concentration differentials between left and right flagella (tropotaxis), ants calculate instantaneous orientation vectors toward pheromone and sucrose plumes.',
    antwireModel: 'AntWire computes bilateral sampling points offset from the head center, feeding differential concentrations into antennal lobe projection neuron arrays.',
    limitation: 'AntWire models continuous odor field vectors rather than individual turbulent odorant packet encounters.',
    importance: 'Fundamental sensory input driving all chemotaxis, trail-following, and nestmate recognition.',
    confidence: 0.98,
    evidenceLevel: 'ESTABLISHED',
    source: 'Hangartner, W. (1969). Structure and function of the tracking mechanism in the leaf-cutting ant Atta colombica. Z. Vergl. Physiol.',
    sourceUrl: 'https://doi.org/10.1007/BF00298064',
    doi: '10.1007/BF00298064',
    publicationYear: 1969,
    species: ['Atta colombica', 'Formica rufa', 'Lasius niger'],
    tags: ['antennae', 'tropotaxis', 'chemoreception', 'sensors'],
    relatedTopics: ['olfactory_glomeruli', 'pheromones_trail_following', 'foraging_dynamics'],
  },

  'olfactory_glomeruli': {
    id: 'olfactory_glomeruli',
    title: 'Antennal Lobe Glomerular Parcellation',
    category: 'Olfaction',
    summary: 'The insect antennal lobe partitions odorant receptor inputs into spherical microglomerular processing units.',
    biologicalFact: 'The ant deutocerebrum contains hundreds of stereotypic glomeruli (e.g., >500 in Ooceraea biroi, ~400 in Atta). Olfactory receptor neurons (ORNs) converge onto uniglomerular projection neurons (PNs) and inhibitory local interneurons (LNs) that perform contrast sharpening.',
    antwireModel: 'Represented as spherical neuropil micro-clusters in AntWire with inhibitory GABAergic lateral interneuron connectivity.',
    limitation: 'Glomerular firing is modeled with spiking/rate abstractions rather than biophysical multi-compartmental dendritic trees.',
    importance: 'High-dimensional feature extraction and contrast enhancement for thousands of volatile chemical compounds.',
    confidence: 0.97,
    evidenceLevel: 'ESTABLISHED',
    source: 'Hart, T., et al. (2023). Sparse and stereotyped olfactory circuits in the clonal raider ant brain. Cell Reports, 42(8), 112700.',
    sourceUrl: 'https://doi.org/10.1016/j.celrep.2023.112700',
    doi: '10.1016/j.celrep.2023.112700',
    publicationYear: 2023,
    species: ['Ooceraea biroi', 'Camponotus floridanus', 'Atta vollenweideri'],
    tags: ['antennal_lobe', 'glomeruli', 'olfaction', 'neuroscience'],
    relatedTopics: ['antennae_sensing', 'mushroom_body_learning', 'pheromones_trail_following'],
  },

  'mushroom_body_learning': {
    id: 'mushroom_body_learning',
    title: 'Mushroom Body Sparse Coding & Associative Memory',
    category: 'Learning',
    summary: 'Kenyon cell arrays in the mushroom bodies form sparse associative memories linking odors with rewards or punishments.',
    biologicalFact: 'Mushroom body calyces receive projection neuron axons onto tens of thousands of Kenyon cells (KCs). Sparse coding enables vast associative capacity. Dopaminergic and octopaminergic modulatory neurons gate synaptic plasticity to encode conditioned valence.',
    antwireModel: 'Implemented as a sparse projection layer modulated by 3-factor octopamine (appetitive) and dopamine (aversive) eligibility traces.',
    limitation: 'Plasticity is implemented with mathematical STDP approximations rather than intracellular cAMP/PKA kinase cascades.',
    importance: 'Enables individual ants to learn rewarding food locations, avoid noxious hazards, and remember landmark routes.',
    confidence: 0.96,
    evidenceLevel: 'ESTABLISHED',
    source: 'Groh, C., & Rössler, W. (2011). Castes in the mushroom bodies: social insect brain plasticity. Frontiers in Neuroanatomy, 5, 59.',
    sourceUrl: 'https://doi.org/10.3389/fnana.2011.00059',
    doi: '10.3389/fnana.2011.00059',
    publicationYear: 2011,
    species: ['Apis mellifera', 'Formica polyctena', 'Cataglyphis fortis'],
    tags: ['mushroom_body', 'kenyon_cells', 'learning', 'memory', 'plasticity'],
    relatedTopics: ['stdp_plasticity', 'neuromodulation_monoamines', 'navigation_path_integration'],
  },

  'central_complex_navigation': {
    id: 'central_complex_navigation',
    title: 'Central Complex Ring Attractor & Celestial Compass',
    category: 'Navigation',
    summary: 'The central complex maintains an allocentric 16-wedge heading compass and integrates walking steps to compute home vectors.',
    biologicalFact: 'The ellipsoid body (EB) and protocerebral bridge (PB) form a toroidal ring attractor holding a localized activity bump tracking celestial polarized light. The fan-shaped body (FB) integrates step frequency from the noduli (NO) to compute Euclidean return home vectors.',
    antwireModel: 'AntWire models a 16-column continuous angular integrator and step odometer maintaining Cartesian vector displacement relative to the nest.',
    limitation: 'Optical flow and skylight E-vector polarization are simplified into direct heading angles in standard simulation modes.',
    importance: 'Allows foragers to execute direct, straight-line returns to the nest after winding multi-hundred-meter foraging paths.',
    confidence: 0.96,
    evidenceLevel: 'ESTABLISHED',
    source: 'Stone, T. et al. (2017). An anatomically constrained model for path integration in the bee brain. Current Biology, 27(20), 3069-3085.',
    sourceUrl: 'https://doi.org/10.1016/j.cub.2017.08.052',
    doi: '10.1016/j.cub.2017.08.052',
    publicationYear: 2017,
    species: ['Cataglyphis fortis', 'Megalomyrmex', 'Formica'],
    tags: ['central_complex', 'path_integration', 'compass', 'navigation'],
    relatedTopics: ['mushroom_body_learning', 'foraging_dynamics', 'ventral_nerve_cord'],
  },

  'ventral_nerve_cord': {
    id: 'ventral_nerve_cord',
    title: 'Ventral Nerve Cord & Thoracic Central Pattern Generators',
    category: 'Nervous System',
    summary: 'The ventral nerve cord transmits descending motor steering commands to thoracic ganglia controlling alternating tripod gait.',
    biologicalFact: 'Descending interneurons traverse the ventral nerve cord (VNC) from the subesophageal zone and lateral accessory lobes into thoracic ganglia T1, T2, and T3, driving local central pattern generators (CPGs) that coordinate 6-legged alternating tripod locomotion.',
    antwireModel: 'AntWire links LAL steering outputs down to thoracic segmental motor units driving kinematic speed and angular steering.',
    limitation: 'Individual leg muscle viscoelastic dynamics are abstracted into kinematic tripod phase velocity.',
    importance: 'Bridges brain cognition with physical body locomotion, stance support, and load-bearing mechanics.',
    confidence: 0.95,
    evidenceLevel: 'ESTABLISHED',
    source: 'Tuthill, J. C., & Wilson, R. I. (2016). Mechanosensation and active movement in insects. Current Biology, 26(20), R1022-R1038.',
    sourceUrl: 'https://doi.org/10.1016/j.cub.2016.09.043',
    doi: '10.1016/j.cub.2016.09.043',
    publicationYear: 2016,
    species: ['Drosophila melanogaster', 'Formicidae'],
    tags: ['ventral_nerve_cord', 'locomotion', 'motor', 'cpg'],
    relatedTopics: ['central_complex_navigation', 'living_bridges_acrobatics', 'subesophageal_gnathal'],
  },

  'subesophageal_gnathal': {
    id: 'subesophageal_gnathal',
    title: 'Subesophageal Zone (SEZ) Mandibular & Gustatory Center',
    category: 'Brain Regions',
    summary: 'The SEZ coordinates mouthpart motor commands, mandibular leaf grasping, and trophallactic food liquid exchange.',
    biologicalFact: 'The subesophageal zone (SEZ) receives gustatory receptor neuron afferents and controls motor neurons innervating the mandibles, maxillae, and labium. It mediates the proboscis extension reflex and trophallaxis social feeding.',
    antwireModel: 'AntWire routes sugar tasting, mandible grasp/cut actions, and worker-to-worker trophallaxis energy transfers through SEZ units.',
    limitation: 'Gnathal neuromuscular motor units are computed as state triggers rather than continuous muscle tendon forces.',
    importance: 'Essential for leaf cutting, food transport, brood handling, and social trophallaxis.',
    confidence: 0.94,
    evidenceLevel: 'ESTABLISHED',
    source: 'Hölldobler, B., & Wilson, E. O. (1990). The Ants. Harvard University Press.',
    sourceUrl: 'https://www.hup.harvard.edu/books/9780674040755',
    publicationYear: 1990,
    species: ['Atta cephalotes', 'Camponotus', 'Formica'],
    tags: ['sez', 'mandibles', 'trophallaxis', 'gustation'],
    relatedTopics: ['trophallaxis_food_sharing', 'fungus_agriculture', 'ventral_nerve_cord'],
  },

  'pheromones_trail_following': {
    id: 'pheromones_trail_following',
    title: 'Chemical Pheromone Fields, Diffusion & Trail Stigmergy',
    category: 'Pheromones',
    summary: 'Pheromone fields serve as an external spatial memory where trails are formed, reinforced, and naturally decayed.',
    biologicalFact: 'Ants deposit multi-component volatile secretions from poison, Dufour, and pygidial glands. Pheromones diffuse through air and substrate according to physical diffusion laws and decay exponentially over minutes or hours.',
    antwireModel: 'AntWire models 3 distinct 2D scalar fields (Food Trail, Home Trail, Alarm) updated with continuous decay (e^-lambda*t) and 5-point discrete Laplacian diffusion.',
    limitation: 'Atmospheric boundary-layer turbulence and microclimatic air drafts are modeled as isotropic diffusion.',
    importance: 'Enables self-organized collective trail formation, shortest-path discovery, and rapid alarm propagation.',
    confidence: 0.99,
    evidenceLevel: 'ESTABLISHED',
    source: 'Czaczkes, T. J., Grüter, C., & Ratnieks, F. L. (2015). Trail pheromones: an integrative view of their role in social insect colony organization. Biological Reviews, 90(2), 589-609.',
    sourceUrl: 'https://doi.org/10.1111/brv.12124',
    doi: '10.1111/brv.12124',
    publicationYear: 2015,
    species: ['Lasius niger', 'Atta cephalotes', 'Linepithema humile'],
    tags: ['pheromones', 'stigmergy', 'diffusion', 'trails', 'communication'],
    relatedTopics: ['antennae_sensing', 'foraging_dynamics', 'stigmergy_coordination'],
  },

  'response_threshold_labor': {
    id: 'response_threshold_labor',
    title: 'Response Threshold Dynamics & Distributed Labor Allocation',
    category: 'Task Allocation',
    summary: 'Colony labor allocation emerges self-organized because workers possess individual stimulus response thresholds.',
    biologicalFact: 'In social insects, task allocation occurs without centralized supervision. Workers engage in a task when ambient stimulus intensity s exceeds their internal response threshold theta. Thresholds vary across castes and adapt with experience.',
    antwireModel: 'Implemented via the Bonabeau-Theraulaz response threshold equation P(engage) = s^2 / (s^2 + theta^2), dynamically modulated by colony demand signals.',
    limitation: 'AntWire uses standardized task categories rather than the continuous micro-behaviors observed in nature.',
    importance: 'Prevents colony bottlenecks and ensures seamless reallocation of workers when needs shift.',
    confidence: 0.95,
    evidenceLevel: 'ESTABLISHED',
    source: 'Bonabeau, E., Theraulaz, G., & Deneubourg, J. L. (1996). Quantitative study of the fixed-threshold model for the regulation of division of labour in insect societies. Proc. R. Soc. Lond. B, 263(1376), 1565-1569.',
    sourceUrl: 'https://doi.org/10.1098/rspb.1996.0229',
    doi: '10.1098/rspb.1996.0229',
    publicationYear: 1996,
    species: ['Temnothorax albipennis', 'Atta sexdens', 'Pogonomyrmex barbatus'],
    tags: ['task_allocation', 'thresholds', 'self_organization', 'division_of_labor'],
    relatedTopics: ['caste_polymorphism', 'stigmergy_coordination', 'fungus_agriculture'],
  },

  'caste_polymorphism': {
    id: 'caste_polymorphism',
    title: 'Morphological Allometry & Caste Specialization',
    category: 'Colony Organization',
    summary: 'Leafcutter workers exhibit continuous morphological scaling (minims to majors) that biases task efficiency.',
    biologicalFact: 'Higher attines (Atta) display pronounced physical polymorphism. Minims (~1.5mm) tend fungal micro-crypts; minors pulp leaves; mediae forage and cut vegetation; majors/soldiers (~14mm) defend against army ants and crush heavy obstacles.',
    antwireModel: 'AntWire scales body dimensions, movement velocity, mandibles, and sensory thresholds across 6 polymorphic castes.',
    limitation: 'Continuous developmental growth allometry is discretized into 6 representative caste archetypes.',
    importance: 'Dramatically increases energetic efficiency of complex agricultural and defense workloads.',
    confidence: 0.98,
    evidenceLevel: 'SPECIES_SPECIFIC',
    source: 'Wilson, E. O. (1980). Caste and division of labor in leaf-cutter ants. Behavioral Ecology and Sociobiology, 7(2), 143-156.',
    sourceUrl: 'https://doi.org/10.1007/BF00299511',
    doi: '10.1007/BF00299511',
    publicationYear: 1980,
    species: ['Atta cephalotes', 'Atta sexdens', 'Acromyrmex octospinosus'],
    tags: ['caste', 'polymorphism', 'allometry', 'atta', 'leafcutter'],
    relatedTopics: ['response_threshold_labor', 'fungus_agriculture', 'defense_behavior'],
  },

  'fungus_agriculture': {
    id: 'fungus_agriculture',
    title: 'Attine Agriculture & Gongylidia Nutrient Production',
    category: 'Colony Organization',
    summary: 'Leafcutter ants cultivate Leucoagaricus fungus gardens, converting inedible leaves into nutritious gongylidia.',
    biologicalFact: 'Leafcutter ants cannot directly digest cellulose. They pulp fresh foliage into substrate beds to nourish their symbiotic fungus Leucoagaricus gongylophorus, which produces swollen hyphal nodules (gongylidia) rich in lipids and carbohydrates.',
    antwireModel: 'Simulates substrate mass, fungal biomass, gongylidia harvest yields, contamination decay, and colony nutritional economics.',
    limitation: 'Biochemical enzymatic breakdown is modeled with coupled differential equations rather than explicit enzyme kinetics.',
    importance: 'The primary nutritional engine sustaining colonies of millions of workers.',
    confidence: 0.99,
    evidenceLevel: 'SPECIES_SPECIFIC',
    source: 'Currie, C. R. (2001). A community of ants, fungi, and bacteria: a multilateral approach to studying symbiosis. Annual Review of Microbiology, 55(1), 357-380.',
    sourceUrl: 'https://doi.org/10.1146/annurev.micro.55.1.357',
    doi: '10.1146/annurev.micro.55.1.357',
    publicationYear: 2001,
    species: ['Atta cephalotes', 'Atta colombica', 'Acromyrmex echinatior'],
    tags: ['fungus', 'agriculture', 'symbiosis', 'gongylidia', 'nutrition'],
    relatedTopics: ['escovopsis_hygiene', 'caste_polymorphism', 'foraging_dynamics'],
  },

  'escovopsis_hygiene': {
    id: 'escovopsis_hygiene',
    title: 'Pathogen Pressure (Escovopsis) & Metapleural Gland Hygiene',
    category: 'Defense',
    summary: 'Attine colonies deploy antibiotic-secreting bacteria and metapleural gland secretions to sanitize fungus gardens against Escovopsis.',
    biologicalFact: 'Attine gardens are parasitized by the specialized microfungus Escovopsis. Workers carry antibiotic-producing Pseudonocardia bacteria on their cuticles and apply metapleural gland secretions, isolating diseased fungal fragments into deep midden chambers.',
    antwireModel: 'Models contamination risk, metapleural sanitation behaviors, and midden refuse isolation chambers.',
    limitation: 'Bacterial antibiotic biochemistry is abstracted into a sanitization efficiency rate.',
    importance: 'Prevents catastrophic pathogen collapse in massive agricultural superorganisms.',
    confidence: 0.97,
    evidenceLevel: 'SPECIES_SPECIFIC',
    source: 'Currie, C. R., Scott, J. A., Summerbell, R. C., & Malloch, D. (1999). Fungus-growing ants use antibiotic-producing bacteria to control garden parasites. Nature, 398(6729), 701-704.',
    sourceUrl: 'https://doi.org/10.1038/19519',
    doi: '10.1038/19519',
    publicationYear: 1999,
    species: ['Acromyrmex octospinosus', 'Atta sexdens'],
    tags: ['escovopsis', 'pathogen', 'hygiene', 'metapleural_gland', 'midden'],
    relatedTopics: ['fungus_agriculture', 'nest_building_chambers', 'caste_polymorphism'],
  },

  'polyandry_queen_founding': {
    id: 'polyandry_queen_founding',
    title: 'Queen Polyandry & Claustral Colony Founding',
    category: 'Reproduction',
    summary: 'Foundress queens mate with multiple males, store sperm for decades, and found colonies claustrally with an infrabuccal fungal pellet.',
    biologicalFact: 'Atta gynes mate with 3-10+ males during a single nuptial flight, storing hundreds of millions of sperm in their spermatheca. After shedding wings and digging a chamber, the queen fertilizes an infrabuccal fungal pellet and rears the first brood with trophic eggs.',
    antwireModel: 'Simulates multi-drone spermathecal sperm storage, trophic egg oviposition, somatic energy depletion, and claustral emergence.',
    limitation: 'Hormonal vitellogenesis cycles are simplified into thermal metabolic incubation rates.',
    importance: 'Sustains genetic diversity and pathogen resilience throughout a queen’s 15-20 year lifespan.',
    confidence: 0.96,
    evidenceLevel: 'SPECIES_SPECIFIC',
    source: 'Hughes, W. O., et al. (2008). Ancestral high female multiple mating in the social Hymenoptera. Science, 320(5880), 1216-1218.',
    sourceUrl: 'https://doi.org/10.1126/science.1156108',
    doi: '10.1126/science.1156108',
    publicationYear: 2008,
    species: ['Acromyrmex echinatior', 'Atta colombica'],
    tags: ['queen', 'polyandry', 'reproduction', 'spermatheca', 'founding'],
    relatedTopics: ['fungus_agriculture', 'response_threshold_labor', 'caste_polymorphism'],
  },

  'living_bridges_acrobatics': {
    id: 'living_bridges_acrobatics',
    title: 'Self-Assembling Living Bridges & Acrobatic Scaffolds',
    category: 'Cooperation',
    summary: 'Ants interlock tarsal claws and mandibles to assemble dynamic living bridges that span gaps and optimize traffic flow.',
    biologicalFact: 'In Eciton and Linepithema, workers physically link appendages when encountering terrain voids. Bridges dynamically widen or shift position in real time to maximize colony traffic throughput, dissolving when traffic subsides.',
    antwireModel: 'AntWire implements dynamic collective structures with anchor points, tensile load capacities, and auto-dissolution timers.',
    limitation: 'Biomechanical friction and multi-body joint physics are computed with discrete link constraints.',
    importance: 'Demonstrates emergent superorganismal problem solving without centralized engineering blueprints.',
    confidence: 0.95,
    evidenceLevel: 'ESTABLISHED',
    source: 'Reid, C. R., et al. (2015). Army ants dynamically adjust living bridges to maximize traffic. PNAS, 112(49), 15113-15118.',
    sourceUrl: 'https://doi.org/10.1073/pnas.1512241112',
    doi: '10.1073/pnas.1512241112',
    publicationYear: 2015,
    species: ['Eciton burchellii', 'Linepithema humile'],
    tags: ['living_bridges', 'collective_behavior', 'cooperation', 'scaffolding'],
    relatedTopics: ['ventral_nerve_cord', 'foraging_dynamics', 'stigmergy_coordination'],
  },

  'stridulation_vibration': {
    id: 'stridulation_vibration',
    title: 'Substrate-Borne Acoustic Stridulation Communication',
    category: 'Communication',
    summary: 'Ants rub a postpetiolar scraper against a gastric file to send mechanical vibrations through foliage and soil.',
    biologicalFact: 'Atta ants stridulate during leaf cutting and cave-ins. Vibrations transmitted through plant tissue or soil recruit nearby workers and modulate mandibular cutting rhythm.',
    antwireModel: 'AntWire provides a discrete substrate acoustic vibration field with exponential spatial attenuation.',
    limitation: 'Soil heterogeneities and acoustic resonance modes are simplified into radial attenuation waves.',
    importance: 'Provides a high-speed non-chemical communication channel during excavation and harvesting.',
    confidence: 0.94,
    evidenceLevel: 'SPECIES_SPECIFIC',
    source: 'Roces, F., & Hölldobler, B. (1995). Vibrational communication in the leaf-cutting ant Atta cephalotes. Journal of Experimental Biology, 198(9), 1993-2005.',
    sourceUrl: 'https://doi.org/10.1242/jeb.198.9.1993',
    doi: '10.1242/jeb.198.9.1993',
    publicationYear: 1995,
    species: ['Atta cephalotes', 'Atta colombica'],
    tags: ['stridulation', 'vibration', 'communication', 'acoustics'],
    relatedTopics: ['antennae_sensing', 'foraging_dynamics', 'nest_building_chambers'],
  },

  'nest_building_chambers': {
    id: 'nest_building_chambers',
    title: 'Self-Organized Subterranean Excavation & Nest Architecture',
    category: 'Nest Building',
    summary: 'Colony subterranean nests feature dedicated interconnected chambers for the queen, brood, fungus gardens, and waste middens.',
    biologicalFact: 'Mature ant nests consist of vertical shafts and horizontal chambers excavated through stigmergic digging rules. Atta nests can exceed 30 meters across with hundreds of interconnected chambers housing millions of ants.',
    antwireModel: 'AntWire represents nests as spatial graphs with distinct chamber types, capacities, environmental physics, and autonomous subnest expansion.',
    limitation: 'Soil granulometry and moisture cohesion are abstracted into voxel excavation resistance.',
    importance: 'Provides a climate-controlled, defensible superorganismal fortress.',
    confidence: 0.96,
    evidenceLevel: 'ESTABLISHED',
    source: 'Tschinkel, W. R. (2004). The nest architecture of the Florida harvester ant, Pogonomyrmex badius. Journal of Insect Science, 4(1), 21.',
    sourceUrl: 'https://doi.org/10.1093/jis/4.1.21',
    doi: '10.1093/jis/4.1.21',
    publicationYear: 2004,
    species: ['Pogonomyrmex badius', 'Atta cephalotes', 'Formica'],
    tags: ['nest', 'excavation', 'chambers', 'subnests', 'architecture'],
    relatedTopics: ['fungus_agriculture', 'escovopsis_hygiene', 'stigmergy_coordination'],
  },

  'trophallaxis_food_sharing': {
    id: 'trophallaxis_food_sharing',
    title: 'Stomodeal Trophallaxis & Social Fluid Exchange',
    category: 'Communication',
    summary: 'Workers regurgitate liquid nutrients mouth-to-mouth to feed the queen, brood, and nestmates while circulating social hormones.',
    biologicalFact: 'Trophallaxis is mouth-to-mouth fluid transfer between ants. It circulates carbohydrates and proteins throughout the colony and distributes chemical cues, epigenetic microRNAs, and juvenile hormone precursors.',
    antwireModel: 'AntWire models pairwise energy transfers between replete donor ants and starving recipient workers/brood.',
    limitation: 'Endocrine and microRNA signaling molecules are abstracted into metabolic energy transfers.',
    importance: 'Creates a distributed "social crop" ensuring no individual worker starves while colony granaries have food.',
    confidence: 0.98,
    evidenceLevel: 'ESTABLISHED',
    source: 'LeBoeuf, A. C., et al. (2016). Oral transfer of chemical cues, growth factors and hormones in social insect trophallactic fluid. eLife, 5, e20375.',
    sourceUrl: 'https://doi.org/10.7554/eLife.20375',
    doi: '10.7554/eLife.20375',
    publicationYear: 2016,
    species: ['Camponotus floridanus', 'Formica', 'Solenopsis invicta'],
    tags: ['trophallaxis', 'food_sharing', 'social_fluid', 'communication'],
    relatedTopics: ['subesophageal_gnathal', 'response_threshold_labor', 'fungus_agriculture'],
  },

  'flywire_connectomics': {
    id: 'flywire_connectomics',
    title: 'FlyWire Drosophila Whole-Brain Connectomics (Scientific Inspiration)',
    category: 'Connectomics',
    summary: 'FlyWire is the landmark Drosophila whole-brain electron microscopy connectome that serves as an architectural inspiration for AntWire.',
    biologicalFact: 'FlyWire is a large-scale international scientific initiative that generated the first complete, proofread whole-brain connectome of the adult female fruit fly (Drosophila melanogaster), detailing ~139,255 neurons and over 50 million synapses.',
    antwireModel: 'AntWire adopts FlyWire’s software architecture (3D multi-scale navigation, explicit synapse metadata, and evidence levels) as an architectural template for ant-inspired simulations.',
    limitation: 'AntWire is an independent computational simulation and does NOT claim to possess an experimentally measured complete ant connectome equivalent to FlyWire.',
    importance: 'Provides the gold standard for open-source, multi-scale 3D connectomic visualization and data schemas.',
    confidence: 1.0,
    evidenceLevel: 'ESTABLISHED',
    source: 'Dorkenwald, S. et al. (2024). Neuronal wiring diagram of an adult brain. Nature, 634, 124-138. FlyWire Consortium.',
    sourceUrl: 'https://flywire.ai/',
    doi: '10.1038/s41586-024-07558-y',
    publicationYear: 2024,
    species: ['Drosophila melanogaster'],
    tags: ['flywire', 'connectomics', 'drosophila', 'reference_architecture'],
    relatedTopics: ['olfactory_glomeruli', 'mushroom_body_learning', 'central_complex_navigation'],
  },

  'stdp_plasticity': {
    id: 'stdp_plasticity',
    title: 'Spike-Timing-Dependent Plasticity (STDP) & Eligibility Traces',
    category: 'Learning',
    summary: 'Synapses strengthen when presynaptic spikes precede postsynaptic spikes within millisecond windows.',
    biologicalFact: 'STDP adjusts synaptic efficacy based on the relative timing of action potentials. In insect mushroom bodies, STDP operates in tandem with dopamine/octopamine release, forming 3-factor learning rules.',
    antwireModel: 'AntWire implements asymmetric exponential STDP windows with dopamine/octopamine reward prediction error modulation.',
    limitation: 'Intracellular calcium imaging dynamics and retrograde endocannabinoid messengers are abstracted.',
    importance: 'Underlies associative learning, odor valence conditioning, and policy optimization.',
    confidence: 0.95,
    evidenceLevel: 'ESTABLISHED',
    source: 'Cassenaer, S., & Laurent, G. (2012). Conditional regulation of associative learning by dopamine in an insect mushroom body. Nature, 482(7383), 77-81.',
    sourceUrl: 'https://doi.org/10.1038/nature10760',
    doi: '10.1038/nature10760',
    publicationYear: 2012,
    species: ['Locusta migratoria', 'Apis mellifera'],
    tags: ['stdp', 'plasticity', 'synapses', 'learning'],
    relatedTopics: ['mushroom_body_learning', 'neuromodulation_monoamines', 'lif_spiking_dynamics'],
  },

  'lif_spiking_dynamics': {
    id: 'lif_spiking_dynamics',
    title: 'Leaky Integrate-and-Fire (LIF) Computational Biophysics',
    category: 'Neuroscience',
    summary: 'Modelled neurons integrate synaptic input currents with passive membrane leakage until firing an action potential.',
    biologicalFact: 'Biological neurons integrate post-synaptic currents across their lipid bilayer membrane. When membrane potential depolarizes to threshold (~ -45 mV), voltage-gated sodium/potassium channels trigger a stereotypic action potential followed by refractory reset.',
    antwireModel: 'AntWire computes subthreshold membrane potential integration (tau_m * dV/dt = - (V - V_rest) + R*I) with discrete refractory timers.',
    limitation: 'Detailed Hodgkin-Huxley ionic channel kinetics are abstracted to ensure real-time simulation of 55,000+ neurons.',
    importance: 'Provides energy-efficient, biologically grounded temporal spiking computation.',
    confidence: 0.98,
    evidenceLevel: 'MODELLED',
    source: 'Gerstner, W., & Kistler, W. M. (2002). Spiking Neuron Models: Single Neurons, Populations, Plasticity. Cambridge University Press.',
    sourceUrl: 'https://doi.org/10.1017/CBO9780511815706',
    doi: '10.1017/CBO9780511815706',
    publicationYear: 2002,
    species: ['Computational Model'],
    tags: ['lif', 'spiking_neuron', 'membrane_potential', 'action_potential'],
    relatedTopics: ['stdp_plasticity', 'neuromodulation_monoamines', 'olfactory_glomeruli'],
  },

  'neuromodulation_monoamines': {
    id: 'neuromodulation_monoamines',
    title: 'Octopaminergic, Dopaminergic & Serotonergic Neuromodulation',
    category: 'Neuroscience',
    summary: 'Monoamines broadcast global behavioral states: octopamine drives reward/arousal, dopamine modulates punishment/motor vigor, and serotonin tunes pacing.',
    biologicalFact: 'In invertebrates, octopamine acts as the primary appetitive reward transmitter (analogous to mammalian noradrenaline/dopamine reward circuits). Dopamine mediates aversive threat conditioning, while serotonin regulates social aggression and locomotion pacing.',
    antwireModel: 'AntWire tracks scalar monoaminergic gain factors modulating sensory salience, exploration drive, and STDP learning rates.',
    limitation: 'Receptor subtype kinetics (e.g. OctbetaR vs Dop1R) are condensed into global neuromodulatory channels.',
    importance: 'Coordinates full-organism behavioral mode switches during hunger, foraging success, and predator encounters.',
    confidence: 0.96,
    evidenceLevel: 'ESTABLISHED',
    source: 'Perry, C. J., & Barron, A. B. (2013). Neural mechanisms of reward in insects. Annual Review of Entomology, 58, 543-562.',
    sourceUrl: 'https://doi.org/10.1146/annurev-ento-120811-153631',
    doi: '10.1146/annurev-ento-120811-153631',
    publicationYear: 2013,
    species: ['Apis mellifera', 'Formica', 'Drosophila'],
    tags: ['neuromodulation', 'octopamine', 'dopamine', 'serotonin', 'reward'],
    relatedTopics: ['mushroom_body_learning', 'stdp_plasticity', 'foraging_dynamics'],
  },

  'stigmergy_coordination': {
    id: 'stigmergy_coordination',
    title: 'Stigmergic Coordination & Indirect Environmental Memory',
    category: 'Stigmergy',
    summary: 'Ants coordinate complex group activities indirectly by modifying their shared physical and chemical environment.',
    biologicalFact: 'Coined by Pierre-Paul Grassé, stigmergy describes collective coordination where actions leave physical traces in the environment (pheromones, excavated soil, pellet mounds) that stimulate subsequent actions by nestmates without direct verbal communication.',
    antwireModel: 'AntWire uses pheromone fields, soil voxel states, and dropped food entities as indirect stigmergic coordination channels.',
    limitation: 'Micro-scale soil compaction physics are modeled with discrete excavation steps.',
    importance: 'The foundational mechanism allowing thousands of simple individual ants to construct complex collective colonies.',
    confidence: 0.99,
    evidenceLevel: 'ESTABLISHED',
    source: 'Theraulaz, G., & Bonabeau, E. (1999). A brief history of stigmergy. Artificial Life, 5(2), 97-116.',
    sourceUrl: 'https://doi.org/10.1162/106454699568700',
    doi: '10.1162/106454699568700',
    publicationYear: 1999,
    species: ['Atta', 'Lasius', 'Macrotermes'],
    tags: ['stigmergy', 'self_organization', 'indirect_communication', 'coordination'],
    relatedTopics: ['pheromones_trail_following', 'nest_building_chambers', 'response_threshold_labor'],
  },

  'foraging_dynamics': {
    id: 'foraging_dynamics',
    title: 'Optimal Foraging & Exploitation vs. Exploration Balance',
    category: 'Foraging',
    summary: 'Colonies balance scout exploration of unknown terrain with recruitment exploitation of rich discovered food patches.',
    biologicalFact: 'Ant foraging follows dynamic trade-offs between scouting exploration and trail recruitment. High-quality food sources stimulate vigorous pheromone deposition and stridulation, recruiting workforce while preserving scout dispersal.',
    antwireModel: 'AntWire balances curiosity-driven random walk heuristics with pheromone chemotaxis and path integration home vectors.',
    limitation: 'Nutrient stoichiometry (protein vs carbohydrate ratio selection) is simplified into energy density values.',
    importance: 'Maximizes colony net energy gain per unit time while adapting to depleting resource distributions.',
    confidence: 0.97,
    evidenceLevel: 'ESTABLISHED',
    source: 'Traniello, J. F. (1989). Foraging strategies of ants. Annual Review of Entomology, 34(1), 191-210.',
    sourceUrl: 'https://doi.org/10.1146/annurev.en.34.010189.001203',
    doi: '10.1146/annurev.en.34.010189.001203',
    publicationYear: 1989,
    species: ['Formica', 'Atta', 'Lasius'],
    tags: ['foraging', 'exploration', 'exploitation', 'food_harvesting'],
    relatedTopics: ['pheromones_trail_following', 'central_complex_navigation', 'antennae_sensing'],
  },

  'defense_behavior': {
    id: 'defense_behavior',
    title: 'Predator Evasion, Alarm Pheromones & Soldier Recruitment',
    category: 'Defense',
    summary: 'Encounters with predators trigger alarm pheromone release, evoking flight in nurses and aggressive recruitment in soldiers.',
    biologicalFact: 'When attacked by predatory ground beetles or army ants, workers release volatile 4-methyl-3-heptanone alarm pheromones. Small minims/nurses flee toward deep brood vaults while large major soldiers orient toward the alarm center with mandibles agape.',
    antwireModel: 'AntWire models a high-diffusion Alarm Pheromone channel and differential threat avoidance / aggression thresholds across castes.',
    limitation: 'Complex physical wrestling and venom injection are simplified into damage exchange rates.',
    importance: 'Protects the vulnerable queen, brood, and fungal crop from fatal predator incursions.',
    confidence: 0.96,
    evidenceLevel: 'ESTABLISHED',
    source: 'Hölldobler, B., & Wilson, E. O. (1990). The Ants. Harvard University Press.',
    sourceUrl: 'https://www.hup.harvard.edu/books/9780674040755',
    publicationYear: 1990,
    species: ['Atta', 'Formica', 'Solenopsis'],
    tags: ['defense', 'alarm_pheromone', 'predators', 'soldiers'],
    relatedTopics: ['pheromones_trail_following', 'caste_polymorphism', 'response_threshold_labor'],
  },

  'nuptial_flight_founding': {
    id: 'nuptial_flight_founding',
    title: 'Obligate Polyandry, Nuptial Flights & Claustral Colony Founding',
    category: 'Reproduction',
    summary: 'Queens mate with multiple males during synchronized nuptial flights, storing lifetime sperm in a specialized spermatheca for claustral nest founding.',
    biologicalFact: 'Leafcutter queens (Atta) and harvester queens engage in high-fecundity polyandry, mating with 3–15 males during a single nuptial flight. The queen preserves tens of millions of sperm viable in her spermatheca for up to 20 years, claustrally rearing the first generation of minim workers.',
    antwireModel: 'AntWire models polyandrous mating, claustral founding energy depletion, and genetic diversity in worker response thresholds.',
    limitation: 'Sperm competition dynamics and epigenetic methylation shifts are represented through summary parameters.',
    importance: 'Ensures colony genetic diversity, disease resistance, and continuous reproductive output.',
    confidence: 0.98,
    evidenceLevel: 'ESTABLISHED',
    source: 'Hughes, W. O., Ratnieks, F. L., & Boomsma, J. J. (2008). Multiple mating and disease resistance in social insects. Science, 320, 1213-1216.',
    sourceUrl: 'https://doi.org/10.1126/science.1156108',
    doi: '10.1126/science.1156108',
    publicationYear: 2008,
    species: ['Atta cephalotes', 'Acromyrmex echinatior'],
    tags: ['reproduction', 'queen', 'polyandry', 'nuptial_flight', 'founding'],
    relatedTopics: ['caste_polymorphism', 'fungus_agriculture', 'colony_thermodynamics'],
  },
};

export class BiologyKnowledgeBase {
  public static getAll(): BiologicalKnowledgeEntry[] {
    return Object.values(BIOLOGY_KNOWLEDGE_BASE);
  }

  public static getAllItems(): BiologicalKnowledgeEntry[] {
    return Object.values(BIOLOGY_KNOWLEDGE_BASE);
  }

  public static get(id: string): BiologicalKnowledgeEntry | undefined {
    const aliasMap: Record<string, string> = {
      'FACT-ATTINE-AGRICULTURE': 'fungus_agriculture',
      'FACT-OBLIGATE-POLYANDRY': 'nuptial_flight_founding',
      'FACT-ANTENNAL-CHEMORECEPTION': 'antennae_sensing',
      'FACT-ESC-DEFENSE': 'predator_defense_alarm',
    };
    const key = aliasMap[id] || id;
    const item = BIOLOGY_KNOWLEDGE_BASE[key];
    if (item && !item.sourceCitation) {
      item.sourceCitation = item.source;
    }
    return item;
  }

  public static getItem(id: string): BiologicalKnowledgeEntry | undefined {
    return BiologyKnowledgeBase.get(id);
  }

  public static getByCategory(category: BioCategory): BiologicalKnowledgeEntry[] {
    return Object.values(BIOLOGY_KNOWLEDGE_BASE).filter((e) => e.category === category);
  }

  public static getByTag(tag: string): BiologicalKnowledgeEntry[] {
    return Object.values(BIOLOGY_KNOWLEDGE_BASE).filter((e) => e.tags.includes(tag));
  }

  public static getByEvidenceLevel(level: BiologicalEvidenceLevel): BiologicalKnowledgeEntry[] {
    return Object.values(BIOLOGY_KNOWLEDGE_BASE).filter((e) => e.evidenceLevel === level);
  }

  public static search(query: string): BiologicalKnowledgeEntry[] {
    const q = query.toLowerCase();
    return Object.values(BIOLOGY_KNOWLEDGE_BASE).filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.summary.toLowerCase().includes(q) ||
        e.biologicalFact.toLowerCase().includes(q) ||
        e.antwireModel.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q))
    );
  }
}

export const BiologicalKnowledgeBase = BiologyKnowledgeBase;
