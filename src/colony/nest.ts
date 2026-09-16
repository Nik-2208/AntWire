/**
 * ANT BRAIN — Subterranean & Surface Nest Architecture Graph & Multi-Nest System
 * Multi-chamber graph network with spatial food storage, depth-stratified microclimates,
 * physical builder excavation, soil transport, surface mound dynamics, subnests, and tunnel traffic.
 */

import { ChamberType, NestChamberNode, NestInterconnection, NestTunnelEdge, SubNestNode, SubNestType, Vector2D } from '../simulation/types';
import { SeededRNG } from '../simulation/rng';
import { SimulationEventBus } from '../simulation/events';

export interface NestChamber extends NestChamberNode {}

export class NestStructure {
  public id: string = 'nest-main';
  public name: string = 'Main Colony Hive';
  public entrancePosition: Vector2D;
  public entranceRadius: number = 3.5;
  public chambers: NestChamberNode[] = [];
  public tunnels: NestTunnelEdge[] = [];
  public subnests: SubNestNode[] = [];
  public interconnections: NestInterconnection[] = [];

  public buildingMaterial: number = 15.0; // Excavated soil/resin available for construction
  public materialCapacity: number = 250.0;
  public structuralIntegrity: number = 1.0; // 0 to 1
  public totalExcavationsCompleted: number = 5; // Initial core chambers
  public surfaceSoilMound: number = 2.5; // Units of soil deposited on surface mound
  public totalMaterialExcavated: number = 0.0;

  // Subnest Trigger Settings
  private lastSubnestCheckTick: number = 0;
  private subnestIdCounter: number = 1;

  public get radius(): number {
    return this.entranceRadius;
  }

  constructor(entrancePos: Vector2D = { x: 0, y: 0 }) {
    this.entrancePosition = { ...entrancePos };
    this.initializeDefaultNestGraph();
  }

