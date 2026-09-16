/**
 * ANTWIRE — Scientific Data & Provenance Hub
 * Reference neuroanatomy database, species profiles with DOIs, trajectory dataset exporter,
 * and community connectomics annotation portal.
 */

import React, { useState } from 'react';
import { SPECIES_REGISTRY, SpeciesProfile } from '../colony/species_profiles';
import { REFERENCE_BRAIN_REGIONS } from '../ants/brain/connectome';
import { ScientificBadge } from './ScientificBadge';
import { DatasetExporter } from '../learning/dataset_exporter';
import { TrajectoryLogger } from '../learning/trajectory_logger';
import { Database, Download, BookOpen, ExternalLink, FileText, CheckCircle2, MessageSquarePlus } from 'lucide-react';

interface DataHubViewProps {
  trajectoryLogger?: TrajectoryLogger;
}

export const DataHubView: React.FC<DataHubViewProps> = ({ trajectoryLogger }) => {
  const [activeTab, setActiveTab] = useState<'SPECIES' | 'CONNECTOMICS' | 'EXPORTS'>('SPECIES');
  const [selectedSpecies, setSelectedSpecies] = useState<string>('formica-experimenta');
  const [exportFeedback, setExportFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const species = SPECIES_REGISTRY[selectedSpecies] || SPECIES_REGISTRY['formica-experimenta'];

  const handleExportTrajectories = () => {
    if (trajectoryLogger) {
      const res = DatasetExporter.exportAndDownload(trajectoryLogger);
      setExportFeedback({ success: res.success, message: res.message });
      setTimeout(() => setExportFeedback(null), 6000);
    } else {
      setExportFeedback({ success: false, message: 'Trajectory logger not initialized.' });
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-slate-900/90 border border-slate-800 rounded-2xl text-slate-200 text-xs shadow-xl backdrop-blur-md overflow-y-auto max-h-[85vh]">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-cyan-400" />
          <div>
            <h2 className="text-sm font-bold font-heading text-slate-100">DATA HUB & SCIENTIFIC PROVENANCE</h2>
            <p className="text-[10px] text-slate-400">Literature Citations, Reference Atlases & Open Datasets</p>
          </div>
        </div>
        <ScientificBadge category="BIOLOGICAL_FACT" />
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex items-center gap-1.5 bg-slate-950/70 p-1 rounded-xl border border-slate-800 text-[11px]">
        <button
          onClick={() => setActiveTab('SPECIES')}
          className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
            activeTab === 'SPECIES'
              ? 'bg-cyan-600/40 text-cyan-300 border border-cyan-500/50 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Species Profiles
        </button>
        <button
          onClick={() => setActiveTab('CONNECTOMICS')}
          className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
            activeTab === 'CONNECTOMICS'
              ? 'bg-emerald-600/40 text-emerald-300 border border-emerald-500/50 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Reference Connectome
        </button>
        <button
          onClick={() => setActiveTab('EXPORTS')}
          className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
            activeTab === 'EXPORTS'
              ? 'bg-purple-600/40 text-purple-300 border border-purple-500/50 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Dataset Exporter
        </button>
      </div>

      {/* 1. SPECIES PROFILES */}
      {activeTab === 'SPECIES' && (
        <div className="flex flex-col gap-3">
          <div className="flex gap-1.5">
            {Object.values(SPECIES_REGISTRY).map((sp) => (
              <button
                key={sp.id}
                onClick={() => setSelectedSpecies(sp.id)}
                className={`flex-1 py-2 px-2.5 rounded-xl font-bold text-left transition-all ${
                  selectedSpecies === sp.id
                    ? 'bg-cyan-600/40 text-cyan-300 border border-cyan-500 shadow-md'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                <div className="text-[11px] font-bold">{sp.scientificName}</div>
                <div className="text-[9px] text-slate-400 font-normal">{sp.commonName}</div>
              </button>
            ))}
          </div>

          {/* Profile Card */}
          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-300 text-sm">{species.scientificName}</span>
              <ScientificBadge category={species.provenance} />
            </div>

            <p className="text-slate-300 leading-relaxed text-[11px]">{species.description}</p>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-900 text-[10px] font-mono">
              <div>
                <span className="text-slate-500">Social Hierarchy: </span>
                <span className="text-slate-200 font-bold">{species.social.socialOrganization}</span>
              </div>
              <div>
                <span className="text-slate-500">Queen Present: </span>
                <span className="text-slate-200 font-bold">{species.social.queenPresent ? 'YES' : 'NO (Clonal)'}</span>
              </div>
              <div>
                <span className="text-slate-500">Glomeruli Count: </span>
                <span className="text-emerald-300 font-bold">~{species.neurosensory.olfactoryGlomeruliCount}</span>
              </div>
              <div>
                <span className="text-slate-500">Kenyon Cells: </span>
                <span className="text-amber-300 font-bold">{species.neurosensory.kenyonCellCount.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-900 text-[10px] text-slate-400 flex items-start gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                <strong>Citation: </strong>
                {species.citation} {species.doi && <span className="text-cyan-400 underline font-mono ml-1">DOI: {species.doi}</span>}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2. REFERENCE CONNECTOME ATLAS */}
      {activeTab === 'CONNECTOMICS' && (
        <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
          {Object.values(REFERENCE_BRAIN_REGIONS).map((reg) => (
            <div key={reg.id} className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 flex flex-col gap-1 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="font-bold text-cyan-300">{reg.name}</span>
                <ScientificBadge category={reg.provenanceStatus} />
              </div>
              <p className="text-slate-400 text-[10px]">{reg.primaryFunction}</p>
              <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1 border-t border-slate-900">
                <span>Biological Neurons: ~{reg.estimatedBiologicalNeuronCount.toLocaleString()}</span>
                <span>Simulated Nodes: {reg.simulatedNodeCount} units</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. DATASET EXPORTER */}
      {activeTab === 'EXPORTS' && (
        <div className="flex flex-col gap-3 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="font-bold text-purple-300 text-xs flex items-center gap-1.5">
              <Download className="w-4 h-4 text-purple-400" /> Export Active Simulation Trajectories (.json)
            </span>
            <span className="text-[10px] font-mono text-cyan-400">
              {trajectoryLogger?.getCurrentStepCount() ?? 0} active steps buffered
            </span>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Exports standardized $(s, a, r, s')$ transition episodes recorded from the fixed 60Hz simulation clock for offline reinforcement learning, behavior cloning, and statistical trajectory validation.
          </p>

          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[10.5px] space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Buffered Active Steps:</span>
              <span className="font-mono text-cyan-300 font-bold">{trajectoryLogger?.getCurrentStepCount() ?? 0} transitions</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Completed Stored Episodes:</span>
              <span className="font-mono text-emerald-300 font-bold">{trajectoryLogger?.getRecordedEpisodes().length ?? 0} episodes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Observation Schema:</span>
              <span className="font-mono text-slate-300 text-[9.5px]">Antennae Left/Right, Odometer, Internal State, Decomposed Rewards</span>
            </div>
          </div>

          {exportFeedback && (
            <div
              className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                exportFeedback.success
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                  : 'bg-amber-950/80 border-amber-500 text-amber-300'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{exportFeedback.message}</span>
            </div>
          )}

          <button
            onClick={handleExportTrajectories}
            className="py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Active Trajectory Dataset</span>
          </button>
        </div>
      )}
    </div>
  );
};
