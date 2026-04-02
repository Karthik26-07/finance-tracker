# Active Agents
**Total**: 6 specialized agents | **Deployment**: Automatic | **Response**: 1-5 min

---

## 🤖 Agents Overview
- **Developer Agent**: Active development, code generation, debugging.
- **Standards Enforcer**: Code quality & project pattern compliance.
- **Security Auditor**: Auth, validation, data protection reviews.
- **UI/UX Validator**: Design system, accessibility, responsive audit.
- **Error Handler Validator**: Error patterns & logging consistency.
- **Completion Reviewer**: Full pre-merge verification (runs all).

---

## ⚡ Agent Triggers
- **Dev Agent**: "Build X", "Generate Y", /developer-agent.
- **Standards**: Every code change, paste for review.
- **Security**: Auth changes, sensitive operations, /security-review.
- **UI/UX**: `components/`, `app/` changes, /ui-review.
- **Errors**: Server actions, catch blocks, /error-review.
- **Final**: /ready-for-merge, before creation of PR.

---

## 📋 Response Format
🔍 **[AGENT NAME]**
- **Status**: Pass / Fail / Warning
- ✅ **Passed**: Fixed/correct items
- ⚠️  **Warnings**: Minor issues
- ❌ **Failures**: CRITICAL / Must fix
- 💡 **Recs**: Specific fix instructions

---

## 🔄 Interaction Flow
1. **Source**: You write code or request features.
2. **Analysis**: Standards Enforcer runs on all changes.
3. **Specialized**:
   - Auth/Data → **Security Auditor**
   - UI/Layout → **UI/UX Validator**
   - Logic/Errors → **Error Handler**
4. **Final Check**: Run /ready-for-merge → **Completion Reviewer**.
5. **Result**: ALL PASS ✅ → Push; FAIL ❌ → Fix and re-check.

---

## 💡 Troubleshooting & Tips
- **Failing?** Ask "Why does this keep failing?" for deep root cause.
- **Too long?** Ask "Summarize critical issues only" for brevity.
- **Disagree?** Explain your reasoning; ask agent to reconsider.
- **Pro Tip**: Use agents early and often to avoid technical debt.

---

**See Also**: [developer-agent](./developer-agent.md) | [standards](./standards-enforcer.md) | [security](./security-auditor.md) | [UI](./ui-validator.md) | [errors](./error-handler.md) | [Reviewer](./completion-reviewer.md)

