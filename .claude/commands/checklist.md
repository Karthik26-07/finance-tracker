# /checklist Command

**Agent**: Completion Reviewer
**Purpose**: Display interactive pre-merge checklist
**Duration**: 1 minute per section
**When to Use**: Manual checklist walkthrough before committing

---

## What This Does

✅ Shows complete pre-merge verification checklist
✅ Interactive checkboxes for self-review
✅ Organized by category
✅ Links to relevant documentation
✅ Progress tracking

---

## How to Use

### Method 1: Full Checklist

```
Show me the pre-merge checklist
```

### Method 2: Category Only

```
/checklist

Show just security questions
```

### Method 3: Manual Walk-Through

```
Let me go through the pre-merge checklist step by step
```

---

## Interactive Checklist

When you ask for checklist, you'll see:

```
📋 PRE-MERGE VERIFICATION CHECKLIST

Feature/Fix: [Branch name]
Date: [Today]

═══════════════════════════════════════════

✅ FUNCTIONAL REQUIREMENTS

☐ Feature works as described
☐ Happy path fully implemented
☐ Error cases handled (shows error message)
☐ Edge cases considered
   Reference: .claude/COMPLETION_CHECKLIST.md

═══════════════════════════════════════════

✅ SECURITY CHECKLIST

☐ All inputs validated (getFormDataString)
☐ Auth checks on protected actions
☐ User ID verified (matches session)
☐ No passwords in responses
☐ No tokens in logs
☐ Generic error messages to client
☐ Sensitive data protected
   Reference: .claude/SECURITY.md

═══════════════════════════════════════════

✅ CODE QUALITY

☐ No console.log() statements
☐ No commented code blocks
☐ TypeScript strict mode (no 'any')
☐ Proper naming (functions camelCase, components PascalCase)
☐ No unused imports or variables
☐ Custom error types used
☐ Zod validation for inputs
☐ Database queries use Drizzle ORM
   Reference: .claude/STANDARDS.md

═══════════════════════════════════════════

✅ UI/UX COMPLIANCE

☐ Design system colors used (no hex codes)
☐ Correct typography (fonts, sizes, weights)
☐ Spacing on 4px grid (no arbitrary values)
☐ No 1px borders (use background shifts)
☐ Responsive (mobile, tablet, desktop)
☐ Accessible (labels, semantic HTML, ARIA)
☐ Currency displayed with tabular-nums
   Reference: .claude/UI-UX.md

═══════════════════════════════════════════

✅ TESTING

☐ Manual tested in browser (happy path)
☐ Tested error scenarios
☐ Browser console clean (no errors)
☐ Forms work correctly
☐ Network requests expected
☐ Performance acceptable (< 3s load)

═══════════════════════════════════════════

✅ GIT & COMMITS

☐ No .env.local included
☐ No node_modules included
☐ No .next build included
☐ Only intended files staged
☐ Commit message clear and descriptive
☐ Atomic change (one logical change)
☐ No merge commits (rebase if needed)

═══════════════════════════════════════════

✅ AUTOMATION CHECKS

☐ npm run lint → 0 errors
☐ npm run build → successful
☐ npm run type-check → 0 errors
☐ git status → clean

═══════════════════════════════════════════

Result: [READY / NOT READY]

If NOT READY:
→ Which items need attention? [List them]
→ Show me how to fix...
```

---

## How to Use This Checklist

### 1. Go Through Each Section

```
I'll do the functional requirements first.
☐ Feature works as described - YES
☐ Happy path implemented - YES
☐ Error cases handled - YES
☐ Edge cases considered - YES

Moving to security...
```

### 2. Ask for Help on Failures

```
I failed the "no console.log" item.

Show me how to find and remove console.log statements.
```

### 3. Get Fixes Applied

```
Multiple items failing in code quality section.

Run /standards-check to see violations.
```

### 4. Final Sign-Off

```
I've completed all checklist items.

Ready for merge - run /ready-for-merge
```

---

## Checklist by Category

### Functional (5 items)

Focus: Feature works correctly
Time: 2 minutes

```
- Does feature do what was asked?
- Did you test happy path in browser?
- Did you test error cases?
- Did you consider edge cases (empty, null, boundary values)?
- No unhandled promise rejections?
```

### Security (20-25 items)

Focus: No data leaks, proper auth, secure patterns
Time: 5 minutes
Command: `/security-review`

```
- FormData validated (getFormDataString)?
- Auth check present (const session = await auth())?
- User ID verified (matches own data)?
- No passwords in logs or responses?
- No API keys hardcoded?
- Generic error messages only?
- Full error details logged server-side?
- Database queries use Drizzle (no raw SQL)?
- [More...]
```

### Code Quality (15 items)

Focus: Clean, maintainable, follows patterns
Time: 3 minutes
Command: `/standards-check`

```
- No console.log() or debug code?
- No commented code blocks?
- No type casting without validation?
- Proper naming conventions?
- No unused imports or variables?
- Custom error types (not generic Error)?
- Input validation with Zod?
- Follows project patterns?
- [More...]
```

### UI/UX (10 items)

Focus: Design system, accessibility, responsive
Time: 3 minutes
Command: `/ui-review`

```
- Using design system colors (not hex)?
- Proper typography (fonts, sizes)?
- Spacing on 4px grid?
- No 1px borders?
- Responsive design tested?
- Accessible (labels, ARIA)?
- [More...]
```

### Testing (6 items)

Focus: Works in real browser
Time: 3 minutes

```
- Manual test happy path: YES?
- Manual test error cases: YES?
- Browser console errors: NONE?
- Forms validate correctly: YES?
- [More...]
```

### Git & Commits (7 items)

Focus: Clean repository state
Time: 2 minutes

```
- .env.local excluded: YES?
- node_modules excluded: YES?
- Only intended files staged: YES?
- Commit message clear: YES?
- Atomic change: YES?
- [More...]
```

### Automation (4 items)

Focus: Automated tools pass
Time: 3 minutes

```
- npm run lint: PASS?
- npm run build: PASS?
- npm run type-check: PASS?
- git status: CLEAN?
```

---

## Checklist Tips

1. **Be honest**: If item is NO, fix it or ask for help
2. **Use commands**: /standards-check, /security-review, /ui-review
3. **Don't skip**: Each item exists for a reason
4. **Ask why**: Understanding why matters improves code
5. **Celebrate**: All items passing? Ready to merge! 🎉

---

## Total Time Estimate

- **Functional**: 2 min
- **Security**: 5 min
- **Code Quality**: 3 min
- **UI/UX**: 3 min
- **Testing**: 3 min
- **Git**: 2 min
- **Automation**: 3 min
- **Total**: ~20 minutes

(If you've been following standards as you code, this is much faster)

---

## Workflow

```
1. Write code (following STANDARDS.md)
   ↓
2. Ask /standards-check
   ↓
3. Ask /security-review (if auth/sensitive)
   ↓
4. Ask /ui-review (if UI changes)
   ↓
5. Go through /checklist
   ↓
6. All items YES? → Ready for merge
   ↓
7. Some items NO? → Ask for help
   ↓
8. After fixes → /ready-for-merge
   ↓
9. git push → Create PR
```

---

**Reference**: `.claude/COMPLETION_CHECKLIST.md`
