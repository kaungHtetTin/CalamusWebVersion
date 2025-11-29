<?php

/**
 * Learning Flow API Class
 * Standalone PHP class for handling learning flow operations
 * Uses Database class from connect.php for database operations
 */
class LearningFlow {
    
    private $db;
    
    public function __construct() {
        require_once __DIR__ . '/connect.php';
        $this->db = new Database();
    }
    
    /**
     * Get cards for Step 1 (Learn New Words)
     * Returns recall words (priority) + new words up to wordCount
     * 
     * @param int $userId User ID
     * @param int $wordCount Number of words requested (default: 10)
     * @param int $languageId Language ID (required)
     * @param int $deckId Deck ID (required)
     * @return string JSON response
     */
    public function getLearningCards($userId, $wordCount = 10, $languageId, $deckId) {
        try {
            // Validate inputs
            if (empty($userId) || empty($languageId) || empty($deckId)) {
                return $this->errorResponse('Missing required parameters: user_id, language_id, deck_id');
            }
            
            // Get current learning day
            $learningDayNumber = $this->getCurrentLearningDay($userId, $languageId, $deckId);
            $learningDayWordCount = $this->getWordCountForLearningDay($learningDayNumber);
            
            // Use smaller of requested or learning day limit
            $actualWordCount = min($wordCount, $learningDayWordCount);
            
            // Get recall words (due for review)
            $recallWords = $this->getRecallWords($userId, $languageId, $deckId, $learningDayNumber);
            
            // Get new words (not learned yet)
            $skippedCardIds = $this->getSkippedCardIds($userId, $languageId);
            
            $newWords = $this->getNewWords($userId, $languageId, $deckId, $skippedCardIds, $recallWords);
            
            // Combine words with priority: all recall words first, then new words
            $allWords = [];
            
            // Add all recall words first (priority)
            foreach ($recallWords as $word) {
                $allWords[] = [
                    'card' => $word,
                    'rich_data' => $this->getRichWordData($word),
                    'word_type' => 'recall',
                    'is_known' => false
                ];
            }
            
            // Add new words to fill remaining slots
            $remainingSlots = max(0, $actualWordCount - count($recallWords));
            $newWordsToAdd = array_slice($newWords, 0, $remainingSlots);
            
            foreach ($newWordsToAdd as $word) {
                $allWords[] = [
                    'card' => $word,
                    'rich_data' => $this->getRichWordData($word),
                    'word_type' => 'new',
                    'is_known' => false
                ];
            }
            
            return $this->successResponse([
                'words' => $allWords,
                'step' => 'step1',
                'next_step' => 'step2',
                'learning_day_number' => $learningDayNumber,
                'deck_id' => $deckId,
                'word_counts' => [
                    'total' => count($allWords),
                    'recall_words' => count($recallWords),
                    'new_words' => count($newWordsToAdd),
                    'requested_count' => $wordCount,
                    'learning_day_limit' => $learningDayWordCount,
                    'actual_limit' => $actualWordCount
                ],
                'filters' => [
                    'language_id' => $languageId,
                    'deck_id' => $deckId,
                    'excluded_skipped_words' => count($skippedCardIds)
                ]
            ], 'Step 1: Learn New Words session started');
            
        } catch (Exception $e) {
            return $this->errorResponse('Failed to start learning session: ' . $e->getMessage());
        }
    }
    
