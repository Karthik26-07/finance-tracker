---
description: Validate UI components against FinTrack modern beautiful design system constraints
---

# UI & UX Review Workflow

As an Antigravity agent, when asked to review or generate UI, strictly follow these steps:

0. **Memory Sync (MANDATORY)**: Sync knowledge state by reading `.agents/MEMORY.md` and `docs/modules/00-module-overview.md` first.
1. **Colors & Spacing**:
   - Check if the UI uses the exact Tailwind hex codes or variables declared in the project's `tailwind.config.ts`.
   - Primary: `#003178`, Secondary: `#006b5f`, Tertiary: `#71000c`.
   - Ensure "No 1px borders" rule is followed. Use background color shifts (`bg-transparent` to `bg-slate-50`) instead.
2. **Typography**:
   - Headers should default to `font-manrope`.
   - Data and body should be `font-inter`.
   - Financial amounts must include `tabular-nums`.
3. **Modern Vibe**: 
   - Suggest and implement micro-animations or glassmorphism (`backdrop-blur-md bg-white/50`).
4. **Output**: Give visual feedback detailing what elements deviate from the High-Fidelity UI specifications, and use `multi_replace_file_content` to fix it.
