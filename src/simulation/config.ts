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
  // FIX: Reduced metabolic burn dramatically so ants survive normal exploration.
  // At speed=4.2 with baseRate=0.00035 + kinetic=0.00055*4.2 ≈ 0.00266/s
  // From full energy (1.0) to starvation onset (0.15) = ~316 simulated seconds (over 5 min)
  // Giving ants time to find food, return, and be fed before critical starvation.
  public ant = {
    metabolicBaseRate: 0.00035,       // baseline energy loss per second (was 0.0012 – 3.4× too high)
    kineticCostRate: 0.00055,         // movement cost per speed unit (was 0.0030 – 5.5× too high)
    starvationOnsetThreshold: 0.15,   // energy level below which starvation stress begins (was 0.08 – allowed too late)
    starvationStressRate: 0.008,      // rate of starvation stress accumulation per second (was 0.025 – too rapid)
    starvationRecoveryRate: 0.060,    // rate of starvation stress recovery when fed (was 0.040 – too slow)
    starvationMortalityLambda: 0.08,  // hazard rate of death when health <= 0.01 (was 0.12 – slightly lower)
    normalMovementSpeed: 4.2,         // units per second
    exhaustedSpeedMultiplier: 0.55,   // locomotor slowdown under severe stress
    feedingEfficiency: 0.65,          // proportion of food converted to energy reserve (was 0.5)
    lifespanSeconds: 720.0,           // worker lifespan before senescence
    fearThreshold: 1.0,               // sensitivity to predator cues
  };

  // 2. Predator Ecological Configuration
  public predator = {
    aggression: 0.85,
    patrolSpeed: 2.5,
    chaseSpeed: 4.8,
    detectionRadius: 13.0,
    attackRadius: 1.4,
    attackDamage: 0.45,
    spawnRateSeconds: 45.0,
    maxPredators: 6,
  };

  // 3. Pheromone Dynamics Configuration
  public pheromones = {
    foodTrailDecay: 0.014,            // slightly slower food trail decay so trails persist longer
    homeTrailDecay: 0.010,            // slower home trail – more reliable navigation
    alarmTrailDecay: 0.065,
    diffusionRate: 0.08,
    depositionAmount: 1.0,
  };

  // 4. Environment Configuration
  public environment = {
    temperatureCelsius: 24.0,
    dayLengthSeconds: 120.0,
    foodSpawnInterval: 30.0,
    foodClusterAmount: 80.0,
  };

  // 5. Colony Configuration
  public colony = {
    queenEggCooldown: 12.0,
    queenFoodPerEgg: 2.0,
    eggIncubationTime: 18.0,
    larvalDevelopmentTime: 24.0,
    pupalDevelopmentTime: 18.0,
    larvaFoodDemand: 1.5,
    crisisThresholdFood: 10.0,
    starvationThresholdFood: 2.0,
  };

  // 6. Food Logistics & Resource Dynamics Configuration
  // FIX: Larger collection radius (was 1.2, sensors see up to 2.2 units)
  // FIX: Higher carry capacity so fewer trips needed
  public food = {
    carryCapacity: 4.0,               // max units a single worker can transport (was 3.0)
    collectionRadius: 2.0,            // physical contact distance to pick up (was 1.2 – too small vs food radius 2.2)
    collectionRate: 1.0,              // units picked up per harvest action
    deathResourceOutcome: 'FOOD_DROPS' as 'FOOD_DROPS' | 'FOOD_LOST',
    socialTransferRadius: 1.5,        // proximity for trophallaxis (was 1.0)
    socialTransferMaxAmount: 2.0,     // max nutrition per trophallactic contact (was 1.5)
    socialTransferHungerThreshold: 0.3, // lower threshold so ants share food sooner (was 0.4)
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
      defaultValue: 0.00035,
      min: 0.00005,
      max: 0.005,
      step: 0.00005,
      unit: 'energy/s',
      description: 'Baseline metabolic energy cost per second at rest.',
      scope: 'ANT',
      classification: 'SAFE_LIVE',
      biologicalStatus: 'Calibrated: worker ant basal metabolic equivalent.',
    });
    this.register({
      key: 'ant.kineticCostRate',
      name: 'Kinetic Cost Rate',
      value: this.ant.kineticCostRate,
      defaultValue: 0.00055,
      min: 0.0001,
      max: 0.005,
      step: 0.00005,
      unit: 'energy/(speed·s)',
      description: 'Energy cost of locomotion per unit speed per second.',
      scope: 'ANT',
      classification: 'SAFE_LIVE',
      biologicalStatus: 'Calibrated: locomotion metabolic scaling.',
    });
    this.register({
      key: 'ant.starvationOnsetThreshold',
      name: 'Starvation Onset Threshold',
      value: this.ant.starvationOnsetThreshold,
      defaultValue: 0.15,
      min: 0.05,
      max: 0.5,
      step: 0.01,
      unit: 'energy fraction',
      description: 'Energy level below which starvation stress begins accumulating.',
      scope: 'ANT',
      classification: 'SAFE_LIVE',
      biologicalStatus: 'Threshold for onset of physiological starvation response.',
    });
    this.register({
      key: 'ant.starvationStressRate',
      name: 'Starvation Stress Rate',
      value: this.ant.starvationStressRate,
      defaultValue: 0.008,
      min: 0.001,
      max: 0.05,
      step: 0.001,
      unit: 'stress/s',
      description: 'Rate of physiological stress accumulation during starvation.',
      scope: 'ANT',
      classification: 'SAFE_LIVE',
      biologicalStatus: 'Chronic starvation stress accumulation rate.',
    });
    this.register({
      key: 'ant.starvationRecoveryRate',
      name: 'Starvation Recovery Rate',
      value: this.ant.starvationRecoveryRate,
      defaultValue: 0.060,
      min: 0.01,
      max: 0.2,
      step: 0.005,
      unit: 'stress/s',
      description: 'Rate of starvation stress recovery when adequately fed.',
      scope: 'ANT',
      classification: 'SAFE_LIVE',
      biologicalStatus: 'Post-feeding tissue restoration rate.',
    });
    this.register({
      key: 'ant.starvationMortalityLambda',
      name: 'Starvation Mortality Hazard Rate',
      value: this.ant.starvationMortalityLambda,
      defaultValue: 0.08,
      min: 0.01,
      max: 0.5,
      step: 0.01,
      unit: 'probability/s',
      description: 'Hazard rate of death when health is critically low.',
      scope: 'ANT',
      classification: 'SAFE_LIVE',
      biologicalStatus: 'Death probability per second at critical health.',
    });
    this.register({
      key: 'ant.feedingEfficiency',
      name: 'Feeding Efficiency',
      value: this.ant.feedingEfficiency,
      defaultValue: 0.65,
      min: 0.1,
      max: 1.0,
      step: 0.05,
      unit: 'fraction',
      description: 'Fraction of ingested food converted to usable energy reserve.',
      scope: 'ANT',
      classification: 'SAFE_LIVE',
      biologicalStatus: 'Metabolic energy conversion ratio.',
    });

    // Predator parameters
    this.register({
      key: 'predator.aggression',
      name: 'Predator Aggression',
      value: this.predator.aggression,
      defaultValue: 0.85,
      min: 0.0,
      max: 1.0,
      step: 0.05,
      unit: 'intensity',
      description: 'Hostility and pursuit aggression of territory predators.',
      scope: 'PREDATOR',
      classification: 'SAFE_LIVE',
      biologicalStatus: 'Predator hunting initiative.',
    });
    this.register({
      key: 'predator.patrolSpeed',
      name: 'Predator Patrol Speed',
      value: this.predator.patrolSpeed,
      defaultValue: 2.5,
      min: 0.5,
      max: 8.0,
      step: 0.1,
      unit: 'units/s',
      description: 'Default cruising speed of predators while patrolling.',
      scope: 'PREDATOR',
      classification: 'SAFE_LIVE',
      biologicalStatus: 'Predator locomotor pace.',
    });
    this.register({
      key: 'predator.chaseSpeed',
      name: 'Predator Chase Speed',
      value: this.predator.chaseSpeed,
      defaultValue: 4.8,
      min: 1.0,
      max: 12.0,
      step: 0.2,
      unit: 'units/s',
      description: 'Sprint pursuit speed when targeting an ant.',
      scope: 'PREDATOR',
      classification: 'SAFE_LIVE',
      biologicalStatus: 'Predator attack sprint speed.',
    });
    this.register({
      key: 'predator.attackDamage',
      name: 'Predator Attack Damage',
      value: this.predator.attackDamage,
      defaultValue: 0.45,
      min: 0.05,
      max: 1.0,
      step: 0.05,
      unit: 'damage/strike',
      description: 'Somatic damage inflicted per predatory strike.',
      scope: 'PREDATOR',
      classification: 'SAFE_LIVE',
      biologicalStatus: 'Mandibular crushing force and lethal venom.',
    });

    // Food parameters
    this.register({
      key: 'food.collectionRadius',
      name: 'Food Collection Radius',
      value: this.food.collectionRadius,
      defaultValue: 2.0,
      min: 0.5,
      max: 4.0,
      step: 0.1,
      unit: 'world units',
      description: 'Distance within which an ant can pick up food.',
      scope: 'FOOD',
      classification: 'SAFE_LIVE',
      biologicalStatus: 'Physical contact threshold for mandibular food grasping.',
    });
    this.register({
      key: 'food.carryCapacity',
      name: 'Carry Capacity',
      value: this.food.carryCapacity,
      defaultValue: 4.0,
      min: 1.0,
      max: 10.0,
      step: 0.5,
      unit: 'food units',
      description: 'Maximum food units a worker can transport in its crop.',
      scope: 'FOOD',
      classification: 'SAFE_LIVE',
      biologicalStatus: 'Worker crop volume capacity.',
    });
    this.register({
      key: 'food.collectionRate',
      name: 'Collection Rate',
      value: this.food.collectionRate,
      defaultValue: 1.0,
      min: 0.1,
      max: 5.0,
      step: 0.1,
      unit: 'food units/action',
      description: 'Food units harvested per collection action.',
      scope: 'FOOD',
      classification: 'SAFE_LIVE',
      biologicalStatus: 'Mandibular harvesting rate.',
    });

    // Pheromone parameters
    this.register({
      key: 'pheromones.foodTrailDecay',
      name: 'Food Trail Decay Rate',
      value: this.pheromones.foodTrailDecay,
      defaultValue: 0.014,
      min: 0.001,
      max: 0.1,
      step: 0.001,
      unit: '/s',
      description: 'Evaporation rate of food trail pheromone per second.',
      scope: 'PHEROMONE',
      classification: 'SAFE_LIVE',
      biologicalStatus: 'Chemical stability of recruitment trail compounds.',
    });
    this.register({
      key: 'pheromones.homeTrailDecay',
      name: 'Home Trail Decay Rate',
      value: this.pheromones.homeTrailDecay,
      defaultValue: 0.010,
      min: 0.001,
      max: 0.1,
      step: 0.001,
      unit: '/s',
      description: 'Evaporation rate of home-orientation pheromone.',
      scope: 'PHEROMONE',
      classification: 'SAFE_LIVE',
      biologicalStatus: 'Directional orientation chemical persistence.',
    });
    this.register({
      key: 'pheromones.alarmTrailDecay',
      name: 'Alarm Pheromone Decay Rate',
      value: this.pheromones.alarmTrailDecay,
      defaultValue: 0.065,
      min: 0.01,
      max: 0.2,
      step: 0.005,
      unit: '/s',
      description: 'Evaporation rate of alarm pheromone.',
      scope: 'PHEROMONE',
      classification: 'SAFE_LIVE',
      biologicalStatus: 'Alarm signal volatility and rapid dissipation rate.',
    });

    // Colony parameters
    this.register({
      key: 'colony.crisisThresholdFood',
      name: 'Colony Crisis Food Threshold',
      value: this.colony.crisisThresholdFood,
      defaultValue: 10.0,
      min: 0,
      max: 50.0,
      step: 1.0,
      unit: 'food units',
      description: 'Colony food store below which STRESSED status triggers.',
      scope: 'COLONY',
      classification: 'SAFE_LIVE',
      biologicalStatus: 'Colony-level starvation response threshold.',
    });
    this.register({
      key: 'colony.starvationThresholdFood',
      name: 'Colony Starvation Threshold',
      value: this.colony.starvationThresholdFood,
      defaultValue: 2.0,
      min: 0,
      max: 20.0,
      step: 0.5,
      unit: 'food units',
      description: 'Colony food store below which CRITICAL status triggers.',
      scope: 'COLONY',
      classification: 'SAFE_LIVE',
      biologicalStatus: 'Colony-level critical resource depletion threshold.',
    });

    // Environment parameters
    this.register({
      key: 'environment.foodSpawnInterval',
      name: 'Food Spawn Interval',
      value: this.environment.foodSpawnInterval,
      defaultValue: 30.0,
      min: 5.0,
      max: 300.0,
      step: 5.0,
      unit: 'seconds',
      description: 'Seconds between natural food cluster spawns.',
      scope: 'ENVIRONMENT',
      classification: 'SAFE_LIVE',
      biologicalStatus: 'Ecological resource renewal rate.',
    });
    this.register({
      key: 'environment.foodClusterAmount',
      name: 'Food Cluster Amount',
      value: this.environment.foodClusterAmount,
      defaultValue: 80.0,
      min: 10.0,
      max: 300.0,
      step: 5.0,
      unit: 'food units',
      description: 'Nutrition units per natural food cluster spawn.',
      scope: 'ENVIRONMENT',
      classification: 'SAFE_LIVE',
      biologicalStatus: 'Resource patch density calibration.',
    });
  }

  private register(meta: ParameterMetadata): void {
    this.registry.set(meta.key, meta);
  }

  public getRegistry(): ParameterMetadata[] {
    return Array.from(this.registry.values());
  }

  public getParameter(key: string): ParameterMetadata | undefined {
    return this.registry.get(key);
  }

  public setParameter(key: string, value: number, eventBus?: SimulationEventBus): boolean {
    const meta = this.registry.get(key);
    if (!meta) return false;

    const clamped = Math.max(meta.min, Math.min(meta.max, value));
    meta.value = clamped;

    const parts = key.split('.');
    if (parts.length === 2) {
      const [scope, param] = parts;
      const target = (this as any)[scope];
      if (target && param in target) {
        target[param] = clamped;
        if (eventBus) {
          eventBus.emit({
            type: 'PARAMETER_CHANGED',
            timestamp: performance.now() / 1000,
            data: { parameter: key, newValue: clamped, previousValue: meta.value },
          });
        }
        return true;
      }
    }
    return false;
  }

  /** Alias for getParameter() for backward-compat with UI code */
  public get(key: string): ParameterMetadata | undefined {
    return this.getParameter(key);
  }

  public executeCommand(cmd: SimulationCommand, eventBus?: SimulationEventBus): { success: boolean; message: string } {
    if (cmd.type === 'SET_PARAMETER' && cmd.key !== undefined && cmd.value !== undefined) {
      const ok = this.setParameter(cmd.key, cmd.value, eventBus);
      const meta = this.registry.get(cmd.key);
      return {
        success: ok,
        message: ok
          ? `${meta?.name ?? cmd.key} set to ${cmd.value.toFixed(4)} ${meta?.unit ?? ''}`
          : `Unknown parameter: ${cmd.key}`,
      };
    } else if (cmd.type === 'RESET_SCOPE' && cmd.scope) {
      const prefix = cmd.scope.toLowerCase();
      let count = 0;
      for (const [key, meta] of this.registry.entries()) {
        if (key.startsWith(prefix)) {
          this.setParameter(key, meta.defaultValue, eventBus);
          count++;
        }
      }
      return { success: true, message: `Reset ${count} parameters in scope ${cmd.scope}` };
    } else if (cmd.type === 'RESET_ALL') {
      let count = 0;
      for (const [key, meta] of this.registry.entries()) {
        this.setParameter(key, meta.defaultValue, eventBus);
        count++;
      }
      return { success: true, message: `Reset all ${count} parameters to defaults` };
    }
    return { success: false, message: 'Unknown command type' };
  }
}

