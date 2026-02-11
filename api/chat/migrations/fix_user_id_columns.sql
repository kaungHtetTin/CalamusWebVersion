-- Fix user_id columns in conversations and messages tables to support large phone numbers
-- The original INT(10) UNSIGNED can only hold values up to 4,294,967,295
-- Phone numbers like 9677164967 exceed this limit, so we need BIGINT(20) UNSIGNED
-- Run this once if you get "Failed to create conversation" errors with large user IDs
-- Execute in phpMyAdmin or: mysql -u root -p your_database < fix_user_id_columns.sql

-- conversations table
ALTER TABLE `conversations`
  MODIFY COLUMN `user1_id` BIGINT(20) UNSIGNED NOT NULL COMMENT 'First user in conversation',
  MODIFY COLUMN `user2_id` BIGINT(20) UNSIGNED NOT NULL COMMENT 'Second user in conversation';

-- messages table
ALTER TABLE `messages`
  MODIFY COLUMN `sender_id` BIGINT(20) UNSIGNED NOT NULL;
