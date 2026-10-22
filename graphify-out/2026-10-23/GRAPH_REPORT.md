# Graph Report - CAPS_LATEST-V  (2026-10-23)

## Corpus Check
- 50 files · ~350,199 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 20 file(s) not represented in the graph (top: .css 12, (none) 3, .example 1)

## Summary
- 265 nodes · 467 edges · 23 communities (15 shown, 8 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `642f823e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- frontend/package.json
- backend/package.json
- PCBuilder3D.jsx
- bot_listener.py
- App.jsx
- Landing & Hero Section
- db.js
- devDependencies
- rules.js
- Home.jsx
- checkCompatibility
- Workspace Rules & Instructions
- Workspace Rules & Instructions
- Workspace Rules & Instructions
- React + Vite
- Immediate Telegram Notification Rule
- clean.md
- [2026-10-23] - Master Checklist & Safari Compatibility Updates

## God Nodes (most connected - your core abstractions)
1. `react` - 18 edges
2. `soundManager` - 18 edges
3. `handle_command()` - 12 edges
4. `FullscreenGate()` - 12 edges
5. `react-router-dom` - 10 edges
6. `AppContent()` - 10 edges
7. `PCBuilder3D()` - 10 edges
8. `checkCompatibility()` - 10 edges
9. `useBuild()` - 8 edges
10. `checkCompatibility()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `AppContent()` --calls--> `PCBuilder3D()`  [EXTRACTED]
  frontend/src/App.jsx → frontend/src/components/3D/PCBuilder3D.jsx
- `AppContent()` --calls--> `Build()`  [EXTRACTED]
  frontend/src/App.jsx → frontend/src/components/Build/Build.jsx
- `PCBuilder3D()` --calls--> `useBuild()`  [EXTRACTED]
  frontend/src/components/3D/PCBuilder3D.jsx → frontend/src/contexts/BuildContext.jsx
- `PCBuilder3D()` --calls--> `checkCompatibility()`  [EXTRACTED]
  frontend/src/components/3D/PCBuilder3D.jsx → frontend/src/utilities/compatibilityEngine.js
- `BuildPage()` --calls--> `useBuild()`  [EXTRACTED]
  frontend/src/components/Build/Build.jsx → frontend/src/contexts/BuildContext.jsx

## Import Cycles
- None detected.

## Communities (23 total, 8 thin omitted)

### Community 0 - "frontend/package.json"
Cohesion: 0.07
Nodes (32): dependencies, axios, react, react-dom, react-router-dom, @react-three/drei, @react-three/fiber, three (+24 more)

### Community 1 - "backend/package.json"
Cohesion: 0.08
Nodes (23): author, dependencies, axios, cors, dotenv, express, mysql2, description (+15 more)

### Community 2 - "PCBuilder3D.jsx"
Cohesion: 0.19
Nodes (17): ComponentModels3D(), GPUFanRotor(), GenericPCCase(), CAMERA_PRESETS, CameraController(), DropIndicator(), PCBuilder3D(), STAGE_REQUIREMENTS (+9 more)

### Community 3 - "bot_listener.py"
Cohesion: 0.27
Nodes (11): capture_screen(), deploy_servers(), get_pids_on_port(), get_system_status(), handle_command(), is_port_in_use(), main(), send_message() (+3 more)

### Community 4 - "App.jsx"
Cohesion: 0.10
Nodes (31): App(), AppContent(), ScrollToTop(), Admin(), categories, CATEGORY_LABELS, DEFAULT_PARTS, detectCategory() (+23 more)

### Community 6 - "db.js"
Cohesion: 0.18
Nodes (5): pool, initScrapedTable(), runCrawler(), scrapeEasyPC(), mysql2

### Community 7 - "devDependencies"
Cohesion: 0.14
Nodes (14): devDependencies, autoprefixer, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, postcss (+6 more)

### Community 8 - "rules.js"
Cohesion: 0.35
Nodes (9): calculatePowerRequirements(), checkCompatibility(), findAlternatives(), getCaseFormFactorCapacity(), getCompatibilitySummary(), getMoboFormFactorRank(), getNumber(), normalizeDdr() (+1 more)

### Community 9 - "Home.jsx"
Cohesion: 0.26
Nodes (14): Build(), BuildPage(), FullscreenGate(), Hero(), enterFullscreen(), FS_ELEMENT(), hasEngagedFullscreen(), isCoarsePointer() (+6 more)

### Community 10 - "checkCompatibility"
Cohesion: 0.52
Nodes (6): checkCompatibility(), getCaseFormFactorCapacity(), getMoboFormFactorRank(), getNumber(), normalizeDdr(), normalizeSocket()

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

### Community 22 - "[2026-10-23] - Master Checklist & Safari Compatibility Updates"
Cohesion: 0.25
Nodes (7): [2026-10-23] - Master Checklist & Safari Compatibility Updates, 🧊 3D Builder & Design Aesthetic, 🛡️ Admin Panel, 🍏 Apple & Safari Compatibility, 🛠️ Build & Home Page, BuildLab Changelog, 📚 Learn Page

## Knowledge Gaps
- **10 isolated node(s):** `axios`, `dotenv`, `nodemon`, `axios`, `@tailwindcss/postcss` (+5 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 109 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `App.jsx` to `frontend/package.json`, `Home.jsx`, `PCBuilder3D.jsx`, `rules.js`?**
  _High betweenness centrality (0.129) - this node is a cross-community bridge._
- **What connects `axios`, `dotenv`, `nodemon` to the rest of the system?**
  _10 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `frontend/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.06554621848739496 - nodes in this community are weakly interconnected._
- **Why does `soundManager` connect `Landing & Hero Section` to `Home.jsx`, `App.jsx`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Should `backend/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._
- **Why does `devDependencies` connect `devDependencies` to `frontend/package.json`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Should `App.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10409745293466224 - nodes in this community are weakly interconnected._