/**
 * ANT BRAIN — Authoritative Parameter & Configuration System
 * Single source of truth with strict command validation and live event emission.
 */

import { SimulationEventBus } from './events';

export type ParameterScope = 'ANT' | 'COLONY' | 'ENVIRONMENT' | 'PREDATOR' | 'PHEROMONE' | 'FOOD' | 'GENERAL';

export type ParameterClassification = 'SAFE_LIVE' | 'REQUIRES_RESET' | 'EXPERIMENT_ONLY';

export interface ParameterMetadata<T = number> {
  key: string;
  name: string;
  value: T;
  defaultValue: T;
  min: number;
  max: number;
  step: number;
  unit: string;
  description: string;
  scope: ParameterScope;
  classification: ParameterClassification;
  biologicalStatus: string;
}

export interface SimulationCommand {
  type: 'SET_PARAMETER' | 'RESET_SCOPE' | 'RESET_ALL';
  scope?: ParameterScope;
  key?: string;
  value?: number;
}

export class SimulationConfig {
  public static instance: SimulationConfig;

  // 1. Ant Biology Configuration
  public ant = {
    metabolicBaseRate: 0.0012,        // baseline energy loss per second
    kineticCostRate: 0.0030,          // movement cost per speed unit
    starvationOnsetThreshold: 0.08,   // energy level below which starvation stress begins accumulating
    starvationStressRate: 0.025,      // rate of starvation stress accumulation per second
    starvationRecoveryRate: 0.040,    // rate of starvation stress recovery when fed
    starvationMortalityLambda: 0.12,  // hazard rate of death when starvationStress > 0.8
    normalMovementSpeed: 4.2,         // units per second
    exhaustedSpeedMultiplier: 0.55,   // locomotor slowdown under severe stress
    feedingEfficiency: 0.5,           // proportion of food converted to energy reserve
    lifespanSeconds: 720.0,           // worker lifespan before senescence
    fearThreshold: 1.0,               // sensitivity to predator cues
  };

  // 2. Predator Ecological Configuration
  public predator = {
    aggression: 0.85,                 // chase persistence and attack probability
    patrolSpeed: 2.5,                 // search velocity
    chaseSpeed: 4.8,                  // pursuit velocity
    detectionRadius: 13.0,            // sensory awareness distance
    attackRadius: 1.4,                // bite/strike reach
    attackDamage: 0.45,               // damage per bite
    spawnRateSeconds: 45.0,           // natural ecological immigrant predator influx
    maxPredators: 6,                  // carrying capacity for predators
  };

  // 3. Pheromone Dynamics Configuration
  public pheromones = {
    foodTrailDecay: 0.018,            // evaporation rate per second
    homeTrailDecay: 0.012,            // evaporation rate per second
    alarmTrailDecay: 0.065,           // alarm dissipates rapidly
    diffusionRate: 0.08,              // spatial diffusion coefficient (Laplacian)
    depositionAmount: 1.0,            // chemical units emitted per deposit action
  };

  // 4. Environment Configuration
  public environment = {
    temperatureCelsius: 24.0,         // optimal temperature
    dayLengthSeconds: 120.0,          // diurnal rhythm duration
    foodSpawnInterval: 30.0,          // natural food replenishment timer
    foodClusterAmount: 80.0,          // nutrition units per natural patch
  };

  // 5. Colony Configuration
  public colony = {
    queenEggCooldown: 12.0,           // seconds between egg batches
    queenFoodPerEgg: 2.0,             // nutrition cost to produce one egg
    eggIncubationTime: 18.0,          // seconds to hatch into larva
    larvalDevelopmentTime: 24.0,      // seconds of feeding to reach pupation
    pupalDevelopmentTime: 18.0,       // metamorphosis time to adult
    larvaFoodDemand: 1.5,             // total food needed to pupate
    crisisThresholdFood: 10.0,        // below this, colony enters STRESSED
    starvationThresholdFood: 2.0,     // below this, colony enters CRITICAL
  };

