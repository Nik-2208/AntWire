/**
 * ANT BRAIN — Colony Food & Resource Conservation Ledger
 * Enforces strict thermodynamic resource conservation across the ecosystem.
 * Invariant: foodSpawned = foodRemainingWorld + foodCarried + foodStored + foodConsumed + foodLost + foodDecayed
 */

export interface FoodLedgerSnapshot {
  foodSpawned: number;
  foodRemainingWorld: number;
  foodCarried: number;
  foodStored: number;
  foodConsumed: number;
  foodTransferred: number;
  foodLost: number;
  foodDecayed: number;
  conservationError: number;
  isConserved: boolean;
  timestamp: number;
}

export interface TrophallaxisRecord {
  id: string;
  donorId: string;
  receiverId: string;
  amount: number;
  timestamp: number;
  donorRemaining: number;
  receiverNewAmount: number;
}

export class ColonyFoodLedger {
  public foodSpawned: number = 0;
  public foodConsumed: number = 0;
  public foodTransferred: number = 0;
  public foodLost: number = 0;
  public foodDecayed: number = 0;
  public lastSnapshot: FoodLedgerSnapshot | null = null;

  public trophallaxisHistory: TrophallaxisRecord[] = [];
  public maxTransferRecords: number = 50;
  private lastConservationCheck: number = 0;

  /**
   * Register newly spawned food entity in the world
   */
  public registerSpawn(amount: number): void {
    if (amount > 0) {
      this.foodSpawned += amount;
    }
  }

  /**
   * Record food metabolically consumed by organisms (workers, queen, brood)
   */
  public recordConsumption(amount: number): void {
    if (amount > 0) {
      this.foodConsumed += amount;
    }
  }

  /**
   * Record social food transfer (trophallaxis) between two ants
   */
  public recordTrophallaxis(
    donorId: string,
    receiverId: string,
    amount: number,
    donorRemaining: number,
    receiverNewAmount: number,
    timestamp: number
  ): void {
    if (amount <= 0) return;
    this.foodTransferred += amount;
    this.trophallaxisHistory.unshift({
      id: `troph-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      donorId,
      receiverId,
      amount,
      timestamp,
      donorRemaining,
      receiverNewAmount,
    });
    if (this.trophallaxisHistory.length > this.maxTransferRecords) {
      this.trophallaxisHistory.pop();
    }
  }

  /**
   * Record food lost due to ant death without recovery or environmental destruction
   */
  public recordLost(amount: number): void {
    if (amount > 0) {
      this.foodLost += amount;
    }
  }

  /**
   * Record natural food decay
   */
  public recordDecay(amount: number): void {
    if (amount > 0) {
      this.foodDecayed += amount;
    }
  }

  /**
   * Compute authoritative closed-system resource balance snapshot
   */
  public computeBalance(
    foodRemainingWorld: number,
    foodCarried: number,
    foodStored: number,
    timestamp: number
  ): FoodLedgerSnapshot {
    const totalAccounted =
      foodRemainingWorld +
      foodCarried +
      foodStored +
      this.foodConsumed +
      this.foodLost +
      this.foodDecayed;

    const error = Math.abs(this.foodSpawned - totalAccounted);
    const isConserved = this.foodSpawned === 0 || error < 1e-2;

    if (!isConserved && timestamp - this.lastConservationCheck > 5.0 && this.foodSpawned > 0) {
      this.lastConservationCheck = timestamp;
    }

    const snapshot: FoodLedgerSnapshot = {
      foodSpawned: this.foodSpawned,
      foodRemainingWorld,
      foodCarried,
      foodStored,
      foodConsumed: this.foodConsumed,
      foodTransferred: this.foodTransferred,
      foodLost: this.foodLost,
      foodDecayed: this.foodDecayed,
      conservationError: error,
      isConserved,
      timestamp,
    };
    this.lastSnapshot = snapshot;
    return snapshot;
  }

  /**
   * Synchronize total world inventory when initializing or resetting scenarios
   */
  public syncInitialWorldBalance(totalWorldFood: number, storedFood = 0, carriedFood = 0): void {
    this.foodSpawned = totalWorldFood + storedFood + carriedFood + this.foodConsumed + this.foodLost + this.foodDecayed;
  }

  public getLatestSnapshot(): FoodLedgerSnapshot | null {
    return this.lastSnapshot;
  }

  /**
   * Reset ledger accounting
   */
  public reset(): void {
    this.foodSpawned = 0;
    this.foodConsumed = 0;
    this.foodTransferred = 0;
    this.foodLost = 0;
    this.foodDecayed = 0;
    this.trophallaxisHistory = [];
    this.lastSnapshot = null;
  }
}
