---
name: graphify
description: >-
  Use this skill when the user asks to run graphify, types "/graphify", or wants to update and inspect the codebase knowledge graph and God Node analysis.
---

# Codebase Graphify Analysis (`/graphify`)

This skill updates and inspects the codebase dependency graph and community architecture stored in `graphify-out/`.

## Workflow Steps

### 1. Environment & Prerequisite Check
- Check if Python is available in PATH: `python --version`.
- Check if `graphify` CLI or package is installed: `python -m graphify --help` or `graphify --version`.
  - If not installed in the active environment, advise running `pip install graphify` or use the existing output in `graphify-out/`.

### 2. Update Codebase Graph
- Run graphify update from the project root:
  ```powershell
  graphify update .
  ```
- Or if running via python module:
  ```powershell
  python -m graphify update .
  ```

### 3. Analyze & Inspect Graph Output
- Inspect the output files generated in `graphify-out/`:
  - `graphify-out/.graphify_analysis.json` (community clusters, central components)
  - `graphify-out/.graphify_labels.json`
- Identify:
  - **God Nodes**: High degree / centrality nodes that may indicate tight coupling.
  - **Communities**: Groupings of frontend, backend, database, and utilities.
  - **Circular Dependencies**: Any cross-module import cycles.

### 4. Report Findings
- Present a concise summary of the graph structure to the user:
  - Total communities identified.
  - Key hub modules (e.g. `backend/server.js`, `frontend/src/App.jsx`).
  - Architectural observations and refactoring suggestions if applicable.
