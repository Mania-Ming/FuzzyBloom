-- =============================================
-- MESSAGES TABLE + ORDER_ID MIGRATION
-- Run this in your Supabase SQL Editor
-- =============================================

-- Create messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS messages (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id   uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id  uuid REFERENCES products(id) ON DELETE SET NULL,
  order_id    uuid REFERENCES orders(id) ON DELETE SET NULL,
  message     text NOT NULL,
  reply       text,
  is_read     boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

-- Add order_id column if messages table already exists
ALTER TABLE messages ADD COLUMN IF NOT EXISTS order_id uuid REFERENCES orders(id) ON DELETE SET NULL;

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_order_id  ON messages(order_id);

-- RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users can insert their own messages
DROP POLICY IF EXISTS "Users can insert own messages" ON messages;
CREATE POLICY "Users can insert own messages"
  ON messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- Users can read their own messages
DROP POLICY IF EXISTS "Users can read own messages" ON messages;
CREATE POLICY "Users can read own messages"
  ON messages FOR SELECT TO authenticated
  USING (auth.uid() = sender_id);

-- Admin can read all messages
DROP POLICY IF EXISTS "Admin can read all messages" ON messages;
CREATE POLICY "Admin can read all messages"
  ON messages FOR SELECT TO authenticated
  USING (true);

-- Admin can update messages (for replies)
DROP POLICY IF EXISTS "Admin can update messages" ON messages;
CREATE POLICY "Admin can update messages"
  ON messages FOR UPDATE TO authenticated
  USING (true);

-- Admin can delete messages
DROP POLICY IF EXISTS "Admin can delete messages" ON messages;
CREATE POLICY "Admin can delete messages"
  ON messages FOR DELETE TO authenticated
  USING (true);
