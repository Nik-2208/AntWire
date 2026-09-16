/**
 * ANTWIRE — Digital Neuron Lab & LIF Oscilloscope
 * Interactive single-neuron and microcircuit computational lab with real-time
 * Leaky Integrate-and-Fire membrane potential graphing and neurotransmitter dynamics.
 */

import React, { useState, useEffect, useRef } from 'react';
import { SpikingNeuron } from '../ants/brain/spiking_neuron';
import { ScientificBadge } from './ScientificBadge';
import { Activity, Zap, Play, RotateCcw, Sliders } from 'lucide-react';

export const DigitalNeuronLab: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const neuronRef = useRef<SpikingNeuron>(
    new SpikingNeuron('NL-01', 'AL Projection Neuron', {
      vRest: -65.0,
      vThreshold: -45.0,
      vReset: -70.0,
      tauM: 15.0,
      tauRefractory: 2.5,
    })
  );

  const [injectedCurrent, setInjectedCurrent] = useState(1.8);
  const [octopamineLevel, setOctopamineLevel] = useState(0.5); // Arousal / Sensitization
  const [gabaLevel, setGabaLevel] = useState(0.2); // Inhibition
  const [spikeCount, setSpikeCount] = useState(0);
  const [spikeRateHz, setSpikeRateHz] = useState(0);
  const [isSimulating, setIsSimulating] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastSpikeCheckTime = performance.now();
    let spikesInWindow = 0;
    let simTime = 0;

    const loop = () => {
      const neuron = neuronRef.current;
      
      if (isSimulating) {
        // Effective input current modulated by Octopamine (excitatory boost) and GABA (inhibitory shunt)
        const netCurrent = Math.max(0, injectedCurrent * (1 + octopamineLevel * 0.8) - gabaLevel * 2.5);
        simTime += 0.001;
        
        // Step neuron at 1kHz equivalent (1ms dt)
        const spiked = neuron.update(1.0, netCurrent, simTime);
        if (spiked) {
          spikesInWindow++;
          setSpikeCount((c) => c + 1);
        }

        const now = performance.now();
        if (now - lastSpikeCheckTime >= 500) {
          setSpikeRateHz(Math.round((spikesInWindow / (now - lastSpikeCheckTime)) * 1000));
          spikesInWindow = 0;
          lastSpikeCheckTime = now;
        }
      }

      // Draw Oscilloscope Trace
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = '#050811';
      ctx.fillRect(0, 0, w, h);

      // Grid Lines
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      
      // Voltage Grid
      const vMin = -80;
      const vMax = 30;
      const toY = (v: number) => h - ((v - vMin) / (vMax - vMin)) * (h - 20) - 10;

      // Threshold Line (-45 mV)
      const yThresh = toY(neuron.config.vThreshold);
      ctx.strokeStyle = '#ef444455';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, yThresh);
      ctx.lineTo(w, yThresh);
      ctx.stroke();

      // Resting Line (-65 mV)
      const yRest = toY(neuron.config.vRest);
      ctx.strokeStyle = '#3b82f644';
      ctx.beginPath();
      ctx.moveTo(0, yRest);
      ctx.lineTo(w, yRest);
      ctx.stroke();
      ctx.setLineDash([]);

      // Voltage Trace
      const trace = neuron.voltageTrace;
      if (trace.length > 1) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < trace.length; i++) {
          const x = (i / (trace.length - 1)) * w;
          const y = toY(trace[i]);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Readouts
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      ctx.fillText(`Peak: +25mV`, 10, toY(25) + 4);
      ctx.fillText(`Thresh: -45mV`, 10, yThresh - 4);
      ctx.fillText(`Rest: -65mV`, 10, yRest + 12);
      ctx.fillText(`V(m): ${neuron.v.toFixed(1)} mV`, w - 110, 20);

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [injectedCurrent, octopamineLevel, gabaLevel, isSimulating]);

  const handleReset = () => {
    neuronRef.current.reset();
    setSpikeCount(0);
    setSpikeRateHz(0);
  };

  return (
    <div className="flex flex-col gap-3 p-3 bg-slate-900/90 border border-slate-800 rounded-2xl text-slate-200 text-xs shadow-xl backdrop-blur-md">
      {/* Title & Badge */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-slate-100 tracking-wide">DIGITAL NEURON LAB</span>
        </div>
        <ScientificBadge category="COMPUTATIONAL_ABSTRACTION" />
      </div>

      <p className="text-[11px] text-slate-400 leading-relaxed">
        Single-compartment <strong className="text-cyan-300">Leaky Integrate-and-Fire (LIF)</strong> model simulating antennal lobe projection neuron membrane dynamics under neuromodulatory control.
      </p>

      {/* Oscilloscope Screen */}
      <div className="relative rounded-xl overflow-hidden border border-cyan-500/30 shadow-inner">
        <canvas
          ref={canvasRef}
          width={320}
          height={150}
          className="w-full h-36 bg-[#050811] block"
        />
        <div className="absolute top-2 right-2 flex items-center gap-2 bg-slate-950/80 px-2 py-1 rounded-md border border-slate-800 font-mono text-[10px]">
          <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span className="text-emerald-400 font-bold">{spikeRateHz} Hz</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300">{spikeCount} spikes</span>
        </div>
      </div>

      {/* Control Sliders */}
      <div className="flex flex-col gap-2.5 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-300 font-medium">Injected Current (I_inj):</span>
          <span className="font-mono text-cyan-400 font-bold">{injectedCurrent.toFixed(1)} pA</span>
        </div>
        <input
          type="range"
          min="0"
          max="35"
          step="0.5"
          value={injectedCurrent}
          onChange={(e) => setInjectedCurrent(parseFloat(e.target.value))}
          className="accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
        />

        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-900">
          <span className="text-amber-300 font-medium">Octopamine (Sensitization / OA):</span>
          <span className="font-mono text-amber-400 font-bold">{(octopamineLevel * 100).toFixed(0)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={octopamineLevel}
          onChange={(e) => setOctopamineLevel(parseFloat(e.target.value))}
          className="accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
        />

        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-900">
          <span className="text-purple-300 font-medium">GABA (Inhibition / Lateral Shunt):</span>
          <span className="font-mono text-purple-400 font-bold">{(gabaLevel * 100).toFixed(0)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={gabaLevel}
          onChange={(e) => setGabaLevel(parseFloat(e.target.value))}
          className="accent-purple-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
        />
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => setIsSimulating(!isSimulating)}
          className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 text-[11px] transition-all ${
            isSimulating ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50 hover:bg-amber-600/50' : 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-600/50'
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          {isSimulating ? 'Pause Neuron' : 'Resume Neuron'}
        </button>
        <button
          onClick={handleReset}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-medium flex items-center gap-1 text-[11px]"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>
    </div>
  );
};
