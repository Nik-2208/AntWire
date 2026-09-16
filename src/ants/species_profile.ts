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

export interface AntSpeciesProfile {
  id: string;
  name: string;
  scientificName: string;
  recruitmentMode: RecruitmentMode;
  pheromoneMode: PheromoneMode;
  foragingMode: ForagingMode;
  communicationMode: CommunicationMode;
  cooperationMode: CooperationMode;
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
  FORMICA_RUFA: {
    id: 'FORMICA_RUFA',
    name: 'Red Wood Ant',
    scientificName: 'Formica rufa',
    recruitmentMode: 'MASS_TRAIL_RECRUITMENT',
    pheromoneMode: 'MODULATED_TRAIL',
    foragingMode: 'TRAIL_AND_PATH_INTEGRATION',
    communicationMode: 'ANTENNATION_AND_STRIDULATION',
    cooperationMode: 'COOPERATIVE_HAULING',
    sensoryAssumptions: 'Combines celestial polarized light compass (DRA) with chemosensory antennal tropotaxis.',
    behaviorAssumptions: 'Lays and reinforces chemical recruitment trails during return journeys when resource quality is high and colony food need is positive.',
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
    recruitmentMode: 'SOLITARY_NON_RECRUITING',
    pheromoneMode: 'NO_RECRUITMENT_TRAIL',
    foragingMode: 'SYSTEMATIC_SEARCH_AND_INTEGRATION',
    communicationMode: 'TACTILE_ONLY',
    cooperationMode: 'SOLITARY',
    sensoryAssumptions: 'Ultra-high-precision celestial compass and step odometer; volatile trail pheromones evaporate immediately in desert heat.',
    behaviorAssumptions: 'Never deposits chemical food recruitment trails. Navigates purely via central complex path integration and panoramic visual vectors.',
    pheromoneParameters: {
      baseSensitivity: 0.05,
      depositionThreshold: 99.0, // Never deposits
      recruitmentThreshold: 99.0,
      trailFollowingBias: 0.0,
      trailReinforcementRate: 0.0,
      saturationInhibitionLevel: 0.0,
      congestionInhibitionCount: 1,
    },
  },

  ATTA_CEPHALOTES: {
    id: 'ATTA_CEPHALOTES',
    name: 'Leaf-cutter Ant',
    scientificName: 'Atta cephalotes',
    recruitmentMode: 'SATURATION_INHIBITED_HIGHWAY',
    pheromoneMode: 'SATURATION_INHIBITED_TRAIL',
    foragingMode: 'PHYSICAL_TRAIL_AND_VEGETATION_HARVEST',
    communicationMode: 'STRIDULATION_ALARM_AND_ANTENNATION',
    cooperationMode: 'COLLECTIVE_CHOP_AND_TRANSPORT',
    sensoryAssumptions: 'High olfactory sensitivity for trail following, mechanosensory stridulation perception.',
    behaviorAssumptions: 'Establishes persistent highways. Actively inhibits deposition when trail is already strongly marked or congested to prevent traffic jams.',
    pheromoneParameters: {
      baseSensitivity: 1.2,
      depositionThreshold: 0.2,
      recruitmentThreshold: 0.15,
      trailFollowingBias: 0.9,
      trailReinforcementRate: 0.8,
      saturationInhibitionLevel: 0.7, // Congestion avoidance
      congestionInhibitionCount: 4,
    },
  },

  TEMNOTHORAX_ALBIPENNIS: {
    id: 'TEMNOTHORAX_ALBIPENNIS',
    name: 'Rock Ant',
    scientificName: 'Temnothorax albipennis',
    recruitmentMode: 'TANDEM_RUNNING',
    pheromoneMode: 'SHORT_RANGE_MARKER',
    foragingMode: 'TANDEM_LEADER_FOLLOWER',
    communicationMode: 'BIDIRECTIONAL_ANTENNAL_TAPPING',
    cooperationMode: 'DYADIC_COOPERATION',
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
};

export const DEFAULT_SPECIES_PROFILE = SPECIES_PROFILES.FORMICA_RUFA;
