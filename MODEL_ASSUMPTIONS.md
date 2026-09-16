# ANT BRAIN — Mathematical Model Assumptions & Abstractions

This document provides explicit transparency on all mathematical formulations, spatial approximations, and computational assumptions implemented in **ANT BRAIN**.

---

## 1. Response Threshold Model (Task Allocation)

Task selection by individual polymorphic workers follows the Bonabeau-Theraulaz response threshold formulation:

$$P(\text{engage}_{i,j}) = \frac{S_j^2}{S_j^2 + \theta_{i,j}^2}$$

Where:
* $S_j \in [0, 1]$ is the colony-wide stimulus demand for task $j$ (computed dynamically by `ColonyRoleManager`).
* $\theta_{i,j} \in (0, 1]$ is the internal response threshold of ant $i$ for task $j$.
* Caste morphology modulates baseline thresholds:
  $$\theta_{i,j} = \theta_{\text{base}, j} \cdot \frac{1}{\text{Affinity}_{\text{caste}, j}}$$

---

## 2. Fungus Growth & Substrate Thermodynamics

Conversion of masticated leaf pulp into living mycelial biomass and harvestable gongylidia follows modified Monod-substrate kinetics:

$$\frac{d M_{\text{fungus}}}{dt} = \mu_{\max} \cdot \frac{S_{\text{leaf}}}{K_s + S_{\text{leaf}}} \cdot f(T) \cdot (1 - 0.5 \cdot C_{\text{escovopsis}}) - d_f \cdot M_{\text{fungus}}$$

Where:
* $f(T) = \max\left(0.2, 1.0 - 0.1 \cdot |T - 26.0^\circ\text{C}|\right)$ is the Arrhenius thermal sensitivity factor.
* $C_{\text{escovopsis}} \in [0, 1]$ is the parasite contamination fraction.
* $\frac{d C_{\text{escovopsis}}}{dt} = r_{\text{infect}} - k_{\text{hygiene}} \cdot H_{\text{metapleural}}$ represents parasite propagation dampened by worker antimicrobial grooming.

---

## 3. Pheromone Spatial Diffusion & Volatile Evaporation

Pheromone channels (Food Trail, Home Trail, Alarm, Recruitment) diffuse on a 2D discrete grid using a 9-point Laplacian kernel with continuous exponential decay:

$$\frac{\partial P(x, y, t)}{\partial t} = D \nabla^2 P(x, y, t) - \lambda P(x, y, t) + \sum_k q_k \delta(x - x_k, y - y_k)$$

* $\lambda_{\text{food}} = 0.005\text{ s}^{-1}$ (persistent recruiting trail).
* $\lambda_{\text{alarm}} = 0.08\text{ s}^{-1}$ (volatile, localized threat signal).

---

## 4. Central Complex Ring Attractor & Path Integration

Allocentric orientation $\phi_t$ is accumulated into an egocentric vector $V_t = (x_t, y_t)$ from step-odometer displacements $\Delta s$:

$$x_{t+1} = x_t + \Delta s \cos(\phi_t), \quad y_{t+1} = y_t + \Delta s \sin(\phi_t)$$

The homing vector points in the opposite direction $\mathbf{h} = -\mathbf{V}_t$, driving direct homeward trajectory selection in foragers.
