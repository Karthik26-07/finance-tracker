import { pgTable, uuid, varchar, boolean, timestamp, pgEnum, AnyPgColumn, text } from 'drizzle-orm/pg-core'
import { type InferSelectModel, type InferInsertModel } from 'drizzle-orm'
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
  description: text('description'),
  isSystem: boolean('is_system').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export type Category = InferSelectModel<typeof categories>
export type NewCategory = InferInsertModel<typeof categories>
