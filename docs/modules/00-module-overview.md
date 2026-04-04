# FinTrack Module Overview

## Module Index

| Module | Name | Status | Priority |
|--------|------|--------|----------|
| M1 | Auth & User Management | Modernized (JWT) | P0 |
| M2 | Accounts & Wallets | Implemented | P0 |
| M3 | Transactions (Core) | Implemented | P0 |
| M4 | Categories & Tags | Implemented | P1 |
| M5 | Dashboard & Analytics | In Progress | P1 |
| M6 | Reports | Implemented | P1 |
| M7 | Group Expenses | Implemented | P2 |
| M8 | Recurring Deductions | Pending | P2 |
| M9 | Budgets | Pending | P2 |
| M10 | Settings & Export | Pending | P3 |

---

## Implementation Phases

### Phase 1: Foundation (Weeks 1-3)
- M1: Auth & User Management
- M2: Accounts & Wallets
- M3: Transactions (Core)
- M4: Categories & Tags

### Phase 2: Analytics (Weeks 4-5)
- M5: Dashboard & Analytics
- M6: Reports

### Phase 3: Advanced (Weeks 6-8)
- M7: Group Expenses
- M8: Recurring Deductions
- M9: Budgets

### Phase 4: Polish (Weeks 9-10)
- M10: Settings & Export
- Responsive design
- Performance optimization
- Testing

---

## Module Dependencies

```
M1 (Auth) ─┬─> M2 (Accounts) ──> M3 (Transactions) ──> M5 (Dashboard)
           │                        │                    │
           │                        ├─> M6 (Reports)     │
           │                        ├─> M7 (Groups)      │
           │                        └─> M8 (Recurring)   │
           │                                             │
           ├─> M4 (Categories) ─────────────────────────┤
           │                                             │
           └─> M9 (Budgets) ─────────────────────────────┘
                    │
                    └─> M10 (Settings/Export)
```

---

## Design System Reference

See: `../design-ref/equilibrium_finance/DESIGN.md`

### Key Tokens
- **Primary**: `#003178` (Deep blue - CTAs, links)
- **Primary Container**: `#0d47a1` (Gradient ends)
- **Secondary**: `#006b5f` (Emerald - income, positive)
- **Tertiary**: `#71000c` (Coral - expense, alerts)
- **Background**: `#f7f9fb`
- **Surface Container**: `#eceef0`

### Typography
- **Headlines**: Manrope (headers, big stats)
- **Body/Data**: Inter (UI text, numbers)
- **Tabular Nums**: Always use `font-variant-numeric: tabular-nums` for amounts

### Design Rules
1. No 1px borders - use background color shifts for boundaries
2. Whitespace as separator, not lines
3. Gradient buttons: `linear-gradient(135deg, #003178 0%, #0d47a1 100%)`
4. Glassmorphism for overlays: `backdrop-filter: blur(12px)` with semi-transparent surfaces
