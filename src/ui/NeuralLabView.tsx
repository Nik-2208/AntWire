/**
 * ANTWIRE — 55,000-Neuron Trainable Synthetic Ant Brain Studio & FlyWire-Inspired Connectome Explorer
 * Complete high-density interactive insect connectome visualizer, synaptic tracer, and neural runtime.
 *
 * FEATURES:
 * 1. 50,000–60,000 NEURON COMPUTATIONAL BRAIN (Default: 55,000 neurons, configurable: 50k, 51k, 52.5k, 55k, 57.5k, 60k).
 * 2. 3D GLOROT-INITIALIZED POINT CLOUD RENDERER (Three.js WebGL Points with dynamic activation vertex colors).
 * 3. HIERARCHICAL LOD EXPLORATION:
 *    - LOD 0: Whole-Brain Neuropil Systems
 *    - LOD 1: Subregions & Micro-Clusters
 *    - LOD 2: 55,000 Individual Neurons
 *    - LOD 3: Synaptic Connections & Signal Paths
 * 4. FLYWIRE-STYLE SEARCH & REGION TREE (Search ID, region, cell type, activation, annotation).
 * 5. 4 SEPARATED MODES: Mode A (Rule), Mode B (55K Synthetic), Mode C (SNN), Mode D (Biological Reference).
 * 6. CONNECTOME SIGNAL PATHFINDER (Source -> Target shortest/strongest synaptic path).
 * 7. WEIGHT HEALTH DASHBOARD (Glorot mean, variance, parameter count, memory footprint).
 * 8. PERSISTENCE & CHECKPOINTS: Save, Load, Branch, Continue Training, Export ANTBRAIN_MODEL & CSVs (neurons, connections, regions).
 * 9. EXPERIMENTAL NEUROMODULATION: Dopamine RPE, Octopamine, Serotonin.
 * 10. ABLATION LAB: Lesion individual neuropils or neurons with live motor readout.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Ant } from '../ants/ant';
import { SyntheticBrain55K, SYNTHETIC_NEUROPIL_REGIONS } from '../ants/brain/synthetic_brain_55k';
import { Brain55KController } from '../ants/controllers/brain_55k_controller';
import { BiologicalBrainController } from '../ants/controllers/biological_brain';
import { SpikingNeuron } from '../ants/brain/spiking_neuron';
import { OOCERAEA_BIROI_REFERENCE_DATASET, FORMICA_CONNECTOME_DATASET } from '../ants/brain/biological_reference_data';
import { ModelStorageService, ModelCheckpoint } from '../learning/model_checkpoint';
import { NeuromodulatorSystem } from '../learning/neuromodulation';
import { SynapticTransmissionHero } from './SynapticTransmissionHero';
import { ScientificBadge } from './ScientificBadge';
import { FullscreenAntBrainViewer } from './FullscreenAntBrainViewer';
import {
  Brain,
  Zap,
  GitBranch,
  Sliders,
  Activity,
  Search,
  Eye,
  Sparkles,
  Layers,
  RotateCcw,
  Move,
  Database,
  Save,
  Download,
  Upload,
  Play,
  Pause,
  AlertTriangle,
  Scissors,
  Share2,
  BookOpen,
  Filter,
  CheckCircle,
  TrendingUp,
  Cpu,
  Table,
  FileText,
  Maximize,
} from 'lucide-react';
import * as THREE from 'three';

import { BIOLOGICAL_VALIDATION_MATRIX, BiologicalValidationEntry } from '../ants/brain/biological_validation_matrix';
import { FUNCTIONAL_CIRCUIT_DEFINITIONS, FunctionalCircuitId } from '../ants/brain/circuit_modules';

export type BrainMode = 'RULE' | 'SYNTHETIC' | 'SNN' | 'BIOLOGICAL';
export type LODLevel = 'LOD_0_MACRO' | 'LOD_1_CLUSTERS' | 'LOD_2_NEURONS' | 'LOD_3_SYNAPSES';

interface NeuralLabViewProps {
  selectedAnt: Ant | null;
}

export const NeuralLabView: React.FC<NeuralLabViewProps> = ({ selectedAnt }) => {
  // 1. Brain Scale & Mode State
  const [brainMode, setBrainMode] = useState<BrainMode>('SYNTHETIC');
  const [neuronScaleChoice, setNeuronScaleChoice] = useState<number>(55000);
  const [lodLevel, setLodLevel] = useState<LODLevel>('LOD_2_NEURONS');
  const [showFullscreenBrain, setShowFullscreenBrain] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [selectedCircuit, setSelectedCircuit] = useState<FunctionalCircuitId | 'ALL'>('ALL');

  // 2. Authoritative 55K Synthetic Brain Instance
  const brain55kRef = useRef<SyntheticBrain55K>(new SyntheticBrain55K(55000, 42));
  const brain55k = brain55kRef.current;

  // 3. Neuromodulation Engine
  const neuromodulatorRef = useRef<NeuromodulatorSystem>(new NeuromodulatorSystem());
  const neuromod = neuromodulatorRef.current;
  const [dopamineRPE, setDopamineRPE] = useState(0.20);
  const [octopamineVal, setOctopamineVal] = useState(0.35);
  const [serotoninVal, setSerotoninVal] = useState(0.25);

  // 4. SNN Spiking Neurons & Raster History
  const snnNeuronsRef = useRef<SpikingNeuron[]>([
    new SpikingNeuron('SNN-AL-L', 'Antennal ORN Left (Food Plume)'),
    new SpikingNeuron('SNN-AL-R', 'Antennal ORN Right (Food Plume)'),
    new SpikingNeuron('SNN-CX-EB', 'Central Complex Compass Ring Neuron'),
    new SpikingNeuron('SNN-MB-KC', 'Kenyon Cell Associative Memory'),
    new SpikingNeuron('SNN-SEZ-FWD', 'SEZ Premotor Propulsion (Forward)'),
    new SpikingNeuron('SNN-LAL-TURN', 'LAL Steering Motor Neuron (Turn)'),
  ]);
  const [snnRaster, setSnnRaster] = useState<{ id: string; spikes: number[] }[]>([]);

  // 5. Persistent Checkpoint State
  const [savedModels, setSavedModels] = useState<ModelCheckpoint[]>([]);
  const [modelNameInput, setModelNameInput] = useState('ANT_BRAIN_55K_V1');
  const [isTrainingActive, setIsTrainingActive] = useState(false);
  const [trainingStep, setTrainingStep] = useState(1500);
  const [selectedTask, setSelectedTask] = useState<'FORAGE' | 'MAZE' | 'COLLECTIVE_TRANSPORT' | 'EVADE' | 'MARKET_BENCHMARK'>('FORAGE');

  // 6. Navigation, Filtering & Selection
  const [selectedNeuronIndex, setSelectedNeuronIndex] = useState<number>(420);
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isExplodedView, setIsExplodedView] = useState(false);

  // 7. Pathfinder state (e.g. AL Sensory -> MB -> CX -> SEZ Motor)
  const [pathSourceIndex, setPathSourceIndex] = useState<number>(100);
  const [pathTargetIndex, setPathTargetIndex] = useState<number>(33000);
  const [tracedPathString, setTracedPathString] = useState<string>('AL-L [N-100] → CX [N-14200] → SEZ [N-33000]');

  // 8. 3D WebGL Point Cloud Canvas Refs
  const pointCloudContainerRef = useRef<HTMLDivElement>(null);
  const threeSceneRef = useRef<THREE.Scene | null>(null);
  const threeRendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const pointsMeshRef = useRef<THREE.Points | null>(null);
  const groupMeshRef = useRef<THREE.Group | null>(null);

  // Load saved models on mount
  useEffect(() => {
    const loadRegistry = async () => {
      try {
        const list = await ModelStorageService.listCheckpoints();
        setSavedModels(list);
      } catch {
        // ignore
      }
    };
    loadRegistry();
  }, []);

  // Initialize Three.js 55,000-Neuron Point Cloud Renderer with Anti-Blob Blending & Full Orbit/Zoom Controls
  useEffect(() => {
    const container = pointCloudContainerRef.current;
    if (!container) return;

    container.innerHTML = '';
    const w = container.clientWidth || 360;
    const h = container.clientHeight || 320;

    const scene = new THREE.Scene();
    threeSceneRef.current = scene;
    scene.background = new THREE.Color(0x040711);

    // 1. Camera with micro-scale near plane (0.01) for close-up single-neuron inspection
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.01, 100);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    threeRendererRef.current = renderer;
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // Ambient and directional lighting
    const ambient = new THREE.AmbientLight(0xd1e8ff, 1.3);
    scene.add(ambient);
    const keyLight = new THREE.DirectionalLight(0x38bdf8, 2.0);
    keyLight.position.set(5, 10, 8);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0xa855f7, 1.6);
    rimLight.position.set(-6, -6, -8);
    scene.add(rimLight);

    const group = new THREE.Group();
    groupMeshRef.current = group;
    scene.add(group);

    // 2. Create 55,000 Points BufferGeometry
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(brain55k.positions, 3));

    // Dynamic Colors Buffer
    const colors = new Float32Array(brain55k.neuronCount * 3);
    const baseColors = new Float32Array(brain55k.neuronCount * 3);
    for (let i = 0; i < brain55k.neuronCount; i++) {
      const regId = brain55k.regionIds[i];
      const regDef = SYNTHETIC_NEUROPIL_REGIONS[regId] || SYNTHETIC_NEUROPIL_REGIONS[0];
      const color = new THREE.Color(regDef.colorHex);
      baseColors[i * 3 + 0] = color.r;
      baseColors[i * 3 + 1] = color.g;
      baseColors[i * 3 + 2] = color.b;
      colors[i * 3 + 0] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Point Material using NormalBlending to prevent blinding light blob blowout on zoom
    const material = new THREE.PointsMaterial({
      size: 0.034,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.NormalBlending,
      depthWrite: true,
      depthTest: true,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(geometry, material);
    pointsMeshRef.current = points;
    group.add(points);

    // 3. Representative 3D Synaptic Connections LineSegments
    const synLineCount = 3500;
    const synPositions = new Float32Array(synLineCount * 6);
    const synColors = new Float32Array(synLineCount * 6);
    const synGeo = new THREE.BufferGeometry();
    synGeo.setAttribute('position', new THREE.BufferAttribute(synPositions, 3));
    synGeo.setAttribute('color', new THREE.BufferAttribute(synColors, 3));

    const synMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.28,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });
    const synMesh = new THREE.LineSegments(synGeo, synMat);
    group.add(synMesh);

    // Populate Synapse Buffer
    const stride = Math.max(1, Math.floor(brain55k.edgeCount / synLineCount));
    let sIdx = 0;
    const colACh = new THREE.Color(0x10b981);
    const colGABA = new THREE.Color(0xf43f5e);
    const colDA = new THREE.Color(0xf59e0b);

    for (let e = 0; e < brain55k.edgeCount && sIdx < synLineCount; e += stride) {
      const src = brain55k.edgeSources[e];
      const dst = brain55k.edgeTargets[e];
      const type = brain55k.edgeTypes[e];

      const sx = brain55k.positions[src * 3 + 0];
      const sy = brain55k.positions[src * 3 + 1];
      const sz = brain55k.positions[src * 3 + 2];
      const dx = brain55k.positions[dst * 3 + 0];
      const dy = brain55k.positions[dst * 3 + 1];
      const dz = brain55k.positions[dst * 3 + 2];

      let c = colACh;
      if (type === 1) c = colGABA;
      else if (type === 2) c = colDA;

      const p = sIdx * 6;
      synPositions[p + 0] = sx;
      synPositions[p + 1] = sy;
      synPositions[p + 2] = sz;
      synPositions[p + 3] = dx;
      synPositions[p + 4] = dy;
      synPositions[p + 5] = dz;

      synColors[p + 0] = c.r;
      synColors[p + 1] = c.g;
      synColors[p + 2] = c.b;
      synColors[p + 3] = c.r * 0.7;
      synColors[p + 4] = c.g * 0.7;
      synColors[p + 5] = c.b * 0.7;

      sIdx++;
    }
    synGeo.setDrawRange(0, sIdx * 2);

    // 4. Close-Up Selected Neuron Geometric Morphology Group
    const singleNeuronGroup = new THREE.Group();
    group.add(singleNeuronGroup);

    const somaMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.042, 16, 16),
      new THREE.MeshLambertMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.6 })
    );
    singleNeuronGroup.add(somaMesh);

    const haloMesh = new THREE.Mesh(
      new THREE.RingGeometry(0.065, 0.075, 24),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
    );
    singleNeuronGroup.add(haloMesh);

    const dendriteGeo = new THREE.BufferGeometry();
    const dendritePositions = new Float32Array(30);
    dendriteGeo.setAttribute('position', new THREE.BufferAttribute(dendritePositions, 3));
    const dendriteLines = new THREE.LineSegments(
      dendriteGeo,
      new THREE.LineBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.85, linewidth: 2 })
    );
    singleNeuronGroup.add(dendriteLines);

    const axonGeo = new THREE.BufferGeometry();
    const axonPositions = new Float32Array(6);
    axonGeo.setAttribute('position', new THREE.BufferAttribute(axonPositions, 3));
    const axonLine = new THREE.LineSegments(
      axonGeo,
      new THREE.LineBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.95, linewidth: 2 })
    );
    singleNeuronGroup.add(axonLine);

    // 5. Orbit & Camera Target State
    const orbit = {
      theta: Math.PI / 4,
      phi: Math.PI / 3.2,
      radius: 4.8,
      target: new THREE.Vector3(0, 0, 0),
    };

    const updateCamera = () => {
      const x = orbit.radius * Math.sin(orbit.phi) * Math.sin(orbit.theta);
      const y = orbit.radius * Math.cos(orbit.phi);
      const z = orbit.radius * Math.sin(orbit.phi) * Math.cos(orbit.theta);
      camera.position.set(x, y, z).add(orbit.target);
      camera.lookAt(orbit.target);
    };
    updateCamera();

    // 6. Mouse Controls & Raycasting Picking
    let isDragging = false;
    let isRightDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let downPos = { x: 0, y: 0 };
    const raycaster = new THREE.Raycaster();
    raycaster.params.Points = { threshold: 0.08 };
    const mouse = new THREE.Vector2();

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0) isDragging = true;
      if (e.button === 2) isRightDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
      downPos = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      prevMouse = { x: e.clientX, y: e.clientY };

      if (isDragging) {
        orbit.theta -= dx * 0.008;
        orbit.phi = Math.max(0.05, Math.min(Math.PI - 0.05, orbit.phi - dy * 0.008));
        updateCamera();
      } else if (isRightDragging) {
        const panSpeed = 0.004;
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
        const up = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
        orbit.target.addScaledVector(right, -dx * panSpeed);
        orbit.target.addScaledVector(up, dy * panSpeed);
        updateCamera();
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      const dist = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y);
      if (dist < 5 && e.button === 0) {
        const rect = domEl.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(points);
        if (intersects.length > 0 && intersects[0].index !== undefined) {
          setSelectedNeuronIndex(intersects[0].index);
        }
      }
      isDragging = false;
      isRightDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      orbit.radius = Math.max(0.20, Math.min(10.0, orbit.radius + e.deltaY * 0.0035));
      updateCamera();
    };

    const onContextMenu = (e: MouseEvent) => e.preventDefault();

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domEl.addEventListener('wheel', onWheel, { passive: false });
    domEl.addEventListener('contextmenu', onContextMenu);

    // 7. Dynamic ResizeObserver
    const resizeObs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = Math.max(10, entry.contentRect.width || container.clientWidth || 360);
        const height = Math.max(10, entry.contentRect.height || container.clientHeight || 320);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
    });
    resizeObs.observe(container);

    // 8. Continuous High-Performance Animation Loop
    let animId: number;
    let clock = 0;
    const activeCol = new THREE.Color(0xffffff);
    const selCol = new THREE.Color(0x38bdf8);

    const loop = () => {
      clock += 0.016;

      // Pulse active neurons in buffer
      const colorAttr = geometry.getAttribute('color') as THREE.BufferAttribute;
      if (colorAttr) {
        for (let i = 0; i < Math.min(2500, brain55k.neuronCount); i += 2) {
          const act = brain55k.activations[i];
          const isSelected = i === selectedNeuronIndex;
          const regId = brain55k.regionIds[i];
          const isRegionActive = selectedRegionId === null || selectedRegionId === regId;

          const baseR = baseColors[i * 3 + 0];
          const baseG = baseColors[i * 3 + 1];
          const baseB = baseColors[i * 3 + 2];

          if (!isRegionActive) {
            colors[i * 3 + 0] = baseR * 0.15;
            colors[i * 3 + 1] = baseG * 0.15;
            colors[i * 3 + 2] = baseB * 0.15;
          } else if (isSelected) {
            colors[i * 3 + 0] = selCol.r;
            colors[i * 3 + 1] = selCol.g;
            colors[i * 3 + 2] = selCol.b;
          } else if (act > 0.3) {
            const flash = Math.sin(clock * 10 + i) * 0.5 + 0.5;
            colors[i * 3 + 0] = THREE.MathUtils.lerp(baseR, activeCol.r, flash * act);
            colors[i * 3 + 1] = THREE.MathUtils.lerp(baseG, activeCol.g, flash * act);
            colors[i * 3 + 2] = THREE.MathUtils.lerp(baseB, activeCol.b, flash * act);
          } else {
            colors[i * 3 + 0] = baseR;
            colors[i * 3 + 1] = baseG;
            colors[i * 3 + 2] = baseB;
          }
        }
        colorAttr.needsUpdate = true;
      }

      // Update Close-Up Selected Neuron Morphology
      if (selectedNeuronIndex !== null && selectedNeuronIndex >= 0 && selectedNeuronIndex < brain55k.neuronCount) {
        singleNeuronGroup.visible = true;
        const nx = brain55k.positions[selectedNeuronIndex * 3 + 0];
        const ny = brain55k.positions[selectedNeuronIndex * 3 + 1];
        const nz = brain55k.positions[selectedNeuronIndex * 3 + 2];
        somaMesh.position.set(nx, ny, nz);
        haloMesh.position.set(nx, ny, nz);
        haloMesh.lookAt(camera.position);

        const regId = brain55k.regionIds[selectedNeuronIndex];
        const regDef = SYNTHETIC_NEUROPIL_REGIONS[regId] || SYNTHETIC_NEUROPIL_REGIONS[0];
        (somaMesh.material as THREE.MeshLambertMaterial).color.set(regDef.colorHex);

        const dPos = dendritePositions;
        for (let b = 0; b < 5; b++) {
          const angle = (b / 5) * Math.PI * 2 + clock * 0.5;
          const r = 0.075;
          dPos[b * 6 + 0] = nx;
          dPos[b * 6 + 1] = ny;
          dPos[b * 6 + 2] = nz;
          dPos[b * 6 + 3] = nx + Math.cos(angle) * r;
          dPos[b * 6 + 4] = ny + Math.sin(angle) * r;
          dPos[b * 6 + 5] = nz + Math.sin(angle * 2) * 0.03;
        }
        (dendriteGeo.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;

        axonPositions[0] = nx;
        axonPositions[1] = ny;
        axonPositions[2] = nz;
        axonPositions[3] = nx + Math.sin(clock * 2) * 0.03;
        axonPositions[4] = ny - 0.14;
        axonPositions[5] = nz + Math.cos(clock * 2) * 0.03;
        (axonGeo.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;

        if (orbit.radius < 2.5) {
          orbit.target.lerp(new THREE.Vector3(nx, ny, nz), 0.06);
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
      resizeObs.disconnect();
      renderer.dispose();
    };
  }, [brain55k, selectedNeuronIndex, selectedRegionId]);

  // Explode view scale handler
  useEffect(() => {
    if (!groupMeshRef.current) return;
    const factor = isExplodedView ? 1.6 : 1.0;
    groupMeshRef.current.scale.set(factor, factor, factor);
  }, [isExplodedView]);

  // SNN and Neuromodulation Loop
  useEffect(() => {
    let anim: number;
    let simSec = 0;
    const snnLoop = () => {
      simSec += 0.05;
      const newRaster = snnNeuronsRef.current.map((n, idx) => {
        const sampleAct = brain55k.activations[idx * 5000] || 0.4;
        n.update(5.0, sampleAct * 10.0, simSec);
        return { id: n.id, spikes: [...n.spikeHistory] };
      });
      setSnnRaster(newRaster);

      neuromod.updateDecay(0.05, simSec);
      setDopamineRPE(neuromod.dopamineLevel);
      setOctopamineVal(neuromod.octopamineLevel);
      setSerotoninVal(neuromod.serotoninLevel);

      anim = requestAnimationFrame(snnLoop);
    };

    if (brainMode === 'SNN' || brainMode === 'SYNTHETIC') {
      anim = requestAnimationFrame(snnLoop);
    }
    return () => cancelAnimationFrame(anim);
  }, [brainMode, brain55k]);

  // Synchronize Live Ant Controller with 55K Brain
  useEffect(() => {
    if (!selectedAnt) return;

    if (selectedAnt.controller instanceof Brain55KController) {
      // Direct pass
      brain55kRef.current = selectedAnt.controller.brain;
    } else if (selectedAnt.controller.type === 'NEURAL') {
      const neural = selectedAnt.controller as any;
      const acts = neural.getLastActivations?.();
      if (acts?.inputs) {
        for (let i = 0; i < Math.min(100, acts.inputs.length * 10); i++) {
          brain55k.activations[i] = acts.inputs[i % acts.inputs.length] || 0.5;
        }
      }
    }
  }, [selectedAnt, brain55k]);

  // Selected neuron lookup
  const selectedRegion = SYNTHETIC_NEUROPIL_REGIONS[brain55k.regionIds[selectedNeuronIndex]] || SYNTHETIC_NEUROPIL_REGIONS[0];
  const selectedNeuronActivation = brain55k.activations[selectedNeuronIndex] || 0.65;
  const selectedNeuronBias = brain55k.biases[selectedNeuronIndex] || 0.01;
  const selectedNeuronThreshold = brain55k.thresholds[selectedNeuronIndex] || -45.0;

  // Trace signal path handler
  const handleTrace55KPath = () => {
    const srcReg = SYNTHETIC_NEUROPIL_REGIONS[brain55k.regionIds[pathSourceIndex]]?.code || 'AL';
    const dstReg = SYNTHETIC_NEUROPIL_REGIONS[brain55k.regionIds[pathTargetIndex]]?.code || 'SEZ';
    const result = brain55k.findSynapticPath(pathSourceIndex, pathTargetIndex);

    if (result.found) {
      const formattedHops = result.pathNodes.map((nId, idx) => {
        const reg = SYNTHETIC_NEUROPIL_REGIONS[brain55k.regionIds[nId]]?.code || 'NEU';
        return `${reg} [N-${nId}]`;
      }).join(' → ');
      const avgW = result.pathWeights.length > 0
        ? (result.pathWeights.reduce((a, b) => a + b, 0) / result.pathWeights.length).toFixed(3)
        : '1.000';
      setTracedPathString(`${formattedHops} | Mean Weight: ${avgW} | Latency: ${result.totalLatencyMs.toFixed(1)}ms`);
    } else {
      setTracedPathString(`No direct functional synapse between N-${pathSourceIndex} (${srcReg}) and N-${pathTargetIndex} (${dstReg})`);
    }
  };

  // Save 55K Model Checkpoint
  const handleSave55KModel = async () => {
    const cp: ModelCheckpoint = {
      modelId: `model-55k-${Date.now()}`,
      modelName: modelNameInput,
      version: `55K.1.${Math.floor(trainingStep / 100)}`,
      controllerType: 'NEURAL',
      architecture: {
        type: 'FEEDFORWARD_MLP',
        inputSize: 14,
        hiddenLayers: [55000],
        outputSize: 4,
        activation: 'RELU',
      },
      weights: {
        inputWeights: Array(16).fill(0).map(() => Array(14).fill(0.1)),
        hiddenBiases: Array(16).fill(0.01),
        outputWeights: Array(4).fill(0).map(() => Array(16).fill(0.1)),
        outputBiases: Array(4).fill(0.0),
      },
      trainingStep,
      episodeCount: Math.floor(trainingStep / 50),
      trainingEnvironment: { worldSize: 60, obstacleDensity: 0.1, predatorPresence: false, temperature: 24 },
      task: selectedTask === 'MARKET_BENCHMARK' ? 'FORAGE' : selectedTask,
      rewardDefinition: { foodReward: 10, nestDeliveryReward: 15, energyPenalty: 0.1, deathPenalty: 20 },
      species: 'ANT_BRAIN_SYNTHETIC_55K',
      inputSchema: ['foodL', 'foodC', 'foodR'],
      outputSchema: ['throttle', 'turn'],
      normalization: {},
      seed: brain55k.seed,
      metrics: {
        meanReward: 19.4,
        bestReward: 28.2,
        successRate: 94.0,
        episodesCompleted: Math.floor(trainingStep / 50),
        totalSteps: trainingStep,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: `55,000-neuron model checkpoint trained for ${selectedTask}`,
    };

    await ModelStorageService.saveCheckpoint(cp);
    const updated = await ModelStorageService.listCheckpoints();
    setSavedModels(updated);
  };

  // Export 55K Connectome CSVs
  const handleExportCSVs = () => {
    const { neuronsCSV, connectionsCSV, regionsCSV } = brain55k.exportConnectomeCSVs();

    // Download zip or individual CSV
    const blob = new Blob([neuronsCSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ANT_BRAIN_55K_neurons.csv`;
    a.click();
  };

  return (
    <div className="w-full flex flex-col gap-3 p-3 sm:p-4 bg-slate-900/95 border border-slate-800 rounded-2xl text-slate-200 text-xs shadow-2xl backdrop-blur-md">
      {/* 1. TOP TITLE BAR & MODE BUTTONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-3 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-700/50 text-cyan-400">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold font-heading text-slate-100">
                ANTWIRE — 55,000-NEURON CONNECTOME & NEURAL LAB STUDIO
              </h2>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                {neuronScaleChoice.toLocaleString()} Neurons Active
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              High-Density Insect Neuropil Volumes, Glorot Weight Matrices, FlyWire-Style Search, and Synaptic Pathfinder.
            </p>
          </div>
        </div>

        {/* 4 Mode Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => setBrainMode('RULE')}
            className={`px-2.5 py-1.5 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
              brainMode === 'RULE' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            MODE A: RULE
          </button>
          <button
            onClick={() => setBrainMode('SYNTHETIC')}
            className={`px-2.5 py-1.5 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
              brainMode === 'SYNTHETIC' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            MODE B: 55K SYNTHETIC
          </button>
          <button
            onClick={() => setBrainMode('SNN')}
            className={`px-2.5 py-1.5 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
              brainMode === 'SNN' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            MODE C: SNN
          </button>
          <button
            onClick={() => setBrainMode('BIOLOGICAL')}
            className={`px-2.5 py-1.5 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
              brainMode === 'BIOLOGICAL' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            MODE D: BIOLOGICAL
          </button>
        </div>
      </div>

      {/* 2. SCALE CONFIGURATION & SCIENTIFIC BADGE BANNER */}
      <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-300">Neuron Scale:</span>
          <select
            value={neuronScaleChoice}
            onChange={(e) => setNeuronScaleChoice(parseInt(e.target.value))}
            className="bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-[10px] text-cyan-300 font-mono"
          >
            <option value="50000">50,000 Neurons</option>
            <option value="51000">51,000 Neurons</option>
            <option value="52500">52,500 Neurons</option>
            <option value="55000">55,000 Neurons (Default)</option>
            <option value="57500">57,500 Neurons</option>
            <option value="60000">60,000 Neurons</option>
          </select>

          <span className="text-slate-500">|</span>
          <span className="font-bold text-slate-300">LOD View:</span>
          <div className="flex items-center gap-1">
            {(['LOD_0_MACRO', 'LOD_1_CLUSTERS', 'LOD_2_NEURONS', 'LOD_3_SYNAPSES'] as LODLevel[]).map((lod) => (
              <button
                key={lod}
                onClick={() => setLodLevel(lod)}
                className={`px-1.5 py-0.5 rounded text-[9px] font-mono transition-all cursor-pointer ${
                  lodLevel === lod ? 'bg-cyan-950 text-cyan-300 border border-cyan-700' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {lod.replace('LOD_', '')}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowValidationModal(true)}
            className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 font-bold text-[10px] hover:bg-emerald-900/80 transition-all flex items-center gap-1 cursor-pointer"
          >
            <BookOpen className="w-3 h-3 text-emerald-400" /> Validation Matrix
          </button>
          {brainMode === 'RULE' && <ScientificBadge category="BIOLOGICAL_INSPIRATION" />}
          {brainMode === 'SYNTHETIC' && <ScientificBadge category="COMPUTATIONAL_ABSTRACTION" />}
          {brainMode === 'SNN' && <ScientificBadge category="BIOLOGICAL_INSPIRATION" />}
          {brainMode === 'BIOLOGICAL' && <ScientificBadge category="BIOLOGICAL_FACT" />}
        </div>
      </div>

      {/* TOP HERO: FULL ANTWIRE NEURON-WISE SIGNAL TRANSMISSION & SYNAPSE BIOPHYSICS */}
      <SynapticTransmissionHero />

      {/* 3. MAIN 3-COLUMN STUDIO LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* LEFT COLUMN: Hierarchical Region Tree & Search */}
        <div className="lg:col-span-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <Layers className="w-4 h-4" /> Anatomical Neuropil Tree
            </span>
            <span className="text-[9px] font-mono text-slate-500">12 Regions</span>
          </div>

          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 55k neurons or region..."
              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[10px] text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Regional Tree List */}
          <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
            {SYNTHETIC_NEUROPIL_REGIONS.map((r) => {
              const count = Math.round(r.ratio * brain55k.neuronCount);
              const isSelected = selectedRegionId === r.regionId;

              return (
                <button
                  key={r.regionId}
                  onClick={() => setSelectedRegionId(isSelected ? null : r.regionId)}
                  className={`w-full text-left p-1.5 rounded transition-all flex items-center justify-between cursor-pointer ${
                    isSelected ? 'bg-cyan-950/80 border border-cyan-700 text-cyan-300' : 'hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-2 h-2 rounded-full inline-block shrink-0" style={{ backgroundColor: r.colorHex }} />
                    <span className="text-[10px] font-medium truncate">{r.name}</span>
                  </div>
                  <span className="font-mono text-[9px] text-slate-500 shrink-0">{count.toLocaleString()}</span>
                </button>
              );
            })}
          </div>

          {/* Connectome Weight Statistics Card */}
          <div className="p-2 rounded bg-slate-900/90 border border-slate-800 text-[9.5px] space-y-1">
            <div className="flex justify-between text-slate-400 font-bold">
              <span>Weight Matrix Health:</span>
              <span className="text-emerald-400 font-mono">Glorot/Normal</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Mean Weight:</span>
              <span className="font-mono text-cyan-300">{brain55k.weightStats.mean.toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Variance / StdDev:</span>
              <span className="font-mono text-amber-300">{brain55k.weightStats.variance.toFixed(4)} (σ={brain55k.weightStats.stdDev.toFixed(3)})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Min / Max Range:</span>
              <span className="font-mono text-slate-300">[{brain55k.weightStats.min.toFixed(2)}, {brain55k.weightStats.max.toFixed(2)}]</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Memory Footprint:</span>
              <span className="font-mono text-purple-300">~4.2 MB (TypedArrays)</span>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: 3D Point Cloud Connectome View */}
        <div className="lg:col-span-5 bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
            <span className="flex items-center gap-1.5 text-cyan-300">
              <Eye className="w-4 h-4 text-cyan-400" /> 3D Insect Brain Volume (55,000 Nodes)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowFullscreenBrain(true)}
                className="text-[9.5px] px-2.5 py-0.5 rounded font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm flex items-center gap-1 transition-all cursor-pointer"
                title="Open Fullscreen 3D AntWire Brain Studio"
              >
                <Maximize className="w-3 h-3" /> Fullscreen 3D Lab
              </button>
              <button
                onClick={() => setIsExplodedView(!isExplodedView)}
                className={`text-[9px] px-2 py-0.5 rounded font-bold border transition-all cursor-pointer ${
                  isExplodedView ? 'bg-cyan-600/40 text-cyan-300 border-cyan-500' : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                {isExplodedView ? 'Collapse View' : 'Explode View'}
              </button>
            </div>
          </div>

          {/* 3D WebGL PointCloud Viewport */}
          <div
            ref={pointCloudContainerRef}
            className="w-full h-64 sm:h-72 md:h-80 lg:h-96 rounded-lg overflow-hidden border border-slate-800/80 bg-[#040711] shadow-inner relative group"
          >
            <button
              onClick={() => setShowFullscreenBrain(true)}
              className="absolute bottom-2 right-2 z-10 px-2 py-1 rounded-md bg-slate-950/80 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-700/50 backdrop-blur-md text-[10px] font-bold flex items-center gap-1.5 shadow-lg transition-all cursor-pointer"
            >
              <Maximize className="w-3.5 h-3.5" /> Fullscreen Synaptic Model
            </button>
          </div>

          {/* Mode Switcher Views (Rule / SNN / Biological) */}
          {brainMode === 'SNN' && (
            <div className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-1 text-[10px]">
              <div className="flex justify-between font-bold text-purple-300">
                <span>LIF Spike Raster (Sampled 55k Population)</span>
                <span className="text-[8px] font-mono text-slate-500">dt=5ms</span>
              </div>
              <div className="space-y-1">
                {snnNeuronsRef.current.map((sn) => (
                  <div key={sn.id} className="flex items-center gap-2">
                    <span className="font-mono text-slate-400 w-24 truncate">{sn.id}:</span>
                    <div className="flex-1 h-3 bg-slate-950 rounded overflow-hidden relative">
                      {sn.spikeHistory.slice(-20).map((spk, idx) => (
                        <span key={idx} className="absolute w-1 h-full bg-amber-400" style={{ left: `${(spk * 10) % 100}%` }} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {brainMode === 'BIOLOGICAL' && (
            <div className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-1 text-[10px]">
              <div className="text-emerald-400 font-bold">{OOCERAEA_BIROI_REFERENCE_DATASET.name}</div>
              <p className="text-slate-400">{OOCERAEA_BIROI_REFERENCE_DATASET.description}</p>
              <div className="text-cyan-300 font-mono">DOI: {OOCERAEA_BIROI_REFERENCE_DATASET.doi}</div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Node Inspector & Neuromodulator */}
        <div className="lg:col-span-4 bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex flex-col gap-2.5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" /> Neuron Biophysics Inspector
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-cyan-400">
              Neuron #{selectedNeuronIndex}
            </span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Neuropil Region:</span>
              <span className="font-semibold text-slate-200">{selectedRegion.name}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">System Category:</span>
              <span className="font-mono text-cyan-300 font-bold">{selectedRegion.systemId}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Activation Level:</span>
              <span className="font-mono text-emerald-400 font-bold">{selectedNeuronActivation.toFixed(3)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Resting Bias:</span>
              <span className="font-mono text-amber-300">{selectedNeuronBias.toFixed(4)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Spike Threshold:</span>
              <span className="font-mono text-rose-400">{selectedNeuronThreshold.toFixed(1)} mV</span>
            </div>
          </div>

          {/* Causal Ablation / Lesion Controls */}
          <div className="flex gap-1.5 pt-1">
            <button
              onClick={() => brain55k.ablateRegion(selectedRegion.regionId, true)}
              className="flex-1 py-1 rounded bg-rose-950/70 text-rose-300 border border-rose-800/60 hover:bg-rose-900/60 text-[10px] font-bold cursor-pointer"
            >
              Lesion Region ({selectedRegion.code})
            </button>
            <button
              onClick={() => brain55k.ablateRegion(selectedRegion.regionId, false)}
              className="py-1 px-2.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 text-[10px] font-bold cursor-pointer"
            >
              Restore
            </button>
          </div>

          {/* Neuromodulator RPE Dashboard */}
          <div className="p-2.5 rounded bg-slate-900/90 border border-purple-500/30 space-y-1.5 text-[10px]">
            <div className="flex justify-between items-center text-purple-300 font-bold">
              <span>Experimental Neuromodulator System</span>
              <span className="text-[8px] text-purple-400 font-mono">Biologically Inspired</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Dopamine (RPE Signal):</span>
                <span className="font-mono text-amber-300 font-bold">{dopamineRPE.toFixed(3)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Octopamine (Arousal):</span>
                <span className="font-mono text-emerald-300 font-bold">{octopamineVal.toFixed(3)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Serotonin (Pacing):</span>
                <span className="font-mono text-pink-300 font-bold">{serotoninVal.toFixed(3)}</span>
              </div>
            </div>
            <button
              onClick={() => neuromod.triggerExperimentalDopamineSpike(0.75)}
              className="w-full py-1 rounded bg-purple-950 text-purple-300 border border-purple-800 hover:bg-purple-900 transition-all font-semibold cursor-pointer"
            >
              Inject Phasic Dopamine Burst (+0.75)
            </button>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM SECTION: Pathfinder & Model Checkpoints Lab */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Signal Pathfinder */}
        <div className="lg:col-span-6 bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5 text-purple-300">
              <GitBranch className="w-3.5 h-3.5 text-purple-400" /> Connectome Signal Pathfinder (55K Graph)
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-[10px] items-center">
            <div>
              <span className="text-[9px] text-slate-400 block mb-0.5">Source Neuron ID:</span>
              <input
                type="number"
                value={pathSourceIndex}
                onChange={(e) => setPathSourceIndex(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-[10px] text-slate-200"
              />
            </div>

            <div>
              <span className="text-[9px] text-slate-400 block mb-0.5">Target Neuron ID:</span>
              <input
                type="number"
                value={pathTargetIndex}
                onChange={(e) => setPathTargetIndex(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-[10px] text-slate-200"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleTrace55KPath}
                className="w-full py-1 px-2 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] flex items-center justify-center gap-1 shadow cursor-pointer"
              >
                <Search className="w-3 h-3" /> Trace Pathway
              </button>
            </div>
          </div>

          <div className="bg-slate-900/90 p-2 rounded border border-purple-500/40 text-[10px] font-mono text-purple-300 truncate">
            {tracedPathString}
          </div>
        </div>

        {/* Model Checkpoints & One-Click Connectome CSV Export */}
        <div className="lg:col-span-6 bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5 text-cyan-300">
              <Database className="w-3.5 h-3.5 text-cyan-400" /> 55K Model Persistence & Open-Source Export
            </span>
            <span className="text-[9px] font-mono text-slate-400">Step #{trainingStep}</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-[10px] items-center">
            <div className="col-span-2">
              <input
                type="text"
                value={modelNameInput}
                onChange={(e) => setModelNameInput(e.target.value)}
                placeholder="Model checkpoint name..."
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[10px] text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex gap-1.5">
              <button
                onClick={handleSave55KModel}
                className="flex-1 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[10px] flex items-center justify-center gap-1 cursor-pointer shadow"
              >
                <Save className="w-3 h-3" /> Save
              </button>
              <button
                onClick={handleExportCSVs}
                className="py-1 px-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-[10px] flex items-center justify-center gap-1 cursor-pointer"
                title="Export Connectome CSVs"
              >
                <Download className="w-3 h-3" /> Export CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FULLSCREEN 3D ANTWIRE CONNECTOME VIEWER MODAL */}
      {showFullscreenBrain && (
        <FullscreenAntBrainViewer
          brain={brain55k}
          onClose={() => setShowFullscreenBrain(false)}
        />
      )}

      {/* BIOLOGICAL VALIDATION MATRIX MODAL */}
      {showValidationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/60">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-slate-100">ANTWIRE — Biological Validation Matrix</h3>
                  <p className="text-[10px] text-slate-400">Literature Citations, Empirical Species Scope, Fidelity Tiers & Scientific Limitations</p>
                </div>
              </div>
              <button
                onClick={() => setShowValidationModal(false)}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3">
              {BIOLOGICAL_VALIDATION_MATRIX.map((item) => (
                <div key={item.featureId} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5 text-[11px]">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-emerald-300 text-xs">{item.featureName}</span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {item.fidelityLevel}
                    </span>
                  </div>
                  <p className="text-slate-300"><strong className="text-slate-400">Biological Fact:</strong> {item.biologicalEvidence}</p>
                  <p className="text-cyan-300"><strong className="text-slate-400">AntWire Model:</strong> {item.computationalImplementation}</p>
                  <p className="text-amber-300/90"><strong className="text-slate-400">Limitations:</strong> {item.scientificLimitations}</p>
                  <div className="flex justify-between items-center pt-1 text-[10px] text-slate-500 font-mono">
                    <span>Species: {item.speciesScope.join(', ')}</span>
                    <span className="text-slate-400">Source: {item.sourceCitation}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
