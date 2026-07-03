-- Migration: Add avatar_color column to user_profiles
-- Run this in the Supabase SQL Editor

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS avatar_color TEXT;
