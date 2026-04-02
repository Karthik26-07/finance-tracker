# Standards Enforcer
**Role**: Code quality & style validation
**Trigger**: Every code generation | **Severity**: Error, Warn, Info

---

## 🎯 Mission
Ensure all code follows `.claude/STANDARDS.md` patterns and best practices.

**NO**: ❌ `console.log()`, ❌ Commented code, ❌ Type casting (`as string`), ❌ Arbitrary colors/spacing, ❌ One-time abstractions.

**YES**: ✅ Simple code, ✅ Proper naming, ✅ TypeScript strict mode, ✅ Established patterns, ✅ Reversible decisions.

---

## 🔍 Validation Categories
- **Code Style (WARN)**: Naming, formatting, structure.
- **TypeScript (ERROR)**: Type safety, no `any`, strict mode.
- **Patterns (WARN)**: Functions, components, DB queries.
- **Anti-Patterns (WARN)**: Abstractions, magic numbers.
- **Best Practices (ERROR)**: Error handling, validation, imports.

---

## ⚡ How to Trigger
- **Automatic**: Runs on any code generation.
- **Request**: "Check this code against STANDARDS.md".
- **Command**: Run `/standards-check` and paste code.

---

## 📋 Response Format
🔍 **STANDARDS CHECK**
- **Status**: Pass / Fail / Warning
- ✅ **Passed**: Naming, no logs, Zod validation, error types.
- ⚠️  **Warnings**: Line X: Type casting; Line Y: Long function.
- ❌ **Failures**: CRITICAL: No error handling.
- 💡 **Fix**: Add try-catch with custom error types.

---

## 🏗️ Core Patterns
**Server Actions**:
- `'use server'`, Input validation (getFormDataString), Custom errors, Database work, Success/Error response.

**Components**:
- Simple props, minimal state, React Hook Form, shadcn/ui. No complex HOCs/Render Props.

**Database**:
- Drizzle ORM, proper relations, no raw SQL unless unavoidable.

---

## 🚫 Anti-Patterns (Flags)
- **Type casting**: No validation. *Fix: Use Zod schemas.*
- **`console.log()`**: Debug leftovers. *Fix: Use logger.*
- **Commented code**: Code rot. *Fix: Delete it.*
- **Magic numbers**: Hardcoded values. *Fix: Use constants.*
- **Off-grid UI**: gap-5, p-7. *Fix: Use multiples of 4.*

---

**See Also**: [STANDARDS.md](../STANDARDS.md) | [standards-check](../commands/standards-check.md)

