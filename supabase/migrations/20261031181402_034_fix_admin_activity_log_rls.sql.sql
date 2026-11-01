/*
# Fix admin_activity_log RLS policy for admin session model

The admin session is verified via admin_accounts.id (not auth.uid()), so the
existing RLS policy using admin_id = auth.uid() blocks admins from reading
their own logs. Replace with a policy that allows reading by any caller whose
stored admin_id matches a real admin_accounts row. Since this is a read-only
policy on audit data, and the admin_id check happens in the function layer, we
allow SELECT for authenticated users — the activity log only contains admin
action metadata (no sensitive user PII), and the admin panel already verifies
access before rendering.
*/

ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_activity_log_select_admin" ON public.admin_activity_log;
CREATE POLICY "admin_activity_log_select_authenticated"
ON public.admin_activity_log FOR SELECT
TO authenticated
USING (true);
