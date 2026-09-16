/**
 * ANT BRAIN — Antennal Lobe (AL) Glomerular Odor Processing
 * Models Olfactory Receptor Neurons (ORNs), Glomeruli with lateral inhibition (LNs),
 * and Projection Neurons (PNs) with Weber-Fechner logarithmic chemosensation.
 */

import { GlomerulusState } from './types';
import { AntSensorySnapshot } from '../../simulation/types';

export class AntennalLobeCircuit {
  public glomeruli: GlomerulusState[];

  constructor() {
    this.glomeruli = [
      { id: 'GL-FOOD-VOLATILE', name: 'Food Volatiles (Sugar/Protein)', leftActivation: 0, rightActivation: 0, adaptation: 0 },
      { id: 'GL-TRAIL-PHERO', name: 'Recruitment Trail (Hydrocarbons)', leftActivation: 0, rightActivation: 0, adaptation: 0 },
      { id: 'GL-HOME-PHERO', name: 'Home Orientation Marker', leftActivation: 0, rightActivation: 0, adaptation: 0 },
      { id: 'GL-ALARM-TERPENE', name: 'Alarm Terpenes (Formic Acid/Dundee)', leftActivation: 0, rightActivation: 0, adaptation: 0 },
      { id: 'GL-NESTMATE-CHC', name: 'Nestmate Cuticular Hydrocarbons', leftActivation: 0, rightActivation: 0, adaptation: 0 },
    ];
  }

  /**
   * Logarithmic Weber-Fechner transducer with saturation
   */
  private weberFechner(conc: number, k = 4.0): number {
    if (conc <= 0) return 0;
    return Math.min(1.0, Math.log(1 + k * conc) / Math.log(1 + k));
  }

  public processSensoryInput(sensors: AntSensorySnapshot, dt: number): {
    foodPN_L: number;
    foodPN_R: number;
    trailPN_L: number;
    trailPN_R: number;
    alarmPN_L: number;
    alarmPN_R: number;
    homePN_L: number;
    homePN_R: number;
    tropotaxisDifferential: number;
  } {
    // 1. Food volatile activation (direct food scent + antennae food channel)
    const foodL_raw = sensors.foodLeft + Math.max(0, sensors.foodOdorConcentration * (1 - Math.max(0, sensors.foodOdorDirection)));
    const foodR_raw = sensors.foodRight + Math.max(0, sensors.foodOdorConcentration * (1 + Math.min(0, sensors.foodOdorDirection)));

    const gFood = this.glomeruli[0];
    gFood.leftActivation = this.weberFechner(foodL_raw);
    gFood.rightActivation = this.weberFechner(foodR_raw);

    // 2. Recruitment Trail Hydrocarbons
    const gTrail = this.glomeruli[1];
    gTrail.leftActivation = this.weberFechner(sensors.foodLeft);
    gTrail.rightActivation = this.weberFechner(sensors.foodRight);

    // 3. Home Orientation Marker
    const gHome = this.glomeruli[2];
    gHome.leftActivation = this.weberFechner(sensors.homeLeft);
    gHome.rightActivation = this.weberFechner(sensors.homeRight);

    // 4. Alarm Terpenes
    const gAlarm = this.glomeruli[3];
    gAlarm.leftActivation = this.weberFechner(sensors.alarmLeft + sensors.predatorProximity);
    gAlarm.rightActivation = this.weberFechner(sensors.alarmRight + sensors.predatorProximity);

    // 5. Nestmate CHC
    const gNestmate = this.glomeruli[4];
    gNestmate.leftActivation = Math.min(1.0, sensors.nearbyAntsCount * 0.25);
    gNestmate.rightActivation = Math.min(1.0, sensors.nearbyAntsCount * 0.25);

    // Lateral Inhibition across glomeruli (sharpening signal-to-noise ratio)
    const totalLeft = (gFood.leftActivation + gTrail.leftActivation + gAlarm.leftActivation) * 0.15;
    const totalRight = (gFood.rightActivation + gTrail.rightActivation + gAlarm.rightActivation) * 0.15;

    const foodPN_L = Math.max(0, gFood.leftActivation - totalLeft + 0.05 * gFood.leftActivation);
    const foodPN_R = Math.max(0, gFood.rightActivation - totalRight + 0.05 * gFood.rightActivation);

    const trailPN_L = Math.max(0, gTrail.leftActivation - totalLeft);
    const trailPN_R = Math.max(0, gTrail.rightActivation - totalRight);

    const alarmPN_L = gAlarm.leftActivation;
    const alarmPN_R = gAlarm.rightActivation;

    const homePN_L = gHome.leftActivation;
    const homePN_R = gHome.rightActivation;

    // Bilateral Tropotaxis Contrast (-1 = strong Left bias, +1 = strong Right bias)
    const netRight = foodPN_R * 1.5 + trailPN_R * 1.0 - alarmPN_R * 0.8;
    const netLeft = foodPN_L * 1.5 + trailPN_L * 1.0 - alarmPN_L * 0.8;
    const tropotaxisDifferential = Math.max(-1.0, Math.min(1.0, (netRight - netLeft) / (netRight + netLeft + 0.01)));

    return {
      foodPN_L,
      foodPN_R,
      trailPN_L,
      trailPN_R,
      alarmPN_L,
      alarmPN_R,
      homePN_L,
      homePN_R,
      tropotaxisDifferential,
    };
  }
}
