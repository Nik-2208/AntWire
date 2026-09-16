/**
 * ANT BRAIN — Predatory Arthropod Entity
 * Autonomous predator with behavioral state machine:
 * SEARCH -> DETECT -> APPROACH -> ATTACK -> FEED -> RETREAT -> WANDER
 */

import { Ant } from '../ants/ant';
import { PredatorBehaviorState, PredatorProfile, PredatorState, PredatorType, Vector2D } from '../simulation/types';
import { SeededRNG } from '../simulation/rng';
import { SimulationConfig } from '../simulation/config';
import { SimulationEventBus } from '../simulation/events';

export const PREDATOR_PROFILES: Record<PredatorType, PredatorProfile> = {
  GROUND_BEETLE: {
    type: 'GROUND_BEETLE',
    name: 'Carabid Ground Beetle',
    patrolSpeed: 2.5,
    chaseSpeed: 4.8,
    detectionRadius: 13.0,
    attackRadius: 1.4,
    attackDamage: 0.5,
    aggression: 0.85,
    attackCooldownTime: 1.2,
    radius: 1.1,
    color: '#ef4444', // Crimson red
  },
  WOLF_SPIDER: {
    type: 'WOLF_SPIDER',
    name: 'Lycosid Wolf Spider',
    patrolSpeed: 2.8,
    chaseSpeed: 5.6,
    detectionRadius: 16.0,
    attackRadius: 1.6,
    attackDamage: 0.7,
    aggression: 0.95,
    attackCooldownTime: 1.5,
    radius: 1.3,
    color: '#f97316', // Orange
  },
  PRAYING_MANTIS: {
    type: 'PRAYING_MANTIS',
    name: 'Ambush Mantis',
    patrolSpeed: 1.6,
    chaseSpeed: 5.2,
    detectionRadius: 14.0,
    attackRadius: 2.0,
    attackDamage: 0.9,
    aggression: 0.9,
    attackCooldownTime: 2.0,
    radius: 1.4,
    color: '#84cc16', // Lime
  },
  ARTHROPOD_HUNTER: {
    type: 'ARTHROPOD_HUNTER',
    name: 'Centipede Hunter',
    patrolSpeed: 3.2,
    chaseSpeed: 5.0,
    detectionRadius: 12.0,
    attackRadius: 1.5,
    attackDamage: 0.4,
    aggression: 0.8,
    attackCooldownTime: 0.8,
    radius: 1.2,
    color: '#a855f7', // Purple
  },
};

export class Predator {
  public state: PredatorState;
  public profile: PredatorProfile;
  private wanderTimer: number = 0;

  constructor(
    id: string,
    initialPos: Vector2D,
    initialHeading = 0,
    type: PredatorType = 'GROUND_BEETLE'
  ) {
    this.profile = { ...PREDATOR_PROFILES[type] };
    this.state = {
      id,
      type,
      position: { ...initialPos },
      heading: initialHeading,
      speed: this.profile.patrolSpeed,
      health: 1.0,
      targetAntId: null,
      state: 'SEARCH',
      killCount: 0,
      attackCooldown: 0,
      feedTimer: 0,
    };
  }

  public get id(): string {
    return this.state.id;
  }

  public get radius(): number {
    return this.profile.radius;
  }

  public takeDamage(amount: number): void {
    if (amount > 0) {
      this.state.health = Math.max(0, this.state.health - amount);
    }
  }

