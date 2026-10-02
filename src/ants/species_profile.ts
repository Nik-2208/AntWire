/**
 * ANTWIRE — Modelled Species Profiles & Behavioral Diversity
 * Created & Developed by Nikhilesh H. Chavda
 *
 * Implements configurable species profiles ensuring that ant behavior (particularly
 * pheromone deposition, recruitment, and cooperation) is explicitly recognized as
 * species-specific rather than a universal biological caricature.
 *
 * Scientific Literature Grounding:
 * - Formica rufa: Wood ants combining path integration with trail pheromones (Buehlmann et al., 2020).
 * - Cataglyphis fortis: Desert ants using solitary path integration without chemical trails (Wehner, 2003).
 * - Atta cephalotes: Leaf-cutters with congestion-dependent trail regulation (Wilson, 1980; Dussutour et al., 2004).
 * - Temnothorax albipennis: Rock ants with dyadic tandem running (Franks & Richardson, 2006).
 */

export type RecruitmentMode =
  | 'MASS_TRAIL_RECRUITMENT'
  | 'SOLITARY_NON_RECRUITING'
  | 'SATURATION_INHIBITED_HIGHWAY'
  | 'TANDEM_RUNNING';

export type PheromoneMode =
  | 'MODULATED_TRAIL'
  | 'NO_RECRUITMENT_TRAIL'
  | 'SATURATION_INHIBITED_TRAIL'
  | 'SHORT_RANGE_MARKER';

export type ForagingMode =
  | 'TRAIL_AND_PATH_INTEGRATION'
  | 'SYSTEMATIC_SEARCH_AND_INTEGRATION'
  | 'PHYSICAL_TRAIL_AND_VEGETATION_HARVEST'
  | 'TANDEM_LEADER_FOLLOWER';

export type CommunicationMode =
  | 'ANTENNATION_AND_STRIDULATION'
  | 'TACTILE_ONLY'
  | 'STRIDULATION_ALARM_AND_ANTENNATION'
  | 'BIDIRECTIONAL_ANTENNAL_TAPPING';

export type CooperationMode =
  | 'COOPERATIVE_HAULING'
  | 'SOLITARY'
  | 'COLLECTIVE_CHOP_AND_TRANSPORT'
  | 'DYADIC_COOPERATION';

export type QueenSuccessionStrategy =
  | 'QUEEN_REARING'
  | 'GAMERGATE_SUCCESSION'
  | 'WORKER_REPRODUCTION'
  | 'QUEEN_ADOPTION_OR_MERGER'
  | 'QUEENLESS_REPRODUCTIVE_CYCLE'
  | 'NONE';

export interface AntSpeciesProfile {
  id: string;
  name: string;
  scientificName: string;
  description: string;
  // 10 Explicit Biological Behavioral Profile Fields
  casteStructure: string;
  workerSpecialization: string;
  foragingStrategy: string;
  recruitmentMechanism: string;
  pheromoneBehavior: string;
  nestOrganization: string;
  foodStrategy: string;
  defenseBehavior: string;
  queenBroodBehavior: string;
  cooperationRules: string;
  // Mode Enums
  recruitmentMode: RecruitmentMode;
  pheromoneMode: PheromoneMode;
  foragingMode: ForagingMode;
  communicationMode: CommunicationMode;
  cooperationMode: CooperationMode;
  queenSuccessionStrategy: QueenSuccessionStrategy;
  sensoryAssumptions: string;
  behaviorAssumptions: string;
  pheromoneParameters: {
    baseSensitivity: number;
    depositionThreshold: number; // minimum resource quality/need to deposit
    recruitmentThreshold: number;
    trailFollowingBias: number;
    trailReinforcementRate: number;
    saturationInhibitionLevel: number; // above this trail level, deposition decreases
    congestionInhibitionCount: number; // above this many nearby ants, deposition decreases
  };
}

