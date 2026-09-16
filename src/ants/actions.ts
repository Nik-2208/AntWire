/**
 * ANT BRAIN — Motor Actions & Physical Interventions
 */

import { ActionType, AntAction, PheromoneChannel } from '../simulation/types';

export class ActionFactory {
  public static move(throttle = 1.0, turnAngle = 0.0): AntAction {
    return {
      type: 'MOVE_FORWARD',
      speedMultiplier: throttle,
      turnAngle: turnAngle,
    };
  }

  public static turn(turnAngle: number): AntAction {
    return {
      type: turnAngle < 0 ? 'TURN_LEFT' : 'TURN_RIGHT',
      turnAngle: turnAngle,
      speedMultiplier: 0.3,
    };
  }

  public static collectFood(foodId: string): AntAction {
    return {
      type: 'COLLECT_FOOD',
      speedMultiplier: 0.0,
      metadata: { foodId },
    };
  }

  public static depositFood(): AntAction {
    return {
      type: 'DEPOSIT_FOOD',
      speedMultiplier: 0.0,
    };
  }

  public static depositPheromone(channel: PheromoneChannel, strength = 1.0): AntAction {
    return {
      type: 'DEPOSIT_PHEROMONE',
      depositPheromoneType: channel,
      depositPheromoneStrength: strength,
    };
  }

  public static flee(fleeTurnAngle: number): AntAction {
    return {
      type: 'FLEE',
      turnAngle: fleeTurnAngle,
      speedMultiplier: 1.4, // Burst speed when evading
      depositPheromoneType: PheromoneChannel.ALARM,
      depositPheromoneStrength: 0.8,
    };
  }

  public static rest(): AntAction {
    return {
      type: 'REST',
      speedMultiplier: 0.0,
    };
  }

  public static stop(): AntAction {
    return {
      type: 'REST',
      speedMultiplier: 0.0,
      turnAngle: 0.0,
    };
  }

  public static interact(): AntAction {
    return {
      type: 'INTERACT',
      speedMultiplier: 0.0,
    };
  }
}