  public update(
    dt: number,
    ants: Ant[],
    rng: SeededRNG,
    worldHalfW: number,
    worldHalfH: number,
    config?: SimulationConfig,
    eventBus?: SimulationEventBus
  ): void {
    // Read authoritative live configuration overrides
    const cfg = config || SimulationConfig.instance;
    if (cfg) {
      this.profile.aggression = cfg.predator.aggression;
      this.profile.patrolSpeed = cfg.predator.patrolSpeed;
      this.profile.chaseSpeed = cfg.predator.chaseSpeed;
      this.profile.detectionRadius = cfg.predator.detectionRadius;
      this.profile.attackRadius = cfg.predator.attackRadius;
    }

    if (this.state.attackCooldown > 0) {
      this.state.attackCooldown = Math.max(0, this.state.attackCooldown - dt);
    }

    // 1. Feeding State handling
    if (this.state.state === 'FEED') {
      this.state.feedTimer -= dt;
      this.state.speed = 0;
      if (this.state.feedTimer <= 0) {
        this.state.state = 'WANDER';
        this.state.targetAntId = null;
      }
      return;
    }

    // 2. Scan for nearest active ant
    let nearestAnt: Ant | null = null;
    const effectiveDetectionDist = this.profile.detectionRadius * Math.max(0.3, this.profile.aggression);
    let nearestDist = effectiveDetectionDist;

    for (let i = 0; i < ants.length; i++) {
      const ant = ants[i];
      if (!ant.internalState.state.isAlive) continue;

      const dx = ant.body.position.x - this.state.position.x;
      const dy = ant.body.position.y - this.state.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < nearestDist) {
        nearestDist = dist;
        nearestAnt = ant;
      }
    }

    // 3. Behavioral State Machine
    if (nearestAnt) {
      this.state.targetAntId = nearestAnt.id;
      const dx = nearestAnt.body.position.x - this.state.position.x;
      const dy = nearestAnt.body.position.y - this.state.position.y;
      const targetAngle = Math.atan2(dy, dx);

      // Smooth steering toward prey
      let angleDiff = targetAngle - this.state.heading;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

      this.state.heading += angleDiff * Math.min(1.0, dt * 6.0);

      if (nearestDist <= this.profile.attackRadius) {
        // Strike / Attack
        this.state.state = 'ATTACK';
        this.state.speed = this.profile.chaseSpeed * 1.3;

        if (this.state.attackCooldown <= 0) {
          this.state.attackCooldown = this.profile.attackCooldownTime;
          const dmg = this.profile.attackDamage;
          nearestAnt.internalState.takeDamage(dmg, 'PREDATOR');

          if (eventBus) {
            eventBus.emit({
              type: 'PREDATOR_ATTACK',
              timestamp: performance.now() / 1000,
              entityId: this.state.id,
              data: {
                predatorId: this.state.id,
                targetAntId: nearestAnt.id,
                damage: dmg,
                targetAlive: nearestAnt.internalState.state.isAlive,
                position: { ...this.state.position },
              },
            });
          }

          if (!nearestAnt.internalState.state.isAlive) {
            this.state.killCount++;
            this.state.state = 'FEED';
            this.state.feedTimer = 3.0; // Consume prey for 3 seconds
            return;
          }
        }
      } else if (nearestDist <= this.profile.detectionRadius * 0.6) {
        // Approach / Sprint
        this.state.state = 'APPROACH';
        this.state.speed = this.profile.chaseSpeed;
      } else {
        // Detect / Stalk
        this.state.state = 'DETECT';
        this.state.speed = this.profile.patrolSpeed * 1.3;
      }
    } else {
      // 4. Searching / Wandering
      this.state.targetAntId = null;
      this.state.speed = this.profile.patrolSpeed;
      this.state.state = 'SEARCH';

      this.wanderTimer -= dt;
      if (this.wanderTimer <= 0) {
        this.wanderTimer = rng.range(2.0, 5.0);
        this.state.heading += rng.range(-0.9, 0.9);
      }
    }

    // 5. Kinematic integration
    this.state.position.x += Math.cos(this.state.heading) * this.state.speed * dt;
    this.state.position.y += Math.sin(this.state.heading) * this.state.speed * dt;

    // 6. World boundary containment
    const boundW = worldHalfW - this.profile.radius - 1.0;
    const boundH = worldHalfH - this.profile.radius - 1.0;

    if (this.state.position.x < -boundW) {
      this.state.position.x = -boundW;
      this.state.heading = Math.PI - this.state.heading;
    } else if (this.state.position.x > boundW) {
      this.state.position.x = boundW;
      this.state.heading = Math.PI - this.state.heading;
    }

    if (this.state.position.y < -boundH) {
      this.state.position.y = -boundH;
      this.state.heading = -this.state.heading;
    } else if (this.state.position.y > boundH) {
      this.state.position.y = boundH;
      this.state.heading = -this.state.heading;
    }
  }
}
