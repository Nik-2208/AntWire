/**
 * ANTWIRE — Ecological Interactions & Symbiosis Observatory
 * Visualizes Aphid Trophobiosis, Fungus Agriculture, and Dynamic Food Web Graph.
 */

import React from 'react';
import { Network, Sparkles, Leaf, ShieldAlert, ArrowRight } from 'lucide-react';
import { SimulationWorld } from '../simulation/world';
import { BiologyInfoPopup } from './BiologyInfoPopup';

interface EcologyPanelProps {
  world: SimulationWorld;
  onRefresh: () => void;
}

export const EcologyPanel: React.FC<EcologyPanelProps> = ({ world, onRefresh }) => {
  const ecology = world.ecology;
  const colony = world.colonies[0];
  const antCount = colony ? colony.ants.length : 0;
  const predCount = world.predators.length;

  const { nodes, edges } = ecology.getEcologyGraph(antCount, predCount);
  const totalHoneydew = ecology.totalHoneydewHarvested;
  const totalFungus = ecology.totalFungusHarvested;
  const aphidCount = ecology.aphids.length;

  return (
    <div className="glass-panel rounded-xl p-4 flex flex-col gap-4 text-slate-200 shadow-2xl select-none max-h-[80vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-emerald-400" />
          <h3 className="font-heading text-sm font-bold text-slate-100">Symbiosis & Ecological Network</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800 font-mono">
            Ecosystem Active
          </span>
          <BiologyInfoPopup topicId="fungus_agriculture" />
        </div>
      </div>

      {/* 1. Aphid Trophobiosis Card */}
      <div className="space-y-2.5 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-lime-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Aphid Mutualism (Honeydew Farming)</span>
            <BiologyInfoPopup topicId="foraging_dynamics" />
          </div>
          <button
            onClick={() => {
              ecology.spawnAphid({
                x: 18.0 + (Math.random() - 0.5) * 6.0,
                y: -14.0 + (Math.random() - 0.5) * 6.0,
              });
              onRefresh();
            }}
            className="text-[10px] px-2 py-0.5 rounded bg-lime-900/50 hover:bg-lime-800/60 text-lime-300 border border-lime-700/60 transition-all cursor-pointer"
          >
            + Add Aphids
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="bg-slate-950/50 p-2 rounded border border-slate-800/60">
            <div className="text-slate-400">Aphid Population</div>
            <div className="font-mono text-lime-300 text-sm font-bold">{aphidCount} bugs</div>
          </div>
          <div className="bg-slate-950/50 p-2 rounded border border-slate-800/60">
            <div className="text-slate-400">Honeydew Harvested</div>
            <div className="font-mono text-lime-300 text-sm font-bold">{totalHoneydew.toFixed(1)} units</div>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed italic">
          Ants palpate aphids with antennae to stimulate carbohydrate droplet excretion in exchange for defense against predators.
        </p>
      </div>

      {/* 2. Fungus-Growing Agriculture Card */}
      <div className="space-y-2.5 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
            <Leaf className="w-3.5 h-3.5" />
            <span>Subterranean Fungus Garden (Agriculture)</span>
            <BiologyInfoPopup topicId="fungus_agriculture" />
          </div>
          <button
            onClick={() => {
              if (ecology.fungusGardens[0]) {
                ecology.fungusGardens[0].substrateMass += 10.0;
                onRefresh();
              }
            }}
            className="text-[10px] px-2 py-0.5 rounded bg-amber-900/50 hover:bg-amber-800/60 text-amber-300 border border-amber-700/60 transition-all cursor-pointer"
          >
            + Add Leaves
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="bg-slate-950/50 p-2 rounded border border-slate-800/60">
            <div className="text-slate-400">Edible Fungal Biomass</div>
            <div className="font-mono text-amber-300 text-sm font-bold">
              {ecology.fungusGardens.reduce((acc, g) => acc + g.fungalBiomass, 0).toFixed(1)} g
            </div>
          </div>
          <div className="bg-slate-950/50 p-2 rounded border border-slate-800/60">
            <div className="text-slate-400">Substrate Reserves</div>
            <div className="font-mono text-amber-300 text-sm font-bold">
              {ecology.fungusGardens.reduce((acc, g) => acc + g.substrateMass, 0).toFixed(1)} units
            </div>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed italic">
          Attine agriculture: workers harvest plant leaves to cultivate mutualistic mycelial gongylidia rich in lipids and protein.
        </p>
      </div>

      {/* 3. Ecological Interaction Graph */}
      <div className="space-y-2 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
        <div className="flex items-center justify-between text-xs font-semibold text-cyan-400">
          <span className="flex items-center gap-1.5">
            <Network className="w-3.5 h-3.5" /> Symbiont Food Web Matrix
          </span>
        </div>

        <div className="flex flex-col gap-1.5 mt-2">
          {edges.map((edge, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between text-[11px] p-1.5 rounded bg-slate-950/60 border border-slate-800/50"
            >
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-200 uppercase text-[10px]">{edge.source}</span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
                <span className="font-semibold text-slate-200 uppercase text-[10px]">{edge.target}</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                    edge.type === 'MUTUALISM'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : edge.type === 'PARASITISM'
                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                      : 'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}
                >
                  {edge.type}
                </span>
                <span className="font-mono text-[10px] text-slate-400">
                  net: {edge.isMutualisticNet ? '++' : '--'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
