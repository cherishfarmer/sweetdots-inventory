-- Migration: Allow Multiple Submissions Per Day/Shift
-- Run this in Neon SQL Editor to allow multiple morning/night submissions

-- Drop the unique constraint
ALTER TABLE inventory_submissions 
DROP CONSTRAINT IF EXISTS inventory_submissions_submission_date_submission_type_key;

-- Verify it worked
SELECT COUNT(*) as total_submissions FROM inventory_submissions;
