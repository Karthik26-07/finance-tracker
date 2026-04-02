# FinTrack UI/UX Design System

**Theme**: Precision Architect Financial Editorial
**Last Updated**: 2026-04-01
**Components Library**: shadcn/ui (Tailwind-based)

---

## 🎨 Color Palette

### Core Colors

| Name                  | Value               | Usage                             | Tailwind Class                   |
| --------------------- | ------------------- | --------------------------------- | -------------------------------- |
| **Primary**           | #003178 (Navy)      | Main brand, CTAs, primary buttons | `bg-primary`, `text-primary`     |
| **Primary Container** | #0d47a1 (Deep Navy) | Button hover, elevated states     | `bg-primary-container`           |
| **Secondary**         | #006b5f (Emerald)   | Secondary actions, accents        | `bg-secondary`, `text-secondary` |
| **Tertiary**          | #71000c (Coral)     | Warnings, destructive actions     | `bg-tertiary`, `text-tertiary`   |

### Semantic Colors

| Name        | Value   | Usage                       | Tailwind Class               |
| ----------- | ------- | --------------------------- | ---------------------------- |
| **Success** | #2E7D32 | Confirmations, deposits     | `bg-success`, `text-success` |
| **Warning** | #F57C00 | Cautions, limits            | `bg-warning`, `text-warning` |
| **Error**   | #C62828 | Errors, withdrawal warnings | `bg-error`, `text-error`     |
| **Info**    | #0277BD | Information, hints          | `bg-info`, `text-info`       |

### Neutral Colors

| Name           | Value   | Usage                    | Tailwind Class  |
| -------------- | ------- | ------------------------ | --------------- |
| **Background** | #FAFAFA | Page background          | `bg-background` |
| **Surface**    | #FFFFFF | Cards, containers        | `bg-surface`    |
| **Elevated**   | #F5F5F5 | Slightly raised surfaces | `bg-elevated`   |
| **Highlight**  | #E3F2FD | Selection, highlights    | `bg-highlight`  |

---

## 📝 Typography System

### Font Stack

```css
/* Sora - Display & Headings */
font-family: "Sora", system-ui, sans-serif;
letter-spacing: 0.02em; /* Professional tracking */

/* DM Sans - Body & UI Text */
font-family: "DM Sans", system-ui, sans-serif;
line-height: 1.6;

/* JetBrains Mono - Code & Data */
font-family: "JetBrains Mono", monospace;
font-feature-settings: "tnum" on; /* Tabular numbers */
```

### Scale & Hierarchy

| Type               | Size | Weight | Usage           | Class                                 |
| ------------------ | ---- | ------ | --------------- | ------------------------------------- |
| **Display Large**  | 56px | 600    | Page titles     | `text-5xl font-display font-semibold` |
| **Display Medium** | 44px | 600    | Section headers | `text-4xl font-display font-semibold` |
| **Headline**       | 32px | 600    | Card titles     | `text-2xl font-display font-semibold` |
| **Title Large**    | 24px | 500    | Subsections     | `text-xl font-display font-medium`    |
| **Body Large**     | 18px | 400    | Primary text    | `text-lg font-body`                   |
| **Body Medium**    | 16px | 400    | Default body    | `text-base font-body`                 |
| **Body Small**     | 14px | 400    | Secondary text  | `text-sm font-body text-secondary`    |
| **Label Large**    | 14px | 500    | Buttons, labels | `text-sm font-body font-medium`       |
| **Label Small**    | 12px | 500    | Helper text     | `text-xs font-body font-medium`       |
| **Code**           | 14px | 400    | Code, data      | `font-mono tabular-nums`              |

### Implementation

```tsx
// ✅ Use Tailwind classes
<h1 className="text-4xl font-display font-semibold text-primary">
  Dashboard
</h1>

<p className="text-base font-body text-text-primary">
  Manage your finances
</p>

<code className="font-mono tabular-nums text-sm bg-elevated px-2 py-1 rounded">
  $1,234.56
</code>

// ✗ Don't use inline styles
<h1 style={{ fontSize: '44px', fontWeight: 600 }}>Dashboard</h1>
```

---

## 🧩 Spacing & Layout

### Spacing Scale

Based on 4px grid:

| Token   | Value | Usage               | Class(es)        |
| ------- | ----- | ------------------- | ---------------- |
| **XS**  | 4px   | Icon spacing, tight | `gap-1`, `p-1`   |
| **SM**  | 8px   | Button padding      | `gap-2`, `p-2`   |
| **MD**  | 16px  | Component spacing   | `gap-4`, `p-4`   |
| **LG**  | 24px  | Section spacing     | `gap-6`, `p-6`   |
| **XL**  | 32px  | Page sections       | `gap-8`, `p-8`   |
| **2XL** | 48px  | Major sections      | `gap-12`, `p-12` |

