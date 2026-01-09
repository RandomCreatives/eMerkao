-- Seed data for eMerkato
-- Initial categories and sample data

-- Insert cultural categories
INSERT INTO categories (id, name, name_am, name_om, name_ti, description, is_cultural, sort_order) VALUES
(uuid_generate_v4(), 'Habesha Clothes', 'የሐበሻ ልብስ', 'Uffata Habesha', 'ሓበሻ ክዳን', 'Traditional Ethiopian clothing and garments', true, 1),
(uuid_generate_v4(), 'Ceremonial Wear', 'የበዓል ልብስ', 'Uffata Ayyaana', 'ዓመታዊ ክዳን', 'Special occasion and ceremonial attire', true, 2),
(uuid_generate_v4(), 'Spices (Berbere)', 'ቅመማ ቅመም (በርበሬ)', 'Mi\'eessaa (Barbaree)', 'ቅመማት (በርበረ)', 'Traditional Ethiopian spices and seasonings', true, 3),
(uuid_generate_v4(), 'Coffee Sets (Jebena)', 'የቡና ዕቃዎች (ጀበና)', 'Meeshaalee Bunaa (Jebena)', 'ናይ ቡን መሳርሒታት (ጀበና)', 'Traditional coffee ceremony equipment', true, 4),
(uuid_generate_v4(), 'Religious Goods', 'የሃይማኖት ዕቃዎች', 'Meeshaalee Amantaa', 'ሃይማኖታዊ ንብረት', 'Religious items and spiritual goods', true, 5),
(uuid_generate_v4(), 'Electronics', 'ኤሌክትሮኒክስ', 'Elektirooniksii', 'ኤሌክትሮኒክስ', 'Modern electronics and gadgets', false, 6),
(uuid_generate_v4(), 'General', 'አጠቃላይ', 'Waliigalaa', 'ሓፈሻዊ', 'General merchandise and other items', false, 7);

-- Insert sample regions (Ethiopian regions)
-- This will be used for location-based filtering and delivery

-- Create a function to generate sample order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
    RETURN 'EM-' || LPAD((FLOOR(RANDOM() * 9999) + 1)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Insert sample notification templates
INSERT INTO notifications (id, user_id, title, message, type, data, is_read, send_telegram) 
SELECT 
    uuid_generate_v4(),
    '00000000-0000-0000-0000-000000000000'::uuid, -- System notifications
    'Welcome to eMerkato!',
    'Welcome to Ethiopia''s premier digital marketplace. Start exploring authentic products from verified sellers.',
    'system',
    '{"template": "welcome", "action": "explore"}'::jsonb,
    false,
    true
WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE type = 'system' AND title = 'Welcome to eMerkato!');

-- Create indexes for Ethiopian-specific searches
CREATE INDEX IF NOT EXISTS idx_products_cultural ON products(is_cultural) WHERE is_cultural = true;
CREATE INDEX IF NOT EXISTS idx_products_region ON products(origin_region);
CREATE INDEX IF NOT EXISTS idx_profiles_region ON profiles(region);
CREATE INDEX IF NOT EXISTS idx_sellers_trusted ON sellers(is_trusted_seller) WHERE is_trusted_seller = true;

-- Create full-text search indexes for Ethiopian languages
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS idx_categories_search ON categories USING gin(to_tsvector('english', name || ' ' || COALESCE(name_am, '') || ' ' || COALESCE(name_om, '') || ' ' || COALESCE(name_ti, '')));

-- Create materialized view for popular products
CREATE MATERIALIZED VIEW popular_products AS
SELECT 
    p.*,
    COALESCE(pa.total_views, 0) as total_views,
    COALESCE(pa.total_purchases, 0) as total_purchases,
    COALESCE(s.average_rating, 0) as seller_rating,
    s.is_trusted_seller,
    c.name as category_name,
    c.is_cultural
FROM products p
LEFT JOIN sellers s ON p.seller_id = s.id
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN (
    SELECT 
        product_id,
        SUM(views) as total_views,
        SUM(purchases) as total_purchases
    FROM product_analytics
    WHERE date >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY product_id
) pa ON p.id = pa.product_id
WHERE p.status = 'active'
ORDER BY 
    CASE WHEN p.is_cultural THEN 1 ELSE 2 END,
    COALESCE(pa.total_purchases, 0) DESC,
    COALESCE(pa.total_views, 0) DESC,
    p.created_at DESC;

