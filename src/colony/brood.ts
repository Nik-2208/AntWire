/**
 * ANT BRAIN — Brood Lifecycle & Polymorphic Metamorphosis Subsystem
 * Strictly models holometabolous development: EGG -> LARVA -> PUPA -> ADULT.
 * Governed by thermal kinetics (Q10), larval nutrition, and caste determination thresholds.
 */

import { AntCaste, BroodEntity, BroodStage, Vector2D } from '../simulation/types';
import { SimulationEventBus } from '../simulation/events';
import { DroneGeneticProfile } from './queen';

export interface ExtendedBroodEntity extends BroodEntity {
  geneticProfile?: DroneGeneticProfile;
  determinedCaste: AntCaste;
  nutritionScore: number; // accumulated protein & gongylidia nutrition
}

export interface EmergedAdultResult {
  caste: AntCaste;
  position: Vector2D;
  geneticProfile?: DroneGeneticProfile;
}

export class BroodManager {
  public broodList: ExtendedBroodEntity[] = [];
  private nextId: number = 1;

  // Baseline development durations at 25°C (simulation seconds)
  public readonly BASE_EGG_DURATION = 18.0;
  public readonly BASE_LARVA_DURATION = 26.0;
  public readonly BASE_PUPA_DURATION = 22.0;

  constructor() {
    this.broodList = [];
  }

  public spawnEgg(pos: Vector2D, geneticProfile?: DroneGeneticProfile, forceCaste?: AntCaste): ExtendedBroodEntity {
    const egg: ExtendedBroodEntity = {
      id: `brood-${this.nextId++}`,
      stage: 'EGG',
      age: 0,
      developmentProgress: 0,
      fedAmount: 0,
      careNeed: 0.1,
      temperatureOptimal: 26.0,
      isAlive: true,
      position: { ...pos },
      geneticProfile,
      determinedCaste: forceCaste || 'WORKER',
      nutritionScore: 0,
    };
    this.broodList.push(egg);
    return egg;
  }

  /**
   * Updates brood development with thermal kinetics, gongylidia feeding, and caste differentiation.
   */
  public update(
    dt: number,
    availableFoodInStore: number,
    temperatureCelsius: number = 24.0,
    eventBus?: SimulationEventBus,
    colonyPopulation: number = 10
  ): { emergedAdults: EmergedAdultResult[]; foodConsumed: number } {
    const emergedAdults: EmergedAdultResult[] = [];
    let foodConsumed = 0;

    // Thermal acceleration factor (Arrhenius / Q10 approximation)
    const tempDelta = temperatureCelsius - 25.0;
    const thermalSpeedFactor = Math.max(0.2, Math.min(2.0, 1.0 + tempDelta * 0.04));

    for (let i = this.broodList.length - 1; i >= 0; i--) {
      const b = this.broodList[i];
      if (!b.isAlive) {
        this.broodList.splice(i, 1);
        continue;
      }

      b.age += dt * thermalSpeedFactor;

      switch (b.stage) {
        case 'EGG': {
          b.developmentProgress = Math.min(1.0, b.age / this.BASE_EGG_DURATION);
          if (b.developmentProgress >= 1.0) {
            b.stage = 'LARVA';
            b.age = 0;
            b.developmentProgress = 0;
            if (eventBus) {
              eventBus.emit({
                type: 'BROOD_HATCHED',
                timestamp: performance.now() / 1000,
                entityId: b.id,
                data: { stage: 'LARVA', id: b.id },
              });
            }
          }
          break;
        }

        case 'LARVA': {
          // Larvae require gongylidia/protein to grow and differentiate castes
          if (availableFoodInStore > 0) {
            const feedRate = 0.07 * dt;
            b.fedAmount += feedRate;
            b.nutritionScore += feedRate;
            foodConsumed += feedRate;
            b.developmentProgress = Math.min(1.0, b.age / this.BASE_LARVA_DURATION);
          } else {
            b.developmentProgress = Math.min(1.0, b.age / (this.BASE_LARVA_DURATION * 2.5));
            if (b.age > this.BASE_LARVA_DURATION * 3.0 && b.fedAmount < 0.2) {
              b.isAlive = false;
            }
          }

          // Larval pupation trigger and morphological caste differentiation
          if (b.isAlive && b.developmentProgress >= 1.0 && b.fedAmount >= 0.8) {
            b.stage = 'PUPA';
            b.age = 0;
            b.developmentProgress = 0;

            // Biological Caste Determination based on larval nutrition & colony size
            if (colonyPopulation < 8) {
              // Early colony bootstrap: produce fast agile minims
              b.determinedCaste = 'MINIM';
            } else if (b.nutritionScore > 2.8 && colonyPopulation > 30) {
              // High nutrition in mature colony: produce major soldier or gyne
              b.determinedCaste = Math.random() < 0.2 ? 'GYNE' : 'MAJOR';
            } else if (b.nutritionScore > 1.8) {
              b.determinedCaste = 'MEDIA';
            } else if (b.nutritionScore > 1.2) {
              b.determinedCaste = 'MINOR';
            } else {
              b.determinedCaste = 'MINIM';
            }
          }
          break;
        }

        case 'PUPA': {
          b.developmentProgress = Math.min(1.0, b.age / this.BASE_PUPA_DURATION);
          if (b.developmentProgress >= 1.0) {
            // Metamorphosis complete: Emerge as differentiated adult!
            emergedAdults.push({
              caste: b.determinedCaste,
              position: { ...b.position },
              geneticProfile: b.geneticProfile,
            });

            if (eventBus) {
              eventBus.emit({
                type: 'ADULT_EMERGED',
                timestamp: performance.now() / 1000,
                entityId: b.id,
                data: { id: b.id, caste: b.determinedCaste },
              });
            }
            this.broodList.splice(i, 1);
          }
          break;
        }
      }
    }

    return { emergedAdults, foodConsumed };
  }

  public getCounts(): { eggs: number; larvae: number; pupae: number; total: number } {
    return {
      eggs: this.eggs,
      larvae: this.larvae,
      pupae: this.pupae,
      total: this.totalBrood,
    };
  }

  public addEggs(count: number, pos: Vector2D = { x: -1.0, y: 4.0 }, forceCaste?: AntCaste): void {
    for (let i = 0; i < count; i++) {
      this.spawnEgg({
        x: pos.x + (Math.random() - 0.5) * 1.5,
        y: pos.y + (Math.random() - 0.5) * 1.5,
      }, undefined, forceCaste);
    }
  }

  public get eggs(): number {
    return this.broodList.filter((b) => b.stage === 'EGG').length;
  }

  public get larvae(): number {
    return this.broodList.filter((b) => b.stage === 'LARVA').length;
  }

  public get pupae(): number {
    return this.broodList.filter((b) => b.stage === 'PUPA').length;
  }

  public get totalBrood(): number {
    return this.broodList.length;
  }
}
