# Graph Report - CAPS_LATEST-V  (2026-11-09)

## Corpus Check
- 82 files · ~522,503 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 41 file(s) not represented in the graph (top: .css 28, (none) 5, .glb 3)

## Summary
- 520 nodes · 1209 edges · 30 communities (21 shown, 9 thin omitted)
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
- CourseShell.jsx
- [2026-10-23] - Master Checklist & Safari Compatibility Updates
- [2026-10-23 03:54] - Build Layout Stability, Dynamic Category Filters & Price Removal
- App.jsx
- SynthAudio
- compatibility.test.js
- BuildLab Changelog
- [2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC)
- [2026-10-23 04:52] - Scrolling Elimination, Red Warning Removal & Redundancy Fix
- [2026-10-23] Compatibility Checker SFX & Cute Sound Effects Update
- frontend/package.json
- devDependencies
- SynthAudio
- [2026-10-23] Learn Page: NotebookLLM Master Source Script for Module 1
- FeatureCarousel.jsx
- [2026-10-23] Learn Page: Video Player Overhaul + 9 Dead Videos Replaced (OC)
- main.jsx
- scrapedMeta.js
- backend/package.json
- adminAuth
- [2026-10-23] 3D Studio: Clean Button Design (Icons & Emojis Removed)
- [2026-10-23] Learn: Course-Outline Sidebar REWORK REVERTED to the previous design (OC — user request)

