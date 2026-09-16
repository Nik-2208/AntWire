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
    // Update heading
    const turnAmount = turnThrottle * this.traits.turnSpeed * dt;
    this.heading = (this.heading + turnAmount) % (Math.PI * 2);
    if (this.heading < 0) this.heading += Math.PI * 2;

    // Update velocity & position
    const currentSpeed = forwardThrottle * this.traits.movementSpeed;
    this.speed = currentSpeed;
    this.isMoving = Math.abs(currentSpeed) > 0.05;

    this.velocity.x = Math.cos(this.heading) * currentSpeed;
    this.velocity.y = Math.sin(this.heading) * currentSpeed;

    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;

    // Advance tripod gait cycle for 3D animation
    if (this.isMoving) {
      this.gaitPhase = (this.gaitPhase + currentSpeed * dt * 4.0) % (Math.PI * 2);
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
