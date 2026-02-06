<?php
/**
 * API: Get Songs by Artist
 * Returns all songs for a specific artist from database
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

require_once '../../classes/connect.php';

try {
    $category = isset($_GET['category']) ? $_GET['category'] : 'english';
    $artist = isset($_GET['artist']) ? $_GET['artist'] : '';
    
    if (empty($artist)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Artist parameter is required'
        ]);
        exit();
    }
    
    $DB = new Database();
    
    // Base URL for media files
    $baseUrl = 'https://www.calamuseducation.com/uploads/songs';
    
    // Escape artist name for SQL using mysqli
    $conn = mysqli_connect('localhost', 'root', '', 'calamus_db');
    $artistEscaped = mysqli_real_escape_string($conn, $artist);
    $categoryEscaped = mysqli_real_escape_string($conn, $category);
    mysqli_close($conn);
    
    // Get all songs by this artist (ordered by popularity)
    $songsQuery = "SELECT * FROM songs WHERE type='$categoryEscaped' AND artist='$artistEscaped' ORDER BY like_count DESC";
    $songsResult = $DB->read($songsQuery);
    
    $songs = [];
    if ($songsResult && is_array($songsResult)) {
        foreach ($songsResult as $song) {
            $songs[] = [
                'id' => (int)$song['id'],
                'songId' => $song['song_id'],
                'title' => mb_convert_encoding($song['title'] ?? '', 'UTF-8', 'UTF-8'),
                'artist' => mb_convert_encoding($song['artist'] ?? '', 'UTF-8', 'UTF-8'),
                'url' => $song['url'] ?? '',
                'likeCount' => (int)($song['like_count'] ?? 0),
                'downloadCount' => (int)($song['download_count'] ?? 0),
                'audioUrl' => "$baseUrl/audio/{$song['url']}.mp3",
                'imageUrl' => "$baseUrl/web/{$song['url']}.png",
                'thumbnailUrl' => "$baseUrl/image/{$song['url']}.png",
                'lyricsUrl' => "$baseUrl/lyrics/{$song['url']}.txt",
            ];
        }
    }
    
    // Get total count for this artist
    $countQuery = "SELECT COUNT(*) as total FROM songs WHERE type='$categoryEscaped' AND artist='$artistEscaped'";
    $countResult = $DB->read($countQuery);
    $totalSongs = $countResult && is_array($countResult) ? (int)$countResult[0]['total'] : 0;
    
    echo json_encode([
        'success' => true,
        'data' => [
            'songs' => $songs,
            'artist' => $artist,
            'total' => $totalSongs,
            'category' => $category,
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
