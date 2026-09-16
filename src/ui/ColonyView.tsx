/**
 * ANTWIRE — Colony Superorganism & Subterranean Observatory
 * Features 10D homeostatic need vector, Food Flow Lab (harvest -> storage -> retrieval -> trophallaxis -> metabolism),
 * Subterranean Nest Cutaway with Depth Stratification & Chamber Inventories,
 * and Biologically Informed Experimental Species Profile.
 */

import React, { useState } from 'react';
import { SimulationWorld } from '../simulation/world';
import { ScientificBadge } from './ScientificBadge';
import { BiologyInfoPopup } from './BiologyInfoPopup';
import { ColonyControlMode } from '../simulation/types';
import {
  Users,
  Crown,
  Egg,
  Sparkles,
  HeartHandshake,
  Zap,
  Utensils,
  Layers,
  Activity,
  Compass,
  Hammer,
  HelpCircle,
  Package,
  Eye,
  Sliders,
  ShieldAlert,
} from 'lucide-react';

interface ColonyViewProps {
  world: SimulationWorld;
  onSelectAnt: (antId: string) => void;
  onFocusCamera?: (pos: { x: number; y: number }) => void;
}

export const ColonyView: React.FC<ColonyViewProps> = ({ world, onSelectAnt, onFocusCamera }) => {
  const colony = world.colonies[0];
  const stats = colony ? colony.getStatistics(world.clock.simTime) : null;
  const [activeSubTab, setActiveSubTab] = useState<'CENSUS_NEEDS' | 'FOOD_FLOW_LAB' | 'ROLE_INSPECTOR' | 'NEST_GRAPH' | 'QUEEN_BROOD' | 'SOLDIER_DEFENSE' | 'BEHAVIOR_LOG'>('CENSUS_NEEDS');
  const [cutawayDepth, setCutawayDepth] = useState<number>(4.5);

  if (!colony || !stats) {
    return (
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl text-slate-400 text-xs">
        No active colony found in simulation.
      </div>
    );
  }

  // Count active tasks
  const taskCounts: Record<string, number> = {};
  for (const ant of colony.ants) {
    taskCounts[ant.body.task] = (taskCounts[ant.body.task] || 0) + 1;
  }

  // Top 3 colony pressures
  const demandEntries = Object.entries(stats.demands) as [string, number][];
  demandEntries.sort((a, b) => b[1] - a[1]);
  const topPressures = demandEntries.slice(0, 3);

  const getPressureReason = (key: string, val: number): string => {
    switch (key) {
      case 'foodNeed':
        return `Colony food reserves (${stats.foodStored.toFixed(1)}u) below target. Foragers mobilized.`;
      case 'broodNeed':
        return `${colony.brood.eggs + colony.brood.larvae + colony.brood.pupae} developing brood require warmth and protein feeding.`;
      case 'defenseNeed':
        return `Predator or threat detected near perimeter. Sentry guards mobilized.`;
      case 'nestNeed':
        return `High nest density (${stats.population} ants). Builders excavating galleries.`;
      case 'socialCareNeed':
        return `Starving or fatigued workers emitting local feeding cues. Trophallaxis active.`;
      case 'queenNeed':
        return `Queen somatic energy requires attending nurses for sustained egg-laying.`;
      case 'sanitationNeed':
        return `${stats.corpsesWaitingRemoval} corpses awaiting transport to surface middens.`;
      case 'explorationNeed':
        return `Scouts expanding sensory frontier and mapping food trails.`;
      default:
        return `Colony maintaining homeostatic equilibrium (${(val * 100).toFixed(0)}% pressure).`;
    }
  };

  const handleSetMode = (mode: ColonyControlMode) => {
    colony.controlMode = mode;
  };

  // Filter chambers visible at current cutaway depth across all nests
  const allChambers = colony.nest.getAllChambers ? colony.nest.getAllChambers() : colony.nest.chambers;
  const visibleChambers = allChambers.filter((c) => c.depth <= cutawayDepth);

  const snap = world.foodLedger.getLatestSnapshot();

  return (
    <div className="flex flex-col gap-3 p-4 bg-slate-900/90 border border-slate-800 rounded-2xl text-slate-200 text-xs shadow-xl backdrop-blur-md overflow-y-auto max-h-[85vh]">
      {/* Title & Mode Switcher */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-cyan-400" />
          <div>
            <h2 className="text-sm font-bold font-heading text-slate-100">COLONY SUPERORGANISM LAB</h2>
            <p className="text-[10px] text-slate-400">
              Species: <strong className="text-cyan-300 font-mono">{colony.ants[0]?.speciesProfile?.name || 'Leaf-cutter Ant (Modelled Profile)'}</strong>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[9px] font-bold">
            {(['AUTONOMOUS', 'ASSISTED', 'MANUAL'] as ColonyControlMode[]).map((m) => (
              <button
                key={m}
                onClick={() => handleSetMode(m)}
                className={`px-2 py-0.5 rounded-md transition-all ${
                  colony.controlMode === m ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <ScientificBadge category="BIOLOGICAL_INSPIRATION" />
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800 text-[10px] flex-wrap">
        <button
          onClick={() => setActiveSubTab('CENSUS_NEEDS')}
          className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
            activeSubTab === 'CENSUS_NEEDS'
              ? 'bg-cyan-600/40 text-cyan-300 border border-cyan-500/50 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Needs & Census
        </button>
        <button
          onClick={() => setActiveSubTab('FOOD_FLOW_LAB')}
          className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
            activeSubTab === 'FOOD_FLOW_LAB'
              ? 'bg-emerald-600/40 text-emerald-300 border border-emerald-500/50 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Resource Flow
        </button>
        <button
          onClick={() => setActiveSubTab('ROLE_INSPECTOR')}
          className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
            activeSubTab === 'ROLE_INSPECTOR'
              ? 'bg-indigo-600/40 text-indigo-300 border border-indigo-500/50 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Role Inspector
        </button>
        <button
          onClick={() => setActiveSubTab('SOLDIER_DEFENSE')}
          className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
            activeSubTab === 'SOLDIER_DEFENSE'
              ? 'bg-rose-600/40 text-rose-300 border border-rose-500/50 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Soldiers & Defense
        </button>
        <button
          onClick={() => setActiveSubTab('NEST_GRAPH')}
          className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
            activeSubTab === 'NEST_GRAPH'
              ? 'bg-amber-600/40 text-amber-300 border border-amber-500/50 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Nest Architecture
        </button>
        <button
          onClick={() => setActiveSubTab('QUEEN_BROOD')}
          className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
            activeSubTab === 'QUEEN_BROOD'
              ? 'bg-purple-600/40 text-purple-300 border border-purple-500/50 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Queen & Brood
        </button>
        <button
          onClick={() => setActiveSubTab('BEHAVIOR_LOG')}
          className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
            activeSubTab === 'BEHAVIOR_LOG'
              ? 'bg-blue-600/40 text-blue-300 border border-blue-500/50 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Behavior Log
        </button>
      </div>

      {/* 1. CENSUS & HOMEOSTATIC NEEDS */}
      {activeSubTab === 'CENSUS_NEEDS' && (
        <div className="flex flex-col gap-3">
          {/* Why is the colony doing this? Card */}
          <div className="bg-gradient-to-br from-cyan-950/50 to-slate-950 p-3 rounded-xl border border-cyan-500/30 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-300 text-xs flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-cyan-400" /> Why is the Colony Doing This? (Top Emergent Pressures)
              </span>
              <BiologyInfoPopup topicId="response_threshold_labor" />
            </div>
            <div className="flex flex-col gap-1 text-[11px]">
              {topPressures.map(([needKey, val]) => (
                <div key={needKey} className="flex items-start gap-2 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <span className="font-mono font-bold text-cyan-400 min-w-[75px] text-[10px] uppercase">
                    {needKey.replace('Need', '')}: {(val * 100).toFixed(0)}%
                  </span>
                  <span className="text-slate-300 text-[10px]">{getPressureReason(needKey, val)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800">
              <span className="text-[9px] text-slate-400 block">Workers</span>
              <span className="text-sm font-bold font-mono text-cyan-400">{stats.population}</span>
            </div>
            <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800">
              <span className="text-[9px] text-slate-400 block">Food Stored</span>
              <span className="text-sm font-bold font-mono text-emerald-400">{stats.foodStored.toFixed(1)} u</span>
            </div>
            <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800">
              <span className="text-[9px] text-slate-400 block">Brood Count</span>
              <span className="text-sm font-bold font-mono text-amber-400">
                {colony.brood.eggs + colony.brood.larvae + colony.brood.pupae}
              </span>
            </div>
            <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800">
              <span className="text-[9px] text-slate-400 block">Mound Soil</span>
              <span className="text-sm font-bold font-mono text-amber-300">{colony.nest.surfaceSoilMound.toFixed(1)} u</span>
            </div>
          </div>

          {/* 10-Dimensional Homeostatic Need Vector Bars */}
          <div className="flex flex-col gap-2 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" /> Homeostatic Colony Need Vector (10-D)
              </span>
              <BiologyInfoPopup topicId="foraging_dynamics" />
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px]">
              {demandEntries.map(([needKey, val]) => (
                <div key={needKey} className="flex flex-col gap-0.5">
                  <div className="flex justify-between text-slate-400">
                    <span>{needKey.replace('Need', '')}</span>
                    <span className="font-mono font-bold text-slate-200">{(val * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        val > 0.7 ? 'bg-rose-500' : val > 0.4 ? 'bg-amber-400' : 'bg-cyan-400'
                      }`}
                      style={{ width: `${Math.min(100, val * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Task Allocation Breakdown */}
          <div className="flex flex-col gap-1.5 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-300 text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Active Worker Tasks
              </span>
              <BiologyInfoPopup topicId="caste_polymorphism" />
            </div>
            {Object.entries(taskCounts).map(([task, count]) => {
              const pct = stats.population > 0 ? (count / stats.population) * 100 : 0;
              return (
                <div key={task} className="flex flex-col gap-0.5 text-[10px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">{task.replace(/_/g, ' ')}:</span>
                    <span className="font-mono font-bold text-slate-200">
                      {count} ({pct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. FOOD FLOW LAB */}
      {activeSubTab === 'FOOD_FLOW_LAB' && (
        <div className="flex flex-col gap-3">
          <div className="bg-slate-950/70 p-3 rounded-xl border border-emerald-500/30 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-300 text-xs flex items-center gap-1.5">
                <Utensils className="w-4 h-4 text-emerald-400" /> Complete Resource Circulation Pipeline
              </span>
              <BiologyInfoPopup topicId="trophallaxis_food_sharing" />
            </div>
            <div className="p-2 bg-slate-900/90 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-300 leading-relaxed">
              [EXTERNAL FORAGING] ──► [TRANSPORT] ──► [SPATIAL GRANARY] ──► [WORKER RETRIEVAL] ──► [TROPHALLAXIS] ──► [QUEEN / BROOD / METABOLISM]
            </div>
            <div className="grid grid-cols-3 gap-2 text-[10px] text-center">
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[9px]">Total Harvested</span>
                <strong className="text-emerald-400 font-mono text-xs">{stats.totalFoodHarvested.toFixed(1)} u</strong>
              </div>
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[9px]">Active In Granaries</span>
                <strong className="text-cyan-400 font-mono text-xs">{stats.foodStored.toFixed(1)} u</strong>
              </div>
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[9px]">Trophallaxis Transfers</span>
                <strong className="text-amber-400 font-mono text-xs">{colony.foodFlowHistory.length}</strong>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400 text-xs flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-emerald-400" /> Live Trophallaxis Transfer Stream
              </span>
              <BiologyInfoPopup topicId="trophallaxis_food_sharing" />
            </div>

            {colony.foodFlowHistory.length === 0 ? (
              <div className="text-center py-4 text-slate-500 text-[10px]">
                No recent trophallaxis transfers recorded. Foragers share stored resources when nestmates emit hunger cues.
              </div>
            ) : (
              <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto font-mono text-[10px]">
                {colony.foodFlowHistory.map((edge) => (
                  <div
                    key={edge.id}
                    className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900/80 border border-slate-800/80"
                  >
                    <span className="text-cyan-300 font-bold">{edge.donorId}</span>
                    <span className="text-emerald-400 font-bold">───({edge.amount.toFixed(2)}u)───►</span>
                    <span className="text-amber-300 font-bold">{edge.receiverId}</span>
                    <span className="text-slate-400 text-[9px]">@{edge.timestamp.toFixed(1)}s</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. SUBTERRANEAN NEST GRAPH & SUB-NEST NETWORK */}
      {activeSubTab === 'NEST_GRAPH' && (
        <div className="flex flex-col gap-3">
          {/* Subnest Network & Architecture Stats */}
          <div className="bg-slate-950/80 p-3 rounded-xl border border-amber-500/30 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-amber-400" /> Multi-Nest Network Overview
                </span>
                <BiologyInfoPopup topicId="nest_building_chambers" />
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    const angle = Math.random() * Math.PI * 2;
                    const dist = 22.0;
                    const pos = {
                      x: colony.nest.entrancePosition.x + Math.cos(angle) * dist,
                      y: colony.nest.entrancePosition.y + Math.sin(angle) * dist,
                    };
                    colony.nest.planSubnest('SATELLITE_FORAGING', pos, world.rng);
                  }}
                  className="px-2 py-0.5 bg-emerald-700/60 hover:bg-emerald-600 text-emerald-200 rounded-lg font-bold text-[9px] flex items-center gap-1 border border-emerald-500/40 shadow transition-all"
                >
                  + Satellite Outpost
                </button>
                <button
                  onClick={() => colony.nest.advanceConstruction(1.5, world.clock.simTime, world.eventBus, world.rng)}
                  className="px-2 py-0.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold text-[9px] flex items-center gap-1 shadow transition-all"
                >
                  <Hammer className="w-3 h-3" /> Excavate
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-1.5 text-[10px] text-center">
              <div className="bg-slate-900/90 p-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[8px]">Active Nests</span>
                <strong className="text-cyan-300 font-mono text-xs">{1 + colony.nest.subnests.length}</strong>
              </div>
              <div className="bg-slate-900/90 p-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[8px]">Total Chambers</span>
                <strong className="text-amber-300 font-mono text-xs">{allChambers.length}</strong>
              </div>
              <div className="bg-slate-900/90 p-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[8px]">Building Material</span>
                <strong className="text-emerald-400 font-mono text-xs">{colony.nest.buildingMaterial.toFixed(1)} u</strong>
              </div>
              <div className="bg-slate-900/90 p-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[8px]">Surface Mound</span>
                <strong className="text-slate-200 font-mono text-xs">{colony.nest.surfaceSoilMound.toFixed(1)} u</strong>
              </div>
            </div>

            {/* Subnests Cards */}
            {colony.nest.subnests.length > 0 && (
              <div className="flex flex-col gap-1.5 pt-1 border-t border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-300">Connected Subnests & Satellites:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {colony.nest.subnests.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col gap-1 text-[9px] font-mono"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">{sub.name}</span>
                        <div className="flex items-center gap-1">
                          {onFocusCamera && (
                            <button
                              onClick={() => onFocusCamera(sub.entrancePosition)}
                              className="px-1.5 py-0.5 rounded text-[8px] bg-cyan-950/80 hover:bg-cyan-800 text-cyan-300 border border-cyan-800/60 font-bold transition-all"
                              title="Focus 3D/2D Camera on this Subnest"
                            >
                              🎯 Focus
                            </button>
                          )}
                          <span
                            className={`px-1 rounded text-[8px] font-bold ${
                              sub.isEstablished ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                            }`}
                          >
                            {sub.isEstablished ? 'ACTIVE' : `BUILDING ${(sub.constructionProgress * 100).toFixed(0)}%`}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Dist: {sub.distanceToMainNest.toFixed(1)}m</span>
                        <span>Food: {(sub.storedFood || 0).toFixed(1)}/{sub.foodCapacity}u</span>
                        <span>Chambers: {sub.chambers.length}</span>
                      </div>
                      {!sub.isEstablished && (
                        <div className="w-full bg-slate-950 rounded-full h-1 overflow-hidden border border-slate-800">
                          <div
                            className="bg-amber-500 h-full rounded-full transition-all"
                            style={{ width: `${Math.min(100, sub.constructionProgress * 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Depth Slider & Cutaway Controls */}
          <div className="bg-slate-950/80 p-3 rounded-xl border border-amber-500/30 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-amber-400" /> Ground Cutaway Depth: {cutawayDepth.toFixed(1)}m
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Showing {visibleChambers.length}/{allChambers.length} chambers
              </span>
            </div>
            <input
              type="range"
              min="0.0"
              max="5.0"
              step="0.5"
              value={cutawayDepth}
              onChange={(e) => setCutawayDepth(parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer h-1 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[9px] text-slate-400 font-mono">
              <span>Level 0 (Surface Mound)</span>
              <span>Level -2 (Granaries & Stores)</span>
              <span>Level -4.5 (Queen Sanctum)</span>
            </div>
          </div>

          {/* Chamber List & Spatial Inventories */}
          <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
            {visibleChambers.map((chamber) => (
              <div
                key={chamber.id}
                className={`p-2.5 rounded-xl border flex flex-col gap-1 transition-all ${
                  chamber.isExcavated
                    ? 'bg-slate-950/80 border-slate-800 hover:border-amber-500/50'
                    : 'bg-slate-950/40 border-dashed border-amber-500/30 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 text-[11px] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> {chamber.name}
                  </span>
                  <span className="text-[9px] font-mono text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/40">
                    Depth: {chamber.depth.toFixed(1)}m | Vol: {(chamber.volume || 8.0).toFixed(0)}m³
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1 text-[9px] font-mono text-slate-400 pt-1 border-t border-slate-800/50">
                  <div>Stored Food: <strong className="text-emerald-400 font-bold">{(chamber.storedFood || 0).toFixed(1)}u</strong></div>
                  <div>Temp: <strong className="text-slate-200">{chamber.temperature.toFixed(1)}°C</strong></div>
                  <div>Humidity: <strong className="text-slate-200">{(chamber.humidity * 100).toFixed(0)}%</strong></div>
                  <div>Status: <strong className={chamber.isExcavated ? 'text-emerald-400' : 'text-amber-400'}>{chamber.isExcavated ? 'EXCAVATED' : `${(chamber.excavationProgress * 100).toFixed(0)}%`}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. QUEEN & BROOD REPRODUCTION */}
      {activeSubTab === 'QUEEN_BROOD' && (
        <div className="flex flex-col gap-3">
          <div className="bg-slate-950/70 p-3 rounded-xl border border-purple-500/30 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-300 text-xs flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-purple-400" /> Queen Reproductive Sanctum
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-emerald-400 font-mono font-bold">REPRODUCTIVELY ACTIVE</span>
                <BiologyInfoPopup topicId="nuptial_flight_founding" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div>
                <span className="text-slate-400">Total Eggs Laid: </span>
                <strong className="text-slate-100">{colony.queen.totalEggsLaid}</strong>
              </div>
              <div>
                <span className="text-slate-400">Somatic Energy: </span>
                <strong className="text-purple-400">{(colony.queen.energy * 100).toFixed(0)}%</strong>
              </div>
            </div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                <Egg className="w-4 h-4 text-amber-300" /> Holometabolous Lifecycle Stages
              </span>
              <BiologyInfoPopup topicId="nuptial_flight_founding" />
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Eggs</span>
                <span className="font-mono font-bold text-amber-300">{colony.brood.eggs}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Larvae</span>
                <span className="font-mono font-bold text-amber-400">{colony.brood.larvae}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Pupae</span>
                <span className="font-mono font-bold text-amber-500">{colony.brood.pupae}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. ROLE INSPECTOR — WHY IS THIS ANT DOING THIS JOB? */}
      {activeSubTab === 'ROLE_INSPECTOR' && (
        <div className="flex flex-col gap-3">
          <div className="bg-slate-950/70 p-3 rounded-xl border border-indigo-500/30 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-300 text-xs flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-indigo-400" /> Worker Role Inspector & Task Switch Rationale
              </span>
              <span className="text-[9px] font-mono text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                {colony.ants.length} Active Organisms
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Task switching follows temporal pipeline: <strong className="text-indigo-300">ROLE_EVALUATION → ROLE_COMMITMENT → ROLE_EXECUTION → ROLE_REEVALUATION</strong>.
            </p>

            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
              {colony.ants.map((ant) => {
                const snap = ant.getFullOrganismSnapshot();
                return (
                  <div
                    key={ant.id}
                    onClick={() => onSelectAnt(ant.id)}
                    className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-all flex flex-col gap-1 text-[11px]"
                  >
                    <div className="flex items-center justify-between font-mono">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100">{ant.id}</span>
                        <span className="px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 font-bold text-[9px] border border-indigo-800">
                          {ant.roleState.primaryRole}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-950 text-emerald-400 text-[9px]">
                          Task: {ant.body.task}
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-400">
                        Phase: <strong className="text-cyan-300">{ant.roleState.switchingPhase || 'ROLE_EXECUTION'}</strong>
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-300 flex justify-between bg-slate-950/60 p-1.5 rounded">
                      <span><strong>WHY IS THIS ANT DOING THIS JOB?</strong></span>
                      <span className="text-indigo-300 font-medium italic">{ant.roleState.roleSwitchReason || 'High individual task utility & caste morphology match'}</span>
                    </div>

                    <div className="grid grid-cols-4 gap-1 text-[9px] font-mono text-slate-400 pt-1">
                      <div>Energy: <strong className="text-amber-400">{(snap.energy * 100).toFixed(0)}%</strong></div>
                      <div>Health: <strong className="text-rose-400">{(snap.health * 100).toFixed(0)}%</strong></div>
                      <div>Trips: <strong className="text-cyan-400">{snap.memory.totalTripsCompleted}</strong></div>
                      <div>Harvested: <strong className="text-emerald-400">{snap.memory.totalFoodHarvested.toFixed(0)}u</strong></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 6. SOLDIERS & COMBAT DEFENSE INSPECTOR */}
      {activeSubTab === 'SOLDIER_DEFENSE' && (
        <div className="flex flex-col gap-3">
          <div className="bg-slate-950/70 p-3 rounded-xl border border-rose-500/30 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-300 text-xs flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-400" /> Soldier Combat & Colony Perimeter Defense
              </span>
              <span className="text-[9px] font-mono text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                {colony.ants.filter((a) => a.roleState.primaryRole === 'SOLDIER' || a.roleState.primaryRole === 'GUARD').length} Active Defenders
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
              <div className="bg-slate-950 p-2 rounded border border-slate-800">
                <div className="text-slate-400">THREAT LEVEL</div>
                <div className="text-rose-400 font-bold text-xs">{world.predators.length > 0 ? 'HIGH (PREDATOR DETECTED)' : 'LOW (SECURE)'}</div>
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800">
                <div className="text-slate-400">QUEEN PROTECTION</div>
                <div className="text-emerald-400 font-bold text-xs">QUEEN_GUARD_RING ACTIVE</div>
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800">
                <div className="text-slate-400">ACTIVE PREDATORS</div>
                <div className="text-amber-300 font-bold text-xs">{world.predators.length}</div>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] text-slate-400 font-bold block">Defensive Combat Roster:</span>
              <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                {colony.ants
                  .filter((a) => a.roleState.primaryRole === 'SOLDIER' || a.roleState.primaryRole === 'GUARD' || a.body.task === 'DEFENDING' || a.body.task === 'DEFEND')
                  .map((soldier) => (
                    <div key={soldier.id} className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between text-[10.5px] font-mono">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-rose-300">{soldier.id}</span>
                        <span className="text-[9px] bg-rose-950 text-rose-300 px-1.5 rounded border border-rose-800">{soldier.body.caste}</span>
                        <span className="text-slate-400 text-[9.5px]">Task: {soldier.body.task}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[9.5px]">
                        <span>HP: <strong className="text-rose-400">{(soldier.internalState.health * 100).toFixed(0)}%</strong></span>
                        <span>Energy: <strong className="text-amber-400">{(soldier.internalState.energy * 100).toFixed(0)}%</strong></span>
                      </div>
                    </div>
                  ))}
                {colony.ants.filter((a) => a.roleState.primaryRole === 'SOLDIER' || a.roleState.primaryRole === 'GUARD').length === 0 && (
                  <p className="text-[10px] text-slate-500 italic p-2 bg-slate-950 rounded">No specialized soldiers deployed. General workers provide perimeter sentry response.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. REAL-TIME BEHAVIOR EVENT LOG */}
      {activeSubTab === 'BEHAVIOR_LOG' && (
        <div className="flex flex-col gap-3">
          <div className="bg-slate-950/70 p-3 rounded-xl border border-blue-500/30 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-300 text-xs flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-blue-400" /> Real-Time Superorganism Behavior Log
              </span>
              <span className="text-[9px] font-mono text-slate-400">{world.eventLogs.length} Events</span>
            </div>

            <div className="flex flex-col gap-1 max-h-64 overflow-y-auto pr-1 font-mono text-[10px]">
              {world.eventLogs.map((log) => (
                <div key={log.id} className="p-1.5 rounded bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">[{log.timestamp.toFixed(1)}s]</span>
                    <span className="text-cyan-400 font-bold">{log.type}</span>
                    <span className="text-slate-300 font-sans text-[10.5px]">{log.message}</span>
                  </div>
                  {log.entityId && <span className="text-[9px] text-slate-400 bg-slate-950 px-1 rounded">{log.entityId}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
