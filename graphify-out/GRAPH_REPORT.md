# Graph Report - CAPS_LATEST-V  (2026-11-16)

## Corpus Check
- 91 files · ~133,217 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 46 file(s) not represented in the graph (top: .css 33, (none) 5, .glb 3)

## Summary
- 590 nodes · 1476 edges · 22 communities (20 shown, 2 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 16 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `101e8c36`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- frontend/package.json
- server.js
- App.jsx
- PCBuilder3D.jsx
- crawler.js
- PCBuilder3D.jsx
- db.js
- App.jsx
- SynthAudio
- compatibility.test.js
- BuildLab Changelog
- [2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC)
- dependencies
- devDependencies
- curriculumTypes.d.ts
- CourseVideoPlayer.jsx
- scripts
- scripts
- backend/package.json
- EyeTracker.tsx

## God Nodes (most connected - your core abstractions)
1. `react` - 67 edges
2. `react-router-dom` - 37 edges
3. `SoundManager` - 32 edges
4. `soundManager` - 32 edges
5. `AppContent()` - 31 edges
6. `BuildLab Changelog` - 28 edges
7. `SynthAudio` - 22 edges
8. `FullscreenGate()` - 21 edges
9. `useLearnMode()` - 21 edges
10. `AdminHeader()` - 19 edges

## Surprising Connections (you probably didn't know these)
- `[2026-10-23] - Symmetrical Dual-Sidebar Architecture & Course Outline Fix (Learn Page)` --references--> `Footer()`  [INFERRED]
  CHANGELOG.md → frontend/src/components/Footer/Footer.jsx
- `🧹 Cleaned Button Typography in `frontend/src/components/3D/PCBuilder3D.jsx`` --references--> `Compatibility()`  [INFERRED]
  CHANGELOG.md → frontend/src/components/Compatibility/Compatibility.jsx
- `⚡ Upgrades to `frontend/src/utilities/soundManager.js`` --references--> `SynthAudio`  [INFERRED]
  CHANGELOG.md → frontend/src/utilities/soundManager.js
- `[2026-10-31] - Security Hardening & Architecture Consolidation (OpenCode Audit)` --references--> `adminAuth()`  [INFERRED]
  CHANGELOG.md → backend/server.js
- `🖥️ Fullscreen Gating (`FullscreenGate.jsx`)` --references--> `FullscreenGate()`  [INFERRED]
  CHANGELOG.md → frontend/src/components/FullscreenGate/FullscreenGate.jsx

## Import Cycles
- None detected.

## Communities (22 total, 2 thin omitted)

### Community 0 - "frontend/package.json"
Cohesion: 0.12
Nodes (21): devDependencies, autoprefixer@^10.5.0, postcss@^8.5.10, tailwindcss@^4.2.2, @tailwindcss/postcss@^4.2.2, @types/react@^19.2.14, @types/react-dom@^19.2.3, vite@^8.0.4 (+13 more)

### Community 1 - "server.js"
Cohesion: 0.11
Nodes (10): adminAuth(), app, cors, distPath, { exec }, express, fs, path (+2 more)

### Community 2 - "App.jsx"
Cohesion: 0.09
Nodes (48): AdminAccounts(), AdminAddComponent(), CATEGORIES, DEFAULT_FORM_DATA, AdminAuthGuard(), AdminContent(), AdminCrawler(), CATEGORIES (+40 more)

### Community 3 - "PCBuilder3D.jsx"
Cohesion: 0.06
Nodes (59): ComponentModels3D(), DDR4StickMesh(), HeroFloatingRAM(), MotherboardDDR4Kit(), ProceduralRAMFallback(), RAMModelErrorBoundary, SingleDDR4RAM(), GenericPCCase() (+51 more)

### Community 4 - "crawler.js"
Cohesion: 0.28
Nodes (12): axios, BERMOR_CATEGORY_MAP, detectProductCategory(), EASYPC_COLLECTION_MAP, EXCLUDED_KEYWORDS, extractSpecs(), getStagingProducts(), initScrapedTable() (+4 more)

### Community 6 - "PCBuilder3D.jsx"
Cohesion: 0.08
Nodes (42): [2026-10-23] 3D Studio: Clean Button Design (Icons & Emojis Removed), 🧹 Cleaned Button Typography in `frontend/src/components/3D/PCBuilder3D.jsx`, BOB_CASUAL_GUIDE, BOB_GENERAL_BUILD_LINES, BOB_STAGE_TIPS, Build(), BuildPage(), buildSteps (+34 more)

### Community 8 - "db.js"
Cohesion: 0.40
Nodes (4): mysql, pool, mysql2@^3.22.1, mysql2

### Community 9 - "App.jsx"
Cohesion: 0.07
Nodes (64): 🖥️ Fullscreen Gating (`FullscreenGate.jsx`), AdminEditRedirect(), App(), AppContent(), ScrollToTop(), AboutUs(), TEAM_MEMBERS, WHITEHATS_PROJECTS (+56 more)

### Community 10 - "SynthAudio"
Cohesion: 0.07
Nodes (6): [2026-10-23] UI Interaction Sounds Restored & Centralized (`soundManager.js`), 🔊 Root Cause Identified & Resolved, ⚡ Upgrades to `frontend/src/utilities/soundManager.js`, 🎮 Wired Semantic Audio Events Across Workspaces, SoundManager, SynthAudio

### Community 11 - "compatibility.test.js"
Cohesion: 0.27
Nodes (8): assert, checkCompatibility(), getCaseFormFactorCapacity(), getMoboFormFactorRank(), getNumber(), normalizeDdr(), normalizeSocket(), { test }

### Community 14 - "BuildLab Changelog"
Cohesion: 0.04
Nodes (44): [2026-10-23 03:34] - /clean Linter & Safari Prefix Fixes, [2026-10-23 03:54] - Build Layout Stability, Dynamic Category Filters & Price Removal, [2026-10-23 04:52] - Scrolling Elimination, Red Warning Removal & Redundancy Fix, [2026-10-23] - Admin Dashboard Syntax Error Fix (Vite Parse Error Resolved), [2026-10-23] Compatibility Checker SFX & Cute Sound Effects Update, [2026-10-23] Fullscreen Requirement Enabled for Compatibility & Learn, [2026-10-23] Learn: Course-Outline Sidebar REWORK REVERTED to the previous design (OC — user request), [2026-10-23] Learn Page: NotebookLLM Master Source Script for Module 1 (+36 more)

### Community 15 - "[2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC)"
Cohesion: 0.12
Nodes (15): [2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC), 🧊 3D Builder (`/3d-builder`), 🔧 3D Drawer UI Optimization (PCBuilder3D.css), 🧱 Build Page Round 2 (OC), 🧱 Build Page — Viewport-Fitted Workspace (Build.jsx / Build.css / App.jsx), 🖥️ Fullscreen Gate (New Feature), 🏠 Home & Build Consolidation, 🤖 Integrations (+7 more)

### Community 17 - "dependencies"
Cohesion: 0.14
Nodes (14): dependencies, gsap@^3.15.1, html2canvas@^1.4.1, jspdf@^4.2.1, puppeteer-core@^25.16.0, react@^19.2.4, react-router-dom@^7.14.1, @react-three/drei@^10.7.7 (+6 more)

### Community 18 - "devDependencies"
Cohesion: 0.18
Nodes (10): eslint@^9.39.4, @eslint/js@^9.39.4, eslint-plugin-react-hooks@^7.0.1, eslint-plugin-react-refresh@^0.5.2, globals@^17.4.0, eslint, @eslint/js, eslint-plugin-react-hooks (+2 more)

### Community 19 - "curriculumTypes.d.ts"
Cohesion: 0.25
Nodes (7): CurriculumModule, CurriculumTopic, FieldFact, FieldFactItem, MistakeWarning, QuizOption, TopicQuiz

### Community 20 - "CourseVideoPlayer.jsx"
Cohesion: 0.52
Nodes (6): react-dom@^19.2.4, CourseVideoPlayer(), fmtTime(), loadYouTubeApi(), VideoOverlayModal(), react-dom

### Community 21 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build, dev, lint, preview, start

### Community 24 - "scripts"
Cohesion: 0.50
Nodes (4): scripts, dev, start, test

### Community 26 - "backend/package.json"
Cohesion: 0.13
Nodes (19): author, dependencies, axios@^1.16.1, cors@^2.8.6, dotenv@^17.4.2, express@^5.2.1, description, devDependencies (+11 more)

### Community 32 - "EyeTracker.tsx"
Cohesion: 0.09
Nodes (26): BOB_PHRASES, BobCompanion(), clamp(), Eye, EyeTracker(), LINES, measure(), outline() (+18 more)

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `BuildLab Changelog` connect `BuildLab Changelog` to `server.js`, `SynthAudio`, `PCBuilder3D.jsx`, `[2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC)`?**
  _High betweenness centrality (0.299) - this node is a cross-community bridge._
- **Should `frontend/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.1225296442687747 - nodes in this community are weakly interconnected._
- **Why does `react` connect `App.jsx` to `frontend/package.json`, `EyeTracker.tsx`, `PCBuilder3D.jsx`, `PCBuilder3D.jsx`, `App.jsx`, `[2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC)`, `dependencies`, `CourseVideoPlayer.jsx`?**
  _High betweenness centrality (0.240) - this node is a cross-community bridge._
- **Should `server.js` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._
- **Why does `Footer()` connect `App.jsx` to `BuildLab Changelog`?**
  _High betweenness centrality (0.193) - this node is a cross-community bridge._
- **Should `App.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08959311424100157 - nodes in this community are weakly interconnected._
- **Should `PCBuilder3D.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06172839506172839 - nodes in this community are weakly interconnected._