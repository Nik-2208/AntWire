/**
 * ANT BRAIN — Motivational Drives Subsystem
 * Mathematical representation of Lorenz-Tinbergen ethological drive potentials.
 *
 * FIX: Homing drive now activates at energy < 0.35 (was 0.15 — too late, ants were dying before returning).
 * FIX: Food-seeking drive now also uses starvation level flags to produce appropriate urgency.
 * FIX: Rest-recovery drive threshold is now 0.35 (was 0.5 — was too late).
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
      foodSeeking = (state.hunger * 0.65 + state.starvationStress * 0.35 + sensors.foodOdorConcentration * 0.3) * (traits.energyEfficiency);
      // Boost if pheromone food trail is detected
      const maxFoodPheromone = Math.max(sensors.foodLeft, sensors.foodCenter, sensors.foodRight);
      foodSeeking += maxFoodPheromone * 0.35;
      // Critical hunger: spike food-seeking drive
      if (state.hunger > 0.7) {
        foodSeeking = Math.max(foodSeeking, 0.8);
      }
    } else {
      foodSeeking = 0.0; // Already carrying food — homing takes over
    }

    // 2. Homing Drive: Return home when:
    //   - Carrying food cargo (always)
    //   - Energy is getting low (< 0.35 now — much earlier than before)
    //   - Starvation stress is accumulating
    let homing = 0.0;
    if (state.carryingFoodAmount > 0) {
      homing = 0.95; // primary goal is returning cargo to colony
    } else if (state.energy < 0.35 || state.starvationStress > 0.2) {
      // Return home EARLY — before reaching critical starvation
      // Smooth ramp from 0.35 down to 0 energy
      const energyUrgency = Math.min(1.0, (0.35 - Math.min(state.energy, 0.35)) / 0.35);
      const stressUrgency = Math.min(1.0, state.starvationStress * 2.0);
      homing = Math.min(1.0, Math.max(energyUrgency, stressUrgency) * 0.9);
    } else {
      // Small background homing bias if far from nest (path integration)
      homing = (1.0 - sensors.nestProximity) * 0.06;
    }

    // 3. Threat Avoidance: Driven by predator proximity or alarm pheromones
    const alarmMax = Math.max(sensors.alarmLeft, sensors.alarmCenter, sensors.alarmRight);
    let threatAvoidance = (sensors.predatorProximity * 0.85 + alarmMax * 0.4 + state.threatLevel * 0.3) * traits.fearThreshold;
    threatAvoidance = Math.min(1.0, threatAvoidance);

    // 4. Rest / Recovery Drive: Elevated when exhausted or injured
    // FIX: Threshold lowered from 0.5 to 0.35 so ants rest before severe exhaustion
    let restRecovery = 0.0;
    if (state.starvationStress > 0.35 || state.injurySeverity > 0.25) {
      restRecovery = Math.min(1.0, state.starvationStress * 0.6 + state.injurySeverity * 0.4);
    }

    // 5. Exploration Drive: Wandering when not hungry and not threatened
    let exploration = 0.0;
    if (state.carryingFoodAmount <= 0) {
      const inhibition = foodSeeking * 0.5 + threatAvoidance * 0.8 + homing * 0.9 + restRecovery * 0.5;
      exploration = Math.max(0.1, (1.0 - inhibition) * traits.explorationTendency);
      // Suppress exploration if starving — prioritize food seeking
      if (state.hunger > 0.6) {
        exploration = Math.min(exploration, 0.15);
      }
    } else {
      exploration = 0.04; // minimal wandering while homing with food
    }

    // 6. Social Interaction: Grooming/trophallaxis contact when near other ants
    let social = 0.0;
    if (sensors.nearbyAntsCount > 0 && threatAvoidance < 0.3) {
      social = Math.min(1.0, sensors.nearbyAntsCount * 0.2);
      // Boost social drive when hungry — seek trophallaxis from nestmates
      if (state.hunger > 0.4 && state.carryingFoodAmount <= 0) {
        social = Math.max(social, state.hunger * 0.6);
      }
    }

    // 7. Brood Care: Elevated near nest when food available
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
