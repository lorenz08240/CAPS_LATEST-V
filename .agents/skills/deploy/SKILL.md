---
name: deploy
description: >-
  Use this skill when the user asks to deploy, types "/deploy", or wants to start and verify the local development servers for BuildLab (backend on port 5000 and frontend on port 5173).
---

# Local Deployment Workflow (`/deploy`)

This skill handles starting, verifying, and monitoring the local development servers for BuildLab.

## Workflow Steps

### 1. Port & Process Check
- Check if ports `5000` (Express) or `5173` (Vite) are already occupied:
  ```powershell
  Get-NetTCPConnection -LocalPort 5000,5173 -State Listen -ErrorAction SilentlyContinue
  ```
- If processes are already running, confirm their status before restarting.

### 2. Dependency & Configuration Verification
- Check backend dependencies and environment:
  - Verify `backend/.env` exists (database credentials, port).
  - Verify `backend/node_modules` exists.
- Check frontend dependencies:
  - Verify `frontend/node_modules` exists.

### 3. Launch Development Servers
- Start Backend in background:
  - Directory: `backend/`
  - Command: `npm run dev` (or `node server.js`)
  - Target: `http://localhost:5000`
- Start Frontend in background:
  - Directory: `frontend/`
  - Command: `npm run dev`
  - Target: `http://localhost:5173`

### 4. Health & Connectivity Verification
- Poll backend health: `curl -s http://localhost:5000/api/content/team` or standard health endpoint.
- Verify frontend responds on `http://localhost:5173`.
- Verify database connection status reported in backend logs.

### 5. Report Status
- Provide clean status output:
  - Backend: `🟢 http://localhost:5000`
  - Frontend: `🟢 http://localhost:5173`
  - Notes on database connection and active routes.
