/**
 * ANTWIRE — Species-Aware Queen Absence & Succession Biological Kernel
 * Created & Developed by Nikhilesh H. Chavda
 *
 * Implements authoritative biological succession mechanisms:
 * 1. QUEEN_REARING: Emergency gyne cell rearing from young brood (larvae) fed royal jelly.
 * 2. GAMERGATE_SUCCESSION: Computational worker dominance tournament (antennal duels, policing)
 *    leading to physiological transition of tournament winner into a reproductive Gamergate (e.g. Harpegnathos saltator).
 * 3. WORKER_REPRODUCTION: Unfertilized arrhenotokous oviposition producing male alates or thelytokous eggs.
 * 4. QUEEN_ADOPTION_OR_MERGER: Adoption of dispersing fertile gynes or nest merging (e.g. Formica rufa).
 * 5. QUEENLESS_REPRODUCTIVE_CYCLE: Obligate thelytokous clonal worker reproduction (e.g. Pristomyrmex punctatus).
 * 6. NONE: Strict monogyny where dead foundress cannot be replaced (e.g. Atta, Cataglyphis); colony remains queenless.
 */

import { AntSpeciesProfile, QueenSuccessionStrategy } from '../ants/species_profile';
import { Ant } from '../ants/ant';
import { Queen } from './queen';
import { BroodManager } from './brood';
import { SimulationEventBus } from '../simulation/events';
import { SeededRNG } from '../simulation/rng';
import { Vector2D } from '../simulation/types';

export type ColonyReproductiveState =
  | 'QUEEN_MONOGYNOUS'
  | 'QUEEN_POLYGYNOUS'
  | 'QUEEN_ABSENCE_DETECTED'
  | 'SUCCESSION_IN_PROGRESS'
  | 'TOURNAMENT_DOMINANCE'
  | 'GAMERGATE_ESTABLISHED'
  | 'EMERGENCY_QUEEN_REARING'
  | 'WORKER_REPRODUCTION_ACTIVE'
  | 'GYNE_ADOPTION_SEEKING'
  | 'QUEENLESS_CLONAL_ACTIVE'
  | 'QUEENLESS_DECLINE';

export interface DominanceParticipant {
  antId: string;
  dominanceScore: number;
  duelsWon: number;
  age: number;
  health: number;
}

export interface SuccessionSnapshot {
  reproductiveState: ColonyReproductiveState;
  strategy: QueenSuccessionStrategy;
  absenceDuration: number;
  activeTournamentCandidates: DominanceParticipant[];
  successorGamergateId: string | null;
  rearedQueenProgress: number;
}

export class QueenSuccessionManager {
  public colonyId: string;
  public reproductiveState: ColonyReproductiveState = 'QUEEN_MONOGYNOUS';
  public absenceDuration: number = 0;
  public successionTimer: number = 0;
  public rearedQueenProgress: number = 0;
  public tournamentParticipants: DominanceParticipant[] = [];
  public gamergateAntId: string | null = null;

  constructor(colonyId: string) {
    this.colonyId = colonyId;
  }

  public resetToMonogynous(): void {
    this.reproductiveState = 'QUEEN_MONOGYNOUS';
    this.absenceDuration = 0;
    this.successionTimer = 0;
    this.rearedQueenProgress = 0;
    this.tournamentParticipants = [];
    this.gamergateAntId = null;
  }

