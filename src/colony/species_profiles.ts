/**
 * ANT BRAIN — Species Profile Registry & Scientific Provenance
 * Provides structured biological profiles distinguishing real species data from
 * synthetic computational models with explicit literature citations.
 */

import { ScientificClassification } from '../simulation/types';

export interface MorphologicalParameters {
  headLengthMm: number;
  thoraxLengthMm: number;
  gasterLengthMm: number;
  legSpanMm: number;
  antennaeSegments: number;
  massMg: number;
  speedMmPerSec: number;
}

export interface NeurosensoryParameters {
  olfactoryGlomeruliCount: number;
  kenyonCellCount: number;
  centralComplexWedges: number;
  visualOmmatidiaCount: number;
  pathIntegrationPrecision: number; // 0.0 to 1.0
  pheromoneSensitivityThreshold: number;
}

export interface SocialReproductiveParameters {
  socialOrganization: 'EUSOCIAL_MONOGYNE' | 'EUSOCIAL_POLYGYNE' | 'CLONAL_QUEENLESS' | 'DIMORPHIC_MAJOR_MINOR';
  queenPresent: boolean;
  divisionOfLaborPlasticity: number; // 0.0 (rigid) to 1.0 (highly plastic)
  eggDevelopmentDays: number;
  larvalDevelopmentDays: number;
  pupalDevelopmentDays: number;
}

export interface SpeciesProfile {
  id: string;
  scientificName: string;
  commonName: string;
  taxonomyClass: string;
  provenance: ScientificClassification;
  citation: string;
  doi?: string;
  description: string;
  morphology: MorphologicalParameters;
  neurosensory: NeurosensoryParameters;
  social: SocialReproductiveParameters;
}

export const SPECIES_REGISTRY: Record<string, SpeciesProfile> = {
  'formica-experimenta': {
    id: 'formica-experimenta',
    scientificName: 'Formica experimenta (Synthetic)',
    commonName: 'Biologically Inspired Laboratory Ant',
    taxonomyClass: 'COMPUTATIONAL_ABSTRACTION',
    provenance: 'BIOLOGICAL_INSPIRATION',
    citation: 'Ant Brain Open Observatory default synthetic model, calibrated to Formica rufa & Camponotus pennsylvanicus baseline ethology.',
    description: 'A robust, generalist eusocial model with active pheromone trail laying, collective recruitment, and monogyne queen reproduction.',
    morphology: {
      headLengthMm: 1.8,
      thoraxLengthMm: 3.2,
      gasterLengthMm: 3.6,
      legSpanMm: 8.5,
      antennaeSegments: 12,
      massMg: 7.2,
      speedMmPerSec: 25.0,
    },
    neurosensory: {
      olfactoryGlomeruliCount: 460,
      kenyonCellCount: 80000,
      centralComplexWedges: 16,
      visualOmmatidiaCount: 800,
      pathIntegrationPrecision: 0.92,
      pheromoneSensitivityThreshold: 0.05,
    },
    social: {
      socialOrganization: 'EUSOCIAL_MONOGYNE',
      queenPresent: true,
      divisionOfLaborPlasticity: 0.85,
      eggDevelopmentDays: 14,
      larvalDevelopmentDays: 18,
      pupalDevelopmentDays: 15,
    },
  },

  'ooceraea-biroi': {
    id: 'ooceraea-biroi',
    scientificName: 'Ooceraea biroi',
    commonName: 'Clonal Raider Ant',
    taxonomyClass: 'BIOLOGICAL_FACT',
    provenance: 'BIOLOGICAL_FACT',
    citation: 'Trible et al. (2017) Cell 170(4):727-735; McKenzie & Kronauer (2018) Current Biology. Active connectome model organism.',
    doi: '10.1016/j.cell.2017.07.014',
    description: 'Queenless, clonal parthenogenetic dorylomorph species exhibiting synchronized colony reproduction/foraging phases. High-resolution olfactory neuroanatomy reference species.',
    morphology: {
      headLengthMm: 0.7,
      thoraxLengthMm: 1.2,
      gasterLengthMm: 1.4,
      legSpanMm: 3.0,
      antennaeSegments: 9,
      massMg: 1.1,
      speedMmPerSec: 12.0,
    },
    neurosensory: {
      olfactoryGlomeruliCount: 500, // ~500 glomeruli identified in anatomical reconstructions
      kenyonCellCount: 50000,
      centralComplexWedges: 16,
      visualOmmatidiaCount: 0, // Blind subterranean worker
      pathIntegrationPrecision: 0.40, // Highly dependent on odor trails rather than sky compass
      pheromoneSensitivityThreshold: 0.01,
    },
    social: {
      socialOrganization: 'CLONAL_QUEENLESS',
      queenPresent: false, // Strict asexual clonal workers
      divisionOfLaborPlasticity: 0.95,
      eggDevelopmentDays: 9,
      larvalDevelopmentDays: 12,
      pupalDevelopmentDays: 10,
    },
  },

  'cataglyphis-fortis': {
    id: 'cataglyphis-fortis',
    scientificName: 'Cataglyphis fortis',
    commonName: 'Saharan Desert Ant',
    taxonomyClass: 'BIOLOGICAL_FACT',
    provenance: 'BIOLOGICAL_FACT',
    citation: 'Wehner & Srinivasan (2003) Annual Review of Entomology; Wittlinger et al. (2006) Science (Step-counter odometer).',
    doi: '10.1126/science.1126912',
    description: 'Solitary, high-speed desert thermophilic forager with state-of-the-art celestial polarization compass, visual path integration, and step-counting odometer without pheromones.',
    morphology: {
      headLengthMm: 2.2,
      thoraxLengthMm: 4.5,
      gasterLengthMm: 3.8,
      legSpanMm: 14.0,
      antennaeSegments: 12,
      massMg: 9.5,
      speedMmPerSec: 70.0, // High-speed thermal runner
    },
    neurosensory: {
      olfactoryGlomeruliCount: 280,
      kenyonCellCount: 120000, // Enormous mushroom bodies for visual route landmark memory
      centralComplexWedges: 16, // Dorsal Rim Area polarized skylight compass
      visualOmmatidiaCount: 1400,
      pathIntegrationPrecision: 0.99, // Unmatched dead-reckoning homing precision
      pheromoneSensitivityThreshold: 0.80, // Does not use pheromones on blistering desert sand
    },
    social: {
      socialOrganization: 'EUSOCIAL_MONOGYNE',
      queenPresent: true,
      divisionOfLaborPlasticity: 0.50,
      eggDevelopmentDays: 12,
      larvalDevelopmentDays: 14,
      pupalDevelopmentDays: 12,
    },
  },
};
