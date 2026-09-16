/**
 * ANTWIRE — Simple Mode Overlay
 * Accessible, narrative-driven interface for non-technical users.
 */

import React from 'react';
import { Ant } from '../ants/ant';
import { SimulationWorld } from '../simulation/world';
import { Sparkles, Eye, Compass, Heart, HelpCircle } from 'lucide-react';

interface SimpleModeProps {
  world: SimulationWorld;
  selectedAnt: Ant | null;
  onOpenWhyModal: () => void;
}

export const SimpleMode: React.FC<SimpleModeProps> = ({
  world,
  selectedAnt,
  onOpenWhyModal,
}) => {
  const colony = world.colonies[0];
  const stats = colony ? colony.getStatistics(world.clock.simTime) : null;

  return (
    <div className="flex flex-col gap-3 max-w-sm pointer-events-auto select-none">
      {/* Colony Overview Card */}
      <div className="glass-panel rounded-xl p-4 border border-cyan-500/30 shadow-xl space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-sm font-bold text-slate-100 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-400" /> Colony Status
          </h2>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40 font-semibold">
            HEALTHY
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
          <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[10px]">Population:</span>
            <div className="font-bold text-slate-100 text-sm">{stats?.population || 0} ants</div>
          </div>
          <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[10px]">Granary Food:</span>
            <div className="font-bold text-emerald-400 text-sm">{(stats?.foodStored || 0).toFixed(1)} units</div>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
          {world.environment.getDayPhaseName()} in {world.environment.getSeasonName()}. The colony is actively gathering food and sustaining the queen.
        </p>
      </div>

      {/* Selected Ant Narrative Card */}
      {selectedAnt && (
        <div className="glass-panel rounded-xl p-4 border border-emerald-500/30 shadow-xl space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="font-mono text-xs font-bold text-slate-200">{selectedAnt.id}</h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Worker</span>
          </div>

          {/* Current Activity Narrative */}
          <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 space-y-1">
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
              Current Behavior
            </span>
            <p className="text-xs text-slate-100 font-medium">
              {selectedAnt.latestDecision?.humanReason || 'Exploring the environment for sweet sugar crystal resources.'}
            </p>
          </div>

          <button
            onClick={onOpenWhyModal}
            className="w-full py-1.5 px-3 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/50 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Why is it doing this?</span>
          </button>
        </div>
      )}
    </div>
  );
};
