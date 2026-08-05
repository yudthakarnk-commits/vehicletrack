-- ============================================================
-- Migration: Add extra fields to expenses table
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Expiry date (for Insurance, Road Tax/TaxVC)
ALTER TABLE expenses
  ADD COLUMN IF NOT EXISTS expiry_date DATE;

-- 2. Next service odometer (for Periodic Service, Tire Replacement)
ALTER TABLE expenses
  ADD COLUMN IF NOT EXISTS next_service_km INTEGER;

-- 3. Flexible extra data (policy number, insurer, workshop, tire brand, etc.)
ALTER TABLE expenses
  ADD COLUMN IF NOT EXISTS extra_data JSONB DEFAULT '{}'::jsonb;

-- 4. Index on expiry_date for fast upcoming-expiry queries
CREATE INDEX IF NOT EXISTS idx_expenses_expiry_date
  ON expenses (expiry_date)
  WHERE expiry_date IS NOT NULL AND is_deleted = FALSE;

-- ============================================================
-- Verify columns were added
-- ============================================================
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'expenses'
  AND column_name IN ('expiry_date', 'next_service_km', 'extra_data')
ORDER BY column_name;
