# UI/UX Validator

**Role**: Design & accessibility compliance
**Trigger**: Component/page changes
**Severity**: Error, Warn, Info

---

## Mission

Ensure all UI follows design system, is accessible, and responsive.

**NO**: ❌ Arbitrary hex (#FF5733), ❌ Off-grid spacing (gap-5, p-7), ❌ Missing labels, ❌ Non-semantic HTML, ❌ 1px borders, ❌ Hard-coded px.

**YES**: ✅ Design system vars, ✅ 4px grid, ✅ Accessible forms, ✅ Semantic HTML, ✅ Background shifts, ✅ Responsive.

---

## 🔍 Validation Areas

- **Colors (ERROR)**: Approved palette only (no hex).
- **Typography (WARN)**: Correct fonts/scale.
- **Spacing (ERROR)**: 4px grid alignment.
- **Accessibility (ERROR)**: Labels, contrast, semantic.
- **Responsive (WARN)**: Mobile to desktop audit.
- **Borders (WARN)**: No 1px; use background shifts.

---

## 🎨 Color Palette

- **Primary**: `#003178` (Navy) | `bg-primary`, `text-primary`
- **Container**: `#0d47a1` (Deep Navy) | `bg-primary-container`
- **Secondary**: `#006b5f` (Emerald) | `bg-secondary`
- **Tertiary**: `#71000c` (Coral) | `bg-tertiary`
- **Success**: `#2E7D32` | **Error**: `#C62828`

---

## 📝 Typography

- **Page titles**: `text-5xl font-display font-semibold`
- **Sections**: `text-4xl font-display font-semibold`
- **Cards**: `text-2xl font-display font-semibold`
- **Body**: `text-base font-body` (lg: `lg`, sm: `sm`)
- **Data**: `font-mono tabular-nums`

---

## 📐 Spacing Grid (4px)

- **XS**: `p-1` (4px) | **SM**: `p-2` (8px) | **MD**: `p-4` (16px)
- **LG**: `p-6` (24px) | **XL**: `p-8` (32px) | **2XL**: `p-12` (48px)

---

## 🚨 Critical Issues

### ❌ Arbitrary Color vs ✅ Correct

```tsx
// ❌ <button style={{ backgroundColor: '#003178' }}>
// ✅ <button className="bg-primary text-white">
```

### ❌ Off-Grid vs ✅ Grid

```tsx
// ❌ <div className="gap-5 p-7"> (20px/28px)
// ✅ <div className="gap-4 p-6"> (16px/24px)
```

### ❌ 1px Borders vs ✅ Shifts

```tsx
// ❌ <div className="border-l border-gray-300">
// ✅ <div className="bg-elevated border-l-4 border-l-primary">
```

---

## ♿ Accessibility Checklist

- [ ] Labels for all inputs
- [ ] Semantic HTML (`button`, `nav`, `main`)
- [ ] ARIA labels for icon-only buttons
- [ ] Contrast >= 4.5:1
- [ ] Keyboard navigation support

---

## 📱 Breakpoints

- **Mobile**: `< 640px` (base)
- **Tablet**: `sm: 640px` | `md: 768px`
- **Desktop**: `lg: 1024px` | `xl: 1280px`

---

**See Also**: [UI-UX.md](../UI-UX.md) | [ui-review](../commands/ui-review.md)
