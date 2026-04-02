# /ready-for-merge Command

**Agent**: Completion Reviewer
**Purpose**: Full pre-merge verification
**Duration**: 5 minutes
**When to Use**: Before committing/creating PR

---

## What This Does

✅ Runs all standard checks (lint, build, types)
✅ Security verification
✅ UI/UX compliance check
✅ Code quality review
✅ Pre-merge checklist verification
✅ Git status validation

---

## How to Use

### Method 1: Full Pre-Merge Verification

```
Before I commit, run /ready-for-merge
```

### Method 2: Specific File Review

```
/ready-for-merge

Check actions/auth.ts before merge
```

### Method 3: Feature Completion

```
I finished the login feature. Is it ready to merge?
```

---

## What Gets Checked

### Automated Checks

- [ ] `npm run lint` passes (0 errors)
- [ ] `npm run build` succeeds
- [ ] TypeScript strict mode (0 errors)
- [ ] No console.log() statements
- [ ] No commented code blocks
- [ ] git status clean (only intended files)

### Security

- [ ] Input validation (getFormDataString)
- [ ] Auth checks present
- [ ] User ID verification
- [ ] No passwords in responses
- [ ] Audit logging in place

### Code Quality

- [ ] Follows STANDARDS.md
- [ ] Custom error types used
- [ ] Proper naming conventions
- [ ] No unused imports
- [ ] Zod validation applied

### UI/UX

- [ ] Design system colors used
- [ ] Proper typography
- [ ] Spacing on 4px grid
- [ ] Accessible (labels, semantic HTML)
- [ ] Responsive (mobile/tablet/desktop)

### Testing

- [ ] Manual tested in browser (happy path)
- [ ] Error scenarios tested
- [ ] No console errors
- [ ] Forms work correctly

### Git & Commits

- [ ] Commit message clear
- [ ] Only intended files staged
- [ ] No .env.local, node_modules, .next
- [ ] Atomic, single logical change

---

## Response Format

```
✅ READY FOR MERGE

Pre-Merge Verification Complete

AUTOMATED CHECKS:
✅ Lint: Pass (0 errors)
✅ Build: Success
✅ TypeScript: Pass (0 errors)
✅ Files: Only intended changes

SECURITY:
✅ Input Validation: getFormDataString used
✅ Auth Checks: Present on protected actions
✅ Error Handling: Custom types, no leaks
✅ Logging: Security events logged

CODE QUALITY:
✅ STANDARDS.md: Compliant
✅ Naming: All conventions followed
✅ Imports: No unused
✅ Error Types: All custom

UI/UX:
✅ Design System: Colors compliant
✅ Typography: Correct fonts/sizes
✅ Spacing: On 4px grid
✅ Accessibility: Labels, semantic HTML
✅ Responsive: All breakpoints tested

TESTING:
✅ Manual Test: Happy path works
✅ Error Test: Error states show correctly
✅ Browser: No console errors
✅ Forms: Validation works

GIT:
✅ Commits: Atomic & clear
✅ Staging: Only intended files
✅ Change: Single logical change
✅ Message: Clear & descriptive

✨ ALL CHECKS PASSED - READY TO MERGE ✨

Timeline: ~5 minutes total
Next: git push or create PR
```

---

## Common Blockers & Solutions

### Blocker 1: Lint Fails

```bash
# See errors
npm run lint

# Auto-fix most issues
npm run lint --fix

# Commit fixes
git add -A
git commit -m "Fix linting errors"
```

### Blocker 2: Build Fails

```bash
# See exact errors
npm run build

# Check TypeScript
npm run type-check

# Fix identified issues
```

### Blocker 3: Files Not Intended

```bash
# Check what's staged
git status

# Unstage files
git reset HEAD filename.ts

# See what changed
git diff --cached
```

### Blocker 4: console.log Found

```bash
# Find all console.log
grep -r "console.log" src/ actions/ lib/

# Remove them
# Replace with: logger.* or delete

# Commit fix
git add -A
git commit -m "Remove console.log debug statements"
```

### Blocker 5: Security Issue Found

```
/security-review

Fix: [Any identified issues]

Commit with: "Fix security: [issue]"
```

---

## Success Checklist (5 min)

```
✅ 1. Run npm run lint (2 min)
   └─ If fails: npm run lint --fix && git add

✅ 2. Run npm run build (1 min)
   └─ If fails: npm run type-check, fix errors

✅ 3. Manual test in browser (1 min)
   └─ Happy path works?
   └─ Error states show?
   └─ Console clean?

✅ 4. Check git status (30 sec)
   └─ Only intended files?
   └─ No .env.local?
   └─ No node_modules?

✅ 5. Run /ready-for-merge (1 min)
   └─ All green?
   └─ Ready to push!
```

---

## Before Creating PR

1. **Push branch**: `git push -u origin feature-name`
2. **Create PR on GitHub**: Link issue with `#123`
3. **Add description**: Explain what changed and why
4. **Request review**: Tag relevant reviewers

---

## Pro Tips

1. **Run frequently**: Don't wait until end of day
2. **Fix immediately**: Easier to fix as you code
3. **Commit often**: Small, atomic commits easier to review
4. **Test thoroughly**: Error cases matter most

---

**Blocked?** Ask Claude: "What's stopping me from merging?"
**Reference**: `.claude/COMPLETION_CHECKLIST.md`
