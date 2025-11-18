<?php
include('../../classes/connect.php');
include('../../classes/LearningFlow.php');

$user_id = $_GET['user_id'] ?? $_POST['user_id'] ?? null;
$card_id = $_GET['card_id'] ?? $_POST['card_id'] ?? null;
$language_id = $_GET['language_id'] ?? $_POST['language_id'] ?? null;
$deck_id = $_GET['deck_id'] ?? $_POST['deck_id'] ?? null;
$reason = $_GET['reason'] ?? $_POST['reason'] ?? 'already_know';
$session_card_ids = $_GET['session_card_ids'] ?? $_POST['session_card_ids'] ?? [];

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

