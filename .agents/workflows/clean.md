---
description: Automatically scan and fix IDE/linter problems, Safari vendor prefixes (-webkit-), and CSS compatibility warnings across frontend components.
---

# /clean Workflow: Automated IDE Problems Cleaner

When the user types `/clean`:
1. **Targeting**: Inspect all errors and warnings listed in the IDE Problems / diagnostics output (`current_problems`). Do not modify unrelated files.
2. **Standard Compatibility Fixes**:
   - **Safari / WebKit prefixes**: Ensure `-webkit-backdrop-filter`, `-webkit-user-select`, `-webkit-sticky`, and `-webkit-appearance` are present for Apple desktop and Safari 9–15 compatibility.
   - **Property Ordering**: Place `-webkit-` vendor prefixes immediately before the unprefixed standard property (e.g., `-webkit-backdrop-filter` first, then `backdrop-filter`).
   - **Missing Standard Properties**: Ensure standard properties like `background-clip: text` accompany vendor-specific ones like `-webkit-background-clip: text`.
   - **HTML Meta Tags**: Ensure HTML documents have valid `<meta name="viewport" content="width=device-width, initial-scale=1.0">`.
3. **Verification**: Run `npm run build` in `frontend/` to ensure zero compilation or syntax errors remain.
4. **Notification**: Send an automated Telegram update via `notify_telegram.py` listing the exact problems cleaned.
