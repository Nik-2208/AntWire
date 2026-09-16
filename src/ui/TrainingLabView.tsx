/**
 * ANT BRAIN — Training Lab & "Teach an Ant" Sandbox
 * Allows researchers to create behavioral tasks (Foraging, Obstacle Maze, Trail Following, Predator Evasion),
 * shape decomposed reward functions, train neural/RL policies, save persistent checkpoints,
 * load checkpoints to continue training without reset, and deploy weights to live simulation ants.
 */

import React, { useState, useEffect, useRef } from 'react';
import { SimulationWorld } from '../simulation/world';
import { ScientificBadge } from './ScientificBadge';
import { PolicyTrainer } from '../learning/policy_trainer';
import { ModelCheckpoint } from '../learning/model_checkpoint';
import { ModelLibraryModal } from './ModelLibraryModal';
import { ModelPackageGenerator } from '../learning/model_package_generator';
import {
  GraduationCap,
  Play,
  Pause,
  Save,
  Database,
  Sliders,
  TrendingUp,
  Award,
  CheckCircle,
  Share2,
  Cpu,
  Download,
  Package,
  Layers,
  Sparkles,
} from 'lucide-react';

interface TrainingLabViewProps {
  world: SimulationWorld;
}

export const TrainingLabView: React.FC<TrainingLabViewProps> = ({ world }) => {
  const trainerRef = useRef<PolicyTrainer>(new PolicyTrainer());
  const trainer = trainerRef.current;

  const [selectedTask, setSelectedTask] = useState<'FORAGE' | 'MAZE' | 'TRAIL_FOLLOW' | 'EVADE'>('FORAGE');
  const [controllerType, setControllerType] = useState<'NEURAL_MLP' | 'RL' | 'SNN' | 'RULE_BASED'>('NEURAL_MLP');
  const [isTraining, setIsTraining] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [activeCheckpointName, setActiveCheckpointName] = useState<string>('Scratch Policy (v1.0.0)');
  const [deployedStatus, setDeployedStatus] = useState<string | null>(null);

  // Live Progress Metrics
  const [step, setStep] = useState(0);
  const [episode, setEpisode] = useState(0);
  const [currentReward, setCurrentReward] = useState(0);
  const [meanReward, setMeanReward] = useState(0);
  const [bestReward, setBestReward] = useState(0);
  const [successRate, setSuccessRate] = useState(0);
  const [loss, setLoss] = useState(0);

  // Reward Shaping Parameters
  const [foodReward, setFoodReward] = useState(10.0);
  const [returnHomeReward, setReturnHomeReward] = useState(15.0);
  const [energyPenalty, setEnergyPenalty] = useState(0.1);
  const [deathPenalty, setDeathPenalty] = useState(20.0);

  // Update trainer config when task changes
  const handleSelectTask = (task: 'FORAGE' | 'MAZE' | 'TRAIL_FOLLOW' | 'EVADE') => {
    setSelectedTask(task);
    trainer.config.task = task;
  };

  // Sync reward shaping
  useEffect(() => {
    trainer.config.rewardShaping = {
      foodReward,
      nestDeliveryReward: returnHomeReward,
      energyPenalty,
      deathPenalty,
      distancePenalty: 0.05,
    };
  }, [foodReward, returnHomeReward, energyPenalty, deathPenalty]);

  // Training execution loop
  useEffect(() => {
    let interval: any = null;
    if (isTraining) {
      interval = setInterval(() => {
        const p = trainer.trainStep();
        setStep(p.step);
        setEpisode(p.episode);
        setCurrentReward(parseFloat(p.currentReward.toFixed(2)));
        setMeanReward(p.meanReward);
        setBestReward(p.bestReward);
        setSuccessRate(p.successRate);
        setLoss(p.loss);
      }, 50); // 20 steps per second
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTraining]);

  const handleToggleTraining = () => {
    setIsTraining(!isTraining);
  };

  const handleSaveCheckpoint = async () => {
    const cp = await trainer.saveCurrentCheckpoint(`Checkpoint (Step ${step})`);
    setActiveCheckpointName(`${cp.modelName} (${cp.version})`);
    setDeployedStatus(`Checkpoint saved to IndexedDB: ${cp.version}`);
  };

  const handleLoadCheckpoint = (cp: ModelCheckpoint) => {
    trainer.resumeFromCheckpoint(cp);
    setActiveCheckpointName(`${cp.modelName} (${cp.version})`);
    setSelectedTask(cp.task as any);
    setStep(cp.trainingStep);
    setEpisode(cp.episodeCount);
    setMeanReward(cp.metrics.meanReward);
    setBestReward(cp.metrics.bestReward);
    setSuccessRate(cp.metrics.successRate);
    setDeployedStatus(`Loaded ${cp.modelName} — ready to continue training`);
  };

  const handleDeployToLiveColony = () => {
    const trainedWeights = trainer.controller.getWeights();
    let count = 0;
    for (const colony of world.colonies) {
      for (const ant of colony.ants) {
        if (ant.controller.type === 'NEURAL') {
          (ant.controller as any).setWeights(trainedWeights);
          count++;
        }
      }
    }
    setDeployedStatus(`Deployed trained policy to ${count} live simulation ants!`);
  };

  const [isGeneratingPackage, setIsGeneratingPackage] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<'COMPACT' | 'STANDARD' | 'HIGH_DETAIL'>('STANDARD');

  const handleDownloadCompleteAntBrain = async () => {
    setIsGeneratingPackage(true);
    setDeployedStatus('Generating complete self-contained AntWire computational model package...');
    try {
      const currentCP = await trainer.saveCurrentCheckpoint(`Trained_AntWire_Brain_Step_${step}`);
      const zipBlob = await ModelPackageGenerator.generateCompleteZip(currentCP, {
        profile: selectedProfile,
        includePythonRuntimes: true,
        includeCollaborativeColony: true,
      });

      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      a.download = `ant_brain_model_v1_${dateStr}_${selectedProfile.toLowerCase()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDeployedStatus(`Downloaded complete executable AntWire brain package (${selectedProfile} profile)!`);
    } catch (err: any) {
      setDeployedStatus(`Failed to generate package: ${err.message}`);
    } finally {
      setIsGeneratingPackage(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-slate-900/90 border border-slate-800 rounded-2xl text-slate-200 text-xs shadow-xl backdrop-blur-md overflow-y-auto max-h-[85vh] font-mono">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-cyan-400" />
          <div>
            <h2 className="text-sm font-bold font-sans text-slate-100">TEACH AN ANT — TRAINING ARENA</h2>
            <p className="text-[10px] text-slate-400">
              Reinforcement Learning & Policy Optimization with Persistent Checkpoints
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLibraryOpen(true)}
            className="py-1 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Model Library</span>
          </button>
          <ScientificBadge category="COMPUTATIONAL_ABSTRACTION" />
        </div>
      </div>

      {/* Active Model & Status Banner */}
      <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-emerald-400" />
          <div>
            <span className="text-slate-400 text-[10px] block">ACTIVE TRAINING MODEL:</span>
            <span className="font-bold text-slate-200 text-xs">{activeCheckpointName}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              const cp = await trainer.saveCurrentCheckpoint(`Checkpoint (Step ${step})`);
              setActiveCheckpointName(`${cp.modelName} (${cp.version})`);
              setDeployedStatus(`Checkpoint saved to IndexedDB: ${cp.version}`);
            }}
            className="py-1 px-2.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/50 flex items-center gap-1.5 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Checkpoint</span>
          </button>
          <button
            onClick={() => {
              const trainedWeights = (trainer as any).controller?.getWeights?.() || [];
              let count = 0;
              for (const colony of world.colonies) {
                for (const ant of colony.ants) {
                  if (ant.controller.type === 'NEURAL') {
                    (ant.controller as any).setWeights(trainedWeights);
                    count++;
                  }
                }
              }
              setDeployedStatus(`Deployed trained policy to ${count} live simulation ants!`);
            }}
            className="py-1 px-2.5 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/50 flex items-center gap-1.5 transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Deploy to Colony</span>
          </button>
        </div>
      </div>

      {/* Primary Action Banner: DOWNLOAD COMPLETE ANT BRAIN */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/80 via-slate-900 to-indigo-950/80 border border-cyan-500/40 flex flex-col gap-2.5 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-cyan-400 animate-pulse" />
            <div>
              <span className="font-bold text-slate-100 text-xs flex items-center gap-1.5">
                DOWNLOAD COMPLETE EXECUTABLE ANTWIRE MODEL PACKAGE (.ZIP)
              </span>
              <span className="text-[10px] text-cyan-300">
                Self-contained, offline-executable computational organism with Python engines, connectome, & multi-agent colony interfaces.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-950/80 px-2 py-1 rounded-lg border border-slate-800 text-[10px]">
            <span className="text-slate-400">Profile:</span>
            {(['COMPACT', 'STANDARD', 'HIGH_DETAIL'] as const).map((prof) => (
              <button
                key={prof}
                onClick={() => setSelectedProfile(prof)}
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition-all ${
                  selectedProfile === prof
                    ? 'bg-cyan-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {prof}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleDownloadCompleteAntBrain}
          disabled={isGeneratingPackage}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 via-emerald-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/30 transition-all border border-cyan-400/40 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>
            {isGeneratingPackage
              ? 'Generating Complete Executable Model Package...'
              : `DOWNLOAD COMPLETE ANTWIRE MODEL (${selectedProfile})`}
          </span>
        </button>
      </div>

      {deployedStatus && (
        <div className="bg-cyan-950/40 border border-cyan-800/40 px-3 py-1 rounded-lg text-cyan-300 text-[10px] flex items-center justify-between">
          <span>{deployedStatus}</span>
          <button onClick={() => setDeployedStatus(null)} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Task Selector */}
      <div className="flex flex-col gap-1.5 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
        <span className="font-bold text-slate-300 text-xs">Select Behavioral Experiment Task:</span>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => handleSelectTask('FORAGE')}
            className={`py-2 px-2.5 rounded-lg font-bold text-left transition-all ${
              selectedTask === 'FORAGE'
                ? 'bg-cyan-600/40 text-cyan-300 border border-cyan-500 shadow-md'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <div>1. Resource Foraging</div>
            <div className="text-[9px] text-slate-400 font-normal font-sans">Find, harvest, and return food to nest</div>
          </button>
          <button
            onClick={() => handleSelectTask('MAZE')}
            className={`py-2 px-2.5 rounded-lg font-bold text-left transition-all ${
              selectedTask === 'MAZE'
                ? 'bg-cyan-600/40 text-cyan-300 border border-cyan-500 shadow-md'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <div>2. Obstacle Maze</div>
            <div className="text-[9px] text-slate-400 font-normal font-sans">Navigate barriers using sensory feedback</div>
          </button>
          <button
            onClick={() => handleSelectTask('TRAIL_FOLLOW')}
            className={`py-2 px-2.5 rounded-lg font-bold text-left transition-all ${
              selectedTask === 'TRAIL_FOLLOW'
                ? 'bg-cyan-600/40 text-cyan-300 border border-cyan-500 shadow-md'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <div>3. Pheromone Trail Follow</div>
            <div className="text-[9px] text-slate-400 font-normal font-sans">Chemotaxis gradient alignment</div>
          </button>
          <button
            onClick={() => handleSelectTask('EVADE')}
            className={`py-2 px-2.5 rounded-lg font-bold text-left transition-all ${
              selectedTask === 'EVADE'
                ? 'bg-cyan-600/40 text-cyan-300 border border-cyan-500 shadow-md'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <div>4. Predator Evasion</div>
            <div className="text-[9px] text-slate-400 font-normal font-sans">Escape threat to safe nest radius</div>
          </button>
        </div>
      </div>

      {/* Reward Decomposition Sliders */}
      <div className="flex flex-col gap-2 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
        <span className="font-bold text-cyan-300 text-xs flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-cyan-400" /> Reward Decomposition Function
        </span>

        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div>
            <div className="flex justify-between text-slate-400 mb-0.5">
              <span>+ Food Harvested:</span>
              <strong className="text-emerald-400">+{foodReward.toFixed(1)}</strong>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              value={foodReward}
              onChange={(e) => setFoodReward(parseFloat(e.target.value))}
              className="accent-emerald-500 w-full h-1 bg-slate-800 rounded cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-400 mb-0.5">
              <span>+ Returned to Nest:</span>
              <strong className="text-cyan-400">+{returnHomeReward.toFixed(1)}</strong>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              step="1"
              value={returnHomeReward}
              onChange={(e) => setReturnHomeReward(parseFloat(e.target.value))}
              className="accent-cyan-500 w-full h-1 bg-slate-800 rounded cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-400 mb-0.5">
              <span>- Energy Cost (Step):</span>
              <strong className="text-amber-400">-{energyPenalty.toFixed(2)}</strong>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={energyPenalty}
              onChange={(e) => setEnergyPenalty(parseFloat(e.target.value))}
              className="accent-amber-500 w-full h-1 bg-slate-800 rounded cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-400 mb-0.5">
              <span>- Predator Death:</span>
              <strong className="text-rose-400">-{deathPenalty.toFixed(0)}</strong>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={deathPenalty}
              onChange={(e) => setDeathPenalty(parseFloat(e.target.value))}
              className="accent-rose-500 w-full h-1 bg-slate-800 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Live Training Telemetry */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 block">Training Step</span>
          <span className="font-bold text-cyan-400 text-sm">{step}</span>
        </div>
        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 block">Episodes Run</span>
          <span className="font-bold text-slate-300 text-sm">{episode}</span>
        </div>
        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 block">Mean Return</span>
          <span className="font-bold text-emerald-400 text-sm">+{meanReward}</span>
        </div>
        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 block">Success Rate</span>
          <span className="font-bold text-amber-400 text-sm">{successRate}%</span>
        </div>
      </div>

      {/* Action Buttons */}
      <button
        onClick={handleToggleTraining}
        className={`w-full py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${
          isTraining
            ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/40'
            : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-900/40'
        }`}
      >
        {isTraining ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        <span>{isTraining ? 'Pause Training Loop' : 'Start Continuous Training Loop'}</span>
      </button>

      {/* Model Library Modal */}
      <ModelLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onLoadModel={handleLoadCheckpoint}
      />
    </div>
  );
};
