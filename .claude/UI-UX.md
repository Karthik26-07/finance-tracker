# FinTrack UI/UX Design System
**Theme**: Precision Architect Financial | **Stack**: shadcn/ui (Tailwind)

---

## 🎨 Color Palette
**Core**:
- **Primary**: `#003178` (Navy) - Brand, CTAs | `bg-primary`, `text-primary`
- **Primary Container**: `#0d47a1` (Deep Navy) - Hover | `bg-primary-container`
- **Secondary**: `#006b5f` (Emerald) - Accents | `bg-secondary`
- **Tertiary**: `#71000c` (Coral) - Destructive | `bg-tertiary`

**Semantic**:
- **Success**: `#2E7D32` | **Warning**: `#F57C00` | **Error**: `#C62828` | **Info**: `#0277BD`

**Neutral**:
- **BG**: `#FAFAFA` | **Surface**: `#FFFFFF` | **Elevated**: `#F5F5F5` | **Highlight**: `#E3F2FD`

---

## 📝 Typography
**Fonts**: Sora (Display), DM Sans (Body), JetBrains Mono (Data)

**Scale**:
- **Display L/M**: 56px/44px | 600 | Page/Section Titles | `text-5xl`/`text-4xl`
- **Headline**: 32px | 600 | Card Titles | `text-2xl`
- **Body L/M/S**: 18px/16px/14px | 400 | Text | `text-lg`/`text-base`/`text-sm`
- **Label L/S**: 14px/12px | 500 | Buttons/Helper | `text-sm`/`text-xs`
- **Code**: 14px | 400 | Data/Code | `font-mono tabular-nums`

---

## 📐 Spacing & Layout
**4px Grid Scale**:
- **XS**: 4px (`p-1`) | **SM**: 8px (`p-2`) | **MD**: 16px (`p-4`)
- **LG**: 24px (`p-6`) | **XL**: 32px (`p-8`) | **2XL**: 48px (`p-12`)

**Breakpoints**: `sm: 640`, `md: 768`, `lg: 1024`, `xl: 1280`, `2xl: 1536`

---

## 🧩 Component Library (Condensed)
- **Buttons**: Use gradients for primary, ghost for secondary. All `transition-all`.
- **Cards**: `bg-surface rounded-xl shadow-sm p-6`. No 1px borders; use bg shifts.
- **Forms**: Label (`text-sm font-medium`), Input (`rounded-lg focus:ring-2`), Error (`text-error text-sm`).
- **Tables**: `w-full`, `font-mono tabular-nums` for currency.

---

## ♿ Accessibility
- Associated labels (`htmlFor`) | Semantic HTML (`main`, `nav`, `button`)
- Contrast >= 4.5:1 | ARIA labels for icon buttons | Keyboard navigation

---

## 🧪 Design QA Checklist
- [ ] No arbitrary hex (approved palette only)
- [ ] On-grid spacing (multiples of 4)
- [ ] Responsive (375px to 1920px)
- [ ] No 1px borders (use bg elevation/shifts)
- [ ] Tabular numbers for currency
- [ ] Interactive states (hover/focus)

---

**See Also**: [STANDARDS.md](../STANDARDS.md) | [SECURITY.md](../SECURITY.md)
