# Graph Report - CAPS_LATEST-V  (2026-11-17)

## Corpus Check
- 94 files · ~142,291 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 49 file(s) not represented in the graph (top: .css 35, (none) 5, .glb 3)

## Summary
- 609 nodes · 1488 edges · 26 communities (22 shown, 4 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 16 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `545d4c36`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- CourseShell.jsx
- server.js
- App.jsx
- PCBuilder3D.jsx
- crawler.js
- frontend/package.json
- PCBuilder3D.jsx
- @tailwindcss/postcss@^4.2.2
- db.js
- App.jsx
- SynthAudio
- compatibility.test.js
- BuildLab Changelog
- [2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC)
- FeatureCarousel.jsx
- dependencies
- devDependencies
- curriculumTypes.d.ts
- CourseVideoPlayer.jsx
- scripts
- vite
- FullscreenGate
- scripts
- backend/package.json

## God Nodes (most connected - your core abstractions)
1. `react` - 69 edges
2. `react-router-dom` - 38 edges
3. `SoundManager` - 32 edges
4. `BuildLab Changelog` - 28 edges
5. `AppContent()` - 25 edges
6. `useLearnMode()` - 25 edges
7. `soundManager` - 24 edges
8. `SynthAudio` - 22 edges
9. `FullscreenGate()` - 20 edges
10. `AdminHeader()` - 19 edges

## Surprising Connections (you probably didn't know these)
- `🧹 Cleaned Button Typography in `frontend/src/components/3D/PCBuilder3D.jsx`` --references--> `Compatibility()`  [INFERRED]
  CHANGELOG.md → frontend/src/components/Compatibility/Compatibility.jsx
- `🖥️ Fullscreen Gating (`FullscreenGate.jsx`)` --references--> `CourseShell()`  [INFERRED]
  CHANGELOG.md → frontend/src/components/Learn/CourseShell.jsx
- `⚡ Upgrades to `frontend/src/utilities/soundManager.js`` --references--> `SynthAudio`  [INFERRED]
  CHANGELOG.md → frontend/src/utilities/soundManager.js
- `🖥️ Fullscreen Gating (`FullscreenGate.jsx`)` --references--> `FullscreenGate()`  [INFERRED]
  CHANGELOG.md → frontend/src/components/FullscreenGate/FullscreenGate.jsx
- `[2026-10-31] - Security Hardening & Architecture Consolidation (OpenCode Audit)` --references--> `adminAuth()`  [INFERRED]
  CHANGELOG.md → backend/server.js

## Import Cycles
- None detected.

## Communities (26 total, 4 thin omitted)

### Community 0 - "CourseShell.jsx"
Cohesion: 0.13
Nodes (19): BOB_PHRASES, BobCompanion(), clamp(), Eye, EyeTracker(), LINES, measure(), outline() (+11 more)

### Community 1 - "server.js"
Cohesion: 0.11
Nodes (10): adminAuth(), app, cors, distPath, { exec }, express, fs, path (+2 more)

### Community 2 - "App.jsx"
Cohesion: 0.10
Nodes (42): AdminAccounts(), AdminAddComponent(), CATEGORIES, DEFAULT_FORM_DATA, AdminAuthGuard(), AdminContent(), AdminCrawler(), CATEGORIES (+34 more)

### Community 3 - "PCBuilder3D.jsx"
Cohesion: 0.06
Nodes (62): ComponentModels3D(), DDR4StickMesh(), HeroFloatingRAM(), MotherboardDDR4Kit(), ProceduralRAMFallback(), RAMModelErrorBoundary, SingleDDR4RAM(), GenericPCCase() (+54 more)

### Community 4 - "crawler.js"
Cohesion: 0.28
Nodes (12): axios, BERMOR_CATEGORY_MAP, detectProductCategory(), EASYPC_COLLECTION_MAP, EXCLUDED_KEYWORDS, extractSpecs(), getStagingProducts(), initScrapedTable() (+4 more)

### Community 5 - "frontend/package.json"
Cohesion: 0.15
Nodes (12): postcss@^8.5.10, tailwindcss@^4.2.2, @types/react@^19.2.14, @types/react-dom@^19.2.3, name, private, type, version (+4 more)

### Community 6 - "PCBuilder3D.jsx"
Cohesion: 0.08
Nodes (42): BOB_CASUAL_GUIDE, BOB_GENERAL_BUILD_LINES, BOB_STAGE_TIPS, Build(), BuildPage(), buildSteps, CATEGORY_FILTERS, getCaseDimensions() (+34 more)

### Community 8 - "db.js"
Cohesion: 0.40
Nodes (4): mysql, pool, mysql2@^3.22.1, mysql2

### Community 9 - "App.jsx"
Cohesion: 0.06
Nodes (60): AdminEditRedirect(), App(), AppContent(), ScrollToTop(), AboutUs(), TEAM_MEMBERS, WHITEHATS_PROJECTS, AdminLogin() (+52 more)

### Community 10 - "SynthAudio"
Cohesion: 0.07
Nodes (6): [2026-10-23] UI Interaction Sounds Restored & Centralized (`soundManager.js`), 🔊 Root Cause Identified & Resolved, ⚡ Upgrades to `frontend/src/utilities/soundManager.js`, 🎮 Wired Semantic Audio Events Across Workspaces, SoundManager, SynthAudio

### Community 11 - "compatibility.test.js"
Cohesion: 0.27
Nodes (8): assert, checkCompatibility(), getCaseFormFactorCapacity(), getMoboFormFactorRank(), getNumber(), normalizeDdr(), normalizeSocket(), { test }

### Community 14 - "BuildLab Changelog"
Cohesion: 0.04
Nodes (48): [2026-10-23 03:34] - /clean Linter & Safari Prefix Fixes, [2026-10-23 03:54] - Build Layout Stability, Dynamic Category Filters & Price Removal, [2026-10-23 04:52] - Scrolling Elimination, Red Warning Removal & Redundancy Fix, [2026-10-23] 3D Studio: Clean Button Design (Icons & Emojis Removed), [2026-10-23] - Admin Dashboard Syntax Error Fix (Vite Parse Error Resolved), [2026-10-23] Compatibility Checker SFX & Cute Sound Effects Update, [2026-10-23] Fullscreen Requirement Enabled for Compatibility & Learn, [2026-10-23] Learn: Course-Outline Sidebar REWORK REVERTED to the previous design (OC — user request) (+40 more)

### Community 15 - "[2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC)"
Cohesion: 0.12
Nodes (15): [2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC), 🧊 3D Builder (`/3d-builder`), 🔧 3D Drawer UI Optimization (PCBuilder3D.css), 🧱 Build Page Round 2 (OC), 🧱 Build Page — Viewport-Fitted Workspace (Build.jsx / Build.css / App.jsx), 🖥️ Fullscreen Gate (New Feature), 🏠 Home & Build Consolidation, 🤖 Integrations (+7 more)

### Community 17 - "dependencies"
Cohesion: 0.15
Nodes (13): dependencies, gsap@^3.15.1, html2canvas@^1.4.1, jspdf@^4.2.1, puppeteer-core@^25.16.0, react@^19.2.4, react-router-dom@^7.14.1, @react-three/drei@^10.7.7 (+5 more)

### Community 18 - "devDependencies"
Cohesion: 0.19
Nodes (13): devDependencies, autoprefixer@^10.5.0, eslint@^9.39.4, @eslint/js@^9.39.4, eslint-plugin-react-hooks@^7.0.1, eslint-plugin-react-refresh@^0.5.2, globals@^17.4.0, autoprefixer (+5 more)

### Community 19 - "curriculumTypes.d.ts"
Cohesion: 0.25
Nodes (7): CurriculumModule, CurriculumTopic, FieldFact, FieldFactItem, MistakeWarning, QuizOption, TopicQuiz

### Community 20 - "CourseVideoPlayer.jsx"
Cohesion: 0.52
Nodes (6): react-dom@^19.2.4, CourseVideoPlayer(), fmtTime(), loadYouTubeApi(), VideoOverlayModal(), react-dom

### Community 21 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build, dev, lint, preview, start

### Community 22 - "vite"
Cohesion: 0.40
Nodes (4): vite@^8.0.4, @vitejs/plugin-react@^6.0.1, vite, @vitejs/plugin-react

### Community 23 - "FullscreenGate"
Cohesion: 0.23
Nodes (18): FullscreenGate(), FullscreenGateContext, Home(), PlatformServices(), RigPickerTransitionOverlay(), StageUnlockBanner(), enterFullscreen(), exitFullscreen() (+10 more)

### Community 24 - "scripts"
Cohesion: 0.50
Nodes (4): scripts, dev, start, test

### Community 26 - "backend/package.json"
Cohesion: 0.13
Nodes (19): author, dependencies, axios@^1.16.1, cors@^2.8.6, dotenv@^17.4.2, express@^5.2.1, description, devDependencies (+11 more)

## Knowledge Gaps
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `BuildLab Changelog` connect `BuildLab Changelog` to `server.js`, `SynthAudio`, `[2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC)`?**
  _High betweenness centrality (0.292) - this node is a cross-community bridge._
- **Should `CourseShell.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12648221343873517 - nodes in this community are weakly interconnected._
- **Why does `react` connect `App.jsx` to `CourseShell.jsx`, `App.jsx`, `PCBuilder3D.jsx`, `frontend/package.json`, `PCBuilder3D.jsx`, `[2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC)`, `FeatureCarousel.jsx`, `dependencies`, `CourseVideoPlayer.jsx`, `FullscreenGate`?**
  _High betweenness centrality (0.268) - this node is a cross-community bridge._
- **Should `server.js` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._
- **Why does `[2026-10-31] - Security Hardening & Architecture Consolidation (OpenCode Audit)` connect `server.js` to `BuildLab Changelog`?**
  _High betweenness centrality (0.169) - this node is a cross-community bridge._
- **Should `App.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09836065573770492 - nodes in this community are weakly interconnected._
- **Should `PCBuilder3D.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.059097127222982215 - nodes in this community are weakly interconnected._