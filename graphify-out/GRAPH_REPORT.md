# Graph Report - CAPS_LATEST-V  (2026-10-16)

## Corpus Check
- 42 files · ~307,519 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 19 file(s) not represented in the graph (top: .css 11, (none) 3, .example 1)

## Summary
- 231 nodes · 389 edges · 17 communities (12 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `48fd332b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- backend/package.json
- App.jsx
- frontend/package.json
- PCBuilder3D.jsx
- bot_listener.py
- soundManager
- devDependencies
- rules.js
- db.js
- dependencies
- Workspace Rules & Instructions
- Workspace Rules & Instructions
- React + Vite
- Immediate Telegram Notification Rule

## God Nodes (most connected - your core abstractions)
1. `react` - 16 edges
2. `soundManager` - 15 edges
3. `handle_command()` - 12 edges
4. `App()` - 12 edges
5. `react-router-dom` - 10 edges
6. `PCBuilder3D()` - 10 edges
7. `checkCompatibility()` - 10 edges
8. `useBuild()` - 8 edges
9. `checkCompatibility()` - 8 edges
10. `ProceduralSickleFan()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `App()` --calls--> `PCBuilder3D()`  [EXTRACTED]
  frontend/src/App.jsx → frontend/src/components/3D/PCBuilder3D.jsx
- `PCBuilder3D()` --calls--> `useBuild()`  [EXTRACTED]
  frontend/src/components/3D/PCBuilder3D.jsx → frontend/src/contexts/BuildContext.jsx
- `Build()` --calls--> `checkCompatibility()`  [EXTRACTED]
  frontend/src/components/Build/Build.jsx → frontend/src/utilities/compatibilityEngine.js
- `App()` --calls--> `Admin()`  [EXTRACTED]
  frontend/src/App.jsx → frontend/src/components/Admin/Admin.jsx
- `App()` --calls--> `Brands()`  [EXTRACTED]
  frontend/src/App.jsx → frontend/src/components/Brands/Brands.jsx

## Import Cycles
- None detected.

## Communities (17 total, 5 thin omitted)

### Community 0 - "backend/package.json"
Cohesion: 0.07
Nodes (27): author, dependencies, axios, cors, dotenv, express, mysql2, description (+19 more)

### Community 1 - "App.jsx"
Cohesion: 0.14
Nodes (23): App(), ScrollToTop(), Admin(), categories, brandData, Brands(), Build(), Footer() (+15 more)

### Community 2 - "frontend/package.json"
Cohesion: 0.08
Nodes (25): axios, name, private, scripts, build, dev, lint, preview (+17 more)

### Community 3 - "PCBuilder3D.jsx"
Cohesion: 0.14
Nodes (23): ComponentModels3D(), GPUFanRotor(), GenericPCCase(), CAMERA_PRESETS, CameraController(), DropIndicator(), PCBuilder3D(), STAGE_REQUIREMENTS (+15 more)

### Community 4 - "bot_listener.py"
Cohesion: 0.29
Nodes (11): capture_screen(), deploy_servers(), get_pids_on_port(), get_system_status(), handle_command(), is_port_in_use(), main(), send_message() (+3 more)

### Community 6 - "devDependencies"
Cohesion: 0.14
Nodes (14): devDependencies, autoprefixer, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, postcss (+6 more)

### Community 7 - "rules.js"
Cohesion: 0.35
Nodes (9): calculatePowerRequirements(), checkCompatibility(), findAlternatives(), getCaseFormFactorCapacity(), getCompatibilitySummary(), getMoboFormFactorRank(), getNumber(), normalizeDdr() (+1 more)

### Community 8 - "db.js"
Cohesion: 0.11
Nodes (12): mysql, pool, axios, db, runCrawler(), scrapeEasyPC(), scrapeNetcodex(), scrapeUnicorp() (+4 more)

### Community 9 - "dependencies"
Cohesion: 0.25
Nodes (8): dependencies, axios, react, react-dom, react-router-dom, @react-three/drei, @react-three/fiber, three

### Community 10 - "Workspace Rules & Instructions"
Cohesion: 0.50
Nodes (3): Custom Trigger Commands, Mandatory Automated Telegram Notifications, Workspace Rules & Instructions

### Community 13 - "Workspace Rules & Instructions"
Cohesion: 0.50
Nodes (3): Custom Trigger Commands, Mandatory Automated Telegram Notifications, Workspace Rules & Instructions

### Community 14 - "React + Vite"
Cohesion: 0.50
Nodes (3): Expanding the ESLint configuration, React Compiler, React + Vite

## Knowledge Gaps
- **10 isolated node(s):** `axios`, `dotenv`, `nodemon`, `axios`, `@tailwindcss/postcss` (+5 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 98 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `App.jsx` to `frontend/package.json`, `PCBuilder3D.jsx`, `rules.js`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **What connects `axios`, `dotenv`, `nodemon` to the rest of the system?**
  _10 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `backend/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._
- **Why does `devDependencies` connect `devDependencies` to `frontend/package.json`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Should `App.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.13968253968253969 - nodes in this community are weakly interconnected._
- **Why does `react-router-dom` connect `App.jsx` to `frontend/package.json`, `PCBuilder3D.jsx`, `rules.js`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Should `frontend/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.08465608465608465 - nodes in this community are weakly interconnected._