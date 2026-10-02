/**
 * ANTWRE — Official About & Research Platform Overview
 * Created & Developed by Nikhilesh H. Chavda
 *
 * Repository: https://github.com/Nik-2208/AntWire
 * Portfolio:  https://nik-portfolio-lime.vercel.app/
 * LinkedIn:   https://www.linkedin.com/in/nikhilesh-chavda-2b779533a/
 */

import React from 'react';
import { Sparkles, ExternalLink, ShieldCheck, Cpu, Database, Award, BookOpen, Layers, Globe, Share2 } from 'lucide-react';
import { AntWireLogo } from './AntWireLogo';
import { BioInfoTrigger } from './BioInfoTrigger';
import { ANTWRE_BRAND } from '../theme/design_system';

interface AboutViewProps {
  onOpenSources?: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onOpenSources }) => {
  return (
    <div className="flex flex-col gap-5 p-5 sm:p-8 bg-[#0c1017]/95 border border-gray-800 rounded-2xl text-gray-200 text-xs shadow-2xl backdrop-blur-md max-w-4xl mx-auto overflow-y-auto font-sans">
      {/* Brand Hero Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-800 pb-5">
        <AntWireLogo
          size="lg"
          showText={true}
          showSubtitle={true}
          subtitleText={ANTWRE_BRAND.tagline}
          animateGlow={true}
        />

        <div className="flex items-center gap-2">
          <BioInfoTrigger topicId="flywire_connectomics" variant="badge" label="Connectome Grounded" />
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/50 text-emerald-300">
            v1.0.0 Release
          </span>
        </div>
      </div>

      {/* Creator & Developer Card */}
      <div className="p-5 rounded-xl bg-[#111622] border border-cyan-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold block mb-0.5">
            Primary Creator & Lead Architect
          </span>
          <h2 className="text-base font-bold text-gray-100 font-heading">
            {ANTWRE_BRAND.author.name}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Computational Neurobiology, Multi-Agent Systems & Artificial Life Engineer
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <a
            href={ANTWRE_BRAND.author.portfolio}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-lg bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 hover:bg-cyan-900/80 font-semibold transition inline-flex items-center gap-1.5"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>Portfolio</span>
            <ExternalLink className="w-3 h-3 text-gray-400" />
          </a>
          <a
            href={ANTWRE_BRAND.author.github}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-200 hover:bg-gray-700 font-semibold transition inline-flex items-center gap-1.5"
          >
            <span>GitHub: Nik-2208</span>
            <ExternalLink className="w-3 h-3 text-gray-400" />
          </a>
          <a
            href={ANTWRE_BRAND.author.linkedin}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-lg bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 hover:bg-indigo-900/80 font-semibold transition inline-flex items-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>LinkedIn</span>
            <ExternalLink className="w-3 h-3 text-gray-400" />
          </a>
        </div>
      </div>

      {/* 1. WHAT IS ANTWIRE? */}
      <div className="p-4 rounded-xl bg-[#090d14] border border-gray-800 flex flex-col gap-2">
        <h3 className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 uppercase font-mono">
          <Cpu className="w-4 h-4 text-cyan-400" /> 1. What is AntWire?
        </h3>
        <p className="text-gray-300 leading-relaxed">
          <strong>AntWire</strong> is an open-source, research-grade, experimental computational platform inspired by ant nervous systems, insect sensory physiology, and collective colony behavior. It unites deterministic multi-agent physics, chemical stigmergic diffusion fields, and biologically informed spiking neural network architectures (55,000+ neuron models) into an interactive laboratory.
        </p>
      </div>

      {/* 2. CORE SCIENTIFIC INVARIANTS */}
      <div className="p-4 rounded-xl bg-[#090d14] border border-gray-800 flex flex-col gap-2">
        <h3 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-400" /> 2. Core Biological & Architectural Invariants
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-300 mt-1">
          <div className="p-2.5 rounded-lg bg-[#111622] border border-gray-800/80">
            <strong className="text-gray-100 block mb-1">Isolated Neural Runtimes</strong>
            Each worker ant executes on its own private 55,000-neuron firing state, memory buffer, and physiological drives.
          </div>
          <div className="p-2.5 rounded-lg bg-[#111622] border border-gray-800/80">
            <strong className="text-gray-100 block mb-1">Truthful Data Only</strong>
            Zero mock metrics, zero fabricated benchmarks, and zero fake download counts. Real empirical measurements only.
          </div>
          <div className="p-2.5 rounded-lg bg-[#111622] border border-gray-800/80">
            <strong className="text-gray-100 block mb-1">Superorganism Stigmergy</strong>
            Collective trail formation, brood care, cemetery management, and queen protection emerge from local interactions.
          </div>
          <div className="p-2.5 rounded-lg bg-[#111622] border border-gray-800/80">
            <strong className="text-gray-100 block mb-1">Offline Local Execution</strong>
            Neural computation, physics, and RL training operate 100% locally with zero cloud dependencies.
          </div>
        </div>
      </div>

      {/* Live Trained Showcase Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-gray-900 to-[#111622] border border-emerald-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-bold text-gray-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            AntWire Keyboard RL — Trained Brain Demonstration
          </h4>
          <p className="text-gray-400 text-[11px] mt-0.5">
            Explore the trained 55k neural ant brain navigating and activating keyboard keys via reinforcement learning.
          </p>
        </div>
        <a
          href={ANTWRE_BRAND.author.keyboardShowcase}
          target="_blank"
          rel="noreferrer"
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 transition whitespace-nowrap"
        >
          <span>Launch Showcase</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Footer / Copyright */}
      <div className="pt-3 border-t border-gray-800 text-center text-[11px] text-gray-500">
        ANTWIRE © 2026 {ANTWRE_BRAND.author.name} • Open Source Biological Neural Modeling
      </div>
    </div>
  );
};
