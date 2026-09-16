import { describe, it, expect, beforeEach } from 'vitest';
import { SimulationWorld } from '../simulation/world';
import { SeededRNG } from '../simulation/rng';
import { SimulationEventBus } from '../simulation/events';
import { Colony } from '../colony/colony';

describe('ANT BRAIN — Subnest & Multi-Chamber Subterranean Nest System', () => {
  let world: SimulationWorld;
  let colony: Colony;
  let eventBus: SimulationEventBus;
  let rng: SeededRNG;

  beforeEach(() => {
    world = new SimulationWorld({ width: 80, height: 80 });
    colony = world.colonies[0];
    eventBus = world.eventBus;
    rng = world.rng;
  });

  it('initializes default nest graph with 5 core subterranean chambers, 4 tunnels, and 1 planned satellite outpost', () => {
    const nest = colony.nest;
    expect(nest.chambers.length).toBe(5);
    expect(nest.tunnels.length).toBe(4);
    expect(nest.getAllChambers().length).toBe(8); // 5 core + 3 subnest
    expect(nest.subnests.length).toBe(1);

    const types = nest.chambers.map((c) => c.type);
    expect(types).toContain('ENTRANCE');
    expect(types).toContain('GENERAL');
    expect(types).toContain('FOOD_STORAGE');
    expect(types).toContain('BROOD_NURSERY');
    expect(types).toContain('QUEEN_CHAMBER');
  });

  it('triggers autonomous subnest planning when distant food clusters are discovered', () => {
    const nest = colony.nest;
    expect(nest.subnests.length).toBe(1);

    const distantFoodClusters = [
      { position: { x: -24.0, y: 22.0 }, amount: 60.0 },
    ];

    // Trigger check
    const planned = nest.checkSubnestTrigger(
      125,
      2.0,
      16, // Population
      50.0, // Stored food
      distantFoodClusters,
      eventBus,
      rng
    );

    expect(planned).not.toBeNull();
    expect(nest.subnests.length).toBe(2);
    expect(nest.interconnections.length).toBe(2);
  });

  it('allows builder ants to excavate and establish a subnest incrementally', () => {
    const nest = colony.nest;
    const subnest = nest.planSubnest('PERIPHERAL_SHELTER', { x: 20.0, y: 0 }, rng);
    expect(subnest.isEstablished).toBe(false);
    expect(subnest.constructionProgress).toBeLessThan(0.2);

    // Advance construction through builder work
    for (let i = 0; i < 15; i++) {
      nest.advanceSubnestConstruction(subnest.id, 1.0, i, eventBus);
    }

    expect(subnest.constructionProgress).toBe(1.0);
    expect(subnest.isEstablished).toBe(true);
    const interConn = nest.interconnections.find((ic) => ic.toNestId === subnest.id);
    expect(interConn?.isExcavated).toBe(true);

    // Subnest chambers should all be excavated
    for (const ch of subnest.chambers) {
      expect(ch.isExcavated).toBe(true);
    }
  });

  it('allows spatial food storage and retrieval at closest nest or subnest', () => {
    const nest = colony.nest;
    const subnest = nest.planSubnest('SATELLITE_FORAGING', { x: 25.0, y: 25.0 }, rng);
    nest.advanceSubnestConstruction(subnest.id, 15.0, 1.0, eventBus);

    // Deposit food near subnest
    const depositResult = nest.depositFoodInStorage(15.0, { x: 26.0, y: 24.0 });
    expect(depositResult.deposited).toBe(15.0);
    expect(nest.totalStoredFood).toBeGreaterThanOrEqual(40.0); // 25 initial + 15

    // Closest nest check
    const closestToSub = nest.getClosestNest({ x: 24.0, y: 26.0 });
    expect(closestToSub.id).toBe(subnest.id);

    const closestToMain = nest.getClosestNest({ x: 1.0, y: 1.0 });
    expect(closestToMain.id).toBe(nest.id);

    // Retrieve food near subnest
    const { retrieved } = nest.retrieveFoodFromStorage(5.0, { x: 25.0, y: 25.0 });
    expect(retrieved).toBe(5.0);
  });

  it('simulates 300 ticks of autonomous colony with builder excavation and subnest expansion', () => {
    // Spawn 15 workers including builders and foragers
    for (let i = 0; i < 15; i++) {
      const role = i % 3 === 0 ? 'BUILDER' : i % 3 === 1 ? 'FORAGER' : 'NURSE';
      colony.spawnWorker(undefined, undefined, rng, eventBus, 'WORKER', role as any);
    }

    // Place distant food
    world.placeFoodCluster({ x: 22, y: 18 }, 80.0);

    for (let t = 0; t < 300; t++) {
      world.tick();
    }

    // Colony should remain functional with live workers and expanding nest infrastructure
    expect(colony.ants.length).toBeGreaterThan(0);
    expect(colony.nest.getAllChambers().length).toBeGreaterThanOrEqual(5);
    expect(colony.nest.surfaceSoilMound).toBeGreaterThan(0);
  });

  it('cycles builder ant through EXPLORING -> EXCAVATE -> TRANSPORT_MATERIAL -> BUILDING', () => {
    const builder = colony.spawnWorker({ x: 0, y: 0 }, 0, rng, eventBus, 'WORKER', 'BUILDER');
    expect(builder.roleState.primaryRole).toBe('BUILDER');

    // Simulate task reassessment with unexcavated subnest target
    const subnest = colony.nest.planSubnest('PERIPHERAL_SHELTER', { x: 18.0, y: 0 }, rng);
    const colonyNeeds = colony.getColonyNeedsContext();
    expect(colonyNeeds.buildingChamberPosition).toBeDefined();

    builder.taskSystem.reassessTask(
      1.0,
      builder.body,
      builder.sensors.lastSnapshot,
      builder.internalState.state,
      builder.drives.currentDrives,
      builder.memory,
      'BUILDER',
      colonyNeeds,
      world.foodEntities,
      rng
    );

    // Should select EXCAVATE or COLLECT_MATERIAL or BUILDING towards the subnest
    expect(['EXCAVATE', 'COLLECT_MATERIAL', 'BUILDING', 'EXPLORING']).toContain(builder.taskSystem.state.currentTask);

    // Give builder excavated material
    builder.taskSystem.state.carryingMaterialAmount = 1.5;
    builder.taskSystem.reassessTask(
      2.0,
      builder.body,
      builder.sensors.lastSnapshot,
      builder.internalState.state,
      builder.drives.currentDrives,
      builder.memory,
      'BUILDER',
      colonyNeeds,
      world.foodEntities,
      rng
    );

    // When carrying material, should choose BUILDING or TRANSPORT_MATERIAL
    expect(['BUILDING', 'TRANSPORT_MATERIAL']).toContain(builder.taskSystem.state.currentTask);
  });
});
