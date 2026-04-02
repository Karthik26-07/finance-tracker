# /developer-agent Command

**Agent**: Developer Agent

**Purpose**: Active development support - build features, generate code, debug issues, scaffold modules

**Duration**: 2-5 minutes per request

**When to Use**: Building features, generating code, debugging, scaffolding modules

---

## What This Does

✅ Generates complete working code following project patterns

✅ Builds features step-by-step with full implementation

✅ Debugs issues and identifies root causes

✅ Scaffolds new modules with all CRUD operations

✅ Optimizes and refactors existing code

✅ Explains implementations and design decisions

---

## How to Use

### Method 1: Generate Code

```
/developer-agent

Build a server action to create a new transaction.
Should validate amounts, check account access, and log to audit trail.
```

### Method 2: Feature Implementation

```
/developer-agent

Help me build the forgot password flow:
1. Generate reset token
2. Send email
3. Handle token expiration
4. Verify and reset password
```

### Method 3: Debug an Issue

```
/developer-agent

Debug: Users can't upload profile pictures.
Getting file size error even though file is under limit.
What's wrong?
```

### Method 4: Scaffold a Module

```
/developer-agent scaffold

Generate the full Accounts module (M2):
- Tables: accounts, account_members, account_settings
- Operations: CRUD for accounts
- Components: form, list, detail view
- Validation: all inputs
```

### Method 5: Optimize Code

```
/developer-agent

Optimize this transaction query - it's slow for large datasets.

[paste code]
```

---

## Usage Examples

### Example 1: Generate a Component

```
"Build a form component for creating a new budget.
Should have:
- Name field
- Category selection
- Amount input
- Period selector (monthly/yearly)
- Submit button"

Response:
✅ Complete React component with React Hook Form
✅ Zod validation schema
✅ TailwindCSS styling (design system)
✅ Accessibility (labels, ARIA)
✅ Error handling
✅ Loading state
✅ Ready to use
```

### Example 2: Generate Server Action

```
"Write a server action for transferring money between accounts.

Requirements:
- Validate both accounts exist
- Check user owns source account
- Check sufficient funds
- Log transaction
- Record in audit trail"

Response:
✅ Complete working server action
✅ Input validation (Zod)
✅ Auth checks
✅ Error handling (custom types)
✅ Database transaction wrapper
✅ Audit logging
✅ Tests/examples
```

### Example 3: Debug Issue

```
"Dashboard is crashing with 'Cannot read property balance'.
Here's the error:
[error stack trace]

Help me figure out what's wrong?"

Response:
1. Asks clarifying questions
2. Analyzes the error
3. Identifies root cause
4. Shows the fix
5. Explains why it happened
6. Suggests prevention
```

### Example 4: Scaffold Full Module

```
"/developer-agent scaffold

Build the Categories module (M4):
- Database: categories table with userId, name, color, icon
- Transactions: category_id foreign key on transactions
- Operations: create, read, update, delete, list, search
- Components: form, list, picker
- Validation: name length, color format
- Error handling: category in use, duplicate names
- Tests: basic CRUD tests"

Response:
✅ Complete schema
✅ All server actions
✅ All components
✅ All validation schemas
✅ Full error handling
✅ Documentation on how to integrate
```

---

## Response Format

When you get a response from Developer Agent:

```
📦 [Feature/Module Name]

CREATED:
✅ Files to create/modify
✅ Code sections

CODE (Ready to paste):
- Server action code
- Component code
- Validation schemas
- Database schema

INTEGRATION:
- How to wire it into your app
- What routes to add
- Dependencies

PATTERN EXPLANATION:
- Why this pattern
- Why this structure
- Security considerations

NEXT STEPS:
1. Review the code
2. Ask questions if unclear
3. Paste into your project
4. Run /standards-check
5. Run /security-review (if auth)
6. Run /ui-review (if UI)
7. Test it out
```

---

## What Gets Generated

