<?php
/**
 * Generate IPA (International Phonetic Alphabet) symbols for Korean words using DeepSeek AI
 * 
 * Usage:
 * 1. Set your DeepSeek API key in $deepseek_api_key below
 * 2. Configure $language_id and $deck_id (or set $deck_id to null for all decks)
 * 3. Run: php generate_ipa_korean.php
 * 
 * The script will:
 * - Fetch all words without IPA from the database
 * - Call DeepSeek API to generate IPA and Myanmar phonetic for each word
 * - Update the database with the IPA and Myanmar phonetic (format: /ipa/ - Myanmar phonetic)
 * - Show progress and statistics
 */

include('../classes/connect.php');

// Configuration
$language_id = 1; // Korean language ID
$deck_id = 1; // Deck ID (optional, set to null to process all decks)
$deepseek_api_key = 'YOUR_DEEPSEEK_API_KEY'; // Replace with your DeepSeek API key
$deepseek_api_url = 'https://api.deepseek.com/v1/chat/completions';

// Rate limiting: delay between API calls (in seconds)
$delay_between_calls = 1; // Adjust based on your API rate limits (DeepSeek free tier: ~1 req/sec)

// Statistics
$successCount = 0;
$errorCount = 0;
$skippedCount = 0;

// Check if API key is set
if ($deepseek_api_key === 'YOUR_DEEPSEEK_API_KEY') {
    die("Error: Please set your DeepSeek API key in the script.\n");
}

$db = new Database();
$conn = $db->connect();

// Set UTF-8 encoding for proper Korean character handling
if ($conn) {
    $conn->set_charset("utf8mb4");
}

/**
 * Call DeepSeek API to get IPA symbol and Myanmar phonetic for a Korean word
 */
