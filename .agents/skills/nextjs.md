---
name: NextJS 15 & React 19 Mastery
description: Skill for strictly enforcing the latest Next.js 15 App Router paradigms and React 19 API usage.
---

# 🚀 Next.js 15 Standards Skill

When generating server actions, layouts, routes, or React components, rigorously enforce these standards to prevent compilation failures under Next.js 15 / React 19 and Tailwind 4.

### 1. Zero Hallucinations via `.next-docs`
- For ANY NextJS feature (Route Handlers, Middleware, Server Components, caching), you MUST `grep_search` or `view_file` the `.next-docs/` directory to learn the exact Next.js 15.5 API signature before writing code.
- Ignore your internal training data for NextJS App Router as it defaults to v13/14 rules which are deprecated.

### 2. React 19
- Utilize React 19 features where appropriate.
- Forwarding refs is no longer needed (you can pass `ref` as a standard prop).
- Rely on `use()` context unwrapping where useful.

### 3. Server Actions & Mutations
- Next 15 Server Actions must be strictly defined in separate `.ts` files inside `/actions` with the `'use server'` directive at the top.
- They must not mutate or throw primitive Error objects; catch and format them using the standard `ActionResponse` signature.

### 4. Client Components vs Server Components
- Keep boundary strictly clear via `'use client'`. 
- Data fetching belongs natively in Server Components leveraging parallel/sequential fetching patterns without `useEffect()`. Context, state (`useState`), and interactivity handlers belong strictly in Client components.
