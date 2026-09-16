/**
 * ANTWIRE — Collaborative Multi-Agent Tasks & Contribution-Aware Credit Engine
 * Created & Developed by Nikhilesh H. Chavda
 *
 * Implements cooperative superorganism task allocation where multi-agent tasks
 * cannot be completed by a single ant alone. Features dynamic recruitment,
 * failure recovery, and contribution-aware individual vs team reward credit assignment.
 */

import { AuthoritativeRewardEvent, Vector2D } from '../simulation/types';

export type CollaborativeCoordinationState =
  | 'FORMING'
  | 'READY'
  | 'COORDINATING'
  | 'ACTING'
  | 'PARTIAL_SUCCESS'
  | 'COMPLETED'
  | 'FAILED'
  | 'RECOVERING';

export type CollaborativeTaskType =
  | 'COLLECTIVE_HEAVY_TRANSPORT'
  | 'COOPERATIVE_DEFENSE_MOB'
  | 'LIVING_BRIDGE_CONSTRUCTION'
  | 'CHAMBER_EXCAVATION_COOP';

export interface CollaborativeTaskInstance {
  taskId: string;
  type: CollaborativeTaskType;
  requiredAgents: number;
  participants: string[]; // Ant IDs
  roles: Record<string, string>; // Ant ID -> assigned role
  individualContributions: Record<string, number>; // Ant ID -> accumulated contribution score
  groupProgress: number; // [0, 1]
  coordinationState: CollaborativeCoordinationState;
  targetPosition: Vector2D;
  destinationPosition?: Vector2D;
  creationTime: number;
  lastProgressTime: number;
  timeoutSeconds: number;
  itemWeightMg: number;
}

export class CollaborativeTaskManager {
  public tasks: CollaborativeTaskInstance[] = [];
  private taskCounter: number = 0;

  /**
   * Create a new cooperative task requiring multiple ants
   */
  public createCollaborativeTask(
    type: CollaborativeTaskType,
    targetPosition: Vector2D,
    requiredAgents: number,
    itemWeightMg: number,
    simTime: number,
    destinationPosition?: Vector2D
  ): CollaborativeTaskInstance {
    this.taskCounter++;
    const task: CollaborativeTaskInstance = {
      taskId: `coop-task-${this.taskCounter}-${Math.floor(simTime)}`,
      type,
      requiredAgents: Math.max(2, requiredAgents),
      participants: [],
      roles: {},
      individualContributions: {},
      groupProgress: 0.0,
      coordinationState: 'FORMING',
      targetPosition: { ...targetPosition },
      destinationPosition: destinationPosition ? { ...destinationPosition } : undefined,
      creationTime: simTime,
      lastProgressTime: simTime,
      timeoutSeconds: 45.0,
      itemWeightMg,
    };

    this.tasks.push(task);
    return task;
  }

  /**
   * Register an ant joining a collaborative task
   */
  public joinTask(taskId: string, antId: string, assignedRole: string = 'PARTICIPANT'): boolean {
    const task = this.tasks.find((t) => t.taskId === taskId);
    if (!task) return false;

    if (!task.participants.includes(antId)) {
      task.participants.push(antId);
      task.roles[antId] = assignedRole;
      if (task.individualContributions[antId] === undefined) {
        task.individualContributions[antId] = 0;
      }
    }

    if (task.coordinationState === 'FORMING' && task.participants.length >= task.requiredAgents) {
      task.coordinationState = 'READY';
    } else if (task.coordinationState === 'RECOVERING' && task.participants.length >= task.requiredAgents) {
      task.coordinationState = 'COORDINATING';
    }

    return true;
  }

  /**
   * Record individual active contribution (e.g. lifting, biting, excavating)
   */
  public recordContribution(taskId: string, antId: string, contributionDelta: number): void {
    const task = this.tasks.find((t) => t.taskId === taskId);
    if (!task || !task.participants.includes(antId)) return;

    task.individualContributions[antId] = (task.individualContributions[antId] || 0) + Math.max(0, contributionDelta);
  }

