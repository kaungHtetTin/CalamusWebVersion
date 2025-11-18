-- ============================================
-- SQL Queries to Reset Cards Table
-- ============================================
-- WARNING: These queries will DELETE data permanently!
-- Make sure to backup your database before running these queries.
-- ============================================

-- ============================================
-- OPTION 1: Delete All Cards (Safest - can rollback in transaction)
-- ============================================
-- This deletes all cards but keeps the table structure
-- You can rollback if needed

START TRANSACTION;

-- Delete related user card states first (if they exist)
DELETE FROM user_card_states;

-- Delete all cards
DELETE FROM cards;

-- Reset auto-increment counter
ALTER TABLE cards AUTO_INCREMENT = 1;

-- If everything looks good, commit:
COMMIT;

-- If something went wrong, rollback:
-- ROLLBACK;


-- ============================================
-- OPTION 2: Truncate Table (Fastest - cannot rollback)
-- ============================================
-- This is faster but cannot be rolled back
-- Also resets auto-increment automatically

-- WARNING: Truncate will fail if there are foreign key constraints
-- If you have foreign keys, use OPTION 1 or OPTION 3 instead

TRUNCATE TABLE cards;

-- If you also want to reset user_card_states:
TRUNCATE TABLE user_card_states;


-- ============================================
-- OPTION 3: Delete Cards by Language ID
-- ============================================
-- Use this if you only want to delete cards for a specific language
-- Example: Delete all Korean words (language_id = 1)

START TRANSACTION;

-- Delete user card states for cards of this language
DELETE ucs FROM user_card_states ucs
INNER JOIN cards c ON ucs.card_id = c.id
WHERE c.language_id = 1;  -- Change this to your language_id

-- Delete cards for this language
DELETE FROM cards WHERE language_id = 1;  -- Change this to your language_id

COMMIT;


-- ============================================
-- OPTION 4: Delete Cards by Deck ID
-- ============================================
-- Use this if you only want to delete cards for a specific deck
-- Example: Delete all cards in deck_id = 1

START TRANSACTION;

-- Delete user card states for cards in this deck
DELETE ucs FROM user_card_states ucs
INNER JOIN cards c ON ucs.card_id = c.id
WHERE c.deck_id = 1;  -- Change this to your deck_id

-- Delete cards in this deck
DELETE FROM cards WHERE deck_id = 1;  -- Change this to your deck_id

COMMIT;


-- ============================================
-- OPTION 5: Delete Cards by Language AND Deck
-- ============================================
-- Use this for more specific deletion
-- Example: Delete Korean words (language_id = 1) in deck_id = 1

START TRANSACTION;

-- Delete user card states
DELETE ucs FROM user_card_states ucs
INNER JOIN cards c ON ucs.card_id = c.id
WHERE c.language_id = 1 AND c.deck_id = 1;  -- Change these values

-- Delete cards
DELETE FROM cards WHERE language_id = 1 AND deck_id = 1;  -- Change these values

COMMIT;


-- ============================================
-- OPTION 6: Reset Auto-Increment Only
-- ============================================
-- Use this if you only want to reset the ID counter
-- without deleting data

-- Get the maximum ID currently in use
SELECT MAX(id) FROM cards;

-- Set auto-increment to start from a specific number
-- Replace 1 with the number you want to start from
ALTER TABLE cards AUTO_INCREMENT = 1;


-- ============================================
-- OPTION 7: Complete Reset (Drop and Recreate)
-- ============================================
-- WARNING: This will DELETE the entire table structure!
-- Only use if you want to completely recreate the table

-- First, check the current table structure
SHOW CREATE TABLE cards;

-- Drop the table (this deletes everything)
DROP TABLE IF EXISTS user_card_states;
DROP TABLE IF EXISTS cards;

-- Recreate the table (adjust structure as needed)
CREATE TABLE cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    word VARCHAR(255) NOT NULL,
    burmese_translation TEXT,
    example_sentences TEXT,
    language_id INT NOT NULL,
    deck_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_language_id (language_id),
    INDEX idx_deck_id (deck_id),
    INDEX idx_word (word)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Recreate user_card_states table if needed
CREATE TABLE user_card_states (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    card_id INT NOT NULL,
    rating INT DEFAULT 0,
    due_at INT DEFAULT NULL,
    paused_until INT DEFAULT NULL,
    suspended TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_card_id (card_id),
    UNIQUE KEY unique_user_card (user_id, card_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================
-- USEFUL QUERIES FOR CHECKING DATA
-- ============================================

-- Count total cards
SELECT COUNT(*) as total_cards FROM cards;

-- Count cards by language
SELECT language_id, COUNT(*) as count 
FROM cards 
GROUP BY language_id;

-- Count cards by deck
SELECT deck_id, COUNT(*) as count 
FROM cards 
GROUP BY deck_id;

-- Count cards by language and deck
SELECT language_id, deck_id, COUNT(*) as count 
FROM cards 
GROUP BY language_id, deck_id;

-- View sample cards
SELECT * FROM cards LIMIT 10;

-- Check if table exists and its structure
DESCRIBE cards;

-- Check table charset
SHOW TABLE STATUS WHERE Name = 'cards';


-- ============================================
-- BACKUP QUERIES (Run BEFORE resetting)
-- ============================================

-- Create a backup table with all current data
CREATE TABLE cards_backup AS SELECT * FROM cards;

-- Create backup of user_card_states
CREATE TABLE user_card_states_backup AS SELECT * FROM user_card_states;

-- Restore from backup (if needed)
-- INSERT INTO cards SELECT * FROM cards_backup;
-- INSERT INTO user_card_states SELECT * FROM user_card_states_backup;

