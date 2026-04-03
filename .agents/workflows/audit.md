---
description: Unified Agent Tool that executes a full code validation process utilizing security, standards, and ui skills
---

# Unified Quality Auditor Workflow (/audit)

As an Antigravity agent:
0. **Memory Sync**: Read `.agents/MEMORY.md`.
1. **Analyze File**: Look at the active file.
2. **Apply Standards Skill**: Load knowledge from `.agents/skills/standards.md`. Assess simplicity and typescript usage.
3. **Apply Security Skill**: Load `.agents/skills/security.md`. Ensure `await auth()` exists if it's backend code.
4. **Apply UI Skill**: Load `.agents/skills/ui-ux.md`. Guarantee no `1px borders` or incorrect colors are utilized.

Output a full, structured audit checklist to the user reporting the gaps and immediately `run_command` lint to ensure no build breaks.
