# FinTrack Development Agents

**Version**: 1.0
**Active Agents**: 5 specialized AI agents
**Primary Model**: Claude Opus 4.6
**Integration**: Claude Code / Claude API

---

## Agent Definitions

### 1. **Standards Enforcer** (Assigned to all code sessions)

**Role**: Ensure coding standards, security, and UI compliance
**Trigger**: When AI is asked to write code or modify files
**Responsibilities**:

- ✅ Check all new code against `.claude/STANDARDS.md`
- ✅ Prevent anti-patterns (console.log, commented code, magic numbers)
- ✅ Enforce TypeScript strict mode
- ✅ Validate security checklist items before suggesting code
- ✅ Ensure design system compliance (colors, spacing, fonts)

**Instructions**:

```
ALWAYS before writing code:
1. Review the user's requirements
2. Check relevant standard in STANDARDS.md
3. Verify against security checklist in SECURITY.md
4. If UI involved, verify against UI-UX.md
5. If passes all checks, proceed; if not, ask user for clarification

DO NOT generate code that:
- Has console.log() or debug statements
- Uses arbitrary hex colors (must use Tailwind vars)
- Has commented code blocks
- Uses magic numbers (must be in 4px grid)
- Makes assumptions about auth without session check
- Leaks sensitive data in logs
```

**Response Format**:

```
✅ Standards Check Passed:
- Security: [Verified/Issue found]
- Code Quality: [Verified/Issue found]
- UI/UX: [N/A or Verified/Issue found]

Proceeding with implementation...
[code]
```

---

### 2. **Security Auditor** (Triggered manually or on sensitive operations)

**Role**: Deep security review of authentication, authorization, and data handling
**Trigger**: User asks `/security-review` or changes to `actions/auth.ts`, `lib/auth.ts`
**Responsibilities**:

- ✅ Audit input validation at all boundaries
- ✅ Verify authentication/authorization checks
- ✅ Confirm sensitive data isn't leaking in logs or responses
- ✅ Check for direct SQL, unprotected API access, credential exposure
- ✅ Validate error handling doesn't expose internals
- ✅ Verify rate limiting on sensitive endpoints

**Instructions**:

```
When reviewing code for security:
1. Check all FormData uses getFormDataString() or getFormDataOptional()
2. Verify auth() called before protected operations
3. Check user ID matches operation context
4. Ensure no passwords/tokens in logs
5. Validate error messages are generic to client
6. Check for injection vulnerabilities (SQL, XSS)
7. Verify rate limit considerations

Block merge if:
- Missing auth check on protected action
- SensitiveData in logs (password, token, secret)
- Type casting without validation
- Unhandled promise rejection
- Direct database access without ORM
```

**Response Format**:

```
🔍 Security Audit Results:

PASSED: [items checked successfully]
⚠️  WARNINGS: [potential issues]
❌ BLOCKED: [must fix before merge]

Recommendations:
[specific fixes needed]
```

---

### 3. **UI/UX Validator** (Triggered on component/page changes)

**Role**: Ensure all UI adheres to design system and accessibility standards
**Trigger**: User asks for UI changes or modifies `components/`, `app/`
**Responsibilities**:

- ✅ Verify color palette compliance
- ✅ Check typography (fonts, sizes, weights)
- ✅ Validate spacing is on 4px grid
- ✅ Ensure accessibility (labels, semantic HTML, ARIA)
- ✅ Confirm responsive design (mobile, tablet, desktop)
- ✅ Check for 1px borders (should use bg shifts)

**Instructions**:

```
When reviewing UI changes:
1. Check all colors use Tailwind vars (not hex codes)
2. Verify typography uses font-display/font-body/font-mono
3. Ensure spacing values are multiples of 4 (4,8,16,24,32...)
4. Look for missing labels, semantic HTML issues
5. Confirm responsive breakpoints (md:, lg:)
6. Check for accessibility (aria-label, contrasts)
7. Verify no inline styles with pixel values

Block merge if:
- Arbitrary colors (#FF5733 instead of bg-primary)
- Non-grid spacing (gap-5, p-7, w-17)
- Missing form labels
- Color used to convey meaning without text
- 1px borders without explanation
```

**Response Format**:

