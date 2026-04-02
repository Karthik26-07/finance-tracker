# FinTrack Development Framework — Quick Start Guide

**Last Updated**: 2026-04-01
**Framework Version**: 2.0 (Reorganized & Modular)
**Active Standards**: Coding, Security, UI/UX, Error Handling
**Agents**: 5 specialized validators
**Commands**: 6 verification commands

---

## 🎯 Jump Right In

**Choose ONE operation based on what you're doing:**

| I'm... | Run This | Time |
|--------|----------|------|
| Writing code | `/standards-check` | 2 min |
| Doing auth/security | `/security-review` | 5 min |
| Building UI | `/ui-review` | 3 min |
| Handling errors | `/error-review` | 2 min |
| Ready to commit | `/ready-for-merge` | 5 min |
| Final checklist | `/checklist` | 1 min |

**Full navigation**: See [INDEX.md](./INDEX.md)

---

## 📚 What's Inside `.claude/`

Your project has a complete modular development framework with organized directories:

| File                        | Purpose                                          | When to Read               |
| --------------------------- | ------------------------------------------------ | -------------------------- |
| **STANDARDS.md**            | Coding principles, patterns, naming conventions  | Before writing code        |
| **SECURITY.md**             | Security checklist, compliance, threat model     | Before auth/sensitive code |
| **UI-UX.md**                | Design system, colors, typography, accessibility | Before UI components       |
| **COMPLETION_CHECKLIST.md** | Pre-commit verification tasks                    | Before committing/merging  |
| **AGENTS.md**               | AI agent roles and responsibilities              | Understanding AI behavior  |
| **hooks-config.json**       | Automation & enforcement rules                   | Reference only             |
| **README.md**               | This file                                        | You are here!              |

---

## 🚀 Quick Start for Developers

### Before Each Task

1. **Read the relevant standard**
   - Writing code? → `.claude/STANDARDS.md`
   - Touching auth? → `.claude/SECURITY.md`
   - Building UI? → `.claude/UI-UX.md`

2. **Ask Claude to review**

   ```
   I'm implementing [feature]. Check against STANDARDS.md for violations.
   ```

3. **Before committing**
   - Run: `npm run lint` ✅ Must pass
   - Run: `npm run build` ✅ Must pass
   - Check: `.claude/COMPLETION_CHECKLIST.md` ✅ Run through checklist

---

## 🎯 Key Principles (Remember These!)

### ✅ DO

- Keep code simple and focused
- Validate all user inputs (use `getFormDataString()`)
- Check auth before protected operations
- Log security events with `logger.auth()` or `logger.security()`
- Use design system colors (no hex codes)
- Space on 4px grid
- Throw custom error types
- Test in browser (happy path + errors)

### ❌ DON'T

- Add `console.log()` to code
- Comment out code blocks (delete completely)
- Use `as string` without validation
- Hardcode colors (`#FF5733` forbidden)
- Use arbitrary spacing (`gap-5`, `p-7` forbidden)
- Put passwords/tokens in logs
- Return error details to frontend
- Create abstractions for one-time use

---

## 🔒 Security Essentials (3 Things)

1. **Validate Input**

   ```typescript
   const email = getFormDataString(formData, "email"); // ✅
   const email = formData.get("email") as string; // ❌
   ```

2. **Check Auth**

   ```typescript
   const session = await auth()
   if (!session?.user?.id) throw new AuthError(...)    // ✅
   ```

3. **Log Events**
   ```typescript
   logger.auth("LOGIN_SUCCESS", { email, userId }); // ✅
   console.log("user logged in"); // ❌
   ```

---

## 🎨 UI/UX Essentials (3 Things)

1. **Use Design System Colors**

   ```tsx
   <button className="bg-primary text-white">OK</button>           // ✅
   <button style={{ backgroundColor: '#003178' }}>OK</button>      // ❌
   ```

2. **Proper Spacing (4px Grid)**

   ```tsx
   <div className="gap-4 p-6">  ✅  (16px gap, 24px padding)
   <div className="gap-5 p-7">  ❌  (Not on grid)
   ```

3. **Semantic HTML & Labels**
   ```tsx
   <label htmlFor="email">Email</label>  <input id="email" />      // ✅
   <input placeholder="Email" />                                    // ❌
   ```

---

## 📋 Pre-Merge Checklist (5 Minutes)

Before you mark a task done:

```bash
# 1. Pass all checks (2 min)
npm run lint    ✅ 0 errors required
npm run build   ✅ Successful build required

# 2. Manual test in browser (2 min)
npm run dev
# - Test happy path (feature works)
# - Test error case (error message shows)
# - Check browser console (no errors)

# 3. Check standards compliance (1 min)
☑️ No console.log()
☑️ No commented code
☑️ Security checklist items covered
☑️ Design system compliant
☑️ No hardcoded secrets/sensitive data
```

**If all ✅**, you're ready to merge!

---

## 🤖 AI Agents (5 Specialized Helpers)

When you ask Claude to write code, these agents automatically check your work:

| Agent                       | Checks                                   | Trigger                |
| --------------------------- | ---------------------------------------- | ---------------------- |
| **Standards Enforcer**      | Code style, patterns, best practices     | Every code generation  |
| **Security Auditor**        | Auth, input validation, data protection  | Auth/security changes  |
| **UI/UX Validator**         | Design system, accessibility, responsive | Component/page changes |
| **Error Handler Validator** | Error patterns, logging consistency      | Error handling changes |
| **Completion Reviewer**     | Full pre-merge verification              | Before PR merge        |

**You don't need to do anything** — they run automatically. If they flag issues, fix them before committing.

---