    /**
     * Skip a word that user already knows
     * Records the skip, pauses the card permanently, and returns a replacement word
     * 
     * @param int $userId User ID
     * @param int $cardId Card ID to skip
     * @param int $languageId Language ID
     * @param int $deckId Deck ID
     * @param string $reason Reason for skipping (e.g., 'already_know')
     * @param array $sessionCardIds Optional array of card IDs currently in session
     * @return string JSON response
     */
    public function skipWord($userId, $cardId, $languageId, $deckId, $reason = 'already_know', $sessionCardIds = []) {
        try {
            // Validate inputs
            if (empty($userId) || empty($cardId) || empty($languageId) || empty($deckId)) {
                return $this->errorResponse('Missing required parameters');
            }
            
            // 1. Record the skip
            $skipQuery = "INSERT INTO user_word_skips (user_id, card_id, language_id, reason, skipped_at) 
                         VALUES ($userId, $cardId, $languageId, '" . $this->db->connect()->real_escape_string($reason) . "', NOW())";
            if (!$this->db->save($skipQuery)) {
                return $this->errorResponse('Failed to record word skip');
            }
            
            // 2. Pause the card permanently (never show again)
            $pauseQuery = "INSERT INTO user_card_states (user_id, card_id, ef, interval_, repetitions, due_at, suspended, paused_until) 
                          VALUES ($userId, $cardId, 2.5, 0, 0, 999999, 0, 999999)
                          ON DUPLICATE KEY UPDATE paused_until = 999999";
            if (!$this->db->save($pauseQuery)) {
                return $this->errorResponse('Failed to pause card');
            }
            
            // 3. Get replacement word
            $replacementWord = $this->getReplacementWord($userId, $languageId, $deckId, $sessionCardIds);
            
            return $this->successResponse([
                'replacement_word' => $replacementWord,
                'skipped_word' => [
                    'card_id' => $cardId,
                    'paused_until' => 'permanent'
                ]
            ], 'Word skipped and replaced successfully');
            
        } catch (Exception $e) {
            return $this->errorResponse('Failed to skip word: ' . $e->getMessage());
        }
    }
    
    /**
     * Rate a word using SuperMemo 2 algorithm
     * Updates SM2 parameters (ef, interval, repetitions, due_at)
     * 
     * @param int $userId User ID
     * @param int $cardId Card ID
     * @param int $quality Quality rating (0-5)
     * @return string JSON response
     */
    public function rateWordWithSM2($userId, $cardId, $quality) {
        try {
            // Validate inputs
            if (empty($userId) || empty($cardId)) {
                return $this->errorResponse('Missing required parameters: user_id, card_id');
            }
            
            if ($quality < 0 || $quality > 5) {
                return $this->errorResponse('Quality must be between 0 and 5');
            }
            
            // Get card info
            $cardQuery = "SELECT * FROM cards WHERE id = $cardId";
            $cardResult = $this->db->read($cardQuery);
            if (empty($cardResult)) {
                return $this->errorResponse('Card not found');
            }
            $card = $cardResult[0];
            
            // Get current learning day
            $learningDayNumber = $this->getCurrentLearningDay($userId, $card['language_id'], $card['deck_id']);
            
            // Get or create user card state
            $stateQuery = "SELECT * FROM user_card_states WHERE user_id = $userId AND card_id = $cardId";
            $stateResult = $this->db->read($stateQuery);
            
            if (empty($stateResult)) {
                // Create new state
                $ef = 2.5;
                $interval = 0;
                $repetitions = 0;
            } else {
                $state = $stateResult[0];
                $ef = (float)$state['ef'];
                $interval = (int)$state['interval_'];
                $repetitions = (int)$state['repetitions'];
            }
            
            // Store state before update
            $efBefore = $ef;
            $intervalBefore = $interval;
            $repetitionsBefore = $repetitions;
            
            // Apply SuperMemo 2 algorithm
            $result = $this->calculateSM2($ef, $interval, $repetitions, $quality, $learningDayNumber);
            
            // Update user card state
            $updateQuery = "INSERT INTO user_card_states (user_id, card_id, ef, interval_, repetitions, due_at, suspended, paused_until) 
                          VALUES ($userId, $cardId, {$result['ef']}, {$result['interval']}, {$result['repetitions']}, {$result['due_at']}, 0, NULL)
                          ON DUPLICATE KEY UPDATE 
                          ef = {$result['ef']}, 
                          interval_ = {$result['interval']}, 
                          repetitions = {$result['repetitions']}, 
                          due_at = {$result['due_at']}";
            
            if (!$this->db->save($updateQuery)) {
                return $this->errorResponse('Failed to update card state'. $updateQuery);
            }
            
            return $this->successResponse([
                'card_id' => $cardId,
                'quality' => $quality,
                'sm2_result' => [
                    'ef' => $result['ef'],
                    'interval' => $result['interval'],
                    'repetitions' => $result['repetitions'],
                    'next_review_learning_day' => $result['due_at'],
                    'current_learning_day' => $learningDayNumber
                ],
                'before' => [
                    'ef' => $efBefore,
                    'interval' => $intervalBefore,
                    'repetitions' => $repetitionsBefore
                ]
            ], 'SM2 quality score processed successfully');
            
        } catch (Exception $e) {
            return $this->errorResponse('Failed to process SM2 rating: ' . $e->getMessage());
        }
    }
    
