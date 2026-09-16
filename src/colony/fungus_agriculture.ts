/**
 * ANT BRAIN — Leafcutter Fungus Agriculture & Substrate Dynamics
 * Simulates the symbiotic mutualism between Attine ants and Leucoagaricus gongylophorus:
 * 1. Leaf mastication and enzyme-rich fecal droplet incorporation (Pulping).
 * 2. Mycelium biomass kinetics, hydration, and nutritional gongylidia production.
 * 3. Escovopsis microfungal parasitic contamination and metapleural gland sanitation.
 * 4. Hazardous agricultural waste partitioning and subterranean midden disposal.
 */

import { FungusGarden, Vector2D } from '../simulation/types';
import { SeededRNG } from '../simulation/rng';
import { SimulationEventBus } from '../simulation/events';
import { Ant } from '../ants/ant';

export interface MiddenWasteRecord {
  id: string;
  position: Vector2D;
  wasteMass: number;
  toxicityScore: number; // 0 to 1
  createdAt: number;
}

export class FungusAgricultureManager {
  public gardens: FungusGarden[] = [];
  public middens: MiddenWasteRecord[] = [];
  private nextGardenId = 1;
  private nextMiddenId = 1;

  // Cumulative telemetry
  public totalLeavesProcessed = 0;
  public totalGongylidiaHarvested = 0;
  public totalEscovopsisSanitized = 0;
  public totalWasteDisposed = 0;

  constructor() {
    // Default initial starter garden
    this.createGarden({ x: -4.0, y: 4.0 }, 'chamber-fungus-0');
  }

  public createGarden(pos: Vector2D, chamberId?: string): FungusGarden {
    const garden: FungusGarden = {
      id: `garden-${this.nextGardenId++}`,
      chamberId,
      position: { ...pos },
      substrateMass: 10.0,        // starting masticated leaf substrate
      fungalBiomass: 15.0,        // living mycelial comb
      gongylidiaBiomass: 8.0,     // nutritious harvestable clusters
      contaminationLevel: 0.01,   // baseline Escovopsis trace
      growthRate: 0.06,           // biomass conversion rate
      hydration: 0.82,            // 82% relative moisture
      temperature: 25.5,          // 25.5°C
      metapleuralHygiene: 0.95,   // active antibiotic coating
      lastTendedTick: 0,
    };
    this.gardens.push(garden);
    return garden;
  }

  /**
   * Add raw harvested leaf fragments and masticate into nutrient pulp
   */
  public addLeafFragmentSubstrate(gardenId: string, leafMass: number): number {
    const garden = this.gardens.find((g) => g.id === gardenId) || this.gardens[0];
    if (!garden) return 0;

    const acceptedMass = Math.min(leafMass, 50.0 - garden.substrateMass);
    garden.substrateMass += acceptedMass;
    this.totalLeavesProcessed += acceptedMass;
    return acceptedMass;
  }

  /**
   * Minims tend the fungal crypts, trimming hyphae and applying metapleural gland antibiotics
   */
  public tendGarden(gardenId: string, workAmount: number, simTime: number, eventBus?: SimulationEventBus): { sanitizedAmount: number; hygieneGain: number } {
    const garden = this.gardens.find((g) => g.id === gardenId) || this.gardens[0];
    if (!garden) return { sanitizedAmount: 0, hygieneGain: 0 };

    const sanitizedAmount = Math.min(garden.contaminationLevel, workAmount * 0.05);
    garden.contaminationLevel = Math.max(0, garden.contaminationLevel - sanitizedAmount);
    garden.metapleuralHygiene = Math.min(1.0, garden.metapleuralHygiene + workAmount * 0.08);
    this.totalEscovopsisSanitized += sanitizedAmount;

    if (eventBus && sanitizedAmount > 0.01) {
      eventBus.emit({
        type: 'FUNGUS_TENDED' as any,
        timestamp: simTime,
        entityId: garden.id,
        colonyId: 'colony-0',
        data: {
          gardenId: garden.id,
          contamination: garden.contaminationLevel,
          hygiene: garden.metapleuralHygiene,
        },
      });
    }

    return { sanitizedAmount, hygieneGain: workAmount * 0.08 };
  }

  /**
   * Harvest edible gongylidia for brood and adult ant nourishment
   */
  public harvestGongylidia(requestedAmount: number, gardenId?: string): number {
    const targetGarden = gardenId
      ? this.gardens.find((g) => g.id === gardenId)
      : this.gardens.find((g) => g.gongylidiaBiomass > 0.5);

    if (!targetGarden || targetGarden.gongylidiaBiomass <= 0) return 0;

    // Contamination reduces usable edible nutrition fraction
    const cleanFraction = Math.max(0.2, 1.0 - targetGarden.contaminationLevel);
    const availableClean = targetGarden.gongylidiaBiomass * cleanFraction;
    const harvested = Math.min(requestedAmount, availableClean);

    targetGarden.gongylidiaBiomass -= harvested;
    this.totalGongylidiaHarvested += harvested;
    return harvested;
  }

