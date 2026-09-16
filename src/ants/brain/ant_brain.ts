/**
 * ANT BRAIN — Biologically Informed Neuropil Architecture
 * Integrates Antennal Lobes (AL), Mushroom Bodies (MB), Central Complex (CX), and Lateral Accessory Lobes (LAL).
 */

import { AntennalLobeCircuit } from './antennal_lobe';
import { MushroomBodyCircuit } from './mushroom_body';
import { CentralComplexCircuit } from './central_complex';
import { AntBrainStateSnapshot, MotorLALState } from './types';
import { AntSensorySnapshot, AntInternalState, AntAction, PheromoneChannel } from '../../simulation/types';
import { AntBody } from '../body';
import { ActionFactory } from '../actions';
import { SeededRNG } from '../../simulation/rng';

export class BiologicallyInformedAntBrain {
  public antennalLobe: AntennalLobeCircuit;
  public mushroomBody: MushroomBodyCircuit;
  public centralComplex: CentralComplexCircuit;
  public motorLAL: MotorLALState;
  public lastSnapshot: AntBrainStateSnapshot;

  constructor() {
    this.antennalLobe = new AntennalLobeCircuit();
    this.mushroomBody = new MushroomBodyCircuit();
    this.centralComplex = new CentralComplexCircuit();
    this.motorLAL = {
      leftMotorBias: 0.5,
      rightMotorBias: 0.5,
      forwardThrust: 1.0,
      mandibleGraspReflex: false,
      stingVenomDischarge: false,
    };
    this.lastSnapshot = this.createSnapshot(
      0,
      { appetitiveValence: 0.5, aversiveValence: 0, activeKCCount: 8 },
      { homeVectorHeading: 0, homeVectorDistance: 0, confidence: 1 }
    );
  }

