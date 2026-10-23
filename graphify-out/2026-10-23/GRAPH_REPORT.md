# Graph Report - CAPS_LATEST-V  (2026-10-23)

## Corpus Check
- 54 files · ~390,121 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 24 file(s) not represented in the graph (top: .css 14, (none) 3, .log 2)

## Summary
- 339 nodes · 592 edges · 23 communities (15 shown, 8 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a20b883a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- frontend/package.json
- backend/package.json
- PCBuilder3D.jsx
- bot_listener.py
- App.jsx
- Landing & Hero Section
- BuildContext.jsx
- devDependencies
- rules.js
- Home.jsx
- SynthAudio
- Workspace Rules & Instructions
- Workspace Rules & Instructions
- Workspace Rules & Instructions
- React + Vite
- Immediate Telegram Notification Rule
- clean.md
- notes.md
- BuildLab Changelog
- BuildLab Commands & Workflows Cheat Sheet

## God Nodes (most connected - your core abstractions)
1. `soundManager` - 25 edges
2. `react` - 22 edges
3. `SynthAudio` - 16 edges
4. `FullscreenGate()` - 14 edges
5. `handle_command()` - 12 edges
6. `BuildLab Changelog` - 12 edges
7. `react-router-dom` - 11 edges
8. `AppContent()` - 11 edges
9. `[2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC)` - 10 edges
10. `PCBuilder3DWorkspace()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `[2026-10-23] - Symmetrical Dual-Sidebar Architecture & Course Outline Fix (Learn Page)` --references--> `Footer()`  [INFERRED]
  CHANGELOG.md → frontend/src/components/Footer/Footer.jsx
- `🎬 Page Transition Animations (OC)` --references--> `MotionPage()`  [INFERRED]
  CHANGELOG.md → frontend/src/utilities/pageTransitions.jsx
- `⚡ Upgrades to `frontend/src/utilities/soundManager.js`` --references--> `SynthAudio`  [INFERRED]
  CHANGELOG.md → frontend/src/utilities/soundManager.js
- `AppContent()` --calls--> `PCBuilder3D()`  [EXTRACTED]
  frontend/src/App.jsx → frontend/src/components/3D/PCBuilder3D.jsx
- `AppContent()` --calls--> `Learn()`  [EXTRACTED]
  frontend/src/App.jsx → frontend/src/components/Learn/Learn.jsx

## Import Cycles
- None detected.

## Communities (23 total, 8 thin omitted)

### Community 0 - "frontend/package.json"
Cohesion: 0.06
Nodes (33): dependencies, axios, motion, react, react-dom, react-router-dom, @react-three/drei, @react-three/fiber (+25 more)

### Community 1 - "backend/package.json"
Cohesion: 0.05
Nodes (28): pool, initScrapedTable(), runCrawler(), scrapeEasyPC(), author, dependencies, axios, cors (+20 more)

### Community 2 - "PCBuilder3D.jsx"
Cohesion: 0.14
Nodes (24): ComponentModels3D(), GPUFanRotor(), GenericPCCase(), CAMERA_PRESETS, CameraController(), DropIndicator(), PCBuilder3D(), PCBuilder3DWorkspace() (+16 more)

### Community 3 - "bot_listener.py"
Cohesion: 0.27
Nodes (11): capture_screen(), deploy_servers(), get_pids_on_port(), get_system_status(), handle_command(), is_port_in_use(), main(), send_message() (+3 more)

### Community 4 - "App.jsx"
Cohesion: 0.09
Nodes (36): App(), AppContent(), ScrollToTop(), Admin(), categories, CATEGORY_LABELS, DEFAULT_PARTS, detectCategory() (+28 more)

### Community 6 - "BuildContext.jsx"
Cohesion: 0.20
Nodes (13): ARTICLE_LESSONS, COURSE, CourseShell(), readProgress(), CourseVideoPlayer(), fmtTime(), loadYouTubeApi(), componentGuide (+5 more)

### Community 7 - "devDependencies"
Cohesion: 0.14
Nodes (14): devDependencies, autoprefixer, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, postcss (+6 more)

### Community 8 - "rules.js"
Cohesion: 0.38
Nodes (9): calculatePowerRequirements(), checkCompatibility(), findAlternatives(), getCaseFormFactorCapacity(), getCompatibilitySummary(), getMoboFormFactorRank(), getNumber(), normalizeDdr() (+1 more)

### Community 9 - "Home.jsx"
Cohesion: 0.35
Nodes (10): FullscreenGate(), FS_ELEMENT(), hasEngagedFullscreen(), isCoarsePointer(), isFullscreenActive(), isFullscreenSupported(), isPortrait(), markFullscreenEngaged() (+2 more)

### Community 10 - "SynthAudio"
Cohesion: 0.18
Nodes (4): [2026-10-23] UI Interaction Sounds Restored & Centralized (`soundManager.js`), 🔊 Root Cause Identified & Resolved, ⚡ Upgrades to `frontend/src/utilities/soundManager.js`, SynthAudio

### Community 11 - "Workspace Rules & Instructions"
Cohesion: 0.40
Nodes (4): Custom Trigger Commands, Mandatory Automated Telegram Notifications, Response Length & Changelog Rule, Workspace Rules & Instructions

### Community 12 - "Workspace Rules & Instructions"
Cohesion: 0.40
Nodes (4): Custom Trigger Commands, Mandatory Automated Telegram Notifications, Response Length & Changelog Rule, Workspace Rules & Instructions

### Community 13 - "Workspace Rules & Instructions"
Cohesion: 0.50
Nodes (3): Custom Trigger Commands, Mandatory Automated Telegram Notifications, Workspace Rules & Instructions

### Community 14 - "React + Vite"
Cohesion: 0.50
Nodes (3): Expanding the ESLint configuration, React Compiler, React + Vite

### Community 22 - "BuildLab Changelog"
Cohesion: 0.06
Nodes (35): [2026-10-23 03:34] - /clean Linter & Safari Prefix Fixes, [2026-10-23 03:54] - Build Layout Stability, Dynamic Category Filters & Price Removal, [2026-10-23 04:52] - Scrolling Elimination, Red Warning Removal & Redundancy Fix, [2026-10-23] - Admin Dashboard Syntax Error Fix (Vite Parse Error Resolved), [2026-10-23] Learn: Course-Outline Sidebar REWORK REVERTED to the previous design (OC — user request), [2026-10-23] Learn Page: Video Player Overhaul + 9 Dead Videos Replaced (OC), [2026-10-23] - Master Checklist & Safari Compatibility Updates, [2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC) (+27 more)

## Knowledge Gaps
- **10 isolated node(s):** `axios`, `dotenv`, `nodemon`, `axios`, `@tailwindcss/postcss` (+5 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 139 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `App.jsx` to `frontend/package.json`, `Home.jsx`, `PCBuilder3D.jsx`, `BuildContext.jsx`?**
  _High betweenness centrality (0.121) - this node is a cross-community bridge._
- **What connects `axios`, `dotenv`, `nodemon` to the rest of the system?**
  _10 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `frontend/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.06349206349206349 - nodes in this community are weakly interconnected._
- **Why does `BuildLab Changelog` connect `BuildLab Changelog` to `SynthAudio`?**
  _High betweenness centrality (0.102) - this node is a cross-community bridge._
- **Should `backend/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.054878048780487805 - nodes in this community are weakly interconnected._
- **Why does `Footer()` connect `App.jsx` to `BuildLab Changelog`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._
- **Should `PCBuilder3D.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.135632183908046 - nodes in this community are weakly interconnected._