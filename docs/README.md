# FinTrack — Personal Finance Tracker
## Project Master Plan

> A modern, full-featured personal finance tracker with dashboards, group expense tracking, recurring deductions, and deep reporting.

---

## 📁 Plan Documents Index

| File | Description |
|------|-------------|
| `01-architecture.md` | System architecture, tech stack, data flow |
| `02-database-schema.md` | Full DB schema with entity relationships |
| `03-module-plan.md` | Feature modules, responsibilities, breakdown |
| `04-ui-design-plan.md` | UI/UX design system, screens, component library |
| `05-api-plan.md` | API endpoints, request/response contracts |
| `06-reports-plan.md` | Reports module deep-dive |
| `07-recurring-deductions-plan.md` | Recurring deductions feature spec |
| `08-group-transactions-plan.md` | Group/split expense feature spec |
| `09-project-timeline.md` | Phased delivery plan with milestones |
| `10-future-roadmap.md` | Post-MVP feature ideas |

---

## 🎯 Product Vision

FinTrack is a **personal + social finance tracker** that helps individuals:
- Monitor their daily/monthly spending against budgets
- Log expenses manually with rich metadata
- Track group expenses (who paid, who owes what)
- Set automated recurring deductions (subscriptions, EMIs, bills)
- Get detailed analytics: daily/monthly opening & closing balances
- Export and share financial reports

---

## 👤 Target User

A single individual (or small group) managing personal finances — salaried professionals, students, freelancers — who want more control than a basic notes app but less complexity than enterprise accounting software.

---

## 🔑 Core Principles

1. **Web-first** — responsive web app optimised for desktop and tablet, mobile-accessible
2. **Privacy-first** — all data stored in user's Supabase-backed PostgreSQL
3. **Simple but powerful** — easy daily use, deep when you need it
4. **Group-aware** — built for shared expenses from day one

---

## 🛠️ Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Styling | TailwindCSS + shadcn/ui |
| ORM | Drizzle ORM |
| Database | PostgreSQL (via Supabase) |
| Auth | NextAuth.js v5 |
| File Storage | Supabase Storage |
| Deployment | Vercel |
