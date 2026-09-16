/**
 * ANT BRAIN — Central Simulation Event Bus
 * Authoritative, typed event stream for state transitions, life-cycle milestones,
 * ecology interactions, and telemetry logging across the observatory.
 */

import { Vector2D } from './types';

export type SimulationEventType =
  | 'ANT_CREATED'
  | 'ANT_INJURED'
  | 'ANT_EXHAUSTED'
  | 'ANT_DYING'
  | 'ANT_DIED'
  | 'FOOD_DISCOVERED'
  | 'FOOD_COLLECTED'
  | 'FOOD_PICKED_UP'
  | 'FOOD_DELIVERED'
  | 'FOOD_STORED'
  | 'FOOD_TRANSFER_COMPLETED'
  | 'PHEROMONE_DEPOSITED'
  | 'PREDATOR_SPAWNED'
  | 'PREDATOR_ATTACK'
  | 'PREDATOR_DIED'
  | 'NEST_EXPANDED'
  | 'NEST_DAMAGED'
  | 'QUEEN_LAID_EGG'
  | 'BROOD_HATCHED'
  | 'ADULT_EMERGED'
  | 'SOCIAL_CONTACT'
  | 'TROPHALLAXIS'
  | 'PARAMETER_CHANGED'
  | 'COLONY_CRISIS'
  | 'COLONY_RECOVERED'
  | 'SYMBIOSIS_INTERACTION'
  | 'COLONY_CREATED'
  | 'TASK_COMPLETED'
  | 'REWARD_EVENT';

export interface SimulationEvent {
  id: string;
  timestamp: number;
  tick: number;
  type: SimulationEventType;
  entityId?: string;
  colonyId?: string;
  position?: Vector2D;
  message: string;
  data?: Record<string, unknown>;
}

export type EventCallback = (event: SimulationEvent) => void;

export class SimulationEventBus {
  public static instance: SimulationEventBus = new SimulationEventBus();

  private listeners: Map<string, Set<EventCallback>> = new Map();
  private eventHistory: SimulationEvent[] = [];
  public maxHistory: number = 200;
  private nextId: number = 1;

  public subscribe(eventTypeOrCallback: SimulationEventType | '*' | EventCallback, maybeCallback?: EventCallback): () => void {
    let eventType: string;
    let callback: EventCallback;

    if (typeof eventTypeOrCallback === 'function') {
      eventType = '*';
      callback = eventTypeOrCallback;
    } else {
      eventType = eventTypeOrCallback;
      callback = maybeCallback!;
    }

    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);

    return () => {
      this.listeners.get(eventType)?.delete(callback);
    };
  }

  public emit(
    evtOrType: SimulationEventType | Partial<SimulationEvent>,
    maybeMessage?: string,
    maybeSimTime?: number,
    maybeTick?: number,
    maybeDetails?: {
      entityId?: string;
      colonyId?: string;
      position?: Vector2D;
      data?: Record<string, unknown>;
    }
  ): SimulationEvent {
    let event: SimulationEvent;

    if (typeof evtOrType === 'object') {
      const obj = evtOrType;
      event = {
        id: obj.id || `EVT-${this.nextId++}`,
        timestamp: obj.timestamp !== undefined ? Number(obj.timestamp.toFixed(3)) : Number((performance.now() / 1000).toFixed(3)),
        tick: obj.tick !== undefined ? obj.tick : 0,
        type: (obj.type || 'SOCIAL_CONTACT') as SimulationEventType,
        message: obj.message || `${obj.type}`,
        entityId: obj.entityId,
        colonyId: obj.colonyId,
        position: obj.position ? { ...obj.position } : undefined,
        data: (obj.data as Record<string, unknown>) || {},
      };
    } else {
      const type = evtOrType;
      const simTime = maybeSimTime !== undefined ? maybeSimTime : performance.now() / 1000;
      const tick = maybeTick !== undefined ? maybeTick : 0;
      event = {
        id: `EVT-${this.nextId++}`,
        timestamp: Number(simTime.toFixed(3)),
        tick,
        type,
        message: maybeMessage || `${type}`,
        entityId: maybeDetails?.entityId,
        colonyId: maybeDetails?.colonyId,
        position: maybeDetails?.position ? { ...maybeDetails.position } : undefined,
        data: maybeDetails?.data,
      };
    }

    // Add to ring buffer
    this.eventHistory.unshift(event);
    if (this.eventHistory.length > this.maxHistory) {
      this.eventHistory.pop();
    }

    // Direct listeners
    const directListeners = this.listeners.get(event.type);
    if (directListeners) {
      for (const cb of directListeners) {
        try {
          cb(event);
        } catch (e) {
          console.error(`Error in event listener for ${event.type}:`, e);
        }
      }
    }

    // Wildcard listeners
    const wildcardListeners = this.listeners.get('*');
    if (wildcardListeners) {
      for (const cb of wildcardListeners) {
        try {
          cb(event);
        } catch (e) {
          console.error(`Error in wildcard listener for ${event.type}:`, e);
        }
      }
    }

    return event;
  }

  public getHistory(limit: number = 50): SimulationEvent[] {
    return this.eventHistory.slice(0, limit);
  }

  public clear(): void {
    this.eventHistory = [];
  }
}
