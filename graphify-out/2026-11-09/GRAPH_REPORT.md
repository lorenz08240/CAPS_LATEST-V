# Graph Report - CAPS_LATEST-V  (2026-11-09)

## Corpus Check
- 82 files · ~106,480 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 39 file(s) not represented in the graph (top: .css 26, (none) 5, .glb 3)

## Summary
- 534 nodes · 1187 edges · 26 communities (21 shown, 5 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5f226d0c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- EyeTracker.tsx
- dependencies
- App.jsx
- PCBuilder3D.jsx
- server.js
- crawler.js
- dependencies
- Compatibility.jsx
- scripts
- react
- SynthAudio
- compatibility.test.js
- BuildLab Changelog
- [2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC)
- FullscreenGate.jsx
- db.js
- eslint.config.js
- devDependencies
- frontend/package.json
- scripts
- FeatureCarousel.jsx
- vite
- puppeteer-core
- backend/package.json

## God Nodes (most connected - your core abstractions)
1. `react` - 58 edges
2. `SoundManager` - 39 edges
3. `react-router-dom` - 31 edges
4. `BuildLab Changelog` - 28 edges
5. `SynthAudio` - 20 edges
6. `AdminHeader()` - 19 edges
7. `AppContent()` - 19 edges
8. `useAuth()` - 17 edges
9. `apiFetch()` - 17 edges
10. `useLearnMode()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `⚡ Upgrades to `frontend/src/utilities/soundManager.js`` --references--> `SynthAudio`  [INFERRED]
  CHANGELOG.md → frontend/src/utilities/soundManager.js
- `🖥️ Fullscreen Gating (`FullscreenGate.jsx`)` --references--> `FullscreenGate()`  [INFERRED]
  CHANGELOG.md → frontend/src/components/FullscreenGate/FullscreenGate.jsx
- `🧹 Cleaned Button Typography in `frontend/src/components/3D/PCBuilder3D.jsx`` --references--> `Compatibility()`  [INFERRED]
  CHANGELOG.md → frontend/src/components/Compatibility/Compatibility.jsx
- `🖥️ Fullscreen Gating (`FullscreenGate.jsx`)` --references--> `CourseShell()`  [INFERRED]
  CHANGELOG.md → frontend/src/components/Learn/CourseShell.jsx
- `[2026-10-31] - Security Hardening & Architecture Consolidation (OpenCode Audit)` --references--> `adminAuth()`  [INFERRED]
  CHANGELOG.md → backend/server.js

## Import Cycles
- None detected.

## Communities (26 total, 5 thin omitted)

### Community 0 - "EyeTracker.tsx"
Cohesion: 0.12
Nodes (20): BOB_PHRASES, BobCompanion(), BuildPage(), clamp(), Eye, EyeTracker(), LINES, measure() (+12 more)

### Community 1 - "dependencies"
Cohesion: 0.14
Nodes (14): dependencies, html2canvas@^1.4.1, jspdf@^4.2.1, motion@^14.6.0, react@^19.2.4, react-dom@^19.2.4, react-router-dom@^7.14.1, @react-three/drei@^10.7.7 (+6 more)

### Community 2 - "App.jsx"
Cohesion: 0.10
Nodes (45): AdminAccounts(), AdminAddComponent(), CATEGORIES, DEFAULT_FORM_DATA, AdminAuthGuard(), AdminContent(), AdminCrawler(), CATEGORIES (+37 more)

### Community 3 - "PCBuilder3D.jsx"
Cohesion: 0.06
Nodes (55): ComponentModels3D(), DDR4StickMesh(), HeroFloatingRAM(), MotherboardDDR4Kit(), ProceduralRAMFallback(), RAMModelErrorBoundary, SingleDDR4RAM(), GenericPCCase() (+47 more)

### Community 4 - "server.js"
Cohesion: 0.12
Nodes (8): app, cors, distPath, { exec }, express, fs, path, uploadsDir

### Community 5 - "crawler.js"
Cohesion: 0.32
Nodes (11): BERMOR_CATEGORY_MAP, detectProductCategory(), EASYPC_COLLECTION_MAP, EXCLUDED_KEYWORDS, extractSpecs(), getStagingProducts(), initScrapedTable(), processAndSaveProducts() (+3 more)

### Community 6 - "dependencies"
Cohesion: 0.33
Nodes (6): dependencies, axios, cors, dotenv, express, mysql2

### Community 7 - "Compatibility.jsx"
Cohesion: 0.08
Nodes (32): [2026-10-23] 3D Studio: Clean Button Design (Icons & Emojis Removed), 🧹 Cleaned Button Typography in `frontend/src/components/3D/PCBuilder3D.jsx`, COMPAT_BOB_PHRASES, Compatibility(), CompatibilityView(), getComponentBobHint(), ARTICLE_LESSONS, BOB_LESSON_WISDOM (+24 more)

### Community 8 - "scripts"
Cohesion: 0.50
Nodes (4): scripts, dev, start, test

### Community 9 - "react"
Cohesion: 0.07
Nodes (37): AdminEditRedirect(), App(), AppContent(), ScrollToTop(), AboutUs(), TEAM_MEMBERS, brandData, Brands() (+29 more)

### Community 10 - "SynthAudio"
Cohesion: 0.07
Nodes (6): [2026-10-23] UI Interaction Sounds Restored & Centralized (`soundManager.js`), 🔊 Root Cause Identified & Resolved, ⚡ Upgrades to `frontend/src/utilities/soundManager.js`, 🎮 Wired Semantic Audio Events Across Workspaces, SoundManager, SynthAudio

### Community 11 - "compatibility.test.js"
Cohesion: 0.36
Nodes (6): checkCompatibility(), getCaseFormFactorCapacity(), getMoboFormFactorRank(), getNumber(), normalizeDdr(), normalizeSocket()

### Community 14 - "BuildLab Changelog"
Cohesion: 0.04
Nodes (48): adminAuth(), [2026-10-23 03:34] - /clean Linter & Safari Prefix Fixes, [2026-10-23 03:54] - Build Layout Stability, Dynamic Category Filters & Price Removal, [2026-10-23 04:52] - Scrolling Elimination, Red Warning Removal & Redundancy Fix, [2026-10-23] - Admin Dashboard Syntax Error Fix (Vite Parse Error Resolved), [2026-10-23] Compatibility Checker SFX & Cute Sound Effects Update, [2026-10-23] Fullscreen Requirement Enabled for Compatibility & Learn, [2026-10-23] Learn: Course-Outline Sidebar REWORK REVERTED to the previous design (OC — user request) (+40 more)

### Community 15 - "[2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC)"
Cohesion: 0.14
Nodes (13): [2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC), 🧊 3D Builder (`/3d-builder`), 🔧 3D Drawer UI Optimization (PCBuilder3D.css), 🧱 Build Page Round 2 (OC), 🧱 Build Page — Viewport-Fitted Workspace (Build.jsx / Build.css / App.jsx), 🖥️ Fullscreen Gate (New Feature), 🏠 Home & Build Consolidation, 🤖 Integrations (+5 more)

### Community 16 - "FullscreenGate.jsx"
Cohesion: 0.32
Nodes (12): FullscreenGate(), Preloader(), enterFullscreen(), FS_ELEMENT(), hasEngagedFullscreen(), isCoarsePointer(), isFullscreenActive(), isFullscreenSupported() (+4 more)

### Community 18 - "eslint.config.js"
Cohesion: 0.18
Nodes (10): eslint@^9.39.4, @eslint/js@^9.39.4, eslint-plugin-react-hooks@^7.0.1, eslint-plugin-react-refresh@^0.5.2, globals@^17.4.0, eslint, @eslint/js, eslint-plugin-react-hooks (+2 more)

### Community 19 - "devDependencies"
Cohesion: 0.18
Nodes (11): devDependencies, autoprefixer@^10.5.0, postcss@^8.5.10, @tailwindcss/postcss@^4.2.2, @types/react@^19.2.14, @types/react-dom@^19.2.3, autoprefixer, postcss (+3 more)

### Community 20 - "frontend/package.json"
Cohesion: 0.29
Nodes (6): tailwindcss@^4.2.2, name, private, type, version, tailwindcss

### Community 21 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build, dev, lint, preview, start

### Community 23 - "vite"
Cohesion: 0.40
Nodes (4): vite@^8.0.4, @vitejs/plugin-react@^6.0.1, vite, @vitejs/plugin-react

### Community 26 - "backend/package.json"
Cohesion: 0.13
Nodes (14): author, description, devDependencies, nodemon, keywords, license, main, name (+6 more)

## Knowledge Gaps
- **2 isolated node(s):** `dotenv`, `nodemon`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 179 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `App.jsx` to `EyeTracker.tsx`, `dependencies`, `PCBuilder3D.jsx`, `Compatibility.jsx`, `react`, `[2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC)`, `FullscreenGate.jsx`, `frontend/package.json`, `FeatureCarousel.jsx`?**
  _High betweenness centrality (0.348) - this node is a cross-community bridge._
- **What connects `dotenv`, `nodemon` to the rest of the system?**
  _2 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `EyeTracker.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11956521739130435 - nodes in this community are weakly interconnected._
- **Why does `BuildLab Changelog` connect `BuildLab Changelog` to `SynthAudio`, `[2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC)`, `Compatibility.jsx`?**
  _High betweenness centrality (0.180) - this node is a cross-community bridge._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Why does `puppeteer-core` connect `puppeteer-core` to `frontend/package.json`, `server.js`?**
  _High betweenness centrality (0.154) - this node is a cross-community bridge._
- **Should `App.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0965034965034965 - nodes in this community are weakly interconnected._