# Security Auditor Agent

**Role**: Auth, validation, data protection verification
**Trigger**: Auth file changes, security-related code
**Response Time**: 3-5 minutes
**Severity Levels**: Critical, Error, Warn, Info

---

## Mission

Ensure code is secure from **input injection**, **auth bypass**, **data leaks**, and **compliance violations**.

**CRITICAL Checks**:
- Input validation (no unsafe FormData)
- Authentication & authorization
- Sensitive data protection
- Error message security
- Database query safety

---

## What This Agent Checks

| Area | Focus | Severity |
|------|-------|----------|
| Input Validation | FormData safety, Zod schemas | CRITICAL |
| Authentication | Session checks, user ID verification | CRITICAL |
| Authorization | Ownership verification, role checks | CRITICAL |
| Sensitive Data | Logs, responses, environment vars | CRITICAL |
| Error Handling | Generic messages, no info leaks | ERROR |
| Database | Drizzle ORM, no SQL injection | ERROR |
| Compliance | SOC 2, PCI DSS, GDPR compliance | WARN |

---

## How to Trigger

### Explicit Request

```
/security-review

Here's my login code:
[paste code]
```

### Automatic (on file change)

```
You modify: actions/auth.ts
→ Security Auditor automatically reviews
```

### Direct Question

```
"Is this auth check secure?"
→ Security Auditor reviews it
```

---

## Critical Security Issues

### Issue: Unsafe FormData Access

```typescript
// ❌ CRITICAL - No validation
const email = formData.get('email') as string

// ✅ CORRECT - Safe extraction
const email = getFormDataString(formData, 'email')
```

### Issue: Missing Auth Check

```typescript
// ❌ CRITICAL - Open endpoint
export async function getBalance(accountId: string) {
  return account.balance
}

// ✅ CORRECT - Auth verified
export async function getBalance(accountId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new AuthError('UNAUTHORIZED', '...')
  if (account.userId !== session.user.id) throw new AuthError('FORBIDDEN', '...')
  return account.balance
}
```

### Issue: Password in Response

```typescript
// ❌ CRITICAL - Returns sensitive data
return { user: { ...user, password: user.passwordHash } }

// ✅ CORRECT - Only safe fields
return { user: { id: user.id, email: user.email, name: user.name } }
```

### Issue: Error Leaks Info

```typescript
// ❌ CRITICAL - Reveals user doesn't exist
catch (error) {
  if (!user) return { error: 'User not found' }
}

// ✅ CORRECT - Generic message, logged internally
catch (error) {
  logger.warn('USER_NOT_FOUND', { email })
  return { error: 'Invalid email or password' }
}
```

---

## Audit Checklist

- [ ] All FormData uses `getFormDataString()` or `getFormDataOptional()`
- [ ] No type casting without validation
- [ ] `auth()` called for protected operations
- [ ] User ID verified (matches session)
- [ ] No passwords returned to client
- [ ] No API keys hardcoded
- [ ] No tokens in logs
- [ ] Generic messages to client
- [ ] Full errors logged server-side
- [ ] Drizzle ORM only (no raw SQL)
- [ ] Uses `eq()` helpers (parameterized)
- [ ] No N+1 queries

---

## Compliance Framework

**SOC 2 Type II**: Audit logging, access control
**PCI DSS**: Password hashing, no card storage
**GDPR**: Data minimization, deletion trails

---

**See Also**:
- [SECURITY.md](../SECURITY.md)
- [security-review command](../commands/security-review.md)
