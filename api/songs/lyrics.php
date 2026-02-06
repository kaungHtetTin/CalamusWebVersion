<?php
/**
 * API: Get Song Lyrics
 * Returns lyrics for a specific song
 */

// Suppress PHP warnings/notices from breaking JSON output
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $url = isset($_GET['url']) ? $_GET['url'] : '';
    
    if (empty($url)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Missing song url parameter'
        ]);
        exit();
    }
    
    $lyricsUrl = "https://www.calamuseducation.com/uploads/songs/lyrics/{$url}.txt";
    
    // Fetch lyrics from the URL
    $lyrics = @file_get_contents($lyricsUrl);
    
    if ($lyrics === false) {
        echo json_encode([
            'success' => true,
            'data' => [
                'lyrics' => 'Lyrics not available',
                'url' => $url,
            ]
        ]);
        exit();
    }
    
    // Convert to UTF-8 and format
    $lyrics = mb_convert_encoding($lyrics, 'UTF-8', 'UTF-8');
    
    echo json_encode([
        'success' => true,
        'data' => [
            'lyrics' => $lyrics,
            'url' => $url,
        ]
    ], JSON_INVALID_UTF8_SUBSTITUTE);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Server error: ' . $e->getMessage()
    ]);
}
?>
