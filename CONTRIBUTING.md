# Contributing to AntWire

> **Created & Developed by [Nikhilesh H. Chavda](https://nik-portfolio-lime.vercel.app/)**  
> GitHub: [https://github.com/Nik-2208](https://github.com/Nik-2208) | LinkedIn: [https://www.linkedin.com/in/nikhilesh-chavda-2b779533a/](https://www.linkedin.com/in/nikhilesh-chavda-2b779533a/)

We welcome contributions from computational neuroscientists, artificial-life researchers, software engineers, and developers worldwide!

---

## 1. Development Setup

```bash
# Fork & Clone repository
git clone https://github.com/Nik-2208/ant-brain.git
cd ant-brain

# Install dependencies
npm install

# Run automated tests
npx vitest run

# Run TypeScript typecheck
npx tsc --noEmit

# Launch development dev server
npm run dev
```

---

## 2. Contribution Areas

1. **New Task Environments & Benchmarks**:
   Extend `BaseTaskEnvironment` in `src/learning/task_environment_adapter.ts` and register in `TaskEnvironmentRegistry`.
2. **Insect Neurobiology & Neuropils**:
   Refine synaptic connectivity, sensory-motor transformations, or mushroom body associative learning mechanisms.
3. **Colony Superorganism Dynamics**:
   Contribute new cooperative behaviors, living bridge adaptations, or caste developmental pathways.
4. **Performance & Visualization**:
   Optimize 3D Three.js shaders, WebGL2 instancing, or 2D Canvas renderers.

---

## 3. Scientific Integrity Guidelines

1. **Scientific Evidence Tier Required**: Any added biological parameter, sensory channel, or neurocircuit must declare its scientific classification (`BIOLOGICAL_FACT`, `BIOLOGICAL_INSPIRATION`, `COMPUTATIONAL_ABSTRACTION`, `ENGINEERING_DECISION`, `HYPOTHESIS`).
2. **Citations**: Include peer-reviewed literature citations and DOIs for biological claims.
3. **No Hidden Shortcuts**: Ant motor behaviors must proceed through the sensory $\to$ neural $\to$ decision $\to$ action pipeline.
4. **Independent Runtimes**: Never share mutable neural activation state between ants.
5. **Quality Verification**: Verify `npx tsc --noEmit` and `npx vitest run` pass cleanly before submitting pull requests.
