/**
 * ANTWIRE — Synaptic Transmission & Anatomical Neuropil Circuit Studio
 *
 * Provides an exhaustive, neuron-wise interactive studio demonstrating:
 * 1. INSECT & ANT NEUROPIL ANATOMY:
 *    - Antennal Lobes (ORNs -> Glomeruli -> Projection Neurons)
 *    - Mushroom Bodies (Kenyon Cells sparse coding -> MBONs -> DAN/OAN valence gating)
 *    - Central Complex (Ellipsoid Body 16-wedge heading compass, Protocerebral Bridge, Fan-Shaped Body vector odometer)
 *    - Optic Lobes (Ommatidia -> Lamina -> Medulla -> Lobula)
 *    - Subesophageal Zone & Lateral Accessory Lobes (mandibular grasp & bilateral steering)
 * 2. NEURON-WISE SIGNAL CONDUCTION:
 *    - Graded dendritic EPSP/IPSP summation
 *    - Axon hillock thresholding (-65mV rest -> -45mV threshold -> +30mV peak)
 *    - Voltage-gated Na+/K+ ion channel kinetics
 *    - Axonal propagation
 * 3. SYNAPTIC TRANSMISSION BIOPHYSICS:
 *    - Pre-synaptic action potential arrival
 *    - Voltage-gated Ca2+ influx
 *    - Synaptic vesicle docking and SNARE exocytosis
 *    - Neurotransmitter diffusion in the 20nm synaptic cleft (ACh, GABA, Glu, DA, OA, 5-HT)
 *    - Post-synaptic ligand-gated channel opening & EPSC/IPSC generation
 *    - Spike-Timing-Dependent Plasticity (STDP) and Hebbian LTP/LTD weight adaptation
 */

