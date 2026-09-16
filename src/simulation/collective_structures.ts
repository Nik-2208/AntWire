/**
 * ANT BRAIN — Collective Structures & Living Scaffolds
 *
 * Biological foundation:
 * Self-assembling living bridges, chains, bivouacs, and acrobatic climbing towers
 * documented in Eciton burchellii, Linepithema humile, and Atta cephalotes.
 *
 * Mechanistic principles:
 * - Distributed local sensing: ants detect physical gaps (voids/drops) and vertical heights.
 * - Dynamic recruitment: ants stop, interlock mandibles and tarsal claws with neighbor ants.
 * - Physical properties: each participant contributes anchor points, orientation, load capacity,
 *   tensile stability, and metabolic energy cost.
 * - Traffic adaptation: bridge widens or shifts to maximize traffic flow (Reid et al., 2015 PNAS).
 * - Dissolution: when transit traffic subsides, participants disengage and resume individual tasks.
 */

export interface BridgeAnchor {
  x: number;
  y: number;
  z: number;
  type: 'SUBSTRATE' | 'HIGH_FOOD_PLATFORM' | 'GAP_EDGE';
  label: string;
}

export interface BridgeParticipant {
  antId: string;
  orderIndex: number; // Position in chain
  linkPosition: [number, number, number]; // [x, y, z]
  gripStrength: number; // 0.0 to 1.0 based on caste (Majors/Media have higher grip)
  joinedTimestamp: number;
  loadBorne: number; // Real-time weight of ants traversing over this ant
  energyCostPerSecond: number; // Isometric muscular contraction cost
}

export type StructureType =
  | 'HORIZONTAL_BRIDGE'   // Spanning gaps/ravines
  | 'VERTICAL_TOWER'       // Reaching elevated canopy/leaves
  | 'ANCHOR_CLUSTER';     // Stabilization knot

export interface CollectiveStructure {
  id: string;
  type: StructureType;
  startAnchor: BridgeAnchor;
  targetAnchor: BridgeAnchor;
  participants: BridgeParticipant[];
  maxTraversableWeight: number; // Maximum simultaneous cargo before structural failure
  currentTrafficCount: number;  // Number of ants currently traversing across the living bridge
  isStable: boolean;
  createdAt: number;
  lastTraversedAt: number;
  dissolutionTimer: number; // Countdown to disband when idle (seconds)
}

export class CollectiveStructureManager {
  private structures: Map<string, CollectiveStructure> = new Map();
  private antToStructureMap: Map<string, string> = new Map();

  /**
   * Evaluates whether an ant can initiate or join a collective living structure.
   */
  public evaluateGapCrossing(
    antId: string,
    antPos: [number, number, number],
    gapVector: [number, number, number],
    casteGrip: number = 0.8
  ): { action: 'JOIN' | 'INITIATE' | 'TRAVERSE' | 'NONE'; structureId?: string } {
    const gapDist = Math.hypot(gapVector[0], gapVector[1]);

    // Check if an existing bridge already spans this region
    for (const [id, struct] of this.structures) {
      const distToStart = Math.hypot(antPos[0] - struct.startAnchor.x, antPos[1] - struct.startAnchor.y);
      const distToEnd = Math.hypot(antPos[0] - struct.targetAnchor.x, antPos[1] - struct.targetAnchor.y);

      if (distToStart < 30 || distToEnd < 30) {
        if (struct.isStable) {
          return { action: 'TRAVERSE', structureId: id };
        } else if (struct.participants.length < 12) {
          return { action: 'JOIN', structureId: id };
        }
      }
    }

    // If gap is between 25 and 150 units, ant can initiate a bridge
    if (gapDist >= 25 && gapDist <= 150) {
      return { action: 'INITIATE' };
    }

    return { action: 'NONE' };
  }

