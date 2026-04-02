# /ui-review Command

**Agent**: UI/UX Validator
**Purpose**: Design system & accessibility validation
**Duration**: 3 minutes
**When to Use**: Before UI components, page changes, style updates

---

## What This Does

✅ Design system color compliance
✅ Typography (fonts, sizes, weights)
✅ Spacing validation (on 4px grid)
✅ Accessibility checks (labels, semantic HTML, contrast)
✅ Responsive design validation
✅ Visual consistency

---

## How to Use

### Method 1: Component Review

```
I built a settings button. Check design compliance:

<button className="bg-blue-600 text-white px-5 py-2 rounded">
  Settings
</button>
```

### Method 2: Full Page Review

```
/ui-review

Check app/(dashboard)/layout.tsx for design system
```

### Method 3: Specific Section

```
Review all buttons in components/ for consistency
```

---

## What Gets Checked

### Colors

- [ ] Using design system vars (bg-primary, text-secondary, bg-success)
- [ ] No arbitrary hex colors (#FF5733)
- [ ] No inline style colors
- [ ] Proper contrast ratio (4.5:1 minimum)

### Typography

- [ ] Correct font family (font-display, font-body, font-mono)
- [ ] Proper size/weight (h1 → text-4xl, body → text-base)
- [ ] No arbitrary font sizes
- [ ] Tabular-nums for currency

### Spacing & Layout

- [ ] All spacing on 4px grid (4, 8, 16, 24, 32, 48)
- [ ] No arbitrary spacing (5px, 7px, 21px)
- [ ] Proper breakpoints (md:, lg:)
- [ ] No 1px borders (use bg shifts)

### Accessibility

- [ ] Form inputs have labels
- [ ] Semantic HTML (button not div, nav, main)
- [ ] Icon-only buttons have aria-label
- [ ] Links have meaningful text
- [ ] Color not sole way to convey meaning

### Responsive

- [ ] Mobile layout (375px)
- [ ] Tablet layout (768px)
- [ ] Desktop layout (1024px+)
- [ ] No horizontal scrolling

---

## Response Format

```
🎨 UI/UX VALIDATION

Component: [Button/Card/Form/etc]

PASSED:
✅ Colors: Using design system (bg-primary, text-secondary)
✅ Typography: Correct (text-lg font-display font-semibold)
✅ Spacing: On 4px grid (gap-4, p-6)
✅ Accessibility: Has labels, semantic HTML
✅ Responsive: Tested at all breakpoints

WARNINGS:
⚠️  Spacing not on grid: gap-5 should be gap-4 or gap-6
⚠️  Color contrast low: Verify WCAG compliance

FAILURES:
❌ Using arbitrary color: #FF5733 → Use bg-primary
❌ Missing label: Input needs <label htmlFor>
❌ Non-semantic: <div onClick> → Use <button>
❌ Border not allowed: Use background-color shift instead
❌ Naming inconsistent: "btn-primary" → Use "bg-primary"

REQUIRED FIXES:

1. Replace colors:
   ❌ style={{ backgroundColor: '#FF5733' }}
   ✅ className="bg-tertiary"

2. Fix spacing:
   ❌ <div className="gap-5">  (20px - not on grid)
   ✅ <div className="gap-4">  (16px - on grid)

3. Add accessibility:
   ❌ <input placeholder="Email" />
   ✅ <label htmlFor="email">Email</label> <input id="email" />

4. Semantic HTML:
   ❌ <div onClick={handleDelete}>Delete</div>
   ✅ <button onClick={handleDelete}>Delete</button>

Timeline: 5 minutes to fix
Reference: .claude/UI-UX.md
```

---

## Common UI Issues & Fixes

### Issue 1: Arbitrary Color

```tsx
// ❌ WRONG
<button style={{ backgroundColor: '#003178' }}>Click</button>

// ✅ CORRECT
<button className="bg-primary text-white">Click</button>
```

### Issue 2: Spacing Not on Grid

```tsx
// ❌ WRONG - 20px (not divible by 4)
<div className="gap-5 p-7">Content</div>

// ✅ CORRECT - 16px and 24px (on 4px grid)
<div className="gap-4 p-6">Content</div>
```

### Issue 3: Missing Label

```tsx
// ❌ WRONG
<input placeholder="Email address" type="email" />

// ✅ CORRECT
<label htmlFor="email" className="block text-sm font-medium">Email</label>
<input id="email" type="email" className="..." />
```

### Issue 4: Non-Semantic HTML

```tsx
// ❌ WRONG
<div onClick={handleDelete} className="cursor-pointer">
  Delete Account
</div>

// ✅ CORRECT
<button onClick={handleDelete} className="bg-tertiary text-white">
  Delete Account
</button>
```

### Issue 5: 1px Border

```tsx
// ❌ WRONG - Borders forbidden
<div className="border-l border-gray-300">Content</div>

// ✅ CORRECT - Use background shift
<div className="border-l-4 border-l-primary bg-highlight">Content</div>
// Or use shadow
<div className="shadow-sm">Content</div>
```

---

## Color Palette Quick Reference

| Use Case               | Tailwind Class                    | Hex     |
| ---------------------- | --------------------------------- | ------- |
| Main buttons, headings | `bg-primary` / `text-primary`     | #003178 |
| Button hover           | `bg-primary-container`            | #0d47a1 |
| Secondary actions      | `bg-secondary` / `text-secondary` | #006b5f |
| Delete buttons         | `bg-tertiary` / `text-tertiary`   | #71000c |
| Success (deposits)     | `bg-success` / `text-success`     | #2E7D32 |
| Warnings               | `bg-warning` / `text-warning`     | #F57C00 |
| Errors                 | `bg-error` / `text-error`         | #C62828 |

---

## Typography Reference

| Use           | Class                                 |
| ------------- | ------------------------------------- |
| Page title    | `text-5xl font-display font-semibold` |
| Section title | `text-4xl font-display font-semibold` |
| Card heading  | `text-2xl font-display font-semibold` |
| Body large    | `text-lg font-body`                   |
| Body default  | `text-base font-body`                 |
| Body small    | `text-sm font-body text-secondary`    |
| Code/data     | `font-mono tabular-nums`              |

---

## Spacing Grid

| Size | Value | Usage     | Classes          |
| ---- | ----- | --------- | ---------------- |
| XS   | 4px   | Tight     | `gap-1`, `p-1`   |
| SM   | 8px   | Button    | `gap-2`, `p-2`   |
| MD   | 16px  | Component | `gap-4`, `p-4`   |
| LG   | 24px  | Section   | `gap-6`, `p-6`   |
| XL   | 32px  | Page      | `gap-8`, `p-8`   |
| 2XL  | 48px  | Major     | `gap-12`, `p-12` |

---

## Pro Tips

1. **Always check responsive**: Mobile → Tablet → Desktop
2. **Use DevTools**: Check color contrast ratio
3. **Test with keyboard**: Can you navigate without mouse?
4. **Currency rule**: Always use `font-mono tabular-nums`

---

**Reference**: `.claude/UI-UX.md`
