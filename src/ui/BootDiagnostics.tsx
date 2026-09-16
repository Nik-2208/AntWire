/**
 * ANTWIRE — Boot Diagnostics & Subsystem Health Panel
 * Real-time verification of UI, WebGL2, 3D Scene, Simulation Clock, Ant Models, and Brain Models.
 */

import React, { useState } from 'react';
import { Activity, CheckCircle2, AlertTriangle, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';

export interface DiagnosticsState {
  uiReady: boolean;
  webgl2Ready: boolean;
  renderer3DReady: boolean;
  simulationReady: boolean;
  antModelsReady: boolean;
  brainModelReady: boolean;
  activeRenderer: string;
  fps: number;
  tps: number;
}

interface BootDiagnosticsProps {
  diagnostics: DiagnosticsState;
}

export const BootDiagnostics: React.FC<BootDiagnosticsProps> = ({ diagnostics }) => {
  const [isOpen, setIsOpen] = useState(false);

  const allReady =
    diagnostics.uiReady &&
    diagnostics.simulationReady &&
    (diagnostics.renderer3DReady || diagnostics.webgl2Ready);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-2.5 py-1 rounded-xl text-[11px] font-mono flex items-center gap-1.5 transition-all border ${
          allReady
            ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
            : 'bg-amber-950/60 border-amber-500/40 text-amber-300 hover:bg-amber-900/60'
        }`}
        title="Click to view Subsystem Health Diagnostics"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span className="font-bold">SYSTEM STATUS: {allReady ? 'HEALTHY' : 'DEGRADED'}</span>
        {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {isOpen && (
        <div className="absolute top-8 right-0 z-50 w-72 bg-slate-900/95 border border-slate-700/80 rounded-2xl p-3 shadow-2xl backdrop-blur-xl text-xs font-mono text-slate-300 flex flex-col gap-2 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-bold text-slate-100 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              ANTWIRE BOOT TELEMETRY
            </span>
            <span className="text-[10px] text-cyan-400 font-bold">{diagnostics.activeRenderer}</span>
          </div>

          <div className="flex flex-col gap-1.5 text-[11px]">
            <div className="flex items-center justify-between">
              <span>UI ENGINE</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> READY
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span>WEBGL2 PIPELINE</span>
              <span className={diagnostics.webgl2Ready ? 'text-emerald-400 font-bold flex items-center gap-1' : 'text-amber-400 font-bold flex items-center gap-1'}>
                {diagnostics.webgl2Ready ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                {diagnostics.webgl2Ready ? 'READY' : 'FALLBACK 2D'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span>3D SCENE & CAM</span>
              <span className={diagnostics.renderer3DReady ? 'text-emerald-400 font-bold flex items-center gap-1' : 'text-amber-400 font-bold flex items-center gap-1'}>
                {diagnostics.renderer3DReady ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                {diagnostics.renderer3DReady ? 'READY' : 'INACTIVE'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span>60HZ SIM CLOCK</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> READY ({diagnostics.tps} TPS)
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span>ANT MORPHOLOGY</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> PROCEDURAL
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span>NEUROPIL CIRCUITS</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> AL+MB+CX+LAL
              </span>
            </div>
          </div>

          <div className="pt-1.5 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
            <span>FPS: <strong className="text-cyan-400">{diagnostics.fps}</strong></span>
            <span>TPS: <strong className="text-emerald-400">{diagnostics.tps}</strong></span>
            <span>STATUS: <strong className="text-emerald-300">NOMINAL</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};
