# Graph Report - CAPS_LATEST-V  (2026-11-09)

## Corpus Check
- 84 files · ~110,800 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 43 file(s) not represented in the graph (top: .css 30, (none) 5, .glb 3)

## Summary
- 553 nodes · 1273 edges · 20 communities (16 shown, 4 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b2ec5312`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- CourseShell.jsx
- server.js
- App.jsx
- PCBuilder3D.jsx
- EyeTracker.tsx
- crawler.js
- CompareRigs.jsx
- db.js
- App.jsx
- SynthAudio
- compatibility.test.js
- BuildLab Changelog
- [2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC)
- scripts
- frontend/package.json
- SynthAudio
- FeatureCarousel.jsx
- backend/package.json

## God Nodes (most connected - your core abstractions)
1. `react` - 62 edges
2. `SoundManager` - 32 edges
3. `react-router-dom` - 32 edges
4. `BuildLab Changelog` - 28 edges
5. `soundManager` - 23 edges
6. `AppContent()` - 22 edges
7. `SynthAudio` - 22 edges
8. `AdminHeader()` - 19 edges
9. `FullscreenGate()` - 18 edges
10. `useAuth()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `🧹 Cleaned Button Typography in `frontend/src/components/3D/PCBuilder3D.jsx`` --references--> `Compatibility()`  [INFERRED]
  CHANGELOG.md → frontend/src/components/Compatibility/Compatibility.jsx
- `⚡ Upgrades to `frontend/src/utilities/soundManager.js`` --references--> `SynthAudio`  [INFERRED]
  CHANGELOG.md → frontend/src/utilities/soundManager.js
- `🖥️ Fullscreen Gating (`FullscreenGate.jsx`)` --references--> `FullscreenGate()`  [INFERRED]
  CHANGELOG.md → frontend/src/components/FullscreenGate/FullscreenGate.jsx
- `🖥️ Fullscreen Gating (`FullscreenGate.jsx`)` --references--> `CourseShell()`  [INFERRED]
  CHANGELOG.md → frontend/src/components/Learn/CourseShell.jsx
- `[2026-10-31] - Security Hardening & Architecture Consolidation (OpenCode Audit)` --references--> `adminAuth()`  [INFERRED]
  CHANGELOG.md → backend/server.js

## Import Cycles
- None detected.

## Communities (20 total, 4 thin omitted)

### Community 0 - "CourseShell.jsx"
Cohesion: 0.12
Nodes (29): [2026-10-23] Fullscreen Requirement Enabled for Compatibility & Learn, 🖥️ Fullscreen Gating (`FullscreenGate.jsx`), FullscreenGate(), FullscreenGateContext, ARTICLE_LESSONS, BOB_LESSON_WISDOM, BOB_SYLLABUS_GUIDE, COURSE (+21 more)

### Community 1 - "server.js"
Cohesion: 0.12
Nodes (10): adminAuth(), app, cors, distPath, { exec }, express, fs, path (+2 more)

### Community 2 - "App.jsx"
Cohesion: 0.10
Nodes (45): AdminAccounts(), AdminAddComponent(), CATEGORIES, DEFAULT_FORM_DATA, AdminAuthGuard(), AdminContent(), AdminCrawler(), CATEGORIES (+37 more)

### Community 3 - "PCBuilder3D.jsx"
Cohesion: 0.06
Nodes (61): ComponentModels3D(), DDR4StickMesh(), HeroFloatingRAM(), MotherboardDDR4Kit(), ProceduralRAMFallback(), RAMModelErrorBoundary, SingleDDR4RAM(), GenericPCCase() (+53 more)

### Community 4 - "EyeTracker.tsx"
Cohesion: 0.12
Nodes (20): BOB_PHRASES, BobCompanion(), BuildPage(), clamp(), Eye, EyeTracker(), LINES, measure() (+12 more)

### Community 5 - "crawler.js"
Cohesion: 0.28
Nodes (12): axios, BERMOR_CATEGORY_MAP, detectProductCategory(), EASYPC_COLLECTION_MAP, EXCLUDED_KEYWORDS, extractSpecs(), getStagingProducts(), initScrapedTable() (+4 more)

### Community 6 - "CompareRigs.jsx"
Cohesion: 0.16
Nodes (15): CompareRigs(), CompareRigsView(), COMPONENT_CATEGORIES, PRESET_BUDGET_RIG, PRESET_ENTHUSIAST_RIG, COMPAT_BOB_PHRASES, Compatibility(), CompatibilityView() (+7 more)

### Community 8 - "db.js"
Cohesion: 0.40
Nodes (4): mysql, pool, mysql2@^3.22.1, mysql2

### Community 9 - "App.jsx"
Cohesion: 0.07
Nodes (41): AdminEditRedirect(), App(), AppContent(), ScrollToTop(), AboutUs(), TEAM_MEMBERS, brandData, Brands() (+33 more)

### Community 11 - "compatibility.test.js"
Cohesion: 0.27
Nodes (8): assert, checkCompatibility(), getCaseFormFactorCapacity(), getMoboFormFactorRank(), getNumber(), normalizeDdr(), normalizeSocket(), { test }

### Community 14 - "BuildLab Changelog"
Cohesion: 0.04
Nodes (46): [2026-10-23 03:34] - /clean Linter & Safari Prefix Fixes, [2026-10-23 03:54] - Build Layout Stability, Dynamic Category Filters & Price Removal, [2026-10-23 04:52] - Scrolling Elimination, Red Warning Removal & Redundancy Fix, [2026-10-23] 3D Studio: Clean Button Design (Icons & Emojis Removed), [2026-10-23] - Admin Dashboard Syntax Error Fix (Vite Parse Error Resolved), [2026-10-23] Compatibility Checker SFX & Cute Sound Effects Update, [2026-10-23] Learn: Course-Outline Sidebar REWORK REVERTED to the previous design (OC — user request), [2026-10-23] Learn Page: NotebookLLM Master Source Script for Module 1 (+38 more)

### Community 15 - "[2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC)"
Cohesion: 0.12
Nodes (15): [2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC), 🧊 3D Builder (`/3d-builder`), 🔧 3D Drawer UI Optimization (PCBuilder3D.css), 🧱 Build Page Round 2 (OC), 🧱 Build Page — Viewport-Fitted Workspace (Build.jsx / Build.css / App.jsx), 🖥️ Fullscreen Gate (New Feature), 🏠 Home & Build Consolidation, 🤖 Integrations (+7 more)

### Community 16 - "scripts"
Cohesion: 0.50
Nodes (4): scripts, dev, start, test

### Community 18 - "frontend/package.json"
Cohesion: 0.05
Nodes (51): dependencies, html2canvas@^1.4.1, jspdf@^4.2.1, puppeteer-core@^25.16.0, react@^19.2.4, react-dom@^19.2.4, react-router-dom@^7.14.1, @react-three/drei@^10.7.7 (+43 more)

### Community 20 - "SynthAudio"
Cohesion: 0.14
Nodes (4): [2026-10-23] UI Interaction Sounds Restored & Centralized (`soundManager.js`), 🔊 Root Cause Identified & Resolved, ⚡ Upgrades to `frontend/src/utilities/soundManager.js`, SynthAudio

### Community 26 - "backend/package.json"
Cohesion: 0.13
Nodes (19): author, dependencies, axios@^1.16.1, cors@^2.8.6, dotenv@^17.4.2, express@^5.2.1, description, devDependencies (+11 more)

## Knowledge Gaps
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `BuildLab Changelog` connect `BuildLab Changelog` to `CourseShell.jsx`, `server.js`, `SynthAudio`, `[2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC)`?**
  _High betweenness centrality (0.319) - this node is a cross-community bridge._
- **Should `CourseShell.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12121212121212122 - nodes in this community are weakly interconnected._
- **Why does `react` connect `App.jsx` to `CourseShell.jsx`, `PCBuilder3D.jsx`, `EyeTracker.tsx`, `CompareRigs.jsx`, `App.jsx`, `[2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC)`, `frontend/package.json`, `FeatureCarousel.jsx`?**
  _High betweenness centrality (0.311) - this node is a cross-community bridge._
- **Should `server.js` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Why does `[2026-10-31] - Security Hardening & Architecture Consolidation (OpenCode Audit)` connect `server.js` to `BuildLab Changelog`?**
  _High betweenness centrality (0.183) - this node is a cross-community bridge._
- **Should `App.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10163170163170163 - nodes in this community are weakly interconnected._
- **Should `PCBuilder3D.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.055364314400458976 - nodes in this community are weakly interconnected._