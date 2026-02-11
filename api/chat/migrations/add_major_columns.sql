-- Add major column to conversations and messages for chat API (multi-language support).
-- Run this once if you get "Failed to fetch conversations" or message errors.
-- Execute in phpMyAdmin or: mysql -u root -p your_database < add_major_columns.sql

-- conversations
ALTER TABLE `conversations`
  ADD COLUMN `major` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'english' AFTER `user2_id`;

-- messages
ALTER TABLE `messages`
  ADD COLUMN `major` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'english' AFTER `sender_id`;
