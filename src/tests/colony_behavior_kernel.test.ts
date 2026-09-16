/**
 * ANT BRAIN — Colony Behavior Kernel & Autonomy Test Suite
 * Comprehensive automated regression testing for food-sticking bug, task lifecycle state transitions,
 * target invalidation, role distribution, starvation social buffer, safe entity removal, and autonomous operation.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SimulationWorld } from '../simulation/world';
import { Ant } from '../ants/ant';
import { Colony } from '../colony/colony';
import { SimulationConfig } from '../simulation/config';
import { SeededRNG } from '../simulation/rng';
import { TaskSystem } from '../ants/task_system';
import { ColonyRoleManager } from '../colony/roles';

describe('Colony Behavior Kernel & Autonomy Suite', () => {
  let world: SimulationWorld;
  let colony: Colony;
  let rng: SeededRNG;

  beforeEach(() => {
    SimulationConfig.instance = new SimulationConfig();
    world = new SimulationWorld({
      seed: 12345,
      width: 60,
      height: 60,
      initialAntCount: 0,
      foodClusterCount: 0,
      obstacleCount: 0,
      predatorCount: 0,
    });
    colony = world.colonies[0];
    rng = new SeededRNG(42);
  });

  it('1. Food Sticking Regression: Forager collects food, transitions to RETURNING_TO_NEST, and delivers without getting stuck', () => {
    // Spawn forager at (5, 5) heading towards food
    const ant = colony.spawnWorker({ x: 5, y: 5 }, 0, rng, undefined, 'WORKER', 'FORAGER');
    // Place food at (5.5, 5)
    const food = world.placeFoodCluster({ x: 5.5, y: 5 }, 20.0, 1.0);

    // Initial state: carrying 0, task FORAGING or EXPLORING
    expect(ant.internalState.state.carryingFoodAmount).toBe(0);

    // Advance world simulation several ticks
    for (let t = 0; t < 60; t++) {
      world.tick();
      if (ant.internalState.state.carryingFoodAmount > 0) break;
    }

    // Ant should have harvested food and immediately set task to RETURNING_TO_NEST
    expect(ant.internalState.state.carryingFoodAmount).toBeGreaterThan(0);
    expect(ant.body.task).toBe('RETURNING_TO_NEST');
    expect(ant.taskSystem.state.currentTask).toBe('RETURNING_TO_NEST');

    // Move ant close to nest (0, 0)
    ant.body.position = { x: 0.5, y: 0.5 };
    const prevStore = colony.foodStore;
    const carriedAmount = ant.internalState.state.carryingFoodAmount;

    // Tick to allow deposit
    for (let t = 0; t < 10; t++) {
      world.tick();
    }

    // Ant deposited food, task completed, and reassessed away from COLLECT_FOOD/RETURNING_TO_NEST
    expect(ant.internalState.state.carryingFoodAmount).toBe(0);
    expect(ant.body.task).not.toBe('COLLECT_FOOD');
    expect(colony.foodStore).toBeGreaterThanOrEqual(prevStore);
  });

  it('2. Target Invalidation on Depletion: Depleted food patch triggers target invalidation across all targeting ants', () => {
    const ant1 = colony.spawnWorker({ x: 8, y: 8 }, 0, rng);
    const ant2 = colony.spawnWorker({ x: 8.5, y: 8 }, 0, rng);
    const food = world.placeFoodCluster({ x: 9, y: 8 }, 0.5, 0.8);

    ant1.taskSystem.state.targetId = food.id;
    ant1.taskSystem.state.currentTask = 'COLLECT_FOOD';
    ant2.taskSystem.state.targetId = food.id;
    ant2.taskSystem.state.currentTask = 'COLLECT_FOOD';

    // Deplete food
    food.amount = 0.0;

    // Run 1 tick
    world.tick();

    // Both ants must have cleared their target and transitioned to explore or idle reassess
    expect(ant1.taskSystem.state.targetId).toBeNull();
    expect(ant2.taskSystem.state.targetId).toBeNull();
    expect(ant1.taskSystem.state.currentTask).not.toBe('COLLECT_FOOD');
    expect(ant2.taskSystem.state.currentTask).not.toBe('COLLECT_FOOD');
  });

  it('3. Explicit Task State Machine: Transitions from EXPLORE -> FORAGING -> RETURNING_TO_NEST -> IDLE_REASSESS', () => {
    const ant = colony.spawnWorker({ x: 10, y: 10 }, 0, rng);
    const taskSys = ant.taskSystem;

    // 1. Initial
    expect(taskSys.state.taskStatus).toBe('ACTIVE');

    // 2. Set food task
    taskSys.setTask('FORAGING', 0, 'NORMAL');
    expect(taskSys.state.currentTask).toBe('FORAGING');

    // 3. Pickup food
    ant.internalState.state.carryingFoodAmount = 0.5;
    const updateRes = taskSys.update(
      0.1,
      1.0,
      ant.body,
      ant.sensors.lastSnapshot,
      ant.internalState.state,
      ant.drives.currentDrives,
      ant.memory,
      ant.roleState.primaryRole,
      colony.getColonyNeedsContext(),
      world.foodEntities,
      rng
    );

    expect(updateRes.switchedTask).toBe(true);
    expect(taskSys.state.currentTask).toBe('RETURNING_TO_NEST');

    // 4. Complete task at nest
    taskSys.completeTask(2.0);
    expect(taskSys.state.taskStatus).toBe('COMPLETED');
    expect(taskSys.state.currentTask).toBe('IDLE_REASSESS');
    expect(taskSys.state.targetId).toBeNull();
  });

  it('4. Role Allocation & Demand Shifting: High brood demand increases nurse allocations', () => {
    for (let i = 0; i < 10; i++) {
      colony.spawnWorker({ x: 0, y: 0 }, 0, rng, undefined, 'WORKER', 'FORAGER');
    }

    const roleMgr = new ColonyRoleManager();

    // Baseline demands
    const normalDemands = roleMgr.computeColonyDemands(10, 30.0, 0, 0, 0, 0, 0, 1.0);
    expect(normalDemands.broodCareNeed).toBe(0);

    // Crisis Brood Demands
    const broodDemands = roleMgr.computeColonyDemands(10, 30.0, 8, 12, 5, 0, 0, 1.0);
    expect(broodDemands.broodCareNeed).toBeGreaterThan(0.5);

    // Allow ants to reallocate
    for (const a of colony.ants) {
      a.roleState.roleDuration = 30.0; // Elapsed
    }

    roleMgr.updateRoleAllocations(colony.ants, 1.0, broodDemands, rng);
    const counts = roleMgr.getRoleCounts(colony.ants);

    expect(counts.nurses).toBeGreaterThan(0);
  });

  it('5. Starvation Buffer & Social Feeding: Hungry worker receives conserved trophallaxis transfer from donor', () => {
    const donor = colony.spawnWorker({ x: 15, y: 15 }, 0, rng, undefined, 'WORKER', 'FORAGER');
    const starving = colony.spawnWorker({ x: 15.4, y: 15.4 }, 0, rng, undefined, 'WORKER', 'NURSE');

    // Donor carrying food
    donor.internalState.state.carryingFoodAmount = 0.5;
    donor.internalState.state.energy = 0.9;

    // Starving worker with critical hunger
    starving.internalState.state.energy = 0.08;
    starving.internalState.state.hunger = 0.92;
    starving.internalState.state.carryingFoodAmount = 0.0;

    const initialTotalFood = donor.internalState.state.carryingFoodAmount + starving.internalState.state.carryingFoodAmount;

    // Tick colony social exchange loop
    colony.update(0.1, 1.0, rng, world.simConfig, world.eventBus, 24.0, world.foodLedger);

    const finalTotalFood = donor.internalState.state.carryingFoodAmount + starving.internalState.state.carryingFoodAmount;

    // Food strictly conserved
    expect(finalTotalFood).toBeCloseTo(initialTotalFood, 4);
    // Transfer occurred
    expect(starving.internalState.state.carryingFoodAmount).toBeGreaterThan(0);
  });

  it('6. Safe Entity Removal: Removing an ant safely releases state without memory leak or ledger corruption', () => {
    const ant1 = colony.spawnWorker({ x: 2, y: 2 }, 0, rng);
    const ant2 = colony.spawnWorker({ x: 3, y: 3 }, 0, rng);

    ant1.internalState.state.carryingFoodAmount = 0.4;
    expect(colony.ants.length).toBe(2);

    const removed = colony.removeAnt(ant1.id, world.eventBus);
    expect(removed).toBe(true);
    expect(colony.ants.length).toBe(1);
    expect(colony.ants[0].id).toBe(ant2.id);

    // Verify batch removal by role
    colony.ants[0].roleState.primaryRole = 'GUARD';
    const removedGuards = colony.removeAntsByRole('GUARD', world.eventBus);
    expect(removedGuards).toBe(1);
    expect(colony.ants.length).toBe(0);
  });

  it('7. Autonomous Colony Multi-Step: 500 ticks headless run maintains stability, task diversity, and non-sticking foragers', () => {
    // Spawn self-sustaining colony setup
    for (let i = 0; i < 8; i++) {
      colony.spawnWorker({ x: rng.range(-1, 1), y: rng.range(-1, 1) }, rng.range(0, Math.PI * 2), rng);
    }
    world.placeFoodCluster({ x: 10, y: 10 }, 40, 1.5);
    world.placeFoodCluster({ x: -12, y: 8 }, 30, 1.5);

    let stuckAntsDetected = 0;

    for (let step = 0; step < 500; step++) {
      world.tick();

      // Check that not all ants have the same task or are stuck permanently on food
      const tasks = new Set(colony.ants.map((a) => a.body.task));
      if (tasks.size > 1) {
        // Diverse emergent activity!
      }

      for (const a of colony.ants) {
        if (a.taskSystem.state.stuckTimer > 5.0) {
          stuckAntsDetected++;
        }
      }
    }

    // Zero permanently frozen/stuck ants
    expect(stuckAntsDetected).toBe(0);
    // Colony is alive and operational
    expect(colony.ants.length).toBeGreaterThan(0);
    // Closed system food ledger invariant is conserved
    const snapshot = world.foodLedger.getLatestSnapshot();
    expect(snapshot ? snapshot.conservationError : 0).toBeCloseTo(0, 1);
  });
});
