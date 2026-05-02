-- Add soft-delete columns to conversations table
ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS deleted_by_user  BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS deleted_by_admin BOOLEAN NOT NULL DEFAULT FALSE;