  private initializeDefaultNestGraph(): void {
    const e = this.entrancePosition;

    // 1. Surface Mound Entrance
    const cEntrance: NestChamberNode = {
      id: 'chamber-entrance',
      name: 'Surface Mound Entrance',
      type: 'ENTRANCE',
      position: { ...e },
      depth: 0.0,
      radius: 3.5,
      maxOccupancy: 30,
      currentOccupancy: 0,
      storedFood: 0,
      foodCapacity: 10,
      volume: 8.0,
      temperature: 24.0,
      humidity: 0.45,
      structuralIntegrity: 1.0,
      safety: 0.85,
      isExcavated: true,
      excavationProgress: 1.0,
    };

    // 2. Central Distribution Hub
    const cCentral: NestChamberNode = {
      id: 'chamber-central',
      name: 'Central Subterranean Hub',
      type: 'GENERAL',
      position: { x: e.x, y: e.y + 1.0 },
      depth: 1.5,
      radius: 4.2,
      maxOccupancy: 35,
      currentOccupancy: 0,
      storedFood: 0,
      foodCapacity: 15,
      volume: 12.0,
      temperature: 23.5,
      humidity: 0.55,
      structuralIntegrity: 1.0,
      safety: 0.92,
      isExcavated: true,
      excavationProgress: 1.0,
    };

    // 3. Subterranean Granary & Food Larder
    const cFood: NestChamberNode = {
      id: 'chamber-food',
      name: 'Subterranean Granary & Food Larder',
      type: 'FOOD_STORAGE',
      position: { x: e.x + 3.2, y: e.y - 1.8 },
      depth: 2.5,
      radius: 4.0,
      maxOccupancy: 15,
      currentOccupancy: 0,
      storedFood: 25.0, // Initial stored food inventory
      foodCapacity: 120.0,
      volume: 12.0,
      temperature: 22.0,
      humidity: 0.6,
      structuralIntegrity: 1.0,
      safety: 0.95,
      isExcavated: true,
      excavationProgress: 1.0,
    };

    // 4. Brood Nursery
    const cNursery: NestChamberNode = {
      id: 'chamber-nursery',
      name: 'Warm Brood Nursery',
      type: 'BROOD_NURSERY',
      position: { x: e.x - 3.5, y: e.y + 1.8 },
      depth: 3.0,
      radius: 4.5,
      maxOccupancy: 20,
      currentOccupancy: 0,
      storedFood: 0,
      foodCapacity: 20,
      volume: 14.0,
      temperature: 26.5,
      humidity: 0.75,
      structuralIntegrity: 1.0,
      safety: 0.98,
      isExcavated: true,
      excavationProgress: 1.0,
    };

    // 5. Queen Sanctum
    const cQueen: NestChamberNode = {
      id: 'chamber-queen',
      name: 'Royal Queen Sanctum',
      type: 'QUEEN_CHAMBER',
      position: { x: e.x - 1.0, y: e.y + 4.2 },
      depth: 4.5,
      radius: 5.0,
      maxOccupancy: 10,
      currentOccupancy: 0,
      storedFood: 0,
      foodCapacity: 15,
      volume: 16.0,
      temperature: 25.0,
      humidity: 0.8,
      structuralIntegrity: 1.0,
      safety: 0.99,
      isExcavated: true,
      excavationProgress: 1.0,
    };

    this.chambers = [cEntrance, cCentral, cFood, cNursery, cQueen];

    // Core Inter-Chamber Tunnels
    this.tunnels = [
      {
        id: 'tunnel-entrance-central',
        fromChamberId: 'chamber-entrance',
        toChamberId: 'chamber-central',
        length: Math.hypot(cCentral.position.x - cEntrance.position.x, cCentral.position.y - cEntrance.position.y),
        width: 1.4,
        isPassable: true,
      },
      {
        id: 'tunnel-central-food',
        fromChamberId: 'chamber-central',
        toChamberId: 'chamber-food',
        length: Math.hypot(cFood.position.x - cCentral.position.x, cFood.position.y - cCentral.position.y),
        width: 1.3,
        isPassable: true,
      },
      {
        id: 'tunnel-central-nursery',
        fromChamberId: 'chamber-central',
        toChamberId: 'chamber-nursery',
        length: Math.hypot(cNursery.position.x - cCentral.position.x, cNursery.position.y - cCentral.position.y),
        width: 1.3,
        isPassable: true,
      },
      {
        id: 'tunnel-nursery-queen',
        fromChamberId: 'chamber-nursery',
        toChamberId: 'chamber-queen',
        length: Math.hypot(cQueen.position.x - cNursery.position.x, cQueen.position.y - cNursery.position.y),
        width: 1.5,
        isPassable: true,
      },
    ];

    // 6. Initial Planned Candidate Satellite Outpost
    this.planSubnest('SATELLITE_FORAGING', { x: e.x + 22.0, y: e.y + 14.0 });
  }

  /**
   * Return all chambers across main nest and established subnests
   */
  public getAllChambers(): NestChamberNode[] {
    const all = [...this.chambers];
    for (const sub of this.subnests) {
      all.push(...sub.chambers);
    }
    return all;
  }

  /**
   * Return all tunnels across main nest and subnests
   */
  public getAllTunnels(): NestTunnelEdge[] {
    const all = [...this.tunnels];
    for (const sub of this.subnests) {
      all.push(...sub.tunnels);
    }
    return all;
  }

  public isInsideNestEntrance(pos: Vector2D): boolean {
    const dx = pos.x - this.entrancePosition.x;
    const dy = pos.y - this.entrancePosition.y;
    if (Math.sqrt(dx * dx + dy * dy) <= this.entranceRadius) return true;

    for (const sub of this.subnests) {
      if (sub.isEstablished || sub.constructionProgress > 0.3) {
        const sdx = pos.x - sub.entrancePosition.x;
        const sdy = pos.y - sub.entrancePosition.y;
        if (Math.sqrt(sdx * sdx + sdy * sdy) <= sub.entranceRadius) return true;
      }
    }
    return false;
  }

