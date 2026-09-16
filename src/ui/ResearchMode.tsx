/**
 * ANTWIRE — Research Mode Deep Telemetry & Instrumentation Panel
 */

import React from 'react';
import { Ant } from '../ants/ant';
import { SimulationWorld } from '../simulation/world';
import { Cpu, Activity, Database, Zap, Compass, Layers } from 'lucide-react';
import { ScientificBadge } from './ScientificBadge';

interface ResearchModeProps {
  world: SimulationWorld;
  selectedAnt: Ant | null;
}

export const ResearchMode: React.FC<ResearchModeProps> = ({ world, selectedAnt }) => {
  const clock = world.clock;
  const phero = world.pheromones;
  const ant = selectedAnt;

  return (
    <div className="glass-panel rounded-xl p-4 flex flex-col gap-3 text-slate-200 shadow-2xl select-none max-w-md w-full max-h-[82vh] overflow-y-auto">
      <div className="flex items-center justify-between border-b border-cyan-950 pb-2">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-emerald-400" />
          <h3 className="font-heading text-sm font-bold text-slate-100">Research Instrumentation</h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
          SEED: {world.config.seed}
        </span>
      </div>

      {/* Computational Performance Metrics */}
      <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono bg-slate-950/80 p-2 rounded-lg border border-slate-800">
        <div>
          <div className="text-slate-500">RENDER FPS</div>
          <div className="text-emerald-400 font-bold text-xs">~60</div>
        </div>
        <div>
          <div className="text-slate-500">SIM TPS</div>
          <div className="text-cyan-400 font-bold text-xs">{clock.lastTps.toFixed(0)} Hz</div>
        </div>
        <div>
          <div className="text-slate-500">FIXED DT</div>
          <div className="text-slate-300 font-bold text-xs">{(clock.fixedDt * 1000).toFixed(1)}ms</div>
        </div>
      </div>

      {/* Selected Ant Computational State */}
      {ant ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-cyan-300 border-b border-slate-800/60 pb-1">
            <span>Agent Computational Substrate: {ant.id}</span>
            <ScientificBadge category="COMPUTATIONAL_ABSTRACTION" />
          </div>

          {/* Controller Type */}
          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 text-xs space-y-1">
            <div className="flex justify-between text-slate-400">
              <span>Active Policy Controller:</span>
              <span className="font-mono font-bold text-emerald-400">{ant.controller.name}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Controller Architecture:</span>
              <span className="font-mono text-cyan-300">{ant.controller.type} (v{ant.controller.version})</span>
            </div>
          </div>

          {/* Raw Sensory Inputs Array */}
          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 text-[11px] space-y-1.5 font-mono">
            <div className="text-slate-400 font-sans font-semibold flex items-center justify-between">
              <span>Raw Sensory Observation Vector</span>
              <span className="text-[10px] text-slate-500">[-1.0, 1.0]</span>
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-slate-300">
              <div>Food Phero L/C/R: [{ant.sensors.lastSnapshot.foodLeft.toFixed(2)}, {ant.sensors.lastSnapshot.foodCenter.toFixed(2)}, {ant.sensors.lastSnapshot.foodRight.toFixed(2)}]</div>
              <div>Home Phero L/C/R: [{ant.sensors.lastSnapshot.homeLeft.toFixed(2)}, {ant.sensors.lastSnapshot.homeCenter.toFixed(2)}, {ant.sensors.lastSnapshot.homeRight.toFixed(2)}]</div>
              <div>Food Odor Conc: {ant.sensors.lastSnapshot.foodOdorConcentration.toFixed(3)}</div>
              <div>Food Odor RelAngle: {ant.sensors.lastSnapshot.foodOdorDirection.toFixed(2)} rad</div>
              <div>Nest Odor Conc: {ant.sensors.lastSnapshot.nestOdorConcentration.toFixed(3)}</div>
              <div>Obstacle Ray L/C/R: [{ant.sensors.lastSnapshot.obstacleLeft.toFixed(2)}, {ant.sensors.lastSnapshot.obstacleCenter.toFixed(2)}, {ant.sensors.lastSnapshot.obstacleRight.toFixed(2)}]</div>
              <div>Threat Proximity: {ant.sensors.lastSnapshot.predatorProximity.toFixed(2)}</div>
              <div>Kinematic Heading: {ant.body.heading.toFixed(2)} rad</div>
            </div>
          </div>

          {/* Bounded Episodic Spatial Memory */}
          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-slate-300 font-semibold">
              <span className="flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-cyan-400" /> Bounded Spatial Memory
              </span>
              <span className="font-mono text-[10px] text-slate-400">
                {ant.memory.recentBreadcrumbs.length} / {ant.memory.maxBreadcrumbs} nodes
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Last Known Food Patch: {ant.memory.lastKnownFoodPosition ? `(${ant.memory.lastKnownFoodPosition.x.toFixed(1)}, ${ant.memory.lastKnownFoodPosition.y.toFixed(1)}) [Conf: ${(ant.memory.foodConfidence * 100).toFixed(0)}%]` : 'None in memory buffer'}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-xs text-slate-500 italic text-center py-4">
          Select an ant to stream high-density computational telemetry.
        </div>
      )}

      {/* Pheromone Field Statistics */}
      <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 text-xs space-y-1">
        <div className="flex items-center justify-between font-semibold text-slate-300">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-400" /> Spatial Pheromone Grid
          </span>
          <span className="font-mono text-[10px] text-slate-400">{phero.gridRes}x{phero.gridRes} cells</span>
        </div>
        <div className="grid grid-cols-3 gap-1 text-[10px] font-mono pt-1 text-center">
          <div className="bg-slate-950 p-1 rounded border border-slate-800/80">
            <div className="text-slate-500">FOOD λ</div>
            <div className="text-emerald-400 font-bold">{phero.config.decayRates[0]}</div>
          </div>
          <div className="bg-slate-950 p-1 rounded border border-slate-800/80">
            <div className="text-slate-500">HOME λ</div>
            <div className="text-cyan-400 font-bold">{phero.config.decayRates[1]}</div>
          </div>
          <div className="bg-slate-950 p-1 rounded border border-slate-800/80">
            <div className="text-slate-500">DIFF D</div>
            <div className="text-slate-300 font-bold">{phero.config.diffusionRates[0]}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