  /**
   * Step collaborative task state machines
   */
  public update(
    dt: number,
    simTime: number,
    activeLivingAntIds: Set<string>,
    antPositions: Map<string, Vector2D>
  ): AuthoritativeRewardEvent[] {
    const rewardEvents: AuthoritativeRewardEvent[] = [];

    for (let i = this.tasks.length - 1; i >= 0; i--) {
      const task = this.tasks[i];

      // 1. Detect participant dropouts or deaths
      const remainingParticipants: string[] = [];
      for (const antId of task.participants) {
        if (!activeLivingAntIds.has(antId)) {
          // Ant died or was eliminated
          continue;
        }
        const pos = antPositions.get(antId);
        if (pos) {
          const dx = pos.x - task.targetPosition.x;
          const dy = pos.y - task.targetPosition.y;
          const dist = Math.hypot(dx, dy);
          // If ant wandered too far away (> 15m), considered abandoned
          if (dist > 18.0 && task.coordinationState !== 'FORMING') {
            continue;
          }
        }
        remainingParticipants.push(antId);
      }

      task.participants = remainingParticipants;

      // 2. Check if team is understaffed
      if (task.participants.length < task.requiredAgents) {
        if (task.coordinationState === 'ACTING' || task.coordinationState === 'COORDINATING') {
          // Failure recovery transition: detect -> recruit/replan -> continue
          task.coordinationState = 'RECOVERING';
        }
      }

      // 3. Progress State Machine
      if (task.coordinationState === 'READY') {
        task.coordinationState = 'COORDINATING';
      } else if (task.coordinationState === 'COORDINATING') {
        if (task.participants.length >= task.requiredAgents) {
          task.coordinationState = 'ACTING';
        }
      } else if (task.coordinationState === 'ACTING') {
        // Calculate collective lifting / action power
        const totalEffort = Object.values(task.individualContributions).reduce((a, b) => a + b, 0);
        const progressRate = (0.05 * task.participants.length) / Math.max(1, task.requiredAgents);
        task.groupProgress = Math.min(1.0, task.groupProgress + progressRate * dt);
        task.lastProgressTime = simTime;

        if (task.groupProgress >= 1.0) {
          task.coordinationState = 'COMPLETED';

          // 4. Distribute contribution-aware rewards
          const totalContribution = Object.values(task.individualContributions).reduce((a, b) => a + b, 0);
          const baseTeamReward = 8.0;
          const baseIndividualPool = 12.0;

          for (const antId of task.participants) {
            const effort = task.individualContributions[antId] || 0;
            // No full reward for zero-effort ants
            if (effort <= 0 && totalContribution > 0) continue;

            const contributionRatio = totalContribution > 0 ? effort / totalContribution : 1.0 / task.participants.length;
            const indivReward = baseIndividualPool * contributionRatio;
            const teamReward = baseTeamReward / task.participants.length;
            const totalReward = parseFloat((indivReward + teamReward).toFixed(2));

            rewardEvents.push({
              rewardEventId: `rew-coop-${task.taskId}-${antId}`,
              antId,
              taskId: task.taskId,
              timestamp: simTime,
              eventType: 'COOPERATION',
              action: `Completed ${task.type}`,
              result: 'SUCCESS',
              value: totalReward,
              reason: `Collaborative effort contribution ${(contributionRatio * 100).toFixed(1)}% + team completion bonus.`,
              individualContribution: parseFloat(indivReward.toFixed(2)),
              teamSuccess: parseFloat(teamReward.toFixed(2)),
            });
          }
        }
      }

      // 5. Timeout or Abandonment
      if (simTime - task.lastProgressTime > task.timeoutSeconds) {
        if (task.groupProgress > 0.4) {
          task.coordinationState = 'PARTIAL_SUCCESS';
        } else {
          task.coordinationState = 'FAILED';
        }
      }

      // Cleanup finished tasks after retention
      if (task.coordinationState === 'COMPLETED' || task.coordinationState === 'FAILED' || task.coordinationState === 'PARTIAL_SUCCESS') {
        if (simTime - task.lastProgressTime > 8.0) {
          this.tasks.splice(i, 1);
        }
      }
    }

    return rewardEvents;
  }

  /**
   * Find available tasks needing recruits near a given position
   */
  public getJoinableTasks(position: Vector2D, maxRadius: number = 16.0): CollaborativeTaskInstance[] {
    return this.tasks.filter((t) => {
      if (t.coordinationState !== 'FORMING' && t.coordinationState !== 'RECOVERING') return false;
      if (t.participants.length >= t.requiredAgents) return false;
      const dx = t.targetPosition.x - position.x;
      const dy = t.targetPosition.y - position.y;
      return Math.hypot(dx, dy) <= maxRadius;
    });
  }
}
