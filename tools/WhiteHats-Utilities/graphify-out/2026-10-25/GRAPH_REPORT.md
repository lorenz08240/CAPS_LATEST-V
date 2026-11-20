# Graph Report - CAPS_LATEST-V  (2026-10-25)

## Corpus Check
- 56 files · ~393,635 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 24 file(s) not represented in the graph (top: .css 14, (none) 3, .log 2)

## Summary
- 377 nodes · 645 edges · 25 communities (17 shown, 8 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 10 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5a42dbe9`
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
- BuildLab Learning Guide: Module 1 - Computer Fundamentals
- Home.jsx
- SynthAudio
- Workspace Rules & Instructions
- Workspace Rules & Instructions
- Workspace Rules & Instructions
- React + Vite
- Immediate Telegram Notification Rule
- clean.md
- notes.md
- rules.js
- BuildLab Changelog
- BuildLab Commands & Workflows Cheat Sheet
- Q: Explain logs

## God Nodes (most connected - your core abstractions)
1. `soundManager` - 30 edges
2. `react` - 22 edges
3. `SynthAudio` - 19 edges
4. `FullscreenGate()` - 18 edges
5. `BuildLab Changelog` - 17 edges
6. `handle_command()` - 12 edges
7. `react-router-dom` - 11 edges
8. `AppContent()` - 11 edges
9. `[2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC)` - 10 edges
10. `PCBuilder3DWorkspace()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `[2026-10-23] - Symmetrical Dual-Sidebar Architecture & Course Outline Fix (Learn Page)` --references--> `Footer()`  [INFERRED]
  CHANGELOG.md → frontend/src/components/Footer/Footer.jsx
- `🖥️ Fullscreen Gating (`FullscreenGate.jsx`)` --references--> `FullscreenGate()`  [INFERRED]
  CHANGELOG.md → frontend/src/components/FullscreenGate/FullscreenGate.jsx
- `🎬 Page Transition Animations (OC)` --references--> `MotionPage()`  [INFERRED]
  CHANGELOG.md → frontend/src/utilities/pageTransitions.jsx
- `⚡ Upgrades to `frontend/src/utilities/soundManager.js`` --references--> `SynthAudio`  [INFERRED]
  CHANGELOG.md → frontend/src/utilities/soundManager.js
- `🖥️ Fullscreen Gating (`FullscreenGate.jsx`)` --references--> `CourseShell()`  [INFERRED]
  CHANGELOG.md → frontend/src/components/Learn/CourseShell.jsx

## Import Cycles
- None detected.

## Communities (25 total, 8 thin omitted)

### Community 0 - "frontend/package.json"
Cohesion: 0.06
Nodes (35): dependencies, axios, motion, react, react-dom, react-router-dom, @react-three/drei, @react-three/fiber (+27 more)

### Community 1 - "backend/package.json"
Cohesion: 0.05
Nodes (28): pool, initScrapedTable(), runCrawler(), scrapeEasyPC(), author, dependencies, axios, cors (+20 more)

### Community 2 - "PCBuilder3D.jsx"
Cohesion: 0.14
Nodes (23): ComponentModels3D(), GPUFanRotor(), GenericPCCase(), CAMERA_PRESETS, CameraController(), DropIndicator(), PCBuilder3D(), PCBuilder3DWorkspace() (+15 more)

### Community 3 - "bot_listener.py"
Cohesion: 0.27
Nodes (11): capture_screen(), deploy_servers(), get_pids_on_port(), get_system_status(), handle_command(), is_port_in_use(), main(), send_message() (+3 more)

### Community 4 - "App.jsx"
Cohesion: 0.11
Nodes (30): App(), AppContent(), ScrollToTop(), Admin(), categories, CATEGORY_LABELS, DEFAULT_PARTS, detectCategory() (+22 more)

### Community 6 - "BuildContext.jsx"
Cohesion: 0.17
Nodes (15): [2026-10-23] Fullscreen Requirement Enabled for Compatibility & Learn, 🖥️ Fullscreen Gating (`FullscreenGate.jsx`), ARTICLE_LESSONS, COURSE, CourseShell(), readProgress(), CourseVideoPlayer(), fmtTime() (+7 more)

### Community 7 - "devDependencies"
Cohesion: 0.14
Nodes (14): devDependencies, autoprefixer, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, postcss (+6 more)

### Community 8 - "BuildLab Learning Guide: Module 1 - Computer Fundamentals"
Cohesion: 0.13
Nodes (14): BuildLab Learning Guide: Module 1 - Computer Fundamentals, Data Highways Called Buses, Essential Cables and Connectors, Generational Standards and Physical Keying, Section 1: Overview and Core Goals, Section 2: Lesson 1 - Components of a Computer, Section 3: Lesson 2 - How the Parts Talk: Buses and Standards, Section 4: Self-Check Questions and Answers (+6 more)

### Community 9 - "Home.jsx"
Cohesion: 0.23
Nodes (16): Build(), BuildPage(), CATEGORY_FILTERS, FullscreenGate(), Hero(), enterFullscreen(), FS_ELEMENT(), hasEngagedFullscreen() (+8 more)

### Community 10 - "SynthAudio"
Cohesion: 0.15
Nodes (5): [2026-10-23] UI Interaction Sounds Restored & Centralized (`soundManager.js`), 🔊 Root Cause Identified & Resolved, ⚡ Upgrades to `frontend/src/utilities/soundManager.js`, 🎮 Wired Semantic Audio Events Across Workspaces, SynthAudio

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

### Community 21 - "rules.js"
Cohesion: 0.38
Nodes (9): calculatePowerRequirements(), checkCompatibility(), findAlternatives(), getCaseFormFactorCapacity(), getCompatibilitySummary(), getMoboFormFactorRank(), getNumber(), normalizeDdr() (+1 more)

### Community 22 - "BuildLab Changelog"
Cohesion: 0.04
Nodes (45): [2026-10-23 03:34] - /clean Linter & Safari Prefix Fixes, [2026-10-23 03:54] - Build Layout Stability, Dynamic Category Filters & Price Removal, [2026-10-23 04:52] - Scrolling Elimination, Red Warning Removal & Redundancy Fix, [2026-10-23] 3D Studio: Clean Button Design (Icons & Emojis Removed), [2026-10-23] - Admin Dashboard Syntax Error Fix (Vite Parse Error Resolved), [2026-10-23] Compatibility Checker SFX & Cute Sound Effects Update, [2026-10-23] Learn: Course-Outline Sidebar REWORK REVERTED to the previous design (OC — user request), [2026-10-23] Learn Page: NotebookLLM Master Source Script for Module 1 (+37 more)

### Community 24 - "Q: Explain logs"
Cohesion: 0.50
Nodes (3): Answer, Outcome, Q: Explain logs

## Knowledge Gaps
- **10 isolated node(s):** `axios`, `dotenv`, `nodemon`, `axios`, `@tailwindcss/postcss` (+5 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 162 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `BuildLab Changelog` connect `BuildLab Changelog` to `SynthAudio`, `BuildContext.jsx`?**
  _High betweenness centrality (0.124) - this node is a cross-community bridge._
- **What connects `axios`, `dotenv`, `nodemon` to the rest of the system?**
  _10 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `frontend/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.059743954480796585 - nodes in this community are weakly interconnected._
- **Why does `react` connect `App.jsx` to `frontend/package.json`, `Home.jsx`, `PCBuilder3D.jsx`, `BuildContext.jsx`?**
  _High betweenness centrality (0.101) - this node is a cross-community bridge._
- **Should `backend/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.054878048780487805 - nodes in this community are weakly interconnected._
- **Why does `soundManager` connect `Landing & Hero Section` to `PCBuilder3D.jsx`, `App.jsx`, `BuildContext.jsx`, `Home.jsx`, `SynthAudio`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **Should `PCBuilder3D.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.14039408866995073 - nodes in this community are weakly interconnected._