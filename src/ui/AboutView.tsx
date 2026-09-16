/**
 * ANTWIRE — Official About & Research Platform Overview
 *
 * Project: ANTWIRE
 * Subtitle: Biologically Inspired Ant Intelligence, Brain Simulation & Colony Behavior
 * Author / Creator: Nikhilesh H. Chavda
 * Copyright: © 2026 Nikhilesh H. Chavda
 */

import React from 'react';
import { Bug, Sparkles, ExternalLink, ShieldCheck, Cpu, Database, Award, BookOpen, Layers } from 'lucide-react';
import { BioInfoTrigger } from './BioInfoTrigger';

interface AboutViewProps {
  onOpenSources?: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onOpenSources }) => {
  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6 bg-slate-900/95 border border-slate-800 rounded-2xl text-slate-200 text-xs shadow-2xl backdrop-blur-md max-w-4xl mx-auto overflow-y-auto font-sans">
      {/* Brand Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 via-emerald-600 to-amber-500 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-950/80 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Bug className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-100 font-heading tracking-wide">
              ANT<span className="text-emerald-400">WIRE</span>
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium">
              Biologically Inspired Ant Intelligence, Brain Simulation & Colony Behavior
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <BioInfoTrigger topicId="flywire_connectomics" variant="badge" label="FlyWire Inspiration" />
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-700/50 text-emerald-300">
            v1.0.0
          </span>
        </div>
      </div>

      {/* Creator & Developer Card */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold block mb-0.5">
            Primary Creator & Lead Architect
          </span>
          <h2 className="text-sm sm:text-base font-bold text-slate-100 font-heading">
            Nikhilesh H. Chavda
          </h2>
          <p className="text-[11px] text-slate-400">
            Computational Neurobiology, Multi-Agent Systems & Artificial Life Engineer
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-[11px]">
          <a
            href="https://nik-portfolio-lime.vercel.app/"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-lg bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 hover:bg-cyan-900/80 font-semibold transition-all inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Portfolio</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="https://github.com/Nik-2208"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 font-semibold transition-all inline-flex items-center gap-1 cursor-pointer"
          >
            <span>GitHub</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="https://www.linkedin.com/in/nikhilesh-chavda-2b779533a/"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-lg bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 hover:bg-indigo-900/80 font-semibold transition-all inline-flex items-center gap-1 cursor-pointer"
          >
            <span>LinkedIn</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* 1. WHAT IS ANTWIRE? */}
      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col gap-2">
        <h3 className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 uppercase font-mono">
          <Cpu className="w-4 h-4" /> 1. What is AntWire?
        </h3>
        <p className="text-slate-300 leading-relaxed">
          <strong>AntWire</strong> is an open-source, research-grade, experimental computational platform inspired by ant nervous systems, insect sensory physiology, and collective colony behavior. It unites deterministic multi-agent physics, chemical stigmergic diffusion fields, and biologically informed spiking neural network architectures (55,000+ neuron models) into an interactive laboratory.
        </p>
      </div>

      {/* 2. SCIENTIFIC & ETHICAL POSITIONING */}
      <div className="p-4 rounded-xl bg-slate-950/60 border border-emerald-500/30 flex flex-col gap-2">
        <h3 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase font-mono">
          <ShieldCheck className="w-4 h-4" /> 2. Scientific Positioning & Ethical Transparency
        </h3>
        <p className="text-slate-300 leading-relaxed">
          <em>AntWire is an experimental biologically informed computational platform inspired by ant nervous systems and collective colony behavior.</em>
        </p>
        <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1">
          <li><strong>No fabricated biological connectomes:</strong> AntWire never claims to possess an experimentally proofread complete ant connectome where empirical volume microscopy has not yet been performed by science.</li>
          <li><strong>Explicit Evidence Tiers:</strong> Every component is classified as <code className="text-emerald-400">ESTABLISHED</code>, <code className="text-cyan-400">SUPPORTED</code>, <code className="text-amber-400">SPECIES_SPECIFIC</code>, <code className="text-purple-400">MODELLED</code>, <code className="text-blue-400">INFERRED</code>, or <code className="text-rose-400">SPECULATIVE</code>.</li>
        </ul>
      </div>

      {/* 3. WHAT IS FLYWIRE VS ANTWIRE? */}
      <div className="p-4 rounded-xl bg-slate-950/60 border border-purple-500/30 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-purple-400 flex items-center gap-1.5 uppercase font-mono">
            <Layers className="w-4 h-4" /> 3. What is FlyWire vs. AntWire?
          </h3>
          <BioInfoTrigger topicId="flywire_connectomics" variant="badge" label="Learn More" />
        </div>
        <p className="text-slate-300 leading-relaxed">
          <strong>FlyWire</strong> (<a href="https://flywire.ai/" target="_blank" rel="noreferrer" className="text-purple-300 underline">https://flywire.ai/</a>) is the landmark international connectomics consortium that produced the first complete, proofread electron-microscopy wiring diagram of the adult fruit fly (<em>Drosophila melanogaster</em>) brain (~139,255 neurons, 50M+ synapses).
        </p>
        <p className="text-slate-300 leading-relaxed">
          <strong>AntWire</strong> adopts FlyWire’s software architecture—multi-scale 3D neuron inspection, explicit synaptic contacts, and metadata provenance—as an architectural template for ant-inspired simulations, while developing independent computational models for ant foraging, living bridges, and attine fungus agriculture.
        </p>
      </div>

      {/* 4. KEY RESEARCH CAPABILITIES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-1">
          <span className="font-bold text-cyan-300">Independent Ant Runtimes</span>
          <span className="text-slate-400">Every ant owns an isolated brain runtime, memory cache, and lifecycle state without singleton cross-talk.</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-1">
          <span className="font-bold text-emerald-300">Living Bridges & Structures</span>
          <span className="text-slate-400">Dynamic collective locomotion where ants interlock tarsal claws to form load-bearing bridges across terrain voids.</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-1">
          <span className="font-bold text-amber-300">Attine Fungus Agriculture</span>
          <span className="text-slate-400">Foliage pulping, gongylidia yields, Escovopsis pathogen pressure, and midden refuse partitioning.</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-1">
          <span className="font-bold text-purple-300">1-Click Executable Models</span>
          <span className="text-slate-400">Directly generate and download complete .zip packages with standalone offline Python inference and training engines.</span>
        </div>
      </div>

      {/* Footer & License */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-slate-800 text-[10px] text-slate-500 font-mono">
        <span>© 2026 Nikhilesh H. Chavda • Open-Source MIT License</span>
        {onOpenSources && (
          <button
            onClick={onOpenSources}
            className="text-cyan-400 hover:text-cyan-300 font-bold underline cursor-pointer"
          >
            Browse Peer-Reviewed Literature & Sources →
          </button>
        )}
      </div>
    </div>
  );
};
