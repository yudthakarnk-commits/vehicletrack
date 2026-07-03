-- Migration: Approval Workflow for Travelling Claims
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS travel_claims (
  id            BIGSERIAL PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id    INTEGER REFERENCES vehicles(id),
  month         INTEGER NOT NULL,
  year          INTEGER NOT NULL,
  name          TEXT,
  emp_id        TEXT,
  position      TEXT,
  department    TEXT,
  company       TEXT,
  branch        TEXT,
  jg            TEXT,
  pca           TEXT,
  car_type      TEXT,
  claim_rate    NUMERIC DEFAULT 0.20,
  total_km      NUMERIC DEFAULT 0,
  total_amount  NUMERIC DEFAULT 0,
  claim_rows    JSONB,            -- array of daily trip rows
  status        TEXT NOT NULL DEFAULT 'submitted'
                CHECK (status IN ('submitted','approved','rejected')),
  submitted_at  TIMESTAMPTZ DEFAULT NOW(),
  reviewed_by   UUID REFERENCES auth.users(id),
  reviewed_at   TIMESTAMPTZ,
  reject_reason TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE travel_claims ENABLE ROW LEVEL SECURITY;

-- Users can insert their own claims
CREATE POLICY "user_insert_claim"
  ON travel_claims FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can view their own; managers/admins can view all
CREATE POLICY "select_travel_claims"
  ON travel_claims FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role IN ('manager','admin')
    )
  );

-- Managers/admins can update (approve/reject)
CREATE POLICY "manager_update_claim"
  ON travel_claims FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role IN ('manager','admin')
    )
  );

-- Users can delete their own submitted claims (withdraw before review)
CREATE POLICY "user_delete_own_claim"
  ON travel_claims FOR DELETE TO authenticated
  USING (user_id = auth.uid() AND status = 'submitted');
