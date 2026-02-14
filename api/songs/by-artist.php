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
    $resolveLiked = ($userIdEscaped !== '');
    $userLikedSongIds = [];

    $baseUrl = 'https://www.calamuseducation.com/uploads/songs';

    $songsQuery = "SELECT * FROM songs WHERE type='$categoryEscaped' AND artist='$artistEscaped' ORDER BY like_count DESC";
    $songsResult = $DB->read($songsQuery);

    if ($resolveLiked && $songsResult && is_array($songsResult) && count($songsResult) > 0) {
        $allSongIds = array_unique(array_map(function ($s) { return (int)$s['id']; }, $songsResult));
        $idsList = implode(',', $allSongIds);
        $mylikesRows = $DB->read("SELECT content_id, likes FROM mylikes WHERE content_id IN ($idsList)");
        if ($mylikesRows && is_array($mylikesRows)) {
            foreach ($mylikesRows as $mr) {
                $decoded = json_decode($mr['likes'], true);
                if ($decoded && is_array($decoded)) {
                    $userIds = array_column($decoded, 'user_id');
                    if (in_array($userId, $userIds)) {
                        $userLikedSongIds[(int)$mr['content_id']] = true;
                    }
                }
            }
        }
    }

    $formatSong = function($song) use ($baseUrl, $userLikedSongIds, $resolveLiked) {
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
        if ($resolveLiked) {
            $row['liked'] = isset($userLikedSongIds[(int)$song['id']]);
        }
        return $row;
    };

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
