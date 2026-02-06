<?php
/**
 * API: Get Songs with Lyrics
 * Returns popular songs, all songs, and artists for a category
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
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = 20;
    $offset = ($page - 1) * $limit;
    
    $DB = new Database();
    
    // Base URL for media files
    $baseUrl = 'https://www.calamuseducation.com/uploads/songs';
    
    // Get popular songs (top 20 by like count)
    $popularQuery = "SELECT * FROM songs WHERE type='$category' ORDER BY like_count DESC LIMIT 20";
    $popularResult = $DB->read($popularQuery);
    
    $popularSongs = [];
    if ($popularResult && is_array($popularResult)) {
        foreach ($popularResult as $song) {
            $popularSongs[] = [
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
    
    // Get all songs with pagination
    $songsQuery = "SELECT * FROM songs WHERE type='$category' ORDER BY id DESC LIMIT $limit OFFSET $offset";
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
    
    // Get total count for pagination
    $countQuery = "SELECT COUNT(*) as total FROM songs WHERE type='$category'";
    $countResult = $DB->read($countQuery);
    $totalSongs = $countResult && is_array($countResult) ? (int)$countResult[0]['total'] : 0;
    
    // Get unique artists
    $artistsQuery = "SELECT DISTINCT artist, url FROM songs WHERE type='$category' AND artist IS NOT NULL AND artist != '' GROUP BY artist ORDER BY artist LIMIT 50";
    $artistsResult = $DB->read($artistsQuery);
    
    $artists = [];
    if ($artistsResult && is_array($artistsResult)) {
        foreach ($artistsResult as $artist) {
            $artists[] = [
                'name' => mb_convert_encoding($artist['artist'] ?? '', 'UTF-8', 'UTF-8'),
                'imageUrl' => "$baseUrl/web/{$artist['url']}.png",
            ];
        }
    }
    
    echo json_encode([
        'success' => true,
        'data' => [
            'popularSongs' => $popularSongs,
            'songs' => $songs,
            'artists' => $artists,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $totalSongs,
                'hasMore' => ($offset + $limit) < $totalSongs,
            ],
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
