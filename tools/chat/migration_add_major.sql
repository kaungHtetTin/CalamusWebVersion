-- Migration: Add major column to conversations and messages tables
-- Run this migration to add major support to existing chat tables

-- Add major column to conversations table
ALTER TABLE `conversations` 
ADD COLUMN `major` VARCHAR(50) NOT NULL DEFAULT 'english' COMMENT 'Major/language for this conversation' AFTER `user2_id`;

-- Update unique constraint to include major
ALTER TABLE `conversations` 
DROP INDEX `unique_conversation`,
ADD UNIQUE KEY `unique_conversation` (`user1_id`, `user2_id`, `major`);

-- Add index for major
ALTER TABLE `conversations` 
ADD KEY `idx_major` (`major`);

-- Add major column to messages table
ALTER TABLE `messages` 
ADD COLUMN `major` VARCHAR(50) NOT NULL DEFAULT 'english' COMMENT 'Major/language for this message' AFTER `sender_id`;

-- Add index for major
ALTER TABLE `messages` 
ADD KEY `idx_major` (`major`);

-- Update existing messages to match their conversation's major
-- This assumes all existing conversations are for 'english' major
-- If you have different majors, you'll need to update this manually
UPDATE `messages` m
INNER JOIN `conversations` c ON m.conversation_id = c.id
SET m.major = c.major
WHERE m.major = 'english';

