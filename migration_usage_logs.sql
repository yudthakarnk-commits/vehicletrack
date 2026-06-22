-- ============================================================
--  Migration: Vehicle Usage Logs
--  รัน SQL นี้ใน Supabase SQL Editor
-- ============================================================

-- 1. สร้างตาราง vehicle_usage_logs
CREATE TABLE IF NOT EXISTS vehicle_usage_logs (
  id              BIGSERIAL PRIMARY KEY,
  date            DATE NOT NULL,
  vehicle_id      BIGINT REFERENCES vehicles(id) ON DELETE CASCADE,
  user_id         UUID,
  driver_name     TEXT NOT NULL,
  origin          TEXT,
  destination     TEXT,
  purpose         TEXT,
  odometer_start  NUMERIC(10,1),
  odometer_end    NUMERIC(10,1),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE vehicle_usage_logs ENABLE ROW LEVEL SECURITY;

-- 3. Policy: ผู้ใช้ที่ login แล้วจัดการข้อมูลได้
CREATE POLICY "auth_users_manage_usage_logs"
  ON vehicle_usage_logs
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ตรวจสอบว่า user_vehicles มีอยู่แล้ว (ถ้ายังไม่มีให้สร้าง)
CREATE TABLE IF NOT EXISTS user_vehicles (
  user_id     UUID NOT NULL,
  vehicle_id  BIGINT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, vehicle_id)
);

ALTER TABLE user_vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_users_read_user_vehicles"
  ON user_vehicles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "admin_manage_user_vehicles"
  ON user_vehicles
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