  // 6. Food Logistics & Resource Dynamics Configuration
  public food = {
    carryCapacity: 3.0,               // max units a single worker can transport
    collectionRadius: 1.2,            // physical contact distance required to pick up
    collectionRate: 1.0,              // units picked up per harvest action
    deathResourceOutcome: 'FOOD_DROPS' as 'FOOD_DROPS' | 'FOOD_LOST', // whether carried food drops upon death
    socialTransferRadius: 1.0,        // proximity required for trophallaxis
    socialTransferMaxAmount: 1.5,     // max nutrition exchanged per trophallactic contact
    socialTransferHungerThreshold: 0.4,// recipient hunger level triggering food sharing request
  };

  // Parameter Registry for UI binding and inspection
  private registry: Map<string, ParameterMetadata> = new Map();

  constructor() {
    this.initRegistry();
    SimulationConfig.instance = this;
  }

  private initRegistry(): void {
    // Ant parameters
    this.register({
      key: 'ant.metabolicBaseRate',
      name: 'Metabolic Base Rate',
      value: this.ant.metabolicBaseRate,
      defaultValue: 0.0012,
      min: 0.0002,
      max: 0.01,
      step: 0.0002,
      unit: '/s',
      description: 'Basal resting metabolic rate consuming physiological energy reserves.',
      scope: 'ANT',
      classification: 'SAFE_LIVE',
      biologicalStatus: 'BIOLOGICAL_FACT (Lighton 1996: ant respirometry basal metabolic scaling)',
    });

    this.register({
      key: 'ant.kineticCostRate',
      name: 'Kinetic Movement Cost',
      value: this.ant.kineticCostRate,
      defaultValue: 0.0030,
      min: 0.0005,
      max: 0.015,
      step: 0.0005,
      unit: '/(u*s)',
      description: 'Locomotor cost added to metabolism per unit of travel speed.',
      scope: 'ANT',
      classification: 'SAFE_LIVE',
      biologicalStatus: 'BIOLOGICAL_FACT (Schilman et al. 2005: cost of transport in Formica)',
    });

    this.register({
      key: 'ant.starvationOnsetThreshold',
      name: 'Starvation Stress Onset',
      value: this.ant.starvationOnsetThreshold,
      defaultValue: 0.08,
      min: 0.01,
      max: 0.30,
      step: 0.01,
      unit: 'reserve ratio',
      description: 'Threshold of physiological reserve below which chronic starvation stress starts rising.',
      scope: 'ANT',
      classification: 'SAFE_LIVE',
      biologicalStatus: 'BIOLOGICAL_INSPIRATION (Homeostatic safety margin against lipid exhaustion)',
    });

    this.register({
      key: 'ant.starvationStressRate',
      name: 'Starvation Stress Rate',
      value: this.ant.starvationStressRate,
      defaultValue: 0.025,
      min: 0.005,
      max: 0.1,
      step: 0.005,
      unit: '/s',
      description: 'Rate of physiological deterioration when energy reserve is critically depleted.',
      scope: 'ANT',
      classification: 'SAFE_LIVE',
      biologicalStatus: 'BIOLOGICAL_INSPIRATION (Progressive tissue autophagy and muscular breakdown)',
    });

    // Predator parameters
    this.register({
      key: 'predator.aggression',
      name: 'Predator Aggressiveness',
      value: this.predator.aggression,
      defaultValue: 0.85,
      min: 0.1,
      max: 1.0,
      step: 0.05,
      unit: 'ratio',
      description: 'Hunting tenacity, strike frequency, and pursuit persistence against foraging ants.',
      scope: 'PREDATOR',
      classification: 'SAFE_LIVE',
      biologicalStatus: 'BIOLOGICAL_INSPIRATION (Carabid beetle predatory strike dynamics)',
    });

    this.register({
      key: 'predator.patrolSpeed',
      name: 'Predator Patrol Speed',
      value: this.predator.patrolSpeed,
      defaultValue: 2.5,
      min: 1.0,
      max: 6.0,
      step: 0.2,
      unit: 'u/s',
      description: 'Wandering and search movement velocity across terrain.',
      scope: 'PREDATOR',
      classification: 'SAFE_LIVE',
      biologicalStatus: 'ENGINEERING_DECISION',
    });

    this.register({
      key: 'predator.chaseSpeed',
      name: 'Predator Chase Speed',
      value: this.predator.chaseSpeed,
      defaultValue: 4.8,
      min: 2.0,
      max: 8.0,
      step: 0.2,
      unit: 'u/s',
      description: 'Maximum sprint velocity when lunging toward or stalking an identified ant.',
      scope: 'PREDATOR',
      classification: 'SAFE_LIVE',
      biologicalStatus: 'ENGINEERING_DECISION',
    });

    this.register({
      key: 'predator.detectionRadius',
      name: 'Predator Detection Range',
      value: this.predator.detectionRadius,
      defaultValue: 13.0,
      min: 4.0,
      max: 25.0,
      step: 1.0,
      unit: 'units',
      description: 'Sensory range for detecting vibrational and visual movement of ants.',
      scope: 'PREDATOR',
      classification: 'SAFE_LIVE',
      biologicalStatus: 'BIOLOGICAL_INSPIRATION',
    });

    // Pheromone parameters
    this.register({
      key: 'pheromones.foodTrailDecay',
      name: 'Food Trail Evaporation Rate',
      value: this.pheromones.foodTrailDecay,
      defaultValue: 0.018,
      min: 0.002,
      max: 0.10,
      step: 0.002,
      unit: '/s',
      description: 'Half-life evaporation rate of hydrocarbon food recruitment trails.',
      scope: 'PHEROMONE',
      classification: 'SAFE_LIVE',
      biologicalStatus: 'BIOLOGICAL_FACT (Wilson 1962: volatile trail pheromone vapor dissipation)',
    });

    this.register({
      key: 'pheromones.diffusionRate',
      name: 'Pheromone Diffusion Rate',
      value: this.pheromones.diffusionRate,
      defaultValue: 0.08,
      min: 0.01,
      max: 0.35,
      step: 0.01,
      unit: 'D',
      description: 'Laplacian spatial diffusion coefficient spreading chemical concentration.',
      scope: 'PHEROMONE',
      classification: 'SAFE_LIVE',
      biologicalStatus: 'BIOLOGICAL_FACT (Fickian gas-phase diffusion)',
    });

    // Environment parameters
    this.register({
      key: 'environment.temperatureCelsius',
      name: 'Ambient Temperature',
      value: this.environment.temperatureCelsius,
      defaultValue: 24.0,
      min: 10.0,
      max: 42.0,
      step: 1.0,
      unit: '°C',
      description: 'Thermal climate influencing metabolic speed and brood development rates.',
      scope: 'ENVIRONMENT',
      classification: 'SAFE_LIVE',
      biologicalStatus: 'BIOLOGICAL_FACT (Arrhenius Q10 kinetic acceleration in ectotherms)',
    });
    // Food logistics parameters
    this.register({
      key: 'food.carryCapacity',
      name: 'Worker Carrying Capacity',
      value: this.food.carryCapacity,
      defaultValue: 3.0,
      min: 0.5,
      max: 10.0,
      step: 0.5,
      unit: 'units',
      description: 'Maximum nutrition payload a worker ant can transport in mandibles/crop.',
      scope: 'FOOD',
      classification: 'SAFE_LIVE',
      biologicalStatus: 'BIOLOGICAL_FACT (Crop capacity and mandibular load carrying in Formica)',
    });

    this.register({
      key: 'food.collectionRadius',
      name: 'Food Collection Radius',
      value: this.food.collectionRadius,
      defaultValue: 1.2,
      min: 0.5,
      max: 3.0,
      step: 0.1,
      unit: 'm',
      description: 'Physical proximity required to manipulate and harvest food fragments.',
      scope: 'FOOD',
      classification: 'SAFE_LIVE',
      biologicalStatus: 'COMPUTATIONAL_ABSTRACTION',
    });

    this.register({
      key: 'food.socialTransferMaxAmount',
      name: 'Trophallaxis Max Exchange',
      value: this.food.socialTransferMaxAmount,
      defaultValue: 1.5,
      min: 0.2,
      max: 3.0,
      step: 0.1,
      unit: 'units',
      description: 'Maximum nutritional transfer during mouth-to-mouth social exchange.',
      scope: 'FOOD',
      classification: 'SAFE_LIVE',
      biologicalStatus: 'BIOLOGICAL_INSPIRATION (Stomodeal trophallaxis in Camponotus / Formica)',
    });
  }