  public getClosestNest(pos: Vector2D): { id: string; name: string; position: Vector2D; radius: number; isMain: boolean; isEstablished: boolean } {
    let closest = {
      id: this.id,
      name: this.name,
      position: { ...this.entrancePosition },
      radius: this.entranceRadius,
      isMain: true,
      isEstablished: true,
    };
    let minDist = Math.hypot(pos.x - this.entrancePosition.x, pos.y - this.entrancePosition.y);

    for (const sub of this.subnests) {
      if (sub.isEstablished || sub.constructionProgress > 0.4) {
        const d = Math.hypot(pos.x - sub.entrancePosition.x, pos.y - sub.entrancePosition.y);
        if (d < minDist) {
          minDist = d;
          closest = {
            id: sub.id,
            name: sub.name,
            position: { ...sub.entrancePosition },
            radius: sub.entranceRadius,
            isMain: false,
            isEstablished: sub.isEstablished,
          };
        }
      }
    }

    return closest;
  }

  public get totalStoredFood(): number {
    let sum = this.chambers.reduce((acc, c) => acc + (c.storedFood || 0), 0);
    for (const sub of this.subnests) {
      sum += sub.storedFood || 0;
    }
    return sum;
  }

  /**
   * Spatial Food Deposit: places harvested food into closest available storage chamber
   */
  public depositFoodInStorage(amount: number, nearPos?: Vector2D): { deposited: number; chamberId: string } {
    if (amount <= 0) return { deposited: 0, chamberId: '' };

    const allChambers = this.getAllChambers().filter(
      (c) => c.isExcavated && c.type === 'FOOD_STORAGE' && (c.storedFood || 0) < (c.foodCapacity || 100)
    );

    let targetChamber: NestChamberNode;
    if (allChambers.length > 0) {
      if (nearPos) {
        let minDist = Infinity;
        targetChamber = allChambers[0];
        for (const c of allChambers) {
          const d = Math.hypot(nearPos.x - c.position.x, nearPos.y - c.position.y);
          if (d < minDist) {
            minDist = d;
            targetChamber = c;
          }
        }
      } else {
        targetChamber = allChambers[0];
      }
    } else {
      targetChamber = this.chambers[2] || this.chambers[0];
    }

    const current = targetChamber.storedFood || 0;
    const cap = targetChamber.foodCapacity || 120.0;
    const room = Math.max(0, cap - current);
    const deposited = Math.min(amount, room > 0 ? room : amount);

    targetChamber.storedFood = current + deposited;

    // Sync subnest food if inside subnest
    for (const sub of this.subnests) {
      if (sub.chambers.some((c) => c.id === targetChamber.id)) {
        sub.storedFood = sub.chambers.reduce((acc, c) => acc + (c.storedFood || 0), 0);
      }
    }

    return { deposited, chamberId: targetChamber.id };
  }

  /**
   * Spatial Food Retrieval: hungry ants retrieve stored food from the nearest storage chamber
   */
  public retrieveFoodFromStorage(amount: number, preferNearPos?: Vector2D): { retrieved: number; chamberId?: string; chamberPos?: Vector2D } {
    if (amount <= 0) return { retrieved: 0 };

    const storageChambers = this.getAllChambers().filter((c) => c.isExcavated && (c.storedFood || 0) > 0.05);
    if (storageChambers.length === 0) {
      return { retrieved: 0 };
    }

    let targetChamber = storageChambers[0];
    if (preferNearPos && storageChambers.length > 1) {
      let minDist = Infinity;
      for (const sc of storageChambers) {
        const d = Math.hypot(preferNearPos.x - sc.position.x, preferNearPos.y - sc.position.y);
        if (d < minDist) {
          minDist = d;
          targetChamber = sc;
        }
      }
    }

    const available = targetChamber.storedFood || 0;
    const retrieved = Math.min(amount, available);
    targetChamber.storedFood = Math.max(0, available - retrieved);

    // Sync subnest food
    for (const sub of this.subnests) {
      if (sub.chambers.some((c) => c.id === targetChamber.id)) {
        sub.storedFood = sub.chambers.reduce((acc, c) => acc + (c.storedFood || 0), 0);
      }
    }

    return {
      retrieved,
      chamberId: targetChamber.id,
      chamberPos: { ...targetChamber.position },
    };
  }

