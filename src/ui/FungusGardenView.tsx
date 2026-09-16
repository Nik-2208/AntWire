/**
 * ANTWIRE — Subterranean Fungus Garden & Agriculture Laboratory
 * Real-time biological telemetry for Leucoagaricus gongylophorus fungal comb,
 * Escovopsis parasite containment, and metapleural gland antibiotic defense.
 */

import React from 'react';
import { FungusAgricultureManager } from '../colony/fungus_agriculture';
import { Sprout, ShieldAlert, Sparkles, Trash2, Droplet, Thermometer, Activity } from 'lucide-react';
import { ScientificBadge } from './ScientificBadge';

interface FungusGardenViewProps {
  agricultureManager?: FungusAgricultureManager;
}

export const FungusGardenView: React.FC<FungusGardenViewProps> = ({ agricultureManager }) => {
  const summary = agricultureManager?.getSummary() || {
    gardenCount: 1,
    totalSubstrate: 12.5,
    totalFungalBiomass: 16.0,
    totalGongylidia: 8.5,
    avgContamination: 0.02,
    totalLeavesProcessed: 35.0,
    totalGongylidiaHarvested: 22.0,
    totalEscovopsisSanitized: 4.5,
    totalWasteDisposed: 6.0,
  };

  const gardens = agricultureManager?.gardens || [];

  return (
    <div className="flex flex-col gap-3 p-4 bg-slate-900/90 border border-slate-800 rounded-2xl text-slate-200 text-xs shadow-xl backdrop-blur-md overflow-y-auto max-h-[85vh]">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
            <Sprout className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-heading text-slate-100">SUBTERRANEAN FUNGUS AGRICULTURE LAB</h2>
            <p className="text-[10px] text-slate-400">Leucoagaricus gongylophorus Symbiosis & Gongylidia Yield</p>
          </div>
        </div>
        <ScientificBadge category="BIOLOGICAL_FACT" label="ATTINE AGRICULTURE" />
      </div>

      {/* Global Telemetry Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
        <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
          <div className="text-[10px] text-slate-400">Fungal Mycelium</div>
          <div className="text-base font-bold font-mono text-emerald-300">{summary.totalFungalBiomass.toFixed(1)} <span className="text-[10px] font-normal text-slate-500">mg</span></div>
        </div>
        <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
          <div className="text-[10px] text-slate-400">Gongylidia Food Yield</div>
          <div className="text-base font-bold font-mono text-amber-300">{summary.totalGongylidia.toFixed(1)} <span className="text-[10px] font-normal text-slate-500">units</span></div>
        </div>
        <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
          <div className="text-[10px] text-slate-400">Leaf Pulp Substrate</div>
          <div className="text-base font-bold font-mono text-cyan-300">{summary.totalSubstrate.toFixed(1)} <span className="text-[10px] font-normal text-slate-500">g</span></div>
        </div>
        <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
          <div className="text-[10px] text-slate-400">Escovopsis Pathogen</div>
          <div className={`text-base font-bold font-mono ${summary.avgContamination > 0.2 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {(summary.avgContamination * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Individual Garden Crypts */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
          <span>Active Subterranean Fungal Crypts ({gardens.length || 1})</span>
          <span className="text-[10px] font-normal text-slate-500">Minim Crypt-Tending Active</span>
        </div>

        {gardens.map((g) => (
          <div key={g.id} className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-300 text-xs flex items-center gap-1.5">
                <Sprout className="w-3.5 h-3.5 text-emerald-400" /> {g.id.toUpperCase()} (Depth: 3.5m)
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {(g.hydration * 100).toFixed(0)}% Moisture | {g.temperature.toFixed(1)}°C
              </span>
            </div>

            {/* Biomass Progress Bars */}
            <div className="space-y-1.5 text-[10px]">
              <div>
                <div className="flex justify-between text-slate-400 mb-0.5">
                  <span>Nutritional Gongylidia Biomass</span>
                  <span className="font-mono text-amber-300">{g.gongylidiaBiomass.toFixed(1)} / 20.0</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (g.gongylidiaBiomass / 20.0) * 100)}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-0.5">
                  <span>Metapleural Gland Antibiotic Coating</span>
                  <span className="font-mono text-cyan-300">{(g.metapleuralHygiene * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-cyan-400 h-full rounded-full transition-all duration-300" style={{ width: `${g.metapleuralHygiene * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-0.5">
                  <span>Escovopsis Parasitic Contamination</span>
                  <span className={`font-mono ${g.contaminationLevel > 0.2 ? 'text-rose-400' : 'text-slate-400'}`}>
                    {(g.contaminationLevel * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300 ${g.contaminationLevel > 0.2 ? 'bg-rose-500' : 'bg-slate-600'}`} style={{ width: `${g.contaminationLevel * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cumulative Agricultural History */}
      <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex flex-col gap-1.5 text-[10.5px]">
        <div className="font-bold text-slate-300 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-cyan-400" /> Colony Agricultural Balance Sheet
        </div>
        <div className="grid grid-cols-2 gap-2 text-slate-400 pt-1 border-t border-slate-900">
          <div>Leaves Pulp Masticated: <span className="text-slate-200 font-bold">{summary.totalLeavesProcessed.toFixed(1)} units</span></div>
          <div>Gongylidia Harvested: <span className="text-emerald-300 font-bold">{summary.totalGongylidiaHarvested.toFixed(1)} units</span></div>
          <div>Pathogens Neutralized: <span className="text-cyan-300 font-bold">{summary.totalEscovopsisSanitized.toFixed(2)} units</span></div>
          <div>Midden Refuse Disposed: <span className="text-amber-300 font-bold">{summary.totalWasteDisposed.toFixed(1)} units</span></div>
        </div>
      </div>
    </div>
  );
};