### Server Actions

```typescript
✅ 'use server' directive
✅ Input validation with getFormDataString()
✅ Auth verification with auth()
✅ User ownership checks
✅ Custom error types (ValidationError, AuthError, etc.)
✅ executeServerAction wrapper
✅ Audit logging for security events
✅ Proper success/error responses
✅ TypeScript strict mode
✅ Comments explaining WHY not WHAT
```

### React Components

```typescript
✅ React Hook Form integration
✅ Zod validation
✅ TailwindCSS + design system colors
✅ Loading states
✅ Error display
✅ Accessibility (labels, semantic HTML, ARIA)
✅ Responsive design (mobile/tablet/desktop)
✅ Type safety
✅ Comments for complex logic
```

### Database Code

```typescript
✅ Drizzle ORM queries
✅ Proper table relations
✅ Transaction handling where needed
✅ Index suggestions for performance
✅ Error handling
✅ Logging for debugging
```

### Validation

```typescript
✅ Zod schemas
✅ Custom validators
✅ User-friendly error messages
✅ Type inference from schemas
✅ Server-side validation
```

---

## Development Workflow

```
1. DECIDE what to build
   ↓
2. ASK /developer-agent to build/generate
   Agent creates full implementation
   ↓
3. REVIEW the code
   Ask questions if unclear
   ↓
4. PASTE code into project
   ↓
5. VALIDATE with agents:
   /standards-check → code quality
   /security-review → security (if auth)
   /ui-review → design (if UI)
   ↓
6. TEST it
   ↓
7. COMMIT when ready
```

---

## Common Requests

### Generate Code

```
"Generate a form for [X]"
→ Full working component

"Build a server action for [X]"
→ Complete with validation + error handling

"Create a [feature] module"
→ Full CRUD + components + validation
```

### Debug Issues

```
"Why is [X] not working?"
→ Analyze + debug + provide fix

"Fix this error: [error message]"
→ Identify root cause + provide solution

"This query is slow"
→ Optimize + explain performance improvement
```

### Refactor & Optimize

```
"Improve this code"
→ Better patterns + performance

"Reduce duplication in [section]"
→ Abstract to reusable component

"Optimize this database query"
→ Better structure + explain benefits
```

### Integration Help

```
"How do I connect [component] to [server action]?"
→ Show integration pattern + code

"How do I wire in error handling?"
→ Show complete error handling pattern

"How do I add validation?"
→ Show validation + integration
```

---

## Integration with Other Agents

After Developer Agent generates code:

1. **Review it** - Make sure it makes sense
2. **/standards-check** - Validate code quality & patterns
3. **/security-review** - Deep security audit (if auth/sensitive)
4. **/ui-review** - Design system check (if UI components)
5. **/ready-for-merge** - Final verification
6. **Git commit** - Push to repo

---

## Pro Tips

1. **Be specific**: More details = better code
2. **Ask for explanations**: Understand the code, not just copy
3. **Request tests**: Ask for test cases/examples
4. **Ask about patterns**: "Why this approach?" builds knowledge
5. **Iterate**: "Can you adjust this?" for modifications
6. **Debug with context**: Share error messages + code
7. **Review first**: Before using, review generated code

---

## Quick Start Examples

Try these right now:

```
/developer-agent
Generate a login form component

---

/developer-agent
Build the forgot password flow

---

/developer-agent
Create a transactions list component

---

/developer-agent scaffold
Generate the full Categories module

---

/developer-agent
Debug: Why can't I update my profile?
```

Each takes 2-5 minutes and gives you ready-to-use code.

---

**See Also**:

- [Developer Agent Details](../agents/developer-agent.md)
- [agents/index.md](../agents/index.md) - All agents
- [STANDARDS.md](../STANDARDS.md) - Coding standards
- [SECURITY.md](../SECURITY.md) - Security standards
- [UI-UX.md](../UI-UX.md) - Design system