  private register(meta: ParameterMetadata): void {
    this.registry.set(meta.key, meta);
  }

  public get(key: string): ParameterMetadata | undefined {
    return this.registry.get(key);
  }

  public getAll(): ParameterMetadata[] {
    return Array.from(this.registry.values());
  }

  public getByScope(scope: ParameterScope): ParameterMetadata[] {
    return this.getAll().filter((p) => p.scope === scope);
  }

  /**
   * Execute validated command pipeline
   */
  public executeCommand(cmd: SimulationCommand, eventBus?: SimulationEventBus): { success: boolean; message: string } {
    if (cmd.type === 'SET_PARAMETER') {
      if (!cmd.key || cmd.value === undefined) {
        return { success: false, message: 'Invalid command: missing key or value' };
      }

      const meta = this.registry.get(cmd.key);
      if (!meta) {
        return { success: false, message: `Unknown parameter key: ${cmd.key}` };
      }

      // Range validation
      const clamped = Math.max(meta.min, Math.min(meta.max, cmd.value));
      meta.value = clamped;

      // Apply to authoritative config objects
      this.applyValue(cmd.key, clamped);

      // Emit event
      if (eventBus) {
        eventBus.emit({
          type: 'PARAMETER_CHANGED',
          timestamp: performance.now() / 1000,
          data: {
            parameter: cmd.key,
            newValue: clamped,
            scope: meta.scope,
            classification: meta.classification,
          },
        });
      }

      return { success: true, message: `Updated ${cmd.key} to ${clamped} ${meta.unit}` };
    }

    if (cmd.type === 'RESET_SCOPE' && cmd.scope) {
      for (const meta of this.getByScope(cmd.scope)) {
        meta.value = meta.defaultValue;
        this.applyValue(meta.key, meta.defaultValue);
      }
      return { success: true, message: `Reset all ${cmd.scope} parameters to baseline` };
    }

    if (cmd.type === 'RESET_ALL') {
      for (const meta of this.getAll()) {
        meta.value = meta.defaultValue;
        this.applyValue(meta.key, meta.defaultValue);
      }
      return { success: true, message: 'Reset all simulation parameters to baseline' };
    }

    return { success: false, message: 'Unrecognized command' };
  }

  private applyValue(key: string, val: number): void {
    const parts = key.split('.');
    if (parts.length !== 2) return;
    const [section, prop] = parts;

    if (section === 'ant' && prop in this.ant) {
      (this.ant as Record<string, number>)[prop] = val;
    } else if (section === 'predator' && prop in this.predator) {
      (this.predator as Record<string, number>)[prop] = val;
    } else if (section === 'pheromones' && prop in this.pheromones) {
      (this.pheromones as Record<string, number>)[prop] = val;
    } else if (section === 'environment' && prop in this.environment) {
      (this.environment as Record<string, number>)[prop] = val;
    } else if (section === 'colony' && prop in this.colony) {
      (this.colony as Record<string, number>)[prop] = val;
    } else if (section === 'food' && prop in this.food) {
      (this.food as Record<string, any>)[prop] = val;
    }
  }
}
