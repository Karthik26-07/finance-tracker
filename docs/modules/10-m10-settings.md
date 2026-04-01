# M10 — Settings & Export

## Purpose
App configuration, profile management, and data export/import.

---

## Features

### Profile Settings
- [ ] Name, email, currency, timezone
- [ ] Avatar upload (Supabase Storage)
- [ ] Password change

### Data Management
- [ ] Export all data: CSV, PDF, Excel
- [ ] Import from CSV (with column mapping)
- [ ] Backup & restore (JSON export/import)

### Account Management
- [ ] Category management (link to `/settings/categories`)
- [ ] Account management (link to `/settings/accounts`)
- [ ] Delete account + all data

### App Preferences
- [ ] Theme toggle (light/dark)
- [ ] Date format preference
- [ ] Currency format preference

---

## File Structure

```
app/
└── (dashboard)/
    └── settings/
        ├── page.tsx (hub)
        ├── profile/page.tsx
        ├── accounts/page.tsx
        ├── categories/page.tsx
        ├── export/page.tsx
        └── danger/page.tsx

components/
└── settings/
    ├── SettingsHub.tsx
    ├── ProfileForm.tsx
    ├── AvatarUpload.tsx
    ├── ExportTab.tsx
    ├── ImportWizard.tsx
    └── DangerZone.tsx

actions/
├── auth.ts (deleteAccount)
└── settings.ts

lib/
├── utils/export.ts
├── utils/import.ts
└── supabase.ts (avatar upload)
```

---

## Components to Create

### Pages
- [ ] `app/(dashboard)/settings/page.tsx` - Settings hub with tabs
- [ ] `app/(dashboard)/settings/profile/page.tsx` - Profile form
- [ ] `app/(dashboard)/settings/export/page.tsx` - Export options

### Components
- [ ] `components/settings/SettingsHub.tsx` - Tab navigation
- [ ] `components/settings/ProfileForm.tsx` - Name, currency, timezone
- [ ] `components/settings/AvatarUpload.tsx` - Image upload
- [ ] `components/settings/ExportTab.tsx` - CSV/PDF/Excel export
- [ ] `components/settings/ImportWizard.tsx` - CSV import with mapping
- [ ] `components/settings/DangerZone.tsx` - Delete account

### Server Actions
- [ ] `updateProfile(input)` - Update name, currency, timezone
- [ ] `updateAvatar(file)` - Upload to Supabase Storage
- [ ] `changePassword(oldPassword, newPassword)`
- [ ] `exportData(format)` - Generate export file
- [ ] `importData(csv)` - Parse and import
- [ ] `deleteAccount()` - Hard delete user + all data

---

## Export Formats

### CSV Export
```csv
Date,Description,Category,Account,Type,Amount,Tags,Note
2025-01-14,Zomato,Food & Dining,HDFC Savings,Expense,-450.00,"food,lunch",Biryani
```

### PDF Export
- Header: User name, export date, date range
- Transaction table
- Summary footer

### Excel Export
- Sheet 1: Transactions
- Sheet 2: Category Summary
- Sheet 3: Monthly Summary
- Sheet 4: Account Balances

### JSON Backup
```json
{
  "exportedAt": "2025-01-14T10:30:00Z",
  "user": { ... },
  "accounts": [ ... ],
  "categories": [ ... ],
  "transactions": [ ... ],
  "budgets": [ ... ],
  "recurringRules": [ ... ]
}
```

---

## Import Wizard

### Step 1: Upload CSV
```
┌────────────────────────────────────────┐
│  Import Transactions                   │
│ ────────────────────────────────────── │
│  Drop CSV file here or click to browse │
│                                        │
│  Supported formats: .csv, .xlsx        │
│  Max file size: 10MB                   │
│                                        │
│  [Browse Files]                        │
└────────────────────────────────────────┘
```

### Step 2: Column Mapping
```
┌────────────────────────────────────────┐
│  Map Columns                           │
│ ────────────────────────────────────── │
│  CSV Column      →  FinTrack Field     │
│  ───────────────────────────────────── │
│  Date          →  Date           ✅    │
│  Description   →  Note          ✅    │
│  Amount        →  Amount        ✅    │
│  Category      →  Category       ✅    │
│  (skip)        →  Tags          ⚠     │
│                                        │
│  [Back]           [Import]             │
└────────────────────────────────────────┘
```

### Step 3: Preview & Confirm
```
┌────────────────────────────────────────┐
│  Preview (first 5 rows)                │
│ ────────────────────────────────────── │
│  ✓ 2025-01-14 | Zomato | -₹450 | Food │
│  ✓ 2025-01-13 | Petrol | -₹500 | Trans│
│  ✓ 2025-01-12 | Salary | +₹75k | Inc  │
│                                        │
│  124 rows to import                    │
│  Estimated time: 5 seconds             │
│                                        │
│  [Back]           [Confirm Import]     │
└────────────────────────────────────────┘
```

---

## Delete Account Flow

```
┌────────────────────────────────────────┐
│  Danger Zone                           │
│ ────────────────────────────────────── │
│  ⚠️ Delete Account                     │
│                                        │
│  This action is permanent and cannot   │
│  be undone. All your data will be      │
│  permanently deleted:                  │
│                                        │
│  • User account                        │
│  • All accounts                        │
│  • All transactions                    │
│  • All groups                          │
│  • All settings                        │
│                                        │
│  Type "DELETE" to confirm:             │
│  [________________]                    │
│                                        │
│  [Cancel]      [Delete Forever]        │
└────────────────────────────────────────┘
```

---

## Design Reference

**Primary:** `docs/design-ref/settings_export_m10/`
- `code.html` — Settings tabs navigation, profile preferences form, export format buttons, import CSV wizard
- `screen.png` — Full visual reference

**Design Plan:** `docs/04-ui-design-plan.md`
- Settings tab navigation pattern
- Export button group (CSV/PDF/Excel/JSON)
- Import wizard step pattern (Upload → Map → Preview → Confirm)
- Danger zone styling

**Equilibrium Finance:** `docs/design-ref/equilibrium_finance/DESIGN.md`
- Form field styling with Material icons
- Avatar upload component

---

## Design Specifications

### Settings Layout
```
┌────────────────────────────────────────────────────────┐
│  Settings                                              │
├────────────────────────────────────────────────────────┤
│  [Profile] [Accounts] [Categories] [Export] [Danger]  │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Content area for selected tab                        │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Profile Form
```
┌────────────────────────────────────────┐
│  Profile Settings                      │
│ ────────────────────────────────────── │
│  Name:       [John Doe           ]     │
│  Email:      [john@example.com   ]     │
│  Currency:   [USD ▼              ]     │
│  Timezone:   [America/New_York   ▼]    │
│                                        │
│  Avatar:                               │
│  [Current Avatar]  [Change] [Remove]   │
│                                        │
│  [Save Changes]                        │
└────────────────────────────────────────┘
```

---

## Implementation Checklist

### Pages
- [ ] Build settings hub with tabs
- [ ] Build profile form
- [ ] Build export page
- [ ] Build import wizard

### Components
- [ ] Build avatar upload component
- [ ] Build export buttons (CSV/PDF/Excel)
- [ ] Build import column mapper
- [ ] Build danger zone component

### Server Actions
- [ ] Implement profile update
- [ ] Implement avatar upload
- [ ] Implement password change
- [ ] Implement data export
- [ ] Implement CSV import
- [ ] Implement account deletion

### Testing
- [ ] Test profile update
- [ ] Test avatar upload
- [ ] Test export formats
- [ ] Test import flow
- [ ] Test account deletion
