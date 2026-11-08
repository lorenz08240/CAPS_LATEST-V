# Graph Report - CAPS_LATEST-V  (2026-11-09)

## Corpus Check
- 72 files · ~483,175 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 34 file(s) not represented in the graph (top: .css 21, (none) 5, .glb 3)

## Summary
- 484 nodes · 1082 edges · 24 communities (17 shown, 7 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3940bc2e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Build.jsx
- frontend/package.json
- App.jsx
- PCBuilder3D.jsx
- [2026-10-23] - Master Checklist & Safari Compatibility Updates
- [2026-10-23 03:54] - Build Layout Stability, Dynamic Category Filters & Price Removal
- [2026-10-23 04:52] - Scrolling Elimination, Red Warning Removal & Redundancy Fix
- SynthAudio
- [2026-10-23] Compatibility Checker SFX & Cute Sound Effects Update
- App.jsx
- SynthAudio
- compatibility.test.js
- BuildLab Changelog
- [2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC)
- CourseVideoPlayer.jsx
- [2026-10-23] Learn Page: NotebookLLM Master Source Script for Module 1
- [2026-10-23] Learn Page: Video Player Overhaul + 9 Dead Videos Replaced (OC)
- [2026-10-23] 3D Studio: Clean Button Design (Icons & Emojis Removed)
- [2026-10-23] Learn: Course-Outline Sidebar REWORK REVERTED to the previous design (OC — user request)
- 🖥️ Fullscreen Gating (`FullscreenGate.jsx`)
- FeatureCarousel.jsx
- backend/package.json

## God Nodes (most connected - your core abstractions)
1. `react` - 49 edges
2. `soundManager` - 44 edges
3. `BuildLab Changelog` - 28 edges
4. `react-router-dom` - 26 edges
5. `AppContent()` - 21 edges
6. `SynthAudio` - 20 edges
7. `FullscreenGate()` - 19 edges
8. `useAuth()` - 17 edges
9. `apiFetch()` - 17 edges
10. `AdminHeader()` - 15 edges

## Surprising Connections (you probably didn't know these)
- `🧹 Cleaned Button Typography in `frontend/src/components/3D/PCBuilder3D.jsx`` --references--> `Compatibility()`  [INFERRED]
  CHANGELOG.md → frontend/src/components/Compatibility/Compatibility.jsx
- `[2026-10-23] - Symmetrical Dual-Sidebar Architecture & Course Outline Fix (Learn Page)` --references--> `Footer()`  [INFERRED]
  CHANGELOG.md → frontend/src/components/Footer/Footer.jsx
- `🖥️ Fullscreen Gating (`FullscreenGate.jsx`)` --references--> `FullscreenGate()`  [INFERRED]
  CHANGELOG.md → frontend/src/components/FullscreenGate/FullscreenGate.jsx
- `🖥️ Fullscreen Gating (`FullscreenGate.jsx`)` --references--> `CourseShell()`  [INFERRED]
  CHANGELOG.md → frontend/src/components/Learn/CourseShell.jsx
- `🎬 Page Transition Animations (OC)` --references--> `MotionPage()`  [INFERRED]
  CHANGELOG.md → frontend/src/utilities/pageTransitions.jsx

## Import Cycles
- None detected.

## Communities (24 total, 7 thin omitted)

### Community 0 - "Build.jsx"
Cohesion: 0.06
Nodes (52): AboutUs(), TEAM_MEMBERS, BOB_PHRASES, BobCompanion(), brandData, Brands(), BOB_CASUAL_GUIDE, BOB_GENERAL_BUILD_LINES (+44 more)

### Community 1 - "frontend/package.json"
Cohesion: 0.05
Nodes (45): dependencies, motion, react, react-dom, react-router-dom, @react-three/drei, @react-three/fiber, three (+37 more)

### Community 2 - "App.jsx"
Cohesion: 0.10
Nodes (43): AdminAddComponent(), CATEGORIES, DEFAULT_FORM_DATA, AdminAuthGuard(), AdminCrawler(), CATEGORIES, STORES, AdminDeleteComponent() (+35 more)

### Community 3 - "PCBuilder3D.jsx"
Cohesion: 0.06
Nodes (52): ComponentModels3D(), DDR4StickMesh(), HeroFloatingRAM(), MotherboardDDR4Kit(), ProceduralRAMFallback(), RAMModelErrorBoundary, SingleDDR4RAM(), GenericPCCase() (+44 more)

### Community 4 - "[2026-10-23] - Master Checklist & Safari Compatibility Updates"
Cohesion: 0.33
Nodes (6): [2026-10-23] - Master Checklist & Safari Compatibility Updates, 🧊 3D Builder & Design Aesthetic, 🛡️ Admin Panel, 🍏 Apple & Safari Compatibility, 🛠️ Build & Home Page, 📚 Learn Page

### Community 5 - "[2026-10-23 03:54] - Build Layout Stability, Dynamic Category Filters & Price Removal"
Cohesion: 0.40
Nodes (5): [2026-10-23 03:54] - Build Layout Stability, Dynamic Category Filters & Price Removal, 💰 Complete Removal of Prices Globally, 🏷️ Dynamic Context-Aware Component Filters (Replaced Static Tiers), 🧱 Layout & Container Scrolling Fixes (`scrolling.mp4`), 📊 Revamped Empty Specifications State (`BUILD OVERVIEW`)

### Community 6 - "[2026-10-23 04:52] - Scrolling Elimination, Red Warning Removal & Redundancy Fix"
Cohesion: 0.50
Nodes (4): [2026-10-23 04:52] - Scrolling Elimination, Red Warning Removal & Redundancy Fix, 🚫 Complete Removal of Red Warning Highlights & Tooltips, 🖱️ Direct 1-Click Card Selection & Top Action Button (Zero Scrolling Suffering), 🧹 Redundancy Fixed: Single-Card Left Sidebar

### Community 8 - "[2026-10-23] Compatibility Checker SFX & Cute Sound Effects Update"
Cohesion: 0.50
Nodes (4): [2026-10-23] Compatibility Checker SFX & Cute Sound Effects Update, ⚡ Centralized Manager Enhancements (`soundManager.js`), 🛡️ Compatibility Checker Integration (`Compatibility.jsx`), 🔔 New & Updated Sound Effects (`frontend/public/sfx`)

### Community 9 - "App.jsx"
Cohesion: 0.10
Nodes (39): AdminEditRedirect(), App(), AppContent(), ScrollToTop(), PCBuilder3D(), Build(), Footer(), FullscreenGate() (+31 more)

### Community 10 - "SynthAudio"
Cohesion: 0.15
Nodes (4): [2026-10-23] UI Interaction Sounds Restored & Centralized (`soundManager.js`), 🔊 Root Cause Identified & Resolved, ⚡ Upgrades to `frontend/src/utilities/soundManager.js`, SynthAudio

### Community 11 - "compatibility.test.js"
Cohesion: 0.36
Nodes (6): checkCompatibility(), getCaseFormFactorCapacity(), getMoboFormFactorRank(), getNumber(), normalizeDdr(), normalizeSocket()

### Community 14 - "BuildLab Changelog"
Cohesion: 0.12
Nodes (16): [2026-10-23 03:34] - /clean Linter & Safari Prefix Fixes, [2026-10-23] - Admin Dashboard Syntax Error Fix (Vite Parse Error Resolved), [2026-10-23] - Server Deployment (/deploy), [2026-10-23] - Symmetrical Dual-Sidebar Architecture & Course Outline Fix (Learn Page), [2026-10-25] - Audio Deduplication: `Error2.mp3` Purged & Unified to `error.mp3`, [2026-10-25] - Audio Deduplication: `UI_Denied_2.mp3` Purged & Unified to `denied.mp3`, [2026-10-25] - Git Exclusion & Local Developer Privacy, [2026-10-25] - Graphify Architecture Concept & Visualizer Guide (+8 more)

### Community 15 - "[2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC)"
Cohesion: 0.20
Nodes (10): [2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC), 🧊 3D Builder (`/3d-builder`), 🔧 3D Drawer UI Optimization (PCBuilder3D.css), 🧱 Build Page Round 2 (OC), 🧱 Build Page — Viewport-Fitted Workspace (Build.jsx / Build.css / App.jsx), 🖥️ Fullscreen Gate (New Feature), 🏠 Home & Build Consolidation, 🤖 Integrations (+2 more)

### Community 16 - "CourseVideoPlayer.jsx"
Cohesion: 0.43
Nodes (5): CourseVideoPlayer(), fmtTime(), loadYouTubeApi(), VideoOverlayModal(), react-dom

### Community 17 - "[2026-10-23] Learn Page: NotebookLLM Master Source Script for Module 1"
Cohesion: 0.67
Nodes (3): [2026-10-23] Learn Page: NotebookLLM Master Source Script for Module 1, 📚 Generated Educational Master Script (`Module_1_NotebookLLM_Source.md`), 🎙️ Pure Native Text Format Optimization for NotebookLLM

### Community 18 - "[2026-10-23] Learn Page: Video Player Overhaul + 9 Dead Videos Replaced (OC)"
Cohesion: 0.67
Nodes (3): [2026-10-23] Learn Page: Video Player Overhaul + 9 Dead Videos Replaced (OC), Fixed / Added — `components/Learn/CourseVideoPlayer.jsx` + `CourseVideoPlayer.css` (new), Replaced — 9 unavailable YouTube videos (all new IDs verified 200 via oEmbed, embeddable)

### Community 26 - "backend/package.json"
Cohesion: 0.05
Nodes (41): pool, BERMOR_CATEGORY_MAP, detectProductCategory(), EASYPC_COLLECTION_MAP, EXCLUDED_KEYWORDS, extractSpecs(), getStagingProducts(), initScrapedTable() (+33 more)

## Knowledge Gaps
- **8 isolated node(s):** `dotenv`, `nodemon`, `@tailwindcss/postcss`, `@types/react`, `@types/react-dom` (+3 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 183 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `BuildLab Changelog` connect `BuildLab Changelog` to `[2026-10-23] - Master Checklist & Safari Compatibility Updates`, `[2026-10-23 03:54] - Build Layout Stability, Dynamic Category Filters & Price Removal`, `[2026-10-23 04:52] - Scrolling Elimination, Red Warning Removal & Redundancy Fix`, `[2026-10-23] Compatibility Checker SFX & Cute Sound Effects Update`, `SynthAudio`, `[2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC)`, `[2026-10-23] Learn Page: NotebookLLM Master Source Script for Module 1`, `[2026-10-23] Learn Page: Video Player Overhaul + 9 Dead Videos Replaced (OC)`, `[2026-10-23] 3D Studio: Clean Button Design (Icons & Emojis Removed)`, `[2026-10-23] Learn: Course-Outline Sidebar REWORK REVERTED to the previous design (OC — user request)`, `🖥️ Fullscreen Gating (`FullscreenGate.jsx`)`, `backend/package.json`?**
  _High betweenness centrality (0.328) - this node is a cross-community bridge._
- **What connects `dotenv`, `nodemon`, `@tailwindcss/postcss` to the rest of the system?**
  _8 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Build.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.056535504296698326 - nodes in this community are weakly interconnected._
- **Why does `react` connect `App.jsx` to `Build.jsx`, `frontend/package.json`, `PCBuilder3D.jsx`, `App.jsx`, `CourseVideoPlayer.jsx`, `FeatureCarousel.jsx`?**
  _High betweenness centrality (0.295) - this node is a cross-community bridge._
- **Should `frontend/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.04609929078014184 - nodes in this community are weakly interconnected._
- **Why does `Footer()` connect `App.jsx` to `App.jsx`, `BuildLab Changelog`?**
  _High betweenness centrality (0.191) - this node is a cross-community bridge._
- **Should `App.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10364886303543099 - nodes in this community are weakly interconnected._