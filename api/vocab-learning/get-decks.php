<?php
/**
 * API: Get Decks
 * GET: Returns decks filtered by major or language_id
 * Optional: user_id for progress data
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

$major = $_GET['major'] ?? null;
$language_id = $_GET['language_id'] ?? null; // Keep for backward compatibility
$user_id = $_GET['user_id'] ?? $_POST['user_id'] ?? null;

$db = new Database();
$conn = $db->connect();

// Build query based on major or language_id
$whereConditions = [];
if (!empty($major)) {
    $majorEscaped = $conn->real_escape_string($major);
    $whereConditions[] = "major = '$majorEscaped'";
} elseif (!empty($language_id)) {
    // Backward compatibility: filter by language_id if major is not provided
    $language_id = (int)$language_id;
    $whereConditions[] = "language_id = $language_id";
}

// If no filter provided, get all decks
$query = "SELECT * FROM decks";
if (!empty($whereConditions)) {
    $query .= " WHERE " . implode(" AND ", $whereConditions);
}
$query .= " ORDER BY id ASC";

$decks = $db->read($query);

// If user_id is provided, add progress data for each deck
if (!empty($user_id) && !empty($decks)) {
    $LearningFlow = new LearningFlow();
    
    foreach ($decks as &$deck) {
        $deckId = (int)$deck['id'];
        $deckLanguageId = (int)$deck['language_id'];
        $progress = $LearningFlow->getDeckProgress($user_id, $deckLanguageId, $deckId);
        
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