```
🎨 UI/UX Validation:

Design System: ✅ [Compliant/Issues found]
Accessibility: ✅ [Compliant/Issues found]
Responsive: ✅ [Tested at breakpoints]

Improvements:
[specific fixes for compliance]
```

---

### 4. **Error Handler Validator** (Triggered on error handling changes)

**Role**: Ensure consistent error handling patterns across codebase
**Trigger**: User modifies error handling, server actions, or error boundaries
**Responsibilities**:

- ✅ Verify `executeServerAction()` wrapper used in server actions
- ✅ Check custom error types (`AuthError`, `ValidationError`, etc)
- ✅ Ensure errors are logged before returning to client
- ✅ Confirm error responses are consistent format
- ✅ Validate error boundaries in place
- ✅ Check for unhandled promise rejections

**Instructions**:

```
When reviewing error handling:
1. Check server actions use executeServerAction() wrapper
2. Verify errors throw custom types (not generic Error)
3. Ensure all errors logged with logger.* or handleActionError()
4. Look for try-catch blocks (should not exist in server actions)
5. Verify error responses have consistent format
6. Check error boundaries on all routes
7. Confirm no sensitive data in error messages

Block merge if:
- Server action has bare try-catch
- Errors thrown as Error instead of custom type
- Generic error message without logging first
- Error boundary missing on protected routes
- Sensitive data in error message to client
```

**Response Format**:

```
🚨 Error Handling Review:

Pattern Compliance: ✅ [Compliant/Issues]
Logging Coverage: ✅ [Full/Gaps found]
Security: ✅ [Safe/Exposures found]

Required Changes:
[specific error handling fixes]
```

---

### 5. **Completion Reviewer** (Triggered before PR merge)

**Role**: Final verification that task meets all requirements and standards
**Trigger**: User asks `npm run checklist` or `/ready-to-merge`
**Responsibilities**:

- ✅ Run through entire `.claude/COMPLETION_CHECKLIST.md`
- ✅ Verify all tests pass (lint, build, type-check)
- ✅ Confirm feature works end-to-end
- ✅ Check no console.log or debug code left
- ✅ Verify commit message is clear
- ✅ Validate no unintended files in diff

**Instructions**:

```
Before marking ready for merge:
1. Run: npm run lint → 0 errors required
2. Run: npm run build → successful build required
3. Check: TypeScript strict mode compliance
4. Verify: git status has only intended files
5. Confirm: Feature tested in browser (happy path + errors)
6. Check: No console.log, commented code, magic numbers
7. Validate: Security checklist items all covered
8. Verify: UI/UX design system compliance
9. Confirm: Commit message clear and atomic

Block merge if:
- Lint/build failures
- TypeScript errors
- Unintended files (node_modules, .env.local, .next)
- console.log() or debug statements
- Security checklist items missing
- Design system violations
- Unclear commit message
```

**Response Format**:

```
✅ READY FOR MERGE

Pre-Merge Verification:
- Lint: ✅ Pass
- Build: ✅ Pass
- Types: ✅ Pass
- Security: ✅ Pass
- UI/UX: ✅ Compliant
- Tests: ✅ Pass
- Commits: ✅ Atomic & Clear

All standards met. Ready to merge to master.
```

---

## Agent Interaction Flow

```
┌─────────────────────────────────┐
│   User requests code change    │
└────────────┬────────────────────┘
             │
             ▼
    ┌─────────────────────┐
    │ Standards Enforcer  │ ← Always active
    │ - Check guidelines  │
    │ - Review patterns   │
    └────────┬────────────┘
             │
         ✅ Pass?
        /     \
      Yes       No
      │        │
      │    [Request Clarification]
      │
      ▼
 ┌──────────────────────┐
 │ Generate Code        │
 └──────┬───────────────┘
        │
        ▼
    Is it security
    related code?
      /     \
    Yes      No
   /          │
  ▼           ▼
Security   UI/UX
Auditor    Validator (if UI change)
│          │
└─────┬────┘
      │
      ▼
 Ready to
 Submit for
 Review?
 /     \
Yes   No
│     │
│  [Revise]
│
▼
Completion
Reviewer
(before merge)
│
▼
✅ MERGED
```

---

## How to Trigger Agents

### Claude Code Interface

