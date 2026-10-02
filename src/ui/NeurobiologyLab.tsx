/**
 * ANTWIRE — Real-Time Neurobiology Laboratory & Neuropil Activity Visualizer
 * Exposes live physiological signals across the Antennal Lobes (AL), Mushroom Bodies (MB),
 * and Central Complex (CX) Ring Attractor & Path Integration Home Vector.
 */

import React from 'react';
import { Ant } from '../ants/ant';
import { BiologicalBrainController } from '../ants/controllers/biological_brain';
import { Brain, Compass, Sparkles, Zap, Activity, Radio, AlertCircle, Eye, ArrowUpRight, Navigation, ShieldAlert, Cpu } from 'lucide-react';
import { ScientificBadge } from './ScientificBadge';
import { BiologyInfoPopup } from './BiologyInfoPopup';

export interface SenseDirectionVector {
  type: 'FOOD' | 'PHEROMONE' | 'HOME/NEST' | 'THREAT' | 'TARGET' | 'NESTMATE';
  rawRelAngleRad: number;
  deg: number;
  arrow: string;
  label: string;
  strength: number;
  colorClass: string;
}

export function computeAntSenseDirections(ant: Ant) {
  const sensors = ant.sensors.lastSnapshot;
  const headingDeg = Math.round(((ant.body.heading * (180 / Math.PI)) % 360 + 360) % 360);

  const leftAntennaPct = Math.round(Math.max(sensors.foodLeft, sensors.homeLeft, sensors.alarmLeft) * 100);
  const rightAntennaPct = Math.round(Math.max(sensors.foodRight, sensors.homeRight, sensors.alarmRight) * 100);

  const vectors: SenseDirectionVector[] = [];

  const addVector = (
    type: SenseDirectionVector['type'],
    relRad: number,
    strength: number,
    colorClass: string
  ) => {
    let rel = relRad;
    while (rel > Math.PI) rel -= Math.PI * 2;
    while (rel < -Math.PI) rel += Math.PI * 2;

    const deg = Math.round(Math.abs(rel) * (180 / Math.PI));
    const degSigned = rel * (180 / Math.PI);
    let arrow = '↑';
    let label = 'AHEAD';

    if (degSigned >= -22.5 && degSigned <= 22.5) {
      arrow = '↑'; label = 'AHEAD';
    } else if (degSigned > 22.5 && degSigned <= 67.5) {
      arrow = '↗'; label = 'AHEAD RIGHT';
    } else if (degSigned > 67.5 && degSigned <= 112.5) {
      arrow = '→'; label = 'RIGHT';
    } else if (degSigned > 112.5 && degSigned <= 157.5) {
      arrow = '↘'; label = 'BEHIND RIGHT';
    } else if (degSigned > 157.5 || degSigned < -157.5) {
      arrow = '↓'; label = 'BEHIND';
    } else if (degSigned >= -157.5 && degSigned < -112.5) {
      arrow = '↙'; label = 'BEHIND LEFT';
    } else if (degSigned >= -112.5 && degSigned < -67.5) {
      arrow = '←'; label = 'LEFT';
    } else if (degSigned >= -67.5 && degSigned < -22.5) {
      arrow = '↖'; label = 'AHEAD LEFT';
    }

    vectors.push({ type, rawRelAngleRad: rel, deg, arrow, label, strength, colorClass });
  };

  // 1. FOOD
  const foodStr = Math.max(
    sensors.foodOdorConcentration,
    sensors.foodProximity,
    (sensors.foodLeft + sensors.foodRight + sensors.foodCenter) / 3
  );
  if (foodStr > 0.04 || sensors.detectedFoodId) {
    addVector('FOOD', sensors.foodOdorDirection, Math.max(0.1, foodStr), 'text-emerald-400');
  }

  // 2. PHEROMONE
  const pheroStr = Math.max(sensors.foodCenter, sensors.foodLeft, sensors.foodRight, sensors.homeCenter);
  if (pheroStr > 0.02) {
    const pheroRel = (sensors.foodRight - sensors.foodLeft) * 1.5;
    addVector('PHEROMONE', pheroRel, pheroStr, 'text-cyan-400');
  }

  // 3. HOME/NEST
  const homeStr = Math.max(sensors.nestOdorConcentration, sensors.isAtNestEntrance ? 1.0 : 0.0);
  if (homeStr > 0.02 || ant.taskSystem.state.currentTask === 'RETURNING_TO_NEST') {
    addVector('HOME/NEST', sensors.nestOdorDirection, Math.max(0.15, homeStr), 'text-blue-400');
  }

  // 4. THREAT
  const threatStr = Math.max(sensors.predatorProximity, sensors.alarmCenter, sensors.alarmLeft, sensors.alarmRight);
  if (threatStr > 0.04 || sensors.predatorDetected) {
    addVector('THREAT', sensors.predatorRelativeAngle, Math.max(0.2, threatStr), 'text-rose-400');
  }

  // 5. TARGET
  const targetPos = ant.taskSystem.state.targetPosition;
  if (targetPos) {
    const dx = targetPos.x - ant.body.position.x;
    const dy = targetPos.y - ant.body.position.y;
    const worldAngle = Math.atan2(dy, dx);
    const relTarget = worldAngle - ant.body.heading;
    const dist = Math.hypot(dx, dy);
    addVector('TARGET', relTarget, Math.max(0.2, 1.0 - dist / 30.0), 'text-amber-400');
  }

  // 6. NESTMATE
  if (sensors.nearbyAntsCount > 0 && sensors.nearestAntDistance !== undefined) {
    const mateDist = sensors.nearestAntDistance;
    if (mateDist < 12.0) {
      addVector(
        'NESTMATE',
        0,
        Math.max(0.1, 1.0 - mateDist / 12.0),
        'text-purple-400'
      );
    }
  }

  vectors.sort((a, b) => b.strength - a.strength);
  const strongestVector = vectors.length > 0 ? vectors[0] : null;

  let sensorInput = 'Ambient volatile background';
  let sensoryNode = 'Antennal ORNs & Glomeruli T1';
  if (strongestVector) {
    sensorInput = `${strongestVector.type} vector at ${strongestVector.arrow} ${strongestVector.deg}° (${(strongestVector.strength * 100).toFixed(0)}% signal)`;
    if (strongestVector.type === 'FOOD') sensoryNode = 'Antennal Lobe Glomeruli (Food Plume)';
    else if (strongestVector.type === 'PHEROMONE') sensoryNode = 'AL Trail Tropotaxis Circuit';
    else if (strongestVector.type === 'HOME/NEST') sensoryNode = 'Central Complex Heading Attractor';
    else if (strongestVector.type === 'THREAT') sensoryNode = 'AL Alarm Glomerulus & Subesophageal Zone';
    else if (strongestVector.type === 'TARGET') sensoryNode = 'Central Complex Path Integrator';
    else if (strongestVector.type === 'NESTMATE') sensoryNode = 'Cuticular Hydrocarbon Olfactory Receptor';
  }

  const decision = `Task: ${ant.body.task.replace(/_/g, ' ')} (${ant.roleState.primaryRole})`;
  const motorOutput = `${ant.lastAction.type} (Heading: ${headingDeg}°, Speed: ${ant.body.speed.toFixed(1)}m/s)`;

  return {
    headingDeg,
    leftAntennaPct,
    rightAntennaPct,
    vectors,
    strongestVector,
    neuropolisFlow: {
      sensorInput,
      sensoryNode,
      decision,
      motorOutput,
    },
  };
}

