# AntWire — Task & Environment API Guide

> **Created & Developed by [Nikhilesh H. Chavda](https://nik-portfolio-lime.vercel.app/)**  
> *Developer Guide: Creating Custom Ant Tasks, Environments, and MDP Reward Functions*  
> GitHub: [https://github.com/Nik-2208](https://github.com/Nik-2208) | LinkedIn: [https://www.linkedin.com/in/nikhilesh-chavda-2b779533a/](https://www.linkedin.com/in/nikhilesh-chavda-2b779533a/)

---

## 1. Overview

AntWire provides a standardized environment adapter interface enabling researchers and developers to define new tasks without modifying the core nervous system:

$$\text{observe} \xrightarrow{} \text{act} \xrightarrow{} \text{reward} \xrightarrow{} \text{next observation} \xrightarrow{} \text{done}$$

---

## 2. Quick-Start: Implementing a Custom Task Environment

To create a new task environment, extend `BaseTaskEnvironment` from `src/learning/task_environment_adapter.ts`:

```typescript
import {
  BaseTaskEnvironment,
  TaskAction,
  TaskObservation,
  TaskStepResult,
  TaskEnvironmentRegistry
} from './task_environment_adapter';
import { SimulationWorld } from '../simulation/world';
import { Ant } from '../ants/ant';

export class MazeNavigationEnvironment extends BaseTaskEnvironment {
  private targetLocation = { x: 10.0, y: 15.0 };

  constructor() {
    super({
      taskId: 'env-maze-nav-v1',
      name: 'Subterranean Labyrinth Navigation',
      category: 'NAVIGATION',
      observationDim: 14,
      actionDim: 2,
      maxEpisodeSteps: 400,
      rewardDescription: '+25.0 for reaching goal, -0.02 step penalty, shaped by Euclidean distance.',
      author: 'Your Name',
      version: '1.0.0',
    });
  }

  public reset(world?: SimulationWorld, ant?: Ant): TaskObservation {
    this.currentStep = 0;
    this.cumulativeReward = 0;
    this.isEpisodeActive = true;

    return {
      features: this.getFeatures(ant),
      timestep: 0,
      done: false,
      metadata: { target: this.targetLocation },
    };
  }

  public step(action: TaskAction, world?: SimulationWorld, ant?: Ant): TaskStepResult {
    this.currentStep++;
    let reward = -0.02; // Baseline kinetic cost
    let completed = false;

    if (ant) {
      const dist = Math.hypot(
        ant.body.position.x - this.targetLocation.x,
        ant.body.position.y - this.targetLocation.y
      );

      // Distance-based reward shaping
      reward += Math.max(0, 1.0 - dist * 0.05);

      if (dist < 1.2) {
        reward += 25.0;
        completed = true;
      }
    }

    this.cumulativeReward += reward;
    const done = this.currentStep >= this.config.maxEpisodeSteps || completed;
    if (done) this.isEpisodeActive = false;

    return {
      observation: {
        features: this.getFeatures(ant),
        timestep: this.currentStep,
        done,
      },
      reward,
      done,
      info: {
        episodeStep: this.currentStep,
        cumulativeReward: this.cumulativeReward,
        taskCompleted: completed,
        taskName: this.config.name,
        metrics: { distanceToGoal: ant ? Math.hypot(ant.body.position.x - this.targetLocation.x, ant.body.position.y - this.targetLocation.y) : 0 },
      },
    };
  }

  public extractObservation(ant: Ant): TaskObservation {
    return {
      features: this.getFeatures(ant),
      timestep: this.currentStep,
      done: !this.isEpisodeActive,
    };
  }

  private getFeatures(ant?: Ant): number[] {
    if (!ant) return new Array(14).fill(0);
    const snap = ant.sensors.lastSnapshot;
    return [
      snap.foodLeft, snap.foodCenter, snap.foodRight,
      snap.nestLeft, snap.nestCenter, snap.nestRight,
      snap.foodOdorConcentration, snap.nestProximity,
      snap.obstacleCenter, snap.predatorDetected ? 1.0 : 0.0,
      ant.internalState.state.energy,
      ant.internalState.state.hunger,
      ant.internalState.state.carryingFoodAmount,
      ant.internalState.state.health,
    ];
  }
}

// Register into the global environment registry
TaskEnvironmentRegistry.register(new MazeNavigationEnvironment());
```

---

## 3. Supported Built-in Task Categories

| Category | Description | Primary Reward Signals |
| :--- | :--- | :--- |
| **`FORAGING`** | Food patch search, odor tracking, carbohydrate harvesting, nest delivery. | Food mass harvested, nest delivered, energy conserved. |
| **`EXPLORATION`** | Unexplored territory mapping, horizon coverage, novelty discovery. | Spatial hash grid cell discovery, info entropy gain. |
| **`NAVIGATION`** | Celestial polarization heading orientation, home-vector path integration. | Angle error to nest/target, obstacle avoidance. |
| **`KEYBOARD`** | Trained RL brain character typing & target key coordination demo. | Key target acquisition, stroke accuracy. |
| **`TRANSPORT`** | Heavy crystal multi-worker cooperative hauling. | Group alignment, transport speed, payload mass. |
| **`CONSTRUCTION`** | Subterranean chamber excavation, soil pellet surface mounding. | Excavated volume, wall integrity, mound height. |
| **`DEFENSE`** | Perimeter patrol, intruder alert broadcasting, venom stinging. | Predator deterrence, queen defense distance. |
| **`COOPERATION`**| Living bridge formation across terrain gaps, trophallaxis food sharing. | Gap span closure, worker transit throughput. |
| **`CUSTOM`** | Developer-defined arbitrary reward and sensory mapping functions. | Defined by developer. |

---

## 4. Standalone Training Loop Example

```typescript
import { PolicyTrainer } from '../learning/policy_trainer';
import { TaskEnvironmentRegistry } from '../learning/task_environment_adapter';

const env = TaskEnvironmentRegistry.get('env-foraging-v1')!;
const trainer = new PolicyTrainer({ task: 'FORAGE', learningRate: 0.01 });

// Execute training episode
let obs = env.reset();
while (!env.isDone()) {
  const action = trainer.selectAction(obs.features);
  const result = env.step(action);
  trainer.recordStep(obs.features, action, result.reward, result.done);
  obs = result.observation;
}

trainer.optimize();
console.log(`Episode complete. Total Reward: ${env.getCumulativeReward()}`);
```
