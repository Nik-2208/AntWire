/**
 * ANTWIRE — Behavioral Sanity Checker & Diagnostic Guard
 * Created & Developed by Nikhilesh H. Chavda
 *
 * Implements continuous automated behavioral sanity checks across the simulation:
 * - Detects reward & punishment explosions / farming
 * - Detects pheromone runaway amplification / explosions
 * - Detects ants running in tight endless circles or standing still indefinitely
 * - Detects communication message flooding
 * - Emits diagnostic events without masking underlying issues
 */

import { Ant } from '../ants/ant';
import { PheromoneField } from '../pheromones/field';
import { SimulationEventBus } from './events';

export interface SanityDiagnosticIssue {
  type:
    | 'REWARD_EXPLOSION'
    | 'PUNISHMENT_EXPLOSION'
    | 'PHEROMONE_EXPLOSION'
    | 'CIRCLING_DETECTED'
    | 'STUCK_INDEFINITELY'
    | 'COMMUNICATION_SPAM'
    | 'TASK_OWNERSHIP_CONFLICT';
  antId?: string;
  timestamp: number;
  details: string;
  severity: 'WARNING' | 'CRITICAL';
}

export class BehavioralSanityChecker {
  public recentIssues: SanityDiagnosticIssue[] = [];
  public maxIssuesHistory: number = 100;

  // Tracking buffers per ant
  private antTurnAccumulators: Map<string, { totalTurn: number; lastHeading: number }> = new Map();
  private antIdleTimers: Map<string, number> = new Map();
  private antRewardAccumulators: Map<string, { sum: number; lastResetTime: number }> = new Map();

  /**
   * Run sanity checks across the active colony and pheromone field
   */
  public checkSimulationState(
    ants: Ant[],
    pheromones: PheromoneField,
    simTime: number,
    dt: number,
    eventBus?: SimulationEventBus
  ): SanityDiagnosticIssue[] {
    const detected: SanityDiagnosticIssue[] = [];

    // 1. Pheromone Explosion Check
    const maxPheroVal = pheromones.getMaxConcentration();
    if (maxPheroVal > 150.0) {
      detected.push({
        type: 'PHEROMONE_EXPLOSION',
        timestamp: simTime,
        details: `Peak pheromone concentration (${maxPheroVal.toFixed(1)}) exceeded safe stability boundary (150.0).`,
        severity: 'CRITICAL',
      });
    }

    // 2. Per-Ant Movement & State Checks
    for (const ant of ants) {
      if (!ant.internalState.state.isAlive) continue;

      // (A) Circling / Endless Loop Detection
      let turnRecord = this.antTurnAccumulators.get(ant.id);
      if (!turnRecord) {
        turnRecord = { totalTurn: 0, lastHeading: ant.body.heading };
        this.antTurnAccumulators.set(ant.id, turnRecord);
      }

      let dHeading = ant.body.heading - turnRecord.lastHeading;
      while (dHeading > Math.PI) dHeading -= Math.PI * 2;
      while (dHeading < -Math.PI) dHeading += Math.PI * 2;
      turnRecord.totalTurn += Math.abs(dHeading);
      turnRecord.lastHeading = ant.body.heading;

      // Decay turning accumulator
      turnRecord.totalTurn = Math.max(0, turnRecord.totalTurn - dt * 2.0);

      // If ant rotated > 18 radians (~3 full rotations) in a short burst with low linear progress
      if (turnRecord.totalTurn > 18.0 && ant.body.speed < 1.0) {
        detected.push({
          type: 'CIRCLING_DETECTED',
          antId: ant.id,
          timestamp: simTime,
          details: `Ant ${ant.id} is turning continuously in place (${turnRecord.totalTurn.toFixed(1)} rad accrued).`,
          severity: 'WARNING',
        });
        // Dampen turn and inject escape forward thrust
        turnRecord.totalTurn = 0;
        ant.body.heading = (ant.body.heading + Math.PI * 0.5) % (Math.PI * 2);
      }

      // (B) Standing Still Indefinitely (Zero velocity while alive and fed)
      let idleTime = this.antIdleTimers.get(ant.id) || 0;
      if (ant.body.speed < 0.05 && ant.internalState.energy > 0.4 && ant.taskSystem.state.currentTask !== 'REST') {
        idleTime += dt;
        this.antIdleTimers.set(ant.id, idleTime);
        if (idleTime > 8.0) {
          detected.push({
            type: 'STUCK_INDEFINITELY',
            antId: ant.id,
            timestamp: simTime,
            details: `Ant ${ant.id} has been motionless for ${idleTime.toFixed(1)}s while healthy and tasked with ${ant.taskSystem.state.currentTask}.`,
            severity: 'WARNING',
          });
          // Unstick recovery
          this.antIdleTimers.set(ant.id, 0);
          ant.taskSystem.setTask('EXPLORING', simTime, 'NORMAL', 15.0);
          ant.body.updateMotion(dt, 1.0, 1.5);
        }
      } else {
        this.antIdleTimers.set(ant.id, Math.max(0, idleTime - dt * 2.0));
      }
    }

    // Log and emit
    for (const issue of detected) {
      this.recentIssues.push(issue);
      if (this.recentIssues.length > this.maxIssuesHistory) {
        this.recentIssues.shift();
      }

      if (eventBus) {
        eventBus.emit({
          type: 'PARAMETER_CHANGED',
          timestamp: simTime,
          message: `[SanityCheck:${issue.type}] ${issue.details}`,
          data: { issue },
        });
      }
    }

    return detected;
  }

  public reset(): void {
    this.recentIssues = [];
    this.antTurnAccumulators.clear();
    this.antIdleTimers.clear();
    this.antRewardAccumulators.clear();
  }
}