### Breakpoints

```css
sm: 640px   /* Small devices */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large displays */
```

### Grid & Alignment

```tsx
// ✅ CORRECT - Semantic layout
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card>Transaction 1</Card>
  <Card>Transaction 2</Card>
  <Card>Transaction 3</Card>
</div>

// ✗ WRONG - Arbitrary spacing
<div style={{ display: 'flex', gap: '21px' }}>
  {/* 21px is not on the 4px grid */}
</div>
```

---

## 🎬 Component Library

### Buttons

```tsx
// Primary CTA (navigation, submit)
<button className="bg-gradient-to-r from-primary to-primary-container text-white px-4 py-2 rounded-lg hover:shadow-md transition-all">
  {children}
</button>

// Secondary (alternative actions)
<button className="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary/90 transition-all">
  {children}
</button>

// Ghost (de-emphasized)
<button className="text-primary hover:bg-highlight rounded-lg px-4 py-2 transition-all">
  {children}
</button>

// Destructive (delete, cancel)
<button className="bg-tertiary text-white px-4 py-2 rounded-lg hover:bg-tertiary/90 transition-all">
  {children}
</button>
```

### Cards

```tsx
// Standard card (no border, use elevation)
<div className="bg-surface rounded-xl shadow-sm p-6">
  <h3 className="text-xl font-display font-semibold mb-4">Title</h3>
  <p className="text-body text-secondary">Content</p>
</div>

// Elevated card (more prominent)
<div className="bg-elevated rounded-xl shadow-md p-6">
  {/* content */}
</div>

// ✗ WRONG - No 1px borders
<div className="border-l border-gray-300 p-6">
  {/* Border is wrong, use background shift */}
</div>
```

### Forms

```tsx
// Label
<label className="block text-sm font-body font-medium text-text-primary mb-2">
  Email
</label>

// Input
<input
  type="email"
  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
/>

// Error message
<p className="text-error text-sm mt-1">Email is required</p>

// Help text
<p className="text-secondary text-xs mt-1">We'll never share your email</p>
```

### Tables (Currency Display)

```tsx
<table className="w-full">
  <thead>
    <tr className="border-b border-gray-200">
      <th className="text-left py-3 px-4 font-semibold text-primary">Amount</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td className="py-3 px-4 font-mono tabular-nums">
        {formatCurrency(1234.56, "USD")} {/* $1,234.56 */}
      </td>
    </tr>
  </tbody>
</table>
```

---

## 🖼️ Visual Effects

### Shadows

- **No shadow (default)**: Flat surfaces
- **shadow-sm**: Subtle elevation (cards, inputs)
- **shadow-md**: Medium elevation (modals, dropdowns)
- **shadow-lg**: High elevation (floating elements)
- **shadow-xl**: Maximum elevation (sticky header)

```tsx
// ✅ CORRECT - Semantic shadow
<div className="bg-surface shadow-md rounded-xl p-6">
  Card content
</div>

// ✗ WRONG - Custom box-shadow
<div style={{ boxShadow: '0 3px 8px rgba(0,0,0,0.15)' }}>
  Card content
</div>
```

### Gradients

Primary buttons use gradient for visual interest:

```tsx
<button className="bg-gradient-to-r from-primary to-primary-container">
  Click me
</button>
```

Gradient angles:

- Horizontal: `gradient-to-r` (135deg, left-top to right-bottom)
- Vertical: `gradient-to-b`
- Diagonal: `gradient-to-br`

### Transitions

All interactive elements should have smooth transitions:

```tsx
// Buttons, links
className = "transition-all hover:shadow-md";

// Color changes
className = "transition-colors hover:bg-primary/90";

// Opacity fades
className = "transition-opacity";
```

---

## ♿ Accessibility Requirements

### Labels & Forms

```tsx
// ✅ CORRECT
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// ✗ WRONG - Floating labels without association
<input placeholder="email@example.com" />
```

### Color & Contrast

- **Minimum ratio**: 4.5:1 (normal text), 3:1 (large text)
- **Don't rely on color alone**: Use text/icons too
- **Dark mode**: Ensure colors work in both modes

```tsx
// ✅ CORRECT - Icon + text
<button className="flex items-center gap-2">
  <TrashIcon />
  Delete
</button>

// ✗ WRONG - Icon only, no accessible label
<button>
  <TrashIcon />
</button>
```

