/**
 * ANTWIRE — Simulation Settings & Performance Configuration
 * Authoritative, state-synchronized engine configuration covering:
 * - Graphics & 3D WebGL Pipeline
 * - 3D Neural Brain & LOD Visual Settings
 * - Thermodynamic Environment & Chemistry
 * - Biological Physiology & Metabolic Parameters
 * - Pheromone Field Dynamics
 */

import React, { useState, useEffect } from 'react';
import { RenderQuality } from '../visualization/scene_manager';
import {
  Settings,
  Monitor,
  Zap,
  RotateCcw,
  AlertTriangle,
  Sliders,
  Sun,
  Flame,
  Activity,
  Layers,
  CheckCircle2,
  Save,
} from 'lucide-react';
import { SimulationWorld } from '../simulation/world';

interface SettingsViewProps {
  world: SimulationWorld;
  renderMode: '3D' | '2D' | 'OFF';
  quality: RenderQuality;
  onSetRenderMode: (mode: '3D' | '2D' | 'OFF') => void;
  onSetQuality: (q: RenderQuality) => void;
  onResetSimulation: () => void;
}

export type SettingsCategory = 'GRAPHICS' | 'ENVIRONMENT' | 'PHEROMONES' | 'BIOLOGY' | 'RESET' | 'ABOUT';

