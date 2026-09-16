/**
 * ANT BRAIN — Core Type Definitions & Scientific Taxonomy
 * Authoritative single-source-of-truth types for digital twin simulation.
 */

export type Vector2D = {
  x: number;
  y: number;
};

export type Vector3D = {
  x: number;
  y: number;
  z: number;
};

/**
 * Scientific taxonomy classification tags for simulation features.
 */
export type ScientificClassification =
  | 'BIOLOGICAL_FACT'
  | 'BIOLOGICAL_INSPIRATION'
  | 'COMPUTATIONAL_ABSTRACTION'
  | 'ENGINEERING_DECISION'
  | 'HYPOTHESIS';

export interface ScientificAnnotation {
  category: ScientificClassification;
  title: string;
  description: string;
  citationOrRationale?: string;
}

/**
 * Explicit Entity Lifecycle States.
 * Entities NEVER abruptly vanish when a variable crosses a threshold;
 * they undergo physiological state transitions.
 */
export type EntityLifeState =
  | 'ACTIVE'
  | 'INJURED'
  | 'EXHAUSTED'
  | 'DYING'
  | 'DEAD'
  | 'REMOVED';

/**
 * Explicit Biological Causes of Death.
 */
export type CauseOfDeath =
  | 'STARVATION'
  | 'PREDATOR'
  | 'COMBAT'
  | 'DISEASE'
  | 'ENVIRONMENT'
  | 'AGE'
  | 'INJURY'
  | 'NEST_DISASTER'
  | 'UNKNOWN';

/**
 * Ant Castes and Reproductive Categories (Haplodiploid biology)
 * Supports leafcutter polymorphic castes (Minim, Minor, Media, Major) and reproductive alates.
 */
export type AntCaste =
  | 'WORKER'
  | 'MINIM'
  | 'MINOR'
  | 'MEDIA'
  | 'MAJOR'
  | 'SOLDIER'
  | 'QUEEN'
  | 'GYNE'
  | 'MALE';

export type ReproductiveState =
  | 'NON_REPRODUCTIVE'
  | 'REPRODUCTIVE_WORKER'
  | 'GYNE'
  | 'VIRGIN_QUEEN'
  | 'MATED_QUEEN'
  | 'FOUNDRESS'
  | 'QUEEN'
  | 'MALE';

export type WorkerRole =
  | 'FORAGER'
  | 'SCOUT'
  | 'LEAF_CUTTER'
  | 'LEAF_PROCESSOR'
  | 'FUNGUS_GARDENER'
  | 'NURSE'
  | 'BUILDER'
  | 'GUARD'
  | 'MIDDEN_WORKER'
  | 'SANITATION'
  | 'HITCHHIKER'
  | 'GENERAL_WORKER'
  | 'REPRODUCTIVE';

export type TaskLifecycleState =
  | 'NOT_STARTED'
  | 'ACTIVE'
  | 'PAUSED'
  | 'COMPLETED'
  | 'FAILED'
  | 'ABANDONED';

export type TaskPriority = 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';

export type StarvationLevel = 'FED' | 'HUNGRY' | 'VERY_HUNGRY' | 'STARVING' | 'CRITICAL';

export type ColonyControlMode = 'AUTONOMOUS' | 'ASSISTED' | 'MANUAL';

export type ChamberType =
  | 'ENTRANCE'
  | 'FOOD_STORAGE'
  | 'BROOD_NURSERY'
  | 'QUEEN_CHAMBER'
  | 'FUNGUS_GARDEN'
  | 'LEAF_PROCESSING'
  | 'MIDDEN_REFUSE'
  | 'VENTILATION_SHAFT'
  | 'REST_AREA'
  | 'WASTE_AREA'
  | 'WATER_STORAGE'
  | 'DEFENSE'
  | 'GENERAL';