  public getClosestFoodStorageChamber(pos: Vector2D): NestChamberNode | undefined {
    const storageChambers = this.getAllChambers().filter((c) => c.isExcavated && (c.storedFood || 0) > 0.05);
    if (storageChambers.length === 0) return undefined;

    let closest = storageChambers[0];
    let minDist = Infinity;
    for (const sc of storageChambers) {
      const d = Math.hypot(pos.x - sc.position.x, pos.y - sc.position.y);
      if (d < minDist) {
        minDist = d;
        closest = sc;
      }
    }
    return closest;
  }

  public getChamberByType(type: ChamberType): NestChamberNode | undefined {
    return this.getAllChambers().find((c) => c.type === type && c.isExcavated);
  }

  public getClosestChamber(pos: Vector2D): NestChamberNode {
    const all = this.getAllChambers();
    let closest = all[0] || this.chambers[0];
    let minDist = Infinity;
    for (const c of all) {
      if (!c.isExcavated) continue;
      const d = Math.hypot(pos.x - c.position.x, pos.y - c.position.y);
      if (d < minDist) {
        minDist = d;
        closest = c;
      }
    }
    return closest;
  }

  /**
   * Deposit excavated soil outside the nest onto the surface mound
   */
  public depositExcavatedSoilOnMound(amount: number): void {
    if (amount > 0) {
      this.surfaceSoilMound += amount;
      this.totalMaterialExcavated += amount;
      this.depositMaterial(amount * 0.6); // Portion converted to usable building material
    }
  }

  /**
   * Add excavated building material to colony supply
   */
  public depositMaterial(amount: number): number {
    const deposited = Math.min(amount, this.materialCapacity - this.buildingMaterial);
    this.buildingMaterial += deposited;
    return deposited;
  }

  /**
   * Physical Chamber Excavation by Builders
   */
  public excavateChamberAt(chamberId: string, workAmount: number, simTime: number, eventBus?: SimulationEventBus): { soilProduced: number; isCompleted: boolean } {
    const allChambers = this.getAllChambers();
    const chamber = allChambers.find((c) => c.id === chamberId);
    if (!chamber || chamber.isExcavated) {
      return { soilProduced: 0, isCompleted: true };
    }

    const progressDelta = workAmount * 0.25;
    chamber.excavationProgress = Math.min(1.0, chamber.excavationProgress + progressDelta);
    chamber.volume = (chamber.volume || 4.0) + progressDelta * 8.0;
    const soilProduced = progressDelta * 2.0;

    if (chamber.excavationProgress >= 1.0) {
      chamber.isExcavated = true;
      this.totalExcavationsCompleted++;

      // Connect to nearest existing excavated chamber via tunnel
      const existingChambers = allChambers.filter((c) => c.isExcavated && c.id !== chamber.id);
      let nearest = existingChambers[0];
      let minDist = Infinity;
      for (const ex of existingChambers) {
        const d = Math.hypot(chamber.position.x - ex.position.x, chamber.position.y - ex.position.y);
        if (d < minDist) {
          minDist = d;
          nearest = ex;
        }
      }

      if (nearest) {
        this.tunnels.push({
          id: `tunnel-${nearest.id}-${chamber.id}`,
          fromChamberId: nearest.id,
          toChamberId: chamber.id,
          length: Math.hypot(chamber.position.x - nearest.position.x, chamber.position.y - nearest.position.y),
          width: 1.2,
          isPassable: true,
        });
      }

      if (eventBus) {
        eventBus.emit({
          type: 'NEST_EXPANDED' as any,
          timestamp: simTime,
          entityId: chamber.id,
          colonyId: 'colony-0',
          data: {
            chamberId: chamber.id,
            name: chamber.name,
            type: chamber.type,
            depth: chamber.depth,
          },
        });
      }
      return { soilProduced, isCompleted: true };
    }

    return { soilProduced, isCompleted: false };
  }

