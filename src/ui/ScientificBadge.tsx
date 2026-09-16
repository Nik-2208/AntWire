/**
 * ANTWIRE — Scientific Taxonomy Badge & Interactive Biological Fact Popover
 * Powered by centralized BiologyInfoPopup.
 */

import React from 'react';
import { ScientificClassification } from '../simulation/types';
import { BiologyInfoPopup } from './BiologyInfoPopup';

interface ScientificBadgeProps {
  category: ScientificClassification | string;
  label?: string;
  tooltip?: string;
  citation?: string;
  sourceUrl?: string;
  className?: string;
}

export const ScientificBadge: React.FC<ScientificBadgeProps> = ({
  category,
  label,
  className = '',
}) => {
  // Map category and label to the most relevant centralized knowledge topic
  const resolveTopicId = (): string => {
    const l = (label || '').toLowerCase();
    if (l.includes('polyandry') || l.includes('queen') || l.includes('mating')) {
      return 'nuptial_flight_founding';
    }
    if (l.includes('attine') || l.includes('agriculture') || l.includes('fungus')) {
      return 'fungus_agriculture';
    }
    if (l.includes('polymorphism') || l.includes('caste')) {
      return 'caste_polymorphism';
    }
    if (l.includes('neuroanatomy') || l.includes('brain') || l.includes('atlas')) {
      return 'olfactory_glomeruli';
    }
    if (l.includes('antenna') || l.includes('sensor')) {
      return 'antennae_sensing';
    }
    if (l.includes('navigation') || l.includes('compass')) {
      return 'central_complex_navigation';
    }
    if (l.includes('learning') || l.includes('memory')) {
      return 'mushroom_body_learning';
    }
    if (l.includes('pheromone') || l.includes('trail')) {
      return 'pheromones_trail_following';
    }

    switch (category) {
      case 'BIOLOGICAL_FACT':
      case 'ESTABLISHED':
        return 'pheromones_trail_following';
      case 'BIOLOGICAL_INSPIRATION':
      case 'SUPPORTED':
        return 'response_threshold_labor';
      case 'COMPUTATIONAL_ABSTRACTION':
      case 'MODELLED':
        return 'lif_spiking_dynamics';
      case 'ENGINEERING_DECISION':
        return 'flywire_connectomics';
      case 'HYPOTHESIS':
      case 'SPECULATIVE':
        return 'caste_polymorphism';
      case 'MEASURED':
        return 'olfactory_glomeruli';
      case 'RECONSTRUCTED':
        return 'central_complex_navigation';
      case 'INFERRED':
        return 'mushroom_body_learning';
      case 'SPECIES_SPECIFIC':
        return 'caste_polymorphism';
      default:
        return 'antennae_sensing';
    }
  };

  const topicId = resolveTopicId();
  const displayLabel = label || category.replace(/_/g, ' ');

  return (
    <BiologyInfoPopup
      topicId={topicId}
      label={displayLabel}
      variant="badge"
      className={className}
      showIcon={true}
    />
  );
};
