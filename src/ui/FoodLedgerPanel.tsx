/**
 * ANTWIRE — Colony Food Ledger & Thermodynamic Conservation Panel
 * Displays real-time closed-system accounting across the entire ecosystem.
 * Invariant: foodSpawned = foodRemainingWorld + foodCarried + foodStored + foodConsumed + foodLost + foodDecayed
 */

import React, { useState, useEffect } from 'react';
import { SimulationWorld } from '../simulation/world';
import { FoodLedgerSnapshot, TrophallaxisRecord } from '../simulation/food_ledger';
import { Scale, CheckCircle2, AlertTriangle, ArrowRightLeft, Apple, Archive, Flame, ShieldAlert } from 'lucide-react';
import { BiologyInfoPopup } from './BiologyInfoPopup';

interface FoodLedgerPanelProps {
  world: SimulationWorld;
}

export const FoodLedgerPanel: React.FC<FoodLedgerPanelProps> = ({ world }) => {
  const [snapshot, setSnapshot] = useState<FoodLedgerSnapshot>({
    foodSpawned: 0,
    foodRemainingWorld: 0,
    foodCarried: 0,
    foodStored: 0,
    foodConsumed: 0,
    foodTransferred: 0,
    foodLost: 0,
    foodDecayed: 0,
    conservationError: 0,
    isConserved: true,
    timestamp: 0,
  });
  const [trophallaxisRecords, setTrophallaxisRecords] = useState<TrophallaxisRecord[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      const allAnts = world.colonies.flatMap((c) => c.ants);
      const foodRemainingWorld = world.foodEntities.reduce((sum, f) => sum + f.amount, 0);
      const foodCarried = allAnts.reduce((sum, a) => sum + a.internalState.state.carryingFoodAmount, 0);
      const foodStored = world.colonies.reduce((sum, c) => sum + c.foodStore, 0);
      const snap = world.foodLedger.computeBalance(foodRemainingWorld, foodCarried, foodStored, world.clock.simTime);
      setSnapshot(snap);
      setTrophallaxisRecords([...world.foodLedger.trophallaxisHistory]);
    }, 200);

    return () => clearInterval(timer);
  }, [world]);

  const totalAccounted =
    snapshot.foodRemainingWorld +
    snapshot.foodCarried +
    snapshot.foodStored +
    snapshot.foodConsumed +
    snapshot.foodLost +
    snapshot.foodDecayed;

  return (
    <div className="flex flex-col gap-3 p-4 bg-slate-900/90 border border-slate-800 rounded-2xl text-slate-200 text-xs shadow-xl backdrop-blur-md overflow-y-auto max-h-[85vh] font-mono">
      {/* Title & Invariant Status Badge */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-emerald-400" />
          <div>
            <h2 className="text-sm font-bold font-sans text-slate-100">COLONY FOOD LEDGER & THERMODYNAMICS</h2>
            <p className="text-[10px] text-slate-400">Strict Conservation Invariant & Social Trophallaxis Exchange</p>
          </div>
        </div>
        <div
          className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 border ${
            snapshot.isConserved
              ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
              : 'bg-rose-950/60 border-rose-500/50 text-rose-300 animate-pulse'
          }`}
        >
          {snapshot.isConserved ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>CONSERVED (Δ {snapshot.conservationError.toFixed(4)})</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>LEAK DETECTED (Δ {snapshot.conservationError.toFixed(4)})</span>
            </>
          )}
        </div>
      </div>

      {/* Conservation Equation Strip */}
      <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 flex flex-col gap-2">
        <span className="text-[10px] text-slate-400 font-bold block">
          CLOSED-SYSTEM RESOURCE BALANCE EQUATION:
        </span>
        <div className="flex items-center justify-between text-[11px] bg-slate-900/80 p-2 rounded-lg border border-slate-800/80">
          <div className="text-center">
            <span className="text-[9px] text-slate-400 block">Spawned</span>
            <span className="font-bold text-emerald-400 text-xs">{snapshot.foodSpawned.toFixed(2)}</span>
          </div>
          <span className="text-slate-500 font-bold">=</span>
          <div className="text-center">
            <span className="text-[9px] text-slate-400 block">World</span>
            <span className="font-bold text-cyan-400">{snapshot.foodRemainingWorld.toFixed(2)}</span>
          </div>
          <span className="text-slate-500">+</span>
          <div className="text-center">
            <span className="text-[9px] text-slate-400 block">Carried</span>
            <span className="font-bold text-amber-400">{snapshot.foodCarried.toFixed(2)}</span>
          </div>
          <span className="text-slate-500">+</span>
          <div className="text-center">
            <span className="text-[9px] text-slate-400 block">Stored</span>
            <span className="font-bold text-blue-400">{snapshot.foodStored.toFixed(2)}</span>
          </div>
          <span className="text-slate-500">+</span>
          <div className="text-center">
            <span className="text-[9px] text-slate-400 block">Metabolized</span>
            <span className="font-bold text-fuchsia-400">{snapshot.foodConsumed.toFixed(2)}</span>
          </div>
          <span className="text-slate-500">+</span>
          <div className="text-center">
            <span className="text-[9px] text-slate-400 block">Lost/Decayed</span>
            <span className="font-bold text-slate-400">{(snapshot.foodLost + snapshot.foodDecayed).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2.5">
          <Apple className="w-5 h-5 text-emerald-400" />
          <div>
            <span className="text-[10px] text-slate-400 block">WORLD FORAGING</span>
            <span className="font-bold text-slate-200 text-xs">{snapshot.foodRemainingWorld.toFixed(1)} units</span>
            <span className="text-[9px] text-slate-500 block">{world.foodEntities.length} active patches</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2.5">
          <Archive className="w-5 h-5 text-blue-400" />
          <div>
            <span className="text-[10px] text-slate-400 block">COLONY STORE</span>
            <span className="font-bold text-slate-200 text-xs">{snapshot.foodStored.toFixed(1)} units</span>
            <span className="text-[9px] text-slate-500 block">Nest chamber storage</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2.5">
          <Flame className="w-5 h-5 text-fuchsia-400" />
          <div>
            <span className="text-[10px] text-slate-400 block">METABOLIZED</span>
            <span className="font-bold text-slate-200 text-xs">{snapshot.foodConsumed.toFixed(1)} units</span>
            <span className="text-[9px] text-slate-500 block">Converted to energy</span>
          </div>
        </div>
      </div>

      {/* Social Trophallaxis Feed */}
      <div className="flex flex-col gap-2 p-3 bg-slate-950/70 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300 text-xs flex items-center gap-1.5">
              <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
              Social Trophallaxis Exchanges ({trophallaxisRecords.length})
            </span>
            <BiologyInfoPopup topicId="trophallaxis_food_sharing" />
          </div>
          <span className="text-[10px] text-slate-500">Mouth-to-mouth nutritional sharing</span>
        </div>

        {trophallaxisRecords.length === 0 ? (
          <div className="text-slate-500 py-6 text-center text-[10px]">
            No trophallactic transfers recorded yet.
            <br />
            When a well-fed forager contacts a hungry nestmate, food is directly exchanged.
          </div>
        ) : (
          <div className="flex flex-col gap-1 max-h-40 overflow-y-auto pr-1">
            {trophallaxisRecords.slice(0, 15).map((rec) => (
              <div
                key={rec.id}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-[10px]"
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-emerald-400">{rec.donorId}</span>
                  <span className="text-slate-500">→</span>
                  <span className="font-bold text-cyan-400">{rec.receiverId}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-300 font-bold">+{rec.amount.toFixed(2)} units</span>
                  <span className="text-slate-500 text-[9px]">@{rec.timestamp.toFixed(1)}s</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
