# Graph Report - CAPS_LATEST-V  (2026-11-06)

## Corpus Check
- 70 files · ~473,142 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 31 file(s) not represented in the graph (top: .css 21, (none) 3, .glb 2)

## Summary
- 458 nodes · 1009 edges · 26 communities (20 shown, 6 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f0262ef6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- backend/package.json
- frontend/package.json
- App.jsx
- PCBuilder3D.jsx
- [2026-10-23] 3D Studio: Clean Button Design (Icons & Emojis Removed)
- App.jsx
- Home.jsx
- SynthAudio
- PCBuilder3D.jsx
- devDependencies
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
- adminAuth

## God Nodes (most connected - your core abstractions)
1. `react` - 47 edges
2. `soundManager` - 39 edges
3. `BuildLab Changelog` - 28 edges
4. `react-router-dom` - 25 edges
5. `AppContent()` - 21 edges
6. `SynthAudio` - 20 edges
7. `FullscreenGate()` - 19 edges
8. `useAuth()` - 15 edges
9. `apiFetch()` - 15 edges
10. `EyeTracker()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `🧹 Cleaned Button Typography in `frontend/src/components/3D/PCBuilder3D.jsx`` --references--> `Compatibility()`  [INFERRED]
  CHANGELOG.md → frontend/src/components/Compatibility/Compatibility.jsx
- `[2026-10-23] - Symmetrical Dual-Sidebar Architecture & Course Outline Fix (Learn Page)` --references--> `Footer()`  [INFERRED]
  CHANGELOG.md → frontend/src/components/Footer/Footer.jsx
- `🖥️ Fullscreen Gating (`FullscreenGate.jsx`)` --references--> `FullscreenGate()`  [INFERRED]
  CHANGELOG.md → frontend/src/components/FullscreenGate/FullscreenGate.jsx
- `⚡ Upgrades to `frontend/src/utilities/soundManager.js`` --references--> `SynthAudio`  [INFERRED]
  CHANGELOG.md → frontend/src/utilities/soundManager.js
- `[2026-10-31] - Security Hardening & Architecture Consolidation (OpenCode Audit)` --references--> `adminAuth()`  [INFERRED]
  CHANGELOG.md → backend/server.js

## Import Cycles
- None detected.

## Communities (26 total, 6 thin omitted)

### Community 0 - "backend/package.json"
Cohesion: 0.06
Nodes (39): pool, BERMOR_CATEGORY_MAP, detectProductCategory(), EASYPC_COLLECTION_MAP, EXCLUDED_KEYWORDS, extractSpecs(), getStagingProducts(), initScrapedTable() (+31 more)

### Community 1 - "frontend/package.json"
Cohesion: 0.07
Nodes (31): dependencies, motion, react, react-dom, react-router-dom, @react-three/drei, @react-three/fiber, three (+23 more)

### Community 2 - "App.jsx"
Cohesion: 0.12
Nodes (36): AppContent(), AdminAddComponent(), CATEGORIES, DEFAULT_FORM_DATA, AdminAuthGuard(), AdminCrawler(), CATEGORIES, STORES (+28 more)

### Community 3 - "PCBuilder3D.jsx"
Cohesion: 0.09
Nodes (35): ComponentModels3D(), DDR4StickMesh(), HeroFloatingRAM(), MotherboardDDR4Kit(), ProceduralRAMFallback(), RAMModelErrorBoundary, SingleDDR4RAM(), GenericPCCase() (+27 more)

### Community 5 - "App.jsx"
Cohesion: 0.12
Nodes (19): 🎬 Page Transition Animations (OC), App(), ScrollToTop(), AboutUs(), TEAM_MEMBERS, brandData, Brands(), GlobalHeader() (+11 more)

### Community 6 - "Home.jsx"
Cohesion: 0.18
Nodes (20): Build(), FullscreenGate(), Home(), Preloader(), Navbar(), CyberBrand(), TELEMETRY_METRICS, SidebarContext (+12 more)

### Community 7 - "SynthAudio"
Cohesion: 0.08
Nodes (6): [2026-10-23] UI Interaction Sounds Restored & Centralized (`soundManager.js`), 🔊 Root Cause Identified & Resolved, ⚡ Upgrades to `frontend/src/utilities/soundManager.js`, 🎮 Wired Semantic Audio Events Across Workspaces, soundManager, SynthAudio

### Community 8 - "PCBuilder3D.jsx"
Cohesion: 0.07
Nodes (45): CAMERA_PRESETS_TOWER, CAMERA_PRESETS_WORKBENCH, CameraController(), DropIndicator(), PCBuilder3D(), PCBuilder3DWorkspace(), STAGE_CAMERA_FOCUS, STAGE_REQUIREMENTS (+37 more)

### Community 9 - "devDependencies"
Cohesion: 0.14
Nodes (14): devDependencies, autoprefixer, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, postcss (+6 more)

### Community 10 - "CourseShell.jsx"
Cohesion: 0.13
Nodes (20): [2026-10-23] Fullscreen Requirement Enabled for Compatibility & Learn, 🖥️ Fullscreen Gating (`FullscreenGate.jsx`), BOB_PHRASES, BobCompanion(), BOB_HELP_PHRASES, HelpSupport(), QUICK_DIAGNOSTICS, SUPPORT_CATEGORIES (+12 more)

### Community 11 - "compatibility.test.js"
Cohesion: 0.36
Nodes (6): checkCompatibility(), getCaseFormFactorCapacity(), getMoboFormFactorRank(), getNumber(), normalizeDdr(), normalizeSocket()

### Community 14 - "BuildLab Changelog"
Cohesion: 0.12
Nodes (16): [2026-10-23 03:34] - /clean Linter & Safari Prefix Fixes, [2026-10-23] - Admin Dashboard Syntax Error Fix (Vite Parse Error Resolved), [2026-10-23] - Server Deployment (/deploy), [2026-10-23] - Symmetrical Dual-Sidebar Architecture & Course Outline Fix (Learn Page), [2026-10-25] - Audio Deduplication: `Error2.mp3` Purged & Unified to `error.mp3`, [2026-10-25] - Audio Deduplication: `UI_Denied_2.mp3` Purged & Unified to `denied.mp3`, [2026-10-25] - Git Exclusion & Local Developer Privacy, [2026-10-25] - Graphify Architecture Concept & Visualizer Guide (+8 more)

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

## Knowledge Gaps
- **8 isolated node(s):** `dotenv`, `nodemon`, `@tailwindcss/postcss`, `@types/react`, `@types/react-dom` (+3 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 175 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `BuildLab Changelog` connect `BuildLab Changelog` to `[2026-10-23] 3D Studio: Clean Button Design (Icons & Emojis Removed)`, `SynthAudio`, `CourseShell.jsx`, `[2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC)`, `[2026-10-23] - Master Checklist & Safari Compatibility Updates`, `[2026-10-23 03:54] - Build Layout Stability, Dynamic Category Filters & Price Removal`, `[2026-10-23 04:52] - Scrolling Elimination, Red Warning Removal & Redundancy Fix`, `[2026-10-23] Compatibility Checker SFX & Cute Sound Effects Update`, `[2026-10-23] Learn Page: NotebookLLM Master Source Script for Module 1`, `[2026-10-23] Learn Page: Video Player Overhaul + 9 Dead Videos Replaced (OC)`, `[2026-10-23] Learn: Course-Outline Sidebar REWORK REVERTED to the previous design (OC — user request)`, `adminAuth`?**
  _High betweenness centrality (0.337) - this node is a cross-community bridge._
- **What connects `dotenv`, `nodemon`, `@tailwindcss/postcss` to the rest of the system?**
  _8 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `backend/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05757575757575758 - nodes in this community are weakly interconnected._
- **Why does `react` connect `App.jsx` to `frontend/package.json`, `PCBuilder3D.jsx`, `App.jsx`, `Home.jsx`, `PCBuilder3D.jsx`, `CourseShell.jsx`, `FeatureCarousel.jsx`?**
  _High betweenness centrality (0.292) - this node is a cross-community bridge._
- **Should `frontend/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.0677361853832442 - nodes in this community are weakly interconnected._
- **Why does `Footer()` connect `App.jsx` to `App.jsx`, `BuildLab Changelog`?**
  _High betweenness centrality (0.195) - this node is a cross-community bridge._
- **Should `App.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12409288824383163 - nodes in this community are weakly interconnected._