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
  const [activeSubTab, setActiveSubTab] = useState<'CENSUS_NEEDS' | 'FOOD_FLOW_LAB' | 'NEST_GRAPH' | 'QUEEN_BROOD'>('CENSUS_NEEDS');
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

  return (
    <div className="flex flex-col gap-3 p-4 bg-slate-900/90 border border-slate-800 rounded-2xl text-slate-200 text-xs shadow-xl backdrop-blur-md overflow-y-auto max-h-[85vh]">
      {/* Title & Mode Switcher */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-cyan-400" />
          <div>
            <h2 className="text-sm font-bold font-heading text-slate-100">COLONY SUPERORGANISM LAB</h2>
            <p className="text-[10px] text-slate-400">
              Species: <strong className="text-cyan-300 font-mono">Biologically Informed Experimental Ant</strong>
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
      <div className="flex items-center gap-1.5 bg-slate-950/70 p-1 rounded-xl border border-slate-800 text-[11px]">
        <button
          onClick={() => setActiveSubTab('CENSUS_NEEDS')}
          className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
            activeSubTab === 'CENSUS_NEEDS'
              ? 'bg-cyan-600/40 text-cyan-300 border border-cyan-500/50 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Needs & Census
        </button>
        <button
          onClick={() => setActiveSubTab('FOOD_FLOW_LAB')}
          className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
            activeSubTab === 'FOOD_FLOW_LAB'
              ? 'bg-emerald-600/40 text-emerald-300 border border-emerald-500/50 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Food Flow Lab
        </button>
        <button
          onClick={() => setActiveSubTab('NEST_GRAPH')}
          className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
            activeSubTab === 'NEST_GRAPH'
              ? 'bg-amber-600/40 text-amber-300 border border-amber-500/50 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Subterranean Nest
        </button>
        <button
          onClick={() => setActiveSubTab('QUEEN_BROOD')}
          className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
            activeSubTab === 'QUEEN_BROOD'
              ? 'bg-purple-600/40 text-purple-300 border border-purple-500/50 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Queen & Brood
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
    </div>
  );
};
