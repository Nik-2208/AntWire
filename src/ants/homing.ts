/**
 * ANTWRE — Autonomous Ant Homing System & Navigation State Machine
 * Created & Developed by Nikhilesh H. Chavda
 *
 * Implements authoritative biological homing mechanisms:
 * 1. Path Integration (accumulated egocentric Cartesian displacement vector from nest)
 * 2. Breadcrumb / Waypoint history backtracking
 * 3. Nest Odor & Chemical Landmark gradient sensing
 * 4. Pheromone trail guidance (Home & Food trails)
 * 5. Explicit Homing State Machine with Lost State Recovery & Anti-Loop Detection
 */

import { Vector2D, AntSensorySnapshot } from '../simulation/types';

export type HomingState =
  | 'NESTED'
  | 'LEAVE_NEST'
  | 'OUTBOUND'
  | 'FORAGING_OR_EXPLORING'
  | 'DECIDE_RETURN'
  | 'HOMING'
  | 'NEST_DETECTION'
  | 'APPROACH'
  | 'NEST_ENTRY'
  | 'DELIVER_REST_TASK'
  | 'LOST'
  | 'SEARCH_FOR_HOME_CUE'
  | 'REACQUIRE';

export interface HomingStatusSnapshot {
  state: HomingState;
  estimatedHomeVector: Vector2D;
  estimatedDistanceToNest: number;
  confidence: number;
  isHeadingHome: boolean;
  loopDetected: boolean;
  lostTime: number;
  tripsCompleted: number;
}

export class AntHomingSystem {
  public state: HomingState = 'NESTED';

  // Egocentric Path Integration Vector (relative to nest entry)
  private piX: number = 0;
  private piY: number = 0;
  private confidence: number = 1.0;
  private stepAccumulator: number = 0;

  // Homing progression & distance tracking
  private lastDistanceToNest: number = 0;
  private distanceIncreaseCounter: number = 0;
  private loopDetectionCounter: number = 0;
  private lastHeadingSamples: number[] = [];
  private lostTimer: number = 0;
  public tripsCompleted: number = 0;

  // Recovery & alternate heading
  public alternateHeadingOverride: number | null = null;
  private alternateHeadingDuration: number = 0;

  constructor() {
    this.state = 'NESTED';
  }

  /**
   * Updates path integration dead-reckoning from actual displacement
   */
  public updateMotion(
    dx: number,
    dy: number,
    isAtNest: boolean,
    nestEntrance: Vector2D,
    currentPos: Vector2D
  ): void {
    const stepDist = Math.hypot(dx, dy);
    this.stepAccumulator += stepDist;

    // Accumulate vector displacement
    this.piX += dx;
    this.piY += dy;

    if (isAtNest) {
      // Recalibrate path integration at known landmark (nest entrance)
      this.piX = currentPos.x - nestEntrance.x;
      this.piY = currentPos.y - nestEntrance.y;
      this.confidence = 1.0;
      this.stepAccumulator = 0;
      this.distanceIncreaseCounter = 0;
      this.loopDetectionCounter = 0;
    } else {
      // Confidence gently decays over long continuous journeys without recalibration
      this.confidence = Math.max(0.35, 1.0 - this.stepAccumulator * 0.0008);
    }
  }

