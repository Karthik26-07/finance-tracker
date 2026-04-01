---
name: Module Implementation Plan
description: Complete 10-module breakdown for FinTrack with file structures, components, and checklists
type: reference
---

# FinTrack Module Plan

All module specifications are stored in `docs/modules/` directory:

- **M1** (Auth): `docs/modules/01-m1-auth.md` - Login, register, profile
- **M2** (Accounts): `docs/modules/02-m2-accounts.md` - Bank accounts, wallets, transfers
- **M3** (Transactions): `docs/modules/03-m3-transactions.md` - Income/expense CRUD, filters
- **M4** (Categories): `docs/modules/04-m4-categories.md` - System + custom categories
- **M5** (Dashboard): `docs/modules/05-m5-dashboard.md` - Widgets, charts, analytics
- **M6** (Reports): `docs/modules/06-m6-reports.md` - Daily/monthly statements, export
- **M7** (Groups): `docs/modules/07-m7-groups.md` - Shared expenses, splits, settlements
- **M8** (Recurring): `docs/modules/08-m8-recurring.md` - Auto deductions, cron job
- **M9** (Budgets): `docs/modules/09-m9-budgets.md` - Spending limits, alerts
- **M10** (Settings): `docs/modules/10-m10-settings.md` - Profile, export/import, delete

## Implementation Order

1. M1 → M2 → M3 → M4 (Foundation)
2. M5 → M6 (Analytics)
3. M7 → M8 → M9 (Advanced)
4. M10 (Polish)

## Design System

See `docs/design-ref/equilibrium_finance/DESIGN.md`

- Primary: `#003178`, Secondary: `#006b5f`, Tertiary: `#71000c`
- Fonts: Manrope (headlines), Inter (body/data)
- Rule: No borders, use background shifts for boundaries
