ALTER TABLE "purchase_orders" RENAME COLUMN "order_number" TO "name";--> statement-breakpoint
ALTER TABLE "purchase_orders" DROP CONSTRAINT "purchase_orders_orderNumber_unique";--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_name_unique" UNIQUE("name");