  /**
   * Advances construction across uncompleted chambers or active subnests
   */
  public advanceConstruction(amount: number, simTime: number, eventBus?: SimulationEventBus, rng?: SeededRNG, targetMode?: 'core' | 'subnest' | 'auto'): boolean {
    if (this.buildingMaterial < 0.3) return false;

    // If subnest mode explicitly requested
    if (targetMode === 'subnest') {
      const unbuiltSubnest = this.subnests.find((s) => !s.isEstablished);
      if (unbuiltSubnest) {
        const subResult = this.advanceSubnestConstruction(unbuiltSubnest.id, amount, simTime, eventBus);
        return subResult.isEstablished;
      }
    }

    // 1. Check if any core chamber is unexcavated or plan new core chamber
    let targetChamber: NestChamberNode | null | undefined = this.chambers.find((c) => !c.isExcavated);

    if (!targetChamber && targetMode !== 'subnest') {
      targetChamber = this.planNewChamberExpansion(rng);
      if (targetChamber) {
        this.chambers.push(targetChamber);
      }
    }

    if (targetChamber) {
      const materialCost = Math.min(amount * 0.3, this.buildingMaterial);
      this.buildingMaterial = Math.max(0, this.buildingMaterial - materialCost);
      const { soilProduced, isCompleted } = this.excavateChamberAt(targetChamber.id, amount, simTime, eventBus);
      if (soilProduced > 0) {
        this.depositExcavatedSoilOnMound(soilProduced);
      }
      return isCompleted;
    }

    // 2. If core chambers are full and auto mode, progress active subnest
    const unbuiltSubnest = this.subnests.find((s) => !s.isEstablished);
    if (unbuiltSubnest) {
      const subResult = this.advanceSubnestConstruction(unbuiltSubnest.id, amount, simTime, eventBus);
      return subResult.isEstablished;
    }

    return false;
  }

  public planNewChamberExpansion(rng?: SeededRNG): NestChamberNode | null {
    const candidateTypes: { type: ChamberType; name: string; depth: number }[] = [
      { type: 'FUNGUS_GARDEN', name: 'Subterranean Fungal Garden Crypt', depth: 3.5 },
      { type: 'LEAF_PROCESSING', name: 'Vegetation Mastication Chamber', depth: 2.0 },
      { type: 'MIDDEN_REFUSE', name: 'Deep Subterranean Midden Vault', depth: 4.8 },
      { type: 'VENTILATION_SHAFT', name: 'Convective Aeration Shaft', depth: 1.0 },
      { type: 'REST_AREA', name: 'Subterranean Rest Gallery', depth: 3.2 },
      { type: 'WATER_STORAGE', name: 'Hydration Reservoir Vault', depth: 3.8 },
      { type: 'DEFENSE', name: 'Sentry Defense Outpost', depth: 1.2 },
      { type: 'WASTE_AREA', name: 'Refuse & Middens Chamber', depth: 2.2 },
      { type: 'FOOD_STORAGE', name: 'Secondary Granary Silo', depth: 2.8 },
    ];

    const unbuilt = candidateTypes.find((cand) => !this.chambers.some((c) => c.type === cand.type));
    const chosen = unbuilt || candidateTypes[0];

    const angle = rng ? rng.range(0, Math.PI * 2) : Math.random() * Math.PI * 2;
    const distance = rng ? rng.range(4.5, 7.5) : 5.5;

    return {
      id: `chamber-${chosen.type.toLowerCase()}-${Date.now().toString(36).slice(-4)}`,
      name: chosen.name,
      type: chosen.type,
      position: {
        x: this.entrancePosition.x + Math.cos(angle) * distance,
        y: this.entrancePosition.y + Math.sin(angle) * distance,
      },
      depth: chosen.depth,
      radius: 3.5,
      maxOccupancy: 15,
      currentOccupancy: 0,
      storedFood: 0,
      foodCapacity: chosen.type === 'FOOD_STORAGE' ? 80.0 : 10.0,
      volume: 6.0,
      temperature: 23.0 + chosen.depth * 0.5,
      humidity: 0.65 + chosen.depth * 0.05,
      structuralIntegrity: 1.0,
      safety: 0.9,
      isExcavated: false,
      excavationProgress: 0.0,
    };
  }

