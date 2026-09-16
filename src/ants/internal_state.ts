/**
 * ANT BRAIN — Internal Body & Physiological State
 * Biology-First Mesoscale Abstraction:
 * - Separates immediate metabolic energy reserve from chronic starvation stress
 * - Multi-stage explicit lifecycle: ACTIVE -> INJURED -> EXHAUSTED -> DYING -> DEAD -> REMOVED
 * - Continuous, probabilistic, condition-dependent mortality rather than instantaneous cliff death.
 */

import { AntInternalState, CauseOfDeath, EntityLifeState } from '../simulation/types';
import { SimulationConfig } from '../simulation/config';

export class AntBodyState {
  public state: AntInternalState;

  constructor(lifespan = 720.0) {
    this.state = {
      energyReserve: 1.0,
      energy: 1.0, // Backwards-compatible alias
      hunger: 0.05,
      starvationStress: 0.0,
      health: 1.0,
      lifeState: 'ACTIVE',
      injurySeverity: 0.0,
      mobilityPenalty: 0.0,
      threatLevel: 0.0,
      carryingFoodAmount: 0,
      carryingFoodId: null,
      carryingCorpseId: null,
      age: 0,
      lifespan: lifespan,
      isAlive: true,
      socialAffinity: 0.5,
    };
  }

  public get isCarryingFood(): boolean {
    return this.state.carryingFoodAmount > 0;
  }

  public get isCarryingCorpse(): boolean {
    return this.state.carryingCorpseId !== null;
  }

  public get energy(): number {
    return this.state.energyReserve;
  }

  public get hunger(): number {
    return this.state.hunger;
  }

  public get starvationStress(): number {
    return this.state.starvationStress;
  }

  public get health(): number {
    return this.state.health;
  }

  public get lifeState(): EntityLifeState {
    return this.state.lifeState;
  }

  public get causeOfDeath(): CauseOfDeath | undefined {
    return this.state.causeOfDeath;
  }

  /**
   * Main physiological update step
   */
  public update(
    dt: number,
    speed: number,
    energyEfficiency: number,
    sensoryThreat: number,
    config?: SimulationConfig
  ): void {
    if (this.state.lifeState === 'DEAD' || this.state.lifeState === 'REMOVED') {
      return;
    }

    const cfg = config || SimulationConfig.instance || new SimulationConfig();
    const antCfg = cfg.ant;

    this.state.age += dt;

    // 1. Metabolic Consumption (Basal rate + Kinetic cost of locomotion)
    const burn = (antCfg.metabolicBaseRate + antCfg.kineticCostRate * speed) * (1.0 / Math.max(0.2, energyEfficiency)) * dt;
    this.state.energyReserve = Math.max(0, this.state.energyReserve - burn);
    this.state.energy = this.state.energyReserve;

    // 2. Hunger Dynamics (Rises progressively as energy reserve drops)
    this.state.hunger = Math.min(1.0, Math.max(0, 1.0 - this.state.energyReserve));

    // 3. Starvation Stress Accumulation & Recovery
    // Chronic physiological stress ONLY accumulates when energy is depleted below threshold
    if (this.state.energyReserve <= antCfg.starvationOnsetThreshold) {
      // Depleted: stress accumulates continuously over time
      const stressIncrease = antCfg.starvationStressRate * dt;
      this.state.starvationStress = Math.min(1.0, this.state.starvationStress + stressIncrease);
    } else {
      // Fed: stress gradually recovers as tissues regenerate
      const stressDecrease = antCfg.starvationRecoveryRate * dt;
      this.state.starvationStress = Math.max(0, this.state.starvationStress - stressDecrease);
    }

    // 4. Somatic Health Deterioration from Starvation & Senescence
    if (this.state.starvationStress > 0.5) {
      // Progressive tissue damage proportional to starvation stress
      const damageRate = (this.state.starvationStress - 0.5) * 0.08 * dt;
      this.state.health = Math.max(0, this.state.health - damageRate);
    }

    // Senescence (Old Age)
    if (this.state.age >= this.state.lifespan) {
      const senescenceRate = ((this.state.age - this.state.lifespan) / 60.0 + 0.05) * 0.04 * dt;
      this.state.health = Math.max(0, this.state.health - senescenceRate);
      if (this.state.health <= 0 && !this.state.causeOfDeath) {
        this.transitionToDead('AGE');
        return;
      }
    }

    // 5. Threat Arousal Dynamics
    if (sensoryThreat > 0) {
      this.state.threatLevel = Math.min(1.0, this.state.threatLevel + sensoryThreat * dt * 4.0);
    } else {
      this.state.threatLevel = Math.max(0, this.state.threatLevel - dt * 0.35);
    }

    // 6. Natural Tissue Healing if Well-Nourished
    if (this.state.energyReserve > 0.4 && this.state.starvationStress < 0.1 && this.state.injurySeverity > 0) {
      this.state.injurySeverity = Math.max(0, this.state.injurySeverity - dt * 0.03);
      this.state.health = Math.min(1.0, this.state.health + dt * 0.02);
    }

    // 7. Compute Mobility Penalty (Slowdown from exhaustion and injury)
    const exhaustionPenalty = Math.max(0, (this.state.starvationStress - 0.3) * 0.6);
    const injuryPenalty = this.state.injurySeverity * 0.5;
    this.state.mobilityPenalty = Math.min(0.75, Math.max(0, exhaustionPenalty + injuryPenalty));

    // 8. Explicit Lifecycle & Starvation State Machine
    if (this.state.energyReserve > 0.7) {
      this.state.starvationLevel = 'FED';
      this.state.helpRequested = false;
    } else if (this.state.energyReserve > 0.4) {
      this.state.starvationLevel = 'HUNGRY';
      this.state.helpRequested = false;
    } else if (this.state.energyReserve > 0.2) {
      this.state.starvationLevel = 'VERY_HUNGRY';
      this.state.helpRequested = true;
    } else if (this.state.energyReserve > 0.05) {
      this.state.starvationLevel = 'STARVING';
      this.state.helpRequested = true;
    } else {
      this.state.starvationLevel = 'CRITICAL';
      this.state.helpRequested = true;
    }

    if (this.state.health <= 0.01) {
      // Critical somatic collapse -> Probabilistic mortality
      this.state.lifeState = 'DYING';
      // Hazard rate death check
      const hazardProbability = antCfg.starvationMortalityLambda * dt;
      if (Math.random() < hazardProbability || this.state.health <= 0) {
        const cause = this.state.injurySeverity > 0.6 ? 'INJURY' : 'STARVATION';
        this.transitionToDead(cause);
        return;
      }
    } else if (this.state.injurySeverity > 0.4) {
      this.state.lifeState = 'INJURED';
    } else if (this.state.starvationStress > 0.4) {
      this.state.lifeState = 'EXHAUSTED';
    } else {
      this.state.lifeState = 'ACTIVE';
    }
  }

