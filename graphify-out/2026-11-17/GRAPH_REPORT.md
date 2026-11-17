# Graph Report - CAPS_LATEST-V  (2026-11-17)

## Corpus Check
- 95 files · ~144,753 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 50 file(s) not represented in the graph (top: .css 36, (none) 5, .glb 3)

## Summary
- 616 nodes · 1490 edges · 20 communities (18 shown, 2 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 16 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `74af5b41`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- CourseShell.jsx
- server.js
- App.jsx
- PCBuilder3D.jsx
- crawler.js
- Compatibility.jsx
- db.js
- SynthAudio
- compatibility.test.js
- BuildLab Changelog
- [2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC)
- App.jsx
- frontend/package.json
- curriculumTypes.d.ts
- CourseVideoPlayer.jsx
- scripts
- backend/package.json
- AppContent

## God Nodes (most connected - your core abstractions)
1. `react` - 70 edges
2. `react-router-dom` - 38 edges
3. `SoundManager` - 32 edges
4. `BuildLab Changelog` - 28 edges
5. `useLearnMode()` - 27 edges
6. `AppContent()` - 25 edges
7. `SynthAudio` - 22 edges
8. `AdminHeader()` - 19 edges
9. `FullscreenGate()` - 19 edges
10. `soundManager` - 18 edges

## Surprising Connections (you probably didn't know these)
- `🧹 Cleaned Button Typography in `frontend/src/components/3D/PCBuilder3D.jsx`` --references--> `Compatibility()`  [INFERRED]
  CHANGELOG.md → frontend/src/components/Compatibility/Compatibility.jsx
- `🖥️ Fullscreen Gating (`FullscreenGate.jsx`)` --references--> `CourseShell()`  [INFERRED]
  CHANGELOG.md → frontend/src/components/Learn/CourseShell.jsx
- `⚡ Upgrades to `frontend/src/utilities/soundManager.js`` --references--> `SynthAudio`  [INFERRED]
  CHANGELOG.md → frontend/src/utilities/soundManager.js
- `[2026-10-23] - Symmetrical Dual-Sidebar Architecture & Course Outline Fix (Learn Page)` --references--> `Footer()`  [INFERRED]
  CHANGELOG.md → frontend/src/components/Footer/Footer.jsx
- `🖥️ Fullscreen Gating (`FullscreenGate.jsx`)` --references--> `FullscreenGate()`  [INFERRED]
  CHANGELOG.md → frontend/src/components/FullscreenGate/FullscreenGate.jsx

## Import Cycles
- None detected.

## Communities (20 total, 2 thin omitted)

### Community 0 - "CourseShell.jsx"
Cohesion: 0.13
Nodes (19): BOB_PHRASES, BobCompanion(), clamp(), Eye, EyeTracker(), LINES, measure(), outline() (+11 more)

### Community 1 - "server.js"
Cohesion: 0.11
Nodes (10): adminAuth(), app, cors, distPath, { exec }, express, fs, path (+2 more)

### Community 2 - "App.jsx"
Cohesion: 0.09
Nodes (47): AdminAccounts(), AdminAddComponent(), CATEGORIES, DEFAULT_FORM_DATA, AdminAuthGuard(), AdminContent(), AdminCrawler(), CATEGORIES (+39 more)

### Community 3 - "PCBuilder3D.jsx"
Cohesion: 0.06
Nodes (64): ComponentModels3D(), DDR4StickMesh(), HeroFloatingRAM(), MotherboardDDR4Kit(), ProceduralRAMFallback(), RAMModelErrorBoundary, SingleDDR4RAM(), GenericPCCase() (+56 more)

### Community 4 - "crawler.js"
Cohesion: 0.28
Nodes (12): axios, BERMOR_CATEGORY_MAP, detectProductCategory(), EASYPC_COLLECTION_MAP, EXCLUDED_KEYWORDS, extractSpecs(), getStagingProducts(), initScrapedTable() (+4 more)

### Community 6 - "Compatibility.jsx"
Cohesion: 0.08
Nodes (41): BOB_CASUAL_GUIDE, BOB_GENERAL_BUILD_LINES, BOB_STAGE_TIPS, Build(), BuildPage(), CATEGORY_FILTERS, getCaseDimensions(), getCaseMaxGPU() (+33 more)

### Community 8 - "db.js"
Cohesion: 0.40
Nodes (4): mysql, pool, mysql2@^3.22.1, mysql2

### Community 10 - "SynthAudio"
Cohesion: 0.07
Nodes (6): [2026-10-23] UI Interaction Sounds Restored & Centralized (`soundManager.js`), 🔊 Root Cause Identified & Resolved, ⚡ Upgrades to `frontend/src/utilities/soundManager.js`, 🎮 Wired Semantic Audio Events Across Workspaces, SoundManager, SynthAudio

### Community 11 - "compatibility.test.js"
Cohesion: 0.27
Nodes (8): assert, checkCompatibility(), getCaseFormFactorCapacity(), getMoboFormFactorRank(), getNumber(), normalizeDdr(), normalizeSocket(), { test }

### Community 14 - "BuildLab Changelog"
Cohesion: 0.04
Nodes (47): [2026-10-23 03:34] - /clean Linter & Safari Prefix Fixes, [2026-10-23 03:54] - Build Layout Stability, Dynamic Category Filters & Price Removal, [2026-10-23 04:52] - Scrolling Elimination, Red Warning Removal & Redundancy Fix, [2026-10-23] 3D Studio: Clean Button Design (Icons & Emojis Removed), [2026-10-23] - Admin Dashboard Syntax Error Fix (Vite Parse Error Resolved), [2026-10-23] Compatibility Checker SFX & Cute Sound Effects Update, [2026-10-23] Fullscreen Requirement Enabled for Compatibility & Learn, [2026-10-23] Learn: Course-Outline Sidebar REWORK REVERTED to the previous design (OC — user request) (+39 more)

### Community 15 - "[2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC)"
Cohesion: 0.14
Nodes (13): [2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC), 🧊 3D Builder (`/3d-builder`), 🔧 3D Drawer UI Optimization (PCBuilder3D.css), 🧱 Build Page Round 2 (OC), 🧱 Build Page — Viewport-Fitted Workspace (Build.jsx / Build.css / App.jsx), 🖥️ Fullscreen Gate (New Feature), 🏠 Home & Build Consolidation, 🤖 Integrations (+5 more)

### Community 16 - "App.jsx"
Cohesion: 0.07
Nodes (49): AdminEditRedirect(), App(), AppContent(), ScrollToTop(), AboutUs(), TEAM_MEMBERS, WHITEHATS_PROJECTS, brandData (+41 more)

### Community 17 - "frontend/package.json"
Cohesion: 0.05
Nodes (52): dependencies, gsap@^3.15.1, html2canvas@^1.4.1, jspdf@^4.2.1, motion@^14.6.0, puppeteer-core@^25.16.0, react@^19.2.4, react-router-dom@^7.14.1 (+44 more)

### Community 19 - "curriculumTypes.d.ts"
Cohesion: 0.25
Nodes (7): CurriculumModule, CurriculumTopic, FieldFact, FieldFactItem, MistakeWarning, QuizOption, TopicQuiz

### Community 20 - "CourseVideoPlayer.jsx"
Cohesion: 0.36
Nodes (6): react-dom@^19.2.4, CourseVideoPlayer(), fmtTime(), loadYouTubeApi(), VideoOverlayModal(), react-dom

### Community 24 - "scripts"
Cohesion: 0.50
Nodes (4): scripts, dev, start, test

### Community 26 - "backend/package.json"
Cohesion: 0.13
Nodes (19): author, dependencies, axios@^1.16.1, cors@^2.8.6, dotenv@^17.4.2, express@^5.2.1, description, devDependencies (+11 more)

### Community 28 - "AppContent"
Cohesion: 0.11
Nodes (31): PCBuilder3D(), FullscreenGate(), FullscreenGateContext, EXPERIENCE_OPTIONS, INTEREST_OPTIONS, STRAND_OPTIONS, CourseBriefingOverlay(), SYLLABUS_SECTIONS (+23 more)

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `BuildLab Changelog` connect `BuildLab Changelog` to `server.js`, `SynthAudio`, `[2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC)`?**
  _High betweenness centrality (0.289) - this node is a cross-community bridge._
- **Should `CourseShell.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12648221343873517 - nodes in this community are weakly interconnected._
- **Why does `react` connect `App.jsx` to `CourseShell.jsx`, `PCBuilder3D.jsx`, `Compatibility.jsx`, `[2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC)`, `App.jsx`, `frontend/package.json`, `CourseVideoPlayer.jsx`, `AppContent`?**
  _High betweenness centrality (0.278) - this node is a cross-community bridge._
- **Should `server.js` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._
- **Why does `[2026-10-31] - Security Hardening & Architecture Consolidation (OpenCode Audit)` connect `server.js` to `BuildLab Changelog`?**
  _High betweenness centrality (0.167) - this node is a cross-community bridge._
- **Should `App.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0927536231884058 - nodes in this community are weakly interconnected._
- **Should `PCBuilder3D.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05616509926854754 - nodes in this community are weakly interconnected._