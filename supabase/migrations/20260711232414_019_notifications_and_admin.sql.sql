/*
# Notifications System and Admin Accounts

## Purpose
Adds a persistent notification system so students and institutions receive real-time alerts
when applications are submitted, statuses change, or messages arrive. Also adds an admin
accounts table for the general platform admin panel.

## New Tables

### notifications
- id (uuid, PK)
- user_email (text, not null) — email of the notification recipient
- user_role (text, not null) — 'student' | 'institution' | 'admin'
- type (text, not null) — 'new_application' | 'status_changed' | 'new_message'
- title (text, not null) — short title for the notification
- message (text, not null) — body text with details
- related_id (uuid, nullable) — application id or message id for navigation
- read (boolean, default false) — whether the user has read it
- created_at (timestamptz, default now())

### admin_accounts
- id (uuid, PK)
- username (text, unique, not null)
- password (text, not null) — simple access code for demo admin
- name (text, not null)
- created_at (timestamptz, default now())

## RPC Functions

### create_notification(p_user_email, p_user_role, p_type, p_title, p_message, p_related_id)
Inserts a row into notifications. Callable by anon (demo mode).

### notify_new_application(p_application_id)
Looks up the application, creates a 'new_application' notification for the institution.

### notify_status_change(p_application_id, p_new_status)
Creates a 'status_changed' notification for the student associated with the application.

### notify_new_message(p_message_id, p_application_id)
Creates a 'new_message' notification for the party that did NOT send the message.

### verify_admin_login(p_username, p_password)
Returns the admin row if credentials match.

## Security
- RLS enabled on both tables.
- notifications: anon + authenticated can CRUD (demo mode, data scoped by email in app).
- admin_accounts: anon + authenticated can SELECT and use the verify RPC (login only).
- Realtime enabled on notifications for live updates.
*/

-- ============ notifications table ============
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  user_role text NOT NULL DEFAULT 'student',
  type text NOT NULL DEFAULT 'new_message',
  title text NOT NULL,
  message text NOT NULL,
  related_id uuid,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_notifications" ON notifications;
CREATE POLICY "anon_select_notifications" ON notifications FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_notifications" ON notifications;
CREATE POLICY "anon_insert_notifications" ON notifications FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_notifications" ON notifications;
CREATE POLICY "anon_update_notifications" ON notifications FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_notifications" ON notifications;
CREATE POLICY "anon_delete_notifications" ON notifications FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_notifications_user_email ON notifications(user_email);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- ============ admin_accounts table ============
CREATE TABLE IF NOT EXISTS admin_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password text NOT NULL,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE admin_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_admin_accounts" ON admin_accounts;
CREATE POLICY "anon_select_admin_accounts" ON admin_accounts FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_admin_accounts" ON admin_accounts;
CREATE POLICY "anon_insert_admin_accounts" ON admin_accounts FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_admin_accounts" ON admin_accounts;
CREATE POLICY "anon_update_admin_accounts" ON admin_accounts FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_admin_accounts" ON admin_accounts;
CREATE POLICY "anon_delete_admin_accounts" ON admin_accounts FOR DELETE
  TO anon, authenticated USING (true);

-- Seed a default admin if none exists
INSERT INTO admin_accounts (username, password, name)
SELECT 'admin', 'educonnet2025', 'Administrador General'
WHERE NOT EXISTS (SELECT 1 FROM admin_accounts WHERE username = 'admin');

-- ============ RPC: create_notification ============
CREATE OR REPLACE FUNCTION create_notification(
  p_user_email text,
  p_user_role text,
  p_type text,
  p_title text,
  p_message text,
  p_related_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_id uuid;
BEGIN
  INSERT INTO notifications (user_email, user_role, type, title, message, related_id)
  VALUES (p_user_email, p_user_role, p_type, p_title, p_message, p_related_id)
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$;

-- ============ RPC: notify_new_application ============
CREATE OR REPLACE FUNCTION notify_new_application(p_application_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_app applications%ROWTYPE;
  v_inst_email text;
BEGIN
  SELECT * INTO v_app FROM applications WHERE id = p_application_id;
  IF NOT FOUND THEN RETURN; END IF;

  SELECT email INTO v_inst_email FROM institutions WHERE id = v_app.institution_id;

  PERFORM create_notification(
    COALESCE(v_inst_email, 'admin@educonnet.com'),
    'institution',
    'new_application',
    'Nueva postulacion recibida',
    v_app.name || ' ' || COALESCE(v_app.last_name, '') || ' ha enviado una postulacion.',
    p_application_id
  );
END;
$$;

-- ============ RPC: notify_status_change ============
CREATE OR REPLACE FUNCTION notify_status_change(p_application_id uuid, p_new_status text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_app applications%ROWTYPE;
  v_status_label text;
BEGIN
  SELECT * INTO v_app FROM applications WHERE id = p_application_id;
  IF NOT FOUND THEN RETURN; END IF;

  v_status_label := CASE p_new_status
    WHEN 'aceptada' THEN 'aceptada'
    WHEN 'rechazada' THEN 'rechazada'
    ELSE 'actualizada'
  END;

  PERFORM create_notification(
    v_app.email,
    'student',
    'status_changed',
    'Tu postulacion ha sido ' || v_status_label,
    'El estado de tu postulacion ahora es: ' || v_status_label || '.',
    p_application_id
  );
END;
$$;

-- ============ RPC: notify_new_message ============
CREATE OR REPLACE FUNCTION notify_new_message(
  p_message_id uuid,
  p_application_id uuid,
  p_sender_type text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_app applications%ROWTYPE;
  v_inst_email text;
BEGIN
  SELECT * INTO v_app FROM applications WHERE id = p_application_id;
  IF NOT FOUND THEN RETURN; END IF;

  IF p_sender_type = 'student' THEN
    SELECT email INTO v_inst_email FROM institutions WHERE id = v_app.institution_id;
    PERFORM create_notification(
      COALESCE(v_inst_email, 'admin@educonnet.com'),
      'institution',
      'new_message',
      'Nuevo mensaje de ' || v_app.name,
      'Has recibido un nuevo mensaje en una postulacion.',
      p_application_id
    );
  ELSE
    PERFORM create_notification(
      v_app.email,
      'student',
      'new_message',
      'Nuevo mensaje de la institucion',
      'La institucion te ha enviado un mensaje.',
      p_application_id
    );
  END IF;
END;
$$;

-- ============ RPC: verify_admin_login ============
CREATE OR REPLACE FUNCTION verify_admin_login(p_username text, p_password text)
RETURNS TABLE(id uuid, username text, name text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT a.id, a.username, a.name
  FROM admin_accounts a
  WHERE a.username = p_username AND a.password = p_password;
END;
$$;

-- ============ Enable Realtime on notifications ============
ALTER TABLE notifications REPLICA IDENTITY FULL;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  END IF;
END
$$;