  /**
   * Deposit degraded, contaminated, or dead fungal material into subterranean midden
   */
  public depositMiddenWaste(pos: Vector2D, mass: number, toxicity: number = 0.5): MiddenWasteRecord {
    const midden: MiddenWasteRecord = {
      id: `midden-${this.nextMiddenId++}`,
      position: { ...pos },
      wasteMass: mass,
      toxicityScore: Math.min(1.0, toxicity),
      createdAt: performance.now() / 1000,
    };
    this.middens.push(midden);
    this.totalWasteDisposed += mass;
    return midden;
  }

  /**
   * Dynamic agricultural simulation step
   */
  public update(
    dt: number,
    simTime: number,
    temperatureCelsius: number = 25.0,
    rng?: SeededRNG,
    eventBus?: SimulationEventBus
  ): { totalGongylidiaProduced: number; totalWasteProduced: number } {
    let totalGongylidiaProduced = 0;
    let totalWasteProduced = 0;

    for (const garden of this.gardens) {
      // 1. Thermal & Humidity Kinetics (optimum: 24-28°C)
      const tempDiff = Math.abs(temperatureCelsius - 26.0);
      const thermalEfficiency = Math.max(0.2, 1.0 - tempDiff * 0.1);

      // 2. Substrate conversion into fungal biomass
      if (garden.substrateMass > 0.1) {
        const consumedSubstrate = Math.min(garden.substrateMass, dt * 0.15 * thermalEfficiency);
        garden.substrateMass -= consumedSubstrate;

        // Clean substrate converted into mycelium and gongylidia
        const yieldCoeff = 0.85 * (1.0 - garden.contaminationLevel * 0.5);
        const newBiomass = consumedSubstrate * yieldCoeff;
        garden.fungalBiomass += newBiomass * 0.4;
        const newGongylidia = newBiomass * 0.6;
        garden.gongylidiaBiomass += newGongylidia;
        totalGongylidiaProduced += newGongylidia;

        // Substrate degradation creates trace exhausted waste
        const wasteProduced = consumedSubstrate * 0.15;
        totalWasteProduced += wasteProduced;
      }

      // 3. Escovopsis parasite growth vs metapleural gland hygiene
      const baseInfectionRate = 0.008;
      const hygieneDefense = garden.metapleuralHygiene * 0.012;
      const netContaminationDelta = (baseInfectionRate - hygieneDefense) * dt;
      garden.contaminationLevel = Math.max(0, Math.min(1.0, garden.contaminationLevel + netContaminationDelta));

      // Hygiene decays over time unless constantly groomed by minims
      garden.metapleuralHygiene = Math.max(0.1, garden.metapleuralHygiene - dt * 0.005);

      // 4. Parasite damage: severe contamination consumes fungal biomass
      if (garden.contaminationLevel > 0.3) {
        const decayAmount = dt * 0.08 * (garden.contaminationLevel - 0.3);
        garden.fungalBiomass = Math.max(0.5, garden.fungalBiomass - decayAmount);
        garden.gongylidiaBiomass = Math.max(0.0, garden.gongylidiaBiomass - decayAmount);
        totalWasteProduced += decayAmount;
      }
    }

    return { totalGongylidiaProduced, totalWasteProduced };
  }

  public getSummary() {
    const totalSubstrate = this.gardens.reduce((sum, g) => sum + g.substrateMass, 0);
    const totalFungalBiomass = this.gardens.reduce((sum, g) => sum + g.fungalBiomass, 0);
    const totalGongylidia = this.gardens.reduce((sum, g) => sum + g.gongylidiaBiomass, 0);
    const avgContamination = this.gardens.length > 0
      ? this.gardens.reduce((sum, g) => sum + g.contaminationLevel, 0) / this.gardens.length
      : 0;

    return {
      gardenCount: this.gardens.length,
      totalSubstrate,
      totalFungalBiomass,
      totalGongylidia,
      avgContamination,
      totalLeavesProcessed: this.totalLeavesProcessed,
      totalGongylidiaHarvested: this.totalGongylidiaHarvested,
      totalEscovopsisSanitized: this.totalEscovopsisSanitized,
      totalWasteDisposed: this.totalWasteDisposed,
    };
  }
}
