/**
 * ANTWIRE — Universal Biological Information & Scientific Fact Popup Component
 *
 * Provides:
 * 1. HOVER: Translucent (~88% opacity), non-flickering, edge-aware tooltip preview with smooth fade.
 * 2. CLICK / TAP: Polished full contextual modal dialog with detailed biological facts,
 *    AntWire computational abstractions, scientific limitations, and clickable peer-reviewed sources.
 * 3. Body scroll lock during modal display; no layout jumps, shifts, or page-level scrollbars.
 * 4. Keyboard accessibility (Escape to close, Enter/Space to open, focusable).
 * 5. Touch/mobile support.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  BiologyKnowledgeBase,
  BiologicalKnowledgeEntry,
  BiologicalEvidenceLevel,
} from '../simulation/biological_knowledge_base';
import {
  Info,
  BookOpen,
  ExternalLink,
  X,
  Sparkles,
  ShieldCheck,
  Layers,
  GitBranch,
  AlertCircle,
} from 'lucide-react';

export interface BiologyInfoPopupProps {
  topicId: string;
  label?: string;
  variant?: 'icon' | 'badge' | 'button' | 'pill' | 'inline';
  className?: string;
  showIcon?: boolean;
}

export const BiologyInfoPopup: React.FC<BiologyInfoPopupProps> = ({
  topicId,
  label,
  variant = 'icon',
  className = '',
  showIcon = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [currentTopicId, setCurrentTopicId] = useState(topicId);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number; placeAbove: boolean }>({
    top: 0,
    left: 0,
    placeAbove: true,
  });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTouchRef = useRef(false);

  // Sync if topicId prop changes
  useEffect(() => {
    setCurrentTopicId(topicId);
  }, [topicId]);

  const entry: BiologicalKnowledgeEntry =
    BiologyKnowledgeBase.get(currentTopicId) ||
    BiologyKnowledgeBase.get('antennae_sensing') || {
      id: topicId,
      title: label || 'Biological Information',
      category: 'Neuroscience',
      summary: 'Biologically informed mechanism modeled in the AntWire platform.',
      biologicalFact: 'Empirical insect neurobiology and social colony dynamics documented in entomological literature.',
      antwireModel: 'Computational model abstracting sensing, decision-making, and collective multi-agent dynamics.',
      limitation: 'Abstracted for real-time simulation and does not claim 1:1 cellular connectomic reproduction.',
      importance: 'Core biological principle underpinning artificial insect behavior.',
      confidence: 0.95,
      evidenceLevel: 'ESTABLISHED',
      source: 'Hölldobler, B., & Wilson, E. O. (1990). The Ants. Harvard University Press.',
      sourceUrl: 'https://flywire.ai/',
      tags: ['biology', 'neuroscience'],
      relatedTopics: ['antennae_sensing', 'olfactory_glomeruli', 'pheromones_trail_following'],
    };

  // Dynamic Tooltip Positioning relative to viewport
  const updateTooltipPosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const tooltipWidth = 280;
    const estimatedHeight = 130;
    const margin = 12;

    // Center horizontally with viewport bounds clamping
    let left = rect.left + rect.width / 2 - tooltipWidth / 2;
    if (left < margin) left = margin;
    if (left + tooltipWidth > window.innerWidth - margin) {
      left = window.innerWidth - tooltipWidth - margin;
    }

    // Default above, flip below if not enough space
    let placeAbove = true;
    let top = rect.top - estimatedHeight - 8;
    if (top < margin) {
      placeAbove = false;
      top = rect.bottom + 8;
    }

    setTooltipPos({ top, left, placeAbove });
  }, []);

  const handleMouseEnter = () => {
    if (isTouchRef.current) return;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    updateTooltipPosition();
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 180);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 140);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsHovered(false);
    setIsOpen(true);
  };

  const handleTouchStart = () => {
    isTouchRef.current = true;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsHovered(false);
      setIsOpen(true);
    }
  };

  // Lock body scroll when modal is open & add Escape key listener
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleGlobalKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsOpen(false);
        }
      };

      window.addEventListener('keydown', handleGlobalKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleGlobalKeyDown);
      };
    }
  }, [isOpen]);

  const getEvidenceColor = (level: BiologicalEvidenceLevel) => {
    switch (level) {
      case 'ESTABLISHED':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-600/60';
      case 'SUPPORTED':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-600/60';
      case 'SPECIES_SPECIFIC':
        return 'bg-amber-950/80 text-amber-300 border-amber-600/60';
      case 'MODELLED':
        return 'bg-purple-950/80 text-purple-300 border-purple-600/60';
      case 'INFERRED':
        return 'bg-blue-950/80 text-blue-300 border-blue-600/60';
      case 'SPECULATIVE':
        return 'bg-rose-950/80 text-rose-300 border-rose-600/60';
      default:
        return 'bg-slate-900 text-slate-300 border-slate-700';
    }
  };

  return (
    <>
      <div
        className={`relative inline-flex items-center select-none ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* TRIGGER BUTTON VARIANTS */}
        {variant === 'icon' && (
          <button
            ref={triggerRef}
            type="button"
            onClick={handleClick}
            onTouchStart={handleTouchStart}
            onKeyDown={handleKeyDown}
            aria-label={`Inspect biological information: ${entry.title}`}
            className="p-1 text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80 rounded-full transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-cyan-400/70"
            title={`Biology Info: ${entry.title}`}
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        )}

        {variant === 'badge' && (
          <button
            ref={triggerRef}
            type="button"
            onClick={handleClick}
            onTouchStart={handleTouchStart}
            onKeyDown={handleKeyDown}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-slate-700/80 transition-all cursor-pointer shadow-sm hover:border-cyan-500/60 focus:outline-none focus:ring-1 focus:ring-cyan-400/70"
          >
            {showIcon && <Info className="w-3 h-3 text-cyan-400 shrink-0" />}
            <span className="truncate max-w-[140px]">{label || entry.category}</span>
          </button>
        )}

        {variant === 'pill' && (
          <button
            ref={triggerRef}
            type="button"
            onClick={handleClick}
            onTouchStart={handleTouchStart}
            onKeyDown={handleKeyDown}
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-200 border border-cyan-700/50 transition-all cursor-pointer shadow-sm focus:outline-none focus:ring-1 focus:ring-cyan-400/70"
          >
            {showIcon && <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />}
            <span className="truncate max-w-[160px]">{label || entry.title}</span>
          </button>
        )}

        {variant === 'button' && (
          <button
            ref={triggerRef}
            type="button"
            onClick={handleClick}
            onTouchStart={handleTouchStart}
            onKeyDown={handleKeyDown}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-cyan-500 transition-all cursor-pointer shadow-sm focus:outline-none focus:ring-1 focus:ring-cyan-400/70"
          >
            {showIcon && <BookOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
            <span>{label || 'Scientific Context'}</span>
          </button>
        )}

        {variant === 'inline' && (
          <button
            ref={triggerRef}
            type="button"
            onClick={handleClick}
            onTouchStart={handleTouchStart}
            onKeyDown={handleKeyDown}
            className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 underline decoration-cyan-500/40 underline-offset-2 font-medium cursor-pointer text-xs"
          >
            <span>{label || entry.title}</span>
            {showIcon && <Info className="w-3 h-3 shrink-0 text-cyan-400" />}
          </button>
        )}
      </div>

      {/* 1. HOVER TOOLTIP (Fixed viewport coordinates, translucent backdrop, non-flickering) */}
      {isHovered && !isOpen && (
        <div
          role="tooltip"
          onMouseEnter={() => {
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
            setIsHovered(true);
          }}
          onMouseLeave={handleMouseLeave}
          style={{
            position: 'fixed',
            top: `${tooltipPos.top}px`,
            left: `${tooltipPos.left}px`,
            zIndex: 99999,
          }}
          className="w-[280px] p-3 rounded-xl bg-slate-950/88 border border-cyan-500/40 shadow-2xl shadow-cyan-950/50 backdrop-blur-md text-left transition-opacity duration-150 animate-in fade-in zoom-in-95 pointer-events-auto select-none"
        >
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[9px] font-mono uppercase tracking-wider text-cyan-400 font-bold truncate">
              {entry.category}
            </span>
            <span
              className={`text-[8px] font-mono px-1.5 py-0.2 rounded border font-semibold ${getEvidenceColor(
                entry.evidenceLevel
              )}`}
            >
              {entry.evidenceLevel}
            </span>
          </div>

          <div className="text-[11px] font-bold text-slate-100 mb-1 leading-snug">{entry.title}</div>
          <p className="text-[10px] text-slate-300 font-sans leading-relaxed">{entry.summary}</p>

          <div className="mt-2 pt-1.5 border-t border-slate-800/80 text-[8.5px] text-cyan-300 flex items-center justify-between font-mono">
            <span>Click to inspect full biological model</span>
            <span>↗</span>
          </div>
        </div>
      )}

      {/* 2. FULL CONTEXTUAL MODAL (Detailed scientific facts, abstractions & sources) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100000] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 select-none"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(false);
          }}
        >
          <div
            className="relative w-full max-w-2xl bg-slate-900 border border-cyan-500/50 rounded-2xl shadow-2xl p-4 sm:p-6 text-slate-200 max-h-[85vh] flex flex-col font-sans animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-3 gap-2 shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[10px] font-mono uppercase font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/60">
                    {entry.category}
                  </span>
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded border font-bold ${getEvidenceColor(
                      entry.evidenceLevel
                    )}`}
                  >
                    EVIDENCE: {entry.evidenceLevel}
                  </span>
                  {entry.confidence && (
                    <span className="text-[9px] font-mono text-slate-400">
                      Confidence: {(entry.confidence * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-100 font-heading leading-tight">
                  {entry.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition-all cursor-pointer shrink-0"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Modal Content Body */}
            <div className="flex-1 overflow-y-auto pr-1 py-3.5 space-y-3 text-xs no-scrollbar">
              {/* SECTION 1: BIOLOGICAL FACT */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-emerald-500/30 flex flex-col gap-1.5 shadow-sm">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>BIOLOGICAL FACT (What Biology Demonstrates)</span>
                </div>
                <p className="text-slate-200 leading-relaxed font-sans">{entry.biologicalFact}</p>
                {entry.species && entry.species.length > 0 && (
                  <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-900">
                    Documented Species: <span className="text-emerald-300 italic">{entry.species.join(', ')}</span>
                  </div>
                )}
              </div>

              {/* SECTION 2: ANTWIRTE COMPUTATIONAL MODEL */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-cyan-500/30 flex flex-col gap-1.5 shadow-sm">
                <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-xs">
                  <Layers className="w-4 h-4 shrink-0" />
                  <span>ANTWIRE COMPUTATIONAL MODEL (How It Is Represented)</span>
                </div>
                <p className="text-slate-200 leading-relaxed font-sans">{entry.antwireModel}</p>
              </div>

              {/* SECTION 3: LIMITATIONS & BOUNDARIES */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-amber-500/30 flex flex-col gap-1.5 shadow-sm">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>LIMITATIONS & MODEL BOUNDARIES (What AntWire Does Not Claim)</span>
                </div>
                <p className="text-slate-300 leading-relaxed font-sans italic">{entry.limitation}</p>
              </div>

              {/* SECTION 4: PEER-REVIEWED SOURCE */}
              <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-col gap-1.5 font-mono text-[11px] shadow-sm">
                <span className="text-slate-400 font-bold flex items-center justify-between">
                  <span>PEER-REVIEWED SCIENTIFIC REFERENCE:</span>
                  {entry.doi && <span className="text-slate-500 text-[10px]">DOI: {entry.doi}</span>}
                </span>
                <p className="text-slate-300 font-sans">{entry.source}</p>
                <a
                  href={entry.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-bold pt-1 hover:underline text-xs"
                >
                  <span>Open Primary Source Link</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* SECTION 5: RELATED CONCEPTS */}
              {entry.relatedTopics && entry.relatedTopics.length > 0 && (
                <div className="flex flex-col gap-1.5 pt-1">
                  <span className="text-[10px] font-mono text-slate-400 font-bold flex items-center gap-1">
                    <GitBranch className="w-3 h-3 text-cyan-400 shrink-0" /> RELATED TOPICS:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {entry.relatedTopics.map((relId) => {
                      const rel = BiologyKnowledgeBase.get(relId);
                      if (!rel) return null;
                      return (
                        <button
                          key={relId}
                          type="button"
                          onClick={() => setCurrentTopicId(relId)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-[10px] font-medium transition-all cursor-pointer"
                        >
                          {rel.title} →
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800 shrink-0">
              <span className="text-[10px] text-slate-500 font-mono">
                AntWire Scientific Registry • Created by Nikhilesh H. Chavda
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Close Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Re-export BioInfoTrigger as alias for 100% backward compatibility
export const BioInfoTrigger = BiologyInfoPopup;
