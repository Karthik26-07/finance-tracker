# FinTrack Development Standards & Principles

**Last Updated**: 2026-04-01
**Version**: 1.0
**Scope**: All development phases (M1-M10)

---

## 🎯 Core Coding Principles

### 1. **Simplicity Over Engineering**

- ✅ Only build what's asked
- ✅ No premature abstractions
- ✅ Prefer simple patterns over frameworks
- ✗ Don't add docstrings to unchanged code
- ✗ Don't add error handling for impossible scenarios
- ✗ Don't create utilities for one-time uses

**Examples**:

- Three similar lines → Keep them separate, don't abstract
- Form with one input → No FormBuilder, just standard HTML
- Single error case → Handle inline, no custom helper

---

### 2. **Minimize, Don't Maximize**

- **Code**: Only change what's needed. Leave surrounding code untouched.
- **Dependencies**: Use what exists. Don't add new packages.
- **Types**: TypeScript is required, but no type gymnastics.
- **Comments**: Add only when logic isn't self-evident.

**Anti-patterns**:

- Refactoring code you didn't touch
- Adding extra logging "just in case"
- Creating builder patterns for simple objects
- Adding i18n capabilities to a single English string

---

### 3. **Reversible Decisions**

- Prefer local changes over global refactors
- Use feature toggles for significant changes
- Keep branches short-lived (< 3 commits worth of changes)
- Always ask before destructive operations (git reset, force push, rm -rf)

---

## 📋 Code Style & Patterns

### TypeScript

```typescript
// ✅ DO: Clear, direct code
function validateEmail(email: string): boolean {
  return email.includes("@");
}

// ✗ DON'T: Over-engineered
type EmailValidator = (
  input: string,
) => Promise<{ isValid: boolean; details: ValidationReport }>;
```

### Function Signature Pattern

```typescript
// ✅ Server Actions return consistent format
export async function authAction(formData: FormData): Promise<ActionResponse> {
  try {
    // implementation
    return { success: true, data: ... }
  } catch (error) {
    return handleActionError(error, { action: 'authAction' })
  }
}

// Response type
type ActionResponse =
  | { success: true; data: unknown }
  | { error: string; code?: string }
```

### Component Structure

```typescript
// ✅ Simple, functional
export function UserCard({ userId }: { userId: string }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetchUser(userId).then(setUser)
  }, [userId])

  return <div>{user?.name}</div>
}

// ✗ Don't add: HOCs, render props, compound components for simple cases
```

### Database Queries

```typescript
// ✅ Use Drizzle ORM directly in queries/
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export async function getUserById(id: string) {
  return db.query.users.findFirst({
    where: eq(users.id, id),
  });
}

// ✗ Don't: Raw SQL, query building helpers for simple queries
```

### Forms & Validation

```typescript
// ✅ Use React Hook Form + Zod
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validations/auth";

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });
  // ...
}

// ✗ Don't: Custom validation logic, useState for each field
```

---

## 🔒 Security Standard Checklist

### Input Validation

- [ ] All FormData extracted via `getFormDataString()` or `getFormDataOptional()`
- [ ] Zod schema validates structure before use
- [ ] Never use `as string` type casting for user input
- [ ] Trim whitespace on strings

```typescript
// ✅ CORRECT
const email = getFormDataString(formData, 'email')
const result = emailSchema.safeParse({ email })
if (!result.success) throw new ValidationError(...)

// ✗ WRONG
const email = formData.get('email') as string  // Unsafe
```

### Error Handling

- [ ] No try-catch blocks in server actions, use `executeServerAction()` wrapper
- [ ] Throw custom error types: `AuthError`, `ValidationError`, `DatabaseError`
- [ ] All errors logged via `logger.*()` before returning to client
- [ ] Client receives generic error messages, full details in logs only

```typescript
// ✅ CORRECT
export async function action(formData: FormData) {
  try {
    // validation & business logic
    throw new AuthError('INVALID_CREDENTIALS', 'Invalid email or password')
  } catch (error: unknown) {
    return handleActionError(error, { action: 'action' })
  }
}

// ✗ WRONG
catch (error: any) {
  return { error: error.message }  // Leaks internals
}
```

### Authentication & Authorization

- [ ] Every protected action starts with `const session = await auth()`
- [ ] Verify `session?.user?.id` matches operation user ID
- [ ] All auth operations logged (login, register, password change, delete)
- [ ] JWT tokens never logged or sent to client in responses

```typescript
// ✅ CORRECT
export async function deleteAccount() {
  const session = await auth();
  if (!session?.user?.id) throw new AuthError("UNAUTHORIZED", "...");

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });
  if (!user) throw new AuthError("USER_NOT_FOUND", "...");

  await db.delete(users).where(eq(users.id, session.user.id));
  logger.security("ACCOUNT_DELETED", { userId: session.user.id });
}
```

### Logging & Monitoring

- [ ] Security events logged with `logger.security()` or `logger.auth()`
- [ ] All auth operations include: userId, email (if available), IP, timestamp
- [ ] NO passwords, tokens, or sensitive secrets in logs
- [ ] Database operations logged with duration

```typescript
// ✅ CORRECT
logger.auth("LOGIN_SUCCESS", { email: user.email, userId: user.id });
logger.security(
  "BRUTE_FORCE_DETECTED",
  { email, attempts: 6, ip: getIp() },
  "warn",
);

// ✗ WRONG
logger.info({ password: user.password }); // NEVER
logger.debug(token); // NEVER
```

### Database & SQL

