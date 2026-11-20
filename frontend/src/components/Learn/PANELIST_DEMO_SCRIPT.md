# 90-second panelist demo — BuildLab Learn / capstone

Goal: the panel sees the hand-built 3D rig **within 5 seconds** and the full
assemble → POST → teardown story within 90 seconds. Do not start at Module 1.

## 0. Setup (before they sit down)

1. Open the demo on the **permanent public URL**, not localhost:
   - `https://disposal-cylinder-flounder.ngrok-free.dev/learn?topic=15&mode=3d-lab`
   - `topic=15` is topic 7.2, the Capstone 3D Assembly Lab.
   - `mode=3d-lab` jumps straight into the 3D stage instead of the reading page.
2. **Always use the public origin for the pitch.** Google sign-in uses Google Identity Services
   (`VITE_GOOGLE_CLIENT_ID`) and only works from the authorized JavaScript origin — that is the
   ngrok domain. `http://localhost:5173` is a different origin and will not authenticate.
3. The public origin has its **own localStorage / sessionStorage**, separate from localhost.
   That is why it feels like a fresh browser profile — no need to clear anything.
4. **Do NOT append `?reset=demo` to the demo URL.** `App.jsx:96-111` wipes all localStorage,
   sessionStorage, and cookies, then redirects to `/` — it would sign you out and lose the topic.
5. The 3D workbench is the default first screen — no briefing PDF blocks it. The course briefing
   is available from the **BRIEFING** button in the header if a judge asks for it.
6. Click the **▤ READING** tab at the top of the stage to show the document + video + quick check.
   Click **◉ 3D WORKBENCH** to return.
7. Keep the rig empty on load so the build can be shown live.

## 1. 0:00–0:10 — hook

1. Point at the spinning rig.
2. Say: *"Every component here is modelled by hand in code — no asset pack, no downloaded model. Drag to rotate."*
3. Drag the camera once so they see it is live 3D, not a screenshot.

## 2. 0:10–0:25 — assembly

1. In the right tray, click **Install Case Chassis**, then each **Install ...** button in order:
   - Case → Motherboard → CPU → Cooler → RAM → M.2 SSD → PSU → GPU.
2. Point out that only the current step is clickable; later steps are locked. That is the build-order guard.
3. Each install triggers B.O.B. guidance with the reason and the common mistake.

## 3. 0:25–0:40 — POST

1. After the 8th part, POST starts automatically (2.8 s) — or click **Power On & Test POST** in the tray.
2. The celebration modal shows 4 green LEDs: CPU / DRAM / VGA / BOOT.
3. Click **Proceed to Reverse Disassembly Practical**.

## 4. 0:40–0:55 — teardown

1. The rig reloads fully built for teardown.
2. Click **Unmount & Store PCIe GPU** first — reverse order starts with the GPU.
3. Continue clicking the single active **Unmount & Store ...** button through all 8 steps.
4. Say: *"We enforce strict reverse ESD order — only the correct next part can be removed."*

## 5. 0:55–1:10 — payoff

1. The teardown celebration modal appears: **PRACTICAL TEARDOWN COMPLETE**.
2. Click **View Student Profile & Get Certificate →**.
3. Point at the dashboard's module checklist and progress bar.

## 6. 1:10–1:25 — connect it back to learning

1. Close the dashboard.
2. Say: *"The six modules before this exist so the learner knows why each step matters — field facts, a lab-mistake warning, a check question, and a clickable 3D inspection for every topic."*

## 7. 1:25–1:30 — closing line

1. *"The simulator is where theory gets tested: mistakes cost nothing, and the order is enforced."*

## What you can now claim

1. A topic is only marked complete after the learner watches 90% of the lecture **and** passes the topic's quick check.
2. Seeking is locked until 90% is watched — the video cannot be skipped.
3. The certificate requires all 17 topics done, all 7 module assessments passed, and both 3D practicals completed. The locked certificate screen shows all four checks.

## Do not claim

1. Do **not** say the "wrong part" rejection can be shown live.
   - The guard exists in code, but the UI hides non-current parts, so there is no clickable wrong-part moment. Narrate the rule instead.
2. Do **not** promise 5–10 minute videos yet — the current clips are scraped and longer. The watch gate only unlocks after 90% of whatever length is loaded.

## If something fails

1. Video is a YouTube iframe — it may fail on a weak network. The 3D is local and still works.
2. The 3D uses a CDN HDR for lighting; if it looks flat, the scene still renders with the local lights.
3. Two WebGL canvases mount at once (main stage + mini preview). On a slow projector laptop, close other tabs first.
