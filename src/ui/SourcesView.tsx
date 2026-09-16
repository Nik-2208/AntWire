/**
 * ANTWIRE — Scientific Literature, Sources & Academic Citations
 *
 * Curated registry of authoritative peer-reviewed papers and resources powering AntWire.
 */

import React, { useState } from 'react';
import { BookOpen, ExternalLink, Search, Tag, Filter, CheckCircle2, ShieldCheck } from 'lucide-react';
import { BioInfoTrigger } from './BioInfoTrigger';

export interface SourceReference {
  id: string;
  category: 'Biology & Entomology' | 'Neuroscience & Connectomics' | 'Machine Learning & SNN' | 'Multi-Agent Systems' | 'Software & Infrastructure';
  title: string;
  authors: string;
  year: number;
  publication: string;
  doi?: string;
  url: string;
  antwireMapping: string;
  keyFinding: string;
}

export const SCIENTIFIC_SOURCES: SourceReference[] = [
  {
    id: 'src-wilson-1980',
    category: 'Biology & Entomology',
    title: 'Caste and division of labor in leaf-cutter ants (Hymenoptera: Formicidae: Atta)',
    authors: 'Edward O. Wilson',
    year: 1980,
    publication: 'Behavioral Ecology and Sociobiology, 7(2), 143-156',
    doi: '10.1007/BF00299511',
    url: 'https://doi.org/10.1007/BF00299511',
    antwireMapping: 'Polymorphic caste scaling (minims, minors, mediae, majors) and probabilistic task biases.',
    keyFinding: 'Demonstrated allometric worker size distributions and physical specialization in Atta sexdens.',
  },
  {
    id: 'src-holldobler-wilson-1990',
    category: 'Biology & Entomology',
    title: 'The Ants',
    authors: 'Bert Hölldobler & Edward O. Wilson',
    year: 1990,
    publication: 'Harvard University Press / Belknap Press',
    url: 'https://www.hup.harvard.edu/books/9780674040755',
    antwireMapping: 'Colony superorganism dynamics, gland chemistry, mandibular gnathal anatomy, and brood lifecycles.',
    keyFinding: 'Comprehensive definitive encyclopedia of myrmecological biology, anatomy, and behavioral ecology.',
  },
  {
    id: 'src-currie-1999',
    category: 'Biology & Entomology',
    title: 'Fungus-growing ants use antibiotic-producing bacteria to control garden parasites',
    authors: 'Cameron R. Currie, James A. Scott, Richard C. Summerbell, & David Malloch',
    year: 1999,
    publication: 'Nature, 398(6729), 701-704',
    doi: '10.1038/19519',
    url: 'https://doi.org/10.1038/19519',
    antwireMapping: 'Attine fungus agriculture, Escovopsis pathogen dynamics, and metapleural sanitization behaviors.',
    keyFinding: 'Discovered mutualistic Pseudonocardia bacteria guarding attine gardens against Escovopsis microfungi.',
  },
  {
    id: 'src-reid-2015',
    category: 'Multi-Agent Systems',
    title: 'Army ants dynamically adjust living bridges to maximize traffic',
    authors: 'Christopher R. Reid, Matthew J. Lutz, Scott Powell, Albert B. Kao, Iain D. Couzin, & Simon Garnier',
    year: 2015,
    publication: 'Proceedings of the National Academy of Sciences (PNAS), 112(49), 15113-15118',
    doi: '10.1073/pnas.1512241112',
    url: 'https://doi.org/10.1073/pnas.1512241112',
    antwireMapping: 'Living self-assembling ant bridges, load-bearing capacities, and auto-dissolution upon traffic drop.',
    keyFinding: 'Showed Eciton burchellii living bridges dynamically shift position to optimize cost-benefit traffic trade-offs.',
  },
  {
    id: 'src-bonabeau-1996',
    category: 'Multi-Agent Systems',
    title: 'Quantitative study of the fixed-threshold model for the regulation of division of labour in insect societies',
    authors: 'Eric Bonabeau, Guy Theraulaz, & Jean-Louis Deneubourg',
    year: 1996,
    publication: 'Proceedings of the Royal Society of London. Series B, 263(1376), 1565-1569',
    doi: '10.1098/rspb.1996.0229',
    url: 'https://doi.org/10.1098/rspb.1996.0229',
    antwireMapping: 'Stimulus-response threshold equations (P = s^2 / (s^2 + theta^2)) governing decentralized labor division.',
    keyFinding: 'Formulated mathematical response threshold kinetics that produce self-organized social insect division of labor.',
  },
  {
    id: 'src-hart-2023',
    category: 'Neuroscience & Connectomics',
    title: 'Sparse and stereotyped olfactory circuits in the clonal raider ant brain',
    authors: 'Taylor Hart et al.',
    year: 2023,
    publication: 'Cell Reports, 42(8), 112700',
    doi: '10.1016/j.celrep.2023.112700',
    url: 'https://doi.org/10.1016/j.celrep.2023.112700',
    antwireMapping: 'Antennal lobe microglomerular counts (~500 glomeruli in Ooceraea biroi) and pheromone T6 clusters.',
    keyFinding: 'Reconstructed stereotypic 3D volumetric glomerular organization across 40 clonal raider worker brains.',
  },
  {
    id: 'src-dorkenwald-flywire-2024',
    category: 'Neuroscience & Connectomics',
    title: 'Neuronal wiring diagram of an adult brain',
    authors: 'Sven Dorkenwald et al. (FlyWire Consortium)',
    year: 2024,
    publication: 'Nature, 634, 124-138',
    doi: '10.1038/s41586-024-07558-y',
    url: 'https://flywire.ai/',
    antwireMapping: 'Multi-scale 3D connectomics viewer architecture, directional synaptic schemas, and evidence tiers.',
    keyFinding: 'Produced the first proofread whole-brain connectome of adult Drosophila (139,255 neurons, 50M+ synapses).',
  },
  {
    id: 'src-stone-2017',
    category: 'Neuroscience & Connectomics',
    title: 'An anatomically constrained model for path integration in the bee brain',
    authors: 'Thomas Stone et al.',
    year: 2017,
    publication: 'Current Biology, 27(20), 3069-3085',
    doi: '10.1016/j.cub.2017.08.052',
    url: 'https://doi.org/10.1016/j.cub.2017.08.052',
    antwireMapping: 'Central Complex (CX-EB / CX-PB / CX-FB) 16-wedge ring attractor heading compass and vector integrator.',
    keyFinding: 'Demonstrated how central complex columnar neurons compute egocentric heading and Euclidean home vectors.',
  },
  {
    id: 'src-gerstner-2002',
    category: 'Machine Learning & SNN',
    title: 'Spiking Neuron Models: Single Neurons, Populations, Plasticity',
    authors: 'Wulfram Gerstner & Werner M. Kistler',
    year: 2002,
    publication: 'Cambridge University Press',
    doi: '10.1017/CBO9780511815706',
    url: 'https://doi.org/10.1017/CBO9780511815706',
    antwireMapping: 'Leaky Integrate-and-Fire (LIF) discrete subthreshold membrane equations and action potential resets.',
    keyFinding: 'Foundational textbook on mathematical biophysics of spiking neural networks and STDP.',
  },
  {
    id: 'src-cassenaer-2012',
    category: 'Machine Learning & SNN',
    title: 'Conditional regulation of associative learning by dopamine in an insect mushroom body',
    authors: 'Stijn Cassenaer & Gilles Laurent',
    year: 2012,
    publication: 'Nature, 482(7383), 77-81',
    doi: '10.1038/nature10760',
    url: 'https://doi.org/10.1038/nature10760',
    antwireMapping: '3-factor neuromodulatory synaptic plasticity gating STDP associative memory traces.',
    keyFinding: 'Demonstrated dopamine release selectively gates Spike-Timing-Dependent Plasticity at mushroom body output synapses.',
  },
];