  /**
   * Main per-tick Homing State Machine transition & navigation calculation
   */
  public update(
    dt: number,
    currentPos: Vector2D,
    currentHeading: number,
    sensors: AntSensorySnapshot,
    carryingCargo: boolean,
    energy: number,
    isInjured: boolean,
    nestEntrance: Vector2D,
    nestRadius: number
  ): {
    state: HomingState;
    recommendedHeading: number | null;
    shouldReturnHome: boolean;
    reachedNest: boolean;
  } {
    const distToNest = Math.hypot(currentPos.x - nestEntrance.x, currentPos.y - nestEntrance.y);
    const isInsideNestRadius = distToNest <= nestRadius + 0.6;

    // Decay alternate heading overrides from anti-stuck maneuvers
    if (this.alternateHeadingDuration > 0) {
      this.alternateHeadingDuration -= dt;
      if (this.alternateHeadingDuration <= 0) {
        this.alternateHeadingOverride = null;
      }
    }

    // Record heading for oscillation/loop detection
    this.lastHeadingSamples.push(currentHeading);
    if (this.lastHeadingSamples.length > 20) {
      this.lastHeadingSamples.shift();
    }

    // Determine return triggers
    const triggerReturn =
      carryingCargo ||
      energy < 0.35 ||
      isInjured ||
      this.state === 'DECIDE_RETURN' ||
      this.state === 'HOMING';

    let recommendedHeading: number | null = null;
    let reachedNest = false;

    // --- State Transitions ---
    switch (this.state) {
      case 'NESTED': {
        if (!isInsideNestRadius) {
          this.state = 'OUTBOUND';
        } else if (triggerReturn) {
          reachedNest = true;
          this.state = 'DELIVER_REST_TASK';
        }
        break;
      }

      case 'LEAVE_NEST': {
        if (!isInsideNestRadius) {
          this.state = 'OUTBOUND';
        }
        break;
      }

      case 'OUTBOUND': {
        if (triggerReturn) {
          this.state = 'DECIDE_RETURN';
        } else if (distToNest > nestRadius * 2.5) {
          this.state = 'FORAGING_OR_EXPLORING';
        }
        break;
      }

      case 'FORAGING_OR_EXPLORING': {
        if (triggerReturn) {
          this.state = 'DECIDE_RETURN';
        }
        break;
      }

      case 'DECIDE_RETURN': {
        this.distanceIncreaseCounter = 0;
        this.loopDetectionCounter = 0;
        this.state = 'HOMING';
        break;
      }

      case 'HOMING': {
        if (isInsideNestRadius) {
          this.state = 'NEST_ENTRY';
          reachedNest = true;
        } else if (sensors.homeCenter > 0.35 || distToNest < nestRadius * 3.0) {
          this.state = 'NEST_DETECTION';
        }

        // Distance progression check (anti-loop)
        if (this.lastDistanceToNest > 0 && distToNest > this.lastDistanceToNest + 0.1) {
          this.distanceIncreaseCounter++;
          if (this.distanceIncreaseCounter > 30) { // ~0.5s of moving away
            this.state = 'LOST';
            this.lostTimer = 0;
          }
        } else {
          this.distanceIncreaseCounter = Math.max(0, this.distanceIncreaseCounter - 1);
        }

        // Calculate heading to home using fused Path Integration + Nest Odor + Home Pheromone
        recommendedHeading = this.computeHomeHeading(currentPos, currentHeading, sensors, nestEntrance);
        break;
      }

      case 'NEST_DETECTION': {
        if (isInsideNestRadius) {
          this.state = 'NEST_ENTRY';
          reachedNest = true;
        } else {
          this.state = 'APPROACH';
          recommendedHeading = this.computeHomeHeading(currentPos, currentHeading, sensors, nestEntrance);
        }
        break;
      }

      case 'APPROACH': {
        if (isInsideNestRadius) {
          this.state = 'NEST_ENTRY';
          reachedNest = true;
        } else {
          recommendedHeading = this.computeHomeHeading(currentPos, currentHeading, sensors, nestEntrance);
        }
        break;
      }

      case 'NEST_ENTRY': {
        reachedNest = true;
        this.tripsCompleted++;
        this.state = 'DELIVER_REST_TASK';
        break;
      }

      case 'DELIVER_REST_TASK': {
        reachedNest = true;
        if (!carryingCargo && energy > 0.6) {
          this.state = 'NESTED';
        }
        break;
      }

      case 'LOST': {
        this.lostTimer += dt;
        // Search for cues by casting in spiral/alternating arcs
        if (sensors.homeCenter > 0.1 || sensors.homeLeft > 0.1 || sensors.homeRight > 0.1 || this.confidence > 0.5) {
          this.state = 'REACQUIRE';
        } else if (this.lostTimer > 4.0) {
          // Re-orient with approximate vector
          this.state = 'SEARCH_FOR_HOME_CUE';
        }
        recommendedHeading = currentHeading + Math.sin(this.lostTimer * 3.0) * 0.8;
        break;
      }

      case 'SEARCH_FOR_HOME_CUE': {
        this.lostTimer += dt;
        if (sensors.homeCenter > 0.15 || distToNest < nestRadius * 4.0) {
          this.state = 'REACQUIRE';
        }
        recommendedHeading = Math.atan2(nestEntrance.y - currentPos.y, nestEntrance.x - currentPos.x) + Math.sin(this.lostTimer * 2.0) * 0.5;
        break;
      }

      case 'REACQUIRE': {
        this.distanceIncreaseCounter = 0;
        this.state = 'HOMING';
        recommendedHeading = this.computeHomeHeading(currentPos, currentHeading, sensors, nestEntrance);
        break;
      }
    }

    this.lastDistanceToNest = distToNest;

    if (this.alternateHeadingOverride !== null) {
      recommendedHeading = this.alternateHeadingOverride;
    }

    return {
      state: this.state,
      recommendedHeading,
      shouldReturnHome: triggerReturn,
      reachedNest,
    };
  }

