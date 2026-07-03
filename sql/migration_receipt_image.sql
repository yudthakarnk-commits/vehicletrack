-- Migration: Photo Receipt — add receipt_image_url to expenses
-- Run this in Supabase SQL Editor

-- 1. Add column to expenses table
ALTER TABLE expenses
  ADD COLUMN IF NOT EXISTS receipt_image_url TEXT;

-- 2. Create Storage bucket for receipts (public read, authenticated write)
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage policy: authenticated users can upload
CREATE POLICY "auth_upload_receipts"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'receipts');

-- 4. Storage policy: anyone can view (public bucket)
CREATE POLICY "public_read_receipts"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'receipts');

-- 5. Storage policy: owner can delete their own file
CREATE POLICY "owner_delete_receipts"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);
