---
description: Validates code quality and pattern compliance according to project standards
---

# Standards Enforcement Workflow

As an Antigravity agent, when asked to run a standards review, execute the following steps:

0. **Memory Sync (MANDATORY)**: First, cross-reference `.agents/MEMORY.md` and `docs/modules/00-module-overview.md` to ensure you maintain shared context with other workflows.
1. **Review Changed Files**: Use `view_file` to check the current code files in question.
2. **Check TypeScript Strictness**: Ensure there are no `any` types used. Everything must be strongly typed.
3. **Verify Zod Configuration**: If dealing with forms or APIs, verify Zod schemas match the React Hook Form structure.
4. **Architecture Compliance**: Ensure Database calls are in `lib/db/queries` and mutations via `actions/` Next.js server actions.
5. **Report**: At the end of your thought process, provide a structured markdown failure/pass list.
   - ✅ Passed criteria
   - ⚠️ Warnings
   - ❌ Failures requiring fixes

**Auto-run capability**: Ask the user for permission to automatically fix minor pattern violations using `replace_file_content`.
