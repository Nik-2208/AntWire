/**
 * ANT BRAIN — Sensory Subsystem
 * Non-omniscient multi-channel antennae chemical raycasts, localized odor gradients, visual obstacle rays, and threat sensors.
 */

import { AntSensorySnapshot, FoodEntity, ObstacleEntity, PheromoneChannel, PredatorState, Vector2D } from '../simulation/types';
import { AntBody } from './body';
import { PheromoneField } from '../pheromones/field';

export class AntSensors {
  public lastSnapshot: AntSensorySnapshot;

  // Visual/Debug ray endpoints for 3D UI inspection
  public leftAntennaPos: Vector2D = { x: 0, y: 0 };
  public centerAntennaPos: Vector2D = { x: 0, y: 0 };
  public rightAntennaPos: Vector2D = { x: 0, y: 0 };

  constructor() {
    this.lastSnapshot = this.getEmptySnapshot();
  }

  private getEmptySnapshot(): AntSensorySnapshot {
    return {
      foodLeft: 0,
      foodCenter: 0,
      foodRight: 0,
      homeLeft: 0,
      homeCenter: 0,
      homeRight: 0,
      alarmLeft: 0,
      alarmCenter: 0,
      alarmRight: 0,
      foodOdorConcentration: 0,
      foodOdorDirection: 0,
      foodProximity: 0,
      detectedFoodId: null,
      nestOdorConcentration: 0,
      nestOdorDirection: 0,
      nestProximity: 0,
      isAtNestEntrance: false,
      obstacleLeft: 0,
      obstacleCenter: 0,
      obstacleRight: 0,
      predatorDetected: false,
      predatorProximity: 0,
      predatorRelativeAngle: 0,
      nearbyAntsCount: 0,
      nearestAntDistance: 999,
    };
  }

  /**
   * Samples world state purely through the simulated ant's local sensory organs
   */
  public sense(
    body: AntBody,
    pheromones: PheromoneField,
    foodEntities: FoodEntity[],
    nestEntrance: Vector2D,
    nestRadius: number,
    obstacles: ObstacleEntity[],
    predators: PredatorState[],
    nearbyAnts: AntBody[]
  ): AntSensorySnapshot {
    const px = body.position.x;
    const py = body.position.y;
    const heading = body.heading;
    const sRange = body.traits.sensoryRange;
    const aAngle = body.traits.antennaeAngle;

    // 1. Sample Antennae Pheromones (Food trail, Home trail, Alarm)
    const leftRay = pheromones.sampleRay(px, py, heading, -aAngle, sRange, PheromoneChannel.FOOD_TRAIL);
    const centerRay = pheromones.sampleRay(px, py, heading, 0, sRange * 1.1, PheromoneChannel.FOOD_TRAIL);
    const rightRay = pheromones.sampleRay(px, py, heading, aAngle, sRange, PheromoneChannel.FOOD_TRAIL);

    this.leftAntennaPos = leftRay.point;
    this.centerAntennaPos = centerRay.point;
    this.rightAntennaPos = rightRay.point;

    const homeL = pheromones.sampleRay(px, py, heading, -aAngle, sRange, PheromoneChannel.HOME_TRAIL).concentration;
    const homeC = pheromones.sampleRay(px, py, heading, 0, sRange * 1.1, PheromoneChannel.HOME_TRAIL).concentration;
    const homeR = pheromones.sampleRay(px, py, heading, aAngle, sRange, PheromoneChannel.HOME_TRAIL).concentration;

    const alarmL = pheromones.sampleRay(px, py, heading, -aAngle, sRange, PheromoneChannel.ALARM).concentration;
    const alarmC = pheromones.sampleRay(px, py, heading, 0, sRange * 1.1, PheromoneChannel.ALARM).concentration;
    const alarmR = pheromones.sampleRay(px, py, heading, aAngle, sRange, PheromoneChannel.ALARM).concentration;

    // 2. Direct Food Odor Gradient (Volatiles emitted by food clusters within sensory range)
    let bestFoodOdor = 0;
    let bestFoodAngle = 0;
    let bestFoodProx = 0;
    let bestFoodId: string | null = null;
    const maxFoodSmellDist = 12.0;

    for (let i = 0; i < foodEntities.length; i++) {
      const f = foodEntities[i];
      if (f.amount <= 0) continue;

      const dx = f.position.x - px;
      const dy = f.position.y - py;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < maxFoodSmellDist) {
        // Inverse square attenuation with saturation
        const conc = Math.min(1.0, (f.amount / 50) / Math.max(1.0, dist * 0.4));
        if (conc > bestFoodOdor) {
          bestFoodOdor = conc;
          bestFoodId = f.id;
          const absoluteAngle = Math.atan2(dy, dx);
          bestFoodAngle = this.normalizeAngle(absoluteAngle - heading);
          const contactDist = f.radius + body.radius + 0.8;
          bestFoodProx = dist <= contactDist ? 1.0 : Math.max(0, 1.0 - dist / (contactDist * 2.0));
        }
      }
    }

