-- Chat System Database Structure
-- Supports text, voice, and image messages

-- Table: conversations
-- Stores chat conversations between users
CREATE TABLE IF NOT EXISTS `conversations` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user1_id` INT UNSIGNED NOT NULL COMMENT 'First user in conversation',
  `user2_id` INT UNSIGNED NOT NULL COMMENT 'Second user in conversation',
  `major` VARCHAR(50) NOT NULL DEFAULT 'english' COMMENT 'Major/language for this conversation',
  `last_message_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_conversation` (`user1_id`, `user2_id`, `major`),
  KEY `idx_user1` (`user1_id`),
  KEY `idx_user2` (`user2_id`),
  KEY `idx_major` (`major`),
  KEY `idx_last_message` (`last_message_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: messages
-- Stores individual messages in conversations
CREATE TABLE IF NOT EXISTS `messages` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `conversation_id` INT UNSIGNED NOT NULL,
  `sender_id` INT UNSIGNED NOT NULL,
  `major` VARCHAR(50) NOT NULL DEFAULT 'english' COMMENT 'Major/language for this message',
  `message_type` ENUM('text', 'voice', 'image') DEFAULT 'text',
  `message_text` TEXT DEFAULT NULL COMMENT 'For text messages',
  `file_path` VARCHAR(500) DEFAULT NULL COMMENT 'For voice and image messages',
  `file_size` BIGINT UNSIGNED DEFAULT NULL COMMENT 'File size in bytes',
  `is_read` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_conversation` (`conversation_id`),
  KEY `idx_sender` (`sender_id`),
  KEY `idx_major` (`major`),
  KEY `idx_created` (`created_at`),
  KEY `idx_read` (`is_read`),
  CONSTRAINT `fk_messages_conversation` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

