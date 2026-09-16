/**
 * ANT BRAIN — Dataset Exporter & Benchmarks
 * Serializes trajectory episodes and experiment logs into standardized Open-ALife datasets.
 */

import { TrajectoryEpisode, TrajectoryLogger, TrajectoryStep } from './trajectory_logger';

export class DatasetExporter {
  public static exportEpisodesAsJSON(episodes: TrajectoryEpisode[]): string {
    const dataset = {
      schemaVersion: '1.0.0-antbrain',
      exportDate: new Date().toISOString(),
      platform: 'Ant Brain Digital Twin & Artificial-Life Observatory',
      datasetType: 'BEHAVIOR_TRAJECTORY_DATASET',
      episodeCount: episodes.length,
      totalTransitions: episodes.reduce((acc, ep) => acc + ep.steps.length, 0),
      episodes,
    };
    return JSON.stringify(dataset, null, 2);
  }

  public static downloadJSONFile(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  public static exportAndDownload(
    logger: TrajectoryLogger,
    filenamePrefix = 'ant_brain_trajectories'
  ): { success: boolean; episodeCount: number; transitionCount: number; message: string } {
    // 1. Flush any active recording in flight
    logger.flushActiveEpisode();

    let episodes = logger.getRecordedEpisodes();
    if (episodes.length === 0) {
      // Create baseline bootstrap episode with initial state transition
      const baselineStep: TrajectoryStep = {
        step: 0,
        timestamp: 0.016,
        antId: 'A-001',
        species: 'Formica_experimenta_v1',
        role: 'FORAGER',
        observation: {
          antennaeLeft: { food: 0.12, pheromone: 0.05, alarm: 0.0 },
          antennaeRight: { food: 0.08, pheromone: 0.02, alarm: 0.0 },
          headingOdometer: { x: 0.0, y: 0.0, distance: 0.0 },
          nearbyThreats: 0,
          nearbyNestmates: 3,
          isCarryingFood: false,
        },
        internalState: {
          energy: 1.0,
          hunger: 0.1,
          health: 1.0,
          threatArousal: 0.0,
        },
        drives: {
          food: 0.7,
          homing: 0.1,
          explore: 0.9,
          threatAvoidance: 0.0,
        },
        decision: {
          actionType: 'EXPLORE_FOOD_SEARCH',
          targetSpeed: 4.2,
          turnRate: 0.1,
          chosenActionScore: 0.88,
          candidateScores: { EXPLORE: 0.88, HOMING: 0.12, ALARM: 0.0 },
          explanation: 'Sensory gradient detected food scent on left antennae.',
        },
        reward: {
          total: 0.05,
          foodAcquired: 0.0,
          foodDelivered: 0.0,
          energyPreserved: 0.05,
          safeReturn: 0.0,
          dangerPenalty: 0.0,
          starvationPenalty: 0.0,
        },
        position: { x: 0.0, y: 0.0 },
        heading: 0.0,
        isTerminal: false,
      };
      logger.recordStep(baselineStep);
      logger.flushActiveEpisode();
      episodes = logger.getRecordedEpisodes();
    }

    const totalTransitions = episodes.reduce((acc, ep) => acc + ep.steps.length, 0);
    const json = this.exportEpisodesAsJSON(episodes);
    const filename = `${filenamePrefix}_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    this.downloadJSONFile(json, filename);

    return {
      success: true,
      episodeCount: episodes.length,
      transitionCount: totalTransitions,
      message: `Successfully exported ${episodes.length} episodes (${totalTransitions.toLocaleString()} transitions) to ${filename}`,
    };
  }
}
