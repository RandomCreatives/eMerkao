-- Row Level Security (RLS) Policies for eMerkato
-- This ensures data security and proper access control

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Public profiles are viewable by all" ON profiles
    FOR SELECT USING (true);

-- Sellers policies
CREATE POLICY "Sellers can manage their own seller profile" ON sellers
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Anyone can view seller profiles" ON sellers
    FOR SELECT USING (true);

-- Categories policies (public read access)
CREATE POLICY "Anyone can view categories" ON categories
    FOR SELECT USING (is_active = true);

-- Products policies
CREATE POLICY "Anyone can view active products" ON products
    FOR SELECT USING (status = 'active');

CREATE POLICY "Sellers can manage their own products" ON products
    FOR ALL USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can insert products" ON products
    FOR INSERT WITH CHECK (auth.uid() = seller_id);

-- Orders policies
CREATE POLICY "Buyers can view their own orders" ON orders
    FOR SELECT USING (auth.uid() = buyer_id);

CREATE POLICY "Sellers can view orders for their products" ON orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM order_items oi 
            WHERE oi.order_id = orders.id 
            AND oi.seller_id = auth.uid()
        )
    );

CREATE POLICY "Buyers can create orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Buyers can update their pending orders" ON orders
    FOR UPDATE USING (auth.uid() = buyer_id AND status = 'pending');

-- Order items policies
CREATE POLICY "Order items are viewable by order participants" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders o 
            WHERE o.id = order_items.order_id 
            AND (o.buyer_id = auth.uid() OR order_items.seller_id = auth.uid())
        )
    );

CREATE POLICY "Order items can be inserted with orders" ON order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders o 
            WHERE o.id = order_items.order_id 
            AND o.buyer_id = auth.uid()
        )
    );

-- Reviews policies
CREATE POLICY "Anyone can view approved reviews" ON reviews
    FOR SELECT USING (is_approved = true);

CREATE POLICY "Buyers can create reviews for their purchases" ON reviews
    FOR INSERT WITH CHECK (
        auth.uid() = buyer_id AND
        EXISTS (
            SELECT 1 FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            WHERE oi.product_id = reviews.product_id
            AND o.buyer_id = auth.uid()
            AND o.status = 'delivered'
        )
    );

CREATE POLICY "Buyers can update their own reviews" ON reviews
    FOR UPDATE USING (auth.uid() = buyer_id);

-- Cart items policies
CREATE POLICY "Users can manage their own cart" ON cart_items
    FOR ALL USING (auth.uid() = user_id);

-- Wishlist policies
CREATE POLICY "Users can manage their own wishlist" ON wishlist_items
    FOR ALL USING (auth.uid() = user_id);

-- Telegram conversations policies
CREATE POLICY "Users can manage their own telegram conversations" ON telegram_conversations
    FOR ALL USING (auth.uid() = user_id);

-- Telegram messages policies
CREATE POLICY "Users can view their own telegram messages" ON telegram_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM telegram_conversations tc
            WHERE tc.id = telegram_messages.conversation_id
            AND tc.user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert telegram messages" ON telegram_messages
    FOR INSERT WITH CHECK (true); -- This will be restricted by service role

-- Seller integrations policies
CREATE POLICY "Sellers can manage their own integrations" ON seller_integrations
    FOR ALL USING (auth.uid() = seller_id);

-- Product analytics policies
CREATE POLICY "Sellers can view analytics for their products" ON product_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM products p
            WHERE p.id = product_analytics.product_id
            AND p.seller_id = auth.uid()
        )
    );

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Create functions for common operations
CREATE OR REPLACE FUNCTION get_user_profile(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    email TEXT,
    full_name TEXT,
    user_type user_type,
    is_verified BOOLEAN,
    trust_score INTEGER,
    telegram_user_id BIGINT
) 
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.email, p.full_name, p.user_type, p.is_verified, p.trust_score, p.telegram_user_id
    FROM profiles p
    WHERE p.id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to create seller profile
CREATE OR REPLACE FUNCTION create_seller_profile(
    user_uuid UUID,
    store_name_param TEXT,
    store_description_param TEXT DEFAULT NULL
)
RETURNS UUID
SECURITY DEFINER
AS $$
DECLARE
    seller_uuid UUID;
BEGIN
    -- Update user type to seller
    UPDATE profiles 
    SET user_type = 'seller', updated_at = NOW()
    WHERE id = user_uuid;
    
    -- Create seller record
    INSERT INTO sellers (id, store_name, store_description)
    VALUES (user_uuid, store_name_param, store_description_param)
    RETURNING id INTO seller_uuid;
    
    RETURN seller_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate seller metrics
CREATE OR REPLACE FUNCTION update_seller_metrics(seller_uuid UUID)
RETURNS VOID
SECURITY DEFINER
AS $$
BEGIN
    UPDATE sellers SET
        total_orders = (
            SELECT COUNT(DISTINCT o.id)
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            WHERE oi.seller_id = seller_uuid
            AND o.status = 'delivered'
        ),
        total_sales = (
            SELECT COALESCE(SUM(oi.total_price), 0)
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            WHERE oi.seller_id = seller_uuid
            AND o.status = 'delivered'
        ),
        average_rating = (
            SELECT COALESCE(AVG(r.rating), 0)
            FROM reviews r
            JOIN products p ON r.product_id = p.id
            WHERE p.seller_id = seller_uuid
            AND r.is_approved = true
        ),
        total_reviews = (
            SELECT COUNT(r.id)
            FROM reviews r
            JOIN products p ON r.product_id = p.id
            WHERE p.seller_id = seller_uuid
            AND r.is_approved = true
        ),
        updated_at = NOW()
    WHERE id = seller_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to sync telegram user
CREATE OR REPLACE FUNCTION sync_telegram_user(
    user_uuid UUID,
    tg_user_id BIGINT,
    tg_username TEXT DEFAULT NULL,
    tg_chat_id BIGINT DEFAULT NULL
)
RETURNS UUID
SECURITY DEFINER
AS $$
DECLARE
    conversation_uuid UUID;
BEGIN
    -- Update profile with telegram info
    UPDATE profiles SET
        telegram_user_id = tg_user_id,
        telegram_username = tg_username,
        telegram_chat_id = tg_chat_id,
        updated_at = NOW()
    WHERE id = user_uuid;
    
    -- Create or update telegram conversation
    INSERT INTO telegram_conversations (user_id, telegram_chat_id, telegram_user_id)
    VALUES (user_uuid, tg_chat_id, tg_user_id)
    ON CONFLICT (telegram_chat_id, telegram_user_id) 
    DO UPDATE SET
        user_id = user_uuid,
        updated_at = NOW()
    RETURNING id INTO conversation_uuid;
    
    RETURN conversation_uuid;
END;
$$ LANGUAGE plpgsql;