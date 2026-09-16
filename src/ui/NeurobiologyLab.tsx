/**
 * ANTWIRE — Real-Time Neurobiology Laboratory & Neuropil Activity Visualizer
 * Exposes live physiological signals across the Antennal Lobes (AL), Mushroom Bodies (MB),
 * and Central Complex (CX) Ring Attractor & Path Integration Home Vector.
 */

import React from 'react';
import { Ant } from '../ants/ant';
import { BiologicalBrainController } from '../ants/controllers/biological_brain';
import { Brain, Compass, Sparkles, Zap, Activity, Radio, AlertCircle } from 'lucide-react';
import { ScientificBadge } from './ScientificBadge';
import { BiologyInfoPopup } from './BiologyInfoPopup';

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
            {/* Center Compass Reticle */}
            <div className="w-8 h-8 rounded-full bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-[9px] font-mono text-cyan-300 font-bold">
              EB
            </div>

            {/* 16 Wedge Column Neurons around circle */}
            {cx.headingRing.map((activation, idx) => {
              const angle = (idx / 16) * Math.PI * 2 - Math.PI / 2;
              const radius = 44; // pixels
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              const isPeak = activation > 0.7;

              return (
                <div
                  key={idx}
                  className={`absolute w-3 h-3 rounded-full transition-all duration-150 transform -translate-x-1/2 -translate-y-1/2 ${
                    isPeak
                      ? 'bg-cyan-300 shadow-md shadow-cyan-400 border border-white scale-125'
                      : activation > 0.2
                      ? 'bg-cyan-600/80 scale-100'
                      : 'bg-slate-800/80 scale-75'
                  }`}
                  style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)` }}
                  title={`Wedge ${idx + 1}: ${(activation * 100).toFixed(0)}% firing`}
                />
              );
            })}
          </div>

          <div className="absolute right-3 top-2 text-[10px] font-mono text-slate-400 flex flex-col items-end gap-1">
            <div className="text-slate-500">HOME VECTOR (FB)</div>
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