export interface NestChamberNode {
  id: string;
  name: string;
  type: ChamberType;
  position: Vector2D;
  depth: number; // meters below surface
  radius: number;
  maxOccupancy: number;
  currentOccupancy: number;
  storedFood?: number;
  foodCapacity?: number;
  volume?: number; // cubic meters
  temperature: number; // Celsius
  humidity: number; // 0 to 1
  structuralIntegrity: number; // 0 to 1
  safety: number; // 0 to 1
  isExcavated: boolean;
  excavationProgress: number; // 0 to 1
}

export interface NestTunnelEdge {
  id: string;
  fromChamberId: string;
  toChamberId: string;
  length: number;
  width: number;
  isPassable: boolean;
}

export type SubNestType =
  | 'SATELLITE_FORAGING'
  | 'PERIPHERAL_SHELTER'
  | 'BROOD_EXPANSION'
  | 'SECONDARY_HIVE'
  | 'SENTRY_OUTPOST';

export interface SubNestNode {
  id: string;
  name: string;
  type: SubNestType;
  entrancePosition: Vector2D;
  entranceRadius: number;
  isEstablished: boolean;
  constructionProgress: number; // 0.0 to 1.0
  buildingMaterial: number;
  storedFood: number;
  foodCapacity: number;
  maxOccupancy: number;
  currentOccupancy: number;
  chambers: NestChamberNode[];
  tunnels: NestTunnelEdge[];
  parentNestId: string; // ID of main nest or root hive
  connectingTunnelId?: string;
  distanceToMainNest: number;
  activeBuilders: number;
  establishedAtTick?: number;
}

export interface NestInterconnection {
  id: string;
  fromNestId: string;
  toNestId: string;
  fromPosition: Vector2D;
  toPosition: Vector2D;
  length: number;
  width: number;
  isExcavated: boolean;
  progress: number;
}

export interface ColonyNeedsVector {
  foodNeed: number;        // 0 to 1: Demand to forage food
  waterNeed: number;       // 0 to 1: Demand for hydration
  broodNeed: number;       // 0 to 1: Demand for nursing eggs/larvae/pupae
  queenNeed: number;       // 0 to 1: Demand to feed and groom queen
  nestNeed: number;        // 0 to 1: Demand to excavate and repair chambers
  defenseNeed: number;     // 0 to 1: Demand to repel predators/hazards
  sanitationNeed: number;  // 0 to 1: Demand to remove corpses/waste
  socialCareNeed: number;  // 0 to 1: Demand for trophallaxis & rescue
  explorationNeed: number; // 0 to 1: Demand for scouting new territory
  reserveNeed: number;     // 0 to 1: Demand to safeguard minimum reserve

  // Backward-compatible aliases
  foragingNeed?: number;
  broodCareNeed?: number;
  buildingNeed?: number;
  queenHunger?: number;
}

export type AntTask =
  | 'IDLE'
  | 'IDLE_REASSESS'
  | 'EXPLORE'
  | 'EXPLORING'
  | 'SCOUT'
  | 'SEEK_FOOD'
  | 'FORAGING'
  | 'CUT_VEGETATION'
  | 'PULP_LEAF_SUBSTRATE'
  | 'TEND_FUNGUS'
  | 'HARVEST_GONGYLIDIA'
  | 'MIDDEN_CLEANUP'
  | 'HITCHHIKE_DEFENSE'
  | 'NUPTIAL_DISPERSAL'
  | 'CLAUSTRO_FOUNDING'
  | 'COLLECT_FOOD'
  | 'COLLECTING_FOOD'
  | 'TRANSPORT_FOOD'
  | 'RETURN_HOME'
  | 'RETURNING_TO_NEST'
  | 'RETRIEVE_FOOD_FROM_STORAGE'
  | 'FOLLOW_TRAIL'
  | 'REST'
  | 'RESTING'
  | 'FEED'
  | 'BUILD'
  | 'BUILDING'
  | 'BUILD_CHAMBER'
  | 'EXCAVATE'
  | 'COLLECT_MATERIAL'
  | 'TRANSPORT_MATERIAL'
  | 'DISPOSE_MATERIAL'
  | 'MAINTAINING_NEST'
  | 'CARE_FOR_BROOD'
  | 'FEEDING_BROOD'
  | 'ATTEND_QUEEN'
  | 'ATTENDING_QUEEN'
  | 'DEFEND'
  | 'DEFENDING'
  | 'FLEE'
  | 'FLEEING'
  | 'SANITIZE'
  | 'SOCIAL_INTERACTION'
  | 'RESCUE_NESTMATE'
  | 'RECOVER'
  | 'TENDING_APHIDS'
  | 'CULTIVATING_FUNGUS';

