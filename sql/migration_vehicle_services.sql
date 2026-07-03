-- Migration: Vehicle Service Schedule
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS vehicle_services (
  id            BIGSERIAL PRIMARY KEY,
  vehicle_id    INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  service_type  TEXT NOT NULL DEFAULT 'other',
  last_date     DATE,
  next_date     DATE NOT NULL,
  next_km       INTEGER,
  notes         TEXT,
  reminder_days INTEGER NOT NULL DEFAULT 30,
  created_by    UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE vehicle_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_users_manage_services"
  ON vehicle_services
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);
