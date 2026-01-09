-- eMerkato Database Schema
-- Initial migration for Supabase

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_type AS ENUM ('buyer', 'seller', 'admin');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('telebirr', 'cbe_birr', 'cash_on_delivery', 'bank_transfer');
CREATE TYPE kyc_status AS ENUM ('unverified', 'pending', 'verified', 'rejected');
CREATE TYPE product_status AS ENUM ('active', 'inactive', 'out_of_stock', 'pending_approval');
CREATE TYPE message_type AS ENUM ('user', 'bot', 'system');
CREATE TYPE integration_platform AS ENUM ('facebook', 'instagram', 'telegram', 'whatsapp');

-- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    user_type user_type NOT NULL DEFAULT 'buyer',
    avatar_url TEXT,
    date_of_birth DATE,
    gender TEXT,
    preferred_language TEXT DEFAULT 'en',
    
    -- Address information
    region TEXT,
    city TEXT,
    subcity TEXT,
    woreda TEXT,
    kebele TEXT,
    house_number TEXT,
    
    -- Verification and trust
    is_verified BOOLEAN DEFAULT FALSE,
    trust_score INTEGER DEFAULT 0 CHECK (trust_score >= 0 AND trust_score <= 100),
    kyc_status kyc_status DEFAULT 'unverified',
    
    -- Telegram integration
    telegram_user_id BIGINT UNIQUE,
    telegram_username TEXT,
    telegram_chat_id BIGINT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sellers table (additional seller-specific information)
CREATE TABLE sellers (
    id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
    store_name TEXT NOT NULL,
    store_description TEXT,
    store_logo_url TEXT,
    business_license_number TEXT,
    tax_identification_number TEXT,
    
    -- Business metrics
    total_sales DECIMAL(12,2) DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    
    -- Trust and verification
    is_trusted_seller BOOLEAN DEFAULT FALSE,
    verification_documents JSONB,
    
    -- Financial
    commission_rate DECIMAL(5,2) DEFAULT 2.00, -- Default 2% commission
    available_balance DECIMAL(12,2) DEFAULT 0,
    pending_balance DECIMAL(12,2) DEFAULT 0,
    
    -- Integration settings
    n8n_webhook_url TEXT,
    facebook_enabled BOOLEAN DEFAULT FALSE,
    instagram_enabled BOOLEAN DEFAULT FALSE,
    telegram_bot_enabled BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    name_am TEXT, -- Amharic translation
    name_om TEXT, -- Oromo translation
    name_ti TEXT, -- Tigrinya translation
    description TEXT,
    parent_id UUID REFERENCES categories(id),
    is_cultural BOOLEAN DEFAULT FALSE,
    icon_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES categories(id) NOT NULL,
    
    -- Basic product information
    name TEXT NOT NULL,
    description TEXT,
    short_description TEXT,
    
    -- Pricing
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    original_price DECIMAL(10,2),
    currency TEXT DEFAULT 'ETB',
    
    -- Inventory
    stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
    min_stock_level INTEGER DEFAULT 5,
    sku TEXT UNIQUE,
    
    -- Product attributes
    weight DECIMAL(8,2),
    dimensions JSONB, -- {length, width, height}
    color TEXT,
    size TEXT,
    material TEXT,
    
    -- Media
    images JSONB DEFAULT '[]'::jsonb, -- Array of image URLs
    video_url TEXT,
    
    -- SEO and metadata
    slug TEXT UNIQUE,
    meta_title TEXT,
    meta_description TEXT,
    tags TEXT[],
    
    -- Status and visibility
    status product_status DEFAULT 'pending_approval',
    is_featured BOOLEAN DEFAULT FALSE,
    is_cultural BOOLEAN DEFAULT FALSE,
    
    -- Location
    origin_region TEXT,
    origin_city TEXT,
    
    -- Analytics
    view_count INTEGER DEFAULT 0,
    favorite_count INTEGER DEFAULT 0,
    
    -- Telegram sync metadata
    telegram_message_id BIGINT,
    telegram_chat_id BIGINT,
    synced_from_telegram BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    buyer_id UUID REFERENCES profiles(id) NOT NULL,
    
    -- Order totals
    subtotal DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    shipping_cost DECIMAL(12,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    
    -- Status tracking
    status order_status DEFAULT 'pending',
    payment_status payment_status DEFAULT 'pending',
    payment_method payment_method,
    
    -- Shipping information
    shipping_address JSONB NOT NULL,
    billing_address JSONB,
    estimated_delivery_date DATE,
    actual_delivery_date DATE,
    tracking_number TEXT,
    
    -- Payment information
    payment_reference TEXT,
    payment_gateway_response JSONB,
    
    -- Metadata
    notes TEXT,
    internal_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) NOT NULL,
    seller_id UUID REFERENCES sellers(id) NOT NULL,
    
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    
    -- Product snapshot at time of order
    product_name TEXT NOT NULL,
    product_image_url TEXT,
    product_sku TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    order_id UUID REFERENCES orders(id),
    
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT,
    
    -- Media
    images JSONB DEFAULT '[]'::jsonb,
    
    -- Moderation
    is_verified BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT TRUE,
    
    -- Helpfulness
    helpful_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shopping cart table
CREATE TABLE cart_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, product_id)
);

