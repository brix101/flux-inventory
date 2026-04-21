import { sql } from "drizzle-orm"
import { pgEnum, pgTable, unique } from "drizzle-orm/pg-core"

import { users } from "./auth-schema"

export const transactionTypeEnum = pgEnum("transaction_type", [
  "IN",
  "OUT",
  "TRANSFER",
  "ADJUSTMENT",
])

export const categories = pgTable("categories", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  name: t.text().notNull(),
  description: t.text(),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t
    .timestamp({ mode: "string", withTimezone: true })
    .$onUpdateFn(() => sql`now()`),
}))

export const products = pgTable("products", (t) => ({
  id: t.uuid().notNull().defaultRandom().primaryKey(),
  name: t.text().notNull(),
  description: t.text(),
  categoryId: t.uuid().references(() => categories.id),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t
    .timestamp({ mode: "string", withTimezone: true })
    .$onUpdateFn(() => sql`now()`),
}))

export const productVariants = pgTable("product_variants", (t) => ({
  id: t.uuid().notNull().defaultRandom().primaryKey(),
  productId: t
    .uuid()
    .references(() => products.id, { onDelete: "cascade" })
    .notNull(),
  name: t.text().notNull(), // e.g. "Red, Large"
  sku: t.varchar({ length: 100 }).notNull().unique(), // Variant-specific SKU
  barcode: t.varchar({ length: 100 }).unique(), // Optional barcode
  unit: t.varchar({ length: 20 }).default("pcs"), // kg, meter, box, etc.
  isActive: t.boolean().notNull().default(true),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t
    .timestamp({ mode: "string", withTimezone: true })
    .$onUpdateFn(() => sql`now()`),
}))

export const locations = pgTable("locations", (t) => ({
  id: t.uuid().notNull().defaultRandom().primaryKey(),
  code: t.varchar({ length: 50 }).notNull().unique(),
  name: t.text().notNull(),
  description: t.text(),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t
    .timestamp({ mode: "string", withTimezone: true })
    .$onUpdateFn(() => sql`now()`),
}))

export const purchaseOrders = pgTable("purchase_orders", (t) => ({
  id: t.uuid().notNull().defaultRandom().primaryKey(),
  createdBy: t
    .text()
    .references(() => users.id, { onDelete: "set null" })
    .notNull(),
  orderNumber: t.varchar({ length: 100 }).notNull().unique(),
  supplierName: t.text().notNull(),
  description: t.text(),
  status: t.varchar({ length: 50 }).notNull().default("DRAFT"), // e.g. 'DRAFT', 'PENDING', 'SHIPPED', 'RECEIVED', 'CANCELLED'
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t
    .timestamp({ mode: "string", withTimezone: true })
    .$onUpdateFn(() => sql`now()`),
}))

export const purchaseOrderItems = pgTable("purchase_order_items", (t) => ({
  id: t.uuid().notNull().defaultRandom().primaryKey(),
  purchaseOrderId: t
    .uuid()
    .references(() => purchaseOrders.id, { onDelete: "cascade" })
    .notNull(),
  productVariantId: t
    .uuid()
    .references(() => productVariants.id, { onDelete: "set null" })
    .notNull(),
  quantityOrdered: t.integer().notNull().default(0),
  quantityReceived: t.integer().notNull().default(0),
  unitPrice: t.numeric({ precision: 10, scale: 2 }).notNull().default("0.00"),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t
    .timestamp({ mode: "string", withTimezone: true })
    .$onUpdateFn(() => sql`now()`),
}))

export const transactions = pgTable("transactions", (t) => ({
  id: t.uuid().notNull().defaultRandom().primaryKey(),
  productVariantId: t
    .uuid()
    .references(() => productVariants.id, { onDelete: "set null" })
    .notNull(),
  locationId: t
    .uuid()
    .references(() => locations.id, { onDelete: "set null" })
    .notNull(),
  performedBy: t
    .text()
    .references(() => users.id, { onDelete: "set null" })
    .notNull(),
  type: transactionTypeEnum("type").notNull(),
  quantity: t.integer().notNull(),
  notes: t.text(), // e.g., "Damaged during handling" or "Project X"
  referenceId: t.uuid(), // e.g. purchase order ID, sales order ID, etc.
  referenceTable: t.varchar({ length: 100 }), // e.g. 'purchase_orders', 'sales_orders', etc.
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t
    .timestamp({ mode: "string", withTimezone: true })
    .$onUpdateFn(() => sql`now()`),
}))

export const stockLevels = pgTable(
  "stock_levels",
  (t) => ({
    id: t.uuid().notNull().defaultRandom().primaryKey(),
    productVariantId: t
      .uuid()
      .references(() => productVariants.id, { onDelete: "set null" })
      .notNull(),
    locationId: t
      .uuid()
      .references(() => locations.id, { onDelete: "set null" })
      .notNull(),
    quantity: t.integer().notNull().default(0), // Current available stock quantity
    reserved: t.integer().notNull().default(0), // Quantity reserved for pending transactions
    createdAt: t.timestamp().defaultNow().notNull(),
    updatedAt: t
      .timestamp({ mode: "string", withTimezone: true })
      .$onUpdateFn(() => sql`now()`),
  }),
  (t) => [
    unique("stock_levels_productVariant_location_uidx").on(
      t.productVariantId,
      t.locationId
    ),
  ]
)
