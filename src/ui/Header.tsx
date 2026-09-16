/**
 * ANTWIRE — Laboratory Header & Main Navigation
 * Supports top-level tabs (World, Ant Lab, Colony, Brain Lab, Training, Evolution, Experiments, Data, Settings, About, Sources),
 * playback controls, presets, and boot diagnostics.
 */

import React from 'react';
import {
  Play,
  Pause,
  StepForward,
  RotateCcw,
  Sparkles,
  Globe,
  Bug,
  Users,
  Brain,
  GraduationCap,
  Dna,
  FlaskConical,
  Database,
  Settings,
  Plus,
  Scale,
  BookOpen,
} from 'lucide-react';
import { EXPERIMENT_PRESETS, ExperimentPreset } from '../experiments/presets';
import { CameraViewMode, RenderQuality } from '../visualization/scene_manager';
import { BootDiagnostics, DiagnosticsState } from './BootDiagnostics';

export type MainNavTab =
  | 'WORLD'
  | 'ANT_LAB'
  | 'COLONY'
  | 'FUNGUS'
  | 'CASTES'
  | 'BRAIN_LAB'
  | 'ECOLOGY'
  | 'FOOD_LEDGER'
  | 'MULTI_AGENT'
  | 'TRAINING'
  | 'EVOLUTION'
  | 'EXPERIMENTS'
  | 'DATA'
  | 'ABOUT'
  | 'SOURCES'
  | 'SETTINGS';

