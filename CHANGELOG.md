# BuildLab Changelog

All notable project changes, UI/UX refinements, and compatibility fixes will be documented in this file.

---

## [2026-10-23] - Admin Dashboard Syntax Error Fix (Vite Parse Error Resolved)
- **Resolved `[PARSE_ERROR] Unexpected token` in `Admin.jsx`**:
  - OpenCode had appended the confirmation modal JSX after `export default Admin;` at the end of the file instead of inside the component return.
  - Corrected JSX tag hierarchy: nested `{(confirmDelete.show || confirmCrawler) && ...}` inside `.admin-page` container before the component return terminates.
  - Fixed mangled UTF-8 byte sequences for crawler and delete dialog icons with clean emojis (`🕷️` / `🗑️`).
  - Verified clean production build (`npm run build` completed in 2.86s with 0 errors).
  - Synced workspace AST knowledge graph (`graphify update .`).


- **Graph Status & Freshness**: Re-extracted AST symbols and relationship graph across the workspace.
- **Metrics**: 317 nodes, 540 edges, and 22 structural communities across 54 tracked code and document files.
- **Artifacts Refreshed**: Updated `graphify-out/graph.json`, `graphify-out/graph.html`, and `graphify-out/GRAPH_REPORT.md` (0 token/API cost).


- **Progressional Course Restored**: Fully restored the structured curriculum course on `/learn` (4 Modules, 12 Lessons inspired by Udemy / W3Schools) in `CourseShell.jsx` and `CourseShell.css`, mounted directly via `Learn.jsx`.
- **Autoplaying Hero Video Player**:
  - Restored `CourseVideoPlayer.jsx` & `CourseVideoPlayer.css` utilizing YouTube IFrame API.
  - Video player takes front-and-center hero stage with muted autoplay compliant with browser policies, glowing "🔇 Tap to unmute" chip, and custom amber/gold control deck (play/pause, seek scrubber, 10s back/forward, volume slider, fullscreen).
  - Fixed media layout in `renderArticleLesson` and `renderComponentLesson`: video comes first and autoplays immediately; blueprint visuals and hardware specimen cards sit side-by-side as sleek companions rather than stacking vertically or pushing the video down.
- **Mouse-Hover Triggered Syllabus Rail**:
  - Right sidebar course outline defaults to unpinned (`isPinned: false`).
  - Added 24px invisible edge trigger zone (`.course-sidebar-trigger-zone`) and pull-tab indicator (`‹`) on the right screen edge.
  - Sidebar glides in smoothly on mouse hover, and glides away on mouse leave. User can click the pin icon to dock it.
- **Double Scrollbar Elimination**:
  - App-level viewport lock in `App.css` (`.app-layout:has(.course-shell-root)`) ensures only the main course lesson column (`.course-main`) scrolls, eliminating duplicate scrollbars.
  - Suppressed outer global footer on `/learn` in `App.jsx`.
- **Production Build Verified**:
  - Ran `npm run build` with zero errors (all 1031 modules transformed cleanly).


- **Original Cinematic UI Restored**: Purged the flat course article shell and restored the authentic 7-card interactive Learn experience (Key Specs, Socket Matcher & Naming Decoder, Step-by-Step Installation Film, Hardware Knowledge Check & Common Mistakes, Recommendation Matrix, Popular Manufacturers, and Action Bar).
- **1000x Upgraded Cinematic Hero Banner**:
  - Curated, high-fidelity, high-contrast hardware imagery for CPU, Motherboard, RAM, GPU, PSU, and Case.
  - Added interactive **Hardware Matrix Quick-Switcher Dock** directly in the hero banner with component icons and active neon indicators.
  - Added floating **Cyberpunk Spec HUD Card** displaying real-time flagship architecture metrics (e.g. Sockets, Boost Clock, Core scale, TDP).
  - Enhanced ambient color glow tailored to each component (emerald, cyber gold, RGB violet, neon teal, electric amber, ice blue).
  - Quick action CTAs ("Explore Specs ↓" and "Installation Guide ›") with micro-interactions.
- **Mouse Hover Triggered Sidebar**:
  - Re-activated mouse-hover triggering on the main left sidebar (`Navbar.jsx` / `Navbar.css`) with widened 24px edge trigger zone and smooth glide transitions.
  - Cleaned up viewport locks in `App.css` to allow natural, smooth page scrolling.

