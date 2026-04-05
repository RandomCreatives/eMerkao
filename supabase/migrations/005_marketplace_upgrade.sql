-- eMerkato Marketplace Upgrade Migration
-- Adds: vendors table, escrow orders, product enhancements, RLS policies

-- ─────────────────────────────────────────
-- 1. VENDORS TABLE
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vendors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    business_name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    brand_color TEXT DEFAULT '#1c1917',
    trust_score DECIMAL(3,2) DEFAULT 0 CHECK (trust_score >= 0 AND trust_score <= 5),
    is_verified BOOLEAN DEFAULT FALSE,
    ethiopia_region TEXT,
    years_in_merkato INTEGER DEFAULT 0,
    avg_delivery_days INTEGER DEFAULT 3,
    store_description TEXT,
    telegram_chat_id BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendors_slug ON vendors(slug);
CREATE INDEX IF NOT EXISTS idx_vendors_profile_id ON vendors(profile_id);

CREATE TRIGGER update_vendors_updated_at
    BEFORE UPDATE ON vendors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────
-- 2. ENHANCE PRODUCTS TABLE
-- ─────────────────────────────────────────
ALTER TABLE products
    ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS category_slug TEXT,
    ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_products_category_slug ON products(category_slug);

-- ─────────────────────────────────────────
-- 3. ESCROW STATUS ON ORDERS
-- ─────────────────────────────────────────
CREATE TYPE escrow_status AS ENUM (
    'pending',
    'payment_captured',
    'delivered_confirmed',
    'funds_released'
);

ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS escrow_status escrow_status DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS payment_session_id TEXT,
    ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES vendors(id);

CREATE INDEX IF NOT EXISTS idx_orders_payment_session ON orders(payment_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_vendor_id ON orders(vendor_id);

-- ─────────────────────────────────────────
-- 4. ROW LEVEL SECURITY
-- ─────────────────────────────────────────

-- Enable RLS
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- VENDORS: public read, owner write
CREATE POLICY "vendors_public_read"
    ON vendors FOR SELECT USING (true);

CREATE POLICY "vendors_owner_insert"
    ON vendors FOR INSERT
    WITH CHECK (profile_id = auth.uid());

CREATE POLICY "vendors_owner_update"
    ON vendors FOR UPDATE
    USING (profile_id = auth.uid());

-- PRODUCTS: public read active products, vendor can manage own
CREATE POLICY "products_public_read"
    ON products FOR SELECT
    USING (status = 'active');

CREATE POLICY "products_vendor_insert"
    ON products FOR INSERT
    WITH CHECK (
        vendor_id IN (
            SELECT id FROM vendors WHERE profile_id = auth.uid()
        )
    );

CREATE POLICY "products_vendor_update"
    ON products FOR UPDATE
    USING (
        vendor_id IN (
            SELECT id FROM vendors WHERE profile_id = auth.uid()
        )
    );

CREATE POLICY "products_vendor_delete"
    ON products FOR DELETE
    USING (
        vendor_id IN (
            SELECT id FROM vendors WHERE profile_id = auth.uid()
        )
    );

-- ORDERS: buyers see own orders, vendors see orders containing their products
CREATE POLICY "orders_buyer_read"
    ON orders FOR SELECT
    USING (buyer_id = auth.uid());

CREATE POLICY "orders_vendor_read"
    ON orders FOR SELECT
    USING (
        vendor_id IN (
            SELECT id FROM vendors WHERE profile_id = auth.uid()
        )
    );

CREATE POLICY "orders_buyer_insert"
    ON orders FOR INSERT
    WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "orders_vendor_update_escrow"
    ON orders FOR UPDATE
    USING (
        vendor_id IN (
            SELECT id FROM vendors WHERE profile_id = auth.uid()
        )
    );
