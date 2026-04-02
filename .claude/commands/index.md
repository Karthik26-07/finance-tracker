# Commands Registry

**Active Commands**: 7 specialized operations
**Prefix**: All commands use `/` (e.g., `/standards-check`)
**Where to Use**: Tell Claude to run these before committing

---

## Quick Reference

| Command            | Purpose                             | When to Use                | Time  | Agent               |
| ------------------ | ----------------------------------- | -------------------------- | ----- | ------------------- |
| `/developer-agent` | Learn patterns & best practices     | Before building features   | 5 min | Developer Agent     |
| `/standards-check` | Review code for standard violations | After writing code         | 2 min | Standards Enforcer  |
| `/security-review` | Deep security audit                 | Before auth/sensitive code | 5 min | Security Auditor    |
| `/ui-review`       | Design system validation            | Before UI components       | 3 min | UI/UX Validator     |
| `/error-review`    | Error handling patterns             | Error handling changes     | 2 min | Error Handler       |
| `/ready-for-merge` | Full pre-merge verification         | Before PR/commit           | 5 min | Completion Reviewer |
| `/checklist`       | Display pre-merge checklist         | Final verification         | 1 min | Completion Reviewer |

---

## Individual Commands

See dedicated files for each command:

- [developer-agent.md](./developer-agent.md) - Learn patterns & best practices
- [standards-check.md](./standards-check.md) - Check code against STANDARDS.md
- [security-review.md](./security-review.md) - Deep security audit
- [ui-review.md](./ui-review.md) - Design system validation
- [error-review.md](./error-review.md) - Error handling verification
- [ready-for-merge.md](./ready-for-merge.md) - Full pre-merge checklist
- [checklist.md](./checklist.md) - Display interactive checklist

---

## How to Use These Commands

### Option 1: Direct to Claude (Recommended)

Just tell Claude what you need:

```
I just wrote this login form. Check it against STANDARDS.md for violations.
```

Claude will automatically run standards-check agent.

### Option 2: Explicit Command Usage

```
/standards-check

Here's my code:
[paste code]
```

### Option 3: Interactive Workflow

```
Before I commit, run through the pre-merge checklist.
```

Claude will launch ready-for-merge workflow.

---

## Command Response Format

All commands return structured responses:

```
✅ [COMMAND NAME]

Result: [Pass/Fail/Warning]

Details:
- Item 1: ✅ Pass
- Item 2: ⚠️  Warning
- Item 3: ❌ Fail

Recommendations:
[specific fixes needed]

Timeline: X minutes to fix
```

---

## Custom Command Workflow

Want to create a custom command? See [agent-template.md](../agents/agent-template.md)

---

**Questions?** Check individual command files or ask Claude with context.
