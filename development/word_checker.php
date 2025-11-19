<?php
include('../classes/connect.php');

$db = new Database();
$userId = 2817;
$languageId = 2;
$deckId = 2;
$learningDayNumber = 3;

     $query = "SELECT c.*, d.title as deck_title, l.name as language_name
                  FROM cards c
                  LEFT JOIN decks d ON c.deck_id = d.id
                  LEFT JOIN languages l ON c.language_id = l.id
                  INNER JOIN user_card_states ucs ON c.id = ucs.card_id
                  WHERE ucs.user_id = $userId
                    AND c.language_id = $languageId
                    AND c.deck_id = $deckId
                    AND ucs.suspended = 0
                    AND ucs.due_at IS NOT NULL
                    AND ucs.due_at <= $learningDayNumber
                    AND (ucs.paused_until IS NULL OR ucs.paused_until <= $learningDayNumber)
                  ORDER BY ucs.due_at ASC, c.id ASC";
        
        $result = $db->read($query);
       
        print_r($result);
        echo "/n/n/";
        echo $query;



?>