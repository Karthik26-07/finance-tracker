# FinTrack Security Enforcement Guide

**Last Updated**: 2026-04-01
**Compliance Frameworks**: SOC 2 Type II, PCI DSS, GDPR
**Status**: Active - All M1+ modules required to follow

---

## 🔒 Security Principles

### 1. **Defense in Depth**

- **Layer 1**: Input validation (Zod schemas, FormData helpers)
- **Layer 2**: Authentication (NextAuth JWT, bcrypt 12 rounds)
- **Layer 3**: Authorization (Session checks, user ID verification)
- **Layer 4**: Logging & monitoring (Audit trails, security events)
- **Layer 5**: Infrastructure (HTTPS, security headers, database encryption)

---

### 2. **Fail Secure**

- Errors default to "permission denied" (not "access granted by default")
- Missing auth → 401, not 200 with empty data
- Invalid input → 400 ValidationError, not processed
- All data access gated behind `auth()` check

```typescript
// ✅ CORRECT - Fail secure
export async function getAccountBalance(accountId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new AuthError("UNAUTHORIZED", "...");

  const account = await getAccount(accountId);
  if (account?.userId !== session.user.id)
    throw new AuthError("FORBIDDEN", "...");

  return { balance: account.balance };
}

// ✗ WRONG - Fails open
export async function getAccountBalance(accountId: string) {
  const account = await getAccount(accountId); // No auth check!
  return { balance: account.balance };
}
```

---

### 3. **Never Trust User Input**

- All inputs validated at request boundary
- No assumption about data type, format, or size
- Sanitize HTML entities in user-generated content
- Rate limit requests to prevent abuse

```typescript
// ✅ CORRECT
const name = getFormDataString(formData, 'name')  // Throws if missing/invalid type
const result = baseSchema.safeParse({ name })
if (!result.success) throw new ValidationError(...)

// ✗ WRONG
const name = formData.get('name') as string  // No validation
const data = JSON.parse(body)  // No try-catch
```

---

## 🛡️ Security Checklist by Event Type

### Authentication Events

#### User Registration

- [ ] Validate email format (Zod regex)
- [ ] Validate password strength (12 chars OR 8 + complexity)
- [ ] Check email doesn't already exist
- [ ] Hash password with bcrypt (12 rounds minimum)
- [ ] Never return password hash to client
- [ ] Log `AUTH_REGISTER` with email, timestamp
- [ ] Rate limit: 3 registrations per IP per 24h

```typescript
// Example: register server action
export async function register(formData: FormData) {
  const email = getFormDataString(formData, "email");
  const password = getFormDataString(formData, "password");
  const name = getFormDataString(formData, "name");

  // Validation
  const parsed = registerSchema.safeParse({ email, password, name });
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0]?.message);
  }

  // Check duplicate
  const exists = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  if (exists) {
    logger.security("REGISTER_DUPLICATE_EMAIL", { email }, "warn");
    throw new ValidationError("Email already registered");
  }

  // Create user
  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await db.insert(users).values({
    email,
    name,
    passwordHash: hashedPassword,
  });

  logger.auth("AUTH_REGISTER", { email, userId: user.id });
  return { success: true };
}
```

#### User Login

- [ ] Extract email & password from FormData safely
- [ ] Query user by email
- [ ] If not found, DO NOT reveal email doesn't exist
- [ ] Compare password hash with bcrypt.compare()
- [ ] If mismatch, return generic error
- [ ] Log failed attempts with IP, email
- [ ] Check account isn't locked (if lockout enabled)
- [ ] Generate JWT session
- [ ] Log successful login with email, userId, IP
- [ ] Rate limit: 10 attempts per IP per hour

```typescript
// AuthError handling must distinguish between:
// 1. User not found (still return "Invalid credentials")
// 2. Password mismatch (still return "Invalid credentials")
// But log internally which one it was
```

#### Password Change

- [ ] Require current password (verify with bcrypt)
- [ ] Validate new password strength
- [ ] Hash new password
- [ ] Log event with userId
- [ ] Rate limit: 5 per user per day

---

### Data Access Events

#### Creating/Modifying Records

