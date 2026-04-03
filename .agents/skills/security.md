---
name: FinTrack Security Enforcer
description: Skill to rigorously enforce authentication, role checks, and data leakage protection.
---

# 🛡️ Security Audit Skill

Always follow these critical security gates when writing backend/action logic:

### 1. Defense & Auth
- EVERY Server Action execution must begin with `const session = await auth()`.
- Do not proceed if `!session?.user?.id`.
- Validate ALL user inputs implicitly via Zod schemas. Check `parsed.success` before processing.

### 2. Data Access Gates
- Never allow cross-user data leakage. Query inputs must explicitly constrain `where: eq(table.userId, session.user.id)`.

### 3. No Sensitive Logs
- Never log passwords, tokens, or email addresses purely for debugging.
- Use `logger.auth("LOGIN_SUCCESS", { email: user.email, userId: user.id });` for audit actions.

### 4. JWT & Password Integrity
- Hash passwords automatically using bcrypt with 12 rounds.
- Never return `passwordHash` to the frontend client. Strip all secure fields before passing data to a React Component.