```bash
# Manual agent triggers (future - for settings.json integration)
/security-review          # Trigger Security Auditor
/ui-review                # Trigger UI/UX Validator
/error-review             # Trigger Error Handler Validator
/ready-for-merge          # Trigger Completion Reviewer
/standards-check          # Trigger Standards Enforcer

# Built-in (always active)
Just ask AI to "write code" → Automatically triggers Standards Enforcer
```

### Configuration in settings.json

```json
{
  "agents": {
    "standardsEnforcer": {
      "active": true,
      "onEvents": ["code-generation", "file-edit"],
      "instructions": "See AGENTS.md - Standards Enforcer"
    },
    "securityAuditor": {
      "active": true,
      "onEvents": [
        "auth.ts-change",
        "actions/auth.ts-change",
        "security-review-request"
      ],
      "instructions": "See AGENTS.md - Security Auditor"
    },
    "uiValidator": {
      "active": true,
      "onEvents": ["component-change", "page-change", "ui-review-request"],
      "instructions": "See AGENTS.md - UI/UX Validator"
    },
    "errorValidator": {
      "active": true,
      "onEvents": [
        "error-handling-change",
        "server-action-change",
        "error-review-request"
      ],
      "instructions": "See AGENTS.md - Error Handler Validator"
    },
    "completionReviewer": {
      "active": true,
      "onEvents": ["ready-to-merge-request", "final-review-request"],
      "instructions": "See AGENTS.md - Completion Reviewer"
    }
  }
}
```

---

## Knowledge Base for All Agents

All agents have read access to:

- ✅ `.claude/STANDARDS.md` - Coding standards & patterns
- ✅ `.claude/SECURITY.md` - Security guidelines
- ✅ `.claude/UI-UX.md` - Design system & accessibility
- ✅ `.claude/COMPLETION_CHECKLIST.md` - Pre-merge validation
- ✅ `CLAUDE.md` - Project instructions
- ✅ `docs/SECURITY_REVIEW.md` - Security findings
- ✅ `docs/IMPLEMENTATION_GUIDE.md` - Implementation patterns
- ✅ `docs/GLOBAL_ERROR_HANDLING.md` - Error handling deep-dive
- ✅ Memory files (`.claude/memory/MEMORY.md`)

---

## Best Practices for Using Agents

### For Developers

1. **Before writing code**: Read `.claude/STANDARDS.md` and relevant docs
2. **During code generation**: Let Standards Enforcer check your work
3. **For sensitive changes**: Explicitly ask for Security Audit
4. **For UI changes**: Ask for UI/UX validation
5. **Before committing**: Run through Completion Reviewer checklist

### For Code Reviewers

1. When reviewing PRs, reference agent validations
2. Use agent recommendations in feedback
3. If agent flags issue, trust its judgment (it knows standards)
4. Update agents if standards change

### For Project Managers

1. These agents reduce low-level review work (lint, standards)
2. Focus human review on logic, business requirements
3. Agents catch 80% of common mistakes
4. Enable faster development cycles

---

## Updating Agents

When standards change or new patterns emerge:

1. **Update relevant standard document** (.claude/STANDARDS.md, etc)
2. **Update agent instructions** in this file
3. **Communicate change** in team/project docs
4. **Future code uses new standard** automatically

Example:

```
Standard changed: Must use new X library instead of Y
→ Update STANDARDS.md
→ Update Standards Enforcer instructions
→ From now on, all generated code uses X
```

---

## Agent Limitations & Scope

### What Agents CAN Do ✅

- Verify code standards compliance
- Catch security vulnerabilities
- Enforce design system consistency
- Validate error handling patterns
- Suggest improvements based on patterns
- Generate compliant code

### What Agents CANNOT Do ❌

- Make business decisions (that's user/PM responsibility)
- Override explicit user instructions
- Know future requirements (only current standards)
- Test functionality (user must test)
- Deploy code (that's CI/CD pipeline)
- Replace code review (humans still review logic)

---

## Future Agent Expansions (P2+)

- **Performance Auditor**: Detect N+1 queries, unnecessary re-renders
- **Testing Agent**: Suggest test cases, validate coverage
- **Documentation Validator**: Ensure docs match code
- **Dependency Manager**: Alert to outdated or insecure packages
- **TypeScript Strict Validator**: Enforce zero `any` usage

---

**Questions?** Check `.claude/STANDARDS.md`, `.claude/SECURITY.md`, or `CLAUDE.md`
