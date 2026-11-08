# Graph Report - CAPS_LATEST-V  (2026-11-09)

## Corpus Check
- 71 files · ~89,731 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 33 file(s) not represented in the graph (top: .css 21, (none) 5, .glb 2)

## Summary
- 480 nodes · 1082 edges · 16 communities (13 shown, 3 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `870dd047`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- EyeTracker.tsx
- frontend/package.json
- App.jsx
- PCBuilder3D.jsx
- CourseShell.jsx
- SynthAudio
- App.jsx
- compatibilityEngine.js
- compatibility.test.js
- BuildLab Changelog
- [2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC)
- scrapedMeta.js
- FeatureCarousel.jsx
- backend/package.json

## God Nodes (most connected - your core abstractions)
1. `react` - 49 edges
2. `SoundManager` - 28 edges
3. `BuildLab Changelog` - 28 edges
4. `react-router-dom` - 27 edges
5. `AppContent()` - 21 edges
6. `SynthAudio` - 20 edges
7. `FullscreenGate()` - 19 edges
8. `useAuth()` - 17 edges
9. `apiFetch()` - 17 edges
10. `soundManager` - 17 edges

## Surprising Connections (you probably didn't know these)
- `🧹 Cleaned Button Typography in `frontend/src/components/3D/PCBuilder3D.jsx`` --references--> `Compatibility()`  [INFERRED]
  CHANGELOG.md → frontend/src/components/Compatibility/Compatibility.jsx
- `🖥️ Fullscreen Gating (`FullscreenGate.jsx`)` --references--> `FullscreenGate()`  [INFERRED]
  CHANGELOG.md → frontend/src/components/FullscreenGate/FullscreenGate.jsx
- `⚡ Upgrades to `frontend/src/utilities/soundManager.js`` --references--> `SynthAudio`  [INFERRED]
  CHANGELOG.md → frontend/src/utilities/soundManager.js
- `[2026-10-31] - Security Hardening & Architecture Consolidation (OpenCode Audit)` --references--> `adminAuth()`  [INFERRED]
  CHANGELOG.md → backend/server.js
- `[2026-10-23] - Symmetrical Dual-Sidebar Architecture & Course Outline Fix (Learn Page)` --references--> `Footer()`  [INFERRED]
  CHANGELOG.md → frontend/src/components/Footer/Footer.jsx

## Import Cycles
- None detected.

## Communities (16 total, 3 thin omitted)

### Community 0 - "EyeTracker.tsx"
Cohesion: 0.13
Nodes (19): BOB_PHRASES, BobCompanion(), clamp(), Eye, EyeTracker(), LINES, measure(), outline() (+11 more)

### Community 1 - "frontend/package.json"
Cohesion: 0.06
Nodes (47): dependencies, motion@^14.6.0, react@^19.2.4, react-dom@^19.2.4, react-router-dom@^7.14.1, @react-three/drei@^10.7.7, @react-three/fiber@^9.6.1, three@^0.184.0 (+39 more)

### Community 2 - "App.jsx"
Cohesion: 0.12
Nodes (37): AdminAddComponent(), CATEGORIES, DEFAULT_FORM_DATA, AdminAuthGuard(), AdminCrawler(), CATEGORIES, STORES, AdminDeleteComponent() (+29 more)

### Community 3 - "PCBuilder3D.jsx"
Cohesion: 0.09
Nodes (34): ComponentModels3D(), DDR4StickMesh(), HeroFloatingRAM(), MotherboardDDR4Kit(), ProceduralRAMFallback(), RAMModelErrorBoundary, SingleDDR4RAM(), GenericPCCase() (+26 more)

### Community 4 - "CourseShell.jsx"
Cohesion: 0.21
Nodes (13): [2026-10-23] Fullscreen Requirement Enabled for Compatibility & Learn, 🖥️ Fullscreen Gating (`FullscreenGate.jsx`), ARTICLE_LESSONS, BOB_LESSON_WISDOM, COURSE, CourseShell(), readProgress(), CourseVideoPlayer() (+5 more)

### Community 7 - "SynthAudio"
Cohesion: 0.07
Nodes (6): [2026-10-23] UI Interaction Sounds Restored & Centralized (`soundManager.js`), 🔊 Root Cause Identified & Resolved, ⚡ Upgrades to `frontend/src/utilities/soundManager.js`, 🎮 Wired Semantic Audio Events Across Workspaces, SoundManager, SynthAudio

### Community 9 - "App.jsx"
Cohesion: 0.06
Nodes (64): [2026-10-23] - Symmetrical Dual-Sidebar Architecture & Course Outline Fix (Learn Page), AdminEditRedirect(), App(), AppContent(), ScrollToTop(), CAMERA_PRESETS_TOWER, CAMERA_PRESETS_WORKBENCH, CameraController() (+56 more)

### Community 10 - "compatibilityEngine.js"
Cohesion: 0.38
Nodes (9): calculateRequiredWattage(), checkCompatibility(), findAlternatives(), getCaseFormFactorCapacity(), getCompatibilitySummary(), getMoboFormFactorRank(), getNumber(), normalizeDdr() (+1 more)

### Community 11 - "compatibility.test.js"
Cohesion: 0.27
Nodes (8): assert, checkCompatibility(), getCaseFormFactorCapacity(), getMoboFormFactorRank(), getNumber(), normalizeDdr(), normalizeSocket(), { test }

### Community 14 - "BuildLab Changelog"
Cohesion: 0.04
Nodes (44): [2026-10-23 03:34] - /clean Linter & Safari Prefix Fixes, [2026-10-23 03:54] - Build Layout Stability, Dynamic Category Filters & Price Removal, [2026-10-23 04:52] - Scrolling Elimination, Red Warning Removal & Redundancy Fix, [2026-10-23] 3D Studio: Clean Button Design (Icons & Emojis Removed), [2026-10-23] - Admin Dashboard Syntax Error Fix (Vite Parse Error Resolved), [2026-10-23] Compatibility Checker SFX & Cute Sound Effects Update, [2026-10-23] Learn: Course-Outline Sidebar REWORK REVERTED to the previous design (OC — user request), [2026-10-23] Learn Page: NotebookLLM Master Source Script for Module 1 (+36 more)

### Community 15 - "[2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC)"
Cohesion: 0.14
Nodes (13): [2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC), 🧊 3D Builder (`/3d-builder`), 🔧 3D Drawer UI Optimization (PCBuilder3D.css), 🧱 Build Page Round 2 (OC), 🧱 Build Page — Viewport-Fitted Workspace (Build.jsx / Build.css / App.jsx), 🖥️ Fullscreen Gate (New Feature), 🏠 Home & Build Consolidation, 🤖 Integrations (+5 more)

### Community 16 - "scrapedMeta.js"
Cohesion: 0.38
Nodes (6): escapeRegex(), GENERIC_TOKENS, isJunkToken(), KNOWN_BRANDS, parseProductMeta(), SPEC_TOKEN_PATTERNS

### Community 26 - "backend/package.json"
Cohesion: 0.05
Nodes (47): mysql, pool, axios, BERMOR_CATEGORY_MAP, detectProductCategory(), EASYPC_COLLECTION_MAP, EXCLUDED_KEYWORDS, extractSpecs() (+39 more)

## Knowledge Gaps
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `BuildLab Changelog` connect `BuildLab Changelog` to `CourseShell.jsx`, `SynthAudio`, `App.jsx`, `[2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC)`, `backend/package.json`?**
  _High betweenness centrality (0.347) - this node is a cross-community bridge._
- **Should `EyeTracker.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12648221343873517 - nodes in this community are weakly interconnected._
- **Why does `react` connect `App.jsx` to `EyeTracker.tsx`, `frontend/package.json`, `PCBuilder3D.jsx`, `CourseShell.jsx`, `App.jsx`, `[2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC)`, `FeatureCarousel.jsx`?**
  _High betweenness centrality (0.277) - this node is a cross-community bridge._
- **Should `frontend/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.0563265306122449 - nodes in this community are weakly interconnected._
- **Why does `Footer()` connect `App.jsx` to `App.jsx`?**
  _High betweenness centrality (0.197) - this node is a cross-community bridge._
- **Should `App.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12390572390572391 - nodes in this community are weakly interconnected._
- **Should `PCBuilder3D.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09387755102040816 - nodes in this community are weakly interconnected._