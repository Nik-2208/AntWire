/**
 * ANTWIRE — Digital Decision Trace & Thought Stream Terminal
 * Real-time computational decision logs reflecting actual simulation variables.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Filter, Trash2, ArrowDown } from 'lucide-react';
import { DecisionRecord } from '../simulation/types';
import { SimulationEvent } from '../simulation/world';

interface DecisionTerminalProps {
  recentDecisions: DecisionRecord[];
  events: SimulationEvent[];
  selectedAntId: string | null;
}

export const DecisionTerminal: React.FC<DecisionTerminalProps> = ({
  recentDecisions,
  events,
  selectedAntId,
}) => {
  const [filterMode, setFilterMode] = useState<'ALL' | 'SELECTED_ANT' | 'EVENTS'>('ALL');
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [recentDecisions, events, autoScroll]);

  const filteredDecisions = recentDecisions.filter((d) => {
    if (filterMode === 'SELECTED_ANT') return selectedAntId ? d.antId === selectedAntId : true;
    return true;
  });

  return (
    <div className="glass-panel rounded-xl h-44 flex flex-col border border-cyan-950/70 shadow-2xl select-none">
      {/* Terminal Bar */}
      <div className="h-8 px-3 bg-slate-950/90 border-b border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-mono font-bold text-slate-200 text-[11px] tracking-wide">
            DIGITAL DECISION TRACE <span className="text-cyan-500 font-normal">/ ANT THOUGHT STREAM</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Filters */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] font-mono gap-1 text-slate-400">
            <Filter className="w-2.5 h-2.5" />
            <button
              onClick={() => setFilterMode('ALL')}
              className={`px-1 rounded ${filterMode === 'ALL' ? 'bg-cyan-950 text-cyan-300 font-bold' : 'hover:text-slate-200'}`}
            >
              ALL
            </button>
            <button
              onClick={() => setFilterMode('SELECTED_ANT')}
              className={`px-1 rounded ${filterMode === 'SELECTED_ANT' ? 'bg-cyan-950 text-cyan-300 font-bold' : 'hover:text-slate-200'}`}
            >
              {selectedAntId || 'SELECTED'}
            </button>
            <button
              onClick={() => setFilterMode('EVENTS')}
              className={`px-1 rounded ${filterMode === 'EVENTS' ? 'bg-cyan-950 text-cyan-300 font-bold' : 'hover:text-slate-200'}`}
            >
              EVENTS
            </button>
          </div>

          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-1 rounded text-[10px] font-mono ${autoScroll ? 'text-cyan-400' : 'text-slate-600'}`}
            title="Auto-scroll"
          >
            <ArrowDown className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Terminal Log Stream */}
      <div
        ref={scrollRef}
        className="flex-1 p-2.5 overflow-y-auto font-mono text-[11px] space-y-1 bg-slate-950/80 text-slate-300 selection:bg-cyan-800"
      >
        {filterMode === 'EVENTS' ? (
          events.length === 0 ? (
            <div className="text-slate-600 italic">No colony events logged yet.</div>
          ) : (
            events.map((e) => (
              <div key={e.id} className="flex items-start gap-2 leading-tight">
                <span className="text-slate-500 shrink-0">[{e.timestamp.toFixed(2)}s]</span>
                <span
                  className={`px-1 rounded text-[9px] font-bold shrink-0 ${
                    e.type === 'FOOD_COLLECTED'
                      ? 'bg-emerald-950 text-emerald-400'
                      : e.type === 'PREDATOR_ATTACK'
                      ? 'bg-rose-950 text-rose-400'
                      : 'bg-cyan-950 text-cyan-400'
                  }`}
                >
                  {e.type}
                </span>
                <span className="text-slate-200">{e.message}</span>
              </div>
            ))
          )
        ) : filteredDecisions.length === 0 ? (
          <div className="text-slate-600 italic">Listening for ant decision pulses...</div>
        ) : (
          filteredDecisions.slice(-25).map((d) => (
            <div key={d.id} className="flex items-start gap-2 leading-tight hover:bg-slate-900/60 px-1 rounded transition-colors">
              <span className="text-slate-500 shrink-0">[{d.timestamp.toFixed(2)}s]</span>
              <span className="text-cyan-400 font-bold shrink-0">{d.antId}</span>
              <span className="text-amber-300 shrink-0">DRIVE:{d.dominantDrive.toUpperCase()}={d.dominantDriveValue.toFixed(2)}</span>
              <span className="text-emerald-400 font-semibold shrink-0">ACTION:{d.selectedAction.type}</span>
              <span className="text-slate-400 truncate">({d.technicalExplanation})</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
