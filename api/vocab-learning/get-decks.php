<?php
include('../../classes/connect.php');
include('../../classes/LearningFlow.php');

$language_id = $_GET['language_id'] ?? null;
$user_id = $_GET['user_id'] ?? $_POST['user_id'] ?? null;

if (empty($language_id)) {
    echo json_encode([
        'success' => false,
        'message' => 'Missing required parameter: language_id'
    ]);
    return;
}

$db = new Database();
$query = "SELECT * FROM decks WHERE language_id = $language_id ORDER BY id ASC";
$decks = $db->read($query);

// If user_id is provided, add progress data for each deck
if (!empty($user_id) && !empty($decks)) {
    $LearningFlow = new LearningFlow();
    
    foreach ($decks as &$deck) {
        $deckId = (int)$deck['id'];
        $progress = $LearningFlow->getDeckProgress($user_id, $language_id, $deckId);
        
        // Add progress data to deck (null if no progress exists)
        $deck['progress'] = $progress;
    }
    unset($deck); // Unset reference to avoid issues
}

echo json_encode([
    'success' => true,
    'decks' => $decks ? $decks : []
]);

?>

