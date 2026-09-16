/**
 * ANTWIRE — Interactive World Manipulation Tools
 */

import React from 'react';
import { Pointer, PlusCircle, Skull, Square, UserPlus, Eraser } from 'lucide-react';

export type WorldToolType = 'INSPECT' | 'PLACE_FOOD' | 'SPAWN_PREDATOR' | 'PLACE_OBSTACLE';

interface WorldToolsProps {
  activeTool: WorldToolType;
  onSelectTool: (tool: WorldToolType) => void;
  onSpawnAnt: () => void;
  onClearPheromones: () => void;
}

export const WorldTools: React.FC<WorldToolsProps> = ({
  activeTool,
  onSelectTool,
  onSpawnAnt,
  onClearPheromones,
}) => {
  return (
    <div className="glass-panel rounded-xl p-1.5 flex flex-col gap-1.5 shadow-2xl select-none">
      <div className="text-[10px] uppercase font-mono text-slate-500 font-semibold px-2 py-0.5">
        World Tools
      </div>

      <button
        onClick={() => onSelectTool('INSPECT')}
        className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${
          activeTool === 'INSPECT'
            ? 'bg-cyan-600/40 text-cyan-300 border border-cyan-500/60 shadow-md shadow-cyan-950/40'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
        }`}
        title="Inspect Entities & Decisions"
      >
        <Pointer className="w-4 h-4 text-cyan-400" />
        <span>Inspect</span>
      </button>

      <button
        onClick={() => onSelectTool('PLACE_FOOD')}
        className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${
          activeTool === 'PLACE_FOOD'
            ? 'bg-emerald-600/40 text-emerald-300 border border-emerald-500/60 shadow-md shadow-emerald-950/40'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
        }`}
        title="Click Ground in 3D to Place Food Patch"
      >
        <PlusCircle className="w-4 h-4 text-emerald-400" />
        <span>Place Food</span>
      </button>

      <button
        onClick={() => onSelectTool('SPAWN_PREDATOR')}
        className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${
          activeTool === 'SPAWN_PREDATOR'
            ? 'bg-rose-600/40 text-rose-300 border border-rose-500/60 shadow-md shadow-rose-950/40'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
        }`}
        title="Click Ground in 3D to Spawn Predatory Beetle"
      >
        <Skull className="w-4 h-4 text-rose-400" />
        <span>Spawn Predator</span>
      </button>

      <button
        onClick={() => onSelectTool('PLACE_OBSTACLE')}
        className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${
          activeTool === 'PLACE_OBSTACLE'
            ? 'bg-slate-700/60 text-slate-200 border border-slate-500/60'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
        }`}
        title="Click Ground in 3D to Place Granite Rock Barrier"
      >
        <Square className="w-4 h-4 text-slate-400" />
        <span>Place Rock</span>
      </button>

      <div className="h-px bg-slate-800 my-0.5" />

      <button
        onClick={onSpawnAnt}
        className="px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 text-cyan-300 hover:bg-cyan-950/40 border border-cyan-950 transition-all"
        title="Spawn 1 Worker Ant at Nest Entrance"
      >
        <UserPlus className="w-4 h-4 text-cyan-400" />
        <span>+1 Worker</span>
      </button>

      <button
        onClick={onClearPheromones}
        className="px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 text-rose-400 hover:bg-rose-950/40 border border-rose-950 transition-all"
        title="Erase All Pheromone Chemical Trails"
      >
        <Eraser className="w-4 h-4 text-rose-400" />
        <span>Clear Trails</span>
      </button>
    </div>
  );
};
