-- create function
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id TEXT;
BEGIN
  v_user_id := current_setting('app.user_id', true);

  INSERT INTO audit_logs (
    user_id,
    action,
    entity_name,
    entity_id,
    old_value,
    new_value,
    created_at
  )
  VALUES (
    v_user_id,
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    row_to_json(OLD),
    row_to_json(NEW),
    now()
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- PRODUCTS
CREATE TRIGGER audit_products
AFTER INSERT OR UPDATE OR DELETE ON products
FOR EACH ROW EXECUTE FUNCTION audit_trigger();

-- PRODUCT VARIANTS
CREATE TRIGGER audit_product_variants
AFTER INSERT OR UPDATE OR DELETE ON product_variants
FOR EACH ROW EXECUTE FUNCTION audit_trigger();

-- STOCK LEVELS (VERY IMPORTANT)
CREATE TRIGGER audit_stock_levels
AFTER INSERT OR UPDATE OR DELETE ON stock_levels
FOR EACH ROW EXECUTE FUNCTION audit_trigger();

-- STOCK MOVES (OPTIONAL but useful for traceability)
CREATE TRIGGER audit_stock_moves
AFTER INSERT OR UPDATE OR DELETE ON stock_moves
FOR EACH ROW EXECUTE FUNCTION audit_trigger();

-- PURCHASE ORDERS
CREATE TRIGGER audit_purchase_orders
AFTER INSERT OR UPDATE OR DELETE ON purchase_orders
FOR EACH ROW EXECUTE FUNCTION audit_trigger();

-- PURCHASE ORDER ITEMS
CREATE TRIGGER audit_purchase_order_items
AFTER INSERT OR UPDATE OR DELETE ON purchase_order_items
FOR EACH ROW EXECUTE FUNCTION audit_trigger();
