# Graph Report - CAPS_LATEST-V  (2026-11-09)

## Corpus Check
- 82 files · ~107,475 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 41 file(s) not represented in the graph (top: .css 28, (none) 5, .glb 3)

## Summary
- 529 nodes · 1192 edges · 19 communities (14 shown, 5 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `377b5d35`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Build.jsx
- dependencies
- App.jsx
- PCBuilder3D.jsx
- scripts
- vite.config.js
- App.jsx
- SynthAudio
- compatibility.test.js
- BuildLab Changelog
- [2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC)
- frontend/package.json
- devDependencies
- SynthAudio
- FeatureCarousel.jsx
- scrapedMeta.js
- backend/package.json

## God Nodes (most connected - your core abstractions)
1. `react` - 59 edges
2. `soundManager` - 45 edges
3. `react-router-dom` - 30 edges
4. `BuildLab Changelog` - 28 edges
5. `AppContent()` - 21 edges
6. `FullscreenGate()` - 21 edges
7. `SynthAudio` - 20 edges
8. `AdminHeader()` - 19 edges
9. `useAuth()` - 17 edges
10. `apiFetch()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `🧹 Cleaned Button Typography in `frontend/src/components/3D/PCBuilder3D.jsx`` --references--> `Compatibility()`  [INFERRED]
  CHANGELOG.md → frontend/src/components/Compatibility/Compatibility.jsx
- `🖥️ Fullscreen Gating (`FullscreenGate.jsx`)` --references--> `FullscreenGate()`  [INFERRED]
  CHANGELOG.md → frontend/src/components/FullscreenGate/FullscreenGate.jsx
- `⚡ Upgrades to `frontend/src/utilities/soundManager.js`` --references--> `SynthAudio`  [INFERRED]
  CHANGELOG.md → frontend/src/utilities/soundManager.js
- `🖥️ Fullscreen Gating (`FullscreenGate.jsx`)` --references--> `CourseShell()`  [INFERRED]
  CHANGELOG.md → frontend/src/components/Learn/CourseShell.jsx
- `[2026-10-23] - Symmetrical Dual-Sidebar Architecture & Course Outline Fix (Learn Page)` --references--> `Footer()`  [INFERRED]
  CHANGELOG.md → frontend/src/components/Footer/Footer.jsx

## Import Cycles
- None detected.

## Communities (19 total, 5 thin omitted)

### Community 0 - "Build.jsx"
Cohesion: 0.05
Nodes (56): BOB_PHRASES, BobCompanion(), BOB_CASUAL_GUIDE, BOB_GENERAL_BUILD_LINES, BOB_STAGE_TIPS, BuildPage(), buildSteps, CATEGORY_FILTERS (+48 more)

### Community 1 - "dependencies"
Cohesion: 0.18
Nodes (11): dependencies, html2canvas, jspdf, motion, puppeteer-core, react, react-dom, react-router-dom (+3 more)

### Community 2 - "App.jsx"
Cohesion: 0.12
Nodes (39): AdminAccounts(), AdminAddComponent(), CATEGORIES, DEFAULT_FORM_DATA, AdminAuthGuard(), AdminContent(), AdminCrawler(), CATEGORIES (+31 more)

### Community 3 - "PCBuilder3D.jsx"
Cohesion: 0.06
Nodes (54): ComponentModels3D(), DDR4StickMesh(), HeroFloatingRAM(), MotherboardDDR4Kit(), ProceduralRAMFallback(), RAMModelErrorBoundary, SingleDDR4RAM(), GenericPCCase() (+46 more)

### Community 4 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build, dev, lint, preview, start

### Community 9 - "App.jsx"
Cohesion: 0.06
Nodes (50): [2026-10-23] - Symmetrical Dual-Sidebar Architecture & Course Outline Fix (Learn Page), AdminEditRedirect(), App(), AppContent(), ScrollToTop(), PCBuilder3D(), AboutUs(), TEAM_MEMBERS (+42 more)

### Community 11 - "compatibility.test.js"
Cohesion: 0.36
Nodes (6): checkCompatibility(), getCaseFormFactorCapacity(), getMoboFormFactorRank(), getNumber(), normalizeDdr(), normalizeSocket()

### Community 14 - "BuildLab Changelog"
Cohesion: 0.04
Nodes (48): adminAuth(), [2026-10-23 03:34] - /clean Linter & Safari Prefix Fixes, [2026-10-23 03:54] - Build Layout Stability, Dynamic Category Filters & Price Removal, [2026-10-23 04:52] - Scrolling Elimination, Red Warning Removal & Redundancy Fix, [2026-10-23] 3D Studio: Clean Button Design (Icons & Emojis Removed), [2026-10-23] - Admin Dashboard Syntax Error Fix (Vite Parse Error Resolved), [2026-10-23] Compatibility Checker SFX & Cute Sound Effects Update, [2026-10-23] Fullscreen Requirement Enabled for Compatibility & Learn (+40 more)

### Community 15 - "[2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC)"
Cohesion: 0.13
Nodes (14): [2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC), 🧊 3D Builder (`/3d-builder`), 🔧 3D Drawer UI Optimization (PCBuilder3D.css), 🧱 Build Page Round 2 (OC), 🧱 Build Page — Viewport-Fitted Workspace (Build.jsx / Build.css / App.jsx), 🖥️ Fullscreen Gate (New Feature), 🏠 Home & Build Consolidation, 🤖 Integrations (+6 more)

### Community 18 - "frontend/package.json"
Cohesion: 0.12
Nodes (18): name, private, type, version, autoprefixer, eslint, @eslint/js, eslint-plugin-react-hooks (+10 more)

### Community 19 - "devDependencies"
Cohesion: 0.14
Nodes (14): devDependencies, autoprefixer, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, postcss (+6 more)

### Community 20 - "SynthAudio"
Cohesion: 0.15
Nodes (4): [2026-10-23] UI Interaction Sounds Restored & Centralized (`soundManager.js`), 🔊 Root Cause Identified & Resolved, ⚡ Upgrades to `frontend/src/utilities/soundManager.js`, SynthAudio

### Community 25 - "scrapedMeta.js"
Cohesion: 0.38
Nodes (6): escapeRegex(), GENERIC_TOKENS, isJunkToken(), KNOWN_BRANDS, parseProductMeta(), SPEC_TOKEN_PATTERNS

### Community 26 - "backend/package.json"
Cohesion: 0.05
Nodes (40): pool, BERMOR_CATEGORY_MAP, detectProductCategory(), EASYPC_COLLECTION_MAP, EXCLUDED_KEYWORDS, extractSpecs(), getStagingProducts(), initScrapedTable() (+32 more)

## Knowledge Gaps
- **9 isolated node(s):** `autoprefixer`, `postcss`, `puppeteer-core`, `tailwindcss`, `@tailwindcss/postcss` (+4 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 202 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `BuildLab Changelog` connect `BuildLab Changelog` to `App.jsx`, `SynthAudio`, `[2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC)`?**
  _High betweenness centrality (0.316) - this node is a cross-community bridge._
- **What connects `autoprefixer`, `postcss`, `puppeteer-core` to the rest of the system?**
  _9 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Build.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.051759834368530024 - nodes in this community are weakly interconnected._
- **Why does `react` connect `App.jsx` to `Build.jsx`, `PCBuilder3D.jsx`, `App.jsx`, `[2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC)`, `frontend/package.json`, `FeatureCarousel.jsx`?**
  _High betweenness centrality (0.315) - this node is a cross-community bridge._
- **Should `App.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12039742840444184 - nodes in this community are weakly interconnected._
- **Why does `Footer()` connect `App.jsx` to `App.jsx`?**
  _High betweenness centrality (0.190) - this node is a cross-community bridge._
- **Should `PCBuilder3D.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.061175666438824335 - nodes in this community are weakly interconnected._