/**
 * ANTWIRE — Complete Computational Ant Brain Parameter Inspector Modal
 * Created & Developed by Nikhilesh H. Chavda
 *
 * Allows researchers to inspect, search, and filter all parameters of a trained ant brain package
 * across Brain, Neurons, Synapses, Memory, Sensors, Body, Motor, Behavior, Reward, Learning,
 * Communication, Pheromones, Colony, Training, and Provenance.
 *
 * Distinctly displays:
 * - BIOLOGICALLY_SUPPORTED
 * - SPECIES_SPECIFIC
 * - APPROXIMATION
 * - COMPUTATIONAL
 * - NOT_IMPLEMENTED
 */

import React, { useState, useMemo } from 'react';
import {
  BiologicalCatalogEntry,
  BiologicalStatus,
  ModelPackageGenerator,
} from '../learning/model_package_generator';
import { ModelCheckpoint } from '../learning/model_checkpoint';
import {
  Search,
  X,
  Sliders,
  Filter,
  Info,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  BookOpen,
} from 'lucide-react';

interface ParameterInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  checkpoint: ModelCheckpoint | null;
  agentId?: string;
}

const CATEGORIES = [
  'All',
  'Brain',
  'Neurons',
  'Synapses',
  'Memory',
  'Sensors',
  'Body',
  'Motor',
  'Behavior',
  'Reward',
  'Learning',
  'Communication',
  'Pheromones',
  'Colony',
  'Training',
  'Provenance',
] as const;

