<?php
include('../../classes/connect.php');

$language_id = $_GET['language_id'] ?? null;

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

echo json_encode([
    'success' => true,
    'decks' => $decks ? $decks : []
]);

?>