    // 3. Nest Odor / Home Vector Gradient
    const ndx = nestEntrance.x - px;
    const ndy = nestEntrance.y - py;
    const nestDist = Math.sqrt(ndx * ndx + ndy * ndy);
    const isAtNest = nestDist <= nestRadius + body.radius + 0.3;
    const nestAngle = this.normalizeAngle(Math.atan2(ndy, ndx) - heading);
    const nestOdor = Math.min(1.0, 10.0 / Math.max(1.0, nestDist));
    const nestProx = Math.max(0, 1.0 - nestDist / (nestRadius * 3));

    // 4. Obstacle Proximity Raycasts (Short distance collision avoidance)
    let obsL = 0;
    let obsC = 0;
    let obsR = 0;
    const obsRayDist = body.radius + 1.2;

    for (let i = 0; i < obstacles.length; i++) {
      const obs = obstacles[i];
      const checkObstacleRay = (angleOffset: number): number => {
        const rayAngle = heading + angleOffset;
        const rx = px + Math.cos(rayAngle) * obsRayDist;
        const ry = py + Math.sin(rayAngle) * obsRayDist;
        const dx = obs.position.x - rx;
        const dy = obs.position.y - ry;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < obs.radius) {
          return Math.min(1.0, (obs.radius - d) / obs.radius + 0.5);
        }
        return 0;
      };

      obsL = Math.max(obsL, checkObstacleRay(-aAngle));
      obsC = Math.max(obsC, checkObstacleRay(0));
      obsR = Math.max(obsR, checkObstacleRay(aAngle));
    }

    // 5. Predator Scent & Proximity Sensing
    let predDetected = false;
    let predProx = 0;
    let predRelAngle = 0;
    const maxPredDist = 14.0 * body.traits.fearThreshold;

    for (let i = 0; i < predators.length; i++) {
      const pred = predators[i];
      const pdx = pred.position.x - px;
      const pdy = pred.position.y - py;
      const pdist = Math.sqrt(pdx * pdx + pdy * pdy);

      if (pdist < maxPredDist) {
        predDetected = true;
        const pAngle = Math.atan2(pdy, pdx);
        predRelAngle = this.normalizeAngle(pAngle - heading);
        const prox = 1.0 - pdist / maxPredDist;
        if (prox > predProx) {
          predProx = prox;
        }
      }
    }

    // 6. Nearby Ants Social Proximity
    let nearbyCount = 0;
    let nearestAntD = 999;
    for (let i = 0; i < nearbyAnts.length; i++) {
      const other = nearbyAnts[i];
      if (other === body) continue;
      const adx = other.position.x - px;
      const ady = other.position.y - py;
      const adist = Math.sqrt(adx * adx + ady * ady);
      if (adist < 3.0) {
        nearbyCount++;
        if (adist < nearestAntD) nearestAntD = adist;
      }
    }

    const snapshot: AntSensorySnapshot = {
      foodLeft: leftRay.concentration,
      foodCenter: centerRay.concentration,
      foodRight: rightRay.concentration,
      homeLeft: homeL,
      homeCenter: homeC,
      homeRight: homeR,
      alarmLeft: alarmL,
      alarmCenter: alarmC,
      alarmRight: alarmR,
      foodOdorConcentration: bestFoodOdor,
      foodOdorDirection: bestFoodAngle,
      foodProximity: bestFoodProx,
      detectedFoodId: bestFoodId,
      nestOdorConcentration: nestOdor,
      nestOdorDirection: nestAngle,
      nestProximity: nestProx,
      isAtNestEntrance: isAtNest,
      obstacleLeft: obsL,
      obstacleCenter: obsC,
      obstacleRight: obsR,
      predatorDetected: predDetected,
      predatorProximity: predProx,
      predatorRelativeAngle: predRelAngle,
      nearbyAntsCount: nearbyCount,
      nearestAntDistance: nearestAntD,
    };

    this.lastSnapshot = snapshot;
    return snapshot;
  }

  private normalizeAngle(angle: number): number {
    while (angle > Math.PI) angle -= Math.PI * 2;
    while (angle < -Math.PI) angle += Math.PI * 2;
    return angle;
  }
}
