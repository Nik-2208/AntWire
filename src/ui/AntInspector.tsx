/**
 * ANTWIRE — Ant Inspector & "WHY DID IT DO THAT?" Explainability Engine
 */

import React, { useState } from 'react';
import { Ant } from '../ants/ant';
import { HelpCircle, Zap, Shield, Heart, Compass, Cpu, Clock, Award, X, Trash2 } from 'lucide-react';
import { BiologyInfoPopup } from './BiologyInfoPopup';

interface AntInspectorProps {
  ant: Ant | null;
  onClose?: () => void;
  onRemoveAnt?: (antId: string) => void;
}

export const AntInspector: React.FC<AntInspectorProps> = ({ ant, onClose, onRemoveAnt }) => {
  const [showWhyModal, setShowWhyModal] = useState(false);
  const [showConfirmRemove, setShowConfirmRemove] = useState(false);

  if (!ant) {
    return (
      <div className="glass-panel rounded-xl p-4 text-center text-slate-500 text-xs">
        <p>No ant selected.</p>
        <p className="mt-1 text-[11px] text-slate-600">Click any ant in the 3D world to inspect its sensory perception and decision trace.</p>
      </div>
    );
  }

  const state = ant.internalState.state;
  const sensors = ant.sensors.lastSnapshot;
  const drives = ant.drives.currentDrives;
  const latestDec = ant.latestDecision;

  return (
    <div className="glass-panel rounded-xl p-4 flex flex-col gap-3 text-slate-200 shadow-2xl relative select-none">
      {/* Header with Ant ID, Caste & Role */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/80" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-sm font-bold text-slate-100">{ant.id}</h3>
              <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-cyan-950/80 border border-cyan-800/50 text-cyan-400">
                {ant.body.caste}
              </span>
              <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-amber-950/80 border border-amber-800/50 text-amber-300 font-bold">
                {ant.roleState.primaryRole}
              </span>
            </div>
            <p className="text-[11px] text-emerald-400 font-medium">Task: {ant.body.task.replace(/_/g, ' ')}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onRemoveAnt && (
            <button
              onClick={() => setShowConfirmRemove(true)}
              className="text-rose-400 hover:text-rose-200 hover:bg-rose-950/60 p-1 rounded transition-all"
              title="Remove Ant from Simulation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="text-slate-500 hover:text-slate-300 p-1">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Confirmation of Single Ant Removal */}
      {showConfirmRemove && onRemoveAnt && (
        <div className="bg-rose-950/90 border border-rose-500 rounded-lg p-2.5 text-xs space-y-2">
          <p className="text-rose-200 font-semibold">Remove ant {ant.id} from colony?</p>
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setShowConfirmRemove(false)}
              className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-[11px]"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onRemoveAnt(ant.id);
                setShowConfirmRemove(false);
              }}
              className="px-2.5 py-1 rounded bg-rose-600 text-white font-bold text-[11px]"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {/* PROMINENT "WHY DID IT DO THAT?" BUTTON */}
      <button
        onClick={() => setShowWhyModal(true)}
        className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/60 transition-all hover:scale-[1.02] border border-cyan-400/40"
      >
        <HelpCircle className="w-4 h-4" />
        <span>WHY DID IT DO THAT?</span>
      </button>

      {/* Physiological Body State Gauges */}
      <div className="space-y-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/70">
        <div className="flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1.5 text-slate-400">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Energy:
          </span>
          <span className="font-mono font-bold text-amber-300">{(state.energy * 100).toFixed(0)}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-300"
            style={{ width: `${Math.max(0, Math.min(100, state.energy * 100))}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] pt-1">
          <span className="flex items-center gap-1.5 text-slate-400">
            <Heart className="w-3.5 h-3.5 text-rose-400" /> Health:
          </span>
          <span className="font-mono font-bold text-rose-300">{(state.health * 100).toFixed(0)}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-rose-500 rounded-full transition-all duration-300"
            style={{ width: `${Math.max(0, Math.min(100, state.health * 100))}%` }}
          />
        </div>

        {/* Starvation Stress Gauge */}
        <div className="flex items-center justify-between text-[11px] pt-1">
          <span className="flex items-center gap-1.5 text-slate-400">
            <Shield className="w-3.5 h-3.5 text-purple-400" /> Starvation Stress:
          </span>
          <span className="font-mono font-bold text-purple-300">{(state.starvationStress * 100).toFixed(0)}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-rose-500 rounded-full transition-all duration-300"
            style={{ width: `${Math.max(0, Math.min(100, state.starvationStress * 100))}%` }}
          />
        </div>

        {/* Life State & Mobility */}
        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/60">
          <span className="text-slate-400">Physiological State:</span>
          <span className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold ${
            state.lifeState === 'ACTIVE'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              : state.lifeState === 'EXHAUSTED'
              ? 'bg-amber-950 text-amber-300 border border-amber-800'
              : state.lifeState === 'INJURED'
              ? 'bg-orange-950 text-orange-300 border border-orange-800'
              : state.lifeState === 'DYING'
              ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
              : 'bg-slate-900 text-slate-400 border border-slate-800'
          }`}>
            {state.lifeState}
          </span>
        </div>

        {/* Cargo status */}
        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/60">
          <span className="text-slate-400">Cargo Payload:</span>
          <span className={`font-mono font-semibold ${state.carryingFoodAmount > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
            {state.carryingFoodAmount > 0 ? `Food Packet (${state.carryingFoodAmount.toFixed(1)}u)` : 'Empty'}
          </span>
        </div>
      </div>

      {/* Motivational Drives Radar / Bars */}
      <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/70 space-y-1.5">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1">
          <span>Motivational Drives</span>
          <BiologyInfoPopup topicId="response_threshold_labor" variant="badge" label="MOTIVE DRIVES" />
        </div>

        {[
          { label: 'Food Seeking', val: drives.foodSeeking, color: 'bg-emerald-500' },
          { label: 'Exploration', val: drives.exploration, color: 'bg-cyan-500' },
          { label: 'Homing', val: drives.homing, color: 'bg-blue-500' },
          { label: 'Threat Evasion', val: drives.threatAvoidance, color: 'bg-rose-500' },
        ].map((d) => (
          <div key={d.label} className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 w-24">{d.label}</span>
            <div className="flex-1 mx-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className={`h-full ${d.color} rounded-full`} style={{ width: `${d.val * 100}%` }} />
            </div>
            <span className="font-mono text-slate-300 w-8 text-right font-medium">{(d.val).toFixed(2)}</span>
          </div>
        ))}
      </div>

      {/* Antennae Sensory Perception */}
      <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/70">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
          <span>Antennae Chemical Sensors</span>
          <BiologyInfoPopup topicId="antennae_sensing" variant="badge" label="CHEMORECEPTION" />
        </div>

        <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-mono">
          <div className="bg-slate-950 p-1 rounded border border-slate-800">
            <div className="text-slate-400">LEFT</div>
            <div className="text-emerald-400 font-bold">{(sensors.foodLeft * 100).toFixed(0)}%</div>
            <div className="text-[9px] text-slate-500">food</div>
          </div>
          <div className="bg-slate-950 p-1 rounded border border-slate-800">
            <div className="text-slate-400">CENTER</div>
            <div className="text-emerald-400 font-bold">{(sensors.foodCenter * 100).toFixed(0)}%</div>
            <div className="text-[9px] text-slate-500">food</div>
          </div>
          <div className="bg-slate-950 p-1 rounded border border-slate-800">
            <div className="text-slate-400">RIGHT</div>
            <div className="text-emerald-400 font-bold">{(sensors.foodRight * 100).toFixed(0)}%</div>
            <div className="text-[9px] text-slate-500">food</div>
          </div>
        </div>
      </div>

      {/* Lifetime Stats */}
      <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono bg-slate-900/40 p-2 rounded-lg border border-slate-800/50">
        <div>
          <div className="text-slate-500">TRIPS</div>
          <div className="text-cyan-400 font-bold text-xs">{ant.memory.totalTripsCompleted}</div>
        </div>
        <div>
          <div className="text-slate-500">HARVESTED</div>
          <div className="text-emerald-400 font-bold text-xs">{ant.memory.totalFoodHarvested.toFixed(0)}u</div>
        </div>
        <div>
          <div className="text-slate-500">DISTANCE</div>
          <div className="text-slate-300 font-bold text-xs">{ant.memory.lifetimeDistanceTraveled.toFixed(0)}m</div>
        </div>
      </div>

      {/* "WHY DID IT DO THAT?" EXPLAINABILITY MODAL */}
      {showWhyModal && latestDec && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel border border-cyan-500/50 rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-cyan-900/60 pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base font-bold text-slate-100 font-heading">
                  Why did <span className="text-cyan-400 font-mono">{ant.id}</span> take this action?
                </h2>
              </div>
              <button
                onClick={() => setShowWhyModal(false)}
                className="text-slate-400 hover:text-slate-100 p-1 rounded-lg bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Plain English Narrative Explanation */}
            <div className="bg-gradient-to-r from-cyan-950/80 to-emerald-950/80 p-3.5 rounded-xl border border-cyan-500/40 space-y-1">
              <span className="text-[10px] uppercase font-mono text-cyan-300 font-semibold tracking-wider">
                Ethological Narrative
              </span>
              <p className="text-xs text-slate-100 leading-relaxed font-medium">
                "{latestDec.humanReason}"
              </p>
            </div>

            {/* Decision Variables Matrix */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Selected Action:</span>
                <span className="font-mono font-bold text-emerald-300 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-500/40">
                  {latestDec.selectedAction.type}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Dominant Motivational Drive:</span>
                <span className="font-mono text-cyan-300 font-bold">
                  {latestDec.dominantDrive} ({(latestDec.dominantDriveValue).toFixed(2)})
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Decision Confidence:</span>
                <span className="font-mono text-slate-200">{(latestDec.confidence * 100).toFixed(0)}%</span>
              </div>
            </div>

            {/* Technical Computational Trace */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] space-y-1.5">
              <div className="flex items-center justify-between text-slate-500 pb-1 border-b border-slate-900">
                <span>COMPUTATIONAL DECISION TRACE & RUNTIME STATE</span>
                <BiologyInfoPopup topicId="lif_spiking_dynamics" variant="badge" label="COMPUTATIONAL ABSTRACTION" />
              </div>
              <p className="text-cyan-400 pt-0.5">{latestDec.technicalExplanation}</p>
              
              <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px] text-slate-400">
                <div>Brain Controller: <strong className="text-slate-200">{ant.controller.type}</strong></div>
                <div>Lifecycle State: <strong className="text-emerald-400">{ant.taskSystem.state.taskStatus}</strong></div>
                <div>Position: <strong className="text-slate-200">({ant.body.position.x.toFixed(1)}, {ant.body.position.y.toFixed(1)})</strong></div>
                <div>Speed: <strong className="text-slate-200">{ant.body.speed.toFixed(2)} cm/s</strong></div>
                <div>Target Position: <strong className="text-amber-300">{ant.taskSystem.state.targetPosition ? `(${ant.taskSystem.state.targetPosition.x.toFixed(1)}, ${ant.taskSystem.state.targetPosition.y.toFixed(1)})` : 'None'}</strong></div>
                <div>Stuck Counter: <strong className="text-slate-200">{ant.taskSystem.state.stuckTimer.toFixed(1)}s</strong></div>
                <div>Food Site in Memory: <strong className="text-emerald-400">{ant.memory.lastKnownFoodPosition ? `(${ant.memory.lastKnownFoodPosition.x.toFixed(1)}, ${ant.memory.lastKnownFoodPosition.y.toFixed(1)})` : 'None'}</strong></div>
                <div>Threat in Memory: <strong className="text-rose-400">{ant.memory.lastKnownThreatPosition ? `(${ant.memory.lastKnownThreatPosition.x.toFixed(1)}, ${ant.memory.lastKnownThreatPosition.y.toFixed(1)})` : 'None'}</strong></div>
              </div>

              <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                Sensors: L={sensors.foodLeft.toFixed(2)}, C={sensors.foodCenter.toFixed(2)}, R={sensors.foodRight.toFixed(2)} | Energy={state.energy.toFixed(2)} | Threat={state.threatLevel.toFixed(2)}
              </div>
            </div>

            <button
              onClick={() => setShowWhyModal(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