  /**
   * Creates a new collective structure initiated by an ant.
   */
  public initiateStructure(
    type: StructureType,
    startAnchor: BridgeAnchor,
    targetAnchor: BridgeAnchor,
    initiatorAntId: string,
    casteGrip: number = 0.8,
    currentTime: number = 0
  ): CollectiveStructure {
    const id = `struct-${type.toLowerCase()}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const participant: BridgeParticipant = {
      antId: initiatorAntId,
      orderIndex: 0,
      linkPosition: [startAnchor.x, startAnchor.y, startAnchor.z],
      gripStrength: casteGrip,
      joinedTimestamp: currentTime,
      loadBorne: 0,
      energyCostPerSecond: 0.05 * (1.2 - casteGrip * 0.4),
    };

    const newStruct: CollectiveStructure = {
      id,
      type,
      startAnchor,
      targetAnchor,
      participants: [participant],
      maxTraversableWeight: casteGrip * 15.0,
      currentTrafficCount: 0,
      isStable: false, // Requires at least min participants to be fully traversable
      createdAt: currentTime,
      lastTraversedAt: currentTime,
      dissolutionTimer: 10.0, // 10 seconds of inactivity before dissolving
    };

    this.structures.set(id, newStruct);
    this.antToStructureMap.set(initiatorAntId, id);
    return newStruct;
  }

  /**
   * Adds an ant to an existing living structure.
   */
  public joinStructure(
    structureId: string,
    antId: string,
    casteGrip: number = 0.8,
    currentTime: number = 0
  ): boolean {
    const struct = this.structures.get(structureId);
    if (!struct) return false;

    // Check if ant is already bound
    if (this.antToStructureMap.has(antId)) return false;

    const n = struct.participants.length;
    const progress = Math.min(1.0, (n + 1) / 5.0);

    const linkX = struct.startAnchor.x + (struct.targetAnchor.x - struct.startAnchor.x) * progress;
    const linkY = struct.startAnchor.y + (struct.targetAnchor.y - struct.startAnchor.y) * progress;
    const linkZ = struct.startAnchor.z + (struct.targetAnchor.z - struct.startAnchor.z) * progress;

    const participant: BridgeParticipant = {
      antId,
      orderIndex: n,
      linkPosition: [linkX, linkY, linkZ],
      gripStrength: casteGrip,
      joinedTimestamp: currentTime,
      loadBorne: 0,
      energyCostPerSecond: 0.05 * (1.2 - casteGrip * 0.4),
    };

    struct.participants.push(participant);
    struct.maxTraversableWeight += casteGrip * 12.0;

    // A structure becomes stable when it has at least 3 ants bridging the span
    if (struct.participants.length >= 3) {
      struct.isStable = true;
    }

    this.antToStructureMap.set(antId, structureId);
    return true;
  }

  /**
   * Records traversal across the structure by a passing worker.
   */
  public recordTraversal(structureId: string, cargoWeight: number = 1.0, currentTime: number = 0): boolean {
    const struct = this.structures.get(structureId);
    if (!struct || !struct.isStable) return false;

    struct.currentTrafficCount++;
    struct.lastTraversedAt = currentTime;
    struct.dissolutionTimer = 10.0; // Reset dissolution timer upon active use

    // Distribute load across participants
    const loadShare = cargoWeight / Math.max(1, struct.participants.length);
    for (const p of struct.participants) {
      p.loadBorne += loadShare;
    }
    return true;
  }

  /**
   * Releases an ant when it finishes walking over the bridge.
   */
  public finishTraversal(structureId: string): void {
    const struct = this.structures.get(structureId);
    if (struct && struct.currentTrafficCount > 0) {
      struct.currentTrafficCount--;
      if (struct.currentTrafficCount === 0) {
        for (const p of struct.participants) {
          p.loadBorne = 0;
        }
      }
    }
  }

  /**
   * Simulation tick for collective structures: handles metabolic energy drain,
   * inactivity timeouts, and autonomous dissolution.
   */
  public tick(deltaTimeSeconds: number, currentTime: number): { dissolvedAntIds: string[] } {
    const dissolvedAntIds: string[] = [];
    const structuresToDelete: string[] = [];

    for (const [id, struct] of this.structures) {
      // If no traffic is crossing and structure has aged past idle limit, count down dissolution
      if (struct.currentTrafficCount === 0) {
        struct.dissolutionTimer -= deltaTimeSeconds;
        if (struct.dissolutionTimer <= 0) {
          // Dissolve structure
          for (const p of struct.participants) {
            this.antToStructureMap.delete(p.antId);
            dissolvedAntIds.push(p.antId);
          }
          structuresToDelete.push(id);
        }
      }
    }

    for (const id of structuresToDelete) {
      this.structures.delete(id);
    }

    return { dissolvedAntIds };
  }

  public isAntInStructure(antId: string): boolean {
    return this.antToStructureMap.has(antId);
  }

  public getStructure(structureId: string): CollectiveStructure | undefined {
    return this.structures.get(structureId);
  }

  public getAllStructures(): CollectiveStructure[] {
    return Array.from(this.structures.values());
  }

  public clear(): void {
    this.structures.clear();
    this.antToStructureMap.clear();
  }
}