  /**
   * Plan and establish a candidate Subnest Construction Site
   */
  public planSubnest(
    type: SubNestType,
    targetPos: Vector2D,
    rng?: SeededRNG
  ): SubNestNode {
    // Safety clamp within playable terrain boundaries
    const safePos: Vector2D = {
      x: Math.max(-30.0, Math.min(30.0, targetPos.x)),
      y: Math.max(-30.0, Math.min(30.0, targetPos.y)),
    };
    const subId = `subnest-${this.subnestIdCounter++}`;
    const distToMain = Math.hypot(safePos.x - this.entrancePosition.x, safePos.y - this.entrancePosition.y);

    const typeNames: Record<SubNestType, string> = {
      SATELLITE_FORAGING: 'Foraging Satellite Outpost',
      PERIPHERAL_SHELTER: 'Peripheral Frontier Shelter',
      BROOD_EXPANSION: 'Secondary Nursery Hive',
      SECONDARY_HIVE: 'Autonomous Sister Colony Nest',
      SENTRY_OUTPOST: 'Perimeter Sentry Outpost',
    };

    const subEntranceChamber: NestChamberNode = {
      id: `${subId}-chamber-entrance`,
      name: `${typeNames[type]} Entrance`,
      type: 'ENTRANCE',
      position: { ...safePos },
      depth: 0.0,
      radius: 2.8,
      maxOccupancy: 20,
      currentOccupancy: 0,
      storedFood: 0,
      foodCapacity: 10,
      volume: 6.0,
      temperature: 24.0,
      humidity: 0.45,
      structuralIntegrity: 1.0,
      safety: 0.88,
      isExcavated: false,
      excavationProgress: 0.1,
    };

    const subGranaryChamber: NestChamberNode = {
      id: `${subId}-chamber-granary`,
      name: `${typeNames[type]} Granary`,
      type: 'FOOD_STORAGE',
      position: { x: safePos.x + 2.0, y: safePos.y - 1.5 },
      depth: 2.0,
      radius: 3.2,
      maxOccupancy: 12,
      currentOccupancy: 0,
      storedFood: 0,
      foodCapacity: 60.0,
      volume: 8.0,
      temperature: 22.5,
      humidity: 0.6,
      structuralIntegrity: 1.0,
      safety: 0.92,
      isExcavated: false,
      excavationProgress: 0.0,
    };

    const subRestChamber: NestChamberNode = {
      id: `${subId}-chamber-rest`,
      name: `${typeNames[type]} Rest Gallery`,
      type: type === 'BROOD_EXPANSION' ? 'BROOD_NURSERY' : 'REST_AREA',
      position: { x: safePos.x - 2.0, y: safePos.y + 1.5 },
      depth: 2.5,
      radius: 3.2,
      maxOccupancy: 15,
      currentOccupancy: 0,
      storedFood: 0,
      foodCapacity: 10,
      volume: 8.0,
      temperature: 25.0,
      humidity: 0.7,
      structuralIntegrity: 1.0,
      safety: 0.94,
      isExcavated: false,
      excavationProgress: 0.0,
    };

    const internalTunnels: NestTunnelEdge[] = [
      {
        id: `tunnel-${subId}-entrance-granary`,
        fromChamberId: subEntranceChamber.id,
        toChamberId: subGranaryChamber.id,
        length: Math.hypot(subGranaryChamber.position.x - subEntranceChamber.position.x, subGranaryChamber.position.y - subEntranceChamber.position.y),
        width: 1.1,
        isPassable: false,
      },
      {
        id: `tunnel-${subId}-entrance-rest`,
        fromChamberId: subEntranceChamber.id,
        toChamberId: subRestChamber.id,
        length: Math.hypot(subRestChamber.position.x - subEntranceChamber.position.x, subRestChamber.position.y - subEntranceChamber.position.y),
        width: 1.1,
        isPassable: false,
      },
    ];

    const subnest: SubNestNode = {
      id: subId,
      name: `${typeNames[type]} #${this.subnests.length + 1}`,
      type,
      entrancePosition: { ...safePos },
      entranceRadius: 2.8,
      isEstablished: false,
      constructionProgress: 0.05,
      buildingMaterial: 0,
      storedFood: 0,
      foodCapacity: 70.0,
      maxOccupancy: 45,
      currentOccupancy: 0,
      chambers: [subEntranceChamber, subGranaryChamber, subRestChamber],
      tunnels: internalTunnels,
      parentNestId: this.id,
      distanceToMainNest: distToMain,
      activeBuilders: 0,
    };

    // Create Interconnection Tunnel Edge connecting Main Nest to Subnest
    const interConn: NestInterconnection = {
      id: `interconnect-main-${subId}`,
      fromNestId: this.id,
      toNestId: subId,
      fromPosition: { ...this.entrancePosition },
      toPosition: { ...safePos },
      length: distToMain,
      width: 1.3,
      isExcavated: false,
      progress: 0.05,
    };

    this.subnests.push(subnest);
    this.interconnections.push(interConn);

    return subnest;
  }