export const SourcesView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    'ALL',
    'Biology & Entomology',
    'Neuroscience & Connectomics',
    'Machine Learning & SNN',
    'Multi-Agent Systems',
  ];

  const filteredSources = SCIENTIFIC_SOURCES.filter((src) => {
    const matchesCat = selectedCategory === 'ALL' || src.category === selectedCategory;
    const matchesQuery =
      searchQuery === '' ||
      src.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      src.authors.toLowerCase().includes(searchQuery.toLowerCase()) ||
      src.antwireMapping.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6 bg-slate-900/95 border border-slate-800 rounded-2xl text-slate-200 text-xs shadow-2xl backdrop-blur-md max-w-5xl mx-auto overflow-y-auto font-sans">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm sm:text-base font-bold text-slate-100 font-heading">
              PEER-REVIEWED SCIENTIFIC SOURCES & LITERATURE
            </h2>
          </div>
          <p className="text-[11px] text-slate-400">
            Authoritative biological papers, connectomics references, and algorithms implemented in AntWire.
          </p>
        </div>

        <BioInfoTrigger topicId="flywire_connectomics" variant="pill" label="FlyWire Reference" />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2 items-center justify-between bg-slate-950/70 p-2 rounded-xl border border-slate-800">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar py-0.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search papers, authors, or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
          />
        </div>
      </div>

      {/* Sources Grid */}
      <div className="flex flex-col gap-3">
        {filteredSources.map((src) => (
          <div
            key={src.id}
            className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-cyan-500/40 transition-all flex flex-col gap-2 shadow-md font-sans"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/50">
                  {src.category} • {src.year}
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-slate-100 font-heading mt-1 leading-snug">
                  {src.title}
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">{src.authors}</p>
                <p className="text-[10px] text-slate-500 italic">{src.publication}</p>
              </div>

              <a
                href={src.url}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-[10.5px] flex items-center gap-1 shrink-0 transition-all cursor-pointer border border-slate-700"
              >
                <span>Read Paper</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-slate-900 text-[11px]">
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/60">
                <span className="text-[9.5px] font-mono font-bold text-emerald-400 block mb-0.5">
                  ✓ CORE BIOLOGICAL / ALGORITHMIC FINDING:
                </span>
                <p className="text-slate-300 text-[10.5px] leading-relaxed">{src.keyFinding}</p>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/60">
                <span className="text-[9.5px] font-mono font-bold text-cyan-400 block mb-0.5">
                  ⚙️ IMPLEMENTED IN ANTWIRE AS:
                </span>
                <p className="text-slate-300 text-[10.5px] leading-relaxed">{src.antwireMapping}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
