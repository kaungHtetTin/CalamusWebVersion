<?php
require_once __DIR__ . '/../bootstrap.php';
include(__DIR__ . '/../../classes/connect.php');
include(__DIR__ . '/../../classes/LearningFlow.php');

$user_id = $_GET['user_id'] ?? $_POST['user_id'] ?? null;

if (empty($user_id)) {
    echo json_encode([
        'success' => false,
        'message' => 'Missing required parameter: user_id'
    ]);
    return;
}

$LearningFlow = new LearningFlow();
$progress = $LearningFlow->getVocabProgressForAllDecks($user_id);

echo json_encode([
    'success' => true,
    'data' => $progress,
    'message' => 'Vocab progress retrieved successfully'
], JSON_PRETTY_PRINT);

?>

