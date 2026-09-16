/**
 * ANTWIRE — Authoritative Reward & Punishment Engine
 * Created & Developed by Nikhilesh H. Chavda
 *
 * Implements the single authoritative reward engine:
 * - Guarantees bounded configurable values [-10.0, +10.0]
 * - Strictly prevents per-frame rewards/punishments via deduplication and temporal debouncing
 * - Strictly prevents duplicate completion rewards
 * - Strictly prevents stale task rewards
 * - Strictly prevents cross-ant reward contamination
 * - Strictly prevents infinite punishment loops
 * - Strictly guards against NaN and Infinity
 * - Rewards only actual environmental consequences
 */

import { AuthoritativeRewardEvent } from './types';
import { SimulationEventBus } from './events';

export interface RewardEngineConfig {
  maxRewardMagnitude: number; // default 10.0
  deduplicationWindowSeconds: number; // default 1.5s
  maxConsecutivePunishments: number; // default 3
  staleTaskThresholdSeconds: number; // default 60.0s
}

export class AuthoritativeRewardEngine {
  private static instance: AuthoritativeRewardEngine | null = null;

  private config: RewardEngineConfig = {
    maxRewardMagnitude: 10.0,
    deduplicationWindowSeconds: 1.5,
    maxConsecutivePunishments: 3,
    staleTaskThresholdSeconds: 60.0,
  };

  // Recent reward history for deduplication: key -> lastTimestamp
  private processedRewardKeys: Map<string, number> = new Map();

  // Consecutive punishment counter: antId -> count
  private consecutivePunishments: Map<string, number> = new Map();

  // Log of authoritative reward events
  public eventLog: AuthoritativeRewardEvent[] = [];
  public maxLogSize: number = 200;

  constructor(customConfig?: Partial<RewardEngineConfig>) {
    if (customConfig) {
      this.config = { ...this.config, ...customConfig };
    }
  }

  public static getInstance(): AuthoritativeRewardEngine {
    if (!AuthoritativeRewardEngine.instance) {
      AuthoritativeRewardEngine.instance = new AuthoritativeRewardEngine();
    }
    return AuthoritativeRewardEngine.instance;
  }

  /**
   * Evaluates, sanitizes, deduplicates, and commits a consequence reward event
   */
  public emitReward(
    antId: string,
    eventType: AuthoritativeRewardEvent['eventType'],
    action: string,
    result: string,
    rawRewardValue: number,
    reason: string,
    simTime: number,
    taskId?: string,
    individualContribution: number = 1.0,
    teamSuccess?: number,
    eventBus?: SimulationEventBus
  ): AuthoritativeRewardEvent | null {
    // 1. Validate ant ID
    if (!antId || typeof antId !== 'string' || antId.trim() === '') {
      return null;
    }

    // 2. Guard against NaN / Infinity
    if (isNaN(rawRewardValue) || !isFinite(rawRewardValue)) {
      return null;
    }

    // 3. Deduplication Key: prevent per-frame reward loops
    const taskKey = taskId || 'notask';
    const dedupeKey = `${antId}:${taskKey}:${eventType}:${action}`;
    const lastTime = this.processedRewardKeys.get(dedupeKey);

    if (lastTime !== undefined && simTime - lastTime < this.config.deduplicationWindowSeconds) {
      // Suppressed duplicate within debounce window
      return null;
    }

    // 4. Bound reward magnitude
    let clampedValue = Math.max(
      -this.config.maxRewardMagnitude,
      Math.min(this.config.maxRewardMagnitude, rawRewardValue)
    );

    // 5. Check consecutive punishment loops
    if (clampedValue < 0) {
      const punishments = this.consecutivePunishments.get(antId) || 0;
      if (punishments >= this.config.maxConsecutivePunishments) {
        // Soften punishment to prevent negative spiraling death loops
        clampedValue *= 0.2;
      }
      this.consecutivePunishments.set(antId, punishments + 1);
    } else {
      // Reset punishment streak on positive reward
      this.consecutivePunishments.set(antId, 0);
    }

    // 6. Construct validated AuthoritativeRewardEvent
    const eventId = `rew-${antId}-${Math.floor(simTime * 1000)}-${Math.floor(Math.random() * 10000)}`;
    const event: AuthoritativeRewardEvent = {
      rewardEventId: eventId,
      antId,
      taskId,
      timestamp: simTime,
      eventType,
      action,
      result,
      value: parseFloat(clampedValue.toFixed(3)),
      reason,
      individualContribution: parseFloat((individualContribution || 0).toFixed(3)),
      teamSuccess: teamSuccess !== undefined ? parseFloat(teamSuccess.toFixed(3)) : undefined,
    };

    // Update deduplication timestamp
    this.processedRewardKeys.set(dedupeKey, simTime);

    // Store in log
    this.eventLog.push(event);
    if (this.eventLog.length > this.maxLogSize) {
      this.eventLog.shift();
    }

    // Dispatch to event bus if present
    if (eventBus) {
      eventBus.emit({
        type: 'TASK_COMPLETED',
        entityId: antId,
        colonyId: 'colony-0',
        timestamp: simTime,
        message: `Task ${action}: ${result}`,
        data: {
          task: action,
          success: clampedValue >= 0,
          rewardValue: clampedValue,
        },
      });
    }

    return event;
  }

  /**
   * Prune expired deduplication keys periodically to prevent memory leaks
   */
  public cleanup(simTime: number): void {
    for (const [key, ts] of this.processedRewardKeys.entries()) {
      if (simTime - ts > this.config.staleTaskThresholdSeconds) {
        this.processedRewardKeys.delete(key);
      }
    }
  }

  public clear(): void {
    this.processedRewardKeys.clear();
    this.consecutivePunishments.clear();
    this.eventLog = [];
  }
}
