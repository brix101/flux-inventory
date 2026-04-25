import { relations, sql } from "drizzle-orm"
import {
  check,
  foreignKey,
  index,
  pgEnum,
  pgTable,
  unique,
} from "drizzle-orm/pg-core"

import { users } from "./auth"

// ============================================================================
// ENUMS
// ============================================================================

export const pruchaseOrderStatusEnum = pgEnum("purchase_order_status", [
  "DRAFT",
  "APPROVED",
  "PARTIALLY_RECEIVED",
  "RECEIVED",
  "CANCELLED",
])

export const requisitionStatusEnum = pgEnum("requisition_status", [
  "DRAFT",
  "PENDING",
  "APPROVED",
  "REJECTED",
  "FULFILLED",
  "CANCELLED",
])

export const movementTypeEnum = pgEnum("movement_type", [
  "PURCHASE",
  "SALE",
  "TRANSFER",
  "ADJUSTMENT",
  "RETURN",
])

// ============================================================================
// CATEGORIES
// ============================================================================
export const categories = pgTable(
  "categories",
  (t) => ({
    id: t.uuid().notNull().primaryKey().defaultRandom(),
    name: t.text().notNull(),
    description: t.text(),
    color: t.varchar({ length: 20 }).default("#6B7280"),
    path: t.text().notNull(), // e.g., "1/", "1/2/", etc. for hierarchy
    parentId: t.uuid(),
    createdAt: t.timestamp().defaultNow().notNull(),
    updatedAt: t.timestamp({ mode: "string" }).$onUpdateFn(() => sql`now()`),
  }),
  (table) => [
    foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
    }),
  ]
)

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "parentChild",
  }),
  children: many(categories, { relationName: "parentChild" }),
  products: many(products),
}))

// ===========================================================================
// SUPPLIERS
// ===========================================================================

export const suppliers = pgTable("suppliers", (t) => ({
  id: t.uuid().notNull().defaultRandom().primaryKey(),
  name: t.text().notNull(),
  email: t.text(),
  phone: t.text(),
  notes: t.text(),
  isActive: t.boolean().notNull().default(true),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t.timestamp({ mode: "string" }).$onUpdateFn(() => sql`now()`),
}))

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  purchaseOrders: many(purchaseOrders),
}))

// ===========================================================================
// PRODUCTS & VARIANTS
// ===========================================================================

export const products = pgTable("products", (t) => ({
  id: t.uuid().notNull().defaultRandom().primaryKey(),
  name: t.text().notNull(),
  description: t.text(),
  categoryId: t.uuid().references(() => categories.id),
  isActive: t.boolean().notNull().default(true),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t.timestamp({ mode: "string" }).$onUpdateFn(() => sql`now()`),
}))

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
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
  unit: t.varchar({ length: 20 }).default("unit"), // e.g., unit, kg, liter, pcs, etc.
  imageUrl: t.text(),
  isActive: t.boolean().notNull().default(true),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t.timestamp({ mode: "string" }).$onUpdateFn(() => sql`now()`),
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

// ===========================================================================
// LOCATIONS
// ===========================================================================

export const locations = pgTable("locations", (t) => ({
  id: t.uuid().notNull().defaultRandom().primaryKey(),
  code: t.varchar({ length: 50 }).notNull().unique(),
  name: t.text().notNull(),
  description: t.text(),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t.timestamp({ mode: "string" }).$onUpdateFn(() => sql`now()`),
}))

export const locationsRelations = relations(locations, ({ many }) => ({
  // movements: many(stockMoves),
  stockLevels: many(stockLevels),
}))

// ===========================================================================
// PURCHASE ORDERS
// ===========================================================================

