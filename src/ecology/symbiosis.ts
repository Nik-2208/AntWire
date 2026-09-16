/**
 * ANT BRAIN — Ecological Interactions & Symbiosis Subsystem
 * Implements context-dependent mutualism, predation, and trophobiosis:
 * 1. Aphid-Ant Mutualism (Honeydew secretion in exchange for predator protection)
 * 2. Fungus-Growing Agriculture (Leaf substrate processing & mycelial harvesting)
 * 3. Symbiont Food Web Interaction Graph
 */

import { AphidEntity, EcologicalInteractionType, FungusGarden, Vector2D } from '../simulation/types';
import { SeededRNG } from '../simulation/rng';
import { Ant } from '../ants/ant';
import { SimulationEventBus } from '../simulation/events';

export interface EcologyGraphNode {
  id: string;
  name: string;
  category: 'ANT' | 'APHID' | 'PLANT' | 'FUNGUS' | 'PREDATOR';
  abundance: number;
}

export interface EcologyGraphEdge {
  source: string;
  target: string;
  type: EcologicalInteractionType;
  benefitSource: number; // positive or negative net fitness impact
  costSource: number;
  benefitTarget: number;
  costTarget: number;
  interactionCount: number;
  isMutualisticNet: boolean; // dynamic context: can invert if costs exceed benefits
}

export class EcologicalInteractionManager {
  public aphids: AphidEntity[] = [];
  public fungusGardens: FungusGarden[] = [];
  private nextAphidId = 1;
  private nextFungusId = 1;

  // Interaction telemetry
  public totalHoneydewHarvested = 0;
  public totalFungusHarvested = 0;
  public totalAphidsProtected = 0;

  constructor() {
    this.initDefaultEcosystem();
  }

  public initDefaultEcosystem(): void {
    this.aphids = [];
    this.fungusGardens = [];

    // Initialize an aphid colony patch on a vegetation zone
    for (let i = 0; i < 6; i++) {
      this.spawnAphid({
        x: 18.0 + (Math.random() - 0.5) * 4.0,
        y: -14.0 + (Math.random() - 0.5) * 4.0,
      });
    }

    // Initialize a subterranean fungus garden chamber
    this.spawnFungusGarden({ x: -6.0, y: 6.0 });
  }

  public spawnAphid(pos: Vector2D): AphidEntity {
    const aphid: AphidEntity = {
      id: `aphid-${this.nextAphidId++}`,
      position: { ...pos },
      health: 1.0,
      honeydewReserve: 0.5,
      honeydewProductionRate: 0.04, // honeydew accumulates per second
      tendedByAntId: null,
      age: 0,
      isAlive: true,
    };
    this.aphids.push(aphid);
    return aphid;
  }

  public spawnFungusGarden(pos: Vector2D): FungusGarden {
    const garden: FungusGarden = {
      id: `fungus-${this.nextFungusId++}`,
      position: { ...pos },
      substrateMass: 15.0, // Initial plant matter
      fungalBiomass: 12.0,  // Harvestable edible gongylidia
      gongylidiaBiomass: 8.0,
      contaminationLevel: 0.02,
      growthRate: 0.05,
      hydration: 0.8,
      temperature: 25.0,
      metapleuralHygiene: 0.9,
    };
    this.fungusGardens.push(garden);
    return garden;
  }

