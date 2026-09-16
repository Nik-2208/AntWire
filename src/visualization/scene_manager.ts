/**
 * ANTWIRE — 3D Scene Manager & Multi-Camera Rendering Engine
 * Conservative, high-visibility, lightweight WebGL pipeline designed for low-end hardware.
 */

import * as THREE from 'three';
import { SimulationWorld } from '../simulation/world';
import { Ant3DModel } from './ant_model';
import { PheromoneOverlay } from './pheromone_overlay';
import { Ant } from '../ants/ant';

export type CameraViewMode = 'ORBIT' | 'FOLLOW_ANT' | 'FIRST_PERSON' | 'TOP_DOWN' | 'QUEEN_CHAMBER';
export type RenderQuality = 'LOW' | 'MEDIUM' | 'HIGH';

export interface RendererDiagnostics {
  status: 'WebGL2' | 'WebGL1' | 'FALLBACK_2D' | 'ERROR';
  quality: RenderQuality;
  fps: number;
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
  errorMessage?: string;
}

export class SceneManager {
  public container: HTMLElement;
  public world: SimulationWorld;

  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer | null = null;
  public viewMode: CameraViewMode = 'ORBIT';
  public quality: RenderQuality = 'LOW';
  public rendererStatus: 'WebGL2' | 'WebGL1' | 'FALLBACK_2D' | 'ERROR' = 'WebGL2';
  public errorMessage: string = '';

  // Overlays & Subsystems
  public pheromoneOverlay: PheromoneOverlay;
  public showSensorRays: boolean = true;
  public selectedAntId: string | null = null;

  // 3D Mesh entity registries
  private antMeshes: Map<string, Ant3DModel> = new Map();
  private foodMeshes: Map<string, THREE.Mesh> = new Map();
  private obstacleMeshes: Map<string, THREE.Mesh> = new Map();
  private predatorMeshes: Map<string, THREE.Mesh> = new Map();
  private aphidMeshes: Map<string, THREE.Mesh> = new Map();
  private corpseMeshes: Map<string, THREE.Mesh> = new Map();
  private terrainMesh: THREE.Mesh | null = null;
  private nestEntranceMesh: THREE.Group | null = null;
  private queenMesh: THREE.Mesh | null = null;

  // Dynamic Nest & Subnest 3D registries
  private nestMounds: Map<string, THREE.Group> = new Map();
  private chamberMeshes: Map<string, THREE.Group> = new Map();
  private tunnelLinesMesh: THREE.LineSegments | null = null;
  private interconnectLinesMesh: THREE.LineSegments | null = null;

  // Debug ray lines
  private sensorRayLine: THREE.LineSegments | null = null;
  private sensorRayGeometry: THREE.BufferGeometry | null = null;

  // Lighting
  private ambientLight: THREE.AmbientLight;
  private sunLight: THREE.DirectionalLight;
  private nestSpotLight: THREE.PointLight;

  // Orbit controls state
  private isDragging: boolean = false;
  private prevMouseX: number = 0;
  private prevMouseY: number = 0;
  public cameraTheta: number = Math.PI / 4;
  public cameraPhi: number = Math.PI / 3.2;
  public cameraDistance: number = 28.0; // Close enough to immediately see ants and nest!
  public cameraTarget: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

  // FPS Telemetry
  private frameCount: number = 0;
  private lastFpsTime: number = performance.now();
  public currentFps: number = 60;

  // Raycaster for click selection
  private raycaster: THREE.Raycaster;
  private mouseVec: THREE.Vector2;
  public onSelectEntity?: (type: 'ANT' | 'QUEEN' | 'FOOD' | 'PREDATOR' | 'GROUND', id?: string, worldPos?: { x: number; y: number }) => void;

  constructor(container: HTMLElement, world: SimulationWorld, quality: RenderQuality = 'LOW') {
    this.container = container;
    this.world = world;
    this.quality = quality;

    // 1. Scene setup (Crisp dark lab theme without obscuring fog)
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0c1017); // Crisp slate dark background

    // 2. Camera setup
    const width = Math.max(100, container.clientWidth || window.innerWidth);
    const height = Math.max(100, container.clientHeight || window.innerHeight);
    this.camera = new THREE.PerspectiveCamera(48, width / height, 0.5, 400);
    this.updateOrbitCameraPosition();

