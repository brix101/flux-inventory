ALTER TABLE "requisition_items" RENAME COLUMN "suplier_id" TO "supplier_id";--> statement-breakpoint
ALTER TABLE "requisition_items" DROP CONSTRAINT "requisition_items_suplier_id_suppliers_id_fk";
--> statement-breakpoint
ALTER TABLE "purchase_orders" ALTER COLUMN "line_total" SET DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE "purchase_orders" ALTER COLUMN "line_total" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "requisition_items" ADD CONSTRAINT "requisition_items_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "name_id_idx" ON "product_variants" USING btree ("name","id");