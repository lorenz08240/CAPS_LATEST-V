---
description: List all available BuildLab custom commands, workflows, and shortcuts
---

# BuildLab Commands & Workflows Cheat Sheet

Whenever the user runs `/commands` or `/?`, output this concise table of commands:

| Command / Trigger | Category | Description |
| :--- | :--- | :--- |
| `/?` or `/commands` | **Help** | Displays this comprehensive list of all custom workspace commands & shortcuts. |
| `/clean` | **Linter & Apple** | Scans and fixes IDE/linter problems, Safari vendor prefixes (`-webkit-`), and CSS compatibility warnings across frontend components. |
| `/notes` | **Git & Personal** | Quick personal notes, Git sync commands (`git add`, `commit`, `pull`, `push`), and references. |
| `/graphify` | **Knowledge Graph** | Explores codebase architecture, component dependencies, and graphify knowledge graph. |
| `Lock` | **Security / Phone** | Emergency lock command that immediately triggers the `Code Red` notification to the user's phone lockout routine. |
| `/goal` | **System Flow** | Deep execution mode for long-running, multi-step tasks. |
| `/plan` | **System Flow** | Structured step-by-step planning mode before making major code modifications. |

---

### Quick Git Workflow (from `/notes`):
```bash
git add .
git commit -m "JAY UPDATES"
git pull origin main
git push origin main
```

