<?php
include('../../classes/connect.php');
include('../../classes/LearningFlow.php');

$user_id = $_GET['user_id'] ?? $_POST['user_id'] ?? null;
$card_id = $_GET['card_id'] ?? $_POST['card_id'] ?? null;
$quality = $_GET['quality'] ?? $_POST['quality'] ?? null;

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

