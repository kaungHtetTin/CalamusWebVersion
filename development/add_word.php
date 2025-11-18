<?php
include('../classes/connect.php');

// Set UTF-8 encoding for proper Korean character handling
mb_internal_encoding('UTF-8');
header('Content-Type: text/html; charset=UTF-8');

$json = file_get_contents('korean_words.json');
$data = json_decode($json, true);

if (!$data) {
    die("Error: Failed to parse JSON file.\n");
}

$db = new Database();
$conn = $db->connect();

// Set database connection to UTF-8
if ($conn) {
    $conn->set_charset("utf8mb4");
}

$language_id = 1; // Korean language ID - update this based on your languages table
$deck_id = 1; // Deck ID - update this based on your decks table

$successCount = 0;
$errorCount = 0;

foreach($data as $item){
    // Get Korean word and translations
    $korean_word = trim($item['Korean word']);
    $burmese_translation = trim($item['Burmese translation']);
    $korean_example_1 = trim($item['Korean Example 1']);
    $korean_example_2 = trim($item['Korean Example 2']);
    
    // Build example sentences array (filter out empty values)
    $example_sentences_array = [];
    if (!empty($korean_example_1)) {
        $example_sentences_array[] = $korean_example_1;
    }
    if (!empty($korean_example_2)) {
        $example_sentences_array[] = $korean_example_2;
    }
    
    // Encode as JSON with UNESCAPED_UNICODE flag to preserve Korean characters
    // This prevents encoding like "uac00uaca9" and keeps actual Korean characters
    $example_sentences_json = json_encode($example_sentences_array, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    
    // Escape strings for SQL to prevent SQL injection
    $korean_word_escaped = $conn->real_escape_string($korean_word);
    $burmese_translation_escaped = $conn->real_escape_string($burmese_translation);
    $example_sentences_escaped = $conn->real_escape_string($example_sentences_json);
    
    // Insert into cards table
    $query = "INSERT INTO cards (word, burmese_translation, example_sentences, language_id, deck_id) 
              VALUES ('$korean_word_escaped', '$burmese_translation_escaped', '$example_sentences_escaped', $language_id, $deck_id)";
    
    $result = $db->save($query);
    
    if($result){
        $successCount++;
        echo "✓ Word added successfully: $korean_word\n";
    } else {
        $errorCount++;
        echo "✗ Failed to add word: $korean_word\n";
        if ($conn->error) {
            echo "  Error: " . $conn->error . "\n";
        }
    }
}

echo "\n========================================\n";
echo "Import completed!\n";
echo "Successfully added: $successCount words\n";
echo "Failed: $errorCount words\n";
echo "========================================\n";

?>