  /**
   * Feeding restores immediate metabolic reserve and accelerates stress recovery
   */
  public feed(amount: number, efficiency = 0.5): void {
    const intake = amount * efficiency;
    this.state.energyReserve = Math.min(1.0, this.state.energyReserve + intake);
    this.state.energy = this.state.energyReserve;
    this.state.hunger = Math.max(0, this.state.hunger - intake * 1.2);
    // Accelerated healing upon ingestion of carbohydrates/proteins
    this.state.health = Math.min(1.0, this.state.health + intake * 0.2);
  }

  public pickupFood(foodId: string, amount: number = 1.0, capacity: number = 3.0): number {
    const space = Math.max(0, capacity - this.state.carryingFoodAmount);
    const actualTaken = Math.min(space, amount);
    this.state.carryingFoodAmount += actualTaken;
    this.state.carryingFoodId = foodId;
    return actualTaken;
  }

  public dropFood(): number {
    const amt = this.state.carryingFoodAmount;
    this.state.carryingFoodAmount = 0;
    this.state.carryingFoodId = null;
    return amt;
  }

  /**
   * Stomodeal trophallactic social food exchange between two compatible nestmates.
   * Conserves exact total resource quantity between donor and receiver.
   */
  public transferFoodTo(recipient: AntBodyState, maxTransfer: number = 1.5): number {
    if (this.state.carryingFoodAmount <= 0) return 0;
    const recipientNeed = Math.max(0.2, recipient.state.hunger * 1.5);
    const transferable = Math.min(this.state.carryingFoodAmount, maxTransfer, recipientNeed);
    if (transferable < 0.05) return 0;

    this.state.carryingFoodAmount -= transferable;
    recipient.state.carryingFoodAmount += transferable;
    return transferable;
  }

  public pickupCorpse(corpseId: string): void {
    this.state.carryingCorpseId = corpseId;
  }

  public dropCorpse(): string | null {
    const id = this.state.carryingCorpseId;
    this.state.carryingCorpseId = null;
    return id;
  }

  /**
   * Somatic injury from predator bites or fighting
   */
  public takeDamage(damage: number, cause: CauseOfDeath = 'PREDATOR'): void {
    this.state.health = Math.max(0, this.state.health - damage);
    this.state.injurySeverity = Math.min(1.0, this.state.injurySeverity + damage * 0.8);
    this.state.threatLevel = 1.0;

    if (this.state.health <= 0.05) {
      this.state.lifeState = 'DYING';
      if (this.state.health <= 0) {
        this.transitionToDead(cause);
      }
    } else {
      this.state.lifeState = 'INJURED';
    }
  }

  /**
   * Clean transition to DEAD state with cause recording
   */
  public transitionToDead(cause: CauseOfDeath): void {
    this.state.isAlive = false;
    this.state.health = 0;
    this.state.lifeState = 'DEAD';
    this.state.causeOfDeath = cause;
  }
}