export const SPECIES_PROFILES: Record<string, AntSpeciesProfile> = {
  GENERAL_ANT: {
    id: 'GENERAL_ANT',
    name: 'General Ant (Baseline Model)',
    scientificName: 'Formicidae (Generalist Model)',
    description: 'GENERAL COMPUTATIONAL ORGANISM: Balances individual path integration with chemical recruitment, cooperative task allocation, and social communication.',
    casteStructure: 'Polymorphic/monomorphic worker castes (Minim, Minor, Media, Major/Soldier), mated Queen',
    workerSpecialization: 'Age and experience polyethism (Nurses attend brood/queen, Foragers harvest resources, Soldiers patrol and defend)',
    foragingStrategy: 'Dual sensory navigation: path integration + chemical trail following + direct volatile odor localization',
    recruitmentMechanism: 'Context-dependent chemical recruitment trails + local tactile/chemical antennation',
    pheromoneBehavior: 'Modulated multi-channel deposition (Food, Home, Recruitment, Danger, Task, Explore) with saturation damping',
    nestOrganization: 'Subterranean chamber network with storage granaries, brood nurseries, queen chambers, and waste middens',
    foodStrategy: 'Resource discovery -> quality evaluation -> harvesting & transport -> storage delivery -> trophallactic social fluid sharing',
    defenseBehavior: 'Graduated response: alarm pheromone release, worker evacuation, soldier interception, and cooperative nest defense',
    queenBroodBehavior: 'Protected subterranean queen chamber; workers groom, feed, and thermoregulate developing eggs, larvae, and pupae',
    cooperationRules: 'Cooperative heavy transport, collective defense, tandem recruitment, and stomodeal trophallaxis',
    recruitmentMode: 'MASS_TRAIL_RECRUITMENT',
    pheromoneMode: 'MODULATED_TRAIL',
    foragingMode: 'TRAIL_AND_PATH_INTEGRATION',
    communicationMode: 'ANTENNATION_AND_STRIDULATION',
    cooperationMode: 'COOPERATIVE_HAULING',
    queenSuccessionStrategy: 'QUEEN_REARING',
    sensoryAssumptions: 'Dual antennal chemoreception (tropotaxis), optical compound eye visual fields, and tactile touch sensors.',
    behaviorAssumptions: 'Local distributed decision making driven by internal physiology (energy, hunger, hydration), memory, and colony demand vectors.',
    pheromoneParameters: {
      baseSensitivity: 1.0,
      depositionThreshold: 0.30,
      recruitmentThreshold: 0.20,
      trailFollowingBias: 0.80,
      trailReinforcementRate: 0.70,
      saturationInhibitionLevel: 8.0,
      congestionInhibitionCount: 10,
    },
  },

  LEAFCUTTER_INSPIRED: {
    id: 'LEAFCUTTER_INSPIRED',
    name: 'Leaf-cutter Ant (Modelled Profile)',
    scientificName: 'Atta cephalotes (Inspired)',
    description: 'LEAFCUTTER-INSPIRED MODEL: Polymorphic worker castes cultivate subterranean fungal gardens using freshly harvested leaf substrate.',
    casteStructure: 'Polymorphic castes (Minim, Minor, Media, Major/Soldier), mated Queen',
    workerSpecialization: 'Age and size polyethism (Minims tend fungus/brood, Minors process leaves/clean, Medias harvest/transport, Majors defend)',
    foragingStrategy: 'Physical highway trails, leaf discovery, chopping, transport to subterranean nest',
    recruitmentMechanism: 'Saturation-inhibited highway chemical trails + stridulation alarm signalling',
    pheromoneBehavior: 'Persistent trail highways with congestion-dependent inhibition to prevent traffic bottlenecks',
    nestOrganization: 'Multi-chamber subterranean nest graph with dedicated fungus gardens and midden refuse chambers',
    foodStrategy: 'Leaf substrate harvesting -> mastication & pulp preparation -> fungal garden cultivation -> gongylidia harvest for colony nutrition',
    defenseBehavior: 'Major soldiers respond to threats, hitchhiker minims defend foragers on carried leaves against phorid flies',
    queenBroodBehavior: 'Dedicated queen chamber attended by minims/nurses; eggs and larvae nourished on cultivated fungal gongylidia',
    cooperationRules: 'Collective leaf harvesting, hitchhiker transport on carried leaves, group soldier defense',
    recruitmentMode: 'SATURATION_INHIBITED_HIGHWAY',
    pheromoneMode: 'SATURATION_INHIBITED_TRAIL',
    foragingMode: 'PHYSICAL_TRAIL_AND_VEGETATION_HARVEST',
    communicationMode: 'STRIDULATION_ALARM_AND_ANTENNATION',
    cooperationMode: 'COLLECTIVE_CHOP_AND_TRANSPORT',
    queenSuccessionStrategy: 'NONE', // Strict monogyny: loss of founding claustral queen cannot be replaced
    sensoryAssumptions: 'High olfactory sensitivity for trail following, mechanosensory stridulation perception.',
    behaviorAssumptions: 'Establishes persistent highways. Actively inhibits deposition when trail is already strongly marked or congested.',
    pheromoneParameters: {
      baseSensitivity: 1.2,
      depositionThreshold: 0.2,
      recruitmentThreshold: 0.15,
      trailFollowingBias: 0.9,
      trailReinforcementRate: 0.8,
      saturationInhibitionLevel: 0.7,
      congestionInhibitionCount: 4,
    },
  },

  FORMICA_RUFA: {
    id: 'FORMICA_RUFA',
    name: 'Red Wood Ant',
    scientificName: 'Formica rufa',
    description: 'SPECIES-SPECIFIC MODEL: Wood ants combining path integration with trail pheromones.',
    casteStructure: 'Monomorphic workers, mated Queen',
    workerSpecialization: 'Temporal polyethism based on age and experience',
    foragingStrategy: 'Trail navigation and path integration for honeydew and insect prey',
    recruitmentMechanism: 'Mass chemical trail recruitment',
    pheromoneBehavior: 'Modulated recruitment trails based on resource quality and colony hunger',
    nestOrganization: 'Above-ground thatch mounds connected to subterranean galleries',
    foodStrategy: 'Direct aphid honeydew collection and arthropod prey foraging',
    defenseBehavior: 'Formic acid spraying and mandibulary biting',
    queenBroodBehavior: 'Polygynous or monogynous queen chambers, central nursery brood care',
    cooperationRules: 'Cooperative hauling of heavy prey items',
    recruitmentMode: 'MASS_TRAIL_RECRUITMENT',
    pheromoneMode: 'MODULATED_TRAIL',
    foragingMode: 'TRAIL_AND_PATH_INTEGRATION',
    communicationMode: 'ANTENNATION_AND_STRIDULATION',
    cooperationMode: 'COOPERATIVE_HAULING',
    queenSuccessionStrategy: 'QUEEN_ADOPTION_OR_MERGER', // Polygynous gyne adoption and nest budding
    sensoryAssumptions: 'Combines celestial polarized light compass (DRA) with chemosensory antennal tropotaxis.',
    behaviorAssumptions: 'Lays and reinforces chemical recruitment trails during return journeys when resource quality is high.',
    pheromoneParameters: {
      baseSensitivity: 1.0,
      depositionThreshold: 0.35,
      recruitmentThreshold: 0.25,
      trailFollowingBias: 0.75,
      trailReinforcementRate: 0.6,
      saturationInhibitionLevel: 0.85,
      congestionInhibitionCount: 6,
    },
  },

  CATAGLYPHIS_FORTIS: {
    id: 'CATAGLYPHIS_FORTIS',
    name: 'Saharan Desert Ant',
    scientificName: 'Cataglyphis fortis',
    description: 'SPECIES-SPECIFIC MODEL: Desert ants using solitary path integration without chemical trails.',
    casteStructure: 'Monomorphic workers, single Queen',
    workerSpecialization: 'Solitary foraging scouts',
    foragingStrategy: 'Systematic search vectors and path integration in high temperature desert terrain',
    recruitmentMechanism: 'Solitary non-recruiting search',
    pheromoneBehavior: 'No chemical recruitment trails due to extreme thermal evaporation',
    nestOrganization: 'Deep subterranean vertical shafts protecting against extreme heat',
    foodStrategy: 'Scavenging heat-stricken insect carcasses',
    defenseBehavior: 'Rapid speed escape, defensive biting when cornered',
    queenBroodBehavior: 'Deep subterranean queen chamber protection',
    cooperationRules: 'Solitary transport, no cooperative hauling',
    recruitmentMode: 'SOLITARY_NON_RECRUITING',
    pheromoneMode: 'NO_RECRUITMENT_TRAIL',
    foragingMode: 'SYSTEMATIC_SEARCH_AND_INTEGRATION',
    communicationMode: 'TACTILE_ONLY',
    cooperationMode: 'SOLITARY',
    queenSuccessionStrategy: 'NONE', // Strict monogyny in harsh desert
    sensoryAssumptions: 'Ultra-high-precision celestial compass and step odometer.',
    behaviorAssumptions: 'Never deposits chemical food recruitment trails. Navigates purely via central complex path integration.',
    pheromoneParameters: {
      baseSensitivity: 0.05,
      depositionThreshold: 99.0,
      recruitmentThreshold: 99.0,
      trailFollowingBias: 0.0,
      trailReinforcementRate: 0.0,
      saturationInhibitionLevel: 0.0,
      congestionInhibitionCount: 1,
    },
  },

  TEMNOTHORAX_ALBIPENNIS: {
    id: 'TEMNOTHORAX_ALBIPENNIS',
    name: 'Rock Ant',
    scientificName: 'Temnothorax albipennis',
    description: 'SPECIES-SPECIFIC MODEL: Rock ants using dyadic tandem running.',
    casteStructure: 'Small monomorphic worker population (<200), single Queen',
    workerSpecialization: 'Individual experience and teaching roles',
    foragingStrategy: 'Solitary search and tandem running recruitment',
    recruitmentMechanism: 'One-to-one tandem running with bidirectional antennal tapping',
    pheromoneBehavior: 'Short-range chemical nest markers',
    nestOrganization: 'Small rock crevice nests',
    foodStrategy: 'Small sugar droplets and micro-arthropod scavenging',
    defenseBehavior: 'Blocking nest entrance, rapid nest relocation when threatened',
    queenBroodBehavior: 'Close queen attendance in compact single-chamber nest',
    cooperationRules: 'Dyadic leader-follower tandem running',
    recruitmentMode: 'TANDEM_RUNNING',
    pheromoneMode: 'SHORT_RANGE_MARKER',
    foragingMode: 'TANDEM_LEADER_FOLLOWER',
    communicationMode: 'BIDIRECTIONAL_ANTENNAL_TAPPING',
    cooperationMode: 'DYADIC_COOPERATION',
    queenSuccessionStrategy: 'QUEEN_REARING',
    sensoryAssumptions: 'Tactile perception of follower antennal contacts on leader hind legs.',
    behaviorAssumptions: 'Recruitment is one-to-one tandem running rather than mass chemical trails.',
    pheromoneParameters: {
      baseSensitivity: 0.3,
      depositionThreshold: 0.6,
      recruitmentThreshold: 0.5,
      trailFollowingBias: 0.2,
      trailReinforcementRate: 0.1,
      saturationInhibitionLevel: 0.4,
      congestionInhibitionCount: 2,
    },
  },

  HARPEGNATHOS_SALTATOR: {
    id: 'HARPEGNATHOS_SALTATOR',
    name: 'Indian Jumping Ant',
    scientificName: 'Harpegnathos saltator',
    description: 'GAMERGATE REPRODUCTIVE SYSTEM: Ponerine ant with worker dominance tournaments and gamergate transformation following queen loss (Peeters et al., 2000; Sasaki et al., 2016).',
    casteStructure: 'Monomorphic workers, Gamergates, Foundress',
    workerSpecialization: 'Vision-guided solitary predation, jumping locomotion, dominance hierarchy',
    foragingStrategy: 'Large optical visual hunting and stereoscopic jumping attacks on live prey',
    recruitmentMechanism: 'Tandem running and solitary hunt',
    pheromoneBehavior: 'Cuticular hydrocarbon dominance profiles and localized recruitment cues',
    nestOrganization: 'Multi-tiered subterranean chambers with vaulted ceilings',
    foodStrategy: 'Solitary active hunting of live insect prey',
    defenseBehavior: 'Long-range visual detection, jumping strikes, and potent venomous stinging',
    queenBroodBehavior: 'Gamergates and nurses groom and provision brood with masticated insect prey',
    cooperationRules: 'Tandem calling and worker dominance tournaments for reproductive rights',
    recruitmentMode: 'TANDEM_RUNNING',
    pheromoneMode: 'SHORT_RANGE_MARKER',
    foragingMode: 'SYSTEMATIC_SEARCH_AND_INTEGRATION',
    communicationMode: 'ANTENNATION_AND_STRIDULATION',
    cooperationMode: 'DYADIC_COOPERATION',
    queenSuccessionStrategy: 'GAMERGATE_SUCCESSION',
    sensoryAssumptions: 'High-resolution binocular vision with motion parallax depth estimation.',
    behaviorAssumptions: 'Upon queen loss, workers stage antennal dueling tournaments; tournament winners transform physiologically into mated reproductive gamergates.',
    pheromoneParameters: {
      baseSensitivity: 0.4,
      depositionThreshold: 0.5,
      recruitmentThreshold: 0.4,
      trailFollowingBias: 0.3,
      trailReinforcementRate: 0.2,
      saturationInhibitionLevel: 0.5,
      congestionInhibitionCount: 3,
    },
  },

  PRISTOMYRMEX_PUNGENS: {
    id: 'PRISTOMYRMEX_PUNGENS',
    name: 'Queenless Parthenogenetic Ant',
    scientificName: 'Pristomyrmex punctatus',
    description: 'QUEENLESS CLONAL REPRODUCTION: Completely lacks queen caste; all workers reproduce parthenogenetically via thelytoky (Tsuji, 1988).',
    casteStructure: 'Queenless monomorphic clonal workers',
    workerSpecialization: 'Age-dependent polyethism: young workers reproduce and nurse in nest, older workers forage and defend',
    foragingStrategy: 'Mass recruitment to protein and sugar sources',
    recruitmentMechanism: 'Mass trail recruitment',
    pheromoneBehavior: 'Volatile trail pheromones and alarm recruitment',
    nestOrganization: 'Nomadic and semi-permanent subterranean nest clusters',
    foodStrategy: 'Omnivorous scavenging and honeydew collection',
    defenseBehavior: 'Collective swarming and biting',
    queenBroodBehavior: 'Communal brood care by young intranidal workers',
    cooperationRules: 'Collective foraging, communal egg laying, and cooperative transport',
    recruitmentMode: 'MASS_TRAIL_RECRUITMENT',
    pheromoneMode: 'MODULATED_TRAIL',
    foragingMode: 'TRAIL_AND_PATH_INTEGRATION',
    communicationMode: 'ANTENNATION_AND_STRIDULATION',
    cooperationMode: 'COOPERATIVE_HAULING',
    queenSuccessionStrategy: 'QUEENLESS_REPRODUCTIVE_CYCLE',
    sensoryAssumptions: 'Antennal chemoreception and collective alarm sensitivity.',
    behaviorAssumptions: 'No queen needed; young workers autonomously enter reproductive egg-laying cycles inside the nest.',
    pheromoneParameters: {
      baseSensitivity: 1.0,
      depositionThreshold: 0.3,
      recruitmentThreshold: 0.2,
      trailFollowingBias: 0.8,
      trailReinforcementRate: 0.7,
      saturationInhibitionLevel: 6.0,
      congestionInhibitionCount: 8,
    },
  },
};

export const DEFAULT_SPECIES_PROFILE = SPECIES_PROFILES.GENERAL_ANT;
