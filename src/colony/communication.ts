/**
 * ANTWIRE — Colony Superorganism Communication Bus
 * Created & Developed by Nikhilesh H. Chavda
 *
 * Implements authoritative peer-to-peer and broadcast communication channels
 * between computational ants, with spatial range limits, distance attenuation,
 * and time-to-live (TTL) expiration.
 */

import { CommunicationMessageType, StructuredAntMessage, Vector2D } from '../simulation/types';

export interface CommunicationStats {
  totalMessagesSent: number;
  totalMessagesDelivered: number;
  activeInFlightMessages: number;
  messageTypeCounts: Record<CommunicationMessageType, number>;
}

export class ColonyCommunicationBus {
  private activeMessages: StructuredAntMessage[] = [];
  private messageCounter: number = 0;

  public stats: CommunicationStats = {
    totalMessagesSent: 0,
    totalMessagesDelivered: 0,
    activeInFlightMessages: 0,
    messageTypeCounts: {
      RESOURCE_FOUND: 0,
      TASK_AVAILABLE: 0,
      TASK_CLAIMED: 0,
      TASK_RELEASED: 0,
      RECRUIT_REQUEST: 0,
      HELP_REQUEST: 0,
      HELP_ACCEPT: 0,
      HELP_REJECT: 0,
      DANGER: 0,
      PATH_FOUND: 0,
      PATH_BLOCKED: 0,
      STATUS: 0,
      TASK_PROGRESS: 0,
      TASK_COMPLETE: 0,
    },
  };

  /**
   * Broadcast or direct-send a message across the physical medium
   */
  public postMessage(
    senderId: string,
    receiverId: string | 'BROADCAST',
    type: CommunicationMessageType,
    payload: Record<string, any>,
    simTime: number,
    location?: Vector2D,
    ttl: number = 3.0,
    strength: number = 1.0
  ): StructuredAntMessage {
    this.messageCounter++;
    const message: StructuredAntMessage = {
      messageId: `msg-${senderId}-${this.messageCounter}-${Math.floor(simTime * 100)}`,
      senderId,
      receiverId,
      type,
      payload,
      timestamp: simTime,
      ttl,
      strength: Math.max(0.1, Math.min(1.0, strength)),
      location: location ? { ...location } : undefined,
    };

    this.activeMessages.push(message);
    this.stats.totalMessagesSent++;
    this.stats.messageTypeCounts[type] = (this.stats.messageTypeCounts[type] || 0) + 1;
    this.stats.activeInFlightMessages = this.activeMessages.length;

    return message;
  }

  /**
   * Advance simulation time and expire messages whose TTL has elapsed
   */
  public update(dt: number): void {
    for (let i = this.activeMessages.length - 1; i >= 0; i--) {
      this.activeMessages[i].ttl -= dt;
      if (this.activeMessages[i].ttl <= 0) {
        this.activeMessages.splice(i, 1);
      }
    }
    this.stats.activeInFlightMessages = this.activeMessages.length;
  }

  /**
   * Retrieve all legitimate in-range messages for an ant at its current position
   * Tactile antennation contact range: <= 2.5m
   * Stridulation / acoustic / chemical alarm range: <= 14.0m
   */
  public getMessagesForAnt(
    antId: string,
    position: Vector2D,
    sensoryRangeMultiplier: number = 1.0
  ): StructuredAntMessage[] {
    const delivered: StructuredAntMessage[] = [];

    for (const msg of this.activeMessages) {
      if (msg.senderId === antId) continue; // Do not receive own messages

      // Direct message check
      if (msg.receiverId !== 'BROADCAST' && msg.receiverId !== antId) {
        continue;
      }

      // Spatial distance check
      if (msg.location) {
        const dx = msg.location.x - position.x;
        const dy = msg.location.y - position.y;
        const dist = Math.hypot(dx, dy);

        let maxRange = 10.0;
        if (msg.type === 'HELP_ACCEPT' || msg.type === 'HELP_REJECT' || msg.type === 'STATUS') {
          maxRange = 3.0; // Close tactile antennation
        } else if (msg.type === 'DANGER' || msg.type === 'RESOURCE_FOUND' || msg.type === 'RECRUIT_REQUEST') {
          maxRange = 15.0; // Stridulatory or airborne pheromone broadcast
        }

        maxRange *= sensoryRangeMultiplier;

        if (dist <= maxRange) {
          // Calculate distance attenuation factor [0.1, 1.0]
          const attenuation = Math.max(0.1, 1.0 - dist / maxRange);
          delivered.push({
            ...msg,
            strength: msg.strength * attenuation,
          });
          this.stats.totalMessagesDelivered++;
        }
      } else {
        // Global broadcast within colony
        delivered.push(msg);
        this.stats.totalMessagesDelivered++;
      }
    }

    return delivered;
  }

  /**
   * Clear all messages in bus
   */
  public clear(): void {
    this.activeMessages = [];
    this.stats.activeInFlightMessages = 0;
  }
}
