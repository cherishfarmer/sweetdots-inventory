-- Sweet Dots Café Inventory Management System
-- Database Schema for PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('employee', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Items table
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    par_level INTEGER NOT NULL DEFAULT 0,
    current_quantity INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, category_id)
);

-- Inventory submissions table
CREATE TABLE inventory_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_type VARCHAR(20) NOT NULL CHECK (submission_type IN ('morning', 'night')),
    submitted_by UUID NOT NULL REFERENCES users(id),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submission_date DATE NOT NULL,
    notes TEXT,
    supplies_received BOOLEAN DEFAULT FALSE,
    supplies_note TEXT,
    employee_name VARCHAR(255) NOT NULL,
    UNIQUE(submission_date, submission_type)
);

-- Inventory snapshots table (immutable records)
CREATE TABLE inventory_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES inventory_submissions(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES items(id),
    item_name VARCHAR(255) NOT NULL,
    category_name VARCHAR(255) NOT NULL,
    quantity_at_submission INTEGER NOT NULL,
    par_level INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_items_category ON items(category_id);
CREATE INDEX idx_submissions_date ON inventory_submissions(submission_date DESC);
CREATE INDEX idx_submissions_type ON inventory_submissions(submission_type);
CREATE INDEX idx_snapshots_submission ON inventory_snapshots(submission_id);
CREATE INDEX idx_snapshots_item ON inventory_snapshots(item_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed data for initial setup
-- Default admin user (password: admin123 - CHANGE IN PRODUCTION!)
-- Password hash generated with bcrypt
INSERT INTO users (name, email, password_hash, role) VALUES 
('Admin', 'admin@sweetdots.com', '$2b$10$rKJ5FYhXGZQVqPNVYjCw7.xYvP0YYqVWHZJH8qI2kZQz3YvL5YLGq', 'admin');

-- Default categories
INSERT INTO categories (name, sort_order) VALUES 
('Coffee & Espresso', 1),
('Milk & Dairy', 2),
('Syrups & Flavors', 3),
('Baked Goods', 4),
('Cups & Lids', 5),
('Cleaning Supplies', 6);

-- Sample items
INSERT INTO items (name, category_id, par_level, current_quantity, sort_order) VALUES 
-- Coffee & Espresso
('Espresso Beans (lb)', (SELECT id FROM categories WHERE name = 'Coffee & Espresso'), 10, 8, 1),
('Decaf Beans (lb)', (SELECT id FROM categories WHERE name = 'Coffee & Espresso'), 5, 3, 2),
('Cold Brew Concentrate (gal)', (SELECT id FROM categories WHERE name = 'Coffee & Espresso'), 3, 2, 3),

-- Milk & Dairy
('Whole Milk (gal)', (SELECT id FROM categories WHERE name = 'Milk & Dairy'), 15, 12, 1),
('Oat Milk (qt)', (SELECT id FROM categories WHERE name = 'Milk & Dairy'), 20, 18, 2),
('Almond Milk (qt)', (SELECT id FROM categories WHERE name = 'Milk & Dairy'), 10, 7, 3),
('Heavy Cream (qt)', (SELECT id FROM categories WHERE name = 'Milk & Dairy'), 8, 6, 4),

-- Syrups & Flavors
('Vanilla Syrup', (SELECT id FROM categories WHERE name = 'Syrups & Flavors'), 4, 3, 1),
('Caramel Syrup', (SELECT id FROM categories WHERE name = 'Syrups & Flavors'), 4, 2, 2),
('Hazelnut Syrup', (SELECT id FROM categories WHERE name = 'Syrups & Flavors'), 3, 1, 3),

-- Baked Goods
('Croissants (dozen)', (SELECT id FROM categories WHERE name = 'Baked Goods'), 5, 4, 1),
('Muffins (dozen)', (SELECT id FROM categories WHERE name = 'Baked Goods'), 4, 3, 2),
('Cookies (dozen)', (SELECT id FROM categories WHERE name = 'Baked Goods'), 6, 5, 3),

-- Cups & Lids
('12oz Cups (sleeve)', (SELECT id FROM categories WHERE name = 'Cups & Lids'), 10, 8, 1),
('16oz Cups (sleeve)', (SELECT id FROM categories WHERE name = 'Cups & Lids'), 15, 12, 2),
('Lids (sleeve)', (SELECT id FROM categories WHERE name = 'Cups & Lids'), 20, 16, 3),

-- Cleaning Supplies
('Sanitizer (bottle)', (SELECT id FROM categories WHERE name = 'Cleaning Supplies'), 5, 4, 1),
('Dish Soap (bottle)', (SELECT id FROM categories WHERE name = 'Cleaning Supplies'), 3, 2, 2),
('Paper Towels (roll)', (SELECT id FROM categories WHERE name = 'Cleaning Supplies'), 12, 10, 3);
