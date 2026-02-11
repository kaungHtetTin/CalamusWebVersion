<?php
/**
 * API: Rate Word (SM2 Algorithm)
 * POST: Rate a word card with quality (0-5)
 * Requires: user_id, card_id, quality
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
$quality = $_GET['quality'] ?? $input['quality'] ?? null;

if (empty($user_id) || empty($card_id) || $quality === null) {
    $response = [
        'success' => false,
        'message' => 'Missing required parameters: user_id, card_id, quality'
    ];
    echo json_encode($response);
    return;
}

$quality = (int)$quality;
if ($quality < 0 || $quality > 5) {
    $response = [
        'success' => false,
        'message' => 'Quality must be between 0 and 5'
    ];
    echo json_encode($response);
    return;
}

$LearningFlow = new LearningFlow();
$result = $LearningFlow->rateWordWithSM2($user_id, $card_id, $quality);

echo $result;

?>

