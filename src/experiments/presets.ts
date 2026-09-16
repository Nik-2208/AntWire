/**
 * ANT BRAIN — Scientific Experiment Presets & Known-Good Verification Demos
 */

import { SimulationWorld } from '../simulation/world';

export interface ExperimentPreset {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  hypothesis: string;
  initialAnts: number;
  seed: number;
  setup: (world: SimulationWorld) => void;
}

export const EXPERIMENT_PRESETS: ExperimentPreset[] = [
  {
    id: 'known-good-demo',
    name: '🌟 0. KNOWN GOOD DEMO (Guaranteed Verification)',
    subtitle: 'Automated Proof-of-Life Foraging Loop',
    description: '12 worker ants and Queen at nest (0,0). Scout ant A-001 heads directly toward nearby sugar crystal patch, harvests food, returns laying pheromone trail, and sister ants follow trail.',
    hypothesis: 'Deterministic chemical tropotaxis and stigmergic recruitment guarantees closed foraging feedback loop.',
    initialAnts: 12,
    seed: 42,
    setup: (world) => {
      world.reset(42);
      const colony = world.colonies[0];
      colony.ants = [];
      colony.foodStore = 15.0;

      // 1. Scout ant pointing directly toward food at (14.0, 4.0)
      const scoutAngle = Math.atan2(4.0, 14.0);
      const scout = colony.spawnWorker({ x: 0, y: 0 }, scoutAngle, world.rng);

      // 2. 11 other sister workers scattered around nest
      for (let i = 1; i < 12; i++) {
        colony.spawnWorker({ x: 0, y: 0 }, (i * Math.PI * 2) / 11, world.rng);
      }

      // 3. Guaranteed food clusters
      world.foodEntities = [];
      world.placeFoodCluster({ x: 14.0, y: 4.0 }, 80, 2.5); // Primary target
      world.placeFoodCluster({ x: -16.0, y: -10.0 }, 100, 3.0); // Secondary patch
      world.placeFoodCluster({ x: 10.0, y: -18.0 }, 100, 3.0);

      // Clear obstacles and predators for clean demo
      world.obstacles = [];
      world.predators = [];
      world.pheromones.clear();
      world.logEvent('FOOD_DISCOVERED', 'Known-Good Demo initialized: 12 workers, Queen, 3 Food Patches.');
    },
  },
  {
    id: 'first-foraging',
    name: '1. Solitary Scout Foraging',
    subtitle: 'Solitary Organism Baseline',
    description: 'A single worker ant explores open terrain, detects a sugar crystal food cluster, harvests food, and navigates home.',
    hypothesis: 'Tropotactic antennae chemical sensing is sufficient for solitary food localization and return navigation.',
    initialAnts: 1,
    seed: 42,
    setup: (world) => {
      world.reset(42);
      const colony = world.colonies[0];
      colony.ants = [];
      colony.spawnWorker({ x: 0, y: 0 }, 0, world.rng);
      world.foodEntities = [];
      world.placeFoodCluster({ x: 15.0, y: 5.0 }, 60, 2.5);
      world.obstacles = [];
      world.predators = [];
    },
  },
  {
    id: 'food-trail',
    name: '2. Emergent Collective Food Trail',
    subtitle: 'Swarm Intelligence & Pheromone Recruitment',
    description: '25 worker ants scout the environment. Once food is discovered, returning foragers deposit chemical recruitment trails, creating an emergent highway.',
    hypothesis: 'Positive feedback via trail reinforcement coupled with exponential evaporation yields optimal transport routes.',
    initialAnts: 25,
    seed: 101,
    setup: (world) => {
      world.reset(101);
      const colony = world.colonies[0];
      colony.ants = [];
      for (let i = 0; i < 25; i++) {
        colony.spawnWorker({ x: 0, y: 0 }, world.rng.range(0, Math.PI * 2), world.rng);
      }
      world.foodEntities = [];
      world.placeFoodCluster({ x: 18.0, y: 12.0 }, 150, 3.0);
      world.placeFoodCluster({ x: -20.0, y: -14.0 }, 100, 2.5);
      world.predators = [];
    },
  },
  {
    id: 'predator-attack',
    name: '3. Predator Incursion & Alarm Stigmergy',
    subtitle: 'Threat Avoidance & Collective Defense',
    description: 'A carnivorous predatory beetle stalks foraging columns. Attacked ants release alarm pheromone, diverting sisters away from danger zones.',
    hypothesis: 'Volatile alarm chemicals minimize colony mortality by dynamically shifting local drive potentials from foraging to threat avoidance.',
    initialAnts: 20,
    seed: 777,
    setup: (world) => {
      world.reset(777);
      const colony = world.colonies[0];
      colony.ants = [];
      for (let i = 0; i < 20; i++) {
        colony.spawnWorker({ x: 0, y: 0 }, world.rng.range(0, Math.PI * 2), world.rng);
      }
      world.foodEntities = [];
      world.placeFoodCluster({ x: 18.0, y: 0.0 }, 120, 2.8);
      world.predators = [];
      world.spawnPredator({ x: 12.0, y: 5.0 });
    },
  },
  {
    id: 'colony-growth',
    name: '4. Colony Demographics & Brood Cycle',
    subtitle: 'Queen Egg-Laying & Holometabolous Metamorphosis',
    description: 'Ingested nutrients fuel the Queen to lay eggs that mature through larval and pupal stages into adult workers, expanding colony capacity.',
    hypothesis: 'Food inflow rate directly throttles colony demographic growth via Queen fertility curves and larval feeding constraints.',
    initialAnts: 15,
    seed: 2026,
    setup: (world) => {
      world.reset(2026);
      const colony = world.colonies[0];
      colony.foodStore = 10.0;
      colony.ants = [];
      for (let i = 0; i < 15; i++) {
        colony.spawnWorker({ x: 0, y: 0 }, world.rng.range(0, Math.PI * 2), world.rng);
      }
      world.foodEntities = [];
      world.placeFoodCluster({ x: 12.0, y: 10.0 }, 200, 3.5);
      world.placeFoodCluster({ x: -15.0, y: 8.0 }, 200, 3.5);
      world.predators = [];
    },
  },
];
