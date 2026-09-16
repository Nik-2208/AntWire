/**
 * ANTWIRE — 3D Interactive Ant Brain Atlas & Neuropil Viewer
 * Built with Three.js for interactive connectome inspection, animated neural signal pulses,
 * and live brain-to-behavior pathway highlighting.
 */

import * as THREE from 'three';
import { REFERENCE_BRAIN_REGIONS, NeuropilRegionId, BrainRegionMetadata } from '../ants/brain/connectome';
import { AntBrainStateSnapshot } from '../ants/brain/types';

export class Brain3DViewer {
  public container: HTMLElement;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;

  // Neuropil 3D Mesh Registries
  private regionMeshes: Map<NeuropilRegionId, THREE.Mesh> = new Map();
  private signalParticles: THREE.Points;
  private particlePositions: Float32Array;
  private particleCount = 48;

  // Orbit controls
  private isDragging = false;
  private prevMouseX = 0;
  private prevMouseY = 0;
  private theta = Math.PI / 4;
  private phi = Math.PI / 3.5;
  private radius = 5.5;

  public selectedRegionId: NeuropilRegionId | null = 'ANTENNAL_LOBE';
  public onSelectRegion?: (meta: BrainRegionMetadata) => void;

  constructor(container: HTMLElement) {
    this.container = container;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x06080d);

    // 2. Camera with near plane 0.01
    const w = container.clientWidth || 340;
    const h = container.clientHeight || 260;
    this.camera = new THREE.PerspectiveCamera(45, w / h, 0.01, 50);
    this.updateCameraPosition();

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(this.renderer.domElement);

