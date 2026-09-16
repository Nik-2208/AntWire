/**
 * ANTWIRE — Digital Ant Colony Laboratory Main Application
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SimulationWorld } from '../simulation/world';
import { SceneManager, CameraViewMode, RenderQuality } from '../visualization/scene_manager';
import { Canvas2DRenderer } from '../visualization/canvas2d_renderer';
import { Header, MainNavTab } from './Header';
import { AntInspector } from './AntInspector';
import { QueenInspector } from './QueenInspector';
import { DecisionTerminal } from './DecisionTerminal';
import { ParameterPanel } from './ParameterPanel';
import { EcologyPanel } from './EcologyPanel';
import { WorldTools, WorldToolType } from './WorldTools';
import { EmergenceDashboard } from './EmergenceDashboard';
import { SimpleMode } from './SimpleMode';
import { ResearchMode } from './ResearchMode';
import { NeurobiologyLab } from './NeurobiologyLab';
import { AntBrainAtlas } from './AntBrainAtlas';
import { DigitalNeuronLab } from './DigitalNeuronLab';
import { ErrorBoundary } from './ErrorBoundary';
import { AddEntityModal } from './AddEntityModal';
import { EntityManagementModal } from './EntityManagementModal';
import { ColonyView } from './ColonyView';
import { FoodLedgerPanel } from './FoodLedgerPanel';
import { BrainLabView } from './BrainLabView';
import { NeuralLabView } from './NeuralLabView';
import { MultiAgentView } from './MultiAgentView';
import { TrainingLabView } from './TrainingLabView';
import { EvolutionLabView } from './EvolutionLabView';
import { ExperimentsView } from './ExperimentsView';
import { DataHubView } from './DataHubView';
import { SettingsView } from './SettingsView';
import { AboutView } from './AboutView';
import { SourcesView } from './SourcesView';
import { AntLabView } from './AntLabView';
import { FungusGardenView } from './FungusGardenView';
import { CasteDistributionLab } from './CasteDistributionLab';
import { NuptialFlightModal } from './NuptialFlightModal';
import { TrajectoryLogger } from '../learning/trajectory_logger';
import { EXPERIMENT_PRESETS, ExperimentPreset } from '../experiments/presets';
import { ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { DiagnosticsState } from './BootDiagnostics';

export const App: React.FC = () => {
  const canvas3DContainerRef = useRef<HTMLDivElement>(null);
  const canvas2DRef = useRef<HTMLCanvasElement>(null);

  const worldRef = useRef<SimulationWorld>(new SimulationWorld({ initialAntCount: 12 }));
  const trajectoryLoggerRef = useRef<TrajectoryLogger>(new TrajectoryLogger());
  const sceneManagerRef = useRef<SceneManager | null>(null);
  const canvas2DManagerRef = useRef<Canvas2DRenderer | null>(null);

  // Top-Level Navigation Tab
  const [activeTab, setActiveTab] = useState<MainNavTab>('WORLD');
  const [addEntityModalOpen, setAddEntityModalOpen] = useState(false);
  const [manageEntityModalOpen, setManageEntityModalOpen] = useState(false);

  // UI Reactive States
  const [isPaused, setIsPaused] = useState(false);
  const [timeScale, setTimeScale] = useState(1);
  const [simTime, setSimTime] = useState(0);
  const [tickCount, setTickCount] = useState(0);
  const [mode, setMode] = useState<'SIMPLE' | 'RESEARCH'>('RESEARCH');
  const [renderMode, setRenderMode] = useState<'3D' | '2D' | 'OFF'>('3D');
  const [quality, setQuality] = useState<RenderQuality>('LOW');
  const [cameraMode, setCameraMode] = useState<CameraViewMode>('ORBIT');
  const [showPheromones, setShowPheromones] = useState(true);
  const [showSensorRays, setShowSensorRays] = useState(true);

  // Telemetry & Diagnostics
  const [fps, setFps] = useState(60);
  const [tps, setTps] = useState(60);
  const [rendererStatus, setRendererStatus] = useState('WebGL2');
  const [rendererError, setRendererError] = useState<string | null>(null);

  // Collapsible Sidebars
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [terminalOpen, setTerminalOpen] = useState(true);

  // Inspector & Panels
  const [selectedAntId, setSelectedAntId] = useState<string | null>(null);
  const [inspectorView, setInspectorView] = useState<'ANT' | 'NEUROBIOLOGY' | 'ATLAS' | 'NEURON_LAB' | 'QUEEN' | 'ECOLOGY' | 'PARAMETERS'>('ANT');
  const [activeTool, setActiveTool] = useState<WorldToolType>('INSPECT');
  const activeToolRef = useRef(activeTool);
  activeToolRef.current = activeTool;
  const [, setFrameTick] = useState(0);

  // Initialize Rendering Pipelines
  useEffect(() => {
    const container3D = canvas3DContainerRef.current;
    const canvas2D = canvas2DRef.current;
    const world = worldRef.current;

    // 1. Initialize 3D Three.js SceneManager
    if (container3D && renderMode === '3D') {
      try {
        const sceneManager = new SceneManager(container3D, world, quality);
        sceneManagerRef.current = sceneManager;
        setRendererStatus(sceneManager.rendererStatus);
        setRendererError(null);

        sceneManager.onSelectEntity = (type, id, worldPos) => {
          const currentTool = activeToolRef.current;
          if (currentTool === 'INSPECT') {
            if (type === 'ANT' && id) {
              setSelectedAntId(id);
              sceneManager.selectedAntId = id;
              setInspectorView('ANT');
            } else if (type === 'QUEEN') {
              setInspectorView('QUEEN');
            }
          } else if (currentTool === 'PLACE_FOOD' && worldPos) {
            world.placeFoodCluster(worldPos, 80, 2.5);
          } else if (currentTool === 'SPAWN_PREDATOR' && worldPos) {
            world.spawnPredator(worldPos);
          } else if (currentTool === 'PLACE_OBSTACLE' && worldPos) {
            world.placeObstacle(worldPos, 2.4, 2.5);
          }
        };
      } catch (err) {
        console.error('3D initialization failed, falling back to 2D:', err);
        setRendererError(err instanceof Error ? err.message : 'WebGL Initialization failed');
        setRenderMode('2D');
      }
    }

    // 2. Initialize 2D Canvas Fallback
    if (canvas2D) {
      const c2d = new Canvas2DRenderer(canvas2D, world);
      canvas2DManagerRef.current = c2d;
      c2d.onSelectEntity = (type, id, worldPos) => {
        const currentTool = activeToolRef.current;
        if (currentTool === 'INSPECT') {
          if (type === 'ANT' && id) {
            setSelectedAntId(id);
            setInspectorView('ANT');
          } else if (type === 'QUEEN') {
            setInspectorView('QUEEN');
          }
        } else if (currentTool === 'PLACE_FOOD' && worldPos) {
          world.placeFoodCluster(worldPos, 80, 2.5);
        } else if (currentTool === 'SPAWN_PREDATOR' && worldPos) {
          world.spawnPredator(worldPos);
        } else if (currentTool === 'PLACE_OBSTACLE' && worldPos) {
          world.placeObstacle(worldPos, 2.4, 2.5);
        }
      };
    }

    // 3. Main Animation & Fixed Timestep Simulation Loop
    let lastTime = performance.now();
    let animationFrameId: number;

    const loop = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      // Advance deterministic physics/simulation
      const ticksToRun = world.clock.advanceWallClock(dt);
      for (let t = 0; t < ticksToRun; t++) {
        world.tick();
      }

      // Render active viewport
      if (renderMode === '3D' && sceneManagerRef.current) {
        sceneManagerRef.current.render();
        setFps(sceneManagerRef.current.currentFps);
      } else if (renderMode === '2D' && canvas2DManagerRef.current) {
        canvas2DManagerRef.current.render();
        setFps(60);
      }

      setTps(Math.round(world.clock.lastTps));
      setSimTime(world.clock.simTime);
      setTickCount(world.clock.tickCount);
      setFrameTick((prev) => prev + 1);

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        const paused = world.clock.togglePause();
        setIsPaused(paused);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      if (sceneManagerRef.current) {
        sceneManagerRef.current.dispose();
      }
    };
  }, [renderMode, quality]);

  const world = worldRef.current;
  const colony = world.colonies[0];
  const selectedAnt = selectedAntId ? world.getAntById(selectedAntId) : (colony?.ants[0] || null);
  const stats = colony ? colony.getStatistics(world.clock.simTime) : {
    population: 0,
    foodStored: 0,
    totalFoodHarvested: 0,
    totalDeaths: 0,
    totalBirths: 0,
    activeForagers: 0,
    nestDefenders: 0,
    nurseryNurses: 0,
    nestBuilders: 0,
    roleDistribution: {
      foragers: 0,
      scouts: 0,
      nurses: 0,
      builders: 0,
      guards: 0,
      sanitation: 0,
      fungusGardeners: 0,
      leafCutters: 0,
      leafProcessors: 0,
      middenWorkers: 0,
      hitchhikers: 0,
      generalWorkers: 0,
      reproductives: 0,
    },
    demands: {
      foodNeed: 0.5,
      waterNeed: 0.2,
      broodNeed: 0.3,
      queenNeed: 0.2,
      nestNeed: 0.2,
      defenseNeed: 0.05,
      sanitationNeed: 0.0,
      socialCareNeed: 0.05,
      explorationNeed: 0.5,
      reserveNeed: 0.2,
    },
    averageWorkerEnergy: 1,
    averageWorkerHealth: 1,
    colonyAgeSeconds: 0,
    status: 'HEALTHY' as const,
    controlMode: 'AUTONOMOUS' as const,
    corpsesWaitingRemoval: 0,
    nestChambersCount: 4,
    nestIntegrity: 1.0,
    buildingMaterial: 10.0,
    surfaceSoilMound: 2.0,
    recentFoodFlow: [],
    activeMessagesInFlight: 0,
    activeCollaborativeTasks: 0,
  };

  const diagnostics: DiagnosticsState = {
    uiReady: true,
    webgl2Ready: !rendererError,
    renderer3DReady: renderMode === '3D' && !rendererError,
    simulationReady: true,
    antModelsReady: true,
    brainModelReady: true,
    activeRenderer: renderMode === '3D' ? rendererStatus : '2D Canvas Fallback',
    fps,
    tps,
  };

  const handleTogglePause = useCallback(() => {
    const paused = world.clock.togglePause();
    setIsPaused(paused);
  }, [world]);

  const handleStepOnce = useCallback(() => {
    world.tick();
    world.clock.stepOnce();
    setSimTime(world.clock.simTime);
    setTickCount(world.clock.tickCount);
  }, [world]);

  const handleSetTimeScale = useCallback((scale: number) => {
    world.clock.setTimeScale(scale);
    setTimeScale(scale);
  }, [world]);

  const handleSetCameraMode = useCallback((cam: CameraViewMode) => {
    setCameraMode(cam);
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setViewMode(cam);
    }
  }, []);

  const handleSetQuality = useCallback((q: RenderQuality) => {
    setQuality(q);
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setQuality(q);
    }
  }, []);

  const handleTogglePheromones = useCallback(() => {
    setShowPheromones((prev) => {
      const next = !prev;
      if (sceneManagerRef.current) sceneManagerRef.current.pheromoneOverlay.isVisible = next;
      if (canvas2DManagerRef.current) canvas2DManagerRef.current.showPheromones = next;
      return next;
    });
  }, []);

  const handleToggleSensorRays = useCallback(() => {
    setShowSensorRays((prev) => {
      const next = !prev;
      if (sceneManagerRef.current) sceneManagerRef.current.showSensorRays = next;
      if (canvas2DManagerRef.current) canvas2DManagerRef.current.showSensorRays = next;
      return next;
    });
  }, []);

  const handleSelectPreset = useCallback((preset: ExperimentPreset) => {
    preset.setup(world);
    setSelectedAntId(null);
    if (sceneManagerRef.current) sceneManagerRef.current.selectedAntId = null;
  }, [world]);

  const handleReset = useCallback(() => {
    world.reset();
    setSelectedAntId(null);
  }, [world]);

  const handleSpawnAnt = useCallback(() => {
    if (colony) {
      const newAnt = colony.spawnWorker(undefined, undefined, world.rng);
      setSelectedAntId(newAnt.id);
      if (sceneManagerRef.current) sceneManagerRef.current.selectedAntId = newAnt.id;
    }
  }, [colony, world]);

  const handleClearPheromones = useCallback(() => {
    world.pheromones.clear();
  }, [world]);

  return (
    <ErrorBoundary
      onResetSimulation={handleReset}
      onFallbackTo2D={() => setRenderMode('2D')}
    >
      <div className="flex flex-col w-screen h-screen bg-slate-950 text-slate-100 overflow-hidden relative font-sans select-none">
        {/* Top Header Control Bar */}
        <Header
          activeTab={activeTab}
          isPaused={isPaused}
          timeScale={timeScale}
          simTime={simTime}
          tickCount={tickCount}
          cameraMode={cameraMode}
          renderMode={renderMode}
          quality={quality}
          diagnostics={diagnostics}
          showPheromones={showPheromones}
          showSensorRays={showSensorRays}
          population={stats.population}
          foodStored={stats.foodStored}
          temperature={world.environment.currentTemperature}
          onSelectTab={setActiveTab}
          onTogglePause={handleTogglePause}
          onStepOnce={handleStepOnce}
          onSetTimeScale={handleSetTimeScale}
          onSetCameraMode={handleSetCameraMode}
          onSetRenderMode={setRenderMode}
          onSetQuality={handleSetQuality}
          onTogglePheromones={handleTogglePheromones}
          onToggleSensorRays={handleToggleSensorRays}
          onSelectPreset={handleSelectPreset}
          onOpenAddEntity={() => setAddEntityModalOpen(true)}
          onOpenManageEntities={() => setManageEntityModalOpen(true)}
          onReset={handleReset}
        />

        {/* Main Content Area */}
        <div className="flex-1 relative overflow-hidden">
          {/* WebGL Failsafe Banner */}
          {rendererError && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-40 bg-rose-950/90 border border-rose-500 text-rose-200 text-xs px-4 py-2 rounded-xl flex items-center gap-2 shadow-2xl backdrop-blur-md">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>3D Renderer Notice: {rendererError}. Operating in 2D Canvas Fallback Mode.</span>
              <button
                onClick={() => setRenderMode('2D')}
                className="bg-rose-800 hover:bg-rose-700 px-2 py-0.5 rounded text-white font-bold ml-2"
              >
                Use 2D
              </button>
            </div>
          )}

          {/* 3D Viewport Always Mounted in DOM */}
          <div
            ref={canvas3DContainerRef}
            className={`w-full h-full cursor-grab active:cursor-grabbing ${
              activeTab === 'WORLD' && renderMode === '3D' ? 'block' : 'hidden'
            }`}
          />

          {/* 2D Canvas Fallback */}
          <canvas
            ref={canvas2DRef}
            width={window.innerWidth}
            height={window.innerHeight}
            className={`w-full h-full cursor-grab active:cursor-grabbing ${
              activeTab === 'WORLD' && renderMode === '2D' ? 'block' : 'hidden'
            }`}
          />

          {/* TAB 1: WORLD SCREEN (Living 3D World + Floating Panels) */}
          {activeTab === 'WORLD' && (
            <>
              {/* Left Floating Tools & Emergence Drawer */}
              <div className="absolute top-3 left-3 z-20 flex items-start gap-1 pointer-events-auto max-h-[calc(100vh-130px)]">
                {leftPanelOpen && (
                  <div className="flex flex-col gap-2.5 max-w-[240px] max-h-[calc(100vh-140px)] overflow-y-auto no-scrollbar pr-0.5">
                    <WorldTools
                      activeTool={activeTool}
                      onSelectTool={setActiveTool}
                      onSpawnAnt={handleSpawnAnt}
                      onClearPheromones={handleClearPheromones}
                    />
                    <EmergenceDashboard stats={stats} />
                  </div>
                )}
                <button
                  onClick={() => setLeftPanelOpen(!leftPanelOpen)}
                  className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-slate-200 shadow-lg cursor-pointer"
                  title={leftPanelOpen ? 'Collapse Left Panel' : 'Expand Left Panel'}
                >
                  {leftPanelOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              </div>

              {/* Right Floating Inspector & Telemetry Drawer */}
              <div className="absolute top-3 right-3 z-20 flex items-start gap-1 pointer-events-auto max-h-[calc(100vh-130px)]">
                <button
                  onClick={() => setRightPanelOpen(!rightPanelOpen)}
                  className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-slate-200 shadow-lg cursor-pointer"
                  title={rightPanelOpen ? 'Collapse Right Panel' : 'Expand Right Panel'}
                >
                  {rightPanelOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>

                {rightPanelOpen && (
                  <div className="flex flex-col gap-2.5 w-[calc(100vw-36px)] sm:w-80 md:w-88 max-w-sm max-h-[calc(100vh-140px)] overflow-y-auto no-scrollbar pr-0.5">
                    {/* Tab Switcher */}
                    <div className="glass-panel p-1 rounded-xl flex items-center gap-1 text-[10px] flex-wrap">
                      <button
                        onClick={() => setInspectorView('ANT')}
                        className={`flex-1 min-w-[50px] py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                          inspectorView === 'ANT'
                            ? 'bg-cyan-600/40 text-cyan-300 border border-cyan-500/50'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Ant State
                      </button>
                      <button
                        onClick={() => setInspectorView('NEUROBIOLOGY')}
                        className={`flex-1 min-w-[50px] py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                          inspectorView === 'NEUROBIOLOGY'
                            ? 'bg-emerald-600/40 text-emerald-300 border border-emerald-500/50'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Neuropils
                      </button>
                      <button
                        onClick={() => setInspectorView('ATLAS')}
                        className={`flex-1 min-w-[50px] py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                          inspectorView === 'ATLAS'
                            ? 'bg-sky-600/40 text-sky-300 border border-sky-500/50'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        3D Atlas
                      </button>
                      <button
                        onClick={() => setInspectorView('NEURON_LAB')}
                        className={`flex-1 min-w-[50px] py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                          inspectorView === 'NEURON_LAB'
                            ? 'bg-rose-600/40 text-rose-300 border border-rose-500/50'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Neuron Lab
                      </button>
                      <button
                        onClick={() => setInspectorView('QUEEN')}
                        className={`flex-1 min-w-[45px] py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                          inspectorView === 'QUEEN'
                            ? 'bg-amber-600/40 text-amber-300 border border-amber-500/50'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Queen
                      </button>
                      <button
                        onClick={() => setInspectorView('ECOLOGY')}
                        className={`flex-1 min-w-[45px] py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                          inspectorView === 'ECOLOGY'
                            ? 'bg-emerald-600/40 text-emerald-300 border border-emerald-500/50'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Ecology
                      </button>
                      <button
                        onClick={() => setInspectorView('PARAMETERS')}
                        className={`flex-1 min-w-[45px] py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                          inspectorView === 'PARAMETERS'
                            ? 'bg-purple-600/40 text-purple-300 border border-purple-500/50'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Params
                      </button>
                    </div>

                    {/* Inspector Content */}
                    {inspectorView === 'ANT' && (
                      <AntInspector
                        ant={selectedAnt}
                        onRemoveAnt={(id) => {
                          colony.removeAnt(id, world.eventBus);
                          setSelectedAntId(null);
                          setFrameTick((p) => p + 1);
                        }}
                      />
                    )}
                    {inspectorView === 'NEUROBIOLOGY' && <NeurobiologyLab ant={selectedAnt} />}
                    {inspectorView === 'ATLAS' && <AntBrainAtlas selectedAnt={selectedAnt} />}
                    {inspectorView === 'NEURON_LAB' && <DigitalNeuronLab />}
                    {inspectorView === 'QUEEN' && colony && (
                      <QueenInspector
                        queen={colony.queen}
                        brood={colony.brood}
                        colonyFoodStore={colony.foodStore}
                      />
                    )}
                    {inspectorView === 'ECOLOGY' && (
                      <EcologyPanel world={world} onRefresh={() => setFrameTick((p) => p + 1)} />
                    )}
                    {inspectorView === 'PARAMETERS' && (
                      <ParameterPanel world={world} onParamChange={() => setFrameTick((p) => p + 1)} />
                    )}

                    {/* Simple or Research Mode Panel */}
                    {mode === 'SIMPLE' ? (
                      <SimpleMode
                        world={world}
                        selectedAnt={selectedAnt}
                        onOpenWhyModal={() => {
                          const whyBtn = document.querySelector('button:has(svg)') as HTMLElement;
                          if (whyBtn) whyBtn.click();
                        }}
                      />
                    ) : (
                      <ResearchMode world={world} selectedAnt={selectedAnt} />
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Floating Decision Terminal Drawer */}
              <div className="absolute bottom-3 left-3 right-3 z-20 pointer-events-auto max-w-full">
                {terminalOpen ? (
                  <div className="relative">
                    <button
                      onClick={() => setTerminalOpen(false)}
                      className="absolute -top-6 right-2 px-2 py-0.5 rounded-t bg-slate-900 border-t border-x border-slate-800 text-[10px] text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      Hide Terminal ▼
                    </button>
                    <DecisionTerminal
                      recentDecisions={selectedAnt ? selectedAnt.recentDecisions : []}
                      events={world.eventLogs}
                      selectedAntId={selectedAnt?.id || null}
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => setTerminalOpen(true)}
                    className="px-3 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-mono text-cyan-400 hover:text-cyan-300 shadow-xl cursor-pointer"
                  >
                    ▲ Show Decision Trace Terminal
                  </button>
                )}
              </div>
            </>
          )}

          {/* TAB 2: ANT LAB */}
          {activeTab === 'ANT_LAB' && (
            <div className="w-full h-full overflow-y-auto p-2 sm:p-4 md:p-6 no-scrollbar">
              <div className="max-w-5xl mx-auto py-2">
                <AntLabView ant={selectedAnt} />
              </div>
            </div>
          )}

          {/* TAB 3: COLONY LAB */}
          {activeTab === 'COLONY' && (
            <div className="w-full h-full overflow-y-auto p-2 sm:p-4 md:p-6 no-scrollbar">
              <div className="max-w-5xl mx-auto py-2">
                <ColonyView
                  world={world}
                  onSelectAnt={(id) => {
                    setSelectedAntId(id);
                    setActiveTab('ANT_LAB');
                  }}
                  onFocusCamera={(pos) => {
                    setActiveTab('WORLD');
                    if (sceneManagerRef.current) {
                      sceneManagerRef.current.focusOnPosition(pos);
                    }
                    if (canvas2DManagerRef.current) {
                      canvas2DManagerRef.current.focusOnPosition(pos);
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* TAB 3B: FUNGUS AGRICULTURE LAB */}
          {activeTab === 'FUNGUS' && (
            <div className="w-full h-full overflow-y-auto p-2 sm:p-4 md:p-6 no-scrollbar">
              <div className="max-w-5xl mx-auto py-2">
                <FungusGardenView />
              </div>
            </div>
          )}

          {/* TAB 3C: POLYMORPHIC CASTES & THRESHOLD LAB */}
          {activeTab === 'CASTES' && (
            <div className="w-full h-full overflow-y-auto p-2 sm:p-4 md:p-6 no-scrollbar">
              <div className="max-w-5xl mx-auto py-2">
                <CasteDistributionLab />
              </div>
            </div>
          )}

          {/* TAB 4: BRAIN LAB (NEURAL LAB STUDIO) */}
          {activeTab === 'BRAIN_LAB' && (
            <div className="w-full h-full overflow-y-auto p-2 sm:p-4 md:p-6 no-scrollbar">
              <div className="max-w-6xl mx-auto py-2">
                <NeuralLabView selectedAnt={selectedAnt} />
              </div>
            </div>
          )}

          {/* TAB 5: ECOLOGY & SYMBIOSIS */}
          {activeTab === 'ECOLOGY' && (
            <div className="w-full h-full overflow-y-auto p-2 sm:p-4 md:p-6 no-scrollbar">
              <div className="max-w-5xl mx-auto py-2">
                <EcologyPanel world={world} onRefresh={() => setFrameTick((p) => p + 1)} />
              </div>
            </div>
          )}

          {/* TAB 5B: COLONY FOOD LEDGER & CONSERVATION */}
          {activeTab === 'FOOD_LEDGER' && (
            <div className="w-full h-full overflow-y-auto p-2 sm:p-4 md:p-6 no-scrollbar">
              <div className="max-w-5xl mx-auto py-2">
                <FoodLedgerPanel world={world} />
              </div>
            </div>
          )}

          {/* TAB 6: MULTI-AGENT COLLABORATION */}
          {activeTab === 'MULTI_AGENT' && (
            <div className="w-full h-full overflow-y-auto p-2 sm:p-4 md:p-6 no-scrollbar">
              <div className="max-w-6xl mx-auto py-2">
                <MultiAgentView
                  world={world}
                  selectedAnt={selectedAnt}
                  onSelectAnt={(id) => setSelectedAntId(id)}
                />
              </div>
            </div>
          )}

          {/* TAB 7: TRAINING ARENA */}
          {activeTab === 'TRAINING' && (
            <div className="w-full h-full overflow-y-auto p-2 sm:p-4 md:p-6 no-scrollbar">
              <div className="max-w-5xl mx-auto py-2">
                <TrainingLabView world={world} />
              </div>
            </div>
          )}

          {/* TAB 8: EVOLUTION */}
          {activeTab === 'EVOLUTION' && (
            <div className="w-full h-full overflow-y-auto p-2 sm:p-4 md:p-6 no-scrollbar">
              <div className="max-w-5xl mx-auto py-2">
                <EvolutionLabView world={world} />
              </div>
            </div>
          )}

          {/* TAB 7: EXPERIMENTS */}
          {activeTab === 'EXPERIMENTS' && (
            <div className="w-full h-full overflow-y-auto p-2 sm:p-4 md:p-6 no-scrollbar">
              <div className="max-w-5xl mx-auto py-2">
                <ExperimentsView
                  world={world}
                  onSelectPreset={(p) => {
                    handleSelectPreset(p);
                    setActiveTab('WORLD');
                  }}
                />
              </div>
            </div>
          )}

          {/* TAB 8: DATA HUB */}
          {activeTab === 'DATA' && (
            <div className="w-full h-full overflow-y-auto p-2 sm:p-4 md:p-6 no-scrollbar">
              <div className="max-w-5xl mx-auto py-2">
                <DataHubView trajectoryLogger={trajectoryLoggerRef.current} />
              </div>
            </div>
          )}

          {/* TAB 9: SETTINGS */}
          {activeTab === 'SETTINGS' && (
            <div className="w-full h-full overflow-y-auto p-2 sm:p-4 md:p-6 no-scrollbar">
              <div className="max-w-4xl mx-auto py-2">
                <SettingsView
                  world={world}
                  renderMode={renderMode}
                  quality={quality}
                  onSetRenderMode={setRenderMode}
                  onSetQuality={handleSetQuality}
                  onResetSimulation={handleReset}
                />
              </div>
            </div>
          )}

          {/* TAB 10: ABOUT & PROJECT IDENTITY */}
          {activeTab === 'ABOUT' && (
            <div className="w-full h-full overflow-y-auto p-2 sm:p-4 md:p-6 no-scrollbar">
              <div className="max-w-5xl mx-auto py-2">
                <AboutView />
              </div>
            </div>
          )}

          {/* TAB 11: SOURCES & PEER-REVIEWED REFERENCES */}
          {activeTab === 'SOURCES' && (
            <div className="w-full h-full overflow-y-auto p-2 sm:p-4 md:p-6 no-scrollbar">
              <div className="max-w-5xl mx-auto py-2">
                <SourcesView />
              </div>
            </div>
          )}
        </div>

        {/* PERSISTENT SYSTEM FOOTER & AUTHOR ATTRIBUTION */}
        <footer className="h-7 bg-slate-950/95 border-t border-slate-800/80 px-3 flex items-center justify-between text-[10px] text-slate-400 select-none z-20 shrink-0 font-mono">
          <div className="flex items-center gap-2">
            <span className="font-bold text-cyan-400 tracking-wider">ANTWIRE</span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="text-slate-300 hidden sm:inline">
              Created & Developed by <strong className="text-emerald-400 font-bold">Nikhilesh H. Chavda</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 font-sans text-[11px]">
            <a
              href="https://nik-portfolio-lime.vercel.app/"
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
            >
              Portfolio
            </a>
            <a
              href="https://github.com/Nik-2208"
              target="_blank"
              rel="noreferrer"
              className="text-slate-300 hover:text-white font-medium transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/nikhilesh-chavda-2b779533a/"
              target="_blank"
              rel="noreferrer"
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              LinkedIn
            </a>
            <span className="text-slate-600 hidden md:inline">|</span>
            <span className="text-slate-500 hidden md:inline">© 2026 Nikhilesh H. Chavda</span>
          </div>
        </footer>

        {/* Add Entity Modal */}
        <AddEntityModal
          world={world}
          isOpen={addEntityModalOpen}
          onClose={() => setAddEntityModalOpen(false)}
          onEntityAdded={(id) => {
            setSelectedAntId(id);
            if (sceneManagerRef.current && id.startsWith('A-')) {
              sceneManagerRef.current.selectedAntId = id;
            }
          }}
        />

        {/* Manage & Remove Entity Modal */}
        <EntityManagementModal
          isOpen={manageEntityModalOpen}
          onClose={() => setManageEntityModalOpen(false)}
          colony={colony}
          predatorCount={world.predators.length}
          onRemoveAnt={(id) => {
            colony.removeAnt(id, world.eventBus);
            if (selectedAntId === id) setSelectedAntId(null);
            setFrameTick((p) => p + 1);
          }}
          onRemoveByRole={(role) => {
            colony.removeAntsByRole(role, world.eventBus);
            setSelectedAntId(null);
            setFrameTick((p) => p + 1);
          }}
          onRemoveAllNonQueen={() => {
            colony.removeAllNonQueen(world.eventBus);
            setSelectedAntId(null);
            setFrameTick((p) => p + 1);
          }}
          onRemoveRandomAnts={(count) => {
            colony.removeRandomAnts(count, world.rng, world.eventBus);
            setSelectedAntId(null);
            setFrameTick((p) => p + 1);
          }}
          onRemoveAllPredators={() => {
            world.predatorManager.clear();
            setFrameTick((p) => p + 1);
          }}
        />
      </div>
    </ErrorBoundary>
  );
};
