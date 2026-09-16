/**
 * ANT BRAIN — Automated Simulation Test Suite
 * Tests physical kinematics, chemical diffusion, sensory raycasts, foraging loop, and determinism.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SimulationWorld } from '../simulation/world';
import { SeededRNG } from '../simulation/rng';
import { PheromoneField } from '../pheromones/field';
import { PheromoneChannel } from '../simulation/types';

describe('ANT BRAIN Simulation Engine', () => {
  let world: SimulationWorld;

  beforeEach(() => {
    world = new SimulationWorld({ seed: 42, initialAntCount: 1 });
  });

  it('maintains perfect determinism given identical random seeds', () => {
    const rng1 = new SeededRNG(99999);
    const rng2 = new SeededRNG(99999);

    const values1 = [rng1.next(), rng1.range(10, 50), rng1.gaussian(0, 1)];
    const values2 = [rng2.next(), rng2.range(10, 50), rng2.gaussian(0, 1)];

    expect(values1).toEqual(values2);
  });

  it('performs chemical deposition, exponential evaporation, and diffusion in pheromone field', () => {
    const field = new PheromoneField({ worldWidth: 50, worldHeight: 50, resolution: 50 });

    // Deposit chemical at (0, 0)
    field.deposit(0, 0, PheromoneChannel.FOOD_TRAIL, 5.0);
    const initialConc = field.sample(0, 0, PheromoneChannel.FOOD_TRAIL);
    expect(initialConc).toBeGreaterThan(0.1);

    // Simulate 2 seconds of decay and diffusion
    for (let i = 0; i < 120; i++) {
      field.update(1 / 60);
    }

    const decayedConc = field.sample(0, 0, PheromoneChannel.FOOD_TRAIL);
    expect(decayedConc).toBeLessThan(initialConc);

    // Neighboring cell should now have received diffused chemical
    const neighborConc = field.sample(1.0, 0, PheromoneChannel.FOOD_TRAIL);
    expect(neighborConc).toBeGreaterThan(0);
  });

  it('updates ant metabolism and energy burn over time', () => {
    const colony = world.colonies[0];
    const ant = colony.ants[0];

    const initialEnergy = ant.internalState.state.energy;
    expect(initialEnergy).toBe(1.0);

    // Run 100 simulation ticks
    for (let i = 0; i < 100; i++) {
      world.tick();
    }

    expect(ant.internalState.state.energy).toBeLessThan(initialEnergy);
    expect(ant.internalState.state.hunger).toBeGreaterThan(0);
  });

  it('executes food harvest and nest delivery foraging cycle', () => {
    const colony = world.colonies[0];
    const ant = colony.ants[0];

    // Place food directly in front of ant
    world.foodEntities = [];
    ant.body.heading = 0;
    const food = world.placeFoodCluster({ x: ant.body.position.x + 1.0, y: ant.body.position.y }, 10, 1.0);

    // Run ticks until ant reaches and collects food
    let harvested = false;
    for (let i = 0; i < 300; i++) {
      world.tick();
      if (ant.internalState.state.carryingFoodAmount > 0 || colony.totalFoodHarvested > 0) {
        harvested = true;
        break;
      }
    }

    expect(harvested).toBe(true);
    expect(food.amount).toBeLessThan(10);
  });

  it('stimulates Queen egg laying when supplied with colony food', () => {
    const colony = world.colonies[0];
    colony.foodStore = 50.0; // Ample nutrition

    const initialEggs = colony.queen.metrics.totalEggsLaid;

    // Simulate 1500 ticks (~25s)
    for (let i = 0; i < 1500; i++) {
      world.tick();
    }

    expect(colony.queen.metrics.totalEggsLaid).toBeGreaterThanOrEqual(initialEggs + 1);
    expect(colony.brood.broodList.length).toBeGreaterThan(0);
  });

  it('senses predator proximity and enters emergency flee response', () => {
    const colony = world.colonies[0];
    const ant = colony.ants[0];

    // Spawn predator near ant
    world.predators = [];
    world.spawnPredator({ x: ant.body.position.x + 4.0, y: ant.body.position.y });

    world.tick();

    expect(ant.sensors.lastSnapshot.predatorDetected).toBe(true);
    expect(ant.drives.currentDrives.threatAvoidance).toBeGreaterThan(0.3);
  });
});
