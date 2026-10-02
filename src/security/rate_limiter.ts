/**
 * ANTWRE — Client & API Rate Limiter
 * Created & Developed by Nikhilesh H. Chavda
 *
 * Implements sliding window token-bucket rate limiting to prevent abuse on
 * feedback submissions, public experiment publishing, and download telemetry.
 */

export interface RateLimitConfig {
  maxRequests: number;     // Maximum allowed operations in the window
  windowMs: number;        // Sliding window duration in milliseconds
  cooldownMs?: number;     // Minimum cooldown between consecutive operations
}

export class RateLimiter {
  private static instance: RateLimiter;
  private actionRecords: Map<string, number[]> = new Map();
  private lastActionTimes: Map<string, number> = new Map();

  // Default rate limits per action type
  private static readonly RULES: Record<string, RateLimitConfig> = {
    'FEEDBACK_SUBMISSION': { maxRequests: 5, windowMs: 60 * 1000, cooldownMs: 3000 },
    'PUBLISH_EXPERIMENT': { maxRequests: 3, windowMs: 5 * 60 * 1000, cooldownMs: 10000 },
    'DOWNLOAD_EVENT': { maxRequests: 20, windowMs: 60 * 1000, cooldownMs: 500 },
    'COMMUNITY_QUERY': { maxRequests: 60, windowMs: 60 * 1000, cooldownMs: 100 },
  };

  private constructor() {}

  public static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  /**
   * Evaluates whether an action is permitted under rate limits.
   * @param actionKey Name of the action category
   * @param clientId Identifier (e.g. anonymousSessionId)
   */
  public checkLimit(actionKey: string, clientId: string = 'global'): { allowed: boolean; retryAfterSeconds: number; reason?: string } {
    const rule = RateLimiter.RULES[actionKey] || { maxRequests: 10, windowMs: 60 * 1000, cooldownMs: 1000 };
    const key = `${actionKey}::${clientId}`;
    const now = Date.now();

    // 1. Check minimum cooldown between consecutive requests
    if (rule.cooldownMs) {
      const lastTime = this.lastActionTimes.get(key) || 0;
      const elapsed = now - lastTime;
      if (elapsed < rule.cooldownMs) {
        const remaining = Math.ceil((rule.cooldownMs - elapsed) / 1000);
        return {
          allowed: false,
          retryAfterSeconds: remaining,
          reason: `Please wait ${remaining}s before repeating this action.`
        };
      }
    }

    // 2. Sliding window request count
    const timestamps = this.actionRecords.get(key) || [];
    const windowStart = now - rule.windowMs;
    const validTimestamps = timestamps.filter(t => t > windowStart);

    if (validTimestamps.length >= rule.maxRequests) {
      const oldestInWindow = validTimestamps[0];
      const retryAfterSeconds = Math.ceil((oldestInWindow + rule.windowMs - now) / 1000);
      return {
        allowed: false,
        retryAfterSeconds: Math.max(1, retryAfterSeconds),
        reason: `Rate limit exceeded. Please try again in ${retryAfterSeconds}s.`
      };
    }

    // Record action
    validTimestamps.push(now);
    this.actionRecords.set(key, validTimestamps);
    this.lastActionTimes.set(key, now);

    return { allowed: true, retryAfterSeconds: 0 };
  }

  public isAllowed(clientId: string, actionType: string = 'feedback'): boolean {
    const mapAction = actionType === 'experiments' ? 'PUBLISH_EXPERIMENT' : 'FEEDBACK_SUBMISSION';
    return this.checkLimit(mapAction, clientId).allowed;
  }

  public getCooldownSeconds(clientId: string, actionType: string = 'feedback'): number {
    const mapAction = actionType === 'experiments' ? 'PUBLISH_EXPERIMENT' : 'FEEDBACK_SUBMISSION';
    return this.checkLimit(mapAction, clientId).retryAfterSeconds;
  }

  /**
   * Resets rate limiter memory (useful for testing).
   */
  public reset(): void {
    this.actionRecords.clear();
    this.lastActionTimes.clear();
  }
}
