-- Migration: In-App Notifications
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS notifications (
  id         BIGSERIAL PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,   -- 'claim_submitted' | 'claim_approved' | 'claim_rejected'
  title      TEXT NOT NULL,
  message    TEXT,
  link_page  TEXT,            -- page name to navigate to e.g. 'travel-claim'
  link_tab   TEXT,            -- sub-tab e.g. 'approve' | 'mine'
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Each user sees only their own notifications
CREATE POLICY "user_see_own_notifs"
  ON notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "user_mark_read"
  ON notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- Any authenticated user can insert (system inserts on behalf of target user)
CREATE POLICY "any_insert_notif"
  ON notifications FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "user_delete_own_notif"
  ON notifications FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Index for fast unread count
CREATE INDEX IF NOT EXISTS idx_notif_user_read ON notifications(user_id, is_read);