-- Create unique index on materialized view
CREATE UNIQUE INDEX idx_popular_products_id ON popular_products(id);

-- Create function to refresh popular products
CREATE OR REPLACE FUNCTION refresh_popular_products()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY popular_products;
END;
$$ LANGUAGE plpgsql;

-- Create function to get trending products by region
CREATE OR REPLACE FUNCTION get_trending_products_by_region(region_name TEXT DEFAULT NULL, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    product_id UUID,
    product_name TEXT,
    price DECIMAL,
    seller_name TEXT,
    category_name TEXT,
    is_cultural BOOLEAN,
    total_views BIGINT,
    trend_score DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.price,
        pr.full_name,
        c.name,
        p.is_cultural,
        COALESCE(SUM(pa.views), 0) as total_views,
        (COALESCE(SUM(pa.views), 0) * 0.3 + COALESCE(SUM(pa.purchases), 0) * 0.7)::DECIMAL as trend_score
    FROM products p
    JOIN sellers s ON p.seller_id = s.id
    JOIN profiles pr ON s.id = pr.id
    JOIN categories c ON p.category_id = c.id
    LEFT JOIN product_analytics pa ON p.id = pa.product_id 
        AND pa.date >= CURRENT_DATE - INTERVAL '7 days'
    WHERE p.status = 'active'
        AND (region_name IS NULL OR p.origin_region = region_name OR pr.region = region_name)
    GROUP BY p.id, p.name, p.price, pr.full_name, c.name, p.is_cultural
    ORDER BY trend_score DESC, p.is_cultural DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Create function for AI-powered product recommendations
CREATE OR REPLACE FUNCTION get_product_recommendations(
    user_uuid UUID,
    limit_count INTEGER DEFAULT 5
)
RETURNS TABLE (
    product_id UUID,
    product_name TEXT,
    price DECIMAL,
    category_name TEXT,
    is_cultural BOOLEAN,
    recommendation_score DECIMAL,
    reason TEXT
) AS $$
DECLARE
    user_region TEXT;
    user_preferences JSONB;
BEGIN
    -- Get user's region and preferences
    SELECT region INTO user_region FROM profiles WHERE id = user_uuid;
    
    RETURN QUERY
    WITH user_activity AS (
        -- Get user's recent activity
        SELECT DISTINCT p.category_id, COUNT(*) as interaction_count
        FROM products p
        JOIN cart_items ci ON p.id = ci.product_id
        WHERE ci.user_id = user_uuid
        GROUP BY p.category_id
        
        UNION ALL
        
        SELECT DISTINCT p.category_id, COUNT(*) * 2 as interaction_count
        FROM products p
        JOIN order_items oi ON p.id = oi.product_id
        JOIN orders o ON oi.order_id = o.id
        WHERE o.buyer_id = user_uuid
        GROUP BY p.category_id
    ),
    preferred_categories AS (
        SELECT category_id, SUM(interaction_count) as total_interactions
        FROM user_activity
        GROUP BY category_id
        ORDER BY total_interactions DESC
        LIMIT 3
    )
    SELECT 
        p.id,
        p.name,
        p.price,
        c.name,
        p.is_cultural,
        (
            CASE WHEN pc.category_id IS NOT NULL THEN 0.4 ELSE 0.0 END +
            CASE WHEN p.is_cultural THEN 0.3 ELSE 0.0 END +
            CASE WHEN p.origin_region = user_region THEN 0.2 ELSE 0.0 END +
            CASE WHEN s.is_trusted_seller THEN 0.1 ELSE 0.0 END
        )::DECIMAL as recommendation_score,
        CASE 
            WHEN pc.category_id IS NOT NULL AND p.is_cultural THEN 'Based on your cultural preferences'
            WHEN pc.category_id IS NOT NULL THEN 'Based on your shopping history'
            WHEN p.is_cultural THEN 'Popular cultural item'
            WHEN p.origin_region = user_region THEN 'Local seller in your region'
            ELSE 'Trending product'
        END as reason
    FROM products p
    JOIN categories c ON p.category_id = c.id
    JOIN sellers s ON p.seller_id = s.id
    LEFT JOIN preferred_categories pc ON p.category_id = pc.category_id
    WHERE p.status = 'active'
        AND p.id NOT IN (
            SELECT product_id FROM cart_items WHERE user_id = user_uuid
            UNION
            SELECT oi.product_id FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            WHERE o.buyer_id = user_uuid
        )
    ORDER BY recommendation_score DESC, p.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;