- [ ] Use Drizzle ORM only, never raw SQL strings
- [ ] Use `eq()` helper for WHERE clauses
- [ ] All queries use parameterized values
- [ ] No N+1 queries (use relations when fetching related data)

---

## 🎨 UI/UX Standards

### Design System Enforcement

- **Colors**: Use Tailwind vars (bg-primary, text-primary, bg-elevated, bg-highlight)
- **Typography**: font-display (Sora), font-body (DM Sans), font-mono (JetBrains Mono)
- **Spacing**: Base 4px grid (use w-4, p-8, gap-6)
- **Shadows**: Use shadow-sm, shadow-md, shadow-lg (no 1px borders)
- **Borders**: No 1px borders, use background color shifts for separation

### Component Patterns

```typescript
// ✅ Design system compliant
export function Button({ children, variant = 'primary' }: Props) {
  const variants = {
    primary: 'bg-gradient-to-r from-primary to-primary-container text-white',
    secondary: 'bg-secondary text-white hover:bg-secondary/90',
    ghost: 'bg-transparent text-primary'
  }

  return (
    <button className={`px-4 py-2 rounded-lg transition-all ${variants[variant]}`}>
      {children}
    </button>
  )
}

// ✗ Don't use: Inline pixel values, arbitrary colors
<button style={{ width: '120px', color: '#FF5733' }}>Click</button>
```

### Currency Display

- **Always use tabular-nums** for alignment
- Use `formatter.format()` from lib/formatters
- Show currency symbol based on user.currency

```tsx
// ✅ CORRECT
<span className="font-mono tabular-nums">
  {formatCurrency(amount, user.currency)}
</span>

// ✗ WRONG
<span>${amount.toFixed(2)}</span>
```

### Accessibility

- [ ] All forms have proper labels
- [ ] Buttons have descriptive text (not just icons)
- [ ] Colors don't convey meaning alone (use text too)
- [ ] Use semantic HTML (button, form, nav, main, etc)
- [ ] aria-label for icon-only buttons

```tsx
// ✅ CORRECT
<button aria-label="Delete account" onClick={delete}>
  <TrashIcon />
</button>

// ✗ WRONG
<div onClick={delete}><TrashIcon /></div>
```

---

## 📊 File Structure & Naming

### TypeScript/React Files

```
app/
  (auth)/
    login/
      page.tsx          # Route page
    layout.tsx          # Route group layout

components/
  Button.tsx            # Single export per file
  Form/
    LoginForm.tsx      # Feature-specific component

lib/
  auth.ts              # NextAuth config
  db/
    index.ts           # Drizzle instance
    schema/
      users.ts         # Table definitions
    queries/
      users.ts         # DB query functions
  validations/
    auth.ts            # Zod schemas
  errors.ts            # Custom error types
  logger.ts            # Logging setup

actions/
  auth.ts              # Server actions for auth
  users.ts             # Server actions for users
```

### Naming Conventions

- **Functions**: camelCase, verb + noun: `getUserById`, `validateEmail`
- **Constants**: UPPER_SNAKE_CASE: `DEFAULT_TIMEOUT`, `MAX_RETRIES`
- **Components**: PascalCase: `LoginForm`, `UserCard`
- **IDs/slugs**: lowercase-kebab-case: `user-profile`, `dashboard-settings`
- **Files**: kebab-case.ts OR PascalCase.tsx (React components)

---

## 🧪 Testing & QA Checklist

Before marking a task complete:

- [ ] **Functionality**: Feature works as described in requirements
- [ ] **Security**: Passes security checklist (see above)
- [ ] **Error Handling**: All error paths return proper responses
- [ ] **Logging**: Security events are logged with context
- [ ] **UI Compliance**: Follows design system (colors, typography, spacing)
- [ ] **Accessibility**: Semantic HTML, labels, ARIA where needed
- [ ] **Performance**: No N+1 queries, no unnecessary re-renders
- [ ] **Code Quality**: No console.log, no commented code, proper imports

---

## 🔄 Review Process

### Self-Review Before PR

1. Run `npm run lint` - no errors
2. Check `git diff` - only intended changes
3. Verify no console.log, commented code, or debug statements
4. Test in browser: happy path + error cases
5. Review log output in dev tools
6. Check design system compliance (colors, spacing, fonts)

### Code Review Focus Areas

1. **Security**: Input validation, auth checks, error messages
2. **Error Handling**: Proper error types, no unhandled rejections
3. **Logging**: Security events logged, no sensitive data
4. **Standards**: Follows patterns in STANDARDS.md, no anti-patterns
5. **UI/UX**: Design system compliance, accessibility checks

---

## 📚 Reference Docs

- **Security**: See `.claude/SECURITY.md`
- **UI/UX**: See `.claude/UI-UX.md`
- **Error Handling**: See `docs/GLOBAL_ERROR_HANDLING.md`
- **Implementation Guide**: See `docs/IMPLEMENTATION_GUIDE.md`

---

## Module-Specific Standards

### M1: Auth & User Management ✍️

- All auth operations must log with `logger.auth()` or `logger.security()`
- No password display in any response
- All FormData must be validated with `getFormDataString()`
- Use `executeServerAction()` wrapper for all server actions
- Test with both valid and invalid credentials

### M2-M10 (Templates)

_TBD - Will be defined as each module is started_

---

## Enforcement

These standards are **mandatory** for all code merged to master. Pre-commit hooks will check:

✅ No console.log statements
✅ No commented code blocks
✅ TypeScript strict mode compliance
✅ Security checklist items present
✅ Logging for security events

See `.claude/hooks-config.json` for automation details.