## [2026-10-23] - Symmetrical Dual-Sidebar Architecture & Course Outline Fix (Learn Page)
- **Viewport Lock & Double Scrollbar Fix**: Locked `.course-shell-root` into 100vh viewport height in `App.css` and suppressed global `Footer` on `/learn`. Lesson content now scrolls independently within `.course-main` using a single custom amber-themed scrollbar, completely eliminating duplicate/overlapping scrollbars.
- **Fixed Docking (Never Leaves the Screen)**: Converted the right sidebar (`.course-outline`) from `position: sticky` to `position: fixed` (100vh height, `top: 0; right: 0; bottom: 0`). When scrolling lesson content, the sidebar remains anchored and accessible at all times.
- **Visual & Structural Mirroring to Main Left Sidebar**:
  - Styled with identical rich mahogany wood gradient, warm amber borders (`#d4a34b`), and `.sidebar-wood-overlay` grain texture.
  - Added header with pin button (`sidebar-pin-btn`) that toggles locked/pinned and unpinned/auto-hide states, persisted in `localStorage`.
  - Added hidden trigger zone (`course-sidebar-trigger-zone`) and pull-tab indicator arrow (`‹`) on the right edge when unpinned.
  - Added full light theme support matching the left sidebar's warm birch / natural oak palette.

## [2026-10-23] - Server Deployment (/deploy)
- **Backend Service**: Started Express API on port 5000 via 
ode server.js daemon.
- **Frontend Service**: Confirmed Vite client server listening on port 5173.
- **Production Build**: Verified clean production build compilation via ite build.


## [2026-10-23] - OpenCode Session - Immersive Fullscreen System & UX Cleanups (OC)

### 🖥️ Fullscreen Gate (New Feature)
- **New Utility** `frontend/src/utilities/fullscreen.js`: cross-browser fullscreen helpers (webkit/ms prefixes), session engagement tracking via `sessionStorage`, portrait/coarse-pointer detection.
- **New Component** `frontend/src/components/FullscreenGate/` (`FullscreenGate.jsx` + `.css`):
  - ⤢ "Return to Full Screen" overlay re-prompts when the user exits fullscreen (Esc) after engaging.
  - 📱 "Rotate Your Device" overlay for portrait phones/tablets (touch devices only, never desktop).
  - Never traps unsupported browsers (iPhone Safari has no Fullscreen API).
  - Dark neon aesthetic + light theme variant; z-index 10000; scroll lock while shown.

### 🏠 Home & Build Consolidation
- **START BUILDING NOW** (`Home.jsx`) now requests fullscreen inline (user gesture), plays `open_box`, then fades the banner.
- **Dismissal Bridge**: `Navbar.jsx` dispatches `buildlab:enter-build`; `Home.jsx` listens and runs the same banner-dismiss logic.
- **Sidebar**: "Home" removed; "Build" is now the home entry → navigates to `/`, requests fullscreen, dismisses banner, scrolls to top.
- **"Why Build Your Own PC?" section removed** from both `Home.jsx` and `Build.jsx` (standalone `/build` copy), plus dead code cleanup (`useNavigate`, `useElementOnScreen`, card refs).

### 🧊 3D Builder (`/3d-builder`)
- **LIGHTS trio removed**: Cyber/Clean/Dark buttons deleted from the RGB Aura toolbar (caused toolbar overlap); cyber theme hardcoded (background `#0a0e17`, ambient 1.2, key light 2.5, Environment `night`); dead `.studio`/`.stealth` CSS purged.
- **Overlap Prevention**: `.aesthetics-hud` gets `flex-wrap: wrap; max-width: calc(100vw - 3rem)`.
- **Fullscreen Lock**: PCBuilder3D wrapped in `FullscreenGate requireFullscreen`.
- **In-App Confirm Dialog**: 🗑 Disassemble no longer uses native `window.confirm` (it broke fullscreen); new `.builder-confirm-overlay` panel ("Keep Building" / "Yes, Disassemble") with install sound + toast on confirm.

### 🤖 Integrations
- **OC Telegram Updates**: OpenCode now dispatches "OC Updates" notifications via `notify_telegram.py` on every completed turn; honors "Lock" → `Code Red` trigger rule.

