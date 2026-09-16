/**
 * ANTWIRE — Polymorphic Caste Distribution & Threshold Tuning Lab
 * Interactive visualizer for continuous allometric scaling, demographic pyramids,
 * and Bonabeau-Theraulaz response threshold dynamics across Attine subcastes.
 */

import React, { useState } from 'react';
import { AntCaste } from '../simulation/types';
import { CASTE_MORPHOLOGY_TABLE } from '../colony/roles';
import { Users, Sliders, Shield, Zap, Scissors, Sprout, Heart } from 'lucide-react';
import { ScientificBadge } from './ScientificBadge';

interface CasteDistributionLabProps {
  casteCounts?: Record<string, number>;
}

export const CasteDistributionLab: React.FC<CasteDistributionLabProps> = ({ casteCounts }) => {
  const [selectedCaste, setSelectedCaste] = useState<AntCaste>('MEDIA');

  const counts: Record<string, number> = casteCounts || {
    MINIM: 4,
    MINOR: 3,
    MEDIA: 5,
    MAJOR: 1,
    QUEEN: 1,
    GYNE: 0,
    MALE: 0,
  };

  const totalWorkers = Object.entries(counts).reduce((acc, [k, v]) => (k !== 'QUEEN' ? acc + v : acc), 0) || 1;
  const currentTraits = CASTE_MORPHOLOGY_TABLE[selectedCaste] || CASTE_MORPHOLOGY_TABLE.MEDIA;

  const casteOrder: { caste: AntCaste; label: string; icon: string; color: string }[] = [
    { caste: 'MINIM', label: 'Minim (Crypt & Hitchhiker)', icon: '🌱', color: 'bg-emerald-500' },
    { caste: 'MINOR', label: 'Minor (Nurse & Pulping)', icon: '🍃', color: 'bg-cyan-500' },
    { caste: 'MEDIA', label: 'Media (Leaf Forager)', icon: '✂️', color: 'bg-amber-500' },
    { caste: 'MAJOR', label: 'Major (Nest Defense)', icon: '🛡️', color: 'bg-rose-500' },
    { caste: 'GYNE', label: 'Virgin Gyne (Alate)', icon: '👑', color: 'bg-purple-500' },
    { caste: 'MALE', label: 'Drone (Alate Male)', icon: '🐝', color: 'bg-blue-500' },
  ];

  return (
    <div className="flex flex-col gap-3 p-4 bg-slate-900/90 border border-slate-800 rounded-2xl text-slate-200 text-xs shadow-xl backdrop-blur-md overflow-y-auto max-h-[85vh]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-950/80 border border-amber-500/50 flex items-center justify-center text-amber-400">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-heading text-slate-100">POLYMORPHIC CASTE DEMOGRAPHICS</h2>
            <p className="text-[10px] text-slate-400">Allometric Scaling & Bonabeau-Theraulaz Response Thresholds</p>
          </div>
        </div>
        <ScientificBadge category="BIOLOGICAL_FACT" label="POLYMORPHISM" />
      </div>

      {/* Demographic Pyramid Bars */}
      <div className="space-y-2 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
        <div className="text-xs font-bold text-slate-300 flex justify-between">
          <span>Colony Caste Distribution</span>
          <span className="font-mono text-cyan-400">{totalWorkers} Active Subcastes</span>
        </div>

        <div className="space-y-1.5 text-[10.5px]">
          {casteOrder.map((c) => {
            const count = counts[c.caste] || 0;
            const pct = Math.round((count / totalWorkers) * 100);
            const isSelected = selectedCaste === c.caste;

            return (
              <div
                key={c.caste}
                onClick={() => setSelectedCaste(c.caste)}
                className={`p-2 rounded-lg cursor-pointer transition-all border ${
                  isSelected ? 'bg-slate-900 border-cyan-500/80 shadow-md' : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-900/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold flex items-center gap-1.5 text-slate-200">
                    <span>{c.icon}</span>
                    <span>{c.label}</span>
                  </span>
                  <span className="font-mono font-bold text-slate-300">
                    {count} <span className="text-[9px] font-normal text-slate-500">({pct}%)</span>
                  </span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                  <div className={`${c.color} h-full rounded-full transition-all duration-300`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Caste Physical Morphology & Task Affinities */}
      <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
          <span className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-amber-400" /> {selectedCaste} Morphology & Biomechanics
          </span>
          <span className="text-[10px] font-mono text-slate-400">Head: {currentTraits.headWidthMm}mm | Mass: {currentTraits.massMg}mg</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[10.5px]">
          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 space-y-0.5">
            <div className="text-slate-400 flex items-center gap-1"><Scissors className="w-3 h-3 text-amber-400" /> Leaf Slicing Rate</div>
            <div className="font-mono text-amber-300 font-bold">{(currentTraits.leafCuttingEfficiency * 100).toFixed(0)}% efficiency</div>
          </div>
          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 space-y-0.5">
            <div className="text-slate-400 flex items-center gap-1"><Sprout className="w-3 h-3 text-emerald-400" /> Fungal Crypt Tending</div>
            <div className="font-mono text-emerald-300 font-bold">{(currentTraits.fungusTendingAffinity * 100).toFixed(0)}% affinity</div>
          </div>
          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 space-y-0.5">
            <div className="text-slate-400 flex items-center gap-1"><Shield className="w-3 h-3 text-rose-400" /> Defense Force (Mandibles)</div>
            <div className="font-mono text-rose-300 font-bold">{currentTraits.mandibleForceN} N bite force</div>
          </div>
          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 space-y-0.5">
            <div className="text-slate-400 flex items-center gap-1"><Heart className="w-3 h-3 text-cyan-400" /> Brood Care Affinity</div>
            <div className="font-mono text-cyan-300 font-bold">{(currentTraits.broodCareAffinity * 100).toFixed(0)}% affinity</div>
          </div>
        </div>
      </div>
    </div>
  );
};
