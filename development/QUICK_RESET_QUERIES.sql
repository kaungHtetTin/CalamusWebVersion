-- ============================================
-- QUICK RESET QUERIES - Most Common Scenarios
-- ============================================

-- ============================================
-- SCENARIO 1: Reset ALL Cards (Most Common)
-- ============================================
-- Use this when you want to start fresh with all cards

START TRANSACTION;
DELETE FROM user_card_states;
DELETE FROM cards;
ALTER TABLE cards AUTO_INCREMENT = 1;
COMMIT;

-- OR (faster, but cannot rollback):
TRUNCATE TABLE user_card_states;
TRUNCATE TABLE cards;


-- ============================================
-- SCENARIO 2: Reset Only Korean Cards (language_id = 1)
-- ============================================
-- Use this when you only want to reset Korean words

START TRANSACTION;
DELETE ucs FROM user_card_states ucs
INNER JOIN cards c ON ucs.card_id = c.id
WHERE c.language_id = 1;
DELETE FROM cards WHERE language_id = 1;
COMMIT;


-- ============================================
-- SCENARIO 3: Reset Only English Cards (language_id = 2)
-- ============================================
-- Use this when you only want to reset English words

START TRANSACTION;
DELETE ucs FROM user_card_states ucs
INNER JOIN cards c ON ucs.card_id = c.id
WHERE c.language_id = 2;
DELETE FROM cards WHERE language_id = 2;
COMMIT;


-- ============================================
-- SCENARIO 4: Reset Cards for Specific Deck
-- ============================================
-- Use this when you want to reset cards in a specific deck
-- Replace 1 with your deck_id

START TRANSACTION;
DELETE ucs FROM user_card_states ucs
INNER JOIN cards c ON ucs.card_id = c.id
WHERE c.deck_id = 1;
DELETE FROM cards WHERE deck_id = 1;
COMMIT;


-- ============================================
-- SCENARIO 5: Just Reset Auto-Increment
-- ============================================
-- Use this if you only want to reset the ID counter

ALTER TABLE cards AUTO_INCREMENT = 1;