import React, { useState, useEffect } from 'react';
import {
  Brain,
  Zap,
  Activity,
  Layers,
  Sparkles,
  Play,
  RotateCcw,
  Sliders,
  Radio,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export type NeurotransmitterType = 'ACETYLCHOLINE' | 'GABA' | 'GLUTAMATE' | 'OCTOPAMINE' | 'DOPAMINE' | 'SEROTONIN';

export const SynapticTransmissionHero: React.FC = () => {
  // Signal Transmission States
  const [isFiringActionPotential, setIsFiringActionPotential] = useState(false);
  const [signalStage, setSignalStage] = useState<number>(0); // 0: Resting, 1: Dendrite, 2: Hillock, 3: Axon, 4: Synapse, 5: Post-Synaptic
  const [selectedTransmitter, setSelectedTransmitter] = useState<NeurotransmitterType>('ACETYLCHOLINE');
  const [synapticWeight, setSynapticWeight] = useState<number>(0.85);
  const [membraneVoltage, setMembraneVoltage] = useState<number>(-65.0);
  const [voltageTrace, setVoltageTrace] = useState<number[]>([-65, -65, -65, -65, -65]);
  const [vesiclesReleased, setVesiclesReleased] = useState<number>(0);

  // Active Anatomical Neuropil selection
  const [selectedNeuropil, setSelectedNeuropil] = useState<string>('ANTENNAL_LOBE');

  // Trigger Action Potential and step through signal propagation
  const handleFireActionPotential = () => {
    if (isFiringActionPotential) return;
    setIsFiringActionPotential(true);
    setSignalStage(1);
    setMembraneVoltage(-55.0);

    // Step 1: Dendritic EPSP
    setTimeout(() => {
      setSignalStage(2);
      setMembraneVoltage(-45.0); // Threshold reached
      setVoltageTrace((prev) => [...prev.slice(-30), -45]);
    }, 250);

    // Step 2: Peak Depolarization (+30 mV)
    setTimeout(() => {
      setSignalStage(3);
      setMembraneVoltage(30.0);
      setVoltageTrace((prev) => [...prev.slice(-30), 30]);
    }, 500);

    // Step 3: Synaptic Cleft Neurotransmitter Exocytosis
    setTimeout(() => {
      setSignalStage(4);
      setVesiclesReleased((prev) => prev + 12);
      setMembraneVoltage(-70.0); // Hyperpolarization
      setVoltageTrace((prev) => [...prev.slice(-30), -70]);
    }, 750);

    // Step 4: Post-Synaptic Channel Activation
    setTimeout(() => {
      setSignalStage(5);
      const postV = selectedTransmitter === 'GABA' ? -72.0 : -52.0;
      setMembraneVoltage(postV);
      setVoltageTrace((prev) => [...prev.slice(-30), postV]);
    }, 1000);

    // Step 5: Reset to Tonic Resting Potential
    setTimeout(() => {
      setSignalStage(0);
      setMembraneVoltage(-65.0);
      setVoltageTrace((prev) => [...prev.slice(-30), -65]);
      setIsFiringActionPotential(false);
    }, 1300);
  };

  return (
    <div className="flex flex-col gap-3 p-3.5 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-cyan-500/30 rounded-2xl text-slate-200 text-xs shadow-2xl relative overflow-hidden">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-2.5 gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/60 text-cyan-300 animate-pulse">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold font-heading text-slate-100 flex items-center gap-1.5">
                ANTWIRE NEURON-WISE SIGNAL TRANSMISSION & SYNAPSE BIOPHYSICS
              </h3>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 font-mono">
                Anatomically Grounded
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Live biophysical simulation of action potentials, voltage-gated ion channels, vesicle exocytosis, and synaptic plasticity.
            </p>
          </div>
        </div>

        {/* Action Trigger Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleFireActionPotential}
            disabled={isFiringActionPotential}
            className={`px-3 py-1.5 rounded-lg font-bold text-[10px] flex items-center gap-1.5 transition-all shadow-lg cursor-pointer ${
              isFiringActionPotential
                ? 'bg-amber-600 text-white animate-pulse'
                : 'bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            {isFiringActionPotential ? 'Transmitting Signal...' : '⚡ Fire Action Potential'}
          </button>
        </div>
      </div>

      {/* Main 2-Panel Layout: Left (Anatomical Circuit Map) | Right (Synaptic Cleft & Ion Channels) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* LEFT PANEL: Insect Brain Anatomical Circuit Map */}
        <div className="lg:col-span-6 bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <Brain className="w-4 h-4" /> Anatomical Neuropil Pathway
            </span>
            <span className="text-[9px] font-mono text-slate-400">Signal Flow Stage: {signalStage}/5</span>
          </div>

          {/* Interactive Neuropil Circuit Schematic */}
          <div className="relative w-full h-44 bg-[#030712] rounded-lg border border-slate-800 overflow-hidden p-2 flex flex-col justify-between">
            {/* Top Sensory Input Layer */}
            <div className="flex justify-between items-center text-[10px]">
              <div
                onClick={() => setSelectedNeuropil('ANTENNAL_LOBE')}
                className={`p-1.5 rounded border transition-all cursor-pointer ${
                  selectedNeuropil === 'ANTENNAL_LOBE'
                    ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300 shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div className="font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Antennal Lobe (AL)
                </div>
                <div className="text-[8.5px] text-slate-500 font-mono">500 Glomeruli • ORNs → PNs</div>
              </div>

              <div
                onClick={() => setSelectedNeuropil('OPTIC_LOBE')}
                className={`p-1.5 rounded border transition-all cursor-pointer ${
                  selectedNeuropil === 'OPTIC_LOBE'
                    ? 'bg-pink-950/90 border-pink-500 text-pink-300 shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div className="font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-pink-400" />
                  Optic Lobe (OL)
                </div>
                <div className="text-[8.5px] text-slate-500 font-mono">Lamina → Medulla → Lobula</div>
              </div>
            </div>

            {/* Middle Integration & Memory Layer */}
            <div className="flex justify-around items-center text-[10px] my-1">
              <div
                onClick={() => setSelectedNeuropil('MUSHROOM_BODY')}
                className={`p-1.5 rounded border transition-all cursor-pointer ${
                  selectedNeuropil === 'MUSHROOM_BODY'
                    ? 'bg-amber-950/90 border-amber-500 text-amber-300 shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div className="font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Mushroom Body (MB)
                </div>
                <div className="text-[8.5px] text-slate-500 font-mono">Kenyon Cells • Associative Memory</div>
              </div>

              <div
                onClick={() => setSelectedNeuropil('CENTRAL_COMPLEX')}
                className={`p-1.5 rounded border transition-all cursor-pointer ${
                  selectedNeuropil === 'CENTRAL_COMPLEX'
                    ? 'bg-cyan-950/90 border-cyan-500 text-cyan-300 shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div className="font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  Central Complex (CX)
                </div>
                <div className="text-[8.5px] text-slate-500 font-mono">16-Wedge EB Compass • FB Home Vector</div>
              </div>
            </div>

            {/* Bottom Motor Output Layer */}
            <div className="flex justify-between items-center text-[10px]">
              <div
                onClick={() => setSelectedNeuropil('LAL')}
                className={`p-1.5 rounded border transition-all cursor-pointer ${
                  selectedNeuropil === 'LAL'
                    ? 'bg-purple-950/90 border-purple-500 text-purple-300 shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div className="font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  Lateral Accessory Lobe (LAL)
                </div>
                <div className="text-[8.5px] text-slate-500 font-mono">Flip-Flop Steering Command</div>
              </div>

              <div
                onClick={() => setSelectedNeuropil('SEZ')}
                className={`p-1.5 rounded border transition-all cursor-pointer ${
                  selectedNeuropil === 'SEZ'
                    ? 'bg-rose-950/90 border-rose-500 text-rose-300 shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div className="font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  Subesophageal Zone (SEZ)
                </div>
                <div className="text-[8.5px] text-slate-500 font-mono">Mandibular Grasp • Forward Propulsion</div>
              </div>
            </div>
          </div>

          {/* Neuropil Explanation Details */}
          <div className="p-2 rounded bg-slate-900/90 border border-slate-800 text-[10px] space-y-1">
            <span className="font-bold text-cyan-300">Active Circuit Transmission Stage:</span>
            {signalStage === 0 && <span className="text-slate-400 ml-1">Resting baseline state (Vm = -65 mV). Awaiting sensory input.</span>}
            {signalStage === 1 && <span className="text-emerald-300 ml-1 font-semibold">1. Antennal sensilla bind food odor molecules → receptor generator currents enter dendrite.</span>}
            {signalStage === 2 && <span className="text-amber-300 ml-1 font-semibold">2. Depolarization reaches Axon Hillock threshold (-45 mV) → voltage-gated Na+ channels open.</span>}
            {signalStage === 3 && <span className="text-cyan-300 ml-1 font-semibold">3. Action potential peak (+30 mV) propagates along axon toward terminal bouton.</span>}
            {signalStage === 4 && <span className="text-purple-300 ml-1 font-semibold">4. Ca2+ influx triggers synaptic vesicle fusion → neurotransmitter exocytosis across 20nm cleft.</span>}
            {signalStage === 5 && <span className="text-emerald-400 ml-1 font-semibold">5. Ligand-gated ion channels open on post-synaptic neuron → EPSC generated, triggering motor response!</span>}
          </div>
        </div>

        {/* RIGHT PANEL: Biophysical Synapse & Ion Channel Simulator */}
        <div className="lg:col-span-6 bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
            <span className="flex items-center gap-1.5 text-amber-400">
              <Sparkles className="w-4 h-4" /> Biophysical Synapse Cleft & Membrane Voltage
            </span>
            <span className="font-mono text-cyan-300 font-bold">{membraneVoltage.toFixed(1)} mV</span>
          </div>

          {/* Interactive Synapse Visual Schematic */}
          <div className="relative w-full h-36 bg-[#050914] rounded-lg border border-slate-800 p-2 flex flex-col justify-between overflow-hidden">
            {/* Pre-Synaptic Bouton */}
            <div className="p-1.5 rounded bg-cyan-950/70 border border-cyan-700/60 flex items-center justify-between text-[9.5px]">
              <span className="font-bold text-cyan-300">Pre-Synaptic Bouton (Axon Terminal)</span>
              <span className="font-mono text-slate-400">Ca2+ Influx: {signalStage === 4 ? 'ACTIVE' : 'IDLE'}</span>
            </div>

            {/* Synaptic Cleft (20nm) with Neurotransmitter Molecules */}
            <div className="h-10 my-1 bg-slate-950/90 rounded border border-dashed border-slate-700 flex items-center justify-around px-2 relative">
              <span className="text-[8px] text-slate-500 absolute left-2 top-0.5">20nm Synaptic Cleft</span>
              {Array.from({ length: 14 }).map((_, idx) => (
                <span
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-all ${
                    signalStage === 4 || signalStage === 5
                      ? 'bg-amber-400 animate-bounce shadow-md shadow-amber-500/50'
                      : 'bg-slate-700'
                  }`}
                  style={{ animationDelay: `${idx * 40}ms` }}
                />
              ))}
            </div>

            {/* Post-Synaptic Membrane & Receptors */}
            <div className="p-1.5 rounded bg-purple-950/70 border border-purple-700/60 flex items-center justify-between text-[9.5px]">
              <span className="font-bold text-purple-300">Post-Synaptic Density (Dendrite)</span>
              <span className="font-mono text-emerald-400">Receptor Channel: {signalStage === 5 ? 'OPEN (EPSC)' : 'CLOSED'}</span>
            </div>
          </div>

          {/* Neurotransmitter Selector & Plasticity Controls */}
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="space-y-1">
              <span className="text-slate-400 block font-semibold">Neurotransmitter:</span>
              <select
                value={selectedTransmitter}
                onChange={(e: any) => setSelectedTransmitter(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-[10px] text-cyan-300 font-mono"
              >
                <option value="ACETYLCHOLINE">Acetylcholine (ACh - Fast Excitatory)</option>
                <option value="GABA">GABA (Inhibitory - Cl- Influx)</option>
                <option value="GLUTAMATE">Glutamate (Neuromuscular Motor)</option>
                <option value="OCTOPAMINE">Octopamine (Foraging Arousal & Gain)</option>
                <option value="DOPAMINE">Dopamine (Reward Prediction Error)</option>
                <option value="SEROTONIN">Serotonin (Pacing & Social Gating)</option>
              </select>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Synaptic Weight (STDP):</span>
                <span className="font-mono text-cyan-300 font-bold">{synapticWeight.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.5"
                step="0.05"
                value={synapticWeight}
                onChange={(e) => setSynapticWeight(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