function getIPAAndMyanmarPhoneticFromDeepSeek($word, $api_key, $api_url) {
    $prompt = "For the Korean word \"$word\", provide:\n1. The IPA (International Phonetic Alphabet) pronunciation in the format /.../\n2. The Myanmar (Burmese) phonetic transcription\n\nReturn in this exact format: /ipa/ - Myanmar phonetic\n\nExample: /kaɡe/ - ကာဂဲ\n\nDo not include any explanation, description, or additional text - only the IPA and Myanmar phonetic separated by ' - '.";
    
    $data = [
        'model' => 'deepseek-chat',
        'messages' => [
            [
                'role' => 'system',
                'content' => 'You are a linguistic expert specializing in Korean phonetics and Myanmar (Burmese) language. When asked for IPA and Myanmar phonetic, respond with ONLY the format: /ipa/ - Myanmar phonetic, without any additional text, explanations, or formatting. Use standard Korean pronunciation (Seoul dialect) for IPA and accurate Myanmar phonetic transcription.'
            ],
            [
                'role' => 'user',
                'content' => $prompt
            ]
        ],
        'temperature' => 0.2, // Lower temperature for more consistent output
        'max_tokens' => 50
    ];
    
    $ch = curl_init($api_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $api_key
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curl_error = curl_error($ch);
    curl_close($ch);
    
    if ($curl_error) {
        return ['error' => 'CURL Error: ' . $curl_error];
    }
    
    if ($http_code !== 200) {
        return ['error' => 'API Error: HTTP ' . $http_code . ' - ' . $response];
    }
    
    $response_data = json_decode($response, true);
    
    if (!$response_data || !isset($response_data['choices'][0]['message']['content'])) {
        return ['error' => 'Invalid API response: ' . $response];
    }
    
    $response_text = trim($response_data['choices'][0]['message']['content']);
    
    // Try to extract the format: /ipa/ - Myanmar phonetic
    $combined = '';
    
    // Check if response already contains the separator ' - '
    if (preg_match('/([\/\[][^\/\]]+[\/\]])?\s*-\s*(.+)/u', $response_text, $matches)) {
        $ipa_part = trim($matches[1] ?? '');
        $myanmar_part = trim($matches[2]);
        
        // If IPA part is missing, try to extract it separately
        if (empty($ipa_part)) {
            if (preg_match('/([\/\[][^\/\]]+[\/\]])/', $response_text, $ipa_match)) {
                $ipa_part = trim($ipa_match[1]);
            }
        }
        
        // Clean up Myanmar phonetic part
        $myanmar_part = preg_replace('/^(?:Myanmar|Burmese|phonetic|transcription)[:\s\-]*/i', '', $myanmar_part);
        $myanmar_part = trim($myanmar_part);
        
        if (!empty($ipa_part) && !empty($myanmar_part)) {
            $combined = $ipa_part . ' - ' . $myanmar_part;
        }
    }
    
    // If format not found, try to extract IPA and Myanmar separately
    if (empty($combined)) {
        $ipa = '';
        $myanmar_phonetic = '';
        
        // Extract IPA
        if (preg_match('/([\/\[][^\/\]]+[\/\]])/', $response_text, $ipa_matches)) {
            $ipa = trim($ipa_matches[1]);
        }
        
        // Extract Myanmar phonetic (look for Myanmar script characters)
        // Myanmar Unicode range: U+1000 to U+109F
        if (preg_match('/([\x{1000}-\x{109F}\s]+)/u', $response_text, $myanmar_matches)) {
            $myanmar_phonetic = trim($myanmar_matches[1]);
        }
        
        // If we have both, combine them
        if (!empty($ipa) && !empty($myanmar_phonetic)) {
            $combined = $ipa . ' - ' . $myanmar_phonetic;
        } elseif (!empty($ipa)) {
            // If only IPA is available, return just IPA (for backward compatibility)
            $combined = $ipa;
        }
    }
    
    // Validate result is not empty
    if (empty($combined)) {
        return ['error' => 'Could not extract valid IPA and Myanmar phonetic from response: ' . $response_text];
    }
    
    return ['ipa' => $combined];
}

// Build query to fetch words without IPA
$where_clause = "WHERE c.language_id = $language_id";
if ($deck_id !== null) {
    $where_clause .= " AND c.deck_id = $deck_id";
}
$where_clause .= " AND (c.ipa IS NULL OR c.ipa = '' OR TRIM(c.ipa) = '')";

$query = "SELECT c.id, c.word, c.deck_id 
          FROM cards c 
          $where_clause
          ORDER BY c.id ASC";

echo "Fetching Korean words without IPA...\n";
$words = $db->read($query);

if (!$words || empty($words)) {
    echo "No words found without IPA.\n";
    exit;
}

$totalWords = count($words);
echo "Found $totalWords words to process.\n";
echo "Starting IPA generation...\n\n";
echo str_repeat("=", 60) . "\n";

// Process each word
foreach ($words as $index => $word_data) {
    $word_id = $word_data['id'];
    $word = trim($word_data['word']);
    
    // Skip empty words
    if (empty($word)) {
        $skippedCount++;
        echo "[" . ($index + 1) . "/$totalWords] ⚠ Skipped: Empty word (ID: $word_id)\n";
        continue;
    }
    
    echo "[" . ($index + 1) . "/$totalWords] Processing: $word (ID: $word_id)... ";
    
    // Get IPA and Myanmar phonetic from DeepSeek
    $result = getIPAAndMyanmarPhoneticFromDeepSeek($word, $deepseek_api_key, $deepseek_api_url);
    
    if (isset($result['error'])) {
        $errorCount++;
        echo "✗ ERROR: " . $result['error'] . "\n";
        
        // If it's a rate limit error, wait longer
        if (strpos($result['error'], '429') !== false || strpos($result['error'], 'rate limit') !== false) {
            echo "   Waiting 60 seconds due to rate limit...\n";
            sleep(60);
        }
        continue;
    }
    
    if (!isset($result['ipa']) || empty($result['ipa'])) {
        $errorCount++;
        echo "✗ ERROR: No IPA returned\n";
        continue;
    }
    
    $ipa = $result['ipa'];
    
    // Escape for SQL
    $ipa_escaped = $conn->real_escape_string($ipa);
    $word_id = (int)$word_id;
    
    // Update database
    $update_query = "UPDATE cards SET ipa = '$ipa_escaped' WHERE id = $word_id";
    $update_result = $db->save($update_query);
    
    if ($update_result) {
        $successCount++;
        echo "✓ Success: $ipa\n";
    } else {
        $errorCount++;
        echo "✗ ERROR: Failed to update database\n";
    }
    
    // Rate limiting: wait between API calls
    if ($index < $totalWords - 1) { // Don't wait after the last word
        sleep($delay_between_calls);
    }
    
    // Flush output to see progress in real-time
    if (ob_get_level() > 0) {
        ob_flush();
    }
    flush();
}

echo "\n" . str_repeat("=", 60) . "\n";
echo "IPA Generation Completed!\n";
echo "Successfully processed: $successCount words\n";
echo "Failed: $errorCount words\n";
echo "Skipped: $skippedCount words\n";
echo "Total: $totalWords words\n";
echo str_repeat("=", 60) . "\n";

?>

