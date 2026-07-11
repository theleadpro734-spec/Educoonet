/*
# Enable realtime on application_messages

1. Changes
- Adds the `application_messages` table to the `supabase_realtime` publication
- Enables INSERT events to be broadcast to subscribed clients
2. Security
- No RLS changes; existing policies remain in effect
3. Notes
- The table was created in migration 007 but never added to realtime
- This enables the MessagingView component to receive new messages instantly
*/

ALTER PUBLICATION supabase_realtime ADD TABLE application_messages;
