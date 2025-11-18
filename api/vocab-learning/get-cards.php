<?php
include('../../classes/connect.php');
include('../../classes/LearningFlow.php');

$user_id = $_GET['user_id'] ?? $_POST['user_id'] ?? null;
$language_id = $_GET['language_id'] ?? $_POST['language_id'] ?? null;
$deck_id = $_GET['deck_id'] ?? $_POST['deck_id'] ?? null;

if (empty($user_id) || empty($language_id) || empty($deck_id)) {
    echo json_encode([
        'success' => false,
        'message' => 'Missing required parameters: user_id, language_id, deck_id'
    ]);
    return;
}

$LearningFlow = new LearningFlow();
$cards = $LearningFlow->getLearningCards($user_id, 10, $language_id, $deck_id);

echo $cards;

?>