  /**
   * Advance construction of a Subnest
   */
  public advanceSubnestConstruction(
    subnestId: string,
    workAmount: number,
    simTime: number,
    eventBus?: SimulationEventBus
  ): { progress: number; isEstablished: boolean } {
    const sub = this.subnests.find((s) => s.id === subnestId);
    if (!sub) return { progress: 0, isEstablished: false };

    const progressDelta = workAmount * 0.12;
    sub.constructionProgress = Math.min(1.0, sub.constructionProgress + progressDelta);

    // Progress individual chambers inside subnest
    for (const ch of sub.chambers) {
      if (!ch.isExcavated) {
        ch.excavationProgress = Math.min(1.0, ch.excavationProgress + progressDelta * 1.5);
        if (ch.excavationProgress >= 1.0) {
          ch.isExcavated = true;
        }
      }
    }

    // Progress interconnecting tunnel
    const interConn = this.interconnections.find((c) => c.toNestId === subnestId);
    if (interConn) {
      interConn.progress = sub.constructionProgress;
      if (interConn.progress >= 0.8) {
        interConn.isExcavated = true;
      }
    }

    // Establish subnest once progress is sufficient
    if (sub.constructionProgress >= 1.0 && !sub.isEstablished) {
      sub.isEstablished = true;
      for (const t of sub.tunnels) {
        t.isPassable = true;
      }
      for (const ch of sub.chambers) {
        ch.isExcavated = true;
      }

      if (eventBus) {
        eventBus.emit({
          type: 'SUBNEST_ESTABLISHED' as any,
          timestamp: simTime,
          entityId: sub.id,
          colonyId: 'colony-0',
          data: {
            subnestId: sub.id,
            name: sub.name,
            type: sub.type,
            position: sub.entrancePosition,
            distance: sub.distanceToMainNest,
          },
        });
      }
      return { progress: 1.0, isEstablished: true };
    }

    return { progress: sub.constructionProgress, isEstablished: sub.isEstablished };
  }