export const ParameterInspectorModal: React.FC<ParameterInspectorModalProps> = ({
  isOpen,
  onClose,
  checkpoint,
  agentId = 'Ant-0042',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Generate catalog entries based on active checkpoint
  const catalogEntries: BiologicalCatalogEntry[] = useMemo(() => {
    if (!checkpoint) return [];
    const baseCatalog = ModelPackageGenerator.generateBiologicalCatalog(checkpoint);

    // Complement with runtime/learned parameters
    const extended: BiologicalCatalogEntry[] = [
      ...baseCatalog,
      {
        parameter: 'Learned Synaptic Policy Weights (Input->Hidden)',
        category: 'Learning',
        biological_status: 'COMPUTATIONAL',
        implemented_in_antwire: true,
        value: `${checkpoint.weights.inputWeights.length} x ${checkpoint.weights.inputWeights[0]?.length || 0} floating point tensors`,
        unit: 'weights',
        species_scope: 'Computational Model',
        source: 'AntWire Policy Optimization',
        notes: 'Reinforcement learning weights updated via policy gradients.',
      },
      {
        parameter: 'Learned Synaptic Policy Weights (Hidden->Output)',
        category: 'Learning',
        biological_status: 'COMPUTATIONAL',
        implemented_in_antwire: true,
        value: `${checkpoint.weights.outputWeights.length} x ${checkpoint.weights.outputWeights[0]?.length || 0} floating point tensors`,
        unit: 'weights',
        species_scope: 'Computational Model',
        source: 'AntWire Policy Optimization',
        notes: 'Final motor readout steering and throttle policy matrix.',
      },
      {
        parameter: 'Exploration Noise Rate (Epsilon)',
        category: 'Behavior',
        biological_status: 'COMPUTATIONAL',
        implemented_in_antwire: true,
        value: '0.20 (exponentially decaying)',
        unit: 'rate',
        species_scope: 'Computational Model',
        source: 'Simulated annealing policy exploration',
        notes: 'Governs behavioral variation during foraging excursions.',
      },
      {
        parameter: 'Path Integration Vector Accumulator',
        category: 'Memory',
        biological_status: 'BIOLOGICALLY_SUPPORTED',
        implemented_in_antwire: true,
        value: 'Continuous Cartesian (X, Y) relative coordinates',
        unit: 'meters',
        species_scope: 'Cataglyphis / Formica',
        source: 'Stone et al. (2017) Current Biology',
        notes: 'Maintains egocentric vector pointing directly toward nest entrance.',
      },
      {
        parameter: 'Mandibular Grip Tensile Force',
        category: 'Motor',
        biological_status: 'APPROXIMATION',
        implemented_in_antwire: true,
        value: '0.85 normalized grip index',
        unit: 'index [0-1]',
        species_scope: 'Atta cephalotes',
        source: 'Roces & Hölldobler (1994)',
        notes: 'Determines success rate when grasping heavy food fragments and during bridge formation.',
      },
      {
        parameter: 'Antennal Flagellum Micro-Turbulence Sensor Array',
        category: 'Sensors',
        biological_status: 'NOT_IMPLEMENTED',
        implemented_in_antwire: false,
        value: null,
        unit: 'N/A',
        species_scope: 'Insects general',
        source: 'Biological parameter not computationally modeled',
        notes: 'AntWire computes smooth spatial concentration vectors rather than Navier-Stokes micro-vortices.',
      },
      {
        parameter: 'Colony Cuticular Hydrocarbon (CHC) Chemical Synthesis',
        category: 'Colony',
        biological_status: 'NOT_IMPLEMENTED',
        implemented_in_antwire: false,
        value: null,
        unit: 'N/A',
        species_scope: 'Formicidae',
        source: 'Biological parameter not computationally modeled',
        notes: 'Metabolic synthesis pathway of specific n-alkanes and methyl-alkanes is not simulated.',
      },
    ];

    return extended;
  }, [checkpoint]);

  // Filter entries
  const filteredEntries = useMemo(() => {
    return catalogEntries.filter((entry) => {
      const matchesCat = selectedCategory === 'All' || entry.category === selectedCategory;
      const matchesStatus = statusFilter === 'ALL' || entry.biological_status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        entry.parameter.toLowerCase().includes(q) ||
        entry.notes.toLowerCase().includes(q) ||
        entry.source.toLowerCase().includes(q) ||
        entry.category.toLowerCase().includes(q);
      return matchesCat && matchesStatus && matchesSearch;
    });
  }, [catalogEntries, selectedCategory, statusFilter, searchQuery]);

  if (!isOpen) return null;

  const getStatusBadge = (status: BiologicalStatus) => {
    switch (status) {
      case 'BIOLOGICALLY_SUPPORTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            BIOLOGICALLY SUPPORTED
          </span>
        );
      case 'SPECIES_SPECIFIC':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-950/80 text-teal-300 border border-teal-500/40">
            <Info className="w-3 h-3 text-teal-400" />
            SPECIES SPECIFIC
          </span>
        );
      case 'APPROXIMATION':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            APPROXIMATION
          </span>
        );
      case 'COMPUTATIONAL':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
            <Sliders className="w-3 h-3 text-cyan-400" />
            COMPUTATIONAL
          </span>
        );
      case 'NOT_IMPLEMENTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/60 text-rose-300 border border-rose-500/40">
            <HelpCircle className="w-3 h-3 text-rose-400" />
            NOT IMPLEMENTED
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 text-xs font-mono">
      <div className="flex flex-col w-full max-w-5xl h-[90vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-500/40">
              <Sliders className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-100 font-sans tracking-wide">
                  ANTWIRE COMPUTATIONAL PARAMETER INSPECTOR
                </h2>
                <span className="px-2 py-0.5 rounded bg-cyan-900/50 text-cyan-300 text-[10px] font-bold border border-cyan-700/50">
                  {agentId}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Authoritative parameters, units, biological status, and literature citations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scientific Honesty Notice Banner */}
        <div className="p-3 bg-cyan-950/40 border-b border-cyan-800/40 flex items-start gap-2.5 text-[11px] text-cyan-200 leading-relaxed">
          <BookOpen className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white block font-sans text-xs mb-0.5">Scientific Honesty Guarantee:</strong>
            {ModelPackageGenerator.SCIENTIFIC_DISCLAIMER}
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="p-3 border-b border-slate-800 bg-slate-950/50 flex flex-wrap items-center gap-2.5">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search parameters, citations, units, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-700/80 text-[10px]">
            <Filter className="w-3 h-3 text-slate-400" />
            <span className="text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-cyan-300 font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-slate-200">All Statuses</option>
              <option value="BIOLOGICALLY_SUPPORTED" className="bg-slate-900 text-emerald-400">Biologically Supported</option>
              <option value="SPECIES_SPECIFIC" className="bg-slate-900 text-teal-400">Species Specific</option>
              <option value="APPROXIMATION" className="bg-slate-900 text-amber-400">Approximation</option>
              <option value="COMPUTATIONAL" className="bg-slate-900 text-cyan-400">Computational</option>
              <option value="NOT_IMPLEMENTED" className="bg-slate-900 text-rose-400">Not Implemented</option>
            </select>
          </div>

          <span className="text-slate-500 text-[10px] ml-auto">
            Showing <strong className="text-cyan-400">{filteredEntries.length}</strong> of {catalogEntries.length} parameters
          </span>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 px-3 py-2 border-b border-slate-800 bg-slate-950/30 overflow-x-auto text-[10px]">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Parameter Table */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredEntries.length === 0 ? (
            <div className="py-20 text-center text-slate-500">
              No parameters matched your search or filter criteria.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filteredEntries.map((item, idx) => (
                <div
                  key={`${item.parameter}-${idx}`}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col gap-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100 text-xs">{item.parameter}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{item.notes}</p>
                    </div>
                    <div>{getStatusBadge(item.biological_status)}</div>
                  </div>

                  <div className="grid grid-cols-12 gap-2 pt-2 border-t border-slate-800/60 text-[11px]">
                    <div className="col-span-4">
                      <span className="text-slate-500 text-[10px] block">VALUE & UNIT:</span>
                      <span className="font-bold text-cyan-300">
                        {item.value !== null && item.value !== undefined ? String(item.value) : 'None'}
                      </span>{' '}
                      <span className="text-slate-400 text-[10px]">({item.unit})</span>
                    </div>

                    <div className="col-span-4">
                      <span className="text-slate-500 text-[10px] block">SPECIES SCOPE:</span>
                      <span className="text-slate-300">{item.species_scope}</span>
                    </div>

                    <div className="col-span-4">
                      <span className="text-slate-500 text-[10px] block">SCIENTIFIC CITATION / SOURCE:</span>
                      <span className="text-amber-300/90 text-[10px] italic">{item.source}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between text-[11px] text-slate-400">
          <div>
            Format: <strong className="text-slate-200">.antbrain (Zip Package)</strong> • Author: <strong className="text-slate-200">Nikhilesh H. Chavda</strong>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
