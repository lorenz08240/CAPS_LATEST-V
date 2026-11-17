# Graph Report - CAPS_LATEST-V  (2026-11-17)

## Corpus Check
- 95 files · ~144,753 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 50 file(s) not represented in the graph (top: .css 36, (none) 5, .glb 3)

## Summary
- 607 nodes · 1566 edges · 33 communities (28 shown, 5 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 16 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `74af5b41`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- eslint.config.js
- server.js
- App.jsx
- PCBuilder3D.jsx
- crawler.js
- devDependencies
- Compatibility.jsx
- frontend/package.json
- db.js
- [2026-10-23] - Master Checklist & Safari Compatibility Updates
- SynthAudio
- compatibility.test.js
- BuildLab Changelog
- [2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC)
- App.jsx
- dependencies
- scripts
- curriculumTypes.d.ts
- CourseVideoPlayer.jsx
- [2026-10-23 03:54] - Build Layout Stability, Dynamic Category Filters & Price Removal
- vite
- [2026-10-23 04:52] - Scrolling Elimination, Red Warning Removal & Redundancy Fix
- scripts
- [2026-10-23] Compatibility Checker SFX & Cute Sound Effects Update
- backend/package.json
- [2026-10-23] Learn Page: NotebookLLM Master Source Script for Module 1
- AppContent
- [2026-10-23] Learn Page: Video Player Overhaul + 9 Dead Videos Replaced (OC)
- [2026-10-23] 3D Studio: Clean Button Design (Icons & Emojis Removed)
- 🖥️ Fullscreen Gating (`FullscreenGate.jsx`)
- [2026-10-23] Learn: Course-Outline Sidebar REWORK REVERTED to the previous design (OC — user request)

## God Nodes (most connected - your core abstractions)
1. `react` - 70 edges
2. `react-router-dom` - 38 edges
3. `soundManager` - 35 edges
4. `AppContent()` - 32 edges
5. `SoundManager` - 32 edges
6. `BuildLab Changelog` - 28 edges
7. `useLearnMode()` - 27 edges
8. `SynthAudio` - 22 edges
9. `FullscreenGate()` - 21 edges
10. `AdminHeader()` - 19 edges

## Surprising Connections (you probably didn't know these)
- `🧹 Cleaned Button Typography in `frontend/src/components/3D/PCBuilder3D.jsx`` --references--> `Compatibility()`  [INFERRED]
  CHANGELOG.md → frontend/src/components/Compatibility/Compatibility.jsx
- `[2026-10-23] - Symmetrical Dual-Sidebar Architecture & Course Outline Fix (Learn Page)` --references--> `Footer()`  [INFERRED]
  CHANGELOG.md → frontend/src/components/Footer/Footer.jsx
- `🖥️ Fullscreen Gating (`FullscreenGate.jsx`)` --references--> `FullscreenGate()`  [INFERRED]
  CHANGELOG.md → frontend/src/components/FullscreenGate/FullscreenGate.jsx
- `🖥️ Fullscreen Gating (`FullscreenGate.jsx`)` --references--> `CourseShell()`  [INFERRED]
  CHANGELOG.md → frontend/src/components/Learn/CourseShell.jsx
- `⚡ Upgrades to `frontend/src/utilities/soundManager.js`` --references--> `SynthAudio`  [INFERRED]
  CHANGELOG.md → frontend/src/utilities/soundManager.js

## Import Cycles
- None detected.

## Communities (33 total, 5 thin omitted)

### Community 0 - "eslint.config.js"
Cohesion: 0.18
Nodes (10): eslint@^9.39.4, @eslint/js@^9.39.4, eslint-plugin-react-hooks@^7.0.1, eslint-plugin-react-refresh@^0.5.2, globals@^17.4.0, eslint, @eslint/js, eslint-plugin-react-hooks (+2 more)

### Community 1 - "server.js"
Cohesion: 0.11
Nodes (10): adminAuth(), app, cors, distPath, { exec }, express, fs, path (+2 more)

### Community 2 - "App.jsx"
Cohesion: 0.10
Nodes (46): AdminAccounts(), AdminAddComponent(), CATEGORIES, DEFAULT_FORM_DATA, AdminAuthGuard(), AdminContent(), AdminCrawler(), CATEGORIES (+38 more)

### Community 3 - "PCBuilder3D.jsx"
Cohesion: 0.06
Nodes (64): ComponentModels3D(), DDR4StickMesh(), HeroFloatingRAM(), MotherboardDDR4Kit(), ProceduralRAMFallback(), RAMModelErrorBoundary, SingleDDR4RAM(), GenericPCCase() (+56 more)

### Community 4 - "crawler.js"
Cohesion: 0.28
Nodes (12): axios, BERMOR_CATEGORY_MAP, detectProductCategory(), EASYPC_COLLECTION_MAP, EXCLUDED_KEYWORDS, extractSpecs(), getStagingProducts(), initScrapedTable() (+4 more)

### Community 5 - "devDependencies"
Cohesion: 0.18
Nodes (11): devDependencies, autoprefixer@^10.5.0, postcss@^8.5.10, tailwindcss@^4.2.2, @tailwindcss/postcss@^4.2.2, @types/react@^19.2.14, autoprefixer, postcss (+3 more)

### Community 6 - "Compatibility.jsx"
Cohesion: 0.06
Nodes (53): BOB_CASUAL_GUIDE, BOB_GENERAL_BUILD_LINES, BOB_STAGE_TIPS, Build(), BuildPage(), buildSteps, CATEGORY_FILTERS, getCaseDimensions() (+45 more)

### Community 7 - "frontend/package.json"
Cohesion: 0.22
Nodes (8): html2canvas@^1.4.1, @types/react-dom@^19.2.3, name, private, type, version, html2canvas, @types/react-dom

### Community 8 - "db.js"
Cohesion: 0.40
Nodes (4): mysql, pool, mysql2@^3.22.1, mysql2

### Community 9 - "[2026-10-23] - Master Checklist & Safari Compatibility Updates"
Cohesion: 0.33
Nodes (6): [2026-10-23] - Master Checklist & Safari Compatibility Updates, 🧊 3D Builder & Design Aesthetic, 🛡️ Admin Panel, 🍏 Apple & Safari Compatibility, 🛠️ Build & Home Page, 📚 Learn Page

### Community 10 - "SynthAudio"
Cohesion: 0.07
Nodes (6): [2026-10-23] UI Interaction Sounds Restored & Centralized (`soundManager.js`), 🔊 Root Cause Identified & Resolved, ⚡ Upgrades to `frontend/src/utilities/soundManager.js`, 🎮 Wired Semantic Audio Events Across Workspaces, SoundManager, SynthAudio

### Community 11 - "compatibility.test.js"
Cohesion: 0.27
Nodes (8): assert, checkCompatibility(), getCaseFormFactorCapacity(), getMoboFormFactorRank(), getNumber(), normalizeDdr(), normalizeSocket(), { test }

### Community 14 - "BuildLab Changelog"
Cohesion: 0.12
Nodes (16): [2026-10-23 03:34] - /clean Linter & Safari Prefix Fixes, [2026-10-23] - Admin Dashboard Syntax Error Fix (Vite Parse Error Resolved), [2026-10-23] - Server Deployment (/deploy), [2026-10-23] - Symmetrical Dual-Sidebar Architecture & Course Outline Fix (Learn Page), [2026-10-25] - Audio Deduplication: `Error2.mp3` Purged & Unified to `error.mp3`, [2026-10-25] - Audio Deduplication: `UI_Denied_2.mp3` Purged & Unified to `denied.mp3`, [2026-10-25] - Git Exclusion & Local Developer Privacy, [2026-10-25] - Graphify Architecture Concept & Visualizer Guide (+8 more)

### Community 15 - "[2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC)"
Cohesion: 0.22
Nodes (9): [2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC), 🧊 3D Builder (`/3d-builder`), 🔧 3D Drawer UI Optimization (PCBuilder3D.css), 🧱 Build Page Round 2 (OC), 🧱 Build Page — Viewport-Fitted Workspace (Build.jsx / Build.css / App.jsx), 🖥️ Fullscreen Gate (New Feature), 🏠 Home & Build Consolidation, 🤖 Integrations (+1 more)

### Community 16 - "App.jsx"
Cohesion: 0.05
Nodes (75): 🎬 Page Transition Animations (OC), AdminEditRedirect(), App(), AppContent(), ScrollToTop(), AboutUs(), TEAM_MEMBERS, WHITEHATS_PROJECTS (+67 more)

### Community 17 - "dependencies"
Cohesion: 0.13
Nodes (15): dependencies, gsap@^3.15.1, jspdf@^4.2.1, motion@^14.6.0, puppeteer-core@^25.16.0, react@^19.2.4, react-dom@^19.2.4, react-router-dom@^7.14.1 (+7 more)

### Community 18 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build, dev, lint, preview, start

### Community 19 - "curriculumTypes.d.ts"
Cohesion: 0.25
Nodes (7): CurriculumModule, CurriculumTopic, FieldFact, FieldFactItem, MistakeWarning, QuizOption, TopicQuiz

### Community 20 - "CourseVideoPlayer.jsx"
Cohesion: 0.90
Nodes (4): CourseVideoPlayer(), fmtTime(), loadYouTubeApi(), VideoOverlayModal()

### Community 21 - "[2026-10-23 03:54] - Build Layout Stability, Dynamic Category Filters & Price Removal"
Cohesion: 0.40
Nodes (5): [2026-10-23 03:54] - Build Layout Stability, Dynamic Category Filters & Price Removal, 💰 Complete Removal of Prices Globally, 🏷️ Dynamic Context-Aware Component Filters (Replaced Static Tiers), 🧱 Layout & Container Scrolling Fixes (`scrolling.mp4`), 📊 Revamped Empty Specifications State (`BUILD OVERVIEW`)

### Community 22 - "vite"
Cohesion: 0.40
Nodes (4): vite@^8.0.4, @vitejs/plugin-react@^6.0.1, vite, @vitejs/plugin-react

### Community 23 - "[2026-10-23 04:52] - Scrolling Elimination, Red Warning Removal & Redundancy Fix"
Cohesion: 0.50
Nodes (4): [2026-10-23 04:52] - Scrolling Elimination, Red Warning Removal & Redundancy Fix, 🚫 Complete Removal of Red Warning Highlights & Tooltips, 🖱️ Direct 1-Click Card Selection & Top Action Button (Zero Scrolling Suffering), 🧹 Redundancy Fixed: Single-Card Left Sidebar

### Community 24 - "scripts"
Cohesion: 0.50
Nodes (4): scripts, dev, start, test

### Community 25 - "[2026-10-23] Compatibility Checker SFX & Cute Sound Effects Update"
Cohesion: 0.50
Nodes (4): [2026-10-23] Compatibility Checker SFX & Cute Sound Effects Update, ⚡ Centralized Manager Enhancements (`soundManager.js`), 🛡️ Compatibility Checker Integration (`Compatibility.jsx`), 🔔 New & Updated Sound Effects (`frontend/public/sfx`)

### Community 26 - "backend/package.json"
Cohesion: 0.13
Nodes (19): author, dependencies, axios@^1.16.1, cors@^2.8.6, dotenv@^17.4.2, express@^5.2.1, description, devDependencies (+11 more)

### Community 27 - "[2026-10-23] Learn Page: NotebookLLM Master Source Script for Module 1"
Cohesion: 0.67
Nodes (3): [2026-10-23] Learn Page: NotebookLLM Master Source Script for Module 1, 📚 Generated Educational Master Script (`Module_1_NotebookLLM_Source.md`), 🎙️ Pure Native Text Format Optimization for NotebookLLM

### Community 28 - "AppContent"
Cohesion: 0.23
Nodes (17): FullscreenGate(), FullscreenGateContext, componentGuide, Learn(), StageUnlockBanner(), enterFullscreen(), exitFullscreen(), FS_ELEMENT() (+9 more)

### Community 29 - "[2026-10-23] Learn Page: Video Player Overhaul + 9 Dead Videos Replaced (OC)"
Cohesion: 0.67
Nodes (3): [2026-10-23] Learn Page: Video Player Overhaul + 9 Dead Videos Replaced (OC), Fixed / Added — `components/Learn/CourseVideoPlayer.jsx` + `CourseVideoPlayer.css` (new), Replaced — 9 unavailable YouTube videos (all new IDs verified 200 via oEmbed, embeddable)

## Knowledge Gaps
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `BuildLab Changelog` connect `BuildLab Changelog` to `[2026-10-23] Learn: Course-Outline Sidebar REWORK REVERTED to the previous design (OC — user request)`, `server.js`, `[2026-10-23] - Master Checklist & Safari Compatibility Updates`, `SynthAudio`, `[2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC)`, `[2026-10-23 03:54] - Build Layout Stability, Dynamic Category Filters & Price Removal`, `[2026-10-23 04:52] - Scrolling Elimination, Red Warning Removal & Redundancy Fix`, `[2026-10-23] Compatibility Checker SFX & Cute Sound Effects Update`, `[2026-10-23] Learn Page: NotebookLLM Master Source Script for Module 1`, `[2026-10-23] Learn Page: Video Player Overhaul + 9 Dead Videos Replaced (OC)`, `[2026-10-23] 3D Studio: Clean Button Design (Icons & Emojis Removed)`, `🖥️ Fullscreen Gating (`FullscreenGate.jsx`)`?**
  _High betweenness centrality (0.292) - this node is a cross-community bridge._
- **Should `server.js` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._
- **Why does `react` connect `App.jsx` to `PCBuilder3D.jsx`, `Compatibility.jsx`, `frontend/package.json`, `App.jsx`, `dependencies`, `CourseVideoPlayer.jsx`, `AppContent`?**
  _High betweenness centrality (0.233) - this node is a cross-community bridge._
- **Should `App.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0961369622475856 - nodes in this community are weakly interconnected._
- **Why does `Footer()` connect `App.jsx` to `BuildLab Changelog`?**
  _High betweenness centrality (0.190) - this node is a cross-community bridge._
- **Should `PCBuilder3D.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.060083594566353184 - nodes in this community are weakly interconnected._
- **Should `Compatibility.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06246799795186892 - nodes in this community are weakly interconnected._