interface NeurobiologyLabProps {
  ant: Ant | null;
}

export const NeurobiologyLab: React.FC<NeurobiologyLabProps> = ({ ant }) => {
  if (!ant) {
    return (
      <div className="glass-panel rounded-xl p-4 text-center text-slate-500 text-xs">
        <p>No ant selected for neurobiological telemetry.</p>
      </div>
    );
  }

  const isBio = ant.controller instanceof BiologicalBrainController;
  const bioCtrl = isBio ? (ant.controller as BiologicalBrainController) : null;
  const brainSnap = bioCtrl?.latestBrainSnapshot;
  const senseData = computeAntSenseDirections(ant);

  if (!brainSnap) {
    return (
      <div className="glass-panel rounded-xl p-4 text-center text-slate-400 text-xs space-y-2">
        <Brain className="w-6 h-6 mx-auto text-cyan-400 animate-pulse" />
        <p className="font-semibold text-slate-200">Initializing Neuropil Substrate...</p>
        <p className="text-[11px] text-slate-500">Ant {ant.id} is computing neural forward dynamics.</p>
      </div>
    );
  }

  const al = brainSnap.antennalLobe;
  const mb = brainSnap.mushroomBody;
  const cx = brainSnap.centralComplex;

  return (
    <div className="glass-panel rounded-xl p-3.5 flex flex-col gap-3 text-slate-200 shadow-2xl select-none max-h-[82vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyan-950 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <span>Formica Neurocircuitry</span>
              <span className="text-[10px] font-mono text-cyan-400">[{ant.id}]</span>
            </h3>
            <p className="text-[10px] text-slate-400">250k-Neuron Functional Neuropil Model</p>
          </div>
        </div>
        <ScientificBadge category="BIOLOGICAL_FACT" label="NEUROANATOMY" />
      </div>

      {/* NEUROPOLIS SENSE DIRECTION INDICATOR & CAUSAL FLOW */}
      <div className="bg-slate-900/90 p-3 rounded-lg border border-cyan-500/40 space-y-2.5 shadow-xl">
        <div className="flex items-center justify-between text-xs font-bold text-cyan-300">
          <div className="flex items-center gap-1.5">
            <Navigation className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>NEUROPOLIS — SENSE DIRECTION</span>
          </div>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60 font-bold">
            {senseData.headingDeg}° HEADING
          </span>
        </div>

        {/* Antennal Chemoreception Gauges */}
        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
          <div className="bg-slate-950/80 p-2 rounded border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">LEFT ANTENNA:</span>
            <span className="text-emerald-400 font-bold text-xs">{senseData.leftAntennaPct}%</span>
          </div>
          <div className="bg-slate-950/80 p-2 rounded border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">RIGHT ANTENNA:</span>
            <span className="text-cyan-400 font-bold text-xs">{senseData.rightAntennaPct}%</span>
          </div>
        </div>

        {/* Prominent Strongest Sensory Vector Display */}
        {senseData.strongestVector ? (
          <div className="bg-gradient-to-r from-cyan-950/90 via-slate-950 to-slate-950 p-2.5 rounded-lg border border-cyan-500/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold font-mono text-cyan-300">{senseData.strongestVector.arrow}</span>
              <div>
                <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">STRONGEST SENSORY DIRECTION</div>
                <div className={`text-xs font-bold font-mono ${senseData.strongestVector.colorClass}`}>
                  {senseData.strongestVector.type} {senseData.strongestVector.arrow} {senseData.strongestVector.deg}° ({senseData.strongestVector.label})
                </div>
              </div>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-1 rounded font-bold border border-cyan-800">
              {(senseData.strongestVector.strength * 100).toFixed(0)}% STRENGTH
            </span>
          </div>
        ) : (
          <div className="bg-slate-950/90 p-2.5 rounded-lg border border-slate-800/80 text-center text-[11px] font-mono text-slate-500">
            NO SIGNIFICANT SIGNAL DETECTED
          </div>
        )}

        {/* All Detected Signal Vectors List */}
        {senseData.vectors.length > 0 && (
          <div className="space-y-1 text-[10px] font-mono">
            <div className="text-[9px] text-slate-500 uppercase tracking-wider px-0.5">ACTIVE SENSORY VECTORS</div>
            <div className="grid grid-cols-2 gap-1.5">
              {senseData.vectors.map((vec, i) => (
                <div key={i} className="bg-slate-950 p-1.5 rounded border border-slate-800/80 flex items-center justify-between">
                  <span className={`font-bold ${vec.colorClass}`}>{vec.type}</span>
                  <span className="text-slate-200 font-bold">{vec.arrow} {vec.deg}°</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Causal Flow: SENSORS -> SENSORY PROCESSING -> DECISION -> MOTOR OUTPUT */}
        <div className="bg-slate-950/90 p-2.5 rounded-lg border border-slate-800/80 space-y-1 text-[10px] font-mono">
          <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
            <Cpu className="w-3 h-3 text-cyan-400" />
            <span>NEUROPOLIS CAUSAL PROCESSING FLOW</span>
          </div>
          <div className="flex items-center gap-1 text-slate-300">
            <span className="text-slate-500 font-bold">1. SENSE:</span>
            <span className="text-cyan-300 truncate">{senseData.neuropolisFlow.sensorInput}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-300">
            <span className="text-slate-500 font-bold">2. NEUROPIL:</span>
            <span className="text-amber-300 truncate">{senseData.neuropolisFlow.sensoryNode}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-300">
            <span className="text-slate-500 font-bold">3. DECIDE:</span>
            <span className="text-emerald-300 truncate">{senseData.neuropolisFlow.decision}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-300">
            <span className="text-slate-500 font-bold">4. MOTOR:</span>
            <span className="text-rose-300 truncate">{senseData.neuropolisFlow.motorOutput}</span>
          </div>
        </div>
      </div>

      {/* 1. CENTRAL COMPLEX (CX) HEADING RING ATTRACTOR & PATH INTEGRATION */}
      <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/90 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-cyan-300">
          <div className="flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Central Complex (CX) Heading & PI</span>
            <BiologyInfoPopup topicId="central_complex_navigation" />
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            {(cx.estimatedHeading * (180 / Math.PI)).toFixed(0)}° Heading
          </span>
        </div>

        {/* Circular 16-Neuron Ring Attractor Visualization */}
        <div className="flex items-center justify-center py-2 bg-slate-950/90 rounded-lg border border-slate-900 relative">
          <div className="relative w-28 h-28 flex items-center justify-center">
            {/* Outer Glowing Ring Attractor Geometry */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
              <circle
                cx="56"
                cy="56"
                r="44"
                className="fill-none stroke-cyan-500/30 stroke-[1.5]"
                strokeDasharray="4 2"
              />
              <circle
                cx="56"
                cy="56"
                r="44"
                className="fill-none stroke-cyan-400/60 stroke-[1] shadow-[0_0_12px_#38bdf8] animate-pulse"
              />
            </svg>
            {/* Center Compass Reticle & Rotating Heading Needle */}
            <div className="w-8 h-8 rounded-full bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-[9px] font-mono text-cyan-300 font-bold relative overflow-hidden">
              <div
                className="absolute w-0.5 h-3.5 bg-gradient-to-t from-cyan-500 to-white rounded-full origin-bottom transition-transform duration-150 shadow-[0_0_6px_#38bdf8]"
                style={{
                  top: '2px',
                  left: 'calc(50% - 1px)',
                  transformOrigin: '50% 100%',
                  transform: `rotate(${cx.estimatedHeading * (180 / Math.PI)}deg)`
                }}
              />
              <span className="z-10 bg-slate-950/80 px-1 py-0.2 rounded text-[7.5px] font-bold text-cyan-200">EB</span>
            </div>

            {/* 16 Wedge Column Neurons around circle */}
            {Array.from(cx.headingRing || new Array(16).fill(0)).map((actVal, idx) => {
              const activation = typeof actVal === 'number' ? actVal : 0;
              const angle = (idx / 16) * Math.PI * 2 - Math.PI / 2;
              const radius = 44; // pixels
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              const isPeak = activation > 0.65;

              return (
                <div
                  key={idx}
                  className={`absolute w-3 h-3 rounded-full transition-all duration-150 transform -translate-x-1/2 -translate-y-1/2 ${
                    isPeak
                      ? 'bg-cyan-300 shadow-md shadow-cyan-400 border border-white scale-125 z-10'
                      : activation > 0.2
                      ? 'bg-cyan-500/90 shadow-sm shadow-cyan-500 scale-100'
                      : 'bg-slate-800/80 scale-75'
                  }`}
                  style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)` }}
                  title={`Wedge ${idx + 1}: ${(activation * 100).toFixed(0)}% firing`}
                />
              );
            })}
          </div>

          <div className="absolute right-3 top-2 text-[10px] font-mono text-slate-400 flex flex-col items-end gap-1">
            <div className="text-slate-500 text-[9px]">HOME VECTOR (FB)</div>
            <div className="text-emerald-400 font-bold">{cx.homeVectorDistance.toFixed(1)}m</div>
            <div className="text-cyan-300">{(cx.homeVectorAngle * (180 / Math.PI)).toFixed(0)}° to nest</div>
            <div className="text-[9px] text-slate-500">Conf: {(cx.pathIntegrationConfidence * 100).toFixed(0)}%</div>
          </div>
        </div>
      </div>

      {/* 2. ANTENNAL LOBES (AL) GLOMERULI DUAL-TROPOTAXIS */}
      <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/90 space-y-1.5">
        <div className="flex items-center justify-between text-xs font-semibold text-emerald-300">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>Antennal Lobe (AL) Glomeruli</span>
            <BiologyInfoPopup topicId="olfactory_glomeruli" />
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Tropotaxis Diff: {al.tropotaxisDifferential > 0 ? `+${al.tropotaxisDifferential.toFixed(2)} R` : `${al.tropotaxisDifferential.toFixed(2)} L`}
          </span>
        </div>

        <div className="space-y-1 text-[10px] font-mono">
          {al.glomeruli.map((g) => (
            <div key={g.id} className="bg-slate-950/60 p-1.5 rounded border border-slate-900 flex items-center justify-between">
              <span className="text-slate-300 w-32 truncate font-sans text-[11px]">{g.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">L: {(g.leftActivation * 100).toFixed(0)}%</span>
                <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
                  <div className="bg-emerald-500 h-full" style={{ width: `${g.leftActivation * 100}%` }} />
                </div>
                <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
                  <div className="bg-cyan-500 h-full ml-auto" style={{ width: `${g.rightActivation * 100}%` }} />
                </div>
                <span className="text-cyan-400">R: {(g.rightActivation * 100).toFixed(0)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. MUSHROOM BODY (MB) SPARSE CODING & NEUROMODULATION */}
      <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/90 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-amber-300">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Mushroom Body (MB) Associative Memory</span>
            <BiologyInfoPopup topicId="mushroom_body_learning" />
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Sparse KCs: {(mb.sparseSparsityFraction * 100).toFixed(0)}% active
          </span>
        </div>

        {/* 64 Kenyon Cells Sparse Matrix Grid */}
        <div className="bg-slate-950 p-2 rounded border border-slate-900">
          <div className="text-[9px] font-mono text-slate-500 mb-1 flex justify-between">
            <span>64 KENYON CELLS (Sparse Odor Coding)</span>
            <span className="text-amber-400">STDP Plasticity Active</span>
          </div>
          <div className="grid grid-cols-16 gap-0.5">
            {Array.from({ length: 64 }).map((_, i) => {
              const kcVal = bioCtrl?.brain.mushroomBody.state.kenyonCellActivations[i] || 0;
              const isFiring = kcVal > 0.1;
              return (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-sm transition-colors duration-150 ${
                    isFiring ? 'bg-amber-300 shadow-sm shadow-amber-400' : 'bg-slate-900'
                  }`}
                  title={`Kenyon Cell #${i + 1}: ${(kcVal * 100).toFixed(0)}%`}
                />
              );
            })}
          </div>
        </div>

        {/* Neuromodulators: Octopamine (Reward) vs Dopamine (Aversion) */}
        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
          <div className="bg-slate-950 p-1.5 rounded border border-emerald-950/60 flex items-center justify-between">
            <span className="text-emerald-300 font-semibold">OCTOPAMINE (Reward):</span>
            <span className="text-emerald-400 font-bold">{mb.octopamineLevel.toFixed(2)}</span>
          </div>
          <div className="bg-slate-950 p-1.5 rounded border border-rose-950/60 flex items-center justify-between">
            <span className="text-rose-300 font-semibold">DOPAMINE (Aversion):</span>
            <span className="text-rose-400 font-bold">{mb.dopamineLevel.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