    // ==================== PRIVATE HELPER METHODS ====================
    
    /**
     * Get current learning day for user, language, and deck
     * Handles consecutive learning logic and gap detection
     */
    private function getCurrentLearningDay($userId, $languageId, $deckId) {
        // Get or create learning progress
        $progressQuery = "SELECT * FROM user_learning_progress 
                         WHERE user_id = $userId AND language_id = $languageId AND deck_id = $deckId";
        $progressResult = $this->db->read($progressQuery);
        
        $today = date('Y-m-d');
        $yesterday = date('Y-m-d', strtotime('-1 day'));
        
        if (empty($progressResult)) {
            // Create new progress
            $createQuery = "INSERT INTO user_learning_progress (user_id, language_id, deck_id, current_learning_day, last_session_date, total_learning_days, streak_count, longest_streak) 
                           VALUES ($userId, $languageId, $deckId, 1, '$today', 1, 1, 1)";
            $this->db->save($createQuery);
            return 1;
        }
        
        $progress = $progressResult[0];
        $lastSessionDate = $progress['last_session_date'];
        $currentLearningDay = (int)$progress['current_learning_day'];
        $totalLearningDays = (int)$progress['total_learning_days'];
        $streakCount = (int)$progress['streak_count'];
        $longestStreak = (int)$progress['longest_streak'];
        
        // Check if consecutive (learned yesterday)
        $isConsecutive = ($lastSessionDate === $yesterday);
        
        if ($isConsecutive) {
            // Consecutive learning - advance learning day
            $newLearningDay = $currentLearningDay + 1;
            $newTotalDays = $totalLearningDays + 1;
            $newStreak = $streakCount + 1;
            $newLongestStreak = max($longestStreak, $newStreak);
            
            $updateQuery = "UPDATE user_learning_progress 
                           SET current_learning_day = $newLearningDay, 
                               last_session_date = '$today', 
                               total_learning_days = $newTotalDays, 
                               streak_count = $newStreak, 
                               longest_streak = $newLongestStreak
                           WHERE user_id = $userId AND language_id = $languageId AND deck_id = $deckId";
            $this->db->save($updateQuery);
            
            return $newLearningDay;
        } else {
            // Gap in learning - don't advance learning day, reset streak
            $updateQuery = "UPDATE user_learning_progress 
                           SET last_session_date = '$today', 
                               streak_count = 1
                           WHERE user_id = $userId AND language_id = $languageId AND deck_id = $deckId";
            $this->db->save($updateQuery);
            
            return $currentLearningDay;
        }
    }
    
    /**
     * Calculate word count based on learning day
     */
    private function getWordCountForLearningDay($learningDay) {
        if ($learningDay <= 4) {
            return $learningDay * 5; // 5, 10, 15, 20
        }
        return 20; // From day 5 onwards: 20 words
    }
    
    /**
     * Get recall words (due for review)
     */
    private function getRecallWords($userId, $languageId, $deckId, $learningDayNumber) {
        $query = "SELECT c.*, d.title as deck_title, l.name as language_name
                  FROM cards c
                  LEFT JOIN decks d ON c.deck_id = d.id
                  LEFT JOIN languages l ON c.language_id = l.id
                  INNER JOIN user_card_states ucs ON c.id = ucs.card_id
                  WHERE ucs.user_id = $userId
                    AND c.language_id = $languageId
                    AND c.deck_id = $deckId
                    AND ucs.suspended = 0
                    AND (ucs.due_at IS NULL OR ucs.due_at <= $learningDayNumber)
                    AND (ucs.paused_until IS NULL OR ucs.paused_until <= $learningDayNumber)
                  ORDER BY c.deck_id ASC";
        
        $result = $this->db->read($query);
        return $result ? $result : [];
    }
    
    /**
     * Get new words (not learned yet)
     */
    private function getNewWords($userId, $languageId, $deckId, $skippedCardIds, $recallWords) {
        $recallCardIds = array_column($recallWords, 'id');
        $excludeIds = array_merge($skippedCardIds, $recallCardIds);
        $excludeIdsStr = !empty($excludeIds) ? implode(',', array_map('intval', $excludeIds)) : '0';
        
        $query = "SELECT c.*, d.title as deck_title, l.name as language_name
                  FROM cards c
                  LEFT JOIN decks d ON c.deck_id = d.id
                  LEFT JOIN languages l ON c.language_id = l.id
                  WHERE c.language_id = $languageId
                    AND c.deck_id = $deckId
                    AND c.id NOT IN ($excludeIdsStr)
                    AND c.id NOT IN (SELECT card_id FROM user_card_states WHERE user_id = $userId)
                  ORDER BY RAND()";
        
        $result = $this->db->read($query);
        return $result ? $result : [];
    }
    
