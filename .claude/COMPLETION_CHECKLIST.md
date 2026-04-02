# Development Completion Checklist

**Purpose**: Pre-commit/PR verification checklist for all features and bugfixes
**Scope**: All code changes (M1-M10, any module)
**Required**: Must complete BEFORE marking PR/task as done

---

## ✅ Functional Requirements

- [ ] Feature/fix works as described in requirements document
- [ ] Happy path fully implemented and tested in browser
- [ ] Error cases handled gracefully (show error message, offer retry)
- [ ] Edge cases considered (empty states, boundary values, null checks)
- [ ] No unhandled promises or rejections (check browser console)

---

## 🔒 Security Checklist

### Input Validation

- [ ] All user inputs validated at boundary (FormData, query params, JSON body)
- [ ] Used `getFormDataString()` / `getFormDataOptional()` for FormData
- [ ] Zod schema validates structure and types
- [ ] No `as string` type casting without validation
- [ ] Whitespace trimmed on string inputs

### Authentication & Authorization

- [ ] Protected routes check `auth()` before any operations
- [ ] Verified user ID matches operation context (own account, own transaction, etc)
- [ ] No session tokens or JWTs in API responses
- [ ] No password data returned to client
- [ ] Logout clears session properly

### Error Handling

- [ ] No try-catch blocks in server actions (use `handleActionError()` wrapper)
- [ ] Custom error types used: `AuthError`, `ValidationError`, `DatabaseError`
- [ ] All errors caught and logged before returning to client
- [ ] Generic error messages shown to client (internals in logs only)
- [ ] No error stack traces leaked to frontend

### Logging & Monitoring

- [ ] Security events logged with `logger.auth()` or `logger.security()`
- [ ] All auth operations logged (login, register, password change, delete)
- [ ] Logs include: userId, email (if avail), timestamp, IP
- [ ] **NO passwords, tokens, cryptographic keys, or secrets in logs**
- [ ] NO personal identifiable information (PII) beyond email
- [ ] Database operations logged with duration (if applicable)

### Data Protection

- [ ] No sensitive data in localStorage (only session in httpOnly cookie)
- [ ] No PII in query strings (use POST body instead)
- [ ] No hardcoded secrets or API keys in code
- [ ] Environment variables used for all secrets (AUTH_SECRET, DATABASE_URL)

---

## 📋 Code Quality Checklist

### Style & Standards

- [ ] Follows `.claude/STANDARDS.md` patterns
- [ ] Follows TypeScript strict mode (no `any`)
- [ ] Consistent naming (functions camelCase, components PascalCase)
- [ ] No commented code blocks
- [ ] No console.log() or console.\* debug statements
- [ ] No commented-out imports
- [ ] No unused imports or variables

### Structure & Organization

- [ ] Code in appropriate file/directory
- [ ] Single responsibility principle (file does one thing)
- [ ] No circular dependencies
- [ ] Proper error boundaries in place

### Database & Queries

- [ ] Used Drizzle ORM (no raw SQL)
- [ ] Used `eq()` helper for WHERE clauses
- [ ] No N+1 queries (use relations for related data)
- [ ] No hardcoded IDs or test data
- [ ] Migration created if schema changed (`npm run db:generate`)

### Forms & Validation

- [ ] React Hook Form + Zod used for forms
- [ ] Zod schemas in `lib/validations/`
- [ ] Error messages shown below fields
- [ ] Submit button disabled during loading
- [ ] Form clears/resets on success

---

## 🎨 UI/UX Checklist

### Design System Compliance