  /**
   * Check colony conditions and trigger autonomous subnest construction
   */
  public checkSubnestTrigger(
    tick: number,
    simTime: number,
    population: number,
    totalFood: number,
    foodClusters: { position: Vector2D; amount: number }[],
    eventBus?: SimulationEventBus,
    rng?: SeededRNG
  ): SubNestNode | null {
    // Only check every 120 ticks
    if (tick - this.lastSubnestCheckTick < 120) return null;
    this.lastSubnestCheckTick = tick;

    // Do not exceed 4 active subnests
    if (this.subnests.length >= 4) return null;

    // Condition 1: Overcrowding (population > 14 + subnests*8)
    // Condition 2: Food Prosperity (totalFood > 45.0 + subnests*30)
    // Condition 3: Distant food patch needing satellite outpost
    const popThreshold = 14 + this.subnests.length * 8;
    const foodThreshold = 45.0 + this.subnests.length * 30;

    const isOvercrowded = population >= popThreshold;
    const isProsperous = totalFood >= foodThreshold;

    // Check for distant food cluster (> 16m from main nest and not already near existing subnest)
    const distantFood = foodClusters.find((f) => {
      const dMain = Math.hypot(f.position.x - this.entrancePosition.x, f.position.y - this.entrancePosition.y);
      if (dMain < 16.0 || dMain > 45.0) return false;
      // Must not be within 12m of an existing subnest
      return !this.subnests.some((s) => Math.hypot(f.position.x - s.entrancePosition.x, f.position.y - s.entrancePosition.y) < 12.0);
    });

    const hasViableColony = population >= 10 || totalFood >= 25.0;
    if (!isOvercrowded && !isProsperous && !(distantFood && hasViableColony)) return null;

    // Find candidate location near distant food patch or peripheral frontier
    let targetPos: Vector2D | null = null;
    let chosenType: SubNestType = 'SATELLITE_FORAGING';

    if (distantFood) {
      chosenType = 'SATELLITE_FORAGING';
      // Offset slightly from food cluster
      const angle = rng ? rng.range(0, Math.PI * 2) : Math.random() * Math.PI * 2;
      targetPos = {
        x: distantFood.position.x + Math.cos(angle) * 4.0,
        y: distantFood.position.y + Math.sin(angle) * 4.0,
      };
    } else if (isOvercrowded) {
      chosenType = this.subnests.length === 0 ? 'PERIPHERAL_SHELTER' : 'BROOD_EXPANSION';
      const angle = (this.subnests.length * (Math.PI * 2 / 3)) + (rng ? rng.range(-0.3, 0.3) : 0);
      const dist = rng ? rng.range(18.0, 26.0) : 22.0;
      targetPos = {
        x: this.entrancePosition.x + Math.cos(angle) * dist,
        y: this.entrancePosition.y + Math.sin(angle) * dist,
      };
    }

    if (!targetPos) return null;

    // Ensure valid distance
    const dist = Math.hypot(targetPos.x - this.entrancePosition.x, targetPos.y - this.entrancePosition.y);
    if (dist < 12.0 || dist > 45.0) return null;

    const newSubnest = this.planSubnest(chosenType, targetPos, rng);

    if (eventBus) {
      eventBus.emit({
        type: 'SUBNEST_PLANNED' as any,
        timestamp: simTime,
        entityId: newSubnest.id,
        colonyId: 'colony-0',
        data: {
          subnestId: newSubnest.id,
          name: newSubnest.name,
          type: newSubnest.type,
          position: newSubnest.entrancePosition,
          distance: newSubnest.distanceToMainNest,
        },
      });
    }

    return newSubnest;
  }

  /**
   * Applies damage to nest chambers
   */
  public applyDamage(amount: number): void {
    this.structuralIntegrity = Math.max(0, this.structuralIntegrity - amount);
    for (const c of this.getAllChambers()) {
      c.structuralIntegrity = Math.max(0.1, c.structuralIntegrity - amount * 0.5);
    }
  }

  public repair(amount: number): void {
    this.structuralIntegrity = Math.min(1.0, this.structuralIntegrity + amount);
    for (const c of this.getAllChambers()) {
      c.structuralIntegrity = Math.min(1.0, c.structuralIntegrity + amount);
    }
  }
}

