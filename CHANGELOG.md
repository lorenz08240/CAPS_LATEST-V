# BuildLab Changelog

All notable project changes, UI/UX refinements, and compatibility fixes will be documented in this file.

---

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