interface HeaderProps {
  activeTab: MainNavTab;
  isPaused: boolean;
  timeScale: number;
  simTime: number;
  tickCount: number;
  cameraMode: CameraViewMode;
  renderMode: '3D' | '2D' | 'OFF';
  quality: RenderQuality;
  diagnostics: DiagnosticsState;
  showPheromones: boolean;
  showSensorRays: boolean;
  population: number;
  foodStored: number;
  temperature: number;
  onSelectTab: (tab: MainNavTab) => void;
  onTogglePause: () => void;
  onStepOnce: () => void;
  onSetTimeScale: (scale: number) => void;
  onSetCameraMode: (cam: CameraViewMode) => void;
  onSetRenderMode: (rm: '3D' | '2D' | 'OFF') => void;
  onSetQuality: (q: RenderQuality) => void;
  onTogglePheromones: () => void;
  onToggleSensorRays: () => void;
  onSelectPreset: (preset: ExperimentPreset) => void;
  onOpenAddEntity: () => void;
  onOpenManageEntities?: () => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  isPaused,
  timeScale,
  simTime,
  diagnostics,
  onSelectTab,
  onTogglePause,
  onStepOnce,
  onSetTimeScale,
  onSelectPreset,
  onOpenAddEntity,
  onOpenManageEntities,
  onReset,
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const navTabs: { id: MainNavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'WORLD', label: 'World 3D', icon: <Globe className="w-3.5 h-3.5" /> },
    { id: 'ANT_LAB', label: 'Ant Lab', icon: <Bug className="w-3.5 h-3.5" /> },
    { id: 'COLONY', label: 'Colony', icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'FUNGUS', label: 'Fungus Lab', icon: <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> },
    { id: 'CASTES', label: 'Castes & Roles', icon: <Dna className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'BRAIN_LAB', label: 'Brain Lab', icon: <Brain className="w-3.5 h-3.5" /> },
    { id: 'FOOD_LEDGER', label: 'Food Ledger', icon: <Scale className="w-3.5 h-3.5" /> },
    { id: 'TRAINING', label: 'Training', icon: <GraduationCap className="w-3.5 h-3.5" /> },
    { id: 'EXPERIMENTS', label: 'Experiments', icon: <FlaskConical className="w-3.5 h-3.5" /> },
    { id: 'DATA', label: 'Data Hub', icon: <Database className="w-3.5 h-3.5" /> },
    { id: 'ABOUT', label: 'About', icon: <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> },
    { id: 'SOURCES', label: 'Sources', icon: <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> },
    { id: 'SETTINGS', label: 'Settings', icon: <Settings className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="min-h-[3.5rem] h-auto py-1 sm:py-0 border-b border-slate-800 bg-slate-950/95 backdrop-blur px-2 sm:px-4 flex flex-wrap lg:flex-nowrap items-center justify-between gap-2 z-30 select-none shadow-md shrink-0">
      {/* Brand & Title */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-cyan-600 via-emerald-600 to-amber-500 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-950/80">
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
            <Bug className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h1 className="text-xs sm:text-sm font-extrabold tracking-wider text-slate-100 font-heading whitespace-nowrap">
              ANT<span className="text-emerald-400">WIRE</span>
            </h1>
            <span className="text-[8px] sm:text-[9px] uppercase font-mono px-1 py-0.2 rounded bg-cyan-950 border border-cyan-700/50 text-cyan-300">
              v1.0
            </span>
          </div>
          <p className="hidden sm:block text-[9px] sm:text-[10px] text-slate-400 font-medium">Biologically Inspired Computational Ant Laboratory</p>
        </div>
      </div>

      {/* Main Navigation Tabs - Responsive Scroll Container */}
      <nav className="order-3 lg:order-2 w-full lg:w-auto flex items-center overflow-x-auto no-scrollbar bg-slate-900/90 border border-slate-800 rounded-xl p-1 gap-1 py-1 max-w-full">
        {navTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold flex items-center gap-1 sm:gap-1.5 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-cyan-600/40 text-cyan-200 border border-cyan-500/60 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {tab.icon}
              <span className="inline">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right Controls: Presets, Playback, Add Entity & Diagnostics */}
      <div className="order-2 lg:order-3 flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto lg:ml-0">
        {/* ADD ENTITY BUTTON */}
        <button
          onClick={onOpenAddEntity}
          className="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] sm:text-xs font-bold flex items-center gap-1 shadow-md shadow-cyan-950/50 border border-cyan-400/40 transition-all hover:scale-105 cursor-pointer"
          title="Add specialized worker castes, males, queens, brood, or predators"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add</span>
        </button>

        {/* MANAGE ENTITIES / REMOVE BUTTON */}
        {onOpenManageEntities && (
          <button
            onClick={onOpenManageEntities}
            className="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-300 text-[11px] sm:text-xs font-bold flex items-center gap-1 border border-rose-900/60 transition-all hover:scale-105 cursor-pointer"
            title="Safe entity removal by role, population reduction, or predator elimination"
          >
            <span className="hidden sm:inline">Manage</span>
          </button>
        )}

        {/* Playback Controls */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 gap-0.5">
          <button
            onClick={onTogglePause}
            className={`p-1 sm:p-1.5 rounded text-xs font-medium transition-all cursor-pointer ${
              isPaused
                ? 'bg-emerald-600/40 text-emerald-300 border border-emerald-500/50'
                : 'bg-amber-600/40 text-amber-300 border border-amber-500/50'
            }`}
            title={isPaused ? 'Resume Simulation' : 'Pause Simulation'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onStepOnce}
            disabled={!isPaused}
            className={`p-1 sm:p-1.5 rounded text-xs font-medium transition-all cursor-pointer ${
              isPaused
                ? 'bg-slate-800 text-cyan-300 hover:bg-cyan-950'
                : 'text-slate-600 cursor-not-allowed'
            }`}
            title="Step Forward (1 Frame)"
          >
            <StepForward className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-0.5 border-l border-slate-800 pl-1 ml-0.5 text-xs">
            {[1, 2, 5].map((spd) => (
              <button
                key={spd}
                onClick={() => onSetTimeScale(spd)}
                className={`px-1 py-0.5 rounded text-[10px] font-mono transition-all cursor-pointer ${
                  timeScale === spd && !isPaused
                    ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/60 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd}×
              </button>
            ))}
          </div>
        </div>

        {/* Diagnostics Widget */}
        <BootDiagnostics diagnostics={diagnostics} />
      </div>
    </header>
  );
};