export const purchaseOrders = pgTable("purchase_orders", (t) => ({
  id: t.uuid().notNull().defaultRandom().primaryKey(),
  createdBy: t.text().references(() => users.id, { onDelete: "set null" }),
  orderNumber: t.varchar({ length: 100 }).notNull().unique(),
  supplierId: t.uuid().references(() => suppliers.id),
  receivedBy: t
    .text()
    .references(() => users.id)
    .notNull(),
  expectedDate: t.date(),
  receivedDate: t.date(),
  totalAmount: t.numeric({ precision: 10, scale: 2 }).notNull().default("0.00"),
  lineTotal: t.numeric({ precision: 12, scale: 2 }),
  notes: t.text(),
  status: pruchaseOrderStatusEnum("status").notNull().default("DRAFT"),
  isActive: t.boolean().notNull().default(true),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t.timestamp({ mode: "string" }).$onUpdateFn(() => sql`now()`),
}))

export const purchaseOrdersRelations = relations(
  purchaseOrders,
  ({ one, many }) => ({
    items: many(purchaseOrderItems),
    supplier: one(suppliers, {
      fields: [purchaseOrders.supplierId],
      references: [suppliers.id],
    }),
    created: one(users, {
      fields: [purchaseOrders.createdBy],
      references: [users.id],
    }),
    received: one(users, {
      fields: [purchaseOrders.receivedBy],
      references: [users.id],
    }),
  })
)