## 🔍 Common Violations & Fixes

### "I have console.log() in my code"

```typescript
// ❌ WRONG
console.log("User logged in:", user);

// ✅ CORRECT
logger.auth("LOGIN_SUCCESS", { email: user.email });
```

**Fix**: Replace console.log with logger.\* — see docs/GLOBAL_ERROR_HANDLING.md

---

### "I'm using #FF5733 color"

```tsx
// ❌ WRONG
<button style={{ backgroundColor: '#FF5733' }}>Click</button>

// ✅ CORRECT
<button className="bg-primary">Click</button>
```

**Fix**: Use Tailwind vars from .claude/UI-UX.md#colors

---

### "My spacing is `gap-5`"

```tsx
// ❌ WRONG
<div className="gap-5">  {/* 20px - not on grid */}

// ✅ CORRECT
<div className="gap-4">  {/* 16px - on 4px grid */}
```

**Fix**: Use multiples of 4 (4, 8, 16, 24, 32, 48...)

---

### "I'm casting with `as string`"

```typescript
// ❌ WRONG
const email = formData.get("email") as string;

// ✅ CORRECT
const email = getFormDataString(formData, "email");
```

**Fix**: Use getFormDataString() or getFormDataOptional() from lib/errors.ts

---

### "I don't have auth check in server action"

```typescript
// ❌ WRONG
export async function updateProfile(formData: FormData) {
  const user = await getUser(userId)  // Which user?
}

// ✅ CORRECT
export async function updateProfile(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new AuthError(...)
  const user = await getUser(session.user.id)
}
```

**Fix**: Add `const session = await auth()` check at start

---

## 🧪 Testing Your Work

### Level 1: Lint Check (Automatic ✅)

```bash
npm run lint  # Catches style, unused vars, common mistakes
```

### Level 2: Type Check (Automatic ✅)

```bash
npm run build  # TypeScript compilation, catches type errors
```

### Level 3: Manual Test (Your Job ✅)

```bash
npm run dev  # Start dev server, test in browser

# Test happy path: Does feature work?
# Test error: Do errors show properly?
# Check console: Any red errors shown?
```

### Level 4: Standards Review (You + AI ✅)

```
Before merge, ask Claude:
"Check this code against .claude/STANDARDS.md for violations"
```

---

## 📖 Deep Dives (Optional Reading)

### Understanding Security Better

- Read: `docs/SECURITY_REVIEW.md`
- Focus: Where are the vulnerabilities?
- Action: Make sure your code prevents them

### Understanding Error Handling

- Read: `docs/GLOBAL_ERROR_HANDLING.md` & `docs/IMPLEMENTATION_GUIDE.md`
- Focus: How do errors flow through the app?
- Action: Use consistent patterns in your code

### Understanding Database Patterns

- Read: `CLAUDE.md` → Architecture section
- Focus: How are queries structured?
- Action: Follow Drizzle ORM patterns (no raw SQL)

---

## 🚨 When Something Goes Wrong

**Lint error?**

```bash
npm run lint --fix  # Auto-fixes most issues
```

**Build fails?**

```bash
npm run build  # See exact error message
npm run type-check  # Check TypeScript errors
```

**Can't figure it out?**

```
Ask Claude: "I'm getting [error message]. How do I fix it?"
```

---

## 📞 Support Resources

| Question                           | Answer Location                                |
| ---------------------------------- | ---------------------------------------------- |
| How should I name this function?   | `.claude/STANDARDS.md#naming`                  |
| Is this secure?                    | `.claude/SECURITY.md` + ask `/security-review` |
| Does this match the design system? | `.claude/UI-UX.md` + ask `/ui-review`          |
| Am I ready to commit?              | `.claude/COMPLETION_CHECKLIST.md`              |
| How do X work in this project?     | `CLAUDE.md` → Architecture section             |

---

## 🎓 Learning Path

**New to project? Start here:**

1. Read `CLAUDE.md` (5 min) — Get overview
2. Skim `.claude/STANDARDS.md` (5 min) — Know what's enforced
3. Look at existing code `app/(auth)/login/` (10 min) — See patterns in action
4. Ask Claude to help with your first task
5. Run through `.claude/COMPLETION_CHECKLIST.md` before commit
6. Deep dives as needed (Security, UI/UX, Error Handling)

---

## ⚡ Pro Tips

### Tip 1: Use Claude for Code Review

```
Instead of manually checking, ask:
"Review this code against .claude/STANDARDS.md for violations"

AI will catch most issues automatically
```

### Tip 2: Commit Atomic Changes

```bash
# ✅ GOOD: One logical change
git commit -m "Add login form validation"

# ❌ BAD: Multiple unrelated changes
git commit -m "Add login + fix dashboard + update styles"
```

### Tip 3: Test Error Paths

```
Happy path works? Great!
Now test: Wrong password, invalid email, network error
Most bugs are in error handling
```

### Tip 4: Design System != Random Colors

```
The 5 colors (primary, secondary, tertiary, success, error)
work together. Use them. No hex codes.
```

---

## 🚀 Next Steps

1. **Commit this framework**: `git add .claude && git commit -m "Add development framework"`
2. **Update settings.json** (optional): Copy patterns from `hooks-config.json`
3. **Share with team**: Show this README to other developers
4. **Start using**: Ask Claude to review code before submitting PRs

---

## Version History

| Version | Date       | Changes                                                      |
| ------- | ---------- | ------------------------------------------------------------ |
| 1.0     | 2026-04-01 | Initial framework: Standards, Security, UI/UX, Agents, Hooks |

---

**Questions?** Check the relevant `.claude/*.md` file or ask Claude with context!
