# Standards Enforcer Agent

**Role**: Code quality & style validation
**Trigger**: Every code generation
**Response Time**: 1-2 minutes
**Severity Levels**: Error, Warn, Info

---

## Mission

Ensure all code follows `.claude/STANDARDS.md` patterns and best practices.

**No**:

- console.log() statements
- Commented code blocks
- Type casting without validation
- Arbitrary colors or spacing
- One-time abstractions
- Premature optimizations

**Yes**:

- Clear, simple code
- Proper naming conventions
- TypeScript strict mode
- Established patterns
- Reversible decisions

---

## What This Agent Checks

| Category       | Items                                       | Severity |
| -------------- | ------------------------------------------- | -------- |
| Code Style     | Naming, formatting, structure               | WARN     |
| TypeScript     | Type safety, no `any`, strict mode          | ERROR    |
| Patterns       | Functions, components, database queries     | WARN     |
| Anti-Patterns  | Abstractions, one-time utils, magic numbers | WARN     |
| Best Practices | Error handling, validation, imports         | ERROR    |

---

## How to Trigger

### Automatic (No action needed)

```
You ask: "Write me a login function"
→ Standards Enforcer automatically reviews generated code
```

### Explicit Request

```
You ask: "Check this code against STANDARDS.md"
→ Standards Enforcer reviews your code
```

### Command

```
/standards-check
[paste code]
→ Standards Enforcer reviews it
```

---

## Response Format

```
✅ STANDARDS CHECK

Code: [Function or file name]

PASSED (5):
✅ Naming convention (camelCase for function)
✅ No console.log() found
✅ TypeScript strict mode
✅ Zod validation used
✅ Custom error types

WARNINGS (2):
⚠️  Line 8: Type casting without validation
    → Use Zod schema instead
⚠️  Line 12: Long function, consider breaking into smaller parts

FAILURES (1):
❌ CRITICAL: No error handling
   → Add try-catch with custom error types

FIXES NEEDED:

1. Validate input (Line 5):
   ❌ const email = formData.get('email') as string
   ✅ const email = getFormDataString(formData, 'email')

2. Add error handling (Line 12):
   ❌ catch (error: any) { ... }
   ✅ catch (error: unknown) { return handleActionError(...) }

Reference: .claude/STANDARDS.md
Timeline: 2 minutes to fix
```

---

## Code Patterns to Know

### Server Actions

```typescript
// ✅ CORRECT pattern
"use server";

export async function myAction(formData: FormData): Promise<ActionResponse> {
  try {
    // 1. Validate inputs
    const email = getFormDataString(formData, "email");

    // 2. Throw custom errors
    if (someCondition) throw new ValidationError("...");

    // 3. Do work
    const result = await doWork();

    // 4. Return success
    return { success: true, data: result };
  } catch (error: unknown) {
    return handleActionError(error, { action: "myAction" });
  }
}
```

### Components

```typescript
// ✅ CORRECT pattern
export function MyComponent({ prop }: Props) {
  const [state, setState] = useState(null)

  return <div>{state}</div>
}

// ❌ WRONG: HOC, render props, compound components for simple cases
```

### Database Queries

```typescript
// ✅ CORRECT
import { eq } from "drizzle-orm";
export async function getUser(id: string) {
  return db.query.users.firstOne({ where: eq(users.id, id) });
}

// ❌ WRONG: Raw SQL queries
```

---

## Anti-Patterns This Agent Flags

| Anti-Pattern               | Why It's Wrong    | Fix                    |
| -------------------------- | ----------------- | ---------------------- |
| Type casting `as string`   | No validation     | Use Zod when parsing   |
| `console.log()`            | Leaves debug code | Use logger.\* instead  |
| Commented code             | Pollutes codebase | Delete completely      |
| Hardcoded numbers          | Magic values      | Use constants or grid  |
| One-time utilities         | Over-engineering  | Keep code inline       |
| Arbitrary spacing `gap-5`  | Off grid          | Use `gap-4` or `gap-6` |
| Arbitrary colors `#FF5733` | System violation  | Use `bg-primary`       |

---

## FYI Before Asking

**This agent specializes in**: Code style, patterns, best practices
**This agent CANNOT**: Make business decisions, test code, replace human judgment

**Ask instead**:

- `/security-review` for security issues
- `/ui-review` for design system
- `/error-review` for error patterns

---

## Get Help

```
"Why is creating a utility function wrong here?"
→ Agent explains over-engineering

"What's the correct pattern for this?"
→ Agent shows pattern with example

"How do I fix the type casting?"
→ Agent shows Zod schema pattern
```

---

**See Also**:

- [STANDARDS.md](../STANDARDS.md)
- [standards-check command](../commands/standards-check.md)
