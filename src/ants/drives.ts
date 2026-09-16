/**
 * ANT BRAIN — Motivational Drives Subsystem
 * Mathematical representation of Lorenz-Tinbergen ethological drive potentials.
 */

import { AntDrives, AntInternalState, AntSensorySnapshot } from '../simulation/types';
import { IndividualTraits } from './body';

export class AntMotivationalDrives {
  public currentDrives: AntDrives;

  constructor() {
    this.currentDrives = {
      foodSeeking: 0.5,
      exploration: 0.5,
      homing: 0.0,
      threatAvoidance: 0.0,
      socialInteraction: 0.1,
      broodCare: 0.0,
      restRecovery: 0.0,
    };
  }

  public computeDrives(
    state: AntInternalState,
    sensors: AntSensorySnapshot,
    traits: IndividualTraits
  ): AntDrives {
    // 1. Food Seeking Drive: Higher when hungry or experiencing starvation stress
    let foodSeeking = 0.0;
    if (state.carryingFoodAmount <= 0) {
      foodSeeking = (state.hunger * 0.7 + state.starvationStress * 0.3 + sensors.foodOdorConcentration * 0.3) * (traits.energyEfficiency);
      // Boost if pheromone food trail is detected
      const maxFoodPheromone = Math.max(sensors.foodLeft, sensors.foodCenter, sensors.foodRight);
      foodSeeking += maxFoodPheromone * 0.35;
    } else {
      foodSeeking = 0.0; // Already carrying food!
    }

    // 2. Homing Drive: Dominant when carrying food or when critically low on energy
    let homing = 0.0;
    if (state.carryingFoodAmount > 0) {
      homing = 0.95; // primary goal is to return cargo to colony
    } else if (state.energy < 0.15 || state.starvationStress > 0.4) {
      homing = Math.min(1.0, (1.0 - state.energy) * 0.85 + state.starvationStress * 0.5); // return home to feed before starving
    } else {
      // Small background homing bias if far from nest
      homing = (1.0 - sensors.nestProximity) * 0.08;
    }

    // 3. Threat Avoidance: Driven by predator proximity or alarm pheromones
    const alarmMax = Math.max(sensors.alarmLeft, sensors.alarmCenter, sensors.alarmRight);
    let threatAvoidance = (sensors.predatorProximity * 0.85 + alarmMax * 0.4 + state.threatLevel * 0.3) * traits.fearThreshold;
    threatAvoidance = Math.min(1.0, threatAvoidance);

    // 4. Rest / Recovery Drive: Elevated when exhausted or injured
    let restRecovery = 0.0;
    if (state.starvationStress > 0.5 || state.injurySeverity > 0.3) {
      restRecovery = Math.min(1.0, state.starvationStress * 0.6 + state.injurySeverity * 0.4);
    }

    // 5. Exploration Drive: Wandering when not hungry and not threatened
    let exploration = 0.0;
    if (state.carryingFoodAmount <= 0) {
      const inhibition = foodSeeking * 0.6 + threatAvoidance * 0.8 + homing * 0.7 + restRecovery * 0.5;
      exploration = Math.max(0.1, (1.0 - inhibition) * traits.explorationTendency);
    } else {
      exploration = 0.05; // minimal wandering while homing
    }

    // 6. Social Interaction: Grooming/contact when near other ants and not in panic
    let social = 0.0;
    if (sensors.nearbyAntsCount > 0 && threatAvoidance < 0.3) {
      social = Math.min(1.0, sensors.nearbyAntsCount * 0.2);
    }

    // 7. Brood Care (for nurse/colony roles, elevated near nest)
    const brood = sensors.isAtNestEntrance && state.carryingFoodAmount > 0 ? 0.9 : 0.1;

    this.currentDrives = {
      foodSeeking: Math.min(1.0, Math.max(0, foodSeeking)),
      exploration: Math.min(1.0, Math.max(0, exploration)),
      homing: Math.min(1.0, Math.max(0, homing)),
      threatAvoidance: Math.min(1.0, Math.max(0, threatAvoidance)),
      socialInteraction: Math.min(1.0, Math.max(0, social)),
      broodCare: Math.min(1.0, Math.max(0, brood)),
      restRecovery: Math.min(1.0, Math.max(0, restRecovery)),
    };

    return this.currentDrives;
  }
}