  /**
   * Complete Neuropil Neural Forward Cycle:
   * 1. AL: Chemosensory transduction & tropotaxis contrast
   * 2. MB: Sparse Kenyon cell coding & neuromodulated associative valence
   * 3. CX: Celestial compass & Fan-Shaped Body path integration home vector
   * 4. LAL: Descending premotor vector summation into continuous steering & throttle
   */
  public evaluate(
    body: AntBody,
    sensors: AntSensorySnapshot,
    internalState: AntInternalState,
    dt: number,
    rng: SeededRNG,
    rewardSignal = 0,
    punishmentSignal = 0
  ): {
    action: AntAction;
    dominantNeuropil: string;
    neuralReason: string;
    snapshot: AntBrainStateSnapshot;
  } {
    // 1. Antennal Lobe Odor Processing
    const al = this.antennalLobe.processSensoryInput(sensors, dt);

    // 2. Mushroom Body Associative Learning & Valence
    const pnActivations: [number, number, number, number, number] = [
      Math.max(al.foodPN_L, al.foodPN_R),
      Math.max(al.trailPN_L, al.trailPN_R),
      Math.max(al.homePN_L, al.homePN_R),
      Math.max(al.alarmPN_L, al.alarmPN_R),
      sensors.nearbyAntsCount > 0 ? 0.8 : 0,
    ];
    const mb = this.mushroomBody.update(pnActivations, rewardSignal, punishmentSignal, dt);

    // 3. Central Complex Heading & Path Integration Home Vector
    const cx = this.centralComplex.update(
      body.heading,
      body.speed,
      dt,
      sensors.isAtNestEntrance
    );

    // 4. Lateral Accessory Lobe (LAL) Premotor Vector Summation
    let steerAngle = 0;
    let forwardThrust = 1.0;
    let dominantNeuropil = 'Central Complex (CX)';
    let neuralReason = '';
    let pheroToDeposit: PheromoneChannel | undefined = undefined;
    let pheroStrength = 0;

    // (A) Critical Alarm / Threat Reflex (Highest priority descending inhibition)
    if (al.alarmPN_L > 0.4 || al.alarmPN_R > 0.4 || sensors.predatorDetected || mb.aversiveValence > 0.6) {
      dominantNeuropil = 'Subesophageal Zone / Alarm LAL';
      const fleeTurn = sensors.predatorRelativeAngle > 0 ? -1.8 : 1.8;
      steerAngle = fleeTurn;
      forwardThrust = 1.35; // Emergency burst
      pheroToDeposit = PheromoneChannel.ALARM;
      pheroStrength = 0.9;
      neuralReason = `Alarm Glomerulus firing (L=${al.alarmPN_L.toFixed(2)}, R=${al.alarmPN_R.toFixed(2)}) -> emergency descending motor flee ${fleeTurn.toFixed(2)} rad`;
    }
    // (B) Obstacle Avoidance Reflex
    else if (sensors.obstacleCenter > 0.4 || sensors.obstacleLeft > 0.5 || sensors.obstacleRight > 0.5) {
      dominantNeuropil = 'Antennal Mechanoreceptor LAL';
      steerAngle = sensors.obstacleLeft > sensors.obstacleRight ? 1.2 : -1.2;
      forwardThrust = 0.6;
      neuralReason = `Antennal mechanoreceptor contact -> obstacle detour turn ${steerAngle.toFixed(2)} rad`;
    }
    // (C) At Nest with Cargo -> Granary Drop & Recalibration
    else if (internalState.carryingFoodAmount > 0 && sensors.isAtNestEntrance) {
      dominantNeuropil = 'Subesophageal Mandibular Zone';
      const action = ActionFactory.depositFood();
      neuralReason = 'Nest entrance contact -> mandibular cargo release and CX path integration reset';
      return {
        action,
        dominantNeuropil,
        neuralReason,
        snapshot: this.createSnapshot(al.tropotaxisDifferential, mb, cx),
      };
    }
    // (D) At Food Source -> Mandibular Grasp
    else if (internalState.carryingFoodAmount <= 0 && sensors.foodProximity >= 0.9 && sensors.detectedFoodId) {
      dominantNeuropil = 'Subesophageal Mandibular Zone';
      const action = ActionFactory.collectFood(sensors.detectedFoodId);
      neuralReason = `Food gustatory contact -> mandibular grasping reflex on resource ${sensors.detectedFoodId}`;
      return {
        action,
        dominantNeuropil,
        neuralReason,
        snapshot: this.createSnapshot(al.tropotaxisDifferential, mb, cx),
      };
    }
    // (E) Carrying Food -> CX Path Integration Home Vector Steering
    else if (internalState.carryingFoodAmount > 0 || internalState.energy < 0.2) {
      dominantNeuropil = 'Central Complex Fan-Shaped Body (FB)';
      // Steer towards Central Complex Home Vector Angle
      let angleDiff = cx.homeVectorHeading - body.heading;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

      steerAngle = angleDiff * 0.75 + rng.gaussian(0, 0.05);
      forwardThrust = 1.0;
      if (internalState.carryingFoodAmount > 0) {
        pheroToDeposit = PheromoneChannel.FOOD_TRAIL;
        pheroStrength = 0.8;
      }
      neuralReason = `Fan-Shaped Body Home Vector active (${cx.homeVectorDistance.toFixed(1)}m at ${cx.homeVectorHeading.toFixed(2)} rad) -> homing steer ${steerAngle.toFixed(2)} rad`;
    }
    // (F) Strong Odor / Trail Pheromone -> AL Tropotaxis Steering
    else if (al.foodPN_L > 0.05 || al.foodPN_R > 0.05 || al.trailPN_L > 0.05 || al.trailPN_R > 0.05) {
      dominantNeuropil = 'Antennal Lobe Tropotaxis (AL)';
      steerAngle = al.tropotaxisDifferential * 0.85 + rng.gaussian(0, 0.05);
      forwardThrust = 1.0;
      pheroToDeposit = PheromoneChannel.HOME_TRAIL;
      pheroStrength = 0.35;
      neuralReason = `AL bilateral tropotaxis differential (${al.tropotaxisDifferential.toFixed(2)}) -> steering toward higher odor concentration`;
    }
    // (G) Exploratory Scouting with Levy-like Wander
    else {
      dominantNeuropil = 'Central Complex Ring Attractor (EB)';
      let wanderTurn = rng.gaussian(0, 0.2);
      if (rng.chance(0.04)) wanderTurn = rng.range(-1.2, 1.2);
      steerAngle = wanderTurn;
      forwardThrust = 0.9;
      pheroToDeposit = PheromoneChannel.HOME_TRAIL;
      pheroStrength = 0.25;
      neuralReason = `Spontaneous central complex heading wander -> explore turn ${wanderTurn.toFixed(2)} rad`;
    }

    const action = ActionFactory.move(forwardThrust, steerAngle);
    if (pheroToDeposit !== undefined) {
      action.depositPheromoneType = pheroToDeposit;
      action.depositPheromoneStrength = pheroStrength;
    }

    const snapshot = this.createSnapshot(al.tropotaxisDifferential, mb, cx);
    this.lastSnapshot = snapshot;

    return {
      action,
      dominantNeuropil,
      neuralReason,
      snapshot,
    };
  }

  public getSnapshot(): AntBrainStateSnapshot {
    return this.lastSnapshot;
  }

  private createSnapshot(
    tropotaxisDiff: number,
    mb: { appetitiveValence: number; aversiveValence: number; activeKCCount: number },
    cx: { homeVectorHeading: number; homeVectorDistance: number; confidence: number }
  ): AntBrainStateSnapshot {
    return {
      timestamp: performance.now(),
      antennalLobe: {
        glomeruli: this.antennalLobe.glomeruli.map((g) => ({ ...g })),
        tropotaxisDifferential: tropotaxisDiff,
      },
      mushroomBody: {
        sparseSparsityFraction: mb.activeKCCount / 64,
        appetitiveOutput: mb.appetitiveValence,
        aversiveOutput: mb.aversiveValence,
        octopamineLevel: this.mushroomBody.state.octopamineLevel,
        dopamineLevel: this.mushroomBody.state.dopamineLevel,
      },
      centralComplex: {
        headingRing: Array.from(this.centralComplex.state.headingRingAttractor),
        estimatedHeading: this.centralComplex.state.estimatedHeading,
        homeVectorAngle: cx.homeVectorHeading,
        homeVectorDistance: cx.homeVectorDistance,
        pathIntegrationConfidence: cx.confidence,
      },
      motorLAL: {
        steerAngle: 0,
        thrust: 1.0,
      },
    };
  }
}
