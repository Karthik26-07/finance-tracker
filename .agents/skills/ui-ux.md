---
name: FinTrack Aesthetic Engine
description: Skill to generate high-fidelity, compliant UI matching Equilibrium Finance.
---

# 🎨 UI & UX Design Skill

When writing React Components or modifying Tailwind configurations, enforce this signature aesthetic:

### 1. Color Palette (Strictly Enforced)
- **Primary**: `#003178` (Navy) - Brand, CTAs | `bg-primary`, `text-primary`
- **Primary Container**: `#0d47a1` (Deep Navy) - Hover | `bg-primary-container`
- **Secondary**: `#006b5f` (Emerald) - Accents | `bg-secondary`
- **Tertiary**: `#71000c` (Coral) - Destructive | `bg-tertiary`

### 2. Typography Rules
- Use `font-display` (Sora), `font-body` (DM Sans), and `font-mono` (JetBrains Mono).
- ALL tabular/financial numbers must use `tabular-nums` CSS. Use `formatter.format()` from `lib/formatters`.

### 3. Elevation over Borders
- NEVER use generic 1px borders (`border border-gray-200`).
- Create separation utilizing background color shifts (`bg-surface` vs `bg-elevated`) and soft shadow tiers (`shadow-sm`, `shadow-md`, `shadow-xl`).
- Utilize Glassmorphism over bold solid shapes when overlaying.

### 4. Scale & Alignment
- Strict adherence to the 4px grid. Use multiples (`p-2`, `p-4`, `p-8`). Never arbitrary (`p-[10px]`).
