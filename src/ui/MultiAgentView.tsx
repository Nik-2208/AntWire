/**
 * ANTWIRE — Multi-Agent Coordination & Collaborative Task Laboratory
 * Supports individual task assignment and decentralized group cooperation:
 * - Collective resource transport (heavy payload)
 * - Perimeter defense and coordinated predator mobbing
 * - Nest chamber excavation and construction
 * - Division of labor metrics and task specialization
 */

import React, { useState } from 'react';
import { Ant } from '../ants/ant';
import { SimulationWorld } from '../simulation/world';
import { Users, Shield, Package, Hammer, Compass, Award, CheckCircle2, Play, Plus, Zap } from 'lucide-react';
import { AntTask } from '../simulation/types';

interface MultiAgentViewProps {
  world: SimulationWorld;
  selectedAnt: Ant | null;
  onSelectAnt: (antId: string) => void;
}

export type GroupTaskType =
  | 'TRANSPORT_HEAVY_RESOURCE'
  | 'DEFEND_NEST_PERIMETER'
  | 'EXCAVATE_CHAMBER'
  | 'SURROUND_PREDATOR'
  | 'EXPLORE_SECTOR';

export interface GroupTaskRecord {
  id: string;
  name: string;
  type: GroupTaskType;
  participantIds: string[];
  progress: number; // 0 to 100%
  status: 'ACTIVE' | 'COMPLETED' | 'FAILED';
  coordinationEfficiency: number; // 0 to 1
  energyExpended: number;
}

