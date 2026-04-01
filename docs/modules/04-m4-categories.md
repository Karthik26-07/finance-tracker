# M4 — Categories & Tags

## Purpose
Organize transactions for reporting and budgeting. Hierarchical category system with system defaults and user-custom categories.

---

## Features

### System Categories
- [ ] Seeded via migration/seed script
- [ ] 10 default categories with icons/colors
- [ ] Marked as `isSystem = true` (cannot delete)

### User Categories
- [ ] Create custom category (name, icon, color, type, parent)
- [ ] Edit user-created categories
- [ ] Delete category (reassign transactions to another)
- [ ] Merge categories

### Tags
- [ ] Free-form text tags on transactions
- [ ] Stored as `text[]` array column
- [ ] Multi-select in filters

---

## Database Schema

### categories table (`lib/db/schema/categories.ts`)

```ts
export const categoryTypeEnum = pgEnum('category_type', ['income', 'expense', 'both'])

export const categories = pgTable('categories', {
  id:       uuid('id').primaryKey().defaultRandom(),
  userId:   uuid('user_id').references(() => users.id, { onDelete: 'cascade' }), // NULL = system
  name:     varchar('name', { length: 100 }).notNull(),
  icon:     varchar('icon', { length: 50 }),
  color:    varchar('color', { length: 7 }),
  type:     categoryTypeEnum('type').notNull(),
  parentId: uuid('parent_id').references((): AnyPgColumn => categories.id),
  isSystem: boolean('is_system').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})
```

---

## File Structure

```
app/
├── (dashboard)/
│   └── settings/
│       └── categories/page.tsx
└── api/
    └── categories/
        ├── route.ts (GET list, POST create)
        ├── [id]/route.ts (PUT, DELETE)
        └── merge/route.ts

actions/
└── categories.ts

components/
└── categories/
    ├── CategoryTree.tsx
    ├── CategoryItem.tsx
    ├── CategoryForm.tsx
    └── MergeModal.tsx

lib/
├── db/queries/categories.ts
├── db/seed.ts (system categories)
└── validations/categories.ts
```

---

## System Categories (Seed Data)

```ts
const SYSTEM_CATEGORIES = [
  { name: 'Food & Dining',    icon: 'utensils',     color: '#F87171', type: 'expense' },
  { name: 'Transport',         icon: 'car',          color: '#FBBF24', type: 'expense' },
  { name: 'Rent & Housing',    icon: 'home',         color: '#A78BFA', type: 'expense' },
  { name: 'Utilities',         icon: 'zap',          color: '#38BDF8', type: 'expense' },
  { name: 'Entertainment',     icon: 'tv',           color: '#FB7185', type: 'expense' },
  { name: 'Healthcare',        icon: 'heart-pulse',  color: '#34D399', type: 'expense' },
  { name: 'Shopping',          icon: 'shopping-bag', color: '#4F8EF7', type: 'expense' },
  { name: 'Salary',            icon: 'briefcase',    color: '#34D399', type: 'income'  },
  { name: 'Freelance',         icon: 'laptop',       color: '#4F8EF7', type: 'income'  },
  { name: 'Investment Return', icon: 'trending-up',  color: '#FBBF24', type: 'income'  },
]
```

---

## Components to Create

### Pages
- [ ] `app/(dashboard)/settings/categories/page.tsx` - Category management

### Components
- [ ] `components/categories/CategoryTree.tsx` - Hierarchical list
- [ ] `components/categories/CategoryItem.tsx` - Single category row
- [ ] `components/forms/CategoryForm.tsx` - Create/edit modal
- [ ] `components/categories/MergeModal.tsx` - Merge categories

### Server Actions (`actions/categories.ts`)
- [ ] `createCategory(input)` - Create custom category
- [ ] `updateCategory(id, input)` - Update category
- [ ] `deleteCategory(id, reassignToId)` - Delete + reassign transactions
- [ ] `mergeCategories(fromIds, toId)` - Merge multiple into one

### Validation Schemas (`lib/validations/categories.ts`)
- [ ] `createCategorySchema` - Name, icon, color, type, parentId
- [ ] `updateCategorySchema` - Partial
- [ ] `mergeCategoriesSchema` - fromIds (array), toId

---

## API Routes

### GET /api/categories
List all categories (system + user) for current user

### POST /api/categories
Create custom category

### PUT /api/categories/:id
Update category

### DELETE /api/categories/:id
Delete category (requires `reassignToId` in body)

### POST /api/categories/merge
Merge multiple categories into one

---

## Category Reassignment Flow

```
Delete Category
     │
     ▼
User selects replacement category
     │
     ▼
DB Transaction:
  1. UPDATE transactions SET categoryId = ? WHERE categoryId = ?
  2. DELETE FROM categories WHERE id = ?
     │
     ▼
revalidatePath('/settings/categories')
revalidatePath('/transactions')
```

---

## Design Reference

**Primary:** `docs/design-ref/categories_tags_m4/`
- `code.html` — Category bento cards with sub-categories, drag handles, stats section
- `screen.png` — Full visual reference

**Design Plan:** `docs/04-ui-design-plan.md`
- System vs user categories visual distinction
- Drag-and-drop reordering pattern
- Category chip/badge design

**Equilibrium Finance:** `docs/design-ref/equilibrium_finance/DESIGN.md`
- Bento card layout for category groups
- Icon + color coding system

---

## Design Specifications

### Category Tree
```
┌────────────────────────────────────────┐
│  Income Categories                     │
│  ├─ 💰 Salary                          │
│  ├─ 💻 Freelance                       │
│  └─ 📈 Investment Return               │
├────────────────────────────────────────┤
│  Expense Categories                    │
│  ├─ 🍽️ Food & Dining                  │
│  │  └─ 🍕 Restaurants (child)          │
│  │  └─ 🛒 Groceries (child)            │
│  ├─ 🚗 Transport                       │
│  └─ 🏠 Rent & Housing                  │
└────────────────────────────────────────┘
```

### Category Chip
```
┌─────────────────────┐
│ 🍽️ Food & Dining   │
└─────────────────────┘
Background: color from category
Text: white or contrasting
```

---

## Implementation Checklist

### Schema
- [ ] Create categories table migration
- [ ] Run drizzle-kit generate + migrate

### Seed
- [ ] Create seed script for system categories
- [ ] Run seed

### Queries
- [ ] `getCategories(userId, type?)`
- [ ] `getCategoryById(id)`
- [ ] `getSystemCategories()`

### Pages
- [ ] Build category management page
- [ ] Build add/edit modal

### Server Actions
- [ ] Implement CRUD actions
- [ ] Implement merge action

### Testing
- [ ] Test category creation
- [ ] Test reassignment on delete
- [ ] Test merge functionality
