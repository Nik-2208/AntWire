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

  // Biomechanical & Morphological Parameters
  public massMg: number;
  public dimensionsMm: { length: number; width: number; height: number };
  public carryingCapacityMg: number;

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

    // Biologically calibrated morphological scale
    if (caste === 'QUEEN') {
      this.massMg = 18.5;
      this.dimensionsMm = { length: 11.2, width: 2.8, height: 2.6 };
      this.carryingCapacityMg = 8.0;
      this.radius = 0.85;
    } else if (caste === 'SOLDIER') {
      this.massMg = 9.2;
      this.dimensionsMm = { length: 7.4, width: 2.1, height: 1.8 };
      this.carryingCapacityMg = 28.0;
      this.radius = 0.65;
    } else {
      // WORKER (Default Formica / Camponotus worker)
      this.massMg = 4.8;
      this.dimensionsMm = { length: 5.6, width: 1.4, height: 1.2 };
      this.carryingCapacityMg = 16.5; // ~3.4x body weight
      this.radius = 0.5;
    }

    this.traits = {
      movementSpeed: caste === 'QUEEN' ? 2.5 : caste === 'SOLDIER' ? 3.6 : 4.2,
      turnSpeed: caste === 'QUEEN' ? 3.5 : 5.5,
      sensoryRange: caste === 'QUEEN' ? 1.8 : 2.2,
      antennaeAngle: 0.55, // ~31.5 degrees
      energyEfficiency: caste === 'QUEEN' ? 1.4 : 1.0,
      explorationTendency: caste === 'QUEEN' ? 0.1 : 1.0,
      fearThreshold: caste === 'SOLDIER' ? 0.4 : 1.0,
      ...customTraits,
    };
  }

  /**
   * Computes authoritative spatial locations of major body segments in world coordinates
   */
  public getSegments(): { head: Vector2D; alitrunk: Vector2D; petiole: Vector2D; gaster: Vector2D } {
    const cos = Math.cos(this.heading);
    const sin = Math.sin(this.heading);
    const scale = this.radius;

    return {
      head: { x: this.position.x + cos * scale * 0.9, y: this.position.y + sin * scale * 0.9 },
      alitrunk: { x: this.position.x + cos * scale * 0.1, y: this.position.y + sin * scale * 0.1 },
      petiole: { x: this.position.x - cos * scale * 0.4, y: this.position.y - sin * scale * 0.4 },
      gaster: { x: this.position.x - cos * scale * 1.0, y: this.position.y - sin * scale * 1.0 },
    };
  }

  /**
   * Computes antenna and optical sensor anchor positions in world coordinates
   */
  public getSensorLocations(): { leftAntennaTip: Vector2D; rightAntennaTip: Vector2D; compoundEyes: Vector2D } {
    const head = this.getSegments().head;
    const leftAngle = this.heading + this.traits.antennaeAngle;
    const rightAngle = this.heading - this.traits.antennaeAngle;
    const reach = this.traits.sensoryRange * 0.6;

    return {
      leftAntennaTip: {
        x: head.x + Math.cos(leftAngle) * reach,
        y: head.y + Math.sin(leftAngle) * reach,
      },
      rightAntennaTip: {
        x: head.x + Math.cos(rightAngle) * reach,
        y: head.y + Math.sin(rightAngle) * reach,
      },
      compoundEyes: {
        x: head.x - Math.cos(this.heading) * 0.1,
        y: head.y - Math.sin(this.heading) * 0.1,
      },
    };
  }

  /**
   * Computes 6-legged alternating tripod gait phase and ground contact states
   */
  public getLegStates(): { id: string; side: 'L' | 'R'; segment: 'T1' | 'T2' | 'T3'; inContact: boolean }[] {
    // Tripod 1: L1, R2, L3 vs Tripod 2: R1, L2, R3
    const tripod1InContact = Math.sin(this.gaitPhase) >= 0;
    const tripod2InContact = !tripod1InContact;

    return [
      { id: 'L1', side: 'L', segment: 'T1', inContact: tripod1InContact },
      { id: 'R1', side: 'R', segment: 'T1', inContact: tripod2InContact },
      { id: 'L2', side: 'L', segment: 'T2', inContact: tripod2InContact },
      { id: 'R2', side: 'R', segment: 'T2', inContact: tripod1InContact },
      { id: 'L3', side: 'L', segment: 'T3', inContact: tripod1InContact },
      { id: 'R3', side: 'R', segment: 'T3', inContact: tripod2InContact },
    ];
  }

  /**
   * Calculates instantaneous metabolic burn rate based on mass, velocity, and carried load
   */
  public getMetabolicBurnRate(cargoMassMg: number = 0): number {
    const totalMass = this.massMg + cargoMassMg;
    const speedRatio = this.speed / Math.max(0.1, this.traits.movementSpeed);
    const basalMetabolism = 0.005 * (this.massMg / 5.0);
    const locomotionCost = 0.04 * speedRatio * (totalMass / this.massMg) * (1.0 / this.traits.energyEfficiency);
    return basalMetabolism + locomotionCost;
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
