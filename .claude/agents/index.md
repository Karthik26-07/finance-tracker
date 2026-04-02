# Active Agents

**Total Agents**: 6 specialized agents (1 teaching + 5 validators)
**Deployment**: Automatic on relevant code events
**Interaction**: Via commands or automatic triggers
**Response Time**: 1-5 minutes per agent

---

## Agents Overview

| Agent                       | Role                         | Triggers               | Response Time | Tools                   |
| --------------------------- | ---------------------------- | ---------------------- | ------------- | ----------------------- |
| **Developer Agent**         | Active development support   | Build features         | 2-5 min       | Code generation, debugging |
| **Standards Enforcer**      | Code quality & patterns      | Every code generation  | 1-2 min       | Linter, pattern matcher |
| **Security Auditor**        | Auth, validation, protection | Auth file changes      | 3-5 min       | Security scanner        |
| **UI/UX Validator**         | Design system compliance     | Component changes      | 2-3 min       | Design checker          |
| **Error Handler Validator** | Error pattern consistency    | Error handling changes | 1-2 min       | Pattern validator       |
| **Completion Reviewer**     | Full pre-merge verification  | Before merge           | 5 min         | All above agents        |

---

## Individual Agents

Each agent has dedicated documentation:

- [developer-agent.md](./developer-agent.md) - Active development support, code generation, feature building
- [standards-enforcer.md](./standards-enforcer.md) - Code style, patterns, best practices
- [security-auditor.md](./security-auditor.md) - Auth, input validation, data protection
- [ui-validator.md](./ui-validator.md) - Design system, accessibility, responsive
- [error-handler.md](./error-handler.md) - Error patterns, logging, consistency
- [completion-reviewer.md](./completion-reviewer.md) - Full pre-merge verification

---

## How Agents Work

### Agent Activation

Agents activate **automatically** when:

```
Developer Agent
├─ You ask "Build X feature"
├─ You ask "Generate X code"
├─ You ask /developer-agent
├─ Debugging requests
└─ Module scaffolding requests

Standards Enforcer
├─ You ask Claude to write code
├─ You paste code for review
└─ You modify any file

Security Auditor
├─ Changes to actions/auth.ts
├─ Changes to lib/auth.ts
├─ You ask /security-review
└─ Sensitive operation detected

UI/UX Validator
├─ Changes to components/
├─ Changes to app/ routes
├─ You ask /ui-review
└─ New component created

Error Handler Validator
├─ Changes to error handling
├─ Changes to server actions
├─ You ask /error-review
└─ Exception handling added

Completion Reviewer
├─ You ask /ready-for-merge
├─ Before creating PR
└─ Final verification before commit
```

### Agent Response Pattern

All agents use same response format:

```
🔍 [AGENT NAME]

Status: [Pass/Fail/Warning]

PASSED:
✅ Item 1
✅ Item 2

WARNINGS:
⚠️  Item 1
⚠️  Item 2

FAILURES:
❌ CRITICAL: Item 1
❌ Must fix: Item 2

RECOMMENDATIONS:
[Specific fixes needed]

Timeline: X minutes to fix
Reference: [Relevant docs]
```

---

## Agent Interaction Flow

