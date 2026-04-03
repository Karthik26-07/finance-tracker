---
name: FinTrack Coding Standards Implementation
description: Skill for strictly enforcing FinTrack project architecture, simplicity rules, and backend-frontend boundaries.
---

# 📚 Coding Standards Skill

Execute these rules whenever generating or refactoring code:

### 1. Simplicity Over Engineering
- Build only what is asked. Do not add future-proofing or "just in case" logging.
- Do not create abstractions for single-use logic.
- Avoid utility functions for single files. Keep code inline if used only once.

### 2. File & Component Structure
- Keep everything strongly typed in TypeScript. NEVER use `any`.
- Keep the `lib/db/queries` purely for Drizzle ORM queries using `db.query`.
- Use Server Actions wrappers in `/actions`.
- Forms MUST use `react-hook-form` and `@hookform/resolvers/zod` with pre-defined schemas in `lib/validations`.

### 3. Server Actions & Returns
Avoid throwing random errors in API routes. Return strong discriminated union structures:
```typescript
type ActionResponse = 
 | { success: true; data: any }
 | { error: string; code?: string }
```

### 4. Database (Drizzle ORM)
- Do not write raw SQL strings. Use Drizzle.
- Avoid N+1 query patterns; use joins or Drizzle's `.with` relation querying.