export const purchaseOrderItems = pgTable("purchase_order_items", (t) => ({
  id: t.uuid().notNull().defaultRandom().primaryKey(),
  purchaseOrderId: t
    .uuid()
    .references(() => purchaseOrders.id, { onDelete: "restrict" })
    .notNull(),
  productVariantId: t
    .uuid()
    .references(() => productVariants.id)
    .notNull(),
  quantityOrdered: t.integer().notNull().default(0),
  quantityReceived: t.integer().notNull().default(0),
  unitPrice: t.numeric({ precision: 10, scale: 2 }).notNull().default("0.00"),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t.timestamp({ mode: "string" }).$onUpdateFn(() => sql`now()`),
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

// ===========================================================================
// TRANSACTIONS
// ===========================================================================

export const stockMoves = pgTable(
  "stock_moves",
  (t) => ({
    id: t.uuid().notNull().defaultRandom().primaryKey(),
    productVariantId: t
      .uuid()
      .references(() => productVariants.id, { onDelete: "restrict" })
      .notNull(),
    fromLocationId: t
      .uuid()
      .references(() => locations.id, { onDelete: "restrict" }),
    toLocationId: t.uuid().references(() => locations.id, {
      onDelete: "restrict",
    }),
    performedBy: t.text().references(() => users.id, { onDelete: "set null" }),
    type: movementTypeEnum("type").notNull(),
    quantity: t.integer().notNull(),
    balanceAfter: t.integer(),
    notes: t.text(),
    purchaseOrderId: t
      .uuid()
      .references(() => purchaseOrders.id, { onDelete: "restrict" }),
    requisitionId: t
      .uuid()
      .references(() => requisitions.id, { onDelete: "restrict" }),
    createdAt: t.timestamp().defaultNow().notNull(),
  }),
  (t) => [
    // INFO: prevent zero/negative quantity
    check("quantity_positive", sql`${t.quantity} > 0`),

    // INFO: must have at least one direction
    check(
      "movement_has_direction",
      sql`${t.fromLocationId} IS NOT NULL OR ${t.toLocationId} IS NOT NULL`
    ),

    // INFO: prevent self-transfer
    check(
      "movement_not_same_location",
      sql`${t.fromLocationId} IS NULL OR ${t.toLocationId} IS NULL OR ${t.fromLocationId} <> ${t.toLocationId}`
    ),

    index("idx_movements_variant").on(t.productVariantId),
    index("idx_movements_from_location").on(t.fromLocationId),
    index("idx_movements_to_location").on(t.toLocationId),
    index("idx_movements_created_at").on(t.createdAt),
  ]
)

export const stockMovementRelations = relations(stockMoves, ({ one }) => ({
  variant: one(productVariants, {
    fields: [stockMoves.productVariantId],
    references: [productVariants.id],
  }),
  fromLocation: one(locations, {
    fields: [stockMoves.fromLocationId],
    references: [locations.id],
  }),
  toLocation: one(locations, {
    fields: [stockMoves.toLocationId],
    references: [locations.id],
  }),
  user: one(users, {
    fields: [stockMoves.performedBy],
    references: [users.id],
  }),
}))

// ===========================================================================
// STOCK LEVELS
// ===========================================================================

export const stockLevels = pgTable(
  "stock_levels",
  (t) => ({
    id: t.uuid().notNull().defaultRandom().primaryKey(),
    productVariantId: t
      .uuid()
      .references(() => productVariants.id, { onDelete: "restrict" })
      .notNull(),
    locationId: t
      .uuid()
      .references(() => locations.id, { onDelete: "restrict" })
      .notNull(),
    quantity: t.integer().notNull().default(0),
    reserved: t.integer().notNull().default(0),
    minLevel: t.integer().notNull().default(0),
    createdAt: t.timestamp().defaultNow().notNull(),
    updatedAt: t.timestamp({ mode: "string" }).$onUpdateFn(() => sql`now()`),
  }),
  (t) => [
    unique("stock_levels_productVariant_location_uidx").on(
      t.productVariantId,
      t.locationId
    ),

    // INFO: no negative stock
    check("stock_quantity_non_negative", sql`${t.quantity} >= 0`),

    // INFO: reserved cannot exceed quantity
    check("reserved_lte_quantity", sql`${t.reserved} <= ${t.quantity}`),

    index("idx_stock_levels_variant").on(t.productVariantId),
    index("idx_stock_levels_location").on(t.locationId),
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

// ===========================================================================
// REQUISITIONS
// ===========================================================================

export const requisitions = pgTable("requisitions", (t) => ({
  id: t.uuid().notNull().defaultRandom().primaryKey(),
  createdBy: t.text().references(() => users.id, { onDelete: "set null" }),
  requisitionNumber: t.varchar({ length: 100 }).notNull().unique(),
  description: t.text(),
  status: requisitionStatusEnum("status").notNull().default("DRAFT"),
  isActive: t.boolean().notNull().default(true),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t.timestamp({ mode: "string" }).$onUpdateFn(() => sql`now()`),
}))

export const requisitionsRelations = relations(
  requisitions,
  ({ one, many }) => ({
    created: one(users, {
      fields: [requisitions.createdBy],
      references: [users.id],
    }),
    items: many(requisitionItems),
  })
)

export const requisitionItems = pgTable("requisition_items", (t) => ({
  id: t.uuid().notNull().defaultRandom().primaryKey(),
  requisitionId: t
    .uuid()
    .references(() => requisitions.id, { onDelete: "cascade" })
    .notNull(),
  productVariantId: t
    .uuid()
    .references(() => productVariants.id, { onDelete: "restrict" })
    .notNull(),
  quantityRequested: t.integer().notNull().default(0),
  quantityApproved: t.integer().notNull().default(0),
  suplierId: t.uuid().references(() => suppliers.id, { onDelete: "set null" }),
  notes: t.text(),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t.timestamp({ mode: "string" }).$onUpdateFn(() => sql`now()`),
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
    supplier: one(suppliers, {
      fields: [requisitionItems.suplierId],
      references: [suppliers.id],
    }),
  })
)

export type Categories = typeof categories.$inferSelect
export type Products = typeof products.$inferSelect
export type ProductVariants = typeof productVariants.$inferSelect
export type Locations = typeof locations.$inferSelect
export type PurchaseOrders = typeof purchaseOrders.$inferSelect
export type PurchaseOrderItems = typeof purchaseOrderItems.$inferSelect
export type Transactions = typeof stockMoves.$inferSelect
export type StockLevels = typeof stockLevels.$inferSelect
export type Requisitions = typeof requisitions.$inferSelect
export type RequisitionItems = typeof requisitionItems.$inferSelect
