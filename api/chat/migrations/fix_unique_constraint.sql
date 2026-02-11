-- Fix unique constraint on conversations table to include major column
-- This allows multiple conversations between the same users for different languages
-- Run this once if you get "Duplicate entry" errors when creating conversations
-- Execute in phpMyAdmin or: mysql -u root -p your_database < fix_unique_constraint.sql

-- Drop the old unique constraint
ALTER TABLE `conversations`
  DROP INDEX `unique_conversation`;

-- Add new unique constraint that includes major
ALTER TABLE `conversations`
  ADD UNIQUE KEY `unique_conversation_major` (`user1_id`, `user2_id`, `major`);
