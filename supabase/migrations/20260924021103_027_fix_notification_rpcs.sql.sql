/*
# Fix notification RPCs to use owner_id instead of email lookup

## Problem
notify_new_application uses institution.email to find the user_id in auth.users,
but the institution email doesn't match the auth user email.
So notifications never reach the institution user.

## Fix
Use institutions.owner_id directly as the user_id for institution notifications.
For student notifications, keep the email-based lookup but fall back to the
application's user_id if no auth user is found.
*/

-- First drop the existing create_notification to avoid parameter default conflicts
DROP FUNCTION IF EXISTS create_notification(text, text, text, text, text, uuid);

CREATE OR REPLACE FUNCTION create_notification(
  p_user_email text,
  p_user_role text,
  p_type text,
  p_title text,
  p_message text,
  p_related_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id uuid;
  v_user_id uuid;
  v_email text;
BEGIN
  -- Try to interpret p_user_email as a uuid (owner_id)
  BEGIN
    v_user_id := p_user_email::uuid;
    SELECT email INTO v_email FROM auth.users WHERE id = v_user_id LIMIT 1;
    v_email := COALESCE(v_email, p_user_email);
  EXCEPTION WHEN invalid_text_representation THEN
    -- Not a uuid, treat as email
    v_email := p_user_email;
    SELECT id INTO v_user_id FROM auth.users WHERE email = p_user_email LIMIT 1;
  END;

  INSERT INTO notifications (user_email, user_role, type, title, message, related_id, user_id)
  VALUES (v_email, p_user_role, p_type, p_title, p_message, p_related_id, COALESCE(v_user_id, auth.uid()))
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;

CREATE OR REPLACE FUNCTION notify_new_application(p_application_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_app applications%ROWTYPE;
  v_owner_id uuid;
BEGIN
  SELECT * INTO v_app FROM applications WHERE id = p_application_id;
  IF NOT FOUND THEN RETURN; END IF;

  SELECT owner_id INTO v_owner_id FROM institutions WHERE id = v_app.institution_id;

  PERFORM create_notification(
    COALESCE(v_owner_id::text, ''),
    'institution',
    'new_application',
    'Nueva postulacion recibida',
    v_app.name || ' ' || COALESCE(v_app.last_name, '') || ' ha enviado una postulacion.',
    p_application_id
  );
END;
$$;

CREATE OR REPLACE FUNCTION notify_new_message(
  p_message_id uuid,
  p_application_id uuid,
  p_sender_type text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_app applications%ROWTYPE;
  v_owner_id uuid;
BEGIN
  SELECT * INTO v_app FROM applications WHERE id = p_application_id;
  IF NOT FOUND THEN RETURN; END IF;

  IF p_sender_type = 'student' THEN
    SELECT owner_id INTO v_owner_id FROM institutions WHERE id = v_app.institution_id;
    PERFORM create_notification(
      COALESCE(v_owner_id::text, ''),
      'institution',
      'new_message',
      'Nuevo mensaje de ' || v_app.name,
      'Has recibido un nuevo mensaje en una postulacion.',
      p_application_id
    );
  ELSE
    PERFORM create_notification(
      COALESCE(v_app.user_id::text, v_app.email),
      'student',
      'new_message',
      'Nuevo mensaje de la institucion',
      'La institucion te ha enviado un mensaje.',
      p_application_id
    );
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION notify_status_change(
  p_application_id uuid,
  p_new_status text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_app applications%ROWTYPE;
  v_status_text text;
BEGIN
  SELECT * INTO v_app FROM applications WHERE id = p_application_id;
  IF NOT FOUND THEN RETURN; END IF;

  v_status_text := CASE p_new_status
    WHEN 'aceptada' THEN 'aceptada'
    WHEN 'rechazada' THEN 'rechazada'
    ELSE 'actualizada'
  END;

  PERFORM create_notification(
    COALESCE(v_app.user_id::text, v_app.email),
    'student',
    'status_changed',
    'Tu postulacion ha sido ' || v_status_text,
    'El estado de tu postulacion ha cambiado a: ' || p_new_status,
    p_application_id
  );
END;
$$;
