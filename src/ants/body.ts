/**
 * ANT BRAIN — Ant Physical Body & Morphology
 */

import { AntCaste, AntTask, Vector2D } from '../simulation/types';

export interface IndividualTraits {
  movementSpeed: number;        // baseline speed units/s (~3.0 - 5.0)
  turnSpeed: number;            // radians/s (~4.0 - 6.0)
  sensoryRange: number;         // distance antennae reach (~1.5 - 2.5)
  antennaeAngle: number;        // spread angle of left/right antennae (~0.4 - 0.7 rad)
  energyEfficiency: number;     // metabolic burn multiplier (0.8 - 1.2)
  explorationTendency: number;  // baseline tendency to wander vs exploit (0.5 - 1.5)
  fearThreshold: number;        // threat sensitivity (0.5 - 1.5)
}

export class AntBody {
  public position: Vector2D;
  public heading: number; // angle in radians [0, 2*PI)
  public velocity: Vector2D;
  public speed: number = 0;
  public radius: number = 0.5; // collision radius

  // Visual/Kinematic Gait
  public gaitPhase: number = 0; // for 6-legged tripod gait animation
  public isMoving: boolean = false;

  // Role & Caste
  public caste: AntCaste;
  public task: AntTask = 'EXPLORING';
  public colonyId: string;

  // Traits (Individual Phenotypic Variation)
  public traits: IndividualTraits;

  constructor(
    colonyId: string,
    initialPos: Vector2D,
    initialHeading: number,
    caste: AntCaste = 'WORKER',
    customTraits?: Partial<IndividualTraits>
  ) {
    this.colonyId = colonyId;
    this.position = { ...initialPos };
    this.heading = initialHeading;
    this.velocity = { x: 0, y: 0 };
    this.caste = caste;

    this.traits = {
      movementSpeed: 4.2,
      turnSpeed: 5.5,
      sensoryRange: 2.2,
      antennaeAngle: 0.55, // ~31.5 degrees
      energyEfficiency: 1.0,
      explorationTendency: 1.0,
      fearThreshold: 1.0,
      ...customTraits,
    };
  }

  public updateMotion(dt: number, forwardThrottle: number, turnThrottle: number): void {
    // Clamp throttles to valid ranges
    const clampedThrottle = isNaN(forwardThrottle) ? 0 : Math.max(-1.0, Math.min(1.0, forwardThrottle));
    const clampedTurn = isNaN(turnThrottle) ? 0 : Math.max(-2.5, Math.min(2.5, turnThrottle));

    // Damped heading update with max turn-rate limit to prevent high-frequency jitter
    const maxTurnRate = this.traits.turnSpeed * 1.5;
    const turnAmount = Math.max(-maxTurnRate * dt, Math.min(maxTurnRate * dt, clampedTurn * this.traits.turnSpeed * dt));
    this.heading = (this.heading + turnAmount) % (Math.PI * 2);
    if (this.heading < 0) this.heading += Math.PI * 2;

    // Smoothed velocity calculation
    const targetSpeed = clampedThrottle * this.traits.movementSpeed;
    const accelRate = 12.0; // m/s^2 smooth transition
    this.speed += (targetSpeed - this.speed) * Math.min(1.0, accelRate * dt);
    this.isMoving = Math.abs(this.speed) > 0.05;

    this.velocity.x = Math.cos(this.heading) * this.speed;
    this.velocity.y = Math.sin(this.heading) * this.speed;

    // Guard against NaN
    if (!isNaN(this.velocity.x) && !isNaN(this.velocity.y)) {
      this.position.x += this.velocity.x * dt;
      this.position.y += this.velocity.y * dt;
    }

    // Advance tripod gait cycle for 3D animation
    if (this.isMoving) {
      this.gaitPhase = (this.gaitPhase + Math.abs(this.speed) * dt * 4.0) % (Math.PI * 2);
    }
  }

  /**
   * Keep body within world boundaries
   */
  public clampToWorld(halfW: number, halfH: number): boolean {
    let bounced = false;
    const margin = this.radius + 0.5;

    if (this.position.x < -halfW + margin) {
      this.position.x = -halfW + margin;
      this.heading = Math.PI - this.heading;
      bounced = true;
    } else if (this.position.x > halfW - margin) {
      this.position.x = halfW - margin;
      this.heading = Math.PI - this.heading;
      bounced = true;
    }

    if (this.position.y < -halfH + margin) {
      this.position.y = -halfH + margin;
      this.heading = -this.heading;
      bounced = true;
    } else if (this.position.y > halfH - margin) {
      this.position.y = halfH - margin;
      this.heading = -this.heading;
      bounced = true;
    }

    if (bounced) {
      this.heading = (this.heading + Math.PI * 2) % (Math.PI * 2);
    }
    return bounced;
  }
}
