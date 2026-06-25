-- =============================================
-- 005: Student messages & conversations
-- =============================================

-- Conversations between students and institutions
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE NOT NULL,
  last_message TEXT,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  student_unread INTEGER DEFAULT 0,
  institution_unread INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, institution_id)
);

-- Individual messages within a conversation
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('student', 'institution')),
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "conv_select" ON conversations FOR SELECT
  TO authenticated USING (
    student_id = auth.uid() OR 
    institution_id IN (SELECT id FROM institutions WHERE owner_id = auth.uid())
  );
CREATE POLICY "conv_insert" ON conversations FOR INSERT
  TO authenticated WITH CHECK (student_id = auth.uid());
CREATE POLICY "conv_update" ON conversations FOR UPDATE
  TO authenticated USING (
    student_id = auth.uid() OR 
    institution_id IN (SELECT id FROM institutions WHERE owner_id = auth.uid())
  );

-- RLS for messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "msg_select" ON messages FOR SELECT
  TO authenticated USING (
    conversation_id IN (
      SELECT id FROM conversations
      WHERE student_id = auth.uid() OR 
            institution_id IN (SELECT id FROM institutions WHERE owner_id = auth.uid())
    )
  );
CREATE POLICY "msg_insert" ON messages FOR INSERT
  TO authenticated WITH CHECK (sender_id = auth.uid());
CREATE POLICY "msg_update" ON messages FOR UPDATE
  TO authenticated USING (
    conversation_id IN (
      SELECT id FROM conversations
      WHERE student_id = auth.uid() OR 
            institution_id IN (SELECT id FROM institutions WHERE owner_id = auth.uid())
    )
  );

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