```
┌─────────────────────────┐
│ You write code or ask  │
│ Claude for something   │
└──────────┬──────────────┘
           │
    ┌──────▼──────┐
    │ Is it code? │
    └──────┬──────┘
           │ YES
           │
    ┌──────▼────────────────────┐
    │ Standards Enforcer        │ ← Always active
    │ ✅ Check patterns        │
    │ ✅ Check style           │
    │ ✅ Check anti-patterns   │
    └──────┬────────────────────┘
           │
    ┌──────▼─────────────────────╖
    │ Is it auth/security code?  ║
    └────┬─────────┬──────────┬──╜
         │         │          │
       YES       NO       LATER
         │         │          │
    ┌────▼────┐   │          │
    │Security │   │          │
    │Auditor  │   │          │
    └────┬────┘   │          │
         │        │          │
    ┌────▼────┐   │          │
    │Is it UI? ├────┐        │
    └────┬────┘    │        │
         │        YES       │
       NO │        │        │
         │    ┌────▼────┐   │
         │    │UI/UX    │   │
         │    │Validator│   │
         │    └────┬────┘   │
         │         │        │
         │    ✅ Design  │
         │    ✅ Access  │
         │    ✅ Spacing │
         │         │        │
    ┌────▼─────────▼────┐   │
    │Error handling?    │   │
    └────┬──────────┬───┘   │
         │ YES      │ NO    │
    ┌────▼────┐   │        │
    │Error    │   │   Ready┤
    │Handler  │   │   to   │
    │Validator│   │   use? │
    └─────┬───┘   │        │
          │       │     YES│
          │       │        │
          └───┬───┴────┬───┘
              │        │
              NO      YES
              │        │
         FIX IT  ┌─────▼──────┐
             │  │Ask /ready- │
             │  │for-merge   │
             │  └─────┬──────┘
             │        │
             │    ┌───▼─────────┐
             │    │Completion   │
             │    │Reviewer     │
             │    │✅ All pass? │
             │    └───┬─────────┘
             │        │
        ╔════▼════════▼════╗
        ║ ✅ READY TO PUSH║
        ║    or           ║
        ║ ❌ FIX ISSUES   ║
        ╚═════════════════╝
```

---

## Custom Agents (Future)

Want to create a custom agent? See [agent-template.md](./agent-template.md)

---

## Agent Capabilities

Each agent can:

- ✅ Review code for violations
- ✅ Explain issues clearly
- ✅ Suggest specific fixes
- ✅ Provide code examples
- ✅ Link to relevant documentation
- ✅ Determine severity (ERROR, WARN, INFO)

Agents CANNOT:

- ❌ Make business decisions
- ❌ Override explicit instructions
- ❌ Deploy code
- ❌ Test functionality (you must)
- ❌ Replace human judgment

---

## Workflow with Agents

### Recommended Flow

```
0. Need to build something?
   ↓
1. Ask /developer-agent to build/generate
   → Developer Agent creates complete implementation
   ↓
2. Review the generated code
   ↓
3. Paste code into project
   ↓
4. Ask Claude to write code
   → Standards Enforcer auto-activates
   ↓
5. Paste code for review
   → Standards Enforcer checks
   ↓
6. If auth/security code
   → Ask /security-review
   → Security Auditor activates
   ↓
7. If UI components
   → Ask /ui-review
   → UI/UX Validator activates
   ↓
8. If error handling
   → Ask /error-review
   → Error Handler Validator activates
   ↓
9. Before commit
   → Ask /ready-for-merge
   → Completion Reviewer runs all agents
   ↓
10. All agents pass → Push to remote
```

---

## Getting Help from Agents

### Ask Directly

```
"I'm not sure why this failed. Explain in simpler terms."
```

Agent will:

- ✅ Rephrase the issue
- ✅ Give concrete example
- ✅ Show exact fix needed

### Ask for Learning

```
"Why is this pattern important?"
```

Agent will:

- ✅ Explain the pattern
- ✅ Show consequences of breaking it
- ✅ Suggest reading materials

### Ask for Implementation

```
"Show me the correct way to fix this"
```

Agent will:

- ✅ Provide code example
- ✅ Explain each line
- ✅ Link to documentation

---

## Troubleshooting Agents

### Agent Keeps Failing on Same Issue

```
→ Ask: "Why does this keep failing?"
→ Share: Full context of code and error
→ Get: Deep dive into root cause + solution
```

### Agent Response Too Long

```
→ Ask: "Can you summarize just the critical issues?"
→ Get: Concise list of must-fix items
```

### Disagree with Agent Finding

```
→ Ask: "Why is this an issue?"
→ Explain: Your reasoning
→ Get: Agent reconsiders OR explains better
```

---

## Pro Tips

1. **Use agents early**: Don't wait for end of day
2. **Trust the agents**: They know the standards
3. **Ask questions**: Understanding why matters
4. **Iterate**: Fix → ask agent again → repeat
5. **Learn from patterns**: Each feedback teaches you

---

**Reference**: Individual agent files, `.claude/STANDARDS.md`, `.claude/SECURITY.md`, `.claude/UI-UX.md`
