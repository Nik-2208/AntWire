/**
 * ANTWIRE — Emergent Behavioral Phenomenon Dashboard
 */

import React from 'react';
import { Sparkles, Network, TrendingUp, Compass } from 'lucide-react';
import { ColonyStatistics } from '../colony/colony';
import { ScientificBadge } from './ScientificBadge';

interface EmergenceDashboardProps {
  stats: ColonyStatistics;
}

export const EmergenceDashboard: React.FC<EmergenceDashboardProps> = ({ stats }) => {
  return (
    <div className="glass-panel rounded-xl p-4 flex flex-col gap-3 text-slate-200 shadow-2xl select-none">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <h3 className="font-heading text-sm font-bold text-slate-100">Emergent Superorganism Dynamics</h3>
        </div>
        <ScientificBadge category="BIOLOGICAL_INSPIRATION" />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
            <Network className="w-3.5 h-3.5 text-cyan-400" /> Foraging Task Force
          </div>
          <div className="font-mono font-bold text-cyan-300 text-sm">
            {stats.activeForagers} <span className="text-[10px] text-slate-500 font-normal">/ {stats.population} workers</span>
          </div>
        </div>

        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Total Harvested
          </div>
          <div className="font-mono font-bold text-emerald-300 text-sm">
            {stats.totalFoodHarvested.toFixed(0)} <span className="text-[10px] text-slate-500 font-normal">units</span>
          </div>
        </div>
      </div>

      {/* Emergence Observations List */}
      <div className="space-y-1.5 text-[11px]">
        <div className="text-slate-400 font-semibold">Detected Stigmergic Patterns:</div>
        <div className="bg-slate-950 p-2 rounded border border-slate-800/80 flex items-start gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
          <div>
            <span className="font-semibold text-emerald-300">Positive Feedback Recruitment:</span>
            <span className="text-slate-400 ml-1">Returning foragers deposit food trail pheromone, causing progressive reinforcement.</span>
          </div>
        </div>
        <div className="bg-slate-950 p-2 rounded border border-slate-800/80 flex items-start gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
          <div>
            <span className="font-semibold text-cyan-300">Exponential Decay Evaporation:</span>
            <span className="text-slate-400 ml-1">Prevents deadlock on depleted food patches through autonomous trail evaporation.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