    /**
     * Get skipped card IDs for user and language
     */
    private function getSkippedCardIds($userId, $languageId) {
        $query = "SELECT card_id FROM user_word_skips WHERE user_id = $userId AND language_id = $languageId";
        $result = $this->db->read($query);
        return $result ? array_column($result, 'card_id') : [];
    }
    
    /**
     * Get replacement word for skipped word
     */
    private function getReplacementWord($userId, $languageId, $deckId, $excludeCardIds = []) {
        $skippedCardIds = $this->getSkippedCardIds($userId, $languageId);
        $excludeIds = array_unique(array_merge($skippedCardIds, $excludeCardIds));
        $excludeIdsStr = !empty($excludeIds) ? implode(',', array_map('intval', $excludeIds)) : '0';
        
        $query = "SELECT c.*, d.title as deck_title, l.name as language_name
                  FROM cards c
                  LEFT JOIN decks d ON c.deck_id = d.id
                  LEFT JOIN languages l ON c.language_id = l.id
                  WHERE c.language_id = $languageId
                    AND c.deck_id = $deckId
                    AND c.id NOT IN ($excludeIdsStr)
                    AND c.id NOT IN (SELECT card_id FROM user_card_states WHERE user_id = $userId)
                  ORDER BY RAND()
                  LIMIT 1";
        
        $result = $this->db->read($query);
        if (empty($result)) {
            return null;
        }
        
        $card = $result[0];
        return [
            'card' => $card,
            'rich_data' => $this->getRichWordData($card),
            'word_type' => 'new',
            'is_known' => false
        ];
    }
    
    /**
     * Get rich word data (formatted card data)
     */
    private function getRichWordData($card) {
        return [
            'word' => $card['word'] ?? null,
            'ipa' => $card['ipa'] ?? null,
            'pronunciation_audio' => $card['pronunciation_audio'] ?? null,
            'parts_of_speech' => !empty($card['parts_of_speech']) ? json_decode($card['parts_of_speech'], true) : null,
            'burmese_translation' => $card['burmese_translation'] ?? null,
            'example_sentences' => !empty($card['example_sentences']) ? json_decode($card['example_sentences'], true) : null,
            'synonyms' => !empty($card['synonyms']) ? json_decode($card['synonyms'], true) : null,
            'antonyms' => !empty($card['antonyms']) ? json_decode($card['antonyms'], true) : null,
            'image' => $card['image'] ?? null
        ];
    }
    
    /**
     * Calculate SuperMemo 2 algorithm
     */
    private function calculateSM2($ef, $interval, $repetitions, $quality, $currentLearningDay) {
        // If quality < 3, reset repetitions and interval
        if ($quality < 3) {
            $repetitions = 0;
            $interval = 1;
        } else {
            // Update ease factor
            $ef = $ef + (0.1 - (5 - $quality) * (0.08 + (5 - $quality) * 0.02));
            
            // Ensure minimum ease factor
            $ef = max(1.3, $ef);
            
            // Calculate interval
            if ($repetitions === 0) {
                $interval = 1;
            } elseif ($repetitions === 1) {
                $interval = 6;
            } else {
                $interval = (int)round($interval * $ef);
            }
            
            $repetitions++;
        }
        
        // Calculate due learning day
        $dueAt = $currentLearningDay + $interval;
        
        return [
            'ef' => round($ef, 2),
            'interval' => $interval,
            'repetitions' => $repetitions,
            'due_at' => $dueAt
        ];
    }
    
    /**
     * Return success JSON response
     */
    private function successResponse($data, $message = 'Success') {
        return json_encode([
            'success' => true,
            'data' => $data,
            'message' => $message
        ], JSON_PRETTY_PRINT);
    }
    
    /**
     * Return error JSON response
     */
    private function errorResponse($message) {
        return json_encode([
            'success' => false,
            'message' => $message
        ], JSON_PRETTY_PRINT);
    }
    