### Interactive Elements

- Buttons must have descriptive text
- Links must have meaningful href and text
- Form inputs must have associated labels
- Warning/error messages should be announced

```tsx
// ✅ CORRECT
<button aria-label="Delete account" onClick={handleDelete}>
  Delete Account
</button>

// ✗ WRONG
<button onClick={handleDelete}>❌</button>
```

### Semantic HTML

```tsx
// ✅ CORRECT
<nav>Navigation</nav>
<main>Page content</main>
<article>Post content</article>
<footer>Footer</footer>
<button>Submit</button>

// ✗ WRONG
<div onClick={() => navigate('/')}>Home</div>
<div>Navigation</div>
<span role="button">Submit</span>
```

---

## 📱 Responsive Design

### Mobile-First Approach

```tsx
// ✅ CORRECT - Start with mobile, enhance for larger screens
<div className="w-full md:w-1/2 lg:w-1/3">
  Card content
</div>

// ✗ WRONG - Desktop-focused
<div className="w-1/3 sm:w-1/2 xs:w-full">
  Card content
</div>
```

### Common Patterns

```tsx
// Full-width on mobile, multi-column on desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card />
  <Card />
  <Card />
</div>

// Sidebar layout
<div className="flex flex-col lg:flex-row gap-6">
  <aside className="w-full lg:w-64">Sidebar</aside>
  <main className="flex-1">Content</main>
</div>
```

---

## 🌙 Dark Mode (Future)

When dark mode is implemented:

```tsx
// Syntax for future
<div className="bg-surface dark:bg-surface-dark text-text-primary dark:text-text-primary-dark">
  Content
</div>
```

**Note**: Currently light-only. Dark mode planned for later phase.

---

## 📊 Data Visualization (Future)

When charts are added, use:

- **Color scheme**: Primary navy → emerald gradient
- **Typography**: DM Sans for labels, JetBrains Mono for values
- **Grid lines**: Subtle, minimal
- **Legend**: Below chart, horizontal layout

---

## 🧪 Design QA Checklist

Before component ships:

- [ ] **Colors**: All using approved palette (no arbitrary hex)
- [ ] **Typography**: Using Sora/DM Sans/JetBrains Mono
- [ ] **Spacing**: All on 4px grid (p-1, p-2, gap-4, etc)
- [ ] **Shadows**: Using Tailwind shadow classes
- [ ] **Responsive**: Works on mobile (375px) and desktop (1920px)
- [ ] **Accessibility**: Labels, semantic HTML, color contrast
- [ ] **Borders**: No 1px borders, use bg shifts instead
- [ ] **Money display**: Using tabular-nums
- [ ] **Interactive**: Has hover/focus states
- [ ] **Performance**: No inline styles, no unused CSS

---

## 📚 Component Examples

### Transaction Card

```tsx
export function TransactionCard({ transaction, user }: Props) {
  return (
    <div className="bg-surface rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-display font-semibold text-primary">
            {transaction.category}
          </h3>
          <p className="text-sm text-secondary mt-1">
            {new Date(transaction.date).toLocaleDateString()}
          </p>
        </div>
        <span
          className={`text-lg font-mono tabular-nums font-semibold ${
            transaction.type === "income" ? "text-success" : "text-error"
          }`}
        >
          {transaction.type === "income" ? "+" : "-"}
          {formatCurrency(transaction.amount, user.currency)}
        </span>
      </div>

      {transaction.note && (
        <p className="text-sm text-secondary py-2 px-3 bg-elevated rounded-lg">
          {transaction.note}
        </p>
      )}
    </div>
  );
}
```

### Dashboard Header

```tsx
export function DashboardHeader() {
  return (
    <header className="bg-surface border-b border-gray-100 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-display font-semibold text-primary">
              My Dashboard
            </h1>
            <p className="text-secondary mt-2">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
```

---

## 🔗 Related Documentation

- **Standards**: `.claude/STANDARDS.md`
- **Security**: `.claude/SECURITY.md`
- **TailwindCSS Config**: `tailwind.config.ts` (colors, fonts)
- **shadcn/ui**: `components/ui/` directory

---

## Enforcement & Review

All UI components must pass this checklist before merge:

✅ Uses approved color palette
✅ Typography from design system
✅ Spacing on 4px grid
✅ Accessible (labels, contrast, semantic HTML)
✅ Responsive (mobile to desktop)
✅ Matches existing patterns in codebase
✅ No arbitrary hex values or inline styles

---

**Need help?** Check `app/layout.tsx` for font imports and `CLAUDE.md` for Tailwind config.
