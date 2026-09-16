/**
 * ANTWIRE — Model Checkpoint Library & Model Registry
 * Allows researchers to inspect saved checkpoints, compare models (Model A vs B),
 * load checkpoints for continued training, duplicate, delete, and export/import JSON.
 */

import React, { useState, useEffect } from 'react';
import { ModelCheckpoint, ModelStorageService } from '../learning/model_checkpoint';
import { Database, Download, Upload, Trash2, Copy, Play, BarChart2, CheckCircle2, X } from 'lucide-react';

interface ModelLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadModel: (checkpoint: ModelCheckpoint) => void;
}

export const ModelLibraryModal: React.FC<ModelLibraryModalProps> = ({ isOpen, onClose, onLoadModel }) => {
  const [models, setModels] = useState<ModelCheckpoint[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [compareModelA, setCompareModelA] = useState<ModelCheckpoint | null>(null);
  const [compareModelB, setCompareModelB] = useState<ModelCheckpoint | null>(null);
  const [activeTab, setActiveTab] = useState<'LIBRARY' | 'COMPARE'>('LIBRARY');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadStoredModels();
    }
  }, [isOpen]);

  const loadStoredModels = async () => {
    try {
      const list = await ModelStorageService.listCheckpoints();
      setModels(list);
      if (list.length > 0 && !selectedModelId) {
        setSelectedModelId(list[0].modelId);
      }
    } catch (err) {
      console.error('Failed to load checkpoints', err);
    }
  };

  if (!isOpen) return null;

  const selectedModel = models.find((m) => m.modelId === selectedModelId);

  const handleDelete = async (id: string) => {
    await ModelStorageService.deleteCheckpoint(id);
    setStatusMessage('Model checkpoint removed');
    loadStoredModels();
  };

  const handleDuplicate = async (id: string) => {
    const dup = await ModelStorageService.duplicateCheckpoint(id);
    setStatusMessage(`Duplicated as ${dup.version}`);
    loadStoredModels();
  };

  const handleExport = (cp: ModelCheckpoint) => {
    const json = ModelStorageService.exportToJSON(cp);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cp.modelName.replace(/\s+/g, '_')}_${cp.version}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const imported = await ModelStorageService.importFromJSON(text);
        setStatusMessage(`Successfully imported ${imported.modelName}`);
        loadStoredModels();
      } catch (err: any) {
        setStatusMessage(`Import failed: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 text-xs font-mono">
      <div className="flex flex-col w-full max-w-4xl max-h-[85vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-sm font-bold text-slate-100 font-sans tracking-wide">
                NEURAL MODEL REGISTRY & CHECKPOINT LIBRARY
              </h2>
              <p className="text-[10px] text-slate-400">IndexedDB Local-First Persistence & Head-to-Head Comparison</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
              <button
                onClick={() => setActiveTab('LIBRARY')}
                className={`px-3 py-1 rounded-md text-[11px] font-bold ${
                  activeTab === 'LIBRARY' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Model Library
              </button>
              <button
                onClick={() => setActiveTab('COMPARE')}
                className={`px-3 py-1 rounded-md text-[11px] font-bold ${
                  activeTab === 'COMPARE' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Head-to-Head Compare
              </button>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Notification */}
        {statusMessage && (
          <div className="bg-cyan-950/60 border-b border-cyan-800/50 px-4 py-1.5 text-cyan-300 text-[11px] flex items-center justify-between">
            <span>{statusMessage}</span>
            <button onClick={() => setStatusMessage(null)} className="text-cyan-400 hover:text-white text-[10px]">
              Dismiss
            </button>
          </div>
        )}

        {/* Body */}
        {activeTab === 'LIBRARY' ? (
          <div className="grid grid-cols-12 flex-1 overflow-hidden">
            {/* Left Model List */}
            <div className="col-span-5 border-r border-slate-800 p-3 overflow-y-auto flex flex-col gap-2 bg-slate-950/40">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800 text-slate-400 text-[10px]">
                <span>SAVED CHECKPOINTS ({models.length})</span>
                <label className="flex items-center gap-1 cursor-pointer text-cyan-400 hover:text-cyan-300">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import JSON</span>
                  <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
                </label>
              </div>

              {models.length === 0 ? (
                <div className="text-slate-500 py-12 text-center text-[11px]">
                  No saved checkpoints in local registry.
                  <br />
                  <span className="text-[10px] text-slate-600">Train an ant and click "Save Checkpoint" in the Training Lab.</span>
                </div>
              ) : (
                models.map((m) => {
                  const isSelected = m.modelId === selectedModelId;
                  return (
                    <div
                      key={m.modelId}
                      onClick={() => setSelectedModelId(m.modelId)}
                      className={`p-2.5 rounded-xl cursor-pointer border transition-all ${
                        isSelected
                          ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">{m.modelName}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          {m.version}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
                        <span>Task: {m.task}</span>
                        <span>Step: {m.trainingStep}</span>
                        <span className="text-emerald-400">Reward: {m.metrics.meanReward}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Right Details Panel */}
            <div className="col-span-7 p-4 overflow-y-auto flex flex-col gap-3">
              {selectedModel ? (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-100">{selectedModel.modelName}</h3>
                      <p className="text-[10px] text-slate-400">
                        ID: {selectedModel.modelId} • Created: {new Date(selectedModel.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        onLoadModel(selectedModel);
                        onClose();
                      }}
                      className="py-1.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-1.5 shadow-lg transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Load & Continue Training</span>
                    </button>
                  </div>

                  {/* Architecture & Metrics Cards */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-bold block mb-1">METRICS & PERFORMANCE</span>
                      <div className="flex flex-col gap-0.5 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Mean Reward:</span>
                          <span className="font-bold text-emerald-400">{selectedModel.metrics.meanReward}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Best Reward:</span>
                          <span className="font-bold text-cyan-400">{selectedModel.metrics.bestReward}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Success Rate:</span>
                          <span className="font-bold text-amber-400">{selectedModel.metrics.successRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Training Steps:</span>
                          <span>{selectedModel.trainingStep}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-bold block mb-1">NETWORK TOPOLOGY</span>
                      <div className="flex flex-col gap-0.5 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Architecture:</span>
                          <span>{selectedModel.architecture.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Input Size:</span>
                          <span>{selectedModel.architecture.inputSize} sensory cues</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Hidden Layers:</span>
                          <span>[{selectedModel.architecture.hiddenLayers.join(', ')}] ReLU</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Outputs:</span>
                          <span>{selectedModel.architecture.outputSize} motor commands</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => handleDuplicate(selectedModel.modelId)}
                      className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-all"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Duplicate Version</span>
                    </button>
                    <button
                      onClick={() => handleExport(selectedModel)}
                      className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export JSON</span>
                    </button>
                    <button
                      onClick={() => handleDelete(selectedModel.modelId)}
                      className="py-1.5 px-3 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 flex items-center gap-1.5 transition-all ml-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-slate-500 py-16 text-center">Select a model checkpoint from the list.</div>
              )}
            </div>
          </div>
        ) : (
          /* Head to Head Compare Tab */
          <div className="p-4 flex flex-col gap-4 flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              {/* Select Model A */}
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex flex-col gap-2">
                <span className="font-bold text-cyan-400 text-xs">MODEL A</span>
                <select
                  value={compareModelA?.modelId || ''}
                  onChange={(e) => setCompareModelA(models.find((m) => m.modelId === e.target.value) || null)}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                >
                  <option value="">Select Model A...</option>
                  {models.map((m) => (
                    <option key={m.modelId} value={m.modelId}>
                      {m.modelName} ({m.version}) - Reward: {m.metrics.meanReward}
                    </option>
                  ))}
                </select>

                {compareModelA && (
                  <div className="flex flex-col gap-1 text-[11px] pt-2 border-t border-slate-800 text-slate-300">
                    <div>Task: <span className="font-bold text-white">{compareModelA.task}</span></div>
                    <div>Mean Reward: <span className="font-bold text-emerald-400">{compareModelA.metrics.meanReward}</span></div>
                    <div>Success Rate: <span className="font-bold text-amber-400">{compareModelA.metrics.successRate}%</span></div>
                    <div>Training Steps: <span className="text-white">{compareModelA.trainingStep}</span></div>
                  </div>
                )}
              </div>

              {/* Select Model B */}
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex flex-col gap-2">
                <span className="font-bold text-fuchsia-400 text-xs">MODEL B</span>
                <select
                  value={compareModelB?.modelId || ''}
                  onChange={(e) => setCompareModelB(models.find((m) => m.modelId === e.target.value) || null)}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                >
                  <option value="">Select Model B...</option>
                  {models.map((m) => (
                    <option key={m.modelId} value={m.modelId}>
                      {m.modelName} ({m.version}) - Reward: {m.metrics.meanReward}
                    </option>
                  ))}
                </select>

                {compareModelB && (
                  <div className="flex flex-col gap-1 text-[11px] pt-2 border-t border-slate-800 text-slate-300">
                    <div>Task: <span className="font-bold text-white">{compareModelB.task}</span></div>
                    <div>Mean Reward: <span className="font-bold text-emerald-400">{compareModelB.metrics.meanReward}</span></div>
                    <div>Success Rate: <span className="font-bold text-amber-400">{compareModelB.metrics.successRate}%</span></div>
                    <div>Training Steps: <span className="text-white">{compareModelB.trainingStep}</span></div>
                  </div>
                )}
              </div>
            </div>

            {compareModelA && compareModelB && (
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col gap-2">
                <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4 text-cyan-400" />
                  Comparative Delta Summary
                </span>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Reward Delta</span>
                    <span
                      className={`font-bold text-sm ${
                        compareModelA.metrics.meanReward >= compareModelB.metrics.meanReward
                          ? 'text-cyan-400'
                          : 'text-fuchsia-400'
                      }`}
                    >
                      {(compareModelA.metrics.meanReward - compareModelB.metrics.meanReward).toFixed(2)}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Success Delta</span>
                    <span
                      className={`font-bold text-sm ${
                        compareModelA.metrics.successRate >= compareModelB.metrics.successRate
                          ? 'text-cyan-400'
                          : 'text-fuchsia-400'
                      }`}
                    >
                      {(compareModelA.metrics.successRate - compareModelB.metrics.successRate).toFixed(1)}%
                    </span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Step Experience</span>
                    <span className="font-bold text-sm text-slate-300">
                      {compareModelA.trainingStep} vs {compareModelB.trainingStep}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
