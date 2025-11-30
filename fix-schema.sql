-- Fix the messages table to make conversation_id nullable
-- Run this in your Supabase SQL Editor

-- First, check if conversation_id column exists and make it nullable
ALTER TABLE messages 
ALTER COLUMN conversation_id DROP NOT NULL;

-- If the column doesn't exist, you can ignore the error above
-- The messages table should work without conversation_id for now