  /**
   * Main per-tick update for queen health, absence detection, and biological succession
   */
  public update(
    dt: number,
    simTime: number,
    queen: Queen | null,
    speciesProfile: AntSpeciesProfile,
    workers: Ant[],
    brood: BroodManager,
    nestEntrance: Vector2D,
    rng: SeededRNG,
    eventBus?: SimulationEventBus
  ): { newQueenSpawned: Queen | null; workerLaidEggs: number } {
    let newQueenSpawned: Queen | null = null;
    let workerLaidEggs = 0;

    const strategy = speciesProfile.queenSuccessionStrategy;
    const isQueenAlive = queen && queen.metrics.health > 0;

    // 1. QUEEN ABSENCE DETECTION
    if (!isQueenAlive) {
      this.absenceDuration += dt;
      if (this.reproductiveState === 'QUEEN_MONOGYNOUS' || this.reproductiveState === 'QUEEN_POLYGYNOUS') {
        this.reproductiveState = 'QUEEN_ABSENCE_DETECTED';
        if (eventBus) {
          eventBus.emit({
            type: 'ANOMALY_DETECTED',
            timestamp: simTime,
            entityId: `colony-${this.colonyId}`,
            colonyId: this.colonyId,
            message: `Queen absence detected in colony ${this.colonyId}. Initiating species strategy: ${strategy}`,
          });
        }
      }

      // 2. EXECUTE STRATEGY-SPECIFIC SUCCESSION MECHANISM
      switch (strategy) {
        case 'NONE': {
          // Strict monogyny without replacement: colony remains queenless and enters decline
          this.reproductiveState = 'QUEENLESS_DECLINE';
          break;
        }

        case 'GAMERGATE_SUCCESSION': {
          // Model worker dominance tournament (Harpegnathos saltator)
          if (this.reproductiveState === 'QUEEN_ABSENCE_DETECTED') {
            this.reproductiveState = 'TOURNAMENT_DOMINANCE';
            this.initiateDominanceTournament(workers);
          }

          if (this.reproductiveState === 'TOURNAMENT_DOMINANCE') {
            this.successionTimer += dt;
            this.advanceDominanceTournament(workers, dt, rng);

            // Tournament resolves after ~8.0 seconds of dominance interactions
            if (this.successionTimer >= 8.0 && this.tournamentParticipants.length > 0) {
              this.tournamentParticipants.sort((a, b) => b.dominanceScore - a.dominanceScore);
              const winner = this.tournamentParticipants[0];
              this.gamergateAntId = winner.antId;
              this.reproductiveState = 'GAMERGATE_ESTABLISHED';

              // Promote winning worker to Gamergate Queen
              const winnerAnt = workers.find((w) => w.id === winner.antId);
              const gamergatePos = winnerAnt ? { ...winnerAnt.body.position } : { ...nestEntrance };
              newQueenSpawned = new Queen(this.colonyId, gamergatePos, false);
              newQueenSpawned.metrics.name = `Gamergate Queen (${winner.antId})`;
              newQueenSpawned.metrics.reproductiveState = 'QUEEN';

              if (winnerAnt) {
                winnerAnt.roleState.primaryRole = 'QUEEN';
                winnerAnt.body.caste = 'QUEEN';
              }

              if (eventBus) {
                eventBus.emit({
                  type: 'ANT_CREATED',
                  timestamp: simTime,
                  entityId: newQueenSpawned.id,
                  colonyId: this.colonyId,
                  data: {
                    type: 'GAMERGATE_SUCCESSION_COMPLETED',
                    antId: winner.antId,
                    dominanceScore: winner.dominanceScore,
                  },
                });
              }
            }
          } else if (this.reproductiveState === 'GAMERGATE_ESTABLISHED') {
            // Gamergate actively reproducing
          }
          break;
        }

        case 'QUEEN_REARING': {
          // Emergency queen rearing from young brood
          if (this.reproductiveState === 'QUEEN_ABSENCE_DETECTED') {
            this.reproductiveState = 'EMERGENCY_QUEEN_REARING';
            this.rearedQueenProgress = 0;
          }

          if (this.reproductiveState === 'EMERGENCY_QUEEN_REARING') {
            const hasBrood = brood.eggs > 0 || brood.larvae > 0;
            if (hasBrood) {
              // Workers nourish selected gyne larvae with royal secretions
              this.rearedQueenProgress = Math.min(1.0, this.rearedQueenProgress + dt * 0.1);
              if (this.rearedQueenProgress >= 1.0) {
                this.reproductiveState = 'QUEEN_MONOGYNOUS';
                newQueenSpawned = new Queen(this.colonyId, { x: nestEntrance.x - 1.0, y: nestEntrance.y + 3.0 }, false);
                newQueenSpawned.metrics.name = 'Reared Replacement Queen';
                if (eventBus) {
                  eventBus.emit({
                    type: 'ANT_CREATED',
                    timestamp: simTime,
                    entityId: newQueenSpawned.id,
                    colonyId: this.colonyId,
                    data: { type: 'EMERGENCY_QUEEN_REARED' },
                  });
                }
              }
            } else {
              // No brood left to rear: cannot replace
              this.reproductiveState = 'QUEENLESS_DECLINE';
            }
          }
          break;
        }

        case 'QUEEN_ADOPTION_OR_MERGER': {
          // Polygynous gyne adoption (Formica rufa)
          if (this.reproductiveState === 'QUEEN_ABSENCE_DETECTED') {
            this.reproductiveState = 'GYNE_ADOPTION_SEEKING';
            this.successionTimer = 0;
          }

          if (this.reproductiveState === 'GYNE_ADOPTION_SEEKING') {
            this.successionTimer += dt;
            // Dispersing gyne arrives after simulated delay
            if (this.successionTimer >= 6.0) {
              this.reproductiveState = 'QUEEN_POLYGYNOUS';
              newQueenSpawned = new Queen(this.colonyId, { x: nestEntrance.x - 0.5, y: nestEntrance.y + 2.5 }, false);
              newQueenSpawned.metrics.name = 'Adopted Mated Gyne';
              if (eventBus) {
                eventBus.emit({
                  type: 'ANT_CREATED',
                  timestamp: simTime,
                  entityId: newQueenSpawned.id,
                  colonyId: this.colonyId,
                  data: { type: 'GYNE_ADOPTED' },
                });
              }
            }
          }
          break;
        }

        case 'WORKER_REPRODUCTION': {
          this.reproductiveState = 'WORKER_REPRODUCTION_ACTIVE';
          // Living workers occasionally lay unfertilized eggs
          this.successionTimer += dt;
          if (this.successionTimer >= 10.0 && workers.length > 0) {
            this.successionTimer = 0;
            workerLaidEggs = 1;
            brood.spawnEgg(nestEntrance);
          }
          break;
        }

        case 'QUEENLESS_REPRODUCTIVE_CYCLE': {
          this.reproductiveState = 'QUEENLESS_CLONAL_ACTIVE';
          // Clonal workers lay eggs at baseline reproductive cycle
          this.successionTimer += dt;
          if (this.successionTimer >= 8.0 && workers.length > 0) {
            this.successionTimer = 0;
            workerLaidEggs = 1;
            brood.spawnEgg(nestEntrance);
          }
          break;
        }
      }
    } else {
      // Queen is healthy and present
      if (
        this.reproductiveState !== 'QUEEN_MONOGYNOUS' &&
        this.reproductiveState !== 'QUEEN_POLYGYNOUS' &&
        this.reproductiveState !== 'GAMERGATE_ESTABLISHED' &&
        this.reproductiveState !== 'QUEENLESS_CLONAL_ACTIVE'
      ) {
        this.reproductiveState = 'QUEEN_MONOGYNOUS';
        this.absenceDuration = 0;
      }
    }

    return { newQueenSpawned, workerLaidEggs };
  }