/**
 * Motor Action Types
 */
export type ActionType =
  | 'MOVE_FORWARD'
  | 'TURN_LEFT'
  | 'TURN_RIGHT'
  | 'STOP'
  | 'COLLECT_FOOD'
  | 'DEPOSIT_FOOD'
  | 'CUT_LEAF'
  | 'MASTICATE_PULP'
  | 'INOCULATE_FUNGUS'
  | 'HARVEST_GONGYLIDIA'
  | 'STRIDULATE'
  | 'DISPERSE_NUPTIAL'
  | 'DEPOSIT_PHEROMONE'
  | 'FLEE'
  | 'INTERACT'
  | 'REST'
  | 'ATTACK'
  | 'TEND_APHID'
  | 'TEND_FUNGUS'
  | 'CARRY_CORPSE';

export interface AntAction {
  type: ActionType;
  turnAngle?: number; // radians
  speedMultiplier?: number;
  depositPheromoneType?: PheromoneChannel;
  depositPheromoneStrength?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Pheromone Field Channels
 */
export enum PheromoneChannel {
  FOOD_TRAIL = 0, // Recruits foragers toward discovered food sources
  HOME_TRAIL = 1, // Deposited on outbound journeys to orient back toward nest
  ALARM = 2,      // Emitted during predator or environmental threat encounters
  RECRUITMENT = 3, // Group recruitment for defense or heavy load
}

/**
 * Sensory Perception Snapshot
 */
export interface AntSensorySnapshot {
  // Chemical sensing from antennae (normalized 0-1)
  foodLeft: number;
  foodCenter: number;
  foodRight: number;

  homeLeft: number;
  homeCenter: number;
  homeRight: number;

  alarmLeft: number;
  alarmCenter: number;
  alarmRight: number;

  // Direct cues & gradients
  foodOdorConcentration: number;
  foodOdorDirection: number; // relative angle in radians (-PI to PI)
  foodProximity: number; // 0 (far) to 1 (contact)
  detectedFoodId: string | null;

  nestOdorConcentration: number;
  nestOdorDirection: number; // relative angle in radians
  nestProximity: number; // 0 to 1
  isAtNestEntrance: boolean;

  // Visual/Proximity Obstacles and Threats
  obstacleLeft: number; // 0 = clear, 1 = immediate collision
  obstacleCenter: number;
  obstacleRight: number;

  predatorDetected: boolean;
  predatorProximity: number; // 0 to 1
  predatorRelativeAngle: number; // relative angle in radians

  // Social / Ant-to-Ant Contact
  nearbyAntsCount: number;
  nearestAntDistance: number;

