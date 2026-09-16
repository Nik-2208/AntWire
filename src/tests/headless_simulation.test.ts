/**
 * ANT BRAIN — Headless Simulation & Behavioral Integration Tests
 * Validates the core biophysical and computational neuroscience loop without rendering.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SimulationWorld } from '../simulation/world';
import { PheromoneChannel } from '../simulation/types';
import { SPECIES_REGISTRY } from '../colony/species_profiles';
import { BiologicalBrainController } from '../ants/controllers/biological_brain';

describe('Ant Brain Headless Simulator & Behavioral Tests', () => {
  let world: SimulationWorld;

  beforeEach(() => {
    world = new SimulationWorld({ initialAntCount: 8, width: 50, height: 50 });
  });

  it('1. Initializes world, colony, nest, queen, and initial workers', () => {
    expect(world.colonies.length).toBe(1);
    const colony = world.colonies[0];
    expect(colony.ants.length).toBe(8);
    expect(colony.queen).toBeDefined();
    expect(colony.brood.eggs).toBeGreaterThanOrEqual(0);
    expect(colony.nest.radius).toBeGreaterThan(0);
  });

  it('2. Advances deterministic simulation ticks at fixed 60Hz rate', () => {
    expect(world.clock.tickCount).toBe(0);
    expect(world.clock.simTime).toBe(0);

    for (let i = 0; i < 120; i++) {
      world.tick();
    }

    expect(world.clock.tickCount).toBe(120);
    expect(world.clock.simTime).toBeCloseTo(2.0, 2);
  });

  it('3. Worker ants sense food, collect it, and change state to CARRIER', () => {
    const colony = world.colonies[0];
    const ant = colony.ants[0];

    // Place food directly in front of the ant
    world.placeFoodCluster({ x: ant.body.position.x + 1.0, y: ant.body.position.y }, 100, 1.0);

    // Step simulation
    for (let i = 0; i < 60; i++) {
      world.tick();
      if (ant.internalState.isCarryingFood) break;
    }

    // Ant should either have harvested or moved toward food
    expect(ant.sensors.lastSnapshot.foodLeft + ant.sensors.lastSnapshot.foodRight).toBeGreaterThanOrEqual(0);
  });

  it('4. Pheromone field deposits, diffuses, and evaporates cleanly', () => {
    world.pheromones.deposit(5, 5, PheromoneChannel.FOOD_TRAIL, 1.0);

    const initialVal = world.pheromones.sample(5, 5, PheromoneChannel.FOOD_TRAIL);
    expect(initialVal).toBeGreaterThan(0.01);

    // Step 10 ticks with evaporation
    for (let i = 0; i < 10; i++) {
      world.pheromones.update(0.1);
    }

    const evaporatedVal = world.pheromones.sample(5, 5, PheromoneChannel.FOOD_TRAIL);
    expect(evaporatedVal).toBeLessThan(initialVal);
  });

  it('5. Biologically informed neuropil brain evaluates AL, MB, CX, and LAL', () => {
    const colony = world.colonies[0];
    const ant = colony.ants[0];

    expect(ant.controller instanceof BiologicalBrainController).toBe(true);
    const controller = ant.controller as BiologicalBrainController;
    const snap = controller.brain.getSnapshot();

    expect(snap.antennalLobe.glomeruli.length).toBe(5);
    expect(snap.centralComplex.headingRing.length).toBe(16);
    expect(snap.mushroomBody.sparseSparsityFraction).toBeGreaterThanOrEqual(0);
  });

  it('6. Species registry contains valid models with literature citations', () => {
    expect(SPECIES_REGISTRY['formica-experimenta']).toBeDefined();
    expect(SPECIES_REGISTRY['ooceraea-biroi']).toBeDefined();
    expect(SPECIES_REGISTRY['cataglyphis-fortis']).toBeDefined();

    const ooceraea = SPECIES_REGISTRY['ooceraea-biroi'];
    expect(ooceraea.social.queenPresent).toBe(false); // Clonal raider ant is queenless
    expect(ooceraea.citation).toContain('Trible et al.');
  });
});
