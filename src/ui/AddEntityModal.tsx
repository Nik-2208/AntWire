/**
 * ANTWIRE — Add Entity Modal & Genetic Trait Customizer
 * Allows adding specialized workers, scouts, guards, nurses, reproductives, males,
 * queens, brood, or predators with species compatibility constraints.
 */

import React, { useState } from 'react';
import { AntCaste, AntTask, Vector2D } from '../simulation/types';
import { SPECIES_REGISTRY, SpeciesProfile } from '../colony/species_profiles';
import { SimulationWorld } from '../simulation/world';
import { ScientificBadge } from './ScientificBadge';
import { X, Plus, Sparkles, Shield, Compass, HeartPulse, Zap, AlertCircle } from 'lucide-react';

interface AddEntityModalProps {
  world: SimulationWorld;
  isOpen: boolean;
  onClose: () => void;
  onEntityAdded: (id: string) => void;
}

export const AddEntityModal: React.FC<AddEntityModalProps> = ({
  world,
  isOpen,
  onClose,
  onEntityAdded,
}) => {
  const [selectedSpeciesKey, setSelectedSpeciesKey] = useState<string>('formica-experimenta');
  const [entityType, setEntityType] = useState<'ANT' | 'QUEEN' | 'BROOD' | 'PREDATOR'>('ANT');
  const [caste, setCaste] = useState<AntCaste>('WORKER');
  const [initialTask, setInitialTask] = useState<AntTask>('FORAGING');

  // Phenotypic Traits
  const [speed, setSpeed] = useState(4.2);
  const [sensoryRange, setSensoryRange] = useState(2.2);
  const [explorationTendency, setExplorationTendency] = useState(1.0);
  const [fearThreshold, setFearThreshold] = useState(1.0);
  const [energyEfficiency, setEnergyEfficiency] = useState(1.0);

  if (!isOpen) return null;

  const species: SpeciesProfile = SPECIES_REGISTRY[selectedSpeciesKey] || SPECIES_REGISTRY['formica-experimenta'];
  const colony = world.colonies[0];

  const handleSpawn = () => {
    const spawnPos: Vector2D = {
      x: (Math.random() - 0.5) * 8.0,
      y: (Math.random() - 0.5) * 8.0,
    };

    if (entityType === 'ANT') {
      if (colony) {
        const newAnt = colony.spawnWorker(spawnPos, undefined, world.rng);
        newAnt.body.caste = caste;
        newAnt.body.task = initialTask;
        newAnt.body.traits.movementSpeed = speed;
        newAnt.body.traits.sensoryRange = sensoryRange;
        newAnt.body.traits.explorationTendency = explorationTendency;
        newAnt.body.traits.fearThreshold = fearThreshold;
        newAnt.body.traits.energyEfficiency = energyEfficiency;
        onEntityAdded(newAnt.id);
      }
    } else if (entityType === 'PREDATOR') {
      const pred = world.spawnPredator(spawnPos);
      onEntityAdded(pred.state.id);
    } else if (entityType === 'BROOD') {
      if (colony) {
        colony.brood.addEggs(5);
        onEntityAdded('BROOD-CLUSTER');
      }
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full p-5 shadow-2xl flex flex-col gap-4 text-slate-100 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold font-heading text-slate-100">ADD SIMULATION ENTITY</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Species Selector */}
        <div className="flex flex-col gap-1.5 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="font-bold text-cyan-300">Species Model:</span>
            <ScientificBadge category={species.provenance} />
          </div>
          <select
            value={selectedSpeciesKey}
            onChange={(e) => setSelectedSpeciesKey(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-cyan-500"
          >
            {Object.values(SPECIES_REGISTRY).map((sp) => (
              <option key={sp.id} value={sp.id}>
                {sp.scientificName} ({sp.commonName})
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-400 italic mt-0.5">{species.description}</p>
        </div>

        {/* Entity Category Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setEntityType('ANT')}
            className={`py-2 rounded-xl font-bold transition-all ${
              entityType === 'ANT'
                ? 'bg-cyan-600/40 text-cyan-300 border border-cyan-500 shadow-md'
                : 'bg-slate-950/60 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            Worker / Caste
          </button>
          <button
            onClick={() => setEntityType('BROOD')}
            className={`py-2 rounded-xl font-bold transition-all ${
              entityType === 'BROOD'
                ? 'bg-amber-600/40 text-amber-300 border border-amber-500 shadow-md'
                : 'bg-slate-950/60 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            Brood Cluster (+5)
          </button>
          <button
            onClick={() => setEntityType('PREDATOR')}
            className={`py-2 rounded-xl font-bold transition-all ${
              entityType === 'PREDATOR'
                ? 'bg-rose-600/40 text-rose-300 border border-rose-500 shadow-md'
                : 'bg-slate-950/60 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            Predator Beetle
          </button>
        </div>

        {/* Caste & Role Selection */}
        {entityType === 'ANT' && (
          <div className="flex flex-col gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-300">Functional Role / Caste:</span>
              <span className="text-[10px] text-slate-400">Species-Calibrated</span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {(['WORKER', 'SOLDIER', 'MALE', 'QUEEN'] as AntCaste[]).map((c) => {
                const disabled = c === 'QUEEN' && !species.social.queenPresent;
                return (
                  <button
                    key={c}
                    disabled={disabled}
                    onClick={() => setCaste(c)}
                    className={`py-1.5 rounded-lg font-semibold text-[11px] transition-all ${
                      disabled
                        ? 'opacity-30 cursor-not-allowed bg-slate-950 text-slate-600 border border-slate-900'
                        : caste === c
                        ? 'bg-cyan-600/50 text-cyan-200 border border-cyan-400 font-bold'
                        : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>

            {/* Initial Task */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-900">
              <span className="text-slate-400 font-medium">Initial Task:</span>
              <select
                value={initialTask}
                onChange={(e) => setInitialTask(e.target.value as AntTask)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 outline-none"
              >
                <option value="FORAGING">Forager</option>
                <option value="EXPLORING">Scout / Explorer</option>
                <option value="DEFENDING">Guard / Defender</option>
                <option value="FEEDING_BROOD">Nurse</option>
                <option value="MAINTAINING_NEST">Builder</option>
              </select>
            </div>

            {/* Phenotypic Trait Tuning */}
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-900">
              <span className="font-bold text-cyan-400 text-[11px] flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Phenotypic Traits
              </span>

              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400">Movement Speed:</span>
                <span className="font-mono text-cyan-300 font-bold">{speed.toFixed(1)} u/s</span>
              </div>
              <input
                type="range"
                min="2.0"
                max="8.0"
                step="0.2"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="accent-cyan-500 h-1 bg-slate-800 rounded cursor-pointer"
              />

              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400">Antennae Sensory Range:</span>
                <span className="font-mono text-cyan-300 font-bold">{sensoryRange.toFixed(1)} u</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="4.0"
                step="0.2"
                value={sensoryRange}
                onChange={(e) => setSensoryRange(parseFloat(e.target.value))}
                className="accent-cyan-500 h-1 bg-slate-800 rounded cursor-pointer"
              />

              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400">Exploration Tendency:</span>
                <span className="font-mono text-amber-300 font-bold">{(explorationTendency * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="2.0"
                step="0.1"
                value={explorationTendency}
                onChange={(e) => setExplorationTendency(parseFloat(e.target.value))}
                className="accent-amber-500 h-1 bg-slate-800 rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Spawn Button */}
        <button
          onClick={handleSpawn}
          className="w-full py-2.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Spawn Entity into Colony</span>
        </button>
      </div>
    </div>
  );
};
