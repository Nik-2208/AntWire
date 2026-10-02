/**
 * ANTWRE — Laboratory Header & Main Navigation
 * Created & Developed by Nikhilesh H. Chavda
 *
 * Implements unified brand navigation, playback controls, entity creation, and system diagnostics.
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
  Share2,
} from 'lucide-react';
import { AntWireLogo } from './AntWireLogo';
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
  | 'COMMUNITY'
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
  diagnostics,
  onSelectTab,
  onTogglePause,
  onStepOnce,
  onSetTimeScale,
  onOpenAddEntity,
  onOpenManageEntities,
}) => {
  const navTabs: { id: MainNavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'WORLD', label: 'World 3D', icon: <Globe className="w-3.5 h-3.5 text-sky-400 shrink-0" /> },
    { id: 'ANT_LAB', label: 'Ant Lab', icon: <Bug className="w-3.5 h-3.5 text-orange-400 shrink-0" /> },
    { id: 'COLONY', label: 'Colony', icon: <Users className="w-3.5 h-3.5 text-violet-400 shrink-0" /> },
    { id: 'FUNGUS', label: 'Fungus Lab', icon: <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> },
    { id: 'CASTES', label: 'Castes & Roles', icon: <Dna className="w-3.5 h-3.5 text-amber-400 shrink-0" /> },
    { id: 'BRAIN_LAB', label: 'Brain Lab', icon: <Brain className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> },
    { id: 'FOOD_LEDGER', label: 'Food Ledger', icon: <Scale className="w-3.5 h-3.5 text-teal-400 shrink-0" /> },
    { id: 'TRAINING', label: 'Training', icon: <GraduationCap className="w-3.5 h-3.5 text-indigo-400 shrink-0" /> },
    { id: 'EXPERIMENTS', label: 'Experiments', icon: <FlaskConical className="w-3.5 h-3.5 text-fuchsia-400 shrink-0" /> },
    { id: 'COMMUNITY', label: 'Community', icon: <Share2 className="w-3.5 h-3.5 text-rose-400 shrink-0" /> },
    { id: 'DATA', label: 'Data Hub', icon: <Database className="w-3.5 h-3.5 text-blue-400 shrink-0" /> },
    { id: 'ABOUT', label: 'About', icon: <Sparkles className="w-3.5 h-3.5 text-yellow-400 shrink-0" /> },
    { id: 'SOURCES', label: 'Sources', icon: <BookOpen className="w-3.5 h-3.5 text-lime-400 shrink-0" /> },
    { id: 'SETTINGS', label: 'Settings', icon: <Settings className="w-3.5 h-3.5 text-slate-300 shrink-0" /> },
  ];

  return (
    <header className="min-h-[3.5rem] h-auto py-1.5 border-b border-gray-800 bg-[#0c1017]/95 backdrop-blur px-3 sm:px-4 flex flex-wrap lg:flex-nowrap items-center justify-between gap-3 z-30 select-none shadow-md shrink-0">
      {/* Official AntWire Brand Header */}
      <div className="flex items-center gap-2 shrink-0">
        <AntWireLogo
          size="sm"
          showText={true}
          showSubtitle={true}
          subtitleText="Neural Ant & Colony Observatory"
          onClick={() => onSelectTab('WORLD')}
        />
        <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-700/50 text-cyan-300 ml-1 hidden sm:inline">
          v1.0.0
        </span>
      </div>

      {/* Main Navigation Tabs */}
      <nav className="order-3 lg:order-2 w-full lg:w-auto flex items-center overflow-x-auto no-scrollbar bg-[#111622] border border-gray-800 rounded-xl p-1 gap-1 py-1 max-w-full">
        {navTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-cyan-600/30 text-cyan-200 border border-cyan-500/60 shadow-sm font-bold'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right Controls: Add Entity, Playback & Diagnostics */}
      <div className="order-2 lg:order-3 flex items-center gap-2 shrink-0 ml-auto lg:ml-0">
        {/* ADD ENTITY BUTTON */}
        <button
          onClick={onOpenAddEntity}
          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow-md shadow-emerald-950/50 border border-emerald-400/40 transition-all hover:scale-105 cursor-pointer"
          title="Add specialized worker castes, males, queens, brood, or predators"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add</span>
        </button>

        {/* MANAGE ENTITIES BUTTON */}
        {onOpenManageEntities && (
          <button
            onClick={onOpenManageEntities}
            className="px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-rose-300 text-xs font-bold flex items-center gap-1 border border-rose-900/60 transition-all hover:scale-105 cursor-pointer"
            title="Safe entity removal by role, population reduction, or predator elimination"
          >
            <span className="hidden sm:inline">Manage</span>
          </button>
        )}

        {/* Playback Controls */}
        <div className="flex items-center bg-[#111622] border border-gray-800 rounded-lg p-0.5 gap-0.5">
          <button
            onClick={onTogglePause}
            className={`p-1.5 rounded text-xs font-medium transition-all cursor-pointer ${
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
            className={`p-1.5 rounded text-xs font-medium transition-all cursor-pointer ${
              isPaused
                ? 'bg-gray-800 text-cyan-300 hover:bg-cyan-950'
                : 'text-gray-600 cursor-not-allowed'
            }`}
            title="Step Forward (1 Frame)"
          >
            <StepForward className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-0.5 border-l border-gray-800 pl-1 ml-0.5 text-xs">
            {[1, 2, 5].map((spd) => (
              <button
                key={spd}
                onClick={() => onSetTimeScale(spd)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-all cursor-pointer ${
                  timeScale === spd && !isPaused
                    ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/60 font-bold'
                    : 'text-gray-400 hover:text-gray-200'
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
