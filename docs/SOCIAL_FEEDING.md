# ANT BRAIN — Stomodeal Trophallaxis & Social Care System

## 1. Biological Inspiration
Stomodeal trophallaxis is the oral exchange of liquid nutrition stored in the social crop (*proventriculus*). In many eusocial Hymenoptera, it acts as a decentralized nutritional network and communication channel, circulating not only sugars and proteins but also endocrine signals and colonial odors.

---

## 2. Resource Conservation & Thermodynamic Invariants
Trophallaxis in ANT BRAIN strictly conserves metabolic quantities:
$$\Delta E_{\text{donor}} = -\delta, \quad \Delta E_{\text{receiver}} = +\delta$$
$$\sum E_{\text{colony}} = \text{const}$$
No energy or biomass is created or destroyed during transfers.

---

## 3. Decision Policy for Trophallaxis
A potential donor worker $D$ evaluates a request from receiver $R$:
1. **Donor Reserve Check**: $E_{D} \ge E_{\text{min\_reserve}}$ (donor must not compromise its own survival).
2. **Donor Cargo / Crop Load**: $C_{D} > 0.2\text{ units}$.
3. **Receiver Need**: $R$ hunger $\ge 0.7$ OR $R.\text{helpRequested} == \text{true}$.
4. **Proximity**: $\| \mathbf{p}_D - \mathbf{p}_R \| \le r_{\text{social}}$ ($1.2\text{m}$).

---

## 4. Starvation Buffer vs. Biological Honesty
Social feeding significantly reduces early worker mortality by distributing harvested food to vulnerable individuals. However:
- **No magical immortality**: If colony reserves are completely exhausted or no helper is in physical proximity, prolonged starvation stress leads to somatic degradation and eventual mortality.
