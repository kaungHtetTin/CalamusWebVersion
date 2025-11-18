<?php
include('../classes/connect.php');

// Configuration - Update these values
$language_id = 2; // English language ID - update this based on your languages table
$deck_id = 2; // Deck ID - update this based on your decks table

$json = file_get_contents('english_words.json');
$data = json_decode($json, true);

if (!$data) {
    die("Error: Failed to parse JSON file.\n");
}

$db = new Database();
$successCount = 0;
$errorCount = 0;

foreach($data as $item) {
    $english_text = trim($item['english']);
    $myanmar_translation = trim($item['myanmar']);
    
    // Extract word, part of speech, and level
    // Pattern 1: "word (part of speech) " - with parentheses
    // Examples: "A, an (art.) ", "abandon (v.) ", "act (v., n.) "
    // Pattern 2: "word part_of_speech level" - without parentheses, with level
    // Examples: "poetry n. B1", "feel v. A1, n. B2", "fence n. B1"
    $word = '';
    $part_of_speech = '';
    $level = '';
    
    // First check for format with parentheses: "word (part of speech)"
    if (preg_match('/^(.+?)\s*\(([^)]+)\)\s*$/', $english_text, $matches)) {
        $word = trim($matches[1]);
        $part_of_speech = trim($matches[2]);
    } 
    // Then check for format without parentheses: "word part_of_speech level"
    // Examples: "poetry n. B1", "feel v. A1, n. B2", "female adj., n. A2", "few det./adj., pron. A1"
    else {
        // Extract all level indicators (A1, A2, B1, B2, C1, C2) from the text
        preg_match_all('/\b([A-C][12])\b/i', $english_text, $level_matches);
        if (!empty($level_matches[1])) {
            $levels = array_unique($level_matches[1]);
            $level = implode(', ', $levels);
            
            // Remove all level indicators to get word + part of speech
            $text_without_levels = preg_replace('/\s+\b[A-C][12]\b/i', '', $english_text);
            $text_without_levels = trim($text_without_levels);
            
            // Now find where the word ends and part of speech begins
            // Look for pattern: word followed by part of speech (n., v., adj., etc.)
            // Part of speech can have: dots (n.), slashes (det./adj.), commas (adj., n.)
            if (preg_match('/^(.+?)\s+([a-z]+(?:\.[a-z]+)?(?:\/[a-z]+(?:\.[a-z]+)?)?(?:\s*,\s*[a-z]+(?:\.[a-z]+)?(?:\/[a-z]+(?:\.[a-z]+)?)?)*)\s*$/i', $text_without_levels, $matches)) {
                $word = trim($matches[1]);
                $part_of_speech = trim($matches[2]);
            } else {
                // Fallback: split by first occurrence of part of speech pattern
                // Pattern: space followed by lowercase letters, optional dot, optional slash
                if (preg_match('/^(.+?)\s+([a-z]+(?:\.[a-z]+)?)/i', $text_without_levels, $matches)) {
                    $word = trim($matches[1]);
                    // Get all parts of speech from the remaining text
                    $remaining = trim(substr($text_without_levels, strlen($word)));
                    // Extract all part of speech patterns (n., v., adj., etc.)
                    preg_match_all('/([a-z]+(?:\.[a-z]+)?(?:\/[a-z]+(?:\.[a-z]+)?)?)/i', $remaining, $pos_matches);
                    if (!empty($pos_matches[1])) {
                        $part_of_speech = implode(', ', array_unique($pos_matches[1]));
                    } else {
                        $part_of_speech = trim($remaining);
                    }
                } else {
                    $word = trim($text_without_levels);
                    $part_of_speech = '';
                }
            }
        }
        // No level found, check if there's a part of speech pattern
        else if (preg_match('/^(.+?)\s+([a-z]+(?:\.[a-z]+)?(?:\/[a-z]+(?:\.[a-z]+)?)?(?:\s*,\s*[a-z]+(?:\.[a-z]+)?(?:\/[a-z]+(?:\.[a-z]+)?)?)*)\s*$/i', $english_text, $matches)) {
            $word = trim($matches[1]);
            $part_of_speech = trim($matches[2]);
        }
        // No part of speech found, use the whole text as word
        else {
            $word = trim($english_text);
            $part_of_speech = '';
            $level = '';
        }
    }
    
    // Clean up the word (remove trailing commas, extra spaces)
    $word = trim($word, ', ');
    
    // Use part of speech and level as example sentence
    $example_sentences = [];
    if (!empty($part_of_speech)) {
        // Format part of speech nicely
        $pos_formatted = str_replace('.', '', $part_of_speech); // Remove dots from abbreviations
        $pos_formatted = str_replace(',', ', ', $pos_formatted); // Add space after commas
        
        $example_text = "Part of speech: " . $pos_formatted;
        if (!empty($level)) {
            $example_text .= " | Level: " . $level;
        }
        $example_sentences[] = $example_text;
    } else if (!empty($level)) {
        // Only level, no part of speech
        $example_sentences[] = "Level: " . $level;
    }
    
    // Encode example sentences as JSON
    $example_sentences_json = !empty($example_sentences) ? json_encode($example_sentences) : '[]';
    
    // Escape strings for SQL
    $word_escaped = $db->connect()->real_escape_string($word);
    $myanmar_escaped = $db->connect()->real_escape_string($myanmar_translation);
    $example_escaped = $db->connect()->real_escape_string($example_sentences_json);
    
    // Insert into cards table
    $query = "INSERT INTO cards (word, burmese_translation, example_sentences, language_id, deck_id) 
              VALUES ('$word_escaped', '$myanmar_escaped', '$example_escaped', $language_id, $deck_id)";
    
    $result = $db->save($query);
    
    if($result) {
        $successCount++;
        echo "✓ Word added successfully: $word_escaped (Part of speech: $part_of_speech)\n";
    } else {
        $errorCount++;
        echo "✗ Failed to add word: $word\n";
    }
}

echo "\n========================================\n";
echo "Import completed!\n";
echo "Successfully added: $successCount words\n";
echo "Failed: $errorCount words\n";
echo "========================================\n";

?>

