<?php
/**
 * API: Get Songs by Artist
 * Returns all songs for a specific artist from database
 */

require_once __DIR__ . '/../bootstrap.php';

// Suppress PHP warnings/notices from breaking JSON output
error_reporting(0);
ini_set('display_errors', 0);
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
    $conn = $DB->connect();
    $artistEscaped = mysqli_real_escape_string($conn, $artist);
    $categoryEscaped = mysqli_real_escape_string($conn, $category);
    $userId = isset($_GET['userId']) ? trim($_GET['userId']) : '';
    $userIdEscaped = $userId !== '' ? mysqli_real_escape_string($conn, $userId) : '';
    $likeJoin = '';
    $likeSelect = '';
    if ($userIdEscaped !== '') {
        $likeJoin = " LEFT JOIN song_likes sl ON sl.song_id = s.id AND sl.user_id = '$userIdEscaped' ";
        $likeSelect = ", (sl.id IS NOT NULL) as user_liked ";
    }
    
    $baseUrl = 'https://www.calamuseducation.com/uploads/songs';
    $formatSong = function($song) use ($baseUrl) {
        $row = [
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
        if (isset($song['user_liked'])) {
            $row['liked'] = (bool)$song['user_liked'];
        }
        return $row;
    };
    
    $songsQuery = "SELECT s.* $likeSelect FROM songs s $likeJoin WHERE s.type='$categoryEscaped' AND s.artist='$artistEscaped' ORDER BY s.like_count DESC";
    $songsResult = @$DB->read($songsQuery);
    if ($songsResult === false && $userIdEscaped !== '') {
        $songsResult = $DB->read("SELECT * FROM songs WHERE type='$categoryEscaped' AND artist='$artistEscaped' ORDER BY like_count DESC");
    }
    
    $songs = [];
    if ($songsResult && is_array($songsResult)) {
        foreach ($songsResult as $song) {
            $songs[] = $formatSong($song);
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
