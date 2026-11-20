# Graph Report - WhiteHats Utilities  (2026-10-25)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 241 nodes · 379 edges · 12 communities (11 shown, 1 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- smoke-worker.mjs
- install.mjs
- check-repo.mjs
- smoke-test.mjs
- cli/package.json
- Landing & Hero Section
- BuildLab Learning Guide: Module 1 - Computer Fundamentals
- contrast-mcp.py
- anti-slop/package.json
- settings.mjs
- Q: Explain logs

## God Nodes (most connected - your core abstractions)
1. `main()` - 16 edges
2. `read()` - 14 edges
3. `updateAll()` - 8 edges
4. `installSkills()` - 7 edges
5. `updatePointers()` - 7 edges
6. `findNestedCopy()` - 6 edges
7. `resolveTargets()` - 6 edges
8. `selftest()` - 6 edges
9. `main()` - 6 edges
10. `BuildLab Learning Guide: Module 1 - Computer Fundamentals` - 6 edges

## Surprising Connections (you probably didn't know these)
- `main()` --calls--> `configureMode()`  [EXTRACTED]
  anti-slop/cli/index.mjs → anti-slop/cli/lib/settings.mjs
- `main()` --calls--> `banner()`  [EXTRACTED]
  anti-slop/cli/index.mjs → anti-slop/cli/lib/banner.mjs
- `main()` --calls--> `detectAgents()`  [EXTRACTED]
  anti-slop/cli/index.mjs → anti-slop/cli/lib/install.mjs
- `main()` --calls--> `detectConflicts()`  [EXTRACTED]
  anti-slop/cli/index.mjs → anti-slop/cli/lib/install.mjs
- `main()` --calls--> `detectDuplicateReads()`  [EXTRACTED]
  anti-slop/cli/index.mjs → anti-slop/cli/lib/install.mjs

## Import Cycles
- None detected.

## Communities (12 total, 1 thin omitted)

### Community 0 - "smoke-worker.mjs"
Cohesion: 0.04
Nodes (41): after, again, agGlobal, agPointers, agTargets, agWritten, ampProject, clean (+33 more)

### Community 1 - "install.mjs"
Cohesion: 0.10
Nodes (39): displayDir(), EXTRA_SKILLS, main(), printPluginDoors(), stop(), banner(), LOGO, AGENTS (+31 more)

### Community 2 - "check-repo.mjs"
Cohesion: 0.12
Nodes (28): anchorsIn(), CHECKS, COMMUNITY, contrastTwins(), docLinks(), emDashes(), existsExactly(), frontmatter() (+20 more)

### Community 3 - "smoke-test.mjs"
Cohesion: 0.08
Nodes (21): child, here, python, server, cliDeps, coreInstalled, coreSkill, __dirname (+13 more)

### Community 4 - "cli/package.json"
Cohesion: 0.08
Nodes (24): author, bin, antislop-ai, dependencies, @clack/prompts, picocolors, description, engines (+16 more)

### Community 5 - "Landing & Hero Section"
Cohesion: 0.23
Nodes (9): contrast_ratio(), linearize(), luminance(), main(), parse_hex(), parse_pairing(), parse_reference_rows(), reference_doc_path() (+1 more)

### Community 6 - "BuildLab Learning Guide: Module 1 - Computer Fundamentals"
Cohesion: 0.13
Nodes (14): BuildLab Learning Guide: Module 1 - Computer Fundamentals, Data Highways Called Buses, Essential Cables and Connectors, Generational Standards and Physical Keying, Section 1: Overview and Core Goals, Section 2: Lesson 1 - Components of a Computer, Section 3: Lesson 2 - How the Parts Talk: Buses and Standards, Section 4: Self-Check Questions and Answers (+6 more)

### Community 7 - "contrast-mcp.py"
Cohesion: 0.28
Nodes (9): _channel(), check_contrast(), contrast_ratio(), _error(), main(), relative_luminance(), _reply(), _send() (+1 more)

### Community 8 - "anti-slop/package.json"
Cohesion: 0.17
Nodes (11): cline, plugins, description, keywords, license, name, pi, skills (+3 more)

### Community 9 - "settings.mjs"
Cohesion: 0.33
Nodes (5): configureMode(), modes, readSettings(), resolveSettingsPath(), settingsPath

### Community 10 - "Q: Explain logs"
Cohesion: 0.50
Nodes (3): Answer, Outcome, Q: Explain logs

## Knowledge Gaps
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `picocolors` connect `install.mjs` to `cli/package.json`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Should `smoke-worker.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.043478260869565216 - nodes in this community are weakly interconnected._
- **Why does `@clack/prompts` connect `cli/package.json` to `install.mjs`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Should `install.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.1014799154334038 - nodes in this community are weakly interconnected._
- **Should `check-repo.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.11827956989247312 - nodes in this community are weakly interconnected._
- **Should `smoke-test.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.08262108262108261 - nodes in this community are weakly interconnected._
- **Should `cli/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._