  // Additional ecological cues
  nearestCorpseDistance?: number;
  nearestCorpseId?: string | null;
  queenDistance?: number;
  broodDistance?: number;
  socialFeedingRequestsNearby?: number;
}

/**
 * Internal Motivational Drives (Ethological Drive Reduction Model)
 */
export interface AntDrives {
  foodSeeking: number;      // 0 to 1: Drive to locate and harvest nutrients
  exploration: number;      // 0 to 1: Drive to scout unknown territory
  homing: number;           // 0 to 1: Drive to return to safety/nest
  threatAvoidance: number;  // 0 to 1: Drive to evade predators and hazardous zones
  socialInteraction: number;// 0 to 1: Drive to interact/groom/share resources
  broodCare: number;        // 0 to 1: Drive to attend to eggs, larvae, queen
  restRecovery: number;     // 0 to 1: Drive to rest when exhausted or recovering
  sanitation?: number;      // 0 to 1: Drive to carry corpses/waste away
}

/**
 * Internal Body State — Biology-First Mesoscale Abstraction.
 * Explicitly separates metabolic energy reserve from chronic starvation stress.
 */
export interface AntInternalState {
  energyReserve: number;     // 0 to 1: Immediate metabolic fuel
  energy: number;            // Backwards-compatible alias for energyReserve
  hunger: number;            // 0 to 1: Acute foraging motivation
  starvationStress: number;  // 0 to 1: Chronic physiological stress accumulated during prolonged depletion
  starvationLevel?: StarvationLevel;
  health: number;            // 0 to 1: Somatic tissue integrity
  lifeState: EntityLifeState;// ACTIVE | INJURED | EXHAUSTED | DYING | DEAD | REMOVED
  causeOfDeath?: CauseOfDeath;
  injurySeverity: number;    // 0 to 1: Physical trauma from predators/fights
  mobilityPenalty: number;   // 0 to 1: Locomotor speed reduction from injury/exhaustion
  threatLevel: number;       // 0 to 1: Acute physiological arousal / panic
  carryingFoodAmount: number;// 0 = empty, >0 = carrying resource units
  carryingFoodId: string | null;
  carryingCorpseId: string | null; // For sanitation workers
  age: number;               // simulation seconds
  lifespan: number;          // maximum lifespan before senescence
  isAlive: boolean;
  socialAffinity: number;    // 0 to 1: Positive nestmate association index
  helpRequested?: boolean;   // True if emitting local feeding/help cue
}

/**
 * Structured Decision Record for Explainability & Real-Time Decision Trace
 */
export interface DecisionRecord {
  id: string;
  antId: string;
  timestamp: number; // sim time in seconds
  tick: number;
  sensorySnapshot: AntSensorySnapshot;
  internalState: AntInternalState;
  drives: AntDrives;
  selectedAction: AntAction;
  dominantDrive: string;
  dominantDriveValue: number;
  confidence: number;
  humanReason: string; // Plain-English non-technical explanation
  technicalExplanation: string; // Rigorous parameter-based breakdown
}

/**
 * Brood Lifecycle Stages (Holometabolous Development)
 */
export type BroodStage = 'EGG' | 'LARVA' | 'PUPA';

export interface BroodEntity {
  id: string;
  stage: BroodStage;
  age: number; // seconds
  developmentProgress: number; // 0 to 1 (1 = transitions to next stage/adult)
  fedAmount: number; // required for larvae to pupate
  careNeed: number; // groom/temperature regulation need
  temperatureOptimal: number; // Celsius (e.g. 25-28C)
  isAlive: boolean;
  position: Vector2D;
}

/**
 * Food Resource Types
 */
export type ResourceType =
  | 'SUGAR_CRYSTAL'
  | 'HONEYDEW'
  | 'PROTEIN_PREY'
  | 'SEED'
  | 'LEAF_FRAGMENT'
  | 'LEAF_PULP'
  | 'GONGYLIDIA'
  | 'FUNGUS_BIOMASS'
  | 'INFRABUCCAL_PELLET';

export interface FoodEntity {
  id: string;
  position: Vector2D;
  amount: number; // remaining nutrition units
  initialAmount: number;
  radius: number;
  color: string;
  resourceType?: ResourceType;
  energyDensity?: number; // energy per unit
  proteinDensity?: number;// for brood development
  remainingQuantity?: number;
  reservationQuantity?: number;
  reservedAntIds?: string[];
  leafToughness?: number; // for leafcutter cutting rate
  foliarChemistryScore?: number; // secondary metabolites deterrence
}

/**
 * Obstacle Entity
 */
export interface ObstacleEntity {
  id: string;
  position: Vector2D;
  radius: number;
  height: number;
}

/**
 * Predator Types and Behavioral AI States
 */
export type PredatorType =
  | 'GROUND_BEETLE'
  | 'WOLF_SPIDER'
  | 'PRAYING_MANTIS'
  | 'ARTHROPOD_HUNTER';

export type PredatorBehaviorState =
  | 'SEARCH'
  | 'DETECT'
  | 'APPROACH'
  | 'ATTACK'
  | 'FEED'
  | 'RETREAT'
  | 'WANDER';

export interface PredatorProfile {
  type: PredatorType;
  name: string;
  patrolSpeed: number;
  chaseSpeed: number;
  detectionRadius: number;
  attackRadius: number;
  attackDamage: number;
  aggression: number; // 0 to 1
  attackCooldownTime: number; // seconds
  radius: number;
  color: string;
}

export interface PredatorState {
  id: string;
  type: PredatorType;
  position: Vector2D;
  heading: number; // radians
  speed: number;
  health: number;
  targetAntId: string | null;
  state: PredatorBehaviorState;
  killCount: number;
  attackCooldown: number;
  feedTimer: number;
}

/**
 * Colony Crisis States
 */
export type ColonyStatus =
  | 'HEALTHY'
  | 'STRESSED'
  | 'CRITICAL'
  | 'COLLAPSING'
  | 'RECOVERING';

/**
 * Symbiosis & Ecological Interaction Model
 */
export type EcologicalInteractionType =
  | 'MUTUALISM'
  | 'COMMENSALISM'
  | 'PARASITISM'
  | 'PREDATION'
  | 'COMPETITION'
  | 'FACILITATION';

export interface AphidEntity {
  id: string;
  position: Vector2D;
  health: number;
  honeydewReserve: number; // 0 to 1
  honeydewProductionRate: number; // per sec
  tendedByAntId: string | null;
  age: number;
  isAlive: boolean;
}

export interface FungusGarden {
  id: string;
  chamberId?: string;
  position: Vector2D;
  substrateMass: number;        // fresh chewed leaf pulp (grams/units)
  fungalBiomass: number;        // living mycelium matrix
  gongylidiaBiomass: number;    // edible swollen gongylidia clusters harvestable by ants
  contaminationLevel: number;   // Escovopsis microfungal parasite fraction (0-1)
  growthRate: number;           // biomass synthesis efficiency
  hydration: number;            // garden moisture (0.6 - 0.9 optimum)
  temperature: number;          // Celsius (23 - 28C optimum)
  metapleuralHygiene: number;   // antibiotic protection level from worker grooming
  lastTendedTick?: number;
}

/**
 * Substrate Acoustic Vibration & Stridulation Signal
 */
export interface VibrationSignal {
  id: string;
  emitterId: string;
  position: Vector2D;
  frequencyHz: number;          // e.g. 500-1000 Hz
  amplitude: number;            // normalized intensity [0, 1]
  radius: number;               // physical range through substrate/soil
  purpose: 'LEAF_CUTTING' | 'ALARM_DEFENSE' | 'STRIDULATION_COMM' | 'CAVE_IN_RESCUE';
  timestamp: number;
  decayRate: number;
}

/**
 * Polymorphic Caste Morphology & Physical Scaling
 */
export interface CasteMorphologyTraits {
  caste: AntCaste;
  headWidthMm: number;
  bodyLengthMm: number;
  massMg: number;
  mandibleForceN: number;
  maxCargoCapacityUnits: number;
  movementSpeedModifier: number;
  metabolicCostRate: number;
  leafCuttingEfficiency: number;
  fungusTendingAffinity: number;
  defenseAffinity: number;
  broodCareAffinity: number;
}
