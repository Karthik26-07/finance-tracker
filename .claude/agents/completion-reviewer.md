# Completion Reviewer Agent

**Role**: Final pre-merge verification
**Trigger**: `/ready-for-merge` command
**Response Time**: 5 minutes
**Severity Levels**: Blocking, Error, Warn, Info

---

## Mission

Final comprehensive verification before merging to master.

Runs ALL other agents:
- Standards Enforcer
- Security Auditor
- UI/UX Validator
- Error Handler Validator

Plus automated checks:
- npm run lint
- npm run build
- git status

---

## What This Agent Does

1. ✅ Runs Standards Enforcer → Code quality check
2. ✅ Runs Security Auditor → Auth/data safety check
3. ✅ Runs UI/UX Validator (if has UI) → Design check
4. ✅ Runs Error Handler (if has errors) → Consistency check
5. ✅ Runs npm run lint → 0 errors required
6. ✅ Runs npm run build → Successful build required
7. ✅ Checks git status → Only intended files
8. ✅ Verifies checklist → All items completed

---

## Pre-Merge Response

```
✅ READY FOR MERGE

Feature: [Branch name]
Date: Today

═════════════════════════════════════════════

STANDARDS ENFORCER:
✅ Names follow conventions
✅ No console.log()
✅ No commented code
✅ Patterns established

SECURITY AUDITOR:
✅ Input validation present
✅ Auth checks in place
✅ No data leaks
✅ Generic error messages

UI/UX VALIDATOR:
✅ Design system colors
✅ 4px grid spacing
✅ Accessible (labels, semantic)
✅ Responsive tested

ERROR HANDLER:
✅ Custom error types
✅ handleActionError wrapper
✅ Logging consistent
✅ No bare try-catch

AUTOMATED CHECKS:
✅ npm run lint: PASS
✅ npm run build: PASS
✅ TypeScript: PASS
✅ git status: CLEAN

TESTING:
✅ Manual tested (happy path)
✅ Error cases verified
✅ Browser console clean
✅ Forms working

GIT & COMMITS:
✅ Commit message clear
✅ Only intended files
✅ Atomic change
✅ No .env.local

═════════════════════════════════════════════

✨ ALL CHECKS PASSED - READY TO PUSH ✨

Next steps:
1. git push -u origin feature-name
2. Create PR on GitHub
3. Request review
```

---

## If Something Fails

```
❌ NOT READY FOR MERGE

Issues Found:

1. Standards Enforcer (Error)
   → Type casting without validation (line 12)
   → Fix: Use Zod schema

2. Security Auditor (Critical)
   → No auth check on protected action
   → Fix: Add const session = await auth()

3. npm run build (Failed)
   → TypeScript error in components/Button.tsx 
   → Fix: Check type annotation

Fix these items, then run /ready-for-merge again
```

---

## How to Use

### Before Committing

```
/ready-for-merge
```

Agent will:
- Run all verification agents
- Check automated tests
- List any issues
- Tell you if ready

### After Fixes

```
I fixed all the issues. Run /ready-for-merge again
```

Agent will:
- Re-run all checks
- Verify fixes worked
- Clear to merge if all pass

---

## Timeline

- Standards: 1-2 min
- Security: 3-5 min
- UI/UX: 2-3 min (if UI)
- Errors: 1-2 min (if errors)
- Automation: 2-3 min
- **Total**: 10-15 minutes

(Much faster if following standards as you code)

---

## Success Criteria

✅ All agents pass (green)
✅ npm run lint: 0 errors
✅ npm run build: successful
✅ git status: only intended files
✅ Manual testing: passed
✅ Commit message: clear & atomic

---

**See Also**:
- [COMPLETION_CHECKLIST.md](../COMPLETION_CHECKLIST.md)
- [ready-for-merge command](../commands/ready-for-merge.md)