### 🔧 3D Drawer UI Optimization (PCBuilder3D.css)
- **Responsive Drawer**: `.hardware-drawer` width now `clamp(360px, 34vw, 530px)` with `min-width` — the catalog panel no longer gets crushed at smaller window sizes (root cause of the screenshot overlap).
- **Stage Rail**: width `clamp(140px, 12vw, 175px)`, tighter padding, `flex-shrink: 0`.
- **Stage Names**: two-line clamp replaces 1-line ellipsis — no more "CPU (Process…", "Power Suppli…" truncation; badge indicator never overlaps.
- **Panel Header**: `flex-wrap` so the "N Models Available" badge reflows instead of colliding with the stage title; badge is nowrap.
- **Catalog Cards**: thumb resized 66→58px; "✓ INSTALLED" / "⚠️ MISMATCH" chips converted to full-width thumb ribbons (can no longer spill onto brand/name text); card names get a two-line clamp; meta tags and compatibility notes ellipsized; action buttons nowrap.

### 🧱 Build Page — Viewport-Fitted Workspace (Build.jsx / Build.css / App.jsx)
- **"RIG CONFIGURATION SLOTS" removed** from the Build Overview empty state (redundant with the left Build Steps checklist) plus dead `.build-slots-mini` JSX and the empty `.build-station-header` div.
- **Footer suppressed on `/build` only** (`App.jsx` conditional) so the build page never scrolls.
- **New `.build-page.standalone` viewport-fit layout** (Build.css):
  - Page locked to `100dvh`, `overflow: hidden` — one screen, no page scroll.
  - `.build-main` becomes a stretched grid row (`grid-template-rows: minmax(0, 1fr)`) so the right content panel and left sidebar are **forced to the same steady height**.
  - Build Steps card stays natural-height; Selected Components card absorbs remaining space with internal scroll.
  - Components grid + Specifications panel drop their fixed min/max caps and fill/stretch with internal scrolling instead.
  - Integrated Home variant untouched (normal flow preserved).
- Added `@media (max-width: 1250px)` narrower sidebar column for smaller desktops.

### 🧱 Build Page Round 2 (OC)
- **Footer now suppressed on BOTH `/` (Home, which hosts the Component Picker) and `/build`** — the user saw the footer persist because the station lives inside the Home page.
- **Per-card "SELECT PART" / "✓ SELECTED" buttons removed** from the components grid — cards are click-to-inspect, and selection happens via the right panel's SELECT COMPONENT button (single source of action).
- Added green **"✓ SELECTED"** corner tag chip on already-picked cards (`.card-installed-tag`).

### 🎬 Page Transition Animations (OC)
- **Installed `motion` (framer-motion) v14.6.0** in `frontend/`.
- **New `frontend/src/utilities/pageTransitions.jsx`**: per-route `MotionPage` wrapper with route-specific choreography.
- **`App.jsx`**: `<Routes>` now sits inside `<AnimatePresence mode="wait">` keyed by `location.pathname`, each route element wrapped in `MotionPage`.
- **Choreography**:
  - **Build ↔ Compatibility**: full vertical move — outgoing page slides DOWN 22vh out while Compatibility slides down into place from the top (reverse: Compatibility slides down out).
  - Home / Brands / Learn: fall-into-place rise + fade.
  - 3D Studio / Admin: quiet opacity-only (keeps heavy canvases snappy).
  - /build: subtle rise in, slides down out.
- Note: transforms during transitions can temporarily affect child `position: fixed/sticky`; transforms clear to `none` at rest, so overlays/sticky behave normally after settling.

### ✨ ~~Staggered Scroll-Reveal Animations for Page Containers~~ — REVERTED (OC)
- Shipped then **fully reverted by user decision** shortly after (bit too showy). `reveal.jsx` deleted; Home, Build, Compatibility, Brands, Learn restored to pre-reveal structure. Page transitions (AnimatePresence) remain in place.

---

## [2026-10-23] - Master Checklist & Safari Compatibility Updates

### 🛠️ Build & Home Page
- **Section Renaming**: Changed "Active Build Station" to **"Pick a Component"** in `Home.jsx`.
- **Session Reset**: Migrated `buildlab_current_build` from permanent `localStorage` to `sessionStorage` in `BuildContext.jsx`. Closing the browser or frontend tab now automatically resets selected parts to empty.
- **Initial Warnings Suppressed**: Updated `Build.jsx` and `compatibilityEngine.js` so compatibility checks and warnings remain silent on initial page load until dependent parts are actively chosen.
- **Non-Scrollable Containers**: Removed `max-height` and inner scrolling (`overflow-y: auto`) from `.selected-components`, `.components-grid-wrapper`, and `.specifications-panel` in `Build.css`, allowing natural page flow.
- **Learn Page Leads**: Connected the "Why Build Your Own PC" section benefit cards and added a dedicated CTA button (`🎓 Explore All Hardware Lessons in Learn →`) in `Home.jsx` directing students to `/learn`.

