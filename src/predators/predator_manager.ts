/**
 * ANT BRAIN — Predator Manager Subsystem
 * Authoritative lifecycle manager for ecological predators.
 * Controls spawning, removal, waves, and behavioral updates.
 */

import { Predator } from './predator';
import { PredatorType, Vector2D } from '../simulation/types';
import { SeededRNG } from '../simulation/rng';
import { Ant } from '../ants/ant';
import { SimulationConfig } from '../simulation/config';
import { SimulationEventBus } from '../simulation/events';

export class PredatorManager {
  public predators: Predator[] = [];
  private nextId = 1;

  public get count(): number {
    return this.predators.length;
  }

  public spawnPredator(
    pos: Vector2D,
    type: PredatorType = 'GROUND_BEETLE',
    heading?: number,
    eventBus?: SimulationEventBus
  ): Predator {
    const id = `predator-${this.nextId++}`;
    const h = heading !== undefined ? heading : Math.random() * Math.PI * 2;
    const pred = new Predator(id, pos, h, type);
    this.predators.push(pred);

    if (eventBus) {
      eventBus.emit({
        type: 'PREDATOR_SPAWNED',
        timestamp: performance.now() / 1000,
        entityId: id,
        data: {
          id,
          type,
          position: { ...pos },
          profile: pred.profile.name,
        },
      });
    }

    return pred;
  }

  public spawnAtPosition(pos: Vector2D, type: PredatorType = 'GROUND_BEETLE', eventBus?: SimulationEventBus): Predator {
    return this.spawnPredator(pos, type, undefined, eventBus);
  }

  public spawnRandomPredator(
    rng: SeededRNG,
    worldHalfW: number,
    worldHalfH: number,
    type?: PredatorType,
    eventBus?: SimulationEventBus
  ): Predator {
    const types: PredatorType[] = ['GROUND_BEETLE', 'WOLF_SPIDER', 'PRAYING_MANTIS', 'ARTHROPOD_HUNTER'];
    const chosenType = type || types[rng.int(0, types.length - 1)];

    // Spawn near the perimeter of the world
    const angle = rng.range(0, Math.PI * 2);
    const dist = rng.range(worldHalfW * 0.45, worldHalfW * 0.85);
    const pos: Vector2D = {
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
    };

    return this.spawnPredator(pos, chosenType, rng.range(0, Math.PI * 2), eventBus);
  }

  public spawnWave(
    count: number,
    rng: SeededRNG,
    worldHalfW: number,
    worldHalfH: number,
    eventBus?: SimulationEventBus
  ): Predator[] {
    const spawned: Predator[] = [];
    for (let i = 0; i < count; i++) {
      spawned.push(this.spawnRandomPredator(rng, worldHalfW, worldHalfH, undefined, eventBus));
    }
    return spawned;
  }

  public removePredator(id: string, eventBus?: SimulationEventBus): boolean {
    const index = this.predators.findIndex((p) => p.state.id === id);
    if (index !== -1) {
      const removed = this.predators.splice(index, 1)[0];
      if (eventBus) {
        eventBus.emit({
          type: 'PREDATOR_DIED',
          timestamp: performance.now() / 1000,
          entityId: id,
          data: {
            id,
            killCount: removed.state.killCount,
          },
        });
      }
      return true;
    }
    return false;
  }

  public removeOldest(eventBus?: SimulationEventBus): boolean {
    if (this.predators.length > 0) {
      return this.removePredator(this.predators[0].state.id, eventBus);
    }
    return false;
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
    for (let i = 0; i < this.predators.length; i++) {
      this.predators[i].update(dt, ants, rng, worldHalfW, worldHalfH, config, eventBus);
    }
  }

  public clear(): void {
    this.predators = [];
  }
}
