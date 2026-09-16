/**
 * ANTWIRE — Comprehensive Brain Lab & Synthetic Neuron Sandbox
 * Integrates 3D Insect Brain Atlas, Neuropil Visualizer, LIF Digital Neuron Oscilloscope,
 * Synthetic Connectome Path Finder, and Live Causal Trace Engine.
 */

import React, { useState } from 'react';
import { Ant } from '../ants/ant';
import { AntBrainAtlas } from './AntBrainAtlas';
import { NeurobiologyLab } from './NeurobiologyLab';
import { DigitalNeuronLab } from './DigitalNeuronLab';
import { ScientificBadge } from './ScientificBadge';
import { BrainControlPanel, CausalTraceLog } from '../ants/brain/brain_control_panel';
import { Brain, Layers, Cpu, Zap, GitBranch, Search, Sparkles, Sliders, Activity, Play, RotateCcw } from 'lucide-react';

interface BrainLabViewProps {
  selectedAnt: Ant | null;
}

export const BrainLabView: React.FC<BrainLabViewProps> = ({ selectedAnt }) => {
  const [subTab, setSubTab] = useState<'3D_ATLAS' | 'NEUROPILS' | 'NEURON_LAB' | 'PATH_FINDER' | 'CONTROL_PANEL' | 'CAUSAL_TRACE'>('3D_ATLAS');
  const [sourceNode, setSourceNode] = useState('Antennal Sensilla (ORN_Food)');
  const [targetNode, setTargetNode] = useState('LAL Steering Bias (Motor_TurnRight)');

  // Brain Control Panel State
  const [controlPanel] = useState(() => new BrainControlPanel());
  const [params, setParams] = useState(() => controlPanel.getParameters());
  const [activeTraces, setActiveTraces] = useState<CausalTraceLog[]>(() => [
    controlPanel.recordCausalTrace(
      selectedAnt ? String(selectedAnt.id) : 'Ant-42',
      'Food Retrieval & Return',
      'Concentrated Sucrose Gradient at Antennae',
      'Alternating Tripod Forward Thrust toward Nest'
    ),
  ]);

  const handleParamChange = (key: keyof typeof params, value: number) => {
    controlPanel.updateParameter(key, value);
    setParams(controlPanel.getParameters());
  };

  const handleResetParams = () => {
    controlPanel.resetToBiologicalDefaults();
    setParams(controlPanel.getParameters());
  };

  const handleTriggerCausalTrace = (behavior: string, sensory: string, motor: string) => {
    const trace = controlPanel.recordCausalTrace(
      selectedAnt ? String(selectedAnt.id) : 'Ant-42',
      behavior,
      sensory,
      motor
    );
    setActiveTraces([...controlPanel.getRecentTraces()]);
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-slate-900/90 border border-slate-800 rounded-2xl text-slate-200 text-xs shadow-xl backdrop-blur-md overflow-y-auto max-h-[85vh]">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-cyan-400" />
          <div>
            <h2 className="text-sm font-bold font-heading text-slate-100">ANT COMPUTATIONAL BRAIN LAB</h2>
            <p className="text-[10px] text-slate-400">
              {selectedAnt ? `Active Digital Twin: Ant #${selectedAnt.id}` : 'Select an ant to link live telemetry'}
            </p>
          </div>
        </div>
        <ScientificBadge category="BIOLOGICAL_INSPIRATION" />
      </div>

      {/* Sub-Tab Switcher */}
      <div className="grid grid-cols-6 gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800 text-[10px] font-bold">
        <button
          onClick={() => setSubTab('3D_ATLAS')}
          className={`py-1.5 rounded-lg transition-all ${
            subTab === '3D_ATLAS'
              ? 'bg-cyan-600/40 text-cyan-300 border border-cyan-500/50 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          3D Atlas
        </button>
        <button
          onClick={() => setSubTab('NEUROPILS')}
          className={`py-1.5 rounded-lg transition-all ${
            subTab === 'NEUROPILS'
              ? 'bg-emerald-600/40 text-emerald-300 border border-emerald-500/50 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Neuropils
        </button>
        <button
          onClick={() => setSubTab('NEURON_LAB')}
          className={`py-1.5 rounded-lg transition-all ${
            subTab === 'NEURON_LAB'
              ? 'bg-rose-600/40 text-rose-300 border border-rose-500/50 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          LIF Lab
        </button>
        <button
          onClick={() => setSubTab('PATH_FINDER')}
          className={`py-1.5 rounded-lg transition-all ${
            subTab === 'PATH_FINDER'
              ? 'bg-purple-600/40 text-purple-300 border border-purple-500/50 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Path Finder
        </button>
        <button
          onClick={() => setSubTab('CONTROL_PANEL')}
          className={`py-1.5 rounded-lg transition-all ${
            subTab === 'CONTROL_PANEL'
              ? 'bg-amber-600/40 text-amber-300 border border-amber-500/50 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Control Panel
        </button>
        <button
          onClick={() => setSubTab('CAUSAL_TRACE')}
          className={`py-1.5 rounded-lg transition-all ${
            subTab === 'CAUSAL_TRACE'
              ? 'bg-indigo-600/40 text-indigo-300 border border-indigo-500/50 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Causal Trace
        </button>
      </div>

      {/* 1. 3D ATLAS */}
      {subTab === '3D_ATLAS' && <AntBrainAtlas selectedAnt={selectedAnt} />}

      {/* 2. NEUROPILS */}
      {subTab === 'NEUROPILS' && <NeurobiologyLab ant={selectedAnt} />}

      {/* 3. LIF NEURON LAB */}
      {subTab === 'NEURON_LAB' && <DigitalNeuronLab />}

      {/* 4. PATH FINDER & SYNTHETIC GRAPH */}
      {subTab === 'PATH_FINDER' && (
        <div className="flex flex-col gap-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="font-bold text-purple-300 text-xs flex items-center gap-1.5">
              <GitBranch className="w-4 h-4 text-purple-400" /> Neural Pathway Tracer
            </span>
            <span className="text-[10px] text-slate-400">FlyWire-Grade Tracing</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Source Sensory Node:</label>
              <select
                value={sourceNode}
                onChange={(e) => setSourceNode(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-[11px] text-slate-200 outline-none"
              >
                <option value="Antennal Sensilla (ORN_Food)">Antennal Sensilla (ORN_Food)</option>
                <option value="Antennal Sensilla (ORN_Trail)">Antennal Sensilla (ORN_Trail)</option>
                <option value="Dorsal Rim Area (Polarization)">Dorsal Rim Area (Polarization)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Target Motor Node:</label>
              <select
                value={targetNode}
                onChange={(e) => setTargetNode(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-[11px] text-slate-200 outline-none"
              >
                <option value="LAL Steering Bias (Motor_TurnRight)">LAL Steering Bias (Motor_TurnRight)</option>
                <option value="LAL Forward Thrust (Motor_Fast)">LAL Forward Thrust (Motor_Fast)</option>
                <option value="SEZ Mandible Actuation (Grip_Food)">SEZ Mandible Actuation (Grip_Food)</option>
              </select>
            </div>
          </div>

          {/* Computed Pathway */}
          <div className="flex flex-col gap-2 bg-slate-900 p-3 rounded-xl border border-purple-500/30 font-mono text-[11px]">
            <span className="text-slate-400 font-bold">SYNAPSE CIRCUIT PATHWAY:</span>
            <div className="flex flex-col gap-1 text-slate-200">
              <div className="p-1.5 rounded bg-slate-950 border border-slate-800 text-cyan-300">
                1. {sourceNode} (ACh Excitatory → Glomerulus T1)
              </div>
              <div className="text-center text-purple-400">↓ (Projection Neuron Axon Bundle)</div>
              <div className="p-1.5 rounded bg-slate-950 border border-slate-800 text-amber-300">
                2. Mushroom Body Calyx → Kenyon Cell Population (Sparse Coding)
              </div>
              <div className="text-center text-purple-400">↓ (Octopaminergic Appetitive Modulation)</div>
              <div className="p-1.5 rounded bg-slate-950 border border-slate-800 text-emerald-300">
                3. Central Complex Fan-Shaped Body (Path Integration Vector Addition)
              </div>
              <div className="text-center text-purple-400">↓ (Ventral Nerve Cord Descending Tract)</div>
              <div className="p-1.5 rounded bg-slate-950 border border-slate-800 text-rose-300">
                4. {targetNode}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. BRAIN CONTROL PANEL */}
      {subTab === 'CONTROL_PANEL' && (
        <div className="flex flex-col gap-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-amber-400" /> Neural Parameter Control & Neuromodulation
            </span>
            <button
              onClick={handleResetParams}
              className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]"
            >
              <RotateCcw className="w-3 h-3" /> Reset Defaults
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-[11px]">
            {/* Synaptic & Membrane */}
            <div className="flex flex-col gap-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="font-bold text-cyan-400">Synapse & Membrane Dynamics</span>
              <div>
                <div className="flex justify-between text-slate-400 mb-0.5">
                  <span>Synaptic Weight Scale:</span>
                  <span>{params.synapticWeightScale.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="3.0"
                  step="0.05"
                  value={params.synapticWeightScale}
                  onChange={(e) => handleParamChange('synapticWeightScale', parseFloat(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-0.5">
                  <span>Spike Threshold:</span>
                  <span>{params.spikeThresholdMv.toFixed(1)} mV</span>
                </div>
                <input
                  type="range"
                  min="-55"
                  max="-35"
                  step="0.5"
                  value={params.spikeThresholdMv}
                  onChange={(e) => handleParamChange('spikeThresholdMv', parseFloat(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-0.5">
                  <span>STDP Learning Rate:</span>
                  <span>{params.learningRateSTDP.toFixed(4)}</span>
                </div>
                <input
                  type="range"
                  min="0.0001"
                  max="0.02"
                  step="0.0005"
                  value={params.learningRateSTDP}
                  onChange={(e) => handleParamChange('learningRateSTDP', parseFloat(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>
            </div>

            {/* Neuromodulators */}
            <div className="flex flex-col gap-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="font-bold text-amber-400">Neuromodulatory Gains</span>
              <div>
                <div className="flex justify-between text-slate-400 mb-0.5">
                  <span>Octopamine (Reward/Arousal):</span>
                  <span>{params.octopamineArousalGain.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="4.0"
                  step="0.1"
                  value={params.octopamineArousalGain}
                  onChange={(e) => handleParamChange('octopamineArousalGain', parseFloat(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-0.5">
                  <span>Dopamine (Punishment/Motor):</span>
                  <span>{params.dopamineModulationGain.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="4.0"
                  step="0.1"
                  value={params.dopamineModulationGain}
                  onChange={(e) => handleParamChange('dopamineModulationGain', parseFloat(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-0.5">
                  <span>Serotonin (Pacing/Social):</span>
                  <span>{params.serotoninPacingGain.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="4.0"
                  step="0.1"
                  value={params.serotoninPacingGain}
                  onChange={(e) => handleParamChange('serotoninPacingGain', parseFloat(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. CAUSAL TRACE */}
      {subTab === 'CAUSAL_TRACE' && (
        <div className="flex flex-col gap-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="font-bold text-indigo-300 text-xs flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-indigo-400" /> Causal Behavioral Trace Inspector
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() =>
                  handleTriggerCausalTrace(
                    'Pheromone Trail Recruitment',
                    'Trail Pheromone Gradient Detected',
                    'Biased Steering Turn into Odor Plume'
                  )
                }
                className="px-2 py-1 rounded bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 text-[10px] font-bold border border-indigo-700/50"
              >
                + Trace Foraging
              </button>
              <button
                onClick={() =>
                  handleTriggerCausalTrace(
                    'Alarm & Defensive Stance',
                    'Formic Acid / Predator Cuticular Odor',
                    'Mandible Spread & Acidopore Extrusion'
                  )
                }
                className="px-2 py-1 rounded bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-[10px] font-bold border border-rose-700/50"
              >
                + Trace Defense
              </button>
            </div>
          </div>

          {activeTraces.map((trace) => (
            <div key={trace.id} className="flex flex-col gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="font-bold text-cyan-300 text-[11px]">{trace.behaviorName}</span>
                <span className="text-[10px] text-slate-400">Target Ant: {trace.antId}</span>
              </div>
              <p className="text-[10px] text-slate-300 italic">{trace.outcomeSummary}</p>

              <div className="flex flex-col gap-1.5 mt-1">
                {trace.steps.map((st, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 flex flex-col gap-1 text-[10px]"
                  >
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-purple-400 font-bold">
                        [{st.timestampMs.toFixed(1)}ms] {st.stage} — {st.neuropil}
                      </span>
                      <span className="text-emerald-400 font-semibold">{st.dominantNeurotransmitter}</span>
                    </div>
                    <p className="text-slate-300">{st.causalExplanation}</p>
                    <div className="flex items-center gap-2 text-slate-400 text-[9px]">
                      <span>Active Units: {st.activeUnits.join(', ')}</span>
                      <span>• Vm: {st.membranePotentialAvg} mV</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
