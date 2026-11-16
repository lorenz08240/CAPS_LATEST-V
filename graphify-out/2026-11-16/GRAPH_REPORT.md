# Graph Report - CAPS_LATEST-V  (2026-11-16)

## Corpus Check
- 91 files · ~133,917 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 46 file(s) not represented in the graph (top: .css 33, (none) 5, .glb 3)

## Summary
- 593 nodes · 1483 edges · 32 communities (28 shown, 4 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 16 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `bbc8510d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- EyeTracker.tsx
- server.js
- App.jsx
- PCBuilder3D.jsx
- crawler.js
- frontend/package.json
- PCBuilder3D.jsx
- [2026-10-23] - Master Checklist & Safari Compatibility Updates
- db.js
- App.jsx
- SynthAudio
- compatibility.test.js
- BuildLab Changelog
- [2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC)
- [2026-10-23 03:54] - Build Layout Stability, Dynamic Category Filters & Price Removal
- dependencies
- devDependencies
- curriculumTypes.d.ts
- CourseVideoPlayer.jsx
- scripts
- vite
- [2026-10-23 04:52] - Scrolling Elimination, Red Warning Removal & Redundancy Fix
- scripts
- [2026-10-23] Compatibility Checker SFX & Cute Sound Effects Update
- backend/package.json
- [2026-10-23] Learn Page: NotebookLLM Master Source Script for Module 1
- [2026-10-23] Learn Page: Video Player Overhaul + 9 Dead Videos Replaced (OC)
- FeatureCarousel.jsx
- [2026-10-23] Learn: Course-Outline Sidebar REWORK REVERTED to the previous design (OC — user request)
- CourseShell.jsx

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
- `🎬 Page Transition Animations (OC)` --references--> `MotionPage()`  [INFERRED]
  CHANGELOG.md → frontend/src/utilities/pageTransitions.jsx
- `⚡ Upgrades to `frontend/src/utilities/soundManager.js`` --references--> `SynthAudio`  [INFERRED]
  CHANGELOG.md → frontend/src/utilities/soundManager.js
- `[2026-10-31] - Security Hardening & Architecture Consolidation (OpenCode Audit)` --references--> `adminAuth()`  [INFERRED]
  CHANGELOG.md → backend/server.js

## Import Cycles
- None detected.

## Communities (32 total, 4 thin omitted)

### Community 0 - "EyeTracker.tsx"
Cohesion: 0.13
Nodes (19): BOB_PHRASES, BobCompanion(), clamp(), Eye, EyeTracker(), LINES, measure(), outline() (+11 more)

### Community 1 - "server.js"
Cohesion: 0.11
Nodes (10): adminAuth(), app, cors, distPath, { exec }, express, fs, path (+2 more)

### Community 2 - "App.jsx"
Cohesion: 0.10
Nodes (43): AdminAccounts(), AdminAddComponent(), CATEGORIES, DEFAULT_FORM_DATA, AdminAuthGuard(), AdminContent(), AdminCrawler(), CATEGORIES (+35 more)

### Community 3 - "PCBuilder3D.jsx"
Cohesion: 0.06
Nodes (60): ComponentModels3D(), DDR4StickMesh(), HeroFloatingRAM(), MotherboardDDR4Kit(), ProceduralRAMFallback(), RAMModelErrorBoundary, SingleDDR4RAM(), GenericPCCase() (+52 more)

### Community 4 - "crawler.js"
Cohesion: 0.28
Nodes (12): axios, BERMOR_CATEGORY_MAP, detectProductCategory(), EASYPC_COLLECTION_MAP, EXCLUDED_KEYWORDS, extractSpecs(), getStagingProducts(), initScrapedTable() (+4 more)

### Community 5 - "frontend/package.json"
Cohesion: 0.15
Nodes (17): devDependencies, autoprefixer@^10.5.0, postcss@^8.5.10, tailwindcss@^4.2.2, @tailwindcss/postcss@^4.2.2, @types/react@^19.2.14, @types/react-dom@^19.2.3, name (+9 more)

### Community 6 - "PCBuilder3D.jsx"
Cohesion: 0.08
Nodes (40): [2026-10-23] 3D Studio: Clean Button Design (Icons & Emojis Removed), 🧹 Cleaned Button Typography in `frontend/src/components/3D/PCBuilder3D.jsx`, BOB_CASUAL_GUIDE, BOB_GENERAL_BUILD_LINES, BOB_STAGE_TIPS, BuildPage(), CATEGORY_FILTERS, getCaseDimensions() (+32 more)

### Community 7 - "[2026-10-23] - Master Checklist & Safari Compatibility Updates"
Cohesion: 0.33
Nodes (6): [2026-10-23] - Master Checklist & Safari Compatibility Updates, 🧊 3D Builder & Design Aesthetic, 🛡️ Admin Panel, 🍏 Apple & Safari Compatibility, 🛠️ Build & Home Page, 📚 Learn Page

### Community 8 - "db.js"
Cohesion: 0.40
Nodes (4): mysql, pool, mysql2@^3.22.1, mysql2

### Community 9 - "App.jsx"
Cohesion: 0.08
Nodes (56): AdminEditRedirect(), App(), AppContent(), ScrollToTop(), AboutUs(), TEAM_MEMBERS, WHITEHATS_PROJECTS, AdminLogin() (+48 more)

### Community 10 - "SynthAudio"
Cohesion: 0.07
Nodes (6): [2026-10-23] UI Interaction Sounds Restored & Centralized (`soundManager.js`), 🔊 Root Cause Identified & Resolved, ⚡ Upgrades to `frontend/src/utilities/soundManager.js`, 🎮 Wired Semantic Audio Events Across Workspaces, SoundManager, SynthAudio

### Community 11 - "compatibility.test.js"
Cohesion: 0.27
Nodes (8): assert, checkCompatibility(), getCaseFormFactorCapacity(), getMoboFormFactorRank(), getNumber(), normalizeDdr(), normalizeSocket(), { test }

### Community 14 - "BuildLab Changelog"
Cohesion: 0.11
Nodes (17): [2026-10-23 03:34] - /clean Linter & Safari Prefix Fixes, [2026-10-23] - Admin Dashboard Syntax Error Fix (Vite Parse Error Resolved), [2026-10-23] Fullscreen Requirement Enabled for Compatibility & Learn, [2026-10-23] - Server Deployment (/deploy), [2026-10-23] - Symmetrical Dual-Sidebar Architecture & Course Outline Fix (Learn Page), [2026-10-25] - Audio Deduplication: `Error2.mp3` Purged & Unified to `error.mp3`, [2026-10-25] - Audio Deduplication: `UI_Denied_2.mp3` Purged & Unified to `denied.mp3`, [2026-10-25] - Git Exclusion & Local Developer Privacy (+9 more)

### Community 15 - "[2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC)"
Cohesion: 0.20
Nodes (10): [2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC), 🧊 3D Builder (`/3d-builder`), 🔧 3D Drawer UI Optimization (PCBuilder3D.css), 🧱 Build Page Round 2 (OC), 🧱 Build Page — Viewport-Fitted Workspace (Build.jsx / Build.css / App.jsx), 🖥️ Fullscreen Gate (New Feature), 🏠 Home & Build Consolidation, 🤖 Integrations (+2 more)

### Community 16 - "[2026-10-23 03:54] - Build Layout Stability, Dynamic Category Filters & Price Removal"
Cohesion: 0.40
Nodes (5): [2026-10-23 03:54] - Build Layout Stability, Dynamic Category Filters & Price Removal, 💰 Complete Removal of Prices Globally, 🏷️ Dynamic Context-Aware Component Filters (Replaced Static Tiers), 🧱 Layout & Container Scrolling Fixes (`scrolling.mp4`), 📊 Revamped Empty Specifications State (`BUILD OVERVIEW`)

### Community 17 - "dependencies"
Cohesion: 0.13
Nodes (15): dependencies, gsap@^3.15.1, html2canvas@^1.4.1, jspdf@^4.2.1, motion@^14.6.0, puppeteer-core@^25.16.0, react@^19.2.4, react-router-dom@^7.14.1 (+7 more)

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

### Community 28 - "[2026-10-23] Learn Page: Video Player Overhaul + 9 Dead Videos Replaced (OC)"
Cohesion: 0.67
Nodes (3): [2026-10-23] Learn Page: Video Player Overhaul + 9 Dead Videos Replaced (OC), Fixed / Added — `components/Learn/CourseVideoPlayer.jsx` + `CourseVideoPlayer.css` (new), Replaced — 9 unavailable YouTube videos (all new IDs verified 200 via oEmbed, embeddable)

### Community 31 - "CourseShell.jsx"
Cohesion: 0.14
Nodes (26): 🖥️ Fullscreen Gating (`FullscreenGate.jsx`), FullscreenGate(), FullscreenGateContext, ARTICLE_HOTSPOTS, CourseShell(), readProgress(), TOUR_STEPS, CSS_CURRICULUM (+18 more)

## Knowledge Gaps
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `BuildLab Changelog` connect `BuildLab Changelog` to `server.js`, `PCBuilder3D.jsx`, `[2026-10-23] - Master Checklist & Safari Compatibility Updates`, `SynthAudio`, `[2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC)`, `[2026-10-23 03:54] - Build Layout Stability, Dynamic Category Filters & Price Removal`, `[2026-10-23 04:52] - Scrolling Elimination, Red Warning Removal & Redundancy Fix`, `[2026-10-23] Compatibility Checker SFX & Cute Sound Effects Update`, `[2026-10-23] Learn Page: NotebookLLM Master Source Script for Module 1`, `[2026-10-23] Learn Page: Video Player Overhaul + 9 Dead Videos Replaced (OC)`, `[2026-10-23] Learn: Course-Outline Sidebar REWORK REVERTED to the previous design (OC — user request)`?**
  _High betweenness centrality (0.298) - this node is a cross-community bridge._
- **Should `EyeTracker.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12648221343873517 - nodes in this community are weakly interconnected._
- **Why does `react` connect `App.jsx` to `EyeTracker.tsx`, `App.jsx`, `PCBuilder3D.jsx`, `frontend/package.json`, `PCBuilder3D.jsx`, `dependencies`, `CourseVideoPlayer.jsx`, `FeatureCarousel.jsx`, `CourseShell.jsx`?**
  _High betweenness centrality (0.235) - this node is a cross-community bridge._
- **Should `server.js` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._
- **Why does `Footer()` connect `App.jsx` to `BuildLab Changelog`?**
  _High betweenness centrality (0.193) - this node is a cross-community bridge._
- **Should `App.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10153358011634056 - nodes in this community are weakly interconnected._
- **Should `PCBuilder3D.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.060534822215692036 - nodes in this community are weakly interconnected._