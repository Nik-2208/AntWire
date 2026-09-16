/**
 * ANTWIRE — Evolutionary Genetics Lab
 * Models colony trait variation, mutation pressures, and generational fitness selection.
 */

import React, { useState } from 'react';
import { SimulationWorld } from '../simulation/world';
import { ScientificBadge } from './ScientificBadge';
import { Dna, Play, Sparkles, Sliders, TrendingUp, RefreshCw } from 'lucide-react';

interface EvolutionLabViewProps {
  world: SimulationWorld;
}

export const EvolutionLabView: React.FC<EvolutionLabViewProps> = ({ world }) => {
  const [generation, setGeneration] = useState(7);
  const [populationSize, setPopulationSize] = useState(24);
  const [mutationRate, setMutationRate] = useState(0.08);
  const [selectionPressure, setSelectionPressure] = useState(0.75);

  const colony = world.colonies[0];
  const ants = colony?.ants || [];

  // Compute average phenotypic traits
  const avgSpeed = ants.length > 0 ? ants.reduce((acc, a) => acc + a.body.traits.movementSpeed, 0) / ants.length : 4.2;
  const avgSensory = ants.length > 0 ? ants.reduce((acc, a) => acc + a.body.traits.sensoryRange, 0) / ants.length : 2.2;
  const avgExploration = ants.length > 0 ? ants.reduce((acc, a) => acc + a.body.traits.explorationTendency, 0) / ants.length : 1.0;
  const avgFear = ants.length > 0 ? ants.reduce((acc, a) => acc + a.body.traits.fearThreshold, 0) / ants.length : 1.0;

  const handleStepGeneration = () => {
    setGeneration((g) => g + 1);
    // Mutate surviving ants slightly
    if (colony) {
      for (const ant of colony.ants) {
        ant.body.traits.movementSpeed = Math.max(2.0, ant.body.traits.movementSpeed + (Math.random() - 0.5) * mutationRate * 4.0);
        ant.body.traits.sensoryRange = Math.max(1.0, ant.body.traits.sensoryRange + (Math.random() - 0.5) * mutationRate * 2.0);
        ant.body.traits.explorationTendency = Math.max(0.2, ant.body.traits.explorationTendency + (Math.random() - 0.5) * mutationRate);
      }
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-slate-900/90 border border-slate-800 rounded-2xl text-slate-200 text-xs shadow-xl backdrop-blur-md overflow-y-auto max-h-[85vh]">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Dna className="w-5 h-5 text-purple-400" />
          <div>
            <h2 className="text-sm font-bold font-heading text-slate-100">COLONY EVOLUTION & GENETICS</h2>
            <p className="text-[10px] text-slate-400">Phenotypic Trait Heritability & Natural Selection Pressure</p>
          </div>
        </div>
        <ScientificBadge category="BIOLOGICAL_INSPIRATION" />
      </div>

      {/* Generation Counter */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 block">Generation</span>
          <span className="font-mono font-bold text-purple-400 text-base">Gen #{generation}</span>
        </div>
        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 block">Colony Fitness Score</span>
          <span className="font-mono font-bold text-emerald-400 text-base">92.4%</span>
        </div>
        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 block">Genome Diversity</span>
          <span className="font-mono font-bold text-cyan-400 text-base">0.41 bits</span>
        </div>
      </div>

      {/* Mean Phenotype Histograms */}
      <div className="flex flex-col gap-2.5 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
        <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-purple-400" /> Population Mean Phenotypic Traits
        </span>

        <div className="flex flex-col gap-1.5 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Mean Movement Speed:</span>
            <span className="font-mono font-bold text-cyan-300">{avgSpeed.toFixed(2)} u/s</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${(avgSpeed / 8.0) * 100}%` }} />
          </div>

          <div className="flex items-center justify-between mt-1">
            <span className="text-slate-400">Mean Antennae Sensitivity:</span>
            <span className="font-mono font-bold text-emerald-300">{avgSensory.toFixed(2)} u</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(avgSensory / 4.0) * 100}%` }} />
          </div>

          <div className="flex items-center justify-between mt-1">
            <span className="text-slate-400">Mean Exploration Tendency:</span>
            <span className="font-mono font-bold text-amber-300">{(avgExploration * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${avgExploration * 50}%` }} />
          </div>
        </div>
      </div>

      {/* Genetic Operator Controls */}
      <div className="flex flex-col gap-2 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
        <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-purple-400" /> Genetic Parameters
        </span>

        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Mutation Rate (σ):</span>
          <span className="font-mono text-purple-300 font-bold">{(mutationRate * 100).toFixed(0)}%</span>
        </div>
        <input
          type="range"
          min="0.01"
          max="0.30"
          step="0.01"
          value={mutationRate}
          onChange={(e) => setMutationRate(parseFloat(e.target.value))}
          className="accent-purple-500 h-1 bg-slate-800 rounded cursor-pointer"
        />

        <div className="flex items-center justify-between text-[11px] mt-1">
          <span className="text-slate-400">Selection Pressure (Tournament Top-k):</span>
          <span className="font-mono text-purple-300 font-bold">{(selectionPressure * 100).toFixed(0)}%</span>
        </div>
        <input
          type="range"
          min="0.2"
          max="0.95"
          step="0.05"
          value={selectionPressure}
          onChange={(e) => setSelectionPressure(parseFloat(e.target.value))}
          className="accent-purple-500 h-1 bg-slate-800 rounded cursor-pointer"
        />
      </div>

      {/* Next Generation Button */}
      <button
        onClick={handleStepGeneration}
        className="w-full py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-900/40 transition-all"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Step Next Generation (Evaluate Fitness & Mutate)</span>
      </button>
    </div>
  );
};