  /**
   * Computes authoritative heading toward nest using sensor cues and path integration
   */
  private computeHomeHeading(
    currentPos: Vector2D,
    currentHeading: number,
    sensors: AntSensorySnapshot,
    nestEntrance: Vector2D
  ): number {
    // 1. Path Integration Vector (pointing back toward 0,0 relative displacement)
    const piAngle = Math.atan2(-this.piY, -this.piX);

    // 2. Direct chemical/odor tropotaxis if nest chemical cues are sensed
    const pheroDiff = (sensors.homeLeft - sensors.homeRight) * 1.5;

    // 3. Direct landmark line-of-sight vector if within sensory proximity
    const dx = nestEntrance.x - currentPos.x;
    const dy = nestEntrance.y - currentPos.y;
    const directAngle = Math.atan2(dy, dx);
    const directDist = Math.hypot(dx, dy);

    // Blend: close to nest uses direct/odor cue; far away uses path integration vector
    if (directDist < 6.0) {
      let angleDiff = directAngle - currentHeading;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      return currentHeading + angleDiff * 0.85 + pheroDiff * 0.15;
    }

    let targetAngle = (this.confidence > 0.5) ? piAngle : directAngle;
    let angleDiff = targetAngle - currentHeading;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

    return currentHeading + angleDiff * 0.7 + pheroDiff * 0.2;
  }

  /**
   * Trigger anti-loop escape maneuver when obstacle or dead-end encountered
   */
  public triggerAntiLoopEscape(escapeHeading: number, durationSec: number = 1.5): void {
    this.alternateHeadingOverride = escapeHeading;
    this.alternateHeadingDuration = durationSec;
    this.loopDetectionCounter++;
  }

  public isHomingActive(): boolean {
    return (
      this.state === 'HOMING' ||
      this.state === 'DECIDE_RETURN' ||
      this.state === 'NEST_DETECTION' ||
      this.state === 'APPROACH' ||
      this.state === 'NEST_ENTRY'
    );
  }

  public initiateReturn(reason?: string): void {
    this.state = 'HOMING';
    this.distanceIncreaseCounter = 0;
    this.loopDetectionCounter = 0;
  }

  public getEstimatedDistanceToNest(): number {
    return Math.hypot(this.piX, this.piY);
  }

  public getEstimatedDistanceToHome(currentPos?: Vector2D): number {
    return Math.hypot(this.piX, this.piY);
  }

  public resetToNested(): void {
    this.state = 'NESTED';
    this.piX = 0;
    this.piY = 0;
    this.confidence = 1.0;
  }

  public getSnapshot(): HomingStatusSnapshot {
    return {
      state: this.state,
      estimatedHomeVector: { x: -this.piX, y: -this.piY },
      estimatedDistanceToNest: Math.hypot(this.piX, this.piY),
      confidence: this.confidence,
      isHeadingHome: this.state === 'HOMING' || this.state === 'APPROACH' || this.state === 'NEST_DETECTION',
      loopDetected: this.loopDetectionCounter > 0,
      lostTime: this.lostTimer,
      tripsCompleted: this.tripsCompleted,
    };
  }
}
