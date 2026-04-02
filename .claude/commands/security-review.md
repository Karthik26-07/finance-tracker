# /security-review Command

**Agent**: Security Auditor
**Purpose**: Deep security audit of code
**Duration**: 5 minutes
**When to Use**: Before auth/sensitive code, security-related changes

---

## What This Does

✅ Input validation audit (no unsafe FormData access)
✅ Authentication & authorization checks
✅ Sensitive data protection (logs, responses)
✅ Error handling security review
✅ Database query safety (no SQL injection)
✅ Compliance check (SOC 2, PCI DSS, GDPR)

---

## How to Use

### Method 1: Security-Sensitive Code

```
I'm updating login endpoint. Run security review:

export async function login(formData: FormData) {
  const email = formData.get('email')
  const password = formData.get('password')
  // ... rest of code
}
```

### Method 2: Auth File Review

```
/security-review

Check lib/auth.ts for security vulnerabilities
```

### Method 3: Database Operation

```
Review this transaction creation for security risks:

export async function createTransaction(data: TransactionData) {
  // ... code
}
```

---

## What Gets Checked

### Input Validation

- [ ] All FormData uses `getFormDataString()` or `getFormDataOptional()`
- [ ] Zod schema validates before use
- [ ] No type casting without validation
- [ ] Whitespace trimmed

### Authentication & Authorization

- [ ] `auth()` called for protected operations
- [ ] User ID verified (matches session)
- [ ] No password data returned to client
- [ ] JWT tokens never logged
- [ ] Session token not exposed

### Sensitive Data

- [ ] ❌ No passwords in logs
- [ ] ❌ No API keys hardcoded
- [ ] ❌ No tokens in responses
- [ ] ❌ No PII in query strings
- [ ] ✅ Sensitive data in environment variables

### Error Handling

- [ ] Errors are type-safe (custom error types)
- [ ] Generic messages shown to client
- [ ] Full details logged server-side
- [ ] No error stack traces leaked

### Database

- [ ] Uses Drizzle ORM (no raw SQL)
- [ ] Uses `eq()` helpers (parameterized)
- [ ] No N+1 queries
- [ ] No hardcoded user IDs

---

## Response Format

```
🔒 SECURITY AUDIT

Code: [Function name or file]

PASSED:
✅ Input validation: Uses getFormDataString()
✅ Auth check: session verified
✅ Error handling: Uses AuthError type
✅ No sensitive data in responses

WARNINGS:
⚠️  Missing user ID verification (line 8)
⚠️  Error message could leak information (line 15)

FAILURES:
❌ CRITICAL: Password returned in response
❌ CRITICAL: FormData accessed without validation
❌ Hardcoded API key in code

REQUIRED FIXES:

1. Remove password from response:
   // Lines 12-14
   ❌ return { success: true, user: { ...user, password: user.password } }
   ✅ return { success: true, user: { id, email, name } }

2. Validate FormData:
   ❌ const email = formData.get('email')
   ✅ const email = getFormDataString(formData, 'email')

3. Verify user ownership:
   ❌ const account = await getAccount(accountId)
   ✅ if (account.userId !== session.user.id) throw new AuthError(...)

4. Move secret to env:
   ❌ const apiKey = 'sk_live_4eC39HqLyjWDarhtT663'
   ✅ const apiKey = process.env.STRIPE_API_KEY

Compliance Impact: Blocks merge until fixed
Timeline: 10 minutes to fix
Reference: .claude/SECURITY.md
```

---

## Common Security Issues & Fixes

### Issue 1: Unsafe FormData Access

```typescript
// ❌ WRONG - No validation
const email = formData.get("email");
const password = formData.get("password");

// ✅ CORRECT
const email = getFormDataString(formData, "email");
const password = getFormDataString(formData, "password");
```

### Issue 2: Missing Auth Check

```typescript
// ❌ WRONG - Open endpoint
export async function getUserData(userId: string) {
  return db.query.users.findFirst({ where: eq(users.id, userId) });
}

// ✅ CORRECT - Auth verified
export async function getUserData(userId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new AuthError("UNAUTHORIZED", "...");
  if (session.user.id !== userId) throw new AuthError("FORBIDDEN", "...");
  return db.query.users.findFirst({ where: eq(users.id, userId) });
}
```

### Issue 3: Sensitive Data in Logs

```typescript
// ❌ WRONG
logger.info("User login", { email, password, token: jwt });

// ✅ CORRECT
logger.auth("LOGIN_SUCCESS", { email, userId });
// Log level: info (safe, no secrets)
```

### Issue 4: Error Message Leaking Info

```typescript
// ❌ WRONG - Reveals user doesn't exist
catch (error) {
  if (error.code === 'USER_NOT_FOUND')
    return { error: 'User with this email not found' }
}

// ✅ CORRECT - Generic message
catch (error) {
  return { error: 'Invalid email or password' }
  // But log internally: logger.warn('USER_NOT_FOUND', { email })
}
```

---

## Compliance Checklist

| Framework   | Checks                                               |
| ----------- | ---------------------------------------------------- |
| **SOC 2**   | Audit logging, access controls, error handling       |
| **PCI DSS** | Password hashing, no credit cards logged, HTTPS only |
| **GDPR**    | User data minimization, deletion trails, consent     |

---

## Pro Tips

1. **Run before every auth change**: Non-negotiable
2. **Ask about unclear findings**: Better understanding = fewer issues
3. **Share findings in PRs**: Document why something is wrong

---

**Emergency**: If security issue found, fix immediately before merge
**Reference**: `.claude/SECURITY.md`
