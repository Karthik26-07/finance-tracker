# /standards-check Command

**Agent**: Standards Enforcer
**Purpose**: Verify code compliance with STANDARDS.md
**Duration**: 2 minutes
**When to Use**: After writing code, before committing

---

## What This Does

✅ Scans code against all standards in `.claude/STANDARDS.md`
✅ Checks for anti-patterns and best practices
✅ Validates TypeScript strict mode compliance
✅ Verifies naming conventions
✅ Checks for code quality issues

---

## How to Use

### Method 1: Ask Claude Directly (Best)

```
I wrote this function. Check it against STANDARDS.md:

export async function updateUser(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string

  try {
    await db.update(users).set({ name, email })
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}
```

### Method 2: Review Entire File

```
/standards-check

Check actions/auth.ts against STANDARDS.md
```

### Method 3: Specific Module

```
Review all components/ against UI sections of STANDARDS.md
```

---

## What Gets Checked

### Code Style

- [ ] Function naming (camelCase, verb + noun)
- [ ] Component naming (PascalCase)
- [ ] Constant naming (UPPER_SNAKE_CASE)
- [ ] File naming conventions
- [ ] No commented code blocks
- [ ] No console.log() or debug statements

### TypeScript

- [ ] No `any` type usage
- [ ] No unsafe type casting without validation
- [ ] Proper strict mode compliance
- [ ] No unused imports or variables

### Patterns

- [ ] Uses established patterns from codebase
- [ ] Server actions follow pattern
- [ ] Components follow pattern
- [ ] Database queries use Drizzle ORM
- [ ] Forms use React Hook Form + Zod

### Anti-Patterns

- [ ] ❌ No premature abstractions
- [ ] ❌ No one-time utilities
- [ ] ❌ No refactoring unrelated code
- [ ] ❌ No inline styles with pixel values
- [ ] ❌ No arbitrary object builders

---

## Response Format

```
✅ STANDARDS CHECK

Code Review: [File/Code snippet]

PASSED:
✅ Server action pattern correct
✅ Naming conventions followed
✅ No console.log() found
✅ TypeScript strict mode compliant

WARNINGS:
⚠️  Type casting without validation (line 5) - Use Zod schema
⚠️  Function could be simpler - Consider breaking validation

FAILURES:
❌ No FormData validation - Use getFormDataString()
❌ Hardcoded error message - Use custom error types

FIX RECOMMENDATIONS:

1. Replace type casting:
   const email = formData.get('email') as string  ❌
   const email = getFormDataString(formData, 'email')  ✅

2. Add Zod validation:
   const result = userSchema.safeParse({ name, email })
   if (!result.success) throw new ValidationError(...)

3. Use error types:
   catch (error: unknown) {
     return handleActionError(error, { action: 'updateUser' })
   }

Timeline: 3 minutes to fix
Reference: .claude/STANDARDS.md
```

---

## Common Violations & Fixes

### Violation 1: Type Casting Without Validation

```typescript
// ❌ WRONG
const email = formData.get("email") as string;

// ✅ CORRECT
const email = getFormDataString(formData, "email");
```

### Violation 2: console.log() in Production Code

```typescript
// ❌ WRONG
console.log("User logged in:", user);

// ✅ CORRECT
logger.auth("LOGIN_SUCCESS", { email: user.email });
```

### Violation 3: Arbitrary Colors

```tsx
// ❌ WRONG
<button style={{ backgroundColor: '#003178' }}>Click</button>

// ✅ CORRECT
<button className="bg-primary">Click</button>
```

### Violation 4: One-Time Abstractions

```typescript
// ❌ WRONG - Creating a helper for one use
const formatUserName = (user: User) =>
  `${user.first} ${user.last}`
  // ✅ CORRECT - Just use it inline
  `${user.first} ${user.last}`;
```

---

## Pro Tips

1. **Run before every commit**: Don't wait until review
2. **Fix issues immediately**: Easier to fix as you code
3. **Use fixes as learning**: Understand why pattern matters
4. **Ask for context**: "Why is this anti-pattern?" → Better learning

---

**Need help?** Ask Claude: "I don't understand why this is wrong"
**Reference**: `.claude/STANDARDS.md`
