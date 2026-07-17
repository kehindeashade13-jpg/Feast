-- =====================================================================
-- DATABASE RESET & INITIALIZATION SCRIPT
-- Overrides any previous database schema for products and orders
-- Optimized for Supabase PostgreSQL
-- =====================================================================

-- Enable UUID extension to allow auto-generating secure IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------
-- 1. DROP EXISTING TABLES
-- ---------------------------------------------------------------------
-- We drop orders first to prevent dependency issues if constraints exist
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;

-- ---------------------------------------------------------------------
-- 2. CREATE PRODUCTS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price NUMERIC NOT NULL,
  category TEXT DEFAULT 'General',
  image_url TEXT DEFAULT 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 3. CREATE ORDERS TABLE
-- Supports both standard and custom mapped schemas to guarantee compatibility
-- ---------------------------------------------------------------------
CREATE TABLE orders (
  -- Primary Identification
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  
  -- Customer Details
  customer_name VARCHAR(255) NOT NULL DEFAULT 'Guest Customer',
  customer_phone VARCHAR(50) DEFAULT '',
  customer_email VARCHAR(255) DEFAULT '',
  
  -- Delivery Information
  delivery_address TEXT DEFAULT '',
  delivery_instructions TEXT DEFAULT '',
  
  -- Items & Order Data
  items JSONB DEFAULT '[]'::jsonb,
  payment_method VARCHAR(100) DEFAULT 'Cash on Delivery',
  status VARCHAR(50) DEFAULT 'Pending',
  
  -- Financial Info (Standard Schema)
  total_price NUMERIC DEFAULT 0,
  
  -- Financial & Mapped Info (Custom Schema Fallbacks)
  customer_address TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  subtotal NUMERIC DEFAULT 0,
  delivery_fee NUMERIC DEFAULT 1500,
  discount NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  
  -- Timestamps
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 4. INSERT SEED PRODUCTS
-- Populates the application with initial gourmet menu items
-- ---------------------------------------------------------------------
INSERT INTO products (name, description, price, category, image_url, stock)
VALUES 
  (
    'Double Grilled Chicken Burger', 
    'Juicy double-stacked grilled chicken breast patties, melted cheddar cheese, fresh lettuce, sliced tomatoes, caramelized onions, and our signature burger sauce on a toasted brioche bun.', 
    10500.00, 
    'Burger', 
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800', 
    25
  ),
  (
    'Spicy Beef Shawarma Wrap', 
    'Premium sliced flank beef slow-roasted and marinated in authentic Middle Eastern spices, wrapped in toasted pita with French fries, pickled cucumbers, cabbage salad, and rich garlic tahini sauce.', 
    8500.00, 
    'Shawarma', 
    'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&q=80&w=800', 
    50
  ),
  (
    'Authentic Smoked Chicken Suya', 
    'Tender boneless chicken thigh pieces seasoned in spicy roasted peanut rub (yaji spice) and smoked over red-hot charcoal, served with fresh sliced red onions, cabbage, and extra yaji.', 
    9000.00, 
    'Chicken Suya', 
    'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800', 
    30
  ),
  (
    'Jumbo Chicken Suya Wrap', 
    'Toasted flatbread filled with juicy chopped chicken suya, shredded lettuce, tomatoes, sliced onions, and a splash of spicy yaji mayo dressing.', 
    7500.00, 
    'Chicken Suya', 
    'https://images.unsplash.com/photo-1642d8d3f63c800888?auto=format&fit=crop&q=80&w=800', 
    20
  ),
  (
    'Crispy Chicken Burger with Fries', 
    'Crispy golden buttermilk fried chicken breast, pickles, spicy coleslaw, and herb mayo in a toasted bun, served with a side of crispy French fries.', 
    11000.00, 
    'Burger', 
    'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?auto=format&fit=crop&q=80&w=800', 
    15
  );

-- ---------------------------------------------------------------------
-- 5. OPTIMIZATION & INDEXES
-- Improves query execution speeds for status updates and lookups
-- ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders (order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);

-- ---------------------------------------------------------------------
-- 6. SECURITY & ROW LEVEL SECURITY (RLS) POLICIES (Supabase Recommended)
-- Uncomment and execute the lines below in your Supabase SQL editor if RLS is enabled.
-- ---------------------------------------------------------------------
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- -- Products Policies:
-- CREATE POLICY "Allow public read access to products" ON products FOR SELECT USING (true);
-- CREATE POLICY "Allow authorized admin updates to products" ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- -- Orders Policies:
-- CREATE POLICY "Allow public to insert orders" ON orders FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Allow users to track/view their own orders" ON orders FOR SELECT USING (true);
-- CREATE POLICY "Allow authorized admin updates to orders" ON orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