-- Wishlist table
CREATE TABLE wishlist_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, product_id)
);

-- Telegram bot conversations
CREATE TABLE telegram_conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    telegram_chat_id BIGINT NOT NULL,
    telegram_user_id BIGINT NOT NULL,
    
    -- Conversation state
    current_state TEXT DEFAULT 'idle',
    context_data JSONB DEFAULT '{}'::jsonb,
    
    -- Settings
    notifications_enabled BOOLEAN DEFAULT TRUE,
    language_preference TEXT DEFAULT 'en',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(telegram_chat_id, telegram_user_id)
);

-- Telegram messages (for cloud storage integration)
CREATE TABLE telegram_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES telegram_conversations(id) ON DELETE CASCADE NOT NULL,
    
    -- Telegram message data
    telegram_message_id BIGINT NOT NULL,
    telegram_chat_id BIGINT NOT NULL,
    message_type message_type NOT NULL,
    
    -- Message content
    content TEXT,
    media_urls JSONB DEFAULT '[]'::jsonb,
    
    -- Processing status
    is_processed BOOLEAN DEFAULT FALSE,
    processing_result JSONB,
    
    -- Product extraction (if applicable)
    extracted_product_data JSONB,
    created_product_id UUID REFERENCES products(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seller integrations
CREATE TABLE seller_integrations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE NOT NULL,
    platform integration_platform NOT NULL,
    
    -- Integration settings
    is_enabled BOOLEAN DEFAULT FALSE,
    configuration JSONB DEFAULT '{}'::jsonb,
    
    -- Credentials (encrypted)
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Webhook settings
    webhook_url TEXT,
    webhook_secret TEXT,
    
    -- Status
    last_sync_at TIMESTAMP WITH TIME ZONE,
    sync_status TEXT DEFAULT 'idle',
    error_message TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(seller_id, platform)
);

-- Analytics and insights
CREATE TABLE product_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    
    -- Daily metrics
    date DATE NOT NULL,
    views INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    cart_additions INTEGER DEFAULT 0,
    purchases INTEGER DEFAULT 0,
    revenue DECIMAL(12,2) DEFAULT 0,
    
    -- Traffic sources
    organic_views INTEGER DEFAULT 0,
    search_views INTEGER DEFAULT 0,
    social_views INTEGER DEFAULT 0,
    direct_views INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(product_id, date)
);

-- Notifications table
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL, -- 'order', 'product', 'system', 'promotion'
    
    -- Targeting
    data JSONB DEFAULT '{}'::jsonb,
    action_url TEXT,
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    is_sent BOOLEAN DEFAULT FALSE,
    
    -- Delivery channels
    send_email BOOLEAN DEFAULT FALSE,
    send_sms BOOLEAN DEFAULT FALSE,
    send_telegram BOOLEAN DEFAULT FALSE,
    send_push BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_telegram_user_id ON profiles(telegram_user_id);
CREATE INDEX idx_profiles_user_type ON profiles(user_type);
CREATE INDEX idx_products_seller_id ON products(seller_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_created_at ON products(created_at DESC);
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_telegram_messages_chat_id ON telegram_messages(telegram_chat_id);
CREATE INDEX idx_telegram_messages_processed ON telegram_messages(is_processed);
CREATE INDEX idx_product_analytics_date ON product_analytics(date DESC);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sellers_updated_at BEFORE UPDATE ON sellers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_telegram_conversations_updated_at BEFORE UPDATE ON telegram_conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seller_integrations_updated_at BEFORE UPDATE ON seller_integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();