    // 4. Lighting
    const ambient = new THREE.AmbientLight(0xdbeafe, 1.4);
    this.scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 2.0);
    dir.position.set(5, 8, 5);
    this.scene.add(dir);

    // 5. Construct 3D Neuropils
    this.buildNeuropilAnatomy();

    // 6. Signal Pulses (Animated Neural Axons)
    this.particlePositions = new Float32Array(this.particleCount * 3);
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.18,
      transparent: true,
      opacity: 0.85,
      blending: THREE.NormalBlending,
    });
    this.signalParticles = new THREE.Points(particleGeo, particleMat);
    this.scene.add(this.signalParticles);

    // 7. Event Listeners & ResizeObserver
    this.setupInteractions();
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const rw = entry.contentRect.width || 340;
        const rh = entry.contentRect.height || 260;
        this.resize(rw, rh);
      }
    });
    ro.observe(container);
  }

  private buildNeuropilAnatomy(): void {
    // (A) Antennal Lobes (Paired anterior ventral spheres)
    const alGeo = new THREE.SphereGeometry(0.55, 10, 10);
    const alMat = new THREE.MeshLambertMaterial({ color: 0x10b981 }); // Emerald
    const alLeft = new THREE.Mesh(alGeo, alMat);
    alLeft.position.set(-0.75, -0.6, 1.1);
    const alRight = new THREE.Mesh(alGeo, alMat);
    alRight.position.set(0.75, -0.6, 1.1);
    const alGroup = new THREE.Group();
    alGroup.add(alLeft);
    alGroup.add(alRight);
    this.scene.add(alGroup);
    this.regionMeshes.set('ANTENNAL_LOBE', alLeft);

    // (B) Mushroom Body Calyces (Paired dorsal cups)
    const mbGeo = new THREE.TorusGeometry(0.65, 0.22, 8, 16);
    mbGeo.rotateX(Math.PI / 2);
    const mbMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b }); // Amber
    const mbCalyxL = new THREE.Mesh(mbGeo, mbMat);
    mbCalyxL.position.set(-0.9, 0.8, -0.2);
    const mbCalyxR = new THREE.Mesh(mbGeo, mbMat);
    mbCalyxR.position.set(0.9, 0.8, -0.2);
    this.scene.add(mbCalyxL);
    this.scene.add(mbCalyxR);
    this.regionMeshes.set('MUSHROOM_BODY_CALYX', mbCalyxL);

    // (C) Mushroom Body Lobes
    const lobeGeo = new THREE.CylinderGeometry(0.2, 0.2, 1.2, 8);
    const lobeMat = new THREE.MeshLambertMaterial({ color: 0xd97706 });
    const lobeL = new THREE.Mesh(lobeGeo, lobeMat);
    lobeL.position.set(-0.5, 0.1, 0.4);
    lobeL.rotation.z = 0.4;
    const lobeR = new THREE.Mesh(lobeGeo, lobeMat);
    lobeR.position.set(0.5, 0.1, 0.4);
    lobeR.rotation.z = -0.4;
    this.scene.add(lobeL);
    this.scene.add(lobeR);
    this.regionMeshes.set('MUSHROOM_BODY_LOBES', lobeL);

    // (D) Central Complex - Ellipsoid Body (Midline Torus)
    const ebGeo = new THREE.TorusGeometry(0.48, 0.16, 8, 16);
    const ebMat = new THREE.MeshLambertMaterial({ color: 0x06b6d4 }); // Electric Cyan
    const ebMesh = new THREE.Mesh(ebGeo, ebMat);
    ebMesh.position.set(0, 0.2, 0.1);
    this.scene.add(ebMesh);
    this.regionMeshes.set('CENTRAL_COMPLEX_EB', ebMesh);

    // (E) Central Complex - Fan-Shaped Body
    const fbGeo = new THREE.BoxGeometry(1.2, 0.35, 0.5);
    const fbMat = new THREE.MeshLambertMaterial({ color: 0x0284c7 });
    const fbMesh = new THREE.Mesh(fbGeo, fbMat);
    fbMesh.position.set(0, 0.55, -0.1);
    this.scene.add(fbMesh);
    this.regionMeshes.set('CENTRAL_COMPLEX_FB', fbMesh);

    // (F) Lateral Accessory Lobes (LAL)
    const lalGeo = new THREE.SphereGeometry(0.4, 8, 8);
    const lalMat = new THREE.MeshLambertMaterial({ color: 0x8b5cf6 }); // Violet
    const lalL = new THREE.Mesh(lalGeo, lalMat);
    lalL.position.set(-1.1, -0.2, 0.3);
    const lalR = new THREE.Mesh(lalGeo, lalMat);
    lalR.position.set(1.1, -0.2, 0.3);
    this.scene.add(lalL);
    this.scene.add(lalR);
    this.regionMeshes.set('LATERAL_ACCESSORY_LOBE', lalL);

    // (G) Subesophageal Zone (SEZ)
    const sezGeo = new THREE.SphereGeometry(0.65, 8, 8);
    sezGeo.scale(1.2, 0.8, 1.0);
    const sezMat = new THREE.MeshLambertMaterial({ color: 0xe11d48 }); // Rose/Crimson
    const sezMesh = new THREE.Mesh(sezGeo, sezMat);
    sezMesh.position.set(0, -1.1, 0.3);
    this.scene.add(sezMesh);
    this.regionMeshes.set('SUBESOPHAGEAL_ZONE', sezMesh);

    // Outer Brain Membrane Outline (Translucent Glass Shell)
    const shellGeo = new THREE.SphereGeometry(2.0, 12, 12);
    shellGeo.scale(1.1, 0.85, 0.95);
    const shellMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    const shell = new THREE.Mesh(shellGeo, shellMat);
    this.scene.add(shell);
  }

  private setupInteractions(): void {
    const dom = this.renderer.domElement;

    dom.addEventListener('mousedown', (e) => {
      this.isDragging = true;
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

      this.theta -= dx * 0.01;
      this.phi = Math.max(0.2, Math.min(Math.PI - 0.2, this.phi + dy * 0.01));

      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;
      this.updateCameraPosition();
    });

    dom.addEventListener('wheel', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.radius = Math.max(1.0, Math.min(10.0, this.radius + e.deltaY * 0.005));
      this.updateCameraPosition();
    }, { passive: false });
  }

  private updateCameraPosition(): void {
    const x = this.radius * Math.sin(this.phi) * Math.sin(this.theta);
    const y = this.radius * Math.cos(this.phi);
    const z = this.radius * Math.sin(this.phi) * Math.cos(this.theta);
    this.camera.position.set(x, y, z);
    this.camera.lookAt(0, 0, 0);
  }

  public updateLiveActivity(snap: AntBrainStateSnapshot): void {
    // 1. Highlight active neuropils based on actual simulation state
    const alMesh = this.regionMeshes.get('ANTENNAL_LOBE');
    if (alMesh) {
      const odorMax = Math.max(...snap.antennalLobe.glomeruli.map((g) => Math.max(g.leftActivation, g.rightActivation)));
      (alMesh.material as THREE.MeshLambertMaterial).emissive = new THREE.Color(0x10b981);
      (alMesh.material as THREE.MeshLambertMaterial).emissiveIntensity = odorMax * 0.8;
    }

    const ebMesh = this.regionMeshes.get('CENTRAL_COMPLEX_EB');
    if (ebMesh) {
      (ebMesh.material as THREE.MeshLambertMaterial).emissive = new THREE.Color(0x06b6d4);
      (ebMesh.material as THREE.MeshLambertMaterial).emissiveIntensity = 0.6;
    }

    // 2. Animate Signal Pulses
    const time = performance.now() * 0.003;
    const pos = this.particlePositions;
    for (let i = 0; i < this.particleCount; i++) {
      const progress = (time + i / this.particleCount) % 1.0;
      // Axon track from AL (0, -0.6, 1.1) to MB (0, 0.8, -0.2) to CX (0, 0.2, 0.1)
      const px = Math.sin(progress * Math.PI * 2) * 0.6;
      const py = (progress - 0.5) * 1.6;
      const pz = (0.5 - progress) * 1.2;

      pos[i * 3] = px;
      pos[i * 3 + 1] = py;
      pos[i * 3 + 2] = pz;
    }
    this.signalParticles.geometry.attributes.position.needsUpdate = true;

    // 3. Render frame
    this.render();
  }

  public updateFromBrainState(snap: AntBrainStateSnapshot): void {
    this.updateLiveActivity(snap);
  }

  public highlightRegion(id: NeuropilRegionId): void {
    this.selectedRegionId = id;
    for (const [rId, mesh] of this.regionMeshes.entries()) {
      const mat = mesh.material as THREE.MeshLambertMaterial;
      if (rId === id) {
        mat.emissive = new THREE.Color(0x38bdf8);
        mat.emissiveIntensity = 0.9;
      } else {
        mat.emissive = new THREE.Color(0x000000);
        mat.emissiveIntensity = 0.0;
      }
    }
  }

  public render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  public resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public dispose(): void {
    this.renderer.dispose();
  }
}
