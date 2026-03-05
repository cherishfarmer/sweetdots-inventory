-- Migration: Support Decimal Quantities
-- Run this in Neon SQL Editor to allow decimal values (e.g., 2.5, 0.5)

-- Update items table to use DECIMAL instead of INTEGER
ALTER TABLE items 
  ALTER COLUMN current_quantity TYPE DECIMAL(10, 1),
  ALTER COLUMN par_level TYPE DECIMAL(10, 1);

-- Update inventory_snapshots table
ALTER TABLE inventory_snapshots
  ALTER COLUMN quantity_at_submission TYPE DECIMAL(10, 1),
  ALTER COLUMN par_level TYPE DECIMAL(10, 1);

-- Verify the changes
SELECT 
  column_name, 
  data_type, 
  numeric_precision, 
  numeric_scale
FROM information_schema.columns
WHERE table_name IN ('items', 'inventory_snapshots')
  AND column_name IN ('current_quantity', 'par_level', 'quantity_at_submission')
ORDER BY table_name, column_name;
