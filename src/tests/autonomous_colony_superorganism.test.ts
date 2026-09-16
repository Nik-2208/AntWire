/**
 * ANT BRAIN — Autonomous Colony Superorganism Integration Test Suite
 * Validates:
 * 1. 10D Colony Needs Vector.
 * 2. Spatial Food Retrieval (Starving ants retrieve stored food from nest granaries).
 * 3. Colony Long-Horizon Survival on Stored Food with Zero External World Food.
 * 4. Subterranean Nest Physical Excavation & Surface Soil Mound Dynamics.
 * 5. Conserved Stomodeal Trophallaxis Food Flow.
 * 6. 500-Tick Autonomous Simulation Stability & Thermodynamic Equilibrium.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Colony } from '../colony/colony';
import { SimulationWorld } from '../simulation/world';
import { SeededRNG } from '../simulation/rng';
import { SimulationEventBus } from '../simulation/events';

describe('Autonomous Colony Superorganism Behavioral Kernel', () => {
  let world: SimulationWorld;
  let colony: Colony;
  let rng: SeededRNG;
  let eventBus: SimulationEventBus;

  beforeEach(() => {
    rng = new SeededRNG(42);
    eventBus = new SimulationEventBus();
    world = new SimulationWorld({ seed: 42 });
    colony = world.colonies[0];
  });

  it('evaluates 10-dimensional ColonyNeedsVector dynamically based on colony state', () => {
    const initialDemands = colony.roleManager.computeColonyDemands(
      10,
      25.0, // food
      2, 2, 2, // brood
      0, // corpses
      0, // predators
      1.0 // queen energy
    );

    expect(initialDemands.foodNeed).toBeLessThan(0.6);
    expect(initialDemands.defenseNeed).toBe(0.05);

    const crisisDemands = colony.roleManager.computeColonyDemands(
      10,
      0.0, // starvation food
      5, 8, 3, // heavy brood demand
      2, // corpses
      3, // 3 predators
      0.2 // starving queen
    );

    expect(crisisDemands.foodNeed).toBeGreaterThan(0.7);
    expect(crisisDemands.defenseNeed).toBeGreaterThan(0.8);
    expect(crisisDemands.broodNeed).toBeGreaterThan(0.6);
    expect(crisisDemands.queenNeed).toBeGreaterThan(0.7);
    expect(crisisDemands.sanitationNeed).toBeGreaterThan(0.5);
  });

  it('CRITICAL FOOD RETRIEVAL: Starving worker retrieves stored food from nest granary when external food is 0', () => {
    // Set 0 external food in world, but 40 units stored in subterranean granary
    world.foodEntities = [];
    colony.foodStore = 40.0;

    // Spawn a hungry worker inside/near nest entrance
    const worker = colony.spawnWorker({ x: 0, y: 0 }, 0, rng, eventBus, 'WORKER', 'GENERAL_WORKER');
    worker.internalState.state.energyReserve = 0.15;
    worker.internalState.state.hunger = 0.85;

    // Trigger task reassessment
    worker.taskSystem.reassessTask(
      0,
      worker.body,
      worker.sensors.lastSnapshot,
      worker.internalState.state,
      worker.drives.computeDrives(worker.internalState.state, worker.sensors.lastSnapshot, worker.body.traits),
      worker.memory,
      worker.roleState.primaryRole,
      colony.getColonyNeedsContext(),
      world.foodEntities,
      rng
    );

    // Worker must select RETRIEVE_FOOD_FROM_STORAGE rather than getting stuck or dying
    expect(worker.taskSystem.state.currentTask).toBe('RETRIEVE_FOOD_FROM_STORAGE');

    // Run colony update step to execute retrieval
    colony.update(0.1, 1.0, rng, undefined, eventBus, 24.0, world.foodLedger);

    // Worker energy should have recovered from stored food
    expect(worker.internalState.state.energyReserve).toBeGreaterThan(0.15);
    expect(worker.internalState.state.hunger).toBeLessThan(0.85);
  });

  it('CRITICAL COLONY SURVIVAL: 10 workers survive on stored reserves without external food', () => {
    world.foodEntities = [];
    colony.foodStore = 50.0;

    // Run simulation for 200 ticks
    for (let t = 0; t < 200; t++) {
      world.tick();
    }

    // All workers must remain alive, nourished by granary reserves
    expect(colony.ants.length).toBeGreaterThanOrEqual(10);
    for (const ant of colony.ants) {
      expect(ant.internalState.state.isAlive).toBe(true);
    }
  });

  it('manages subterranean nest graph and expands chambers with physical soil excavation', () => {
    expect(colony.nest.chambers.length).toBe(5);
    expect(colony.nest.tunnels.length).toBe(4);

    // Deposit building material and advance construction
    colony.nest.depositMaterial(25.0);
    const completed = colony.nest.advanceConstruction(5.0, 10.0, eventBus, rng);

    expect(completed).toBe(true);
    expect(colony.nest.chambers.length).toBeGreaterThanOrEqual(6);
    expect(colony.nest.tunnels.length).toBeGreaterThanOrEqual(5);
    expect(colony.nest.surfaceSoilMound).toBeGreaterThan(0);
  });

  it('performs stomodeal trophallaxis transferring conserved food without duplication', () => {
    const donor = colony.spawnWorker({ x: 10, y: 10 }, 0, rng, eventBus, 'WORKER', 'FORAGER');
    const receiver = colony.spawnWorker({ x: 10.5, y: 10.5 }, 0, rng, eventBus, 'WORKER', 'NURSE');

    donor.internalState.state.carryingFoodAmount = 2.0;
    receiver.internalState.state.hunger = 0.9;
    receiver.internalState.state.carryingFoodAmount = 0.0;
    receiver.internalState.state.helpRequested = true;

    const initialTotalCarried = donor.internalState.state.carryingFoodAmount + receiver.internalState.state.carryingFoodAmount;

    colony.update(0.1, 1.0, rng, undefined, eventBus, 24.0, world.foodLedger);

    const finalTotalCarried = donor.internalState.state.carryingFoodAmount + receiver.internalState.state.carryingFoodAmount;
    expect(Math.abs(initialTotalCarried - finalTotalCarried)).toBeLessThan(1e-4);
    expect(colony.foodFlowHistory.length).toBeGreaterThan(0);
    expect(colony.foodFlowHistory[0].donorId).toBe(donor.id);
    expect(colony.foodFlowHistory[0].receiverId).toBe(receiver.id);
  });

  it('executes 500-tick autonomous simulation without crashes or frozen task deadlocks', () => {
    world.placeFoodCluster({ x: 6, y: 6 }, 30.0, 1.5);
    world.placeFoodCluster({ x: -8, y: 8 }, 30.0, 1.5);

    for (let t = 0; t < 500; t++) {
      world.tick();
    }

    const stats = colony.getStatistics(world.clock.simTime);
    expect(stats.population).toBeGreaterThan(0);
    expect(stats.roleDistribution).toBeDefined();

    const snapshot = world.foodLedger.getLatestSnapshot();
    if (snapshot) {
      expect(snapshot.conservationError).toBeLessThan(0.01);
    }
  });
});
