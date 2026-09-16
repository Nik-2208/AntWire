# Contributing to ANT BRAIN

We welcome contributions from computational neuroscientists, artificial-life researchers, software engineers, and digital artists!

## Scientific Contribution Guidelines

1. **Taxonomy Required:** Any added biological feature, parameter, or brain circuit must declare its `ScientificProvenance` (`BIOLOGICAL_FACT`, `BIOLOGICAL_INSPIRATION`, `COMPUTATIONAL_ABSTRACTION`, `ENGINEERING_DECISION`, `EXPERIMENTAL_HYPOTHESIS`).
2. **Citations:** Include peer-reviewed literature citations and DOIs in `src/colony/species_profiles.ts` or `src/ants/brain/connectome.ts`.
3. **No LLM Controllers:** Ant motor decisions must be computed by deterministic policies, neural networks, or SNNs.
4. **Performance Guardrails:** All 3D rendering code must run smoothly on entry-level hardware (e.g. integrated GPUs). Ensure 2D Canvas fallbacks remain operational.
5. **Testing:** Run `npm test` and `npm run build` prior to opening pull requests.
