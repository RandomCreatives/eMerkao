-- Auth triggers and functions for automatic profile creation

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    user_type,
    phone_number,
    region,
    preferred_language
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'user_type')::user_type, 'buyer'),
    NEW.raw_user_meta_data->>'phone_number',
    NEW.raw_user_meta_data->>'region',
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en')
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to handle user updates
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET
    email = NEW.email,
    updated_at = NOW()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for user updates
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

-- Function to automatically update seller metrics when orders change
CREATE OR REPLACE FUNCTION update_seller_metrics_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Update metrics for all affected sellers
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    PERFORM update_seller_metrics(seller_id) 
    FROM (
      SELECT DISTINCT oi.seller_id
      FROM order_items oi
      WHERE oi.order_id = NEW.id
    ) AS sellers;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    PERFORM update_seller_metrics(seller_id) 
    FROM (
      SELECT DISTINCT oi.seller_id
      FROM order_items oi
      WHERE oi.order_id = OLD.id
    ) AS sellers;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update seller metrics when orders change
CREATE TRIGGER update_seller_metrics_on_order_change
  AFTER INSERT OR UPDATE OR DELETE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_seller_metrics_trigger();

-- Function to update product analytics
CREATE OR REPLACE FUNCTION update_product_analytics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update analytics when order items are created (purchases)
  IF TG_OP = 'INSERT' THEN
    INSERT INTO product_analytics (product_id, date, purchases, revenue)
    VALUES (NEW.product_id, CURRENT_DATE, NEW.quantity, NEW.total_price)
    ON CONFLICT (product_id, date)
    DO UPDATE SET
      purchases = product_analytics.purchases + NEW.quantity,
      revenue = product_analytics.revenue + NEW.total_price;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update analytics when order items are created
CREATE TRIGGER update_analytics_on_purchase
  AFTER INSERT ON order_items
  FOR EACH ROW EXECUTE FUNCTION update_product_analytics();

-- Function to update cart analytics
CREATE OR REPLACE FUNCTION update_cart_analytics()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Track cart addition
    INSERT INTO product_analytics (product_id, date, cart_additions)
    VALUES (NEW.product_id, CURRENT_DATE, 1)
    ON CONFLICT (product_id, date)
    DO UPDATE SET cart_additions = product_analytics.cart_additions + 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update analytics when items are added to cart
CREATE TRIGGER update_analytics_on_cart_add
  AFTER INSERT ON cart_items
  FOR EACH ROW EXECUTE FUNCTION update_cart_analytics();

-- Function to generate unique order numbers
CREATE OR REPLACE FUNCTION generate_unique_order_number()
RETURNS TRIGGER AS $$
DECLARE
  new_order_number TEXT;
  counter INTEGER := 0;
BEGIN
  LOOP
    new_order_number := 'EM-' || LPAD((FLOOR(RANDOM() * 9999) + 1)::TEXT, 4, '0');
    
    -- Check if this order number already exists
    IF NOT EXISTS (SELECT 1 FROM orders WHERE order_number = new_order_number) THEN
      EXIT;
    END IF;
    
    counter := counter + 1;
    IF counter > 100 THEN
      -- Fallback to timestamp-based number if we can't find a unique random one
      new_order_number := 'EM-' || EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT;
      EXIT;
    END IF;
  END LOOP;
  
  NEW.order_number := new_order_number;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate order numbers
CREATE TRIGGER generate_order_number_trigger
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL OR NEW.order_number = '')
  EXECUTE FUNCTION generate_unique_order_number();

-- Function to create product slug
CREATE OR REPLACE FUNCTION generate_product_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Generate base slug from product name
  base_slug := lower(trim(regexp_replace(NEW.name, '[^a-zA-Z0-9\s]', '', 'g')));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := trim(base_slug, '-');
  
  -- Ensure slug is not empty
  IF base_slug = '' THEN
    base_slug := 'product';
  END IF;
  
  final_slug := base_slug;
  
  -- Check for uniqueness and append counter if needed
  LOOP
    IF NOT EXISTS (SELECT 1 FROM products WHERE slug = final_slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000')) THEN
      EXIT;
    END IF;
    
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  NEW.slug := final_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate product slugs
CREATE TRIGGER generate_product_slug_trigger
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  WHEN (NEW.slug IS NULL OR NEW.slug = '' OR (TG_OP = 'UPDATE' AND OLD.name != NEW.name))
  EXECUTE FUNCTION generate_product_slug();

-- Create a function to refresh materialized views periodically
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY popular_products;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Grant specific permissions for auth triggers
GRANT ALL ON auth.users TO service_role;
GRANT ALL ON public.profiles TO service_role;