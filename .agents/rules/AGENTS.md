# Workspace Rules & Instructions

## Mandatory Automated Telegram Notifications
For every single user prompt and task:
1. **AUTOMATIC UPDATES ON EVERY TURN:**
   - Whenever you complete a task, edit code, run checks, debug an issue, or formulate an answer, you MUST send an immediate notification to the user's Telegram.
   - **Do NOT wait** for the user to ask, prompt, or remind you to notify them. It is an automatic, mandatory step on every turn.
2. **Notification Execution:**
   - Execute the following command right before or when finalizing your response:
     ```powershell
     & "d:\Capstone Project\BuildLab\CAPS_LATEST-V\.venv\Scripts\python.exe" "d:\Capstone Project\BuildLab\CAPS_LATEST-V\notify_telegram.py" "<Summary of changes/answer>"
     ```
   - Keep the summary clean, informative, and formatted with bullet points or emojis.

## Custom Trigger Commands
- **Lock Command**: Whenever the user says "Lock", immediately send a Telegram notification containing exact text `Code Red` to trigger the user's phone lockout routine.
- **Help / Commands**: Whenever the user types `/?` or `/commands`, immediately output the BuildLab custom commands cheat sheet table.

## Response Length & Changelog Rule
- **No Long Chat Outputs**: Keep chat responses short and concise to save token usage. Never output long detailed paragraphs in chat.
- **Maintain `CHANGELOG.md`**: Whenever a task or batch of edits is completed, append the details to `[CHANGELOG.md](file:///d:/Capstone%20Project/BuildLab/CAPS_LATEST-V/CHANGELOG.md)` at the workspace root.
- **Concise Chat Summary**: In chat, output only a brief 2-3 line summary and link the user to `CHANGELOG.md`.
