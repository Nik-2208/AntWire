/**
 * ANTWIRE — Explicit Sensory Transduction & Motor Mapping
 * Created & Developed by Nikhilesh H. Chavda
 *
 * Implements unambiguous, documented mappings from environmental sensors through
 * intermediate neural layers to motor actuators without hidden shortcuts:
 * SENSORS -> RECEPTOR CODES -> SENSORY NEURONS -> INTERMEDIATE CIRCUITS -> DECISION -> MOTOR COMMANDS -> BODY
 */

import { AntSensorySnapshot, AntInternalState, AntDrives, AntAction, PheromoneChannel } from '../../simulation/types';
import { ActionFactory } from '../actions';

export interface SensoryChannelDefinition {
  channelId: string;
  name: string;
  receptiveField: string;
  inputDimension: number;
  physicalUnits: string;
  normalizationRange: [number, number];
  targetNeuronIds: string[];
}

export const SENSORY_CHANNELS: SensoryChannelDefinition[] = [
  {
    channelId: 'CHEMO_FOOD_L',
    name: 'Left Antenna Food Volatiles',
    receptiveField: 'Antennal flagellum sensilla basiconica (Left)',
    inputDimension: 1,
    physicalUnits: 'normalized chemical concentration [0.0 - 1.0]',
    normalizationRange: [0.0, 1.0],
    targetNeuronIds: ['AL-ORN-FOOD-L'],
  },
  {
    channelId: 'CHEMO_FOOD_R',
    name: 'Right Antenna Food Volatiles',
    receptiveField: 'Antennal flagellum sensilla basiconica (Right)',
    inputDimension: 1,
    physicalUnits: 'normalized chemical concentration [0.0 - 1.0]',
    normalizationRange: [0.0, 1.0],
    targetNeuronIds: ['AL-ORN-FOOD-R'],
  },
  {
    channelId: 'CHEMO_TRAIL_L',
    name: 'Left Antenna Pheromone Trail',
    receptiveField: 'Antennal flagellum sensilla trichodea (Left)',
    inputDimension: 1,
    physicalUnits: 'pheromone intensity [0.0 - 1.0]',
    normalizationRange: [0.0, 1.0],
    targetNeuronIds: ['AL-ORN-TRAIL-L'],
  },
  {
    channelId: 'CHEMO_TRAIL_R',
    name: 'Right Antenna Pheromone Trail',
    receptiveField: 'Antennal flagellum sensilla trichodea (Right)',
    inputDimension: 1,
    physicalUnits: 'pheromone intensity [0.0 - 1.0]',
    normalizationRange: [0.0, 1.0],
    targetNeuronIds: ['AL-ORN-TRAIL-R'],
  },
  {
    channelId: 'CHEMO_ALARM',
    name: 'Alarm Pheromone Concentration',
    receptiveField: 'Antennal flagellum T6 glomerulus receptive field',
    inputDimension: 1,
    physicalUnits: 'terpene concentration [0.0 - 1.0]',
    normalizationRange: [0.0, 1.0],
    targetNeuronIds: ['AL-ORN-ALARM-L', 'AL-ORN-ALARM-R'],
  },
  {
    channelId: 'VISION_HEADING',
    name: 'Celestial Polarized UV Heading',
    receptiveField: 'Dorsal Rim Area (DRA) compound eye ommatidia',
    inputDimension: 1,
    physicalUnits: 'radians [0.0 - 2*PI)',
    normalizationRange: [0.0, 6.2831853],
    targetNeuronIds: ['CX-EB-RING-W01', 'CX-EB-RING-W08', 'CX-EB-RING-W16'],
  },
  {
    channelId: 'MECHANO_ODOMETER',
    name: 'Step Velocity & Optic Flow Odometer',
    receptiveField: 'Campaniform sensilla & ventral optic flow speed',
    inputDimension: 1,
    physicalUnits: 'meters / second',
    normalizationRange: [0.0, 2.5],
    targetNeuronIds: ['CX-NO-ODOMETER-01', 'CX-NO-ODOMETER-02'],
  },
  {
    channelId: 'HOMEOSTATIC_HUNGER',
    name: 'Internal Metabolic Energy Deficit',
    receptiveField: 'Corpora cardiaca & crop distension stretch receptors',
    inputDimension: 1,
    physicalUnits: 'hunger level [0.0 - 1.0]',
    normalizationRange: [0.0, 1.0],
    targetNeuronIds: ['SEZ-GUSTATORY-SUGAR', 'OAN-VUMmx1-REWARD'],
  },
];

