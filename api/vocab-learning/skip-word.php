<?php
/**
 * API: Skip Word
 * POST: Skip a word and get replacement
 * Requires: user_id, card_id, language_id, deck_id
 */

require_once __DIR__ . '/../bootstrap.php';
include('../../classes/connect.php');
include('../../classes/LearningFlow.php');

// Parse JSON input if Content-Type is application/json
$input = [];
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    if (strpos($contentType, 'application/json') !== false) {
        $jsonInput = file_get_contents('php://input');
        $input = json_decode($jsonInput, true) ?? [];
    } else {
        $input = $_POST;
    }
}

$user_id = $_GET['user_id'] ?? $input['user_id'] ?? null;
$card_id = $_GET['card_id'] ?? $input['card_id'] ?? null;
$language_id = $_GET['language_id'] ?? $input['language_id'] ?? null;
$deck_id = $_GET['deck_id'] ?? $input['deck_id'] ?? null;
$reason = $_GET['reason'] ?? $input['reason'] ?? 'already_know';
$session_card_ids = $_GET['session_card_ids'] ?? $input['session_card_ids'] ?? [];

if (empty($user_id) || empty($card_id) || empty($language_id) || empty($deck_id)) {
    $response = [
        'success' => false,
        'message' => 'Missing required parameters: user_id, card_id, language_id, deck_id'
    ];
    echo json_encode($response);
    return;
}

// Parse session_card_ids if it's a JSON string
if (is_string($session_card_ids)) {
    $session_card_ids = json_decode($session_card_ids, true);
    if ($session_card_ids === null) {
        $session_card_ids = [];
    }
}

// Ensure session_card_ids is an array
if (!is_array($session_card_ids)) {
    $session_card_ids = [];
}

$LearningFlow = new LearningFlow();
$result = $LearningFlow->skipWord($user_id, $card_id, $language_id, $deck_id, $reason, $session_card_ids);

echo $result;

?>