    /**
     * Get vocabulary learning progress for all decks that user has started
     * Returns array of decks with progress data grouped by language
     * 
     * @param int $userId User ID
     * @return array Progress data grouped by language
     */
    public function getVocabProgressForAllDecks($userId) {
        $userId = (int)$userId;
        
        // Get all decks where user has started learning (has at least one card in user_card_states)
        $query = "SELECT DISTINCT 
                    d.id as deck_id,
                    d.title as deck_title,
                    d.language_id,
                    l.name as language_name
                  FROM decks d
                  INNER JOIN languages l ON d.language_id = l.id
                  INNER JOIN cards c ON c.deck_id = d.id
                  INNER JOIN user_card_states ucs ON ucs.card_id = c.id
                  WHERE ucs.user_id = $userId
                  ORDER BY l.id ASC, d.id ASC";
        
        $decks = $this->db->read($query);
        
        // If user has no progress, return empty array
        if (empty($decks)) {
            return [];
        }
        
        $progressData = [];
        
        foreach ($decks as $deck) {
            $deckId = (int)$deck['deck_id'];
            $languageId = (int)$deck['language_id'];
            
            // Get current learning day for this deck
            $learningDayNumber = $this->getCurrentLearningDay($userId, $languageId, $deckId);
            
            // Total cards in deck
            $totalCardsQuery = "SELECT COUNT(*) as total FROM cards WHERE deck_id = $deckId";
            $totalResult = $this->db->read($totalCardsQuery);
            $totalCards = $totalResult ? (int)$totalResult[0]['total'] : 0;
            
            // Mastered cards (due_at > 365)
            $masteredQuery = "SELECT COUNT(*) as count 
                            FROM user_card_states ucs
                            INNER JOIN cards c ON c.id = ucs.card_id
                            WHERE ucs.user_id = $userId 
                            AND c.deck_id = $deckId
                            AND ucs.due_at > 365";
            $masteredResult = $this->db->read($masteredQuery);
            $masteredCards = $masteredResult ? (int)$masteredResult[0]['count'] : 0;
            
            // All learned cards (due_at IS NOT NULL)
            $learnedQuery = "SELECT COUNT(*) as count 
                           FROM user_card_states ucs
                           INNER JOIN cards c ON c.id = ucs.card_id
                           WHERE ucs.user_id = $userId 
                           AND c.deck_id = $deckId
                           AND ucs.due_at IS NOT NULL
                           AND ucs.suspended = 0
                           AND (ucs.paused_until IS NULL OR ucs.paused_until <= $learningDayNumber)";
            $learnedResult = $this->db->read($learnedQuery);
            $learnedCards = $learnedResult ? (int)$learnedResult[0]['count'] : 0;
            
            // Recall words (due_at <= current_learning_day AND due_at IS NOT NULL)
            $recallQuery = "SELECT COUNT(*) as count 
                           FROM user_card_states ucs
                           INNER JOIN cards c ON c.id = ucs.card_id
                           WHERE ucs.user_id = $userId 
                           AND c.deck_id = $deckId
                           AND ucs.due_at IS NOT NULL
                           AND ucs.due_at <= $learningDayNumber
                           AND ucs.suspended = 0
                           AND (ucs.paused_until IS NULL OR ucs.paused_until <= $learningDayNumber)";
            $recallResult = $this->db->read($recallQuery);
            $recallWords = $recallResult ? (int)$recallResult[0]['count'] : 0;
            
            // Calculate new words for today's session
            // Get learning day word count limit
            $learningDayWordCount = $this->getWordCountForLearningDay($learningDayNumber);
            
            // Available new words (total - learned)
            $availableNewWords = max(0, $totalCards - $learnedCards);
            
            // Remaining slots after recall words
            $remainingSlots = max(0, $learningDayWordCount - $recallWords);
            
            // New words for today = min(remaining slots, available new words)
            $newWords = min($remainingSlots, $availableNewWords);
            
            // Calculate progress percentage (mastered / total)
            $progressPercent = $totalCards > 0 ? round(($masteredCards / $totalCards) * 100) : 0;
            
            // Group by language
            if (!isset($progressData[$languageId])) {
                $progressData[$languageId] = [
                    'language_id' => $languageId,
                    'language_name' => $deck['language_name'],
                    'decks' => []
                ];
            }
            
            $progressData[$languageId]['decks'][] = [
                'deck_id' => $deckId,
                'deck_title' => $deck['deck_title'],
                'total_cards' => $totalCards,
                'mastered_cards' => $masteredCards,
                'learned_cards' => $learnedCards,
                'recall_words' => $recallWords,
                'new_words' => $newWords,
                'progress_percent' => $progressPercent,
                'current_learning_day' => $learningDayNumber
            ];
        }
        
        return $progressData;
    }
    
