/**
 * ANTWIRE — Entity Management & Removal Control Modal
 * Safe entity removal for individuals, worker roles, non-reproductive castes, random quotas, and predators.
 */

import React, { useState } from 'react';
import { WorldConfig } from '../simulation/world';
import { Colony } from '../colony/colony';
import { WorkerRole } from '../simulation/types';
import { Trash2, Users, Bug, AlertTriangle, X, ShieldAlert, Check } from 'lucide-react';
import { SeededRNG } from '../simulation/rng';

interface EntityManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  colony: Colony;
  predatorCount: number;
  onRemoveAnt: (antId: string) => void;
  onRemoveByRole: (role: WorkerRole) => void;
  onRemoveAllNonQueen: () => void;
  onRemoveRandomAnts: (count: number) => void;
  onRemoveAllPredators: () => void;
}

export const EntityManagementModal: React.FC<EntityManagementModalProps> = ({
  isOpen,
  onClose,
  colony,
  predatorCount,
  onRemoveAnt,
  onRemoveByRole,
  onRemoveAllNonQueen,
  onRemoveRandomAnts,
  onRemoveAllPredators,
}) => {
  const [selectedRole, setSelectedRole] = useState<WorkerRole>('FORAGER');
  const [randomCount, setRandomCount] = useState<number>(5);
  const [confirmPrompt, setConfirmPrompt] = useState<{ action: () => void; message: string } | null>(null);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (confirmPrompt) {
      confirmPrompt.action();
      setConfirmPrompt(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel border border-rose-500/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 select-none relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-rose-900/60 pb-3">
          <div className="flex items-center gap-2.5">
            <Trash2 className="w-5 h-5 text-rose-400" />
            <h2 className="text-base font-bold text-slate-100 font-heading">
              Entity Management & Safe Removal
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 p-1.5 rounded-lg bg-slate-800 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Confirmation Overlay */}
        {confirmPrompt && (
          <div className="bg-rose-950/90 border border-rose-500/80 rounded-xl p-4 space-y-3 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Confirm Entity Deletion</span>
            </div>
            <p className="text-xs text-slate-200">{confirmPrompt.message}</p>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setConfirmPrompt(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1 shadow-md shadow-rose-950"
              >
                <Check className="w-3.5 h-3.5" />
                Confirm Deletion
              </button>
            </div>
          </div>
        )}

        {/* Action Grid */}
        <div className="space-y-3 text-xs">
          {/* 1. Remove By Role */}
          <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl space-y-2">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-cyan-400" /> Remove Workers by Specialized Role
            </span>
            <div className="flex items-center gap-2">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as WorkerRole)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 flex-1 font-mono"
              >
                <option value="FORAGER">FORAGER</option>
                <option value="SCOUT">SCOUT</option>
                <option value="NURSE">NURSE</option>
                <option value="GUARD">GUARD</option>
                <option value="SANITATION">SANITATION</option>
                <option value="GENERAL_WORKER">GENERAL WORKER</option>
              </select>
              <button
                onClick={() =>
                  setConfirmPrompt({
                    action: () => onRemoveByRole(selectedRole),
                    message: `Are you sure you want to remove all active ${selectedRole} workers from the colony?`,
                  })
                }
                className="px-3 py-1.5 bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700/60 rounded-lg font-bold"
              >
                Remove {selectedRole}s
              </button>
            </div>
          </div>

          {/* 2. Remove Random N Ants (For resilience tests) */}
          <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl space-y-2">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Random Population Reduction (Ablation)
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max={colony.ants.length}
                value={randomCount}
                onChange={(e) => setRandomCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono text-center"
              />
              <button
                onClick={() =>
                  setConfirmPrompt({
                    action: () => onRemoveRandomAnts(randomCount),
                    message: `Remove ${randomCount} random workers to observe demographic recovery?`,
                  })
                }
                className="flex-1 py-1.5 bg-amber-900/60 hover:bg-amber-800 text-amber-200 border border-amber-700/60 rounded-lg font-bold"
              >
                Remove {randomCount} Random Ants
              </button>
            </div>
          </div>

          {/* 3. Remove All Non-Queen Ants */}
          <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-300">Remove All Non-Queen Ants</span>
              <p className="text-[10px] text-slate-500">Isolates Queen to test solitary egg-laying and founding viability.</p>
            </div>
            <button
              onClick={() =>
                setConfirmPrompt({
                  action: () => onRemoveAllNonQueen(),
                  message: `Remove all ${colony.ants.length} non-queen workers, leaving only the Queen?`,
                })
              }
              className="px-3 py-1.5 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-lg font-bold"
            >
              Clear Workers
            </button>
          </div>

          {/* 4. Remove All Predators */}
          <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bug className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="font-semibold text-slate-300">Remove All Active Predators ({predatorCount})</span>
                <p className="text-[10px] text-slate-500">Eliminate hunting pressure and reset colony threat arousal.</p>
              </div>
            </div>
            <button
              onClick={onRemoveAllPredators}
              disabled={predatorCount === 0}
              className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 disabled:opacity-40 rounded-lg font-bold"
            >
              Clear Predators
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
        >
          Close Manager
        </button>
      </div>
    </div>
  );
};