- [ ] Colors from approved palette (no arbitrary hex: `#FF5733`)
  - Primary: `bg-primary`, text-primary`
  - Secondary: `bg-secondary`
  - Success: `bg-success`, Error: `bg-error`
- [ ] Typography uses correct fonts
  - Headings: `font-display` (Sora)
  - Body: `font-body` (DM Sans)
  - Code/data: `font-mono` (JetBrains Mono)
- [ ] Spacing on 4px grid (p-1, p-2, gap-4, gap-6 - no p-5, gap-7)
- [ ] Shadows using Tailwind classes (shadow-sm, shadow-md, not custom box-shadow)
- [ ] No 1px borders (use background color shifts instead)
- [ ] All currency displayed with `tabular-nums` class

### Responsive Design

- [ ] Mobile layout tested (375px width)
- [ ] Tablet layout tested (768px)
- [ ] Desktop layout tested (1024px+)
- [ ] Grid/flex layouts use `md:` and `lg:` breakpoints
- [ ] No horizontal scrolling on mobile

### Accessibility

- [ ] All form inputs have `<label>` elements
- [ ] `<button>` tags used for clickable elements (not `<div>`)
- [ ] Icon-only buttons have `aria-label`
- [ ] Links have meaningful text (not "click here")
- [ ] Semantic HTML: `<nav>`, `<main>`, `<article>`, `<footer>`
- [ ] Color contrast >= 4.5:1 (AA standard)
- [ ] Keyboard navigation works (Tab key, Enter to submit)

### Visual Quality

- [ ] No visual glitches or layout issues
- [ ] Consistent spacing with nearby elements
- [ ] Hover states present on interactive elements
- [ ] Loading states shown while async operations
- [ ] Success/error states clearly indicated
- [ ] No hardcoded test strings visible

---

## 📊 Testing Checklist

### Manual Testing

- [ ] Tested primary functionality (happy path)
- [ ] Tested with invalid inputs (wrong email, short password, etc)
- [ ] Tested error scenarios (network error, auth error, validation error)
- [ ] Tested on Chrome/Firefox/Safari (or at least 2 browsers)
- [ ] Tested on mobile device or responsive view

### Browser Console

- [ ] No errors in console (see DevTools)
- [ ] No warnings in console
- [ ] No 404s on assets (images, CSS, JS)
- [ ] Network requests are expected (no unexpected calls)

### Performance

- [ ] Pages load in < 3 seconds (first paint)
- [ ] No unnecessary re-renders (React DevTools)
- [ ] Images optimized (use `next/image`)
- [ ] No memory leaks in DevTools Profiler

---

## 📝 Documentation Checklist

### Code Comments

- [ ] Complex logic has comments explaining "why", not "what"
- [ ] No comments on obvious code
- [ ] No TODO comments (finish work before submitting)
- [ ] No FIXME comments (finish work before submitting)

### Git Commits

- [ ] Commit message is clear and descriptive
- [ ] Commit includes only related changes (no accidental files)
- [ ] No merge commits (rebase if needed)
- [ ] Atomic commits (each commit is a single logical change)

### PR/Merge Request

- [ ] PR title matches feature/issue
- [ ] PR description explains what changed and why
- [ ] Links related issues with `#123` reference
- [ ] No unintended files in diff (.env.local, node_modules, .next, etc)

---

## 🔄 Dependency & Integration Checklist

- [ ] No new dependencies added without discussion
- [ ] No version conflicts (npm/pnpm sees all dependency versions correctly)
- [ ] No breaking changes to existing APIs
- [ ] Backwards compatible (or documented migration if breaking)
- [ ] Works with other M1+ features

---

## 📦 Pre-Merge Final Checks

Before marking as ready for merge:

```bash
# 1. Lint check
npm run lint
# ✅ Should pass with 0 errors

# 2. Build check
npm run build
# ✅ Should complete successfully

# 3. Type check
npm run type-check  # or just use IDE Cmd+Shift+B
# ✅ Should show 0 errors

# 4. Manual check in browser
npm run dev
# ✅ Test feature end-to-end in browser
# ✅ Check error scenarios work

# 5. Git status
git status
# ✅ Only intended files modified
# ✅ No .env.local, node_modules, etc
```

---

## Module-Specific Checklists

### M1: Auth & User Management

- [ ] Registration: validation, duplicate email check, password hash
- [ ] Login: email query, password comparison, JWT generation
- [ ] Logout: session cleared, redirect to login
- [ ] Profile update: only updates own profile, password not returned
- [ ] Password change: validates old password, hashes new
- [ ] Account deletion: final confirmation, logs security event
- [ ] All auth actions logged with email/userId/IP

### M2: Accounts (Template for new modules)

_TBD - Will add when module starts_

### M3-M10: (Future)

_Will add module-specific checklists as needed_

---

## Common Anti-Patterns to Avoid ❌

- ❌ Adding docstrings to unchanged code
- ❌ Refactoring unrelated code in same PR
- ❌ Creating abstractions for one-time use
- ❌ Adding "optional" error handling for impossible scenarios
- ❌ Using generic catch-all error handlers without logging
- ❌ Hardcoding feature toggles or test data
- ❌ Console.log for debugging (commit to repo)
- ❌ Using try-catch in server actions (use handleActionError wrapper)
- ❌ Type casting with `as` instead of validation
- ❌ Inline event handlers instead of named functions
- ❌ Arbitrary hex colors instead of design system
- ❌ Pixel values outside 4px grid (5px, 21px, etc)
- ❌ 1px borders instead of background shifts
- ❌ Promises without error handling

---

## ✨ Sign-Off

**Self-Review**: I have completed all applicable items above ✅

**Ready for Review**: This code is production-ready and follows all standards

**Reviewed By**: [CodeReviewer] ✅

---

**For Help**: See `.claude/STANDARDS.md`, `.claude/SECURITY.md`, or `.claude/UI-UX.md`