### 📚 Learn Page
- **Local Assets Replacement**: Replaced external Unsplash URLs for CPU, Motherboard, RAM, GPU, PSU, and Case with locally saved workspace assets in `Learn.jsx`.
- **Right-Hand Step Video Player**: Added `.installation-step-preview-container` next to the Step-by-Step Installation stack in `Learn.jsx` & `Learn.css`:
  - Autoplays in a continuous muted loop with no distracting native player controls (`controls=0`).
  - Added custom floating **Play / Pause** toggle button.
  - Added direct quick YouTube tutorial link for full video walkthroughs.

### 🛡️ Admin Panel
- **Sidebar Disabled on Admin**: Updated `Navbar.jsx` to return `null` on `/admin` routes.
- **Back to Component Picker**: Updated header button to **"← Back to Component Picker"**, routing directly to the 2D build station.
- **Demo Parts Trimmed**: Removed over 160 lines of deprecated and bloated mock components (`DEPRECATED_SCRAPED`) in `Admin.jsx`.

### 🧊 3D Builder & Design Aesthetic
- **Cozy Mahogany Wood Palette**: Replaced electric neon cyan with warm amber/gold (`#d4a34b`, `#f7d28b`), dark mahogany wood, and clean matte slate in `PCBuilder3D.css`.
- **Overlap Prevention**: Cleaned up floating HUD toolbar spacing (Camera, Lighting, and Tool pills) to prevent collisions with the component drawer and inspector popups.
- **Global Light & Dark Modes**: Defined full design system variables in `index.css` for both `[data-theme="dark"]` and `[data-theme="light"]`.

### 🍏 Apple & Safari Compatibility
- **Vendor Prefixes**: Added `-webkit-backdrop-filter` preceding `backdrop-filter`, `-webkit-user-select: none`, and `-webkit-scrollbar` rules across `Home.css`, `Admin.css`, `PCBuilder3D.css`, and `graphify-out/graph.html`.
- **Custom /clean Command**: Created `.agents/workflows/clean.md` for rapid one-command linter and vendor prefix fixes.
- **Sofie Telegram Listener**: Activated background listener daemon (`.agents/bot_listener.py`) with workspace root path fixes.

---

## [2026-10-23 03:34] - /clean Linter & Safari Prefix Fixes
- **Build.css**:
  - Reordered -webkit-backdrop-filter before ackdrop-filter across .sidebar-card (L143), .build-content (L418), .component-card.compact-card (L749), .specifications-panel (L818), and .benefit-card (L984).
  - Resolved min-height: auto warning on .home-integrated-section .build-page by switching to min-height: 0 !important;.
- **Verification**: 
pm run build completed with 0 errors.

---

## [2026-10-23 03:54] - Build Layout Stability, Dynamic Category Filters & Price Removal

### 🧱 Layout & Container Scrolling Fixes (`scrolling.mp4`)
- **Stretching Bug Resolved (`humahaba sya nang humahaba`)**:
  - Fixed root cause where `.selected-components` without a height limit stretched the entire `.build-sidebar` card with every component added.
  - Added `align-items: start` to `.build-main` grid layout to prevent the left sidebar and right content panel from forcing each other to stretch vertically.
  - Constrained `.selected-components` to `max-height: 260px; overflow-y: auto;` with slim scrollbar styling, keeping the sidebar firmly bounded (~720px total) regardless of the number of selected parts.
  - Synchronized `.components-grid-wrapper` and `.specifications-panel` to matching stable dimensions (`min-height: 580px; max-height: 660px; overflow-y: auto;`), ensuring a perfectly level, responsive layout.

