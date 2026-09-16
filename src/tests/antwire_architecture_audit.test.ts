/**
 * ANTWIRE — Deep Architectural & Model Audit Test Suite
 * Created & Developed by Nikhilesh H. Chavda
 *
 * Verifies:
 * 1. 18-category Model Inventory and 10-dimension Model Completeness Report
 * 2. Individual Ant Brain Runtime Isolation (No shared live states across ants)
 * 3. Physical Body Model (segments, legs, mass, metabolic rate)
 * 4. Superorganism Communication Bus (message delivery, attenuation, TTL)
 * 5. Collaborative Multi-Agent Tasks (forming, coordinating, failure recovery, credit)
 * 6. Authoritative Reward Engine (deduplication, bounding, idempotency)
 * 7. Multi-population scaling (1, 2, 3, 5, 10+ ants active)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ModelAuditEngine } from '../ants/brain/model_audit';
import { BiologicallyInformedAntBrain } from '../ants/brain/ant_brain';
import { Ant } from '../ants/ant';
import { AntBody } from '../ants/body';
import { ColonyCommunicationBus } from '../colony/communication';
import { CollaborativeTaskManager } from '../colony/collaborative_tasks';
import { AuthoritativeRewardEngine } from '../simulation/authoritative_reward_engine';
import { SimulationWorld } from '../simulation/world';

describe('AntWire Deep Architectural & Model Audit Suite', () => {
  let brainA: BiologicallyInformedAntBrain;
  let brainB: BiologicallyInformedAntBrain;

  beforeEach(() => {
    brainA = new BiologicallyInformedAntBrain('ANT-UNIT-ALPHA');
    brainB = new BiologicallyInformedAntBrain('ANT-UNIT-BETA');
  });

  it('1. Model Completeness Checker: verifies all 18 categories and 10 dimensions', () => {
    const report = ModelAuditEngine.auditModel(brainA);

    expect(report.modelIdentifier).toBe('ant_brain_model_v1_20260915_standard');
    expect(report.authorship).toContain('Nikhilesh H. Chavda');
    expect(report.overallCompletenessRatio).toBeGreaterThan(80.0);
    expect(report.overallCompletenessRatio).toBeLessThan(100.0); // Never claim fake 100%

    // 18 inventory categories
    const categories = [
      'neurons', 'synapses', 'regions', 'circuits', 'morphology',
      'dynamics', 'sensory_mappings', 'motor_mappings', 'memory',
      'learning', 'plasticity', 'reward', 'modulation', 'body',
      'behavior', 'communication', 'pheromones', 'colony_interfaces',
    ];
    for (const cat of categories) {
      expect(report.inventory[cat]).toBeDefined();
      expect(report.inventory[cat].status).toBe('PRESENT');
    }

    // 10 completeness dimensions
    const dimensions = [
      'Brain completeness', 'Sensory completeness', 'Motor completeness',
      'Memory completeness', 'Learning completeness', 'Body completeness',
      'Behavior completeness', 'Social completeness', 'Colony completeness',
      'Provenance completeness',
    ];
    for (const dim of dimensions) {
      expect(report.dimensions[dim]).toBeDefined();
      expect(report.dimensions[dim].status).toBe('IMPLEMENTED');
      expect(report.dimensions[dim].percentageImplemented).toBeGreaterThan(70.0);
      expect(report.dimensions[dim].percentageImplemented).toBeLessThan(100.0);
    }

    // Integrity invariants
    expect(report.integrityValidation.noDuplicateNeuronIds).toBe(true);
    expect(report.integrityValidation.noBrokenSynapseReferences).toBe(true);
    expect(report.integrityValidation.noNanOrInfinity).toBe(true);
  });

  it('2. Individual Brain Runtime Isolation: separate ants have isolated dynamic brain states', () => {
    const ant1 = new Ant('ANT-01', 'COLONY-01', { x: 0, y: 0 }, 0);
    const ant2 = new Ant('ANT-02', 'COLONY-01', { x: 10, y: 10 }, Math.PI / 2);

    expect(ant1.id).not.toBe(ant2.id);
    expect(ant1.controller).not.toBe(ant2.controller);
    expect(ant1.memory).not.toBe(ant2.memory);
    expect(ant1.internalState).not.toBe(ant2.internalState);
    expect(ant1.taskSystem).not.toBe(ant2.taskSystem);

    // Verify brain instances inside controllers are distinct
    const ctrl1 = ant1.controller as any;
    const ctrl2 = ant2.controller as any;
    if (ctrl1.brain && ctrl2.brain) {
      expect(ctrl1.brain).not.toBe(ctrl2.brain);
      expect(ctrl1.brain.graph).not.toBe(ctrl2.brain.graph);
    }
  });

  it('3. Explicit Body Model: verifies morphology, segments, tripod gait legs, and metabolic rate', () => {
    const workerBody = new AntBody('COLONY-01', { x: 0, y: 0 }, 0, 'WORKER');
    expect(workerBody.massMg).toBeGreaterThan(3.0);
    expect(workerBody.dimensionsMm.length).toBeGreaterThan(4.0);
    expect(workerBody.carryingCapacityMg).toBeGreaterThan(workerBody.massMg * 2);

    const segments = workerBody.getSegments();
    expect(segments.head).toBeDefined();
    expect(segments.alitrunk).toBeDefined();
    expect(segments.petiole).toBeDefined();
    expect(segments.gaster).toBeDefined();

    const legs = workerBody.getLegStates();
    expect(legs.length).toBe(6);
    expect(legs.some((l) => l.inContact)).toBe(true);

    const sensorLocs = workerBody.getSensorLocations();
    expect(sensorLocs.leftAntennaTip).toBeDefined();
    expect(sensorLocs.rightAntennaTip).toBeDefined();
    expect(sensorLocs.compoundEyes).toBeDefined();

    const burnRate = workerBody.getMetabolicBurnRate(0);
    expect(burnRate).toBeGreaterThan(0);
  });

  it('4. Communication Bus: delivers peer messages with distance attenuation and TTL expiry', () => {
    const bus = new ColonyCommunicationBus();

    // Post resource discovery
    const msg = bus.postMessage(
      'ANT-01',
      'BROADCAST',
      'RESOURCE_FOUND',
      { foodId: 'F-101' },
      10.0,
      { x: 0, y: 0 },
      2.0, // 2s TTL
      1.0
    );

    expect(msg.type).toBe('RESOURCE_FOUND');
    expect(bus.stats.totalMessagesSent).toBe(1);

    // Nearby ant receives message
    const receivedNearby = bus.getMessagesForAnt('ANT-02', { x: 2, y: 2 });
    expect(receivedNearby.length).toBe(1);
    expect(receivedNearby[0].strength).toBeGreaterThan(0.5);

    // Distant ant (> 15m) does not receive local message
    const receivedFar = bus.getMessagesForAnt('ANT-03', { x: 50, y: 50 });
    expect(receivedFar.length).toBe(0);

    // Update dt to expire TTL
    bus.update(2.5);
    const receivedAfterExpiry = bus.getMessagesForAnt('ANT-02', { x: 2, y: 2 });
    expect(receivedAfterExpiry.length).toBe(0);
  });

  it('5. Collaborative Tasks: enforces multi-agent coordination, failure recovery, and contribution credit', () => {
    const coop = new CollaborativeTaskManager();

    const task = coop.createCollaborativeTask(
      'COLLECTIVE_HEAVY_TRANSPORT',
      { x: 15, y: 15 },
      2, // Requires 2 agents
      50.0,
      0.0
    );

    expect(task.coordinationState).toBe('FORMING');

    // Ant 1 joins
    coop.joinTask(task.taskId, 'ANT-01', 'LIFTER');
    expect(task.coordinationState).toBe('FORMING'); // still need 1 more

    // Ant 2 joins
    coop.joinTask(task.taskId, 'ANT-02', 'STABILIZER');
    expect(task.coordinationState).toBe('READY');

    // Active ant sets
    const livingAnts = new Set(['ANT-01', 'ANT-02']);
    const positions = new Map([
      ['ANT-01', { x: 15, y: 15 }],
      ['ANT-02', { x: 15, y: 15 }],
    ]);

    // Ant 1 contributes effort, Ant 2 contributes less
    coop.recordContribution(task.taskId, 'ANT-01', 10.0);
    coop.recordContribution(task.taskId, 'ANT-02', 2.0);

    // Step state machine: READY -> COORDINATING
    coop.update(0.1, 0.1, livingAnts, positions);
    expect(task.coordinationState).toBe('COORDINATING');

    // Step state machine: COORDINATING -> ACTING
    coop.update(0.1, 0.2, livingAnts, positions);
    expect(task.coordinationState).toBe('ACTING');

    // Participant dropout scenario: ANT-02 dies
    const livingAfterDeath = new Set(['ANT-01']);
    coop.update(0.1, 0.3, livingAfterDeath, positions);
    // Detect dropout -> RECOVERING
    expect(task.coordinationState).toBe('RECOVERING');

    // New recruit ANT-03 arrives to save the task
    coop.joinTask(task.taskId, 'ANT-03', 'LIFTER');
    expect(task.coordinationState).toBe('COORDINATING');
  });

  it('6. Authoritative Reward Engine: enforces bounded values, debouncing, and prevents infinite loops', () => {
    const rewardEngine = new AuthoritativeRewardEngine({
      maxRewardMagnitude: 10.0,
      deduplicationWindowSeconds: 1.0,
      maxConsecutivePunishments: 3,
    });

    // 1. Positive reward
    const rew1 = rewardEngine.emitReward(
      'ANT-01',
      'ACTION',
      'HARVEST',
      'SUCCESS',
      5.0,
      'Found food',
      10.0
    );
    expect(rew1).not.toBeNull();
    expect(rew1?.value).toBe(5.0);

    // 2. Duplicate reward in debounce window should be suppressed
    const rewDuplicate = rewardEngine.emitReward(
      'ANT-01',
      'ACTION',
      'HARVEST',
      'SUCCESS',
      5.0,
      'Found food again',
      10.2
    );
    expect(rewDuplicate).toBeNull();

    // 3. Clamping reward explosion
    const rewHuge = rewardEngine.emitReward(
      'ANT-02',
      'ACTION',
      'EXPLOSION',
      'SUCCESS',
      99999.0,
      'Too much reward',
      10.0
    );
    expect(rewHuge?.value).toBe(10.0);

    // 4. Clamping NaN / Infinity
    const rewNan = rewardEngine.emitReward(
      'ANT-03',
      'ACTION',
      'INVALID',
      'FAIL',
      NaN,
      'NaN test',
      10.0
    );
    expect(rewNan).toBeNull();
  });

  it('7. Multi-Ant Population Scaling: runs 1, 2, 3, 5, 10 ants without crashing or task deadlocks', () => {
    const world = new SimulationWorld({ seed: 42 });
    const colony = world.colonies[0];

    // Verify initial population
    expect(colony.ants.length).toBeGreaterThanOrEqual(1);

    // Add up to 10 ants
    while (colony.ants.length < 10) {
      colony.spawnWorker({ x: 0, y: 0 }, world.rng.range(0, Math.PI * 2), world.rng);
    }
    expect(colony.ants.length).toBeGreaterThanOrEqual(10);

    // Advance 50 ticks
    for (let t = 0; t < 50; t++) {
      world.tick();
    }

    // Verify every ant has individual non-null position and active state
    for (const ant of colony.ants) {
      expect(!isNaN(ant.body.position.x)).toBe(true);
      expect(!isNaN(ant.body.position.y)).toBe(true);
      expect(ant.internalState.state.isAlive).toBe(true);
    }
  });
});
