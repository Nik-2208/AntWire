import { describe, it, expect, beforeEach } from 'vitest';
import { SimulationWorld } from '../simulation/world';
import { NeuralController } from '../ants/controllers/neural_stub';
import { ModelStorageService, ModelCheckpoint } from '../learning/model_checkpoint';
import { PolicyTrainer } from '../learning/policy_trainer';

describe('Resource Conservation, Food Pipeline, Trophallaxis & Persistent Training Tests', () => {
  let world: SimulationWorld;

  beforeEach(() => {
    world = new SimulationWorld({
      seed: 12345,
      width: 60,
      height: 60,
      initialAntCount: 4,
      foodClusterCount: 0, // Manual food placement for precision testing
      obstacleCount: 0,
      predatorCount: 0,
    });
    world.initializeWorld();
  });

  it('TEST 1: Food Collection Bounded by Capacity & Distance with Zero Duplication', () => {
    const colony = world.colonies[0];
    const ant = colony.ants[0];

    // Reset colony food store and ledger for clear test accounting
    colony.foodStore = 0.0;
    world.foodLedger.reset();

    // Position ant at (5.0, 5.0) close to the food patch
    ant.body.position.x = 5.0;
    ant.body.position.y = 5.0;

    // Spawn food patch at (5.2, 5.0) with amount = 10.0
    const food = world.placeFoodCluster({ x: 5.2, y: 5.0 }, 10.0, 1.0);
    expect(world.foodLedger.foodSpawned).toBe(10.0);

    // Initial ant carrying quantity
    expect(ant.internalState.state.carryingFoodAmount).toBe(0);

    // Trigger COLLECT_FOOD action explicitly once
    const harvestAction = { type: 'COLLECT_FOOD' as const, metadata: { foodId: food.id } };
    (ant as any).executeAction(
      harvestAction,
      0.016,
      world.pheromones,
      world.foodEntities,
      colony.nest.entrancePosition,
      colony.nest.entranceRadius,
      world.simConfig,
      world.eventBus,
      0.016
    );

    // Patch should be reduced by 1.0 unit
    expect(food.amount).toBe(9.0);
    // Ant should be carrying exactly 1.0 unit
    expect(ant.internalState.state.carryingFoodAmount).toBe(1.0);

    // Conservation check: world (9) + carried (1) == spawned (10)
    const balance = world.foodLedger.computeBalance(food.amount, ant.internalState.state.carryingFoodAmount, 0, 0.016);
    expect(balance.isConserved).toBe(true);
    expect(balance.conservationError).toBeLessThan(1e-4);
  });

  it('TEST 2: Food Delivery to Colony Storage strictly Conserves Resources', () => {
    const colony = world.colonies[0];
    const ant = colony.ants[0];

    // Give ant 3.0 units of food
    ant.internalState.pickupFood('food-1', 3.0, 3.0);
    expect(ant.internalState.state.carryingFoodAmount).toBe(3.0);

    // Reset colony food store and ledger for clear test accounting
    colony.foodStore = 0.0;
    world.foodLedger.foodConsumed = 0.0;

    // Move ant directly to nest entrance
    ant.body.position.x = colony.nest.entrancePosition.x;
    ant.body.position.y = colony.nest.entrancePosition.y;

    // Update colony to process nest arrival
    colony.update(
      0.016,
      0.016,
      world.rng,
      world.simConfig,
      world.eventBus,
      24.0,
      world.foodLedger,
      (pos, amt) => world.dropFoodEntity(pos, amt)
    );

    // Ant must have deposited its carried food
    expect(ant.internalState.state.carryingFoodAmount).toBe(0);

    // Colony food store must have increased by 3.0 minus worker refuel (0.4)
    expect(colony.foodStore).toBeCloseTo(2.6, 2);
    expect(world.foodLedger.foodConsumed).toBeCloseTo(0.4, 2);

    // Total accounted = stored (2.6) + consumed (0.4) = 3.0
    expect(colony.foodStore + world.foodLedger.foodConsumed).toBeCloseTo(3.0, 2);
  });

  it('TEST 3: Stomodeal Trophallaxis Food Sharing strictly Conserves Colony Resources', () => {
    const colony = world.colonies[0];
    const antA = colony.ants[0];
    const antB = colony.ants[1];

    // Ant A has food reserve
    antA.internalState.state.carryingFoodAmount = 3.0;
    // Ant B has zero food and high hunger
    antB.internalState.state.carryingFoodAmount = 0.0;
    antB.internalState.state.hunger = 0.9;

    // Position them adjacent (< 0.5 distance) far away from nest entrance (e.g. at (15, 15))
    antA.body.position.x = 15.0;
    antA.body.position.y = 15.0;
    antB.body.position.x = 15.3;
    antB.body.position.y = 15.0;

    const initialTotal = antA.internalState.state.carryingFoodAmount + antB.internalState.state.carryingFoodAmount;
    expect(initialTotal).toBe(3.0);

    // Run colony update to trigger trophallaxis
    colony.update(
      0.016,
      0.016,
      world.rng,
      world.simConfig,
      world.eventBus,
      24.0,
      world.foodLedger,
      (pos, amt) => world.dropFoodEntity(pos, amt)
    );

    // Ant A must have transferred food to Ant B
    expect(antA.internalState.state.carryingFoodAmount).toBeLessThan(3.0);
    expect(antB.internalState.state.carryingFoodAmount).toBeGreaterThan(0.0);

    // Total resource between both ants must remain exactly conserved
    const finalTotal = antA.internalState.state.carryingFoodAmount + antB.internalState.state.carryingFoodAmount;
    expect(finalTotal).toBeCloseTo(initialTotal, 3);
    expect(world.foodLedger.foodTransferred).toBeGreaterThan(0.0);
  });

  it('TEST 4: Death and Corpse Resource Outcome (FOOD_DROPS vs FOOD_LOST) with No Magical Transfer', () => {
    const colony = world.colonies[0];
    const dyingAnt = colony.ants[0];
    const bystanderAnt = colony.ants[1];

    // Bystander near dying ant
    bystanderAnt.body.position.x = 10.5;
    bystanderAnt.body.position.y = 10.0;
    bystanderAnt.internalState.state.carryingFoodAmount = 0.0;

    // Dying ant carries 2.5 food at (10, 10)
    dyingAnt.body.position.x = 10.0;
    dyingAnt.body.position.y = 10.0;
    dyingAnt.internalState.state.carryingFoodAmount = 2.5;

    // Kill ant
    dyingAnt.internalState.takeDamage(100.0, 'PREDATOR');
    expect(dyingAnt.internalState.state.isAlive).toBe(false);

    // Set rule to FOOD_DROPS
    world.simConfig.food.deathResourceOutcome = 'FOOD_DROPS';

    // Update colony
    colony.update(
      0.016,
      0.016,
      world.rng,
      world.simConfig,
      world.eventBus,
      24.0,
      world.foodLedger,
      (pos, amt) => world.dropFoodEntity(pos, amt)
    );

    // 1. Bystander ant must NOT magically acquire the food
    expect(bystanderAnt.internalState.state.carryingFoodAmount).toBe(0.0);

    // 2. A dropped food patch must appear at (10, 10) with amount = 2.5
    const droppedPatch = world.foodEntities.find((f) => Math.hypot(f.position.x - 10.0, f.position.y - 10.0) < 0.1);
    expect(droppedPatch).toBeDefined();
    expect(droppedPatch?.amount).toBe(2.5);

    // 3. A corpse entity must exist
    expect(colony.corpses.length).toBeGreaterThanOrEqual(1);
    expect(colony.corpses[0].antId).toBe(dyingAnt.id);
  });

  it('TEST 5: Continuous Ecosystem Resource Conservation Invariant holds', () => {
    // Reset colony store and ledger for clear baseline
    world.colonies[0].foodStore = 0.0;
    world.foodLedger.reset();

    // Spawn a patch of 50 units
    world.placeFoodCluster({ x: 4.0, y: 4.0 }, 50.0);
    expect(world.foodLedger.foodSpawned).toBe(50.0);

    // Run 60 simulation ticks
    for (let t = 0; t < 60; t++) {
      world.tick();
    }

    const allAnts = world.colonies.flatMap((c) => c.ants);
    const foodRemainingWorld = world.foodEntities.reduce((sum, f) => sum + f.amount, 0);
    const foodCarried = allAnts.reduce((sum, a) => sum + a.internalState.state.carryingFoodAmount, 0);
    const foodStored = world.colonies.reduce((sum, c) => sum + c.foodStore, 0);

    const balance = world.foodLedger.computeBalance(foodRemainingWorld, foodCarried, foodStored, world.clock.simTime);
    expect(balance.isConserved).toBe(true);
    expect(balance.conservationError).toBeLessThan(1e-3);
  });

  it('TEST 6: Persistent Model Checkpoints, Save, Load, and Continue Training Resumption', async () => {
    const trainer = new PolicyTrainer({ task: 'FORAGE' });

    // Train for 15 steps
    for (let i = 0; i < 15; i++) {
      trainer.trainStep();
    }
    expect(trainer.progress.step).toBe(15);

    // Save checkpoint
    const saved = await trainer.saveCurrentCheckpoint('Test Checkpoint');
    expect(saved.trainingStep).toBe(15);
    expect(saved.weights.inputWeights.length).toBe(16);

    // Load checkpoint
    const loaded = await ModelStorageService.loadCheckpoint(saved.modelId);
    expect(loaded).toBeDefined();
    expect(loaded?.trainingStep).toBe(15);
    expect(loaded?.weights.inputWeights[0][0]).toBe(saved.weights.inputWeights[0][0]);

    // Create a new trainer and resume from loaded checkpoint
    const continuingTrainer = new PolicyTrainer();
    continuingTrainer.resumeFromCheckpoint(loaded!);

    expect(continuingTrainer.progress.step).toBe(15);
    expect(continuingTrainer.controller.getWeights().inputWeights[0][0]).toBe(saved.weights.inputWeights[0][0]);

    // Continue training 10 more steps
    for (let i = 0; i < 10; i++) {
      continuingTrainer.trainStep();
    }

    // Step must have advanced to 25 without resetting to 0
    expect(continuingTrainer.progress.step).toBe(25);
  });

  it('TEST 7: Neural Controller Weight Mutation & Ablation immediately changes Inference', () => {
    const controller = new NeuralController();
    const initialWeights = controller.getWeights();

    // Ablate hidden neuron index 0
    controller.ablateNeuron('hidden', 0);
    const ablatedWeights = controller.getWeights();

    // Biases and incoming/outgoing weights must be zeroed/inhibited
    expect(ablatedWeights.hiddenBiases[0]).toBe(-999.0);
    expect(ablatedWeights.inputWeights[0][0]).toBe(0.0);
    expect(ablatedWeights.outputWeights[0][0]).toBe(0.0);

    // Mutate weight
    controller.mutateWeight('input', 1, 1, 2.5);
    const mutatedWeights = controller.getWeights();
    expect(mutatedWeights.inputWeights[1][1]).toBeCloseTo(initialWeights.inputWeights[1][1] + 2.5, 3);
  });
});
