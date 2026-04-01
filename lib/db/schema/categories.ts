import { pgTable, uuid, varchar, boolean, timestamp, pgEnum, AnyPgColumn } from 'drizzle-orm/pg-core'
import { users } from './users'

export const categoryTypeEnum = pgEnum('category_type', ['income', 'expense', 'both'])

export const categories = pgTable('categories', {
  id:       uuid('id').primaryKey().defaultRandom(),
  userId:   uuid('user_id').references(() => users.id, { onDelete: 'cascade' }), // NULL = system default
  name:     varchar('name', { length: 100 }).notNull(),
  icon:     varchar('icon', { length: 50 }),
  color:    varchar('color', { length: 7 }),
  type:     categoryTypeEnum('type').notNull(),
  parentId: uuid('parent_id').references((): AnyPgColumn => categories.id),
  isSystem: boolean('is_system').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})
