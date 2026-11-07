# Graph Report - CAPS_LATEST-V  (2026-11-07)

## Corpus Check
- 71 files · ~85,118 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 31 file(s) not represented in the graph (top: .css 21, (none) 3, .glb 2)

## Summary
- 473 nodes · 1008 edges · 32 communities (25 shown, 7 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `75223e7c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- backend/package.json
- frontend/package.json
- App.jsx
- PCBuilder3D.jsx
- [2026-10-23] 3D Studio: Clean Button Design (Icons & Emojis Removed)
- soundManager
- App.jsx
- SynthAudio
- PCBuilder3D.jsx
- Build.jsx
- CourseShell.jsx
- compatibility.test.js
- BuildLab Changelog
- [2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC)
- scrapedMeta.js
- [2026-10-23] - Master Checklist & Safari Compatibility Updates
- [2026-10-23 03:54] - Build Layout Stability, Dynamic Category Filters & Price Removal
- [2026-10-23 04:52] - Scrolling Elimination, Red Warning Removal & Redundancy Fix
- [2026-10-23] Compatibility Checker SFX & Cute Sound Effects Update
- [2026-10-23] Learn Page: NotebookLLM Master Source Script for Module 1
- FeatureCarousel.jsx
- [2026-10-23] Learn Page: Video Player Overhaul + 9 Dead Videos Replaced (OC)
- [2026-10-23] Learn: Course-Outline Sidebar REWORK REVERTED to the previous design (OC — user request)
- Footer
- server.js
- devDependencies
- crawler.js
- dependencies
- scripts
- db.js

## God Nodes (most connected - your core abstractions)
1. `react` - 48 edges
2. `soundManager` - 39 edges
3. `BuildLab Changelog` - 28 edges
4. `react-router-dom` - 26 edges
5. `SynthAudio` - 20 edges
6. `FullscreenGate()` - 19 edges
7. `useAuth()` - 17 edges
8. `apiFetch()` - 17 edges
9. `AppContent()` - 16 edges
10. `AdminHeader()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `🧹 Cleaned Button Typography in `frontend/src/components/3D/PCBuilder3D.jsx`` --references--> `Compatibility()`  [INFERRED]
  CHANGELOG.md → frontend/src/components/Compatibility/Compatibility.jsx
- `⚡ Upgrades to `frontend/src/utilities/soundManager.js`` --references--> `SynthAudio`  [INFERRED]
  CHANGELOG.md → frontend/src/utilities/soundManager.js
- `🖥️ Fullscreen Gating (`FullscreenGate.jsx`)` --references--> `FullscreenGate()`  [INFERRED]
  CHANGELOG.md → frontend/src/components/FullscreenGate/FullscreenGate.jsx
- `[2026-10-31] - Security Hardening & Architecture Consolidation (OpenCode Audit)` --references--> `adminAuth()`  [INFERRED]
  CHANGELOG.md → backend/server.js
- `🖥️ Fullscreen Gating (`FullscreenGate.jsx`)` --references--> `CourseShell()`  [INFERRED]
  CHANGELOG.md → frontend/src/components/Learn/CourseShell.jsx

## Import Cycles
- None detected.

## Communities (32 total, 7 thin omitted)

### Community 0 - "backend/package.json"
Cohesion: 0.15
Nodes (12): author, description, devDependencies, nodemon, keywords, license, main, name (+4 more)

### Community 1 - "frontend/package.json"
Cohesion: 0.07
Nodes (31): dependencies, motion, react, react-dom, react-router-dom, @react-three/drei, @react-three/fiber, three (+23 more)

### Community 2 - "App.jsx"
Cohesion: 0.12
Nodes (37): AdminAddComponent(), CATEGORIES, DEFAULT_FORM_DATA, AdminAuthGuard(), AdminCrawler(), CATEGORIES, STORES, AdminDeleteComponent() (+29 more)

### Community 3 - "PCBuilder3D.jsx"
Cohesion: 0.09
Nodes (34): ComponentModels3D(), DDR4StickMesh(), HeroFloatingRAM(), MotherboardDDR4Kit(), ProceduralRAMFallback(), RAMModelErrorBoundary, SingleDDR4RAM(), GenericPCCase() (+26 more)

### Community 5 - "soundManager"
Cohesion: 0.13
Nodes (6): AboutUs(), TEAM_MEMBERS, brandData, Brands(), GlobalHeader(), soundManager

### Community 6 - "App.jsx"
Cohesion: 0.11
Nodes (13): 🎬 Page Transition Animations (OC), App(), ScrollToTop(), AuthProvider(), BuildProvider(), SidebarProvider(), ThemeContext, ThemeProvider() (+5 more)

### Community 7 - "SynthAudio"
Cohesion: 0.14
Nodes (5): [2026-10-23] UI Interaction Sounds Restored & Centralized (`soundManager.js`), 🔊 Root Cause Identified & Resolved, ⚡ Upgrades to `frontend/src/utilities/soundManager.js`, 🎮 Wired Semantic Audio Events Across Workspaces, SynthAudio

### Community 8 - "PCBuilder3D.jsx"
Cohesion: 0.07
Nodes (45): CAMERA_PRESETS_TOWER, CAMERA_PRESETS_WORKBENCH, CameraController(), DropIndicator(), PCBuilder3D(), PCBuilder3DWorkspace(), STAGE_CAMERA_FOCUS, STAGE_REQUIREMENTS (+37 more)

### Community 9 - "Build.jsx"
Cohesion: 0.15
Nodes (25): AppContent(), Build(), FullscreenGate(), Home3DHero(), Home(), Preloader(), componentGuide, Learn() (+17 more)

### Community 10 - "CourseShell.jsx"
Cohesion: 0.14
Nodes (18): [2026-10-23] Fullscreen Requirement Enabled for Compatibility & Learn, 🖥️ Fullscreen Gating (`FullscreenGate.jsx`), BOB_PHRASES, BobCompanion(), BOB_HELP_PHRASES, HelpSupport(), QUICK_DIAGNOSTICS, SUPPORT_CATEGORIES (+10 more)

### Community 11 - "compatibility.test.js"
Cohesion: 0.36
Nodes (6): checkCompatibility(), getCaseFormFactorCapacity(), getMoboFormFactorRank(), getNumber(), normalizeDdr(), normalizeSocket()

### Community 14 - "BuildLab Changelog"
Cohesion: 0.12
Nodes (15): [2026-10-23 03:34] - /clean Linter & Safari Prefix Fixes, [2026-10-23] - Admin Dashboard Syntax Error Fix (Vite Parse Error Resolved), [2026-10-23] - Server Deployment (/deploy), [2026-10-25] - Audio Deduplication: `Error2.mp3` Purged & Unified to `error.mp3`, [2026-10-25] - Audio Deduplication: `UI_Denied_2.mp3` Purged & Unified to `denied.mp3`, [2026-10-25] - Git Exclusion & Local Developer Privacy, [2026-10-25] - Graphify Architecture Concept & Visualizer Guide, [2026-10-25] - Graphify & Workspace Logs Analysis (+7 more)

### Community 15 - "[2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC)"
Cohesion: 0.22
Nodes (9): [2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC), 🧊 3D Builder (`/3d-builder`), 🔧 3D Drawer UI Optimization (PCBuilder3D.css), 🧱 Build Page Round 2 (OC), 🧱 Build Page — Viewport-Fitted Workspace (Build.jsx / Build.css / App.jsx), 🖥️ Fullscreen Gate (New Feature), 🏠 Home & Build Consolidation, 🤖 Integrations (+1 more)

### Community 16 - "scrapedMeta.js"
Cohesion: 0.38
Nodes (6): escapeRegex(), GENERIC_TOKENS, isJunkToken(), KNOWN_BRANDS, parseProductMeta(), SPEC_TOKEN_PATTERNS

### Community 17 - "[2026-10-23] - Master Checklist & Safari Compatibility Updates"
Cohesion: 0.33
Nodes (6): [2026-10-23] - Master Checklist & Safari Compatibility Updates, 🧊 3D Builder & Design Aesthetic, 🛡️ Admin Panel, 🍏 Apple & Safari Compatibility, 🛠️ Build & Home Page, 📚 Learn Page

### Community 18 - "[2026-10-23 03:54] - Build Layout Stability, Dynamic Category Filters & Price Removal"
Cohesion: 0.40
Nodes (5): [2026-10-23 03:54] - Build Layout Stability, Dynamic Category Filters & Price Removal, 💰 Complete Removal of Prices Globally, 🏷️ Dynamic Context-Aware Component Filters (Replaced Static Tiers), 🧱 Layout & Container Scrolling Fixes (`scrolling.mp4`), 📊 Revamped Empty Specifications State (`BUILD OVERVIEW`)

### Community 19 - "[2026-10-23 04:52] - Scrolling Elimination, Red Warning Removal & Redundancy Fix"
Cohesion: 0.50
Nodes (4): [2026-10-23 04:52] - Scrolling Elimination, Red Warning Removal & Redundancy Fix, 🚫 Complete Removal of Red Warning Highlights & Tooltips, 🖱️ Direct 1-Click Card Selection & Top Action Button (Zero Scrolling Suffering), 🧹 Redundancy Fixed: Single-Card Left Sidebar

### Community 20 - "[2026-10-23] Compatibility Checker SFX & Cute Sound Effects Update"
Cohesion: 0.50
Nodes (4): [2026-10-23] Compatibility Checker SFX & Cute Sound Effects Update, ⚡ Centralized Manager Enhancements (`soundManager.js`), 🛡️ Compatibility Checker Integration (`Compatibility.jsx`), 🔔 New & Updated Sound Effects (`frontend/public/sfx`)

### Community 21 - "[2026-10-23] Learn Page: NotebookLLM Master Source Script for Module 1"
Cohesion: 0.67
Nodes (3): [2026-10-23] Learn Page: NotebookLLM Master Source Script for Module 1, 📚 Generated Educational Master Script (`Module_1_NotebookLLM_Source.md`), 🎙️ Pure Native Text Format Optimization for NotebookLLM

### Community 23 - "[2026-10-23] Learn Page: Video Player Overhaul + 9 Dead Videos Replaced (OC)"
Cohesion: 0.67
Nodes (3): [2026-10-23] Learn Page: Video Player Overhaul + 9 Dead Videos Replaced (OC), Fixed / Added — `components/Learn/CourseVideoPlayer.jsx` + `CourseVideoPlayer.css` (new), Replaced — 9 unavailable YouTube videos (all new IDs verified 200 via oEmbed, embeddable)

### Community 26 - "server.js"
Cohesion: 0.14
Nodes (10): adminAuth(), app, cors, distPath, { exec }, express, path, [2026-10-31] - Security Hardening & Architecture Consolidation (OpenCode Audit) (+2 more)

### Community 27 - "devDependencies"
Cohesion: 0.14
Nodes (14): devDependencies, autoprefixer, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, postcss (+6 more)

### Community 28 - "crawler.js"
Cohesion: 0.32
Nodes (11): BERMOR_CATEGORY_MAP, detectProductCategory(), EASYPC_COLLECTION_MAP, EXCLUDED_KEYWORDS, extractSpecs(), getStagingProducts(), initScrapedTable(), processAndSaveProducts() (+3 more)

### Community 29 - "dependencies"
Cohesion: 0.33
Nodes (6): dependencies, axios, cors, dotenv, express, mysql2

### Community 30 - "scripts"
Cohesion: 0.50
Nodes (4): scripts, dev, start, test

## Knowledge Gaps
- **8 isolated node(s):** `dotenv`, `nodemon`, `autoprefixer`, `postcss`, `tailwindcss` (+3 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 186 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `BuildLab Changelog` connect `BuildLab Changelog` to `[2026-10-23] 3D Studio: Clean Button Design (Icons & Emojis Removed)`, `SynthAudio`, `CourseShell.jsx`, `[2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC)`, `[2026-10-23] - Master Checklist & Safari Compatibility Updates`, `[2026-10-23 03:54] - Build Layout Stability, Dynamic Category Filters & Price Removal`, `[2026-10-23 04:52] - Scrolling Elimination, Red Warning Removal & Redundancy Fix`, `[2026-10-23] Compatibility Checker SFX & Cute Sound Effects Update`, `[2026-10-23] Learn Page: NotebookLLM Master Source Script for Module 1`, `[2026-10-23] Learn Page: Video Player Overhaul + 9 Dead Videos Replaced (OC)`, `[2026-10-23] Learn: Course-Outline Sidebar REWORK REVERTED to the previous design (OC — user request)`, `Footer`, `server.js`?**
  _High betweenness centrality (0.345) - this node is a cross-community bridge._
- **What connects `dotenv`, `nodemon`, `autoprefixer` to the rest of the system?**
  _8 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `frontend/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.0677361853832442 - nodes in this community are weakly interconnected._
- **Why does `react` connect `App.jsx` to `frontend/package.json`, `PCBuilder3D.jsx`, `soundManager`, `App.jsx`, `PCBuilder3D.jsx`, `Build.jsx`, `CourseShell.jsx`, `FeatureCarousel.jsx`?**
  _High betweenness centrality (0.322) - this node is a cross-community bridge._
- **Should `App.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11582491582491583 - nodes in this community are weakly interconnected._
- **Why does `[2026-10-31] - Security Hardening & Architecture Consolidation (OpenCode Audit)` connect `server.js` to `BuildLab Changelog`?**
  _High betweenness centrality (0.188) - this node is a cross-community bridge._
- **Should `PCBuilder3D.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09387755102040816 - nodes in this community are weakly interconnected._