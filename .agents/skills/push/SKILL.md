---
name: push
description: >-
  Use this skill when the user asks to push changes, types "/push", or wants to stage, commit, and git push all changes to the remote repository.
---

# Git Push Workflow (`/push`)

This skill automates the process of inspecting, staging, committing, and pushing changes to the remote Git repository.

## Workflow Steps

### 1. Inspect Current State
- Run `git status` to see unstaged changes, staged files, and untracked files.
- Run `git branch --show-current` to identify the active branch.
- Check if there are existing unpushed commits: `git log @{u}..HEAD --oneline` (if an upstream tracking branch is set).

### 2. Guardrails & Safety Checks
- Verify that sensitive files (e.g. `.env`, private keys, local credentials) are not inadvertently staged.
- Check whether files match project conventions (e.g. In BuildLab, ensure `backend/data/team-members.json` and any new profile photos under `backend/uploads/profiles/` are included when team content is modified).
- If working tree is completely clean and there are no unpushed commits, report to the user that there is nothing to commit or push.

### 3. Stage Changes
- Stage modified and intended untracked files:
  ```powershell
  git add -A
  ```
- Or stage selectively if specific files or patterns were requested by the user.

### 4. Commit
- If the user provided a commit message in their prompt (e.g. `/push feat: add new feature`), use that message.
- Otherwise, analyze `git diff --cached --stat` to generate a concise, conventional commit message (e.g., `feat(...)`, `fix(...)`, `refactor(...)`, `chore(...)`).
- Run the commit command:
  ```powershell
  git commit -m "<commit message>"
  ```

### 5. Push to Remote
- Push changes to the current branch on the remote:
  ```powershell
  git push origin <branch-name>
  ```
  *(Note: Network access is required for remote communication. If running in a sandboxed terminal that restricts network access, ensure the command runs with network permissions).*

### 6. Verify and Report
- Run `git status` to confirm the working directory is clean and up to date with the remote.
- Provide the user with a concise summary:
  - Branch pushed to (e.g. `origin/main`)
  - Commit hash and message
  - List or summary of modified/added files
