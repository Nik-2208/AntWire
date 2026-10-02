/**
 * ANTWRE — Enterprise Structured Logging & Audit System
 * Created & Developed by Nikhilesh H. Chavda
 *
 * Implements category-based structured telemetry with severity levels,
 * sensitive data redaction, ring-buffered in-memory audit logs, and runtime tracing.
 */

import { SecuritySanitizer } from '../security/sanitizer';

export type LogCategory =
  | 'AUTH'
  | 'FIRESTORE'
  | 'MODEL'
  | 'BRAIN'
  | 'ANT'
  | 'COLONY'
  | 'TASK'
  | 'TRAINING'
  | 'REWARD'
  | 'LEARNING'
  | 'PHEROMONE'
  | 'COMMUNICATION'
  | 'COMMUNITY'
  | 'EXPERIMENT'
  | 'DOWNLOAD'
  | 'SECURITY'
  | 'ERROR';

export type LogSeverity = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'SECURITY';

export type AntRuntimeEventType =
  | 'ANT_CREATED'
  | 'BRAIN_INITIALIZED'
  | 'ROLE_CHANGED'
  | 'TASK_CLAIMED'
  | 'TASK_STARTED'
  | 'ACTION'
  | 'RESOURCE_FOUND'
  | 'RESOURCE_COLLECTED'
  | 'RESOURCE_DELIVERED'
  | 'PHEROMONE_DEPOSITED'
  | 'MESSAGE_SENT'
  | 'MESSAGE_RECEIVED'
  | 'HELP_REQUESTED'
  | 'COLLABORATION_STARTED'
  | 'COLLABORATION_COMPLETED'
  | 'REWARD'
  | 'PUNISHMENT'
  | 'LEARNING_UPDATE'
  | 'RECOVERY'
  | 'DEATH';

export interface StructuredLogEntry {
  eventId: string;
  timestamp: number;
  isoTime: string;
  category: LogCategory;
  severity: LogSeverity;
  message: string;
  sessionId?: string;
  antId?: string;
  experimentId?: string;
  modelVersion?: string;
  metadata?: Record<string, unknown>;
}

export class AntWireLogger {
  private static instance: AntWireLogger;
  private logs: StructuredLogEntry[] = [];
  private readonly maxBufferedLogs = 1000;
  private listeners: ((entry: StructuredLogEntry) => void)[] = [];
  private minConsoleSeverity: LogSeverity = 'INFO';

  private constructor() {}

  public static getInstance(): AntWireLogger {
    if (!AntWireLogger.instance) {
      AntWireLogger.instance = new AntWireLogger();
    }
    return AntWireLogger.instance;
  }

  /**
   * Emits a structured log entry. Redacts potential secrets automatically.
   */
  public log(
    category: LogCategory,
    severity: LogSeverity,
    message: string,
    context?: {
      sessionId?: string;
      antId?: string;
      experimentId?: string;
      modelVersion?: string;
      metadata?: Record<string, unknown>;
    }
  ): StructuredLogEntry {
    const now = Date.now();
    const eventId = `LOG-${now}-${Math.random().toString(36).substring(2, 8)}`;
    const sanitizedMsg = SecuritySanitizer.sanitizeText(message, 500);

    const entry: StructuredLogEntry = {
      eventId,
      timestamp: now,
      isoTime: new Date(now).toISOString(),
      category,
      severity,
      message: sanitizedMsg,
      sessionId: context?.sessionId ? SecuritySanitizer.sanitizeText(context.sessionId, 64) : undefined,
      antId: context?.antId ? SecuritySanitizer.sanitizeText(context.antId, 64) : undefined,
      experimentId: context?.experimentId ? SecuritySanitizer.sanitizeText(context.experimentId, 64) : undefined,
      modelVersion: context?.modelVersion ? SecuritySanitizer.sanitizeText(context.modelVersion, 32) : undefined,
      metadata: context?.metadata ? this.sanitizeMetadata(context.metadata) : undefined,
    };

    // Store in ring buffer
    this.logs.push(entry);
    if (this.logs.length > this.maxBufferedLogs) {
      this.logs.shift();
    }

    // Notify listeners (e.g. UI log terminal)
    for (const listener of this.listeners) {
      try {
        listener(entry);
      } catch {
        // Prevent listener failures from breaking application flow
      }
    }

    // Console output when meeting severity threshold
    this.outputToConsole(entry);

    return entry;
  }

  public debug(category: LogCategory, message: string, metadata?: Record<string, unknown>): void {
    this.log(category, 'DEBUG', message, { metadata });
  }

  public info(category: LogCategory, message: string, metadata?: Record<string, unknown>): void {
    this.log(category, 'INFO', message, { metadata });
  }

  public warn(category: LogCategory, message: string, metadata?: Record<string, unknown>): void {
    this.log(category, 'WARN', message, { metadata });
  }

  public error(category: LogCategory, message: string, err?: unknown, metadata?: Record<string, unknown>): void {
    const errorMsg = err ? `${message}: ${SecuritySanitizer.formatSafeErrorMessage(err)}` : message;
    this.log(category, 'ERROR', errorMsg, { metadata });
  }

  public security(message: string, metadata?: Record<string, unknown>): void {
    this.log('SECURITY', 'SECURITY', message, { metadata });
  }

  /**
   * Logs an authoritative ant runtime event.
   */
  public logAntEvent(
    eventType: AntRuntimeEventType,
    antId: string,
    message: string,
    metadata?: Record<string, unknown>
  ): void {
    this.log('ANT', 'INFO', `[${eventType}] ${message}`, {
      antId,
      metadata: { eventType, ...metadata },
    });
  }

  public getRecentLogs(count: number = 100, category?: LogCategory, minSeverity?: LogSeverity): StructuredLogEntry[] {
    let filtered = this.logs;
    if (category) {
      filtered = filtered.filter(l => l.category === category);
    }
    if (minSeverity) {
      const severityOrder: Record<LogSeverity, number> = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, SECURITY: 4 };
      const minLevel = severityOrder[minSeverity] ?? 0;
      filtered = filtered.filter(l => (severityOrder[l.severity] ?? 0) >= minLevel);
    }
    return filtered.slice(-count);
  }

  public subscribe(listener: (entry: StructuredLogEntry) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public clear(): void {
    this.logs = [];
  }

  private sanitizeMetadata(meta: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(meta)) {
      if (typeof val === 'string') {
        sanitized[key] = SecuritySanitizer.sanitizeText(val, 200);
      } else if (typeof val === 'number' || typeof val === 'boolean' || val === null) {
        sanitized[key] = val;
      } else if (typeof val === 'object') {
        try {
          sanitized[key] = JSON.parse(JSON.stringify(val));
        } catch {
          sanitized[key] = '[Complex Object]';
        }
      }
    }
    return sanitized;
  }

  private outputToConsole(entry: StructuredLogEntry): void {
    const prefix = `[AntWire ${entry.category}][${entry.severity}]`;
    if (entry.severity === 'ERROR' || entry.severity === 'SECURITY') {
      console.error(prefix, entry.message, entry.metadata || '');
    } else if (entry.severity === 'WARN') {
      console.warn(prefix, entry.message, entry.metadata || '');
    } else if (entry.severity === 'INFO' && this.minConsoleSeverity === 'INFO') {
      console.info(prefix, entry.message);
    }
  }
}

export const logger = AntWireLogger.getInstance();
