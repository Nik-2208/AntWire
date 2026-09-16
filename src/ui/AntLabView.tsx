/**
 * ANTWIRE — Dedicated Ant Lab Tab
 * Deep inspection of the selected individual ant organism: physical morphology,
 * 6-legged tripod gait, sensory streams, homeostatic metabolism, motivational drives,
 * episodic spatial memory, active controller policy, and "WHY DID IT DO THAT?" explainability.
 */

import React, { useState } from 'react';
import { Ant } from '../ants/ant';
import { AntInspector } from './AntInspector';
import { NeurobiologyLab } from './NeurobiologyLab';
import { ScientificBadge } from './ScientificBadge';
import { BiologyInfoPopup } from './BiologyInfoPopup';
import { Bug, Eye, Compass, HeartPulse, Brain, HelpCircle, Activity } from 'lucide-react';

interface AntLabViewProps {
  ant: Ant | null;
}

export const AntLabView: React.FC<AntLabViewProps> = ({ ant }) => {
  const [subTab, setSubTab] = useState<'PHYSIOLOGY' | 'SENSORS' | 'NEUROPILS' | 'MEMORY' | 'WHY'>('PHYSIOLOGY');

  if (!ant) {
    return (
      <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl text-slate-400 text-xs flex flex-col items-center justify-center gap-2 text-center">
        <Bug className="w-8 h-8 text-slate-600" />
        <span className="font-bold text-slate-300">No Ant Currently Selected</span>
        <p className="text-[11px] text-slate-500 max-w-xs">
          Click on any ant in the 3D world or select one from the Colony Lab roster to link its real-time digital twin.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4 bg-slate-900/90 border border-slate-800 rounded-2xl text-slate-200 text-xs shadow-xl backdrop-blur-md overflow-y-auto max-h-[85vh]">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Bug className="w-5 h-5 text-cyan-400" />
          <div>
            <h2 className="text-sm font-bold font-heading text-slate-100">
              ANT LAB — DIGITAL TWIN #{ant.id}
            </h2>
            <p className="text-[10px] text-slate-400">
              Caste: <strong className="text-cyan-300">{ant.body.caste}</strong> | Role: <strong className="text-emerald-300">{ant.body.task}</strong>
            </p>
          </div>
        </div>
        <ScientificBadge category="BIOLOGICAL_FACT" />
      </div>

      {/* Sub-Tab Switcher */}
      <div className="flex items-center gap-1.5 bg-slate-950/70 p-1 rounded-xl border border-slate-800 text-[11px]">
        <button
          onClick={() => setSubTab('PHYSIOLOGY')}
          className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
            subTab === 'PHYSIOLOGY'
              ? 'bg-cyan-600/40 text-cyan-300 border border-cyan-500/50 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Physiology
        </button>
        <button
          onClick={() => setSubTab('SENSORS')}
          className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
            subTab === 'SENSORS'
              ? 'bg-emerald-600/40 text-emerald-300 border border-emerald-500/50 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Sensors
        </button>
        <button
          onClick={() => setSubTab('NEUROPILS')}
          className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
            subTab === 'NEUROPILS'
              ? 'bg-amber-600/40 text-amber-300 border border-amber-500/50 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Neuropils
        </button>
        <button
          onClick={() => setSubTab('MEMORY')}
          className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
            subTab === 'MEMORY'
              ? 'bg-purple-600/40 text-purple-300 border border-purple-500/50 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Memory
        </button>
      </div>

      {/* Content */}
      {subTab === 'PHYSIOLOGY' && <AntInspector ant={ant} />}
      {subTab === 'NEUROPILS' && <NeurobiologyLab ant={ant} />}
      {subTab === 'SENSORS' && (
        <div className="flex flex-col gap-2.5 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="font-bold text-emerald-300 text-xs flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-emerald-400" /> Antennae & Mechanosensory Snapshot
            </span>
            <BiologyInfoPopup topicId="antennae_sensing" />
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Left Antenna Food</span>
              <strong className="text-emerald-400">{ant.sensors.lastSnapshot.foodLeft.toFixed(3)}</strong>
            </div>
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Right Antenna Food</span>
              <strong className="text-emerald-400">{ant.sensors.lastSnapshot.foodRight.toFixed(3)}</strong>
            </div>
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Trail Pheromone (L)</span>
              <strong className="text-cyan-400">{ant.sensors.lastSnapshot.homeLeft.toFixed(3)}</strong>
            </div>
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Trail Pheromone (R)</span>
              <strong className="text-cyan-400">{ant.sensors.lastSnapshot.homeRight.toFixed(3)}</strong>
            </div>
          </div>
        </div>
      )}
      {subTab === 'MEMORY' && (
        <div className="flex flex-col gap-2.5 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="font-bold text-purple-300 text-xs flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-purple-400" /> Bounded Spatial Memory Buffer
            </span>
            <BiologyInfoPopup topicId="central_complex_navigation" />
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Nest Distance Proximity</span>
              <strong className="text-slate-200">
                {(ant.sensors.lastSnapshot.nestProximity * 100).toFixed(0)}% (Dir: {ant.sensors.lastSnapshot.nestOdorDirection.toFixed(2)} rad)
              </strong>
            </div>
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Food Discovered Location</span>
              <strong className="text-amber-300">
                {ant.memory.lastKnownFoodPosition
                  ? `(${ant.memory.lastKnownFoodPosition.x.toFixed(1)}, ${ant.memory.lastKnownFoodPosition.y.toFixed(1)})`
                  : 'None stored'}
              </strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
