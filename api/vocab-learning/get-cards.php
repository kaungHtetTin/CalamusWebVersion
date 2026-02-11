<?php
/**
 * API: Get Learning Cards
 * GET: Returns cards for a learning session
 * Requires: user_id, language_id, deck_id
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

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