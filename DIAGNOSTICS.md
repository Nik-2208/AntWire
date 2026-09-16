# ANT BRAIN — Comprehensive Diagnostic Audit & Root Cause Analysis

## Mission
Engineering diagnosis, root cause analysis, authoritative state repair, and automated verification tests for the ANT BRAIN Artificial-Life Observatory.

---

### Bug 1: Ants Die Abruptly When Energy Reaches Zero
* **Reported Symptom**: Ants vanish abruptly without physiological realism as soon as a single variable crosses zero.
* **Root Cause**: In `src/ants/internal_state.ts`, an instantaneous cutoff `if (this.state.energy <= 0.01) { health -= dt * 0.04; }` coupled with `colony.ants.splice(...)` in `src/colony/colony.ts` immediately purged the ant without state transitions, corpse handling, or starvation stress modeling.
* **Architectural Fix**:
  - Implemented multi-stage lifecycle states: `ACTIVE` $\rightarrow$ `INJURED` $\rightarrow$ `EXHAUSTED` $\rightarrow$ `DYING` $\rightarrow$ `DEAD` $\rightarrow$ `REMOVED`.
  - Separated metabolic fuel (`energyReserve`) from accumulated chronic damage (`starvationStress`).
  - Starvation stress only accumulates when lipid reserves drop below `starvationOnsetThreshold` (<0.08).
  - High stress causes locomotor slowdown (up to 55% speed penalty via `mobilityPenalty`), shifts motivation toward food/rest, and induces gradual somatic deterioration.
  - In `DYING` state, mortality follows an explicit hazard rate $P(\text{death}) = \lambda \cdot \Delta t$.
  - Deceased ants transition to `DEAD` with logged `causeOfDeath` (`STARVATION`, `PREDATOR`, `COMBAT`, `AGE`, `INJURY`), leaving persistent corpses for sanitation workers and archiving history.
* **Verification Test**: `src/tests/authoritative_simulation.test.ts` (`GOLDEN TEST 1`).

---

### Bug 2: Predator Spawning Failure & Canvas Accumulation
* **Reported Symptom**: Spawning predators via toolbar was unreliable, and canvas overlay glitches appeared.
* **Root Cause**:
  1. In `src/ui/App.tsx`, `activeTool` was included in the dependency array of the WebGL renderer instantiation `useEffect`. Clicking any toolbar button re-triggered `useEffect`, instantiating a new `SceneManager` without clearing container DOM children. This caused invisible zombie canvases to accumulate and block pointer events.
  2. In `src/visualization/scene_manager.ts`, ground click raycasting intersected arbitrary scene objects (including lights and helper meshes) rather than the terrain mesh.
  3. No dedicated `PredatorManager` existed with wave spawning or data-driven profiles.
* **Architectural Fix**:
  - Decoupled `activeTool` from `useEffect` dependencies using `activeToolRef.current`, and added `container.innerHTML = ''` to `initSafeRenderer`.
  - Stored `this.terrainMesh` as an explicit class property and raycasted directly against `[this.terrainMesh]` for 100% reliable ground coordinates.
  - Created `src/predators/predator_manager.ts` and data-driven profiles (`GROUND_BEETLE`, `WOLF_SPIDER`, `PRAYING_MANTIS`, `ARTHROPOD_HUNTER`) with full behavioral state machine (`SEARCH`, `DETECT`, `APPROACH`, `ATTACK`, `FEED`, `RETREAT`, `WANDER`).
  - Implemented 3D predator rendering with species chitin coloration and attack lunging pulses.
* **Verification Test**: `src/tests/authoritative_simulation.test.ts` (`GOLDEN TEST 2`).

---

### Bug 3: Parameter Changes Disconnected from Authoritative Simulation State
* **Reported Symptom**: Modifying sliders in the UI had no effect on the running simulation or desynchronized from state.
* **Root Cause**: Sliders in `ParameterPanel.tsx` mutated ad-hoc local variables with no validation pipeline or event bus emission.
* **Architectural Fix**:
  - Created `src/simulation/config.ts` (`SimulationConfig`) with typed domains (`ant`, `predator`, `pheromones`, `environment`, `colony`).
  - Added validated command execution pipeline (`SET_PARAMETER`, `RESET_SCOPE`, `RESET_ALL`) with parameter classifications (`SAFE_LIVE`, `REQUIRES_RESET`, `EXPERIMENT_ONLY`).
  - Validated values against minimum, maximum, and step bounds.
  - Emitted `PARAMETER_CHANGED` events on `SimulationEventBus`.
  - Systems consume updated parameters on every tick.
* **Verification Test**: `src/tests/authoritative_simulation.test.ts` (`GOLDEN TEST 3`).

---

### Bug 4: Neural Lab & 3D Brain Model Rendering Inconsistency
* **Reported Symptom**: Neural Lab did not reliably display a visible neural model or interactive network before external biological data was imported.
* **Root Cause**: `AntBrainAtlas` relied on dynamic client dimensions without fallback size or container cleanup, and lacked an interactive synthetic neural network sandbox (nodes, synapses, activation pulses, and signal injection).
* **Architectural Fix**:
  - Added container clearance, explicit fallback dimensions, and resize listeners to `Brain3DViewer`.
  - Built full interactive 3D synthetic ant brain with paired anatomical lobes, mushroom bodies, central complex, antennal lobes, and subesophageal zone.
  - Created complete **Neural Lab** view conforming to Section 37 with 3D brain, synaptic graph, neuron inspector, and signal pathfinder.
* **Verification Test**: `src/tests/authoritative_simulation.test.ts` and automated browser subagent verification.

---

### Bug 5: Reproductive and Caste Logic Incomplete
* **Reported Symptom**: Queen and brood lifecycle lacked biological fidelity, thermal kinetics, and colony crisis detection.
* **Root Cause**: Brood stages had linear timers without temperature dependencies, and colony status was not tracked.
* **Architectural Fix**:
  - Implemented holometabolous development stages (`EGG` $\rightarrow$ `LARVA` $\rightarrow$ `PUPA` $\rightarrow$ `ADULT WORKER`) with thermal kinetics ($Q_{10}$ temperature curve) in `src/colony/brood.ts`.
  - Added colony crisis state machine (`HEALTHY`, `STRESSED`, `CRITICAL`, `COLLAPSING`, `RECOVERING`) in `src/colony/colony.ts`.
  - Added sanitation and corpse tracking.
* **Verification Test**: `src/tests/authoritative_simulation.test.ts` and `src/tests/simulation.test.ts`.