  /**
   * Main ecological update step
   */
  public update(
    dt: number,
    ants: Ant[],
    rng: SeededRNG,
    eventBus?: SimulationEventBus,
    ledger?: { registerSpawn: (amt: number) => void; recordConsumption: (amt: number) => void }
  ): void {
    // 1. Update Aphid physiology and trophobiotic interactions
    for (let i = 0; i < this.aphids.length; i++) {
      const aphid = this.aphids[i];
      if (!aphid.isAlive) continue;

      aphid.age += dt;
      // Synthesize carbohydrate-rich honeydew from phloem sap
      aphid.honeydewReserve = Math.min(1.0, aphid.honeydewReserve + aphid.honeydewProductionRate * dt);

      // Check proximity of ants tending aphids
      aphid.tendedByAntId = null;
      for (let a = 0; a < ants.length; a++) {
        const ant = ants[a];
        if (!ant.internalState.state.isAlive) continue;

        const dist = Math.hypot(ant.body.position.x - aphid.position.x, ant.body.position.y - aphid.position.y);
        if (dist <= 1.5) {
          aphid.tendedByAntId = ant.id;

          // Ant milks honeydew droplet through antennal palpation
          if (aphid.honeydewReserve >= 0.25 && ant.internalState.state.carryingFoodAmount < 1.0) {
            const harvested = Math.min(0.5, aphid.honeydewReserve);
            aphid.honeydewReserve -= harvested;
            this.totalHoneydewHarvested += harvested;

            if (ledger) {
              ledger.registerSpawn(harvested);
            }

            // Worker carries liquid honeydew
            ant.internalState.pickupFood(aphid.id, harvested);
            ant.body.task = 'TENDING_APHIDS';

            if (eventBus) {
              eventBus.emit({
                type: 'SYMBIOSIS_INTERACTION',
                timestamp: performance.now() / 1000,
                entityId: ant.id,
                data: {
                  type: 'APHID_TENDING',
                  aphidId: aphid.id,
                  antId: ant.id,
                  honeydewAmount: harvested,
                },
              });
            }
          }
          break;
        }
      }

      // Natural aphid parthenogenesis if healthy and well-fed
      if (aphid.age > 40.0 && this.aphids.length < 15 && rng.range(0, 1) < 0.002) {
        this.spawnAphid({
          x: aphid.position.x + rng.range(-1.2, 1.2),
          y: aphid.position.y + rng.range(-1.2, 1.2),
        });
      }
    }

    // 2. Update Fungus Garden cultivation
    for (let f = 0; f < this.fungusGardens.length; f++) {
      const garden = this.fungusGardens[f];

      // Fungus consumes substrate to yield edible biomass
      if (garden.substrateMass > 0) {
        const substrateConsumed = Math.min(garden.substrateMass, 0.08 * dt);
        garden.substrateMass -= substrateConsumed;
        // Yield edible Gongylidia nutrition
        garden.fungalBiomass = Math.min(50.0, garden.fungalBiomass + substrateConsumed * 1.4);
      }

      // Check worker ant tending in fungus chamber
      for (let a = 0; a < ants.length; a++) {
        const ant = ants[a];
        if (!ant.internalState.state.isAlive) continue;

        const dist = Math.hypot(ant.body.position.x - garden.position.x, ant.body.position.y - garden.position.y);
        if (dist <= 2.2) {
          // Worker harvests fungus food
          if (garden.fungalBiomass > 5.0 && ant.internalState.hunger > 0.3) {
            garden.fungalBiomass -= 0.5;
            this.totalFungusHarvested += 0.5;
            if (ledger) {
              ledger.registerSpawn(0.5);
              ledger.recordConsumption(0.5);
            }
            ant.internalState.feed(0.5);
            ant.body.task = 'CULTIVATING_FUNGUS';
          }
          break;
        }
      }
    }
  }

  /**
   * Generates live Ecology Interaction Graph showing benefit/cost dynamic
   */
  public getEcologyGraph(antPopulation: number, predatorCount: number): { nodes: EcologyGraphNode[]; edges: EcologyGraphEdge[] } {
    const nodes: EcologyGraphNode[] = [
      { id: 'ant', name: 'Formica Colony Ants', category: 'ANT', abundance: antPopulation },
      { id: 'aphid', name: 'Aphis Hemiptera', category: 'APHID', abundance: this.aphids.length },
      { id: 'fungus', name: 'Leucoagaricus Gongylidia', category: 'FUNGUS', abundance: Math.round(this.fungusGardens.reduce((acc, g) => acc + g.fungalBiomass, 0)) },
      { id: 'plant', name: 'Vegetation Phloem', category: 'PLANT', abundance: 100 },
      { id: 'predator', name: 'Arthropod Predators', category: 'PREDATOR', abundance: predatorCount },
    ];

    // Evaluate context-dependent cost/benefit:
    // If aphid honeydew is high, mutualism is heavily net-positive.
    // If predators are excessive, defense costs reduce net benefit.
    const aphidBenefitToAnt = Math.min(1.0, this.totalHoneydewHarvested * 0.1);
    const antDefenseBenefitToAphid = 0.85;
    const isAphidMutualismNet = aphidBenefitToAnt > 0.05;

    const edges: EcologyGraphEdge[] = [
      {
        source: 'ant',
        target: 'aphid',
        type: 'MUTUALISM',
        benefitSource: aphidBenefitToAnt,
        costSource: 0.15, // worker patrolling time
        benefitTarget: antDefenseBenefitToAphid,
        costTarget: 0.3,  // excreted sucrose loss
        interactionCount: Math.round(this.totalHoneydewHarvested),
        isMutualisticNet: isAphidMutualismNet,
      },
      {
        source: 'aphid',
        target: 'plant',
        type: 'PARASITISM',
        benefitSource: 0.8,
        costSource: 0.0,
        benefitTarget: 0.0,
        costTarget: 0.4, // sap depletion
        interactionCount: 120,
        isMutualisticNet: false,
      },
      {
        source: 'ant',
        target: 'fungus',
        type: 'MUTUALISM',
        benefitSource: Math.min(1.0, this.totalFungusHarvested * 0.1),
        costSource: 0.2, // weeding and substrate foraging
        benefitTarget: 0.9, // weeding out Escovopsis parasitic mold
        costTarget: 0.2, // biomass consumed
        interactionCount: Math.round(this.totalFungusHarvested),
        isMutualisticNet: true,
      },
      {
        source: 'predator',
        target: 'ant',
        type: 'PREDATION',
        benefitSource: 0.7,
        costSource: 0.1,
        benefitTarget: 0.0,
        costTarget: 0.9, // mortality
        interactionCount: 15,
        isMutualisticNet: false,
      },
    ];

    return { nodes, edges };
  }
}
