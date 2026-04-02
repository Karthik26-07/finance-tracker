# UI/UX Validator Agent

**Role**: Design system & accessibility compliance
**Trigger**: Component/page changes
**Response Time**: 2-3 minutes
**Severity Levels**: Error, Warn, Info

---

## Mission

Ensure all UI follows design system, is accessible, and responsive.

**No**:
- Arbitrary colors (#FF5733)
- Off-grid spacing (gap-5, p-7)
- Missing labels
- Non-semantic HTML
- 1px borders
- Hard-coded pixel values

**Yes**:
- Design system colors
- 4px grid spacing
- Accessible forms
- Semantic HTML
- Background shifts
- Responsive layouts

---

## What This Agent Checks

| Area | Focus | Severity |
|------|-------|----------|
| Colors | Design system vars only | ERROR |
| Typography | Correct fonts/sizes | WARN |
| Spacing | 4px grid alignment | ERROR |
| Accessibility | Labels, contrast, semantic HTML | ERROR |
| Responsive | Mobile/tablet/desktop | WARN |
| Borders | Background shifts, no 1px | WARN |

---

## Color Palette

```
bg-primary / text-primary        #003178 (Navy)
bg-primary-container             #0d47a1 (Deep Navy)
bg-secondary / text-secondary    #006b5f (Emerald)
bg-tertiary / text-tertiary      #71000c (Coral)
bg-success / text-success        #2E7D32 (Green)
bg-error / text-error            #C62828 (Red)
```

---

## Typography

```
Page titles:     text-5xl font-display font-semibold
Section headers: text-4xl font-display font-semibold
Card titles:     text-2xl font-display font-semibold
Body large:      text-lg font-body
Body default:    text-base font-body
Body small:      text-sm font-body
Code & data:     font-mono tabular-nums
```

---

## Spacing Grid

```
4px:   gap-1, p-1 (XS)
8px:   gap-2, p-2 (SM)
16px:  gap-4, p-4 (MD)
24px:  gap-6, p-6 (LG)
32px:  gap-8, p-8 (XL)
48px:  gap-12, p-12 (2XL)
```

---

## Critical Issues

### Issue: Arbitrary Color

```tsx
// ❌ CRITICAL
<button style={{ backgroundColor: '#003178' }}>Click</button>

// ✅ CORRECT
<button className="bg-primary text-white">Click</button>
```

### Issue: Off-Grid Spacing

```tsx
// ❌ CRITICAL - 20px & 28px not on grid
<div className="gap-5 p-7">Content</div>

// ✅ CORRECT - 16px & 24px on grid
<div className="gap-4 p-6">Content</div>
```

### Issue: Missing Label

```tsx
// ❌ CRITICAL - No label
<input placeholder="Email" type="email" />

// ✅ CORRECT - Associated label
<label htmlFor="email">Email</label>
<input id="email" type="email" />
```

### Issue: 1px Border

```tsx
// ❌ CRITICAL - Borders forbidden
<div className="border-l border-gray-300">Content</div>

// ✅ CORRECT - Background shift
<div className="bg-elevated pl-4 border-l-4 border-l-primary">Content</div>
```

---

## Accessibility Checklist

- [ ] Form inputs have labels
- [ ] Semantic HTML (button, nav, main)
- [ ] Icon-only buttons have aria-label
- [ ] Color contrast >= 4.5:1
- [ ] Keyboard navigation works
- [ ] Links have meaningful text

---

## Responsive Breakpoints

```
< 640px:  Mobile (base styles)
640px:    sm: tablets
768px:    md: small laptops
1024px:   lg: desktops
1280px:   xl: large desktops
```

---

**See Also**:
- [UI-UX.md](../UI-UX.md)
- [ui-review command](../commands/ui-review.md)