### 🏷️ Dynamic Context-Aware Component Filters (Replaced Static Tiers)
- **Eliminated Static Budget/Mid-Range/High-End Tiers**: Replaced static price-derived tiers with category-specific hardware filters that dynamically change depending on what makes components in that category distinct:
  - **PC Case**: `[ ALL ]`, `[ Mid Tower ]`, `[ Full Tower ]`, `[ Micro-ATX ]`
  - **Motherboard**: `[ ALL ]`, `[ AM5 ]`, `[ LGA1700 ]`, `[ AM4 ]`, `[ DDR5 ]`, `[ DDR4 ]`, `[ ATX ]`, `[ mATX ]`
  - **CPU**: `[ ALL ]`, `[ AM5 ]`, `[ LGA1700 ]`, `[ AM4 ]`, `[ Intel ]`, `[ AMD ]`
  - **RAM**: `[ ALL ]`, `[ DDR5 ]`, `[ DDR4 ]`, `[ 16GB ]`, `[ 32GB ]`
  - **Storage**: `[ ALL ]`, `[ NVMe M.2 ]`, `[ SATA SSD ]`, `[ 512GB ]`, `[ 1TB ]`, `[ 2TB+ ]`
  - **GPU**: `[ ALL ]`, `[ NVIDIA RTX ]`, `[ AMD Radeon ]`, `[ 12GB+ VRAM ]`
  - **PSU**: `[ ALL ]`, `[ 500W - 650W ]`, `[ 750W - 850W+ ]`, `[ 80+ Gold / Plat ]`, `[ Modular ]`
- Auto-resets filter to `ALL` upon switching build steps.

### 📊 Revamped Empty Specifications State (`BUILD OVERVIEW`)
- Replaced the blank state ("Select a component to view its specifications") with an interactive rig overview:
  - **Total of Selected Components**: Shows real-time count `X / 7` with a gradient visual progress bar and completion caption.
  - **Next Step Guide**: Prompts the user with `CURRENT STEP: [CATEGORY]` and instructions on what to pick next.
  - **Rig Configuration Slots**: Interactive 7-slot checklist showing each component's picked status or "Not selected yet", with 1-click step switching.
  - **Live Compatibility Indicator**: Real-time status badge verifying pin & wattage compatibility.

### 💰 Complete Removal of Prices Globally
- Purged `TOTAL COST` (`scores.totalCostFormatted`) badge and divider from the 3D Studio HUD header in `PCBuilder3D.jsx`.
- Confirmed zero prices displayed anywhere across the 2D Build Station and 3D Studio.

---

## [2026-10-23 04:52] - Scrolling Elimination, Red Warning Removal & Redundancy Fix

### 🚫 Complete Removal of Red Warning Highlights & Tooltips
- Removed `!isCompatible ? "incompatible" : ""` class, red borders, and red hover glow from component cards in `Build.jsx` and `Build.css`.
- Removed `<div className="incompatible-tooltip">⚠️ {reason}</div>` callout boxes from cards in the component picker grid.
- Removed `<div className="incompatible-warning">⚠️ {reason}</div>` from the specifications panel. All compatibility error checking is preserved for the dedicated `/compatibility` page.

### 🧹 Redundancy Fixed: Single-Card Left Sidebar
- Removed the redundant second card (`Selected Components`) from `.build-sidebar`.
- Enriched `Build Steps` items:
  - When a component is selected, the step title shows a green checkmark `✓` and the picked hardware name (e.g., `NZXT H9 Flow Dual-Chamber`).
  - Added a mini `✕` remove button directly on each completed step item to quickly swap or clear parts.
  - Added a progress counter badge `X / 7` to the sidebar header.

### 🖱️ Direct 1-Click Card Selection & Top Action Button (Zero Scrolling Suffering)
- **Direct Card Button**: Added a dedicated `[ SELECT PART ]` / `[ ✓ SELECTED ]` button directly on every component card in the grid. Users can select any component instantly with 1 click without glancing at or scrolling to the bottom right.
- **Top Action Button in Specs**: Moved `SELECT COMPONENT` to `.spec-action-top` directly below the component image and title, ensuring it is always immediately visible above the fold.
- **Compact Viewport Fitting**: Compacted grid wrapper and specifications panel (`min-height: 480px; max-height: 560px; overflow-y: auto;`) and anchored auto-scrolling so the view never throws users out of position.

## [2026-10-23] Learn Page: Video Player Overhaul + 9 Dead Videos Replaced (OC)