    // 3. WebGL Renderer with safe fallback
    this.renderer = this.initSafeRenderer(width, height);

    // 4. High-Visibility Lighting
    this.ambientLight = new THREE.AmbientLight(0xdbeafe, 1.6); // Bright cool ambient
    this.scene.add(this.ambientLight);

    this.sunLight = new THREE.DirectionalLight(0xffedd5, 2.2); // Warm directional sun
    this.sunLight.position.set(25, 35, 20);
    this.scene.add(this.sunLight);

    this.nestSpotLight = new THREE.PointLight(0x38bdf8, 2.8, 22);
    this.nestSpotLight.position.set(0, 4, 0);
    this.scene.add(this.nestSpotLight);

    // 5. Terrain & Grid
    this.createTerrain();

    // 6. Nest Entrance Mound & Queen
    this.nestEntranceMesh = this.createNestStructure();
    this.queenMesh = this.createQueenModel();

    // 7. Pheromone Overlay
    this.pheromoneOverlay = new PheromoneOverlay(world.config.width, world.config.height, world.pheromones.gridRes);
    this.scene.add(this.pheromoneOverlay.mesh);

    // 8. Debug Sensor Ray Lines
    this.sensorRayGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(36);
    this.sensorRayGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const rayMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      linewidth: 2,
    });
    this.sensorRayLine = new THREE.LineSegments(this.sensorRayGeometry, rayMat);
    this.scene.add(this.sensorRayLine);

    // 9. Raycaster & Event Listeners
    this.raycaster = new THREE.Raycaster();
    this.mouseVec = new THREE.Vector2();

    this.setupInteractionListeners();
    this.setupResizeObserver();
    this.applyQualitySettings(this.quality);
  }

  private resizeObserver: ResizeObserver | null = null;

  private setupResizeObserver(): void {
    if (typeof ResizeObserver !== 'undefined' && this.container) {
      this.resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const w = entry.contentRect.width || this.container.clientWidth || window.innerWidth;
          const h = entry.contentRect.height || this.container.clientHeight || window.innerHeight;
          this.resize(w, h);
        }
      });
      this.resizeObserver.observe(this.container);
    }
  }

  public resize(width?: number, height?: number): void {
    const w = Math.max(10, width ?? (this.container.clientWidth || window.innerWidth));
    const h = Math.max(10, height ?? (this.container.clientHeight || window.innerHeight));
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    if (this.renderer) {
      this.renderer.setSize(w, h);
    }
  }

  private initSafeRenderer(width: number, height: number): THREE.WebGLRenderer {
    try {
      this.container.innerHTML = '';
      const renderer = new THREE.WebGLRenderer({
        antialias: this.quality !== 'LOW',
        alpha: false,
        powerPreference: 'default',
        precision: 'mediump',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(1.0); // Conservative 1.0 pixel ratio for low-end hardware
      this.container.appendChild(renderer.domElement);
      this.rendererStatus = renderer.capabilities.isWebGL2 ? 'WebGL2' : 'WebGL1';
      return renderer;
    } catch (e: unknown) {
      console.error('Failed to create WebGL context:', e);
      this.rendererStatus = 'ERROR';
      this.errorMessage = e instanceof Error ? e.message : 'WebGL Initialization failed';
      throw e;
    }
  }

  public setQuality(quality: RenderQuality): void {
    this.quality = quality;
    this.applyQualitySettings(quality);
  }

  private applyQualitySettings(quality: RenderQuality): void {
    if (!this.renderer) return;

    if (quality === 'LOW') {
      this.renderer.setPixelRatio(1.0);
      this.renderer.shadowMap.enabled = false;
      this.sunLight.castShadow = false;
    } else if (quality === 'MEDIUM') {
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.BasicShadowMap;
      this.sunLight.castShadow = true;
      this.sunLight.shadow.mapSize.width = 1024;
      this.sunLight.shadow.mapSize.height = 1024;
    } else {
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.sunLight.castShadow = true;
      this.sunLight.shadow.mapSize.width = 2048;
      this.sunLight.shadow.mapSize.height = 2048;
    }
  }

  private createTerrain(): void {
    const w = this.world.config.width;
    const h = this.world.config.height;

    const terrainGeo = new THREE.PlaneGeometry(w, h, 24, 24);
    terrainGeo.rotateX(-Math.PI / 2);

    const terrainMat = new THREE.MeshLambertMaterial({
      color: 0x172033, // High-contrast navy-slate laboratory soil
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.position.y = 0;
    this.scene.add(terrainMesh);
    this.terrainMesh = terrainMesh;

    // Visible Laboratory Coordinate Grid
    const grid = new THREE.GridHelper(w, 20, 0x0ea5e9, 0x334155);
    grid.position.y = 0.02;
    this.scene.add(grid);
  }

  private createNestStructure(): THREE.Group {
    const nestGroup = new THREE.Group();
    this.scene.add(nestGroup);
    return nestGroup;
  }

  private syncNestStructures(colony?: any): void {
    if (!colony || !colony.nest) return;
    const nest = colony.nest;

    // 1. Sync Nests (Main Nest + Subnests)
    const activeNestIds = new Set<string>();
    activeNestIds.add(nest.id);

    // Main Nest Mound
    let mainGroup = this.nestMounds.get(nest.id);
    if (!mainGroup) {
      mainGroup = new THREE.Group();

      const moundGeo = new THREE.CylinderGeometry(nest.entranceRadius * 0.75, nest.entranceRadius * 1.05, 0.5, 20);
      const moundMat = new THREE.MeshLambertMaterial({ color: 0x0f172a });
      const mound = new THREE.Mesh(moundGeo, moundMat);
      mound.name = 'mound';
      mound.position.set(0, 0.25, 0);
      mainGroup.add(mound);

      const holeGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.6, 16);
      const holeMat = new THREE.MeshBasicMaterial({ color: 0x020617 });
      const hole = new THREE.Mesh(holeGeo, holeMat);
      hole.position.set(0, 0.3, 0);
      mainGroup.add(hole);

      const ringGeo = new THREE.TorusGeometry(nest.entranceRadius * 0.7, 0.12, 6, 24);
      ringGeo.rotateX(Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.name = 'ring';
      ring.position.set(0, 0.35, 0);
      mainGroup.add(ring);

      mainGroup.position.set(nest.entrancePosition.x, 0, nest.entrancePosition.y);
      this.nestMounds.set(nest.id, mainGroup);
      this.scene.add(mainGroup);
    }
    mainGroup.position.set(nest.entrancePosition.x, 0, nest.entrancePosition.y);

    // Subnests
    if (nest.subnests) {
      for (const sub of nest.subnests) {
        activeNestIds.add(sub.id);
        let subGroup = this.nestMounds.get(sub.id);
        if (!subGroup) {
          subGroup = new THREE.Group();

          const moundGeo = new THREE.CylinderGeometry(sub.entranceRadius * 0.7, sub.entranceRadius * 1.0, 0.45, 16);
          const moundMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
          const mound = new THREE.Mesh(moundGeo, moundMat);
          mound.name = 'mound';
          mound.position.set(0, 0.22, 0);
          subGroup.add(mound);

          const holeGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.5, 12);
          const holeMat = new THREE.MeshBasicMaterial({ color: 0x020617 });
          const hole = new THREE.Mesh(holeGeo, holeMat);
          hole.position.set(0, 0.25, 0);
          subGroup.add(hole);

          const ringGeo = new THREE.TorusGeometry(sub.entranceRadius * 0.65, 0.1, 6, 20);
          ringGeo.rotateX(Math.PI / 2);
          const color = sub.type === 'SATELLITE_FORAGING' ? 0x10b981 : sub.type === 'BROOD_EXPANSION' ? 0xf43f5e : 0x38bdf8;
          const ringMat = new THREE.MeshBasicMaterial({ color });
          const ring = new THREE.Mesh(ringGeo, ringMat);
          ring.name = 'ring';
          ring.position.set(0, 0.28, 0);
          subGroup.add(ring);

          subGroup.position.set(sub.entrancePosition.x, 0, sub.entrancePosition.y);
          this.nestMounds.set(sub.id, subGroup);
          this.scene.add(subGroup);
        }
        subGroup.position.set(sub.entrancePosition.x, 0, sub.entrancePosition.y);
        const ringMesh = subGroup.getObjectByName('ring') as THREE.Mesh;
        if (ringMesh && ringMesh.material) {
          const mat = ringMesh.material as THREE.MeshBasicMaterial;
          if (!sub.isEstablished) {
            mat.color.setHex(0xf59e0b); // Amber during construction
          } else {
            const col = sub.type === 'SATELLITE_FORAGING' ? 0x10b981 : sub.type === 'BROOD_EXPANSION' ? 0xf43f5e : 0x38bdf8;
            mat.color.setHex(col);
          }
        }
      }
    }

    // Cleanup removed subnests
    for (const [id, group] of this.nestMounds.entries()) {
      if (!activeNestIds.has(id)) {
        this.scene.remove(group);
        this.nestMounds.delete(id);
      }
    }

    // 2. Sync Subterranean 3D Chambers
    const allChambers = nest.getAllChambers ? nest.getAllChambers() : nest.chambers || [];
    const activeChamberIds = new Set<string>();

    const chamberColorMap: Record<string, number> = {
      ENTRANCE: 0x06b6d4,
      GENERAL: 0x38bdf8,
      FOOD_STORAGE: 0x10b981,
      BROOD_NURSERY: 0xf43f5e,
      QUEEN_CHAMBER: 0xf59e0b,
      REST_AREA: 0x818cf8,
      WATER_STORAGE: 0x3b82f6,
      DEFENSE: 0xf97316,
      WASTE_AREA: 0x64748b,
    };

    for (const chamber of allChambers) {
      if (chamber.depth <= 0.1) continue; // Surface entrance is rendered as mound above
      activeChamberIds.add(chamber.id);

      let group = this.chamberMeshes.get(chamber.id);
      if (!group) {
        group = new THREE.Group();

        const baseColor = chamberColorMap[chamber.type] || 0x38bdf8;
        const sphereGeo = new THREE.SphereGeometry(chamber.radius * 0.45, 12, 12);
        const sphereMat = new THREE.MeshLambertMaterial({
          color: baseColor,
          transparent: true,
          opacity: chamber.isExcavated ? 0.8 : 0.35,
        });
        const sphere = new THREE.Mesh(sphereGeo, sphereMat);
        sphere.name = 'sphere';
        group.add(sphere);

        // Wireframe glow ring
        const wireGeo = new THREE.WireframeGeometry(sphereGeo);
        const wireMat = new THREE.LineBasicMaterial({ color: baseColor, transparent: true, opacity: 0.85 });
        const wire = new THREE.LineSegments(wireGeo, wireMat);
        wire.name = 'wire';
        group.add(wire);

        // Vertical shaft line to surface
        const shaftGeo = new THREE.BufferGeometry();
        shaftGeo.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, chamber.depth * 0.9 + 0.35, 0], 3));
        const shaftMat = new THREE.LineBasicMaterial({ color: baseColor, transparent: true, opacity: 0.5 });
        const shaft = new THREE.Line(shaftGeo, shaftMat);
        shaft.name = 'shaft';
        group.add(shaft);

        // Surface outline ring marker
        const surfRingGeo = new THREE.RingGeometry(chamber.radius * 0.25, chamber.radius * 0.32, 16);
        surfRingGeo.rotateX(-Math.PI / 2);
        const surfRingMat = new THREE.MeshBasicMaterial({ color: baseColor, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
        const surfRing = new THREE.Mesh(surfRingGeo, surfRingMat);
        surfRing.name = 'surfRing';
        surfRing.position.set(0, chamber.depth * 0.9 + 0.35, 0);
        group.add(surfRing);

        this.chamberMeshes.set(chamber.id, group);
        this.scene.add(group);
      }

      const posY = -chamber.depth * 0.9 - 0.3;
      group.position.set(chamber.position.x, posY, chamber.position.y);
      const scale = Math.max(0.35, chamber.excavationProgress);
      group.scale.set(scale, scale, scale);

      const sphereMesh = group.getObjectByName('sphere') as THREE.Mesh;
      if (sphereMesh && sphereMesh.material) {
        (sphereMesh.material as THREE.MeshLambertMaterial).opacity = chamber.isExcavated ? 0.8 : 0.3;
      }
    }

    for (const [id, group] of this.chamberMeshes.entries()) {
      if (!activeChamberIds.has(id)) {
        this.scene.remove(group);
        this.chamberMeshes.delete(id);
      }
    }

    // 3. Subterranean Tunnels Line Segment
    const allTunnels = nest.getAllTunnels ? nest.getAllTunnels() : nest.tunnels || [];
    const chamberMap = new Map(allChambers.map((c: any) => [c.id, c]));
    const tunnelCoords: number[] = [];

    for (const t of allTunnels) {
      const fromC = chamberMap.get(t.fromChamberId) as any;
      const toC = chamberMap.get(t.toChamberId) as any;
      if (fromC && toC) {
        const fy = fromC.depth <= 0.1 ? 0.1 : -fromC.depth * 0.9 - 0.3;
        const ty = toC.depth <= 0.1 ? 0.1 : -toC.depth * 0.9 - 0.3;
        tunnelCoords.push(fromC.position.x, fy, fromC.position.y);
        tunnelCoords.push(toC.position.x, ty, toC.position.y);
      }
    }

    if (tunnelCoords.length > 0) {
      if (!this.tunnelLinesMesh) {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(tunnelCoords, 3));
        const mat = new THREE.LineBasicMaterial({ color: 0x0284c7, transparent: true, opacity: 0.7 });
        this.tunnelLinesMesh = new THREE.LineSegments(geo, mat);
        this.scene.add(this.tunnelLinesMesh);
      } else {
        const geo = this.tunnelLinesMesh.geometry;
        geo.setAttribute('position', new THREE.Float32BufferAttribute(tunnelCoords, 3));
        geo.attributes.position.needsUpdate = true;
      }
    }

    // 4. Interconnection Tunnels (Main Nest to Subnests)
    const interconnections = nest.interconnections || [];
    const interCoords: number[] = [];
    for (const ic of interconnections) {
      interCoords.push(ic.fromPosition.x, 0.15, ic.fromPosition.y);
      interCoords.push(ic.toPosition.x, 0.15, ic.toPosition.y);
    }

    if (interCoords.length > 0) {
      if (!this.interconnectLinesMesh) {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(interCoords, 3));
        const mat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85 });
        this.interconnectLinesMesh = new THREE.LineSegments(geo, mat);
        this.scene.add(this.interconnectLinesMesh);
      } else {
        const geo = this.interconnectLinesMesh.geometry;
        geo.setAttribute('position', new THREE.Float32BufferAttribute(interCoords, 3));
        geo.attributes.position.needsUpdate = true;
      }
    }
  }

  private createQueenModel(): THREE.Mesh {
    const queenGeo = new THREE.SphereGeometry(0.85, 8, 8);
    queenGeo.scale(1.2, 1.0, 2.2);
    const queenMat = new THREE.MeshLambertMaterial({
      color: 0xd97706, // Brilliant royal amber
    });
    const mesh = new THREE.Mesh(queenGeo, queenMat);
    mesh.position.set(-1.0, 0.8, 4.0);
    this.scene.add(mesh);
    return mesh;
  }

  public focusOnPosition(pos: { x: number; y: number }, distance = 28.0): void {
    this.cameraTarget.set(pos.x, 0, pos.y);
    this.cameraDistance = distance;
    this.updateOrbitCameraPosition();
  }

  private setupInteractionListeners(): void {
    if (!this.renderer) return;
    const dom = this.renderer.domElement;

    // Prevent context menu to allow smooth right-click panning
    dom.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    let dragButton = 0;

    dom.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      dragButton = e.button;
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.prevMouseX;
      const dy = e.clientY - this.prevMouseY;

      // Check if panning (Right-click, Middle-click, or Shift + Left-click)
      const isPan = dragButton === 2 || dragButton === 1 || e.shiftKey || e.buttons === 2 || e.buttons === 4;

      if (isPan) {
        // Pan camera target in the camera view plane (all directions X and Z)
        const panScale = Math.max(0.015, this.cameraDistance * 0.0018);
        const rightX = Math.cos(this.cameraTheta);
        const rightZ = -Math.sin(this.cameraTheta);
        const fwdX = -Math.sin(this.cameraTheta);
        const fwdZ = -Math.cos(this.cameraTheta);

        this.cameraTarget.x += (-dx * rightX + dy * fwdX) * panScale;
        this.cameraTarget.z += (-dx * rightZ + dy * fwdZ) * panScale;

        this.cameraTarget.x = Math.max(-120, Math.min(120, this.cameraTarget.x));
        this.cameraTarget.z = Math.max(-120, Math.min(120, this.cameraTarget.z));
      } else {
        // Orbit rotation in all directions
        this.cameraTheta -= dx * 0.006;
        // Pitch range from top-down to below horizontal to view underground chambers
        this.cameraPhi = Math.max(0.02, Math.min(Math.PI / 1.85, this.cameraPhi + dy * 0.006));
      }

      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;
      this.updateOrbitCameraPosition();
    });

    dom.addEventListener('wheel', (e) => {
      e.preventDefault();
      e.stopPropagation();
      // Proportional zoom from 2m close-up to 300m panoramic territory view
      const zoomStep = e.deltaY * (0.02 + this.cameraDistance * 0.002);
      this.cameraDistance = Math.max(2.0, Math.min(300.0, this.cameraDistance + zoomStep));
      this.updateOrbitCameraPosition();
    }, { passive: false });

    // Click raycasting
    dom.addEventListener('click', (e) => {
      const rect = dom.getBoundingClientRect();
      this.mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouseVec.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouseVec, this.camera);

      // Check click on ants
      for (const [antId, model] of this.antMeshes.entries()) {
        const intersects = this.raycaster.intersectObjects(model.group.children, true);
        if (intersects.length > 0) {
          this.selectedAntId = antId;
          if (this.onSelectEntity) this.onSelectEntity('ANT', antId);
          return;
        }
      }

      // Check click on Queen
      if (this.queenMesh) {
        const queenHits = this.raycaster.intersectObject(this.queenMesh);
        if (queenHits.length > 0) {
          if (this.onSelectEntity) this.onSelectEntity('QUEEN');
          return;
        }
      }

      // Check click on ground terrain
      if (this.terrainMesh) {
        const terrainHits = this.raycaster.intersectObject(this.terrainMesh);
        if (terrainHits.length > 0) {
          const hit = terrainHits[0];
          const worldPos = { x: hit.point.x, y: hit.point.z };
          if (this.onSelectEntity) this.onSelectEntity('GROUND', undefined, worldPos);
          return;
        }
      }
    });

    window.addEventListener('resize', () => {
      if (!this.container || !this.renderer) return;
      const w = Math.max(100, this.container.clientWidth || window.innerWidth);
      const h = Math.max(100, this.container.clientHeight || window.innerHeight);
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });
  }

  public updateOrbitCameraPosition(): void {
    if (this.viewMode === 'ORBIT') {
      const x = this.cameraTarget.x + this.cameraDistance * Math.sin(this.cameraPhi) * Math.sin(this.cameraTheta);
      const y = this.cameraTarget.y + this.cameraDistance * Math.cos(this.cameraPhi);
      const z = this.cameraTarget.z + this.cameraDistance * Math.sin(this.cameraPhi) * Math.cos(this.cameraTheta);
      this.camera.position.set(x, y, z);
      this.camera.lookAt(this.cameraTarget);
    } else if (this.viewMode === 'TOP_DOWN') {
      this.camera.position.set(this.cameraTarget.x, Math.max(20, this.cameraDistance * 1.1), this.cameraTarget.z + 0.001);
      this.camera.lookAt(this.cameraTarget);
    } else if (this.viewMode === 'QUEEN_CHAMBER') {
      this.camera.position.set(-1.0, 6.0, 8.0);
      this.camera.lookAt(-1.0, 0.8, 4.0);
    }
  }

  public render(): void {
    if (!this.renderer) return;

    // Track FPS
    this.frameCount++;
    const now = performance.now();
    if (now - this.lastFpsTime >= 1000) {
      this.currentFps = Math.round((this.frameCount * 1000) / (now - this.lastFpsTime));
      this.frameCount = 0;
      this.lastFpsTime = now;
    }

    const colony = this.world.colonies[0];
    const liveAnts = colony ? colony.ants : [];

    // 1. Sync Ant Meshes
    const activeAntIds = new Set<string>();
    for (let i = 0; i < liveAnts.length; i++) {
      const ant = liveAnts[i];
      activeAntIds.add(ant.id);

      let model = this.antMeshes.get(ant.id);
      if (!model) {
        model = new Ant3DModel(ant.id);
        this.antMeshes.set(ant.id, model);
        this.scene.add(model.group);
      }
      model.updatePose(ant, ant.id === this.selectedAntId);
    }

    // Clean up dead ant meshes
    for (const [id, model] of this.antMeshes.entries()) {
      if (!activeAntIds.has(id)) {
        this.scene.remove(model.group);
        model.dispose();
        this.antMeshes.delete(id);
      }
    }

    // Default select first ant if none
    if (!this.selectedAntId && liveAnts.length > 0) {
      this.selectedAntId = liveAnts[0].id;
    }

    // 2. Sync Food Crystal Meshes (Vibrant emerald dodecahedrons)
    const activeFoodIds = new Set<string>();
    for (let i = 0; i < this.world.foodEntities.length; i++) {
      const food = this.world.foodEntities[i];
      activeFoodIds.add(food.id);

      let mesh = this.foodMeshes.get(food.id);
      if (!mesh) {
        const geo = new THREE.DodecahedronGeometry(food.radius * 0.7);
        const mat = new THREE.MeshBasicMaterial({
          color: 0x10b981, // Glowing emerald
        });
        mesh = new THREE.Mesh(geo, mat);
        this.foodMeshes.set(food.id, mesh);
        this.scene.add(mesh);
      }
      mesh.position.set(food.position.x, 0.45, food.position.y);
      const scale = Math.max(0.25, food.amount / food.initialAmount);
      mesh.scale.set(scale, scale, scale);
      mesh.rotation.y += 0.015;
    }

    for (const [id, mesh] of this.foodMeshes.entries()) {
      if (!activeFoodIds.has(id)) {
        this.scene.remove(mesh);
        this.foodMeshes.delete(id);
      }
    }

    // 3. Sync Obstacle Rocks
    const activeObsIds = new Set<string>();
    for (let i = 0; i < this.world.obstacles.length; i++) {
      const obs = this.world.obstacles[i];
      activeObsIds.add(obs.id);

      let mesh = this.obstacleMeshes.get(obs.id);
      if (!mesh) {
        const geo = new THREE.DodecahedronGeometry(obs.radius, 0);
        const mat = new THREE.MeshLambertMaterial({ color: 0x475569 });
        mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(obs.position.x, obs.radius * 0.7, obs.position.y);
        this.obstacleMeshes.set(obs.id, mesh);
        this.scene.add(mesh);
      }
    }

    // 4. Sync Predator Meshes
    const activePredIds = new Set<string>();
    for (let i = 0; i < this.world.predators.length; i++) {
      const pred = this.world.predators[i];
      activePredIds.add(pred.state.id);

      let mesh = this.predatorMeshes.get(pred.state.id);
      if (!mesh) {
        const geo = new THREE.SphereGeometry(pred.radius, 10, 10);
        geo.scale(1.2, 0.8, 1.8);
        const col = new THREE.Color(pred.profile.color || '#ef4444');
        const mat = new THREE.MeshLambertMaterial({ color: col });
        mesh = new THREE.Mesh(geo, mat);
        this.predatorMeshes.set(pred.state.id, mesh);
        this.scene.add(mesh);
      }
      mesh.position.set(pred.state.position.x, 0.7, pred.state.position.y);
      mesh.rotation.y = -pred.state.heading + Math.PI / 2;

      // Pulse slightly if lunging/attacking
      if (pred.state.state === 'ATTACK') {
        mesh.scale.set(1.15, 1.15, 1.15);
      } else {
        mesh.scale.set(1.0, 1.0, 1.0);
      }
    }

    for (const [id, mesh] of this.predatorMeshes.entries()) {
      if (!activePredIds.has(id)) {
        this.scene.remove(mesh);
        this.predatorMeshes.delete(id);
      }
    }

    // 4b. Sync Aphids
    if (this.world.ecology) {
      const activeAphidIds = new Set<string>();
      for (const aphid of this.world.ecology.aphids) {
        if (!aphid.isAlive) continue;
        activeAphidIds.add(aphid.id);

        let mesh = this.aphidMeshes.get(aphid.id);
        if (!mesh) {
          const geo = new THREE.SphereGeometry(0.35, 6, 6);
          const mat = new THREE.MeshLambertMaterial({ color: 0xa3e635 });
          mesh = new THREE.Mesh(geo, mat);
          this.aphidMeshes.set(aphid.id, mesh);
          this.scene.add(mesh);
        }
        mesh.position.set(aphid.position.x, 0.25, aphid.position.y);
      }

      for (const [id, mesh] of this.aphidMeshes.entries()) {
        if (!activeAphidIds.has(id)) {
          this.scene.remove(mesh);
          this.aphidMeshes.delete(id);
        }
      }
    }

    // 4c. Sync Corpses awaiting sanitation
    if (colony) {
      const activeCorpseIds = new Set<string>();
      for (const corpse of colony.corpses) {
        activeCorpseIds.add(corpse.id);

        let mesh = this.corpseMeshes.get(corpse.id);
        if (!mesh) {
          const geo = new THREE.SphereGeometry(0.3, 6, 6);
          geo.scale(1.2, 0.4, 1.5);
          const mat = new THREE.MeshLambertMaterial({ color: 0x475569 }); // Dark deceased chitin
          mesh = new THREE.Mesh(geo, mat);
          this.corpseMeshes.set(corpse.id, mesh);
          this.scene.add(mesh);
        }
        mesh.position.set(corpse.position.x, 0.15, corpse.position.y);
      }

      for (const [id, mesh] of this.corpseMeshes.entries()) {
        if (!activeCorpseIds.has(id)) {
          this.scene.remove(mesh);
          this.corpseMeshes.delete(id);
        }
      }
    }

    // 4d. Sync Main Nest and Subnest Structures in 3D
    this.syncNestStructures(colony);

    // 5. Update Pheromone Overlay
    this.pheromoneOverlay.updateTexture(this.world.pheromones);

    // 6. Camera Tracking Modes
    const selectedAnt = this.selectedAntId ? this.world.getAntById(this.selectedAntId) : null;
    if (selectedAnt && selectedAnt.internalState.state.isAlive) {
      const antPos = selectedAnt.body.position;

      if (this.viewMode === 'FOLLOW_ANT') {
        this.cameraTarget.set(antPos.x, 0.5, antPos.y);
        this.updateOrbitCameraPosition();
      } else if (this.viewMode === 'FIRST_PERSON') {
        const h = selectedAnt.body.heading;
        const eyeX = antPos.x + Math.cos(h) * 0.4;
        const eyeZ = antPos.y + Math.sin(h) * 0.4;
        this.camera.position.set(eyeX, 0.65, eyeZ);
        this.camera.lookAt(eyeX + Math.cos(h) * 5.0, 0.5, eyeZ + Math.sin(h) * 5.0);
      }

      // Sensor ray debug line
      if (this.showSensorRays && this.sensorRayGeometry && this.sensorRayLine) {
        this.updateSensorRayLines(selectedAnt);
        this.sensorRayLine.visible = true;
      }
    } else if (this.sensorRayLine) {
      this.sensorRayLine.visible = false;
    }

    // 7. Render frame
    this.renderer.render(this.scene, this.camera);
  }

  private updateSensorRayLines(ant: Ant): void {
    if (!this.sensorRayGeometry) return;
    const posAttr = this.sensorRayGeometry.attributes.position as THREE.BufferAttribute;
    const array = posAttr.array as Float32Array;

    const headX = ant.body.position.x;
    const headY = 0.4;
    const headZ = ant.body.position.y;
    const s = ant.sensors;

    const pts = [
      headX, headY, headZ, s.leftAntennaPos.x, 0.35, s.leftAntennaPos.y,
      headX, headY, headZ, s.centerAntennaPos.x, 0.35, s.centerAntennaPos.y,
      headX, headY, headZ, s.rightAntennaPos.x, 0.35, s.rightAntennaPos.y,
    ];

    for (let i = 0; i < pts.length; i++) {
      array[i] = pts[i];
    }
    posAttr.needsUpdate = true;
  }

  public setViewMode(mode: CameraViewMode): void {
    this.viewMode = mode;
    this.updateOrbitCameraPosition();
  }

  public getDiagnostics(): RendererDiagnostics {
    const info = this.renderer?.info;
    return {
      status: this.rendererStatus,
      quality: this.quality,
      fps: this.currentFps,
      drawCalls: info?.render?.calls || 0,
      triangles: info?.render?.triangles || 0,
      geometries: info?.memory?.geometries || 0,
      textures: info?.memory?.textures || 0,
      errorMessage: this.errorMessage,
    };
  }

  public dispose(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement.parentElement) {
        this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
      }
      this.renderer = null;
    }
  }
}