  private initiateDominanceTournament(workers: Ant[]): void {
    this.tournamentParticipants = [];
    this.successionTimer = 0;

    // Top healthy and active workers enter tournament
    const eligible = workers
      .filter((w) => w.internalState.state.isAlive && w.internalState.health > 0.6)
      .slice(0, 6);

    for (const w of eligible) {
      this.tournamentParticipants.push({
        antId: w.id,
        dominanceScore: 1.0 + Math.random() * 0.5,
        duelsWon: 0,
        age: w.internalState.state.age,
        health: w.internalState.health,
      });
    }
  }

  private advanceDominanceTournament(workers: Ant[], dt: number, rng: SeededRNG): void {
    if (this.tournamentParticipants.length < 2) return;

    // Pairwise dominance antennal duel simulation
    const idxA = rng.int(0, this.tournamentParticipants.length - 1);
    let idxB = rng.int(0, this.tournamentParticipants.length - 1);
    if (idxA === idxB) idxB = (idxA + 1) % this.tournamentParticipants.length;

    const a = this.tournamentParticipants[idxA];
    const b = this.tournamentParticipants[idxB];

    const antA = workers.find((w) => w.id === a.antId);
    const antB = workers.find((w) => w.id === b.antId);

    const vigorA = a.dominanceScore * (antA ? antA.internalState.health : 1.0);
    const vigorB = b.dominanceScore * (antB ? antB.internalState.health : 1.0);

    if (vigorA >= vigorB) {
      a.dominanceScore += 0.15 * dt;
      a.duelsWon++;
      b.dominanceScore = Math.max(0.2, b.dominanceScore - 0.08 * dt);
    } else {
      b.dominanceScore += 0.15 * dt;
      b.duelsWon++;
      a.dominanceScore = Math.max(0.2, a.dominanceScore - 0.08 * dt);
    }
  }

  public getSnapshot(strategy: QueenSuccessionStrategy): SuccessionSnapshot {
    return {
      reproductiveState: this.reproductiveState,
      strategy,
      absenceDuration: this.absenceDuration,
      activeTournamentCandidates: [...this.tournamentParticipants],
      successorGamergateId: this.gamergateAntId,
      rearedQueenProgress: this.rearedQueenProgress,
    };
  }
}