- [ ] Verify session exists and user ID matches
- [ ] Validate all input data with Zod
- [ ] Log action with: userId, recordId, action type, timestamp
- [ ] No user agent changes on same session (account takeover detection)

```typescript
// Example: create transaction
export async function createTransaction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new AuthError("UNAUTHORIZED", "...");

  const amount = getFormDataString(formData, "amount");
  const accountId = getFormDataString(formData, "accountId");

  // Verify user owns account
  const account = await getAccount(accountId);
  if (account?.userId !== session.user.id) {
    throw new AuthError(
      "FORBIDDEN",
      "Cannot create transaction for another user",
    );
  }

  // Create transaction
  const transaction = await createTx({
    accountId,
    amount,
    userId: session.user.id,
  });

  logger.audit("TRANSACTION_CREATED", {
    userId: session.user.id,
    transactionId: transaction.id,
    amount,
  });

  return { success: true, transactionId: transaction.id };
}
```

#### Deleting Records

- [ ] Double verify user ID matches record owner
- [ ] Log deletion with userId, recordId, type
- [ ] Keep soft delete in audit, hard delete later (30 day grace)

---

### Error & Exception Events

#### Field Validation Failures

- [ ] Log with field name, expected format, timestamp
- [ ] Return generic "Validation failed" to client
- [ ] Include error code for client debugging

```typescript
if (!parsed.success) {
  logger.warn("VALIDATION_FAILED", {
    action: "login",
    fields: parsed.error.issues.map((i) => i.path),
    timestamp: new Date().toISOString(),
  });
  throw new ValidationError("Invalid input format");
}
```

#### Database Errors

- [ ] Log full error stack on server only
- [ ] Return generic "Database error" to client
- [ ] Alert ops team if rate exceeds threshold

```typescript
catch (error: unknown) {
  logger.error(error, { action: 'createUser' })
  throw new DatabaseError('REQUEST_FAILED', 'An error occurred. Please try again.')
}
```

---

## 🔐 Sensitive Data Handling

### What Can Be Logged ✅

- User ID (UUID)
- Email address
- IP address
- User-Agent browser string
- Action type (LOGIN, REGISTER, DELETE, etc)
- Timestamp (ISO8601)
- HTTP status code
- Request duration (ms)

### What MUST NEVER Be Logged ❌

- Passwords (plaintext or hashed)
- Session tokens / JWTs
- API keys or secrets
- Credit card numbers
- Social Security numbers
- OAuth tokens
- OTP codes
- Personally identifiable address data (street address, phone)

---

## 📋 Security Audit Log Format

All security logs use this structure:

```typescript
interface SecurityLog {
  timestamp: string; // "2026-04-01T12:34:56Z"
  level: "info" | "warn" | "error";
  event: string; // "AUTH_LOGIN_SUCCESS", "TRANSACTION_CREATED", etc
  userId?: string; // User performing action
  email?: string; // User email (for registration/auth)
  action?: string; // For context
  ip?: string; // Client IP
  userAgent?: string; // Browser info
  details?: Record<string, unknown>; // Additional context
}
```

**Example Output**:

```json
{
  "timestamp": "2026-04-01T12:34:56.789Z",
  "level": "info",
  "event": "AUTH_LOGIN_SUCCESS",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "ip": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "details": { "duration_ms": 245 }
}
```

---

## 🚨 Suspicious Activity Detection

Log these events with `logger.security(..., 'warn')`:

### Account Takeover Indicators

- [ ] 5+ failed logins in 5 minutes from same IP
- [ ] Login from new IP/UserAgent within 1 hour of password change
- [ ] Multiple password changes within 1 hour
- [ ] Deletions immediately after permission grant

### Data Exfiltration Indicators

- [ ] 100+ read operations in 1 minute
- [ ] Bulk export of transaction data
- [ ] Access to multiple accounts simultaneously
- [ ] API calls from unusual countries

---

## 🔑 Secret Management

### Environment Variables

Store these in `.env.local` (NEVER commit):

```bash
AUTH_SECRET=<generate with: openssl rand -base64 32>
DATABASE_URL=postgresql://user:pass@host/db
NEXTAUTH_URL=http://localhost:3000
LOG_LEVEL=debug
```

### Secrets in Code

