<?php
/**
 * Add TOPIK 2 Korean Words to Cards Table
 * 
 * This script reads from korean_topik_2.json and imports Korean words
 * into the cards table with language_id = 1 and deck_id = 2
 */

include('../classes/connect.php');

// Set UTF-8 encoding for proper Korean character handling
mb_internal_encoding('UTF-8');
header('Content-Type: text/html; charset=UTF-8');

$json = file_get_contents('korean_topik_2.json');
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

$language_id = 1; // Korean language ID
$deck_id = 3; // TOPIK 2 deck ID

$successCount = 0;
$errorCount = 0;
$duplicateCount = 0;

foreach($data as $item) {
    // Get Korean word and translations
    // Handle both possible field names: "Korean_word" or "Korean word"
    $korean_word = trim($item['Korean_word'] ?? $item['Korean word'] ?? '');
    $burmese_translation = trim($item['Burmese_translation'] ?? $item['Burmese translation'] ?? '');
    
    // Handle both possible field names for examples
    $korean_example_1 = trim($item['example_1'] ?? $item['Korean Example 1'] ?? '');
    $korean_example_2 = trim($item['example_2'] ?? $item['Korean Example 2'] ?? '');
    
    // Skip if word is empty
    if (empty($korean_word)) {
        $errorCount++;
        echo "⚠ Skipped: Empty word entry\n";
        continue;
    }
    
    // Check if word already exists in the database for this language and deck
    $check_query = "SELECT id FROM cards 
                    WHERE word = '" . $conn->real_escape_string($korean_word) . "' 
                    AND language_id = $language_id 
                    AND deck_id = $deck_id 
                    LIMIT 1";
    $existing = $db->read($check_query);
    
    if ($existing && !empty($existing)) {
        $duplicateCount++;
        echo "⊘ Duplicate skipped: $korean_word (already exists)\n";
        continue;
    }
    
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
    
    if($result) {
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

echo "\n" . str_repeat("=", 60) . "\n";
echo "Import completed!\n";
echo "Successfully added: $successCount words\n";
echo "Failed: $errorCount words\n";
echo "Duplicates skipped: $duplicateCount words\n";
echo "Total processed: " . ($successCount + $errorCount + $duplicateCount) . " words\n";
echo str_repeat("=", 60) . "\n";

?>

