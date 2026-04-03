---
description: Generate and run tests for complex logic, APIs, and UI components
---

# Testing Workflow (/test)

As an Antigravity agent asked to test code, execute this workflow:

1. **Memory Sync (MANDATORY)**: Read `.agents/MEMORY.md` to ensure your context is synchronized. Cross-reference `docs/modules/00-module-overview.md` to understand where this component fits into the architecture.
2. **Identify Target**: Locate the file(s) that need testing. 
3. **Write Tests**: Implement unit/integration tests addressing edge cases. (e.g., Zod validation boundaries, Auth failures, Next.js server action exceptions).
4. **Execution**: 
// turbo-all
   Run `npm run test` or the appropriate test command in the terminal for the user to verify the tests pass.
5. **Fix Loop**: Automatically apply fixes to the code or test file if failures occur, until the test suite is green.
