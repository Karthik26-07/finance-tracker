---
description: Final review protocol replicating the Completion Reviewer before code merges
---

# Pre-Merge Validation Workflow

As an Antigravity agent, when executing a final pre-merge validation, run this sequence fully:

0. **Memory Sync (MANDATORY)**: Update project status by reading and updating `docs/modules/00-module-overview.md`, ensuring all docs reflect current codebase realities and `.agents/MEMORY.md` constraints are upheld.
1. **Lint Phase**:
// turbo-all
2. Run `npm run lint` and verify there are no ESLint build failures.
3. **Type-Check Phase**:
4. Run `npx tsc --noEmit` and wait for output. Examine any TypeScript errors.
5. **Cross-Check Agent Context**: Ensure no outstanding tasks remain in `MEMORY.md` for this active module.
6. **Verdict**: If the CI build commands pass seamlessly, provide the user a large green ✅ confirmation list. If not, auto-fix any simple typo or TS-ignore the issue appropriately using the file modification tools and tell the user directly.
