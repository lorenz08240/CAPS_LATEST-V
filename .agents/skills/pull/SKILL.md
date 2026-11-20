---
name: pull
description: >-
  Use this skill when the user asks to pull changes, types "/pull", or wants to fetch and integrate remote changes from git origin.
---

# Git Pull Workflow (`/pull`)

This skill automates fetching and integrating the latest changes from the remote Git repository into the current branch.

## Workflow Steps

### 1. Check Working Directory State
- Run `git status` to check if there are uncommitted changes or untracked files.
- Run `git branch --show-current` to identify the active branch.
- If there are uncommitted changes that might conflict with incoming updates:
  - Warn the user or safely stash changes: `git stash save "Auto-stash before /pull"` before proceeding, or ask if they prefer to commit first.

### 2. Pull from Remote
- Pull the latest changes for the active branch:
  ```powershell
  git pull origin <branch-name>
  ```
  *(Note: Network access is required. If running in an environment where terminal sandboxing blocks network requests, run with network permissions enabled).*

### 3. Handle Post-Pull Actions
- If `git pull` succeeded:
  - If changes were pulled, inspect the pulled commits: `git log -n 5 --oneline` or `git diff HEAD@{1} HEAD --stat`.
  - Check if dependency files were updated (`package.json`, `package-lock.json` in `frontend/` or `backend/`). If so, remind the user to run `npm install`.
  - If any database dumps or git-tracked data stores (such as `backend/data/team-members.json`) changed, highlight this to the user.
- If already up to date, cleanly inform the user that the branch is synchronized with `origin/<branch-name>`.
- If a merge conflict occurs, report the conflicted files clearly and guide or assist the user in resolving them.
