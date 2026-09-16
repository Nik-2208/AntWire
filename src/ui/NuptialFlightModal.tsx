/**
 * ANTWIRE — Nuptial Flight & Claustral Founding Modal
 * Interactive flight and polyandrous mating simulator for reproductive alates.
 */

import React, { useState } from 'react';
import { Queen, DroneGeneticProfile } from '../colony/queen';
import { SimulationWorld } from '../simulation/world';
import { Wind, Crown, Sparkles, CheckCircle2, X } from 'lucide-react';
import { ScientificBadge } from './ScientificBadge';

interface NuptialFlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  world: SimulationWorld;
  queen?: Queen;
}

export const NuptialFlightModal: React.FC<NuptialFlightModalProps> = ({
  isOpen,
  onClose,
  world,
  queen,
}) => {
  const [matedDronesCount, setMatedDronesCount] = useState<number>(5);
  const [flightStatus, setFlightStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTriggerNuptialFlight = () => {
    // Generate multi-drone genetic profiles
    const drones: DroneGeneticProfile[] = [];
    for (let i = 0; i < matedDronesCount; i++) {
      drones.push({
        droneId: `DRONE-${i + 1}`,
        patrilineId: `PATRILINE-${String.fromCharCode(65 + i)}`,
        traitModifiers: {
          sizeTendency: 0.9 + Math.random() * 0.4,
          activityRate: 0.85 + Math.random() * 0.35,
          diseaseResistance: 0.9 + Math.random() * 0.4,
          foragingEfficiency: 0.85 + Math.random() * 0.35,
        },
      });
    }

    if (queen) {
      queen.performNuptialFlight(drones);
      setFlightStatus(`Nuptial Flight complete: Gyne successfully mated with ${matedDronesCount} drones. Spermatheca fully charged.`);
    } else {
      setFlightStatus(`Simulated Nuptial Swarm: ${matedDronesCount} patrilines registered into the mating pool.`);
    }

    setTimeout(() => {
      setFlightStatus(null);
      onClose();
    }, 2800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-lg p-5 shadow-2xl flex flex-col gap-4 text-slate-200 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-500/50 flex items-center justify-center text-purple-400">
              <Wind className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-heading text-slate-100">NUPTIAL FLIGHT & REPRODUCTION SIMULATOR</h2>
              <p className="text-[10px] text-slate-400">Polyandrous Mating Swarms & Claustral Colony Founding</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scientific Badge */}
        <div>
          <ScientificBadge category="BIOLOGICAL_FACT" label="OBLIGATE POLYANDRY" />
        </div>

        <p className="text-[11px] text-slate-300 leading-relaxed">
          Higher attine gynes fly high into thermal updrafts to engage in obligate multiple mating with unrelated drones. Each drone deposits sperm into the queen&apos;s spermatheca, creating a genetically diverse mosaic colony.
        </p>

        {/* Drone Count Slider */}
        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-200">Mating Drone Count (Polyandry)</span>
            <span className="font-mono text-purple-300 font-bold">{matedDronesCount} Males</span>
          </div>
          <input
            type="range"
            min={2}
            max={10}
            step={1}
            value={matedDronesCount}
            onChange={(e) => setMatedDronesCount(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
          <div className="flex justify-between text-[9px] text-slate-500 font-mono">
            <span>2 (Minimal)</span>
            <span>5 (Atta Average)</span>
            <span>10 (High Diversity)</span>
          </div>
        </div>

        {flightStatus && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{flightStatus}</span>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-900">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleTriggerNuptialFlight}
            className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-900/40 transition-all cursor-pointer"
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Launch Nuptial Flight</span>
          </button>
        </div>
      </div>
    </div>
  );
};
