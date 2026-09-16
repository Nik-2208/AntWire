/**
 * ANT BRAIN — Fullscreen 3D Computational Ant Brain & Connectome Viewer
 *
 * FAITHFUL BIOLOGICAL INSECT BRAIN MORPHOLOGY:
 * - Antennal Lobes (AL-L, AL-R): Bilateral spherical glomerular deutocerebrum.
 * - Optic Lobes (OL-L, OL-R): Sweeping lateral crescent compound eye retinotopic wings.
 * - Mushroom Bodies (MB-L, MB-R): Dorsal cup-shaped Calyces & descending Peduncle stalks.
 * - Central Complex (CX): Midline Toroidal Ellipsoid Body (EB), Fan-Shaped Body (FB) & Protocerebral Bridge (PB).
 * - Subesophageal Zone (SEZ): Ventral tapering gnathal ganglion commanding mandibles.
 * - Lateral Accessory Lobes (LAL): Ventrolateral premotor steering centers.
 *
 * 3D SYNAPTIC CONNECTION GRAPH:
 * - Real-time LineSegments rendering synaptic tracts between presynaptic & postsynaptic nodes.
 * - Configurable synaptic density slider (1,000 to 50,000 active synapses).
 * - Traveling action potential signal wave pulses flowing across synaptic connections.
 * - Neurotransmitter filtering (Excitatory ACh/Glu, Inhibitory GABA, Modulatory DA/OA).
 * - Interactive node raycaster & biophysical HUD inspector.
 * - True browser fullscreen mode & cinematic camera presets.
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { SyntheticBrain55K, SYNTHETIC_NEUROPIL_REGIONS } from '../ants/brain/synthetic_brain_55k';
import {
  Maximize,
  Minimize,
  X,
  Eye,
  Zap,
  Sliders,
  Layers,
  RotateCcw,
  Sparkles,
  Activity,
  Compass,
  RotateCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface FullscreenAntBrainViewerProps {
  brain?: SyntheticBrain55K;
  onClose: () => void;
}

export type SynapseTypeFilter = 'ALL' | 'EXCITATORY' | 'INHIBITORY' | 'MODULATORY';
export type CameraPreset = 'ANTERIOR' | 'DORSAL' | 'LATERAL_L' | 'LATERAL_R' | 'VENTRAL' | 'ISOMETRIC';

export const FullscreenAntBrainViewer: React.FC<FullscreenAntBrainViewerProps> = ({
  brain: providedBrain,
  onClose,
}) => {
  // Use provided brain or create a stable internal 55k instance
  const brainRef = useRef<SyntheticBrain55K>(providedBrain || new SyntheticBrain55K(55000, 42));
  const brain = brainRef.current;

  // UI & Visualization Controls
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [synapseDensity, setSynapseDensity] = useState<number>(6000);
  const [synapseFilter, setSynapseFilter] = useState<SynapseTypeFilter>('ALL');
  const [isExploded, setIsExploded] = useState<boolean>(false);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [isTrueFullscreen, setIsTrueFullscreen] = useState<boolean>(false);
  const [showSynapticArcs, setShowSynapticArcs] = useState<boolean>(true);
  const [showSignalPulses, setShowSignalPulses] = useState<boolean>(true);
  const [activeSignalWave, setActiveSignalWave] = useState<string | null>(null);
  const [leftPanelOpen, setLeftPanelOpen] = useState<boolean>(true);
  const [rightPanelOpen, setRightPanelOpen] = useState<boolean>(true);

  // Inspector State
  const [inspectedNeuronId, setInspectedNeuronId] = useState<number | null>(420);

  // WebGL Canvas & Three.js Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const brainGroupRef = useRef<THREE.Group | null>(null);
  const pointsMeshRef = useRef<THREE.Points | null>(null);
  const synapseLinesRef = useRef<THREE.LineSegments | null>(null);
  const pulseParticlesRef = useRef<THREE.Points | null>(null);
  const pulseGeomRef = useRef<THREE.BufferGeometry | null>(null);

  // Camera Orbit State
  const isDraggingRef = useRef(false);
  const isRightDraggingRef = useRef(false);
  const mousePrevRef = useRef({ x: 0, y: 0 });
  const orbitRef = useRef({
    theta: Math.PI / 4, // Horizontal azimuth
    phi: Math.PI / 3.2, // Vertical elevation
    radius: 4.8, // Distance from center
    target: new THREE.Vector3(0, 0, 0),
  });

  // Animated Pulse Packets (Traveling Action Potentials)
  const pulsePacketCount = 300;
  const pulseProgressRef = useRef<Float32Array>(new Float32Array(pulsePacketCount));
  const pulseEdgeIndexRef = useRef<Int32Array>(new Int32Array(pulsePacketCount));
  const pulseSpeedRef = useRef<Float32Array>(new Float32Array(pulsePacketCount));
  const pulsePositionsRef = useRef<Float32Array>(new Float32Array(pulsePacketCount * 3));

  // Initialize Animated Pulses
  useEffect(() => {
    for (let i = 0; i < pulsePacketCount; i++) {
      pulseProgressRef.current[i] = Math.random();
      pulseEdgeIndexRef.current[i] = Math.floor(Math.random() * Math.min(synapseDensity, brain.edgeCount));
      pulseSpeedRef.current[i] = 0.008 + Math.random() * 0.018;
    }
  }, [synapseDensity, brain.edgeCount]);

  // Set Camera Preset Handler
  const applyCameraPreset = useCallback((preset: CameraPreset) => {
    const orbit = orbitRef.current;
    if (preset === 'ANTERIOR') {
      // Frontal View: ALs and SEZ facing viewer
      orbit.theta = 0;
      orbit.phi = Math.PI / 2.1;
      orbit.radius = 4.2;
    } else if (preset === 'DORSAL') {
      // Top View: Mushroom Body Calyces & PB Bridge
      orbit.theta = 0;
      orbit.phi = 0.08;
      orbit.radius = 4.5;
    } else if (preset === 'LATERAL_L') {
      // Left View: Left Optic Lobe & Left MB Peduncle
      orbit.theta = -Math.PI / 2;
      orbit.phi = Math.PI / 2.1;
      orbit.radius = 4.4;
    } else if (preset === 'LATERAL_R') {
      // Right View: Right Optic Lobe & Right MB Peduncle
      orbit.theta = Math.PI / 2;
      orbit.phi = Math.PI / 2.1;
      orbit.radius = 4.4;
    } else if (preset === 'VENTRAL') {
      // Bottom View: SEZ and Gnathal ganglion
      orbit.theta = 0;
      orbit.phi = Math.PI - 0.15;
      orbit.radius = 4.4;
    } else if (preset === 'ISOMETRIC') {
      orbit.theta = Math.PI / 4;
      orbit.phi = Math.PI / 3.2;
      orbit.radius = 4.8;
    }
    orbit.target.set(0, 0, 0);
  }, []);

  // Fullscreen Browser API Toggle
  const toggleBrowserFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsTrueFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsTrueFullscreen(false);
    }
  }, []);

  // Action Potential Wave Burst Trigger
  const triggerSensoryWave = useCallback((waveType: 'OLFACTORY' | 'VISUAL' | 'DOPAMINE_BURST' | 'MOTOR_COMMAND') => {
    setActiveSignalWave(waveType);

    // Inject high activation in specific sensory or modulatory lobes
    if (waveType === 'OLFACTORY') {
      const alCount = Math.floor(0.15 * brain.neuronCount);
      for (let i = 0; i < alCount; i++) {
        brain.activations[i] = 1.0;
      }
    } else if (waveType === 'VISUAL') {
      const olOffset = Math.floor(0.15 * brain.neuronCount);
      const olCount = Math.floor(0.15 * brain.neuronCount);
      for (let i = olOffset; i < olOffset + olCount; i++) {
        brain.activations[i] = 1.0;
      }
    } else if (waveType === 'DOPAMINE_BURST') {
      const modOffset = Math.floor(0.98 * brain.neuronCount);
      for (let i = modOffset; i < brain.neuronCount; i++) {
        brain.activations[i] = 1.0;
      }
    } else if (waveType === 'MOTOR_COMMAND') {
      const sezOffset = Math.floor(0.60 * brain.neuronCount);
      for (let i = sezOffset; i < sezOffset + 2000 && i < brain.neuronCount; i++) {
        brain.activations[i] = 1.0;
      }
    }

    setTimeout(() => {
      setActiveSignalWave(null);
    }, 2800);
  }, [brain]);

  // Main Three.js Scene Setup & Render Loop
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x02040a); // Deep cosmic navy/black
    scene.fog = new THREE.FogExp2(0x02040a, 0.04);

    // 2. Camera with near clipping plane 0.01 to allow micro-scale neuron zoom
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 100);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xd1e8ff, 1.3);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x38bdf8, 2.2);
    keyLight.position.set(5, 10, 8);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xa855f7, 1.8);
    rimLight.position.set(-6, -6, -8);
    scene.add(rimLight);

    // 5. Brain Root Group
    const brainGroup = new THREE.Group();
    brainGroupRef.current = brainGroup;
    scene.add(brainGroup);

    // 6. Build 55,000 Neuron Points Geometry with faithful insect brain morphology
    const neuronGeo = new THREE.BufferGeometry();
    const posAttr = new THREE.BufferAttribute(brain.positions.slice(), 3);
    neuronGeo.setAttribute('position', posAttr);

    // Neuron Color Buffer
    const neuronColors = new Float32Array(brain.neuronCount * 3);
    const baseColors = new Float32Array(brain.neuronCount * 3);

    for (let i = 0; i < brain.neuronCount; i++) {
      const regId = brain.regionIds[i];
      const regDef = SYNTHETIC_NEUROPIL_REGIONS[regId] || SYNTHETIC_NEUROPIL_REGIONS[0];
      const col = new THREE.Color(regDef.colorHex);
      baseColors[i * 3 + 0] = col.r;
      baseColors[i * 3 + 1] = col.g;
      baseColors[i * 3 + 2] = col.b;
      neuronColors[i * 3 + 0] = col.r;
      neuronColors[i * 3 + 1] = col.g;
      neuronColors[i * 3 + 2] = col.b;
    }
    const colAttr = new THREE.BufferAttribute(neuronColors, 3);
    neuronGeo.setAttribute('color', colAttr);

    // Points Material using NormalBlending to prevent blinding light blob blowout on zoom
    const pointsMaterial = new THREE.PointsMaterial({
      size: 0.034,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.NormalBlending,
      depthWrite: true,
      depthTest: true,
      sizeAttenuation: true,
    });

    const pointsMesh = new THREE.Points(neuronGeo, pointsMaterial);
    pointsMeshRef.current = pointsMesh;
    brainGroup.add(pointsMesh);

    // 7. Close-Up Selected Neuron Geometric Morphology Group
    const singleNeuronGroup = new THREE.Group();
    brainGroup.add(singleNeuronGroup);

    const somaGeo = new THREE.SphereGeometry(0.042, 16, 16);
    const somaMat = new THREE.MeshLambertMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.6 });
    const somaMesh = new THREE.Mesh(somaGeo, somaMat);
    singleNeuronGroup.add(somaMesh);

    const haloGeo = new THREE.RingGeometry(0.065, 0.075, 24);
    const haloMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    singleNeuronGroup.add(haloMesh);

    // Dendritic tree branch lines
    const dendriteGeo = new THREE.BufferGeometry();
    const dendritePositions = new Float32Array(30); // 5 branches * 2 points * 3 coords
    dendriteGeo.setAttribute('position', new THREE.BufferAttribute(dendritePositions, 3));
    const dendriteMat = new THREE.LineBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.85, linewidth: 2 });
    const dendriteLines = new THREE.LineSegments(dendriteGeo, dendriteMat);
    singleNeuronGroup.add(dendriteLines);

    // Axon projection line
    const axonGeo = new THREE.BufferGeometry();
    const axonPositions = new Float32Array(6);
    axonGeo.setAttribute('position', new THREE.BufferAttribute(axonPositions, 3));
    const axonMat = new THREE.LineBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.95, linewidth: 2 });
    const axonLine = new THREE.LineSegments(axonGeo, axonMat);
    singleNeuronGroup.add(axonLine);

    // 8. Build 3D Synaptic Connection Lines
    const maxVisibleLines = 25000;
    const linePosBuffer = new Float32Array(maxVisibleLines * 6); // 2 vertices per line (x,y,z) * 2
    const lineColBuffer = new Float32Array(maxVisibleLines * 6); // 2 colors per line (r,g,b) * 2

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePosBuffer, 3));
    lineGeo.setAttribute('color', new THREE.BufferAttribute(lineColBuffer, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.35,
      blending: THREE.NormalBlending,
      depthWrite: false,
      linewidth: 1,
    });

    const synapseLines = new THREE.LineSegments(lineGeo, lineMaterial);
    synapseLinesRef.current = synapseLines;
    brainGroup.add(synapseLines);

    // 9. Build Traveling Action Potential Pulse Particles
    const pulseGeo = new THREE.BufferGeometry();
    pulseGeomRef.current = pulseGeo;
    pulseGeo.setAttribute('position', new THREE.BufferAttribute(pulsePositionsRef.current, 3));

    const pulseMaterial = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.08,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    });

    const pulsePoints = new THREE.Points(pulseGeo, pulseMaterial);
    pulseParticlesRef.current = pulsePoints;
    brainGroup.add(pulsePoints);

    // 10. Anatomical Reference Wireframe Axes & Rings
    const compassRingGeo = new THREE.RingGeometry(2.35, 2.38, 48);
    compassRingGeo.rotateX(Math.PI / 2);
    const compassMat = new THREE.MeshBasicMaterial({
      color: 0x0ea5e9,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.12,
    });
    const compassMesh = new THREE.Mesh(compassRingGeo, compassMat);
    compassMesh.position.y = -1.35;
    brainGroup.add(compassMesh);

    // 11. Update Camera from Orbit Coordinates
    const updateCamera = () => {
      const orbit = orbitRef.current;
      const x = orbit.radius * Math.sin(orbit.phi) * Math.sin(orbit.theta);
      const y = orbit.radius * Math.cos(orbit.phi);
      const z = orbit.radius * Math.sin(orbit.phi) * Math.cos(orbit.theta);
      camera.position.set(x, y, z).add(orbit.target);
      camera.lookAt(orbit.target);
    };
    updateCamera();

    // 12. Mouse, Touch & Raycasting Controls
    const raycaster = new THREE.Raycaster();
    raycaster.params.Points = { threshold: 0.07 };
    const mouse = new THREE.Vector2();
    let mouseDownPos = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0) isDraggingRef.current = true;
      if (e.button === 2) isRightDraggingRef.current = true;
      mousePrevRef.current = { x: e.clientX, y: e.clientY };
      mouseDownPos = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - mousePrevRef.current.x;
      const dy = e.clientY - mousePrevRef.current.y;
      mousePrevRef.current = { x: e.clientX, y: e.clientY };

      if (isDraggingRef.current) {
        orbitRef.current.theta -= dx * 0.007;
        orbitRef.current.phi = Math.max(0.05, Math.min(Math.PI - 0.05, orbitRef.current.phi - dy * 0.007));
        updateCamera();
      } else if (isRightDraggingRef.current) {
        // Pan
        const panSpeed = 0.004;
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
        const up = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
        orbitRef.current.target.addScaledVector(right, -dx * panSpeed);
        orbitRef.current.target.addScaledVector(up, dy * panSpeed);
        updateCamera();
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      const dist = Math.hypot(e.clientX - mouseDownPos.x, e.clientY - mouseDownPos.y);
      if (dist < 5 && e.button === 0) {
        // Click raycasting picking
        const rect = domEl.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(pointsMesh);
        if (intersects.length > 0 && intersects[0].index !== undefined) {
          const pickedIdx = intersects[0].index;
          setInspectedNeuronId(pickedIdx);
        }
      }
      isDraggingRef.current = false;
      isRightDraggingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      orbitRef.current.radius = Math.max(0.20, Math.min(12.0, orbitRef.current.radius + e.deltaY * 0.0035));
      updateCamera();
    };

    const onContextMenu = (e: MouseEvent) => e.preventDefault();

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domEl.addEventListener('wheel', onWheel, { passive: false });
    domEl.addEventListener('contextmenu', onContextMenu);

    // 13. Dynamic ResizeObserver on Container
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width || window.innerWidth;
        const h = entry.contentRect.height || window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    });
    resizeObserver.observe(container);

    // 13. Continuous High-Performance Animation Loop
    let animId: number;
    let clock = 0;

    const loop = () => {
      clock += 0.016;

      // Auto rotation
      if (autoRotate && !isDraggingRef.current && !isRightDraggingRef.current) {
        orbitRef.current.theta += 0.0035;
        updateCamera();
      }

      // Live Action Potential Pulses & Neuron Color Dynamics
      const activeColor = new THREE.Color(0xffffff);
      const selCol = new THREE.Color(0x38bdf8);

      for (let i = 0; i < Math.min(2500, brain.neuronCount); i += 2) {
        const act = brain.activations[i];
        const isSelected = i === inspectedNeuronId;
        const regId = brain.regionIds[i];
        const isRegionActive = selectedRegionId === null || selectedRegionId === regId;

        const baseR = baseColors[i * 3 + 0];
        const baseG = baseColors[i * 3 + 1];
        const baseB = baseColors[i * 3 + 2];

        if (!isRegionActive) {
          // Dim non-selected regions
          neuronColors[i * 3 + 0] = baseR * 0.15;
          neuronColors[i * 3 + 1] = baseG * 0.15;
          neuronColors[i * 3 + 2] = baseB * 0.15;
        } else if (isSelected) {
          // Flash selected neuron
          neuronColors[i * 3 + 0] = selCol.r;
          neuronColors[i * 3 + 1] = selCol.g;
          neuronColors[i * 3 + 2] = selCol.b;
        } else if (act > 0.25) {
          // Action potential flash
          const flash = Math.sin(clock * 12 + i) * 0.5 + 0.5;
          neuronColors[i * 3 + 0] = THREE.MathUtils.lerp(baseR, activeColor.r, flash * act);
          neuronColors[i * 3 + 1] = THREE.MathUtils.lerp(baseG, activeColor.g, flash * act);
          neuronColors[i * 3 + 2] = THREE.MathUtils.lerp(baseB, activeColor.b, flash * act);
        } else {
          neuronColors[i * 3 + 0] = baseR;
          neuronColors[i * 3 + 1] = baseG;
          neuronColors[i * 3 + 2] = baseB;
        }
      }
      colAttr.needsUpdate = true;

      // Update Traveling Action Potential Particles Along Synapses
      if (showSignalPulses && synapseLines.visible) {
        const pulsePos = pulsePositionsRef.current;
        const edgeCount = Math.min(synapseDensity, brain.edgeCount);

        for (let p = 0; p < pulsePacketCount; p++) {
          pulseProgressRef.current[p] += pulseSpeedRef.current[p];
          if (pulseProgressRef.current[p] >= 1.0) {
            pulseProgressRef.current[p] = 0;
            pulseEdgeIndexRef.current[p] = Math.floor(Math.random() * edgeCount);
          }

          const edgeIdx = pulseEdgeIndexRef.current[p];
          const srcId = brain.edgeSources[edgeIdx] || 0;
          const dstId = brain.edgeTargets[edgeIdx] || 0;
          const t = pulseProgressRef.current[p];

          const sx = brain.positions[srcId * 3 + 0];
          const sy = brain.positions[srcId * 3 + 1];
          const sz = brain.positions[srcId * 3 + 2];

          const dx = brain.positions[dstId * 3 + 0];
          const dy = brain.positions[dstId * 3 + 1];
          const dz = brain.positions[dstId * 3 + 2];

          pulsePos[p * 3 + 0] = sx + (dx - sx) * t;
          pulsePos[p * 3 + 1] = sy + (dy - sy) * t;
          pulsePos[p * 3 + 2] = sz + (dz - sz) * t;
        }

        if (pulseGeomRef.current) {
          (pulseGeomRef.current.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;
        }
      }

      // Update Close-Up Single Neuron Geometric Morphology (Soma, Dendrites, Axon)
      if (inspectedNeuronId !== null && inspectedNeuronId >= 0 && inspectedNeuronId < brain.neuronCount) {
        singleNeuronGroup.visible = true;
        const nx = brain.positions[inspectedNeuronId * 3 + 0];
        const ny = brain.positions[inspectedNeuronId * 3 + 1];
        const nz = brain.positions[inspectedNeuronId * 3 + 2];
        somaMesh.position.set(nx, ny, nz);
        haloMesh.position.set(nx, ny, nz);
        haloMesh.lookAt(camera.position);

        const regId = brain.regionIds[inspectedNeuronId];
        const regDef = SYNTHETIC_NEUROPIL_REGIONS[regId] || SYNTHETIC_NEUROPIL_REGIONS[0];
        somaMat.color.set(regDef.colorHex);

        // Update dendritic branch endpoints radially around soma
        const dPos = dendritePositions;
        for (let b = 0; b < 5; b++) {
          const angle = (b / 5) * Math.PI * 2 + clock * 0.5;
          const r = 0.075;
          dPos[b * 6 + 0] = nx;
          dPos[b * 6 + 1] = ny;
          dPos[b * 6 + 2] = nz;
          dPos[b * 6 + 3] = nx + Math.cos(angle) * r;
          dPos[b * 6 + 4] = ny + Math.sin(angle) * r;
          dPos[b * 6 + 5] = nz + (Math.sin(angle * 2) * 0.03);
        }
        (dendriteGeo.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;

        // Axon projection pointing forward/downstream
        axonPositions[0] = nx;
        axonPositions[1] = ny;
        axonPositions[2] = nz;
        axonPositions[3] = nx + Math.sin(clock * 2) * 0.03;
        axonPositions[4] = ny - 0.14;
        axonPositions[5] = nz + Math.cos(clock * 2) * 0.03;
        (axonGeo.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;

        // Smoothly glide camera target towards selected neuron if zoomed close
        if (orbitRef.current.radius < 2.5) {
          orbitRef.current.target.lerp(new THREE.Vector3(nx, ny, nz), 0.06);
          updateCamera();
        }
      } else {
        singleNeuronGroup.visible = false;
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      domEl.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domEl.removeEventListener('wheel', onWheel);
      domEl.removeEventListener('contextmenu', onContextMenu);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, [brain, autoRotate, inspectedNeuronId, selectedRegionId, showSignalPulses, synapseDensity]);

  // Update Synaptic Line Buffer when Synapse Density or Filter changes
  useEffect(() => {
    if (!synapseLinesRef.current) return;

    const lineMesh = synapseLinesRef.current;
    lineMesh.visible = showSynapticArcs;
    if (!showSynapticArcs) return;

    const lineGeo = lineMesh.geometry as THREE.BufferGeometry;
    const posAttr = lineGeo.getAttribute('position') as THREE.BufferAttribute;
    const colAttr = lineGeo.getAttribute('color') as THREE.BufferAttribute;

    const linePositions = posAttr.array as Float32Array;
    const lineColors = colAttr.array as Float32Array;

    const visibleTarget = Math.min(synapseDensity, 25000);
    const stride = Math.max(1, Math.floor(brain.edgeCount / visibleTarget));

    let lineIndex = 0;
    const colorACh = new THREE.Color(0x10b981); // Excitatory Emerald
    const colorGABA = new THREE.Color(0xf43f5e); // Inhibitory Rose
    const colorDA = new THREE.Color(0xf59e0b); // Dopamine Amber
    const colorOA = new THREE.Color(0xa855f7); // Octopamine Violet

    for (let e = 0; e < brain.edgeCount && lineIndex < visibleTarget; e += stride) {
      const srcId = brain.edgeSources[e];
      const dstId = brain.edgeTargets[e];
      const edgeType = brain.edgeTypes[e];

      // Filter by synapse type
      if (synapseFilter === 'EXCITATORY' && edgeType !== 0) continue;
      if (synapseFilter === 'INHIBITORY' && edgeType !== 1) continue;
      if (synapseFilter === 'MODULATORY' && edgeType !== 2) continue;

      // Filter by selected neuropil region if active
      if (selectedRegionId !== null) {
        const srcReg = brain.regionIds[srcId];
        const dstReg = brain.regionIds[dstId];
        if (srcReg !== selectedRegionId && dstReg !== selectedRegionId) continue;
      }

      const sx = brain.positions[srcId * 3 + 0];
      const sy = brain.positions[srcId * 3 + 1];
      const sz = brain.positions[srcId * 3 + 2];

      const dx = brain.positions[dstId * 3 + 0];
      const dy = brain.positions[dstId * 3 + 1];
      const dz = brain.positions[dstId * 3 + 2];

      // Choose Color
      let col = colorACh;
      if (edgeType === 1) col = colorGABA;
      else if (edgeType === 2) col = Math.random() < 0.5 ? colorDA : colorOA;

      const idx = lineIndex * 6;
      linePositions[idx + 0] = sx;
      linePositions[idx + 1] = sy;
      linePositions[idx + 2] = sz;
      linePositions[idx + 3] = dx;
      linePositions[idx + 4] = dy;
      linePositions[idx + 5] = dz;

      lineColors[idx + 0] = col.r;
      lineColors[idx + 1] = col.g;
      lineColors[idx + 2] = col.b;
      lineColors[idx + 3] = col.r * 0.7;
      lineColors[idx + 4] = col.g * 0.7;
      lineColors[idx + 5] = col.b * 0.7;

      lineIndex++;
    }

    lineGeo.setDrawRange(0, lineIndex * 2);
    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
  }, [brain, synapseDensity, synapseFilter, selectedRegionId, showSynapticArcs]);

  // Explode / Dissect Neuropils Transform
  useEffect(() => {
    if (!pointsMeshRef.current || !brainGroupRef.current) return;

    const points = pointsMeshRef.current;
    const geom = points.geometry as THREE.BufferGeometry;
    const posAttr = geom.getAttribute('position') as THREE.BufferAttribute;
    const currentPositions = posAttr.array as Float32Array;

    const factor = isExploded ? 1.55 : 1.0;

    for (let i = 0; i < brain.neuronCount; i++) {
      const regId = brain.regionIds[i];
      const def = SYNTHETIC_NEUROPIL_REGIONS[regId] || SYNTHETIC_NEUROPIL_REGIONS[0];

      const origX = brain.positions[i * 3 + 0];
      const origY = brain.positions[i * 3 + 1];
      const origZ = brain.positions[i * 3 + 2];

      const cx = def.center3D[0];
      const cy = def.center3D[1];
      const cz = def.center3D[2];

      if (isExploded) {
        // Expand outward relative to anatomical centroid
        currentPositions[i * 3 + 0] = cx * factor + (origX - cx);
        currentPositions[i * 3 + 1] = cy * factor + (origY - cy);
        currentPositions[i * 3 + 2] = cz * factor + (origZ - cz);
      } else {
        currentPositions[i * 3 + 0] = origX;
        currentPositions[i * 3 + 1] = origY;
        currentPositions[i * 3 + 2] = origZ;
      }
    }

    posAttr.needsUpdate = true;
  }, [isExploded, brain]);

  // Inspected Neuron Details
  const inspectedNeuron = useMemo(() => {
    const id = inspectedNeuronId !== null ? inspectedNeuronId : 420;
    const regId = brain.regionIds[id];
    const region = SYNTHETIC_NEUROPIL_REGIONS[regId] || SYNTHETIC_NEUROPIL_REGIONS[0];
    const x = brain.positions[id * 3 + 0];
    const y = brain.positions[id * 3 + 1];
    const z = brain.positions[id * 3 + 2];
    const act = brain.activations[id] || 0.65;
    const bias = brain.biases[id] || 0.02;
    const thresh = brain.thresholds[id] || -45.0;
    const typeId = brain.typeIds[id];
    const typeName = ['Sensory Receptor', 'Interneuron', 'Central Integrator', 'Kenyon Cell (Memory)', 'Premotor Command', 'Neuromodulatory'][typeId] || 'Interneuron';

    return {
      id,
      region,
      coords: [x, y, z],
      activation: act,
      bias,
      threshold: thresh,
      typeName,
    };
  }, [inspectedNeuronId, brain]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] w-screen h-screen bg-[#02040a] text-slate-100 font-sans select-none overflow-hidden flex flex-col"
    >
      {/* 1. TOP SCIENTIFIC HUD HEADER */}
      <header className="h-14 bg-slate-950/90 border-b border-slate-800/80 backdrop-blur-md px-4 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 shadow-inner">
              <Eye className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300 uppercase">
                  55,000-Neuron AntWire Connectome Fullscreen Studio
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950/90 text-cyan-300 border border-cyan-700/60 shadow-sm">
                  BIOLOGICALLY INFORMED MODEL
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Deutocerebrum • Optic Lobes • Central Complex • Mushroom Bodies • Subesophageal Zone
              </p>
            </div>
          </div>
        </div>

        {/* Action Potential Wave Triggers */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => triggerSensoryWave('OLFACTORY')}
            className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSignalWave === 'OLFACTORY'
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-900/50'
                : 'bg-slate-900/90 hover:bg-slate-800 text-emerald-400 border-emerald-800/50'
            }`}
          >
            <Zap className="w-3.5 h-3.5" /> Fire Olfactory Plume (AL)
          </button>

          <button
            onClick={() => triggerSensoryWave('VISUAL')}
            className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSignalWave === 'VISUAL'
                ? 'bg-pink-600 text-white border-pink-400 shadow-lg shadow-pink-900/50'
                : 'bg-slate-900/90 hover:bg-slate-800 text-pink-400 border-pink-800/50'
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> Fire Visual Looming (OL)
          </button>

          <button
            onClick={() => triggerSensoryWave('DOPAMINE_BURST')}
            className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSignalWave === 'DOPAMINE_BURST'
                ? 'bg-amber-600 text-white border-amber-400 shadow-lg shadow-amber-900/50'
                : 'bg-slate-900/90 hover:bg-slate-800 text-amber-300 border-amber-800/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Phasic Dopamine Burst
          </button>
        </div>

        {/* Viewport Control Buttons & Close */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-2 rounded-lg border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              autoRotate
                ? 'bg-cyan-950/90 text-cyan-300 border-cyan-700'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Toggle Auto-Orbit"
          >
            <RotateCcw className={`w-4 h-4 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
            <span className="hidden sm:inline">Auto-Orbit</span>
          </button>

          <button
            onClick={toggleBrowserFullscreen}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Toggle True Browser Fullscreen"
          >
            {isTrueFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-200 transition-all cursor-pointer"
            title="Exit Fullscreen Viewer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. MAIN 3D CANVAS VIEWPORT */}
      <div className="flex-1 relative w-full h-full overflow-hidden">
        {/* Three.js canvas mounts here */}

        {/* FLOATING HUD: CAMERA PRESETS & ORIENTATION GIZMO */}
        <div className="absolute top-3 left-3 z-10 flex items-start gap-1 pointer-events-auto max-h-[calc(100vh-120px)] max-w-[calc(100vw-32px)] sm:max-w-xs">
          {leftPanelOpen && (
            <div className="flex flex-col gap-2 max-h-[calc(100vh-140px)] overflow-y-auto no-scrollbar pr-0.5">
              {/* Camera Angles Bar */}
              <div className="p-2 rounded-xl bg-slate-950/85 border border-slate-800/80 backdrop-blur-md shadow-2xl flex items-center gap-1 text-[10px] flex-wrap">
                <span className="text-slate-400 font-bold px-1 flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-cyan-400" /> Presets:
                </span>
                <button
                  onClick={() => applyCameraPreset('ANTERIOR')}
                  className="px-2 py-1 rounded hover:bg-slate-800 text-cyan-300 font-medium transition-all cursor-pointer"
                  title="Anterior / Frontal View (Antennal Lobes & SEZ)"
                >
                  Anterior
                </button>
                <button
                  onClick={() => applyCameraPreset('DORSAL')}
                  className="px-2 py-1 rounded hover:bg-slate-800 text-amber-300 font-medium transition-all cursor-pointer"
                  title="Dorsal / Top View (Mushroom Body Calyces)"
                >
                  Dorsal
                </button>
                <button
                  onClick={() => applyCameraPreset('LATERAL_L')}
                  className="px-2 py-1 rounded hover:bg-slate-800 text-pink-300 font-medium transition-all cursor-pointer"
                  title="Lateral Left View (Left Optic Lobe)"
                >
                  Lateral
                </button>
                <button
                  onClick={() => applyCameraPreset('VENTRAL')}
                  className="px-2 py-1 rounded hover:bg-slate-800 text-purple-300 font-medium transition-all cursor-pointer"
                  title="Ventral View (Subesophageal Motor Zone)"
                >
                  Ventral
                </button>
                <button
                  onClick={() => applyCameraPreset('ISOMETRIC')}
                  className="px-2 py-1 rounded bg-slate-800 text-slate-200 font-bold transition-all cursor-pointer"
                >
                  Isometric 3D
                </button>
              </div>

              {/* Neuropil Region Selection Pill List */}
              <div className="p-2.5 rounded-xl bg-slate-950/85 border border-slate-800/80 backdrop-blur-md shadow-2xl space-y-1.5 max-w-xs text-[10px]">
                <div className="flex items-center justify-between text-slate-300 font-bold pb-1 border-b border-slate-800/80">
                  <span className="flex items-center gap-1.5 text-cyan-300">
                    <Layers className="w-3.5 h-3.5" /> Neuropil Lobes (12 Regions)
                  </span>
                  {selectedRegionId !== null && (
                    <button
                      onClick={() => setSelectedRegionId(null)}
                      className="text-[9px] text-rose-400 hover:underline cursor-pointer"
                    >
                      Reset Filter
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto pr-1">
                  <button
                    onClick={() => setSelectedRegionId(null)}
                    className={`col-span-2 p-1 rounded font-bold text-left transition-all cursor-pointer ${
                      selectedRegionId === null
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                        : 'text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    ● ALL NEUROPILS (55k)
                  </button>

                  {SYNTHETIC_NEUROPIL_REGIONS.map((r) => {
                    const count = Math.round(r.ratio * brain.neuronCount);
                    const isSelected = selectedRegionId === r.regionId;

                    return (
                      <button
                        key={r.regionId}
                        onClick={() => setSelectedRegionId(isSelected ? null : r.regionId)}
                        className={`p-1.5 rounded transition-all flex items-center justify-between truncate cursor-pointer text-left ${
                          isSelected
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow'
                            : 'text-slate-300 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="w-2 h-2 rounded-full inline-block shrink-0" style={{ backgroundColor: r.colorHex }} />
                          <span className="truncate font-medium">{r.code}</span>
                        </div>
                        <span className="text-[9px] font-mono text-slate-500">{count.toLocaleString()}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          <button
            onClick={() => setLeftPanelOpen(!leftPanelOpen)}
            className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-slate-200 shadow-xl cursor-pointer"
            title={leftPanelOpen ? 'Collapse Controls' : 'Expand Controls'}
          >
            {leftPanelOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* FLOATING HUD: SYNAPTIC TRANSMISSION & DISSECTION CONTROLS */}
        <div className="absolute top-3 right-3 z-10 flex items-start gap-1 pointer-events-auto max-h-[calc(100vh-120px)] max-w-[calc(100vw-32px)] sm:max-w-sm">
          <button
            onClick={() => setRightPanelOpen(!rightPanelOpen)}
            className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-slate-200 shadow-xl cursor-pointer"
            title={rightPanelOpen ? 'Collapse Inspector' : 'Expand Inspector'}
          >
            {rightPanelOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {rightPanelOpen && (
            <div className="flex flex-col gap-2 max-h-[calc(100vh-140px)] overflow-y-auto no-scrollbar pr-0.5">
              {/* Synaptic Density & Neurotransmitter Filter Card */}
              <div className="p-3 rounded-xl bg-slate-950/85 border border-slate-800/80 backdrop-blur-md shadow-2xl space-y-2.5 text-[11px]">
                <div className="flex items-center justify-between text-slate-200 font-bold border-b border-slate-800/80 pb-1.5">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <Activity className="w-4 h-4" /> 3D Synaptic Connections
                  </span>
                  <span className="text-[10px] font-mono text-emerald-300">
                    {synapseDensity.toLocaleString()} Arcs
                  </span>
                </div>

                {/* Synapse Density Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Active Synaptic Tracts Density:</span>
                    <span className="font-mono text-cyan-300">{synapseDensity} lines</span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="25000"
                    step="1000"
                    value={synapseDensity}
                    onChange={(e) => setSynapseDensity(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-[8px] font-mono text-slate-500">
                    <span>1,000 (Low)</span>
                    <span>6,000 (Balanced)</span>
                    <span>25,000 (Dense)</span>
                  </div>
                </div>

                {/* Neurotransmitter Filter Buttons */}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 block">Neurotransmitter Channel Filter:</span>
                  <div className="grid grid-cols-2 gap-1 text-[9px]">
                    <button
                      onClick={() => setSynapseFilter('ALL')}
                      className={`p-1 rounded font-bold transition-all cursor-pointer ${
                        synapseFilter === 'ALL'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      All (ACh, GABA, DA)
                    </button>
                    <button
                      onClick={() => setSynapseFilter('EXCITATORY')}
                      className={`p-1 rounded font-bold transition-all cursor-pointer ${
                        synapseFilter === 'EXCITATORY'
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Excitatory (ACh)
                    </button>
                    <button
                      onClick={() => setSynapseFilter('INHIBITORY')}
                      className={`p-1 rounded font-bold transition-all cursor-pointer ${
                        synapseFilter === 'INHIBITORY'
                          ? 'bg-rose-950 text-rose-300 border border-rose-700'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Inhibitory (GABA)
                    </button>
                    <button
                      onClick={() => setSynapseFilter('MODULATORY')}
                      className={`p-1 rounded font-bold transition-all cursor-pointer ${
                        synapseFilter === 'MODULATORY'
                          ? 'bg-amber-950 text-amber-300 border border-amber-700'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Modulatory (DA/OA)
                    </button>
                  </div>
                </div>

                {/* Toggles: Signal Pulses & Anatomical Explode */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px]">
                  <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showSignalPulses}
                      onChange={(e) => setShowSignalPulses(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-800 text-cyan-500 accent-cyan-500"
                    />
                    Traveling AP Pulses
                  </label>

                  <button
                    onClick={() => setIsExploded(!isExploded)}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                      isExploded
                        ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {isExploded ? 'Collapse Lobes' : 'Explode Neuropils'}
                  </button>
                </div>
              </div>

              {/* Node Biophysics Inspector Card */}
              <div className="p-3 rounded-xl bg-slate-950/85 border border-slate-800/80 backdrop-blur-md shadow-2xl space-y-2 text-[11px]">
                <div className="flex items-center justify-between text-slate-200 font-bold border-b border-slate-800/80 pb-1.5">
                  <span className="flex items-center gap-1.5 text-cyan-300">
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" /> Neuron Biophysics Inspector
                  </span>
                  <span className="font-mono text-cyan-400 bg-slate-900 px-1.5 py-0.5 rounded text-[9px]">
                    N#{inspectedNeuron.id}
                  </span>
                </div>

                <div className="space-y-1 text-[10.5px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Neuropil Region:</span>
                    <span className="font-bold text-slate-200">{inspectedNeuron.region.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cell Category:</span>
                    <span className="font-mono text-cyan-300">{inspectedNeuron.typeName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">3D Position:</span>
                    <span className="font-mono text-slate-300 text-[9.5px]">
                      [{inspectedNeuron.coords[0].toFixed(2)}, {inspectedNeuron.coords[1].toFixed(2)}, {inspectedNeuron.coords[2].toFixed(2)}]
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Membrane Activation:</span>
                    <span className="font-mono text-emerald-400 font-bold">{inspectedNeuron.activation.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Resting Bias:</span>
                    <span className="font-mono text-amber-300">{inspectedNeuron.bias.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Threshold:</span>
                    <span className="font-mono text-rose-400">{inspectedNeuron.threshold.toFixed(1)} mV</span>
                  </div>
                </div>

                {/* Quick Switch Neuron Input */}
                <div className="flex items-center gap-1.5 pt-1">
                  <input
                    type="number"
                    min="0"
                    max={brain.neuronCount - 1}
                    value={inspectedNeuronId ?? 420}
                    onChange={(e) => setInspectedNeuronId(Math.max(0, Math.min(brain.neuronCount - 1, parseInt(e.target.value) || 0)))}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-[10px] text-cyan-300 font-mono"
                    placeholder="Neuron ID (0-54999)"
                  />
                  <button
                    onClick={() => setInspectedNeuronId(Math.floor(Math.random() * brain.neuronCount))}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[9px] font-bold cursor-pointer"
                  >
                    Random
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM STATUS BAR: BIOLOGICAL STATS & REAL-TIME CONNECTOME METRICS */}
        <footer className="absolute bottom-2 left-2 right-2 sm:left-4 sm:right-4 z-10 flex flex-wrap items-center justify-between gap-2 p-2 sm:p-2.5 rounded-xl bg-slate-950/90 border border-slate-800/80 backdrop-blur-md shadow-2xl text-[10px] sm:text-[11px] pointer-events-auto">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span className="font-bold text-slate-200">55k Neurons Online</span>
            </div>
            <span className="hidden sm:inline text-slate-600">|</span>
            <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
              <span>Weights:</span>
              <span className="font-mono text-emerald-400">Glorot Zero-Centered</span>
            </div>
            <span className="hidden sm:inline text-slate-600">|</span>
            <div className="flex items-center gap-1.5 text-slate-400">
              <span>Synaptic Graph:</span>
              <span className="font-mono text-cyan-300">~357,500 Edges</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 ml-auto">
            <div className="hidden lg:flex items-center gap-1.5 text-slate-400">
              <span>Navigation:</span>
              <span className="text-slate-300 font-mono text-[10px]">Left Drag: Rotate • Right Drag: Pan • Wheel: Zoom</span>
            </div>
            <button
              onClick={onClose}
              className="px-2.5 sm:px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[10px] sm:text-[11px] shadow-md transition-all cursor-pointer"
            >
              Back to Neural Lab
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