### Fixed / Added — `components/Learn/CourseVideoPlayer.jsx` + `CourseVideoPlayer.css` (new)
- **Real video player** built on the YouTube IFrame API replaces the three raw iframes (article lesson video, component lesson video, assembly step-demonstration).
- **Autoplay kept** — starts muted (browser autoplay policy); floating "🔇 Tap to unmute" chip + mute toggle give full audio with one click.
- **Custom control deck** (gold/mahogany, scoped `.cvp-*` classes, standalone CSS = no clash with the other agent's CourseShell.css work): play/pause, ⏪ -10s / ⏩ +10s rewind & forward, click/drag scrub bar with gold knob + timecode, mute toggle, fullscreen (targets the player shell so controls stay visible in fullscreen; double-click video also toggles).
- Root cause of "can't control the video": old iframes had `pointer-events: none` (CourseShell.css/Learn.css) — native controls were un-clickable; fullscreen was impossible without `allowfullscreen`.
- **Optimization**: removed the `key={...isPlaying}` iframe remount hack — play/pause/seek go through the API so the video never reloads; step-film no longer reloads when clicking steps; removed redundant Pause buttons + orphaned `isPlaying` state.

### Replaced — 9 unavailable YouTube videos (all new IDs verified 200 via oEmbed, embeddable)
- Articles (CourseShell.jsx): How the Parts Talk → "Explaining PCIe Slots" (ExplainingComputers, `PrXwe21biJo`); Purpose & Budget → "How to Pick PC Parts in 2026" (`x7tAAr2fcMw`); First Boot → "How to Fix a PC That Won't Boot" (`XzgPUozaiKU`).
- Components (Learn.jsx data): CPU → Branch Education "How do CPUs Work?" (`16zrEPOsIcI`); Motherboard → PowerCert "Motherboards Explained" (`b2pd3Y6aBag`); RAM → Branch Education "How does Computer Memory Work?" (`7J7X7aZvMXQ`); GPU → Branch Education "How do Graphics Cards Work?" (`h9Z4oGN89MU`); PSU → "How a Power Supply ACTUALLY works" (`ot9lIXsRXzo`); Case → JayzTwoCents "How to optimize your case airflow!" (`Ba6w3QdnWBw`).
- 3 previously-live videos untouched: Computer parts Explained, Bitwit step-by-step, LTT last guide.
- Build passes; /learn serves 200.
## [2026-10-23] Learn: Course-Outline Sidebar REWORK REVERTED to the previous design (OC — user request)

### Reverted
- The other agent's in-progress "course sidebar" rework (hover/pin architecture with `isVisible`/`isHovered`/`isPinned`, pin-icon header button, wood overlay) crashed the page twice (`ReferenceError: isVisible is not defined`) and, per user, didn't match the approved design. Removed all of it including the OC hotfix declarations that had only triangulated their missing states.
- Restored the previous rail behavior exactly to the surviving CourseShell.css contract: fixed 320px right rail (`.course-outline open/closed`, translate 320ms), opens by default on ≥960px, drawer + click-outside backdrop on ≤960px, right-edge nudge strip + `‹` pull-tab to reopen, `goLesson` auto-closes on mobile.
- Content shift uses the pre-existing `.course-shell.right-pinned .course-main { margin-right: 320px }` rule (mobile: 0) — shell now toggles `right-pinned` instead of the never-styled `outline-open`.
- Header back to eyebrow/title only + a small ghost gold `✕` collapse button (new minimal `.outline-collapse-btn` styles appended at CSS end; desktop keeps backdrop non-dimming via ≥960px media rule).
- Untouched: progress card, module/lesson list, continue foot, video gating, and the earlier video-player overhaul (CourseVideoPlayer stays).
- Build passes; /learn 200.

## [2026-10-23] UI Interaction Sounds Restored & Centralized (`soundManager.js`)

### 🔊 Root Cause Identified & Resolved
- Sound files (`click.wav`, `install.wav`, `snap.wav`, `complete.wav`, `error.wav`, `modal_open.wav`, `modal_close.wav`, `open_box.wav`, `warning.wav`, `hint.wav`) were present in `frontend/public/sfx/` and partially managed in `soundManager.js`, but were **never hooked up globally** to UI buttons, links, or builder workflows.
- `PCBuilder3D.jsx` was duplicating audio with local `new Audio` instances instead of utilizing `soundManager`.
- `Build.jsx` (2D Component Picker), `CourseShell.jsx` (Learn page), and `Navbar.jsx` were completely silent.

### ⚡ Upgrades to `frontend/src/utilities/soundManager.js`
1. **Procedural Web Audio API Synthesis Fallback**: Added `SynthAudio` oscillator engine producing zero-latency clicks, magnetic snaps, mechanical locks, modal chimes, and victory chords. Guarantees sounds never fail even under browser autoplay blocking or offline mode.
2. **Zero-Latency Audio Pooling**: Audio files are preloaded and pooled (up to 4 clones per sound) to eliminate playback stutter and garbage collection pauses.
3. **Automated Global UI Click Listener**: Attached delegated click listener on `document` targeting all `button`, `a`, `[role="button"]`, `[role="tab"]`, `.clickable`, `.nav-link`, `.btn`, and card elements with 45ms anti-spam debouncing and `data-no-sound="true"` / `data-sound="<type>"` overrides.
4. **Local Storage Persistence**: Persists mute/volume settings in `buildlab_sound_enabled` and `buildlab_sound_volume`.

### 🎮 Wired Semantic Audio Events Across Workspaces
- **Build (`Build.jsx`)**:
  - `soundManager.install()` on choosing & confirming any PC component.
  - `soundManager.snap()` on card previews.
  - `soundManager.click()` on step navigation & component removal (`✕`).
  - `soundManager.complete()` on completing all 7 rig slots.
  - `soundManager.modalClose()` on rig reset.
- **Learn (`CourseShell.jsx`)**:
  - `soundManager.click()` on lesson row selections.
  - `soundManager.snap()` on video watched toggles.
  - `soundManager.complete()` on lesson completion & correct quiz answers.
  - `soundManager.error()` on wrong quiz answers.
  - `soundManager.install()` on "Add to Build" hardware transfer.
- **3D Studio (`PCBuilder3D.jsx`)**:
  - Refactored to use centralized `soundManager` instance.
  - Synced top HUD SFX toggle button (`🔊 / 🔇`) with `soundManager.toggleSound()`.
- **Navbar (`Navbar.jsx`)**:
  - Added dedicated Sound FX toggle switch (`🔊 Sound FX / 🔇 SFX Muted`) in the sidebar footer controls.
- Tested and verified: `npm run build` cleanly compiled with 0 errors.

## [2026-10-23] 3D Studio: Clean Button Design (Icons & Emojis Removed)

### 🧹 Cleaned Button Typography in `frontend/src/components/3D/PCBuilder3D.jsx`
- **Top HUD Header Bar**:
  - `⚡ Load Demo Rig` → `Load Demo Rig`
  - `🛡️ Compatibility` → `Compatibility`
  - `🗑 Disassemble` → `Disassemble`
- **Camera Preset Toolbar (`CAMERA`)**:
  - `🏠 Whole Rig` → `Whole Rig`
  - `📐 Iso` → `Iso`
  - `🔍 Inside` → `Inside`
  - `🎮 GPU` → `GPU`
  - `🚪 Front` → `Front`
  - `⬆️ Top` → `Top`
  - `⏸️ Stop Spin / 🔄 Auto-Rotate` → `Stop Spin / Auto-Rotate`
- **Side Panel Toolbar (`SIDE PANEL`)**:
  - `🪟 Closed` → `Closed`
  - `📂 Open` → `Open`
  - `✕ Off` → `Off`
  - `💥 Exploded View` → `Exploded View`
- **Component Inspector Panel Actions**:
  - `🎯 Focus Camera` → `Focus Camera`
  - `🔄 Swap Part` → `Swap Part`
  - `🗑 Remove` → `Remove`
- **Drawer Card Actions**:
  - `+ Install in 3D` → `Install in 3D`
  - `✕ Uninstall` → `Uninstall`
- Verified: production build clean, 0 compiler warnings/errors.

## [2026-10-23] Compatibility Checker SFX & Cute Sound Effects Update

### 🔔 New & Updated Sound Effects (`frontend/public/sfx`)
- **Compatibility Alert / Denied**: Integrated `UI_Denied_2.mp3` and `denied.mp3` for cute, clear issue notifications.
- **Granted / Compatible Chime**: Added `granted.wav` (clean, sparkling 4-tone celesta chime: C6-E6-G6-C7) for successful, issue-free builds.
- **UI Error & Interactivity**: Added `Error1.mp3`, `Error2.mp3`, `Error3.mp3`, and `UI_Interact.mp3` for cute tactical interaction feedback.
- **Restored**: Preserved `complete.wav`, `click.wav`, `snap.wav`, `install.wav`, and modal sound effects.

### ⚡ Centralized Manager Enhancements (`soundManager.js`)
- **Multi-Format Resolution**: Upgraded `SOUND_SOURCE_MAP` to automatically handle both `.mp3` and `.wav` assets with fallbacks.
- **Procedural Synthesizer Fallbacks**: Added cute procedural Web Audio oscillators for `denied` (gentle 2-tone descending bonk) and `granted` (glockenspiel arpeggio) ensuring sounds always play reliably offline or under browser autoplay policies.
- **New Methods**: Added `soundManager.denied()`, `soundManager.granted()`, and `soundManager.interact()`.

### 🛡️ Compatibility Checker Integration (`Compatibility.jsx`)
- **Auto-Detection on Page Entry**: Added an entry hook in `Compatibility.jsx`:
  - If compatibility issues are detected in the active build, triggers `soundManager.denied()`.
  - If all components are compatible (0 issues), triggers `soundManager.granted()`.
- **Snapshot Save Feedback**: `handleSave` triggers `soundManager.granted()` when saving a rig slot.
- **Build Page Link**: Clicking "Check Compatibility" in `Build.jsx` fires responsive click audio before transition.
- Build verified (0 errors); knowledge graph updated with 348 nodes & 609 edges.

## [2026-10-23] Fullscreen Requirement Enabled for Compatibility & Learn

### 🖥️ Fullscreen Gating (`FullscreenGate.jsx`)
- **Compatibility Page (`Compatibility.jsx`)**: Wrapped standalone route with `<FullscreenGate requireFullscreen>` while maintaining clean non-gated embedding when used with `isIntegrated`.
- **Learn Page (`Learn.jsx`)**: Wrapped `CourseShell` with `<FullscreenGate requireFullscreen>` across all course and lesson deep-dive routes (`/learn` and `/learn/:componentId`).
- **Dynamic Contextual Messaging**: `FullscreenGate` now dynamically adapts its prompt between initial entry ("Enter Full Screen" / "BuildLab is designed as an immersive hardware workstation...") and mid-session recovery ("Return to Full Screen" / "You left full screen mode...").
- **Auditory Engagement**: Added `soundManager.granted()` chime when the user clicks the "ENTER FULL SCREEN" button.
- **Layout Cleanup (`App.jsx`)**: Suppressed global footer on immersive fullscreen workspaces (`/compatibility`, `/learn`, `/3d-builder`, `/build`).
- Verified: production build clean (0 errors); knowledge graph updated to 352 nodes & 620 edges.

## [2026-10-23] Learn Page: NotebookLLM Master Source Script for Module 1

### 📚 Generated Educational Master Script (`Module_1_NotebookLLM_Source.md`)
- Extracted and enriched the full curriculum from `CourseShell.jsx` (Module 1: Computer Fundamentals) into a dedicated NotebookLLM source guide.
- **Structured Sections**:
  1. **Executive Summary & Learning Goals**: Clear objectives for student understanding.
  2. **Lesson 1 — Components of a Computer**: Input-Processing-Output loop, Core Four (CPU, RAM, Storage, Motherboard), and Supporting Cast (PSU, GPU, Case/Cooling, Peripherals).
  3. **The Workshop Analogy & Myth Busting**: Explains why more RAM provides more workspace without artificially accelerating raw CPU compute speed.
  4. **Lesson 2 — How the Parts Talk**: Data buses, PCIe bandwidth scaling (PCIe 3.0/4.0/5.0), and why hardware generations (AM4 vs. AM5, DDR4 vs. DDR5) are mechanically and electrically keyed.
  5. **Assembly Safety Rule**: "If it needs force to seat, STOP" — zero-insertion force CPU seating vs. RAM latch clicks.
  6. **Self-Check Quizzes with Explanations**: Memory volatility, bottleneck identification, and socket keying.
  7. **NotebookLLM Audio Overview Prompts**: Structured dialogue hooks and narrative threads tailored for NotebookLLM's two-host deep dive podcast.
- Saved to [Module_1_NotebookLLM_Source.md](file:///d:/Capstone%20Project/BuildLab/CAPS_LATEST-V/Module_1_NotebookLLM_Source.md) and [docs/Module_1_NotebookLLM_Source.md](file:///d:/Capstone%20Project/BuildLab/CAPS_LATEST-V/docs/Module_1_NotebookLLM_Source.md).

### 🎙️ Pure Native Text Format Optimization for NotebookLLM
- Converted all sections into pure flowing conversational English prose.
- Removed all markdown tables (`|`) to eliminate unnatural tabular reading artifacts in AI text-to-speech.
- Stripped all asterisks (`*`) and bold/bullet syntax that cause pauses, mispronunciations, or token glitches in NotebookLLM's audio generation models.
- Verified 0 asterisks and 0 pipe symbols across both copies ([Module_1_NotebookLLM_Source.md](file:///d:/Capstone%20Project/BuildLab/CAPS_LATEST-V/Module_1_NotebookLLM_Source.md) and [docs/Module_1_NotebookLLM_Source.md](file:///d:/Capstone%20Project/BuildLab/CAPS_LATEST-V/docs/Module_1_NotebookLLM_Source.md)).