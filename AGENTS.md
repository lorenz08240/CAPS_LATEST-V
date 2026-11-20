# BuildLab — agent handoff notes

Meta-project: `D:\Capstone Project\BuildLab\CAPS_LATEST-V`. React 19 + Vite frontend in `frontend/`, Express backend in `backend/`, MySQL for most app data. `buildlab_db.sql` is a manually generated dump, not a live database.

## CRITICAL: public "About Us" team content is a git-tracked JSON file

`backend/data/team-members.json` is the **single source of truth** for developer profile cards on `/about` and in the admin panel (`/admin/content`).

- `backend/contentStore.js` reads/writes that file.
- `GET|PUT|POST|DELETE /api/content/team` in `backend/server.js` all use `contentStore`.
- The old `team_members` MySQL table and its seed block were removed from server startup. **Do not reintroduce MySQL as a source for team content.**
- `buildlab_db.sql` still contains a legacy `team_members` INSERT. It is inert — the app ignores it. Do not treat it as current data.

Why: a previous admin photo upload wrote a file to disk and a row in a developer's local MySQL. Git cannot sync either, so `git pull` never delivered the change. The JSON file fixes that — edits now show up in git and travel with a pull.

## Image locations

- Uploaded images: `backend/uploads/profiles/`, served by Express at `/uploads/profiles/...`. Vite proxies `/uploads` to `http://localhost:5000`.
- Static/legacy images: `frontend/public/assets/profiles/`, served at `/assets/profiles/...`.
- `team-members.json` uses **`/uploads/profiles/...`** URLs. Keep new uploads in `backend/uploads/profiles/` and commit those files with the JSON change.
- `POST /api/upload/profile-photo` writes the file; the admin panel then PUTs the returned URL into the JSON store.
- `AboutUs.jsx` still has a hardcoded `TEAM_MEMBERS` fallback with `/assets/profiles/...` paths. It is only used if the API is unreachable, but keep it in sync if you rename those static files.

## Editing team content

Preferred path: use the admin panel at `/admin/content`. All card fields are now editable there: name, designation, codename, role category, badge, photo, highlight, bio, key contributions (one per line), tech stack (comma separated), rig specs (cpu/gpu/ram/storage/chassis), favourite tip, GitHub, LinkedIn and sort order.

After an admin edit, commit both:
1. `backend/data/team-members.json`
2. any new files under `backend/uploads/profiles/`

Then `git push`; teammates get the change with a normal `git pull`. No database dump/import step is needed for team content.

## UI notes

- `AboutUs.jsx` fetches team data once on mount and again on window focus / tab visibility, with a signature check so an unchanged payload does not replay the GSAP card animation.
- `AdminContent.jsx` parses `key_contributions` (newline separated) and `tech_stack` (comma separated) into arrays before saving.

## Still open / not done

- Other MySQL-backed features (learn accounts, admin accounts, parts, logs) still use per-developer local databases and still do not sync through git. Use a shared `DB_HOST` if that matters.
- `buildlab_db.sql` is only refreshed manually; it is not part of any automatic workflow.
- No automated test covers `contentStore.js` yet.
