---
description: Starts the database, backend, frontend, and Cloudflare tunnel for mobile viewing.
---

# /deploy Workflow: Full Stack & Cloudflare Launcher

When the user types `/deploy`:
1. **Execute Deployment Script**:
   Run `powershell -ExecutionPolicy Bypass -File ".agents\skills\deploy\scripts\deploy.ps1"`.
2. **Verify All Systems**:
   - MySQL Database (Port 3306)
   - Backend Server (Port 5000)
   - Frontend Dev Server (Port 5173)
   - Cloudflare Public Tunnel
3. **Display Mobile Access Info**:
   - Provide the live `https://*.trycloudflare.com` URL.
   - Display the scannable QR code image for mobile devices (`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=<URL>`).
   - Show status table of all 4 systems.
