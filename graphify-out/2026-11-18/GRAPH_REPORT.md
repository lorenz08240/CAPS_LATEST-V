# Graph Report - CAPS_LATEST-V  (2026-11-18)

## Corpus Check
- 96 files · ~735,728 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 51 file(s) not represented in the graph (top: .css 36, (none) 5, .glb 3)

## Summary
- 603 nodes · 1527 edges · 35 communities (27 shown, 8 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7abd88ad`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- devDependencies
- server.js
- App.jsx
- PCBuilder3D.jsx
- crawler.js
- EyeTracker.tsx
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
- SynthAudio
- dependencies
- [2026-10-23] Learn: Course-Outline Sidebar REWORK REVERTED to the previous design (OC — user request)
- FeatureCarousel.jsx
- adminAuth

## God Nodes (most connected - your core abstractions)
1. `react` - 70 edges
2. `soundManager` - 66 edges
3. `react-router-dom` - 37 edges
4. `BuildLab Changelog` - 32 edges
5. `AppContent()` - 31 edges
6. `useLearnMode()` - 27 edges
7. `FullscreenGate()` - 22 edges
8. `SynthAudio` - 22 edges
9. `AdminHeader()` - 19 edges
10. `AccountSetupModal()` - 19 edges

## Surprising Connections (you probably didn't know these)
- `[2026-10-23] - Symmetrical Dual-Sidebar Architecture & Course Outline Fix (Learn Page)` --references--> `Footer()`  [INFERRED]
  CHANGELOG.md → frontend/src/components/Footer/Footer.jsx
- `[2026-11-18] - Fullscreen Auto-Engage on Sign-In` --references--> `FullscreenGate()`  [INFERRED]
  CHANGELOG.md → frontend/src/components/FullscreenGate/FullscreenGate.jsx
- `🧹 Cleaned Button Typography in `frontend/src/components/3D/PCBuilder3D.jsx`` --references--> `Compatibility()`  [INFERRED]
  CHANGELOG.md → frontend/src/components/Compatibility/Compatibility.jsx
- `⚡ Upgrades to `frontend/src/utilities/soundManager.js`` --references--> `SynthAudio`  [INFERRED]
  CHANGELOG.md → frontend/src/utilities/soundManager.js
- `[2026-10-31] - Security Hardening & Architecture Consolidation (OpenCode Audit)` --references--> `adminAuth()`  [INFERRED]
  CHANGELOG.md → backend/server.js

## Import Cycles
- None detected.

## Communities (35 total, 8 thin omitted)

### Community 0 - "devDependencies"
Cohesion: 0.14
Nodes (14): devDependencies, autoprefixer, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, postcss (+6 more)

### Community 1 - "server.js"
Cohesion: 0.15
Nodes (5): app, distPath, uploadsDir, cors, express

### Community 2 - "App.jsx"
Cohesion: 0.10
Nodes (42): AdminAccounts(), AdminAddComponent(), CATEGORIES, DEFAULT_FORM_DATA, AdminAuthGuard(), AdminContent(), AdminCrawler(), CATEGORIES (+34 more)

### Community 3 - "PCBuilder3D.jsx"
Cohesion: 0.06
Nodes (65): ComponentModels3D(), DDR4StickMesh(), HeroFloatingRAM(), MotherboardDDR4Kit(), ProceduralRAMFallback(), RAMModelErrorBoundary, SingleDDR4RAM(), GenericPCCase() (+57 more)

### Community 4 - "crawler.js"
Cohesion: 0.32
Nodes (11): BERMOR_CATEGORY_MAP, detectProductCategory(), EASYPC_COLLECTION_MAP, EXCLUDED_KEYWORDS, extractSpecs(), getStagingProducts(), initScrapedTable(), processAndSaveProducts() (+3 more)

### Community 5 - "EyeTracker.tsx"
Cohesion: 0.13
Nodes (19): BOB_PHRASES, BobCompanion(), clamp(), Eye, EyeTracker(), LINES, measure(), outline() (+11 more)

### Community 6 - "Compatibility.jsx"
Cohesion: 0.07
Nodes (43): [2026-10-23] 3D Studio: Clean Button Design (Icons & Emojis Removed), 🧹 Cleaned Button Typography in `frontend/src/components/3D/PCBuilder3D.jsx`, BOB_CASUAL_GUIDE, BOB_GENERAL_BUILD_LINES, BOB_STAGE_TIPS, Build(), BuildPage(), CATEGORY_FILTERS (+35 more)

### Community 7 - "frontend/package.json"
Cohesion: 0.13
Nodes (17): name, private, type, version, autoprefixer, eslint, @eslint/js, eslint-plugin-react-hooks (+9 more)

### Community 9 - "[2026-10-23] - Master Checklist & Safari Compatibility Updates"
Cohesion: 0.33
Nodes (6): [2026-10-23] - Master Checklist & Safari Compatibility Updates, 🧊 3D Builder & Design Aesthetic, 🛡️ Admin Panel, 🍏 Apple & Safari Compatibility, 🛠️ Build & Home Page, 📚 Learn Page

### Community 11 - "compatibility.test.js"
Cohesion: 0.36
Nodes (6): checkCompatibility(), getCaseFormFactorCapacity(), getMoboFormFactorRank(), getNumber(), normalizeDdr(), normalizeSocket()

### Community 14 - "BuildLab Changelog"
Cohesion: 0.10
Nodes (20): [2026-10-23 03:34] - /clean Linter & Safari Prefix Fixes, [2026-10-23] - Admin Dashboard Syntax Error Fix (Vite Parse Error Resolved), [2026-10-23] - Server Deployment (/deploy), [2026-10-23] - Symmetrical Dual-Sidebar Architecture & Course Outline Fix (Learn Page), [2026-10-25] - Audio Deduplication: `Error2.mp3` Purged & Unified to `error.mp3`, [2026-10-25] - Audio Deduplication: `UI_Denied_2.mp3` Purged & Unified to `denied.mp3`, [2026-10-25] - Git Exclusion & Local Developer Privacy, [2026-10-25] - Graphify Architecture Concept & Visualizer Guide (+12 more)

### Community 15 - "[2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC)"
Cohesion: 0.13
Nodes (14): [2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC), 🧊 3D Builder (`/3d-builder`), 🔧 3D Drawer UI Optimization (PCBuilder3D.css), 🧱 Build Page Round 2 (OC), 🧱 Build Page — Viewport-Fitted Workspace (Build.jsx / Build.css / App.jsx), 🖥️ Fullscreen Gate (New Feature), 🏠 Home & Build Consolidation, 🤖 Integrations (+6 more)

### Community 16 - "App.jsx"
Cohesion: 0.09
Nodes (55): AdminEditRedirect(), App(), AppContent(), ScrollToTop(), AboutUs(), TEAM_MEMBERS, WHITEHATS_PROJECTS, AdminLogin() (+47 more)

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
Cohesion: 0.43
Nodes (5): CourseVideoPlayer(), fmtTime(), loadYouTubeApi(), VideoOverlayModal(), react-dom

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

### Community 28 - "AppContent"
Cohesion: 0.12
Nodes (30): [2026-10-23] Fullscreen Requirement Enabled for Compatibility & Learn, 🖥️ Fullscreen Gating (`FullscreenGate.jsx`), FullscreenGate(), FullscreenGateContext, CourseBriefingOverlay(), LEARNING_PATH, OUTCOMES, ARTICLE_HOTSPOTS (+22 more)

### Community 29 - "[2026-10-23] Learn Page: Video Player Overhaul + 9 Dead Videos Replaced (OC)"
Cohesion: 0.67
Nodes (3): [2026-10-23] Learn Page: Video Player Overhaul + 9 Dead Videos Replaced (OC), Fixed / Added — `components/Learn/CourseVideoPlayer.jsx` + `CourseVideoPlayer.css` (new), Replaced — 9 unavailable YouTube videos (all new IDs verified 200 via oEmbed, embeddable)

### Community 30 - "SynthAudio"
Cohesion: 0.14
Nodes (4): [2026-10-23] UI Interaction Sounds Restored & Centralized (`soundManager.js`), 🔊 Root Cause Identified & Resolved, ⚡ Upgrades to `frontend/src/utilities/soundManager.js`, SynthAudio

### Community 31 - "dependencies"
Cohesion: 0.33
Nodes (6): dependencies, axios, cors, dotenv, express, mysql2

## Knowledge Gaps
- **9 isolated node(s):** `dotenv`, `nodemon`, `puppeteer-core`, `@tailwindcss/postcss`, `@types/react` (+4 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 230 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `BuildLab Changelog` connect `BuildLab Changelog` to `[2026-10-23] Learn: Course-Outline Sidebar REWORK REVERTED to the previous design (OC — user request)`, `adminAuth`, `Compatibility.jsx`, `[2026-10-23] - Master Checklist & Safari Compatibility Updates`, `[2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC)`, `[2026-10-23 03:54] - Build Layout Stability, Dynamic Category Filters & Price Removal`, `[2026-10-23 04:52] - Scrolling Elimination, Red Warning Removal & Redundancy Fix`, `[2026-10-23] Compatibility Checker SFX & Cute Sound Effects Update`, `[2026-10-23] Learn Page: NotebookLLM Master Source Script for Module 1`, `AppContent`, `[2026-10-23] Learn Page: Video Player Overhaul + 9 Dead Videos Replaced (OC)`, `SynthAudio`?**
  _High betweenness centrality (0.289) - this node is a cross-community bridge._
- **What connects `dotenv`, `nodemon`, `puppeteer-core` to the rest of the system?**
  _9 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Why does `react` connect `App.jsx` to `FeatureCarousel.jsx`, `App.jsx`, `PCBuilder3D.jsx`, `EyeTracker.tsx`, `Compatibility.jsx`, `frontend/package.json`, `[2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC)`, `CourseVideoPlayer.jsx`, `AppContent`?**
  _High betweenness centrality (0.243) - this node is a cross-community bridge._
- **Should `App.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09836065573770492 - nodes in this community are weakly interconnected._
- **Why does `FullscreenGate()` connect `AppContent` to `App.jsx`, `PCBuilder3D.jsx`, `BuildLab Changelog`, `Compatibility.jsx`?**
  _High betweenness centrality (0.177) - this node is a cross-community bridge._
- **Should `PCBuilder3D.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05892634207240949 - nodes in this community are weakly interconnected._