- ✅ Use `process.env.VAR_NAME` to access
- ✅ Reference in TypeScript with `process.env['AUTH_SECRET']`
- ❌ Never hardcode secrets
- ❌ Never log `process.env.AUTH_SECRET`
- ❌ Never commit `.env.local`

---

## 🧪 Security Testing Checklist

### Before Each Production Deploy

- [ ] Run `npm run lint` (catches some security issues)
- [ ] Test login with SQL injection: `' OR '1'='1`
- [ ] Test registration with XSS payload: `<script>alert('xss')</script>`
- [ ] Verify 401 on unauthed access to `/dashboard`
- [ ] Check audit logs have all expected events
- [ ] Confirm no passwords in logs
- [ ] Test password change flow
- [ ] Verify failed login doesn't reveal email existence

### Automated Security Scanning

Run before commit:

```bash
npm audit                    # Check dependencies
npm run lint                 # TypeScript + ESLint
git diff --staged | grep -i 'password\|secret\|token'  # Manual check
```

---

## 🚨 Incident Response

### If Security Event Detected

1. **Alert** → Log with level: 'error'
2. **Isolate** → Revoke sessions if user compromised
3. **Investigate** → Check audit logs for suspicious activity
4. **Notify** → Email user if account accessed
5. **Document** → Record in incident log

### What Logs To Check

```bash
# Most recent errors
grep '"level":"error"' logs/security.log | tail -20

# Failed logins from one IP
grep 'AUTH_LOGIN_FAILED' logs/security.log | grep '192.168.1.100'

# Users with most login attempts
grep 'AUTH_LOGIN_FAILED' logs/security.log | jq '.email' | sort | uniq -c

# Password changes last hour
grep 'AUTH_PASSWORD_CHANGE' logs/security.log | grep -A1 "$(date -I -d '1 hour ago')"
```

---

## 📊 Compliance Mapping

### SOC 2 Type II (Trust & Security)

| Control         | FinTrack Implementation                       |
| --------------- | --------------------------------------------- |
| C1: Risk Mgmt   | Security review doc, threat model             |
| C2: Logging     | Audit logs for all auth events + retains data |
| C3: Info Access | Only authed users can access their data       |
| C4: User Auth   | NextAuth JWT + bcrypt, session validation     |
| A1: Policies    | Documented via STANDARDS.md + SECURITY.md     |

### PCI DSS (Payment Security)

| Requirement | Implementation                        |
| ----------- | ------------------------------------- |
| 1: Firewall | Next.js runs behind HTTPS only        |
| 2: Defaults | No default accounts, all locked down  |
| 3: Data     | Passwords hashed (bcrypt), no storage |
| 4: Encrypt  | HTTPS in transit, TODO: at-rest       |
| 8: Auth     | Sessions with JWT, unique passwords   |
| 10: Logging | All access logged with timestamp      |

### GDPR (Data Privacy)

| Requirement                  | Implementation                     |
| ---------------------------- | ---------------------------------- |
| Lawful basis                 | Explicit consent on signup         |
| Data minimization            | Only required fields stored        |
| RTBF (Right to be forgotten) | Soft delete, hard delete after 30d |
| Breach notification          | Audit logs enable investigation    |

---

## 🔗 Related Documentation

- **Error Handling**: `docs/GLOBAL_ERROR_HANDLING.md`
- **Implementation Guide**: `docs/IMPLEMENTATION_GUIDE.md`
- **Standards**: `.claude/STANDARDS.md`
- **Security Review**: `docs/SECURITY_REVIEW.md`

---

## Enforcement & Next Steps

### Immediate (M1 Phase)

- ✅ Input validation via Zod + FormData helpers
- ✅ Centralized logging with structured JSON
- ✅ Error boundaries for all routes
- 👉 **Next**: Rate limiting middleware (P1)

### Next Phase (P1)

- Account lockout (5 failed attempts → 15 min lockout)
- Rate limiting (register 3/day, login 10/hr)
- Security headers (HSTS, CSP, X-Frame-Options)

### Future (P2+)

- Data encryption at rest
- 2FA support
- Session revocation on logout
- IP geolocation detection

---

**Questions?** File an issue or check `docs/SECURITY_REVIEW.md` for detailed context.
