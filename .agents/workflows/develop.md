---
description: Build a new feature or component adhering strictly to project architectural guidelines
---

# Developer Workflow (/develop)

As an Antigravity agent, when asked to build or write code for a feature, strictly follow these steps:

1. **Memory Sync (MANDATORY)**: First, read `.agents/MEMORY.md` and `docs/modules/00-module-overview.md` to understand the current project state. Determine which module the feature belongs to, and only read that specific module's documentation (e.g., `docs/modules/03-m3-transactions.md`).
2. **Review DB Schema**: If the feature requires data persistence, use `view_file` to read `docs/02-database-schema.md` or the corresponding Drizzle schema in `lib/db/`.
3. **Plan & Build**: 
   - Write the Server Action (`actions/`) or Route Handler (`app/api/`).
   - Create the necessary UI Components in `components/`.
   - Update the respective Next.js Pages in `app/(dashboard)/`.
4. **Enforce Standards**: Ensure code matches the codebase style (strict TypeScript, Zod validations, no `any`).
5. **Update Memory**: If you complete a sub-feature or module, update the `docs/modules/00-module-overview.md` status to "Implemented".
