import { pgTable, uuid, varchar, char, text, timestamp } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id:           uuid('id').primaryKey().defaultRandom(),
  name:         varchar('name', { length: 100 }).notNull(),
  email:        varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  currency:     char('currency', { length: 3 }).default('INR'),
  timezone:     varchar('timezone', { length: 50 }).default('Asia/Kolkata'),
  avatarUrl:    text('avatar_url'),
  createdAt:    timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt:    timestamp('updated_at', { withTimezone: true }).defaultNow(),
})