export interface MotorOutputChannel {
  channelId: string;
  name: string;
  actuator: string;
  sourceCircuit: string;
  outputRange: [number, number];
  biologicalTarget: string;
}

export const MOTOR_CHANNELS: MotorOutputChannel[] = [
  {
    channelId: 'STEERING_BIAS',
    name: 'Bilateral Turning Differential',
    actuator: 'Tripod Gait Angular Differential',
    sourceCircuit: 'DECISION_AND_STEERING (LAL)',
    outputRange: [-1.8, 1.8], // radians
    biologicalTarget: 'Thoracic T1/T2/T3 motor neuron phase shift',
  },
  {
    channelId: 'FORWARD_THRUST',
    name: 'Locomotor Step Frequency / Thrust',
    actuator: 'Thoracic Central Pattern Generator (CPG)',
    sourceCircuit: 'MOTOR_SELECTION (SEZ/VNC)',
    outputRange: [0.0, 1.5], // normalized speed multiplier
    biologicalTarget: 'Metathoracic T3 propulsion motor neurons',
  },
  {
    channelId: 'MANDIBULAR_GRASP',
    name: 'Mandible Closing / Grasp Reflex',
    actuator: 'Mandibular Adductor Muscles',
    sourceCircuit: 'MOTOR_SELECTION (SEZ)',
    outputRange: [0, 1], // binary trigger
    biologicalTarget: 'Subesophageal mandibular motor neurons',
  },
  {
    channelId: 'PHEROMONE_EXTRUSION',
    name: 'Dufour / Venom Trail Pheromone Release',
    actuator: 'Abdominal Pheromone Gland Sphincter',
    sourceCircuit: 'COMMUNICATION_AND_RECRUITMENT (AG)',
    outputRange: [0.0, 1.0], // deposition intensity
    biologicalTarget: 'Abdominal ganglion 7 gland-associated motor units',
  },
];

export class SensoryMotorMapper {
  /**
   * Convert environmental sensors into continuous neural injection currents
   */
  public static mapSensorsToReceptors(
    sensors: AntSensorySnapshot,
    internalState: AntInternalState,
    _drives: AntDrives
  ): Map<string, number> {
    const injections = new Map<string, number>();

    // Chemosensory food basiconica sensilla
    injections.set('AL-ORN-FOOD-L', Math.max(0, Math.min(1.0, sensors.foodLeft || 0)));
    injections.set('AL-ORN-FOOD-R', Math.max(0, Math.min(1.0, sensors.foodRight || 0)));

    // Trail pheromone trichodea sensilla (using home/food gradient sampling)
    injections.set('AL-ORN-TRAIL-L', Math.max(0, Math.min(1.0, sensors.homeLeft || 0)));
    injections.set('AL-ORN-TRAIL-R', Math.max(0, Math.min(1.0, sensors.homeRight || 0)));

    // Alarm terpene
    const alarmLevel = sensors.predatorDetected || sensors.alarmCenter > 0.3 ? 0.9 : 0.0;
    injections.set('AL-ORN-ALARM-L', alarmLevel);
    injections.set('AL-ORN-ALARM-R', alarmLevel);

    // Odometer
    injections.set('CX-NO-ODOMETER-01', 0.8);
    injections.set('CX-NO-ODOMETER-02', 0.8);

    // Gustatory / metabolic
    injections.set('SEZ-GUSTATORY-SUGAR', internalState.hunger || 0.2);

    return injections;
  }

  /**
   * Convert premotor and descending neural activations into physical AntAction
   */
  public static mapPremotorToActuators(
    steerAngle: number,
    forwardThrust: number,
    mandibleGrasp: boolean,
    depositPheromone?: PheromoneChannel,
    pheromoneStrength: number = 0
  ): AntAction {
    if (mandibleGrasp) {
      return ActionFactory.interact();
    }

    if (depositPheromone !== undefined && pheromoneStrength > 0.1) {
      return ActionFactory.depositPheromone(depositPheromone, pheromoneStrength);
    }

    if (Math.abs(steerAngle) > 0.05 && forwardThrust > 0.1) {
      return ActionFactory.move(forwardThrust, steerAngle);
    }

    if (Math.abs(steerAngle) > 0.05) {
      return ActionFactory.turn(steerAngle);
    }

    if (forwardThrust > 0.05) {
      return ActionFactory.move(forwardThrust, 0.0);
    }

    return ActionFactory.stop();
  }
}
