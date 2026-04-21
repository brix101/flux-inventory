import { relations, sql } from "drizzle-orm"
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

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
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

export const productsRelations = relations(products, ({ many }) => ({
  variants: many(productVariants),
}))

export const productVariants = pgTable("product_variants", (t) => ({
  id: t.uuid().notNull().defaultRandom().primaryKey(),
  productId: t
    .uuid()
    .references(() => products.id, { onDelete: "cascade" })
    .notNull(),
  name: t.text().notNull(),
  sku: t.varchar({ length: 100 }).notNull().unique(),
  barcode: t.varchar({ length: 100 }).unique(),
  unit: t.varchar({ length: 20 }).default("pcs"),
  imageUrl: t.text(),
  isActive: t.boolean().notNull().default(true),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t
    .timestamp({ mode: "string", withTimezone: true })
    .$onUpdateFn(() => sql`now()`),
}))

export const productVariantsRelations = relations(
  productVariants,
  ({ one }) => ({
    product: one(products, {
      fields: [productVariants.productId],
      references: [products.id],
    }),
  })
)

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

export const locationsRelations = relations(locations, ({ many }) => ({
  transactions: many(transactions),
  stockLevels: many(stockLevels),
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
  status: t.varchar({ length: 50 }).notNull().default("DRAFT"),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t
    .timestamp({ mode: "string", withTimezone: true })
    .$onUpdateFn(() => sql`now()`),
}))

export const purchaseOrdersRelations = relations(
  purchaseOrders,
  ({ many }) => ({
    items: many(purchaseOrderItems),
  })
)

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

export const purchaseOrderItemsRelations = relations(
  purchaseOrderItems,
  ({ one }) => ({
    order: one(purchaseOrders, {
      fields: [purchaseOrderItems.purchaseOrderId],
      references: [purchaseOrders.id],
    }),
    variant: one(productVariants, {
      fields: [purchaseOrderItems.productVariantId],
      references: [productVariants.id],
    }),
  })
)

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
  notes: t.text(),
  referenceId: t.uuid(),
  referenceTable: t.varchar({ length: 100 }),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t
    .timestamp({ mode: "string", withTimezone: true })
    .$onUpdateFn(() => sql`now()`),
}))

export const transactionsRelations = relations(transactions, ({ one }) => ({
  variant: one(productVariants, {
    fields: [transactions.productVariantId],
    references: [productVariants.id],
  }),
  location: one(locations, {
    fields: [transactions.locationId],
    references: [locations.id],
  }),
  user: one(users, {
    fields: [transactions.performedBy],
    references: [users.id],
  }),
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
    quantity: t.integer().notNull().default(0),
    reserved: t.integer().notNull().default(0),
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

export const stockLevelsRelations = relations(stockLevels, ({ one }) => ({
  variant: one(productVariants, {
    fields: [stockLevels.productVariantId],
    references: [productVariants.id],
  }),
  location: one(locations, {
    fields: [stockLevels.locationId],
    references: [locations.id],
  }),
}))

export const requisitions = pgTable("requisitions", (t) => ({
  id: t.uuid().notNull().defaultRandom().primaryKey(),
  createdBy: t
    .text()
    .references(() => users.id, { onDelete: "set null" })
    .notNull(),
  requisitionNumber: t.varchar({ length: 100 }).notNull().unique(),
  description: t.text(),
  status: t.varchar({ length: 50 }).notNull().default("DRAFT"),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t
    .timestamp({ mode: "string", withTimezone: true })
    .$onUpdateFn(() => sql`now()`),
}))

export const requisitionsRelations = relations(requisitions, ({ many }) => ({
  items: many(requisitionItems),
}))

export const requisitionItems = pgTable("requisition_items", (t) => ({
  id: t.uuid().notNull().defaultRandom().primaryKey(),
  requisitionId: t
    .uuid()
    .references(() => requisitions.id, { onDelete: "cascade" })
    .notNull(),
  productVariantId: t
    .uuid()
    .references(() => productVariants.id, { onDelete: "set null" })
    .notNull(),
  quantityRequested: t.integer().notNull().default(0),
  quantityApproved: t.integer().notNull().default(0),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t
    .timestamp({ mode: "string", withTimezone: true })
    .$onUpdateFn(() => sql`now()`),
}))

export const requisitionItemsRelations = relations(
  requisitionItems,
  ({ one }) => ({
    requisition: one(requisitions, {
      fields: [requisitionItems.requisitionId],
      references: [requisitions.id],
    }),
    variant: one(productVariants, {
      fields: [requisitionItems.productVariantId],
      references: [productVariants.id],
    }),
  })
)

export const auditLogs = pgTable("audit_logs", (t) => ({
  id: t.uuid().notNull().defaultRandom().primaryKey(),
  userId: t
    .text()
    .references(() => users.id, { onDelete: "set null" })
    .notNull(),
  action: t.varchar({ length: 100 }).notNull(),
  entityName: t.varchar({ length: 100 }).notNull(),
  entityId: t.uuid(),
  oldValue: t.json(),
  newValue: t.json(),
  metadata: t.json(),
  createdAt: t.timestamp().defaultNow().notNull(),
}))

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}))

export type Categories = typeof categories.$inferSelect
export type Products = typeof products.$inferSelect
export type ProductVariants = typeof productVariants.$inferSelect
export type Locations = typeof locations.$inferSelect
export type PurchaseOrders = typeof purchaseOrders.$inferSelect
export type PurchaseOrderItems = typeof purchaseOrderItems.$inferSelect
export type Transactions = typeof transactions.$inferSelect
export type StockLevels = typeof stockLevels.$inferSelect
export type Requisitions = typeof requisitions.$inferSelect
export type RequisitionItems = typeof requisitionItems.$inferSelect
export type AuditLogs = typeof auditLogs.$inferSelect