export const SettingsView: React.FC<SettingsViewProps> = ({
  world,
  renderMode,
  quality,
  onSetRenderMode,
  onSetQuality,
  onResetSimulation,
}) => {
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('GRAPHICS');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [, setTick] = useState(0);

  const config = world.simConfig;

  const handleParamChange = (key: string, value: number) => {
    const res = config.executeCommand({ type: 'SET_PARAMETER', key, value }, world.eventBus);
    if (res.success) {
      setFeedbackMessage(res.message);
      setTick((t) => t + 1);
      setTimeout(() => setFeedbackMessage(null), 4000);
    }
  };

  const handleResetScope = (scope: any) => {
    const res = config.executeCommand({ type: 'RESET_SCOPE', scope }, world.eventBus);
    setFeedbackMessage(res.message);
    setTick((t) => t + 1);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const renderSlider = (key: string) => {
    const meta = config.get(key);
    if (!meta) return null;

    return (
      <div key={meta.key} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
        <div className="flex justify-between items-center text-[11px] text-slate-300">
          <span className="font-semibold">{meta.name}:</span>
          <span className="font-mono text-cyan-300 font-bold">
            {meta.value.toFixed(meta.step < 0.01 ? 4 : 2)} {meta.unit}
          </span>
        </div>
        <input
          type="range"
          min={meta.min}
          max={meta.max}
          step={meta.step}
          value={meta.value}
          onChange={(e) => handleParamChange(meta.key, parseFloat(e.target.value))}
          className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
        />
        <div className="flex justify-between text-[8.5px] text-slate-500 font-mono">
          <span>{meta.min}</span>
          <span className="text-slate-400">{meta.description}</span>
          <span>{meta.max}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-slate-900/90 border border-slate-800 rounded-2xl text-slate-200 text-xs shadow-xl backdrop-blur-md overflow-y-auto max-h-[85vh]">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          <div>
            <h2 className="text-sm font-bold font-heading text-slate-100">SIMULATION & GRAPHICS SETTINGS</h2>
            <p className="text-[10px] text-slate-400">Authoritative State Configuration & Low-End GPU Optimization</p>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800 text-[10.5px]">
        <button
          onClick={() => setActiveCategory('GRAPHICS')}
          className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
            activeCategory === 'GRAPHICS' ? 'bg-cyan-600/40 text-cyan-300 border border-cyan-500' : 'text-slate-400 hover:text-white'
          }`}
        >
          Graphics & 3D
        </button>
        <button
          onClick={() => setActiveCategory('ENVIRONMENT')}
          className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
            activeCategory === 'ENVIRONMENT' ? 'bg-amber-600/40 text-amber-300 border border-amber-500' : 'text-slate-400 hover:text-white'
          }`}
        >
          Environment
        </button>
        <button
          onClick={() => setActiveCategory('PHEROMONES')}
          className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
            activeCategory === 'PHEROMONES' ? 'bg-emerald-600/40 text-emerald-300 border border-emerald-500' : 'text-slate-400 hover:text-white'
          }`}
        >
          Pheromones
        </button>
        <button
          onClick={() => setActiveCategory('BIOLOGY')}
          className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
            activeCategory === 'BIOLOGY' ? 'bg-purple-600/40 text-purple-300 border border-purple-500' : 'text-slate-400 hover:text-white'
          }`}
        >
          Ant Biology
        </button>
        <button
          onClick={() => setActiveCategory('RESET')}
          className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
            activeCategory === 'RESET' ? 'bg-rose-600/40 text-rose-300 border border-rose-500' : 'text-slate-400 hover:text-white'
          }`}
        >
          Reset State
        </button>
        <button
          onClick={() => setActiveCategory('ABOUT')}
          className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
            activeCategory === 'ABOUT' ? 'bg-emerald-600/40 text-emerald-300 border border-emerald-500' : 'text-slate-400 hover:text-white'
          }`}
        >
          About & Author
        </button>
      </div>

      {/* Live Feedback Notification Banner */}
      {feedbackMessage && (
        <div className="flex items-center gap-2 p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/60 text-cyan-300 text-xs shadow-md">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* 1. GRAPHICS & 3D PIPELINE SETTINGS */}
      {activeCategory === 'GRAPHICS' && (
        <div className="flex flex-col gap-3">
          {/* Render Mode Selection */}
          <div className="flex flex-col gap-2 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <span className="font-bold text-slate-300 text-xs flex items-center gap-1.5">
              <Monitor className="w-4 h-4 text-cyan-400" /> Active Rendering Mode
            </span>

            <div className="grid grid-cols-3 gap-1.5 text-center font-bold text-[11px]">
              <button
                onClick={() => onSetRenderMode('3D')}
                className={`py-2 rounded-lg transition-all cursor-pointer ${
                  renderMode === '3D'
                    ? 'bg-cyan-600/40 text-cyan-300 border border-cyan-500 shadow-md'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                3D WebGL2
              </button>
              <button
                onClick={() => onSetRenderMode('2D')}
                className={`py-2 rounded-lg transition-all cursor-pointer ${
                  renderMode === '2D'
                    ? 'bg-amber-600/40 text-amber-300 border border-amber-500 shadow-md'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                2D Canvas
              </button>
              <button
                onClick={() => onSetRenderMode('OFF')}
                className={`py-2 rounded-lg transition-all cursor-pointer ${
                  renderMode === 'OFF'
                    ? 'bg-rose-600/40 text-rose-300 border border-rose-500 shadow-md'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                Render Off (Max TPS)
              </button>
            </div>
          </div>

          {/* 3D Graphics Quality Preset */}
          {renderMode === '3D' && (
            <div className="flex flex-col gap-2 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <span className="font-bold text-slate-300 text-xs flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" /> 3D Visual Detail Quality
              </span>

              <div className="grid grid-cols-3 gap-1.5 text-center font-bold text-[11px]">
                {(['LOW', 'MEDIUM', 'HIGH'] as RenderQuality[]).map((q) => (
                  <button
                    key={q}
                    onClick={() => onSetQuality(q)}
                    className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                      quality === q
                        ? 'bg-amber-600/40 text-amber-300 border border-amber-500 shadow-md'
                        : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                    }`}
                  >
                    {q} Detail
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400">
                {quality === 'LOW' && 'Optimized for Intel i5 10th Gen / GT 610 (1.0 pixel ratio, unlit shaders, connection thinning).'}
                {quality === 'MEDIUM' && 'Balanced rendering with directional keylights and ant limb articulation.'}
                {quality === 'HIGH' && 'High fidelity with full lighting, dynamic shadows, and 60fps signal pulses.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 2. ENVIRONMENT SETTINGS */}
      {activeCategory === 'ENVIRONMENT' && (
        <div className="flex flex-col gap-2.5">
          <div className="flex justify-between items-center text-xs font-bold text-amber-300 border-b border-slate-800 pb-1">
            <span>Thermodynamics & Diurnal Rhythms</span>
            <button
              onClick={() => handleResetScope('ENVIRONMENT')}
              className="text-[9px] text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              Reset Environment
            </button>
          </div>
          {renderSlider('environment.temperatureCelsius')}
          {renderSlider('environment.dayLengthSeconds')}
          {renderSlider('environment.foodSpawnInterval')}
          {renderSlider('environment.foodClusterAmount')}
        </div>
      )}

      {/* 3. PHEROMONE SETTINGS */}
      {activeCategory === 'PHEROMONES' && (
        <div className="flex flex-col gap-2.5">
          <div className="flex justify-between items-center text-xs font-bold text-emerald-300 border-b border-slate-800 pb-1">
            <span>Chemical Trail Diffusion & Evaporation</span>
            <button
              onClick={() => handleResetScope('PHEROMONE')}
              className="text-[9px] text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              Reset Pheromones
            </button>
          </div>
          {renderSlider('pheromones.foodTrailDecay')}
          {renderSlider('pheromones.homeTrailDecay')}
          {renderSlider('pheromones.alarmTrailDecay')}
          {renderSlider('pheromones.diffusionRate')}
          {renderSlider('pheromones.depositionAmount')}
        </div>
      )}

      {/* 4. ANT BIOLOGY SETTINGS */}
      {activeCategory === 'BIOLOGY' && (
        <div className="flex flex-col gap-2.5">
          <div className="flex justify-between items-center text-xs font-bold text-purple-300 border-b border-slate-800 pb-1">
            <span>Physiology & Metabolic Scaling</span>
            <button
              onClick={() => handleResetScope('ANT')}
              className="text-[9px] text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              Reset Ant Biology
            </button>
          </div>
          {renderSlider('ant.normalMovementSpeed')}
          {renderSlider('ant.metabolicBaseRate')}
          {renderSlider('ant.kineticCostRate')}
          {renderSlider('ant.starvationStressRate')}
          {renderSlider('ant.feedingEfficiency')}
          {renderSlider('ant.fearThreshold')}
        </div>
      )}

      {/* 5. DANGER / RESET SETTINGS */}
      {activeCategory === 'RESET' && (
        <div className="flex flex-col gap-2.5 bg-rose-950/20 p-3.5 rounded-xl border border-rose-500/30">
          <span className="font-bold text-rose-300 text-xs flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-400" /> Destructive Simulation Reset
          </span>

          <p className="text-[11px] text-slate-300">
            Resets all entities, colonies, food crystals, pheromones, and deterministic simulation time back to tick 0 with seed {world.config.seed}.
          </p>

          {showResetConfirm ? (
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  onResetSimulation();
                  setShowResetConfirm(false);
                  setFeedbackMessage('Simulation world reset to initial seed state.');
                }}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer shadow-lg"
              >
                Confirm Reset World
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-rose-900/40 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset World & Simulation State</span>
            </button>
          )}
        </div>
      )}

      {/* 6. ABOUT & AUTHOR ATTRIBUTION */}
      {activeCategory === 'ABOUT' && (
        <div className="flex flex-col gap-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-cyan-400 text-sm">ANTWIRE — System Attribution</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-700/50 text-emerald-300">
              © 2026 Nikhilesh H. Chavda
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-2">
            <div>
              <span className="text-slate-400 text-[10px] block">CREATED & DEVELOPED BY:</span>
              <span className="text-sm font-bold text-slate-100">Nikhilesh H. Chavda</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1 font-sans text-xs">
              <a
                href="https://nik-portfolio-lime.vercel.app/"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-cyan-950/80 border border-cyan-700/50 text-cyan-300 hover:bg-cyan-900/80 font-semibold transition-all"
              >
                🌐 Portfolio Website
              </a>
              <a
                href="https://github.com/Nik-2208"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 font-semibold transition-all"
              >
                💻 GitHub (@Nik-2208)
              </a>
              <a
                href="https://www.linkedin.com/in/nikhilesh-chavda-2b779533a/"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 hover:bg-indigo-900/80 font-semibold transition-all"
              >
                🔗 LinkedIn Profile
              </a>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-300 leading-relaxed font-sans">
            <strong className="text-amber-400 block mb-1">Scientific Positioning & Ethics Statement:</strong>
            ANTWIRE is an experimental biologically informed computational platform inspired by ant nervous systems and collective colony behavior. It does not fabricate biological connectomes or claim equivalence to measured living organisms where data has not been experimentally determined.
          </div>
        </div>
      )}
    </div>
  );
};
