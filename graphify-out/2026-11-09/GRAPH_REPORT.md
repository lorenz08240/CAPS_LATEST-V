# Graph Report - CAPS_LATEST-V  (2026-11-09)

## Corpus Check
- 80 files · ~105,686 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 39 file(s) not represented in the graph (top: .css 26, (none) 5, .glb 3)

## Summary
- 515 nodes · 1193 edges · 27 communities (20 shown, 7 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `16618f0e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Build.jsx
- App.jsx
- PCBuilder3D.jsx
- react
- SynthAudio
- compatibility.test.js
- BuildLab Changelog
- [2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC)
- FullscreenGate.jsx
- frontend/package.json
- devDependencies
- SynthAudio
- FeatureCarousel.jsx
- CourseVideoPlayer.jsx
- scrapedMeta.js
- backend/package.json
- [2026-10-23] - Master Checklist & Safari Compatibility Updates
- [2026-10-23 03:54] - Build Layout Stability, Dynamic Category Filters & Price Removal
- [2026-10-23 04:52] - Scrolling Elimination, Red Warning Removal & Redundancy Fix
- [2026-10-23] Compatibility Checker SFX & Cute Sound Effects Update
- [2026-10-23] Learn Page: NotebookLLM Master Source Script for Module 1
- [2026-10-23] Learn Page: Video Player Overhaul + 9 Dead Videos Replaced (OC)
- adminAuth
- [2026-10-23] 3D Studio: Clean Button Design (Icons & Emojis Removed)
- [2026-10-23] Learn: Course-Outline Sidebar REWORK REVERTED to the previous design (OC — user request)

## God Nodes (most connected - your core abstractions)
1. `react` - 57 edges
2. `soundManager` - 49 edges
3. `react-router-dom` - 30 edges
4. `BuildLab Changelog` - 28 edges
5. `AppContent()` - 26 edges
6. `SynthAudio` - 20 edges
7. `FullscreenGate()` - 19 edges
8. `AdminHeader()` - 19 edges
9. `useAuth()` - 17 edges
10. `apiFetch()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `🧹 Cleaned Button Typography in `frontend/src/components/3D/PCBuilder3D.jsx`` --references--> `Compatibility()`  [INFERRED]
  CHANGELOG.md → frontend/src/components/Compatibility/Compatibility.jsx
- `🖥️ Fullscreen Gating (`FullscreenGate.jsx`)` --references--> `CourseShell()`  [INFERRED]
  CHANGELOG.md → frontend/src/components/Learn/CourseShell.jsx
- `⚡ Upgrades to `frontend/src/utilities/soundManager.js`` --references--> `SynthAudio`  [INFERRED]
  CHANGELOG.md → frontend/src/utilities/soundManager.js
- `[2026-10-23] - Symmetrical Dual-Sidebar Architecture & Course Outline Fix (Learn Page)` --references--> `Footer()`  [INFERRED]
  CHANGELOG.md → frontend/src/components/Footer/Footer.jsx
- `🎬 Page Transition Animations (OC)` --references--> `MotionPage()`  [INFERRED]
  CHANGELOG.md → frontend/src/utilities/pageTransitions.jsx

## Import Cycles
- None detected.

## Communities (27 total, 7 thin omitted)

### Community 0 - "Build.jsx"
Cohesion: 0.10
Nodes (26): BOB_PHRASES, BOB_CASUAL_GUIDE, BOB_GENERAL_BUILD_LINES, BOB_STAGE_TIPS, CATEGORY_FILTERS, clamp(), Eye, EyeTracker() (+18 more)

### Community 2 - "App.jsx"
Cohesion: 0.12
Nodes (39): AdminAccounts(), AdminAddComponent(), CATEGORIES, DEFAULT_FORM_DATA, AdminAuthGuard(), AdminContent(), AdminCrawler(), CATEGORIES (+31 more)

### Community 3 - "PCBuilder3D.jsx"
Cohesion: 0.06
Nodes (54): ComponentModels3D(), DDR4StickMesh(), HeroFloatingRAM(), MotherboardDDR4Kit(), ProceduralRAMFallback(), RAMModelErrorBoundary, SingleDDR4RAM(), GenericPCCase() (+46 more)

### Community 9 - "react"
Cohesion: 0.06
Nodes (59): AdminEditRedirect(), App(), AppContent(), ScrollToTop(), PCBuilder3D(), AboutUs(), TEAM_MEMBERS, BobCompanion() (+51 more)

### Community 11 - "compatibility.test.js"
Cohesion: 0.36
Nodes (6): checkCompatibility(), getCaseFormFactorCapacity(), getMoboFormFactorRank(), getNumber(), normalizeDdr(), normalizeSocket()

### Community 14 - "BuildLab Changelog"
Cohesion: 0.12
Nodes (16): [2026-10-23 03:34] - /clean Linter & Safari Prefix Fixes, [2026-10-23] - Admin Dashboard Syntax Error Fix (Vite Parse Error Resolved), [2026-10-23] - Server Deployment (/deploy), [2026-10-23] - Symmetrical Dual-Sidebar Architecture & Course Outline Fix (Learn Page), [2026-10-25] - Audio Deduplication: `Error2.mp3` Purged & Unified to `error.mp3`, [2026-10-25] - Audio Deduplication: `UI_Denied_2.mp3` Purged & Unified to `denied.mp3`, [2026-10-25] - Git Exclusion & Local Developer Privacy, [2026-10-25] - Graphify Architecture Concept & Visualizer Guide (+8 more)

### Community 15 - "[2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC)"
Cohesion: 0.20
Nodes (10): [2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC), 🧊 3D Builder (`/3d-builder`), 🔧 3D Drawer UI Optimization (PCBuilder3D.css), 🧱 Build Page Round 2 (OC), 🧱 Build Page — Viewport-Fitted Workspace (Build.jsx / Build.css / App.jsx), 🖥️ Fullscreen Gate (New Feature), 🏠 Home & Build Consolidation, 🤖 Integrations (+2 more)

### Community 16 - "FullscreenGate.jsx"
Cohesion: 0.26
Nodes (14): [2026-10-23] Fullscreen Requirement Enabled for Compatibility & Learn, 🖥️ Fullscreen Gating (`FullscreenGate.jsx`), FullscreenGate(), Preloader(), enterFullscreen(), FS_ELEMENT(), hasEngagedFullscreen(), isCoarsePointer() (+6 more)

### Community 18 - "frontend/package.json"
Cohesion: 0.05
Nodes (40): dependencies, html2canvas, jspdf, motion, puppeteer-core, react, react-dom, react-router-dom (+32 more)

### Community 19 - "devDependencies"
Cohesion: 0.14
Nodes (14): devDependencies, autoprefixer, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, postcss (+6 more)

### Community 20 - "SynthAudio"
Cohesion: 0.15
Nodes (4): [2026-10-23] UI Interaction Sounds Restored & Centralized (`soundManager.js`), 🔊 Root Cause Identified & Resolved, ⚡ Upgrades to `frontend/src/utilities/soundManager.js`, SynthAudio

### Community 24 - "CourseVideoPlayer.jsx"
Cohesion: 0.43
Nodes (5): CourseVideoPlayer(), fmtTime(), loadYouTubeApi(), VideoOverlayModal(), react-dom

### Community 25 - "scrapedMeta.js"
Cohesion: 0.38
Nodes (6): escapeRegex(), GENERIC_TOKENS, isJunkToken(), KNOWN_BRANDS, parseProductMeta(), SPEC_TOKEN_PATTERNS

### Community 26 - "backend/package.json"
Cohesion: 0.05
Nodes (40): pool, BERMOR_CATEGORY_MAP, detectProductCategory(), EASYPC_COLLECTION_MAP, EXCLUDED_KEYWORDS, extractSpecs(), getStagingProducts(), initScrapedTable() (+32 more)

### Community 27 - "[2026-10-23] - Master Checklist & Safari Compatibility Updates"
Cohesion: 0.33
Nodes (6): [2026-10-23] - Master Checklist & Safari Compatibility Updates, 🧊 3D Builder & Design Aesthetic, 🛡️ Admin Panel, 🍏 Apple & Safari Compatibility, 🛠️ Build & Home Page, 📚 Learn Page

### Community 28 - "[2026-10-23 03:54] - Build Layout Stability, Dynamic Category Filters & Price Removal"
Cohesion: 0.40
Nodes (5): [2026-10-23 03:54] - Build Layout Stability, Dynamic Category Filters & Price Removal, 💰 Complete Removal of Prices Globally, 🏷️ Dynamic Context-Aware Component Filters (Replaced Static Tiers), 🧱 Layout & Container Scrolling Fixes (`scrolling.mp4`), 📊 Revamped Empty Specifications State (`BUILD OVERVIEW`)

### Community 29 - "[2026-10-23 04:52] - Scrolling Elimination, Red Warning Removal & Redundancy Fix"
Cohesion: 0.50
Nodes (4): [2026-10-23 04:52] - Scrolling Elimination, Red Warning Removal & Redundancy Fix, 🚫 Complete Removal of Red Warning Highlights & Tooltips, 🖱️ Direct 1-Click Card Selection & Top Action Button (Zero Scrolling Suffering), 🧹 Redundancy Fixed: Single-Card Left Sidebar

### Community 30 - "[2026-10-23] Compatibility Checker SFX & Cute Sound Effects Update"
Cohesion: 0.50
Nodes (4): [2026-10-23] Compatibility Checker SFX & Cute Sound Effects Update, ⚡ Centralized Manager Enhancements (`soundManager.js`), 🛡️ Compatibility Checker Integration (`Compatibility.jsx`), 🔔 New & Updated Sound Effects (`frontend/public/sfx`)

### Community 32 - "[2026-10-23] Learn Page: NotebookLLM Master Source Script for Module 1"
Cohesion: 0.67
Nodes (3): [2026-10-23] Learn Page: NotebookLLM Master Source Script for Module 1, 📚 Generated Educational Master Script (`Module_1_NotebookLLM_Source.md`), 🎙️ Pure Native Text Format Optimization for NotebookLLM

### Community 33 - "[2026-10-23] Learn Page: Video Player Overhaul + 9 Dead Videos Replaced (OC)"
Cohesion: 0.67
Nodes (3): [2026-10-23] Learn Page: Video Player Overhaul + 9 Dead Videos Replaced (OC), Fixed / Added — `components/Learn/CourseVideoPlayer.jsx` + `CourseVideoPlayer.css` (new), Replaced — 9 unavailable YouTube videos (all new IDs verified 200 via oEmbed, embeddable)

## Knowledge Gaps
- **9 isolated node(s):** `autoprefixer`, `postcss`, `tailwindcss`, `@tailwindcss/postcss`, `@types/react` (+4 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 194 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `BuildLab Changelog` connect `BuildLab Changelog` to `[2026-10-23] Learn Page: NotebookLLM Master Source Script for Module 1`, `[2026-10-23] Learn Page: Video Player Overhaul + 9 Dead Videos Replaced (OC)`, `adminAuth`, `[2026-10-23] 3D Studio: Clean Button Design (Icons & Emojis Removed)`, `[2026-10-23] Learn: Course-Outline Sidebar REWORK REVERTED to the previous design (OC — user request)`, `[2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC)`, `FullscreenGate.jsx`, `SynthAudio`, `[2026-10-23] - Master Checklist & Safari Compatibility Updates`, `[2026-10-23 03:54] - Build Layout Stability, Dynamic Category Filters & Price Removal`, `[2026-10-23 04:52] - Scrolling Elimination, Red Warning Removal & Redundancy Fix`, `[2026-10-23] Compatibility Checker SFX & Cute Sound Effects Update`?**
  _High betweenness centrality (0.319) - this node is a cross-community bridge._
- **What connects `autoprefixer`, `postcss`, `tailwindcss` to the rest of the system?**
  _9 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Build.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0967741935483871 - nodes in this community are weakly interconnected._
- **Why does `react` connect `App.jsx` to `Build.jsx`, `PCBuilder3D.jsx`, `react`, `FullscreenGate.jsx`, `frontend/package.json`, `FeatureCarousel.jsx`, `CourseVideoPlayer.jsx`?**
  _High betweenness centrality (0.296) - this node is a cross-community bridge._
- **Should `App.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12341197822141561 - nodes in this community are weakly interconnected._
- **Why does `Footer()` connect `react` to `BuildLab Changelog`?**
  _High betweenness centrality (0.189) - this node is a cross-community bridge._
- **Should `PCBuilder3D.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.060833902939166094 - nodes in this community are weakly interconnected._