/**
 * ANT BRAIN — Rule-Based Ethological Baseline Controller
 * Full explainable decision logic connecting sensory inputs, physiological drives, and physical actions.
 */

import { AntAction, AntDrives, AntInternalState, AntSensorySnapshot, DecisionRecord, PheromoneChannel } from '../../simulation/types';
import { AntBody } from '../body';
import { AntMemory } from '../memory';
import { SeededRNG } from '../../simulation/rng';
import { AntController, DecisionOutput } from './controller';
import { ActionFactory } from '../actions';

export class RuleBasedController implements AntController {
  public readonly name = 'Formica Rule-Based Ethological Policy';
  public readonly type = 'RULE_BASED' as const;
  public readonly version = '1.0.0';

  public decide(
    antId: string,
    simTime: number,
    tick: number,
    body: AntBody,
    sensors: AntSensorySnapshot,
    internalState: AntInternalState,
    drives: AntDrives,
    memory: AntMemory,
    rng: SeededRNG
  ): DecisionOutput {
    let action: AntAction;
    let dominantDrive = 'Exploration';
    let dominantVal = drives.exploration;
    let confidence = 0.5;
    let humanReason = '';
    let techReason = '';

    // Determine highest drive
    const drivePairs: [string, number][] = [
      ['Threat Avoidance', drives.threatAvoidance],
      ['Homing', drives.homing],
      ['Food Seeking', drives.foodSeeking],
      ['Exploration', drives.exploration],
      ['Social Interaction', drives.socialInteraction],
    ];
    drivePairs.sort((a, b) => b[1] - a[1]);
    dominantDrive = drivePairs[0][0];
    dominantVal = drivePairs[0][1];

    // 1. HIGHEST PRIORITY: CRITICAL THREAT EVASION (Flee predator)
    if (drives.threatAvoidance > 0.65 || sensors.predatorDetected) {
      const fleeTurn = sensors.predatorRelativeAngle > 0 ? -1.8 : 1.8;
      action = ActionFactory.flee(fleeTurn);
      confidence = 0.95;
      humanReason = 'Sensing immediate predator threat; fleeing in opposite direction while emitting alarm chemical.';
      techReason = `predatorProx=${sensors.predatorProximity.toFixed(2)}, alarmL=${sensors.alarmLeft.toFixed(2)}, alarmR=${sensors.alarmRight.toFixed(2)} -> emergency evasion turn ${fleeTurn.toFixed(2)} rad`;
      return this.wrapOutput(antId, simTime, tick, sensors, internalState, drives, action, dominantDrive, dominantVal, confidence, humanReason, techReason);
    }

    // 2. OBSTACLE COLLISION AVOIDANCE (Overriding local steering)
    if (sensors.obstacleCenter > 0.4 || sensors.obstacleLeft > 0.5 || sensors.obstacleRight > 0.5) {
      let turnAvoid = 0;
      if (sensors.obstacleLeft > sensors.obstacleRight) {
        turnAvoid = 1.2; // Turn right
      } else {
        turnAvoid = -1.2; // Turn left
      }
      action = ActionFactory.turn(turnAvoid);
      confidence = 0.88;
      humanReason = 'Navigating around physical barrier.';
      techReason = `obsL=${sensors.obstacleLeft.toFixed(2)}, obsC=${sensors.obstacleCenter.toFixed(2)}, obsR=${sensors.obstacleRight.toFixed(2)} -> avoidance turn ${turnAvoid.toFixed(2)} rad`;
      return this.wrapOutput(antId, simTime, tick, sensors, internalState, drives, action, dominantDrive, dominantVal, confidence, humanReason, techReason);
    }

    // 3. AT NEST ENTRANCE WITH CARGO -> DEPOSIT FOOD & UNLOAD
    if (internalState.carryingFoodAmount > 0 && sensors.isAtNestEntrance) {
      action = ActionFactory.depositFood();
      confidence = 0.99;
      humanReason = 'Arrived at nest entrance; transferring harvested food cargo into colony food storage.';
      techReason = `carryingFood=${internalState.carryingFoodAmount}, isAtNest=true -> DEPOSIT_FOOD`;
      return this.wrapOutput(antId, simTime, tick, sensors, internalState, drives, action, dominantDrive, dominantVal, confidence, humanReason, techReason);
    }

    // 4. AT FOOD SOURCE -> HARVEST FOOD
    if (internalState.carryingFoodAmount <= 0 && sensors.foodProximity >= 0.9 && sensors.detectedFoodId) {
      action = ActionFactory.collectFood(sensors.detectedFoodId);
      confidence = 0.95;
      humanReason = 'Found food resource; grasping food packet in mandibles.';
      techReason = `foodProx=${sensors.foodProximity.toFixed(2)}, foodId=${sensors.detectedFoodId} -> COLLECT_FOOD`;
      return this.wrapOutput(antId, simTime, tick, sensors, internalState, drives, action, dominantDrive, dominantVal, confidence, humanReason, techReason);
    }

    // 5. HOMING NAVIGATION (Returning to nest with food or when starving)
    if (drives.homing > 0.6 || internalState.carryingFoodAmount > 0) {
      let steerAngle = 0;

      // Check home pheromone trail gradient first
      const homeDiff = sensors.homeRight - sensors.homeLeft;
      if (Math.abs(homeDiff) > 0.05) {
        steerAngle = homeDiff > 0 ? 0.35 : -0.35;
      } else {
        // Direct orientation toward nest odor gradient
        steerAngle = sensors.nestOdorDirection * 0.7;
      }

      // Add slight noise to prevent getting stuck
      steerAngle += rng.gaussian(0, 0.08);

      action = ActionFactory.move(1.0, steerAngle);

      // If carrying food, homing return navigation (recruitment deposition is evaluated by PheromoneDecisionEngine)
      if (internalState.carryingFoodAmount > 0) {
        humanReason = 'Returning to nest with food cargo; recruitment trail deposition evaluated contextually by PheromoneDecisionEngine.';
        techReason = `homingDrive=${drives.homing.toFixed(2)}, nestAngle=${sensors.nestOdorDirection.toFixed(2)} rad -> steer ${steerAngle.toFixed(2)} rad`;
      } else {
        humanReason = 'Critically low on energy; returning to nest to feed.';
        techReason = `energy=${(internalState.energy * 100).toFixed(0)}%, homingDrive=${drives.homing.toFixed(2)} -> steer ${steerAngle.toFixed(2)} rad`;
      }
      confidence = 0.85;
      return this.wrapOutput(antId, simTime, tick, sensors, internalState, drives, action, dominantDrive, dominantVal, confidence, humanReason, techReason);
    }

    // 6. FOOD SEEKING NAVIGATION (Following chemical trails or direct food odor)
    if (drives.foodSeeking > 0.4) {
      let steerAngle = 0;
      let usedSignal = 'wander';

      // (A) Direct food odor is strong
      if (sensors.foodOdorConcentration > 0.25) {
        steerAngle = sensors.foodOdorDirection * 0.75 + rng.gaussian(0, 0.05);
        usedSignal = 'direct food volatile odor';
      }
      // (B) Pheromone trail tropotaxis (differential left/right antennae stimulation)
      else if (sensors.foodLeft > 0.05 || sensors.foodRight > 0.05 || sensors.foodCenter > 0.05) {
        const diff = sensors.foodRight - sensors.foodLeft;
        if (Math.abs(diff) > 0.02) {
          steerAngle = diff > 0 ? 0.45 : -0.45;
        } else {
          steerAngle = rng.gaussian(0, 0.06); // Follow straight along center ridge
        }
        usedSignal = `trail pheromone (L=${sensors.foodLeft.toFixed(2)}, R=${sensors.foodRight.toFixed(2)})`;
      }
      // (C) Memory of recent food patch
      else if (memory.lastKnownFoodPosition && memory.foodConfidence > 0.3) {
        const mdx = memory.lastKnownFoodPosition.x - body.position.x;
        const mdy = memory.lastKnownFoodPosition.y - body.position.y;
        const targetHeading = Math.atan2(mdy, mdx);
        let angleDiff = targetHeading - body.heading;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        steerAngle = angleDiff * 0.5 + rng.gaussian(0, 0.1);
        usedSignal = 'spatial memory trace';
      }

      action = ActionFactory.move(1.0, steerAngle);
      // While scouting outbound, deposit orientation home trail
      action.depositPheromoneType = PheromoneChannel.HOME_TRAIL;
      action.depositPheromoneStrength = 0.4;

      confidence = 0.78;
      humanReason = `Searching for food; following ${usedSignal}.`;
      techReason = `foodDrive=${drives.foodSeeking.toFixed(2)}, signal=${usedSignal} -> steer ${steerAngle.toFixed(2)} rad`;
      return this.wrapOutput(antId, simTime, tick, sensors, internalState, drives, action, dominantDrive, dominantVal, confidence, humanReason, techReason);
    }

    // 7. EXPLORATION & CORRELATED RANDOM WALK
    // Correlated wandering: small angular deviation with periodic Levy-like shifts
    let wanderTurn = rng.gaussian(0, 0.22);
    if (rng.chance(0.04)) {
      wanderTurn = rng.range(-1.2, 1.2); // Occasional sharp turn for area exploration
    }

    action = ActionFactory.move(0.9, wanderTurn);
    // Deposit home trail so ant can find its way back
    action.depositPheromoneType = PheromoneChannel.HOME_TRAIL;
    action.depositPheromoneStrength = 0.3;

    confidence = 0.62;
    humanReason = 'Exploring uncharted territory in search of resources.';
    techReason = `explorationDrive=${drives.exploration.toFixed(2)} -> correlated random walk, turn ${wanderTurn.toFixed(2)} rad`;
    return this.wrapOutput(antId, simTime, tick, sensors, internalState, drives, action, dominantDrive, dominantVal, confidence, humanReason, techReason);
  }

  private wrapOutput(
    antId: string,
    simTime: number,
    tick: number,
    sensors: AntSensorySnapshot,
    internalState: AntInternalState,
    drives: AntDrives,
    action: AntAction,
    dominantDrive: string,
    dominantDriveValue: number,
    confidence: number,
    humanReason: string,
    techReason: string
  ): DecisionOutput {
    const record: DecisionRecord = {
      id: `${antId}-${tick}`,
      antId,
      timestamp: simTime,
      tick,
      sensorySnapshot: { ...sensors },
      internalState: { ...internalState },
      drives: { ...drives },
      selectedAction: action,
      dominantDrive,
      dominantDriveValue,
      confidence,
      humanReason,
      technicalExplanation: techReason,
    };
    return { action, record };
  }
}
