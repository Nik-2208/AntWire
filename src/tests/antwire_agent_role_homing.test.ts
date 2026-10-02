import { describe, it, expect, beforeEach } from 'vitest';
import { Ant } from '../ants/ant';
import { Colony } from '../colony/colony';
import { AntHomingSystem } from '../ants/homing';
import { ROLE_CAPABILITIES_TABLE } from '../colony/roles';
import { AntSensorySnapshot } from '../simulation/types';
import { Predator } from '../predators/predator';
import { SPECIES_PROFILES } from '../ants/species_profile';
import { SeededRNG } from '../simulation/rng';

describe('ANTWIRE Self-Contained Trainable Agent, Roles, Homing & Queen Succession', () => {
  let colony: Colony;

  beforeEach(() => {
    colony = new Colony('colony-1', 'Formica Alpha', { x: 0, y: 0 });
  });

  it('1. Core Rule: Each ant is an independent trainable agent with isolated experience buffer', () => {
    const ant1 = colony.spawnWorker({ x: 0, y: 0 }, 0, undefined, undefined, 'WORKER', 'FORAGER');
    const ant2 = colony.spawnWorker({ x: 0, y: 0 }, 0, undefined, undefined, 'WORKER', 'SCOUT');

    const dummyObs1 = [1.0, 0.5, 0.2];
    const dummyNextObs = [1.0, 0.6, 0.3];

    ant1.stepExperience(dummyObs1, [0.5, 0.1], 10.0, dummyNextObs, false);
    
    expect(ant1.experienceBuffer.length).toBe(1);
    expect(ant2.experienceBuffer.length).toBe(0);
    expect(ant1.experienceBuffer[0].reward).toBe(10.0);
    expect(ant1.homingSystem).not.toBe(ant2.homingSystem);
  });

  it('2. Role System: Enforces strict role capability boundaries with no illegal task leakage', () => {
    const forager = colony.spawnWorker({ x: 0, y: 0 }, 0, undefined, undefined, 'WORKER', 'FORAGER');
    const guard = colony.spawnWorker({ x: 0, y: 0 }, 0, undefined, undefined, 'SOLDIER', 'GUARD');

    const foragerCaps = ROLE_CAPABILITIES_TABLE[forager.role];
    expect(foragerCaps.allowedTasks).toContain('FORAGING');
    expect(foragerCaps.allowedTasks).not.toContain('ATTACK_PREDATOR');
    expect(foragerCaps.allowedTasks).not.toContain('TEND_BROOD');

    const guardCaps = ROLE_CAPABILITIES_TABLE[guard.role];
    expect(guardCaps.allowedTasks).toContain('DEFEND');
    expect(guardCaps.allowedTasks).toContain('PATROL');
    expect(guardCaps.allowedTasks).not.toContain('FORAGING');
    expect(guardCaps.allowedTasks).not.toContain('TEND_BROOD');
  });

  it('3. Queen Logic: Stays anchored in safe chamber, recovers when depleted, reproduces when nourished', () => {
    const queen = colony.queen;
    const initialPos = { ...queen.position };

    // Queen updates should not wander
    queen.update(1.0, 0);
    expect(queen.position.x).toBe(initialPos.x);
    expect(queen.position.y).toBe(initialPos.y);

    // If health drops, state changes to HEAL_RECOVER
    queen.metrics.health = 0.5;
    queen.update(0.5, 0);
    expect(queen.behaviorState).toBe('HEAL_RECOVER');

    // When well nourished and healthy, transitions to REPRODUCE
    queen.metrics.health = 1.0;
    queen.metrics.energy = 0.9;
    queen.update(0.5, 50); // with food available
    expect(queen.behaviorState).toBe('REPRODUCE');
  });

  it('4. Homing System: Transitions smoothly from OUTBOUND to HOMING and updates Path Integration', () => {
    const homing = new AntHomingSystem();
    expect(homing.state).toBe('NESTED');

    const nestEntrance = { x: 0, y: 0 };
    const dummySensors = {
      foodLeft: 0, foodRight: 0, foodCenter: 0,
      homeLeft: 0, homeRight: 0, homeCenter: 0,
      alarmLeft: 0, alarmCenter: 0, alarmRight: 0,
      foodOdorConcentration: 0, foodOdorDirection: 0, foodProximity: 0, detectedFoodId: null,
      nestOdorConcentration: 0, nestOdorDirection: 0, nestProximity: 0, isAtNestEntrance: false, isInsideNestChamber: false,
      predatorDetected: false, predatorProximity: 0, predatorRelativeAngle: 0,
      nearestCorpseId: null, nearestCorpseDistance: 0, carriedFoodQuantity: 0,
      lightPolarizationAngle: 0, groundTextureGradient: 0,
    } as any as AntSensorySnapshot;

    // Step 1: Leave nest to OUTBOUND
    homing.updateMotion(2, 2, false, nestEntrance, { x: 2, y: 2 });
    homing.update(0.1, { x: 2, y: 2 }, 0, dummySensors, false, 1.0, false, nestEntrance, 1.0);
    expect(homing.state).toBe('OUTBOUND');

    // Step 2: Travel further into FORAGING_OR_EXPLORING
    homing.updateMotion(4, 4, false, nestEntrance, { x: 6, y: 6 });
    homing.update(0.1, { x: 6, y: 6 }, 0, dummySensors, false, 1.0, false, nestEntrance, 1.0);
    expect(homing.state).toBe('FORAGING_OR_EXPLORING');
    expect(homing.getEstimatedDistanceToHome({ x: 6, y: 6 })).toBeGreaterThan(6.0);

    // Step 3: Triggers return
    homing.initiateReturn('FOOD_ACQUIRED');
    expect(homing.state).toBe('HOMING');
    expect(homing.isHomingActive()).toBe(true);

    // Step 4: Moves back near nest detection zone (dist = ~2.8)
    homing.updateMotion(-4, -4, false, nestEntrance, { x: 2.0, y: 2.0 });
    homing.update(0.1, { x: 2.0, y: 2.0 }, 0, dummySensors, true, 1.0, false, nestEntrance, 1.0);
    expect(homing.state).toBe('NEST_DETECTION');

    // Step 5: Re-enters nest (dist = ~0.28)
    homing.updateMotion(-1.8, -1.8, true, nestEntrance, { x: 0.2, y: 0.2 });
    homing.update(0.1, { x: 0.2, y: 0.2 }, 0, dummySensors, true, 1.0, false, nestEntrance, 1.0);
    expect(homing.state).toBe('NEST_ENTRY');
  });

  it('5. Guard / Soldier Logic: Deals damage with cooldown without per-frame repeated hits', () => {
    const guard = colony.spawnWorker({ x: 2, y: 2 }, 0, undefined, undefined, 'SOLDIER', 'SOLDIER');
    const predator = new Predator('pred-1', { x: 2.2, y: 2.2 }, 0, 'GROUND_BEETLE');
    const initialPredHealth = predator.state.health;

    guard.updateCombatCooldown(0.1);
    expect(guard.canAttack()).toBe(true);

    // Execute attack
    const dealt = guard.performAttack(predator, 15);
    expect(dealt).toBe(true);
    expect(predator.state.health).toBeLessThan(initialPredHealth);
    expect(guard.canAttack()).toBe(false);

    // Immediate second hit must be prevented by combat cooldown
    const dealtImmediately = guard.performAttack(predator, 15);
    expect(dealtImmediately).toBe(false);
  });

  it('6. Full Organism Inspector Snapshot completeness', () => {
    const ant = colony.spawnWorker({ x: 0, y: 0 }, 0, undefined, undefined, 'WORKER', 'SCOUT');
    const snapshot = ant.getFullOrganismSnapshot();

    expect(snapshot.id).toBe(ant.id);
    expect(snapshot.lifecycle).toBeDefined();
    expect(snapshot.role).toBe('SCOUT');
    expect(snapshot.task).toBeDefined();
    expect(snapshot.goal).toBeDefined();
    expect(snapshot.homeEstimate).toBeDefined();
    expect(snapshot.direction).toBeDefined();
    expect(snapshot.internalState).toBeDefined();
    expect(snapshot.decisionFactors).toBeDefined();
    expect(snapshot.reward).toBeDefined();
    expect(snapshot.experienceStepsCount).toBe(0);
  });

  it('7. Species-Aware Queen Absence & Succession: Harpegnathos saltator gamergate tournament', () => {
    const saltatorColony = new Colony('saltator-colony', 'Harpegnathos Nest', { x: 0, y: 0 });
    saltatorColony.speciesProfile = SPECIES_PROFILES.HARPEGNATHOS_SALTATOR;

    // Spawn 5 workers
    for (let i = 0; i < 5; i++) {
      saltatorColony.spawnWorker({ x: 0, y: 0 }, 0);
    }

    // Kill the queen to trigger absence
    saltatorColony.queen.metrics.health = 0;

    const rng = new SeededRNG(42);
    // Advance simulation ticks to allow dominance tournament to proceed
    for (let t = 0; t < 90; t++) {
      saltatorColony.update(0.1, t * 0.1, rng);
    }

    // Harpegnathos saltator should establish Gamergate
    expect(saltatorColony.queenSuccession.reproductiveState).toBe('GAMERGATE_ESTABLISHED');
    expect(saltatorColony.queenSuccession.gamergateAntId).toBeDefined();
    expect(saltatorColony.queen.metrics.name).toContain('Gamergate');
  });

  it('8. Species-Aware Queen Absence: Leafcutter strictly monogynous (NONE) does not invent replacement', () => {
    const leafcutterColony = new Colony('leaf-colony', 'Atta Nest', { x: 0, y: 0 });
    leafcutterColony.speciesProfile = SPECIES_PROFILES.LEAFCUTTER_INSPIRED;

    leafcutterColony.spawnWorker({ x: 0, y: 0 }, 0);
    leafcutterColony.queen.metrics.health = 0;

    const rng = new SeededRNG(42);
    for (let t = 0; t < 20; t++) {
      leafcutterColony.update(0.1, t * 0.1, rng);
    }

    expect(leafcutterColony.queenSuccession.reproductiveState).toBe('QUEENLESS_DECLINE');
  });
});