    /**
     * Get progress data for a single deck
     * @param int $userId User ID
     * @param int $languageId Language ID
     * @param int $deckId Deck ID
     * @return array|null Progress data or null if no progress exists
     */
    public function getDeckProgress($userId, $languageId, $deckId) {
        $userId = (int)$userId;
        $languageId = (int)$languageId;
        $deckId = (int)$deckId;
        
        // // Check if user has any progress for this deck
        // $checkQuery = "SELECT COUNT(*) as count 
        //                FROM user_card_states ucs
        //                INNER JOIN cards c ON c.id = ucs.card_id
        //                WHERE ucs.user_id = $userId 
        //                AND c.deck_id = $deckId";
        // $checkResult = $this->db->read($checkQuery);
        
        // // If no progress, return null
        // if (empty($checkResult) || (int)$checkResult[0]['count'] == 0) {
        //     return null;
        // }
        
        // Get current learning day for this deck
        $learningDayNumber = $this->getCurrentLearningDay($userId, $languageId, $deckId);
        
        // Total cards in deck
        $totalCardsQuery = "SELECT COUNT(*) as total FROM cards WHERE deck_id = $deckId";
        $totalResult = $this->db->read($totalCardsQuery);
        $totalCards = $totalResult ? (int)$totalResult[0]['total'] : 0;
        
        // Mastered cards (due_at > 365)
        $masteredQuery = "SELECT COUNT(*) as count 
                        FROM user_card_states ucs
                        INNER JOIN cards c ON c.id = ucs.card_id
                        WHERE ucs.user_id = $userId 
                        AND c.deck_id = $deckId
                        AND ucs.due_at > 365";
        $masteredResult = $this->db->read($masteredQuery);
        $masteredCards = $masteredResult ? (int)$masteredResult[0]['count'] : 0;
        
        // All learned cards (due_at IS NOT NULL)
        $learnedQuery = "SELECT COUNT(*) as count 
                       FROM user_card_states ucs
                       INNER JOIN cards c ON c.id = ucs.card_id
                       WHERE ucs.user_id = $userId 
                       AND c.deck_id = $deckId
                       AND ucs.due_at IS NOT NULL
                       AND ucs.suspended = 0
                       AND (ucs.paused_until IS NULL OR ucs.paused_until <= $learningDayNumber)";
        $learnedResult = $this->db->read($learnedQuery);
        $learnedCards = $learnedResult ? (int)$learnedResult[0]['count'] : 0;
        
        // Recall words (due_at <= current_learning_day AND due_at IS NOT NULL)
        $recallQuery = "SELECT COUNT(*) as count 
                       FROM user_card_states ucs
                       INNER JOIN cards c ON c.id = ucs.card_id
                       WHERE ucs.user_id = $userId 
                       AND c.deck_id = $deckId
                       AND ucs.due_at IS NOT NULL
                       AND ucs.due_at <= $learningDayNumber
                       AND ucs.suspended = 0
                       AND (ucs.paused_until IS NULL OR ucs.paused_until <= $learningDayNumber)";
        $recallResult = $this->db->read($recallQuery);
        $recallWords = $recallResult ? (int)$recallResult[0]['count'] : 0;
        
        // Calculate new words for today's session
        $learningDayWordCount = $this->getWordCountForLearningDay($learningDayNumber);
        
        // Available new words (total - learned)
        $availableNewWords = max(0, $totalCards - $learnedCards);
        
        // Remaining slots after recall words
        $remainingSlots = max(0, $learningDayWordCount - $recallWords);
        
        // New words for today = min(remaining slots, available new words)
        $newWords = min($remainingSlots, $availableNewWords);
        
        // Calculate progress percentage (mastered / total)
        $progressPercent = $totalCards > 0 ? round(($masteredCards / $totalCards) * 100) : 0;
        
        return [
            'total_cards' => $totalCards,
            'mastered_cards' => $masteredCards,
            'learned_cards' => $learnedCards,
            'recall_words' => $recallWords,
            'new_words' => $newWords,
            'progress_percent' => $progressPercent,
            'current_learning_day' => $learningDayNumber
        ];
    }
}