export const MultiAgentView: React.FC<MultiAgentViewProps> = ({ world, selectedAnt, onSelectAnt }) => {
  const colony = world.colonies[0];
  const liveAnts = colony ? colony.ants : [];

  const [activeGroupTasks, setActiveGroupTasks] = useState<GroupTaskRecord[]>([
    {
      id: 'task-transport-1',
      name: 'Heavy Sugar Crystal Transport (Collab)',
      type: 'TRANSPORT_HEAVY_RESOURCE',
      participantIds: liveAnts.slice(0, 4).map((a) => a.id),
      progress: 42,
      status: 'ACTIVE',
      coordinationEfficiency: 0.88,
      energyExpended: 3.4,
    },
    {
      id: 'task-patrol-1',
      name: 'Nest Perimeter Sentry Patrol',
      type: 'DEFEND_NEST_PERIMETER',
      participantIds: liveAnts.slice(4, 7).map((a) => a.id),
      progress: 68,
      status: 'ACTIVE',
      coordinationEfficiency: 0.94,
      energyExpended: 2.1,
    },
  ]);

  const [selectedTaskType, setSelectedTaskType] = useState<GroupTaskType>('TRANSPORT_HEAVY_RESOURCE');
  const [selectedAntsForGroup, setSelectedAntsForGroup] = useState<string[]>(
    liveAnts.slice(0, Math.min(4, liveAnts.length)).map((a) => a.id)
  );

  const handleAssignIndividualTask = (task: AntTask) => {
    if (!selectedAnt) return;
    selectedAnt.body.task = task;
    world.eventBus.emit({
      type: 'SOCIAL_CONTACT',
      timestamp: performance.now() / 1000,
      entityId: selectedAnt.id,
      colonyId: colony?.id,
      data: { assignedTask: task },
    });
  };

  const handleCreateGroupTask = () => {
    if (selectedAntsForGroup.length === 0) return;

    const newTask: GroupTaskRecord = {
      id: `task-${Date.now()}`,
      name: `${selectedTaskType.replace(/_/g, ' ')} (${selectedAntsForGroup.length} ants)`,
      type: selectedTaskType,
      participantIds: [...selectedAntsForGroup],
      progress: 0,
      status: 'ACTIVE',
      coordinationEfficiency: 0.85 + Math.random() * 0.12,
      energyExpended: 0.5,
    };

    // Assign appropriate tasks to participating ants
    for (const antId of selectedAntsForGroup) {
      const ant = world.getAntById(antId);
      if (ant) {
        if (selectedTaskType === 'DEFEND_NEST_PERIMETER' || selectedTaskType === 'SURROUND_PREDATOR') {
          ant.body.task = 'DEFENDING';
        } else if (selectedTaskType === 'TRANSPORT_HEAVY_RESOURCE') {
          ant.body.task = 'FORAGING';
        } else if (selectedTaskType === 'EXCAVATE_CHAMBER') {
          ant.body.task = 'MAINTAINING_NEST';
        }
      }
    }

    setActiveGroupTasks((prev) => [newTask, ...prev]);
  };

  const toggleAntSelectionForGroup = (antId: string) => {
    setSelectedAntsForGroup((prev) =>
      prev.includes(antId) ? prev.filter((id) => id !== antId) : [...prev, antId]
    );
  };

  // Division of labor task specialization metrics
  const taskCounts: Record<string, number> = {};
  liveAnts.forEach((a) => {
    const t = a.body.task;
    taskCounts[t] = (taskCounts[t] || 0) + 1;
  });

  return (
    <div className="flex flex-col gap-3 p-4 bg-slate-900/90 border border-slate-800 rounded-2xl text-slate-200 text-xs shadow-xl backdrop-blur-md overflow-y-auto max-h-[85vh]">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-400" />
          <div>
            <h2 className="text-sm font-bold font-heading text-slate-100">MULTI-AGENT COORDINATION & GROUP TASKS</h2>
            <p className="text-[10px] text-slate-400">
              Decentralized task allocation, collaborative resource transport, and role specialization.
            </p>
          </div>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-800 font-mono">
          {liveAnts.length} Agents Available
        </span>
      </div>

      {/* Grid: Left Column (Group Tasks), Right Column (Individual Task Control) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* 1. Group Tasks Orchestration */}
        <div className="space-y-2.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="font-bold text-indigo-300 text-xs flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5" /> Collaborative Group Tasks
            </span>
          </div>

          {/* Active Group Tasks List */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {activeGroupTasks.map((task) => (
              <div
                key={task.id}
                className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800 flex flex-col gap-1.5 text-[11px]"
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-200">{task.name}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono">
                    {task.participantIds.length} ants
                  </span>
                </div>

                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all"
                    style={{ width: `${task.progress}%` }}
                  />
                </div>

                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Progress: {task.progress}%</span>
                  <span>Coordination: {(task.coordinationEfficiency * 100).toFixed(0)}%</span>
                  <span>Energy: {task.energyExpended.toFixed(1)}u</span>
                </div>
              </div>
            ))}
          </div>

          {/* Create New Group Task */}
          <div className="pt-2 border-t border-slate-800/80 space-y-2">
            <span className="text-[10px] font-semibold text-slate-400">Launch New Collaborative Mission</span>
            <div className="grid grid-cols-2 gap-1.5">
              <select
                value={selectedTaskType}
                onChange={(e) => setSelectedTaskType(e.target.value as GroupTaskType)}
                className="bg-slate-900 border border-slate-800 rounded p-1 text-[10px] text-slate-200"
              >
                <option value="TRANSPORT_HEAVY_RESOURCE">Heavy Resource Transport</option>
                <option value="DEFEND_NEST_PERIMETER">Nest Defense Perimeter</option>
                <option value="EXCAVATE_CHAMBER">Nest Chamber Excavation</option>
                <option value="SURROUND_PREDATOR">Surround & Deter Predator</option>
                <option value="EXPLORE_SECTOR">Coordinated Sector Recon</option>
              </select>

              <button
                onClick={handleCreateGroupTask}
                className="py-1 px-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] flex items-center justify-center gap-1 shadow transition-all cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Assign Group
              </button>
            </div>

            {/* Select Participating Ants */}
            <div className="space-y-1">
              <span className="text-[9px] text-slate-400">Select Workers ({selectedAntsForGroup.length} chosen):</span>
              <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                {liveAnts.map((ant) => {
                  const isChosen = selectedAntsForGroup.includes(ant.id);
                  return (
                    <button
                      key={ant.id}
                      onClick={() => toggleAntSelectionForGroup(ant.id)}
                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono border transition-all cursor-pointer ${
                        isChosen
                          ? 'bg-indigo-950 text-indigo-300 border-indigo-600'
                          : 'bg-slate-900/60 text-slate-500 border-slate-800 hover:text-slate-300'
                      }`}
                    >
                      {ant.id}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Individual Task Assignment & Specialization */}
        <div className="space-y-2.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="font-bold text-cyan-300 text-xs flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" /> Individual Task Override
            </span>

            {selectedAnt ? (
              <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800 text-[11px] space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-slate-100">{selectedAnt.id}</span>
                  <span className="text-[10px] text-cyan-400 font-semibold">{selectedAnt.body.caste}</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Current Task: <span className="text-emerald-400 font-medium">{selectedAnt.body.task}</span>
                </div>

                <div className="pt-1.5 grid grid-cols-3 gap-1">
                  {(['FORAGING', 'EXPLORING', 'DEFENDING', 'FEEDING_BROOD', 'MAINTAINING_NEST', 'RESTING'] as AntTask[]).map(
                    (t) => (
                      <button
                        key={t}
                        onClick={() => handleAssignIndividualTask(t)}
                        className={`text-[9px] py-1 px-1 rounded font-semibold transition-all cursor-pointer ${
                          selectedAnt.body.task === t
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
                            : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                        }`}
                      >
                        {t.replace(/_/g, ' ')}
                      </button>
                    )
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-800 text-center text-slate-500 text-[11px]">
                Select an ant in the 3D world to assign an individual task override.
              </div>
            )}
          </div>

          {/* Division of Labor Specialization Breakdown */}
          <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
            <div className="flex justify-between items-center text-[10px]">
              <span className="font-semibold text-slate-300">Division of Labor Allocation:</span>
              <span className="text-slate-400 font-mono">{liveAnts.length} total</span>
            </div>

            <div className="grid grid-cols-2 gap-1 text-[10px]">
              {Object.entries(taskCounts).map(([task, count]) => (
                <div key={task} className="flex justify-between bg-slate-900/50 p-1 rounded border border-slate-800/50">
                  <span className="text-slate-400">{task.replace(/_/g, ' ')}:</span>
                  <span className="font-mono text-cyan-300 font-bold">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
