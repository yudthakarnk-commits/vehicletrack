-- ============================================================
--  Vehicle Expense System — Supabase Schema
--  Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ─── EXTENSIONS ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── CORE TABLES ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS departments (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL UNIQUE,
  code       TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vehicle_types (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expense_categories (
  id      SERIAL PRIMARY KEY,
  name    TEXT NOT NULL UNIQUE,
  name_en TEXT,
  icon    TEXT DEFAULT '💰',
  color   TEXT DEFAULT '#6c757d'
);

CREATE TABLE IF NOT EXISTS vehicles (
  id              SERIAL PRIMARY KEY,
  license_plate   TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  department_id   INTEGER NOT NULL REFERENCES departments(id),
  vehicle_type_id INTEGER NOT NULL REFERENCES vehicle_types(id),
  brand           TEXT,
  model           TEXT,
  year            INTEGER,
  fuel_type       TEXT DEFAULT 'gasoline',
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expenses (
  id                   SERIAL PRIMARY KEY,
  vehicle_id           INTEGER NOT NULL REFERENCES vehicles(id),
  category_id          INTEGER NOT NULL REFERENCES expense_categories(id),
  expense_date         DATE NOT NULL,
  amount               NUMERIC(12,2) NOT NULL,
  distance_km          NUMERIC(10,2),
  fuel_liters          NUMERIC(10,3),
  fuel_price_per_liter NUMERIC(8,3),
  odometer             INTEGER,
  description          TEXT,
  receipt_no           TEXT,
  created_by           UUID REFERENCES auth.users(id),
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW(),
  -- Offline sync fields
  client_id            TEXT UNIQUE,   -- client-generated UUID for deduplication
  is_deleted           BOOLEAN DEFAULT FALSE
);

-- ─── USER PROFILES ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT,
  role          TEXT NOT NULL DEFAULT 'user'
                  CHECK (role IN ('admin', 'manager', 'user')),
  department_id INTEGER REFERENCES departments(id),
  language      TEXT DEFAULT 'th' CHECK (language IN ('th', 'en')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- User → Vehicle assignments (for 'user' role)
CREATE TABLE IF NOT EXISTS user_vehicles (
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, vehicle_id)
);

-- ─── ACCESS LOGS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS access_logs (
  id         BIGSERIAL PRIMARY KEY,
  user_id    UUID REFERENCES auth.users(id),
  user_email TEXT,
  action     TEXT NOT NULL,  -- 'login','logout','add_expense','edit_expense','delete_expense','view_report'
  details    JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── OFFLINE SYNC QUEUE ───────────────────────────────────────
-- Tracks pending local changes to sync to server
CREATE TABLE IF NOT EXISTS sync_log (
  id          BIGSERIAL PRIMARY KEY,
  client_id   TEXT NOT NULL,
  table_name  TEXT NOT NULL,
  operation   TEXT NOT NULL,  -- INSERT, UPDATE, DELETE
  payload     JSONB,
  synced_at   TIMESTAMPTZ DEFAULT NOW(),
  user_id     UUID REFERENCES auth.users(id)
);

-- ─── DEFAULT SEED DATA ────────────────────────────────────────
INSERT INTO expense_categories (name, name_en, icon, color) VALUES
  ('ค่าน้ำมัน',             'Fuel',             '⛽', '#e67e22'),
  ('ค่าเซอร์วิสตามระยะ',    'Periodic Service', '🔧', '#3498db'),
  ('ค่าซ่อม',               'Repair',           '🔨', '#e74c3c'),
  ('ค่าเปลี่ยนยาง',         'Tire Replacement', '🛞', '#2ecc71'),
  ('ประกันภัย',             'Insurance',        '🛡️', '#9b59b6'),
  ('ค่าทางด่วน/ค่าผ่านทาง', 'Toll Fee',         '🛣️', '#1abc9c'),
  ('ค่าจอดรถ',              'Parking',          '🅿️', '#34495e'),
  ('พ.ร.บ. / ภาษีรถ',       'Road Tax / TaxVC', '📋', '#f39c12'),
  ('ค่าใช้จ่ายอื่นๆ',       'Other',            '📝', '#95a5a6')
ON CONFLICT (name) DO NOTHING;

INSERT INTO vehicle_types (name, description) VALUES
  ('รถยนต์ส่วนบุคคล', 'Passenger Car'),
  ('รถกระบะ',         'Pickup Truck'),
  ('รถตู้',           'Van'),
  ('รถบรรทุก',        'Truck'),
  ('รถจักรยานยนต์',   'Motorcycle'),
  ('รถพ่วง',          'Trailer')
ON CONFLICT (name) DO NOTHING;

-- ─── AUTO-CREATE USER PROFILE ON SIGNUP ──────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER expenses_updated_at BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────
ALTER TABLE departments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_types      ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses           ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_vehicles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs        ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT role FROM user_profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION get_my_department()
RETURNS INTEGER LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT department_id FROM user_profiles WHERE id = auth.uid();
$$;

-- DEPARTMENTS: all authenticated can read; only admin can write
CREATE POLICY "dept_read"   ON departments FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "dept_write"  ON departments FOR ALL    TO authenticated
  USING (get_my_role() = 'admin') WITH CHECK (get_my_role() = 'admin');

-- VEHICLE TYPES: same as departments
CREATE POLICY "vtype_read"  ON vehicle_types FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "vtype_write" ON vehicle_types FOR ALL    TO authenticated
  USING (get_my_role() = 'admin') WITH CHECK (get_my_role() = 'admin');

-- CATEGORIES: read-only for all
CREATE POLICY "cat_read"    ON expense_categories FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "cat_write"   ON expense_categories FOR ALL    TO authenticated
  USING (get_my_role() = 'admin') WITH CHECK (get_my_role() = 'admin');

-- VEHICLES: admin sees all; manager sees their dept; user sees assigned
CREATE POLICY "vehicle_select" ON vehicles FOR SELECT TO authenticated USING (
  get_my_role() = 'admin'
  OR (get_my_role() = 'manager' AND department_id = get_my_department())
  OR id IN (SELECT vehicle_id FROM user_vehicles WHERE user_id = auth.uid())
);
CREATE POLICY "vehicle_write" ON vehicles FOR ALL TO authenticated
  USING (get_my_role() IN ('admin', 'manager')) WITH CHECK (get_my_role() IN ('admin', 'manager'));

-- EXPENSES: admin sees all; manager sees dept; user sees own vehicles
CREATE POLICY "expense_select" ON expenses FOR SELECT TO authenticated USING (
  NOT is_deleted AND (
    get_my_role() = 'admin'
    OR (get_my_role() = 'manager'
        AND vehicle_id IN (SELECT id FROM vehicles WHERE department_id = get_my_department()))
    OR vehicle_id IN (SELECT vehicle_id FROM user_vehicles WHERE user_id = auth.uid())
  )
);
CREATE POLICY "expense_insert" ON expenses FOR INSERT TO authenticated
  WITH CHECK (
    get_my_role() = 'admin'
    OR (get_my_role() = 'manager'
        AND vehicle_id IN (SELECT id FROM vehicles WHERE department_id = get_my_department()))
    OR vehicle_id IN (SELECT vehicle_id FROM user_vehicles WHERE user_id = auth.uid())
  );
CREATE POLICY "expense_update" ON expenses FOR UPDATE TO authenticated
  USING (
    get_my_role() = 'admin'
    OR (get_my_role() = 'manager'
        AND vehicle_id IN (SELECT id FROM vehicles WHERE department_id = get_my_department()))
    OR created_by = auth.uid()
  );
CREATE POLICY "expense_delete" ON expenses FOR DELETE TO authenticated
  USING (get_my_role() = 'admin' OR created_by = auth.uid());

-- USER PROFILES: users see their own; admins see all
CREATE POLICY "profile_select" ON user_profiles FOR SELECT TO authenticated USING (
  id = auth.uid() OR get_my_role() = 'admin'
);
CREATE POLICY "profile_update" ON user_profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR get_my_role() = 'admin');
CREATE POLICY "profile_insert" ON user_profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid() OR get_my_role() = 'admin');

-- USER VEHICLES: admin + manager can manage; user sees own
CREATE POLICY "uv_select" ON user_vehicles FOR SELECT TO authenticated USING (
  user_id = auth.uid() OR get_my_role() IN ('admin', 'manager')
);
CREATE POLICY "uv_write" ON user_vehicles FOR ALL TO authenticated
  USING (get_my_role() IN ('admin', 'manager'))
  WITH CHECK (get_my_role() IN ('admin', 'manager'));

-- ACCESS LOGS: admin sees all; users see own
CREATE POLICY "log_select" ON access_logs FOR SELECT TO authenticated USING (
  user_id = auth.uid() OR get_my_role() = 'admin'
);
CREATE POLICY "log_insert" ON access_logs FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ─── INDEXES ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_expenses_date       ON expenses (expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_vehicle    ON expenses (vehicle_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category   ON expenses (category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_client_id  ON expenses (client_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_user    ON access_logs (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vehicles_dept       ON vehicles (department_id);

-- ─── REALTIME ─────────────────────────────────────────────────
-- Enable realtime for sync
ALTER PUBLICATION supabase_realtime ADD TABLE expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE vehicles;

-- ═══════════════════════════════════════════════════════════════
--  MIGRATION: Add name_en to vehicle_types (run if upgrading)
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE vehicle_types ADD COLUMN IF NOT EXISTS name_en TEXT;

UPDATE vehicle_types SET name_en = 'Personal Car'  WHERE name = 'รถยนต์ส่วนบุคคล';
UPDATE vehicle_types SET name_en = 'Pickup Truck'  WHERE name = 'รถกระบะ';
UPDATE vehicle_types SET name_en = 'Van / MPV'     WHERE name = 'รถตู้';
UPDATE vehicle_types SET name_en = 'Truck'         WHERE name = 'รถบรรทุก';
UPDATE vehicle_types SET name_en = 'Motorcycle'    WHERE name = 'รถจักรยานยนต์';
UPDATE vehicle_types SET name_en = 'Trailer'       WHERE name = 'รถพ่วง';
