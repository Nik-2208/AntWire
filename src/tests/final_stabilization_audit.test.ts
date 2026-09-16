/**
 * ANTWIRE — Final Stabilization & Correctness Verification Suite
 * Created & Developed by Nikhilesh H. Chavda
 *
 * Verifies:
 * 1. Pheromone Decision Pipeline & Species Profiles (No unconditional food-found release)
 * 2. Colony Demand Modulation & Saturated Trail Damping
 * 3. Individual Ant Organism Isolation (Ant #1 ≠ Ant #2 ≠ Ant #3)
 * 4. Ant Failure Isolation (Error in one ant never terminates the colony)
 * 5. Behavioral Sanity Checker (Detects explosions, circling, stuck states)
 * 6. Computational Neuromodulator Dynamics (Dopamine-like RPE signal, per-ant state)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Ant } from '../ants/ant';
import { PheromoneDecisionEngine, AntPheromoneDecisionState } from '../ants/pheromone_decision';
import { SPECIES_PROFILES } from '../ants/species_profile';
import { PheromoneField } from '../pheromones/field';
import { PheromoneChannel } from '../simulation/types';
import { BehavioralSanityChecker } from '../simulation/behavioral_sanity_checker';
import { NeuromodulatorSystem } from '../learning/neuromodulation';
import { AuthoritativeRewardEngine } from '../simulation/authoritative_reward_engine';
import { SimulationWorld } from '../simulation/world';
import { SeededRNG } from '../simulation/rng';

describe('ANTWIRE Final Stabilization & Correctness Pass', () => {
  let pheromones: PheromoneField;

  beforeEach(() => {
    pheromones = new PheromoneField({
      worldWidth: 50,
      worldHeight: 50,
      resolution: 100,
    });
    AuthoritativeRewardEngine.getInstance().clear();
  });

  it('Requirement 9 & 10: Prevents unconditional pheromone release upon discovering food', () => {
    const ant = new Ant('ant-1', 'col-0', { x: 0, y: 0 }, 0);
    // Ant has NOT acquired food yet and is exploring
    ant.internalState.state.carryingFoodAmount = 0;
    ant.sensors.lastSnapshot.detectedFoodId = 'food-1';
    ant.sensors.lastSnapshot.foodProximity = 0.95;

    const decision = PheromoneDecisionEngine.evaluateDeposition(
      ant.body,
      ant.sensors.lastSnapshot,
      ant.internalState.state,
      undefined,
      ant.pheromoneState,
      ant.speciesProfile,
      1.0
    );

    // Must NOT deposit food trail just because food is detected or proximal without having acquired it
    expect(decision.shouldDeposit).toBe(false);
  });

  it('Requirement 11 & 23: Species profile variation — Cataglyphis lays zero recruitment trail', () => {
    const desertAnt = new Ant(
      'desert-1',
      'col-0',
      { x: 5, y: 5 },
      0,
      'WORKER',
      undefined,
      undefined,
      'FORAGER',
      SPECIES_PROFILES.CATAGLYPHIS_FORTIS
    );

    // Load food cargo
    desertAnt.internalState.state.carryingFoodAmount = 1.0;
    desertAnt.sensors.lastSnapshot.isAtNestEntrance = false;

    const decision = PheromoneDecisionEngine.evaluateDeposition(
      desertAnt.body,
      desertAnt.sensors.lastSnapshot,
      desertAnt.internalState.state,
      undefined,
      desertAnt.pheromoneState,
      desertAnt.speciesProfile,
      2.0
    );

    // Desert ants rely solely on path integration, zero chemical recruitment trail
    expect(decision.shouldDeposit).toBe(false);
    expect(decision.reason).toContain('Saharan Desert Ant');
  });

  it('Requirement 14 & 15: Colony demand & saturation damping inhibit excessive recruitment', () => {
    const massAnt = new Ant(
      'wood-1',
      'col-0',
      { x: 10, y: 10 },
      0,
      'WORKER',
      undefined,
      undefined,
      'FORAGER',
      SPECIES_PROFILES.FORMICA_RUFA
    );
    massAnt.internalState.state.carryingFoodAmount = 1.0;

    // Case A: Saturated trail already present in environment
    massAnt.sensors.lastSnapshot.foodCenter = 20.0; // Heavily saturated existing trail

    const decisionSaturated = PheromoneDecisionEngine.evaluateDeposition(
      massAnt.body,
      massAnt.sensors.lastSnapshot,
      massAnt.internalState.state,
      { foodNeed: 0.8 } as any,
      massAnt.pheromoneState,
      massAnt.speciesProfile,
      5.0
    );
    expect(decisionSaturated.shouldDeposit).toBe(false);
    expect(decisionSaturated.reason).toContain('saturated');

    // Case B: Colony food need is already completely met (foodNeed < 0.15)
    massAnt.sensors.lastSnapshot.foodCenter = 0.5;
    const decisionLowNeed = PheromoneDecisionEngine.evaluateDeposition(
      massAnt.body,
      massAnt.sensors.lastSnapshot,
      massAnt.internalState.state,
      { foodNeed: 0.08 } as any,
      massAnt.pheromoneState,
      massAnt.speciesProfile,
      6.0
    );
    expect(decisionLowNeed.shouldDeposit).toBe(false);
    expect(decisionLowNeed.reason).toContain('Colony food need');
  });

  it('Requirement 2 & 31: Individual Ant Organisms have completely isolated, non-singleton live state', () => {
    const ant1 = new Ant('ant-1', 'col-0', { x: -5, y: 0 }, 0);
    const ant2 = new Ant('ant-2', 'col-0', { x: 5, y: 0 }, Math.PI);

    // Verify completely distinct object references
    expect(ant1.sensors).not.toBe(ant2.sensors);
    expect(ant1.internalState).not.toBe(ant2.internalState);
    expect(ant1.drives).not.toBe(ant2.drives);
    expect(ant1.memory).not.toBe(ant2.memory);
    expect(ant1.taskSystem).not.toBe(ant2.taskSystem);
    expect(ant1.pheromoneState).not.toBe(ant2.pheromoneState);
    expect(ant1.neuromodulator).not.toBe(ant2.neuromodulator);

    // Modifying ant1 internal state does NOT mutate ant2
    ant1.neuromodulator.triggerExperimentalDopamineSpike(0.8, 10.0);
    expect(ant1.neuromodulator.dopamineLevel).toBeGreaterThan(0.9);
    expect(ant2.neuromodulator.dopamineLevel).toBeCloseTo(0.20, 2);
  });

  it('Requirement 20: Failure isolation — error in one ant transitions to RECOVER without crashing simulation', () => {
    const ant1 = new Ant('ant-1', 'col-0', { x: 0, y: 0 }, 0);
    const ant2 = new Ant('ant-2', 'col-0', { x: 2, y: 2 }, 0);

    // Corrupt ant1 controller to force a catastrophic error during decision
    ant1.controller = {
      decide: () => {
        throw new Error('Simulated Neural Hardware Fault in Ant 1');
      },
    } as any;

    const rng = new SeededRNG(42);

    // Execute ant1 update
    expect(() => {
      ant1.update(
        0.05,
        1.0,
        20,
        pheromones,
        [],
        { x: 0, y: 0 },
        2.0,
        [],
        [],
        [ant2.body],
        rng,
        50,
        50
      );
    }).not.toThrow();

    // Ant 1 must have safely entered recovery task
    expect(ant1.taskSystem.state.currentTask).toBe('RECOVER');
    expect(ant1.taskSystem.state.lifecycleState).toBe('RECOVERING');
    expect(ant1.body.speed).toBe(0);

    // Ant 2 updates normally and is completely unaffected
    expect(() => {
      ant2.update(
        0.05,
        1.0,
        20,
        pheromones,
        [],
        { x: 0, y: 0 },
        2.0,
        [],
        [],
        [ant1.body],
        rng,
        50,
        50
      );
    }).not.toThrow();
    expect(ant2.taskSystem.state.currentTask).not.toBe('RECOVER');
  });

  it('Requirement 27: Behavioral Sanity Checker detects explosions and circling', () => {
    const checker = new BehavioralSanityChecker();

    // 1. Simulate runaway unconstrained pheromone explosion
    pheromones.channels[0][100] = 200.0;
    const issues = checker.checkSimulationState([], pheromones, 1.0, 0.05);

    expect(issues.some((i) => i.type === 'PHEROMONE_EXPLOSION')).toBe(true);

    // 2. Check reset capability
    checker.reset();
    expect(checker.recentIssues.length).toBe(0);
  });

  it('Requirement 4 & 30: Neuromodulator implements parameterized RPE dopamine-like dynamics', () => {
    const neuro = new NeuromodulatorSystem();
    const baseline = neuro.dopamineLevel;

    // Positive reinforcement event produces phasic burst
    const res = neuro.processReinforcementEvent(5.0, 1.0, 0.95, 'Discovered high value sugar', 1.0);
    expect(res.rpe).toBeGreaterThan(0);
    expect(neuro.dopamineLevel).toBeGreaterThan(baseline);
    expect(res.plasticityGain).toBeGreaterThan(1.0);

    // Tonic relaxation decay over time
    for (let i = 0; i < 30; i++) {
      neuro.updateDecay(0.1, 2.0 + i * 0.1);
    }
    expect(neuro.dopamineLevel).toBeLessThan(res.newDopamine);
  });
});