## God Nodes (most connected - your core abstractions)
1. `react` - 59 edges
2. `soundManager` - 50 edges
3. `react-router-dom` - 30 edges
4. `AppContent()` - 28 edges
5. `BuildLab Changelog` - 28 edges
6. `SynthAudio` - 20 edges
7. `AdminHeader()` - 19 edges
8. `FullscreenGate()` - 19 edges
9. `useAuth()` - 17 edges
10. `useLearnMode()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `🧹 Cleaned Button Typography in `frontend/src/components/3D/PCBuilder3D.jsx`` --references--> `Compatibility()`  [INFERRED]
  CHANGELOG.md → frontend/src/components/Compatibility/Compatibility.jsx
- `[2026-10-23] - Symmetrical Dual-Sidebar Architecture & Course Outline Fix (Learn Page)` --references--> `Footer()`  [INFERRED]
  CHANGELOG.md → frontend/src/components/Footer/Footer.jsx
- `🎬 Page Transition Animations (OC)` --references--> `MotionPage()`  [INFERRED]
  CHANGELOG.md → frontend/src/utilities/pageTransitions.jsx
- `⚡ Upgrades to `frontend/src/utilities/soundManager.js`` --references--> `SynthAudio`  [INFERRED]
  CHANGELOG.md → frontend/src/utilities/soundManager.js
- `[2026-10-31] - Security Hardening & Architecture Consolidation (OpenCode Audit)` --references--> `adminAuth()`  [INFERRED]
  CHANGELOG.md → backend/server.js

## Import Cycles
- None detected.

## Communities (30 total, 9 thin omitted)

### Community 0 - "Build.jsx"
Cohesion: 0.08
Nodes (36): BOB_CASUAL_GUIDE, BOB_GENERAL_BUILD_LINES, BOB_STAGE_TIPS, BuildPage(), buildSteps, CATEGORY_FILTERS, COMPAT_BOB_PHRASES, Compatibility() (+28 more)

### Community 1 - "dependencies"
Cohesion: 0.18
Nodes (11): dependencies, html2canvas, jspdf, motion, puppeteer-core, react, react-dom, react-router-dom (+3 more)

### Community 2 - "App.jsx"
Cohesion: 0.12
Nodes (39): AdminAccounts(), AdminAddComponent(), CATEGORIES, DEFAULT_FORM_DATA, AdminAuthGuard(), AdminContent(), AdminCrawler(), CATEGORIES (+31 more)

### Community 3 - "PCBuilder3D.jsx"
Cohesion: 0.06
Nodes (53): ComponentModels3D(), DDR4StickMesh(), HeroFloatingRAM(), MotherboardDDR4Kit(), ProceduralRAMFallback(), RAMModelErrorBoundary, SingleDDR4RAM(), GenericPCCase() (+45 more)

### Community 4 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build, dev, lint, preview, start

### Community 6 - "CourseShell.jsx"
Cohesion: 0.09
Nodes (34): [2026-10-23] Fullscreen Requirement Enabled for Compatibility & Learn, 🖥️ Fullscreen Gating (`FullscreenGate.jsx`), BOB_PHRASES, BobCompanion(), FullscreenGate(), FullscreenGateContext, BOB_HELP_PHRASES, QUICK_DIAGNOSTICS (+26 more)

### Community 7 - "[2026-10-23] - Master Checklist & Safari Compatibility Updates"
Cohesion: 0.33
Nodes (6): [2026-10-23] - Master Checklist & Safari Compatibility Updates, 🧊 3D Builder & Design Aesthetic, 🛡️ Admin Panel, 🍏 Apple & Safari Compatibility, 🛠️ Build & Home Page, 📚 Learn Page

### Community 8 - "[2026-10-23 03:54] - Build Layout Stability, Dynamic Category Filters & Price Removal"
Cohesion: 0.40
Nodes (5): [2026-10-23 03:54] - Build Layout Stability, Dynamic Category Filters & Price Removal, 💰 Complete Removal of Prices Globally, 🏷️ Dynamic Context-Aware Component Filters (Replaced Static Tiers), 🧱 Layout & Container Scrolling Fixes (`scrolling.mp4`), 📊 Revamped Empty Specifications State (`BUILD OVERVIEW`)

### Community 9 - "App.jsx"
Cohesion: 0.09
Nodes (41): AdminEditRedirect(), App(), AppContent(), ScrollToTop(), PCBuilder3D(), AboutUs(), TEAM_MEMBERS, brandData (+33 more)

### Community 11 - "compatibility.test.js"
Cohesion: 0.36
Nodes (6): checkCompatibility(), getCaseFormFactorCapacity(), getMoboFormFactorRank(), getNumber(), normalizeDdr(), normalizeSocket()

### Community 14 - "BuildLab Changelog"
Cohesion: 0.12
Nodes (16): [2026-10-23 03:34] - /clean Linter & Safari Prefix Fixes, [2026-10-23] - Admin Dashboard Syntax Error Fix (Vite Parse Error Resolved), [2026-10-23] - Server Deployment (/deploy), [2026-10-23] - Symmetrical Dual-Sidebar Architecture & Course Outline Fix (Learn Page), [2026-10-25] - Audio Deduplication: `Error2.mp3` Purged & Unified to `error.mp3`, [2026-10-25] - Audio Deduplication: `UI_Denied_2.mp3` Purged & Unified to `denied.mp3`, [2026-10-25] - Git Exclusion & Local Developer Privacy, [2026-10-25] - Graphify Architecture Concept & Visualizer Guide (+8 more)

### Community 15 - "[2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC)"
Cohesion: 0.20
Nodes (10): [2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC), 🧊 3D Builder (`/3d-builder`), 🔧 3D Drawer UI Optimization (PCBuilder3D.css), 🧱 Build Page Round 2 (OC), 🧱 Build Page — Viewport-Fitted Workspace (Build.jsx / Build.css / App.jsx), 🖥️ Fullscreen Gate (New Feature), 🏠 Home & Build Consolidation, 🤖 Integrations (+2 more)

### Community 16 - "[2026-10-23 04:52] - Scrolling Elimination, Red Warning Removal & Redundancy Fix"
Cohesion: 0.50
Nodes (4): [2026-10-23 04:52] - Scrolling Elimination, Red Warning Removal & Redundancy Fix, 🚫 Complete Removal of Red Warning Highlights & Tooltips, 🖱️ Direct 1-Click Card Selection & Top Action Button (Zero Scrolling Suffering), 🧹 Redundancy Fixed: Single-Card Left Sidebar

### Community 17 - "[2026-10-23] Compatibility Checker SFX & Cute Sound Effects Update"
Cohesion: 0.50
Nodes (4): [2026-10-23] Compatibility Checker SFX & Cute Sound Effects Update, ⚡ Centralized Manager Enhancements (`soundManager.js`), 🛡️ Compatibility Checker Integration (`Compatibility.jsx`), 🔔 New & Updated Sound Effects (`frontend/public/sfx`)

### Community 18 - "frontend/package.json"
Cohesion: 0.12
Nodes (18): name, private, type, version, autoprefixer, eslint, @eslint/js, eslint-plugin-react-hooks (+10 more)

### Community 19 - "devDependencies"
Cohesion: 0.14
Nodes (14): devDependencies, autoprefixer, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, postcss (+6 more)

### Community 20 - "SynthAudio"
Cohesion: 0.15
Nodes (4): [2026-10-23] UI Interaction Sounds Restored & Centralized (`soundManager.js`), 🔊 Root Cause Identified & Resolved, ⚡ Upgrades to `frontend/src/utilities/soundManager.js`, SynthAudio

### Community 21 - "[2026-10-23] Learn Page: NotebookLLM Master Source Script for Module 1"
Cohesion: 0.67
Nodes (3): [2026-10-23] Learn Page: NotebookLLM Master Source Script for Module 1, 📚 Generated Educational Master Script (`Module_1_NotebookLLM_Source.md`), 🎙️ Pure Native Text Format Optimization for NotebookLLM

### Community 23 - "[2026-10-23] Learn Page: Video Player Overhaul + 9 Dead Videos Replaced (OC)"
Cohesion: 0.67
Nodes (3): [2026-10-23] Learn Page: Video Player Overhaul + 9 Dead Videos Replaced (OC), Fixed / Added — `components/Learn/CourseVideoPlayer.jsx` + `CourseVideoPlayer.css` (new), Replaced — 9 unavailable YouTube videos (all new IDs verified 200 via oEmbed, embeddable)

### Community 25 - "scrapedMeta.js"
Cohesion: 0.38
Nodes (6): escapeRegex(), GENERIC_TOKENS, isJunkToken(), KNOWN_BRANDS, parseProductMeta(), SPEC_TOKEN_PATTERNS

### Community 26 - "backend/package.json"
Cohesion: 0.05
Nodes (40): pool, BERMOR_CATEGORY_MAP, detectProductCategory(), EASYPC_COLLECTION_MAP, EXCLUDED_KEYWORDS, extractSpecs(), getStagingProducts(), initScrapedTable() (+32 more)

## Knowledge Gaps
- **9 isolated node(s):** `dotenv`, `nodemon`, `puppeteer-core`, `@tailwindcss/postcss`, `@types/react` (+4 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 193 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `BuildLab Changelog` connect `BuildLab Changelog` to `CourseShell.jsx`, `[2026-10-23] - Master Checklist & Safari Compatibility Updates`, `[2026-10-23 03:54] - Build Layout Stability, Dynamic Category Filters & Price Removal`, `[2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC)`, `[2026-10-23 04:52] - Scrolling Elimination, Red Warning Removal & Redundancy Fix`, `[2026-10-23] Compatibility Checker SFX & Cute Sound Effects Update`, `SynthAudio`, `[2026-10-23] Learn Page: NotebookLLM Master Source Script for Module 1`, `[2026-10-23] Learn Page: Video Player Overhaul + 9 Dead Videos Replaced (OC)`, `adminAuth`, `[2026-10-23] 3D Studio: Clean Button Design (Icons & Emojis Removed)`, `[2026-10-23] Learn: Course-Outline Sidebar REWORK REVERTED to the previous design (OC — user request)`?**
  _High betweenness centrality (0.316) - this node is a cross-community bridge._
- **What connects `dotenv`, `nodemon`, `puppeteer-core` to the rest of the system?**
  _9 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Build.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07777777777777778 - nodes in this community are weakly interconnected._
- **Why does `react` connect `App.jsx` to `Build.jsx`, `PCBuilder3D.jsx`, `CourseShell.jsx`, `App.jsx`, `frontend/package.json`, `FeatureCarousel.jsx`, `main.jsx`?**
  _High betweenness centrality (0.297) - this node is a cross-community bridge._
- **Should `App.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12341197822141561 - nodes in this community are weakly interconnected._
- **Why does `Footer()` connect `App.jsx` to `BuildLab Changelog`?**
  _High betweenness centrality (0.193) - this node is a cross-community bridge._
- **Should `PCBuilder3D.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06210526315789474 - nodes in this community are weakly interconnected._