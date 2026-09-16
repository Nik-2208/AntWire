/**
 * ANTWIRE — 3D Brain Atlas & Connectome Inspector
 * Integrates Three.js 3D neuropil models with reference connectome metadata and
 * live sensory-motor pathway tracing.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Brain3DViewer } from '../visualization/brain_3d_viewer';
import { REFERENCE_BRAIN_REGIONS, BrainRegionMetadata, NeuropilRegionId } from '../ants/brain/connectome';
import { ScientificBadge } from './ScientificBadge';
import { Layers, BookOpen, Eye } from 'lucide-react';
import { Ant } from '../ants/ant';
import { BiologicalBrainController } from '../ants/controllers/biological_brain';

const REGION_COLORS: Record<NeuropilRegionId, string> = {
  ANTENNAL_LOBE: '#10b981',
  MUSHROOM_BODY_CALYX: '#f59e0b',
  MUSHROOM_BODY_PEDUNCLE: '#fbbf24',
  MUSHROOM_BODY_LOBES: '#d97706',
  CENTRAL_COMPLEX_EB: '#06b6d4',
  CENTRAL_COMPLEX_PB: '#3b82f6',
  CENTRAL_COMPLEX_FB: '#6366f1',
  CENTRAL_COMPLEX_NO: '#8b5cf6',
  LATERAL_ACCESSORY_LOBE: '#a855f7',
  SUBESOPHAGEAL_ZONE: '#e11d48',
  OPTIC_LOBE: '#ec4899',
  VENTRAL_NERVE_CORD: '#64748b',
  PROTHORACIC_GANGLION: '#0284c7',
  MESOTHORACIC_GANGLION: '#0d9488',
  METATHORACIC_GANGLION: '#16a34a',
  ABDOMINAL_GANGLIA: '#d97706',
};

interface AntBrainAtlasProps {
  selectedAnt: Ant | null;
}

export const AntBrainAtlas: React.FC<AntBrainAtlasProps> = ({ selectedAnt }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Brain3DViewer | null>(null);

  const [selectedRegionId, setSelectedRegionId] = useState<NeuropilRegionId>('ANTENNAL_LOBE');
  const [selectedMeta, setSelectedMeta] = useState<BrainRegionMetadata>(
    REFERENCE_BRAIN_REGIONS['ANTENNAL_LOBE']
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    try {
      const viewer = new Brain3DViewer(container);
      viewerRef.current = viewer;

      viewer.onSelectRegion = (meta) => {
        setSelectedRegionId(meta.id);
        setSelectedMeta(meta);
      };

      let animId: number;
      const animate = () => {
        if (selectedAnt && selectedAnt.controller instanceof BiologicalBrainController) {
          viewer.updateFromBrainState(selectedAnt.controller.brain.getSnapshot());
        }
        viewer.render();
        animId = requestAnimationFrame(animate);
      };
      animId = requestAnimationFrame(animate);

      return () => {
        cancelAnimationFrame(animId);
        viewer.dispose();
      };
    } catch (err) {
      console.error('Failed to init Brain3DViewer:', err);
    }
  }, [selectedAnt]);

  const handleSelectRegion = (id: NeuropilRegionId) => {
    setSelectedRegionId(id);
    const meta = REFERENCE_BRAIN_REGIONS[id];
    if (meta) {
      setSelectedMeta(meta);
      if (viewerRef.current) {
        viewerRef.current.highlightRegion(id);
      }
    }
  };

  return (
    <div className="flex flex-col gap-3 p-3 bg-slate-900/90 border border-slate-800 rounded-2xl text-slate-200 text-xs shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-slate-100 tracking-wide">3D ANTWIRE BRAIN ATLAS</span>
        </div>
        <ScientificBadge category="BIOLOGICAL_INSPIRATION" />
      </div>

      {/* 3D Brain Viewport */}
      <div className="relative rounded-xl overflow-hidden border border-cyan-500/30 bg-[#06080d] h-48 cursor-grab active:cursor-grabbing shadow-inner">
        <div ref={containerRef} className="w-full h-full" />
        <div className="absolute top-2 left-2 bg-slate-950/80 px-2 py-0.5 rounded text-[10px] text-cyan-300 font-mono border border-slate-800 flex items-center gap-1.5">
          <Eye className="w-3 h-3 text-cyan-400" />
          <span>Drag to Orbit | Scroll to Zoom</span>
        </div>
      </div>

      {/* Neuropil Region Selection Buttons */}
      <div className="flex flex-wrap gap-1.5">
        {(Object.keys(REFERENCE_BRAIN_REGIONS) as NeuropilRegionId[]).map((regId) => {
          const reg = REFERENCE_BRAIN_REGIONS[regId];
          const isActive = selectedRegionId === regId;
          const colorHex = REGION_COLORS[regId] || '#38bdf8';
          return (
            <button
              key={regId}
              onClick={() => handleSelectRegion(regId)}
              className={`px-2 py-1 rounded-lg font-semibold text-[10px] transition-all flex items-center gap-1 ${
                isActive
                  ? 'bg-cyan-600/40 text-cyan-300 border border-cyan-500/60 shadow-md'
                  : 'bg-slate-950/60 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: colorHex }}
              />
              {reg.name.split(' (')[0]}
            </button>
          );
        })}
      </div>

      {/* Selected Neuropil Metadata Card */}
      {selectedMeta && (
        <div className="flex flex-col gap-2 bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="font-bold text-cyan-300 text-xs">{selectedMeta.name}</span>
            <ScientificBadge category={selectedMeta.provenanceStatus} />
          </div>

          <p className="text-slate-300 leading-relaxed">{selectedMeta.primaryFunction}</p>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-900 font-mono text-[10px]">
            <div>
              <span className="text-slate-500">Biological Cells: </span>
              <span className="text-slate-200 font-bold">~{selectedMeta.estimatedBiologicalNeuronCount.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-500">Simulated Nodes: </span>
              <span className="text-amber-300 font-bold">{selectedMeta.simulatedNodeCount} units</span>
            </div>
          </div>

          <div className="pt-1 border-t border-slate-900 text-[10px] text-slate-400 flex items-start gap-1">
            <BookOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
            <span className="italic">{selectedMeta.scientificDescription}</span>
          </div>
        </div>
      )}
    </div>
  );
};
