---
description: Run comprehensive security audit for auth, data protection, and validation
---

# Security Audit Workflow

As an Antigravity agent, run the following when triggered for a security review:

0. **Memory Sync (MANDATORY)**: Review `.agents/MEMORY.md` and `docs/modules/00-module-overview.md` to ensure your context is synchronized.
1. **Check Server Actions**: Verify every function in `actions/` correctly invokes `await auth()` and validates the user role/existence.
2. **Check Zod Validations**: All user inputs (both client-side UI and API level) must be explicitly sanitized via Zod.
3. **Check Drizzle Queries**: Ensure all `where()` clauses explicitly scope down to the authenticated `userId`.
   - Never allow data cross-contamination between `users`.
4. **Audit Review Phase**: Output a "Pass/Fail" summary in markdown.
   - Highlight any security leaks using `> [!CAUTION]` blockquotes so the USER takes it seriously.

**Auto-run capability**: Offer to auto-enforce `requireAuth()` guards on missing endpoints for the USER.
