# Immediate Telegram Notification Rule

## Behavior Requirement
- **Always Notify Telegram Automatically:**
  You must dispatch an update notification to the user's Telegram whenever you conclude a response, implement code changes, resolve questions, or perform checks.
- **Never wait for prompts or reminders:**
  The user must never have to ask "notify me on telegram".
- **Dispatch Command:**
  ```powershell
  & "d:\Capstone Project\BuildLab\CAPS_LATEST-V\.venv\Scripts\python.exe" "d:\Capstone Project\BuildLab\CAPS_LATEST-V\notify_telegram.py" "<Summary of changes or findings>"
  ```
