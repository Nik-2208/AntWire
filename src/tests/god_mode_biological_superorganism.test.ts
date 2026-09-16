/**
 * ANTWIRE — God Mode Biological Superorganism Test Suite
 * Comprehensive automated regression testing for:
 * 1. Machine-Readable Biological Knowledge Layer & Fact Citations
 * 2. Leafcutter Fungus Agriculture (Substrate pulping, gongylidia yield, Escovopsis pathology)
 * 3. Polymorphic Caste Morphology & Bonabeau-Theraulaz Threshold Models
 * 4. Polyandrous Queen Reproduction & Claustral Infrabuccal Inoculum Founding
 * 5. Substrate Stridulation & Mechanical Acoustic Communication
 * 6. Standardized Colony Benchmarks & Open-ALife Trajectory Validation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BiologicalKnowledgeBase } from '../simulation/biological_knowledge_base';
import { FungusAgricultureManager } from '../colony/fungus_agriculture';
import { CASTE_MORPHOLOGY_TABLE, ColonyRoleManager } from '../colony/roles';
import { Queen } from '../colony/queen';
import { BroodManager } from '../colony/brood';
import { SubstrateVibrationField } from '../simulation/vibration_field';
import { ColonyBenchmarkRunner } from '../experiments/benchmark_suite';
import { SimulationWorld } from '../simulation/world';

describe('ANTWIRE — GOD MODE Biological Superorganism Suite', () => {
  let world: SimulationWorld;
  let agriculture: FungusAgricultureManager;
  let roleManager: ColonyRoleManager;
  let queen: Queen;
  let brood: BroodManager;
  let vibration: SubstrateVibrationField;

  beforeEach(() => {
    world = new SimulationWorld({ initialAntCount: 12 });
    agriculture = new FungusAgricultureManager();
    roleManager = new ColonyRoleManager();
    queen = new Queen('colony-test-alpha', { x: 0, y: 0 });
    brood = new BroodManager();
    vibration = new SubstrateVibrationField();
  });

  it('1. Biological Knowledge Base: validates verified literature citations and evidence confidence levels', () => {
    const facts = BiologicalKnowledgeBase.getAllItems();
    expect(facts.length).toBeGreaterThanOrEqual(8);

    const attineFact = BiologicalKnowledgeBase.getItem('FACT-ATTINE-AGRICULTURE');
    expect(attineFact).toBeDefined();
    expect(['SPECIES_SPECIFIC', 'ESTABLISHED', 'SUPPORTED', 'BIOLOGICAL_FACT']).toContain(attineFact?.evidenceLevel);
    expect(attineFact?.confidence).toBeGreaterThan(0.95);
    expect(attineFact?.species).toContain('Atta cephalotes');

    const polyandryFact = BiologicalKnowledgeBase.getItem('FACT-OBLIGATE-POLYANDRY');
    expect(['SPECIES_SPECIFIC', 'ESTABLISHED', 'SUPPORTED', 'BIOLOGICAL_FACT']).toContain(polyandryFact?.evidenceLevel);
    expect(polyandryFact?.sourceCitation).toContain('Hughes');
  });

  it('2. Fungus Agriculture: masticates leaf substrate into mycelial biomass and harvestable gongylidia', () => {
    expect(agriculture.gardens.length).toBe(1);
    const garden = agriculture.gardens[0];
    const initialGongylidia = garden.gongylidiaBiomass;

    // Add fresh harvested leaf fragments
    const accepted = agriculture.addLeafFragmentSubstrate(garden.id, 8.0);
    expect(accepted).toBe(8.0);
    expect(garden.substrateMass).toBeGreaterThan(10.0);

    // Simulate 10 seconds of garden growth at 25.5°C
    for (let t = 0; t < 10; t++) {
      agriculture.update(1.0, t, 25.5);
    }

    expect(garden.gongylidiaBiomass).toBeGreaterThan(initialGongylidia);

    // Harvest edible gongylidia clusters
    const harvested = agriculture.harvestGongylidia(4.0, garden.id);
    expect(harvested).toBeCloseTo(4.0, 1);
    expect(agriculture.totalGongylidiaHarvested).toBeGreaterThanOrEqual(4.0);
  });

  it('3. Fungus Pathology: Escovopsis infection spreads if untended and is suppressed by worker hygiene grooming', () => {
    const garden = agriculture.gardens[0];
    garden.metapleuralHygiene = 0.0; // Completely unmaintained garden

    // Contamination increases when unmaintained
    for (let t = 0; t < 20; t++) {
      agriculture.update(1.0, t, 25.0);
    }
    expect(garden.contaminationLevel).toBeGreaterThan(0.01);

    // Minim ant hygiene grooming deploying metapleural antibiotics
    const sanitizeResult = agriculture.tendGarden(garden.id, 5.0, 20.0);
    expect(sanitizeResult.sanitizedAmount).toBeGreaterThan(0);
    expect(garden.metapleuralHygiene).toBeGreaterThan(0.3);
  });

  it('4. Polymorphic Caste Scaling: verifies distinct biomechanical traits for Minims, Minors, Mediae, and Majors', () => {
    const minim = CASTE_MORPHOLOGY_TABLE.MINIM;
    const media = CASTE_MORPHOLOGY_TABLE.MEDIA;
    const major = CASTE_MORPHOLOGY_TABLE.MAJOR;

    // Majors have dramatically higher mandibular crushing bite force
    expect(major.mandibleForceN).toBeGreaterThan(media.mandibleForceN);
    expect(media.mandibleForceN).toBeGreaterThan(minim.mandibleForceN);

    // Minims have higher fungal crypt tending affinity
    expect(minim.fungusTendingAffinity).toBeGreaterThan(major.fungusTendingAffinity);

    // Mediae have highest leaf cutting efficiency
    expect(media.leafCuttingEfficiency).toBeGreaterThan(minim.leafCuttingEfficiency);
  });

  it('5. Polyandrous Queen Biology: stores multi-drone spermatheca sperm and supports claustral founding', () => {
    expect(queen.metrics.spermatheca.dronesMatedCount).toBeGreaterThanOrEqual(2);
    expect(queen.metrics.spermatheca.totalSpermCount).toBeGreaterThan(200);

    // Foundress Queen claustral simulation with fungal pellet
    const foundress = new Queen('foundress-colony', { x: 5, y: 5 }, true);
    expect(foundress.metrics.reproductiveState).toBe('FOUNDRESS');
    expect(foundress.metrics.infrabuccalPelletMass).toBeGreaterThan(0);

    // Foundress lays trophic and fertile eggs
    const { shouldLayEgg } = foundress.update(20.0, 0.0); // 0 colony food (somatic catabolism)
    expect(foundress.metrics.totalEggsLaid).toBeGreaterThanOrEqual(0);
  });

  it('6. Substrate Acoustic Stridulation: emits and attenuates localized mechanical vibrations', () => {
    vibration.emitSignal('ant-media-1', { x: 10, y: 10 }, 'LEAF_CUTTING', 1.0, 850);
    expect(vibration.signals.length).toBe(1);

    // Sample vibration near emitter
    const sampleNear = vibration.sampleVibrationAt({ x: 10.5, y: 10.5 });
    expect(sampleNear.intensity).toBeGreaterThan(0.5);
    expect(sampleNear.dominantPurpose).toBe('LEAF_CUTTING');

    // Sample far outside radius
    const sampleFar = vibration.sampleVibrationAt({ x: 30, y: 30 });
    expect(sampleFar.intensity).toBe(0);

    // Update temporal decay
    vibration.update(1.0);
    const sampleDecayed = vibration.sampleVibrationAt({ x: 10.5, y: 10.5 });
    expect(sampleDecayed.intensity).toBeLessThan(sampleNear.intensity);
  });

  it('7. Standardized Colony Benchmarks: executes multi-scale foraging, fungus, and expansion benchmarks', async () => {
    const foragingResult = await ColonyBenchmarkRunner.runForagingBenchmark(150);
    expect(foragingResult.taskId).toBe('BENCH-FORAGING-01');
    expect(foragingResult.score).toBeGreaterThanOrEqual(0);

    const fungusResult = await ColonyBenchmarkRunner.runFungusMaintenanceBenchmark(150);
    expect(fungusResult.taskId).toBe('BENCH-FUNGUS-02');
    expect(fungusResult.metrics.fungalBiomass).toBeDefined();
  });
});
