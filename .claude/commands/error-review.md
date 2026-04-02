# /error-review Command

**Agent**: Error Handler Validator
**Purpose**: Validate error handling patterns
**Duration**: 2 minutes
**When to Use**: Error handling code, exception changes, server actions

---

## What This Does

✅ Validates error handler patterns usage
✅ Checks for unhandled promise rejections
✅ Verifies error logging consistency
✅ Ensures custom error types usage
✅ Validates error boundaries placement
✅ Checks error response formats

---

## How to Use

### Method 1: Error Code Review

```
I wrote error handling for login. Check pattern:

export async function login(formData: FormData) {
  try {
    // ... login logic
  } catch (error: any) {
    return { error: error.message }
  }
}
```

### Method 2: Error Boundary Check

```
/error-review

Check app/(dashboard)/error.tsx for proper error handling
```

### Method 3: Full Action File

```
Review actions/users.ts for error handling patterns
```

---

## What Gets Checked

### Error Types

- [ ] Using custom error types (AuthError, ValidationError, DatabaseError)
- [ ] Not throwing generic `Error`
- [ ] Error hierarchy is correct
- [ ] Custom error has code + message

### Error Handling Pattern

- [ ] Server actions use `handleActionError()` wrapper
- [ ] No bare try-catch blocks in server actions
- [ ] `executeServerAction()` wrapper applied
- [ ] Promises have proper error handling

### Error Responses

- [ ] Response format is consistent
- [ ] Generic messages shown to client
- [ ] Full details logged server-side
- [ ] Error codes included (e.g., INVALID_CREDENTIALS)

### Logging

- [ ] Errors logged with full context
- [ ] Security events logged
- [ ] No sensitive data in logs
- [ ] Proper log level (error, warn, info)

### Error Boundaries

- [ ] Error boundaries on all protected routes
- [ ] Global error boundary in place
- [ ] Auth error boundary configured
- [ ] Dashboard error boundary configured

---

## Response Format

```
🚨 ERROR HANDLING VALIDATION

Code: [Function name or route]

PASSED:
✅ Uses custom error types (AuthError)
✅ Has executeServerAction wrapper
✅ Error logged with context
✅ Generic message to client

WARNINGS:
⚠️  Error response missing code field
⚠️  Logging at wrong level (info vs error)

FAILURES:
❌ CRITICAL: Bare try-catch in server action
❌ CRITICAL: Generic Error instead of custom type
❌ Generic error message to client leaks info
❌ No error boundary on route

REQUIRED FIXES:

1. Replace try-catch with wrapper:
   ❌ export async function login(formData) {
        try { ... }
        catch (error: any) { return { error: error.message } }
      }

   ✅ export async function login(formData) {
        try { ... }
        catch (error: unknown) {
          return handleActionError(error, { action: 'login' })
        }
      }

2. Use custom error types:
   ❌ throw new Error('User not found')
   ✅ throw new AuthError('USER_NOT_FOUND', 'Invalid credentials')

3. Log before returning:
   ❌ return { error: 'Something went wrong' }
   ✅ logger.error(error, { action: 'login' })
      return handleActionError(...)

4. Add error boundary:
   ❌ No error.tsx in (dashboard)/
   ✅ Create app/(dashboard)/error.tsx with error boundary

Timeline: 5 minutes to fix
Reference: docs/GLOBAL_ERROR_HANDLING.md
```

---

## Common Error Handling Issues & Fixes

### Issue 1: Bare try-catch in Server Action

```typescript
// ❌ WRONG
export async function register(formData: FormData) {
  try {
    await createUser(...)
  } catch (error: any) {
    return { error: error.message }
  }
}

// ✅ CORRECT
export async function register(formData: FormData) {
  try {
    await createUser(...)
  } catch (error: unknown) {
    return handleActionError(error, { action: 'register' })
  }
}
```

### Issue 2: Generic Error Instead of Custom Type

```typescript
// ❌ WRONG
if (!user) throw new Error("User not found");

// ✅ CORRECT
if (!user) throw new AuthError("USER_NOT_FOUND", "Invalid email or password");
```

### Issue 3: Error Message Leaks Info

```typescript
// ❌ WRONG - Client gets internal error
catch (error: any) {
  return { error: error.message }  // Might say "User not found" or database specific error
}

// ✅ CORRECT - Generic message, logged server-side
catch (error: unknown) {
  logger.error(error, { action: 'register' })
  return handleActionError(error, { action: 'register' })  // Returns "An error occurred"
}
```

### Issue 4: Missing Error Boundary

```typescript
// ❌ WRONG - Route has no error handling
export default function DashboardPage() {
  return <Dashboard />
}

// ✅ CORRECT - Error boundary catches errors
export default function error({ error, reset }: ErrorProps) {
  return (
    <div>
      <h1>Something went wrong</h1>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

### Issue 5: Not Logging Errors

```typescript
// ❌ WRONG
if (!user) {
  return { error: "User not found" };
}

// ✅ CORRECT
if (!user) {
  logger.warn("USER_NOT_FOUND", { email });
  throw new AuthError("USER_NOT_FOUND", "Invalid email or password");
}
```

---

## Error Pattern Reference

### Server Action Pattern

```typescript
"use server";

import { handleActionError } from "@/lib/errors";

export async function myAction(formData: FormData): Promise<ActionResponse> {
  try {
    // 1. Validate inputs
    const email = getFormDataString(formData, "email");

    // 2. Throw custom errors if needed
    const user = await findUser(email);
    if (!user) throw new AuthError("USER_NOT_FOUND", "...");

    // 3. Do work
    const result = await doSomething(user);

    // 4. Return success
    return { success: true, data: result };
  } catch (error: unknown) {
    // 5. Catch-all returns generic error
    return handleActionError(error, { action: "myAction" });
  }
}
```

### Custom Error Type

```typescript
throw new AuthError("INVALID_CREDENTIALS", "Invalid email or password");
// First param: Error code (for client)
// Second param: User-facing message
// Stack trace logged server-side automatically
```

### Error Response Format

```typescript
// Success
{ success: true, data: {...} }

// Client error (validation, auth)
{ error: 'Generic message', code: 'INVALID_CREDENTIALS' }

// Server error
{ error: 'An error occurred', code: 'DATABASE_ERROR' }
```

---

## Pro Tips

1. **Pattern matters**: Use pattern consistently across codebase
2. **Never catch Error**: Catch unknown, throw custom types
3. **Log then return**: Log full error, return generic message
4. **Error boundaries**: One per route group minimum

---

**Reference**: `docs/GLOBAL_ERROR_HANDLING.md`
