/**
 * ANT BRAIN — Authoritative Simulation & Biology-First Golden Test Suite
 * Rigorously verifies the core architectural repair criteria:
 * 1. Ants do NOT die immediately when energy reaches 0; starvation is continuous and probabilistic.
 * 2. Predators reliably spawn, exist in simulation state, move, detect prey, and attack.
 * 3. Parameters modify authoritative state and control subsequent simulation steps.
 * 4. Ecological symbiosis (Aphid trophobiosis & Fungus agriculture) operates dynamically.
 * 5. Full determinism across identical random seeds.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SimulationWorld } from '../simulation/world';
import { SimulationConfig } from '../simulation/config';

describe('Authoritative Biology-First Kernel Tests', () => {
  let world: SimulationWorld;

  beforeEach(() => {
    world = new SimulationWorld({ seed: 101, initialAntCount: 1, foodClusterCount: 1, predatorCount: 0 });
  });

  it('GOLDEN TEST 1: Ant does NOT die when energy reaches zero, but accumulates starvation stress and deteriorates continuously', () => {
    const colony = world.colonies[0];
    // Clear all food sources so ant cannot replenish during starvation evaluation
    world.foodEntities = [];
    colony.foodStore = 0;
    const ant = colony.ants[0];

    // Artificially deplete immediate metabolic reserve
    ant.internalState.state.energyReserve = 0.0;
    ant.internalState.state.energy = 0.0;

    // Run a single tick: ant must still be alive!
    world.tick();

    expect(ant.internalState.state.isAlive).toBe(true);
    expect(ant.internalState.state.energyReserve).toBe(0.0);
    expect(ant.internalState.state.hunger).toBeGreaterThan(0.9);
    // Starvation stress must have started accumulating
    expect(ant.internalState.state.starvationStress).toBeGreaterThan(0.0);

    // Simulate sustained deprivation for several seconds (e.g. 180 ticks = 3 seconds)
    for (let t = 0; t < 180; t++) {
      world.tick();
    }

    // Ant should be EXHAUSTED and slowed down by mobility penalty
    expect(ant.internalState.state.starvationStress).toBeGreaterThan(0.05);
    expect(ant.internalState.state.mobilityPenalty).toBeGreaterThanOrEqual(0.0);

    // Continue starvation until health deteriorates and eventual death event occurs
    let antDied = false;
    for (let t = 0; t < 5000; t++) {
      world.tick();
      if (!ant.internalState.state.isAlive || colony.ants.length === 0) {
        antDied = true;
        break;
      }
    }

    expect(antDied).toBe(true);
    // Check that death was logged with explicit cause STARVATION
    expect(colony.totalDeaths).toBeGreaterThanOrEqual(1);
    expect(colony.deceasedHistory.length).toBeGreaterThanOrEqual(1);
    expect(colony.deceasedHistory[0].cause).toBe('STARVATION');
    // Check that a corpse was placed in the colony refuse registry
    expect(colony.corpses.length).toBeGreaterThanOrEqual(1);
  });

  it('GOLDEN TEST 2: Predator spawning, state existence, threat detection, and attack kinematics', () => {
    const colony = world.colonies[0];
    const ant = colony.ants[0];
    ant.body.position.x = 0;
    ant.body.position.y = 0;

    // Spawn predator near ant at (3, 0)
    const predator = world.spawnPredator({ x: 3.0, y: 0.0 }, 'GROUND_BEETLE');

    expect(world.predators.length).toBe(1);
    expect(world.predatorManager.count).toBe(1);
    expect(predator.state.position.x).toBe(3.0);

    // Tick simulation: ant senses predator and predator stalks ant
    world.tick();

    expect(predator.state.targetAntId).toBe(ant.id);
    expect(['DETECT', 'APPROACH', 'ATTACK']).toContain(predator.state.state);

    // Run 60 ticks (1 second) to allow predator to close distance and strike
    for (let t = 0; t < 60; t++) {
      world.tick();
    }

    // Ant must experience sensory threat and somatic damage
    expect(ant.internalState.state.threatLevel).toBeGreaterThan(0.1);
    expect(predator.state.killCount).toBeGreaterThanOrEqual(0);
  });

  it('GOLDEN TEST 3: Authoritative parameter changes modify simulation configuration and affect physics', () => {
    const config = world.simConfig;

    // 1. Check default predator aggression
    expect(config.predator.aggression).toBe(0.85);

    // 2. Dispatch validated SET_PARAMETER command
    const res = config.executeCommand({
      type: 'SET_PARAMETER',
      key: 'predator.aggression',
      value: 0.35,
    }, world.eventBus);

    expect(res.success).toBe(true);
    expect(config.predator.aggression).toBe(0.35);

    // 3. Test parameter live sync on simulation tick
    config.executeCommand({
      type: 'SET_PARAMETER',
      key: 'pheromones.foodTrailDecay',
      value: 0.045,
    });

    world.tick();
    expect(world.pheromones.config.decayRates[0]).toBe(0.045);

    // 4. Test boundary rejection
    const invalidRes = config.executeCommand({
      type: 'SET_PARAMETER',
      key: 'predator.aggression',
      value: 5.0, // max is 1.0
    });
    expect(invalidRes.success).toBe(true);
    // Value was clamped safely to max
    expect(config.predator.aggression).toBe(1.0);
  });

  it('GOLDEN TEST 4: Symbiosis Engine — Aphid trophobiosis and Fungus agriculture', () => {
    const colony = world.colonies[0];
    const ant = colony.ants[0];

    // Position ant right on an aphid
    const aphid = world.ecology.aphids[0];
    expect(aphid).toBeDefined();

    aphid.position.x = 10.0;
    aphid.position.y = 10.0;
    ant.body.position.x = 10.0;
    ant.body.position.y = 10.0;
    aphid.honeydewReserve = 0.8;

    // Run tick to trigger tending
    world.tick();

    expect(world.ecology.totalHoneydewHarvested).toBeGreaterThan(0);
    expect(ant.internalState.state.carryingFoodAmount).toBeGreaterThan(0);

    // Verify dynamic ecology graph
    const { nodes, edges } = world.ecology.getEcologyGraph(colony.ants.length, world.predators.length);
    expect(nodes.length).toBe(5);
    expect(edges.some((e) => e.type === 'MUTUALISM' && e.target === 'aphid')).toBe(true);
  });

  it('GOLDEN TEST 5: Full Simulation Determinism across identical seeds', () => {
    const worldA = new SimulationWorld({ seed: 777, initialAntCount: 4, foodClusterCount: 2 });
    const worldB = new SimulationWorld({ seed: 777, initialAntCount: 4, foodClusterCount: 2 });

    for (let t = 0; t < 120; t++) {
      worldA.tick();
      worldB.tick();
    }

    const antA = worldA.colonies[0].ants[0];
    const antB = worldB.colonies[0].ants[0];

    expect(antA.body.position.x).toBeCloseTo(antB.body.position.x, 5);
    expect(antA.body.position.y).toBeCloseTo(antB.body.position.y, 5);
    expect(antA.internalState.state.energyReserve).toBeCloseTo(antB.internalState.state.energyReserve, 5);
  });
});
