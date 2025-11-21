<?php
/**
 * Generate IPA (International Phonetic Alphabet) symbols for English words using DeepSeek AI
 * 
 * Usage:
 * 1. Set your DeepSeek API key in $deepseek_api_key below
 * 2. Configure $language_id and $deck_id (or set $deck_id to null for all decks)
 * 3. Run: php generate_ipa_english.php
 * 
 * The script will:
 * - Fetch all words without IPA from the database
 * - Call DeepSeek API to generate IPA for each word
 * - Update the database with the IPA symbols
 * - Show progress and statistics
 */

include('../classes/connect.php');

// Configuration
$language_id = 2; // English language ID
$deck_id = 2; // Deck ID (optional, set to null to process all decks)
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

// Set UTF-8 encoding
if ($conn) {
    $conn->set_charset("utf8mb4");
}

/**
 * Call DeepSeek API to get IPA symbol for a word
 */
function getIPAFromDeepSeek($word, $api_key, $api_url) {
    $prompt = "What is the IPA (International Phonetic Alphabet) pronunciation for the English word \"$word\"? Return ONLY the IPA symbol in the standard format with forward slashes, like /həˈloʊ/ or /hɛˈloʊ/. Do not include any explanation, description, or additional text - only the IPA symbol.";
    
    $data = [
        'model' => 'deepseek-chat',
        'messages' => [
            [
                'role' => 'system',
                'content' => 'You are a linguistic expert specializing in English phonetics. When asked for IPA symbols, respond with ONLY the IPA notation in the format /.../ without any additional text, explanations, or formatting. Use standard American English pronunciation.'
            ],
            [
                'role' => 'user',
                'content' => $prompt
            ]
        ],
        'temperature' => 0.2, // Lower temperature for more consistent IPA output
        'max_tokens' => 30
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
    
    $ipa_text = trim($response_data['choices'][0]['message']['content']);
    
    // Clean up the IPA: remove any extra text, keep only the IPA symbol
    // Extract IPA in format /.../ or [...]
    $ipa = '';
    
    // First, try to extract IPA in standard format /.../ or [...]
    // Handle cases where multiple IPA options are given (e.g., "/həˈloʊ/ or /hɛˈloʊ/")
    if (preg_match('/([\/\[][^\/\]]+[\/\]])/', $ipa_text, $matches)) {
        $ipa = trim($matches[1]);
        // If there are multiple options, take the first one
        if (preg_match('/^([\/\[][^\/\]]+[\/\]])/', $ipa_text, $first_match)) {
            $ipa = trim($first_match[1]);
        }
    } 
    // If no brackets, try to find IPA characters and wrap them
    else {
        // Remove common prefixes/suffixes that AI might add
        $cleaned = preg_replace('/^(?:IPA|phonetic|pronunciation|symbol|the|is)[:\s\-]*/i', '', $ipa_text);
        $cleaned = preg_replace('/[:\s\-]*$/', '', $cleaned);
        $cleaned = trim($cleaned);
        
        // Remove any remaining non-IPA characters (keep only IPA symbols, slashes, brackets, spaces, stress marks)
        // This regex keeps: a-z, common IPA symbols, slashes, brackets, spaces, stress marks
        $cleaned = preg_replace('/[^\/\[\]a-zəɑæɔɛɪɨɯɵɶɷɸɹɺɻɼɽɾɿʀʁʂʃʄʅʆʇʈʉʊʋʌʍʎʏʐʑʒʓʔʕʖʗʘʙʚʛʜʝʞʟʠʡʢʣʤʥʦʧʨʩʪʫʬʭʮʯːˑ˒˓˔˕˖˗˘˙˚˛˜˝˞˟ˠˡˢˣˤ˥˦˧˨˩˪˫ˬ˭ˮ˯˰˱˲˳˴˵˶˷˸˹˺˻˼˽˾˿̴̵̶̷̸̡̢̧̨̛̖̗̘̙̘̙̜̝̞̟̠̣̤̥̦̩̪̫̬̭̮̯̰̱̲̳̹̺̻̼͇͈͉͍͎̀́̂̃̄̅̆̇̈̉̊̋̌̍̎̏̐̑̒̓̔̽̾̿̀́͂̓̈́͆͊͋͌̕̚ͅ͏͓͔͕͖͙͚͐͑͒͗͛ͣͤͥͦͧͨͩͪͫͬͭͮͯ͘͜͟͢͝͞͠͡\s]/iu', '', $cleaned);
        $cleaned = trim($cleaned);
        
        if (!empty($cleaned)) {
            // Add slashes if not present
            if (strpos($cleaned, '/') !== 0 && strpos($cleaned, '[') !== 0) {
                $ipa = '/' . $cleaned . '/';
            } else {
                $ipa = $cleaned;
            }
        }
    }
    
    // Validate IPA is not empty
    if (empty($ipa) || $ipa === '//' || $ipa === '/ /') {
        return ['error' => 'Could not extract valid IPA from response: ' . $ipa_text];
    }
    
    return ['ipa' => $ipa];
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

echo "Fetching words without IPA...\n";
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
    
    // Get IPA from DeepSeek
    $result = getIPAFromDeepSeek($word, $deepseek_api_key, $deepseek_api_url);
    
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

