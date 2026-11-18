# Graph Report - CAPS_LATEST-V  (2026-11-19)

## Corpus Check
- 102 files · ~165,552 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 53 file(s) not represented in the graph (top: .css 38, (none) 5, .glb 3)

## Summary
- 621 nodes · 1543 edges · 38 communities (31 shown, 7 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4e2d959a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- devDependencies
- server.js
- App.jsx
- PCBuilder3D.jsx
- crawler.js
- CourseShell.jsx
- PCBuilder3D.jsx
- frontend/package.json
- db.js
- [2026-10-23] - Master Checklist & Safari Compatibility Updates
- SynthAudio
- compatibility.test.js
- BuildLab Changelog
- [2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC)
- soundManager.js
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
- SynthAudio
- [2026-10-23] Learn Page: Video Player Overhaul + 9 Dead Videos Replaced (OC)
- dependencies
- [2026-10-23] 3D Studio: Clean Button Design (Icons & Emojis Removed)
- [2026-10-23] Learn: Course-Outline Sidebar REWORK REVERTED to the previous design (OC — user request)
- EyeTracker.tsx
- Compatibility.jsx
- Build.jsx
- compatibilityEngine.js
- CompareRigs.jsx

## God Nodes (most connected - your core abstractions)
1. `react` - 75 edges
2. `soundManager` - 56 edges
3. `react-router-dom` - 37 edges
4. `BuildLab Changelog` - 32 edges
5. `AppContent()` - 31 edges
6. `useLearnMode()` - 29 edges
7. `SynthAudio` - 22 edges
8. `FullscreenGate()` - 20 edges
9. `AdminHeader()` - 19 edges
10. `useAuth()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `🧹 Cleaned Button Typography in `frontend/src/components/3D/PCBuilder3D.jsx`` --references--> `Compatibility()`  [INFERRED]
  CHANGELOG.md → frontend/src/components/Compatibility/Compatibility.jsx
- `[2026-10-23] - Symmetrical Dual-Sidebar Architecture & Course Outline Fix (Learn Page)` --references--> `Footer()`  [INFERRED]
  CHANGELOG.md → frontend/src/components/Footer/Footer.jsx
- `[2026-11-18] - Fullscreen Auto-Engage on Sign-In` --references--> `FullscreenGate()`  [INFERRED]
  CHANGELOG.md → frontend/src/components/FullscreenGate/FullscreenGate.jsx
- `⚡ Upgrades to `frontend/src/utilities/soundManager.js`` --references--> `SynthAudio`  [INFERRED]
  CHANGELOG.md → frontend/src/utilities/soundManager.js
- `🎬 Page Transition Animations (OC)` --references--> `MotionPage()`  [INFERRED]
  CHANGELOG.md → frontend/src/utilities/pageTransitions.jsx

## Import Cycles
- None detected.

## Communities (38 total, 7 thin omitted)

### Community 0 - "devDependencies"
Cohesion: 0.14
Nodes (14): devDependencies, autoprefixer, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, postcss (+6 more)

### Community 1 - "server.js"
Cohesion: 0.13
Nodes (7): adminAuth(), app, distPath, uploadsDir, [2026-10-31] - Security Hardening & Architecture Consolidation (OpenCode Audit), cors, express

### Community 2 - "App.jsx"
Cohesion: 0.09
Nodes (45): AdminAccounts(), AdminAddComponent(), CATEGORIES, DEFAULT_FORM_DATA, AdminAuthGuard(), AdminContent(), AdminCrawler(), CATEGORIES (+37 more)

### Community 3 - "PCBuilder3D.jsx"
Cohesion: 0.07
Nodes (52): ComponentModels3D(), DDR4StickMesh(), HeroFloatingRAM(), MotherboardDDR4Kit(), ProceduralRAMFallback(), RAMModelErrorBoundary, SingleDDR4RAM(), DeepCoolLE240Cooler() (+44 more)

### Community 4 - "crawler.js"
Cohesion: 0.32
Nodes (11): BERMOR_CATEGORY_MAP, detectProductCategory(), EASYPC_COLLECTION_MAP, EXCLUDED_KEYWORDS, extractSpecs(), getStagingProducts(), initScrapedTable(), processAndSaveProducts() (+3 more)

### Community 5 - "CourseShell.jsx"
Cohesion: 0.14
Nodes (18): CourseBriefingOverlay(), LEARNING_PATH, OUTCOMES, ARTICLE_HOTSPOTS, readProgress(), TOUR_STEPS, CSS_CURRICULUM, FLAT_TOPICS (+10 more)

### Community 6 - "PCBuilder3D.jsx"
Cohesion: 0.18
Nodes (13): GenericPCCase(), BOB_3D_CASUAL_LINES, BOB_MOUNT_FOCUS_LINES, CAMERA_PRESETS_TOWER, CAMERA_PRESETS_WORKBENCH, CameraController(), DropIndicator(), GENERIC_CSS_COMPONENTS (+5 more)

### Community 7 - "frontend/package.json"
Cohesion: 0.12
Nodes (18): name, private, type, version, autoprefixer, eslint, @eslint/js, eslint-plugin-react-hooks (+10 more)

### Community 9 - "[2026-10-23] - Master Checklist & Safari Compatibility Updates"
Cohesion: 0.33
Nodes (6): [2026-10-23] - Master Checklist & Safari Compatibility Updates, 🧊 3D Builder & Design Aesthetic, 🛡️ Admin Panel, 🍏 Apple & Safari Compatibility, 🛠️ Build & Home Page, 📚 Learn Page

### Community 11 - "compatibility.test.js"
Cohesion: 0.36
Nodes (6): checkCompatibility(), getCaseFormFactorCapacity(), getMoboFormFactorRank(), getNumber(), normalizeDdr(), normalizeSocket()

### Community 14 - "BuildLab Changelog"
Cohesion: 0.09
Nodes (21): [2026-10-23 03:34] - /clean Linter & Safari Prefix Fixes, [2026-10-23] - Admin Dashboard Syntax Error Fix (Vite Parse Error Resolved), [2026-10-23] Fullscreen Requirement Enabled for Compatibility & Learn, [2026-10-23] - Server Deployment (/deploy), [2026-10-23] - Symmetrical Dual-Sidebar Architecture & Course Outline Fix (Learn Page), [2026-10-25] - Audio Deduplication: `Error2.mp3` Purged & Unified to `error.mp3`, [2026-10-25] - Audio Deduplication: `UI_Denied_2.mp3` Purged & Unified to `denied.mp3`, [2026-10-25] - Git Exclusion & Local Developer Privacy (+13 more)

### Community 15 - "[2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC)"
Cohesion: 0.20
Nodes (10): [2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC), 🧊 3D Builder (`/3d-builder`), 🔧 3D Drawer UI Optimization (PCBuilder3D.css), 🧱 Build Page Round 2 (OC), 🧱 Build Page — Viewport-Fitted Workspace (Build.jsx / Build.css / App.jsx), 🖥️ Fullscreen Gate (New Feature), 🏠 Home & Build Consolidation, 🤖 Integrations (+2 more)

### Community 16 - "soundManager.js"
Cohesion: 0.05
Nodes (87): 🖥️ Fullscreen Gating (`FullscreenGate.jsx`), AdminEditRedirect(), App(), AppContent(), ScrollToTop(), PCBuilder3D(), AboutUs(), TEAM_MEMBERS (+79 more)

### Community 17 - "dependencies"
Cohesion: 0.17
Nodes (12): dependencies, gsap, html2canvas, jspdf, motion, puppeteer-core, react, react-dom (+4 more)

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
Cohesion: 0.15
Nodes (12): author, description, devDependencies, nodemon, keywords, license, main, name (+4 more)

### Community 27 - "[2026-10-23] Learn Page: NotebookLLM Master Source Script for Module 1"
Cohesion: 0.67
Nodes (3): [2026-10-23] Learn Page: NotebookLLM Master Source Script for Module 1, 📚 Generated Educational Master Script (`Module_1_NotebookLLM_Source.md`), 🎙️ Pure Native Text Format Optimization for NotebookLLM

### Community 28 - "SynthAudio"
Cohesion: 0.14
Nodes (4): [2026-10-23] UI Interaction Sounds Restored & Centralized (`soundManager.js`), 🔊 Root Cause Identified & Resolved, ⚡ Upgrades to `frontend/src/utilities/soundManager.js`, SynthAudio

### Community 29 - "[2026-10-23] Learn Page: Video Player Overhaul + 9 Dead Videos Replaced (OC)"
Cohesion: 0.67
Nodes (3): [2026-10-23] Learn Page: Video Player Overhaul + 9 Dead Videos Replaced (OC), Fixed / Added — `components/Learn/CourseVideoPlayer.jsx` + `CourseVideoPlayer.css` (new), Replaced — 9 unavailable YouTube videos (all new IDs verified 200 via oEmbed, embeddable)

### Community 30 - "dependencies"
Cohesion: 0.33
Nodes (6): dependencies, axios, cors, dotenv, express, mysql2

### Community 33 - "EyeTracker.tsx"
Cohesion: 0.18
Nodes (13): BOB_PHRASES, clamp(), Eye, EyeTracker(), LINES, measure(), outline(), radii (+5 more)

### Community 35 - "Compatibility.jsx"
Cohesion: 0.19
Nodes (10): COMPAT_BOB_PHRASES, CompatibilityView(), COMPONENT_CATEGORIES, ConcentricRings(), DualOverlaidRadar(), getSmartSuggestion(), PRESET_BUDGET_RIG, PRESET_ENTHUSIAST_RIG (+2 more)

### Community 37 - "Build.jsx"
Cohesion: 0.28
Nodes (8): BOB_CASUAL_GUIDE, BOB_GENERAL_BUILD_LINES, BOB_STAGE_TIPS, BuildPage(), buildSteps, CATEGORY_FILTERS, getCaseDimensions(), getCaseMaxGPU()

### Community 38 - "compatibilityEngine.js"
Cohesion: 0.42
Nodes (8): calculateRequiredWattage(), checkCompatibility(), findAlternatives(), getCaseFormFactorCapacity(), getMoboFormFactorRank(), getNumber(), normalizeDdr(), normalizeSocket()

### Community 39 - "CompareRigs.jsx"
Cohesion: 0.20
Nodes (13): CompareRigs(), CompareRigsView(), COMPONENT_CATEGORIES, PRESET_BUDGET_RIG, PRESET_ENTHUSIAST_RIG, BuildContext, useBuild(), getCompatibilitySummary() (+5 more)

## Knowledge Gaps
- **9 isolated node(s):** `dotenv`, `nodemon`, `autoprefixer`, `postcss`, `puppeteer-core` (+4 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 233 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `BuildLab Changelog` connect `BuildLab Changelog` to `[2026-10-23] Learn: Course-Outline Sidebar REWORK REVERTED to the previous design (OC — user request)`, `server.js`, `[2026-10-23] - Master Checklist & Safari Compatibility Updates`, `[2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC)`, `[2026-10-23 03:54] - Build Layout Stability, Dynamic Category Filters & Price Removal`, `[2026-10-23 04:52] - Scrolling Elimination, Red Warning Removal & Redundancy Fix`, `[2026-10-23] Compatibility Checker SFX & Cute Sound Effects Update`, `[2026-10-23] Learn Page: NotebookLLM Master Source Script for Module 1`, `SynthAudio`, `[2026-10-23] Learn Page: Video Player Overhaul + 9 Dead Videos Replaced (OC)`, `[2026-10-23] 3D Studio: Clean Button Design (Icons & Emojis Removed)`?**
  _High betweenness centrality (0.281) - this node is a cross-community bridge._
- **What connects `dotenv`, `nodemon`, `autoprefixer` to the rest of the system?**
  _9 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Why does `react` connect `soundManager.js` to `EyeTracker.tsx`, `App.jsx`, `PCBuilder3D.jsx`, `Compatibility.jsx`, `Build.jsx`, `PCBuilder3D.jsx`, `frontend/package.json`, `CompareRigs.jsx`, `CourseShell.jsx`, `CourseVideoPlayer.jsx`?**
  _High betweenness centrality (0.261) - this node is a cross-community bridge._
- **Should `server.js` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._
- **Why does `FullscreenGate()` connect `soundManager.js` to `CompareRigs.jsx`, `BuildLab Changelog`, `PCBuilder3D.jsx`?**
  _High betweenness centrality (0.172) - this node is a cross-community bridge._
- **Should `App.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09463869463869463 - nodes in this community are weakly interconnected._