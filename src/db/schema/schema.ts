import { sql } from 'drizzle-orm'
import { pgEnum, pgTable, unique } from 'drizzle-orm/pg-core'
import { organizations, users } from './auth-schema'

export const transactionTypeEnum = pgEnum('transaction_type', [
  'IN',
  'OUT',
  'TRANSFER',
  'ADJUSTMENT',
])

export const categories = pgTable('categories', (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  name: t.text().notNull(),
  description: t.text(),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t
    .timestamp({ mode: 'string', withTimezone: true })
    .$onUpdateFn(() => sql`now()`),
}))

export const items = pgTable('items', (t) => ({
  id: t.uuid().notNull().defaultRandom().primaryKey(),
  sku: t.varchar({ length: 100 }).notNull().unique(), // Universal SKU
  name: t.text().notNull(),
  description: t.text(),
  categoryId: t.uuid().references(() => categories.id),
  unit: t.varchar({ length: 20 }).default('pcs'), // kg, meter, box, etc.
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t
    .timestamp({ mode: 'string', withTimezone: true })
    .$onUpdateFn(() => sql`now()`),
}))

export const inventory = pgTable(
  'inventory',
  (t) => ({
    id: t.uuid().notNull().defaultRandom().primaryKey(),
    orgId: t
      .text()
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    itemId: t
      .uuid()
      .references(() => items.id, { onDelete: 'cascade' })
      .notNull(),
    quantity: t.integer().notNull().default(0),
    reorderLevel: t.integer().default(5), // Per-org low stock alert
    binLocation: t.text(), // e.g. "Shelf A-101"
    createdAt: t.timestamp().defaultNow().notNull(),
    updatedAt: t
      .timestamp({ mode: 'string', withTimezone: true })
      .$onUpdateFn(() => sql`now()`),
  }),
  (table) => [unique('org_item_idx').on(table.orgId, table.itemId)],
)

export const transactions = pgTable('transactions', (t) => ({
  id: t.uuid().notNull().defaultRandom().primaryKey(),
  orgId: t
    .text()
    .references(() => organizations.id)
    .notNull(),
  itemId: t
    .uuid()
    .references(() => items.id)
    .notNull(),
  type: transactionTypeEnum('type').notNull(),
  quantity: t.integer().notNull(), // Amount moved
  reference: t.text(), // Order ID, Transfer ID, etc.
  userId: t.text().references(() => users.id),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t
    .timestamp({ mode: 'string', withTimezone: true })
    .$onUpdateFn(() => sql`now()`),
}))
