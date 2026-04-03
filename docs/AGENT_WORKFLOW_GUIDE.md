# How to Use Your Antigravity Agents

This guide explains how to properly utilize the automated `.agents` ecosystem you have set up for FinTrack. Because we have mapped the memory management directly into the background, you no longer need to manually copy-paste rules, complain about token limits, or remind the AI to use Next.js 15. 

Simply use **Slash Commands** at the start of your prompt to automatically load the exact skill set required for your task.

---

## 🛠️ Case 1: Developing a Brand New Module
*Example: You are ready to start building "M8 - Recurring Deductions".*

**What to say:**
> `/develop Build the Recurring Deductions module M8. Start with the database schema and the server actions.`

**What happens behind the scenes:**
1. The agent reads `.agents/MEMORY.md` instantly.
2. It looks at `docs/modules/00-module-overview.md`, sees M8 is pending, and loads only the `08-m8-recurring.md` documentation file to avoid token bloat.
3. It loads the `nextjs.md` skill, ensuring all React 19 rules (no unused `useEffects`, proper `'use server'` wrappers) are mapped.
4. It builds the code.

---

## 🏗️ Case 2: Adding a Feature & Finishing Half-Done Code
*Example: You started the UI layout for a Dashboard widget, but want the agent to wire up the actual Drizzle ORM queries.*

**What to say:**
> `/develop Wire up the Drizzle ORM queries for the open Dashboard widget file, ensure it matches our server actions standard.`

**What happens behind the scenes:**
1. The agent loads the `.agents/skills/standards.md` automatically.
2. It sees your open active file in your IDE.
3. It writes the `db.query` explicitly to your rules and ensures proper Typescript typing (avoiding `any`).

---

## 🎨 Case 3: Generating Complex UI / UX
*Example: You need a visually stunning card for a transaction row, but want it to rigorously follow your "Equilibrium Finance" aesthetic.*

**What to say:**
> `/ui-design Build a glassmorphic transaction breakdown modal.`

**What happens behind the scenes:**
1. The agent loads `.agents/skills/ui-ux.md`.
2. It grabs the exact hex codes (`#003178` primary), ensures there are no `1px borders`, utilizes `tabular-nums` for currency, and drops it into your `components/` path perfectly mapped to your color scheme.

---

## 🕵️‍♂️ Case 4: Fixing & Troubleshooting Bugs
*Example: You are getting a Next.js 15 caching error or a random TypeScript failure.*

**What to say:**
> `/audit Why am I getting this Server Action error when submitting the form?`

**What happens behind the scenes:**
1. The agent executes the **Unified Auditor**.
2. It cross-checks your code against `standards.md` and `nextjs.md` to see if you violated a Next.js 15 convention (e.g. passing a non-serializable object from Server to Client).
3. It automatically runs a `grep_search` against your `.next-docs/` folder to fetch the exact bleeding-edge Next.js documentation and fixes the bug without hallucinating.

---

## 🛡️ Case 5: Securing the Backend (Auth & Roles)
*Example: You wrote an API route but want to make sure it can't be hacked.*

**What to say:**
> `/security-review on my new actions/groups.ts file`

**What happens behind the scenes:**
1. The agent loads `.agents/skills/security.md`.
2. It explicitly checks for `await auth()` gatekeeping.
3. It ensures you specifically scoped your Drizzle WHERE clauses to `session.user.id` so data cannot leak across user profiles.

---

## ✅ Case 6: Pushing to Production
*Example: You finished a massive session and want to ensure everything is perfect before a Git Commit.*

**What to say:**
> `/ready-for-merge`

**What happens behind the scenes:**
1. The agent checks `00-module-overview.md` to ensure project states are correctly marked as "Implemented".
2. It runs `npm run lint` and TypeScript checks entirely in the background.
3. It gives you a green-light checklist, confirming your push will not break the build.
