---
name: antislop
description: Anti Slop: Rules for AI Coding Agents. Enforces human designer craftsmanship, clean typography, strict color discipline, and eliminates generic AI slop.
---

# /antislop: Anti-Slop Design & Craftsmanship Workflow

When the user types `/antislop` or asks to apply anti-slop rules:

1. **Activate Skill Reference**:
   - Primary Rules: `.agents/skills/antislop/SKILL.md`
   - UI & Layout Guidelines: `.agents/skills/antislop-ui/SKILL.md`
   - Accessibility & Contrast: `.agents/skills/antislop-human/SKILL.md`

2. **Core Directives**:
   - **No Generic AI Blue/Cyan Glowing Slop**: Eliminate unnecessary glowing cyan/neon turquoise borders, box-shadow light pollution, and generic saturated gradients.
   - **Tactile, Intentional Surfaces**: Use matte obsidian charcoal (`#090909`, `#141414`, `#1c1b16`) with subtle ambient shadows and crisp architectural white lines (`rgba(255, 255, 255, 0.14)` to `0.22`).
   - **Hierarchical Typography**: High contrast, deliberate font scale, zero generic filler text, and clear section anchoring.
   - **Functional Accents Only**: Gold (`#b08d57`) and alabaster (`#f5e6c7`) reserved strictly for verified badges and active state chips.
   - **Component Hygiene**: Eliminate redundant navigation buttons, duplicate call-to-actions, and cluttered interactive elements.

3. **Validation**:
   - Verify changes compile cleanly with `npm run build` in `frontend/`.
   - Update knowledge graph with `python -m graphify update .`.
