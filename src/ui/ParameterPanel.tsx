/**
 * ANTWIRE — Authoritative Parameter Matrix & Ecological Inspector
 * Connects sliders directly to authoritative commands with validation, live feedback, and biological provenance.
 */

import React, { useState } from 'react';
import { Sliders, Sun, Activity, Zap, Shield, RotateCcw, Info, CheckCircle2, Skull } from 'lucide-react';
import { SimulationWorld } from '../simulation/world';
import { ParameterMetadata, ParameterScope } from '../simulation/config';

interface ParameterPanelProps {
  world: SimulationWorld;
  onParamChange: () => void;
}

export const ParameterPanel: React.FC<ParameterPanelProps> = ({ world, onParamChange }) => {
  const config = world.simConfig;
  const [selectedMeta, setSelectedMeta] = useState<ParameterMetadata | null>(null);
  const [lastMessage, setLastMessage] = useState<string | null>(null);

  const handleSliderChange = (key: string, val: number) => {
    const res = config.executeCommand(
      {
        type: 'SET_PARAMETER',
        key,
        value: val,
      },
      world.eventBus
    );
    if (res.success) {
      setLastMessage(res.message);
      onParamChange();
    }
  };

  const handleResetScope = (scope: ParameterScope) => {
    const res = config.executeCommand({ type: 'RESET_SCOPE', scope }, world.eventBus);
    setLastMessage(res.message);
    onParamChange();
  };

  const handleResetAll = () => {
    const res = config.executeCommand({ type: 'RESET_ALL' }, world.eventBus);
    setLastMessage(res.message);
    onParamChange();
  };

  const handleSpawnPredator = () => {
    world.predatorManager.spawnRandomPredator(
      world.rng,
      world.config.width * 0.5,
      world.config.height * 0.5,
      undefined,
      world.eventBus
    );
    setLastMessage(`Predator spawned (Total: ${world.predators.length})`);
    onParamChange();
  };

  const handleRemovePredator = () => {
    const removed = world.predatorManager.removeOldest(world.eventBus);
    if (removed) {
      setLastMessage(`Removed predator (Total: ${world.predators.length})`);
    } else {
      setLastMessage('No predators active');
    }
    onParamChange();
  };

  const renderSlider = (key: string) => {
    const meta = config.get(key);
    if (!meta) return null;

    return (
      <div
        key={meta.key}
        onClick={() => setSelectedMeta(meta)}
        className={`p-2 rounded-lg transition-all cursor-pointer border ${
          selectedMeta?.key === meta.key
            ? 'bg-cyan-950/40 border-cyan-500/60 shadow-lg'
            : 'bg-slate-950/40 border-slate-800/60 hover:border-slate-700'
        }`}
      >
        <div className="flex justify-between items-center text-[11px] text-slate-300">
          <span className="font-medium">{meta.name}:</span>
          <span className="font-mono text-cyan-300 font-semibold">
            {meta.value.toFixed(meta.step < 0.01 ? 4 : 2)} {meta.unit}
          </span>
        </div>
        <input
          type="range"
          min={meta.min}
          max={meta.max}
          step={meta.step}
          value={meta.value}
          onChange={(e) => handleSliderChange(meta.key, parseFloat(e.target.value))}
          className="w-full mt-1.5 accent-cyan-400 cursor-pointer"
        />
        <div className="flex justify-between text-[9px] text-slate-500 mt-0.5">
          <span>{meta.min}</span>
          <span className="text-slate-400">{meta.classification}</span>
          <span>{meta.max}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="glass-panel rounded-xl p-4 flex flex-col gap-4 text-slate-200 shadow-2xl select-none max-h-[80vh] overflow-y-auto">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h3 className="font-heading text-sm font-bold text-slate-100">Authoritative Parameter Matrix</h3>
        </div>
        <button
          onClick={handleResetAll}
          className="flex items-center gap-1 text-[10px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
          title="Reset all parameters to default"
        >
          <RotateCcw className="w-3 h-3" /> Reset All
        </button>
      </div>

      {/* Confirmation feedback banner */}
      {lastMessage && (
        <div className="flex items-center gap-1.5 p-2 rounded bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 text-[10px]">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>{lastMessage}</span>
        </div>
      )}

      {/* 1. Predator Spawning & Ecological Threat */}
      <div className="space-y-2.5 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
        <div className="flex items-center justify-between text-xs font-semibold text-rose-400">
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" /> Apex Predator System ({world.predators.length} active)
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={handleSpawnPredator}
              className="text-[10px] px-2 py-0.5 rounded bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 transition-all cursor-pointer"
            >
              + Add
            </button>
            <button
              onClick={handleRemovePredator}
              className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer"
            >
              - Del
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {renderSlider('predator.aggression')}
          {renderSlider('predator.patrolSpeed')}
          {renderSlider('predator.chaseSpeed')}
          {renderSlider('predator.detectionRadius')}
        </div>
      </div>

      {/* 2. Ant Physiological Metabolism & Starvation */}
      <div className="space-y-2.5 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
        <div className="flex items-center justify-between text-xs font-semibold text-amber-400">
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" /> Metabolism & Starvation Biology
          </span>
          <button
            onClick={() => handleResetScope('ANT')}
            className="text-[9px] text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            Reset Ant
          </button>
        </div>

        <div className="space-y-2">
          {renderSlider('ant.metabolicBaseRate')}
          {renderSlider('ant.kineticCostRate')}
          {renderSlider('ant.starvationOnsetThreshold')}
          {renderSlider('ant.starvationStressRate')}
        </div>
      </div>

      {/* 3. Pheromone Chemical Kinetics */}
      <div className="space-y-2.5 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
        <div className="flex items-center justify-between text-xs font-semibold text-emerald-400">
          <span className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" /> Pheromone Chemical Dynamics
          </span>
          <button
            onClick={() => handleResetScope('PHEROMONE')}
            className="text-[9px] text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            Reset Phero
          </button>
        </div>

        <div className="space-y-2">
          {renderSlider('pheromones.foodTrailDecay')}
          {renderSlider('pheromones.diffusionRate')}
        </div>
      </div>

      {/* 4. Environment Atmospheric Temperature */}
      <div className="space-y-2.5 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
        <div className="flex items-center justify-between text-xs font-semibold text-sky-400">
          <span className="flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5" /> Atmosphere & Climate
          </span>
        </div>

        <div className="space-y-2">
          {renderSlider('environment.temperatureCelsius')}
        </div>
      </div>

      {/* 5. Parameter Inspector Modal Card */}
      {selectedMeta && (
        <div className="bg-slate-950 p-3 rounded-lg border border-cyan-500/40 text-[11px] space-y-2">
          <div className="flex items-center gap-1.5 text-cyan-300 font-semibold">
            <Info className="w-3.5 h-3.5" />
            <span>Parameter Inspector: {selectedMeta.name}</span>
          </div>
          <div className="text-slate-300 text-[10px] leading-relaxed">
            {selectedMeta.description}
          </div>
          <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-400 pt-1 border-t border-slate-800">
            <div>Default: <span className="font-mono text-slate-200">{selectedMeta.defaultValue} {selectedMeta.unit}</span></div>
            <div>Range: <span className="font-mono text-slate-200">{selectedMeta.min} - {selectedMeta.max}</span></div>
            <div className="col-span-2 text-emerald-400/90 font-mono text-[9px] mt-0.5">
              {selectedMeta.biologicalStatus}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
