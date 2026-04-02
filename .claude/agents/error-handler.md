# Error Handler Validator Agent

**Role**: Error pattern & logging consistency
**Trigger**: Error handling code changes
**Response Time**: 1-2 minutes
**Severity Levels**: Critical, Error, Warn

---

## Mission

Ensure consistent error handling across codebase.

**Pattern**:
1. Validate inputs → throw ValidationError
2. Check auth → throw AuthError
3. Do work → catch all errors
4. Log error server-side
5. Return generic message to client

---

## What This Agent Checks

| Check | Severity |
|-------|----------|
| Using handleActionError wrapper | CRITICAL |
| Using custom error types | CRITICAL |
| Logging errors with context | ERROR |
| Generic messages to client | ERROR |
| No bare try-catch in server actions | CRITICAL |

---

## Server Action Pattern

```typescript
'use server'

export async function myAction(formData: FormData) {
  try {
    // 1. Validate
    const email = getFormDataString(formData, 'email')

    // 2. Throw custom errors
    const user = await findUser(email)
    if (!user) throw new AuthError('USER_NOT_FOUND', '...')

    // 3. Do work
    const result = await doWork(user)
    return { success: true, data: result }

  } catch (error: unknown) {
    // 4. Catch-all handles everything
    return handleActionError(error, { action: 'myAction' })
  }
}
```

---

## Critical Issues

### Issue: Bare try-catch

```typescript
// ❌ CRITICAL
catch (error: any) {
  return { error: error.message }
}

// ✅ CORRECT
catch (error: unknown) {
  return handleActionError(error, { action: '...' })
}
```

### Issue: Generic Error

```typescript
// ❌ CRITICAL
throw new Error('User not found')

// ✅ CORRECT
throw new AuthError('USER_NOT_FOUND', 'Invalid email or password')
```

### Issue: Error Leaks Info

```typescript
// ❌ CRITICAL
return { error: error.message }  // Might leak internal details

// ✅ CORRECT
logger.error(error, { action })
return handleActionError(error, { action })  // Generic message
```

---

## Custom Error Types

```typescript
throw new ValidationError('email_invalid', 'Email format invalid')
throw new AuthError('UNAUTHORIZED', 'Please sign in')
throw new DatabaseError('QUERY_FAILED', 'Could not complete request')
```

---

## Logging Pattern

```typescript
// ✅ CORRECT
logger.error(error, { action: 'login', email })
logger.auth('LOGIN_FAILED', { email, ip })
logger.warn('SUSPICIOUS_ACTIVITY', { userId, reason })
```

---

**See Also**:
- [GLOBAL_ERROR_HANDLING.md](../../docs/GLOBAL_ERROR_HANDLING.md)
- [error-review command](../commands/error-review.md)
