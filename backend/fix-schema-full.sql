-- ============================================================================
-- FIX: Schema Regression Patch
-- Run this to add missing tables and columns identified in code review
-- ============================================================================

-- 1. Add missing columns to 'spawns' table
ALTER TABLE spawns ADD COLUMN IF NOT EXISTS female_code VARCHAR(20);
ALTER TABLE spawns ADD COLUMN IF NOT EXISTS male_code VARCHAR(20);
ALTER TABLE spawns ADD COLUMN IF NOT EXISTS female_weight_kg DECIMAL(5,2);
ALTER TABLE spawns ADD COLUMN IF NOT EXISTS male_weight_kg DECIMAL(5,2);

-- 2. Create 'workers' table (used in People & Finance)
CREATE TABLE IF NOT EXISTS workers (
    worker_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(50),
    phone_number VARCHAR(20),
    start_date DATE DEFAULT CURRENT_DATE,
    salary_ngn DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Terminated')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create 'suppliers' table (used in People)
CREATE TABLE IF NOT EXISTS suppliers (
    supplier_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100),
    phone_number VARCHAR(20),
    email VARCHAR(100),
    category VARCHAR(50) DEFAULT 'General',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create 'feed_purchases' table (used in Feed)
CREATE TABLE IF NOT EXISTS feed_purchases (
    purchase_id SERIAL PRIMARY KEY,
    inventory_id INTEGER REFERENCES feed_inventory(inventory_id),
    bag_size_kg DECIMAL(8,2),
    num_bags INTEGER,
    total_quantity_kg DECIMAL(10,2) NOT NULL,
    cost_per_bag DECIMAL(10,2),
    total_cost_ngn DECIMAL(12,2) NOT NULL,
    supplier VARCHAR(100),
    purchase_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Add indexes for new tables
CREATE INDEX IF NOT EXISTS idx_workers_status ON workers(status);
CREATE INDEX IF NOT EXISTS idx_suppliers_category ON suppliers(category);
CREATE INDEX IF NOT EXISTS idx_feed_purchases_date ON feed_purchases(purchase_date DESC);
