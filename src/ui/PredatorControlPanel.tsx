/**
 * ANTWIRE — Predator Control Panel
 * Minimal, authoritative gameplay control panel exposing Speed and Damage parameters.
 * Changes directly and immediately mutate predator.speed and predator.damage in the active simulation.
 */

import React, { useState } from 'react';
import { Skull, Zap, ShieldAlert, Plus, Trash2, Crosshair, Target, Activity, RefreshCw } from 'lucide-react';
import { SimulationWorld } from '../simulation/world';
import { Predator } from '../predators/predator';
import { BiologyInfoPopup } from './BiologyInfoPopup';

interface PredatorControlPanelProps {
  world: SimulationWorld;
  selectedPredatorId: string | null;
  onSelectPredator: (id: string | null) => void;
  onChange: () => void;
}

export const PredatorControlPanel: React.FC<PredatorControlPanelProps> = ({
  world,
  selectedPredatorId,
  onSelectPredator,
  onChange,
}) => {
  const predators = world.predators;
  const activePredator: Predator | null = selectedPredatorId
    ? world.getPredatorById(selectedPredatorId) || null
    : (predators[0] || null);

  const [applyToAll, setApplyToAll] = useState(false);

  // Speed bounds: 0.5 to 15.0 cm/s
  const minSpeed = 0.5;
  const maxSpeed = 15.0;
  const stepSpeed = 0.1;

  // Damage bounds: 0.05 to 2.00 (health points per strike)
  const minDamage = 0.05;
  const maxDamage = 2.00;
  const stepDamage = 0.05;

  const currentSpeed = activePredator ? activePredator.speed : (world.predatorManager.defaultSpeed ?? 2.5);
  const currentDamage = activePredator ? activePredator.damage : (world.predatorManager.defaultDamage ?? 0.5);

  const handleSpeedChange = (val: number) => {
    const sanitized = Math.max(minSpeed, Math.min(maxSpeed, Number.isFinite(val) ? val : 2.5));
    if (applyToAll || !activePredator) {
      world.predatorManager.setAllSpeeds(sanitized);
    } else {
      activePredator.speed = sanitized;
    }
    onChange();
  };

  const handleDamageChange = (val: number) => {
    const sanitized = Math.max(minDamage, Math.min(maxDamage, Number.isFinite(val) ? val : 0.5));
    if (applyToAll || !activePredator) {
      world.predatorManager.setAllDamages(sanitized);
    } else {
      activePredator.damage = sanitized;
    }
    onChange();
  };

  const handleSpawn = () => {
    const newPred = world.predatorManager.spawnRandomPredator(
      world.rng,
      world.config.width * 0.5,
      world.config.height * 0.5,
      undefined,
      world.eventBus
    );
    onSelectPredator(newPred.id);
    onChange();
  };

  const handleRemove = () => {
    if (activePredator) {
      world.removePredator(activePredator.id);
      onSelectPredator(null);
      onChange();
    }
  };

  const handleResetDefaults = () => {
    if (activePredator) {
      activePredator.speed = 2.5;
      activePredator.damage = 0.5;
    } else {
      world.predatorManager.setAllSpeeds(2.5);
      world.predatorManager.setAllDamages(0.5);
    }
    onChange();
  };

  return (
    <div className="glass-panel rounded-xl p-4 flex flex-col gap-3.5 text-slate-200 shadow-2xl relative select-none">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-rose-900/60 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-950/80 border border-rose-500/50 flex items-center justify-center text-rose-400">
            <Skull className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-heading text-sm font-bold text-rose-300">Predator Control</h3>
              <BiologyInfoPopup topicId="predator_prey_dynamics" variant="badge" label="APEX FAUNA" />
            </div>
            <p className="text-[11px] text-slate-400">
              {predators.length} Predator{predators.length !== 1 ? 's' : ''} Active in Territory
            </p>
          </div>
        </div>

        {/* Action button to spawn new predator */}
        <button
          onClick={handleSpawn}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 border border-rose-500/50 text-xs font-semibold transition-all cursor-pointer shadow-sm"
          title="Spawn a new predator into the territory"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Spawn</span>
        </button>
      </div>

      {/* Predator Instance Selector */}
      {predators.length > 0 ? (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Target Predator Instance:</span>
            <label className="flex items-center gap-1 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={applyToAll}
                onChange={(e) => setApplyToAll(e.target.checked)}
                className="accent-rose-500 rounded cursor-pointer"
              />
              <span className="text-[10px]">Sync All ({predators.length})</span>
            </label>
          </div>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {predators.map((p) => {
              const isSelected = activePredator?.id === p.id && !applyToAll;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setApplyToAll(false);
                    onSelectPredator(p.id);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all shrink-0 cursor-pointer border ${
                    isSelected
                      ? 'bg-rose-950/90 text-rose-200 border-rose-500 shadow-md shadow-rose-950/60 font-bold'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {p.id}
                  <span className="ml-1.5 text-[10px] text-rose-400/80">({p.state.state})</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/50 rounded-lg p-3 text-center text-xs text-slate-400 border border-slate-800/80 space-y-2">
          <p>No predators currently in the world.</p>
          <button
            onClick={handleSpawn}
            className="px-3 py-1.5 rounded-lg bg-rose-600/40 hover:bg-rose-600/60 text-rose-200 border border-rose-500/60 font-semibold text-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Spawn Predator
          </button>
        </div>
      )}

      {/* Live Predator Telemetry (State, Target, Kills) */}
      {activePredator && (
        <div className="grid grid-cols-3 gap-1.5 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 text-[10px] font-mono">
          <div className="p-1">
            <span className="text-slate-500 block">SPECIES</span>
            <span className="text-rose-300 font-semibold truncate block" title={activePredator.profile.name}>
              {activePredator.profile.name.split(' ')[0]}
            </span>
          </div>
          <div className="p-1">
            <span className="text-slate-500 block">STATE</span>
            <span className={`font-bold block ${
              activePredator.state.state === 'ATTACK'
                ? 'text-rose-400 animate-pulse'
                : activePredator.state.state === 'FEED'
                ? 'text-amber-400'
                : activePredator.state.state === 'APPROACH'
                ? 'text-orange-400'
                : 'text-slate-300'
            }`}>
              {activePredator.state.state}
            </span>
          </div>
          <div className="p-1">
            <span className="text-slate-500 block">KILLS</span>
            <span className="text-emerald-400 font-bold block">{activePredator.state.killCount} ants</span>
          </div>
        </div>
      )}

      {/* GAMEPLAY PARAMETERS: SPEED & DAMAGE ONLY */}
      <div className="space-y-3 bg-slate-900/70 p-3 rounded-lg border border-rose-900/40">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span className="flex items-center gap-1.5 text-rose-400">
            <Crosshair className="w-3.5 h-3.5" /> Gameplay Parameters
          </span>
          <button
            onClick={handleResetDefaults}
            className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer transition-colors"
            title="Reset to biological baseline"
          >
            <RefreshCw className="w-2.5 h-2.5" /> Reset
          </button>
        </div>

        {/* 1. SPEED PARAMETER */}
        <div className="space-y-1.5 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="predator-speed" className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Speed</span>
              <span className="text-[10px] text-slate-500 font-mono font-normal">(predator.speed)</span>
            </label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={minSpeed}
                max={maxSpeed}
                step={stepSpeed}
                value={currentSpeed}
                onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                className="w-16 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-right font-mono text-xs text-amber-300 focus:outline-none focus:border-amber-500"
              />
              <span className="text-[11px] text-slate-400 font-mono">cm/s</span>
            </div>
          </div>

          <input
            id="predator-speed"
            type="range"
            min={minSpeed}
            max={maxSpeed}
            step={stepSpeed}
            value={currentSpeed}
            onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />

          <div className="flex justify-between text-[9px] font-mono text-slate-500">
            <span>{minSpeed} cm/s (Slow Stalk)</span>
            <span>{maxSpeed} cm/s (Apex Sprint)</span>
          </div>
        </div>

        {/* 2. DAMAGE PARAMETER */}
        <div className="space-y-1.5 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="predator-damage" className="font-semibold text-slate-200 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>Damage</span>
              <span className="text-[10px] text-slate-500 font-mono font-normal">(predator.damage)</span>
            </label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={minDamage}
                max={maxDamage}
                step={stepDamage}
                value={currentDamage}
                onChange={(e) => handleDamageChange(parseFloat(e.target.value))}
                className="w-16 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-right font-mono text-xs text-rose-300 focus:outline-none focus:border-rose-500"
              />
              <span className="text-[11px] text-slate-400 font-mono">hp/hit</span>
            </div>
          </div>

          <input
            id="predator-damage"
            type="range"
            min={minDamage}
            max={maxDamage}
            step={stepDamage}
            value={currentDamage}
            onChange={(e) => handleDamageChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
          />

          <div className="flex justify-between text-[9px] font-mono text-slate-500">
            <span>{(minDamage * 100).toFixed(0)}% Worker HP (Minor Bite)</span>
            <span>{(maxDamage * 100).toFixed(0)}% Worker HP (Lethal Strike)</span>
          </div>
        </div>
      </div>

      {/* Real Biological Consequences Trace */}
      <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60 text-[10px] text-slate-400 space-y-1 font-mono">
        <div className="flex items-center gap-1 text-slate-300 font-semibold">
          <Activity className="w-3 h-3 text-cyan-400" />
          <span>Real Dynamic Attack Pipeline:</span>
        </div>
        <p className="text-slate-400 leading-relaxed">
          <code className="text-rose-400 font-bold">Contact</code> →{' '}
          <code className="text-amber-300 font-bold">Damage ({currentDamage.toFixed(2)})</code> →{' '}
          <code className="text-cyan-300 font-bold">Ant Health Reduction</code> →{' '}
          <code className="text-purple-300 font-bold">Alarm Pheromone & Guard Defense</code>
        </p>
      </div>

      {/* Footer Removal Button if a predator is selected */}
      {activePredator && (
        <button
          onClick={handleRemove}
          className="w-full py-1.5 px-3 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/80 text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Remove Predator ({activePredator.id})</span>
        </button>
      )}
    </div>
  );
};
