/**
 * ANTWIRE — Queen Inspector Component
 */

import React from 'react';
import { Queen } from '../colony/queen';
import { BroodManager } from '../colony/brood';
import { Crown, Heart, Zap, Sparkles, Egg, X } from 'lucide-react';
import { BiologyInfoPopup } from './BiologyInfoPopup';

interface QueenInspectorProps {
  queen: Queen;
  brood: BroodManager;
  colonyFoodStore: number;
  onClose?: () => void;
}

export const QueenInspector: React.FC<QueenInspectorProps> = ({
  queen,
  brood,
  colonyFoodStore,
  onClose,
}) => {
  const m = queen.metrics;
  const broodCounts = brood.getCounts();

  return (
    <div className="glass-panel rounded-xl p-4 flex flex-col gap-3 text-slate-200 shadow-2xl relative select-none">
      <div className="flex items-center justify-between border-b border-amber-900/60 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-500/50 flex items-center justify-center text-amber-400">
            <Crown className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-heading text-sm font-bold text-amber-300">{m.name}</h3>
              <BiologyInfoPopup topicId="nuptial_flight_founding" variant="icon" />
            </div>
            <p className="text-[11px] text-slate-400">Foundress & Reproductive Engine</p>
          </div>
        </div>

        {onClose && (
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 p-1">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Egg Laying Progress */}
      <div className="bg-slate-900/80 p-3 rounded-lg border border-amber-900/40 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-amber-300 font-semibold">
            <Egg className="w-3.5 h-3.5" /> Egg Synthesis Cycle:
          </span>
          <span className="font-mono text-amber-400 font-bold">
            {(m.currentEggCycleProgress * 100).toFixed(0)}%
          </span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-300"
            style={{ width: `${m.currentEggCycleProgress * 100}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <span>Total Eggs Produced:</span>
          <span className="font-mono font-bold text-slate-200">{m.totalEggsLaid}</span>
        </div>
      </div>

      {/* Queen Physiological State */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 space-y-1">
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <Heart className="w-3 h-3 text-rose-400" /> Health
          </span>
          <div className="font-mono font-bold text-rose-300">{(m.health * 100).toFixed(0)}%</div>
        </div>
        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 space-y-1">
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" /> Fertility
          </span>
          <div className="font-mono font-bold text-amber-300">{(m.fertility * 100).toFixed(0)}%</div>
        </div>
      </div>

      {/* Brood Nursery Census */}
      <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 space-y-1.5">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span>Brood Nursery Census</span>
          <BiologyInfoPopup topicId="nuptial_flight_founding" variant="badge" label="BROOD ONTOGENY" />
        </div>

        <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-mono">
          <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
            <div className="text-slate-400">EGGS</div>
            <div className="text-amber-300 font-bold text-xs">{broodCounts.eggs}</div>
          </div>
          <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
            <div className="text-slate-400">LARVAE</div>
            <div className="text-cyan-300 font-bold text-xs">{broodCounts.larvae}</div>
          </div>
          <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
            <div className="text-slate-400">PUPAE</div>
            <div className="text-purple-300 font-bold text-xs">{broodCounts.pupae}</div>
          </div>
        </div>
      </div>

      {/* Colony Nutrition Support */}
      <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-800/50 flex items-center justify-between text-[11px]">
        <span className="text-slate-400">Colony Granary Store:</span>
        <span className="font-mono font-bold text-emerald-400">{colonyFoodStore.toFixed(1)} units</span>
      </div>
    </div>
  );
};
