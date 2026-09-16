/**
 * ANT BRAIN — Central Complex (CX) Celestial Compass & Path Integration Circuit
 * Models Ellipsoid Body (EB) 16-wedge Ring Attractor for internal heading representation,
 * and Fan-Shaped Body (FB) Path Integration / Odometer for zero-pheromone home navigation.
 */

import { CentralComplexState } from './types';
import { Vector2D } from '../../simulation/types';

export class CentralComplexCircuit {
  public state: CentralComplexState;
  public readonly numWedges = 16;

  // Integrated Cartesian Home Vector (dx, dy from nest)
  private accumulatedX: number = 0;
  private accumulatedY: number = 0;

  constructor() {
    this.state = {
      headingRingAttractor: new Float32Array(this.numWedges),
      estimatedHeading: 0,
      homeVectorAngle: 0,
      homeVectorDistance: 0,
      pathIntegrationConfidence: 1.0,
      celestialPolarizationAngle: 0,
      stepAccumulator: 0,
    };

    this.updateRingAttractor(0);
  }

  /**
   * Updates the 16-neuron Ring Attractor bump centered around true heading + noise
   */
  private updateRingAttractor(heading: number): void {
    const sigma = (Math.PI * 2) / this.numWedges;
    this.state.estimatedHeading = heading;

    for (let i = 0; i < this.numWedges; i++) {
      const wedgeAngle = (i / this.numWedges) * Math.PI * 2;
      let diff = heading - wedgeAngle;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;

      // Gaussian bell curve activation over circular topology
      const activation = Math.exp(-(diff * diff) / (2 * sigma * sigma));
      this.state.headingRingAttractor[i] = activation;
    }
  }

  /**
   * Main CX update integrating step odometer and angular velocity
   */
  public update(
    bodyHeading: number,
    bodySpeed: number,
    dt: number,
    isAtNestEntrance: boolean
  ): { homeVectorHeading: number; homeVectorDistance: number; confidence: number } {
    // 1. Update Ring Attractor with slight sensory noise
    this.updateRingAttractor(bodyHeading);

    // 2. Step Odometer & Path Integration Accumulator
    const stepDistance = bodySpeed * dt;
    this.state.stepAccumulator += stepDistance;

    // Project step displacement along internal compass heading
    this.accumulatedX += Math.cos(bodyHeading) * stepDistance;
    this.accumulatedY += Math.sin(bodyHeading) * stepDistance;

    // Reset accumulator when at nest entrance (ground truth recalibration)
    if (isAtNestEntrance) {
      this.accumulatedX = 0;
      this.accumulatedY = 0;
      this.state.pathIntegrationConfidence = 1.0;
    } else {
      // Path integration confidence slightly degrades with cumulative distance
      this.state.pathIntegrationConfidence = Math.max(0.3, 1.0 - this.state.stepAccumulator * 0.001);
    }

    // 3. Compute Home Vector pointing from current location back to nest (0, 0)
    // Displacement from nest is (accumulatedX, accumulatedY) -> Vector to nest is (-accumulatedX, -accumulatedY)
    const distToNest = Math.sqrt(this.accumulatedX * this.accumulatedX + this.accumulatedY * this.accumulatedY);
    const angleToNest = Math.atan2(-this.accumulatedY, -this.accumulatedX);

    this.state.homeVectorAngle = angleToNest;
    this.state.homeVectorDistance = distToNest;

    return {
      homeVectorHeading: angleToNest,
      homeVectorDistance: distToNest,
      confidence: this.state.pathIntegrationConfidence,
    };
  }

  public resetHomeVector(): void {
    this.accumulatedX = 0;
    this.accumulatedY = 0;
    this.state.stepAccumulator = 0;
    this.state.homeVectorDistance = 0;
    this.state.pathIntegrationConfidence = 1.0;
  }
}
